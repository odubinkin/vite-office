/** @fileoverview XLSX FORMAT records collected from the native Calc format table. */
import { LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { getRealLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { NfKeywordIndex as K } from "../../../../svl/inc/nfkeytab";
import { NfSymbolType as S } from "../../../../svl/inc/nfsymbol";
import { NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../../svl/inc/zforlist";
import type { SvNumberformatConstReference } from "../../../../svl/source/numbers/zformat";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist.formatter";
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";

const EXC_FORMAT_OFFSET8 = 164;
const lowerDateKeywords = new Map<number, string>([
  [K.MI, "m"],
  [K.MMI, "mm"],
  [K.M, "m"],
  [K.MM, "mm"],
  [K.MMM, "mmm"],
  [K.MMMM, "mmmm"],
  [K.MMMMM, "mmmmm"],
  [K.H, "h"],
  [K.HH, "hh"],
  [K.S, "s"],
  [K.SS, "ss"],
  [K.D, "d"],
  [K.DD, "dd"],
  [K.DDD, "ddd"],
  [K.DDDD, "dddd"],
  [K.YY, "yy"],
  [K.YYYY, "yyyy"],
  [K.EC, "e"],
  [K.EEC, "ee"],
  [K.G, "g"],
  [K.GG, "gg"],
  [K.GGG, "ggg"],
  [K.R, "r"],
  [K.RR, "rr"],
  [K.NN, "ddd"],
  [K.NNN, "dddd"],
  [K.GENERAL, "General"],
]);

/** Finds source subformat boundaries outside escaped and quoted text. @param value - Canonical stored format string. @returns Subformat strings. */
function splitSections(value: string): string[] {
  const sections: string[] = [];
  let quoted = false,
    bracketed = false,
    start = 0;
  for (let pos = 0; pos < value.length; ++pos) {
    const ch = value[pos];
    if (ch === "\\" && !quoted) pos++;
    else if (ch === '"') quoted = !quoted;
    else if (!quoted && ch === "[") bracketed = true;
    else if (!quoted && ch === "]") bracketed = false;
    else if (ch === ";" && !quoted && !bracketed) {
      sections.push(value.slice(start, pos));
      start = pos + 1;
    }
  }
  sections.push(value.slice(start));
  return sections;
}

/** Uses the original compiled format tokens for Excel keyword spelling and escaping. @param entry - Native format in Excel scan locale. @returns Mapped Excel code. */
function GetMappedFormatstring(entry: SvNumberformatConstReference): string {
  const raw = text(entry.GetFormatstring());
  return (
    splitSections(raw)
      .map(
        /** Maps one original compiled section. @param section - Source section. @param index - Native section index. @returns Excel section. */
        (section, index) => {
          const prefixes =
            /^(?:\[(?:[<>=][^\]]+|BLACK|BLUE|GREEN|CYAN|RED|MAGENTA|BROWN|GREY|YELLOW|WHITE|COLOR\d+)\])*/i.exec(
              section,
            )?.[0] ?? "";
          if (
            !entry.GetNumForString(index, 0) ||
            /^\[(?!\$[^-])/i.test(section.slice(prefixes.length))
          )
            return section;
          let result = prefixes;
          for (let pos = 0; ; ++pos) {
            const element = entry.GetNumForString(index, pos);
            if (!element) break;
            const value = text(element),
              type = entry.GetNumForType(index, pos);
            const keyword = lowerDateKeywords.get(type);
            if (keyword) result += keyword;
            else if (type === S.STRING || type === S.FRACBLANK) {
              if (value.length !== 1) result += '"' + value.replace(/"/g, '""') + '"';
              else result += (type === S.STRING ? "\\" : "") + value;
            } else if (type === S.EXP) result += value.includes("+") ? "E+" : "E-";
            else result += value;
          }
          return result;
        },
      )
      .join(";") || "General"
  );
}

/** Owns source FORMAT indices and the conversion formatter for XLSX output. */
export class XclExpNumFmtBuffer {
  private readonly formats = new Map<number, { id: number; code: string }>();
  private englishFormatter: SvNumberFormatter | undefined;

  /** Binds format lookup to the actual workbook. @param document - Workbook. @returns Number format buffer. */
  constructor(private readonly document: ScDocument) {}

  /** Registers a native format including the General record and returns its serial index. @param pattern - Native pattern. @returns XLSX format ID. */
  Insert(pattern: ScPatternAttr): number {
    const formatter = pattern.GetNumberFormatKey() ? this.document.GetFormatTable() : null;
    const key = pattern.GetNumberFormat(formatter);
    const old = this.formats.get(key);
    if (old) return old.id;
    const id = EXC_FORMAT_OFFSET8 + this.formats.size;
    if (id >= 0xffff) return 0;
    const code = formatter ? this.GetFormatCode(formatter, key) : "General";
    this.formats.set(key, { id, code });
    return id;
  }

  /** Converts the stored format into the Excel scan locale before writing the compiled code. @param formatter - Native workbook table. @param key - Native key. @returns Excel number format. */
  private GetFormatCode(formatter: SvNumberFormatter, key: number): string {
    const entry = formatter.GetEntry(key);
    if (!entry) return "General";
    const raw = entry.GetFormatstring();
    const language = getRealLanguage(entry.GetLanguage());
    if (language === LANGUAGE_ENGLISH_US) return GetMappedFormatstring(entry);
    const source = new OUString(raw);
    try {
      const destination = (this.englishFormatter ??= new SvNumberFormatter(LANGUAGE_ENGLISH_US));
      const check: [number] = [0],
        type: [number] = [0],
        result: [number] = [0];
      destination.PutandConvertEntry(
        source,
        check,
        type,
        result,
        language,
        LANGUAGE_ENGLISH_US,
        false,
        false,
      );
      const converted =
        check[0] === 0 && result[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND
          ? destination.GetEntry(result[0])
          : null;
      return converted ? GetMappedFormatstring(converted) : text(raw);
    } finally {
      source.dispose();
    }
  }

  /** Writes optional original number format records before font records. @param serializer - XLSX style writer. @returns Nothing. */
  SaveXml(serializer: FastSerializerHelper): void {
    if (!this.formats.size) return;
    const container = token("numFmts");
    serializer.startElement(container, token("count"), String(this.formats.size));
    for (const { id, code } of this.formats.values())
      serializer.singleElement(
        token("numFmt"),
        token("numFmtId"),
        String(id),
        token("formatCode"),
        code,
      );
    serializer.endElement(container);
  }

  /** Releases the conversion formatter and its native resources. @returns Nothing. */
  Dispose(): void {
    this.englishFormatter?.dispose();
  }
}
