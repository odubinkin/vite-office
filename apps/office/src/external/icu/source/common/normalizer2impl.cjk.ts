/** @fileoverview Original NFKC composition and boundary mapping over the pinned CJK dictionary engine input set. */
import data from "./dictbe.cjk.data.json" with { type: "json" };

const UNICODE_LIMIT = 0x110000;
const noBoundary = new Set(data.noBoundary);
const decompositions = new Map<number, number[]>();
const combiningClasses = new Map<number, number>();
const compositions = new Map<number, number>();
for (const [code, ...parts] of data.decomposition) decompositions.set(code as number, parts);
for (let i = 0; i < data.ccc.length; i += 2)
  combiningClasses.set(data.ccc[i] as number, data.ccc[i + 1] as number);
for (let i = 0; i < data.composition.length; i += 3)
  compositions.set(
    (data.composition[i] as number) * UNICODE_LIMIT + (data.composition[i + 1] as number),
    data.composition[i + 2] as number,
  );

/** Stable composition fragment, using native NFKD data and canonical composition pairs. @param fragment - Whole source normalization fragment. @returns Original NFKC result. */
function compose(fragment: string): string {
  const first = fragment.codePointAt(0) as number;
  if (fragment.length === (first > 0xffff ? 2 : 1) && !decompositions.has(first)) return fragment;
  const decomposed: number[] = [];
  for (const character of fragment) {
    const code = character.codePointAt(0) as number;
    for (const part of decompositions.get(code) ?? [code]) {
      const ccc = combiningClasses.get(part) ?? 0;
      let insert = decomposed.length;
      if (ccc) {
        while (insert > 0 && (combiningClasses.get(decomposed[insert - 1] as number) ?? 0) > ccc)
          --insert;
      }
      decomposed.splice(insert, 0, part);
    }
  }
  const composed: number[] = [];
  let starter = -1,
    lastClass = 0;
  for (const code of decomposed) {
    const ccc = combiningClasses.get(code) ?? 0;
    const combined =
      starter !== -1 && (!lastClass || lastClass < ccc)
        ? compositions.get((composed[starter] as number) * UNICODE_LIMIT + code)
        : undefined;
    if (combined !== undefined) {
      composed[starter] = combined;
      continue;
    }
    if (ccc === 0) starter = composed.length;
    composed.push(code);
    lastClass = ccc;
  }
  let result = "";
  for (const code of composed) result += String.fromCodePoint(code);
  return result;
}

/** The native CJK caller builds a boundary map only when the NFKC result changes the input. */
export interface CjkNormalizedInput {
  readonly text: string;
  readonly sourceOffsets?: readonly number[];
}

/** Normalizes the complete admitted CJK span and maps each changed fragment to its original native start. @param text - Source text. @param start - Native span start. @param end - Native span end. @returns Original normalized text and optional codepoint boundary map. */
export function normalizeCjkInput(text: string, start: number, end: number): CjkNormalizedInput {
  const source = text.slice(start, end);
  const parts: string[] = [],
    offsets: number[] = [];
  let changed = false;
  let fragmentStart = 0;
  for (let next = 0; next < source.length;) {
    const code = source.codePointAt(next) as number;
    next += code > 0xffff ? 2 : 1;
    const following = source.codePointAt(next);
    if (following !== undefined && noBoundary.has(following)) continue;
    const fragment = source.slice(fragmentStart, next);
    const normalized = compose(fragment);
    if (fragment !== normalized) changed = true;
    parts.push(normalized);
    for (let i = 0; i < normalized.length;) {
      offsets.push(start + fragmentStart);
      i += (normalized.codePointAt(i) as number) > 0xffff ? 2 : 1;
    }
    fragmentStart = next;
  }
  if (!changed) return { text: source };
  offsets.push(end);
  return { text: parts.join(""), sourceOffsets: offsets };
}
