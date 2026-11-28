/** @fileoverview LibreOffice ODT redline fixtures through native Writer nodes and Worker transfer. */
import { GetRedlineAuthor } from "../../core/doc/docredln";
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { RedlineType } from "../../../../svx/inc/ctredlin";
import { SvxFontHeightItem } from "../../../../editeng/source/items/textitem.height";
import { RES_CHRATR_FONTSIZE, RES_TXTATR_CHARFMT } from "../../../inc/hintids";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableNode } from "../../core/docnode/node";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { effectiveItem } from "../../core/unocore/unocrsrhelper";
import { readOdtDocument } from "./swxml";
import { importWriterXml } from "./xmlimp";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const metadata = { title: "Writer tracked changes" };
const fixtures = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";

/** Checks the original model, the Worker result and the next ODT import. @param document - Imported fixture. @param check - Original core assertion. @returns Saved content stream. */
async function roundTrip(document: SwDoc, check: (document: SwDoc) => void): Promise<string> {
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    check(document);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    check(worker);
    const output = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(output, metadata)).document;
    check(reopened);
    const archive = await DocumentArchive.open(output);
    return await archive.readTextEntry("content.xml");
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
}

it("exports a full midnight datetime from testMidnightRedlineDatetime", /** Ports the original dateTime assertion through ODT. @returns Completion. */ async () => {
  const fixture = readFileSync(`${fixtures}/midnight_redline.fodt`, "utf8");
  const content = fixture.replaceAll("office:document", "office:document-content");
  const { document } = importWriterXml(undefined, content, metadata);
  const saved = await roundTrip(
    document,
    /** Inspects the imported tracked changes and their document metadata. @param model - Imported Writer model. @returns Nothing. */ (
      model,
    ) => {
      const owner = model.GetIDocumentRedlineAccess();
      const ranges = owner.GetRedlineTable().entries();
      expect(ranges).toHaveLength(1);
      const [range] = ranges;
      assert(range);
      expect(range.GetRedlineData().GetType()).toBe(RedlineType.Delete);
      expect(GetRedlineAuthor(range.GetRedlineData().GetAuthor())).toBe("John Doe");
      expect(range.Start().GetNode().GetTextNode()?.GetText()).toBe("Deleted text");
      expect([range.Start().GetContentIndex(), range.End().GetContentIndex()]).toEqual([0, 12]);
    },
  );
  expect(saved).toContain("<dc:date>2001-01-01T00:00:00</dc:date>");
  expect(saved).toContain('text:track-changes="false"');
  expect(saved).toMatch(
    /<text:deletion>[\s\S]*?<text:p[^>]*>Deleted<text:s\/>text<\/text:p><\/text:deletion>/u,
  );
  expect(saved).toMatch(
    /<\/text:tracked-changes>(?:<text:sequence-decls>[\s\S]*?<\/text:sequence-decls>)?<text:p[^>]*><text:change text:change-id=/u,
  );
});

it("retains the two change portions around a single space in testWhitespace", /** Ports the two original redline portion sequences. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${fixtures}/whitespace.odt`)),
    metadata,
  );
  await roundTrip(
    document,
    /** Verifies the tracked formatting ranges after ODT import. @param model - Imported Writer model. @returns Nothing. */ (
      model,
    ) => {
      const ranges = model.GetIDocumentRedlineAccess().GetRedlineTable().entries();
      expect(ranges).toHaveLength(2);
      for (const range of ranges) {
        const start = range.Start();
        const end = range.End();
        expect(start.GetNode()).toBe(end.GetNode());
        const text = start.GetNode().GetTextNode()?.GetText();
        assert(text);
        const from = start.GetContentIndex();
        const to = end.GetContentIndex();
        expect([text.slice(0, from), text.slice(from, to), text.slice(to)]).toEqual([
          "X ",
          " ",
          " X",
        ]);
      }
    },
  );
});

it("restores same-position deletions in their original order from testTdf107292", /** Ports the original paragraph assertion after saved deletes are shown. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${fixtures}/tdf107292.odt`)),
    metadata,
  );
  await roundTrip(
    document,
    /** Checks tracked ranges created at adjacent character offsets. @param model - Imported Writer model. @returns Nothing. */ (
      model,
    ) => {
      const ranges = model.GetIDocumentRedlineAccess().GetRedlineTable().entries();
      expect(ranges).toHaveLength(3);
      expect(model.paragraphs[0]?.GetText()).toBe("Lorem ipsum dolor sit...");
      expect(
        ranges.map(
          /** Reads both content offsets of a native redline for comparison. @param range - Native redline range. @returns Start and end offsets. */ (
            range,
          ) => [range.Start().GetContentIndex(), range.End().GetContentIndex()],
        ),
      ).toEqual([
        [0, 6],
        [6, 11],
        [11, 18],
      ]);
    },
  );
});

it.each([
  ["format-char-style-change.odt", false],
  ["format-charstyle-direct.odt", true],
] as const)(
  "preserves the previous character format from %s",
  /** Ports the original named and direct format redline fixture assertions. @param fixture - Original package. @param withSize - Whether the direct font sizes are present. @returns Completion. */
  async (fixture, withSize) => {
    const bytes = new Uint8Array(
      readFileSync(`../../vendor/libreoffice-reference/sw/qa/filter/xml/data/${fixture}`),
    );
    const { document } = await readOdtDocument(bytes, metadata);
    const saved = await roundTrip(
      document,
      /** Verifies the imported redline table and change metadata. @param model - Imported Writer model. @returns Nothing. */ (
        model,
      ) => {
        const table = model.GetIDocumentRedlineAccess().GetRedlineTable().entries();
        expect(table).toHaveLength(1);
        const range = table[0];
        assert(range);
        expect(range.GetRedlineData().GetType()).toBe(RedlineType.Format);
        const old = range.GetExtraData()?.GetItemSet();
        assert(old);
        const named = old.GetItemIfSet(RES_TXTATR_CHARFMT, false);
        assert(named instanceof SwFormatCharFormat);
        expect(named.GetCharFormat()?.GetName()).toBe("Strong Emphasis");
        const start = range.Start();
        const node = start.GetNode().GetTextNode();
        assert(node);
        const current = effectiveItem(node, start.GetContentIndex(), RES_TXTATR_CHARFMT);
        assert(current instanceof SwFormatCharFormat);
        expect(current.GetCharFormat()?.GetName()).toBe("Quote Char");
        if (withSize) {
          const oldHeight = old.GetItemIfSet(RES_CHRATR_FONTSIZE, false);
          const currentHeight = effectiveItem(node, start.GetContentIndex(), RES_CHRATR_FONTSIZE);
          assert(
            oldHeight instanceof SvxFontHeightItem && currentHeight instanceof SvxFontHeightItem,
          );
          expect(oldHeight.GetHeight()).toBe(480);
          expect(currentHeight.GetHeight()).toBe(720);
        }
      },
    );
    expect(saved).toContain("<text:format-change loext:style-name=");
  },
);

it("keeps the structural tracked table from testTdf132911", /** Ports the original table admission and verifies both connected boundary nodes. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf132911.odt"),
  );
  const { document } = await readOdtDocument(bytes, metadata);
  const saved = await roundTrip(
    document,
    /** Checks that structural tracked changes point to the imported table nodes. @param model - Imported Writer model. @returns Nothing. */ (
      model,
    ) => {
      const nodes = model.GetNodes();
      const body = nodes.GetSectionBlocks(nodes.GetEndOfContent().StartOfSectionNode());
      const tables = body.filter(
        /** Finds the table node among the document body's section blocks. @param node - Writer body node. @returns Whether the node is a Writer table. */ (
          node,
        ) => node instanceof SwTableNode,
      );
      expect(tables).toHaveLength(1);
      const [table] = tables;
      assert(table);
      const change = model
        .GetIDocumentRedlineAccess()
        .GetRedlineTable()
        .entries()
        .find(
          /** Finds the native redline that starts on the selected table node. @param range - Native redline. @returns Whether the range starts on the table. */ (
            range,
          ) => range.Start().GetNode() === table,
        );
      assert(change);
      expect(change.End().GetNode().GetIndex()).toBe(table.EndOfSectionNode().GetIndex() + 1);
      expect(change.End().GetContentIndex()).toBe(0);
    },
  );
  expect(saved).toMatch(
    /<text:change-start text:change-id="([^"]+)"\/><table:table [\s\S]*?<\/table:table><text:p[^>]*><text:change-end text:change-id="\1"\/>/u,
  );
});

it("retains the protected section in testSectionProtection2", /** Ports the ODT import assertion despite the source region without a closing marker. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/sectionprot2.odt",
    ),
  );
  const { document } = await readOdtDocument(bytes, metadata);
  await roundTrip(
    document,
    /** Checks that import restores the section owners of the tracked ranges. @param model - Imported Writer model. @returns Nothing. */ (
      model,
    ) => {
      const sections = model
        .GetNodes()
        .entries()
        .filter(
          /** Selects section nodes that own themselves. @param node - Writer document node. @returns Whether this is the section owner. */ (
            node,
          ) => node.GetSectionNode() === node,
        );
      expect(sections[0]?.GetSectionNode()?.GetSection().IsProtect()).toBe(true);
    },
  );
});

it("restores the original visible deletion when ODT export is cancelled", /** Verifies the live positions and flags while the pinned source deletion moves to and from its saved section. @returns Nothing. */ () => {
  const fixture = readFileSync(`${fixtures}/midnight_redline.fodt`, "utf8");
  const content = fixture.replaceAll("office:document", "office:document-content");
  const { document } = importWriterXml(undefined, content, metadata);
  const paragraph = document.paragraphs[0];
  assert(paragraph);
  const position = new SwPosition(paragraph, 4);
  const access = document.GetIDocumentRedlineAccess();
  const flags = access.GetRedlineFlags();
  const undo = document.GetUndoManager().DoesUndo();
  let cancelled = false;
  try {
    expect(
      /** Exports with a cancellation callback to exercise persistent redline handling. @returns ODT export completion. */ () =>
        writeOdtXml(document, metadata, {
          isCancelled:
            /** Supplies the current cancellation flag to the import control. @returns Whether parsing should be cancelled. */ () =>
              cancelled,
          /** Cancels once the exporter has entered the temporary native visibility state. @param stage - Filter stage. @returns Nothing. */
          onProgress(stage) {
            if (stage !== "styles") return;
            expect(paragraph.GetText()).toBe("");
            const deleted = access.GetRedlineTable().entries()[0]?.GetContentStart();
            expect(
              deleted
                ?.GetNodes()
                .at(deleted.GetIndex() + 1)
                .GetTextNode()
                ?.GetText(),
            ).toBe("Deleted text");
            cancelled = true;
          },
        }),
    ).toThrow("ODT operation was cancelled.");
    expect(access.GetRedlineFlags()).toBe(flags);
    expect(document.GetUndoManager().DoesUndo()).toBe(undo);
    expect(paragraph.GetText()).toBe("Deleted text");
    expect(position.GetNode() === paragraph).toBe(true);
    expect(position.GetContentIndex()).toBe(4);
    expect(access.GetRedlineTable().entries()[0]?.GetContentStart()).toBeUndefined();
  } finally {
    position.Dispose();
    document.Dispose();
  }
});
