/** @fileoverview Native ODS label range declarations resolved after sheet creation. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { FastAttributeList, SvXMLImportContext } from "../../../../xmloff/source/core/xmlimp";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScAddress, ScRange, ScRangePair, ScRefFlags } from "../../../inc/address";
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

/** Parses ODF addresses with native Calc flags. @param document - Workbook. @param source - ODF range text. @param range - Output. @returns Valid reference. */
function ParseRange(document: ScDocument, source: string, range: ScRange): boolean {
  const value = unicode(source);
  try {
    return Boolean(range.ParseAny(value, document, ScAddress.detailsOOOa1) & ScRefFlags.VALID);
  } finally {
    value.dispose();
  }
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

/** Formats ODS label and data addresses with explicit sheets. @param document - Workbook. @param range - Address. @returns Escaped attribute. */
function FormatRange(document: ScDocument, range: ScRange): string {
  const flags = ScRefFlags.VALID | ScRefFlags.TAB_3D;
  const start = range.aStart.Format(flags, document);
  const end = range.aEnd.Format(flags, document);
  try {
    return escapeXml(text(start) + (range.aEnd.equals(range.aStart) ? "" : ":" + text(end)));
  } finally {
    start.dispose();
    end.dispose();
  }
}
