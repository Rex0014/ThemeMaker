# theme-maker

One base hex per colour role in, an 11-step light/dark CSS-variable-shaped
ramp out. Same engine, three implementations:

```
typescript/   browser library — src/ + dist/, demo/ is a separate consumer
python/       theme_maker package, for server-rendered CSS or any Python app
cpp/          header-only theme_maker/, for native UI (Qt, ImGui, ...)
```

Pick one colour for `neutral`, `accent`, `success`, `failure` — each gets
expanded into 11 shades (`--accent-01` … `--accent-11`) that your CSS (or
UI code) addresses by position, never by hex. Flipping dark mode re-reads
the ramp backwards for `neutral` only, so surfaces invert but semantic
colours (accent/success/failure) read the same in both themes — "success"
shouldn't mean a different shade of green depending on the theme.

Every implementation shares the same shape:

- `get_base(key)` / `ramp_of(key)` — read the current base hex / its 11 shades
- `set_base(key, hex)`, `set_dark(bool)` — mutate state
- `add_role(RoleConfig)` — register another token (`{key, label, base, invert?}`,
  `invert` defaults to `false` — only set it for a surface role like `neutral`)
- `render()` — the computed `--role-NN: #hex` pairs for the current state

Only the TypeScript version touches a DOM (`document.documentElement` +
`localStorage`); Python and C++ just hand you the computed properties or a
`:root { ... }` string to embed however your app renders UI.

## typescript/

```bash
cd typescript
pnpm install
pnpm build    # tsc → dist/
pnpm serve    # builds, then serves the repo at :8000 — open /demo/
```

```ts
import { boot, setBase, setDark, ROLES, addRole } from "theme-maker";

boot(); // restores last session's colours + dark/light from localStorage, then renders
setBase("accent", "#C6373A");
setDark(true); // only neutral's ramp flips
```

```css
.card {
    background: var(--neutral-01);
    color: var(--neutral-08);
    border: 2px solid var(--accent-07);
}
```

`typescript/demo/` is a separate consumer of the library (plain JS,
imports `../dist/index.js`), not part of it — colour pickers, live
swatches, a dark-mode toggle, an "Export CSS" button, and an example
card/typography stylesheet.

## python/

```bash
cd python
python demo.py
```

```python
from theme_maker import Theme, RoleConfig

theme = Theme()
theme.set_base("accent", "#C6373A")
theme.set_dark(True)               # only neutral's ramp flips
theme.add_role(RoleConfig("warning", "Warning", "#C98A1F"))

print(theme.render_css())          # ":root { --neutral-01: ...; }"
```

## cpp/

Header-only — no build system required, just `#include`:

```bash
cd cpp
g++ -std=c++17 -I. demo.cpp -o demo && ./demo
```

```cpp
#include "theme_maker/theme.hpp"

theme_maker::Theme theme;
theme.set_base("accent", "#C6373A");
theme.set_dark(true);              // only neutral's ramp flips
theme.add_role({"warning", "Warning", "#C98A1F", false});

std::string css = theme.render_css();
```
## About

**Author**: Rex Guil (Rex0014) - With the Help of Claude Code (OPUS 5.5)

The objective here was to create a basic theme system that could be applyable to a variaty of situations. Has worked for me so far, so why not share it?

**Licence**: GPL 3.0

**Version**: 1.0 - Released on 23/10/2026
