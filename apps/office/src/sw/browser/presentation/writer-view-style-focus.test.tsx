/** @fileoverview Checks native style acceptance and client focus through real Writer sessions and cursors. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { WriterWorkbench } from "./writer-view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwDoc } from "../../source/core/doc/doc";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual frame owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts one actual frame with two paragraphs and owned styles. @param name - Frame identity. @param active - Frame eligibility. @returns View and core owners. */
function mount(name = "first", active = true) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const metadata = createDocument({ id: name, title: name, suiteId: "writer" });
  const document = session.docShell.InitNew(metadata),
    shell = session.view.GetWrtShell();
  document.MakeTextFormatColl("Owned: A & 字", document.GetDfltTextFormatColl(), "OwnedA");
  document.MakeTextFormatColl("Owned: B & 字", document.GetDfltTextFormatColl(), "OwnedB");
  shell.Insert("Untouched");
  shell.SplitNode();
  shell.Insert("Second");
  shell.SetParagraphStyle("OwnedA");
  document.GetUndoManager().Clear();
  /** Renders current frame eligibility. @param isActive - Active flag. @returns View. */
  function tree(isActive: boolean) {
    return (
      <section aria-label={`${name} frame`}>
        <WriterWorkbench
          isActive={isActive}
          view={session.view}
          viewStore={session.viewStore}
          services={session.services}
          fileDialogs={session.fileDialogs}
        />
      </section>
    );
  }
  const rendered = render(tree(active)),
    frame = within(screen.getByLabelText(`${name} frame`));
  const editor = frame.getByLabelText("Writer document body"),
    select = frame.getByRole("combobox", { name: "Paragraph style", hidden: true });
  return {
    session,
    document,
    shell,
    metadata,
    frame,
    editor,
    select,
    setActive: /** Changes frame eligibility. @param value - New active flag. @returns Nothing. */ (
      value: boolean,
    ) => rendered.rerender(tree(value)),
  };
}

/** Reads independent point/mark coordinates. @param fixture - Actual session. @returns Primitive source endpoints. */
function endpoints(fixture: ReturnType<typeof mount>) {
  const cursor = fixture.shell.GetCursor(),
    point = cursor.GetPoint(),
    mark = cursor.GetMark();
  return {
    point: [point.GetNodeIndex(), point.GetContentIndex()],
    mark: cursor.HasMark() ? [mark.GetNodeIndex(), mark.GetContentIndex()] : undefined,
  };
}

describe("Writer style-box focus", /** Defines actual client contracts. @returns Nothing. */ () => {
  for (const method of ["pointer", "Enter"] as const)
    it(`returns focus before ${method} style dispatch and preserves source selection`, /** Checks actual frame command ordering and cursor ownership. @returns Nothing. */ () => {
      const fixture = mount(),
        paragraph = fixture.shell.GetActiveParagraph();
      act(
        /** Establishes a real retained mark. @returns Nothing. */ () => {
          fixture.session.view.GetEditWin().SetSelection({
            point: { nodeIndex: paragraph.GetIndex(), contentIndex: 3 },
            mark: { nodeIndex: paragraph.GetIndex(), contentIndex: 1 },
          });
        },
      );
      expect(fixture.shell.GetCursor().HasMark()).toBe(true);
      const before = endpoints(fixture),
        dispatcher = fixture.session.frame.GetDispatcher(),
        original = dispatcher.Execute.bind(dispatcher);
      const execute = vi.spyOn(dispatcher, "Execute").mockImplementation(
        /** Observes the actual focus at dispatch entry. @param id - Command. @param arguments_ - Actual payload. @returns Original result. */ (
          id,
          arguments_,
        ) => {
          if (id === WRITER_COMMAND_IDS.styleApply)
            expect(fixture.editor.contains(document.activeElement)).toBe(true);
          return original(id, arguments_);
        },
      );
      fixture.select.focus();
      if (method === "pointer") fireEvent.change(fixture.select, { target: { value: "OwnedB" } });
      else {
        fireEvent.keyDown(fixture.select, { key: "ArrowDown" });
        expect(fixture.shell.GetActiveParagraph().GetParagraphStyle()).toBe("OwnedA");
        fireEvent.keyDown(fixture.select, { key: "Enter" });
      }
      expect(execute).toHaveBeenCalledWith(".uno:StyleApply", {
        Style: "Owned: B & 字",
        FamilyName: "ParagraphStyles",
      });
      expect(fixture.editor.contains(document.activeElement)).toBe(true);
      expect(endpoints(fixture)).toEqual(before);
      expect(fixture.select).toHaveValue("OwnedB");
      expect(fixture.document.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(fixture.document.paragraphs[0]?.GetText()).toBe("Untouched");
      expect(fixture.document.paragraphs[0]?.GetParagraphStyle()).toBe("default");
      fireEvent(
        fixture.editor,
        new InputEvent("beforeinput", {
          data: "X",
          inputType: "insertText",
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(paragraph.GetText()).toBe("SXond");
      fireEvent.keyDown(fixture.editor, { ctrlKey: true, key: "z" });
      expect(paragraph.GetText()).toBe("Second");
      fireEvent.keyDown(fixture.editor, { ctrlKey: true, key: "z" });
      expect(fixture.select).toHaveValue("OwnedA");
      fireEvent.keyDown(fixture.editor, { ctrlKey: true, shiftKey: true, key: "z" });
      expect(fixture.select).toHaveValue("OwnedB");
    });
  it("keeps travel and Escape out of model/history and releases focus on repeated native Enter", /** Checks native travel cancellation and repeated style acceptance. @returns Nothing. */ () => {
    const fixture = mount(),
      before = endpoints(fixture);
    fixture.select.focus();
    fireEvent.keyDown(fixture.select, { key: "ArrowDown" });
    expect(fixture.select).toHaveValue("OwnedB");
    expect(fixture.select).toHaveFocus();
    expect(fixture.shell.GetActiveParagraph().GetParagraphStyle()).toBe("OwnedA");
    fireEvent.keyDown(fixture.select, { key: "Escape" });
    expect(fixture.select).toHaveValue("OwnedA");
    expect(fixture.editor.contains(document.activeElement)).toBe(true);
    expect(endpoints(fixture)).toEqual(before);
    expect(fixture.document.GetUndoManager().GetUndoActionCount()).toBe(0);
    fixture.select.focus();
    fireEvent.keyDown(fixture.select, { key: "Enter" });
    expect(fixture.editor.contains(document.activeElement)).toBe(true);
    expect(fixture.document.GetUndoManager().GetUndoActionCount()).toBe(1);
  });
  it("accepts Tab without releasing focus and clears stale drafts on document replacement", /** Checks native Tab and live graph ownership. @returns Nothing. */ () => {
    const fixture = mount();
    fixture.select.focus();
    fireEvent.keyDown(fixture.select, { key: "ArrowDown" });
    expect(fireEvent.keyDown(fixture.select, { key: "Tab" })).toBe(true);
    expect(fixture.select).toHaveFocus();
    expect(fixture.shell.GetActiveParagraph().GetParagraphStyle()).toBe("OwnedB");
    fireEvent.keyDown(fixture.select, { key: "ArrowUp" });
    const replacement = new SwDoc();
    replacement.MakeTextFormatColl("Replacement A", undefined, "OwnedA");
    replacement.MakeTextFormatColl("Replacement B", undefined, "OwnedB");
    act(
      /** Installs a new document through the real shell. @returns Nothing. */ () => {
        fixture.session.docShell.ReplaceDocument(replacement, fixture.metadata, {
          kind: "untitled",
          name: "replacement",
        });
      },
    );
    expect(fixture.select).toHaveValue("default");
    expect(screen.queryByRole("option", { name: "Owned: A & 字" })).toBeNull();
    fireEvent.keyDown(fixture.select, { key: "Enter" });
    expect(replacement.paragraphs[0]?.GetParagraphStyle()).toBe("default");
    expect(replacement.GetUndoManager().GetUndoActionCount()).toBe(1);
  });
  it("releases only to the active owning frame and leaves a modal's focus intact", /** Checks actual client isolation and eligibility. @returns Nothing. */ () => {
    const first = mount("first", false),
      second = mount("second", true);
    expect(first.select).toBeDisabled();
    second.editor.focus();
    act(
      /** Updates an inactive document while another client owns focus. @returns Nothing. */ () => {
        first.shell.SetParagraphStyle("OwnedB");
      },
    );
    expect(second.editor.contains(document.activeElement)).toBe(true);
    act(
      /** Restores the inactive fixture's style through its source owner. @returns Nothing. */ () => {
        first.shell.SetParagraphStyle("OwnedA");
      },
    );
    second.select.focus();
    fireEvent.change(second.select, { target: { value: "OwnedB" } });
    expect(second.editor.contains(document.activeElement)).toBe(true);
    expect(first.shell.GetActiveParagraph().GetParagraphStyle()).toBe("OwnedA");
    second.setActive(false);
    first.setActive(true);
    first.select.focus();
    fireEvent.change(first.select, { target: { value: "OwnedB" } });
    expect(first.editor.contains(document.activeElement)).toBe(true);
    fireEvent.click(first.frame.getByRole("button", { name: "Insert" }));
    fireEvent.click(first.frame.getByRole("menuitem", { name: "Hyperlink…" }));
    const url = first.frame.getByRole("textbox", { name: "URL" });
    expect(url).toHaveFocus();
    expect(first.select).toBeDisabled();
    fireEvent.keyDown(first.select, { key: "Enter" });
    expect(url).toHaveFocus();
    fireEvent.click(first.frame.getByRole("button", { name: "Cancel" }));
    expect(first.select).toBeEnabled();
  });
});
