/** @fileoverview Checks native collection/reset history ownership, different initial/redo flags and full-node history ranges. */
import { afterEach, describe, expect, it } from "vitest";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwpHints } from "../txtnode/ndhints";
import { SwTextAttrEnd, SwFormatAutoFormat } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwUndoFormatColl } from "../undo/unfmco";
import { SwUndoResetAttr } from "../undo/unattr";
import type { SwUndoRedoContext } from "../undo/undobj";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
import { createTextFormatCollAction } from "./edfcol";

const views: SwView[] = [];
/** Requires an actual native owner. @param value - Optional owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing paired history owner");
  return value;
}
afterEach(
  /** Closes native view owners. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);
/** Creates the actual document and shell graph. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]);
  first.SetText("FirstHistory");
  const empty = doc.GetNodes().MakeTextNode(""),
    last = doc.GetNodes().MakeTextNode("LastHistory"),
    neighbor = doc.GetNodes().MakeTextNode("HistoryNeighbor");
  const target = doc.MakeTextFormatColl(
    "History target",
    doc.GetDfltTextFormatColl(),
    "HistoryTarget",
  );
  target.SetFormatAttr(new SvxFirstLineIndentItem(240, 92));
  const owner = new SwDocShell(
      doc,
      createDocument({ id: "paired-history", title: "History", suiteId: "writer" }),
    ),
    view = new SwView(owner);
  views.push(view);
  return { doc, first, empty, last, neighbor, target, owner, shell: view.GetWrtShell() };
}
/** Creates an independently configured native hint. @param doc - Owning pool. @param kind - Exact range/type. @param length - Text length. @returns Flagged hint. */
function hint(
  doc: SwDoc,
  kind: string,
  length: number,
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  const items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  items.Put(new SvxWeightItem(8, 15));
  const result = new SwTextAttrEnd(
    kind === "internet"
      ? new SwFormatINetFormat({
          url: "https://example.test/native-history",
          targetFrame: "_blank",
          name: "History link",
        })
      : new SwFormatAutoFormat(items),
    kind === "suffix" || kind === "middle" ? 2 : 0,
    kind === "prefix" || kind === "middle" ? 5 : length,
  );
  result.dontExpand = true;
  result.dontExpandStart = true;
  result.dontMoveAttr = true;
  return result;
}

describe("native paired StyleApply history", /** Groups native operation/history boundaries. @returns Nothing. */ () => {
  for (const reversed of [false, true])
    it.each(["whole", "prefix", "suffix", "middle", "internet"])(
      "keeps initial %s then resets the complete redo range, reversed=" + reversed,
      /** Checks actual range nodes, independent hint payload and three history cycles. @param kind - Hint fixture type. @returns Nothing. */
      (kind) => {
        const { doc, first, empty, last, neighbor, target, owner, shell } = fixture();
        for (const node of [first, empty, last, neighbor])
          node.SetAttr(new SvxFirstLineIndentItem(720, 92));
        first.SetTextHints(new SwpHints(doc.GetAttrPool(), [hint(doc, kind, first.Len())]));
        last.SetTextHints(
          new SwpHints(doc.GetAttrPool(), [
            hint(doc, "internet", last.Len()),
            hint(doc, "middle", last.Len()),
          ]),
        );
        neighbor.SetTextHints(
          new SwpHints(doc.GetAttrPool(), [hint(doc, "middle", neighbor.Len())]),
        );
        const beforeFirst = required(first.GetpSwpHints()).clone(),
          beforeLast = required(last.GetpSwpHints()).clone(),
          beforeNeighbor = required(neighbor.GetpSwpHints()).clone();
        shell.SetPaM(
          new SwPosition(reversed ? last : first, reversed ? 0 : 2),
          new SwPosition(reversed ? first : last, reversed ? 2 : 0),
        );
        const cursor = shell.GetCursor(),
          operation = createTextFormatCollAction(doc, cursor, target, shell.CaptureCursorState());
        expect(operation.action).toBeInstanceOf(SfxListUndoAction);
        expect(operation.action.GetActionCount()).toBe(2);
        expect(operation.action.GetComment()).toBe("Paragraph Style");
        expect(first.GetParagraphStyle()).toBe("default");
        expect(required(first.GetpSwpHints()).equals(beforeFirst)).toBe(true);
        expect(shell.ApplyAction(operation.action, false, operation.execute)).toBe(true);
        expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
        expect(owner.GetUndoManager().GetUndoAction()).toBe(operation.action);
        expect(first.GetpSwpHints()?.Count() ?? 0).toBe(kind === "whole" ? 0 : 1);
        expect(required(last.GetpSwpHints()).equals(beforeLast)).toBe(true);
        expect(cursor.GetPoint().GetNode()).toBe(reversed ? last : first);
        expect(cursor.GetPoint().GetContentIndex()).toBe(reversed ? 0 : 2);
        expect(operation.action.GetPayloadSize()).toBe(15);
        for (let cycle = 0; cycle < 3; cycle++) {
          expect(shell.Undo()).toBe(true);
          for (const node of [first, empty, last]) {
            expect(node.GetParagraphStyle()).toBe("default");
            expect(node.GetParagraphFirstLineIndent()).toBe(720);
          }
          expect(required(first.GetpSwpHints()).equals(beforeFirst)).toBe(true);
          expect(required(last.GetpSwpHints()).equals(beforeLast)).toBe(true);
          expect(cursor.GetPoint().GetNode()).toBe(last);
          expect(cursor.GetPoint().GetContentIndex()).toBe(0);
          expect(cursor.GetMark().GetNode()).toBe(first);
          expect(cursor.GetMark().GetContentIndex()).toBe(2);
          expect(shell.Redo()).toBe(true);
          for (const node of [first, empty, last]) {
            expect(node.GetTextFormatColl()).toBe(target);
            expect(node.GetParagraphFirstLineIndent()).toBe(240);
            expect(node.GetpSwpHints()).toBeUndefined();
          }
          expect(cursor.GetPoint().GetNode()).toBe(last);
          expect(cursor.GetPoint().GetContentIndex()).toBe(last.Len());
          expect(cursor.GetMark().GetNode()).toBe(first);
          expect(cursor.GetMark().GetContentIndex()).toBe(0);
          expect(shell.GetActiveParagraph()).toBe(last);
          expect(neighbor.GetParagraphFirstLineIndent()).toBe(720);
          expect(required(neighbor.GetpSwpHints()).equals(beforeNeighbor)).toBe(true);
          expect(shell.GetCursor()).toBe(cursor);
        }
      },
    );

  it("keeps standalone collection history independent of text hints", /** Checks distinct source owner and payload. @returns Nothing. */ () => {
    const { doc, first, target, shell } = fixture();
    first.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [
        hint(doc, "whole", first.Len()),
        hint(doc, "internet", first.Len()),
      ]),
    );
    const original = required(first.GetpSwpHints()).clone(),
      range = new SwPaM(new SwPosition(first, 3)),
      state = shell.CaptureCursorState();
    const action = new SwUndoFormatColl(range, target, state, state),
      context: SwUndoRedoContext = {
        GetDoc: /** Returns the actual model. @returns Model. */ () => doc,
        RestoreCursor:
          /** Leaves the shell cursor outside this payload test. @returns Nothing. */ () => {},
      };
    expect(action.GetPayloadSize()).toBe(3);
    for (let cycle = 0; cycle < 3; cycle++) {
      action.RedoWithContext(context);
      expect(first.GetTextFormatColl()).toBe(target);
      expect(required(first.GetpSwpHints()).equals(original)).toBe(true);
      action.UndoWithContext(context);
      expect(first.GetParagraphStyle()).toBe("default");
      expect(required(first.GetpSwpHints()).equals(original)).toBe(true);
    }
    range.Dispose();
  });

  it("redos the separate text reset when the captured style name disappears", /** Checks native independent redo and exact rollback. @returns Nothing. */ () => {
    const { doc, first, target, shell, owner } = fixture();
    first.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [
        hint(doc, "middle", first.Len()),
        hint(doc, "internet", first.Len()),
      ]),
    );
    const original = required(first.GetpSwpHints()).clone();
    shell.SetPaM(new SwPosition(first, 4));
    shell.SetParagraphStyle("HistoryTarget");
    target.SetFormatName("Renamed history target");
    for (let cycle = 0; cycle < 3; cycle++) {
      shell.Undo();
      expect(first.GetParagraphStyle()).toBe("default");
      expect(required(first.GetpSwpHints()).equals(original)).toBe(true);
      expect(shell.GetCursor().HasMark()).toBe(false);
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
      shell.Redo();
      expect(first.GetParagraphStyle()).toBe("default");
      expect(first.GetpSwpHints()).toBeUndefined();
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(first.Len());
      expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
    }
    expect(owner.GetUndoManager().GetUndoActionCount()).toBe(1);
  });

  it("guards reset history against a foreign document and retains exact hint flags", /** Checks real undo/reset payload and graph boundary. @returns Nothing. */ () => {
    const { doc, first, shell } = fixture(),
      foreign = new SwDoc(),
      range = new SwPaM(new SwPosition(first, 1)),
      state = shell.CaptureCursorState();
    first.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [
        hint(doc, "whole", first.Len()),
        hint(doc, "internet", first.Len()),
      ]),
    );
    const original = required(first.GetpSwpHints()).clone(),
      action = new SwUndoResetAttr(range, state);
    expect(action.GetPayloadSize()).toBe(2);
    action.ApplyExact();
    expect(first.GetpSwpHints()?.Count()).toBe(1);
    const foreignContext: SwUndoRedoContext = {
      GetDoc: /** Returns foreign ownership. @returns Foreign graph. */ () => foreign,
      RestoreCursor: /** Leaves the actual shell alone. @returns Nothing. */ () => {},
    };
    expect(
      /** Tries foreign redo. @returns Nothing. */ () => action.RedoWithContext(foreignContext),
    ).toThrow("another document");
    expect(
      /** Tries foreign undo. @returns Nothing. */ () => action.UndoWithContext(foreignContext),
    ).toThrow("another document");
    action.UndoWithContext({
      GetDoc: /** Returns actual ownership. @returns Actual graph. */ () => doc,
      RestoreCursor: /** Leaves shell state alone. @returns Nothing. */ () => {},
    });
    expect(required(first.GetpSwpHints()).equals(original)).toBe(true);
    range.Dispose();
    foreign.Dispose();
  });

  it("retains native mark presence on redo of a repeated empty paragraph", /** Checks zero-width expanded range and no-hint branches. @returns Nothing. */ () => {
    const { empty, shell, owner } = fixture();
    shell.SetPaM(new SwPosition(empty, 0));
    shell.SetParagraphStyle("default");
    expect(shell.GetCursor().HasMark()).toBe(false);
    expect(
      (
        owner.GetUndoManager().GetUndoAction() as SfxListUndoAction<SwUndoRedoContext>
      ).GetActionCount(),
    ).toBe(2);
    shell.Undo();
    expect(shell.GetCursor().HasMark()).toBe(false);
    shell.Redo();
    expect(shell.GetCursor().HasMark()).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(empty);
    expect(shell.GetCursor().GetMark().GetNode()).toBe(empty);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
  });
});
