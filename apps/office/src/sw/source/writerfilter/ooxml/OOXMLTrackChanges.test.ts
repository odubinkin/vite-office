/** @fileoverview Actual committed ZIP TrackChange XML attributes through native SAX actions and TrackChangesHandler; downstream document redline creation remains separate. */
import { expect, it } from "vitest";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { OOXMLDocument } from "./OOXMLDocumentImpl";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { OOXMLFactory_wml, nativeToken } from "./OOXMLFactory_wml";
import { defines } from "./OOXMLFactory_wml.tables";
import { TrackChangesHandler } from "../dmapper/TrackChangesHandler";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../../offapi/com/sun/star/util/DateTime";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { WriteRelationsInfoSequence } from "../../../../comphelper/source/xml/ofopxmlhelper";
import { readNumberingProperty } from "../../core/unocore/unosett-properties";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import type { Stream, Reference, Properties } from "../inc/dmapper/resourcemodel";

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
  "resolves source TrackChange attributes before native clearProps for %s",
  /** Uses an actual body range-markup producer; this does not claim table model insertion. @param namespace - Document namespace. @param relation - Native relationship namespace. @returns Nothing. */ async (
    namespace,
    relation,
  ) => {
    const storage = new ZipStorage();
    /** Commits actual part bytes to native package storage. @param path - Part path. @param xml - Original XML. @returns Nothing. */
    function put(path: string, xml: string): void {
      storage.openOutputStream(path, "application/xml").writeBytes(new TextEncoder().encode(xml));
    }
    put(
      "[Content_Types].xml",
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    );
    put(
      "_rels/.rels",
      WriteRelationsInfoSequence([
        [
          { First: "Id", Second: "root" },
          { First: "Type", Second: relation + "officeDocument" },
          { First: "Target", Second: "word/document.xml" },
        ],
      ]),
    );
    put(
      "word/document.xml",
      `<w:document xmlns:w="${namespace}"><w:body><w:p><w:customXmlInsRangeStart w:id="42" w:author="Author😀" w:date="2008-01-21T10:42:05+02:30"/><w:customXmlInsRangeEnd w:id="42"/></w:p></w:body></w:document>`,
    );
    const sets: Reference<Properties>[] = [],
      events: string[] = [];
    const output: Stream = {
      /** Records actual native resource delivery. @param properties - Stored reference. @returns Nothing. */ props(
        properties,
      ) {
        sets.push(properties);
      },
      /** Records section grouping without supplying a document model. @returns Nothing. */ startSectionGroup() {
        events.push("section+");
      },
      /** Records section closure. @returns Nothing. */ endSectionGroup() {
        events.push("section-");
      },
      /** Records native last-section marker. @returns Nothing. */ markLastSectionGroup() {
        events.push("section-last");
      },
      /** Records paragraph grouping. @returns Nothing. */ startParagraphGroup() {
        events.push("paragraph+");
      },
      /** Records paragraph closure. @returns Nothing. */ endParagraphGroup() {
        events.push("paragraph-");
      },
      /** Records last paragraph marker. @returns Nothing. */ markLastParagraphInSection() {
        events.push("paragraph-last");
      },
      /** Records character grouping. @returns Nothing. */ startCharacterGroup() {
        events.push("run+");
      },
      /** Records character closure. @returns Nothing. */ endCharacterGroup() {
        events.push("run-");
      },
      /** Records original UTF16 bytes without replacing the mapper. @param data - Units. @param length - Native logical length. @returns Nothing. */ utext(
        data,
        length,
      ) {
        events.push("utext:" + Array.from(data.subarray(0, length)).join(","));
      },
      /** Records original byte text if emitted. @param data - Bytes. @param length - Native length. @returns Nothing. */ text(
        data,
        length,
      ) {
        events.push("text:" + Array.from(data.subarray(0, length)).join(","));
      },
      /** Records native information callback. @param value - Text. @returns Nothing. */ info(
        value,
      ) {
        events.push("info:" + value);
      },
      /** Rejects a resource-table callback from this document-only fixture. @returns Never. */ table() {
        throw new Error("Unexpected resource table");
      },
    };
    const main = await OOXMLStreamImpl.createStream(new ZipStorage(storage.commit())),
      document = new OOXMLDocument(main, null),
      parser = main.getFastParser();
    parser.setFastDocumentHandler(new OOXMLFastDocumentHandler(output, document, 0));
    parser.setTokenHandler(main.getFastTokenHandler());
    const xml = main.getDocumentXml();
    if (!xml) throw new Error("Missing committed document XML");
    parser.parseStream(xml);
    const definition = Object.entries(defines).find(
      /** Selects the actual native paragraph definition. @param entry - Generated entry. @returns Match. */ (
        entry,
      ) => entry[1] === "CT_P",
    );
    if (!definition) throw new Error("Missing paragraph definition");
    const id = OOXMLFactory_wml.getInstance().getResourceId(
      Number(definition[0]),
      nativeToken("doc:customXmlInsRangeStart"),
    );
    expect(id).not.toBe(0);
    let original: Reference<Properties> | null = null;
    for (const set of sets)
      set.resolve({
        /** Container attributes do not identify the original wrapped change set. @param id - ID. @param value - Value. @returns Nothing. */ attribute(
          id,
          value,
        ) {
          void id;
          void value;
        },
        /** Borrows exactly the native wrapped reference sent before clearProps. @param modifier - Native modifier. @returns Nothing. */ sprm(
          modifier,
        ) {
          if (modifier.getId() === id) original = modifier.getProps();
        },
      });
    if (!original) throw new Error("Missing original TrackChange properties");
    const changes = new TrackChangesHandler(0);
    (original as Reference<Properties>).resolve(changes);
    const values = changes.getRedlineProperties(),
      author = readNumberingProperty(values, 1),
      timestamp = readNumberingProperty(values, 2),
      name = unicode(""),
      date = new DateTime();
    try {
      expect(author.Value.extract(name, "OUString")).toBe(true);
      expect(text(name)).toBe("Author😀");
      expect(timestamp.Value.extract(date, cppu_detail_getUnoType_DateTime)).toBe(true);
      expect([
        date.Year,
        date.Month,
        date.Day,
        date.Hours,
        date.Minutes,
        date.Seconds,
        date.IsUTC,
      ]).toEqual([2008, 1, 21, 10, 42, 5, false]);
    } finally {
      name.dispose();
      author.Name.dispose();
      author.Value.dispose();
      timestamp.Name.dispose();
      timestamp.Value.dispose();
      values.dispose();
      changes.dispose();
    }
    expect(events).toContain("paragraph+");
    expect(events).toContain("utext:13");
  },
);
