/** @fileoverview Source-derived real AttributeList order,copy,interface append,first-match and signed16 value cases. */
import { expect, it } from "vitest";
import { AttributeList } from "../../inc/attributelist";
import { unicode } from "../../../test/fixtures/manifest";
/** Reads native text and ends a returned value scope. @param value - Actual string. @returns Text. */
function text(value: ReturnType<typeof unicode>): string {
  try {
    return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
  } finally {
    value.dispose();
  }
}
it("copies actual attribute values and preserves first-match duplicates and independent mutations", /** Runs actual owners. @returns Nothing. */ () => {
  const a = new AttributeList(),
    name = unicode("a"),
    value = unicode('<&"'),
    other = unicode("b");
  a.AddAttribute(name, value);
  a.AddAttribute(name, other);
  const b = a.createClone();
  expect(a.getLength()).toBe(2);
  expect(a.GetIndexByName(name)).toBe(0);
  expect(text(a.getValueByName(name))).toBe('<&"');
  expect(text(a.getTypeByIndex(999))).toBe("CDATA");
  expect(text(a.getTypeByName(other))).toBe("CDATA");
  b.SetValueByIndex(0, other);
  b.RenameAttributeByIndex(0, other);
  expect(text(b.getNameByIndex(0))).toBe("b");
  expect(text(a.getNameByIndex(0))).toBe("a");
  expect(text(a.getValueByIndex(0))).toBe('<&"');
  expect(text(b.getValueByIndex(0))).toBe("b");
  b.RemoveAttributeByIndex(0);
  expect(text(b.getValueByName(name))).toBe("b");
  a.RemoveAttribute(name);
  expect(text(a.getValueByName(name))).toBe("b");
  a.RemoveAttribute(name);
  a.RemoveAttribute(name);
  expect(a.GetIndexByName(name)).toBe(-1);
  expect(text(a.getValueByName(name))).toBe("");
  b.Clear();
  expect(b.getLength()).toBe(0);
  name.dispose();
  value.dispose();
  other.dispose();
});
it("copies foreign SAX interface lists through their real methods and captures self-append length", /** A forwarding interface remains a real attribute-list contract. @returns Nothing. */ () => {
  const a = new AttributeList(),
    key = unicode("x"),
    value = unicode("y");
  a.AddAttribute(key, value);
  const foreign = {
    getLength: a.getLength.bind(a),
    getNameByIndex: a.getNameByIndex.bind(a),
    getValueByIndex: a.getValueByIndex.bind(a),
    getTypeByIndex: a.getTypeByIndex.bind(a),
    getTypeByName: a.getTypeByName.bind(a),
    getValueByName: a.getValueByName.bind(a),
  };
  const copy = new AttributeList(foreign);
  expect(copy.getLength()).toBe(1);
  copy.AppendAttributeList(copy);
  expect(copy.getLength()).toBe(2);
  expect(text(copy.getValueByIndex(1))).toBe("y");
  expect(text(copy.getValueByName(key))).toBe("y");
  a.Clear();
  copy.Clear();
  key.dispose();
  value.dispose();
});
it("retains native name preconditions but copy and rename do not repeat AddAttribute validation", /** No invented duplicate-name rejection. @returns Nothing. */ () => {
  const list = new AttributeList(),
    empty = unicode(""),
    bad = unicode("a:b:c"),
    qualified = unicode("a:b"),
    expanded = unicode("urn:some:namespace^x"),
    value = unicode("v");
  expect(
    /** Invalid native empty name. @returns Nothing. */ () => list.AddAttribute(empty, value),
  ).toThrow("empty attribute");
  expect(
    /** Invalid native colon count. @returns Nothing. */ () => list.AddAttribute(bad, value),
  ).toThrow("too many colons");
  list.AddAttribute(qualified, value);
  list.AddAttribute(expanded, value);
  list.RenameAttributeByIndex(0, empty);
  const copy = new AttributeList(list);
  expect(text(copy.getNameByIndex(0))).toBe("");
  expect(copy.getLength()).toBe(2);
  list.Clear();
  copy.Clear();
  for (const s of [empty, bad, qualified, expanded, value]) s.dispose();
});
it("narrows native signed16 counts and query indices while named erasure still uses the full vector", /** Valid named operations beyond short index range. @returns Nothing. */ () => {
  const list = new AttributeList(),
    key = unicode("x"),
    last = unicode("last"),
    value = unicode("v");
  for (let i = 0; i < 32768; ++i) list.AddAttribute(key, value);
  list.AddAttribute(last, value);
  expect(list.getLength()).toBe(-32767);
  expect(list.GetIndexByName(last)).toBe(-32768);
  expect(text(list.getValueByName(last))).toBe("v");
  list.RemoveAttribute(last);
  expect(list.GetIndexByName(last)).toBe(-1);
  expect(list.getLength()).toBe(-32768);
  list.Clear();
  key.dispose();
  last.dispose();
  value.dispose();
});
