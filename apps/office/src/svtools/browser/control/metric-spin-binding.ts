/** @fileoverview Persistent browser metric entry binding;actual VCL numeric state survives rounded twip feedback and React renders. */
import { MetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SetFieldUnit } from "../../source/misc/unitconv";
import { SV_FUNIT_STRINGS } from "../../../vcl/inc/units";
/** Actual assignments arriving from the parent native page and host locale. */
export interface MetricSpinConfiguration {
  readonly value: number | undefined;
  readonly unit: FieldUnit;
  readonly minimum: number;
  readonly maximum: number;
  readonly decimal: string;
  readonly alternate: string;
  readonly resetKey?: unknown;
}
/** Immutable browser projection of the persistent numeric/text owner. */
export interface MetricSpinSnapshot {
  readonly text: string;
  readonly value: number | undefined;
  readonly minimum: number;
  readonly maximum: number;
  readonly increments: readonly [bigint, bigint];
}
/** Owns one native numeric model plus its browser editable text;parent assignments remain distinct from value notifications. */
export class MetricSpinBinding {
  private readonly model = new MetricSpinButton();
  private readonly listeners = new Set<() => void>();
  private pendingFeedback: number | undefined;
  private defined: boolean;
  private text: string;
  private snapshot: MetricSpinSnapshot;
  /** Configures the native field once,then retains its normalized value across parent feedback. @param configuration - Initial physical assignment and display fields. @returns Binding. */
  constructor(private configuration: MetricSpinConfiguration) {
    this.model.set_digits(2);
    this.model.set_range(
      this.model.normalize(BigInt(configuration.minimum)),
      this.model.normalize(BigInt(configuration.maximum)),
      FieldUnit.TWIP,
    );
    SetFieldUnit(this.model, configuration.unit);
    this.defined = configuration.value !== undefined;
    if (configuration.value !== undefined) this.AssignValue(configuration.value);
    this.text = this.defined ? this.Format() : "";
    this.snapshot = this.Project();
  }
  /** Native normalized assignment is used only for actual parent assignment,not its rounded feedback. @param value - Physical twips. @returns Nothing. */
  private AssignValue(value: number): void {
    this.model.set_value(this.model.normalize(BigInt(Math.round(value))), FieldUnit.TWIP);
  }
  /** Formats represented native aliases/precision and locale decimal fields. @returns Entry text. */
  private Format(): string {
    const unit = this.model.get_unit(),
      suffix = SV_FUNIT_STRINGS.find(
        /** Finds original first unit alias. @param entry - Resource pair. @returns Whether matched. */ (
          entry,
        ) => entry[1] === unit,
      )?.[0],
      digits = this.model.get_digits();
    return (
      (Number(this.model.get_value(FieldUnit.NONE)) / 10 ** digits)
        .toFixed(digits)
        .replace(".", this.configuration.decimal) +
      (suffix === undefined
        ? ""
        : (unit === FieldUnit.INCH || unit === FieldUnit.NONE || unit === FieldUnit.DEGREE
            ? ""
            : " ") + suffix)
    );
  }
  /** Reads the exact current numeric state without feeding physical rounding back into it. @returns Stable snapshot contents. */
  private Project(): MetricSpinSnapshot {
    const scale = 10 ** this.model.get_digits(),
      range = this.model.get_range(FieldUnit.NONE);
    return {
      text: this.text,
      value: this.defined ? Number(this.model.get_value(FieldUnit.NONE)) / scale : undefined,
      minimum: Number(range[0]) / scale,
      maximum: Number(range[1]) / scale,
      increments: this.model.get_increments(FieldUnit.NONE),
    };
  }
  /** Publishes a new committed binding snapshot. @returns Nothing. */
  private Publish(): void {
    this.snapshot = this.Project();
    for (const listener of this.listeners) listener();
  }
  readonly Subscribe =
    /** Registers an actual external-store observer. @param listener - Observer. @returns Cleanup. */
    (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Removes the browser observer. @returns Nothing. */ () => {
        this.listeners.delete(listener);
      };
    };
  readonly GetSnapshot =
    /** Reads the stable cached projection. @returns Snapshot. */
    (): MetricSpinSnapshot => this.snapshot;
  /** Reconciles genuine source assignments,unit/range/locale changes and explicit Reset separately from notification feedback. @param next - Current source assignment. @returns Nothing. */
  Update(next: MetricSpinConfiguration): void {
    const previous = this.configuration,
      changedValue = previous.value !== next.value,
      changedUnit = previous.unit !== next.unit,
      changedRange = previous.minimum !== next.minimum || previous.maximum !== next.maximum,
      reset = previous.resetKey !== next.resetKey,
      changedLocale = previous.decimal !== next.decimal || previous.alternate !== next.alternate;
    if (!changedValue && !changedUnit && !changedRange && !reset && !changedLocale) return;
    if (
      changedValue &&
      next.value !== undefined &&
      next.value === this.pendingFeedback &&
      !changedUnit &&
      !changedRange &&
      !reset &&
      !changedLocale
    ) {
      this.configuration = next;
      this.pendingFeedback = undefined;
      return;
    }
    if (changedUnit) SetFieldUnit(this.model, next.unit);
    if (changedRange)
      this.model.set_range(
        this.model.normalize(BigInt(next.minimum)),
        this.model.normalize(BigInt(next.maximum)),
        FieldUnit.TWIP,
      );
    if (reset || (changedValue && next.value !== this.pendingFeedback)) {
      if (next.value !== undefined) this.AssignValue(next.value);
    }
    this.configuration = next;
    this.defined = next.value !== undefined;
    this.pendingFeedback = undefined;
    this.text = this.defined ? this.Format() : "";
    this.Publish();
  }
  /** Original native parsing retains invalid/incomplete text without changing the numeric value. @param text - Edited entry. @returns Physical value notification,if parsed. */
  SetText(text: string): number | undefined {
    this.text = text;
    const accepted = this.model.set_text(
      text,
      this.configuration.decimal,
      this.configuration.alternate,
    );
    const value = accepted
      ? Number(this.model.denormalize(this.model.get_value(FieldUnit.TWIP)))
      : undefined;
    if (accepted) {
      this.pendingFeedback = value;
      this.defined = true;
    }
    this.Publish();
    return value;
  }
  /** Native focus departure reformats the retained numeric value without a document mutation. @returns Nothing. */
  CommitText(): void {
    this.text = this.defined ? this.Format() : "";
    this.Publish();
  }
  /** Native step operates on the retained normalized numeric state after pending text parsing. @param direction - Step sign. @param page - Whole page increment selection. @returns Physical twip notification. */
  Step(direction: 1 | -1, page = false): number {
    this.model.set_text(this.text, this.configuration.decimal, this.configuration.alternate);
    const increments = this.model.get_increments(FieldUnit.NONE),
      increment = page ? increments[1] : increments[0];
    this.model.set_value(
      this.model.get_value(FieldUnit.NONE) + BigInt(direction) * increment,
      FieldUnit.NONE,
    );
    const value = Number(this.model.denormalize(this.model.get_value(FieldUnit.TWIP)));
    this.pendingFeedback = value;
    this.defined = true;
    this.text = this.Format();
    this.Publish();
    return value;
  }
}
