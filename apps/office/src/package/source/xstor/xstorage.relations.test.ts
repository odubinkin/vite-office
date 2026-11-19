/** @fileoverview Exercises native package relationship input and read state through pinned OOXML archives and round trips. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, assert, beforeAll, expect, it } from "vitest";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { READ, READWRITE, TRUNCATE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { XRelationshipAccess } from "../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OFOPXML, ZIP } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { own, releaseDomScope, u } from "../../../test/native-dom";
import { inputFromBytes } from "../../../test/oox-input";
import { writeOutput } from "../../../test/oox-output";
import { nativeText, observePairRows } from "../../../test/ofopxml-values";
import {
  cppu_detail_getUnoType_PropertyValue as propertyType,
  type PropertyValue,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { OStorage_Impl } from "./xstorage.impl";
import { RelInfoStatus } from "./xstorage.relations";

const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
const packageRoot = resolve("../../vendor/libreoffice-reference");

beforeAll(
  /** Initializes the production native package runtime. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);

/** Opens actual OOXML package data from a native stream. @param input - Files or saved output. @returns Owned package storage. */
function open(input: Reference<XInputStream>): OStorage_Impl {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  return own(new OStorage_Impl(input, READ, own(new Properties()), context, OFOPXML, "input"));
}

/** Provides a fresh persistence stream and the real package owner. @returns Owned fixture objects. */
function writable() {
  const destination = own(new Reference(new UNOMemoryStream())),
    context = own(new Reference<XComponentContext>(getProcessComponentContext())),
    root = own(
      new OStorage_Impl(destination, READWRITE, own(new Properties()), context, OFOPXML, "stream"),
    );
  return { destination: destination.operatorStar(), root };
}

/** Stores one part through the actual package cache. @param root - Storage. @param name - Direct part name. @param text - Raw data. @returns Nothing. */
function writeMember(root: OStorage_Impl, name: string, text: string): void {
  const stream = own(root.OpenTruncatedStream(u(name), READWRITE | TRUNCATE)),
    output = own(stream.operatorStar().getOutputStream()),
    bytes = new TextEncoder().encode(text);
  writeOutput(output.operatorStar(), bytes);
}

/** Stages a seekable root relationship stream at its beginning. @param root - Actual package. @param xml - New relationship XML. @returns Backing memory stream. */
function stage(root: OStorage_Impl, xml: string): UNOMemoryStream {
  const owner = own(new Reference(new UNOMemoryStream())).operatorStar(),
    bytes = new TextEncoder().encode(xml);
  writeOutput(owner, bytes);
  owner.seek(0n);
  const input = own(owner.getInputStream());
  root.SetRelationsInfo(
    true,
    own(new Any(input.getAddress(), ["Reference", XInputStream.static_type])),
  );
  return owner;
}

/** Checks and releases the original IOException. @param action - Native getter or commit. @param message - Exact expected diagnostic, when specified. @returns Nothing. */
function ioFailure(action: () => void, message?: string): void {
  try {
    action();
  } catch (error) {
    if (!(error instanceof IOException)) throw error;
    if (message !== undefined) expect(nativeText(own(error).Message)).toBe(message);
    else own(error);
    return;
  }
  throw new Error("Expected a native IOException");
}

const examples = [
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word", "document.xml"],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word", "document.xml"],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl", "workbook.xml"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl", "workbook.xml"],
] as const;

it.each(examples)(
  "reads root and part relationships through native storage in %s",
  /** Opens the original strict/transitional file and follows its real child folder. @param file - Pinned archive. @param folderName - Main folder. @param part - Main XML part. @returns Nothing. */ (
    file,
    folderName,
    part,
  ) => {
    const input = own(inputFromBytes(new Uint8Array(readFileSync(resolve(packageRoot, file))))),
      root = open(input),
      rows = own(root.GetAllRelationshipsIfAny());
    expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.Read);
    expect(observePairRows(rows).flat()).toContainEqual({
      First: "Target",
      Second: folderName + "/" + part,
    });
    rows.realloc(0);
    expect(own(root.GetAllRelationshipsIfAny()).hasElements()).toBe(true);
    expect(root.FindElement(u("_rels"))).toBeNull();

    const folderElement = root.FindElement(u(folderName));
    expect(folderElement?.m_bIsStorage).toBe(true);
    if (!folderElement) throw new Error("Original main folder is missing");
    root.OpenSubStorage(folderElement, READ);
    const folder = folderElement.m_xStorage;
    assert(folder);
    expect(folder.m_pParent).toBe(root);
    expect(folder.m_nStorageMode).toBe(READ);
    root.OpenSubStorage(folderElement, READWRITE);
    expect(folderElement.m_xStorage).toBe(folder);
    expect(own(folder.GetAllRelationshipsIfAny()).hasElements()).toBe(false);
    const element = folder.FindElement(u(part));
    if (!element) throw new Error("Original main part is missing");
    folder.OpenSubStream(element);
    const stream = element.m_xStream;
    assert(stream);
    const related = own(stream.GetAllRelationshipsIfAny());
    expect(related.hasElements()).toBe(true);
    const persisted = observePairRows(related);
    related.realloc(0);
    expect(observePairRows(own(stream.GetAllRelationshipsIfAny()))).toEqual(persisted);
  },
);

it("reads a staged root stream once and commits its original bytes", /** Exercises ChangedStream to ChangedStreamRead to Read with actual persistence. @returns Nothing. */ () => {
  const { root, destination } = writable();
  const xml =
    '<?xml version="1.0"?><Relationships><Relationship Id="Dup" Target="one"/><Relationship Id="Dup" Target="two"/></Relationships>';
  const staged = stage(root, xml);
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.ChangedStream);
  const original = observePairRows(own(root.GetAllRelationshipsIfAny()));
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.ChangedStreamRead);
  expect(staged.getPosition()).toBeGreaterThan(0n);
  expect(original).toEqual([
    [
      { First: "Id", Second: "Dup" },
      { First: "Target", Second: "one" },
    ],
    [
      { First: "Id", Second: "Dup" },
      { First: "Target", Second: "two" },
    ],
  ]);
  root.Commit();
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.Read);
  expect(root.m_xNewRelInfoStream.is()).toBe(false);
  destination.seek(0n);
  const reopened = open(own(destination.getInputStream()));
  expect(observePairRows(own(reopened.GetAllRelationshipsIfAny()))).toEqual(original);
});

it("retries malformed original root XML and retains a malformed original child as broken", /** Exercises the initial failure asymmetry with persisted package parts. @returns Nothing. */ () => {
  const { root, destination } = writable();
  writeMember(root, "part.xml", "<part />");
  writeMember(root, "empty.xml", "<empty />");
  const relations = root.CreateRelStorage();
  writeMember(relations, ".rels", "<Relationships>");
  writeMember(relations, "part.xml.rels", "<Relationships>");
  root.Commit();
  destination.seek(0n);
  const reopened = open(own(destination.getInputStream()));
  for (let attempt = 0; attempt < 2; attempt++) {
    ioFailure(
      /** Reads malformed root metadata. @returns Nothing. */ () =>
        reopened.GetAllRelationshipsIfAny().dispose(),
      "Wrong relinfo stream!",
    );
    expect(reopened.m_nRelInfoStatus).toBe(RelInfoStatus.NoInit);
  }
  const element = reopened.FindElement(u("part.xml"));
  assert(element);
  reopened.OpenSubStream(element);
  const stream = element.m_xStream;
  assert(stream);
  for (let attempt = 0; attempt < 2; attempt++)
    ioFailure(
      /** Reads broken part metadata. @returns Nothing. */ () =>
        stream.GetAllRelationshipsIfAny().dispose(),
      "Wrong relinfo stream!",
    );
  const empty = reopened.FindElement(u("empty.xml"));
  assert(empty);
  reopened.OpenSubStream(empty);
  const emptyStream = empty.m_xStream;
  assert(emptyStream);
  expect(own(emptyStream.GetAllRelationshipsIfAny()).getLength()).toBe(0);
});

it("retains an invalid replacement until the caller replaces or reverts it", /** Exercises the ChangedBroken status and the root commit rejection. @returns Nothing. */ () => {
  const { root } = writable();
  stage(root, "<Relationships>");
  ioFailure(
    /** Reads invalid staged XML. @returns Nothing. */ () =>
      root.GetAllRelationshipsIfAny().dispose(),
    "Wrong relinfo stream!",
  );
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.ChangedBroken);
  ioFailure(
    /** Attempts to persist the broken replacement. @returns Nothing. */ () => root.Commit(),
  );
  root.Revert();
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.NoInit);
  expect(own(root.GetAllRelationshipsIfAny()).getLength()).toBe(0);
});

it("has no relationships in ZIP or an empty OFOPXML root", /** Checks original format and missing-part early admission. @returns Nothing. */ () => {
  const { root, destination } = writable();
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  const zip = own(
    new OStorage_Impl(
      own(destination.getInputStream()),
      READ,
      own(new Properties()),
      context,
      ZIP,
      "input",
    ),
  );
  expect(own(zip.GetAllRelationshipsIfAny()).getLength()).toBe(0);
  expect(zip.m_bListCreated).toBe(false);
  expect(own(root.GetAllRelationshipsIfAny()).getLength()).toBe(0);
  expect(root.m_nRelInfoStatus).toBe(RelInfoStatus.Read);
});

it("propagates native relationships and stream properties through the attached UNO reader", /** Replays the OFOPXML TestHelper byte, property and relations checks through the native reader. @returns Nothing. */ () => {
  const { root, destination } = writable();
  const text = "<part />";
  const mediaType = "text/xml";
  writeMember(root, "part.xml", text);
  const written = root.FindElement(u("part.xml"))?.m_xStream;
  assert(written);
  written.SetMediaType(mediaType);
  writeMember(
    root.CreateRelStorage(),
    "part.xml.rels",
    '<Relationships><Relationship Id="rId1" Target="target.xml"/></Relationships>',
  );
  root.Commit();
  destination.seek(0n);
  const reopened = open(own(destination.getInputStream()));
  const name = u("part.xml");
  const reader = own(reopened.OpenReadStream(name));
  const sibling = own(reopened.OpenReadStream(name));
  const properties = own(
    new Reference<XPropertySet>(reader, UNO_QUERY_THROW, XPropertySet.static_type),
  );
  const value = own(properties.operatorStar().getPropertyValue(u("Size")));
  const size = [0n];
  expect(value.extract(size, "sal_Int64")).toBe(true);
  expect(size[0]).toBe(BigInt(text.length));
  const media = own(new OUString());
  expect(
    own(properties.operatorStar().getPropertyValue(u("MediaType"))).extract(media, "OUString"),
  ).toBe(true);
  expect(nativeText(media)).toBe(mediaType);
  const relations = own(
    new Reference<XRelationshipAccess>(reader, UNO_QUERY_THROW, XRelationshipAccess.static_type),
  );
  expect(observePairRows(own(relations.operatorStar().getAllRelationships()))).toEqual([
    [
      { First: "Id", Second: "rId1" },
      { First: "Target", Second: "target.xml" },
    ],
  ]);
  expect(nativeText(own(relations.operatorStar().getTargetByID(u("rId1"))))).toBe("target.xml");
  const input = own(reader.operatorStar().getInputStream());
  const other = own(sibling.operatorStar().getInputStream());
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  expect(input.operatorStar().readBytes(bytes, text.length + 1)).toBe(text.length);
  expect(bytes.getLength()).toBe(text.length);
  const payload = bytes.getConstArray() as SequenceElements;
  for (let i = 0; i < text.length; ++i)
    expect((payload.get(i) as [number])[0]).toBe(text.charCodeAt(i));
  expect(other.operatorStar().readBytes(bytes, 1)).toBe(1);
  expect(((bytes.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(60);
  expect(own(reader.operatorStar().getOutputStream()).is()).toBe(false);
  input.operatorStar().closeInput();
  expect(other.operatorStar().readBytes(bytes, 1)).toBe(1);
  expect(((bytes.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(112);
  ioFailure(
    /** Replays the missing-stream admission from OFOPXML Test06. @returns Nothing. */ () =>
      reopened.OpenReadStream(u("NonExistingStream")).dispose(),
  );
});

it("keeps the parent attached while readers are open and invalidates surviving readers on release", /** Exercises the original write/remove guards and InternalDispose with real persisted streams. @returns Nothing. */ () => {
  const { root, destination } = writable();
  writeMember(root, "part.xml", "<part />");
  root.Commit();
  destination.seek(0n);
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  const persisted = own(new Reference(destination));
  const reopened = new OStorage_Impl(
    persisted,
    READWRITE,
    own(new Properties()),
    context,
    OFOPXML,
    "stream",
  );
  const name = u("part.xml");
  let survivingInput: Reference<XInputStream>;
  try {
    const stream = own(reopened.OpenReadStream(name));
    const input = own(stream.operatorStar().getInputStream());
    const owner = reopened.FindElement(name)?.m_xStream;
    assert(owner);
    expect(owner.HasOpenInputStreams()).toBe(true);
    ioFailure(
      /** Attempts to replace a part with an attached reader. @returns Nothing. */ () =>
        reopened.OpenTruncatedStream(name, READWRITE | TRUNCATE).dispose(),
    );
    ioFailure(
      /** Attempts to remove a part with an attached reader. @returns Nothing. */ () =>
        reopened.RemoveElement(name),
    );
    input.operatorStar().closeInput();
    expect(owner.HasOpenInputStreams()).toBe(false);
    const surviving = own(reopened.OpenReadStream(name));
    survivingInput = own(surviving.operatorStar().getInputStream());
  } finally {
    reopened.dispose();
  }
  try {
    survivingInput.operatorStar().available();
  } catch (error) {
    if (!(error instanceof DisposedException)) throw error;
    own(error);
    return;
  }
  throw new Error("An attached stream survived release of its parent");
});

/** Observes the actual native catalog strings without altering their order. @param names - Returned sequence. @returns Names. */
function observeNames(names: Sequence<rtl_uStringSlot>): string[] {
  const data = names.getConstArray() as SequenceElements;
  const result: string[] = [];
  for (let i = 0; i < names.getLength(); ++i)
    result.push(nativeText(OUString.unacquired(data.get(i * 8) as rtl_uStringSlot)));
  return result;
}

it("enumerates visible keys in native order and retains the original HasChildren result for removed rows", /** Uses a real ZIP round trip with the OFOPXML relationship folder. @returns Nothing. */ () => {
  const { root, destination } = writable();
  for (const part of ["z.xml", "Á.xml", "a.xml", "B.xml"]) writeMember(root, part, "<part />");
  writeMember(root.CreateRelStorage(), ".rels", "<Relationships/>");
  expect(observeNames(own(root.GetElementNames()))).toEqual(["B.xml", "a.xml", "z.xml", "Á.xml"]);
  root.Commit();
  destination.seek(0n);
  const context = own(new Reference<XComponentContext>(getProcessComponentContext()));
  const reopened = own(
    new OStorage_Impl(
      own(new Reference(destination)),
      READWRITE,
      own(new Properties()),
      context,
      OFOPXML,
      "stream",
    ),
  );
  const names = observeNames(own(reopened.GetElementNames()));
  expect(names).toEqual(["B.xml", "a.xml", "z.xml", "Á.xml"]);
  for (const name of names) reopened.RemoveElement(u(name));
  expect(observeNames(own(reopened.GetElementNames()))).toEqual([]);
  expect(reopened.HasChildren()).toBe(true);
});

it.each([30_000, 63_005])(
  "seeks through an attached read stream of %i bytes",
  /** Exercises the native cache boundary and file-backed tail copy. @param size - Payload byte count. @returns Nothing. */ (
    size,
  ) => {
    const { root, destination } = writable();
    const data = Uint8Array.from(
      { length: size },
      /** Generates a byte with observable position. @param _unused - Array placeholder. @param i - Byte position. @returns Unsigned byte. */ (
        _unused,
        i,
      ) => (i * 13) % 249,
    );
    const name = u("payload.bin");
    const cache = own(root.OpenTruncatedStream(name, READWRITE | TRUNCATE));
    writeOutput(own(cache.operatorStar().getOutputStream()).operatorStar(), data);
    root.Commit();
    destination.seek(0n);
    const reopened = open(own(destination.getInputStream()));
    const stream = own(reopened.OpenReadStream(name, true));
    const seek = own(new Reference<XSeekable>(stream, UNO_QUERY_THROW, XSeekable.static_type));
    const input = own(stream.operatorStar().getInputStream());
    const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    expect(seek.operatorStar().getLength()).toBe(BigInt(size));
    seek.operatorStar().seek(BigInt(size - 2));
    expect(input.operatorStar().readBytes(bytes, 2)).toBe(2);
    const fields = bytes.getConstArray() as SequenceElements;
    expect((fields.get(0) as [number])[0] & 255).toBe(data[size - 2]);
    expect((fields.get(1) as [number])[0] & 255).toBe(data[size - 1]);
    expect(seek.operatorStar().getPosition()).toBe(BigInt(size));
  },
);

it("shares the cache position across seekable wrappers on the same part", /** Preserves the native memory-cache stream identity. @returns Nothing. */ () => {
  const { root, destination } = writable();
  writeMember(root, "part.xml", "<part />");
  root.Commit();
  destination.seek(0n);
  const reopened = open(own(destination.getInputStream()));
  const first = own(reopened.OpenReadStream(u("part.xml"), true));
  const firstSeek = own(new Reference<XSeekable>(first, UNO_QUERY_THROW, XSeekable.static_type));
  firstSeek.operatorStar().seek(4n);
  const second = own(reopened.OpenReadStream(u("part.xml"), true));
  const secondSeek = own(new Reference<XSeekable>(second, UNO_QUERY_THROW, XSeekable.static_type));
  expect(secondSeek.operatorStar().getPosition()).toBe(4n);
  secondSeek.operatorStar().seek(2n);
  expect(firstSeek.operatorStar().getPosition()).toBe(2n);
});
