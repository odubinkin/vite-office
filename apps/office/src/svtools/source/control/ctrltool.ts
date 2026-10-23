/** @fileoverview Original FontList scalable-size resource and consumed family lookup from ctrltool.cxx; physical device enumeration remains browser-owned. */
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
