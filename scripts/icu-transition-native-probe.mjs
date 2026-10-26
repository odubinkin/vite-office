/** @fileoverview Compares actual DateTimeRule/AnnualTimeZoneRule/TimeArrayTimeZoneRule, SimpleTimeZone transitions and Calendar fields-to-UTC with unchanged ICU78.3 libraries/data. Requires the existing output/native/AQF9AG-icu-grego build; run with tsx. Native allocation/mutex/ABI/undefined inputs and IANA/system factories are outside scope. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { DateTimeRule } from "../apps/office/src/external/icu/source/i18n/dtrule.ts";
import {
  TimeZoneRule,
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
} from "../apps/office/src/external/icu/source/i18n/tzrule.ts";
import { TimeZoneTransition } from "../apps/office/src/external/icu/source/i18n/tztrans.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { Grego } from "../apps/office/src/external/icu/source/i18n/gregoimp.ts";
import { UCalendarDateFields as F } from "../apps/office/src/external/icu/source/i18n/unicode/ucal.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/transition-witness.cc`,
  String.raw`
#include "unicode/simpletz.h"
#include "unicode/gregocal.h"
#include "unicode/putil.h"
#include "unicode/tzrule.h"
#include "unicode/tztrans.h"
#include <iostream>
#include <iomanip>
#include <cstdlib>
#include <string>
#include <memory>
#include <vector>
using namespace icu;
void dumpRule(const TimeZoneRule* r){
 if(!r){std::cout<<0<<' ';return;}UnicodeString name;r->getName(name);auto a=dynamic_cast<const AnnualTimeZoneRule*>(r);
 std::cout<<(a?2:1)<<' '<<r->getRawOffset()<<' '<<r->getDSTSavings()<<' '<<name.length()<<' ';for(int i=0;i<name.length();i++)std::cout<<int(name.charAt(i))<<' ';
 if(a){auto d=a->getRule();std::cout<<a->getStartYear()<<' '<<a->getEndYear()<<' '<<d->getDateRuleType()<<' '<<d->getTimeRuleType()<<' '<<d->getRuleMonth()<<' '<<d->getRuleDayOfMonth()<<' '<<d->getRuleDayOfWeek()<<' '<<d->getRuleWeekInMonth()<<' '<<d->getRuleMillisInDay()<<' ';}
}
class Witness:public GregorianCalendar{public:Witness(UErrorCode&s):GregorianCalendar(*TimeZone::getGMT(),Locale::getRoot(),s){}void dump(){for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<fFields[i]<<' ';for(int i=0;i<UCAL_FIELD_COUNT;i++)std::cout<<newestStamp(UCalendarDateFields(i),UCalendarDateFields(i),0)<<' ';}};
int main(int argc,char**argv){
 if(argc!=2)return 2;u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;Witness cal(init);if(U_FAILURE(init))return 3;std::cout<<std::setprecision(17);char kind;
 while(std::cin>>kind){
  if(kind=='T'){
   int tm,raw,dst,inclusive,op,count,mutate,index;std::string text;std::cin>>tm>>raw>>dst>>text>>inclusive>>op>>count>>mutate>>index;double base=std::strtod(text.c_str(),nullptr);std::vector<double> times;
   for(int i=0;i<count;i++){std::cin>>text;times.push_back(std::strtod(text.c_str(),nullptr));}
   TimeArrayTimeZoneRule original(u"a",123,456,times.data(),count,DateTimeRule::TimeRuleType(tm));
   std::unique_ptr<TimeArrayTimeZoneRule> rule(mutate==0?&original:mutate==1?new TimeArrayTimeZoneRule(original):original.clone());
   double otherTimes[]={42};TimeArrayTimeZoneRule assigned(u"different",1,2,otherTimes,1,DateTimeRule::UTC_TIME);
   if(mutate==3){assigned=original;rule.reset(new TimeArrayTimeZoneRule(assigned));}if(mutate==4)*rule=*rule;
   double out=77;bool found=op==0?rule->getFirstStart(raw,dst,out):op==1?rule->getFinalStart(raw,dst,out):op==2?rule->getNextStart(base,raw,dst,bool(inclusive),out):op==3?rule->getPreviousStart(base,raw,dst,bool(inclusive),out):rule->getStartTimeAt(index,out);
   TimeArrayTimeZoneRule renamed(u"b",123,456,times.data(),count,DateTimeRule::TimeRuleType(tm)),offset(u"a",124,456,times.data(),count,DateTimeRule::TimeRuleType(tm));
   std::cout<<int(found)<<' '<<out<<' '<<rule->getTimeType()<<' '<<rule->countStartTimes()<<' '<<int(*rule==renamed)<<' '<<int(rule->isEquivalentTo(renamed))<<' '<<int(*rule==offset)<<' '<<int(rule->isEquivalentTo(offset))<<' ';
   for(int i=0;i<rule->countStartTimes();i++){double t=77;rule->getStartTimeAt(i,t);std::cout<<t<<' ';}if(mutate==0)rule.release();
  }else if(kind=='A'){
   int type,m,dom,dow,week,ms,tm,sy,ey,y,raw,dst,inclusive,op;std::string text;std::cin>>type>>m>>dom>>dow>>week>>ms>>tm>>sy>>ey>>y>>raw>>dst>>text>>inclusive>>op;
   std::unique_ptr<DateTimeRule> d(type==0?new DateTimeRule(m,dom,ms,DateTimeRule::TimeRuleType(tm)):type==1?new DateTimeRule(m,week,dow,ms,DateTimeRule::TimeRuleType(tm)):new DateTimeRule(m,dom,dow,type==2,ms,DateTimeRule::TimeRuleType(tm)));
   AnnualTimeZoneRule rule(u"a",0,3600000,*d,sy,ey),other(u"b",3600000,0,*d,sy,ey);double out=77,base=std::strtod(text.c_str(),nullptr);bool found=op==0?rule.getStartInYear(y,raw,dst,out):op==1?rule.getFirstStart(raw,dst,out):op==2?rule.getFinalStart(raw,dst,out):op==3?rule.getNextStart(base,raw,dst,bool(inclusive),out):rule.getPreviousStart(base,raw,dst,bool(inclusive),out);
   std::cout<<int(found)<<' '<<out<<' '<<int(rule==other)<<' '<<int(rule.isEquivalentTo(other))<<' '<<int(rule.TimeZoneRule::operator==(other))<<' ';
  }else{
   int raw,sm,sd,sw,st,stm,em,ed,ew,et,etm,sav,sy;std::cin>>raw>>sm>>sd>>sw>>st>>stm>>em>>ed>>ew>>et>>etm>>sav>>sy;UErrorCode s=U_ZERO_ERROR;SimpleTimeZone zone(raw,u"zone",int8_t(sm),int8_t(sd),int8_t(sw),st,SimpleTimeZone::TimeMode(stm),int8_t(em),int8_t(ed),int8_t(ew),et,SimpleTimeZone::TimeMode(etm),sav,s);zone.setStartYear(sy);if(U_FAILURE(s))return 4;
   if(kind=='N'||kind=='P'){
    std::string text;int inclusive;std::cin>>text>>inclusive;TimeZoneTransition out(42,InitialTimeZoneRule(u"before",11,22),InitialTimeZoneRule(u"after",33,44));double base=std::strtod(text.c_str(),nullptr);
    bool found=kind=='N'?zone.getNextTransition(base,bool(inclusive),out):zone.getPreviousTransition(base,bool(inclusive),out);std::cout<<int(found)<<' '<<out.getTime()<<' ';dumpRule(out.getFrom());dumpRule(out.getTo());
   }else if(kind=='R'){
    int capacity,incoming,mutate;std::cin>>capacity>>incoming>>mutate;s=UErrorCode(incoming);InitialTimeZoneRule before(u"before",11,22),after(u"after",33,44);const InitialTimeZoneRule* initial=&before;const TimeZoneRule* rules[2]={&before,&after};int count=capacity;
    zone.getTimeZoneRules(initial,rules,count,s);if(mutate&&U_SUCCESS(s)){zone.setID(UnicodeString(u"renamed"));if(mutate==2)zone.setStartYear(sy);count=capacity;zone.getTimeZoneRules(initial,rules,count,s);}
    std::cout<<zone.countTransitionRules(s)<<' '<<count<<' '<<int(s)<<' ';dumpRule(initial);dumpRule(rules[0]);dumpRule(rules[1]);
   }else if(kind=='C'){
    int first,min,repeat,skip,lenient,incoming,count;std::cin>>first>>min>>repeat>>skip>>lenient>>incoming>>count;
    cal.setTime(0,s);cal.clear();cal.adoptTimeZone(zone.clone());cal.setFirstDayOfWeek(UCalendarDaysOfWeek(first));cal.setMinimalDaysInFirstWeek(uint8_t(min));cal.setRepeatedWallTimeOption(UCAL_WALLTIME_LAST);cal.setRepeatedWallTimeOption(UCalendarWallTimeOption(repeat));cal.setSkippedWallTimeOption(UCalendarWallTimeOption(skip));cal.setLenient(bool(lenient));
    for(int i=0;i<count;i++){int f,v;std::cin>>f>>v;cal.set(UCalendarDateFields(f),v);}s=UErrorCode(incoming);double time=cal.getTime(s);for(int f=0;f<UCAL_FIELD_COUNT;f++)cal.get(UCalendarDateFields(f),s);
    std::cout<<time<<' '<<int(s)<<' '<<cal.getRepeatedWallTimeOption()<<' '<<cal.getSkippedWallTimeOption()<<' ';cal.dump();
   }
  }
  std::cout<<0<<'\n';
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
    `${build}/transition-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/transition-witness`,
  ],
  { stdio: "inherit" },
);
/** Calendar witness supplies actual SimpleTimeZone and explicit week data; public locale/system construction is not certified. */
class CalendarWitness extends GregorianCalendar {
  zone = new SimpleTimeZone(0, new UnicodeString("zone"));
  /** Returns the actual zone. @returns Zone. */
  getTimeZone() {
    return this.zone;
  }
}
const cal = new CalendarWitness(),
  input = [],
  expected = [];
/** Serializes actual borrowed rule state, including native dynamic rule kind. @param rule - Rule/null. @returns Scalar row. */
function dump(rule) {
  if (!rule) return [0];
  const name = new UnicodeString();
  rule.getName(name);
  const out = [
    rule instanceof AnnualTimeZoneRule ? 2 : 1,
    rule.getRawOffset(),
    rule.getDSTSavings(),
    name.length(),
  ];
  for (let i = 0; i < name.length(); i++) out.push(name.charAt(i));
  if (rule instanceof AnnualTimeZoneRule) {
    const d = rule.getRule();
    out.push(
      rule.getStartYear(),
      rule.getEndYear(),
      d.getDateRuleType(),
      d.getTimeRuleType(),
      d.getRuleMonth(),
      d.getRuleDayOfMonth(),
      d.getRuleDayOfWeek(),
      d.getRuleWeekInMonth(),
      d.getRuleMillisInDay(),
    );
  }
  return out;
}
/** Builds an actual source zone from the exact native tuple. @param cfg - Rule scalars and start year. @returns Zone. */
function zone(cfg) {
  const [raw, sm, sd, sw, st, stm, em, ed, ew, et, etm, sav, sy] = cfg,
    s = [0],
    z = new SimpleTimeZone(
      raw,
      new UnicodeString("zone"),
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
      s,
    );
  z.setStartYear(sy);
  if (s[0] > 0) throw Error("invalid zone");
  return z;
}
/** Adds native Annual rule observation. @param cfg - Date rule fields. @param sy - First year. @param ey - Last year. @param year - Query year. @param raw - Previous raw. @param dst - Previous savings. @param base - UTC base. @param inclusive - Include base. @param op - Query kind. @returns Nothing. */
function annual(cfg, sy, ey, year, raw, dst, base, inclusive, op) {
  const [type, m, dom, dow, week, ms, tm] = cfg,
    d =
      type === 0
        ? new DateTimeRule(m, dom, ms, tm)
        : type === 1
          ? new DateTimeRule(m, week, dow, ms, tm)
          : new DateTimeRule(m, dom, dow, type === 2, ms, tm),
    a = new AnnualTimeZoneRule(new UnicodeString("a"), 0, 3600000, d, sy, ey),
    b = new AnnualTimeZoneRule(new UnicodeString("b"), 3600000, 0, d, sy, ey),
    out = [77];
  const found =
    op === 0
      ? a.getStartInYear(year, raw, dst, out)
      : op === 1
        ? a.getFirstStart(raw, dst, out)
        : op === 2
          ? a.getFinalStart(raw, dst, out)
          : op === 3
            ? a.getNextStart(base, raw, dst, !!inclusive, out)
            : a.getPreviousStart(base, raw, dst, !!inclusive, out);
  input.push(`A ${cfg.join(" ")} ${sy} ${ey} ${year} ${raw} ${dst} ${base} ${inclusive} ${op}`);
  expected.push([
    Number(found),
    out[0],
    Number(a.equals(b)),
    Number(a.isEquivalentTo(b)),
    Number(TimeZoneRule.prototype.equals.call(a, b)),
    0,
  ]);
}
/** Adds original next/previous/borrowed-rule observations. @param kind - Query. @param cfg - Zone scalars. @param base - UTC base. @param inclusive - Include base. @param capacity - Rule capacity. @param incoming - Status. @param mutate - ID/cache mutation kind. @returns Nothing. */
function transition(kind, cfg, base = 0, inclusive = 0, capacity = 2, incoming = 0, mutate = 0) {
  const z = zone(cfg);
  if (kind === "R") {
    const before = new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
      after = new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
      initial = [before],
      rules = [before, after],
      count = [capacity],
      s = [incoming];
    z.getTimeZoneRules(initial, rules, count, s);
    if (mutate && s[0] <= 0) {
      z.setID(new UnicodeString("renamed"));
      if (mutate === 2) z.setStartYear(cfg[12]);
      count[0] = capacity;
      z.getTimeZoneRules(initial, rules, count, s);
    }
    input.push(`R ${cfg.join(" ")} ${capacity} ${incoming} ${mutate}`);
    expected.push([
      z.countTransitionRules(s),
      count[0],
      s[0],
      ...dump(initial[0]),
      ...dump(rules[0]),
      ...dump(rules[1]),
      0,
    ]);
  } else {
    const out = new TimeZoneTransition(
        42,
        new InitialTimeZoneRule(new UnicodeString("before"), 11, 22),
        new InitialTimeZoneRule(new UnicodeString("after"), 33, 44),
      ),
      found =
        kind === "N"
          ? z.getNextTransition(base, !!inclusive, out)
          : z.getPreviousTransition(base, !!inclusive, out);
    input.push(`${kind} ${cfg.join(" ")} ${base} ${inclusive}`);
    expected.push([Number(found), out.getTime(), ...dump(out.getFrom()), ...dump(out.getTo()), 0]);
  }
}
/** Adds actual Calendar public fields-to-UTC and normalized fields/stamps. @param cfg - Actual source zone. @param ops - Ordered field writes. @param repeat - Repeated option. @param skip - Skipped option. @param lenient - Lenience. @param incoming - Status. @returns Nothing. */
function calendar(cfg, ops, repeat = 0, skip = 0, lenient = 1, incoming = 0) {
  cal.setTime(0, [0]);
  cal.clear();
  cal.zone = zone(cfg);
  cal.setFirstDayOfWeek(2);
  cal.setMinimalDaysInFirstWeek(4);
  cal.setRepeatedWallTimeOption(0);
  cal.setRepeatedWallTimeOption(repeat);
  cal.setSkippedWallTimeOption(skip);
  cal.setLenient(!!lenient);
  for (const [f, v] of ops) cal.set(f, v);
  const s = [incoming],
    time = cal.getTime(s);
  for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) cal.get(f, s);
  const stamps = [];
  for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) stamps.push(cal.newestStamp(f, f, 0));
  input.push(
    `C ${cfg.join(" ")} 2 4 ${repeat} ${skip} ${lenient} ${incoming} ${ops.length} ${ops.map(/** Serializes native field writes. @param pair - Field/value. @returns Pair. */ (pair) => pair.join(" ")).join(" ")}`,
  );
  expected.push([
    time,
    s[0],
    cal.getRepeatedWallTimeOption(),
    cal.getSkippedWallTimeOption(),
    ...cal.fFields,
    ...stamps,
    0,
  ]);
}
for (const type of [0, 1, 2, 3])
  for (const month of [0, 1, 2, 9, 11])
    for (const tm of [0, 1, 2])
      for (const year of [-1, 0, 1, 1500, 1900, 2000, 2023, 2024])
        for (const op of [0, 1, 2, 3, 4])
          for (const inclusive of [0, 1])
            annual(
              [type, month, month === 1 ? 29 : 14, 1, -1, 7200000, tm],
              0,
              2024,
              year,
              19800000,
              3600000,
              Number(Grego.fieldsToDay(year, month, 15)) * 86400000,
              inclusive,
              op,
            );
const configs = [];
for (const raw of [-18000000, 0, 36000000])
  for (const south of [false, true])
    for (const savings of [-3600000, 1800000, 3600000])
      for (const tm of [0, 1, 2])
        configs.push([
          raw,
          south ? 9 : 2,
          2,
          1,
          7200000,
          tm,
          south ? 2 : 10,
          1,
          1,
          7200000,
          tm,
          savings,
          2000,
        ]);
configs.push(
  [0, 2, 8, -1, 7200000, 0, 10, -25, -1, 7200000, 0, 3600000, 2000],
  [0, 2, 0, 0, 0, 0, 10, 0, 0, 0, 0, 3600000, 2000],
  [0, 1, 29, 0, 7200000, 0, 9, 1, 0, 7200000, 0, 3600000, 2000],
  [0, 2, 1, 0, 0, 2, 2, 1, 0, 0, 2, 3600000, 2000],
);
for (const cfg of configs) {
  for (const year of [1999, 2000, 2023, 2024])
    for (const month of [0, 2, 9, 10, 11])
      for (const inclusive of [0, 1])
        for (const kind of ["N", "P"])
          transition(kind, cfg, Number(Grego.fieldsToDay(year, month, 1)) * 86400000, inclusive);
  for (const capacity of [-1, 0, 1, 2, 3])
    for (const status of [-128, 0, 1])
      for (const mutate of [0, 1, 2]) transition("R", cfg, 0, 0, capacity, status, mutate);
  for (const month of [1, 2, 9, 10])
    for (const day of [10, 28, 29, 31])
      for (const hour of [1, 2, 3])
        for (const repeat of [0, 1])
          for (const skip of [0, 1, 2])
            for (const lenient of [0, 1])
              calendar(
                cfg,
                [
                  [F.UCAL_YEAR, 2023],
                  [F.UCAL_MONTH, month],
                  [F.UCAL_DATE, day],
                  [F.UCAL_HOUR_OF_DAY, hour],
                  [F.UCAL_MINUTE, 30],
                ],
                repeat,
                skip,
                lenient,
              );
}
for (const year of [0, 1, 1500, 1582, 1900, 2000, 2024])
  for (const month of [0, 1, 9])
    for (const day of [1, 4, 10, 15, 29, 31])
      for (const lenient of [0, 1])
        calendar(
          configs[0],
          [
            [F.UCAL_ERA, 1],
            [F.UCAL_YEAR, year],
            [F.UCAL_MONTH, month],
            [F.UCAL_DATE, day],
          ],
          0,
          0,
          lenient,
        );
for (const option of [-1, 0, 1, 2, 3, 8, 99])
  calendar(
    configs[0],
    [
      [F.UCAL_YEAR, 2024],
      [F.UCAL_MONTH, 2],
      [F.UCAL_DATE, 10],
      [F.UCAL_HOUR_OF_DAY, 2],
    ],
    option,
    option,
  );
for (const [month, day, hour] of [
  [2, 10, 2],
  [10, 3, 1],
])
  for (const repeat of [0, 1])
    for (const skip of [0, 1, 2])
      for (const lenient of [0, 1])
        for (const status of [-128, 0, 1])
          calendar(
            [-18000000, 2, 2, 1, 7200000, 0, 10, 1, 1, 7200000, 0, 3600000, 2000],
            [
              [F.UCAL_YEAR, 2024],
              [F.UCAL_MONTH, month],
              [F.UCAL_DATE, day],
              [F.UCAL_HOUR_OF_DAY, hour],
              [F.UCAL_MINUTE, 30],
            ],
            repeat,
            skip,
            lenient,
            status,
          );
/** Exercises the actual historical time-array owner, retaining binary64 edge values in the text protocol. @param times - Start buffer. @param tm - Native time type. @param raw - Previous offset. @param dst - Previous savings. @param base - UTC base. @param inclusive - Include base. @param op - Start query. @param mutate - Copy/clone/assignment route. @param index - Direct index. @returns Nothing. */
function timeArray(times, tm, raw, dst, base, inclusive, op, mutate, index) {
  const original = new TimeArrayTimeZoneRule(
    new UnicodeString("a"),
    123,
    456,
    times,
    times.length,
    tm,
  );
  let rule =
    mutate === 0 ? original : mutate === 1 ? new TimeArrayTimeZoneRule(original) : original.clone();
  if (mutate === 3) {
    const assigned = new TimeArrayTimeZoneRule(new UnicodeString("different"), 1, 2, [42], 1, 2);
    assigned.assign(original);
    rule = new TimeArrayTimeZoneRule(assigned);
  }
  if (mutate === 4) rule.assign(rule);
  const out = [77],
    found =
      op === 0
        ? rule.getFirstStart(raw, dst, out)
        : op === 1
          ? rule.getFinalStart(raw, dst, out)
          : op === 2
            ? rule.getNextStart(base, raw, dst, !!inclusive, out)
            : op === 3
              ? rule.getPreviousStart(base, raw, dst, !!inclusive, out)
              : rule.getStartTimeAt(index, out),
    renamed = new TimeArrayTimeZoneRule(new UnicodeString("b"), 123, 456, times, times.length, tm),
    offset = new TimeArrayTimeZoneRule(new UnicodeString("a"), 124, 456, times, times.length, tm);
  input.push(
    `T ${tm} ${raw} ${dst} ${base} ${inclusive} ${op} ${times.length} ${mutate} ${index} ${times.map(/** Preserves signed zero. @param time - Start. @returns Native token. */ (time) => (Object.is(time, -0) ? "-0" : String(time))).join(" ")}`,
  );
  const row = [
    Number(found),
    out[0],
    rule.getTimeType(),
    rule.countStartTimes(),
    Number(rule.equals(renamed)),
    Number(rule.isEquivalentTo(renamed)),
    Number(rule.equals(offset)),
    Number(rule.isEquivalentTo(offset)),
  ];
  for (let i = 0; i < rule.countStartTimes(); ++i) {
    rule.getStartTimeAt(i, out);
    row.push(out[0]);
  }
  expected.push([...row, 0]);
}
const timeArrays = [
  [],
  [100],
  [100, -100, 0, 100, -0, 1.5],
  Array.from(
    { length: 40 },
    /** Reversed repeated dates across the native local-buffer boundary. @param unused - Unused. @param i - Position. @returns Time. */ (
      unused,
      i,
    ) => ((40 - i) % 13) * 86400000,
  ),
  [Number.MIN_VALUE, -Number.MIN_VALUE, 0, -0, Number.MAX_VALUE, -Number.MAX_VALUE],
  [NaN, 100, -100, NaN, 0],
  Array.from(
    { length: 35 },
    /** Exercises the native comparator without imposing a replacement NaN order. @param unused - Unused. @param i - Position. @returns Time. */ (
      unused,
      i,
    ) => (i % 7 === 0 ? NaN : (35 - i) % 11),
  ),
];
for (const times of timeArrays)
  for (const tm of [0, 1, 2, 3])
    for (const [raw, dst] of [
      [0, 0],
      [19800000, 3600000],
      [-18000000, -3600000],
    ])
      for (const base of [-86400001, -100, 0, 100, 86400000, 1e20, NaN])
        for (const inclusive of [0, 1])
          for (const op of [0, 1, 2, 3, 4])
            for (const mutate of [0, 1, 2, 3, 4])
              timeArray(
                times,
                tm,
                raw,
                dst,
                base,
                inclusive,
                op,
                mutate,
                op === 4 ? (inclusive ? times.length : -1) : 0,
              );
const actual = execFileSync(`${build}/transition-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
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
      /** Compares exact original outputs. @param value - Native field. @param j - Output index. @returns Mismatch. */ (
        value,
        j,
      ) => !Object.is(Number(value), expected[i][j]),
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}, port ${expected[i]}`);
}
const report = {
  result: "pass",
  cases: input.length,
  sources: Object.fromEntries(
    [
      "i18n/dtrule.cpp",
      "i18n/tzrule.cpp",
      "common/uarrsort.cpp",
      "i18n/tztrans.cpp",
      "i18n/simpletz.cpp",
      "i18n/calendar.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Captures unchanged source identity. @param path - Source path. @returns Hash pair. */ (
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
    "Actual annual and explicit time-array rules, native stable date sorting, lazy SimpleTimeZone transitions and Calendar public fields-to-UTC with real source recurring zones. Locale/system/IANA construction, allocation/mutex/ABI/undefined inputs and complete LibreOffice calendar/CSV services remain unverified.",
};
writeFileSync(`${build}/transition-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
