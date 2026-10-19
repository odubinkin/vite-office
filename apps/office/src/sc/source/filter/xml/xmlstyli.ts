/** @fileoverview Consumed XMLTableStylesContext cell-font and row-geometry automatic styles; named styles,parent inheritance and remaining format properties stay explicit unsupported metadata. */
import { importCellTextProperties, importCellProperties } from "./xmlstyle";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";
import {
  SvXMLIgnoreContext,
  type SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { ScPatternAttr } from "../../../inc/patattr";
/** Actual cell automatic style pool context, sharing the existing XML context chain. */
export class XMLTableStylesContext extends ScXMLImportContext {
  /** Binds original importer. @param owner - Importer. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
  }
  /** Creates only supported real table-cell style state. @param element - Token. @param attributes - Source attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_STYLE && attributes.get(XMLToken.STYLE_FAMILY) === "table-row")
      return new XMLTableRowStyleContext(
        this.owner,
        attributes.require(XMLToken.STYLE_NAME, "row style name"),
      );
    if (
      element !== XMLToken.STYLE_STYLE ||
      attributes.get(XMLToken.STYLE_FAMILY) !== "table-cell"
    ) {
      this.owner.unsupported("non-cell automatic style");
      return new SvXMLIgnoreContext(true);
    }
    if (attributes.get(XMLToken.STYLE_PARENT_STYLE_NAME) !== null)
      this.owner.unsupported("cell parent style inheritance");
    return new XMLTableStyleContext(
      this.owner,
      attributes.require(XMLToken.STYLE_NAME, "cell style name"),
    );
  }
}
/** Native cell style holds a real ScPatternAttr, rather than a browser formatting object. */
class XMLTableStyleContext extends ScXMLImportContext {
  private readonly pattern: ScPatternAttr;
  /** Creates genuine native item state. @param owner - Importer. @param name - Automatic-style name. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string,
  ) {
    super(owner);
    this.pattern = new ScPatternAttr(owner.GetDocument().getCellAttributeHelper());
  }
  /** Reads the consumed native font-height property handlers over the shared twip converter. @param element - Token. @param attributes - Source attributes. @returns Empty/ignored context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.STYLE_TABLE_CELL_PROPERTIES) {
      importCellProperties(
        this.pattern,
        attributes,
        /** Retains actual importer diagnostics. @param name - Unsupported property. @returns Nothing. */ (
          name,
        ) => this.owner.unsupported(name),
      );
      return new XMLTableStylePropertyContext(this.owner);
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
    return new XMLTableStylePropertyContext(this.owner);
  }
  /** Transfers the style into the importer's real pattern pool. @returns Nothing. */
  override endFastElement(): void {
    this.owner.AddAutoStyle(this.name, this.pattern);
  }
}

/** Keeps unsupported property subtrees explicit while the consumed scalar property group is imported. */
class XMLTableStylePropertyContext extends ScXMLImportContext {
  /** Binds the real importer's diagnostic boundary. @param owner - Import owner. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
  }
  /** Diagnoses known but unported nested style properties. @param element - Child token. @param attributes - Actual attributes. @returns Ignored diagnosed subtree. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    void element;
    void attributes;
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

/** Native row style property context; properties are applied directly to ScTable row storage. */
class XMLTableRowStyleContext extends ScXMLImportContext {
  private height: number | null = null;
  private optimal: boolean | null = null;
  /** Binds importer and style name. @param owner - Importer. @param name - Style. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly name: string,
  ) {
    super(owner);
  }
  /** Converts native row-height properties in twips. @param element - Child token. @param attributes - Properties. @returns Ignored leaf. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.STYLE_TABLE_ROW_PROPERTIES) {
      this.owner.unsupported("row style properties");
      return new SvXMLIgnoreContext(true);
    }
    attributes.assertOnly(
      [XMLToken.STYLE_ROW_HEIGHT, XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT],
      "Calc row geometry",
    );
    const height = attributes.get(XMLToken.STYLE_ROW_HEIGHT),
      optimal = attributes.get(XMLToken.STYLE_USE_OPTIMAL_ROW_HEIGHT);
    if (height !== null) {
      this.height = new SvXMLUnitConverter("twip").convertMeasureToCore(height, 0, 65535);
      if (this.height === null) this.owner.unsupported("invalid row height");
    }
    if (optimal !== null) {
      if (optimal === "true" || optimal === "false") this.optimal = optimal === "true";
      else this.owner.unsupported("invalid optimal row height");
    }
    return new SvXMLIgnoreContext(true);
  }
  /** Transfers parsed row properties. @returns Nothing. */
  override endFastElement(): void {
    this.owner.AddRowStyle(this.name, this.height, this.optimal);
  }
}
