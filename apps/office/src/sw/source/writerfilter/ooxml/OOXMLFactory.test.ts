/** @fileoverview Pinned native factory tables, exact fast-token identities, attribute order and typed resource dispatch into actual Writer property maps and SwDoc text APIs. */
import { expect, it } from "vitest";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { ResourceType as R } from "./OOXMLFactory";
import { OOXMLFactory as Factory, type FactoryAttributeHandler } from "./OOXMLFactory";
import { OOXMLFactory_wml, nativeToken } from "./OOXMLFactory_wml";
import * as tables from "./OOXMLFactory_wml.tables";
import { OOXMLPropertySet, OOXMLPropertyType as T, OOXMLValue as V } from "./OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import * as TokenMap from "../../../../oox/source/token/tokenmap";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { NamespaceMap } from "../../../../oox/source/token/namespacemap";
import { streamNamespaces } from "./OOXMLFactory.tables";
import { DomainMapper } from "../dmapper/DomainMapper";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { createWriterDocument } from "../../core/doc/doc";
import { unicode, text } from "../../core/unocore/unocrsrhelper";

it("retains every native stream namespace registration identity and duplicate URI collapse order", /** Independently compares generated registrations with original namespace input maps. @returns Nothing. */ () => {
  const maps = new NamespaceMap(),
    expected = new Map<string, number>();
  for (const [id, uri] of maps.maTransitionalNamespaceMap) {
    expected.set(uri, id);
    expected.set(maps.maStrictNamespaceMap.get(id) as string, id);
  }
  expect(streamNamespaces).toEqual(
    [...expected].sort(
      /** Native factory generator sorts URI bytes. @param a - First row. @param b - Second row. @returns Order. */ (
        a,
        b,
      ) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
    ),
  );
  expect(streamNamespaces).toHaveLength(82);
});

/** Source-generated definition identity lookup for readable source-contract cases. @param name - Native define name. @returns Native numeric ID. */
function define(name: string): number {
  return Number(
    Object.entries(tables.defines).find(
      /** Exact native name. @param entry - Entry. @returns Match. */ (entry) => entry[1] === name,
    )?.[0],
  );
}
/** An original attribute handler retains actual native resource values; its properties can resolve into production DomainMapper. */
class Receiver implements FactoryAttributeHandler {
  readonly properties = new OOXMLPropertySet();
  readonly ids: number[] = [];
  value = new V();
  /** Native context identity. @param id - Definition. @returns Receiver. */ constructor(
    private readonly id: number,
  ) {}
  /** Original define getter. @returns Identity. */ getDefine(): number {
    return this.id;
  }
  /** Original attribute channel. @param id - Resource identity. @param value - Native value. @returns Nothing. */ newProperty(
    id: number,
    value: V,
  ): void {
    this.ids.push(id);
    this.properties.add(id, value, T.ATTRIBUTE);
  }
  /** Original native Value-context attribute action. @param value - Native value. @returns Nothing. */ setValue(
    value: V,
  ): void {
    this.value = value.clone();
  }
}

it("retains exact generated namespace, definition and fast-token identities rather than assigning local context numbers", /** Checks source-generated native identities and namespace boundaries. @returns Nothing. */ () => {
  const factory = OOXMLFactory_wml.getInstance();
  expect(OOXMLFactory_wml.getInstance()).toBe(factory);
  expect(define("CT_P")).toBe(1769851);
  expect(define("CT_OnOff")).toBe(1769846);
  expect(Factory.getFactoryForNamespace(define("CT_P"))).toBe(factory);
  expect(Factory.getFactoryForNamespace(0)).toBeNull();
  expect(nativeToken("doc:val")).toBe(
    (namespaceTokens.get("doc") as number) | TokenMap.getTokenFromUtf8("val"),
  );
  expect(nativeToken(":val")).toBe(TokenMap.getTokenFromUtf8("val"));
  expect(nativeToken("missing:val")).toBe(-1);
  expect(nativeToken("doc:not-a-native-token")).toBe(-1);
  expect(factory.getDefineName(0)).toBe("start");
  expect(factory.getDefineName(-1)).toBeNull();
  for (const [id, name] of Object.entries(tables.defines))
    expect(factory.getDefineName(Number(id))).toBe(name);
});

it("retains every generated attribute/element/resource/list mapping and failure-preserving output cells", /** Exercises all original lookup rows and fallback switches. @returns Nothing. */ () => {
  const factory = OOXMLFactory_wml.getInstance();
  for (const [id, token, kind, ref] of tables.attributes) {
    const info = factory
      .getAttributeInfoArray(id)
      ?.find(
        /** Matches original token. @param info - Entry. @returns Match. */ (info) =>
          info.m_nToken === nativeToken(token),
      );
    expect(info).toEqual({ m_nToken: nativeToken(token), m_nResource: R[kind], m_nRef: ref });
  }
  expect(factory.getAttributeInfoArray(-1)).toBeNull();
  for (const [id, token, kind, ref] of tables.elements) {
    const resource: [R] = [R.NoResource],
      element: [number] = [-1];
    expect(factory.getElementId(id, nativeToken(token), resource, element)).toBe(true);
    expect([resource[0], element[0]]).toEqual([R[kind], ref]);
  }
  for (const [id, token, resource] of tables.resources)
    expect(factory.getResourceId(id, nativeToken(token))).toBe(resource);
  for (const [id, value, token] of tables.lists) {
    const out: [number] = [-1];
    expect(factory.getListValue(id, value, out)).toBe(true);
    expect(out[0]).toBe(token);
  }
  const output: [number] = [42],
    resource: [R] = [R.Stream],
    element: [number] = [43];
  expect(factory.getListValue(-1, "left", output)).toBe(false);
  expect(output[0]).toBe(42);
  expect(factory.getListValue(define("ST_Jc"), "LEFT", output)).toBe(false);
  expect(output[0]).toBe(42);
  expect(factory.getElementId(-1, nativeToken("doc:document"), resource, element)).toBe(true);
  expect(
    factory.getElementId(define("CT_OnOff"), nativeToken("doc:document"), resource, element),
  ).toBe(true);
  expect(factory.getElementId(define("CT_P"), nativeToken("doc:document"), resource, element)).toBe(
    false,
  );
  expect(factory.getElementId(-1, -1, resource, element)).toBe(false);
  expect(factory.getResourceId(-1, nativeToken("doc:document"))).toBe(
    factory.getResourceId(0, nativeToken("doc:document")),
  );
  expect(factory.getResourceId(define("CT_P"), -1)).toBe(0);
  expect(factory.getResourceId(-1, -1)).toBe(0);
  const before = [resource[0], element[0]];
  expect(factory.getElementId(define("CT_P"), -1, resource, element)).toBe(false);
  expect([resource[0], element[0]]).toEqual(before);
  expect(
    factory
      .getActions(define("CT_OnOff"), "start")
      .map(/** Reads native action. @param row - Action. @returns Name. */ (row) => row[2]),
  ).toEqual(["setDefaultBooleanValue"]);
  expect(factory.getActions(-1, "start")).toEqual([]);
});

it("uses original typed lexical conversions, integer prefix/overflow rules and invalid-list admission", /** Checks all original Factory::attributes resource variants. @returns Nothing. */ () => {
  const factory = OOXMLFactory_wml.getInstance();
  for (const [kind, input, expected] of [
    [R.Boolean, "True", 1],
    [R.Boolean, "TRUE", 0],
    [R.Integer, " +42tail", 42],
    [R.Integer, "2147483648", 0],
    [R.Hex, "ff", 255],
    [R.HexColor, "#123456", 0x123456],
    [R.EmuMeasure, "1pt", 12700],
    [R.TwipsMeasure_asSigned, "-1pt", -20],
    [R.TwipsMeasure_asZero, "-1pt", 0],
    [R.TwipsMeasure_asZero, "1pt", 20],
    [R.HpsMeasure, "12pt", 24],
    [R.MeasurementOrPercent, "33.3%", 1664],
  ] as const)
    expect(Factory.createAttributeValue(kind, 0, input, factory).getInt()).toBe(expected);
  const value = Factory.createAttributeValue(R.String, 0, "字😀", factory).getString();
  expect(text(value)).toBe("字😀");
  value.dispose();
  expect(Factory.createAttributeValue(R.List, define("ST_Jc"), "center", factory).getInt()).toBe(
    N.LN_Value_ST_Jc_center,
  );
  expect(Factory.createAttributeValue(R.List, define("ST_Jc"), "CENTER", factory).hasValue()).toBe(
    false,
  );
  expect(Factory.createAttributeValue(R.NoResource, 0, "anything", factory).hasValue()).toBe(false);
});

it("dispatches attributes in native schema order and resolves converted indent values through actual Writer model APIs", /** Checks source dispatch plus canonical SwDoc mutations, without an XML-to-document DTO. @returns Nothing. */ () => {
  const model = new SwXTextDocument(createWriterDocument()),
    mapper = new DomainMapper(model),
    receiver = new Receiver(define("CT_Ind"));
  Factory.attributes(receiver, [
    { token: nativeToken("doc:firstLine"), value: "360" },
    { token: nativeToken("doc:left"), value: "720" },
    { token: nativeToken("doc:right"), value: "1440" },
  ]);
  const order = OOXMLFactory_wml.getInstance()
    .getAttributeInfoArray(define("CT_Ind"))
    ?.map(
      /** Reads native schema order. @param row - Info. @returns Token. */ (row) => row.m_nToken,
    );
  expect(receiver.ids).toEqual(
    (order ?? [])
      .filter(
        /** Selects provided schema attributes. @param token - Token. @returns Present. */ (
          token,
        ) =>
          [
            nativeToken("doc:left"),
            nativeToken("doc:right"),
            nativeToken("doc:firstLine"),
          ].includes(token),
      )
      .map(
        /** Resolves native resource identity. @param token - Token. @returns ID. */ (token) =>
          OOXMLFactory_wml.getInstance().getResourceId(define("CT_Ind"), token),
      ),
  );
  mapper.startParagraphGroup();
  mapper.props(receiver.properties);
  mapper.startCharacterGroup();
  const s = unicode("native");
  mapper.utext(s.getStr().subarray(0, s.getLength()));
  s.dispose();
  mapper.endCharacterGroup();
  mapper.utext(new Uint16Array([13]));
  mapper.endParagraphGroup();
  mapper.finishDocument();
  const node = model.GetDoc().paragraphs[0];
  expect(node?.GetText()).toBe("native");
  expect(node?.GetParagraphTextLeftMargin()).toBe(720);
  expect(node?.GetParagraphRightMargin()).toBe(1440);
  expect(node?.GetParagraphFirstLineIndent()).toBe(360);
  const on = new Receiver(define("CT_OnOff"));
  Factory.attributes(on, [{ token: nativeToken("doc:val"), value: "on" }]);
  expect(on.value.getInt()).toBe(1);
  OOXMLFactory_wml.getInstance().attributeAction(
    on,
    nativeToken("doc:other"),
    V.createBoolean(false),
  );
  expect(on.value.getInt()).toBe(1);
  const unknown = new Receiver(-1);
  Factory.attributes(unknown, []);
  expect(unknown.ids).toEqual([]);
  const noAttrs = new Receiver(define("CT_Body"));
  Factory.attributes(noAttrs, []);
  expect(noAttrs.ids).toEqual([]);
  const absent = new Receiver(define("CT_OnOff"));
  Factory.attributes(absent, [{ token: nativeToken(":val"), value: "1" }]);
  expect(absent.value.hasValue()).toBe(false);
  const invalid = new Receiver(define("CT_Jc"));
  Factory.attributes(invalid, [{ token: nativeToken("doc:val"), value: "invalid" }]);
  expect(invalid.value.hasValue()).toBe(false);
  mapper.dispose();
  model.dispose();
});

it.skipIf(!existsSync("../../vendor/libreoffice-reference/sw/source/writerfilter/ooxml/model.xml"))(
  "regenerates every consumed table through unchanged pinned native generators",
  /** Checks native names, IDs, inherited schema lookup and ordering together. @returns Nothing. */ () => {
    const output = execFileSync(
      "python3",
      ["../../scripts/writer-ooxml/generate-factory.py", "--check"],
      { encoding: "utf8" },
    );
    expect(output).toContain("attributes=97, elements=355, resources=418, lists=315, actions=41");
  },
);
