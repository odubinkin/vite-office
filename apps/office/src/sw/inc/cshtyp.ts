/** @fileoverview Native search scope flags and document position selectors from sw/inc/cshtyp.hxx. */
/** Native FindRanges flags; InSelAll means all matches rather than selection-only search. */
export enum FindRanges {
  InBody = 0x00,
  InSelAll = 0x01,
  InOther = 0x02,
  InSel = 0x04,
  InBodyOnly = 0x08,
}
/** Native search boundary selectors. */
export enum SwDocPositions {
  Start,
  Curr,
  End,
  OtherStart,
  OtherEnd,
}
