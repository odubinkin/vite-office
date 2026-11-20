/** @fileoverview Imports the bounded table and table-style SAX contexts from pinned xmloff table import. */
import { toInt32 } from "../../../o3tl/inc/string_view";
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { importOdfLength } from "../core/xmluconv";
import type { XMLTextImportTarget } from "../text/txtparai";
import { XMLTextImportHelper } from "../text/txtimp";
import type { OdfBoxProperties } from "../style/bordrhdl";
import { Converter } from "../../../sax/source/tools/converter";
import { importWritingDirection } from "../style/prhdlfac";

/** Source table item properties shared by table, row and cell styles. */
export interface OdfTableVisualProperties {
  readonly background?: string | undefined;
  readonly writingMode?: number | undefined;
}

/** Supported ODF table style families and physical properties. */
export type OdfTableStyle =
  | (OdfTableVisualProperties & {
      readonly family: "table";
      readonly width?: number | undefined;
      readonly relativeWidth?: number | undefined;
      readonly align?: "left" | "center" | "right" | "margins" | undefined;
      readonly marginLeft?: number | undefined;
      readonly marginRight?: number | undefined;
      readonly marginTop?: number | undefined;
      readonly marginBottom?: number | undefined;
      readonly borderModel?: "collapsing" | "separating" | undefined;
      readonly layoutSplit?: boolean | undefined;
    })
  | {
      readonly family: "table-column";
      readonly columnWidth?: number | undefined;
      readonly relativeColumnWidth?: number | undefined;
    }
  | (Pick<OdfTableVisualProperties, "background"> & {
      readonly family: "table-row";
      readonly minHeight?: number | undefined;
      readonly height?: number | undefined;
      readonly keepTogether?: boolean | undefined;
    })
  | (OdfBoxProperties &
      OdfTableVisualProperties & {
        readonly family: "table-cell";
        readonly dataStyle?: string | undefined;
        readonly verticalAlign?: "" | "top" | "middle" | "bottom" | undefined;
      });

/** Reads the original brush color and the last recognized writing mode in attribute order. @param attributes - Original ordered XML attributes. @returns Represented native table items. */
function importTableVisualProperties(attributes: FastAttributeList): OdfTableVisualProperties {
  const text = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
  let background: string | undefined;
  if (text === "transparent") background = text;
  else if (text !== null) {
    const color: [number] = [0];
    if (Converter.convertColor(color, text)) {
      const token: [string] = [""];
      Converter.convertColor(token, color[0]);
      background = token[0];
    }
  }
  let writingMode: number | undefined;
  for (const [token, value] of attributes)
    if (token === XMLToken.STYLE_WRITING_MODE || token === XMLToken.LOEXT_WRITING_MODE)
      writingMode = importWritingDirection(value) ?? writingMode;
  return { background, writingMode };
}

/** Writer-facing streaming table operations; canonical ownership stays in sw. */
export interface XMLTableImportTarget extends XMLTextImportTarget {
  registerTableStyle(name: string, style: OdfTableStyle): void;
  beginTable(name: string, styleName: string, defaultCellStyleName: string): void;
  addTableColumn(styleName: string, defaultCellStyleName: string): void;
  beginTableHeaderRows(): void;
  endTableHeaderRows(): void;
  beginTableRow(styleName: string, defaultCellStyleName: string): void;
  canInsertTableCell(): boolean;
  beginTableCell(
    styleName: string,
    columnSpan?: number,
    rowSpan?: number,
    attributes?: FastAttributeList,
  ): void;
  coveredTableCell?(styleName?: string): void;
  endTableCell(repeat: number): void;
  endTableRow(repeat: number): void;
  endTable(): void;
  addTableSoftPageBreak(): void;
}

/** Parses table style values without silently accepting malformed geometry. */
export class XMLTableStyleContext extends SvXMLImportContext {
  private readonly name: string;
  private readonly family: OdfTableStyle["family"];
  private readonly dataStyle: string | undefined;
  private style: OdfTableStyle | undefined;
  private textStyle: SvXMLImportContext | undefined;

  /** Opens one named table style. @param target - Writer style sink. @param attributes - Style identity. @param createTextStyle - Automatic paragraph style factory. @returns Nothing. */
  public constructor(
    private readonly target: Pick<XMLTableImportTarget, "registerTableStyle">,
    attributes: FastAttributeList,
    private readonly createTextStyle?: () => SvXMLImportContext,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.STYLE_NAME,
        XMLToken.STYLE_DISPLAY_NAME,
        XMLToken.STYLE_FAMILY,
        XMLToken.STYLE_PARENT_STYLE_NAME,
        XMLToken.STYLE_DATA_STYLE_NAME,
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
    this.dataStyle = attributes.get(XMLToken.STYLE_DATA_STYLE_NAME) ?? undefined;
  }

  /** Leaves separate cell text properties to the text-style owner. @param element - Source property group. @returns Whether attributes may be skipped. */
  public override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return (
      this.createTextStyle === undefined &&
      this.family === "table-cell" &&
      (element === XMLToken.STYLE_TEXT_PROPERTIES ||
        element === XMLToken.STYLE_PARAGRAPH_PROPERTIES)
    );
  }

  /** Imports one family-matched physical property child. @param element - Child token. @param attributes - Physical values. @returns Property context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element === XMLToken.STYLE_TEXT_PROPERTIES ||
      element === XMLToken.STYLE_PARAGRAPH_PROPERTIES
    ) {
      if (!this.createTextStyle) return new SvXMLIgnoreContext(true);
      this.textStyle ??= this.createTextStyle();
      return this.textStyle.createFastChildContext(element, attributes);
    }
    const length =
      /** Processes one ODF table value. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
        token: XMLToken,
        label: string,
      ): number | undefined => {
        const value = attributes.get(token);
        return value === null
          ? undefined
          : importOdfLength(
              value,
              token === XMLToken.STYLE_MIN_ROW_HEIGHT || token === XMLToken.STYLE_ROW_HEIGHT,
              label,
            );
      };
    if (this.style !== undefined)
      throw new Error(`Duplicate ODF table style properties: ${this.name}`);
    if (this.family === "table" && element === XMLToken.STYLE_TABLE_PROPERTIES) {
      attributes.assertOnly(
        [
          XMLToken.STYLE_WIDTH,
          XMLToken.STYLE_REL_WIDTH,
          XMLToken.FO_MARGIN_LEFT,
          XMLToken.FO_MARGIN_RIGHT,
          XMLToken.FO_MARGIN_TOP,
          XMLToken.FO_MARGIN_BOTTOM,
          XMLToken.TABLE_ALIGN,
          XMLToken.TABLE_BORDER_MODEL,
          XMLToken.STYLE_MAY_BREAK_BETWEEN_ROWS,
          XMLToken.FO_BACKGROUND_COLOR,
          XMLToken.STYLE_WRITING_MODE,
        ],
        "table properties",
      );
      const align = attributes.get(XMLToken.TABLE_ALIGN) || undefined;
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
      const split = attributes.get(XMLToken.STYLE_MAY_BREAK_BETWEEN_ROWS);
      const relative = attributes.get(XMLToken.STYLE_REL_WIDTH);
      const percent: [number] = [0];
      this.style = {
        family: "table",
        ...importTableVisualProperties(attributes),
        width: length(XMLToken.STYLE_WIDTH, "table width"),
        relativeWidth:
          relative !== null && Converter.convertPercent(percent, relative)
            ? Math.max(1, Math.min(100, percent[0]))
            : undefined,
        marginLeft:
          attributes.get(XMLToken.FO_MARGIN_LEFT) === null
            ? undefined
            : importOdfLength(
                attributes.get(XMLToken.FO_MARGIN_LEFT) as string,
                true,
                "table margin",
              ),
        marginRight:
          attributes.get(XMLToken.FO_MARGIN_RIGHT) === null
            ? undefined
            : importOdfLength(
                attributes.get(XMLToken.FO_MARGIN_RIGHT) as string,
                true,
                "table margin",
              ),
        marginTop: length(XMLToken.FO_MARGIN_TOP, "table margin"),
        marginBottom: length(XMLToken.FO_MARGIN_BOTTOM, "table margin"),
        align,
        borderModel,
        // The native RES_LAYOUT_SPLIT mapper accepts legacy keep values as
        // well as booleans; an unrecognized value publishes no item.
        layoutSplit:
          split === "auto" || split === "true"
            ? true
            : split === "always" || split === "false"
              ? false
              : undefined,
      };
    } else if (
      this.family === "table-column" &&
      element === XMLToken.STYLE_TABLE_COLUMN_PROPERTIES
    ) {
      attributes.assertOnly(
        [XMLToken.STYLE_COLUMN_WIDTH, XMLToken.STYLE_REL_COLUMN_WIDTH],
        "table column properties",
      );
      const relative = attributes.get(XMLToken.STYLE_REL_COLUMN_WIDTH);
      const value: [number] = [0];
      this.style = {
        family: "table-column",
        columnWidth: length(XMLToken.STYLE_COLUMN_WIDTH, "table column width"),
        relativeColumnWidth:
          relative?.endsWith("*") && Converter.convertNumber(value, relative.slice(0, -1), 0, 65535)
            ? value[0]
            : undefined,
      };
    } else if (this.family === "table-row" && element === XMLToken.STYLE_TABLE_ROW_PROPERTIES) {
      attributes.assertOnly(
        [
          XMLToken.STYLE_MIN_ROW_HEIGHT,
          XMLToken.STYLE_ROW_HEIGHT,
          XMLToken.FO_KEEP_TOGETHER,
          XMLToken.FO_BACKGROUND_COLOR,
        ],
        "table row properties",
      );
      const keep = attributes.get(XMLToken.FO_KEEP_TOGETHER);
      if (keep !== null && keep !== "always" && keep !== "auto")
        throw new Error(`Unsupported ODF table row keep-together: ${keep}`);
      this.style = {
        family: "table-row",
        background: importTableVisualProperties(attributes).background,
        keepTogether: keep === null ? undefined : keep === "always",
      };
      // Native item import visits attributes in document order; the last size member wins.
      for (const [token] of attributes) {
        if (token === XMLToken.STYLE_MIN_ROW_HEIGHT)
          this.style = {
            ...this.style,
            minHeight: length(token, "table row height"),
            height: undefined,
          };
        else if (token === XMLToken.STYLE_ROW_HEIGHT)
          this.style = {
            ...this.style,
            height: length(token, "table fixed row height"),
            minHeight: undefined,
          };
      }
    } else if (this.family === "table-cell" && element === XMLToken.STYLE_TABLE_CELL_PROPERTIES) {
      attributes.assertOnly(
        [
          XMLToken.STYLE_VERTICAL_ALIGN,
          XMLToken.FO_BACKGROUND_COLOR,
          XMLToken.STYLE_WRITING_MODE,
          XMLToken.LOEXT_WRITING_MODE,
          XMLToken.FO_PADDING,
          XMLToken.FO_BORDER,
          XMLToken.FO_PADDING_TOP,
          XMLToken.FO_PADDING_BOTTOM,
          XMLToken.FO_PADDING_LEFT,
          XMLToken.FO_PADDING_RIGHT,
          XMLToken.FO_BORDER_TOP,
          XMLToken.FO_BORDER_BOTTOM,
          XMLToken.FO_BORDER_LEFT,
          XMLToken.FO_BORDER_RIGHT,
          XMLToken.STYLE_BORDER_LINE_WIDTH,
          XMLToken.STYLE_BORDER_LINE_WIDTH_TOP,
          XMLToken.STYLE_BORDER_LINE_WIDTH_BOTTOM,
          XMLToken.STYLE_BORDER_LINE_WIDTH_LEFT,
          XMLToken.STYLE_BORDER_LINE_WIDTH_RIGHT,
        ],
        "table cell properties",
      );
      const align = attributes.get(XMLToken.STYLE_VERTICAL_ALIGN) ?? undefined;
      if (
        align !== undefined &&
        align !== "" &&
        align !== "top" &&
        align !== "middle" &&
        align !== "bottom"
      )
        throw new Error(`Unsupported ODF cell vertical alignment: ${align}`);
      this.style = {
        family: "table-cell",
        ...importTableVisualProperties(attributes),
        padding: length(XMLToken.FO_PADDING, "table cell padding"),
        border: attributes.get(XMLToken.FO_BORDER) ?? undefined,
        paddingTop: length(XMLToken.FO_PADDING_TOP, "table cell padding"),
        paddingBottom: length(XMLToken.FO_PADDING_BOTTOM, "table cell padding"),
        paddingLeft: length(XMLToken.FO_PADDING_LEFT, "table cell padding"),
        paddingRight: length(XMLToken.FO_PADDING_RIGHT, "table cell padding"),
        borderTop: attributes.get(XMLToken.FO_BORDER_TOP) ?? undefined,
        borderBottom: attributes.get(XMLToken.FO_BORDER_BOTTOM) ?? undefined,
        borderLeft: attributes.get(XMLToken.FO_BORDER_LEFT) ?? undefined,
        borderRight: attributes.get(XMLToken.FO_BORDER_RIGHT) ?? undefined,
        borderLineWidth: attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH) ?? undefined,
        borderLineWidthTop: attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH_TOP) ?? undefined,
        borderLineWidthBottom: attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH_BOTTOM) ?? undefined,
        borderLineWidthLeft: attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH_LEFT) ?? undefined,
        borderLineWidthRight: attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH_RIGHT) ?? undefined,
        verticalAlign: align,
      };
    } else return new SvXMLIgnoreContext();
    return new SvXMLIgnoreContext();
  }

  /** Publishes the completed style. @returns Nothing. */
  public override endFastElement(): void {
    const style = this.style ?? { family: this.family };
    this.target.registerTableStyle(
      this.name,
      style.family === "table-cell" && this.dataStyle !== undefined
        ? { ...style, dataStyle: this.dataStyle }
        : style,
    );
  }
}

/** Imports a table in document body order. */
export class XMLTableContext extends SvXMLImportContext {
  /** Opens one table in document order. @param target - Writer table sink. @param attributes - Table identity. @param helper - Shared native text owner. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
    private readonly helper = target.GetTextImport(),
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.TABLE_NAME,
        XMLToken.TABLE_STYLE_NAME,
        XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME,
        XMLToken.XML_ID,
      ],
      "table",
    );
    this.target.beginTable(
      attributes.require(XMLToken.TABLE_NAME, "table name"),
      attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "",
      attributes.get(XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME) ?? "",
    );
  }

  /** Imports a column, row, or table-owned soft break. @param element - Child token. @param attributes - Child values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TABLE_TABLE_COLUMN) {
      importColumn(this.target, attributes);
      return new SvXMLIgnoreContext();
    }
    if (
      element === XMLToken.TABLE_TABLE_COLUMNS ||
      element === XMLToken.TABLE_TABLE_HEADER_COLUMNS ||
      element === XMLToken.TABLE_TABLE_COLUMN_GROUP
    )
      return new XMLTableColumnsContext(this.target);
    if (element === XMLToken.TABLE_TABLE_ROW)
      return new XMLTableRowContext(this.target, attributes, this.helper);
    if (element === XMLToken.TABLE_TABLE_HEADER_ROWS || element === XMLToken.TABLE_TABLE_ROWS) {
      const header = element === XMLToken.TABLE_TABLE_HEADER_ROWS;
      if (header) this.target.beginTableHeaderRows();
      return new XMLTableRowsContext(this.target, this.helper, header);
    }
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

/** Applies column attributes in the Writer table context. @param target - Writer table sink. @param attributes - Source attributes. @returns Nothing. */
function importColumn(target: XMLTableImportTarget, attributes: FastAttributeList): void {
  attributes.assertOnly(
    [
      XMLToken.TABLE_STYLE_NAME,
      XMLToken.TABLE_NUMBER_COLUMNS_REPEATED,
      XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME,
      XMLToken.XML_ID,
    ],
    "table column",
  );
  const count = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED, 256);
  const name = attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "";
  const cellStyle = attributes.get(XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME) ?? "";
  for (let index = 0; index < count; index++) target.addTableColumn(name, cellStyle);
}

/** Imports the flat grid from a Writer column group. */
class XMLTableColumnsContext extends SvXMLImportContext {
  /** Binds the column group to its actual table. @param target - Writer table sink. @returns Context. */
  constructor(private readonly target: XMLTableImportTarget) {
    super();
  }

  /** Reads the group's column declarations. @param element - Child token. @param attributes - Column attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.TABLE_TABLE_COLUMN) return null;
    importColumn(this.target, attributes);
    return new SvXMLIgnoreContext();
  }
}

/** Imports the first repeated header rows from Writer's table grouping. */
class XMLTableRowsContext extends SvXMLImportContext {
  /** Stores the table sink. @param target - Writer table sink. @param helper - Shared native text owner. @param header - Header row group. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    private readonly helper: XMLTextImportHelper,
    private readonly header: boolean,
  ) {
    super();
  }
  /** Opens one header row. @param element - Child token. @param attributes - Row attributes. @returns Row context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return element === XMLToken.TABLE_TABLE_ROW
      ? new XMLTableRowContext(this.target, attributes, this.helper)
      : null;
  }
  /** Completes the header group. @returns Nothing. */
  public override endFastElement(): void {
    if (this.header) this.target.endTableHeaderRows();
  }
}

/** Imports one ordered table row. */
class XMLTableRowContext extends SvXMLImportContext {
  private readonly repeat: number;
  /** Opens a row. @param target - Writer table sink. @param attributes - Row style. @param helper - Shared native text owner. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
    private readonly helper: XMLTextImportHelper,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.TABLE_STYLE_NAME,
        XMLToken.STYLE_DEFAULT_CELL_STYLE_NAME,
        XMLToken.STYLE_NUMBER_ROWS_REPEATED,
        XMLToken.TABLE_DEFAULT_CELL_STYLE_NAME,
        XMLToken.TABLE_NUMBER_ROWS_REPEATED,
        XMLToken.XML_ID,
      ],
      "table row",
    );
    this.repeat = repeatCount(attributes, XMLToken.STYLE_NUMBER_ROWS_REPEATED, 8192);
    this.target.beginTableRow(
      attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "",
      attributes.get(XMLToken.STYLE_DEFAULT_CELL_STYLE_NAME) ?? "",
    );
  }
  /** Imports a row cell. @param element - Child token. @param attributes - Cell values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TABLE_TABLE_CELL)
      return this.target.canInsertTableCell()
        ? new XMLTableCellContext(this.target, attributes, this.helper)
        : new SvXMLIgnoreContext(true);
    if (element === XMLToken.TABLE_COVERED_TABLE_CELL) {
      attributes.assertOnly([XMLToken.TABLE_STYLE_NAME], "covered table cell");
      this.target.coveredTableCell?.(attributes.get(XMLToken.TABLE_STYLE_NAME) ?? "");
      return new SvXMLIgnoreContext();
    }
    return null;
  }
  /** Closes the row. @returns Nothing. */
  public override endFastElement(): void {
    this.target.endTableRow(this.repeat);
  }
}

/** Imports a table cell's ordered paragraphs. */
class XMLTableCellContext extends SvXMLImportContext {
  private readonly repeat: number;
  private readonly hasStringValue: boolean;
  private readonly savedParaStyle: string;
  /** Opens a cell. @param target - Writer table sink. @param attributes - Cell style. @param helper - Shared native text owner. @returns Nothing. */
  public constructor(
    private readonly target: XMLTableImportTarget,
    attributes: FastAttributeList,
    private readonly helper: XMLTextImportHelper,
  ) {
    super();
    attributes.assertOnly(
      [
        XMLToken.TABLE_STYLE_NAME,
        XMLToken.TABLE_VALUE_TYPE,
        XMLToken.TABLE_FORMULA,
        XMLToken.TABLE_PROTECTED,
        XMLToken.OFFICE_VALUE,
        XMLToken.OFFICE_DATE_VALUE,
        XMLToken.OFFICE_TIME_VALUE,
        XMLToken.OFFICE_BOOLEAN_VALUE,
        XMLToken.OFFICE_STRING_VALUE,
        XMLToken.OFFICE_CURRENCY,
        XMLToken.XML_ID,
        XMLToken.TABLE_NUMBER_COLUMNS_SPANNED,
        XMLToken.TABLE_NUMBER_ROWS_SPANNED,
        XMLToken.TABLE_NUMBER_COLUMNS_REPEATED,
      ],
      "table cell",
    );
    this.repeat = repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_REPEATED, 256);
    this.hasStringValue =
      attributes.get(XMLToken.TABLE_VALUE_TYPE) === "string" &&
      attributes.get(XMLToken.OFFICE_STRING_VALUE) !== null;
    const styleName = attributes.get(XMLToken.TABLE_STYLE_NAME);
    this.savedParaStyle = this.helper.GetCellParaStyleDefault();
    if (styleName !== null) this.helper.SetCellParaStyleDefault(styleName);
    this.target.beginTableCell(
      styleName ?? "",
      repeatCount(attributes, XMLToken.TABLE_NUMBER_COLUMNS_SPANNED, 256),
      repeatCount(attributes, XMLToken.TABLE_NUMBER_ROWS_SPANNED, 8192),
      attributes,
    );
  }
  /** Imports a cell paragraph with the existing Writer text context. @param element - Child token. @param attributes - Paragraph values. @returns Child context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return this.hasStringValue
      ? new SvXMLIgnoreContext(true)
      : this.helper.CreateTextChildContext(element, attributes, "Cell");
  }
  /** Closes the cell. @returns Nothing. */
  public override endFastElement(): void {
    this.target.endTableCell(this.repeat);
    this.helper.SetCellParaStyleDefault(this.savedParaStyle);
  }
}

/** Reads Writer's signed decimal count and resets values outside its upper bound. @param attributes - XML attributes. @param token - Repeat or span attribute. @param maximum - Native normal-mode upper bound. @returns Repeat or span count. */
function repeatCount(attributes: FastAttributeList, token: XMLToken, maximum: number): number {
  const raw = attributes.get(token);
  if (raw === null) return 1;
  const count = Math.max(1, toInt32(new TextEncoder().encode(raw)));
  return count > maximum ? 1 : count;
}
