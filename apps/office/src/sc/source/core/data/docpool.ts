/** @fileoverview Original complete ScDocumentPool package100..188 with actual static values and per-pool header/footer sets. Full native presentation and physical shutdown services remain unported. */
import { SvxShadowItem } from "../../../../editeng/inc/shaditem";
import {
  ScCondFormatItem,
  ScViewObjectModeItem,
  ScPageHFItem,
  ScPageScaleToItem,
} from "../../../inc/attrib";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxPageItem, SvxSetItem } from "../../../../svx/inc/pageitem";
import { SvxPaperBinItem } from "../../../../editeng/inc/pbinitem";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { SvxBoxItem, SvxBoxInfoItem } from "../../../../editeng/source/items/frmitems";
import { ScProtectionAttr } from "../../../inc/attrib";
import {
  SfxItemPool,
  ItemInfoPackage,
  ItemInfoStatic,
  ItemInfoDynamic,
  type ItemInfo,
} from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/inc/itemset";
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
/** Original initialized global inner-border item. @returns Native table/distance default. */
function createGlobalBorderInnerAttr(): SvxBoxInfoItem {
  const item = new SvxBoxInfoItem(151);
  item.SetTable(true);
  item.SetDist(true);
  item.SetMinDist(false);
  return item;
}
/** Original complete static/dynamic package over actual shared values. */
class ItemInfoPackageScDocument extends ItemInfoPackage {
  private readonly maItemInfos: ItemInfoStatic[];
  /** Constructs original item values, slot mappings and surrogate flags. @returns Package. */
  constructor() {
    super();
    const values: readonly (readonly [number, SfxPoolItem | null, number, number])[] = [
      [100, getDefaultFontItem(ScriptType.LATIN, DefaultFontType.LATIN_SPREADSHEET, 100), 10007, 1],
      [101, new SvxFontHeightItem(200, 100, 101), 10015, 0],
      [102, new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 102), 10009, 0],
      [103, new SvxPostureItem(FontItalic.ITALIC_NONE, 103), 10008, 0],
      [104, new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, 104), 10014, 0],
      [105, new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, 105), 11568, 0],
      [106, new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, 106), 10013, 0],
      [107, new SvxContourItem(false, 107), 10012, 0],
      [108, new SvxShadowedItem(false, 108), 10010, 0],
      [109, new SvxColorItem(COL_AUTO, 109), 10017, 1],
      [110, new SvxLanguageItem(LANGUAGE_DONTKNOW, 110), 10020, 0],
      [111, getDefaultFontItem(ScriptType.ASIAN, DefaultFontType.CJK_SPREADSHEET, 111), 10887, 1],
      [112, new SvxFontHeightItem(200, 100, 112), 10888, 0],
      [113, new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 113), 10891, 0],
      [114, new SvxPostureItem(FontItalic.ITALIC_NONE, 114), 10890, 0],
      [115, new SvxLanguageItem(LANGUAGE_DONTKNOW, 115), 10889, 0],
      [116, getDefaultFontItem(ScriptType.COMPLEX, DefaultFontType.CTL_SPREADSHEET, 116), 10892, 1],
      [117, new SvxFontHeightItem(200, 100, 117), 10893, 0],
      [118, new SvxWeightItem(FontWeight.WEIGHT_NORMAL, 118), 10896, 0],
      [119, new SvxPostureItem(FontItalic.ITALIC_NONE, 119), 10895, 0],
      [120, new SvxLanguageItem(LANGUAGE_DONTKNOW, 120), 10894, 0],
      [121, new SvxEmphasisMarkItem(FontEmphasisMark.NONE, 121), 10899, 0],
      [122, new SvXMLAttrContainerItem(122), 0, 1],
      [123, new SvxWordLineModeItem(false, 123), 10011, 0],
      [124, new SvxCharReliefItem(FontRelief.NONE, 124), 10920, 0],
      [125, new ScHyphenateCell(), 10931, 0],
      [126, new SvxScriptSpaceItem(false, 126), 0, 0],
      [127, new SvxHangingPunctuationItem(false, 127), 0, 0],
      [128, new SvxForbiddenRuleItem(false, 128), 10903, 0],
      [129, new SvxHorJustifyItem(SvxCellHorJustify.Standard, 129), 11571, 0],
      [130, new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 130), 11569, 0],
      [131, new ScIndentItem(0), 10460, 0],
      [132, new SvxVerJustifyItem(SvxCellVerJustify.Standard, 132), 11572, 0],
      [133, new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 133), 11570, 0],
      [134, new ScVerticalStackCell(false), 10229, 0],
      [135, new ScRotateValueItem(0), 10577, 0],
      [136, new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_BOTTOM, 136), 10578, 0],
      [137, new SfxBoolItem(137), 10949, 0],
      [138, new SvxFrameDirectionItem(SvxFrameDirection.Environment, 138), 10944, 0],
      [139, new ScLineBreakCell(), 10230, 0],
      [140, new ScShrinkToFitCell(), 11015, 0],
      [141, new SvxLineItem(141), 11013, 0],
      [142, new SvxLineItem(142), 11014, 0],
      [143, new SvxMarginItem(143), 10228, 0],
      [144, new ScMergeAttr(), 0, 0],
      [145, new ScMergeFlagAttr(), 0, 0],
      [146, new SfxUInt32Item(146, 0), 10085, 0],
      [147, new SvxLanguageItem(ScGlobal.eLnge, 147), 0, 0],
      [148, new SvxBrushItem(COL_TRANSPARENT, 148), 10001, 1],
      [149, new ScProtectionAttr(), 26036, 0],
      [150, new SvxBoxItem(150), 10024, 0],
      [151, createGlobalBorderInnerAttr(), 10023, 0],
      [152, new SvxShadowItem(152), 10025, 0],
      [153, new SfxUInt32Item(153, 0), 0, 0],
      [154, new ScCondFormatItem(), 0, 0],
      [155, new SfxStringItem(155, ""), 0, 0],
      [156, new SvxLRSpaceItem(156), 10048, 0],
      [157, new SvxULSpaceItem(157), 10049, 0],
      [158, new SvxPageItem(158), 10050, 0],
      [159, new SvxPaperBinItem(159), 10054, 0],
      [160, new SvxSizeItem(160), 10051, 0],
      [161, new SfxBoolItem(161), 10055, 0],
      [162, new SfxBoolItem(162), 10056, 0],
      [163, new SfxBoolItem(163, true), 10059, 0],
      [164, new SfxBoolItem(164, true), 10060, 0],
      [165, new SfxBoolItem(165, true), 10061, 0],
      [166, new SfxBoolItem(166, true), 11114, 0],
      [167, new SfxBoolItem(167, false), 0, 0],
      [168, new SfxBoolItem(168, false), 0, 0],
      [169, new SfxBoolItem(169, false), 0, 0],
      [170, new ScViewObjectModeItem(170), 0, 0],
      [171, new ScViewObjectModeItem(171), 0, 0],
      [172, new ScViewObjectModeItem(172), 0, 0],
      [173, new SfxBoolItem(173, true), 0, 0],
      [174, new SfxUInt16Item(174, 100), 0, 0],
      [175, new SfxUInt16Item(175, 1), 0, 0],
      [176, new SfxUInt16Item(176, 1), 0, 0],
      [177, new ScPageHFItem(177), 0, 0],
      [178, new ScPageHFItem(178), 0, 0],
      [179, new ScPageHFItem(179), 0, 0],
      [180, new ScPageHFItem(180), 0, 0],
      [181, new ScPageHFItem(181), 0, 0],
      [182, new ScPageHFItem(182), 0, 0],
      [183, null, 10057, 0],
      [184, null, 10058, 0],
      [185, new SfxBoolItem(185, false), 0, 0],
      [186, new SfxBoolItem(186, true), 0, 0],
      [187, new ScPageScaleToItem(1, 1), 0, 0],
      [188, new SfxBoolItem(188, false), 0, 0],
    ];
    this.maItemInfos = values.map(
      /** Constructs native static metadata. @param value - Which,item,slot and flags. @returns Entry. */ ([
        which,
        item,
        slot,
        flags,
      ]) => new ItemInfoStatic(which, item, slot, flags),
    );
  }
  /** Original indexed static entry. @param index - Native index. @returns Entry. */
  protected getItemInfoStatic(index: number): ItemInfoStatic {
    return this.maItemInfos[index] as ItemInfoStatic;
  }
  /** Original complete package count. @returns Count. */
  size(): number {
    return this.maItemInfos.length;
  }
  /** Original static fast path and pool-local header/footer sets. The two native dynamic cases have identical ranges and are the only null entries after initialization,so their equal construction bodies share the original Which. @param index - Native valid index. @param pool - Actual requesting pool. @returns Actual metadata/default. */
  getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    const info = this.getItemInfoStatic(index);
    if (info.getItem() !== null) return info;
    const set = new SfxItemSet(pool, [
      [148, 148],
      [150, 152],
      [156, 157],
      [160, 160],
      [161, 166],
    ]);
    return new ItemInfoDynamic(info, new SvxSetItem(info.getWhich(), set));
  }
}
let packageScDocument: ItemInfoPackageScDocument | undefined;
/** Original lazy package accessor. @returns Process-local actual package. */
export function getItemInfoPackageScDocument(): ItemInfoPackage {
  return (packageScDocument ??= new ItemInfoPackageScDocument());
}
/** Original Calc pool construction over the complete package. Native shutdown/refcount bookkeeping is erased under GC. */
export class ScDocumentPool extends SfxItemPool {
  /** Original name and complete registration,with actual temporary string cleanup. @returns Pool. */
  constructor() {
    const name = unicode("ScDocumentPool");
    super(name);
    name.dispose();
    this.registerItemInfoPackage(getItemInfoPackageScDocument());
  }
  /** Original override deliberately creates a base SfxItemPool rather than a derived Calc pool. @returns Actual base pool copy. */
  override Clone(): SfxItemPool {
    return new SfxItemPool(this);
  }
}
