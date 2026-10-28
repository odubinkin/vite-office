/** @fileoverview Original LibreOffice Calendar_gregorian temporal service state and ICU interaction. Root Gregorian construction, system timezone, pending signed16 fields, offset remainders, era mapping and validation follow the pinned source. Display/native-number formatting is a separate unconsumed responsibility. */
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Locale as ICULocale } from "../../../external/icu/source/common/locid";
import { U_SUCCESS } from "../../../external/icu/source/common/unicode/utypes";
import type { Calendar } from "../../../external/icu/source/i18n/calendar";
import { createInstance } from "../../../external/icu/source/i18n/calendar.factory";
import { createTimeZone } from "../../../external/icu/source/i18n/timezone.create";
import { UnicodeString } from "../../../external/icu/source/common/unistr";
import { UCalendarDateFields as F } from "../../../external/icu/source/i18n/unicode/ucal";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { round } from "../../../sal/inc/rtl/math";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  getLocaleCalendars,
  type LocaleCalendarData,
  type LocaleCalendarItemData,
} from "../localedata/localedata";
/** Original Era fields consumed by temporal mapping. Display flags are not consumed here. */
export interface Era {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}
/** Original signed16 scalar boundary. @param value - Input. @returns Signed16 value. */
function int16(value: number): number {
  return (value << 16) >> 16;
}
/** Original fieldNameConverter, including rejection of the two remainder pseudo-fields. @param field - Native field index. @returns ICU field. */
function fieldNameConverter(field: number): F {
  const fields = [
    F.UCAL_AM_PM,
    F.UCAL_DATE,
    F.UCAL_DAY_OF_WEEK,
    F.UCAL_DAY_OF_YEAR,
    F.UCAL_DST_OFFSET,
    F.UCAL_HOUR_OF_DAY,
    F.UCAL_MINUTE,
    F.UCAL_SECOND,
    F.UCAL_MILLISECOND,
    F.UCAL_WEEK_OF_MONTH,
    F.UCAL_WEEK_OF_YEAR,
    F.UCAL_YEAR,
    F.UCAL_MONTH,
    F.UCAL_ERA,
    F.UCAL_ZONE_OFFSET,
  ];
  if (field < 0 || field >= fields.length) throw new RuntimeException();
  return fields[field] as F;
}
/** Actual Gregorian temporal service owner; fieldSetValue is the source submission buffer, not an alternate calendar state. */
export class Calendar_gregorian {
  protected cCalendar = "com.sun.star.i18n.Calendar_gregorian";
  protected readonly body: Calendar;
  protected readonly fieldValue = new Int16Array(C.FIELD_COUNT2);
  protected readonly fieldSetValue = new Int16Array(C.FIELD_COUNT2);
  protected fieldSet = 0;
  protected readonly aLocale = new Locale();
  protected aCalendar: Omit<LocaleCalendarData, "minimumDays"> & { minimumDays: number } = {
    id: "",
    isDefault: false,
    startOfWeek: "",
    minimumDays: 0,
    days: [],
    months: [],
    genitiveMonths: [],
    partitiveMonths: [],
    eras: [],
  };
  /** Original default/era-array construction, using the source root keyword and the actual ICU cached factory. @param eraArray - Source era array/null. @returns Service owner. */
  constructor(protected readonly eraArray: readonly Era[] | null = null) {
    const locale = new ICULocale("", null, null, "calendar=gregorian"),
      status: [number] = [0],
      body = createInstance(locale, status);
    if (body === null || !U_SUCCESS(status[0])) throw new RuntimeException();
    this.body = body;
  }
  /** Original locale member destruction; actual ICU objects are garbage-collected after the service owner is released. @returns Nothing. */
  dispose(): void {
    this.aLocale.dispose();
  }
  /** Original load first materializes fields, then copies locale/calendar data and installs week settings. @param id - Calendar ID. @param locale - Locale. @returns Nothing. */
  loadCalendar(id: OUStringConstReference, locale: LocaleConstReference): void {
    this.getFields();
    this.aLocale.assign(locale);
    for (const calendar of getLocaleCalendars(locale))
      if (text(id) === calendar.id) {
        this.aCalendar = { ...calendar };
        this.setMinimumNumberOfDaysForFirstWeek(calendar.minimumDays);
        for (let day = calendar.days.length - 1; day >= 0; --day)
          if (calendar.startOfWeek === (calendar.days[day] as LocaleCalendarItemData).id) {
            this.setFirstDayOfWeek(day);
            return;
          }
      }
    throw new RuntimeException();
  }
  /** Original copied loaded Calendar2 scalar data view used by the wrapper's name binding. @returns Calendar data. */
  getLoadedCalendar2(): LocaleCalendarData {
    return { ...this.aCalendar };
  }
  /** Original unique ID is the loaded data ID, even when CalendarImpl used its Gregorian-service fallback. @returns Owned ID. */
  getUniqueID(): OUString {
    return unicode(this.aCalendar.id);
  }
  /** Original milliseconds conversion uses RTL corrected round before ICU setTime. @param days - UTC days since1970. @returns Nothing. */
  setDateTime(days: number): void {
    const status: [number] = [0];
    this.body.setTime(round(days * 86400000), status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    this.getFields();
  }
  /** Original pending-field submission before UTC query. @returns UTC days. */
  getDateTime(): number {
    if (this.fieldSet) {
      this.setFields();
      this.getFields();
    }
    const status: [number] = [0],
      value = this.body.getTime(status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    return value / 86400000;
  }
  /** Original local wall-time conversion asks the actual timezone using local=true before subtracting offsets. @param days - Local days since1970. @returns Nothing. */
  setLocalDateTime(days: number): void {
    const millis = round(days * 86400000),
      raw: [number] = [0],
      dst: [number] = [0],
      status: [number] = [0];
    this.body.getTimeZone().getOffset(millis, true, raw, dst, status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    status[0] = 0;
    this.body.setTime(millis - ((raw[0] + dst[0]) | 0), status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    this.getFields();
  }
  /** Original local query adds completed ICU zone/DST fields to stored UTC. @returns Local days. */
  getLocalDateTime(): number {
    if (this.fieldSet) {
      this.setFields();
      this.getFields();
    }
    const status: [number] = [0],
      time = this.body.getTime(status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    status[0] = 0;
    const raw = this.body.get(F.UCAL_ZONE_OFFSET, status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    status[0] = 0;
    const dst = this.body.get(F.UCAL_DST_OFFSET, status);
    if (!U_SUCCESS(status[0])) throw new RuntimeException();
    return (time + ((raw + dst) | 0)) / 86400000;
  }
  /** Original timezone change submits pending fields first and copies the created zone, without refreshing the field cache. @param id - Native Unicode zone ID. @returns Whether a zone was created. */
  setTimeZone(id: OUStringConstReference): boolean {
    if (this.fieldSet) {
      this.setFields();
      this.getFields();
    }
    const zone = createTimeZone(new UnicodeString(text(id)));
    if (zone === null) return false;
    this.body.setTimeZone(zone);
    return true;
  }
  /** Original short setter records only the pending bit and signed16 value. @param field - Field index. @param value - Signed16 input. @returns Nothing. */
  setValue(field: number, value: number): void {
    field = int16(field);
    if (field < 0 || field >= C.FIELD_COUNT2) throw new RuntimeException();
    this.fieldSet |= 1 << field;
    this.fieldValue[field] = int16(value);
  }
  /** Original cached getter resolves all pending fields together. @param field - Signed16 index. @returns Signed16 field. */
  getValue(field: number): number {
    field = int16(field);
    if (field < 0 || field >= C.FIELD_COUNT2) throw new RuntimeException();
    if (this.fieldSet) {
      this.setFields();
      this.getFields();
    }
    return this.fieldValue[field] as number;
  }
  /** Original pending-field validation compares only originally requested fields after normalization. @returns Whether requested fields survive unchanged. */
  isValid(): boolean {
    if (this.fieldSet) {
      const saved = this.fieldSet;
      this.setFields();
      this.fieldSetValue.set(this.fieldValue);
      this.getFields();
      for (let i = 0; i < C.FIELD_COUNT2; ++i)
        if (saved & (1 << i) && this.fieldSetValue[i] !== this.fieldValue[i]) return false;
    }
    return true;
  }
  /** Original public week getter converts Sunday1 to Sunday0 and clamps underflow. @returns Day. */
  getFirstDayOfWeek(): number {
    return Math.max(0, int16(int16(this.body.getFirstDayOfWeek()) - 1));
  }
  /** Original public week setter converts Sunday0 to Sunday1. @param day - Signed16 day. @returns Nothing. */
  setFirstDayOfWeek(day: number): void {
    this.body.setFirstDayOfWeek(int16(day) + 1);
  }
  /** Original minimum-days setter keeps the requested signed16 scalar separately from ICU's narrowed/clamped byte. @param days - Signed16 request. @returns Nothing. */
  setMinimumNumberOfDaysForFirstWeek(days: number): void {
    days = int16(days);
    this.aCalendar.minimumDays = days;
    this.body.setMinimalDaysInFirstWeek(days & 255);
  }
  /** Original loaded scalar query. @returns Signed16 request. */
  getMinimumNumberOfDaysForFirstWeek(): number {
    return this.aCalendar.minimumDays;
  }
  /** Original loaded-month count. @returns Count. */
  getNumberOfMonthsInYear(): number {
    return int16(this.aCalendar.months.length);
  }
  /** Original loaded-weekday count. @returns Count. */
  getNumberOfDaysInWeek(): number {
    return int16(this.aCalendar.days.length);
  }
  /** Original combined offset reads pending fieldValue, including unsigned absolute millisecond remainder and inherited sign. @param output - Signed32 millis output. @param parent - Minute field. @param child - Remainder field. @returns Whether any offset component was pending. */
  protected getCombinedOffset(output: [number], parent: number, child: number): boolean {
    let set = false;
    output[0] = 0;
    if (this.fieldSet & (1 << parent)) {
      set = true;
      output[0] = (this.fieldValue[parent] as number) * 60000;
    }
    if (this.fieldSet & (1 << child)) {
      set = true;
      const value = (this.fieldValue[child] as number) & 65535;
      output[0] = output[0] < 0 ? output[0] - value : output[0] + value;
    }
    return set;
  }
  /** Original submission order is native index order followed by the two combined offsets. @returns Nothing. */
  protected submitFields(): void {
    for (let i = 0; i < C.FIELD_COUNT2; ++i)
      if (this.fieldSet & (1 << i)) {
        if (
          i === C.ZONE_OFFSET ||
          i === C.DST_OFFSET ||
          i === C.ZONE_OFFSET_SECOND_MILLIS ||
          i === C.DST_OFFSET_SECOND_MILLIS
        )
          continue;
        this.body.set(fieldNameConverter(i), this.fieldSetValue[i] as number);
      }
    const raw: [number] = [0],
      dst: [number] = [0];
    if (this.getCombinedOffset(raw, C.ZONE_OFFSET, C.ZONE_OFFSET_SECOND_MILLIS))
      this.body.set(F.UCAL_ZONE_OFFSET, raw[0]);
    if (this.getCombinedOffset(dst, C.DST_OFFSET, C.DST_OFFSET_SECOND_MILLIS))
      this.body.set(F.UCAL_DST_OFFSET, dst[0]);
  }
  /** Original private setValue() copies fields before era mapping and submission. @returns Nothing. */
  protected setFields(): void {
    this.fieldSetValue.set(this.fieldValue);
    this.mapToGregorian();
    this.submitFields();
  }
  /** Original private getValue() materializes all17 fields, splits historical offsets, maps eras and only then clears pending bits. @returns Nothing. */
  protected getFields(): void {
    for (let i = 0; i < C.FIELD_COUNT2; ++i) {
      if (i === C.ZONE_OFFSET_SECOND_MILLIS || i === C.DST_OFFSET_SECOND_MILLIS) continue;
      const status: [number] = [0],
        value = this.body.get(fieldNameConverter(i), status);
      if (!U_SUCCESS(status[0])) throw new RuntimeException();
      if (i === C.ZONE_OFFSET || i === C.DST_OFFSET) {
        const minutes = Math.trunc(value / 60000),
          millis = int16(Math.abs(value - minutes * 60000) & 65535);
        this.fieldValue[i] = minutes;
        this.fieldValue[
          i === C.ZONE_OFFSET ? C.ZONE_OFFSET_SECOND_MILLIS : C.DST_OFFSET_SECOND_MILLIS
        ] = millis;
      } else this.fieldValue[i] = value;
      if (i === C.DAY_OF_WEEK) this.fieldValue[i] = (this.fieldValue[i] as number) - 1;
    }
    this.mapFromGregorian();
    this.fieldSet = 0;
  }
  /** Original optional era-array projection from Gregorian fields, retaining unsigned16 year interpretation. @returns Nothing. */
  protected mapFromGregorian(): void {
    if (this.eraArray === null) return;
    let era = this.fieldValue[C.ERA] as number,
      year = (this.fieldValue[C.YEAR] as number) & 65535;
    const month = (this.fieldValue[C.MONTH] as number) + 1,
      day = this.fieldValue[C.DAY_OF_MONTH] as number;
    if (era === 0) year = 1 - year;
    for (era = 0; (this.eraArray[era] as Era).year; ++era) {
      const start = this.eraArray[era] as Era;
      if (
        year !== start.year
          ? year < start.year
          : month !== start.month
            ? month < start.month
            : day < start.day
      )
        break;
    }
    this.fieldValue[C.ERA] = era;
    this.fieldValue[C.YEAR] =
      era === 0
        ? (this.eraArray[0] as Era).year - year
        : year - (this.eraArray[era - 1] as Era).year + 1;
  }
  /** Original optional era-array mapping writes only the submission buffer and sets both era/year bits. @returns Nothing. */
  protected mapToGregorian(): void {
    const mask = (1 << C.ERA) | (1 << C.YEAR);
    if (this.eraArray === null || !(this.fieldSet & mask)) return;
    const era = this.fieldValue[C.ERA] as number,
      year =
        era === 0
          ? (this.eraArray[0] as Era).year - ((this.fieldValue[C.YEAR] as number) & 65535)
          : (this.eraArray[era - 1] as Era).year +
            (int16((this.fieldValue[C.YEAR] as number) - 1) & 65535);
    this.fieldSetValue[C.ERA] = year <= 0 ? 0 : 1;
    this.fieldSetValue[C.YEAR] = year <= 0 ? 1 - year : year;
    this.fieldSet |= mask;
  }
}

/** Original Japanese era starts, including the terminating zero row. */
const gengou_eraArray: readonly Era[] = [
  { year: 1868, month: 1, day: 1 },
  { year: 1912, month: 7, day: 30 },
  { year: 1926, month: 12, day: 25 },
  { year: 1989, month: 1, day: 8 },
  { year: 2019, month: 5, day: 1 },
  { year: 0, month: 0, day: 0 },
];
/** Original ROC temporal era data; display flags belong to the display responsibility. */
const ROC_eraArray: readonly Era[] = [
  { year: 1912, month: 1, day: 1 },
  { year: 0, month: 0, day: 0 },
];
/** Original Dangi solar-era data (distinct from ICU's lunisolar Dangi class). */
const dangi_eraArray: readonly Era[] = [
  { year: -2332, month: 1, day: 1 },
  { year: 0, month: 0, day: 0 },
];
/** Original Buddhist solar-era data. */
const buddhist_eraArray: readonly Era[] = [
  { year: -542, month: 1, day: 1 },
  { year: 0, month: 0, day: 0 },
];
/** Original Japanese calendar service's temporal specialization. */
export class Calendar_gengou extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super(gengou_eraArray);
    this.cCalendar = "com.sun.star.i18n.Calendar_gengou";
  }
}
/** Original Republic of China service's temporal specialization. */
export class Calendar_ROC extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super(ROC_eraArray);
    this.cCalendar = "com.sun.star.i18n.Calendar_ROC";
  }
}
/** Original Dangi service's temporal specialization. */
export class Calendar_dangi extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super(dangi_eraArray);
    this.cCalendar = "com.sun.star.i18n.Calendar_dangi";
  }
}
/** Original Buddhist service's temporal specialization. */
export class Calendar_buddhist extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super(buddhist_eraArray);
    this.cCalendar = "com.sun.star.i18n.Calendar_buddhist";
  }
}
/** Original Hanja service uses the Gregorian temporal implementation. */
export class Calendar_hanja extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_hanja";
  }
}
/** Original Hanja weekday-name specialization shares the Gregorian temporal implementation. */
export class Calendar_hanja_yoil extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_hanja_yoil";
  }
}
