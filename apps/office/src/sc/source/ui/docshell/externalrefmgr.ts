/** @fileoverview Original external workbook identities and sparse table caches. */
import type { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";

/** Resolves an external file identity for formats requiring a URI. The browser supplies no absolute local document directory. @param name - Source workbook target. @returns A URI for the external workbook. */
export function getExternalFileUrl(name: string): string {
  if (/^[a-z][a-z0-9+.-]*:/iu.test(name)) return name;
  return new URL(name.replaceAll("#", "%23"), "file:///").href;
}

/** Scalar tokens stored by the imported external sheet cache. */
export type ScExternalCacheToken = FormulaDoubleToken | FormulaStringToken;

/** Original sparse two-dimensional cache of scalar formula tokens. */
export class ScExternalRefCacheTable {
  private readonly rows = new Map<number, Map<number, ScExternalCacheToken>>();
  private wholeTableCached = false;

  /** Marks uncached positions as empty in an imported complete ODF cache. @returns Nothing. */
  setWholeTableCached(): void {
    this.wholeTableCached = true;
  }

  /** Reads the native full-table cache flag. @returns Whether the table cache is complete. */
  isWholeTableCached(): boolean {
    return this.wholeTableCached;
  }

  /** Inserts the first token recorded at a cache position. @param col - Column. @param row - Row. @param token - Owned scalar token. @returns Nothing. */
  setCell(col: number, row: number, token: ScExternalCacheToken): void {
    let cells = this.rows.get(row);
    if (!cells) {
      cells = new Map();
      this.rows.set(row, cells);
    }
    if (cells.has(col)) token.dispose();
    else cells.set(col, token);
  }

  /** Borrows a cached token. @param col - Column. @param row - Row. @returns Token or absence. */
  getCell(col: number, row: number): ScExternalCacheToken | undefined {
    return this.rows.get(row)?.get(col);
  }

  /** Walks the native sparse cache rows for export. @returns Borrowed rows. */
  entries(): ReadonlyMap<number, ReadonlyMap<number, ScExternalCacheToken>> {
    return this.rows;
  }

  /** Releases all retained cache tokens. @returns Nothing. */
  clear(): void {
    for (const row of this.rows.values()) for (const token of row.values()) token.dispose();
    this.rows.clear();
    this.wholeTableCached = false;
  }
}

/** Holds the imported document links and their cache tables. */
export class ScExternalRefManager {
  private readonly files: {
    name: string;
    relativeName?: string;
    tables: Map<string, { name: string; cache: ScExternalRefCacheTable }>;
  }[] = [];
  private readonly workbookLinks = new Map<number, number>();

  /** Records the source XLSX link number independently of the cache file ID. @param index - One-based workbook slot. @param name - Source identity. @returns Nothing. */
  setWorkbookLink(index: number, name: string): void {
    this.workbookLinks.set(index, this.getExternalFileId(name));
  }

  /** Resolves a source XLSX link number. @param index - One-based workbook slot. @returns Cache file ID or absence. */
  getWorkbookLink(index: number): number | undefined {
    return this.workbookLinks.get(index);
  }

  /** Uses the original stable zero-based document identity. @param name - External workbook identity. @returns File ID. */
  getExternalFileId(name: string): number {
    const url = getExternalFileUrl(name);
    const index = this.files.findIndex(
      /** Matches a raw local target and its equivalent file URI. @param file - Existing link. @returns Match. */
      (file) => file.name === name || getExternalFileUrl(file.name) === url,
    );
    return index >= 0 ? index : this.files.push({ name, tables: new Map() }) - 1;
  }

  /** Retains the relative source target recorded by the ODF table source. @param fileId - Native file ID. @param href - URL relative to content.xml. @returns Nothing. */
  setRelativeFileName(fileId: number, href: string): void {
    const file = this.files[fileId];
    if (file && href.startsWith("../")) file.relativeName = href.slice(3);
  }

  /** Reads a registered external workbook's name. @param fileId - Native file ID. @returns Workbook identity or absence. */
  getExternalFileName(fileId: number): string | undefined {
    return this.files[fileId]?.name;
  }

  /** Returns registered sources in native file-ID order. @returns Borrowed source files. */
  getExternalFiles(): readonly Readonly<{
    name: string;
    relativeName?: string;
    tables: ReadonlyMap<string, Readonly<{ name: string; cache: ScExternalRefCacheTable }>>;
  }>[] {
    return this.files;
  }

  /** Reads a cache by the native case-insensitive table name. @param fileId - Native file ID. @param name - Sheet name. @param create - Whether to create a missing table. @returns Cache or absence. */
  getCacheTable(fileId: number, name: string, create = false): ScExternalRefCacheTable | undefined {
    const entries = this.files[fileId]?.tables;
    if (!entries) return undefined;
    const key = name.toUpperCase();
    let table = entries.get(key);
    if (!table && create) {
      table = { name, cache: new ScExternalRefCacheTable() };
      entries.set(key, table);
    }
    return table?.cache;
  }

  /** Releases cache token ownership when the document closes. @returns Nothing. */
  clear(): void {
    for (const file of this.files) for (const table of file.tables.values()) table.cache.clear();
    this.files.length = 0;
    this.workbookLinks.clear();
  }
}
