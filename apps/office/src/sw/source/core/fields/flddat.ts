/** @fileoverview Native Writer date and time fields over the document number formatter. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { doubleToUStringBuffer } from "../../../../sal/inc/rtl/math";
import { rtl_math_StringFormat } from "../../../../sal/inc/rtl/math-values";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { NfIndexTableOffset, NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../../svl/inc/zforlist";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Date } from "../../../../tools/source/datetime/tdate";
import type { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { SwDateTimeSubType, type SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";

/** Native document-owned date/time field type. */
export class SwDateTimeFieldType {
  /** Binds the system field type to its document. @param document - Owning document. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the native owner. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.document;
  }
}

/** Original fixed or live scalar date/time field. */
export class SwDateTimeField implements SwField<SwDateTimeField> {
  private value = 0;
  private offset = 0;
  private automaticLanguage = true;
  private readonly format: number;

  /** Resolves native zero-format defaults and captures the clock for fixed fields. @param type - Owning system type. @param subtype - Flags. @param format - Existing formatter key, or zero for the native default. */
  public constructor(
    private readonly type: SwDateTimeFieldType,
    private readonly subtype = SwDateTimeSubType.Date,
    format = 0,
  ) {
    this.format =
      format ||
      type
        .GetDoc()
        .GetNumberFormatter()
        .GetFormatIndex(
          this.IsDate()
            ? NfIndexTableOffset.NF_DATE_SYSTEM_SHORT
            : NfIndexTableOffset.NF_TIME_HHMMSS,
          LANGUAGE_SYSTEM,
        );
    if (this.IsFixed()) this.SetDateTime(new DateTime(DateTime.SYSTEM));
  }

  /** Borrows the original system field type. @returns Owning type. */
  public GetTyp(): SwDateTimeFieldType {
    return this.type;
  }

  /** Reads the original date/time and fixed flags. @returns Subtype bits. */
  public GetSubType(): SwDateTimeSubType {
    return this.subtype;
  }

  /** Tests the original date subtype. @returns Whether a date field. */
  public IsDate(): boolean {
    return Boolean(this.subtype & SwDateTimeSubType.Date);
  }

  /** Tests the original fixed flag. @returns Whether a fixed field. */
  public IsFixed(): boolean {
    return Boolean(this.subtype & SwDateTimeSubType.Fixed);
  }

  /** Reads the current native number format. @returns Formatter key. */
  public GetFormat(): number {
    return this.format;
  }

  /** Reads the native adjustment in minutes. @returns Offset. */
  public GetOffset(): number {
    return this.offset;
  }

  /** Sets the original adjustment in minutes. @param minutes - Offset. */
  public SetOffset(minutes: number): void {
    this.offset = minutes;
  }

  /** Reads the original language-selection flag. @returns Whether system language is allowed. */
  public IsAutomaticLanguage(): boolean {
    return this.automaticLanguage;
  }

  /** Updates the original language-selection flag. @param automatic - Whether system language is allowed. */
  public SetAutomaticLanguage(automatic: boolean): void {
    this.automaticLanguage = automatic;
  }

  /** Sets the stored serial date/time. @param value - Days since the document null date. */
  public SetValue(value: number): void {
    this.value = value;
  }

  /** Stores a date/time relative to the actual document null date. @param dateTime - Native value. */
  public SetDateTime(dateTime: DateTime): void {
    this.SetValue(this.SerialValue(dateTime));
  }

  /** Reads the original fixed serial or the current local clock. @returns Date/time in serial days. */
  public GetValue(): number {
    return this.IsFixed() ? this.value : this.SerialValue(new DateTime(DateTime.SYSTEM));
  }

  /** Converts the original unadjusted presentation value back to UNO. @returns Date/time property. */
  public GetDateTimeValue(): UnoDateTime {
    const date = new Date(this.type.GetDoc().GetNumberFormatter().GetNullDate());
    date.AddDays(Math.trunc(this.GetValue()));
    const timeValue = this.GetValue();
    const time = new DateTime(DateTime.EMPTY);
    time.AddTime(timeValue - Math.trunc(timeValue));
    return new DateTime(date, time).GetUNODateTime();
  }

  /** Expands the original value plus its minute offset in its native number format. @returns Field text. */
  public Expand(): string {
    const formatter = this.type.GetDoc().GetNumberFormatter();
    const value = this.GetValue() + this.offset * (60 / 86400);
    const output = new OUString();
    try {
      if (formatter.IsTextFormat(this.format)) {
        const buffer = new OUStringBuffer();
        const separator = formatter.GetFormatDecimalSep(this.format);
        try {
          doubleToUStringBuffer(
            buffer,
            value,
            rtl_math_StringFormat.rtl_math_StringFormat_F,
            12,
            separator.getStr()[0] ?? 46,
            true,
          );
          const input = buffer.makeStringAndClear();
          try {
            formatter.GetOutputString(input, this.format, output, [null]);
          } finally {
            input.dispose();
          }
        } finally {
          separator.dispose();
          buffer.dispose();
        }
      } else formatter.GetOutputString(value, this.format, output, [null]);
      return text(output);
    } finally {
      output.dispose();
    }
  }

  /** Copies the native field state with the same document owner. @returns Detached field. */
  public Copy(): SwDateTimeField {
    return this.CopyWithType(this.type, this.format);
  }

  /** Copies the field and remaps its document-local number format. @param document - Destination document. @returns Detached field. */
  public CopyToDocument(document: SwDoc): SwDateTimeField {
    if (document === this.type.GetDoc()) return this.Copy();
    const entry = this.type.GetDoc().GetNumberFormatter().GetEntry(this.format);
    const key: [number] = [0];
    if (entry) {
      const format = new OUString(entry.GetFormatstring());
      try {
        document.GetNumberFormatter().PutEntry(format, [0], [0], key, entry.GetLanguage());
      } finally {
        format.dispose();
      }
    }
    return this.CopyWithType(
      document.getIDocumentFieldsAccess().GetDateTimeFieldType(),
      key[0] === NUMBERFORMAT_ENTRY_NOT_FOUND ? 0 : key[0],
    );
  }

  /** Releases field-specific state. The formatter remains owned by the document. */
  public Dispose(): void {}

  /** Converts native date/time using the actual formatter's null date. @param value - Calendar date and clock. @returns Serial days. */
  private SerialValue(value: DateTime): number {
    return DateTime.Sub(value, new DateTime(this.type.GetDoc().GetNumberFormatter().GetNullDate()));
  }

  /** Copies the source field state after selecting the native owner and its formatter key. @param type - Destination field type. @param format - Destination format key. @returns Detached field. */
  private CopyWithType(type: SwDateTimeFieldType, format: number): SwDateTimeField {
    const copy = new SwDateTimeField(type, this.subtype, format);
    copy.SetValue(this.GetValue());
    copy.SetOffset(this.offset);
    copy.SetAutomaticLanguage(this.automaticLanguage);
    return copy;
  }
}
