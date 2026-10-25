/* Ing_red — the accent ramp.

   Ordered lightest → darkest, like every ramp. 600 is the brand red, and it
   mirrors onto 400 — which is exactly the lighter red the old hardcoded dark
   theme used (#FF4D33). That flip now falls out of the inversion instead of
   being written down twice. */

export default {
    50: "#FFFFFF",
    100: "#F8F8F8",
    200: "#F0F0F0",
    300: "#E0E0E0",
    400: "#C0C0C0",
    500: "#808080",
    600: "#404040",
    700: "#202020",
    800: "#101010",
    900: "#080808",
    950: "#000000"
}
