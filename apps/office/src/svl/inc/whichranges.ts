/** @fileoverview Native WhichRangesContainer logical value boundary represented by immutable JS range tuples; physical storage/cache/allocator fields are erased. */
/** Inclusive WhichId range accepted by an item set. */
export type WhichRange = readonly [first: number, last: number];

/** Ordered collection of inclusive WhichId ranges. */
export type WhichRangesContainer = readonly WhichRange[];
