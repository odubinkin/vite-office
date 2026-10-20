import fs from 'node:fs';
for(const p of ['apps/office/src/sc/source/core/data/docpool.ts','apps/office/src/sc/source/core/data/column2.ts']) {let s=fs.readFileSync(p,'utf8').replaceAll('svl/inc/boolitem','svl/source/items/cenumitm'); if(p.endsWith('column2.ts'))s=s.replace('SvxFontHeightItem, SvxEmphasisMarkItem','SvxFontHeightItem').replace('import type { SvxMarginItem','import type { SvxEmphasisMarkItem } from "../../../../editeng/source/items/textitem.effects";\nimport type { SvxMarginItem');fs.writeFileSync(p,s);}
const p='apps/office/src/sc/source/core/data/table.ts';let s=fs.readFileSync(p,'utf8');
s=s.replace('/** Sheet owner',`import { ScFlatUInt16RowSegments, type ScFlatUInt16RowRangeData } from "../../../inc/segmenttree";
import { ScBitMaskCompressedArray } from "../../../inc/compressedarray";
import { CRFlags, ScGlobal } from "../../../inc/global";
import { ATTR_FONT_HEIGHT } from "../../../inc/scitems";
import type { RowHeightContext } from "../../../inc/rowheightcontext";
import { lcl_GetAttribHeight, supportsStandardRowHeight } from "./column2";
import { SetOptimalHeightsToRows } from "./table1";
/** Sheet owner`);
s=s.replace('private readonly aName: OUString;',`private readonly aName: OUString;
  private readonly mpRowHeights: ScFlatUInt16RowSegments;
  private readonly pRowFlags: ScBitMaskCompressedArray;
  private mnOptimalMinRowHeight = 0;`);
s=s.replace('this.aName = new OUString(name);',`this.aName = new OUString(name);
    this.mpRowHeights = new ScFlatUInt16RowSegments(rDocument.MaxRow(), this.GetOptimalMinRowHeight());
    this.pRowFlags = new ScBitMaskCompressedArray(rDocument.MaxRow(), CRFlags.NONE, 32);`);
s=s.replace('  /** Borrows the native default',`  /** Reads native per-sheet override or startup minimum; device-dependent global initialization remains separate. @returns Twips. */
  GetOptimalMinRowHeight(): number { return this.mnOptimalMinRowHeight || ScGlobal.nStdRowHeight; }
  /** Stores native UInt16 minimum override. @param height - Twips. @returns Nothing. */
  SetOptimalMinRowHeight(height: number): void { this.mnOptimalMinRowHeight = height & 0xffff; }
  /** Reads actual visible-row geometry; hidden-row storage is outside this slice. @param row - Row. @returns Twips or source invalid-row minimum. */
  GetRowHeight(row: number): number {
    return this.rDocument.ValidRow(row) ? this.mpRowHeights.getValue(row) : this.GetOptimalMinRowHeight();
  }
  /** Borrows real compressed geometry boundaries for valid rows. @param row - Valid row. @returns Native range. */
  GetRowHeightRange(row: number): ScFlatUInt16RowRangeData {
    const data = { mnRow1: 0, mnRow2: 0, mnValue: 0 };
    this.mpRowHeights.getRangeData(row, data);
    return data;
  }
  /** Reads genuine compressed row flag bounds. @param row - Row. @returns Flags and range. */
  GetRowFlagsRange(row: number): ReturnType<ScBitMaskCompressedArray["GetRangeData"]> { return this.pRowFlags.GetRangeData(row); }
  /** Stores geometry without device pixel comparison, as used by import. @param first - First row. @param last - Last row. @param height - UInt16 twips. @returns Nothing. */
  SetRowHeightOnly(first: number, last: number, height: number): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    this.mpRowHeights.setValue(first, last, (height & 0xffff) || this.GetOptimalMinRowHeight());
  }
  /** Updates only the source manual-size bit. @param first - First row. @param last - Last row. @param manual - Flag. @returns Nothing. */
  SetManualHeight(first: number, last: number, manual: boolean): void {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return;
    if (manual) this.pRowFlags.OrValue(first, last, CRFlags.ManualSize);
    else this.pRowFlags.AndValue(first, last, CRFlags.All & ~CRFlags.ManualSize);
  }
  /** Source no-drawing-layer pixel-change path, including the interactive single-row shrink heuristic. @param first - First row. @param last - Last row. @param height - Twips. @param ppty - Pixels per twip. @param api - Allow shrinking a single row. @returns Whether stored geometry changed. */
  SetRowHeightRange(first: number, last: number, height: number, ppty: number, api: boolean): boolean {
    if (!this.rDocument.ValidRow(first) || !this.rDocument.ValidRow(last)) return false;
    height = (height & 0xffff) || this.GetOptimalMinRowHeight();
    const pixels = Math.trunc(height * ppty);
    for (let row = first; row <= last;) {
      const run = this.GetRowHeightRange(row), oldPixels = Math.trunc(run.mnValue * ppty);
      if (run.mnValue !== height && pixels !== oldPixels && (api || last - first > 0 || pixels > oldPixels)) {
        this.mpRowHeights.setValue(first, last, height);
        return true;
      }
      row = run.mnRow2 + 1;
    }
    return false;
  }
  /** Calculates native standard attribute maxima without expanding row spans; unsupported device layout retains imported geometry. @param context - Shared across selected sheets. @param first - First row. @param last - Last row. @param api - Source UI uses true. @returns Whether heights changed. */
  SetOptimalHeight(context: RowHeightContext, first: number, last: number, api: boolean): boolean {
    const patterns: { first: number; last: number; pattern: ScPatternAttr }[] = [];
    const start: [number] = [0], end: [number] = [0];
    for (let col = 0; col <= this.aCol.length; col++)
      for (let row = first; row <= last;) {
        const pattern = this.GetColumnData(col).GetPatternRange(start, end, row) as ScPatternAttr;
        if (!supportsStandardRowHeight(pattern)) return false;
        patterns.push({ first: row, last: Math.min(last, end[0]), pattern });
        row = end[0] + 1;
      }
    const heights = context.getHeightArray();
    for (const run of patterns) {
      const height = lcl_GetAttribHeight(run.pattern, ATTR_FONT_HEIGHT, this.GetOptimalMinRowHeight());
      for (let row = run.first; row <= run.last;) {
        const old = heights.GetRangeData(row), stop = Math.min(run.last, old.mnRow2);
        if (height > old.maValue) heights.SetValue(row, stop, height);
        row = stop + 1;
      }
    }
    return SetOptimalHeightsToRows(context,
      /** Mutates actual sheet geometry. @param startRow - First. @param endRow - Last. @param height - Twips. @param fromApi - Shrink policy. @returns Changed. */
      (startRow, endRow, height, fromApi) => this.SetRowHeightRange(startRow, endRow, height, context.getPPTY(), fromApi),
      this.pRowFlags, first, last, api);
  }
  /** Borrows the native default`);
fs.writeFileSync(p,s);
