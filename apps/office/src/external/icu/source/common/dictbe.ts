/** @fileoverview Original ICU dictionary span owner and dictionary break engines. */
import type { LanguageBreakEngine } from "./brkeng.h";
import type { DictionaryMatcher } from "./dictionarydata";
import cjkRanges from "./dictbe.cjk.sets.json" with { type: "json" };
import ranges from "./dictbe.sea.sets.json" with { type: "json" };
import {
  utext_char32At,
  utext_close,
  utext_current32,
  utext_getNativeIndex,
  utext_moveIndex32,
  utext_nativeLength,
  utext_next32,
  utext_openUnicodeString,
  utext_previous32,
  utext_setNativeIndex,
  type OpenUText,
  type UText,
  UTextStorage,
  UTEXT_PROVIDER_STABLE_CHUNKS,
} from "./unicode/utext";
import { getNFKCInstance, type Normalizer2 } from "./unicode/normalizer2";
import { U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { UnicodeString } from "./unistr";
import {
  ures_close,
  ures_getByKey,
  ures_getNextResource,
  ures_getString,
  ures_hasNext,
  ures_open,
} from "./uresbund";
import { UnicodeSet } from "./uniset";
import { UVector32 } from "./uvectr32.h";

/** Base engine keeps the constructor's compact character set and limits runs to its members. */
export abstract class DictionaryBreakEngine implements LanguageBreakEngine {
  /** Receives the original compact character set from the derived constructor. @param fSet - Native engine set. @returns Engine owner. */
  protected constructor(private readonly fSet: UnicodeSet) {}

  /** Tests the actual script-specific character set. @param c - Candidate scalar. @param locale - Original unused argument. @returns Whether this engine handles the character. */
  handles(c: number, locale: string | null): boolean {
    void locale;
    return this.fSet.contains(c);
  }

  /** Finds the contiguous dictionary span and restores its end after subdivision. @param text - Provider. @param startPos - Requested start. @param endPos - Requested limit. @param foundBreaks - Output owner. @param isPhraseBreaking - Original phrase flag. @param status - Shared source status. @returns Number of boundaries. */
  findBreaks(
    text: UText,
    startPos: number,
    endPos: number,
    foundBreaks: UVector32,
    isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    utext_setNativeIndex(text, startPos);
    const start = utext_getNativeIndex(text) | 0;
    let current: number;
    let c = utext_current32(text);
    while ((current = utext_getNativeIndex(text) | 0) < endPos && this.fSet.contains(c)) {
      utext_next32(text);
      c = utext_current32(text);
    }
    const result = this.divideUpDictionaryRange(
      text,
      start,
      current,
      foundBreaks,
      isPhraseBreaking,
      status,
    );
    utext_setNativeIndex(text, current);
    return result;
  }

  /** Original virtual destructor releases the adopted matcher. @returns Nothing. */
  abstract dispose(): void;

  /** Divides an already located dictionary run. @param text - Provider. @param rangeStart - Native start. @param rangeEnd - Native limit. @param foundBreaks - Output owner. @param isPhraseBreaking - Original phrase flag. @param status - Shared status. @returns Number of boundaries. */
  protected abstract divideUpDictionaryRange(
    text: UText,
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: UVector32,
    isPhraseBreaking: boolean,
    status: [number],
  ): number;
}

const POSSIBLE_WORD_LIST_MAX = 20;

/** Original per-position cache of candidate code-unit and code-point lengths. */
class PossibleWord {
  private count = 0;
  private readonly prefix: [number] = [0];
  private offset = -1;
  private mark = 0;
  private current = 0;
  private readonly cuLengths = new Int32Array(POSSIBLE_WORD_LIST_MAX);
  private readonly cpLengths = new Int32Array(POSSIBLE_WORD_LIST_MAX);

  /** Caches a dictionary match and selects the longest full word. @param text - Provider. @param dict - Adopted matcher. @param rangeEnd - Native run limit. @returns Number of candidates. */
  candidates(text: UText, dict: DictionaryMatcher, rangeEnd: number): number {
    const start = utext_getNativeIndex(text) | 0;
    if (start !== this.offset) {
      this.offset = start;
      this.count = dict.matches(
        text,
        rangeEnd - start,
        this.cuLengths.length,
        this.cuLengths,
        this.cpLengths,
        null,
        this.prefix,
      );
      if (this.count <= 0) utext_setNativeIndex(text, start);
    }
    if (this.count > 0)
      utext_setNativeIndex(text, start + (this.cuLengths[this.count - 1] as number));
    this.current = this.count - 1;
    this.mark = this.current;
    return this.count;
  }

  /** Moves after the marked word. @param text - Provider. @returns Native word length. */
  acceptMarked(text: UText): number {
    const length = this.cuLengths[this.mark] as number;
    utext_setNativeIndex(text, this.offset + length);
    return length;
  }

  /** Moves to the next shorter candidate if available. @param text - Provider. @returns Whether a shorter candidate exists. */
  backUp(text: UText): boolean {
    if (this.current <= 0) return false;
    utext_setNativeIndex(text, this.offset + (this.cuLengths[--this.current] as number));
    return true;
  }

  /** Returns the dictionary's longest prefix. @returns Prefix length in code points. */
  longestPrefix(): number {
    return this.prefix[0];
  }

  /** Marks the currently selected candidate. @returns Nothing. */
  markCurrent(): void {
    this.mark = this.current;
  }

  /** Returns the marked candidate's code-point length. @returns Length. */
  markedCPLength(): number {
    return this.cpLengths[this.mark] as number;
  }
}

const LOOKAHEAD = 3;
const ROOT_COMBINE_THRESHOLD = 3;
const PREFIX_COMBINE_THRESHOLD = 3;
const MIN_WORD = 2;
const MIN_WORD_SPAN = MIN_WORD * 2;
const THAI_PAIYANNOI = 0x0e2f;
const THAI_MAIYAMOK = 0x0e46;

/** Original constructor sets grouped by the source boundary test that reads each. */
interface SoutheastAsianSets {
  word: readonly number[];
  begin: readonly number[];
  end: readonly number[];
  mark: readonly number[];
}

/** Shared implementation of the identical Lao, Burmese and Khmer loops and the common Thai steps. */
abstract class SoutheastAsianBreakEngine extends DictionaryBreakEngine {
  private readonly fBeginWordSet: UnicodeSet;
  private readonly fEndWordSet: UnicodeSet;
  private readonly fMarkSet: UnicodeSet;

  /** Adopts the original matcher and constructor sets. @param fDictionary - Adopted matcher. @param sets - Native constructor output. @param status - Sticky source status. @param fSuffixSet - Original Thai suffix set, or null for the other scripts. @returns Engine owner. */
  protected constructor(
    private readonly fDictionary: DictionaryMatcher,
    sets: SoutheastAsianSets,
    status: [number],
    private readonly fSuffixSet: UnicodeSet | null = null,
  ) {
    super(new UnicodeSet(U_SUCCESS(status[0]) ? sets.word : []));
    this.fBeginWordSet = new UnicodeSet(sets.begin);
    this.fEndWordSet = new UnicodeSet(sets.end);
    this.fMarkSet = new UnicodeSet(sets.mark);
  }

  /** Releases the adopted native dictionary image. @returns Nothing. */
  dispose(): void {
    this.fDictionary.dispose();
  }

  /** Retains the source candidate lookahead, resynchronization and boundary writes. @param text - Provider. @param rangeStart - Native start. @param rangeEnd - Native limit. @param foundBreaks - Output owner. @param _isPhraseBreaking - Original unused argument. @param status - Shared status. @returns Number of boundaries. */
  protected divideUpDictionaryRange(
    text: UText,
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: UVector32,
    _isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    const suffixSet = this.fSuffixSet;
    if (suffixSet !== null) {
      utext_setNativeIndex(text, rangeStart);
      utext_moveIndex32(text, MIN_WORD_SPAN);
      if (utext_getNativeIndex(text) >= rangeEnd) return 0;
      utext_setNativeIndex(text, rangeStart);
    } else if (rangeEnd - rangeStart < MIN_WORD_SPAN) return 0;

    let wordsFound = 0;
    let current: number;
    const words = [new PossibleWord(), new PossibleWord(), new PossibleWord()];
    utext_setNativeIndex(text, rangeStart);
    while (U_SUCCESS(status[0]) && (current = utext_getNativeIndex(text) | 0) < rangeEnd) {
      let cuWordLength = 0;
      let cpWordLength = 0;
      const first = words[wordsFound % LOOKAHEAD] as PossibleWord;
      const candidates = first.candidates(text, this.fDictionary, rangeEnd);
      if (candidates > 0) {
        if (candidates > 1 && utext_getNativeIndex(text) < rangeEnd) {
          const second = words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord;
          const third = words[(wordsFound + 2) % LOOKAHEAD] as PossibleWord;
          foundBest: do {
            if (second.candidates(text, this.fDictionary, rangeEnd) > 0) {
              first.markCurrent();
              if (utext_getNativeIndex(text) >= rangeEnd) break;
              do {
                if (third.candidates(text, this.fDictionary, rangeEnd) !== 0) {
                  first.markCurrent();
                  break foundBest;
                }
              } while (second.backUp(text));
            }
          } while (first.backUp(text));
        }
        cuWordLength = first.acceptMarked(text);
        cpWordLength = first.markedCPLength();
        ++wordsFound;
      }

      if ((utext_getNativeIndex(text) | 0) < rangeEnd && cpWordLength < ROOT_COMBINE_THRESHOLD) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        if (
          next.candidates(text, this.fDictionary, rangeEnd) <= 0 &&
          (cuWordLength === 0 || next.longestPrefix() < PREFIX_COMBINE_THRESHOLD)
        ) {
          let remaining = rangeEnd - (current + cuWordLength);
          let chars = 0;
          for (;;) {
            const pcIndex = utext_getNativeIndex(text) | 0;
            const pc = utext_next32(text);
            const pcSize = (utext_getNativeIndex(text) | 0) - pcIndex;
            chars += pcSize;
            remaining -= pcSize;
            if (remaining <= 0) break;
            const uc = utext_current32(text);
            if (this.fEndWordSet.contains(pc) && this.fBeginWordSet.contains(uc)) {
              const following = words[(wordsFound + 1) % LOOKAHEAD] as PossibleWord;
              const numCandidates = following.candidates(text, this.fDictionary, rangeEnd);
              utext_setNativeIndex(text, current + cuWordLength + chars);
              if (numCandidates > 0) break;
            }
          }
          if (cuWordLength <= 0) ++wordsFound;
          cuWordLength += chars;
        } else utext_setNativeIndex(text, current + cuWordLength);
      }

      let currPos: number;
      while (
        (currPos = utext_getNativeIndex(text) | 0) < rangeEnd &&
        this.fMarkSet.contains(utext_current32(text))
      ) {
        utext_next32(text);
        cuWordLength += (utext_getNativeIndex(text) | 0) - currPos;
      }

      if (suffixSet !== null && (utext_getNativeIndex(text) | 0) < rangeEnd && cuWordLength > 0) {
        const next = words[wordsFound % LOOKAHEAD] as PossibleWord;
        let uc: number;
        if (
          next.candidates(text, this.fDictionary, rangeEnd) <= 0 &&
          suffixSet.contains((uc = utext_current32(text)))
        ) {
          if (uc === THAI_PAIYANNOI) {
            if (!suffixSet.contains(utext_previous32(text))) {
              utext_next32(text);
              const paiyannoiIndex = utext_getNativeIndex(text) | 0;
              utext_next32(text);
              cuWordLength += (utext_getNativeIndex(text) | 0) - paiyannoiIndex;
              uc = utext_current32(text);
            } else utext_next32(text);
          }
          if (uc === THAI_MAIYAMOK) {
            if (utext_previous32(text) !== THAI_MAIYAMOK) {
              utext_next32(text);
              const maiyamokIndex = utext_getNativeIndex(text) | 0;
              utext_next32(text);
              cuWordLength += (utext_getNativeIndex(text) | 0) - maiyamokIndex;
            } else utext_next32(text);
          }
        } else utext_setNativeIndex(text, current + cuWordLength);
      }

      if (cuWordLength > 0) foundBreaks.push(current + cuWordLength, status);
    }

    if (foundBreaks.peeki() >= rangeEnd) {
      foundBreaks.popi();
      --wordsFound;
    }
    return wordsFound | 0;
  }
}

/** Original Thai dictionary engine and its additional suffix set. */
export class ThaiBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Thai matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.thai, status, new UnicodeSet(ranges.thai.suffix));
  }
}

/** Original Lao dictionary engine. */
export class LaoBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Lao matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.lao, status);
  }
}

/** Original Burmese dictionary engine. */
export class BurmeseBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Burmese matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.burmese, status);
  }
}

/** Original Khmer dictionary engine. */
export class KhmerBreakEngine extends SoutheastAsianBreakEngine {
  /** Adopts the original Khmer matcher. @param dictionary - Original dictionary. @param status - Sticky source status. @returns Engine owner. */
  constructor(dictionary: DictionaryMatcher, status: [number]) {
    super(dictionary, ranges.khmer, status);
  }
}

/** Original CJK engine modes. */
export enum LanguageType {
  kKorean,
  kChineseJapanese,
}

const kuint32max = 0xffffffff;
const kMaxKatakanaLength = 8;
const kMaxKatakanaGroupLength = 20;
const maxSnlp = 255;
const katakanaCost = [8192, 984, 408, 240, 204, 252, 300, 372, 480];

/** Original Katakana cost table and out-of-range value. @param length - Run length. @returns Dictionary cost. */
function getKatakanaCost(length: number): number {
  return length > kMaxKatakanaLength ? 8192 : (katakanaCost[length] as number);
}

/** Original Katakana run membership, including half-width code points. @param c - Scalar. @returns Membership. */
function isKatakana(c: number): boolean {
  return (c >= 0x30a1 && c <= 0x30fe && c !== 0x30fb) || (c >= 0xff66 && c <= 0xff9f);
}

/** Original CJK dictionary engine for the non-ML build. */
export class CjkBreakEngine extends DictionaryBreakEngine {
  private readonly nfkcNorm2: Normalizer2 | null;
  private readonly fHangulWordSet = new UnicodeSet(cjkRanges.hangul);
  private readonly fDigitOrOpenPunctuationOrAlphabetSet = new UnicodeSet(
    cjkRanges.digitOrOpenOrAlphabetic,
  );
  private readonly fClosePunctuationSet = new UnicodeSet(cjkRanges.closePunctuation);
  private readonly fSkipSet = new Set<string>();

  /** Adopts the original dictionary and reads the Japanese phrase parameters. @param fDictionary - Original CJK matcher. @param type - Source language mode. @param status - Sticky source status. @returns Engine owner. */
  constructor(
    private readonly fDictionary: DictionaryMatcher,
    type: LanguageType,
    status: [number],
  ) {
    const nfkc = getNFKCInstance(status);
    super(
      new UnicodeSet(
        U_FAILURE(status[0]) ? [] : type === LanguageType.kKorean ? cjkRanges.hangul : cjkRanges.cj,
      ),
    );
    this.nfkcNorm2 = nfkc;
    if (type === LanguageType.kChineseJapanese && U_SUCCESS(status[0])) {
      this.loadJapaneseExtensions(status);
      for (let i = 0; i < cjkRanges.hiragana.length && U_SUCCESS(status[0]); i += 2) {
        const end = cjkRanges.hiragana[i + 1] as number;
        for (let c = cjkRanges.hiragana[i] as number; c < end; ++c)
          this.fSkipSet.add(String.fromCodePoint(c));
      }
    }
  }

  /** Releases the adopted dictionary image. @returns Nothing. */
  dispose(): void {
    this.fDictionary.dispose();
  }

  /** Original Japanese extension strings from the brkitr ja bundle. @param status - Sticky source status. @returns Nothing. */
  private loadJapaneseExtensions(status: [number]): void {
    const ja = ures_open(U_ICUDATA_BRKITR, "ja", status);
    const extensions = ures_getByKey(ja, "extensions", null, status);
    let item = null;
    while (U_SUCCESS(status[0]) && ures_hasNext(extensions)) {
      item = ures_getNextResource(extensions, item, status);
      const value = ures_getString(item, null, status);
      if (value !== null && U_SUCCESS(status[0])) this.fSkipSet.add(value);
    }
    ures_close(item);
    ures_close(extensions);
    ures_close(ja);
  }

  /** Original native-index mapping and dictionary dynamic programming. @param inText - Actual provider. @param rangeStart - Native range start. @param rangeEnd - Native range limit. @param foundBreaks - Shared vector owner. @param isPhraseBreaking - Native phrase flag. @param status - Sticky source status. @returns Number of emitted breaks. */
  protected divideUpDictionaryRange(
    inText: UText,
    rangeStart: number,
    rangeEnd: number,
    foundBreaks: UVector32,
    isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0]) || rangeStart >= rangeEnd) return 0;
    const nfkc = this.nfkcNorm2 as Normalizer2;
    let inputMap: UVector32 | null = null;
    let input = "";
    if (
      (inText.providerProperties & (1 << UTEXT_PROVIDER_STABLE_CHUNKS)) !== 0 &&
      inText.chunkNativeStart <= rangeStart &&
      inText.chunkNativeLimit >= rangeEnd &&
      inText.nativeIndexingLimit >= rangeEnd - inText.chunkNativeStart
    ) {
      const offset = rangeStart - inText.chunkNativeStart;
      const limit = rangeEnd - inText.chunkNativeStart;
      for (let i = offset; i < limit; ++i)
        input += String.fromCharCode(inText.chunkContents[i] as number);
    } else {
      utext_setNativeIndex(inText, rangeStart);
      const limit = Math.min(rangeEnd, utext_nativeLength(inText));
      inputMap = new UVector32(status);
      if (U_FAILURE(status[0])) return 0;
      while (utext_getNativeIndex(inText) < limit) {
        const nativePosition = utext_getNativeIndex(inText) | 0;
        input += String.fromCodePoint(utext_next32(inText));
        while (inputMap.size() < input.length) inputMap.addElement(nativePosition, status);
      }
      inputMap.addElement(limit, status);
    }

    let inString = new UnicodeString(input, input.length);
    if (!nfkc.isNormalized(inString, status)) {
      const normalizedInput = new UnicodeString();
      const normalizedMap = new UVector32(status);
      if (U_FAILURE(status[0])) return 0;
      const normalizedFragment = new UnicodeString();
      for (let srcI = 0; srcI < inString.length();) {
        const fragmentStartI = srcI;
        for (;;) {
          srcI = inString.moveIndex32(srcI, 1);
          if (srcI === inString.length() || nfkc.hasBoundaryBefore(inString.char32At(srcI))) break;
        }
        const fragment = new UnicodeString(
          input.slice(fragmentStartI, srcI),
          srcI - fragmentStartI,
        );
        nfkc.normalize(fragment, normalizedFragment, status);
        normalizedInput.append(normalizedFragment);
        const fragmentOriginalStart =
          inputMap === null ? fragmentStartI + rangeStart : inputMap.elementAti(fragmentStartI);
        while (normalizedMap.size() < normalizedInput.length()) {
          normalizedMap.addElement(fragmentOriginalStart, status);
          if (U_FAILURE(status[0])) break;
        }
      }
      const nativeEnd =
        inputMap === null ? inString.length() + rangeStart : inputMap.elementAti(inString.length());
      normalizedMap.addElement(nativeEnd, status);
      inputMap = normalizedMap;
      inString = normalizedInput;
      input = inString.getBuffer() as string;
    }

    const numCodePts = inString.countChar32();
    if (numCodePts !== inString.length()) {
      const hadExistingMap = inputMap !== null;
      if (inputMap === null) {
        inputMap = new UVector32(status);
        if (U_FAILURE(status[0])) return 0;
      }
      let cpIdx = 0;
      for (let cuIdx = 0; ; cuIdx = inString.moveIndex32(cuIdx, 1)) {
        if (hadExistingMap) inputMap.setElementAt(inputMap.elementAti(cuIdx), cpIdx);
        else inputMap.addElement(cuIdx + rangeStart, status);
        ++cpIdx;
        if (cuIdx === inString.length()) break;
      }
    }

    const bestSnlp = new UVector32(numCodePts + 1, status);
    bestSnlp.addElement(0, status);
    for (let i = 1; i <= numCodePts; ++i) bestSnlp.addElement(kuint32max, status);
    const prev = new UVector32(numCodePts + 1, status);
    for (let i = 0; i <= numCodePts; ++i) prev.addElement(-1, status);
    const maxWordSize = 20;
    const values = new UVector32(numCodePts, status);
    values.setSize(numCodePts);
    const lengths = new UVector32(numCodePts, status);
    lengths.setSize(numCodePts);
    const fu = utext_openUnicodeString(new UTextStorage(), inString, status) as OpenUText;

    let ix = 0;
    let isPrevKatakana = false;
    for (let i = 0; i < numCodePts; ++i, ix = inString.moveIndex32(ix, 1)) {
      const currentCost = bestSnlp.elementAti(i) >>> 0;
      if (currentCost === kuint32max) continue;
      utext_setNativeIndex(fu, ix);
      let count = this.fDictionary.matches(
        fu,
        maxWordSize,
        numCodePts,
        null,
        lengths.getBuffer(),
        values.getBuffer(),
        null,
      );
      if (
        (count === 0 || lengths.elementAti(0) !== 1) &&
        !this.fHangulWordSet.contains(inString.char32At(ix))
      ) {
        values.setElementAt(maxSnlp, count);
        lengths.setElementAt(1, count++);
      }

      for (let j = 0; j < count; ++j) {
        const newSnlp = (currentCost + (values.elementAti(j) >>> 0)) >>> 0;
        const next = lengths.elementAti(j) + i;
        if (newSnlp < bestSnlp.elementAti(next) >>> 0) {
          bestSnlp.setElementAt(newSnlp, next);
          prev.setElementAt(i, next);
        }
      }

      const katakana = isKatakana(inString.char32At(ix));
      let katakanaRunLength = 1;
      if (!isPrevKatakana && katakana) {
        let j = inString.moveIndex32(ix, 1);
        while (
          j < inString.length() &&
          katakanaRunLength < kMaxKatakanaGroupLength &&
          isKatakana(inString.char32At(j))
        ) {
          j = inString.moveIndex32(j, 1);
          ++katakanaRunLength;
        }
        if (katakanaRunLength < kMaxKatakanaGroupLength) {
          const newSnlp = (currentCost + getKatakanaCost(katakanaRunLength)) >>> 0;
          const next = i + katakanaRunLength;
          if (newSnlp < bestSnlp.elementAti(next) >>> 0) {
            bestSnlp.setElementAt(newSnlp, next);
            prev.setElementAt(i, next);
          }
        }
      }
      isPrevKatakana = katakana;
    }
    utext_close(fu);

    const tBoundary = new UVector32(numCodePts + 1, status);
    let numBreaks = 0;
    if (bestSnlp.elementAti(numCodePts) >>> 0 === kuint32max) {
      tBoundary.addElement(numCodePts, status);
      ++numBreaks;
    } else if (isPhraseBreaking) {
      tBoundary.addElement(numCodePts, status);
      if (U_SUCCESS(status[0])) {
        ++numBreaks;
        let prevIdx = numCodePts;
        for (let i = prev.elementAti(numCodePts); i > 0; i = prev.elementAti(i)) {
          const codeUnitIdx = inString.moveIndex32(0, i);
          const prevCodeUnitIdx = inString.moveIndex32(0, prevIdx);
          prevIdx = i;
          if (
            !this.fSkipSet.has(input.slice(codeUnitIdx, prevCodeUnitIdx)) &&
            (!isKatakana(inString.char32At(inString.moveIndex32(codeUnitIdx, -1))) ||
              !isKatakana(inString.char32At(codeUnitIdx)))
          ) {
            tBoundary.addElement(i, status);
            ++numBreaks;
          }
        }
      }
    } else {
      for (let i = numCodePts; i > 0; i = prev.elementAti(i)) {
        tBoundary.addElement(i, status);
        ++numBreaks;
      }
    }

    if (foundBreaks.size() === 0 || foundBreaks.peeki() < rangeStart) {
      tBoundary.addElement(0, status);
      ++numBreaks;
    }
    let prevUTextPos = -1;
    let correctedNumBreaks = 0;
    for (let i = numBreaks - 1; i >= 0; --i) {
      const cpPos = tBoundary.elementAti(i);
      const utextPos = inputMap === null ? cpPos + rangeStart : inputMap.elementAti(cpPos);
      if (utextPos > prevUTextPos) {
        if (
          utextPos !== rangeStart ||
          (isPhraseBreaking &&
            utextPos > 0 &&
            this.fClosePunctuationSet.contains(utext_char32At(inText, utextPos - 1)))
        ) {
          foundBreaks.push(utextPos, status);
          ++correctedNumBreaks;
        }
      } else --numBreaks;
      prevUTextPos = utextPos;
    }

    const nextChar = utext_char32At(inText, rangeEnd);
    if (!foundBreaks.isEmpty() && foundBreaks.peeki() === rangeEnd) {
      if (!isPhraseBreaking || !this.fDigitOrOpenPunctuationOrAlphabetSet.contains(nextChar)) {
        foundBreaks.popi();
        --correctedNumBreaks;
      }
    }
    return correctedNumBreaks;
  }
}
