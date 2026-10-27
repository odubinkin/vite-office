/** @fileoverview Compares the actual Calendar field/stamp owner and GregorianCalendar scalar hooks with unchanged ICU78.3. Requires built common/i18n/stubdata libraries under output/native/AQF9AG-icu-grego; run with npx tsx. Full time-zone/service completion is outside this witness. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { UCalendarDateFields as F } from "../apps/office/src/external/icu/source/i18n/unicode/ucal.ts";

/** Test-only exposure of protected native arithmetic; invoking time completion outside this scalar scope fails the witness. */
class CalendarWitness extends GregorianCalendar {
  /** Initializes the real constructor and public controlled baseline. @returns Fixture. */
  constructor() {
    super([0]);
    this.setTime(0, [0]);
    this.clear();
  }

  /** Rejects time-zone use outside the scalar witness. @returns Never. */
  getTimeZone() {
    throw Error("Time-zone lookup is outside this scalar witness");
  }
  /** Rejects unrelated zone completion. @returns Never. */
  computeFields() {
    throw Error("Time/zone completion is outside this witness");
  }
  /** Rejects unrelated time completion. @returns Never. */
  computeTime() {
    throw Error("Time/zone completion is outside this witness");
  }
}

const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/calendar-witness.cc`,
  String.raw`
#include "unicode/gregocal.h"
#include "unicode/timezone.h"
#include "unicode/putil.h"
#include <iostream>
using namespace icu;
class Witness:public GregorianCalendar {
public:
 Witness(UErrorCode& status):GregorianCalendar(*TimeZone::getGMT(),Locale::getRoot(),status){}
 int64_t monthStart(int32_t y,int32_t m,UErrorCode& s){return handleComputeMonthStart(y,m,true,s);}
 int32_t monthLength(int32_t y,int32_t m,UErrorCode& s){return handleGetMonthLength(y,m,s);}
 void fields(int32_t jd,UErrorCode& s){computeGregorianFields(jd,s);handleComputeFields(jd,s);}
 int32_t julian(UErrorCode& s){return computeJulianDay(s);}
 void internal(UCalendarDateFields f,int32_t v){internalSet(f,v);}
 void dump() {for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<fFields[i]<<' ';for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<newestStamp(UCalendarDateFields(i),UCalendarDateFields(i),0)<<' ';}
 void choices(){UErrorCode s=U_ZERO_ERROR; std::cout<<int(resolveFields(kDatePrecedence))<<' '<<int(resolveFields(kMonthPrecedence))<<' '<<int(newerField(UCAL_EXTENDED_YEAR,UCAL_YEAR))<<' '<<newestStamp(UCAL_ERA,UCAL_ORDINAL_MONTH,0)<<' '<<internalGetMonth(s);}
};
int main(int argc,char**argv){
 if(argc!=2)return 2;
 u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;Witness cal(init);if(U_FAILURE(init)){std::cerr<<int(init);return 3;}
 char kind;int32_t a,b,c;
 while(std::cin>>kind>>a>>b>>c){
  cal.clear();UErrorCode s=UErrorCode(c);
  if(kind=='M')std::cout<<cal.monthStart(a,b,s)<<' '<<int(s);
  else if(kind=='L')std::cout<<cal.monthLength(a,b,s)<<' '<<int(s);
  else if(kind=='G'){cal.fields(a,s);cal.dump();std::cout<<int(s);}
  else if(kind=='W'){
   s=U_ZERO_ERROR;cal.setFirstDayOfWeek(UCalendarDaysOfWeek(b));cal.setMinimalDaysInFirstWeek(uint8_t(c));cal.setTime((double(a)-2440588)*86400000.0,s);
   for(auto f:{UCAL_ERA,UCAL_YEAR,UCAL_MONTH,UCAL_DATE,UCAL_DAY_OF_YEAR,UCAL_EXTENDED_YEAR,UCAL_DAY_OF_WEEK,UCAL_DOW_LOCAL,UCAL_WEEK_OF_YEAR,UCAL_YEAR_WOY,UCAL_WEEK_OF_MONTH,UCAL_DAY_OF_WEEK_IN_MONTH})std::cout<<cal.get(f,s)<<' ';
   std::cout<<int(s);
  }
  else if(kind=='S'||kind=='J'){
   if(kind=='J'){int incoming;std::cin>>incoming;s=UErrorCode(incoming);cal.setFirstDayOfWeek(UCalendarDaysOfWeek(b));cal.setMinimalDaysInFirstWeek(uint8_t(c));}
   for(int i=0;i<a;i++){int action,field,value;std::cin>>action>>field>>value;if(action==0)cal.set(UCalendarDateFields(field),value);else if(action==1)cal.clear(UCalendarDateFields(field));else cal.internal(UCalendarDateFields(field),value);}
   if(kind=='J'){std::cout<<cal.julian(s)<<' '<<int(s)<<' ';cal.dump();std::cout<<0;}
   else {cal.dump();cal.choices();}
  }
  std::cout<<'\n';
 }
}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/calendar-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/calendar-witness`,
  ],
  { stdio: "inherit" },
);
const input = [],
  expected = [],
  cal = new CalendarWitness();
/** Observes stamps through the native protected range query. @returns Stamp values. */
function stamps() {
  const values = [];
  for (let field = 0; field < F.UCAL_FIELD_COUNT; field++)
    values.push(cal.newestStamp(field, field, 0));
  return values;
}
/** Adds a source hook invocation and actual port output. @param kind - Native operation. @param a - First input. @param b - Second input. @param status - ICU status. @returns Nothing. */
function add(kind, a, b = 0, status = 0) {
  input.push(`${kind} ${a} ${b} ${status}`);
  cal.clear();
  const s = [status];
  if (kind === "M") expected.push([cal.handleComputeMonthStart(a, b, true, s).toString(), s[0]]);
  else if (kind === "L") expected.push([cal.handleGetMonthLength(a, b, s), s[0]]);
  else {
    cal.computeGregorianFields(a, s);
    cal.handleComputeFields(a, s);
    expected.push([...cal.fFields, ...stamps(), s[0]]);
  }
}
for (const year of [
  -2147483648, -1000000, -400, -100, -4, -1, 0, 1, 100, 400, 1500, 1582, 1583, 1700, 1900, 1970,
  2000, 2100, 1000000, 2147483647,
])
  for (const month of [-2147483648, -25, -13, -12, -1, 0, 1, 2, 9, 10, 11, 12, 25, 2147483647])
    for (const status of [-128, 0, 1]) {
      add("M", year, month, status);
      // The native length hook has unchecked signed32 normalization; omit its undefined overflow cases.
      const normalized = year + Math.floor(month / 12);
      if (normalized >= -2147483648 && normalized <= 2147483647) add("L", year, month, status);
    }
for (let jd = -2000000; jd <= 4000000; jd += 347) add("G", jd);
for (const jd of [
  -0x7f000000, 0x7f000000, -2147483648, 0, 1721423, 1721424, 1721425, 1721426, 2299160, 2299161,
  2299162, 2440588, 2147483647,
])
  for (const status of [-128, 0, 1]) add("G", jd, 0, status);
for (let count = 0; count <= 350; count++) {
  cal.clear();
  const ops = [];
  for (let i = 0; i < count; i++) {
    const field = (i * 7 + count) % F.UCAL_FIELD_COUNT,
      action = i % 19 === 0 ? 1 : i % 23 === 0 ? 2 : 0,
      value = i * 29 - 400;
    ops.push(`${action} ${field} ${value}`);
    if (action === 0) cal.set(field, value);
    else if (action === 1) cal.clear(field);
    else cal.internalSet(field, value);
  }
  input.push(`S ${count} 0 0 ${ops.join(" ")}`);
  expected.push([
    ...cal.fFields,
    ...stamps(),
    cal.resolveFields(CalendarWitness.kDatePrecedence),
    cal.resolveFields(CalendarWitness.kMonthPrecedence),
    cal.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR),
    cal.newestStamp(F.UCAL_ERA, F.UCAL_ORDINAL_MONTH, 0),
    cal.internalGetMonth([0]),
  ]);
}
/** Captures source fields-to-day resolution with explicit locale week settings. @param ops - Ordered native field/value writes. @param first - First weekday. @param min - Minimum days in week. @param incoming - ICU status. @returns Nothing. */
function julian(ops, first = 1, min = 1, incoming = 0) {
  cal.clear();
  cal.setFirstDayOfWeek(first);
  cal.setMinimalDaysInFirstWeek(min);
  for (const [field, value] of ops) cal.set(field, value);
  const status = [incoming],
    jd = cal.computeJulianDay(status);
  input.push(
    `J ${ops.length} ${first} ${min} ${incoming} ${ops.map(/** Serializes a source field assignment. @param pair - Field/value pair. @returns Native operation. */ (pair) => `0 ${pair[0]} ${pair[1]}`).join(" ")}`,
  );
  expected.push([jd, status[0], ...cal.fFields, ...stamps(), 0]);
}
for (const year of [-400, 0, 1, 1500, 1582, 1583, 1900, 2000, 2024])
  for (let month = -1; month <= 12; month++)
    for (const dom of [0, 1, 4, 15, 29, 31, 32])
      julian([
        [F.UCAL_EXTENDED_YEAR, year],
        [F.UCAL_MONTH, month],
        [F.UCAL_DATE, dom],
      ]);
for (const year of [1582, 2015, 2016, 2020, 2021])
  for (const woy of [0, 1, 2, 52, 53, 54])
    for (let dow = 0; dow <= 8; dow++)
      for (const first of [1, 2])
        for (const min of [1, 4, 7]) {
          julian(
            [
              [F.UCAL_YEAR_WOY, year],
              [F.UCAL_WEEK_OF_YEAR, woy],
              [F.UCAL_DAY_OF_WEEK, dow],
            ],
            first,
            min,
          );
          julian(
            [
              [F.UCAL_YEAR, year],
              [F.UCAL_WEEK_OF_YEAR, woy],
              [F.UCAL_DOW_LOCAL, dow],
            ],
            first,
            min,
          );
        }
for (const year of [1500, 1582, 2024])
  for (const month of [0, 1, 9, 11])
    for (const dim of [-6, -2, -1, 0, 1, 4, 5, 6, 2147483647])
      for (const first of [1, 2])
        julian(
          [
            [F.UCAL_EXTENDED_YEAR, year],
            [F.UCAL_MONTH, month],
            [F.UCAL_DAY_OF_WEEK, 2],
            [F.UCAL_DAY_OF_WEEK_IN_MONTH, dim],
          ],
          first,
          4,
        );
for (const status of [-128, 0, 1])
  for (const ops of [
    [],
    [
      [F.UCAL_ERA, 2],
      [F.UCAL_YEAR, 2024],
    ],
    [[F.UCAL_YEAR, 5368710]],
    [
      [F.UCAL_YEAR, 2024],
      [F.UCAL_DATE, 2147483647],
    ],
    [[F.UCAL_JULIAN_DAY, 123]],
    [
      [F.UCAL_JULIAN_DAY, 123],
      [F.UCAL_ORDINAL_MONTH, 1],
    ],
  ])
    julian(ops, 2, 4, status);
for (const year of [-400, 0, 1, 1500, 1582, 1900, 2000, 2024])
  for (const doy of [0, 1, 59, 60, 277, 278, 288, 365, 366, 367])
    julian(
      [
        [F.UCAL_EXTENDED_YEAR, year],
        [F.UCAL_DAY_OF_YEAR, doy],
      ],
      2,
      4,
    );
for (const year of [1582, 2024])
  for (const month of [1, 9, 11])
    for (const week of [-1, 0, 1, 4, 5, 6])
      for (const first of [1, 2])
        for (const min of [1, 4, 7])
          julian(
            [
              [F.UCAL_YEAR, year],
              [F.UCAL_MONTH, month],
              [F.UCAL_WEEK_OF_MONTH, week],
              [F.UCAL_DAY_OF_WEEK, 6],
            ],
            first,
            min,
          );
for (const year of [1, 4, 100, 400, 1500, 1582, 2024])
  for (const era of [0, 1, 2])
    for (const status of [-128, 0, 1])
      julian(
        [
          [F.UCAL_ERA, era],
          [F.UCAL_YEAR, year],
          [F.UCAL_MONTH, 1],
          [F.UCAL_DATE, 29],
        ],
        2,
        4,
        status,
      );
for (const first of [1, 2, 7])
  for (const minimum of [1, 4, 7])
    for (let jd = 2299000; jd < 2459300; jd += 37) {
      const status = [0];
      cal.clear();
      cal.setFirstDayOfWeek(first);
      cal.setMinimalDaysInFirstWeek(minimum);
      cal.computeGregorianFields(jd, status);
      cal.handleComputeFields(jd, status);
      cal.computeWeekFields(status);
      input.push(`W ${jd} ${first} ${minimum}`);
      const row = [];
      for (const field of [
        F.UCAL_ERA,
        F.UCAL_YEAR,
        F.UCAL_MONTH,
        F.UCAL_DATE,
        F.UCAL_DAY_OF_YEAR,
        F.UCAL_EXTENDED_YEAR,
        F.UCAL_DAY_OF_WEEK,
        F.UCAL_DOW_LOCAL,
        F.UCAL_WEEK_OF_YEAR,
        F.UCAL_YEAR_WOY,
        F.UCAL_WEEK_OF_MONTH,
        F.UCAL_DAY_OF_WEEK_IN_MONTH,
      ])
        row.push(cal.internalGet(field));
      expected.push([...row, status[0]]);
    }
const actual = execFileSync(`${build}/calendar-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Native rows ${actual.length} != ${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const fields = actual[i].split(" ");
  if (
    fields.length !== expected[i].length ||
    fields.some(
      /** Checks exact source integer fields and int64 text. @param value - Native field. @param j - Field index. @returns Mismatch. */ (
        value,
        j,
      ) =>
        typeof expected[i][j] === "string"
          ? value !== expected[i][j]
          : Number(value) !== expected[i][j],
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}, port ${expected[i]}`);
}
const report = {
  cases: input.length,
  version: "78.3",
  sources: Object.fromEntries(
    [
      "i18n/calendar.cpp",
      "i18n/unicode/calendar.h",
      "i18n/gregocal.cpp",
      "i18n/unicode/gregocal.h",
      "data/in/icudt78l.dat",
    ].map(
      /** Captures original native source/data identity. @param path - ICU source relative path. @returns Hash pair. */ (
        path,
      ) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  result: "pass",
  scope:
    "Calendar field/stamp precedence, Gregorian cache and default GregorianCalendar hybrid scalar hooks. Native construction uses real pinned ICU resources; Zone/locale constructor contracts are covered by the separate constructor witness. Bidirectional completion is covered by the separate time and transition witnesses.",
};
writeFileSync(`${build}/calendar-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
