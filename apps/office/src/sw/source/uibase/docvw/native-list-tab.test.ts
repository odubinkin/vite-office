/** @fileoverview Checks native ordinary paragraph Tab routing and numbering ownership without upstream execution. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { createWriterNumFormat, NumDownChangesIndent } from "../../core/doc/number";
import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";

/** Requires a real fixture owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native paragraph Tab owner");
  return value;
}
/** Builds actual body, cells and persistent shell. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("body");
  const table = doc.nodes.MakeTableNode("Tab", {}, body),
    row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    shell = new SwWrtShell(
      new SwDocShell(doc, createDocument({ id: "paragraph-tab", suiteId: "writer", title: "Tab" })),
    ),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell, invalidate);
  cell.SetText("cell");
  neighbor.SetText("neighbor");
  return { doc, body, table, cell, neighbor, shell, invalidate, edit };
}
/** Assigns actual native point and mark. @param f - Owners. @param node - Point node. @param offset - Point offset. @param mark - Optional mark node. @param markOffset - Mark offset. @returns Nothing. */
function place(
  f: ReturnType<typeof fixture>,
  node: SwTextNode,
  offset = 0,
  mark?: SwTextNode,
  markOffset = 0,
): void {
  const point = new SwPosition(node, offset),
    anchor = mark === undefined ? undefined : new SwPosition(mark, markOffset);
  try {
    f.shell.SetPaM(point, anchor);
  } finally {
    point.Dispose();
    anchor?.Dispose();
  }
}
describe("native ordinary paragraph Tab", /** Registers native ownership and history contracts. @returns Nothing. */ () => {
  it("keeps missing-rule helper fallback in its native owner", /** Checks the actual shell cursor without numbering. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.body);
    expect(NumDownChangesIndent(f.shell)).toBe(true);
    f.shell.Close();
  });
  it.each(["numbered", "bullet"] as const)(
    "changes body %s levels before inserting text with atomic history",
    /** Checks list priority and original identities. @param kind - List family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture();
      place(f, f.body);
      f.shell.SetParagraphListKind(kind);
      f.body.SetAttrListLevel(2);
      const rule = f.body.GetNumRule(),
        listId = f.body.GetListId();
      f.doc.GetUndoManager().Clear();
      expect(f.edit.HandleTab()).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(3);
      expect(f.body.GetText()).toBe("body");
      expect(f.edit.HandleTab(true)).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(2);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
      expect(f.edit.Undo()).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(3);
      expect(f.edit.Undo()).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(2);
      expect(f.edit.Redo()).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(3);
      expect(f.body.GetNumRule()).toBe(rule);
      expect(f.body.GetListId()).toBe(listId);
      expect(f.cell.GetText()).toBe("cell");
      expect(f.table.GetTabLines()).toHaveLength(1);
      f.shell.Close();
    },
  );
  it.each(["same", "different", "old-type", "new-type", "maximum"] as const)(
    "uses native per-format demotion decision %s in body",
    /** Checks actual pooled format decisions. @param name - Literal profile. @returns Nothing. */ (
      name,
    ) => {
      const f = fixture(),
        level = name === "maximum" ? 9 : 0;
      place(f, f.body);
      f.shell.SetParagraphListKind("numbered");
      const rule = required(f.body.GetNumRule());
      rule.Set(
        level,
        createWriterNumFormat("numbered", "", {
          numberingType: name === "old-type" ? "arabic" : "none",
          indentAt: 120,
        }),
      );
      if (level < 9)
        rule.Set(
          level + 1,
          createWriterNumFormat("numbered", "", {
            numberingType: name === "new-type" ? "arabic" : "none",
            indentAt: name === "different" ? 720 : 120,
          }),
        );
      f.body.SetAttrListLevel(level);
      f.doc.GetUndoManager().Clear();
      expect(NumDownChangesIndent(f.shell)).toBe(name !== "same");
      expect(f.edit.HandleTab()).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(
        name === "same" || name === "maximum" ? level : level + 1,
      );
      expect(f.body.GetText()).toBe(name === "same" ? "\tbody" : "body");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(name === "maximum" ? 0 : 1);
      f.shell.Close();
    },
  );
  it.each([false, true])(
    "replaces actual selected text with literal Tab reverse=%s",
    /** Checks direction-independent native insertion and exact history. @param reverse - Moving point direction. @returns Nothing. */ (
      reverse,
    ) => {
      const f = fixture();
      place(f, f.body, reverse ? 1 : 3, f.body, reverse ? 3 : 1);
      expect(f.edit.HandleTab()).toBe(true);
      expect(f.body.GetText()).toBe("b\ty");
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
      expect(f.edit.Undo()).toBe(true);
      expect(f.body.GetText()).toBe("body");
      expect(f.edit.Redo()).toBe(true);
      expect(f.body.GetText()).toBe("b\ty");
      f.shell.Close();
    },
  );
  it.each([false, true])(
    "consumes ordinary ShiftTab without mutation marked=%s",
    /** Checks native End state retains the actual selection and history. @param marked - Whether a range exists. @returns Nothing. */ (
      marked,
    ) => {
      const f = fixture();
      place(f, f.body, 2, marked ? f.body : undefined, 1);
      expect(f.edit.HandleTab(true)).toBe(true);
      expect(f.body.GetText()).toBe("body");
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
      expect(f.shell.GetCursor().HasMark()).toBe(marked);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.invalidate).not.toHaveBeenCalled();
      f.shell.Close();
    },
  );
  it("inserts literal Tab away from list start and keeps ShiftTab consumed", /** Checks body list content rather than focus traversal or demotion. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.body);
    f.shell.SetParagraphListKind("numbered");
    f.body.SetAttrListLevel(2);
    f.doc.GetUndoManager().Clear();
    place(f, f.body, 2);
    expect(f.edit.HandleTab()).toBe(true);
    expect(f.body.GetText()).toBe("bo\tdy");
    expect(f.body.GetActualListLevel()).toBe(2);
    expect(f.edit.HandleTab(true)).toBe(true);
    expect(f.body.GetText()).toBe("bo\tdy");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    f.shell.Close();
  });
  it.each([0, 9])(
    "consumes native list level limit %s without extra history",
    /** Checks actual rejected native level change remains key ownership. @param level - Limit. @returns Nothing. */ (
      level,
    ) => {
      const f = fixture();
      place(f, f.body);
      f.shell.SetParagraphListKind("numbered");
      f.body.SetAttrListLevel(level);
      f.doc.GetUndoManager().Clear();
      expect(f.edit.HandleTab(level === 0)).toBe(true);
      expect(f.body.GetActualListLevel()).toBe(level);
      expect(f.body.GetText()).toBe("body");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      f.shell.Close();
    },
  );
  it("changes the real selected body paragraphs using native numbering history", /** Checks paragraph-range ownership and atomic undo. @returns Nothing. */ () => {
    const f = fixture(),
      other = f.doc.nodes.MakeTextNode("other");
    place(f, f.body, 0, other, 3);
    f.shell.SetParagraphListKind("numbered");
    f.doc.GetUndoManager().Clear();
    expect(f.edit.HandleTab()).toBe(true);
    expect([f.body.GetActualListLevel(), other.GetActualListLevel()]).toEqual([1, 1]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.edit.Undo()).toBe(true);
    expect([f.body.GetActualListLevel(), other.GetActualListLevel()]).toEqual([0, 0]);
    f.shell.Close();
  });
  it.each([
    ["heading-1", false, false],
    ["heading-2", true, false],
    ["heading-1", true, true],
    ["heading-10", false, true],
  ] as const)(
    "preserves explicit unsupported outline boundary %s shift=%s",
    /** Checks no fake OutlineUpDown and supported outline limits. @param style - Assigned style. @param shift - Direction. @param owned - Whether no outline operation is needed. @returns Nothing. */ (
      style,
      shift,
      owned,
    ) => {
      const f = fixture();
      place(f, f.body);
      f.shell.SetParagraphStyle(style);
      f.doc.GetUndoManager().Clear();
      expect(f.body.GetNumRule()).toBeUndefined();
      expect(f.edit.HandleTab(shift)).toBe(owned);
      expect(f.body.GetText()).toBe(owned && !shift ? "\tbody" : "body");
      expect(f.body.GetParagraphStyle()).toBe(style);
      f.shell.Close();
    },
  );
  it("uses cell traversal before assigned outline handling", /** Checks table priority does not depend on body outline support. @returns Nothing. */ () => {
    const f = fixture();
    place(f, f.cell);
    f.shell.SetParagraphStyle("heading-2");
    f.doc.GetUndoManager().Clear();
    expect(f.edit.HandleTab()).toBe(true);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.neighbor);
    expect(f.cell.GetText()).toBe("cell");
    expect(f.table.GetTabLines()).toHaveLength(1);
    f.shell.Close();
  });
});
