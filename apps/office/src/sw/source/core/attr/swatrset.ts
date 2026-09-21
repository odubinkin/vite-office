/**
 * @fileoverview Reimplements bounded SwAttrPool and SwAttrSet behavior from pinned `sw/source/core/attr/swatrset.cxx`.
 */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
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
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
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
} from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import { SwNumRuleItem } from "../para/paratr";
import { getDefaultFont, getWriterDefaultFontLanguage } from "../doc/default-font";

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
        getDefaultFont(device, "text", getWriterDefaultFontLanguage(locale, "western"), "western"),
      ],
      [
        RES_CHRATR_CJK_FONT,
        getDefaultFont(device, "text", getWriterDefaultFontLanguage(locale, "cjk"), "cjk"),
      ],
      [
        RES_CHRATR_CTL_FONT,
        getDefaultFont(device, "text", getWriterDefaultFontLanguage(locale, "ctl"), "ctl"),
      ],
    ]);
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      this.RegisterDefaultItem(
        new SvxFontItem(defaults.get(which) as string, which),
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
    this.RegisterDefaultItem(
      new SvxAdjustItem(SvxAdjust.ParaStart, RES_PARATR_ADJUST),
      /** Restores an adjustment item. @param value - Persisted enum value. @returns Concrete adjustment item. */
      function restoreAdjust(value): SvxAdjustItem {
        return new SvxAdjustItem(value as SvxAdjust, RES_PARATR_ADJUST);
      },
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
      ) => new SvxFirstLineIndentItem(Number(value), RES_MARGIN_FIRSTLINE),
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
        const tuple = value as unknown as readonly [number, number];
        return new SvxULSpaceItem(Number(tuple[0]), Number(tuple[1]), RES_UL_SPACE);
      },
    );
    this.RegisterDefaultItem(
      new SvxLineSpacingItem(100, RES_PARATR_LINESPACING),
      /** Restores proportional line spacing. @param value - Persisted percent. @returns Line-spacing item. */ (
        value,
      ) => new SvxLineSpacingItem(Number(value), RES_PARATR_LINESPACING),
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
