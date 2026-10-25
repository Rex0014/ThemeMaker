/* Ing_green — the "status" ramp, used by the deck for anything that reads as
   satisfied / met / validated (see the `success` alias in theme.js).

   Ordered lightest → darkest, like every ramp. The ordering is load-bearing:
   dark mode reads it backwards, so step 07 serves #16703a on a light surface
   and #6fd08f on a dark one — the same role, legible either way, written once.

   Kept in the same hue family as Ing_red is to red: a tinted ramp rather than
   a raw primary, so it sits next to the brand colours without shouting. */

export default {
     50: "#eefaf0",
    100: "#cdf0d6",
    200: "#a3e3b6",
    300: "#6fd08f",
    400: "#3fb96c",
    500: "#2aa257",
    600: "#1c8a47",
    700: "#16703a",
    800: "#10552c",
    900: "#0b3b1e",
    950: "#062210"
}
