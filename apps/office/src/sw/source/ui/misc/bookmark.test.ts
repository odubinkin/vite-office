/** @fileoverview Source bookmark temporary-name matching,token-count selection and localized proposal contracts. */
import { expect, it } from "vitest";
import {
  bookmarkModifyState as modify,
  bookmarkSelectionState as selection,
  bookmarkNameProposal,
  BOOKMARK_FORBIDDEN_CHARACTERS,
} from "./bookmark";
it("keeps typed token counts distinct from selected rows and preserves temporary-only sanitization", /** Pins actual source admission rather than general name cleanup. @returns Nothing. */ () => {
  expect(modify("", ["A"])).toMatchObject({
    selected: [],
    insert: false,
    remove: false,
    navigate: false,
    rename: false,
    forbidden: false,
  });
  expect(modify(" New ", ["New"])).toMatchObject({ insert: true, selected: [] });
  expect(modify("A", ["A"])).toMatchObject({
    selected: ["A"],
    insert: false,
    remove: true,
    navigate: true,
    rename: true,
  });
  expect(modify("A;A", ["A"])).toMatchObject({
    selected: ["A"],
    remove: true,
    navigate: false,
    rename: false,
  });
  for (const value of ["A;", ";A", "A;;B"])
    expect(modify(value, ["A", "B"])).toMatchObject({
      insert: false,
      remove: false,
      navigate: false,
    });
  expect(modify("A;B", ["A", "B"])).toMatchObject({ selected: ["A", "B"], remove: true });
  expect(modify("A/B", ["AB"])).toMatchObject({
    selected: ["AB"],
    forbidden: true,
    insert: false,
    remove: true,
    navigate: true,
    rename: true,
  });
  expect(modify(BOOKMARK_FORBIDDEN_CHARACTERS, [])).toMatchObject({
    forbidden: true,
    insert: false,
    selected: [],
  });
  expect(modify("A", ["A"], true)).toMatchObject({
    navigate: true,
    rename: false,
    remove: false,
    insert: false,
  });
  expect(modify("New", [], true).insert).toBe(false);
});
it("retains original row-event sensitivity and highest numbered name proposal", /** Empty row selection intentionally differs from empty typed input. @returns Nothing. */ () => {
  expect(selection([])).toMatchObject({
    insert: true,
    remove: false,
    navigate: false,
    rename: false,
  });
  expect(selection([], true).insert).toBe(false);
  expect(selection(["B", "A"])).toMatchObject({
    selected: ["B", "A"],
    insert: false,
    remove: true,
    navigate: false,
    rename: false,
  });
  expect(selection(["A"])).toMatchObject({ navigate: true, rename: true, remove: true });
  expect(selection(["A"], true)).toMatchObject({ navigate: true, rename: false, remove: false });
  expect(bookmarkNameProposal([], "Bookmark")).toBe("Bookmark 1");
  expect(
    bookmarkNameProposal(["Bookmark", "Bookmark 7", "Bookmark 2 trailing", "Other 99"], "Bookmark"),
  ).toBe("Bookmark 8");
  expect(bookmarkNameProposal(["Signet 3", "Signet -2"], "Signet")).toBe("Signet 4");
});
