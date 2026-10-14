/** @fileoverview Source-backed configuration tree histories using actual RootNode/GroupNode owners. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { LengthContentsCompare } from "./config_map";
import { Node } from "./node";
import { NodeMap } from "./nodemap";
import { GroupNode } from "./groupnode";
import { RootNode } from "./rootnode";

/** Creates literal UTF16 values including embedded NUL/unpaired surrogates. @param value - Literal. @returns Actual string owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads actual UTF16 code units. @param value - Actual string. @returns JS value. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Creates an actual initialized group without a fake leaf/provider. @param layer - Visibility layer. @param template - Template value. @returns Group. */
function group(layer: number, template = "schema"): GroupNode {
  return new GroupNode(layer, true, u(template));
}

it("orders keys by UTF16 length first and binary code units second", /** Checks independently specified ordering, copied keys and duplicate identity. @returns Nothing. */ () => {
  const ordered = ["", "\0", "A", "a", "b", "\ud800", "a\0", "aa", "\ud800\udc00"];
  const map = new NodeMap();
  expect(map.empty()).toBe(true);
  expect(map.begin()).toBe(map.end());
  for (let i = 0; i < ordered.length; i++) {
    for (let j = 0; j < ordered.length; j++)
      expect(LengthContentsCompare(u(ordered[i] as string), u(ordered[j] as string))).toBe(i < j);
  }
  for (const key of [...ordered].reverse()) map.insert({ first: u(key), second: group(0) });
  expect(
    [...map].map(
      /** Reads ordered key. @param entry - Pair. @returns Key. */ (entry) => text(entry.first),
    ),
  ).toEqual(ordered);
  expect(text(map.begin()?.first as OUStringConstReference)).toBe("");
  const input = u("owned");
  const original = group(2);
  const [entry, inserted] = map.insert({ first: input, second: original });
  input.assign(u("other"));
  expect(inserted).toBe(true);
  expect(text(entry.first)).toBe("owned");
  const duplicate = map.insert({ first: u("owned"), second: group(4) });
  expect(duplicate).toEqual([entry, false]);
  expect(duplicate[0]).toBe(entry);
  expect(map.find(u("owned"))?.second).toBe(original);
  expect(map.find(u("other"))).toBeUndefined();
});

it("retains mutable value aliases while applying visibility layers and invalidating member cache", /** Exercises actual map mutation histories and key/cursor erasure. @returns Nothing. */ () => {
  const root = new RootNode();
  const map = root.getMembers();
  expect(root.getMembers()).toBe(map);
  expect(root.getMember(u("missing"))).toBeNull();
  expect(map.findNode(0, u("missing"))).toBeNull();
  const lvalue = map.getOrInsert(u("a"));
  expect(lvalue.second).toBeNull();
  expect(root.getMember(u("a"))).toBeNull();
  const first = group(3);
  lvalue.second = first;
  expect(map.findNode(2, u("a"))).toBeNull();
  expect(map.findNode(3, u("a"))).toBe(first);
  expect(map.findNode(4, u("a"))).toBe(first);
  first.setLayer(5);
  expect(map.findNode(4, u("a"))).toBeNull();
  expect(map.findNode(5, u("a"))).toBe(first);
  expect(map.getOrInsert(u("a"))).toBe(lvalue);
  const second = group(1);
  lvalue.second = second;
  expect(root.getMember(u("a"))).toBe(second);
  expect(map.findNode(1, u("a"))).toBe(second);
  map.insert({ first: u("b"), second: first });
  expect(map.findNode(5, u("b"))).toBe(first);
  expect(map.findNode(1, u("a"))).toBe(second);
  map.erase(u("absent"));
  expect(map.findNode(1, u("a"))).toBe(second);
  map.erase(lvalue);
  expect(map.findNode(5, u("a"))).toBeNull();
  expect(map.findNode(5, u("b"))).toBe(first);
  map.erase(u("b"));
  expect(map.empty()).toBe(true);
  expect(map.begin()).toBe(map.end());
  map.insert({ first: u("a"), second: first });
  expect(map.findNode(5, u("a"))).toBe(first);
});

it("uses live stable ordered entries when callers insert around a retained cursor", /** Does not use erased-current cursors, a native invalid domain. @returns Nothing. */ () => {
  const map = new NodeMap();
  const [middle] = map.insert({ first: u("b"), second: group(0) });
  map.insert({ first: u("d"), second: group(0) });
  const iterator = map[Symbol.iterator]();
  expect(iterator.next().value).toBe(middle);
  map.insert({ first: u("a"), second: group(0) });
  const [later] = map.insert({ first: u("c"), second: group(0) });
  expect(iterator.next().value).toBe(later);
  map.erase(u("d"));
  expect(iterator.next().done).toBe(true);
  expect(map.find(u("b"))).toBe(middle);
  expect([...new NodeMap()]).toEqual([]);
});

it("preserves scalar metadata and child templates while clones drop descriptions and optionally the own template", /** Verifies actual native copy behavior and source/target independence. @returns Nothing. */ () => {
  const template = u("parent");
  const source = new GroupNode(-2147483648, false, template);
  template.assign(u("changed"));
  expect(source.kind()).toBe(Node.KIND_GROUP);
  expect(source.isExtensible()).toBe(false);
  expect(source.getLayer()).toBe(-2147483648);
  expect(source.getFinalized()).toBe(SAL_MAX_INT32);
  expect(source.getMandatory()).toBe(SAL_MAX_INT32);
  source.setLayer(7);
  source.setFinalized(9);
  source.setMandatory(11);
  const description = source.getDescription();
  expect(text(description)).toBe("");
  source.setDescription(u("first"));
  expect(source.getDescription()).toBe(description);
  expect(text(description)).toBe("first");
  source.setDescription(u("second"));
  expect(text(description)).toBe("second");
  const returnedTemplate = source.getTemplateName();
  returnedTemplate.assign(u("caller mutation"));
  expect(text(source.getTemplateName())).toBe("parent");
  const child = group(4, "child");
  child.setMandatory(-1);
  child.setFinalized(6);
  child.setDescription(u("child description"));
  source.getMembers().insert({ first: u("child"), second: child });
  for (const keep of [false, true]) {
    const clone = source.clone(keep);
    expect(clone).not.toBe(source);
    expect([
      clone.getLayer(),
      clone.getFinalized(),
      clone.getMandatory(),
      clone.isExtensible(),
    ]).toEqual([7, 9, 11, false]);
    expect(text(clone.getDescription())).toBe("");
    expect(text(clone.getTemplateName())).toBe(keep ? "parent" : "");
    const copiedChild = clone.getMember(u("child")) as GroupNode;
    expect(copiedChild).not.toBe(child);
    expect(copiedChild.isExtensible()).toBe(true);
    expect([
      copiedChild.getLayer(),
      copiedChild.getFinalized(),
      copiedChild.getMandatory(),
    ]).toEqual([4, 6, -1]);
    expect(text(copiedChild.getTemplateName())).toBe("child");
    expect(text(copiedChild.getDescription())).toBe("");
    copiedChild.setLayer(8);
    clone.getMembers().erase(u("child"));
    expect(child.getLayer()).toBe(4);
    expect(source.getMember(u("child"))).toBe(child);
  }
  const target = new NodeMap();
  // An empty map can retain a failed-lookup end cache before cloning.
  expect(target.findNode(0, u("child"))).toBeNull();
  source.getMembers().cloneInto(target);
  expect(target.findNode(4, u("child"))).not.toBe(child);
  source.getMembers().erase(u("child"));
  expect(target.find(u("child"))).toBeDefined();
  const emptyTarget = new NodeMap();
  new NodeMap().cloneInto(emptyTarget);
  expect(emptyTarget.empty()).toBe(true);
});

it("retains the original root defaults and explicit release fallbacks without emulating assertions", /** Uses the real UNO exception owner and an explicitly base-qualified call. @returns Nothing. */ () => {
  const root = new RootNode();
  expect([
    Node.KIND_PROPERTY,
    Node.KIND_LOCALIZED_PROPERTY,
    Node.KIND_LOCALIZED_VALUE,
    Node.KIND_GROUP,
    Node.KIND_SET,
    Node.KIND_ROOT,
  ]).toEqual([0, 1, 2, 3, 4, 5]);
  expect([root.kind(), root.getLayer(), root.getFinalized(), root.getMandatory()]).toEqual([
    5,
    SAL_MAX_INT32,
    SAL_MAX_INT32,
    SAL_MAX_INT32,
  ]);
  root.setMandatory(SAL_MAX_INT32);
  expect(root.getMandatory()).toBe(SAL_MAX_INT32);
  expect(text(root.getTemplateName())).toBe("");
  expect(root.clone(false)).toBeNull();
  expect(root.clone(true)).toBeNull();
  let caught: unknown;
  try {
    Node.prototype.getMembers.call(root);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  expect(text((caught as RuntimeException).Message)).toBe("this cannot happen");
});
