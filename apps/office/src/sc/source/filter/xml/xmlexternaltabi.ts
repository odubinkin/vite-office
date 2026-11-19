/** @fileoverview Native ODF external reference table and scalar cache contexts. */
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { getPrefix } from "../../../../tools/source/fsys/urlobj.data";
import { toDouble } from "../../../../o3tl/inc/string_view";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import type { ScExternalRefCacheTable } from "../../ui/docshell/externalrefmgr";
import type { ScXMLImport } from "./xmlimprt";
import { repeatCount } from "./xmlrowi";

/** Recognizes an external cache table by the native quoted URI and sheet-name convention. @param name - ODF table name. @param owner - Active ODF importer. @returns Cache context or absence. */
export function createExternalRefTable(
  name: string,
  owner: ScXMLImport,
): SvXMLImportContext | undefined {
  if (name[0] !== "'" || !getPrefix({ text: name, index: 1, end: name.length })) return undefined;
  const hash = name.indexOf("#");
  if (hash < 2 || name[hash - 1] !== "'" || hash === name.length - 1) return undefined;
  return new ScXMLExternalRefTableContext(owner, name.slice(1, hash - 1), name.slice(hash + 1));
}

/** Owns the cache selected for one external ODF table. */
class ScXMLExternalRefTableContext extends SvXMLImportContext {
  readonly cache: ScExternalRefCacheTable | undefined;
  row = 0;
  private readonly file: number;

  /** Binds the native cache. @param owner - Active ODF importer. @param url - External target URI. @param sheet - External sheet name. @returns Context. */
  constructor(
    readonly owner: ScXMLImport,
    url: string,
    sheet: string,
  ) {
    super();
    const manager = owner.GetDocument().GetExternalRefManager();
    this.file = manager.getExternalFileId(url);
    this.cache = manager.getCacheTable(this.file, sheet, true);
    this.cache?.setWholeTableCached();
  }

  /** Table source metadata is admitted without projecting unrelated styles. @param element - XML token. @returns Whether to ignore nonconsumed attributes. */
  override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return element === XMLToken.TABLE_TABLE_SOURCE;
  }

  /** Admits source metadata, repeated row groups and ordinary cache rows. @param element - XML token. @param attributes - Source attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TABLE_TABLE_SOURCE)
      this.owner
        .GetDocument()
        .GetExternalRefManager()
        .setRelativeFileName(this.file, attributes.get(XMLToken.XLINK_HREF) ?? "");
    if (element === XMLToken.TABLE_TABLE_ROW)
      return new ScXMLExternalRefRowContext(this, attributes);
    if (
      element === XMLToken.TABLE_TABLE_ROWS ||
      element === XMLToken.TABLE_TABLE_ROW_GROUP ||
      element === XMLToken.TABLE_TABLE_HEADER_ROWS
    )
      return this;
    return new SvXMLIgnoreContext(true);
  }
}

/** Original incrementing row and column cursor, including repeated sparse rows. */
class ScXMLExternalRefRowContext extends SvXMLImportContext {
  private readonly repeat: number;
  col = 0;
  readonly values: [first: number, last: number, value: string | number][] = [];

  /** Binds the current row. @param table - External cache table. @param attributes - Row attributes. @returns Row context. */
  constructor(
    private readonly table: ScXMLExternalRefTableContext,
    attributes: FastAttributeList,
  ) {
    super();
    this.repeat = repeatCount(attributes, XMLToken.TABLE_NUMBER_ROWS_REPEATED);
  }

  /** Admits cache cells and covered positions. @param element - XML token. @param attributes - Cell attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return element === XMLToken.TABLE_TABLE_CELL || element === XMLToken.TABLE_COVERED_TABLE_CELL
      ? new ScXMLExternalRefCellContext(this, attributes)
      : new SvXMLIgnoreContext(true);
  }

  /** Stores represented values within the native sheet bounds and advances the row cursor once. @returns Nothing. */
  override endFastElement(): void {
    const { cache, owner, row } = this.table;
    const document = owner.GetDocument();
    const stop = Math.min(row + this.repeat, document.MaxRow() + 1);
    if (cache && this.values.length)
      for (const [first, last, value] of this.values) {
        const endCol = Math.min(last, document.MaxCol() + 1);
        if (endCol <= first || stop === row) continue;
        owner.consumeCells((endCol - first) * (stop - row));
        if (typeof value === "number") {
          for (let y = row; y < stop; ++y)
            for (let col = first; col < endCol; ++col)
              cache.setCell(col, y, new FormulaDoubleToken(value));
        } else {
          const source = unicode(value);
          const shared = document.GetSharedStringPool().intern(source);
          try {
            for (let y = row; y < stop; ++y)
              for (let col = first; col < endCol; ++col)
                cache.setCell(col, y, new FormulaStringToken(shared));
          } finally {
            shared.dispose();
            source.dispose();
          }
        }
      }
    this.table.row = stop;
  }
}

/** Reads ODF numeric, logical and textual values in one cached cell. */
class ScXMLExternalRefCellContext extends SvXMLImportContext {
  private readonly repeat: number;
  private readonly numeric: number | undefined;
  private value: string;

  /** Reads the original scalar cache attributes. @param row - Current row owner. @param attributes - Source attributes. @returns Context. */
  constructor(
    private readonly row: ScXMLExternalRefRowContext,
    attributes: FastAttributeList,
  ) {
    super();
    this.repeat = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED);
    this.value = attributes.get(XMLToken.OFFICE_STRING_VALUE) ?? "";
    const number = attributes.get(XMLToken.OFFICE_VALUE);
    const logical = attributes.get(XMLToken.OFFICE_BOOLEAN_VALUE);
    if (number) {
      const source = unicode(number);
      try {
        this.numeric = toDouble(source.getStr());
      } finally {
        source.dispose();
      }
    } else if (logical) this.numeric = Number(logical === "true");
  }

  /** Admits a cache paragraph. @param element - XML token. @returns Context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.TEXT_P) return new SvXMLIgnoreContext(true);
    return new ScXMLExternalRefCellTextContext(
      /** Receives the completed cached paragraph. @param value - Paragraph text. @returns Nothing. */
      (value) => {
        this.value = value;
      },
    );
  }

  /** Advances the sparse column cursor and retains nonempty values. @param element - Closing XML token. @returns Nothing. */
  override endFastElement(): void {
    const first = this.row.col;
    this.row.col += this.repeat;
    if (this.numeric !== undefined || this.value)
      this.row.values.push([first, this.row.col, this.numeric ?? this.value]);
  }
}

/** Native text context buffers one paragraph before replacing the cache text. */
class ScXMLExternalRefCellTextContext extends SvXMLImportContext {
  private value = "";
  /** Binds the cell text sink. @param finish - Completed text receiver. @returns Context. */
  constructor(private readonly finish: (text: string) => void) {
    super();
  }
  /** Appends decoded character chunks. @param content - XML text. @returns Nothing. */
  override characters(content: string): void {
    this.value += content;
  }
  /** Commits the complete paragraph. @returns Nothing. */
  override endFastElement(): void {
    this.finish(this.value);
  }
}
