/** @fileoverview Source-backed Data/Set histories over actual Group/Set/localized/value nodes, not a fake configuration service. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Data, DataExtensionXcu } from "./data";
import { SetNode } from "./setnode";
import { GroupNode } from "./groupnode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { Type } from "./type";
import type { Node } from "./node";

/** Creates an actual UTF16 value. @param value - Literal. @returns Actual owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads actual UTF16 units. @param value - Actual owner. @returns JS string. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Inserts an actual concrete child into its real parent's map. @param parent - Actual owner. @param name - Literal key. @param value - Actual child. @returns Same child. */
function child<T extends Node>(parent: Node, name: string, value: T): T {
  parent.getMembers().insert({ first: u(name), second: value });
  return value;
}
/** Builds a real configuration tree with actual initialized template identities. @returns Actual owners. */
function tree() {
  const data = new Data(),
    component = new GroupNode(0, true, u(""));
  data.getComponents().insert({ first: u("C"), second: component });
  component.setFinalized(10);
  const group = child(component, "G", new GroupNode(1, false, u("")));
  group.setFinalized(7);
  const set = child(component, "Set", new SetNode(1, u("C:T"), u("")));
  set.setFinalized(8);
  set.getAdditionalTemplateNames().push(new OUString(u("C:Other")), new OUString(u("C:Third")));
  const member = child(set, "m", new GroupNode(2, true, u("C:T")));
  member.setFinalized(6);
  const other = child(set, "other", new GroupNode(2, true, u("C:Other")));
  const localized = child(component, "Loc", new LocalizedPropertyNode(1, Type.TYPE_STRING, true));
  localized.setFinalized(9);
  const value = child(localized, "en", new LocalizedValueNode(2, new Any(true)));
  value.setFinalized(4);
  return { data, component, group, set, member, other, localized, value };
}

it("resolves actual group set and localized paths with canonical output and finalized minimum", /** Checks root special behavior, ignored final slash and optional outputs. @returns Nothing. */ () => {
  const x = tree(),
    canonical = u("old"),
    path = [u("old")],
    finalized: [number] = [-99];
  const root = x.data.resolvePathRepresentation(u("/"), canonical, path, finalized);
  expect([root?.kind(), text(canonical), path.length, finalized[0]]).toEqual([
    5,
    "/",
    0,
    Data.NO_LAYER,
  ]);
  root?.setFinalized(1);
  expect(x.data.resolvePathRepresentation(u("/"), null, null, null)).toBe(root);
  expect(x.data.getComponents()).toBe(x.data.getComponents());
  expect(x.data.modifications.empty()).toBe(true);
  const cases: readonly [string, Node, string, readonly string[], number][] = [
    ["/C", x.component, "/C", ["C"], 10],
    ["/C/", x.component, "/C", ["C"], 10],
    ["/C/G", x.group, "/C/G", ["C", "G"], 7],
    ["/['C']/G", x.group, "/C/G", ["C", "G"], 7],
    ["/C/['G']", x.group, "/C/G", ["C", "G"], 7],
    ["/C/Set/m", x.member, "/C/Set/m", ["C", "Set", "m"], 6],
    ["/C/Set/T['m']", x.member, "/C/Set/T['m']", ["C", "Set", "m"], 6],
    ['/C/Set/T["m"]', x.member, "/C/Set/T['m']", ["C", "Set", "m"], 6],
    ["/C/Set/C:T['m']", x.member, "/C/Set/C:T['m']", ["C", "Set", "m"], 6],
    ["/C/Set/*['m']", x.member, "/C/Set/m", ["C", "Set", "m"], 6],
    ["/C/Set/['m']", x.member, "/C/Set/m", ["C", "Set", "m"], 6],
    ["/C/Set/Other['other']", x.other, "/C/Set/Other['other']", ["C", "Set", "other"], 8],
    ["/C/Loc/en", x.value, "/C/Loc/en", ["C", "Loc", "en"], 4],
    ["/C/Loc/*['en']", x.value, "/C/Loc/en", ["C", "Loc", "en"], 4],
    ["/C/Loc/['en']", x.value, "/C/Loc/en", ["C", "Loc", "en"], 4],
  ];
  for (const [input, expected, expectedCanonical, expectedPath, expectedFinalized] of cases) {
    expect(x.data.resolvePathRepresentation(u(input), canonical, path, finalized), input).toBe(
      expected,
    );
    expect(text(canonical), input).toBe(expectedCanonical);
    expect(
      path.map(
        /** Reads copied path values. @param value - Actual segment. @returns Literal. */ (value) =>
          text(value),
      ),
      input,
    ).toEqual(expectedPath);
    expect(finalized[0], input).toBe(expectedFinalized);
    expect(x.data.resolvePathRepresentation(u(input), null, null, null)).toBe(expected);
  }
});

it("preserves missing-node partial outputs and original bad-path validation order", /** Includes the source-confirmed absent versus existing malformed-suffix difference. @returns Nothing. */ () => {
  const x = tree();
  for (const [input, expectedPath] of [
    ["/Missing/bad['", []],
    ["/C/missing", ["C"]],
    ["/C/Set/T['missing']", ["C", "Set"]],
  ] as const) {
    const canonical = u("old"),
      path = [u("old")],
      finalized: [number] = [77];
    expect(x.data.resolvePathRepresentation(u(input), canonical, path, finalized)).toBeNull();
    expect([text(canonical), finalized[0]]).toEqual(["old", 77]);
    expect(
      path.map(
        /** Reads the successfully traversed prefix. @param value - Actual segment. @returns Literal. */ (
          value,
        ) => text(value),
      ),
    ).toEqual(expectedPath);
  }
  for (const input of [
    "",
    "relative",
    "/[",
    "/T['C']",
    "/*['C']",
    "/C/G[",
    "/C/T['G']",
    "/C/Loc/T['en']",
    "/C/Set/Bad['m']",
    "/C/Set/Other['m']",
    "/['C']junk",
  ]) {
    const canonical = u("old"),
      path = [u("old")],
      finalized: [number] = [77];
    let caught: unknown;
    try {
      x.data.resolvePathRepresentation(u(input), canonical, path, finalized);
    } catch (error) {
      caught = error;
    }
    expect(caught, input).toBeInstanceOf(RuntimeException);
    expect(text((caught as RuntimeException).Message)).toBe("bad path " + input);
    expect([text(canonical), finalized[0]]).toEqual(["old", 77]);
    if (input === "" || input === "relative") expect(text(path[0] as OUString)).toBe("old");
  }
  expect(new Data().resolvePathRepresentation(u("/['C']junk"), null, null, null)).toBeNull();
});

it("copies actual set template metadata and child values with original clone modes", /** Native vector value insertion is explicitly copied at the caller bridge. @returns Nothing. */ () => {
  const defaultName = u("C:T"),
    ownName = u("C:Set");
  const set = new SetNode(3, defaultName, ownName);
  defaultName.assign(u("changed"));
  ownName.assign(u("changed"));
  expect(set.kind()).toBe(4);
  expect(text(set.getDefaultTemplateName())).toBe("C:T");
  expect(set.getDefaultTemplateName()).toBe(set.getDefaultTemplateName());
  const returnedName = set.getTemplateName();
  returnedName.assign(u("mutated"));
  expect(text(set.getTemplateName())).toBe("C:Set");
  expect(set.getMandatory()).toBe(Data.NO_LAYER);
  set.setMandatory(5);
  set.setFinalized(8);
  set.setDescription(u("schema"));
  const additional = set.getAdditionalTemplateNames();
  expect(set.getAdditionalTemplateNames()).toBe(additional);
  const input = u("C:Other");
  additional.push(new OUString(input), u("C:Third"));
  input.assign(u("external mutation"));
  for (const [name, expected] of [
    ["T", true],
    ["C:T", true],
    ["Other", true],
    ["Third", true],
    ["Missing", false],
    ["D:T", false],
  ] as const)
    expect(set.isValidTemplate(u(name))).toBe(expected);
  const member = child(set, "m", new GroupNode(4, true, u("C:T")));
  for (const keep of [false, true]) {
    const copy = set.clone(keep);
    expect([copy.getLayer(), copy.getFinalized(), copy.getMandatory()]).toEqual([3, 8, 5]);
    expect(copy.getDescription().isEmpty()).toBe(true);
    expect(text(copy.getTemplateName())).toBe(keep ? "C:Set" : "");
    expect(text(copy.getDefaultTemplateName())).toBe("C:T");
    const copiedNames = copy.getAdditionalTemplateNames();
    expect(copiedNames).not.toBe(additional);
    copiedNames[0]?.assign(u("D:Changed"));
    expect(text(additional[0] as OUString)).toBe("C:Other");
    const copiedChild = copy.getMember(u("m"));
    expect(copiedChild).not.toBe(member);
    expect(text((copiedChild as Node).getTemplateName())).toBe("C:T");
    copy.getMembers().erase(u("m"));
    expect(set.getMember(u("m"))).toBe(member);
  }
});

it("retains actual layer-filtered templates and live copied-key extension addition records", /** Exercises duplicate failure without changing the already registered additions. @returns Nothing. */ () => {
  const data = new Data(),
    template = new GroupNode(3, true, u("C:T"));
  data.templates.insert({ first: u("C:T"), second: template });
  expect(data.getTemplate(2, u("C:T"))).toBeNull();
  expect(data.getTemplate(3, u("C:T"))).toBe(template);
  expect(data.getTemplate(4, u("C:T"))).toBe(template);
  expect(data.getTemplate(4, u("C:Missing"))).toBeNull();
  expect(data.removeExtensionXcuAdditions(u("missing"))).toBeNull();
  expect(Data.ExtensionXcu).toBe(DataExtensionXcu);
  const url = u("file://one.xcu");
  const additions = data.addExtensionXcuAdditions(url, -2147483648);
  additions.push([u("C"), u("G")]);
  url.assign(u("changed"));
  data.addExtensionXcuAdditions(u("file://two.xcu"), 2);
  let caught: unknown;
  try {
    data.addExtensionXcuAdditions(u("file://one.xcu"), 9);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  expect(text((caught as RuntimeException).Message)).toBe(
    "already added extension xcu file://one.xcu",
  );
  const record = data.removeExtensionXcuAdditions(u("file://one.xcu"));
  expect(record).toBeInstanceOf(DataExtensionXcu);
  expect(record?.layer).toBe(-2147483648);
  expect(record?.additions).toBe(additions);
  expect(
    additions.map(
      /** Reads actual returned path values. @param path - Actual path. @returns Literal values. */ (
        path,
      ) =>
        path.map(
          /** Reads an actual segment. @param value - Actual owner. @returns Literal. */ (value) =>
            text(value),
        ),
    ),
  ).toEqual([["C", "G"]]);
  (record as DataExtensionXcu).layer = 4294967295;
  expect(record?.layer).toBe(-1);
  expect(data.removeExtensionXcuAdditions(u("file://one.xcu"))).toBeNull();
  expect(data.removeExtensionXcuAdditions(u("changed"))).toBeNull();
  expect(data.removeExtensionXcuAdditions(u("file://two.xcu"))?.layer).toBe(2);
});
