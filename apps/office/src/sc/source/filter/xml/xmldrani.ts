/** @fileoverview Calc ODS database range contexts and native range adoption. */
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScRange } from "../../../inc/address";
import { ScMF } from "../../../inc/attrib";
import { ScDBData, ScDBRangeType } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { STR_DB_GLOBAL_NONAME, STR_DB_LOCAL_NONAME } from "../../../inc/globalnames";
import { ScQueryParam } from "../../core/tool/queryparam";
import { ScXMLImportContext } from "./importcontext";
import { readDatabaseRangeAddress, ScXMLFilterContext } from "./xmlfilti";
import type { ScXMLImport } from "./xmlimprt";

/** Applies the source auto-filter flag and transfers ownership to the original range container. @param document - Workbook. @param range - New data. @param type - Original ownership category. */
export function AdoptDatabaseRange(
  document: ScDocument,
  range: ScDBData,
  type: ScDBRangeType,
): void {
  const { aStart, aEnd } = range.GetArea();
  const tab = aStart.Tab();
  if (range.HasAutoFilter())
    document.ApplyFlagsTab(aStart.Col(), aStart.Row(), aEnd.Col(), aStart.Row(), tab, ScMF.Auto);

  const collection = document.GetDBCollection();
  switch (type) {
    case ScDBRangeType.SheetAnonymous:
      document.SetAnonymousDBData(tab, range);
      break;
    case ScDBRangeType.GlobalAnonymous:
      collection.getAnonDBs().insert(range);
      break;
    case ScDBRangeType.GlobalNamed:
      collection.getNamedDBs().insert(range);
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

  /** Reads the original range flags and scope name. @param owner - Importer. @param attributes - Original range attributes. */
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
    if (token !== XMLToken.TABLE_FILTER) return new SvXMLIgnoreContext(true);
    return (this.filter = new ScXMLFilterContext(this.GetScImport(), attributes, this.query));
  }

  /** Defers native ownership transfer until sheet address resolution is available. */
  override endFastElement(): void {
    this.GetScImport().AddDatabaseRange(this);
  }

  /** Creates and adopts the completed original native database range. @param document - Completed workbook. */
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
    AdoptDatabaseRange(document, range, type);
  }
}
