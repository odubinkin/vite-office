/** @fileoverview Original eight frame-style default-item branches of DocumentStylePoolManager::GetFormatFromPool; collection lookup/factory/undo/modified-state restoration are separate unported responsibilities. */
import type { SwFrameFormat } from "../layout/atrfrm";
import { SwAttrSet } from "../attr/swatrset";
import { aFrameFormatSetRange } from "../bastyp/init";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { RndStdIds as R } from "../../../../svx/inc/swframetypes";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as Rel } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SvxLRSpaceItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import {
  SvxBoxItem,
  SvxBoxItemLine,
  SvxProtectItem,
} from "../../../../editeng/source/items/frmitems";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import { SvxBorderLine, SvxBorderLineWidth } from "../../../../editeng/source/items/borderline";
import { COL_BLACK } from "../../../../tools/inc/color";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { XATTR_FILLSTYLE } from "../../../../svx/inc/xdef";
import { RES_LR_SPACE, RES_UL_SPACE, RES_BOX, RES_OPAQUE, RES_PROTECT } from "../../../inc/hintids";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
/** Applies original switch-created defaults to the real format whose source pool identity is already assigned. No style lookup/creation or alternative format provider is supplied here. @param format - Actual document-pooled frame format. @returns Nothing. */
export function ApplyFrameFormatPoolDefaults(format: SwFrameFormat): void {
  const doc = format.GetDoc(),
    id = format.GetPoolFormatId(),
    items = new SwAttrSet(doc.GetAttrPool(), aFrameFormatSetRange);
  const put =
    /** Original stack-temporary item lifetime around actual set Put. @param item - Owned temporary. @returns Nothing. */
    (item: SfxPoolItem): void => {
      try {
        items.Put(item);
      } finally {
        item.Dispose();
      }
    };
  try {
    switch (id) {
      case P.FRM_FRAME:
        if (doc.GetDocumentSettingManager().get("HTML_MODE")) {
          put(new SwFormatAnchor(R.FLY_AS_CHAR));
          put(new SwFormatVertOrient(0, V.LINE_CENTER, Rel.PRINT_AREA));
          put(new SwFormatSurround(W.NONE));
        } else {
          put(new SwFormatAnchor(R.FLY_AT_PARA));
          put(new SwFormatSurround(W.PARALLEL));
          put(new SwFormatHoriOrient(0, H.CENTER, Rel.PRINT_AREA));
          put(new SwFormatVertOrient(0, V.TOP, Rel.PRINT_AREA));
          const box = new SvxBoxItem(RES_BOX),
            line = new SvxBorderLine(COL_BLACK, SvxBorderLineWidth.Hairline);
          for (const edge of [
            SvxBoxItemLine.TOP,
            SvxBoxItemLine.BOTTOM,
            SvxBoxItemLine.LEFT,
            SvxBoxItemLine.RIGHT,
          ])
            box.SetLine(line, edge);
          box.SetAllDistances(85);
          put(box);
          put(
            new SvxLRSpaceItem(
              SvxIndentValue.twips(114),
              SvxIndentValue.twips(114),
              SvxIndentValue.zero(),
              RES_LR_SPACE,
            ),
          );
          put(new SvxULSpaceItem(114, 114, RES_UL_SPACE));
        }
        items.ClearItem(XATTR_FILLSTYLE);
        break;
      case P.FRM_GRAPHIC:
      case P.FRM_OLE:
        put(new SwFormatAnchor(R.FLY_AT_PARA));
        put(new SwFormatHoriOrient(0, H.CENTER, Rel.FRAME));
        put(new SwFormatVertOrient(0, V.TOP, Rel.FRAME));
        put(new SwFormatSurround(W.DYNAMIC));
        break;
      case P.FRM_FORMEL:
      case P.FRM_INLINE_HEADING:
        put(new SwFormatAnchor(R.FLY_AS_CHAR));
        put(new SwFormatVertOrient(0, V.CHAR_CENTER, Rel.FRAME));
        put(
          new SvxLRSpaceItem(
            SvxIndentValue.zero(),
            SvxIndentValue.zero(),
            SvxIndentValue.zero(),
            RES_LR_SPACE,
          ),
        );
        if (id === P.FRM_INLINE_HEADING) {
          const size = new SwFormatFrameSize(
            SwFrameSize.Variable,
            Number(toTwips(5n, Length.mm)),
            Number(toTwips(1n, Length.mm)),
          );
          size.SetWidthSizeType(SwFrameSize.Variable);
          put(size);
        } else put(new SwFormatVertOrient(0, V.CHAR_CENTER, Rel.FRAME));
        break;
      case P.FRM_MARGINAL:
        put(new SwFormatAnchor(R.FLY_AT_PARA));
        put(new SwFormatHoriOrient(0, H.LEFT, Rel.FRAME));
        put(new SwFormatVertOrient(0, V.TOP, Rel.FRAME));
        put(new SwFormatSurround(W.PARALLEL));
        put(
          new SwFormatFrameSize(
            SwFrameSize.Minimum,
            Number(toTwips(35n, Length.mm)),
            Number(toTwips(5n, Length.mm)),
          ),
        );
        break;
      case P.FRM_WATERSIGN:
        put(new SwFormatAnchor(R.FLY_AT_PAGE));
        put(new SwFormatHoriOrient(0, H.CENTER, Rel.FRAME));
        put(new SwFormatVertOrient(0, V.CENTER, Rel.FRAME));
        put(new SvxOpaqueItem(RES_OPAQUE, false));
        put(new SwFormatSurround(W.THROUGH));
        break;
      case P.FRM_LABEL: {
        put(new SwFormatAnchor(R.FLY_AS_CHAR));
        put(new SwFormatVertOrient(0, V.TOP, Rel.FRAME));
        put(
          new SvxLRSpaceItem(
            SvxIndentValue.twips(114),
            SvxIndentValue.twips(114),
            SvxIndentValue.zero(),
            RES_LR_SPACE,
          ),
        );
        const protection = new SvxProtectItem(RES_PROTECT);
        protection.SetSizeProtect(true);
        protection.SetPosProtect(true);
        put(protection);
        format.SetAutoUpdateOnDirectFormat();
        break;
      }
      default:
        break;
    }
    if (items.Count()) format.SetFormatAttrSet(items);
  } finally {
    items.Dispose();
  }
}
