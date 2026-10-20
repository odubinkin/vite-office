/** @fileoverview Original XCS complete schema/default/template/merge histories over actual configuration owners and unchanged pinned Common.xcs. */
import commonSource from "../../officecfg/registry/schema/org/openoffice/Office/Common.xcs?raw";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Data } from "./data";
import { Node } from "./node";
import { GroupNode } from "./groupnode";
import { SetNode } from "./setnode";
import { PropertyNode, type PropertyNodeComponents } from "./propertynode";
import { LocalizedPropertyNode } from "./localizedpropertynode";
import { LocalizedValueNode } from "./localizedvaluenode";
import { XcsParser } from "./xcsparser";
import { ParseManager } from "./parsemanager";
/** Real UTF16 caller value. @param value - Exact text. @returns Native owner. */
function u(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Encodes one unit. @param c - Unit. @returns Value. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Reads exact native text. @param value - Native string view. @returns Text. */
function text(value: ReturnType<Node["getDescription"]>): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** No external values exist in these original schema fixtures. */
const local: PropertyNodeComponents = {
  getExternalValue: /** Flags an unintended service call. @returns Never. */ () => {
    throw new Error("unexpected external lookup");
  },
};
/** Reads an actual schema bool. @param node - Actual ordinary node. @returns Boolean. */
function bool(node: Node | null): boolean {
  expect(node).toBeInstanceOf(PropertyNode);
  const out: [boolean] = [false];
  expect((node as PropertyNode).getValue(local).extract(out, "bool")).toBe(true);
  return out[0];
}
/** Original root wrapper for source-derived fixtures. @param body - Exact schema content. @param attrs - Root metadata. @returns Native XML document. */
function schema(body: string, attrs = 'oor:package="test" oor:name="Schema"'): string {
  return (
    '<oor:component-schema xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" ' +
    attrs +
    ">" +
    body +
    "</oor:component-schema>"
  );
}
/** Runs the real driver/parser into real shared Data. @param xml - Complete schema bytes. @param layer - Native source layer. @param data - Existing tree. @returns Actual data. */
function parse(xml: string, layer = 0, data = new Data()): Data {
  expect(
    new ParseManager(
      u("fixture.xcs"),
      new XcsParser(layer, data),
      new TextEncoder().encode(xml),
    ).parse(null),
  ).toBe(true);
  return data;
}
/** Asserts actual UNO diagnostic fields. @param run - Original call. @param message - Source diagnostic fragment. @returns Nothing. */
function throwsMessage(run: () => unknown, message: string): void {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  expect(text((caught as RuntimeException).Message)).toContain(message);
}
it("parses the unchanged complete pinned Common.xcs and all thirty SearchOptions bool defaults", /** Actual schema bytes are the authority, not a defaults service substitute. @returns Nothing. */ () => {
  const bytes = Buffer.from(commonSource, "utf8");
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(
    "68638aecc184c70e0262905a8c3b2a8e369ed26b28d83f3bd381a3f68a6cb630",
  );
  expect(bytes.toString()).toContain("Mozilla Public");
  const data = new Data();
  expect(new ParseManager(u("Common.xcs"), new XcsParser(0, data), bytes).parse(null)).toBe(true);
  const common = data.getComponents().findNode(0, u("org.openoffice.Office.Common")) as GroupNode,
    search = common.getMember(u("SearchOptions")) as GroupNode;
  expect(search).toBeInstanceOf(GroupNode);
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
  for (const [path, wanted] of Object.entries(expected)) {
    const parts = path.split("/");
    let node: Node = search;
    for (const name of parts) node = node.getMember(u(name)) as Node;
    expect(bool(node), path).toBe(wanted);
    expect((node as PropertyNode).isNillable()).toBe(false);
    expect((node as PropertyNode).isModified()).toBe(false);
  }
  expect(Object.keys(expected)).toHaveLength(30);
  expect(search.getMember(u("ComponentSearchGroupLabel"))).toBeInstanceOf(LocalizedPropertyNode);
  expect(Array.from(data.templates).length).toBe(9);
});
it("constructs typed properties, localized defaults, templates, references and allowed set templates", /** All nodes come from real parser transitions. @returns Nothing. */ () => {
  const data = parse(
    schema(
      '<templates><group oor:name="T" oor:extensible="true"><prop oor:name="A" oor:type="xs:boolean"><value>true</value></prop></group><set oor:name="S" oor:node-type="T"><item oor:component="other" oor:node-type="Extra"/></set></templates><component><node-ref oor:name="Ref" oor:node-type="T"/><set oor:name="Rows" oor:node-type="T"><item oor:node-type="S"/></set><prop oor:name="L" oor:type="xs:string" oor:localized="true" oor:nillable="false"><value>localized</value></prop><prop oor:name="N" oor:type="xs:string"/><prop oor:name="Many" oor:type="oor:int-list"><value oor:separator="::">1::2</value></prop></component>',
    ),
  );
  const component = data.getComponents().findNode(0, u("test.Schema")) as GroupNode,
    ref = component.getMember(u("Ref")) as GroupNode,
    template = data.getTemplate(0, u("test.Schema:T")) as GroupNode;
  expect(ref).not.toBe(template);
  expect(ref.getTemplateName().isEmpty()).toBe(true);
  expect(template.getTemplateName().equals(u("test.Schema:T"))).toBe(true);
  expect(ref.getMember(u("A"))).not.toBe(template.getMember(u("A")));
  expect(bool(ref.getMember(u("A")))).toBe(true);
  expect(ref.isExtensible()).toBe(true);
  const rows = component.getMember(u("Rows")) as SetNode;
  expect(text(rows.getDefaultTemplateName())).toBe("test.Schema:T");
  expect(
    rows
      .getAdditionalTemplateNames()
      .map(/** Observes names. @param name - Actual value. @returns Text. */ (name) => text(name)),
  ).toEqual(["test.Schema:S"]);
  expect(
    (data.getTemplate(0, u("test.Schema:S")) as SetNode).isValidTemplate(u("other:Extra")),
  ).toBe(true);
  const localized = component.getMember(u("L")) as LocalizedPropertyNode,
    child = localized.getMember(u("")) as LocalizedValueNode,
    out = new OUString();
  expect(child.getValue().extract(out, "OUString")).toBe(true);
  expect(text(out)).toBe("localized");
  expect(localized.isNillable()).toBe(false);
  expect((component.getMember(u("N")) as PropertyNode).getValue(local).hasValue()).toBe(false);
});
it("retains shared description accumulation and ignored-tag character flow", /** Source info text is collected even while desc tags are ignored, and the shared buffer clears only when a property closes. @returns Nothing. */ () => {
  const data = parse(
    schema(
      '<info><desc>schema</desc></info><component><group oor:name="G"><info><desc>group</desc></info><prop oor:name="A" oor:type="xs:string"><info><desc> property  one </desc></info><value>a<desc>b</desc>c</value></prop><prop oor:name="B" oor:type="xs:string"><info><desc> next\n  line </desc></info></prop></group></component>',
    ),
  );
  const group = (data.getComponents().findNode(0, u("test.Schema")) as GroupNode).getMember(
      u("G"),
    ) as GroupNode,
    a = group.getMember(u("A")) as PropertyNode,
    b = group.getMember(u("B")) as PropertyNode,
    value = new OUString();
  expect(text(a.getDescription())).toBe("schemagroup property one");
  expect(text(b.getDescription())).toBe("next\n line");
  expect(a.getValue(local).extract(value, "OUString")).toBe(true);
  expect(text(value)).toBe("abc");
});
it.each(["", "<info><desc>empty extension</desc></info>", "<templates/>"])(
  "retains original empty-schema compatibility %j",
  /** A bare empty schema is accepted but templates without component are rejected. @param body - Body. @returns Nothing. */ (
    body,
  ) => {
    if (body === "<templates/>")
      expect(
        /** Invokes original missing-component rejection. @returns Data. */ () =>
          parse(schema(body)),
      ).toThrow();
    else expect(Array.from(parse(schema(body)).getComponents())).toEqual([]);
  },
);
it.each([
  '<component><prop oor:type="xs:boolean"/></component>',
  '<component><prop oor:name="P"/></component>',
  '<component><prop oor:name="P" oor:type="boolean"/></component>',
  "<component><group/></component>",
  '<component><set oor:name="S"/></component>',
  '<component><set oor:node-type="T"/></component>',
  '<component><node-ref oor:name="R" oor:node-type="Unknown"/></component>',
  '<component><node-ref oor:node-type="T"/></component>',
  '<component><set oor:name="S" oor:node-type="T"><item/></set></component>',
  '<component><prop oor:name="P" oor:type="xs:string"><value oor:separator=""/></prop></component>',
  '<component><prop oor:name="P" oor:type="xs:boolean" oor:localized="1"/></component>',
  "<component><bad/></component>",
  '<component><prop oor:name="P" oor:type="xs:boolean"/><prop oor:name="P" oor:type="xs:boolean"/></component>',
])(
  "retains source schema rejection %j",
  /** Original validation and duplicate timing are not relaxed. @param body - Invalid source body. @returns Nothing. */ (
    body,
  ) => {
    expect(/** Parses invalid schema. @returns Data. */ () => parse(schema(body))).toThrow();
  },
);
it("retains missing root metadata and layered template visibility errors", /** References cannot see a template at a later layer; completed earlier templates survive later errors. @returns Nothing. */ () => {
  throwsMessage(
    /** Missing package. @returns Data. */ () => parse(schema("", 'oor:name="N"')),
    "no component-schema package",
  );
  throwsMessage(
    /** Missing name. @returns Data. */ () => parse(schema("", 'oor:package="p"')),
    "no component-schema name",
  );
  const data = parse(schema('<templates><group oor:name="T"/></templates><component/>'), 2);
  throwsMessage(
    /** Later-layer reference is invisible. @returns Data. */ () =>
      parse(schema('<component><node-ref oor:name="R" oor:node-type="T"/></component>'), 1, data),
    "unknown node-ref",
  );
  const partial = new Data();
  expect(
    /** Completed template is retained on a later bad reference. @returns Data. */ () =>
      parse(
        schema(
          '<templates><group oor:name="T"/></templates><component><node-ref oor:name="R" oor:node-type="Missing"/></component>',
        ),
        0,
        partial,
      ),
  ).toThrow();
  expect(partial.getTemplate(0, u("test.Schema:T"))).toBeInstanceOf(GroupNode);
});
it("merges only new ordinary properties into an existing extensible group while retaining previous defaults", /** Native conservative merge ignores new groups/localized properties and existing scalar values. @returns Nothing. */ () => {
  const data = parse(
    schema(
      '<component><group oor:name="G" oor:extensible="true"><prop oor:name="A" oor:type="xs:boolean"><value>true</value></prop></group><group oor:name="Fixed"/></component>',
    ),
  );
  const component = data.getComponents().findNode(0, u("test.Schema")) as GroupNode,
    group = component.getMember(u("G")) as GroupNode;
  parse(
    schema(
      '<component><group oor:name="G" oor:extensible="false"><prop oor:name="A" oor:type="xs:boolean"><value>false</value></prop><prop oor:name="B" oor:type="xs:boolean"><value>false</value></prop><prop oor:name="L" oor:type="xs:string" oor:localized="true"/><group oor:name="Ignored"/></group><group oor:name="Fixed"><prop oor:name="No" oor:type="xs:boolean"/></group></component>',
    ),
    1,
    data,
  );
  expect(bool(group.getMember(u("A")))).toBe(true);
  expect(bool(group.getMember(u("B")))).toBe(false);
  expect(group.getMember(u("L"))).toBe(null);
  expect(group.getMember(u("Ignored"))).toBe(null);
  expect((component.getMember(u("Fixed")) as GroupNode).getMember(u("No"))).toBe(null);
  expect(group.isExtensible()).toBe(true);
});
