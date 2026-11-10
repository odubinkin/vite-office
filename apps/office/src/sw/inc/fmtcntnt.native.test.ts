/** @fileoverview Native content-item optional node-index state, static defaults, nonshareable pooling and genuine format destruction. */
import { assert, expect, it, vi } from "vitest";
import { SwFormatContent } from "./fmtcntnt";
import { RES_CNTNT } from "./hintids";
import { SwDoc } from "../source/core/doc/doc";
import { SwNodeIndex } from "../source/core/crsr/pam";
import { SwStartNodeType } from "./ndtyp";
import { SwFrameFormat } from "../source/core/layout/atrfrm";
import { SfxItemSet } from "../../svl/source/items/itemset";
/** Creates only a real structural fly-tagged section; no fly format/layout is implied. @param doc - Actual document. @returns Connected native section. */
function section(doc: SwDoc) {
  return doc
    .GetNodes()
    .MakeTextSection(
      doc.GetNodes().GetEndOfAutotext(),
      SwStartNodeType.SwFlyStartNode,
      doc.GetDfltTextFormatColl(),
    );
}
it("owns the native null nonshareable RES_CNTNT105 static default", /** Actual pool/default frame getters use the module-global item. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = new SwFormatContent();
  try {
    expect(RES_CNTNT).toBe(105);
    expect(item.Which()).toBe(105);
    expect(item.isShareable()).toBe(false);
    expect(item.GetContentIdx()).toBeNull();
    const pooled = doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_CNTNT);
    expect(pooled).toBeInstanceOf(SwFormatContent);
    expect(doc.GetDfltFrameFormat().GetContent()).toBe(pooled);
    expect(doc.GetDfltFrameFormat().GetAttrSet().GetContent()).toBe(pooled);
    expect((pooled as SwFormatContent).GetContentIdx()).toBeNull();
  } finally {
    item.Dispose();
    doc.Dispose();
  }
});
it("regular/copy/clone own independent registered indices without owning the section", /** Actual copied node identities match while index objects differ. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = section(doc),
    item = new SwFormatContent(start),
    copy = new SwFormatContent(item),
    clone = item.Clone();
  try {
    expect(item.GetContentIdx()?.GetNode()).toBe(start);
    expect(copy.GetContentIdx()?.GetNode()).toBe(start);
    expect(clone.GetContentIdx()?.GetNode()).toBe(start);
    expect(copy.GetContentIdx()).not.toBe(item.GetContentIdx());
    expect(clone.GetContentIdx()).not.toBe(item.GetContentIdx());
    expect(copy.equals(item)).toBe(true);
    expect(clone.equals(item)).toBe(true);
    expect(clone.isShareable()).toBe(false);
    copy.SetNewContentIdx(null);
    expect(copy.equals(item)).toBe(false);
    expect(item.GetContentIdx()?.GetNode()).toBe(start);
  } finally {
    clone.Dispose();
    copy.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("null optional values clone and compare without registering an index", /** Empty native optionals remain empty. @returns Nothing. */ () => {
  const item = new SwFormatContent(),
    copy = item.Clone();
  try {
    expect(copy.equals(item)).toBe(true);
    expect(copy.GetContentIdx()).toBeNull();
  } finally {
    copy.Dispose();
    item.Dispose();
  }
});
it("compares actual node identity across documents rather than array offsets", /** Equal offsets in different real node arrays are distinct. @returns Nothing. */ () => {
  const first = new SwDoc(),
    second = new SwDoc(),
    a = new SwFormatContent(section(first)),
    b = new SwFormatContent(section(second));
  try {
    expect(a.GetContentIdx()?.GetIndex()).toBe(b.GetContentIdx()?.GetIndex());
    expect(a.equals(b)).toBe(false);
  } finally {
    a.Dispose();
    b.Dispose();
    first.Dispose();
    second.Dispose();
  }
});
it("engaged optional assignment reuses its index and borrows no input index owner", /** Original optional assignment calls actual SwNodeIndex::Assign. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    a = section(doc),
    b = section(doc),
    item = new SwFormatContent(a),
    input = new SwNodeIndex(b),
    owned = item.GetContentIdx();
  assert(owned);
  const assign = vi.spyOn(owned, "Assign"),
    dispose = vi.spyOn(owned, "Dispose");
  try {
    item.SetNewContentIdx(input);
    expect(item.GetContentIdx()).toBe(owned);
    expect(owned.GetNode()).toBe(b);
    expect(assign).toHaveBeenCalledExactlyOnceWith(input);
    expect(dispose).not.toHaveBeenCalled();
    input.Assign(a);
    expect(owned.GetNode()).toBe(b);
    item.SetNewContentIdx(owned);
    expect(item.GetContentIdx()).toBe(owned);
  } finally {
    assign.mockRestore();
    dispose.mockRestore();
    input.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("absent assignment constructs a fresh index and null reset destroys only that index", /** Section nodes survive source item reset. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = section(doc),
    input = new SwNodeIndex(start),
    item = new SwFormatContent();
  item.SetNewContentIdx(input);
  const owned = item.GetContentIdx();
  assert(owned);
  const dispose = vi.spyOn(owned, "Dispose");
  try {
    expect(owned).not.toBe(input);
    item.SetNewContentIdx(null);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(item.GetContentIdx()).toBeNull();
    expect(doc.GetNodes().at(start.GetIndex())).toBe(start);
    expect(input.GetNode()).toBe(start);
  } finally {
    dispose.mockRestore();
    input.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("SetNewContentIdx retains the source generic node-index contract without normalizing to section starts", /** Actual source accepts a node index even when its node is ordinary text. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const input = new SwNodeIndex(node),
    item = new SwFormatContent();
  try {
    item.SetNewContentIdx(input);
    expect(item.GetContentIdx()?.GetNode()).toBe(node);
  } finally {
    item.Dispose();
    input.Dispose();
    doc.Dispose();
  }
});
it("actual node removal corrects each owned index to the surviving successor", /** Native node-index correction is consumed rather than serialized section indices. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = section(doc),
    item = new SwFormatContent(start),
    copy = item.Clone(),
    index = start.GetIndex(),
    successor = doc.GetNodes().GetEndOfAutotext();
  try {
    doc.GetNodes().RemoveNode(index, 3, true);
    expect(item.GetContentIdx()?.GetNode()).toBe(successor);
    expect(copy.GetContentIdx()?.GetNode()).toBe(successor);
    expect(copy.equals(item)).toBe(true);
  } finally {
    copy.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("nonshareable pool leases clone complete native indices independently", /** Actual item sets own distinct instances while the source remains separate. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = section(doc),
    item = new SwFormatContent(start),
    a = new SfxItemSet(doc.GetAttrPool(), [[RES_CNTNT, RES_CNTNT]]),
    b = new SfxItemSet(doc.GetAttrPool(), [[RES_CNTNT, RES_CNTNT]]);
  try {
    a.Put(item);
    b.Put(item);
    const first = a.Get(RES_CNTNT) as SwFormatContent,
      second = b.Get(RES_CNTNT) as SwFormatContent;
    expect(first).not.toBe(second);
    expect(first).not.toBe(item);
    expect(first.GetContentIdx()).not.toBe(second.GetContentIdx());
    expect(first.equals(second)).toBe(true);
  } finally {
    a.Dispose();
    b.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("actual format member destruction releases its content-index owner", /** A call-through spy observes owned destruction; no access to a destroyed format is needed. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    start = section(doc),
    item = new SwFormatContent(start),
    format = new SwFrameFormat(doc.GetAttrPool(), "Content");
  format.SetFormatAttr(item);
  item.Dispose();
  const owned = format.GetContent().GetContentIdx();
  assert(owned);
  const dispose = vi.spyOn(owned, "Dispose");
  format.DisposeModify();
  expect(dispose).toHaveBeenCalledTimes(1);
  dispose.mockRestore();
  doc.Dispose();
});
