/**
 * @fileoverview Verifies bounded semantic import and roundtrip against the three ODT fixtures
 * used by the pinned LibreOffice `sw/qa/extras/odfimport/odffeatures.cxx` tests.
 */

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../apps/office/src/sfx2/source/doc/objsh";
import { SfxRequest } from "../../apps/office/src/sfx2/source/control/request";
import { ZipFile } from "../../apps/office/src/package/source/zipapi/ZipFile";
import type { SwDoc } from "../../apps/office/src/sw/source/core/doc/doc";
import { projectWriterParagraphList } from "../../apps/office/src/sw/source/core/doc/list";
import { projectWriterTextRuns } from "../../apps/office/src/sw/source/core/txtnode/ndtxt";
import { readOdtDocument } from "../../apps/office/src/sw/source/filter/xml/swxml";
import { writeOdtDocument } from "../../apps/office/src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../../apps/office/src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../../apps/office/src/sw/source/uibase/wrtsh/wrtsh";
import { SwPosition } from "../../apps/office/src/sw/source/core/crsr/pam";
import { projectSwTextPrintBounds } from "../../apps/office/src/sw/source/core/layout/newfrm";
import { WRITER_COMMAND_IDS } from "../../apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands";

const fixtureRoot = path.resolve("apps/office/src/sw/qa/extras/odfimport/data");

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
        alignment: paragraph.GetParagraphAlignment(),
        list: projectWriterParagraphList(paragraph),
        runs: projectWriterTextRuns(paragraph),
        style: paragraph.GetParagraphStyle(),
        text: paragraph.GetText(),
      };
    },
  );
}

describe("pinned LibreOffice ODT feature fixtures" /** Mirrors the three createSwDoc assertions in upstream odffeatures.cxx with local semantic assertions. @returns Nothing. */, () => {
  it("keeps tdf114287.odt list and paragraph print bounds after reopening", /** Mirrors upstream exact layout assertions against the local ODT. @returns Completion after export and reopening. */ async () => {
    const file = "apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt";
    const imported = await readOdtDocument(new Uint8Array(fs.readFileSync(file)), { title: file });
    /** Checks the three upstream text frames. @param document - Imported Writer document. @returns Nothing. */
    function assertBounds(document: SwDoc): void {
      const page = document.GetPageDesc().GetValue();
      const paragraphs = [1, 8, 15].map(
        /** Selects one upstream paragraph. @param index - Zero-based index. @returns Text node. */ (
          index,
        ) => {
          const paragraph = document.paragraphs[index];
          if (paragraph === undefined) throw new Error("tdf114287 fixture is incomplete");
          return paragraph;
        },
      );
      expect(
        paragraphs.map(
          /** Projects one exact print bound. @param paragraph - Selected node. @returns Twip bounds. */ (
            paragraph,
          ) => projectSwTextPrintBounds(paragraph, page),
        ),
      ).toEqual([
        { left: 2268, right: 11339 },
        { left: 2268, right: 11339 },
        { left: 357, right: 11339 },
      ]);
    }
    assertBounds(imported.document);
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, { title: imported.title }),
      { title: file },
    );
    assertBounds(reopened.document);
  });

  it("continues tdf113213_addToList.odt and restores the original list with one Undo", /** Mirrors upstream command and Undo assertions against a local ODT. @returns Completion after reopening. */ async () => {
    const file = "apps/office/src/sw/qa/extras/uiwriter/data/tdf113213_addToList.odt";
    const metadata = createDocument({ id: "upstream:tdf113213", suiteId: "writer", title: file });
    const imported = await readOdtDocument(new Uint8Array(fs.readFileSync(file)), metadata);
    const shell = new SwWrtShell(new SwDocShell(imported.document, metadata));
    const paragraphs = imported.document.paragraphs;
    const first = paragraphs[0];
    const penultimate = paragraphs[4];
    const last = paragraphs[5];
    if (first === undefined || penultimate === undefined || last === undefined)
      throw new Error("Continue Numbering fixture has fewer than six paragraphs");
    expect(first.GetListLabel()).toBe("1");
    expect(last.GetListLabel()).toBe("1.");
    const originalListId = last.GetListId();
    const originalRule = last.GetNumRuleName();
    expect(last.IsListRestart()).toBe(true);
    shell.SetPaM(new SwPosition(last, last.Len()), new SwPosition(penultimate, 0));
    const slot = shell
      .GetListShell()
      .GetCommandShell()
      .GetInterface()
      .GetSlot(WRITER_COMMAND_IDS.continueNumbering);
    expect(slot).toBeDefined();
    if (slot === undefined) throw new Error("Continue Numbering slot was not generated");
    const command = shell.GetListShell().GetCommandShell().ResolveSlot(slot.slotId);
    expect(command?.execute(new SfxRequest(slot.slotId))).toMatchObject({
      status: "executed",
      value: true,
    });
    expect(penultimate.GetListId()).toBe(first.GetListId());
    expect(last.GetListId()).toBe(first.GetListId());
    expect(last.GetNumRuleName()).toBe(first.GetNumRuleName());
    expect(last.IsListRestart()).toBe(false);
    expect(last.GetListLabel()).toBe("3");
    expect(shell.Undo()).toBe(true);
    expect(last.GetListLabel()).toBe("1.");
    expect(last.GetListId()).toBe(originalListId);
    expect(last.GetNumRuleName()).toBe(originalRule);
    expect(last.IsListRestart()).toBe(true);
    expect(shell.Redo()).toBe(true);
    expect(last.GetListLabel()).toBe("3");
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, { title: imported.title }),
      metadata,
    );
    expect(reopened.document.paragraphs[0]?.GetListLabel()).toBe("1");
    expect(reopened.document.paragraphs[5]?.GetListLabel()).toBe("3");
  });

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
      expect(imported.document.paragraphs[0]?.GetText()).toBe("Hello World!");
      expect(projectWriterTextRuns(imported.document.paragraphs[0])).toEqual([
        {
          attributes: expect.objectContaining({
            bold: fixture.bold,
            italic: fixture.italic,
            underline: false,
          }),
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
            (paragraph) => paragraph.GetText(),
          ),
        ).toEqual(["One", "Two", "Three", ""]);
        expect(
          document.paragraphs.every(
            /** Checks one imported list paragraph. @param paragraph - Imported paragraph. @returns Whether numbered. */
            (paragraph) => paragraph.GetListKind() === "numbered",
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
            (paragraph) => paragraph.GetParagraphStyle(),
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
        const bytes = new Uint8Array(fs.readFileSync(path.join("apps/office/src", fixture.file)));
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
