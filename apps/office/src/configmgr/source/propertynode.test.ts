/** @fileoverview Original ordinary PropertyNode state/clone/external lookup histories over actual Any and string owners; external receiver doubles are test-only. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Type, getDynamicType } from "./type";
import { PropertyNode, type PropertyNodeComponents } from "./propertynode";
import { Data } from "./data";
/** Actual Unicode caller. @param value - Exact text. @returns Owner. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes a unit. @param c - Unit. @returns Numeric unit. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Test-only receiver that must never be called for local values. */
const none: PropertyNodeComponents = {
  getExternalValue: /** Flags an unintended lookup. @returns Never. */ () => {
    throw new Error("unexpected lookup");
  },
};
/** Reads an actual bool Any. @param value - Owner. @returns Bool. */
function bool(value: Any): boolean {
  const out: [boolean] = [false];
  expect(value.extract(out, "bool")).toBe(true);
  return out[0];
}
it("retains native ordinary property defaults and pointer/self-set metadata", /** Schema nil permission is diagnostic rather than an invented value gate. @returns Nothing. */ () => {
  const input = new Any(true),
    node = new PropertyNode(1, Type.TYPE_BOOLEAN, false, input, true),
    value = node.getValue(none);
  input.assign(new Any(false));
  expect(bool(value)).toBe(true);
  expect(value).not.toBe(input);
  expect([
    node.kind(),
    node.getStaticType(),
    node.isNillable(),
    node.isExtension(),
    node.isModified(),
    node.getLayer(),
    node.getMandatory(),
    node.getFinalized(),
  ]).toEqual([0, Type.TYPE_BOOLEAN, false, true, false, 1, Data.NO_LAYER, Data.NO_LAYER]);
  expect(node.getTemplateName().isEmpty()).toBe(true);
  expect(node.getValuePtr(2, true)).toBe(value);
  value.assign(new Any(false));
  expect([node.getLayer(), node.isModified(), bool(value)]).toEqual([2, true, false]);
  node.setValue(3, value, false);
  expect(node.getValue(none)).toBe(value);
  expect([node.getLayer(), node.isModified()]).toEqual([3, false]);
  const empty = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(), false);
  expect(empty.getValue(none).hasValue()).toBe(false);
});
it("clones ordinary properties independently, including pending external descriptors and native base-copy omission", /** Both clone modes preserve schema/modified state and pending lazy reads. @returns Nothing. */ () => {
  const original = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(true), true);
  original.getValuePtr(2, true);
  original.setDescription(u("schema"));
  original.setFinalized(7);
  const descriptor = u("service field");
  original.setExternal(3, descriptor);
  descriptor.assign(u("changed"));
  let calls = 0;
  const receiver: PropertyNodeComponents = {
    getExternalValue:
      /** Observes copied native descriptors. @param value - Borrowed descriptor. @returns Owning Optional fields. */ (
        value,
      ) => {
        expect(Array.from(value)).toEqual(Array.from(u("service field").getStr().subarray(0, 13)));
        calls++;
        return { IsPresent: true, Value: new Any(false) };
      },
  };
  for (const keep of [false, true]) {
    const clone = original.clone(keep);
    expect([
      clone.getLayer(),
      clone.getFinalized(),
      clone.isModified(),
      clone.isExtension(),
    ]).toEqual([3, 7, true, true]);
    expect(clone.getDescription().isEmpty()).toBe(true);
    expect(bool(clone.getValue(receiver))).toBe(false);
    clone.setValue(4, new Any(true), false);
    expect(bool(clone.getValue(none))).toBe(true);
  }
  expect(calls).toBe(2);
  expect(original.getDescription().equals(u("schema"))).toBe(true);
  expect(bool(original.getValue(receiver))).toBe(false);
  expect(calls).toBe(3);
  expect(original.isModified()).toBe(true);
});
it("retries throwing external lookups but clears descriptors after an absent response", /** Missing external values preserve the previous local value and modified marker. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(true), false);
  node.setExternal(2, u("service id"));
  let calls = 0;
  const receiver: PropertyNodeComponents = {
    getExternalValue:
      /** Emits source retry and absent cases. @param descriptor - Borrowed field. @returns Owning optional fields. */ (
        descriptor,
      ) => {
        expect(descriptor.length).toBe(10);
        calls++;
        if (calls === 1) throw new Error("external failure");
        return { IsPresent: false, Value: new Any() };
      },
  };
  expect(/** Invokes lazy lookup. @returns Any. */ () => node.getValue(receiver)).toThrow(
    "external failure",
  );
  expect(bool(node.getValue(receiver))).toBe(true);
  expect(bool(node.getValue(none))).toBe(true);
  expect([calls, node.getLayer(), node.isModified()]).toEqual([2, 2, false]);
});
it("retains unchecked external Any type and cancels pending descriptors on explicit value/pointer writes", /** Original TODO does not authorize schema-type validation or value reset. @returns Nothing. */ () => {
  const node = new PropertyNode(1, Type.TYPE_BOOLEAN, false, new Any(true), false);
  node.setExternal(2, u("service id"));
  const stable = node.getValuePtr(3, true);
  expect(bool(node.getValue(none))).toBe(true);
  node.setExternal(4, u("service id"));
  node.setValue(5, new Any(false), false);
  expect(node.getValue(none)).toBe(stable);
  expect(bool(stable)).toBe(false);
  node.setExternal(6, u("service id"));
  const receiver: PropertyNodeComponents = {
    getExternalValue:
      /** Returns a different actual Any type, as the source allows. @returns Owning optional fields. */ () => {
        const string = u("external");
        try {
          return { IsPresent: true, Value: new Any(string.getDataAddress(), "OUString") };
        } finally {
          string.dispose();
        }
      },
  };
  expect(node.getValue(receiver)).toBe(stable);
  expect(getDynamicType(stable)).toBe(Type.TYPE_STRING);
  expect(node.getStaticType()).toBe(Type.TYPE_BOOLEAN);
  expect(node.isModified()).toBe(false);
  expect(node.getValue(none)).toBe(stable);
});
