/** @fileoverview Native SectionDown/SectionUpDown wrap actual node ranges, preserve real table/cursor identities and retain source opposing-boundary/endpoint behavior. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNodeRange, SwNodeIndex } from "../../../inc/ndindex";
import { SwPosition } from "../crsr/pam";
import { SwStartNode, SwEndNode } from "./node";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFormatContent } from "../../../inc/fmtcntnt";
/** Creates actual body paragraphs with a surviving final boundary. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    a = doc.paragraphs[0];
  assert(a);
  a.SetText("first");
  const b = doc.GetNodes().MakeTextNode("second"),
    c = doc.GetNodes().MakeTextNode("after");
  return { doc, nodes: doc.GetNodes(), a, b, c };
}
it("wraps the actual MakeFlySection source range at the autotext end without creating a substitute fly format", /** A real existing paragraph is reparented, not recreated through MakeTextSection. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    nodes = doc.GetNodes(),
    boundary = nodes.GetEndOfAutotext(),
    text = nodes.MakeTextNode(boundary, doc.GetDfltTextFormatColl()),
    range = new SwNodeRange(boundary, -1, boundary),
    originalIndex = new SwNodeIndex(text),
    position = new SwPosition(text);
  try {
    nodes.SectionDown(range, K.SwFlyStartNode);
    const start = range.aStart.GetNode(),
      end = range.aEnd.GetNode();
    assert(start instanceof SwStartNode);
    assert(end instanceof SwEndNode);
    expect(start.GetStartNodeType()).toBe(K.SwFlyStartNode);
    expect(start.EndOfSectionNode()).toBe(end);
    expect(end.StartOfSectionNode()).toBe(start);
    expect(text.StartOfSectionNode()).toBe(start);
    expect(nodes.at(start.GetIndex() + 1)).toBe(text);
    expect(nodes.at(end.GetIndex() + 1)).toBe(boundary);
    expect(originalIndex.GetNode()).toBe(text);
    expect(position.GetNode()).toBe(text);
    expect(doc.GetSpzFrameFormats().empty()).toBe(true);
    const content = new SwFormatContent(text.StartOfSectionNode());
    try {
      expect(content.GetContentIdx()?.GetNode()).toBe(start);
    } finally {
      content.Dispose();
    }
  } finally {
    position.Dispose();
    originalIndex.Dispose();
    range.Dispose();
    doc.Dispose();
  }
});
it("wraps an exclusive body interval and preserves unrelated body ownership and registered cursor offsets", /** Original endpoints are assigned to the new sentinels while external indices retain original content owners. @returns Nothing. */ () => {
  const x = fixture(),
    body = x.a.StartOfSectionNode(),
    range = new SwNodeRange(x.a, x.c),
    index = new SwNodeIndex(x.a),
    position = new SwPosition(x.b, 3),
    textStyle = x.b.GetTextFormatColl(),
    revision = x.doc.GetDocumentStateManager().GetModelRevision(),
    history = x.doc.GetUndoManager().GetUndoActionCount();
  try {
    x.nodes.SectionDown(range);
    const start = range.aStart.GetNode(),
      end = range.aEnd.GetNode();
    assert(start instanceof SwStartNode);
    assert(end instanceof SwEndNode);
    expect(start.GetStartNodeType()).toBe(K.SwNormalStartNode);
    expect(start.StartOfSectionNode()).toBe(body);
    expect(x.a.StartOfSectionNode()).toBe(start);
    expect(x.b.StartOfSectionNode()).toBe(start);
    expect(x.c.StartOfSectionNode()).toBe(body);
    expect(body.EndOfSectionNode()).toBe(x.nodes.GetEndOfContent());
    expect(index.GetNode()).toBe(x.a);
    expect(position.GetNode()).toBe(x.b);
    expect(position.GetContentIndex()).toBe(3);
    expect(x.b.GetText()).toBe("second");
    expect(x.b.GetTextFormatColl()).toBe(textStyle);
    expect(x.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(x.doc.GetUndoManager().GetUndoActionCount()).toBe(history);
  } finally {
    position.Dispose();
    index.Dispose();
    range.Dispose();
    x.doc.Dispose();
  }
});
it.each([
  K.SwNormalStartNode,
  K.SwTableBoxStartNode,
  K.SwFlyStartNode,
  K.SwFootnoteStartNode,
  K.SwHeaderStartNode,
  K.SwFooterStartNode,
])(
  "new outer sentinel retains requested native structural tag %s",
  /** A section tag alone does not fabricate its associated frame, cell or footnote service. @param tag - Original section kind. @returns Nothing. */ (
    tag,
  ) => {
    const x = fixture(),
      range = new SwNodeRange(x.a, x.b);
    try {
      x.nodes.SectionDown(range, tag);
      const start = range.aStart.GetNode();
      assert(start instanceof SwStartNode);
      expect(start.GetStartNodeType()).toBe(tag);
      expect(x.a.FindStartNodeByType(tag)).toBe(start);
      expect(x.b.StartOfSectionNode()).not.toBe(start);
    } finally {
      range.Dispose();
      x.doc.Dispose();
    }
  },
);
it("stack walk preserves a nested section and repairs its actual parent without rebuilding its content", /** Native section/end identities survive the outer wrap. @returns Nothing. */ () => {
  const x = fixture(),
    nested = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    nestedEnd = nested.EndOfSectionNode(),
    content = x.nodes.at(nested.GetIndex() + 1),
    range = new SwNodeRange(x.a, x.c);
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    const outer = range.aStart.GetNode();
    assert(outer instanceof SwStartNode);
    expect(nested.StartOfSectionNode()).toBe(outer);
    expect(nested.EndOfSectionNode()).toBe(nestedEnd);
    expect(content.StartOfSectionNode()).toBe(nested);
    expect(nestedEnd.StartOfSectionNode()).toBe(nested);
    expect(outer.EndOfSectionNode()).toBe(range.aEnd.GetNode());
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("stack walk retains the genuine table graph, box formats and content registry inside a wrapped interval", /** Actual native InsertTable owners remain connected and can be deleted through the existing native path. @returns Nothing. */ () => {
  const x = fixture(),
    insertion = new SwPosition(x.c);
  x.doc.GetUndoManager().DoUndo(false);
  const table = x.doc.InsertTable(
    { mnInsMode: 0, mnRowsToRepeat: 0 },
    insertion,
    1,
    1,
    HoriOrientation.LEFT,
  );
  assert(table);
  const node = table.GetTableNode(),
    tableEnd = node.EndOfSectionNode(),
    box = [...table.GetTabSortBoxes()][0];
  assert(box);
  const boxStart = box.GetSttNd(),
    format = box.GetFrameFormat(),
    range = new SwNodeRange(x.a, x.c);
  assert(boxStart);
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    const outer = range.aStart.GetNode();
    assert(outer instanceof SwStartNode);
    expect(node.StartOfSectionNode()).toBe(outer);
    expect(node.GetTable()).toBe(table);
    expect(node.EndOfSectionNode()).toBe(tableEnd);
    expect(box.GetSttNd()).toBe(boxStart);
    expect(box.GetFrameFormat()).toBe(format);
    expect(table.GetTableBox(boxStart.GetIndex())).toBe(box);
  } finally {
    range.Dispose();
    insertion.Dispose();
    const deletion = new SwNodeIndex(node);
    const count = node.EndOfSectionNode().GetIndex() - node.GetIndex() + 1;
    try {
      x.nodes.DelNodes(deletion, count);
    } finally {
      deletion.Dispose();
    }
    x.doc.Dispose();
  }
});
it.each(["equal", "reversed"] as const)(
  "original %s range guard returns without mutation or endpoint normalization",
  /** No boundary producer is invoked on source rejected ranges. @param mode - Original rejected shape. @returns Nothing. */ (
    mode,
  ) => {
    const x = fixture(),
      range = mode === "equal" ? new SwNodeRange(x.a, x.a) : new SwNodeRange(x.b, x.a),
      before = [...x.nodes.entries()],
      first = range.aStart.GetNode(),
      last = range.aEnd.GetNode();
    const remove = vi.spyOn(x.nodes, "DelNodes");
    try {
      x.nodes.SectionDown(range, K.SwFlyStartNode);
      expect([...x.nodes.entries()]).toEqual(before);
      expect(range.aStart.GetNode()).toBe(first);
      expect(range.aEnd.GetNode()).toBe(last);
      expect(remove).not.toHaveBeenCalled();
    } finally {
      remove.mockRestore();
      range.Dispose();
      x.doc.Dispose();
    }
  },
);
it("original cross-fixed-section guard returns without changing actual node ownership", /** A real extra-section paragraph and body paragraph cross a native global section boundary. @returns Nothing. */ () => {
  const x = fixture(),
    extra = x.nodes.MakeTextNode(x.nodes.GetEndOfAutotext(), x.doc.GetDfltTextFormatColl()),
    range = new SwNodeRange(extra, x.a),
    before = [...x.nodes.entries()];
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    expect([...x.nodes.entries()]).toEqual(before);
    expect(range.aStart.GetNode()).toBe(extra);
    expect(range.aEnd.GetNode()).toBe(x.a);
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("leading EndNode deletion retains the existing outer start and nests the following real section", /** Actual DelNodes corrects range/external indices before source stack rebuilding. @returns Nothing. */ () => {
  const x = fixture(),
    first = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    second = x.nodes.MakeTextSection(x.c, K.SwHeaderStartNode, x.doc.GetDfltTextFormatColl()),
    oldEnd = first.EndOfSectionNode(),
    secondEnd = second.EndOfSectionNode(),
    range = new SwNodeRange(oldEnd, x.c),
    borrowed = new SwNodeIndex(oldEnd),
    death = vi.spyOn(oldEnd, "DisposeModify");
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    expect(death).toHaveBeenCalledTimes(1);
    expect(range.aStart.GetNode()).toBe(second);
    expect(borrowed.GetNode()).toBe(second);
    expect(second.StartOfSectionNode()).toBe(first);
    expect(second.EndOfSectionNode()).toBe(secondEnd);
    expect(first.EndOfSectionNode()).toBe(range.aEnd.GetNode());
    expect(first.GetStartNodeType()).toBe(K.SwNormalStartNode);
  } finally {
    death.mockRestore();
    borrowed.Dispose();
    range.Dispose();
    x.doc.Dispose();
  }
});
it("trailing StartNode deletion preserves the original completion boundary before the removed start (WRITER348)", /** Stack repair deliberately continues beyond that output boundary to the real matching end. @returns Nothing. */ () => {
  const x = fixture(),
    oldStart = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    inner = x.nodes.at(oldStart.GetIndex() + 1),
    oldEnd = oldStart.EndOfSectionNode(),
    range = new SwNodeRange(x.b, inner),
    borrowed = new SwNodeIndex(oldStart),
    death = vi.spyOn(oldStart, "DisposeModify");
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    const outer = range.aStart.GetNode();
    assert(outer instanceof SwStartNode);
    expect(death).toHaveBeenCalledTimes(1);
    expect(borrowed.GetNode()).toBe(inner);
    expect(range.aEnd.GetNode()).toBe(x.b);
    expect(outer.EndOfSectionNode()).toBe(oldEnd);
    expect(inner.StartOfSectionNode()).toBe(outer);
    expect(oldEnd.StartOfSectionNode()).toBe(outer);
  } finally {
    death.mockRestore();
    borrowed.Dispose();
    range.Dispose();
    x.doc.Dispose();
  }
});
it("both opposing sentinels are deleted and original output endpoints can reverse (WRITER348)", /** Native source does not normalize output indices after both DelNodes corrections and the final decrement. @returns Nothing. */ () => {
  const x = fixture(),
    first = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    second = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    firstText = x.nodes.at(first.GetIndex() + 1),
    secondText = x.nodes.at(second.GetIndex() + 1),
    finalEnd = second.EndOfSectionNode(),
    range = new SwNodeRange(first.EndOfSectionNode(), secondText);
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    expect(range.aStart.GetNode()).toBe(secondText);
    expect(range.aEnd.GetNode()).toBe(firstText);
    expect(range.aStart.GetIndex()).toBeGreaterThan(range.aEnd.GetIndex());
    expect(first.EndOfSectionNode()).toBe(finalEnd);
    expect(finalEnd.StartOfSectionNode()).toBe(first);
    expect(firstText.StartOfSectionNode()).toBe(first);
    expect(secondText.StartOfSectionNode()).toBe(first);
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("stack exhaustion before the completion boundary resumes with the actual ancestor", /** The original SectionUpDown branch reuses the ancestor and repairs its new end instead of stopping at the first close. @returns Nothing. */ () => {
  const x = fixture(),
    first = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    second = x.nodes.MakeTextSection(x.c, K.SwNormalStartNode, x.doc.GetDfltTextFormatColl()),
    text = x.nodes.at(first.GetIndex() + 1),
    originalEnd = first.EndOfSectionNode(),
    secondEnd = second.EndOfSectionNode(),
    range = new SwNodeRange(text, x.c);
  try {
    x.nodes.SectionDown(range, K.SwFlyStartNode);
    const inner = range.aStart.GetNode();
    assert(inner instanceof SwStartNode);
    expect(inner.StartOfSectionNode()).toBe(first);
    expect(inner.EndOfSectionNode()).toBe(originalEnd);
    expect(originalEnd.StartOfSectionNode()).toBe(inner);
    expect(second.StartOfSectionNode()).toBe(first);
    expect(second.EndOfSectionNode()).toBe(secondEnd);
    expect(first.EndOfSectionNode()).toBe(range.aEnd.GetNode());
  } finally {
    range.Dispose();
    x.doc.Dispose();
  }
});
it("repeated native wrapping creates genuine nested ownership without copying content", /** Existing content and registered positions remain stable through both original operations. @returns Nothing. */ () => {
  const x = fixture(),
    first = new SwNodeRange(x.a, x.c),
    second = new SwNodeRange(x.a, x.b),
    position = new SwPosition(x.a, 2);
  try {
    x.nodes.SectionDown(first, K.SwFlyStartNode);
    x.nodes.SectionDown(second, K.SwHeaderStartNode);
    const outer = first.aStart.GetNode(),
      inner = second.aStart.GetNode();
    assert(outer instanceof SwStartNode);
    assert(inner instanceof SwStartNode);
    expect(inner.StartOfSectionNode()).toBe(outer);
    expect(x.a.StartOfSectionNode()).toBe(inner);
    expect(x.b.StartOfSectionNode()).toBe(outer);
    expect(position.GetNode()).toBe(x.a);
    expect(position.GetContentIndex()).toBe(2);
    expect(outer.EndOfSectionNode()).toBe(first.aEnd.GetNode());
    expect(inner.EndOfSectionNode()).toBe(second.aEnd.GetNode());
  } finally {
    position.Dispose();
    second.Dispose();
    first.Dispose();
    x.doc.Dispose();
  }
});
