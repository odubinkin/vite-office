/** @fileoverview Original XLocator IDL method contracts only; no origin service or UNO runtime is fabricated. */
import type { OUString } from "../../../../../../sal/inc/rtl/ustring";
/** Original document-origin queries. */
export interface XLocator {
  /** Native column query. @returns Column. */ getColumnNumber(): number;
  /** Native line query. @returns Line. */ getLineNumber(): number;
  /** Native public identifier. @returns Identifier. */ getPublicId(): OUString;
  /** Native system identifier. @returns Identifier. */ getSystemId(): OUString;
}
