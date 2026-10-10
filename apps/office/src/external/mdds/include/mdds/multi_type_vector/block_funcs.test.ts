/** @fileoverview Complete original unmanaged block native replay and explicit template/default/reference diagnostics. */
import { describe, expect, it } from "vitest";
import fixture from "./native-block-dispatch-cases.json";
import { element_block_funcs } from "./block_funcs.ts";
import * as standard from "./standard_element_blocks.ts";
import { default_element_block, element_block, get_block_type } from "./types.ts";
import {
  delayed_delete_vector,
  type delayed_delete_vector_iterator,
  type DelayedVectorValue,
} from "./delayed_delete_vector.ts";
import { general_error } from "../global.ts";
const Dispatch = element_block_funcs(
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
);
/** Explicit erased native scalar specialization type. */
type BlockType = ReturnType<typeof default_element_block<DelayedVectorValue>>;
/** Initialized owner values. */
type Callbacks = ReturnType<
  typeof import("./macro.ts").MDDS_MTV_DEFINE_ELEMENT_CALLBACKS<DelayedVectorValue>
>;
/** Initialized original scalar owner. */
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
    Dispatch.size(owner),
    Block.capacity(owner),
    forward,
    reverse,
    collect(range.begin(), range.end()).map(normalize),
    at,
    (
      standard[`${kind}_element_callbacks` as keyof typeof standard] as Callbacks
    ).mdds_mtv_get_element_type(
      (
        standard[`${kind}_element_callbacks` as keyof typeof standard] as Callbacks
      ).mdds_mtv_get_empty_value(),
    ),
    normalize(
      (
        standard[`${kind}_element_callbacks` as keyof typeof standard] as Callbacks
      ).mdds_mtv_get_empty_value(),
    ),
  ];
}
describe("original block dispatcher and callbacks", /** Defines portable source contract cases. @returns Nothing. */ () => {
  it("matches every unchanged native dispatcher and scalar callback sequence", /** Replays every native step and complete owner result. @returns Nothing. */ () => {
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
      const Callback = standard[
        `${sample.kind}_element_callbacks` as keyof typeof standard
      ] as Callbacks;
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
        else if (op === "C")
          a[t] = Dispatch.create_new_block(Block.block_type, n as number) as Owner;
        else if (op === "F")
          a[t] = Callback.mdds_mtv_create_new_block(n as number, value(v as string));
        else if (op === "P") Callback.mdds_mtv_append_value(owner, value(n as string));
        else if (op === "M")
          Callback.mdds_mtv_emplace_back_value(owner, value("0"), value(n as string));
        else if (op === "B") Callback.mdds_mtv_prepend_value(owner, value(n as string));
        else if (op === "V") Callback.mdds_mtv_set_value(owner, n as number, value(v as string));
        else if (op === "G")
          result = [
            normalize(Block.get_value(owner, n as number)),
            normalize(Callback.mdds_mtv_get_value(owner, n as number)),
          ];
        else if (op === "E") Dispatch.erase(owner, n as number);
        else if (op === "X") Dispatch.erase(owner, n as number, v as number);
        else if (op === "O") Dispatch.overwrite_values(owner, n as number, v as number);
        else if (op === "Z") Dispatch.resize_block(owner, n as number);
        else if (op === "R") Block.reserve(owner, n as number);
        else if (op === "H") Dispatch.shrink_to_fit(owner);
        else if (op === "p") Dispatch.print_block(owner);
        else if (op === "d") {
          const pointer = sample.kind === "boolean" ? Block.begin(owner) : Block.data(owner);
          result = normalize(pointer.get());
          pointer.set(Block.convert(value(n as string)));
        } else if (op === "A") Dispatch.append_block(owner, a[n as number] as Owner);
        else if (op === "Q") a[t] = Dispatch.copy_block(a[n as number] as Owner) as Owner;
        else if (op === "W") a[t] = Dispatch.clone_block(a[n as number] as Owner) as Owner;
        else if (op === "S")
          Dispatch.swap_values(owner, a[n as number] as Owner, v as number, start, len);
        else if (op === "L")
          Dispatch.append_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else if (op === "J")
          Dispatch.assign_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else if (op === "K")
          Dispatch.prepend_values_from_block(owner, a[n as number] as Owner, v as number, start);
        else {
          const withPosition = op === "U" || op === "I";
          const source = a[(withPosition ? v : n) as number] as Owner;
          const first = Block.cbegin(source).advance((withPosition ? start : v) as number);
          const last = first.copy().advance(withPosition ? len : start);
          if (op === "U") Callback.mdds_mtv_set_values(owner, n as number, value("0"), first, last);
          else if (op === "T") Callback.mdds_mtv_append_values(owner, value("0"), first, last);
          else if (op === "Y") Callback.mdds_mtv_prepend_values(owner, value("0"), first, last);
          else if (op === "D") Callback.mdds_mtv_assign_values(owner, value("0"), first, last);
          else if (op === "I")
            Callback.mdds_mtv_insert_values(owner, n as number, value("0"), first, last);
          else a[t] = Callback.mdds_mtv_create_new_block(value("0"), first, last);
        }
        const step = sample.steps[index] as [unknown, number, number, boolean, boolean];
        expect(
          [
            result,
            snapshot(Block, a[0] as Owner, sample.kind),
            snapshot(Block, a[1] as Owner, sample.kind),
            Dispatch.equal_block(a[0] as Owner, a[1] as Owner),
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
      Dispatch.delete_block(a[0] as Owner);
      Dispatch.delete_block(a[1] as Owner);
      Dispatch.delete_block(null);
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
  it("retains original dispatcher diagnostics and early returns", /** Checks genuine unknown mappings, type assertion and null behavior. @returns Nothing. */ () => {
    const Unknown = default_element_block<number>(
      77,
      0,
      /** Preserves scalar. @param v - Native value. @returns Scalar. */ (v) => v,
    );
    const unknown = new Unknown();
    const actions = [
      /** Calls original create_new_block unknown map. @returns Result or throws. */ () =>
        Dispatch.create_new_block(77, 0),
      /** Calls original copy_block unknown map. @returns Result or throws. */ () =>
        Dispatch.copy_block(unknown),
      /** Calls original clone_block unknown map. @returns Result or throws. */ () =>
        Dispatch.clone_block(unknown),
      /** Calls original delete_block unknown map. @returns Result or throws. */ () =>
        Dispatch.delete_block(unknown),
      /** Calls original resize_block unknown map. @returns Result or throws. */ () =>
        Dispatch.resize_block(unknown, 0),
      /** Calls original print_block unknown map. @returns Result or throws. */ () =>
        Dispatch.print_block(unknown),
      /** Calls original erase unknown map. @returns Result or throws. */ () =>
        Dispatch.erase(unknown, 0),
      /** Calls original erase unknown map. @returns Result or throws. */ () =>
        Dispatch.erase(unknown, 0, 0),
      /** Calls original append_block unknown map. @returns Result or throws. */ () =>
        Dispatch.append_block(unknown, unknown),
      /** Calls original append_values_from_block unknown map. @returns Result or throws. */ () =>
        Dispatch.append_values_from_block(unknown, unknown, 0, 0),
      /** Calls original assign_values_from_block unknown map. @returns Result or throws. */ () =>
        Dispatch.assign_values_from_block(unknown, unknown, 0, 0),
      /** Calls original prepend_values_from_block unknown map. @returns Result or throws. */ () =>
        Dispatch.prepend_values_from_block(unknown, unknown, 0, 0),
      /** Calls original swap_values unknown map. @returns Result or throws. */ () =>
        Dispatch.swap_values(unknown, unknown, 0, 0, 0),
      /** Calls original equal_block unknown map. @returns Result or throws. */ () =>
        Dispatch.equal_block(unknown, unknown),
      /** Calls original overwrite_values unknown map. @returns Result or throws. */ () =>
        Dispatch.overwrite_values(unknown, 0, 0),
      /** Calls original shrink_to_fit unknown map. @returns Result or throws. */ () =>
        Dispatch.shrink_to_fit(unknown),
      /** Calls original size unknown map. @returns Result or throws. */ () =>
        Dispatch.size(unknown),
    ];
    const errors = actions.map(
      /** Observes original general_error. @param action - Original call. @returns Message. */ (
        action,
      ) => {
        try {
          action();
          throw new Error("expected unknown handler");
        } catch (error) {
          expect(error).toBeInstanceOf(general_error);
          return (error as general_error).what();
        }
      },
    );
    const Empty = element_block_funcs();
    try {
      Empty.create_new_block(0, 0);
      throw new Error("expected empty map");
    } catch (error) {
      expect(error).toBeInstanceOf(general_error);
      errors.push((error as general_error).what());
    }
    expect([...errors, Dispatch.equal_block(unknown, new standard.double_element_block())]).toEqual(
      fixture.unknown,
    );
    expect(
      /** Deletes null without lookup. @returns Nothing. */ () => Empty.delete_block(null),
    ).not.toThrow();
    expect(
      /** Asserts original matching type precondition. @returns Nothing or throws. */ () =>
        Dispatch.swap_values(
          new standard.double_element_block(),
          new standard.uint16_element_block(),
          0,
          0,
          0,
        ),
    ).toThrow("blk1_type == get_block_type(blk2)");
    const Duplicate = element_block_funcs(
      standard.double_element_block,
      standard.double_element_block,
    );
    expect(Duplicate.size(Duplicate.create_new_block(10, 2))).toBe(2);
    const value = new standard.double_element_block([1, 2, 3]);
    const copied = Dispatch.copy_block(value) as Owner;
    standard.double_element_block.set_value(copied, 0, 9);
    expect(standard.double_element_block.get_value(value, 0)).toBe(1);
    expect(Dispatch.equal_block(value, copied)).toBe(false);
    expect(Dispatch.equal_block(value, value)).toBe(true);
  });
});
