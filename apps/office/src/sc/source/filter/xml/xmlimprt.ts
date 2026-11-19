/** @fileoverview Calc scalar,cell-font and row/column geometry import over shared fast XML contexts;advanced styles,device layout and objects remain unported. */
import type { SvXMLNumFormatContext } from "../../../../xmloff/source/style/xmlnumfi";

import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  XMLFontStylesContext,
  type OdfFontFaceMetadata,
  type OdfEmbeddedFont,
} from "../../../../xmloff/source/style/XMLFontStylesContext";
import { getFontFamilyFromGeneric } from "../../../../xmloff/source/style/fonthdl";
import type { ScTable } from "../../../inc/table";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import { ScFlatBoolRowSegments } from "../../core/data/segmenttree";
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
import type { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { InsertRangeNames } from "../../core/tool/rangenam";
import { GetNamedExpressionBase, type ScMyNamedExpression } from "./xmlnexpi";
import type { ScDocument } from "../../../inc/document";
import { ScXMLBodyContext } from "./xmlbodyi";
import type { ScLineBreakCell } from "../../../inc/attrib";
import { ScDocOptions } from "../../core/tool/docoptio";
/** Browser parser ceilings bind native scalar import to bounded resources. */
export interface ScXMLImportOptions extends OdfXmlParseOptions {
  readonly maxExpandedCells?: number;
}
/** Actual import root/state for scalar content;no intermediate sheet/cell data model is retained. */
export class ScXMLImport extends SvXMLImport implements SvXMLImportRootFactory {
  readonly docImport: ScDocumentImport;
  private readonly namedExpressions: ScMyNamedExpression[] = [];
  private readonly pendingFormulas: { address: ScAddress; source: string }[] = [];

  /** Collects the named definition before resolution. @param expression - Original XML definition. @returns Nothing. */
  AddNamedExpression(expression: ScMyNamedExpression): void {
    this.namedExpressions.push(expression);
  }
  /** Defers a cell formula until global and local name indexes exist. @param address - Destination. @param source - Native ODFF formula. @returns Nothing. */
  AddFormula(address: ScAddress, source: string): void {
    this.pendingFormulas.push({ address, source });
  }
  private cells = 0;
  private readonly fontFaces = new Map<string, SvxFontItem>();
  /** Registers original five-field font declarations through the common context. @param name - Reference name. @param family - Family names. @param generic - Family class. @param metadata - Native remaining fields. @returns Nothing. */
  registerFontFace(
    name: string,
    family: string,
    generic: string | undefined,
    metadata?: OdfFontFaceMetadata,
  ): void {
    this.fontFaces.set(
      name,
      new SvxFontItem(
        getFontFamilyFromGeneric(generic),
        family,
        metadata?.styleName ?? "",
        metadata?.pitch ?? FontPitch.PITCH_DONTKNOW,
        metadata?.charSet ?? RTL_TEXTENCODING_UTF8,
        0,
      ),
    );
  }
  /** Diagnoses the currently unported embedded-font package resource path. @param font - Original shared declaration. @returns Nothing. */
  registerEmbeddedFont(font: OdfEmbeddedFont): void {
    void font;
    this.unsupported("embedded font resources are not preserved");
  }
  /** Borrows one actual declared font item. @param name - ODF reference. @returns Font or absent. */
  GetFontFace(name: string): SvxFontItem | undefined {
    return this.fontFaces.get(name);
  }
  /** Creates the original shared declaration context with the XML UTF8 encoding. @returns Font declarations. */
  CreateFontDeclsContext(): XMLFontStylesContext {
    return new XMLFontStylesContext(this, RTL_TEXTENCODING_UTF8);
  }
  private readonly autoStyles = new Map<string, CellAttributeHolder>();
  private readonly textStyles = new Map<string, SfxItemSet>();
  private readonly pendingNumberStyles = new Map<
    string,
    { pattern: ScPatternAttr; reference: string }
  >();
  private readonly numberStyles = new Map<string, SvXMLNumFormatContext>();
  private readonly tableStyles = new Map<string, boolean>();
  /** Records the native style's sheet display property. @param name - Automatic style. @param visible - Sheet display. @returns Nothing. */
  AddTableStyle(name: string, visible: boolean): void {
    this.tableStyles.set(name, visible);
  }
  /** Applies the sheet display property to its native owner. @param name - Automatic style. @param tab - Native sheet. @returns Nothing. */
  ApplyTableStyle(name: string, tab: number): void {
    const visible = this.tableStyles.get(name);
    if (visible === undefined) this.unsupported("table:style-name");
    else this.document.SetVisible(tab, visible);
  }
  private readonly columnStyles = new Map<string, { width: number | null; pageBreak: boolean }>();
  /** Registers native column geometry and breaks. @param name - Automatic style. @param width - Signed32 HMM or absent property. @param pageBreak - Manual break before the column. @returns Nothing. */
  AddColumnStyle(name: string, width: number | null, pageBreak: boolean): void {
    this.columnStyles.set(name, { width, pageBreak });
  }
  /** Consumed CellWidth UNO property converts HMM then narrows to UInt16;zero does not replace stored width. @param name - Style. @param tab - Actual sheet. @param first - First column. @param last - Last column. @returns Nothing. */
  ApplyColumnStyle(name: string, tab: number, first: number, last: number): void {
    const style = this.columnStyles.get(name);
    if (!style) {
      this.unsupported("column style");
      return;
    }
    if (style.pageBreak) {
      const table = this.document.FetchTable(tab) as ScTable;
      for (let column = Math.max(1, first); column <= last; ++column)
        table.SetColBreak(column, false, true);
    }
    if (style.width === null) return;
    const twips = Number(toTwips(BigInt(style.width), Length.mm100)) & 0xffff;
    if (twips)
      for (let column = first; column <= last; column++)
        this.document.SetColWidthOnly(column, tab, twips);
  }
  private body = false;
  private readonly rowStyles = new Map<
    string,
    { height: number | null; optimal: boolean | null; pageBreak: boolean }
  >();
  private readonly recalcRows = new Map<number, ScFlatBoolRowSegments>();
  /** Registers consumed native row-style properties. @param name - Style. @param height - Twips. @param optimal - Automatic flag. @param pageBreak - Manual break before the row. @returns Nothing. */
  AddRowStyle(
    name: string,
    height: number | null,
    optimal: boolean | null,
    pageBreak: boolean,
  ): void {
    this.rowStyles.set(name, { height, optimal, pageBreak });
  }
  /** Applies row style directly to actual sheet storage. @param name - Style. @param tab - Sheet. @param first - First row. @param last - Last row. @returns Nothing. */
  ApplyRowStyle(name: string | null, tab: number, first: number, last: number): void {
    if (first > last) return;
    const style = name === null ? undefined : this.rowStyles.get(name);
    if (name !== null && !style) this.unsupported("row style");
    const table = this.document.FetchTable(tab) as ScTable;
    if (style?.pageBreak)
      for (let row = Math.max(1, first); row <= last; ++row) table.SetRowBreak(row, false, true);
    const height = style?.height ?? null;
    const optimal = style?.optimal ?? height === null;
    if (height !== null) table.SetRowHeightOnly(first, last, height);
    table.SetManualHeight(first, last, !optimal);
    if (!optimal) return;
    let ranges = this.recalcRows.get(tab);
    if (!ranges) {
      ranges = new ScFlatBoolRowSegments(this.document.MaxRow());
      this.recalcRows.set(tab, ranges);
    }
    // The native row mapper supplies stored optimal heights directly. The row
    // context still schedules early rows and rows lacking a saved optimum.
    if (last <= 200 || height === null || height <= 0) ranges.setTrue(first, last);
  }
  /** Binds actual document and parser controls. @param document - Target. @param options - Controls. @returns Importer. */
  constructor(
    private readonly document: ScDocument,
    readonly options: ScXMLImportOptions = {},
  ) {
    super();
    this.docImport = new ScDocumentImport(document);
  }
  /** Transfers a parsed real automatic pattern into import lifetime ownership. @param name - Source name. @param pattern - Adopted source pattern. @param reference - Optional ODF data style. @returns Nothing. */
  AddAutoStyle(name: string, pattern: ScPatternAttr, reference: string | null = null): void {
    this.pendingNumberStyles.get(name)?.pattern.Dispose();
    this.pendingNumberStyles.delete(name);
    this.autoStyles.get(name)?.Dispose();
    this.autoStyles.delete(name);
    if (reference) this.pendingNumberStyles.set(name, { pattern, reference });
    else this.autoStyles.set(name, new CellAttributeHolder(pattern, true));
  }
  /** Retains native edit items from an automatic text style. @param name - Source style. @param items - Adopted item set. @returns Nothing. */
  AddTextStyle(name: string, items: SfxItemSet): void {
    this.textStyles.get(name)?.Dispose();
    this.textStyles.set(name, items);
  }
  /** Resolves a style referenced by an edit-cell span. @param name - Text style name. @returns Borrowed edit items. */
  GetTextStyle(name: string): SfxItemSet | undefined {
    return this.textStyles.get(name);
  }
  /** Registers a complete data-style declaration by name. @param name - Source style name. @param style - Declared format. @returns Nothing. */
  AddNumberStyle(name: string, style: SvXMLNumFormatContext): void {
    this.numberStyles.set(name, style);
  }
  private defaultNumberStyle: string | null = null;
  /** Populates the original Default style from the named styles stream. @param pattern - Parsed direct properties. @param reference - Optional data-style reference. @returns Nothing. */
  ApplyDefaultCellStyle(pattern: ScPatternAttr, reference: string | null): void {
    this.document.GetStyleSheetPool()?.SetDefaultCellStyle(pattern.GetItemSet());
    this.defaultNumberStyle = reference;
  }
  /** Applies ODF cell defaults through the native item pool and special wrap setting. @param pattern - Document default properties. @returns Nothing. */
  ApplyDocumentDefaults(pattern: ScPatternAttr): void {
    const pool = this.document.GetPool();
    for (const item of pattern.GetItemSet().entries()) {
      if (item.Which() !== ATTR_LINEBREAK) pool?.SetUserDefaultItem(item);
      else if ((item as ScLineBreakCell).GetValue()) {
        const options = new ScDocOptions(this.document.GetDocOptions());
        options.SetIgnoreLineBreaks(true);
        this.document.SetDocOptions(options);
      }
    }
  }
  /** Resolves the default data style before dependent cells use the Default item set. @returns Nothing. */
  ApplyDefaultNumberStyle(): void {
    if (!this.defaultNumberStyle) return;
    const key = this.numberStyles.get(this.defaultNumberStyle)?.GetKey(this.numberStyles);
    if (key === undefined) return;
    const item = new SfxUInt32Item(ATTR_VALUE_FORMAT, key);
    try {
      const pool = this.document.GetStyleSheetPool();
      pool?.GetDefaultStyle()?.GetItemSet().Put(item);
      this.document.getCellAttributeHelper().getDefaultCellAttribute().InvalidateCaches();
    } finally {
      item.Dispose();
    }
    this.defaultNumberStyle = null;
  }
  /** Borrows actual automatic style data; missing references remain diagnosed. @param name - Style reference. @returns Pattern or null. */
  GetAutoStyle(name: string): ScPatternAttr | null {
    const pending = this.pendingNumberStyles.get(name);
    if (pending) {
      const key = this.numberStyles.get(pending.reference)?.GetKey(this.numberStyles);
      if (key === undefined) this.unsupported("cell style/number format");
      else {
        const item = new SfxUInt32Item(ATTR_VALUE_FORMAT, key);
        try {
          pending.pattern.ItemSetPut(item);
        } finally {
          item.Dispose();
        }
      }
      this.pendingNumberStyles.delete(name);
      this.autoStyles.set(name, new CellAttributeHolder(pending.pattern, true));
    }
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
  /** Imports font declarations from the native styles stream before cell content. Named styles remain diagnosed by the existing context. @param xml - Styles stream. @returns Nothing. */
  importStyles(xml: string): void {
    parseOdfXmlStream(
      xml,
      {
        /** Requires the original styles root. @param element - Token. @returns Document context. */
        createFastContext: (element: XMLToken): SvXMLImportContext => {
          if (element !== XMLToken.OFFICE_DOCUMENT_STYLES)
            throw new Error("ODS document-styles expected");
          return new ScXMLDocContext_Impl(this);
        },
        /** Rejects an unrelated styles root. @returns Never. */
        createUnknownContext(): never {
          throw new Error("ODS unknown styles root");
        },
      },
      this.options,
    );
  }
  /** Parses directly into the real document with native normal recalculation disabled during import. @param xml - Content. @returns Nothing. */
  importContent(xml: string): void {
    if (this.document.GetTableCount()) throw new Error("ODS import requires a fresh document");
    const auto = this.document.GetAutoCalc();
    this.document.SetAutoCalc(false);
    try {
      parseOdfXmlStream(xml, this, this.options);
      if (!this.body) throw new Error("ODS spreadsheet body is missing");
      const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
      InsertRangeNames(
        this.document,
        this.namedExpressions.map(
          /** Resolves the original position after sheet creation. @param name - Source definition. @returns Native admission record. */
          (name) => ({ ...name, pos: GetNamedExpressionBase(this.document, name) }),
        ),
        grammar,
      );
      for (const { address, source } of this.pendingFormulas) {
        const value = unicode(source);
        try {
          this.docImport.setFormulaCell(address, value, grammar);
        } finally {
          value.dispose();
        }
      }
      this.docImport.finalize();
      for (let tab = 0; tab < this.document.GetTableCount(); ++tab) {
        const table = this.document.FetchTable(tab);
        if (!table) continue;
        table
          .GetOutlineTable()
          ?.GetRowArray()
          .finalizeImport(
            /** Resolves the source last hidden row in the native flat segment table. @param row - Group start. @returns Hidden extent or absence. */
            (row) => {
              const end: [number] = [row];
              return table.RowHidden(row, undefined, end) ? end[0] : -1;
            },
          );
      }
      for (const [tab, ranges] of this.recalcRows) {
        const table = this.document.FetchTable(tab) as ScTable;
        const context = new RowHeightContext(this.document.MaxRow(), 1 / 15, 1 / 15, 1, 1, null);
        const iterator = new ScFlatBoolRowSegments.RangeIterator(ranges);
        const range = { mnRow1: 0, mnRow2: 0, mbValue: false };
        for (let found = iterator.getFirst(range); found; found = iterator.getNext(range))
          if (range.mbValue) table.SetOptimalHeight(context, range.mnRow1, range.mnRow2, true);
      }
    } finally {
      this.document.SetAutoCalc(auto);
      this.DisposeStyles();
    }
  }
  /** Releases temporary style holders after import or worker transfer. @returns Nothing. */
  DisposeStyles(): void {
    for (const { pattern } of this.pendingNumberStyles.values()) pattern.Dispose();
    this.pendingNumberStyles.clear();
    this.numberStyles.clear();
    for (const holder of this.autoStyles.values()) holder.Dispose();
    this.autoStyles.clear();
    for (const items of this.textStyles.values()) items.Dispose();
    this.textStyles.clear();
    this.rowStyles.clear();
    this.columnStyles.clear();
    this.tableStyles.clear();
    this.fontFaces.clear();
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
    if (element === XMLToken.OFFICE_FONT_FACE_DECLS) return this.owner.CreateFontDeclsContext();
    if (element === XMLToken.OFFICE_STYLES) return new XMLTableStylesContext(this.owner, true);
    if (element === XMLToken.OFFICE_MASTER_STYLES) {
      this.owner.unsupported("named and master styles are not preserved");
      return new SvXMLIgnoreContext(true);
    }
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
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ATTR_LINEBREAK, ATTR_VALUE_FORMAT } from "../../../inc/scitems";
