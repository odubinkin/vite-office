/** @fileoverview Consumed weld::MetricSpinButton numeric state and native parser contract;VCL sizing/font/window services remain unported. */
import { FieldUnit } from "../../../tools/inc/fldunit";
import { ConvertValue, TextToValue } from "../control/field";
import { normalize, denormalize } from "./SpinButton";
/** Native normalized metric value;the browser supplies the actual widget decimal fields. */
export class MetricSpinButton {
  private value = 0n;
  private minimum = -2147483648n;
  private maximum = 2147483647n;
  private digits = 0;
  private step = 1n;
  private page = 10n;
  private unit = FieldUnit.CM;
  /** Native unit change retains the normalized numeric value. @param unit - Display unit. @returns Nothing. */
  set_unit(unit: FieldUnit): void {
    this.unit = unit;
  }
  /** Native digits change retains normalized numeric value. @param digits - Precision. @returns Nothing. */
  set_digits(digits: number): void {
    this.digits = digits;
  }
  /** Original current source-unit query. @returns Field unit. */
  get_unit(): FieldUnit {
    return this.unit;
  }
  /** Original underlying precision query. @returns Decimal digits. */
  get_digits(): number {
    return this.digits;
  }
  /** Original increment conversion into current field units. @param step - Normalized small step. @param page - Normalized page step. @param unit - Source unit. @returns Nothing. */
  set_increments(step: bigint, page: bigint, unit: FieldUnit): void {
    this.step = this.ConvertValue(step, unit, this.unit);
    this.page = this.ConvertValue(page, unit, this.unit);
  }
  /** Original normalized increment query with unit conversion. @param unit - Output unit. @returns Step and page increments. */
  get_increments(unit: FieldUnit): readonly [bigint, bigint] {
    return [
      this.ConvertValue(this.step, this.unit, unit),
      this.ConvertValue(this.page, this.unit, unit),
    ];
  }
  /** Original field conversion through vcl::ConvertValue. @param value - Scaled value. @param input - Source unit. @param output - Target unit. @returns Scaled converted value. */
  ConvertValue(value: bigint, input: FieldUnit, output: FieldUnit): bigint {
    return ConvertValue(value, 0n, this.digits, input, output);
  }
  /** Original normalized input range converts into current units. @param minimum - Source minimum. @param maximum - Source maximum. @param unit - Source unit. @returns Nothing. */
  set_range(minimum: bigint, maximum: bigint, unit: FieldUnit): void {
    this.minimum = this.ConvertValue(minimum, unit, this.unit);
    this.maximum = this.ConvertValue(maximum, unit, this.unit);
    this.set_value(this.value, FieldUnit.NONE);
  }
  /** Original set_min reads the opposite bound in the requested unit and delegates the full range conversion. @param minimum - Normalized new minimum. @param unit - Source unit. @returns Nothing. */
  set_min(minimum: bigint, unit: FieldUnit): void {
    this.set_range(minimum, this.get_range(unit)[1], unit);
  }
  /** Original converted range getter;the tuple adapts native output references. @param unit - Output unit. @returns Minimum and maximum normalized values. */
  get_range(unit: FieldUnit): readonly [bigint, bigint] {
    return [
      this.ConvertValue(this.minimum, this.unit, unit),
      this.ConvertValue(this.maximum, this.unit, unit),
    ];
  }
  /** Real spin control clamps after native unit conversion. @param value - Scaled input. @param unit - Input unit. @returns Nothing. */
  set_value(value: bigint, unit: FieldUnit): void {
    const converted = this.ConvertValue(value, unit, this.unit);
    this.value =
      converted < this.minimum ? this.minimum : converted > this.maximum ? this.maximum : converted;
  }
  /** Original converted getter. @param unit - Target unit. @returns Normalized integer. */
  get_value(unit: FieldUnit): bigint {
    return this.ConvertValue(this.value, this.unit, unit);
  }
  /** Original normalize. @param value - Unscaled value. @returns Scaled value. */
  normalize(value: bigint): bigint {
    return normalize(value, this.digits);
  }
  /** Original denormalize. @param value - Scaled value. @returns Integer. */
  denormalize(value: bigint): bigint {
    return denormalize(value, this.digits);
  }
  /** Native text parser rounds/clips to signed32 before underlying range clamping. @param text - Input text. @param decimal - Locale decimal. @param alternate - Locale alternate. @returns Parse succeeded. */
  set_text(text: string, decimal: string, alternate: string): boolean {
    const result = TextToValue(text, 0n, this.digits, decimal, alternate, this.unit);
    if (result === undefined) return false;
    const bounded = Math.max(-2147483648, Math.min(2147483647, result));
    this.set_value(BigInt(bounded < 0 ? -Math.round(-bounded) : Math.round(bounded)), this.unit);
    return true;
  }
}
