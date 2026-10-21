/** @fileoverview Source Calc/EditEngine attribute transfer,precedence,unit conversion and orientation over actual native item pools. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import * as A from "../../../inc/scitems";
import * as E from "../../../../editeng/inc/eeitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxPostureItem } from "../../../../editeng/inc/postitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import { SvxScriptSpaceItem } from "../../../../editeng/inc/scriptspaceitem";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  SvxAdjust,
  SvxCellHorJustify as H,
  SvxCellOrientation as O,
} from "../../../../editeng/inc/svxenum";
import { ScHyphenateCell, ScRotateValueItem, ScVerticalStackCell } from "../../../inc/attrib";
import { Color, COL_AUTO, COL_BLACK } from "../../../../tools/inc/color";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
/** Actual cell and edit itemset owners;EditEngine's as-yet-unported pool defaults are never invented. @returns Fixture with explicit lifetime release. */
function fixture() {
  const doc = new ScDocument(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper()),
    source = pattern.GetItemSetWritable(),
    edit = new SfxItemSet(doc.GetPool(), [[E.EE_ITEMS_START, E.EE_ITEMS_END]]),
    conditional = new SfxItemSet(doc.GetPool(), [[100, 148]]),
    table = new SfxItemSet(doc.GetPool(), [[100, 148]]);
  return {
    doc,
    pattern,
    source,
    edit,
    conditional,
    table,
    /** Releases real source owners. @returns Nothing. */ close() {
      edit.ClearItem();
      conditional.ClearItem();
      table.ClearItem();
      pattern.Dispose();
      doc.DisposeAttributes();
    },
  };
}
it("transfers all native defaults while keeping automatic color and paragraph alignment absent,and forces script spacing off", /** Exercises source output types and absent-versus-default state. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.source.Put(new SvxScriptSpaceItem(true, A.ATTR_SCRIPTSPACE));
    f.edit.Put(new SvxColorItem(new Color(0x123456), E.EE_CHAR_COLOR));
    f.pattern.FillEditItemSet(f.edit);
    expect(f.edit.GetItemState(E.EE_CHAR_COLOR)).toBe(SfxItemState.DEFAULT);
    expect(f.edit.GetItemState(E.EE_PARA_JUST)).toBe(SfxItemState.DEFAULT);
    expect(f.edit.Count()).toBe(27);
    for (const which of [
      E.EE_CHAR_FONTHEIGHT,
      E.EE_CHAR_FONTHEIGHT_CJK,
      E.EE_CHAR_FONTHEIGHT_CTL,
    ]) {
      const height = f.edit.Get(which) as SvxFontHeightItem;
      expect(height.GetHeight()).toBe(353);
      expect(height.GetProp()).toBe(100);
    }
    expect((f.edit.Get(E.EE_PARA_ASIANCJKSPACING) as SvxScriptSpaceItem).GetValue()).toBe(false);
    expect(f.edit.Get(E.EE_PARA_HYPHENATE).constructor).toBe(SfxBoolItem);
    expect((f.edit.Get(E.EE_PARA_HYPHENATE) as SfxBoolItem).GetValue()).toBe(false);
    f.pattern.FillEditItemSet(null);
    f.pattern.GetFromEditItemSet(null);
  } finally {
    f.close();
  }
});
it("preserves three independent script fonts and exact rounded units through both native directions", /** Tests independent explicit values rather than generated inverse expectations. @returns Nothing. */ () => {
  const f = fixture();
  try {
    for (const [font, height, weight, posture, name, size, bold, italic] of [
      [
        A.ATTR_FONT,
        A.ATTR_FONT_HEIGHT,
        A.ATTR_FONT_WEIGHT,
        A.ATTR_FONT_POSTURE,
        "Latin",
        201,
        FontWeight.WEIGHT_BOLD,
        FontItalic.ITALIC_NORMAL,
      ],
      [
        A.ATTR_CJK_FONT,
        A.ATTR_CJK_FONT_HEIGHT,
        A.ATTR_CJK_FONT_WEIGHT,
        A.ATTR_CJK_FONT_POSTURE,
        "中文",
        301,
        FontWeight.WEIGHT_LIGHT,
        FontItalic.ITALIC_OBLIQUE,
      ],
      [
        A.ATTR_CTL_FONT,
        A.ATTR_CTL_FONT_HEIGHT,
        A.ATTR_CTL_FONT_WEIGHT,
        A.ATTR_CTL_FONT_POSTURE,
        "عربي",
        401,
        FontWeight.WEIGHT_NORMAL,
        FontItalic.ITALIC_NONE,
      ],
    ] as const) {
      const item = (f.source.Get(font) as SvxFontItem).Clone();
      item.SetFamilyName(name);
      f.source.Put(item);
      f.source.Put(new SvxFontHeightItem(size, 175, height));
      f.source.Put(new SvxWeightItem(bold, weight));
      f.source.Put(new SvxPostureItem(italic, posture));
    }
    const complex = ComplexColor.Theme(ThemeColorType.Accent1);
    complex.addTransformation(new Transformation(TransformationType.LumMod, 7500));
    const color = new SvxColorItem(new Color(0x345678), complex, A.ATTR_FONT_COLOR),
      line = new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, A.ATTR_FONT_UNDERLINE);
    line.SetColor(new Color(0x13579b));
    f.source.Put(color);
    f.source.Put(line);
    f.source.Put(new ScHyphenateCell(true));
    ScPatternAttr.FillToEditItemSet(f.edit, f.source);
    expect(
      [E.EE_CHAR_FONTINFO, E.EE_CHAR_FONTINFO_CJK, E.EE_CHAR_FONTINFO_CTL].map(
        /** Reads genuine family names. @param id - Native identity. @returns Name. */ (id) =>
          (f.edit.Get(id) as SvxFontItem).GetFamilyName(),
      ),
    ).toEqual(["Latin", "中文", "عربي"]);
    expect(
      [E.EE_CHAR_FONTHEIGHT, E.EE_CHAR_FONTHEIGHT_CJK, E.EE_CHAR_FONTHEIGHT_CTL].map(
        /** Reads converted heights. @param id - Native identity. @returns Height. */ (id) =>
          (f.edit.Get(id) as SvxFontHeightItem).GetHeight(),
      ),
    ).toEqual([619, 928, 1236]);
    expect((f.edit.Get(E.EE_CHAR_COLOR) as SvxColorItem).getComplexColor().equals(complex)).toBe(
      true,
    );
    expect(
      (f.edit.Get(E.EE_CHAR_UNDERLINE) as SvxUnderlineItem).GetColor().equals(new Color(0x13579b)),
    ).toBe(true);
    const reverse = new ScPatternAttr(f.doc.getCellAttributeHelper());
    try {
      reverse.GetFromEditItemSet(f.edit);
      expect(
        (reverse.GetItem(A.ATTR_FONT_COLOR) as SvxColorItem).getComplexColor().equals(complex),
      ).toBe(true);
      expect(
        [A.ATTR_FONT_HEIGHT, A.ATTR_CJK_FONT_HEIGHT, A.ATTR_CTL_FONT_HEIGHT].map(
          /** Reads reverse rounded twips. @param id - Native identity. @returns Height. */ (id) =>
            (reverse.GetItem(id) as SvxFontHeightItem).GetHeight(),
        ),
      ).toEqual([351, 526, 701]);
      expect((reverse.GetItem(A.ATTR_CJK_FONT) as SvxFontItem).GetFamilyName()).toBe("中文");
      expect((reverse.GetItem(A.ATTR_CTL_FONT_WEIGHT) as SvxWeightItem).GetValue()).toBe(
        FontWeight.WEIGHT_NORMAL,
      );
      expect(reverse.GetItemSet().GetItemIfSet(A.ATTR_HYPHENATE)).toBeUndefined();
    } finally {
      reverse.Dispose();
    }
    expect(color.Which()).toBe(A.ATTR_FONT_COLOR);
    expect(line.Which()).toBe(A.ATTR_FONT_UNDERLINE);
  } finally {
    f.close();
  }
});
it("retains conditional,table and direct precedence while table posture,line and language remain ignored", /** Exercises actual SET/default distinctions and source table black special case. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.table.Put(new SvxFontHeightItem(400, 100, A.ATTR_FONT_HEIGHT));
    f.table.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, A.ATTR_FONT_WEIGHT));
    f.table.Put(new SvxPostureItem(FontItalic.ITALIC_NORMAL, A.ATTR_FONT_POSTURE));
    f.table.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLE, A.ATTR_FONT_UNDERLINE));
    f.table.Put(new SvxColorItem(new Color(0x123456), A.ATTR_FONT_COLOR));
    f.source.Put(new SvxColorItem(COL_BLACK, A.ATTR_FONT_COLOR));
    f.pattern.FillEditItemSet(f.edit, null, f.table);
    expect(
      (f.edit.Get(E.EE_CHAR_COLOR) as SvxColorItem).GetValue().equals(new Color(0x123456)),
    ).toBe(true);
    expect((f.edit.Get(E.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem).GetHeight()).toBe(706);
    expect((f.edit.Get(E.EE_CHAR_ITALIC) as SvxPostureItem).GetValue()).toBe(
      FontItalic.ITALIC_NONE,
    );
    expect((f.edit.Get(E.EE_CHAR_UNDERLINE) as SvxUnderlineItem).GetLineStyle()).toBe(
      FontLineStyle.LINESTYLE_NONE,
    );
    f.source.Put(new SvxFontHeightItem(300, 100, A.ATTR_FONT_HEIGHT));
    f.conditional.Put(new SvxFontHeightItem(500, 100, A.ATTR_FONT_HEIGHT));
    f.conditional.Put(new SvxPostureItem(FontItalic.ITALIC_OBLIQUE, A.ATTR_FONT_POSTURE));
    f.conditional.Put(new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, A.ATTR_FONT_UNDERLINE));
    f.pattern.FillEditItemSet(f.edit, f.conditional, f.table);
    expect((f.edit.Get(E.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem).GetHeight()).toBe(882);
    expect((f.edit.Get(E.EE_CHAR_ITALIC) as SvxPostureItem).GetValue()).toBe(
      FontItalic.ITALIC_OBLIQUE,
    );
    expect((f.edit.Get(E.EE_CHAR_UNDERLINE) as SvxUnderlineItem).GetLineStyle()).toBe(
      FontLineStyle.LINESTYLE_SINGLE,
    );
    f.conditional.ClearItem();
    f.pattern.FillEditItemSet(f.edit, f.conditional, f.table);
    expect((f.edit.Get(E.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem).GetHeight()).toBe(529);
    f.conditional.Put(new SvxColorItem(COL_AUTO, A.ATTR_FONT_COLOR));
    f.pattern.FillEditItemSet(f.edit, f.conditional, f.table);
    expect(f.edit.GetItemIfSet(E.EE_CHAR_COLOR)).toBeUndefined();
  } finally {
    f.close();
  }
});
it("uses inherited edit SET values but omits absent and INVALID reverse attributes,and leaves existing cell alignment for Left", /** Preserves source reverse omissions. @returns Nothing. */ () => {
  const f = fixture(),
    parent = new SfxItemSet(f.doc.GetPool(), [[E.EE_ITEMS_START, E.EE_ITEMS_END]]);
  try {
    parent.Put(new SvxFontHeightItem(353, 100, E.EE_CHAR_FONTHEIGHT));
    f.edit.SetParent(parent);
    f.edit.InvalidateItem(E.EE_CHAR_FONTHEIGHT_CJK);
    f.source.Put(new SvxHorJustifyItem(H.Right, A.ATTR_HOR_JUSTIFY));
    f.edit.Put(new SvxAdjustItem(SvxAdjust.Left, E.EE_PARA_JUST));
    ScPatternAttr.GetFromEditItemSet(f.source, f.edit);
    expect((f.source.Get(A.ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(200);
    expect(f.source.GetItemIfSet(A.ATTR_CJK_FONT_HEIGHT)).toBeUndefined();
    expect((f.source.Get(A.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(H.Right);
    for (const [input, expected] of [
      [SvxAdjust.Right, H.Right],
      [SvxAdjust.End, H.Right],
      [SvxAdjust.Block, H.Block],
      [SvxAdjust.BlockLine, H.Block],
      [SvxAdjust.Center, H.Center],
      [SvxAdjust.Left, H.Center],
    ] as const) {
      f.edit.Put(new SvxAdjustItem(input, E.EE_PARA_JUST));
      f.pattern.GetFromEditItemSet(f.edit);
      expect((f.source.Get(A.ATTR_HOR_JUSTIFY) as SvxHorJustifyItem).GetValue()).toBe(expected);
    }
  } finally {
    f.edit.SetParent(undefined);
    parent.ClearItem();
    f.close();
  }
});
it("keeps native paragraph alignment separate and reads source stacked and exact right-angle orientation", /** No arbitrary angle is coerced to an orthogonal orientation. @returns Nothing. */ () => {
  const f = fixture();
  try {
    for (const [input, expected] of [
      [H.Standard, SvxAdjust.Left],
      [H.Left, SvxAdjust.Left],
      [H.Right, SvxAdjust.Right],
      [H.Center, SvxAdjust.Center],
      [H.Block, SvxAdjust.Block],
      [H.Repeat, SvxAdjust.Left],
    ] as const) {
      f.source.Put(new SvxHorJustifyItem(input, A.ATTR_HOR_JUSTIFY));
      f.pattern.FillEditParaItems(f.edit);
      expect((f.edit.Get(E.EE_PARA_JUST) as SvxAdjustItem).GetAdjust()).toBe(expected);
    }
    for (const [angle, expected] of [
      [0, O.Standard],
      [9000, O.BottomUp],
      [27000, O.TopBottom],
      [4500, O.Standard],
    ] as const) {
      f.source.Put(new ScRotateValueItem(angle));
      expect(f.pattern.GetCellOrientation()).toBe(expected);
    }
    expect(ScPatternAttr.GetCellOrientation(f.source)).toBe(O.Standard);
    f.conditional.Put(new ScRotateValueItem(9000));
    expect(f.pattern.GetCellOrientation(f.conditional)).toBe(O.BottomUp);
    f.conditional.Put(new ScVerticalStackCell(true));
    expect(ScPatternAttr.GetCellOrientation(f.source, f.conditional)).toBe(O.Stacked);
  } finally {
    f.close();
  }
});
it("snapshots every source value before target notifications and emits original native insertion order", /** A real virtual Changed observer mutates a source item that native code already copied. @returns Nothing. */ () => {
  const f = fixture(),
    order: number[] = [];
  /** Actual item-set virtual hook;not an alternate item store. */
  class ObservedEditSet extends SfxItemSet {
    /** Records real insertion and mutates a later input after the first change. @param before - Replaced value. @param after - Inserted value. @returns Nothing. */
    protected override Changed(
      before: import("../../../../svl/inc/poolitem").SfxPoolItem | undefined,
      after: import("../../../../svl/inc/poolitem").SfxPoolItem | undefined,
    ): void {
      void before;
      if (after !== undefined) {
        order.push(after.Which());
        if (order.length === 1)
          f.source.Put(new SvxFontHeightItem(999, 100, A.ATTR_CTL_FONT_HEIGHT));
      }
    }
  }
  const edit = new ObservedEditSet(f.doc.GetPool(), [[E.EE_ITEMS_START, E.EE_ITEMS_END]]);
  try {
    f.source.Put(new SvxFontHeightItem(401, 100, A.ATTR_CTL_FONT_HEIGHT));
    f.pattern.FillEditItemSet(edit);
    expect((edit.Get(E.EE_CHAR_FONTHEIGHT_CTL) as SvxFontHeightItem).GetHeight()).toBe(707);
    expect((f.source.Get(A.ATTR_CTL_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(999);
    expect(order).toEqual([
      E.EE_CHAR_FONTINFO,
      E.EE_CHAR_FONTINFO_CJK,
      E.EE_CHAR_FONTINFO_CTL,
      E.EE_CHAR_FONTHEIGHT,
      E.EE_CHAR_FONTHEIGHT_CJK,
      E.EE_CHAR_FONTHEIGHT_CTL,
      E.EE_CHAR_WEIGHT,
      E.EE_CHAR_WEIGHT_CJK,
      E.EE_CHAR_WEIGHT_CTL,
      E.EE_CHAR_UNDERLINE,
      E.EE_CHAR_OVERLINE,
      E.EE_CHAR_WLM,
      E.EE_CHAR_STRIKEOUT,
      E.EE_CHAR_ITALIC,
      E.EE_CHAR_ITALIC_CJK,
      E.EE_CHAR_ITALIC_CTL,
      E.EE_CHAR_OUTLINE,
      E.EE_CHAR_SHADOW,
      E.EE_PARA_FORBIDDENRULES,
      E.EE_CHAR_EMPHASISMARK,
      E.EE_CHAR_RELIEF,
      E.EE_CHAR_LANGUAGE,
      E.EE_CHAR_LANGUAGE_CJK,
      E.EE_CHAR_LANGUAGE_CTL,
      E.EE_PARA_HYPHENATE,
      E.EE_PARA_WRITINGDIR,
      E.EE_PARA_ASIANCJKSPACING,
    ]);
  } finally {
    edit.ClearItem();
    f.close();
  }
});
