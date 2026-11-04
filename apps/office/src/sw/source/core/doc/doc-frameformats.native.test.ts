/** @fileoverview Actual document-owned ordinary/special frame tables, native default insertion and positional name lookup. No style-factory result provider is supplied. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc, SetNumRuleMode } from "./doc";
import { SetNumRuleMode as HeaderSetNumRuleMode } from "../../../inc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { FrameFormats } from "../../../inc/frameformats";
import { RES_FRMFMT, RES_FLYFRMFMT } from "../../../inc/hintids";
import { NameChanged } from "../../../inc/hints";
const documents: SwDoc[] = [];
afterEach(
  /** Releases actual owning document tables. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);
/** Creates actual document and registers its cleanup. @returns Actual document. */
function fixture(): SwDoc {
  const document = new SwDoc();
  documents.push(document);
  return document;
}
/** Registers an actual ordinary frame using the genuine constructor/collection contracts, without claiming the unported MakeFrameFormat factory. @param document - Actual owner. @param name - Native name. @returns Actual registered format. */
function ordinary(document: SwDoc, name: string): SwFrameFormat {
  const format = new SwFrameFormat(
    document.GetAttrPool(),
    name,
    undefined,
    document.GetDfltFrameFormat(),
  );
  document.GetFrameFormats().push_back(format);
  return format;
}
it.each([true, false] as const)(
  "registers the genuine default once for initial-text policy %s",
  /** Both actual construction modes retain source default membership. @param initial - Existing constructor flag. @returns Nothing. */ (
    initial,
  ) => {
    const document = new SwDoc(initial);
    documents.push(document);
    const formats = document.GetFrameFormats(),
      format = document.GetDfltFrameFormat();
    expect(formats).toBeInstanceOf(FrameFormats);
    expect(document.GetFrameFormats()).toBe(formats);
    expect(formats.GetFormatCount()).toBe(1);
    expect(formats.GetFormat(0)).toBe(format);
    expect(formats.ContainsFormat(format)).toBe(true);
    expect(format.m_ffList).toBe(formats);
    expect(format.Which()).toBe(RES_FRMFMT);
    expect(document.FindFrameFormatByName(format.GetName())).toBe(format);
    expect(format.GetAttrSet().GetPool()).toBe(document.GetAttrPool());
  },
);
it("keeps ordinary and special tables independent even when names collide", /** Source separate containers own actual registered identities. @returns Nothing. */ () => {
  const document = fixture(),
    format = ordinary(document, "Shared"),
    fly = document.MakeFlyFrameFormat("Shared", document.GetDfltFrameFormat());
  expect(fly.Which()).toBe(RES_FLYFRMFMT);
  expect(document.FindFrameFormatByName("Shared")).toBe(format);
  expect(document.GetSpzFrameFormats().FindFormatByName("Shared")).toBe(fly);
  expect(document.GetFrameFormats().IsAlive(fly)).toBe(false);
  expect(document.GetSpzFrameFormats().IsAlive(format)).toBe(false);
});
it("returns the first positional duplicate and advances after real erasure", /** Source SwDoc lookup uses SwFormatsBase insertion order, not composite name/pointer ordering. @returns Nothing. */ () => {
  const document = fixture(),
    first = ordinary(document, "Same"),
    second = ordinary(document, "Same");
  expect(document.FindFrameFormatByName("Same")).toBe(first);
  document.GetFrameFormats().erase(first);
  first.DisposeModify();
  expect(document.FindFrameFormatByName("Same")).toBe(second);
  expect(document.FindFrameFormatByName("Absent")).toBeUndefined();
});
it("respects native positional lookup after an ordered-default relocation", /** Native newDefault changes the actual positional list. @returns Nothing. */ () => {
  const document = fixture(),
    first = ordinary(document, "Same"),
    second = ordinary(document, "Same"),
    formats = document.GetFrameFormats();
  formats.newDefault(formats.find(second));
  expect(document.FindFrameFormatByName("Same")).toBe(second);
  formats.newDefault(formats.find(document.GetDfltFrameFormat()));
  expect([...formats]).toEqual([document.GetDfltFrameFormat(), second, first]);
  expect(document.FindFrameFormatByName("Same")).toBe(second);
});
it("routes registered ordinary and default renames through actual collection membership", /** Existing native registration supplies the correct old/new notifier and stable positions. @returns Nothing. */ () => {
  const document = fixture(),
    format = ordinary(document, "Old"),
    send = vi.spyOn(format.GetNotifier(), "Broadcast");
  format.SetFormatName("New", true);
  expect(send).toHaveBeenCalledExactlyOnceWith(new NameChanged("Old", "New"));
  expect(document.FindFrameFormatByName("Old")).toBeUndefined();
  expect(document.FindFrameFormatByName("New")).toBe(format);
  expect(document.GetFrameFormats().GetFormat(1)).toBe(format);
  document.GetDfltFrameFormat().SetFormatName("Renamed default");
  expect(document.FindFrameFormatByName("Renamed default")).toBe(document.GetDfltFrameFormat());
});
it("keeps row/box and page-frame formats outside the ordinary style collection", /** Actual construction paths preserve source collection boundaries. @returns Nothing. */ () => {
  const document = fixture(),
    row = document.MakeTableLineFormat(),
    box = document.MakeTableBoxFormat(),
    master = document.GetPageDesc().GetMaster();
  try {
    for (const format of [row, box, master]) {
      expect(document.GetFrameFormats().IsAlive(format)).toBe(false);
      expect(document.FindFrameFormatByName(format.GetName())).toBeUndefined();
    }
  } finally {
    row.DisposeModify();
    box.DisposeModify();
  }
});
it("keeps document tables and their defaults isolated", /** Actual distinct documents do not share registry/default owners. @returns Nothing. */ () => {
  const first = fixture(),
    second = fixture(),
    format = ordinary(first, "One");
  expect(first.GetFrameFormats()).not.toBe(second.GetFrameFormats());
  expect(first.GetDfltFrameFormat()).not.toBe(second.GetDfltFrameFormat());
  expect(second.GetFrameFormats().ContainsFormat(format)).toBe(false);
  expect(second.FindFrameFormatByName("One")).toBeUndefined();
});
it("keeps the native header enum identical through existing document imports", /** Source declaration move preserves actual runtime enum identity and numeric values. @returns Nothing. */ () => {
  expect(SetNumRuleMode).toBe(HeaderSetNumRuleMode);
  expect([
    SetNumRuleMode.Default,
    SetNumRuleMode.CreateNewList,
    SetNumRuleMode.DontSetItem,
    SetNumRuleMode.ResetIndentAttrs,
    SetNumRuleMode.DontSetIfAlreadyApplied,
  ]).toEqual([0, 1, 2, 4, 8]);
});
