"""ramp.py — the "one colour in, N shades out" generator.

Direct port of the TypeScript ramp.ts (itself a port of ATLAS/theme_maker's
Python_colour_Palette/operators.py), generalized from a fixed 11-step scheme
to a configurable shade count. Each RGB channel steps outward from the base
colour, centered on the middle index unless the channel sits too close to
black/white to have room to breathe in both directions.
"""

from __future__ import annotations

RGB = tuple[float, float, float]


def hex_to_rgb(hexcode: str) -> RGB:
    h = hexcode.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb_to_hex(rgb: RGB) -> str:
    def clamp(c: float) -> int:
        return max(0, min(255, round(c)))

    return "#" + "".join(f"{clamp(c):02X}" for c in rgb)


def _luminance(rgb: RGB) -> float:
    r, g, b = rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _color_stat(rgb: RGB, maxmin: float, count: int) -> tuple[list[bool], list[float]]:
    value_max = 255 - maxmin
    value_min = maxmin
    half = count // 2
    centered: list[bool] = []
    step: list[float] = []

    for c in rgb:
        is_centered = value_min <= c <= value_max
        centered.append(is_centered)
        if is_centered:
            max_interval = value_max - c
            min_interval = c - value_min
            step.append(min(min_interval / half, max_interval / half))
        else:
            step.append(maxmin / (count - 1) if c < value_min else -maxmin / (count - 1))

    return centered, step


def generate_scheme(rgb: RGB, count: int = 11, inter: float = 20) -> list[RGB]:
    centered, step = _color_stat(rgb, inter, count)
    colors: list[RGB] = []
    center = -(-count // 2)  # ceil(count / 2)

    for a in range(count):
        value = [0.0, 0.0, 0.0]
        for b in range(3):
            value[b] = rgb[b] + step[b] * ((a - center) if centered[b] else a)
        colors.append((value[0], value[1], value[2]))

    return colors


def ramp_from_hex(hexcode: str, count: int = 11, inter: float = 20) -> list[str]:
    """`count` hex shades, index 0 lightest to index count-1 darkest."""
    scheme = generate_scheme(hex_to_rgb(hexcode), count, inter)
    scheme.sort(key=_luminance, reverse=True)
    return [rgb_to_hex(c) for c in scheme]
