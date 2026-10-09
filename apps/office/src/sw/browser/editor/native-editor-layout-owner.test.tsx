/** @fileoverview Verifies native editor layout ownership is shared by real rendering and cursor shells through the original edit window. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterPlainTextEditor } from "./WriterPlainTextEditor";
import { SwRootFrame } from "../../source/core/layout/newfrm";

/** Projects a real session into the actual editor contract. @param session - Original native owner. @returns Actual editor. */
function editor(session: ReturnType<typeof createWriterDocumentSession>) {
  const snapshot = session.viewStore.GetSnapshot();
  return (
    <WriterPlainTextEditor
      activeParagraphId={snapshot.activeParagraph.id}
      cursorSelection={snapshot.cursorSelection}
      editWindow={session.view.GetEditWin()}
      pageDescriptor={snapshot.pageDescriptor}
      paragraphs={snapshot.paragraphs}
    />
  );
}

it.each([false, true])(
  "actual editor borrows the native cursor root across rerender and remount modified=%s",
  /** Verifies original root and unchanged document state without a detached layout port. @param modified - Initial content mutation. @returns Nothing. */ (
    modified,
  ) => {
    const session = createWriterDocumentSession();
    if (modified) session.view.GetWrtShell().Insert("Native owner text");
    const shell = session.view.GetWrtShell(),
      root = shell.GetLayout(),
      document = session.docShell.GetDoc(),
      before = session.docShell.GetDocumentState(),
      revision = document.GetDocumentStateManager().GetModelRevision(),
      history = document.GetUndoManager().GetUndoActionCount();
    const format = vi.spyOn(SwRootFrame.prototype, "Format");
    try {
      const mounted = render(
        <WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />,
      );
      expect(session.view.GetEditWin().GetView()).toBe(session.view);
      expect(session.view.GetLayout()).toBe(root);
      expect(format).toHaveBeenCalled();
      expect(
        format.mock.instances.every(
          /** Verifies original native receiver identity. @param receiver - Format receiver. @returns Whether original. */ (
            receiver,
          ) => receiver === root,
        ),
      ).toBe(true);
      expect(screen.getByRole("document", { name: "Page 1" })).toBeInTheDocument();
      mounted.rerender(
        <WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />,
      );
      mounted.unmount();
      expect(shell.GetLayout()).toBe(root);
      render(<WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />);
      expect(
        format.mock.instances.every(
          /** Verifies retained native receiver after remount. @param receiver - Format receiver. @returns Whether original. */ (
            receiver,
          ) => receiver === root,
        ),
      ).toBe(true);
      expect(session.docShell.GetDocumentState()).toEqual(before);
      expect(document.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      expect(document.GetUndoManager().GetUndoActionCount()).toBe(history);
    } finally {
      cleanup();
      format.mockRestore();
      session.Close();
    }
  },
);
it("actual editor follows a new edit-window owner on a mounted view change", /** Verifies rendering cannot retain a root captured from previous React props. @returns Nothing. */ () => {
  const first = createWriterDocumentSession(),
    second = createWriterDocumentSession();
  first.view.GetWrtShell().Insert("First owner");
  second.view.GetWrtShell().Insert("Second owner");
  const firstRoot = first.view.GetWrtShell().GetLayout(),
    secondRoot = second.view.GetWrtShell().GetLayout(),
    format = vi.spyOn(SwRootFrame.prototype, "Format");
  try {
    const mounted = render(editor(first));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "First owner",
    );
    expect(
      format.mock.instances.every(
        /** Verifies first native owner. @param receiver - Format receiver. @returns Whether first. */ (
          receiver,
        ) => receiver === firstRoot,
      ),
    ).toBe(true);
    format.mockClear();
    mounted.rerender(editor(second));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Second owner",
    );
    expect(format).toHaveBeenCalled();
    expect(
      format.mock.instances.every(
        /** Verifies current edit-window root. @param receiver - Format receiver. @returns Whether second. */ (
          receiver,
        ) => receiver === secondRoot,
      ),
    ).toBe(true);
    expect(firstRoot).not.toBe(secondRoot);
  } finally {
    cleanup();
    format.mockRestore();
    first.Close();
    second.Close();
  }
});
it("mounted native editor formats replacement document through its original view shell", /** Verifies actual document-shell replacement and subsequent native editing. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    root = session.view.GetWrtShell().GetLayout();
  session.view.GetWrtShell().Insert("Old owner text");
  const oldDoc = session.docShell.GetDoc(),
    format = vi.spyOn(root, "Format");
  try {
    render(<WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />);
    format.mockClear();
    act(
      /** Replaces the actual native shell document. @returns Nothing. */ () => {
        session.docShell.InitNew(
          createDocument({ id: "replacement", suiteId: "writer", title: "Replacement" }),
        );
      },
    );
    const replacement = session.docShell.GetDoc();
    expect(replacement).not.toBe(oldDoc);
    expect(session.view.GetEditWin().GetDoc()).toBe(replacement);
    expect(session.view.GetWrtShell().GetLayout()).toBe(root);
    expect(format).toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Writer document text" })).not.toHaveTextContent(
      "Old owner text",
    );
    expect(session.docShell.GetDocumentState().isModified).toBe(false);
    expect(replacement.GetUndoManager().GetUndoActionCount()).toBe(0);
    act(
      /** Continues editing original replacement nodes. @returns Nothing. */ () => {
        session.view.GetWrtShell().Insert("Replacement text");
      },
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Replacement text",
    );
    expect(replacement.paragraphs[0]?.GetText()).toBe("Replacement text");
  } finally {
    cleanup();
    format.mockRestore();
    session.Close();
  }
});
it("native editor retains shared layout while native vertical ruler visibility changes", /** Verifies chrome changes do not introduce another formatting root. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    root = session.view.GetWrtShell().GetLayout(),
    format = vi.spyOn(SwRootFrame.prototype, "Format");
  try {
    render(<WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />);
    act(
      /** Applies original native view-option change. @returns Nothing. */ () => {
        session.view.GetWrtShell().GetViewOptions().ToggleVerticalRuler();
      },
    );
    expect(session.viewStore.GetSnapshot().isVerticalRulerVisible).toBe(false);
    expect(format).toHaveBeenCalled();
    expect(
      format.mock.instances.every(
        /** Verifies original native root throughout chrome changes. @param receiver - Format receiver. @returns Whether original. */ (
          receiver,
        ) => receiver === root,
      ),
    ).toBe(true);
    expect(session.view.GetWrtShell().GetLayout()).toBe(root);
  } finally {
    cleanup();
    format.mockRestore();
    session.Close();
  }
});
