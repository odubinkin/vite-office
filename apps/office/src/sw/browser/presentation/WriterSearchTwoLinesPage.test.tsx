/** @fileoverview Upstream Asian Layout reopening QA against Writer's browser search and replacement dialog. */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  favoritesFull,
  readCharacterList,
  rememberCharacter,
} from "../../../sfx2/browser/control/charmapcontainer";
import { SvxTwoLinesItem } from "../../../editeng/inc/twolinesitem";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { RES_CHRATR_TWO_LINES } from "../../inc/hintids";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { SwAttrIter } from "../../source/core/text/itratr";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterSearchCharacterMap } from "./writer-search-character-map";
import { WriterWorkbench } from "./writer-view";

/** Restores the native character preferences between picker scenarios. @returns Nothing. */
function resetCharacterLists(): void {
  localStorage.removeItem("org.openoffice.Office.Common/RecentCharacters");
  localStorage.removeItem("org.openoffice.Office.Common/FavoriteCharacters");
}

beforeEach(resetCharacterLists);
afterEach(resetCharacterLists);

it("reopens double-line criteria, matches both enclosures and replaces the complete item", /** Adapts the native Asian Layout QA and verifies both sides of Writer search. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const node = shell.GetActiveParagraph();
  shell.Insert("word word word");
  const initial = new SwPosition(node, 0);
  const range = new SwPaM(initial);
  range.SetMark();
  const items = new SfxItemSet(node.GetDoc().GetAttrPool(), [
    [RES_CHRATR_TWO_LINES, RES_CHRATR_TWO_LINES],
  ]);
  for (const [start, left, right] of [
    [0, 0xab, 0x29],
    [5, 0xab, 0x5d],
    [10, 0x28, 0x29],
  ] as const) {
    range.GetMark().SetContent(start);
    range.GetPoint().SetContent(start + 4);
    items.Put(new SvxTwoLinesItem(true, left, right, RES_CHRATR_TWO_LINES));
    node.GetDoc().GetDocumentContentOperationsManager().InsertItemSet(range, items);
  }
  items.Dispose();
  range.Dispose();
  shell.SetCursor(initial);
  initial.Dispose();

  const ui = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const search = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(search.getByText("Other options"));
    const formatButton = search.getByRole("button", { name: "Format…" });
    fireEvent.click(formatButton);
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Asian Layout" }));
    const toggle = format.getByRole("checkbox", { name: "Write in double lines" });
    const first = format.getByRole("combobox", { name: "Initial character" });
    expect(first).toBeDisabled();
    fireEvent.click(toggle);
    fireEvent.change(first, { target: { value: "-1" } });
    const picker = within(screen.getByRole("dialog", { name: "Special Characters" }));
    fireEvent.change(picker.getByRole("textbox", { name: "Hexadecimal" }), {
      target: { value: "AB" },
    });
    expect(picker.getByRole("textbox", { name: "Decimal" })).toHaveValue("171");
    fireEvent.click(picker.getByRole("button", { name: "OK" }));
    expect(first).toHaveValue("171");
    fireEvent.change(format.getByRole("combobox", { name: "Final character" }), {
      target: { value: "41" },
    });
    fireEvent.change(first, { target: { value: "-1" } });
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Special Characters" }), {
      key: "Escape",
    });
    expect(first).toHaveValue("171");
    fireEvent.click(format.getByRole("button", { name: "OK" }));
    expect(search.getByText("«Double-lined)")).toBeVisible();

    fireEvent.click(formatButton);
    const reopened = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(reopened.getByRole("tab", { name: "Asian Layout" }));
    expect(reopened.getByRole("checkbox", { name: "Write in double lines" })).toBeChecked();
    expect(reopened.getByRole("combobox", { name: "Initial character" })).toHaveValue("171");
    fireEvent.click(reopened.getByRole("checkbox", { name: "Write in double lines" }));
    fireEvent.click(reopened.getByRole("button", { name: "Reset" }));
    expect(reopened.getByRole("checkbox", { name: "Write in double lines" })).toBeChecked();
    fireEvent.click(reopened.getByRole("button", { name: "Cancel" }));
    fireEvent.click(search.getByRole("button", { name: "Find All" }));
    const matches = [...shell.GetCursor().GetRingContainer()];
    expect(matches).toHaveLength(1);
    expect(matches[0]?.Start().GetContentIndex()).toBe(0);
    expect(matches[0]?.End().GetContentIndex()).toBe(4);

    fireEvent.focus(search.getByLabelText("Replace with"));
    fireEvent.click(formatButton);
    const replacement = within(screen.getByRole("dialog", { name: "Replace" }));
    fireEvent.click(replacement.getByRole("tab", { name: "Asian Layout" }));
    fireEvent.click(replacement.getByRole("checkbox", { name: "Write in double lines" }));
    fireEvent.change(replacement.getByRole("combobox", { name: "Initial character" }), {
      target: { value: "91" },
    });
    fireEvent.change(replacement.getByRole("combobox", { name: "Final character" }), {
      target: { value: "93" },
    });
    fireEvent.click(replacement.getByRole("button", { name: "OK" }));
    fireEvent.click(search.getByRole("button", { name: "Replace All" }));
    const applied = new SwAttrIter(node);
    applied.Seek(1);
    const item = applied.GetAttrHandler().ReadItem(RES_CHRATR_TWO_LINES) as SvxTwoLinesItem;
    expect([item.GetStartBracket(), item.GetEndBracket()]).toEqual([91, 93]);
    act(
      /** Undoes the entire formatting replacement. @returns Nothing. */
      () => expect(shell.Undo()).toBe(true),
    );
    const restored = new SwAttrIter(node);
    restored.Seek(1);
    expect(
      (
        restored.GetAttrHandler().ReadItem(RES_CHRATR_TWO_LINES) as SvxTwoLinesItem
      ).GetStartBracket(),
    ).toBe(0xab);
  } finally {
    ui.unmount();
    session.view.Close();
  }
});

it("uses ICU character names and native font subsets in the enclosure picker", /** Exercises the generated resources with plain, algorithmic and absent names. @returns Nothing. */ async () => {
  const data = await WriterSearchCharacterMap.Load();
  expect(data.GetName(0x4e00)).toBe("CJK UNIFIED IDEOGRAPH-4E00");
  expect(data.GetName(0xac00)).toBe("HANGUL SYLLABLE GA");
  expect(data.GetName(0xe000)).toBe("");

  const session = createWriterDocumentSession();
  const ui = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const search = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(search.getByText("Other options"));
    fireEvent.click(search.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Asian Layout" }));
    fireEvent.click(format.getByRole("checkbox", { name: "Write in double lines" }));
    const enclosure = format.getByRole("combobox", { name: "Initial character" });
    fireEvent.change(enclosure, { target: { value: "-1" } });

    const picker = within(screen.getByRole("dialog", { name: "Special Characters" }));
    const subset = picker.getByRole("combobox", { name: "Subset" });
    await waitFor(
      /** Waits for the pinned subset list to load. @returns Nothing. */
      () => expect(subset).toBeEnabled(),
    );
    expect(picker.getByRole("option", { name: "General punctuation" })).toBeInTheDocument();
    fireEvent.change(subset, { target: { value: "8192" } });
    expect(picker.getByRole("textbox", { name: "Hexadecimal" })).toHaveValue("2000");
    const searchName = picker.getByRole("textbox", { name: "Search" });
    fireEvent.change(searchName, {
      target: { value: "left-pointing double angle quotation mark" },
    });
    expect(subset).toBeDisabled();
    expect(picker.getByRole("textbox", { name: "Hexadecimal" })).toHaveAttribute("readonly");
    fireEvent.click(picker.getByRole("button", { name: "U+00AB" }));
    expect(picker.getByLabelText("Character Name")).toHaveTextContent(
      "LEFT-POINTING DOUBLE ANGLE QUOTATION MARK",
    );
    fireEvent.change(searchName, { target: { value: " U+00BB " } });
    const closingMark = picker.getByRole("button", { name: "U+00BB" });
    fireEvent.click(closingMark);
    fireEvent.doubleClick(closingMark);
    expect(picker.getByRole("button", { name: "OK" })).toBeVisible();
    fireEvent.keyDown(closingMark, { key: "Enter" });
    expect(enclosure).toHaveValue("187");
    expect(readCharacterList("recent")).toEqual([]);
  } finally {
    ui.unmount();
    session.view.Close();
  }
});

it("loads the native favorites and retains the recent order and font across openings", /** Verifies the real preference lists and context commands through the enclosure picker. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const ui = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const search = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(search.getByText("Other options"));
    fireEvent.click(search.getByRole("button", { name: "Format…" }));
    const format = within(screen.getByRole("dialog", { name: "Search" }));
    fireEvent.click(format.getByRole("tab", { name: "Asian Layout" }));
    fireEvent.click(format.getByRole("checkbox", { name: "Write in double lines" }));
    const enclosure = format.getByRole("combobox", { name: "Initial character" });

    /** Opens the picker from its source list. @returns Picker queries. */
    function open() {
      fireEvent.change(enclosure, { target: { value: "-1" } });
      return within(screen.getByRole("dialog", { name: "Special Characters" }));
    }

    let picker = open();
    const shipped = within(picker.getByRole("group", { name: "Favorite Characters" }));
    expect(shipped.getAllByRole("button")).toHaveLength(12);
    expect(
      within(picker.getByRole("group", { name: "Recent Characters" })).queryAllByRole("button"),
    ).toHaveLength(0);
    fireEvent.click(shipped.getByRole("button", { name: "€ — Liberation Serif" }));
    expect(picker.getByRole("textbox", { name: "Font" })).toHaveValue("Liberation Serif");
    expect(picker.getByRole("textbox", { name: "Hexadecimal" })).toHaveValue("20AC");
    fireEvent.change(picker.getByRole("textbox", { name: "Hexadecimal" }), {
      target: { value: "AB" },
    });
    fireEvent.click(picker.getByRole("button", { name: "Add to Favorites" }));
    expect(shipped.getAllByRole("button")).toHaveLength(13);
    expect(readCharacterList("recent")).toEqual([]);
    fireEvent.click(picker.getByRole("button", { name: "OK" }));
    expect(readCharacterList("recent")).toEqual([{ character: "«", font: "Liberation Serif" }]);

    picker = open();
    fireEvent.click(
      within(picker.getByRole("group", { name: "Favorite Characters" })).getByRole("button", {
        name: "€ — Liberation Serif",
      }),
    );
    fireEvent.click(picker.getByRole("button", { name: "OK" }));
    picker = open();
    const recent = within(picker.getByRole("group", { name: "Recent Characters" }));
    expect(
      recent.getAllByRole("button").map(
        /** Reads glyph order from the native recent group. @param button - Recent glyph button. @returns Glyph. */
        (button) => button.textContent,
      ),
    ).toEqual(["€", "«"]);
    fireEvent.click(recent.getByRole("button", { name: "« — Liberation Serif" }));
    fireEvent.click(picker.getByRole("button", { name: "OK" }));
    expect(
      readCharacterList("recent").map(
        /** Projects the committed recency order. @param pair - Recent glyph. @returns Character. */
        (pair) => pair.character,
      ),
    ).toEqual(["«", "€"]);

    picker = open();
    const favorites = within(picker.getByRole("group", { name: "Favorite Characters" }));
    fireEvent.contextMenu(favorites.getByRole("button", { name: "« — Liberation Serif" }));
    fireEvent.click(picker.getByRole("menuitem", { name: "Remove" }));
    expect(favorites.getAllByRole("button")).toHaveLength(12);
    fireEvent.contextMenu(
      within(picker.getByRole("group", { name: "Recent Characters" })).getByRole("button", {
        name: "« — Liberation Serif",
      }),
    );
    fireEvent.click(picker.getByRole("menuitem", { name: "Clear All" }));
    expect(readCharacterList("recent")).toEqual([]);
    expect(readCharacterList("favorite")).toHaveLength(12);
    fireEvent.click(picker.getByRole("button", { name: "Cancel" }));
  } finally {
    ui.unmount();
    session.view.Close();
  }
});

it("keeps the sixteen newest unique pairs and distinguishes the same glyph in other fonts", /** Exercises the native SfxCharmapContainer list rules. @returns Nothing. */ () => {
  const filled = Array.from(
    { length: 16 },
    /** Builds an existing recent list. @param unused - Empty slot. @param index - Row index. @returns Character and font. */ (
      _unused,
      index,
    ) => ({
      character: String.fromCodePoint(0x41 + index),
      font: "Liberation Serif",
    }),
  );
  const alternate = { character: "A", font: "Liberation Sans" };
  const retained = rememberCharacter(filled, alternate);
  expect(retained).toEqual([alternate, ...filled.slice(0, 15)]);
  expect(rememberCharacter(retained, alternate)).toEqual(retained);
  expect(favoritesFull(filled)).toBe(true);
  expect(favoritesFull(filled.slice(0, 15))).toBe(false);
});
