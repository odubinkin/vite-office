/** @fileoverview Verifies the native annotation deletion commands and their Writer history. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SID_ATTR_POSTIT_ID } from "../../../svx/inc/svxids";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import type { SwDoc } from "../../source/core/doc/doc";
import { SwPostItField, SwPostItFieldType } from "../../source/core/fields/docufld";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { GetTextNodeExpandedText } from "../../source/core/txtnode/ndtxt-hints";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

/** Attaches a native field and optional selection range. @param node - Source paragraph. @param name - Stable name and author. @param start - Start position. @param end - End position. @param parentName - Original thread parent. @returns Attached format. */
function annotate(node: SwTextNode, name: string, start: number, end = start, parentName = "") {
  const doc = node.GetDoc();
  const field = new SwPostItField(SwPostItFieldType.Get(doc), {
    author: name,
    initials: "",
    name,
    parentName,
    text: `${name} text`,
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const first = new SwPosition(node, start);
  const last = new SwPosition(node, end);
  const range = new SwPaM(last, first);
  try {
    return doc.GetDocumentContentOperationsManager().InsertPostItField(range, field);
  } finally {
    range.Dispose();
    last.Dispose();
    first.Dispose();
    field.Dispose();
  }
}

/** Reports the attached comments in model order. @param doc - Active document. @returns Names. */
function notes(doc: SwDoc): string[] {
  return [...SwPostItFieldType.Get(doc).GatherFields()].map(
    /** Looks up the actual field name. @param format - Original field owner. @returns Name. */
    (format) => format.GetField().GetName(),
  );
}

it("deletes an individual comment from its menu and restores its anchored range", /** Exercises the source comment deletion scenario through the mounted popup and ordinary Writer undo. @returns Nothing. */ () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("alpha beta");
  const node = shell.GetActiveParagraph();
  const doc = shell.GetDoc();
  const first = annotate(node, "Ada", 0, 5);
  const id = first.GetField().GetPostItId();
  annotate(node, "Grace", 7, 11);
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    const card = screen.getByRole("textbox", { name: "Comment — Ada" }).closest("article");
    if (!card) throw new Error("Missing comment card.");
    fireEvent.click(within(card).getByLabelText("Comment actions"));
    fireEvent.click(within(card).getByRole("button", { name: "Delete Comment" }));
    expect(screen.queryByRole("textbox", { name: "Comment — Ada" })).toBeNull();
    expect(screen.getByLabelText("Writer document body")).toHaveFocus();
    expect(notes(doc)).toEqual(["Grace"]);
    expect(GetTextNodeExpandedText(node, 0, node.Len())).toBe("alpha beta");
    expect(doc.GetIDocumentMarkAccess().GetAllMarks()).toHaveLength(1);

    act(
      /** Replays the native annotation deletion history. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    const [restored, neighbor] = SwPostItFieldType.Get(doc).GatherFields();
    const mark = restored && doc.GetIDocumentMarkAccess().GetAnnotationMark(restored);
    const neighborMark = neighbor && doc.GetIDocumentMarkAccess().GetAnnotationMark(neighbor);
    expect(restored?.GetField().GetPostItId()).toBe(id);
    expect(mark?.GetMarkStart().GetContentIndex()).toBe(0);
    expect(mark?.GetMarkEnd().GetContentIndex()).toBe(6);
    expect(neighborMark?.GetMarkStart().GetContentIndex()).toBe(7);
    expect(neighborMark?.GetMarkEnd().GetContentIndex()).toBe(12);
    expect(screen.getByRole("textbox", { name: "Comment — Ada" })).toHaveTextContent("Ada text");
    act(
      /** Replays deletion against the restored format. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
      },
    );
    expect(notes(doc)).toEqual(["Grace"]);
    expect(GetTextNodeExpandedText(node, 0, node.Len())).toBe("alpha beta");
  } finally {
    workbench.unmount();
    view.Close();
  }
});

it("deletes a thread by reply ID and undoes its members in reverse deletion order", /** Exercises the native text-shell request and preserves an independent comment. @returns Nothing. */ () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  shell.Insert("alpha beta");
  const node = shell.GetActiveParagraph();
  const doc = shell.GetDoc();
  annotate(node, "Root", 0, 5);
  const reply = annotate(node, "Reply", 6, 6, "Root");
  annotate(node, "Independent", node.Len());
  const id = new SfxStringItem(SID_ATTR_POSTIT_ID, String(reply.GetField().GetPostItId()));
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    act(
      /** Executes the original field command by reply ID. @returns Nothing. */ () => {
        expect(view.Execute(WRITER_COMMAND_IDS.deleteCommentThread, [id])).toMatchObject({
          status: "executed",
          value: true,
        });
      },
    );
    expect(notes(doc)).toEqual(["Independent"]);
    act(
      /** Restores the last field deleted from the thread. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(notes(doc)).toEqual(["Reply", "Independent"]);
    act(
      /** Restores the root and its selection mark. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
      },
    );
    const [root, restoredReply] = SwPostItFieldType.Get(doc).GatherFields();
    expect(notes(doc)).toEqual(["Root", "Reply", "Independent"]);
    expect(restoredReply?.GetField().GetData().parentName).toBe("Root");
    expect(root && doc.GetIDocumentMarkAccess().GetAnnotationMark(root)).toBeDefined();
  } finally {
    id.Dispose();
    workbench.unmount();
    view.Close();
  }
});

it("can undo insertion after deletion undo recreated the inserted field", /** Checks both Writer history owners against the retained annotation identity. @returns Nothing. */ () => {
  const { view } = createWriterDocumentSession();
  const shell = view.GetWrtShell();
  const doc = shell.GetDoc();
  shell.Insert("alpha");
  const workbench = render(<WriterWorkbench isActive view={view} />);
  try {
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));
    const [name] = notes(doc);
    expect(name).toBeDefined();
    fireEvent.click(screen.getByLabelText("Comment actions"));
    fireEvent.click(screen.getByRole("button", { name: "Delete Comment" }));
    expect(notes(doc)).toEqual([]);
    act(
      /** Restores the deleted field and then undoes its insertion. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect(notes(doc)).toEqual([name]);
        expect(shell.Undo()).toBe(true);
      },
    );
    expect(notes(doc)).toEqual([]);
    expect(shell.GetActiveParagraph().GetText()).toBe("alpha");
  } finally {
    workbench.unmount();
    view.Close();
  }
});
