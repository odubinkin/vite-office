/** @fileoverview Full original XCU updates over real schema/data/parser owners; expected mutations are specified independently of implementation helpers. */
import { expect, it } from "vitest";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { createHash } from "node:crypto";
import commonSchema from "../../officecfg/registry/schema/org/openoffice/Office/Common.xcs?raw";
import commonData from "../../officecfg/registry/data/org/openoffice/Office/Common.xcu?raw";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { XmlReader } from "../../xmlreader/inc/xmlreader";
import { Data } from "./data";
import { XcsParser } from "./xcsparser";
import { XcuParser } from "./xcuparser";
import { ParseManager } from "./parsemanager";
import { Partial } from "./partial";
import { Modifications, type ModificationsNode } from "./modifications";
import { PropertyNode, type PropertyNodeComponents } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { SetNode } from "./setnode";
import { GroupNode } from "./groupnode";
import { RootNode } from "./rootnode";
import { Node } from "./node";
import { Type } from "./type";
import type { Additions } from "./additions";
/** Native literal construction. @param value - Exact text. @returns String. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Native value inspection. @param value - String. @returns Text. */
function text(value: OUString): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
const namespaces =
  'xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
/** Actual source-shaped schema fixture. @returns Data. */
function fixture(): Data {
  const data = new Data();
  const xml = `<oor:component-schema ${namespaces} oor:package="test" oor:name="C"><templates><group oor:name="T"><prop oor:name="V" oor:type="xs:int"><value>1</value></prop></group><group oor:name="Alt"><prop oor:name="V" oor:type="xs:int"><value>2</value></prop></group></templates><component><group oor:name="G" oor:extensible="true"><prop oor:name="P" oor:type="xs:int"><value>7</value></prop><prop oor:name="Any" oor:type="oor:any"/><prop oor:name="Strict" oor:type="xs:boolean" oor:nillable="false"><value>false</value></prop><prop oor:name="List" oor:type="oor:int-list"/><prop oor:name="L" oor:type="xs:string" oor:localized="true"><value>base</value></prop><prop oor:name="LN" oor:type="xs:string" oor:localized="true" oor:nillable="false"/><group oor:name="Sub"><prop oor:name="V" oor:type="xs:int"><value>3</value></prop></group><set oor:name="S" oor:node-type="T"><item oor:node-type="Alt"/></set></group></component></oor:component-schema>`;
  expect(
    new ParseManager(u("fixture.xcs"), new XcsParser(0, data), new TextEncoder().encode(xml)).parse(
      null,
    ),
  ).toBe(true);
  return data;
}
/** Original component-data wrapper. @param body - Node XML. @param attrs - Root attributes. @returns XML. */
function component(body: string, attrs = ""): string {
  return `<oor:component-data ${namespaces} oor:package="test" oor:name="C" ${attrs}>${body}</oor:component-data>`;
}
/** Wraps members in actual fixture group. @param body - Member XML. @returns XML. */
function group(body: string): string {
  return component(`<node oor:name="G">${body}</node>`);
}
/** Loads exact bytes through actual driver and parser. @param xml - XML. @param data - Actual schema. @param layer - Native update layer. @param partial - Optional filter. @param broadcast - Changes owner. @param additions - Addition paths. @returns Data. */
function parse(
  xml: string,
  data = fixture(),
  layer = 1,
  partial: Partial | null = null,
  broadcast: Modifications | null = null,
  additions: Additions | null = null,
): Data {
  expect(
    new ParseManager(
      u("fixture.xcu"),
      new XcuParser(layer, data, partial, broadcast, additions),
      new TextEncoder().encode(xml),
    ).parse(null),
  ).toBe(true);
  return data;
}
/** Uses native path resolution. @param data - Actual tree. @param path - Relative fixture path. @returns Actual node. */
function node(data: Data, path = "G"): Node {
  return data.resolvePathRepresentation(u("/test.C/" + path), null, null, null) as Node;
}
/** Explicit scalar extraction; external lookup is forbidden unless a test supplies its actual receiver. @param data - Actual tree. @param path - Property path. @returns Integer. */
function integer(data: Data, path = "G/P"): number {
  const value = (node(data, path) as PropertyNode).getValue(local),
    out: [number] = [0];
  expect(value.extract(out, "sal_Int32")).toBe(true);
  return out[0];
}
const local: PropertyNodeComponents = {
  getExternalValue: /** No descriptor is configured in ordinary fixtures. @returns Never. */ () => {
    throw Error("unexpected external lookup");
  },
};
/** Reads modification paths independently from actual prefix-tree values. @param root - Real changes node. @param prefix - Original prefix. @returns Complete leaf paths. */
function modified(root: ModificationsNode, prefix: string[] = []): string[][] {
  const result: string[][] = [];
  for (const entry of root.children) {
    const path = [...prefix, text(entry.first as OUString)];
    if (entry.second.children.empty()) result.push(path);
    else result.push(...modified(entry.second, path));
  }
  return result;
}
/** Reads the original UNO exception Message rather than inventing an Error.message field. @param run - Public parser call. @param diagnostic - Original message fragment. @returns Nothing. */
function rejects(run: () => unknown, diagnostic: string): void {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  const message = (caught as RuntimeException).Message;
  let out = "";
  for (let i = 0; i < message.getLength(); i++)
    out += String.fromCharCode(message.getStr()[i] as number);
  expect(out).toContain(diagnostic);
}
it("parses unchanged complete Common.xcu against complete Common.xcs without global activation", /** The raw installation-module attributes are original parser-ignored metadata, not platform configuration selection. @returns Nothing. */ () => {
  expect(createHash("sha256").update(commonData).digest("hex")).toBe(
    "6a055abb15d2a8fb4d546488184a98daaba9ec1022920643e81ed9b1d29a9006",
  );
  expect(commonData).toContain("Mozilla Public");
  expect(commonData).toContain("Apache");
  const data = new Data();
  expect(
    new ParseManager(
      u("Common.xcs"),
      new XcsParser(0, data),
      new TextEncoder().encode(commonSchema),
    ).parse(null),
  ).toBe(true);
  const before = data.resolvePathRepresentation(
    u("/org.openoffice.Office.Common/Misc/FindReplaceRememberedSearches"),
    null,
    null,
    null,
  ) as PropertyNode;
  expect(before.getValue(local).hasValue()).toBe(false);
  expect(before.getLayer()).toBe(0);
  parse(commonData, data);
  expect(before.getLayer()).toBe(1);
  expect(before.isModified()).toBe(false);
  const value = data.resolvePathRepresentation(
    u("/org.openoffice.Office.Common/Misc/FindReplaceRememberedSearches"),
    null,
    null,
    null,
  ) as PropertyNode;
  const out: [number] = [0];
  expect(value.getValue(local).extract(out, "sal_Int32")).toBe(true);
  expect(out[0]).toBe(10);
  const options = data.resolvePathRepresentation(
    u("/org.openoffice.Office.Common/SearchOptions"),
    null,
    null,
    null,
  ) as GroupNode;
  const expected: Record<string, boolean> = {
    IsWholeWordsOnly: false,
    IsBackwards: false,
    IsUseRegularExpression: false,
    IsSearchForStyles: false,
    IsSimilaritySearch: false,
    IsUseAsianOptions: false,
    IsMatchCase: false,
    "Japanese/IsMatchFullHalfWidthForms": true,
    "Japanese/IsMatchHiraganaKatakana": true,
    "Japanese/IsMatchContractions": true,
    "Japanese/IsMatchMinusDashCho-on": true,
    "Japanese/IsMatchRepeatCharMarks": true,
    "Japanese/IsMatchVariantFormKanji": true,
    "Japanese/IsMatchOldKanaForms": true,
    "Japanese/IsMatch_DiZi_DuZu": true,
    "Japanese/IsMatch_BaVa_HaFa": true,
    "Japanese/IsMatch_TsiThiChi_DhiZi": true,
    "Japanese/IsMatch_HyuIyu_ByuVyu": true,
    "Japanese/IsMatch_SeShe_ZeJe": true,
    "Japanese/IsMatch_IaIya": true,
    "Japanese/IsMatch_KiKu": true,
    "Japanese/IsIgnorePunctuation": true,
    "Japanese/IsIgnoreWhitespace": true,
    "Japanese/IsIgnoreProlongedSoundMark": true,
    "Japanese/IsIgnoreMiddleDot": true,
    IsNotes: false,
    IsIgnoreDiacritics_CTL: false,
    IsIgnoreKashida_CTL: true,
    IsSearchFormatted: false,
    IsUseWildcard: false,
  };
  expect(Object.keys(expected)).toHaveLength(30);
  for (const [path, wanted] of Object.entries(expected)) {
    let current: Node = options;
    for (const segment of path.split("/")) current = current.getMember(u(segment)) as Node;
    const value: [boolean] = [false];
    expect((current as PropertyNode).getValue(local).extract(value, "bool")).toBe(true);
    expect(value[0], path).toBe(wanted);
  }
  expect(data.modifications.empty()).toBe(true);
});
it.each(["modify", "replace", "fuse"])(
  "updates plain properties with %s and records current paths",
  /** Public XML operations share the original stable property owner. @param op - Operation. @returns Nothing. */ (
    op,
  ) => {
    const data = fixture(),
      before = node(data, "G/P"),
      broadcast = new Modifications(),
      additions: Additions = [];
    parse(
      group(`<prop oor:name="P" oor:op="${op}"><value>11</value></prop>`),
      data,
      Data.NO_LAYER,
      null,
      broadcast,
      additions,
    );
    expect(integer(data)).toBe(11);
    expect(node(data, "G/P")).toBe(before);
    expect((before as PropertyNode).isModified()).toBe(true);
    expect(modified(broadcast.getRoot())).toEqual([["test.C", "G", "P"]]);
    expect(modified(data.modifications.getRoot())).toEqual([["test.C", "G", "P"]]);
    expect(additions).toEqual([]);
  },
);
it("creates/removes extensible Any properties and leaves unknown modify members ignored", /** Source extension insertion is delayed and preserves static Any. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    group(
      '<prop oor:name="New" oor:type="xs:int" oor:op="fuse"><value>21</value></prop><prop oor:name="Ignored"><bad/></prop>',
    ),
    data,
  );
  expect(integer(data, "G/New")).toBe(21);
  expect((node(data, "G/New") as PropertyNode).getStaticType()).toBe(Type.TYPE_ANY);
  expect((node(data, "G/New") as PropertyNode).isExtension()).toBe(true);
  expect(node(data).getMember(u("Ignored"))).toBe(null);
  parse(group('<prop oor:name="New" oor:op="remove"/>'), data);
  expect(node(data).getMember(u("New"))).toBe(null);
});
it("retains nil, Any value type, separator and external descriptor contracts", /** Values use the actual shared Any/ValueParser owners. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    group(
      '<prop oor:name="P"><value xsi:nil="true"><ignored/></value></prop><prop oor:name="Any"><value oor:type="xs:int">9</value></prop><prop oor:name="List"><value oor:separator=",">1,2,3</value></prop>',
    ),
    data,
  );
  expect((node(data, "G/P") as PropertyNode).getValue(local).hasValue()).toBe(false);
  expect(integer(data, "G/Any")).toBe(9);
  parse(group('<prop oor:name="P"><value oor:external="provider:key"/></prop>'), data);
  const property = node(data, "G/P") as PropertyNode;
  let calls = 0;
  const external: PropertyNodeComponents = {
    getExternalValue:
      /** Actual lazy descriptor receiver, with owned returned Any. @param descriptor - Requested key. @returns External value. */ (
        descriptor,
      ) => {
        expect(Array.from(descriptor)).toEqual(
          Array.from(u("provider:key").getStr().subarray(0, 12)),
        );
        calls++;
        return { IsPresent: true, Value: new Any([42], "sal_Int32") };
      },
  };
  const out: [number] = [0];
  expect(property.getValue(external).extract(out, "sal_Int32")).toBe(true);
  expect(out[0]).toBe(42);
  property.getValue(external);
  expect(calls).toBe(1);
});
it("handles localized fuse, nil, replacement and removal with original modification paths", /** Replacing the localized property creates a new owner and clears old languages. @returns Nothing. */ () => {
  const data = fixture(),
    broadcast = new Modifications();
  parse(
    group(
      '<prop oor:name="L"><value xml:lang="en">English</value><value xml:lang="de" xsi:nil="true"/></prop>',
    ),
    data,
    Data.NO_LAYER,
    null,
    broadcast,
  );
  const old = node(data, "G/L") as LocalizedPropertyNode;
  const english = new OUString();
  expect(
    (old.getMember(u("en")) as LocalizedValueNode).getValue().extract(english, "OUString"),
  ).toBe(true);
  expect(text(english)).toBe("English");
  expect((old.getMember(u("de")) as LocalizedValueNode).getValue().hasValue()).toBe(false);
  expect(modified(broadcast.getRoot())).toEqual([
    ["test.C", "G", "L", "de"],
    ["test.C", "G", "L", "en"],
  ]);
  parse(
    group('<prop oor:name="L" oor:op="replace"><value xml:lang="fr">French</value></prop>'),
    data,
    Data.NO_LAYER,
  );
  expect(node(data, "G/L")).not.toBe(old);
  expect(node(data, "G/L").getMember(u("en"))).toBe(null);
  parse(
    group('<prop oor:name="L"><value xml:lang="fr" oor:op="remove"/></prop>'),
    data,
    Data.NO_LAYER,
  );
  expect(node(data, "G/L").getMembers().empty()).toBe(true);
});
it("applies set operations and records additions as independent path snapshots", /** Templates are actual XCS nodes; no member factories are substituted. @returns Nothing. */ () => {
  const data = fixture(),
    additions: Additions = [],
    broadcast = new Modifications();
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:op="fuse"><prop oor:name="V"><value>8</value></prop></node><node oor:name="b" oor:node-type="Alt" oor:op="replace"/><node oor:name="missing" oor:op="modify"><bad/></node></node>',
    ),
    data,
    1,
    null,
    broadcast,
    additions,
  );
  expect(integer(data, "G/S/a/V")).toBe(8);
  expect(integer(data, "G/S/b/V")).toBe(2);
  expect(node(data, "G/S").getMember(u("missing"))).toBe(null);
  expect(
    additions.map(
      /** Reads each actual copied path. @param path - Path vector. @returns Exact text. */ (
        path,
      ) =>
        path.map(
          /** Reads segment. @param value - Native string. @returns Text. */ (value) => text(value),
        ),
    ),
  ).toEqual([
    ["test.C", "G", "S", "a"],
    ["test.C", "G", "S", "b"],
  ]);
  const previous = node(data, "G/S/a");
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:op="replace"/><node oor:name="b" oor:op="remove"/><node oor:name="missing" oor:op="remove"/></node>',
    ),
    data,
    2,
  );
  expect(node(data, "G/S/a")).not.toBe(previous);
  expect(integer(data, "G/S/a/V")).toBe(1);
  expect(node(data, "G/S").getMember(u("b"))).toBe(null);
});
it("respects finalized, mandatory and later-layer existing nodes", /** Existing set metadata changes before a layer refusal, as upstream. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:op="fuse" oor:mandatory="true"/><node oor:name="b" oor:op="fuse" oor:finalized="true"/></node><prop oor:name="P" oor:finalized="true"><value>10</value></prop>',
    ),
    data,
    2,
  );
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:op="remove"/><node oor:name="b" oor:op="replace"/></node><prop oor:name="P"><value>20</value></prop>',
    ),
    data,
    3,
  );
  expect(node(data, "G/S").getMember(u("a"))).not.toBe(null);
  expect(node(data, "G/S/b").getFinalized()).toBe(2);
  expect(integer(data)).toBe(10);
  parse(
    group('<node oor:name="S"><node oor:name="a" oor:op="modify" oor:finalized="true"/></node>'),
    data,
    1,
  );
  expect(node(data, "G/S/a").getLayer()).toBe(2);
  expect(node(data, "G/S/a").getFinalized()).toBe(1);
});
it("handles items paths and localized item values while skipping unknown and scalar item targets", /** Registry item paths reuse native Data parsing and reset between items. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    `<oor:items ${namespaces}><item oor:path="/unknown"><bad/></item><item oor:path="/test.C/G/P"><bad/></item><item oor:path="/test.C/G"><prop oor:name="P"><value>17</value></prop></item><item oor:path="/test.C/G/L"><value xml:lang="en">text</value></item><item oor:path="/test.C/G/L/['en']"><bad/></item></oor:items>`,
    data,
  );
  expect(integer(data)).toBe(17);
  expect(node(data, "G/L").getMember(u("en"))).toBeInstanceOf(LocalizedValueNode);
});
it("preserves property-only partial leaf admission and root accumulator behavior", /** Locale-only include remains ignored by handleGroupProp, matching its native TODO. @returns Nothing. */ () => {
  const data = fixture(),
    filter = new Partial([u("/test.C/G/L/en")], []);
  parse(
    group(
      '<prop oor:name="L"><value xml:lang="en">new</value></prop><prop oor:name="P"><value>11</value></prop>',
    ),
    data,
    1,
    filter,
  );
  expect(node(data, "G/L").getMember(u("en"))).toBe(null);
  expect(integer(data)).toBe(7);
  parse(
    group(
      '<prop oor:name="P"><value>13</value></prop><prop oor:name="L"><value xml:lang="en">ignored</value></prop>',
    ),
    data,
    1,
    new Partial([u("/test.C/G")], [u("/test.C/G/L")]),
  );
  expect(integer(data)).toBe(13);
});
it.each([
  ["<bad/>", "bad root element"],
  [`<oor:items ${namespaces}><bad/></oor:items>`, "bad items node member"],
  [`<oor:items ${namespaces}><item/></oor:items>`, "missing path"],
  [`<oor:component-data ${namespaces} oor:name="C"/>`, "no component-data package"],
  [`<oor:component-data ${namespaces} oor:package="test"/>`, "no component-data name"],
  [component("", 'oor:op="remove"'), "invalid operation on root"],
  [component("", 'oor:op="broken"'), "invalid op"],
  [component("<bad/>"), "bad group node member"],
  [group("<prop/>"), "no prop name"],
  [group("<node/>"), "no node name"],
  [group('<prop oor:name="P"><bad/></prop>'), "bad property node member"],
  [group('<prop oor:name="L"><bad/></prop>'), "bad localized property node member"],
  [group('<node oor:name="S"><bad/></node>'), "bad set node member"],
  [group('<node oor:name="P"/>'), "non group/set kind"],
  [group('<node oor:name="Sub" oor:op="replace"/>'), "invalid operation on group node"],
  [group('<prop oor:name="P" oor:type="xs:string"/>'), "invalid type for prop"],
  [group('<prop oor:name="L" oor:type="xs:int"/>'), "invalid type for prop"],
  [group('<prop oor:name="P" oor:op="remove"/>'), "invalid remove"],
  [group('<prop oor:name="L" oor:op="remove"/>'), "invalid remove"],
  [group('<prop oor:name="New" oor:op="fuse"/>'), "missing type"],
  [group('<prop oor:name="P"><value oor:type="xs:string"/></prop>'), "invalid value type"],
  [group('<prop oor:name="L"><value oor:type="xs:int"/></prop>'), "invalid value type"],
  [group('<prop oor:name="P"><value oor:separator=""/></prop>'), "bad oor:separator"],
  [group('<prop oor:name="L"><value oor:separator=""/></prop>'), "bad oor:separator"],
  [group('<prop oor:name="P"><value oor:external=""/></prop>'), "bad oor:external"],
  [group('<prop oor:name="Strict"><value xsi:nil="true"/></prop>'), "non-nillable"],
  [group('<prop oor:name="LN"><value xsi:nil="true"/></prop>'), "non-nillable"],
  [
    group('<prop oor:name="P"><value xsi:nil="true" oor:external="key"/></prop>'),
    "xsi:nil and oor:external",
  ],
  [group('<prop oor:name="L"><value oor:op="modify"/></prop>'), "bad op attribute for value"],
  [group('<node oor:name="S"><node/></node>'), "no node name"],
  [
    group('<node oor:name="S"><node oor:name="a" oor:node-type="Nope"/></node>'),
    "invalid template",
  ],
])(
  "retains native rejection case %#",
  /** Sends actual XML through the public driver. @param xml - Invalid update. @param diagnostic - Original failure text. @returns Nothing. */ (
    xml,
    diagnostic,
  ) => {
    rejects(
      /** Runs the original update parser. @returns Data on success. */ () => parse(xml),
      diagnostic,
    );
  },
);
it("keeps ordinary finalized mutation when a following type check throws", /** No prevalidation or transaction is added around upstream ordering. @returns Nothing. */ () => {
  const data = fixture(),
    property = node(data, "G/P");
  rejects(
    /** Original update mutates metadata before rejecting type. @returns Data if accepted. */ () =>
      parse(group('<prop oor:name="P" oor:finalized="true" oor:type="xs:string"/>'), data, 4),
    "invalid type",
  );
  expect(property.getFinalized()).toBe(4);
  expect(integer(data)).toBe(7);
});
it("preserves checked state preconditions and concrete incompatible component-node kinds", /** Public Data holds actual Node references, as native callers do. @returns Nothing. */ () => {
  const reader = new XmlReader(u("events"), new TextEncoder().encode("<r/>"));
  expect(
    /** An end without begin violates the original checked precondition. @returns Nothing. */ () =>
      new XcuParser(0, new Data(), null, null, null).endElement(reader),
  ).toThrow("!state_.empty()");
  for (const owner of [new RootNode(), new LocalizedValueNode(0)]) {
    const data = new Data();
    data.getComponents().getOrInsert(u("test.C")).second = owner;
    const run =
      /** Concrete incompatible owner reaches the original kind gate. @returns Data if accepted. */ () =>
        parse(component("<child/>"), data, Data.NO_LAYER);
    if (owner.kind() === Node.KIND_ROOT) expect(run).toThrow("assert(false)");
    else rejects(run, "bad member");
  }
});

it("retains namespace-aliased duplicate root metadata diagnostics", /** The actual XML reader preserves distinct attribute prefixes for parser checks. @returns Nothing. */ () => {
  for (const attribute of ["name", "package"])
    rejects(
      /** Supplies an aliased duplicate. @returns Data if accepted. */ () =>
        parse(
          component(
            "",
            `xmlns:other="http://openoffice.org/2001/registry" other:${attribute}="test"`,
          ),
        ),
      "multiple component-update " + attribute,
    );
});
it("ignores unrelated attributes and known ignored descendants at every update level", /** These source branches do not read unknown attribute values or nested ignored nodes. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    component(
      '<node oor:name="G" oor:op="fuse" oor:finalized="false" oor:unused="x" z="x"><prop oor:name="P" oor:type="xs:int" oor:unused="x" z="x"><value oor:type="xs:int" oor:unused="x" z="x">12</value></prop><prop oor:name="L" oor:type="xs:string" z="x" oor:unused="x"><value xml:lang="en" oor:type="xs:string" oor:separator="|" oor:unused="x" z="x">hello</value></prop><node oor:name="S" z="x" oor:unused="x"><prop><bad/></prop><node oor:name="a" oor:component="test.C" oor:node-type="T" oor:op="fuse" oor:mandatory="false" oor:unused="x" z="x"/></node><node oor:name="Unknown"><bad/></node><prop oor:name="Absent" oor:op="remove"/></node>',
      'oor:op="fuse" oor:finalized="false" oor:unused="x" z="x"',
    ),
    data,
  );
  expect(integer(data)).toBe(12);
  expect(node(data, "G/L").getMember(u("en"))).toBeInstanceOf(LocalizedValueNode);
  parse(group('<node oor:name="Sub"><prop oor:name="Unknown" oor:op="fuse"/></node>'), data);
  expect(node(data, "G/Sub").getMember(u("Unknown"))).toBe(null);
});
it("respects unknown/finalized/filtered roots and child groups", /** Actual metadata and Partial owners control each original early exit. @returns Nothing. */ () => {
  parse(
    `<oor:component-data ${namespaces} oor:package="other" oor:name="Missing"><bad/></oor:component-data>`,
    new Data(),
  );
  const data = fixture();
  parse(
    group('<prop oor:name="P"><value>20</value></prop>'),
    data,
    1,
    new Partial([u("/different")], []),
  );
  expect(integer(data)).toBe(7);
  parse(component('<node oor:name="G" oor:finalized="true"/>', 'oor:finalized="true"'), data, 2);
  expect(data.getComponents().findNode(2, u("test.C"))?.getFinalized()).toBe(2);
  expect(node(data).getFinalized()).toBe(2);
  parse(group("<bad/>"), data, 3);
  expect(integer(data)).toBe(7);
  const other = fixture();
  node(other, "G/Sub").setFinalized(1);
  parse(group('<node oor:name="Sub"><bad/></node>'), other, 2);
  parse(group('<node oor:name="Sub"><bad/></node>'), other, 2, new Partial([u("/test.C/G/P")], []));
});
it("tracks items independently with filters, broadcasts and ancestor finalization", /** Registry item lookup resets the original path before each visit. @returns Nothing. */ () => {
  const data = fixture(),
    broadcast = new Modifications();
  parse(
    `<oor:items ${namespaces}><item oor:path="/test.C/G" z="x" oor:unused="x"><prop oor:name="P"><value>19</value></prop></item></oor:items>`,
    data,
    1,
    null,
    broadcast,
  );
  expect(integer(data)).toBe(19);
  expect(modified(broadcast.getRoot())).toEqual([["test.C", "G", "P"]]);
  parse(
    `<oor:items ${namespaces}><item oor:path="/test.C/G"><bad/></item></oor:items>`,
    data,
    1,
    new Partial([u("/other")], []),
  );
  node(data).setFinalized(1);
  parse(
    `<oor:items ${namespaces}><item oor:path="/test.C/G"><bad/></item></oor:items>`,
    data,
    2,
    null,
    broadcast,
  );
  expect(integer(data)).toBe(19);
});
it("filters locales individually through a direct localized item", /** Direct items reach the value filter that property-level partial admission bypasses. @returns Nothing. */ () => {
  const data = fixture(),
    filter = new Partial([u("/test.C/G/L/en")], []);
  parse(
    `<oor:items ${namespaces}><item oor:path="/test.C/G/L"><value xml:lang="en">yes</value><value xml:lang="de"><ignored/></value></item></oor:items>`,
    data,
    1,
    filter,
  );
  expect(node(data, "G/L").getMember(u("en"))).toBeInstanceOf(LocalizedValueNode);
  expect(node(data, "G/L").getMember(u("de"))).toBe(null);
});
it("honors later-layer and finalized plain/localized property gates", /** Preloaded native node metadata is visible through the actual shared tree. @returns Nothing. */ () => {
  const data = fixture();
  node(data, "G/P").setLayer(3);
  node(data, "G/L").setLayer(3);
  parse(group('<prop oor:name="P"><bad/></prop><prop oor:name="L"><bad/></prop>'), data, 2);
  node(data, "G/LN").setFinalized(1);
  parse(group('<prop oor:name="LN"><bad/></prop>'), data, 2);
  expect(integer(data)).toBe(7);
});
it("updates localized nil twice and ignores later locale values", /** Existing value ownership and user-modification flags are retained. @returns Nothing. */ () => {
  const data = fixture();
  parse(group('<prop oor:name="L"><value xml:lang="en" xsi:nil="true"/></prop>'), data, 2);
  parse(group('<prop oor:name="L"><value xml:lang="en"><bad/></value></prop>'), data, 1);
  parse(
    group(
      '<prop oor:name="L"><value xml:lang="en" xsi:nil="true"/><value xml:lang="missing" oor:op="remove"/></prop>',
    ),
    data,
    Data.NO_LAYER,
  );
  const value = node(data, "G/L").getMember(u("en")) as LocalizedValueNode;
  expect(value.isModified()).toBe(true);
  expect(value.getValue().hasValue()).toBe(false);
});
it("preserves localized Any type handling and finalization before replacement", /** Real localized property metadata is used instead of a dynamic value adapter. @returns Nothing. */ () => {
  const data = fixture();
  node(data).getMembers().getOrInsert(u("LA")).second = new LocalizedPropertyNode(
    0,
    Type.TYPE_ANY,
    true,
  );
  parse(
    group(
      '<prop oor:name="LA" oor:type="xs:int"><value xml:lang="en" oor:type="xs:int">31</value></prop><prop oor:name="L" oor:op="replace" oor:finalized="true"><value xml:lang="en">text</value></prop>',
    ),
    data,
    2,
  );
  expect(node(data, "G/L").getFinalized()).toBe(2);
  const out: [number] = [0];
  expect(
    (node(data, "G/LA").getMember(u("en")) as LocalizedValueNode)
      .getValue()
      .extract(out, "sal_Int32"),
  ).toBe(true);
  expect(out[0]).toBe(31);
});
it("covers set fuse/modify and replacement without new additions", /** Existing result nodes remain actual template clones. @returns Nothing. */ () => {
  const data = fixture(),
    additions: Additions = [];
  parse(group('<node oor:name="S"><node oor:name="a" oor:op="fuse"/></node>'), data);
  const old = node(data, "G/S/a");
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:op="fuse"/><node oor:name="a" oor:op="modify"/></node>',
    ),
    data,
    2,
    null,
    null,
    additions,
  );
  expect(node(data, "G/S/a")).toBe(old);
  parse(
    group('<node oor:name="S"><node oor:name="a" oor:op="replace"/></node>'),
    data,
    3,
    null,
    null,
    additions,
  );
  expect(additions).toEqual([]);
  expect(node(data, "G/S/a")).not.toBe(old);
  parse(
    group('<node oor:name="S"><node oor:name="a"><ignored/></node></node>'),
    data,
    3,
    new Partial([u("/test.C/G/S/other")], []),
  );
});
it("rejects undefined and accepts explicit foreign templates through the original registry", /** Set template allowlists and Data visibility stay independent. @returns Nothing. */ () => {
  const data = fixture();
  data.templates.erase(u("test.C:T"));
  rejects(
    /** Default template is allowed but unavailable. @returns Data if accepted. */ () =>
      parse(group('<node oor:name="S"><node oor:name="a" oor:op="fuse"/></node>'), data),
    "undefined template",
  );
  const set = node(data, "G/S") as SetNode;
  set.getAdditionalTemplateNames().push(u("foreign:T"));
  data.templates.insert({ first: u("foreign:T"), second: new GroupNode(0, false, u("foreign:T")) });
  parse(
    group(
      '<node oor:name="S"><node oor:name="a" oor:component="foreign" oor:node-type="T" oor:op="fuse"/></node>',
    ),
    data,
  );
  expect(text(node(data, "G/S/a").getTemplateName())).toBe("foreign:T");
});
it("retains erroneous prop kind and root-item checked preconditions", /** Concrete actual graph owners exercise public producer boundaries. @returns Nothing. */ () => {
  rejects(
    /** An actual group cannot be addressed using prop syntax. @returns Data if accepted. */ () =>
      parse(group('<prop oor:name="Sub"/>')),
    "inappropriate prop",
  );
  expect(
    /** The root lookup has no component segment for an item. @returns Data if accepted. */ () =>
      parse(`<oor:items ${namespaces}><item oor:path="/"/></oor:items>`),
  ).toThrow("!path_.empty()");
});

it("finalizes a newly inserted extension property before later updates", /** The creating update writes its value; subsequent updates respect the retained finalized layer. @returns Nothing. */ () => {
  const data = fixture();
  parse(
    group(
      '<prop oor:name="Extension" oor:op="replace" oor:type="xs:int" oor:finalized="true"><value>41</value></prop>',
    ),
    data,
    4,
  );
  expect((node(data, "G/Extension") as PropertyNode).isExtension()).toBe(true);
  expect(node(data, "G/Extension").getFinalized()).toBe(4);
  expect(integer(data, "G/Extension")).toBe(41);
  parse(group('<prop oor:name="Extension" oor:op="remove"><ignored/></prop>'), data, 5);
  expect(integer(data, "G/Extension")).toBe(41);
});

it("decodes actual plain and localized separator lists through shared typed sequences", /** This verifies attribute-to-ValueParser data flow, including localized values. @returns Nothing. */ () => {
  const data = fixture();
  node(data).getMembers().getOrInsert(u("LL")).second = new LocalizedPropertyNode(
    0,
    Type.TYPE_INT_LIST,
    true,
  );
  parse(
    group(
      '<prop oor:name="List"><value oor:separator=",">1,2,3</value></prop><prop oor:name="LL"><value xml:lang="en" oor:separator="::">4::5</value></prop>',
    ),
    data,
  );
  const values = [
    (node(data, "G/List") as PropertyNode).getValue(local),
    (node(data, "G/LL").getMember(u("en")) as LocalizedValueNode).getValue(),
  ];
  const expected = [
      [1, 2, 3],
      [4, 5],
    ],
    Ints = Sequence.specialize<[number]>("sal_Int32", 4);
  for (let i = 0; i < values.length; i++) {
    const sequence = new Ints();
    try {
      expect((values[i] as Any).extract(sequence.getAddress(), ["Sequence", "sal_Int32"])).toBe(
        true,
      );
      const actual: number[] = [];
      for (let j = 0; j < sequence.getLength(); j++) actual.push(sequence.operatorIndex(j)[0]);
      expect(actual).toEqual(expected[i]);
    } finally {
      sequence.dispose();
    }
  }
});
