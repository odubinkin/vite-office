/** @fileoverview Calc named Default style, document defaults and automatic cell and geometry styles. */
import { Color, COL_AUTO } from "../../../../tools/inc/color";
import { Converter } from "../../../../sax/source/tools/converter";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import {
  importCellBackgroundColor,
  importCellTextProperties,
  importCellProperties,
  importCellParagraphProperties,
} from "./xmlstyle";
import { cellBorderColorHandlers } from "./xmlstyle.borders";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";
import {
  SvXMLIgnoreContext,
  type SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import { ScCondFormatEntry } from "../../../inc/conditio";
import { ScXMLConditionHelper } from "./XMLConverter";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { ScPatternAttr } from "../../../inc/patattr";
import { IsNumberStyle, SvXMLNumFormatContext } from "../../../../xmloff/source/style/xmlnumfi";
import { importWritingDirection } from "../../../../xmloff/source/style/prhdlfac";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SC_STYLE_PROG_STANDARD } from "../../../inc/stylehelper";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { importCellTextStyle } from "./xmlcelli.edit";
import { XMLThemeContext } from "../../../../xmloff/source/style/XMLThemeContext";
import { XMLComplexColorContext } from "../../../../xmloff/source/text/XMLComplexColorContext";
import type { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { EE_CHAR_COLOR } from "../../../../editeng/inc/eeitem";
import { ATTR_BACKGROUND, ATTR_FONT_COLOR } from "../../../inc/scitems";
/** Actual cell automatic style pool context, sharing the existing XML context chain. */
export class XMLTableStylesContext extends ScXMLImportContext {
  /** Binds the original named or automatic styles context. @param owner - Importer. @param named - Named styles section. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly named = false,
  ) {
    super(owner);
  }
  /** Keeps unknown style declarations at the upstream styles-context boundary, rather than treating them as sheet content. Data-style compilation remains diagnosed until its formatter owner is ported. @param namespaceURI - Declaration namespace. @param localName - Declaration name. @param attributes - Declaration attributes. @returns Ignored metadata subtree. */
  override createUnknownChildContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    void namespaceURI;
    void attributes;
    this.owner.unsupported(`automatic style declaration: ${localName}`);
    return new SvXMLIgnoreContext(true);
  }
  /** Creates only supported real table-cell style state. @param element - Token. @param attributes - Source attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_PAGE_LAYOUT)
      return this.owner.pageStyles.CreateLayout(attributes);
    if (IsNumberStyle(element)) {
      const name = attributes.require(XMLToken.STYLE_NAME, "data style name");
      const style = new SvXMLNumFormatContext(
        element,
        this.owner.GetDocument().GetFormatTable(),
        attributes,
      );
      this.owner.AddNumberStyle(name, style);
      return style;
    }
    if (this.named) {
      if (element === XMLToken.LOEXT_THEME)
        return new XMLThemeContext(
          attributes,
          /** Attaches the shared theme to the actual document. @param theme - Imported theme. @returns Nothing. */
          (theme) => (this.owner.GetDocument().theme = theme),
        );
      if (attributes.get(XMLToken.STYLE_FAMILY) === "table-cell") {
        if (element === XMLToken.STYLE_DEFAULT_STYLE)
          return new XMLTableStyleContext(this.owner, null, null, true);
        if (
          element === XMLToken.STYLE_STYLE &&
          attributes.get(XMLToken.STYLE_NAME) === text(SC_STYLE_PROG_STANDARD)
        )
          return new XMLTableStyleContext(
            this.owner,
            null,
            attributes.get(XMLToken.STYLE_DATA_STYLE_NAME),
          );
        if (element === XMLToken.STYLE_STYLE)
          return new XMLTableStyleContext(
            this.owner,
            attributes.require(XMLToken.STYLE_NAME, "cell style name"),
            attributes.get(XMLToken.STYLE_DATA_STYLE_NAME),
            false,
            true,
            attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME),
            attributes.get(XMLToken.STYLE_DISPLAY_NAME),
          );
      }
      this.owner.unsupported("named and master styles are not preserved");
      return new SvXMLIgnoreContext(true);
    }
    if (
      element === XMLToken.STYLE_STYLE &&
      attributes.get(XMLToken.STYLE_FAMILY) === "table-column"
    ) {
      if (attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME) !== null)
        this.owner.unsupported("column parent style inheritance");
      return new XMLTableColumnStyleContext(
        this.owner,
        attributes.require(XMLToken.STYLE_NAME, "column style name"),
      );
    }
    if (element === XMLToken.STYLE_STYLE && attributes.get(XMLToken.STYLE_FAMILY) === "table")
      return new XMLSheetStyleContext(
        this.owner,
        attributes.require(XMLToken.STYLE_NAME, "table style name"),
        attributes.get(XMLToken.STYLE_MASTER_PAGE_NAME),
      );
    if (element === XMLToken.STYLE_STYLE && attributes.get(XMLToken.STYLE_FAMILY) === "table-row")
      return new XMLTableRowStyleContext(
        this.owner,
        attributes.require(XMLToken.STYLE_NAME, "row style name"),
      );
    if (element === XMLToken.STYLE_STYLE && attributes.get(XMLToken.STYLE_FAMILY) === "text") {
      const name = attributes.require(XMLToken.STYLE_NAME, "text style name");
      return new XMLCellTextStyleContext(this.owner, name);
    }
    if (
      element !== XMLToken.STYLE_STYLE ||
      attributes.get(XMLToken.STYLE_FAMILY) !== "table-cell"
    ) {
      this.owner.unsupported("non-cell automatic style");
      return new SvXMLIgnoreContext(true);
    }
    const parent = attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME);

    return new XMLTableStyleContext(
      this.owner,
      attributes.require(XMLToken.STYLE_NAME, "cell style name"),
      attributes.get(XMLToken.STYLE_DATA_STYLE_NAME),
      false,
      false,
      parent,
    );
  }
  /** Resolves the native Default style after all declarations in this style list. @returns Nothing. */
  override endFastElement(): void {
    if (this.named) this.owner.FinishNamedCellStyles();
    this.owner.ApplyDefaultNumberStyle();
  }
}
/** Table family automatic style for the represented sheet properties. */
class XMLSheetStyleContext extends ScXMLImportContext {
  private visible = true;
  private tabColor: Readonly<Color> = COL_AUTO;
  private writingMode: number | undefined;
  private background: SvxBrushItem | undefined;
  /** Binds a real ODF table style. @param owner - Importer. @param name - Style name. @param masterPage - Associated master page. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string,
    private readonly masterPage: string | null,
  ) {
    super(owner);
  }
  /** Consumes the represented table-family properties. @param element - Child token. @param attributes - Style properties. @returns Property context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_TABLE_PROPERTIES) {
      const display = attributes.get(XMLToken.TABLE_DISPLAY);
      this.visible = display !== "false" && display !== "0";
      const direction = attributes.get(XMLToken.STYLE_WRITING_MODE);
      if (direction !== null) this.writingMode = importWritingDirection(direction, false);
      const background = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
      if (background !== null) {
        this.background ??= (
          this.owner
            .GetDocument()
            .getCellAttributeHelper()
            .getDefaultCellAttribute()
            .GetItem(ATTR_BACKGROUND) as SvxBrushItem
        ).Clone();
        importCellBackgroundColor(
          this.background,
          background,
          /** Reports the original background property failure. @param name - Diagnostic name. */
          (name) => this.owner.unsupported(name),
        );
      }
      for (const [token, value] of attributes) {
        if (token !== XMLToken.TABLE_TAB_COLOR && token !== XMLToken.TABLE_EXT_TAB_COLOR) continue;
        const rgb: [number] = [0];
        if (Converter.convertColor(rgb, value)) this.tabColor = new Color(rgb[0]);
      }
      return new XMLTableStylePropertyContext(this.owner);
    }
    this.owner.unsupported("table style properties");
    return new SvXMLIgnoreContext(true);
  }
  /** Commits the automatic style under its XML identity. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (element === XMLToken.STYLE_STYLE)
      this.owner.AddTableStyle(
        this.name,
        this.visible,
        this.tabColor,
        this.masterPage,
        this.writingMode,
        this.background,
      );
  }
}
/** Automatic text style for a native Calc edit-cell span. */
class XMLCellTextStyleContext extends ScXMLImportContext {
  private readonly items: SfxItemSet;

  /** Acquires an item set from the actual EditEngine pool. @param owner - Importer. @param name - Automatic text style name. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    name: string,
  ) {
    super(owner);
    this.items = new SfxItemSet(owner.GetDocument().GetEditEngine().GetEmptyItemSet());
    owner.AddTextStyle(name, this.items);
  }

  /** Imports character properties using the ODF property handlers. @param element - Child token. @param attributes - Character properties. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_TEXT_PROPERTIES) {
      importCellTextStyle(this.owner, attributes, this.items);
      return new XMLTableStylePropertyContext(
        this.owner,
        new Map([
          [
            XMLToken.LOEXT_CHAR_COMPLEX_COLOR,
            /** Applies the character complex color to the real span item. @param color - Imported complex color. @returns Nothing. */
            (color) => {
              const item = (this.items.Get(EE_CHAR_COLOR) as SvxColorItem).Clone();
              item.setComplexColor(color);
              this.items.Put(item, true);
            },
          ],
        ]),
      );
    }
    this.owner.unsupported("text style properties");
    return new SvXMLIgnoreContext(true);
  }
}
/** Original style-map condition held as XML operands until Calc can compile its references. */
export class ScXMLMapContext extends SvXMLIgnoreContext {
  private readonly condition: ReturnType<typeof ScXMLConditionHelper.parseCondition>;
  private readonly grammar: Grammar | undefined;
  private readonly base: string;
  private readonly style: string;

  /** Reads original map attributes and the formula grammar at their XML namespace scope. @param owner - Importer. @param attributes - Map attributes. @returns Context. */
  constructor(owner: ScXMLImport, attributes: FastAttributeList) {
    super(true);
    const source = attributes.get(XMLToken.STYLE_CONDITION) ?? "";
    const formula = owner.ExtractFormulaNamespaceGrammar(source, attributes);
    this.grammar = source === formula.source ? undefined : formula.grammar;
    this.condition = ScXMLConditionHelper.parseCondition(formula.source);
    const style = attributes.get(XMLToken.STYLE_APPLY_STYLE_NAME) ?? "";
    const named = owner.GetNamedCellStyle(style);
    this.style = named ? text(named.GetName()) : style;
    this.base = attributes.get(XMLToken.STYLE_BASE_CELL_ADDRESS) ?? "";
  }

  /** Compares the XML string tokens and base as the native entry does before CompileXML. @param other - Candidate entry. @returns Equality. */
  EqualEntry(other: ScXMLMapContext | undefined): boolean {
    const { mode, operands } = this.condition;
    return (
      mode === other?.condition.mode &&
      this.grammar === other.grammar &&
      this.style === other.style &&
      operands.length === other.condition.operands.length &&
      (!operands.length || this.base === other.base) &&
      operands.every(
        /** Compares one original operand. @param value - Operand. @param index - Operand slot. @returns Equality. */
        (value, index) => value === other.condition.operands[index],
      )
    );
  }

  /** Compiles the original map at its stored OOo A1 address. @param owner - Importer with resolved sheet and name tables. @returns Owned native entry. */
  CreateConditionEntry(owner: ScXMLImport): ScCondFormatEntry {
    const document = owner.GetDocument();
    let position = new ScAddress();
    if (this.base) {
      const base = unicode(this.base);
      try {
        const parsed = new ScAddress();
        const details = new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_OOO);
        if (parsed.Parse(base, document, details) & ScRefFlags.VALID) position = parsed;
      } finally {
        base.dispose();
      }
    }
    return new ScCondFormatEntry(
      this.condition.mode,
      this.condition.operands,
      document,
      position,
      this.grammar ?? document.GetStorageGrammar(),
      this.style,
    );
  }
}

/** Native cell style holds a real ScPatternAttr, rather than a browser formatting object. */
class XMLTableStyleContext extends ScXMLImportContext {
  private readonly pattern: ScPatternAttr;
  private readonly horizontal = new Any();
  private readonly maps: ScXMLMapContext[] = [];
  /** Creates genuine native item state. @param owner - Importer. @param name - Automatic-style name or Standard. @param dataStyle - Referenced data style. @param documentDefaults - Pool-default properties. @param named - Named styles stream. @param parent - Encoded parent name. @param displayName - External unencoded name. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string | null,
    private readonly dataStyle: string | null,
    private readonly documentDefaults = false,
    private readonly named = false,
    private readonly parent: string | null = null,
    private readonly displayName: string | null = null,
  ) {
    super(owner);
    this.pattern = new ScPatternAttr(owner.GetDocument().getCellAttributeHelper());
    if (name !== null)
      this.pattern.SetStyleSheet(
        owner.GetNamedCellStyle(parent) ??
          owner.GetDocument().GetStyleSheetPool()?.GetDefaultStyle() ??
          null,
        false,
      );
  }
  /** Reads the consumed native font-height property handlers over the shared twip converter. @param element - Token. @param attributes - Source attributes. @returns Empty/ignored context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_MAP) {
      const map = new ScXMLMapContext(this.owner, attributes);
      this.maps.push(map);
      return map;
    }
    if (element === XMLToken.STYLE_PARAGRAPH_PROPERTIES) {
      importCellParagraphProperties(
        this.pattern,
        attributes,
        this.horizontal,
        /** Reports actual import diagnostics. @param name - Failed property. @returns Nothing. */ (
          name,
        ) => this.owner.unsupported(name),
      );
      return new XMLTableStylePropertyContext(this.owner);
    }
    if (element === XMLToken.STYLE_TABLE_CELL_PROPERTIES) {
      importCellProperties(
        this.pattern,
        attributes,
        /** Retains actual importer diagnostics. @param name - Unsupported property. @returns Nothing. */ (
          name,
        ) => this.owner.unsupported(name),
        this.horizontal,
      );
      const handlers = cellBorderColorHandlers(this.pattern);
      handlers.set(
        XMLToken.LOEXT_BACKGROUND_COMPLEX_COLOR,
        /** Applies the original brush's color metadata. @param color - Imported complex color. @returns Nothing. */
        (color) => {
          const item = (this.pattern.GetItem(ATTR_BACKGROUND) as SvxBrushItem).Clone();
          item.setComplexColor(color);
          this.pattern.GetItemSetWritable().Put(item, true);
        },
      );
      return new XMLTableStylePropertyContext(this.owner, handlers);
    }
    if (element !== XMLToken.STYLE_TEXT_PROPERTIES) {
      this.owner.unsupported("cell style properties");
      return new SvXMLIgnoreContext(true);
    }
    importCellTextProperties(
      this.pattern,
      attributes,
      /** Retains actual importer diagnostics. @param name - Unsupported property. @returns Nothing. */
      (name) => this.owner.unsupported(name),
      /** Resolves genuine shared font declarations. @param name - Font reference. @returns Native font. */
      (name) => this.owner.GetFontFace(name),
    );
    return new XMLTableStylePropertyContext(
      this.owner,
      new Map([
        [
          XMLToken.LOEXT_CHAR_COMPLEX_COLOR,
          /** Applies native complex color to the original cell font item. @param color - Imported complex color. @returns Nothing. */
          (color) => {
            const item = (this.pattern.GetItem(ATTR_FONT_COLOR) as SvxColorItem).Clone();
            item.setComplexColor(color);
            this.pattern.GetItemSetWritable().Put(item, true);
          },
        ],
      ]),
    );
  }
  /** Transfers the style into the importer's real pattern pool. @returns Nothing. */
  override endFastElement(): void {
    try {
      const item = new SvxHorJustifyItem(129);
      if (item.PutValue(this.horizontal)) this.pattern.ItemSetPut(item);
      if (this.name !== null && !this.named)
        this.owner.AddAutoStyle(this.name, this.pattern, this.dataStyle, this.parent, this.maps);
      else {
        try {
          if (this.name !== null)
            this.owner.ApplyNamedCellStyle(
              this.name,
              this.displayName,
              this.parent,
              this.dataStyle,
              this.pattern,
            );
          else if (this.documentDefaults) this.owner.ApplyDocumentDefaults(this.pattern);
          else this.owner.ApplyDefaultCellStyle(this.pattern, this.dataStyle);
        } finally {
          this.pattern.Dispose();
        }
      }
    } finally {
      this.horizontal.dispose();
    }
  }
}

/** Keeps unsupported property subtrees explicit while the consumed scalar property group is imported. */
class XMLTableStylePropertyContext extends ScXMLImportContext {
  /** Binds the native property boundary. @param owner - Import owner. @param complexColors - Original supported property element and item callbacks. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly complexColors?: ReadonlyMap<XMLToken, (color: ComplexColor) => void>,
  ) {
    super(owner);
  }
  /** Diagnoses known but unported nested style properties. @param element - Child token. @param attributes - Actual attributes. @returns Ignored diagnosed subtree. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const install = this.complexColors?.get(element);
    if (install)
      return new XMLComplexColorContext(
        attributes,
        /** Passes valid metadata into the owned native item. @param color - Imported color. @returns Nothing. */
        (color) => {
          if (color.isValidThemeType()) install(color);
          else this.owner.unsupported("cell style property subtree");
        },
      );
    this.owner.unsupported("cell style property subtree");
    return new SvXMLIgnoreContext(true);
  }
  /** Diagnoses extension properties rather than silently dropping their content. @param namespaceURI - Original namespace. @param localName - Child name. @param attributes - Actual attributes. @returns Ignored diagnosed subtree. */
  override createUnknownChildContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    void namespaceURI;
    void localName;
    void attributes;
    this.owner.unsupported("cell style property subtree");
    return new SvXMLIgnoreContext(true);
  }
}

/** Reads Calc's page/auto break property. @param value - Lexical style property. @param owner - Importer. @returns Manual page break. */
function readBreakBefore(value: string | null, owner: ScXMLImport): boolean {
  if (value === null || value === "auto") return false;
  if (value === "page") return true;
  owner.unsupported("invalid page break before");
  return false;
}

/** Native row style property context; properties are applied directly to ScTable row storage. */
class XMLTableRowStyleContext extends ScXMLImportContext {
  private height: number | null = null;
  private optimal: boolean | null = null;
  private pageBreak = false;
  private background: SvxBrushItem | undefined;
  /** Binds importer and style name. @param owner - Importer. @param name - Style. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string,
  ) {
    super(owner);
  }
  /** Parses native row geometry and imported row-level cell background. @param element - Child token. @param attributes - Row properties. @returns Property context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.STYLE_TABLE_ROW_PROPERTIES) {
      this.owner.unsupported("row style properties");
      return new SvXMLIgnoreContext(true);
    }
    attributes.assertOnly(
      [
        XMLToken.STYLE_ROW_HEIGHT,
        XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT,
        XMLToken.FO_BREAK_BEFORE,
        XMLToken.FO_BACKGROUND_COLOR,
      ],
      "Calc row geometry",
    );
    const height = attributes.get(XMLToken.STYLE_ROW_HEIGHT),
      optimal = attributes.get(XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT);
    this.pageBreak = readBreakBefore(attributes.get(XMLToken.FO_BREAK_BEFORE), this.owner);
    if (height !== null) {
      this.height = new SvXMLUnitConverter("mm100").convertMeasureToCore(height, 0, 2147483647);
      if (this.height === null) this.owner.unsupported("invalid row height");
    }
    if (optimal !== null) {
      if (optimal === "true" || optimal === "false") this.optimal = optimal === "true";
      else this.owner.unsupported("invalid optimal row height");
    }
    const background = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
    if (background !== null)
      importCellBackgroundColor(
        this.GetBackground(),
        background,
        /** Reports invalid imported background color. @param name - Diagnostic name. */
        (name) => this.owner.unsupported(name),
      );
    return new XMLTableStylePropertyContext(
      this.owner,
      new Map([
        [
          XMLToken.LOEXT_BACKGROUND_COMPLEX_COLOR,
          /** Applies the native theme-based row background. @param color - Imported complex color. */
          (color: ComplexColor) => this.GetBackground().setComplexColor(color),
        ],
      ]),
    );
  }
  /** Creates the owned row brush only when an actual background is declared. @returns Original cell background item. */
  private GetBackground(): SvxBrushItem {
    return (this.background ??= (
      this.owner
        .GetDocument()
        .getCellAttributeHelper()
        .getDefaultCellAttribute()
        .GetItem(ATTR_BACKGROUND) as SvxBrushItem
    ).Clone());
  }

  /** Transfers parsed row properties. @returns Nothing. */
  override endFastElement(): void {
    this.owner.AddRowStyle(this.name, this.height, this.optimal, this.pageBreak, this.background);
  }
}

/** Native table-column automatic style property owner. */
class XMLTableColumnStyleContext extends ScXMLImportContext {
  private width: number | null = null;
  private pageBreak = false;
  /** Borrows the real importer and style identity. @param owner - Importer. @param name - Source name. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string,
  ) {
    super(owner);
  }
  /** Reads native XML_TYPE_MEASURE in HMM;device-dependent optimal sizing remains diagnosed. @param element - Source token. @param attributes - Properties. @returns Leaf context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.STYLE_TABLE_COLUMN_PROPERTIES) {
      this.owner.unsupported("column style properties");
      return new SvXMLIgnoreContext(true);
    }
    attributes.assertOnly(
      [
        XMLToken.STYLE_COLUMN_WIDTH,
        XMLToken.STYLE_USE_OPTIMAL_COLUMN_WIDTH,
        XMLToken.FO_BREAK_BEFORE,
      ],
      "Calc column geometry",
    );
    const width = attributes.get(XMLToken.STYLE_COLUMN_WIDTH),
      optimal = attributes.get(XMLToken.STYLE_USE_OPTIMAL_COLUMN_WIDTH);
    this.pageBreak = readBreakBefore(attributes.get(XMLToken.FO_BREAK_BEFORE), this.owner);
    if (width !== null) {
      this.width = new SvXMLUnitConverter("mm100").convertMeasureToCore(
        width,
        -2147483648,
        2147483647,
      );
      if (this.width === null) this.owner.unsupported("invalid column width");
    }
    if (optimal !== null && optimal !== "false") this.owner.unsupported("optimal column width");
    return new SvXMLIgnoreContext(true);
  }
  /** Transfers actual parsed property into import resources. @returns Nothing. */
  override endFastElement(): void {
    this.owner.AddColumnStyle(this.name, this.width, this.pageBreak);
  }
}
