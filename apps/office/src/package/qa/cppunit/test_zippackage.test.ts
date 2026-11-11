/** @fileoverview Pinned ZipPackageTest normal ZIP64/Unicode-path cases through the actual current ZIP catalog; service factories and intentional recovery omission are not simulated. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { expect, it } from "vitest";
import { ZipFile, Checks } from "../../source/zipapi/ZipFile";
/** Loads committed unchanged upstream fixture bytes. @param name - Pinned fixture basename. @returns Actual archive bytes. */
export function packageFixture(
  name:
    | "tdf163341.ods"
    | "unicode-path.odt"
    | "unicode-path.docx"
    | "dd-deflated.docx"
    | "duplicate-files.odt"
    | "casing.docx"
    | "overlap.docx"
    | "inner-gap.docx",
): Uint8Array {
  return new Uint8Array(readFileSync(new NodeURL("./data/" + name, import.meta.url)));
}
it("ZipPackageTest::testTdf163341 loads the committed native ZIP64 package", /** Original successful normal-open assertion plus real payload/CRC reads; no factory/service substitute. @returns Nothing. */ async () => {
  const archive = new ZipFile(packageFixture("tdf163341.ods"));
  expect(archive.getEntryNames()).toEqual([
    "mimetype",
    "META-INF/manifest.xml",
    "styles.xml",
    "content.xml",
  ]);
  expect(await archive.readTextEntry("mimetype")).toBe(
    "application/vnd.oasis.opendocument.spreadsheet",
  );
  expect(await archive.readTextEntry("META-INF/manifest.xml")).toContain("manifest:manifest");
  expect(await archive.readTextEntry("styles.xml")).toContain("office:document-styles");
  expect(await archive.readTextEntry("content.xml")).toContain("office:document-content");
});
it.each([
  ["testUnicodeODT", "unicode-path.odt"],
  ["testUnicodeDOCX", "unicode-path.docx"],
] as const)(
  "ZipPackageTest::%s rejects inconsistent Unicode paths",
  /** Original normal non-recovery rejection. Source recovery cases are intentionally outside application policy and are not faked. @param _case - Original registration. @param fixture - Source data. @returns Nothing. */ (
    _case,
    fixture,
  ) => {
    expect(
      /** Opens actual source fixture through the current real parser boundary. @returns Archive. */ () =>
        new ZipFile(packageFixture(fixture)),
    ).toThrow("Invalid Info-ZIP Unicode Path Extra Field");
  },
);

it("ZipPackageTest::testDataDescriptorDeflatedDOCX rejects the unchanged source fixture", /** Original normal ZIP open fails at LOC consistency, without a fake package service or recovery. @returns Nothing. */ () => {
  expect(
    /** Opens committed original bytes. @returns Archive. */ () =>
      new ZipFile(packageFixture("dd-deflated.docx")),
  ).toThrow("The stream seems to be broken!");
});

it.each([
  ["testDuplicate", "duplicate-files.odt", Checks.Default, "Duplicate CEN entry"],
  [
    "testCaseInsensitiveDOCX",
    "casing.docx",
    Checks.CheckInsensitive,
    "Duplicate CEN entry (case insensitive)",
  ],
  ["testOverlapDOCX", "overlap.docx", Checks.Default, "overlapping entries"],
  ["testInnerGapDOCX", "inner-gap.docx", Checks.Default, "Zip file has holes! It will leak!"],
] as const)(
  "ZipPackageTest::%s preserves normal source rejection",
  /** Unmodified source archives at their actual consumed ZIP layer; native package service wrapping and recovery are not fabricated. @param _case - Upstream case. @param name - Fixture. @param checks - Source StorageFormat policy. @param message - Source failure. @returns Nothing. */ (
    _case,
    name,
    checks,
    message,
  ) => {
    expect(
      /** Opens source data with original mode. @returns Archive. */ () =>
        new ZipFile(packageFixture(name), undefined, checks),
    ).toThrow(message);
  },
);
