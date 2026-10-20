/** @fileoverview Native XTextSearch result: backward start is high/exclusive and end is low/inclusive. */
export interface SearchResult {
  readonly subRegExpressions: number;
  readonly startOffset: readonly number[];
  readonly endOffset: readonly number[];
}
