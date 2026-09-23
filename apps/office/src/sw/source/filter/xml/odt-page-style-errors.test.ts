/** @fileoverview Validates ODT master-page graph errors at Writer import. */

import { describe, expect, it, vi } from "vitest";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import { importWriterXml } from "./xmlimp";
import { exportContentXml, exportStylesXml } from "./xmlexp";

describe("ODT master-page validation", /** Registers malformed style fixtures. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const styles = exportStylesXml(document);
  const content = exportContentXml(document);
  const importStyles =
    /** Runs the focused test callback. @param xml - Input for this operation. @returns Operation result. */ (
      xml: string,
    ) => importWriterXml(xml, content, { title: "Imported" });

  it("rejects duplicate master pages", /** Checks duplicate ODF declarations. @returns Nothing. */ () => {
    const master = '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>';
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        importStyles(styles.replace(master, `${master}${master}`)),
    ).toThrow("Duplicate ODF master page");
  });

  it("uses a page layout without a master page", /** Checks the default layout fallback. @returns Nothing. */ () => {
    const withoutMaster = styles.replace(
      '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>',
      "",
    );
    expect(importStyles(withoutMaster).document.GetPageDesc().GetName()).toBe("Standard");
  });

  it("rejects missing master layout and follow links", /** Checks broken references. @returns Nothing. */ () => {
    const missingLayout = styles.replace(
      'style:master-page style:name="Standard" style:page-layout-name="pm1"',
      'style:master-page style:name="Standard" style:page-layout-name="missing"',
    );
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        importStyles(missingLayout),
    ).toThrow("Missing ODF page layout");
    const missingFollow = styles.replace(
      '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>',
      '<style:master-page style:name="Standard" style:page-layout-name="pm1" style:next-style-name="missing"/>',
    );
    expect(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        importStyles(missingFollow),
    ).toThrow("Missing ODF follow master page");
  });

  it("reports a master page missing from the document descriptor collection", /** Checks a corrupted model lookup. @returns Nothing. */ () => {
    const lookup = vi.spyOn(SwDoc.prototype, "FindPageDesc").mockReturnValue(undefined);
    try {
      expect(
        /** Runs the focused test callback. @returns Operation result. */ () =>
          importStyles(styles),
      ).toThrow("Missing ODF follow master page: Standard");
    } finally {
      lookup.mockRestore();
    }
  });
});
