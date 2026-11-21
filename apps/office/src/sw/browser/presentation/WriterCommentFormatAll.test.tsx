/** @fileoverview Exercises Writer's Character dialog modes and formatting history. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxUnderlineItem } from "../../../editeng/inc/udlnitem";
import { SvxWordLineModeItem } from "../../../editeng/inc/wrlmitem";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SvxEscapementItem } from "../../../editeng/inc/escapementitem";
import { SvxKerningItem } from "../../../editeng/inc/kernitem";
import { SfxGrabBagItem } from "../../../svl/inc/grabbagitem";
import { SfxItemSet } from "../../../svl/inc/itemset";
import { Color } from "../../../tools/inc/color";
import {
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_BOX,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_GRABBAG,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_KERNING,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WORDLINEMODE,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { FontLineStyle, FontEmphasisMark } from "../../../tools/inc/fontenum";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "../filter/xml/odt-transfer";
import {
  EE_CHAR_CASEMAP,
  EE_CHAR_EMPHASISMARK,
  EE_CHAR_FONTHEIGHT,
  EE_CHAR_OVERLINE,
  EE_CHAR_OUTLINE,
  EE_CHAR_SHADOW,
} from "../../../editeng/inc/eeitem";
import { SvxCaseMap } from "../../../editeng/inc/svxenum";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { FN_PARAM_1 } from "../../inc/cmdid";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwAttrIter } from "../../source/core/text/itratr";
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
    fireEvent.click(within(dialog).getByRole("radio", { name: "Subscript" }));
    expect(within(dialog).getByRole("checkbox", { name: "Automatic" })).toBeChecked();
    fireEvent.click(within(dialog).getByRole("checkbox", { name: "Pair kerning" }));
    await act(
      /** Finishes the asynchronous Character request before checking the notes. @returns Completion. */ async () => {
        fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
      },
    );
    expect(within(ada).getByText("Ada").style.fontSize).toBe("10.44pt");
    expect(within(ada).getByText("Ada").style.verticalAlign).toBe("sub");
    expect(within(ada).getByText("Ada").style.fontKerning).toBe("normal");
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
    const controls = within(character);
    fireEvent.change(controls.getByRole("spinbutton", { name: "Size" }), {
      target: { value: "20" },
    });
    fireEvent.click(controls.getByRole("tab", { name: "Font Effects" }));
    const style = controls.getByRole("combobox", { name: "Emphasis mark" });
    const position = controls.getByRole("combobox", { name: "Position" });
    expect(position).toBeDisabled();
    fireEvent.change(style, { target: { value: FontEmphasisMark.Dot } });
    fireEvent.change(position, { target: { value: FontEmphasisMark.PosBelow } });
    fireEvent.change(controls.getByLabelText("Effects"), {
      target: { value: SvxCaseMap.Uppercase },
    });
    fireEvent.click(controls.getByRole("checkbox", { name: "Outline" }));
    fireEvent.click(controls.getByRole("checkbox", { name: "Shadow" }));
    fireEvent.change(controls.getByLabelText("Overlining"), {
      target: { value: FontLineStyle.LINESTYLE_DOUBLE },
    });
    fireEvent.click(controls.getByLabelText("Overline color palette"));
    fireEvent.click(controls.getByRole("button", { name: "Overline color #ff0000" }));
    await act(
      /** Completes the real annotation Character request. @returns Completion. */ async () => {
        fireEvent.click(within(character).getByRole("button", { name: "OK" }));
      },
    );
    expect(ada).toHaveFocus();
    const selected = within(ada).getByText("da");
    expect(selected).toHaveStyle({
      textDecorationLine: "overline",
      textDecorationStyle: "double",
      textDecorationColor: "#ff0000",
    });
    expect(selected.parentElement).toHaveStyle({
      fontSize: "20pt",
      textTransform: "uppercase",
      textShadow: "2px 2px #c0c0c0",
      textEmphasisStyle: "filled dot",
      textEmphasisPosition: "under right",
    });
    for (const untouched of [within(ada).getByText("A"), within(grace).getByText("Grace")]) {
      expect(untouched.style.fontSize).not.toBe("20pt");
      expect(untouched.style.textEmphasisStyle).toBe("");
    }
    expect(document.getSelection()?.toString()).toBe("da");

    const transfer = createOdtWriterTransfer(shell.GetDoc());
    const restored = restoreOdtWriterTransfer(structuredClone(transfer));
    try {
      const metadata = { title: "Annotation emphasis" };
      const { document: reopened } = await readOdtDocument(
        await writeOdtDocument(restored, metadata),
        metadata,
      );
      try {
        const notes = createOdtWriterTransfer(reopened).graph.annotations;
        const items = notes?.find(
          /** Locates the selected annotation. @param note - Reopened note. @returns Author match. */
          (note) => note.author === "Ada",
        )?.editText?.paragraphs[0]?.characterItems;
        expect(items).toContainEqual({
          start: 1,
          end: 3,
          item: { which: EE_CHAR_CASEMAP, value: SvxCaseMap.Uppercase },
        });
        for (const which of [EE_CHAR_OUTLINE, EE_CHAR_SHADOW])
          expect(items).toContainEqual({ start: 1, end: 3, item: { which, value: true } });
        expect(items).toContainEqual({
          start: 1,
          end: 3,
          item: {
            which: EE_CHAR_EMPHASISMARK,
            value: FontEmphasisMark.Dot | FontEmphasisMark.PosBelow,
          },
        });
        expect(items).toContainEqual({
          start: 1,
          end: 3,
          item: {
            which: EE_CHAR_OVERLINE,
            value: {
              style: FontLineStyle.LINESTYLE_DOUBLE,
              kind: "svx-text-line",
              color: 0xff0000,
            },
          },
        });
      } finally {
        reopened.Dispose();
      }
    } finally {
      restored.Dispose();
    }
    act(
      /** Undoes only this selected range edit. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    const undone = within(ada).getByText("Ada");
    expect(undone.style.fontSize).not.toBe("20pt");
    expect(undone.style.textEmphasisStyle).toBe("");
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

it("applies character borders to the selected text and restores the native box from ODT", /** Exercises the standard Character border page, its browser projection, grouped history and Writer save/open. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("plain boxed tail");
  const node = shell.GetActiveParagraph();
  const start = new SwPosition(node, 6);
  const end = new SwPosition(node, 11);
  shell.SetPaM(end, start);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    act(
      /** Uses the original Character slot Page argument. @returns Nothing. */ () => {
        const page = new SfxStringItem(FN_PARAM_1, "borders");
        try {
          view.Execute(WRITER_COMMAND_IDS.fontDialog, [page]);
        } finally {
          page.Dispose();
        }
      },
    );
    const dialog = screen.getByRole("dialog", { name: "Character" });
    expect(within(dialog).getByRole("tab", { name: "Borders" })).toHaveFocus();
    fireEvent.click(within(dialog).getByRole("button", { name: "All Four Borders" }));
    await act(
      /** Commits the border page's native box delta. @returns Completion. */ async () => {
        fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
      },
    );
    const decorated = screen.getByText("boxed");
    expect(decorated.style.borderTopStyle).toBe("solid");
    expect(decorated.style.borderRightStyle).toBe("solid");
    const items = node.GetCharacterItemsAt(8);
    const outside = node.GetCharacterItemsAt(2);
    try {
      const box = items.Get(RES_CHRATR_BOX) as SvxBoxItem;
      expect(box.GetLeft()).toBeDefined();
      expect(box.GetDistance(0)).toBeGreaterThan(0);
      expect((outside.Get(RES_CHRATR_BOX) as SvxBoxItem).GetLeft()).toBeUndefined();
      const metadata = { title: "Character borders" };
      const { document: reopened } = await readOdtDocument(
        await writeOdtDocument(shell.GetDoc(), metadata),
        metadata,
      );
      try {
        const reopenedParagraph = reopened.paragraphs[0];
        expect(reopenedParagraph).toBeDefined();
        if (!reopenedParagraph) throw new Error("Expected the reopened document paragraph");
        const reopenedItems = reopenedParagraph.GetCharacterItemsAt(8);
        try {
          expect((reopenedItems.Get(RES_CHRATR_BOX) as SvxBoxItem).equals(box)).toBe(true);
        } finally {
          reopenedItems.Dispose();
        }
      } finally {
        reopened.Dispose();
      }
    } finally {
      items.Dispose();
      outside.Dispose();
    }
    act(
      /** Restores the selected character formatting as a native undo action. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(screen.queryByText("boxed")).toBeNull();
    expect(screen.getByLabelText("Writer document body")).toHaveTextContent("plain boxed tail");
  } finally {
    workbench.unmount();
    start.Dispose();
    end.Dispose();
    view.Close();
  }
});

it("cycles mixed word-line formatting and preserves the exact spacing on undo", /** Exercises the native tri-state, word painting and selected item history. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  const value = "one two three";
  shell.Insert(value);
  const node = shell.GetActiveParagraph();
  const start = new SwPosition(node, 0);
  const middle = new SwPosition(node, 7);
  const end = new SwPosition(node, value.length);
  const attributes = new SfxItemSet(shell.GetDoc().GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  shell.SetPaM(end, start);
  attributes.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE), true);
  shell.SetAttrSet(attributes);
  attributes.ClearItem();
  shell.SetPaM(middle, start);
  attributes.Put(new SvxWordLineModeItem(true, RES_CHRATR_WORDLINEMODE), true);
  shell.SetAttrSet(attributes);
  attributes.Dispose();
  shell.SetPaM(end, start);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const body = screen.getByLabelText("Writer document body");
    expect(body.textContent).toBe(value);
    expect(screen.getByText("one")).toHaveStyle({ textDecoration: "underline" });
    expect(screen.getByText("two")).toHaveStyle({ textDecoration: "underline" });

    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Character…" }));
    const controls = within(screen.getByRole("dialog", { name: "Character" }));
    fireEvent.click(controls.getByRole("tab", { name: "Font Effects" }));
    const box = controls.getByRole("checkbox", { name: "Individual words" });
    expect(box).toBePartiallyChecked();
    fireEvent.click(box);
    expect(box).not.toBePartiallyChecked();
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect(box).toBePartiallyChecked();
    fireEvent.click(box);
    await act(
      /** Applies explicit false to both portions as one native operation. @returns Completion. */ async () => {
        fireEvent.click(controls.getByRole("button", { name: "OK" }));
      },
    );
    expect(body.textContent).toBe(value);
    expect(screen.queryByText("one", { exact: true })).toBeNull();
    expect(screen.getByText("one two three")).toHaveStyle({ textDecoration: "underline" });
    act(
      /** Restores the earlier uneven word-line formatting. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(screen.getByText("one")).toHaveStyle({ textDecoration: "underline" });
    expect(body.textContent).toBe(value);
  } finally {
    workbench.unmount();
    end.Dispose();
    middle.Dispose();
    start.Dispose();
    view.Close();
  }
});

it("applies and restores manual script size and pair kerning through Writer Character", /** Covers native values, reset, presentation and undo. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("VA");
  const paragraph = shell.GetActiveParagraph();
  const start = new SwPosition(paragraph, 0);
  const end = new SwPosition(paragraph, 2);
  shell.SetPaM(end, start);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Character…" }));
    const controls = within(screen.getByRole("dialog", { name: "Character" }));
    fireEvent.click(controls.getByRole("tab", { name: "Position" }));
    const normal = controls.getByRole("radio", { name: "Normal" });
    expect(normal).toBeChecked();
    fireEvent.click(controls.getByRole("radio", { name: "Superscript" }));
    expect(controls.getByRole("spinbutton", { name: "Raise/lower by" })).toBeDisabled();
    fireEvent.click(controls.getByRole("button", { name: "Reset" }));
    expect(controls.getByRole("radio", { name: "Normal" })).toBeChecked();
    fireEvent.click(controls.getByRole("radio", { name: "Superscript" }));
    fireEvent.click(controls.getByRole("checkbox", { name: "Automatic" }));
    fireEvent.change(controls.getByRole("spinbutton", { name: "Raise/lower by" }), {
      target: { value: "37" },
    });
    fireEvent.change(controls.getByRole("spinbutton", { name: "Relative font size" }), {
      target: { value: "70" },
    });
    expect(controls.getByRole("checkbox", { name: "Pair kerning" })).toBeChecked();
    fireEvent.click(controls.getByRole("checkbox", { name: "Pair kerning" }));
    await act(
      /** Applies the native output set in one operation. @returns Completion. */ async () => {
        fireEvent.click(controls.getByRole("button", { name: "OK" }));
      },
    );
    const iterator = new SwAttrIter(paragraph);
    iterator.Seek(1);
    const handler = iterator.GetAttrHandler();
    const offset = handler.ReadItem(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem;
    expect([offset.GetEsc(), offset.GetProportionalHeight()]).toEqual([37, 70]);
    expect(handler.ReadItem(RES_CHRATR_AUTOKERN).QueryValue()).toBe(false);
    expect(screen.getByText("VA").closest("[data-native-escapement]")).toHaveAttribute(
      "data-native-escapement-height",
      "70",
    );
    expect(screen.getByText("VA").closest('[style*="font-kerning"]')).toHaveStyle(
      "font-kerning: none",
    );
    act(
      /** Undoes formatting without changing the selected text. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(screen.getByText("VA").closest("[data-native-escapement]")).toBeNull();
    expect(screen.getByText("VA").closest("p")).toHaveStyle("font-kerning: normal");
  } finally {
    workbench.unmount();
    end.Dispose();
    start.Dispose();
    view.Close();
  }
});
