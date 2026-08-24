/* ==========================================================================
   account.js — the sign-in control in the site header
   --------------------------------------------------------------------------
   Injected into .nav-actions, immediately after the "Ask Otto" button, on
   every page. Built at runtime rather than written into markup for the same
   reason Otto is: eight pages, and none of their HTML has to change.

   It shares a session with the tracker's own account button through
   firebase.js, so signing in from either place updates both at once.

   Styled quieter than the tracker's version on purpose. On the tracker page
   that button IS the primary action, so it's a solid blue call to action.
   Here it sits next to "Ask Otto", which is already the header's one blue
   button — a second one would just be two things shouting.
   ========================================================================== */

import {
  $,
  auth,
  provider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  escapeHtml,
  cloudStore,
  entryHasData,
  shiftKey,
  TODAY,
} from "./firebase.js";

const ICON_USER = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

let button;
let menu;
let currentUser = null;

/* --------------------------------------------------------------------------
   Build
   -------------------------------------------------------------------------- */

function inject() {
  const actions = $(".nav-actions");
  if (!actions || $("#nav-account")) return false;

  const href = new URL("account.css", import.meta.url).href;
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  }

  const wrap = document.createElement("div");
  wrap.className = "nav-account";
  wrap.id = "nav-account";
  wrap.innerHTML = `
    <button class="nav-account-button" type="button" id="nav-account-button" data-state="out"
            aria-haspopup="false" aria-expanded="false" aria-controls="nav-account-menu"
            aria-label="Sign in">
      <span class="nav-account-face" id="nav-account-face">${ICON_USER}</span>
      <span class="nav-account-label" id="nav-account-label">Sign in</span>
    </button>
    <div class="nav-account-menu" id="nav-account-menu" role="menu" hidden></div>`;

  /* Right of "Ask Otto", left of the hamburger. */
  const askOtto = $("[data-otto-open].button", actions);
  if (askOtto) askOtto.after(wrap);
  else actions.prepend(wrap);

  button = $("#nav-account-button");
  menu = $("#nav-account-menu");

  button.addEventListener("click", () => {
    if (!currentUser) {
      startSignIn();
      return;
    }
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (menu.hidden) return;
    if (!event.target.closest("#nav-account")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  return true;
}

function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  button?.setAttribute("aria-expanded", "false");
}

/* --------------------------------------------------------------------------
   Sign in / out
   -------------------------------------------------------------------------- */

async function startSignIn() {
  button.disabled = true;
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Sign-in failed:", error);
    /* Popups get blocked in plenty of ordinary setups. */
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
  } finally {
    button.disabled = false;
  }
}

getRedirectResult(auth).catch((error) => console.error("Redirect sign-in failed:", error));

/* --------------------------------------------------------------------------
   Paint
   -------------------------------------------------------------------------- */

function paint(user) {
  if (!button) return;
  const face = $("#nav-account-face");
  const label = $("#nav-account-label");

  if (!user) {
    button.dataset.state = "out";
    button.setAttribute("aria-label", "Sign in");
    button.setAttribute("aria-haspopup", "false");
    if (face) face.innerHTML = ICON_USER;
    if (label) label.textContent = "Sign in";
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = "";
    }
    return;
  }

  const name = user.displayName || user.email || "Account";
  const initial = name.trim().charAt(0).toUpperCase();

  button.dataset.state = "in";
  button.setAttribute("aria-label", `Signed in as ${name}`);
  button.setAttribute("aria-haspopup", "menu");
  if (face) {
    face.innerHTML = user.photoURL
      ? `<img src="${escapeHtml(user.photoURL)}" alt="" referrerpolicy="no-referrer">`
      : escapeHtml(initial);
  }
  if (label) label.textContent = name.split(" ")[0] || "Account";

  if (menu) {
    menu.innerHTML = `
      <div class="nav-account-id">
        <strong>${escapeHtml(user.displayName || "Signed in")}</strong>
        <small>${escapeHtml(user.email || "")}</small>
      </div>
      <p class="nav-account-stat" id="nav-account-stat"></p>
      <a role="menuitem" href="track.html">Go to my tracker</a>
      <button type="button" role="menuitem" id="nav-signout">Sign out</button>`;

    $("#nav-signout")?.addEventListener("click", () => {
      closeMenu();
      signOut(auth);
    });
    showRecentActivity(user);
  }
}

/** A small, true line — not a fake number. Silent if there's nothing to say. */
async function showRecentActivity(user) {
  const node = $("#nav-account-stat");
  if (!node) return;
  try {
    const entries = [...(await cloudStore(user.uid).loadAll(shiftKey(TODAY, -6))).values()].filter(entryHasData);
    node.textContent = entries.length
      ? `${entries.length} check-in${entries.length === 1 ? "" : "s"} in the last 7 days`
      : "No check-ins yet this week";
  } catch (error) {
    console.error("Could not read recent activity:", error);
    node.remove();
  }
}

/* --------------------------------------------------------------------------
   Go
   -------------------------------------------------------------------------- */

if (inject()) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user || null;
    paint(currentUser);
  });
}
