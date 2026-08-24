/* ==========================================================================
   firebase.js — shared foundation for AutonoHealth
   --------------------------------------------------------------------------
   Firebase lives here once, and both track.js and otto.js import it. Before
   this file existed, track.js initialised Firebase on its own; Otto now needs
   the same auth session and the same tracked data, and calling initializeApp
   twice throws. One module, one config, one source of truth for the data
   model.

   THIS IS THE ONLY FILE WITH YOUR FIREBASE CONFIG IN IT.
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  getToken as getAppCheckTokenFromFirebase,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================================
   1. Configuration — paste your project's config over this block
   --------------------------------------------------------------------------
   These values are public by design. They identify the project; they don't
   authorise anything. Protection comes from firestore.rules.
   ========================================================================== */

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH3hS7OaFaoqrcif8oOCn3jVlHh4Px70M",
  authDomain: "autonohealth-13207.firebaseapp.com",
  projectId: "autonohealth-13207",
  storageBucket: "autonohealth-13207.firebasestorage.app",
  messagingSenderId: "382218953235",
  appId: "1:382218953235:web:9b4a336c456c5daf1e15e6",
};

/* Public reCAPTCHA Enterprise site key used by Firebase App Check. Add it only
   after registering the web app in Firebase Console. It is not a secret. */
const APP_CHECK_SITE_KEY = "";

export const app = initializeApp(firebaseConfig);
export const appCheck = APP_CHECK_SITE_KEY
  ? initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    })
  : null;
export const auth = getAuth(app);
/* No second argument: a new project's database is the unnamed (default). */
export const db = getFirestore(app);

export async function getAppCheckToken() {
  if (!appCheck) return "";
  try {
    return (await getAppCheckTokenFromFirebase(appCheck)).token;
  } catch (error) {
    console.error("App Check token unavailable:", error);
    return "";
  }
}

export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

/* Re-exported so track.js and otto.js never import firebase URLs directly. */
export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
};

/* ==========================================================================
   2. Helpers, the data model, and storage
   ========================================================================== */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const RANGE_DAYS = 30;
export const MAX_CUSTOM = 20;

/** Local-time date key. toISOString() would shift the day across timezones. */
export const dateKey = (date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

export const keyToDate = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const shiftKey = (key, days) => {
  const date = keyToDate(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

export const TODAY = dateKey(new Date());

export const longDate = (key) =>
  keyToDate(key).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

export const shortDate = (key) => keyToDate(key).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export function relativeDay(key) {
  if (key === TODAY) return "Today";
  if (key === shiftKey(TODAY, -1)) return "Yesterday";
  const diff = Math.round((keyToDate(TODAY) - keyToDate(key)) / 86400000);
  return diff > 0 && diff < 7 ? `${diff} days ago` : shortDate(key);
}

export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function debounce(fn, wait) {
  let timer;
  const wrapped = (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
  wrapped.flush = () => {
    window.clearTimeout(timer);
    fn();
  };
  return wrapped;
}

/* ==========================================================================
   3. What can be tracked
   --------------------------------------------------------------------------
   Types:
     scale5 — five inline dots (mood)
     hours  — slider (sleep)
     number — numeric field with an optional unit
     yesno  — yes / no select
     text   — short free note
   ========================================================================== */

export const BUILT_IN = [
  { id: "mood", label: "Mood", hint: "How today felt overall", glyph: "☺", type: "scale5", unit: "" },
  { id: "sleep", label: "Sleep", hint: "Last night, in hours", glyph: "☾", type: "hours", unit: "hr" },
  { id: "exercise", label: "Exercise", hint: "Moderate-intensity movement", glyph: "↑", type: "number", unit: "min" },
  { id: "products", label: "Medications & supplements", hint: "Took today's as planned", glyph: "Rx", type: "yesno", unit: "" },
  { id: "hydration", label: "Water", hint: "Against your own target", glyph: "H₂O", type: "number", unit: "cups" },
  { id: "nutrition", label: "Food notes", hint: "Anything worth remembering", glyph: "N", type: "text", unit: "" },
  { id: "symptom", label: "Symptoms", hint: "Only if there's something to note", glyph: "S", type: "text", unit: "" },
];

export const BUILT_IN_IDS = BUILT_IN.map((item) => item.id);
export const ALLOWED_TYPES = new Set(["text", "number", "yesno"]); /* Types a person may create. */

export const MOOD_LABELS = { 1: "Very low", 2: "Low", 3: "Okay", 4: "Good", 5: "Very good" };
export const MOOD_GLYPHS = { 1: "☁", 2: "◔", 3: "●", 4: "◕", 5: "☀" };
/** v1 stored mood as a word. Map it forward so nobody loses their history. */
export const LEGACY_MOOD = { low: "1", flat: "2", okay: "3", good: "4", great: "5" };

export const emptyTemplate = () => ({ custom: [], hidden: [], order: [...BUILT_IN_IDS] });
export const emptyEntry = (key) => ({ date: key, values: {} });

export function normaliseTemplate(raw) {
  const template = emptyTemplate();
  if (!raw || typeof raw !== "object") return template;

  const seen = new Set();
  template.custom = (Array.isArray(raw.custom) ? raw.custom : [])
    .filter((item) => {
      const ok =
        item &&
        typeof item.id === "string" &&
        /^custom-[a-z0-9-]+$/.test(item.id) &&
        typeof item.label === "string" &&
        item.label.trim() &&
        ALLOWED_TYPES.has(item.type) &&
        !seen.has(item.id);
      if (ok) seen.add(item.id);
      return ok;
    })
    .slice(0, MAX_CUSTOM)
    .map((item) => ({
      id: item.id,
      label: item.label.trim().slice(0, 60),
      hint: "",
      glyph: "+",
      type: item.type,
      unit: item.type === "number" ? String(item.unit || "").trim().slice(0, 16) : "",
    }));

  const known = new Set([...BUILT_IN_IDS, ...template.custom.map((item) => item.id)]);
  template.hidden = (Array.isArray(raw.hidden) ? raw.hidden : []).filter(
    (id, index, all) => known.has(id) && all.indexOf(id) === index,
  );
  template.order = (Array.isArray(raw.order) ? raw.order : []).filter(
    (id, index, all) => known.has(id) && all.indexOf(id) === index,
  );
  known.forEach((id) => {
    if (!template.order.includes(id)) template.order.push(id);
  });
  return template;
}

export function normaliseEntry(raw, key) {
  const entry = emptyEntry(key);
  if (!raw || typeof raw !== "object") return entry;

  if (raw.values && typeof raw.values === "object") {
    Object.entries(raw.values).forEach(([id, value]) => {
      if (typeof value === "string" && value.trim() !== "") entry.values[id] = value.slice(0, 180);
      else if (typeof value === "number") entry.values[id] = String(value);
    });
  }

  /* Fold the v1 shape (mood/sleep as top-level fields behind submit flags). */
  if (!entry.values.mood && raw.moodSubmitted === true && typeof raw.mood === "string") {
    entry.values.mood = LEGACY_MOOD[raw.mood] || "";
  }
  if (!entry.values.sleep && raw.sleepSubmitted === true && raw.sleep != null) {
    entry.values.sleep = String(raw.sleep);
  }
  Object.keys(entry.values).forEach((id) => {
    if (entry.values[id].trim() === "") delete entry.values[id];
  });
  return entry;
}

export const isLogged = (entry, id) => Boolean((entry.values[id] || "").trim());
export const entryHasData = (entry) => Object.keys(entry.values).length > 0;

/* ==========================================================================
   4. Storage — same interface, two backings
   ========================================================================== */

export const TEMPLATE_KEY = "autonohealth-template";
export const ENTRY_PREFIX = "autonohealth-entry-";

export const localStore = {
  mode: "local",
  async loadTemplate() {
    try {
      return normaliseTemplate(JSON.parse(localStorage.getItem(TEMPLATE_KEY) || "null"));
    } catch {
      return emptyTemplate();
    }
  },
  async saveTemplate(template) {
    try {
      localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
    } catch {
      /* Private mode or full quota — the page keeps working in memory. */
    }
  },
  async loadEntry(key) {
    try {
      return normaliseEntry(JSON.parse(localStorage.getItem(ENTRY_PREFIX + key) || "null"), key);
    } catch {
      return emptyEntry(key);
    }
  },
  async saveEntry(key, entry) {
    try {
      if (entryHasData(entry)) localStorage.setItem(ENTRY_PREFIX + key, JSON.stringify(entry));
      else localStorage.removeItem(ENTRY_PREFIX + key);
    } catch {
      /* As above. */
    }
  },
  async loadAll(sinceKey = null) {
    const entries = new Map();
    for (let index = 0; index < localStorage.length; index += 1) {
      const storageKey = localStorage.key(index);
      if (!storageKey?.startsWith(ENTRY_PREFIX)) continue;
      const key = storageKey.slice(ENTRY_PREFIX.length);
      if (sinceKey && key < sinceKey) continue;
      try {
        entries.set(key, normaliseEntry(JSON.parse(localStorage.getItem(storageKey)), key));
      } catch {
        /* Skip a corrupt day rather than failing the whole range. */
      }
    }
    return entries;
  },
  async deleteAll() {
    const doomed = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const storageKey = localStorage.key(index);
      if (storageKey?.startsWith(ENTRY_PREFIX) || storageKey === TEMPLATE_KEY) doomed.push(storageKey);
    }
    doomed.forEach((storageKey) => localStorage.removeItem(storageKey));
  },
};

export function cloudStore(uid) {
  const templateRef = doc(db, "users", uid, "tracker", "template");
  const entriesRef = collection(db, "users", uid, "entries");

  return {
    mode: "cloud",
    uid,
    async loadTemplate() {
      const snapshot = await getDoc(templateRef);
      return normaliseTemplate(snapshot.exists() ? snapshot.data() : null);
    },
    async saveTemplate(template) {
      await setDoc(templateRef, { ...template, updatedAt: serverTimestamp() }, { merge: true });
    },
    async loadEntry(key) {
      const snapshot = await getDoc(doc(entriesRef, key));
      return normaliseEntry(snapshot.exists() ? snapshot.data() : null, key);
    },
    async saveEntry(key, entry) {
      const ref = doc(entriesRef, key);
      if (!entryHasData(entry)) {
        await deleteDoc(ref).catch(() => {});
        return;
      }
      await setDoc(ref, { date: key, values: entry.values, updatedAt: serverTimestamp() });
    },
    async loadAll(sinceKey = null) {
      const constraints = sinceKey ? [where("date", ">=", sinceKey), orderBy("date", "desc")] : [orderBy("date", "desc")];
      const snapshot = await getDocs(query(entriesRef, ...constraints));
      const entries = new Map();
      snapshot.forEach((document_) => entries.set(document_.id, normaliseEntry(document_.data(), document_.id)));
      return entries;
    },
    async deleteAll() {
      const snapshot = await getDocs(entriesRef);
      await Promise.all(snapshot.docs.map((document_) => deleteDoc(document_.ref)));
      await deleteDoc(templateRef).catch(() => {});
      /* Remove the legacy profile document created by older versions. Firebase
         Authentication remains separate and is not deleted here. */
      await deleteDoc(doc(db, "users", uid)).catch(() => {});
    },
  };
}
