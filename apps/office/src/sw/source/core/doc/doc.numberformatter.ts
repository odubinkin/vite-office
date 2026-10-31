/** @fileoverview Original SwDoc::EnsureNumberFormatter initialization split from docfmt.cxx under the SwDoc file-size limit; the actual document still owns the single formatter and its destruction. */
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { getYear2000Default } from "../../../../svl/source/numbers/zforlist.defaults";
import { NfEvalDateFormat } from "../../../../svl/inc/zforlist";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
/** Original lazy allocation and exact source defaults. @param formatter - Actual document member value. @returns Existing or newly initialized formatter for the same member. */
export function EnsureNumberFormatter(formatter: SvNumberFormatter | null): SvNumberFormatter {
  if (formatter === null) {
    formatter = new SvNumberFormatter(LANGUAGE_SYSTEM);
    formatter.SetEvalDateFormat(NfEvalDateFormat.FormatThenInternational);
    formatter.SetYear2000(getYear2000Default());
  }
  return formatter;
}
