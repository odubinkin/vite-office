/** @fileoverview Consumed absolute numeric FontSizeBox from ctrlbox.cxx over real VCL conversions. Relative/name/device services remain unrepresented. */
import { TextToValue, ConvertValue } from "../../../vcl/source/control/field";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { FontList } from "../../inc/ctrltool";
/** Original absolute FontSizeBox value/text owner; scaled values use one decimal point digit. */
export class FontSizeBox {
  private text = "";
  private entries: readonly number[] = [];
  /** Borrows actual host decimal fields; no LocaleDataWrapper service is fabricated. @param decimal - System decimal separator. @param alternate - System alternate separator. @returns Numeric owner. */
  constructor(
    private readonly decimal: string,
    private readonly alternate: string,
  ) {}
  /** Original scalable Fill numerical path, excluding the terminating zero. @returns Nothing. */
  Fill(): void {
    const source = FontList.GetStdSizeAry();
    this.entries = Object.freeze(source.slice(0, source.indexOf(0)));
  }
  /** Borrows numerical rows in source order, in tenths of a point. @returns Immutable sizes. */
  GetEntries(): readonly number[] {
    return this.entries;
  }
  /** Original combo text assignment retains incomplete entry text. @param text - Actual widget text. @returns Nothing. */
  set_active_or_entry_text(text: string): void {
    this.text = text;
  }
  /** Original current widget text. @returns Text. */
  get_active_text(): string {
    return this.text;
  }
  /** Absolute original get_value ignores parse success, clamps nonempty input20..9999 and rounds the scaled result. @returns Tenths of a point. */
  get_value(): number {
    let value = TextToValue(this.text, 0n, 1, this.decimal, this.alternate, FieldUnit.POINT) ?? 0;
    if (this.text !== "") value = Math.max(20, Math.min(9999, value));
    return Math.round(value);
  }
  /** Original one-decimal number formatting without trailing fractional zero, followed by the point suffix. @param value - Tenths of a point. @returns Formatted entry. */
  format_number(value: number): string {
    return String(value / 10).replace(".", this.decimal) + " pt";
  }
  /** Original conversion/clamp before formatting an absolute value. @param value - Scaled integer in the input unit. @param unit - Source physical unit. @returns Nothing. */
  SetValue(value: number, unit: FieldUnit): void {
    const converted = Number(ConvertValue(BigInt(value), 0n, 1, unit, FieldUnit.POINT));
    this.text = this.format_number(Math.max(20, Math.min(9999, converted)));
  }
  /** Original point-unit setter. @param value - Tenths of a point. @returns Nothing. */
  set_value(value: number): void {
    this.SetValue(value, FieldUnit.POINT);
  }
  /** Original numeric focus-out reformat; the owning toolbox may subsequently restore its last status text. @returns Nothing. */
  ReformatHdl(): void {
    this.set_value(this.get_value());
  }
}
