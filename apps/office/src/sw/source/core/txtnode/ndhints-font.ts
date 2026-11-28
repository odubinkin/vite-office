/** @fileoverview Character item deltas for font controls and sibling commands;actual automatic hint sets retain complete values. */
import { equalWriterHyperlinks } from "./fmtatr2";
import type { WriterTextRunLike } from "./ndhints";
import { SwFormatCharFormat } from "./fmtatr2";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_UNDERLINE,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { DestroyTextNodeAttribute } from "./thints-insert";
import { SwpHints } from "./ndhints";
import { CharFormat, SwAttrHandler, type SwAttributeHint } from "../text/atrstck";
import {
  createSwFormatAutoFormat,
  SwTextAttrEnd,
  SwFormatAutoFormat,
  projectWriterCharacterAttributes,
  type WriterCharacterAttributes,
} from "./txatbase";
import { assertTextRange, clipHintOutsideRange } from "./ndhints-range";
import {
  createWriterTextColorItem,
  createWriterHighlightItem,
  type SwAttrPool,
} from "../attr/swatrset";
import { MakeTextAttr } from "./thints";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { GetTextAttrAt } from "./ndtxt-attribute-query";
import { GetTextAttrMode } from "../../../inc/swtypes";
import { normalizeWriterHyperlink, SwFormatINetFormat, type WriterHyperlink } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";

/** Copies all original direct items and applies complete font values at their real boundaries. @param hints - Source ranges. @param pool - Document pool. @param textLength - Logical length. @param start - Inclusive offset. @param end - Exclusive offset. @param font - Requested five-field item. @param inherited - Node defaults. @returns Independent canonical range snapshot. */
export function setFontItem(
  hints: SwpHints,
  pool: SwAttrPool,
  textLength: number,
  start: number,
  end: number,
  font: SvxFontItem,
  inherited: SfxItemSet,
): SwpHints {
  const delta: SfxPoolItem[] = [];
  for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
    const item = font.Clone();
    item.SetWhich(which);
    delta.push(item);
  }
  return setCharacterItems(hints, pool, textLength, start, end, delta, inherited);
}

/** Creates the native item delta for the existing whole-selection toggle contract. @param format - Requested operation. @param enabled - Requested state. @returns Complete independent item values. */
export function createCharacterFormatItems(
  format: "bold" | "italic" | "underline",
  enabled: boolean,
): SfxPoolItem[] {
  const items: SfxPoolItem[] = [];
  if (format === "bold")
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      items.push(
        new SvxWeightItem(enabled ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL, which),
      );
  else if (format === "italic")
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      items.push(
        new SvxPostureItem(enabled ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE, which),
      );
  else
    items.push(
      new SvxUnderlineItem(
        enabled ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE,
        RES_CHRATR_UNDERLINE,
      ),
    );
  return items;
}

/** Creates only the original three height items,retaining the other existing attributes. @param twips - Accepted height. @returns Height delta. */
export function createFontHeightItems(twips: number): SfxPoolItem[] {
  const items: SfxPoolItem[] = [];
  for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
    items.push(new SvxFontHeightItem(twips, 100, which));
  return items;
}

/** Retains the existing Writer color request boundary without rebuilding any other item. @param property - Color role. @param value - Accepted color. @returns Single-item delta. */
export function createCharacterColorItems(
  property: "color" | "highlight",
  value: string,
): SfxPoolItem[] {
  return [
    property === "color" ? createWriterTextColorItem(value) : createWriterHighlightItem(value),
  ];
}

/** Applies actual item-set deltas at native hint boundaries without projecting unrelated values. @param hints - Original ranges. @param pool - Document pool. @param textLength - Complete logical length. @param start - Inclusive offset. @param end - Exclusive offset. @param delta - Native item changes. @param inherited - Node defaults. @param keepDirect - Preserve explicit equal-to-inherited items for native API import. @returns Independent native snapshot. */
export function setCharacterItems(
  hints: SwpHints,
  pool: SwAttrPool,
  textLength: number,
  start: number,
  end: number,
  delta: readonly SfxPoolItem[],
  inherited: SfxItemSet,
  keepDirect = false,
): SwpHints {
  assertTextRange(textLength, start, end);
  if (start === end) return new SwpHints(pool, hints.entries());
  const entries = hints.entries();
  const retained = entries.flatMap(
    /** Retains unrelated hints and portions outside the font range. @param hint - Original callback input. @returns Operation result. */ (
      hint,
    ) =>
      hint.format instanceof SwFormatAutoFormat
        ? clipHintOutsideRange(hint, start, end)
        : [hint.clone()],
  );
  const boundaries = new Set([start, end]);
  for (const hint of entries)
    if (hint.format instanceof SwFormatAutoFormat) {
      if (hint.start > start && hint.start < end) boundaries.add(hint.start);
      if (hint.end > start && hint.end < end) boundaries.add(hint.end);
    }
  const ordered = [...boundaries].sort(
    /** Orders actual text boundaries. @param a - Original callback input. @param b - Original callback input. @returns Operation result. */ (
      a,
      b,
    ) => a - b,
  );
  for (let i = 0; i + 1 < ordered.length; ++i) {
    const first = ordered[i] as number,
      last = ordered[i + 1] as number;
    const items = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
    for (const hint of entries)
      if (hint.format instanceof SwFormatAutoFormat && hint.start <= first && hint.end >= last)
        items.PutSet(hint.format.GetStyleHandle());
    for (const item of delta) {
      const which = item.Which();
      if (!keepDirect && item.equals(inherited.Get(which))) items.ClearItem(which);
      else items.Put(item);
    }
    try {
      if (items.Count() > 0) retained.push(MakeTextAttr(pool.GetDoc(), items, first, last));
    } finally {
      items.Dispose();
    }
  }
  try {
    return new SwpHints(pool, retained);
  } finally {
    for (const hint of retained) DestroyTextNodeAttribute(hint);
  }
}

/** Projects actual active native item stacks only at the existing immutable run/control boundary; the document retains named style references. @param pool - Actual Writer pool. @param hints - Native start-ordered attributes. @param position - Character position. @param inherited - Effective paragraph attributes. @returns Existing browser projection. */
export function projectCharacterHintAttributes(
  pool: SwAttrPool,
  hints: readonly SwAttributeHint[],
  position: number,
  inherited: SfxItemSet,
): WriterCharacterAttributes {
  const handler = new SwAttrHandler();
  handler.Init(inherited);
  for (const hint of hints)
    if (hint.start <= position && position < hint.end) handler.PushAndChg(hint);
  const effective = new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES);
  for (const [first, last] of WRITER_CHARACTER_WHICH_RANGES)
    for (let which = first; which <= last; which++)
      if (
        hints.some(
          /** Projects only explicitly active hint items; inherited defaults retain the existing optional boundary fields. @param hint - Actual owner. @returns Explicit membership. */
          (hint) =>
            hint.start <= position &&
            position < hint.end &&
            CharFormat.GetItem(hint, which) !== undefined,
        )
      )
        effective.Put(handler.ReadItem(which));
  try {
    return projectWriterCharacterAttributes(effective, inherited);
  } finally {
    effective.Dispose();
  }
}

/** Collects effective character item segments over one native range. @param hints - Current native hints. @param pool - Their document pool. @param textLength - Complete text length. @param start - Inclusive range start. @param end - Exclusive range end. @param inherited - Node/style items. @returns Ordered effective segments. */
export function collectCharacterSegments(
  hints: SwpHints,
  pool: SwAttrPool,
  textLength: number,
  start: number,
  end: number,
  inherited: SfxItemSet,
): readonly { attributes: WriterCharacterAttributes; start: number; end: number }[] {
  assertTextRange(textLength, start, end);
  if (start === end) return [];
  const boundaries = new Set([start, end]);
  const entries = hints.entries();
  for (const hint of entries) {
    if (
      !(hint.format instanceof SwFormatAutoFormat) &&
      !(hint.format instanceof SwFormatCharFormat)
    )
      continue;
    if (hint.start > start && hint.start < end) boundaries.add(hint.start);
    if (hint.end > start && hint.end < end) boundaries.add(hint.end);
  }
  const ordered = [...boundaries].sort(
    /** Orders native offsets. @param left - First offset. @param right - Second offset. @returns Signed ordering. */ (
      left,
      right,
    ) => left - right,
  );
  return ordered.slice(0, -1).map(
    /** Projects one effective segment. @param segmentStart - Inclusive segment start. @param index - Boundary index. @returns Effective native segment. */ (
      segmentStart,
      index,
    ) => {
      const segmentEnd = ordered[index + 1] as number;
      return {
        attributes: projectCharacterHintAttributes(pool, entries, segmentStart, inherited),
        end: segmentEnd,
        start: segmentStart,
      };
    },
  );
}

/** Copies and merges adjacent equal browser runs. @param runs - Generated runs. @returns Independent normalized runs. */
export function mergeTextRuns(runs: readonly WriterTextRunLike[]): readonly WriterTextRunLike[] {
  const merged: WriterTextRunLike[] = [];
  runs.forEach(
    /** Appends or merges one projection run. @param run - Source run. @returns Nothing. */
    (run) => {
      const copy = {
        attributes: { ...run.attributes },
        ...(run.hyperlink === undefined ? {} : { hyperlink: { ...run.hyperlink } }),
        text: run.text,
      };
      const previous = merged[merged.length - 1];
      if (
        previous !== undefined &&
        equalAttributes(previous.attributes, copy.attributes) &&
        equalWriterHyperlinks(previous.hyperlink, copy.hyperlink)
      )
        merged[merged.length - 1] = { ...previous, text: previous.text + copy.text };
      else merged.push(copy);
    },
  );
  return merged;
}

/** Compares browser character projections. @param left - First properties. @param right - Second properties. @returns Whether equal. */
function equalAttributes(
  left: WriterCharacterAttributes,
  right: WriterCharacterAttributes,
): boolean {
  return (
    left.bold === right.bold &&
    left.color === right.color &&
    left.fontFamily === right.fontFamily &&
    left.fontSizeTwips === right.fontSizeTwips &&
    left.kerningTwips === right.kerningTwips &&
    left.highlight === right.highlight &&
    left.italic === right.italic &&
    left.underline === right.underline &&
    left.underlineStyle === right.underlineStyle &&
    left.underlineColor === right.underlineColor &&
    left.underlineWordMode === right.underlineWordMode &&
    (left.strikeout ?? 0) === (right.strikeout ?? 0) &&
    (left.escapement?.offset ?? 0) === (right.escapement?.offset ?? 0) &&
    (left.escapement?.height ?? 100) === (right.escapement?.height ?? 100)
  );
}

/** Projects item-set hints into complete browser text runs. @param this - Writer text hints. @param text - Canonical node text. @param inherited - Node/style item set. @returns Complete runs. */
export function projectTextRuns(
  this: SwpHints,
  text: string,
  inherited: SfxItemSet,
): readonly WriterTextRunLike[] {
  if (text.length === 0) return [];
  const runs: WriterTextRunLike[] = [];
  const boundaries = new Set([0, text.length]);
  this.entries().forEach(
    /** Collects visible hint boundaries. @param hint - Ordered hint. @returns Nothing. */ (
      hint,
    ) => {
      boundaries.add(Math.min(text.length, hint.start));
      boundaries.add(Math.min(text.length, hint.end));
    },
  );
  const ordered = [...boundaries].sort(
    /** Orders text offsets ascending. @param left - First offset. @param right - Second offset. @returns Signed ordering. */
    (left, right) => left - right,
  );
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index] as number;
    const end = ordered[index + 1] as number;
    /* istanbul ignore next -- Unique sorted hint boundaries always increase. */
    if (end <= start) continue;
    const inet = GetTextAttrAt(this, start, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
    runs.push({
      attributes: projectCharacterHintAttributes(this["pool"], this.entries(), start, inherited),
      ...(inet?.format instanceof SwFormatINetFormat
        ? { hyperlink: inet.format.GetHyperlink() }
        : {}),
      text: text.slice(start, end),
    });
  }
  return mergeTextRuns(runs);
}

/** Reads effective attributes inherited by a caret. @param this - Writer text hints. @param text - Canonical node text. @param offset - Caret offset. @param inherited - Node/style item set. @returns Effective properties. */
export function projectCaretCharacterAttributes(
  this: SwpHints,
  text: string,
  offset: number,
  inherited: SfxItemSet,
): WriterCharacterAttributes {
  if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
    throw new Error("Writer character-format caret is outside the text node.");
  if (text.length === 0) return projectInheritedAttributes(this["pool"], inherited);
  const characterOffset = offset === 0 ? 0 : offset - 1;
  return projectCharacterHintAttributes(this["pool"], this.entries(), characterOffset, inherited);
}

/** Reads hyperlink metadata inherited by a caret. @param this - Writer text hints. @param text - Canonical node text. @param offset - Caret offset. @returns Hyperlink or undefined. */
export function projectCaretHyperlink(
  this: SwpHints,
  text: string,
  offset: number,
): WriterHyperlink | undefined {
  if (!Number.isInteger(offset) || offset < 0 || offset > text.length)
    throw new Error("Writer hyperlink caret is outside the text node.");
  if (text.length === 0) return undefined;
  const characterOffset = offset === 0 ? 0 : offset - 1;
  const hint = GetTextAttrAt(this, characterOffset, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
  return hint?.format instanceof SwFormatINetFormat ? hint.format.GetHyperlink() : undefined;
}

/** Projects inherited character defaults through the item model. @param pool - Original document attribute pool. @param inherited - Node/style set. @returns Browser properties. */
function projectInheritedAttributes(
  pool: SwAttrPool,
  inherited: SfxItemSet,
): WriterCharacterAttributes {
  return projectWriterCharacterAttributes(
    new SfxItemSet(pool, WRITER_CHARACTER_WHICH_RANGES),
    inherited,
  );
}

/** Rebuilds direct item-set hints from complete browser runs. @param this - Actual hint owner. @param runs - Complete text portions. @param inherited - Node/style item set. @returns Nothing. */
export function setTextRuns(
  this: SwpHints,
  runs: readonly WriterTextRunLike[],
  inherited: SfxItemSet,
): void {
  let offset = 0;
  const hints: (SwTextAttrEnd<SwFormatAutoFormat> | SwTextINetFormat)[] = [];
  const inheritedAttributes = projectInheritedAttributes(this["pool"], inherited);
  runs.forEach(
    /** Converts one run to a direct item-set delta. @param run - Complete run. @returns Nothing. */
    (run) => {
      const start = offset;
      offset += run.text.length;
      if (run.text.length === 0) return;
      const format = createSwFormatAutoFormat(this["pool"], run.attributes, inheritedAttributes);
      if (format.GetStyleHandle().Count() > 0) hints.push(new SwTextAttrEnd(format, start, offset));
      else format.Dispose();
      const hyperlink = normalizeWriterHyperlink(run.hyperlink);
      if (hyperlink !== undefined)
        hints.push(new SwTextINetFormat(new SwFormatINetFormat(hyperlink), start, offset));
    },
  );
  this["assignOwned"](hints, true);
}
