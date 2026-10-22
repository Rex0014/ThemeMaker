"""theme.py — the engine: one base hex per role, ramp.py expands it to each
role's configured shade count, this hands them back as CSS custom
properties (--<role>-01 .. NN).

Dark mode is not a second palette: it reads the same ramp backwards
(position 01 serves what 11 held, and so on). Only roles with invert=True
flip on dark mode — semantic roles like accent/success/failure are meant to
read the same regardless of theme; neutral is the one role that's actually
"light surface vs dark surface".

No DOM here (there isn't one), so `render()` just returns the computed
custom properties — write them into a <style> tag, a server-rendered
template, or wherever your app keeps its CSS variables.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .ramp import ramp_from_hex


@dataclass
class RoleConfig:
    key: str
    label: str
    base: str
    invert: bool = False
    shades: int = 11


def default_roles() -> list[RoleConfig]:
    return [
        RoleConfig("neutral", "Neutral", "#494751", invert=True),
        RoleConfig("accent", "Accent", "#C6373A", shades=5),
        RoleConfig("success", "Success", "#3B9C55", shades=5),
        RoleConfig("failure", "Failure", "#B23B2E", shades=5),
    ]


class Theme:
    def __init__(self, roles: list[RoleConfig] | None = None, dark: bool = False):
        self.roles: list[RoleConfig] = roles if roles is not None else default_roles()
        self._bases: dict[str, str] = {r.key: r.base for r in self.roles}
        self._dark = dark

    def add_role(self, role: RoleConfig) -> None:
        self.roles.append(role)
        self._bases[role.key] = role.base

    def get_base(self, key: str) -> str:
        return self._bases.get(key, "#888888")

    def _role(self, key: str) -> RoleConfig | None:
        return next((r for r in self.roles if r.key == key), None)

    def ramp_of(self, key: str) -> list[str]:
        role = self._role(key)
        return ramp_from_hex(self.get_base(key), role.shades if role else 11)

    def is_dark(self) -> bool:
        return self._dark

    def set_base(self, key: str, hexcode: str) -> None:
        self._bases[key] = hexcode

    def set_dark(self, dark: bool) -> None:
        self._dark = dark

    def render(self) -> dict[str, str]:
        """{'--accent-07': '#C6373A', ...} for every role, in role order."""
        props: dict[str, str] = {}
        for role in self.roles:
            ramp = self.ramp_of(role.key)
            flip = role.invert and self._dark
            for i, _ in enumerate(ramp):
                src = len(ramp) - 1 - i if flip else i
                props[f"--{role.key}-{i + 1:02d}"] = ramp[src]
        return props

    def render_css(self, selector: str = ":root") -> str:
        lines = [f"{selector} {{"]
        for name, value in self.render().items():
            lines.append(f"    {name}: {value};")
        lines.append("}")
        return "\n".join(lines)
