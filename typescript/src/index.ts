/* index.ts — library entry point. The demo (main.ts) imports from theme.js
   directly; consumers of the published package should import from here. */

export { hexToRgb, rgbToHex, generateScheme, rampFromHex } from './ramp.js';
export type { RGB } from './ramp.js';
export {
    ROLES,
    addRole,
    getBase,
    rampOf,
    isDark,
    setBase,
    setDark,
    boot,
    render,
} from './theme.js';
export type { RoleConfig } from './theme.js';
