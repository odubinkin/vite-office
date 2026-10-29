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
#include <type_traits>
template<class C> class Witness:public C{public:using C::C;void observe(char kind,int a,int b,int use,int incoming,int count){UErrorCode s=U_ZERO_ERROR;this->adoptTimeZone(new SimpleTimeZone(0,UnicodeString(u"UTC")));this->setTime(kind=='F'?(double(a)-2440588.0)*86400000.0:0,s);if(kind=='F')this->get(UCAL_JULIAN_DAY,s);else this->clear();if(kind=='F')this->setLenient(use!=0);for(int i=0;i<count;i++){int f,v;std::cin>>f>>v;this->set(UCalendarDateFields(f),v);}s=UErrorCode(incoming);if(kind=='F'){this->handleComputeFields(a,s);std::cout<<int(s);for(int f=0;f<UCAL_FIELD_COUNT;f++)std::cout<<' '<<this->internalGet(UCalendarDateFields(f));std::cout<<'\n';return;}if(kind=='V'){this->validateField(UCalendarDateFields(a),s);std::cout<<0;}else if(kind=='O'){if(use)std::cout<<this->Calendar::internalGetMonth(b,s);else std::cout<<this->internalGetMonth(s);}else if(kind=='A')std::cout<<this->getActualMaximum(UCAL_DATE,s);else if(kind=='I'||kind=='Q'){if constexpr(std::is_base_of<IslamicCalendar,C>::value){if(kind=='I')std::cout<<this->yearStart(a,s);else std::cout<<this->monthStart(a,b,s);}else std::abort();}else if(kind=='M')std::cout<<this->handleComputeMonthStart(a,b,bool(use),s);else if(kind=='L')std::cout<<this->handleGetMonthLength(a,b,s);else if(kind=='Y')std::cout<<this->handleGetYearLength(a,s);else if(kind=='B')std::cout<<this->Calendar::handleGetMonthLength(a,b,s);else if(kind=='E'||kind=='W'){if(kind=='W'){this->setFirstDayOfWeek(UCalendarDaysOfWeek(a));this->setMinimalDaysInFirstWeek(uint8_t(b));}std::cout<<this->handleGetExtendedYear(s);}else{auto m=this->getDefaultMonthInYear(a,s);auto d=this->getDefaultDayInMonth(a,b,s);std::cout<<m<<' '<<d;}std::cout<<' '<<int(s)<<'\n';}};
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
  // Original protected field hooks receive consistent time/base caches prepared by public APIs.
  for (const day of [1948440, 2299160, 2299161, 2440588, 2451545, 2460370])
    for (const status of [0, -128, 1]) add("F", type, day, 0, 1, status);
  for (const year of [1, 2024, 5784])
    for (const month of [-1000, -470, -236, -235, 235, 236, 470, 1000])
      for (const use of [0, 1]) add("M", type, year, month, use, 0);
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
// Actual-maximum DATE uses the original public API on valid field-built owners.
for (let type = 0; type < classes.length; ++type)
  for (const month of [0, 1, 6, 11])
    for (const status of [0, 1])
      add("A", type, 0, 0, 1, status, [
        [19, 2024],
        [2, month],
        [5, 30],
      ]);
// Original Islamic protected year/month starts are valid derived-caller contracts.
for (const type of [11, 12, 13, 14, 15])
  for (const year of [1, 1445, 2024])
    for (const status of [0, -128, 1]) {
      add("I", type, year, 0, 1, status);
      for (const month of [-1, 0, 1, 11, 12]) add("Q", type, year, month, 1, status);
    }
for (const [year, month] of [
  [-2147483648, 0],
  [2147483647, 0],
  [178956971, 20],
])
  add("Q", 11, year, month, 1, 0);
// Real Hebrew year starts straddle the original signed32 day-cache boundary.
// These operand years are far from signed32 year-addition overflow.
for (const year of [5879540, 5879541, 5879542, 5879543, -5879537, -5879538, -5879539, -5879540])
  for (const status of [0, -128, 1]) {
    add("Y", 9, year, 0, 1, status);
    add("M", 9, year, 0, 1, status);
    add("M", 9, year, 1, 1, status);
    add("L", 9, year, 1, 1, status);
  }
// Every day remains inside the actual ICU global Julian range. Public APIs prepare
// time/base caches before the original public leniency setter and protected hook.
for (const day of [-0x7f000000, -1900000000, -1800000000, 1800000000, 1900000000, 0x7f000000])
  for (const lenient of [0, 1])
    for (const status of [0, -128, 1]) add("F", 9, day, 0, lenient, status);
for (let year = 1; year <= 80; ++year) add("Y", 9, year, 0, 1, 0);
// Original protected month resolution/validation consumes only real public field writes.
for (const year of [1, 5783, 5784])
  for (const month of [-1, 0, 5, 6, 11, 12, 13, 2147483647])
    for (const useDefault of [0, 1])
      for (const status of [0, -128, 1])
        add("O", 9, 0, 3, useDefault, status, [
          [19, year],
          [23, month],
        ]);
for (const useDefault of [0, 1])
  for (const status of [0, -128, 1]) add("O", 9, 0, 3, useDefault, status);
for (const year of [5783, 5784])
  for (const month of [5, 6])
    for (const useDefault of [0, 1])
      for (const status of [0, -128, 1])
        add("O", 9, 0, 3, useDefault, status, [
          [19, year],
          [2, month],
        ]);
for (const year of [5783, 5784])
  for (const [field, month] of [
    [2, 5],
    [2, 6],
    [2, 13],
    [23, 5],
    [23, 11],
    [23, 12],
  ])
    for (const status of [0, -128, 1])
      add("V", 9, field, 0, 1, status, [
        [19, year],
        [field, month],
      ]);

// Japanese era validation and checked year addition are original protected hook responsibilities.
// These month/year pairs fail original checked normalization before astronomical work.
for (const type of [7, 8, 11, 12, 13, 14, 15])
  for (const [year, month] of [
    [2147483647, 12],
    [-2147483648, -1],
  ])
    for (const use of [0, 1]) add("M", type, year, month, use, 0);
// Hebrew cycle/adjacent-year overflow and checked year-start range failures are bounded original errors.
for (const [year, month] of [
  [2147483647, 235],
  [-2147483648, -235],
  [-2147483648, -1],
  [2147483647, 13],
])
  for (const use of [0, 1]) add("M", 9, year, month, use, 0);
for (const kind of ["M", "L", "Y"]) add(kind, 9, 10000000, 1, 1, 0);
add("M", 9, 2147483647, 0, 1, 0);
for (const era of [-1, 237, 2147483647])
  for (const status of [0, 1]) add("D", 10, 2019, 4, 1, status, [[0, era]]);
for (const era of [235, 236])
  for (const year of [-2147483648, 2147483647])
    add("E", 10, 0, 0, 1, 0, [
      [0, era],
      [1, year],
    ]);
// Public field-stamp order can select an authored day/month or day-of-year while
// YEAR_WOY remains the selected year owner. Exercise the original base resolver.
for (const fields of [
  [
    [17, 2024],
    [3, 52],
    [2, 0],
    [5, 5],
  ],
  [
    [17, 2024],
    [3, 1],
    [2, 0],
    [5, 5],
  ],
  [
    [17, 2024],
    [3, 1],
    [2, 11],
    [5, 5],
  ],
  [
    [17, 2024],
    [3, 10],
    [2, 6],
    [5, 5],
  ],
  [
    [17, 2024],
    [3, 10],
    [6, 100],
  ],
])
  for (const status of [0, -128]) add("E", 0, 0, 0, 1, status, fields);
// Conforming derived callers may explicitly use the original protected base
// month-length implementation; no virtual override or private field is replaced.
for (const month of [0, 1, 11, 2147483647]) add("B", 0, 2024, month, 1, 0);
// Authored week rules use original public configuration methods, then the same
// extended-year hook as E. Both Sunday-year and ISO Monday-year boundaries occur.
for (const [firstDay, minimum] of [
  [1, 1],
  [2, 4],
  [7, 7],
])
  for (const year of [2023, 2024])
    for (const week of [1, 52, 53])
      for (const weekday of [1, 7])
        add("W", 0, firstDay, minimum, 1, 0, [
          [17, year],
          [3, week],
          [7, weekday],
        ]);
// These positive years remain within IslamicCalendar's original1..5000000
// field limits and signed32 relative-day range. Their mean lunar estimates have
// negative signed age, selecting the original forward daily search naturally.
for (const [year, month] of [
  [3351760, 1],
  [3384172, 4],
  [3418246, 9],
])
  add("Q", 11, year, month, 1, 0);
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
