/** @fileoverview Source ScOptionsUtil measurement query using the existing browser system-locale field binding. */
import { getSystemLocale } from "../../../../unotools/source/misc/syslocale";
import {
  getMeasurementSystemEnum,
  MeasurementSystem,
} from "../../../../unotools/source/i18n/localedatawrapper";
/** Actual source option helper;configuration-link/service responsibilities remain separate. */
export const ScOptionsUtil = {
  /** Original non-fuzzing measurement predicate. @returns Metric setting. */
  IsMetricSystem(): boolean {
    return getMeasurementSystemEnum(getSystemLocale()) === MeasurementSystem.Metric;
  },
};
