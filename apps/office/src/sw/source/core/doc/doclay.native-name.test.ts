/** @fileoverview Actual native special-format name allocation and document mail-merge state; no replacement registry or name provider. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { DateTimeToOUString } from "../../../../tools/source/datetime/datetimeutils";
const documents: SwDoc[] = [];
afterEach(
  /** Releases real format/pool owners and restores the host clock. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
    vi.restoreAllMocks();
  },
);
/** Creates actual formats through the native document factory. @param names - Existing real fly names. @returns Actual document. */
function fixture(names: readonly string[] = []): SwDoc {
  const document = new SwDoc();
  documents.push(document);
  for (const name of names) document.MakeFlyFrameFormat(name, document.GetDfltFrameFormat());
  return document;
}
it.each([
  [[], "Frame1"],
  [["Frame1", "Frame3"], "Frame2"],
  [["Frame3", "Frame2", "Frame1"], "Frame4"],
  [["Frame1", "Frame1", "Frame3"], "Frame2"],
  [["frame1", "Other1", "Frame", "Frame0", "Frame-1"], "Frame1"],
  [["Frame01", "Frame+2", "Frame3tail", "Frame 4"], "Frame5"],
  [["Frame2147483647", "Frame3000000"], "Frame1"],
] as const)(
  "allocates the first source numeric hole from %j",
  /** Checks literal native conversion/order examples over actual formats. @param names - Existing names. @param expected - Original name. @returns Nothing. */ (
    names,
    expected,
  ) => {
    expect(fixture(names).GetUniqueFrameName()).toBe(expected);
  },
);
it("does not reserve a name, mutate the registry or publish changes when queried", /** Actual document notifier and registry remain unchanged. @returns Nothing. */ () => {
  const document = fixture(["Frame1"]),
    state = document.GetDocumentStateManager(),
    revision = state.GetModelRevision(),
    before = [...document.GetSpzFrameFormats()];
  expect(document.GetUniqueFrameName()).toBe("Frame2");
  expect(document.GetUniqueFrameName()).toBe("Frame2");
  expect([...document.GetSpzFrameFormats()]).toEqual(before);
  expect(state.GetModelRevision()).toBe(revision);
});
it("uses actual renamed and erased collection entries on the next allocation", /** Existing collection owns rename/membership. @returns Nothing. */ () => {
  const document = fixture(["Frame1", "Frame2"]),
    first = document.GetSpzFrameFormats().GetFormat(0);
  first.SetFormatName("Frame4");
  expect(document.GetUniqueFrameName()).toBe("Frame1");
  document.GetSpzFrameFormats().erase(first);
  first.DisposeModify();
  expect(document.GetUniqueFrameName()).toBe("Frame1");
});
it("retains the real false mail-merge default and silent assignment", /** Source inline setters do not manufacture modified state. @returns Nothing. */ () => {
  const document = fixture(),
    revision = document.GetDocumentStateManager().GetModelRevision();
  expect(document.IsInMailMerge()).toBe(false);
  document.SetInMailMerge(true);
  expect(document.IsInMailMerge()).toBe(true);
  document.SetInMailMerge(false);
  expect(document.IsInMailMerge()).toBe(false);
  expect(document.GetDocumentStateManager().GetModelRevision()).toBe(revision);
});
it("uses original mail-merge timestamp plus actual full special-format count without reserving it", /** Only the platform clock is fixed; DateTime/serializer/collection are actual owners. @returns Nothing. */ () => {
  vi.spyOn(globalThis.Date, "now").mockReturnValue(
    new globalThis.Date(2024, 5, 15, 7, 8, 9, 987).getTime(),
  );
  const document = fixture(["Frame1", "Other"]);
  document.SetInMailMerge(true);
  expect(DateTimeToOUString(new DateTime(DateTime.SYSTEM))).toBe("2024-06-15T07:08:09Z");
  expect(document.GetUniqueFrameName()).toBe("MailMergeFly2024-06-15T07:08:09Z3");
  expect(document.GetUniqueFrameName()).toBe("MailMergeFly2024-06-15T07:08:09Z3");
  document.MakeFlyFrameFormat("actual", document.GetDfltFrameFormat());
  expect(document.GetUniqueFrameName()).toBe("MailMergeFly2024-06-15T07:08:09Z4");
  document.SetInMailMerge(false);
  expect(document.GetUniqueFrameName()).toBe("Frame2");
});
