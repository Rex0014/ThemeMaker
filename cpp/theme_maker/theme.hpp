// theme.hpp — the engine: one base hex per role, ramp.hpp expands it to each
// role's configured shade count, this hands them back as CSS custom
// properties (--<role>-01..NN).
//
// Dark mode is not a second palette: it reads the same ramp backwards
// (position 01 serves what 11 held, and so on). Only roles with invert=true
// flip on dark mode — semantic roles like accent/success/failure are meant
// to read the same regardless of theme; neutral is the one role that's
// actually "light surface vs dark surface".
//
// No windowing system here, so render() just returns the computed custom
// properties — hand them to whatever draws your UI (Qt stylesheet, ImGui
// colors, a generated CSS file, ...).

#pragma once

#include <sstream>
#include <string>
#include <vector>

#include "ramp.hpp"

namespace theme_maker {

struct RoleConfig {
    std::string key;
    std::string label;
    std::string base;
    bool invert = false;
    int shades = 11;
};

inline std::vector<RoleConfig> default_roles() {
    return {
        {"neutral", "Neutral", "#494751", true, 11},
        {"accent", "Accent", "#C6373A", false, 5},
        {"success", "Success", "#3B9C55", false, 5},
        {"failure", "Failure", "#B23B2E", false, 5},
    };
}

struct CssVar {
    std::string name;
    std::string value;
};

class Theme {
public:
    explicit Theme(std::vector<RoleConfig> roles = default_roles()) : roles_(std::move(roles)) {}

    void add_role(const RoleConfig& role) { roles_.push_back(role); }

    const RoleConfig* find(const std::string& key) const {
        for (const auto& r : roles_)
            if (r.key == key) return &r;
        return nullptr;
    }

    std::string get_base(const std::string& key) const {
        auto* r = find(key);
        return r ? r->base : "#888888";
    }

    std::vector<std::string> ramp_of(const std::string& key) const {
        auto* r = find(key);
        return ramp_from_hex(r ? r->base : "#888888", r ? r->shades : 11);
    }

    bool is_dark() const { return dark_; }

    void set_base(const std::string& key, const std::string& hexcode) {
        for (auto& r : roles_)
            if (r.key == key) { r.base = hexcode; return; }
    }

    void set_dark(bool dark) { dark_ = dark; }

    std::vector<CssVar> render() const {
        std::vector<CssVar> props;
        for (const auto& role : roles_) {
            auto ramp = ramp_of(role.key);
            bool flip = role.invert && dark_;
            for (size_t i = 0; i < ramp.size(); i++) {
                size_t src = flip ? ramp.size() - 1 - i : i;
                std::ostringstream name;
                name << "--" << role.key << "-" << (i + 1 < 10 ? "0" : "") << (i + 1);
                props.push_back({name.str(), ramp[src]});
            }
        }
        return props;
    }

    std::string render_css(const std::string& selector = ":root") const {
        std::ostringstream out;
        out << selector << " {\n";
        for (const auto& v : render()) out << "    " << v.name << ": " << v.value << ";\n";
        out << "}";
        return out.str();
    }

private:
    std::vector<RoleConfig> roles_;
    bool dark_ = false;
};

}  // namespace theme_maker
