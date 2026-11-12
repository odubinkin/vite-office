/** @fileoverview Actual ZIP input snapshots expose native stream/property/relationship components with source metadata precedence, ownership and failure boundaries. */
import { expect, it, vi } from "vitest";
import { SEEKABLEREAD } from "../../../offapi/com/sun/star/embed/ElementModes";
import { ZipStorage } from "./zipstorage";
import { DocumentArchiveWriter } from "../../../package/source/zippackage/document-archive";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { nativeString, nativeText, observePairRows } from "../../../test/ofopxml-values";
import { readOwnedXml } from "../../../test/oox-input";
const types =
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="default/one"/><Default Extension=".xml" ContentType="default/two"/><Override PartName="/word/document.xml" ContentType="override/one"/><Override PartName="word/document.xml" ContentType="override/two"/><Override PartName="/absent.xml" ContentType="ignored"/></Types>';
/** Builds a raw actual ZIP, allowing deliberately missing/bad content metadata. @param entries - Entries. @param contentTypes - Internal metadata or explicit absence. @returns Bytes. */
async function archive(
  entries: Readonly<Record<string, string>>,
  contentTypes: string | null = types,
): Promise<Uint8Array> {
  const zip = new DocumentArchiveWriter();
  if (contentTypes !== null)
    zip.putNextEntry("[Content_Types].xml", new TextEncoder().encode(contentTypes));
  for (const [path, data] of Object.entries(entries))
    zip.putNextEntry(path, new TextEncoder().encode(data));
  return await zip.finish();
}
/** Destroys an original caught exception once. @param operation - Native operation. @param type - Expected constructor. @returns Nothing. */
function exception(operation: () => unknown, type: unknown): void {
  try {
    operation();
    throw new Error("Expected native exception");
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error.constructor).toBe(type);
    } finally {
      error.dispose();
    }
  }
}
it("exposes the native READ component, exact metadata and original package MIME application order", /** Original package parse applies defaults then explicit overrides, distinct from GetContentTypeByName extension-first lookup. @returns Completion. */ async () => {
  const storage = await ZipStorage.open(
    await archive({
      "word/": "",
      "word/document.xml": "<root/>",
      "word/other.xml": "<other/>",
      "other.XML": "<case/>",
      "word/_rels/document.xml.rels":
        '<Relationships><Relationship Id="r" Type="t" Target="😀.xml"/></Relationships>',
    }),
  );
  const input = await storage.openInputStream("word/document.xml"),
    stream = input.query(XStream.static_type),
    properties = input.query(XPropertySet.static_type),
    relationships = input.query(XRelationshipAccess.static_type),
    seekable = input.query(XSeekable.static_type);
  const media = nativeString("MediaType"),
    compressed = nativeString("Compressed"),
    size = nativeString("Size"),
    hidden = nativeString("RelationsInfo"),
    text = nativeString("");
  try {
    expect(input.is()).toBe(true);
    expect(stream.get()).toBe(input.get());
    expect(seekable.is()).toBe(false);
    const p = properties.get() as XPropertySet,
      m = p.getPropertyValue(media),
      c = p.getPropertyValue(compressed),
      n = p.getPropertyValue(size);
    const rows = (relationships.get() as XRelationshipAccess).getAllRelationships();
    try {
      expect(m.extract(text, "OUString")).toBe(true);
      expect(nativeText(text)).toBe("override/two");
      const boolean: [boolean] = [true],
        length: [bigint] = [0n];
      expect(c.extract(boolean, "bool")).toBe(true);
      expect(boolean[0]).toBe(false);
      expect(n.extract(length, "sal_Int64")).toBe(true);
      expect(length[0]).toBe(7n);
      expect(observePairRows(rows)).toEqual([
        [
          { First: "Id", Second: "r" },
          { First: "Type", Second: "t" },
          { First: "Target", Second: "😀.xml" },
        ],
      ]);
      exception(
        /** Native internal property remains hidden. @returns Any. */ () =>
          p.getPropertyValue(hidden),
        UnknownPropertyException,
      );
      const alias = (stream.get() as XStream).getInputStream();
      try {
        expect(alias.get()).toBe(input.get());
      } finally {
        alias.dispose();
      }
    } finally {
      rows.dispose();
      n.dispose();
      c.dispose();
      m.dispose();
    }
    expect(storage.getElementNames()).not.toContain("[Content_Types].xml");
    const internal = await storage.openInputStream("[Content_Types].xml"),
      folder = await storage.openInputStream("word/");
    try {
      expect(internal.is()).toBe(false);
      expect(folder.is()).toBe(false);
    } finally {
      folder.dispose();
      internal.dispose();
    }
    for (const [path, expected] of [
      ["word/other.xml", "default/two"],
      ["other.XML", ""],
    ]) {
      const other = await storage.openInputStream(path as string),
        props = other.query(XPropertySet.static_type);
      try {
        const value = (props.get() as XPropertySet).getPropertyValue(media);
        try {
          value.extract(text, "OUString");
          expect(nativeText(text)).toBe(expected);
        } finally {
          value.dispose();
        }
      } finally {
        props.dispose();
        other.dispose();
      }
    }
  } finally {
    text.dispose();
    hidden.dispose();
    size.dispose();
    compressed.dispose();
    media.dispose();
    seekable.dispose();
    relationships.dispose();
    properties.dispose();
    stream.dispose();
    input.dispose();
  }
});
it("keeps independent input positions and native close state for retained interface references", /** Closing one READ snapshot cannot close the next independently opened stream. @returns Completion. */ async () => {
  const storage = await ZipStorage.open(await archive({ "part.xml": "<part/>" }));
  const first = await storage.openInputStream("part.xml"),
    second = await storage.openInputStream("part.xml"),
    stream = first.query(XStream.static_type),
    Bytes = Sequence.specialize<number>("sal_Int8", 1),
    data = new Bytes();
  try {
    expect(first.get()).not.toBe(second.get());
    expect((first.get() as XInputStream).readBytes(data, 1)).toBe(1);
    (first.get() as XInputStream).closeInput();
    exception(
      /** Retained stream is the same disposed component. @returns Input. */ () =>
        (stream.get() as XStream).getInputStream(),
      DisposedException,
    );
    expect(readOwnedXml(second)).toBe("<part/>");
  } finally {
    data.dispose();
    stream.dispose();
    first.dispose();
  }
});
it.each([null, "<Types><bad/></Types>", " "])(
  "rejects missing/broken package content metadata%s",
  /** Source format refusal returns empty input references and never caches an owned exception for reuse. @param contentTypes - Metadata. @returns Completion. */ async (
    contentTypes,
  ) => {
    const storage = await ZipStorage.open(await archive({ "part.xml": "<part/>" }, contentTypes)),
      disposal = vi.spyOn(IOException.prototype, "dispose");
    try {
      const copies = await Promise.all([
        storage.openInputStream("part.xml"),
        storage.openInputStream("part.xml"),
      ]);
      for (const copy of copies) {
        expect(copy.is()).toBe(false);
        copy.dispose();
      }
      const later = await storage.openInputStream("part.xml");
      try {
        expect(later.is()).toBe(false);
      } finally {
        later.dispose();
      }
      expect(disposal.mock.calls.length).toBeGreaterThan(0);
      expect(new Set(disposal.mock.contexts).size).toBe(disposal.mock.calls.length);
    } finally {
      disposal.mockRestore();
    }
  },
);
it("refuses malformed own relationships instead of returning a stream with an empty table", /** Native BROKEN/InsertOwnProps refusal is exercised through the real package input API. @returns Completion. */ async () => {
  const storage = await ZipStorage.open(
    await archive({
      "part.xml": "<part/>",
      "_rels/part.xml.rels": "<Relationships><broken/></Relationships>",
    }),
  );
  const input = await storage.openInputStream("part.xml");
  try {
    expect(input.is()).toBe(false);
  } finally {
    input.dispose();
  }
});

it("keeps READ separate from seekable hierarchical snapshots and propagates native open errors", /** Existing flat transport creates actual readonly components; it does not certify full hierarchy/parent storage behavior. @returns Completion. */ async () => {
  const storage = await ZipStorage.open(await archive({ "word/document.xml": "<root/>" })),
    first = await storage.openStreamElementByHierarchicalName("word/document.xml", SEEKABLEREAD),
    second = await storage.openStreamElementByHierarchicalName("word/document.xml", SEEKABLEREAD),
    seek = first.query(XSeekable.static_type),
    other = second.query(XSeekable.static_type);
  try {
    expect(first.get()).not.toBe(second.get());
    (seek.get() as XSeekable).seek(4n);
    expect((other.get() as XSeekable).getPosition()).toBe(0n);
    expect((seek.get() as XSeekable).getLength()).toBe(7n);
    (first.get() as XStream).getInputStream().dispose();
  } finally {
    other.dispose();
    seek.dispose();
    second.dispose();
    first.dispose();
  }
  for (const path of ["absent.xml", "[Content_Types].xml", "word/"]) {
    try {
      await storage.openStreamElementByHierarchicalName(path, SEEKABLEREAD);
      throw new Error("Expected IOException");
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      try {
        expect(nativeText(error.Message)).toBe("");
      } finally {
        error.dispose();
      }
    }
  }
});
