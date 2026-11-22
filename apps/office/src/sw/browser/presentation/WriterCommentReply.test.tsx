/** @fileoverview Exercises native Writer replies through the annotation menu and ODT. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SID_ATTR_POSTIT_ID } from "../../../svx/inc/svxids";
import { SwFormatField } from "../../inc/fmtfld";
import { SwTextField } from "../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import { GetTextNodeExpandedText } from "../../source/core/txtnode/ndtxt-hints";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

it("inserts a formatted reply next to its parent, focuses its end and saves the thread", /** Exercises quoting, Writer undo and ODT field metadata through the normal comment menu. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("Body text");
  const node = shell.GetActiveParagraph();
  const doc = shell.GetDoc();
  const type = SwPostItFieldType.Get(doc);
  const value = new SwPostItField(type, {
    author: "Ada",
    initials: "",
    name: "",
    text: "Original note",
    dateTime: new DateTime(DateTime.SYSTEM),
  });
  const format = new SwFormatField(value);
  value.Dispose();
  expect(node.InsertHint(new SwTextField(format, 4))).toBe(true);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const original = screen.getByRole("textbox", { name: "Comment — Ada" });
    act(
      /** Applies native formatting to the parent content before quoting. @returns Nothing. */ () => {
        original.focus();
        view.Execute(WRITER_COMMAND_IDS.selectAll);
        view.Execute(WRITER_COMMAND_IDS.bold);
      },
    );
    const card = original.closest("article");
    if (!card) throw new Error("Missing parent annotation card.");
    fireEvent.click(within(card).getByLabelText("Comment actions"));
    fireEvent.click(within(card).getByRole("button", { name: "Reply" }));
    const reply = screen.getByRole("textbox", { name: "Comment — Unknown Author" });
    expect(reply).toHaveFocus();
    expect(reply).toHaveTextContent(/Reply to Ada .*: "Original note"/u);
    const quote = within(reply).getByText("Original note", { exact: false });
    expect(quote.style.fontStyle).toBe("italic");
    expect(quote.style.fontWeight).toBe("bold");
    expect(document.getSelection()?.focusNode).toBe(reply.lastElementChild);

    const [parent, inserted] = type.GatherFields();
    expect(inserted?.GetTextField()?.GetStart()).toBe(
      (parent?.GetTextField()?.GetStart() ?? 0) + 1,
    );
    expect(inserted?.GetField().GetData()).toMatchObject({
      parentName: parent?.GetField().GetName(),
      parentPostItId: parent?.GetField().GetPostItId(),
      parentId: parent?.GetField().GetData().paraId,
    });
    expect(GetTextNodeExpandedText(node, 0, node.Len())).toBe("Body text");

    act(
      /** Undoes and redoes the whole reply, including the original quotation. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect([...type.GatherFields()]).toEqual([format]);
        expect(shell.Redo()).toBe(true);
      },
    );
    const metadata = { title: "Comment reply" };
    const { document: reopened } = await readOdtDocument(
      await writeOdtDocument(doc, metadata),
      metadata,
    );
    try {
      const [savedParent, savedReply] = SwPostItFieldType.Get(reopened).GatherFields();
      expect(savedReply?.GetField().GetData().parentName).toBe(savedParent?.GetField().GetName());
      expect(savedReply?.GetField().GetPar2()).toContain('"Original note"');
    } finally {
      reopened.Dispose();
    }
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("quotes an ellipsis when the parent starts with an empty paragraph", /** Checks the native first-paragraph rule via the original parent ID request. @returns Nothing. */ () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("Body");
  const node = shell.GetActiveParagraph();
  const original = new SwPostItField(SwPostItFieldType.Get(shell.GetDoc()), {
    author: "Ada",
    initials: "",
    name: "parent",
    text: "\nLater text",
    dateTime: new DateTime(DateTime.SYSTEM),
  });
  const format = new SwFormatField(original);
  original.Dispose();
  expect(node.InsertHint(new SwTextField(format, 2))).toBe(true);
  const id = new SfxStringItem(SID_ATTR_POSTIT_ID, String(format.GetField().GetPostItId()));
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    act(
      /** Opens the reply to the requested field from the body shell. @returns Nothing. */ () => {
        expect(view.Execute(WRITER_COMMAND_IDS.replyComment, [id])).toMatchObject({
          status: "executed",
          value: true,
        });
      },
    );
    const reply = screen.getByRole("textbox", { name: "Comment — Unknown Author" });
    expect(reply).toHaveTextContent('"..."');
  } finally {
    id.Dispose();
    workbench.unmount();
    view.Close();
  }
});

it("promotes a reply without moving its anchor or changing its descendants", /** Exercises imported parent links, the comment menu, native history, and ODT persistence. @returns Completion. */ async () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("Body text for comments");
  const node = shell.GetActiveParagraph();
  const doc = shell.GetDoc();
  const type = SwPostItFieldType.Get(doc);
  /** Attaches an imported note at a distinct anchor. @param name - Note identifier. @param start - Anchor offset. @param parentName - Persisted parent name. @returns Attached note. */
  function addNote(name: string, start: number, parentName = ""): SwFormatField {
    const field = new SwPostItField(type, {
      author: name,
      name,
      initials: "",
      text: name,
      dateTime: new DateTime(DateTime.SYSTEM),
      parentName,
    });
    const format = new SwFormatField(field);
    field.Dispose();
    expect(node.InsertHint(new SwTextField(format, start))).toBe(true);
    return format;
  }
  const root = addNote("Root", 1);
  const reply = addNote("Reply", 4, "Root");
  const nested = addNote("Nested", 8, "Reply");
  const sibling = addNote("Sibling", 12, "Root");
  const fields = [root, reply, nested, sibling];
  const manager = view.GetPostItMgr();
  const undo = doc.GetUndoManager();
  const undoCount = undo.GetUndoActionCount();
  const command = WRITER_COMMAND_IDS.promoteComment;
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const rootInput = screen.getByRole("textbox", { name: "Comment — Root" });
    const replyInput = screen.getByRole("textbox", { name: "Comment — Reply" });
    const card = replyInput.closest("article");
    if (!card) throw new Error("Missing reply card.");
    const actions = within(card).getByLabelText("Comment actions");
    act(/** Activates the original root. @returns Nothing. */ () => rootInput.focus());
    expect(view.QueryState(command).enabled).toBe(false);
    act(/** Activates the imported reply. @returns Nothing. */ () => replyInput.focus());
    expect(view.QueryState(command).enabled).toBe(true);
    fireEvent.click(actions);
    fireEvent.click(within(card).getByRole("button", { name: "Promote Comment" }));

    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
    expect(reply.GetField().GetData()).toMatchObject({
      parentId: 0,
      parentName: "",
      parentPostItId: 0,
    });
    expect(nested.GetField().GetData().parentName).toBe("Reply");
    expect(sibling.GetField().GetData().parentName).toBe("Root");
    expect(reply.GetTextField()?.GetStart()).toBe(4);
    expect(manager.GetThreads(fields)).toEqual([fields]);
    expect(undo.GetUndoActionCount()).toBe(undoCount);
    fireEvent.click(actions);
    expect(within(card).queryByRole("button", { name: "Promote Comment" })).toBeNull();
    fireEvent.click(actions);

    const id = new SfxStringItem(SID_ATTR_POSTIT_ID, String(sibling.GetField().GetPostItId()));
    try {
      act(
        /** Promotes a second reply through the text-shell ID request. @returns Nothing. */ () => {
          expect(view.Execute(command, [id])).toMatchObject({ status: "executed", value: true });
        },
      );
    } finally {
      id.Dispose();
    }
    const metadata = { title: "Promoted comment" };
    const { document: reopened } = await readOdtDocument(
      await writeOdtDocument(doc, metadata),
      metadata,
    );
    try {
      const saved = [...SwPostItFieldType.Get(reopened).GatherFields()];
      expect(
        saved.map(
          /** Reads the saved parent names in anchor order. @param field - Saved annotation. @returns Parent name. */ (
            field,
          ) => field.GetField().GetData().parentName || "",
        ),
      ).toEqual(["", "", "Reply", ""]);
      expect(manager.GetThreads(saved)).toEqual([
        saved.slice(0, 1),
        saved.slice(1, 3),
        saved.slice(3),
      ]);
    } finally {
      reopened.Dispose();
    }
  } finally {
    workbench.unmount();
    view.Close();
  }
});
