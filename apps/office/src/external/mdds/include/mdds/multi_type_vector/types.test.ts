/** @fileoverview Complete original unmanaged block native replay and explicit template/default/reference diagnostics. */
import { describe, expect, it } from "vitest";
import fixture from "./native-element-block-cases.json";
import * as standard from "./standard_element_blocks.ts";
import {
  default_element_block,
  element_block,
  element_block_error,
  get_block_type,
  element_type_empty,
  element_type_reserved_start,
  element_type_reserved_end,
  element_type_user_start,
  lu_factor_t,
  trace_method_t,
  trace_method_properties_t,
} from "./types.ts";
import {
  delayed_delete_vector,
  type delayed_delete_vector_iterator,
  type DelayedVectorValue,
} from "./delayed_delete_vector.ts";
import {
  general_error,
  invalid_arg_error,
  size_error,
  type_error,
  integrity_error,
} from "../global.ts";
/** Explicit erased native scalar specialization type. */
type BlockType = ReturnType<typeof default_element_block<DelayedVectorValue>>;
/** Initialized owner values. */
type Owner = element_block<DelayedVectorValue>;
/** Collects an original iterator range. @param first - Begin. @param last - End. @returns Values. */
function collect(
  first: delayed_delete_vector_iterator<DelayedVectorValue>,
  last: delayed_delete_vector_iterator<DelayedVectorValue>,
): DelayedVectorValue[] {
  const values: DelayedVectorValue[] = [];
  for (; !first.equals(last); first.advance(1)) values.push(first.get());
  return values;
}
/** Retains exact native64 text encoding. @param value - Scalar. @returns Portable scalar. */
function normalize(value: DelayedVectorValue): string | number | boolean {
  return typeof value === "bigint" ? value.toString() : value;
}
/** Observes the complete original public scalar owner. @param Block - Specialization. @param owner - Owner. @param kind - Type name. @returns Native snapshot. */
function snapshot(Block: BlockType, owner: Owner, kind: string) {
  const forward = collect(Block.cbegin(owner), Block.cend(owner)).map(normalize);
  const reverse = collect(Block.crbegin(owner), Block.crend(owner)).map(normalize);
  expect(collect(Block.begin(owner), Block.end(owner)).map(normalize)).toEqual(forward);
  expect(collect(Block.rbegin(owner), Block.rend(owner)).map(normalize)).toEqual(reverse);
  const range = Block.range(owner);
  const at =
    kind === "boolean"
      ? null
      : forward.map(
          /** Reads each native checked scalar. @param value - Existing scalar. @param index - Position. @returns Scalar. */ (
            _value,
            index,
          ) => normalize(Block.at(owner, index)),
        );
  return [
    get_block_type(owner),
    Block.size(owner),
    Block.capacity(owner),
    forward,
    reverse,
    collect(range.begin(), range.end()).map(normalize),
    at,
  ];
}
describe("original scalar element blocks", /** Defines portable source contract cases. @returns Nothing. */ () => {
  it("matches every unchanged native scalar block sequence", /** Replays every native step and complete owner result. @returns Nothing. */ () => {
    const aliases: Record<string, unknown> = {
      boolean: standard.boolean_element_block,
      int8: standard.int8_element_block,
      uint8: standard.uint8_element_block,
      int16: standard.int16_element_block,
      uint16: standard.uint16_element_block,
      int32: standard.int32_element_block,
      uint32: standard.uint32_element_block,
      int64: standard.int64_element_block,
      uint64: standard.uint64_element_block,
      float: standard.float_element_block,
      double: standard.double_element_block,
      string: standard.string_element_block,
    };
    let count = 0;
    for (const sample of fixture.cases) {
      const Block = aliases[sample.kind] as BlockType;
      const value =
        /** Adapts native scalar call input. @param text - Input. @returns Native scalar syntax. */ (
          text: string,
        ): DelayedVectorValue =>
          sample.kind === "string"
            ? text
            : sample.kind === "boolean"
              ? Boolean(Number(text))
              : sample.kind === "int64" || sample.kind === "uint64"
                ? BigInt(text)
                : Number(text);
      const a: Owner[] = [new Block(), new Block()];
      for (const [index, command] of sample.operations.entries()) {
        const [op, t, n, v, start, len] = command as [
          string,
          number,
          number | string,
          number | string,
          number,
          number,
        ];
        const owner = a[t] as Owner;
        let result: unknown = null;
        if (op === "N") a[t] = new Block();
        else if (op === "C") a[t] = Block.create_block(n as number);
        else if (op === "F") a[t] = Block.create_block_with_value(n as number, value(v as string));
        else if (op === "P") Block.append_value(owner, value(n as string));
        else if (op === "M") Block.emplace_back_value(owner, value(n as string));
        else if (op === "B") Block.prepend_value(owner, value(n as string));
        else if (op === "V") Block.set_value(owner, n as number, value(v as string));
        else if (op === "G")
          result = [
            normalize(Block.get_value(owner, n as number)),
            normalize(Block.get_value(owner, n as number)),
          ];
        else if (op === "E") Block.erase_value(owner, n as number);
        else if (op === "X") Block.erase_values(owner, n as number, v as number);
        else if (op === "O") Block.overwrite_values(owner, n as number, v as number);
        else if (op === "Z") Block.resize_block(owner, n as number);
        else if (op === "R") Block.reserve(owner, n as number);
        else if (op === "H") Block.shrink_to_fit(owner);
        else if (op === "p") Block.print_block(owner);
        else if (op === "d") {
          const pointer = sample.kind === "boolean" ? Block.begin(owner) : Block.data(owner);
          result = normalize(pointer.get());
          pointer.set(Block.convert(value(n as string)));
        } else if (op === "A") Block.append_block(owner, a[n as number] as Owner);
        else if (op === "Q") a[t] = Block.copy_block(a[n as number] as Owner);
        else if (op === "W") a[t] = Block.clone_block(a[n as number] as Owner);
        else if (op === "S")
          Block.swap_values(owner, a[n as number] as Owner, v as number, start, len);
        else if (op === "L")
          Block.append_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else if (op === "J")
          Block.assign_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else if (op === "K")
          Block.prepend_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else {
          const withPosition = op === "U" || op === "I";
          const source = a[(withPosition ? v : n) as number] as Owner;
          const first = Block.cbegin(source).advance((withPosition ? start : v) as number);
          const last = first.copy().advance(withPosition ? len : start);
          if (op === "U") Block.set_values(owner, n as number, first, last);
          else if (op === "T") Block.append_values(owner, first, last);
          else if (op === "Y") Block.prepend_values(owner, first, last);
          else if (op === "D") Block.assign_values(owner, first, last);
          else if (op === "I") Block.insert_values(owner, n as number, first, last);
          else a[t] = Block.create_block_with_values(first, last);
        }
        const step = sample.steps[index] as [unknown, number, number, boolean, boolean];
        expect(
          [
            result,
            snapshot(Block, a[0] as Owner, sample.kind),
            snapshot(Block, a[1] as Owner, sample.kind),
            Block.equal_block(a[0] as Owner, a[1] as Owner),
            (a[0] as Owner).not_equals(a[1] as Owner),
          ],
          `${sample.kind} ${count} ${index} ${command}`,
        ).toEqual([
          step[0],
          fixture.snapshots[step[1]],
          fixture.snapshots[step[2]],
          step[3],
          step[4],
        ]);
      }
      Block.delete_block(a[0] as Owner);
      Block.delete_block(a[1] as Owner);
      Block.delete_block(null);
      ++count;
    }
    expect(count).toBe(fixture.cases.length);
  });
  it("matches original mixed double input range conversions", /** Compares genuine InputIt-to-ValueT conversion without invalid floating casts. @returns Nothing. */ () => {
    const aliases: Record<string, unknown> = {
      boolean: standard.boolean_element_block,
      int8: standard.int8_element_block,
      uint8: standard.uint8_element_block,
      int16: standard.int16_element_block,
      uint16: standard.uint16_element_block,
      int32: standard.int32_element_block,
      uint32: standard.uint32_element_block,
      float: standard.float_element_block,
      double: standard.double_element_block,
    };
    for (const [kind, expected] of fixture.mixed as [string, unknown[]][]) {
      const Block = aliases[kind] as BlockType;
      const source = new delayed_delete_vector<DelayedVectorValue>(0, [125.5, 0.1, 3.25]);
      const owner = Block.create_block_with_values(source.begin(), source.end());
      const observed = [snapshot(Block, owner, kind)];
      Block.set_values(owner, 0, source.begin(), source.end());
      observed.push(snapshot(Block, owner, kind));
      Block.append_values(owner, source.begin(), source.end());
      observed.push(snapshot(Block, owner, kind));
      Block.prepend_values(owner, source.begin(), source.end());
      observed.push(snapshot(Block, owner, kind));
      Block.insert_values(owner, 2, source.begin(), source.end());
      observed.push(snapshot(Block, owner, kind));
      Block.assign_values(owner, source.begin(), source.end());
      observed.push(snapshot(Block, owner, kind));
      expect(observed, kind).toEqual(expected);
    }
  });
  it("preserves scalar conversions, borrowed range storage and public diagnostics", /** Checks independent original boundary semantics. @returns Nothing. */ () => {
    const Block = standard.double_element_block;
    const a = new Block([1, 2, 3, 4]);
    const range = Block.range(a);
    Block.erase_value(a, 0);
    expect(range.begin().get()).toBe(2);
    Block.swap_values(a, a, 0, 1, 2);
    expect(collect(Block.begin(a), Block.end(a))).toEqual([3, 4, 2]);
    const copy = Block.copy_block(a);
    Block.set_value(copy, 0, 8);
    expect(Block.get_value(a, 0)).toBe(3);
    expect(Block.get_value(copy, 0)).toBe(8);
    const external = new delayed_delete_vector<number>(0, [125.5, 0.1, 3.25]);
    const uint8 = standard.uint8_element_block.create_block_with_values(
      external.begin(),
      external.end(),
    );
    expect(
      collect(standard.uint8_element_block.begin(uint8), standard.uint8_element_block.end(uint8)),
    ).toEqual([125, 0, 3]);
    const float = standard.float_element_block.create_block_with_value(2, 0.1);
    standard.float_element_block.assign_values(float, external.begin().advance(1), external.end());
    expect(standard.float_element_block.get_value(float, 0)).toBe(Math.fround(0.1));
    const Debug = default_element_block<number>(
      10,
      0,
      /** Preserves double scalar. @param value - Scalar. @returns Native double. */ (value) =>
        value,
      true,
    );
    expect(Debug.get(new Debug()).store().size()).toBe(0);
    expect(
      /** Calls original debug type mismatch. @returns Typed owner or throws. */ () =>
        Debug.get(new standard.uint16_element_block()),
    ).toThrow("incorrect block type: expected block type=10, passed block type=4");
    expect(
      /** Calls first native bounds diagnostic. @returns Nothing or throws. */ () =>
        Block.swap_values(a, a, 2, 0, 2),
    ).toThrow("pos1 + len <= st1.size()");
    expect(
      /** Calls second native bounds diagnostic. @returns Nothing or throws. */ () =>
        Block.swap_values(a, a, 0, 2, 2),
    ).toThrow("pos2 + len <= st2.size()");
    expect(
      /** Calls source bounds diagnostic. @returns Nothing or throws. */ () =>
        Block.append_values_from_block(a, copy, 0, 4),
    ).toThrow("begin_pos + len <= array.size()");
    expect(
      /** Calls native checked at failure. @returns Scalar or throws. */ () => Block.at(a, 3),
    ).toThrow(RangeError);
    expect(element_type_empty).toBe(-1);
    expect(element_type_reserved_start).toBe(0);
    expect(element_type_reserved_end).toBe(49);
    expect(element_type_user_start).toBe(50);
    expect(lu_factor_t.avx2_x64_lu8).toBe(520);
    expect(trace_method_t.mutator_with_pos_hint).toBe(258);
    expect(new trace_method_properties_t()).toMatchObject({
      type: 0,
      instance: null,
      function_name: null,
      function_args: "",
      filepath: null,
      line_number: -1,
    });
    for (const ErrorType of [
      general_error,
      invalid_arg_error,
      size_error,
      type_error,
      integrity_error,
      element_block_error,
    ]) {
      const error = new ErrorType("original diagnostic");
      expect(error).toBeInstanceOf(general_error);
      expect(error.what()).toBe("original diagnostic");
    }
  });
});
