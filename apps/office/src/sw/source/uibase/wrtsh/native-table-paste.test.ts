/** @fileoverview Verifies native single-paragraph clipboard reads over actual selected table ranges. */
import { selectTableRow } from "../../../../../test-support/table-mouse";
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterReadFragmentAction } from "../../filter/basflt/shellio";
import { createWriterCollapsedCursorState } from "../../core/undo/undobj";
import { createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import type { WriterPasteDocument } from "../dochdl/swdtflvr";

/** Requires an actual owner. @param value - Owner. @returns Defined owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native paste owner");
  return value;
}
/** Creates native noncontiguous selected boxes with retained earlier paragraphs. @param reverse - Selection direction. @param empty - Empty insertion nodes. @returns Native owners. */
function fixture(reverse: boolean, empty: boolean) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (const width of [2000, 2000, 2000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const lines = [...table.GetTabLines()];
  const boxes = lines.flatMap(
    /** Exercises native clipboard ownership and history. @param line - Native test input. @returns Test result. */ (
      line,
    ) => line.GetTabBoxes(),
  );
  const nodes = boxes.map(
    /** Exercises native clipboard ownership and history. @param box - Native test input. @param i - Native test input. @returns Test result. */ (
      box,
      i,
    ) => {
      const node = required(box.GetParagraphs()[0]);
      node.SetText("Cell" + i);
      return node;
    },
  );
  const tails = [1, 4, 7].map(
    /** Exercises native clipboard ownership and history. @param i - Native test input. @returns Test result. */ (
      i,
    ) => {
      const tail = doc.nodes.AppendTableCellParagraph(required(boxes[i]));
      tail.SetText(empty ? "" : "Tail" + i);
      tail.SetParagraphTextLeftMargin(321 + i);
      return tail;
    },
  );
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "table-paste", suiteId: "writer", title: "Paste" })),
  );
  selectTableRow(new SwEditWin(shell), required(nodes[1]).GetIndex());
  const display = shell.getShellCursor() as SwTableCursor;
  display
    .GetPoint()
    .Assign(
      reverse ? required(tails[2]) : required(nodes[1]),
      reverse ? required(tails[2]).Len() : 0,
    );
  display.GetMark().Assign(reverse ? required(nodes[1]) : required(tails[2]), 0);
  shell.NotifySelectionChanged();
  return { doc, body, table, lines, boxes, nodes, tails, shell };
}
/** Creates an explicit native fragment without UI runs. @param f - Native owners. @param text - Clipboard text. @returns Native transfer. */
function paste(f: ReturnType<typeof fixture>, text: string): WriterPasteDocument {
  return {
    isBlock: false,
    paragraphs: [
      {
        fragment: f.body.CreateTextFragmentFromText(
          text,
          createWriterCharacterItemSet(f.doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        ),
        listKind: "none",
        listLevel: 0,
      },
    ],
  };
}
for (const reverse of [false, true])
  for (const empty of [false, true]) {
    it(
      "native clipboard preserves selected cell content and repeated history " +
        reverse +
        " " +
        empty,
      /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
        const f = fixture(reverse, empty),
          original = f.shell.CaptureCursorState();
        const ring = [...f.shell.GetCursor().GetRingContainer()];
        expect(ring).toHaveLength(3);
        expect(
          ring.map(
            /** Exercises native clipboard ownership and history. @param range - Native test input. @returns Test result. */ (
              range,
            ) => range.GetPoint().GetNode(),
          ),
        ).toEqual(f.tails);
        expect(f.shell.PasteAtCursor(paste(f, "X"))).toBe(true);
        expect(
          f.tails.map(
            /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
              node,
            ) => node.GetText(),
          ),
        ).toEqual(
          [1, 4, 7].map(
            /** Exercises native clipboard ownership and history. @param i - Native test input. @returns Test result. */ (
              i,
            ) => (empty ? "" : "Tail" + i) + "X",
          ),
        );
        expect(
          f.nodes.map(
            /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
              node,
            ) => node.GetText(),
          ),
        ).toEqual(
          Array.from(
            { length: 9 },
            /** Exercises native clipboard ownership and history. @param _ - Native test input. @param i - Native test input. @returns Test result. */ (
              _,
              i,
            ) => "Cell" + i,
          ),
        );
        expect(f.body.GetText()).toBe("Body");
        expect(f.table.GetTabLines()).toEqual(f.lines);
        expect(
          f.lines.flatMap(
            /** Exercises native clipboard ownership and history. @param line - Native test input. @returns Test result. */ (
              line,
            ) => line.GetTabBoxes(),
          ),
        ).toEqual(f.boxes);
        expect(f.shell.HasBoxSelection()).toBe(true);
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(f.shell.Undo()).toBe(true);
          expect(
            f.tails.map(
              /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
                node,
              ) => node.GetText(),
            ),
          ).toEqual(
            [1, 4, 7].map(
              /** Exercises native clipboard ownership and history. @param i - Native test input. @returns Test result. */ (
                i,
              ) => (empty ? "" : "Tail" + i),
            ),
          );
          expect(f.shell.HasBoxSelection()).toBe(true);
          expect(f.shell.CaptureCursorState().point).toEqual(original.point);
          expect(f.shell.CaptureCursorState().mark).toEqual(original.mark);
          expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
          expect(f.shell.Redo()).toBe(true);
          expect(
            f.tails.map(
              /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
                node,
              ) => node.GetText(),
            ),
          ).toEqual(
            [1, 4, 7].map(
              /** Exercises native clipboard ownership and history. @param i - Native test input. @returns Test result. */ (
                i,
              ) => (empty ? "" : "Tail" + i) + "X",
            ),
          );
          expect(
            f.tails.map(
              /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
                node,
              ) => node.GetTextRangeFormatState(node.Len() - 1, node.Len(), "bold"),
            ),
          ).toEqual(["on", "on", "on"]);
          expect(f.shell.HasBoxSelection()).toBe(true);
        }
      },
    );
  }
it("native clipboard empty text retains selected cells without history", /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
  const f = fixture(false, false);
  expect(f.shell.PasteAtCursor(paste(f, ""))).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.shell.HasBoxSelection()).toBe(true);
  expect(
    f.tails.map(
      /** Exercises native clipboard ownership and history. @param node - Native test input. @returns Test result. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["Tail1", "Tail4", "Tail7"]);
});
it("native clipboard clones formatted fragments independently into each selected box", /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
  const f = fixture(false, false),
    transfer = paste(f, "Link"),
    fragment = required(transfer.paragraphs[0]).fragment;
  fragment.hints.Insert(
    f.body
      .InsertItem(
        new SwFormatINetFormat({ url: "https://example.test/paste" }),
        0,
        4,
        SetAttrMode.NOHINTADJUST,
      )
      .clone(),
  );
  expect(f.shell.PasteAtCursor(transfer)).toBe(true);
  const left = required(f.tails[0]),
    middle = required(f.tails[1]);
  expect(left.GetTextRangeFormatState(5, 9, "bold")).toBe("on");
  expect(left.GetpSwpHints()).not.toBe(middle.GetpSwpHints());
  expect(left.GetpSwpHints()).not.toBe(fragment.hints);
  expect(f.shell.Undo()).toBe(true);
  expect(left.GetText()).toBe("Tail1");
  expect(f.shell.Redo()).toBe(true);
  expect(left.GetText()).toBe("Tail1Link");
});
it("native read handles one unmarked cursor without synthesizing a mark", /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
  const f = fixture(false, false),
    node = f.body,
    point = new SwPosition(node, 4),
    cursor = new SwPaM(point);
  const before = createWriterCollapsedCursorState(node, 4, f.shell.GetPendingCharacterItems());
  const action = required(
    createWriterReadFragmentAction(cursor, required(paste(f, "Z").paragraphs[0]).fragment, before),
  );
  action.RedoWithContext({
    GetDoc: /** Exercises native clipboard ownership and history. @returns Test result. */ () =>
      f.doc,
    RestoreCursor:
      /** Exercises native clipboard ownership and history. @returns Test result. */ () => {},
  });
  expect(node.GetText()).toBe("BodyZ");
  action.UndoWithContext({
    GetDoc: /** Exercises native clipboard ownership and history. @returns Test result. */ () =>
      f.doc,
    RestoreCursor:
      /** Exercises native clipboard ownership and history. @returns Test result. */ () => {},
  });
  expect(node.GetText()).toBe("Body");
  cursor.Dispose();
  point.Dispose();
});
