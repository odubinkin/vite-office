/** @fileoverview Binds scanned Calc cell and range references to the native address flags. */
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { QuoteTabName } from "./address.ooo";
import type { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Binds native parser flags to complex reference data. @param name - Unwrapped reference. @param document - Calc sheet and limits owner. @param originAddress - Formula origin. @param details - Active reference convention. @param tab - Resolved tab. @param qualified - Whether the qualifier is present. @param absolute - Absolute sheet qualifier. @param deletedTab - Whether the sheet was deleted. @returns Native range token data. */
export function createDoubleReference(
  name: string,
  document: ScDocument,
  originAddress: ScAddress,
  details: InstanceType<typeof ScAddress.Details>,
  tab: number,
  qualified: boolean,
  absolute: boolean,
  deletedTab: boolean,
): ScComplexRefData {
  const origin = new ScAddress(originAddress);
  origin.SetTab(tab);
  const range = new ScRange(origin, origin),
    input = unicode(name);
  let flags: ScRefFlags;
  try {
    flags = range.Parse(input, document, details);
  } finally {
    input.dispose();
  }
  if (!(flags & ScRefFlags.VALID)) throw new Error("Range/name fallback is not implemented");
  range.aStart.SetTab(tab);
  const qualifiedEnd = Boolean(flags & ScRefFlags.TAB2_3D);
  if (!qualifiedEnd) range.aEnd.SetTab(tab);
  const reference = new ScComplexRefData();
  reference.InitRange(range);
  reference.Ref1.SetColRel(!(flags & ScRefFlags.COL_ABS));
  reference.Ref1.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
  reference.Ref1.SetTabRel(!absolute);
  reference.Ref1.SetFlag3D(qualified);
  reference.Ref2.SetColRel(!(flags & ScRefFlags.COL2_ABS));
  reference.Ref2.SetRowRel(!(flags & ScRefFlags.ROW2_ABS));
  reference.Ref2.SetTabRel(qualifiedEnd ? !(flags & ScRefFlags.TAB2_ABS) : !absolute);
  reference.Ref2.SetFlag3D(qualifiedEnd);
  reference.SetRange(document.GetSheetLimits(), range, originAddress);
  if (deletedTab) {
    reference.Ref1.SetTabDeleted(true);
    reference.Ref2.SetTabDeleted(true);
  }
  return reference;
}

/** Binds native parser flags and deleted axes to one cell reference. @param name - Unwrapped reference. @param document - Calc sheet and limits owner. @param originAddress - Formula origin. @param details - Active reference convention. @param tab - Resolved tab. @param qualified - Whether the qualifier is present. @param absolute - Absolute sheet qualifier. @param deletedTab - Whether the sheet was deleted. @returns Native reference data. */
export function createSingleReference(
  name: string,
  document: ScDocument,
  originAddress: ScAddress,
  details: InstanceType<typeof ScAddress.Details>,
  tab: number,
  qualified: boolean,
  absolute: boolean,
  deletedTab: boolean,
): ScSingleRefData {
  const address = new ScAddress(originAddress);
  const deletedCell = name === "#REF!";
  let flags = ScRefFlags.ZERO;
  if (!deletedCell) {
    const input = unicode(name);
    try {
      flags = address.Parse(input, document, details);
    } finally {
      input.dispose();
    }
    if (!(flags & ScRefFlags.VALID)) throw new Error("Reference/name fallback is not implemented");
  }
  address.SetTab(tab);
  const reference = new ScSingleRefData();
  reference.InitAddress(address);
  reference.SetColRel(!deletedCell && !(flags & ScRefFlags.COL_ABS));
  reference.SetRowRel(!deletedCell && !(flags & ScRefFlags.ROW_ABS));
  reference.SetTabRel(!absolute);
  reference.SetFlag3D(qualified);
  reference.SetAddress(document.GetSheetLimits(), address, originAddress);
  if (deletedCell) {
    reference.SetColDeleted(true);
    reference.SetRowDeleted(true);
  }
  if (deletedTab) reference.SetTabDeleted(true);
  return reference;
}

/** Resolves a qualified sheet before passing the A1 part to the original address parser. @param document - Calc sheet owner. @param sheet - Qualifier spelling. @returns Native sheet index. */
export function findReferenceSheet(document: ScDocument, sheet: string): number | undefined {
  const raw = sheet.replace(/^\$/u, "");
  const name = unicode(raw.startsWith("'") ? raw.slice(1, -1).replaceAll("''", "'") : raw);
  const tab: [number] = [-1];
  try {
    return document.GetTable(name, tab) ? tab[0] : undefined;
  } finally {
    name.dispose();
  }
}

/** Formats one qualified sheet using the original formula convention. @param document - Sheet owner. @param grammar - Active formula grammar. @param tab - Native sheet. @param absolute - Absolute sheet flag. @returns Prefix including delimiter. */
export function FormatSheet(
  document: ScDocument,
  grammar: Grammar,
  tab: number,
  absolute: boolean,
): string {
  const source = document.FetchTable(tab)?.GetName();
  if (!source) return "#REF!";
  const quoted = QuoteTabName(text(source));
  if (IsExcelReference(grammar)) return quoted + "!";
  return (absolute ? "$" : "") + quoted + ".";
}
/** Reads the separator used by the current sheet-qualified syntax. @param grammar - Active formula grammar. @returns Whether it uses an Excel separator. */
export function IsExcelReference(grammar: Grammar): boolean {
  const convention = FormulaGrammar.extractRefConvention(grammar);
  return (
    convention >= FormulaGrammar.AddressConvention.CONV_XL_A1 &&
    convention <= FormulaGrammar.AddressConvention.CONV_XL_OOX
  );
}
