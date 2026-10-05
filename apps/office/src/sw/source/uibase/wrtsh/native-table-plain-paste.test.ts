/** @fileoverview Checks native ASCII cell-ring import, retained inserted nodes and SwUndoInsDoc history. */
import { expect, it, afterEach } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTableCursor } from "../../core/crsr/swcrsr";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import { SwEditWin } from "../docvw/edtwin";
import { SwTransferable } from "../dochdl/swdtflvr";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterTextRuns } from "../../filter/basflt/writer-transfer";
import { prepareWriterAsciiParagraphs } from "../../filter/ascii/parasc";
import { createWriterReadTextOperation } from "../../filter/basflt/shellio";
import { SwUndoInsDoc, SwUndoInserts } from "../../core/undo/untblk";
import { createWriterCollapsedCursorState, type SwUndoCursorState } from "../../core/undo/undobj";
import {
  SwFormatAutoFormat,
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
} from "../../core/txtnode/txatbase";
import { SetAttrMode } from "../../../inc/swtypes";
import { RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { SvxTextLeftMarginItem } from "../../../../editeng/source/items/frmitems";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { SwTextAttrEnd } from "../../core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
const shells: SwWrtShell[] = [];
it("native empty end split preserves expanding AUTO items and removes closed hints", /** Checks native empty suffix attributes. @returns Nothing. */ () => {
  for (const text of ["", "AB"])
    for (const dontMove of [false, true]) {
      const doc = new SwDoc(),
        node = required(doc.paragraphs[0]);
      node.SetText(text);
      const attr = node.InsertItem(
        new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        ),
        0,
        text.length,
        SetAttrMode.NOHINTADJUST,
      );
      required(attr).dontMoveAttr = dontMove;
      const suffix = node.SplitContent(node.Len());
      expect(suffix.Len()).toBe(0);
      expect(
        projectWriterCharacterAttributes(
          dontMove
            ? (required(suffix.GetpSwpHints()).Get(0).format as SwFormatAutoFormat).GetStyleHandle()
            : suffix.GetCharacterItemsAt(0),
        ).bold,
      ).toBe(true);
      expect(suffix.GetpSwpHints()?.Count() ?? 0).toBe(dontMove ? 1 : 0);
      expect(suffix.GetpSwpHints()?.Get(0).IsDontMoveAttr()).toBe(dontMove ? true : undefined);
      const next = suffix.SplitContent(0);
      next.InsertText("C", 0, SwInsertFlags.EMPTYEXPAND);
      expect(projectWriterCharacterAttributes(next.GetCharacterItemsAt(0)).bold).toBe(true);
    }
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("AB");
  const item = new SwFormatAutoFormat(
    createWriterCharacterItemSet(doc.GetAttrPool(), {
      bold: true,
      italic: false,
      underline: false,
    }),
  );
  const earlier = new SwTextAttrEnd(
      new SwFormatAutoFormat(
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: false,
          italic: true,
          underline: false,
        }),
      ),
      0,
      1,
    ),
    closed = new SwTextAttrEnd(item, 1, 2);
  closed.SetDontExpand(true);
  node.SetTextHints(new SwpHints(doc.GetAttrPool(), [earlier, closed]));
  const suffix = node.SplitContent(2);
  expect(projectWriterCharacterAttributes(suffix.GetCharacterItemsAt(0)).bold).toBe(false);
  expect(suffix.GetpSwpHints()).toBeUndefined();
});
it("native split retains nonend fragments unformatted suffixes and expanding nonAUTO hint ownership", /** Checks split hint boundaries. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("AB");
  node.ToggleTextRangeFormat(0, 2, "bold");
  const suffix = node.SplitContent(1);
  expect(suffix.GetText()).toBe("B");
  expect(projectWriterCharacterAttributes(suffix.GetCharacterItemsAt(0)).bold).toBe(true);
  const plain = required(new SwDoc().paragraphs[0]);
  expect(plain.SplitContent(0).GetpSwpHints()).toBeUndefined();
  const generic = required(new SwDoc().paragraphs[0]);
  generic.SetText("X");
  const link = new SwTextAttrEnd(new SwFormatINetFormat({ url: "https://example.test" }), 0, 1);
  generic.SetTextHints(new SwpHints(generic.GetDoc().GetAttrPool(), [link]));
  const linkSuffix = generic.SplitContent(1);
  expect(required(linkSuffix.GetpSwpHints()).Get(0).Which()).toBe(link.Which());
  expect(required(linkSuffix.GetpSwpHints()).Get(0)).not.toBe(link);
  expect(required(linkSuffix.GetpSwpHints()).Get(0).GetStart()).toBe(0);
});
afterEach(
  /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires a native owner. @param value - Owner. @returns Defined owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing ASCII import owner");
  return value;
}
/** Creates a real selected column with original formatted/numbered tail paragraphs. @param reverse - Display endpoint direction. @param lists - Registered target numbering. @returns Native owners. */
function fixture(reverse = false, lists = true) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Body");
  const table = doc.nodes.MakeTableNode("Grid", {}, body);
  for (const width of [2000, 2000, 2000]) table.AddColumnWidth(width);
  for (let row = 0; row < 3; row++) doc.nodes.AppendTableRow(table, 3);
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Coordinates native ASCII insertion and retained history. @param line - Native operation input. @returns Operation result. */ (
        line,
      ) => line.GetTabBoxes(),
    ),
    nodes = boxes.map(
      /** Coordinates native ASCII insertion and retained history. @param box - Native operation input. @param i - Native operation input. @returns Operation result. */ (
        box,
        i,
      ) => {
        const node = required(box.GetParagraphs()[0]);
        node.SetText("Cell" + i);
        return node;
      },
    );
  const tails = [1, 4, 7].map(
    /** Coordinates native ASCII insertion and retained history. @param i - Native operation input. @returns Operation result. */ (
      i,
    ) => {
      const tail = doc.nodes.AppendTableCellParagraph(required(boxes[i]));
      tail.SetText("Tail" + i);
      tail.SetParagraphTextLeftMargin(321 + i);
      if (lists) {
        doc.EnsureNumRule("Native", "numbered");
        tail.SetNumRule("Native");
        tail.SetListId("native-" + i);
        tail.SetAttrListLevel(2);
      }
      tail.InsertItem(
        new SwFormatAutoFormat(
          createWriterCharacterItemSet(doc.GetAttrPool(), {
            bold: true,
            italic: false,
            underline: false,
          }),
        ),
        0,
        5,
        SetAttrMode.NOHINTADJUST,
      );
      return tail;
    },
  );
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "table-ascii", suiteId: "writer", title: "ASCII" })),
  );
  shells.push(shell);
  new SwEditWin(shell).SelectTableRow(required(nodes[1]).GetIndex());
  const display = shell.getShellCursor() as SwTableCursor;
  display.GetPoint().Assign(reverse ? required(tails[2]) : required(nodes[1]), reverse ? 5 : 0);
  display.GetMark().Assign(reverse ? required(nodes[1]) : required(tails[2]), 0);
  shell.NotifySelectionChanged();
  return { doc, body, table, lines, boxes, nodes, tails, shell };
}
/** Creates a browser-compatible plain format transfer. @param text - Plain text. @returns Format-owned transfer. */
function transfer(text: string) {
  return {
    source: "plain-text" as const,
    isBlock: text.includes("\n"),
    paragraphs: text
      .split("\n")
      .map(
        /** Coordinates native ASCII insertion and retained history. @param line - Native operation input. @returns Operation result. */ (
          line,
        ) => ({ listKind: "none" as const, listLevel: 0, runs: createWriterTextRuns(line) }),
      ),
  };
}
for (const reverse of [false, true])
  for (const separator of ["\n", "\r\n", "\r"]) {
    it(
      "native ASCII selected column preserves inherited content and history " +
        reverse +
        " " +
        JSON.stringify(separator),
      /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
        const f = fixture(reverse),
          before = f.shell.CaptureCursorState(),
          items = f.tails.map(
            /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
              node,
            ) => required(node.GetpSwAttrSet()).Clone(),
          );
        expect(f.shell.PastePlainTextAtCursor("A" + separator + separator + "B" + separator)).toBe(
          true,
        );
        const inserted = f.boxes
          .filter(
            /** Coordinates native ASCII insertion and retained history. @param _ - Native operation input. @param i - Native operation input. @returns Operation result. */ (
              _,
              i,
            ) => [1, 4, 7].includes(i),
          )
          .map(
            /** Coordinates native ASCII insertion and retained history. @param box - Native operation input. @returns Operation result. */ (
              box,
            ) => [...box.GetParagraphs()],
          );
        for (const [i, box] of [1, 4, 7].entries()) {
          const paragraphs = required(f.boxes[box]).GetParagraphs(),
            tail = required(f.tails[i]);
          expect(
            paragraphs.map(
              /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
                node,
              ) => node.GetText(),
            ),
          ).toEqual(["Cell" + box, "Tail" + box + "A", "", "B"]);
          expect(tail.GetTextRangeFormatState(5, 6, "bold")).toBe("on");
          expect(required(paragraphs[3]).GetTextRangeFormatState(0, 1, "bold")).toBe("on");
          expect(tail.GetListId()).toBe("native-" + box);
          expect(tail.GetAttrListLevel()).toBe(2);
          expect(
            (
              tail.GetSwAttrSet().Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem
            ).ResolveTextLeft(),
          ).toBe(321 + box);
          expect(required(paragraphs[3]).GetListKind()).toBe("numbered");
        }
        expect(
          f.nodes.map(
            /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
              node,
            ) => node.GetText(),
          ),
        ).toEqual(
          Array.from(
            { length: 9 },
            /** Coordinates native ASCII insertion and retained history. @param _ - Native operation input. @param i - Native operation input. @returns Operation result. */ (
              _,
              i,
            ) => "Cell" + i,
          ),
        );
        expect(f.table.GetTabLines()).toEqual(f.lines);
        expect(
          f.lines.flatMap(
            /** Coordinates native ASCII insertion and retained history. @param line - Native operation input. @returns Operation result. */ (
              line,
            ) => line.GetTabBoxes(),
          ),
        ).toEqual(f.boxes);
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
        expect(f.doc.GetUndoManager().GetHistoryPayloadSize()).toBeGreaterThan(9);
        const after = f.shell.CaptureCursorState();
        if (reverse) expect(after.point.node).toBe(required(required(inserted[2])[3]));
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(f.shell.Undo()).toBe(true);
          expect(f.shell.CaptureCursorState().point).toEqual(before.point);
          expect(f.shell.CaptureCursorState().mark).toEqual(before.mark);
          expect(f.shell.HasBoxSelection()).toBe(true);
          expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(3);
          for (const [i, box] of [1, 4, 7].entries()) {
            expect(
              required(f.boxes[box])
                .GetParagraphs()
                .map(
                  /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
                    node,
                  ) => node.GetText(),
                ),
            ).toEqual(["Cell" + box, "Tail" + box]);
            expect(required(f.tails[i]).GetSwAttrSet().Equals(required(items[i]), true)).toBe(true);
            expect(required(f.tails[i]).GetTextRangeFormatState(0, 5, "bold")).toBe("on");
          }
          expect(f.shell.Redo()).toBe(true);
          expect(f.shell.CaptureCursorState().point).toEqual(after.point);
          expect(f.shell.CaptureCursorState().mark).toEqual(after.mark);
          for (const [i, box] of [1, 4, 7].entries())
            expect(required(f.boxes[box]).GetParagraphs()).toEqual(required(inserted[i]));
          expect(f.shell.HasBoxSelection()).toBe(true);
        }
        f.doc.GetUndoManager().Clear();
        expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
      },
    );
  }
it("native plain format transfer inherits text attributes without projected fragment overrides", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  const f = fixture();
  expect(new SwTransferable(f.shell).Paste(transfer("X"))).toBe(true);
  expect(
    f.tails.map(
      /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["Tail1X", "Tail4X", "Tail7X"]);
  expect(
    f.tails.map(
      /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
        node,
      ) => node.GetTextRangeFormatState(5, 6, "bold"),
    ),
  ).toEqual(["on", "on", "on"]);
  expect(
    f.tails.map(
      /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
        node,
      ) => node.GetListKind(),
    ),
  ).toEqual(["numbered", "numbered", "numbered"]);
  expect(f.shell.Undo()).toBe(true);
  expect(
    f.tails.map(
      /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["Tail1", "Tail4", "Tail7"]);
});
it.each(["", "\n", "\x1a"])(
  "native empty ASCII import %j creates no content history",
  /** Coordinates native ASCII insertion and retained history. @param text - Native operation input. @returns Operation result. */ (
    text,
  ) => {
    const f = fixture();
    expect(f.shell.PastePlainTextAtCursor(text)).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
    expect(f.shell.HasBoxSelection()).toBe(true);
    expect(
      f.tails.map(
        /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["Tail1", "Tail4", "Tail7"]);
  },
);
it("native ASCII normalizes separators, blank paragraphs and terminal control markers", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  expect(prepareWriterAsciiParagraphs("a\r\nb\r\nc\r")).toEqual(["a", "b", "c"]);
  expect(prepareWriterAsciiParagraphs("\n\n")).toEqual(["", ""]);
  expect(prepareWriterAsciiParagraphs("a\n\x1a")).toEqual(["a", ""]);
  expect(prepareWriterAsciiParagraphs("a\0\t\x01\x1ab\x1a")).toEqual(["a#\t##b"]);
});
it("native ASCII wraps at the source word-space and hard paragraph limits", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  expect(prepareWriterAsciiParagraphs("a".repeat(249900) + " tail")).toEqual([
    "a".repeat(249900),
    " tail",
  ]);
  expect(prepareWriterAsciiParagraphs("a".repeat(250000))).toEqual(["a".repeat(249999), "a"]);
});
it("native ASCII rejects an unrepresented page break before any cell mutation", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  const f = fixture();
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      f.shell.PastePlainTextAtCursor("A\fB"),
  ).toThrow("page-break import is not implemented");
  expect(
    f.tails.map(
      /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["Tail1", "Tail4", "Tail7"]);
  expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
  expect(f.shell.HasBoxSelection()).toBe(true);
});
it("native reader rejects non-end points before constructing insertion history", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  const f = fixture(),
    point = new SwPosition(required(f.tails[0]), 1),
    cursor = new SwPaM(point);
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      createWriterReadTextOperation(cursor, "X", f.shell.CaptureCursorState()),
  ).toThrow("end-of-cell points");
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      new SwUndoInsDoc(point, f.shell.CaptureCursorState()),
  ).toThrow("non-end insertion");
  cursor.Dispose();
  point.Dispose();
});
it("native document-read history keeps unrecorded and structural ranges explicit", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  const f = fixture(),
    point = new SwPosition(f.body, 4),
    history = new SwUndoInsDoc(point, f.shell.CaptureCursorState());
  expect(history).toBeInstanceOf(SwUndoInserts);
  expect(history.GetPayloadSize()).toBe(0);
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      history.RedoWithContext({
        GetDoc:
          /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
            f.doc,
        RestoreCursor:
          /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {},
      }),
  ).toThrow("has not been recorded");
  const incomplete = new SwPosition(f.body, 3);
  expect(
    /** Checks native empty paragraph history. @returns Test result. */ () =>
      history.SetInsertRange(incomplete, f.shell.CaptureCursorState()),
  ).toThrow("original text section");
  incomplete.Dispose();
  const foreign = new SwPosition(required(f.tails[0]), 5);
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      history.SetInsertRange(foreign, f.shell.CaptureCursorState()),
  ).toThrow("original text section");
  const end = f.doc.nodes.MakeTextNode("End"),
    last = new SwPosition(end, 3);
  expect(
    /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
      history.SetInsertRange(last, f.shell.CaptureCursorState()),
  ).toThrow("nontext insertion");
  history.Dispose();
  point.Dispose();
  foreign.Dispose();
  last.Dispose();
  expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
});
it("native reader retains a single unmarked endpoint and disposes inserted nodes from redo history", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () => {
  const f = fixture(),
    node = required(f.tails[0]),
    point = new SwPosition(node, 5),
    cursor = new SwPaM(point),
    states: SwUndoCursorState[] = [];
  const before = createWriterCollapsedCursorState(node, 5, f.shell.GetPendingCharacterItems()),
    context = {
      GetDoc:
        /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ () =>
          f.doc,
      RestoreCursor:
        /** Coordinates native ASCII insertion and retained history. @param state - Native operation input. @returns Operation result. */ (
          state: SwUndoCursorState,
        ) => states.push(state),
    };
  const operation = required(createWriterReadTextOperation(cursor, "A\nB", before));
  operation.execute(context);
  expect(required(states.at(-1)).mark).toBeUndefined();
  expect(
    required(f.boxes[1])
      .GetParagraphs()
      .map(
        /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Cell1", "Tail1A", "B"]);
  operation.action.UndoWithContext(context);
  expect(
    required(f.boxes[1])
      .GetParagraphs()
      .map(
        /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Cell1", "Tail1"]);
  operation.action.RedoWithContext(context);
  expect(
    required(f.boxes[1])
      .GetParagraphs()
      .map(
        /** Coordinates native ASCII insertion and retained history. @param n - Native operation input. @returns Operation result. */ (
          n,
        ) => n.GetText(),
      ),
  ).toEqual(["Cell1", "Tail1A", "B"]);
  operation.action.UndoWithContext(context);
  operation.action.Dispose();
  expect(f.doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
  cursor.Dispose();
  point.Dispose();
});
it("native ASCII multiline cells serialize and reopen their original table sections", /** Coordinates native ASCII insertion and retained history. @returns Operation result. */ async () => {
  const f = fixture(false, false);
  expect(new SwTransferable(f.shell).Paste(transfer("A\nB\n"))).toBe(true);
  const metadata = { title: "ASCII table" },
    reopened = await readOdtDocument(writeOdtDocument(f.doc, metadata), metadata),
    table = required(reopened.document.GetTables()[0]),
    boxes = table
      .GetTabLines()
      .flatMap(
        /** Coordinates native ASCII insertion and retained history. @param row - Native operation input. @returns Operation result. */ (
          row,
        ) => row.GetTabBoxes(),
      );
  expect(table.GetTabLines()).toHaveLength(3);
  expect(table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  for (const i of [1, 4, 7])
    expect(
      required(boxes[i])
        .GetParagraphs()
        .map(
          /** Coordinates native ASCII insertion and retained history. @param node - Native operation input. @returns Operation result. */ (
            node,
          ) => node.GetText(),
        ),
    ).toEqual(["Cell" + i, "Tail" + i + "A", "B"]);
  expect(required(required(boxes[0]).GetParagraphs()[0]).GetText()).toBe("Cell0");
});

it("native blank plain paragraphs retain minimal history in default empty cells", /** Checks native empty paragraph history. @returns Test result. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Blank");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
  const shell = new SwWrtShell(
    new SwDocShell(doc, createDocument({ id: "blank-ascii", suiteId: "writer", title: "Blank" })),
  );
  shells.push(shell);
  new SwEditWin(shell).SelectTableRow(first.GetIndex());
  expect(shell.PastePlainTextAtCursor("\n\n")).toBe(true);
  expect(
    row
      .GetTabBoxes()
      .map(
        /** Checks native empty paragraph history. @param box - Native input. @returns Test result. */ (
          box,
        ) =>
          box
            .GetParagraphs()
            .map(
              /** Checks native empty paragraph history. @param node - Native input. @returns Test result. */ (
                node,
              ) => node.GetText(),
            ),
      ),
  ).toEqual([
    ["", ""],
    ["", ""],
  ]);
  expect(doc.GetUndoManager().GetHistoryPayloadSize()).toBe(0);
  expect(doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
  expect(shell.Undo()).toBe(true);
  expect(
    row
      .GetTabBoxes()
      .map(
        /** Checks native empty paragraph history. @param box - Native input. @returns Test result. */ (
          box,
        ) => box.GetParagraphs().length,
      ),
  ).toEqual([1, 1]);
  expect(required(required(row.GetTabBoxes()[0]).GetParagraphs()[0])).toBe(first);
  expect(shell.Redo()).toBe(true);
  expect(
    row
      .GetTabBoxes()
      .map(
        /** Checks native empty paragraph history. @param box - Native input. @returns Test result. */ (
          box,
        ) => box.GetParagraphs().length,
      ),
  ).toEqual([2, 2]);
  doc.GetUndoManager().Clear();
  expect(doc.GetUndoManager().GetUndoNodes().Count()).toBe(0);
});
