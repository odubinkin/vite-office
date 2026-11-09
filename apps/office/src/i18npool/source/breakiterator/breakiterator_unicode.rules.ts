/** @fileoverview Native LibreOffice dictionary Brk resources compiled by ICU78.3 genbrk. */
import { RBBIDataWrapper } from "../../../external/icu/source/common/rbbidata";
import data from "./data/dict-word.brk.json" with { type: "json" };

/** Resource names used by BreakIterator_Unicode::loadICUBreakIterator. */
export type DictionaryWordRule = keyof typeof data;

const rules = new Map<DictionaryWordRule, RBBIDataWrapper>();

/** Borrows immutable compiled ICU data for the native rule name. @param name - Original resource name. @returns Loaded rule data. */
export function loadDictionaryWordRule(name: DictionaryWordRule): RBBIDataWrapper {
  let rule = rules.get(name);
  if (rule === undefined) {
    const raw = atob(data[name]),
      bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) bytes[i] = raw.charCodeAt(i);
    rule = new RBBIDataWrapper(bytes);
    rules.set(name, rule);
  }
  return rule;
}
