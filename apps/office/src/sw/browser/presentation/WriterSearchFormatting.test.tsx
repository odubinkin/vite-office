/** @fileoverview Native Writer formatting criteria and the browser search surfaces. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { FieldUnit } from "../../../tools/inc/fldunit";
import {
  FontLineStyle,
  SvxUnderlineItem,
  SvxOverlineItem,
  SvxWeightItem,
  SvxFontHeightItem,
} from "../../../editeng/source/items/textitem";
import { SvxBreak } from "../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../editeng/inc/tstpitem";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SvxAdjust, SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import { SvxFirstLineIndentItem, SvxIndentValue } from "../../../editeng/inc/lrspitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { SvxColorItem } from "../../../editeng/source/items/textitem.color";
import { SvxBrushItem } from "../../../editeng/source/items/frmitems.brush";
import {
  SvxEscapementItem,
  DFLT_ESC_AUTO_SUPER,
} from "../../../editeng/source/items/textitem.escapement";
import { SvxKerningItem } from "../../../editeng/source/items/textitem.spacing";
import { Color } from "../../../tools/inc/color";
import { FontWeight } from "../../../tools/inc/fontenum";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SfxGrabBagItem } from "../../../svl/inc/grabbagitem";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import {
  RES_BREAK,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_BEGIN,
  RES_CHRATR_COLOR,
  RES_CHRATR_END,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_KERNING,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { SwAttrIter } from "../../source/core/text/itratr";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SEARCH_OPTIONS_KEY } from "../storage/writer-search-options-store";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
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
  set.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, RES_CHRATR_UNDERLINE));
  range.GetPoint().SetContent(23);
  range.GetMark().SetContent(18);
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
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const unchecked = within(screen.getByRole("dialog", { name: "Attributes" }));
  expect(unchecked.getByRole("checkbox", { name: "Underline" })).not.toBeChecked();
  fireEvent.click(unchecked.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("Single underline")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
  fireEvent.click(attributes.getByRole("checkbox", { name: "Underline" }));
  fireEvent.click(attributes.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("Underline")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const draft = within(screen.getByRole("dialog", { name: "Attributes" }));
  expect(draft.getByRole("checkbox", { name: "Underline" })).toBeChecked();
  fireEvent.click(draft.getByRole("checkbox", { name: "Underline" }));
  fireEvent.click(draft.getByRole("button", { name: "Cancel" }));
  expect(dialog.getByText("Underline")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
  const withPresence = within(screen.getByRole("dialog", { name: "Search" }));
  fireEvent.click(withPresence.getByRole("tab", { name: "Font Effects" }));
  fireEvent.change(withPresence.getByLabelText("Underlining"), {
    target: { value: FontLineStyle.LINESTYLE_SINGLE },
  });
  fireEvent.click(withPresence.getByRole("button", { name: "OK" }));
  expect(dialog.getByText("Underline, Single underline")).toBeVisible();
  fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
  const combined = within(screen.getByRole("dialog", { name: "Attributes" }));
  expect(combined.getByRole("checkbox", { name: "Underline" })).toBeChecked();
  fireEvent.click(combined.getByRole("button", { name: "Cancel" }));
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
  expect(dialog.queryByText("Underline, Single underline")).toBeNull();
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

it("finds paragraph formatting alone and with text, then replaces paragraph attributes with grouped undo", /** Drives the native paragraph OtherSet through both formatting dialogs. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const metric = vi.spyOn(session.view, "GetMetric").mockReturnValue(FieldUnit.INCH);
  const shell = session.view.GetWrtShell();
  const first = shell.GetActiveParagraph();
  shell.Insert("red word");
  shell.SplitNode();
  const second = shell.GetActiveParagraph();
  shell.Insert("red word");
  shell.SplitNode();
  const third = shell.GetActiveParagraph();
  shell.Insert("red word");
  for (const paragraph of [first, third]) {
    paragraph.SetAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
    paragraph.SetAttr(new SvxULSpaceItem(288, 0, RES_UL_SPACE));
  }
  const start = new SwPosition(first, 0);
  shell.SetCursor(start);
  start.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Alignment" }));
    fireEvent.click(format.getByRole("radio", { name: "Centered" }));
    fireEvent.click(format.getByRole("tab", { name: "Indents & Spacing" }));
    fireEvent.change(format.getByRole("spinbutton", { name: "Above paragraph" }), {
      target: { value: "0.20 in" },
    });
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    expect(dialog.getByText("Alignment Centered, Paragraph spacing 14.4 / 0 pt")).toBeVisible();

    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    const all = [...shell.GetCursor().GetRingContainer()];
    expect(all).toHaveLength(2);
    expect(all[0]?.Start().GetNode()).toBe(first);
    expect(all[0]?.Start().GetContentIndex()).toBe(0);
    expect(all[0]?.End().GetContentIndex()).toBe(8);
    expect(all[1]?.Start().GetNode()).toBe(third);

    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "word" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    const occurrences = [...shell.GetCursor().GetRingContainer()];
    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]?.Start().GetContentIndex()).toBe(4);
    expect(occurrences[1]?.Start().GetContentIndex()).toBe(4);

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const replacement = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(replacement.getByRole("tab", { name: "Alignment" }));
    fireEvent.click(replacement.getByRole("radio", { name: "Right" }));
    fireEvent.click(replacement.getByRole("tab", { name: "Indents & Spacing" }));
    fireEvent.change(replacement.getByRole("spinbutton", { name: "First line" }), {
      target: { value: "0.10 in" },
    });
    fireEvent.change(replacement.getByRole("combobox", { name: "Line spacing" }), {
      target: { value: "4" },
    });
    fireEvent.change(replacement.getByRole("spinbutton", { name: "Line Spacing Value" }), {
      target: { value: "137" },
    });
    fireEvent.click(replacement.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));
    expect(first.GetParagraphAlignment()).toBe("right");
    expect(third.GetParagraphAlignment()).toBe("right");
    expect(second.GetParagraphAlignment()).toBe("left");
    expect(first.GetText()).toBe("red word");
    expect(
      (third.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem)
        .GetTextFirstLineOffset()
        .ResolveFixedPart(),
    ).toBe(144);
    expect((third.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(
      137,
    );
    expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(0);

    act(
      /** Restores both native paragraph edits in one undo. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(first.GetParagraphAlignment()).toBe("center");
    expect(third.GetParagraphAlignment()).toBe("center");
    expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(288);
    expect(third.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
    act(
      /** Reapplies the whole replacement group. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(first.GetParagraphAlignment()).toBe("right");
    expect(third.GetParagraphAlignment()).toBe("right");
  } finally {
    metric.mockRestore();
    workbench.unmount();
    session.view.Close();
  }
});

it("finds the color applied by Writer’s highlighting command but skips a visually identical imported highlight", /** Covers the native toolbar-to-format-search path across two distinct character items. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("native import");
  const start = new SwPosition(node, 0);
  const end = new SwPosition(node, 6);
  const whole = new SwPaM(end, start);
  const imported = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_HIGHLIGHT, RES_CHRATR_GRABBAG],
  ]);
  imported.Put(new SvxBrushItem(new Color(0xffff00), RES_CHRATR_HIGHLIGHT));
  const shading = new Any([true], "bool");
  imported.Put(new SfxGrabBagItem(RES_CHRATR_GRABBAG, new Map([["CharShadingMarker", shading]])));
  shading.dispose();
  whole.GetPoint().SetContent(13);
  whole.GetMark().SetContent(0);
  node.GetDoc().GetDocumentContentOperationsManager().InsertItemSet(whole, imported);
  whole.Dispose();
  imported.Dispose();
  shell.SetPaM(end, start);

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    act(
      /** Dispatches the actual highlighting slot and restores the starting caret. @returns Nothing. */ () => {
        session.view.Execute(WRITER_COMMAND_IDS.charBackColor, { color: "#ffff00" });
        shell.SetCursor(start);
      },
    );
    const attrs = new SwAttrIter(node);
    attrs.Seek(1);
    const background = attrs.GetAttrHandler().ReadItem(RES_CHRATR_BACKGROUND);
    const cleared = attrs.GetAttrHandler().ReadItem(RES_CHRATR_HIGHLIGHT);
    expect(background).toBeInstanceOf(SvxBrushItem);
    expect((background as SvxBrushItem).GetColor().toUInt32()).toBe(0xffff00);
    expect((cleared as SvxBrushItem).GetColor().IsFullyTransparent()).toBe(true);
    const bag = attrs.GetAttrHandler().ReadItem(RES_CHRATR_GRABBAG) as SfxGrabBagItem;
    const marker: [boolean] = [true];
    expect(bag.GetGrabBag().get("CharShadingMarker")?.extract(marker, "bool")).toBe(true);
    expect(marker[0]).toBe(false);
    attrs.Seek(8);
    expect(
      (attrs.GetAttrHandler().ReadItem(RES_CHRATR_HIGHLIGHT) as SvxBrushItem).GetColor().toUInt32(),
    ).toBe(0xffff00);

    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const find = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(find.getByText("Other options"));
    fireEvent.click(find.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Highlighting" }));
    fireEvent.change(format.getByLabelText("Highlight color"), { target: { value: "#ffff00" } });
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    fireEvent.click(find.getByRole("button", { name: "Find All" }));
    const matches = [...shell.GetCursor().GetRingContainer()];
    expect(matches).toHaveLength(1);
    expect(matches[0]?.Start().GetContentIndex()).toBe(0);
    expect(matches[0]?.End().GetContentIndex()).toBe(6);
  } finally {
    start.Dispose();
    end.Dispose();
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

it("finds tab stops and page breaks through the sorted native slot checklist", /** Exercises paragraph attributes available through the pool and preserves their sorted order in the query. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const first = shell.GetActiveParagraph();
  shell.Insert("first");
  shell.SplitNode();
  const second = shell.GetActiveParagraph();
  shell.Insert("second");
  const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Left));
  second.SetAttr(tabs);
  second.SetAttr(new SfxInt16Item(RES_BREAK, SvxBreak.PageBefore));
  const start = new SwPosition(first, 0);
  shell.SetCursor(start);
  start.Dispose();

  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("button", { name: "Attributes…" }));
    const attributes = within(screen.getByRole("dialog", { name: "Attributes" }));
    expect(attributes.getByRole("checkbox", { name: "Language of Asian font" })).toBeVisible();
    expect(attributes.getByRole("checkbox", { name: "Character blinking" })).toBeVisible();
    expect(attributes.getByRole("checkbox", { name: "Blinking" })).toBeVisible();
    fireEvent.click(attributes.getByRole("checkbox", { name: "Tab stops" }));
    fireEvent.click(attributes.getByRole("checkbox", { name: "Page Break" }));
    fireEvent.click(attributes.getByRole("button", { name: "OK" }));
    expect(dialog.getByText("Page Break, Tab stops")).toBeVisible();
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(shell.GetCursor().Start().GetNode()).toBe(second);
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().End().GetContentIndex()).toBe(6);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("finds the complete justification and automatic first-line criteria", /** Ports the native alignment and first-line control dependencies through exact paragraph matching. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const metric = vi.spyOn(session.view, "GetMetric").mockReturnValue(FieldUnit.INCH);
  const shell = session.view.GetWrtShell();
  const match = shell.GetActiveParagraph();
  shell.Insert("match");
  shell.SplitNode();
  const spacingVariant = shell.GetActiveParagraph();
  shell.Insert("other spacing");
  shell.SplitNode();
  const indentVariant = shell.GetActiveParagraph();
  shell.Insert("manual first line");
  for (const paragraph of [match, spacingVariant, indentVariant]) {
    const adjustment = new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST);
    adjustment.SetLastBlock(SvxAdjust.Block);
    adjustment.SetOneWord(SvxAdjust.Block);
    adjustment.SetPropWordSpacingMinimum(110);
    adjustment.SetPropWordSpacing(120);
    adjustment.SetPropWordSpacingMaximum(paragraph === spacingVariant ? 140 : 120);
    adjustment.SetPropLetterSpacingMinimum(-10);
    adjustment.SetPropScaleWidthMinimum(90);
    adjustment.SetPropScaleWidthMaximum(150);
    adjustment.SetParagraphComposer(true);
    paragraph.SetAttr(adjustment);
    const indent = new SvxFirstLineIndentItem(SvxIndentValue.twips(144), RES_MARGIN_FIRSTLINE);
    indent.SetAutoFirst(paragraph !== indentVariant);
    paragraph.SetAttr(indent);
  }
  const start = new SwPosition(match, 0);
  shell.SetCursor(start);
  start.Dispose();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Alignment" }));

    const lastLine = format.getByRole("combobox", { name: "Last line" });
    const expand = format.getByRole("checkbox", { name: "Expand single word" });
    expect(lastLine).toBeDisabled();
    fireEvent.click(format.getByRole("radio", { name: "Justified" }));
    fireEvent.change(lastLine, { target: { value: SvxAdjust.Block } });
    fireEvent.click(expand);
    fireEvent.change(lastLine, { target: { value: SvxAdjust.Center } });
    expect(expand).toBeDisabled();
    expect(expand).not.toBeChecked();
    fireEvent.change(lastLine, { target: { value: SvxAdjust.Block } });
    fireEvent.click(expand);

    const minimum = format.getByRole("spinbutton", { name: "Minimum word spacing" });
    const desired = format.getByRole("spinbutton", { name: "Desired word spacing" });
    const maximum = format.getByRole("spinbutton", { name: "Maximum word spacing" });
    fireEvent.change(desired, { target: { value: 80 } });
    expect(minimum).toHaveValue(80);
    fireEvent.change(minimum, { target: { value: 125 } });
    expect(desired).toHaveValue(125);
    expect(maximum).toHaveValue(125);
    fireEvent.change(maximum, { target: { value: 110 } });
    expect(minimum).toHaveValue(110);
    expect(desired).toHaveValue(110);
    fireEvent.change(desired, { target: { value: 120 } });
    expect(maximum).toHaveValue(120);
    fireEvent.change(format.getByRole("spinbutton", { name: "Minimum letter spacing" }), {
      target: { value: -10 },
    });
    const glyphMinimum = format.getByRole("spinbutton", { name: "Minimum glyph scaling" });
    fireEvent.change(glyphMinimum, { target: { value: 9 } });
    expect(glyphMinimum).toHaveValue(9);
    fireEvent.change(glyphMinimum, { target: { value: 90 } });
    fireEvent.change(format.getByRole("spinbutton", { name: "Maximum glyph scaling" }), {
      target: { value: 150 },
    });
    fireEvent.click(format.getByRole("checkbox", { name: "Paragraph Composer" }));

    fireEvent.click(format.getByRole("tab", { name: "Indents & Spacing" }));
    const firstLine = format.getByRole("spinbutton", { name: "First line" });
    fireEvent.change(firstLine, { target: { value: "0.10 in" } });
    const automatic = format.getByRole("checkbox", { name: "Automatic" });
    fireEvent.click(automatic);
    expect(firstLine).toBeDisabled();
    fireEvent.click(format.getByRole("button", { name: "OK" }));

    fireEvent.click(dialog.getByRole("button", { name: "Find All" }));
    const matches = [...shell.GetCursor().GetRingContainer()];
    expect(matches).toHaveLength(1);
    expect(matches[0]?.Start().GetNode()).toBe(match);
    expect(matches[0]?.End().GetContentIndex()).toBe(5);

    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const reopened = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(reopened.getByRole("tab", { name: "Alignment" }));
    expect(reopened.getByRole("spinbutton", { name: "Desired word spacing" })).toHaveValue(120);
    expect(reopened.getByRole("checkbox", { name: "Expand single word" })).toBeChecked();
    fireEvent.click(reopened.getByRole("tab", { name: "Indents & Spacing" }));
    expect(reopened.getByRole("checkbox", { name: "Automatic" })).toBeChecked();
    fireEvent.click(reopened.getByRole("button", { name: "Cancel" }));

    fireEvent.focus(dialog.getByLabelText("Replace with"));
    fireEvent.click(dialog.getByRole("button", { name: "Format…" }));
    const replacement = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(replacement.getByRole("tab", { name: "Alignment" }));
    fireEvent.click(replacement.getByRole("radio", { name: "Justified" }));
    fireEvent.change(replacement.getByRole("combobox", { name: "Last line" }), {
      target: { value: SvxAdjust.Center },
    });
    fireEvent.change(replacement.getByRole("spinbutton", { name: "Desired word spacing" }), {
      target: { value: 104 },
    });
    fireEvent.click(replacement.getByRole("tab", { name: "Indents & Spacing" }));
    fireEvent.change(replacement.getByRole("spinbutton", { name: "First line" }), {
      target: { value: "0.20 in" },
    });
    fireEvent.click(replacement.getByRole("button", { name: "OK" }));
    fireEvent.click(dialog.getByRole("button", { name: "Replace All" }));

    const applied = match.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem;
    expect(applied.GetLastBlock()).toBe(SvxAdjust.Center);
    expect(applied.GetPropWordSpacing()).toBe(104);
    expect((match.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).IsAutoFirst()).toBe(
      false,
    );
    expect(
      (spacingVariant.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetPropWordSpacingMaximum(),
    ).toBe(140);
    act(
      /** Restores both original items in one undo. @returns Nothing. */
      () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    const restored = match.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem;
    expect(restored.GetLastBlock()).toBe(SvxAdjust.Block);
    expect(restored.GetPropWordSpacing()).toBe(120);
    expect((match.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).IsAutoFirst()).toBe(
      true,
    );
  } finally {
    metric.mockRestore();
    workbench.unmount();
    session.view.Close();
  }
});
