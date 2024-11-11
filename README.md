This repository contains implementation of Hilbert Curve Sorting algorithms for 2-tuples and 3-tuples.

Unlike the real number line $\mathbb{R}$, which has a total order ($<$, $>$, $=$),
we encounter challenges when dealing with higher-dimensional spaces such as $\mathbb{R}^2$ and $\mathbb{R}^3$.

Sorting, by intuition, gives an ordering of a set where the distance between neighboring elements is minimized.
The distance could be measured in Hamming Distance for bits or Euclidean 2-Norm for tuples.

Mapping from a hypercube (or else it could be fitted to a hypercube) and the real number line
can be achieved through the use of Hilbert Curves,
which are space-filling curves whose limit is the n-hypercube.
Neighboring tuples in the input space will also be mapped close to each other on the Hilbert Curve.
This mapping preserves the spatial relationships between the input points,
and ensures that the resulting order is a total order:

- Total - $a \le b \lor b \le a$
- Reflexivity - $a \le a$
- Transitivity - $a \le b \land b \le c \implies a \le c$
- Antisymmetry - $a \le b \land b \le a \implies a = b$

Another key property of Hilbert Curves is their locality-preserving nature, which is ideal for our purpose.

The Hilbet Curve $\mathbb{H}: \mathbb{R} \rightarrow \mathbb{R}^{2 | 3}$ is surjective, so its inverse mapping is multivalued.
Algorithms will only return one of the possible values, consistently.

Some facts worth noting:
- Sorting $\langle 0,1 \rangle^{2|3}$ (embedding of bit codes into $\mathbb{R}^{2|3}$)
gives the Gray Code sequence $\mathbb{G}_{2|3}$ (due to an elegant connection between the Gray Code and the Hilbert Curve).
- Sorting $\langle 0, \dots, 2^n \rangle^{2|3}$ gives a correctly oriented Hilbert Curve, by means of having $\mathbb{H}_1$ constructed by $\mathbb{G}_{2|3}$ (interpreting the bit $\mathbb{G}(n)$ as $x_n$) and with the k-th iteration curve tracing $\mathbb{H}_{k-j}$, $0 \le j \le k$ curves.
