// ramp.hpp — the "one colour in, N shades out" generator.
//
// Direct port of the TypeScript ramp.ts, generalized from a fixed 11-step
// scheme to a configurable shade count. Each RGB channel steps outward from
// the base colour, centered on the middle index unless the channel sits too
// close to black/white to have room to breathe in both directions.
// Header-only, no dependencies beyond the standard library.

#pragma once

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace theme_maker {

using RGB = std::array<double, 3>;

inline RGB hex_to_rgb(const std::string& hexcode) {
    std::string h = hexcode.front() == '#' ? hexcode.substr(1) : hexcode;
    if (h.size() != 6) throw std::invalid_argument("hex_to_rgb: expected 6 hex digits");
    auto byte = [&](size_t pos) { return static_cast<double>(std::stoi(h.substr(pos, 2), nullptr, 16)); };
    return {byte(0), byte(2), byte(4)};
}

inline std::string rgb_to_hex(const RGB& rgb) {
    auto clamp = [](double c) {
        int v = static_cast<int>(std::lround(c));
        return static_cast<uint8_t>(std::clamp(v, 0, 255));
    };
    std::ostringstream out;
    out << '#' << std::hex << std::uppercase;
    for (double c : rgb) {
        int v = clamp(c);
        if (v < 16) out << '0';
        out << v;
    }
    return out.str();
}

namespace detail {

inline double luminance(const RGB& rgb) {
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

struct ColorStat {
    std::array<bool, 3> centered;
    std::array<double, 3> step;
};

inline ColorStat color_stat(const RGB& rgb, double maxmin, int count) {
    double value_max = 255 - maxmin;
    double value_min = maxmin;
    int half = count / 2;
    ColorStat stat{};

    for (size_t i = 0; i < 3; i++) {
        double c = rgb[i];
        bool is_centered = c >= value_min && c <= value_max;
        stat.centered[i] = is_centered;
        if (is_centered) {
            double max_interval = value_max - c;
            double min_interval = c - value_min;
            stat.step[i] = std::min(min_interval / half, max_interval / half);
        } else {
            stat.step[i] = c < value_min ? maxmin / (count - 1) : -maxmin / (count - 1);
        }
    }
    return stat;
}

}  // namespace detail

inline std::vector<RGB> generate_scheme(const RGB& rgb, int count = 11, double inter = 20) {
    auto [centered, step] = detail::color_stat(rgb, inter, count);
    std::vector<RGB> colors;
    colors.reserve(count);
    int center = (count + 1) / 2;  // ceil(count / 2)

    for (int a = 0; a < count; a++) {
        RGB value{};
        for (size_t b = 0; b < 3; b++) {
            value[b] = rgb[b] + step[b] * (centered[b] ? (a - center) : a);
        }
        colors.push_back(value);
    }
    return colors;
}

// `count` hex shades, index 0 lightest to index count-1 darkest.
inline std::vector<std::string> ramp_from_hex(const std::string& hexcode, int count = 11, double inter = 20) {
    auto scheme = generate_scheme(hex_to_rgb(hexcode), count, inter);
    std::sort(scheme.begin(), scheme.end(), [](const RGB& a, const RGB& b) {
        return detail::luminance(a) > detail::luminance(b);
    });
    std::vector<std::string> out;
    out.reserve(scheme.size());
    for (const auto& c : scheme) out.push_back(rgb_to_hex(c));
    return out;
}

}  // namespace theme_maker
