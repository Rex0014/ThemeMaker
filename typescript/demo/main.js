// demo/main.js — the demo page's own script. Imports the library exactly as
// an outside consumer would, from the built dist/, nothing from src/.
import { ROLES, getBase, rampOf, isDark, setBase, setDark, boot, render } from '../dist/index.js';

function el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
}

function buildRoleRow(role) {
    const row = el('div', 'role-row');

    const label = el('label', 'role-label');
    label.textContent = role.label;
    label.htmlFor = `picker-${role.key}`;

    const picker = el('input', 'role-picker');
    picker.type = 'color';
    picker.id = `picker-${role.key}`;
    picker.value = getBase(role.key);
    picker.addEventListener('input', () => {
        setBase(role.key, picker.value);
        renderSwatches(role.key, strip);
    });

    const strip = el('div', 'swatch-strip');
    strip.id = `swatches-${role.key}`;

    row.append(label, picker, strip);
    renderSwatches(role.key, strip);
    return row;
}

function renderSwatches(role, strip) {
    strip.innerHTML = '';
    const ramp = rampOf(role);
    const ordered = isDark() ? ramp.slice().reverse() : ramp;
    ordered.forEach((hex, i) => {
        const sw = el('div', 'swatch');
        sw.style.background = hex;
        sw.title = `--${role}-${String(i + 1).padStart(2, '0')}: ${hex}`;
        sw.addEventListener('click', () => {
            navigator.clipboard?.writeText(hex).catch(() => { /* clipboard may be unavailable */ });
        });
        strip.appendChild(sw);
    });
}

function renderAllSwatches() {
    for (const r of ROLES) {
        const strip = document.getElementById(`swatches-${r.key}`);
        if (strip) renderSwatches(r.key, strip);
    }
}

function buildCssExport() {
    const lines = [':root {'];
    for (const r of ROLES) {
        const ramp = rampOf(r.key);
        const ordered = isDark() ? ramp.slice().reverse() : ramp;
        ordered.forEach((hex, i) => {
            lines.push(`    --${r.key}-${String(i + 1).padStart(2, '0')}: ${hex};`);
        });
    }
    lines.push('}');
    return lines.join('\n');
}

function wireToggle() {
    const box = document.getElementById('dark-toggle');
    if (!box) return;
    box.checked = isDark();
    box.addEventListener('change', () => {
        setDark(box.checked);
        renderAllSwatches();
    });
}

function wireExport() {
    const btn = document.getElementById('export-btn');
    const out = document.getElementById('css-output');
    if (!btn || !out) return;
    btn.addEventListener('click', () => {
        out.value = buildCssExport();
        out.hidden = false;
        out.focus();
        out.select();
    });
}

function init() {
    boot();

    const mount = document.getElementById('role-rows');
    if (mount) for (const r of ROLES) mount.appendChild(buildRoleRow(r));

    wireToggle();
    wireExport();
    render();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
