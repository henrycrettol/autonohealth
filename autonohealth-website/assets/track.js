/* ==========================================================================
   track.js — AutonoHealth daily tracker (UI layer)
   --------------------------------------------------------------------------
   One card, one list, one job: log today, and see whether you're keeping it up.

   Everything you can log — mood, sleep, exercise, notes, anything you add — is
   the same kind of thing: a row with a value. Nothing is "submitted": touching
   a control logs it, and saving happens on its own.

   Firebase, the data model, and the storage adapters now live in
   assets/firebase.js, because Otto needs the same session and the same data.
   YOUR FIREBASE CONFIG GOES THERE, NOT HERE.

   Deliberately avoids every ID and data attribute that assets/app.js binds to,
   so app.js's old tracker block finds nothing and stays inert.
   ========================================================================== */

import {
  $,
  $$,
  ALLOWED_TYPES,
  BUILT_IN,
  BUILT_IN_IDS,
  MAX_CUSTOM,
  MOOD_GLYPHS,
  MOOD_LABELS,
  RANGE_DAYS,
  TODAY,
  auth,
  cloudStore,
  debounce,
  emptyEntry,
  emptyTemplate,
  entryHasData,
  escapeHtml,
  getRedirectResult,
  isLogged,
  localStore,
  longDate,
  onAuthStateChanged,
  provider,
  relativeDay,
  shiftKey,
  shortDate,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "./firebase.js";

/* ==========================================================================
   5. State
   ========================================================================== */

let store = localStore;
let currentUser = null;
let currentKey = TODAY;
let template = emptyTemplate();
let entry = emptyEntry(TODAY);
let history = new Map();
let openDrawerId = null;
let ready = false;

const ui = {
  list: $("#th-list"),
  prev: $("#th-prev"),
  next: $("#th-next"),
  dateLabel: $("#th-date-label"),
  dateRelative: $("#th-date-relative"),
  back: $("#th-back"),
  bar: $("#th-bar"),
  barFill: $("#th-bar-fill"),
  count: $("#th-count"),
  status: $("#th-status"),
  statusText: $("#th-status-text"),
  clearDay: $("#th-clear-day"),
  account: $("#th-account-button"),
  accountLabel: $("#th-account-label"),
  accountFace: $("#th-account-face"),
  popover: $("#th-popover"),
  popSignedOut: $("#th-pop-signed-out"),
  popSignedIn: $("#th-pop-signed-in"),
  popAvatar: $("#th-pop-avatar"),
  popName: $("#th-pop-name"),
  popEmail: $("#th-pop-email"),
  signIn: $("#th-signin"),
  signOut: $("#th-signout"),
  addToggle: $("#th-add-toggle"),
  addForm: $("#th-add-form"),
  addGrid: $("#th-add-grid"),
  addName: $("#th-add-name"),
  addType: $("#th-add-type"),
  addUnit: $("#th-add-unit"),
  addUnitField: $("#th-add-unit-field"),
  addFeedback: $("#th-add-feedback"),
  ribbon: $("#th-ribbon"),
  stats: $("#th-stats"),
};

function setStatus(state, text) {
  if (!ui.status) return;
  ui.status.dataset.state = state;
  if (ui.statusText) ui.statusText.textContent = text;
}

function toast(message) {
  const node = $("#site-toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 2800);
}

const itemsById = () =>
  new Map([...BUILT_IN.map((item) => [item.id, item]), ...template.custom.map((item) => [item.id, item])]);

function activeItems() {
  const lookup = itemsById();
  return template.order.map((id) => lookup.get(id)).filter((item) => item && !template.hidden.includes(item.id));
}

/* ==========================================================================
   6. Rendering the list
   ========================================================================== */

function inputFor(item, value) {
  const id = `th-field-${item.id}`;

  if (item.type === "scale5") {
    return `<div class="th-scale" role="group" aria-label="${escapeHtml(item.label)}">
      ${[1, 2, 3, 4, 5]
        .map(
          (level) => `<button class="th-dot" type="button" data-th-set="${item.id}" data-th-value="${level}"
            aria-pressed="${String(value) === String(level)}" aria-label="${MOOD_LABELS[level]}"
            title="${MOOD_LABELS[level]}">${MOOD_GLYPHS[level]}</button>`,
        )
        .join("")}
    </div>`;
  }

  if (item.type === "hours") {
    return `<div class="th-slider">
      <label class="sr-only" for="${id}">${escapeHtml(item.label)} in hours</label>
      <input id="${id}" type="range" min="3" max="11" step="0.5" value="${escapeHtml(value || "7.5")}" data-th-field="${item.id}">
      <span class="th-readout" data-th-readout="${item.id}">${value ? `${escapeHtml(value)} hr` : "Not set"}</span>
    </div>`;
  }

  if (item.type === "yesno") {
    return `<label class="sr-only" for="${id}">${escapeHtml(item.label)}</label>
      <select id="${id}" data-th-field="${item.id}">
        <option value="">—</option>
        <option value="yes"${value === "yes" ? " selected" : ""}>Yes</option>
        <option value="no"${value === "no" ? " selected" : ""}>No</option>
      </select>`;
  }

  if (item.type === "number") {
    return `<label class="sr-only" for="${id}">${escapeHtml(item.label)}${item.unit ? ` in ${escapeHtml(item.unit)}` : ""}</label>
      <input id="${id}" type="number" min="0" step="any" inputmode="decimal" placeholder="0"
        value="${escapeHtml(value)}" data-th-field="${item.id}">
      ${item.unit ? `<span class="th-unit">${escapeHtml(item.unit)}</span>` : ""}`;
  }

  return `<label class="sr-only" for="${id}">${escapeHtml(item.label)}</label>
    <input id="${id}" type="text" maxlength="180" placeholder="Add a note"
      value="${escapeHtml(value)}" data-th-field="${item.id}">`;
}

function renderList() {
  if (!ui.list) return;
  const items = activeItems();

  if (!items.length) {
    ui.list.innerHTML = `<div class="th-blank">Nothing is being tracked yet. Add something below to get started.</div>`;
    return;
  }

  ui.list.innerHTML = items
    .map((item) => {
      const value = entry.values[item.id] || "";
      const logged = Boolean(value.trim());
      return `
      <div class="th-item" data-th-item="${item.id}" data-logged="${logged}">
        <div class="th-row">
          <span class="th-glyph" aria-hidden="true">${escapeHtml(item.glyph)}</span>
          <div class="th-name">${escapeHtml(item.label)}${item.hint ? `<small>${escapeHtml(item.hint)}</small>` : ""}</div>
          <div class="th-input">${inputFor(item, value)}</div>
          <div class="th-tail">
            <span class="th-mark" role="img" aria-label="${escapeHtml(item.label)} ${logged ? "logged" : "not logged"}"></span>
            <button class="th-expand" type="button" data-th-toggle="${item.id}"
              aria-expanded="${openDrawerId === item.id}" aria-controls="th-drawer-${item.id}"
              aria-label="Show ${escapeHtml(item.label)} history and options">▾</button>
          </div>
        </div>
        <div class="th-drawer" id="th-drawer-${item.id}" ${openDrawerId === item.id ? "" : "hidden"}></div>
      </div>`;
    })
    .join("");

  if (openDrawerId) renderDrawer(openDrawerId);
}

/* --- The drawer: 30 days of this one thing, plus its controls -------------- */

function seriesFor(id) {
  return Array.from({ length: RANGE_DAYS }, (unused, index) => {
    const key = shiftKey(TODAY, -(RANGE_DAYS - 1 - index));
    const dayEntry = key === currentKey ? entry : history.get(key);
    return { key, value: (dayEntry?.values?.[id] || "").trim() };
  });
}

function sparkline(item) {
  const series = seriesFor(item.id);

  if (item.type === "text") {
    const notes = series.filter((point) => point.value).slice(-6).reverse();
    if (!notes.length) return `<p class="th-feedback">No notes in the last 30 days.</p>`;
    return `<ul class="th-notes">${notes
      .map((point) => `<li><time>${escapeHtml(shortDate(point.key))}</time><span>${escapeHtml(point.value)}</span></li>`)
      .join("")}</ul>`;
  }

  if (item.type === "yesno") {
    return `<div class="th-spark" role="img" aria-label="Last 30 days">${series
      .map(
        (point) =>
          `<span style="--h:${point.value ? "100%" : "0"}" data-value="${escapeHtml(point.value)}"
            data-empty="${!point.value}" title="${escapeHtml(shortDate(point.key))}: ${point.value || "no entry"}"></span>`,
      )
      .join("")}</div>`;
  }

  const numbers = series.map((point) => Number(point.value)).filter(Number.isFinite);
  const ceiling = item.type === "scale5" ? 5 : Math.max(...numbers, item.type === "hours" ? 9 : 1);
  return `<div class="th-spark" role="img" aria-label="Last 30 days">${series
    .map((point) => {
      const number = Number(point.value);
      const has = point.value !== "" && Number.isFinite(number);
      const height = has ? Math.max(8, Math.round((number / ceiling) * 100)) : 0;
      return `<span style="--h:${height}%" data-empty="${!has}" data-today="${point.key === currentKey}"
        title="${escapeHtml(shortDate(point.key))}: ${has ? escapeHtml(point.value) : "no entry"}"></span>`;
    })
    .join("")}</div>`;
}

function summaryFor(item) {
  const series = seriesFor(item.id).filter((point) => point.value);
  if (!series.length) return "No entries yet";

  if (item.type === "text") return `${series.length} of the last 30 days have a note`;
  if (item.type === "yesno") {
    const yes = series.filter((point) => point.value === "yes").length;
    return `${yes} yes / ${series.length - yes} no across ${series.length} days`;
  }
  const numbers = series.map((point) => Number(point.value)).filter(Number.isFinite);
  const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  if (item.type === "scale5") return `Averaging ${average.toFixed(1)} of 5 across ${numbers.length} days`;
  return `Averaging ${average.toFixed(1)}${item.unit ? ` ${item.unit}` : ""} across ${numbers.length} days`;
}

function renderDrawer(id) {
  const drawer = $(`#th-drawer-${CSS.escape(id)}`);
  const item = itemsById().get(id);
  if (!drawer || !item) return;

  const order = activeItems().map((entryItem) => entryItem.id);
  const index = order.indexOf(id);
  const isCustom = !BUILT_IN_IDS.includes(id);

  drawer.innerHTML = `
    <div class="th-drawer-title"><span>Last 30 days</span><b>${escapeHtml(summaryFor(item))}</b></div>
    ${sparkline(item)}
    <div class="th-drawer-actions">
      <button class="th-mini" type="button" data-th-move="up" data-th-target="${id}" ${index <= 0 ? "disabled" : ""}>Move up</button>
      <button class="th-mini" type="button" data-th-move="down" data-th-target="${id}" ${index >= order.length - 1 ? "disabled" : ""}>Move down</button>
      <button class="th-mini th-danger" type="button" data-th-hide="${id}">${isCustom ? "Delete this item" : "Stop tracking this"}</button>
    </div>`;
}

/* --- Header, progress, overview ------------------------------------------- */

function renderHeader() {
  if (ui.dateLabel) ui.dateLabel.textContent = longDate(currentKey);
  if (ui.dateRelative) ui.dateRelative.textContent = relativeDay(currentKey);
  if (ui.next) ui.next.disabled = currentKey >= TODAY;
  if (ui.back) ui.back.hidden = currentKey === TODAY;
}

function renderProgress() {
  const items = activeItems();
  const done = items.filter((item) => isLogged(entry, item.id)).length;
  const total = items.length;
  const percentage = total ? Math.round((done / total) * 100) : 0;

  if (ui.barFill) ui.barFill.style.setProperty("--fill", `${percentage}%`);
  if (ui.bar) ui.bar.dataset.complete = String(total > 0 && done === total);
  if (ui.count) ui.count.textContent = total ? `${done} of ${total} logged` : "Nothing tracked yet";
}

const tierFor = (percentage) =>
  percentage <= 0 ? 0 : percentage < 34 ? 1 : percentage < 67 ? 2 : percentage < 100 ? 3 : 4;

function renderOverview() {
  const total = activeItems().length || 1;
  const ids = activeItems().map((item) => item.id);

  if (ui.ribbon) {
    ui.ribbon.innerHTML = Array.from({ length: RANGE_DAYS }, (unused, index) => {
      const key = shiftKey(TODAY, -(RANGE_DAYS - 1 - index));
      const dayEntry = key === currentKey ? entry : history.get(key);
      const done = dayEntry ? ids.filter((id) => isLogged(dayEntry, id)).length : 0;
      const percentage = Math.round((done / total) * 100);
      return `<button class="th-cell" type="button" data-th-day="${key}" data-tier="${tierFor(percentage)}"
        data-current="${key === currentKey}" title="${escapeHtml(longDate(key))} — ${done} of ${total}"
        aria-label="${escapeHtml(longDate(key))}, ${done} of ${total} logged"></button>`;
    }).join("");
  }

  if (!ui.stats) return;
  const merged = new Map(history);
  if (entryHasData(entry)) merged.set(currentKey, entry);
  const logged = [...merged.values()].filter(entryHasData);

  const sleepValues = logged.map((item) => Number(item.values.sleep)).filter(Number.isFinite);
  const averageSleep = sleepValues.length
    ? (sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length).toFixed(1)
    : null;

  const averageDone = logged.length
    ? Math.round(
        (logged.reduce((sum, item) => sum + ids.filter((id) => isLogged(item, id)).length, 0) / logged.length) * 10,
      ) / 10
    : 0;

  ui.stats.innerHTML = `
    <div class="th-stat"><strong>${logged.length}<span>/${RANGE_DAYS}</span></strong><small>Days you checked in</small></div>
    <div class="th-stat"><strong>${averageSleep ?? "—"}${averageSleep ? "<span> hr</span>" : ""}</strong><small>Average logged sleep</small></div>
    <div class="th-stat"><strong>${averageDone}<span>/${total}</span></strong><small>Average things logged per day</small></div>`;
}

function renderAll() {
  renderHeader();
  renderList();
  renderProgress();
  renderOverview();
}

/* ==========================================================================
   7. Saving
   ========================================================================== */

const saveSoon = debounce(async () => {
  if (!ready) return;
  const key = currentKey;
  const snapshot = { date: key, values: { ...entry.values } };
  history.set(key, snapshot);

  if (store.mode === "local") {
    await store.saveEntry(key, snapshot);
    setStatus("idle", "Saved on this device only");
    return;
  }
  try {
    setStatus("saving", "Saving…");
    await store.saveEntry(key, snapshot);
    setStatus("saved", "Saved to your account");
  } catch (error) {
    console.error("Save failed:", error);
    setStatus("error", "Not saved — will retry");
  }
}, 650);

async function saveTemplate() {
  try {
    await store.saveTemplate(template);
  } catch (error) {
    console.error("Template save failed:", error);
    toast("Your changes to the list could not be saved.");
  }
}

/** Update one value without re-rendering the list, so focus is never lost. */
function setValue(id, rawValue) {
  const value = String(rawValue).slice(0, 180);
  if (value.trim() === "") delete entry.values[id];
  else entry.values[id] = value;

  const row = $(`[data-th-item="${CSS.escape(id)}"]`);
  if (row) {
    const logged = isLogged(entry, id);
    row.dataset.logged = String(logged);
    const item = itemsById().get(id);
    $(".th-mark", row)?.setAttribute("aria-label", `${item?.label || id} ${logged ? "logged" : "not logged"}`);
  }

  renderProgress();
  renderOverview();
  if (openDrawerId) renderDrawer(openDrawerId);
  saveSoon();
}

/* ==========================================================================
   8. Navigation and interaction
   ========================================================================== */

async function openDay(key) {
  if (key > TODAY || key === currentKey) return;
  saveSoon.flush();
  currentKey = key;
  entry = history.get(key) || (await store.loadEntry(key));
  history.set(key, entry);
  renderAll();
}

ui.prev?.addEventListener("click", () => openDay(shiftKey(currentKey, -1)));
ui.next?.addEventListener("click", () => openDay(shiftKey(currentKey, 1)));
ui.back?.addEventListener("click", () => openDay(TODAY));
ui.ribbon?.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-th-day]");
  if (cell) openDay(cell.dataset.thDay);
});

/* Arrow keys step between days, but never while typing. */
document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
  if (event.key === "ArrowLeft") openDay(shiftKey(currentKey, -1));
  if (event.key === "ArrowRight") openDay(shiftKey(currentKey, 1));
});

ui.list?.addEventListener("input", (event) => {
  const id = event.target.dataset?.thField;
  if (!id) return;
  setValue(id, event.target.value);
  const readout = $(`[data-th-readout="${CSS.escape(id)}"]`);
  if (readout) readout.textContent = event.target.value ? `${event.target.value} hr` : "Not set";
});

ui.list?.addEventListener("click", async (event) => {
  /* Mood dots — clicking the active one clears it. */
  const dot = event.target.closest("[data-th-set]");
  if (dot) {
    const id = dot.dataset.thSet;
    const next = entry.values[id] === dot.dataset.thValue ? "" : dot.dataset.thValue;
    setValue(id, next);
    $$(`[data-th-set="${CSS.escape(id)}"]`).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.thValue === next));
    });
    return;
  }

  const toggle = event.target.closest("[data-th-toggle]");
  if (toggle) {
    const id = toggle.dataset.thToggle;
    openDrawerId = openDrawerId === id ? null : id;
    $$("[data-th-toggle]").forEach((button) => {
      const open = button.dataset.thToggle === openDrawerId;
      button.setAttribute("aria-expanded", String(open));
      const drawer = $(`#th-drawer-${CSS.escape(button.dataset.thToggle)}`);
      if (drawer) drawer.hidden = !open;
    });
    if (openDrawerId) renderDrawer(openDrawerId);
    return;
  }

  const move = event.target.closest("[data-th-move]");
  if (move) {
    const order = activeItems().map((item) => item.id);
    const id = move.dataset.thTarget;
    const from = order.indexOf(id);
    const to = move.dataset.thMove === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= order.length) return;
    [order[from], order[to]] = [order[to], order[from]];
    template.order = [...order, ...template.order.filter((candidate) => !order.includes(candidate))];
    renderList();
    renderOverview();
    $(`[data-th-move="${move.dataset.thMove}"][data-th-target="${id}"]`)?.focus();
    await saveTemplate();
    return;
  }

  const hide = event.target.closest("[data-th-hide]");
  if (!hide) return;
  const id = hide.dataset.thHide;
  const item = itemsById().get(id);
  const isCustom = !BUILT_IN_IDS.includes(id);

  if (isCustom && !window.confirm(`Delete "${item?.label}"? Past entries for it stay in your history.`)) return;

  delete entry.values[id];
  if (isCustom) {
    template.custom = template.custom.filter((candidate) => candidate.id !== id);
    template.order = template.order.filter((candidate) => candidate !== id);
  } else if (!template.hidden.includes(id)) {
    template.hidden.push(id);
  }
  openDrawerId = null;
  renderAll();
  toast(`${item?.label || "Item"} was removed from your list.`);
  await saveTemplate();
  saveSoon();
});

ui.clearDay?.addEventListener("click", async () => {
  if (!entryHasData(entry)) return;
  if (!window.confirm(`Clear everything logged for ${longDate(currentKey)}?`)) return;
  entry = emptyEntry(currentKey);
  history.set(currentKey, entry);
  renderAll();
  try {
    await store.saveEntry(currentKey, entry);
    toast(`${longDate(currentKey)} was cleared.`);
  } catch (error) {
    console.error("Clear failed:", error);
    toast("That day could not be cleared.");
  }
});

/* --- Adding something new -------------------------------------------------- */

function updateUnitField() {
  const showUnit = ui.addType?.value === "number";
  if (ui.addUnitField) ui.addUnitField.hidden = !showUnit;
  ui.addGrid?.classList.toggle("has-unit", showUnit);
  if (!showUnit && ui.addUnit) ui.addUnit.value = "";
}

ui.addToggle?.addEventListener("click", () => {
  const open = ui.addForm?.hidden;
  if (ui.addForm) ui.addForm.hidden = !open;
  ui.addToggle.setAttribute("aria-expanded", String(Boolean(open)));
  if (open) ui.addName?.focus();
});

ui.addType?.addEventListener("change", updateUnitField);
updateUnitField();

ui.addForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const label = (ui.addName?.value || "").trim().replace(/\s+/g, " ");
  const type = ui.addType?.value || "";
  const unit = type === "number" ? (ui.addUnit?.value || "").trim().slice(0, 16) : "";
  if (!label || !ALLOWED_TYPES.has(type)) return;

  if (template.custom.length >= MAX_CUSTOM) {
    if (ui.addFeedback) ui.addFeedback.textContent = `You can track up to ${MAX_CUSTOM} of your own items.`;
    return;
  }
  const clash = [...BUILT_IN, ...template.custom].some(
    (item) => item.label.toLowerCase() === label.toLowerCase(),
  );
  if (clash) {
    if (ui.addFeedback) ui.addFeedback.textContent = "Something with that name is already on your list.";
    ui.addName?.focus();
    return;
  }

  let id = `custom-${Date.now().toString(36)}`;
  while (template.custom.some((item) => item.id === id)) id += "-1";

  template.custom.push({ id, label: label.slice(0, 60), hint: "", glyph: "+", type, unit });
  template.order.push(id);
  renderAll();
  ui.addForm.reset();
  updateUnitField();
  if (ui.addFeedback) ui.addFeedback.textContent = `${label} is now on your list.`;
  $(`#th-field-${id}`)?.focus();
  await saveTemplate();
});

/* ==========================================================================
   9. Account popover
   ========================================================================== */

function closePopover() {
  if (ui.popover) ui.popover.hidden = true;
  ui.account?.setAttribute("aria-expanded", "false");
}

ui.account?.addEventListener("click", () => {
  const open = ui.popover?.hidden;
  if (ui.popover) ui.popover.hidden = !open;
  ui.account.setAttribute("aria-expanded", String(Boolean(open)));
});

document.addEventListener("click", (event) => {
  if (ui.popover?.hidden) return;
  if (!event.target.closest("#th-popover") && !event.target.closest("#th-account-button")) closePopover();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePopover();
});

/* ==========================================================================
   10. Export, summary, deletion
   ========================================================================== */

const labelFor = (id) => itemsById().get(id)?.label || id;

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportJson() {
  const entries = await store.loadAll();
  download(
    `autonohealth-${TODAY}.json`,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        account: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
        tracking: activeItems(),
        entries: [...entries.values()].sort((a, b) => a.date.localeCompare(b.date)),
      },
      null,
      2,
    ),
    "application/json",
  );
  toast("Downloaded as JSON.");
}

async function exportCsv() {
  const entries = [...(await store.loadAll()).values()].sort((a, b) => a.date.localeCompare(b.date));
  const ids = [...BUILT_IN_IDS, ...template.custom.map((item) => item.id)];
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = entries.map((item) => [item.date, ...ids.map((id) => item.values[id] || "")].map(cell).join(","));
  download(
    `autonohealth-${TODAY}.csv`,
    [["date", ...ids.map(labelFor)].map(cell).join(","), ...rows].join("\n"),
    "text/csv",
  );
  toast("Downloaded as CSV.");
}

/** A short recap somebody can paste into notes before an appointment. */
async function copyVisitSummary() {
  const days = 14;
  const cutoff = shiftKey(TODAY, -(days - 1));
  const entries = [...(await store.loadAll(cutoff)).values()]
    .filter(entryHasData)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!entries.length) {
    toast("Nothing logged in the last two weeks yet.");
    return;
  }

  const average = (values) => (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  const numbersFor = (id) => entries.map((item) => Number(item.values[id])).filter(Number.isFinite);

  const lines = [`AutonoHealth tracking summary — ${cutoff} to ${TODAY}`, `Checked in on ${entries.length} of the last ${days} days`, ""];

  activeItems().forEach((item) => {
    const values = entries.map((day) => (day.values[item.id] || "").trim()).filter(Boolean);
    if (!values.length) return;

    if (item.type === "text") {
      lines.push(`${item.label}:`);
      entries
        .filter((day) => (day.values[item.id] || "").trim())
        .forEach((day) => lines.push(`  ${day.date}: ${day.values[item.id].trim()}`));
      lines.push("");
      return;
    }
    if (item.type === "yesno") {
      const yes = values.filter((value) => value === "yes").length;
      lines.push(`${item.label}: yes on ${yes} of ${values.length} logged days`);
      return;
    }
    const numbers = numbersFor(item.id);
    if (!numbers.length) return;
    const suffix = item.type === "scale5" ? " of 5" : item.unit ? ` ${item.unit}` : "";
    lines.push(
      `${item.label}: average ${average(numbers)}${suffix} across ${numbers.length} days (range ${Math.min(...numbers)}–${Math.max(...numbers)})`,
    );
  });

  lines.push("", "Self-reported data from a personal tracker. Not a clinical record.");
  const text = lines.join("\n");

  try {
    await navigator.clipboard.writeText(text);
    toast("Summary copied — paste it into your notes.");
  } catch {
    download(`autonohealth-summary-${TODAY}.txt`, text, "text/plain");
    toast("Summary downloaded as a text file.");
  }
}

async function deleteEverything() {
  const scope = currentUser ? "your account" : "this browser";
  if (!window.confirm(`Delete every entry stored in ${scope}? This cannot be undone.`)) return;
  if (window.prompt("Type DELETE to confirm.") !== "DELETE") {
    toast("Nothing was deleted.");
    return;
  }
  try {
    await store.deleteAll();
    template = emptyTemplate();
    history = new Map();
    entry = emptyEntry(currentKey);
    openDrawerId = null;
    renderAll();
    toast("Everything was deleted.");
  } catch (error) {
    console.error("Delete failed:", error);
    toast("Your data could not be deleted. Try again.");
  }
}

$("#th-summary")?.addEventListener("click", () => { closePopover(); copyVisitSummary(); });
$("#th-csv")?.addEventListener("click", () => { closePopover(); exportCsv(); });
$("#th-json")?.addEventListener("click", () => { closePopover(); exportJson(); });
$("#th-delete")?.addEventListener("click", () => { closePopover(); deleteEverything(); });
ui.signOut?.addEventListener("click", () => { closePopover(); signOut(auth); });

/* ==========================================================================
   11. Authentication
   ========================================================================== */

ui.signIn?.addEventListener("click", async () => {
  ui.signIn.disabled = true;
  try {
    await signInWithPopup(auth, provider);
    closePopover();
  } catch (error) {
    console.error("Sign-in failed:", error);
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
    if (!["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(error.code)) {
      toast("Sign-in did not finish. Check your connection and try again.");
    }
  } finally {
    ui.signIn.disabled = false;
  }
});

getRedirectResult(auth).catch((error) => console.error("Redirect sign-in failed:", error));

/** Offer to carry anything already logged on this device up into the account. */
async function migrateLocalData(target) {
  const local = await localStore.loadAll();
  if (!local.size) return 0;
  if (!window.confirm(`Add the ${local.size} day(s) already logged on this device to your account?`)) return 0;

  let moved = 0;
  for (const [key, localEntry] of local) {
    try {
      const existing = await target.loadEntry(key);
      if (entryHasData(existing)) continue; /* Never overwrite what's already in the cloud. */
      await target.saveEntry(key, localEntry);
      moved += 1;
    } catch (error) {
      console.error("Migration failed for", key, error);
    }
  }
  const localTemplate = await localStore.loadTemplate();
  if (localTemplate.custom.length) {
    const existing = await target.loadTemplate();
    if (!existing.custom.length) await target.saveTemplate(localTemplate);
  }
  await localStore.deleteAll();
  return moved;
}

const ICON_SYNC = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 13v8"/><path d="m8 17 4-4 4 4"/><path d="M20.9 15.5A5 5 0 0 0 18 6.5h-1.3A8 8 0 1 0 4 14.9"/></svg>`;

function paintAccount(user) {
  const signedIn = Boolean(user);
  if (ui.popSignedOut) ui.popSignedOut.hidden = signedIn;
  if (ui.popSignedIn) ui.popSignedIn.hidden = !signedIn;
  if (ui.signOut) ui.signOut.hidden = !signedIn;

  /* Drives the whole visual difference between the two states, in CSS. */
  ui.account?.setAttribute("data-state", signedIn ? "in" : "out");

  if (!signedIn) {
    if (ui.accountLabel) ui.accountLabel.textContent = "Sign in to sync";
    if (ui.accountFace) ui.accountFace.innerHTML = ICON_SYNC;
    ui.account?.setAttribute("aria-label", "Sign in to sync your history, and data options");
    return;
  }

  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();
  if (ui.accountLabel) ui.accountLabel.textContent = (user.displayName || "").split(" ")[0] || "Account";
  if (ui.accountFace) {
    ui.accountFace.innerHTML = user.photoURL
      ? `<img src="${escapeHtml(user.photoURL)}" alt="" referrerpolicy="no-referrer">`
      : escapeHtml(initial);
  }
  ui.account?.setAttribute("aria-label", "Your account and data options");

  if (ui.popAvatar) {
    ui.popAvatar.src = user.photoURL || "assets/otto-hello.png";
    ui.popAvatar.referrerPolicy = "no-referrer";
  }
  if (ui.popName) ui.popName.textContent = user.displayName || "Signed in";
  if (ui.popEmail) ui.popEmail.textContent = user.email || "";
}

async function loadEverything() {
  ready = false;
  ui.list?.setAttribute("aria-busy", "true");
  try {
    template = await store.loadTemplate();
    history = await store.loadAll(shiftKey(TODAY, -(RANGE_DAYS - 1)));
    entry = history.get(currentKey) || (await store.loadEntry(currentKey));
    history.set(currentKey, entry);
    setStatus(store.mode === "cloud" ? "saved" : "idle", store.mode === "cloud" ? "Synced to your account" : "Saved on this device only");
  } catch (error) {
    console.error("Load failed:", error);
    template = emptyTemplate();
    history = new Map();
    entry = emptyEntry(currentKey);
    setStatus("error", "Could not load your data");
  }
  ready = true;
  ui.list?.removeAttribute("aria-busy");
  renderAll();
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;
  paintAccount(currentUser);

  if (user) {
    const target = cloudStore(user.uid);
    setStatus("saving", "Connecting…");
    const moved = await migrateLocalData(target).catch(() => 0);
    store = target;
    await loadEverything();
    if (moved) toast(`${moved} day(s) from this device were added to your account.`);
  } else {
    store = localStore;
    await loadEverything();
  }
});

/* Don't lose a half-typed value if the tab goes away mid-edit. */
window.addEventListener("beforeunload", () => saveSoon.flush());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveSoon.flush();
});
