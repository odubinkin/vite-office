/** @fileoverview Original oneToOneMapping.hxx row layouts and shared class declaration boundary. */
/** Original two-unit borrowed mapping row. */
export interface OneToOneMappingTable_t {
  readonly first: number;
  readonly second: number;
}
/** Original sal_Int8 row mask. */
export type UnicodePairFlag = number;
/** Original flagged row; source order and duplicate first units are significant. */
export interface UnicodePairWithFlag extends OneToOneMappingTable_t {
  readonly flag: UnicodePairFlag;
}
export { oneToOneMapping, oneToOneMappingWithFlag } from "../source/utility/oneToOneMapping";
