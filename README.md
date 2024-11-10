This repository provides efficient implementations of Hilbert Curve Sorting for 2-tuples and 3-tuples.

Unlike the real number line $\mathbb{R}$, which has a total order ($<$, $>$, $=$),
we encounter challenges when dealing with higher-dimensional spaces such as $\mathbb{R}^2$ and $\mathbb{R}^3$.

Sorting, by intuition, gives an ordering of a set where the distance between neighboring elements is minimized.
The distance could be measured in Hamming Distance for bits or Euclidean 2-Norm for tuples.

Mapping from a hypercube (or else it could be scaled and descaled to fit a hypercube) and the real number line
can be achieved through the use of Hilbert Curves,
which are space-filling curves whose limit is the n-hypercube.
Neighboring tuples in the input space will also be mapped close to each other on the Hilbert Curve.
This mapping preserves the spatial relationships between the input points,
and ensures that the resulting order satisfies the properties of reflexivity, antisymmetry, and transitivity.
Another key property of Hilbert Curves is their locality-preserving nature, which is ideal for our purpose.

2-tuples and 3-tuples with Hilbert Curve Sorting are equipped with a Partially Ordered Set (POSET) structure,
rather than a Totally Ordered Set, due to the inverse mapping of $\mathbb{H}: \mathbb{R} \rightarrow \mathbb{R}^{2 | 3}$ being surjective,
and the algorithm can only return one of the possible values.
The criterion used to pick the result value is as follows: if sorting $[0, 2^n)^2 \cap \mathbb{N}^2$ (embedding of bit codes into $\mathbb{R}^2$)
gives the Gray Code ordering $\mathbb{G}_n$ (due to an elegant connection between the Gray Code and the Hilbert Curve).
