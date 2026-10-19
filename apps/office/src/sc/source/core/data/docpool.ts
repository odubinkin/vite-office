/** @fileoverview Consumed ScDocumentPool cell-item package (ATTR_FONT..ATTR_BACKGROUND); remaining cell/page defaults and native pool services are unported. */
import {
  SfxItemPool,
  ItemInfoPackage,
  ItemInfoStatic,
  type ItemInfo,
} from "../../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxOverlineItem,
  SvxContourItem,
  SvxShadowedItem,
  SvxWordLineModeItem,
  SvxCharReliefItem,
} from "../../../../editeng/source/items/textitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ScMergeAttr, ScMergeFlagAttr } from "./attrib";
import { ScGlobal } from "./global";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import {
  SvxCrossedOutItem,
  SvxEmphasisMarkItem,
} from "../../../../editeng/source/items/textitem.effects";
import { SvXMLAttrContainerItem } from "../../../../editeng/inc/xmlcnitm";
import {
  FontWeight,
  FontItalic,
  FontLineStyle,
  FontStrikeout,
  FontEmphasisMark,
} from "../../../../tools/inc/fontenum";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { COL_AUTO, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { LANGUAGE_DONTKNOW, LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { MsLangId } from "../../../../i18nlangtag/inc/mslangid";
import {
  ScriptType,
  resolveSystemLanguageByScriptType,
} from "../../../../i18nlangtag/source/isolang/mslangid.script";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DefaultFontType } from "../../../../unotools/inc/fontdefs";
import { getDefaultFontWithoutDevice } from "../../../../vcl/source/outdev/font";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import {
  ScHyphenateCell,
  ScIndentItem,
  ScVerticalStackCell,
  ScRotateValueItem,
  ScLineBreakCell,
  ScShrinkToFitCell,
} from "../../../inc/attrib";
import { SvxScriptSpaceItem } from "../../../../editeng/inc/scriptspaceitem";
import { SvxHangingPunctuationItem } from "../../../../editeng/inc/hngpnctitem";
import { SvxForbiddenRuleItem } from "../../../../editeng/inc/forbiddenruleitem";
import {
  SvxHorJustifyItem,
  SvxVerJustifyItem,
  SvxJustifyMethodItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify,
  SvxCellVerJustify,
  SvxCellJustifyMethod,
} from "../../../../editeng/inc/svxenum";
import { SvxRotateModeItem, SvxRotateMode } from "../../../../svx/inc/rotmodit";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { SvxMarginItem } from "../../../../svx/inc/algitem";
/** Builds the native logical default using configured script resolution and the source no-VCL-device branch. Linguistic preference editing is not exposed by this browser slice. @param script - Native script. @param role - Spreadsheet role. @param which - Native identity. @returns Default font item. */
function getDefaultFontItem(script: number, role: DefaultFontType, which: number): SvxFontItem {
  const language = resolveSystemLanguageByScriptType(LANGUAGE_SYSTEM, script);
  const font = getDefaultFontWithoutDevice(
    role,
    MsLangId.Conversion.convertLanguageToLocale(language, false),
    RTL_TEXTENCODING_UTF8,
  );
  return new SvxFontItem(
    font.GetFamilyType(),
    font.GetFamilyName(),
    font.GetStyleName(),
    font.GetPitch(),
    font.GetCharSet(),
    which,
  );
}
/** Original static metadata for the consumed contiguous cell-attribute prefix. Unsupported IDs are not given fabricated defaults. */
class ItemInfoPackageScDocument extends ItemInfoPackage {
  private readonly maItemInfos: ItemInfoStatic[];
  /** Constructs original item values, slot mappings and surrogate flags. @returns Package. */
  constructor() {
    super();
    const values: readonly (readonly [SfxPoolItem, number, number])[] = [
      [getDefaultFontItem(ScriptType.LATIN, DefaultFontType.LATIN_SPREADSHEET, 100), 10007, 1],
      [new SvxFontHeightItem(200, 100, 101), 10015, 0],
      [new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 102), 10009, 0],
      [new SvxPostureItem(FontItalic.ITALIC_NONE, 103), 10008, 0],
      [new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, 104), 10014, 0],
      [new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, 105), 11568, 0],
      [new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, 106), 10013, 0],
      [new SvxContourItem(false, 107), 10012, 0],
      [new SvxShadowedItem(false, 108), 10010, 0],
      [new SvxColorItem(COL_AUTO, 109), 10017, 1],
      [new SvxLanguageItem(LANGUAGE_DONTKNOW, 110), 10020, 0],
      [getDefaultFontItem(ScriptType.ASIAN, DefaultFontType.CJK_SPREADSHEET, 111), 10887, 1],
      [new SvxFontHeightItem(200, 100, 112), 10888, 0],
      [new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 113), 10891, 0],
      [new SvxPostureItem(FontItalic.ITALIC_NONE, 114), 10890, 0],
      [new SvxLanguageItem(LANGUAGE_DONTKNOW, 115), 10889, 0],
      [getDefaultFontItem(ScriptType.COMPLEX, DefaultFontType.CTL_SPREADSHEET, 116), 10892, 1],
      [new SvxFontHeightItem(200, 100, 117), 10893, 0],
      [new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 118), 10896, 0],
      [new SvxPostureItem(FontItalic.ITALIC_NONE, 119), 10895, 0],
      [new SvxLanguageItem(LANGUAGE_DONTKNOW, 120), 10894, 0],
      [new SvxEmphasisMarkItem(FontEmphasisMark.NONE, 121), 10899, 0],
      [new SvXMLAttrContainerItem(122), 0, 1],
      [new SvxWordLineModeItem(false, 123), 10011, 0],
      [new SvxCharReliefItem(FontRelief.NONE, 124), 10920, 0],
      [new ScHyphenateCell(), 10931, 0],
      [new SvxScriptSpaceItem(false, 126), 0, 0],
      [new SvxHangingPunctuationItem(false, 127), 0, 0],
      [new SvxForbiddenRuleItem(false, 128), 10903, 0],
      [new SvxHorJustifyItem(SvxCellHorJustify.Standard, 129), 11571, 0],
      [new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 130), 11569, 0],
      [new ScIndentItem(0), 10460, 0],
      [new SvxVerJustifyItem(SvxCellVerJustify.Standard, 132), 11572, 0],
      [new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 133), 11570, 0],
      [new ScVerticalStackCell(false), 10229, 0],
      [new ScRotateValueItem(0), 10577, 0],
      [new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_BOTTOM, 136), 10578, 0],
      [new SfxBoolItem(137), 10949, 0],
      [new SvxFrameDirectionItem(SvxFrameDirection.Environment, 138), 10944, 0],
      [new ScLineBreakCell(), 10230, 0],
      [new ScShrinkToFitCell(), 11015, 0],
      [new SvxLineItem(141), 11013, 0],
      [new SvxLineItem(142), 11014, 0],
      [new SvxMarginItem(143), 10228, 0],
      [new ScMergeAttr(), 0, 0],
      [new ScMergeFlagAttr(), 0, 0],
      [new SfxUInt32Item(146, 0), 10085, 0],
      [new SvxLanguageItem(ScGlobal.eLnge, 147), 0, 0],
      [new SvxBrushItem(COL_TRANSPARENT, 148), 10001, 1],
    ];
    this.maItemInfos = values.map(
      /** Constructs native static metadata. @param value - Item, slot and flags. @returns Entry. */ ([
        item,
        slot,
        flags,
      ]) => new ItemInfoStatic(item.Which(), item, slot, flags),
    );
  }
  /** Original indexed static entry. @param index - Native index. @returns Entry. */
  protected getItemInfoStatic(index: number): ItemInfoStatic {
    return this.maItemInfos[index] as ItemInfoStatic;
  }
  /** Consumed native prefix count. @returns Count. */
  size(): number {
    return this.maItemInfos.length;
  }
  /** Borrows the static item without introducing pool-dependent defaults. @param index - Native index. @param pool - Requesting pool. @returns Entry. */
  getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    void pool;
    return this.getItemInfoStatic(index);
  }
}
let packageScDocument: ItemInfoPackageScDocument | undefined;
/** Original named pool construction over real Sfx metadata and item defaults. This slice exports the contiguous cell prefix through background. */
export class ScDocumentPool extends SfxItemPool {
  /** Registers the shared original cell-attribute prefix. @returns Pool. */
  constructor() {
    super(unicode("ScDocumentPool"));
    packageScDocument ??= new ItemInfoPackageScDocument();
    this.registerItemInfoPackage(packageScDocument);
  }
}
