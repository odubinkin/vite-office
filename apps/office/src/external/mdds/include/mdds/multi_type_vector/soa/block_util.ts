/** @fileoverview Original architecture-neutral SoA adjust_block_positions specializations over shared real vector owners. */
// SPDX-FileCopyrightText: 2021 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { lu_factor_t } from "../types.ts";
import { type std_vector } from "../vector_storage.ts";
/** Original architecture-neutral template specialization values; disabled SIMD is not a scalar fallback. */
export type scalar_lu_factor =
  lu_factor_t.none | lu_factor_t.lu4 | lu_factor_t.lu8 | lu_factor_t.lu16 | lu_factor_t.lu32;
/** Original generic Blks requirement; actual SoA ownership remains in main.ts. */
export interface PositionBlockStore<S extends number | bigint> {
  positions: std_vector<S>;
}
/** Original callable template specialization syntax. Native valid nonnegative indices and signed64 deltas are caller preconditions. */
export type PositionAdjuster = <S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
) => void;
/** Erased original uint64 reference += int64 arithmetic; number witnesses require exact representable input/output. @param positions - Real native vector syntax. @param index - Valid position. @param delta - Signed64 adjustment. @returns Nothing. */
function add_position<S extends number | bigint>(
  positions: std_vector<S>,
  index: number,
  delta: number | bigint,
): void {
  const value = positions.get(index);
  const sum = BigInt.asUintN(64, BigInt(value) + BigInt(delta));
  positions.set(index, (typeof value === "bigint" ? sum : Number(sum)) as S);
}
/** Original non-unrolled specialization. @param block_store - Blks. @param start_block_index - First slot. @param delta - Adjustment. @returns Nothing. */
function none<S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
): void {
  const n = block_store.positions.size();
  if (start_block_index >= n) return;
  for (let i = Number(start_block_index); i < n; ++i) add_position(block_store.positions, i, delta);
}
/** Original four-way specialization. @param block_store - Blks. @param start_block_index - First slot. @param delta - Adjustment. @returns Nothing. */
function lu4<S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
): void {
  const n = block_store.positions.size();
  if (start_block_index >= n) return;
  const start = Number(start_block_index);
  let len = n - start;
  let rem = len & 3;
  len -= rem;
  len += start;
  for (let i = start; i < len; i += 4) {
    add_position(block_store.positions, i + 0, delta);
    add_position(block_store.positions, i + 1, delta);
    add_position(block_store.positions, i + 2, delta);
    add_position(block_store.positions, i + 3, delta);
  }
  rem += len;
  for (let i = len; i < rem; ++i) add_position(block_store.positions, i, delta);
}
/** Original eight-way specialization. @param block_store - Blks. @param start_block_index - First slot. @param delta - Adjustment. @returns Nothing. */
function lu8<S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
): void {
  const n = block_store.positions.size();
  if (start_block_index >= n) return;
  const start = Number(start_block_index);
  let len = n - start;
  let rem = len & 7;
  len -= rem;
  len += start;
  for (let i = start; i < len; i += 8) {
    add_position(block_store.positions, i + 0, delta);
    add_position(block_store.positions, i + 1, delta);
    add_position(block_store.positions, i + 2, delta);
    add_position(block_store.positions, i + 3, delta);
    add_position(block_store.positions, i + 4, delta);
    add_position(block_store.positions, i + 5, delta);
    add_position(block_store.positions, i + 6, delta);
    add_position(block_store.positions, i + 7, delta);
  }
  rem += len;
  for (let i = len; i < rem; ++i) add_position(block_store.positions, i, delta);
}
/** Original sixteen-way specialization and original default-trait target. @param block_store - Blks. @param start_block_index - First slot. @param delta - Adjustment. @returns Nothing. */
function lu16<S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
): void {
  const n = block_store.positions.size();
  if (start_block_index >= n) return;
  const start = Number(start_block_index);
  let len = n - start;
  let rem = len & 15;
  len -= rem;
  len += start;
  for (let i = start; i < len; i += 16) {
    add_position(block_store.positions, i + 0, delta);
    add_position(block_store.positions, i + 1, delta);
    add_position(block_store.positions, i + 2, delta);
    add_position(block_store.positions, i + 3, delta);
    add_position(block_store.positions, i + 4, delta);
    add_position(block_store.positions, i + 5, delta);
    add_position(block_store.positions, i + 6, delta);
    add_position(block_store.positions, i + 7, delta);
    add_position(block_store.positions, i + 8, delta);
    add_position(block_store.positions, i + 9, delta);
    add_position(block_store.positions, i + 10, delta);
    add_position(block_store.positions, i + 11, delta);
    add_position(block_store.positions, i + 12, delta);
    add_position(block_store.positions, i + 13, delta);
    add_position(block_store.positions, i + 14, delta);
    add_position(block_store.positions, i + 15, delta);
  }
  rem += len;
  for (let i = len; i < rem; ++i) add_position(block_store.positions, i, delta);
}
/** Original thirty-two-way specialization. @param block_store - Blks. @param start_block_index - First slot. @param delta - Adjustment. @returns Nothing. */
function lu32<S extends number | bigint>(
  block_store: PositionBlockStore<S>,
  start_block_index: number | bigint,
  delta: number | bigint,
): void {
  const n = block_store.positions.size();
  if (start_block_index >= n) return;
  const start = Number(start_block_index);
  let len = n - start;
  let rem = len & 31;
  len -= rem;
  len += start;
  for (let i = start; i < len; i += 32) {
    add_position(block_store.positions, i + 0, delta);
    add_position(block_store.positions, i + 1, delta);
    add_position(block_store.positions, i + 2, delta);
    add_position(block_store.positions, i + 3, delta);
    add_position(block_store.positions, i + 4, delta);
    add_position(block_store.positions, i + 5, delta);
    add_position(block_store.positions, i + 6, delta);
    add_position(block_store.positions, i + 7, delta);
    add_position(block_store.positions, i + 8, delta);
    add_position(block_store.positions, i + 9, delta);
    add_position(block_store.positions, i + 10, delta);
    add_position(block_store.positions, i + 11, delta);
    add_position(block_store.positions, i + 12, delta);
    add_position(block_store.positions, i + 13, delta);
    add_position(block_store.positions, i + 14, delta);
    add_position(block_store.positions, i + 15, delta);
    add_position(block_store.positions, i + 16, delta);
    add_position(block_store.positions, i + 17, delta);
    add_position(block_store.positions, i + 18, delta);
    add_position(block_store.positions, i + 19, delta);
    add_position(block_store.positions, i + 20, delta);
    add_position(block_store.positions, i + 21, delta);
    add_position(block_store.positions, i + 22, delta);
    add_position(block_store.positions, i + 23, delta);
    add_position(block_store.positions, i + 24, delta);
    add_position(block_store.positions, i + 25, delta);
    add_position(block_store.positions, i + 26, delta);
    add_position(block_store.positions, i + 27, delta);
    add_position(block_store.positions, i + 28, delta);
    add_position(block_store.positions, i + 29, delta);
    add_position(block_store.positions, i + 30, delta);
    add_position(block_store.positions, i + 31, delta);
  }
  rem += len;
  for (let i = len; i < rem; ++i) add_position(block_store.positions, i, delta);
}
const specializations: Record<scalar_lu_factor, PositionAdjuster> = {
  [lu_factor_t.none]: none,
  [lu_factor_t.lu4]: lu4,
  [lu_factor_t.lu8]: lu8,
  [lu_factor_t.lu16]: lu16,
  [lu_factor_t.lu32]: lu32,
};
/** Resolves the original scalar template specialization; unsupported template arguments are excluded by the type contract. @param factor - Original explicit template factor. @returns Original callable specialization. */
export function adjust_block_positions(factor: scalar_lu_factor): PositionAdjuster {
  return specializations[factor];
}
