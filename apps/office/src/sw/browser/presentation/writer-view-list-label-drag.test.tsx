/** @fileoverview Checks actual Writer label ruler gestures, cursor ownership and paragraph UndoRedo. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { applyWriterParagraphList } from "../../source/core/doc/list";
import { SwNumFormat, SwNumRule } from "../../source/core/doc/number";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT } from "../../inc/hintids";
import { encodeWriterDocument } from "../filter/xml/writer-document-codec";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM before current native model owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts an actual plain cursor and a separate list-label node. @param left - Current paragraph raw margin. @param legacy - Native legacy label geometry. @returns Actual owners and label. */
function fixture(left = 300, legacy = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    current = doc.paragraphs[0],
    target = doc.nodes.MakeTextNode();
  if (current === undefined) throw new Error("Missing actual current node");
  current.SetText("Current");
  target.SetText("Target");
  current.SetAttr(new SvxTextLeftMarginItem(left, RES_MARGIN_TEXTLEFT));
  current.SetAttr(new SvxFirstLineIndentItem(-120, RES_MARGIN_FIRSTLINE));
  applyWriterParagraphList(target, {
    kind: "numbered",
    styleId: "LabelRule",
    listId: "label-list",
    level: 0,
  });
  const rule = target.GetNumRule();
  if (rule === undefined) throw new Error("Missing actual label rule");
  const format = new SwNumFormat(rule.Get(0));
  format.SetIndentAt(720);
  format.SetFirstLineIndent(-360);
  format.SetListtabPos(720);
  if (legacy) {
    format.SetPositionAndSpaceMode("label-width-and-position");
    format.SetAbsLSpace(720);
    format.SetFirstLineOffset(-360);
  }
  rule.Set(0, format);
  shell.SetPageDescriptor({
    ...doc.GetPageDesc().GetValue(),
    width: 12000,
    leftMargin: 1200,
    rightMargin: 1200,
  });
  const point = new SwPosition(current, 2);
  try {
    shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  doc.GetUndoManager().Clear();
  const rendered = render(
    <WriterWorkbench
      isActive
      services={session.services}
      fileDialogs={session.fileDialogs}
      view={session.view}
    />,
  );
  const label = rendered.container.querySelector<HTMLElement>(
      "[data-writer-list-marker]",
    ) as HTMLElement,
    page = label.closest<HTMLElement>("[data-writer-page]");
  if (page === null) throw new Error("Missing actual page");
  vi.spyOn(page, "getBoundingClientRect").mockReturnValue({
    left: 100,
    top: 0,
    right: 900,
    bottom: 900,
    width: 800,
    height: 900,
    x: 100,
    y: 0,
    toJSON: /** Returns no external data. @returns Empty value. */ () => ({}),
  });
  return { session, doc, shell, current, target, rule, label, rendered, page };
}
/** Starts actual document mouse input at the borrowed ruler position. @param label - Mounted label. @param x - Page-relative coordinate. @returns Nothing. */
function begin(label: HTMLElement, x = 132) {
  fireEvent.mouseDown(label, { button: 0, detail: 1, clientX: 100 + x, clientY: 500 });
}
it("retains current cursor and list-rule identity while accepted copied geometry updates only current paragraph with UndoRedo", /** Checks immediate native label-node clear and actual history. @returns Nothing. */ function acceptsLabel() {
  const f = fixture(),
    cursor = f.shell.GetCursor(),
    before = encodeWriterDocument(f.doc),
    rule = new SwNumRule(f.rule),
    targetItems = f.target.CaptureListItems(),
    record = f.target.GetNum();
  const apply = vi.spyOn(f.shell, "SetParagraphRulerIndents"),
    ruleApply = vi.spyOn(f.shell, "SetIndent");
  begin(f.label);
  expect(screen.getByRole("button", { name: "Paragraph left indent" })).toHaveStyle({
    left: "132px",
  });
  fireEvent.pointerMove(window, { pointerType: "mouse", clientX: 252 });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(encodeWriterDocument(f.doc)).toEqual(before);
  fireEvent.keyDown(window, { key: "Enter" });
  expect(apply).toHaveBeenCalledExactlyOnceWith({ left: 1077, firstLine: -120, right: 0 });
  expect(ruleApply).not.toHaveBeenCalled();
  expect(f.current.GetParagraphTextLeftMargin()).toBe(1077);
  expect(f.target.GetParagraphTextLeftMargin()).toBe(0);
  expect(f.rule.Equals(rule)).toBe(true);
  expect(f.target.GetNum()).toBe(record);
  expect(f.target.GetListId()).toBe("label-list");
  expect(f.target.CaptureListItems().Equals(targetItems, true)).toBe(true);
  expect(f.shell.GetCursor()).toBe(cursor);
  expect(cursor.GetPoint().GetNode()).toBe(f.current);
  expect(cursor.GetPoint().GetContentIndex()).toBe(2);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 900 });
  expect(apply).toHaveBeenCalledOnce();
  act(
    /** Restores actual native paragraph history. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(encodeWriterDocument(f.doc)).toEqual(before);
  act(
    /** Reapplies accepted item values. @returns Nothing. */ () => {
      expect(f.shell.Redo()).toBe(true);
    },
  );
  expect(f.current.GetParagraphTextLeftMargin()).toBe(1077);
  expect([f.current.GetText(), f.target.GetText()]).toEqual(["Current", "Target"]);
});
for (const legacy of [false, true])
  it(`narrows native borrowed offset and resolves negative first-line state legacy=${legacy}`, /** Checks actual target ownership and signed-short StateTabWin geometry. @returns Nothing. */ function snapshotsSignedState() {
    const f = fixture(-65536, legacy);
    begin(f.label, 112);
    expect(screen.getByRole("button", { name: "Paragraph left indent" })).toHaveStyle({
      left: "112px",
    });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(f.current.GetParagraphTextLeftMargin()).toBe(-65536);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
for (const ending of ["Escape", "inactive", "document", "unmount"] as const)
  it(`drops actual borrowed label gesture on ${ending}`, /** Checks real document/history and stale mouse release. @returns Nothing. */ function cancelsLabel() {
    const f = fixture(),
      before = encodeWriterDocument(f.doc);
    begin(f.label);
    fireEvent.pointerMove(window, { pointerType: "mouse", clientX: 252 });
    if (ending === "Escape") fireEvent.keyDown(window, { key: "Escape", ctrlKey: true });
    else if (ending === "inactive")
      f.rendered.rerender(
        <WriterWorkbench isActive={false} services={f.session.services} view={f.session.view} />,
      );
    else if (ending === "document")
      act(
        /** Replaces the document through actual persistent view ownership. @returns Nothing. */ () =>
          f.session.view.NewDocument(),
      );
    else f.rendered.unmount();
    fireEvent.pointerUp(window, { pointerType: "mouse", clientX: 900 });
    expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
    if (ending !== "document") {
      expect(encodeWriterDocument(f.doc)).toEqual(before);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    } else expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  });
it("ignores plain, mult click, missing and unbound label identities without manufacturing a native target", /** Checks actual guarded document entry. @returns Nothing. */ function guardsLabel() {
  const f = fixture(),
    body = screen.getByLabelText("Writer document body");
  fireEvent.mouseDown(body, { button: 0, detail: 1 });
  fireEvent.mouseDown(f.label, { button: 2, detail: 1 });
  fireEvent.mouseDown(f.label, { button: 0, detail: 2 });
  f.label.dataset.writerListMarker = "absent";
  begin(f.label);
  f.label.dataset.writerListMarker = screen.getByRole("textbox", {
    name: "Writer document text",
  }).dataset.writerParagraphId as string;
  begin(f.label);
  expect(document.querySelector('[data-ruler-guide="x"]')).toBeNull();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
