/** @fileoverview Actual ICU calendar constructors shared only by independent native test/witness callers. */
import { Locale } from "../external/icu/source/common/locid";
import type { Calendar } from "../external/icu/source/i18n/calendar";
import { GregorianCalendar } from "../external/icu/source/i18n/gregocal";
import { BuddhistCalendar } from "../external/icu/source/i18n/buddhcal";
import { TaiwanCalendar } from "../external/icu/source/i18n/taiwncal";
import { ISO8601Calendar } from "../external/icu/source/i18n/iso8601cal";
import { CopticCalendar } from "../external/icu/source/i18n/coptccal";
import { EthiopicCalendar, EthiopicAmeteAlemCalendar } from "../external/icu/source/i18n/ethpccal";
import { PersianCalendar } from "../external/icu/source/i18n/persncal";
import { IndianCalendar } from "../external/icu/source/i18n/indiancal";
import { ChineseCalendar } from "../external/icu/source/i18n/chnsecal";
import { DangiCalendar } from "../external/icu/source/i18n/dangical";
import {
  IslamicCalendar,
  IslamicCivilCalendar,
  IslamicTBLACalendar,
  IslamicRGSACalendar,
  IslamicUmalquraCalendar,
} from "../external/icu/source/i18n/islamcal";
import { JapaneseCalendar } from "../external/icu/source/i18n/japancal";
import { HebrewCalendar } from "../external/icu/source/i18n/hebrwcal";
export const standardCalendarClasses: readonly (new (
  locale: Locale,
  status: [number],
) => Calendar)[] = [
  GregorianCalendar,
  BuddhistCalendar,
  TaiwanCalendar,
  ISO8601Calendar,
  CopticCalendar,
  EthiopicCalendar,
  EthiopicAmeteAlemCalendar,
  PersianCalendar,
  IndianCalendar,
  HebrewCalendar,
  JapaneseCalendar,
  IslamicCalendar,
  IslamicCivilCalendar,
  IslamicTBLACalendar,
  IslamicRGSACalendar,
  IslamicUmalquraCalendar,
  ChineseCalendar,
  DangiCalendar,
];
