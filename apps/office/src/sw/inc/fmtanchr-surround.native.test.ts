/** @fileoverview Native anchor position/type/page/order ownership and surround bit/default/pool contracts required for actual HTML floating-table context. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../source/core/doc/doc";
import { SwPosition } from "../source/core/crsr/pam";
import { SwStartNode, SwTableNode } from "../source/core/docnode/node";
import { SwStartNodeType } from "./ndtyp";
import { SwFormatAnchor } from "./fmtanchr";
import { SwFormatSurround } from "./fmtsrnd";
import { RndStdIds as R } from "../../svx/inc/swframetypes";
import { TextContentAnchorType as A } from "../../offapi/com/sun/star/text/TextContentAnchorType";
import { WrapTextMode as W } from "../../offapi/com/sun/star/text/WrapTextMode";
import { RES_ANCHOR, RES_SURROUND } from "./hintids";
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import { SwFrameFormat } from "../source/core/layout/atrfrm";
import { SfxItemSet } from "../../svl/source/items/itemset";
/** Owns actual native body and its independent input position. @returns Actual fixture. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const position = new SwPosition(node, 2, "anchor", "before");
  return {
    doc,
    node,
    position,
    /** Releases borrowed input positions before the model. @returns Nothing. */ close() {
      position.Dispose();
      doc.Dispose();
    },
  };
}
it("keeps the five native rendezvous values identical to generated text anchor ordinals", /** Checks the pinned cross-header ABI identities, not a fabricated enum provider. @returns Nothing. */ () => {
  expect([R.FLY_AT_PARA, R.FLY_AS_CHAR, R.FLY_AT_PAGE, R.FLY_AT_FLY, R.FLY_AT_CHAR]).toEqual([
    A.AT_PARAGRAPH,
    A.AS_CHARACTER,
    A.AT_PAGE,
    A.AT_FRAME,
    A.AT_CHARACTER,
  ]);
  expect([R.UNKNOWN, R.HEADER, R.FOOTER, R.HEADERL, R.HEADERR, R.DRAW_OBJECT]).toEqual([
    -1, 5, 6, 7, 8, 9,
  ]);
});
it("starts with original PAGE/zero/null/nonshareable anchor and PARALLEL/false wrap defaults", /** Reads real item and pool defaults. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(),
    wrap = new SwFormatSurround();
  expect(anchor.Which()).toBe(114);
  expect(wrap.Which()).toBe(111);
  expect(anchor.isShareable()).toBe(false);
  expect([
    anchor.GetAnchorId(),
    anchor.GetPageNum(),
    anchor.GetAnchorNode(),
    anchor.GetContentAnchor(),
    anchor.GetAnchorContentOffset(),
  ]).toEqual([R.FLY_AT_PAGE, 0, null, null, 0]);
  expect([wrap.GetSurround(), wrap.IsAnchorOnly(), wrap.IsContour(), wrap.IsOutside()]).toEqual([
    W.PARALLEL,
    false,
    false,
    false,
  ]);
  expect(x.doc.GetDfltFrameFormat().GetAnchor()).toBe(
    x.doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_ANCHOR),
  );
  expect(x.doc.GetDfltFrameFormat().GetSurround()).toBe(
    x.doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_SURROUND),
  );
  anchor.Dispose();
  wrap.Dispose();
  x.close();
});
it.each([R.FLY_AT_CHAR, R.FLY_AS_CHAR])(
  "owns an independent registered content position for type %s",
  /** Original character anchors keep actual content ownership and offset. @param type - Native anchor ID. @returns Nothing. */ (
    type,
  ) => {
    const x = fixture(),
      anchor = new SwFormatAnchor(type);
    anchor.SetAnchor(x.position);
    const own = anchor.GetContentAnchor();
    assert(own);
    expect(own).not.toBe(x.position);
    expect(own.nContent.GetContentNode()).toBe(x.node);
    expect(anchor.GetAnchorNode()).toBe(x.node);
    expect(anchor.GetAnchorContentNode()).toBe(x.node);
    expect(anchor.GetAnchorContentOffset()).toBe(2);
    x.position.SetContent(1);
    expect(anchor.GetAnchorContentOffset()).toBe(2);
    anchor.Dispose();
    x.close();
  },
);
it("detaches paragraph content indices while retaining their actual node", /** Native paragraph anchors are node-bound and remain at offset zero. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_PARA);
  anchor.SetAnchor(x.position);
  const own = anchor.GetContentAnchor();
  assert(own);
  expect(own.nContent.GetContentNode()).toBeUndefined();
  expect(anchor.GetAnchorNode()).toBe(x.node);
  expect(anchor.GetAnchorContentNode()).toBe(x.node);
  expect(anchor.GetAnchorContentOffset()).toBe(0);
  const copy = anchor.Clone(),
    copied = copy.GetContentAnchor();
  assert(copied);
  expect(copied.nContent.GetContentNode()).toBeUndefined();
  expect(copied.GetNode()).toBe(x.node);
  expect(SfxPoolItem.areSame(anchor, copy)).toBe(true);
  copy.Dispose();
  anchor.Dispose();
  x.close();
});
it("copies raw node-only positions without reattaching their content index", /** Actual native copy form must retain the independent nNode/nContent state and logical owner category. @returns Nothing. */ () => {
  const x = fixture();
  x.position.nContent.Assign(undefined, 0);
  const copy = new SwPosition(x.position),
    clone = x.position.clone();
  expect(copy.GetNode()).toBe(x.node);
  expect(copy.nContent.GetContentNode()).toBeUndefined();
  expect(copy.nContent.GetOwnerKind()).toBe("anchor");
  expect(copy.nContent.GetAffinity()).toBe("before");
  expect(clone.nContent.GetContentNode()).toBeUndefined();
  clone.Dispose();
  copy.Dispose();
  x.close();
});
it("retains source fly-start and paragraph-table anchor admission", /** Actual structural sections and table nodes are native permitted anchors. @returns Nothing. */ () => {
  const x = fixture(),
    fly = x.doc.nodes.MakeTextSection(
      x.doc.nodes.GetEndOfInserts(),
      SwStartNodeType.SwFlyStartNode,
      x.doc.GetDfltTextFormatColl(),
    );
  expect(fly).toBeInstanceOf(SwStartNode);
  const pos = new SwPosition(fly),
    anchor = new SwFormatAnchor(R.FLY_AT_FLY);
  anchor.SetAnchor(pos);
  expect(anchor.GetAnchorNode()).toBe(fly);
  expect(anchor.GetAnchorContentNode()).toBeNull();
  const table = x.doc.nodes.MakeTableNode("anchor table"),
    tableNode = table.GetTableNode(),
    tablePos = new SwPosition(tableNode),
    para = new SwFormatAnchor(R.FLY_AT_PARA);
  expect(tableNode).toBeInstanceOf(SwTableNode);
  para.SetAnchor(tablePos);
  expect(para.GetAnchorNode()).toBe(tableNode);
  para.Dispose();
  tablePos.Dispose();
  anchor.Dispose();
  pos.Dispose();
  x.close();
});
it("copies with a new order but excludes that order from native equality", /** Real constructors and clones retain independent positions. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  anchor.SetAnchor(x.position);
  const copy = anchor.Clone();
  expect((copy.GetOrder() - anchor.GetOrder()) >>> 0).toBe(1);
  expect(copy.GetContentAnchor()).not.toBe(anchor.GetContentAnchor());
  expect(SfxPoolItem.areSame(copy, anchor)).toBe(true);
  const order = copy.GetOrder();
  copy.Assign(anchor);
  expect(copy.GetOrder()).toBe(order);
  anchor.SetPageNum(7);
  copy.Assign(anchor);
  expect(copy.GetOrder()).not.toBe(order);
  expect(copy.GetPageNum()).toBe(7);
  copy.Dispose();
  anchor.Dispose();
  x.close();
});
it("does not normalize a stored position through raw type/page setters", /** Original raw setters differ from the separate UNO conversion paths. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  anchor.SetAnchor(x.position);
  const own = anchor.GetContentAnchor();
  anchor.SetType(R.FLY_AT_PAGE);
  anchor.SetPageNum(65537);
  expect(anchor.GetPageNum()).toBe(1);
  expect(anchor.GetContentAnchor()).toBe(own);
  expect(anchor.GetAnchorContentOffset()).toBe(2);
  anchor.SetAnchor(null);
  expect(anchor.GetAnchorNode()).toBeNull();
  expect(anchor.GetAnchorContentOffset()).toBe(0);
  anchor.Dispose();
  x.close();
});
it("releases the old owned position on replacement and the current one on destruction", /** Call-through spies observe actual owner release without reading disposed positions. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  anchor.SetAnchor(x.position);
  const first = anchor.GetContentAnchor();
  assert(first);
  const release = vi.spyOn(first, "Dispose");
  anchor.SetAnchor(x.position);
  expect(release).toHaveBeenCalledOnce();
  const last = anchor.GetContentAnchor();
  assert(last);
  const lastRelease = vi.spyOn(last, "Dispose");
  anchor.Dispose();
  expect(lastRelease).toHaveBeenCalledOnce();
  x.close();
});
it("keeps anchor pooling nonshareable and wrap bit state independent", /** Real sets exercise native clone/lease ownership, not a value snapshot stand-in. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR),
    a = new SfxItemSet(x.doc.GetAttrPool(), [[RES_ANCHOR, RES_ANCHOR]]),
    b = new SfxItemSet(x.doc.GetAttrPool(), [[RES_ANCHOR, RES_ANCHOR]]);
  anchor.SetAnchor(x.position);
  a.Put(anchor);
  b.Put(anchor);
  const first = a.Get(RES_ANCHOR),
    second = b.Get(RES_ANCHOR);
  expect(first).toBeInstanceOf(SwFormatAnchor);
  expect(second).toBeInstanceOf(SwFormatAnchor);
  expect(first).not.toBe(second);
  expect(first).not.toBe(anchor);
  expect(SfxPoolItem.areSame(first, second)).toBe(true);
  a.Dispose();
  b.Dispose();
  anchor.Dispose();
  x.close();
});
it("retains independent wrap modes/flags and complete clone equality", /** Contour/outside/anchor-only are not inferred from wrap mode or reduced to the enum payload. @returns Nothing. */ () => {
  const wrap = new SwFormatSurround(W.THROUGH);
  wrap.SetAnchorOnly(true);
  wrap.SetContour(true);
  wrap.SetOutside(true);
  const copy = wrap.Clone();
  expect(copy.equals(wrap)).toBe(true);
  copy.SetContour(false);
  expect(copy.equals(wrap)).toBe(false);
  expect([wrap.GetSurround(), wrap.IsAnchorOnly(), wrap.IsContour(), wrap.IsOutside()]).toEqual([
    W.THROUGH,
    true,
    true,
    true,
  ]);
  copy.SetContour(true);
  copy.SetOutside(false);
  expect(copy.equals(wrap)).toBe(false);
  copy.SetOutside(true);
  copy.SetAnchorOnly(false);
  expect(copy.equals(wrap)).toBe(false);
  copy.Dispose();
  wrap.Dispose();
});
it("resolves authored typed anchor/wrap items through actual frame inheritance", /** Original frame getters borrow effective values from a real parent frame format. @returns Nothing. */ () => {
  const x = fixture(),
    parent = new SwFrameFormat(x.doc.GetAttrPool(), "parent"),
    child = new SwFrameFormat(x.doc.GetAttrPool(), "child", undefined, parent),
    anchor = new SwFormatAnchor(R.FLY_AT_PARA),
    wrap = new SwFormatSurround(W.NONE);
  anchor.SetAnchor(x.position);
  wrap.SetOutside(true);
  parent.SetFormatAttr(anchor);
  parent.SetFormatAttr(wrap);
  expect(child.GetAnchor().GetAnchorNode()).toBe(x.node);
  expect(child.GetAnchor().GetAnchorId()).toBe(R.FLY_AT_PARA);
  expect(child.GetSurround().GetSurround()).toBe(W.NONE);
  expect(child.GetSurround().IsOutside()).toBe(true);
  child.DisposeModify();
  parent.DisposeModify();
  anchor.Dispose();
  wrap.Dispose();
  x.close();
});
it("retains native constructor and anchor-position preconditions", /** Invalid typed anchor states are rejected instead of fabricating a text owner. @returns Nothing. */ () => {
  expect(
    /** Calls invalid native ID construction. @returns Item. */ () => new SwFormatAnchor(R.UNKNOWN),
  ).toThrow("valid native anchor type");
  expect(
    /** Calls invalid nonpage construction. @returns Item. */ () =>
      new SwFormatAnchor(R.FLY_AT_PARA, 1),
  ).toThrow("only page anchors");
  const x = fixture(),
    point = new SwPosition(x.doc.nodes.GetEndOfContent()),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  expect(
    /** Supplies an invalid real structural position. @returns Nothing. */ () =>
      anchor.SetAnchor(point),
  ).toThrow("requires native text/table/fly start");
  anchor.Dispose();
  point.Dispose();
  x.close();
});

it("releases the real frame-owned anchor position through native format member destruction", /** SwFormat member item-set destruction must occur after dependent reparenting and before base modify teardown. @returns Nothing. */ () => {
  const x = fixture(),
    format = new SwFrameFormat(x.doc.GetAttrPool(), "owned anchor"),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  anchor.SetAnchor(x.position);
  format.SetFormatAttr(anchor);
  const stored = format.GetAnchor().GetContentAnchor();
  assert(stored);
  const released = vi.spyOn(stored, "Dispose");
  format.DisposeModify();
  expect(released).toHaveBeenCalledOnce();
  expect(anchor.GetAnchorNode()).toBe(x.node);
  anchor.Dispose();
  x.close();
});

it("copy-assigns an engaged optional anchor position in place, preserving raw null binding", /** Original optional copy assignment reuses the live contained position instead of destroying/replacing it. @returns Nothing. */ () => {
  const x = fixture(),
    para = new SwFormatAnchor(R.FLY_AT_PARA),
    character = new SwFormatAnchor(R.FLY_AT_CHAR);
  para.SetAnchor(x.position);
  character.SetAnchor(x.position);
  const own = character.GetContentAnchor();
  assert(own);
  const released = vi.spyOn(own, "Dispose");
  character.Assign(para);
  expect(character.GetContentAnchor()).toBe(own);
  expect(own.nContent.GetContentNode()).toBeUndefined();
  expect(character.GetAnchorId()).toBe(R.FLY_AT_PARA);
  expect(released).not.toHaveBeenCalled();
  character.Dispose();
  expect(released).toHaveBeenCalledOnce();
  para.Dispose();
  x.close();
});
it("destroys the previous optional position before constructing its replacement", /** Original SetAnchor emplace order is preserved for valid distinct input positions; self-alias native behavior is not certified. @returns Nothing. */ () => {
  const x = fixture(),
    anchor = new SwFormatAnchor(R.FLY_AT_CHAR);
  anchor.SetAnchor(x.position);
  const own = anchor.GetContentAnchor();
  assert(own);
  const released = vi.spyOn(own, "Dispose"),
    constructed = vi.spyOn(x.position, "clone");
  anchor.SetAnchor(x.position);
  expect(released.mock.invocationCallOrder[0]).toBeLessThan(
    constructed.mock.invocationCallOrder[0] as number,
  );
  anchor.Dispose();
  x.close();
});
