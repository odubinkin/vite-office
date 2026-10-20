/** @fileoverview Original ScMetricInputDlg dimension initialization,default toggle and twip result over real shared MetricSpinButton. */
import { MetricSpinButton } from "../../../../vcl/source/weld/MetricSpinButton";
import { FieldUnit } from "../../../../tools/inc/fldunit";
/** Native dialog numeric owner;React owns only presentation and temporary text. */
export class ScMetricInputDlg {
  readonly value = new MetricSpinButton();
  private readonly defaultValue: bigint;
  private currentValue: bigint;
  /** Original metric dialog initialization including factory-provided digits and range. @param dialogName - Original dialog resource identity. @param current - Actual current dimension. @param defaultValue - Original default dimension. @param unit - Actual configured metric unit. @param decimals - Display digits. @param maximum - Maximum twips. @param minimum - Minimum twips. @returns Dialog model. */
  constructor(
    readonly dialogName: string,
    current: number,
    defaultValue: number,
    readonly unit: FieldUnit,
    readonly decimals: number,
    maximum: number,
    minimum: number,
  ) {
    this.value.set_unit(unit);
    this.value.set_digits(decimals);
    this.value.set_range(
      this.value.normalize(BigInt(minimum)),
      this.value.normalize(BigInt(maximum)),
      FieldUnit.TWIP,
    );
    this.value.set_value(this.value.normalize(BigInt(defaultValue)), FieldUnit.TWIP);
    this.defaultValue = this.value.get_value(FieldUnit.NONE);
    this.value.set_value(this.value.normalize(BigInt(current)), FieldUnit.TWIP);
    this.currentValue = this.value.get_value(FieldUnit.NONE);
  }
  /** Original ModifyHdl comparison also supplies initial checkbox state. @returns Default selected. */
  IsDefault(): boolean {
    return this.value.get_value(FieldUnit.NONE) === this.defaultValue;
  }
  /** Original SetDefValHdl preserves pre-toggle current value. @param active - User checkbox state. @returns Nothing. */
  SetDefValHdl(active: boolean): void {
    if (active) {
      this.currentValue = this.value.get_value(FieldUnit.NONE);
      this.value.set_value(this.defaultValue, FieldUnit.NONE);
    } else this.value.set_value(this.currentValue, FieldUnit.NONE);
  }
  /** Original GetInputValue denormalizes converted twips. @returns Integral twips. */
  GetInputValue(): number {
    return Number(this.value.denormalize(this.value.get_value(FieldUnit.TWIP)));
  }
}
