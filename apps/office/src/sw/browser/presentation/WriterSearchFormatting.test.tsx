/** @fileoverview Native Writer formatting criteria and the browser search surfaces. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import {
  FontLineStyle,
  SvxUnderlineItem,
  SvxOverlineItem,
  SvxWeightItem,
  SvxFontHeightItem,
} from "../../../editeng/source/items/textitem";
import { SvxColorItem } from "../../../editeng/source/items/textitem.color";
import { SvxBrushItem } from "../../../editeng/source/items/frmitems.brush";
import {
  SvxEscapementItem,
  DFLT_ESC_AUTO_SUPER,
} from "../../../editeng/source/items/textitem.escapement";
import { SvxKerningItem } from "../../../editeng/source/items/textitem.spacing";
import { Color } from "../../../tools/inc/color";
import { FontWeight } from "../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import {
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_BEGIN,
  RES_CHRATR_COLOR,
  RES_CHRATR_END,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_KERNING,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../inc/hintids";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { SwAttrIter } from "../../source/core/text/itratr";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WriterWorkbench } from "./writer-view";

beforeEach(localStorage.removeItem.bind(localStorage, SEARCH_OPTIONS_KEY));

it("finds underlined text through the attribute checklist and isolates the Find Bar", /** Ports the represented underline scenario in tdf106099.py and toolbar isolation in tdf115665.py. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("plain under plain under");
  const position = new SwPosition(node, 11);
  const range = new SwPaM(position);
  const set = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_UNDERLINE, RES_CHRATR_UNDERLINE],
  ]);
  set.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE));
  range.SetMark();
  range.GetMark().SetContent(6);
  node.GetDoc().GetDocumentContentOperationsManager().InsertItemSet(range, set);
  set.Dispose();
  range.Dispose();
  position.SetContent(0);
  shell.SetCursor(position);
  position.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
  fireEvent.click(dialog.getByText("Other options"));
  fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
  const exact = within(screen.getByRole("dialog", { name: "Search" }));
  fireEvent.click(exact.getByRole("tab", { name: "Font Effects" }));
  fireEvent.change(exact.getByLabelText("Underlining"), {
    target: { value: FontLineStyle.LINESTYLE_SINGLE },
  });
  fireEvent.click(exact.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("Single underline")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "No Format" }));
  expect(dialog.queryByText("Single underline")).toBeNull();
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
  fireEvent.click(attributes.getByRole("checkbox", { name: "Underlining" }));
  fireEvent.click(attributes.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("Underlining")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const draft = within(screen.getByRole("dialog", { name: "Attributes" }));
  expect(draft.getByRole("checkbox", { name: "Underlining" })).toBeChecked();
  fireEvent.click(draft.getByRole("checkbox", { name: "Underlining" }));
  fireEvent.click(draft.getByRole("button", { name: "Cancel" }));
  expect(dialog.getByText("Underlining")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(6);
  expect(shell.GetCursor().End().GetContentIndex()).toBe(11);
  fireEvent.click(dialog.getByRole("button", { name: "Find Previous" }));
  expect(shell.GetCursor().Start().GetContentIndex()).toBe(6);
  expect(shell.GetCursor().End().GetContentIndex()).toBe(11);
  expect(dialog.getByRole("status")).toHaveTextContent("Reached the beginning");

  fireEvent.keyDown(window, { key: "f", ctrlKey: true });
  const toolbar = within(screen.getByRole("toolbar", { name: "Find" }));
  fireEvent.change(toolbar.getByLabelText("Find"), { target: { value: "plain" } });
  fireEvent.click(toolbar.getByRole("button", { name: "Find All" }));
  expect([...shell.GetCursor().GetRingContainer()]).toHaveLength(2);
  fireEvent.click(dialog.getByRole("button", { name: "No Format" }));
  expect(dialog.queryByText("Underlining")).toBeNull();
  workbench.unmount();
  session.view.Close();
});

it("combines exact formatting criteria and replaces them with one undo", /** Adapts the font weight and size experiment from the pinned tdf119462.py UI test. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("word word word");
  const position = new SwPosition(node, 4);
  const range = new SwPaM(position);
  const set = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_FONTSIZE, RES_CHRATR_FONTSIZE],
    [RES_CHRATR_WEIGHT, RES_CHRATR_WEIGHT],
  ]);
  set.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  set.Put(new SvxFontHeightItem(320, 100, RES_CHRATR_FONTSIZE));
  range.SetMark();
  range.GetMark().SetContent(0);
  const operations = node.GetDoc().GetDocumentContentOperationsManager();
  operations.InsertItemSet(range, set);
  range.GetPoint().SetContent(14);
  range.GetMark().SetContent(10);
  operations.InsertItemSet(range, set);
  set.ClearItem(RES_CHRATR_FONTSIZE);
  range.GetPoint().SetContent(9);
  range.GetMark().SetContent(5);
  operations.InsertItemSet(range, set);
  set.Dispose();
  range.Dispose();
  position.SetContent(0);
  shell.SetCursor(position);
  position.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.keyDown(window, { key: "h", ctrlKey: true });
  const outer = screen.getByRole("dialog", { name: "Find and Replace" });
  const dialog = within(outer);
  fireEvent.click(dialog.getByText("Other options"));
  const format = dialog.getByRole("button", { name: "Format…" });
  fireEvent.click(format);
  const searchFormat = within(screen.getByRole("dialog", { name: "Search" }));
  fireEvent.change(searchFormat.getByLabelText("Weight"), {
    target: { value: FontWeight.WEIGHT_BOLD },
  });
  fireEvent.click(searchFormat.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("bold", { exact: true })).toBeVisible();
  fireEvent.click(format);
  const sizeFormat = within(screen.getByRole("dialog", { name: "Search" }));
  fireEvent.change(sizeFormat.getByLabelText("Size"), { target: { value: 16 } });
  fireEvent.click(sizeFormat.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("bold, 16 pt")).toBeVisible();
  fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "word" } });
  fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
  expect(
    [...shell.GetCursor().GetRingContainer()]
      .map(
        /** Returns the lower UTF-16 selection offset. @param cursor - Native search match. @returns Match start. */ (
          cursor,
        ) => cursor.Start().GetContentIndex(),
      )
      .sort(),
  ).toEqual([0, 10]);

  fireEvent.focus(dialog.getByLabelText("Replace with"));
  fireEvent.click(format);
  const replaceFormat = within(screen.getByRole("dialog", { name: "Replace" }));
  fireEvent.click(replaceFormat.getByRole("tab", { name: "Font Effects" }));
  fireEvent.change(replaceFormat.getByLabelText("Underlining"), {
    target: { value: FontLineStyle.LINESTYLE_SINGLE },
  });
  fireEvent.click(replaceFormat.getByRole("button", { name: "OK" }));
  fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
  expect(node.GetText()).toBe("word word word");
  expect(attributeAt(node, 0, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_SINGLE);
  expect(attributeAt(node, 5, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_NONE);
  expect(attributeAt(node, 10, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_SINGLE);
  expect(attributeAt(node, 0, RES_CHRATR_WEIGHT)).toBe(FontWeight.WEIGHT_NORMAL);

  act(
    /** Undoes both formatting replacements. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(attributeAt(node, 0, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_NONE);
  expect(attributeAt(node, 10, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_NONE);
  expect(attributeAt(node, 0, RES_CHRATR_WEIGHT)).toBe(FontWeight.WEIGHT_BOLD);
  expect(attributeAt(node, 10, RES_CHRATR_WEIGHT)).toBe(FontWeight.WEIGHT_BOLD);
  act(
    /** Redoes both formatting replacements. @returns Nothing. */ () => {
      expect(shell.Redo()).toBe(true);
    },
  );
  expect(attributeAt(node, 0, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_SINGLE);
  expect(attributeAt(node, 10, RES_CHRATR_UNDERLINE)).toBe(FontLineStyle.LINESTYLE_SINGLE);
  workbench.unmount();
  session.view.Close();
});

it("combines effects, position and highlighting and resets only the active search page", /** Exercises independent native items across the search and replacement format dialogs. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("blue gray");
  const start = new SwPosition(node, 0);
  const end = new SwPosition(node, 4);
  const match = new SwPaM(end, start);
  const attributes = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
  ]);
  attributes.Put(new SvxColorItem(new Color(0x0033cc), RES_CHRATR_COLOR));
  attributes.Put(new SvxBrushItem(new Color(0xffee00), RES_CHRATR_BACKGROUND));
  attributes.Put(new SvxEscapementItem(DFLT_ESC_AUTO_SUPER, 58, RES_CHRATR_ESCAPEMENT));
  attributes.Put(new SvxKerningItem(24, RES_CHRATR_KERNING));
  const operations = node.GetDoc().GetDocumentContentOperationsManager();
  operations.InsertItemSet(match, attributes);
  attributes.ClearItem(RES_CHRATR_BACKGROUND);
  attributes.Put(new SvxBrushItem(new Color(0xffee00), RES_CHRATR_HIGHLIGHT));
  match.GetMark().SetContent(5);
  match.GetPoint().SetContent(9);
  operations.InsertItemSet(match, attributes);
  shell.SetCursor(start);
  match.Dispose();
  start.Dispose();
  end.Dispose();
  attributes.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    let format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Font Effects" }));
    fireEvent.change(format.getByLabelText("Font color"), { target: { value: "#0033cc" } });
    fireEvent.click(format.getByRole("tab", { name: "Position" }));
    fireEvent.click(format.getByRole("radio", { name: "Superscript" }));
    fireEvent.click(format.getByRole("checkbox", { name: "Automatic" }));
    fireEvent.change(format.getByRole("spinbutton", { name: "By" }), { target: { value: "1.2" } });
    fireEvent.click(format.getByRole("tab", { name: "Highlighting" }));
    fireEvent.change(format.getByLabelText("Highlight color"), { target: { value: "#ff0000" } });
    fireEvent.click(format.getByRole("button", { name: "Reset" }));
    fireEvent.change(format.getByLabelText("Highlight color"), { target: { value: "#ffee00" } });
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    expect(
      dialog.getByText("#0033CC, Superscript, Character spacing 1.2 pt, #FFEE00"),
    ).toBeVisible();
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().End().GetContentIndex()).toBe(4);
    expect(shell.GetCursor().GetNext()).toBe(shell.GetCursor());

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    format = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(format.getByRole("tab", { name: "Font Effects" }));
    fireEvent.change(format.getByLabelText("Overlining"), {
      target: { value: FontLineStyle.LINESTYLE_DOUBLE },
    });
    fireEvent.change(format.getByLabelText("Overline color"), { target: { value: "#cc0033" } });
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(node.GetText()).toBe("blue gray");
    const iterator = new SwAttrIter(node);
    iterator.Seek(2);
    const overline = iterator.GetAttrHandler().ReadItem(RES_CHRATR_OVERLINE);
    expect(overline).toBeInstanceOf(SvxOverlineItem);
    expect((overline as SvxOverlineItem).GetLineStyle()).toBe(FontLineStyle.LINESTYLE_DOUBLE);
    expect((overline as SvxOverlineItem).GetColor().toUInt32()).toBe(0xcc0033);
    expect(screen.getByText("blue")).toHaveStyle({
      textDecorationLine: "overline",
      textDecorationStyle: "double",
      textDecorationColor: "#cc0033",
    });
    iterator.Seek(6);
    expect(
      (iterator.GetAttrHandler().ReadItem(RES_CHRATR_OVERLINE) as SvxOverlineItem).GetLineStyle(),
    ).toBe(FontLineStyle.LINESTYLE_NONE);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

/** Reads the effective value through the same native attribute owner as the editing surface. @param node - Current text node. @param offset - Text offset. @param which - Native formatting item family. @returns Effective value. */
function attributeAt(node: SwTextNode, offset: number, which: number): number | undefined {
  const attributes = new SwAttrIter(node);
  attributes.Seek(offset);
  const item = attributes.GetAttrHandler().ReadItem(which);
  if (item instanceof SvxUnderlineItem) return item.GetLineStyle();
  if (item instanceof SvxWeightItem) return item.GetWeight();
  return undefined;
}
