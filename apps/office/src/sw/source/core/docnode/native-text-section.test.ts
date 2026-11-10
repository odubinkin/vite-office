/** @fileoverview Native MakeTextSection, positioned text construction and enclosing start/table lookup over the actual Writer node array. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwTableBoxStartNode } from "./node";
import { SwNodeIndex, SwPosition } from "../crsr/pam";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
it.each([
  K.SwNormalStartNode,
  K.SwTableBoxStartNode,
  K.SwFlyStartNode,
  K.SwFootnoteStartNode,
  K.SwHeaderStartNode,
  K.SwFooterStartNode,
])(
  "constructs a real typed text section %s before the fixed extra boundary",
  /** All original tags identify structural sections without fabricating their associated frame/document service. @param type - Original tag. @returns Nothing. */ (
    type,
  ) => {
    const doc = new SwDoc();
    try {
      const nodes = doc.GetNodes(),
        where = nodes.GetEndOfAutotext(),
        coll = doc.GetTextFormatColl("table-contents"),
        before = where.GetIndex(),
        index = new SwNodeIndex(where);
      const start = nodes.MakeTextSection(where, type, coll),
        paragraph = nodes.at(start.GetIndex() + 1);
      assert(paragraph instanceof SwTextNode);
      expect(start.GetIndex()).toBe(before);
      expect(start.GetStartNodeType()).toBe(type);
      expect(start.EndOfSectionNode().GetIndex()).toBe(before + 2);
      expect(start.EndOfSectionNode().StartOfSectionNode()).toBe(start);
      expect(paragraph.StartOfSectionNode()).toBe(start);
      expect(paragraph.GetTextFormatColl()).toBe(coll);
      expect(paragraph.GetText()).toBe("");
      expect(paragraph.FindStartNodeByType(type)).toBe(start);
      expect(start.FindStartNodeByType(type)).toBe(start);
      expect(start.EndOfSectionNode().FindStartNodeByType(type)).toBe(start);
      expect(paragraph.FindTableNode()).toBeNull();
      expect(paragraph.FindTableBoxStartNode()).toBe(type === K.SwTableBoxStartNode ? start : null);
      expect(start instanceof SwTableBoxStartNode).toBe(type === K.SwTableBoxStartNode);
      expect(index.GetNode()).toBe(where);
      expect(index.GetIndex()).toBe(before + 3);
    } finally {
      doc.Dispose();
    }
  },
);
it("inserts a sibling section after an actual cell end instead of nesting it in the preceding cell", /** Native SwNode construction skips the previous EndNode's matching section while finding the new parent. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const table = doc.nodes.MakeTableNode("sections"),
      row = doc.nodes.AppendTableRow(table, 2),
      first = row.GetTabBoxes()[0],
      second = row.GetTabBoxes()[1];
    assert(first && second);
    const end = first.GetStartNode().EndOfSectionNode(),
      where = second.GetStartNode(),
      saved = new SwNodeIndex(where);
    const start = doc.nodes.MakeTextSection(
      where,
      K.SwTableBoxStartNode,
      doc.GetTextFormatColl("table-heading"),
    );
    expect(start.StartOfSectionNode()).toBe(table.GetTableNode());
    expect(start.GetIndex()).toBe(end.GetIndex() + 1);
    expect(start.EndOfSectionNode().GetIndex() + 1).toBe(where.GetIndex());
    expect(saved.GetNode()).toBe(where);
    expect(start.FindTableNode()).toBe(table.GetTableNode());
    expect(table.GetTableNode().FindTableNode()).toBe(table.GetTableNode());
    expect(table.GetTableNode().EndOfSectionNode().FindTableNode()).toBe(table.GetTableNode());
    expect(first.GetStartNode().GetStartNodeType()).toBe(K.SwTableBoxStartNode);
  } finally {
    doc.Dispose();
  }
});
it("retains actual paragraph and registered cursor identities when constructing text at a native boundary", /** The positioned overload shares the original text owner and existing body-text ingress retains its old result. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    original = doc.paragraphs[0];
  assert(original);
  const cursor = new SwPosition(original),
    index = new SwNodeIndex(original),
    before = original.GetIndex();
  try {
    const inserted = doc.nodes.MakeTextNode(original, doc.GetTextFormatColl("table-contents"));
    expect(inserted.GetIndex()).toBe(before);
    expect(inserted.StartOfSectionNode()).toBe(original.StartOfSectionNode());
    expect(cursor.GetNode()).toBe(original);
    expect(index.GetNode()).toBe(original);
    expect(original.GetIndex()).toBe(before + 1);
    expect(doc.nodes.MakeTextNode("body text").GetText()).toBe("body text");
    expect(original.FindTableNode()).toBeNull();
    expect(original.FindTableBoxStartNode()).toBeNull();
  } finally {
    cursor.Dispose();
    doc.Dispose();
  }
});
it("finds the nearest original typed section while normal starts and table nodes keep their own tags", /** Enclosing lookup follows actual start pointers and stops at the native root index. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const nodes = doc.nodes,
      outer = nodes.MakeTextSection(
        nodes.GetEndOfAutotext(),
        K.SwHeaderStartNode,
        doc.GetDfltTextFormatColl(),
      );
    const inner = nodes.MakeTextSection(
      outer.EndOfSectionNode(),
      K.SwTableBoxStartNode,
      doc.GetDfltTextFormatColl(),
    );
    const text = nodes.at(inner.GetIndex() + 1);
    expect(text.FindTableBoxStartNode()).toBe(inner);
    expect(text.FindStartNodeByType(K.SwHeaderStartNode)).toBe(outer);
    expect(text.FindStartNodeByType(K.SwFooterStartNode)).toBeNull();
    expect(text.FindTableNode()).toBeNull();
    const table = nodes.MakeTableNode("normal table tag");
    expect(table.GetTableNode().GetStartNodeType()).toBe(K.SwNormalStartNode);
  } finally {
    doc.Dispose();
  }
});
it("rejects foreign actual style/node owners before inserting structural nodes", /** Wrong document owners cannot enter the node graph. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    other = new SwDoc();
  try {
    const before = doc.nodes.entries().length;
    expect(
      /** Calls the genuine constructor with a foreign boundary. @returns New section if admission fails to reject. */ () =>
        doc.nodes.MakeTextSection(
          other.nodes.GetEndOfContent(),
          K.SwTableBoxStartNode,
          doc.GetDfltTextFormatColl(),
        ),
    ).toThrow("another document");
    expect(
      /** Calls the genuine constructor with a foreign style. @returns New section if admission fails to reject. */ () =>
        doc.nodes.MakeTextSection(
          doc.nodes.GetEndOfContent(),
          K.SwNormalStartNode,
          other.GetDfltTextFormatColl(),
        ),
    ).toThrow("another document");
    expect(doc.nodes.entries()).toHaveLength(before);
  } finally {
    other.Dispose();
    doc.Dispose();
  }
});
