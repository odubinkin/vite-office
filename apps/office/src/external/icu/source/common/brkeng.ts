/** @fileoverview ICU break-engine factory dictionary resource selection and native matcher ownership. */
import {
  BytesDictionaryMatcher,
  DictionaryData,
  type DictionaryMatcher,
  UCharsDictionaryMatcher,
} from "./dictionarydata";
import { udata_close, udata_getMemory, udata_open } from "./unicode/udata";
import type { UDataMemory } from "./udatamem.h";
import { CharString } from "./charstr.h";
import { U_ICUDATA_BRKITR } from "./ubrkimpl";
import { ures_open, ures_close } from "./uresbund.lifecycle";
import { ures_getByKeyWithFallback, ures_getStringByKeyWithFallback } from "./uresbund";
import { uscript_getShortName, type UScriptCode } from "./unicode/uscript";
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
