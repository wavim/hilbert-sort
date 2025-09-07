### Notes

An algorithm that is more efficient is described in
[John Skilling; Programming the Hilbert curve. AIP Conf. Proc. 21 April 2004; 707 (1): 381–387](https://doi.org/10.1063/1.1751381),
which works in arbitrary dimensions by not relying on recursive geometry alignment.

### Overview

This repository contains recursion-based implementation of Hilbert sorting algorithms for $R^2$ and
$R^3$ in C++ and TypeScript.

### Motivation

Sorting by intuition gives an ordering of a set where the distance between neighboring elements is
minimized. It is heavily used for DB indexing, visualization and a myriad of other purposes.

> The distance may be measured in Hamming distance for bits, or Euclidean 2-norm for vectors.

Sometimes our data is multidimensional, like RGB colors { $(r, g, b) | r, g, b \in [0, 255]$ }, or
vectors in $R^n, n \gt 1$. Unlike real numbers, we face challenges to sort those data.

One might use lexicographic sort, which compares the first non-identical component of tuples, but it
has many flaws. Take $[00, 01, 10, 11]$ as an example, lex would return the same sequence, which
fails to minimize total Hamming distance. A better ordering is $[00, 01, 11, 10]$, which is the Gray
code sequence $G_2$.

### Solution

Mapping from $R^n$ to $R$ could be achieved through the inverse of Hilbert Curves, which are
space-filling curves whose limit is the n-hypercube.

> Technically Hilbert Curves map the unit interval $[0, 1]$ to the unit n-hypercube $U_n$, but the
> hypercube could be offsetted and scaled to fit our data.

Neighboring tuples in the input space would also end up close to each other on the curve, preserving
the spatial relationship between the input points.

### Implementation

Some properties of the Hilbert Curves allows us to implement a recursive algorithm:

#### Locality-preservation

Points on the Hilbert Curve converges to a definite point as iteration count increases.

> This is not true for other curves in general, where the points would oscillate over iterations.

#### Fractal-ish

Every iteration $H(n)$ implicitly traces $H(n-k), k \le n$ curves.

> ![$\mathbb{H_}1$ Overlay](assets/H1_overlay.jpg) >
> ![$\mathbb{H_2}$ Overlay](assets/H2_overlay.jpg) >
> ![$\mathbb{H_3}$ Overlay](assets/H3_overlay.jpg)  
> H_2 Overlay, First 3 Iterations  
> Images by Geoff Richards (Qef) - Own work, Public Domain

Taking the $U_2$ case as an example for simplicity of illustration.

Divide $U_2$ into 4 quadrants, denoted by $[00, 01, 11, 10]$ respectively (the 1st bit represents if
$x \gt 0.5$ and the 2nd, $y \gt 0.5$). Notice, no matter how high the iteration count (even at
$\infty$), points in $01$ always come after ones in $00$, and ones in $11$ always come after ones in
$01$, etc.

> The orientation of $n$-D Hilbert Curve is based off the Gray code sequence $G_n$, generalizing the
> interpretation of the bits as mentioned above. ($G_n$ is a permutation of the bit code, which
> contains every vertex of $U_n$)

This allows us to recursively divide points into quadrants and sort the quadrants instead, after
which we concatenate the results in $H_2(1)$ order. Before sorting the quadrants, they must be
transformed to align $H_2(1)$, as the recursive algorithm divides according to it.

The recursion base is when only 1 or none vector is left, or if all vectors are identical. The input
vectors would be returned. The recursion step aligns the vectors to fit the hypercube, recurse, and
return de-aligned results.

The $U_3$ case is essentially the same, but with octants.

### Analysis

The time complexity of the algorithm is $O(n)$ w.r.t. the number of total function calls, where n is
the number of vectors in the hypercube.

The space complexity of the algorithm is expected to be quite high, as recursion is heavily used.

> Here the complexities are estimated assuming uniform distribution of points in $U_n$.

### Demo

The algorithm could be used for fast approximations of the Travelling Salesman Problem. See
[Benchmark and Visualization](https://github.com/wavim/hilbert-tsp-bench).

An interactive demo is available at [Hilbert Sort](https://wavim.github.io/hilbert-sort). It
includes:

#### 2D Point Sorting

Notice it would roughly approximate a Hilbert Curve.

#### RGB Color Sorting

The result would be more gradient than the original.
