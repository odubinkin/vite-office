/** @fileoverview Verifies the LibreOffice-shaped Writer node graph, model positions, selections, hints, and content-operation ownership. */

import { describe, expect, it } from "vitest";
import {
  decodeSwFormatINetFormat as restoreSwFormatINetFormat,
  encodeSfxPoolItem,
} from "../../filter/basflt/item-codec";
import {
  decodeWriterDocument as normalizeWriterParagraphFormatting,
  encodeWriterDocument as serializeWriterDocument,
} from "../../filter/basflt/writer-document-codec";

import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/poolitem";
import {
  RES_CHRATR_WEIGHT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import { createWriterDocument, SwDoc, type SwDoc as WriterDocument } from "./doc";
import { SwContentNode, SwEndNode, SwNode, SwStartNode } from "../docnode/node";
import { SwNodeIndex, SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { createWriterTextFragment, projectWriterTextRuns } from "../txtnode/text-run-projection";
import { SwpHints } from "../txtnode/ndhints";
import { applyWriterParagraphList, projectWriterParagraphList } from "./list";
import {
  createSwFormatAutoFormat,
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
  RES_TXTATR_AUTOFMT,
  SwFormatAutoFormat,
  SwTextAttr,
  type WriterCharacterAttributes,
} from "../txtnode/txatbase";
import {
  equalWriterHyperlinks,
  normalizeWriterHyperlink,
  SwFormatINetFormat,
} from "../txtnode/fmtinfmt";

const bold: WriterCharacterAttributes = { bold: true, italic: false, underline: false };
const italic: WriterCharacterAttributes = { bold: false, italic: true, underline: false };
const plain: WriterCharacterAttributes = { bold: false, italic: false, underline: false };

/** Creates one canonical Writer graph for low-level model tests. @param id - Browser document identity. @returns Canonical Writer fixture. */
function createModelFixture(id = "model-a"): WriterDocument {
  void id;
  return createWriterDocument();
}

/** Appends a text node only while constructing a low-level model fixture. @param writer - Fixture graph. @param id - Test node identity. @returns The same graph. */
function appendFixtureParagraph(writer: WriterDocument, id: string): WriterDocument {
  void id;
  writer.nodes.MakeTextNode();
  return writer;
}

/** Returns a function that evaluates the supplied operation for an error assertion. @param operation - Deferred operation. @returns The same deferred operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

/** Minimal non-text content node used to verify content-operation type guards. */
class TestContentNode extends SwContentNode {
  /** Creates a test-only content node owned by the supplied section. @param document - Owning document. @returns Nothing. */
  public constructor(document: WriterDocument) {
    super(document.nodes, document.nodes.GetEndOfContent().StartOfSectionNode());
  }

  /** Returns the test content length. @returns Zero. */
  public Len(): number {
    return 0;
  }
}

/** Test-only detached node used to exercise section and connectivity guards. */
class DetachedNode extends SwNode {
  /** Creates a node with no section link and without inserting it into SwNodes. @param document - Document whose array owns the detached identity. @returns Nothing. */
  public constructor(document: WriterDocument) {
    super(document.nodes, "text");
  }
}

describe("Writer SwNodes graph" /** Groups node ownership and fixed-section tests. @returns Nothing; Vitest registers cases. */, function defineSwNodesTests(): void {
  it("creates the fixed Writer sections and tracks node indices through structural changes" /** Verifies the pinned SwNodes constructor ordering and object-identity indices. @returns Nothing; assertions inspect the graph. */, function createsFixedSections(): void {
    const writer = appendFixtureParagraph(createModelFixture(), "p-2");
    const nodes = writer.GetNodes();
    expect(nodes.GetDoc()).toBe(writer);
    expect(nodes.Count()).toBe(12);
    expect(nodes.GetEndOfPostIts().GetIndex()).toBe(1);
    expect(nodes.GetEndOfInserts().GetIndex()).toBe(3);
    expect(nodes.GetEndOfAutotext().GetIndex()).toBe(5);
    expect(nodes.GetEndOfRedlines().GetIndex()).toBe(7);
    expect(nodes.GetEndOfExtras()).toBe(nodes.GetEndOfRedlines());
    expect(nodes.GetEndOfContent().GetIndex()).toBe(11);
    expect(nodes.at(0)).toBeInstanceOf(SwStartNode);
    expect(nodes.at(1)).toBeInstanceOf(SwEndNode);
    expect(nodes.at(0).IsStartNode()).toBe(true);
    expect(nodes.at(0).StartOfSectionNode()).toBe(nodes.at(0));
    expect(nodes.at(1).IsEndNode()).toBe(true);
    expect(nodes.at(8).IsTextNode()).toBe(false);
    expect(nodes.at(9).IsTextNode()).toBe(true);
    expect(nodes.at(9).GetNodeType()).toBe("text");
    expect(nodes.at(9).GetNodes()).toBe(nodes);
    expect(nodes.at(9).GetDoc()).toBe(writer);
    const contentStart = nodes.GetEndOfContent().StartOfSectionNode();
    expect(contentStart.EndOfSectionNode()).toBe(nodes.GetEndOfContent());
    expect(contentStart.StartOfSectionNode()).toBe(nodes.at(0));
    expect(nodes.entries()).toHaveLength(12);
    const tracked = new SwNodeIndex(nodes, 10);
    expect(tracked.GetNode()).toBe(writer.paragraphs[1]);
    nodes.moveTextNode(writer.paragraphs[1] as SwTextNode, -1);
    expect(tracked.GetIndex()).toBe(9);
    tracked.Assign(writer.paragraphs[1] as SwTextNode);
    expect(tracked.GetNode()).toBe(writer.paragraphs[1]);
    expect(
      throwing(/** Reads an absent node. @returns Missing node. */ () => nodes.at(99)),
    ).toThrow("Unknown SwNode index");
    const detached = new DetachedNode(writer);
    expect(
      throwing(
        /** Reads an absent section. @returns Missing section start. */ () =>
          detached.StartOfSectionNode(),
      ),
    ).toThrow("no section owner");
    expect(
      throwing(/** Indexes a detached node. @returns Missing offset. */ () => detached.GetIndex()),
    ).toThrow("disconnected");
    expect(
      throwing(
        /** Reads an unlinked section end. @returns Missing end sentinel. */ () =>
          new SwStartNode(nodes).EndOfSectionNode(),
      ),
    ).toThrow("no end sentinel");
  });

  it("guards node ownership, identity, and the non-empty body invariant" /** Exercises SwNodes rejection branches without weakening its graph invariants. @returns Nothing; assertions inspect deterministic failures. */, function guardsNodeMutations(): void {
    const writer = createModelFixture();
    const other = createModelFixture("model-b");
    const node = writer.paragraphs[0] as SwTextNode;
    const foreign = other.paragraphs[0] as SwTextNode;
    const prepared = new SwTextNode(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    writer.nodes.insertTextNodeAfter(node, prepared);
    expect(writer.paragraphs[1]).toBe(prepared);
    const duplicate = new SwTextNode(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    const uninserted = new SwTextNode(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    writer.nodes.insertTextNodeAfter(node, duplicate);
    expect(writer.paragraphs[1]).toBe(duplicate);
    expect(
      throwing(
        /** Inserts after a foreign node. @returns Nothing. */ () =>
          writer.nodes.insertTextNodeAfter(foreign, prepared),
      ),
    ).toThrow("another SwNodes");
    expect(
      throwing(
        /** Removes a foreign node. @returns Nothing. */ () => writer.nodes.removeTextNode(foreign),
      ),
    ).toThrow("another SwNodes");
    expect(
      throwing(
        /** Removes a same-document node not present in body content. @returns Nothing. */ () =>
          writer.nodes.removeTextNode(uninserted),
      ),
    ).toThrow("not body content");
    expect(
      throwing(
        /** Replaces a node with a foreign candidate. @returns Nothing. */ () =>
          writer.nodes.replaceTextNode(node, foreign),
      ),
    ).toThrow("another SwNodes");
    expect(
      throwing(
        /** Replaces a node with a candidate already in the body. @returns Nothing. */ () =>
          writer.nodes.replaceTextNode(node, duplicate),
      ),
    ).toThrow("already belongs to body content");
    expect(
      throwing(
        /** Moves a foreign node. @returns Nothing. */ () => writer.nodes.moveTextNode(foreign, 1),
      ),
    ).toThrow("another SwNodes");
    writer.nodes.removeTextNode(prepared);
    writer.nodes.removeTextNode(duplicate);
    expect(
      throwing(
        /** Removes the final body node. @returns Nothing. */ () =>
          writer.nodes.removeTextNode(node),
      ),
    ).toThrow("retain one paragraph");
    expect(
      throwing(
        /** Moves beyond the body boundary. @returns Nothing. */ () =>
          writer.nodes.moveTextNode(node, -1),
      ),
    ).toThrow("document boundary");
  });
});

describe("Writer SwPosition and SwPaM" /** Groups model cursor and range-direction tests. @returns Nothing; Vitest registers cases. */, function definePositionTests(): void {
  it("orders point and mark while preserving selection direction" /** Verifies node indices, content bounds, cloning, and SwPaM endpoint semantics. @returns Nothing; assertions inspect positions. */, function ordersPositions(): void {
    const writer = appendFixtureParagraph(createModelFixture(), "p-2");
    const first = writer.paragraphs[0] as SwTextNode;
    const second = writer.paragraphs[1] as SwTextNode;
    first.InsertText("first", 0);
    second.InsertText("second", 0);
    const start = new SwPosition(first, 2);
    const end = new SwPosition(second, 3);
    expect(start.GetNodeIndex()).toBeLessThan(end.GetNodeIndex());
    expect(start.GetNode()).toBe(first);
    expect(start.GetContentIndex()).toBe(2);
    start.SetContent(4);
    expect(start.clone()).not.toBe(start);
    expect(start.compare(end)).toBeLessThan(0);
    const forward = new SwPaM(end, start);
    expect(forward.HasMark()).toBe(true);
    expect(forward.GetPoint().GetNode()).toBe(second);
    expect(forward.GetMark().GetNode()).toBe(first);
    expect(forward.Start().GetNode()).toBe(first);
    expect(forward.End().GetNode()).toBe(second);
    const backward = new SwPaM(start, end);
    expect(backward.Start().GetNode()).toBe(first);
    expect(backward.End().GetNode()).toBe(second);
    const collapsed = new SwPaM(start);
    expect(collapsed.HasMark()).toBe(false);
    expect(collapsed.GetMark()).toBe(collapsed.GetPoint());
    collapsed.SetMark();
    expect(collapsed.HasMark()).toBe(true);
    collapsed.DeleteMark();
    expect(collapsed.HasMark()).toBe(false);
    collapsed.Assign(end, start);
    expect(collapsed.GetPoint().GetNode()).toBe(second);
    expect(collapsed.GetMark().GetNode()).toBe(first);
  });

  it("rejects invalid content offsets and cross-document selections" /** Verifies position and PaM ownership guards. @returns Nothing; assertions inspect deterministic errors. */, function rejectsInvalidPositions(): void {
    const writer = createModelFixture();
    const other = createModelFixture("model-b");
    const node = writer.paragraphs[0] as SwTextNode;
    node.InsertText("abc", 0);
    expect(
      throwing(
        /** Creates a negative position. @returns Invalid position. */ () =>
          new SwPosition(node, -1),
      ),
    ).toThrow("outside its node");
    expect(
      throwing(
        /** Creates a fractional position. @returns Invalid position. */ () =>
          new SwPosition(node, 1.5),
      ),
    ).toThrow("outside its node");
    expect(
      throwing(
        /** Creates a position after content. @returns Invalid position. */ () =>
          new SwPosition(node, 4),
      ),
    ).toThrow("outside its node");
    const position = new SwPosition(node, 0);
    expect(
      throwing(/** Sets a negative offset. @returns Nothing. */ () => position.SetContent(-1)),
    ).toThrow("outside its node");
    expect(
      throwing(/** Sets an offset after content. @returns Nothing. */ () => position.SetContent(4)),
    ).toThrow("outside its node");
    expect(
      throwing(
        /** Combines positions from two documents. @returns Invalid range. */ () =>
          new SwPaM(position, new SwPosition(other.paragraphs[0] as SwTextNode, 0)),
      ),
    ).toThrow("different documents");
    const persistent = new SwPaM(position);
    expect(
      throwing(
        /** Reassigns a persistent PaM across document ownership. @returns Nothing. */ () =>
          persistent.Assign(position, new SwPosition(other.paragraphs[0] as SwTextNode, 0)),
      ),
    ).toThrow("different documents");
  });
});

describe("Writer SwTextAttr and SwpHints" /** Groups direct-format range storage tests. @returns Nothing; Vitest registers cases. */, function defineHintTests(): void {
  it("owns, normalizes, compares, and restores hyperlink pool items", /** Covers the bounded SwFormatINetFormat value and snapshot contract. @returns Nothing. */ function managesHyperlinkItems(): void {
    const hyperlink = {
      name: "named",
      styleName: "Internet_20_link",
      targetFrame: "_blank",
      url: "https://example.test/",
      visitedStyleName: "Visited_20_Internet_20_Link",
    };
    expect(normalizeWriterHyperlink(hyperlink)).toEqual(hyperlink);
    for (const value of [undefined, null, [], "link", {}, { url: "" }])
      expect(normalizeWriterHyperlink(value)).toBeUndefined();
    expect(
      normalizeWriterHyperlink({
        name: 1,
        styleName: "",
        targetFrame: null,
        url: "relative/path",
        visitedStyleName: false,
      }),
    ).toEqual({ url: "relative/path" });
    expect(equalWriterHyperlinks(undefined, undefined)).toBe(true);
    expect(equalWriterHyperlinks(hyperlink, { ...hyperlink })).toBe(true);
    for (const changed of [
      { ...hyperlink, url: "changed" },
      { ...hyperlink, name: "changed" },
      { ...hyperlink, targetFrame: "_self" },
      { ...hyperlink, styleName: "changed" },
      { ...hyperlink, visitedStyleName: "changed" },
    ])
      expect(equalWriterHyperlinks(hyperlink, changed)).toBe(false);
    const item = new SwFormatINetFormat(hyperlink);
    expect(item.Which()).toBe(RES_TXTATR_INETFMT);
    expect(item.GetValue()).toBe(hyperlink.url);
    expect(item.GetHyperlink()).toEqual(hyperlink);
    expect(item.GetHyperlink()).not.toBe(hyperlink);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone().equals(item)).toBe(true);
    expect(item.equals(new SfxInt16Item(RES_TXTATR_INETFMT, 1))).toBe(false);
    expect(item.equals(new SwFormatINetFormat({ url: "different" }))).toBe(false);
    expect(restoreSwFormatINetFormat(encodeSfxPoolItem(item)).equals(item)).toBe(true);
    expect(
      throwing(
        /** Rejects an empty destination. @returns Invalid item. */ () =>
          new SwFormatINetFormat({ url: "" }),
      ),
    ).toThrow("must not be empty");
    for (const snapshot of [
      { value: "{}", which: 52 },
      { value: {}, which: RES_TXTATR_INETFMT },
      { value: "{", which: RES_TXTATR_INETFMT },
      { value: "{}", which: RES_TXTATR_INETFMT },
    ])
      expect(
        throwing(
          /** Restores an invalid hyperlink snapshot. @returns Invalid item. */ () =>
            restoreSwFormatINetFormat(
              snapshot as unknown as Parameters<typeof restoreSwFormatINetFormat>[0],
            ),
        ),
      ).toThrow("snapshot is invalid");
  });

  it("projects overlapping character formatting and hyperlink ranges", /** Verifies different Writer hint kinds coexist while same-kind hyperlinks merge and reject overlaps. @returns Nothing. */ function projectsHyperlinkHints(): void {
    const writer = createModelFixture();
    const pool = writer.GetAttrPool();
    const inherited = writer.GetDfltTextFormatColl().GetAttrSet();
    const hyperlink = { url: "https://example.test/" };
    const hints = new SwpHints(pool);
    hints.setTextRuns(
      [
        { attributes: plain, hyperlink, text: "a" },
        { attributes: bold, hyperlink, text: "b" },
      ],
      inherited,
    );
    expect(hints.Count()).toBe(2);
    expect(hints.toTextRuns("ab", inherited)).toEqual([
      { attributes: plain, hyperlink, text: "a" },
      { attributes: bold, hyperlink, text: "b" },
    ]);
    expect(hints.getHyperlink("ab", 0)).toEqual(hyperlink);
    expect(hints.getHyperlink("ab", 2)).toEqual(hyperlink);
    expect(hints.clone().toTextRuns("ab", inherited)).toEqual(hints.toTextRuns("ab", inherited));
    expect(new SwpHints(pool).getHyperlink("", 0)).toBeUndefined();
    expect(
      throwing(
        /** Reads a hyperlink outside the node. @returns Invalid hyperlink. */ () =>
          hints.getHyperlink("ab", 3),
      ),
    ).toThrow("outside the text node");
    expect(
      throwing(
        /** Creates overlapping hyperlink hints. @returns Invalid hint collection. */ () =>
          new SwpHints(pool, [
            new SwTextAttr(new SwFormatINetFormat(hyperlink), 0, 2),
            new SwTextAttr(new SwFormatINetFormat({ url: "different" }), 1, 3),
          ]),
      ),
    ).toThrow("Overlapping Writer");
  });

  it("sorts, merges, clones, serializes, and projects auto-format hints" /** Verifies the canonical range container independently from rendering. @returns Nothing; assertions inspect hints and runs. */, function managesHints(): void {
    const writer = createModelFixture();
    const pool = writer.GetAttrPool();
    const inherited = writer.GetDfltTextFormatColl().GetAttrSet();
    const first = new SwTextAttr(createSwFormatAutoFormat(pool, bold), 1, 3);
    expect(first.format.GetStyleHandle()).toBeInstanceOf(SfxItemSet);
    expect(first.format.Clone()).not.toBe(first.format);
    expect(first.format.Clone().equals(first.format)).toBe(true);
    expect(first.format.QueryValue()).toEqual([
      { value: 8, which: RES_CHRATR_WEIGHT },
      { value: 8, which: 26 },
      { value: 8, which: 31 },
    ]);
    expect(first.format.equals(createSwFormatAutoFormat(pool, italic))).toBe(false);
    expect(first.format.equals(new SfxInt16Item(RES_TXTATR_AUTOFMT, 1))).toBe(false);
    expect(
      throwing(
        /** Creates an auto-format item with another WhichId. @returns Invalid item. */ () =>
          new SwFormatAutoFormat(first.format.GetStyleHandle(), 52),
      ),
    ).toThrow("WhichId is invalid");
    expect(
      projectWriterCharacterAttributes(new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES)),
    ).toEqual(plain);
    first.dontExpand = true;
    first.dontExpandStart = true;
    first.dontMoveAttr = true;
    const second = new SwTextAttr(createSwFormatAutoFormat(pool, bold), 3, 5);
    const hints = new SwpHints(pool, [second, first]);
    expect(hints.Count()).toBe(1);
    expect(hints.Get(0).Which()).toBe(RES_TXTATR_AUTOFMT);
    expect(hints.Get(0).GetStart()).toBe(1);
    expect(hints.Get(0).GetEnd()).toBe(5);
    expect(hints.entries()).toHaveLength(1);
    expect(hints.toTextRuns("abcdef", inherited)).toEqual([
      { attributes: plain, text: "a" },
      { attributes: bold, text: "bcde" },
      { attributes: plain, text: "f" },
    ]);
    expect(hints.getCharacterAttributes("abcdef", 0, inherited)).toEqual(plain);
    expect(hints.getCharacterAttributes("abcdef", 3, inherited)).toEqual(bold);
    expect(hints.getCharacterAttributes("abcdef", 6, inherited)).toEqual(plain);
    const clone = hints.clone();
    expect(clone).not.toBe(hints);
    expect(clone.equals(hints)).toBe(true);
    expect(new SwpHints(pool).equals(hints)).toBe(false);
    expect(clone.toTextRuns("abcdef", inherited)).toEqual(hints.toTextRuns("abcdef", inherited));
    for (const [start, end] of [
      [0.5, 1],
      [0, 1.5],
      [-1, 1],
      [2, 1],
    ] as const)
      expect(
        throwing(
          /** Slices one invalid native hint range. @returns Invalid fragment. */ () =>
            hints.slice(start, end),
        ),
      ).toThrow("hint slice is invalid");
    const clonedHint = first.clone(2);
    expect(clonedHint).toMatchObject({ start: 3, end: 5 });
    expect(clonedHint.dontExpand).toBe(true);
    first.SetEnd(4);
    expect(first.GetEnd()).toBe(4);
    expect(
      throwing(/** Sets an end before start. @returns Nothing. */ () => first.SetEnd(0)),
    ).toThrow("end is invalid");
    expect(
      throwing(/** Reads an absent hint. @returns Missing hint. */ () => hints.Get(9)),
    ).toThrow("Unknown SwpHints position");
    expect(
      throwing(
        /** Creates a negative-start hint. @returns Invalid hint. */ () =>
          new SwTextAttr(createSwFormatAutoFormat(pool, bold), -1, 1),
      ),
    ).toThrow("range is invalid");
  });

  it("normalizes run and snapshot inputs while rejecting overlapping hints" /** Covers default gaps, malformed records, and overlap protection. @returns Nothing; assertions inspect normalized ranges. */, function normalizesHints(): void {
    const writer = createModelFixture();
    const pool = writer.GetAttrPool();
    const inherited = writer.GetDfltTextFormatColl().GetAttrSet();
    const hints = new SwpHints(pool);
    hints.setTextRuns(
      [
        { attributes: plain, text: "a" },
        { attributes: italic, text: "bc" },
        { attributes: italic, text: "" },
        { attributes: italic, text: "d" },
      ],
      inherited,
    );
    expect(hints.toTextRuns("abcd", inherited)).toEqual([
      { attributes: plain, text: "a" },
      { attributes: italic, text: "bcd" },
    ]);
    expect(new SwpHints(pool).toTextRuns("", inherited)).toEqual([]);
    expect(new SwpHints(pool).getCharacterAttributes("", 0, inherited)).toEqual(plain);
    expect(
      throwing(
        /** Reads attributes before text. @returns Invalid attributes. */ () =>
          hints.getCharacterAttributes("abcd", -1, inherited),
      ),
    ).toThrow("outside the text node");
    expect(
      throwing(
        /** Reads attributes after text. @returns Invalid attributes. */ () =>
          hints.getCharacterAttributes("abcd", 5, inherited),
      ),
    ).toThrow("outside the text node");
    const restored = hints.clone();
    expect(restored.toTextRuns("abcd", inherited)).toEqual(hints.toTextRuns("abcd", inherited));
    expect(
      new SwpHints(pool, [new SwTextAttr(createSwFormatAutoFormat(pool, bold), 5, 6)]).toTextRuns(
        "ab",
        inherited,
      ),
    ).toEqual([{ attributes: plain, text: "ab" }]);
    const overlap = [
      new SwTextAttr(createSwFormatAutoFormat(pool, bold), 0, 2),
      new SwTextAttr(createSwFormatAutoFormat(pool, italic), 1, 3),
    ];
    expect(
      throwing(
        /** Builds overlapping hints. @returns Invalid hint collection. */ () =>
          new SwpHints(pool, overlap),
      ),
    ).toThrow("Overlapping Writer");
    const inheritedWriter = createModelFixture("hint-inherited");
    inheritedWriter
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    const inheritedPool = inheritedWriter.GetAttrPool();
    const redundant = new SwpHints(inheritedPool, [
      new SwTextAttr(createSwFormatAutoFormat(inheritedPool, bold), 1, 2),
    ]);
    expect(
      redundant.toTextRuns("abc", inheritedWriter.GetDfltTextFormatColl().GetAttrSet()),
    ).toEqual([{ attributes: bold, text: "abc" }]);
    expect(
      throwing(
        /** Builds same-start overlapping hints. @returns Invalid hint collection. */ () =>
          new SwpHints(pool, [
            new SwTextAttr(createSwFormatAutoFormat(pool, bold), 0, 1),
            new SwTextAttr(createSwFormatAutoFormat(pool, italic), 0, 2),
          ]),
      ),
    ).toThrow("Overlapping Writer");
  });

  it("mutates native hint fragments across clipped and empty ranges", /** Covers native hint construction, clipping, internal boundaries, and validation without run mutations. @returns Nothing. */ function mutatesNativeHints(): void {
    const writer = createModelFixture();
    const pool = writer.GetAttrPool();
    const inherited = writer.GetDfltTextFormatColl().GetAttrSet();
    const empty = new SwpHints(pool);
    expect(empty.createTextHints(0, plain, inherited).Count()).toBe(0);
    expect(
      throwing(
        /** Creates a negative-length hint fragment. @returns Invalid fragment. */ () =>
          empty.createTextHints(-1, plain, inherited),
      ),
    ).toThrow("length is invalid");

    const formatted = new SwpHints(pool, [
      new SwTextAttr(createSwFormatAutoFormat(pool, bold), 1, 3),
    ]);
    expect(formatted.getCharacterFormatState(4, 2, 2, "bold", inherited)).toBe("off");
    expect(
      formatted.toggleCharacterFormat(4, 0, 4, "italic", inherited).toTextRuns("abcd", inherited),
    ).toEqual([
      { attributes: { ...plain, italic: true }, text: "a" },
      { attributes: { ...bold, italic: true }, text: "bc" },
      { attributes: { ...plain, italic: true }, text: "d" },
    ]);

    const linked = new SwpHints(pool, [
      new SwTextAttr(new SwFormatINetFormat({ url: "original" }), 0, 4),
    ]).setHyperlink(4, 1, 3, { url: "replacement" });
    expect(linked.toTextRuns("abcd", inherited)).toEqual([
      { attributes: plain, hyperlink: { url: "original" }, text: "a" },
      { attributes: plain, hyperlink: { url: "replacement" }, text: "bc" },
      { attributes: plain, hyperlink: { url: "original" }, text: "d" },
    ]);
    expect(
      throwing(
        /** Mutates outside the canonical text length. @returns Invalid range. */ () =>
          linked.setHyperlink(4, 0, 5, undefined),
      ),
    ).toThrow("outside the text node");
  });
});

describe("Writer SwTextNode and content manager" /** Groups canonical text mutation and SwPaM operation tests. @returns Nothing; Vitest registers cases. */, function defineContentOperationTests(): void {
  it("applies and removes hyperlinks without changing character formatting", /** Covers the SwTextNode hyperlink range mutation boundary. @returns Nothing. */ function editsNodeHyperlinks(): void {
    const node = createModelFixture().paragraphs[0] as SwTextNode;
    node.InsertText("abcd", 0);
    node.SetHyperlink(0, 0, { url: "ignored" });
    node.SetHyperlink(1, 3, { url: "https://example.test/" });
    expect(projectWriterTextRuns(node)).toEqual([
      { attributes: plain, text: "a" },
      { attributes: plain, hyperlink: { url: "https://example.test/" }, text: "bc" },
      { attributes: plain, text: "d" },
    ]);
    node.SetHyperlink(1, 3, undefined);
    expect(projectWriterTextRuns(node)).toEqual([{ attributes: plain, text: "abcd" }]);
  });

  it("keeps text and auto-format hints coherent through insert, erase, replace, split, and join" /** Verifies the bounded SwTextNode algorithms used by browser editing. @returns Nothing; assertions inspect canonical text and derived runs. */, function editsTextNodes(): void {
    const writer = createModelFixture();
    const node = writer.paragraphs[0] as SwTextNode;
    expect(node.GetText()).toBe("");
    expect(node.Len()).toBe(0);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(node.GetOrCreateSwpHints()).toBe(node.GetpSwpHints());
    expect(node.InsertText("", 0)).toBe("");
    node.EraseText(0, 0);
    node.SetParagraphAlignment("justify");
    node.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    applyWriterParagraphList(node, { kind: "numbered", level: 2, styleId: "List 1" });
    expect(node.GetParagraphAlignment()).toBe("justify");
    expect(node.GetParagraphStyle()).toBe("heading-1");
    expect(projectWriterParagraphList(node)).toEqual({
      kind: "numbered",
      level: 2,
      styleId: "List 1",
    });
    writer.EnsureNumRule("Conflicting List", "numbered", 2);
    applyWriterParagraphList(node, { kind: "bullet", level: 2, styleId: "Conflicting List" });
    expect(projectWriterParagraphList(node)).toEqual({ kind: "bullet", level: 2 });
    writer.EnsureNumRule("Conflicting Bullet", "bullet", 2);
    applyWriterParagraphList(node, { kind: "numbered", level: 2, styleId: "Conflicting Bullet" });
    expect(projectWriterParagraphList(node)).toEqual({ kind: "numbered", level: 2 });
    node.InsertText("abcd", 0, createWriterCharacterItemSet(writer.GetAttrPool(), bold));
    node.InsertText("X", 2);
    expect(node.GetText()).toBe("abXcd");
    expect(projectWriterTextRuns(node)).toMatchObject([{ attributes: bold, text: "abXcd" }]);
    node.EraseText(1, 2);
    expect(node.GetText()).toBe("acd");
    node.ReplaceRange(1, 2, createWriterTextFragment(node, [{ attributes: italic, text: "YZ" }]));
    expect(node.GetText()).toBe("aYZd");
    node.ToggleTextRangeFormat(1, 3, "underline");
    expect(projectWriterTextRuns(node)[1]?.attributes).toMatchObject({
      italic: true,
      underline: true,
    });
    expect(projectWriterCharacterAttributes(node.GetCharacterItemsAt(2))).toMatchObject({
      italic: true,
      underline: true,
    });
    const direct = createModelFixture().paragraphs[0] as SwTextNode;
    direct.InsertText("bold", 0, createWriterCharacterItemSet(direct.GetDoc().GetAttrPool(), bold));
    direct.ToggleTextRangeFormat(0, 4, "bold");
    expect(direct.GetpSwpHints()).toBeUndefined();
    const trailing = node.SplitContent(2);
    writer.nodes.insertTextNodeAfter(node, trailing);
    expect(node.GetText()).toBe("aY");
    expect(trailing.GetText()).toBe("Zd");
    expect(trailing.GetParagraphAlignment()).toBe("justify");
    expect(trailing.GetParagraphStyle()).toBe("text-body");
    node.AppendTextNode(trailing);
    expect(node.GetText()).toBe("aYZd");
    expect(
      throwing(
        /** Appends a node to itself. @returns Invalid mutation. */ () => node.AppendTextNode(node),
      ),
    ).toThrow("append itself");
    const foreign = createModelFixture("foreign").paragraphs[0] as SwTextNode;
    expect(
      throwing(
        /** Appends a foreign node. @returns Invalid mutation. */ () =>
          node.AppendTextNode(foreign),
      ),
    ).toThrow("different documents");
    const cloneDocument = createModelFixture("clone");
    const restored = node.CloneTo(cloneDocument.nodes);
    expect(restored.GetParagraphAlignment()).toBe(node.GetParagraphAlignment());
    expect(restored.GetParagraphStyle()).toBe(node.GetParagraphStyle());
    expect(restored.GetText()).toBe("aYZd");
    expect(createWriterDocument().paragraphs[0]?.CloneTo(cloneDocument.nodes).GetText()).toBe("");
    node.SetText("plain");
    expect(projectWriterTextRuns(node)).toMatchObject([
      { attributes: { bold: true }, text: "plain" },
    ]);
    node.SetText("pl");
    node.SetText("pl");
    node.SetText("xy");
    node.SetTextHints(new SwpHints(writer.GetAttrPool()));
    expect(node.GetText()).toBe("xy");
    expect(
      throwing(/** Erases before text. @returns Nothing. */ () => node.EraseText(-1, 1)),
    ).toThrow("outside the text node");
    expect(
      throwing(
        /** Replaces after text. @returns Nothing. */ () =>
          node.ReplaceRange(0, 9, createWriterTextFragment(node, [])),
      ),
    ).toThrow("outside the text node");
    expect(node.SplitContent(0).GetText()).toBe("xy");
  });

  it("applies insert, delete, and replacement operations through SwPosition and SwPaM" /** Verifies DocumentContentOperationsManager owns canonical content changes and guards cross-node ranges. @returns Nothing; assertions inspect document state. */, function appliesContentOperations(): void {
    const writer = appendFixtureParagraph(createModelFixture(), "p-2");
    const first = writer.paragraphs[0] as SwTextNode;
    const second = writer.paragraphs[1] as SwTextNode;
    const manager = writer.GetDocumentContentOperationsManager();
    expect(writer.GetDocumentContentOperationsManager()).toBeInstanceOf(
      DocumentContentOperationsManager,
    );
    expect(writer.GetDocumentListsManager()).toBeDefined();
    expect(writer.GetDocumentStylePoolManager()).toBeDefined();
    const settings = writer.GetDocumentSettingManager();
    expect(settings.get("HTML_MODE")).toBe(false);
    settings.set("HTML_MODE", true);
    expect(settings.get("HTML_MODE")).toBe(true);
    manager.InsertString(new SwPosition(first), "abcd");
    manager.InsertString(new SwPosition(first, 4), "");
    manager.ReplaceRange(
      new SwPaM(new SwPosition(first, 3), new SwPosition(first, 1)),
      createWriterTextFragment(first, [{ attributes: italic, text: "X" }]),
    );
    expect(first.GetText()).toBe("aXd");
    manager.DeleteRange(new SwPaM(new SwPosition(first, 2), new SwPosition(first, 1)));
    expect(first.GetText()).toBe("ad");
    manager.DeleteRange(new SwPaM(new SwPosition(first, 1)));
    expect(first.GetText()).toBe("ad");
    expect(
      manager.CopyRange(
        new SwPaM(new SwPosition(first, 1), new SwPosition(first, 0)),
        new SwPosition(second, 0),
      ),
    ).toBe(1);
    expect(second.GetText()).toBe("a");
    expect(
      manager
        .MoveRange(
          new SwPaM(new SwPosition(first, 2), new SwPosition(first, 1)),
          new SwPosition(second, 1),
        )
        .GetContentIndex(),
    ).toBe(2);
    expect(first.GetText()).toBe("a");
    expect(second.GetText()).toBe("ad");
    const trailing = manager.SplitNode(new SwPosition(first, 0));
    expect(
      writer.paragraphs
        .slice(0, 3)
        .map(
          /** Selects text from one canonical paragraph. @param paragraph - Text node. @returns Plain text. */ (
            paragraph,
          ) => paragraph.GetText(),
        ),
    ).toEqual(["", "a", "ad"]);
    expect(manager.JoinTextNodes(first, trailing)).toBe(0);
    expect(
      writer.paragraphs.map(
        /** Selects text from one joined paragraph. @param paragraph - Text node. @returns Plain text. */ (
          paragraph,
        ) => paragraph.GetText(),
      ),
    ).toEqual(["a", "ad"]);
    const crossNode = new SwPaM(new SwPosition(second), new SwPosition(first));
    expect(
      throwing(
        /** Replaces across nodes. @returns Nothing. */ () =>
          manager.ReplaceRange(crossNode, createWriterTextFragment(first, [])),
      ),
    ).toThrow("SwTextNode");
    expect(
      throwing(/** Deletes across nodes. @returns Nothing. */ () => manager.DeleteRange(crossNode)),
    ).toThrow("SwTextNode");
    expect(
      throwing(
        /** Inserts into a non-text content node. @returns Nothing. */ () =>
          manager.InsertString(new SwPosition(new TestContentNode(writer)), "x"),
      ),
    ).toThrow("requires a SwTextNode");
    expect(first.GetText()).toBe("a");
  });

  it("rejects unsupported content-operation ranges before mutation" /** Covers the manager's same-document, adjacency, connectivity, and move-overlap guards. @returns Nothing; assertions inspect deterministic failures. */, function rejectsUnsupportedContentOperations(): void {
    const writer = appendFixtureParagraph(
      appendFixtureParagraph(createModelFixture(), "p-2"),
      "p-3",
    );
    const other = createModelFixture("model-b");
    const first = writer.paragraphs[0] as SwTextNode;
    const second = writer.paragraphs[1] as SwTextNode;
    const third = writer.paragraphs[2] as SwTextNode;
    const foreign = other.paragraphs[0] as SwTextNode;
    const manager = writer.GetDocumentContentOperationsManager();
    manager.InsertString(new SwPaM(new SwPosition(first)), "abcd");
    expect(
      manager.ReplaceRange(
        new SwPaM(new SwPosition(first, 2), new SwPosition(first, 1)),
        first.CaptureTextFragment(1, 2),
      ),
    ).toBe(false);
    expect(
      throwing(
        /** Joins non-adjacent nodes. @returns Nothing. */ () =>
          manager.JoinTextNodes(first, third),
      ),
    ).toThrow("adjacent SwTextNodes");
    expect(
      throwing(
        /** Joins nodes from different documents. @returns Nothing. */ () =>
          manager.JoinTextNodes(first, foreign),
      ),
    ).toThrow("belongs to another document");
    const detached = new SwTextNode(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    expect(
      throwing(
        /** Restores a joined node from another document. @returns Nothing. */ () =>
          manager.RestoreJoinedTextNode(first, first.Len(), foreign),
      ),
    ).toThrow("belongs to another document");
    expect(
      throwing(
        /** Restores a joined node that is still connected. @returns Nothing. */ () =>
          manager.RestoreJoinedTextNode(first, first.Len(), second),
      ),
    ).toThrow("detached trailing SwTextNode");
    expect(
      throwing(
        /** Reuses a split node from another document. @returns Nothing. */ () =>
          manager.RestoreSplitTextNode(second, foreign),
      ),
    ).toThrow("belongs to another document");
    expect(
      throwing(
        /** Reuses a retained split node that is still connected. @returns Nothing. */ () =>
          manager.RestoreSplitTextNode(second, first),
      ),
    ).toThrow("detached retained SwTextNode");
    detached.SetText("different");
    expect(
      throwing(
        /** Reuses retained split content that differs from the provisional node. @returns Nothing. */ () =>
          manager.RestoreSplitTextNode(second, detached),
      ),
    ).toThrow("does not match the provisional split");
    expect(
      throwing(
        /** Inserts into a detached text node. @returns Nothing. */ () =>
          manager.InsertString(new SwPosition(detached), "x"),
      ),
    ).toThrow("connected SwTextNode");
    for (const offset of [0.5, -1, first.Len() + 1])
      expect(
        throwing(
          /** Restores an invalid join offset. @returns Nothing. */ () =>
            manager.RestoreJoinedTextNode(first, offset, detached),
        ),
      ).toThrow("outside its SwTextNode");
    const source = new SwPaM(new SwPosition(first, 3), new SwPosition(first, 1));
    expect(
      throwing(
        /** Inserts through a manager owned by another document. @returns Nothing. */ () =>
          manager.InsertString(new SwPosition(foreign), "x"),
      ),
    ).toThrow("belongs to another document");
    expect(
      throwing(
        /** Copies across documents. @returns Nothing. */ () =>
          manager.CopyRange(source, new SwPosition(foreign)),
      ),
    ).toThrow("belongs to another document");
    expect(
      throwing(
        /** Moves across documents. @returns Nothing. */ () =>
          manager.MoveRange(source, new SwPosition(foreign)),
      ),
    ).toThrow("belongs to another document");
    expect(
      throwing(
        /** Moves a range into itself. @returns Nothing. */ () =>
          manager.MoveRange(source, new SwPosition(first, 2)),
      ),
    ).toThrow("into itself");
    const movedAfter = manager.MoveRange(source, new SwPosition(first, 4));
    expect(movedAfter.GetContentIndex()).toBe(4);
    expect(first.GetText()).toBe("adbc");
    const movedBefore = manager.MoveRange(
      new SwPaM(new SwPosition(first, 4), new SwPosition(first, 2)),
      new SwPosition(first),
    );
    expect(movedBefore.GetContentIndex()).toBe(2);
    expect(first.GetText()).toBe("bcad");
    expect(second.GetText()).toBe("");
  });

  it("round-trips the current SwDoc schema and rejects obsolete roots" /** Verifies current snapshot restoration and rejects non-canonical schemas. @returns Nothing; assertions inspect serialization. */, function restoresDocuments(): void {
    const writer = createModelFixture();
    expect(createWriterDocument().paragraphs).toHaveLength(1);
    const current = normalizeWriterParagraphFormatting(serializeWriterDocument(writer));
    expect(current).toBeInstanceOf(SwDoc);
    expect(current).not.toBe(writer);
    expect(serializeWriterDocument(current)).toEqual(serializeWriterDocument(writer));
    expect(
      normalizeWriterParagraphFormatting(serializeWriterDocument(writer)).paragraphs,
    ).toHaveLength(1);
    const encoded = serializeWriterDocument(writer);
    expect(
      throwing(
        /** Decodes an invalid style identity. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({
            ...encoded,
            textFormatCollections: [{ ...encoded.textFormatCollections[0], id: "invalid" }],
          }),
      ),
    ).toThrow("style is invalid");
    expect(
      throwing(
        /** Decodes an invalid node style. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({
            ...encoded,
            textNodes: [{ ...encoded.textNodes[0], formatCollId: "invalid" }],
          }),
      ),
    ).toThrow("paragraph style is invalid");
    expect(
      throwing(
        /** Decodes an empty current-schema body. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({ ...encoded, textNodes: [] }),
      ),
    ).toThrow("no body text node");
    expect(
      throwing(
        /** Normalizes a null root. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting(null),
      ),
    ).toThrow("schema is unsupported");
    expect(
      throwing(
        /** Normalizes an empty root. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({}),
      ),
    ).toThrow("schema is unsupported");
    expect(
      throwing(
        /** Rejects an obsolete empty body. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({ document: {}, paragraphs: [] }),
      ),
    ).toThrow("schema is unsupported");
    expect(
      throwing(
        /** Rejects an obsolete malformed paragraph. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({ document: {}, paragraphs: [null] }),
      ),
    ).toThrow("schema is unsupported");
  });
});
