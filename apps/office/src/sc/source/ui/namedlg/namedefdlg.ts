/** @fileoverview Source definition dialog values and name insertion. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScCompiler } from "../../core/tool/compiler";
import { RangeDataType, ScRangeData, type ScRangeNameMap } from "../../core/tool/rangenam";
import type { ScDocShell } from "../docshell/docsh";
import { ScUndoAddRangeData } from "../undo/undorangename";
import type { ScViewData } from "../inc/viewdata";

/** Source named expression fields. */
export interface ScNameDef {
  readonly name: string;
  readonly expression: string;
  readonly scope: number;
  readonly type: RangeDataType;
}

/** Source default and reference selection use fully qualified absolute addresses. @param document - Workbook. @param range - Pointed range. @param flags - Source formatting mode. @returns Name expression. */
export function FormatNameReference(
  document: ScDocument,
  range: ScRange,
  flags = ScRefFlags.RANGE_ABS_3D,
): string {
  const value = range.Format(
    document,
    flags,
    new ScAddress.Details(document.GetAddressConvention(), 0, 0),
  );
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Presents and accepts a native named formula or range. */
export class ScNameDefDlg {
  readonly document: ScDocument;
  readonly position: ScAddress;
  readonly expression: string;
  readonly scopes: readonly (readonly [number, string])[];

  /** Reads source selection and available scopes. @param view - Active sheet view. @param names - Optional staged scopes. @returns Definition model. */
  constructor(
    view: ScViewData,
    private readonly names?: ScRangeNameMap,
  ) {
    this.document = view.GetDocument();
    this.position = new ScAddress(view.GetCurX(), view.GetCurY(), view.CurrentTabForData());
    const range = new ScRange();
    view.GetSimpleArea(range);
    this.expression = FormatNameReference(this.document, range);
    const scopes: [number, string][] = [[-1, "Document (Global)"]];
    for (let tab = 0; tab < this.document.GetTableCount(); tab++) {
      const sheet = this.document.FetchTable(tab);
      if (sheet) scopes.push([tab, text(sheet.GetName())]);
    }
    this.scopes = scopes;
  }

  /** Checks name admission against the selected original scope. @param name - Entered spelling. @param scope - Sheet or -1. @param previous - Entry being edited. @returns Validation error. */
  CheckName(name: string, scope: number, previous?: ScRangeData): string {
    const names = this.names ? this.names.get(scope) : this.document.GetRangeName(scope);
    if (!names) return "Invalid scope.";
    const existing = names.findByUpperName(name.toUpperCase());
    if (existing && existing !== previous) return "The name is already in use.";
    const status = ScRangeData.IsNameValid(name, this.document);
    if (status === "reference") return "The name cannot be a cell reference.";
    return status === "syntax" ? "Invalid name." : "";
  }

  /** Checks formula syntax or the native list of print references. @param expression - Range or formula. @param type - Source flags. @returns Expression error. */
  CheckExpression(expression: string, type: RangeDataType): string {
    if (!expression.trim()) return "Enter a range or formula expression.";
    if (type & RangeDataType.PrintArea) {
      const details = new ScAddress.Details(this.document.GetAddressConvention(), 0, 0);
      for (const part of expression.split(/;(?![^']*'(?:[^']*'[^']*')*[^']*$)/u)) {
        const value = unicode(part);
        try {
          const range = new ScRange(0, 0, this.position.Tab());
          if (!(range.ParseAny(value, this.document, details) & ScRefFlags.VALID))
            return "Invalid print range.";
        } finally {
          value.dispose();
        }
      }
      return "";
    }
    const value = unicode(expression);
    try {
      const code = new ScCompiler(this.document, this.position, this.document.GetGrammar())
        .SetRangeNameMap(this.names)
        .CompileString(value);
      const error = code.GetCodeError();
      code.Clear();
      return error === FormulaError.NONE ? "" : "Invalid range or formula expression.";
    } finally {
      value.dispose();
    }
  }

  /** Compiles the proposed indexed definition without mutating the selected scope. @param data - Entered fields. @param previous - Entry being edited. @returns Owned definition or validation text. */
  CreateEntry(data: ScNameDef, previous?: ScRangeData): ScRangeData | string {
    const error =
      this.CheckName(data.name, data.scope, previous) ||
      this.CheckExpression(data.expression, data.type);
    if (error) return error;
    const entry = new ScRangeData(this.document, data.name, this.position, data.type);
    entry.CompileRangeData(data.expression, this.document.GetGrammar(), true, this.names);
    if (entry.GetCode().GetCodeError() === FormulaError.NONE) return entry;
    entry.GetCode().Clear();
    return "Invalid range or formula expression.";
  }

  /** Checks and adds an indexed definition with undo. @param shell - Active workbook shell. @param data - Entered fields. @param reuseFreeIndex - Source name-box insertion policy. @returns Error message or accepted empty string. */
  Add(shell: ScDocShell, data: ScNameDef, reuseFreeIndex = false): string {
    if (shell.GetDocument() !== this.document) return "The document has changed.";
    const entry = this.CreateEntry(data);
    if (typeof entry === "string") return entry;
    if (!this.document.GetRangeName(data.scope)?.insert(entry, reuseFreeIndex)) {
      entry.GetCode().Clear();
      return "Invalid range or formula expression.";
    }
    shell.GetUndoManager().AddUndoAction(new ScUndoAddRangeData(entry, data.scope));
    this.document.FetchTable(data.scope)?.SetStreamValid(false);
    shell.Broadcast(new SfxHint(SfxHintId.ScAreasChanged));
    shell.SetDocumentModified();
    return "";
  }
}
