/** @fileoverview Compiles unchanged timezone.cpp/olsontz.cpp with only host/clock hooks redirected, then checks source host/default lifecycle and Calendar zone ownership against real ICU78.3 classes/data. Run with tsx after the native build. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { createTimeZone } from "../apps/office/src/external/icu/source/i18n/timezone.create.ts";
import {
  createDefault,
  detectHostTimeZoneFromHost,
  setDefault,
  adoptDefault,
} from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
import * as Host from "../apps/office/src/external/icu/browser/putil-tz.ts";
import { OlsonTimeZone } from "../apps/office/src/external/icu/source/i18n/olsontz.ts";
import { Locale as IcuLocale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { UCalendarDateFields as F } from "../apps/office/src/external/icu/source/i18n/unicode/ucal.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/timezone-host-source.cc`,
  String.raw`
#include "unicode/utypes.h"
#include "unicode/putil.h"
#include "putilimp.h"
U_CAPI void U_EXPORT2 aq_tzset();
U_CAPI void aq_clear();
U_CAPI const char* U_EXPORT2 aq_tzname(int);
U_CAPI int32_t U_EXPORT2 aq_timezone();
#undef uprv_tzset
#undef uprv_tzname_clear_cache
#undef uprv_tzname
#undef uprv_timezone
#define uprv_tzset aq_tzset
#define uprv_tzname_clear_cache aq_clear
#define uprv_tzname aq_tzname
#define uprv_timezone aq_timezone
` + `#include "${source}/i18n/timezone.cpp"\n`,
);
writeFileSync(
  `${build}/timezone-host-olson.cc`,
  String.raw`
#include "unicode/utypes.h"
#include "unicode/putil.h"
U_CAPI UDate U_EXPORT2 aq_clock();
#undef uprv_getUTCtime
#define uprv_getUTCtime aq_clock
` + `#include "${source}/i18n/olsontz.cpp"\n`,
);
writeFileSync(
  `${build}/timezone-default-witness.cc`,
  String.raw`
#include "unicode/timezone.h"
#include "unicode/putil.h"
#include "unicode/gregocal.h"
#include "olsontz.h"
#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
#include <vector>
using namespace icu;
std::string aq_name;int32_t aq_west=0;double aq_now=0;std::vector<int> aq_calls;
extern "C" void aq_tzset(){aq_calls.push_back(1);}
extern "C" void aq_clear(){aq_calls.push_back(2);}
extern "C" const char* aq_tzname(int index){aq_calls.push_back(3);if(index!=0)std::exit(3);return aq_name.c_str();}
extern "C" int32_t aq_timezone(){aq_calls.push_back(4);return aq_west;}
extern "C" UDate aq_clock(){return aq_now;}
void str(const UnicodeString&s){std::cout<<s.length()<<' ';for(int i=0;i<s.length();i++)std::cout<<int(s.charAt(i))<<' ';}
UnicodeString read(){int n,c;std::cin>>n;UnicodeString s;for(int i=0;i<n;i++){std::cin>>c;s.append(char16_t(c));}return s;}
void zone(const TimeZone&z){std::cout<<int(dynamic_cast<const OlsonTimeZone*>(&z)!=nullptr)<<' ';UnicodeString id;z.getID(id);str(id);UErrorCode s=U_ZERO_ERROR;int32_t raw=12,dst=19;z.getOffset(0,false,raw,dst,s);std::cout<<raw<<' '<<dst<<' '<<int(s)<<' '<<z.getRawOffset()<<' ';}
void calendar(GregorianCalendar&cal){UErrorCode s=U_ZERO_ERROR;double t=cal.getTime(s);std::cout<<t<<' '<<int(s)<<' ';for(auto f:{UCAL_YEAR,UCAL_MONTH,UCAL_DATE,UCAL_HOUR_OF_DAY,UCAL_MINUTE,UCAL_ZONE_OFFSET,UCAL_DST_OFFSET})std::cout<<cal.get(f,s)<<' ';zone(cal.getTimeZone());}
int main(int argc,char**argv){if(argc!=2)return 1;u_setDataDirectory(argv[1]);std::cout<<std::setprecision(17);char kind;
 while(std::cin>>kind){auto name=read();std::string ascii;name.toUTF8String(ascii);aq_name=ascii;std::cin>>aq_west;aq_calls.clear();
  if(kind=='H'){std::unique_ptr<TimeZone>z(TimeZone::detectHostTimeZone());zone(*z);}
  else if(kind=='I'){std::unique_ptr<TimeZone>z(TimeZone::createDefault());zone(*z);}
  else if(kind=='D'){std::unique_ptr<TimeZone>z(TimeZone::createTimeZone(name));TimeZone::setDefault(*z);z->setID(UnicodeString(u"external"));z->setRawOffset(123);std::unique_ptr<TimeZone>a(TimeZone::createDefault()),b(TimeZone::createDefault());zone(*a);b->setID(UnicodeString(u"copy"));b->setRawOffset(321);std::unique_ptr<TimeZone>c(TimeZone::createDefault());zone(*c);TimeZone::adoptDefault(z.release());std::unique_ptr<TimeZone>d(TimeZone::createDefault());zone(*d);TimeZone::adoptDefault(nullptr);std::unique_ptr<TimeZone>e(TimeZone::createDefault());zone(*e);}
  else if(kind=='C'){auto second=read();int mode,pending;std::cin>>mode>>pending;std::unique_ptr<TimeZone>a(TimeZone::createTimeZone(name)),b(TimeZone::createTimeZone(second));UErrorCode s=U_ZERO_ERROR;GregorianCalendar cal(a.release(),Locale::getRoot(),s);if(U_FAILURE(s))return 4;cal.setFirstDayOfWeek(UCAL_MONDAY);cal.setMinimalDaysInFirstWeek(4);if(pending){cal.clear();cal.set(UCAL_YEAR,2024);cal.set(UCAL_MONTH,2);cal.set(UCAL_DATE,10);cal.set(UCAL_HOUR_OF_DAY,2);cal.set(UCAL_MINUTE,30);}else{cal.setTime(0,s);cal.get(UCAL_ZONE_OFFSET,s);}if(mode==0){TimeZone* p=b.release();cal.adoptTimeZone(p);p->setID(UnicodeString(u"changed"));}else if(mode==1){cal.setTimeZone(*b);b->setID(UnicodeString(u"changed"));}else if(mode==2)cal.adoptTimeZone(nullptr);else{TimeZone::setDefault(*b);std::unique_ptr<TimeZone>old(cal.orphanTimeZone());zone(*old);}calendar(cal);if(mode==3){cal.setTimeZone(cal.getTimeZone());calendar(cal);}}
  std::cout<<aq_calls.size()<<' ';for(int c:aq_calls)std::cout<<c<<' ';std::cout<<0<<'\n';
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
    `${build}/timezone-host-source.cc`,
    `${build}/timezone-host-olson.cc`,
    `${build}/timezone-default-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/timezone-default-witness`,
  ],
  { stdio: "inherit" },
);
const realClock = Date.now;
Date.now =
  /** Supplies a deterministic native/local clock witness. @returns Epoch milliseconds. */ () => 0;
const input = [],
  expected = [],
  counts = {};
/** Encodes original UTF16 construction. @param text - String owner. @returns Operands. */
function encode(text) {
  const out = [text.length()];
  for (let i = 0; i < text.length(); i++) out.push(text.charAt(i));
  return out.join(" ");
}
/** Original source zone observation. @param z - Actual zone. @returns Row. */
function zone(z) {
  const id = new UnicodeString(),
    raw = [12],
    dst = [19],
    s = [0];
  z.getID(id);
  z.getOffset(0, false, raw, dst, s);
  return [
    Number(z instanceof OlsonTimeZone),
    id.length(),
    ...Array.from(
      { length: id.length() },
      /** Copies source output units. @param unused - Unused. @param i - Index. @returns Unit. */ (
        _,
        i,
      ) => id.charAt(i),
    ),
    raw[0],
    dst[0],
    s[0],
    z.getRawOffset(),
  ];
}
/** Adds exact original hook/data observations. @param kind - Operation. @param name - Host or source zone name. @param west - Source host seconds. @param extra - Operands. @param row - Output. @param calls - Ordered hooks. @returns Nothing. */
function add(kind, name, west, extra, row, calls = []) {
  input.push(`${kind} ${encode(new UnicodeString(name, name.length))} ${west} ${extra}`);
  expected.push([...row, calls.length, ...calls, 0]);
  counts[kind] = (counts[kind] ?? 0) + 1;
}
Host.uprv_tzset();
Host.uprv_tzname_clear_cache();
const actualID = Host.uprv_tzname(0),
  actualWest = Host.uprv_timezone();
add("I", actualID, actualWest, "", zone(createDefault()), [1, 2, 3, 4]);
for (const name of [
  "",
  "UTC",
  "GMT",
  "CET",
  "EST",
  "MIT",
  "AET",
  "IST",
  "Foo",
  "Bogus/Name",
  "America/New_York",
  "US/Pacific",
  "Europe/Dublin",
  "Australia/Lord_Howe",
  "Pacific/Apia",
  "GMT+05:30",
  "+05:30",
  "CET\0trailing",
])
  for (const west of [-46800, -19800, -7200, 0, 3600, 14400, 18000, 39600]) {
    const calls = [],
      host = {
        /** Records platform initialization. @returns Nothing. */
        uprv_tzset() {
          calls.push(1);
        },
        /** Records host cache clearing. @returns Nothing. */
        uprv_tzname_clear_cache() {
          calls.push(2);
        },
        /** Supplies the fixture host identity. @param index - Standard-name index. @returns Host identity. */
        uprv_tzname(index) {
          if (index !== 0) throw Error("unexpected index");
          calls.push(3);
          return name;
        },
        /** Supplies fixture seconds west of UTC. @returns Standard offset. */
        uprv_timezone() {
          calls.push(4);
          return west;
        },
      };
    add("H", name, west, "", zone(detectHostTimeZoneFromHost(host)), calls);
  }
for (const name of ["UTC", "America/New_York", "Etc/GMT+5", "GMT+05:30", "Bad/Name"]) {
  const z = createTimeZone(new UnicodeString(name));
  setDefault(z);
  z.setID(new UnicodeString("external"));
  z.setRawOffset?.(123);
  const a = createDefault(),
    b = createDefault();
  const row = zone(a);
  b.setID(new UnicodeString("copy"));
  b.setRawOffset?.(321);
  row.push(...zone(createDefault()));
  adoptDefault(z);
  row.push(...zone(createDefault()));
  adoptDefault(null);
  row.push(...zone(createDefault()));
  add("D", name, 0, "", row);
}
/** Explicit source zone/week bootstrap only; the explicit source constructor is followed by controlled fixture state. */
class OwnedCalendar extends GregorianCalendar {
  /** Supplies the real owned zone and explicit week fields. @param z - Transferred zone. @returns Owner. */
  constructor(z) {
    super(z, IcuLocale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
}
/** Original public Calendar observations through owned zones. @param cal - Actual owner. @returns Row. */
function calendar(cal) {
  const s = [0],
    time = cal.getTime(s),
    row = [time, s[0]];
  for (const f of [
    F.UCAL_YEAR,
    F.UCAL_MONTH,
    F.UCAL_DATE,
    F.UCAL_HOUR_OF_DAY,
    F.UCAL_MINUTE,
    F.UCAL_ZONE_OFFSET,
    F.UCAL_DST_OFFSET,
  ])
    row.push(cal.get(f, s));
  return [...row, ...zone(cal.getTimeZone())];
}
for (const first of ["UTC", "America/New_York", "Europe/Paris", "Australia/Lord_Howe", "GMT+05:30"])
  for (const second of ["UTC", "Etc/GMT+5", "America/New_York", "Pacific/Apia"])
    for (const mode of [0, 1, 2, 3])
      for (const pending of [0, 1]) {
        const a = createTimeZone(new UnicodeString(first)),
          b = createTimeZone(new UnicodeString(second)),
          cal = new OwnedCalendar(a),
          s = [0],
          row = [];
        if (pending) {
          cal.clear();
          for (const [f, v] of [
            [F.UCAL_YEAR, 2024],
            [F.UCAL_MONTH, 2],
            [F.UCAL_DATE, 10],
            [F.UCAL_HOUR_OF_DAY, 2],
            [F.UCAL_MINUTE, 30],
          ])
            cal.set(f, v);
        } else {
          cal.setTime(0, s);
          cal.get(F.UCAL_ZONE_OFFSET, s);
        }
        if (mode === 0) {
          cal.adoptTimeZone(b);
          b.setID(new UnicodeString("changed"));
        } else if (mode === 1) {
          cal.setTimeZone(b);
          b.setID(new UnicodeString("changed"));
        } else if (mode === 2) cal.adoptTimeZone(null);
        else {
          setDefault(b);
          row.push(...zone(cal.orphanTimeZone()));
        }
        row.push(...calendar(cal));
        if (mode === 3) {
          cal.setTimeZone(cal.getTimeZone());
          row.push(...calendar(cal));
        }
        add("C", first, 0, `${encode(new UnicodeString(second))} ${mode} ${pending}`, row);
      }
const actual = execFileSync(`${build}/timezone-default-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trim()
  .split("\n");
Date.now = realClock;
if (actual.length !== expected.length)
  throw Error(`Default rows differ ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const row = actual[i].trim().split(" ");
  if (
    row.length !== expected[i].length ||
    row.some(
      /** Compares exact source outputs. @param text - Native field. @param j - Column. @returns Mismatch. */ (
        text,
        j,
      ) => Number(text) !== expected[i][j],
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}, port ${expected[i]}`);
}
const report = {
  result: "pass",
  cases: input.length,
  operations: counts,
  actualHost: { id: actualID, westSeconds: actualWest },
  sources: Object.fromEntries(
    ["i18n/timezone.cpp", "i18n/olsontz.cpp", "i18n/calendar.cpp", "data/in/icudt78l.dat"].map(
      /** Records unchanged source identity. @param path - Source path. @returns Hash pair. */ (
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
    "Original entire timezone.cpp and olsontz.cpp compile with only OS/clock hook names redirected; remaining ICU classes/data are unchanged. Detect-host branch/order, preexisting default initialization, copy/adopt/null semantics and actual Calendar zone/cache behavior are compared. Browser semantic identity binding has no independent libc raw-bias channel; unresolved mappings use host-detection failure. Locale/Gregorian constructors, native allocator/mutex/lifetime/ABI and undefined ownership inputs remain uncertified.",
};
writeFileSync(`${build}/timezone-default-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
