/** @fileoverview Source Calc clipboard document and plain text transfer for scalar sheet selections. */
import { SfxObjectShell } from "../../../../sfx2/source/doc/objsh";
import { SvStream } from "../../../../tools/source/stream/stream";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScCellFormat } from "../../core/tool/cellform";
import { ScAsciiOptions } from "../dbgui/asciiopt";
import { ScImportExport } from "../docshell/impex";
import type { ScViewData } from "../inc/viewdata";
import { ScMarkType } from "../inc/viewdata";

/** Native flags represented by the default clipboard cell copy. */
export const calcCellClipboardFlags = (InsertDeleteFlags.CONTENTS |
  InsertDeleteFlags.ATTRIB) as InsertDeleteFlags;

/** Captures the source cells without moving the cursor or changing the live sheet. @param view - Active view. @returns Owned clipboard document, or no supported selection. */
export function CopyToClipSingleRange(view: ScViewData): ScDocument | undefined {
  const range = new ScRange();
  if (view.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE) return undefined;
  const doc = view.GetDocument();
  const tab = view.CurrentTabForData();
  range.aStart.SetTab(tab);
  range.aEnd.SetTab(tab);
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  try {
    clip.ResetClip(doc, tab);
    if (doc.GetAutoCalc()) {
      const cells = new ScHorizontalCellIterator(
        doc,
        tab,
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
      );
      const col: [number] = [0],
        row: [number] = [0];
      const dirty: ScFormulaCell[] = [];
      for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
        const formula = cell.getFormula();
        if (formula?.GetDirty()) dirty.push(formula);
      }
      // Formula interpretation can resize a spill range. Finish traversal before doing it.
      for (const formula of dirty) if (formula.GetDirty()) formula.Interpret();
    }
    doc.CopyToDocument(range, calcCellClipboardFlags, false, clip);
    clip.SetClipArea(range);
    return clip;
  } catch (error) {
    clip.Dispose();
    throw error;
  }
}

/** Renders the original tab-separated text representation, quoting embedded separators and newlines. @param clip - Native transfer data. @param source - Active workbook for displayed values. @returns Portable text. */
export function ExportClipboardText(clip: ScDocument, source: ScDocument): string {
  const range = clip.GetClipParam().getWholeRange();
  const { aStart, aEnd } = range;
  const lastCol: [number] = [aEnd.Col()],
    lastRow: [number] = [aEnd.Row()];
  if (lastCol[0] === clip.MaxCol() || lastRow[0] === clip.MaxRow()) {
    const dataCol: [number] = [0],
      dataRow: [number] = [0];
    clip.GetCellArea(aStart.Tab(), dataCol, dataRow);
    if (lastCol[0] === clip.MaxCol()) lastCol[0] = Math.max(aStart.Col(), dataCol[0]);
    if (lastRow[0] === clip.MaxRow()) lastRow[0] = Math.max(aStart.Row(), dataRow[0]);
  }
  const rows: string[] = [];
  const position = new ScAddress(aStart);
  for (let row = aStart.Row(); row <= lastRow[0]; ++row) {
    const fields: string[] = [];
    position.SetRow(row);
    for (let col = aStart.Col(); col <= lastCol[0]; ++col) {
      position.SetCol(col);
      const value = ScCellFormat.GetOutputString(
        source,
        position,
        source.GetRefCellValue(position),
      );
      try {
        const field = text(value);
        fields.push(/[\t\r\n"]/.test(field) ? '"' + field.replaceAll('"', '""') + '"' : field);
      } finally {
        value.dispose();
      }
    }
    rows.push(fields.join("\t"));
  }
  return rows.join("\n");
}

/** Supplies the source clipboard text-import options to the text importer. @param dialog - Clipboard text for interactive separator detection. @returns Default options. */
export function ClipboardTextOptions(dialog?: string): ScAsciiOptions {
  const options = new ScAsciiOptions();
  options.aFieldSeps = "\t";
  options.bEvaluateFormulas = true;
  options.bSkipEmptyCells = dialog !== undefined;
  options.bDetectSpecialNumber = dialog !== undefined;
  if (dialog) {
    const stream = new SvStream(new TextEncoder().encode(dialog), options.eCharSet);
    options.aFieldSeps =
      SfxObjectShell.DetectCsvSeparators(stream, options.eCharSet, options.cTextSep) || "\t";
  }
  return options;
}

/** Staged native text import and the source overflow outcome. */
interface ImportedClipboardText {
  readonly clip: ScDocument;
  readonly overflow: boolean;
}

/** Imports a text transfer at its real destination origin before the undoable paste starts. @param doc - Destination workbook. @param origin - Original paste origin. @param value - Clipboard text. @param options - Text import options. @returns Independent clipboard if the imported rectangle is valid. */
export function ImportClipboardText(
  doc: ScDocument,
  origin: ScAddress,
  value: string,
  options: ScAsciiOptions,
): ImportedClipboardText | undefined {
  if (!value) return undefined;
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  let attached = false;
  try {
    clip.ResetClip(doc, origin.Tab());
    clip.SetGrammar(doc.GetGrammar());
    const converter = new ScImportExport(clip, origin, doc);
    converter.SetExtOptions(options);
    if (!converter.ImportStream(new TextEncoder().encode(value))) return undefined;
    const [columns, rows] = converter.GetImportedSize();
    if (!columns || !rows) return undefined;
    clip.SetClipArea(
      new ScRange(
        origin.Col(),
        origin.Row(),
        origin.Tab(),
        origin.Col() + columns - 1,
        origin.Row() + rows - 1,
        origin.Tab(),
      ),
    );
    attached = true;
    return { clip, overflow: converter.IsOverflow() };
  } finally {
    if (!attached) clip.Dispose();
  }
}

/** Applies only detected text-import number formats over the existing destination cell styles. @param doc - Target workbook. @param clip - Parsed text at its actual destination coordinates. @returns Nothing. */
export function ApplyImportedNumberFormats(doc: ScDocument, clip: ScDocument): void {
  const { aStart, aEnd } = clip.GetClipParam().getWholeRange();
  const tab = aStart.Tab();
  const cells = new ScHorizontalCellIterator(
    clip,
    tab,
    aStart.Col(),
    aStart.Row(),
    aEnd.Col(),
    aEnd.Row(),
  );
  const col: [number] = [0],
    row: [number] = [0];
  for (let cell = cells.GetNext(col, row); cell; cell = cells.GetNext(col, row)) {
    const position = new ScAddress(col[0], row[0], tab);
    const format = clip.GetPattern(position)?.GetNumberFormat(clip.GetNonThreadedContext()) ?? 0;
    if (format) doc.SetNumberFormat(position, format);
  }
}
