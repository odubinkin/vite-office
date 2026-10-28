/** @fileoverview Compares LibreOffice temporal service method bodies extracted unchanged from the pinned source with the local providers, linked against unchanged ICU78.3. Minimal UNO scalar declarations and a round binding isolate integral-millisecond temporal/field cases; locale-data service registration, native ABI/display and fractional rounding are outside this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as G from "../apps/office/src/i18npool/source/calendar/calendar_gregorian.ts";
import { Calendar_hijri } from "../apps/office/src/i18npool/source/calendar/calendar_hijri.ts";
import { Calendar_jewish } from "../apps/office/src/i18npool/source/calendar/calendar_jewish.ts";
import * as C from "../apps/office/src/offapi/com/sun/star/i18n/CalendarFieldIndex.ts";
import { unicode } from "../apps/office/src/i18nlangtag/source/isolang/isolang.tables.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  icu = resolve("vendor/icu-reference/source"),
  lo = resolve("vendor/libreoffice-reference/i18npool/source/calendar");
const g = readFileSync(`${lo}/calendar_gregorian.cxx`, "utf8"),
  h = readFileSync(`${lo}/calendar_hijri.cxx`, "utf8"),
  j = readFileSync(`${lo}/calendar_jewish.cxx`, "utf8");
/** Extracts an exact source slice, failing if either anchor is absent. @param text - Original file. @param first - Start anchor. @param last - End anchor. @returns Unchanged source substring. */
function slice(text, first, last) {
  const a = text.indexOf(first),
    b = text.indexOf(last, a + first.length);
  if (a < 0 || b < 0) throw Error(`Missing source anchors: ${first}, ${last}`);
  return text.slice(a, b);
}
const cxx =
  String.raw`
#include "unicode/calendar.h"
#include "unicode/timezone.h"
#include "unicode/putil.h"
#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <algorithm>
#include <cmath>
#include <cassert>
using sal_Int16=int16_t;using sal_uInt16=uint16_t;using sal_Int32=int32_t;using sal_Bool=bool;
#define SAL_CALL
#define SAL_MAX_INT16 INT16_MAX
#define SAL_MIN_INT16 INT16_MIN
#define SAL_INFO_IF(...)
#define DUMP_ICU_CAL_MSG(...)
#define DUMP_I18N_CAL_MSG(...)
#define erDUMP_ICU_CALENDAR 0
#define erDUMP_I18N_CALENDAR 0
namespace sal{template<typename T,typename U>T static_int_cast(U v){return static_cast<T>(v);}}
namespace tools{using Long=int64_t;}
namespace basegfx{template<int DegMultiple=1>constexpr double deg2rad(double v){return v/(90.0*DegMultiple)*M_PI_2;}}
namespace i18nutil{constexpr double monthDaysWithoutJanFeb=(365-31-28)/10.0;}
namespace rtl::math{double round(double v){return std::round(v);}}
constexpr sal_Int16 FIELD_INDEX_COUNT=17;
struct RuntimeException{};
std::u16string operator""_ustr(const char16_t*s,size_t n){return {s,n};}
struct OUString{std::u16string value;const char16_t*getStr()const{return value.data();}int getLength()const{return value.size();}};
namespace CalendarFieldIndex{` +
  Object.entries(C)
    .map(
      /** Emits one exact IDL scalar in the native witness. @param entry - Name/value entry. @returns Declaration. */ ([
        k,
        v,
      ]) => `constexpr sal_Int16 ${k}=${v};`,
    )
    .join("\n") +
  String.raw`}
struct Era{int year,month,day,flags;};
struct Calendar_gregorian{
std::unique_ptr<icu::Calendar>body;sal_Int16 fieldValue[17]{},fieldSetValue[17]{};sal_Int32 fieldSet=0;const Era*eraArray;std::u16string cCalendar;
Calendar_gregorian(const Era*e=nullptr):eraArray(e){UErrorCode s=U_ZERO_ERROR;icu::Locale l("",nullptr,nullptr,"calendar=gregorian");body.reset(icu::Calendar::createInstance(l,s));if(!body||!U_SUCCESS(s))throw RuntimeException();}
virtual ~Calendar_gregorian()=default;
void setDateTime(double);double getDateTime();void setLocalDateTime(double);double getLocalDateTime();bool setTimeZone(const OUString&);
virtual void mapFromGregorian();virtual void mapToGregorian();void setValue(sal_Int16,sal_Int16);sal_Int16 getValue(sal_Int16);void setValue();void getValue();void submitFields();
bool getCombinedOffset(sal_Int32&,sal_Int16,sal_Int16)const;bool getZoneOffset(sal_Int32&)const;bool getDSTOffset(sal_Int32&)const;bool isValid();
};
struct Calendar_hijri:Calendar_gregorian{Calendar_hijri();void mapFromGregorian()override;void mapToGregorian()override;double NewMoon(sal_Int32);void getHijri(sal_Int32*,sal_Int32*,sal_Int32*);void ToGregorian(sal_Int32*,sal_Int32*,sal_Int32*);void getGregorianDay(sal_Int32,sal_Int32*,sal_Int32*,sal_Int32*);sal_Int32 getJulianDay(sal_Int32,sal_Int32,sal_Int32);};
struct Calendar_jewish:Calendar_gregorian{Calendar_jewish();void mapFromGregorian()override;void mapToGregorian()override;};
constexpr int kDisplayEraForcedLongYear=1;
` +
  slice(g, "static inline sal_Int16 cast32To16", "Calendar_gregorian::Calendar_gregorian()") +
  ["gengou", "ROC", "dangi", "buddhist"]
    .map(
      /** Extracts original era data. @param name - Original array prefix. @returns Unchanged source. */ (
        name,
      ) =>
        slice(
          g,
          `const Era ${name}_eraArray[]`,
          `Calendar_${name === "gengou" ? "gengou" : name}::Calendar_`,
        ),
    )
    .join("\n") +
  slice(
    g,
    "void SAL_CALL\nCalendar_gregorian::setDateTime",
    "// map field value from gregorian calendar",
  ) +
  slice(
    g,
    "void Calendar_gregorian::mapFromGregorian()",
    "void SAL_CALL\nCalendar_gregorian::addValue",
  ) +
  slice(g, "sal_Bool SAL_CALL\nCalendar_gregorian::isValid()", "// NativeNumberMode") +
  "#undef FIELDS\n" +
  slice(h, "// Synodic Period", "\n}\n\n/* vim:") +
  "#undef FIELDS\n" +
  slice(j, "Calendar_jewish::Calendar_jewish()", "// Methods in XExtendedCalendar") +
  String.raw`
int main(int argc,char**argv){u_setDataDirectory(argv[1]);int type,count,field,value;std::string zone;double days;while(std::cin>>type>>zone>>days>>count){std::unique_ptr<Calendar_gregorian>cal;switch(type){case 0:cal.reset(new Calendar_gregorian);break;case 1:cal.reset(new Calendar_gregorian(gengou_eraArray));break;case 2:cal.reset(new Calendar_gregorian(ROC_eraArray));break;case 3:cal.reset(new Calendar_gregorian(dangi_eraArray));break;case 4:cal.reset(new Calendar_gregorian(buddhist_eraArray));break;case 5:cal.reset(new Calendar_hijri);break;case 6:cal.reset(new Calendar_jewish);break;}OUString id;for(char c:zone)id.value+=char16_t(c);cal->setTimeZone(id);cal->setLocalDateTime(days);for(int i=0;i<count;++i){std::cin>>field>>value;cal->setValue(field,value);}std::cout<<cal->isValid()<<' '<<std::setprecision(17)<<cal->getDateTime()<<' '<<cal->getLocalDateTime();for(int i=0;i<17;++i)std::cout<<' '<<cal->getValue(i);std::cout<<'\n';}}
`;
writeFileSync(`${build}/lo-calendar-witness.cc`, cxx);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    `-I${icu}/i18n`,
    `${build}/lo-calendar-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/lo-calendar-witness`,
  ],
  { stdio: "inherit" },
);
const classes = [
    G.Calendar_gregorian,
    G.Calendar_gengou,
    G.Calendar_ROC,
    G.Calendar_dangi,
    G.Calendar_buddhist,
    Calendar_hijri,
    Calendar_jewish,
  ],
  inputs = [],
  expected = [];
/** Adds a public service case with integral-millisecond input and source field order. @param type - Service. @param zone - Zone. @param day - Local epoch days. @param fields - Pending fields. @returns Nothing. */
function add(type, zone, day, fields = []) {
  const cal = new classes[type](),
    id = unicode(zone);
  try {
    cal.setTimeZone(id);
    cal.setLocalDateTime(day);
    for (const [field, value] of fields) cal.setValue(field, value);
    expected.push([
      Number(cal.isValid()),
      cal.getDateTime(),
      cal.getLocalDateTime(),
      ...Array.from(
        { length: 17 },
        /** Reads a public field. @param _unused - Array element. @param i - Field. @returns Value. */ (
          _,
          i,
        ) => cal.getValue(i),
      ),
    ]);
    inputs.push([type, zone, day, fields.length, ...fields.flat()].join(" "));
  } finally {
    id.dispose();
    cal.dispose();
  }
}
for (let type = 0; type < 7; type++)
  for (const zone of [
    "UTC",
    "Asia/Bangkok",
    "Asia/Tokyo",
    "America/New_York",
    "Europe/Paris",
    "Asia/Kolkata",
  ]) {
    for (const day of [
      -141427, -25569, -1, 0, 10956, 10957, 18017, 18018, 19782, 19783, 19784, 20000, 21000,
    ])
      add(type, zone, day);
    const year = [2024, 6, 113, 4357, 2567, 1445, 5784][type];
    for (const month of [0, 1, 2, 11, 12])
      for (const date of [0, 1, 28, 29, 30, 31, 32])
        add(type, zone, 20000, [
          [C.YEAR, year],
          [C.MONTH, month],
          [C.DAY_OF_MONTH, date],
        ]);
    for (const fields of [
      [
        [C.DAY_OF_MONTH, 31],
        [C.MONTH, 1],
      ],
      [
        [C.MONTH, 1],
        [C.DAY_OF_MONTH, 31],
      ],
      [
        [C.ZONE_OFFSET, -300],
        [C.ZONE_OFFSET_SECOND_MILLIS, 12345],
      ],
      [
        [C.HOUR, 2],
        [C.MINUTE, 30],
      ],
      [
        [C.ERA, 0],
        [C.YEAR, 2],
        [C.MONTH, 0],
        [C.DAY_OF_MONTH, 1],
      ],
    ])
      add(type, zone, 18018, fields);
  }
const actual = execFileSync(`${build}/lo-calendar-witness`, [`${icu}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 8e6,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Case count ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i) {
  const row = actual[i].trim().split(/\s+/).map(Number);
  if (row.length !== expected[i].length) throw Error(`Width ${i}`);
  for (let n = 0; n < row.length; ++n)
    if (row[n] !== expected[i][n])
      throw Error(`Case ${i},field ${n}: ${inputs[i]}: local ${expected[i][n]},native ${row[n]}`);
}
console.log(
  `Matched ${actual.length} LibreOffice temporal service cases using extracted unchanged method bodies and ICU78.3.`,
);
