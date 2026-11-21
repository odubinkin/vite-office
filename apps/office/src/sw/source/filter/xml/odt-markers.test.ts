/** @fileoverview Checks canonical Writer mark positions, Worker transfer and ODT marker export. */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocumentArchiveWriter } from "../../../../package/source/zippackage/document-archive";
import { createWriterDocument } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";

const metadata = { title: "Inline positions" };
const fixtures = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";

/** Replaces content.xml while preserving the bounded ODT package. @param source - Original bytes. @param transform - XML mutation. @returns Candidate package. */
async function withContent(
  source: Uint8Array,
  transform: (xml: string) => string,
): Promise<Uint8Array> {
  const input = await DocumentArchive.open(source);
  const output = new DocumentArchiveWriter();
  for (const name of input.getEntryNames())
    output.putNextEntry(
      name,
      name === "content.xml"
        ? new TextEncoder().encode(transform(await input.readTextEntry(name)))
        : await input.readEntry(name),
    );
  return await output.finish();
}

describe("Writer inline marker positions", /** Groups mark and pagination hint tests. @returns Nothing. */ () => {
  it("keeps named and soft positions through edits, structural split, transfer and ODT reimport", /** Verifies live SwContentIndex ownership and symmetric persistence. @returns Completion. */ async () => {
    const document = createWriterDocument();
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paragraph is missing.");
    paragraph.InsertText("abcdef", 0);
    paragraph.SetHyperlink(1, 5, {
      url: "https://example.test",
      visitedStyleName: "Visited_20_Internet_20_Link",
    });
    const marks = document.GetIDocumentMarkAccess();
    marks.MakeMark(paragraph, 2, "inside-link");
    marks.AddSoftPageBreak(paragraph, 4);
    paragraph.InsertText("X", 0);
    expect(marks.FindMark("inside-link")?.GetMarkPos().GetContentIndex()).toBe(3);
    expect(marks.GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(5);
    paragraph.EraseText(0, 1);
    expect(marks.FindMark("inside-link")?.GetMarkPos().GetContentIndex()).toBe(2);
    const trailing = document
      .GetDocumentContentOperationsManager()
      .SplitNode(new SwPosition(paragraph, 1));
    expect(marks.FindMark("inside-link")?.GetMarkPos().GetNode()).toBe(trailing);
    expect(marks.FindMark("inside-link")?.GetMarkPos().GetContentIndex()).toBe(1);
    expect(marks.GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(3);
    const transferred = decodeWriterDocument(encodeWriterDocument(document));
    expect(
      transferred.GetIDocumentMarkAccess().FindMark("inside-link")?.GetMarkPos().GetContentIndex(),
    ).toBe(1);
    expect(transferred.GetIDocumentMarkAccess().GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(3);
    const bytes = await writeOdtDocument(transferred, metadata);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain('<text:bookmark text:name="inside-link"/>');
    expect(xml).toContain("<text:soft-page-break/>");
    expect(xml).toContain('text:visited-style-name="Visited_20_Internet_20_Link"');
    const reopened = await readOdtDocument(bytes, metadata, undefined, {
      onDiagnostic: /** Ignores unrelated diagnostics. @returns Nothing. */ () => undefined,
    });
    expect(encodeWriterDocument(reopened.document).bookmarks).toEqual(
      encodeWriterDocument(transferred).bookmarks,
    );
    expect(reopened.document.GetIDocumentMarkAccess().GetSoftPageBreaks()).toHaveLength(0);
  });

  it("validates model names and follows source recovery for incomplete ODF bookmarks", /** Checks native bookmark admission and pairing. @returns Completion. */ async () => {
    const document = createWriterDocument();
    const node = document.paragraphs[0];
    if (node === undefined) throw new Error("Writer paragraph is missing.");
    node.InsertText("x", 0);
    const marks = document.GetIDocumentMarkAccess();
    expect(
      /** Rejects a blank name. @returns Nothing. */ () => marks.MakeMark(node, 0, ""),
    ).toThrow("name is invalid");
    marks.MakeMark(node, 0, "valid");
    expect(marks.MakeMark(node, 0, "valid").GetName()).toBe("valid Copy 1");
    expect(marks.DeleteMark("valid Copy 1")).toBe(true);
    expect(
      /** Rejects a blank replacement. @returns Nothing. */ () => marks.RenameMark("valid", ""),
    ).toThrow("name is invalid");
    expect(marks.RenameMark("absent", "other")).toBe(false);
    expect(marks.RenameMark("valid", "valid")).toBe(false);
    marks.MakeMark(node, 0, "other");
    marks.MakeMark(node, 1, "later");
    expect(
      marks
        .GetBookmarks()
        .map(
          /** Reads sorted names. @param mark - Bookmark. @returns Name. */ (mark) =>
            mark.GetName(),
        ),
    ).toEqual(["valid", "other", "later"]);
    marks.AddSoftPageBreak(node, 1);
    marks.AddSoftPageBreak(node, 0);
    expect(
      marks
        .GetSoftPageBreaks()
        .map(
          /** Reads sorted offsets. @param position - Break. @returns Offset. */ (position) =>
            position.GetContentIndex(),
        ),
    ).toEqual([0, 1]);
    expect(
      /** Rejects a duplicate rename. @returns Nothing. */ () => marks.RenameMark("valid", "other"),
    ).toThrow("already exists");
    expect(marks.DeleteMark("absent")).toBe(false);
    expect(marks.DeleteMark("other")).toBe(true);
    expect(marks.DeleteMark("later")).toBe(true);
    const foreign = createWriterDocument().paragraphs[0];
    if (foreign === undefined) throw new Error("Foreign paragraph is missing.");
    expect(
      /** Rejects a foreign node. @returns Nothing. */ () => marks.MakeMark(foreign, 0, "foreign"),
    ).toThrow("another document");
    const detached = new SwTextNode(document.nodes, node.StartOfSectionNode());
    expect(
      /** Rejects a detached node. @returns Nothing. */ () => marks.AddSoftPageBreak(detached, 0),
    ).toThrow("another document");
    const base = await writeOdtDocument(createWriterDocument(), metadata);
    const candidate = await withContent(
      base,
      /** Removes a required name. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark/>',
        ),
    );
    const unnamed = (await readOdtDocument(candidate, metadata)).document;
    expect(unnamed.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
    unnamed.Dispose();
    const ranged = await withContent(
      base,
      /** Inserts a ranged mark. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="wide"/>text<text:bookmark-end text:name="wide"/>',
        ),
    );
    const rangedDocument = (await readOdtDocument(ranged, metadata)).document;
    try {
      const mark = rangedDocument.GetIDocumentMarkAccess().FindMark("wide");
      expect(mark?.IsExpanded()).toBe(true);
      expect(mark?.GetMarkStart().GetContentIndex()).toBe(0);
      expect(mark?.GetMarkEnd().GetContentIndex()).toBe(4);
    } finally {
      rangedDocument.Dispose();
    }
    const strayEnd = await withContent(
      base,
      /** Inserts an unmatched end. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-end text:name="orphan"/>',
        ),
    );
    const unmatched = (await readOdtDocument(strayEnd, metadata)).document;
    expect(unmatched.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
    unmatched.Dispose();
    const doubleStart = await withContent(
      base,
      /** Inserts duplicate starts. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="pair"/>a<text:bookmark-start text:name="pair"/>b<text:bookmark-end text:name="pair"/>',
        ),
    );
    const latest = (await readOdtDocument(doubleStart, metadata)).document;
    const latestMark = latest.GetIDocumentMarkAccess().FindMark("pair");
    expect(latestMark?.GetMarkStart().GetContentIndex()).toBe(1);
    expect(latestMark?.GetMarkEnd().GetContentIndex()).toBe(2);
    latest.Dispose();
    const collapsedPair = await withContent(
      base,
      /** Inserts a collapsed start/end pair. @param xml - ODF content. @returns Modified content. */ (
        xml,
      ) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="pair"/><text:bookmark-end text:name="pair"/>',
        ),
    );
    expect(
      (await readOdtDocument(collapsedPair, metadata)).document
        .GetIDocumentMarkAccess()
        .FindMark("pair"),
    ).toBeDefined();
    const unclosed = await withContent(
      base,
      /** Inserts an unclosed start. @param xml - ODF content. @returns Modified content. */ (
        xml,
      ) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="pair"/>',
        ),
    );
    const unfinished = (await readOdtDocument(unclosed, metadata)).document;
    expect(unfinished.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
    unfinished.Dispose();
    const snapshot = encodeWriterDocument(document);
    expect(
      decodeWriterDocument({ ...snapshot, bookmarks: undefined })
        .GetIDocumentMarkAccess()
        .GetBookmarks(),
    ).toHaveLength(0);
    expect(
      /** Rejects a malformed mark array. @returns Nothing. */ () =>
        decodeWriterDocument({ ...snapshot, bookmarks: {} as never }),
    ).toThrow("bookmarks are invalid");
    expect(
      /** Rejects a missing node position. @returns Nothing. */ () =>
        decodeWriterDocument({
          ...snapshot,
          bookmarks: [{ name: "valid", nodeIndex: 99, offset: 0 }],
        }),
    ).toThrow("bookmark position");
  });
});

it("preserves testTdf159438 bookmark order at a shared position", /** Replays the pinned flat XML paragraph through package export and reopen. @returns Completion. */ async () => {
  const xml = readFileSync(`${fixtures}/bookmark_order.fodt`, "utf8").replace(
    /(<\/?office:document)(?=[\s>])/gu,
    "$1-content",
  );
  const document = importWriterXml(undefined, xml, metadata).document;
  let reopened: ReturnType<typeof createWriterDocument> | undefined;
  try {
    const bytes = await writeOdtDocument(document, metadata);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const paragraph = dom.getElementsByTagNameNS(ODF_NAMESPACES.text, "p")[0];
    expect(paragraph?.textContent).toBe("foobar");
    expect(
      [...(paragraph?.children ?? [])].map(
        /** Reads the native portion kind and name from the saved paragraph. @param marker - Output marker. @returns Marker tuple. */
        (marker) => [marker.localName, marker.getAttributeNS(ODF_NAMESPACES.text, "name")],
      ),
    ).toEqual([
      ["bookmark-start", "bookmark1"],
      ["bookmark-end", "bookmark1"],
      ["bookmark", "bookmark2"],
      ["bookmark-start", "bookmark3"],
      ["bookmark-end", "bookmark3"],
    ]);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    const marks = reopened.GetIDocumentMarkAccess();
    expect(marks.FindMark("bookmark1")?.GetMarkEnd().GetContentIndex()).toBe(3);
    expect(marks.FindMark("bookmark2")?.IsExpanded()).toBe(false);
    expect(marks.FindMark("bookmark3")?.GetMarkStart().GetContentIndex()).toBe(3);
    expect(marks.FindMark("bookmark3")?.GetMarkEnd().GetContentIndex()).toBe(6);
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it.each(["tdf101856", "tdf101856_overlapped"])(
  "preserves the represented hidden bookmark properties from %s",
  /** Replays the original ODF fixture through Worker state and package export. @param fixture - Original fixture stem. @returns Completion. */
  async (fixture) => {
    const bytes = new Uint8Array(readFileSync(`${fixtures}/${fixture}.odt`));
    const { document } = await readOdtDocument(bytes, metadata);
    const transferred = decodeWriterDocument(encodeWriterDocument(document));
    let reopened: ReturnType<typeof createWriterDocument> | undefined;
    try {
      const exported = await writeOdtDocument(transferred, metadata);
      reopened = (await readOdtDocument(exported, metadata)).document;
      for (const model of [document, transferred, reopened]) {
        const marks = model.GetIDocumentMarkAccess();
        expect(marks.FindMark("BookmarkHidden")?.IsHidden()).toBe(true);
        expect(marks.FindMark("BookmarkHidden")?.GetHideCondition()).toBe("");
        if (fixture === "tdf101856_overlapped") {
          expect(marks.GetBookmarks()).toHaveLength(2);
          expect(marks.FindMark("BookmarkNonHidden")?.IsHidden()).toBe(false);
        } else {
          expect(marks.GetBookmarks()).toHaveLength(5);
          expect(marks.FindMark("BookmarkVisible")?.IsHidden()).toBe(false);
          expect(marks.FindMark("BookmarkVisibleWithCondition")?.IsHidden()).toBe(true);
          expect(marks.FindMark("BookmarkVisibleWithCondition")?.GetHideCondition()).toBe("0==1");
          expect(marks.FindMark("BookmarkHiddenWithCondition")?.GetHideCondition()).toBe("1==1");
        }
      }
      if (fixture === "tdf101856") {
        expect(
          transferred
            .GetIDocumentMarkAccess()
            .FindMark("BookmarkNotHiddenWithCondition")
            ?.GetHideCondition(),
        ).toBe("1==1");
        expect(
          reopened
            .GetIDocumentMarkAccess()
            .FindMark("BookmarkNotHiddenWithCondition")
            ?.GetHideCondition(),
        ).toBe("");
      }
    } finally {
      reopened?.Dispose();
      transferred.Dispose();
      document.Dispose();
    }
  },
);

it("exports a collapsed bookmark around a character-anchored frame", /** Applies the source two-pass bookmark behavior to a represented text frame. @returns Completion. */ async () => {
  const xml = `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:draw="${ODF_NAMESPACES.draw}" xmlns:svg="${ODF_NAMESPACES.svg}">
  <office:body><office:text><text:p><text:bookmark-start text:name="cross-story"/><text:bookmark text:name="around"/><draw:frame draw:name="Fly" text:anchor-type="char" svg:width="1in" svg:height="1in"><draw:text-box><text:p><text:bookmark-end text:name="cross-story"/>frame</text:p></draw:text-box></draw:frame>outside<text:bookmark-end text:name="cross-story"/></text:p></office:text></office:body></office:document-content>`;
  const document = importWriterXml(undefined, xml, metadata).document;
  let reopened: ReturnType<typeof createWriterDocument> | undefined;
  try {
    const marks = document.GetIDocumentMarkAccess();
    expect(marks.FindMark("cross-story")).toBeUndefined();
    expect(marks.FindMark("around")?.IsExpanded()).toBe(false);
    const bytes = await writeOdtDocument(document, metadata);
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const dom = new DOMParser().parseFromString(content, "application/xml");
    const paragraph = dom.getElementsByTagNameNS(ODF_NAMESPACES.text, "p")[0];
    expect(
      [...(paragraph?.children ?? [])].map(
        /** Reads the paragraph marker order. @param child - Child element. @returns Local name. */
        (child) => child.localName,
      ),
    ).toEqual(["bookmark-start", "frame", "bookmark-end"]);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    expect(reopened.GetIDocumentMarkAccess().FindMark("around")?.IsExpanded()).toBe(false);
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});
