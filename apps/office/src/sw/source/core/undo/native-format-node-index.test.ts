/** @fileoverview Verifies current numeric native formatting history ownership without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM, SwPosition } from "../crsr/pam";
import {
  SwUndoAttr,
  SwUndoParagraphItem,
  SwUndoParagraphFormat,
  SwUndoMoveLeftMargin,
  SwUndoResetAttr,
} from "./unattr";
import { SwUndoFormatColl } from "./unfmco";
import type { SwUndo, SwUndoRedoContext } from "./undobj";
import { SwpHints } from "../txtnode/ndhints";
import {
  SwTextAttrEnd,
  SwFormatAutoFormat,
  createWriterCharacterItemSet,
  projectWriterCharacterAttributes,
} from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxFirstLineIndentItem } from "../../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";

const documents: SwDoc[] = [];
afterEach(
  /** Disposes native owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Requires an actual model owner. @param value - Optional value. @returns Actual value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing formatting index owner");
  return value;
}
/** Creates actual body/cell slots and owned style collections. @param kind - Selected section. @returns Native owners. */
function fixture(kind: "body" | "cells") {
  const doc = new SwDoc();
  documents.push(doc);
  const body = required(doc.paragraphs[0]),
    next = doc.nodes.MakeTextNode("abcdef");
  body.SetText("abcdef");
  const table = doc.nodes.MakeTableNode("FormatIndex", {}, next);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    other = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    outside = doc.nodes.MakeTextNode("Neighbor");
  cell.SetText("abcdef");
  other.SetText("abcdef");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "format-index", suiteId: "writer", title: "Format" }),
    ),
    shell = new SwWrtShell(docShell),
    target = doc.MakeTextFormatColl("Format target", doc.GetDfltTextFormatColl(), "FormatTarget");
  target.SetFormatAttr(new SvxFirstLineIndentItem(240, RES_MARGIN_FIRSTLINE));
  return {
    doc,
    docShell,
    shell,
    target,
    outside,
    first: kind === "body" ? body : cell,
    second: kind === "body" ? next : other,
  };
}
/** Replaces one connected slot while retaining its native section, items and hints. @param node - Old owner. @returns Current owner. */
function replace(node: SwTextNode): SwTextNode {
  const copy = new SwTextNode(
      node.GetNodes(),
      node.StartOfSectionNode(),
      node.GetTextFormatColl(),
      node.GetText(),
    ),
    items = node.GetpSwAttrSet(),
    hints = node.GetpSwpHints();
  if (items !== undefined) copy.SetAttr(items);
  if (hints !== undefined) copy.SetTextHints(hints.clone());
  node.GetNodes().replaceTextNode(node, copy);
  expect(copy.StartOfSectionNode()).toBe(node.StartOfSectionNode());
  expect(node.GetNodes().indexOfOrUndefined(node)).toBeUndefined();
  return copy;
}
/** Assigns actual native selection coordinates. @param shell - Native shell. @param first - First owner. @param second - Last owner. @param direction - Native selection. @returns Nothing. */
function select(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
): void {
  const point = new SwPosition(
      direction === "forward" ? second : first,
      direction === "collapsed" ? 2 : 4,
    ),
    mark =
      direction === "collapsed"
        ? undefined
        : new SwPosition(direction === "forward" ? first : second, 1);
  try {
    shell.SetPaM(point, mark);
  } finally {
    point.Dispose();
    mark?.Dispose();
  }
}
/** Checks one original action cursor against current owners. @param shell - Native shell. @param first - First owner. @param second - Last owner. @param direction - Selection. @returns Nothing. */
function cursor(
  shell: SwWrtShell,
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
): void {
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(direction === "forward" ? second : first);
  expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(direction === "collapsed" ? 2 : 4);
  expect(shell.GetActiveParagraph()).toBe(shell.GetCursor().GetPoint().GetNode());
  expect(shell.GetCursor().HasMark()).toBe(direction !== "collapsed");
  if (direction !== "collapsed") {
    expect(shell.GetCursor().GetMark().GetNode()).toBe(direction === "forward" ? first : second);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
  }
}
/** Creates actual ranged native format and link attributes. @param node - Native owner. @param italic - Requested item. @returns Hint set. */
function hints(node: SwTextNode, italic = false): SwpHints {
  const items = createWriterCharacterItemSet(node.GetDoc().GetAttrPool(), {
    bold: !italic,
    italic,
    underline: false,
  });
  return new SwpHints(node.GetDoc().GetAttrPool(), [
    new SwTextAttrEnd(new SwFormatAutoFormat(items), 0, node.Len()),
    new SwTextAttrEnd(
      new SwFormatINetFormat({
        url: "https://example.test/format-index",
        targetFrame: "_blank",
        name: "Format link",
      }),
      0,
      node.Len(),
    ),
  ]);
}
/** Existing same-node formatting operation kinds. */
type Kind = "character" | "item-inherited" | "item-direct" | "alignment" | "margin";
/** Prepares an existing direct action at actual shell endpoints. @param owner - Native owners. @param kind - Operation. @param marked - Same-paragraph reversed selection. @returns Action and assertion. */
function direct(
  owner: ReturnType<typeof fixture>,
  kind: Kind,
  marked: boolean,
): { action: SwUndo; check: (node: SwTextNode, after: boolean) => void } {
  const node = owner.first;
  if (kind === "character") node.SetTextHints(hints(node));
  if (kind === "item-direct") node.SetParagraphFirstLineIndent(720);
  if (kind === "item-inherited") node.ResetAttr(RES_MARGIN_FIRSTLINE);
  if (kind === "alignment") node.SetParagraphAlignment("right");
  if (kind === "margin") node.SetParagraphTextLeftMargin(120);
  select(owner.shell, node, node, marked ? "reversed" : "collapsed");
  const state = owner.shell.CaptureCursorState();
  if (kind === "character") {
    const originalFamily = projectWriterCharacterAttributes(node.GetCharacterItemsAt(2)).fontFamily,
      before = node.CaptureTextFragment(1, 4),
      after = node.CreateFontTextFragment(1, 4, "Format replacement"),
      action = new SwUndoAttr(node, 1, before, after, state, state);
    before.hints.DeleteAtPos(0);
    after.hints.DeleteAtPos(0);
    return {
      action,
      check:
        /** Checks independent native fragment formatting. @param current - Current slot. @param afterState - Applied state. @returns Nothing. */ (
          current,
          afterState,
        ) => {
          expect(projectWriterCharacterAttributes(current.GetCharacterItemsAt(2)).fontFamily).toBe(
            afterState ? "Format replacement" : originalFamily,
          );
          expect(projectWriterCharacterAttributes(current.GetCharacterItemsAt(2)).bold).toBe(true);
          expect(current.getHyperlinkAt(2)?.url).toBe("https://example.test/format-index");
        },
    };
  }
  if (kind === "item-direct" || kind === "item-inherited") {
    const before = node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false),
      beforeValue = node.GetParagraphFirstLineIndent();
    return {
      action: new SwUndoParagraphItem(
        node,
        before,
        new SvxFirstLineIndentItem(360, RES_MARGIN_FIRSTLINE),
        state,
        state,
      ),
      check:
        /** Checks inherited/direct item restoration. @param current - Current slot. @param applied - Applied state. @returns Nothing. */ (
          current,
          applied,
        ) => {
          expect(current.GetParagraphFirstLineIndent()).toBe(applied ? 360 : beforeValue);
          expect(
            current.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false) === undefined,
          ).toBe(!applied && kind === "item-inherited");
        },
    };
  }
  if (kind === "alignment")
    return {
      action: new SwUndoParagraphFormat(node, "right", "center", state, state),
      check:
        /** Checks paragraph adjustment. @param current - Current slot. @param applied - Applied state. @returns Nothing. */ (
          current,
          applied,
        ) => {
          expect(current.GetParagraphAlignment()).toBe(applied ? "center" : "right");
        },
    };
  return {
    action: new SwUndoMoveLeftMargin(node, 120, 360, state, state),
    check:
      /** Checks direct left margin. @param current - Current slot. @param applied - Applied state. @returns Nothing. */ (
        current,
        applied,
      ) => {
        expect(current.GetParagraphTextLeftMargin()).toBe(applied ? 360 : 120);
      },
  };
}
const directCases = (["body", "cells"] as const).flatMap(
  /** Combines native sections. @param section - Native section. @returns Cases. */ (section) =>
    (["character", "item-inherited", "item-direct", "alignment", "margin"] as const).flatMap(
      /** Combines existing direct action kinds. @param kind - Operation. @returns Cases. */ (
        kind,
      ) =>
        [false, true].map(
          /** Combines marked/collapsed cursors. @param marked - Mark presence. @returns Case. */ (
            marked,
          ) => [section, kind, marked] as const,
        ),
    ),
);
it.each(directCases)(
  "numeric direct formatting history targets current slots %s/%s/%s",
  /** Verifies real shell history across repeated native replacement. @param section - Section. @param kind - Operation. @param marked - Mark presence. @returns Nothing. */ (
    section,
    kind,
    marked,
  ) => {
    const owner = fixture(section),
      original = owner.first,
      { action, check } = direct(owner, kind, marked),
      pending = owner.shell.CaptureCursorState().pendingCharacterItems;
    let current = replace(original);
    expect(owner.shell.ApplyAction(action)).toBe(true);
    check(current, true);
    for (let cycle = 0; cycle < 3; cycle++) {
      current = replace(current);
      expect(owner.shell.Undo()).toBe(true);
      check(current, false);
      cursor(owner.shell, current, current, marked ? "reversed" : "collapsed");
      expect(owner.shell.CaptureCursorState().pendingCharacterItems.Equals(pending, true)).toBe(
        true,
      );
      current = replace(current);
      expect(owner.shell.Redo()).toBe(true);
      check(current, true);
      cursor(owner.shell, current, current, marked ? "reversed" : "collapsed");
      expect(current.GetText()).toBe("abcdef");
      expect(owner.outside.GetText()).toBe("Neighbor");
      expect(owner.outside.GetParagraphFirstLineIndent()).toBe(0);
      check(original, false);
    }
    expect(owner.docShell.GetUndoManager().GetUndoActionCount()).toBe(1);
  },
);
const styleCases = (["body", "cells"] as const).flatMap(
  /** Combines actual native style sections. @param section - Section. @returns Cases. */ (
    section,
  ) =>
    (["collapsed", "forward", "reversed"] as const).flatMap(
      /** Combines native direction. @param direction - Direction. @returns Cases. */ (direction) =>
        [false, true].map(
          /** Combines initial character reset flags. @param resetAll - Initial reset flag. @returns Case. */ (
            resetAll,
          ) => [section, direction, resetAll] as const,
        ),
    ),
);
it.each(styleCases)(
  "numeric composite style history targets current slots %s/%s/%s",
  /** Verifies actual paired style/reset history after native replacement. @param section - Section. @param direction - Direction. @param resetAll - Initial reset flag. @returns Nothing. */ (
    section,
    direction,
    resetAll,
  ) => {
    const owner = fixture(section),
      originalFirst = owner.first,
      originalSecond = owner.second;
    for (const node of [owner.first, owner.second]) {
      owner.shell.FocusNode(node);
      owner.shell.SetParagraphListKind("numbered");
      node.SetParagraphFirstLineIndent(720);
      node.SetTextHints(hints(node));
    }
    owner.docShell.GetUndoManager().Clear();
    const beforeFirst = required(owner.first.GetpSwpHints()).clone(),
      beforeSecond = required(owner.second.GetpSwpHints()).clone(),
      items = required(owner.first.GetpSwAttrSet()).Clone();
    select(owner.shell, owner.first, owner.second, direction);
    expect(owner.shell.SetParagraphStyle("FormatTarget", resetAll)).toBe(true);
    const action = owner.docShell
      .GetUndoManager()
      .GetUndoAction() as SfxListUndoAction<SwUndoRedoContext>;
    expect(action).toBeInstanceOf(SfxListUndoAction);
    expect(action.GetActionCount()).toBe(2);
    let first = replace(owner.first),
      second = replace(owner.second);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      expect(first.GetParagraphStyle()).toBe("default");
      expect(first.GetParagraphFirstLineIndent()).toBe(720);
      expect(required(first.GetpSwAttrSet()).Equals(items, true)).toBe(true);
      expect(required(first.GetpSwpHints()).equals(beforeFirst)).toBe(true);
      expect(required(second.GetpSwpHints()).equals(beforeSecond)).toBe(true);
      if (direction === "collapsed") cursor(owner.shell, first, first, direction);
      else {
        expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(second);
        expect(owner.shell.GetCursor().GetMark().GetNode()).toBe(first);
        expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(
          direction === "forward" ? 4 : 1,
        );
        expect(owner.shell.GetCursor().GetMark().GetContentIndex()).toBe(
          direction === "forward" ? 1 : 4,
        );
      }
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Redo()).toBe(true);
      expect(first.GetTextFormatColl()).toBe(owner.target);
      expect(first.GetParagraphFirstLineIndent()).toBe(240);
      expect(first.GetpSwpHints()).toBeUndefined();
      expect(second.GetTextFormatColl()).toBe(
        direction === "collapsed" ? owner.doc.GetDfltTextFormatColl() : owner.target,
      );
      expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(
        direction === "collapsed" ? first : second,
      );
      expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(first.Len());
      expect(owner.shell.GetCursor().GetMark().GetNode()).toBe(first);
      expect(owner.shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
      expect(owner.outside.GetParagraphStyle()).toBe("default");
      expect(originalFirst.GetTextFormatColl()).toBe(owner.target);
      expect(originalSecond.GetTextFormatColl()).toBe(
        direction === "collapsed" ? owner.doc.GetDfltTextFormatColl() : owner.target,
      );
      first = replace(first);
      second = replace(second);
    }
  },
);
it.each(
  (["body", "cells"] as const).flatMap(
    /** Combines real section and empty-hint branches. @param section - Section. @returns Cases. */ (
      section,
    ) =>
      [false, true].map(
        /** Combines native hint presence. @param present - Hint presence. @returns Case. */ (
          present,
        ) => [section, present] as const,
      ),
  ),
)(
  "numeric reset captures current owners at the exact reset boundary %s/%s",
  /** Checks fresh capture after physical replacement, no-hint path and default redo. @param section - Section. @param present - Hint presence. @returns Nothing. */ (
    section,
    present,
  ) => {
    const owner = fixture(section);
    if (present) owner.first.SetTextHints(hints(owner.first));
    select(owner.shell, owner.first, owner.first, "collapsed");
    const point = new SwPosition(owner.first, 0),
      mark = new SwPosition(owner.first, owner.first.Len()),
      range = new SwPaM(point, mark),
      state = owner.shell.CaptureCursorState(),
      action = new SwUndoResetAttr(range, state);
    range.Dispose();
    point.Dispose();
    mark.Dispose();
    let current = replace(owner.first);
    if (present) current.SetTextHints(hints(current, true));
    const captured = current.GetpSwpHints()?.clone();
    expect(
      owner.shell.ApplyAction(
        action,
        false,
        /** Applies initial source reset. @returns Nothing. */ () => action.ApplyExact(),
      ),
    ).toBe(true);
    expect(current.GetpSwpHints()?.Count() ?? 0).toBe(present ? 1 : 0);
    for (let cycle = 0; cycle < 3; cycle++) {
      current = replace(current);
      expect(owner.shell.Undo()).toBe(true);
      expect(current.GetpSwpHints()?.equals(captured as SwpHints) ?? captured === undefined).toBe(
        true,
      );
      current = replace(current);
      expect(owner.shell.Redo()).toBe(true);
      expect(current.GetpSwpHints()).toBeUndefined();
      cursor(owner.shell, current, current, "collapsed");
      expect(current.GetText()).toBe("abcdef");
      expect(owner.outside.GetText()).toBe("Neighbor");
    }
  },
);
it.each(["body", "cells"] as const)(
  "numeric paired style redo retains independent reset when style name disappears %s",
  /** Checks named style lookup and current reset owners across cycles. @param section - Section. @returns Nothing. */ (
    section,
  ) => {
    const owner = fixture(section);
    owner.first.SetTextHints(hints(owner.first));
    const original = required(owner.first.GetpSwpHints()).clone();
    select(owner.shell, owner.first, owner.first, "collapsed");
    expect(owner.shell.SetParagraphStyle("FormatTarget")).toBe(true);
    let current = replace(owner.first);
    owner.target.SetFormatName("Renamed format target");
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      expect(current.GetParagraphStyle()).toBe("default");
      expect(required(current.GetpSwpHints()).equals(original)).toBe(true);
      current = replace(current);
      expect(owner.shell.Redo()).toBe(true);
      expect(current.GetParagraphStyle()).toBe("default");
      expect(current.GetpSwpHints()).toBeUndefined();
      expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(current);
      current = replace(current);
    }
  },
);
it.each(["character", "item-inherited", "item-direct", "alignment", "margin"] as const)(
  "numeric direct format history retains foreign-document boundary %s",
  /** Checks current-node resolution does not erase existing ownership guards. @param kind - Operation. @returns Nothing. */ (
    kind,
  ) => {
    const owner = fixture("body"),
      { action } = direct(owner, kind, false),
      foreign = new SwDoc();
    documents.push(foreign);
    replace(owner.first);
    const context: SwUndoRedoContext = {
      GetDoc: /** Supplies foreign graph. @returns Graph. */ () => foreign,
      RestoreCursor:
        /** Foreign payload must fail before cursor restoration. @returns Nothing. */ () => {
          throw new Error("Unexpected foreign cursor restoration");
        },
    };
    expect(
      /** Tries foreign Undo. @returns Nothing. */ () => action.UndoWithContext(context),
    ).toThrow("another document");
    expect(
      /** Tries foreign Redo. @returns Nothing. */ () => action.RedoWithContext(context),
    ).toThrow("another document");
  },
);

it.each(["body", "cells"] as const)(
  "numeric standalone collection history rebuilds the current range %s",
  /** Checks native range replay and owned current-node rollback without composite reset. @param section - Section. @returns Nothing. */ (
    section,
  ) => {
    const owner = fixture(section);
    owner.first.SetParagraphFirstLineIndent(720);
    owner.second.SetParagraphFirstLineIndent(480);
    select(owner.shell, owner.first, owner.second, "reversed");
    const point = new SwPosition(owner.first, 4),
      mark = new SwPosition(owner.second, 1),
      range = new SwPaM(point, mark),
      state = owner.shell.CaptureCursorState(),
      action = new SwUndoFormatColl(range, owner.target, state, state);
    range.Dispose();
    point.Dispose();
    mark.Dispose();
    let first = replace(owner.first),
      second = replace(owner.second);
    expect(owner.shell.ApplyAction(action)).toBe(true);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(first.GetTextFormatColl()).toBe(owner.target);
      expect(second.GetTextFormatColl()).toBe(owner.target);
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Undo()).toBe(true);
      expect(first.GetTextFormatColl()).toBe(owner.doc.GetDfltTextFormatColl());
      expect(second.GetTextFormatColl()).toBe(owner.doc.GetDfltTextFormatColl());
      expect(first.GetParagraphFirstLineIndent()).toBe(720);
      expect(second.GetParagraphFirstLineIndent()).toBe(480);
      cursor(owner.shell, first, second, "reversed");
      first = replace(first);
      second = replace(second);
      expect(owner.shell.Redo()).toBe(true);
      cursor(owner.shell, first, second, "reversed");
      expect(owner.outside.GetParagraphFirstLineIndent()).toBe(0);
    }
  },
);
