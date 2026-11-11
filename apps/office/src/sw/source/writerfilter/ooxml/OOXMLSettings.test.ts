/** @fileoverview Native complex settings resources, hexadecimal defaults and TOKEN_COUNT dispatch boundaries through the actual SAX/context graph. */
import { expect, it } from "vitest";
import { FastSaxParser } from "../../../../sax/source/fastparser/fastparser";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { OOXMLDocument } from "./OOXMLDocumentImpl";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import {
  OOXMLFastContextHandler as Base,
  OOXMLFastContextHandlerValue as ValueContext,
} from "./OOXMLFastContextHandler";
import { OOXMLFactory, ResourceType } from "./OOXMLFactory";
import { OOXMLFactory_wml, nativeToken } from "./OOXMLFactory_wml";
import { defines, elements } from "./OOXMLFactory_wml.tables";
import { streamNamespaces } from "./OOXMLFactory.tables";
import { OOXMLValue } from "./OOXMLPropertySet";
import { XML_TOKEN_COUNT } from "../../../../oox/source/token/tokenmap";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { Properties, Reference, Stream, Value } from "../inc/dmapper/resourcemodel";
import { text } from "../../core/unocore/unocrsrhelper";

/** Receives original ordered properties without flattening duplicate source modifiers. @param properties - Native resource reference. @returns Ordered resource values. */
function rows(properties: Reference<Properties>): [number, Value][] {
  const result: [number, Value][] = [];
  properties.resolve({
    /** Receives a native attribute. @param id - Resource ID. @param value - Value. @returns Nothing. */
    attribute(id, value) {
      result.push([id, value]);
    },
    /** Receives an original modifier. @param modifier - Modifier. @returns Nothing. */
    sprm(modifier) {
      const value = modifier.getValue();
      if (value) result.push([modifier.getId(), value]);
    },
  });
  return result;
}
/** Finds a source resource without constructing defaults for missing callbacks. @param values - Original rows. @param id - Resource ID. @returns Actual value. */
function get(values: [number, Value][], id: number): Value {
  const value = values.find(
    /** Matches native identity. @param row - Row. @returns Match. */ (row) => row[0] === id,
  )?.[1];
  if (!value) throw new Error("Missing source resource " + id);
  return value;
}
/** Resolves an actual nested property reference. @param value - Native property value. @returns Original rows. */
function nested(value: Value): [number, Value][] {
  const properties = value.getProperties();
  if (!properties) throw new Error("Missing nested properties");
  return rows(properties);
}
/** Reads and destroys a genuine returned string. @param value - Native value. @returns Text. */
function string(value: Value): string {
  const owned = value.getString();
  try {
    return text(owned);
  } finally {
    owned.dispose();
  }
}

it.each([
  "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  "http://purl.oclc.org/ooxml/wordprocessingml/main",
])(
  "retains complex settings values and duplicate revision IDs in %s",
  /** Actual parser/factory delivery; no document DTO or alternate XML parser is used. @param namespace - Native WML namespace. @returns Completion. */ async (
    namespace,
  ) => {
    let delivered: [number, Value][] = [];
    /** Settings parts must deliver resource tables only. @returns Never. */
    function unexpected(): never {
      throw new Error("Unexpected body event");
    }
    const receiver: Stream = {
      props: unexpected,
      text: unexpected,
      utext: unexpected,
      info: unexpected,
      startSectionGroup: unexpected,
      endSectionGroup: unexpected,
      markLastSectionGroup: unexpected,
      startParagraphGroup: unexpected,
      endParagraphGroup: unexpected,
      markLastParagraphInSection: unexpected,
      startCharacterGroup: unexpected,
      endCharacterGroup: unexpected,
      /** Original table and property references retain source entry order. @param id - Original table ID. @param table - Native table reference. @returns Nothing. */
      table(id, table) {
        expect(id).toBe(N.LN_settings_settings);
        table.resolve({
          /** Receives the actual settings property-table entry. @param index - Position. @param properties - Native reference. @returns Nothing. */
          entry(index, properties) {
            expect(index).toBe(0);
            delivered = rows(properties);
          },
        });
      },
    };
    const parser = new FastSaxParser();
    const stream = await OOXMLStreamImpl.createStream(new ZipStorage());
    const document = new OOXMLDocument(stream, null);
    parser.setFastDocumentHandler(new OOXMLFastDocumentHandler(receiver, document, 0));
    parser.setTokenHandler(new FastTokenHandler());
    for (const [uri, token] of streamNamespaces) parser.registerNamespace(uri, token);
    try {
      parser.parseStream(
        `<w:settings xmlns:w="${namespace}"><w:zoom w:val="bestFit" w:percent="120"/><w:proofState w:spelling="dirty" w:grammar="clean"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="urn:word" w:val="15"/></w:compat><w:rsids><w:rsidRoot/><w:rsid w:val="FFFFFFFF"/><w:rsid w:val="00000002"/></w:rsids><w:themeFontLang w:val="ru-RU" w:eastAsia="ja-JP" w:bidi="ar-SA"/></w:settings>`,
      );
      const zoom = nested(get(delivered, N.LN_CT_Settings_zoom));
      expect(get(zoom, N.LN_CT_Zoom_val).getInt()).toBe(N.LN_Value_doc_ST_Zoom_bestFit);
      expect(get(zoom, N.LN_CT_Zoom_percent).getInt()).toBe(120);
      const proof = nested(get(delivered, N.LN_CT_Settings_proofState));
      expect(string(get(proof, N.LN_CT_Proof_spelling))).toBe("dirty");
      expect(string(get(proof, N.LN_CT_Proof_grammar))).toBe("clean");
      expect(get(delivered, N.LN_CT_Settings_defaultTabStop).getInt()).toBe(720);
      expect(string(get(delivered, N.LN_CT_Settings_characterSpacingControl))).toBe(
        "doNotCompress",
      );
      const compat = nested(
        get(nested(get(delivered, N.LN_CT_Settings_compat)), N.LN_CT_Compat_compatSetting),
      );
      expect(string(get(compat, N.LN_CT_CompatSetting_name))).toBe("compatibilityMode");
      expect(string(get(compat, N.LN_CT_CompatSetting_uri))).toBe("urn:word");
      expect(string(get(compat, N.LN_CT_CompatSetting_val))).toBe("15");
      const revisions = nested(get(delivered, N.LN_CT_Settings_rsids));
      expect(
        revisions.map(
          /** Observes native ordered repeated resource identities and signed projection of hex uint32. @param row - Resource. @returns Pair. */ (
            row,
          ) => [row[0], row[1].getInt()],
        ),
      ).toEqual([
        [N.LN_CT_DocRsids_rsidRoot, 0],
        [N.LN_CT_DocRsids_rsid, -1],
        [N.LN_CT_DocRsids_rsid, 2],
      ]);
      const languages = nested(get(delivered, N.LN_CT_Settings_themeFontLang));
      expect(string(get(languages, N.LN_CT_Language_val))).toBe("ru-RU");
      expect(string(get(languages, N.LN_CT_Language_eastAsia))).toBe("ja-JP");
      expect(string(get(languages, N.LN_CT_Language_bidi))).toBe("ar-SA");
    } finally {
      parser.dispose();
      document.dispose();
      stream.dispose();
    }
  },
);

it("keeps the native hexadecimal default variant and preserves existing values", /** Genuine source default methods on original context owners. @returns Nothing. */ () => {
  const base = new Base();
  base.setDefaultHexValue();
  expect(base.getValue().hasValue()).toBe(false);
  const value = new ValueContext(base);
  value.setDefaultHexValue();
  expect(value.getValue().getInt()).toBe(0);
  const any = value.getValue().getAny();
  try {
    expect(any.hasValue()).toBe(false);
  } finally {
    any.dispose();
  }
  value.setValue(OOXMLValue.createHex(0xffffffff));
  value.setDefaultHexValue();
  expect(value.getValue().getInt()).toBe(-1);
});

it("retains the original namespaced TOKEN_COUNT table row while the native dispatch guard rejects it", /** The original generator's unnamed-any record is a sentinel, not a wildcard token match. @returns Nothing. */ () => {
  const define = Number(
    Object.entries(defines).find(
      /** Exact source definition. @param row - Definition. @returns Match. */ (row) =>
        row[1] === "CT_ShapeDefaults",
    )?.[0],
  );
  const row = elements.find(
    /** Original native sentinel entry. @param row - Mapping. @returns Match. */ (row) =>
      row[0] === define,
  );
  expect(row).toBeDefined();
  const token = nativeToken(row?.[1] as number);
  expect(token & 0xffff).toBe(XML_TOKEN_COUNT);
  const resource: [ResourceType] = [ResourceType.NoResource],
    target: [number] = [-1];
  expect(OOXMLFactory_wml.getInstance().getElementId(define, token, resource, target)).toBe(true);
  expect([resource[0], target[0]]).toEqual([ResourceType.Any, 0]);
  const parent = new Base();
  parent.setDefine(define);
  expect(OOXMLFactory.createFastChildContext(parent, token)).toBeNull();
});
