/** @fileoverview Real native manifest PropertyValue sequences,ordered SAX events and ODT/ODS XML semantics; encrypted/legacy branches remain explicit admission limits. */
import { expect, it } from "vitest";
import fixture from "./native-manifest-cases.json";
import { SaxesParser } from "saxes";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { ManifestExport } from "./ManifestExport";
import { createManifestXml } from "./ManifestWriter";
import { XmlStringDocumentHandler } from "../../../sax/source/expatwrap/saxwriter";
import { AttributeList } from "../../../comphelper/inc/attributelist";
import * as mime from "../../../comphelper/inc/documentconstants";
import { sequence, property, unicode } from "../../../test/fixtures/manifest";
/** Parses actual emitted XML attribute values. @param xml - XML. @returns Element attributes. */
function parsed(xml: string): Record<string, string>[] {
  const elements: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on(
    "opentag",
    /** Captures actual decoded attributes. @param tag - Parsed tag. @returns Nothing. */ (tag) =>
      elements.push(tag.attributes as Record<string, string>),
  );
  parser.write(xml).close();
  return elements;
}
it("exports each original OASIS MIME including Calc ODS and template with caller-owned streams", /** No application stream names are hardcoded in shared export. @returns Nothing. */ () => {
  for (const value of Object.values(mime)) {
    const entries = sequence(value);
    entries.push([property("FullPath", "settings.xml"), property("MediaType", "text/xml")]);
    const nodes = parsed(createManifestXml(entries));
    expect(nodes[0]?.["manifest:version"]).toBe("1.3");
    expect(nodes[0]?.["xmlns:loext"]).toBe(
      "urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0",
    );
    expect(nodes[1]?.["manifest:media-type"]).toBe(value);
    expect(nodes[1]?.["manifest:version"]).toBe("1.3");
    expect(nodes.at(-1)?.["manifest:full-path"]).toBe("settings.xml");
  }
});
it("keeps original lexical document version decisions and omits empty entry versions", /** Old OASIS versions still have entry version attributes. @returns Nothing. */ () => {
  for (const version of ["", "1.0", "1.1", "1.10", "1.2", "1.3", "1.4"]) {
    const entries = sequence(mime.MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET, version);
    entries.push([property("FullPath", "empty/"), property("Version", "")]);
    const nodes = parsed(createManifestXml(entries));
    expect(nodes[0]?.["manifest:version"]).toBe(version >= "1.2" ? version : undefined);
    expect(nodes[1]?.["manifest:version"]).toBe(version || undefined);
    expect(nodes.at(-1)?.["manifest:version"]).toBeUndefined();
  }
});
it("retains source property order,int64 size,unknown properties and exact attribute character values", /** Exercises actual Any string and integer extraction. @returns Nothing. */ () => {
  const entries = sequence();
  entries.push([
    property("Ignored", "value"),
    property("Size", 9223372036854775807n),
    property("MediaType", 'x/\t\n\r<&"'),
    property("Version", "1.3"),
    property("FullPath", 'Pictures/🧮 & "<x>.bin'),
  ]);
  const node = parsed(createManifestXml(entries)).at(-1) as Record<string, string>;
  expect(Object.keys(node)).toEqual([
    "manifest:size",
    "manifest:media-type",
    "manifest:version",
    "manifest:full-path",
  ]);
  expect(node).toEqual({
    "manifest:size": "9223372036854775807",
    "manifest:media-type": 'x/\t\n\r<&"',
    "manifest:version": "1.3",
    "manifest:full-path": 'Pictures/🧮 & "<x>.bin',
  });
});
it("preserves original failed-extraction destination values rather than inventing a coercion", /** String scratch survives a failed Version extraction;Size initializes independently. @returns Nothing. */ () => {
  const entries = sequence();
  entries.push([
    property("MediaType", "kept"),
    property("Version", new Any(true)),
    property("FullPath", new Any(true)),
    property("Size", new Any(true)),
  ]);
  const node = parsed(createManifestXml(entries)).at(-1);
  expect(node).toEqual({
    "manifest:media-type": "kept",
    "manifest:version": "kept",
    "manifest:full-path": "",
    "manifest:size": "0",
  });
});
it("delivers exact native whitespace and ordered attributes without clearing retained SAX lists", /** An observer retains actual ref-counted-list equivalents under GC. @returns Nothing. */ () => {
  const handler = new XmlStringDocumentHandler(),
    lists: AttributeList[] = [],
    events: string[] = [];
  const input = sequence();
  input.splice(1);
  new ManifestExport(
    {
      startDocument: /** Original begin. @returns Nothing. */ () => {
        events.push("begin");
        handler.startDocument();
      },
      endDocument: /** Original finish. @returns Nothing. */ () => {
        events.push("finish");
        handler.endDocument();
      },
      startElement:
        /** Retains actual lists. @param name - Name. @param attrs - List. @returns Nothing. */ (
          name,
          attrs,
        ) => {
          lists.push(attrs as AttributeList);
          events.push("start");
          handler.startElement(name, attrs);
        },
      endElement: /** Original end. @param name - Name. @returns Nothing. */ (name) => {
        events.push("end");
        handler.endElement(name);
      },
      ignorableWhitespace: /** Original space. @param value - Space. @returns Nothing. */ (
        value,
      ) => {
        events.push("space");
        handler.ignorableWhitespace(value);
      },
    },
    input,
  );
  expect(events).toEqual([
    "begin",
    "start",
    "space",
    "start",
    "space",
    "end",
    "space",
    "end",
    "finish",
  ]);
  expect(
    lists.map(
      /** Counts retained entries. @param list - Native list. @returns Count. */ (list) =>
        list.getLength(),
    ),
  ).toEqual([3, 3]);
  expect(parsed(handler.getXml())).toHaveLength(2);
  for (const list of lists) list.Clear();
});
it("keeps original root scan early completion while subsequent entry emission retains duplicates", /** Native AttributeList duplicate admission is not normalized. @returns Nothing. */ () => {
  const input = sequence();
  (input[0] as ReturnType<typeof property>[]).push(property("Version", "1.0"));
  const xml = createManifestXml(input);
  expect(xml).toContain('manifest:version="1.3" xmlns:loext=');
  expect(xml).toContain('manifest:version="1.3" manifest:version="1.0"');
});
it("rejects native missing/duplicate root preconditions and unimplemented legacy/encrypted branches before output", /** No unsupported export is silently emitted as plain XML. @returns Nothing. */ () => {
  const duplicate = sequence();
  duplicate.push([
    property("FullPath", "/"),
    property("MediaType", mime.MIMETYPE_OASIS_OPENDOCUMENT_TEXT),
  ]);
  for (const entries of [
    [],
    duplicate,
    sequence("application/zip"),
    [...sequence(), [property("KeyInfo", new Any())]],
    [...sequence(), [property("FullPath", "encrypted-package")]],
  ]) {
    const handler = new XmlStringDocumentHandler();
    expect(
      /** Executes actual admission. @returns Exporter. */ () =>
        new ManifestExport(handler, entries),
    ).toThrow();
    expect(handler.getXml()).toBe("");
  }
});
it("serializes the worker-safe null-attribute event branch without requiring a DOM or native Writer service", /** Actual handler callbacks only. @returns Nothing. */ () => {
  const handler = new XmlStringDocumentHandler(),
    name = unicode("root");
  handler.startDocument();
  handler.startElement(name, null);
  handler.endElement(name);
  handler.endDocument();
  expect(parsed(handler.getXml())).toEqual([{}]);
  name.dispose();
});

it("re-emits the actual upstream ODS fixture manifest entries without inventing mandatory Writer streams", /** Checks extracted metadata,not native ZIP64 acceptance or a spreadsheet document. @returns Nothing. */ () => {
  const original = parsed(fixture.manifestXml),
    entries = original.slice(1).map(
      /** Reconstructs native manifest properties from original attributes. @param attrs - Original entry attributes. @returns Actual properties. */ (
        attrs,
      ) =>
        Object.entries(attrs).map(
          /** Maps original property names. @param pair - Expanded name/value. @returns Native property. */ ([
            name,
            value,
          ]) =>
            property(
              (
                {
                  "manifest:full-path": "FullPath",
                  "manifest:media-type": "MediaType",
                  "manifest:version": "Version",
                } as Record<string, string>
              )[name] as string,
              value,
            ),
        ),
    );
  const result = parsed(createManifestXml(entries));
  expect(result.slice(1)).toEqual(original.slice(1));
  expect(result[0]?.["manifest:version"]).toBe("1.2");
  expect(
    result
      .slice(1)
      .map(/** Reads path. @param a - Attributes. @returns Path. */ (a) => a["manifest:full-path"]),
  ).toEqual(["/", "styles.xml", "content.xml"]);
});

it("rejects forbidden XML10 attribute characters and malformed UTF16 as native SAX export does", /** Native isWellFormed replaces only the confirmed surrogate acceptance predicate. @returns Nothing. */ () => {
  for (const value of [
    "\u0000",
    "\u0008",
    "\u000b",
    "\u000c",
    "\u001f",
    "\ufffe",
    "\uffff",
    "\ud800",
    "\udc00",
    "\ud800x",
    "\ud800\ud800",
  ]) {
    const entries = sequence();
    entries.push([property("FullPath", value)]);
    expect(
      /** Runs the actual browser serializer. @returns XML. */ () => createManifestXml(entries),
    ).toThrow("Invalid character during XML-Export");
  }
});
