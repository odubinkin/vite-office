/**
 * @fileoverview Reimplements bounded SwAttrPool and SwAttrSet behavior from pinned `sw/source/core/attr/swatrset.cxx`.
 */
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color, ColorTransparency, COL_AUTO } from "../../../../tools/inc/color";
import { SID_ATTR_CHAR_COLOR } from "../../../../editeng/inc/editids";
import {
  SID_ATTR_TABSTOP,
  SID_ATTR_LRSPACE,
  SID_ATTR_CHAR_FONT,
  SID_ATTR_CHAR_POSTURE,
  SID_ATTR_CHAR_WEIGHT,
  SID_ATTR_CHAR_STRIKEOUT,
  SID_ATTR_CHAR_UNDERLINE,
  SID_ATTR_CHAR_FONTHEIGHT,
  SID_ATTR_CHAR_CJK_FONT,
  SID_ATTR_CHAR_CJK_FONTHEIGHT,
  SID_ATTR_CHAR_CJK_POSTURE,
  SID_ATTR_CHAR_CJK_WEIGHT,
  SID_ATTR_CHAR_CTL_FONT,
  SID_ATTR_CHAR_CTL_FONTHEIGHT,
  SID_ATTR_CHAR_CTL_POSTURE,
  SID_ATTR_CHAR_CTL_WEIGHT,
} from "../../../../editeng/inc/editids";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT } from "../../../inc/hintids";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../../editeng/inc/svxenum";

import { FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxTabStopItem, SvxTabAdjust, SvxTabStop } from "../../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxIndentValue,
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import {
  SvxRightMarginItem,
  SvxULSpaceItem,
  SvxLRSpaceItem,
  SvxBoxItem,
  SvxProtectItem,
} from "../../../../editeng/source/items/frmitems";
import {
  FontLineStyle,
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, type WhichRangesContainer } from "../../../../svl/source/items/itemset";
import {
  IsDisabledItem,
  IsInvalidItem,
  type SfxPoolItem,
} from "../../../../svl/source/items/poolitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_BREAK,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_COLOR,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_UL_SPACE,
  RES_LR_SPACE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
  RES_KEEP,
  RES_LINENUMBER,
  RES_BOX,
  RES_COLLAPSING_BORDERS,
} from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import { SwNumRuleItem, SwParaConnectBorderItem } from "../para/paratr";
import { SwFormatPageDesc } from "./fmtpdsc";
import { getDefaultFontSelection, getWriterDefaultFontLanguage } from "../doc/default-font";
import { SwFormatINetFormat } from "../txtnode/fmtatr2";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwTableBoxNumFormat, SwTableBoxFormula, SwTableBoxValue } from "./cellatr";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
/** Writer-owned item pool with defaults for the currently implemented WhichIds. */
export class SwAttrPool extends SfxItemPool {
  /** Creates and registers Writer's bounded paragraph defaults. @param document - Owning Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    super();
    this.RegisterDefaultItem(
      new SvxEscapementItem(RES_CHRATR_ESCAPEMENT),
      /** Restores every stored native offset and height at the browser boundary. @param value - Complete persisted pair. @returns Actual item. */
      (value) => {
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
      },
    );
    this.RegisterDefaultItem(
      new SvxProtectItem(127),
      /** Restores the existing browser protection snapshot. @param value - Stored flags. @returns Native item. */
      (value) => {
        const item = new SvxProtectItem(127);
        if (!Array.isArray(value)) throw new Error("Stored Writer protection is invalid.");
        item.SetContentProtect(Boolean(value[0]));
        item.SetSizeProtect(Boolean(value[1]));
        item.SetPosProtect(Boolean(value[2]));
        return item;
      },
    );
    this.RegisterDefaultItem(
      new SwTableBoxNumFormat(),
      /** Restores native unsigned format bits from the signed browser scalar. @param value - Stored scalar. @returns Native item. */
      (value) => new SwTableBoxNumFormat(Number(value) >>> 0),
    );
    this.RegisterDefaultItem(
      new SwTableBoxFormula(""),
      /** Restores the detached represented formula. @param value - Stored formula. @returns Native item. */
      (value) => new SwTableBoxFormula(String(value)),
    );
    this.RegisterDefaultItem(
      new SwTableBoxValue(),
      /** Restores the represented double. @param value - Stored scalar. @returns Native item. */
      (value) => new SwTableBoxValue(Number(value)),
    );
    this.RegisterDefaultItem(new SvxLRSpaceItem(RES_LR_SPACE), undefined, SID_ATTR_LRSPACE);
    this.RegisterDefaultItem(new SwFormatFrameSize());
    this.RegisterDefaultItem(new SwFormatVertOrient());
    this.RegisterDefaultItem(new SwFormatHoriOrient());
    this.RegisterDefaultItem(
      new SwFormatLayoutSplit(),
      /** Restores the concrete table split item. @param value - Stored boolean. @returns Native item. */
      (value) => new SwFormatLayoutSplit(Boolean(value)),
    );
    this.RegisterDefaultItem(
      new SwFormatRowSplit(),
      /** Restores the concrete row split item. @param value - Stored boolean. @returns Native item. */
      (value) => new SwFormatRowSplit(Boolean(value)),
    );
    this.RegisterDefaultItem(
      new SvxBoxItem(RES_BOX),
      /** Restores the represented native box value. @param value - UNO sequence. @returns Owned item. */
      (value) => {
        const item = new SvxBoxItem(RES_BOX);
        if (!item.PutValue(value)) throw new Error("Stored Writer box is invalid.");
        return item;
      },
    );
    this.RegisterDefaultItem(
      new SfxBoolItem(RES_COLLAPSING_BORDERS, false),
      /** Restores native adjacent-border merging. @param value - Stored boolean. @returns Owned item. */
      (value) => new SfxBoolItem(RES_COLLAPSING_BORDERS, Boolean(value)),
    );
    this.RegisterDefaultItem(new SwFormatINetFormat("", ""));
    this.RegisterDefaultItem(
      new SwParaConnectBorderItem(),
      /** Restores the concrete paragraph-border connection item. @param value - Stored boolean. @returns Native item. */
      (value) => new SwParaConnectBorderItem(Boolean(value)),
    );
    const device = document.GetDefaultFontDevice();
    this.RegisterDefaultItem(
      new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, 0),
      /** Restores the pooled outline attribute. @param value - Persisted scalar. @returns Unsigned outline item. */
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
    for (const [which, slot] of [
      [RES_CHRATR_FONT, SID_ATTR_CHAR_FONT],
      [RES_CHRATR_CJK_FONT, SID_ATTR_CHAR_CJK_FONT],
      [RES_CHRATR_CTL_FONT, SID_ATTR_CHAR_CTL_FONT],
    ] as const)
      this.RegisterDefaultItem(
        new SvxFontItem(
          FontFamily.FAMILY_DONTKNOW,
          defaults.get(which)?.resolvedFamily as string,
          "",
          FontPitch.PITCH_DONTKNOW,
          RTL_TEXTENCODING_DONTKNOW,
          which,
        ),
        /** Restores every native font value field; UI family-name inputs select an unknown metadata family. @param value - Complete snapshot or UI name. @returns Font item. */ (
          value,
        ) => {
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
        },
        slot,
      );
    for (const [which, slot] of [
      [RES_CHRATR_FONTSIZE, SID_ATTR_CHAR_FONTHEIGHT],
      [RES_CHRATR_CJK_FONTSIZE, SID_ATTR_CHAR_CJK_FONTHEIGHT],
      [RES_CHRATR_CTL_FONTSIZE, SID_ATTR_CHAR_CTL_FONTHEIGHT],
    ] as const)
      this.RegisterDefaultItem(
        new SvxFontHeightItem(12 * 20, 100, which),
        /** Restores all native height/property/unit state without applying the property twice. @param value - Complete logical state. @returns Font-height item. */ (
          value,
        ) => {
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
        },
        slot,
      );
    for (const [which, slot] of [
      [RES_CHRATR_POSTURE, SID_ATTR_CHAR_POSTURE],
      [RES_CHRATR_CJK_POSTURE, SID_ATTR_CHAR_CJK_POSTURE],
      [RES_CHRATR_CTL_POSTURE, SID_ATTR_CHAR_CTL_POSTURE],
    ] as const)
      this.RegisterDefaultItem(
        new SvxPostureItem(FontItalic.ITALIC_NONE, which),
        /** Restores a posture item. @param value - Persisted enum value. @returns Concrete posture item. */
        (value) => new SvxPostureItem(Number(value) as FontItalic, which),
        slot,
      );
    for (const [which, slot] of [
      [RES_CHRATR_WEIGHT, SID_ATTR_CHAR_WEIGHT],
      [RES_CHRATR_CJK_WEIGHT, SID_ATTR_CHAR_CJK_WEIGHT],
      [RES_CHRATR_CTL_WEIGHT, SID_ATTR_CHAR_CTL_WEIGHT],
    ] as const)
      this.RegisterDefaultItem(
        new SvxWeightItem(FontWeight.WEIGHT_NORMAL, which),
        /** Restores a weight item. @param value - Persisted enum value. @returns Concrete weight item. */
        (value) => new SvxWeightItem(Number(value) as FontWeight, which),
        slot,
      );
    this.RegisterDefaultItem(
      new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_NONE, RES_CHRATR_CROSSEDOUT),
      /** Restores the complete native strikeout enum. @param value - Stored enum. @returns Item. */
      (value) => new SvxCrossedOutItem(Number(value) as FontStrikeout, RES_CHRATR_CROSSEDOUT),
      SID_ATTR_CHAR_STRIKEOUT,
    );
    this.RegisterDefaultItem(
      new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, RES_CHRATR_UNDERLINE),
      /** Restores an underline item. @param value - Persisted enum value. @returns Concrete underline item. */
      (value) => new SvxUnderlineItem(Number(value) as FontLineStyle, RES_CHRATR_UNDERLINE),
      SID_ATTR_CHAR_UNDERLINE,
    );
    this.RegisterDefaultItem(
      new SvxColorItem(RES_CHRATR_COLOR),
      createWriterTextColorItem,
      SID_ATTR_CHAR_COLOR,
    );
    this.RegisterDefaultItem(
      new SfxStringItem(RES_CHRATR_HIGHLIGHT, "transparent"),
      /** Retains the existing unported highlight compatibility boundary. @param stored - Persisted value. @returns Existing highlight item. */
      (stored) => new SfxStringItem(RES_CHRATR_HIGHLIGHT, String(stored)),
    );
    this.RegisterDefaultItem(
      new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST),
      /** Restores an adjustment item. @param value - Persisted enum value. @returns Concrete adjustment item. */
      function restoreAdjust(value): SvxAdjustItem {
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
      },
    );
    this.RegisterDefaultItem(
      new SvxTabStopItem(1, 1134, SvxTabAdjust.Default, RES_PARATR_TABSTOP),
      /** Restores Writer tab stops. @param value - Persisted stop record. @returns Tab-stop item. */
      (value) => {
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
      },
      SID_ATTR_TABSTOP,
    );
    this.RegisterDefaultItem(
      new SvxTextLeftMarginItem(RES_MARGIN_TEXTLEFT),
      /** Restores a direct text-left margin. @param value - Persisted twip margin. @returns Concrete margin item. */ (
        value,
      ) => {
        const margin = Number(value);
        if (!Number.isInteger(margin)) throw new Error("SvxTextLeftMarginItem value is invalid.");
        return new SvxTextLeftMarginItem(SvxIndentValue.twips(margin), RES_MARGIN_TEXTLEFT);
      },
    );
    this.RegisterDefaultItem(
      new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE),
      /** Restores the existing integer/automatic browser record. @param value - Legacy payload. @returns Native item. */ (
        value,
      ) => {
        const twips = Number(Array.isArray(value) ? value[0] : value);
        if (!Number.isInteger(twips)) throw new Error("SvxFirstLineIndentItem value is invalid.");
        const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(twips), RES_MARGIN_FIRSTLINE);
        item.SetAutoFirst(Array.isArray(value) && value[1] === 1);
        return item;
      },
    );
    this.RegisterDefaultItem(
      new SvxRightMarginItem(RES_MARGIN_RIGHT),
      /** Restores only the existing legacy integer scalar domain at the browser boundary. @param value - Persisted/coercible twips. @returns Native typed margin. */ (
        value,
      ) => {
        const twips = Number(value);
        if (!Number.isInteger(twips)) throw new Error("SvxRightMarginItem value is invalid.");
        return new SvxRightMarginItem(SvxIndentValue.twips(twips), RES_MARGIN_RIGHT);
      },
    );
    this.RegisterDefaultItem(
      new SvxULSpaceItem(RES_UL_SPACE),
      /** Restores paragraph spacing. @param value - Persisted tuple. @returns Spacing item. */ (
        value,
      ) => {
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
      },
    );
    this.RegisterDefaultItem(
      new SvxLineSpacingItem(200, RES_PARATR_LINESPACING),
      /** Restores original five-field browser records and prior scalar/tuple inputs at the existing pool I/O boundary. @param value - Persisted value. @returns Native item. */
      (value) => {
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
      },
      10033,
    );
    for (const which of [RES_PARATR_SPLIT, RES_KEEP, RES_LINENUMBER])
      this.RegisterDefaultItem(
        new SfxBoolItem(which, which === RES_LINENUMBER || which === RES_PARATR_SPLIT),
        /** Restores one boolean paragraph compatibility item. @param value - Persisted flag. @returns Boolean item. */
        (value) => new SfxBoolItem(which, Boolean(value)),
      );
    for (const which of [RES_PARATR_ORPHANS, RES_PARATR_WIDOWS])
      this.RegisterDefaultItem(
        new SfxInt16Item(which, 2),
        /** Restores a minimum paragraph line count. @param value - Persisted count. @returns Integer item. */
        (value) => new SfxInt16Item(which, Number(value)),
      );
    this.RegisterDefaultItem(
      new SfxInt16Item(RES_BREAK, 0),
      /** Restores pinned SvxBreak ordinal. @param value - Stored mode. @returns Break item. */
      (value) => new SfxInt16Item(RES_BREAK, Number(value)),
    );
    this.RegisterDefaultItem(new SwFormatPageDesc());
    this.RegisterDefaultItem(
      new SwNumRuleItem(),
      /** Restores a numbering-rule item. @param value - Persisted rule name. @returns Concrete rule item. */
      function restoreNumRule(value): SwNumRuleItem {
        return new SwNumRuleItem(String(value));
      },
    );
    this.RegisterDefaultItem(
      new SfxStringItem(RES_PARATR_LIST_ID, ""),
      /** Restores a list-id item. @param value - Persisted list identity. @returns Concrete string item. */
      function restoreListId(value): SfxStringItem {
        return new SfxStringItem(RES_PARATR_LIST_ID, String(value));
      },
    );
    this.RegisterDefaultItem(
      new SfxInt16Item(RES_PARATR_LIST_LEVEL, 0),
      /** Restores a list-level item. @param value - Persisted list level. @returns Concrete integer item. */
      function restoreListLevel(value): SfxInt16Item {
        return new SfxInt16Item(RES_PARATR_LIST_LEVEL, Number(value));
      },
    );
    this.RegisterDefaultItem(
      new SfxBoolItem(RES_PARATR_LIST_ISRESTART, false),
      /** Restores the list-restart flag. @param value - Persisted flag. @returns Boolean item. */ (
        value,
      ) => new SfxBoolItem(RES_PARATR_LIST_ISRESTART, Boolean(value)),
    );
    this.RegisterDefaultItem(
      new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, 1),
      /** Restores the list restart value. @param value - Persisted counter. @returns Integer item. */ (
        value,
      ) => new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, Number(value)),
    );
    this.RegisterDefaultItem(
      new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, true),
      /** Restores the list-counted flag. @param value - Persisted flag. @returns Boolean item. */ (
        value,
      ) => new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, Boolean(value)),
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
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff)
    return new SvxColorItem(
      new Color(ColorTransparency, value, "ColorTransparencyTag"),
      RES_CHRATR_COLOR,
    );
  if (value === "auto") return new SvxColorItem(COL_AUTO, RES_CHRATR_COLOR);
  if (typeof value === "string" && /^#[0-9a-f]{6}$/iu.test(value))
    return new SvxColorItem(new Color(Number.parseInt(value.slice(1), 16)), RES_CHRATR_COLOR);
  throw new Error("Writer text color value is invalid.");
}
/** Projects a real native color to the existing Writer primitive text/worker/DOM boundary. Automatic and source alpha are retained;the item itself remains native. @param item - Actual native character color. @returns Existing external color value. */
export function writerTextColorValue(item: Readonly<SvxColorItem>): string {
  const color = item.GetValue();
  if (color.equals(COL_AUTO)) return "auto";
  if (color.GetAlpha() !== 255)
    return `rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
  return `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}
