/** @fileoverview Native frame-pool default-item branches over actual document attributes, complete frame ranges, opacity bool owners and independent format flags. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { ApplyFrameFormatPoolDefaults } from "./poolfmt-frame";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwPoolFormatId as P, POOLGRP_FRAMEFMT } from "../../../inc/poolfmt";
import { aFrameFormatSetRange } from "../bastyp/init";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import {
  SvxBoxItem,
  SvxBoxItemLine as E,
  SvxProtectItem,
} from "../../../../editeng/source/items/frmitems";
import { COL_BLACK } from "../../../../tools/inc/color";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLSTYLE } from "../../../../svx/inc/xdef";
import { RndStdIds as R } from "../../../../svx/inc/swframetypes";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as Rel } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import * as IDs from "../../../inc/hintids";
/** Actual format construction matches the source default-switch entry: pool ID already set, nonautomatic format, real parent. No lookup/factory result provider is supplied. @param id - Original ID. @param html - Actual HTML setting. @returns Actual owners. */
function fixture(id: P, html = false) {
  const doc = new SwDoc(),
    format = new SwFrameFormat(
      doc.GetAttrPool(),
      "Pool branch",
      undefined,
      doc.GetDfltFrameFormat(),
    );
  doc.GetDocumentSettingManager().set("HTML_MODE", html);
  format.SetPoolFormatId(id);
  format.SetAuto(false);
  return {
    doc,
    format,
    /** Releases the real format before its document pool. @returns Nothing. */
    close() {
      format.DisposeModify();
      doc.Dispose();
    },
  };
}
it("retains original frame IDs and complete native frame ranges", /** Literal source boundaries are checked independently of the format constructor. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    row = doc.MakeTableLineFormat();
  try {
    expect(POOLGRP_FRAMEFMT).toBe(3072);
    expect(P.FRM_BEGIN).toBe(P.FRM_FRAME);
    expect([
      P.FRM_FRAME,
      P.FRM_GRAPHIC,
      P.FRM_OLE,
      P.FRM_FORMEL,
      P.FRM_MARGINAL,
      P.FRM_WATERSIGN,
      P.FRM_LABEL,
      P.FRM_INLINE_HEADING,
      P.FRM_END,
    ]).toEqual([3072, 3073, 3074, 3075, 3076, 3077, 3078, 3079, 3080]);
    expect(aFrameFormatSetRange).toEqual([
      [92, 145],
      [163, 163],
      [1014, 1034],
    ]);
    expect(doc.GetDfltFrameFormat().GetAttrSet().GetRanges()).toEqual(aFrameFormatSetRange);
    expect(row.GetAttrSet().GetRanges()).not.toEqual(aFrameFormatSetRange);
  } finally {
    row.DisposeModify();
    doc.Dispose();
  }
});
it("opacity uses native Which109 true default and preserves its dynamic type through copy and clone", /** No generic bool stand-in replaces the native opacity item. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = new SvxOpaqueItem(IDs.RES_OPAQUE),
    copy = new SvxOpaqueItem(item),
    clone = item.Clone();
  try {
    expect(IDs.RES_OPAQUE).toBe(109);
    expect(item.Which()).toBe(109);
    expect(item.GetValue()).toBe(true);
    expect(clone).toBeInstanceOf(SvxOpaqueItem);
    expect(clone.Which()).toBe(109);
    expect(clone.equals(copy)).toBe(true);
    item.SetValue(false);
    expect(clone.GetValue()).toBe(true);
    expect(copy.GetValue()).toBe(true);
    expect(doc.GetDfltFrameFormat().GetOpaque()).toBeInstanceOf(SvxOpaqueItem);
    expect(doc.GetDfltFrameFormat().GetOpaque().GetValue()).toBe(true);
  } finally {
    clone.Dispose();
    copy.Dispose();
    item.Dispose();
    doc.Dispose();
  }
});
it("opacity inheritance queries the actual parent while false-search uses the native static default", /** Real inherited item-set ownership and original getter defaults are exercised. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = new SwFrameFormat(doc.GetAttrPool(), "Parent"),
    child = new SwFrameFormat(doc.GetAttrPool(), "Child", undefined, parent),
    opaque = new SvxOpaqueItem(IDs.RES_OPAQUE, false);
  parent.SetFormatAttr(opaque);
  opaque.Dispose();
  try {
    expect(child.GetOpaque().GetValue()).toBe(false);
    expect(child.GetOpaque(false).GetValue()).toBe(true);
  } finally {
    child.DisposeModify();
    parent.DisposeModify();
    doc.Dispose();
  }
});
it("auto-update-on-direct-format starts false and is independent from automatic format identity", /** Source setters have separate fields and original true default. @returns Nothing. */ () => {
  const x = fixture(P.FRM_FRAME);
  try {
    expect(x.format.IsAutoUpdateOnDirectFormat()).toBe(false);
    x.format.SetAutoUpdateOnDirectFormat();
    expect(x.format.IsAutoUpdateOnDirectFormat()).toBe(true);
    expect(x.format.IsAuto()).toBe(false);
    x.format.SetAutoUpdateOnDirectFormat(false);
    expect(x.format.IsAutoUpdateOnDirectFormat()).toBe(false);
  } finally {
    x.close();
  }
});
it("normal Frame style retains source paragraph anchoring, print-area alignment and exact85/114 defaults", /** Complete actual border/margin items are read after source switch application. @returns Nothing. */ () => {
  const x = fixture(P.FRM_FRAME);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AT_PARA);
    expect(x.format.GetSurround().GetSurround()).toBe(W.PARALLEL);
    expect([
      x.format.GetHoriOrient().GetHoriOrient(),
      x.format.GetHoriOrient().GetRelationOrient(),
      x.format.GetVertOrient().GetVertOrient(),
      x.format.GetVertOrient().GetRelationOrient(),
    ]).toEqual([H.CENTER, Rel.PRINT_AREA, V.TOP, Rel.PRINT_AREA]);
    expect([
      x.format.GetLRSpace().ResolveLeft(),
      x.format.GetLRSpace().ResolveRight(),
      x.format.GetULSpace().GetUpper(),
      x.format.GetULSpace().GetLower(),
    ]).toEqual([114, 114, 114, 114]);
    const box = x.format.GetBox();
    expect(box).toBeInstanceOf(SvxBoxItem);
    for (const edge of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT]) {
      const line = box.GetLine(edge);
      assert(line);
      expect(line.GetWidth()).toBe(1);
      expect(line.GetColor().equals(COL_BLACK)).toBe(true);
      expect(box.GetDistance(edge)).toBe(85);
    }
    expect(box.GetTop()).not.toBe(box.GetBottom());
    expect(x.format.GetAttrSet().GetItemIfSet(XATTR_FILLSTYLE, false)).toBeUndefined();
    expect((x.format.GetAttrSet().Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(
      FillStyle.NONE,
    );
  } finally {
    x.close();
  }
});
it("HTML Frame style uses source inline line-center no-wrap defaults without adding normal-mode borders/margins", /** Actual document HTML setting selects the original branch. @returns Nothing. */ () => {
  const x = fixture(P.FRM_FRAME, true);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AS_CHAR);
    expect([
      x.format.GetVertOrient().GetVertOrient(),
      x.format.GetVertOrient().GetRelationOrient(),
      x.format.GetSurround().GetSurround(),
    ]).toEqual([V.LINE_CENTER, Rel.PRINT_AREA, W.NONE]);
    for (const id of [
      IDs.RES_BOX,
      IDs.RES_LR_SPACE,
      IDs.RES_UL_SPACE,
      IDs.RES_HORI_ORIENT,
      XATTR_FILLSTYLE,
    ])
      expect(x.format.GetAttrSet().GetItemIfSet(id, false)).toBeUndefined();
  } finally {
    x.close();
  }
});
it.each([P.FRM_GRAPHIC, P.FRM_OLE])(
  "frame pool %s has source frame-relative center/top dynamic wrapping",
  /** The styles are real format defaults, not graphic/OLE object providers. @param id - Native style ID. @returns Nothing. */ (
    id,
  ) => {
    const x = fixture(id);
    try {
      ApplyFrameFormatPoolDefaults(x.format);
      expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AT_PARA);
      expect([
        x.format.GetHoriOrient().GetHoriOrient(),
        x.format.GetHoriOrient().GetRelationOrient(),
        x.format.GetVertOrient().GetVertOrient(),
        x.format.GetVertOrient().GetRelationOrient(),
        x.format.GetSurround().GetSurround(),
      ]).toEqual([H.CENTER, Rel.FRAME, V.TOP, Rel.FRAME, W.DYNAMIC]);
    } finally {
      x.close();
    }
  },
);
it("Formula style retains inline character-centering and explicit zero margins", /** The source repeated vertical Put has the same complete final native value. @returns Nothing. */ () => {
  const x = fixture(P.FRM_FORMEL);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AS_CHAR);
    expect([
      x.format.GetVertOrient().GetVertOrient(),
      x.format.GetVertOrient().GetRelationOrient(),
    ]).toEqual([V.CHAR_CENTER, Rel.FRAME]);
    expect(x.format.GetLRSpace().ResolveLeft()).toBe(0);
    expect(x.format.GetLRSpace().ResolveRight()).toBe(0);
    expect(x.format.GetAttrSet().GetItemIfSet(IDs.RES_FRM_SIZE, false)).toBeUndefined();
  } finally {
    x.close();
  }
});
it("Inline Heading size uses original integral5mm/1mm conversions and variable width/height", /** Native integral conversion yields283/57twips, not floating canvas/device values. @returns Nothing. */ () => {
  const x = fixture(P.FRM_INLINE_HEADING);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    const size = x.format.GetFrameSize();
    expect([
      size.GetWidth(),
      size.GetHeight(),
      size.GetWidthSizeType(),
      size.GetHeightSizeType(),
    ]).toEqual([283, 57, SwFrameSize.Variable, SwFrameSize.Variable]);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AS_CHAR);
  } finally {
    x.close();
  }
});
it("Marginalia retains source minimum height, fixed width and35mm/5mm integral dimensions", /** Complete source size mode and frame-relative left/top are retained. @returns Nothing. */ () => {
  const x = fixture(P.FRM_MARGINAL);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    const size = x.format.GetFrameSize();
    expect([
      size.GetWidth(),
      size.GetHeight(),
      size.GetWidthSizeType(),
      size.GetHeightSizeType(),
    ]).toEqual([1984, 283, SwFrameSize.Fixed, SwFrameSize.Minimum]);
    expect([
      x.format.GetHoriOrient().GetHoriOrient(),
      x.format.GetVertOrient().GetVertOrient(),
      x.format.GetSurround().GetSurround(),
    ]).toEqual([H.LEFT, V.TOP, W.PARALLEL]);
  } finally {
    x.close();
  }
});
it("Watermark uses native page anchoring, nonopaque payload and wrap-through", /** Typed opacity remains the actual SvxOpaqueItem. @returns Nothing. */ () => {
  const x = fixture(P.FRM_WATERSIGN);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AT_PAGE);
    expect(x.format.GetOpaque()).toBeInstanceOf(SvxOpaqueItem);
    expect(x.format.GetOpaque().GetValue()).toBe(false);
    expect([
      x.format.GetHoriOrient().GetHoriOrient(),
      x.format.GetVertOrient().GetVertOrient(),
      x.format.GetSurround().GetSurround(),
    ]).toEqual([H.CENTER, V.CENTER, W.THROUGH]);
  } finally {
    x.close();
  }
});
it("Labels retain actual source independent protection bits and auto-update flag", /** IsAuto is still controlled by the caller's native pool-creation stage. @returns Nothing. */ () => {
  const x = fixture(P.FRM_LABEL);
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    const protection = x.format.GetAttrSet().Get(IDs.RES_PROTECT) as SvxProtectItem;
    expect([
      protection.IsContentProtected(),
      protection.IsSizeProtected(),
      protection.IsPosProtected(),
    ]).toEqual([false, true, true]);
    expect(x.format.GetAnchor().GetAnchorId()).toBe(R.FLY_AS_CHAR);
    expect(x.format.GetVertOrient().GetVertOrient()).toBe(V.TOP);
    expect(x.format.GetLRSpace().ResolveLeft()).toBe(114);
    expect(x.format.GetLRSpace().ResolveRight()).toBe(114);
    expect(x.format.IsAutoUpdateOnDirectFormat()).toBe(true);
    expect(x.format.IsAuto()).toBe(false);
  } finally {
    x.close();
  }
});
it("source switch application preserves unrelated direct frame items instead of resetting the format", /** Existing source size and explicitly authored items survive when the selected branch does not overwrite them. @returns Nothing. */ () => {
  const x = fixture(P.FRM_GRAPHIC),
    size = new SwFormatFrameSize(SwFrameSize.Fixed, 777, 888);
  x.format.SetFormatAttr(size);
  size.Dispose();
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect([x.format.GetFrameSize().GetWidth(), x.format.GetFrameSize().GetHeight()]).toEqual([
      777, 888,
    ]);
  } finally {
    x.close();
  }
});
it("Frame fill inheritance does not erase an already-authored destination fill item", /** ClearItem occurs on the fresh local set, not the existing format. @returns Nothing. */ () => {
  const x = fixture(P.FRM_FRAME),
    fill = new XFillStyleItem(FillStyle.SOLID);
  x.format.SetFormatAttr(fill);
  fill.Dispose();
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect((x.format.GetAttrSet().Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(
      FillStyle.SOLID,
    );
  } finally {
    x.close();
  }
});
it("the default-item switch does not invent a fallback for identities it does not handle", /** Native family admission/fallback belongs to the separate lookup stage. @returns Nothing. */ () => {
  const x = fixture(P.UNKNOWN),
    margin = new SvxLRSpaceItem(
      SvxIndentValue.twips(321),
      SvxIndentValue.twips(654),
      SvxIndentValue.zero(),
      IDs.RES_LR_SPACE,
    );
  x.format.SetFormatAttr(margin);
  margin.Dispose();
  const count = x.format.GetAttrSet().Count();
  try {
    ApplyFrameFormatPoolDefaults(x.format);
    expect(x.format.GetAttrSet().Count()).toBe(count);
    expect(x.format.GetLRSpace().ResolveLeft()).toBe(321);
  } finally {
    x.close();
  }
});
