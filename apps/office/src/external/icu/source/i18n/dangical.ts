/** @fileoverview Original ICU78.3 DangiCalendar and its rule-based astronomical timezone from dangical.cpp. Original approximate transition epochs and the 1897 offset exception are retained. */
import type { LocaleConstReference } from "../common/locid";
import { UnicodeString } from "../common/unistr";
import { U_FAILURE } from "../common/unicode/utypes";
import { ChineseCalendar } from "./chnsecal";
import { CalendarCache } from "./astro";
import { RuleBasedTimeZone } from "./rbtz";
import { InitialTimeZoneRule, TimeArrayTimeZoneRule } from "./tzrule";
import { TimeRuleType } from "./dtrule";
import type { Setting } from "./chnsecal.astronomy";
const gWinterSolsticeCache: [CalendarCache | null] = [null],
  gNewYearCache: [CalendarCache | null] = [null];
let gAstronomerTimeZone: RuleBasedTimeZone | null = null;
/** Original lazy astronomical-zone initialization. @param status - Sticky status. @returns Actual shared zone/null. */
function getAstronomerTimeZone(status: [number]): RuleBasedTimeZone | null {
  if (U_FAILURE(status[0]) || gAstronomerTimeZone !== null) return gAstronomerTimeZone;
  const t1897 = [(1897 - 1970) * 365 * 86400000],
    t1898 = [(1898 - 1970) * 365 * 86400000],
    t1912 = [(1912 - 1970) * 365 * 86400000];
  const initial = new InitialTimeZoneRule(new UnicodeString("GMT+8"), 28800000, 0);
  const r1897 = new TimeArrayTimeZoneRule(
    new UnicodeString("Korean 1897"),
    25200000,
    0,
    t1897,
    1,
    TimeRuleType.STANDARD_TIME,
  );
  const r1898 = new TimeArrayTimeZoneRule(
    new UnicodeString("Korean 1898-1911"),
    28800000,
    0,
    t1898,
    1,
    TimeRuleType.STANDARD_TIME,
  );
  const r1912 = new TimeArrayTimeZoneRule(
    new UnicodeString("Korean 1912-"),
    32400000,
    0,
    t1912,
    1,
    TimeRuleType.STANDARD_TIME,
  );
  const zone = new RuleBasedTimeZone(new UnicodeString("KOREA_ZONE"), initial);
  if (U_FAILURE(status[0])) return null;
  zone.addTransitionRule(r1897, status);
  zone.addTransitionRule(r1898, status);
  zone.addTransitionRule(r1912, status);
  zone.complete(status);
  if (!U_FAILURE(status[0])) gAstronomerTimeZone = zone;
  return gAstronomerTimeZone;
}
/** Original Dangi subtype shares Chinese arithmetic but supplies independent astronomical settings. */
export class DangiCalendar extends ChineseCalendar {
  /** Original locale or copy construction. @param locale - Locale/source. @param status - Locale-construction status. @returns Owner. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Retain the pinned upstream statement/constructor and its source boundary.
  constructor(locale: LocaleConstReference | DangiCalendar, status?: [number]) {
    super(locale, status);
  }
  /** Original dynamic clone. @returns Copy. */
  override clone(): DangiCalendar {
    return new DangiCalendar(this);
  }
  /** Original type. @returns Type. */
  override getType(): string {
    return "dangi";
  }
  /** Original per-class astronomical zone and cache pointers. @param status - Sticky status. @returns Settings. */
  protected override getSetting(status: [number]): Setting {
    return {
      zoneAstroCalc: getAstronomerTimeZone(status),
      winterSolsticeCache: gWinterSolsticeCache,
      newYearCache: gNewYearCache,
    };
  }
}
