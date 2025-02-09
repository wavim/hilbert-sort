// hilbert_curve_sort.h

#ifndef HILBERT_CURVE_SORT
#define HILBERT_CURVE_SORT

#include <array>
#include <functional>
#include <future>
#include <iterator>
#include <limits>
#include <map>
#include <set>
#include <thread>
#include <utility>
#include <vector>

using namespace std;

void HilbertCurveSort2D(vector<array<double, 2>> &vec2s);
void HilbertCurveSort3D(vector<array<double, 3>> &vec3s);

#endif
