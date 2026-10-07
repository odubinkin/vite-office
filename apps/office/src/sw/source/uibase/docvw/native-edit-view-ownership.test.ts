/** @fileoverview Checks source view references keep actual edit/shell/layout/history owners across lifecycle changes. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwView } from "../uiview/view";
const views: SwView[] = [];
afterEach(
  /** Releases actual native view graphs. @returns Nothing. */ () => {
    for (const view of views.splice(0)) view.Close();
  },
);
/** Creates a real source view over one original document. @param id - Fixture identity. @returns Actual owners. */
function fixture(id: string) {
  const doc = new SwDoc(),
    owner = new SwDocShell(doc, createDocument({ id, suiteId: "writer", title: id })),
    view = new SwView(owner);
  views.push(view);
  return { doc, owner, view, shell: view.GetWrtShell(), edit: view.GetEditWin() };
}
it("source view references keep distinct document cursors, typing and native history", /** Checks reference identity has observable document consequences. @returns Nothing. */ () => {
  const a = fixture("first"),
    b = fixture("second"),
    nodeA = a.shell.GetActiveParagraph(),
    nodeB = b.shell.GetActiveParagraph();
  expect(a.edit.GetView()).toBe(a.view);
  expect(a.shell.GetView()).toBe(a.view);
  expect(b.edit.GetView()).toBe(b.view);
  expect(b.shell.GetView()).toBe(b.view);
  expect(a.view.GetEditWin()).toBe(a.edit);
  expect(a.edit.InsertText("A")).toBe(true);
  expect(b.edit.InsertText("B")).toBe(true);
  expect(nodeA.GetText()).toBe("A");
  expect(nodeB.GetText()).toBe("B");
  expect(a.edit.Undo()).toBe(true);
  expect(nodeA.GetText()).toBe("");
  expect(nodeB.GetText()).toBe("B");
  expect(b.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(a.edit.Redo()).toBe(true);
  expect(nodeA.GetText()).toBe("A");
});
it("source child references do not follow a different current view on the same document shell", /** Checks native m_rView is borrowed from creation rather than an active-view lookup. @returns Nothing. */ () => {
  const a = fixture("shared"),
    another = new SwView(a.owner);
  views.unshift(another);
  expect(a.owner.GetWrtShell()).toBe(another.GetWrtShell());
  expect(a.shell.GetView()).toBe(a.view);
  expect(a.edit.GetView()).toBe(a.view);
  expect(another.GetWrtShell().GetView()).toBe(another);
  expect(another.GetEditWin().GetView()).toBe(another);
  expect(a.edit.InsertText("original")).toBe(true);
  expect(a.edit.GetView().GetWrtShell()).toBe(a.shell);
  expect(a.shell.GetActiveParagraph().GetText()).toBe("original");
});
it.each([1, 3])(
  "source view references retain layout/edit identity over %s document replacements",
  /** Checks no stale source shell/document closure survives replacement. @param count - Actual replacements. @returns Nothing. */ (
    count,
  ) => {
    const f = fixture("replace"),
      layout = f.view.GetLayout(),
      original = f.shell.GetActiveParagraph();
    f.edit.InsertText("old");
    for (let i = 0; i < count; i++) {
      const next = f.owner.InitNew(
        createDocument({ id: "replacement" + i, suiteId: "writer", title: "New" }),
      );
      expect(f.view.GetEditWin()).toBe(f.edit);
      expect(f.view.GetWrtShell()).toBe(f.shell);
      expect(f.view.GetLayout()).toBe(layout);
      expect(f.shell.GetLayout()).toBe(layout);
      expect(f.edit.GetView()).toBe(f.view);
      expect(f.shell.GetView()).toBe(f.view);
      expect(f.edit.GetDoc()).toBe(next);
      expect(f.edit.InsertText("new")).toBe(true);
      expect(next.paragraphs[0]?.GetText()).toBe("new");
      expect(f.edit.Undo()).toBe(true);
      expect(next.paragraphs[0]?.GetText()).toBe("");
    }
    expect(original.GetText()).toBe("old");
  },
);
it("standalone core shell rejects a missing view without constructing an alternate owner", /** Checks the retained backend-only shell contract cannot fabricate a UI view. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    owner = new SwDocShell(
      doc,
      createDocument({ id: "standalone", suiteId: "writer", title: "Core" }),
    ),
    shell = new SwWrtShell(owner),
    node = shell.GetActiveParagraph(),
    layout = shell.GetLayout();
  try {
    expect(shell.GetLayout()).toBe(layout);
    expect(
      /** Requests the source view from a deliberately detached core shell. @returns Native view. */ () =>
        shell.GetView(),
    ).toThrow("no attached SwView");
    expect(owner.GetWrtShell()).toBeUndefined();
    expect(shell.Insert("core")).toBe(true);
    expect(node.GetText()).toBe("core");
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(owner.GetWrtShell()).toBeUndefined();
  } finally {
    shell.Close();
  }
});
