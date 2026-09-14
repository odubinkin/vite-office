/**
 * @fileoverview Verifies bounded semantic import and roundtrip against the three ODT fixtures
 * used by the pinned LibreOffice `sw/qa/extras/odfimport/odffeatures.cxx` tests.
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createDocument } from "../../apps/office/src/sfx2/source/doc/objsh";
import { readOdtDocument } from "../../apps/office/src/sw/source/filter/xml/swxml";
import { writeOdtDocument } from "../../apps/office/src/sw/source/filter/xml/wrtxml";

const fixtureRoot = path.resolve("vendor/libreoffice-reference/sw/qa/extras/odfimport/data");

/** Exact pinned fixtures and their supported first-run semantics. */
const fixtures = [
  { bold: false, file: "feature_text.odt", italic: false },
  { bold: true, file: "feature_text_bold.odt", italic: false },
  { bold: false, file: "feature_text_italic.odt", italic: true },
] as const;

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
      expect(imported.document.paragraphs[0]).toMatchObject({
        runs: [
          {
            attributes: {
              bold: fixture.bold,
              italic: fixture.italic,
              underline: false,
            },
            text: "Hello World!",
          },
        ],
        text: "Hello World!",
      });
      const roundTripped = await readOdtDocument(
        writeOdtDocument(imported.document, imported.documentState),
        metadata,
      );
      expect(roundTripped.document.paragraphs[0]?.runs).toEqual(
        imported.document.paragraphs[0]?.runs,
      );
    });
});
