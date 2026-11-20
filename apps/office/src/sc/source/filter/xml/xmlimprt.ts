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
import type { Color } from "../../../../tools/inc/color";
import { ScXMLPageStyles } from "./xmlstyle.page";
import { XMLTableStylesContext } from "./xmlstyli";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
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
import { ScXMLConditionalFormatsContext } from "./xmlcondformat";
import type { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import { ScStyleNameConversion } from "../../core/tool/stylehelper";
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
  private readonly conditionalFormats: ScXMLConditionalFormatsContext[] = [];

  /** Defers conditional formulas until sheet and name indexes exist. @param formats - Original sheet element. @returns Nothing. */
  AddConditionalFormats(formats: ScXMLConditionalFormatsContext): void {
    this.conditionalFormats.push(formats);
  }

  /** Realizes deferred conditional ranges and cell indexes. @returns Nothing. */
  FinalizeConditionalFormats(): void {
    for (const formats of this.conditionalFormats) formats.Finalize();
    this.conditionalFormats.length = 0;
  }

  /** Reads the original per-sheet ODF element from the temporary worker record. @param xml - Conditional format XML. @param tab - Sheet. @returns Nothing. */
  importConditionalFormats(xml: string, tab: number): void {
    parseOdfXmlStream(
      xml,
      {
        /** Requires the extension's original root. @param element - Token. @returns Context. */
        createFastContext: (element: XMLToken) => {
          if (element !== XMLToken.CALCEXT_CONDITIONAL_FORMATS)
            throw new Error("Calc worker conditional formats expected");
          return new ScXMLConditionalFormatsContext(this, tab);
        },
        /** Rejects an unrelated record. @returns Never. */
        createUnknownContext(): never {
          throw new Error("Unknown Calc worker conditional formats element");
        },
      },
      this.options,
    );
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
  private readonly pendingAutoStyles = new Map<
    string,
    { pattern: ScPatternAttr; reference: string | null; parent: string | null }
  >();
  private readonly numberStyles = new Map<string, SvXMLNumFormatContext>();
  readonly pageStyles: ScXMLPageStyles;
  private readonly tableStyles = new Map<
    string,
    { visible: boolean; tabColor: Readonly<Color>; masterPage: string | null }
  >();
  /** Registers properties of the native table-family style. @param name - Automatic style. @param visible - Sheet display. @param tabColor - Sheet tab color. @param masterPage - Associated page style. @returns Nothing. */
  AddTableStyle(
    name: string,
    visible: boolean,
    tabColor: Readonly<Color>,
    masterPage: string | null,
  ): void {
    this.tableStyles.set(name, { visible, tabColor, masterPage });
  }
  /** Applies the sheet style to its native owner. @param name - Automatic style. @param tab - Native sheet. @returns Nothing. */
  ApplyTableStyle(name: string, tab: number): void {
    const style = this.tableStyles.get(name);
    if (!style) this.unsupported("table:style-name");
    else {
      this.document.SetVisible(tab, style.visible);
      this.document.SetTabBgColor(tab, style.tabColor);
      if (style.masterPage) this.pageStyles.Apply(tab, style.masterPage);
    }
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
    this.pageStyles = new ScXMLPageStyles(document, this);
  }
  /** Retains an automatic pattern until its named style and number format can be resolved. @param name - Source name. @param pattern - Adopted source pattern. @param reference - ODF data style. @param parent - Named parent. @returns Nothing. */
  AddAutoStyle(
    name: string,
    pattern: ScPatternAttr,
    reference: string | null = null,
    parent: string | null = null,
  ): void {
    this.pendingAutoStyles.get(name)?.pattern.Dispose();
    this.autoStyles.get(name)?.Dispose();
    this.autoStyles.delete(name);
    this.pendingAutoStyles.set(name, { pattern, reference, parent });
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
  private readonly namedCellStyles = new Map<
    string,
    {
      style: SfxStyleSheetBase;
      parent: string | null;
      dataStyle: string | null;
    }
  >();

  /** Creates the original style owner before parent and data-style resolution. @param name - Encoded ODF style name. @param displayName - Source unencoded name. @param parent - Encoded named parent. @param dataStyle - Named number format. @param pattern - Direct imported items. @returns Nothing. */
  ApplyNamedCellStyle(
    name: string,
    displayName: string | null,
    parent: string | null,
    dataStyle: string | null,
    pattern: ScPatternAttr,
  ): void {
    const pool = this.document.GetStyleSheetPool();
    if (!pool) return;
    const source = unicode(displayName ?? name);
    const display = ScStyleNameConversion.ProgrammaticToDisplayName(source, SfxStyleFamily.Para);
    try {
      const style =
        pool.Find(display, SfxStyleFamily.Para) ??
        pool.Make(display, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined);
      style.GetItemSet().PutSet(pattern.GetItemSet());
      this.namedCellStyles.set(name, { style, parent, dataStyle });
    } finally {
      display.dispose();
      source.dispose();
    }
  }

  /** Resolves a native style from its declared ODF name. @param name - Encoded style reference. @returns Original style, if declared. */
  GetNamedCellStyle(name: string | null): SfxStyleSheetBase | null {
    if (name === "Default") return this.document.GetStyleSheetPool()?.GetDefaultStyle(true) ?? null;
    return name === null ? null : (this.namedCellStyles.get(name)?.style ?? null);
  }

  /** Links parents after all named declarations exist and applies their direct data styles. @returns Nothing. */
  FinishNamedCellStyles(): void {
    for (const { style, parent, dataStyle } of this.namedCellStyles.values()) {
      const named = this.GetNamedCellStyle(parent);
      if (named) {
        if (!style.SetParent(named.GetName())) this.unsupported("cell parent style not allowed");
      } else {
        const empty = unicode("");
        try {
          if (!style.GetParent().isEmpty()) style.SetParent(empty);
        } finally {
          empty.dispose();
        }
      }
      if (dataStyle) this.ApplyCellNumberStyle(style.GetItemSet(), dataStyle);
    }
  }

  /** Applies the referenced data style as a direct native item. @param items - Actual style or pattern attributes. @param reference - ODF data style name. @returns Whether a format was resolved. */
  private ApplyCellNumberStyle(items: SfxItemSet, reference: string): boolean {
    const key = this.numberStyles.get(reference)?.GetKey(this.numberStyles);
    if (key === undefined) return false;
    const item = new SfxUInt32Item(ATTR_VALUE_FORMAT, key);
    try {
      items.Put(item);
      return true;
    } finally {
      item.Dispose();
    }
  }
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
    const style = this.document.GetStyleSheetPool()?.GetDefaultStyle();
    if (!style || !this.ApplyCellNumberStyle(style.GetItemSet(), this.defaultNumberStyle)) return;
    this.document.getCellAttributeHelper().getDefaultCellAttribute().InvalidateCaches();
    this.defaultNumberStyle = null;
  }
  /** Borrows actual automatic style data; missing references remain diagnosed. @param name - Style reference. @returns Pattern or null. */
  GetAutoStyle(name: string): ScPatternAttr | null {
    const pending = this.pendingAutoStyles.get(name);
    if (pending) {
      const parent = this.GetNamedCellStyle(pending.parent);
      if (parent) pending.pattern.SetStyleSheet(parent, false);
      else if (pending.parent) this.unsupported("missing cell parent style");
      if (
        pending.reference &&
        !this.ApplyCellNumberStyle(pending.pattern.GetItemSetWritable(), pending.reference)
      )
        this.unsupported("cell style/number format");
      this.pendingAutoStyles.delete(name);
      this.autoStyles.set(name, new CellAttributeHolder(pending.pattern, true));
    }
    let pattern = this.autoStyles.get(name)?.getScPatternAttr() ?? null;
    if (pattern === null) {
      const style = this.GetNamedCellStyle(name);
      if (style) {
        pattern = new ScPatternAttr(this.document.getCellAttributeHelper());
        pattern.SetStyleSheet(style, false);
        const holder = new CellAttributeHolder(pattern, true);
        this.autoStyles.set(name, holder);
        pattern = holder.getScPatternAttr();
      } else this.unsupported("cell style/number format");
    }
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
  /** Imports native styles and font declarations before cell content. @param xml - Styles stream. @returns Nothing. */
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
      this.FinalizeConditionalFormats();
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
    for (const { pattern } of this.pendingAutoStyles.values()) pattern.Dispose();
    this.pendingAutoStyles.clear();
    this.numberStyles.clear();
    this.namedCellStyles.clear();
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
    if (element === XMLToken.OFFICE_MASTER_STYLES)
      return this.owner.pageStyles.CreateMasterStyles();
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
