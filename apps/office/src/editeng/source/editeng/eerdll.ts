/** @fileoverview Original complete EditEngine static/dynamic default-item package from eerdll.cxx;consumed existing native item classes retain their explicitly documented unported services. */
import {
  ItemInfoPackage,
  ItemInfoStatic,
  ItemInfoDynamic,
  type ItemInfo,
  type SfxItemPool,
} from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SvxNumBulletItem } from "../../inc/numitem";
import * as EE from "../../inc/eeitem";
import { SvxNumRule, SvxNumRuleFlags } from "../../inc/numitem";
import { SvxFrameDirection } from "../../inc/frmdir";
import {
  SvxAdjust,
  SvxTabAdjust,
  SvxCellJustifyMethod,
  SvxCellVerJustify,
  SvxCaseMap,
} from "../../inc/svxenum";
import {
  FontWeight,
  FontLineStyle,
  FontStrikeout,
  FontItalic,
  FontEmphasisMark,
} from "../../../tools/inc/fontenum";
import { FontRelief } from "../../../vcl/inc/fntstyle";
import { COL_AUTO, COL_RED } from "../../../tools/inc/color";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxGrabBagItem } from "../../../svl/source/items/grabbagitem";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxVoidItem } from "../../../svl/source/items/voiditem";
import { SvxLRSpaceItem } from "../../inc/lrspitem";
import { SvxULSpaceItem } from "../../inc/ulspitem";
import { SvxBulletItem } from "../items/bulitem";
import { SvxFieldData, SvxFieldItem } from "../items/flditem";
import { SvxFrameDirectionItem } from "../items/frmitems.direction";
import { SvxJustifyMethodItem, SvxVerJustifyItem } from "../items/justifyitem";
import {
  SvxAutoFrameDirectionItem,
  SvxForbiddenRuleItem,
  SvxHangingPunctuationItem,
  SvxScriptSpaceItem,
} from "../items/paraitem";
import { SvxAdjustItem } from "../items/paraitem.adjust";
import { SvxLineSpacingItem } from "../items/paraitem.spacing";
import { SvxTabStopItem } from "../items/paraitem.tabs";
import { SvxRubyItem } from "../items/rubyitem";
import {
  SvxCharReliefItem,
  SvxContourItem,
  SvxOverlineItem,
  SvxPostureItem,
  SvxShadowedItem,
  SvxUnderlineItem,
  SvxWeightItem,
  SvxWordLineModeItem,
} from "../items/textitem";
import { SvxColorItem } from "../items/textitem.color";
import { SvxCrossedOutItem, SvxEmphasisMarkItem } from "../items/textitem.effects";
import { SvxEscapementItem } from "../items/textitem.escapement";
import { GetDefaultFonts, SvxFontItem } from "../items/textitem.font";
import { SvxFontHeightItem } from "../items/textitem.height";
import { SvxLanguageItem } from "../items/textitem.language";
import { SvxCaseMapItem, SvxOpticalSizingItem, SvxScriptHintItem } from "../items/textitem.modes";
import { SvxAutoKernItem, SvxCharScaleWidthItem, SvxKerningItem } from "../items/textitem.spacing";
import { SvxFontVariationsItem } from "../items/textitem.variations";
import { SvXMLAttrContainerItem } from "../items/xmlcnitm";
/** Original private package owner with lazy,once-only static defaults and a pool-local numbering default. */
class ItemInfoPackageEditEngine extends ItemInfoPackage {
  private readonly maItemInfos: ItemInfoStatic[];
  /** Original static metadata initialization followed by on-demand bullet and three-script font values. @returns Package. */
  constructor() {
    super();
    const values: readonly (readonly [number, SfxPoolItem | null, number, number])[] = [
      [
        EE.EE_PARA_WRITINGDIR,
        new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_LR_TB, EE.EE_PARA_WRITINGDIR),
        10944,
        0,
      ],
      [EE.EE_PARA_XMLATTRIBS, new SvXMLAttrContainerItem(EE.EE_PARA_XMLATTRIBS), 0, 1],
      [
        EE.EE_PARA_HANGINGPUNCTUATION,
        new SvxHangingPunctuationItem(false, EE.EE_PARA_HANGINGPUNCTUATION),
        10902,
        0,
      ],
      [
        EE.EE_PARA_FORBIDDENRULES,
        new SvxForbiddenRuleItem(true, EE.EE_PARA_FORBIDDENRULES),
        10903,
        0,
      ],
      [
        EE.EE_PARA_ASIANCJKSPACING,
        new SvxScriptSpaceItem(true, EE.EE_PARA_ASIANCJKSPACING),
        10901,
        0,
      ],
      [EE.EE_PARA_NUMBULLET, null, 10855, 0],
      [EE.EE_PARA_HYPHENATE, new SfxBoolItem(EE.EE_PARA_HYPHENATE, false), 0, 0],
      [EE.EE_PARA_HYPHENATE_NO_CAPS, new SfxBoolItem(EE.EE_PARA_HYPHENATE_NO_CAPS, false), 0, 0],
      [
        EE.EE_PARA_HYPHENATE_NO_LAST_WORD,
        new SfxBoolItem(EE.EE_PARA_HYPHENATE_NO_LAST_WORD, false),
        0,
        0,
      ],
      [EE.EE_PARA_BULLETSTATE, new SfxBoolItem(EE.EE_PARA_BULLETSTATE, true), 0, 0],
      [EE.EE_PARA_OUTLLRSPACE, new SvxLRSpaceItem(EE.EE_PARA_OUTLLRSPACE), 0, 0],
      [EE.EE_PARA_OUTLLEVEL, new SfxInt16Item(EE.EE_PARA_OUTLLEVEL, -1), 10300, 0],
      [EE.EE_PARA_BULLET, null, 10250, 0],
      [EE.EE_PARA_LRSPACE, new SvxLRSpaceItem(EE.EE_PARA_LRSPACE), 10048, 0],
      [EE.EE_PARA_ULSPACE, new SvxULSpaceItem(EE.EE_PARA_ULSPACE), 10049, 0],
      [EE.EE_PARA_SBL, new SvxLineSpacingItem(0, EE.EE_PARA_SBL), 10033, 0],
      [EE.EE_PARA_JUST, new SvxAdjustItem(SvxAdjust.ParaStart, EE.EE_PARA_JUST), 10027, 0],
      [EE.EE_PARA_TABS, new SvxTabStopItem(0, 0, SvxTabAdjust.Left, EE.EE_PARA_TABS), 10002, 0],
      [
        EE.EE_PARA_JUST_METHOD,
        new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, EE.EE_PARA_JUST_METHOD),
        11569,
        0,
      ],
      [
        EE.EE_PARA_VER_JUST,
        new SvxVerJustifyItem(SvxCellVerJustify.Standard, EE.EE_PARA_VER_JUST),
        11572,
        0,
      ],
      [
        EE.EE_PARA_AUTOWRITINGDIR,
        new SvxAutoFrameDirectionItem(true, EE.EE_PARA_AUTOWRITINGDIR),
        10946,
        0,
      ],
      [EE.EE_CHAR_COLOR, new SvxColorItem(COL_AUTO, EE.EE_CHAR_COLOR), 10017, 1],
      [EE.EE_CHAR_FONTINFO, null, 10007, 1],
      [EE.EE_CHAR_FONTHEIGHT, new SvxFontHeightItem(240, 100, EE.EE_CHAR_FONTHEIGHT), 10015, 0],
      [EE.EE_CHAR_FONTWIDTH, new SvxCharScaleWidthItem(100, EE.EE_CHAR_FONTWIDTH), 10911, 0],
      [EE.EE_CHAR_WEIGHT, new SvxWeightItem(FontWeight.WEIGHT_NORMAL, EE.EE_CHAR_WEIGHT), 10009, 0],
      [
        EE.EE_CHAR_UNDERLINE,
        new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, EE.EE_CHAR_UNDERLINE),
        10014,
        0,
      ],
      [
        EE.EE_CHAR_STRIKEOUT,
        new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, EE.EE_CHAR_STRIKEOUT),
        10013,
        0,
      ],
      [EE.EE_CHAR_ITALIC, new SvxPostureItem(FontItalic.ITALIC_NONE, EE.EE_CHAR_ITALIC), 10008, 0],
      [EE.EE_CHAR_OUTLINE, new SvxContourItem(false, EE.EE_CHAR_OUTLINE), 10012, 0],
      [EE.EE_CHAR_SHADOW, new SvxShadowedItem(false, EE.EE_CHAR_SHADOW), 10010, 0],
      [EE.EE_CHAR_ESCAPEMENT, new SvxEscapementItem(0, 100, EE.EE_CHAR_ESCAPEMENT), 10021, 0],
      [EE.EE_CHAR_PAIRKERNING, new SvxAutoKernItem(false, EE.EE_CHAR_PAIRKERNING), 10067, 0],
      [EE.EE_CHAR_KERNING, new SvxKerningItem(0, EE.EE_CHAR_KERNING), 10018, 0],
      [EE.EE_CHAR_WLM, new SvxWordLineModeItem(false, EE.EE_CHAR_WLM), 10011, 0],
      [EE.EE_CHAR_LANGUAGE, new SvxLanguageItem(LANGUAGE_DONTKNOW, EE.EE_CHAR_LANGUAGE), 10020, 0],
      [
        EE.EE_CHAR_LANGUAGE_CJK,
        new SvxLanguageItem(LANGUAGE_DONTKNOW, EE.EE_CHAR_LANGUAGE_CJK),
        10889,
        0,
      ],
      [
        EE.EE_CHAR_LANGUAGE_CTL,
        new SvxLanguageItem(LANGUAGE_DONTKNOW, EE.EE_CHAR_LANGUAGE_CTL),
        10894,
        0,
      ],
      [EE.EE_CHAR_FONTINFO_CJK, null, 10887, 1],
      [EE.EE_CHAR_FONTINFO_CTL, null, 10892, 1],
      [
        EE.EE_CHAR_FONTHEIGHT_CJK,
        new SvxFontHeightItem(240, 100, EE.EE_CHAR_FONTHEIGHT_CJK),
        10888,
        0,
      ],
      [
        EE.EE_CHAR_FONTHEIGHT_CTL,
        new SvxFontHeightItem(240, 100, EE.EE_CHAR_FONTHEIGHT_CTL),
        10893,
        0,
      ],
      [
        EE.EE_CHAR_WEIGHT_CJK,
        new SvxWeightItem(FontWeight.WEIGHT_NORMAL, EE.EE_CHAR_WEIGHT_CJK),
        10891,
        0,
      ],
      [
        EE.EE_CHAR_WEIGHT_CTL,
        new SvxWeightItem(FontWeight.WEIGHT_NORMAL, EE.EE_CHAR_WEIGHT_CTL),
        10896,
        0,
      ],
      [
        EE.EE_CHAR_ITALIC_CJK,
        new SvxPostureItem(FontItalic.ITALIC_NONE, EE.EE_CHAR_ITALIC_CJK),
        10890,
        0,
      ],
      [
        EE.EE_CHAR_ITALIC_CTL,
        new SvxPostureItem(FontItalic.ITALIC_NONE, EE.EE_CHAR_ITALIC_CTL),
        10895,
        0,
      ],
      [
        EE.EE_CHAR_EMPHASISMARK,
        new SvxEmphasisMarkItem(FontEmphasisMark.NONE, EE.EE_CHAR_EMPHASISMARK),
        10899,
        0,
      ],
      [EE.EE_CHAR_RELIEF, new SvxCharReliefItem(FontRelief.NONE, EE.EE_CHAR_RELIEF), 10920, 0],
      [EE.EE_CHAR_XMLATTRIBS, new SvXMLAttrContainerItem(EE.EE_CHAR_XMLATTRIBS), 0, 1],
      [
        EE.EE_CHAR_OVERLINE,
        new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, EE.EE_CHAR_OVERLINE),
        11568,
        0,
      ],
      [EE.EE_CHAR_CASEMAP, new SvxCaseMapItem(SvxCaseMap.NotMapped, EE.EE_CHAR_CASEMAP), 10019, 0],
      [EE.EE_CHAR_GRABBAG, new SfxGrabBagItem(EE.EE_CHAR_GRABBAG), 11142, 0],
      [EE.EE_CHAR_BKGCOLOR, new SvxColorItem(COL_AUTO, EE.EE_CHAR_BKGCOLOR), 11153, 0],
      [EE.EE_CHAR_RUBY, new SvxRubyItem(EE.EE_CHAR_RUBY), 10904, 0],
      [EE.EE_CHAR_SCRIPT_HINT, new SvxScriptHintItem(EE.EE_CHAR_SCRIPT_HINT), 10016, 0],
      [
        EE.EE_CHAR_OPTICALSIZING,
        new SvxOpticalSizingItem(false, EE.EE_CHAR_OPTICALSIZING),
        11581,
        0,
      ],
      [EE.EE_CHAR_FONTVARIATIONS, new SvxFontVariationsItem(EE.EE_CHAR_FONTVARIATIONS), 11582, 0],
      [EE.EE_FEATURE_TAB, new SfxVoidItem(EE.EE_FEATURE_TAB), 0, 0],
      [EE.EE_FEATURE_LINEBR, new SfxVoidItem(EE.EE_FEATURE_LINEBR), 0, 0],
      [EE.EE_FEATURE_NOTCONV, new SvxColorItem(COL_RED, EE.EE_FEATURE_NOTCONV), 10877, 0],
      [EE.EE_FEATURE_FIELD, new SvxFieldItem(new SvxFieldData(), EE.EE_FEATURE_FIELD), 10363, 0],
    ];
    this.maItemInfos = values.map(
      /** Constructs original static metadata. @param entry - Which,item,slot and flags. @returns Entry. */ ([
        which,
        item,
        slot,
        flags,
      ]) => new ItemInfoStatic(which, item, slot, flags),
    );
    ItemInfoPackageEditEngine.setItemAtItemInfoStatic(
      new SvxBulletItem(EE.EE_PARA_BULLET),
      this.maItemInfos[EE.EE_PARA_BULLET - EE.EE_ITEMS_START] as ItemInfoStatic,
    );
    const font = new SvxFontItem(EE.EE_CHAR_FONTINFO),
      asian = new SvxFontItem(EE.EE_CHAR_FONTINFO_CJK),
      complex = new SvxFontItem(EE.EE_CHAR_FONTINFO_CTL);
    GetDefaultFonts(font, asian, complex);
    for (const item of [font, asian, complex])
      ItemInfoPackageEditEngine.setItemAtItemInfoStatic(
        item,
        this.maItemInfos[item.Which() - EE.EE_ITEMS_START] as ItemInfoStatic,
      );
  }
  /** Original indexed static entry. @param index - Native valid index. @returns Entry. */
  protected getItemInfoStatic(index: number): ItemInfoStatic {
    return this.maItemInfos[index] as ItemInfoStatic;
  }
  /** Original complete package size. @returns Count. */
  size(): number {
    return this.maItemInfos.length;
  }
  /** Original static early return and dynamic numbering default. All other null entries are replaced by the constructor,so the remaining native Which check/fallback are entailed for every initialized valid index. @param index - Native valid index. @param pool - Original unused pool. @returns Actual metadata/default. */
  getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    void pool;
    const info = this.maItemInfos[index] as ItemInfoStatic;
    if (info.getItem() !== null) return info;
    return new ItemInfoDynamic(
      info,
      new SvxNumBulletItem(new SvxNumRule(SvxNumRuleFlags.NONE, 0, false), EE.EE_PARA_NUMBULLET),
    );
  }
}
let packageEditEngine: ItemInfoPackageEditEngine | undefined;
/** Original lazy process-local package accessor;no engine or rendering service is fabricated. @returns Actual shared package. */
export function getItemInfoPackageEditEngine(): ItemInfoPackage {
  return (packageEditEngine ??= new ItemInfoPackageEditEngine());
}
