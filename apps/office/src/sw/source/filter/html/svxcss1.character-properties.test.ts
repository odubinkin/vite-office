/** @fileoverview Public CSS parsing creates actual pooled character/line-spacing items from original token chains, with independent native enum expectations. */
import { expect, it } from "vitest";
import * as EditEngine from "../../../../editeng/inc/editeng";
import { SvxCSS1Parser, aItemIds } from "./svxcss1";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SvxUnderlineItem, SvxOverlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxBlinkItem } from "../../../../editeng/inc/blinkitem";
import type { SvxPostureItem } from "../../../../editeng/inc/postitem";
import type { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import type { SvxCaseMapItem } from "../../../../editeng/inc/cmapitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  FontLineStyle as L,
  FontStrikeout as S,
  FontItalic as I,
  FontWeight as W,
} from "../../../../tools/inc/fontenum";
import {
  SvxCaseMap as C,
  SvxLineSpaceRule as R,
  SvxInterLineSpaceRule as IR,
} from "../../../../editeng/inc/svxenum";

/** Owns the real parser and complete EditEngine item package for one declaration. @param css - Complete declaration. @param check - Observes actual items before destruction. @returns Nothing. */
function parsed(css: string, check: (items: SfxItemSet) => void): void {
  const pool = EditEngine.CreatePool(),
    parser = new SvxCSS1Parser(pool, ""),
    items = new SfxItemSet(pool, parser.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    parser.ParseStyleOption(css, items, info);
    check(items);
  } finally {
    items.Dispose();
    parser.SourceDispose();
    pool.sendShutdownHint();
  }
}

it.each([
  ["underline", L.LINESTYLE_SINGLE, undefined, undefined, undefined],
  ["overline", undefined, L.LINESTYLE_SINGLE, undefined, undefined],
  ["line-through", undefined, undefined, S.STRIKEOUT_SINGLE, undefined],
  ["blink", undefined, undefined, undefined, true],
  ["none", L.LINESTYLE_NONE, L.LINESTYLE_NONE, S.STRIKEOUT_NONE, false],
  [
    "underline overline line-through blink",
    L.LINESTYLE_SINGLE,
    L.LINESTYLE_SINGLE,
    S.STRIKEOUT_SINGLE,
    true,
  ],
  ["underline none", L.LINESTYLE_NONE, L.LINESTYLE_NONE, S.STRIKEOUT_NONE, false],
  ["none underline", L.LINESTYLE_SINGLE, L.LINESTYLE_NONE, S.STRIKEOUT_NONE, false],
  ["overline, underline", undefined, L.LINESTYLE_SINGLE, undefined, undefined],
  ["underline 2", L.LINESTYLE_SINGLE, undefined, undefined, undefined],
] as const)(
  "applies original text-decoration chain %s",
  /** None clears the registered line owners; the original EditEngine package has no blink slot, and commas/non-word tokens stop the chain. @param value - CSS value. @param underline - Direct underline or absent. @param overline - Direct overline or absent. @param strike - Direct strikeout or absent. @param blink - Direct blink or absent. @returns Nothing. */ (
    value,
    underline,
    overline,
    strike,
    blink,
  ) => {
    parsed(
      `text-decoration: ${value}`,
      /** Reads direct items rather than inherited defaults. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        expect(
          (
            items.GetItemIfSet(aItemIds.nUnderline, false) as SvxUnderlineItem | undefined
          )?.GetValue(),
        ).toBe(underline);
        expect(
          (
            items.GetItemIfSet(aItemIds.nOverline, false) as SvxOverlineItem | undefined
          )?.GetValue(),
        ).toBe(overline);
        expect(
          (
            items.GetItemIfSet(aItemIds.nCrossedOut, false) as SvxCrossedOutItem | undefined
          )?.GetStrikeout(),
        ).toBe(strike);
        expect(
          (items.GetItemIfSet(aItemIds.nBlink, false) as SvxBlinkItem | undefined)?.GetValue(),
        ).toBeUndefined();
        if (blink !== undefined) expect(aItemIds.nBlink).toBe(0);
      },
    );
  },
);

it.each([
  ["italic small-caps", I.ITALIC_NORMAL, C.SmallCaps],
  ["normal", I.ITALIC_NONE, C.NotMapped],
  ["small-caps", undefined, C.SmallCaps],
  ["small-caps oblique", I.ITALIC_NORMAL, C.SmallCaps],
  ["italic oblique", I.ITALIC_NORMAL, undefined],
  ["normal small-caps", I.ITALIC_NONE, C.NotMapped],
  ["'italic' 'small-caps'", I.ITALIC_NORMAL, C.SmallCaps],
  ["italic, small-caps", I.ITALIC_NORMAL, undefined],
] as const)(
  "preserves original two-token font-style rules for %s",
  /** Original CSS1 handler admits legacy small-caps here and never overrides an already selected case rule. @param value - CSS value. @param posture - Direct posture or absent. @param mode - Direct case map or absent. @returns Nothing. */ (
    value,
    posture,
    mode,
  ) => {
    parsed(
      `font-style: ${value}`,
      /** Checks all script owners plus the single case item. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        for (const id of [aItemIds.nPosture, aItemIds.nPostureCJK, aItemIds.nPostureCTL])
          expect((items.GetItemIfSet(id, false) as SvxPostureItem | undefined)?.GetPosture()).toBe(
            posture,
          );
        expect(
          (
            items.GetItemIfSet(aItemIds.nCaseMap, false) as SvxCaseMapItem | undefined
          )?.GetCaseMap(),
        ).toBe(mode);
      },
    );
  },
);

it.each([
  ["400", W.WEIGHT_NORMAL],
  ["401", W.WEIGHT_BOLD],
  ["1000", W.WEIGHT_BOLD],
  ["normal", W.WEIGHT_NORMAL],
  ["lighter", W.WEIGHT_NORMAL],
  ["'bold'", W.WEIGHT_BOLD],
] as const)(
  "applies original weight threshold for %s",
  /** The source numeric boundary is strictly greater than400. @param value - CSS value. @param weight - Expected native weight. @returns Nothing. */ (
    value,
    weight,
  ) => {
    parsed(
      `font-weight: ${value}`,
      /** Checks actual western, CJK and CTL pool entries. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        for (const id of [aItemIds.nWeight, aItemIds.nWeightCJK, aItemIds.nWeightCTL])
          expect((items.GetItemIfSet(id, false) as SvxWeightItem).GetWeight()).toBe(weight);
      },
    );
  },
);

it.each([
  ["1", R.Auto, IR.Off, 100, 100],
  ["1.5", R.Auto, IR.Prop, 150, 150],
  ["150%", R.Auto, IR.Prop, 150, 150],
  ["12px", R.Min, IR.Off, 180, 100],
  ["12pt", R.Min, IR.Off, 240, 100],
] as const)(
  "creates original line-spacing rules for %s",
  /** Source absolute lengths use twips; numeric/percentage values select separate proportional rules. @param value - CSS value. @param rule - Absolute rule. @param inter - Interline rule. @param height - Stored height. @param percent - Stored proportion. @returns Nothing. */ (
    value,
    rule,
    inter,
    height,
    percent,
  ) => {
    parsed(
      `line-height: ${value}`,
      /** Reads active rules and native inactive scalar fields. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        const item = items.GetItemIfSet(aItemIds.nLineSpacing, false) as SvxLineSpacingItem;
        expect([
          item.GetLineSpaceRule(),
          item.GetInterLineSpaceRule(),
          item.GetLineHeight(),
          item.GetPropLineSpace(),
        ]).toEqual([rule, inter, height, percent]);
      },
    );
  },
);

it.each([
  ["small-caps 12pt Arial", I.ITALIC_NONE, W.WEIGHT_NORMAL, C.SmallCaps, "Arial", undefined],
  [
    "italic 500 12pt/150% 'Noto Serif', serif",
    I.ITALIC_NORMAL,
    W.WEIGHT_BOLD,
    C.NotMapped,
    "Noto Serif;serif",
    150,
  ],
  ["bold 12pt", I.ITALIC_NONE, W.WEIGHT_BOLD, C.NotMapped, undefined, undefined],
  ["12pt/1", I.ITALIC_NONE, W.WEIGHT_NORMAL, C.NotMapped, undefined, 100],
  ["12pt/1, Arial", I.ITALIC_NONE, W.WEIGHT_NORMAL, C.NotMapped, undefined, 100],
] as const)(
  "retains native font shorthand output and partial writes for %s",
  /** Defaults and size are written before the optional family check; all actual items remain inspectable. @param value - CSS shorthand. @param posture - Source posture. @param weight - Source weight. @param mode - Source case mode. @param family - Source family or absent. @param percent - Source line proportion or absent. @returns Nothing. */ (
    value,
    posture,
    weight,
    mode,
    family,
    percent,
  ) => {
    parsed(
      `font: ${value}`,
      /** Checks actual default resets and independent size conversion. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        expect((items.GetItemIfSet(aItemIds.nPosture, false) as SvxPostureItem).GetPosture()).toBe(
          posture,
        );
        expect((items.GetItemIfSet(aItemIds.nWeight, false) as SvxWeightItem).GetWeight()).toBe(
          weight,
        );
        expect((items.GetItemIfSet(aItemIds.nCaseMap, false) as SvxCaseMapItem).GetCaseMap()).toBe(
          mode,
        );
        expect(
          (items.GetItemIfSet(aItemIds.nFontHeight, false) as SvxFontHeightItem).GetHeight(),
        ).toBe(240);
        expect(
          (items.GetItemIfSet(aItemIds.nFont, false) as SvxFontItem | undefined)?.GetFamilyName(),
        ).toBe(family);
        expect(
          (
            items.GetItemIfSet(aItemIds.nLineSpacing, false) as SvxLineSpacingItem | undefined
          )?.GetPropLineSpace(),
        ).toBe(percent);
      },
    );
  },
);

it.each([
  "line-height: 0",
  "line-height: 0%",
  "line-height: normal",
  "line-height: 2147483648px",
  "font-weight: 12px",
  "font-style: 42",
  "font-variant: 'small-caps'",
  "text-transform: 'uppercase'",
  "text-align: 12",
  "color: 1",
  "font: small-caps",
])(
  "preserves the original no-write boundary for %s",
  /** Source token kinds, zero dimensions and overflow bounds must not insert a guessed default item. @param declaration - Actual CSS declaration. @returns Nothing. */ (
    declaration,
  ) => {
    parsed(
      declaration,
      /** Reads direct native item ownership. @param items - Actual set. @returns Nothing. */ (
        items,
      ) => {
        expect(items.entries()).toEqual([]);
      },
    );
  },
);

it.each([
  ["font-variant: normal", C.NotMapped],
  ["font-variant: small-caps", C.SmallCaps],
  ["text-transform: none", C.NotMapped],
  ["text-transform: uppercase", C.Uppercase],
  ["text-transform: lowercase", C.Lowercase],
  ["text-transform: capitalize", C.Capitalize],
] as const)(
  "creates the original case-map item for %s",
  /** Variant and transform share an actual native case-map owner with distinct source enum values. @param declaration - CSS declaration. @param expected - Native mapping. @returns Nothing. */ (
    declaration,
    expected,
  ) => {
    parsed(
      declaration,
      /** Reads the actual case item. @param items - Native set. @returns Nothing. */ (items) => {
        expect((items.GetItemIfSet(aItemIds.nCaseMap, false) as SvxCaseMapItem).GetCaseMap()).toBe(
          expected,
        );
      },
    );
  },
);

it("honors IgnoreFontFamily without suppressing unrelated declarations", /** The original public parser option suppresses only family assignment on the actual pool. @returns Nothing. */ () => {
  const pool = EditEngine.CreatePool(),
    parser = new SvxCSS1Parser(pool, ""),
    items = new SfxItemSet(pool, parser.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    parser.SetIgnoreFontFamily(true);
    parser.ParseStyleOption("font-family: Arial; font-weight: bold", items, info);
    expect(items.GetItemIfSet(aItemIds.nFont, false)).toBeUndefined();
    expect((items.GetItemIfSet(aItemIds.nWeight, false) as SvxWeightItem).GetWeight()).toBe(
      W.WEIGHT_BOLD,
    );
  } finally {
    items.Dispose();
    parser.SourceDispose();
    pool.sendShutdownHint();
  }
});
