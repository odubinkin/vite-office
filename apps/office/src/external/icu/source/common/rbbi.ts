/** @fileoverview Original ICU78.3 RuleBasedBreakIterator forward/safe reverse bodies over actual prepared state. Full iterator constructors, caches, dictionaries and public break operations remain pending. */
import type { UText } from "./unicode/utext";
import {
  utext_getNativeIndex,
  utext_setNativeIndex,
  utext_next32,
  utext_previous32,
} from "./utext";
import { ucptrie_get } from "./ucptrie";
import { RBBI_BOF_REQUIRED, type RBBIForwardData, type RBBIReverseData } from "./rbbidata.h";
/** Original fields consumed by the private safe reverse method. */
export interface RuleBasedBreakIteratorReverseState {
  fText: UText;
  fData: RBBIReverseData;
}
/** Original safe reverse method locates a safe restart point without changing iterator position/status/end fields. @param this - Actual prepared iterator fields. @param fromPosition - Original native UTF16 position. @returns Safe restart point or DONE. */
export function handleSafePrevious(
  this: RuleBasedBreakIteratorReverseState,
  fromPosition: number,
): number {
  const table = this.fData.fReverseTable;
  utext_setNativeIndex(this.fText, fromPosition);
  // Preserve source ordering: fData was already dereferenced before this null check.
  if (this.fData === null || utext_getNativeIndex(this.fText) === 0) return -1;
  let c = utext_previous32(this.fText),
    state = 1;
  const data = table.fTableData,
    rowLength = table.fRowLen / data.BYTES_PER_ELEMENT;
  let row = rowLength * state;
  for (; c !== -1; c = utext_previous32(this.fText)) {
    const category = ucptrie_get(this.fData.fTrie, c);
    state = data[row + 3 + category] as number;
    row = rowLength * state;
    if (state === 0) break;
  }
  return utext_getNativeIndex(this.fText);
}
/** Original fields consumed and mutated by the private forward method; no substitute iterator state owner or factory. */
export interface RuleBasedBreakIteratorForwardState {
  fText: UText;
  fData: RBBIForwardData;
  fPosition: number;
  fRuleStatusIndex: number;
  fDictionaryCharCount: number;
  fDone: boolean;
  fLookAheadMatches: Int32Array;
}
/** Original forward state machine; generic typed row views erase only the source template instantiation. @param this - Actual prepared iterator fields. @returns Following raw rule boundary or UBRK_DONE. */
export function handleNext(this: RuleBasedBreakIteratorForwardState): number {
  const table = this.fData.fForwardTable,
    data = table.fTableData,
    rowLength = table.fRowLen / data.BYTES_PER_ELEMENT,
    initial = this.fPosition;
  this.fRuleStatusIndex = 0;
  this.fDictionaryCharCount = 0;
  utext_setNativeIndex(this.fText, initial);
  let result = initial,
    c = utext_next32(this.fText);
  if (c === -1) {
    this.fDone = true;
    return -1;
  }
  let state = 1,
    row = rowLength * state,
    category = 0,
    mode = 1;
  if (table.fFlags & RBBI_BOF_REQUIRED) {
    category = 2;
    mode = 0;
  }
  for (;;) {
    if (c === -1) {
      if (mode === 2) break;
      mode = 2;
      category = 1;
    }
    if (mode === 1) {
      category = ucptrie_get(this.fData.fTrie, c);
      this.fDictionaryCharCount += Number(category >= table.fDictCategoriesStart);
    }
    state = data[row + 3 + category] as number;
    row = rowLength * state;
    const accepting = data[row] as number;
    if (accepting === 1) {
      if (mode !== 0) result = utext_getNativeIndex(this.fText);
      this.fRuleStatusIndex = data[row + 2] as number;
    } else if (accepting > 1) {
      const ahead = this.fLookAheadMatches[accepting] as number;
      if (ahead >= 0) {
        this.fRuleStatusIndex = data[row + 2] as number;
        this.fPosition = ahead;
        return ahead;
      }
    }
    const rule = data[row + 1] as number;
    // Preserve ICU-20837: accept completed lookahead before recording this row's slash position.
    if (rule > 1) this.fLookAheadMatches[rule] = utext_getNativeIndex(this.fText);
    if (state === 0) break;
    if (mode === 1) c = utext_next32(this.fText);
    else if (mode === 0) mode = 1;
  }
  if (result === initial) {
    utext_setNativeIndex(this.fText, initial);
    utext_next32(this.fText);
    result = utext_getNativeIndex(this.fText);
    this.fRuleStatusIndex = 0;
  }
  this.fPosition = result;
  return result;
}
