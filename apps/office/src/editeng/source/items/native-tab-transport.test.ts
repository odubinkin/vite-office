/** @fileoverview Original tabulator IDL values transported through the existing shared CPPU Any and Sequence owners. */
import { describe, expect, it } from "vitest";
import {
  TabStop,
  cppu_detail_getUnoType_TabStop as stopType,
} from "../../../offapi/com/sun/star/style/TabStop";
import {
  TabAlign,
  cppu_detail_getUnoType_TabAlign as alignType,
} from "../../../offapi/com/sun/star/style/TabAlign";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";

describe("original tabulator IDL transport", /** Groups generated value contracts. @returns Nothing. */ () => {
  it("preserves enum order, default zero chars and every native scalar conversion", /** Checks declaration values independent of SvxTabStop locale behavior. @returns Nothing. */ () => {
    expect([
      TabAlign.LEFT,
      TabAlign.CENTER,
      TabAlign.RIGHT,
      TabAlign.DECIMAL,
      TabAlign.DEFAULT,
      TabAlign.MAKE_FIXED_SIZE,
    ]).toEqual([0, 1, 2, 3, 4, 2147483647]);
    const value = new TabStop();
    expect([value.Position, value.Alignment, value.DecimalChar, value.FillChar]).toEqual([
      0,
      TabAlign.LEFT,
      0,
      0,
    ]);
    value.Position = 2147483648;
    value.Alignment = 4294967295 as TabAlign;
    value.DecimalChar = -1;
    value.FillChar = 65536;
    expect([value.Position, value.Alignment, value.DecimalChar, value.FillChar]).toEqual([
      -2147483648, -1, 65535, 0,
    ]);
    value.DecimalChar = 0xd800;
    value.FillChar = 0xdc00;
    expect(value.DecimalChar).toBe(0xd800);
    expect(value.FillChar).toBe(0xdc00);
    expect(value.get(0)).toBe(value.get(0));
    value.get(0)[0] = 123;
    expect(value.Position).toBe(123);
  });
  it("copies every field independently and retains stable member lvalues on assignment", /** Checks original generated copy and field equality. @returns Nothing. */ () => {
    const a = new TabStop(720, TabAlign.DECIMAL, 46, 95),
      b = new TabStop(a),
      c = new TabStop();
    expect(a.equals(b)).toBe(true);
    expect(a.notEquals(b)).toBe(false);
    const retained = c.get(8);
    expect(c.assign(a)).toBe(c);
    expect(c.get(8)).toBe(retained);
    expect(retained[0]).toBe(46);
    expect(c.assign(c)).toBe(c);
    expect(c.equals(a)).toBe(true);
    for (const candidate of [
      new TabStop(721, TabAlign.DECIMAL, 46, 95),
      new TabStop(720, TabAlign.LEFT, 46, 95),
      new TabStop(720, TabAlign.DECIMAL, 44, 95),
      new TabStop(720, TabAlign.DECIMAL, 46, 32),
    ])
      expect(a.notEquals(candidate)).toBe(true);
    b.FillChar = 46;
    expect(a.FillChar).toBe(95);
  });
  it("uses the real static enum and struct type bindings and detached Any values", /** Checks original typed scalar and compound transport. @returns Nothing. */ () => {
    expect(alignType().getTypeLibType()).toBe(alignType().getTypeLibType());
    expect(stopType().getTypeLibType()).toBe(stopType().getTypeLibType());
    const value = new TabStop(-720, TabAlign.RIGHT, 44, 95),
      input = new Any(),
      output = new TabStop();
    input.insert(value, stopType);
    value.Position = 22;
    expect(input.extract(output, stopType)).toBe(true);
    expect(output.equals(new TabStop(-720, TabAlign.RIGHT, 44, 95))).toBe(true);
    output.DecimalChar = 46;
    const another = new TabStop();
    expect(input.extract(another, stopType)).toBe(true);
    expect(another.DecimalChar).toBe(44);
    const alignment: [number] = [0];
    input.insert([TabAlign.DEFAULT], alignType);
    expect(input.extract(alignment, alignType)).toBe(true);
    expect(alignment[0]).toBe(TabAlign.DEFAULT);
    input.insert([65535], alignType);
    expect(input.extract(alignment, alignType)).toBe(true);
    expect(alignment[0]).toBe(65535);
    expect(input.extract(another, stopType)).toBe(false);
  });
  it("binds original Sequence<TabStop> to the existing compound owner", /** Checks actual shared sequence storage and typed Any exchange without a new allocator or lifetime implementation. @returns Nothing. */ () => {
    /** Original declared compound member addresses, whose offsets exist in the real type metadata. */
    type MemberAddress = {
      /** Reads an initialized declared member. @param offset - Native field offset. @returns Scalar cell. */
      get(offset: 0 | 4 | 8 | 10): [number];
    };
    const Stops = Sequence.specialize<MemberAddress>(stopType, 12),
      sequence = new Stops(1),
      value = sequence.operatorIndex(0);
    value.get(0)[0] = 720;
    value.get(4)[0] = TabAlign.CENTER;
    value.get(8)[0] = 46;
    value.get(10)[0] = 32;
    const input = new Any(),
      received = new Stops();
    input.insert([sequence.get()], ["Sequence", stopType]);
    expect(received.getAddress()).toBe(received.getAddress());
    expect(input.extract(received.getAddress(), ["Sequence", stopType])).toBe(true);
    expect(received.getLength()).toBe(1);
    const copied = received.operatorIndex(0);
    expect([copied.get(0)[0], copied.get(4)[0], copied.get(8)[0], copied.get(10)[0]]).toEqual([
      720,
      TabAlign.CENTER,
      46,
      32,
    ]);
    received.dispose();
    input.dispose();
    sequence.dispose();
  });
});
