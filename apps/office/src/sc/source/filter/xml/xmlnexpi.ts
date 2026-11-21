/** @fileoverview Original ODS named range and expression import contexts. */
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { RangeDataType } from "../../core/tool/rangenam";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";
import { ConvertCellRangeAddress } from "./XMLConverter";

/** Parsed name metadata whose sheet references are resolved after sheet creation. */
export interface ScMyNamedExpression {
  readonly scope: number;
  readonly name: string;
  readonly base: string;
  readonly symbol: string;
  readonly type: RangeDataType;
  readonly grammar: Grammar;
}

const tableRangeTypes = new Map<string, RangeDataType>([
  ["repeat-column", RangeDataType.ColHeader],
  ["repeat-row", RangeDataType.RowHeader],
  ["filter", RangeDataType.Criteria],
  ["print-range", RangeDataType.PrintArea],
  ["hidden", RangeDataType.Hidden],
]);

/** Finds the real named-expression base, with the source default for invalid addresses. @param document - Destination graph. @param expression - Actual definition. @returns Native reference base. */
export function GetNamedExpressionBase(
  document: ScDocument,
  expression: ScMyNamedExpression,
): ScAddress {
  const position = new ScAddress();
  if (
    !ScRangeStringConverter.GetAddressFromString(
      position,
      expression.base,
      document,
      FormulaGrammar.AddressConvention.CONV_OOO,
      [0],
    )
  )
    position.SetTab(Math.max(expression.scope, 0));
  return position;
}

/** Admits named expressions for a sheet or the whole document. */
export class ScXMLNamedExpressionsContext extends ScXMLImportContext {
  /** Binds definition scope. @param owner - Native XML importer. @param scope - Sheet, or -1 for global. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly scope: number,
  ) {
    super(owner);
  }

  /** Reads actual range and expression properties without an eager formula compile. @param element - Source name kind. @param attributes - Source attributes. @returns Leaf context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const range = element === XMLToken.TABLE_NAMED_RANGE;
    if (!range && element !== XMLToken.TABLE_NAMED_EXPRESSION)
      throw new Error("ODS named expression is invalid");
    const name = attributes.get(XMLToken.TABLE_NAME);
    const base = attributes.get(XMLToken.TABLE_BASE_CELL_ADDRESS) ?? "";
    const source = attributes.get(
      range ? XMLToken.TABLE_CELL_RANGE_ADDRESS : XMLToken.TABLE_EXPRESSION,
    );
    if (!name || source === null)
      throw new Error("ODS named expression is missing a name or formula");
    let type = RangeDataType.Name;
    let grammar: Grammar = FormulaGrammar.Grammar.GRAM_ODFF;
    let symbol = source;
    if (range) {
      for (const flag of (attributes.get(XMLToken.TABLE_RANGE_USABLE_AS) ?? "").split(" "))
        type |= tableRangeTypes.get(flag) ?? 0;
      grammar = FormulaGrammar.Grammar.GRAM_ODFF_A1;
      symbol = ConvertCellRangeAddress(source);
    } else {
      if (attributes.get(XMLToken.LOEXT_HIDDEN) === "true") type |= RangeDataType.Hidden;
      const colon = source.indexOf(":");
      const namespace = colon < 0 ? null : attributes.getNamespaceUri(source.slice(0, colon));
      if (namespace === ODF_NAMESPACES.of || namespace === "http://openoffice.org/2004/calc")
        symbol = source.slice(colon + 1);
      if (namespace === "http://openoffice.org/2004/calc")
        grammar = FormulaGrammar.Grammar.GRAM_PODF;
    }
    this.owner.AddNamedExpression({ name, base, symbol, type, grammar, scope: this.scope });
    return new SvXMLIgnoreContext(true);
  }
}
