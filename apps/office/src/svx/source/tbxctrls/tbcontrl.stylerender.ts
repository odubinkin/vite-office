/** @fileoverview Extracted SvxStyleBox CalcBoundRect and UserDrawEntry; actual EditEngine script analysis and device text layout remain caller-owned. */
import { Font, type ConstFont } from "../../../vcl/source/font/font";
import { Rectangle, Size, type ReadonlyPoint } from "../../../tools/inc/gen";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import { ESelection } from "../../../editeng/inc/ESelection";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Actual EditEngine GetScriptType request shape;the caller retains text ownership and initialization. */
export type StylePreviewScriptQuery = (selection: ESelection) => SvtScriptType;

/** Original CheckScript sampling and emission order,including the preceding-character caret boundary behavior. Empty text violates the source assertion and is rejected at this JS boundary. @param name - Actual style label. @param getScriptType - Actual source script query. @returns Native ScriptInfo values without advance measurements. */
export function checkStylePreviewScripts(
  name: OUStringConstReference,
  getScriptType: StylePreviewScriptQuery,
): StylePreviewScriptInfo[] {
  if (name.isEmpty()) throw new Error("Style preview requires nonempty text.");
  const changes: StylePreviewScriptInfo[] = [];
  let script = getScriptType(new ESelection(0, 0, 0, 0));
  for (let index = 1; index <= name.getLength(); ++index) {
    const next = getScriptType(new ESelection(0, index, 0, index));
    if (next !== script || index === name.getLength())
      changes.push({ scriptType: script, changePos: index, textWidth: 0 });
    script = next;
  }
  return changes;
}

/** Original ScriptInfo data; CalcBoundRect writes advance widths for the later drawing pass. */
export interface StylePreviewScriptInfo {
  textWidth: number;
  readonly scriptType: SvtScriptType;
  readonly changePos: number;
}
/** Actual optional font members populated by SetupEntry; absent members retain the render device's font. */
export interface StylePreviewFonts {
  readonly latin?: ConstFont;
  readonly asian?: ConstFont;
  readonly complex?: ConstFont;
}
/** Consumed native text-device operations, retaining the full string and UTF16 substring positions. */
export interface StylePreviewTextDevice {
  GetFont(): ConstFont;
  SetFont(font: ConstFont): void;
  GetTextBoundRect(text: string, start: number, length: number): Rectangle | undefined;
  GetTextWidth(text: string, start: number, length: number): number;
  DrawText(point: ReadonlyPoint, text: string, start: number, length: number): void;
}

/** Original exact ASIAN/COMPLEX comparisons,otherwise western font,including mixed flags. @param fonts - Actual optional members. @param script - Original script flags. @returns Selected optional font. */
function selectFont(fonts: StylePreviewFonts, script: SvtScriptType): ConstFont | undefined {
  return script === SvtScriptType.ASIAN
    ? fonts.asian
    : script === SvtScriptType.COMPLEX
      ? fonts.complex
      : fonts.latin;
}
/** Original optional-font assignment followed by integer Size scaling. @param device - Actual device. @param font - Actual optional member. @param ratio - Source fitting ratio. @returns Nothing. */
function setScaledFont(
  device: StylePreviewTextDevice,
  font: ConstFont | undefined,
  ratio: number,
): void {
  if (font !== undefined) device.SetFont(font);
  if (ratio !== 1) {
    const scaled = new Font(device.GetFont());
    scaled.SetFontSize(
      new Size(scaled.GetFontSize().Width() * ratio, scaled.GetFontHeight() * ratio),
    );
    device.SetFont(scaled);
  }
}

/** Original measurement pass unions unshifted ink rectangles and stores each run's advance separately. @param device - Actual text device. @param name - Exact style label. @param changes - Actual CheckScript output,updated with measured advances. @param fonts - Actual SetupEntry fonts. @param ratio - Optional source scaling ratio. @returns Native closed-interval ink union. */
export function calcStylePreviewBounds(
  device: StylePreviewTextDevice,
  name: string,
  changes: StylePreviewScriptInfo[],
  fonts: StylePreviewFonts,
  ratio = 1,
): Rectangle {
  const bounds = new Rectangle();
  let index = 0,
    start = 0;
  let end = changes[0]?.changePos ?? name.length;
  let script = changes[0]?.scriptType ?? SvtScriptType.LATIN;
  for (;;) {
    const saved = new Font(device.GetFont());
    try {
      setScaledFont(device, selectFont(fonts, script), ratio);
      const measured = device.GetTextBoundRect(name, start, end - start);
      if (measured !== undefined) bounds.Union(measured);
      const width = device.GetTextWidth(name, start, end - start);
      if (index >= changes.length) break;
      (changes[index] as StylePreviewScriptInfo).textWidth = width;
      index = (index + 1) & 0xffff;
      if (end < name.length && index < changes.length) {
        start = end;
        end = (changes[index] as StylePreviewScriptInfo).changePos;
        script = (changes[index] as StylePreviewScriptInfo).scriptType;
      } else break;
    } finally {
      device.SetFont(saved);
    }
  }
  return bounds;
}

/** Original drawing pass uses Bottom rather than ink height,an eight-pixel inset and individually truncated scaled advances. Empty changes violate the native unchecked-index precondition and are rejected at this JS boundary. @param device - Actual text device. @param row - Actual closed-interval item rectangle. @param textBounds - Actual measurement result. @param name - Exact style label. @param changes - Nonempty native CheckScript output with measured advances. @param fonts - Actual SetupEntry fonts. @returns Nothing. */
export function drawStylePreviewEntry(
  device: StylePreviewTextDevice,
  row: Rectangle,
  textBounds: Rectangle,
  name: string,
  changes: readonly StylePreviewScriptInfo[],
  fonts: StylePreviewFonts,
): void {
  if (changes.length === 0)
    throw new Error("Style preview drawing requires nonempty CheckScript output.");
  const position = row.TopLeft();
  position.AdjustX(8);
  let ratio = 1;
  if (textBounds.Bottom() > row.GetHeight()) ratio = row.GetHeight() / textBounds.Bottom();
  else position.AdjustY(Math.trunc((row.GetHeight() - textBounds.Bottom()) / 2));
  let index = 0,
    start = 0;
  let end = (changes[0] as StylePreviewScriptInfo).changePos;
  let script = (changes[0] as StylePreviewScriptInfo).scriptType;
  for (;;) {
    const saved = new Font(device.GetFont());
    try {
      setScaledFont(device, selectFont(fonts, script), ratio);
      device.DrawText(position, name, start, end - start);
      position.AdjustX((changes[index] as StylePreviewScriptInfo).textWidth * ratio);
      index = (index + 1) & 0xffff;
      if (end < name.length && index < changes.length) {
        start = end;
        end = (changes[index] as StylePreviewScriptInfo).changePos;
        script = (changes[index] as StylePreviewScriptInfo).scriptType;
      } else break;
    } finally {
      device.SetFont(saved);
    }
  }
}
