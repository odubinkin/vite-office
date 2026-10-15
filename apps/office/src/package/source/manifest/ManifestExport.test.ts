/** @fileoverview Shared native manifest export/read composition retains caller entries without Writer-only stream admission policy. */
import { describe, expect, it } from "vitest";
import { createManifestXml } from "./ManifestWriter";
import { readManifestSequence } from "./ManifestReader";
import { sequence } from "../../../test/fixtures/manifest";
import { MIMETYPE_OASIS_OPENDOCUMENT_TEXT as ODT_MIMETYPE } from "../../../comphelper/inc/documentconstants";
/** Reads a native property string. @param value - Original text. @returns Content. */ function text(value: {
  getStr(): Uint16Array;
  getLength(): number;
}): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
describe("ODF manifest composition", /** Groups native source composition. @returns Nothing. */ () => {
  it("exports and reads the Writer caller's streams through actual shared property values", /** No package document facade. @returns Nothing. */ () => {
    const xml = createManifestXml(sequence());
    expect(xml).toContain(`manifest:media-type="${ODT_MIMETYPE}"`);
    const records = readManifestSequence(xml);
    expect(records).toHaveLength(4);
    expect(
      records.map(
        /** Extracts original named properties. @param row - Native properties. @returns Names. */ (
          row,
        ) =>
          row.map(
            /** Reads actual name. @param p - Property. @returns Name. */ (p) => text(p.Name),
          ),
      ),
    ).toEqual([
      ["FullPath", "Version", "MediaType"],
      ["FullPath", "MediaType"],
      ["FullPath", "MediaType"],
      ["FullPath", "MediaType"],
    ]);
  });
  it("returns native empty parse failures and leaves missing-field admission to package consumers", /** Replaces the retired shared Writer-only validator. @returns Nothing. */ () => {
    for (const xml of [
      "<broken",
      "<root/>",
      createManifestXml(sequence()).replace("manifest:manifest", "manifest:wrong"),
    ])
      expect(readManifestSequence(xml)).toEqual([]);
    const minimal = "<manifest:manifest><manifest:file-entry/></manifest:manifest>";
    expect(readManifestSequence(minimal)).toHaveLength(1);
    const nested = `<manifest:manifest>${"<x>".repeat(256)}${"</x>".repeat(256)}</manifest:manifest>`;
    expect(
      /** Existing declaration admission. @returns Records. */ () =>
        readManifestSequence("<!DOCTYPE manifest:manifest>" + minimal),
    ).toThrow("declarations");
    expect(
      /** Existing depth admission. @returns Records. */ () => readManifestSequence(nested),
    ).toThrow("depth limit");
  });
});
