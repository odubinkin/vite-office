/** @fileoverview Original erased svl::StyleSheetUser crosscast protocol from include/svl/stylesheetuser.hxx; no runtime ownership or RTTI framework. */
/** Original caller usage query, implemented by actual style users. */
export interface StyleSheetUser {
  /** Original virtual model-use test. @returns Whether the user is used. */
  isUsedByModel(): boolean;
}
