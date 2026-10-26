/** @fileoverview Bounded ScDocShell lifecycle,ODS filter and shared Sfx history ownership. Browser primary media use existing Sfx acknowledgement/generation contracts;native drawing/formatting services remain unported. */
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
} from "../../../../sal/inc/rtl/textenc";
import { OStringToOUString, OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import {
  rtl_getTextEncodingInfo,
  RTL_TEXTENCODING_INFO_ASCII,
  RTL_TEXTENCODING_INFO_CONTEXT,
  type rtl_TextEncodingInfo,
} from "../../../../sal/textenc/tencinfo";
import {
  acquireSfxMedium,
  type SfxMedium,
  type SfxMediumInput,
  type SfxMediumOperation,
  type SfxMediumOperationState,
} from "../../../../sfx2/source/doc/docfile";
import {
  createDocument,
  SfxObjectShell,
  type SfxObjectShellState,
} from "../../../../sfx2/source/doc/objsh";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import { SfxListener } from "../../../../svl/source/notify/lstner";
import { SfxUndoManager } from "../../../../svl/source/undo/undo";
import { SvStream } from "../../../../tools/source/stream/stream";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CellType, ScGlobal } from "../../../inc/global";
import { ATTR_HOR_JUSTIFY } from "../../../inc/scitems";
import { ScHorizontalCellIterator } from "../../core/data/dociter";
import { ScCellFormat } from "../../core/tool/cellform";
import {
  createInlineOdsFilterService,
  type OdsFilterService,
} from "../../filter/xml/ods-filter-service";
import { ODS_MIMETYPE, writeOdsDocument, type OdsImportOptions } from "../../filter/xml/xmlwrap";
import { ScAsciiOptions } from "../dbgui/asciiopt";
import { ScImportOptions } from "../dbgui/imoptdlg";
import { ScDocFunc } from "./docfunc";
import { ScImportExport } from "./impex";
/** Confirmed write belongs to the generation captured before persistence begins. */
export interface ScPrimarySaveEvidence {
  readonly generation: number;
}
/** Native Sfx listener with a browser external-store callback. */
class ShellSubscriber extends SfxListener {
  /** Retains the platform listener. @param listener - Invalidation. @returns Subscriber. */
  constructor(private readonly listener: () => void) {
    super();
  }
  /** Projects original shell hints without owning document state. @returns Nothing. */
  override Notify(): void {
    this.listener();
  }
}
/** Byte-sequence search corresponding to OString::indexOf after SAL conversion. @param value - Encoded text. @param needle - Encoded separator. @returns First byte offset. */
function indexOfBytes(value: Uint8Array, needle: Uint8Array): number {
  if (!needle.length) return 0;
  for (let start = 0; start + needle.length <= value.length; start++) {
    let match = true;
    for (let offset = 0; offset < needle.length; offset++)
      if (value[start + offset] !== needle[offset]) {
        match = false;
        break;
      }
    if (match) return start;
  }
  return -1;
}
/** OString::replaceAll for the already encoded CSV text delimiter. @param value - Encoded text. @param needle - Encoded delimiter. @returns Escaped encoded bytes. */
function doubleEncodedDelimiter(value: Uint8Array, needle: Uint8Array): Uint8Array {
  if (!needle.length || indexOfBytes(value, needle) < 0) return value;
  const bytes: number[] = [];
  for (let index = 0; index < value.length;) {
    let match = index + needle.length <= value.length;
    for (let offset = 0; match && offset < needle.length; offset++)
      match = value[index + offset] === needle[offset];
    if (match) {
      for (const byte of needle) bytes.push(byte);
      for (const byte of needle) bytes.push(byte);
      index += needle.length;
    } else bytes.push(value[index++] as number);
  }
  return Uint8Array.from(bytes);
}
/** Source getTextSepPos for OUString and OString. The delimiter position also controls escaping. @param value - Unicode or encoded field. @param quote - Matching text delimiter. @param separator - Matching field delimiter. @param quoteAll - Filter option. @returns Delimiter position and surrounding-quote decision. */
function getTextSepPos(
  value: string | Uint8Array,
  quote: string | Uint8Array,
  separator: string | Uint8Array,
  quoteAll: boolean,
): { position: number; needQuotes: boolean } {
  const position =
    typeof value === "string"
      ? value.indexOf(quote as string)
      : indexOfBytes(value, quote as Uint8Array);
  const separatorPosition =
    typeof value === "string"
      ? value.indexOf(separator as string)
      : indexOfBytes(value, separator as Uint8Array);
  const hasLineBreak =
    typeof value === "string"
      ? value.includes("\n") || value.includes("\r")
      : value.includes(10) || value.includes(13);
  return {
    position,
    needQuotes: quoteAll || position >= 0 || separatorPosition >= 0 || hasLineBreak,
  };
}
/** Real document shell with canonical model,medium and shared native action history. */
export class ScDocShell extends SfxObjectShell {
  private readonly docFunc = new ScDocFunc(this);
  /** Borrows the native document-function dispatcher. @returns Real owner. */
  GetDocFunc(): ScDocFunc {
    return this.docFunc;
  }
  static readonly ODS_MEDIA_TYPE = ODS_MIMETYPE;
  static readonly CSV_FILTER_NAME = "Text - txt - csv (StarCalc)";
  static readonly CSV_MEDIA_TYPE = "text/csv";
  private readonly undo = new SfxUndoManager<ScDocShell>();
  private openRequest = 0;
  /** Creates an untitled shell or adopts an existing model. @param document - Actual model. @param odsFilter - Asynchronous document filter. @returns Shell. */
  constructor(
    private document: ScDocument = new ScDocument(),
    private readonly odsFilter: OdsFilterService = createInlineOdsFilterService(),
  ) {
    super(
      createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "Untitled Calc Document" }),
      { kind: "untitled", name: "Untitled Calc Document" },
    );
    if (!document.GetTableCount()) document.InsertTab(0, unicode("Sheet1"));
  }
  /** Borrows the actual document. @returns Model. */
  GetDocument(): ScDocument {
    return this.document;
  }
  /** Borrows shared action history. @returns History. */
  GetUndoManager(): SfxUndoManager<ScDocShell> {
    return this.undo;
  }
  /** Adapts actual Sfx notification registrations to a browser subscriber. @param listener - Invalidation. @returns Cleanup. */
  Subscribe(listener: () => void): () => void {
    const subscriber = new ShellSubscriber(listener);
    subscriber.StartListening(this);
    return /** Ends reciprocal source registration. @returns Nothing. */ () => subscriber.Dispose();
  }
  /** Publishes changed shell state through the native broadcaster. @returns Nothing. */
  private Changed(): void {
    this.Broadcast(new SfxHint(SfxHintId.DocChanged));
  }
  /** Marks a committed model edit and advances the persistence race generation. @returns Nothing. */
  SetDocumentModified(): void {
    this.SetModified(true, true);
    this.Changed();
  }
  /** Updates the shell title without replacing its model. @param title - Name. @returns Whether changed. */
  Rename(title: string): boolean {
    const changed = this.SetTitle(title.trim());
    if (changed) this.Changed();
    return changed;
  }
  /** Applies source history and reconciles modified state. @returns Changed. */
  Undo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Undo(this);
    if (changed) {
      this.SetModified(!this.undo.IsAtSavePosition(), true);
      this.Changed();
    }
    return changed;
  }
  /** Reapplies source history. @returns Changed. */
  Redo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Redo(this);
    if (changed) {
      this.SetModified(!this.undo.IsAtSavePosition(), true);
      this.Changed();
    }
    return changed;
  }
  /** Releases semantic subscriptions owned by one displaced model. @param document - Model. @returns Nothing. */
  private DisposeDocument(document: ScDocument): void {
    document.Dispose();
  }
  /** Atomically installs model,state,medium and a fresh history. @param document - New graph. @param state - Lifecycle. @param medium - Source/destination. @returns Installed model. */
  ReplaceDocument(
    document: ScDocument,
    state: SfxObjectShellState,
    medium: SfxMediumInput | SfxMedium,
  ): ScDocument {
    this.EnsureOpen();
    if (document === this.document)
      throw new Error("Replacement document must be a new Calc graph.");
    const replacement = this.PrepareObjectStateReplacement(state, medium);
    if (!document.GetTableCount()) document.InsertTab(0, unicode("Sheet1"));
    this.openRequest++;
    const previous = this.document;
    this.document = document;
    this.CommitObjectStateReplacement(replacement);
    this.undo.Clear();
    if (state.isModified) this.undo.ClearSavePosition();
    else this.undo.SetSavePosition();
    this.DisposeDocument(previous);
    this.Changed();
    return document;
  }
  /** Reads a separate ODS candidate and installs it only if the request/model generation remains current. @param bytes - Package. @param metadata - Browser identity. @param medium - Open route. @param options - Filter controls. @returns Installed model. */
  async Open(
    bytes: Uint8Array | XmlPackage,
    metadata: SfxObjectShellState,
    medium?: SfxMediumInput,
    options: OdsImportOptions = {},
  ): Promise<ScDocument> {
    this.EnsureOpen();
    const request = ++this.openRequest,
      generation = this.GetContentGeneration(),
      current = this.document;
    let candidate: ScDocument | undefined;
    let updatedFilterOptions: string | undefined;
    try {
      if (medium?.filterId === ScDocShell.CSV_FILTER_NAME) {
        if (!ArrayBuffer.isView(bytes)) throw new Error("CSV input requires a byte stream.");
        candidate = new ScDocument();
        candidate.InsertTab(0, unicode("Sheet1"));
        const stream = new SvStream(bytes, RTL_TEXTENCODING_DONTKNOW);
        const options = new ScAsciiOptions();
        if (medium.filterOptions) options.ReadFromString(medium.filterOptions, stream);
        else {
          options.eCharSet = RTL_TEXTENCODING_UTF8;
          options.aFieldSeps = ",";
          options.cTextSep = '"';
        }
        const converter = new ScImportExport(candidate);
        converter.SetExtOptions(options);
        stream.SetStreamEncoding(options.eCharSet);
        stream.Seek(0);
        if (!converter.ImportStream(stream)) throw new Error("CSV import failed.");
        if (medium.name) {
          // INetURLObject::getBase scans the last segment up to ';' and ignores its leading dot.
          const segmentEnd =
            medium.name.indexOf(";") < 0 ? medium.name.length : medium.name.indexOf(";");
          let baseEnd = segmentEnd;
          for (let index = 1; index < segmentEnd; index++) {
            if (medium.name[index] === ".") baseEnd = index;
          }
          const base = medium.name.slice(0, baseEnd),
            sheetName = unicode(base);
          try {
            candidate.RenameTab(0, sheetName, true);
          } finally {
            sheetName.dispose();
          }
        }
        if (converter.GetIncludeBOM()) {
          options.bIncludeBOM = true;
          updatedFilterOptions = options.WriteToString();
        }
      } else
        candidate = await this.odsFilter.Import(bytes, {
          ...options,
          isCancelled: /** Cancels stale source work. @returns Cancelled. */ () =>
            request !== this.openRequest ||
            generation !== this.GetContentGeneration() ||
            current !== this.document ||
            options.isCancelled?.() === true,
        });
      this.EnsureOpen();
      if (request !== this.openRequest || generation !== this.GetContentGeneration())
        throw new Error("Document open result is stale.");
      const input = acquireSfxMedium(
        (medium && updatedFilterOptions !== undefined
          ? { ...medium, filterOptions: updatedFilterOptions }
          : medium) ?? {
          kind: "input",
          name: metadata.title,
          filterId: "calc8",
          mediaType: ODS_MIMETYPE,
          source: { kind: "external", reference: bytes },
        },
      );
      input.SetOperation("open", "succeeded", metadata.contentGeneration);
      return this.ReplaceDocument(
        candidate,
        { ...metadata, isModified: false, lifecycle: "saved" },
        input,
      );
    } catch (error) {
      if (candidate) this.DisposeDocument(candidate);
      throw error;
    }
  }
  /** Serializes the current sheet using the CSV filter's ScImportOptions and AsciiSave branches. @param filterOptions - Native filter string, if supplied. @param tab - Active sheet. @returns Encoded CSV. */
  AsciiSave(filterOptions?: string | ScImportOptions, tab = 0): Uint8Array {
    this.EnsureOpen();
    const options =
      filterOptions instanceof ScImportOptions
        ? filterOptions
        : new ScImportOptions(filterOptions || undefined);
    const stream = new SvStream(new Uint8Array(), options.eCharSet);
    const write = /** Implements write. @param value - Value. @returns Nothing. */ (
      value: string | Uint8Array,
    ): void => {
      if (typeof value === "string") stream.WriteUnicodeOrByteText(value, options.eCharSet);
      else stream.WriteBytes(value);
    };
    const writeChar = /** Implements write Char. @param value - Value. @returns Nothing. */ (
      value: string,
    ): void => {
      stream.WriteUniOrByteChar(value.charCodeAt(0));
    };
    if (options.eCharSet === RTL_TEXTENCODING_UNICODE) stream.StartWritingUnicodeText();
    else if (options.bIncludeBOM && options.eCharSet === RTL_TEXTENCODING_UTF8)
      stream.WriteUChar(0xef).WriteUChar(0xbb).WriteUChar(0xbf);
    const encodingInfo: rtl_TextEncodingInfo = {
      StructSize: 12,
      MinimumCharSize: 0,
      MaximumCharSize: 0,
      AverageCharSize: 0,
      Flags: 0,
    };
    const hasEncodingInfo = rtl_getTextEncodingInfo(options.eCharSet, encodingInfo);
    const contextOrNotAscii =
      hasEncodingInfo &&
      ((encodingInfo.Flags & RTL_TEXTENCODING_INFO_CONTEXT) !== 0 ||
        (encodingInfo.Flags & RTL_TEXTENCODING_INFO_ASCII) === 0);
    const separator = options.nFieldSepCode.charCodeAt(0) ? options.nFieldSepCode : "",
      quote = options.nTextSepCode.charCodeAt(0) ? options.nTextSepCode : "",
      encodedSeparator = OUStringToOString(separator || "\0", options.eCharSet),
      encodedQuote = OUStringToOString(quote || "\0", options.eCharSet),
      decodedSeparator = contextOrNotAscii
        ? OStringToOUString(encodedSeparator, options.eCharSet)
        : "",
      decodedQuote = contextOrNotAscii ? OStringToOUString(encodedQuote, options.eCharSet) : "";
    /** Formats a numeric/text scalar through the current native number formatter. @param cell - Actual cell. @param col - Column. @param row - Row. @returns Shown content and text-format flag. */
    const shown =
      /** Implements shown. @param cell - Cell. @param col - Col. @param row - Row. @returns The computed result. */ (
        cell: ReturnType<ScDocument["GetRefCellValue"]>,
        col: number,
        row: number,
      ) => {
        const context = this.document.GetNonThreadedContext();
        const format =
          this.document.GetPattern(new ScAddress(col, row, tab))?.GetNumberFormat(context) ?? 0;
        const color: [null] = [null];
        const output = ScCellFormat.GetString(cell, format, color, context, this.document);
        try {
          return { value: text(output), isString: context.NFIsTextFormat(format) };
        } finally {
          output.dispose();
        }
      };
    /** Original numeric CSV path uses ScCellFormat::GetInputString with the cell's format. @param cell - Actual cell. @param col - Column. @param row - Row. @returns Input-line text. */
    const inputString =
      /** Implements input String. @param cell - Cell. @param col - Col. @param row - Row. @returns The computed result. */ (
        cell: ReturnType<ScDocument["GetRefCellValue"]>,
        col: number,
        row: number,
      ) => {
        const context = this.document.GetNonThreadedContext(),
          format =
            this.document.GetPattern(new ScAddress(col, row, tab))?.GetNumberFormat(context) ?? 0,
          output = ScCellFormat.GetInputString(cell, format, context, this.document);
        try {
          return text(output);
        } finally {
          output.dispose();
        }
      };
    /** Native Xcl-like width conversion and alignment for fixed-width text. @param value - Cell text. @param isString - Text type. @param col - Sheet column. @param row - Sheet row. @returns Padded field. */
    const fixedWidth =
      /** Implements fixed Width. @param value - Value. @param isString - Is String. @param col - Col. @param row - Row. @returns The string result. */ (
        value: string,
        isString: boolean,
        col: number,
        row: number,
      ): string => {
        let width = this.document.GetColWidth(col, tab);
        width *= 1328 / 25;
        width += 90;
        width *= 1 / 23;
        width /= 256;
        width = Math.trunc(width);
        if (value.length > width) value = (isString ? value : "###").slice(0, width);
        if (value.length === width) return value;
        let align = (
          this.document.GetPattern(new ScAddress(col, row, tab))?.GetItem(ATTR_HOR_JUSTIFY) as
            SvxHorJustifyItem | undefined
        )?.GetValue();
        if (!isString && (align === undefined || align === SvxCellHorJustify.Standard))
          align = SvxCellHorJustify.Right;
        const padding = width - value.length;
        if (align === SvxCellHorJustify.Right) return " ".repeat(padding) + value;
        if (align === SvxCellHorJustify.Center) {
          const left = Math.trunc(padding / 2);
          return " ".repeat(left) + value + " ".repeat(padding - left);
        }
        return value + " ".repeat(padding);
      };
    /** Source Unicode, contextual-byte and ordinary-byte text-delimiter branches. @param value - Unicode cell text. @param stringCell - Source bString state. @param forceQuotes - Source bForceQuotes state. @returns Nothing. */
    const writeField =
      /** Implements write Field. @param value - Value. @param stringCell - String Cell. @param forceQuotes - Force Quotes. @returns Nothing. */ (
        value: string,
        stringCell: boolean,
        forceQuotes: boolean,
      ): void => {
        let isString = stringCell || forceQuotes;
        if (!isString && quote && value) {
          isString =
            value[0] === quote || value[0] === " " || value.endsWith(" ") || value.includes(quote);
          if (!isString && separator) isString = value.includes(separator);
        }
        if (!isString || !quote) {
          write(value);
          return;
        }
        if (options.eCharSet === RTL_TEXTENCODING_UNICODE) {
          const { position, needQuotes } = getTextSepPos(
            value,
            quote,
            separator || "\0",
            options.bQuoteAllText,
          );
          const escaped = position >= 0 ? value.replaceAll(quote, quote + quote) : value;
          if (needQuotes || forceQuotes) writeChar(quote);
          write(escaped);
          if (needQuotes || forceQuotes) writeChar(quote);
        } else if (contextOrNotAscii) {
          const decoded = OStringToOUString(
            OUStringToOString(value, options.eCharSet),
            options.eCharSet,
          );
          const { position, needQuotes } = getTextSepPos(
            decoded,
            decodedQuote,
            decodedSeparator,
            options.bQuoteAllText,
          );
          const escaped =
            position >= 0 ? decoded.replaceAll(decodedQuote, decodedQuote + decodedQuote) : decoded;
          if (needQuotes || forceQuotes) writeChar(quote);
          write(escaped);
          if (needQuotes || forceQuotes) writeChar(quote);
        } else {
          const encoded = OUStringToOString(value, options.eCharSet);
          const { position, needQuotes } = getTextSepPos(
            encoded,
            encodedQuote,
            encodedSeparator,
            options.bQuoteAllText,
          );
          const escaped = position >= 0 ? doubleEncodedDelimiter(encoded, encodedQuote) : encoded;
          if (needQuotes || forceQuotes) write(encodedQuote);
          write(escaped);
          if (needQuotes || forceQuotes) write(encodedQuote);
        }
      };
    if (tab < 0 || tab >= this.document.GetTableCount())
      throw new RangeError("CSV sheet is unavailable.");
    const endCol: [number] = [0],
      endRow: [number] = [0];
    this.document.GetCellArea(tab, endCol, endRow);
    let startRow = 0;
    const first = this.document.GetRefCellValue(new ScAddress(0, 0, tab));
    const firstRowIterator = new ScHorizontalCellIterator(this.document, tab, 0, 0, endCol[0], 0);
    const firstCol: [number] = [0],
      firstRow: [number] = [0];
    firstRowIterator.GetNext(firstCol, firstRow);
    const onlyFirstCell =
      firstCol[0] === 0 && firstRowIterator.GetNext(firstCol, firstRow) === null;
    if (
      separator &&
      !options.bFixedWidth &&
      first.getType() === CellType.CELLTYPE_STRING &&
      onlyFirstCell
    ) {
      const firstText = first.getSharedString();
      const literal = firstText ? text(firstText.getString()) : "";
      if (
        literal.length <= 5 &&
        (literal.charCodeAt(0) === 115 || literal.charCodeAt(0) === 83) &&
        (literal.charCodeAt(1) === 101 || literal.charCodeAt(1) === 69) &&
        (literal.charCodeAt(2) === 112 || literal.charCodeAt(2) === 80) &&
        literal.charCodeAt(3) === 61
      ) {
        const value = `sep=${options.nFieldSepCode}`;
        if (quote) writeChar('"');
        write(value);
        if (quote) writeChar('"');
        writeChar("\n");
        startRow = 1;
      }
    }
    const iterator = new ScHorizontalCellIterator(
      this.document,
      tab,
      0,
      startRow,
      endCol[0],
      endRow[0],
    );
    const col: [number] = [0],
      row: [number] = [0];
    let nextCol = 0,
      nextRow = startRow;
    /** Writes one source empty-column slot; the last slot is supplied by the cell or row terminator. @param emptyCol - Column. @returns Nothing. */
    const writeEmptyColumn =
      /** Implements write Empty Column. @param emptyCol - Empty Col. @returns Nothing. */ (
        emptyCol: number,
      ): void => {
        if (options.bFixedWidth) write(fixedWidth("", true, emptyCol, row[0]));
        else if (separator) writeChar(separator);
      };
    for (let cell = iterator.GetNext(col, row); cell; cell = iterator.GetNext(col, row)) {
      if (nextRow < row[0]) {
        for (let emptyCol = nextCol; emptyCol < endCol[0]; emptyCol++) writeEmptyColumn(emptyCol);
        writeChar("\n");
        nextRow++;
        for (let emptyRow = nextRow; emptyRow < row[0]; emptyRow++) {
          for (let emptyCol = 0; emptyCol < endCol[0]; emptyCol++) writeEmptyColumn(emptyCol);
          writeChar("\n");
        }
        for (let emptyCol = 0; emptyCol < col[0]; emptyCol++) writeEmptyColumn(emptyCol);
        nextRow = row[0];
      } else if (nextCol < col[0]) {
        for (let emptyCol = nextCol; emptyCol < col[0]; emptyCol++) writeEmptyColumn(emptyCol);
      }
      if (col[0] === endCol[0]) {
        nextCol = 0;
        nextRow = row[0] + 1;
      } else nextCol = col[0] + 1;
      let value = "",
        isString = false,
        forceQuotes = false;
      const currentCol = col[0],
        currentRow = row[0];
      switch (cell.getType()) {
        case CellType.CELLTYPE_VALUE:
          if (options.bFixedWidth || options.bSaveAsShown) {
            const result = shown(cell, currentCol, currentRow);
            value = result.value;
            isString = options.bSaveAsShown && result.isString;
          } else {
            value = inputString(cell, currentCol, currentRow);
            forceQuotes = !options.bSaveNumberAsSuch;
          }
          break;
        case CellType.CELLTYPE_FORMULA: {
          const formula = cell.getFormula();
          if (formula) {
            if (options.bSaveFormulas) {
              const result = formula.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE);
              try {
                value = text(result);
              } finally {
                result.dispose();
              }
              isString = true;
            } else if (formula.GetErrCode() !== FormulaError.NONE) {
              const error = ScGlobal.GetErrorString(formula.GetErrCode());
              try {
                value = text(error);
              } finally {
                error.dispose();
              }
              isString = true;
            } else if (formula.IsValue()) {
              if (options.bFixedWidth || options.bSaveAsShown) {
                const result = shown(cell, currentCol, currentRow);
                value = result.value;
                isString = options.bSaveAsShown && result.isString;
              } else {
                value = inputString(cell, currentCol, currentRow);
                forceQuotes = !options.bSaveNumberAsSuch;
              }
            } else {
              value = options.bSaveAsShown
                ? shown(cell, currentCol, currentRow).value
                : text(formula.GetString().getString());
              isString = true;
            }
          }
          break;
        }
        case CellType.CELLTYPE_STRING: {
          const shared = cell.getSharedString();
          value = options.bSaveAsShown
            ? shown(cell, currentCol, currentRow).value
            : shared
              ? text(shared.getString())
              : "";
          isString = true;
          break;
        }
        case CellType.CELLTYPE_EDIT: {
          const edit = cell.getEditText();
          if (edit) {
            const contents = edit.GetText();
            try {
              value = text(contents);
            } finally {
              contents.dispose();
            }
          }
          isString = true;
          break;
        }
        default:
          break;
      }
      if (options.bFixedWidth) write(fixedWidth(value, isString, currentCol, currentRow));
      else writeField(value, isString, forceQuotes);
      if (currentCol < endCol[0]) {
        if (separator) writeChar(separator);
      } else writeChar("\n");
    }
    if (nextRow <= endRow[0]) {
      for (let emptyCol = nextCol; emptyCol < endCol[0]; emptyCol++) writeEmptyColumn(emptyCol);
      writeChar("\n");
      nextRow++;
    }
    for (let emptyRow = nextRow; emptyRow <= endRow[0]; emptyRow++) {
      for (let emptyCol = 0; emptyCol < endCol[0]; emptyCol++) writeEmptyColumn(emptyCol);
      writeChar("\n");
    }
    return stream.GetData();
  }
  /** ScDocShell::ConvertTo CSV sheet selection before AsciiSave; the caller supplies the browser destination for each source stream. @param filterOptions - Native filter string. @param saveTab - Current sheet for the zero selector. @returns Source-order sheet streams and names for separate files. */
  ConvertToCsv(
    filterOptions?: string,
    saveTab = 0,
  ): ReadonlyArray<{ readonly sheetName: string | null; readonly bytes: Uint8Array }> {
    this.EnsureOpen();
    const options = new ScImportOptions(filterOptions || undefined),
      requested = options.nSheetToExport,
      count = this.document.GetTableCount();
    if (requested === 0) return [{ sheetName: null, bytes: this.AsciiSave(options, saveTab) }];
    const start = requested === -1 ? 0 : requested - 1,
      end = requested === -1 ? count : requested;
    if (start < 0 || end > count || start >= end) throw new RangeError("Invalid CSV sheet number.");
    const streams: { sheetName: string; bytes: Uint8Array }[] = [];
    for (let tab = start; tab < end; tab++) {
      const name = unicode("");
      try {
        streams.push({
          sheetName: this.document.GetName(tab, name) ? text(name) : String(tab),
          bytes: this.AsciiSave(options, tab),
        });
      } finally {
        name.dispose();
      }
    }
    return streams;
  }
  /** Serializes committed actual cells through the existing ODS wrapper. @returns ODS package. */
  SerializeOds(): Uint8Array {
    this.EnsureOpen();
    return writeOdsDocument(this.document);
  }
  /** Serializes browser XML through the injected asynchronous filter. @returns XML streams. */
  SerializeXml(): Promise<XmlPackage> {
    this.EnsureOpen();
    const generation = this.GetContentGeneration(),
      document = this.document;
    return this.odsFilter.Export(
      document,
      true,
      /** Rejects graph capture after the live document generation changes.  @returns Operation result. */ () =>
        generation === this.GetContentGeneration() && document === this.document,
    );
  }
  /** Serializes an external ODS through the browser worker. @returns ODS bytes. */
  SerializeOdsAsync(): Promise<Uint8Array> {
    this.EnsureOpen();
    const generation = this.GetContentGeneration(),
      document = this.document;
    return this.odsFilter.Export(
      document,
      false,
      /** Rejects graph capture after the live document generation changes.  @returns Operation result. */ () =>
        generation === this.GetContentGeneration() && document === this.document,
    );
  }
  /** Saves to the current confirmed primary destination. @param persist - Confirmed adapter. @returns Completion. */
  Save(
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
  ): Promise<void> {
    this.EnsureOpen();
    if (
      this.medium.readOnly ||
      !this.medium.capabilities.canWrite ||
      !this.medium.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("The current medium requires Save As."));
    return this.PerformPrimarySave("save", this.medium, persist, false);
  }
  /** Saves a primary copy and adopts it only after confirmed persistence. @param medium - New primary. @param persist - Confirmed adapter. @returns Completion. */
  SaveAs(
    medium: SfxMediumInput,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
  ): Promise<void> {
    this.EnsureOpen();
    const candidate = acquireSfxMedium(medium);
    if (
      candidate.readOnly ||
      !candidate.capabilities.canWrite ||
      !candidate.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("Save As requires a confirmed writable medium."));
    return this.PerformPrimarySave("save-as", candidate, persist, true);
  }
  /** Preserves source model/history/medium identities across asynchronous browser writes. @param operation - Kind. @param candidate - Destination. @param persist - Confirmed adapter. @param replace - Adopt destination. @returns Completion. */
  private async PerformPrimarySave(
    operation: "save" | "save-as",
    candidate: SfxMedium,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
    replace: boolean,
  ): Promise<void> {
    const document = this.document,
      previous = this.medium,
      generation = this.GetContentGeneration(),
      position = this.undo.CaptureSavePosition();
    candidate.SetOperation(operation, "pending", generation);
    this.Changed();
    try {
      const evidence = await persist(document, candidate);
      this.EnsureOpen();
      if (evidence.generation !== generation)
        throw new Error("Primary save evidence does not match the requested generation.");
      if (this.document !== document || this.medium !== previous)
        throw new Error("Primary save completed for a document that is no longer active.");
      if (replace)
        this.AdoptPrimaryIdentity(
          (candidate.destination as { key: string }).key,
          candidate.name,
          candidate,
        );
      this.SaveCompleted(generation);
      this.undo.SetSavePosition(position);
      candidate.SetOperation(operation, "succeeded", generation);
      this.Changed();
    } catch (error) {
      if (replace) candidate.Close();
      if (
        this.document === document &&
        this.GetDocumentState().lifecycle !== "closed" &&
        this.medium === previous
      )
        this.SetMediumOperation(
          operation,
          "failed",
          generation,
          error instanceof Error ? error.message : String(error),
        );
      throw error;
    }
  }
  /** Exports an external representation without adopting its medium or acknowledging primary save. @param medium - Export destination. @param persist - Suite platform adapter. @returns Completion. */
  async Export(
    medium: SfxMediumInput,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<void> | void,
  ): Promise<void> {
    this.EnsureOpen();
    const generation = this.GetContentGeneration(),
      destination = acquireSfxMedium(medium);
    destination.SetOperation("export", "pending", generation);
    try {
      await persist(this.document, destination);
      destination.SetOperation("export", "succeeded", generation);
    } catch (error) {
      destination.SetOperation(
        "export",
        "failed",
        generation,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
  /** Retains browser operation feedback on the actual medium. @param operation - Kind. @param state - Outcome. @param generation - Captured content generation. @param message - Error detail. @returns Nothing. */
  SetMediumOperation(
    operation: SfxMediumOperation,
    state: SfxMediumOperationState,
    generation: number,
    message?: string,
  ): void {
    this.medium.SetOperation(operation, state, generation, message);
    this.Changed();
  }
  /** Ends pending imports,formula registrations and native broadcaster/history resources once. @returns Nothing. */
  Close(): void {
    this.odsFilter.Close();
    if (!this.CloseObjectShell()) return;
    this.openRequest++;
    this.DisposeDocument(this.document);
    this.undo.Clear();
    this.Dispose();
  }
}
