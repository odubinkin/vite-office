/** @fileoverview Checks canonical Writer mark positions, Worker transfer and ODT marker export. */

import { describe, expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Inline positions" };

/** Replaces content.xml while preserving the bounded ODT package. @param source - Original bytes. @param transform - XML mutation. @returns Candidate package. */
async function withContent(
  source: Uint8Array,
  transform: (xml: string) => string,
): Promise<Uint8Array> {
  const input = new ZipFile(source);
  const output = new ZipOutputStream();
  for (const name of input.getEntryNames())
    output.putNextEntry(
      name,
      name === "content.xml"
        ? new TextEncoder().encode(transform(await input.readTextEntry(name)))
        : await input.readEntry(name),
    );
  return output.finish();
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
    expect(marks.FindMark("inside-link")?.GetPosition().GetContentIndex()).toBe(3);
    expect(marks.GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(5);
    paragraph.EraseText(0, 1);
    expect(marks.FindMark("inside-link")?.GetPosition().GetContentIndex()).toBe(2);
    const trailing = document
      .GetDocumentContentOperationsManager()
      .SplitNode(new SwPosition(paragraph, 1));
    expect(marks.FindMark("inside-link")?.GetPosition().GetNode()).toBe(trailing);
    expect(marks.FindMark("inside-link")?.GetPosition().GetContentIndex()).toBe(1);
    expect(marks.GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(3);
    const transferred = decodeWriterDocument(encodeWriterDocument(document));
    expect(
      transferred.GetIDocumentMarkAccess().FindMark("inside-link")?.GetPosition().GetContentIndex(),
    ).toBe(1);
    expect(transferred.GetIDocumentMarkAccess().GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(3);
    const bytes = writeOdtDocument(transferred, metadata);
    const xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml).toContain('<text:bookmark text:name="inside-link"/>');
    expect(xml).toContain("<text:soft-page-break/>");
    expect(xml).toContain('text:visited-style-name="Visited_20_Internet_20_Link"');
    const reopened = await readOdtDocument(bytes, metadata, undefined, {
      onDiagnostic: /** Ignores unrelated diagnostics. @returns Nothing. */ () => undefined,
    });
    expect(encodeWriterDocument(reopened.document).bookmarks).toEqual(
      encodeWriterDocument(transferred).bookmarks,
    );
    expect(
      encodeWriterDocument(reopened.document).textNodes.map(
        /** Selects encoded soft breaks. @param node - Text node. @returns Soft breaks. */ (node) =>
          node.softPageBreaks,
      ),
    ).toEqual(
      encodeWriterDocument(transferred).textNodes.map(
        /** Selects encoded soft breaks. @param node - Text node. @returns Soft breaks. */ (node) =>
          node.softPageBreaks,
      ),
    );
  });

  it("validates names, duplicate positions and malformed or unsupported ODF markers", /** Retains explicit failures for semantic marker loss. @returns Completion. */ async () => {
    const document = createWriterDocument();
    const node = document.paragraphs[0];
    if (node === undefined) throw new Error("Writer paragraph is missing.");
    node.InsertText("x", 0);
    const marks = document.GetIDocumentMarkAccess();
    expect(
      /** Rejects a blank name. @returns Nothing. */ () => marks.MakeMark(node, 0, " "),
    ).toThrow("name is invalid");
    marks.MakeMark(node, 0, "valid");
    expect(
      /** Rejects a duplicate name. @returns Nothing. */ () => marks.MakeMark(node, 0, "valid"),
    ).toThrow("already exists");
    expect(
      /** Rejects a blank replacement. @returns Nothing. */ () => marks.RenameMark("valid", " "),
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
    const base = writeOdtDocument(createWriterDocument(), metadata);
    const candidate = await withContent(
      base,
      /** Removes a required name. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark/>',
        ),
    );
    await expect(
      readOdtDocument(candidate, metadata, undefined, {
        onDiagnostic: /** Ignores unrelated diagnostics. @returns Nothing. */ () => undefined,
      }),
    ).rejects.toThrow("requires text:name");
    const ranged = await withContent(
      base,
      /** Inserts a ranged mark. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="wide"/>text<text:bookmark-end text:name="wide"/>',
        ),
    );
    await expect(
      readOdtDocument(ranged, metadata, undefined, {
        onDiagnostic: /** Ignores unrelated diagnostics. @returns Nothing. */ () => undefined,
      }),
    ).rejects.toThrow("ranged bookmarks are unsupported");
    const strayEnd = await withContent(
      base,
      /** Inserts an unmatched end. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-end text:name="orphan"/>',
        ),
    );
    await expect(readOdtDocument(strayEnd, metadata)).rejects.toThrow("has no start");
    const doubleStart = await withContent(
      base,
      /** Inserts duplicate starts. @param xml - ODF content. @returns Modified content. */ (xml) =>
        xml.replace(
          '<text:p text:style-name="Standard">',
          '<text:p text:style-name="Standard"><text:bookmark-start text:name="pair"/><text:bookmark-start text:name="pair"/>',
        ),
    );
    await expect(readOdtDocument(doubleStart, metadata)).rejects.toThrow("start is duplicated");
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
    await expect(readOdtDocument(unclosed, metadata)).rejects.toThrow("has no end");
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
