/** @fileoverview Exercises the Font Effects emphasis controls through Writer's native search items. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { SvxEmphasisMarkItem } from "../../../editeng/inc/emphasismarkitem";
import { FontEmphasisMark } from "../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_CHRATR_EMPHASIS_MARK } from "../../inc/hintids";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { SwAttrIter } from "../../source/core/text/itratr";
import { exportContentXml, exportStylesXml } from "../../source/filter/xml/xmlexp";
import { importWriterXml } from "../../source/filter/xml/xmlimp";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

it("finds the selected emphasis on the correct side and replaces it with grouped history", /** Adapts the Dot and Below Text reopen check in formatCharacter.py to search criteria. @returns Nothing. */ () => {
  localStorage.removeItem(SEARCH_OPTIONS_KEY);
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("top low raw");
  const which = RES_CHRATR_EMPHASIS_MARK;
  const above = FontEmphasisMark.Dot | FontEmphasisMark.PosAbove;
  const below = FontEmphasisMark.Dot | FontEmphasisMark.PosBelow;
  const attributes = new SfxItemSet(node.GetDoc().GetAttrPool(), [[which, which]]);
  const position = new SwPosition(node, 0);
  const range = new SwPaM(position);
  range.SetMark();
  for (const [offset, value] of [
    [0, above],
    [4, below],
  ] as const) {
    range.GetMark().SetContent(offset);
    range.GetPoint().SetContent(offset + 3);
    attributes.Put(new SvxEmphasisMarkItem(value, which));
    node.GetDoc().GetDocumentContentOperationsManager().InsertItemSet(range, attributes);
  }
  range.Dispose();
  position.Dispose();
  attributes.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  /** Reads the actual emphasis item through the text iterator. @param offset - Text position. @returns Model flags. */
  function emphasisAt(offset: number): FontEmphasisMark {
    const iterator = new SwAttrIter(node);
    iterator.Seek(offset);
    return (iterator.GetAttrHandler().ReadItem(which) as SvxEmphasisMarkItem).GetEmphasisMark();
  }

  try {
    expect(screen.getByText("top")).toHaveStyle({
      textEmphasisStyle: "filled dot",
      textEmphasisPosition: "over right",
    });
    expect(screen.getByText("low")).toHaveStyle({
      textEmphasisStyle: "filled dot",
      textEmphasisPosition: "under right",
    });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const format = dialog.getByRole("button", { name: "Format…" });
    fireEvent.click(format);
    const search = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(search.getByRole("tab", { name: "Font Effects" }));
    const style = search.getByRole("combobox", { name: "Emphasis mark" });
    const placement = search.getByRole("combobox", { name: "Position" });
    expect(placement).toBeDisabled();
    fireEvent.change(style, { target: { value: FontEmphasisMark.Dot } });
    expect(placement).toHaveValue(String(FontEmphasisMark.PosAbove));
    fireEvent.change(placement, { target: { value: FontEmphasisMark.PosBelow } });
    fireEvent.change(style, { target: { value: FontEmphasisMark.NONE } });
    expect(placement).toBeDisabled();
    fireEvent.change(style, { target: { value: FontEmphasisMark.Dot } });
    expect(placement).toHaveValue(String(FontEmphasisMark.PosBelow));
    fireEvent.click(search.getByRole("button", { name: "OK" }));
    expect(dialog.getByText("Dots Below")).toBeVisible();
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    expect([...shell.GetCursor().GetRingContainer()]).toHaveLength(1);
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(4);
    expect(shell.GetCursor().End().GetContentIndex()).toBe(7);

    fireEvent.click(format);
    const reopened = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(reopened.getByRole("tab", { name: "Font Effects" }));
    expect(reopened.getByRole("combobox", { name: "Emphasis mark" })).toHaveValue("1");
    expect(reopened.getByRole("combobox", { name: "Position" })).toHaveValue("8192");
    fireEvent.change(reopened.getByRole("combobox", { name: "Position" }), {
      target: { value: FontEmphasisMark.PosAbove },
    });
    fireEvent.click(reopened.getByRole("button", { name: "Reset" }));
    expect(reopened.getByRole("combobox", { name: "Position" })).toHaveValue("8192");
    fireEvent.click(reopened.getByRole("button", { name: "Cancel" }));

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(format);
    const replace = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(replace.getByRole("tab", { name: "Font Effects" }));
    fireEvent.change(replace.getByRole("combobox", { name: "Emphasis mark" }), {
      target: { value: FontEmphasisMark.NONE },
    });
    fireEvent.click(replace.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(emphasisAt(1)).toBe(above);
    expect(emphasisAt(6)).toBe(FontEmphasisMark.NONE);
    expect(
      workbench.container.querySelector('[style*="text-emphasis-position: under"]'),
    ).toBeNull();
    act(
      /** Undoes the grouped format replacement. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(emphasisAt(6)).toBe(below);
    expect(screen.getByText("low")).toHaveStyle({ textEmphasisPosition: "under right" });
    act(
      /** Redoes the grouped format replacement. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(emphasisAt(6)).toBe(FontEmphasisMark.NONE);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("retains the Character dialog emphasis through ODT and the Worker document graph", /** Ports the Dot and Below Text check from formatCharacter.py and verifies the persistence path. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("marked plain");
  const node = shell.GetActiveParagraph();
  const start = new SwPosition(node, 0);
  const end = new SwPosition(node, 6);
  shell.SetPaM(end, start);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  /** Opens the standard Character dialog and visits Font Effects. @returns Dialog queries. */
  function openEffects() {
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Character…" }));
    const dialog = within(screen.getByRole("dialog", { name: "Character" }));
    fireEvent.click(dialog.getByRole("tab", { name: "Font Effects" }));
    return dialog;
  }
  try {
    const dialog = openEffects();
    const mark = dialog.getByRole("combobox", { name: "Emphasis mark" });
    const position = dialog.getByRole("combobox", { name: "Position" });
    expect(position).toBeDisabled();
    fireEvent.change(mark, { target: { value: FontEmphasisMark.Dot } });
    fireEvent.change(position, { target: { value: FontEmphasisMark.PosBelow } });
    await act(
      /** Accepts the selected native item. @returns Completion. */ async () => {
        fireEvent.click(dialog.getByRole("button", { name: "OK" }));
      },
    );
    expect(screen.getByText("marked")).toHaveStyle({ textEmphasisPosition: "under right" });
    const reopened = openEffects();
    expect(reopened.getByRole("combobox", { name: "Emphasis mark" })).toHaveValue("1");
    expect(reopened.getByRole("combobox", { name: "Position" })).toHaveValue("8192");
    fireEvent.click(reopened.getByRole("button", { name: "Cancel" }));

    const document = shell.GetDoc();
    const content = exportContentXml(document);
    expect(content).toContain('style:text-emphasize="dot below"');
    const imported = importWriterXml(exportStylesXml(document), content, { title: "Emphasis" });
    const decoded = decodeWriterDocument(structuredClone(encodeWriterDocument(imported.document)));
    const [paragraph] = decoded.paragraphs;
    if (paragraph === undefined) throw new Error("Missing reopened paragraph.");
    const iterator = new SwAttrIter(paragraph);
    for (const [offset, value] of [
      [1, FontEmphasisMark.Dot | FontEmphasisMark.PosBelow],
      [8, FontEmphasisMark.NONE],
    ] as const) {
      iterator.Seek(offset);
      const item = iterator.GetAttrHandler().ReadItem(RES_CHRATR_EMPHASIS_MARK);
      expect(item).toBeInstanceOf(SvxEmphasisMarkItem);
      expect((item as SvxEmphasisMarkItem).GetEmphasisMark()).toBe(value);
    }
  } finally {
    end.Dispose();
    start.Dispose();
    workbench.unmount();
    session.view.Close();
  }
});
