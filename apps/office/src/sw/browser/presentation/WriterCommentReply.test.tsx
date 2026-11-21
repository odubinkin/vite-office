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
