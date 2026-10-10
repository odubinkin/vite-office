/** @fileoverview Verifies mounted original direct/inherited LR margins, native dialog history and real signed ODT cycles. */
import { SvxIndentValue } from "../../../editeng/inc/lrspitem";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SvxLRSpaceItem } from "../../../editeng/source/items/frmitems";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires original native owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted LR owner");
  return value;
}
it.each([false, true])(
  "mounted effective LR paint, dialog and original history inherited=%s",
  /** Checks native paint despite stale projection and actual history. @param inherited - Parent input. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "Parent");
    try {
      const table = doc.nodes.MakeTableNode(
          "NativeLRUI",
          { width: 3000, horiOrient: 0 },
          required(doc.paragraphs[0]),
        ),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original LR cell");
      shell.FocusNode(node);
      const before = new SvxLRSpaceItem(98);
      before.SetLeft(SvxIndentValue.twips(120));
      before.SetRight(SvxIndentValue.twips(240));
      let source = format;
      if (inherited) {
        source = parent;
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(98);
      }
      source.SetFormatAttr(before);
      doc.GetUndoManager().Clear();
      render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      const original = table.GetFormat.bind(table),
        spy = vi.spyOn(table, "GetFormat").mockImplementation(
          /** Returns obsolete detached LR values. @returns Stale projection. */ () => ({
            ...original(),
            marginLeft: 999,
            marginRight: 888,
          }),
        );
      try {
        act(
          /** Publishes original effective LR. @returns Nothing. */ () => {
            const item = source.GetLRSpace().Clone();
            item.SetLeft(SvxIndentValue.twips(-120));
            source.SetFormatAttr(item);
          },
        );
        expect(screen.getByRole("table", { name: "NativeLRUI" })).toHaveStyle({
          marginLeft: "-8px",
          marginRight: "16px",
        });
        fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
        expect(screen.getByRole("spinbutton", { name: "Left (cm)" })).toHaveValue(-0.21);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      } finally {
        spy.mockRestore();
      }
      const saved = source.GetLRSpace().Clone();
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.change(screen.getByRole("spinbutton", { name: "Left (cm)" }), {
        target: { value: "0.35" },
      });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      const after = format.GetLRSpace().Clone();
      expect(after.ResolveLeft()).toBe(198);
      for (let i = 0; i < 3; i++) {
        act(
          /** Undoes native original LR. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(format.GetLRSpace()).toEqual(saved);
        expect(format.GetAttrSet().GetItemIfSet(98, false) === undefined).toBe(inherited);
        act(
          /** Redoes native original LR. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(format.GetLRSpace()).toEqual(after);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original LR cell");
      }
      const signed = after.Clone();
      signed.SetLeft(SvxIndentValue.twips(-120));
      signed.SetRight(SvxIndentValue.twips(240));
      act(
        /** Publishes signed native distances for ODT. @returns Nothing. */ () => {
          format.SetFormatAttr(signed);
        },
      );
      let current = doc;
      for (let i = 0; i < 2; i++) {
        const reopen = await readOdtDocument(writeOdtDocument(current, { title: "NativeLRUI" }), {
          title: "NativeLRUI",
        });
        current = reopen.document;
        expect([
          required(current.GetTables()[0]).GetFrameFormat().GetLRSpace().ResolveLeft(),
          required(current.GetTables()[0]).GetFrameFormat().GetLRSpace().ResolveRight(),
        ]).toEqual([-120, 240]);
      }
    } finally {
      cleanup();
      session.Close();
      parent.DisposeModify();
    }
  },
);
