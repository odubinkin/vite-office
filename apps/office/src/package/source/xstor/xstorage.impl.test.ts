/** @fileoverview Actual storage implementation constructors/catalog over real memory streams and ZipPackageFolder/ZipPackage owners. No substitute storage/package/content provider is installed. Full StorageFactory/OStorage and downstream package QA remain pending. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeZlib } from "../../../external/zlib/zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { cppu_detail_getUnoType_StringPair as pairType } from "../../../udkapi/com/sun/star/beans/StringPair";
import { DocumentArchive } from "../zippackage/document-archive";
import { ZipPackageStream } from "../zippackage/ZipPackageStream";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { XChangesBatch } from "../../../offapi/com/sun/star/util/XChangesBatch";
import { UseBackupException } from "../../../offapi/com/sun/star/embed/UseBackupException";
import { ZipPackage } from "../zippackage/ZipPackage";
import { ZipPackageFolder } from "../zippackage/ZipPackageFolder.native";
import {
  READ,
  READWRITE,
  SEEKABLE,
  TRUNCATE,
  WRITE,
} from "../../../offapi/com/sun/star/embed/ElementModes";
import { ZIP, OFOPXML, PACKAGE } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OStorage_Impl, SotElement_Impl } from "./xstorage.impl";
import { OInputCompStream } from "./ocompinstream";
import { RelInfoStatus } from "./xstorage.relations";
import { createPairRows, type PairInput } from "../../../test/ofopxml-values";
const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);
beforeAll(
  /** Actual native runtime and generated exception values. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Genuine context and package graph, not a factory substitute. @returns Actual owners. */
function graph() {
  const context = own(new Reference(getProcessComponentContext().get())),
    pack = own(new Reference(new ZipPackage(context))),
    folder = own(new Reference(new ZipPackageFolder(context, ZIP, false)));
  return { context, pack, folder };
}
/** Actual factory stream named and inserted into original folder. @param folder - Actual folder. @param pack - Actual package. @param name - Source name. @returns Nothing. */
function insert(folder: ZipPackageFolder, pack: ZipPackage, name: string): void {
  const component = own(pack.createInstance()),
    value = own(new Any(component.getAddress(), "XInterface"));
  folder.insertByName(u(name), value);
}
/** Observes and releases original generated errors. @param action - Actual call. @param type - Expected class. @returns Nothing. */
function fails(action: () => unknown, type: abstract new () => Exception): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(type);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
it.each([READ, READWRITE, WRITE | TRUNCATE | SEEKABLE])(
  "retains stream constructor mode/defaults and borrowed stream persistence:%s",
  /** Source write mode keeps XStream; readonly wraps only input. @param mode - Original open mode. @returns Nothing. */ (
    mode,
  ) => {
    const { context } = graph(),
      stream = own(new Reference(new UNOMemoryStream())),
      props = own(new Properties()),
      state = new OStorage_Impl(stream, mode, props, context, ZIP, "stream");
    try {
      expect(state.m_nStorageMode).toBe(mode & ~SEEKABLE);
      expect(state.m_bIsModified).toBe((mode & (WRITE | TRUNCATE)) === (WRITE | TRUNCATE));
      expect(state.m_bIsRoot).toBe(true);
      expect(state.m_bListCreated).toBe(false);
      expect(state.m_nRelInfoStatus).toBe(1);
      expect(state.m_xStream.is()).toBe(Boolean(mode & WRITE));
      expect(state.m_xInputStream.is()).toBe(!(mode & WRITE));
      expect(state.m_pSwitchStream.is()).toBe(true);
      state.m_pSwitchStream.operatorStar().seek(9n);
      expect(stream.operatorStar().getPosition()).toBe(9n);
    } finally {
      state.dispose();
    }
    expect(stream.operatorStar().getPosition()).toBe(9n);
  },
);
it("copies actual descriptor properties and closes URL-owned input while retaining caller-owned inputs without URL", /** Source closure is property-presence driven and no filesystem URL is opened. @returns Nothing. */ () => {
  const { context } = graph(),
    stream = own(new Reference(new UNOMemoryStream())),
    input = own(stream.operatorStar().getInputStream()),
    property = own(new PropertyValue()),
    props = own(
      new Properties(
        {
          /** Actual initializer-list record. @returns Compound address. */ get() {
            return property;
          },
        },
        1,
      ),
    );
  // Assign into the actual sequence after its construction through normal generated value semantics.
  property.Name = u("URL");
  const values = own(
    new Properties(
      {
        /** Actual initializer-list record. @returns Compound address. */ get() {
          return property;
        },
      },
      1,
    ),
  );
  const state = new OStorage_Impl(input, READ, values, context, ZIP, "input");
  values.realloc(0);
  stream.operatorStar().seek(7n);
  expect(state.m_xProperties.getLength()).toBe(1);
  const closed = own(new Reference(state.m_xInputStream));
  state.dispose();
  fails(
    /** Original switch input is closed independently of the underlying persistence. @returns Available count. */ () =>
      closed.operatorStar().available(),
    IOException,
  );
  expect(stream.operatorStar().getPosition()).toBe(7n);
  const second = new OStorage_Impl(input, READ, props, context, ZIP, "input");
  stream.operatorStar().seek(8n);
  second.dispose();
  expect(stream.operatorStar().getPosition()).toBe(8n);
});
it("creates actual substorage catalogs and caches the first enumeration, retaining exact names and borrowed elements", /** Original child lookup and cached-list timing. @returns Nothing. */ () => {
  const { context, pack, folder } = graph();
  insert(folder.operatorStar(), pack.operatorStar(), "a.xml");
  const sub = own(new Reference(new ZipPackageFolder(context, ZIP, false))),
    value = own(new Any(sub.getAddress(), "XInterface"));
  folder.operatorStar().insertByName(u("nested"), value);
  const state = own(new OStorage_Impl(null, READ, folder, pack, context, ZIP, "substorage"));
  expect(state.m_bIsRoot).toBe(false);
  expect(state.HasChildren()).toBe(true);
  const item = state.FindElement(u("a.xml"));
  expect(item).not.toBeNull();
  expect(item?.m_bIsStorage).toBe(false);
  expect(state.FindElement(u("nested"))?.m_bIsStorage).toBe(true);
  expect(state.FindElement(u("missing"))).toBeNull();
  expect(state.FindElement(u("A.XML"))).toBeNull();
  insert(folder.operatorStar(), pack.operatorStar(), "later");
  expect(state.FindElement(u("later"))).toBeNull();
  expect(state.FindElement(u("a.xml"))).toBe(item);
});
it("retains source TRUNCATE rows as removed while HasChildren observes the nonempty map", /** No repair or alternative catalog is supplied. @returns Nothing. */ () => {
  const { context, pack, folder } = graph();
  insert(folder.operatorStar(), pack.operatorStar(), "a");
  const state = own(
    new OStorage_Impl(null, READWRITE | TRUNCATE, folder, pack, context, ZIP, "substorage"),
  );
  expect(state.HasChildren()).toBe(true);
  expect(state.FindElement(u("a"))).toBeNull();
  expect(state.m_aChildrenMap.get("a")?.[0]?.m_bIsRemoved).toBe(true);
  expect(state.m_nRelInfoStatus).toBe(3);
});
it("preserves an OFOPXML malformed relations stream failure and source already-created catalog on retry", /** Genuine stream named _rels triggers original IOException, not a provider-injected exception. @returns Nothing. */ () => {
  const { context, pack, folder } = graph();
  insert(folder.operatorStar(), pack.operatorStar(), "_rels");
  const state = own(new OStorage_Impl(null, READ, folder, pack, context, OFOPXML, "substorage"));
  fails(
    /** Actual source catalog call. @returns Nothing. */ () => state.ReadContents(),
    IOException,
  );
  expect(state.m_bListCreated).toBe(true);
  expect(state.HasChildren()).toBe(false);
});
it("opens the actual OFOPXML _rels folder outside the member catalog", /** Loads the original relation child in WRITE mode. @returns Nothing. */ () => {
  const { context, pack, folder } = graph(),
    sub = own(new Reference(new ZipPackageFolder(context, OFOPXML, false))),
    value = own(new Any(sub.getAddress(), "XInterface"));
  folder.operatorStar().insertByName(u("_rels"), value);
  const state = own(new OStorage_Impl(null, READ, folder, pack, context, OFOPXML, "substorage"));
  state.ReadContents();
  expect(state.m_pRelStorElement?.m_bIsStorage).toBe(true);
  expect(state.m_pRelStorElement?.m_xStorage?.m_xPackageFolder.get()).toBe(sub.get());
  expect(state.m_pRelStorElement?.m_xStorage?.m_nStorageMode).toBe(WRITE);
  expect(state.FindElement(u("_rels"))).toBeNull();
  expect(state.HasChildren()).toBe(false);
});
it("loads actual package properties in PACKAGE mode", /** Exercises the package and folder XPropertySet queries. @returns Nothing. */ () => {
  const { context, pack, folder } = graph(),
    state = own(new OStorage_Impl(null, READ, folder, pack, context, PACKAGE, "substorage"));
  state.ReadContents();
  expect(state.m_bControlMediaType).toBe(true);
  expect(state.m_bControlVersion).toBe(true);
  expect(state.m_bMTFallbackUsed).toBe(false);
});
it("preserves element value/defaults and independent original-name ownership", /** Actual source element, not a substituted stream body. @returns Nothing. */ () => {
  const name = u("original"),
    element = own(new SotElement_Impl(name, false, true));
  name.assign(u("changed"));
  expect(read(new OUString(element.m_aOriginalName))).toBe("original");
  expect(element.m_bIsRemoved).toBe(false);
  expect(element.m_bIsInserted).toBe(true);
});
it("rejects malformed input through the registered native package", /** Invalid input must not publish a package folder. @returns Nothing. */ () => {
  const { context } = graph(),
    source = own(new Reference<XInputStream>(new MemoryInputStream(Uint8Array.of(1, 2), 2))),
    props = own(new Properties()),
    state = own(new OStorage_Impl(source, READ, props, context, ZIP, "input"));
  let caught = false;
  try {
    state.OpenOwnPackage();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  expect(state.m_xPackageFolder.is()).toBe(false);
  expect(source.operatorStar().available()).toBe(2);
  const seeker = own(
    new Reference<XSeekable>(state.m_xInputStream, UNO_QUERY_THROW, XSeekable.static_type),
  );
  expect(seeker.operatorStar().getPosition()).toBe(0n);
});

/** Executes the root persistence phase under the storage mutex. @param storage - Actual root storage. @returns Nothing. */
function commitRoot(storage: OStorage_Impl): void {
  const guard = new MutexGuard(storage.m_xMutex.operatorStar().GetMutex());
  try {
    storage.CommitRootPackage();
  } finally {
    guard.dispose();
  }
}

it("opens the original package service through root storage and commits through XChangesBatch", /** Actual factory, folder, stream and persistence owners participate. @returns Completion. */ async () => {
  const { context } = graph();
  const stream = own(new Reference(new UNOMemoryStream()));
  const storage = own(
    new OStorage_Impl(stream, READWRITE, own(new Properties()), context, ZIP, "stream"),
  );
  storage.ReadContents();
  const batch = own(
    new Reference<XChangesBatch>(storage.m_xPackage, UNO_QUERY_THROW, XChangesBatch.static_type),
  );
  const part = own(storage.m_xPackage.operatorStar().createInstance());
  const member = part.get();
  expect(member).toBeInstanceOf(ZipPackageStream);
  if (!(member instanceof ZipPackageStream)) throw new Error("Expected package stream");
  const input = own(new Reference(new UNOMemoryStream()));
  const payload = own(new (Sequence.specialize<number>("sal_Int8", 1))(3));
  const fields = payload.getArray() as SequenceElements;
  for (let i = 0; i < 3; ++i) (fields.get(i) as [number])[0] = i + 1;
  input.operatorStar().writeBytes(payload);
  input.operatorStar().seek(0n);
  member.setDataStream(input);
  member.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
  storage.m_xPackageFolder
    .operatorStar()
    .insertByName(u("chunk.bin"), own(new Any(part.getAddress(), "XInterface")));
  expect(batch.operatorStar().hasPendingChanges()).toBe(false);
  expect(own(batch.operatorStar().getPendingChanges()).getLength()).toBe(0);
  commitRoot(storage);
  const target = stream.operatorStar();
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  target.seek(0n);
  const length = target.readBytes(bytes, Number(target.getLength()));
  const image = new Uint8Array(length);
  const cells = bytes.getConstArray() as SequenceElements;
  for (let i = 0; i < length; ++i) image[i] = (cells.get(i) as [number])[0];
  const reopened = await DocumentArchive.open(image);
  expect(reopened.getEntryNames()).toEqual(["chunk.bin"]);
  expect(Array.from(await reopened.readEntry("chunk.bin"))).toEqual([1, 2, 3]);
});

it("unwraps the actual backup error and clears storage persistence", /** Disconnecting both real switchable facets forces the original direct-write failure. @returns Nothing. */ () => {
  const { context } = graph();
  const stream = own(new Reference(new UNOMemoryStream()));
  const storage = own(
    new OStorage_Impl(stream, READWRITE, own(new Properties()), context, ZIP, "stream"),
  );
  storage.ReadContents();
  const output = own(storage.m_xStream.operatorStar().getOutputStream());
  storage.m_xStream.operatorStar().closeInput();
  output.operatorStar().closeOutput();
  let backup: UseBackupException | undefined;
  try {
    commitRoot(storage);
  } catch (error) {
    if (!(error instanceof UseBackupException)) throw error;
    backup = own(error);
  }
  expect(backup).toBeInstanceOf(UseBackupException);
  expect(backup?.TemporaryFileURL.isEmpty()).toBe(true);
  expect(storage.m_xStream.is()).toBe(false);
  expect(storage.m_xInputStream.is()).toBe(false);
});

/** Produces a genuine two-member source package and opens the root storage catalog over it. @returns Actual storage and persistence. */
function loadedCatalog() {
  const { context } = graph();
  const target = own(new Reference(new UNOMemoryStream()));
  const initial = own(
    new OStorage_Impl(target, READWRITE, own(new Properties()), context, ZIP, "stream"),
  );
  initial.OpenOwnPackage();
  for (const [name, byte] of [
    ["a.bin", 11],
    ["b.bin", 22],
  ] as const) {
    const ref = own(initial.m_xPackage.operatorStar().createInstance());
    const stream = ref.get();
    if (!(stream instanceof ZipPackageStream)) throw new Error("Expected actual package stream");
    const data = own(new (Sequence.specialize<number>("sal_Int8", 1))(1));
    const cell = (data.getArray() as SequenceElements).get(0) as [number];
    cell[0] = byte;
    const input = own(new Reference(new UNOMemoryStream()));
    input.operatorStar().writeBytes(data);
    input.operatorStar().seek(0n);
    stream.setDataStream(input);
    stream.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
    initial.m_xPackageFolder
      .operatorStar()
      .insertByName(u(name), own(new Any(ref.getAddress(), "XInterface")));
  }
  commitRoot(initial);
  const storage = own(
    new OStorage_Impl(target, READWRITE, own(new Properties()), context, ZIP, "stream"),
  );
  storage.ReadContents();
  return { storage, target };
}
it("removes persisted destinations before renaming and commits the actual catalog to disk bytes", /** Exercises the native deletion-before-rename order against real ZIP persistence. @returns Completion. */ async () => {
  const { storage, target } = loadedCatalog();
  const from = u("a.bin"),
    to = u("b.bin");
  storage.RemoveElement(to);
  storage.RenameElement(from, to);
  expect(storage.FindElement(from)).toBeNull();
  const renamed = storage.FindElement(to);
  if (!renamed) throw new Error("Expected staged rename");
  expect(read(new OUString(renamed.m_aOriginalName))).toBe("a.bin");
  expect(storage.m_xPackageFolder.operatorStar().hasByName(from)).toBe(true);
  expect(storage.m_bIsModified).toBe(true);
  expect(storage.m_bBroadcastModified).toBe(true);
  storage.Commit();
  const memory = target.operatorStar();
  const seq = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  memory.seek(0n);
  const count = memory.readBytes(seq, Number(memory.getLength()));
  const data = seq.getConstArray() as SequenceElements;
  const image = new Uint8Array(count);
  for (let i = 0; i < count; ++i) image[i] = (data.get(i) as [number])[0];
  const reopened = await DocumentArchive.open(image);
  expect(reopened.getEntryNames()).toEqual(["b.bin"]);
  expect(Array.from(await reopened.readEntry("b.bin"))).toEqual([11]);
});
it("restores removed and renamed elements on revert and keeps established name guards", /** Adapts the missing and occupied rename cases from package QA Test06. @returns Nothing. */ () => {
  const { storage } = loadedCatalog();
  const from = u("a.bin"),
    to = u("b.bin"),
    missing = u("missing"),
    renamed = u("new.bin");
  fails(
    /** Missing source. @returns Nothing. */ () => storage.RenameElement(missing, renamed),
    NoSuchElementException,
  );
  fails(
    /** Occupied destination. @returns Nothing. */ () => storage.RenameElement(from, to),
    ElementExistException,
  );
  fails(
    /** Invalid name. @returns Nothing. */ () => storage.RemoveElement(u("bad/name")),
    IllegalArgumentException,
  );
  storage.RemoveElement(to);
  storage.RenameElement(from, renamed);
  expect(storage.FindElement(to)).toBeNull();
  expect(storage.FindElement(from)).toBeNull();
  storage.Revert();
  expect(storage.FindElement(renamed)).toBeNull();
  expect(storage.FindElement(from)?.m_bIsRemoved).toBe(false);
  expect(storage.FindElement(to)?.m_bIsRemoved).toBe(false);
});
it("preserves the upstream retained old row when renaming from a multi-entry key", /** Stops before the native double-ownership destruction domain. @returns Nothing. */ () => {
  const { storage } = loadedCatalog();
  const from = u("a.bin"),
    to = u("b.bin"),
    third = u("c.bin");
  storage.RemoveElement(to);
  storage.RenameElement(from, to);
  storage.RenameElement(to, third);
  expect(storage.FindElement(third)).not.toBeNull();
  expect(storage.FindElement(to)).toBe(storage.FindElement(third));
});

it("commits a first substorage transaction into a separate package folder", /** Exercises the original temporary folder factory and repeated child commit. @returns Nothing. */ () => {
  const { context, pack, folder } = graph();
  insert(folder.operatorStar(), pack.operatorStar(), "old.bin");
  const storage = own(new OStorage_Impl(null, READWRITE, folder, pack, context, ZIP, "substorage"));
  storage.RenameElement(u("old.bin"), u("new.bin"));
  storage.Commit();
  const committed = storage.m_xPackageFolder.get();
  expect(committed).not.toBe(folder.get());
  expect(committed?.hasByName(u("new.bin"))).toBe(true);
  expect(storage.m_bCommited).toBe(true);
  storage.RemoveElement(u("new.bin"));
  storage.Commit();
  expect(storage.m_xPackageFolder.get()).toBe(committed);
  expect(committed?.hasByName(u("new.bin"))).toBe(false);
});

it("commits an OFOPXML root with no relationships storage", /** Uses original no-relationships early return and writes generated package content types. @returns Completion. */ async () => {
  const { context } = graph();
  const target = own(new Reference(new UNOMemoryStream()));
  const storage = own(
    new OStorage_Impl(
      target,
      READWRITE | TRUNCATE,
      own(new Properties()),
      context,
      OFOPXML,
      "stream",
    ),
  );
  storage.Commit();
  const memory = target.operatorStar();
  const seq = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  memory.seek(0n);
  const count = memory.readBytes(seq, Number(memory.getLength()));
  const data = seq.getConstArray() as SequenceElements;
  const image = new Uint8Array(count);
  for (let i = 0; i < count; ++i) image[i] = (data.get(i) as [number])[0];
  const output = await DocumentArchive.open(image);
  expect(output.getEntryNames()).toEqual(["[Content_Types].xml"]);
  expect(await output.readTextEntry("[Content_Types].xml")).toContain('Extension="rels"');
});

/** Writes bytes through the actual truncated cache output facet. @param storage - Root storage. @param name - Member name. @param values - Payload bytes. @returns Nothing. */
function writeMember(storage: OStorage_Impl, name: string, values: readonly number[]): void {
  const cache = storage.OpenTruncatedStream(u(name), READWRITE | TRUNCATE);
  try {
    const output = cache.operatorStar().getOutputStream();
    try {
      const data = own(new (Sequence.specialize<number>("sal_Int8", 1))(values.length));
      const fields = data.getArray() as SequenceElements;
      for (let i = 0; i < values.length; ++i) (fields.get(i) as [number])[0] = values[i] as number;
      output.operatorStar().writeBytes(data);
    } finally {
      output.dispose();
    }
  } finally {
    cache.dispose();
  }
}

/** Opens the actual saved destination. @param target - Original persistence. @returns Archive. */
function readArchive(target: UNOMemoryStream): ReturnType<typeof DocumentArchive.open> {
  const seq = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  target.seek(0n);
  const count = target.readBytes(seq, Number(target.getLength()));
  const fields = seq.getConstArray() as SequenceElements;
  const image = new Uint8Array(count);
  for (let i = 0; i < count; ++i) image[i] = (fields.get(i) as [number])[0];
  return DocumentArchive.open(image);
}

/** Reads a member from the actual saved destination. @param target - Original persistence. @param name - Member name. @returns Bytes. */
async function readSavedMember(target: UNOMemoryStream, name: string): Promise<number[]> {
  const archive = await readArchive(target);
  return Array.from(await archive.readEntry(name));
}

/** Creates an actual writable OFOPXML root. @param mode - Source mode. @returns Storage and persistence. */
function relationshipPackage(mode = READWRITE) {
  const { context } = graph();
  const target = own(new Reference(new UNOMemoryStream()));
  const storage = own(
    new OStorage_Impl(target, mode, own(new Properties()), context, OFOPXML, "stream"),
  );
  return { storage, target: target.operatorStar() };
}

/** Builds the declared relationship property value. @param rows - Fixture attributes. @returns Original typed Any. */
function relationshipProperty(rows: readonly (readonly PairInput[])[]): Any {
  const value = own(createPairRows(rows));
  return own(new Any(value.getAddress(), ["Sequence", ["Sequence", pairType]]));
}

const officeDocumentRelation = [
  { First: "Id", Second: "rId1" },
  {
    First: "Type",
    Second: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  },
  { First: "Target", Second: "word/document.xml" },
];

it("writes the original relationship sequence and prunes the empty folder on the next commit", /** Verifies the ZIP paths and original XML output. @returns Completion. */ async () => {
  const { storage, target } = relationshipPackage();
  storage.SetRelationsInfo(false, relationshipProperty([officeDocumentRelation]));
  storage.Commit();
  expect(storage.m_nRelInfoStatus).toBe(RelInfoStatus.Read);
  const archive = await readArchive(target);
  expect(await archive.readTextEntry("_rels/.rels")).toContain(
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>',
  );
  expect(await archive.readTextEntry("[Content_Types].xml")).toContain(
    'Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"',
  );
  storage.SetRelationsInfo(false, relationshipProperty([]));
  storage.Commit();
  expect(storage.m_pRelStorElement).toBeNull();
  expect((await readArchive(target)).getEntryNames()).toEqual(["[Content_Types].xml"]);
});

it("copies the raw seekable relationship stream from zero and discards the staged property on revert", /** Verifies byte-preserving copy and original state resets. @returns Completion. */ async () => {
  const { storage, target } = relationshipPackage();
  const source = own(new Reference(new UNOMemoryStream()));
  const text = new TextEncoder().encode(
    '<?xml version="1.0"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships" />\n',
  );
  source.operatorStar().writeBytes(new Int8Array(text), text.length);
  const input = own(source.operatorStar().getInputStream());
  const property = own(new Any(input.getAddress(), ["Reference", XInputStream.static_type]));
  storage.SetRelationsInfo(true, property);
  storage.Commit();
  expect(storage.m_nRelInfoStatus).toBe(RelInfoStatus.NoInit);
  expect(storage.m_xNewRelInfoStream.is()).toBe(false);
  expect(await readSavedMember(target, "_rels/.rels")).toEqual([...text]);
  storage.SetRelationsInfo(false, relationshipProperty([officeDocumentRelation]));
  storage.Revert();
  expect(storage.m_nRelInfoStatus).toBe(RelInfoStatus.NoInit);
  expect(await readSavedMember(target, "_rels/.rels")).toEqual([...text]);
});

it("renames and removes the relation part alongside the persisted stream name", /** Exercises part-relations catalog handling against saved bytes. @returns Completion. */ async () => {
  const { storage, target } = relationshipPackage();
  writeMember(storage, "part.xml", [1]);
  writeMember(storage.CreateRelStorage(), "part.xml.rels", [2]);
  storage.Commit();
  expect(await readSavedMember(target, "_rels/part.xml.rels")).toEqual([2]);
  storage.RenameElement(u("part.xml"), u("renamed.xml"));
  storage.Commit();
  const archive = await readArchive(target);
  expect(archive.getEntryNames()).not.toContain("_rels/part.xml.rels");
  expect(Array.from(await archive.readEntry("_rels/renamed.xml.rels"))).toEqual([2]);
  storage.RemoveElement(u("renamed.xml"));
  storage.Commit();
  expect((await readArchive(target)).getEntryNames()).toEqual(["[Content_Types].xml"]);
});

it("clears staged relationship information on the first read of a truncated storage", /** Preserves the ordering of the setter and the lazy catalog reset. @returns Completion. */ async () => {
  const { storage, target } = relationshipPackage(READWRITE | TRUNCATE);
  const property = relationshipProperty([officeDocumentRelation]);
  storage.SetRelationsInfo(false, property);
  expect(storage.m_aRelInfo.getLength()).toBe(1);
  storage.Commit();
  expect(storage.m_aRelInfo.getLength()).toBe(0);
  expect((await readArchive(target)).getEntryNames()).toEqual(["[Content_Types].xml"]);
  storage.SetRelationsInfo(false, property);
  storage.Commit();
  expect((await readArchive(target)).getEntryNames()).toContain("_rels/.rels");
});

it("fails to reopen a closed OFOPXML stream by its old name after renaming the package member", /** Uses Revert to release the real stream owner and exercises the original commit order. @returns Nothing. */ () => {
  const { storage } = relationshipPackage();
  writeMember(storage, "part.xml", [1]);
  storage.Commit();
  storage.Revert();
  const original = u("part.xml"),
    renamed = u("renamed.xml");
  expect(storage.FindElement(original)?.m_xStream).toBeNull();
  storage.RenameElement(original, renamed);
  fails(
    /** The commit queries the removed persisted name. @returns Nothing. */ () => storage.Commit(),
    NoSuchElementException,
  );
  const folder = storage.m_xPackageFolder.operatorStar();
  expect(folder.hasByName(original)).toBe(false);
  expect(folder.hasByName(renamed)).toBe(true);
});

it("rejects invalid relationship property types and a nonseekable input stream", /** Checks the original property preconditions against actual UNO values. @returns Nothing. */ () => {
  const { storage } = relationshipPackage();
  const empty = own(new Any());
  const readOnly = relationshipPackage(READ).storage;
  const bytes = own(new Reference(new MemoryInputStream(new Int8Array(0), 0)));
  const component = own(
    new Reference<XInputStream>(new OInputCompStream(bytes, own(new Properties()), ZIP)),
  );
  const noSeek = own(new Any(component.getAddress(), ["Reference", XInputStream.static_type]));
  fails(
    /** A readonly wrapper rejects modification. @returns Nothing. */ () =>
      readOnly.SetRelationsInfo(false, empty),
    RuntimeException,
  );
  fails(
    /** A void Any cannot extract a native pair sequence. @returns Nothing. */ () =>
      storage.SetRelationsInfo(false, empty),
    IllegalArgumentException,
  );
  fails(
    /** A void Any cannot extract a stream. @returns Nothing. */ () =>
      storage.SetRelationsInfo(true, empty),
    IllegalArgumentException,
  );
  fails(
    /** A real OInputCompStream provides no XSeekable facet. @returns Nothing. */ () =>
      storage.SetRelationsInfo(true, noSeek),
    IllegalArgumentException,
  );
  expect(storage.m_nRelInfoStatus).toBe(RelInfoStatus.NoInit);
});

it.each([ZIP, OFOPXML])(
  "attaches newly written children and replaces their package streams on truncate for format %s",
  /** Exercises original storage and child commits through actual output bytes. @param format - Original package format. @returns Completion. */ async (
    format,
  ) => {
    const { context } = graph();
    const target = own(new Reference(new UNOMemoryStream()));
    const storage = own(
      new OStorage_Impl(target, READWRITE, own(new Properties()), context, format, "stream"),
    );
    writeMember(storage, "part.xml", [65, 66, 67]);
    expect(storage.FindElement(u("part.xml"))?.m_bIsInserted).toBe(true);
    storage.Commit();
    expect(storage.FindElement(u("part.xml"))?.m_bIsInserted).toBe(false);
    expect(await readSavedMember(target.operatorStar(), "part.xml")).toEqual([65, 66, 67]);
    writeMember(storage, "part.xml", [68]);
    storage.Commit();
    expect(await readSavedMember(target.operatorStar(), "part.xml")).toEqual([68]);
  },
);

it("moves a persisted replaced entry into the deleted vector and restores it on revert", /** Uses real package ownership through two staging cycles. @returns Completion. */ async () => {
  const { storage, target } = loadedCatalog();
  const key = u("a.bin");
  storage.RemoveElement(key);
  writeMember(storage, "a.bin", [77]);
  expect(storage.m_aDeletedVector).toHaveLength(1);
  storage.Revert();
  expect(storage.m_aDeletedVector).toHaveLength(0);
  expect(storage.FindElement(key)?.m_bIsInserted).toBe(false);
  expect(storage.FindElement(key)?.m_xStream).toBeNull();
  expect(await readSavedMember(target.operatorStar(), "a.bin")).toEqual([11]);
  storage.RemoveElement(key);
  writeMember(storage, "a.bin", [88, 89]);
  storage.Commit();
  expect(storage.m_aDeletedVector).toHaveLength(0);
  expect(await readSavedMember(target.operatorStar(), "a.bin")).toEqual([88, 89]);
});
