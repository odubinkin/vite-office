/** @fileoverview Original mdds util.hpp event/default traits, trace lifetime and native logical-position algorithms. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { element_block_funcs } from "./block_funcs.ts";
import { type base_element_block, lu_factor_t, type trace_method_properties_t } from "./types.ts";
/** Original default empty acquisition/release owner. */
export class empty_event_func {
  /** Original no-op acquisition. @param block - Borrowed block pointer. @returns Nothing. */
  public element_block_acquired(block: base_element_block | null): void {
    void block;
  }
  /** Original no-op release. @param block - Borrowed block pointer. @returns Nothing. */
  public element_block_released(block: base_element_block | null): void {
    void block;
  }
}
/** Erased original empty default execution-policy type identity. */
export const default_exec_policy = Symbol("default_exec_policy");
/** Original default compile-time trait aliases; each witness retains its actual shared owner. */
export const default_traits = {
  event_func: empty_event_func,
  loop_unrolling: lu_factor_t.lu16 as const,
  exec_policy: default_exec_policy,
  block_funcs: element_block_funcs(),
};
/** Erased original empty clone-construction tag type identity. */
export const clone_construction_type = Symbol("clone_construction_type");
/** Original optional compile-time Traits::trace contract. */
export interface TraceTraits extends Partial<typeof default_traits> {
  trace?: (props: trace_method_properties_t) => void;
}
/** Borrowed original int reference for nested trace depth. */
export interface TraceDepth {
  value: number;
}
/** Adapts original compile-time trace member presence. @param Traits - Explicit native trait witness. @returns Presence. */
export function has_trace(
  Traits: TraceTraits,
): Traits is TraceTraits & Required<Pick<TraceTraits, "trace">> {
  return Traits.trace !== undefined;
}
/** Original optional trace scope; callers pair construction with dispose in finally, adapting native RAII. */
export class call_trace {
  /** Increments the original borrowed call depth. @param call_depth - Borrowed depth. @param Traits - Native trait witness. @returns Trace scope. */
  public constructor(
    private readonly call_depth: TraceDepth,
    private readonly Traits: TraceTraits,
  ) {
    ++call_depth.value;
  }
  /** Decrements depth at the original scope exit; valid lifetime permits exactly one disposal. @returns Nothing. */
  public dispose(): void {
    --this.call_depth.value;
  }
  /** Calls only the first original method; absent trace is a sink. @param props - Original trace properties. @returns Nothing. */
  public call(props: trace_method_properties_t): void {
    if (has_trace(this.Traits) && this.call_depth.value <= 1) this.Traits.trace(props);
  }
}
/** Original random-access std::distance witness supplied by a real borrowed iterator. */
export interface DistanceIterator<I> {
  distance_to(other: I): number;
}
/** Original position diagnostic with std::out_of_range mapped to RangeError. @param method_sig - Method signature. @param line - Source line. @param pos - Logical position. @param block_size - Block size. @param container_size - Logical size. @returns Never. */
export function throw_block_position_not_found(
  method_sig: string,
  line: number,
  pos: number | bigint,
  block_size: number | bigint,
  container_size: number | bigint,
): never {
  throw new RangeError(
    `${method_sig}#${line}: block position not found! (logical pos=${pos}, block size=${block_size}, logical size=${container_size})`,
  );
}
/** Original size_t64 input-end arithmetic; number projections require exact representable logical indices. @param it_begin - Native input begin. @param it_end - Native input end. @param pos - Logical insertion position. @param total_size - Logical size. @returns Original last-position and nonempty flag pair. */
export function calc_input_end_position<I extends DistanceIterator<I>, S extends number | bigint>(
  it_begin: I,
  it_end: I,
  pos: S,
  total_size: S,
): [S, boolean] {
  const length = BigInt.asUintN(64, BigInt(it_begin.distance_to(it_end)));
  if (!length) return [(typeof pos === "bigint" ? 0n : 0) as S, false];
  const end_pos = BigInt.asUintN(64, BigInt(pos) + length - 1n);
  if (end_pos >= BigInt.asUintN(64, BigInt(total_size)))
    throw new RangeError("Input data sequence is too long.");
  return [(typeof pos === "bigint" ? end_pos : Number(end_pos)) as S, true];
}
/** Original borrowed block iterator operations needed by the generic position utility. */
export interface BlockPositionIterator<I> {
  copy(): I;
  advance(steps: number): I;
  get(): { readonly size: number };
}
/** Original copied iterator/offset pair. */
export interface BlockPosition<I> {
  first: I;
  second: number;
}
/** Advances in original forward/backward block order without mutating the input pair. @param pos - Borrowed block position. @param steps - Original signed32 step count. @returns New borrowed position. */
export function advance_position<I extends BlockPositionIterator<I>>(
  pos: BlockPosition<I>,
  steps: number,
): BlockPosition<I> {
  const ret = { first: pos.first.copy(), second: pos.second };
  steps |= 0;
  if (steps > 0) {
    while (steps > 0) {
      if (ret.second + steps < ret.first.get().size) {
        ret.second += steps;
        break;
      } else {
        steps = (steps - ((ret.first.get().size - ret.second) | 0)) | 0;
        ret.first.advance(1);
        ret.second = 0;
      }
    }
  } else {
    while (steps < 0) {
      if ((ret.second | 0) >= -steps) {
        ret.second += steps;
        break;
      } else {
        steps = (steps + ((ret.second + 1) | 0)) | 0;
        ret.first.advance(-1);
        ret.second = ret.first.get().size - 1;
      }
    }
  }
  return ret;
}
