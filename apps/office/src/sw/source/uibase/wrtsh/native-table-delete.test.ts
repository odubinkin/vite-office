/** @fileoverview Checks real native selected-cell deletion, structural history and section boundaries. */
import { selectTableRow } from "../../../../../test-support/table-mouse";
import { it, expect } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTableCursor } from "../../core/crsr/swcrsr";

import { SwDocShell } from "../app/docsh";
import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwUndoDelete } from "../../core/undo/undel";
import { SetAttrMode } from "../../../inc/swtypes";
import { RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { SvxTextLeftMarginItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatAutoFormat, createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { RES_CHRATR_POSTURE, RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwView } from "../uiview/view";

it("native empty append merges copied automatic items without retaining duplicate boundaries", /** Checks native zero-length CopyAttr item precedence and later insertion. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    source = doc.nodes.MakeTextNode();
  const targetItems = createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: true,
    italic: true,
    underline: false,
  });
  targetItems.ClearItem(RES_CHRATR_WEIGHT);
  const sourceItems = createWriterCharacterItemSet(doc.GetAttrPool(), {
    bold: true,
    italic: false,
    underline: false,
  });
  sourceItems.ClearItem(RES_CHRATR_POSTURE);
  const old = first.InsertItem(new SwFormatAutoFormat(targetItems), 0, 0, SetAttrMode.NOHINTADJUST);
  const copied = source.InsertItem(
    new SwFormatAutoFormat(sourceItems),
    0,
    0,
    SetAttrMode.NOHINTADJUST,
  );
  first.AppendTextNode(source);
  const hints = required(first.GetpSwpHints());
  expect(hints.Count()).toBe(1);
  expect(hints.Get(0)).not.toBe(old);
  expect(hints.Get(0)).not.toBe(copied);
  expect(copied.m_pHints).toBe(source.GetpSwpHints());
  first.InsertText("Next", 0, SwInsertFlags.EMPTYEXPAND);
  expect(first.GetTextRangeFormatState(0, 4, "bold")).toBe("on");
  expect(first.GetTextRangeFormatState(0, 4, "italic")).toBe("on");
});
it("native empty append overwrites equal empty internet hints and preserves unrelated boundaries", /** Checks native same-family zero-boundary overwrite independently of projection. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    source = doc.nodes.MakeTextNode();
  first.SetText("Body");
  const original = first.InsertItem(
    new SwFormatINetFormat({ url: "https://example.test/old" }),
    4,
    4,
    SetAttrMode.NOHINTADJUST,
  );
  const unrelated = first.InsertItem(
    new SwFormatINetFormat({ url: "https://example.test/keep" }),
    0,
    0,
    SetAttrMode.NOHINTADJUST,
  );
  source.InsertItem(
    new SwFormatINetFormat({ url: "https://example.test/new" }),
    0,
    0,
    SetAttrMode.NOHINTADJUST,
  );
  first.AppendTextNode(source);
  const hints = required(first.GetpSwpHints());
  expect(hints.Count()).toBe(2);
  expect(hints.entries()).toContain(unrelated);
  expect(hints.entries()).not.toContain(original);
  expect((hints.Get(1).format as SwFormatINetFormat).GetValue()).toBe("https://example.test/new");
  expect(first.GetText()).toBe("Body");
});
it("native hint append retains unformatted empty and nonempty sources without inventing hints", /** Exercises actual absent hint ownership in both append branches. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    empty = doc.nodes.MakeTextNode(),
    text = doc.nodes.MakeTextNode("Text");
  first.AppendTextNode(empty);
  expect(first.GetpSwpHints()).toBeUndefined();
  first.AppendTextNode(text);
  expect(first.GetText()).toBe("Text");
  expect(first.GetpSwpHints()).toBeUndefined();
});
it("native item copy retains the explicit unsupported nonempty guard and undo insertion priority", /** Keeps unported nonempty adjustment explicit and NOHINTADJUST unchanged. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]),
    item = new SwFormatINetFormat({ url: "https://example.test/copy" });
  node.SetText("Text");
  expect(
    /** Rejects unported nonempty copy before mutation. @returns Unsupported insertion. */ () =>
      node.InsertItem(item, 0, 1, SetAttrMode.IS_COPY),
  ).toThrow("without NOHINTADJUST");
  expect(
    /** Rejects unported default adjustment before mutation. @returns Unsupported insertion. */ () =>
      node.InsertItem(item, 0, 0, SetAttrMode.DEFAULT),
  ).toThrow("without NOHINTADJUST");
  node.InsertItem(item, 0, 0, SetAttrMode.NOHINTADJUST | SetAttrMode.IS_COPY);
  node.InsertItem(item, 0, 0, SetAttrMode.NOHINTADJUST | SetAttrMode.IS_COPY);
  expect(node.GetpSwpHints()?.Count()).toBe(2);
});
it("native nonempty append preserves independently formatted text on both sides", /** Protects the existing nonempty join profile while separating empty CopyAttr ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    source = doc.nodes.MakeTextNode("Right");
  first.SetText("Left");
  first.InsertItem(
    new SwFormatAutoFormat(
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: true,
        italic: false,
        underline: false,
      }),
    ),
    0,
    4,
    SetAttrMode.NOHINTADJUST,
  );
  source.InsertItem(
    new SwFormatAutoFormat(
      createWriterCharacterItemSet(doc.GetAttrPool(), {
        bold: false,
        italic: true,
        underline: false,
      }),
    ),
    0,
    5,
    SetAttrMode.NOHINTADJUST,
  );
  first.AppendTextNode(source);
  expect(first.GetText()).toBe("LeftRight");
  expect(first.GetTextRangeFormatState(0, 4, "bold")).toBe("on");
  expect(first.GetTextRangeFormatState(4, 9, "italic")).toBe("on");
  expect(first.GetpSwpHints()?.Count()).toBe(2);
});
/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native table delete owner");
  return value;
}
/** Builds actual table sections and independently formatted cell paragraphs. @param extras - Add second paragraphs. @param lists - Retain actual numbering metadata. @returns Native graph/shell/edit owners. */
function fixture(extras = true, lists = true) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (const width of [2000, 2000, 2000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Verifies native selected text deletion. @param line - Current owner. @returns Operation result. */ (
        line,
      ) => line.GetTabBoxes(),
    ),
    nodes = boxes.map(
      /** Verifies native selected text deletion. @param box - Current owner. @returns Operation result. */ (
        box,
      ) => required(box.GetParagraphs()[0]),
    );
  nodes.forEach(
    /** Verifies native selected text deletion. @param node - Current owner. @param i - Current owner. @returns Operation result. */ (
      node,
      i,
    ) => node.SetText("Cell" + i),
  );
  const tails = new Map<number, typeof body>();
  for (const i of [1, 4, 7]) {
    const node = required(nodes[i]);
    node.SetParagraphTextLeftMargin(100 + i);
    if (lists) {
      node.SetAttrListLevel(2);
      node.SetListId("list-" + i);
      doc.EnsureNumRule("Numbering", "numbered");
      node.SetNumRule("Numbering");
    }
    node.InsertItem(
      new SwFormatAutoFormat(
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: true,
          italic: false,
          underline: false,
        }),
      ),
      0,
      5,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
    if (extras) {
      const tail = doc.nodes.AppendTableCellParagraph(required(boxes[i]));
      tail.SetText("T" + i);
      tail.SetParagraphTextLeftMargin(300 + i);
      if (lists) {
        tail.SetAttrListLevel(3);
        tail.SetListId("tail-" + i);
        tail.SetNumRule("Numbering");
      }
      tail.InsertItem(
        new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: false,
            italic: true,
            underline: false,
          }),
        ),
        0,
        2,
        SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
      );
      tails.set(i, tail);
    }
  }
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "table-delete", suiteId: "writer", title: "Delete" }),
    ),
    shell = new SwView(docShell).GetWrtShell(),
    edit = new SwEditWin(shell.GetView());
  return { doc, body, table, lines, boxes, nodes, tails, docShell, shell, edit };
}
/** Selects only actual middle-column boxes. @param f - Native owners. @param reverse - Display point in the final selected cell. @returns Display owner. */
function column(f: ReturnType<typeof fixture>, reverse = false) {
  selectTableRow(f.edit, required(f.nodes[1]).GetIndex());
  const display = f.shell.getShellCursor() as SwTableCursor;
  display
    .GetPoint()
    .Assign(reverse ? required(f.tails.get(7)) : required(f.nodes[1]), reverse ? 2 : 0);
  display
    .GetMark()
    .Assign(reverse ? required(f.nodes[1]) : required(f.tails.get(7) ?? f.nodes[7]), 0);
  f.shell.NotifySelectionChanged();
  return display;
}
/** Checks literal restored cell text, paragraph hints and native list metrics. @param f - Owners. @returns Nothing. */
function restored(f: ReturnType<typeof fixture>) {
  for (const i of [1, 4, 7]) {
    const paras = required(f.boxes[i]).GetParagraphs();
    expect(
      paras.map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
    ).toEqual(["Cell" + i, "T" + i]);
    const first = required(paras[0]),
      last = required(paras[1]);
    expect(first.GetTextRangeFormatState(0, 5, "bold")).toBe("on");
    expect(last.GetTextRangeFormatState(0, 2, "italic")).toBe("on");
    expect((first.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
      100 + i,
    );
    expect((last.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()).toBe(
      300 + i,
    );
    expect(first.GetAttrListLevel()).toBe(2);
    expect(last.GetAttrListLevel()).toBe(3);
    expect(first.GetListId()).toBe("list-" + i);
    expect(last.GetListId()).toBe("tail-" + i);
    expect(first.GetNumRule()).toBe(f.doc.FindNumRulePtr("Numbering"));
    expect(last.GetNumRule()).toBe(first.GetNumRule());
  }
}
it.each(["delete", "backspace", "selection"] as const)(
  "native table %s deletes every selected cell in one reversible history unit",
  /** Verifies native selected text deletion. @param direction - Current owner. @returns Operation result. */ (
    direction,
  ) => {
    const f = fixture(),
      display = column(f),
      oldPoint = display.GetPoint().GetNode(),
      oldMark = display.GetMark().GetNode();
    expect(
      direction === "delete"
        ? f.shell.DelRight()
        : direction === "backspace"
          ? f.shell.DelLeft()
          : f.shell.DeleteSelection(),
    ).toBe(true);
    const group = f.doc.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>;
    expect(group).toBeInstanceOf(SfxListUndoAction);
    expect(group.GetActionCount()).toBe(3);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(3);
    for (const i of [1, 4, 7])
      expect(
        required(f.boxes[i])
          .GetParagraphs()
          .map(
            /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
              n,
            ) => n.GetText(),
          ),
      ).toEqual([""]);
    for (const i of [0, 2, 3, 5, 6, 8]) expect(required(f.nodes[i]).GetText()).toBe("Cell" + i);
    expect(f.table.GetTabLines()).toEqual(f.lines);
    expect(
      f.table
        .GetTabLines()
        .flatMap(
          /** Verifies native selected text deletion. @param r - Current owner. @returns Operation result. */ (
            r,
          ) => r.GetTabBoxes(),
        ),
    ).toEqual(f.boxes);
    expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
    expect(f.shell.HasBoxSelection()).toBe(false);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect(f.shell.GetCursor().IsMultiSelection()).toBe(false);
    expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.nodes[1]);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      restored(f);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(oldPoint);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(oldMark);
      expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
      expect(f.shell.Redo()).toBe(true);
      for (const i of [1, 4, 7])
        expect(
          required(f.boxes[i])
            .GetParagraphs()
            .map(
              /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
                n,
              ) => n.GetText(),
            ),
        ).toEqual([""]);
      expect(f.shell.HasBoxSelection()).toBe(false);
    }
    f.edit.InsertText("New");
    expect(required(f.nodes[1]).GetText()).toBe("New");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(f.shell.Undo()).toBe(true);
    expect(required(f.nodes[1]).GetText()).toBe("");
    expect(f.shell.Undo()).toBe(true);
    restored(f);
    f.doc.GetUndoManager().Clear();
    expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    f.shell.Close();
  },
);
it("native reversed table point exits at its own surviving cell rather than ring order", /** Verifies native selected text deletion.  @returns Operation result. */ () => {
  const f = fixture();
  column(f, true);
  expect(f.shell.DelRight()).toBe(true);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.nodes[7]);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
  expect(f.shell.Undo()).toBe(true);
  restored(f);
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.tails.get(7));
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.nodes[7]);
  f.shell.Close();
});
it("native empty selected boxes leave standard-mode caret without a content undo unit", /** Verifies native selected text deletion.  @returns Operation result. */ () => {
  const f = fixture(false, false);
  for (const i of [1, 4, 7]) required(f.nodes[i]).SetText("");
  column(f);
  expect(f.shell.DelRight()).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.shell.HasBoxSelection()).toBe(false);
  expect(f.shell.GetCursor().IsMultiSelection()).toBe(false);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.nodes[1]);
  expect(
    f.table
      .GetTabLines()
      .flatMap(
        /** Verifies native selected text deletion. @param r - Current owner. @returns Operation result. */ (
          r,
        ) => r.GetTabBoxes(),
      ),
  ).toEqual(f.boxes);
  f.shell.Close();
});
it("native one selected multi-paragraph cell keeps SwUndoDelete and table-mode undo", /** Verifies native selected text deletion.  @returns Operation result. */ () => {
  const f = fixture();
  const display = column(f);
  display.GetPoint().Assign(required(f.nodes[4]), 0);
  display.GetMark().Assign(required(f.tails.get(4)), 2);
  f.shell.NotifySelectionChanged();
  expect(f.shell.DelLeft()).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelete);
  expect(
    required(f.boxes[4])
      .GetParagraphs()
      .map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual([""]);
  expect(required(f.nodes[1]).GetText()).toBe("Cell1");
  expect(f.shell.Undo()).toBe(true);
  expect(
    required(f.boxes[4])
      .GetParagraphs()
      .map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Cell4", "T4"]);
  expect(f.shell.HasBoxSelection()).toBe(true);
  expect(f.shell.GetCursor().IsMultiSelection()).toBe(false);
  expect(f.shell.Redo()).toBe(true);
  expect(f.shell.HasBoxSelection()).toBe(false);
  f.shell.Close();
});
it.each(["delete", "backspace"] as const)(
  "native partial cross-cell %s preserves both cell boundaries",
  /** Verifies native selected text deletion. @param direction - Current owner. @returns Operation result. */ (
    direction,
  ) => {
    const f = fixture();
    f.edit.SetSelection({
      point: { nodeIndex: required(f.nodes[2]).GetIndex(), contentIndex: 3 },
      mark: { nodeIndex: required(f.nodes[1]).GetIndex(), contentIndex: 2 },
    });
    expect(direction === "delete" ? f.shell.DelRight() : f.shell.DelLeft()).toBe(true);
    expect(
      required(f.boxes[1])
        .GetParagraphs()
        .map(
          /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["Ce"]);
    expect(required(f.nodes[2]).GetText()).toBe("l2");
    expect(required(f.nodes[0]).GetText()).toBe("Cell0");
    expect(
      f.table
        .GetTabLines()
        .flatMap(
          /** Verifies native selected text deletion. @param r - Current owner. @returns Operation result. */ (
            r,
          ) => r.GetTabBoxes(),
        ),
    ).toEqual(f.boxes);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(
      direction === "delete" ? f.nodes[2] : f.nodes[1],
    );
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(direction === "delete" ? 0 : 2);
    expect(f.shell.Undo()).toBe(true);
    expect(
      required(f.boxes[1])
        .GetParagraphs()
        .map(
          /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
            n,
          ) => n.GetText(),
        ),
    ).toEqual(["Cell1", "T1"]);
    expect(required(f.nodes[2]).GetText()).toBe("Cell2");
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.nodes[2]);
    expect(f.shell.GetCursor().GetMark().GetNode()).toBe(f.nodes[1]);
    expect(f.shell.Redo()).toBe(true);
    expect(required(f.nodes[2]).GetText()).toBe("l2");
    f.shell.Close();
  },
);
it.each(["delete", "backspace"] as const)(
  "native separator-only cross-cell %s clears selection without erasing cells",
  /** Verifies native selected text deletion. @param direction - Current owner. @returns Operation result. */ (
    direction,
  ) => {
    const f = fixture(false, false);
    f.edit.SetSelection({
      point: { nodeIndex: required(f.nodes[2]).GetIndex(), contentIndex: 0 },
      mark: { nodeIndex: required(f.nodes[1]).GetIndex(), contentIndex: 5 },
    });
    expect(direction === "delete" ? f.shell.DelRight() : f.shell.DelLeft()).toBe(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.shell.GetCursor().HasMark()).toBe(false);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(
      direction === "delete" ? f.nodes[2] : f.nodes[1],
    );
    expect(required(f.nodes[1]).GetText()).toBe("Cell1");
    expect(required(f.nodes[2]).GetText()).toBe("Cell2");
    f.shell.Close();
  },
);
it("native selected cell deletion serializes surviving table structure and resumes input", /** Verifies native selected text deletion.  @returns Operation result. */ async () => {
  const f = fixture(true, false);
  column(f);
  expect(f.shell.DelRight()).toBe(true);
  f.edit.InsertText("Saved");
  const metadata = { title: "Deleted table" },
    reopened = await readOdtDocument(writeOdtDocument(f.doc, metadata), metadata),
    table = required(reopened.document.GetTables()[0]),
    boxes = table
      .GetTabLines()
      .flatMap(
        /** Verifies native selected text deletion. @param r - Current owner. @returns Operation result. */ (
          r,
        ) => r.GetTabBoxes(),
      );
  expect(table.GetTabLines()).toHaveLength(3);
  expect(table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(
    required(boxes[1])
      .GetParagraphs()
      .map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Saved"]);
  expect(
    required(boxes[4])
      .GetParagraphs()
      .map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual([""]);
  expect(
    required(boxes[0])
      .GetParagraphs()
      .map(
        /** Verifies native selected text deletion. @param n - Current owner. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Cell0"]);
  f.shell.Close();
});
