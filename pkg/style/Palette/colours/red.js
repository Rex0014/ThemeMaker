/* Ing_red — the accent ramp.

   Ordered lightest → darkest, like every ramp. 600 is the brand red, and it
   mirrors onto 400 — which is exactly the lighter red the old hardcoded dark
   theme used (#FF4D33). That flip now falls out of the inversion instead of
   being written down twice. */

export default {
    50: "#FF0000",
    100: "#F80000",
    200: "#F00000",
    300: "#E00000",
    400: "#C00000",
    500: "#800000",
    600: "#400000",
    700: "#200000",
    800: "#100000",
    900: "#080000",
    950: "#000000"
}