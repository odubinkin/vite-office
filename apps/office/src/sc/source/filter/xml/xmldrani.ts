/** @fileoverview Calc ODS database range contexts and native range adoption. */
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScRange } from "../../../inc/address";
import { ScMF } from "../../../inc/attrib";
import { ScDBData, ScDBRangeType } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { ScSubTotalFunc } from "../../../inc/global";
import { STR_DB_GLOBAL_NONAME, STR_DB_LOCAL_NONAME } from "../../../inc/globalnames";
import { MAXSUBTOTAL, ScSubtotalGroup, ScSubTotalParam } from "../../core/data/subtotalparam";
import { ScQueryParam } from "../../core/tool/queryparam";
import { ScXMLImportContext } from "./importcontext";
import { readDatabaseRangeAddress, ScXMLFilterContext } from "./xmlfilti";
import type { ScXMLImport } from "./xmlimprt";
import { ScXMLSortContext } from "./xmlsorti";
import { subtotalFunctions } from "./XMLConverter";

/** Applies the original sparse AutoFilter header flags. @param document - Workbook. @param range - Native range. @returns Nothing. */
export function SetDatabaseRangeAutoFilterFlags(document: ScDocument, range: ScDBData): void {
  if (!range.HasAutoFilter()) return;
  const { aStart, aEnd } = range.GetArea();
  document.ApplyFlagsTab(
    aStart.Col(),
    aStart.Row(),
    aEnd.Col(),
    aStart.Row(),
    aStart.Tab(),
    ScMF.Auto,
  );
}

/** Transfers ownership to the original range container. @param document - Workbook. @param range - New data. @param type - Original ownership category. @returns Nothing. */
export function AdoptDatabaseRange(
  document: ScDocument,
  range: ScDBData,
  type: ScDBRangeType,
): void {
  const tab = range.GetArea().aStart.Tab();
  const collection = document.GetDBCollection();
  switch (type) {
    case ScDBRangeType.SheetAnonymous:
      document.SetAnonymousDBData(tab, range);
      break;
    case ScDBRangeType.GlobalAnonymous:
      collection.getAnonDBs().insert(range);
      break;
    case ScDBRangeType.GlobalNamed:
      if (!collection.getNamedDBs().insert(range)) range.Dispose();
      break;
  }
}

/** Reads the native database-ranges container at the spreadsheet level. */
export class ScXMLDatabaseRangesContext extends ScXMLImportContext {
  /** Dispatches a database range element. @param token - Child token. @param attributes - Range attributes. @returns Context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return token === XMLToken.TABLE_DATABASE_RANGE
      ? new ScXMLDatabaseRangeContext(this.GetScImport(), attributes)
      : new SvXMLIgnoreContext(true);
  }
}

/** Owns the deferred range metadata until all sheet names can be resolved. */
export class ScXMLDatabaseRangeContext extends ScXMLImportContext {
  private readonly name: string;
  private readonly address: string | null;
  private readonly query = new ScQueryParam();
  private readonly bByRow: boolean;
  private readonly bHasHeader: boolean;
  private readonly bHasFooter: boolean;
  private readonly bAutoFilter: boolean;
  private readonly bKeepFormats: boolean;
  private readonly bMoveCells: boolean;
  private readonly bStripData: boolean;
  private filter: ScXMLFilterContext | undefined;
  private sort: ScXMLSortContext | undefined;
  private subtotal: ScXMLSubTotalRulesContext | undefined;

  /** Reads the original range flags and scope name. @param owner - Importer. @param attributes - Original range attributes. @returns The initialized ScXMLDatabaseRangeContext instance. */
  constructor(owner: ScXMLImport, attributes: FastAttributeList) {
    super(owner);
    this.name = attributes.get(XMLToken.TABLE_NAME) ?? STR_DB_LOCAL_NONAME;
    this.address = attributes.get(XMLToken.TABLE_TARGET_RANGE_ADDRESS) ?? null;
    this.bByRow = attributes.get(XMLToken.TABLE_ORIENTATION) !== "column";
    this.bHasHeader = (attributes.get(XMLToken.TABLE_CONTAINS_HEADER) ?? "true") === "true";
    this.bHasFooter =
      (attributes.get(XMLToken.CALCEXT_CONTAINS_FOOTER) ??
        attributes.get(XMLToken.TABLE_CONTAINS_FOOTER)) === "true";
    this.bAutoFilter = attributes.get(XMLToken.TABLE_DISPLAY_FILTER_BUTTONS) === "true";
    this.bKeepFormats = attributes.get(XMLToken.TABLE_ON_UPDATE_KEEP_STYLES) === "true";
    this.bMoveCells = (attributes.get(XMLToken.TABLE_ON_UPDATE_KEEP_SIZE) ?? "true") !== "true";
    this.bStripData = (attributes.get(XMLToken.TABLE_HAS_PERSISTENT_DATA) ?? "true") !== "true";
    this.query.bByRow = this.bByRow;
  }

  /** Reads one filter descriptor through the native query context. @param token - Child token. @param attributes - Source metadata. @returns Context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token === XMLToken.TABLE_FILTER)
      return (this.filter = new ScXMLFilterContext(this.GetScImport(), attributes, this.query));
    if (token === XMLToken.TABLE_SORT) return (this.sort = new ScXMLSortContext(attributes));
    if (token === XMLToken.TABLE_SUBTOTAL_RULES)
      return (this.subtotal = new ScXMLSubTotalRulesContext(attributes));
    return new SvXMLIgnoreContext(true);
  }

  /** Defers native ownership transfer until sheet address resolution is available. @returns Nothing. */
  override endFastElement(): void {
    this.GetScImport().AddDatabaseRange(this);
  }

  /** Creates and adopts the completed original native database range. @param document - Completed workbook. @returns Nothing. */
  Apply(document: ScDocument): void {
    const area =
      this.address === null ? new ScRange() : readDatabaseRangeAddress(document, this.address);
    if (!area) return;
    const type = this.name.startsWith(STR_DB_LOCAL_NONAME)
      ? ScDBRangeType.SheetAnonymous
      : this.name.startsWith(STR_DB_GLOBAL_NONAME)
        ? ScDBRangeType.GlobalAnonymous
        : ScDBRangeType.GlobalNamed;
    const name =
      type === ScDBRangeType.SheetAnonymous
        ? STR_DB_LOCAL_NONAME
        : type === ScDBRangeType.GlobalAnonymous
          ? STR_DB_GLOBAL_NONAME
          : this.name;
    const range = new ScDBData(name, area, this.bByRow, this.bHasHeader, this.bHasFooter);
    range.SetAutoFilter(this.bAutoFilter);
    range.SetKeepFmt(this.bKeepFormats);
    range.SetDoSize(this.bMoveCells);
    range.SetStripData(this.bStripData);
    const advancedSource = this.filter?.Resolve(document, area) ?? null;
    range.SetQueryParam(this.query);
    range.SetAdvancedQuerySource(advancedSource);
    this.sort?.Apply(document, range);
    if (this.subtotal) range.SetSubTotalParam(this.subtotal.param);
    SetDatabaseRangeAutoFilterFlags(document, range);
    AdoptDatabaseRange(document, range, type);
  }
}

/** Imports the original subtotal descriptor flags and grouping rules. */
export class ScXMLSubTotalRulesContext extends SvXMLImportContext {
  public readonly param = new ScSubTotalParam();
  private groups = 0;

  /** Reads original XML defaults independently of the dialog defaults. @param attributes - Subtotal rule flags. @returns Context. */
  public constructor(attributes: FastAttributeList) {
    super();
    this.param.bIncludePattern = attributes.get(XMLToken.TABLE_BIND_STYLES_TO_CONTENT) === "true";
    this.param.bCaseSens = attributes.get(XMLToken.TABLE_CASE_SENSITIVE) === "true";
    this.param.bPagebreak = attributes.get(XMLToken.TABLE_PAGE_BREAKS_ON_GROUP_CHANGE) === "true";
    this.param.bSummaryBelow = (attributes.get(XMLToken.LOEXT_SUMMARY_BELOW) ?? "true") === "true";
    this.param.bDoSort = false;
  }

  /** Routes the optional sort-groups element and each native rule. @param token - Child token. @param attributes - Original attributes. @returns Child context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (token === XMLToken.TABLE_SORT_GROUPS) {
      this.param.bDoSort = true;
      this.param.bAscending = (attributes.get(XMLToken.TABLE_ORDER) ?? "ascending") === "ascending";
      const type = attributes.get(XMLToken.TABLE_DATA_TYPE) ?? "";
      if (type.startsWith("UserList") && type.length > 8) {
        this.param.bUserDef = true;
        this.param.nUserIndex = toInt32(type.slice(8)) & 0xffff;
      }
      return new SvXMLImportContext();
    }
    if (token === XMLToken.TABLE_SUBTOTAL_RULE && this.groups < MAXSUBTOTAL) {
      const group = this.param.aGroups[this.groups++] as ScSubtotalGroup;
      group.bActive = true;
      const field = toInt32(attributes.get(XMLToken.TABLE_GROUP_BY_FIELD_NUMBER) ?? "");
      group.nField = (field << 16) >> 16;
      return new ScXMLSubTotalRuleContext(group);
    }
    return null;
  }
}

/** Imports the original subtotal columns carried by one group. */
class ScXMLSubTotalRuleContext extends SvXMLImportContext {
  /** Accepts fields in their source order. @param group - Native target group. @returns Context. */
  public constructor(private readonly group: ScSubtotalGroup) {
    super();
  }

  /** Collects the original subtotal field number and function. @param token - Child token. @param attributes - Defined field. @returns Child context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (token !== XMLToken.TABLE_SUBTOTAL_FIELD) return null;
    this.group.pSubTotals.push([
      toInt32(attributes.get(XMLToken.TABLE_FIELD_NUMBER) ?? ""),
      subtotalFunctions.get(attributes.get(XMLToken.TABLE_FUNCTION) ?? "") ?? ScSubTotalFunc.NONE,
    ]);
    return new SvXMLImportContext();
  }
}
