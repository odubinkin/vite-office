/**
 * @fileoverview Reimplements bounded SwAttrPool and SwAttrSet behavior from pinned `sw/source/core/attr/swatrset.cxx`.
 */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTabAdjust,
  SvxTabStopItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontHeightItem,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, type WhichRangesContainer } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
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
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_KEEP,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import { SwNumRuleItem } from "../para/paratr";
import { SwFormatPageDesc } from "./fmtpdsc";
import { getDefaultFontSelection, getWriterDefaultFontLanguage } from "../doc/default-font";

/** Writer-owned item pool with defaults for the currently implemented paragraph WhichIds. */
export class SwAttrPool extends SfxItemPool {
  /** Creates and registers Writer's bounded paragraph defaults. @param document - Owning Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    super();
    const device = document.GetDefaultFontDevice();
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
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      this.RegisterDefaultItem(
        new SvxFontItem(
          defaults.get(which)?.requestedFamily as string,
          which,
          defaults.get(which)?.resolvedFamily as string,
        ),
        /** Restores a font item. @param value - Persisted family. @returns Font item. */ (value) =>
          new SvxFontItem(String(value), which),
      );
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      this.RegisterDefaultItem(
        new SvxFontHeightItem(12 * 20, which),
        /** Restores a font height. @param value - Persisted twip height. @returns Font-height item. */ (
          value,
        ) => new SvxFontHeightItem(Number(value), which),
      );
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      this.RegisterDefaultItem(
        new SvxPostureItem(FontItalic.NONE, which),
        /** Restores a posture item. @param value - Persisted enum value. @returns Concrete posture item. */
        (value) => new SvxPostureItem(Number(value) as FontItalic, which),
      );
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      this.RegisterDefaultItem(
        new SvxWeightItem(FontWeight.NORMAL, which),
        /** Restores a weight item. @param value - Persisted enum value. @returns Concrete weight item. */
        (value) => new SvxWeightItem(Number(value) as FontWeight, which),
      );
    this.RegisterDefaultItem(
      new SvxUnderlineItem(FontLineStyle.NONE, RES_CHRATR_UNDERLINE),
      /** Restores an underline item. @param value - Persisted enum value. @returns Concrete underline item. */
      (value) => new SvxUnderlineItem(Number(value) as FontLineStyle, RES_CHRATR_UNDERLINE),
    );
    for (const [which, value] of [
      [RES_CHRATR_COLOR, "auto"],
      [RES_CHRATR_HIGHLIGHT, "transparent"],
    ] as const)
      this.RegisterDefaultItem(
        new SfxStringItem(which, value),
        /** Restores a string-valued compatibility item. @param stored - Persisted value. @returns String item. */
        (stored) => new SfxStringItem(which, String(stored)),
      );
    this.RegisterDefaultItem(
      new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST),
      /** Restores an adjustment item. @param value - Persisted enum value. @returns Concrete adjustment item. */
      function restoreAdjust(value): SvxAdjustItem {
        return new SvxAdjustItem(value as SvxAdjust, RES_PARATR_ADJUST);
      },
    );
    this.RegisterDefaultItem(
      new SvxTabStopItem(1, 1134, SvxTabAdjust.Default, RES_PARATR_TABSTOP),
      /** Restores Writer tab stops. @param value - Persisted stop record. @returns Tab-stop item. */
      (value) => SvxTabStopItem.FromValue(RES_PARATR_TABSTOP, value),
    );
    this.RegisterDefaultItem(
      new SvxTextLeftMarginItem(0, RES_MARGIN_TEXTLEFT),
      /** Restores a direct text-left margin. @param value - Persisted twip margin. @returns Concrete margin item. */ (
        value,
      ) => new SvxTextLeftMarginItem(Number(value), RES_MARGIN_TEXTLEFT),
    );
    this.RegisterDefaultItem(
      new SvxFirstLineIndentItem(0, RES_MARGIN_FIRSTLINE),
      /** Restores first-line indent. @param value - Persisted twips. @returns Indent item. */ (
        value,
      ) =>
        Array.isArray(value)
          ? new SvxFirstLineIndentItem(Number(value[0]), RES_MARGIN_FIRSTLINE, value[1] === 1)
          : new SvxFirstLineIndentItem(Number(value), RES_MARGIN_FIRSTLINE),
    );
    this.RegisterDefaultItem(
      new SvxRightMarginItem(0, RES_MARGIN_RIGHT),
      /** Restores right margin. @param value - Persisted twips. @returns Margin item. */ (value) =>
        new SvxRightMarginItem(Number(value), RES_MARGIN_RIGHT),
    );
    this.RegisterDefaultItem(
      new SvxULSpaceItem(0, 0, RES_UL_SPACE),
      /** Restores paragraph spacing. @param value - Persisted tuple. @returns Spacing item. */ (
        value,
      ) => {
        const tuple = value as unknown as readonly [number, number, number?];
        return new SvxULSpaceItem(Number(tuple[0]), Number(tuple[1]), RES_UL_SPACE, tuple[2] === 1);
      },
    );
    this.RegisterDefaultItem(
      new SvxLineSpacingItem(100, RES_PARATR_LINESPACING),
      /** Restores Writer line spacing. @param value - Persisted percent or rule tuple. @returns Line-spacing item. */ (
        value,
      ) => {
        if (Array.isArray(value)) {
          const [modeCode, amount, fontIndependent] = value as [number, number, number?];
          const mode = (["proportional", "fixed", "minimum", "leading"] as const)[modeCode];
          if (mode === undefined) throw new Error("Stored Writer line-spacing mode is invalid.");
          return new SvxLineSpacingItem(
            Number(amount),
            RES_PARATR_LINESPACING,
            mode,
            fontIndependent === 1,
          );
        }
        return new SvxLineSpacingItem(Number(value), RES_PARATR_LINESPACING);
      },
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
    this.RegisterDefaultItem(
      new SwFormatPageDesc(),
      /** Restores a page-style name and restart offset. @param value - Stored pair. @returns Page descriptor item. */
      (value) => {
        const pair = value as readonly [string, number];
        return new SwFormatPageDesc(pair[0], pair[1] === 0 ? undefined : pair[1]);
      },
    );
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
      new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, 0),
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

  /** Creates an independent Writer attribute set. @param includeItems - Whether direct deltas are copied. @returns Cloned Writer set. */
  public CloneAsValue(includeItems = true): SwAttrSet {
    const clone = new SwAttrSet(this.GetPool(), this.GetRanges(), this.GetParent());
    if (includeItems) clone.PutSet(this);
    return clone;
  }
}
