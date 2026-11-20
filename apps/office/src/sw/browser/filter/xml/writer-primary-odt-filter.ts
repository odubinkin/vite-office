/** @fileoverview Preserves Word table interoperability alongside the browser's primary Writer XML streams. */
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import type { SwDoc } from "../../../source/core/doc/doc";
import { SwTableNode } from "../../../source/core/docnode/node";
import type { SwTable } from "../../../source/core/table/swtable";
import { GetUsedTableFormats } from "../../../source/core/docnode/ndtbl";
import {
  InlineOdtFilterService,
  OdtFilterError,
  type OdtFilterDocument,
  type OdtFilterOperationOptions,
} from "../../../source/filter/xml/odt-filter-service";
import { SwXTextDocument } from "../../../source/uibase/uno/unotxdoc";
import {
  encodeCellInterop,
  restoreCellInterop,
  encodeTableInterop,
  encodeTableStyles,
  restoreTableInterop,
  restoreTableStyles,
  type WriterInteropProperty,
} from "./writer-table-interop-codec";

/** Fields owned by native Writer interop bags that the portable ODF filter does not serialize. */
type WriterCellShading = readonly [
  name: string,
  row: number,
  column: number,
  fields: readonly WriterInteropProperty[],
];

/** Word table interoperability properties stored with the primary XML. */
interface WriterPrimaryTableStyles {
  readonly styles?: readonly WriterInteropProperty[];
  readonly tables: readonly (readonly [string, readonly WriterInteropProperty[]])[];
  readonly cells?: readonly WriterCellShading[];
}

/** The browser stores ancillary metadata atomically with the normal ODF XML package. */
interface WriterPrimaryPackage extends XmlPackage {
  readonly wordTableStyles: WriterPrimaryTableStyles;
}

/** Iterates native tables in every document section, including nested tables. @param document - Actual document. @returns Iterator over active native tables. */
function* usedTables(document: SwDoc): IterableIterator<SwTable> {
  for (const node of document.GetNodes().entries())
    if (node instanceof SwTableNode) yield node.GetTable();
}

/** Captures named table styles and per-table formatting references. @param document - Model serialized by the ODF filter. @returns Native metadata when present. */
function captureTableStyles(document: SwDoc): WriterPrimaryTableStyles | undefined {
  const styles = encodeTableStyles(document.interopGrabBag.GetGrabBag().get("tableStyles"));
  const tables: WriterPrimaryTableStyles["tables"][number][] = [];
  for (const format of GetUsedTableFormats(document)) {
    const fields = encodeTableInterop(format);
    if (fields !== undefined) tables.push([format.GetName(), fields]);
  }
  const cells: WriterCellShading[] = [];
  for (const table of usedTables(document))
    for (const [row, line] of table.GetTabLines().entries())
      for (const [column, box] of line.GetTabBoxes().entries()) {
        const fields = encodeCellInterop(box.GetFrameFormat());
        if (fields !== undefined) cells.push([table.GetName(), row, column, fields]);
      }
  if (styles === undefined && tables.length === 0 && cells.length === 0) return undefined;
  return {
    ...(styles === undefined ? {} : { styles }),
    tables,
    ...(cells.length ? { cells } : {}),
  };
}

/** Restores browser-only metadata on the isolated ODF candidate before the shell can adopt it. @param document - Imported graph. @param record - IndexedDB metadata. @returns Nothing. */
function applyTableStyles(document: SwDoc, record: unknown): void {
  if (
    typeof record !== "object" ||
    record === null ||
    !("tables" in record) ||
    !Array.isArray(record.tables)
  )
    throw new Error("Stored Writer Word table styles are invalid.");
  if ("styles" in record) {
    const model = new SwXTextDocument(document);
    try {
      restoreTableStyles(model, record.styles);
    } finally {
      model.dispose();
    }
  }
  const formats = new Map<string, ReturnType<typeof GetUsedTableFormats>[number]>();
  for (const format of GetUsedTableFormats(document)) formats.set(format.GetName(), format);
  const assigned = new Set<string>();
  for (const table of record.tables as readonly unknown[]) {
    if (!Array.isArray(table) || table.length !== 2 || typeof table[0] !== "string")
      throw new Error("Stored Writer Word table reference is invalid.");
    const name = table[0];
    if (assigned.has(name)) throw new Error("Stored Writer Word table reference is duplicated.");
    assigned.add(name);
    const format = formats.get(name);
    if (format !== undefined) restoreTableInterop(format, table[1]);
  }
  if ("cells" in record) applyCellShading(document, record.cells);
}

/** Restores source shading on the matching cell in the isolated ODF graph. @param document - Native document. @param record - Stored cell attributes. @returns Nothing. */
function applyCellShading(document: SwDoc, record: unknown): void {
  if (!Array.isArray(record)) throw new Error("Stored Writer cell shading is invalid.");
  const tables = new Map<string, SwTable>();
  for (const table of usedTables(document)) tables.set(table.GetName(), table);
  for (const item of record as readonly unknown[]) {
    if (
      !Array.isArray(item) ||
      item.length !== 4 ||
      typeof item[0] !== "string" ||
      !Number.isSafeInteger(item[1]) ||
      item[1] < 0 ||
      !Number.isSafeInteger(item[2]) ||
      item[2] < 0
    )
      throw new Error("Stored Writer cell shading address is invalid.");
    const cell = tables.get(item[0])?.GetTabLines()[item[1]]?.GetTabBoxes()[item[2]];
    if (cell) restoreCellInterop(cell.ClaimFrameFormat(), item[3]);
  }
}

/** Writer's browser primary storage adaptation over the original ODF package filter. */
export class WriterPrimaryOdtFilterService extends InlineOdtFilterService {
  /** Saves Word interop with the same document generation as the raw XML. @param input - Source graph. @param options - Existing filter controls. @returns Primary package. */
  override async ExportXml(
    input: OdtFilterDocument,
    options?: OdtFilterOperationOptions,
  ): Promise<XmlPackage> {
    const content = await super.ExportXml(input, options);
    if (options?.signal?.aborted === true)
      throw new OdtFilterError("cancelled", "ODT operation was cancelled.");
    if (options?.isCurrent?.() === false)
      throw new OdtFilterError("stale", "ODT export result is stale.");
    const wordTableStyles = captureTableStyles(input.document);
    if (wordTableStyles === undefined) return content;
    const primary: WriterPrimaryPackage = { ...content, wordTableStyles };
    return primary;
  }

  /** Restores Word interop only for documents opened from the primary storage envelope. @param bytes - Portable ODT or browser package. @param metadata - Fallback metadata. @param options - Existing filter controls. @returns Isolated candidate. */
  override async Import(
    bytes: Uint8Array | XmlPackage,
    metadata: Readonly<{ title: string; locale?: string }>,
    options?: OdtFilterOperationOptions,
  ): Promise<OdtFilterDocument> {
    const result = await super.Import(bytes, metadata, options);
    try {
      if (!(bytes instanceof Uint8Array) && "wordTableStyles" in bytes)
        applyTableStyles(result.document, bytes.wordTableStyles);
      return result;
    } catch (error) {
      result.document.Dispose();
      throw new OdtFilterError("format", error instanceof Error ? error.message : String(error));
    }
  }
}
