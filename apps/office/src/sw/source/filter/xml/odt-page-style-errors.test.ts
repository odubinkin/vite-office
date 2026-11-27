/** @fileoverview Verifies native Writer master-page import defaults and style lookup. */
import { NoSuchElementException } from "../../../../cppu/inc/com/sun/star/container/NoSuchElementException";

import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { createWriterDocument, SwDoc } from "../../core/doc/doc";
import { UseOnPage } from "../../core/layout/pagedesc";
import { readOdtDocument } from "./swxml";
import { importWriterXml } from "./xmlimp";
import { exportContentXml, exportStylesXml } from "./xmlexp";

describe("ODT master-page binding", /** Registers malformed style fixtures. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const styles = exportStylesXml(document);
  const content = exportContentXml(document);
  const importStyles =
    /** Runs the focused test callback. @param xml - Input for this operation. @returns Operation result. */ (
      xml: string,
    ) => importWriterXml(xml, content, { title: "Imported" });

  it("reuses the page style for a repeated master name", /** Checks native ownership for duplicate master contexts. @returns Nothing. */ () => {
    const master = '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>';
    const imported = importStyles(styles.replace(master, `${master}${master}`)).document;
    try {
      expect(imported.GetPageDescCnt()).toBe(1);
      expect(imported.GetPageDesc().GetName()).toBe("Standard");
    } finally {
      imported.Dispose();
    }
  });

  it("leaves an unreferenced page layout unattached", /** Checks the default page descriptor when no master binds the layout. @returns Nothing. */ () => {
    const withoutMaster = styles
      .replace('<style:master-page style:name="Standard" style:page-layout-name="pm1"/>', "")
      .replace(/fo:page-width="[^"]+"/u, 'fo:page-width="1in"');
    const imported = importStyles(withoutMaster).document;
    try {
      expect(imported.GetPageDesc().GetValue()).toEqual(document.GetPageDesc().GetValue());
    } finally {
      imported.Dispose();
    }
  });

  it("keeps defaults for absent page layout and follow references", /** Checks the fallback from unmatched source references. @returns Nothing. */ () => {
    const missing = styles.replace(
      '<style:master-page style:name="Standard" style:page-layout-name="pm1"/>',
      '<style:master-page style:name="Standard" style:page-layout-name="missing" style:next-style-name="unknown"/>',
    );
    const imported = importStyles(missing).document;
    try {
      const page = imported.GetPageDesc();
      expect(page.GetValue()).toEqual(document.GetPageDesc().GetValue());
      expect(page.GetFollow()).toBe(page);
    } finally {
      imported.Dispose();
    }
  });

  it("testPageStyleLayoutDefault opens the pinned document with all-page usage", /** Ports the pinned Writer default page-layout assertion. @returns Completion. */ async () => {
    const bytes = new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/hello.odt"),
    );
    const { document: imported } = await readOdtDocument(bytes, { title: "Imported" });
    try {
      expect(imported.FindPageDesc("Standard")?.GetUseOn()).toBe(UseOnPage.All);
    } finally {
      imported.Dispose();
    }
  });

  it("reports a master page missing from the document descriptor collection", /** Checks a corrupted model lookup. @returns Nothing. */ () => {
    const lookup = vi.spyOn(SwDoc.prototype, "FindPageDesc").mockReturnValue(undefined);
    try {
      expect(
        /** Runs the focused test callback. @returns Operation result. */ () =>
          importStyles(styles),
      ).toThrow(NoSuchElementException);
    } finally {
      lookup.mockRestore();
    }
  });
});
