/** @fileoverview Original mdds ref_pair.hpp borrowed immutable pair values for leaf iterators. */
// SPDX-FileCopyrightText: 2020 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import type { node, SegmentValue } from "./node";

/** Borrowed original leaf key/value references; getters retain changes to that live leaf. */
export class ref_pair<Value extends SegmentValue> {
  private readonly source: node<Value>;
  /** Binds both values to a single original leaf. @param source - Borrowed leaf. @returns Pair. */
  public constructor(source: node<Value>) {
    this.source = source;
  }
  /** Reads the live key reference. @returns Key. */
  public get first(): number {
    return this.source.key;
  }
  /** Reads the live stored-value reference. @returns Value. */
  public get second(): Value {
    return this.source.value_leaf.value;
  }
  /** Compares references by their current values, as native ref_pair or std::pair equality. @param other - Pair values or another borrowed pair. @returns Equality. */
  public equals(other: ref_pair<Value> | readonly [number, Value]): boolean {
    if (other instanceof ref_pair)
      return this.first === other.first && this.second === other.second;
    return this.first === other[0] && this.second === other[1];
  }
}
