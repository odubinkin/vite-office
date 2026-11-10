/** @fileoverview Native first-page sharing and actual frame-item admission for RTF first/follow sections. */
import { afterEach, expect, it } from "vitest";
import { SwDoc, createWriterDocument } from "../../core/doc/doc";
import { SwPageDesc, UseOnPage } from "../../core/layout/pagedesc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfExport } from "./rtfexport";
const docs: SwDoc[] = [];
afterEach(
  /** Releases native owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Creates a document with a later first/follow chain using real native page descriptors. @returns Actual owners. */
function chain(): { doc: SwDoc; first: SwPageDesc; follow: SwPageDesc } {
  const doc = createWriterDocument();
  docs.push(doc);
  doc.paragraphs[0]?.SetText("Before");
  const first = doc.MakePageDesc("First", doc.GetPageDesc());
  const follow = doc.MakePageDesc("Follow", doc.GetPageDesc());
  // Native MakePageDesc preserves the copied source follow; this fixture needs
  // the terminal self-follow required by wrtw8sty.cxx single-section admission.
  follow.SetFollow(null);
  first.SetFollow(follow);
  doc.nodes.MakeTextNode("After").SetAttr(new SwFormatPageDesc("First"));
  return { doc, first, follow };
}
/** Reads only the later native section output. @param doc - Actual source. @returns RTF fragment. */
function later(doc: SwDoc): string {
  const rtf = new TextDecoder().decode(RtfExport.WriteDocument(doc));
  const index = rtf.indexOf(String.raw`\sect\sectd`);
  expect(index).toBeGreaterThanOrEqual(0);
  return rtf.slice(index);
}
it("preserves sharing bits independently of side usage and native copy construction", /** Exercises the actual source flags and source copy, not another boolean owner. @returns Nothing. */ () => {
  const { first } = chain();
  expect(first.IsFirstShared()).toBe(true);
  first.SetUseOn(UseOnPage.Left);
  const original = first.ReadUseOn();
  first.ChgFirstShare(false);
  expect(first.ReadUseOn()).toBe(original & UseOnPage.NoFirstShare);
  expect(first.GetUseOn()).toBe(UseOnPage.Left);
  const copied = new SwPageDesc(first);
  try {
    expect(copied.IsFirstShared()).toBe(false);
    first.ChgFirstShare(true);
    expect(first.ReadUseOn()).toBe(original);
    expect(copied.IsFirstShared()).toBe(false);
  } finally {
    copied.DisposeModify();
  }
});
it.each([true, false])(
  "uses the initial self-follow page's sharing flag: %s",
  /** Original OutPageDescription emits TITLEPG for !IsFirstShared without requiring a follow chain. @param shared - Native sharing flag. @returns Nothing. */ (
    shared,
  ) => {
    const doc = createWriterDocument();
    docs.push(doc);
    doc.paragraphs[0]?.SetText("Body");
    doc.GetPageDesc().ChgFirstShare(shared);
    expect(
      new TextDecoder().decode(RtfExport.WriteDocument(doc)).includes(String.raw`\titlepg`),
    ).toBe(!shared);
  },
);
it("emits a later unshared first page even without a combined follow chain", /** Shared section writer initializes titlePage from the original descriptor. @returns Nothing. */ () => {
  const { doc, first } = chain();
  first.SetFollow(null);
  first.ChgFirstShare(false);
  expect(later(doc)).toContain(String.raw`\titlepg`);
});
it("compares FirstMaster rather than the browser master projection", /** Original shared section admission selects GetFirstMaster. @returns Nothing. */ () => {
  const { doc, first } = chain();
  const size = first.GetFirstMaster().GetFrameSize().Clone();
  size.SetWidth(size.GetWidth() + 500);
  first.GetFirstMaster().SetFormatAttr(size);
  expect(later(doc)).not.toContain(String.raw`\titlepg`);
});
it("combines matching first/follow frames despite a different ordinary master", /** Native first format can differ from the ordinary master. @returns Nothing. */ () => {
  const { doc, first, follow } = chain();
  const size = first.GetMaster().GetFrameSize().Clone();
  size.SetWidth(size.GetWidth() + 500);
  first.GetMaster().SetFormatAttr(size);
  const rtf = later(doc);
  expect(rtf).toContain(String.raw`\titlepg`);
  expect(rtf).toContain(`\\pgwsxn${follow.GetValue().width}`);
  expect(rtf).not.toContain(`\\pgwsxn${first.GetValue().width}`);
});
it.each([UseOnPage.Left, UseOnPage.Right])(
  "does not combine a chain restricted to page side %s",
  /** Original section admission requires both side bits. @param side - Source usage flags. @returns Nothing. */ (
    side,
  ) => {
    const { doc, first } = chain();
    first.SetUseOn(side);
    expect(later(doc)).not.toContain(String.raw`\titlepg`);
  },
);
it("compares complete frame size items even when physical dimensions match", /** Native frame-size equality includes size modes. @returns Nothing. */ () => {
  const { doc, first } = chain();
  const size = first.GetFirstMaster().GetFrameSize().Clone();
  size.SetHeightSizeType(SwFrameSize.Minimum);
  first.GetFirstMaster().SetFormatAttr(size);
  expect(later(doc)).not.toContain(String.raw`\titlepg`);
});
it("includes side box padding when admitting a single section", /** Native lcl_getWordLRSpace incorporates box distances. @returns Nothing. */ () => {
  const { doc, first } = chain();
  const box = first.GetFirstMaster().GetBox().Clone();
  box.SetDistance(100, SvxBoxItemLine.LEFT);
  first.GetFirstMaster().SetFormatAttr(box);
  expect(later(doc)).not.toContain(String.raw`\titlepg`);
});
it("combines different raw margins when their native effective Word margins match", /** Padding plus LR item is compared as the original native value. @returns Nothing. */ () => {
  const { doc, first } = chain();
  const frame = first.GetFirstMaster();
  const box = frame.GetBox().Clone();
  box.SetDistance(100, SvxBoxItemLine.LEFT);
  frame.SetFormatAttr(box);
  const lr = frame.GetLRSpace().Clone();
  lr.SetLeft(SvxIndentValue.twips(lr.ResolveLeft() - 100));
  frame.SetFormatAttr(lr);
  expect(later(doc)).toContain(String.raw`\titlepg`);
});
it("includes top box padding even when no border line exists", /** Original no-header distance glue calls CalcLineSpace with evenIfNoLine=true. @returns Nothing. */ () => {
  const { doc, first } = chain();
  const box = first.GetFirstMaster().GetBox().Clone();
  box.SetDistance(100, SvxBoxItemLine.TOP);
  first.GetFirstMaster().SetFormatAttr(box);
  expect(later(doc)).not.toContain(String.raw`\titlepg`);
});
it("preserves the native no-header import loss of a title-page sharing flag", /** Native UNO FirstIsShared setter has no target header/footer set in this profile. @returns Nothing. */ () => {
  const source = createWriterDocument();
  docs.push(source);
  source.paragraphs[0]?.SetText("Body");
  source.GetPageDesc().ChgFirstShare(false);
  const bytes = RtfExport.WriteDocument(source);
  expect(new TextDecoder().decode(bytes)).toContain(String.raw`\titlepg`);
  const imported = new RtfDocumentImpl().ResolveBytes(bytes);
  docs.push(imported);
  expect(imported.GetPageDesc().IsFirstShared()).toBe(true);
  expect(new TextDecoder().decode(RtfExport.WriteDocument(imported))).not.toContain(
    String.raw`\titlepg`,
  );
});
