/** @fileoverview Calc document model accessor for the formatter's explicit currency entries. */
import type { CurrencyID } from "../../../../sfx2/inc/IDocumentModelAccessor";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import type { ScDocument } from "../../../inc/document";

/** Calc accessor for the active document, with the same formatter-table boundary as the source. */
export class DocumentModelAccessor {
  /** Borrows the actual current document. @param document - Calc document. @returns Accessor. */
  constructor(private readonly document: ScDocument) {}

  /** Collects sorted unique explicit currencies from the original format table. @returns Currency identities. */
  getDocumentCurrencies(): CurrencyID[] {
    const table = this.document.GetFormatTable().GetROFormatData().GetFormatEntryMap();
    const unique = new Map<string, CurrencyID>();
    const symbol = new OUString();
    const extension = new OUString();
    try {
      for (const entry of table.values()) {
        const language = entry.GetLanguage();
        if (
          entry.GetMaskedType() !== SvNumFormatType.CURRENCY ||
          language === LANGUAGE_SYSTEM ||
          entry.IsAdditionalBuiltin() ||
          !entry.GetNewCurrencySymbol(symbol, extension)
        )
          continue;
        const currency = {
          aSymbol: text(symbol),
          aExtension: text(extension),
          eLanguage: language,
        };
        unique.set(JSON.stringify([currency.aSymbol, currency.aExtension, language]), currency);
      }
    } finally {
      symbol.dispose();
      extension.dispose();
    }
    return [...unique.values()].sort(
      /** Uses the native lexicographic tuple order. @param left - Currency identity. @param right - Currency identity. @returns Sort order. */
      (left, right) => {
        if (left.aSymbol !== right.aSymbol) return left.aSymbol < right.aSymbol ? -1 : 1;
        if (left.aExtension !== right.aExtension)
          return left.aExtension < right.aExtension ? -1 : 1;
        return left.eLanguage - right.eLanguage;
      },
    );
  }
}
