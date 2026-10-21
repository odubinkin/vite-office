/** @fileoverview Native live selection/result-ring identity, section admission and real search histories. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwCursor, FIND_NO_RING, type SwFindParas } from "./swcrsr";
import { SwPosition, type SwPaM } from "./pam";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { OUString } from "../../../../sal/inc/rtl/ustring";

/** Exposes original virtual Create ownership without replacing the search strategy or model. */
class TrackedCursor extends SwCursor {
  public readonly created: SwCursor[] = [];
  /** Tracks actual native result/saved cursor allocation. @param ring - Existing ring. @returns Native cursor. */
  public override Create(ring?: SwPaM): SwCursor {
    const member = super.Create(ring);
    this.created.push(member);
    return member;
  }
}
/** Builds actual source search options with no transliteration service replacement. @returns Literal options. */
function options(): SearchOptions2 {
  const value = new SearchOptions2();
  value.searchString.assign(new OUString(new Uint8Array([97, 0])));
  return value;
}
/** Releases every actual cursor member and its endpoint registrations. @param cursor - Ring head. @returns Nothing. */
function close(cursor: SwCursor): void {
  while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
  cursor.Dispose();
}
it.each([false, true])(
  "merges original result cursor identities, backward=%s",
  /** Verifies actual cursor identity in either search direction. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode;
    node.SetText("a a a");
    const position = new SwPosition(node),
      cursor = new TrackedCursor(position);
    position.Dispose();
    try {
      expect(
        cursor.Find_Text(
          options(),
          false,
          backward ? SwDocPositions.End : SwDocPositions.Start,
          backward ? SwDocPositions.Start : SwDocPositions.End,
          [false],
          FindRanges.InSelAll,
        ),
      ).toBe(3);
      expect(cursor.created).toHaveLength(4);
      expect([...cursor.GetRingContainer()]).toEqual([
        cursor,
        cursor.created[2],
        cursor.created[3],
      ]);
      expect((cursor.created[0] as SwCursor).GetNext()).toBe(cursor.created[0]);
      expect((cursor.created[1] as SwCursor).GetNext()).toBe(cursor.created[1]);
      expect(
        [...cursor.GetRingContainer()].map(
          /** Reads the actual registered match start. @param member - Result member. @returns Content offset. */ (
            member,
          ) => member.Start().GetContentIndex(),
        ),
      ).toEqual(backward ? [4, 2, 0] : [0, 2, 4]);
    } finally {
      close(cursor);
    }
    expect(node.HasAnyContentIndex()).toBe(false);
  },
);
it("reads each original selection when visited instead of snapshotting the ring", /** Observes live sibling endpoints through a genuine generic strategy. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcde");
  const position = new SwPosition(node, 1),
    cursor = new SwCursor(position);
  position.Dispose();
  cursor.SetMark();
  cursor.GetMark().SetContent(0);
  const sibling = cursor.Create(cursor);
  sibling.GetPoint().SetContent(3);
  sibling.SetMark();
  sibling.GetMark().SetContent(2);
  const seen: number[][] = [];
  const strategy: SwFindParas = {
    /** Inspects live original selection bounds. @param target - Actual receiver. @param backward - Direction. @param region - Current region. @returns No match. */
    DoFind(target, backward, region) {
      expect(target).toBe(cursor);
      expect(backward).toBe(false);
      seen.push([region.Start().GetContentIndex(), region.End().GetContentIndex()]);
      if (seen.length === 1) {
        sibling.GetPoint().SetContent(5);
        sibling.GetMark().SetContent(4);
      }
      return 0;
    },
    /** Reports a query-only strategy. @returns False. */
    IsReplaceMode() {
      return false;
    },
  };
  try {
    expect(
      cursor.FindAll(
        strategy,
        SwDocPositions.Start,
        SwDocPositions.End,
        FindRanges.InSel | FindRanges.InSelAll,
        [false],
      ),
    ).toBe(0);
    expect(seen).toEqual([
      [0, 1],
      [4, 5],
    ]);
    expect(cursor.GetNext()).toBe(sibling);
  } finally {
    close(cursor);
  }
  expect(node.HasAnyContentIndex()).toBe(false);
});
it.each([false, true])(
  "rejects the empty all-search section before calling a strategy, backward=%s",
  /** Exercises original section admission in one direction. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0] as SwTextNode,
      position = new SwPosition(node),
      cursor = new SwCursor(position);
    position.Dispose();
    let calls = 0;
    const strategy: SwFindParas = {
      /** Detects an incorrectly admitted empty section. @returns No-ring result. */
      DoFind() {
        calls++;
        return FIND_NO_RING;
      },
      /** Reports a query-only strategy. @returns False. */
      /** Reports a query-only strategy. @returns False. */
      IsReplaceMode() {
        return false;
      },
    };
    try {
      expect(
        cursor.FindAll(
          strategy,
          backward ? SwDocPositions.End : SwDocPositions.Start,
          backward ? SwDocPositions.Start : SwDocPositions.End,
          FindRanges.InSelAll,
          [false],
        ),
      ).toBe(0);
      expect(calls).toBe(0);
      expect(cursor.GetRingContainer().size()).toBe(2);
      expect(cursor.HasMark()).toBe(false);
    } finally {
      close(cursor);
    }
    expect(node.HasAnyContentIndex()).toBe(false);
  },
);
it.each([false, true])(
  "continues other-area search from the existing interior point, backward=%s",
  /** Exercises original section admission in one direction. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const doc = new SwDoc(),
      nodes = doc.nodes,
      section = nodes.GetEndOfInserts().StartOfSectionNode();
    const extra = new SwTextNode(nodes, section, doc.GetDfltTextFormatColl(), "a a a");
    nodes.insertTextNodeAfter(section, extra);
    const position = new SwPosition(extra, 2),
      cursor = new SwCursor(position);
    position.Dispose();
    try {
      expect(
        cursor.Find_Text(
          options(),
          false,
          backward ? SwDocPositions.End : SwDocPositions.Start,
          backward ? SwDocPositions.Start : SwDocPositions.End,
          [false],
          FindRanges.InOther | FindRanges.InSelAll,
        ),
      ).toBe(backward ? 1 : 2);
      expect(
        [...cursor.GetRingContainer()].map(
          /** Reads the actual registered match start. @param member - Result member. @returns Content offset. */ (
            member,
          ) => member.Start().GetContentIndex(),
        ),
      ).toEqual(backward ? [0] : [2, 4]);
    } finally {
      close(cursor);
    }
    expect(extra.HasAnyContentIndex()).toBe(false);
  },
);

it("preserves native exception exit after the undo-discard threshold", /** The genuine generic strategy visits existing characters; base MaxReplaceArived supplies the native RET_YES response. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("x".repeat(60001));
  const position = new SwPosition(node),
    cursor = new SwCursor(position),
    undo = doc.GetUndoManager();
  position.Dispose();
  let current = 0;
  const failure = new Error("strategy exception after native threshold");
  const strategy: SwFindParas = {
    /** Visits the next actual model character, then throws after the threshold is reached. @param target - Actual search cursor. @returns Native no-ring result. */
    DoFind(target) {
      if (current === 60000) throw failure;
      target.GetPoint().Assign(node, current);
      target.SetMark();
      target.GetPoint().SetContent(++current);
      return FIND_NO_RING;
    },
    /** Enables the native undo-discard policy for this generic replacement strategy. @returns True. */
    IsReplaceMode() {
      return true;
    },
  };
  try {
    expect(undo.DoesUndo()).toBe(true);
    expect(
      /** Runs the original all-selection loop until the strategy throws. @returns Match count if completed. */ () =>
        cursor.FindAll(strategy, SwDocPositions.Start, SwDocPositions.End, FindRanges.InSelAll, [
          false,
        ]),
    ).toThrow(failure);
    expect(current).toBe(60000);
    expect(undo.DoesUndo()).toBe(false);
    expect(node.GetText()).toBe("x".repeat(60001));
  } finally {
    undo.DoUndo(true);
    close(cursor);
  }
  expect(node.HasAnyContentIndex()).toBe(false);
});
