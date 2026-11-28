/** @fileoverview Number Format tab's locale, entry list, draft picture and real formatter preview. */
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import { languageEntries } from "../../../svtools/source/misc/langtab";
import {
  NUMBERFORMAT_ENTRY_NOT_FOUND as NONE,
  NfIndexTableOffset,
  SvNumFormatType as T,
} from "../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import type { SvNumberformat } from "../../../svl/source/numbers/zformat";
import type { FormatSpecialInfo } from "../../../svl/source/numbers/zformat.picture";
import type { CurrencyListEntry } from "../tbxctrls/tbcontrl.currency";

/** Original category order from numfmtsh.hxx. */
export const numberFormatCategories = [
  ["All", T.ALL],
  ["User-defined", T.DEFINED],
  ["Number", T.NUMBER],
  ["Percent", T.PERCENT],
  ["Currency", T.CURRENCY],
  ["Date", T.DATE],
  ["Time", T.TIME],
  ["Scientific", T.SCIENTIFIC],
  ["Fraction", T.FRACTION],
  ["Boolean Value", T.LOGICAL],
  ["Text", T.TEXT],
] as const;

const galleryOrder = [
  T.NUMBER,
  T.PERCENT,
  T.CURRENCY,
  T.DATE,
  T.TIME,
  T.DATETIME,
  T.SCIENTIFIC,
  T.FRACTION,
  T.LOGICAL,
  T.TEXT,
] as readonly number[];

const previews = new Map<number, number>([
  [T.ALL, -1234.567890123457],
  [T.NUMBER, -1234.567890123457],
  [T.PERCENT, -0.1295],
  [T.CURRENCY, -1234],
  [T.DATE, 36495.5678935185],
  [T.DATETIME, 36495.5678935185],
  [T.TIME, 36495.5678935185],
  [T.SCIENTIFIC, 12345.67889],
  [T.FRACTION, 123.456],
  [T.LOGICAL, 1],
]);

/** Lists the actual number formatter's available locale data. @returns Source language choices. */
export function GetNumberFormatLanguages(): readonly { id: number; name: string }[] {
  const names = new Map<number, string>([[LANGUAGE_SYSTEM, "Default"]]);
  for (const [id, name] of languageEntries) {
    if (SvNumberFormatter.IsLocaleInstalled(id)) names.set(id, name);
  }
  return [...names]
    .map(
      /** Forms a source locale row. @param row - Actual locale. @returns Display row. */
      ([id, name]) => ({ id, name }),
    )
    .sort(
      /** Keeps the system locale first and sorts regional names. @param a - Locale. @param b - Locale. @returns Display order. */
      (a, b) =>
        a.id === LANGUAGE_SYSTEM ? -1 : b.id === LANGUAGE_SYSTEM ? 1 : a.name.localeCompare(b.name),
    );
}

/** Number Format gallery row with its underlying picture and formatted sample. */
export interface NumberFormatRow {
  readonly code: string;
  readonly label: string;
  readonly color: Color | null;
}

/** Native compiled picture controls and preview presentation. */
export interface NumberFormatDescription extends FormatSpecialInfo {
  readonly type: number;
  readonly code: string;
  readonly preview: string;
  readonly color: Color | null;
  readonly spellOut: boolean;
}

/** Owns native user-format lifecycle and the browser's isolated draft preview. */
export class SvxNumberFormatShell {
  private readonly scratch: SvNumberFormatter;
  private readonly added = new Set<number>();
  private readonly removed = new Set<number>();
  private undoAdded = true;

  /** Borrows the document's formats and actual preview value. @param document - Existing formatter. @param sample - Current cell value. @returns Format shell. */
  constructor(
    private readonly document: SvNumberFormatter,
    private readonly sample?: number | string,
  ) {
    this.scratch = new SvNumberFormatter(document.GetLanguage());
    const nullDate = document.GetNullDate();
    this.scratch.ChangeNullDate(nullDate.GetDay(), nullDate.GetMonth(), nullDate.GetYear());
    this.scratch.ChangeStandardPrec(document.GetStandardPrec());
  }

  /** Looks up or compiles a draft in the isolated format table. @param picture - Requested picture. @param language - Format locale. @returns Scratch key. */
  private Compile(picture: string, language: number): number {
    if (!picture.trim()) return NONE;
    const code = unicode(picture);
    try {
      const previous = this.scratch.GetEntryKey(code, language);
      if (previous !== NONE) return previous;
      const check: [number] = [0],
        key: [number] = [NONE];
      this.scratch.PutEntry(code, check, [T.ALL], key, language);
      return check[0] ? NONE : key[0];
    } finally {
      code.dispose();
    }
  }

  /** Resolves the category's native standard picture. @param category - Requested category. @param language - Format locale. @returns Actual format code. */
  GetStandardCode(category: number, language: number): string {
    const type = category === T.ALL || category === T.DEFINED ? T.NUMBER : category;
    const key = this.scratch.GetStandardFormat(type, language);
    return text(this.scratch.GetEntry(key)?.GetFormatstring() as OUString);
  }

  /** Reads formats in source key order using the selected locale and category. @param category - Selected category. @param language - Selected locale. @returns Available code rows. */
  GetFormats(category: number, language: number): readonly NumberFormatRow[] {
    this.scratch.GetStandardIndex(language);
    const rows = new Map<string, NumberFormatRow & { type: number }>();
    const standard = this.GetStandardCode(T.NUMBER, language);
    for (const formatter of [this.scratch, this.document]) {
      for (const [key, entry] of formatter.GetROFormatData().GetFormatEntryMap()) {
        if (entry.GetLanguage() !== language) continue;
        const type = entry.GetMaskedType();
        const matches =
          category === T.ALL ||
          (category === T.DEFINED
            ? (entry.GetType() & T.DEFINED) !== 0
            : category === type ||
              ((category === T.DATE || category === T.TIME) && type === T.DATETIME));
        if (
          matches &&
          (formatter === this.document
            ? !this.removed.has(key)
            : !formatter.IsUserDefined(key) || entry.IsAdditionalBuiltin())
        ) {
          const code = text(entry.GetFormatstring());
          if (rows.has(code)) continue;
          if (type === T.TEXT || code === standard) {
            rows.set(code, { code, type, label: code, color: null });
            continue;
          }
          const sample = this.PaintPreview(
            formatter,
            key,
            formatter.IsNatNum12(key) && (type === T.CURRENCY || type === T.NUMBER)
              ? type === T.CURRENCY
                ? 1.2
                : 100
              : (previews.get(type) ?? previews.get(T.NUMBER) ?? 0),
          );
          rows.set(code, { code, type, label: sample.preview, color: sample.color });
        }
      }
    }
    return [...rows.values()].sort(
      /** Groups formats in the original category order and retains entry order within each group. @param left - Gallery row. @param right - Gallery row. @returns Relative category position. */
      (left, right) => galleryOrder.indexOf(left.type) - galleryOrder.indexOf(right.type),
    );
  }

  /** Returns the current picture's parsed metadata and native display sample. @param picture - Draft picture. @param language - Active locale. @returns Description or invalid. */
  Describe(picture: string, language: number): NumberFormatDescription | undefined {
    const key = this.Compile(picture, language);
    const entry = this.scratch.GetEntry(key);
    if (!entry) return undefined;
    const type = entry.GetMaskedType();
    const index = entry.GetFormatIntegerDigits();
    const sample = this.sample ?? previews.get(type) ?? 0;
    const info = entry.GetFormatSpecialInfo();
    return {
      ...info,
      ...this.PaintPreview(this.scratch, key, sample),
      type,
      code: text(entry.GetFormatstring()),
      grouped: type === T.SCIENTIFIC ? index > 0 && index % 3 === 0 : info.grouped,
      spellOut: this.scratch.IsNatNum12(key),
    };
  }

  /** Renders a gallery or cell example through the original formatter. @param formatter - Format owner. @param key - Native code key. @param sample - Native preview input. @returns Rendered text and color. */
  private PaintPreview(formatter: SvNumberFormatter, key: number, sample: number | string) {
    const output = new OUString();
    const color: [Color | null] = [null];
    try {
      if (typeof sample === "string") {
        const value = unicode(sample);
        try {
          formatter.GetOutputString(value, key, output, color);
        } finally {
          value.dispose();
        }
      } else formatter.GetOutputString(sample, key, output, color);
      return { preview: text(output), color: color[0] };
    } finally {
      output.dispose();
    }
  }

  /** Translates a picture from its parsed locale when the language control changes.
   * @param picture - Current code.
   * @param current - Old locale.
   * @param target - New locale.
   * @param category - Selected category.
   * @returns Picture in the requested locale.
   */
  Translate(picture: string, current: number, target: number, category: number): string {
    const key = this.Compile(picture, current);
    if (key === NONE) return this.GetStandardCode(category, target);
    const index = SvNumberFormatter.GetIndexTableOffset(key);
    if (index !== NfIndexTableOffset.NF_INDEX_TABLE_ENTRIES) {
      const entry = this.scratch.GetEntry(this.scratch.GetFormatIndex(index, target));
      if (entry) return text(entry.GetFormatstring());
    }
    const code = unicode(picture);
    try {
      const check: [number] = [0],
        result: [number] = [NONE];
      this.scratch.PutandConvertEntry(code, check, [T.ALL], result, current, target, false);
      return check[0] ? this.GetStandardCode(category, target) : text(code);
    } finally {
      code.dispose();
    }
  }

  /** Generates a new code through the original formatter. @param code - Current picture. @param language - Active locale. @param options - Source picture options. @returns Draft code. */
  Generate(code: string, language: number, options: FormatSpecialInfo): string {
    const key = this.Compile(code, language);
    const picture = this.scratch.GenerateFormat(
      key,
      language,
      options.grouped,
      options.red,
      options.precision,
      options.leadingZeros,
    );
    try {
      return text(picture);
    } finally {
      picture.dispose();
    }
  }

  /** Builds the source currency row under the chosen picture locale. @param choice - Currency table entry. @param language - Active locale. @returns Draft code. */
  GetCurrencyCode(choice: CurrencyListEntry, language: number): string {
    this.scratch.GetStandardIndex(language);
    const formats: OUString[] = [];
    try {
      const index = this.scratch.GetCurrencyFormatStrings(formats, choice.entry, choice.bank);
      return text(formats[index] as OUString);
    } finally {
      for (const format of formats) format.dispose();
    }
  }

  /** Finds a visible native format by picture and locale. @param picture - Code. @param language - Locale. @returns Format key or sentinel. */
  FindEntry(picture: string, language: number): number {
    if (!picture) return NONE;
    const code = unicode(picture);
    try {
      const key = this.document.GetEntryKey(code, language);
      return this.removed.has(key) ? NONE : key;
    } finally {
      code.dispose();
    }
  }

  /** Inserts a compiled document format or reinstates an already removed entry.
   * @param picture - Input code.
   * @param language - Input locale.
   * @returns Normalized code, locale and key, or absence on rejection.
   */
  AddFormat(
    picture: string,
    language: number,
  ): { code: string; language: number; key: number } | undefined {
    if (!picture.trim()) return undefined;
    const code = unicode(picture);
    try {
      const key: [number] = [this.document.GetEntryKey(code, language)];
      if (key[0] === NONE) {
        if (!this.document.PutEntry(code, [0], [T.ALL], key, language)) return undefined;
      } else if (!this.removed.delete(key[0])) return undefined;
      const entry = this.document.GetEntry(key[0]);
      if (!entry) return undefined;
      this.added.add(key[0]);
      return { code: text(entry.GetFormatstring()), language: entry.GetLanguage(), key: key[0] };
    } finally {
      code.dispose();
    }
  }

  /** Stages deletion and returns the affected category's original standard replacement.
   * @param key - Resolved gallery key.
   * @returns The replacement picture and locale, or absence.
   */
  RemoveFormat(key: number): { code: string; language: number; category: number } | undefined {
    const entry = this.document.GetEntry(key);
    if (!entry || !this.IsUserDefined(key)) return undefined;
    this.removed.add(key);
    this.added.delete(key);
    const category = entry.GetMaskedType();
    const language = entry.GetLanguage();
    return {
      category: category === T.DATETIME ? T.DATE : category,
      code: this.GetStandardCode(category, language),
      language,
    };
  }

  /** Checks the original user-defined type of a visible gallery entry. @param key - Resolved gallery key. @returns Editable or removable. */
  IsUserDefined(key: number): boolean {
    if (this.removed.has(key) || !this.document.IsUserDefined(key)) return false;
    const entry = this.document.GetEntry(key);
    return (
      !!entry &&
      (entry.GetMaskedType() !== T.CURRENCY ||
        !this.IsInCurrencyTable(text(entry.GetFormatstring()), entry.GetLanguage()))
    );
  }

  /** Checks original generated symbol and bank variants before admitting custom currency actions.
   * @param picture - Format code.
   * @param language - Format locale.
   * @returns Whether the code belongs to the native currency table.
   */
  IsInCurrencyTable(picture: string, language: number): boolean {
    if (!picture.includes("[$")) return false;
    this.scratch.GetStandardIndex(language);
    for (const currency of SvNumberFormatter.GetTheCurrencyTable()) {
      for (const bank of [false, true]) {
        const symbol = currency.BuildSymbolString(bank);
        try {
          if (!picture.includes(text(symbol))) continue;
        } finally {
          symbol.dispose();
        }
        const formats: OUString[] = [];
        try {
          this.scratch.GetCurrencyFormatStrings(formats, currency, bank);
          if (
            formats.some(
              /** Compares a source currency variant with the entered code. @param format - Currency variant. @returns Exact match. */
              (format) => text(format) === picture,
            )
          )
            return true;
        } finally {
          for (const format of formats) format.dispose();
        }
      }
    }
    return false;
  }

  /** Reads the native format comment through its gallery key. @param key - Resolved gallery key. @returns Existing annotation. */
  GetComment4Entry(key: number): string {
    const entry = this.document.GetEntry(key);
    return entry ? text(entry.GetComment()) : "";
  }

  /** Writes the comment into the actual selected format on editor completion. @param key - Resolved gallery key. @param value - Annotation. @returns Nothing. */
  SetComment4Entry(key: number, value: string): void {
    const entry = this.document.GetEntry(key) as SvNumberformat | null;
    if (!entry) return;
    const comment = unicode(value);
    try {
      entry.SetComment(comment);
    } finally {
      comment.dispose();
    }
  }

  /** Returns original deferred deletion keys in request order. @returns Deletions. */
  GetUpdateData(): readonly number[] {
    return [...this.removed];
  }

  /** Commits the original add list after the calling dialog accepts. @returns Nothing. */
  ValidateNewEntries(): void {
    this.undoAdded = false;
  }

  /** Removes still-unvalidated additions and releases the draft preview owner. @returns Nothing. */
  Dispose(): void {
    if (this.undoAdded) {
      for (const key of this.added) this.document.DeleteEntry(key);
    }
    this.added.clear();
    this.removed.clear();
    this.scratch.dispose();
  }
}
