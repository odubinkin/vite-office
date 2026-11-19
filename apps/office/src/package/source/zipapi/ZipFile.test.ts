/** @fileoverview Original package QA archives through actual ZipFile/UNO/SvMemoryStream. Controlled independent ZIP byte images exercise headers/ZIP64/descriptors; no fake archive, stream, mutex or private-state injection. Full ZipPackage service, inflation and model acceptance remain separate. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { deflateRawSync } from "node:zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { ZipEntry } from "../../inc/ZipEntry";
import { EntryHash } from "../../inc/HashMaps";
import { ZipFile, Checks } from "./ZipFile";
beforeAll(
  /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
/** Actual source wrapper borrowing initialized byte storage. @param bytes - Actual package. @returns Native input. */
function input(bytes: Uint8Array): Reference<OStreamWrapper> {
  return own(
    new Reference(
      new OStreamWrapper(own(new SvMemoryStream(bytes, bytes.length, StreamMode.READ))),
    ),
  );
}
/** Constructs the original directory reader on real native owners. @param bytes - Actual package. @param checks - Source check mode. @param initialise - Source construction branch. @returns Actual reader. */
function open(bytes: Uint8Array, checks = Checks.CheckInsensitive, initialise = true): ZipFile {
  return own(
    new ZipFile(
      own(new RtlReference(new RefCountedMutex())),
      input(bytes),
      own(new Reference()),
      initialise,
      false,
      checks,
    ),
  );
}
/** Original pinned file bytes. @param path - Upstream relative path. @returns Unchanged bytes. */
function fixture(path: string): Uint8Array {
  return new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", path)));
}
/** Native exception assertion and deterministic field destruction. @param action - Actual constructor/API. @param message - Optional exact source diagnostic. @returns Nothing. */
function rejects(action: () => unknown, message?: string): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error instanceof ZipException || error instanceof ZipIOException).toBe(true);
      if (message) expect(read(new OUString(error.Message))).toBe(message);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Independent little-endian test image field writer. @param target - Fixture bytes. @param offset - Field location. @param value - Bit pattern. @param size - Width. @returns Nothing. */
function put(target: Uint8Array, offset: number, value: number | bigint, size: number): void {
  let bits = BigInt.asUintN(size * 8, BigInt(value));
  for (let i = 0; i < size; ++i) {
    target[offset + i] = Number(bits & 255n);
    bits >>= 8n;
  }
}
/** Fixture entry configuration. */
type ImageEntry = {
  name: string;
  data?: string;
  method?: number;
  descriptor?: 12 | 16 | 20 | 24;
  version?: number;
  flag?: number;
  extra?: Uint8Array;
  attributes?: number;
  madeBy?: number;
};
/** Independent ZIP file byte image; data CRC is a fixed agreed header value because this test does not qualify inflation/CRC validation. @param entries - Source file layout. @param zip64End - Write real ZIP64 END/locator. @returns Package and byte offsets for controlled malformed cases. */
function image(
  entries: ImageEntry[],
  zip64End = false,
): {
  bytes: Uint8Array;
  locals: number[];
  centrals: number[];
  end: number;
  central: number;
  locator: number;
  end64: number;
} {
  const records: Uint8Array[] = [],
    directories: Uint8Array[] = [],
    locals: number[] = [],
    centrals: number[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = new TextEncoder().encode(entry.name),
      data = new TextEncoder().encode(entry.data ?? "x"),
      method = entry.method ?? 0,
      payload = method === 8 ? new Uint8Array(deflateRawSync(data)) : data,
      extra = entry.extra ?? new Uint8Array(),
      descriptor = entry.descriptor ?? 0;
    const local = new Uint8Array(30 + name.length + extra.length + payload.length + descriptor),
      central = new Uint8Array(46 + name.length + extra.length);
    locals.push(offset);
    put(local, 0, 0x04034b50, 4);
    put(local, 4, entry.version ?? (descriptor >= 20 ? 45 : 20), 2);
    put(local, 6, entry.flag ?? (descriptor ? 8 : 0), 2);
    put(local, 8, method, 2);
    if (!descriptor) {
      put(local, 14, 0x12345678, 4);
      put(local, 18, payload.length, 4);
      put(local, 22, data.length, 4);
    }
    put(local, 26, name.length, 2);
    put(local, 28, extra.length, 2);
    local.set(name, 30);
    local.set(extra, 30 + name.length);
    local.set(payload, 30 + name.length + extra.length);
    if (descriptor) {
      let position = 30 + name.length + extra.length + payload.length;
      if (descriptor === 16 || descriptor === 24) {
        put(local, position, 0x08074b50, 4);
        position += 4;
      }
      put(local, position, 0x12345678, 4);
      position += 4;
      const width = descriptor >= 20 ? 8 : 4;
      put(local, position, payload.length, width);
      put(local, position + width, data.length, width);
    }
    put(central, 0, 0x02014b50, 4);
    put(central, 4, entry.madeBy ?? 0x0314, 2);
    put(central, 6, entry.version ?? 20, 2);
    put(central, 8, entry.flag ?? (descriptor ? 8 : 0), 2);
    put(central, 10, method, 2);
    put(central, 16, 0x12345678, 4);
    put(central, 20, payload.length, 4);
    put(central, 24, data.length, 4);
    put(central, 28, name.length, 2);
    put(central, 30, extra.length, 2);
    put(central, 38, entry.attributes ?? 0, 4);
    put(central, 42, offset, 4);
    central.set(name, 46);
    central.set(extra, 46 + name.length);
    records.push(local);
    directories.push(central);
    offset += local.length;
  }
  const central = offset;
  for (const directory of directories) {
    centrals.push(offset);
    records.push(directory);
    offset += directory.length;
  }
  const centralSize = offset - central,
    end64 = offset;
  if (zip64End) {
    const record = new Uint8Array(56);
    put(record, 0, 0x06064b50, 4);
    put(record, 4, 44, 8);
    put(record, 12, 45, 2);
    put(record, 14, 45, 2);
    put(record, 24, entries.length, 8);
    put(record, 32, entries.length, 8);
    put(record, 40, centralSize, 8);
    put(record, 48, central, 8);
    records.push(record);
    offset += 56;
  }
  const locator = offset;
  if (zip64End) {
    const record = new Uint8Array(20);
    put(record, 0, 0x07064b50, 4);
    put(record, 8, end64, 8);
    put(record, 16, 1, 4);
    records.push(record);
    offset += 20;
  }
  const end = offset,
    record = new Uint8Array(22);
  put(record, 0, 0x06054b50, 4);
  put(record, 8, entries.length, 2);
  put(record, 10, entries.length, 2);
  put(record, 12, centralSize, 4);
  put(record, 16, central, 4);
  records.push(record);
  offset += 22;
  const bytes = new Uint8Array(offset);
  offset = 0;
  for (const part of records) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return { bytes, locals, centrals, end, central, locator, end64 };
}
it.each([
  "sw/qa/extras/ooxmlexport/data/hello.docx",
  "sw/qa/extras/ooxmlexport/data/strict.docx",
  "sc/qa/unit/data/xlsx/preserve_space.xlsx",
  "sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
  "package/qa/cppunit/data/export64.zip",
  "package/qa/cppunit/data/tdf163341.ods",
  "package/qa/cppunit/data/a2z.zip",
  "package/qa/cppunit/data/pass/no_usb_2024-11-06.xlsx",
])(
  "reads complete native ZIP directory and LOCs from unchanged upstream %s",
  /** Checks reads complete native ZIP directory and LOCs from unchanged upstream %s. @param path - Original fixture or source value. @returns Original comparison or actual API result. */ (
    path,
  ) => {
    const bytes = fixture(path),
      zip = open(bytes),
      entries = [...zip.GetEntryHash().values()];
    expect(entries.length).toBeGreaterThan(0);
    const enumeration = zip.entries(),
      seen: ZipEntry[] = [];
    while (enumeration.hasMoreElements()) seen.push(enumeration.nextElement() as ZipEntry);
    expect(new Set(seen)).toEqual(new Set(entries));
    expect(enumeration.nextElement()).toBeNull();
    for (const entry of entries) {
      expect(zip.GetEntryHash().find(entry.sPath)).toBe(entry);
      expect(entry.nOffset).toBeGreaterThan(0n);
      expect(entry.nOffset + entry.nCompressedSize).toBeLessThanOrEqual(BigInt(bytes.length));
    }
    if (path.endsWith("export64.zip"))
      expect(zip.GetEntryHash().find(u("styles.xml"))?.nSize).toBe(1112n);
  },
);
it.each([
  "duplicate-files.odt",
  "unicode-path.odt",
  "unicode-path.docx",
  "slash.odt",
  "dot-slash.docx",
  "two-zips.odt",
  "two-zips.docx",
  "casing.docx",
  "overlap.docx",
  "inner-gap.docx",
  "dd-deflated.docx",
  "zip64-eocd.docx",
])(
  "preserves original non-recovery package QA rejection: %s",
  /** Checks preserves original non-recovery package QA rejection: %s. @param name - Original fixture or source value. @returns Original comparison or actual API result. */ (
    name,
  ) => {
    rejects(
      /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
        open(fixture("package/qa/cppunit/data/" + name)),
    );
  },
);
it.each([12, 16, 20, 24] as const)(
  "reads actual %i-byte descriptor, including optional signature and Excel version45",
  /** Checks reads actual %i-byte descriptor, including optional signature and Excel version45. @param descriptor - Original fixture or source value. @returns Original comparison or actual API result. */ (
    descriptor,
  ) => {
    const sample = image([{ name: "word/document.xml", data: "<d/>", method: 8, descriptor }]),
      zip = open(sample.bytes),
      entry = zip.GetEntryHash().find(u("word/document.xml"));
    expect(entry?.nSize).toBe(4n);
    expect(entry?.nOffset).toBe(47n);
    expect(entry?.nMethod).toBe(8);
  },
);
it("retains borrowed buffers, native record copies, hash collisions and original enumeration identities", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([
      { name: "Bk", data: "a" },
      { name: "CF", data: "bb" },
    ]),
    zip = open(sample.bytes),
    hash = zip.GetEntryHash();
  expect(u("Bk").hashCode()).toBe(u("CF").hashCode());
  expect(hash.size()).toBe(2);
  expect(hash.find(u("CF"))?.nSize).toBe(2n);
  expect(hash.find(u("absent"))).toBeUndefined();
  const entry = hash.find(u("Bk")) as ZipEntry,
    copied = own(new ZipEntry(entry)),
    other = new EntryHash();
  try {
    other.set(entry.sPath, entry);
    copied.nSize = 9n;
    other.set(copied.sPath, copied);
    expect(other.find(entry.sPath)?.nSize).toBe(9n);
    expect(entry.nSize).toBe(1n);
  } finally {
    other.clear();
  }
});
it("preserves default/case-insensitive/TryCheckInsensitive and FAT-directory filtering", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a" }, { name: "A" }]);
  expect(open(sample.bytes, Checks.Default).GetEntryHash().size()).toBe(2);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(sample.bytes, Checks.TryCheckInsensitive),
    "Duplicate CEN entry (case insensitive)",
  );
  const autocorrect = image([{ name: "mimetype", data: "" }, { name: "a" }, { name: "A" }]);
  expect(open(autocorrect.bytes, Checks.TryCheckInsensitive).GetEntryHash().size()).toBe(3);
  const dirs = image([
    { name: "folder/", data: "", madeBy: 20, attributes: 16 },
    { name: "folder/a" },
  ]);
  expect(open(dirs.bytes).GetEntryHash().size()).toBe(1);
});
it("checks source ZIP64 END consistency and original disk sentinel quirk", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a" }], true);
  expect(open(sample.bytes).GetEntryHash().size()).toBe(1);
  put(sample.bytes, sample.end + 4, 0xffff, 2);
  put(sample.bytes, sample.end + 6, 7, 2);
  expect(open(sample.bytes).GetEntryHash().size()).toBe(1);
  put(sample.bytes, sample.end + 8, 0xffff, 2);
  put(sample.bytes, sample.end + 10, 0xffff, 2);
  put(sample.bytes, sample.end + 12, -1, 4);
  put(sample.bytes, sample.end + 16, -1, 4);
  expect(open(sample.bytes).GetEntryHash().size()).toBe(1);
});
it("retains source empty-ZIP hole rejection and the last512-byte END search", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([]).bytes),
    "Zip file has holes! It will leak!",
  );
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(new Uint8Array(4)),
    "Zip too small!",
  );
  const sample = image([{ name: "a" }]),
    commented = new Uint8Array(sample.bytes.length + 513);
  commented.set(sample.bytes);
  put(commented, sample.end + 20, 513, 2);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(commented),
    "Zip END signature not found!",
  );
});
it("reads public LOC created-entry path and replaces the actual source stream", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "created.xml" }]),
    zip = open(sample.bytes, Checks.Default, false),
    entry = own(new ZipEntry());
  entry.nOffset = 0n;
  entry.nPathLen = -1;
  entry.nFlag = 0;
  entry.nMethod = 0;
  entry.nCrc = 0x12345678;
  entry.nCompressedSize = 1n;
  entry.nSize = 1n;
  expect(zip.GetEntryHash().empty()).toBe(true);
  expect(zip.readLOC(entry)).toBe(BigInt(sample.central));
  expect(read(new OUString(entry.sPath))).toBe("created.xml");
  zip.setInputStream(input(sample.bytes));
  entry.nOffset = 0n;
  expect(zip.readLOC(entry)).toBe(BigInt(sample.central));
});
it.each([
  ["disk", 4, 1, 2, "invalid end (disk)"],
  ["directory disk", 6, 1, 2, "invalid end (directory disk)"],
  ["entries", 8, 2, 2, "invalid end (entries)"],
  ["entry count", 8, 0xffff, 2, "invalid end (entries)"],
  ["size", 12, 0x7fffffff, 4, "Invalid END header (bad central directory size)"],
  ["offset", 16, -1, 4, "Invalid END header (bad central directory size)"],
] as const)(
  "rejects malformed END %s",
  /** Checks rejects malformed END %s. @param _label - Original fixture or source value. @param offset - Original fixture or source value. @param value - Original fixture or source value. @param width - Original fixture or source value. @param error - Original fixture or source value. @returns Original comparison or actual API result. */ (
    _label,
    offset,
    value,
    width,
    error,
  ) => {
    const sample = image([{ name: "a" }]);
    put(sample.bytes, sample.end + offset, value, width);
    rejects(
      /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
        open(sample.bytes),
      error,
    );
  },
);
it.each([
  ["signature", 0, 0, 4, "Invalid CEN header (bad signature)"],
  ["encryption", 8, 1, 2, "Invalid CEN header (encrypted entry)"],
  ["method", 10, 99, 2, "Invalid CEN header (bad compression method)"],
  ["path", 28, -1, 2, "unexpected name length"],
  ["extra", 30, -1, 2, "unexpected extra header info length"],
  ["comment", 32, -1, 2, "unexpected comment length"],
  ["long path", 28, 500, 2, "name too long"],
  ["stored size", 24, 2, 4, "entry STORED with inconsistent size"],
] as const)(
  "rejects malformed CEN %s",
  /** Checks rejects malformed CEN %s. @param _label - Original fixture or source value. @param offset - Original fixture or source value. @param value - Original fixture or source value. @param width - Original fixture or source value. @param error - Original fixture or source value. @returns Original comparison or actual API result. */ (
    _label,
    offset,
    value,
    width,
    error,
  ) => {
    const sample = image([{ name: "a" }]);
    put(sample.bytes, sample.central + offset, value, width);
    rejects(
      /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
        open(sample.bytes),
      error,
    );
  },
);
it.each([
  ["signature", 0, 0, 4, "Invalid LOC header (bad signature)"],
  ["flag", 6, 1, 2, "The stream seems to be broken!"],
  ["method", 8, 8, 2, "The stream seems to be broken!"],
  ["crc", 14, 5, 4, "The stream seems to be broken!"],
  ["size", 22, 5, 4, "The stream seems to be broken!"],
  ["compressed", 18, 5, 4, "The stream seems to be broken!"],
  ["path length", 26, -1, 2, "The stream seems to be broken!"],
  ["path", 30, 98, 1, "The stream seems to be broken!"],
] as const)(
  "rejects malformed LOC %s",
  /** Checks rejects malformed LOC %s. @param _label - Original fixture or source value. @param offset - Original fixture or source value. @param value - Original fixture or source value. @param width - Original fixture or source value. @param error - Original fixture or source value. @returns Original comparison or actual API result. */ (
    _label,
    offset,
    value,
    width,
    error,
  ) => {
    const sample = image([{ name: "a" }]);
    put(sample.bytes, offset, value, width);
    rejects(
      /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
        open(sample.bytes),
      error,
    );
  },
);
it.each([
  ["locator disk", "locator", 4, 1, 4, "invalid Zip64 end locator (disk)"],
  ["locator offset", "locator", 8, -1, 8, "invalid Zip64 end locator (offset)"],
  ["locator disks", "locator", 16, 2, 4, "invalid Zip64 end locator (number of disks)"],
  ["signature", "end64", 0, 0, 4, "invalid Zip64 end (signature)"],
  ["size", "end64", 4, 43, 8, "invalid Zip64 end (size)"],
  ["disk", "end64", 16, 1, 4, "invalid Zip64 end (disk)"],
  ["directory disk", "end64", 20, 1, 4, "invalid Zip64 end (directory disk)"],
  ["entries", "end64", 24, 2, 8, "invalid Zip64 end (entries)"],
  ["entry agreement", "end", 8, 2, 2, "invalid end (entries)"],
  ["size agreement", "end64", 40, 1, 8, "inconsistent Zip/Zip64 end (size)"],
  ["offset agreement", "end64", 48, 1, 8, "inconsistent Zip/Zip64 end (offset)"],
] as const)(
  "rejects malformed ZIP64 %s",
  /** Checks rejects malformed ZIP64 %s. @param _label - Original fixture or source value. @param record - Original fixture or source value. @param offset - Original fixture or source value. @param value - Original fixture or source value. @param width - Original fixture or source value. @param error - Original fixture or source value. @returns Original comparison or actual API result. */ (
    _label,
    record,
    offset,
    value,
    width,
    error,
  ) => {
    const sample = image([{ name: "a" }], true);
    put(sample.bytes, sample[record] + offset, value, width);
    rejects(
      /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
        open(sample.bytes),
      error,
    );
  },
);
it("ignores source flag bits/timestamps/version mismatches, accepts zero LOC sizes and checks invalid names", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a" }]);
  put(sample.bytes, 4, 45, 2);
  put(sample.bytes, 6, 0x806, 2);
  put(sample.bytes, 10, 123, 4);
  put(sample.bytes, 14, 0, 4);
  put(sample.bytes, 18, 0, 4);
  put(sample.bytes, 22, 0, 4);
  expect(open(sample.bytes).GetEntryHash().size()).toBe(1);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "../a" }]).bytes),
    "Zip entry has an invalid name.",
  );
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "a" }, { name: "a" }]).bytes),
    "Duplicate CEN entry",
  );
});
it("checks Unicode raw-byte extra fields and unknown-field skipping", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const extra = new Uint8Array(10);
  put(extra, 0, 0x7075, 2);
  put(extra, 2, 6, 2);
  extra[4] = 1;
  extra[9] = 97;
  expect(
    open(image([{ name: "a", extra }]).bytes)
      .GetEntryHash()
      .size(),
  ).toBe(1);
  extra[9] = 98;
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "a", extra }]).bytes),
    "Invalid Info-ZIP Unicode Path Extra Field",
  );
  extra[4] = 2;
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "a", extra }]).bytes),
    "Invalid Info-ZIP Unicode Path Extra Field",
  );
  const unknown = Uint8Array.of(2, 0, 2, 0, 123, 42);
  expect(
    open(image([{ name: "a", extra: unknown }]).bytes)
      .GetEntryHash()
      .size(),
  ).toBe(1);
});
it.each([8, 16, 24, 28])(
  "reads original %i-byte Zip64 extra fields in both LOC and CEN",
  /** Checks reads original %i-byte Zip64 extra fields in both LOC and CEN. @param size - Original fixture or source value. @returns Original comparison or actual API result. */ (
    size,
  ) => {
    const extra = new Uint8Array(size + 4);
    put(extra, 0, 1, 2);
    put(extra, 2, size, 2);
    put(extra, 4, 1, 8);
    if (size >= 16) put(extra, 12, 1, 8);
    const sample = image([{ name: "a", extra }]);
    expect(open(sample.bytes).GetEntryHash().find(u("a"))?.nSize).toBe(1n);
  },
);
it("subtracts disjoint occupied intervals when central records arrive out of file order", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a" }, { name: "b" }, { name: "c" }]);
  const directory = sample.bytes.slice(sample.central, sample.end),
    width = 47;
  sample.bytes.set(directory.subarray(width, width * 2), sample.central);
  sample.bytes.set(directory.subarray(0, width), sample.central + width);
  expect(open(sample.bytes).GetEntryHash().size()).toBe(3);
  put(sample.bytes, sample.central + 42, sample.locals[0] as number, 4);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(sample.bytes),
  );
});
it("rejects nonzero descriptor mismatches and missing descriptor flags with original hole diagnostic", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a", descriptor: 16 }]);
  put(sample.bytes, 14, 99, 4);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(sample.bytes),
    "The stream seems to be broken!",
  );
  const missing = image([{ name: "a", descriptor: 16 }]);
  put(missing.bytes, 6, 0, 2);
  put(missing.bytes, missing.central + 8, 0, 2);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(missing.bytes),
    "Zip file has holes the size of data descriptors; producer forgot to set flag bit 3?",
  );
});
it("checks total-entry limit, too-short central directory and Unicode extra extent", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const total = image([{ name: "a" }]);
  put(total.bytes, total.end + 8, 65535, 2);
  put(total.bytes, total.end + 10, 65535, 2);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(total.bytes),
    "too many entries in ZIP File",
  );
  put(total.bytes, total.end + 8, 2, 2);
  put(total.bytes, total.end + 10, 2, 2);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(total.bytes),
    "invalid END header (bad entry count)",
  );
  const extra = Uint8Array.of(0x75, 0x70, 100, 0, 1);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "a", extra }]).bytes),
    "Invalid Info-ZIP Unicode Path Extra Field",
  );
});
it("preserves signed64 Zip64 offset negation overflow rejection", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const extra = new Uint8Array(28);
  put(extra, 0, 1, 2);
  put(extra, 2, 24, 2);
  put(extra, 4, 1, 8);
  put(extra, 12, 1, 8);
  put(extra, 20, 0x8000000000000000n, 8);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(image([{ name: "a", extra }]).bytes),
    "Integer-overflow",
  );
});
it("checks Zip64 count agreement and bad directory geometry after sentinel sizes", /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () => {
  const sample = image([{ name: "a" }], true);
  put(sample.bytes, sample.end64 + 24, 2, 8);
  put(sample.bytes, sample.end64 + 32, 2, 8);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(sample.bytes),
    "inconsistent Zip/Zip64 end (entries)",
  );
  put(sample.bytes, sample.end + 8, 0xffff, 2);
  put(sample.bytes, sample.end + 10, 0xffff, 2);
  put(sample.bytes, sample.end + 12, -1, 4);
  put(sample.bytes, sample.end + 16, -1, 4);
  put(sample.bytes, sample.end64 + 48, -1, 8);
  rejects(
    /** Executes the real native API in the current fixture scope. @returns Original comparison or actual API result. */ () =>
      open(sample.bytes),
    "Invalid Zip64 end (bad central directory size)",
  );
});
