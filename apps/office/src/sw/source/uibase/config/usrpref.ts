/** @fileoverview Original Writer metric preference members and layout property projection;full SwMasterUsrPref/ConfigItem services remain unported. */
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { getSystemLocale } from "../../../../unotools/source/misc/syslocale";
import {
  getMeasurementSystemEnum,
  MeasurementSystem,
} from "../../../../unotools/source/i18n/localedatawrapper";
/** Actual SwLayoutViewConfig property names;absence retains original ruler fallback. */
export interface SwMetricConfigValues {
  readonly "Other/MeasureUnit"?: number;
  readonly "Window/HorizontalRulerUnit"?: number;
  readonly "Window/VerticalRulerUnit"?: number;
}
/** Consumed native preference members;JS owns object lifetime and the browser owns configuration transport. */
export class SwMasterUsrPref {
  private m_eUserMetric: FieldUnit;
  private m_eHScrollMetric: FieldUnit;
  private m_eVScrollMetric: FieldUnit;
  private m_bIsHScrollMetricSet = false;
  private m_bIsVScrollMetricSet = false;
  private metricModified = false;
  /** Source locale default followed by represented SwLayoutViewConfig load. @param values - Actual configuration property values. @returns Preferences. */
  constructor(values: SwMetricConfigValues = {}) {
    this.m_eUserMetric =
      getMeasurementSystemEnum(getSystemLocale()) === MeasurementSystem.Metric
        ? FieldUnit.CM
        : FieldUnit.INCH;
    this.m_eHScrollMetric = this.m_eUserMetric;
    this.m_eVScrollMetric = this.m_eUserMetric;
    this.LoadMetricProperties(values);
  }
  /** Original GetMetric. @returns User field unit. */
  GetMetric(): FieldUnit {
    return this.m_eUserMetric;
  }
  /** Original setter and represented modified bit. @param unit - User unit. @param noModify - Configuration-load path. @returns Nothing. */
  SetMetric(unit: FieldUnit, noModify = false): void {
    this.m_eUserMetric = unit;
    if (!noModify) this.metricModified = true;
  }
  /** Original explicit horizontal override flag. @returns Whether configured. */
  IsHScrollMetric(): boolean {
    return this.m_bIsHScrollMetricSet;
  }
  /** Original global-unit fallback. @returns Horizontal unit. */
  GetHScrollMetric(): FieldUnit {
    return this.m_bIsHScrollMetricSet ? this.m_eHScrollMetric : this.m_eUserMetric;
  }
  /** Original horizontal assignment. @param unit - User unit. @returns Nothing. */
  SetHScrollMetric(unit: FieldUnit): void {
    this.m_eHScrollMetric = unit;
    this.m_bIsHScrollMetricSet = true;
    this.metricModified = true;
  }
  /** Original explicit vertical override flag. @returns Whether configured. */
  IsVScrollMetric(): boolean {
    return this.m_bIsVScrollMetricSet;
  }
  /** Original global-unit fallback. @returns Vertical unit. */
  GetVScrollMetric(): FieldUnit {
    return this.m_bIsVScrollMetricSet ? this.m_eVScrollMetric : this.m_eUserMetric;
  }
  /** Original vertical assignment. @param unit - User unit. @returns Nothing. */
  SetVScrollMetric(unit: FieldUnit): void {
    this.m_eVScrollMetric = unit;
    this.m_bIsVScrollMetricSet = true;
    this.metricModified = true;
  }
  /** Source ordinary int32 property extraction and underlying UInt16 FieldUnit cast. @param values - Loaded fields. @returns Nothing. */
  LoadMetricProperties(values: SwMetricConfigValues): void {
    const metric = values["Other/MeasureUnit"],
      horizontal = values["Window/HorizontalRulerUnit"],
      vertical = values["Window/VerticalRulerUnit"];
    if (metric !== undefined) this.SetMetric(metric & 0xffff, true);
    if (horizontal !== undefined) {
      this.m_bIsHScrollMetricSet = true;
      this.m_eHScrollMetric = horizontal & 0xffff;
    }
    if (vertical !== undefined) {
      this.m_bIsVScrollMetricSet = true;
      this.m_eVScrollMetric = vertical & 0xffff;
    }
  }
  /** Original optional override values projected for the browser configuration boundary. @returns Native property values. */
  GetMetricProperties(): SwMetricConfigValues {
    return {
      "Other/MeasureUnit": this.GetMetric(),
      ...(this.m_bIsHScrollMetricSet
        ? { "Window/HorizontalRulerUnit": this.m_eHScrollMetric }
        : {}),
      ...(this.m_bIsVScrollMetricSet ? { "Window/VerticalRulerUnit": this.m_eVScrollMetric } : {}),
    };
  }
  /** Represented layout configuration dirty state. @returns Whether a metric setter modified configuration. */
  IsMetricModified(): boolean {
    return this.metricModified;
  }
  /** Acknowledges successful platform property persistence without a ConfigItem substitute. @returns Nothing. */
  ClearMetricModified(): void {
    this.metricModified = false;
  }
}
