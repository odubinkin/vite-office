/** @fileoverview Original ScMetricInputDlg width initialization,default toggle and twip result over real shared MetricSpinButton. */
import { MetricSpinButton } from "../../../../vcl/source/weld/MetricSpinButton";
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { STD_COL_WIDTH, MAX_COL_WIDTH } from "../../../inc/global";
/** Native dialog numeric owner;React owns only presentation and temporary text. */
export class ScMetricInputDlg {
  readonly value = new MetricSpinButton();
  private readonly defaultValue: bigint;
  private currentValue: bigint;
  /** Native ColWidthDialog factory values including two digits and two-twip minimum. @param current - Actual current width. @param unit - Actual configured metric unit. @returns Dialog model. */
  constructor(
    current: number,
    readonly unit: FieldUnit,
  ) {
    this.value.set_unit(unit);
    this.value.set_digits(2);
    this.value.set_range(
      this.value.normalize(2n),
      this.value.normalize(BigInt(MAX_COL_WIDTH)),
      FieldUnit.TWIP,
    );
    this.value.set_value(this.value.normalize(BigInt(STD_COL_WIDTH)), FieldUnit.TWIP);
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
