/** @fileoverview Source ZipFile Checks modes at real ZIP/OOXML/ODF boundaries, including the first retained entry rule. */
import { expect, it } from "vitest";
import { Checks, ZipFile } from "./ZipFile";
import { ZipOutputStream } from "./ZipOutputStream";
import { ZipStorage } from "../../../oox/source/helper/zipstorage";
/** Creates actual independent records with caller-selected names and sizes. @param entries - Source records. @returns Complete ZIP bytes. */
function archive(entries: readonly (readonly [string, string])[]): Uint8Array {
  const writer = new ZipOutputStream();
  for (const [name, value] of entries) writer.putNextEntry(name, new TextEncoder().encode(value));
  return writer.finish();
}
it("keeps exact-name semantics for raw ZIP and enforces ASCII-only collisions for OOXML", /** Source Default and CheckInsensitive differ without normalizing stored paths. @returns Nothing. */ async () => {
  const bytes = archive([
    ["word/Document.xml", "first"],
    ["WORD/document.XML", "second"],
  ]);
  const raw = new ZipFile(bytes, undefined, Checks.Default);
  expect(raw.getEntryNames()).toEqual(["word/Document.xml", "WORD/document.XML"]);
  expect(await raw.readTextEntry("word/Document.xml")).toBe("first");
  expect(await raw.readTextEntry("WORD/document.XML")).toBe("second");
  expect(
    /** Native explicit mode. @returns Archive. */ () =>
      new ZipFile(bytes, undefined, Checks.CheckInsensitive),
  ).toThrow("Duplicate CEN entry (case insensitive)");
  expect(
    /** Actual OOXML owner selects native OFOPXML mode. @returns Storage. */ () =>
      new ZipStorage(bytes),
  ).toThrow("Duplicate CEN entry (case insensitive)");
});
it.each([
  ["Ä.xml", "ä.xml"],
  ["İ.xml", "i.xml"],
  ["Straße.xml", "STRASSE.xml"],
])(
  "retains distinct non-ASCII names %s and %s",
  /** Original toAsciiLowerCase does not apply locale or Unicode case folding. @param first - First path. @param second - Second path. @returns Nothing. */ (
    first,
    second,
  ) => {
    expect(
      new ZipFile(
        archive([
          [first, ""],
          [second, ""],
        ]),
        undefined,
        Checks.CheckInsensitive,
      ).getEntryNames(),
    ).toEqual([first, second]);
  },
);
it.each([
  ["mimetype", ""],
  ["mimetype", "x"],
  ["MIMETYPE", ""],
  ["other", ""],
])(
  "selects TryCheckInsensitive from first retained %s=%s",
  /** Exact name and zero size are both required for the AutoCorrect exception. @param name - First native path. @param value - First native payload. @returns Nothing. */ (
    name,
    value,
  ) => {
    const bytes = archive([
      [name, value],
      ["A", ""],
      ["a", ""],
    ]);
    if (name === "mimetype" && value === "")
      expect(new ZipFile(bytes, undefined, Checks.TryCheckInsensitive).getEntryNames()).toEqual([
        name,
        "A",
        "a",
      ]);
    else
      expect(
        /** Normal ODF mode rejects case collisions. @returns Archive. */ () =>
          new ZipFile(bytes, undefined, Checks.TryCheckInsensitive),
      ).toThrow("Duplicate CEN entry (case insensitive)");
  },
);
it("does not change TryCheckInsensitive after the first retained entry", /** A later empty mimetype cannot disable the already selected check. @returns Nothing. */ () => {
  const bytes = archive([
    ["first", ""],
    ["mimetype", ""],
    ["A", ""],
    ["a", ""],
  ]);
  expect(
    /** Source decision occurs only with an empty entry map. @returns Archive. */ () =>
      new ZipFile(bytes, undefined, Checks.TryCheckInsensitive),
  ).toThrow("Duplicate CEN entry (case insensitive)");
});
it("ignores a consumed FAT directory when choosing the first retained entry", /** A directory filtered by readCEN does not become the mode-decision record. @returns Nothing. */ () => {
  const bytes = archive([
    ["dir/", ""],
    ["mimetype", ""],
    ["A", ""],
    ["a", ""],
  ]);
  const view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint16(central + 4, 20, true);
  view.setUint32(central + 38, 16, true);
  expect(new ZipFile(bytes, undefined, Checks.TryCheckInsensitive).getEntryNames()).toEqual([
    "mimetype",
    "A",
    "a",
  ]);
});
