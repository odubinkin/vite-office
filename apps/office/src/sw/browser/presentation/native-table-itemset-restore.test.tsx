/** @fileoverview Verifies mounted native table attribute history paints original spacing without scalar replay. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { SfxItemSet } from "../../../svl/source/items/itemset";
/** Requires an original mounted owner. @param value - Candidate. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted restore owner");
  return value;
}
it.each([false, true])(
  "mounted Undo and Redo paint native spacing without scalar replay inherited=%s",
  /** Checks painted native attributes and three actual history cycles. @param inherited - Parent context. @returns Nothing. */ (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "MountedRestoreParent");
    try {
      const table = doc.nodes.MakeTableNode(
          "NativeRestoreUI",
          { width: 6000 },
          required(doc.paragraphs[0]),
        ),
        format = table.GetFrameFormat();
      table.AddColumnWidth(6000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original mounted list");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      const before = new SvxULSpaceItem(120, 240, 99, true);
      if (inherited) {
        parent.SetFormatAttr(before);
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(99);
      } else format.SetFormatAttr(before);
      const cursor = shell.CaptureCursorState(),
        list = node.GetListId(),
        nodes = [...doc.nodes.entries()];
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      expect(screen.getByRole("table", { name: "NativeRestoreUI" })).toHaveStyle({
        marginTop: "8px",
        marginBottom: "16px",
      });
      const replay = vi.spyOn(table, "SetFormat"),
        input = new SfxItemSet(doc.GetAttrPool(), [[99, 99]]);
      input.Put(new SvxULSpaceItem(360, 480, 99));
      act(
        /** Applies original native dialog attributes to the mounted view. @returns Nothing. */ () => {
          expect(shell.SetTableAttr(input)).toBe(true);
        },
      );
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores native direct-item state and invalidates the original painted owner. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(screen.getByRole("table", { name: "NativeRestoreUI" })).toHaveStyle({
          marginTop: "8px",
          marginBottom: "16px",
        });
        expect(format.GetULSpace()).toEqual(before);
        expect(format.GetAttrSet().GetItemIfSet(99, false) === undefined).toBe(inherited);
        act(
          /** Replays accepted native direct items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(screen.getByRole("table", { name: "NativeRestoreUI" })).toHaveStyle({
          marginTop: "24px",
          marginBottom: "32px",
        });
        expect(
          screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
        ).toHaveTextContent("Original mounted list");
        expect(table.GetFrameFormat()).toBe(format);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetListId()).toBe(list);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
      }
      expect(replay).not.toHaveBeenCalled();
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(input.Get(99)).toEqual(new SvxULSpaceItem(360, 480, 99));
      if (inherited) expect(parent.GetULSpace()).toEqual(before);
    } finally {
      cleanup();
      vi.restoreAllMocks();
      session.Close();
      parent.DisposeModify();
    }
  },
);
