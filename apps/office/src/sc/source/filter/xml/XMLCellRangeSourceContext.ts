/** @fileoverview Original Calc table:cell-range-source attributes. */
import { Converter } from "../../../../sax/source/tools/converter";
import { convertDurationToDays } from "../../../../sax/source/tools/converter.duration";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Transient native declaration of an external data area. */
export class ScMyImpCellRangeSource {
  sSourceStr = "";
  sFilterName = "";
  sFilterOptions = "";
  sURL = "";
  nColumns = 0;
  nRows = 0;
  nRefresh = 0;
}

/** Reads properties into the owning XML cell's range source. */
export class ScXMLCellRangeSourceContext extends ScXMLImportContext {
  /** Parses attributes with the native present/absent distinction for dimensions. @param owner - Calc XML importer. @param attributes - ODF attributes. @param source - Owning cell data. */
  constructor(owner: ScXMLImport, attributes: FastAttributeList, source: ScMyImpCellRangeSource) {
    super(owner);
    const number: [number] = [0];
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.TABLE_NAME:
          source.sSourceStr = value;
          break;
        case XMLToken.TABLE_FILTER_NAME:
          source.sFilterName = value;
          break;
        case XMLToken.TABLE_FILTER_OPTIONS:
          source.sFilterOptions = value;
          break;
        case XMLToken.XLINK_HREF:
          source.sURL = owner.GetAbsoluteReference(value);
          break;
        case XMLToken.TABLE_LAST_COLUMN_SPANNED:
          source.nColumns = Converter.convertNumber(number, value, 1) ? number[0] : 1;
          break;
        case XMLToken.TABLE_LAST_ROW_SPANNED:
          source.nRows = Converter.convertNumber(number, value, 1) ? number[0] : 1;
          break;
        case XMLToken.TABLE_REFRESH_DELAY:
          if (convertDurationToDays(number, value))
            source.nRefresh = Math.max(0, (number[0] * 86400) | 0);
          break;
      }
    }
  }
}
