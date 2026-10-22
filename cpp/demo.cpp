// demo.cpp — example consumer + self-check.
// Build & run: g++ -std=c++17 -I. demo.cpp -o demo && ./demo

#include <cassert>
#include <iostream>

#include "theme_maker/theme.hpp"

int main() {
    using namespace theme_maker;

    Theme theme;

    assert(theme.get_base("accent") == "#C6373A");
    assert(theme.ramp_of("neutral").size() == 11);

    theme.add_role({"warning", "Warning", "#C98A1F", false});
    assert(theme.get_base("warning") == "#C98A1F");

    auto name_of = [](const std::vector<CssVar>& props, const std::string& name) {
        for (const auto& p : props) if (p.name == name) return p.value;
        return std::string();
    };

    auto light = theme.render();
    theme.set_dark(true);
    auto dark = theme.render();

    assert(name_of(light, "--neutral-01") == name_of(dark, "--neutral-11"));
    assert(name_of(light, "--accent-01") == name_of(dark, "--accent-01"));

    std::cout << theme.render_css() << std::endl;
    return 0;
}
