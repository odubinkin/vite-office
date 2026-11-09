/** @fileoverview Original ICU78.3 RuleBasedBreakIterator forward transition loop on UTF16 input. */
import type { RBBIDataWrapper } from "./rbbidata";
import { ucptrie_get } from "./ucptrie";

/** Forward rule state and dictionary admission retained independently of public break-cache operations. */
export class RuleBasedBreakIterator {
  private fPosition = 0;
  private fRuleStatusIndex = 0;
  private fDictionaryCharCount = 0;
  private readonly fLookAheadMatches: Int32Array;

  /** Owns the forward iterator state for one immutable UTF16 input. @param fData - Native compiled rules. @param text - UTF16 input. @returns Iterator. */
  constructor(
    private readonly fData: RBBIDataWrapper,
    private readonly text: string,
  ) {
    this.fLookAheadMatches = new Int32Array(fData.fForwardTable.fLookAheadResultsSize).fill(-1);
  }

  /** Native handleNext before dictionary refinement or public break caching. @returns Next candidate boundary, or -1 at the end. */
  handleNext(): number {
    this.fRuleStatusIndex = 0;
    this.fDictionaryCharCount = 0;
    const initial = this.fPosition;
    let position = initial;
    let code = this.text.codePointAt(position);
    if (code === undefined) return -1;
    position += code > 0xffff ? 2 : 1;
    const first = position;
    const table = this.fData.fForwardTable;
    let state = 1,
      category = 0,
      result = initial,
      mode = 0;
    if (table.fFlags & 2) {
      category = 2;
      mode = 1;
    }

    for (;;) {
      if (code === undefined) {
        if (mode === 2) break;
        mode = 2;
        category = 1;
      }
      if (mode === 0 && code !== undefined) {
        category = ucptrie_get(this.fData.fTrie, code);
        if (category >= table.fDictCategoriesStart) ++this.fDictionaryCharCount;
      }
      state = table.row(state, 3 + category);
      const accepting = table.row(state, 0);
      if (accepting === 1) {
        if (mode !== 1) result = position;
        this.fRuleStatusIndex = table.row(state, 2);
      } else if (accepting > 1) {
        const lookAhead = this.fLookAheadMatches[accepting] as number;
        if (lookAhead >= 0) {
          this.fRuleStatusIndex = table.row(state, 2);
          this.fPosition = lookAhead;
          return lookAhead;
        }
      }
      const rule = table.row(state, 1);
      if (rule > 1) this.fLookAheadMatches[rule] = position;
      if (!state) break;
      if (mode === 0) {
        code = this.text.codePointAt(position);
        if (code !== undefined) position += code > 0xffff ? 2 : 1;
      } else if (mode === 1) mode = 0;
    }
    if (result === initial) {
      result = first;
      this.fRuleStatusIndex = 0;
    }
    this.fPosition = result;
    return result;
  }

  /** Borrows the dictionary-character admission from the latest rule-machine run. @returns Native count. */
  getDictionaryCharCount(): number {
    return this.fDictionaryCharCount;
  }

  /** Borrows the status selected by the latest rule-machine run. @returns Largest matching rule status. */
  getRuleStatus(): number {
    return this.fData.getRuleStatus(this.fRuleStatusIndex);
  }
}
