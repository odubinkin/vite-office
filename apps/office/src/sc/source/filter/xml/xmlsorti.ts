/** @fileoverview Original Calc ODF sort and sort-key contexts. */
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScDBData } from "../../../inc/dbdata";
import type { ScDocument } from "../../../inc/document";
import { ScSortKeyState, ScSortNumberBehavior } from "../../core/data/sortparam";
import { readDatabaseRangeAddress } from "./xmlfilti";

/** Parsed sort field before the database range supplies the absolute field origin. */
interface ScXMLSortField {
  readonly field: number;
  readonly ascending: boolean;
  readonly dataType: string;
}

/** Reads the native sort descriptor from the database range's sort element. */
export class ScXMLSortContext extends SvXMLImportContext {
  private readonly fields: ScXMLSortField[] = [];

  /** Defers sheet names until the owning ranges are adopted. @param attributes - Original sort flags. @returns Context. */
  public constructor(private readonly attributes: FastAttributeList) {
    super();
  }

  /** Creates each native sort field context. @param token - Child token. @param attributes - Sort-by flags. @returns Individual field context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return token === XMLToken.TABLE_SORT_BY
      ? new ScXMLSortByContext(
          attributes,
          /** Retains one relative sort field. @param field - Original field. @returns Nothing. */
          (field) => {
            this.fields.push(field);
          },
        )
      : null;
  }

  /** Applies the original property values and shifts fields to the native range axis. @param document - Workbook with sheets. @param owner - Native range. @returns Nothing. */
  public Apply(document: ScDocument, owner: ScDBData): void {
    const attributes = this.attributes;
    const sort = owner.GetSortParam();
    try {
      sort.aDataAreaExtras.mbCellFormats =
        (attributes.get(XMLToken.TABLE_BIND_STYLES_TO_CONTENT) ?? "true") === "true";
      sort.bCaseSens = attributes.get(XMLToken.TABLE_CASE_SENSITIVE) === "true";
      const output = attributes.get(XMLToken.TABLE_TARGET_RANGE_ADDRESS);
      const destination =
        output === null ? null : readDatabaseRangeAddress(document, output)?.aStart;
      if (destination) {
        sort.bInplace = false;
        sort.nDestCol = destination.Col();
        sort.nDestRow = destination.Row();
        sort.nDestTab = destination.Tab();
      }
      const behavior = attributes.get(XMLToken.TABLE_EMBEDDED_NUMBER_BEHAVIOR);
      if (behavior === "double") sort.eSortNumberBehavior = ScSortNumberBehavior.DOUBLE;
      else if (behavior === "integer") sort.eSortNumberBehavior = ScSortNumberBehavior.INTEGER;
      const language =
        attributes.get(XMLToken.TABLE_RFC_LANGUAGE_TAG) ||
        [
          attributes.get(XMLToken.TABLE_LANGUAGE),
          attributes.get(XMLToken.TABLE_SCRIPT),
          attributes.get(XMLToken.TABLE_COUNTRY),
        ]
          .filter(Boolean)
          .join("-");
      if (language) {
        const tag = new LanguageTag(language);
        try {
          sort.aCollatorLocale.assign(tag.getLocale(false));
        } finally {
          tag.dispose();
        }
      }
      sort.aCollatorAlgorithm = attributes.get(XMLToken.TABLE_ALGORITHM) ?? "";
      const first = sort.bByRow ? sort.nCol1 : sort.nRow1;
      for (const [index, field] of this.fields.entries()) {
        const key = new ScSortKeyState();
        key.bDoSort = true;
        key.bAscending = field.ascending;
        key.nField = first + field.field;
        sort.maKeyState[index] = key;
        if (field.dataType.startsWith("UserList") && field.dataType.length > 8) {
          sort.bUserDef = true;
          sort.nUserIndex = toInt32(field.dataType.slice(8)) & 0xffff;
        }
      }
      owner.SetSortParam(sort);
    } finally {
      sort.Dispose();
    }
  }
}

/** Reads one original table:sort-by definition. */
class ScXMLSortByContext extends SvXMLImportContext {
  /** Retains the original sort-by attributes. @param attributes - Field attributes. @param addField - Parent field collector. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    private readonly addField: (field: ScXMLSortField) => void,
  ) {
    super();
  }

  /** Publishes the original defaults and relative field value. @returns Nothing. */
  public override endFastElement(): void {
    this.addField({
      field: toInt32(this.attributes.get(XMLToken.TABLE_FIELD_NUMBER) ?? ""),
      ascending: (this.attributes.get(XMLToken.TABLE_ORDER) ?? "ascending") === "ascending",
      dataType: this.attributes.get(XMLToken.TABLE_DATA_TYPE) ?? "automatic",
    });
  }
}
