/** @fileoverview Defines the source-owned numbering scalar and mutable caller-owned vector types. */

/** Represents an existing Writer counter using the project's number primitive. */
export type tSwNumTreeNumber = number;

/** Owns a mutable by-value vector of Writer counters independently of tree storage. */
export type tNumberVector = tSwNumTreeNumber[];
