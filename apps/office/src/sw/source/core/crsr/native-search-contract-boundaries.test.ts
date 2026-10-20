/** @fileoverview Real Writer range, hint-flag and undo rejection boundaries. The protected dummy flag fixture is not a field service or field-expansion implementation. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPaM, SwPosition } from "./pam";
import { FindTextImpl, SwFindParaText } from "./findtxt";
import { FIND_FOUND, FIND_NO_RING, SwCursor } from "./swcrsr";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwTextAttrEnd } from "../txtnode/txatbase";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwTextINetFormat } from "../txtnode/txtatr2";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoReplace } from "../undo/unins";
import { SwUndoSaveContent } from "../undo/undobj";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { WILDCARD } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";

/** Exposes the original protected flag through a real base attribute, without overriding readers or returning canned ownership state. */
class DummyFlag extends SwTextAttrEnd<SwFormatINetFormat> {
  /** Constructs an initialized flag fixture. @param start - Source dummy position. @returns Attribute. */
  constructor(start: number) {
    super(new SwFormatINetFormat({ url: "dummy-flag-fixture" }), start, start + 1);
    this.SetHasDummyChar(true);
  }
}
/** Exposes the actual protected content-index operation for its cross-document precondition. */
class ContentIndices extends SwUndoSaveContent {
  /** Uses original default deletion flags. @param mark - Mark. @param point - Point. @returns Nothing. */
  public collect(mark: SwPosition, point: SwPosition): void {
    this.DelContentIndex(mark, point);
  }
}
/** Constructs real registered coordinates and releases transient position owners. @param node - Actual paragraph. @param start - First coordinate. @param end - Last coordinate. @returns Range. */
function range(node: SwTextNode, start: number, end: number): SwPaM {
  const point = new SwPosition(node, start),
    mark = new SwPosition(node, end);
  try {
    return new SwPaM(point, mark);
  } finally {
    point.Dispose();
    mark.Dispose();
  }
}
it.each([false, true])(
  "retains the upstream failed whole-body find-all saved cursor marked=%s",
  /** Source Create(this) produces an unmarked saved member; failure keeps that member and removes the primary mark. @param marked - Original selection presence. @returns Nothing. */ (
    marked,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      options = new SearchOptions2();
    node.SetText("abc");
    options.searchString.assign(new OUString(new Uint8Array([122, 0])));
    const point = new SwPosition(node, 2),
      mark = new SwPosition(node, 0),
      cursor = new SwCursor(point, marked ? mark : undefined);
    point.Dispose();
    mark.Dispose();
    try {
      expect(
        cursor.Find_Text(
          options,
          false,
          SwDocPositions.Start,
          SwDocPositions.End,
          [false],
          FindRanges.InSelAll,
        ),
      ).toBe(0);
      expect(cursor.GetPoint().GetContentIndex()).toBe(2);
      expect(cursor.HasMark()).toBe(false);
      expect(
        Array.from(
          cursor.GetRingContainer(),
          /** Observes every actual retained member. @param member - Native cursor. @returns Point and mark state. */ (
            member,
          ) => [member.GetPoint().GetContentIndex(), member.HasMark()],
        ),
      ).toEqual([
        [2, false],
        [2, false],
      ]);
      expect(node.GetText()).toBe("abc");
    } finally {
      while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
      cursor.Dispose();
    }
    expect(node.HasAnyContentIndex()).toBe(false);
  },
);
it("closes every retained native find-all ring member with its owning shell", /** Destructor cleanup is independent of the upstream failed-search ring-retention quirk. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abc");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "failed-find-ring", suiteId: "writer", title: "Failed find ring" }),
    ),
    shell = new SwWrtShell(docShell),
    options = new SearchOptions2();
  options.searchString.assign(new OUString(new Uint8Array([122, 0])));
  try {
    const cursor = shell.GetCursor();
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Start,
        SwDocPositions.End,
        [false],
        FindRanges.InSelAll,
      ),
    ).toBe(0);
    expect(Array.from(cursor.GetRingContainer())).toHaveLength(2);
  } finally {
    shell.Close();
    docShell.Close();
  }
  expect(node.HasAnyContentIndex()).toBe(false);
});
it("keeps selection-only search inert when the real cursor ring has no marked selection", /** The core selection contract does not invent a body range from an unmarked caret. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    options = new SearchOptions2();
  node.SetText("abc");
  options.searchString.assign(new OUString(new Uint8Array([97, 0])));
  const position = new SwPosition(node, 0),
    cursor = new SwCursor(position),
    cancel: [boolean] = [true];
  position.Dispose();
  try {
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Start,
        SwDocPositions.End,
        cancel,
        FindRanges.InSel,
      ),
    ).toBe(0);
    expect(cursor.HasMark()).toBe(false);
    expect(cursor.GetPoint().GetContentIndex()).toBe(0);
    expect(cancel[0]).toBe(false);
    expect(node.GetText()).toBe("abc");
  } finally {
    cursor.Dispose();
  }
});
it("retains distinct wildcard matches with the same point across overlapping real selections", /** Both matches come from the actual native wildcard backend and initialized cursor ring, not a canned strategy. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode,
    options = new SearchOptions2();
  node.SetText("abc");
  options.AlgorithmType2 = WILDCARD;
  options.transliterateFlags = 0;
  options.searchString.assign(new OUString(new Uint8Array([42, 0])));
  const high = new SwPosition(node, 3),
    low = new SwPosition(node, 0),
    otherLow = new SwPosition(node, 1),
    cursor = new SwCursor(high, low);
  cursor.Create(cursor).Assign(high, otherLow);
  high.Dispose();
  low.Dispose();
  otherLow.Dispose();
  try {
    expect(
      cursor.Find_Text(
        options,
        false,
        SwDocPositions.Start,
        SwDocPositions.End,
        [false],
        FindRanges.InSel | FindRanges.InSelAll,
      ),
    ).toBe(2);
    expect(
      Array.from(
        cursor.GetRingContainer(),
        /** Observes actual match bounds. @param member - Live cursor. @returns Native content interval. */ (
          member,
        ) => [member.Start().GetContentIndex(), member.End().GetContentIndex()],
      ),
    ).toEqual([
      [0, 3],
      [1, 3],
    ]);
    expect(node.GetText()).toBe("abc");
  } finally {
    while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
    cursor.Dispose();
  }
});
it("retains the native default continue response at the replacement-history threshold", /** Base cursors choose RET_YES=2 before any shell-specific override; this is not a simulated 60000-match backend. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    position = new SwPosition(doc.paragraphs[0] as SwTextNode, 0),
    cursor = new SwCursor(position);
  position.Dispose();
  try {
    expect(cursor.MaxReplaceArived()).toBe(2);
  } finally {
    cursor.Dispose();
  }
});
it.each([false, true])(
  "retains concrete native strategy mode and no-ring result replace=%s",
  /** Initializes the original file-local concrete strategy kernel; this export is not a new UNO search API. @param replace - Original constructor mode. @returns Nothing. */ (
    replace,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      options = new SearchOptions2();
    node.SetText("ab");
    options.searchString.assign(new OUString(new Uint8Array([97, 0])));
    options.replaceString.assign(new OUString(new Uint8Array([120, 0])));
    const strategy = new SwFindParaText(options, replace),
      selected = range(node, 0, 0),
      region = range(node, 0, 2);
    try {
      expect(strategy.IsReplaceMode()).toBe(replace);
      expect(strategy.DoFind(selected, false, region)).toBe(replace ? FIND_NO_RING : FIND_FOUND);
      expect(node.GetText()).toBe(replace ? "xb" : "ab");
      expect([selected.Start().GetContentIndex(), selected.End().GetContentIndex()]).toEqual([
        0, 1,
      ]);
    } finally {
      selected.Dispose();
      region.Dispose();
    }
  },
);
it.each(["Undo", "Redo"] as const)(
  "releases transient replacement ranges when %s rejects newly introduced dummy hints",
  /** Actual shell/history owners encounter an unsupported field flag after recording their normal replacement action. @param direction - Replayed history direction. @returns Nothing. */ (
    direction,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode;
    node.SetText("abc");
    const docShell = new SwDocShell(
        doc,
        createDocument({ id: "history-error", suiteId: "writer", title: "History error" }),
      ),
      shell = new SwWrtShell(docShell),
      selected = range(node, 1, 2);
    try {
      expect(doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "x")).toBe(true);
      if (direction === "Redo") expect(shell.Undo()).toBe(true);
      const before = node.GetText();
      node.GetOrCreateSwpHints().Insert(new DummyFlag(1));
      expect(
        /** Real exception crosses the native action's temporary-range cleanup. @returns Changed flag. */ () =>
          shell[direction](),
      ).toThrow("structured replacement is not implemented");
      expect(node.GetText()).toBe(before);
    } finally {
      selected.Dispose();
      shell.Close();
      docShell.Close();
    }
    expect(node.HasAnyContentIndex()).toBe(false);
  },
);
it("rejects unrepresented dummy deletion/search before modifying real text or registered ranges", /** The native flag fixture exercises admission boundaries, not field formatting or expansion. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("a\u0001cdef");
  node.GetOrCreateSwpHints().Insert(new DummyFlag(1));
  const selected = range(node, 1, 2),
    region = range(node, 0, node.Len()),
    options = new SearchOptions2();
  options.searchString.assign(new OUString(new Uint8Array([99, 0])));
  try {
    expect(
      /** Native model search cannot expand an unrepresented field. @returns Found flag. */ () =>
        FindTextImpl(selected, options, new TextSearch(options), false, region),
    ).toThrow("field/dummy-character search is not implemented");
    expect(
      /** Document replacement checks structured hints before history mutation. @returns Changed flag. */ () =>
        doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "x"),
    ).toThrow("structured replacement is not implemented");
    expect(
      /** Low-level replacement also rejects actual dummy deletion. @returns Nothing. */ () =>
        node.ReplaceText(selected.Start(), 1, "x"),
    ).toThrow("dummy-character replacement is not implemented");
    expect(node.GetText()).toBe("a\u0001cdef");
    expect([selected.Start().GetContentIndex(), selected.End().GetContentIndex()]).toEqual([1, 2]);
    const after = new SwPosition(node, 2),
      before = new SwPosition(node, 0);
    try {
      node.ReplaceText(after, 1, "X");
      node.ReplaceText(before, 1, "Y");
      expect(node.GetText()).toBe("Y\u0001Xdef");
    } finally {
      after.Dispose();
      before.Dispose();
    }
  } finally {
    selected.Dispose();
    region.Dispose();
  }
});
it("searches ordinary ranged hints and drops an empty allocated hint container during replacement", /** An ordinary native hyperlink must not take the unsupported dummy admission path. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abc");
  node
    .GetOrCreateSwpHints()
    .Insert(new SwTextINetFormat(new SwFormatINetFormat({ url: "https://example.invalid" }), 0, 3));
  const selected = range(node, 0, 3),
    options = new SearchOptions2();
  options.searchString.assign(new OUString(new Uint8Array([98, 0])));
  try {
    expect(FindTextImpl(selected, options, new TextSearch(options), false, selected)).toBe(true);
    const hints = node.GetpSwpHints();
    expect(hints?.Count()).toBe(1);
    hints?.DeleteAtPos(0);
    expect(node.GetpSwpHints()).toBe(hints);
    node.ReplaceText(selected.Start(), 1, "X");
    expect(node.GetText()).toBe("aXc");
    expect(node.GetpSwpHints()).toBeUndefined();
  } finally {
    selected.Dispose();
  }
});
it("checks real undo range ownership and the original default normal replacement mode", /** Foreign documents and unmarked replacement ranges cannot mutate bookmark history. @returns Nothing. */ () => {
  const left = new SwDoc(),
    right = new SwDoc(),
    node = left.paragraphs[0] as SwTextNode;
  node.SetText("abc");
  const mark = new SwPosition(node, 0),
    point = new SwPosition(right.paragraphs[0] as SwTextNode, 0),
    selected = range(node, 0, 1),
    unmarked = new SwPaM(mark);
  try {
    expect(
      /** Actual registered endpoints belong to different document owners. @returns Nothing. */ () =>
        new ContentIndices().collect(mark, point),
    ).toThrow("endpoints belong to different documents");
    expect(
      /** A collapsed unmarked range is outside this represented undo operation. @returns Action. */ () =>
        new SwUndoReplace(unmarked, "x"),
    ).toThrow("requires a normal marked same-node range");
    expect(new SwUndoReplace(selected, "x").GetPayloadSize()).toBeGreaterThan(0);
    expect(node.GetText()).toBe("abc");
  } finally {
    mark.Dispose();
    point.Dispose();
    selected.Dispose();
    unmarked.Dispose();
  }
});
