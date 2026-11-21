/** @fileoverview Tests Writer view search over real model text, annotation points and editor selections. */
import { expect, it } from "vitest";
import { PreparedOuter, PreparedView } from "../../../../test/editeng-engine-fixture";
import { EditSelection } from "../../../../editeng/inc/EditSelection";
import type { SearchEditView } from "../../../../editeng/source/editeng/impedit4.search";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import { SwFormatField } from "../../../inc/fmtfld";
import { SwTextField } from "../../../inc/txtfld";
import { SwPostItField, SwPostItFieldType } from "../../core/fields/docufld";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwView } from "./view";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Observes the original edit view operations without simulating the search engine. */
class CommentEditView extends PreparedView implements SearchEditView {
  /** Connects the view to the actual prepared editor. @param outer - Test editor owner. @returns View. */
  constructor(private readonly outer: PreparedOuter) {
    super();
  }

  /** Borrows the same native viewport and selection owner. @returns View implementation. */
  override getImpl(): this {
    return this;
  }

  /** Implements selection drawing for the test view. @returns Nothing. */
  DrawSelectionXOR(): void {}

  /** Implements the cursor reveal callback for the test view. @returns Nothing. */
  ShowCursor(): void {}

  /** Replaces the actual edit selection through the original text editor. @param text - Replacement text. @returns Nothing. */
  InsertText(text: OUStringConstReference): void {
    this.SetEditSelection(new EditSelection(this.outer.InsertText(this.selection, text)));
  }
}

it.each([false, true])(
  "interleaves body matches and consecutive comment matches backward=%s",
  /** Exercises view cursor routing and native editor selection continuation. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = createWriterDocument();
    const view = new SwView(
      new SwDocShell(doc, createDocument({ id: "note-search", suiteId: "writer", title: "Notes" })),
    );
    const shell = view.GetWrtShell();
    shell.Insert("hit one hit");
    const node = shell.GetActiveParagraph();
    const field = new SwPostItField(SwPostItFieldType.Get(doc), {
      author: "",
      initials: "",
      name: "comment1",
      text: "hit note hit",
      dateTime: new DateTime(DateTime.EMPTY),
    });
    const format = new SwFormatField(field);
    field.Dispose();
    expect(node.InsertHint(new SwTextField(format, 4))).toBe(true);
    const start = new SwPosition(node, backward ? node.Len() : 0);
    shell.SetPaM(start);
    start.Dispose();

    const outer = new PreparedOuter();
    const engine = outer.getImpl();
    engine.useActualInsertion = true;
    engine.SetText(unicode("hit note hit"));
    const editor = new CommentEditView(outer);
    editor.SetEditSelection(new EditSelection(engine.GetEditDoc().GetStartPaM()));
    const manager = view.GetPostItMgr();
    let shown = 0;
    const release = manager.RegisterSidebarWin(format, {
      editor: engine,
      view: editor,
      /** Counts the original window reveal. @returns Nothing. */ MakeVisible() {
        shown++;
      },
    });
    const search = view.GetSearch();
    const request = { ...search.GetSearchItem(), search: "hit", searchInNotes: true };
    try {
      expect(search.ExecSearch(request, SvxSearchCmd.FIND, backward).matches).toBe(1);
      expect(shell.GetCursor().Start().GetContentIndex()).toBe(backward ? 9 : 0);
      expect(manager.GetActiveField()).toBeUndefined();

      expect(search.ExecSearch(request, SvxSearchCmd.FIND, backward).matches).toBe(1);
      expect(manager.GetActiveField()).toBe(format);
      expect(editor.selection.Min().GetIndex()).toBe(backward ? 9 : 0);
      expect(shown).toBe(1);

      expect(
        search.ExecSearch({ ...request, replacement: "new" }, SvxSearchCmd.REPLACE, backward)
          .matches,
      ).toBe(1);
      expect(editor.selection.Min().GetIndex()).toBe(backward ? 0 : 9);
      const updated = outer.GetText();
      try {
        expect(text(updated)).toBe(backward ? "hit note new" : "new note hit");
        expect(node.GetText()).toBe(`hit ${CH_TXTATR_INWORD}one hit`);
      } finally {
        updated.dispose();
      }
      expect(shown).toBe(1);

      expect(search.ExecSearch(request, SvxSearchCmd.FIND, backward).matches).toBe(1);
      expect(manager.GetActiveField()).toBeUndefined();
      expect(shell.GetCursor().Start().GetContentIndex()).toBe(backward ? 0 : 9);
    } finally {
      release();
      view.Close();
    }
  },
);

it("uses the native annotation span length for a paragraph-end pattern", /** Preserves the source comparison of a paragraph coordinate with a span length. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const view = new SwView(
    new SwDocShell(doc, createDocument({ id: "note-anchor", suiteId: "writer", title: "Notes" })),
    undefined,
    undefined,
    createBrowserRegexMatcher,
  );
  const shell = view.GetWrtShell();
  shell.Insert("ab");
  const node = shell.GetActiveParagraph();
  const field = new SwPostItField(SwPostItFieldType.Get(doc), {
    author: "",
    initials: "",
    name: "comment",
    text: "",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  try {
    node.InsertHint(new SwTextField(new SwFormatField(field), 1));
    const search = view.GetSearch();
    const item = { ...search.GetSearchItem(), search: "b$", regularExpression: true };
    expect(search.ExecSearch(item, SvxSearchCmd.FIND).matches).toBe(1);
    expect(search.ExecSearch({ ...item, searchInNotes: true }, SvxSearchCmd.FIND).matches).toBe(0);
  } finally {
    field.Dispose();
    view.Close();
  }
});

it.each([false, true])(
  "replaces body matches on both sides of a ranged comment backward=%s",
  /** Exercises Replace All, indexed annotation tracking, and the original field history. @param backward - Search direction. @returns Nothing. */
  (backward) => {
    const doc = createWriterDocument();
    const view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "note-replace", suiteId: "writer", title: "Notes" }),
      ),
    );
    const shell = view.GetWrtShell();
    shell.Insert("hit inside hit");
    const node = shell.GetActiveParagraph();
    const start = new SwPosition(node, 4);
    const end = new SwPosition(node, 10);
    const anchor = new SwPaM(end, start);
    const field = new SwPostItField(SwPostItFieldType.Get(doc), {
      author: "Author",
      initials: "A",
      name: "comment",
      text: "hit in the comment",
      dateTime: new DateTime(DateTime.EMPTY),
    });
    try {
      const format = doc.GetDocumentContentOperationsManager().InsertPostItField(anchor, field);
      const id = format.GetField().GetPostItId();
      /** Checks native text, point hint, and its registered marked range. @param word - Current body text. @returns Nothing. */
      function expectComment(word: string): void {
        const comment = SwPostItFieldType.Get(doc).FindFormat(id);
        expect(comment?.GetField().GetData().text).toBe("hit in the comment");
        expect(comment?.GetTextField()?.GetStart()).toBe(word.length + 7);
        expect(node.GetText()).toBe(`${word} inside${CH_TXTATR_INWORD} ${word}`);
        if (!comment) throw new Error("Expected the body annotation");
        const mark = doc.GetIDocumentMarkAccess().GetAnnotationMark(comment);
        expect(mark?.GetMarkStart().GetContentIndex()).toBe(word.length + 1);
        expect(mark?.GetMarkEnd().GetContentIndex()).toBe(word.length + 8);
      }
      const search = view.GetSearch();
      const item = { ...search.GetSearchItem(), search: "hit", replacement: "matched" };
      expectComment("hit");
      expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL, backward).matches).toBe(2);
      expectComment("matched");
      expect(shell.Undo()).toBe(true);
      expectComment("hit");
      expect(shell.Redo()).toBe(true);
      expectComment("matched");

      // WRITER-010: Replace redo does not rearm the temporary hint history.
      expect(shell.Undo()).toBe(true);
      expect(node.GetText()).toBe(`hit inside${CH_TXTATR_INWORD} hit`);
      expect(SwPostItFieldType.Get(doc).FindFormat(id)).toBeUndefined();
    } finally {
      field.Dispose();
      anchor.Dispose();
      start.Dispose();
      end.Dispose();
      view.Close();
    }
  },
);

it("moves an annotation across a replaced paragraph boundary", /** Exercises native join and split restoration through Find and Replace. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const view = new SwView(
    new SwDocShell(doc, createDocument({ id: "note-join", suiteId: "writer", title: "Notes" })),
    undefined,
    undefined,
    createBrowserRegexMatcher,
  );
  const shell = view.GetWrtShell();
  shell.Insert("first");
  shell.SplitNode();
  shell.Insert("inside second");
  const start = new SwPosition(shell.GetActiveParagraph(), 0);
  const end = new SwPosition(shell.GetActiveParagraph(), 6);
  const anchor = new SwPaM(end, start);
  const field = new SwPostItField(SwPostItFieldType.Get(doc), {
    author: "Author",
    initials: "A",
    name: "note",
    text: "Ranged comment",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  try {
    const format = doc.GetDocumentContentOperationsManager().InsertPostItField(anchor, field);
    const id = format.GetField().GetPostItId();
    const search = view.GetSearch();
    const item = {
      ...search.GetSearchItem(),
      search: "$",
      replacement: "-",
      regularExpression: true,
    };
    /** Checks the actual field owner and the tracked mark after a paragraph move. @param offset - Offset of the annotated text. @returns Nothing. */
    function expectAnchor(offset: number): void {
      const attached = SwPostItFieldType.Get(doc).FindFormat(id);
      if (!attached) throw new Error("Expected the moved annotation");
      expect(attached.GetField().GetData().text).toBe("Ranged comment");
      expect(attached.GetTextField()?.GetStart()).toBe(offset + 6);
      const mark = doc.GetIDocumentMarkAccess().GetAnnotationMark(attached);
      expect(mark?.GetMarkStart().GetContentIndex()).toBe(offset);
      expect(mark?.GetMarkEnd().GetContentIndex()).toBe(offset + 7);
      expect(mark?.GetMarkStart().GetNode()).toBe(doc.paragraphs.at(-1));
    }
    expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(1);
    expect(doc.paragraphs).toHaveLength(1);
    expect(doc.paragraphs[0]?.GetText()).toBe(`first-inside${CH_TXTATR_INWORD} second`);
    expectAnchor(6);
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs).toHaveLength(2);
    expectAnchor(0);
  } finally {
    field.Dispose();
    anchor.Dispose();
    start.Dispose();
    end.Dispose();
    view.Close();
  }
});

it.each([false, true])(
  "restores a comment deleted by a body match across its marker (ranged=%s)",
  /** Exercises the text hint and separate mark history through the Writer search view. @param ranged - Whether the field has an annotation mark. @returns Nothing. */
  (ranged) => {
    const doc = createWriterDocument();
    const view = new SwView(
      new SwDocShell(
        doc,
        createDocument({ id: "note-covered", suiteId: "writer", title: "Notes" }),
      ),
    );
    const shell = view.GetWrtShell();
    shell.Insert("hit tail");
    const node = shell.GetActiveParagraph();
    const start = new SwPosition(node, 0);
    const end = new SwPosition(node, 1);
    const anchor = new SwPaM(end, ranged ? start : undefined);
    const field = new SwPostItField(SwPostItFieldType.Get(doc), {
      author: "Author",
      initials: "A",
      name: "covered",
      text: "Existing comment",
      dateTime: new DateTime(DateTime.EMPTY),
    });
    try {
      const format = doc.GetDocumentContentOperationsManager().InsertPostItField(anchor, field);
      const id = format.GetField().GetPostItId();
      const fieldType = SwPostItFieldType.Get(doc);
      const marks = doc.GetIDocumentMarkAccess();
      const search = view.GetSearch();
      const item = { ...search.GetSearchItem(), search: "hit", replacement: "matched" };
      expect(node.GetText()).toBe(`h${CH_TXTATR_INWORD}it tail`);
      expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(1);
      expect(node.GetText()).toBe("matched tail");
      expect(fieldType.FindFormat(id)).toBeUndefined();
      expect(marks.GetAllMarks()).toHaveLength(0);

      for (let cycle = 0; cycle < (ranged ? 2 : 1); cycle++) {
        expect(shell.Undo()).toBe(true);
        expect(node.GetText()).toBe(`h${CH_TXTATR_INWORD}it tail`);
        const restored = fieldType.FindFormat(id);
        if (!restored) throw new Error("Expected the restored annotation");
        expect(restored.GetField().GetData().text).toBe("Existing comment");
        expect(restored.GetTextField()?.GetStart()).toBe(1);
        const mark = marks.GetAnnotationMark(restored);
        expect(mark?.GetMarkStart().GetContentIndex()).toBe(ranged ? 0 : undefined);
        expect(mark?.GetMarkEnd().GetContentIndex()).toBe(ranged ? 2 : undefined);
        expect(shell.Redo()).toBe(true);
        expect(node.GetText()).toBe("matched tail");
        expect(fieldType.FindFormat(id)).toBeUndefined();
        expect(marks.GetAllMarks()).toHaveLength(0);
      }
    } finally {
      field.Dispose();
      anchor.Dispose();
      start.Dispose();
      end.Dispose();
      view.Close();
    }
  },
);

it("keeps the native forward scan over adjacent annotation markers", /** Reproduces the source index advance after deleting the first marker (WRITER-732). @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const node = doc.paragraphs[0];
  if (!node) throw new Error("Expected a body paragraph");
  node.SetText("abc");
  const fieldType = SwPostItFieldType.Get(doc);
  const first = new SwPostItField(fieldType, {
    author: "",
    initials: "",
    name: "first",
    text: "",
    dateTime: new DateTime(DateTime.EMPTY),
  });
  const second = new SwPostItField(fieldType, { ...first.GetData(), id: 0, name: "second" });
  const firstFormat = new SwFormatField(first);
  const secondFormat = new SwFormatField(second);
  expect(node.InsertHint(new SwTextField(firstFormat, 1))).toBe(true);
  expect(node.InsertHint(new SwTextField(secondFormat, 2))).toBe(true);
  const start = new SwPosition(node, 0);
  try {
    node.ReplaceText(start, node.Len(), "ZZ");
    expect(node.GetText()).toBe("ZZ");
    const remaining = [...fieldType.GatherFields()];
    expect(remaining).toHaveLength(1);
    expect(remaining[0]).toBe(secondFormat);
    expect(secondFormat.GetTextField()?.GetStart()).toBe(1);
  } finally {
    start.Dispose();
    first.Dispose();
    second.Dispose();
    doc.Dispose();
  }
});
