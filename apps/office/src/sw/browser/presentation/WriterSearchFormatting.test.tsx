/** @fileoverview Native Writer formatting criteria and the browser search surfaces. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import {
  FontLineStyle,
  SvxUnderlineItem,
  SvxWeightItem,
  SvxFontHeightItem,
} from "../../../editeng/source/items/textitem";
import { FontWeight } from "../../../tools/inc/fontenum";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT, RES_CHRATR_FONTSIZE } from "../../inc/hintids";
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

/** Reads the effective value through the same native attribute owner as the editing surface. @param node - Current text node. @param offset - Text offset. @param which - Native formatting item family. @returns Effective value. */
function attributeAt(node: SwTextNode, offset: number, which: number): number | undefined {
  const attributes = new SwAttrIter(node);
  attributes.Seek(offset);
  const item = attributes.GetAttrHandler().ReadItem(which);
  if (item instanceof SvxUnderlineItem) return item.GetLineStyle();
  if (item instanceof SvxWeightItem) return item.GetWeight();
  return undefined;
}
