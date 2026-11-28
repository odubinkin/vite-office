/** @fileoverview Native ODS label range declarations resolved after sheet creation. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { CellRangeAddress } from "../../../../offapi/com/sun/star/table/CellRangeAddress";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { FastAttributeList, SvXMLImportContext } from "../../../../xmloff/source/core/xmlimp";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScRange, ScRangePair } from "../../../inc/address";
import { ScUnoConversion } from "../../../inc/convuno";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import type { ScDocument } from "../../../inc/document";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Original pending strings whose sheet names may not be resolved yet. */
export interface ScMyLabelRange {
  readonly label: string;
  readonly data: string;
  readonly column: boolean;
}

/** Handles the native label container and child attributes. */
export class ScXMLLabelRangesContext extends ScXMLImportContext {
  /** Routes one table label definition. @param element - Child token. @param attributes - ODS attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.TABLE_LABEL_RANGE)
      return super.createFastChildContext(element, attributes);
    return new ScXMLLabelRangeContext(this.GetScImport(), {
      label: attributes.get(XMLToken.TABLE_LABEL_CELL_RANGE_ADDRESS) ?? "",
      data: attributes.get(XMLToken.TABLE_DATA_CELL_RANGE_ADDRESS) ?? "",
      column: attributes.get(XMLToken.TABLE_ORIENTATION) === "column",
    });
  }
}

/** Queues one native label pair without resolving future sheets. */
class ScXMLLabelRangeContext extends ScXMLImportContext {
  /** Binds a pair of serialized addresses. @param owner - Importer. @param entry - Pair. @returns Context. */
  constructor(
    owner: ScXMLImport,
    private readonly entry: ScMyLabelRange,
  ) {
    super(owner);
  }

  /** Shares the pending definition with the importer. @returns Nothing. */
  override endFastElement(): void {
    this.GetScImport().AddLabelRange(this.entry);
  }
}

/** Resolves and joins native label pairs once all sheets exist. @param document - Workbook. @param entries - Deferred definitions. @returns Nothing. */
export function SetLabelRanges(document: ScDocument, entries: readonly ScMyLabelRange[]): void {
  for (const entry of entries) {
    const label = new ScRange(),
      data = new ScRange();
    if (!ParseRange(document, entry.label, label) || !ParseRange(document, entry.data, data))
      continue;
    const list = entry.column ? document.GetColNameRanges() : document.GetRowNameRanges();
    list.Join(new ScRangePair(label, data));
  }
}

/** Reads an ODF range through the original single-sheet UNO address contract. @param document - Workbook. @param source - ODF range text. @param range - Output. @returns Valid reference. */
function ParseRange(document: ScDocument, source: string, range: ScRange): boolean {
  const offset: [number] = [0];
  if (
    !ScRangeStringConverter.GetRangeFromString(
      range,
      source,
      document,
      FormulaGrammar.AddressConvention.CONV_OOO,
      offset,
    ) ||
    offset[0] < 0
  )
    return false;
  const address = new CellRangeAddress();
  ScUnoConversion.FillApiRange(address, range);
  ScUnoConversion.FillScRange(range, address);
  return true;
}

/** Writes the source table:label-ranges element. @param document - Workbook. @returns ODS fragment. */
export function WriteLabelRanges(document: ScDocument): string {
  let content = "";
  for (const column of [true, false]) {
    const list = column ? document.GetColNameRanges() : document.GetRowNameRanges();
    for (let i = 0; i < list.size(); i++) {
      const pair = list.at(i);
      const label = FormatRange(document, pair.GetRange(0));
      const data = FormatRange(document, pair.GetRange(1));
      content += `<table:label-range table:label-cell-range-address="${label}" table:data-cell-range-address="${data}" table:orientation="${column ? "column" : "row"}"/>`;
    }
  }
  return content ? "<table:label-ranges>" + content + "</table:label-ranges>" : "";
}

/** Formats the native UNO label or data range with explicit sheet qualifiers. @param document - Workbook. @param range - Address. @returns Escaped attribute. */
function FormatRange(document: ScDocument, range: ScRange): string {
  const address = new CellRangeAddress();
  ScUnoConversion.FillApiRange(address, range);
  const native = new ScRange();
  ScUnoConversion.FillScRange(native, address);
  return escapeXml(
    ScRangeStringConverter.GetStringFromRange(
      native,
      document,
      FormulaGrammar.AddressConvention.CONV_OOO,
    ),
  );
}
