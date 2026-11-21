/** @fileoverview Tests the mounted annotation surface and the native Find and Replace comment option. */
import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  EE_CHAR_BKGCOLOR,
  EE_CHAR_COLOR,
  EE_CHAR_ESCAPEMENT,
  EE_CHAR_FONTHEIGHT_CJK,
  EE_CHAR_WEIGHT,
  EE_CHAR_WEIGHT_CJK,
  EE_PARA_SBL,
} from "../../../editeng/inc/eeitem";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import type { EECharAttrib } from "../../../editeng/inc/editdata";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_PROP,
  SvxEscapementItem,
} from "../../../editeng/inc/escapementitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SvxWeightItem } from "../../../editeng/inc/wghtitem";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { FontWeight } from "../../../tools/inc/fontenum";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwTextAPIEditSource } from "../../source/core/fields/textapi";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { ESelection } from "../../../editeng/inc/ESelection";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { getWriterTextCaretPoint } from "../editor/writer-selection";
import { WriterWorkbench } from "./writer-view";

/** Opens a Writer session with one native annotation attached to a body paragraph. @param note - Initial comment text. @returns Mounted workbench and native field. */
function openAnnotatedDocument(note: string) {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("Document text");
  const node = shell.GetActiveParagraph();
  const field = new SwPostItField(SwPostItFieldType.Get(node.GetDoc()), {
    author: "Ada",
    initials: "A",
    text: note,
    name: "comment1",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const format = new SwFormatField(field);
  field.Dispose();
  expect(node.InsertHint(new SwTextField(format, 4))).toBe(true);
  return { session, shell, format };
}

/** Reads displayed note text including paragraph separators. @param comment - Mounted comment. @returns Displayed string. */
function noteText(comment: HTMLElement): string {
  return Array.from(
    comment.children,
    /** Reads one rendered paragraph. @param paragraph - Paragraph. @returns Paragraph text. */ (
      paragraph,
    ) => paragraph.textContent,
  ).join("\n");
}

/** Selects a native browser range in the note. @param comment - Mounted comment. @param start - Paragraph-relative start. @param end - Paragraph-relative end. @param index - Starting paragraph index. @param endIndex - Ending paragraph index. @returns Nothing. */
function selectNote(
  comment: HTMLElement,
  start: number,
  end = start,
  index = 0,
  endIndex = index,
): void {
  const startParagraph = comment.children[index];
  const endParagraph = comment.children[endIndex];
  if (
    !(startParagraph instanceof HTMLParagraphElement) ||
    !(endParagraph instanceof HTMLParagraphElement)
  )
    throw new Error("Missing note paragraph.");
  const first = getWriterTextCaretPoint(startParagraph, start);
  const last = getWriterTextCaretPoint(endParagraph, end);
  comment.ownerDocument
    .getSelection()
    ?.setBaseAndExtent(first.node, first.offset, last.node, last.offset);
  fireEvent(comment.ownerDocument, new Event("selectionchange"));
}

/** Dispatches a browser edit intent as the editable host receives it. @param comment - Mounted comment. @param type - Platform input type. @param data - Inserted text. @returns Whether the native event was canceled. */
function noteInput(comment: HTMLElement, type: string, data?: string): boolean {
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: type,
    data: data ?? null,
  });
  fireEvent(comment, event);
  return event.defaultPrevented;
}

it("focuses the matched comment, replaces its selection and undoes through Writer", /** Exercises the mounted sidebar, dialog option, selection, document field and undo. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("prefix target suffix");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const sidebar = screen.getByRole("complementary", { name: "Comments" });
    const comment = within(sidebar).getByRole<HTMLDivElement>("textbox", {
      name: "Comment — Ada",
    });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const styles = dialog.getByRole("checkbox", { name: "Search for styles" });
    const comments = dialog.getByRole("checkbox", { name: "Comments" });
    fireEvent.click(styles);
    expect(comments).toBeDisabled();
    fireEvent.click(styles);
    expect(comments).toBeEnabled();
    fireEvent.click(comments);
    expect(styles).toBeDisabled();
    expect(dialog.getByRole("button", { name: "Find All" })).toBeDisabled();
    expect(dialog.getByRole("button", { name: "Replace All" })).toBeDisabled();
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "target" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "new" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(comment).toHaveFocus();
    expect(document.getSelection()?.toString()).toBe("target");
    fireEvent.click(dialog.getByRole("button", { name: /^Replace$/ }));
    expect(noteText(comment)).toBe("prefix new suffix");
    expect(format.GetField().GetPar2()).toBe("prefix new suffix");
    act(
      /** Undoes through the document's native undo owner. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(format.GetField().GetPar2()).toBe("prefix target suffix");
    expect(noteText(comment)).toBe("prefix target suffix");
    act(
      /** Redoes through the same document history. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(noteText(comment)).toBe("prefix new suffix");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("searches from the focused comment caret and releases it on document input", /** Exercises native annotation activation and continued match visibility. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("target between target");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    const manager = session.view.GetPostItMgr();
    act(
      /** Focuses the note and puts the caret after its first match. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 6);
      },
    );
    expect(manager.GetActiveField() === format).toBe(true);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(4);
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    if (!comments.checked) fireEvent.click(comments);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "target" } });
    const findNext = dialog.getByRole("button", { name: "Find Next" });
    act(
      /** Mimics the browser moving focus to a clicked dialog button. @returns Nothing. */ () =>
        findNext.focus(),
    );
    expect(manager.GetActiveField() === format).toBe(true);
    fireEvent.click(findNext);
    expect(comment).toHaveFocus();
    expect(document.getSelection()?.toString()).toBe("target");

    const close = dialog.getByRole("button", { name: "Close" });
    act(/** Moves focus to the dialog's Close button. @returns Nothing. */ () => close.focus());
    fireEvent.click(close);
    expect(comment).toHaveFocus();
    fireEvent.mouseDown(screen.getByLabelText("Writer document body"));
    expect(manager.GetActiveField()).toBeUndefined();
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("preserves the inactive comment selection when it has no match", /** Exercises the failed sidebar probe followed by a body match. @returns Nothing. */ () => {
  const { session, shell } = openAnnotatedDocument("miss between words");
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    act(
      /** Leaves a noncollapsed selection in the inactive annotation. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 5, 12);
      },
    );
    fireEvent.mouseDown(screen.getByLabelText("Writer document body"));
    act(
      /** Moves device focus back to the body editing host. @returns Nothing. */ () =>
        screen.getByLabelText("Writer document body").focus(),
    );
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    if (!comments.checked) fireEvent.click(comments);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "text" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(shell.GetSelText()).toBe("text");
    expect(comment).not.toHaveFocus();
    act(
      /** Returns to the note without letting the failed search overwrite its previous range. @returns Nothing. */ () => {
        const [field] = SwPostItFieldType.Get(shell.GetDoc()).GatherFields();
        if (!field) throw new Error("Missing comment.");
        session.view.GetPostItMgr().Focus(field);
      },
    );
    expect(document.getSelection()?.toString()).toBe("between");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("finds a Unicode regex in a later note paragraph and replaces its selection literally", /** Verifies native EditEngine replacement and Writer document undo. @returns Nothing. */ () => {
  const previous = "intro\n😀7 tail";
  const replacement = "intro\n$1\nnext tail";
  const { session, shell, format } = openAnnotatedDocument(previous);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    const regex = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Regular expressions" });
    if (!comments.checked) fireEvent.click(comments);
    if (!regex.checked) fireEvent.click(regex);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "(😀)7" } });
    fireEvent.change(dialog.getByLabelText("Replace with"), { target: { value: "$1" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(comment).toHaveFocus();
    expect(document.getSelection()?.toString()).toBe("😀7");
    fireEvent.click(dialog.getByRole("button", { name: /^Replace$/ }));
    expect(format.GetField().GetPar2()).toBe("intro\n$1 tail");
    expect(noteText(comment)).toBe("intro\n$1 tail");
    act(
      /** Places the caret after the literal replacement inside the second paragraph. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 2, 2, 1);
      },
    );
    fireEvent.paste(comment, {
      clipboardData: {
        getData: /** Returns the platform paste text. @returns Inserted text. */ () => "\nnext",
      },
    });
    expect(format.GetField().GetPar2()).toBe(replacement);
    act(
      /** Reverses the note edit and then the regex replacement. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(noteText(comment)).toBe(previous);
    expect(format.GetField().GetPar2()).toBe(previous);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("finds a comment after the ordinary Writer ODT open", /** Exercises opening the pinned LibreOffice sample and searching the resulting comment. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetDocShell();
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    await act(
      /** Loads the ODT through the document shell's filter. @returns Completion. */ async () => {
        const sample =
          "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf147583_backwardSearch.odt";
        await shell.Load(new Uint8Array(readFileSync(sample)), shell.GetDocumentState());
      },
    );
    const comment = screen.getByRole<HTMLDivElement>("textbox", {
      name: "Comment — Unknown Author",
    });
    fireEvent.keyDown(window, { key: "h", ctrlKey: true });
    const dialog = within(screen.getByRole("dialog", { name: "Find and Replace" }));
    fireEvent.click(dialog.getByText("Other options"));
    const comments = dialog.getByRole<HTMLInputElement>("checkbox", { name: "Comments" });
    if (!comments.checked) fireEvent.click(comments);
    fireEvent.change(dialog.getByLabelText("Find"), { target: { value: "For empty paragraphs" } });
    fireEvent.click(dialog.getByRole("button", { name: "Find Next" }));
    expect(comment).toHaveFocus();
    expect(window.document.getSelection()?.toString()).toBe("For empty paragraphs");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("inserts and refocuses the native comment, then replays the insertion and its edit", /** Drives the pinned shortcut and the document history through the mounted view. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  shell.Insert("comment range");
  const paragraph = shell.GetActiveParagraph();
  const start = new SwPosition(paragraph, 0);
  const end = new SwPosition(paragraph, 7);
  try {
    shell.SetPaM(end, start);
  } finally {
    start.Dispose();
    end.Dispose();
  }
  const document = shell.GetDoc();
  const type = SwPostItFieldType.Get(document);
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    fireEvent.keyDown(window, { key: "c", ctrlKey: true, altKey: true });
    const comment = screen.getByRole<HTMLDivElement>("textbox", {
      name: "Comment — Unknown Author",
    });
    expect(comment).toHaveFocus();
    const [format] = type.GatherFields();
    if (!format) throw new Error("Missing inserted comment.");
    const mark = document.GetIDocumentMarkAccess().GetAnnotationMark(format);
    expect(mark?.GetMarkStart().GetContentIndex()).toBe(0);
    expect(mark?.GetMarkEnd().GetContentIndex()).toBe(8);
    expect(paragraph.GetText()).toBe("comment￹ range");
    expect(format.GetField().GetData().dateTime.GetYear()).toBeGreaterThan(2000);
    fireEvent.keyDown(window, { key: "c", ctrlKey: true, altKey: true });
    expect(comment).toHaveFocus();
    expect([...type.GatherFields()]).toHaveLength(1);

    expect(noteInput(comment, "insertText", "Clarify the range")).toBe(true);
    act(
      /** Undoes the comment edit and then removes its insertion. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(screen.queryByRole("textbox", { name: "Comment — Unknown Author" })).toBeNull();
    expect(paragraph.GetText()).toBe("comment range");
    expect(shell.GetSelText()).toBe("comment");
    act(
      /** Recreates the field and restores its later edit against the recreated identity. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(noteText(screen.getByRole("textbox", { name: "Comment — Unknown Author" }))).toBe(
      "Clarify the range",
    );
    const restored = Array.from(type.GatherFields())[0];
    expect(restored?.GetField().GetPostItId()).toBe(format.GetField().GetPostItId());
    expect(
      document
        .GetIDocumentMarkAccess()
        .GetAnnotationMark(restored ?? format)
        ?.GetMarkStart()
        .GetContentIndex(),
    ).toBe(0);
    const restoredEditor = screen.getByRole("textbox", { name: "Comment — Unknown Author" });
    fireEvent.keyDown(restoredEditor, { key: "Escape" });
    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(8);
    expect(session.view.GetPostItMgr().GetActiveField()).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: /^Comment$/ }));
    const editors = screen.getAllByRole<HTMLDivElement>("textbox", {
      name: "Comment — Unknown Author",
    });
    expect(editors).toHaveLength(2);
    expect(editors[1]).toHaveFocus();
    const [, pointField] = type.GatherFields();
    if (!pointField) throw new Error("Missing point comment.");
    expect(document.GetIDocumentMarkAccess().GetAnnotationMark(pointField)).toBeUndefined();
    act(
      /** Focuses the earlier comment before leaving two adjacent point markers. @returns Nothing. */ () =>
        editors[0]?.focus(),
    );
    if (!editors[0]) throw new Error("Missing earlier comment editor.");
    fireEvent.keyDown(editors[0], { key: "Escape" });
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(9);
    shell.GetViewOptions().SetReadonly(true);
    expect(session.view.QueryState(WRITER_COMMAND_IDS.insertAnnotation).enabled).toBe(false);
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("paints native note formatting and records formatting and line breaks in Writer history", /** Mounts a real rich annotation, formats a selection, and checks the EditEngine and DOM after undo. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("One 😀 two");
  const source = new SwTextAPIEditSource();
  const initial = unicode("One 😀 two");
  const items = new SfxItemSet(source.GetEmptyItemSet());
  try {
    source.SetText(initial);
    items.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, EE_CHAR_WEIGHT), true);
    source.QuickSetAttribs(items, new ESelection(0, 0, 0, 3));
    const snapshot = source.CreateTextObject();
    try {
      format.GetField().SetTextObject(snapshot);
    } finally {
      snapshot.dispose();
    }
  } finally {
    initial.dispose();
    items.Dispose();
    source.Dispose();
  }
  const workbench = render(<WriterWorkbench isActive view={session.view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    expect(within(comment).getByText("One").style.fontWeight).toBe("bold");
    act(
      /** Selects only the non-BMP character in the second run. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 4, 6);
      },
    );
    expect(noteInput(comment, "formatUnderline")).toBe(true);
    expect(within(comment).getByText("😀").style.textDecorationLine).toBe("underline");
    expect(document.getSelection()?.toString()).toBe("😀");
    act(
      /** Replays a formatting-only edit without changing the note text. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(noteText(comment)).toBe("One 😀 two");
    expect(within(comment).queryByText("😀", { exact: true })).toBeNull();
    expect(document.getSelection()?.toString()).toBe("😀");
    act(
      /** Places the caret before the final word. @returns Nothing. */ () => selectNote(comment, 7),
    );
    expect(noteInput(comment, "insertLineBreak")).toBe(true);
    expect(noteText(comment)).toBe("One 😀 \ntwo");
    expect(format.GetField().GetTextObject()?.GetParagraphCount()).toBe(1);
    expect(noteInput(comment, "deleteContentBackward")).toBe(true);
    expect(noteText(comment)).toBe("One 😀 two");
  } finally {
    workbench.unmount();
    session.view.Close();
  }
});

it("routes toolbar formatting and state through the active annotation shell", /** Uses generated commands against the focused note and returns to the body without copying formatting. @returns Nothing. */ () => {
  const { session, shell, format } = openAnnotatedDocument("one two");
  const view = session.view;
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    const bold = within(
      screen.getByRole("toolbar", { name: "Writer formatting toolbar" }),
    ).getByRole("button", { name: "Bold" });
    const command = WRITER_COMMAND_IDS.bold;
    const bodyState = view.QueryState(command);
    act(
      /** Selects the first note word. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 0, 3);
      },
    );
    expect(view.QueryState(command)).toMatchObject({ enabled: true, checked: false, mixed: false });
    act(
      /** Moves focus to the actual toolbar, preserving the annotation selection. @returns Nothing. */ () =>
        bold.focus(),
    );
    fireEvent.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(within(comment).getByText("one").style.fontWeight).toBe("bold");
    expect(shell.GetTextShell().GetCharacterFormatState("bold")).toBe("off");
    act(
      /** Selects both differently formatted runs. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 0, 7);
      },
    );
    expect(view.QueryState(command)).toMatchObject({ checked: false, mixed: true });
    fireEvent.click(bold);
    expect(view.QueryState(command)).toMatchObject({ checked: true, mixed: false });
    act(
      /** Selects centered alignment through its generated Writer slot. @returns Nothing. */ () => {
        expect(view.Execute(WRITER_COMMAND_IDS.alignCenter).status).toBe("executed");
      },
    );
    expect(comment.querySelector("p")?.style.textAlign).toBe("center");
    act(
      /** Undoes the note paragraph change through frame dispatch. @returns Nothing. */ () => {
        expect(view.Execute(WRITER_COMMAND_IDS.undo).status).toBe("executed");
      },
    );
    expect(comment.querySelector("p")?.style.textAlign).not.toBe("center");
    expect(format.GetField().GetPar2()).toBe("one two");
    fireEvent.keyDown(comment, { key: "Escape" });
    expect(view.QueryState(command)).toEqual(bodyState);
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("applies Writer palette colors to the selected comment text and reopens them from ODT", /** Exercises palette state, resets, recent swatches and native persistence. @returns Completion. */ async () => {
  const { session, shell } = openAnnotatedDocument("one two");
  const view = session.view;
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    act(
      /** Selects the first comment word. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 0, 3);
      },
    );
    const toolbar = within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" }));
    const foreground = toolbar.getByLabelText("Font Color palette");
    const background = toolbar.getByLabelText("Character Highlighting Color palette");
    fireEvent.click(foreground);
    fireEvent.click(screen.getByRole("button", { name: "Font Color #ff0000" }));
    fireEvent.click(background);
    fireEvent.change(screen.getByLabelText("Character Highlighting Color custom color"), {
      target: { value: "#ffd966" },
    });
    expect(view.QueryState(WRITER_COMMAND_IDS.color)).toMatchObject({
      enabled: true,
      value: "#ff0000",
    });
    expect(view.QueryState(WRITER_COMMAND_IDS.charBackColor)).toMatchObject({
      enabled: true,
      value: "#ffd966",
    });
    expect(within(comment).getByText("one").style.color).toBe("rgb(255, 0, 0)");
    expect(within(comment).getByText("one").style.backgroundColor).toBe("rgb(255, 217, 102)");
    expect(background).toHaveFocus();

    fireEvent.click(foreground);
    fireEvent.click(screen.getByRole("button", { name: "Automatic" }));
    expect(view.QueryState(WRITER_COMMAND_IDS.color).value).toBe("auto");
    fireEvent.click(background);
    fireEvent.click(screen.getByRole("button", { name: "None" }));
    expect(view.QueryState(WRITER_COMMAND_IDS.charBackColor).value).toBe("transparent");
    fireEvent.click(foreground);
    fireEvent.click(screen.getByRole("button", { name: "Font Color recent #ff0000" }));
    fireEvent.click(background);
    fireEvent.click(
      screen.getByRole("button", { name: "Character Highlighting Color recent #ffd966" }),
    );
    act(
      /** Selects both the colored and default runs. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 0, 7);
      },
    );
    expect(view.QueryState(WRITER_COMMAND_IDS.color).mixed).toBe(true);
    expect(view.QueryState(WRITER_COMMAND_IDS.charBackColor).mixed).toBe(true);
    fireEvent.keyDown(comment, { key: "Escape" });
    expect(view.QueryState(WRITER_COMMAND_IDS.color).value).toBe("auto");
    expect(view.QueryState(WRITER_COMMAND_IDS.charBackColor).value).toBe("transparent");

    const metadata = { title: "Comment colors" };
    const reopened = await readOdtDocument(
      await writeOdtDocument(shell.GetDoc(), metadata),
      metadata,
    );
    const [reopenedComment] = SwPostItFieldType.Get(reopened.document).GatherFields();
    const note = reopenedComment?.GetField();
    const spans: EECharAttrib[] = [];
    note?.GetTextObject()?.GetCharAttribs(0, spans);
    const colors = spans
      .filter(
        /** Selects native color attributes. @param span - EditEngine span. @returns Whether it stores a color. */
        (span) => span.pAttr instanceof SvxColorItem,
      )
      .map(
        /** Projects a color and its persisted range. @param span - Color span. @returns Color tuple. */
        ({ pAttr, nStart, nEnd }) => [
          pAttr?.Which(),
          (pAttr as SvxColorItem).GetValue().toUInt32(),
          nStart,
          nEnd,
        ],
      );
    expect(colors).toEqual(
      expect.arrayContaining([
        [EE_CHAR_COLOR, 0xff0000, 0, 3],
        [EE_CHAR_BKGCOLOR, 0xffd966, 0, 3],
      ]),
    );
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("uses Writer's position and line spacing controls on the active comment", /** Checks the annotation slot state, separate body formatting and native ODT items. @returns Completion. */ async () => {
  const { session, shell } = openAnnotatedDocument("H2O\nNext paragraph");
  const view = session.view;
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const comment = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    const toolbar = within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" }));
    const sidebar = within(
      screen.getByRole("complementary", { name: "Writer properties sidebar" }),
    );
    const subscript = sidebar.getByRole("button", { name: "Subscript" });
    const superscript = sidebar.getByRole("button", { name: "Superscript" });
    const bodySpacing = view.QueryState(WRITER_COMMAND_IDS.lineSpacing).value;
    act(
      /** Selects the digit in the note formula. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 1, 2);
      },
    );
    fireEvent.click(superscript);
    expect(superscript).toHaveAttribute("aria-pressed", "true");
    expect(within(comment).getByText("2").style.verticalAlign).toBe("super");
    fireEvent.click(superscript);
    expect(superscript).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(subscript);
    expect(subscript).toHaveAttribute("aria-pressed", "true");
    expect(within(comment).getByText("2").style.verticalAlign).toBe("sub");
    expect(within(comment).getByText("2").style.fontSize).toBe(`${DFLT_ESC_PROP}%`);

    fireEvent.click(toolbar.getByRole("button", { name: "Line Spacing" }));
    const spacing = screen.getByRole("dialog", { name: "Line Spacing" });
    fireEvent.click(within(spacing).getByRole("button", { name: "Spacing: 1.5" }));
    expect((comment.children[0] as HTMLElement).style.lineHeight).toBe("1.5lh");
    expect((comment.children[1] as HTMLElement).style.lineHeight).toBe("");
    const selected = view.QueryState(WRITER_COMMAND_IDS.lineSpacing).value;
    expect(selected).toBeInstanceOf(SvxLineSpacingItem);
    expect((selected as SvxLineSpacingItem).GetPropLineSpace()).toBe(150);
    act(
      /** Selects across paragraphs with different spacing. @returns Nothing. */ () => {
        comment.focus();
        selectNote(comment, 1, 2, 0, 1);
      },
    );
    expect(view.QueryState(WRITER_COMMAND_IDS.lineSpacing)).toMatchObject({
      enabled: true,
      mixed: true,
      value: undefined,
    });
    fireEvent.keyDown(comment, { key: "Escape" });
    expect(view.QueryState(WRITER_COMMAND_IDS.lineSpacing).value).toEqual(bodySpacing);
    expect(view.QueryState(WRITER_COMMAND_IDS.subscript).checked).toBe(false);

    const metadata = { title: "Comment layout" };
    const { document: reopened } = await readOdtDocument(
      await writeOdtDocument(shell.GetDoc(), metadata),
      metadata,
    );
    try {
      const [format] = SwPostItFieldType.Get(reopened).GatherFields();
      const object = format?.GetField().GetTextObject();
      const attrs: EECharAttrib[] = [];
      object?.GetCharAttribs(0, attrs);
      const escapement = attrs.find(
        /** Locates the native position over the digit. @param attribute - Comment run. @returns Whether it describes the position. */
        ({ pAttr, nStart, nEnd }) =>
          pAttr?.Which() === EE_CHAR_ESCAPEMENT && nStart === 1 && nEnd === 2,
      )?.pAttr;
      expect(escapement).toBeInstanceOf(SvxEscapementItem);
      expect((escapement as SvxEscapementItem).GetEsc()).toBe(DFLT_ESC_AUTO_SUB);
      const line = object?.GetParaAttribs(0).GetItemIfSet(EE_PARA_SBL, false);
      expect(line).toBeInstanceOf(SvxLineSpacingItem);
      expect((line as SvxLineSpacingItem).GetPropLineSpace()).toBe(150);
    } finally {
      reopened.Dispose();
    }
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("applies annotation font sizes and weights to the selected script", /** Verifies script-aware annotation command state, native items and browser paint. @returns Nothing. */ () => {
  const { session, format } = openAnnotatedDocument("abc漢字");
  const view = session.view;
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const note = screen.getByRole<HTMLDivElement>("textbox", { name: "Comment — Ada" });
    act(
      /** Selects only the Asian text in the annotation. @returns Nothing. */ () => {
        note.focus();
        selectNote(note, 3, 5);
        expect(view.Execute(WRITER_COMMAND_IDS.bold).status).toBe("executed");
        expect(view.Execute(WRITER_COMMAND_IDS.fontHeight, { fontSizePt: 18 }).status).toBe(
          "executed",
        );
      },
    );
    expect(view.QueryState(WRITER_COMMAND_IDS.bold)).toMatchObject({ checked: true });
    expect(view.QueryState(WRITER_COMMAND_IDS.fontHeight).value).toBe(18);
    const span = within(note).getByText("漢字");
    expect(span.style.fontWeight).toBe("bold");
    expect(span.style.fontSize).toBe("18pt");
    const record = format.GetField().GetTextObject();
    if (!record) throw new Error("The native note format was not published.");
    const attributes: import("../../../editeng/inc/editdata").EECharAttrib[] = [];
    record.GetCharAttribs(0, attributes);
    expect(
      attributes.map(
        /** Reads native Which ids. @param item - Native attribute. @returns Which id. */ (item) =>
          item.pAttr?.Which(),
      ),
    ).toEqual(expect.arrayContaining([EE_CHAR_WEIGHT_CJK, EE_CHAR_FONTHEIGHT_CJK]));
    expect(within(note).getByText("abc").style.fontWeight).toBe("");
  } finally {
    workbench.unmount();
    view.Close();
  }
});
