/** @fileoverview Original native folder save/manifest/empty-directory behavior over actual UNO values, ZIP output and independent extraction. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { ZipReader, Uint8ArrayReader } from "@zip.js/zip.js";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PACKAGE, ZIP, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { OOutputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString } from "../../../sal/inc/rtl/ustring";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initializes actual shared native/UNO runtime. @returns Completion. */ async () => {
    await initializeRuntime();
    await initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Creates a genuine folder component in the source package format. @param format - Original format. @param name - Original child name. @param media - Optional media type. @param version - Original version. @returns Actual component. */
function folder(format: number, name = "", media = "", version = ""): Reference<ZipPackageFolder> {
  const value = own(new Reference(new ZipPackageFolder(own(new Reference()), format, false)));
  value.operatorStar().setName(u(name));
  value.operatorStar().SetMediaType(u(media));
  value.operatorStar().SetVersion(u(version));
  return value;
}
/** Inserts through the actual UNO Any/container path. @param parent - Actual folder. @param child - Actual folder. @returns Nothing. */
function insert(parent: Reference<ZipPackageFolder>, child: Reference<ZipPackageFolder>): void {
  const name = own(child.operatorStar().getName()),
    element = own(new Any(child.getAddress(), "XInterface"));
  parent.operatorStar().insertByName(name, element);
}
/** Retains each copied manifest sequence through normal caller destruction. @param rows - Original vector. @returns Same vector. */
function retain(rows: Sequence<PropertyValue>[]): Sequence<PropertyValue>[] {
  for (const row of rows) own(row);
  return rows;
}
/** Extracts the actual property Any without a host metadata provider. @param row - Actual sequence. @returns Native property names and values. */
function properties(row: Sequence<PropertyValue>): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  for (let i = 0; i < row.getLength(); i++) {
    const address = (row.getConstArray() as SequenceElements).get(i * 48) as Parameters<
        typeof PropertyValue.unacquired
      >[0],
      field = PropertyValue.unacquired(address),
      value = new OUString();
    try {
      expect(Any.prototype.extract.call(field.Value as Any, value, "OUString")).toBe(true);
      result.push([read(new OUString(field.Name)), read(new OUString(value))]);
    } finally {
      value.dispose();
    }
  }
  return result;
}
/** Reads actual output bytes using the source ByteReader overload. @param memory - Actual archive backing. @returns Byte image. */
function image(memory: Reference<UNOMemoryStream>): Uint8Array {
  const size = Number(memory.operatorStar().getLength()),
    bytes = new Uint8Array(size);
  memory.operatorStar().seek(0n);
  expect(memory.operatorStar().readSomeBytes(bytes, size)).toBe(size);
  return bytes;
}
/** Independent real ZIP implementation checks resulting directory records. @param memory - Actual archive. @returns Directory names. */
async function directoryNames(memory: Reference<UNOMemoryStream>): Promise<string[]> {
  const reader = new ZipReader(new Uint8ArrayReader(image(memory)));
  try {
    const entries = await reader.getEntries();
    expect(
      entries.every(
        /** Validates real directory records. @param entry - Emitted entry. @returns Directory flag. */ (
          entry,
        ) => entry.directory,
      ),
    ).toBe(true);
    for (const entry of entries) {
      expect(entry.uncompressedSize).toBe(0);
      expect(entry.compressedSize).toBe(0);
    }
    return entries
      .map(
        /** Reads independent decoded names. @param entry - ZIP entry. @returns Name. */ (entry) =>
          entry.filename,
      )
      .sort();
  } finally {
    await reader.close();
  }
}
it.each([PACKAGE, ZIP, OFOPXML])(
  "serializes nested empty folders in source format%s",
  /** Real folders and native writer produce the original format-dependent directory behavior. @param format - Original format. @returns Completion. */ async (
    format,
  ) => {
    const root = folder(format),
      branch = folder(format, "é", "application/branch", "1.3"),
      leaf = folder(format, "empty");
    insert(root, branch);
    insert(branch, leaf);
    const memory = own(new Reference(new UNOMemoryStream())),
      writer = own(new ZipOutputStream(memory)),
      rows: Sequence<PropertyValue>[] = [],
      key = own(new Bytes());
    try {
      root.operatorStar().saveContents(u(""), rows, writer, key, null, null);
    } finally {
      retain(rows);
    }
    writer.finish();
    expect(await directoryNames(memory)).toEqual(format === OFOPXML ? [] : ["é/empty/"]);
    const mutex = own(new RtlReference(new RefCountedMutex()));
    memory.operatorStar().seek(0n);
    if (format === OFOPXML) {
      let rejected = false;
      try {
        own(new ZipFile(mutex, memory, own(new Reference()), true, false, Checks.CheckInsensitive));
      } catch (error) {
        if (!(error instanceof ZipException)) throw error;
        rejected = true;
        expect(read(new OUString(error.Message))).toBe("Zip file has holes! It will leak!");
        error.dispose();
      }
      expect(rejected).toBe(true);
    } else {
      const zip = own(
        new ZipFile(mutex, memory, own(new Reference()), true, false, Checks.CheckInsensitive),
      );
      expect(zip.GetEntryHash().size()).toBe(1);
      const record = zip.GetEntryHash().find(u("é/empty/"));
      expect(record?.nMethod).toBe(0);
      expect(record?.nCrc).toBe(0);
      expect(record?.nSize).toBe(0n);
      expect(record?.nCompressedSize).toBe(0n);
    }
    expect(rows.length).toBe(format === PACKAGE ? 1 : 0);
    if (format === PACKAGE)
      expect(properties(rows[0] as Sequence<PropertyValue>)).toEqual([
        ["FullPath", "é/"],
        ["Version", "1.3"],
        ["MediaType", "application/branch"],
      ]);
  },
);
it("preserves postorder copied manifest rows and source Unicode/property value lifetime", /** Descendant rows precede parents and remain live after source fields change. @returns Nothing. */ () => {
  const branch = folder(PACKAGE, "branch", "application/branch", "1.3"),
    leaf = folder(PACKAGE, "leaf", "application/leaf");
  insert(branch, leaf);
  const memory = own(new Reference(new UNOMemoryStream())),
    writer = own(new ZipOutputStream(memory)),
    rows: Sequence<PropertyValue>[] = [],
    key = own(new Bytes());
  try {
    expect(branch.operatorStar().saveChild(u("branch"), rows, writer, key, 1000, [1, 2, 3])).toBe(
      true,
    );
  } finally {
    retain(rows);
  }
  branch.operatorStar().SetMediaType(u("changed"));
  leaf.operatorStar().SetVersion(u("changed"));
  expect(rows.map(properties)).toEqual([
    [
      ["FullPath", "branch/leaf/"],
      ["Version", ""],
      ["MediaType", "application/leaf"],
    ],
    [
      ["FullPath", "branch/"],
      ["Version", "1.3"],
      ["MediaType", "application/branch"],
    ],
  ]);
  writer.finish();
});
it("treats a ZIP root mimetype folder as an ordinary folder and leaves an empty root empty", /** No stream class or fake mimetype provider is introduced to cover the separate stream branch. @returns Completion. */ async () => {
  const root = folder(ZIP),
    child = folder(ZIP, "mimetype");
  insert(root, child);
  const memory = own(new Reference(new UNOMemoryStream())),
    writer = own(new ZipOutputStream(memory)),
    rows: Sequence<PropertyValue>[] = [],
    key = own(new Bytes());
  root.operatorStar().saveContents(u(""), rows, writer, key, null, null);
  writer.finish();
  expect(await directoryNames(memory)).toEqual(["mimetype/"]);
  const empty = folder(ZIP),
    emptyMemory = own(new Reference(new UNOMemoryStream())),
    emptyWriter = own(new ZipOutputStream(emptyMemory));
  empty.operatorStar().saveContents(u(""), rows, emptyWriter, key, null, null);
  emptyWriter.finish();
  expect(await directoryNames(emptyMemory)).toEqual([]);
  expect(rows).toHaveLength(0);
});
it("translates real invalid ZIP names into the original empty RuntimeException without a manifest row", /** Actual writer validation raises the source IOException, which the folder catch discards. @returns Nothing. */ () => {
  const value = folder(PACKAGE, "folder", "application/type"),
    memory = own(new Reference(new UNOMemoryStream())),
    writer = own(new ZipOutputStream(memory)),
    rows: Sequence<PropertyValue>[] = [],
    key = own(new Bytes());
  let caught = false;
  try {
    value.operatorStar().saveChild(u("bad\\\\name"), rows, writer, key, null, null);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    caught = true;
    expect(read(new OUString(error.Message))).toBe("");
    error.dispose();
  }
  expect(caught).toBe(true);
  expect(rows).toHaveLength(0);
  expect(memory.operatorStar().getLength()).toBe(0n);
});
it("translates a genuine readonly native stream write failure without pretending to save", /** Actual SvMemoryStream/OOutputStreamWrapper produce IOException-derived failure. @returns Nothing. */ () => {
  const value = folder(ZIP),
    backing = own(new SvMemoryStream(new Uint8Array(16), 16, StreamMode.READ)),
    output = own(new Reference(new OOutputStreamWrapper(backing))),
    writer = own(new ZipOutputStream(output)),
    key = own(new Bytes());
  const rows: Sequence<PropertyValue>[] = [];
  let caught = false;
  try {
    value.operatorStar().saveChild(u("empty"), rows, writer, key, null, null);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    caught = true;
    expect(read(new OUString(error.Message))).toBe("");
    error.dispose();
  }
  expect(caught).toBe(true);
  expect(rows).toHaveLength(0);
  expect(backing.GetError().IsSet()).toBe(true);
});

it("preserves partial native header bytes when an actual bounded output fails", /** Original save failure does not roll back bytes already emitted by SvMemoryStream. @returns Nothing. */ () => {
  const value = folder(PACKAGE, "folder", "application/partial"),
    bytes = new Uint8Array(2),
    backing = own(new SvMemoryStream(bytes, 2, StreamMode.WRITE)),
    output = own(new Reference(new OOutputStreamWrapper(backing))),
    writer = own(new ZipOutputStream(output)),
    key = own(new Bytes());
  const rows: Sequence<PropertyValue>[] = [];
  let caught = false;
  try {
    value.operatorStar().saveChild(u("folder"), rows, writer, key, null, null);
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    caught = true;
    expect(read(new OUString(error.Message))).toBe("");
    error.dispose();
  }
  expect(caught).toBe(true);
  expect(Array.from(bytes)).toEqual([80, 75]);
  expect(rows).toHaveLength(0);
  expect(backing.GetError().IsSet()).toBe(true);
});
