/** @fileoverview Defines the implemented native text-attribute query modes from sw/inc/swtypes.hxx. */

/** Selects the native containment contract at one text offset. */
export enum GetTextAttrMode {
  /** Includes the start and excludes the end. */
  Default,
  /** Excludes the start and includes the end. */
  Expand,
  /** Excludes both endpoints. */
  Parent,
}
