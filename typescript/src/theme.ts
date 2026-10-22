/* theme.ts — the engine: one base hex per role, ramp.ts expands it to each
   role's configured shade count, and this publishes them as --<role>-01 …
   --<role>-NN.

   Dark mode is not a second palette, same trick as Soutenance's theme.js:
   it reads the same ramp backwards (position 01 serves what 11 held, and so
   on), so no hex value is ever written twice and every stylesheet rule stays
   theme-agnostic by only ever addressing a position. Only roles marked
   `invert` flip on dark mode — semantic roles like accent/success/failure
   are meant to read the same regardless of theme; neutral is the one role
   that's actually "light surface vs dark surface". */

import { rampFromHex } from './ramp.js';

export interface RoleConfig {
    key: string;
    label: string;
    base: string;
    /** Flip ramp direction on dark mode. Default false — add more tokens
     *  below without worrying about dark mode; only neutral needs this. */
    invert?: boolean;
    /** Shades in the generated ramp. Default 11. */
    shades?: number;
}

export const ROLES: RoleConfig[] = [
    { key: 'neutral', label: 'Neutral', base: '#494751', invert: true },
    { key: 'accent', label: 'Accent', base: '#C6373A', shades: 5 },
    { key: 'success', label: 'Success', base: '#3B9C55', shades: 5 },
    { key: 'failure', label: 'Failure', base: '#B23B2E', shades: 5 },
];

const root = document.documentElement;
const configs = new Map<string, RoleConfig>(ROLES.map(r => [r.key, r]));
const bases = new Map<string, string>(ROLES.map(r => [r.key, r.base]));
const STORAGE_KEY = 'theme-maker-state';

/** Register another colour token at runtime (e.g. a "warning" role). */
export function addRole(role: RoleConfig): void {
    ROLES.push(role);
    configs.set(role.key, role);
    bases.set(role.key, role.base);
    render();
}

export function getBase(role: string): string {
    return bases.get(role) ?? '#888888';
}

export function rampOf(role: string): string[] {
    return rampFromHex(getBase(role), configs.get(role)?.shades ?? 11);
}

export function isDark(): boolean {
    return root.getAttribute('data-theme') === 'dark';
}

function applyRole(role: RoleConfig): void {
    const ramp = rampOf(role.key);
    const flip = !!role.invert && isDark();
    for (let i = 0; i < ramp.length; i++) {
        const from = flip ? ramp.length - 1 - i : i;
        const step = String(i + 1).padStart(2, '0');
        root.style.setProperty(`--${role.key}-${step}`, ramp[from]);
    }
}

function remember(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            bases: Object.fromEntries(bases),
            dark: isDark(),
        }));
    } catch { /* storage can be unavailable; a dead save beats a dead page */ }
}

function recall(): { bases?: Record<string, string>; dark?: boolean } {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function render(): void {
    for (const r of ROLES) applyRole(r);
    document.dispatchEvent(new CustomEvent('theme:changed'));
}

export function setBase(role: string, hex: string): void {
    bases.set(role, hex);
    render();
    remember();
}

export function setDark(dark: boolean): void {
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    render();
    remember();
}

export function boot(): void {
    const saved = recall();
    if (saved.bases) {
        for (const [k, v] of Object.entries(saved.bases)) bases.set(k, v);
    }
    setDark(!!saved.dark);
}
