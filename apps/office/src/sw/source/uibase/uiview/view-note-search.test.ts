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
import { SwPosition } from "../../core/crsr/pam";
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
