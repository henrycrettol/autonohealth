/* ==========================================================================
   otto.js — Otto, the AutonoHealth guide
   --------------------------------------------------------------------------
   Replaces the keyword-matching stub that used to live in app.js. Otto now
   uses a server-side model proxy, knows what's actually on this site, and — only if a
   signed-in person explicitly says yes — can read their tracked data and
   answer questions about their own patterns.

   Loaded once, from app.js, so all eight pages get it without editing any of
   their HTML. Every element Otto needs beyond the existing chat panel is
   created here at runtime for the same reason.

   Two things are deliberately NOT left to the model:
     1. The crisis check. It runs locally, before any network call, so the
        response can't depend on a model that might be slow, wrong, or down.
     2. What gets sent. The personal context is assembled here, shown to the
        person verbatim on request, and never sent without consent.
   ========================================================================== */

import {
  $,
  $$,
  auth,
  onAuthStateChanged,
  cloudStore,
  escapeHtml,
  shiftKey,
  shortDate,
  entryHasData,
  getAppCheckToken,
  BUILT_IN,
  TODAY,
} from "./firebase.js";

/* ==========================================================================
   1. Configuration
   --------------------------------------------------------------------------
   The only supported path is the same-origin server proxy.
   ========================================================================== */

/* Firebase Hosting rewrites /api/chat to the askOtto Cloud Function, which
holds the OpenAI key server-side. Same-origin, so no CORS and nothing to
change between localhost and production — this one value works in both. */
const OTTO_ENDPOINT = "/api/chat";
const MAX_TURNS = 12; /* Conversation turns kept in context. */

/* Fires locally, before any network call. */
const CRISIS_PATTERN =
  /chest pain|can'?t breathe|cannot breathe|trouble breathing|stroke|suicid|kill myself|end my life|overdose|unconscious|not breathing|severe bleeding|anaphyla/i;

const CRISIS_REPLY =
  "That may need urgent attention rather than a website. Please contact emergency services now — 911 in the US, or your local emergency number. " +
  "If this is about suicide or self-harm and you're in the US, you can call or text 988 to reach the Suicide & Crisis Lifeline; elsewhere, your local crisis line can help. " +
  "I'll be here afterwards if you want to look something up.";

const NOT_CONFIGURED =
  "I'm not connected to my language model yet. Whoever set this site up needs to add an OTTO_ENDPOINT in assets/otto.js — until then I can't answer questions.";

/* ==========================================================================
   3. Personal context — assembled here, shown on request, sent only on consent
   ========================================================================== */

const CONSENT_KEY = "autonohealth-otto-personal";
const PERSONAL_DAYS = 14;

let store = null; /* cloudStore once signed in, otherwise null. */
let signedIn = false;
let consent = localStorage.getItem(CONSENT_KEY) === "on";
let consentAsked = false;

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Builds the plain-text block appended to the prompt. Returns "" if nothing. */
async function personalContext() {
  if (!signedIn || !consent || !store) return "";

  let template;
  let entries;
  try {
    template = await store.loadTemplate();
    entries = [...(await store.loadAll(shiftKey(TODAY, -(PERSONAL_DAYS - 1)))).values()]
      .filter(entryHasData)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Otto could not read tracked data:", error);
    return "";
  }
  if (!entries.length) return "";

  const items = [...BUILT_IN, ...template.custom].filter((item) => !template.hidden.includes(item.id));
  const lines = [
    `THE PERSON'S OWN TRACKED DATA (last ${PERSONAL_DAYS} days, ending ${TODAY}).`,
    `They checked in on ${entries.length} of the last ${PERSONAL_DAYS} days.`,
  ];

  items.forEach((item) => {
    const values = entries.map((day) => (day.values[item.id] || "").trim()).filter(Boolean);
    if (!values.length) return;

    if (item.type === "text") {
      const notes = entries
        .filter((day) => (day.values[item.id] || "").trim())
        .map((day) => `${day.date}: ${day.values[item.id].trim()}`);
      lines.push(`${item.label} — ${notes.join(" | ")}`);
      return;
    }
    if (item.type === "yesno") {
      const yes = values.filter((value) => value === "yes").length;
      lines.push(`${item.label} — yes on ${yes} of ${values.length} logged days`);
      return;
    }
    const numbers = values.map(Number).filter(Number.isFinite);
    if (!numbers.length) return;
    const unit = item.type === "scale5" ? " out of 5" : item.unit ? ` ${item.unit}` : "";
    const daily = entries
      .filter((day) => (day.values[item.id] || "").trim())
      .map((day) => `${shortDate(day.date)} ${day.values[item.id]}`)
      .join(", ");
    lines.push(
      `${item.label} — average ${average(numbers).toFixed(1)}${unit} over ${numbers.length} days ` +
        `(low ${Math.min(...numbers)}, high ${Math.max(...numbers)}). Day by day: ${daily}`,
    );
  });

  lines.push(
    "",
    "You may refer to this data directly and point out patterns you notice in it. Be specific and concrete rather than generically encouraging.",
    "This is self-reported tracking, not clinical measurement — treat it as what the person noticed, not as fact. Never use it to suggest a diagnosis or a medication change.",
  );
  return lines.join("\n");
}

/* ==========================================================================
   4. Talking to the server-side model proxy
   ========================================================================== */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_TRIES = 3;
const RETRY_DELAY = 900;

async function callModel(payload) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt += 1) {
    let response;
    try {
      const appCheckToken = await getAppCheckToken();
      response = await fetch(OTTO_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastError = error;
      if (attempt < MAX_TRIES) {
        await sleep(RETRY_DELAY * attempt);
        continue;
      }
      throw lastError;
    }

    /* 5xx is usually the model being briefly busy — worth another go. */
    if (response.status >= 500 && attempt < MAX_TRIES) {
      await sleep(RETRY_DELAY * attempt);
      continue;
    }

    /* The body may not be JSON (a proxy error page, say), so don't assume. */
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }

    if (!response.ok) {
      /* Never retry a 429 — that just burns more of the quota you ran out of. */
      if (response.status === 429) throw new Error("RATE_LIMITED");
      throw new Error(data.error?.message || data.error || `HTTP ${response.status}`);
    }
    return data;
  }
  throw lastError;
}

const readReply = (data) =>
  data?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("") || "";

/* ==========================================================================
   5. Rendering messages
   ========================================================================== */

const PAGES = "index|conditions|treatments|track|tools|shop|about|learn|evidence";

/** Escape first, then add the small subset of markdown Otto is told to use. */
function renderMarkup(raw) {
  let html = escapeHtml(raw);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  /* Turn the site's own filenames into real links. Nothing else becomes one. */
  html = html.replace(
    new RegExp(`\\(?\\b(${PAGES})\\.html(#[\\w-]+)?\\)?`, "g"),
    (match, page, anchor) => `<a href="${page}.html${anchor || ""}">${page}.html${anchor || ""}</a>`,
  );
  html = html.replace(/^[-*]\s+(.+)$/gm, "• $1");
  return html.replace(/\n/g, "<br>");
}

let messages;
let typing;

function addMessage(text, sender) {
  if (!messages) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${sender}`;
  if (sender === "otto") bubble.innerHTML = renderMarkup(text);
  else bubble.textContent = text;
  messages.insertBefore(bubble, typing);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function setTyping(on) {
  if (typing) typing.hidden = !on;
  if (messages) messages.scrollTop = messages.scrollHeight;
}

/* ==========================================================================
   6. The panel
   ========================================================================== */

const panel = $("#otto-chat");
const launcher = $("[data-chat-launcher]");
const input = $("#otto-input");
const sendButton = $("#otto-send");

const turns = []; /* Running conversation sent back each time. */
let busy = false;

function openChat() {
  panel?.classList.add("open");
  panel?.setAttribute("aria-hidden", "false");
  launcher?.setAttribute("aria-expanded", "true");
  window.setTimeout(() => input?.focus(), 80);
  maybeAskConsent();
}

function closeChat() {
  panel?.classList.remove("open");
  panel?.setAttribute("aria-hidden", "true");
  launcher?.setAttribute("aria-expanded", "false");
}

async function send(rawText) {
  const text = (rawText ?? input?.value ?? "").trim();
  if (!text || busy) return;

  addMessage(text, "user");
  if (input) input.value = "";
  $(".chat-suggestions")?.setAttribute("hidden", "");

  /* Local, immediate, and never dependent on the network. */
  if (CRISIS_PATTERN.test(text)) {
    addMessage(CRISIS_REPLY, "otto");
    return;
  }

  if (!OTTO_ENDPOINT) {
    addMessage(NOT_CONFIGURED, "otto");
    return;
  }

  busy = true;
  if (sendButton) sendButton.disabled = true;
  turns.push({ role: "user", parts: [{ text }] });
  while (turns.length > MAX_TURNS) turns.shift();
  setTyping(true);

  const context = await personalContext();
  const payload = {
    contents: turns,
    ...(context ? { personalContext: context } : {}),
  };

  try {
    let data = await callModel(payload);
    let reply = readReply(data);

    /* Gemini can return 200 with an empty candidate. Quietly re-ask once. */
    if (!reply && data?.candidates?.[0]?.finishReason !== "MAX_TOKENS") {
      await sleep(RETRY_DELAY);
      data = await callModel(payload);
      reply = readReply(data);
    }

    setTyping(false);
    if (!reply) {
      turns.pop(); /* Keep history in sync with what was actually answered. */
      addMessage(
        data?.candidates?.[0]?.finishReason === "MAX_TOKENS"
          ? "That answer ran long and got cut off. Try asking for a smaller piece of it."
          : "I couldn't put a reply together that time. Mind trying again?",
        "otto",
      );
      return;
    }
    turns.push({ role: "model", parts: [{ text: reply }] });
    addMessage(reply, "otto");
  } catch (error) {
    console.error("Otto error:", error);
    setTyping(false);
    turns.pop();
    addMessage(
      error.message === "RATE_LIMITED"
        ? "I'm getting more questions than I can keep up with right now. Give it a few seconds and try again."
        : "Something went wrong reaching my language model. Try again in a moment.",
      "otto",
    );
  } finally {
    busy = false;
    if (sendButton) sendButton.disabled = false;
    input?.focus();
  }
}

/* ==========================================================================
   7. Consent for personal data
   ========================================================================== */

let consentRow;

function paintConsent() {
  if (!consentRow) return;
  if (!signedIn) {
    consentRow.innerHTML =
      "Questions are processed by OpenAI through AutonoHealth's server. Tracker data is not included unless you sign in and explicitly opt in. " +
      "Otto does not diagnose, prescribe, or replace a healthcare professional.";
    return;
  }
  consentRow.innerHTML = `
    <label class="otto-toggle">
      <input type="checkbox" id="otto-personal"${consent ? " checked" : ""}>
      <span>Send my 14-day tracker summary to OpenAI with my questions</span>
    </label>
    <button type="button" class="otto-peek" id="otto-peek">See exactly what's shared</button>`;

  $("#otto-personal")?.addEventListener("change", (event) => {
    consent = event.target.checked;
    localStorage.setItem(CONSENT_KEY, consent ? "on" : "off");
    addMessage(
      consent
        ? "Thanks — when relevant, a summary of your last two weeks will be sent to OpenAI with your question. You can switch this off any time."
        : "Understood. I'll stick to general questions about the site.",
      "otto",
    );
  });

  $("#otto-peek")?.addEventListener("click", async () => {
    const previous = consent;
    consent = true;
    const context = await personalContext();
    consent = previous;
    addMessage(
      context
        ? `This is the exact text I would send along with your question:\n\n${context}`
        : "There's nothing to send yet — you haven't logged anything in the last two weeks.",
      "otto",
    );
  });
}

/** Asked once per session, in the chat, rather than hidden in a setting. */
function maybeAskConsent() {
  if (!signedIn || consentAsked || localStorage.getItem(CONSENT_KEY)) return;
  consentAsked = true;

  const bubble = addMessage(
    "You're signed in, so I can optionally send a summary of your last two weeks of tracker entries to OpenAI with your question. You can preview the exact summary and turn this off later. Do you want to enable that?",
    "otto",
  );
  const choices = document.createElement("div");
  choices.className = "otto-choices";
  choices.innerHTML = `
    <button type="button" class="chat-suggestion" data-otto-consent="on">Yes, use my data</button>
    <button type="button" class="chat-suggestion" data-otto-consent="off">Not now</button>`;
  bubble?.after(choices);

  choices.addEventListener("click", (event) => {
    const button = event.target.closest("[data-otto-consent]");
    if (!button) return;
    consent = button.dataset.ottoConsent === "on";
    localStorage.setItem(CONSENT_KEY, consent ? "on" : "off");
    choices.remove();
    paintConsent();
    addMessage(
      consent
        ? "Done. Ask me something like “how has my sleep been?” and I'll send the optional summary with that question."
        : "No problem — I'll keep to general questions. You can turn it on at the bottom of this panel whenever you like.",
      "otto",
    );
  });
}

/* ==========================================================================
   8. Wiring
   ========================================================================== */

function build() {
  if (!panel) return;
  messages = $("#otto-messages");

  /* Otto brings its own stylesheet, for the same reason it builds its own
     elements: eight pages, zero HTML edits. The panel starts hidden, so
     there's nothing to flash. */
  const href = new URL("otto.css", import.meta.url).href;
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  }

  /* Created here, not in the HTML, so no page markup has to change. */
  if (messages && !$("#otto-typing")) {
    typing = document.createElement("div");
    typing.className = "chat-message otto otto-typing";
    typing.id = "otto-typing";
    typing.hidden = true;
    typing.setAttribute("aria-label", "Otto is typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    messages.append(typing);
  }

  consentRow = $(".chat-privacy", panel);
  paintConsent();

  $("[data-chat-close]", panel)?.addEventListener("click", closeChat);
  sendButton?.addEventListener("click", () => send());
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  });

  $$("[data-chat-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      openChat();
      send(button.dataset.chatSuggestion);
    });
  });

  $$("[data-otto-open]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      openChat();
    });
  });

  launcher?.addEventListener("click", () => {
    if (panel.classList.contains("open")) closeChat();
    else openChat();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("open")) closeChat();
  });

  /* The homepage hero asks the first question. */
  $$("[data-otto-ask]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const field = $("input", form);
      const text = field?.value.trim();
      openChat();
      if (text) {
        send(text);
        field.value = "";
      }
    });
  });
}

build();

onAuthStateChanged(auth, (user) => {
  signedIn = Boolean(user);
  store = user ? cloudStore(user.uid) : null;
  if (!signedIn) consent = false;
  else consent = localStorage.getItem(CONSENT_KEY) === "on";
  paintConsent();
  if (signedIn && panel?.classList.contains("open")) maybeAskConsent();
});
