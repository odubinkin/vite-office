/** @fileoverview Original ICU78.3 ustringtrie.h result values and predicates. */
/** Original serialized string-trie match states. */
export enum UStringTrieResult {
  USTRINGTRIE_NO_MATCH,
  USTRINGTRIE_NO_VALUE,
  USTRINGTRIE_FINAL_VALUE,
  USTRINGTRIE_INTERMEDIATE_VALUE,
}
/** Original matches macro. @param result - Traversal result. @returns Match. */
export function USTRINGTRIE_MATCHES(result: UStringTrieResult): boolean {
  return result !== UStringTrieResult.USTRINGTRIE_NO_MATCH;
}
/** Original value macro. @param result - Traversal result. @returns Has value. */
export function USTRINGTRIE_HAS_VALUE(result: UStringTrieResult): boolean {
  return result >= UStringTrieResult.USTRINGTRIE_FINAL_VALUE;
}
/** Original continuation macro returns the low bit. @param result - Traversal result. @returns Continuation bit. */
export function USTRINGTRIE_HAS_NEXT(result: UStringTrieResult): number {
  return result & 1;
}
