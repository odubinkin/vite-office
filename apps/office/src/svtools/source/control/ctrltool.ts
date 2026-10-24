/** @fileoverview Original FontList scalable-size resource and consumed family lookup from ctrltool.cxx; physical device enumeration remains browser-owned. */
import { Font, type ConstFont } from "../../../vcl/source/font/font";
import { FontWeight } from "../../../tools/inc/fontenum";
import { rtl_ustr_compare_WithLength } from "../../../sal/rtl/ustring";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";

const aStdSizeAry = Object.freeze([
  60, 70, 80, 90, 100, 105, 110, 120, 130, 140, 150, 160, 180, 200, 210, 220, 240, 260, 280, 320,
  360, 400, 420, 440, 480, 540, 600, 660, 720, 800, 880, 960, 0,
]);
/** Consumed original static FontList resource; no output device or font service is supplied here. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static FontList resource boundary without fabricating its device service.
export class FontList {
  /** Original zero-terminated scalable sizes in tenths of a point. @returns Borrowed immutable resource. */
  static GetStdSizeAry(): readonly number[] {
    return aStdSizeAry;
  }
}

/** Original ImplMakeSearchString uses ASCII folding only. @param name - Exact family or alias spelling. @returns Native search key. */
export function makeFontListSearchString(name: string): string {
  return name.replace(
    /[A-Z]/g,
    /** Folds one ASCII uppercase unit without locale normalization. @param unit - Original unit. @returns Lowercase unit. */ (
      unit,
    ) => unit.toLowerCase(),
  );
}

/** Original ImplMakeSearchStringFromName uses a feature colon only before the alternate-family separator; it does not trim names or search subsequent alternatives. @param name - Exact family expression. @returns Native family search key. */
export function makeFontListSearchStringFromName(name: string): string {
  const colon = name.indexOf(":"),
    semicolon = name.indexOf(";");
  const separator = colon >= 0 && (semicolon < 0 || colon < semicolon) ? colon : semicolon;
  return makeFontListSearchString(separator < 0 ? name : name.slice(0, separator));
}

/** Original read-only ImplFind lookup over sorted, unique native search keys. The source insertion-point out parameter is not part of this consumed operation. @param keys - Actual sorted family keys. @param key - Already prepared source key. @returns Matching family key or no entry. */
function findFontListKey(keys: readonly string[], key: string): string | undefined {
  if (keys.length === 0) return undefined;
  const last = keys[keys.length - 1] as string;
  if (key > last) return undefined;
  if (key === last) return last;
  let low = 0,
    high = keys.length - 1;
  do {
    const middle = Math.trunc((low + high) / 2),
      candidate = keys[middle] as string;
    if (key < candidate) {
      if (middle === 0) break;
      high = middle - 1;
    } else if (key > candidate) low = middle + 1;
    else return candidate;
  } while (low <= high);
  return undefined;
}

/** Original device alias insert_or_assign normalization; later entries overwrite earlier ASCII-equivalent aliases without stripping feature/alternate text. @param entries - Actual device aliases. @returns Independent normalized alias map. */
export function makeFontListAliases(
  entries: Iterable<readonly [string, string]>,
): ReadonlyMap<string, string> {
  const aliases = new Map<string, string>();
  for (const [alias, target] of entries)
    aliases.set(makeFontListSearchString(alias), makeFontListSearchString(target));
  return aliases;
}

/** Original ImplFindByName checks a real family before one alias hop. No alias chaining or fallback-family resolution is introduced. @param keys - Actual sorted physical-family keys. @param aliases - Actual normalized device aliases. @param name - Exact requested expression. @returns Matching actual family key or absence. */
export function findFontListFamily(
  keys: readonly string[],
  aliases: ReadonlyMap<string, string>,
  name: string,
): string | undefined {
  const key = makeFontListSearchStringFromName(name);
  const direct = findFontListKey(keys, key);
  if (direct !== undefined) return direct;
  const alias = aliases.get(key);
  return alias === undefined ? undefined : findFontListKey(keys, alias);
}

/** Source FontList metric with an opaque caller-owned physical identity; no native linked-list lifetime is reproduced. */
export interface FontListMetricEntry<T> {
  readonly metric: ConstFont;
  readonly value: T;
}

/** Original sortWeightValue puts NORMAL first, followed by lighter then heavier weights, including unknown. @param weight - Native weight enum. @returns Source comparison rank. */
function sortWeightValue(weight: FontWeight): number {
  if (weight < FontWeight.WEIGHT_NORMAL) return weight + 1;
  if (weight > FontWeight.WEIGHT_NORMAL) return weight - 1;
  return 0;
}

/** Original ImplCompareFontMetric orders italic,normal-first weight and exact OUString style name. @param left - First actual metric. @param right - Second actual metric. @returns Original comparison result. */
export function compareFontListMetrics(left: ConstFont, right: ConstFont): number {
  if (left.GetItalic() < right.GetItalic()) return -1;
  if (left.GetItalic() > right.GetItalic()) return 1;
  const firstWeight = sortWeightValue(left.GetWeight()),
    secondWeight = sortWeightValue(right.GetWeight());
  if (firstWeight < secondWeight) return -1;
  if (firstWeight > secondWeight) return 1;
  const first = left.GetStyleName(),
    second = right.GetStyleName();
  const firstUnits = new Uint16Array(first.length),
    secondUnits = new Uint16Array(second.length);
  for (let i = 0; i < first.length; ++i) firstUnits[i] = first.charCodeAt(i);
  for (let i = 0; i < second.length; ++i) secondUnits[i] = second.charCodeAt(i);
  return rtl_ustr_compare_WithLength(firstUnits, first.length, secondUnits, second.length);
}

/** Extracted per-family insertion from FontList::ImplInsertFonts, including duplicate/system-charset replacement. The caller supplies real metrics and device encoding; no names are parsed to invent either. @param entries - Owned metric rows in source order. @param incoming - Actual incoming metric/physical identity. @param systemEncoding - Actual device thread encoding. @returns Nothing. */
export function insertFontListMetric<T>(
  entries: FontListMetricEntry<T>[],
  incoming: FontListMetricEntry<T>,
  systemEncoding: rtl_TextEncoding,
): void {
  const added: FontListMetricEntry<T> = {
    metric: new Font(incoming.metric),
    value: incoming.value,
  };
  for (let i = 0; i < entries.length; ++i) {
    const current = entries[i] as FontListMetricEntry<T>,
      comparison = compareFontListMetrics(added.metric, current.metric);
    if (comparison <= 0) {
      if (comparison === 0) {
        if (
          current.metric.GetCharSet() !== systemEncoding &&
          added.metric.GetCharSet() === systemEncoding
        )
          entries[i] = added;
      } else entries.splice(i, 0, added);
      return;
    }
  }
  entries.push(added);
}
