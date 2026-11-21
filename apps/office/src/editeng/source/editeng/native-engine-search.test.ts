/** @fileoverview Verifies source EditEngine search and replacement over actual EditDoc paragraphs. */
import { expect, it } from "vitest";
import { PreparedOuter, PreparedView } from "../../../test/editeng-engine-fixture";
import { EditSelection } from "../../inc/EditSelection";
import { EditPaM } from "../../inc/EditPaM";
import { EDITUNDO_REPLACEALL } from "../../inc/editdata";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxSearchCmd } from "../../../svl/inc/srchitem";
import { SvxSearchItem } from "../../../svl/source/items/srchitem";
import * as MID from "../../../svl/inc/memberid";
import { ABSOLUTE, REGEXP } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { REG_NOT_BEGINOFLINE } from "../../../offapi/com/sun/star/util/SearchFlags";
import { createBrowserRegexMatcher } from "../../../i18npool/browser/regex-matcher";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { SearchEditView } from "./impedit4.search";

/** Supplies the native viewport operations to the existing editor test view. */
class SearchView extends PreparedView implements SearchEditView {
  readonly revealed: EditSelection[] = [];
  drawn = 0;

  /** Binds the actual editor used by the selection. @param outer - Existing editor owner. @returns Test view. */
  constructor(private readonly outer: PreparedOuter) {
    super();
  }

  /** Returns the native selection and drawing operations owned here. @returns This view. */
  override getImpl(): this {
    return this;
  }

  /** Counts drawing calls. @returns Nothing. */
  DrawSelectionXOR(): void {
    this.drawn++;
  }

  /** Records the selection after the source requests a visible cursor. @returns Nothing. */
  ShowCursor(): void {
    this.revealed.push(new EditSelection(this.selection));
  }

  /** Routes replacement of the active selection through the actual editor. @param value - Insertion text. @returns Nothing. */
  InsertText(value: OUStringConstReference): void {
    this.SetEditSelection(new EditSelection(this.outer.InsertText(this.selection, value)));
  }
}

/** Prepares real EditDoc paragraphs and a placed editor view. @param input - Paragraph texts separated by linefeeds. @returns Original editor, view and search item. */
function fixture(input: string) {
  const outer = new PreparedOuter();
  const engine = outer.implementation;
  engine.useActualInsertion = true;
  const value = unicode(input);
  try {
    engine.SetText(value);
  } finally {
    value.dispose();
  }
  const doc = engine.GetEditDoc();
  const view = new SearchView(outer);
  view.SetEditSelection(new EditSelection(doc.GetStartPaM()));
  return { outer, engine, doc, view, item: new SvxSearchItem(0) };
}

/** Writes original native search options. @param item - Search item. @param query - Pattern. @param restricted - Whether to use the current selection. @param regex - Whether to use regular expressions. @returns Nothing. */
function configure(item: SvxSearchItem, query: string, restricted = false, regex = false): void {
  const options = item.GetSearchOptions();
  const value = unicode(query);
  try {
    options.searchString.assign(value);
    options.AlgorithmType2 = regex ? REGEXP : ABSOLUTE;
    options.searchFlag = restricted ? REG_NOT_BEGINOFLINE : 0;
    item.SetSearchOptions(options);
  } finally {
    value.dispose();
  }
}

it("finds one match for Find All and steps over the selected match backward", /** Verifies native single-selection search and visibility ordering. @returns Nothing. */ () => {
  const { engine, doc, view, item } = fixture("one hit\nhit two");
  configure(item, "hit");
  item.PutValue(SvxSearchCmd.FIND_ALL, MID.MID_SEARCH_COMMAND);
  expect(engine.StartSearchAndReplace(view, item)).toBe(1);
  expect(view.selection.Min().GetNode()).toBe(doc.GetObject(0));
  expect(view.selection.Min().GetIndex()).toBe(4);
  expect(view.selection.Max().GetIndex()).toBe(7);
  expect(view.revealed[0]?.HasRange()).toBe(false);

  expect(engine.StartSearchAndReplace(view, item)).toBe(1);
  expect(view.selection.Min().GetNode()).toBe(doc.GetObject(1));
  item.PutValue(true, MID.MID_SEARCH_BACKWARD);
  expect(engine.StartSearchAndReplace(view, item)).toBe(1);
  expect(view.selection.Min().GetNode()).toBe(doc.GetObject(0));

  expect(engine.StartSearchAndReplace(view, item)).toBe(0);
  expect(view.selection.HasRange()).toBe(false);
  expect(view.selection.Min().GetIndex()).toBe(7);
});

it("searches within the selected span and compiles Unicode regex through the shared wrapper", /** Checks selection limits and UTF-16 offsets with a supplementary character. @returns Nothing. */ () => {
  const { engine, doc, view, item } = fixture("x😀a 😀b");
  const node = doc.GetObject(0);
  view.SetEditSelection(new EditSelection(new EditPaM(node, 5), new EditPaM(node, 8)));
  configure(item, "😀[ab]", true, true);
  expect(engine.StartSearchAndReplace(view, item, createBrowserRegexMatcher)).toBe(1);
  expect(view.selection.Min().GetIndex()).toBe(5);
  expect(view.selection.Max().GetIndex()).toBe(8);
});

it("groups Replace All from the start even when the request is backward", /** Verifies native command direction and real text insertion on each paragraph. @returns Nothing. */ () => {
  const { outer, engine, doc, view, item } = fixture("hit two\nthree hit");
  configure(item, "hit");
  item.PutValue(SvxSearchCmd.REPLACE_ALL, MID.MID_SEARCH_COMMAND);
  item.PutValue(true, MID.MID_SEARCH_BACKWARD);
  item.PutValue("new", MID.MID_SEARCH_REPLACESTRING);
  view.SetEditSelection(new EditSelection(doc.GetEndPaM()));
  const before = engine.undoEvents.length;
  expect(engine.StartSearchAndReplace(view, item)).toBe(2);
  expect(engine.undoEvents[before]).toBe(EDITUNDO_REPLACEALL);
  expect(engine.undoEvents.at(-1)).toBe(-1);
  expect(view.selection.HasRange()).toBe(false);
  const result = outer.GetText();
  try {
    expect(text(result)).toBe("new two\nthree new");
  } finally {
    result.dispose();
  }
});
