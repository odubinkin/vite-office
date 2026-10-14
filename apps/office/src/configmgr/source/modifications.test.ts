/** @fileoverview Source-backed valid modification path histories; native empty-remove assertion/invalid release domain is not executed or invented. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { Additions } from "./additions";
import { Modifications, ModificationsNode } from "./modifications";

/** Creates exact UTF16 values including NUL and unpaired surrogate. @param value - Literal. @returns Owned string. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Creates actual path values. @param parts - Literal segments. @returns Initialized path. */
function path(...parts: string[]): OUString[] {
  return parts.map(
    /** Materializes an independent key value. @param part - Segment. @returns Actual key. */ (
      part,
    ) => u(part),
  );
}
/** Reads exact key contents. @param value - Actual key. @returns JS value. */
function text(value: OUStringConstReference): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** Projects logical paths and intentionally ignores native unspecified hash iteration order. @param node - Actual tree. @param prefix - Traversed path. @returns Sorted logical leaf paths. */
function leaves(node: ModificationsNode, prefix: string[] = []): string[] {
  const result: string[] = [];
  for (const entry of node.children) {
    const current = [...prefix, text(entry.first)];
    if (entry.second.children.empty()) result.push(JSON.stringify(current));
    else result.push(...leaves(entry.second, current));
  }
  return result.sort();
}

it("retains root identity and compresses repeated, covered and broader modification paths", /** Uses literal expected leaves independent of the production traversal. @returns Nothing. */ () => {
  const modifications = new Modifications();
  const root = modifications.getRoot();
  expect(modifications.empty()).toBe(true);
  expect(Modifications.Node).toBe(ModificationsNode);
  expect(new Modifications.Node().children.empty()).toBe(true);
  modifications.add(path("A", "x", "one"));
  const first = root.children.front();
  expect(leaves(root)).toEqual(['["A","x","one"]']);
  modifications.add(path("A", "x", "two"));
  expect(leaves(root)).toEqual(['["A","x","one"]', '["A","x","two"]']);
  modifications.add(path("A", "x", "one"));
  expect(root.children.front()).toBe(first);
  modifications.add(path("A", "x"));
  expect(leaves(root)).toEqual(['["A","x"]']);
  modifications.add(path("A", "x", "ignored"));
  expect(leaves(root)).toEqual(['["A","x"]']);
  modifications.add(path("A", "other"));
  expect(leaves(root)).toEqual(['["A","other"]', '["A","x"]']);
  modifications.add(path("A"));
  modifications.add(path("A", "covered", "deep"));
  expect(leaves(root)).toEqual(['["A"]']);
  expect(modifications.getRoot()).toBe(root);
  expect(modifications.empty()).toBe(false);
});

it("copies UTF16 keys and retains actual child aliases across unrelated insertion and deletion", /** Checks binary contents rather than key object identity. @returns Nothing. */ () => {
  const modifications = new Modifications();
  const input = path("b", "a\0\ud800");
  const additions: Additions = [input, path("aa", "z")];
  for (const addition of additions) modifications.add(addition);
  const first = modifications.getRoot().children.front();
  const child = first?.second;
  input[0]?.assign(u("changed"));
  input[1]?.assign(u("different"));
  expect(leaves(modifications.getRoot())).toEqual(['["aa","z"]', '["b","a\\u0000\\ud800"]']);
  modifications.add(path("b", "a\0\ud800"));
  expect(modifications.getRoot().children.front()).toBe(first);
  expect(first?.second).toBe(child);
  modifications.add(path("", "empty-key"));
  modifications.add(path("\ud800", "surrogate"));
  modifications.remove(path("aa"));
  expect(first?.second).toBe(child);
  expect(child?.children.size()).toBe(1);
  expect(leaves(modifications.getRoot())).toContain('["b","a\\u0000\\ud800"]');
});

it("prunes valid deep paths recursively while retaining a root sibling and ignores missing descendants", /** A root sentinel keeps all recursive remove arguments inside the original valid domain. @returns Nothing. */ () => {
  const modifications = new Modifications();
  modifications.remove(path("missing"));
  modifications.add(path("sentinel"));
  modifications.add(path("A", "x", "one"));
  modifications.add(path("A", "x", "two"));
  modifications.remove(path("missing"));
  modifications.remove(path("A", "absent"));
  modifications.remove(path("A", "x", "one", "absent"));
  expect(leaves(modifications.getRoot())).toEqual([
    '["A","x","one"]',
    '["A","x","two"]',
    '["sentinel"]',
  ]);
  modifications.remove(path("A", "x", "one"));
  expect(leaves(modifications.getRoot())).toEqual(['["A","x","two"]', '["sentinel"]']);
  modifications.remove(path("A", "x", "two"));
  expect(leaves(modifications.getRoot())).toEqual(['["sentinel"]']);
  modifications.add(path("B", "deep"));
  modifications.remove(path("B"));
  expect(leaves(modifications.getRoot())).toEqual(['["sentinel"]']);
  expect(modifications.empty()).toBe(false);
});

it("clears actual root children for empty add and the original conditional clear value body", /** Retains root identity and supports later additions without a fake backend. @returns Nothing. */ () => {
  const modifications = new Modifications();
  const root = modifications.getRoot();
  modifications.add([]);
  expect(modifications.empty()).toBe(true);
  modifications.add(path("A", "x"));
  modifications.add([]);
  expect(modifications.empty()).toBe(true);
  modifications.add(path("B"));
  modifications.clear();
  expect(modifications.getRoot()).toBe(root);
  expect(modifications.empty()).toBe(true);
  modifications.add(path("C"));
  expect(leaves(root)).toEqual(['["C"]']);
});
