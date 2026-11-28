/** @fileoverview Original all-scope name manager editing and table rows. */
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { QuoteTabName } from "../../core/tool/address.ooo";
import {
  RangeDataType,
  CloneRangeNameMap,
  type ScRangeData,
  type ScRangeNameMap,
  type ScRangeName,
} from "../../core/tool/rangenam";
import type { ScViewData } from "../inc/viewdata";
import { ScNameDefDlg, type ScNameDef } from "./namedefdlg";

/** Stable identity and original name-manager table fields. */
export interface ScRangeNameLine extends ScNameDef {
  readonly index: number;
  readonly scopeLabel: string;
}

/** Definition flags exposed by the original name dialogs. */
export const rangeOptions = [
  [RangeDataType.PrintArea, "Print range"],
  [RangeDataType.Criteria, "Filter"],
  [RangeDataType.ColHeader, "Repeat column"],
  [RangeDataType.RowHeader, "Repeat row"],
] as const;

/** Original name draft with explicit close and cancellation ownership. */
export class ScNameDlg {
  readonly names: Map<number, ScRangeName>;
  readonly editor: ScNameDefDlg;
  changed = false;
  selected: { readonly scope: number; readonly index: number } | undefined;
  private transferred = false;

  /** Copies each native scope map. @param view - Source position and workbook. @returns Draft session. */
  constructor(readonly view: ScViewData) {
    this.names = CloneRangeNameMap(view.GetDocument());
    this.editor = new ScNameDefDlg(view, this.names);
  }

  /** Reads name, rendered reference and scope for each visible entry. @returns Table rows. */
  GetRows(): ScRangeNameLine[] {
    const grammar = this.editor.document.GetGrammar();
    return this.editor.scopes.flatMap(
      /** Builds native range-name rows for the chosen document or sheet scope. @param entry - Scope identifier and display label. @returns Rows visible in this scope. */ ([
        scope,
        scopeLabel,
      ]) => {
        const entries = this.names.get(scope);
        if (!entries) return [];
        return Array.from(entries)
          .filter(
            /** Removes hidden and database names from the range-name editor. @param entry - Native range data. @returns Whether the range name is visible. */ (
              entry,
            ) => !(entry.type & (RangeDataType.Database | RangeDataType.Hidden)),
          )
          .map(
            /** Projects a visible range name to its editor fields. @param entry - Native range data. @returns Name, expression, flags and source identity. */ (
              entry,
            ) => ({
              index: entry.GetIndex(),
              name: entry.name,
              expression: entry.GetSymbol(grammar, this.editor.position, this.names),
              type: entry.type,
              scope,
              scopeLabel,
            }),
          );
      },
    );
  }

  /** Edits the row while retaining its native index when the scope stays the same. @param old - Selected row. @param data - Draft fields. @returns Updated value or validation text. */
  Edit(old: ScRangeNameLine | undefined, data: ScNameDef): ScRangeData | string {
    const from = old ? this.names.get(old.scope) : undefined;
    const previous = old ? from?.findByIndex(old.index) : undefined;
    const target = this.names.get(data.scope);
    if (!target) return "Invalid scope.";
    const same = from === target;
    // The original NameModified only checks duplicate spelling when the name changes.
    const existing =
      !same && previous?.name === data.name.trim()
        ? target.findByUpperName(previous.GetUpperName())
        : undefined;
    if (existing && previous) {
      const invalid = this.editor.CheckExpression(data.expression, data.type);
      if (invalid) return invalid;
      from?.erase(previous);
      this.changed = true;
      this.selected = { scope: data.scope, index: existing.GetIndex() };
      return existing;
    }

    const entry = this.editor.CreateEntry(
      { ...data, name: data.name.trim() },
      same ? previous : undefined,
    );
    if (typeof entry === "string") return entry;
    if (previous && same) {
      entry.SetIndex(previous.GetIndex());
      target.erase(previous);
    }
    if (!target.insert(entry, false)) {
      entry.GetCode().Clear();
      return "The range name could not be added.";
    }
    if (previous && !same) from?.erase(previous);
    this.changed = true;
    this.selected = { scope: data.scope, index: entry.GetIndex() };
    return entry;
  }

  /** Removes visible selected definitions from the draft. @param rows - Selected rows. @returns Nothing. */
  Remove(rows: readonly ScRangeNameLine[]): void {
    for (const row of rows) {
      const scope = this.names.get(row.scope);
      const entry = scope?.findByIndex(row.index);
      if (entry) {
        scope?.erase(entry);
        this.changed = true;
      }
    }
  }

  /** Transfers an accepted changed map to the history owner. @returns Scope snapshots. */
  TakeResult(): ScRangeNameMap | undefined {
    if (!this.changed || this.transferred) return undefined;
    this.transferred = true;
    return this.names;
  }

  /** Releases a cancelled draft. @returns Nothing. */
  Dispose(): void {
    if (!this.transferred) for (const names of this.names.values()) names.clear();
  }
}

/** Formats the scope prefix used by the native Insert Name dialog. @param row - Selected line. @param convention - Active sheet separator convention. @returns Formula name. */
export function FormatPastedRangeName(row: ScRangeNameLine, convention: AddressConvention): string {
  const grammar = FormulaGrammar.AddressConvention;
  const separator =
    convention === grammar.CONV_XL_A1 ||
    convention === grammar.CONV_XL_R1C1 ||
    convention === grammar.CONV_XL_OOX
      ? "!"
      : ".";
  return row.scope < 0 ? row.name : QuoteTabName(row.scopeLabel) + separator + row.name;
}
