/** @fileoverview Compares original ICU78.3 protected calendar hooks through real derived test callers, then writes native-only portable observations on request. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { observeCalendarHook } from "../apps/office/src/test/icu-calendar-hooks.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { adoptDefault } from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
import { writeIcuObservations } from "./icu-fixture-observations.mjs";
const build = resolve(process.env.VITE_OFFICE_ICU_NATIVE_BUILD ?? "output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
// Share only the existing witness's original header include list, never any native algorithm body.
const standardProbe = readFileSync(
    resolve("scripts/icu-standard-calendar-native-probe.mjs"),
    "utf8",
  ),
  headers = standardProbe.slice(
    standardProbe.indexOf('#include "unicode/gregocal.h"'),
    standardProbe.indexOf("int main(int argc"),
  );
const classes = [
  "GregorianCalendar",
  "BuddhistCalendar",
  "TaiwanCalendar",
  "ISO8601Calendar",
  "CopticCalendar",
  "EthiopicCalendar",
  "EthiopicAmeteAlemCalendar",
  "PersianCalendar",
  "IndianCalendar",
  "HebrewCalendar",
  "JapaneseCalendar",
  "IslamicCalendar",
  "IslamicCivilCalendar",
  "IslamicTBLACalendar",
  "IslamicRGSACalendar",
  "IslamicUmalquraCalendar",
  "ChineseCalendar",
  "DangiCalendar",
];
writeFileSync(
  `${build}/calendar-hooks-witness.cc`,
  headers +
    String.raw`
template<class C> class Witness:public C{public:using C::C;void observe(char kind,int a,int b,int use,int incoming,int count){UErrorCode s=U_ZERO_ERROR;this->adoptTimeZone(new SimpleTimeZone(0,UnicodeString(u"UTC")));this->setTime(0,s);this->clear();for(int i=0;i<count;i++){int f,v;std::cin>>f>>v;this->set(UCalendarDateFields(f),v);}s=UErrorCode(incoming);if(kind=='M')std::cout<<this->handleComputeMonthStart(a,b,bool(use),s);else if(kind=='L')std::cout<<this->handleGetMonthLength(a,b,s);else if(kind=='Y')std::cout<<this->handleGetYearLength(a,s);else if(kind=='E')std::cout<<this->handleGetExtendedYear(s);else{auto m=this->getDefaultMonthInYear(a,s);auto d=this->getDefaultDayInMonth(a,b,s);std::cout<<m<<' '<<d;}std::cout<<' '<<int(s)<<'\n';}};
template<class C>void run(char kind,int a,int b,int use,int incoming,int count){UErrorCode s=U_ZERO_ERROR;Witness<C>c(Locale("en_US"),s);c.observe(kind,a,b,use,incoming,count);}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode s=U_ZERO_ERROR;uloc_setDefault("en_US",&s);TimeZone::adoptDefault(new SimpleTimeZone(0,UnicodeString(u"UTC")));char kind;int type,a,b,use,incoming,count;while(std::cin>>kind>>type>>a>>b>>use>>incoming>>count){switch(type){
` +
    classes
      .map(
        /** Selects actual native constructors without changing their implementations. @param name - Original class. @param index - Type input. @returns Caller dispatch. */ (
          name,
          index,
        ) => `case ${index}:run<${name}>(kind,a,b,use,incoming,count);break;`,
      )
      .join("\n") +
    "}}}\n",
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/calendar-hooks-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/calendar-hooks-witness`,
  ],
  { stdio: "inherit" },
);
Locale.setDefault(new Locale("en_US"), [0]);
adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
const inputs = [];
/** Adds actual hook operands and public field writes. @param kind - Original hook. @param type - Original class. @param a - Year. @param b - Month. @param use - Month flag. @param status - Incoming status. @param fields - Original public field writes. @returns Nothing. */
function add(kind, type, a, b, use, status, fields = []) {
  inputs.push([kind, type, a, b, use, status, fields.length, ...fields.flat()].join(" "));
}
for (let type = 0; type < classes.length; ++type) {
  for (const year of [-1000, -1, 0, 1, 78, 1582, 1900, 2000, 2024, 5783, 5784])
    for (const status of [0, -128, 1]) {
      add("Y", type, year, 0, 1, status);
      for (const month of [-13, -1, 0, 1, 5, 6, 11, 12, 13, 25])
        for (const use of [0, 1]) {
          add("M", type, year, month, use, status);
          if (use) add("L", type, year, month, use, status);
        }
    }
  for (const fields of [
    [],
    [[1, 2]],
    [[19, 2024]],
    [
      [19, 2024],
      [1, 2000],
    ],
    [
      [1, 2000],
      [19, 2024],
    ],
    [
      [0, 0],
      [1, 1],
    ],
    [
      [0, 1],
      [1, 1],
    ],
    [
      [0, 235],
      [1, 1],
    ],
    [
      [0, 236],
      [1, 1],
    ],
    [
      [0, 236],
      [1, 0],
    ],
    [
      [0, 237],
      [1, 1],
    ],
    [
      [0, -1],
      [1, 1],
    ],
  ])
    for (const status of [0, -128, 1]) add("E", type, 0, 0, 1, status, fields);
  for (const era of [0, 1, 235, 236])
    for (const year of [1, 1989, 2019, 2024])
      for (const month of [0, 4, 5])
        for (const status of [0, -128, 1]) add("D", type, year, month, 1, status, [[0, era]]);
}
// Japanese era validation and checked year addition are original protected hook responsibilities.
for (const era of [-1, 237, 2147483647])
  for (const status of [0, 1]) add("D", 10, 2019, 4, 1, status, [[0, era]]);
for (const era of [235, 236])
  for (const year of [-2147483648, 2147483647])
    add("E", 10, 0, 0, 1, 0, [
      [0, era],
      [1, year],
    ]);
const rows = execFileSync(`${build}/calendar-hooks-witness`, [`${source}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32e6,
})
  .trimEnd()
  .split("\n");
if (rows.length !== inputs.length) throw Error("Native calendar hook row count differs");
for (let i = 0; i < inputs.length; ++i) {
  const actual = observeCalendarHook(inputs[i]);
  if (actual !== rows[i])
    throw Error(`Calendar hook ${inputs[i]}: native ${rows[i]}, local ${actual}`);
}
writeIcuObservations("calendar-hooks", inputs, rows, build, source, [
  "i18n/calendar.cpp",
  "i18n/gregocal.cpp",
  "i18n/islamcal.cpp",
  "i18n/chnsecal.cpp",
  "i18n/astro.cpp",
  "i18n/hebrwcal.cpp",
  "i18n/japancal.cpp",
  "i18n/erarules.cpp",
  "i18n/indiancal.cpp",
  "i18n/persncal.cpp",
  "i18n/cecal.cpp",
]);
console.log(`Matched ${rows.length} original calendar protected-hook calls`);
