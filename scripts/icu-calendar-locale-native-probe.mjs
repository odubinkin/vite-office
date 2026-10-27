/** @fileoverview Compares original ICU78.3 Calendar::setWeekData, locale metadata and weekend contracts with the unchanged linked ICU libraries. Header access-control visibility is widened only in the witness; no implementation algorithm is rewritten. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { locale_set_default_internal } from "../apps/office/src/external/icu/source/common/locid.default.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/calendar-locale-witness.cc`,
  String.raw`
#include <iostream>
#include <string>
#include <vector>
#include <memory>
#define private public
#define protected public
#include "unicode/gregocal.h"
#include "unicode/simpletz.h"
#undef private
#undef protected
#include "unicode/putil.h"
#include "unicode/uloc.h"
using namespace icu;
std::string unhex(const std::string&s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
std::string hex(const char*s){if(!s)return "~";if(!*s)return "-";std::string out;const char*t="0123456789abcdef";for(;*s;++s){uint8_t c=*s;out+=t[c>>4];out+=t[c&15];}return out;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode e=U_ZERO_ERROR;uloc_setDefault("en_US",&e);std::string n,t;int initial;while(std::cin>>n>>t>>initial){auto name=unhex(n);bool nullType=t=="~";auto type=nullType?std::string():unhex(t);e=U_ZERO_ERROR;GregorianCalendar cal(new SimpleTimeZone(0,UnicodeString(u"UTC")),Locale("en_US"),e);cal.setTime(0,e);cal.setWeekData(Locale("en_US"),"gregorian",e);e=UErrorCode(initial);cal.setWeekData(Locale(name.c_str()),nullType?nullptr:type.c_str(),e);std::cout<<int(e)<<' '<<cal.fFirstDayOfWeek<<' '<<int(cal.fMinimalDaysInFirstWeek)<<' '<<cal.fWeekendOnset<<' '<<cal.fWeekendOnsetMillis<<' '<<cal.fWeekendCease<<' '<<cal.fWeekendCeaseMillis<<' '<<int(cal.fIsTimeSet)<<' '<<int(cal.fAreFieldsSet)<<' '<<int(cal.fAreAllFieldsSet)<<' '<<int(cal.fAreFieldsVirtuallySet)<<' '<<int(cal.fNextStamp);
for(int kind:{-1,0,1,2})for(int status:{0,-128,1}){UErrorCode a=UErrorCode(status),b=a;auto loc=cal.getLocale(ULocDataLocaleType(kind),a);auto id=cal.getLocaleID(ULocDataLocaleType(kind),b);std::cout<<' '<<hex(loc.getName())<<' '<<int(a)<<' '<<hex(id)<<' '<<int(b);}
for(int day=-1;day<=9;++day)for(int status:{0,-128,1}){UErrorCode a=UErrorCode(status),b=a;auto kind=cal.getDayOfWeekType(UCalendarDaysOfWeek(day),a);auto transition=cal.getWeekendTransition(UCalendarDaysOfWeek(day),b);std::cout<<' '<<int(kind)<<' '<<int(a)<<' '<<transition<<' '<<int(b);}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/calendar-locale-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/calendar-locale-witness`,
  ],
  { stdio: "inherit" },
);
/** Actual source owner with only the protected locale loader exposed. */
class Witness extends GregorianCalendar {
  /** Initializes the real constructor and public controlled baseline. @returns Fixture. */
  constructor() {
    super([0]);
    this.setTime(0, [0]);
    this.clear();
  }

  /** Original protected week-data entrypoint. @param locale - Desired. @param type - Calendar type/null. @param status - Status. @returns Nothing. */
  load(locale, type, status) {
    this.setWeekData(locale, type, status);
  }
}
/** Narrow C transport. @param s - Nullable storage. @returns Hex. */
function hex(s) {
  if (s === null) return "~";
  return Buffer.from(s.split("\0")[0], "latin1").toString("hex") || "-";
}
locale_set_default_internal("en_US", [0]);
const input = [],
  expected = [];
/** Records one native comparison, bootstrapping both objects to the same public state before exercising incoming status. @param name - Locale. @param type - Type/null. @param initial - Status. @returns Nothing. */
function add(name, type, initial) {
  input.push([hex(name), hex(type), initial].join(" "));
  const cal = new Witness();
  cal.setTime(0, [0]);
  cal.load(new Locale("en_US"), "gregorian", [0]);
  const status = [initial];
  cal.load(new Locale(name), type, status);
  const result = [
    status[0],
    cal.fFirstDayOfWeek,
    cal.fMinimalDaysInFirstWeek,
    cal.fWeekendOnset,
    cal.fWeekendOnsetMillis,
    cal.fWeekendCease,
    cal.fWeekendCeaseMillis,
    Number(cal.fIsTimeSet),
    Number(cal.fAreFieldsSet),
    Number(cal.fAreAllFieldsSet),
    Number(cal.fAreFieldsVirtuallySet),
    cal.fNextStamp,
  ];
  for (const kind of [-1, 0, 1, 2])
    for (const s of [0, -128, 1]) {
      const a = [s],
        b = [s],
        locale = cal.getLocale(kind, a),
        id = cal.getLocaleID(kind, b);
      result.push(hex(locale.getName()), a[0], hex(id), b[0]);
    }
  for (let day = -1; day <= 9; ++day)
    for (const s of [0, -128, 1]) {
      const a = [s],
        b = [s],
        kind = cal.getDayOfWeekType(day, a),
        transition = cal.getWeekendTransition(day, b);
      result.push(kind, a[0], transition, b[0]);
    }
  expected.push(result.join(" "));
}
const data = JSON.parse(
  readFileSync("apps/office/src/external/icu/source/data/in/icudt78l.resources.json", "utf8"),
);
const names = new Set([
  "",
  "root",
  "und",
  "en",
  "en_US",
  "en_GB",
  "en_Latn_US",
  "en_Cyrl_US",
  "ru",
  "ru_RU",
  "zh",
  "zh_TW",
  "zh_Hant_TW",
  "zh_Hans_TW",
  "sr_Latn_RS",
  "az_Arab_IR",
  "fa_IR",
  "ar_SA",
  "ar_AE",
  "he_IL",
  "th_TH",
  "ja_JP",
  "zz",
  "e",
  "no_NO",
  "en\0ignored",
  "en-u-fw-mon",
  "en_US@fw=mon",
  "en_US@fw=MON",
  "en_US@fw=xxx",
  "en@rg=GBzzzz",
  "en@rg=GB+",
  "en@sd=usca",
  "und@rg=IRzzzz",
]);
for (const name of Object.keys(data.bundles))
  if (
    ![
      "pool",
      "zoneinfo64",
      "keyTypeData",
      "langInfo",
      "timezoneTypes",
      "supplementalData",
    ].includes(name)
  )
    names.add(name);
for (const name of names)
  for (const type of [null, "gregorian", "islamic", "iso8601", "not-a-calendar"])
    for (const initial of [0, -128, 1]) add(name, type, initial);
for (const region of ["001", "US", "GB", "FR", "IR", "IN", "SA", "AE", "ZZ"])
  for (const fw of [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "MON",
    "unknown",
    "x".repeat(156),
    "x".repeat(157),
  ])
    add(`en_${region}@fw=${fw}`, "gregorian", 0);
const output = execFileSync(`${build}/calendar-locale-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (output.length !== expected.length) throw Error(`Count ${output.length} != ${expected.length}`);
for (let i = 0; i < output.length; ++i)
  if (output[i] !== expected[i])
    throw Error(`Mismatch ${i} ${input[i]}\nnative ${output[i]}\nlocal ${expected[i]}`);
console.log(
  JSON.stringify({
    cases: input.length,
    names: names.size,
    result: "all match unchanged ICU78.3 source",
    scope:
      "setWeekData, six actual week/weekend fields, locale metadata/error contracts, unchanged field flags/stamps, weekend type/transition guards",
  }),
);
