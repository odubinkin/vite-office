/** @fileoverview Pinned storagehelper UTF16/name/path boundary tables and actual ZIP transport composition; no service/provider surrogate. */
import { expect, it } from "vitest";
import { OStorageHelper } from "../../inc/storagehelper";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../package/source/zipapi/ZipOutputStream";
/** Constructs a borrowed UTF16 view, retaining each code unit including unpaired surrogates. @param text - Literal units. @returns View. */
function view(text: string): Uint16Array {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
  return units;
}
it.each([
  ["", true],
  ["a", true],
  ["...", true],
  [".a", true],
  ["a..", true],
  ["a/.../b", true],
  ["a/...", true],
  ["a/", true],
  ["a//b", true],
  ["a//", true],
  ["a/../b", false],
  ["a/./b", false],
  [".", false],
  ["..", false],
  ["a/.", false],
  ["a/..", false],
  ["/a", false],
  ["/", false],
  ["a\\b", false],
  ["a?b", false],
  ["a<b", false],
  ["a>b", false],
  ['a"b', false],
  ["a|b", false],
  ["a:b", false],
  ["a\0b", false],
  ["a\u001fb", false],
  ["a b", true],
  ["a\u007fb", true],
  ["a\ud7ffb", true],
  ["a\ud800b", false],
  ["a\udfffb", false],
  ["a\ue000b", true],
  ["a\ud83d\ude00b", false],
  ["文档/表格.xml", true],
] as const)(
  "retains source name result for %j",
  /** Source validity result independent of host path utilities. @param name - UTF16 name. @param valid - Expected result. @returns Nothing. */ (
    name,
    valid,
  ) => {
    expect(OStorageHelper.IsValidZipEntryFileName(view(name), true)).toBe(valid);
  },
);
it("preserves the slash flag and borrowed view boundaries", /** True and false modes differ only at separators; suffix outside the view is not scanned. @returns Nothing. */ () => {
  expect(OStorageHelper.IsValidZipEntryFileName(view("a/b"), false)).toBe(false);
  expect(OStorageHelper.IsValidZipEntryFileName(view("a/"), false)).toBe(false);
  expect(OStorageHelper.IsValidZipEntryFileName(view("a.."), false)).toBe(true);
  expect(OStorageHelper.IsValidZipEntryFileName(view(""), false)).toBe(true);
  expect(OStorageHelper.IsValidZipEntryFileName(view("xname?y").subarray(1, 5), false)).toBe(true);
});
it.each([
  ["", "", false],
  ["a", "", false],
  ["a", "ab", false],
  ["word/document.xml", "word", true],
  ["a/word/b", "word", true],
  ["a/word", "word", true],
  ["word", "word", true],
  ["words/a", "word", false],
  ["a/words/b", "word", false],
  ["a/notword", "word", false],
  ["notword/a", "word", false],
  ["a/wordx", "word", false],
  ["a//word//b", "word", true],
  ["/word/", "word", true],
  ["a/../b", "..", true],
  ["a/b/c", "a/b", true],
  ["x/a/b", "a/b", true],
  ["x/a/b/c", "a/b", true],
  ["x/ab/c", "a/b", false],
  ["a//b", "/", false],
  ["a///b", "/", true],
  ["a\\b", "b", false],
  ["a/文档/b", "文档", true],
  ["a/\ud83d\ude00/b", "\ud83d\ude00", true],
] as const)(
  "matches path %j segment %j",
  /** Literal source substring/begin/end contract, including invalid path inputs accepted by this nonvalidator. @param path - Path. @param segment - Segment. @param found - Expected. @returns Nothing. */ (
    path,
    segment,
    found,
  ) => {
    expect(OStorageHelper.PathHasSegment(view(path), view(segment))).toBe(found);
  },
);
it("uses the shared source helper for real ZIP output and central-directory input", /** No name normalization is inserted into the archive catalog. @returns Nothing. */ async () => {
  const output = new ZipOutputStream();
  const names = ["", "word//document.xml", "word/.../notes.xml", "文档/表格.xml", "word/"];
  for (const name of names) output.putNextEntry(name, new Uint8Array([17, 255]));
  const archive = new ZipFile(output.finish());
  expect(archive.getEntryNames()).toEqual(names);
  for (const name of names)
    expect(await archive.readEntry(name)).toEqual(new Uint8Array([17, 255]));
  for (const name of ["word/a?b.xml", "word/a:b.xml", "word/😀.xml"])
    expect(
      /** Attempts invalid output through the actual shared validator. @returns Nothing. */ () =>
        new ZipOutputStream().putNextEntry(name, new Uint8Array()),
    ).toThrow("Unsafe ZIP entry name");
  // External archive name bytes are changed directly so output validation cannot mask input behavior.
  const external = new ZipOutputStream();
  external.putNextEntry("a-b", new Uint8Array());
  const bytes = external.finish(),
    central = 33;
  bytes[31] = 63;
  bytes[central + 47] = 63;
  expect(
    /** Parses independently corrupted central-directory name bytes. @returns Actual archive, unless rejected. */ () =>
      new ZipFile(bytes),
  ).toThrow("Unsafe ZIP entry name");
});
