/* ============================================================================
   theme.js — the theme engine: aliases, light/dark inversion, and the toggle
   widget (its markup, its CSS and its behaviour).

   Dark mode is not a second palette. It reads the same ramp backwards: step 01
   serves the value of 11, 02 serves 10, and so on. The flip happens once, in
   applyPalette(), so no hex value is ever written twice.

   Colours stay one-per-file under colours/ and come in through palette.js.
   Fonts are CSS's business and live in theme.css.

   Stylesheets address the ramp by POSITION — var(--neutral-02) — not by the
   50…950 keys the colour files use. Deliberate: once a ramp can be read
   backwards, "900" is a lie in dark mode, where it holds a light colour.
   "02" only claims to be the second step, which stays true either way.

   ES module, so the deck must be served over HTTP — file:// blocks imports:
       cd Soutenance_de_Stage && python -m http.server
   Load it from <head>:
       <script type="module" src="pkg/style/Palette/theme.js"></script>
   ========================================================================== */

import palette from "./palette.js";

/* ── Aliases ─────────────────────────────────────────────────────────────────
   role → ramp name. Emits --<role>-<NN> for every step, so `neutral` publishes
   --neutral-01 … --neutral-11. Re-brand by editing one line; add a family
   (code, chart, …) by adding one. */

const aliases = {
    neutral: "gray",
    primary: "Ing_blue",
    accent:   "Ing_red",
    success:  "Ing_green"
};

export function getAliases() {
    return aliases;
}

export function setAliases(alias, ramp) {
    aliases[alias] = ramp;
    applyAliases(isDark());
}

/* ── Engine ───────────────────────────────────────────────────────────────── */

const root = document.documentElement;

export function applyPalette(name, prefix, dark = false) {
    const colours = palette[name];
    const shades = Object.keys(colours);

    for (let i = 0; i < shades.length; i++) {
        const from = dark
            ? shades[shades.length - 1 - i]
            : shades[i];

        /* position, 1-based and zero-padded — not the ramp's own key */
        const step = String(i + 1).padStart(2, "0");

        root.style.setProperty(
            `--${prefix}-${step}`,
            colours[from]
        );
    }
}

export function applyAliases(dark = false) {
    for (const alias in aliases) {
        applyPalette(aliases[alias], alias, dark);
    }
}

/* Any <img data-light="…" data-dark="…"> follows the theme. Generic on purpose:
   no per-slide element ids to keep in sync. */
function applyImages(dark) {
    for (const img of document.querySelectorAll("img[data-light][data-dark]")) {
        img.src = dark ? img.dataset.dark : img.dataset.light;
    }
}

function isDark() {
    return root.getAttribute("data-theme") === "dark";
}

/* localStorage can throw depending on how the page is served; a dead toggle
   beats a dead stylesheet, so never let it escape. */
function remember(dark) {
    try { localStorage.setItem("pres-theme", dark ? "dark" : "light"); }
    catch (e) { /* ignore */ }
}

function recall() {
    try { return localStorage.getItem("pres-theme") === "dark"; }
    catch (e) { return false; }
}

export function setTheme(dark) {
    applyAliases(dark);

    /* The colours no longer depend on this attribute, but keep it: it is how
       CSS that genuinely must branch on theme (shadow direction, per-slide art)
       still asks the question. */
    if (dark) {
        root.setAttribute("data-theme", "dark");
    } else {
        root.removeAttribute("data-theme");
    }

    applyImages(dark);

    const icon = document.getElementById("theme-icon");
    if (icon) { icon.textContent = dark ? "🌙" : "☀️"; }

    const box = document.getElementById("theme-checkbox");
    if (box) { box.checked = dark; }
}

/* ── Toggle widget ───────────────────────────────────────────────────────────
   Markup, CSS and wiring all live here, so a slide deck does not have to carry
   chrome in every template. */

const TOGGLE_CSS = `
#theme-toggle {
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 9999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    user-select: none;

    /* impress-common.css puts 'pointer-events: none' on the body and re-enables
       it only for #impress and its own chrome — its comment calls the trick out
       explicitly. The toggle is a sibling of #impress, so it inherits the 'none'
       and silently stops responding to clicks: visible, hoverable, dead.
       Declaring it here wins over the inherited value, and keeps the widget
       self-contained — a deck should not have to know this to get a toggle. */
    pointer-events: auto;
}

#theme-checkbox { display: none; }

.toggle-track {
    width: 30px;
    height: 18px;
    background: var(--neutral-03);
    border-radius: 10px;
    position: relative;
    transition: background 0.3s ease;
}

#theme-checkbox:checked + .toggle-track { background: var(--neutral-03); }

.toggle-thumb {
    width: 12px;
    height: 12px;
    background: var(--neutral-08);
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.3s ease, background 0.3s ease;                
}

#theme-checkbox:checked + .toggle-track .toggle-thumb {
    transform: translateX(12px);
}

.toggle-icon {
    font-size: 12px;
    line-height: 1;
    opacity: 0.75;
    padding: 4px;
    border-radius: 8px;
    background: var(--neutral-04);
}`;

function injectCss() {
    const style = document.createElement("style");
    style.textContent = TOGGLE_CSS;
    document.head.appendChild(style);
}

function buildToggle() {
    const label = document.createElement("label");
    label.id = "theme-toggle";
    label.title = "Toggle dark / light mode";
    label.innerHTML =
        '<input type="checkbox" id="theme-checkbox">' +
        '<span class="toggle-track"><span class="toggle-thumb"></span></span>';
    document.body.insertBefore(label, document.body.firstChild);

    label.querySelector("#theme-checkbox").addEventListener("change", function () {
        setTheme(this.checked);
        remember(this.checked);
    });
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */

setTheme(recall());
injectCss();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildToggle);
} else {
    buildToggle();
}
