/** @fileoverview Compares Calendar time/stamp/validation paths with unchanged ICU78.3. Both sides use their actual SimpleTimeZone implementations. System/IANA factories and fields-to-UTC computation remain outside this witness. Requires existing common/i18n/stubdata libraries under output/native/AQF9AG-icu-grego; run with tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { UCalendarDateFields as F } from "../apps/office/src/external/icu/source/i18n/unicode/ucal.ts";
import {
  Grego,
  MIN_MILLIS,
  MAX_MILLIS,
} from "../apps/office/src/external/icu/source/i18n/gregoimp.ts";

/** Actual production Calendar/GregorianCalendar owner with only the zone dependency supplied by this test. */
class TimeWitness extends GregorianCalendar {
  zone = new SimpleTimeZone(0, new UnicodeString("fixture"));
  /** Returns the actual SimpleTimeZone owner. @returns Zone dependency. */
  getTimeZone() {
    return this.zone;
  }
  /** Rejects fields-to-time calls outside this UTC-only witness. @returns Never. */
  computeTime() {
    throw Error("Fields-to-UTC computation is outside this witness");
  }
}
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/calendar-time-witness.cc`,
  String.raw`
#include "unicode/gregocal.h"
#include "unicode/simpletz.h"
#include "unicode/putil.h"
#include <iostream>
#include <iomanip>
#include <cstdlib>
#include <string>
using namespace icu;
class Witness:public GregorianCalendar {
public:
 Witness(UErrorCode& s):GregorianCalendar(*TimeZone::getGMT(),Locale::getRoot(),s){}
 void dump(){for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<fFields[i]<<' ';for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<newestStamp(UCalendarDateFields(i),UCalendarDateFields(i),0)<<' ';}
 double clock(){return computeMillisInDay();}
 void validateOne(int32_t f,UErrorCode& s){validateField(UCalendarDateFields(f),s);}
};
int main(int argc,char**argv){
 if(argc!=2)return 2;u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;Witness cal(init);if(U_FAILURE(init))return 3;
 std::cout<<std::setprecision(17);char kind;std::string text;int raw,first,min,strict,incoming;
 while(std::cin>>kind>>text>>raw>>first>>min>>strict>>incoming){
  double value=std::strtod(text.c_str(),nullptr);cal.clear();cal.adoptTimeZone(new SimpleTimeZone(raw,u"fixture"));cal.setFirstDayOfWeek(UCalendarDaysOfWeek(first));cal.setMinimalDaysInFirstWeek(uint8_t(min));cal.setLenient(!strict);UErrorCode s=UErrorCode(incoming);
  if(kind=='Z'){int sm,sd,sw,st,stm,em,ed,ew,et,etm,sav,sy;std::cin>>sm>>sd>>sw>>st>>stm>>em>>ed>>ew>>et>>etm>>sav>>sy;UErrorCode config=U_ZERO_ERROR;auto zone=new SimpleTimeZone(raw,u"fixture",int8_t(sm),int8_t(sd),int8_t(sw),st,SimpleTimeZone::TimeMode(stm),int8_t(em),int8_t(ed),int8_t(ew),et,SimpleTimeZone::TimeMode(etm),sav,config);if(U_FAILURE(config))return 4;zone->setStartYear(sy);cal.adoptTimeZone(zone);}
  if(kind=='T'||kind=='Z'){
   cal.setTime(value,s);double time=cal.getTime(s);for(int i=0;i<UCAL_FIELD_COUNT;i++)cal.get(UCalendarDateFields(i),s);
   std::cout<<time<<' '<<int(s)<<' ';cal.dump();std::cout<<0;
  }else if(kind=='C'||kind=='V'){
   int count,field;std::cin>>count>>field;for(int i=0;i<count;i++){int f,v;std::cin>>f>>v;cal.set(UCalendarDateFields(f),v);}
   double clock=cal.clock();if(kind=='V')cal.validateOne(field,s);
   std::cout<<clock<<' '<<int(s)<<' ';cal.dump();std::cout<<0;
  }else if(kind=='Q'){
   int f,v;std::cin>>f>>v;cal.setTime(value,s);cal.set(UCalendarDateFields(f),v);
   std::cout<<cal.clock()<<' '<<int(s)<<' ';cal.dump();std::cout<<0;
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
    `${build}/calendar-time-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/calendar-time-witness`,
  ],
  { stdio: "inherit" },
);
const cal = new TimeWitness(),
  input = [],
  expected = [];
/** Reads actual owner values and original stamp queries. @returns Snapshot. */
function snapshot() {
  const stamps = [];
  for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) stamps.push(cal.newestStamp(f, f, 0));
  return [...cal.fFields, ...stamps, 0];
}
/** Adds a source operation and its port observation. @param kind - Source operation. @param value - Milliseconds. @param raw - Numeric fixture offset. @param first - First weekday. @param min - Minimum week length. @param strict - Strict mode. @param incoming - ICU status. @param ops - Ordered field/value writes. @param field - Single field to validate. @returns Nothing. */
function add(
  kind,
  value,
  raw = 0,
  first = 1,
  min = 1,
  strict = 0,
  incoming = 0,
  ops = [],
  field = 0,
) {
  cal.clear();
  cal.zone = new SimpleTimeZone(raw, new UnicodeString("fixture"));
  cal.setFirstDayOfWeek(first);
  cal.setMinimalDaysInFirstWeek(min);
  cal.setLenient(!strict);
  const s = [incoming];
  let head = `${kind} ${Object.is(value, -0) ? "-0" : value} ${raw} ${first} ${min} ${strict} ${incoming}`,
    result;
  if (kind === "Z") {
    const [sm, sd, sw, st, stm, em, ed, ew, et, etm, sav, sy] = ops,
      config = [0];
    cal.zone = new SimpleTimeZone(
      raw,
      new UnicodeString("fixture"),
      sm,
      sd,
      sw,
      st,
      stm,
      em,
      ed,
      ew,
      et,
      etm,
      sav,
      config,
    );
    cal.zone.setStartYear(sy);
    if (config[0] > 0) throw Error("Invalid source zone configuration");
    head += ` ${ops.join(" ")}`;
  }
  if (kind === "T" || kind === "Z") {
    cal.setTime(value, s);
    result = cal.getTime(s);
    for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) cal.get(f, s);
  } else if (kind === "Q") {
    const [f, v] = ops[0];
    cal.setTime(value, s);
    cal.set(f, v);
    result = cal.computeMillisInDay();
    head += ` ${f} ${v}`;
  } else {
    for (const [f, v] of ops) cal.set(f, v);
    result = cal.computeMillisInDay();
    if (kind === "V") cal.validateField(field, s);
    head += ` ${ops.length} ${field} ${ops.map(/** Serializes an ordered source setter. @param pair - Field and value. @returns Native input. */ (pair) => `${pair[0]} ${pair[1]}`).join(" ")}`;
  }
  input.push(head);
  expected.push([result, s[0], ...snapshot()]);
}
for (const raw of [0, -43200000, 19800000, 20700000, 43200000])
  for (const time of [
    0,
    -0,
    -0.25,
    -Number.MIN_VALUE,
    0.999,
    -86400000.25,
    951782400000,
    -12219292800000,
    MIN_MILLIS,
    MAX_MILLIS,
    MIN_MILLIS - 86400000,
    MAX_MILLIS + 86400000,
    Infinity,
    -Infinity,
    NaN,
  ])
    for (const strict of [0, 1])
      for (const status of [-128, 0, 1]) add("T", time, raw, 2, 4, strict, status);
for (let i = 0; i < 4000; i++)
  add(
    "T",
    -14000000000000 + i * 4051234567 + (i % 4) * 0.25,
    ((i % 49) - 24) * 1800000,
    (i % 7) + 1,
    (i % 7) + 1,
  );
for (const hour of [-2147483648, -25, -1, 0, 1, 12, 24, 48, 2147483647])
  for (const minute of [-60, 0, 59, 120])
    for (const second of [-1, 0, 59, 60])
      for (const ampm of [-3, -2, 0, 1, 2, 3]) {
        const ops = [
          [F.UCAL_HOUR_OF_DAY, hour],
          [F.UCAL_MINUTE, minute],
          [F.UCAL_SECOND, second],
          [F.UCAL_MILLISECOND, 999],
          [F.UCAL_HOUR, 7],
          [F.UCAL_AM_PM, ampm],
        ];
        add("C", 0, 0, 1, 1, 0, 0, ops);
        add("C", 0, 0, 1, 1, 0, 0, [...ops, [F.UCAL_HOUR_OF_DAY, hour]]);
      }
for (const year of [0, 1, 1500, 1582, 1900, 2000, 2024])
  for (const month of [0, 1, 9, 11, 12])
    for (const day of [0, 1, 28, 29, 30, 31, 32])
      for (const status of [-128, 0, 1])
        add(
          "V",
          0,
          0,
          2,
          4,
          1,
          status,
          [
            [F.UCAL_YEAR, year],
            [F.UCAL_MONTH, month],
            [F.UCAL_DATE, day],
          ],
          F.UCAL_DATE,
        );
for (const field of [
  F.UCAL_HOUR_OF_DAY,
  F.UCAL_HOUR,
  F.UCAL_AM_PM,
  F.UCAL_MINUTE,
  F.UCAL_SECOND,
  F.UCAL_MILLISECOND,
  F.UCAL_DAY_OF_YEAR,
  F.UCAL_DAY_OF_WEEK_IN_MONTH,
])
  for (const value of [-2147483648, -1, 0, 1, 12, 23, 24, 59, 60, 365, 366, 999, 1000, 2147483647])
    add(
      "V",
      0,
      0,
      2,
      4,
      1,
      0,
      [
        [F.UCAL_YEAR, 2024],
        [field, value],
      ],
      field,
    );
for (const raw of [0, -43200000, 19800000])
  for (const time of [-12219292800000, -0.25, 0, 951782400000])
    for (const field of [
      F.UCAL_HOUR_OF_DAY,
      F.UCAL_HOUR,
      F.UCAL_AM_PM,
      F.UCAL_MINUTE,
      F.UCAL_DATE,
      F.UCAL_MONTH,
    ])
      add("Q", time, raw, 2, 4, 0, 0, [[field, 1]]);
for (const raw of [-18000000, 0, 36000000])
  for (const south of [false, true])
    for (const stm of [0, 1, 2])
      for (const etm of [0, 1, 2])
        for (const savings of [-3600000, 1800000, 3600000])
          for (const month of [2, 9, 10])
            for (const day of [3, 10, 15])
              for (const hour of [0, 1.5, 2, 7]) {
                const time =
                  Number(Grego.fieldsToDay(2024, month, day)) * 86400000 + hour * 3600000;
                add("Z", time, raw, 2, 4, 0, 0, [
                  south ? 9 : 2,
                  2,
                  1,
                  7200000,
                  stm,
                  south ? 2 : 10,
                  1,
                  1,
                  7200000,
                  etm,
                  savings,
                  2000,
                ]);
              }
const actual = execFileSync(`${build}/calendar-time-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Native rows ${actual.length} != ${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const row = actual[i].trim().split(" ");
  if (
    row.length !== expected[i].length ||
    row.some(
      /** Checks exact outputs, including negative zero on scalar time. @param value - Native output. @param index - Output index. @returns Mismatch. */ (
        value,
        index,
      ) => !Object.is(Number(value), expected[i][index]),
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}, port ${expected[i]}`);
}
const report = {
  result: "pass",
  cases: input.length,
  version: "78.3",
  sources: Object.fromEntries(
    [
      "i18n/calendar.cpp",
      "i18n/timezone.cpp",
      "i18n/simpletz.cpp",
      "i18n/unicode/calendar.h",
      "data/in/icudt78l.dat",
    ].map(
      /** Captures actual unchanged source/data identity. @param path - ICU source relative path. @returns Hash pair. */ (
        path,
      ) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Calendar UTC-to-fields, time-range/stamp transitions, clock-field selection and protected single-field validation. Both sides use actual SimpleTimeZone owners for fixed offsets and recurring DST rules. System/IANA zone factories and CSV services remain unported; bidirectional time completion is covered by the separate transition witness.",
};
writeFileSync(`${build}/calendar-time-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
