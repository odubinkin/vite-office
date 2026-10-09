/** @fileoverview Complete unchanged original container constructor/lifetime/operator states over real shared SoA ownership and typed scalar callbacks. */
import { describe, it, expect } from "vitest";
import fixture from "./native-container-cases.json";
import {
  multi_type_vector,
  empty_event_value_ops,
  type EventValueOps,
  type ContainerCallbacks,
} from "./main.ts";
import { type base_element_block, type default_element_block, get_block_type } from "../types.ts";
import { delayed_delete_vector, type DelayedVectorValue } from "../delayed_delete_vector.ts";
import { invalid_arg_error, general_error } from "../../global.ts";
import * as standard from "../standard_element_blocks.ts";
import { type iterator_updater, type iterator_base, type const_iterator_base } from "./iterator.ts";
import { type BlockPosition } from "../util.ts";
/** Erased existing original block type witness. */
type BlockType = ReturnType<typeof default_element_block<DelayedVectorValue>>;
/** Full native valid-live payload. */
type Payload = [number, number, number, (number | boolean | string)[]];
/** Full native owner state. */
type OwnerState = [
  number,
  number,
  boolean,
  [number, boolean],
  [number[], number[], number[], number[]],
  (Payload | null)[],
  unknown[],
];
/** Every observed callback includes actual owned scalar type/size at a valid callback boundary. */
type EventEntry = [number, number, number, number, boolean];
/** Full native result, stable handler fields, owners, equality matrix and event log. */
type State = [unknown, boolean, (OwnerState | null)[], unknown[], EventEntry[]];
const aliases = [
  standard.boolean_element_block,
  standard.int8_element_block,
  standard.uint8_element_block,
  standard.int16_element_block,
  standard.uint16_element_block,
  standard.int32_element_block,
  standard.uint32_element_block,
  standard.int64_element_block,
  standard.uint64_element_block,
  standard.float_element_block,
  standard.double_element_block,
  standard.string_element_block,
];
const callbacks = [
  standard.boolean_element_callbacks,
  standard.int8_element_callbacks,
  standard.uint8_element_callbacks,
  standard.int16_element_callbacks,
  standard.uint16_element_callbacks,
  standard.int32_element_callbacks,
  standard.uint32_element_callbacks,
  standard.int64_element_callbacks,
  standard.uint64_element_callbacks,
  standard.float_element_callbacks,
  standard.double_element_callbacks,
  standard.string_element_callbacks,
];
let nextHandler = 1,
  nextToken = 0,
  log: EventEntry[] = [];
let tokens = new Map<base_element_block, number>();
/** Registers actual native live-pointer identities independently of contents. @param data - Pointer. @returns Stable token. */
function id(data: base_element_block | null): number {
  if (!data) return -1;
  let token = tokens.get(data);
  if (token === undefined) {
    token = nextToken++;
    tokens.set(data, token);
  }
  return token;
}
/** Explicit native nonthrowing handler with implicit C++ member-value copy/move semantics. */
class Handler {
  public tag: number;
  public log: EventEntry[] | null;
  /** Adapts original default and implicit copy/move initialization. @param other - Source. @param moving - Native rvalue witness. @returns Handler. */
  public constructor(other?: Handler, moving = false) {
    if (other) {
      this.tag = other.tag;
      this.log = other.log;
      if (moving) other.log = null;
    } else {
      this.tag = nextHandler++;
      this.log = log;
    }
  }
  /** Original recorded acquisition boundary. @param data - Valid pointer. @returns Nothing. */
  public element_block_acquired(data: base_element_block | null): void {
    traceCall(4, data as base_element_block);
    if (this.log)
      this.log.push([
        this.tag,
        id(data),
        get_block_type(data as base_element_block),
        standard.standard_element_blocks_traits.block_funcs.size(data as base_element_block),
        true,
      ]);
  }
  /** Original release before deletion, never a dangling pointer observation. @param data - Valid pointer. @returns Nothing. */
  public element_block_released(data: base_element_block | null): void {
    if (this.log)
      this.log.push([
        this.tag,
        id(data),
        get_block_type(data as base_element_block),
        standard.standard_element_blocks_traits.block_funcs.size(data as base_element_block),
        false,
      ]);
    traceCall(2, data as base_element_block);
    tokens.delete(data as base_element_block);
  }
}
const Events: EventValueOps<Handler> = {
  /** Native implicit value copy. @param value - Source. @returns Value. */
  copy(value) {
    return new Handler(value);
  },
  /** Native implicit value move. @param value - Source. @returns Value. */
  move(value) {
    return new Handler(value, true);
  },
  /** Native std::swap final field values, preserving stable borrowed object identity. @param left - Left field. @param right - Right field. @returns Nothing. */
  swap(left, right) {
    [left.tag, right.tag] = [right.tag, left.tag];
    [left.log, right.log] = [right.log, left.log];
  },
};
let operationCalls: number[][] | null = null;
/** Records original caller arguments before forwarding actual registered block operations. @param op - Native operation code. @param data - Actual owner. @param args - Native arguments. @returns Nothing. */
function traceCall(op: number, data: base_element_block, ...args: number[]): void {
  operationCalls?.push([
    op,
    get_block_type(data),
    standard.standard_element_blocks_traits.block_funcs.size(data),
    ...args,
  ]);
}
const nativeFuncs = standard.standard_element_blocks_traits.block_funcs;
const observedFuncs = {
  ...nativeFuncs,
  /** Observes original overwrite arguments. @param data - Owner. @param pos - Offset. @param len - Count. @returns Nothing. */
  overwrite_values(data: base_element_block, pos: number, len: number): void {
    traceCall(0, data, pos, len);
    nativeFuncs.overwrite_values(data, pos, len);
  },
  /** Observes original scalar resize. @param data - Owner. @param size - Size. @returns Nothing. */
  resize_block(data: base_element_block, size: number): void {
    traceCall(1, data, size);
    nativeFuncs.resize_block(data, size);
  },
  /** Observes original delete after release. @param data - Owner. @returns Nothing. */
  delete_block(data: base_element_block): void {
    traceCall(3, data);
    nativeFuncs.delete_block(data);
  },
};
const Traits = {
  ...standard.standard_element_blocks_traits,
  block_funcs: observedFuncs,
  event_func: Handler,
};
/** Supplies an explicit original scalar family, never a JS numeric type guess. @param type - Native type ID. @param text - Decimal/string input. @returns Original scalar. */
function value(type: number, text: string): DelayedVectorValue {
  if (type === 0) return BigInt(text) !== 0n;
  if (type === 7 || type === 8) return BigInt(text);
  if (type === 11) return text;
  return Number(text);
}
/** Captures all original scalar payload values at a valid live-object boundary. @param data - Pointer. @returns Full payload. */
function payload(data: base_element_block): Payload {
  const type = get_block_type(data);
  const B = aliases[type] as BlockType;
  const values: (number | boolean | string)[] = [];
  for (let i = 0; i < B.size(data); ++i) {
    const v = B.cbegin(data).advance(i).get();
    values.push(typeof v === "bigint" ? String(v) : v);
  }
  return [type, B.size(data), B.capacity(data), values];
}
/** Observes original endpoint cache diagnostics without claiming end dereference/private data. @param it - Iterator. @param end - End. @param owner - Parent. @returns Full defined record. */
function node<K extends "mutable" | "const">(
  it: iterator_updater<multi_type_vector<Handler>, K>,
  end: typeof it,
  owner: multi_type_vector<Handler>,
): unknown {
  const n = it.get_node();
  const atEnd = it.equals(end);
  return [
    n.type,
    n.position,
    n.size,
    id(n.data),
    atEnd ? null : n.__private_data.parent === owner,
    atEnd ? null : n.__private_data.block_index,
  ];
}
/** Observes a valid retained cached hint without dereferencing its backing storage; endpoint private fields stay outside certification. @param it - Actual hint. @param owner - Query owner. @param atEnd - End witness. @returns Native cached record. */
function hintNode<K extends "mutable" | "const">(
  it: iterator_updater<multi_type_vector<Handler>, K>,
  owner: multi_type_vector<Handler>,
  atEnd = false,
): unknown[] {
  const n = it.get_node();
  return [
    n.type,
    n.position,
    n.size,
    id(n.data),
    atEnd ? null : n.__private_data.parent === owner,
    atEnd ? null : n.__private_data.block_index,
  ];
}
/** Observes only original returned position and supplied hint values. @param pair - Query result. @param end - Native end. @param owner - Owner. @param hint - Optional used hint. @param atEnd - End hint witness. @returns Full result. */
function positionResult<K extends "mutable" | "const">(
  pair: BlockPosition<iterator_updater<multi_type_vector<Handler>, K>>,
  end: iterator_updater<multi_type_vector<Handler>, K>,
  owner: multi_type_vector<Handler>,
  hint?: iterator_updater<multi_type_vector<Handler>, K>,
  atEnd = false,
): unknown[] {
  const result: unknown[] = [node(pair.first, end, owner), pair.second];
  if (hint) result.push(hintNode(hint, owner, atEnd));
  return result;
}
/** Observes actual original-owned arrays, scalar data and endpoints. @param owner - Live native owner. @returns Complete defined state. */
function snapshot(owner: multi_type_vector<Handler>): OwnerState {
  const s = owner["m_block_store"];
  return [
    owner.size(),
    owner.block_size(),
    owner.empty(),
    [owner.event_handler().tag, owner.event_handler().log !== null],
    [
      s.positions.snapshot(),
      s.sizes.snapshot(),
      s.element_blocks.snapshot().map(id),
      [s.positions.capacity(), s.sizes.capacity(), s.element_blocks.capacity()],
    ],
    s.element_blocks
      .snapshot()
      .map(
        /** Observes all live blocks only. @param data - Pointer. @returns Payload. */ (data) =>
          data ? payload(data) : null,
      ),
    [
      node(owner.begin(), owner.end(), owner),
      node(owner.end(), owner.end(), owner),
      node(owner.cbegin(), owner.cend(), owner),
      node(owner.cend(), owner.cend(), owner),
      node(owner.rbegin(), owner.rend(), owner),
      node(owner.rend(), owner.rend(), owner),
      node(owner.crbegin(), owner.crend(), owner),
      node(owner.crend(), owner.crend(), owner),
    ],
  ];
}
/** Records every live owner and complete original callback/equality order. @param owners - Three native slots. @param result - Caller result. @param stable - Handler-field identity. @returns Full record. */
function record(
  owners: (multi_type_vector<Handler> | null)[],
  result: unknown,
  stable: boolean,
): State {
  const equal: unknown[] = [];
  for (const a of owners)
    for (const b of owners) equal.push(a && b ? [a.equals(b), a.not_equals(b)] : null);
  return [
    result,
    stable,
    owners.map(
      /** Captures each actual live owner. @param owner - Owner. @returns State. */ (owner) =>
        owner ? snapshot(owner) : null,
    ),
    equal,
    log.map(
      /** Copies the complete event tuple. @param e - Callback. @returns Value tuple. */ (e) => [
        ...e,
      ],
    ),
  ];
}
/** Reconstructs an exact captured original compound input using real existing owners, solely as caller fixture loading; public set is not claimed ported. @param initial - Native input state prepared by original set. @returns Actual precondition owner. */
function loadSeed(initial: OwnerState): multi_type_vector<Handler> {
  const owner = new multi_type_vector(Traits, Events, initial[0]);
  const s = owner["m_block_store"];
  s.clear();
  s.positions.reserve(initial[4][3][0] as number);
  s.sizes.reserve(initial[4][3][1] as number);
  s.element_blocks.reserve(initial[4][3][2] as number);
  for (let i = 0; i < initial[4][0].length; ++i) {
    const p = initial[5][i];
    let data: base_element_block | null = null;
    if (p) {
      const B = aliases[p[0]] as BlockType;
      const input = p[3].map(
        /** Retains explicit source scalar values. @param v - Raw value. @returns Typed native value. */ (
          v,
        ) => (p[0] === 7 || p[0] === 8 ? BigInt(v as string) : v),
      );
      const arr = new delayed_delete_vector<DelayedVectorValue>(
        (callbacks[p[0]] as ContainerCallbacks).mdds_mtv_get_empty_value(),
        input,
      );
      data = B.create_block_with_values(arr.begin(), arr.end());
      B.get(data).store().reserve(p[2]);
      id(data);
    }
    s.push_back(initial[4][0][i] as number, initial[4][1][i] as number, data);
  }
  return owner;
}

describe("original SoA container lifetime", /** Declares original native ownership acceptance. @returns Nothing. */ () => {
  it("matches every complete original constructor operator iterator and destructor sequence", /** Replays all unchanged native outputs through actual shared ownership. @returns Nothing. */ () => {
    for (const c of fixture.cases) {
      operationCalls = null;
      nextHandler = 1;
      nextToken = 0;
      log = [];
      tokens = new Map();
      const owners: (multi_type_vector<Handler> | null)[] = [null, null, null];
      const hints: (iterator_base<multi_type_vector<Handler>> | null)[] = [null, null, null];
      const constHints: (const_iterator_base<multi_type_vector<Handler>> | null)[] = [
        null,
        null,
        null,
      ];
      const initial = fixture.snapshots[c.states[0] as number] as unknown as State;
      if (c.seed >= 0) owners[0] = loadSeed(initial[2][0] as OwnerState);
      expect(record(owners, null, true)).toEqual(initial);
      for (let step = 0; step < c.commands.length; ++step) {
        const cmd = c.commands[step] as (number | string)[];
        const op = cmd[0],
          dst = cmd[1] as number,
          args = cmd.slice(2);
        let result: unknown = null,
          stable = true;
        const before = owners[dst]?.event_handler();
        const source = owners[args[0] as number] as multi_type_vector<Handler>;
        const destination = owners[dst] as multi_type_vector<Handler>;
        /** Matches native unique_ptr replacement evaluation before destroying its prior owner. @param owner - Completed constructor. @returns Nothing. */
        function replace(owner: multi_type_vector<Handler>): void {
          owners[dst]?.dispose();
          owners[dst] = owner;
        }
        try {
          if (op === "D") replace(new multi_type_vector(Traits, Events));
          else if (op === "Z") replace(new multi_type_vector(Traits, Events, args[0] as number));
          else if (op === "F")
            replace(
              new multi_type_vector(
                Traits,
                Events,
                args[0] as number,
                callbacks[args[1] as number] as ContainerCallbacks,
                value(args[1] as number, args[2] as string),
              ),
            );
          else if (op === "R") {
            const type = args[1] as number;
            const input = new delayed_delete_vector<DelayedVectorValue>(
              (callbacks[type] as ContainerCallbacks).mdds_mtv_get_empty_value(),
              args[3] as number,
              value(type, args[2] as string),
            );
            replace(
              new multi_type_vector(
                Traits,
                Events,
                args[0] as number,
                callbacks[type] as ContainerCallbacks,
                input.begin(),
                input.end(),
              ),
            );
          } else if (op === "H" || op === "h") {
            const handler = new Handler();
            handler.tag = args[0] as number;
            replace(
              op === "H"
                ? new multi_type_vector(Traits, Events, handler)
                : multi_type_vector.from_moved_event(Traits, Events, handler),
            );
            result = handler.log !== null;
          } else if (op === "Q") replace(new multi_type_vector(Traits, Events, source));
          else if (op === "L") replace(source.clone());
          else if (op === "M") replace(multi_type_vector.move(source));
          else if (op === "A") {
            destination.assign(source);
            stable = before === destination.event_handler();
          } else if (op === "V") {
            destination.assign_move(source);
            stable = before === destination.event_handler();
          } else if (op === "W") {
            const otherBefore = source.event_handler();
            destination.swap(source);
            stable =
              before === destination.event_handler() && otherBefore === source.event_handler();
          } else if (op === "a" || op === "c") {
            operationCalls = [];
            try {
              const type = args[op === "a" ? 0 : 1] as number;
              const cell = value(type, args[op === "a" ? 1 : 2] as string);
              const family = callbacks[type] as ContainerCallbacks;
              if (op === "a")
                result = [
                  node(destination.push_back(cell, family), destination.end(), destination),
                  operationCalls,
                ];
              else {
                destination["create_new_block_with_new_cell"](args[0] as number, cell, family);
                result = operationCalls;
              }
            } finally {
              operationCalls = null;
            }
          } else if (op === "f") {
            const failure = {
              ...standard.boolean_element_callbacks,
              /** Actual native custom failure-cell ADL returns nullptr; its unused append callback remains the existing scalar owner. @returns Original null creation failure. */
              mdds_mtv_create_new_block() {
                return null as unknown as ReturnType<
                  typeof standard.boolean_element_callbacks.mdds_mtv_create_new_block
                >;
              },
            };
            destination.push_back(true, failure);
          } else if (op === "Y") {
            operationCalls = [];
            try {
              destination.resize(args[0] as number);
              result = operationCalls;
            } finally {
              operationCalls = null;
            }
          } else if (op === "y")
            result = node(destination.push_back_empty(), destination.end(), destination);
          else if (op === "C") destination.clear();
          else if (op === "S") destination.shrink_to_fit();
          else if (op === "U") {
            destination.dispose();
            owners[dst] = null;
          } else if (op === "J" || op === "j") {
            if (op === "J") {
              const hint = source.begin().advance(args[1] as number);
              hints[dst] = hint;
              result = hintNode(hint, source);
            } else {
              const hint = source.cbegin().advance(args[1] as number);
              constHints[dst] = hint;
              result = hintNode(hint, source);
            }
          } else if (op === "N") {
            hints[dst] = null;
            constHints[dst] = null;
          } else {
            const row = typeof args[0] === "string" ? BigInt(args[0]) : (args[0] as number);
            if (op === "B" || op === "O") {
              const pos = destination.position(row);
              const ret =
                op === "B"
                  ? multi_type_vector.next_position(pos)
                  : multi_type_vector.advance_position(pos, args[1] as number);
              result = [
                positionResult(ret, destination.end(), destination),
                positionResult(pos, destination.end(), destination),
              ];
            } else if (op === "b" || op === "o") {
              const pos = destination.cposition(row);
              const ret =
                op === "b"
                  ? multi_type_vector.next_position(pos)
                  : multi_type_vector.advance_position(pos, args[1] as number);
              result = [
                positionResult(ret, destination.cend(), destination),
                positionResult(pos, destination.cend(), destination),
              ];
            } else if (op === "l")
              result = multi_type_vector.logical_position(destination.cposition(row));
            else if (op === "X") {
              const got = multi_type_vector.get(
                destination.cposition(row),
                aliases[args[1] as number] as BlockType,
              );
              result = typeof got === "bigint" ? got.toString() : got;
            } else if (op === "T") result = destination.get_type(row);
            else if (op === "E") result = destination.is_empty(row);
            else if (op === "G" || op === "g") {
              const got = destination.get(row, callbacks[args[1] as number] as ContainerCallbacks);
              result = typeof got === "bigint" ? got.toString() : got;
            } else if (op === "P")
              result = positionResult(destination.position(row), destination.end(), destination);
            else if (op === "p")
              result = positionResult(destination.cposition(row), destination.cend(), destination);
            else if (op === "I" || op === "i") {
              const other = owners[args[1] as number] as multi_type_vector<Handler>;
              const index = args[2] as number;
              if (op === "I") {
                const hint = other.begin().advance(index);
                result = positionResult(
                  destination.position(hint, row),
                  destination.end(),
                  destination,
                  hint,
                  index === other.block_size(),
                );
              } else {
                const hint = other.cbegin().advance(index);
                result = positionResult(
                  destination.cposition(hint, row),
                  destination.cend(),
                  destination,
                  hint,
                  index === other.block_size(),
                );
              }
            } else if (op === "K") {
              const hint = hints[args[1] as number] as iterator_base<multi_type_vector<Handler>>;
              result = positionResult(
                destination.position(hint, row),
                destination.end(),
                destination,
                hint,
              );
            } else if (op === "k") {
              const hint = constHints[args[1] as number] as const_iterator_base<
                multi_type_vector<Handler>
              >;
              result = positionResult(
                destination.cposition(hint, row),
                destination.cend(),
                destination,
                hint,
              );
            }
          }
        } catch (error) {
          expect(error).toBeInstanceOf(
            op === "R" ? invalid_arg_error : op === "f" ? general_error : RangeError,
          );
          result = (error as Error).message;
        }
        expect(record(owners, result, stable)).toEqual(
          fixture.snapshots[c.states[step + 1] as number],
        );
      }
      for (const owner of owners) owner?.dispose();
      expect(log).toEqual(c.finalEvents);
    }
  });
  it("reuses the actual default empty event owner with stable value fields", /** Checks original empty event value witnesses over real containers. @returns Nothing. */ () => {
    const a = new multi_type_vector(
      standard.standard_element_blocks_traits,
      empty_event_value_ops,
      3,
      standard.string_element_callbacks,
      "v",
    );
    const handler = a.event_handler();
    const b = new multi_type_vector(a.Traits, empty_event_value_ops, a);
    const cloned = a.clone();
    const moved = multi_type_vector.move(cloned);
    expect(cloned.size()).toBe(3);
    expect(cloned.empty()).toBe(true);
    a.swap(b);
    expect(a.event_handler()).toBe(handler);
    a.assign_move(a);
    a.assign(a);
    expect(a.equals(b)).toBe(true);
    for (const owner of [a, b, cloned, moved]) owner.dispose();
  });
});
