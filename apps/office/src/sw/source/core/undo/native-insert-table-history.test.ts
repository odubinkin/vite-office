/** @fileoverview Verifies body table insertion through actual native shell, nodes and grouped history without upstream access. */
import { nativeBoxFormat } from "../../../../test/table-box-test-helpers";
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFormatVertOrient } from "./../../../inc/fmtornt";

import { expect, it } from "vitest";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPosition } from "../crsr/pam";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
/** Creates real document, shell and untouched body owners. @param offset - Actual content position. @returns Native owners. */
function fixture(offset = 0) {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  const neighbor = doc.nodes.MakeTextNode("untouched");
  const position = new SwPosition(node, offset);
  shell.SetCursor(position);
  position.Dispose();
  return { session, doc, shell, node, neighbor };
}
const options = { mnInsMode: SwInsertTableFlags.All, mnRowsToRepeat: 1 };
it("replays inserted table, appended native row and later cell typing through one history stack", /** Verifies reconstructed table ownership remains compatible with existing native row and text actions. @returns Nothing. */ () => {
  const o = fixture(3);
  try {
    const table = required(o.shell.InsertTable(options, 2, 2)),
      last = required(
        required(required(table.GetTabLines()[1]).GetTabBoxes()[1]).GetParagraphs()[0],
      );
    o.shell.FocusNode(last);
    expect(o.shell.GoNextCell()).toBe(true);
    expect(table.GetTabLines()).toHaveLength(3);
    const appended = required(table.GetTabLines()[2]),
      cell = o.shell.GetActiveParagraph(),
      appendedFormat = appended.GetFormat(),
      appendedBoxes = [...appended.GetTabBoxes()],
      appendedBoxFormats = appendedBoxes.map(
        /** Captures complete cell values before Undo destroys their owners. @param box - Live original cell. @returns Independent format. */
        (box) => box.GetFormat(),
      );
    o.shell.Insert("fresh");
    expect(o.shell.Undo()).toBe(true);
    expect(o.shell.Undo()).toBe(true);
    expect(appended.GetRegisteredIn()).toBeUndefined();
    for (const box of appendedBoxes) expect(box.GetRegisteredIn()).toBeUndefined();
    expect(o.shell.Redo()).toBe(true);
    const currentRow = required(table.GetTabLines()[2]),
      currentCell = required(required(currentRow.GetTabBoxes()[0]).GetParagraphs()[0]);
    expect(currentRow).not.toBe(appended);
    expect(currentCell).not.toBe(cell);
    expect(currentRow.GetFormat()).toEqual(appendedFormat);
    expect(
      currentRow.GetTabBoxes().map(
        /** Reads complete newly recreated attributes. @param box - Current cell. @returns Format. */
        (box) => box.GetFormat(),
      ),
    ).toEqual(appendedBoxFormats);
    expect(o.shell.GetActiveParagraph()).toBe(currentCell);
    expect(currentCell.GetText()).toBe("");
    expect(o.shell.Redo()).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(o.shell.Undo()).toBe(true);
      expect(o.shell.Undo()).toBe(true);
      expect(o.shell.Undo()).toBe(true);
      expect(o.doc.GetTables()).toHaveLength(0);
      expect(o.doc.paragraphs).toEqual([o.node, o.neighbor]);
      expect(o.node.GetText()).toBe("abcdef");
      expect(o.shell.Redo()).toBe(true);
      expect(o.shell.Redo()).toBe(true);
      expect(o.shell.Redo()).toBe(true);
      const recreated = required(o.doc.GetTables()[0]);
      expect(recreated).not.toBe(table);
      expect(recreated.GetTabLines()).toHaveLength(3);
      expect(
        required(
          required(required(recreated.GetTabLines()[2]).GetTabBoxes()[0]).GetParagraphs()[0],
        ).GetText(),
      ).toBe("fresh");
      expect(o.shell.GetActiveParagraph().GetText()).toBe("fresh");
      expect(o.neighbor.GetText()).toBe("untouched");
    }
  } finally {
    o.session.Close();
  }
});
it.each([0, 3, 6])(
  "inserts before current body position with one native history boundary offset=%s",
  /** Checks literal body order, reconstructed table owners and live indices. @param offset - UTF16 insertion offset. @returns Nothing. */ (
    offset,
  ) => {
    const o = fixture(offset);
    try {
      const beforeCount = o.doc.nodes.Count(),
        before = new SwPosition(o.node, offset),
        inserted = required(o.shell.InsertTable(options, 2, 3));
      expect(inserted.GetFormat()).toMatchObject({
        width: 65535,
        horiOrient: HoriOrientation.FULL,
        headerRows: 1,
        repeatHeaderRows: true,
        layoutSplit: true,
      });
      expect(inserted.GetColumnWidths()).toEqual([21845, 21845, 21845]);
      const first = required(
        required(required(inserted.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
      );
      expect(first.GetTextFormatColl().id).toBe("table-heading");
      expect(first.GetParagraphAlignment()).toBe("center");
      expect(
        required(
          required(required(inserted.GetTabLines()[1]).GetTabBoxes()[0]).GetParagraphs()[0],
        ).GetTextFormatColl().id,
      ).toBe("table-contents");
      expect(o.shell.GetActiveParagraph()).toBe(first);
      expect(o.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
      const live = new SwPosition(first, 0),
        body = o.doc.nodes.getBodyContent();
      expect(
        body.map(
          /** Reads actual body sequence. @param node - Body owner. @returns Literal text or table. */
          (node) => (node instanceof SwTextNode ? node.GetText() : node.GetTable().GetName()),
        ),
      ).toEqual(
        offset === 0
          ? ["Table1", "abcdef", "untouched"]
          : ["abcdef".slice(0, offset), "Table1", "abcdef".slice(offset), "untouched"],
      );
      expect(o.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(o.shell.Undo()).toBe(true);
        expect(o.doc.nodes.Count()).toBe(beforeCount);
        expect(o.doc.paragraphs).toEqual([o.node, o.neighbor]);
        expect(o.node.GetText()).toBe("abcdef");
        expect(o.shell.GetActiveParagraph()).toBe(o.node);
        expect(o.shell.GetCursor().GetPoint().GetContentIndex()).toBe(offset);
        expect(o.neighbor.GetText()).toBe("untouched");
        expect(live.GetNode()).toBe(o.node);
        expect(o.shell.Redo()).toBe(true);
        expect(o.doc.GetTables()[0]).not.toBe(inserted);
        expect(required(o.doc.GetTables()[0]).GetName()).toBe("Table1");
        expect(o.shell.GetActiveParagraph()).toBe(
          required(
            required(required(o.doc.GetTables()[0]).GetTabLines()[0]).GetTabBoxes()[0],
          ).GetParagraphs()[0],
        );
      }
      live.Dispose();
      before.Dispose();
    } finally {
      o.session.Close();
    }
  },
);
it.each([
  [SwInsertTableFlags.NONE, 4, 0, false, "table-contents"],
  [SwInsertTableFlags.Headline, 0, 0, false, "table-heading"],
  [SwInsertTableFlags.HeadlineNoBorder, 2, 2, true, "table-heading"],
  [SwInsertTableFlags.All, 1, 1, true, "table-contents"],
] as const)(
  "keeps native header, repeat, split and single-row default-border policy mode=%s repeat=%s",
  /** Verifies literal independent native flags and stylesheet ownership. @param mode - Flags. @param repeat - Repeat request. @param headers - Displayed header count. @param split - Split layout. @param style - First paragraph style. @returns Nothing. */ (
    mode,
    repeat,
    headers,
    split,
    style,
  ) => {
    const doc = new SwDoc(),
      position = new SwPosition(required(doc.paragraphs[0]), 0);
    const table = doc.InsertTable({ mnInsMode: mode, mnRowsToRepeat: repeat }, position, 1, 2);
    expect(table.GetFormat()).toMatchObject({
      width: 65534,
      headerRows: headers,
      repeatHeaderRows: repeat !== 0 && mode !== 0,
      layoutSplit: split,
    });
    expect(table.GetColumnWidths()).toEqual([32767, 32767]);
    expect(
      required(
        required(required(table.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
      ).GetTextFormatColl().id,
    ).toBe(style);
    expect(required(required(table.GetTabLines()[0]).GetTabBoxes()[0]).GetFormat()).toEqual({
      ...nativeBoxFormat({
        padding: mode === SwInsertTableFlags.All ? 55 : 0,
        border: mode === SwInsertTableFlags.All ? "0.5pt solid #000000" : "none",
      }),
      frameSize: new SwFormatFrameSize(undefined, 32767, 0),
    });
    position.Dispose();
    doc.Dispose();
  },
);
it("uses first free native names on collisions and owns dialog construction values across redo", /** Checks model-side naming and immutable history payload. @returns Nothing. */ () => {
  const o = fixture(),
    original = o.doc.nodes.MakeTableNode("Table1");
  const occupied = o.doc.nodes.MakeTableNode("Table3"),
    box = nativeBoxFormat({
      padding: 123,
      border: "none",
      vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
    }),
    flags = { mnInsMode: SwInsertTableFlags.Headline, mnRowsToRepeat: 0 };
  try {
    const table = required(o.shell.InsertTable(flags, 2, 1, "Table1", box));
    expect(table.GetName()).toBe("Table2");
    flags.mnRowsToRepeat = 2;
    required(box.box).SetAllDistances(999);
    expect(o.shell.Undo()).toBe(true);
    expect(o.shell.Redo()).toBe(true);
    const recreated = required(o.doc.GetTables()[0]);
    expect(recreated.GetName()).toBe("Table2");
    expect(recreated.GetFormat()).toMatchObject({
      headerRows: 0,
      repeatHeaderRows: false,
      layoutSplit: false,
    });
    expect(required(required(recreated.GetTabLines()[0]).GetTabBoxes()[0]).GetFormat()).toEqual({
      ...nativeBoxFormat({
        padding: 123,
        border: "none",
        vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
      }),
      frameSize: new SwFormatFrameSize(undefined, 65535, 0),
    });
    expect(o.doc.GetTables()).toContain(original);
    expect(o.doc.GetTables()).toContain(occupied);
  } finally {
    o.session.Close();
  }
});
it.each([
  [0, 1],
  [1, 0],
  [-1, 1],
  [1, -1],
  [1.5, 1],
  [1, 1.5],
  [65536, 1],
  [1, 65536],
])(
  "rejects invalid dimensions without graph or undo mutation rows=%s columns=%s",
  /** Verifies both document and shell admission before mutation. @param rows - Invalid rows. @param columns - Invalid columns. @returns Nothing. */ (
    rows,
    columns,
  ) => {
    const o = fixture();
    try {
      const count = o.doc.nodes.Count(),
        position = new SwPosition(o.node, 0);
      expect(o.shell.InsertTable(options, rows, columns)).toBeUndefined();
      expect(
        /** Checks rejected native input before mutation. @returns Nothing. */ () =>
          o.doc.InsertTable(options, position, rows, columns),
      ).toThrow("positive unsigned table dimensions");
      expect(o.doc.nodes.Count()).toBe(count);
      expect(o.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      position.Dispose();
    } finally {
      o.session.Close();
    }
  },
);
it("does not treat selected text or nested table insertion as implemented", /** Preserves unsupported native contexts without silent partial graph changes. @returns Nothing. */ () => {
  const o = fixture();
  try {
    const cursor = o.shell.GetCursor();
    cursor.SetMark();
    cursor.GetPoint().Assign(o.node, 3);
    expect(o.shell.InsertTable(options, 2, 2)).toBeUndefined();
    cursor.GetPoint().Assign(o.node, 0);
    expect(required(o.shell.InsertTable(options, 1, 1, "Explicit")).GetName()).toBe("Explicit");
    expect(o.shell.InsertTable(options, 2, 2)).toBeUndefined();
    const position = new SwPosition(o.shell.GetActiveParagraph(), 0);
    expect(
      /** Checks rejected native input before mutation. @returns Nothing. */ () =>
        o.doc.nodes.InsertTable(o.shell.GetActiveParagraph(), "Nested", {}),
    ).toThrow("connected body paragraph");
    expect(
      /** Checks rejected native input before mutation. @returns Nothing. */ () =>
        o.doc.InsertTable(options, position, 2, 2),
    ).toThrow("positive unsigned table dimensions");
    position.Dispose();
    cursor.GetPoint().Assign(required(o.doc.GetTables()[0]).GetTableNode(), 0);
    expect(o.shell.InsertTable(options, 2, 2)).toBeUndefined();
    const nontext = new SwPosition(required(o.doc.GetTables()[0]).GetTableNode(), 0);
    expect(
      /** Checks rejected native input before mutation. @returns Nothing. */ () =>
        o.doc.InsertTable(options, nontext, 2, 2),
    ).toThrow("positive unsigned table dimensions");
    nontext.Dispose();
    const tailTable = o.doc.nodes.MakeTableNode("Tail");
    expect(
      /** Checks rejected native input before mutation. @returns Nothing. */ () =>
        o.doc.nodes.DeleteTable(tailTable.GetTableNode()),
    ).toThrow("following text");
  } finally {
    o.session.Close();
  }
});

/** Requires an actual native owner. @param value - Optional owner. @returns Connected owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native table owner");
  return value;
}
