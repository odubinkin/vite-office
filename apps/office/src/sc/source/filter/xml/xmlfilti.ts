/** @fileoverview Native Calc ODS database filter and ordered query condition contexts. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SV_COUNTRY_LANGUAGE_OFFSET, SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";
import { stringToDouble } from "../../../../sal/inc/rtl/math";
import { Converter } from "../../../../sax/source/tools/converter";
import { Color, ColorTransparency, COL_AUTO } from "../../../../tools/inc/color";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScQueryConnect, ScQueryOp } from "../../../inc/global";
import type { ScDBQueryItem, ScQueryParam } from "../../core/tool/queryparam";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

const normal = SearchParam.SearchType.Normal;
const regexp = SearchParam.SearchType.Regexp;
const and = ScQueryConnect.SC_AND;
const or = ScQueryConnect.SC_OR;
/** An ODF operator spelling and the corresponding native enum. */
type QueryOpToken = readonly [text: string, operation: ScQueryOp];

/** XML spellings of the native non-pattern filter operators. */
export const queryOps: readonly QueryOpToken[] = [
  ["=", ScQueryOp.SC_EQUAL],
  ["<", ScQueryOp.SC_LESS],
  [">", ScQueryOp.SC_GREATER],
  ["<=", ScQueryOp.SC_LESS_EQUAL],
  [">=", ScQueryOp.SC_GREATER_EQUAL],
  ["!=", ScQueryOp.SC_NOT_EQUAL],
  ["top values", ScQueryOp.SC_TOPVAL],
  ["bottom values", ScQueryOp.SC_BOTVAL],
  ["top percent", ScQueryOp.SC_TOPPERC],
  ["bottom percent", ScQueryOp.SC_BOTPERC],
  ["contains", ScQueryOp.SC_CONTAINS],
  ["does-not-contain", ScQueryOp.SC_DOES_NOT_CONTAIN],
  ["begins-with", ScQueryOp.SC_BEGINS_WITH],
  ["does-not-begin-with", ScQueryOp.SC_DOES_NOT_BEGIN_WITH],
  ["ends-with", ScQueryOp.SC_ENDS_WITH],
  ["does-not-end-with", ScQueryOp.SC_DOES_NOT_END_WITH],
];
const operators = new Map(queryOps);

/** Reads the original ODF filter color and automatic sentinel. @param value - Native lexical color. @returns Native Color value. */
export function readFilterColor(value: string): Color {
  if (value === "transparent" || value === "window-font-color") return new Color(COL_AUTO);
  const packed: [number] = [0];
  Converter.convertColor(packed, value);
  return new Color(ColorTransparency, packed[0], "ColorTransparencyTag");
}

/** Reads the first database range address through Calc's OOO converter. @param document - Native document. @param source - ODF address. @returns Parsed range or null. */
export function readDatabaseRangeAddress(document: ScDocument, source: string): ScRange | null {
  const range = new ScRange();
  return ScRangeStringConverter.GetRangeFromString(
    range,
    source,
    document,
    FormulaGrammar.AddressConvention.CONV_OOO,
    [0],
  )
    ? range
    : null;
}

/** Applies Calc's format recognition used by the native non-rounding PrepareQuery path. @param doc - Native document. @param item - Parsed query item. @returns Prepared item. */
function prepareQueryItem(doc: ScDocument, item: ScDBQueryItem): ScDBQueryItem {
  if (item.type !== "string") return item;
  const formatter = doc.GetFormatTable(),
    index: [number] = [0],
    number: [number] = [0];
  const source = unicode(item.value);
  try {
    if (!formatter.IsNumberFormat(source, index, number)) return item;
  } finally {
    source.dispose();
  }
  const type = formatter.GetEntry(index[0])?.GetType();
  switch (type) {
    case SvNumFormatType.NUMBER:
    case SvNumFormatType.FRACTION:
    case SvNumFormatType.SCIENTIFIC:
    case SvNumFormatType.DATETIME:
      return { type: "number", value: number[0], lexical: item.value };
    case SvNumFormatType.DATE:
      return index[0] % SV_COUNTRY_LANGUAGE_OFFSET
        ? { type: "date", value: item.value }
        : { type: "number", value: number[0], lexical: item.value };
    default:
      return item;
  }
}

/** Owns the flattened native support for OR groups and nested AND groups. */
export class ScXMLFilterContext extends ScXMLImportContext {
  private readonly connections: { connect: ScQueryConnect; hasCondition: boolean }[] = [];
  private readonly target: string;
  private readonly conditionSource: string;

  /** Captures destination and advanced-condition addresses before the workbook is finalized. @param owner - Native importer. @param attributes - Filter flags. @param query - Original query. @returns The initialized ScXMLFilterContext instance. */
  constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    private readonly query: ScQueryParam,
  ) {
    super(owner);
    this.target = attributes.get(XMLToken.TABLE_TARGET_RANGE_ADDRESS) ?? "";
    this.conditionSource = attributes.get(XMLToken.TABLE_CONDITION_SOURCE_RANGE_ADDRESS) ?? "";
    this.query.bDuplicate =
      (attributes.get(XMLToken.TABLE_DISPLAY_DUPLICATES) ?? "true") === "true";
  }

  /** Parses the top-level condition and connection groups. @param token - Child token. @param attributes - Child attributes. @returns Context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return this.CreateFilterChild(token, attributes);
  }

  /** Creates a supported group child under the current connection. @param token - Child token. @param attributes - Child attributes. @param group - Enclosing group connection. @returns Context. */
  CreateFilterChild(
    token: XMLToken,
    attributes: FastAttributeList,
    group?: ScQueryConnect,
  ): SvXMLImportContext {
    const owner = this.GetScImport();
    if (token === XMLToken.TABLE_FILTER_CONDITION)
      return new ScXMLConditionContext(owner, this, attributes);
    if (token === XMLToken.TABLE_FILTER_AND && group !== and)
      return new ScXMLFilterGroupContext(owner, this, and);
    if (token === XMLToken.TABLE_FILTER_OR && group === undefined)
      return new ScXMLFilterGroupContext(owner, this, or);
    return new SvXMLIgnoreContext(true);
  }

  /** Opens a native boolean group. @param connect - Group connector. @returns Nothing. */
  OpenConnection(connect: ScQueryConnect): void {
    this.connections.push({ connect, hasCondition: false });
  }

  /** Drops the active group at its end. @returns Nothing. */
  CloseConnection(): void {
    this.connections.pop();
  }

  /** Appends a condition in document order using the original connection and shared case/search options. @param attributes - Condition scope. @param items - Explicit set items. @returns Nothing. */
  AppendCondition(attributes: FastAttributeList, items: readonly ScDBQueryItem[]): void {
    const group = this.connections.at(-1);
    const connect = !group
      ? or
      : group.hasCondition
        ? group.connect
        : (this.connections.at(-2)?.connect ?? and);
    if (group) group.hasCondition = true;

    const operator = attributes.get(XMLToken.TABLE_OPERATOR) ?? "=";
    const empty = operator === "empty" && !items.length;
    const eOp =
      operator === "!match"
        ? ScQueryOp.SC_NOT_EQUAL
        : (operators.get(operator) ?? ScQueryOp.SC_EQUAL);
    this.query.bCaseSens = attributes.get(XMLToken.TABLE_CASE_SENSITIVE) === "true";
    this.query.eSearchType = operator === "match" || operator === "!match" ? regexp : normal;

    const field = attributes.getAsInteger(XMLToken.TABLE_FIELD_NUMBER) ?? 0;
    let datatype = "";
    for (const [token, value] of attributes)
      if (token === XMLToken.TABLE_DATA_TYPE || token === XMLToken.LOEXT_DATA_TYPE)
        datatype = value;
    const value = attributes.get(XMLToken.TABLE_VALUE) ?? "";
    let item: ScDBQueryItem;
    if (empty) item = { type: "number", value: 0x42 };
    else if (datatype === "number") {
      const source = unicode(value);
      try {
        item = { type: "number", value: stringToDouble(source, 46, 0) };
      } finally {
        source.dispose();
      }
    } else if (datatype === "text-color" || datatype === "background-color")
      item = { type: datatype, value: readFilterColor(value) };
    else item = { type: "string", value };
    this.query.entries.push({
      nField: field,
      eConnect: connect,
      eOp,
      ...(empty ? { empty } : {}),
      items: items.length ? items : [item],
    });
  }

  /** Resolves output placement and turns relative fields into the native absolute fields. @param document - Completed workbook. @param range - Target range. @returns Optional advanced filter source. */
  Resolve(document: ScDocument, range: ScRange): ScRange | null {
    const target = this.target
      ? readDatabaseRangeAddress(document, this.target)?.aStart
      : undefined;
    if (target) {
      this.query.bInplace = false;
      this.query.nDestTab = target.Tab();
      this.query.nDestCol = target.Col();
      this.query.nDestRow = target.Row();
    }
    const fieldStart = this.query.bByRow ? range.aStart.Col() : range.aStart.Row();
    for (const [index, entry] of this.query.entries.entries()) {
      this.query.entries[index] = {
        ...entry,
        nField: Math.max(-0x80000000, Math.min(0x7fffffff, entry.nField + fieldStart)),
        items: entry.items.map(
          /** Prepares the original stored lexical criterion. @param item - Criterion. @returns Prepared item. */
          (item) => prepareQueryItem(document, item),
        ),
      };
    }
    return this.conditionSource ? readDatabaseRangeAddress(document, this.conditionSource) : null;
  }
}

/** Original AND and OR filter contexts share the same flat query owner. */
class ScXMLFilterGroupContext extends ScXMLImportContext {
  /** Opens the enclosing query connection. @param owner - Importer. @param filter - Query owner. @param connect - Group kind. @returns The initialized ScXMLFilterGroupContext instance. */
  constructor(
    owner: ScXMLImport,
    private readonly filter: ScXMLFilterContext,
    private readonly connect: ScQueryConnect,
  ) {
    super(owner);
    filter.OpenConnection(connect);
  }

  /** Dispatches only the children admitted by the source group. @param token - XML child. @param attributes - XML attributes. @returns Context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return this.filter.CreateFilterChild(token, attributes, this.connect);
  }

  /** Restores the preceding connection. @returns Nothing. */
  override endFastElement(): void {
    this.filter.CloseConnection();
  }
}

/** Owns one filter-condition and any filter set values. */
class ScXMLConditionContext extends ScXMLImportContext {
  private readonly items: ScDBQueryItem[] = [];

  /** Keeps original attributes until the condition closes. @param owner - Importer. @param filter - Query owner. @param attributes - Condition attributes. @returns The initialized ScXMLConditionContext instance. */
  constructor(
    owner: ScXMLImport,
    private readonly filter: ScXMLFilterContext,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Collects a native filter-set value. @param token - XML child. @param attributes - Item attributes. @returns Skipping context. */
  override createFastChildContext(token: XMLToken, attributes: FastAttributeList) {
    if (token === XMLToken.TABLE_FILTER_SET_ITEM) {
      const value = attributes.get(XMLToken.TABLE_VALUE);
      if (value !== null) this.items.push({ type: "string", value });
    }
    return new SvXMLIgnoreContext(true);
  }

  /** Adopts this condition in query order. @returns Nothing. */
  override endFastElement(): void {
    this.filter.AppendCondition(this.attributes, this.items);
  }
}
