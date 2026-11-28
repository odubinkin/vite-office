import {
  SvXMLUnitConverter,
  type ConfigurationProperties,
} from "../../../../xmloff/source/core/xmluconv";
import { ScCalcConfig } from "../../core/tool/calcconfig";
import { ScDocumentConfiguration } from "../../ui/unoobj/confuno";
/** @fileoverview Calc scalar,cell-font and row/column geometry import over shared fast XML contexts;advanced styles,device layout and objects remain unported. */
import { SetLabelRanges, type ScMyLabelRange } from "./xmllabri";
import type { ScMyImportValidation } from "./xmlcvali";
import { ScValidationData } from "../../core/data/validat";
import { ScXMLChangeTrackingImportHelper } from "./XMLChangeTrackingImportHelper";
import { ScChangeTrack } from "../../core/tool/chgtrack";
import { decodeBase64 } from "../../../../comphelper/source/misc/base64";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScCompiler } from "../../../inc/compiler";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import type { ScXMLDatabaseRangeContext } from "./xmldrani";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScFormulaCell } from "../../core/data/formulacell";
import { SV_COUNTRY_LANGUAGE_OFFSET, SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { getCurrencySymbol } from "../../../../xmloff/source/style/numehelp";
import { LANGUAGE_DONTKNOW } from "../../../../i18nlangtag/inc/lang";
import { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";
import { LanguageTag } from "../../../../i18nlangtag/source/languagetag/languagetag.value";
import {
  getNumDecimalSep,
  getNumThousandSep,
} from "../../../../unotools/source/i18n/localedatawrapper";
import type { SvXMLNumFormatContext } from "../../../../xmloff/source/style/xmlnumfi";

import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
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
import { XMLTableStylesContext, type ScXMLMapContext } from "./xmlstyli";
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
import { ScAddress, type ScRange } from "../../../inc/address";
import { ScConditionalFormat } from "../../../inc/conditio";
import { ScRangeList } from "../../../inc/rangelst";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
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
import { INetURLObject } from "../../../../tools/source/fsys/urlobj.object";
import { WritingMode2 } from "../../../../offapi/com/sun/star/text/WritingMode2";
import type { SvxBrushItem } from "../../../../editeng/inc/brushitem";
/** Browser parser ceilings bind native scalar import to bounded resources. */
export interface ScXMLImportOptions extends OdfXmlParseOptions {
  readonly maxExpandedCells?: number;
  readonly baseUrl?: string;
}
/** Saved numeric, text, empty or error result for one matrix formula cell. */
interface MatrixCellResult {
  readonly position: ScAddress;
  readonly value: number | string | null | undefined;
  readonly error: FormulaError;
}

/** Matrix ranges are retained until named expressions are installed and formulas can be compiled. */
interface MatrixFormulaRange {
  readonly range: ScRange;
  readonly master: MatrixCellResult;
  readonly members: MatrixCellResult[];
}

/** Conditional entries and joined rectangles held until the formula compile phase. */
interface StyleConditionalFormat {
  readonly maps: readonly ScXMLMapContext[];
  readonly ranges: ScRangeList;
}

/** An ODF formula token string and its original compiler grammar. */
export interface ScXMLFormula {
  readonly source: string;
  readonly grammar: Grammar;
}

/** Actual import root/state for scalar content;no intermediate sheet/cell data model is retained. */
export class ScXMLImport extends SvXMLImport implements SvXMLImportRootFactory {
  private changeTrackingImportHelper: ScXMLChangeTrackingImportHelper | undefined;

  /** Borrows the native deferred change loading helper. @returns Change tracking import owner. */
  GetChangeTrackingImportHelper(): ScXMLChangeTrackingImportHelper {
    return (this.changeTrackingImportHelper ??= new ScXMLChangeTrackingImportHelper());
  }
  /** Resolves a field reference when the caller supplies the original document URI. @param href - ODF reference. @returns Document-relative or resolved URI. */
  GetAbsoluteReference(href: string): string {
    return this.options.baseUrl ? INetURLObject.GetAbsURL(this.options.baseUrl, href) : href;
  }
  readonly docImport: ScDocumentImport;
  private readonly labelRanges: ScMyLabelRange[] = [];
  private readonly validations = new Map<string, ScMyImportValidation>();
  private readonly validationRanges: { name: string; range: ScRange }[] = [];

  /** Registers the first ODF validation declaration with its source name. @param definition - Declared rule. @returns Nothing. */
  AddValidation(definition: ScMyImportValidation): void {
    if (!this.validations.has(definition.name)) this.validations.set(definition.name, definition);
  }

  /** Records the cell range until named expressions and styles are available. @param name - Source declaration name. @param range - Native range including repeated blank cells. @returns Nothing. */
  AddValidationRange(name: string, range: ScRange): void {
    this.validationRanges.push({ name, range });
  }

  /** Resolves referenced rules and applies their original pattern delta. @returns Nothing. */
  private FinalizeValidations(): void {
    const document = this.document;
    const keys = new Map<string, number>();
    for (const { name, range } of this.validationRanges) {
      let key = keys.get(name);
      if (key === undefined) {
        const descriptor = this.validations.get(name);
        if (!descriptor) continue;
        const base = new ScAddress();
        ScRangeStringConverter.GetAddressFromString(
          base,
          descriptor.base,
          document,
          FormulaGrammar.AddressConvention.CONV_OOO,
          [0],
        );
        const tokens: ScTokenArray[] = [];
        try {
          for (const operand of descriptor.operands) {
            const expression = unicode(operand.source);
            try {
              tokens.push(
                new ScCompiler(document, base, operand.grammar).CompileString(expression),
              );
            } finally {
              expression.dispose();
            }
          }
          const rule = new ScValidationData(
            descriptor.mode,
            descriptor.comparison,
            tokens,
            document,
            base,
            document.GetStorageGrammar(),
          );
          try {
            rule.SetIgnoreBlank(descriptor.ignoreBlank);
            rule.SetCaseSensitive(descriptor.caseSensitive);
            rule.SetListType(descriptor.showList);
            rule.SetInput(descriptor.input.title, descriptor.input.message);
            if (!descriptor.input.display) rule.ResetInput();
            rule.SetError(descriptor.error.title, descriptor.error.message, descriptor.alert);
            if (!descriptor.error.display) rule.ResetError();
            key = document.AddValidationEntry(rule);
            keys.set(name, key);
          } finally {
            rule.Dispose();
          }
        } finally {
          for (const code of tokens) code.Clear();
        }
      }
      if (!key) continue;
      const pattern = new ScPatternAttr(document.getCellAttributeHelper());
      const item = new SfxUInt32Item(ATTR_VALIDDATA, key);
      try {
        pattern.ItemSetPut(item);
        document.ApplyPatternAreaTab(
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
          range.aStart.Tab(),
          pattern,
        );
      } finally {
        item.Dispose();
        pattern.Dispose();
      }
    }
    this.validationRanges.length = 0;
    this.validations.clear();
  }
  /** Stages a label pair until all sheets are known. @param range - Pair text. @returns Nothing. */
  AddLabelRange(range: ScMyLabelRange): void {
    this.labelRanges.push(range);
  }
  private readonly namedExpressions: ScMyNamedExpression[] = [];
  private readonly matrixRanges: MatrixFormulaRange[] = [];
  private readonly pendingFormulas: {
    address: ScAddress;
    formula: ScXMLFormula;
    cache: number | string | undefined;
    hasStyle: boolean;
    emptyDisplay: boolean;
    matrix?: MatrixFormulaRange;
  }[] = [];

  private readonly databaseRanges: ScXMLDatabaseRangeContext[] = [];

  /** Queues a database range until all source sheets are available. @param context - Native database context. */
  AddDatabaseRange(context: ScXMLDatabaseRangeContext): void {
    this.databaseRanges.push(context);
  }

  /** Collects the named definition before resolution. @param expression - Original XML definition. @returns Nothing. */
  AddNamedExpression(expression: ScMyNamedExpression): void {
    this.namedExpressions.push(expression);
  }
  /** Defers a cell formula until name indexes exist. @param address - Destination. @param formula - Formula text and original grammar. @param cache - Saved result. @param hasStyle - Whether a style reference was authored. @param emptyDisplay - Whether a numeric zero was displayed as empty. @returns Nothing. */
  AddFormula(
    address: ScAddress,
    formula: ScXMLFormula,
    cache: number | string | undefined,
    hasStyle: boolean,
    emptyDisplay: boolean,
  ): void {
    this.pendingFormulas.push({ address, formula, cache, hasStyle, emptyDisplay });
  }

  /** Queues a native master range and its top-left cache. @param range - Clipped array rectangle. @param formula - Formula text and original grammar. @param cache - Saved top-left value. @param error - Original error. @returns Nothing. */
  AddMatrixFormula(
    range: ScRange,
    formula: ScXMLFormula,
    cache: number | string | null | undefined,
    error: FormulaError,
  ): void {
    this.consumeCells(
      error === FormulaError.Spill
        ? 1
        : (range.aEnd.Col() - range.aStart.Col() + 1) * (range.aEnd.Row() - range.aStart.Row() + 1),
    );
    const matrix = { range, master: { position: range.aStart, value: cache, error }, members: [] };
    if (error !== FormulaError.Spill) this.matrixRanges.push(matrix);
    this.pendingFormulas.push({
      address: range.aStart,
      formula,
      cache: undefined,
      hasStyle: true,
      emptyDisplay: false,
      matrix,
    });
  }

  /** Adopts a cache only for cells inside a materialized matrix range. @param position - Saved cell position. @param value - Saved result. @param error - Saved error. @returns Whether the position belongs to a matrix. */
  SetMatrixFormulaResult(
    position: ScAddress,
    value: number | string | null,
    error: FormulaError,
  ): boolean {
    for (let index = this.matrixRanges.length - 1; index >= 0; index--) {
      const matrix = this.matrixRanges[index];
      if (!matrix?.range.Contains(position)) continue;
      matrix.members.push({ position, value, error });
      return true;
    }
    return false;
  }

  /** Reads the original ODF scalar discriminator. @param value - ODF attribute. @returns Native type. */
  GetCellType(value: string): number {
    switch (value) {
      case "float":
        return T.NUMBER;
      case "percentage":
        return T.PERCENT;
      case "currency":
        return T.CURRENCY;
      case "date":
        return T.DATETIME;
      case "time":
        return T.TIME;
      case "boolean":
        return T.LOGICAL;
      case "string":
        return T.TEXT;
      default:
        return T.UNDEFINED;
    }
  }

  /** Applies the resolved cell style and effective type to its native range. @param range - Original formatted rectangle. @param name - Resolved cell style. @param type - ODF number category. @param currency - Source currency. @returns Nothing. */
  SetStyleToRange(range: ScRange, name: string, type: number, currency: string | null): void {
    const { aStart: start, aEnd: end } = range;
    const pattern = this.GetAutoStyle(name);
    const style = pattern?.GetStyleSheet();
    if (style && style !== this.document.GetStyleSheetPool()?.GetDefaultStyle())
      this.document.ApplyStyleAreaTab(
        start.Col(),
        start.Row(),
        end.Col(),
        end.Row(),
        start.Tab(),
        style,
      );
    if (pattern?.GetItemSet().Count())
      this.document.ApplyPatternAreaTab(
        start.Col(),
        start.Row(),
        end.Col(),
        end.Row(),
        start.Tab(),
        pattern,
      );
    this.SetType(range, type, currency);
    this.ApplyCondFormat(name, range);
  }

  /** Applies the source type-based number-format override after cell styles. @param range - Original formatted rectangle. @param type - ODF number category. @param currency - Source currency. @returns Nothing. */
  private SetType(range: ScRange, type: number, currency: string | null): void {
    if (type === T.TEXT || type === T.UNDEFINED || type === T.NUMBER) return;
    const { aStart: start, aEnd: end } = range;
    const formatter = this.document.GetFormatTable();
    const key = this.document.GetPattern(start)?.GetNumberFormat(formatter) ?? 0;
    const entry = formatter.GetEntry(key);
    if (!entry) return;
    const current = formatter.GetType(key) & ~T.DEFINED;
    let next = key;
    if (type === T.CURRENCY) {
      const actual = getCurrencySymbol(formatter, key);
      if (currency && actual && currency !== actual) next = this.SetCurrencySymbol(key, currency);
    } else if (type !== current && key % SV_COUNTRY_LANGUAGE_OFFSET === 0)
      next = formatter.GetStandardFormat(type, entry.GetLanguage());
    if (next === key) return;
    const pattern = new ScPatternAttr(this.document.getCellAttributeHelper());
    try {
      this.PutCellNumberFormat(pattern.GetItemSetWritable(), next);
      this.document.ApplyPatternAreaTab(
        start.Col(),
        start.Row(),
        end.Col(),
        end.Row(),
        start.Tab(),
        pattern,
      );
    } finally {
      pattern.Dispose();
    }
  }

  /** Compiles the source locale currency format for a changed bank symbol. @param key - Original key. @param currency - Requested bank symbol. @returns Format key. */
  private SetCurrencySymbol(key: number, currency: string): number {
    const formatter = this.document.GetFormatTable();
    const language = formatter.GetEntry(key)?.GetLanguage();
    if (language === undefined) return key;
    const locale = new LanguageTag(language).getLocale();
    const group = getNumThousandSep(locale);
    const decimal = getNumDecimalSep(locale);
    const code = unicode(`#${text(group)}##0${text(decimal)}00 [$${currency}]`);
    const check: [number] = [0],
      type: [number] = [0],
      result: [number] = [key];
    try {
      formatter.PutEntry(code, check, type, result, language);
      if (check[0] === 0) return result[0];
      this.unsupported("invalid cell currency format");
      return key;
    } finally {
      code.dispose();
      group.dispose();
      decimal.dispose();
    }
  }

  private readonly conditionalFormats: ScXMLConditionalFormatsContext[] = [];
  private readonly styleConditionalFormats = new Map<number, StyleConditionalFormat[]>();
  private readonly conditionalStyles = new Map<string, readonly ScXMLMapContext[]>();
  private readonly attachedConditionalStyles = new Set<readonly ScXMLMapContext[]>();
  private hasNewCondFormatData = false;

  /** Sets the document-wide gate when the original extension starts, even for an empty element. @param tab - Current sheet. @returns Nothing. */
  SetNewCondFormatData(tab: number): void {
    this.hasNewCondFormatData = true;
    this.styleConditionalFormats.delete(tab);
  }

  /** Applies one automatic style rectangle using the native pre-compilation equality and ownership order. @param name - Automatic style name. @param range - Styled rectangle. @returns Nothing. */
  private ApplyCondFormat(name: string, range: ScRange): void {
    const maps = this.conditionalStyles.get(name);
    if (!maps?.length || this.hasNewCondFormatData) return;
    const tab = range.aStart.Tab();
    let formats = this.styleConditionalFormats.get(tab);
    if (!formats) this.styleConditionalFormats.set(tab, (formats = []));
    const existing = formats.find(
      /** Matches ordered entries on the current sheet before compiling their formulas. @param format - Candidate format. @returns Equality. */
      (format) =>
        format.maps.length === maps.length &&
        format.maps.every(
          /** Compares the map at one position. @param map - Candidate entry. @param index - Original position. @returns Equality. */
          (map, index) => map.EqualEntry(maps[index]),
        ),
    );
    if (existing) existing.ranges.Join(range);
    else if (!this.attachedConditionalStyles.has(maps)) {
      const ranges = new ScRangeList();
      ranges.Join(range);
      formats.push({ maps, ranges });
      this.attachedConditionalStyles.add(maps);
    }
  }

  /** Defers conditional formulas until sheet and name indexes exist. @param formats - Original sheet element. @returns Nothing. */
  AddConditionalFormats(formats: ScXMLConditionalFormatsContext): void {
    this.conditionalFormats.push(formats);
  }

  /** Realizes deferred conditional ranges and cell indexes. @returns Nothing. */
  FinalizeConditionalFormats(): void {
    for (const [tab, formats] of this.styleConditionalFormats) {
      for (const { maps, ranges } of formats) {
        const format = new ScConditionalFormat(0, this.document);
        let key = 0;
        try {
          for (const map of maps) format.AddEntry(map.CreateConditionEntry(this));
          format.SetRange(ranges);
          key = this.document.AddCondFormat(format, tab);
        } finally {
          if (!key) format.Dispose();
        }
        if (key) this.document.AddCondFormatData(ranges, tab, key);
      }
    }
    this.styleConditionalFormats.clear();
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
  /** Registers the original declaration before the package wrapper reads its bytes. @param font - Shared declaration. */
  registerEmbeddedFont(font: OdfEmbeddedFont): void {
    this.document.RegisterEmbeddedFont(font);
  }
  /** Applies the original Calc notification after a font has been admitted. */
  NotifyContainsEmbeddedFont(): void {
    this.document.SetEmbedFonts(true);
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
    {
      visible: boolean;
      tabColor: Readonly<Color>;
      masterPage: string | null;
      writingMode: number | undefined;
      background: SvxBrushItem | undefined;
    }
  >();
  /** Registers properties of the native table-family style. @param name - Automatic style. @param visible - Sheet display. @param tabColor - Sheet tab color. @param masterPage - Associated page style. @param writingMode - Authored UNO sheet layout mode. @param background - Owned import-only cell background. @returns Nothing. */
  AddTableStyle(
    name: string,
    visible: boolean,
    tabColor: Readonly<Color>,
    masterPage: string | null,
    writingMode?: number,
    background?: SvxBrushItem,
  ): void {
    this.tableStyles.get(name)?.background?.Dispose();
    this.tableStyles.set(name, { visible, tabColor, masterPage, writingMode, background });
  }
  /** Applies the sheet style to its native owner. @param name - Automatic style. @param tab - Native sheet. @returns Nothing. */
  ApplyTableStyle(name: string, tab: number): void {
    const style = this.tableStyles.get(name);
    if (!style) this.unsupported("table:style-name");
    else {
      this.document.SetVisible(tab, style.visible);
      this.document.SetTabBgColor(tab, style.tabColor);
      if (style.writingMode !== undefined)
        this.document.SetLayoutRTL(tab, style.writingMode === WritingMode2.RL_TB);
      if (style.masterPage) this.pageStyles.Apply(tab, style.masterPage);
      if (style.background) {
        const pattern = new ScPatternAttr(this.document.getCellAttributeHelper());
        try {
          pattern.ItemSetPut(style.background);
          this.document.ApplyPatternAreaTab(
            0,
            0,
            this.document.MaxCol(),
            this.document.MaxRow(),
            tab,
            pattern,
          );
        } finally {
          pattern.Dispose();
        }
      }
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
  /** Retains an automatic pattern until its named style and number format can be resolved. @param name - Source name. @param pattern - Adopted source pattern. @param reference - ODF data style. @param parent - Named parent. @param maps - Ordered conditional maps. @returns Nothing. */
  AddAutoStyle(
    name: string,
    pattern: ScPatternAttr,
    reference: string | null = null,
    parent: string | null = null,
    maps: readonly ScXMLMapContext[] = [],
  ): void {
    this.pendingAutoStyles.get(name)?.pattern.Dispose();
    this.autoStyles.get(name)?.Dispose();
    this.autoStyles.delete(name);
    this.pendingAutoStyles.set(name, { pattern, reference, parent });
    if (maps.length) this.conditionalStyles.set(name, maps);
    else this.conditionalStyles.delete(name);
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
    this.PutCellNumberFormat(items, key);
    return true;
  }

  /** Applies the source UNO NumberFormat property's value and formatter language to cell attributes. @param items - Borrowed native attributes. @param key - Formatter key. @returns Nothing. */
  private PutCellNumberFormat(items: SfxItemSet, key: number): void {
    const language =
      this.document.GetFormatTable().GetEntry(key)?.GetLanguage() ?? LANGUAGE_DONTKNOW;
    items.Put(new SfxUInt32Item(ATTR_VALUE_FORMAT, key), true);
    const old = items.Get(ATTR_LANGUAGE_FORMAT) as SvxLanguageItem;
    if (language !== LANGUAGE_DONTKNOW && language !== old.GetLanguage())
      items.Put(new SvxLanguageItem(language, ATTR_LANGUAGE_FORMAT), true);
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
  /** Resolves built-in formula prefixes or retains the entire attribute with the document's storage grammar. @param value - Formula attribute. @param attributes - Actual SAX scope. @returns Original formula text and grammar. */
  ExtractFormulaNamespaceGrammar(value: string, attributes: FastAttributeList): ScXMLFormula {
    const colon = value.indexOf(":");
    const namespace = colon < 0 ? undefined : attributes.getNamespaceUri(value.slice(0, colon));
    if (namespace === ODF_NAMESPACES.oooc)
      return { source: value.slice(colon + 1), grammar: FormulaGrammar.Grammar.GRAM_PODF };
    if (namespace === ODF_NAMESPACES.of)
      return { source: value.slice(colon + 1), grammar: FormulaGrammar.Grammar.GRAM_ODFF };
    return { source: value, grammar: this.document.GetStorageGrammar() };
  }
  /** Creates the supported native content document context. @param element - Root. @returns Context. */
  createFastContext(element: XMLToken): SvXMLImportContext {
    if (element !== XMLToken.OFFICE_DOCUMENT_CONTENT)
      throw new Error("ODS document-content expected");
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
  /** Applies represented native document settings before sheet styles and content. @param properties - Borrowed xmloff property vector. @returns Nothing. */
  SetConfigurationSettings(properties: ConfigurationProperties): void {
    for (const property of [...properties].reverse()) {
      if (text(property.Name) !== "TrackedChangesProtectionKey") continue;
      const value = new OUString();
      try {
        if (property.Value.extract(value, "OUString")) {
          const bytes = decodeBase64(text(value));
          if (bytes.length) {
            const track = this.document.GetChangeTrack() ?? new ScChangeTrack(this.document);
            track.SetProtection(bytes);
            this.document.SetChangeTrack(track);
          }
        }
      } finally {
        value.dispose();
      }
    }
    SvXMLUnitConverter.convertPropertySet(
      new ScDocumentConfiguration(this.document),
      [...properties].reverse(),
    );
  }

  /** Restores the historical combined reference syntax when the document omitted it. @returns Nothing. */
  private SetStringRefSyntaxIfMissing(): void {
    const current = this.document.GetCalcConfig();
    if (current.mbHasStringRefSyntax) return;
    const config = new ScCalcConfig(current);
    try {
      config.meStringRefAddressSyntax = FormulaGrammar.AddressConvention.CONV_A1_XL_A1;
      this.document.SetCalcConfig(config);
    } finally {
      config.dispose();
    }
  }

  /** Parses directly into the real document with native normal recalculation disabled during import. @param xml - Content. @returns Nothing. */
  importContent(xml: string): void {
    if (this.document.GetTableCount()) throw new Error("ODS import requires a fresh document");
    const auto = this.document.GetAutoCalc();
    this.document.SetAutoCalc(false);
    try {
      parseOdfXmlStream(xml, this, this.options);
      if (!this.body) throw new Error("ODS spreadsheet body is missing");
      SetLabelRanges(this.document, this.labelRanges);
      for (const range of this.databaseRanges) range.Apply(this.document);
      this.databaseRanges.length = 0;
      InsertRangeNames(
        this.document,
        this.namedExpressions.map(
          /** Resolves the original position after sheet creation. @param name - Source definition. @returns Native admission record. */
          (name) => ({ ...name, pos: GetNamedExpressionBase(this.document, name) }),
        ),
        this.document.GetStorageGrammar(),
      );
      for (const { address, formula, cache, hasStyle, emptyDisplay, matrix } of this
        .pendingFormulas) {
        const { source, grammar } = formula;
        const value = unicode(source);
        try {
          if (matrix) {
            const master = this.docImport.setMatrixCells(
              matrix.range,
              value,
              grammar,
              matrix.master.error === FormulaError.Spill,
            );
            if (matrix.master.value !== undefined)
              master.SetMatrixCachedResult(matrix.master.value, matrix.master.error);
            for (const result of matrix.members)
              if (result.value !== undefined)
                this.document
                  .GetFormulaCell(result.position)
                  ?.SetMatrixCachedResult(result.value, result.error);
            continue;
          }
          const cell = new ScFormulaCell(this.document, address, value, grammar);
          if (typeof cache === "string") {
            const string = unicode(cache);
            const shared = this.document.GetSharedStringPool().intern(string);
            try {
              cell.SetHybridString(shared);
              cell.ResetDirty();
            } finally {
              shared.dispose();
              string.dispose();
            }
          } else {
            cell.SetNeedNumberFormat(!hasStyle);
            if (cache !== undefined) {
              cell.SetHybridDouble(cache);
              if (emptyDisplay) cell.SetHybridEmptyDisplayedAsString();
              else cell.ResetDirty();
            }
          }
          this.docImport.setFormulaCell(address, cell);
        } finally {
          value.dispose();
        }
      }
      this.docImport.finalize();
      this.changeTrackingImportHelper?.CreateChangeTrack(this.document);
      this.SetStringRefSyntaxIfMissing();
      this.FinalizeConditionalFormats();
      this.FinalizeValidations();
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
    this.conditionalStyles.clear();
    this.styleConditionalFormats.clear();
    this.attachedConditionalStyles.clear();
    this.numberStyles.clear();
    this.namedCellStyles.clear();
    for (const holder of this.autoStyles.values()) holder.Dispose();
    this.autoStyles.clear();
    for (const items of this.textStyles.values()) items.Dispose();
    this.textStyles.clear();
    this.rowStyles.clear();
    this.columnStyles.clear();
    for (const { background } of this.tableStyles.values()) background?.Dispose();
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
import {
  ATTR_LANGUAGE_FORMAT,
  ATTR_LINEBREAK,
  ATTR_VALIDDATA,
  ATTR_VALUE_FORMAT,
} from "../../../inc/scitems";
