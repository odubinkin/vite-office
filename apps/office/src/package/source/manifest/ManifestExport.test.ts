/** @fileoverview Verifies the bounded ODF 1.3 manifest contract. */

import { describe, expect, it } from "vitest";

import { createOdtManifestXml, ODT_MIMETYPE, validateOdtManifestXml } from "./ManifestExport";

describe("ODF manifest" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
  it("exports and accepts the mandatory Writer streams" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const xml = createOdtManifestXml();
    expect(xml).toContain(`manifest:media-type="${ODT_MIMETYPE}"`);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () => validateOdtManifestXml(xml),
    ).not.toThrow();
  });

  it("rejects declarations, malformed roots, invalid entries, and missing streams" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const valid = createOdtManifestXml();
    for (const xml of [
      `<!DOCTYPE manifest>${valid}`,
      "<broken",
      valid.replace("manifest:manifest", "manifest:wrong"),
      valid.replace(' manifest:media-type="text/xml"', ""),
      valid.replace("content.xml", "styles.xml"),
      valid.replace(ODT_MIMETYPE, "application/invalid"),
      valid.replace(
        '<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>',
        "",
      ),
    ])
      expect(
        /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
        () => validateOdtManifestXml(xml),
      ).toThrow("ODF manifest");
  });
});
