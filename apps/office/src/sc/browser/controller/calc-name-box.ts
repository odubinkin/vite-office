/** @fileoverview Browser position-box dispatch of native Calc range names and addresses. */
import { StackVar } from "../../../formula/inc/token.enum";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRefFlags } from "../../inc/address";
import { getRangeFromToken } from "../../inc/reftokenhelper";
import { RangeDataType } from "../../source/core/tool/rangenam";
import { ScMarkType } from "../../source/ui/inc/viewdata";
import { FormatNameReference, ScNameDefDlg } from "../../source/ui/namedlg/namedefdlg";
import type { CalcViewController } from "./calc-view-controller";

/** Displays the source name of an exactly selected block, or its address in document syntax. @param this - Calc view controller. @returns Position box text. */
export function PositionText(this: CalcViewController): string {
  const document = this.shell.GetDocument();
  const range = new ScRange();
  this.viewData.GetSimpleArea(range);
  const match = document.GetRangeAtBlock(range);
  if (match) {
    const sheetName = match.sheetLocal && document.FetchTable(range.aStart.Tab())?.GetName();
    return sheetName ? match.data.name + " (" + text(sheetName) + ")" : match.data.name;
  }
  const convention = document.GetAddressConvention();
  if (convention !== FormulaGrammar.AddressConvention.CONV_XL_R1C1) return this.Address();
  const flags = ScRefFlags.RANGE_ABS & ~ScRefFlags.TAB_ABS & ~ScRefFlags.TAB2_ABS;
  return FormatNameReference(document, range, flags);
}

/** Resolves the typed address or name and runs the original position-box definition fallback. @param this - Calc view controller. @returns Whether accepted. */
export function GoToAddress(this: CalcViewController): boolean {
  if (!this.Commit()) return false;
  const label = this.addressText;
  const doc = this.shell.GetDocument();
  const origin = this.Position();
  const range = new ScRange(origin);
  const value = unicode(label);
  let valid: boolean;
  let named = false;
  try {
    const details = new ScAddress.Details(doc.GetAddressConvention(), 0, 0);
    valid = Boolean(range.ParseAny(value, doc, details) & ScRefFlags.VALID);
    if (!valid) {
      const local = /^(.*) \((.*)\)$/u.exec(label);
      const tab: [number] = [-1];
      if (local) {
        const sheet = unicode(local[2] ?? "");
        try {
          if (!doc.GetTable(sheet, tab)) return fail(this, "Invalid cell address.");
        } finally {
          sheet.dispose();
        }
      }
      const tokens = doc
        .GetRangeName(tab[0])
        ?.findByUpperName((local?.[1] ?? label).toUpperCase())
        ?.GetCode()
        .GetArray();
      const token = tokens?.length === 1 ? tokens[0] : undefined;
      if (
        token &&
        (token.GetType() === StackVar.svSingleRef || token.GetType() === StackVar.svDoubleRef)
      ) {
        named = getRangeFromToken(doc, range, token, origin);
        valid = named;
      }
      if (!valid && /^\d+$/u.test(label)) {
        const row = Number(label) - 1;
        if (row >= 0 && row <= doc.MaxRow()) {
          range.assign(new ScAddress(origin.Col(), row, origin.Tab()));
          valid = true;
        }
      }
      if (!valid && doc.GetTable(value, tab)) {
        this.SelectTab(tab[0]);
        return this.Position().Tab() === tab[0];
      }
      if (!valid && tokens) return fail(this, "The name does not reference a cell range.");
    }
  } finally {
    value.dispose();
  }
  if (valid && range.IsValid()) {
    const start = range.aStart;
    if (start.Tab() !== origin.Tab()) {
      this.SelectTab(start.Tab());
      if (this.Position().Tab() !== start.Tab()) return false;
    }
    if (!this.Select(start.Col(), start.Row())) return false;
    if (!range.aEnd.equals(start)) this.GetViewShell().MarkRange(range, false);
    this.SyncSheetView();
    if (named) this.ChangeAddress(label);
    else if (!range.aEnd.equals(start))
      this.ChangeAddress(FormatNameReference(doc, range, ScRefFlags.VALID));
    return true;
  }

  const model = new ScNameDefDlg(this.viewData);
  if (model.CheckName(label, -1)) return fail(this, "Invalid cell address.");
  if (this.viewData.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE)
    return fail(this, "Select a single range to define a name.");
  const message = model.Add(
    this.shell,
    {
      name: label,
      expression: FormatNameReference(doc, range),
      scope: -1,
      type: RangeDataType.Name,
    },
    true,
  );
  if (message) return fail(this, message);
  this.error = "";
  this.ChangeAddress(label);
  return true;
}

/** Shows the existing position-box error status. @param controller - Active view. @param message - Validation error. @returns Failed selection. */
function fail(controller: CalcViewController, message: string): false {
  controller.error = message;
  controller.ChangeAddress(controller.addressText);
  return false;
}
