/** @fileoverview Original ICU78.3 CJK dictionary range segmentation, including native UTF16 offsets and the packaged phrase rules. */
import { DictionaryBreakEngine, dictionaryNativeIndex, dictionarySetContains } from "./dictbe";
import type { DictionaryMatcher } from "./dictionarydata";
import { normalizeCjkInput } from "./normalizer2impl.cjk";
import data from "./dictbe.cjk.data.json" with { type: "json" };

/** Native CjkBreakEngine language types. */
export enum CjkLanguageType {
  kKorean,
  kChineseJapanese,
}

const INFINITY_COST = 0xffffffff;
const MAX_WORD_SIZE = 20;
const MAX_KATAKANA_GROUP_LENGTH = 20;
const MAX_SNLP = 255;
const KATAKANA_COST = [8192, 984, 408, 240, 204, 252, 300, 372, 480];
const HANGUL_SYLLABLES = [0xac00, 0xd7a3];
const japaneseExtensions = new Set(
  data.extensions.map(
    /** Decodes native ja.res UTF16 data. @param units - Original phrase extension. @returns Phrase. */
    (units) => String.fromCharCode(...units),
  ),
);

/** Original CJK heuristic's exact Katakana inclusion, including half-width forms. @param code - Source scalar. @returns Native category test. */
function isKatakana(code: number): boolean {
  return (
    (code >= 0x30a1 && code <= 0x30fe && code !== 0x30fb) || (code >= 0xff66 && code <= 0xff9f)
  );
}

/** Visits scalar starts plus the final UTF16 boundary. @param text - Normalized source. @returns Native codepoint-to-code-unit offsets. */
function codePointOffsets(text: string): number[] {
  const offsets: number[] = [];
  for (let i = 0; i < text.length;) {
    offsets.push(i);
    i += (text.codePointAt(i) as number) > 0xffff ? 2 : 1;
  }
  offsets.push(text.length);
  return offsets;
}

/** Original weighted segmentation with native single-character and Katakana candidates. @param text - Normalized source. @param offsets - Scalar-to-unit offsets. @param dictionary - Actual CJK matcher. @returns Native predecessors or null when unreachable. */
function segment(
  text: string,
  offsets: readonly number[],
  dictionary: DictionaryMatcher,
): Int32Array | null {
  const size = offsets.length - 1;
  const best = new Uint32Array(size + 1).fill(INFINITY_COST),
    previous = new Int32Array(size + 1).fill(-1);
  best[0] = 0;
  const lengths = new Array<number>(size).fill(0),
    values = new Array<number>(size).fill(0);
  const cursor: [number] = [0];
  let previousKatakana = false;
  for (let i = 0; i < size; ++i) {
    const cost = best[i] as number;
    if (cost === INFINITY_COST) continue;
    const offset = offsets[i] as number,
      code = text.codePointAt(offset) as number;
    cursor[0] = offset;
    let count = dictionary.matches(text, cursor, MAX_WORD_SIZE, size, null, lengths, values, null);
    if ((count === 0 || lengths[0] !== 1) && !dictionarySetContains(HANGUL_SYLLABLES, code)) {
      if (count < size) {
        lengths[count] = 1;
        values[count] = MAX_SNLP;
      }
      ++count;
    }
    for (let j = 0; j < count; ++j) {
      const candidate = (cost + (values[j] ?? 0)) >>> 0,
        target = i + (lengths[j] ?? 0);
      if (candidate < (best[target] ?? 0)) {
        best[target] = candidate;
        previous[target] = i;
      }
    }
    const katakana = isKatakana(code);
    if (!previousKatakana && katakana) {
      let length = 1;
      while (
        i + length < size &&
        length < MAX_KATAKANA_GROUP_LENGTH &&
        isKatakana(text.codePointAt(offsets[i + length] as number) as number)
      )
        ++length;
      if (length < MAX_KATAKANA_GROUP_LENGTH) {
        const candidate = (cost + (KATAKANA_COST[length] ?? 8192)) >>> 0;
        if (candidate < (best[i + length] as number)) {
          best[i + length] = candidate;
          previous[i + length] = i;
        }
      }
    }
    previousKatakana = katakana;
  }
  return best[size] === INFINITY_COST ? null : previous;
}

/** Tests one normalized segment against the source Japanese phrase extensions and Hiragana entries. @param text - Normalized input. @param offsets - Native scalar offsets. @param start - Segment start. @param end - Segment end. @returns Whether to remove the tentative phrase boundary. */
function isJapanesePhraseContinuation(
  text: string,
  offsets: readonly number[],
  start: number,
  end: number,
): boolean {
  const offset = offsets[start] as number;
  return (
    (end === start + 1 &&
      dictionarySetContains(data.hiragana, text.codePointAt(offset) as number)) ||
    japaneseExtensions.has(text.slice(offset, offsets[end])) ||
    (isKatakana(text.codePointAt(offsets[start - 1] as number) as number) &&
      isKatakana(text.codePointAt(offset) as number))
  );
}

/** Original ICU CJK engine over contiguous UTF16 input as passed by LibreOffice. */
export class CjkBreakEngine extends DictionaryBreakEngine {
  /** Binds the original dictionary and Korean or Chinese/Japanese character set. @param dictionary - Actual ICU matcher. @param language - Native engine kind. @returns Engine. */
  constructor(
    private readonly dictionary: DictionaryMatcher,
    private readonly language: CjkLanguageType,
  ) {
    super(language === CjkLanguageType.kKorean ? HANGUL_SYLLABLES : data.ranges);
  }

  /** Finds weighted dictionary boundaries and restores the original UTF16 positions. @param text - Original source. @param position - Borrowed cursor. @param start - Native range start. @param end - Native range end. @param foundBreaks - Native break stack. @param phrase - Native phrase selector. @returns Added break count. */
  protected divideUpDictionaryRange(
    text: string,
    position: [number],
    start: number,
    end: number,
    foundBreaks: number[],
    phrase: boolean,
  ): number {
    void position;
    if (start >= end) return 0;
    const normalized =
      this.language === CjkLanguageType.kKorean
        ? { text: text.slice(start, end), sourceOffsets: undefined }
        : normalizeCjkInput(text, start, end);
    const offsets = codePointOffsets(normalized.text),
      size = offsets.length - 1;
    const previous = segment(normalized.text, offsets, this.dictionary);
    const boundaries = [size];
    if (previous !== null) {
      let next = size;
      for (let i = previous[size] as number; i > 0; i = previous[i] as number) {
        const omit =
          phrase &&
          this.language === CjkLanguageType.kChineseJapanese &&
          isJapanesePhraseContinuation(normalized.text, offsets, i, next);
        if (!omit) boundaries.push(i);
        next = i;
      }
    }
    if ((foundBreaks.at(-1) ?? -1) < start) boundaries.push(0);

    let last = -1,
      count = 0;
    for (let i = boundaries.length - 1; i >= 0; --i) {
      const codePoint = boundaries[i] as number;
      const native =
        normalized.sourceOffsets?.[codePoint] ?? start + (offsets[codePoint] as number);
      if (
        native > last &&
        (native !== start ||
          (phrase &&
            native > 0 &&
            dictionarySetContains(
              data.phraseStart,
              text.codePointAt(dictionaryNativeIndex(text, native - 1)) ?? -1,
            )))
      ) {
        foundBreaks.push(native);
        ++count;
      }
      last = native;
    }
    const next = text.codePointAt(dictionaryNativeIndex(text, end)) ?? -1;
    if (foundBreaks.at(-1) === end && (!phrase || !dictionarySetContains(data.phraseEnd, next))) {
      foundBreaks.pop();
      --count;
    }
    return count;
  }
}
