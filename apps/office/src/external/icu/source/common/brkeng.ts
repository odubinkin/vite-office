/** @fileoverview ICU78.3 language break factory and fallback for packaged Writer word dictionaries. */
import { uscript_getScript } from "./uchar";
import { UScriptCode as Script } from "./unicode/uscript";
import { openDictionaryMatcher, type DictionaryMatcher } from "./dictionarydata";
import { BurmeseBreakEngine, LaoBreakEngine, ThaiBreakEngine } from "./dictbe.southeast-asian";
import { KhmerBreakEngine } from "./dictbe.khmer";
import { CjkBreakEngine, CjkLanguageType } from "./dictbe.cjk";
import { dictionaryNativeIndex, nextDictionaryIndex, type DictionaryBreakEngine } from "./dictbe";
import { U_FAILURE } from "./unicode/utypes";

/** Native brkitr root dictionary entries for the represented script engines. */
export const wordDictionaryNames = [
  "thaidict",
  "laodict",
  "burmesedict",
  "khmerdict",
  "cjdict",
] as const;
/** Pinned dictionary resource name without the source extension. */
export type WordDictionaryName = (typeof wordDictionaryNames)[number];
/** The native brkitr data items selected by the factory. */
export type WordDictionaryPackage = Readonly<Record<WordDictionaryName, Uint8Array>>;

/** Original ICU engine contract consumed by the dictionary cache. */
export type LanguageBreakEngine = Pick<DictionaryBreakEngine, "handles" | "findBreaks">;

const dictionaries = new Map<Script, WordDictionaryName>([
  [Script.USCRIPT_THAI, "thaidict"],
  [Script.USCRIPT_LAO, "laodict"],
  [Script.USCRIPT_MYANMAR, "burmesedict"],
  [Script.USCRIPT_KHMER, "khmerdict"],
  [Script.USCRIPT_HAN, "cjdict"],
  [Script.USCRIPT_HANGUL, "cjdict"],
  [Script.USCRIPT_HIRAGANA, "cjdict"],
  [Script.USCRIPT_KATAKANA, "cjdict"],
]);

/** Original shared factory owns the selected dictionary engines. */
export class ICULanguageBreakFactory {
  private readonly engines: LanguageBreakEngine[] = [];

  /** Binds the native word dictionary data package. @param data - Actual ICU resource bytes. @returns Factory. */
  constructor(private readonly data: WordDictionaryPackage) {}

  /** Gets a cached engine or creates the original engine for the scalar's script. @param code - Native scalar. @param locale - ICU locale. @returns Actual engine or null. */
  getEngineFor(code: number, locale: string): LanguageBreakEngine | null {
    for (let i = this.engines.length - 1; i >= 0; --i) {
      const engine = this.engines[i] as LanguageBreakEngine;
      if (engine.handles(code, locale)) return engine;
    }
    const script = uscript_getScript(code, [0]),
      dictionary = this.loadDictionaryMatcherFor(script);
    if (dictionary === null) return null;

    // Pinned ICU data has no LSTM resources for these script keys.
    let engine: LanguageBreakEngine;
    switch (script) {
      case Script.USCRIPT_THAI:
        engine = new ThaiBreakEngine(dictionary);
        break;
      case Script.USCRIPT_LAO:
        engine = new LaoBreakEngine(dictionary);
        break;
      case Script.USCRIPT_MYANMAR:
        engine = new BurmeseBreakEngine(dictionary);
        break;
      case Script.USCRIPT_KHMER:
        engine = new KhmerBreakEngine(dictionary);
        break;
      default:
        engine = new CjkBreakEngine(
          dictionary,
          script === Script.USCRIPT_HANGUL
            ? CjkLanguageType.kKorean
            : CjkLanguageType.kChineseJapanese,
        );
    }
    this.engines.push(engine);
    return engine;
  }

  /** Resolves the original brkitr root dictionary item for the script. @param script - Native UScriptCode. @returns Selected native matcher or null. */
  private loadDictionaryMatcherFor(script: Script): DictionaryMatcher | null {
    const name = dictionaries.get(script);
    return name === undefined ? null : openDictionaryMatcher(this.data[name]);
  }
}

/** Original per-iterator fallback spans an unhandled script and contributes no boundaries. */
export class UnhandledEngine implements LanguageBreakEngine {
  private script: Script | undefined;

  /** Original applies a new script property set when the scalar is not already handled. @param code - Native scalar. @returns Nothing. */
  handleCharacter(code: number): void {
    this.script = uscript_getScript(code, [0]);
  }

  /** Tests membership of the current native script set. @param code - Native scalar. @param locale - Ignored locale. @returns Membership. */
  handles(code: number, locale: string): boolean {
    void locale;
    return this.script !== undefined && uscript_getScript(code, [0]) === this.script;
  }

  /** Advances through the original unhandled span. @param text - Native text. @param cursor - Mutable UTF16 position. @param start - Range start. @param end - Range end. @param breaks - Native break stack. @param phrase - Phrase selector. @param status - Sticky ICU status. @returns Zero. */
  findBreaks(
    text: string,
    cursor: [number],
    start: number,
    end: number,
    breaks: number[],
    phrase: boolean,
    status: [number],
  ): number {
    void breaks;
    void phrase;
    if (U_FAILURE(status[0])) return 0;
    let position = dictionaryNativeIndex(text, start);
    for (
      let code = text.codePointAt(position);
      position < end && code !== undefined && this.handles(code, "");
      code = text.codePointAt(position)
    )
      position = nextDictionaryIndex(text, position);
    cursor[0] = position;
    return 0;
  }
}
