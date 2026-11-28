/** @fileoverview Verifies the native Writer view slots for directional navigation. */
import { assert, expect, it, vi } from "vitest";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { getWriterSlotId } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwNavigationElement } from "../ribbar/workctrl";
import { GetNavigationPage } from "./viewmdi";

it("wraps physical scrolling around the complete visible range", /** Checks the native page range, including a viewport containing several pages. @returns Nothing. */ () => {
  expect(GetNavigationPage({ first: 2, last: 3 }, 5, true)).toBe(4);
  expect(GetNavigationPage({ first: 2, last: 3 }, 5, false)).toBe(1);
  expect(GetNavigationPage({ first: 4, last: 5 }, 5, true)).toBe(1);
  expect(GetNavigationPage({ first: 1, last: 2 }, 5, false)).toBe(5);
});

it("dispatches the source navigation slots to the viewport and the real cursor", /** Sends the unsigned native choice and exercises both directional slots. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const { view } = session;
  const shell = view.GetWrtShell();
  const document = shell.GetDoc();
  const first = document.paragraphs[0];
  assert(first);
  first.SetText("First");
  first.SetAttrOutlineLevel(1);
  const second = document.nodes.MakeTextNode("Second");
  second.SetAttrOutlineLevel(1);
  const viewport = vi.fn();
  const originalPoint = new SwPosition(first, 2);
  try {
    shell.SetCursor(originalPoint);
    view.SetMoveType(SwNavigationElement.Page);
    view.SetNavigationViewport({
      GetVisiblePageNumbers: () => ({ first: 1, last: 1 }),
      GoToPage: viewport,
    });
    expect(view.Execute(WRITER_COMMAND_IDS.scrollToNext)).toMatchObject({ value: true });
    expect(viewport).toHaveBeenCalledWith(1);
    expect(shell.GetCursor().GetPoint().compare(originalPoint)).toBe(0);
    const slot = getWriterSlotId(WRITER_COMMAND_IDS.navElement);
    expect(
      view.Execute(WRITER_COMMAND_IDS.navElement, [
        new SfxUInt32Item(slot, SwNavigationElement.Heading),
      ]).status,
    ).toBe("executed");
    expect(view.GetMoveType()).toBe(SwNavigationElement.Heading);
    expect(view.Execute(WRITER_COMMAND_IDS.scrollToNext)).toMatchObject({ value: true });
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(second);
    expect(view.Execute(WRITER_COMMAND_IDS.scrollToPrevious)).toMatchObject({ value: true });
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(first);
  } finally {
    originalPoint.Dispose();
    view.SetMoveType(SwNavigationElement.Page);
    session.Close();
  }
});

it("keeps the native single-heading backward wrap result from WRITER-760", /** Moves backward and forward from the paragraph before the sole heading. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const before = shell.GetDoc().paragraphs[0];
  assert(before);
  const heading = shell.GetDoc().nodes.MakeTextNode("Only heading");
  heading.SetAttrOutlineLevel(1);
  const cursor = new SwPosition(before);
  try {
    shell.SetCursor(cursor);
    const navigator = session.view.GetNavigator();
    expect(navigator.MoveContent("outline", false)).toBe(false);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(before);
    expect(navigator.MoveContent("outline", true)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(heading);
  } finally {
    cursor.Dispose();
    session.Close();
  }
});

it("traverses table starts and bookmark ranges in positional order with wrapping", /** Checks the original model targets beyond simple page and heading navigation. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const body = document.paragraphs[0];
  assert(body);
  body.SetText("First bookmark and last bookmark");
  const start = new SwPosition(body, 0);
  const end = new SwPosition(body, 5);
  const range = new SwPaM(end, start);
  const marks = document.GetIDocumentMarkAccess();
  const navigator = session.view.GetNavigator();
  try {
    marks.MakeBookmark(range, "First bookmark");
    marks.MakeMark(body, 19, "Last bookmark");
    const first = document.nodes.MakeTableNode("First table", { width: 6000 });
    first.AddColumnWidth(6000);
    document.nodes.AppendTableRow(first, 1);
    const second = document.nodes.MakeTableNode("Second table", { width: 6000 });
    second.AddColumnWidth(6000);
    document.nodes.AppendTableRow(second, 1);
    shell.SetCursor(start);
    expect(navigator.MoveContent("bookmark", true)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(19);
    expect(navigator.MoveContent("bookmark", false)).toBe(true);
    expect(shell.GetCursor().GetPoint().compare(start)).toBe(0);
    expect(shell.GetCursor().GetMark().compare(end)).toBe(0);
    expect(navigator.MoveContent("table", true)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode().FindTableNode()?.GetTable()).toBe(first);
    expect(navigator.MoveContent("table", true)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode().FindTableNode()?.GetTable()).toBe(second);
    expect(navigator.MoveContent("table", true)).toBe(true);
    expect(shell.GetCursor().GetPoint().GetNode().FindTableNode()?.GetTable()).toBe(first);
  } finally {
    range.Dispose();
    start.Dispose();
    end.Dispose();
    session.Close();
  }
});
