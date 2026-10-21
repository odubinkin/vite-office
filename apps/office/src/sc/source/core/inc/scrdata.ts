/** @fileoverview Original scrdata.hxx lazy script-service reference owner;browser supplies the real shared BreakIterator implementation. */
import type { XBreakIterator } from "../../../../offapi/com/sun/star/i18n/XBreakIterator";
/** Explicit browser binding for the original process-context service creation site. */
export type ScScriptServiceFactory = () => XBreakIterator | null;
/** Native unique document-owned service state;ordinary references replace C++/UNO lifetime bookkeeping. */
export class ScScriptTypeData {
  /** Original default-empty UNO reference,filled only on first actual service use. */
  xBreakIter: XBreakIterator | null = null;
}
