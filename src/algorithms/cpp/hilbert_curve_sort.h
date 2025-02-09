// hilbert_curve_sort.h
// refer to ..\ts\hilbert-curve-sort.ts for documentation

#ifndef HILBERT_CURVE_SORT
#define HILBERT_CURVE_SORT

#include <array>
#include <functional>
#include <iterator>
#include <limits>
#include <map>
#include <set>
#include <utility>
#include <vector>

using namespace std;

void HilbertCurveSort2D(vector<array<double, 2>> &vec2s);
void HilbertCurveSort3D(vector<array<double, 3>> &vec3s);

#endif
