/** @fileoverview Native legacy HTML frame-anchor/alignment producer over real parser positions, pooled frame items and actual document special formats. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { HTMLAttrContext } from "./htmlctxt";
import { HtmlTokenId } from "../../../../svtools/inc/htmltokn";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as Rel } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { RndStdIds as R } from "../../../../svx/inc/swframetypes";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { ResetFrameFormatAttrs } from "../basflt/shellio";
import * as IDs from "../../../inc/hintids";
/** Actual parser and frame-set owners, with optional genuine structural cursor. @param text - Body text. @param offset - Native content position. @param structural - Use actual body start. @returns Native owners. */
function fixture(text = "", offset = 0, structural = false) {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText(text);
  const original = new SwPosition(
      structural ? doc.GetNodes().GetEndOfContent().StartOfSectionNode() : node,
      offset,
    ),
    pam = new SwPaM(original);
  original.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8)),
    items = new SfxItemSet(doc.GetAttrPool(), [[IDs.RES_FRMATR_BEGIN, IDs.RES_FRMATR_END - 1]]);
  return {
    doc,
    node,
    pam,
    parser,
    items,
    /** Releases copied anchor positions before parser/cursor/document owners. @returns Nothing. */
    close() {
      items.Dispose();
      parser.SourceDispose();
      pam.Dispose();
      doc.Dispose();
    },
  };
}
/** Registers an actual native paragraph-anchored format at the current body node. @param x - Actual owner. @param wrap - Actual wrap mode. @returns Nothing. */
function existingFly(x: ReturnType<typeof fixture>, wrap: W): void {
  const format = x.doc.MakeFlyFrameFormat("Existing", x.doc.GetDfltFrameFormat()),
    anchor = new SwFormatAnchor(R.FLY_AT_PARA);
  anchor.SetAnchor(x.pam.GetPoint());
  try {
    format.SetFormatAttr(anchor);
    format.SetFormatAttr(new SwFormatSurround(wrap));
  } finally {
    anchor.Dispose();
  }
}
/** Reads actual complete produced frame items. @param x - Actual owner. @returns Native values. */
function produced(x: ReturnType<typeof fixture>) {
  return {
    anchor: x.items.Get(IDs.RES_ANCHOR) as SwFormatAnchor,
    vertical: x.items.Get(IDs.RES_VERT_ORIENT) as SwFormatVertOrient,
    horizontal: x.items.Get(IDs.RES_HORI_ORIENT) as SwFormatHoriOrient,
    wrap: x.items.Get(IDs.RES_SURROUND) as SwFormatSurround,
  };
}
it("NONE horizontal retains requested inline vertical orientation and actual content anchor", /** Original inline path writes no horizontal/wrap override. @returns Nothing. */ () => {
  const x = fixture("abcd", 2);
  try {
    x.parser.SetAnchorAndAdjustment(V.CENTER, H.NONE, x.items);
    const values = produced(x);
    expect(values.anchor.GetAnchorId()).toBe(R.FLY_AS_CHAR);
    expect(values.anchor.GetAnchorNode()).toBe(x.node);
    expect(values.anchor.GetAnchorContentOffset()).toBe(2);
    expect([values.vertical.GetVertOrient(), values.vertical.GetRelationOrient()]).toEqual([
      V.CENTER,
      Rel.FRAME,
    ]);
    expect(x.items.GetItemIfSet(IDs.RES_HORI_ORIENT, false)).toBeUndefined();
    expect(x.items.GetItemIfSet(IDs.RES_SURROUND, false)).toBeUndefined();
    expect(x.pam.GetPoint().GetContentIndex()).toBe(2);
  } finally {
    x.close();
  }
});
it.each([
  [H.LEFT, W.RIGHT],
  [H.RIGHT, W.LEFT],
  [H.CENTER, W.NONE],
  [H.FULL, W.PARALLEL],
])(
  "empty paragraph horizontal %s produces source wrap %s",
  /** Source orientation overrides the input vertical for paragraph anchoring. @param horizontal - Actual ID. @param wrap - Original wrap mapping. @returns Nothing. */ (
    horizontal,
    wrap,
  ) => {
    const x = fixture();
    try {
      x.parser.SetAnchorAndAdjustment(V.BOTTOM, horizontal as H, x.items);
      const values = produced(x);
      expect(values.anchor.GetAnchorId()).toBe(R.FLY_AT_PARA);
      expect(values.anchor.GetAnchorNode()).toBe(x.node);
      expect(values.anchor.GetContentAnchor()?.nContent.GetContentNode()).toBeUndefined();
      expect([values.vertical.GetVertOrient(), values.vertical.GetRelationOrient()]).toEqual([
        V.TOP,
        Rel.PRINT_AREA,
      ]);
      expect(values.horizontal.GetHoriOrient()).toBe(horizontal);
      expect(values.horizontal.GetRelationOrient()).toBe(Rel.FRAME);
      expect(values.wrap.GetSurround()).toBe(wrap);
    } finally {
      x.close();
    }
  },
);
it.each([
  [H.LEFT, 720, 0, Rel.PRINT_AREA],
  [H.LEFT, 0, 720, Rel.FRAME],
  [H.RIGHT, 0, 720, Rel.PRINT_AREA],
  [H.RIGHT, 720, 0, Rel.FRAME],
  [H.CENTER, 720, 720, Rel.FRAME],
])(
  "uses native context margins for horizontal %s with %s/%s",
  /** The selected side alone determines the relation. @param horizontal - Actual alignment. @param left - Left context margin. @param right - Right context margin. @param relation - Source relation. @returns Nothing. */ (
    horizontal,
    left,
    right,
    relation,
  ) => {
    const x = fixture(),
      context = new HTMLAttrContext(HtmlTokenId.DIVISION_ON);
    context.SetMargins(left as number, right as number, 0);
    x.parser.PushContext(context);
    try {
      x.parser.SetAnchorAndAdjustment(V.NONE, horizontal as H, x.items);
      expect(produced(x).horizontal.GetRelationOrient()).toBe(relation);
    } finally {
      x.close();
    }
  },
);
it.each([H.LEFT, H.RIGHT, H.CENTER])(
  "nonempty paragraph %s anchors to the previous actual Unicode character and restores the point",
  /** Real SwPaM backward/forward movement preserves a surrogate-pair boundary. @param horizontal - Actual orientation. @returns Nothing. */ (
    horizontal,
  ) => {
    const x = fixture("A😀B", 3);
    try {
      x.parser.SetAnchorAndAdjustment(V.TOP, horizontal, x.items);
      const values = produced(x);
      expect(values.anchor.GetAnchorId()).toBe(R.FLY_AT_CHAR);
      expect(values.anchor.GetAnchorContentOffset()).toBe(1);
      expect([values.vertical.GetVertOrient(), values.vertical.GetRelationOrient()]).toEqual([
        V.CHAR_BOTTOM,
        Rel.CHAR,
      ]);
      expect(x.pam.GetPoint().GetContentIndex()).toBe(3);
      expect(x.doc.paragraphs).toHaveLength(1);
    } finally {
      x.close();
    }
  },
);
it("dontAppend preserves the actual no-wrap paragraph while normal source admission would append", /** Real registered formats participate in the producer's guard. @returns Nothing. */ () => {
  const x = fixture();
  existingFly(x, W.NONE);
  const query = vi.spyOn(x.parser, "HasCurrentParaFlys");
  try {
    x.parser.SetAnchorAndAdjustment(V.NONE, H.LEFT, x.items, true);
    expect(query).not.toHaveBeenCalled();
    expect(x.doc.paragraphs).toHaveLength(1);
    expect(produced(x).anchor.GetAnchorNode()).toBe(x.node);
  } finally {
    query.mockRestore();
    x.close();
  }
});
it.each([W.PARALLEL, W.THROUGH])(
  "does not append around current wrap mode %s",
  /** Native no-surround query ignores both wrapping and wrap-through. @param wrap - Actual mode. @returns Nothing. */ (
    wrap,
  ) => {
    const x = fixture();
    existingFly(x, wrap);
    try {
      x.parser.SetAnchorAndAdjustment(V.NONE, H.LEFT, x.items);
      expect(x.doc.paragraphs).toHaveLength(1);
      expect(produced(x).anchor.GetAnchorNode()).toBe(x.node);
    } finally {
      x.close();
    }
  },
);
it("inline horizontal NONE never queries no-wrap frames or appends", /** The entire floated-frame branch is skipped for the actual inline source overload. @returns Nothing. */ () => {
  const x = fixture();
  existingFly(x, W.NONE);
  const query = vi.spyOn(x.parser, "HasCurrentParaFlys");
  try {
    x.parser.SetAnchorAndAdjustment(V.TOP, H.NONE, x.items);
    expect(query).not.toHaveBeenCalled();
    expect(produced(x).anchor.GetAnchorId()).toBe(R.FLY_AS_CHAR);
    expect(x.doc.paragraphs).toHaveLength(1);
  } finally {
    query.mockRestore();
    x.close();
  }
});
it("no-wrap admission appends a genuine paragraph and splits upper/lower spacing in source order", /** Native point attributes, AppendTextNode and deferred spacing owners are used directly. @returns Nothing. */ () => {
  const x = fixture("before", 6),
    context = new HTMLAttrContext(HtmlTokenId.DIVISION_ON);
  context.SetULSpace(120, 240);
  x.parser.PushContext(context);
  existingFly(x, W.NONE);
  try {
    x.parser.SetAnchorAndAdjustment(V.NONE, H.LEFT, x.items);
    expect(x.doc.paragraphs).toHaveLength(2);
    const current = x.pam.GetPoint().GetNode();
    expect(current).not.toBe(x.node);
    expect(produced(x).anchor.GetAnchorNode()).toBe(current);
    expect(produced(x).anchor.GetAnchorId()).toBe(R.FLY_AT_PARA);
    expect((x.node.GetAttr(IDs.RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
    expect((x.node.GetAttr(IDs.RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(0);
    x.parser.SetAttr(false);
    expect((x.doc.paragraphs[1]?.GetAttr(IDs.RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(0);
    expect((x.doc.paragraphs[1]?.GetAttr(IDs.RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(240);
  } finally {
    x.close();
  }
});
it("zero upper spacing appends without opening a synthetic successor spacing attribute", /** Source only creates the successor override for a nonzero upper margin. @returns Nothing. */ () => {
  const x = fixture(),
    context = new HTMLAttrContext(HtmlTokenId.DIVISION_ON);
  context.SetULSpace(0, 240);
  x.parser.PushContext(context);
  existingFly(x, W.NONE);
  try {
    x.parser.SetAnchorAndAdjustment(V.NONE, H.RIGHT, x.items);
    expect(x.doc.paragraphs).toHaveLength(2);
    expect(x.parser.m_aParaAttrs).toHaveLength(0);
  } finally {
    x.close();
  }
});
it("nontext inline anchoring retains original parser error and already-written vertical item", /** Real structural node causes the source error, not a fake invalid content provider. @returns Nothing. */ () => {
  const x = fixture("", 0, true);
  try {
    x.parser.SetAnchorAndAdjustment(V.BOTTOM, H.NONE, x.items);
    expect(x.parser.eState).toBe(SvParserState.Error);
    expect(x.items.GetItemIfSet(IDs.RES_ANCHOR, false)).toBeUndefined();
    expect(produced(x).vertical.GetVertOrient()).toBe(V.BOTTOM);
  } finally {
    x.close();
  }
});
it("point InsertAttr preserves native queue front/back, copied item values and original point offset", /** Actual pending HTMLAttr owners retain the source point and complete copied item. @returns Nothing. */ () => {
  const x = fixture("abcd", 2),
    back = new SvxULSpaceItem(10, 20, IDs.RES_UL_SPACE),
    front = new SvxULSpaceItem(30, 40, IDs.RES_UL_SPACE);
  try {
    x.parser.InsertAttr(back, false);
    x.parser.InsertAttr(front, true);
    back.SetUpper(999);
    x.pam.GetPoint().SetContent(3);
    const first = x.parser.m_aSetAttrTab[0],
      second = x.parser.m_aSetAttrTab[1];
    assert(first);
    assert(second);
    expect((first.GetItem() as SvxULSpaceItem).GetUpper()).toBe(30);
    expect((second.GetItem() as SvxULSpaceItem).GetUpper()).toBe(10);
    expect([first.GetStartContent(), second.GetStartContent()]).toEqual([2, 2]);
    expect(first.GetStartParagraph().GetNode()).toBe(x.node);
  } finally {
    front.Dispose();
    back.Dispose();
    x.close();
  }
});
it("Reader ResetFrameFormatAttrs resets only native LR/UL/box and keeps unrelated frame payloads", /** Existing native frame items are retained instead of clearing the entire set. @returns Nothing. */ () => {
  const x = fixture();
  const margin = new SvxLRSpaceItem(
      SvxIndentValue.twips(720),
      SvxIndentValue.twips(360),
      SvxIndentValue.zero(),
      IDs.RES_LR_SPACE,
    ),
    size = new SwFormatFrameSize(),
    anchor = new SwFormatAnchor(R.FLY_AT_PARA),
    wrap = new SwFormatSurround(W.THROUGH);
  anchor.SetAnchor(x.pam.GetPoint());
  x.items.Put(margin);
  x.items.Put(new SvxULSpaceItem(120, 240, IDs.RES_UL_SPACE));
  x.items.Put(size);
  x.items.Put(anchor);
  x.items.Put(wrap);
  try {
    ResetFrameFormatAttrs(x.items);
    const lr = x.items.Get(IDs.RES_LR_SPACE) as SvxLRSpaceItem,
      ul = x.items.Get(IDs.RES_UL_SPACE) as SvxULSpaceItem,
      box = x.items.Get(IDs.RES_BOX);
    expect([lr.ResolveTextLeft(), lr.ResolveRight(), ul.GetUpper(), ul.GetLower()]).toEqual([
      0, 0, 0, 0,
    ]);
    expect(box).toBeInstanceOf(SvxBoxItem);
    expect((box as SvxBoxItem).GetTop()).toBeUndefined();
    expect(produced(x).anchor.equals(anchor)).toBe(true);
    expect(produced(x).wrap.GetSurround()).toBe(W.THROUGH);
    expect(x.items.Get(IDs.RES_FRM_SIZE).equals(size)).toBe(true);
  } finally {
    margin.Dispose();
    size.Dispose();
    anchor.Dispose();
    wrap.Dispose();
    x.close();
  }
});
