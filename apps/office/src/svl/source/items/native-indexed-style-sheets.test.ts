/** @fileoverview All nine original IndexedStyleSheets QA contracts plus source reindex, predicate and Clear observations. Caller witnesses provide only the borrowed name/family operations used by this collection. */
import { afterEach, expect, it } from "vitest";
import {
  IndexedStyleSheets,
  SearchBehavior,
  type StyleSheetPredicate,
} from "../../inc/IndexedStyleSheets";
import { SfxStyleFamily as Family } from "../../inc/style";
import { OUString } from "../../../sal/inc/rtl/ustring";
const owners: OUString[] = [];
/** Creates an actual shared UTF16 value. @param text - Logical units. @returns Owned value. */
function unicode(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  const value = new OUString(units, units.length);
  owners.push(value);
  return value;
}
/** Native QA uses MockedStyleSheet; this caller witness supplies only the two original methods consumed by the index, not a production stylesheet class. @param name - Original name. @param family - Family. @returns Borrowed caller identity. */
function sheet(name: string, family = Family.Char) {
  const value = unicode(name);
  return {
    name: value,
    family,
    /** Returns the stable native name member. @returns Name. */ GetName() {
      return this.name;
    },
    /** Returns the native family member. @returns Family. */ GetFamily() {
      return this.family;
    },
  };
}
const always: StyleSheetPredicate = {
  /** Original native DummyPredicate. @returns True. */ Check() {
    return true;
  },
};
afterEach(
  /** Ends test-owned string scopes. @returns Nothing. */ () => {
    for (const value of owners) value.dispose();
    owners.length = 0;
  },
);

it("ports InstantiationWorks", /** Instantiates the actual index owner. @returns Nothing. */ () => {
  expect(new IndexedStyleSheets().GetNumberOfStyleSheets()).toBe(0);
});
it("ports AddedStylesheetsCanBeFoundAndRetrievedByPosition", /** Replays native pointer retrieval. @returns Nothing. */ () => {
  const a = sheet("name1"),
    b = sheet("name2"),
    index = new IndexedStyleSheets();
  index.AddStyleSheet(a);
  index.AddStyleSheet(b);
  expect(index.GetStyleSheetByPosition(index.FindStyleSheetPosition(b))).toBe(b);
});
it("ports AddingSameStylesheetTwiceHasNoEffect", /** Replays native pointer duplicate guard. @returns Nothing. */ () => {
  const a = sheet("sheet1"),
    index = new IndexedStyleSheets();
  index.AddStyleSheet(a);
  expect(index.GetNumberOfStyleSheets()).toBe(1);
  index.AddStyleSheet(a);
  expect(index.GetNumberOfStyleSheets()).toBe(1);
});
it("ports RemovedStyleSheetIsNotFound", /** Replays native removal and membership. @returns Nothing. */ () => {
  const a = sheet("name1"),
    b = sheet("name2"),
    index = new IndexedStyleSheets();
  index.AddStyleSheet(a);
  index.AddStyleSheet(b);
  expect(index.RemoveStyleSheet(a)).toBe(true);
  expect(index.HasStyleSheet(a)).toBe(false);
  expect(index.FindStyleSheetPosition(b)).toBe(0);
});
it("ports RemovingStyleSheetWhichIsNotAvailableHasNoEffect", /** Replays native absent removal. @returns Nothing. */ () => {
  const a = sheet("sheet1"),
    b = sheet("sheet2"),
    index = new IndexedStyleSheets();
  index.AddStyleSheet(a);
  expect(index.RemoveStyleSheet(b)).toBe(false);
  expect(index.GetNumberOfStyleSheets()).toBe(1);
});
it("ports StyleSheetsCanBeRetrievedByTheirName", /** Sorts unordered duplicate results as the original QA does. @returns Nothing. */ () => {
  const a = sheet("name1"),
    b = sheet("name2"),
    c = sheet("name1"),
    index = new IndexedStyleSheets();
  for (const value of [a, b, c]) index.AddStyleSheet(value);
  expect(index.FindPositionsByName(unicode("name1")).sort()).toEqual([0, 2]);
  expect(index.FindPositionsByName(unicode("name2"))).toEqual([1]);
});
it("ports KnowsThatItStoresAStyleSheet", /** Replays native equal-name distinct pointer membership. @returns Nothing. */ () => {
  const a = sheet("name1"),
    b = sheet("name1"),
    c = sheet("name2"),
    outside = sheet("name1"),
    index = new IndexedStyleSheets();
  for (const value of [a, b, c]) index.AddStyleSheet(value);
  expect(index.HasStyleSheet(a)).toBe(true);
  expect(index.HasStyleSheet(b)).toBe(true);
  expect(index.HasStyleSheet(outside)).toBe(false);
  expect(index.RemoveStyleSheet(outside)).toBe(false);
});
it("ports PositionCanBeQueriedByFamily", /** Replays original family vector sizes. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets();
  for (const value of [sheet("name1"), sheet("name2", Family.Para), sheet("name3")])
    index.AddStyleSheet(value);
  expect(index.GetStyleSheetsByFamily(Family.Char)).toHaveLength(2);
  expect(index.GetStyleSheetsByFamily(Family.Para)).toHaveLength(1);
});
it("ports OnlyOneStyleSheetIsReturnedWhenReturnFirstIsUsed", /** Preserves original count-only selection assertion for unordered duplicate names. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets();
  for (const value of [sheet("name1"), sheet("name1", Family.Para), sheet("name1")])
    index.AddStyleSheet(value);
  expect(IndexedStyleSheets.SearchBehavior).toBe(SearchBehavior);
  expect(
    index.FindPositionsByNameAndPredicate(unicode("name1"), always, SearchBehavior.ReturnFirst),
  ).toHaveLength(1);
  expect(index.FindPositionsByNameAndPredicate(unicode("name1"), always)).toHaveLength(3);
});

it("keeps all six native family vectors live across rebuilds", /** Verifies native vector identity rather than snapshots. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    families = [Family.Char, Family.Para, Family.Frame, Family.Page, Family.Pseudo, Family.Table];
  const views = families.map(
    /** Borrows the native const vector. @param family - Native family. @returns View. */ (
      family,
    ) => index.GetStyleSheetsByFamily(family),
  );
  const values = families.map(
    /** Creates source-valid family caller. @param family - Native family. @returns Style. */ (
      family,
    ) => sheet(String(family), family),
  );
  for (const value of values) index.AddStyleSheet(value);
  index.Reindex();
  for (let i = 0; i < families.length; i++) {
    expect(views[i]).toBe(index.GetStyleSheetsByFamily(families[i] as Family));
    expect(views[i]).toEqual([values[i]]);
  }
  for (const invalid of [Family.None, Family.All, Family.Cell])
    expect(
      /** Exercises original unsupported-family assertion. @returns Vector. */ () =>
        index.GetStyleSheetsByFamily(invalid),
    ).toThrow("assert(false)");
});
it("preserves exact case nul and surrogate names and independent position snapshots", /** Uses real OUString logical lengths without locale normalization. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    names = ["a", "A", "a\0b", "\ud800a", "😀"];
  for (const name of names) index.AddStyleSheet(sheet(name));
  for (const [pos, name] of names.entries())
    expect(index.FindPositionsByName(unicode(name))).toEqual([pos]);
  expect(index.FindPositionsByName(unicode("missing"))).toEqual([]);
  const copy = index.FindPositionsByName(unicode("a"));
  copy[0] = 99;
  expect(index.FindPositionsByName(unicode("a"))).toEqual([0]);
});
it("requires explicit reindex after caller name changes and updates one identity only", /** Verifies the source's documented stale-name boundary and precise one-pointer update. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    a = sheet("same"),
    b = sheet("same");
  index.AddStyleSheet(a);
  index.AddStyleSheet(b);
  a.name.assign(unicode("changed"));
  expect(index.HasStyleSheet(a)).toBe(false);
  expect(index.RemoveStyleSheet(a)).toBe(false);
  expect(index.FindPositionsByName(unicode("same")).sort()).toEqual([0, 1]);
  index.ReindexOnNameChange(a, unicode("same"), unicode("changed"));
  expect(index.HasStyleSheet(a)).toBe(true);
  expect(index.HasStyleSheet(b)).toBe(true);
  expect(index.FindPositionsByName(unicode("same"))).toEqual([1]);
  b.name.assign(unicode("changed"));
  index.ReindexOnNameChange(b, unicode("same"), unicode("changed"));
  expect(index.FindPositionsByName(unicode("same"))).toEqual([]);
  expect(index.FindPositionsByName(unicode("changed")).sort()).toEqual([0, 1]);
  index.ReindexOnNameChange(sheet("changed"), unicode("changed"), unicode("ignored"));
  index.ReindexOnNameChange(a, unicode("absent"), unicode("ignored"));
  expect(index.FindPositionsByName(unicode("ignored"))).toEqual([]);
  index.ReindexOnNameChange(a, unicode("changed"), unicode("changed"));
  expect(index.FindPositionsByName(unicode("changed")).sort()).toEqual([0, 1]);
  a.name.assign(unicode("after"));
  index.Reindex();
  expect(index.FindPositionsByName(unicode("after"))).toEqual([0]);
});
it("scans predicates with original defaults ordinals end positions and callbacks", /** Exercises all query boundaries with a real caller predicate. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    a = sheet("same"),
    b = sheet("same", Family.Para),
    c = sheet("same");
  for (const value of [a, b, c]) index.AddStyleSheet(value);
  const chars: StyleSheetPredicate = {
    /** Selects original family. @param value - Style. @returns Match. */ Check(value) {
      return value.GetFamily() === Family.Char;
    },
  };
  expect(index.GetNumberOfStyleSheetsWithPredicate(chars)).toBe(2);
  expect(index.FindPositionsByPredicate(chars)).toEqual([0, 2]);
  expect(index.FindPositionsByNameAndPredicate(unicode("same"), chars).sort()).toEqual([0, 2]);
  expect(
    index.FindPositionsByNameAndPredicate(unicode("same"), chars, SearchBehavior.ReturnFirst),
  ).toHaveLength(1);
  expect(index.FindPositionsByNameAndPredicate(unicode("missing"), chars)).toEqual([]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(0, chars)).toEqual([a, 0]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(1, chars)).toEqual([c, 2]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(2, chars)).toEqual([null, 3]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(0, chars, 1)).toEqual([c, 2]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(-1, chars)).toEqual([null, 3]);
  expect(index.GetNthStyleSheetThatMatchesPredicate(0, chars, 3)).toEqual([null, 3]);
  const seen: unknown[] = [];
  index.ApplyToAllStyleSheets({
    /** Records vector-order callback. @param value - Actual style. @returns Nothing. */ DoIt(
      value,
    ) {
      seen.push(value);
    },
  });
  expect(seen).toEqual([a, b, c]);
  expect(index.GetStyleSheetByPosition(3)).toBeNull();
  expect(index.GetStyleSheetByPosition(9)).toBeNull();
  expect(
    /** Invokes original checked negative vector access. @returns Pointer. */ () =>
      index.GetStyleSheetByPosition(-1),
  ).toThrow(RangeError);
  expect(
    /** Invokes original missing identity scan. @returns Position. */ () =>
      index.FindStyleSheetPosition(sheet("outside")),
  ).toThrow("IndexedStyleSheets::FindStylePosition Looked for style not in index");
});
it("preserves Clear callback slot order and stale family vectors CALC146", /** Holds all caller values externally so the stale raw-family observation does not dereference a native dangling pointer. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    a = sheet("a"),
    b = sheet("b"),
    seen: unknown[] = [],
    states: unknown[] = [];
  index.AddStyleSheet(a);
  index.AddStyleSheet(b);
  const family = index.GetStyleSheetsByFamily(Family.Char);
  index.Clear({
    /** Observes callback before current slot clear. @param value - Actual style. @returns Nothing. */ Dispose(
      value,
    ) {
      seen.push(value);
      states.push([
        index.GetNumberOfStyleSheets(),
        index.GetStyleSheetByPosition(0),
        index.GetStyleSheetByPosition(1),
      ]);
    },
  });
  expect(seen).toEqual([a, b]);
  expect(states).toEqual([
    [2, a, b],
    [2, null, b],
  ]);
  expect(index.GetNumberOfStyleSheets()).toBe(0);
  expect(index.FindPositionsByName(a.name)).toEqual([]);
  expect(family).toBe(index.GetStyleSheetsByFamily(Family.Char));
  expect(family).toEqual([a, b]);
  index.Clear({
    /** Must not run for an empty source vector. @returns Nothing. */ Dispose() {
      throw Error("unexpected callback");
    },
  });
  const c = sheet("c");
  index.AddStyleSheet(c);
  expect(family).toEqual([a, b, c]);
  index.Reindex();
  expect(family).toEqual([c]);
});
it("retains partially cleared slots if the original cleanup callback propagates an error", /** Verifies source ordering without imposing rollback or post-destruction behavior. @returns Nothing. */ () => {
  const index = new IndexedStyleSheets(),
    a = sheet("a"),
    b = sheet("b"),
    failure = new Error("cleanup");
  index.AddStyleSheet(a);
  index.AddStyleSheet(b);
  expect(
    /** Invokes actual source callback boundary. @returns Nothing. */ () =>
      index.Clear({
        /** Throws on the second original callback. @param value - Actual style. @returns Nothing. */ Dispose(
          value,
        ) {
          if (value === b) throw failure;
        },
      }),
  ).toThrow(failure);
  expect(index.GetNumberOfStyleSheets()).toBe(2);
  expect(index.GetStyleSheetByPosition(0)).toBeNull();
  expect(index.GetStyleSheetByPosition(1)).toBe(b);
});
