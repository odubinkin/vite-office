/**
 * @fileoverview Reimplements bounded SwAttrPool and SwAttrSet behavior from pinned `sw/source/core/attr/swatrset.cxx`.
 */
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LanguageType } from "../../../../i18nlangtag/inc/lang";

import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import { SdrItemPool } from "../../../../svx/source/svdraw/svdattr";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";

import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SvxInterLineSpaceRule, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { COL_AUTO, COL_TRANSPARENT, Color, ColorTransparency } from "../../../../tools/inc/color";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT, RES_CHRATR_ESCAPEMENT, RES_PROTECT } from "../../../inc/hintids";

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  SvxBoxItem,
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
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, type WhichRangesContainer } from "../../../../svl/source/items/itemset";
import {
  IsDisabledItem,
  IsInvalidItem,
  type SfxPoolItem,
} from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { FontFamily, FontItalic, FontPitch, FontWeight } from "../../../../tools/inc/fontenum";

import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";

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
  RES_PARATR_NUMRULE,
  RES_PARATR_ORPHANS,
  RES_PARATR_OUTLINELEVEL,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwTextGridItem } from "../../../inc/tgrditem";
import { getDefaultFontSelection, getWriterDefaultFontLanguage } from "../doc/default-font";
import type { SwDoc } from "../doc/doc";
import { SwNumRuleItem, SwParaConnectBorderItem } from "../para/paratr";

import { SwTableBoxFormula, SwTableBoxNumFormat, SwTableBoxValue } from "./cellatr";

/** Writer-owned item pool with defaults for the currently implemented WhichIds. */
export class SwAttrPool extends SfxItemPool {
  /** Creates and registers Writer's bounded paragraph defaults. @param rInfoPackage - Native module-owned attribute package. @param document - Owning Writer document. @returns Nothing. */
  public constructor(
    rInfoPackage: ItemInfoPackage,
    private readonly document: SwDoc,
  ) {
    super();
    new SdrItemPool(this);
    /** Attaches represented package entries and their existing browser restore factories; unrepresented native classes are not fabricated. @param which - Native WhichId. @param factory - Snapshot restoration. @returns Nothing. */
    const register = (which: number, factory?: SfxPoolItemFactory): void => {
      this.RegisterDefaultItem(
        rInfoPackage.getItemInfo(which - WriterWhich.RES_CHRATR_BEGIN, this),
        factory,
      );
    };
    register(WriterWhich.RES_TEXTGRID, (value) => {
      if (!Array.isArray(value) || value.length !== 11)
        throw new Error("SwTextGridItem snapshot is invalid.");
      for (const index of [0, 1, 2, 3, 4, 8])
        if (typeof value[index] !== "number" || !Number.isInteger(value[index]))
          throw new Error("SwTextGridItem scalar is invalid.");
      for (const index of [5, 6, 7, 9, 10])
        if (typeof value[index] !== "boolean") throw new Error("SwTextGridItem flag is invalid.");
      if (
        value[0] < -2147483648 ||
        value[0] > 2147483647 ||
        value[1] < -32768 ||
        value[1] > 32767 ||
        value[4] < -2147483648 ||
        value[4] > 2147483647 ||
        [2, 3, 8].some(
          /** Checks original unsigned16 fields. @param index - Field. @returns Invalid. */ (
            index,
          ) => value[index] < 0 || value[index] > 65535,
        )
      )
        throw new Error("SwTextGridItem width is invalid.");
      const item = new SwTextGridItem();
      item.SetColor(new Color(ColorTransparency, value[0] >>> 0, "ColorTransparencyTag"));
      item.SetLines(value[1]);
      item.SetBaseHeight(value[2]);
      item.SetRubyHeight(value[3]);
      item.SetGridType(value[4]);
      item.SetRubyTextBelow(value[5]);
      item.SetPrintGrid(value[6]);
      item.SetDisplayGrid(value[7]);
      item.SetBaseWidth(value[8]);
      item.SetSnapToChars(value[9]);
      item.SetSquaredMode(value[10]);
      return item;
    });
    register(RES_CHRATR_ESCAPEMENT, (value) => {
      if (
        typeof value !== "object" ||
        Array.isArray(value) ||
        !("offset" in value) ||
        !("height" in value) ||
        typeof value.offset !== "number" ||
        typeof value.height !== "number"
      )
        throw new Error("Invalid escapement item state.");
      return new SvxEscapementItem(value.offset, value.height, RES_CHRATR_ESCAPEMENT);
    });
    register(RES_PROTECT, (value) => {
      const item = new SvxProtectItem(RES_PROTECT);
      if (!Array.isArray(value)) throw new Error("Stored Writer protection is invalid.");
      item.SetContentProtect(Boolean(value[0]));
      item.SetSizeProtect(Boolean(value[1]));
      item.SetPosProtect(Boolean(value[2]));
      return item;
    });
    register(
      WriterWhich.RES_BOXATR_FORMAT,
      (value) => new SwTableBoxNumFormat(Number(value) >>> 0),
    );
    register(WriterWhich.RES_BOXATR_FORMULA, (value) => new SwTableBoxFormula(String(value)));
    register(WriterWhich.RES_BOXATR_VALUE, (value) => new SwTableBoxValue(Number(value)));
    register(RES_LR_SPACE, undefined);
    register(WriterWhich.RES_FRM_SIZE);
    register(WriterWhich.RES_VERT_ORIENT);
    register(WriterWhich.RES_HORI_ORIENT);
    register(WriterWhich.RES_LAYOUT_SPLIT, (value) => new SwFormatLayoutSplit(Boolean(value)));
    register(WriterWhich.RES_ROW_SPLIT, (value) => new SwFormatRowSplit(Boolean(value)));
    register(RES_BOX, (value) => {
      const item = new SvxBoxItem(RES_BOX);
      if (!item.PutValue(value)) throw new Error("Stored Writer box is invalid.");
      return item;
    });
    register(
      RES_COLLAPSING_BORDERS,
      (value) => new SfxBoolItem(RES_COLLAPSING_BORDERS, Boolean(value)),
    );
    register(WriterWhich.RES_TXTATR_INETFMT);
    register(WriterWhich.RES_TXTATR_CHARFMT);
    register(
      WriterWhich.RES_PARATR_CONNECT_BORDER,
      (value) => new SwParaConnectBorderItem(Boolean(value)),
    );
    const device = document.GetDefaultFontDevice();
    register(
      RES_PARATR_OUTLINELEVEL,
      (value) => new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, Number(value)),
    );
    const locale = document.GetLocale();
    const defaults = new Map([
      [
        RES_CHRATR_FONT,
        getDefaultFontSelection(
          device,
          "text",
          getWriterDefaultFontLanguage(locale, "western"),
          "western",
        ),
      ],
      [
        RES_CHRATR_CJK_FONT,
        getDefaultFontSelection(device, "text", getWriterDefaultFontLanguage(locale, "cjk"), "cjk"),
      ],
      [
        RES_CHRATR_CTL_FONT,
        getDefaultFontSelection(device, "text", getWriterDefaultFontLanguage(locale, "ctl"), "ctl"),
      ],
    ]);
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
      register(which, (value) => {
        if (typeof value === "string")
          return new SvxFontItem(
            FontFamily.FAMILY_DONTKNOW,
            value,
            "",
            FontPitch.PITCH_DONTKNOW,
            RTL_TEXTENCODING_DONTKNOW,
            which,
          );
        if (
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value) ||
          !("familyName" in value) ||
          typeof value.familyName !== "string" ||
          !("styleName" in value) ||
          typeof value.styleName !== "string" ||
          !("family" in value) ||
          typeof value.family !== "number" ||
          !("pitch" in value) ||
          typeof value.pitch !== "number" ||
          !("charSet" in value) ||
          typeof value.charSet !== "number"
        )
          throw new Error("Invalid font item state.");
        return new SvxFontItem(
          value.family,
          value.familyName,
          value.styleName,
          value.pitch,
          value.charSet,
          which,
        );
      });
      this.SetUserDefaultItem(
        new SvxFontItem(
          FontFamily.FAMILY_DONTKNOW,
          defaults.get(which)?.resolvedFamily as string,
          "",
          FontPitch.PITCH_DONTKNOW,
          RTL_TEXTENCODING_DONTKNOW,
          which,
        ),
      );
    }
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      register(which, (value) => {
        if (
          typeof value !== "object" ||
          Array.isArray(value) ||
          !("height" in value) ||
          !("prop" in value) ||
          !("propUnit" in value) ||
          typeof value.height !== "number" ||
          typeof value.prop !== "number" ||
          typeof value.propUnit !== "number"
        )
          throw new Error("Invalid font-height item state.");
        const item = new SvxFontHeightItem(value.height, 100, which);
        item.SetProp(value.prop, value.propUnit);
        return item;
      });
    for (const which of [RES_CHRATR_LANGUAGE, RES_CHRATR_CJK_LANGUAGE, RES_CHRATR_CTL_LANGUAGE])
      register(which, (value) => new SvxLanguageItem(LanguageType(Number(value)), which));
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      register(which, (value) => new SvxPostureItem(Number(value) as FontItalic, which));
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      register(which, (value) => new SvxWeightItem(Number(value) as FontWeight, which));
    register(
      RES_CHRATR_WORDLINEMODE,
      (value) => new SvxWordLineModeItem(Boolean(value), RES_CHRATR_WORDLINEMODE),
    );
    register(
      RES_CHRATR_AUTOKERN,
      (value) => new SvxAutoKernItem(Boolean(value), RES_CHRATR_AUTOKERN),
    );
    register(
      RES_CHRATR_CROSSEDOUT,
      (value) => new SvxCrossedOutItem(Number(value) as FontStrikeout, RES_CHRATR_CROSSEDOUT),
    );
    register(
      RES_CHRATR_UNDERLINE,
      (value) => new SvxUnderlineItem(Number(value) as FontLineStyle, RES_CHRATR_UNDERLINE),
    );
    register(RES_CHRATR_COLOR, createWriterTextColorItem);
    register(RES_CHRATR_HIGHLIGHT, createWriterHighlightItem);
    register(
      RES_BACKGROUND,
      (value) => new SvxBrushItem(writerColorFromPrimitive(value, "transparent"), RES_BACKGROUND),
    );
    register(RES_PARATR_ADJUST, function restoreAdjust(value): SvxAdjustItem {
      if (typeof value === "number")
        return new SvxAdjustItem(value as SvxAdjust, RES_PARATR_ADJUST);
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new Error("SvxAdjustItem value is invalid.");
      const record = value as Record<string, unknown>;
      if (
        !Number.isInteger(record.adjust) ||
        !Number.isInteger(record.lastLine) ||
        typeof record.expandSingle !== "boolean" ||
        typeof record.paragraphComposer !== "boolean" ||
        !Number.isInteger(record.wordSpacing) ||
        !Number.isInteger(record.wordSpacingMinimum) ||
        !Number.isInteger(record.wordSpacingMaximum) ||
        !Number.isInteger(record.letterSpacingMinimum) ||
        !Number.isInteger(record.letterSpacingMaximum) ||
        !Number.isInteger(record.scaleWidthMinimum) ||
        !Number.isInteger(record.scaleWidthMaximum)
      )
        throw new Error("SvxAdjustItem value is invalid.");
      const item = new SvxAdjustItem(record.adjust as SvxAdjust, RES_PARATR_ADJUST);
      item.SetLastBlock(record.lastLine as SvxAdjust);
      item.SetOneWord(record.expandSingle ? SvxAdjust.Block : SvxAdjust.Left);
      item.SetParagraphComposer(record.paragraphComposer);
      item.SetPropWordSpacing(record.wordSpacing as number);
      item.SetPropWordSpacingMinimum(record.wordSpacingMinimum as number);
      item.SetPropWordSpacingMaximum(record.wordSpacingMaximum as number);
      item.SetPropLetterSpacingMinimum(record.letterSpacingMinimum as number);
      item.SetPropLetterSpacingMaximum(record.letterSpacingMaximum as number);
      item.SetPropScaleWidthMinimum(record.scaleWidthMinimum as number);
      item.SetPropScaleWidthMaximum(record.scaleWidthMaximum as number);
      return item;
    });
    register(RES_PARATR_TABSTOP, (value) => {
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new Error("SvxTabStopItem value is invalid.");
      const record = value as Record<string, unknown>;
      if (!Array.isArray(record.stops) || !Number.isInteger(record.defaultDistance))
        throw new Error("SvxTabStopItem value is invalid.");
      const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
      item.SetDefaultDistance(record.defaultDistance as number);
      for (const entry of record.stops) {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry))
          throw new Error("SvxTabStopItem tab value is invalid.");
        const tab = entry as Record<string, unknown>;
        if (
          typeof tab.position !== "number" ||
          typeof tab.adjustment !== "number" ||
          typeof tab.decimal !== "string" ||
          typeof tab.fill !== "string"
        )
          throw new Error("SvxTabStopItem tab value is invalid.");
        const stop = new SvxTabStop(
          tab.position,
          tab.adjustment as SvxTabAdjust,
          tab.decimal,
          tab.fill,
        );
        // Stored state can contain a nul written after construction; restore the field,
        // rather than reapplying the constructor's system-decimal resolution.
        stop.GetDecimal(true)[0] = tab.decimal;
        item.Insert(stop);
      }
      return item;
    });
    register(RES_MARGIN_TEXTLEFT, (value) => {
      const margin = Number(value);
      if (!Number.isInteger(margin)) throw new Error("SvxTextLeftMarginItem value is invalid.");
      return new SvxTextLeftMarginItem(SvxIndentValue.twips(margin), RES_MARGIN_TEXTLEFT);
    });
    register(RES_MARGIN_FIRSTLINE, (value) => {
      const twips = Number(Array.isArray(value) ? value[0] : value);
      if (!Number.isInteger(twips)) throw new Error("SvxFirstLineIndentItem value is invalid.");
      const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(twips), RES_MARGIN_FIRSTLINE);
      item.SetAutoFirst(Array.isArray(value) && value[1] === 1);
      return item;
    });
    register(RES_MARGIN_RIGHT, (value) => {
      const twips = Number(value);
      if (!Number.isInteger(twips)) throw new Error("SvxRightMarginItem value is invalid.");
      return new SvxRightMarginItem(SvxIndentValue.twips(twips), RES_MARGIN_RIGHT);
    });
    register(RES_UL_SPACE, (value) => {
      if (!Array.isArray(value)) throw new Error("SvxULSpaceItem value is invalid.");
      const upper = Number(value[0]),
        lower = Number(value[1]);
      if (
        ![upper, lower].every(
          /** Preserves prior tuple numeric coercion and integer/nonnegative admission at the browser boundary. @param field - Spacing field. @returns Whether admitted. */
          (field) => Number.isInteger(field) && field >= 0,
        )
      )
        throw new Error("SvxULSpaceItem value is invalid.");
      const item = new SvxULSpaceItem(upper, lower, RES_UL_SPACE);
      item.SetContextValue(value[2] === 1);
      for (const index of [3, 4]) {
        const field = value[index];
        if (
          field !== undefined &&
          (typeof field !== "number" || !Number.isInteger(field) || field < 0 || field > 65535)
        )
          throw new Error("SvxULSpaceItem proportion is invalid.");
      }
      if (value[3] !== undefined) item.SetPropUpper(value[3] as number);
      if (value[4] !== undefined) item.SetPropLower(value[4] as number);
      return item;
    });
    register(RES_PARATR_LINESPACING, (value) => {
      const item = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        for (const name of [
          "nInterLineSpace",
          "nLineHeight",
          "nPropLineSpace",
          "eLineSpaceRule",
          "eInterLineSpaceRule",
        ]) {
          if (typeof record[name] !== "number" || !Number.isInteger(record[name]))
            throw new Error("Stored Writer line-spacing field is invalid.");
        }
        item.SetInterLineSpace(record.nInterLineSpace as number);
        item.SetLineHeight(record.nLineHeight as number);
        item.SetPropLineSpace(record.nPropLineSpace as number);
        item.SetLineSpaceRule(record.eLineSpaceRule as SvxLineSpaceRule);
        item.SetInterLineSpaceRule(record.eInterLineSpaceRule as SvxInterLineSpaceRule);
      } else {
        const mode = Array.isArray(value) ? value[0] : 0;
        const amount = Number(Array.isArray(value) ? value[1] : value);
        if (
          !Number.isInteger(amount) ||
          amount < 0 ||
          amount > 65535 ||
          ![0, 1, 2, 3].includes(Number(mode))
        )
          throw new Error("Stored Writer line-spacing mode or value is invalid.");
        if (mode === 0) item.SetPropLineSpace(amount);
        else if (mode === 3) item.SetInterLineSpace(amount);
        else {
          item.SetLineHeight(amount);
          if (mode === 1) item.SetLineSpaceRule(SvxLineSpaceRule.Fix);
        }
      }
      return item;
    });
    for (const which of [RES_PARATR_SPLIT, RES_KEEP, RES_LINENUMBER])
      register(which, (value) => new SfxBoolItem(which, Boolean(value)));
    for (const which of [RES_PARATR_ORPHANS, RES_PARATR_WIDOWS]) {
      register(which, (value) => new SfxInt16Item(which, Number(value)));
      this.SetUserDefaultItem(new SfxInt16Item(which, 2));
    }
    register(RES_BREAK, (value) => new SfxInt16Item(RES_BREAK, Number(value)));
    register(WriterWhich.RES_PAGEDESC);
    register(WriterWhich.RES_PARATR_NUMRULE, function restoreNumRule(value): SwNumRuleItem {
      return new SwNumRuleItem(String(value));
    });
    register(RES_PARATR_LIST_ID, function restoreListId(value): SfxStringItem {
      return new SfxStringItem(RES_PARATR_LIST_ID, String(value));
    });
    register(RES_PARATR_LIST_LEVEL, function restoreListLevel(value): SfxInt16Item {
      return new SfxInt16Item(RES_PARATR_LIST_LEVEL, Number(value));
    });
    register(
      RES_PARATR_LIST_ISRESTART,
      (value) => new SfxBoolItem(RES_PARATR_LIST_ISRESTART, Boolean(value)),
    );
    register(
      RES_PARATR_LIST_RESTARTVALUE,
      (value) => new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, Number(value)),
    );
    register(
      RES_PARATR_LIST_ISCOUNTED,
      (value) => new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, Boolean(value)),
    );
  }

  /** Returns the document that owns this Writer attribute pool. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.document;
  }
}

/** Writer-specialized item set with typed paragraph accessors. */
export class SwAttrSet extends SfxItemSet {
  private m_pOldSet: SwAttrSet | undefined;
  private m_pNewSet: SwAttrSet | undefined;

  /** Records effective old and new values for native broadcast deltas. @param oldItem - Previous direct entry. @param newItem - Replacement entry. @returns Nothing. */
  protected override Changed(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
  ): void {
    if (this.m_pOldSet === undefined && this.m_pNewSet === undefined) return;
    if (
      IsInvalidItem(oldItem) ||
      IsDisabledItem(oldItem) ||
      IsInvalidItem(newItem) ||
      IsDisabledItem(newItem)
    )
      return;
    const which = (oldItem ?? (newItem as SfxPoolItem)).Which();
    if (!SfxItemPool.IsWhich(which)) return;
    if (this.m_pOldSet !== undefined)
      this.m_pOldSet.Put(
        oldItem ?? this.GetParent()?.Get(which) ?? this.GetPool().GetUserOrPoolDefaultItem(which),
      );
    if (this.m_pNewSet !== undefined)
      this.m_pNewSet.Put(
        newItem ?? this.GetParent()?.Get(which) ?? this.GetPool().GetUserOrPoolDefaultItem(which),
      );
  }

  /** Stores an item or set while collecting native old/new broadcast deltas. @param itemOrSet - Source item or set. @param oldSet - Optional old-state receiver. @param newSet - Optional new-state receiver. @returns Whether direct storage changed. */
  public Put_BC(
    itemOrSet: SfxPoolItem | SfxItemSet,
    oldSet?: SwAttrSet,
    newSet?: SwAttrSet,
  ): boolean {
    this.m_pOldSet = oldSet;
    this.m_pNewSet = newSet;
    const changed =
      "Which" in itemOrSet ? super.Put(itemOrSet) !== undefined : super.PutSet(itemOrSet);
    this.m_pOldSet = this.m_pNewSet = undefined;
    return changed;
  }

  /** Clears one WhichId with broadcast deltas. @param which - Item identity, or zero for all. @param oldSet - Optional old-state receiver. @param newSet - Optional new-state receiver. @returns Removed entry count. */
  public ClearItem_BC(which: number, oldSet?: SwAttrSet, newSet?: SwAttrSet): number;
  /** Clears an inclusive range with broadcast deltas. @param first - First identity. @param last - Last identity. @param oldSet - Optional old-state receiver. @param newSet - Optional new-state receiver. @returns Removed entry count. */
  public ClearItem_BC(first: number, last: number, oldSet?: SwAttrSet, newSet?: SwAttrSet): number;
  /** Implements the native single and range clear overloads. @param first - First WhichId. @param lastOrOld - Last WhichId or old-state receiver. @param oldOrNew - Old-state or new-state receiver. @param newSet - Range new-state receiver. @returns Removed entry count. */
  public ClearItem_BC(
    first: number,
    lastOrOld?: number | SwAttrSet,
    oldOrNew?: SwAttrSet,
    newSet?: SwAttrSet,
  ): number {
    const range = typeof lastOrOld === "number";
    this.m_pOldSet = range ? oldOrNew : lastOrOld;
    this.m_pNewSet = range ? newSet : oldOrNew;
    let count = 0;
    if (range) {
      for (let which = first; which <= lastOrOld; which++) count += super.ClearItem(which);
    } else count = super.ClearItem(first);
    this.m_pOldSet = this.m_pNewSet = undefined;
    return count;
  }

  /** Creates a Writer attribute set. @param pool - Owning Writer pool. @param ranges - Accepted WhichId ranges. @param parent - Optional inherited set. @returns Nothing. */
  public constructor(pool: SwAttrPool, ranges: WhichRangesContainer, parent?: SfxItemSet) {
    super(pool, ranges, parent);
  }

  /** Returns the Writer pool. @returns Owning SwAttrPool. */
  public override GetPool(): SwAttrPool {
    return super.GetPool() as SwAttrPool;
  }

  /** Returns the Writer document through the pool. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.GetPool().GetDoc();
  }

  /** Returns the effective paragraph adjustment item. @param inParent - Whether style inheritance participates. @returns Adjustment item. */
  public GetAdjust(inParent = true): SvxAdjustItem {
    return this.Get(RES_PARATR_ADJUST, inParent) as SvxAdjustItem;
  }

  /** Returns the effective Western posture item. @param inParent - Whether inheritance participates. @returns Posture item. */
  public GetPosture(inParent = true): SvxPostureItem {
    return this.Get(RES_CHRATR_POSTURE, inParent) as SvxPostureItem;
  }

  /** Returns the effective underline item. @param inParent - Whether inheritance participates. @returns Underline item. */
  public GetUnderline(inParent = true): SvxUnderlineItem {
    return this.Get(RES_CHRATR_UNDERLINE, inParent) as SvxUnderlineItem;
  }

  /** Returns the effective Western weight item. @param inParent - Whether inheritance participates. @returns Weight item. */
  public GetWeight(inParent = true): SvxWeightItem {
    return this.Get(RES_CHRATR_WEIGHT, inParent) as SvxWeightItem;
  }

  /** Returns the effective numbering-rule item. @param inParent - Whether style inheritance participates. @returns Numbering-rule item. */
  public GetNumRule(inParent = true): SwNumRuleItem {
    return this.Get(RES_PARATR_NUMRULE, inParent) as SwNumRuleItem;
  }

  /** Clones with the pinned Writer subtype and destination-pool branches. @param includeItems - Whether same-pool or generic-pool clones copy direct items. @param pool - Destination pool. @returns Independent item set. */
  public override Clone(includeItems = true, pool: SfxItemPool = this.GetPool()): SfxItemSet {
    if (pool === this.GetPool()) return this.CloneAsValue(includeItems);
    // The pinned foreign Writer-pool branch iterates the newly created empty destination.
    if (pool instanceof SwAttrPool) return new SwAttrSet(pool, this.GetRanges());
    return super.Clone(includeItems, pool);
  }

  /** Creates an independent Writer attribute set. @param includeItems - Whether direct deltas are copied. @returns Cloned Writer set. */
  public override CloneAsValue(includeItems = true): SwAttrSet {
    const clone = new SwAttrSet(
      this.GetPool(),
      this.GetRanges(),
      includeItems ? this.GetParent() : undefined,
    );
    if (includeItems) this.CopyItemsTo(clone);
    return clone;
  }
}

/** Converts only the existing validated Writer hex/automatic request and legacy worker values to the real native color item. New worker values retain the full packed transparency word. This is a compatibility boundary,not an alternate core color class. @param value - Existing request/transfer value. @returns Native Writer color item. */
export function createWriterTextColorItem(value: unknown): SvxColorItem {
  return new SvxColorItem(writerColorFromPrimitive(value, "auto"), RES_CHRATR_COLOR);
}
/** Projects a real native color to the existing Writer primitive text/worker/DOM boundary. Automatic and source alpha are retained;the item itself remains native. @param item - Actual native character color. @returns Existing external color value. */
export function writerTextColorValue(item: Readonly<SvxColorItem>): string {
  const color = item.GetValue();
  if (color.equals(COL_AUTO)) return "auto";
  if (color.GetAlpha() !== 255)
    return `rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
  return `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Converts the Writer highlight request or full packed worker color to its native brush item. @param value - Requested or persisted color. @returns Native highlight item. */
export function createWriterHighlightItem(value: unknown): SvxBrushItem {
  return new SvxBrushItem(writerColorFromPrimitive(value, "transparent"), RES_CHRATR_HIGHLIGHT);
}

/** Decodes the existing Writer request and worker color forms to one native value. @param value - Primitive boundary value. @param automatic - Applicable automatic marker. @returns Full native color. */
export function writerColorFromPrimitive(value: unknown, automatic: "auto" | "transparent"): Color {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff)
    return new Color(ColorTransparency, value, "ColorTransparencyTag");
  if (value === automatic) return new Color(automatic === "auto" ? COL_AUTO : COL_TRANSPARENT);
  if (typeof value === "string" && /^#[0-9a-f]{6}$/iu.test(value))
    return new Color(Number.parseInt(value.slice(1), 16));
  if (typeof value === "string") {
    const rgba = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (\d*\.?\d+)\)$/u.exec(value);
    if (rgba !== null) {
      const red = Number(rgba[1]),
        green = Number(rgba[2]),
        blue = Number(rgba[3]);
      const alpha = Number(rgba[4]);
      if (
        [red, green, blue].every(
          /** Computes the channel result. @param channel - Channel. @returns The computed result. */ (
            channel,
          ) => Number.isInteger(channel) && channel <= 255,
        ) &&
        alpha >= 0 &&
        alpha <= 1
      ) {
        const color = new Color(red, green, blue);
        color.SetAlpha(Math.round(alpha * 255));
        return color;
      }
    }
  }
  throw new Error(`Writer ${automatic === "auto" ? "text" : "highlight"} color value is invalid.`);
}

/** Projects a native highlight brush to the Writer text/worker/DOM boundary. @param item - Actual highlight item. @returns Primitive color. */
export function writerHighlightColorValue(item: Readonly<SvxBrushItem>): string {
  const color = item.GetColor();
  if (color.equals(COL_TRANSPARENT)) return "transparent";
  if (color.GetAlpha() !== 255)
    return `rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
  return `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

import * as WriterWhich from "../../../inc/hintids";
import type { ItemInfoPackage, SfxPoolItemFactory } from "../../../../svl/source/items/itempool";
