/** @fileoverview Original LibreOffice Calendar_gregorian temporal service state and ICU interaction. Root Gregorian construction, system timezone, pending signed16 fields, offset remainders, era mapping and validation follow the pinned source. Display-name selection uses original locale resources; native-mode0 display strings use source field/name/era rules; nonzero native-number conversion remains unported. */
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Locale as ICULocale } from "../../../external/icu/source/common/locid";
import { U_SUCCESS } from "../../../external/icu/source/common/unicode/utypes";
import type { Calendar } from "../../../external/icu/source/i18n/calendar";
import { createInstance } from "../../../external/icu/source/i18n/calendar.factory";
import { createTimeZone } from "../../../external/icu/source/i18n/timezone.create";
import { UnicodeString } from "../../../external/icu/source/common/unistr";
import { UCalendarDateFields as F } from "../../../external/icu/source/i18n/unicode/ucal";
import * as Display from "../../../offapi/com/sun/star/i18n/CalendarDisplayCode";
import * as Reserved from "../../../offapi/com/sun/star/i18n/reservedWords";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayIndex";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { round } from "../../../sal/inc/rtl/math";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import {
  getLocaleCalendars,
  getLocaleTimeAM,
  getLocaleTimePM,
  getLocaleReservedWords,
  type LocaleCalendarData,
  type LocaleCalendarItemData,
} from "../localedata/localedata";
/** Source decimal %02 integer display for the unsigned16 calendar values. @param value - Calendar value. @param minimum - Minimum width. @returns Owned text. */
function displayInteger(value: number, minimum: number): OUString {
  const text = new OUString(OUString.number(value));
  if (text.getLength() >= minimum) return text;
  let buffer: OUStringBuffer | undefined;
  try {
    buffer = new OUStringBuffer();
    for (let index = 0; index < minimum - text.getLength(); ++index)
      buffer.append(Uint16Array.of(48));
    buffer.append(text);
    return buffer.makeStringAndClear();
  } finally {
    buffer?.dispose();
    text.dispose();
  }
}
/** Native temporary cleanup covers right-operand evaluation and buffer construction. @param first - Owned first value. @param produceSecond - Original right-operand evaluation. @returns Combined owner. */
function combineDisplay(first: OUString, produceSecond: () => OUString): OUString {
  let second: OUString | undefined, buffer: OUStringBuffer | undefined;
  try {
    second = produceSecond();
    buffer = new OUStringBuffer();
    buffer.append(first).append(second);
    return buffer.makeStringAndClear();
  } finally {
    buffer?.dispose();
    second?.dispose();
    first.dispose();
  }
}
/** Original Era fields consumed by temporal mapping. Display flags retain original aggregate initialization. */
export interface Era {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly flags?: number;
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
  /** Original display-name selection, including AM/PM ignoring nameType and YEAR returning empty. @param displayIndex - Signed16 category. @param index - Signed16 item index. @param nameType - Signed16 abbreviated/full/narrow selector. @returns Owned display name. */
  getDisplayName(displayIndex: number, index: number, nameType: number): OUString {
    displayIndex = int16(displayIndex);
    index = int16(index);
    nameType = int16(nameType);
    if (displayIndex === D.AM_PM) {
      if (index === 0) return unicode(getLocaleTimeAM(this.aLocale));
      if (index === 1) return unicode(getLocaleTimePM(this.aLocale));
      throw new RuntimeException();
    }
    if (displayIndex === D.YEAR) return new OUString();
    let items: readonly LocaleCalendarItemData[];
    switch (displayIndex) {
      case D.DAY:
        items = this.aCalendar.days;
        break;
      case D.MONTH:
        items = this.aCalendar.months;
        break;
      case D.GENITIVE_MONTH:
        items = this.aCalendar.genitiveMonths;
        break;
      case D.PARTITIVE_MONTH:
        items = this.aCalendar.partitiveMonths;
        break;
      case D.ERA:
        items = this.aCalendar.eras;
        break;
      default:
        throw new RuntimeException();
    }
    if (index >= items.length) throw new RuntimeException();
    if (nameType !== 0 && nameType !== 1 && (nameType !== 2 || displayIndex === D.ERA))
      throw new RuntimeException();
    // Source Sequence operator[] checks the lower bound when the selected name dereferences the item.
    if (index < 0) throw new Error("Sequence index assertion");
    const item = items[index] as LocaleCalendarItemData;
    return unicode(nameType === 0 ? item.abbreviated : nameType === 1 ? item.full : item.narrow);
  }
  /** Original represented native-mode0 display entry point; nonzero native-number conversion remains unported. @param code - Signed32 display code. @param native - Native mode0. @returns Owned text. */
  getDisplayString(code: number, native: 0): OUString {
    return this.getDisplayStringImpl(code, native, false);
  }
  /** Original display-code to field/name/numeric formatting for mode0, including source era combinations. @param code - Signed32 display code. @param _native - Represented native mode0. @param eraMode - Combined era/year context. @returns Owned text. */
  protected getDisplayStringImpl(code: number, _native: 0, eraMode: boolean): OUString {
    code |= 0;
    let field = C.AM_PM;
    switch (code) {
      case Display.SHORT_DAY:
      case Display.LONG_DAY:
        field = C.DAY_OF_MONTH;
        break;
      case Display.SHORT_DAY_NAME:
      case Display.LONG_DAY_NAME:
      case Display.NARROW_DAY_NAME:
        field = C.DAY_OF_WEEK;
        break;
      case Display.SHORT_MONTH:
      case Display.LONG_MONTH:
      case Display.SHORT_MONTH_NAME:
      case Display.LONG_MONTH_NAME:
      case Display.NARROW_MONTH_NAME:
      case Display.SHORT_GENITIVE_MONTH_NAME:
      case Display.LONG_GENITIVE_MONTH_NAME:
      case Display.NARROW_GENITIVE_MONTH_NAME:
      case Display.SHORT_PARTITIVE_MONTH_NAME:
      case Display.LONG_PARTITIVE_MONTH_NAME:
      case Display.NARROW_PARTITIVE_MONTH_NAME:
      case Display.SHORT_QUARTER:
      case Display.LONG_QUARTER:
        field = C.MONTH;
        break;
      case Display.SHORT_YEAR:
      case Display.LONG_YEAR:
      case Display.SHORT_YEAR_AND_ERA:
      case Display.LONG_YEAR_AND_ERA:
        field = C.YEAR;
        break;
      case Display.SHORT_ERA:
      case Display.LONG_ERA:
        field = C.ERA;
        break;
    }
    const value = this.getValue(field) & 65535;
    if (code === Display.SHORT_QUARTER || code === Display.LONG_QUARTER) {
      let quarter = Math.trunc(value / 3);
      if (quarter > 3) quarter = 3;
      quarter +=
        code === Display.SHORT_QUARTER ? Reserved.QUARTER1_ABBREVIATION : Reserved.QUARTER1_WORD;
      return unicode(getLocaleReservedWords(this.aLocale)[quarter] as string);
    }
    switch (code) {
      case Display.SHORT_MONTH:
        return new OUString(OUString.number(value + 1));
      case Display.SHORT_DAY:
        return new OUString(OUString.number(value));
      case Display.LONG_YEAR:
        return displayInteger(value, this.aCalendar.id === "gengou" ? 2 : 0);
      case Display.LONG_MONTH:
        return displayInteger(value + 1, 2);
      case Display.SHORT_YEAR:
        return value < 100 ||
          eraMode ||
          (this.eraArray !== null && (((this.eraArray[0] as Era).flags ?? 0) & 1) !== 0)
          ? new OUString(OUString.number(value))
          : displayInteger(value % 100, 2);
      case Display.LONG_DAY:
        return displayInteger(value, 2);
      case Display.SHORT_DAY_NAME:
        return this.getDisplayName(D.DAY, value, 0);
      case Display.LONG_DAY_NAME:
        return this.getDisplayName(D.DAY, value, 1);
      case Display.NARROW_DAY_NAME:
        return this.getDisplayName(D.DAY, value, 2);
      case Display.SHORT_MONTH_NAME:
        return this.getDisplayName(D.MONTH, value, 0);
      case Display.LONG_MONTH_NAME:
        return this.getDisplayName(D.MONTH, value, 1);
      case Display.NARROW_MONTH_NAME:
        return this.getDisplayName(D.MONTH, value, 2);
      case Display.SHORT_GENITIVE_MONTH_NAME:
        return this.getDisplayName(D.GENITIVE_MONTH, value, 0);
      case Display.LONG_GENITIVE_MONTH_NAME:
        return this.getDisplayName(D.GENITIVE_MONTH, value, 1);
      case Display.NARROW_GENITIVE_MONTH_NAME:
        return this.getDisplayName(D.GENITIVE_MONTH, value, 2);
      case Display.SHORT_PARTITIVE_MONTH_NAME:
        return this.getDisplayName(D.PARTITIVE_MONTH, value, 0);
      case Display.LONG_PARTITIVE_MONTH_NAME:
        return this.getDisplayName(D.PARTITIVE_MONTH, value, 1);
      case Display.NARROW_PARTITIVE_MONTH_NAME:
        return this.getDisplayName(D.PARTITIVE_MONTH, value, 2);
      case Display.SHORT_ERA:
        return this.getDisplayName(D.ERA, value, 0);
      case Display.LONG_ERA:
        return this.getDisplayName(D.ERA, value, 1);
      case Display.SHORT_YEAR_AND_ERA:
      case Display.LONG_YEAR_AND_ERA:
        return combineDisplay(
          this.getDisplayStringImpl(
            code === Display.SHORT_YEAR_AND_ERA ? Display.SHORT_ERA : Display.LONG_ERA,
            0,
            true,
          ),
          /** Evaluates the original right operand under left-temporary cleanup. @returns Owned right value. */ () =>
            this.getDisplayStringImpl(
              code === Display.SHORT_YEAR_AND_ERA ? Display.SHORT_YEAR : Display.LONG_YEAR,
              0,
              true,
            ),
        );
      default:
        throw new RuntimeException();
    }
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
/** Original ROC era data, including forced-long-year display flag. */
const ROC_eraArray: readonly Era[] = [
  { year: 1912, month: 1, day: 1, flags: 1 },
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
  /** Original Buddhist era/year ordering retains its historical short/long code selection. @param code - Display code. @param native - Represented native mode0. @returns Owned text. */
  override getDisplayString(code: number, native: 0): OUString {
    code |= 0;
    if (
      (code === Display.LONG_YEAR_AND_ERA || code === Display.SHORT_YEAR_AND_ERA) &&
      this.getValue(C.ERA) === 0
    )
      return combineDisplay(
        this.getDisplayStringImpl(
          code === Display.LONG_YEAR_AND_ERA ? Display.SHORT_YEAR : Display.LONG_YEAR,
          native,
          true,
        ),
        /** Evaluates the original right operand under left-temporary cleanup. @returns Owned right value. */ () =>
          this.getDisplayStringImpl(
            code === Display.LONG_YEAR_AND_ERA ? Display.SHORT_ERA : Display.LONG_ERA,
            native,
            true,
          ),
      );
    return super.getDisplayString(code, native);
  }
}
/** Original Hanja service uses the Gregorian temporal implementation. */
export class Calendar_hanja extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_hanja";
  }
  /** Original Hanja AM/PM names come from Japanese locale data. @param displayIndex - Signed16 category. @param index - Signed16 item index. @param nameType - Name selector. @returns Owned name. */
  override getDisplayName(displayIndex: number, index: number, nameType: number): OUString {
    if (int16(displayIndex) !== D.AM_PM) return super.getDisplayName(displayIndex, index, nameType);
    const language = unicode("ja"),
      empty = new OUString(),
      locale = new Locale(language, empty, empty);
    try {
      if (int16(index) === 0) return unicode(getLocaleTimeAM(locale));
      if (int16(index) === 1) return unicode(getLocaleTimePM(locale));
      throw new RuntimeException();
    } finally {
      locale.dispose();
      empty.dispose();
      language.dispose();
    }
  }
}
/** Original Hanja weekday-name specialization shares the Gregorian temporal implementation. */
export class Calendar_hanja_yoil extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_hanja_yoil";
  }
  /** Original Hanja AM/PM names come from Japanese locale data. @param displayIndex - Signed16 category. @param index - Signed16 item index. @param nameType - Name selector. @returns Owned name. */
  override getDisplayName(displayIndex: number, index: number, nameType: number): OUString {
    if (int16(displayIndex) !== D.AM_PM) return super.getDisplayName(displayIndex, index, nameType);
    const language = unicode("ja"),
      empty = new OUString(),
      locale = new Locale(language, empty, empty);
    try {
      if (int16(index) === 0) return unicode(getLocaleTimeAM(locale));
      if (int16(index) === 1) return unicode(getLocaleTimePM(locale));
      throw new RuntimeException();
    } finally {
      locale.dispose();
      empty.dispose();
      language.dispose();
    }
  }
}
