/** @fileoverview Original conservative XCS merge kernel over initialized genuine nodes; no values or schema flags are fabricated by mock peers. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Node } from "./node";
import { RootNode } from "./rootnode";
import { GroupNode } from "./groupnode";
import { SetNode } from "./setnode";
import { PropertyNode } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { Type } from "./type";
import { merge } from "./xcsparser";
/** Exact native text. @param value - Text. @returns String. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes units. @param c - Unit. @returns Value. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Native group fixture. @param layer - Layer. @param extensible - Flag. @param template - Template. @returns Group. */
function group(layer: number, extensible = false, template = ""): GroupNode {
  return new GroupNode(layer, extensible, u(template));
}
/** Adds actual node with source map value semantics. @param owner - Real parent. @param name - Key. @param child - Actual child. @returns Child. */
function add<T extends Node>(owner: Node, name: string, child: T): T {
  owner.getMembers().insert({ first: u(name), second: child });
  return child;
}
/** Native ordinary prop. @param layer - Layer. @returns Node. */
function prop(layer: number): PropertyNode {
  return new PropertyNode(layer, Type.TYPE_BOOLEAN, false, new Any(true), false);
}
it("retains layer/finalized gates and scalar no-overwrite behavior", /** Source guards are exercised with initialized native metadata. @returns Nothing. */ () => {
  const original = group(2, true),
    older = group(1, true),
    newer = group(4, true);
  add(older, "old", prop(1));
  add(newer, "new", prop(4));
  merge(original, older);
  original.setFinalized(3);
  merge(original, newer);
  expect(Array.from(original.getMembers())).toEqual([]);
  for (const [a, b] of [
    [prop(0), prop(1)],
    [
      new LocalizedPropertyNode(0, Type.TYPE_BOOLEAN, false),
      new LocalizedPropertyNode(1, Type.TYPE_BOOLEAN, false),
    ],
    [new LocalizedValueNode(0, new Any(true)), new LocalizedValueNode(1, new Any(false))],
  ] as const) {
    merge(a, b);
    expect(a.getLayer()).toBe(0);
  }
});
it("retains same-kind recursive merge and extensible-only ordinary property insertion", /** New localized properties/groups are ignored and existing kind mismatches retain original nodes. @returns Nothing. */ () => {
  const a = group(0, true),
    b = group(1, true),
    nestedA = add(a, "nested", group(0, true)),
    nestedB = add(b, "nested", group(1, true));
  const added = add(nestedB, "yes", prop(1));
  add(b, "localized", new LocalizedPropertyNode(1, Type.TYPE_BOOLEAN, false));
  add(b, "group", group(1));
  const mismatch = add(a, "mismatch", prop(0));
  add(b, "mismatch", group(1));
  merge(a, b);
  expect(nestedA.getMember(u("yes"))).toBe(added);
  expect(a.getMember(u("localized"))).toBe(null);
  expect(a.getMember(u("group"))).toBe(null);
  expect(a.getMember(u("mismatch"))).toBe(mismatch);
});
it("retains valid-template-only set insertions and equal-template recursive updates", /** Additional templates and kind/template mismatches follow the original set branches. @returns Nothing. */ () => {
  const a = new SetNode(0, u("p:T"), new OUString()),
    b = new SetNode(1, u("p:T"), new OUString());
  a.getAdditionalTemplateNames().push(u("p:Extra"));
  const existing = add(a, "existing", group(0, true, "p:T")),
    update = add(b, "existing", group(1, true, "p:T")),
    property = add(update, "P", prop(1));
  const yes = add(b, "yes", group(1, false, "p:T"));
  add(b, "no", group(1, false, "p:Wrong"));
  const extra = add(b, "extra", group(1, false, "p:Extra"));
  const different = add(a, "different", group(0, true, "p:T"));
  add(b, "different", group(1, true, "p:Wrong"));
  add(a, "kind", prop(0));
  add(b, "kind", group(1, false, "p:T"));
  merge(a, b);
  expect(a.getMember(u("yes"))).toBe(yes);
  expect(a.getMember(u("extra"))).toBe(extra);
  expect(a.getMember(u("no"))).toBe(null);
  expect(existing.getMember(u("P"))).toBe(property);
  expect(a.getMember(u("different"))).toBe(different);
});
it("preserves explicit native merge invariant assertions", /** Debug guard outcomes use actual initialized node objects. @returns Nothing. */ () => {
  const a = group(0),
    b = group(1);
  b.setFinalized(4);
  expect(/** Rejects finalized update. @returns Nothing. */ () => merge(a, b)).toThrow();
  expect(/** Rejects kind mismatch. @returns Nothing. */ () => merge(a, prop(0))).toThrow();
  expect(
    /** Root case is explicitly impossible in native merge. @returns Nothing. */ () =>
      merge(new RootNode(), new RootNode()),
  ).toThrow();
});
