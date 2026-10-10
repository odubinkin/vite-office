/** @fileoverview Verifies transported complete native table geometry in mounted original attribute history. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SwDoc } from "../../source/core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../inc/fmtornt";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_FRM_SIZE } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { encodeWriterDocument, decodeWriterDocument } from "../filter/xml/writer-document-codec";
/** Requires a connected native owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted native geometry");
  return value;
}
it("transported table preserves complete native geometry and original owners through mounted history", /** Checks real primitive restore, original shell command and3history cycles. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    source = new SwDoc(),
    table = source.nodes.MakeTableNode("MountedGeometry", { width: 3000, headerRows: 0 });
  table.AddColumnWidth(3000);
  const sourceRow = source.nodes.AppendTableRow(table, 1);
  required(required(sourceRow.GetTabBoxes()[0]).GetParagraphs()[0]).SetText(
    "Original transported geometry",
  );
  const size = new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 720);
  size.SetWidthSizeType(SwFrameSize.Minimum);
  size.SetWidthPercent(65);
  size.SetHeightPercent(255);
  size.SetWidthPercentRelation(7);
  size.SetHeightPercentRelation(-2);
  const orient = new SwFormatHoriOrient(120, H.LEFT_AND_WIDTH, 7, true);
  table.GetFrameFormat().SetFormatAttr(size);
  table.GetFrameFormat().SetFormatAttr(orient);
  try {
    const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    session.docShell.ReplaceDocument(restored, session.docShell.GetDocumentState(), {
      kind: "untitled",
      name: "MountedGeometry",
    });
    const t = required(restored.GetTables()[0]),
      row = required(t.GetTabLines()[0]),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      frame = t.GetFrameFormat(),
      shell = session.view.GetWrtShell();
    shell.FocusNode(node);
    const cursor = shell.CaptureCursorState();
    restored.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    expect(frame.GetFrameSize()).toEqual(size);
    expect(frame.GetHoriOrient()).toEqual(orient);
    const changed = size.Clone();
    changed.SetWidth(4500);
    const input = new SfxItemSet(restored.GetAttrPool(), [[RES_FRM_SIZE, RES_FRM_SIZE]]);
    input.Put(changed);
    act(
      /** Changes only the native width item. @returns Nothing. */ () => {
        expect(shell.SetTableAttr(input)).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(frame.GetFrameSize()).toEqual(changed);
      expect(frame.GetHoriOrient()).toEqual(orient);
      expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
        "Original transported geometry",
      );
      act(
        /** Restores complete original size. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(frame.GetFrameSize()).toEqual(size);
      act(
        /** Replays complete original item. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(t.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
  } finally {
    cleanup();
    source.Dispose();
    session.Close();
  }
});
