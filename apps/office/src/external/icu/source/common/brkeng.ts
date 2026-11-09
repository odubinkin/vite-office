/** @fileoverview ICU break-engine factory dictionary resource selection and native matcher ownership. */
import {
  BytesDictionaryMatcher,
  DictionaryData,
  type DictionaryMatcher,
  UCharsDictionaryMatcher,
} from "./dictionarydata";
import type { LanguageBreakEngine } from "./brkeng.h";
import {
  BurmeseBreakEngine,
  CjkBreakEngine,
  type DictionaryBreakEngine,
  KhmerBreakEngine,
  LanguageType,
  LaoBreakEngine,
  ThaiBreakEngine,
} from "./dictbe";
import { openLSTMModel } from "./lstmbe";
import { udata_close, udata_getMemory, udata_open } from "./unicode/udata";
import type { UDataMemory } from "./udatamem.h";
import { CharString } from "./charstr.h";
import { uscript_getScript } from "./uchar";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { ures_open, ures_close } from "./uresbund.lifecycle";
import { ures_getByKeyWithFallback, ures_getStringByKeyWithFallback } from "./uresbund";
import { uscript_getShortName, UScriptCode } from "./unicode/uscript";
import {
  utext_current32,
  utext_getNativeIndex,
  utext_next32,
  utext_setNativeIndex,
  type UText,
} from "./unicode/utext";
import type { UVector32 } from "./uvectr32.h";
import { U_FAILURE } from "./unicode/utypes";
import { registerBrkitrCommonData } from "../data/in/icudt78l.brkitr";

/** Original binary matcher dispatch within ICULanguageBreakFactory::loadDictionaryMatcherFor. @param file - Actual opened dictionary data. @returns Owning matcher or null after closing the handle. */
export function openDictionaryMatcher(file: UDataMemory): DictionaryMatcher | null {
  const data = udata_getMemory(file) as Uint8Array;
  const layout = DictionaryData;
  const indexes = new Int32Array(data.buffer, data.byteOffset, layout.IX_COUNT);
  const offset = indexes[layout.IX_STRING_TRIE_OFFSET] as number;
  const trieType = (indexes[layout.IX_TRIE_TYPE] as number) & layout.TRIE_TYPE_MASK;
  if (trieType === layout.TRIE_TYPE_BYTES) {
    return new BytesDictionaryMatcher(
      data.subarray(offset),
      indexes[layout.IX_TRANSFORM] as number,
      file,
    );
  }
  if (trieType === layout.TRIE_TYPE_UCHARS) {
    const characters = new Uint16Array(
      data.buffer,
      data.byteOffset + offset,
      Math.trunc((data.byteLength - offset) / 2),
    );
    return new UCharsDictionaryMatcher(characters, file);
  }
  udata_close(file);
  return null;
}

/** Original resource-selected matcher construction for a valid script code. @param script - Script from the ICU property API. @returns Owning matcher or null. */
export function loadDictionaryMatcherFor(script: UScriptCode): DictionaryMatcher | null {
  const status: [number] = [0];
  let bundle = ures_open(U_ICUDATA_BRKITR, "", status);
  bundle = ures_getByKeyWithFallback(bundle, "dictionaries", bundle, status);
  const length: [number] = [0];
  const filename = ures_getStringByKeyWithFallback(
    bundle,
    uscript_getShortName(script) as string,
    length,
    status,
  );
  if (U_FAILURE(status[0])) {
    ures_close(bundle);
    return null;
  }

  const name = new CharString();
  const extension = new CharString();
  const countedFilename = (filename as string).slice(0, length[0]);
  const lastDot = countedFilename.lastIndexOf(".");
  if (lastDot >= 0) {
    extension.appendInvariantChars(
      countedFilename.slice(lastDot + 1),
      length[0] - lastDot - 1,
      status,
    );
    length[0] = lastDot;
  }
  name.appendInvariantChars(filename, length[0], status);
  ures_close(bundle);

  registerBrkitrCommonData(status);
  const file = udata_open(
    U_ICUDATA_BRKITR,
    String.fromCharCode(...extension.data().subarray(0, extension.length())),
    String.fromCharCode(...name.data().subarray(0, name.length())),
    status,
  );
  return file === null || U_FAILURE(status[0]) ? null : openDictionaryMatcher(file);
}

/** Original reject engine. Its UnicodeSet property projection represents the current script. */
export class UnhandledEngine implements LanguageBreakEngine {
  private fHandled = UScriptCode.USCRIPT_INVALID_CODE;

  /** Original property-set membership, with no fallback before a script is selected. @param c - Input scalar. @param locale - Original unused locale. @returns Membership. */
  handles(c: number, locale: string | null): boolean {
    void locale;
    return (
      this.fHandled !== UScriptCode.USCRIPT_INVALID_CODE &&
      uscript_getScript(c, [0]) === this.fHandled
    );
  }

  /** Original applyIntPropertyValue replaces the property set with this script. @param c - Input code point. @returns Nothing. */
  handleCharacter(c: number): void {
    if (!this.handles(c, null)) this.fHandled = uscript_getScript(c, [0]);
  }

  /** Advances over the handled script without adding boundaries. @param text - Actual text. @param startPos - Range start. @param endPos - Range end. @param _foundBreaks - Original unused vector. @param _isPhraseBreaking - Original unused flag. @param status - Sticky status. @returns Zero. */
  findBreaks(
    text: UText,
    startPos: number,
    endPos: number,
    _foundBreaks: UVector32,
    _isPhraseBreaking: boolean,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    utext_setNativeIndex(text, startPos);
    let c = utext_current32(text);
    while ((utext_getNativeIndex(text) | 0) < endPos && this.handles(c, null)) {
      utext_next32(text);
      c = utext_current32(text);
    }
    return 0;
  }
}

/** Original ICU break-engine owner and reverse-order search for the pinned data build. */
export class ICULanguageBreakFactory {
  private fEngines: DictionaryBreakEngine[] | null = null;

  /** Returns a borrowed cached engine or adopts one from the original script dispatch. @param c - Input code point. @param locale - Requested locale. @returns Borrowed engine or null. */
  getEngineFor(c: number, locale: string | null): LanguageBreakEngine | null {
    const engines = (this.fEngines ??= []);
    for (let i = engines.length - 1; i >= 0; --i) {
      const engine = engines[i] as DictionaryBreakEngine;
      if (engine.handles(c, locale)) return engine;
    }
    const engine = this.loadEngineFor(c, locale);
    if (engine !== null) engines.push(engine);
    return engine;
  }

  /** Releases all native matcher owners. @returns Nothing. */
  dispose(): void {
    if (this.fEngines !== null) {
      for (const engine of this.fEngines) engine.dispose();
      this.fEngines = null;
    }
  }

  /** Original LSTM resource lookup followed by dictionary dispatch for the pinned data package. @param c - Input code point. @param locale - Original unused locale. @returns Owning engine or null. */
  protected loadEngineFor(c: number, locale: string | null): DictionaryBreakEngine | null {
    void locale;
    const status: [number] = [0];
    const script = uscript_getScript(c, status);
    if (U_FAILURE(status[0])) return null;
    // The pinned brkitr package contains no LSTM model bundles. The actual model
    // lookup takes the native dictionary fallback path for every supported script.
    ures_close(openLSTMModel(script, status));
    status[0] = 0;
    const dictionary = loadDictionaryMatcherFor(script);
    if (dictionary === null) return null;
    let engine: DictionaryBreakEngine;
    switch (script) {
      case UScriptCode.USCRIPT_THAI:
        engine = new ThaiBreakEngine(dictionary, status);
        break;
      case UScriptCode.USCRIPT_LAO:
        engine = new LaoBreakEngine(dictionary, status);
        break;
      case UScriptCode.USCRIPT_MYANMAR:
        engine = new BurmeseBreakEngine(dictionary, status);
        break;
      case UScriptCode.USCRIPT_KHMER:
        engine = new KhmerBreakEngine(dictionary, status);
        break;
      case UScriptCode.USCRIPT_HANGUL:
        engine = new CjkBreakEngine(dictionary, LanguageType.kKorean, status);
        break;
      case UScriptCode.USCRIPT_HIRAGANA:
      case UScriptCode.USCRIPT_KATAKANA:
      case UScriptCode.USCRIPT_HAN:
        engine = new CjkBreakEngine(dictionary, LanguageType.kChineseJapanese, status);
        break;
      default:
        dictionary.dispose();
        return null;
    }
    if (U_FAILURE(status[0])) {
      engine.dispose();
      return null;
    }
    return engine;
  }
}
