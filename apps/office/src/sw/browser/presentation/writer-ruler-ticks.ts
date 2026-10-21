/** @fileoverview CSS-pixel projection of original Ruler::ImplDrawTicks tick arithmetic;the actual browser supplies measured label width. */
import { type RulerUnitData, RULER_UNIT_DATA } from "../../../svtools/source/control/ruler";
import { MapToO3tlLength } from "../../../tools/inc/mapunit";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { FieldUnit } from "../../../tools/inc/fldunit";
/** Actual standalone Ruler constructor default;production receives its persistent native owner's row. */
export const DEFAULT_RULER_UNIT = RULER_UNIT_DATA[1][1];
/** Browser physical scale at the represented unzoomed 96dpi ruler. */
const TWIPS_PER_PIXEL = 15;
/** One projected native tick. */
export interface WriterRulerTick {
  readonly index: number;
  readonly position: number;
  readonly label: string;
  readonly length: number;
}
/** Reads the exact map-unit physical scale. @param data - Native table row. @returns Twips per logical map unit. */
function twipsPerUnit(data: RulerUnitData): number {
  return convert(1, MapToO3tlLength(data.eMapUnit), Length.twip);
}
/** Original unconfigured character/line-width fallbacks,until those device fields are represented. @param data - Actual native table identity. @returns Native character/line tick unit,or no override. */
function relativeUnit(data: RulerUnitData): number | undefined {
  if (
    data ===
    RULER_UNIT_DATA.find(
      /** Matches native CHAR row. @param entry - Table entry. @returns Whether matched. */ (
        entry,
      ) => entry[0] === FieldUnit.CHAR,
    )?.[1]
  )
    return 371;
  if (
    data ===
    RULER_UNIT_DATA.find(
      /** Matches native LINE row. @param entry - Table entry. @returns Whether matched. */ (
        entry,
      ) => entry[0] === FieldUnit.LINE,
    )?.[1]
  )
    return 551;
  return undefined;
}
/** Native maximum number used for actual font measurement. @param data - Native table row. @param lengthTwips - Physical page axis. @returns Maximum label text. */
export function getRulerMaximumLabel(data: RulerUnitData, lengthTwips: number): string {
  return String(
    Math.trunc(Math.abs(lengthTwips / twipsPerUnit(data)) / (relativeUnit(data) ?? data.nTickUnit)),
  );
}
/** Original fine/coarse tick physical sizes for this map mode. @param data - Native table row. @param coarse - Native coarse division. @returns Physical twips. */
export function getRulerTickTwips(data: RulerUnitData, coarse = false): number {
  return (coarse ? data.nTick2 : data.nTick1) * twipsPerUnit(data);
}
/** Projects native tick cadence,label density,acceptance delta and greater-than-six pixel stroke admission. @param data - Persistent native ruler row. @param lengthTwips - Axis extent. @param originTwips - Native null offset. @param textWidth - Actual browser width of maximum label. @param crossSize - Actual ruler cross-axis pixels. @returns Visible ticks. */
export function projectWriterRulerTicks(
  data: RulerUnitData,
  lengthTwips: number,
  originTwips: number,
  textWidth: number,
  crossSize = 32,
): readonly WriterRulerTick[] {
  const scale = twipsPerUnit(data) / TWIPS_PER_PIXEL;
  // Ruler::Resize removes two RULER_OFF regions;ImplDrawTicks receives inclusive virtual bounds.
  const largeLength = Math.trunc((crossSize - 6 - 1) * 0.5);
  const mediumLength = Math.trunc(largeLength * 0.66);
  const smallLength = Math.trunc(mediumLength * 0.66);
  const relative = relativeUnit(data);
  let major = relative === undefined ? data.nTick4 : relative * 2;
  const middle = relative ?? data.nTick3,
    minor = relative ?? data.nTick2,
    unit = relative ?? data.nTickUnit;
  let count = relative ?? data.nTick1;
  // Source measures the initial table tick4 before applying CHAR/LINE overrides.
  let pixelWidth = Math.round(data.nTick4 * scale);
  if (pixelWidth < textWidth + 4) {
    const original = Math.trunc(major);
    let multiple = 1;
    while (pixelWidth < textWidth + 4) {
      // The represented unzoomed table has no zero-width major interval.
      if (multiple < 10) multiple++;
      else if (multiple < 100) multiple += 10;
      else if (multiple < 1000) multiple += 100;
      else multiple += 1000;
      major = original * multiple;
      pixelWidth = Math.round(major * scale);
    }
    count = major;
  }
  const stepTwips = count * twipsPerUnit(data);
  const first = Math.ceil(-originTwips / stepTwips),
    last = Math.floor((lengthTwips - originTwips) / stepTwips);
  const result: WriterRulerTick[] = [];
  /** Native floating tick-multiple acceptance. @param value - Absolute logical coordinate. @param interval - Native tick spacing. @returns Whether a multiple. */
  function multipleOf(value: number, interval: number): boolean {
    const step = value / interval;
    return Math.abs(step - Math.floor(step)) < 0.0001;
  }
  for (let index = first; index <= last; index++) {
    const value = Math.abs(index * count);
    // Native Size receives an integral logical tick;positive and negative offsets share the same rounded pixel magnitude.
    const position =
      Math.round(originTwips / TWIPS_PER_PIXEL) +
      Math.sign(index) * Math.round(Math.trunc(value) * scale);
    if (index === 0 && originTwips === 0) continue;
    if (index === 0 || multipleOf(value, major)) {
      result.push({ index, position, label: String(value / unit), length: 1 });
      continue;
    }
    const large = multipleOf(value, middle),
      medium = multipleOf(value, minor);
    const interval = large ? middle : medium ? minor : count;
    if (Math.round(interval * scale) > 6)
      result.push({
        index,
        position,
        label: "",
        length: large ? largeLength : medium ? mediumLength : smallLength,
      });
  }
  return result;
}
