/** @fileoverview Checks explicit native StyleApply modifiers through mounted Writer UI, real frame commands, editing and ODT. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../editeng/source/items/textitem";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTextAttrEnd, SwFormatAutoFormat } from "../../source/core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../source/core/txtnode/fmtatr2";
import { SwpHints } from "../../source/core/txtnode/ndhints";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../inc/hintids";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes the real browser ownership graph. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an owned node or DOM surface. @param value - Optional value. @returns Owned value. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw new Error("Missing browser modifier owner");
  return value;
}
/** Mounts the real view/frame graph with independent partial formatting and a link. @returns Actual UI and core owners. */
function mount() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.InitNew(
    createDocument({ id: "browser-style-modifier", title: "Modifiers", suiteId: "writer" }),
  );
  const shell = session.view.GetWrtShell(),
    node = required(doc.paragraphs[0]);
  node.SetText("CtrlBody");
  const neighbor = doc.GetNodes().MakeTextNode("Untouched");
  doc.MakeTextFormatColl("Browser Ctrl target", doc.GetDfltTextFormatColl(), "BrowserCtrl");
  const items = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  items.Put(new SvxWeightItem(8, 15));
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [
      new SwTextAttrEnd(new SwFormatAutoFormat(items), 2, 5),
      new SwTextAttrEnd(
        new SwFormatINetFormat({
          url: "https://example.test/browser-ctrl",
          targetFrame: "_blank",
          name: "Browser Ctrl link",
        }),
        2,
        5,
      ),
    ]),
  );
  shell.SetPaM(new SwPosition(node, 4), new SwPosition(node, 1));
  doc.GetUndoManager().Clear();
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      viewStore={session.viewStore}
      services={session.services}
      fileDialogs={session.fileDialogs}
    />,
  );
  const editor = screen.getByLabelText("Writer document body");
  const paragraph = required(editor.querySelector(`[data-writer-node-index="${node.GetIndex()}"]`));
  const select = screen.getByRole("combobox", { name: "Paragraph style", hidden: true });
  return {
    session,
    doc,
    shell,
    node,
    neighbor,
    editor,
    paragraph,
    select,
    source: createBrowserCommandSource(session.frame),
  };
}

describe("Writer explicit style modifier commands", /** Groups real UI/ODT behavior. @returns Nothing. */ () => {
  it("projects initial Ctrl selective reset, restores native history, exports both phases and continues editing", /** Checks mounted command, native caret/range, real ODT and editor input. @returns Completion. */ async () => {
    const { session, doc, shell, node, neighbor, editor, paragraph, select, source } = mount();
    const original = required(node.GetpSwpHints()).clone();
    expect(paragraph.querySelector("strong")).not.toBeNull();
    expect(paragraph.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.test/browser-ctrl",
    );
    act(
      /** Invokes the real presentation command boundary with explicit native metadata. @returns Nothing. */ () => {
        expect(
          source.Execute(".uno:StyleApply", {
            Style: "BrowserCtrl",
            FamilyName: "ParagraphStyles",
            KeyModifier: 12288,
          }),
        ).toMatchObject({ status: "executed", value: 2 });
      },
    );
    expect(select).toHaveValue("BrowserCtrl");
    expect(paragraph.querySelector("strong")).toBeNull();
    expect(paragraph.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.test/browser-ctrl",
    );
    expect(paragraph.querySelector("a")).toHaveAttribute("target", "_blank");
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
    expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    const initial = await readOdtDocument(await session.docShell.SerializeOdt(), {
      title: "Initial Ctrl",
    });
    expect(
      initial.document.paragraphs[0]
        ?.GetpSwpHints()
        ?.entries()
        .map(
          /** Reads exported hint type. @param hint - Imported hint. @returns WhichId. */ (hint) =>
            hint.Which(),
        ),
    ).toEqual([54]);
    expect(initial.document.paragraphs[0]?.GetTextFormatColl().GetName()).toBe(
      "Browser Ctrl target",
    );
    initial.document.Dispose();
    for (let cycle = 0; cycle < 3; cycle++) {
      fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
      expect(select).toHaveValue("default");
      expect(required(node.GetpSwpHints()).equals(original)).toBe(true);
      expect(paragraph.querySelector("strong")).not.toBeNull();
      expect(paragraph.querySelector("a")).not.toBeNull();
      fireEvent.keyDown(editor, { key: "z", ctrlKey: true, shiftKey: true });
      expect(select).toHaveValue("BrowserCtrl");
      expect(paragraph.querySelector("strong")).toBeNull();
      expect(paragraph.querySelector("a")).toBeNull();
      expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(8);
      expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
      expect(neighbor.GetText()).toBe("Untouched");
      expect(neighbor.GetParagraphStyle()).toBe("default");
    }
    const redo = await readOdtDocument(await session.docShell.SerializeOdt(), {
      title: "Redo Ctrl",
    });
    expect(redo.document.paragraphs[0]?.GetpSwpHints()).toBeUndefined();
    expect(redo.document.paragraphs[1]?.GetText()).toBe("Untouched");
    redo.document.Dispose();
    fireEvent(
      editor,
      new InputEvent("beforeinput", {
        data: "X",
        inputType: "insertText",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(node.GetText()).toBe("X");
    expect(neighbor.GetText()).toBe("Untouched");
    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    expect(node.GetText()).toBe("CtrlBody");
    expect(node.GetpSwpHints()).toBeUndefined();
  });

  it("keeps the native ordinary toolbar acceptance free of key metadata and preserves partial attributes", /** Checks unchanged actual style-box dispatch semantics. @returns Nothing. */ () => {
    const { doc, node, editor, paragraph, select } = mount();
    const before = required(node.GetpSwpHints()).clone();
    select.focus();
    fireEvent.change(select, { target: { value: "BrowserCtrl" } });
    expect(select).toHaveValue("BrowserCtrl");
    expect(editor.contains(document.activeElement)).toBe(true);
    expect(required(node.GetpSwpHints()).equals(before)).toBe(true);
    expect(paragraph.querySelector("strong")).not.toBeNull();
    expect(paragraph.querySelector("a")).not.toBeNull();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    fireEvent.keyDown(editor, { key: "z", ctrlKey: true });
    expect(select).toHaveValue("default");
    expect(required(node.GetpSwpHints()).equals(before)).toBe(true);
  });
});
