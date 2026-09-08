/** @fileoverview Verifies deterministic ZIP output and defensive ZIP32 input validation. */

import { deflateRawSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CRC32 } from "./CRC32";
import {
  assertSafeZipEntryName,
  DEFAULT_ZIP_FILE_LIMITS,
  ZipFile,
  type ZipFileLimits,
} from "./ZipFile";
import { ZipOutputStream } from "./ZipOutputStream";

const encoder = new TextEncoder();

afterEach(
  /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
  () => vi.unstubAllGlobals(),
);

/** Creates one deterministic stored ZIP. @param entries - Name/text pairs. @returns Bytes. */
function storedZip(entries: readonly (readonly [string, string])[]): Uint8Array {
  const output = new ZipOutputStream();
  entries.forEach(
    /** Adds one fixture entry. @param entry - Name and text tuple. @returns Nothing. */
    (entry) => {
      const [name, text] = entry;
      output.putNextEntry(name, encoder.encode(text));
    },
  );
  return output.finish();
}

/** Finds the last little-endian ZIP signature. @param bytes - ZIP bytes. @param signature - Signature. @returns Offset. */
function findSignature(bytes: Uint8Array, signature: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 4; offset >= 0; offset -= 1)
    if (view.getUint32(offset, true) === signature) return offset;
  throw new Error("test ZIP signature missing");
}

/** Clones and mutates ZIP bytes. @param source - ZIP. @param mutate - Mutation callback. @returns Changed ZIP. */
function changedZip(
  source: Uint8Array,
  mutate: (view: DataView, bytes: Uint8Array) => void,
): Uint8Array {
  const bytes = source.slice();
  mutate(new DataView(bytes.buffer), bytes);
  return bytes;
}

/** Creates a one-entry ZIP around caller-provided compressed bytes. @param plain - Uncompressed content. @param compressed - Stored payload. @param method - ZIP method. @returns ZIP bytes. */
function rawZip(plain: Uint8Array, compressed: Uint8Array, method: 0 | 8): Uint8Array {
  const name = encoder.encode("entry.txt");
  const centralOffset = 30 + name.length + compressed.length;
  const bytes = new Uint8Array(centralOffset + 46 + name.length + 22);
  const view = new DataView(bytes.buffer);
  const crc = CRC32.compute(plain);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, method, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, compressed.length, true);
  view.setUint32(22, plain.length, true);
  view.setUint16(26, name.length, true);
  bytes.set(name, 30);
  bytes.set(compressed, 30 + name.length);
  view.setUint32(centralOffset, 0x02014b50, true);
  view.setUint16(centralOffset + 4, 20, true);
  view.setUint16(centralOffset + 6, 20, true);
  view.setUint16(centralOffset + 8, 0x0800, true);
  view.setUint16(centralOffset + 10, method, true);
  view.setUint32(centralOffset + 16, crc, true);
  view.setUint32(centralOffset + 20, compressed.length, true);
  view.setUint32(centralOffset + 24, plain.length, true);
  view.setUint16(centralOffset + 28, name.length, true);
  bytes.set(name, centralOffset + 46);
  const end = centralOffset + 46 + name.length;
  view.setUint32(end, 0x06054b50, true);
  view.setUint16(end + 8, 1, true);
  view.setUint16(end + 10, 1, true);
  view.setUint32(end + 12, 46 + name.length, true);
  view.setUint32(end + 16, centralOffset, true);
  return bytes;
}

/** Produces limits with selected overrides. @param overrides - Replacements. @returns Complete limits. */
function limits(overrides: Partial<ZipFileLimits>): ZipFileLimits {
  return { ...DEFAULT_ZIP_FILE_LIMITS, ...overrides };
}

describe("ZipOutputStream" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("writes deterministic empty and stored archives" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    expect(new ZipFile(new ZipOutputStream().finish()).getEntryNames()).toEqual([]);
    const bytes = storedZip([
      ["a.txt", "alpha"],
      ["folder/b.txt", "beta"],
    ]);
    const archive = new ZipFile(bytes);
    expect(archive.getEntryNames()).toEqual(["a.txt", "folder/b.txt"]);
    expect(archive.getEntryMethod("a.txt")).toBe(0);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => archive.getEntryMethod("missing"),
    ).toThrow("Missing ZIP entry");
    expect(new TextDecoder().decode(await archive.readEntry("a.txt"))).toBe("alpha");
    expect(await archive.readTextEntry("folder/b.txt")).toBe("beta");
  });

  it("rejects invalid output state, duplicates, names, and ZIP32 limits" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const output = new ZipOutputStream();
    output.putNextEntry("a", new Uint8Array());
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => output.putNextEntry("a", new Uint8Array()),
    ).toThrow("Duplicate ZIP entry");
    output.finish();
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => output.putNextEntry("b", new Uint8Array()),
    ).toThrow("already finished");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => output.finish(),
    ).toThrow("already finished");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipOutputStream().putNextEntry("a".repeat(0x10000), new Uint8Array()),
    ).toThrow("name exceeds ZIP32");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipOutputStream().putNextEntry("huge", { length: 0x100000000 } as Uint8Array),
    ).toThrow("entry size exceeds ZIP32");
    const crowded = new ZipOutputStream();
    const privateEntries = (crowded as unknown as { entries: unknown[] }).entries;
    privateEntries.push(
      ...Array.from(
        {
          length: 0xffff,
        } /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */,
        () => ({ name: "occupied" }),
      ),
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => crowded.putNextEntry("last", new Uint8Array()),
    ).toThrow("entry count exceeds");
    const huge = new ZipOutputStream();
    (huge as unknown as { entries: unknown[] }).entries.push({
      bytes: { length: 0xffffffff },
      crc32: 0,
      localOffset: 0,
      name: "huge",
      nameBytes: new Uint8Array(1),
    });
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => huge.finish(),
    ).toThrow("archive exceeds ZIP32");
  });
});

describe("ZipFile" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("reads DEFLATE and data-descriptor records" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const plain = encoder.encode("deflated payload deflated payload");
    const compressed = Uint8Array.from(deflateRawSync(plain));
    expect(
      Array.from(await new ZipFile(rawZip(plain, compressed, 8)).readEntry("entry.txt")),
    ).toEqual(Array.from(plain));

    const descriptor = changedZip(
      rawZip(
        plain,
        plain,
        0,
      ) /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        view.setUint16(6, 0x0808, true);
        view.setUint16(central + 8, 0x0808, true);
        view.setUint32(14, 0, true);
        view.setUint32(18, 0, true);
        view.setUint32(22, 0, true);
      },
    );
    expect(Array.from(await new ZipFile(descriptor).readEntry("entry.txt"))).toEqual(
      Array.from(plain),
    );
  });

  it("validates resource ceilings before reading" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const one = storedZip([["a", "abcd"]]);
    for (const invalid of [
      limits({ maxArchiveBytes: 0 }),
      limits({ maxEntries: 1.5 }),
      limits({ maxEntryBytes: Number.POSITIVE_INFINITY }),
      limits({ maxTotalBytes: 1.5 }),
      limits({ maxExpansionRatio: -1 }),
    ])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => new ZipFile(one, invalid),
      ).toThrow("resource limits are invalid");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(one, limits({ maxArchiveBytes: one.length - 1 })),
    ).toThrow("archive exceeds size limit");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        new ZipFile(
          storedZip([
            ["a", ""],
            ["b", ""],
          ]),
          limits({ maxEntries: 1 }),
        ),
    ).toThrow("entry count exceeds limit");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(one, limits({ maxEntryBytes: 3 })),
    ).toThrow("entry exceeds size limit");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        new ZipFile(
          storedZip([
            ["a", "aa"],
            ["b", "bb"],
          ]),
          limits({ maxTotalBytes: 3 }),
        ),
    ).toThrow("contents exceed total size limit");
    const ratio = changedZip(
      one /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        view.setUint32(central + 20, 0, true);
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(ratio),
    ).toThrow("entry exceeds expansion limit");
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(one, limits({ maxExpansionRatio: 0.5 })),
    ).toThrow("entry exceeds expansion limit");
  });

  it("rejects missing, multi-disk, mismatched, and malformed directory records" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const source = storedZip([["a", "x"]]);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(new Uint8Array(21)),
    ).toThrow("end-of-central-directory");
    const cases: readonly [number, number, string][] = [
      [4, 1, "Multi-disk"],
      [6, 1, "Multi-disk"],
      [8, 0, "counts differ"],
      [12, 0, "bounds are invalid"],
    ];
    for (const [relative, value, message] of cases) {
      const bytes = changedZip(
        source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param archive - Callback input. @returns Callback result. */,
        (view, archive) => {
          const end = findSignature(archive, 0x06054b50);
          if (relative === 12) view.setUint32(end + relative, value, true);
          else view.setUint16(end + relative, value, true);
        },
      );
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => new ZipFile(bytes),
      ).toThrow(message);
    }
    const badSignature = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        view.setUint32(findSignature(bytes, 0x02014b50), 0, true);
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(badSignature),
    ).toThrow("central-directory entry is invalid");
    const badLength = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        view.setUint16(central + 28, 0xffff, true);
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(badLength),
    ).toThrow("entry exceeds bounds");
    const unusedCentral = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const end = findSignature(bytes, 0x06054b50);
        view.setUint16(end + 8, 0, true);
        view.setUint16(end + 10, 0, true);
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(unusedCentral),
    ).toThrow("size does not match entries");
  });

  it("rejects encryption, unsupported methods, ZIP64, duplicates, and unsafe names" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const source = storedZip([["a", "x"]]);
    const centralFieldCases: readonly [number, number, 2 | 4, string][] = [
      [8, 0x0801, 2, "Encrypted"],
      [10, 99, 2, "Unsupported ZIP method"],
      [20, 0xffffffff, 4, "ZIP64"],
      [24, 0xffffffff, 4, "ZIP64"],
      [42, 0xffffffff, 4, "ZIP64"],
    ];
    for (const [relative, value, width, message] of centralFieldCases) {
      const bytes = changedZip(
        source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param archive - Callback input. @returns Callback result. */,
        (view, archive) => {
          const central = findSignature(archive, 0x02014b50);
          if (width === 2) view.setUint16(central + relative, value, true);
          else view.setUint32(central + relative, value, true);
        },
      );
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => new ZipFile(bytes),
      ).toThrow(message);
    }
    const duplicate = changedZip(
      storedZip([
        ["a", ""],
        ["b", ""],
      ]),
      /** Executes the enclosing deterministic test or transformation callback. @param _view - Callback input. @param bytes - Callback input. @returns Callback result. */
      (_view, bytes) => {
        const end = findSignature(bytes, 0x06054b50);
        const firstCentral = new DataView(bytes.buffer).getUint32(end + 16, true);
        const secondCentral = firstCentral + 47;
        bytes[secondCentral + 46] = 0x61;
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(duplicate),
    ).toThrow("Duplicate ZIP entry");
    for (const name of ["", "a\0b", "a\\b", "/a", "C:a", "a//b", "a/./b", "a/../b"])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => assertSafeZipEntryName(name),
      ).toThrow("Unsafe ZIP entry name");
    expect(assertSafeZipEntryName.bind(undefined, "META-INF/manifest.xml")).not.toThrow();
    expect(assertSafeZipEntryName.bind(undefined, "Configurations2/progressbar/")).not.toThrow();
    expect(new ZipFile(storedZip([["Configurations2/progressbar/", ""]])).getEntryNames()).toEqual([
      "Configurations2/progressbar/",
    ]);
  });

  it("validates UTF-8 entry names and supports ASCII legacy flags and ZIP comments" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const source = storedZip([["a", "x"]]);
    const ascii = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        view.setUint16(6, 0, true);
        view.setUint16(central + 8, 0, true);
      },
    );
    expect(await new ZipFile(ascii).readTextEntry("a")).toBe("x");
    const nonUtf8 = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        view.setUint16(central + 8, 0, true);
        bytes[central + 46] = 0xff;
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(nonUtf8),
    ).toThrow("Non-UTF-8");
    const invalidUtf8 = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param _view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (_view, bytes) => {
        const central = findSignature(bytes, 0x02014b50);
        bytes[central + 46] = 0xff;
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(invalidUtf8),
    ).toThrow("not valid UTF-8");
    const end = findSignature(source, 0x06054b50);
    const commented = new Uint8Array(source.length + 2);
    commented.set(source);
    new DataView(commented.buffer).setUint16(end + 20, 2, true);
    commented.set([1, 2], source.length);
    expect(new ZipFile(commented).getEntryNames()).toEqual(["a"]);
  });

  it("validates local records, sizes, payload integrity, and missing entries" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, async () => {
    const source = storedZip([["a", "data"]]);
    const archive = new ZipFile(source);
    expect(archive.hasEntry("a")).toBe(true);
    expect(archive.hasEntry("missing")).toBe(false);
    await expect(archive.readEntry("missing")).rejects.toThrow("Missing ZIP entry");
    const localCases: readonly [number, number, 2 | 4, string][] = [
      [0, 0, 4, "local header is invalid"],
      [6, 0, 2, "local and central records differ"],
      [8, 8, 2, "local and central records differ"],
      [14, 1, 4, "local entry metadata differs"],
      [18, 3, 4, "local entry metadata differs"],
      [22, 3, 4, "local entry metadata differs"],
    ];
    for (const [offset, value, width, message] of localCases) {
      const bytes = changedZip(
        source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @returns Callback result. */,
        (view) => {
          if (width === 2) view.setUint16(offset, value, true);
          else view.setUint32(offset, value, true);
        },
      );
      await expect(new ZipFile(bytes).readEntry("a")).rejects.toThrow(message);
    }
    const differentName = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param _view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (_view, bytes) => {
        bytes[30] = 0x62;
      },
    );
    await expect(new ZipFile(differentName).readEntry("a")).rejects.toThrow("name differs");
    const central = findSignature(source, 0x02014b50);
    const badBounds = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @returns Callback result. */,
      (view) => {
        view.setUint16(28, central, true);
      },
    );
    await expect(new ZipFile(badBounds).readEntry("a")).rejects.toThrow("data exceeds bounds");
    const badSize = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const directory = findSignature(bytes, 0x02014b50);
        view.setUint32(22, 5, true);
        view.setUint32(directory + 24, 5, true);
      },
    );
    await expect(new ZipFile(badSize).readEntry("a")).rejects.toThrow("size mismatch");
    const badCrc = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        const directory = findSignature(bytes, 0x02014b50);
        view.setUint32(14, 1, true);
        view.setUint32(directory + 16, 1, true);
      },
    );
    await expect(new ZipFile(badCrc).readEntry("a")).rejects.toThrow("CRC mismatch");
    const invalidDeflate = rawZip(encoder.encode("abc"), new Uint8Array([1, 2, 3]), 8);
    await expect(new ZipFile(invalidDeflate).readEntry("entry.txt")).rejects.toThrow(
      "DEFLATE payload is invalid",
    );
    const expanded = encoder.encode("a".repeat(10_000));
    const understated = rawZip(encoder.encode("a"), Uint8Array.from(deflateRawSync(expanded)), 8);
    await expect(new ZipFile(understated).readEntry("entry.txt")).rejects.toThrow(
      "DEFLATE payload is invalid",
    );
    vi.stubGlobal(
      "Response",
      /** Test double whose stream body is intentionally absent. */
      class NullBodyResponse {
        public readonly body = null;
      },
    );
    await expect(new ZipFile(invalidDeflate).readEntry("entry.txt")).rejects.toThrow(
      "DEFLATE payload is invalid",
    );
  });

  it("rejects an EOCD signature whose declared comment does not reach archive end" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const source = storedZip([["a", "x"]]);
    const malformed = changedZip(
      source /** Executes the enclosing deterministic test or transformation callback. @param view - Callback input. @param bytes - Callback input. @returns Callback result. */,
      (view, bytes) => {
        view.setUint16(findSignature(bytes, 0x06054b50) + 20, 1, true);
      },
    );
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => new ZipFile(malformed),
    ).toThrow("end-of-central-directory");
  });
});
