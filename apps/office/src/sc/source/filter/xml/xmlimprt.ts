/** @fileoverview Calc scalar,cell-font and row-geometry import over shared fast XML contexts;advanced styles,device layout and objects remain unported. */
import type { ScTable } from "../../../inc/table";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import { XMLTableStylesContext } from "./xmlstyli";
import { CellAttributeHolder, type ScPatternAttr } from "../../../inc/patattr";
import { ScXMLImportContext } from "./importcontext";
import {
  SvXMLImport,
  SvXMLImportContext,
  SvXMLIgnoreContext,
  parseOdfXmlStream,
  type SvXMLImportRootFactory,
  type FastAttributeList,
  type OdfXmlParseOptions,
  type OdfXmlDiagnostic,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { ScDocumentImport } from "../../../inc/documentimport";
import type { ScDocument } from "../../../inc/document";
import { ScXMLBodyContext } from "./xmlbodyi";
/** Browser parser ceilings bind native scalar import to bounded resources. */
export interface ScXMLImportOptions extends OdfXmlParseOptions {
  readonly maxExpandedCells?: number;
}
/** Actual import root/state for scalar content;no intermediate sheet/cell data model is retained. */
export class ScXMLImport extends SvXMLImport implements SvXMLImportRootFactory {
  readonly docImport: ScDocumentImport;
  private cells = 0;
  private readonly autoStyles = new Map<string, CellAttributeHolder>();
  private body = false;
  private readonly rowStyles = new Map<
    string,
    { height: number | null; optimal: boolean | null }
  >();
  /** Registers consumed native row-style properties. @param name - Style. @param height - Twips. @param optimal - Automatic flag. @returns Nothing. */
  AddRowStyle(name: string, height: number | null, optimal: boolean | null): void {
    this.rowStyles.set(name, { height, optimal });
  }
  /** Applies row style directly to actual sheet storage. @param name - Style. @param tab - Sheet. @param first - First row. @param last - Last row. @returns Nothing. */
  ApplyRowStyle(name: string, tab: number, first: number, last: number): void {
    const style = this.rowStyles.get(name);
    if (!style) {
      this.unsupported("row style");
      return;
    }
    const table = this.document.FetchTable(tab) as ScTable;
    if (style.height !== null) table.SetRowHeightOnly(first, last, style.height);
    if (style.optimal !== null) table.SetManualHeight(first, last, !style.optimal);
  }
  /** Binds actual document and parser controls. @param document - Target. @param options - Controls. @returns Importer. */
  constructor(
    private readonly document: ScDocument,
    readonly options: ScXMLImportOptions = {},
  ) {
    super();
    this.docImport = new ScDocumentImport(document);
  }
  /** Transfers a parsed real automatic pattern into import lifetime ownership. @param name - Source name. @param pattern - Adopted source pattern. @returns Nothing. */
  AddAutoStyle(name: string, pattern: ScPatternAttr): void {
    this.autoStyles.get(name)?.Dispose();
    this.autoStyles.set(name, new CellAttributeHolder(pattern, true));
  }
  /** Borrows actual automatic style data; missing references remain diagnosed. @param name - Style reference. @returns Pattern or null. */
  GetAutoStyle(name: string): ScPatternAttr | null {
    const pattern = this.autoStyles.get(name)?.getScPatternAttr() ?? null;
    if (pattern === null) this.unsupported("cell style/number format");
    return pattern;
  }
  /** Borrows the actual native document-import owner. @returns Importer. */
  GetDoc(): ScDocumentImport {
    return this.docImport;
  }
  /** Borrows its actual document. @returns Document. */
  GetDocument(): ScDocument {
    return this.docImport.getDoc();
  }
  /** Reports concrete unsupported format metadata without claiming preservation. @param name - Feature. @returns Nothing. */
  unsupported(name: string): void {
    const diagnostic: OdfXmlDiagnostic = {
      kind: "unsupported-attribute",
      path: "/office:spreadsheet",
      name,
    };
    if (this.options.onDiagnostic) this.options.onDiagnostic(diagnostic);
    else console.warn(`Unsupported ODS formatting metadata: ${name}`);
  }
  /** Bounds data expanded from repeat attributes;empty spans do not allocate cells. @param count - Actual scalar cells. @returns Nothing. */
  consumeCells(count: number): void {
    this.cells += count;
    if (this.cells > (this.options.maxExpandedCells ?? 1_000_000))
      throw new Error("ODS expanded cell limit exceeded");
  }
  /** Preserves modern ODF namespace/default formula selection;legacy/external grammars are explicit boundaries. @param value - Formula attribute. @param attributes - Actual SAX scope. @returns Unprefixed ODFF source. */
  ExtractFormulaNamespaceGrammar(value: string, attributes: FastAttributeList): string {
    if (value.startsWith("=")) return value;
    const colon = value.indexOf(":"),
      prefix = value.slice(0, colon);
    if (colon < 0 || attributes.getNamespaceUri(prefix) !== ODF_NAMESPACES.of)
      throw new Error("ODS legacy/external formula grammar is not implemented");
    return value.slice(colon + 1);
  }
  /** Creates the supported native content document context. @param element - Root. @param attributes - Attributes. @returns Context. */
  createFastContext(element: XMLToken, attributes: FastAttributeList): SvXMLImportContext {
    if (element !== XMLToken.OFFICE_DOCUMENT_CONTENT)
      throw new Error("ODS document-content expected");
    const version = attributes.get(XMLToken.OFFICE_VERSION);
    if (version !== null && !/^1\.[234]$/.test(version))
      throw new Error("ODS legacy storage grammar is not implemented");
    return new ScXMLDocContext_Impl(this);
  }
  /** Unknown document roots are not spreadsheet content. @param namespaceURI - URI. @param localName - Name. @param attributes - Attributes. @returns Never. */
  createUnknownContext(
    namespaceURI: string,
    localName: string,
    attributes: FastAttributeList,
  ): never {
    void namespaceURI;
    void localName;
    void attributes;
    throw new Error("ODS unknown document root");
  }
  /** Parses directly into the real document with native normal recalculation disabled during import. @param xml - Content. @returns Nothing. */
  importContent(xml: string): void {
    if (this.document.GetTableCount()) throw new Error("ODS import requires a fresh document");
    const auto = this.document.GetAutoCalc();
    this.document.SetAutoCalc(false);
    try {
      parseOdfXmlStream(xml, this, this.options);
      if (!this.body) throw new Error("ODS spreadsheet body is missing");
      for (let tab = 0; tab < this.document.GetTableCount(); tab++)
        (this.document.FetchTable(tab) as ScTable).SetOptimalHeight(
          new RowHeightContext(this.document.MaxRow(), 1 / 15),
          0,
          this.document.MaxRow(),
          true,
        );
    } finally {
      this.document.SetAutoCalc(auto);
      for (const holder of this.autoStyles.values()) holder.Dispose();
      this.autoStyles.clear();
      this.rowStyles.clear();
    }
  }
  /** Marks the unique spreadsheet body. @returns Context. */
  CreateBodyContext(): ScXMLBodyContext {
    if (this.body) throw new Error("ODS duplicate spreadsheet body");
    this.body = true;
    return new ScXMLBodyContext(this);
  }
}
/** Native document wrapper for content and non-cell metadata streams. */
class ScXMLDocContext_Impl extends ScXMLImportContext {
  /** Binds owner. @param owner - Owner. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
  }
  /** Dispatches the content body and explicitly non-cell metadata. @param element - Token. @returns Context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element === XMLToken.OFFICE_BODY) return new ScXMLBodyContext_Impl(this.owner);
    if (element === XMLToken.OFFICE_SCRIPTS) {
      this.owner.unsupported("scripts are not preserved");
      return new SvXMLIgnoreContext(true);
    }
    if (element === XMLToken.OFFICE_AUTOMATIC_STYLES) return new XMLTableStylesContext(this.owner);
    if (element === XMLToken.OFFICE_FONT_FACE_DECLS) return new SvXMLIgnoreContext(true);
    throw new Error("ODS document feature is not implemented");
  }
}
/** Native office:body wrapper. */
class ScXMLBodyContext_Impl extends ScXMLImportContext {
  /** Binds owner. @param owner - Owner. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
  }
  /** Selects spreadsheet content. @param element - Token. @returns Context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.OFFICE_SPREADSHEET) throw new Error("ODS spreadsheet expected");
    return this.owner.CreateBodyContext();
  }
}
