/** @fileoverview Original tools::Date packed value,DMY/copy construction,validity, normalization and normalized-day counting over the actual shared comphelper date algorithms. System clock,UNO conversion and other operations remain unported. */
import {
  convertDateToDays,
  convertDaysToDate,
  isValidDate,
  normalize,
  type DateFields,
} from "../../../comphelper/source/misc/date";
/** Original borrowed const Date value contract,with no new lifetime owner. */
export interface DateConstReference {
  /** Original raw packed field. @returns Signed32 date. */
  GetDate(): number;
  /** Original empty predicate. @returns Empty status. */
  IsEmpty(): boolean;
  /** Original day field. @returns Day. */
  GetDay(): number;
  /** Original month field. @returns Month. */
  GetMonth(): number;
  /** Original year field. @returns Signed16 year. */
  GetYear(): number;
  /** Original calendar validity. @returns Validity. */
  IsValidDate(): boolean;
  /** Original normalized day number. @returns Day number from zero. */
  GetAsNormalizedDays(): number;
}
/** Original packed signed32 date value;no JavaScript Date or alternate calendar backend is used. */
export class Date implements DateConstReference {
  private mnDate: number;
  /** Original raw signed32/copy/DMY constructors. Numeric0 also represents the original EMPTY tag;SYSTEM clock construction is not represented. @param args - Original admitted overload inputs. @returns Date value. */
  constructor(
    ...args: [packed: number | DateConstReference] | [day: number, month: number, year: number]
  ) {
    if (args.length === 1)
      this.mnDate = typeof args[0] === "number" ? args[0] | 0 : args[0].GetDate();
    else {
      this.mnDate = 0;
      this.setDateFromDMY(...args);
    }
  }
  /** Original setDateFromDMY width conversions,assertions and negative-year packing. Year0 is a diagnostic warning,not a constructor assertion. @param day - Native uint16 day. @param month - Native uint16 month. @param year - Native signed16 year. @returns Nothing. */
  private setDateFromDMY(day: number, month: number, year: number): void {
    day &= 65535;
    month &= 65535;
    year = (year << 16) >> 16;
    if (month >= 100 || day >= 100) throw new Error("DMY representability assertion");
    this.mnDate = year * 10000 + (year < 0 ? -1 : 1) * ((month % 100) * 100 + (day % 100));
  }
  /** Original implicit memberwise assignment. @param source - Actual native date value. @returns This value. */
  assign(source: DateConstReference): this {
    this.mnDate = source.GetDate();
    return this;
  }
  /** Original empty-value predicate. @returns Whether the raw field is zero. */
  IsEmpty(): boolean {
    return this.mnDate === 0;
  }
  /** Original raw signed32 date accessor. @returns Packed value. */
  GetDate(): number {
    return this.mnDate;
  }
  /** Original absolute packed day field. @returns Native uint16 day. */
  GetDay(): number {
    return Math.abs(this.mnDate) % 100;
  }
  /** Original integer division extracts the absolute month field. @returns Native uint16 month. */
  GetMonth(): number {
    return Math.trunc(Math.abs(this.mnDate) / 100) % 100;
  }
  /** Original signed division truncates toward zero. @returns Native signed16 year. */
  GetYear(): number {
    return (Math.trunc(this.mnDate / 10000) << 16) >> 16;
  }
  /** Original validity delegates actual extracted fields to comphelper. @returns Validity. */
  IsValidDate(): boolean {
    return isValidDate(this.GetDay(), this.GetMonth(), this.GetYear());
  }
  /** Original null-date fast path and normalized day conversion without changing this packed value. @returns Day number from zero. */
  GetAsNormalizedDays(): number {
    if (this.mnDate === 18991230) return 693594;
    const fields: DateFields = [this.GetDay(), this.GetMonth(), this.GetYear()];
    normalize(fields);
    return convertDateToDays(...fields);
  }
  /** Original AddDays leaves a zero increment untouched and reconstructs via the clamped inverse conversion. @param days - Signed32 day delta. @returns Nothing. */
  AddDays(days: number): void {
    days |= 0;
    if (days !== 0)
      this.setDateFromDMY(...convertDaysToDate((this.GetAsNormalizedDays() + days) | 0));
  }
  /** Original Normalize only repacks when the shared algorithm reports a change. @returns Nothing. */
  Normalize(): void {
    const fields: DateFields = [this.GetDay(), this.GetMonth(), this.GetYear()];
    if (normalize(fields)) this.setDateFromDMY(...fields);
  }
}
