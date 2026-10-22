/* ramp.ts — the "one colour in, N shades out" generator.

   Direct port of ATLAS/theme_maker's Python_colour_Palette/operators.py
   (hex_to_rgb, rgb_to_hex, color_stat, generate_scheme), generalized from a
   fixed 11-step scheme to a configurable shade count. Each RGB channel steps
   outward from the base colour, centered on the middle index unless the
   channel sits too close to black/white to have room to breathe in both
   directions. */

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

export function rgbToHex([r, g, b]: RGB): string {
    const clamp = (c: number) => Math.max(0, Math.min(255, Math.round(c)));
    return '#' + [r, g, b].map(c => clamp(c).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function luminance([r, g, b]: RGB): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorStat(rgb: RGB, maxmin: number, count: number) {
    const valueMax = 255 - maxmin;
    const valueMin = maxmin;
    const half = Math.floor(count / 2);
    const centered: boolean[] = [];
    const step: number[] = [];

    for (const c of rgb) {
        const isCentered = c >= valueMin && c <= valueMax;
        centered.push(isCentered);
        if (isCentered) {
            const maxInterval = valueMax - c;
            const minInterval = c - valueMin;
            step.push(Math.min(minInterval / half, maxInterval / half));
        } else {
            step.push(c < valueMin ? maxmin / (count - 1) : -maxmin / (count - 1));
        }
    }
    return { centered, step };
}

export function generateScheme(rgb: RGB, count = 11, inter = 20): RGB[] {
    const { centered, step } = colorStat(rgb, inter, count);
    const colors: RGB[] = [];
    const center = Math.ceil(count / 2);

    for (let a = 0; a < count; a++) {
        const value: RGB = [0, 0, 0];
        for (let b = 0; b < 3; b++) {
            value[b] = centered[b]
                ? rgb[b] + step[b] * (a - center)
                : rgb[b] + step[b] * a;
        }
        colors.push(value);
    }
    return colors;
}

/* The raw scheme isn't guaranteed monotonic (an uncentered channel steps one
   way only), so sort by luminance — index 0 lightest, count-1 darkest —
   matching how the Soutenance ramps are ordered and addressed by position,
   not by a fixed semantic key. */
export function rampFromHex(hex: string, count = 11, inter = 20): string[] {
    return generateScheme(hexToRgb(hex), count, inter)
        .slice()
        .sort((a, b) => luminance(b) - luminance(a))
        .map(rgbToHex);
}
