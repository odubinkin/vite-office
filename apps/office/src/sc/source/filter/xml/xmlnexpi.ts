/** @fileoverview Original ODS named range and expression import contexts. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { RangeDataType } from "../../core/tool/rangenam";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Parsed name metadata whose sheet references are resolved after sheet creation. */
export interface ScMyNamedExpression {
  readonly scope: number;
  readonly name: string;
  readonly base: string;
  readonly symbol: string;
  readonly type: RangeDataType;
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
  const fallback = new ScAddress(0, 0, Math.max(expression.scope, 0));
  const split = expression.base.lastIndexOf(".");
  const spelling = expression.base.slice(0, split).replace(/^\$/u, "");
  const tab: [number] = [fallback.Tab()];
  if (split >= 0 && spelling) {
    const name = unicode(
      spelling.startsWith("'") ? spelling.slice(1, -1).replaceAll("''", "'") : spelling,
    );
    try {
      if (!document.GetTable(name, tab)) return fallback;
    } finally {
      name.dispose();
    }
  }
  const origin = new ScAddress(0, 0, tab[0]);
  const cell = expression.base.slice(split + 1);
  if (!/^\$?[A-Za-z]+\$?[1-9][0-9]*$/u.test(cell)) return fallback;
  const source = unicode(cell);
  try {
    return origin.Parse(source, document, ScAddress.detailsOOOa1) ? origin : fallback;
  } catch {
    return fallback;
  } finally {
    source.dispose();
  }
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
    let type =
      attributes.get(XMLToken.LOEXT_HIDDEN) === "true" ? RangeDataType.Hidden : RangeDataType.Name;
    for (const flag of (attributes.get(XMLToken.TABLE_RANGE_USABLE_AS) ?? "").split(/\s+/u))
      type |= tableRangeTypes.get(flag) ?? 0;
    const colon = source.indexOf(":");
    const symbol = range
      ? "[" + source + "]"
      : colon >= 0 && attributes.getNamespaceUri(source.slice(0, colon)) === ODF_NAMESPACES.of
        ? source.slice(colon + 1)
        : source;
    this.owner.AddNamedExpression({ name, base, symbol, type, scope: this.scope });
    return new SvXMLIgnoreContext(true);
  }
}
