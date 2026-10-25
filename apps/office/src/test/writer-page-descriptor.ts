/** @fileoverview Test fixtures construct genuine document-owned page frames; production has no detached SwPageDesc or substitute pool. */
import { SwDoc } from "../sw/source/core/doc/doc";
import type { SwPageDesc } from "../sw/source/core/layout/pagedesc";
/** Creates an actual document/pool/page graph retained through its native frame owners. @param locale - Locale. @returns Document-owned descriptor. */
export function createDefaultWriterPageDescriptor(locale: string): SwPageDesc {
  return new SwDoc({ locale, createInitialTextNode: false }).GetPageDesc();
}
