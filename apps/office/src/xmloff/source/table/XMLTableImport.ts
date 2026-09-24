/** @fileoverview Imports the bounded table and table-style SAX contexts from pinned xmloff table import. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { importOdfLength } from "../text/XMLTextPropertySetContext";
import { XMLParaContext, type XMLTextImportTarget } from "../text/txtparai";

/** Supported ODF table style families and physical properties. */
export type OdfTableStyle =
  | {
      readonly family: "table";
      readonly width?: number | undefined;
      readonly align?: "left" | "center" | "right" | "margins" | undefined;
      readonly marginLeft?: number | undefined;
      readonly marginTop?: number | undefined;
      readonly marginBottom?: number | undefined;
      readonly borderModel?: "collapsing" | "separating" | undefined;
    }
  | { readonly family: "table-column"; readonly columnWidth?: number | undefined }
  | {
      readonly family: "table-row";
      readonly minHeight?: number | undefined;
      readonly keepTogether?: boolean | undefined;
    }
  | {
      readonly family: "table-cell";
      readonly padding?: number | undefined;
      readonly border?: string | undefined;
      readonly verticalAlign?: "top" | "middle" | "bottom" | undefined;
    };

/** Writer-facing streaming table operations; canonical ownership stays in sw. */
export interface XMLTableImportTarget extends XMLTextImportTarget {
  registerTableStyle(name: string, style: OdfTableStyle): void;
  beginTable(name: string, styleName: string): void;
  addTableColumn(styleName: string): void;
  beginTableRow(styleName: string): void;
  beginTableCell(styleName: string): void;
  endTableCell(): void;
  endTableRow(): void;
  endTable(): void;
  addTableSoftPageBreak(): void;
}

/** Parses table style values without silently accepting malformed geometry. */
export class XMLTableStyleContext extends SvXMLImportContext {
  private readonly name: string;
  private readonly family: OdfTableStyle["family"];
  private style: OdfTableStyle | undefined;

  /** Opens one named table style. @param target - Writer style sink. @param attributes - Style identity. @returns Nothing. */
  public constructor(
    private readonly target: Pick<XMLTableImportTarget, "registerTableStyle">,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.STYLE_NAME,
        XMLToken.STYLE_DISPLAY_NAME,
        XMLToken.STYLE_FAMILY,
        XMLToken.STYLE_PARENT_STYLE_NAME,
      ],
      "table style",
    );
    this.name = attributes.require(XMLToken.STYLE_NAME, "table style name");
    const family = attributes.require(XMLToken.STYLE_FAMILY, "table style family");
    if (
      family !== "table" &&
      family !== "table-column" &&
      family !== "table-row" &&
      family !== "table-cell"
    )
      throw new Error(`Unsupported ODF table style family: ${family}`);
    this.family = family;
  }

  /** Imports one family-matched physical property child. @param element - Child token. @param attributes - Physical values. @returns Property context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const length =
      /** Processes one ODF table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
        token: XMLToken,
        label: string,
      ): number | undefined => {
        const value = attributes.get(token);
        return value === null ? undefined : importOdfLength(value, false, label);
      };
    if (this.style !== undefined)
      throw new Error(`Duplicate ODF table style properties: ${this.name}`);
    if (this.family === "table" && element === XMLToken.STYLE_TABLE_PROPERTIES) {
      attributes.assertOnly(
        [
          XMLToken.STYLE_WIDTH,
          XMLToken.STYLE_REL_WIDTH,
          XMLToken.FO_MARGIN_LEFT,
          XMLToken.FO_MARGIN_TOP,
          XMLToken.FO_MARGIN_BOTTOM,
          XMLToken.TABLE_ALIGN,
          XMLToken.TABLE_BORDER_MODEL,
        ],
        "table properties",
      );
      const align = attributes.get(XMLToken.TABLE_ALIGN) ?? undefined;
      if (
        align !== undefined &&
        align !== "left" &&
        align !== "center" &&
        align !== "right" &&
        align !== "margins"
      )
        throw new Error(`Unsupported ODF table alignment: ${align}`);
      const borderModel = attributes.get(XMLToken.TABLE_BORDER_MODEL) ?? undefined;
      if (borderModel !== undefined && borderModel !== "collapsing" && borderModel !== "separating")
        throw new Error(`Unsupported ODF table border model: ${borderModel}`);
      this.style = {
        family: "table",
        width: length(XMLToken.STYLE_WIDTH, "table width"),
        marginLeft: length(XMLToken.FO_MARGIN_LEFT, "table margin"),
        marginTop: length(XMLToken.FO_MARGIN_TOP, "table margin"),
        marginBottom: length(XMLToken.FO_MARGIN_BOTTOM, "table margin"),
        align,
        borderModel,
      };
    } else if (
      this.family === "table-column" &&
      element === XMLToken.STYLE_TABLE_COLUMN_PROPERTIES
    ) {
      attributes.assertOnly([XMLToken.STYLE_COLUMN_WIDTH], "table column properties");
      this.style = {
        family: "table-column",
        columnWidth: length(XMLToken.STYLE_COLUMN_WIDTH, "table column width"),
      };
    } else if (this.family === "table-row" && element === XMLToken.STYLE_TABLE_ROW_PROPERTIES) {
      attributes.assertOnly(
        [XMLToken.STYLE_MIN_ROW_HEIGHT, XMLToken.FO_KEEP_TOGETHER],
        "table row properties",
      );
      const keep = attributes.get(XMLToken.FO_KEEP_TOGETHER);
      if (keep !== null && keep !== "always" && keep !== "auto")
        throw new Error(`Unsupported ODF table row keep-together: ${keep}`);
      this.style = {
        family: "table-row",
        minHeight: length(XMLToken.STYLE_MIN_ROW_HEIGHT, "table row height"),
        keepTogether: keep === null ? undefined : keep === "always",
      };
    } else if (this.family === "table-cell" && element === XMLToken.STYLE_TABLE_CELL_PROPERTIES) {
      attributes.assertOnly(
        [XMLToken.STYLE_VERTICAL_ALIGN, XMLToken.FO_PADDING, XMLToken.FO_BORDER],
        "table cell properties",
      );
      const align = attributes.get(XMLToken.STYLE_VERTICAL_ALIGN) || undefined;
      if (align !== undefined && align !== "top" && align !== "middle" && align !== "bottom")
        throw new Error(`Unsupported ODF cell vertical alignment: ${align}`);
      this.style = {
        family: "table-cell",
        padding: length(XMLToken.FO_PADDING, "table cell padding"),
        border: attributes.get(XMLToken.FO_BORDER) ?? undefined,
        verticalAlign: align,
      };
    } else return new SvXMLIgnoreContext();
    return new SvXMLIgnoreContext();
  }

  /** Publishes the completed style. @returns Nothing. */
  public override endFastElement(): void {
    this.target.registerTableStyle(this.name, this.style ?? { family: this.family });
  }
}

/** Imports a table in document body order. */
export class XMLTableContext extends SvXMLImportContext {
  /** Opens one table in document order. @param target - Writer table sink. @param attributes - Table identity. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.TABLE_NAME, XMLToken.TABLE_STYLE_NAME], "table");
    this.target.beginTable(
      attributes.require(XMLToken.TABLE_NAME, "table name"),
      attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "",
    );
  }

  /** Imports a column, row, or table-owned soft break. @param element - Child token. @param attributes - Child values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TABLE_TABLE_COLUMN) {
      attributes.assertOnly(
        [XMLToken.TABLE_STYLE_NAME, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED],
        "table column",
      );
      const count = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED);
      for (let i = 0; i < count; i += 1)
        this.target.addTableColumn(attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "");
      return new SvXMLIgnoreContext();
    }
    if (element === XMLToken.TABLE_TABLE_ROW)
      return new XMLTableRowContext(this.target, attributes);
    if (element === XMLToken.TEXT_SOFT_PAGE_BREAK) {
      attributes.assertOnly([], "table soft page break");
      this.target.addTableSoftPageBreak();
      return new SvXMLIgnoreContext();
    }
    return null;
  }

  /** Closes the table. @returns Nothing. */
  public override endFastElement(): void {
    this.target.endTable();
  }
}

/** Imports one ordered table row. */
class XMLTableRowContext extends SvXMLImportContext {
  /** Opens a row. @param target - Writer table sink. @param attributes - Row style. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.TABLE_STYLE_NAME], "table row");
    this.target.beginTableRow(attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "");
  }
  /** Imports a row cell. @param element - Child token. @param attributes - Cell values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TABLE_TABLE_CELL)
      return new XMLTableCellContext(this.target, attributes);
    return null;
  }
  /** Closes the row. @returns Nothing. */
  public override endFastElement(): void {
    this.target.endTableRow();
  }
}

/** Imports a table cell's ordered paragraphs. */
class XMLTableCellContext extends SvXMLImportContext {
  /** Opens a cell. @param target - Writer table sink. @param attributes - Cell style. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
  ) {
    super();
    attributes.assertOnly([XMLToken.TABLE_STYLE_NAME, XMLToken.TABLE_VALUE_TYPE], "table cell");
    this.target.beginTableCell(attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "");
  }
  /** Imports a cell paragraph with the existing Writer text context. @param element - Child token. @param attributes - Paragraph values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H)
      return new XMLParaContext(this.target, element, attributes);
    return null;
  }
  /** Closes the cell. @returns Nothing. */
  public override endFastElement(): void {
    this.target.endTableCell();
  }
}

/** Validates a bounded ODF column repeat count. @param attributes - XML attributes. @param token - Repeat attribute. @returns Repeat count. */
function repeatCount(attributes: FastAttributeList, token: XMLToken): number {
  const raw = attributes.get(token);
  const count = raw === null ? 1 : Number(raw);
  if (!Number.isInteger(count) || count < 1 || count > 256)
    throw new Error(`Unsupported ODF table repeat count: ${raw}`);
  return count;
}
