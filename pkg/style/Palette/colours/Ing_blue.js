/* Ing_blue — the deck's neutral ramp: cream → Ingeliance navy.

   Ordered lightest → darkest. Dark mode reads this backwards, so the ordering
   is load-bearing: keep it monotonic in lightness or the inversion produces
   nonsense. The brand values sit at the steps the semantic tokens point at
   (100 / 200 / 700 / 900) — see the TOKENS map in theme.js. */

export default {
     50: "#f9f7f3",
    100: "#ececec",
    200: "#e8e3d8",
    300: "#d3cec1",
    400: "#b0aa9c",
    500: "#85837c",
    600: "#5a6479",
    700: "#2c4a7a",
    800: "#1a2d4f",
    900: "#0d1b35",
    950: "#060e1c"
}
