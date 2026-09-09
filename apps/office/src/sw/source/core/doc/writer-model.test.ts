/** @fileoverview Verifies the LibreOffice-shaped Writer node graph, model positions, selections, hints, and content-operation ownership. */

import { describe, expect, it } from "vitest";

import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/poolitem";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import {
  appendWriterParagraph,
  createWriterDocument,
  normalizeWriterParagraphFormatting,
  serializeWriterDocument,
  SwContentNode,
  SwDoc,
  SwEndNode,
  SwNode,
  SwNodeIndex,
  SwPaM,
  SwPosition,
  SwStartNode,
  type WriterDocument,
} from "./writer";
import { SwTextNode } from "../txtnode/ndtxt";
import { createSwpHintsFromSnapshot, SwpHints } from "../txtnode/ndhints";
import {
  createSwFormatAutoFormat,
  projectWriterCharacterAttributes,
  RES_TXTATR_AUTOFMT,
  restoreSwFormatAutoFormat,
  SwFormatAutoFormat,
  SwTextAttr,
  type WriterCharacterAttributes,
} from "../txtnode/txatbase";

const bold: WriterCharacterAttributes = { bold: true, italic: false, underline: false };
const italic: WriterCharacterAttributes = { bold: false, italic: true, underline: false };
const plain: WriterCharacterAttributes = { bold: false, italic: false, underline: false };

/** Creates one canonical Writer graph for low-level model tests. @param id - Browser document identity. @returns Canonical Writer fixture. */
function createModelFixture(id = "model-a"): WriterDocument {
  return createWriterDocument(
    createDocument({ id, suiteId: "writer", title: "Writer model" }),
    "p-1",
  );
}

/** Returns a function that evaluates the supplied operation for an error assertion. @param operation - Deferred operation. @returns The same deferred operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

/** Minimal non-text content node used to verify content-operation type guards. */
class TestContentNode extends SwContentNode {
  /** Creates a test-only content node owned by the supplied section. @param document - Owning document. @returns Nothing. */
  public constructor(document: WriterDocument) {
    super(document.nodes, "test-content", document.nodes.GetEndOfContent().StartOfSectionNode());
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
    super(document.nodes, "detached", "text");
  }
}

describe("Writer SwNodes graph" /** Groups node ownership and fixed-section tests. @returns Nothing; Vitest registers cases. */, function defineSwNodesTests(): void {
  it("creates the fixed Writer sections and tracks node indices through structural changes" /** Verifies the pinned SwNodes constructor ordering and object-identity indices. @returns Nothing; assertions inspect the graph. */, function createsFixedSections(): void {
    const writer = appendWriterParagraph(createModelFixture(), "p-2");
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
    expect(tracked.GetNode().id).toBe("p-2");
    nodes.moveTextNode(writer.paragraphs[1] as SwTextNode, -1);
    expect(tracked.GetIndex()).toBe(9);
    tracked.Assign(writer.paragraphs[1] as SwTextNode);
    expect(tracked.GetNode().id).toBe("p-1");
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
          new SwStartNode(nodes, "orphan").EndOfSectionNode(),
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
      "p-2",
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    writer.nodes.insertTextNodeAfter(node, prepared);
    expect(writer.nodes.findTextNode("p-2")).toBe(prepared);
    expect(writer.nodes.findTextNode("missing")).toBeUndefined();
    expect(
      throwing(
        /** Creates a blank-id node. @returns Invalid node. */ () => writer.nodes.MakeTextNode(" "),
      ),
    ).toThrow("must not be blank");
    expect(
      throwing(
        /** Creates a duplicate node. @returns Invalid node. */ () =>
          writer.nodes.MakeTextNode("p-2"),
      ),
    ).toThrow("Duplicate paragraph");
    const duplicate = new SwTextNode(
      writer.nodes,
      "p-2",
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    expect(
      throwing(
        /** Inserts a duplicate prepared node. @returns Nothing. */ () =>
          writer.nodes.insertTextNodeAfter(node, duplicate),
      ),
    ).toThrow("Duplicate paragraph");
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
        /** Moves a foreign node. @returns Nothing. */ () => writer.nodes.moveTextNode(foreign, 1),
      ),
    ).toThrow("another SwNodes");
    writer.nodes.removeTextNode(prepared);
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
    expect(
      throwing(
        /** Restores an empty body. @returns Nothing. */ () => writer.nodes.restoreContent([]),
      ),
    ).toThrow("content section is empty");
  });
});

describe("Writer SwPosition and SwPaM" /** Groups model cursor and range-direction tests. @returns Nothing; Vitest registers cases. */, function definePositionTests(): void {
  it("orders point and mark while preserving selection direction" /** Verifies node indices, content bounds, cloning, and SwPaM endpoint semantics. @returns Nothing; assertions inspect positions. */, function ordersPositions(): void {
    const writer = appendWriterParagraph(createModelFixture(), "p-2");
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
  });
});

describe("Writer SwTextAttr and SwpHints" /** Groups direct-format range storage tests. @returns Nothing; Vitest registers cases. */, function defineHintTests(): void {
  it("sorts, merges, clones, serializes, and projects auto-format hints" /** Verifies the canonical range container independently from rendering. @returns Nothing; assertions inspect hints and runs. */, function managesHints(): void {
    const writer = createModelFixture();
    const pool = writer.GetAttrPool();
    const inherited = writer.GetDfltTextFormatColl().GetAttrSet();
    const first = new SwTextAttr(createSwFormatAutoFormat(pool, bold), 1, 3);
    expect(first.format.GetStyleHandle()).toBeInstanceOf(SfxItemSet);
    expect(first.format.Clone()).not.toBe(first.format);
    expect(first.format.Clone().equals(first.format)).toBe(true);
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
    for (const snapshot of [
      { type: "SwFormatAutoFormat", value: [], which: 52 },
      { type: "wrong", value: [], which: RES_TXTATR_AUTOFMT },
      { type: "SwFormatAutoFormat", value: 1, which: RES_TXTATR_AUTOFMT },
    ])
      expect(
        throwing(
          /** Restores an invalid auto-format snapshot. @returns Invalid item. */ () =>
            restoreSwFormatAutoFormat(pool, snapshot),
        ),
      ).toThrow("snapshot is invalid");
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
    expect(clone.toSnapshot()).toEqual(hints.toSnapshot());
    const clonedHint = first.clone(2);
    expect(clonedHint.toSnapshot()).toMatchObject({ start: 3, end: 5 });
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
    const restored = createSwpHintsFromSnapshot(pool, hints.toSnapshot());
    expect(restored.toSnapshot()).toEqual(hints.toSnapshot());
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
    inheritedWriter.GetDfltTextFormatColl().SetFormatAttr(new SvxWeightItem(FontWeight.BOLD));
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
});

describe("Writer SwTextNode and content manager" /** Groups canonical text mutation and SwPaM operation tests. @returns Nothing; Vitest registers cases. */, function defineContentOperationTests(): void {
  it("keeps text and auto-format hints coherent through insert, erase, replace, split, and join" /** Verifies the bounded SwTextNode algorithms used by browser editing. @returns Nothing; assertions inspect canonical text and derived runs. */, function editsTextNodes(): void {
    const writer = createModelFixture();
    const node = writer.paragraphs[0] as SwTextNode;
    expect(node.GetText()).toBe("");
    expect(node.Len()).toBe(0);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(node.GetOrCreateSwpHints()).toBe(node.GetpSwpHints());
    node.SetParagraphAlignment("justify");
    node.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    node.SetParagraphList({ kind: "numbered", level: 2, styleId: "List 1" });
    expect(node.alignment).toBe("justify");
    expect(node.style).toBe("heading-1");
    expect(node.list).toEqual({ kind: "numbered", level: 2, styleId: "List 1" });
    node.InsertText("abcd", 0, bold);
    node.InsertText("X", 2);
    expect(node.GetText()).toBe("abXcd");
    expect(node.runs).toEqual([{ attributes: bold, text: "abXcd" }]);
    node.EraseText(1, 2);
    expect(node.text).toBe("acd");
    node.ReplaceRange(1, 2, [{ attributes: italic, text: "YZ" }]);
    expect(node.text).toBe("aYZd");
    node.ToggleTextRangeFormat(1, 3, "underline");
    expect(node.runs[1]?.attributes).toMatchObject({ italic: true, underline: true });
    expect(node.getCharacterAttributesAt(2)).toMatchObject({ italic: true, underline: true });
    const trailing = node.SplitContent(2, "p-2");
    writer.nodes.insertTextNodeAfter(node, trailing);
    expect(node.text).toBe("aY");
    expect(trailing.text).toBe("Zd");
    expect(trailing).toMatchObject({ alignment: "justify", style: "heading-1" });
    node.AppendTextNode(trailing);
    expect(node.text).toBe("aYZd");
    const snapshot = node.toSnapshot();
    const restored = SwTextNode.fromSnapshot(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
      { ...snapshot, formatCollId: "invalid" as "default" },
    );
    expect(restored).toMatchObject({ alignment: "justify", style: "default", text: "aYZd" });
    node.SetText("plain");
    expect(node.runs).toEqual([{ attributes: plain, text: "plain" }]);
    expect(
      throwing(/** Erases before text. @returns Nothing. */ () => node.EraseText(-1, 1)),
    ).toThrow("outside the text node");
    expect(
      throwing(/** Replaces after text. @returns Nothing. */ () => node.ReplaceRange(0, 9, [])),
    ).toThrow("outside the text node");
    expect(
      throwing(
        /** Splits with a blank identity. @returns Invalid node. */ () => node.SplitContent(0, " "),
      ),
    ).toThrow("must not be blank");
  });

  it("applies insert, delete, and replacement operations through SwPosition and SwPaM" /** Verifies DocumentContentOperationsManager owns canonical content changes and guards cross-node ranges. @returns Nothing; assertions inspect document state. */, function appliesContentOperations(): void {
    const writer = appendWriterParagraph(createModelFixture(), "p-2");
    const first = writer.paragraphs[0] as SwTextNode;
    const second = writer.paragraphs[1] as SwTextNode;
    const manager = new DocumentContentOperationsManager(writer);
    manager.InsertString(new SwPosition(first), "abcd");
    manager.InsertString(new SwPosition(first, 4), "");
    manager.ReplaceRange(new SwPaM(new SwPosition(first, 3), new SwPosition(first, 1)), [
      { attributes: italic, text: "X" },
    ]);
    expect(first.text).toBe("aXd");
    manager.DeleteRange(new SwPaM(new SwPosition(first, 2), new SwPosition(first, 1)));
    expect(first.text).toBe("ad");
    manager.DeleteRange(new SwPaM(new SwPosition(first, 1)));
    expect(first.text).toBe("ad");
    const crossNode = new SwPaM(new SwPosition(second), new SwPosition(first));
    expect(
      throwing(
        /** Replaces across nodes. @returns Nothing. */ () => manager.ReplaceRange(crossNode, []),
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
    expect(writer.document.lifecycle).toBe("dirty");
  });

  it("round-trips the current SwDoc schema and rejects obsolete roots" /** Verifies current snapshot restoration and rejects non-canonical schemas. @returns Nothing; assertions inspect serialization. */, function restoresDocuments(): void {
    const writer = createModelFixture();
    const current = normalizeWriterParagraphFormatting(serializeWriterDocument(writer));
    expect(current).toBeInstanceOf(SwDoc);
    expect(current).not.toBe(writer);
    expect(serializeWriterDocument(current)).toEqual(serializeWriterDocument(writer));
    expect(normalizeWriterParagraphFormatting(writer)).toBe(writer);
    expect(
      normalizeWriterParagraphFormatting(serializeWriterDocument(writer)).paragraphs[0]?.id,
    ).toBe("p-1");
    expect(
      throwing(
        /** Normalizes a null root. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting(null),
      ),
    ).toThrow("invalid");
    expect(
      throwing(
        /** Normalizes an empty root. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({}),
      ),
    ).toThrow("schema is unsupported");
    expect(
      throwing(
        /** Rejects an obsolete empty body. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({ document: writer.document, paragraphs: [] }),
      ),
    ).toThrow("schema is unsupported");
    expect(
      throwing(
        /** Rejects an obsolete malformed paragraph. @returns Invalid document. */ () =>
          normalizeWriterParagraphFormatting({ document: writer.document, paragraphs: [null] }),
      ),
    ).toThrow("schema is unsupported");
  });
});
