/**
 * @fileoverview Verifies bounded semantic import and roundtrip against the three ODT fixtures
 * used by the pinned LibreOffice `sw/qa/extras/odfimport/odffeatures.cxx` tests.
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../apps/office/src/sfx2/source/doc/objsh";
import { ZipFile } from "../../apps/office/src/package/source/zipapi/ZipFile";
import type { SwDoc } from "../../apps/office/src/sw/source/core/doc/doc";
import { projectWriterTextRuns } from "../../apps/office/src/sw/source/core/txtnode/text-run-projection";
import { readOdtDocument } from "../../apps/office/src/sw/source/filter/xml/swxml";
import { writeOdtDocument } from "../../apps/office/src/sw/source/filter/xml/wrtxml";

const fixtureRoot = path.resolve("vendor/libreoffice-reference/sw/qa/extras/odfimport/data");

/** Exact pinned fixtures and their supported first-run semantics. */
const fixtures = [
  { bold: false, file: "feature_text.odt", italic: false },
  { bold: true, file: "feature_text_bold.odt", italic: false },
  { bold: false, file: "feature_text_italic.odt", italic: true },
] as const;

/** Projects stable Writer semantics while excluding browser-generated node identities. @param document - Imported Writer graph. @returns Comparable bounded ODF semantics. */
function normalizeWriterSemantics(document: SwDoc): readonly object[] {
  return document.paragraphs.map(
    /** Projects one canonical text node to the ODF subset covered by the pinned fixtures. @param paragraph - Writer text node. @returns Stable semantic record. */
    function normalizeParagraph(paragraph): object {
      return {
        alignment: paragraph.alignment,
        list: paragraph.list,
        runs: projectWriterTextRuns(paragraph),
        style: paragraph.style,
        text: paragraph.text,
      };
    },
  );
}

describe("pinned LibreOffice ODT feature fixtures" /** Mirrors the three createSwDoc assertions in upstream odffeatures.cxx with local semantic assertions. @returns Nothing. */, () => {
  for (const fixture of fixtures)
    it(`imports and semantically round-trips ${fixture.file}` /** Verifies the supported text and character properties from one upstream-generated ODT. @returns Completion after import/export/import. */, async () => {
      const bytes = new Uint8Array(fs.readFileSync(path.join(fixtureRoot, fixture.file)));
      const metadata = createDocument({
        id: `upstream:${fixture.file}`,
        suiteId: "writer",
        title: fixture.file,
      });
      const imported = await readOdtDocument(bytes, metadata);
      expect(imported.document.paragraphs).toHaveLength(1);
      expect(imported.document.paragraphs[0]?.text).toBe("Hello World!");
      expect(projectWriterTextRuns(imported.document.paragraphs[0])).toEqual([
        {
          attributes: {
            bold: fixture.bold,
            italic: fixture.italic,
            underline: false,
          },
          text: "Hello World!",
        },
      ]);
      const roundTripped = await readOdtDocument(
        writeOdtDocument(imported.document, { title: imported.title }),
        metadata,
      );
      expect(normalizeWriterSemantics(roundTripped.document)).toEqual(
        normalizeWriterSemantics(imported.document),
      );
    });

  const supportedWriterFixtures = [
    {
      /** Verifies the supported upstream numbered-list model. @param document - Imported graph. @returns Nothing. */
      assert(document: SwDoc): void {
        expect(
          document.paragraphs.map(
            /** Projects list paragraph text. @param paragraph - Imported paragraph. @returns Text. */
            (paragraph) => paragraph.text,
          ),
        ).toEqual(["One", "Two", "Three", ""]);
        expect(
          document.paragraphs.every(
            /** Checks one imported list paragraph. @param paragraph - Imported paragraph. @returns Whether numbered. */
            (paragraph) => paragraph.list.kind === "numbered",
          ),
        ).toBe(true);
      },
      file: "sw/qa/extras/uiwriter/data/tdf113877_insert_numbered_list.odt",
    },
    {
      /** Verifies supported upstream paragraph-style mapping. @param document - Imported graph. @returns Nothing. */
      assert(document: SwDoc): void {
        expect(
          document.paragraphs.map(
            /** Projects one imported style identifier. @param paragraph - Imported paragraph. @returns Style identity. */
            (paragraph) => paragraph.style,
          ),
        ).toEqual(["default", "default", "default", "title", "text-body"]);
      },
      file: "sw/qa/uitest/data/styles.odt",
    },
    {
      /** Verifies supported upstream hyperlink metadata. @param document - Imported graph. @returns Nothing. */
      assert(document: SwDoc): void {
        expect(projectWriterTextRuns(document.paragraphs[0])).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              hyperlink: expect.objectContaining({ url: "http://example.com/" }),
            }),
          ]),
        );
      },
      file: "sw/qa/extras/tiledrendering/data/hyperlink.odt",
    },
  ] as const;

  for (const fixture of supportedWriterFixtures)
    it(`normalizes and reopens supported Writer fixture ${fixture.file}` /** Covers list, style, hyperlink, metadata, and manifest behavior with pinned packages. @returns Completion after assertions. */, async () => {
      const warning = vi.spyOn(console, "warn").mockImplementation(
        /** Suppresses expected diagnostics for unsupported out-of-slice fixture properties. @returns Nothing. */
        () => undefined,
      );
      try {
        const bytes = new Uint8Array(
          fs.readFileSync(path.join("vendor/libreoffice-reference", fixture.file)),
        );
        const imported = await readOdtDocument(bytes, { title: "Pinned Writer fixture" });
        fixture.assert(imported.document);
        const normalized = writeOdtDocument(imported.document, { title: "Phase 7 parity" });
        const archive = new ZipFile(normalized);
        expect(archive.getEntryNames()).toEqual([
          "mimetype",
          "META-INF/manifest.xml",
          "styles.xml",
          "content.xml",
          "meta.xml",
        ]);
        expect(await archive.readTextEntry("META-INF/manifest.xml")).toContain(
          'manifest:full-path="content.xml"',
        );
        expect(await archive.readTextEntry("meta.xml")).toContain(
          "<dc:title>Phase 7 parity</dc:title>",
        );
        const reopened = await readOdtDocument(normalized, { title: "fallback" });
        expect(normalizeWriterSemantics(reopened.document)).toEqual(
          normalizeWriterSemantics(imported.document),
        );
        const second = new ZipFile(writeOdtDocument(reopened.document, { title: reopened.title }));
        for (const entry of ["META-INF/manifest.xml", "styles.xml", "content.xml", "meta.xml"])
          expect(await second.readTextEntry(entry)).toBe(await archive.readTextEntry(entry));
      } finally {
        warning.mockRestore();
      }
    });
});
