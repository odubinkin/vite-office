/** @fileoverview Compares actual pinned ICU Olson resources/canonical IDs, historical/final offsets, borrowed rules and transitions with unchanged native ICU78.3. Requires the existing native build; run with tsx. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { uprv_isInvariantUString } from "../apps/office/src/external/icu/source/common/uinvchar.ts";
import * as R from "../apps/office/src/external/icu/source/common/uresbund.ts";
import { ZoneMeta } from "../apps/office/src/external/icu/source/i18n/zonemeta.ts";
import { createSystemTimeZone } from "../apps/office/src/external/icu/source/i18n/timezone.create.ts";
import { openOlsonResource } from "../apps/office/src/external/icu/source/i18n/timezone.resources.ts";
import {
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
} from "../apps/office/src/external/icu/source/i18n/tzrule.ts";
import { TimeZoneTransition } from "../apps/office/src/external/icu/source/i18n/tztrans.ts";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { UCalendarDateFields as F } from "../apps/office/src/external/icu/source/i18n/unicode/ucal.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/olson-witness.cc`,
  String.raw`
#include "unicode/timezone.h"
#include "unicode/ures.h"
#include "unicode/putil.h"
#include "unicode/tzrule.h"
#include "unicode/tztrans.h"
#include "unicode/gregocal.h"
#include "olsontz.h"
#include "zonemeta.h"
#include "uinvchar.h"
#include <iostream>
#include <iomanip>
#include <memory>
#include <vector>
#include <string>
#include <cstdlib>
using namespace icu;
void str(const UnicodeString& s){std::cout<<s.length()<<' ';for(int i=0;i<s.length();i++)std::cout<<int(s.charAt(i))<<' ';}
UnicodeString readID(){int n,c;std::cin>>n;UnicodeString id;if(n<0){id.setToBogus();return id;}for(int i=0;i<n;i++){std::cin>>c;id.append(char16_t(c));}return id;}
void rule(const TimeZoneRule* r){if(!r){std::cout<<0<<' ';return;}auto a=dynamic_cast<const AnnualTimeZoneRule*>(r);auto t=dynamic_cast<const TimeArrayTimeZoneRule*>(r);std::cout<<(a?2:t?3:1)<<' '<<r->getRawOffset()<<' '<<r->getDSTSavings()<<' ';UnicodeString name;r->getName(name);str(name);
 if(a){auto d=a->getRule();std::cout<<a->getStartYear()<<' '<<a->getEndYear()<<' '<<d->getDateRuleType()<<' '<<d->getTimeRuleType()<<' '<<d->getRuleMonth()<<' '<<d->getRuleDayOfMonth()<<' '<<d->getRuleDayOfWeek()<<' '<<d->getRuleWeekInMonth()<<' '<<d->getRuleMillisInDay()<<' ';}
 if(t){std::cout<<t->getTimeType()<<' '<<t->countStartTimes()<<' ';for(int i=0;i<t->countStartTimes();i++){double value=77;t->getStartTimeAt(i,value);std::cout<<value<<' ';}}
}
int main(int argc,char**argv){if(argc!=2)return 1;u_setDataDirectory(argv[1]);std::cout<<std::setprecision(17);UErrorCode init=U_ZERO_ERROR;UResourceBundle* root=ures_openDirect(nullptr,"zoneinfo64",&init);UResourceBundle* ns=ures_getByKey(root,"Names",nullptr,&init);if(U_FAILURE(init))return 2;std::vector<UnicodeString> names;std::vector<std::unique_ptr<TimeZone>> zones;
 for(int i=0;i<ures_getSize(ns);i++){int32_t n;auto p=ures_getStringByIndex(ns,i,&n,&init);names.emplace_back(p,n);zones.emplace_back(TimeZone::createTimeZone(names.back()));}ures_close(ns);ures_close(root);char kind;int index;
 while(std::cin>>kind>>index){UnicodeString id=index<0?readID():names[index];TimeZone* base=index<0?nullptr:zones[index].get();auto z=dynamic_cast<OlsonTimeZone*>(base);
  if(kind=='V'){for(int c=0;c<65536;c++){char16_t unit=char16_t(c);std::cout<<int(uprv_isInvariantUString(&unit,1))<<' ';}}
  else if(kind=='M'){int incoming;std::cin>>incoming;UErrorCode s=UErrorCode(incoming);auto canon=ZoneMeta::getCanonicalCLDRID(id,s);std::unique_ptr<TimeZone> temporary;if(index<0){temporary.reset(TimeZone::createTimeZone(id));z=dynamic_cast<OlsonTimeZone*>(temporary.get());}std::cout<<int(s)<<' '<<int(canon!=nullptr)<<' ';str(UnicodeString(canon));std::cout<<int(z!=nullptr)<<' ';UnicodeString output;if(z)z->getID(output);str(output);}
  else {if(!z)return 3;
   if(kind=='U'){UErrorCode s=U_ZERO_ERROR;std::cout<<z->getRawOffset()<<' '<<int(z->useDaylightTime())<<' '<<z->getDSTSavings()<<' '<<int(z->inDaylightTime(0,s))<<' '<<int(s)<<' ';}
   else if(kind=='O'){std::string text;int local,gap,dup,incoming;std::cin>>text>>local>>gap>>dup>>incoming;double date=std::strtod(text.c_str(),nullptr);UErrorCode s=UErrorCode(incoming);int32_t raw=12,dst=19;if(local==2)z->getOffsetFromLocal(date,UTimeZoneLocalOption(gap),UTimeZoneLocalOption(dup),raw,dst,s);else z->getOffset(date,bool(local),raw,dst,s);std::cout<<raw<<' '<<dst<<' '<<int(s)<<' ';}
   else if(kind=='F'){int era,y,m,d,w,ms,len,incoming,shorter;std::cin>>era>>y>>m>>d>>w>>ms>>len>>incoming>>shorter;UErrorCode s=UErrorCode(incoming);int offset=shorter?z->getOffset(uint8_t(era),y,m,d,uint8_t(w),ms,s):z->getOffset(uint8_t(era),y,m,d,uint8_t(w),ms,len,s);std::cout<<offset<<' '<<int(s)<<' ';}
   else if(kind=='N'||kind=='P'){std::string text;int inclusive;std::cin>>text>>inclusive;TimeZoneTransition out(42,InitialTimeZoneRule(u"before",11,22),InitialTimeZoneRule(u"after",33,44));double date=std::strtod(text.c_str(),nullptr);bool found=kind=='N'?z->getNextTransition(date,bool(inclusive),out):z->getPreviousTransition(date,bool(inclusive),out);std::cout<<int(found)<<' '<<out.getTime()<<' ';rule(out.getFrom());rule(out.getTo());}
   else if(kind=='R'){int capacity,incoming;std::cin>>capacity>>incoming;UErrorCode s=UErrorCode(incoming);int all=z->countTransitionRules(s);if(capacity==200)capacity=all+1;InitialTimeZoneRule before(u"before",11,22);std::vector<const TimeZoneRule*> rules(size_t(capacity>0?capacity:1),&before);const InitialTimeZoneRule* initial=&before;int count=capacity;z->getTimeZoneRules(initial,rules.data(),count,s);std::cout<<all<<' '<<int(s)<<' '<<count<<' ';rule(initial);for(int i=0;i<capacity;i++)rule(rules[i]);}
   else if(kind=='E'){int other,assign;std::cin>>other>>assign;auto rhs=dynamic_cast<OlsonTimeZone*>(zones[other].get());OlsonTimeZone target(*z);target.countTransitionRules(init);if(assign)target=*rhs;else{target.setID(UnicodeString(u"renamed"));target.setRawOffset(123);}UnicodeString out;target.getID(out);str(out);str(UnicodeString(target.getCanonicalID()));std::cout<<int(target==*rhs)<<' '<<int(target.hasSameRules(*rhs))<<' ';UErrorCode s=U_ZERO_ERROR;int32_t raw=12,dst=19;target.getOffset(0,false,raw,dst,s);std::cout<<raw<<' '<<dst<<' '<<int(s)<<' ';}
   else if(kind=='C'){int y,m,d,h,min,repeat,skip,lenient,incoming;std::cin>>y>>m>>d>>h>>min>>repeat>>skip>>lenient>>incoming;UErrorCode s=U_ZERO_ERROR;GregorianCalendar cal(z->clone(),Locale::getRoot(),s);if(U_FAILURE(s))return 4;cal.setFirstDayOfWeek(UCAL_MONDAY);cal.setMinimalDaysInFirstWeek(4);cal.clear();cal.setRepeatedWallTimeOption(UCalendarWallTimeOption(repeat));cal.setSkippedWallTimeOption(UCalendarWallTimeOption(skip));cal.setLenient(bool(lenient));cal.set(UCAL_YEAR,y);cal.set(UCAL_MONTH,m);cal.set(UCAL_DATE,d);cal.set(UCAL_HOUR_OF_DAY,h);cal.set(UCAL_MINUTE,min);s=UErrorCode(incoming);double time=cal.getTime(s);std::cout<<time<<' '<<int(s)<<' ';for(int f=0;f<UCAL_FIELD_COUNT;f++)std::cout<<cal.get(UCalendarDateFields(f),s)<<' ';}
  }std::cout<<0<<'\n';
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
    `${build}/olson-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/olson-witness`,
  ],
  { stdio: "inherit" },
);
const root = R.ures_openDirect(null, "zoneinfo64", [0]),
  namesResource = R.ures_getByKey(root, "Names", null, [0]),
  names = [],
  zones = [],
  input = [],
  expected = [],
  counts = {};
/** Adds one exact observation. @param kind - Source operation. @param index - Pinned zone index. @param args - Native operands. @param row - Local outputs. @returns Nothing. */
function add(kind, index, args, row) {
  input.push(`${kind} ${index} ${args}`);
  expected.push([...row, 0]);
  counts[kind] = (counts[kind] ?? 0) + 1;
}
/** Encodes actual owned/borrowed UTF16 without NUL truncation. @param text - String. @returns Numeric protocol units. */
function str(text) {
  const out = [text.length()];
  for (let i = 0; i < text.length(); i++) out.push(text.charAt(i));
  return out;
}
/** Serializes the real rule owner, including complete historical start arrays. @param r - Rule. @returns Native scalar row. */
function rule(r) {
  if (!r) return [0];
  const name = new UnicodeString();
  r.getName(name);
  const out = [
    r instanceof AnnualTimeZoneRule ? 2 : r instanceof TimeArrayTimeZoneRule ? 3 : 1,
    r.getRawOffset(),
    r.getDSTSavings(),
    ...str(name),
  ];
  if (r instanceof AnnualTimeZoneRule) {
    const d = r.getRule();
    out.push(
      r.getStartYear(),
      r.getEndYear(),
      d.getDateRuleType(),
      d.getTimeRuleType(),
      d.getRuleMonth(),
      d.getRuleDayOfMonth(),
      d.getRuleDayOfWeek(),
      d.getRuleWeekInMonth(),
      d.getRuleMillisInDay(),
    );
  }
  if (r instanceof TimeArrayTimeZoneRule) {
    out.push(r.getTimeType(), r.countStartTimes());
    for (let i = 0; i < r.countStartTimes(); i++) {
      const time = [77];
      r.getStartTimeAt(i, time);
      out.push(time[0]);
    }
  }
  return out;
}
/** Observes canonical cache resolution and original requested system ID. @param index - Pinned index or minus one. @param id - Input. @param incoming - Status. @returns Nothing. */
function meta(index, id, incoming) {
  const s = [incoming],
    canonical = ZoneMeta.getCanonicalCLDRID(id, s),
    zone = index < 0 ? createSystemTimeZone(id) : zones[index],
    out = new UnicodeString();
  zone?.getID(out);
  add(
    "M",
    index,
    `${index < 0 ? (id.isBogus() ? "-1" : str(id).join(" ")) + " " : ""}${incoming}`,
    [
      s[0],
      Number(canonical !== null),
      ...str(new UnicodeString(canonical)),
      Number(zone !== null),
      ...str(out),
    ],
  );
}
/** Observes actual offset dispatch. @param index - Zone. @param time - Milliseconds. @param local - UTC/default/explicit local. @param gap - Gap mask. @param dup - Overlap mask. @param incoming - Status. @returns Nothing. */
function offset(index, time, local = 0, gap = 4, dup = 12, incoming = 0) {
  const s = [incoming],
    raw = [12],
    dst = [19],
    zone = zones[index];
  if (local === 2) zone.getOffsetFromLocal(time, gap, dup, raw, dst, s);
  else zone.getOffset(time, !!local, raw, dst, s);
  add("O", index, `${time} ${local} ${gap} ${dup} ${incoming}`, [raw[0], dst[0], s[0]]);
}
/** Observes both exact field overloads. @param index - Zone. @param fields - Native scalar tuple. @param incoming - Status. @param shorter - Native no-month-length overload. @returns Nothing. */
function fields(index, fields, incoming = 0, shorter = 0) {
  const s = [incoming],
    zone = zones[index],
    out = shorter
      ? zone.getOffsetForFieldsWithoutMonthLength(...fields.slice(0, 6), s)
      : zone.getOffsetForFields(...fields, s);
  add("F", index, `${fields.join(" ")} ${incoming} ${shorter}`, [out, s[0]]);
}
/** Observes real transition owners with initialized failure sentinels. @param kind - Direction. @param index - Zone. @param time - UTC base. @param inclusive - Include base. @returns Nothing. */
function transition(kind, index, time, inclusive = 0) {
  const out = new TimeZoneTransition(
      42,
      new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
      new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
    ),
    found =
      kind === "N"
        ? zones[index].getNextTransition(time, !!inclusive, out)
        : zones[index].getPreviousTransition(time, !!inclusive, out);
  add(kind, index, `${time} ${inclusive}`, [
    Number(found),
    out.getTime(),
    ...rule(out.getFrom()),
    ...rule(out.getTo()),
  ]);
}
for (let i = 0; i < R.ures_getSize(namesResource); ++i) {
  const name = R.ures_getStringByIndex(namesResource, i, null, [0]),
    id = new UnicodeString(name),
    s = [0],
    zone = createSystemTimeZone(id, s);
  if (!zone || s[0] > 0) throw Error(`Pinned system zone failed ${name}: ${s}`);
  names.push(name);
  zones.push(zone);
}
for (let i = 0; i < names.length; i++)
  for (const s of [-128, 0, 1]) meta(i, new UnicodeString(names[i]), s);
for (const text of [
  "",
  "Unknown",
  "gmt",
  "GMT+05:30",
  "Etc/Unknown",
  "America/New_York\0trailing",
  "US/Pacific\0trailing",
  "/Europe/Paris",
  "A\nB",
  "A!B",
  "\ud800",
  "ä",
  "x".repeat(129),
])
  for (const s of [-128, 0, 1]) meta(-1, new UnicodeString(text, text.length), s);
const bogus = new UnicodeString();
bogus.setToBogus();
meta(-1, bogus, 0);
/** Supplies an actual Olson owner and explicit source week settings while locale/default construction is still pending. */
class CalendarWitness extends GregorianCalendar {
  /** Original explicit dependency projection. @param zone - Actual cloned zone. @returns Owner. */
  constructor(zone) {
    super();
    this.zone = zone;
    this.setFirstDayOfWeek(2);
    this.setMinimalDaysInFirstWeek(4);
  }
  /** Supplies the actual production zone. @returns Zone. */
  getTimeZone() {
    return this.zone;
  }
}
/** Observes actual public calendar completion through IANA historical/final rules. @param index - Pinned index. @param tuple - Year/month/day/hour/minute. @param repeat - Repeat option. @param skip - Skip option. @param lenient - Lenience. @param incoming - Status. @returns Nothing. */
function calendar(index, tuple, repeat = 0, skip = 0, lenient = 1, incoming = 0) {
  const cal = new CalendarWitness(zones[index].clone());
  cal.clear();
  cal.setRepeatedWallTimeOption(repeat);
  cal.setSkippedWallTimeOption(skip);
  cal.setLenient(!!lenient);
  for (let i = 0; i < tuple.length; i++)
    cal.set(
      [F.UCAL_YEAR, F.UCAL_MONTH, F.UCAL_DATE, F.UCAL_HOUR_OF_DAY, F.UCAL_MINUTE][i],
      tuple[i],
    );
  const s = [incoming],
    time = cal.getTime(s),
    row = [time, s[0]];
  for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) row.push(cal.get(f, s));
  add("C", index, `${tuple.join(" ")} ${repeat} ${skip} ${lenient} ${incoming}`, row);
}
const inv = [];
for (let c = 0; c < 65536; c++)
  inv.push(Number(uprv_isInvariantUString(String.fromCharCode(c), 1)));
add("V", 0, "", inv);
for (let i = 0; i < names.length; i++) {
  const currentStatus = [0];
  add("U", i, "", [
    zones[i].getRawOffset(),
    Number(zones[i].useDaylightTime()),
    zones[i].getDSTSavings(),
    Number(zones[i].inDaylightTime(0, currentStatus)),
    currentStatus[0],
  ]);
  calendar(i, [2024, 0, 1, 0, 0]);
  calendar(i, [2024, 6, 1, 12, 30]);
  const s = [0],
    res = new R.UResourceBundle();
  openOlsonResource(new UnicodeString(names[i]), res, s);
  const vector =
    /** Reads an optional pinned vector independently of the zone implementation. @param key - Resource key. @returns Raw resource vector. */ (
      key,
    ) => {
      const status = [0],
        entry = R.ures_getByKey(res, key, null, status);
      return R.ures_getIntVector(entry, null, status) ?? [];
    };
  const pairs = vector("typeOffsets"),
    map = R.ures_getBinary(R.ures_getByKey(res, "typeMap", null, [0]), null, [0]) ?? [],
    times = [];
  for (const key of ["transPre32", "trans", "transPost32"]) {
    const data = vector(key);
    for (let j = 0; j < data.length; j += key === "trans" ? 1 : 2)
      times.push(
        key === "trans"
          ? data[j] * 1000
          : Number(BigInt.asIntN(64, (BigInt(data[j] >>> 0) << 32n) | BigInt(data[j + 1] >>> 0))) *
              1000,
      );
  }
  for (let j = 0; j < times.length; j++) {
    const t = times[j],
      before = (j === 0 ? 0 : map[j - 1]) * 2,
      after = map[j] * 2,
      b = (pairs[before] + pairs[before + 1]) * 1000,
      a = (pairs[after] + pairs[after + 1]) * 1000,
      wall = t + (a + b) / 2;
    for (const delta of [-1, 0, 1]) offset(i, t + delta);
    offset(i, wall, 1);
    for (const option of [4, 12, 5, 7, 13, 15]) offset(i, wall, 2, option, option);
  }
  for (const time of [-1e15, 0, 2208988800000, 1e15]) {
    for (const incoming of [-128, 0, 1])
      for (const local of [0, 1, 2]) offset(i, time, local, 4, 12, incoming);
    transition("N", i, time);
    transition("P", i, time);
  }
  for (const year of [1, 1582, 1900, 1970, 2037, 2038, 2050])
    for (const month of [0, 6])
      for (const era of [0, 1])
        for (const shorter of [0, 1]) fields(i, [era, year, month, 1, 1, 0, 31], 0, shorter);
  for (const requested of [-1, 0, 1, 2, 200])
    for (const incoming of [-128, 0, 1]) {
      const zone = zones[i],
        s = [incoming],
        all = zone.countTransitionRules(s),
        capacity = requested === 200 ? all + 1 : requested,
        before = new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
        initial = [before],
        rules = Array.from(
          { length: Math.max(capacity, 1) },
          /** Supplies native initialized slots. @returns Sentinel. */ () => before,
        ),
        count = [capacity];
      zone.getTimeZoneRules(initial, rules, count, s);
      const row = [all, s[0], count[0], ...rule(initial[0])];
      for (let j = 0; j < capacity; j++) row.push(...rule(rules[j]));
      add("R", i, `${requested} ${incoming}`, row);
    }
}
for (const name of [
  "America/New_York",
  "Europe/Dublin",
  "Australia/Lord_Howe",
  "Pacific/Apia",
  "Etc/GMT+5",
]) {
  const i = names.indexOf(name);
  for (const date of [
    -2208988800000, 0, 1710054000000, 1730613600000, 2147483647000, 2208988800000,
  ])
    for (const inclusive of [0, 1]) {
      transition("N", i, date, inclusive);
      transition("P", i, date, inclusive);
    }
  for (const tuple of [
    [2, 2024, 0, 1, 1, 0, 31],
    [1, 2024, -1, 1, 1, 0, 31],
    [1, 2024, 0, 32, 1, 0, 31],
    [1, 2024, 0, 1, 0, 0, 31],
    [1, 2024, 0, 1, 1, -1, 31],
    [1, 2024, 0, 1, 1, 0, 27],
  ])
    for (const incoming of [-128, 0, 1])
      for (const shorter of [0, 1]) fields(i, tuple, incoming, shorter);
}
for (const [name, tuples] of [
  [
    "America/New_York",
    [
      [2024, 2, 10, 2, 30],
      [2024, 10, 3, 1, 30],
      [2050, 2, 13, 2, 30],
    ],
  ],
  [
    "Australia/Lord_Howe",
    [
      [2024, 3, 7, 1, 45],
      [2024, 9, 6, 2, 15],
    ],
  ],
  ["Pacific/Apia", [[2011, 11, 30, 12, 0]]],
  [
    "Europe/Dublin",
    [
      [2024, 2, 31, 1, 30],
      [2024, 9, 27, 1, 30],
    ],
  ],
  ["Asia/Kathmandu", [[1986, 0, 1, 0, 5]]],
  ["Europe/Moscow", [[1919, 6, 1, 0, 30]]],
])
  for (const tuple of tuples)
    for (const repeat of [0, 1])
      for (const skip of [0, 1, 2])
        for (const lenient of [0, 1])
          for (const incoming of [-128, 0, 1])
            calendar(names.indexOf(name), tuple, repeat, skip, lenient, incoming);
for (const [left, right] of [
  ["Etc/GMT+1", "Etc/GMT+5"],
  ["America/New_York", "America/Chicago"],
  ["Europe/Dublin", "UTC"],
])
  for (const assign of [0, 1]) {
    const i = names.indexOf(left),
      j = names.indexOf(right),
      target = zones[i].clone();
    target.countTransitionRules([0]);
    if (assign) target.assign(zones[j]);
    else {
      target.setID(new UnicodeString("renamed"));
      target.setRawOffset(123);
    }
    const id = new UnicodeString(),
      raw = [12],
      dst = [19],
      s = [0];
    target.getID(id);
    target.getOffset(0, false, raw, dst, s);
    add("E", i, `${j} ${assign}`, [
      ...str(id),
      ...str(new UnicodeString(target.getCanonicalID())),
      Number(target.equals(zones[j])),
      Number(target.hasSameRules(zones[j])),
      raw[0],
      dst[0],
      s[0],
    ]);
  }
const actual = execFileSync(`${build}/olson-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Olson rows differ ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const row = actual[i].trim().split(" ");
  if (
    row.length !== expected[i].length ||
    row.some(
      /** Compares exact native outputs. @param text - Native field. @param j - Column. @returns Mismatch. */ (
        text,
        j,
      ) => !Object.is(Number(text), expected[i][j]),
    )
  )
    throw Error(
      `${input[i]}: native ${actual[i].slice(0, 1000)}; port ${expected[i].slice(0, 200)}`,
    );
}
const report = {
  result: "pass",
  cases: input.length,
  zones: names.length,
  operations: counts,
  invariantCodeUnits: 65536,
  sources: Object.fromEntries(
    [
      "i18n/olsontz.cpp",
      "i18n/olsontz.h",
      "i18n/timezone.cpp",
      "i18n/zonemeta.cpp",
      "common/unistr.cpp",
      "common/uinvchar.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Records source identity. @param path - Path. @returns Hash pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Actual Olson classes on all pinned system IDs, all stored historical UTC boundaries and local transition midpoints/options, explicit future/final rule dispatch, current-clock raw/DST queries, field overloads, borrowed rule capacity and initialized transition outputs. Actual Calendar fields-to-UTC and public normalized fields are checked on every zone with explicit week settings, plus strict FIRST/LAST/NEXT_VALID historical/final gaps and folds. Public custom/default factories, full locale/calendar construction, allocator/mutex/lifetime/ABI and undefined native inputs remain uncertified.",
};
writeFileSync(`${build}/olson-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
