/** @fileoverview Verifies native format inheritance drives mounted Writer style and cell rendering without document model bridges. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import { RES_CHRATR_FONTSIZE } from "../../inc/hintids";

it("original paragraph style parent changes invalidate native bindings and mounted computed font without a document hint", /** Checks root fallback, rejected cycles, actual text and unchanged model revision. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const root = doc.GetDfltTextFormatColl(),
      parent = doc.MakeTextFormatColl("Large native parent", root),
      child = doc.MakeTextFormatColl("Native child", root),
      node = doc.paragraphs[0];
    if (!node) throw Error("Missing original style node");
    node.ChgFormatColl(child);
    node.SetText("Original style text");
    parent.SetFormatAttr(new SvxFontHeightItem(440, RES_CHRATR_FONTSIZE));
    render(<WriterWorkbench isActive view={session.view} />);
    const model = vi.spyOn(doc, "NotifyModelChange"),
      revision = doc.GetDocumentStateManager().GetModelRevision();
    act(
      /** Changes the original native collection parent. @returns Nothing. */ () => {
        expect(child.SetDerivedFrom(parent)).toBe(true);
      },
    );
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(22);
    expect(screen.getByText("Original style text")).toBeVisible();
    expect(model).not.toHaveBeenCalled();
    act(
      /** Rejects an inherited cycle and restores the actual default root. @returns Nothing. */ () => {
        expect(parent.SetDerivedFrom(child)).toBe(false);
        expect(child.SetDerivedFrom()).toBe(true);
      },
    );
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(12);
    expect(node.GetTextFormatColl()).toBe(child);
    expect(node.GetText()).toBe("Original style text");
    expect(model).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});

it("mounted original cell inheritance updates through native format hints and retained root subscriptions", /** Checks real main table rendering and original item-set ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Native change UI", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = row.GetTabBoxes()[0],
      node = box?.GetParagraphs()[0];
    if (!box || !node) throw Error("Missing original mounted cell");
    node.SetText("Native original cell");
    const format = box.GetFrameFormat(),
      set = format.GetAttrSet(),
      parent = doc.MakeTableBoxFormat();
    parent.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    render(<WriterWorkbench isActive view={session.view} />);
    const editor = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      cell = editor.closest(":is(td,th)"),
      model = vi.spyOn(doc, "NotifyModelChange");
    act(
      /** Accepts actual parent inheritance through the original native notifier. @returns Nothing. */ () => {
        expect(format.SetDerivedFrom(parent)).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    act(
      /** Returns original cell inheritance to the current root. @returns Nothing. */ () => {
        expect(format.SetDerivedFrom()).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    expect(model).not.toHaveBeenCalled();
    expect(format.GetAttrSet()).toBe(set);
    expect(set.GetParent()).toBe(doc.GetDfltFrameFormat().GetAttrSet());
    expect(box.GetFrameFormat()).toBe(format);
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(node.GetText()).toBe("Native original cell");
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
