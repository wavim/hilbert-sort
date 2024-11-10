This repository provides efficient implementations of Hilbert Curve Sorting for 2-tuples and 3-tuples.

Unlike the real number line $\mathbb{R}$, which has a total order ($<$, $>$, $=$),
we encounter challenges when dealing with higher-dimensional spaces such as $\mathbb{R}^2$ and $\mathbb{R}^3$.

Sorting, by intuition, gives an ordering of a set where the distance between neighboring elements is minimized.
The distance could be measured in Hamming Distance for bits or Euclidean 2-Norm for tuples.

Mapping from a hypercube (or else it could be fitted to a hypercube) and the real number line
can be achieved through the use of Hilbert Curves,
which are space-filling curves whose limit is the n-hypercube.
Neighboring tuples in the input space will also be mapped close to each other on the Hilbert Curve.
This mapping preserves the spatial relationships between the input points,
and ensures that the resulting order is a partial order:

- Reflexivity - $a \le a$
- Antisymmetry - $a \le b \land b \le a \implies a = b$
- Transitivity - $a \le b \land b \le c \implies a \le c$

Another key property of Hilbert Curves is their locality-preserving nature, which is ideal for our purpose.

2-tuples and 3-tuples with Hilbert Curve Sorting are equipped with a Partially Ordered Set (POSET) structure,
rather than a Totally Ordered Set, due to the inverse mapping of $\mathbb{H}: \mathbb{R} \rightarrow \mathbb{R}^{2 | 3}$ being surjective,
and the algorithm can only return one of the possible values.
The criterion used to pick the result value is as follows:

- Sorting $\langle 0,1 \rangle^{2|3}$ (embedding of bit codes into $\mathbb{R}^{2|3}$)
gives the Gray Code sequence $\mathbb{G}_{2|3}$ (due to an elegant connection between the Gray Code and the Hilbert Curve).
- Sorting $\langle 0, \dots, 2^n \rangle^{2|3}$ gives a correctly oriented Hilbert Curve, where $\mathbb{H}\_1$ is constructed by $\mathbb{G}\_{2|3}$ (interpreting each bit $\mathbb{G}(n)$ as $x_n$) and the k-th iteration curve traces $\mathbb{H}_{k-j}, 0 \le j \le k$ sub-curves.
