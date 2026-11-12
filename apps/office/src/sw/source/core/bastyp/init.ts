/** @fileoverview Native module-global static Writer defaults from pinned bastyp/init.cxx, limited to represented item classes. */
import * as CharacterWhich from "../../../inc/hintids";
import {
  SvxCaseMapItem,
  SvxOpticalSizingItem,
} from "../../../../editeng/source/items/textitem.modes";
import {
  SvxNoHyphenItem,
  SvxRsidItem,
  SvxContourItem,
  SvxShadowedItem,
  SvxOverlineItem,
  SvxCharReliefItem,
} from "../../../../editeng/source/items/textitem";
import { SvxCharHiddenItem } from "../../../../editeng/inc/charhiddenitem";
import {
  SvxKerningItem,
  SvxCharScaleWidthItem,
} from "../../../../editeng/source/items/textitem.spacing";
import {
  SvxCharRotateItem,
  SvxTwoLinesItem,
  SvxBlinkItem,
} from "../../../../editeng/source/items/textitem.layout";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { SvxFontVariationsItem } from "../../../../editeng/inc/fontvariationsitem";
import { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import { SfxVoidItem } from "../../../../svl/source/items/voiditem";
import { SfxGrabBagItem } from "../../../../svl/source/items/grabbagitem";
import { SvxCaseMap } from "../../../../editeng/inc/svxenum";
import { FontEmphasisMark } from "../../../../tools/inc/fontenum";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { SwFormatFlySplit } from "../../../inc/formatflysplit";
import { SwFormatFollowTextFlow } from "../../../inc/fmtfollowtextflow";
import { SwFormatWrapInfluenceOnObjPos } from "../../../inc/fmtwrapinfluenceonobjpos";
import { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import type { WhichRangesContainer } from "../../../../svl/inc/whichranges";
import {
  RES_OPAQUE,
  RES_FRMATR_BEGIN,
  RES_FRMATR_END,
  RES_UNKNOWNATR_BEGIN,
  RES_UNKNOWNATR_END,
} from "../../../inc/hintids";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatSurround } from "../../../inc/fmtsrnd";

import { SwFormatFillOrder } from "../../../inc/fmtfordr";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { RES_FRAMEDIR } from "../../../inc/hintids";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import { RES_PARATR_LIST_AUTOFMT, RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_DONTKNOW } from "../../../../i18nlangtag/inc/lang";

import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";

import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT, RES_CHRATR_ESCAPEMENT, RES_PROTECT } from "../../../inc/hintids";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxFirstLineIndentItem, SvxTextLeftMarginItem } from "../../../../editeng/inc/lrspitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  SvxBoxItem,
  SvxLRSpaceItem,
  SvxProtectItem,
  SvxRightMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/frmitems";
import {
  FontLineStyle,
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SvxScriptHintItem } from "../../../../editeng/source/items/textitem.modes";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import {
  RES_BOX,
  RES_BACKGROUND,
  RES_BREAK,
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_COLOR,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_SCRIPT_HINT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_WORDLINEMODE,
  RES_COLLAPSING_BORDERS,
  RES_KEEP,
  RES_LINENUMBER,
  RES_LR_SPACE,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_ORPHANS,
  RES_PARATR_OUTLINELEVEL,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwTextGridItem } from "../../../inc/tgrditem";
import { SwNumRuleItem, SwParaConnectBorderItem } from "../para/paratr";
import { SwFormatCharFormat, SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwTableBoxFormula, SwTableBoxNumFormat, SwTableBoxValue } from "../attr/cellatr";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { GetDefaultFonts } from "../../../../editeng/inc/fontitem";
import {
  ItemInfoPackage,
  ItemInfoStatic,
  type ItemInfo,
} from "../../../../svl/source/items/itempool";
import { RES_CHRATR_BEGIN, POOLATTR_END } from "../../../inc/hintids";
/** Original complete frame-format ranges from init.cxx, including unknown XML attributes and all drawing-layer fill items. */
export const aFrameFormatSetRange: WhichRangesContainer = [
  [RES_FRMATR_BEGIN, RES_FRMATR_END - 1],
  [RES_UNKNOWNATR_BEGIN, RES_UNKNOWNATR_END - 1],
  [XATTR_FILL_FIRST, XATTR_FILL_LAST],
];

/** Source ItemInfoPackageSwAttributes for all currently represented Writer item types. Unknown native entries stay explicitly unrepresented; no stand-in items are created. */
class ItemInfoPackageSwAttributes extends ItemInfoPackage {
  private readonly maItemInfos = defaultMetadata.map(
    /** Native static metadata table; items outside the current slice retain no stand-in value. @param row - Pinned source entry. @returns Actual metadata. */
    (row) => new ItemInfoStatic(row.which, null, row.slot, row.flags),
  );
  /** Initializes represented static values and the source GetDefaultFonts triple under module ownership. @returns Nothing. */
  constructor() {
    super();
    const fonts = new Map<number, SvxFontItem>();
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      fonts.set(which, new SvxFontItem(which));
    GetDefaultFonts(
      fonts.get(RES_CHRATR_FONT) as SvxFontItem,
      fonts.get(RES_CHRATR_CJK_FONT) as SvxFontItem,
      fonts.get(RES_CHRATR_CTL_FONT) as SvxFontItem,
    );
    /** Retains one actual source static metadata/default owner. @param item - Owned default. @returns Nothing. */
    const add = /** Evaluates the init callback. @param item - item value. @returns Nothing. */ (
      item: SfxPoolItem,
    ): void => {
      ItemInfoPackageSwAttributes.setItemAtItemInfoStatic(
        item,
        this.getItemInfoStatic(item.Which() - RES_CHRATR_BEGIN),
      );
    };
    const W = CharacterWhich;
    add(new SvxCaseMapItem(SvxCaseMap.NotMapped, W.RES_CHRATR_CASEMAP));
    add(new SvxColorItem(W.RES_CHRATR_CHARSETCOLOR));
    add(new SvxContourItem(false, W.RES_CHRATR_CONTOUR));
    add(new SvxKerningItem(0, W.RES_CHRATR_KERNING));
    add(new SfxVoidItem(W.RES_CHRATR_UNUSED1));
    add(new SvxShadowedItem(false, W.RES_CHRATR_SHADOWED));
    add(new SvxBlinkItem(false, W.RES_CHRATR_BLINK));
    add(new SvxNoHyphenItem(false, W.RES_CHRATR_NOHYPHEN));
    add(new SfxVoidItem(W.RES_CHRATR_UNUSED2));
    add(new SvxBrushItem(W.RES_CHRATR_BACKGROUND));
    add(new SvxCharRotateItem(0, false, W.RES_CHRATR_ROTATE));
    add(new SvxEmphasisMarkItem(FontEmphasisMark.NONE, W.RES_CHRATR_EMPHASIS_MARK));
    add(new SvxTwoLinesItem(false, 0, 0, W.RES_CHRATR_TWO_LINES));
    add(new SvxCharScaleWidthItem(100, W.RES_CHRATR_SCALEW));
    add(new SvxCharReliefItem(FontRelief.NONE, W.RES_CHRATR_RELIEF));
    add(new SvxCharHiddenItem(false, W.RES_CHRATR_HIDDEN));
    add(new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, W.RES_CHRATR_OVERLINE));
    add(new SvxRsidItem(0, W.RES_CHRATR_RSID));
    add(new SvxBoxItem(W.RES_CHRATR_BOX));
    add(new SvxShadowItem(W.RES_CHRATR_SHADOW));
    add(new SfxGrabBagItem(W.RES_CHRATR_GRABBAG));
    add(new SfxInt16Item(W.RES_CHRATR_BIDIRTL, -1));
    add(new SfxVoidItem(W.RES_CHRATR_UNUSED3));
    add(new SvxOpticalSizingItem(false, W.RES_CHRATR_OPTICAL_SIZING));
    add(new SvxFontVariationsItem(W.RES_CHRATR_FONT_VARIATIONS));
    add(new SwTextGridItem());
    add(new SvxEscapementItem(RES_CHRATR_ESCAPEMENT));
    add(new SvxProtectItem(RES_PROTECT));
    add(new SwTableBoxNumFormat());
    add(new SwTableBoxFormula(""));
    add(new SwTableBoxValue());
    add(new SvxLRSpaceItem(RES_LR_SPACE));
    add(new SwFormatFrameSize());
    add(new SwFormatVertOrient());
    add(new SwFormatHoriOrient());
    add(new SwFormatLayoutSplit());
    add(new SwFormatRowSplit());
    add(new SwFormatFlySplit());
    add(new SwFormatFollowTextFlow());
    add(new SwFormatWrapInfluenceOnObjPos());
    add(new SvxFrameDirectionItem(SvxFrameDirection.Environment, RES_FRAMEDIR));
    add(new SwFormatFillOrder());
    add(new SvxOpaqueItem(RES_OPAQUE));
    add(new SwFormatContent());
    add(new SwFormatAnchor());
    add(new SwFormatSurround());
    add(new SvxBoxItem(RES_BOX));
    add(new SfxBoolItem(RES_COLLAPSING_BORDERS, false));
    add(new SwFormatINetFormat("", ""));
    add(new SwFormatCharFormat());
    add(new SwParaConnectBorderItem());
    add(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, 0));
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      add(fonts.get(which) as SvxFontItem);
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      add(new SvxFontHeightItem(12 * 20, 100, which));
    for (const which of [RES_CHRATR_LANGUAGE, RES_CHRATR_CJK_LANGUAGE, RES_CHRATR_CTL_LANGUAGE])
      add(new SvxLanguageItem(LANGUAGE_DONTKNOW, which));
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      add(new SvxPostureItem(FontItalic.ITALIC_NONE, which));
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      add(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, which));
    add(new SvxWordLineModeItem(false, RES_CHRATR_WORDLINEMODE));
    add(new SvxAutoKernItem(false, RES_CHRATR_AUTOKERN));
    add(new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, RES_CHRATR_CROSSEDOUT));
    add(new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, RES_CHRATR_UNDERLINE));
    add(new SvxColorItem(RES_CHRATR_COLOR));
    add(new SvxBrushItem(RES_CHRATR_HIGHLIGHT));
    add(new SvxScriptHintItem(RES_CHRATR_SCRIPT_HINT));
    add(new SvxBrushItem(RES_BACKGROUND));
    add(new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST));
    add(new SvxTabStopItem(1, 1134, SvxTabAdjust.Default, RES_PARATR_TABSTOP));
    add(new SvxTextLeftMarginItem(RES_MARGIN_TEXTLEFT));
    add(new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE));
    add(new SvxRightMarginItem(RES_MARGIN_RIGHT));
    add(new SvxULSpaceItem(RES_UL_SPACE));
    add(new SvxLineSpacingItem(200, RES_PARATR_LINESPACING));
    for (const which of [RES_PARATR_SPLIT, RES_KEEP, RES_LINENUMBER])
      add(new SfxBoolItem(which, which === RES_LINENUMBER || which === RES_PARATR_SPLIT));
    for (const which of [RES_PARATR_ORPHANS, RES_PARATR_WIDOWS]) add(new SfxInt16Item(which, 0));
    add(new SfxInt16Item(RES_BREAK, 0));
    add(new SwFormatPageDesc());
    add(new SwNumRuleItem());
    add(new SfxStringItem(RES_PARATR_LIST_ID, ""));
    add(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 0));
    add(new SfxBoolItem(RES_PARATR_LIST_ISRESTART, false));
    add(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, 1));
    add(new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, true));
    add(new SwFormatAutoFormat(RES_PARATR_LIST_AUTOFMT));
    add(new SwFormatAutoFormat(RES_TXTATR_AUTOFMT));
  }
  /** Native member-table destruction releases every owned default; source shutdown ordering excludes live pool users. @returns Nothing. */
  override Dispose(): void {
    for (const info of this.maItemInfos) info.getItem()?.Dispose();
    this.maItemInfos.length = 0;
  }
  /** Native table length, including identities outside the represented item slice. @returns Original size. */
  size(): number {
    return POOLATTR_END - RES_CHRATR_BEGIN;
  }
  /** Source indexed lookup; unrepresented item classes are explicit instead of fabricated. @param index - Native table index. @returns Static metadata. */
  protected getItemInfoStatic(index: number): ItemInfoStatic {
    const info = this.maItemInfos[index];
    if (!info) throw new Error("Writer ItemInfo index is out of range");
    return info;
  }
  /** Original table/default lookup is independent from the requesting pool. @param index - Native table index. @param pool - Requesting pool. @returns Static metadata. */
  getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    void pool;
    return this.getItemInfoStatic(index);
  }
  /** Original existing-item lookup used by GetDfltAttr. @param index - Native table index. @returns Static metadata. */
  override getExistingItemInfo(index: number): ItemInfoStatic {
    return this.getItemInfoStatic(index);
  }
}
/** Original factory owns a fresh metadata package; SwModule provides the singleton lifetime. @returns Package. */
export function createItemInfoPackageSwAttributes(): ItemInfoPackage {
  return new ItemInfoPackageSwAttributes();
}

import defaultMetadata from "./default-metadata.json" with { type: "json" };
