/** @fileoverview Source-derived model-text search checks over real Writer nodes, sections and registered positions. */
import { expect, it } from "vitest";
import { SwCursor } from "./swcrsr";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { REG_NOT_BEGINOFLINE } from "../../../../offapi/com/sun/star/util/SearchFlags";
import { FindText, FindTextImpl } from "./findtxt";
import { SwPaM, SwPosition } from "./pam";
import { SwDoc } from "../doc/doc";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { SwTextNode } from "../txtnode/ndtxt";
/** Copies text to a native string. @param text - Model text. @returns Actual value. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes one UTF-16 unit. @param c - Unit. @returns Number. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Constructs a real registered range, disposing transient position owners. @param first - Start node. @param low - Start offset. @param last - End node. @param high - End offset. @returns Native range. */
function range(first: SwTextNode, low: number, last = first, high = first.Len()): SwPaM {
  const start = new SwPosition(first, low),
    end = new SwPosition(last, high);
  try {
    return new SwPaM(start, end);
  } finally {
    start.Dispose();
    end.Dispose();
  }
}
it("retains empty model searches, default find mode and structural other-area boundaries", /** Uses actual document sections and public cursor boundary selectors. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    position = new SwPosition(node, 0),
    cursor = new SwCursor(position),
    region = range(node, 0),
    options = new SearchOptions2();
  position.Dispose();
  try {
    expect(FindTextImpl(cursor, options, new TextSearch(options), false, region)).toBe(false);
    node.SetText("needle");
    options.searchString.assign(string("needle"));
    cursor.FillFindPos(SwDocPositions.OtherStart, cursor.GetPoint());
    expect(cursor.GetPoint().GetNode()).toBe(node);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    cursor.FillFindPos(SwDocPositions.OtherEnd, cursor.GetPoint());
    expect(cursor.GetPoint().GetNode()).toBe(doc.nodes.GetEndOfContent().StartOfSectionNode());
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    cursor.GetPoint().Assign(node, 0);
    expect(
      FindText(
        cursor,
        options,
        SwDocPositions.Start,
        SwDocPositions.End,
        [false],
        FindRanges.InBody,
      ),
    ).toBe(1);
    expect(cursor.Start().GetContentIndex()).toBe(0);
    expect(cursor.End().GetContentIndex()).toBe(6);
    cursor.DeleteMark();
    expect(
      FindText(
        cursor,
        options,
        SwDocPositions.Start,
        SwDocPositions.End,
        [false],
        FindRanges.InOther,
      ),
    ).toBe(0);
  } finally {
    region.Dispose();
    cursor.Dispose();
  }
});
/** Searches one initialized model string and returns directional source endpoints. @param text - Node text. @param key - Pattern. @param backward - Direction. @returns Point and mark. */
function search(text: string, key: string, backward: boolean): readonly number[] | undefined {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText(text);
  const options = new SearchOptions2();
  options.searchString.assign(string(key));
  const region = range(node, 0),
    cursor = range(node, backward ? node.Len() : 0);
  try {
    return FindTextImpl(cursor, options, new TextSearch(options), backward, region)
      ? [cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]
      : undefined;
  } finally {
    region.Dispose();
    cursor.Dispose();
  }
}
it.each([false, true])(
  "searches body and table text through the original SwNodes order backward=%s",
  /** Skips structural nodes and preserves actual paragraph identity. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc(),
      first = doc.paragraphs[0] as SwTextNode;
    first.SetText("before");
    const table = doc.nodes.MakeTableNode("Search table", { width: 3000 }, first);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      cell = row.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (cell === undefined) throw Error("Missing cell");
    cell.SetText("inside needle cell");
    const last = doc.nodes.MakeTextNode("after");
    const options = new SearchOptions2();
    options.searchString.assign(string("needle"));
    const region = range(first, 0, last, last.Len()),
      cursor = range(backward ? last : first, backward ? last.Len() : 0);
    try {
      expect(FindTextImpl(cursor, options, new TextSearch(options), backward, region)).toBe(true);
      expect(cursor.GetPoint().GetNode()).toBe(cell);
      expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual(
        backward ? [7, 13] : [13, 7],
      );
    } finally {
      region.Dispose();
      cursor.Dispose();
    }
  },
);
it("does not join paragraphs, search outside selected bounds or mutate failed cursor owners", /** Verifies the model traversal contract without document-string concatenation. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0] as SwTextNode,
    last = doc.nodes.MakeTextNode("end");
  first.SetText("begin");
  const options = new SearchOptions2();
  options.searchString.assign(string("inend"));
  const region = range(first, 0, last, last.Len()),
    cursor = range(first, 0);
  try {
    const point = cursor.GetPoint(),
      mark = cursor.GetMark();
    expect(FindTextImpl(cursor, options, new TextSearch(options), false, region)).toBe(false);
    expect(cursor.GetPoint()).toBe(point);
    expect(cursor.GetMark()).toBe(mark);
    options.searchString.assign(string("begin"));
    const bounded = range(first, 1, first, first.Len());
    try {
      expect(FindTextImpl(cursor, options, new TextSearch(options), false, bounded)).toBe(false);
    } finally {
      bounded.Dispose();
    }
    const empty = range(last, last.Len());
    try {
      expect(FindTextImpl(empty, options, new TextSearch(options), true, empty)).toBe(false);
    } finally {
      empty.Dispose();
    }
    const foreign = new SwDoc(),
      other = range(foreign.paragraphs[0] as SwTextNode, 0);
    try {
      expect(
        /** Rejects a foreign registered graph. @returns Whether found. */ () =>
          FindTextImpl(other, options, new TextSearch(options), false, region),
      ).toThrow("another document");
    } finally {
      other.Dispose();
    }
  } finally {
    region.Dispose();
    cursor.Dispose();
  }
});
it("uses the native region rather than the result cursor as the search start", /** Mirrors MakeRegion direction normalization even when the result cursor starts elsewhere. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("x x");
  const options = new SearchOptions2();
  options.searchString.assign(string("x"));
  const region = range(node, 0),
    cursor = range(node, 3);
  try {
    expect(FindTextImpl(cursor, options, new TextSearch(options), false, region)).toBe(true);
    expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([
      1, 0,
    ]);
    expect(FindTextImpl(cursor, options, new TextSearch(options), true, region)).toBe(true);
    expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([
      2, 3,
    ]);
  } finally {
    region.Dispose();
    cursor.Dispose();
  }
});
it("retains native soft-hyphen removal, directional recovery and literal single-character search", /** Covers source DoSearch/lcl_CleanStr boundary predicates exactly. @returns Nothing. */ () => {
  expect(search("a\u00adb", "ab", false)).toEqual([3, 0]);
  expect(search("a\u00adb", "ab", true)).toEqual([0, 3]);
  expect(search("\u00adab", "ab", false)).toEqual([3, 1]);
  expect(search("\u00adab", "ab", true)).toEqual([0, 3]);
  expect(search("ab\u00ad", "ab", false)).toEqual([2, 0]);
  expect(search("ab\u00ad", "ab", true)).toEqual([0, 3]);
  expect(search("a\u00adb", "\u00ad", false)).toEqual([2, 1]);
  expect(search("a\u00adb", "\u00ad", true)).toEqual([1, 2]);
  expect(search("a\u00adb", "a\u00adb", false)).toBeUndefined();
  expect(search("\u00ad", "ab", false)).toBeUndefined();
});

it.each([false, true])(
  "Find_Text owns directional all-match cursor rings backward=%s",
  /** Checks actual source scope flags and preserves source order rather than returning projection IDs. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc(),
      first = doc.paragraphs[0] as SwTextNode,
      last = doc.nodes.MakeTextNode("a");
    first.SetText("a a");
    const initial = range(first, 1),
      cursor = new SwCursor(initial.GetPoint());
    initial.Dispose();
    const options = new SearchOptions2();
    options.searchString.assign(string("a"));
    const cancel: [boolean] = [true];
    try {
      expect(
        cursor.Find_Text(
          options,
          false,
          backward ? SwDocPositions.End : SwDocPositions.Start,
          backward ? SwDocPositions.Start : SwDocPositions.End,
          cancel,
          FindRanges.InSelAll | FindRanges.InBodyOnly,
        ),
      ).toBe(3);
      expect(cancel[0]).toBe(false);
      const selections = [...cursor.GetRingContainer()].map(
        /** Reads actual model endpoints. @param pam - Native ring member. @returns Stable source endpoints. */ (
          pam,
        ) => [
          pam.GetPoint().GetNode() === last,
          pam.GetPoint().GetContentIndex(),
          pam.GetMark().GetContentIndex(),
        ],
      );
      expect(selections).toEqual(
        backward
          ? [
              [true, 0, 1],
              [false, 2, 3],
              [false, 0, 1],
            ]
          : [
              [false, 1, 0],
              [false, 3, 2],
              [true, 1, 0],
            ],
      );
      const primary = cursor.GetPoint(),
        siblings = [...cursor.GetRingContainer()];
      options.searchString.assign(string("missing"));
      expect(
        cursor.Find_Text(
          options,
          false,
          SwDocPositions.Start,
          SwDocPositions.End,
          cancel,
          FindRanges.InSelAll,
        ),
      ).toBe(0);
      expect(cursor.GetPoint()).toBe(primary);
      expect([...cursor.GetRingContainer()]).toEqual(siblings);
    } finally {
      while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
      cursor.Dispose();
    }
  },
);
it("Find_Text honors native selection flags, current bounds and preserved ordinary marks", /** Covers actual cursor ranges and REG_NOT_BEGINOFLINE selection scope. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("a a a");
  const selected = range(node, 2, node, 3),
    cursor = new SwCursor(selected.GetPoint(), selected.GetMark());
  selected.Dispose();
  const options = new SearchOptions2();
  options.searchString.assign(string("a"));
  const cancel: [boolean] = [true];
  try {
    options.searchFlag = REG_NOT_BEGINOFLINE;
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Start,
        SwDocPositions.End,
        cancel,
        FindRanges.InSelAll,
      ),
    ).toBe(1);
    expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([
      3, 2,
    ]);
    options.searchFlag = 0;
    cursor.GetPoint().SetContent(0);
    cursor.GetMark().SetContent(4);
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Curr,
        SwDocPositions.End,
        cancel,
        FindRanges.InBody,
      ),
    ).toBe(1);
    expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([
      1, 4,
    ]);
    cursor.DeleteMark();
    cursor.GetPoint().SetContent(3);
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Curr,
        SwDocPositions.End,
        cancel,
        FindRanges.InBody,
      ),
    ).toBe(1);
    expect([cursor.GetPoint().GetContentIndex(), cursor.GetMark().GetContentIndex()]).toEqual([
      5, 4,
    ]);
    const point = cursor.GetPoint();
    cursor.FillFindPos(SwDocPositions.Start, point);
    expect(point.GetContentIndex()).toBe(0);
    cursor.FillFindPos(SwDocPositions.End, point);
    expect(point.GetContentIndex()).toBe(5);
    cursor.FillFindPos(999 as SwDocPositions, point);
    expect(point.GetContentIndex()).toBe(5);
    for (const [notes, replace, layout] of [[true, false, undefined]] as const)
      expect(
        /** Rejects unported native operation modes without changing content/history. @returns Match count. */ () =>
          cursor.Find_Text(
            options,
            notes,
            SwDocPositions.Start,
            SwDocPositions.End,
            cancel,
            FindRanges.InBody,
            replace,
            layout,
          ),
      ).toThrow("not implemented");
    expect(node.GetText()).toBe("a a a");
  } finally {
    cursor.Dispose();
  }
});
it("Normalize preserves range extent and changes only native point/mark orientation", /** Verifies both native orientations, repeat calls and a collapsed cursor. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abc");
  const selection = range(node, 0, node, 3);
  try {
    selection.Normalize(false);
    expect([selection.GetPoint().GetContentIndex(), selection.GetMark().GetContentIndex()]).toEqual(
      [3, 0],
    );
    selection.Normalize(false);
    expect(selection.GetPoint().GetContentIndex()).toBe(3);
    selection.Normalize(true);
    expect([selection.GetPoint().GetContentIndex(), selection.GetMark().GetContentIndex()]).toEqual(
      [0, 3],
    );
    selection.Normalize(true);
    expect(selection.GetPoint().GetContentIndex()).toBe(0);
    selection.DeleteMark();
    selection.Normalize(false);
    expect(selection.HasMark()).toBe(false);
  } finally {
    selection.Dispose();
  }
});
