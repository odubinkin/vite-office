/** @fileoverview Verifies native default arguments through real document, frame and cursor owners. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { getWriterNumFormatKind } from "./number";
import { SwPaM, SwPosition } from "../crsr/pam";
import { isMoveLeftMargin } from "../edit/edattr";
import { SwRowFrame } from "../layout/tabfrm";
import { SwTable, SwTableLine } from "../table/swtable";
import { resolveSwLeftMarginWithNum } from "../txtnode/ndtxt-list-indent";

it("creates a first-level numbering rule when the manager level is omitted", /** Checks the direct manager default and document registration. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const rule = doc.GetDocumentListsManager().EnsureNumRule("Default level", "numbered");
    expect(doc.FindNumRulePtr("Default level")).toBe(rule);
    expect(getWriterNumFormatKind(rule.Get(0))).toBe("numbered");
  } finally {
    doc.Dispose();
  }
});

it("admits increasing and rejects decreasing a zero margin with default tab snapping", /** Checks the direct movement guard without a supplied modulus flag. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Missing initial paragraph");
  const position = new SwPosition(node);
  const cursor = new SwPaM(position);
  try {
    expect(isMoveLeftMargin(doc, cursor, true)).toBe(true);
    expect(isMoveLeftMargin(doc, cursor, false)).toBe(false);
    expect(node.GetParagraphTextLeftMargin()).toBe(0);
    expect(resolveSwLeftMarginWithNum(node)).toBe(0);
  } finally {
    cursor.Dispose();
    position.Dispose();
    doc.Dispose();
  }
});

it("retains the base frame's default preparation contract for a native row", /** Checks default preparation leaves the registered native format intact. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const line = new SwTableLine(doc.MakeTableLineFormat());
  const frame = new SwRowFrame(line);
  try {
    expect(frame.Prepare()).toBe(false);
    expect(frame.GetFormat()).toBe(line.GetFrameFormat());
  } finally {
    frame.DestroyImpl();
    line.Dispose();
    doc.Dispose();
  }
});

it("constructs a table with empty geometry when the format is omitted", /** Checks the native constructor default and independent format identity. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const owner = doc.nodes.MakeTableNode("Owner");
  const node = owner.GetTableNode();
  const table = new SwTable(node, "Default geometry");
  try {
    expect(table.GetTableNode()).toBe(node);
    expect(table.GetName()).toBe("Default geometry");
    expect(table.GetFormat()).toEqual({
      horiOrient: 6,
      align: "margins",
      headerRows: 1,
      repeatHeaderRows: true,
    });
    expect(table.GetRowsToRepeat()).toBe(0);
    expect(table.GetFrameFormat()).not.toBe(owner.GetFrameFormat());
  } finally {
    table.GetFrameFormat().DisposeModify();
    doc.Dispose();
  }
});
