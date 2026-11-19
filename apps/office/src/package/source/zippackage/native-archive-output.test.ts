/** @fileoverview Existing external document writer routed through actual core ZIP output, with independent extraction, original catalog reopening and unchanged browser admission. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { crc32 } from "node:zlib";
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { DocumentArchiveWriter, DocumentArchive } from "./document-archive";
beforeAll(initializeExceptionAbi);
afterEach(releaseDomScope);
/** Actual original core catalog over externally returned bytes. @param image - Emitted archive. @returns Native catalog. */
function reopen(image: Uint8Array): ZipFile {
  const mutex = own(new RtlReference(new RefCountedMutex())),
    input = own(new Reference(new MemoryInputStream(image, image.length)));
  return own(new ZipFile(mutex, input, own(new Reference()), true, false, Checks.CheckInsensitive));
}
it("retains writer terminal state, empty archives, name admission and independent input snapshots", /** Actual writer API and genuine empty native ZIP. @returns Completion. */ async () => {
  const empty = new DocumentArchiveWriter(),
    image = await empty.finish();
  expect(image.length).toBe(22);
  expect((await DocumentArchive.open(image)).getEntryNames()).toEqual([]);
  await expect(empty.finish()).rejects.toThrow("already finished");
  expect(
    /** Terminal writer rejects new input. @returns Nothing. */ () =>
      empty.putNextEntry("new", new Uint8Array()),
  ).toThrow("already finished");
  const writer = new DocumentArchiveWriter(),
    bytes = Uint8Array.of(0, 255, 17);
  expect(
    /** Existing document name policy rejects a traversal. @returns Nothing. */ () =>
      writer.putNextEntry("../bad", bytes),
  ).toThrow("Unsafe ZIP");
  writer.putNextEntry("字/文档.bin", bytes);
  expect(
    /** Duplicate admission precedes native output. @returns Nothing. */ () =>
      writer.putNextEntry("字/文档.bin", bytes),
  ).toThrow("Duplicate ZIP");
  bytes.fill(99);
  const result = await DocumentArchive.open(await writer.finish());
  expect([...(await result.readEntry("字/文档.bin"))]).toEqual([0, 255, 17]);
});
it("emits original STORED records and CRC across32KiB chunks through the existing external writer", /** Unicode names, signed bytes, zero length and full/short chunks remain independently readable. @returns Completion. */ async () => {
  const writer = new DocumentArchiveWriter(),
    expected = new Map<string, Uint8Array>();
  for (const length of [0, 1, 32767, 32768, 32769, 65537]) {
    const bytes = new Uint8Array(length),
      name = `文档/part-${length}.xml`;
    for (let i = 0; i < length; ++i) bytes[i] = (i * 73) ^ (i >> 4);
    writer.putNextEntry(name, bytes);
    expected.set(name, bytes);
  }
  const wire = await writer.finish(),
    native = reopen(wire),
    reader = new ZipReader(new Uint8ArrayReader(wire), { useWebWorkers: false, checkCrc32: true });
  try {
    const entries = await reader.getEntries();
    expect(entries.length).toBe(expected.size);
    expect(native.GetEntryHash().size()).toBe(expected.size);
    for (const entry of entries) {
      if (entry.directory) throw new Error("unexpected output directory");
      const bytes = expected.get(entry.filename);
      if (!bytes) throw new Error("unexpected output name");
      expect(entry.compressionMethod).toBe(0);
      expect([...(await entry.getData(new Uint8ArrayWriter()))]).toEqual([...bytes]);
      const original = native.GetEntryHash().find(u(entry.filename));
      if (!original) throw new Error("missing native catalog record");
      expect(original.nMethod).toBe(0);
      expect(original.nFlag).toBe(1 << 11);
      expect(original.nVersion).toBe(20);
      expect(original.nCrc).toBe(crc32(bytes) | 0);
      expect(original.nSize).toBe(BigInt(bytes.length));
      expect(original.nCompressedSize).toBe(BigInt(bytes.length));
    }
  } finally {
    await reader.close();
  }
});
it.each([
  "sw/qa/extras/ooxmlexport/data/hello.docx",
  "sw/qa/extras/ooxmlexport/data/strict.docx",
  "sc/qa/unit/data/xlsx/preserve_space.xlsx",
  "sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
])(
  "preserves every unchanged part of%s through the production archive-output boundary",
  /** These are source package payloads, not model/filter export acceptance. @param path - Pinned original fixture. @returns Completion. */ async (
    path,
  ) => {
    const input = new ZipReader(
        new Uint8ArrayReader(
          new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", path))),
        ),
        { useWebWorkers: false, checkCrc32: true },
      ),
      writer = new DocumentArchiveWriter(),
      originals = new Map<string, Uint8Array>();
    try {
      for (const entry of await input.getEntries()) {
        const bytes = entry.directory
          ? new Uint8Array()
          : await entry.getData(new Uint8ArrayWriter());
        originals.set(entry.filename, bytes);
        writer.putNextEntry(entry.filename, bytes);
      }
    } finally {
      await input.close();
    }
    const wire = await writer.finish(),
      native = reopen(wire),
      result = await DocumentArchive.open(wire);
    expect(result.getEntryNames()).toEqual([...originals.keys()]);
    expect(native.GetEntryHash().size()).toBe(originals.size);
    for (const [name, bytes] of originals) {
      expect(result.getEntryMethod(name)).toBe(0);
      expect([...(await result.readEntry(name))]).toEqual([...bytes]);
    }
  },
);
