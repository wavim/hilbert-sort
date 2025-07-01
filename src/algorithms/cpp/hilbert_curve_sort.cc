// hilbert_curve_sort.cc
// refer to ..\ts\hilbert-curve-sort.ts for documentation

#include "hilbert_curve_sort.h"

#include <algorithm>
#include <cstdint>
#include <functional>
#include <iterator>

void run_sort_2d(std::vector<std::array<double, 2>> &vec2s, double side);
auto is_base_2d(const std::vector<std::array<double, 2>> &vec2s) -> bool;
void run_sort_3d(std::vector<std::array<double, 3>> &vec3s, double side);
auto is_base_3d(const std::vector<std::array<double, 3>> &vec3s) -> bool;

constexpr std::array<uint8_t, 4> gray2 = {0b00, 0b01, 0b11, 0b10};
constexpr std::array<uint8_t, 8> gray3 = {0b000, 0b001, 0b011, 0b010,
                                          0b110, 0b111, 0b101, 0b100};

void sort_2d(std::vector<std::array<double, 2>> &vec2s) {
  const auto [min_x_it, max_x_it] = std::ranges::minmax_element(
      vec2s, {}, [](const auto &vec) { return vec[0]; });
  const double min_x = (*min_x_it)[0];
  const double max_x = (*max_x_it)[0];

  const auto [min_y_it, max_y_it] = std::ranges::minmax_element(
      vec2s, {}, [](const auto &vec) { return vec[1]; });
  const double min_y = (*min_y_it)[1];
  const double max_y = (*max_y_it)[1];

  const double side_x = max_x - min_x;
  const double side_y = max_y - min_y;
  const double bound = std::max(side_x, side_y);

  const double scale_x = (side_x == 0 || bound == 0) ? 1 : bound / side_x;
  const double scale_y = (side_y == 0 || bound == 0) ? 1 : bound / side_y;

  for (auto &vec2 : vec2s) {
    vec2[0] = scale_x * (vec2[0] - min_x);
    vec2[1] = scale_y * (vec2[1] - min_y);
  }

  run_sort_2d(vec2s, bound);

  for (auto &vec2 : vec2s) {
    vec2[0] = vec2[0] / scale_x + min_x;
    vec2[1] = vec2[1] / scale_y + min_y;
  }
};

void run_sort_2d(std::vector<std::array<double, 2>> &vec2s, const double side) {
  if (is_base_2d(vec2s)) {
    return;
  }

  const double mid = side / 2;

  const std::array<std::function<void(std::array<double, 2> &)>, 4> maps{
      [](auto &vec2) { vec2 = {vec2[1], vec2[0]}; },
      [mid](auto &vec2) { vec2 = {vec2[0], vec2[1] - mid}; },
      [side, mid](auto &vec2) { vec2 = {mid - vec2[1], side - vec2[0]}; },
      [mid](auto &vec2) { vec2 = {vec2[0] - mid, vec2[1] - mid}; }};

  std::array quads = {std::vector<std::array<double, 2>>{},
                      std::vector<std::array<double, 2>>{},
                      std::vector<std::array<double, 2>>{},
                      std::vector<std::array<double, 2>>{}};

  for (auto &vec2 : vec2s) {
    const bool bit_x = vec2[0] > mid;
    const bool bit_y = vec2[1] > mid;

    const uint8_t quad =
        (static_cast<int>(bit_x) << 1) + static_cast<int>(bit_y);

    maps[quad](vec2);
    quads[quad].push_back(vec2);
  }

  for (auto &quad_vec2s : quads) {
    run_sort_2d(quad_vec2s, mid);
  }

  std::vector<std::array<double, 2>> result;

  const std::array<std::function<void(std::array<double, 2> &)>, 4> invs{
      [](auto &vec2) { vec2 = {vec2[1], vec2[0]}; },
      [mid](auto &vec2) { vec2 = {vec2[0], vec2[1] + mid}; },
      [side, mid](auto &vec2) { vec2 = {side - vec2[1], mid - vec2[0]}; },
      [mid](auto &vec2) { vec2 = {vec2[0] + mid, vec2[1] + mid}; }};

  for (const auto quad : gray2) {
    for (auto &vec2 : quads[quad]) {
      invs[quad](vec2);
    }

    result.insert(result.end(), make_move_iterator(quads[quad].begin()),
                  make_move_iterator(quads[quad].end()));
  }

  vec2s = result;
}

auto is_base_2d(const std::vector<std::array<double, 2>> &vec2s) -> bool {
  if (vec2s.size() < 2) {
    return true;
  }

  const auto &first = vec2s[0];

  return std::all_of(vec2s.begin() + 1, vec2s.end(),
                     [&first](const auto &vec2) { return vec2 == first; });
}

void sort_3d(std::vector<std::array<double, 3>> &vec3s) {
  const auto [min_x_it, max_x_it] = std::ranges::minmax_element(
      vec3s, {}, [](const auto &vec) { return vec[0]; });
  const double min_x = (*min_x_it)[0];
  const double max_x = (*max_x_it)[0];

  const auto [min_y_it, max_y_it] = std::ranges::minmax_element(
      vec3s, {}, [](const auto &vec) { return vec[1]; });
  const double min_y = (*min_y_it)[1];
  const double max_y = (*max_y_it)[1];

  const auto [min_z_it, max_z_it] = std::ranges::minmax_element(
      vec3s, {}, [](const auto &vec) { return vec[2]; });
  const double min_z = (*min_z_it)[2];
  const double max_z = (*max_z_it)[2];

  const double side_x = max_x - min_x;
  const double side_y = max_y - min_y;
  const double side_z = max_z - min_z;
  const double bound = std::max({side_x, side_y, side_z});

  const double scale_x = (side_x == 0 || bound == 0) ? 1 : bound / side_x;
  const double scale_y = (side_y == 0 || bound == 0) ? 1 : bound / side_y;
  const double scale_z = (side_z == 0 || bound == 0) ? 1 : bound / side_z;

  for (auto &vec3 : vec3s) {
    vec3[0] = scale_x * (vec3[0] - min_x);
    vec3[1] = scale_y * (vec3[1] - min_y);
    vec3[2] = scale_z * (vec3[2] - min_z);
  }

  run_sort_3d(vec3s, bound);

  for (auto &vec3 : vec3s) {
    vec3[0] = vec3[0] / scale_x + min_x;
    vec3[1] = vec3[1] / scale_y + min_y;
    vec3[2] = vec3[2] / scale_z + min_z;
  }
};

void run_sort_3d(std::vector<std::array<double, 3>> &vec3s, const double side) {
  if (is_base_3d(vec3s)) {
    return;
  }

  const double mid = side / 2;

  const std::array<std::function<void(std::array<double, 3> &)>, 8> maps{
      [](auto &vec3) { vec3 = {vec3[2], vec3[0], vec3[1]}; },
      [mid](auto &vec3) { vec3 = {vec3[1], vec3[2] - mid, vec3[0]}; },
      [side, mid](auto &vec3) {
        vec3 = {vec3[0], side - vec3[1], mid - vec3[2]};
      },
      [mid](auto &vec3) { vec3 = {vec3[1] - mid, vec3[2] - mid, vec3[0]}; },

      [side, mid](auto &vec3) {
        vec3 = {mid - vec3[2], side - vec3[0], vec3[1]};
      },
      [side, mid](auto &vec3) {
        vec3 = {mid - vec3[1], vec3[2] - mid, side - vec3[0]};
      },
      [side, mid](auto &vec3) {
        vec3 = {vec3[0] - mid, side - vec3[1], mid - vec3[2]};
      },
      [side, mid](auto &vec3) {
        vec3 = {side - vec3[1], vec3[2] - mid, side - vec3[0]};
      }};

  std::array octs = {std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{},
                     std::vector<std::array<double, 3>>{}};

  for (auto &vec3 : vec3s) {
    const bool bit_x = vec3[0] > mid;
    const bool bit_y = vec3[1] > mid;
    const bool bit_z = vec3[2] > mid;

    const uint8_t oct = (static_cast<int>(bit_x) << 2) +
                        (static_cast<int>(bit_y) << 1) +
                        static_cast<int>(bit_z);

    maps[oct](vec3);
    octs[oct].push_back(vec3);
  }

  for (auto &oct_vec3s : octs) {
    run_sort_3d(oct_vec3s, mid);
  }

  std::vector<std::array<double, 3>> result;

  const std::array<std::function<void(std::array<double, 3> &)>, 8> invs{
      [](std::array<double, 3> &vec3) { vec3 = {vec3[1], vec3[2], vec3[0]}; },
      [mid](std::array<double, 3> &vec3) {
        vec3 = {vec3[2], vec3[0], vec3[1] + mid};
      },
      [side, mid](std::array<double, 3> &vec3) {
        vec3 = {vec3[0], side - vec3[1], mid - vec3[2]};
      },
      [mid](std::array<double, 3> &vec3) {
        vec3 = {vec3[2], vec3[0] + mid, vec3[1] + mid};
      },

      [side, mid](std::array<double, 3> &vec3) {
        vec3 = {side - vec3[1], vec3[2], mid - vec3[0]};
      },
      [side, mid](std::array<double, 3> &vec3) {
        vec3 = {side - vec3[2], mid - vec3[0], vec3[1] + mid};
      },
      [side, mid](std::array<double, 3> &vec3) {
        vec3 = {vec3[0] + mid, side - vec3[1], mid - vec3[2]};
      },
      [side, mid](std::array<double, 3> &vec3) {
        vec3 = {side - vec3[2], side - vec3[0], vec3[1] + mid};
      }};

  for (const auto oct : gray3) {
    for (auto &vec3 : octs[oct]) {
      invs[oct](vec3);
    }

    result.insert(result.end(), make_move_iterator(octs[oct].begin()),
                  make_move_iterator(octs[oct].end()));
  }

  vec3s = result;
}

auto is_base_3d(const std::vector<std::array<double, 3>> &vec3s) -> bool {
  if (vec3s.size() < 2) {
    return true;
  }

  const auto &first = vec3s[0];

  return std::all_of(vec3s.begin() + 1, vec3s.end(),
                     [&first](const auto &vec3) { return vec3 == first; });
}