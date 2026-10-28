/** @fileoverview CSV stream conversion owner from sc/source/ui/docshell/impex.cxx. */
import { UEastAsianWidth, UProperty } from "../../../../external/icu/source/common/unicode/uchar";
import { u_getIntPropertyValue } from "../../../../external/icu/source/common/uprops";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import { convertLanguageToLocale } from "../../../../i18nlangtag/source/isolang/mslangid";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import { TransliterationWrapper } from "../../../../unotools/source/i18n/transliterationwrapper";
import { CalendarWrapper } from "../../../../unotools/source/i18n/calendarwrapper";
import { PutDate } from "./impex.date";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { SvStream } from "../../../../tools/source/stream/stream";
import { MAXCOLCOUNT, ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { ScSetStringParam, ScStringUtil } from "../../../inc/stringutil";
import {
  SC_COL_STANDARD,
  SC_COL_SKIP,
  SC_COL_TEXT,
  SC_COL_ENGLISH,
  ScAsciiOptions,
} from "../dbgui/asciiopt";

/** One logical CSV field, including the native quoted-field signal. */
interface CsvField {
  readonly value: string;
  readonly quoted: boolean;
}

const nArbitraryCellLengthLimit = 0xffff;
const nArbitraryLineLengthLimit = 2 * MAXCOLCOUNT * nArbitraryCellLengthLimit;

/** The source QuoteType values used by ReadCsvLine. */
enum QuoteType {
  FIELDSTART_QUOTE,
  FIRST_QUOTE,
  SECOND_QUOTE,
  FIELDEND_QUOTE,
  DONTKNOW_QUOTE,
}

/** Original lcl_isFieldEndQuote with the source ordered separator detection. @param line - Current logical line. @param index - Quote offset. @param seps - Field separators. @param detect - Zero permits detection; 0xffff disables it. @returns Native state. */
function fieldEndQuote(
  line: string,
  index: number,
  seps: string,
  detect: [number] = [0xffff],
): QuoteType {
  if (line[index + 1] === " " && seps.includes(" ")) return QuoteType.FIELDEND_QUOTE;
  const blankSeparator =
    line[index + 1] === " " &&
    detect[0] === 0 &&
    index + 2 < line.length &&
    line[index + 2] !== "\0" &&
    line[index + 2] !== " ";
  while (line[index + 1] === " ") index++;
  const following = line[index + 1];
  if (following === undefined || following === "\0" || seps.includes(following))
    return QuoteType.FIELDEND_QUOTE;
  if (detect[0] === 0) {
    for (const separator of [",", "\t", ";"]) {
      if (following === separator) {
        detect[0] = separator.charCodeAt(0);
        return QuoteType.FIELDEND_QUOTE;
      }
    }
  }
  if (blankSeparator) {
    detect[0] = 32;
    return QuoteType.FIELDEND_QUOTE;
  }
  return QuoteType.DONTKNOW_QUOTE;
}

/** Source ReadCsvLine: quote state, optional separator retry, preview line limit and unmatched-quote rewind. @param stream - Source byte stream. @param embeddedLineBreak - Whether to join quoted source lines. @param separators - Mutable native separator list. @param quote - Text delimiter. @param detect - Zero enables one separator retry; 0xffff disables detection. @param maxSourceLines - Preview source-line limit; zero is unlimited. @returns One logical line. */
export function ReadCsvLine(
  stream: SvStream,
  embeddedLineBreak: boolean,
  separators: [string],
  quote: string,
  detect: [number],
  maxSourceLines = 0,
): string {
  let allowRetry = embeddedLineBreak && detect[0] === 0;
  const initialPosition = allowRetry ? stream.Tell() : 0;
  maxSourceLines >>>= 0;
  for (;;) {
    let line = stream.ReadUniOrByteStringLine(nArbitraryLineLengthLimit);
    if (!embeddedLineBreak) return line;
    let firstLength = line.length,
      firstPosition = stream.Tell(),
      lineCount = 0,
      lastOffset = 0,
      quotes = 0,
      fieldStart = true,
      state = QuoteType.FIELDEND_QUOTE,
      retry = false;
    const seps = separators[0];
    while (!stream.eof() && line.length < nArbitraryLineLengthLimit) {
      for (let i = lastOffset; i < line.length; i++) {
        const char = line[i] as string;
        if (char === "\0") continue;
        if (char === quote && quote !== "\0") {
          if (quotes) {
            if (fieldStart) {
              quotes++;
              fieldStart = false;
              state = QuoteType.FIELDSTART_QUOTE;
              firstLength = line.length;
              firstPosition = stream.Tell();
            } else if (state !== QuoteType.FIELDEND_QUOTE) {
              state =
                quotes % 2 === 0
                  ? line[i - 1] === quote
                    ? QuoteType.SECOND_QUOTE
                    : QuoteType.FIELDSTART_QUOTE
                  : line[i + 1] === quote
                    ? QuoteType.FIRST_QUOTE
                    : fieldEndQuote(line, i, seps, detect);
              if (allowRetry && detect[0] !== 0) {
                separators[0] += String.fromCharCode(detect[0]);
                retry = true;
                break;
              }
              if (state !== QuoteType.DONTKNOW_QUOTE) quotes++;
            }
          } else if (fieldStart) {
            quotes = 1;
            state = QuoteType.FIELDSTART_QUOTE;
            fieldStart = false;
            firstLength = line.length;
            firstPosition = stream.Tell();
          }
        } else if (state === QuoteType.FIELDEND_QUOTE) {
          fieldStart = fieldStart ? char === " " || seps.includes(char) : seps.includes(char);
        }
      }
      if (retry) break;
      if (quotes % 2 === 0 || state === QuoteType.DONTKNOW_QUOTE) break;
      if (++lineCount >= maxSourceLines && maxSourceLines > 0) break;
      lastOffset = line.length;
      const next = stream.ReadUniOrByteStringLine(nArbitraryLineLengthLimit);
      if (!stream.eof()) line += "\n" + next;
    }
    if (retry) {
      allowRetry = false;
      stream.Seek(initialPosition);
      continue;
    }
    if (quotes % 2 !== 0) {
      line = line.slice(0, firstLength);
      stream.Seek(firstPosition);
    }
    return line;
  }
}

/** Source lcl_appendLineData's UTF-16 cell limit.  @param field - Field. @param data - Data. @param overflowCell - Overflow Cell. @returns The string result. */
function appendLineData(field: string, data: string, overflowCell: [boolean]): string {
  const available = nArbitraryCellLengthLimit - field.length;
  if (data.length > available) overflowCell[0] = true;
  return field + data.slice(0, available);
}

/** Scans lcl_ScanString in DoubledQuoteMode::ESCAPE. @param record - Logical line. @param start - Opening quote position. @param seps - Field separators. @param quote - Quote. @param overflowCell - Source cell-overflow output. @returns Content and next offset, or the original offset on an unmatched quote. */
function scanQuotedString(
  record: string,
  start: number,
  seps: string,
  quote: string,
  overflowCell: [boolean],
): { value: string; next: number } {
  let value = "";
  let next = start + 1;
  let more: boolean;
  do {
    more = false;
    const segmentStart = next;
    for (;;) {
      if (next === record.length) return { value: "", next: start };
      if (record[next] !== quote) {
        next++;
        continue;
      }
      next++;
      if (record[next] !== quote) {
        if (fieldEndQuote(record, next - 1, seps) === QuoteType.FIELDEND_QUOTE) break;
        continue;
      }
      next++;
      more = true;
      break;
    }
    if (segmentStart < next)
      value = appendLineData(value, record.slice(segmentStart, next - 1), overflowCell);
  } while (more);
  return { value, next };
}

/** Implements the consumed scalar branches of source lcl_PutString. @param document - Actual document. @param pos - Cell. @param field - Parsed field. @param format - Column format. @param options - Filter options. @returns Nothing. @param formatter - Actual import formatter. @param transliteration - Primary wrapper. @param calendar - Primary calendar. @param secondTransliteration - Optional second wrapper. @param secondCalendar - Optional second calendar. */
function lcl_PutString(
  docImport: ScDocumentImport,
  pos: ScAddress,
  field: CsvField,
  format: number,
  options: ScAsciiOptions,
  formatter: SvNumberFormatter,
  transliteration: TransliterationWrapper,
  calendar: CalendarWrapper,
  secondTransliteration: TransliterationWrapper | null,
  secondCalendar: CalendarWrapper | null,
): void {
  const document = docImport.getDoc();
  const value = field.value;
  if (!value) {
    if (!options.bSkipEmptyCells) {
      const empty = unicode(value);
      try {
        docImport.setAutoInput(pos, empty);
      } finally {
        empty.dispose();
      }
    }
    return;
  }
  const literal = format === SC_COL_TEXT || (!options.bEvaluateFormulas && value.startsWith("="));
  if (literal) {
    const string = unicode(value);
    try {
      const documentFormatter = document.GetFormatTable(),
        key: [number] = [0],
        dummy: [number] = [0];
      if (
        (!options.bEvaluateFormulas && value.startsWith("=")) ||
        documentFormatter.IsNumberFormat(string, key, dummy)
      ) {
        const textFormat = documentFormatter.GetStandardFormat(SvNumFormatType.TEXT),
          pattern = new ScPatternAttr(document.getCellAttributeHelper()),
          item = new SfxUInt32Item(ATTR_VALUE_FORMAT, textFormat);
        try {
          pattern.ItemSetPut(item);
          document.ApplyPattern(pos.Col(), pos.Row(), pos.Tab(), pattern);
        } finally {
          item.Dispose();
          pattern.Dispose();
        }
      }
      if (ScStringUtil.isMultiline(string)) {
        document.SetTextCell(pos, string);
        docImport.invalidateBlockPositionSet(pos.Tab());
      } else docImport.setStringCell(pos, string);
    } finally {
      string.dispose();
    }
    return;
  }
  if (format === SC_COL_ENGLISH) {
    const documentFormatter = document.GetFormatTable(),
      key: [number] = [documentFormatter.GetStandardIndex(LANGUAGE_ENGLISH_US)],
      numeric: [number] = [0],
      input = unicode(value);
    try {
      if (documentFormatter.IsNumberFormat(input, key, numeric)) {
        docImport.setNumericCell(pos, numeric[0]);
        return;
      }
    } finally {
      input.dispose();
    }
  } else if (format !== SC_COL_STANDARD) {
    const input = unicode(value);
    try {
      if (
        PutDate(
          docImport,
          pos,
          input,
          format,
          formatter,
          transliteration,
          calendar,
          secondTransliteration,
          secondCalendar,
        )
      )
        return;
    } finally {
      input.dispose();
    }
  }
  if (value.includes("\n")) {
    const string = unicode(value);
    try {
      document.SetTextCell(pos, string);
      docImport.invalidateBlockPositionSet(pos.Tab());
    } finally {
      string.dispose();
    }
    return;
  }
  const input = unicode(value);
  try {
    if (!options.bDetectSpecialNumber && format === SC_COL_STANDARD) {
      do {
        if (input.getLength() < 10) break;
        const first = input.indexOf(45, 1);
        if (first < 4) break;
        const second = input.indexOf(45, first + 1);
        if (second < 7 || first + 3 < second) break;
        const datetime = new UnoDateTime();
        if (!Converter.parseDateTime(datetime, value)) break;
        const documentFormatter = document.GetFormatTable(),
          key: [number] = [0],
          numeric: [number] = [0];
        if (
          documentFormatter.IsNumberFormat(input, key, numeric) &&
          documentFormatter.GetType(key[0]) & SvNumFormatType.DATE
        ) {
          docImport.setNumericCell(pos, numeric[0]);
          document.SetNumberFormat(pos, key[0]);
          return;
        }
      } while (false); // eslint-disable-line no-constant-condition -- Preserve original source single-pass block and break paths.
    }
    const parameter = new ScSetStringParam();
    parameter.mpNumFormatter = formatter;
    parameter.mbDetectNumberFormat = options.bDetectSpecialNumber;
    parameter.mbDetectScientificNumberFormat = options.bDetectScientificNumber;
    parameter.meSetTextNumFormat = ScSetStringParam.SpecialNumberOnly;
    parameter.mbHandleApostrophe = false;
    parameter.mbCheckLinkFormula = true;
    docImport.setAutoInput(pos, input, parameter);
  } finally {
    input.dispose();
  }
}

/** Native document text converter; input cells are written only through ScDocument. */
export class ScImportExport {
  private options: ScAsciiOptions | undefined;
  private overflowRow = false;
  private overflowCol = false;
  private overflowCell = false;
  private includeBOM = false;
  /** Binds the canonical destination document. @param document - Actual model.  @returns Constructed instance. */
  constructor(private readonly document: ScDocument) {}
  /** Source ScanNextFieldFromString over a UTF-16 cursor: quoted content, dirty suffix, ASCII-space trimming, and merged separators. @param line - Null-treated logical line. @param start - Current pointer offset. @param quote - Text separator. @param separators - Field separators. @param merge - Merge consecutive separators. @param removeSpace - Trim unquoted ASCII blanks. @param overflowCell - Native cell-overflow output. @returns Field and pointer past its separator. */
  static ScanNextFieldFromString(
    line: string,
    start: number,
    quote: string,
    separators: string,
    merge: boolean,
    removeSpace: boolean,
    overflowCell: [boolean],
  ): { field: CsvField; next: number } {
    let next = start,
      value: string,
      quoted = false;
    if (quote !== "\0" && !separators.includes(" ")) {
      let blank = next;
      while (line[blank] === " ") blank++;
      if (line[blank] === quote) next = blank;
    }
    if (quote !== "\0" && line[next] === quote) {
      quoted = true;
      const scanned = scanQuotedString(line, next, separators, quote, overflowCell);
      value = scanned.value;
      next = scanned.next;
      const suffixStart = next;
      while (next < line.length && !separators.includes(line[next] as string)) next++;
      let suffixEnd = next;
      if (removeSpace) while (suffixEnd > suffixStart && line[suffixEnd - 1] === " ") suffixEnd--;
      value = appendLineData(value, line.slice(suffixStart, suffixEnd), overflowCell);
    } else {
      const fieldStart = next;
      while (next < line.length && !separators.includes(line[next] as string)) next++;
      let trimStart = fieldStart,
        trimEnd = next;
      if (removeSpace) {
        while (trimStart < trimEnd && line[trimStart] === " ") trimStart++;
        while (trimEnd > trimStart && line[trimEnd - 1] === " ") trimEnd--;
      }
      value = appendLineData("", line.slice(trimStart, trimEnd), overflowCell);
    }
    if (next < line.length) next++;
    if (merge) while (next < line.length && separators.includes(line[next] as string)) next++;
    return { field: { value, quoted }, next };
  }
  /** Copies the source's extended import options. @param options - Parsed options. @returns Nothing. */
  SetExtOptions(options: ScAsciiOptions): void {
    this.options = new ScAsciiOptions(options);
  }
  /** Reports the source stream BOM after import. @returns BOM found. */
  GetIncludeBOM(): boolean {
    return this.includeBOM;
  }
  /** Reports column overflow. @returns Overflow. */
  IsOverflowCol(): boolean {
    return this.overflowCol;
  }
  /** Reports row overflow. @returns Overflow. */
  IsOverflowRow(): boolean {
    return this.overflowRow;
  }
  /** Reports source lcl_appendLineData/lcl_GetFixed cell-length overflow. @returns Overflow. */
  IsOverflowCell(): boolean {
    return this.overflowCell;
  }
  /** Reports any of the original row, column or cell overflow flags. @returns Overflow. */
  IsOverflow(): boolean {
    return this.overflowRow || this.overflowCol || this.overflowCell;
  }

  /** Imports CSV through the source SvStream; raw bytes remain a browser call-site convenience. @param input - Source stream or bytes. @returns Success. */
  ImportStream(input: SvStream | Uint8Array): boolean {
    const options = this.options;
    if (!options) return false;
    const stream = input instanceof SvStream ? input : new SvStream(input, options.eCharSet);
    const initialPosition = stream.Tell();
    stream.StartReadingUnicodeText(stream.GetStreamEncoding());
    if (initialPosition !== stream.Tell()) this.includeBOM = true;
    const separators: [string] = [options.aFieldSeps],
      detectSeparator: [number] = [0xffff];
    const readLine = /** Implements read Line. @returns The string result. */ (): string =>
      ReadCsvLine(stream, !options.bFixedLen, separators, options.cTextSep, detectSeparator);
    const formatter = new SvNumberFormatter(options.eLang),
      docImport = new ScDocumentImport(this.document),
      transliteration = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE),
      calendar = new CalendarWrapper();
    let secondTransliteration: TransliterationWrapper | null = null,
      secondCalendar: CalendarWrapper | null = null;
    let row = 0,
      endCol = 0;
    try {
      transliteration.loadModuleIfNeeded(options.eLang);
      const locale = convertLanguageToLocale(options.eLang, false);
      try {
        calendar.loadDefaultCalendar(locale);
      } finally {
        locale.dispose();
      }
      if (options.eLang !== LANGUAGE_ENGLISH_US) {
        secondTransliteration = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE);
        transliteration.loadModuleIfNeeded(LANGUAGE_ENGLISH_US);
        secondCalendar = new CalendarWrapper();
        const english = convertLanguageToLocale(LANGUAGE_ENGLISH_US, false);
        try {
          secondCalendar.loadDefaultCalendar(english);
        } finally {
          english.dispose();
        }
      }
      let skipLines = options.nStartRow;
      while (--skipLines > 0) {
        readLine();
        if (stream.eof()) break;
      }
      // ExtText2Doc captures nLastCol once per pass; nEndCol still grows after each row.
      const lastCol = endCol;
      for (;;) {
        const sourceLine = readLine();
        if (stream.eof() && !sourceLine) break;
        if (row > this.document.MaxRow()) {
          this.overflowRow = true;
          break;
        }
        const line = sourceLine.replaceAll("\0", "");
        const cellOverflow: [boolean] = [false];
        let column = 0;
        if (options.bFixedLen) {
          let startIndex = 0;
          for (
            let source = 0;
            source < options.mvColStart.length && column <= this.document.MaxCol() + 1;
            source++
          ) {
            const nextIndex: [number] = [startIndex];
            if (source + 1 < options.mvColStart.length)
              ScImportExport.CountVisualWidth(
                line,
                nextIndex,
                (options.mvColStart[source + 1] as number) - (options.mvColStart[source] as number),
              );
            else nextIndex[0] = line.length;
            const format = options.mvColFormat[source] ?? SC_COL_STANDARD;
            if (format !== SC_COL_SKIP) {
              if (column > this.document.MaxCol()) this.overflowCol = true;
              else {
                const field = ScImportExport.GetFixed(line, startIndex, nextIndex[0], cellOverflow);
                lcl_PutString(
                  docImport,
                  new ScAddress(column, row, 0),
                  field,
                  field.quoted && options.bQuotedFieldAsText ? SC_COL_TEXT : format,
                  options,
                  formatter,
                  transliteration,
                  calendar,
                  secondTransliteration,
                  secondCalendar,
                );
              }
              column++;
            }
            startIndex = nextIndex[0];
          }
        } else {
          let next = 0,
            source = 0,
            infoStart = 0,
            lastColEmpty = line.length === 0 && !options.bSkipEmptyCells;
          while ((next < line.length || lastColEmpty) && column <= this.document.MaxCol() + 1) {
            const scanned = ScImportExport.ScanNextFieldFromString(
              line,
              next,
              options.cTextSep,
              options.aFieldSeps,
              options.bMergeFieldSeps,
              options.bRemoveSpace,
              cellOverflow,
            );
            next = scanned.next;
            let format = SC_COL_STANDARD;
            for (let i = infoStart; i < options.mvColStart.length; i++)
              if (options.mvColStart[i] === source + 1) {
                format = options.mvColFormat[i] ?? SC_COL_STANDARD;
                infoStart = i + 1;
                break;
              }
            if (format !== SC_COL_SKIP) {
              if (column > this.document.MaxCol()) this.overflowCol = true;
              else {
                const field = scanned.field.value.endsWith("\n")
                  ? { ...scanned.field, value: scanned.field.value.slice(0, -1) }
                  : scanned.field;
                lcl_PutString(
                  docImport,
                  new ScAddress(column, row, 0),
                  field,
                  field.quoted && options.bQuotedFieldAsText ? SC_COL_TEXT : format,
                  options,
                  formatter,
                  transliteration,
                  calendar,
                  secondTransliteration,
                  secondCalendar,
                );
              }
              column++;
              if (lastColEmpty) lastColEmpty = false;
              else
                lastColEmpty =
                  column === lastCol && next === line.length && !options.bSkipEmptyCells;
            }
            source++;
          }
        }
        this.overflowCell ||= cellOverflow[0];
        endCol = Math.max(endCol, column);
        row++;
      }
      docImport.finalize();
    } finally {
      secondCalendar?.dispose();
      secondTransliteration?.dispose();
      calendar.dispose();
      transliteration.dispose();
      formatter.dispose();
    }
    return true;
  }

  /** Counts the original ICU visual width and advances a UTF-16 cursor, including one following ignorable code point. @param line - Input text. @param index - Source cursor. @param maxWidth - Visual-column limit. @returns Counted width. */
  static CountVisualWidth(line: string, index: [number], maxWidth: number): number {
    let width = 0;
    while (index[0] < line.length && width < maxWidth) {
      const codePoint = line.codePointAt(index[0]) as number;
      index[0] += codePoint > 0xffff ? 2 : 1;
      const eastAsianWidth = u_getIntPropertyValue(codePoint, UProperty.UCHAR_EAST_ASIAN_WIDTH);
      if (
        eastAsianWidth === UEastAsianWidth.U_EA_FULLWIDTH ||
        eastAsianWidth === UEastAsianWidth.U_EA_WIDE
      )
        width += 2;
      else if (!u_getIntPropertyValue(codePoint, UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT))
        width++;
    }
    if (index[0] < line.length) {
      const codePoint = line.codePointAt(index[0]) as number;
      if (u_getIntPropertyValue(codePoint, UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT))
        index[0] += codePoint > 0xffff ? 2 : 1;
    }
    return width;
  }

  /** Applies lcl_GetFixed's trailing-space and quote checks without separator unescaping. @param line - Input record. @param start - UTF-16 start. @param next - UTF-16 end. @returns Source field.  @param overflowCell - Overflow Cell. */
  private static GetFixed(
    line: string,
    start: number,
    next: number,
    overflowCell: [boolean],
  ): CsvField {
    next = Math.min(next, line.length);
    if (next <= start) return { value: "", quoted: false };
    let space = next;
    while (space > start && line[space - 1] === " ") space--;
    const quoted = line[start] === '"' && line[space - 1] === '"';
    const fits = quoted
      ? space - start - 3 <= nArbitraryCellLengthLimit
      : space - start <= nArbitraryCellLengthLimit;
    if (!fits) overflowCell[0] = true;
    return {
      value: quoted
        ? fits
          ? line.slice(start + 1, Math.max(start + 1, space - 1))
          : line.slice(start + 1, start + 1 + nArbitraryCellLengthLimit)
        : line.slice(start, space).slice(0, nArbitraryCellLengthLimit),
      quoted,
    };
  }
}
