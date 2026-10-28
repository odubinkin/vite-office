/** @fileoverview Original ICU78.3 unregistered-service Calendar factory path from calendar.cpp. All18 standard type branches are present. Static C++ functions live outside Calendar to avoid an ESM base/derived initialization cycle, as with the TimeZone factory split. */
import { Locale, type LocaleConstReference } from "../common/locid";
import { UErrorCode, U_FAILURE, U_SUCCESS } from "../common/unicode/utypes";
import { UnifiedCache, type CacheValueType } from "../common/unifiedcache";
import { Calendar } from "./calendar";
import { SharedCalendar } from "./sharedcalendar";
import { createDefault, forLocaleOrDefault } from "./timezone.default";
import type { TimeZone, TimeZoneConstReference } from "./timezone";
import { ECalType, getCalendarTypeForLocale } from "./calendar.type";
import { GregorianCalendar } from "./gregocal";
import { JapaneseCalendar } from "./japancal";
import { BuddhistCalendar } from "./buddhcal";
import { TaiwanCalendar } from "./taiwncal";
import { PersianCalendar } from "./persncal";
import {
  IslamicCalendar,
  IslamicCivilCalendar,
  IslamicTBLACalendar,
  IslamicRGSACalendar,
  IslamicUmalquraCalendar,
} from "./islamcal";
import { HebrewCalendar } from "./hebrwcal";
import { ChineseCalendar } from "./chnsecal";
import { IndianCalendar } from "./indiancal";
import { CopticCalendar } from "./coptccal";
import { EthiopicCalendar, EthiopicAmeteAlemCalendar } from "./ethpccal";
import { ISO8601Calendar } from "./iso8601cal";
import { DangiCalendar } from "./dangical";
/** Original complete createStandardCalendar switch. Only the original unknown enum default sets unsupported. @param type - Selected native enum. @param locale - Actual locale. @param status - Sticky status. @returns Calendar/null. */
export function createStandardCalendar(
  type: ECalType,
  locale: LocaleConstReference,
  status: [number],
): Calendar | null {
  if (U_FAILURE(status[0])) return null;
  switch (type) {
    case ECalType.CALTYPE_GREGORIAN:
      return new GregorianCalendar(locale, status);
    case ECalType.CALTYPE_JAPANESE:
      return new JapaneseCalendar(locale, status);
    case ECalType.CALTYPE_BUDDHIST:
      return new BuddhistCalendar(locale, status);
    case ECalType.CALTYPE_ROC:
      return new TaiwanCalendar(locale, status);
    case ECalType.CALTYPE_PERSIAN:
      return new PersianCalendar(locale, status);
    case ECalType.CALTYPE_ISLAMIC_TBLA:
      return new IslamicTBLACalendar(locale, status);
    case ECalType.CALTYPE_ISLAMIC_CIVIL:
      return new IslamicCivilCalendar(locale, status);
    case ECalType.CALTYPE_ISLAMIC_RGSA:
      return new IslamicRGSACalendar(locale, status);
    case ECalType.CALTYPE_ISLAMIC:
      return new IslamicCalendar(locale, status);
    case ECalType.CALTYPE_ISLAMIC_UMALQURA:
      return new IslamicUmalquraCalendar(locale, status);
    case ECalType.CALTYPE_HEBREW:
      return new HebrewCalendar(locale, status);
    case ECalType.CALTYPE_CHINESE:
      return new ChineseCalendar(locale, status);
    case ECalType.CALTYPE_INDIAN:
      return new IndianCalendar(locale, status);
    case ECalType.CALTYPE_COPTIC:
      return new CopticCalendar(locale, status);
    case ECalType.CALTYPE_ETHIOPIC:
      return new EthiopicCalendar(locale, status);
    case ECalType.CALTYPE_ETHIOPIC_AMETE_ALEM:
      return new EthiopicAmeteAlemCalendar(locale, status);
    case ECalType.CALTYPE_ISO8601:
      return new ISO8601Calendar(locale, status);
    case ECalType.CALTYPE_DANGI:
      return new DangiCalendar(locale, status);
    default:
      status[0] = UErrorCode.U_UNSUPPORTED_ERROR;
      return null;
  }
}
/** Original makeInstance path before any ICU service factory has been registered. Registration/indirect-service APIs are not exported by this binding. @param locale - Actual locale. @param status - Sticky status. @returns Calendar/null. */
export function makeInstance(locale: LocaleConstReference, status: [number]): Calendar | null {
  if (U_FAILURE(status[0])) return null;
  // Original local actualLoc is default-constructed even on the unregistered-service branch.
  new Locale();
  const calendar = createStandardCalendar(
    getCalendarTypeForLocale(locale.getName()),
    locale,
    status,
  );
  if (U_FAILURE(status[0]) || calendar === null) {
    if (U_SUCCESS(status[0])) status[0] = UErrorCode.U_INTERNAL_PROGRAM_ERROR;
    return null;
  }
  return calendar;
}
/** Original LocaleCacheKey<SharedCalendar>::createObject specialization. Template identity and name are explicit host bindings rather than a second calendar-selection mechanism. */
const sharedCalendarType: CacheValueType<SharedCalendar> = {
  identity: SharedCalendar,
  name: "N6icu_7814SharedCalendarE",
  /** Original retained wrapper creation. @param locale - Key's copied Locale. @param _context - Unused source context. @param status - Creation status. @returns Owned hard reference/null. */
  createObject(
    locale: LocaleConstReference,
    _context: unknown,
    status: [number],
  ): SharedCalendar | null {
    if (U_FAILURE(status[0])) return null;
    const calendar = makeInstance(locale, status);
    if (U_FAILURE(status[0])) return null;
    const shared = new SharedCalendar(calendar as Calendar);
    shared.addRef();
    return shared;
  },
};
/** Original status/default, locale and adopted-zone factory overloads. @param args - Source arguments. @returns Independently owned calendar/null. */
export function createInstance(
  ...args:
    | [status: [number]]
    | [locale: LocaleConstReference, status: [number]]
    | [zone: TimeZone | null, locale: LocaleConstReference, status: [number]]
): Calendar | null {
  if (args.length === 1) return createInstance(createDefault(), Locale.getDefault(), args[0]);
  if (args.length === 2) return createInstance(forLocaleOrDefault(args[0]), args[0], args[1]);
  const [zone, locale, status] = args,
    shared: [SharedCalendar | null] = [null];
  UnifiedCache.getByLocale(sharedCalendarType, locale, shared, status);
  if (U_FAILURE(status[0])) return null;
  const calendar = (shared[0] as SharedCalendar).get().clone();
  (shared[0] as SharedCalendar).removeRef();
  if (calendar === null) {
    status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
    return null;
  }
  calendar.adoptTimeZone(zone);
  calendar.setTime(Calendar.getNow(), status);
  return calendar;
}
/** Original const-reference overload first creates the locale/default-zone instance, then copies the supplied zone. @param zone - Borrowed const zone. @param args - Status or explicit locale/status. @returns Owned calendar/null. */
export function createInstanceFromZoneReference(
  zone: TimeZoneConstReference,
  ...args: [status: [number]] | [locale: LocaleConstReference, status: [number]]
): Calendar | null {
  const locale = args.length === 1 ? Locale.getDefault() : args[0],
    status = args.length === 1 ? args[0] : args[1],
    calendar = createInstance(locale, status);
  if (U_SUCCESS(status[0]) && calendar !== null) calendar.setTimeZone(zone);
  return calendar;
}
/** Original shared-cache type query retains strncpy and final-byte overflow detection. Positive readable capacities are the native defined binding domain. @param locale - Locale. @param buffer - Writable narrow output. @param capacity - Positive native capacity. @param status - Sticky status. @returns Nothing. */
export function getCalendarTypeFromLocale(
  locale: LocaleConstReference,
  buffer: Uint8Array,
  capacity: number,
  status: [number],
): void {
  const shared: [SharedCalendar | null] = [null];
  UnifiedCache.getByLocale(sharedCalendarType, locale, shared, status);
  if (U_FAILURE(status[0])) return;
  const type = (shared[0] as SharedCalendar).get().getType();
  for (let i = 0; i < capacity; ++i) buffer[i] = i < type.length ? type.charCodeAt(i) : 0;
  (shared[0] as SharedCalendar).removeRef();
  if (buffer[capacity - 1]) status[0] = UErrorCode.U_BUFFER_OVERFLOW_ERROR;
}
