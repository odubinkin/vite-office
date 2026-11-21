/** @fileoverview Source header/footer content page, presets and field commands. */
import * as EE from "../../../../editeng/inc/eeitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { COL_BLACK } from "../../../../tools/inc/color";
import { ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT } from "../../../inc/scitems";
import type { ScPatternAttr } from "../../core/data/patattr";
import { ESelection } from "../../../../editeng/inc/ESelection";
import {
  SvxDateField,
  SvxExtFileField,
  SvxFieldItem,
  SvxFileField,
  SvxFileFormat,
  SvxPageField,
  SvxPagesField,
  SvxTableField,
  SvxTimeField,
  type SvxFieldData,
} from "../../../../editeng/inc/flditem";
import type { SvxNumType } from "../../../../editeng/inc/svxenum";
import { EditEngine } from "../../../../editeng/inc/editeng";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScPageHFItem } from "../../../inc/attrib";
import {
  HeaderFieldText,
  ScHeaderEditEngine,
  type ScHeaderFieldData,
} from "../../core/tool/editutil";

/** Left-to-right native portion labels. */
export const headerFooterAreas = ["Left area", "Center area", "Right area"] as const;

/** Original field insert buttons and file-menu choices. */
export const headerFooterFields = {
  "Page Number": () => new SvxPageField(),
  "Number of Pages": () => new SvxPagesField(),
  "Sheet Name": () => new SvxTableField(),
  Date: () => new SvxDateField(),
  Time: () => new SvxTimeField(),
  Title: () => new SvxFileField(),
  "File Name": () => new SvxExtFileField(undefined, undefined, SvxFileFormat.NameAndExt),
  "Path/File Name": () => new SvxExtFileField(),
} satisfies Record<string, () => SvxFieldData>;

/** A browser-presented source field command. */
export type HeaderFooterField = keyof typeof headerFooterFields;

/** Makes the original field item for an EditEngine insertion. @param field - Source field choice. @returns Actual field item. */
export function MakeHeaderFooterField(field: HeaderFooterField): SvxFieldItem {
  return new SvxFieldItem(headerFooterFields[field](), EE.EE_FEATURE_FIELD, true);
}

/** One preset portion containing literal text and native fields. */
type PresetPart = string | SvxFieldItem;

/** Built-in original header/footer presets, ordered as the source combo box. */
interface Preset {
  readonly label: string;
  readonly areas: readonly [readonly PresetPart[], readonly PresetPart[], readonly PresetPart[]];
  readonly focus: number;
}

/** Actual content page with the three original rich-text engines and original item-set IO. */
export class ScHFEditPage {
  readonly areas: readonly [ScHeaderEditEngine, ScHeaderEditEngine, ScHeaderEditEngine];
  readonly presets: readonly Preset[];
  selectedPreset: number | undefined;

  /** Builds original content editors and predefined strings. @param data - View preview data. @param type - Page numbering. @param which - Source item identity. @param pattern - Original default cell pattern. @param initial - Original content. @returns Content page. */
  constructor(
    data: ScHeaderFieldData,
    type: SvxNumType,
    private readonly which: number,
    pattern: ScPatternAttr,
    initial?: ScPageHFItem,
  ) {
    this.areas = [
      new ScHeaderEditEngine(EditEngine.CreatePool(), data, type),
      new ScHeaderEditEngine(EditEngine.CreatePool(), data, type),
      new ScHeaderEditEngine(EditEngine.CreatePool(), data, type),
    ];
    for (const editor of this.areas) {
      const attributes = editor.GetEmptyItemSet().Clone(false);
      try {
        pattern.FillEditItemSet(attributes);
        for (const [from, to] of [
          [ATTR_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT],
          [ATTR_CJK_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT_CJK],
          [ATTR_CTL_FONT_HEIGHT, EE.EE_CHAR_FONTHEIGHT_CTL],
        ] as const)
          attributes.PutAsTargetWhich(pattern.GetItem(from), to);
        attributes.Put(new SvxColorItem(COL_BLACK, EE.EE_CHAR_COLOR));
        editor.SetDefaults(attributes);
      } finally {
        attributes.Dispose();
      }
    }
    const page = MakeHeaderFooterField("Page Number"),
      pages = MakeHeaderFooterField("Number of Pages");
    const sheet = MakeHeaderFooterField("Sheet Name"),
      title = MakeHeaderFooterField("Title");
    const full = MakeHeaderFooterField("Path/File Name"),
      date = MakeHeaderFooterField("Date");
    const p = "Page " + HeaderFieldText(page, data, type);
    const day = HeaderFieldText(date, data, type);
    this.presets = [
      { label: "(none)", areas: [[], [], []], focus: 0 },
      { label: p, areas: [[], ["Page ", page], []], focus: 1 },
      { label: p + " of ?", areas: [[], ["Page ", page, " of ", pages], []], focus: 1 },
      { label: data.sheet, areas: [[], [sheet], []], focus: 1 },
      {
        label: ` Confidential, ${day}, ${p}`,
        areas: [[" Confidential"], [date], ["Page ", page]],
        focus: 2,
      },
      { label: `${data.title}, ${p}`, areas: [[], [title, ", Page ", page], []], focus: 1 },
      { label: data.longName, areas: [[], [full], []], focus: 1 },
      { label: `${p}, ${data.sheet}`, areas: [[], ["Page ", page, ", ", sheet], []], focus: 1 },
      { label: `${p}, ${data.title}`, areas: [[], ["Page ", page, ", ", title], []], focus: 1 },
      { label: `${p}, ${data.longName}`, areas: [[], ["Page ", page], [full]], focus: 2 },
      { label: ` , ${p}, ${day}`, areas: [[" "], ["Page ", page], [date]], focus: 2 },
      {
        label: `Created by  , ${day}, ${p}`,
        areas: [["Created by  "], [date], ["Page ", page]],
        focus: 2,
      },
    ];
    this.selectedPreset = 0;
    this.Reset(initial);
  }

  /** Restores all three native text areas. @param value - Original item or missing content. @returns Nothing. */
  Reset(value?: ScPageHFItem): void {
    if (!value) return;
    const initial = [value.GetLeftArea(), value.GetCenterArea(), value.GetRightArea()];
    for (const [index, editor] of this.areas.entries()) {
      const copy = initial[index]?.Clone();
      if (!copy) continue;
      try {
        editor.SetTextCurrentDefaults(copy);
      } finally {
        copy.dispose();
      }
    }
    this.selectedPreset = this.WhatPreset();
  }

  /** Mirrors the preset shapes recognized by the source Reset method. @returns Original preset index or the customized entry. */
  private WhatPreset(): number | undefined {
    const read = (editor: ScHeaderEditEngine) => {
      const doc = editor.getImpl().GetEditDoc();
      const node = doc.GetObject(0);
      const prefix = node ? text(node.GetString()) : "";
      const at = (position: number) => {
        const attr = node?.GetCharAttribs().FindFeature(position);
        return attr?.GetStart() === position && attr.GetItem() instanceof SvxFieldItem
          ? (attr.GetItem() as SvxFieldItem).GetField()
          : undefined;
      };
      return {
        empty: prefix.length === 0,
        prefix,
        page: prefix === "Page \u0001" && at(5) instanceof SvxPageField,
        field: doc.Count() === 1 && prefix.length === 1 ? at(0) : undefined,
      };
    };
    const left = read(this.areas[0]),
      center = read(this.areas[1]),
      right = read(this.areas[2]);
    if (left.empty && right.empty) {
      if (center.empty) return 0;
      if (center.page) return 1;
      if (center.field instanceof SvxTableField) return 3;
      if (center.field instanceof SvxExtFileField) return 6;
    }
    if (center.field instanceof SvxDateField && right.page) {
      if (left.prefix === " Confidential") return 4;
      if (left.prefix === "Created by  ") return 11;
    }
    if (center.page && right.field instanceof SvxExtFileField && left.empty) return 9;
    if (center.page && right.field instanceof SvxDateField && left.prefix === " ") return 10;
    return undefined;
  }

  /** Applies a source preset by writing its parts as literal text and actual fields. @param index - Preset identity. @returns Area which receives focus. */
  ApplyPreset(index: number): number {
    const preset = this.presets[index];
    if (!preset) return 0;
    const empty = unicode("");
    try {
      for (const editor of this.areas) editor.SetTextCurrentDefaults(empty);
    } finally {
      empty.dispose();
    }
    for (const [region, parts] of preset.areas.entries()) {
      const editor = this.areas[region] as ScHeaderEditEngine;
      for (const part of parts) editor.Replace(ESelection.AtEnd(), part);
    }
    this.selectedPreset = index;
    return preset.focus;
  }

  /** Serializes all three original edit regions into their native page style item. @param output - Dialog result. @returns Nothing. */
  FillItemSet(output: SfxItemSet): void {
    const item = new ScPageHFItem(this.which);
    const [left, center, right] = this.areas.map((editor) => {
      const empty = editor.GetEmptyItemSet();
      for (let paragraph = 0; paragraph < editor.GetParagraphCount(); paragraph++)
        editor.SetParaAttribs(paragraph, empty);
      return editor.CreateTextObject();
    });
    if (!left || !center || !right) return;
    try {
      item.SetLeftArea(left);
      item.SetCenterArea(center);
      item.SetRightArea(right);
      output.Put(item);
    } finally {
      left.dispose();
      center.dispose();
      right.dispose();
      item.dispose();
    }
  }

  /** Disposes the three independent EditEngines. @returns Nothing. */
  Dispose(): void {
    for (const editor of this.areas) editor.Dispose();
  }
}
