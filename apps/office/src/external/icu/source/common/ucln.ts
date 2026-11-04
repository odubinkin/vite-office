/** @fileoverview Original ICU cleanup declaration enum order and consumed function contracts. */
export enum ECleanupLibraryType {
  UCLN_START = -1,
  UCLN_UPLUG,
  UCLN_CUSTOM,
  UCLN_CTESTFW,
  UCLN_TOOLUTIL,
  UCLN_LAYOUTEX,
  UCLN_LAYOUT,
  UCLN_IO,
  UCLN_I18N,
  UCLN_COMMON,
}
/** Original cleanup callback type. */
export type cleanupFunc = () => boolean;
/** Original initializer callback type. */
export type initFunc = (error: [number]) => void;
export { ucln_registerCleanup, ucln_cleanupOne } from "./ucln_cmn";
