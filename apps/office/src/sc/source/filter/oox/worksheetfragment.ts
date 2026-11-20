/** @fileoverview WorksheetFragment and shared-string content dispatch to the native Calc cell and formula owners. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import {
  FragmentHandler,
  type FragmentContext,
  type FragmentFilter,
} from "../../../../oox/source/core/fragmenthandler";
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { RichString } from "../inc/richstring";
import { AddressConverter } from "./addressconverter";
import { RichStringContext } from "./richstringcontext";
import type { SharedStringsBuffer } from "./sharedstringsbuffer";
import { SheetDataBuffer } from "./sheetdatabuffer";
import { readStyleBool, styleIndex, type StylesBuffer } from "./stylesbuffer";
import { WorksheetGlobals } from "./worksheethelper";
import { headerFooterElements, PageSettings } from "./pagesettings";
import { WorksheetSettings } from "./worksheetsettings";
import { SheetViewSettings, type ViewSettings } from "./viewsettings";
import { UnitConverter } from "./unitconverter";
import { toDouble } from "../../../../o3tl/inc/string_view";
import { attribute, isSpreadsheetTag } from "./workbookfragment";
import { CondFormatBuffer } from "./condformatbuffer";
import { ExtLstGlobalContext } from "./extlstcontext";

const sheetElements: Readonly<Record<string, readonly string[]>> = {
  "": ["worksheet"],
  worksheet: [
    "sheetPr",
    "sheetViews",
    "sheetFormatPr",
    "cols",
    "sheetData",
    "sheetProtection",
    "protectedRanges",
    "printOptions",
    "pageMargins",
    "pageSetup",
    "headerFooter",
    "mergeCells",
    "rowBreaks",
    "colBreaks",
    "conditionalFormatting",
    "extLst",
  ],
  headerFooter: headerFooterElements,
  sheetPr: ["tabColor", "pageSetUpPr"],
  sheetViews: ["sheetView"],
  sheetView: ["pane", "selection"],
  cols: ["col"],
  protectedRanges: ["protectedRange"],
  mergeCells: ["mergeCell"],
  rowBreaks: ["brk"],
  colBreaks: ["brk"],
  sheetData: ["row"],
  row: ["c"],
  c: ["v", "f", "is"],
};

/** Reads a finite SpreadsheetML number or the specified source default. @param value - Lexical value. @param fallback - Native default. @returns Value. */
function readDouble(value: string, fallback: number): number {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim())) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/** Worksheet sheetData callback routes effective scalar cell values to the canonical document. */
export class WorksheetFragment extends FragmentHandler {
  private readonly elementStack: string[] = [];
  private readonly tokenHandler = new FastTokenHandler();
  private readonly address: ScAddress;
  private readonly sheetData: SheetDataBuffer;
  private readonly settings = new WorksheetSettings();
  private readonly pageSettings = new PageSettings();
  private readonly condFormats: CondFormatBuffer;
  private readonly views: SheetViewSettings;
  private readonly geometry: WorksheetGlobals;
  private row = -1;
  private column = 0;
  private type = "";
  private value = "";
  private formula = "";
  private inlineString: RichString | undefined;
  private valid = false;
  private xfId = -1;
  private sharedId = -1;
  private readonly sharedFormulas = new Map<number, ScAddress>();
  private readonly pendingFormulas: { id: number; address: ScAddress }[] = [];
  sawWorksheet = false;
  /** Binds a worksheet to its actual native tab. @param filter - Package owner. @param path - Resolved part. @param document - Destination graph. @param tab - Native tab. @param sharedStrings - Shared strings. @param styles - Workbook styles. @param workbookViews - Workbook view settings. @param microsoft - Source document classification. @param units - Workbook units. @returns Fragment. */
  constructor(
    filter: FragmentFilter,
    path: string,
    private readonly document: ScDocument,
    private readonly tab: number,
    private readonly sharedStrings: SharedStringsBuffer,
    private readonly styles: StylesBuffer,
    private readonly workbookViews: ViewSettings,
    microsoft = false,
    units = new UnitConverter(),
  ) {
    super(filter, path);
    this.address = new ScAddress(0, 0, tab);
    this.condFormats = new CondFormatBuffer(document, tab);
    this.sheetData = new SheetDataBuffer(document, tab, units);
    this.views = new SheetViewSettings(document, tab);
    const table = document.FetchTable(tab);
    if (!table) throw new Error("Worksheet table is missing.");
    this.geometry = new WorksheetGlobals(table, microsoft, units);
  }
  /** Selects the represented sheet-data context. @param tag - Current element. @returns Admitted context. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (
      !isSpreadsheetTag(tag) ||
      !sheetElements[this.elementStack.at(-1) ?? ""]?.includes(tag.local)
    )
      return null;
    if (tag.local === "extLst")
      return new ExtLstGlobalContext(this.condFormats, this.styles, this.document, this.tab);
    if (tag.local === "conditionalFormatting")
      return this.condFormats.importConditionalFormatting();
    if (tag.local !== "is") return this;
    this.inlineString?.dispose();
    this.inlineString = new RichString();
    return new RichStringContext(this.inlineString, this.styles.graphicHelper);
  }
  /** Opens row and cell models, preserving explicit and omitted address semantics. @param tag - Current element. @param attributes - Lexical attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.elementStack.push(tag.local);
    switch (tag.local) {
      case "worksheet": {
        this.sawWorksheet = true;
        const normal = this.styles.getCellXf(0);
        if (normal)
          this.sheetData.setColumnFormat(
            0,
            this.document.MaxCol(),
            normal.createPattern(this.styles, this.document),
          );
        break;
      }
      case "tabColor":
        this.settings.importTabColor(attributes);
        break;
      case "pageSetUpPr":
        this.readAttributes(
          attributes,
          /** Imports native pageSetUpPr settings. @param values - Borrowed attributes. @returns Nothing. */ (
            values,
          ) => this.pageSettings.importPageSetupPr(values),
        );
        break;
      case "printOptions":
        this.readAttributes(
          attributes,
          /** Imports native printOptions settings. @param values - Borrowed attributes. @returns Nothing. */ (
            values,
          ) => this.pageSettings.importPrintOptions(values),
        );
        break;
      case "pageMargins":
        this.readAttributes(
          attributes,
          /** Imports native pageMargins settings. @param values - Borrowed attributes. @returns Nothing. */ (
            values,
          ) => this.pageSettings.importPageMargins(values),
        );
        break;
      case "pageSetup":
        this.readAttributes(
          attributes,
          /** Imports native pageSetup settings. @param values - Borrowed attributes. @returns Nothing. */ (
            values,
          ) => this.pageSettings.importPageSetup(values),
        );
        break;
      case "headerFooter":
        this.readAttributes(
          attributes,
          /** Routes the worksheet sharing flags to the original page settings. @param values - Borrowed attributes. @returns Nothing. */ (
            values,
          ) => this.pageSettings.importHeaderFooter(values),
        );
        break;
      case "sheetView":
        this.readAttributes(
          attributes,
          /** Dispatches the sheetView attributes. @param values - Borrowed XML attributes. @returns Nothing. */
          (values) => this.views.importSheetView(values),
        );
        break;
      case "pane":
        this.readAttributes(
          attributes,
          /** Imports the active pane token. @param values - Borrowed attributes. @returns Nothing. */
          (values) => this.views.importPane(values),
        );
        break;
      case "selection":
        this.readAttributes(
          attributes,
          /** Imports the pane's cursor. @param values - Borrowed attributes. @returns Nothing. */
          (values) => this.views.importSelection(values),
        );
        break;
      case "sheetProtection":
        this.readAttributes(
          attributes,
          /** Delegates protection attributes to the worksheet settings. @param values - Borrowed attributes. @returns Nothing. */
          (values) => this.settings.importSheetProtection(values),
        );
        break;
      case "protectedRange":
        this.readAttributes(
          attributes,
          /** Reads one original protected range. @param values - Borrowed XML attributes. @returns Nothing. */
          (values) => this.settings.importProtectedRange(values, this.document, this.tab),
        );
        break;
      case "sheetFormatPr": {
        const base = styleIndex(attribute(attributes, "baseColWidth"));
        this.geometry.setDefaultColumnWidth(
          base < 0 ? 8 : base,
          readDouble(attribute(attributes, "defaultColWidth"), 0),
        );
        this.geometry.setDefaultRowSettings(
          readDouble(attribute(attributes, "defaultRowHeight"), 0),
          readStyleBool(attribute(attributes, "customHeight"), false),
          readStyleBool(attribute(attributes, "zeroHeight"), false),
        );
        break;
      }
      case "col": {
        const first = styleIndex(attribute(attributes, "min")) - 1;
        const last = styleIndex(attribute(attributes, "max")) - 1;
        const model = this.geometry.setColumnModel(
          first,
          last,
          readDouble(attribute(attributes, "width"), 0),
          readStyleBool(attribute(attributes, "hidden"), false),
          styleIndex(attribute(attributes, "outlineLevel")),
          readStyleBool(attribute(attributes, "collapsed"), false),
        );
        const xf = this.styles.getCellXf(styleIndex(attribute(attributes, "style")));
        if (xf && model)
          this.sheetData.setColumnFormat(
            model.first,
            model.last,
            xf.createPattern(this.styles, this.document),
          );
        break;
      }
      case "brk":
        this.importBrk(attributes, this.elementStack.at(-2) === "rowBreaks");
        break;
      case "mergeCell": {
        const range = new ScRange();
        if (
          AddressConverter.convertToCellRangeUnchecked(
            range,
            attribute(attributes, "ref"),
            this.tab,
            this.document,
          ) &&
          range.aStart.Tab() === this.tab &&
          range.aEnd.Tab() === this.tab &&
          this.document.GetSheetLimits().ValidRange(range)
        )
          this.sheetData.setMergedRange(range);
        break;
      }
      case "row": {
        const row = styleIndex(attribute(attributes, "r"));
        this.row = row < 0 ? this.row + 1 : row - 1;
        this.geometry.setRowModel(
          this.row,
          readDouble(attribute(attributes, "ht"), -1),
          readStyleBool(attribute(attributes, "customHeight"), false),
          readStyleBool(attribute(attributes, "hidden"), false),
          styleIndex(attribute(attributes, "outlineLevel")),
          readStyleBool(attribute(attributes, "collapsed"), false),
        );
        this.column = 0;
        break;
      }
      case "c": {
        const name = attribute(attributes, "r");
        if (name) {
          const source = unicode(name);
          try {
            this.valid = AddressConverter.convertToCellAddressUnchecked(
              this.address,
              source,
              this.tab,
              this.document,
            );
          } finally {
            source.dispose();
          }
        } else {
          this.address.Set(this.column, this.row, this.tab);
          this.valid = true;
        }
        this.valid &&=
          this.address.Tab() === this.tab &&
          this.document.ValidColRow(this.address.Col(), this.address.Row());
        if (this.valid) this.column = this.address.Col() + 1;
        this.type = attribute(attributes, "t");
        this.xfId = styleIndex(attribute(attributes, "s"));
        this.value = this.formula = "";
        this.sharedId = -1;
        break;
      }
      case "f": {
        if (attribute(attributes, "t") !== "shared") break;
        const id = attribute(attributes, "si");
        if (/^\d+$/.test(id) && Number.isSafeInteger(Number(id))) this.sharedId = Number(id);
        break;
      }
    }
  }

  /** Reads the native lexical break attributes before applying them to the sheet. @param attributes - Source attributes. @param rowBreak - Row break context. @returns Nothing. */
  private importBrk(attributes: readonly SaxesAttributeNS[], rowBreak: boolean): void {
    this.readAttributes(
      attributes,
      /** Reads brk defaults through the typed list. @param values - Borrowed attributes. @returns Nothing. */ (
        values,
      ) => {
        const position = values.getInteger(token("id"), 0);
        this.geometry.setPageBreak(
          {
            position,
            min: values.getInteger(token("min"), position),
            max: values.getInteger(token("max"), position),
            manual: values.getBool(token("man"), false),
          },
          rowBreak,
        );
      },
    );
  }

  /** Adapts unqualified worksheet attributes to the native typed attribute list. @param attributes - Source attributes. @param consume - Reader for the borrowed attributes. @returns Nothing. */
  private readAttributes(
    attributes: readonly SaxesAttributeNS[],
    consume: (values: AttributeList) => void,
  ): void {
    const fast = new FastAttributeList(this.tokenHandler);
    const reference = new Reference(fast);
    const values = new AttributeList(reference);
    try {
      for (const item of attributes) if (item.uri === "") fast.add(token(item.local), item.value);
      consume(values);
    } finally {
      values.dispose();
      reference.dispose();
    }
  }
  /** Keeps cell payload text across split lexer callbacks. @param value - Source characters. @returns Nothing. */
  override characters(value: string): void {
    switch (this.elementStack.at(-1)) {
      case "v":
        this.value += value;
        break;
      case "f":
        this.formula += value;
        break;
      case "oddHeader":
      case "evenHeader":
      case "firstHeader":
      case "oddFooter":
      case "evenFooter":
      case "firstFooter":
        this.pageSettings.importHeaderFooterCharacters(this.elementStack.at(-1) as string, value);
        break;
    }
  }
  /** Commits one complete cell to its actual Calc tab. @param tag - Current element. @returns Nothing. */
  override endFastElement(tag: SaxesTagNS): void {
    if (tag.local === "c") {
      try {
        if (this.valid) this.commitCell();
      } finally {
        this.dispose();
      }
    }
    this.elementStack.pop();
  }
  /** Releases any inline string with unfinished parser callbacks. @returns Nothing. */
  dispose(): void {
    this.inlineString?.dispose();
    this.inlineString = undefined;
  }
  /** Resolves shared children after all source formula groups have been seen. @returns Nothing. */
  override endDocument(): void {
    for (const { id, address } of this.pendingFormulas) {
      const origin = this.sharedFormulas.get(id);
      const source = origin && this.document.GetFormulaCell(origin);
      if (!source) throw new Error("Shared formula master is missing.");
      this.document.SetFormulaCell(address, source.Clone(address));
    }
    this.sheetData.finalizeImport();
    this.geometry.finalizeImport();
    this.settings.finalizeImport(this.document, this.tab, this.styles.graphicHelper);
    this.pageSettings.finalizeImport(this.document, this.tab, this.styles);
    this.condFormats.finalizeImport(this.styles);
    this.views.finalizeImport(this.document, this.tab, this.workbookViews);
  }
  /** Native cell type dispatch and explicit OOXML formula grammar. @returns Nothing. */
  private commitCell(): void {
    const xf = this.styles.getCellXf(this.xfId);
    if (xf)
      this.sheetData.setCellFormat(this.address, xf.createPattern(this.styles, this.document));
    if (this.formula) {
      const formula = unicode("=" + this.formula);
      try {
        this.document.SetFormula(this.address, formula, FormulaGrammar.Grammar.GRAM_OOXML);
        if (this.sharedId !== -1)
          this.sharedFormulas.set(this.sharedId, new ScAddress(this.address));
      } finally {
        formula.dispose();
      }
    } else if (this.sharedId !== -1) {
      this.pendingFormulas.push({ id: this.sharedId, address: new ScAddress(this.address) });
    } else if (this.type === "inlineStr") {
      if (this.inlineString)
        this.sheetData.setRichStringCell(this.address, this.inlineString, xf?.getFont(this.styles));
    } else if ((this.type === "s" || this.type === "str") && this.value !== "") {
      const string = unicode(this.value);
      try {
        if (this.type === "s") {
          const shared = this.sharedStrings.getString(string.toInt32());
          if (shared)
            this.sheetData.setRichStringCell(this.address, shared, xf?.getFont(this.styles));
        } else this.sheetData.setStringCell(this.address, string);
      } finally {
        string.dispose();
      }
    } else if (this.value !== "") {
      switch (this.type) {
        case "d":
          this.sheetData.setDateCell(this.address, this.value);
          break;
        case "b": {
          const value = unicode(this.value);
          const literal = unicode("true");
          try {
            const number = toDouble(value.getStr().subarray(0, value.getLength()));
            this.sheetData.setBooleanCell(
              this.address,
              number !== 0 || value.equalsIgnoreAsciiCase(literal),
            );
          } finally {
            literal.dispose();
            value.dispose();
          }
          break;
        }
        case "e":
          this.sheetData.setErrorCell(this.address, this.value);
          break;
        default: {
          const value = Number(this.value);
          if (Number.isFinite(value)) this.document.SetValue(this.address, value);
        }
      }
    }
  }
}
