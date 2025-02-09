// hilbert_curve_sort.cc
// refer to ..\ts\hilbert-curve-sort.ts for documentation

#include "hilbert_curve_sort.h"

void RunHilbertCurveSort2D(vector<array<double, 2>> &vec2s, const double kSide,
                           promise<void> resolve);
void RunHilbertCurveSort3D(vector<array<double, 3>> &vec3s, const double kSide,
                           promise<void> resolve);
bool IsBaseHilbertCurveSort2D(const vector<array<double, 2>> &kVec2s);
bool IsBaseHilbertCurveSort3D(const vector<array<double, 3>> &kVec3s);

const auto kGrayCode = [](const int n) {
  vector<uint8_t> result;
  for (uint8_t bit = 0; bit < (1 << n); bit++) {
    result.push_back(bit ^ (bit >> 1));
  }
  return result;
};

void HilbertCurveSort2D(vector<array<double, 2>> &vec2s) {
  double minX = numeric_limits<double>::max();
  double maxX = numeric_limits<double>::min();
  double minY = numeric_limits<double>::max();
  double maxY = numeric_limits<double>::min();

  for (const auto &kVec2 : vec2s) {
    minX = min(minX, kVec2[0]);
    maxX = max(maxX, kVec2[0]);
    minY = min(minY, kVec2[1]);
    maxY = max(maxY, kVec2[1]);
  }

  const double kSideX = maxX - minX;
  const double kSideY = maxY - minY;
  const double kMaxSide = max(kSideX, kSideY);

  const double kScaleX = (kSideX == 0 || kMaxSide == 0) ? 1 : kMaxSide / kSideX;
  const double kScaleY = (kSideY == 0 || kMaxSide == 0) ? 1 : kMaxSide / kSideY;

  for (auto &kVec2 : vec2s) {
    kVec2[0] = kScaleX * (kVec2[0] - minX);
    kVec2[1] = kScaleY * (kVec2[1] - minY);
  }

  promise<void> promise;
  future<void> future = promise.get_future();
  thread thread(RunHilbertCurveSort2D, ref(vec2s), kMaxSide,
                std::move(promise));

  future.wait();
  thread.join();
};

void HilbertCurveSort3D(vector<array<double, 3>> &vec3s) {
  double minX = numeric_limits<double>::max();
  double maxX = numeric_limits<double>::min();
  double minY = numeric_limits<double>::max();
  double maxY = numeric_limits<double>::min();
  double minZ = numeric_limits<double>::max();
  double maxZ = numeric_limits<double>::min();

  for (const auto &kVec3 : vec3s) {
    minX = min(minX, kVec3[0]);
    maxX = max(maxX, kVec3[0]);
    minY = min(minY, kVec3[1]);
    maxY = max(maxY, kVec3[1]);
    minZ = min(minZ, kVec3[2]);
    maxZ = max(maxZ, kVec3[2]);
  }

  const double kSideX = maxX - minX;
  const double kSideY = maxY - minY;
  const double kSideZ = maxZ - minZ;
  const double kMaxSide = max({kSideX, kSideY, kSideZ});

  const double kScaleX = (kSideX == 0 || kMaxSide == 0) ? 1 : kMaxSide / kSideX;
  const double kScaleY = (kSideY == 0 || kMaxSide == 0) ? 1 : kMaxSide / kSideY;
  const double kScaleZ = (kSideZ == 0 || kMaxSide == 0) ? 1 : kMaxSide / kSideZ;

  for (auto &kVec3 : vec3s) {
    kVec3[0] = kScaleX * (kVec3[0] - minX);
    kVec3[1] = kScaleY * (kVec3[1] - minY);
    kVec3[2] = kScaleZ * (kVec3[2] - minZ);
  }

  promise<void> promise;
  future<void> future = promise.get_future();
  thread thread(RunHilbertCurveSort3D, ref(vec3s), kMaxSide,
                std::move(promise));

  future.wait();
  thread.join();
};

void RunHilbertCurveSort2D(vector<array<double, 2>> &vec2s, const double kSide,
                           promise<void> resolve) {
  if (IsBaseHilbertCurveSort2D(vec2s)) return resolve.set_value();

  const double kMid = kSide / 2;

  const vector<uint8_t> kGrayCode2 = kGrayCode(2);

  array<function<array<double, 2>(const array<double, 2> &)>, 4> maps;
  maps[0b00] = [](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[1], kVec2[0]};
  };
  maps[0b01] = [kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[0], kVec2[1] - kMid};
  };
  maps[0b11] = [kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[0] - kMid, kVec2[1] - kMid};
  };
  maps[0b10] = [kSide, kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kMid - kVec2[1], kSide - kVec2[0]};
  };

  array<function<array<double, 2>(const array<double, 2> &)>, 4> invMaps;
  invMaps[0b00] = [](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[1], kVec2[0]};
  };
  invMaps[0b01] = [kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[0], kVec2[1] + kMid};
  };
  invMaps[0b11] = [kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kVec2[0] + kMid, kVec2[1] + kMid};
  };
  invMaps[0b10] = [kSide, kMid](const array<double, 2> &kVec2) {
    return array<double, 2>{kSide - kVec2[1], kMid - kVec2[0]};
  };

  array<vector<array<double, 2>>, 4> quads = {
      vector<array<double, 2>>{}, vector<array<double, 2>>{},
      vector<array<double, 2>>{}, vector<array<double, 2>>{}};

  for (const auto &kVec2 : vec2s) {
    const bool kBitX = kVec2[0] > kMid;
    const bool kBitY = kVec2[1] > kMid;
    const uint8_t kQuad = (kBitX << 1) + kBitY;
    quads[kQuad].push_back(maps[kQuad](std::move(kVec2)));
  }

  vector<promise<void>> promises;
  vector<future<void>> futures;
  vector<thread> threads;

  for (auto &kVec2s : quads) {
    promises.emplace_back();
    futures.push_back(promises.back().get_future());
    threads.emplace_back(RunHilbertCurveSort2D, ref(kVec2s), kMid,
                         std::move(promises.back()));
  }

  for (auto &future : futures) future.wait();
  for (auto &thread : threads) thread.join();

  for (uint8_t i = 0; i < 4; i++) {
    for (auto &vec2 : quads[i]) vec2 = invMaps[i](std::move(vec2));
  }

  vector<array<double, 2>> result;

  for (const auto &quad : kGrayCode2) {
    result.insert(result.end(), make_move_iterator(quads[quad].begin()),
                  make_move_iterator(quads[quad].end()));
  }

  vec2s = result;
  resolve.set_value();
}

void RunHilbertCurveSort3D(vector<array<double, 3>> &vec3s, const double kSide,
                           promise<void> resolve) {
  if (IsBaseHilbertCurveSort3D(vec3s)) return resolve.set_value();

  const double kMid = kSide / 2;

  const vector<uint8_t> kGrayCode3 = kGrayCode(3);

  array<function<array<double, 3>(const array<double, 3> &)>, 8> maps;
  maps[0b000] = [](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[2], kVec3[0], kVec3[1]};
  };
  maps[0b001] = [kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[1], kVec3[2] - kMid, kVec3[0]};
  };
  maps[0b011] = [kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[1] - kMid, kVec3[2] - kMid, kVec3[0]};
  };
  maps[0b010] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[0], kSide - kVec3[1], kMid - kVec3[2]};
  };
  maps[0b110] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[0] - kMid, kSide - kVec3[1], kMid - kVec3[2]};
  };
  maps[0b111] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kSide - kVec3[1], kVec3[2] - kMid,
                            kSide - kVec3[0]};
  };
  maps[0b101] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kMid - kVec3[1], kVec3[2] - kMid, kSide - kVec3[0]};
  };
  maps[0b100] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kMid - kVec3[2], kSide - kVec3[0], kVec3[1]};
  };

  array<function<array<double, 3>(const array<double, 3> &)>, 8> invMaps;
  maps[0b000] = [](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[1], kVec3[2], kVec3[0]};
  };
  maps[0b001] = [kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[2], kVec3[0], kVec3[1] + kMid};
  };
  maps[0b011] = [kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[2], kVec3[0] + kMid, kVec3[1] + kMid};
  };
  maps[0b010] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[0], kSide - kVec3[1], kMid - kVec3[2]};
  };
  maps[0b110] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kVec3[0] + kMid, kSide - kVec3[1], kMid - kVec3[2]};
  };
  maps[0b111] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kSide - kVec3[2], kSide - kVec3[0],
                            kVec3[1] + kMid};
  };
  maps[0b101] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kSide - kVec3[2], kMid - kVec3[0], kVec3[1]};
  };
  maps[0b100] = [kSide, kMid](const array<double, 3> &kVec3) {
    return array<double, 3>{kSide - kVec3[1], kVec3[2], kMid - kVec3[0]};
  };

  array<vector<array<double, 3>>, 8> octs = {
      vector<array<double, 3>>{}, vector<array<double, 3>>{},
      vector<array<double, 3>>{}, vector<array<double, 3>>{},
      vector<array<double, 3>>{}, vector<array<double, 3>>{},
      vector<array<double, 3>>{}, vector<array<double, 3>>{}};

  for (const auto &kVec3 : vec3s) {
    const bool kBitX = kVec3[0] > kMid;
    const bool kBitY = kVec3[1] > kMid;
    const bool kBitZ = kVec3[2] > kMid;
    const uint8_t kOct = (kBitX << 2) + (kBitY << 1) + kBitZ;
    octs[kOct].push_back(maps[kOct](std::move(kVec3)));
  }

  vector<promise<void>> promises;
  vector<future<void>> futures;
  vector<thread> threads;

  for (auto &kVec3s : octs) {
    promises.emplace_back();
    futures.push_back(promises.back().get_future());
    threads.emplace_back(RunHilbertCurveSort3D, ref(kVec3s), kMid,
                         std::move(promises.back()));
  }

  for (auto &future : futures) future.wait();
  for (auto &thread : threads) thread.join();

  for (uint8_t i = 0; i < 8; i++) {
    for (auto &vec3 : octs[i]) vec3 = invMaps[i](std::move(vec3));
  }

  vector<array<double, 3>> result;

  for (const auto &oct : kGrayCode3) {
    result.insert(result.end(), make_move_iterator(octs[oct].begin()),
                  make_move_iterator(octs[oct].end()));
  }

  vec3s = result;
  resolve.set_value();
}

bool IsBaseHilbertCurveSort2D(const vector<array<double, 2>> &kVec2s) {
  if (kVec2s.size() < 2) return true;
  const set<array<double, 2>> kUniqueVec2s(make_move_iterator(kVec2s.begin()),
                                           make_move_iterator(kVec2s.end()));
  return kUniqueVec2s.size() == 1;
}

bool IsBaseHilbertCurveSort3D(const vector<array<double, 3>> &kVec3s) {
  if (kVec3s.size() < 2) return true;
  const set<array<double, 3>> kUniqueVec3s(make_move_iterator(kVec3s.begin()),
                                           make_move_iterator(kVec3s.end()));
  return kUniqueVec3s.size() == 1;
}
