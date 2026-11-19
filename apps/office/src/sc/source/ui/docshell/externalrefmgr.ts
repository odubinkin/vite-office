/** @fileoverview Original external workbook identities and sparse table caches. */
import type { FormulaToken } from "../../../../formula/inc/token";

/** Original sparse two-dimensional cache of scalar formula tokens. */
export class ScExternalRefCacheTable {
  private readonly rows = new Map<number, Map<number, FormulaToken>>();

  /** Inserts the first token recorded at a cache position. @param col - Column. @param row - Row. @param token - Owned scalar token. @returns Nothing. */
  setCell(col: number, row: number, token: FormulaToken): void {
    let cells = this.rows.get(row);
    if (!cells) {
      cells = new Map();
      this.rows.set(row, cells);
    }
    if (cells.has(col)) token.dispose();
    else cells.set(col, token);
  }

  /** Borrows a cached token. @param col - Column. @param row - Row. @returns Token or absence. */
  getCell(col: number, row: number): FormulaToken | undefined {
    return this.rows.get(row)?.get(col);
  }

  /** Releases all retained cache tokens. @returns Nothing. */
  clear(): void {
    for (const row of this.rows.values()) for (const token of row.values()) token.dispose();
    this.rows.clear();
  }
}

/** Holds the imported document links and their cache tables. */
export class ScExternalRefManager {
  private readonly files: { name: string; tables: Map<string, ScExternalRefCacheTable> }[] = [];

  /** Uses the original stable zero-based document identity. @param name - External workbook identity. @returns File ID. */
  getExternalFileId(name: string): number {
    const index = this.files.findIndex(
      /** Matches the file's native exact name. @param file - Existing link. @returns Match. */
      (file) => file.name === name,
    );
    return index >= 0 ? index : this.files.push({ name, tables: new Map() }) - 1;
  }

  /** Reads a registered external workbook's name. @param fileId - Native file ID. @returns Workbook identity or absence. */
  getExternalFileName(fileId: number): string | undefined {
    return this.files[fileId]?.name;
  }

  /** Reads a cache by the native case-insensitive table name. @param fileId - Native file ID. @param name - Sheet name. @param create - Whether to create a missing table. @returns Cache or absence. */
  getCacheTable(fileId: number, name: string, create = false): ScExternalRefCacheTable | undefined {
    const entries = this.files[fileId]?.tables;
    if (!entries) return undefined;
    const key = name.toUpperCase();
    let table = entries.get(key);
    if (!table && create) {
      table = new ScExternalRefCacheTable();
      entries.set(key, table);
    }
    return table;
  }

  /** Releases cache token ownership when the document closes. @returns Nothing. */
  clear(): void {
    for (const file of this.files) for (const table of file.tables.values()) table.clear();
    this.files.length = 0;
  }
}
