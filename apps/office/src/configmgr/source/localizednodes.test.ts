/** @fileoverview Real localized setting nodes preserve schema, value, modified and clone behavior over existing shared owners. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { Type, getDynamicType } from "./type";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";

/** Creates a fixed test description/key as an actual owned string. @param value - Exact ASCII literal. @returns String owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Extracts an actual boolean Any with its real public contract. @param value - Actual owner. @returns Boolean. */
function boolean(value: Any): boolean {
  const output: [boolean] = [false];
  expect(value.extract(output, "bool")).toBe(true);
  return output[0];
}

it("keeps real localized Any ownership stable across value and pointer modifications", /** Checks default/value construction, independent input copies and self-value metadata updates. @returns Nothing. */ () => {
  const empty = new LocalizedValueNode(-2147483648);
  expect([
    empty.kind(),
    empty.getLayer(),
    empty.getFinalized(),
    empty.getMandatory(),
    empty.isModified(),
  ]).toEqual([2, -2147483648, SAL_MAX_INT32, SAL_MAX_INT32, false]);
  expect(getDynamicType(empty.getValue())).toBe(Type.TYPE_NIL);
  expect(empty.getTemplateName().equals(u("*"))).toBe(true);
  const input = new Any(true);
  const node = new LocalizedValueNode(0, input);
  input.assign(new Any(false));
  const value = node.getValue();
  expect(value).not.toBe(input);
  expect(node.getValue()).toBe(value);
  expect(boolean(value)).toBe(true);
  node.setValue(1, new Any(false), true);
  expect([node.getLayer(), node.isModified(), boolean(value)]).toEqual([1, true, false]);
  node.setValue(2, value, false);
  expect(node.getValue()).toBe(value);
  expect([node.getLayer(), node.isModified(), boolean(value)]).toEqual([2, false, false]);
  const pointer = node.getValuePtr(3, true);
  expect(pointer).toBe(value);
  pointer.assign(new Any(true));
  expect([node.getLayer(), node.isModified(), boolean(node.getValue())]).toEqual([3, true, true]);
  expect(node.getValuePtr(4, false)).toBe(value);
  expect([node.getLayer(), node.isModified()]).toEqual([4, false]);
});

it("clones localized values independently while retaining modified metadata and dropping descriptions", /** Both original clone modes ignore their flag and preserve the wildcard template. @returns Nothing. */ () => {
  for (const modified of [false, true]) {
    const source = new LocalizedValueNode(1, new Any(true));
    source.getValuePtr(2, modified);
    source.setFinalized(7);
    source.setDescription(u("schema description"));
    for (const keep of [false, true]) {
      const clone = source.clone(keep);
      expect(clone).not.toBe(source);
      expect(clone.getValue()).not.toBe(source.getValue());
      expect([clone.getLayer(), clone.getFinalized(), clone.isModified()]).toEqual([
        2,
        7,
        modified,
      ]);
      expect(clone.getDescription().isEmpty()).toBe(true);
      expect(clone.getTemplateName().equals(u("*"))).toBe(true);
      expect(boolean(clone.getValue())).toBe(true);
      clone.setValue(3, new Any(false), !modified);
      expect(boolean(source.getValue())).toBe(true);
      expect(source.isModified()).toBe(modified);
    }
    expect(source.getDescription().equals(u("schema description"))).toBe(true);
  }
});

it("deep-clones actual localized property trees with original static types and nil flags", /** Uses real property/value children and inherited metadata/default methods. @returns Nothing. */ () => {
  for (let type = Type.TYPE_ANY; type <= Type.TYPE_HEXBINARY_LIST; type++) {
    for (const nillable of [false, true]) {
      const property = new LocalizedPropertyNode(1, type, nillable);
      expect([property.kind(), property.getStaticType(), property.isNillable()]).toEqual([
        1,
        type,
        nillable,
      ]);
      expect(property.getMembers()).toBe(property.getMembers());
      expect(property.getMembers().empty()).toBe(true);
      const child = new LocalizedValueNode(2, new Any(true));
      child.getValuePtr(3, true);
      property.getMembers().insert({ first: u("en-US"), second: child });
      property.setFinalized(5);
      property.setDescription(u("localized schema"));
      for (const keep of [false, true]) {
        const copy = property.clone(keep);
        expect([
          copy.getLayer(),
          copy.getFinalized(),
          copy.getStaticType(),
          copy.isNillable(),
        ]).toEqual([1, 5, type, nillable]);
        expect(copy.getTemplateName().isEmpty()).toBe(true);
        expect(copy.getMandatory()).toBe(SAL_MAX_INT32);
        expect(copy.getDescription().isEmpty()).toBe(true);
        const copiedChild = copy.getMember(u("en-US")) as LocalizedValueNode;
        expect(copiedChild).not.toBe(child);
        expect(copiedChild.isModified()).toBe(true);
        copiedChild.setValue(4, new Any(false), false);
        copy.getMembers().erase(u("en-US"));
        expect(property.getMember(u("en-US"))).toBe(child);
        expect(boolean(child.getValue())).toBe(true);
      }
    }
  }
});
