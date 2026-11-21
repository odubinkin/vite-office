/** @fileoverview Exercises Writer's Character dialog modes and formatting history. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SvxKerningItem } from "../../../editeng/inc/kernitem";
import { SfxGrabBagItem } from "../../../svl/inc/grabbagitem";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { Color } from "../../../tools/inc/color";
import {
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_KERNING,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { EE_CHAR_FONTHEIGHT } from "../../../editeng/inc/eeitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { FN_PARAM_1 } from "../../inc/cmdid";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

/** Creates two anchored comments over a plain Writer paragraph. @returns Writer session view and document shell. */
function openCommentFormattingDocument() {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("Document text");
  const node = shell.GetActiveParagraph();
  const fieldType = SwPostItFieldType.Get(shell.GetDoc());
  for (const [author, offset] of [
    ["Ada", 2],
    ["Grace", 7],
  ] as const) {
    const field = new SwPostItField(fieldType, {
      author,
      initials: "",
      text: author,
      name: author,
      dateTime: new DateTime(DateTime.EMPTY),
    });
    const format = new SwFormatField(field);
    field.Dispose();
    expect(node.InsertHint(new SwTextField(format, offset))).toBe(true);
  }
  return { view, shell };
}

it("uses the active note's attributes and formats all notes in one Writer undo action", /** Exercises dialog tabs, cancel, seed merging and bulk history from the native comment popup. @returns Completion. */ async () => {
  const { view, shell } = openCommentFormattingDocument();
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    const grace = screen.getByRole("textbox", { name: "Comment — Grace" });
    act(
      /** Seeds the second note with bold formatting. @returns Nothing. */ () => {
        grace.focus();
        view.Execute(WRITER_COMMAND_IDS.selectAll);
        view.Execute(WRITER_COMMAND_IDS.bold);
      },
    );
    const card = grace.closest("article");
    if (!card) throw new Error("Missing annotation card.");
    /** Opens the original comment popup action. @returns Open dialog. */
    function openFormatAll(): HTMLElement {
      if (!card) throw new Error("Missing annotation card.");
      fireEvent.click(within(card).getByLabelText("Comment actions"));
      fireEvent.click(within(card).getByRole("button", { name: "Format All Comments…" }));
      return screen.getByRole("dialog", { name: "Character" });
    }
    const undo = shell.GetDoc().GetUndoManager();
    const before = undo.GetUndoActionCount();
    const cancelled = openFormatAll();
    expect(within(cancelled).getByRole("combobox", { name: "Style" })).toHaveValue("2");
    expect(within(cancelled).getAllByRole("tab")).toHaveLength(4);
    fireEvent.change(within(cancelled).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "28" },
    });
    fireEvent.click(within(cancelled).getByRole("button", { name: "Cancel" }));
    expect(undo.GetUndoActionCount()).toBe(before);

    const dialog = openFormatAll();
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "18" },
    });
    fireEvent.click(within(dialog).getByRole("tab", { name: "Position" }));
    fireEvent.change(within(dialog).getByRole("combobox", { name: "Position" }), {
      target: { value: "2" },
    });
    await act(
      /** Finishes the asynchronous Character request before checking the notes. @returns Completion. */ async () => {
        fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
      },
    );
    expect(within(ada).getByText("Ada").style.fontSize).toBe("10.44pt");
    expect(within(ada).getByText("Ada").style.verticalAlign).toBe("sub");
    expect(within(ada).getByText("Ada").style.fontWeight).toBe("bold");
    expect(within(grace).getByText("Grace").style.fontSize).toBe("10.44pt");
    expect(within(grace).getByText("Grace").style.fontWeight).toBe("bold");
    expect(undo.GetUndoActionCount()).toBe(before + 1);
    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
    act(
      /** Replays the entire native bulk-formatting group. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontWeight).not.toBe("bold");
    expect(within(grace).getByText("Grace").style.fontWeight).toBe("bold");
    act(
      /** Reapplies the entire native bulk-formatting group. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontWeight).toBe("bold");
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("opens Character from the Format menu and applies only the selected annotation range", /** Verifies the original menu placement, selection formatting, local history and note focus. @returns Completion. */ async () => {
  const { view, shell } = openCommentFormattingDocument();
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    const grace = screen.getByRole("textbox", { name: "Comment — Grace" });
    act(
      /** Makes Ada's final two letters the active selection. @returns Nothing. */ () => {
        ada.focus();
        const text = ada.querySelector("span")?.firstChild;
        if (!text) throw new Error("Missing annotation text.");
        document.getSelection()?.setBaseAndExtent(text, 1, text, 3);
        fireEvent(document, new Event("selectionchange"));
      },
    );
    expect(document.getSelection()?.toString()).toBe("da");
    expect(
      view.GetPostItMgr().GetActiveSidebarWin()?.view.getImpl().GetEditSelection().HasRange(),
    ).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.fontDialog).enabled).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Character/u }));
    const character = screen.getByRole("dialog", { name: "Character" });
    expect(within(character).getByRole("tab", { name: "Font" })).toHaveFocus();
    fireEvent.change(within(character).getByRole("spinbutton", { name: "Size" }), {
      target: { value: "20" },
    });
    await act(
      /** Completes the real annotation Character request. @returns Completion. */ async () => {
        fireEvent.click(within(character).getByRole("button", { name: "OK" }));
      },
    );
    expect(ada).toHaveFocus();
    expect(within(ada).getByText("da").style.fontSize).toBe("20pt");
    expect(within(ada).getByText("A").style.fontSize).not.toBe("20pt");
    expect(within(grace).getByText("Grace").style.fontSize).not.toBe("20pt");
    expect(document.getSelection()?.toString()).toBe("da");
    act(
      /** Undoes only this selected range edit. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(within(ada).getByText("Ada").style.fontSize).not.toBe("20pt");
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("honors the original Character page slots and applies direct EditEngine items", /** Exercises the explicit Page string, specialized slots and direct attribute request. @returns Completion. */ async () => {
  const { view } = openCommentFormattingDocument();
  const page = new SfxStringItem(FN_PARAM_1, "background");
  const height = new SvxFontHeightItem(460, 100, EE_CHAR_FONTHEIGHT);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const ada = screen.getByRole("textbox", { name: "Comment — Ada" });
    act(
      /** Selects the complete first annotation. @returns Nothing. */ () => {
        ada.focus();
        view.Execute(WRITER_COMMAND_IDS.selectAll);
      },
    );
    for (const [command, args, tab] of [
      [WRITER_COMMAND_IDS.fontEffectsDialog, [], "Font Effects"],
      [WRITER_COMMAND_IDS.fontPositionDialog, [page], "Position"],
      [WRITER_COMMAND_IDS.fontDialog, [page], "Background"],
    ] as const) {
      act(
        /** Opens one of the native Character routes. @returns Nothing. */ () => {
          view.Execute(command, args);
        },
      );
      const character = screen.getByRole("dialog", { name: "Character" });
      expect(within(character).getByRole("tab", { name: tab })).toHaveFocus();
      await act(
        /** Closes the modal before invoking the next native command. @returns Completion. */ async () => {
          fireEvent.click(within(character).getByRole("button", { name: "Cancel" }));
        },
      );
      expect(ada).toHaveFocus();
    }
    await act(
      /** Dispatches original formatting arguments without opening a modal. @returns Completion. */ async () => {
        view.Execute(WRITER_COMMAND_IDS.fontPositionDialog, [height]);
      },
    );
    expect(screen.queryByRole("dialog", { name: "Character" })).toBeNull();
    expect(within(ada).getByText("Ada").style.fontSize).toBe("23pt");
  } finally {
    height.Dispose();
    page.Dispose();
    workbench.unmount();
    view.Close();
  }
});

it("applies body Character deltas over the selected text, preserving mixed values and restoring focus", /** Covers the original text shell, mixed font state, explicit spacing, selection and undo. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("alpha beta");
  const node = shell.GetActiveParagraph();
  const start = new SwPosition(node, 0);
  const middle = new SwPosition(node, 5);
  const end = new SwPosition(node, 10);
  const seed = new SfxItemSet(shell.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  seed.Put(new SvxFontHeightItem(480, 100, RES_CHRATR_FONTSIZE), true);
  shell.SetPaM(middle, start);
  shell.SetAttrSet(seed);
  shell.SetPaM(end, start);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const body = screen.getByLabelText("Writer document body");
    const undo = shell.GetDoc().GetUndoManager();
    const before = undo.GetUndoActionCount();
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Character…" }));
    const dialog = screen.getByRole("dialog", { name: "Character" });
    expect(within(dialog).getByRole("spinbutton", { name: "Size" })).toHaveValue(null);
    fireEvent.click(within(dialog).getByRole("tab", { name: "Position" }));
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Character spacing" }), {
      target: { value: "-1.5" },
    });
    await act(
      /** Accepts only the changed native signed kerning item. @returns Completion. */ async () => {
        fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
      },
    );
    expect(body).toHaveFocus();
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(0);
    expect(shell.GetCursor().End().GetContentIndex()).toBe(10);
    const first = node.GetCharacterItemsAt(2);
    const last = node.GetCharacterItemsAt(8);
    try {
      expect((first.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(480);
      expect((last.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).not.toBe(480);
      expect((first.Get(RES_CHRATR_KERNING) as SvxKerningItem).GetValue()).toBe(-30);
      expect((last.Get(RES_CHRATR_KERNING) as SvxKerningItem).GetValue()).toBe(-30);
    } finally {
      first.Dispose();
      last.Dispose();
    }
    expect(undo.GetUndoActionCount()).toBe(before + 1);
    act(
      /** Removes the Character delta in one undo action. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    const restored = node.GetCharacterItemsAt(2);
    try {
      expect((restored.Get(RES_CHRATR_KERNING) as SvxKerningItem).GetValue()).toBe(0);
      expect((restored.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(480);
    } finally {
      restored.Dispose();
    }
  } finally {
    workbench.unmount();
    seed.Dispose();
    start.Dispose();
    middle.Dispose();
    end.Dispose();
    view.Close();
  }
});

it("uses visible imported highlighting as input and clears its marker only when the body background changes", /** Exercises native Character brush conversion and applies accepted output through Writer history. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("shaded");
  const node = shell.GetActiveParagraph();
  const point = new SwPosition(node, node.Len());
  const mark = new SwPosition(node, 0);
  const initial = new SfxItemSet(shell.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  initial.Put(new SvxBrushItem(new Color(0x112233), RES_CHRATR_BACKGROUND), true);
  initial.Put(new SvxBrushItem(new Color(0xffee00), RES_CHRATR_HIGHLIGHT), true);
  const shading = new Any([true], "bool");
  initial.Put(
    new SfxGrabBagItem(RES_CHRATR_GRABBAG, new Map([["CharShadingMarker", shading]])),
    true,
  );
  shading.dispose();
  shell.SetPaM(point, mark);
  shell.SetAttrSet(initial);
  const page = new SfxStringItem(FN_PARAM_1, "background");
  try {
    view.Execute(WRITER_COMMAND_IDS.fontDialog, [page]);
    const controller = view.GetDialogController();
    const request = controller.GetSnapshot();
    if (!request || request.request.kind !== "character")
      throw new Error("Missing Character request.");
    expect(request.request.mode).toBe("standard");
    expect(request.request.initialPage).toBe("background");
    const input = request.request.input;
    expect((input.Get(RES_CHRATR_BACKGROUND) as SvxBrushItem).GetColor().toUInt32()).toBe(0xffee00);

    const output = new SfxItemSet(input.GetPool(), input.GetRanges());
    output.Put(new SvxBrushItem(new Color(0xabcdef), RES_CHRATR_BACKGROUND), true);
    expect(controller.Complete(request.id, { attributes: output })).toBe(true);
    await act(
      /** Allows the native asynchronous slot to apply its accepted attribute set. @returns Completion. */ async () => {
        await Promise.resolve();
      },
    );
    const result = node.GetCharacterItemsAt(2);
    try {
      expect((result.Get(RES_CHRATR_BACKGROUND) as SvxBrushItem).GetColor().toUInt32()).toBe(
        0xabcdef,
      );
      expect(
        (result.Get(RES_CHRATR_HIGHLIGHT) as SvxBrushItem).GetColor().IsFullyTransparent(),
      ).toBe(true);
      const marker: [boolean] = [true];
      const bag = result.Get(RES_CHRATR_GRABBAG) as SfxGrabBagItem;
      expect(bag.GetGrabBag().get("CharShadingMarker")?.extract(marker, "bool")).toBe(true);
      expect(marker[0]).toBe(false);
    } finally {
      result.Dispose();
    }
  } finally {
    page.Dispose();
    initial.Dispose();
    point.Dispose();
    mark.Dispose();
    view.Close();
  }
});
