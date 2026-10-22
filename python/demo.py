"""demo.py — example consumer + self-check. Run with: python demo.py"""

from theme_maker import RoleConfig, Theme, ramp_from_hex


def demo() -> None:
    theme = Theme()

    assert theme.get_base("accent") == "#C6373A"
    assert len(theme.ramp_of("neutral")) == 11

    theme.add_role(RoleConfig("warning", "Warning", "#C98A1F"))
    assert theme.get_base("warning") == "#C98A1F"

    light = theme.render()
    theme.set_dark(True)
    dark = theme.render()

    assert light["--neutral-01"] == dark["--neutral-11"], "neutral should invert on dark"
    assert light["--accent-01"] == dark["--accent-01"], "accent should NOT invert on dark"

    assert ramp_from_hex("#494751")[0] != ramp_from_hex("#494751")[-1]

    print(theme.render_css())


if __name__ == "__main__":
    demo()
