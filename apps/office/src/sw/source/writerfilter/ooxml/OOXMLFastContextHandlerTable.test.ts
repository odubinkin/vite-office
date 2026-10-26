/** @fileoverview Native resource-table and property-table contexts through real DOCX ZIP input, SAX factories, value tables and ordered reference callbacks. */
import { expect, it } from "vitest";
import {
  OOXMLFastContextHandler as Base,
  OOXMLFastContextHandlerTable as TableContext,
  OOXMLFastContextHandlerPropertyTable as PropertyTable,
  ResourceEnum_t,
} from "./OOXMLFastContextHandler";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { OOXMLDocument } from "./OOXMLDocumentImpl";
import { OOXMLFactory } from "./OOXMLFactory";
import { nativeToken as token } from "./OOXMLFactory_wml";
import { OOXMLPropertySet, OOXMLPropertyType, OOXMLValue as V } from "./OOXMLPropertySet";
import type { Stream, Table, Reference, Properties, Value } from "../inc/dmapper/resourcemodel";
import { StreamType_t } from "../inc/ooxml/OOXMLDocument";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { WriteRelationsInfoSequence } from "../../../../comphelper/source/xml/ofopxmlhelper";
import { text } from "../../core/unocore/unocrsrhelper";

/** Test-only callback receiver rejects accidental non-table delivery. @returns Actual Stream callback contract and retained table references. */
function receiver() {
  const tables: [number, Reference<Table>][] = [];
  /** Rejects callbacks outside this resource-table stream. @returns Never. */
  function unexpected(): never {
    throw new Error("Unexpected non-table callback");
  }
  const stream: Stream = {
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
    /** Retains the original cloned table reference and resource identity. @param id - Native ID. @param table - Table. @returns Nothing. */
    table(id, table) {
      tables.push([id, table]);
    },
  };
  return { stream, tables };
}
/** Resolves table entries without projecting resource values into a document model. @param table - Actual native reference. @returns Positional property sets. */
function entries(table: Reference<Table>): [number, Reference<Properties>][] {
  const result: [number, Reference<Properties>][] = [];
  table.resolve({
    /** Receives original entry position and borrowed property set. @param index - Position. @param properties - Set. @returns Nothing. */
    entry(index, properties) {
      result.push([index, properties]);
    },
  });
  return result;
}
/** Resolves attributes and modifiers in their native stored order. @param properties - Native reference. @returns Ordered values. */
function values(properties: Reference<Properties>): [number, Value][] {
  const result: [number, Value][] = [];
  properties.resolve({
    /** Retains the original attribute value. @param id - Native ID. @param value - Value. @returns Nothing. */
    attribute(id, value) {
      result.push([id, value]);
    },
    /** Retains the original modifier's owned value. @param sprm - Native modifier. @returns Nothing. */
    sprm(sprm) {
      const value = sprm.getValue();
      if (value) result.push([sprm.getId(), value]);
    },
  });
  return result;
}
/** Gets one actual resource's Unicode value and releases its temporary owner. @param properties - Set. @param id - Native identity. @returns String or absent. */
function string(properties: Reference<Properties>, id: number): string | undefined {
  const value = values(properties).find(
    /** Selects the exact native resource identity. @param entry - Stored resource. @returns Match. */ (
      entry,
    ) => entry[0] === id,
  )?.[1];
  if (!value) return undefined;
  const unicode = value.getString();
  try {
    return text(unicode);
  } finally {
    unicode.dispose();
  }
}
/** Writes actual ZIP part bytes. @param storage - Native host storage. @param path - Part path. @param xml - XML. @returns Nothing. */
function put(storage: ZipStorage, path: string, xml: string): void {
  storage.openOutputStream(path, "application/xml").writeBytes(new TextEncoder().encode(xml));
}

it.each([
  [
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/",
  ],
  [
    "http://purl.oclc.org/ooxml/wordprocessingml/main",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/",
  ],
] as const)(
  "routes ZIP style resources through table contexts for %s",
  /** Opens the relationship-selected styles stream and its real SAX parser. @param namespace - Native namespace. @param relationNamespace - Relationship base. @returns Nothing. */ async (
    namespace,
    relationNamespace,
  ) => {
    const storage = new ZipStorage();
    put(
      storage,
      "_rels/.rels",
      WriteRelationsInfoSequence([
        [
          { First: "Id", Second: "root" },
          { First: "Type", Second: relationNamespace + "officeDocument" },
          { First: "Target", Second: "word/main.xml" },
        ],
      ]),
    );
    put(storage, "word/main.xml", `<w:document xmlns:w="${namespace}"/>`);
    put(
      storage,
      "word/_rels/main.xml.rels",
      WriteRelationsInfoSequence([
        [
          { First: "Id", Second: "styles" },
          { First: "Type", Second: relationNamespace + "styles" },
          { First: "Target", Second: "../styles/data.xml" },
        ],
      ]),
    );
    put(
      storage,
      "styles/data.xml",
      `<w:styles xmlns:w="${namespace}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><w:docDefaults><w:rPrDefault><w:rPr><w:b/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:styleId="Normal" w:default="1" w:type="paragraph"><w:name w:val="Normal"/><w:rPr><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="character" w:styleId="Strong"><w:name w:val="Strong"/><w:rPr><w:b/></w:rPr></w:style><mc:AlternateContent><mc:Choice Requires="w14"><w:style w:styleId="Chosen"><w:name w:val="Chosen"/></w:style></mc:Choice><mc:Fallback><w:style w:styleId="Skipped"><w:name w:val="Skipped"/></w:style></mc:Fallback></mc:AlternateContent></w:styles>`,
    );
    const main = await OOXMLStreamImpl.createStream(new ZipStorage(storage.commit())),
      part = await OOXMLStreamImpl.createStream(main, StreamType_t.STYLES),
      output = receiver(),
      parser = part.getFastParser();
    const document = new OOXMLDocument(part, null);
    expect(document.getXNoteId()).toBe(0);
    document.setXNoteId(-1);
    expect(document.getXNoteId()).toBe(-1);
    document.incrementProgress();
    expect(document.getTarget()).toBe("styles/data.xml");
    expect(document.getTargetForId("missing")).toBe("");
    parser.setFastDocumentHandler(new OOXMLFastDocumentHandler(output.stream, document, 7));
    parser.setTokenHandler(part.getFastTokenHandler());
    const xml = part.getDocumentXml();
    if (xml === null) throw new Error("Missing real styles part");
    parser.parseStream(xml);
    expect(document.getXNoteId()).toBe(7);
    expect(part.getTarget()).toBe("styles/data.xml");
    expect(output.tables).toHaveLength(1);
    const delivered = output.tables[0] as [number, Reference<Table>];
    expect(delivered[0]).toBe(N.LN_STYLESHEET);
    const styles = entries(delivered[1]);
    expect(
      styles.map(
        /** Retains original resource positions. @param entry - Entry. @returns Position. */ (
          entry,
        ) => entry[0],
      ),
    ).toEqual([0, 1, 2, 3]);
    const defaults = styles[0]?.[1] as Reference<Properties>,
      normal = styles[1]?.[1] as Reference<Properties>,
      strong = styles[2]?.[1] as Reference<Properties>;
    expect(
      values(defaults).map(
        /** Reads the native default property IDs. @param entry - Entry. @returns ID. */ (entry) =>
          entry[0],
      ),
    ).toEqual([N.LN_CT_DocDefaults_rPrDefault]);
    expect(string(normal, N.LN_CT_Style_styleId)).toBe("Normal");
    expect(string(normal, N.LN_CT_Style_name)).toBe("Normal");
    expect(string(strong, N.LN_CT_Style_styleId)).toBe("Strong");
    expect(string(strong, N.LN_CT_Style_name)).toBe("Strong");
    expect(string(styles[3]?.[1] as Reference<Properties>, N.LN_CT_Style_styleId)).toBe("Chosen");
  },
);

it("emits an empty cloned table and preserves nonzero-ID/forwarding guards", /** Uses actual factory-assigned style resource identity and public context flags. @returns Nothing. */ async () => {
  const output = receiver(),
    document = new OOXMLDocument(await OOXMLStreamImpl.createStream(new ZipStorage()), null),
    handler = new OOXMLFastDocumentHandler(output.stream, document, 0),
    context = handler.createFastChildContext(token("doc:styles"));
  expect(context).toBeInstanceOf(TableContext);
  const table = context as TableContext;
  expect(table.getResource()).toBe(ResourceEnum_t.TABLE);
  table.startFastElement(token("doc:styles"), []);
  table.endFastElement(token("doc:styles"));
  expect(entries((output.tables[0] as [number, Reference<Table>])[1])).toEqual([]);
  table.setForwardEvents(false);
  table.endFastElement(token("doc:styles"));
  table.setForwardEvents(true);
  table.setId(0);
  table.endFastElement(token("doc:styles"));
  expect(output.tables).toHaveLength(1);
  expect(table.createFastChildContext(token("doc:unmapped"))).toBeNull();
});

it("retains native current-child state and clones only the table vector at each delivery", /** Repeated closure deliberately collects the last child again, as in upstream. @returns Nothing. */ async () => {
  const output = receiver(),
    document = new OOXMLDocument(await OOXMLStreamImpl.createStream(new ZipStorage()), null),
    handler = new OOXMLFastDocumentHandler(output.stream, document, 0),
    table = handler.createFastChildContext(token("doc:styles")) as TableContext;
  const child = table.createFastChildContext(token("doc:style")) as Base;
  child.startFastElement(token("doc:style"), [{ token: token("doc:styleId"), value: "Retained" }]);
  child.endFastElement(token("doc:style"));
  table.endFastElement(token("doc:styles"));
  table.endFastElement(token("doc:styles"));
  const first = entries((output.tables[0] as [number, Reference<Table>])[1]),
    second = entries((output.tables[1] as [number, Reference<Table>])[1]);
  expect(first).toHaveLength(1);
  expect(second).toHaveLength(2);
  expect(first[0]?.[1]).toBe(second[0]?.[1]);
  expect(string(first[0]?.[1] as Reference<Properties>, N.LN_CT_Style_styleId)).toBe("Retained");
});

it("clones property sets before unconditional property-table delivery even at zero ID with forwarding disabled", /** Preserves the native difference from ordinary resource-table suppression. @returns Nothing. */ () => {
  const output = receiver(),
    parent = new Base(),
    context = new PropertyTable(parent);
  parent.setStream(output.stream);
  context.setStream(output.stream);
  context.setForwardEvents(false);
  expect(context.getResource()).toBe(ResourceEnum_t.PROPERTIES);
  const properties = new OOXMLPropertySet();
  properties.add(1, V.createInteger(10), OOXMLPropertyType.ATTRIBUTE);
  context.setPropertySet(properties);
  context.endFastElement(token("doc:settings"));
  properties.add(2, V.createInteger(20), OOXMLPropertyType.ATTRIBUTE);
  context.endFastElement(token("doc:settings"));
  expect(
    output.tables.map(
      /** Reads original zero IDs without normalization. @param entry - Delivery. @returns ID. */ (
        entry,
      ) => entry[0],
    ),
  ).toEqual([0, 0]);
  const first = entries((output.tables[0] as [number, Reference<Table>])[1]),
    second = entries((output.tables[1] as [number, Reference<Table>])[1]);
  expect(first).toHaveLength(1);
  expect(second).toHaveLength(2);
  expect(first[0]?.[1]).not.toBe(properties);
  expect(
    values(first[0]?.[1] as Reference<Properties>).map(
      /** Reads immutable snapshot values. @param entry - Resource. @returns Pair. */ (entry) => [
        entry[0],
        entry[1].getInt(),
      ],
    ),
  ).toEqual([[1, 10]]);
  expect(
    values(second[1]?.[1] as Reference<Properties>).map(
      /** Reads latest cloned set. @param entry - Resource. @returns Pair. */ (entry) => [
        entry[0],
        entry[1].getInt(),
      ],
    ),
  ).toEqual([
    [1, 10],
    [2, 20],
  ]);
  expect(
    /** The factory reaches the native property-table owner but preserves the unported definition guard. @returns Never. */ () =>
      OOXMLFactory.createFastChildContextFromStart(new Base(), token("doc:settings")),
  ).toThrow("OOXML definition is not implemented");
});
