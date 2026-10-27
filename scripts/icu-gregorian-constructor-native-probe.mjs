/** @fileoverview Original ICU78.3 Gregorian/default/adopted/reference/date/copy/assignment construction, clone and weekend observations against unchanged linked source. Only witness header access-control tags are widened. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { locale_set_default_internal } from "../apps/office/src/external/icu/source/common/locid.default.ts";
import { adoptDefault } from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/gregorian-constructor-witness.cc`,
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
int clones=0;
class Zone:public SimpleTimeZone{public:bool fail;UErrorCode*change;Zone(int offset,bool bad=false,UErrorCode*p=nullptr):SimpleTimeZone(offset,UnicodeString(u"fixture")),fail(bad),change(p){}Zone*clone()const override{++clones;if(change)*change=U_RESOURCE_TYPE_MISMATCH;return fail?nullptr:new Zone(*this);}};
std::string unhex(std::string s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
std::string hex(const char*s){if(!s)return "~";std::string out;const char*t="0123456789abcdef";for(;*s;++s){uint8_t c=*s;out+=t[c>>4];out+=t[c&15];}return out.empty()?"-":out;}
std::string uhex(const UnicodeString&s){std::string out;const char*t="0123456789abcdef";for(int i=0;i<s.length();++i){uint16_t c=s[i];for(int shift=12;shift>=0;shift-=4)out+=t[(c>>shift)&15];}return out.empty()?"-":out;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);char op;std::string id;int offset,initial;while(std::cin>>op>>id>>offset>>initial){auto name=unhex(id);UErrorCode e=U_ZERO_ERROR;uloc_setDefault(name.c_str(),&e);TimeZone::adoptDefault(new Zone(offset));clones=0;UDate before=Calendar::getNow();std::unique_ptr<GregorianCalendar>cal; e=UErrorCode(initial);
if(op=='S')cal.reset(new GregorianCalendar(e));else if(op=='L')cal.reset(new GregorianCalendar(Locale(name.c_str()),e));else if(op=='A')cal.reset(new GregorianCalendar(new Zone(offset),Locale(name.c_str()),e));else if(op=='N')cal.reset(new GregorianCalendar(static_cast<TimeZone*>(nullptr),Locale(name.c_str()),e));else if(op=='R'||op=='B'||op=='P'||op=='F'){Zone zone(offset,op=='B',op=='P'?&e:nullptr);cal.reset(op=='F'?new GregorianCalendar(static_cast<const TimeZone&>(zone),e):new GregorianCalendar(static_cast<const TimeZone&>(zone),Locale(name.c_str()),e));}else if(op=='Z')cal.reset(new GregorianCalendar(new Zone(offset),e));else if(op=='D')cal.reset(new GregorianCalendar(2024,1,29,e));else if(op=='H')cal.reset(new GregorianCalendar(1582,9,10,25,-1,e));else if(op=='T')cal.reset(new GregorianCalendar(0,-13,40,25,-90,120,e));else{UErrorCode prep=U_ZERO_ERROR;GregorianCalendar original(new Zone(offset),Locale(name.c_str()),prep);original.setTime(-0.25,prep);original.get(UCAL_DATE,prep);original.set(UCAL_HOUR_OF_DAY,23);original.setLenient(false);original.setRepeatedWallTimeOption(UCAL_WALLTIME_FIRST);original.fIsGregorian=false;original.fInvertGregorian=true;if(op=='C')cal.reset(new GregorianCalendar(original));else if(op=='K')cal.reset(original.clone());else{cal.reset(new GregorianCalendar(e));*cal=original;if(op=='E')*cal=*cal;}}
std::cout<<std::defaultfloat<<int(e)<<' '<<clones<<' '<<int(cal->fZone!=nullptr);for(int kind:{0,1}){UErrorCode s=U_ZERO_ERROR;std::cout<<' '<<hex(cal->getLocaleID(ULocDataLocaleType(kind),s))<<' '<<int(s);}if(U_FAILURE(e)){std::cout<<'\n';continue;}
std::cout<<' '<<int(cal->fIsTimeSet)<<' '<<int(cal->fAreFieldsSet)<<' '<<int(cal->fAreAllFieldsSet)<<' '<<int(cal->fAreFieldsVirtuallySet)<<' '<<int(cal->fNextStamp)<<' '<<int(cal->fLenient)<<' '<<int(cal->fRepeatedWallTime)<<' '<<int(cal->fSkippedWallTime)<<' '<<cal->fGregorianCutover<<' '<<cal->fCutoverJulianDay<<' '<<cal->fGregorianCutoverYear<<' '<<int(cal->fIsGregorian)<<' '<<int(cal->fInvertGregorian)<<' '<<int(cal->fFirstDayOfWeek)<<' '<<int(cal->fMinimalDaysInFirstWeek);
for(int i=0;i<UCAL_FIELD_COUNT;++i)std::cout<<' '<<cal->fFields[i]<<' '<<int(cal->fStamp[i]);UnicodeString zone;cal->getTimeZone().getID(zone);std::cout<<' '<<uhex(zone)<<' '<<cal->getTimeZone().getRawOffset();
if(op=='S'||op=='L'||op=='A'||op=='R'||op=='F'||op=='Z'){std::cout<<' '<<int(before<=cal->fTime&&cal->fTime<=Calendar::getNow());cal->setTime(0,e);}else std::cout<<" -";
auto time=cal->getTime(e);std::cout<<' '<<std::fixed<<time<<' '<<int(e);for(int i=0;i<UCAL_FIELD_COUNT;++i)std::cout<<' '<<cal->get(UCalendarDateFields(i),e);std::cout<<' '<<int(e);for(double date:{0.,86400000.,172800000.,-86400000.,1710000000000.}){UErrorCode s=U_ZERO_ERROR;bool result=cal->isWeekend(date,s);std::cout<<' '<<int(result)<<' '<<int(s);}std::cout<<' '<<int(cal->isWeekend())<<' '<<clones<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/gregorian-constructor-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/gregorian-constructor-witness`,
  ],
  { stdio: "inherit" },
);
let clones = 0;
/** Controlled real zone subclass observes the actual virtual clone boundary. */
class Zone extends SimpleTimeZone {
  /** Native clone behavior supplies a deliberate nullptr for the reference-constructor error branch. @param offset - Offset. @param fail - Null clone. @param change - Optional aliased caller status. @returns Zone. */
  constructor(offset, fail = false, change = null) {
    super(offset, new UnicodeString("fixture"));
    this.fail = fail;
    this.change = change;
  }
  /** Source clone counter, without a substitute offset algorithm. @returns Clone/null witness. */
  clone() {
    ++clones;
    if (this.change !== null) this.change[0] = 17;
    return this.fail ? null : new Zone(this.getRawOffset());
  }
}
/** Narrow C transport. @param text - String/null. @returns Hex. */
function hex(text) {
  return text === null ? "~" : Buffer.from(text.split("\0")[0], "latin1").toString("hex") || "-";
}
/** Counted UTF16 transport. @param text - Text. @returns Hex. */
function uhex(text) {
  let out = "";
  for (let i = 0; i < text.length; ++i) out += text.charCodeAt(i).toString(16).padStart(4, "0");
  return out || "-";
}
const input = [],
  expected = [],
  counts = {};
/** Runs an actual source constructor and public observations. @param op - Constructor form. @param name - Locale/default. @param offset - Zone offset. @param initial - Status. @returns Nothing. */
function add(op, name, offset, initial) {
  input.push([op, hex(name), offset, initial].join(" "));
  counts[op] = (counts[op] ?? 0) + 1;
  locale_set_default_internal(name, [0]);
  adoptDefault(new Zone(offset));
  clones = 0;
  const before = GregorianCalendar.getNow(),
    status = [initial];
  let cal;
  if (op === "S") cal = new GregorianCalendar(status);
  else if (op === "L") cal = new GregorianCalendar(new Locale(name), status);
  else if (op === "A") cal = new GregorianCalendar(new Zone(offset), new Locale(name), status);
  else if (op === "N") cal = new GregorianCalendar(null, new Locale(name), status);
  else if (op === "F") cal = GregorianCalendar.fromZoneReference(new Zone(offset), status);
  else if (op === "R" || op === "B" || op === "P")
    cal = GregorianCalendar.fromZoneReference(
      new Zone(offset, op === "B", op === "P" ? status : null),
      new Locale(name),
      status,
    );
  else if (op === "Z") cal = new GregorianCalendar(new Zone(offset), status);
  else if (op === "D") cal = new GregorianCalendar(2024, 1, 29, status);
  else if (op === "H") cal = new GregorianCalendar(1582, 9, 10, 25, -1, status);
  else if (op === "T") cal = new GregorianCalendar(0, -13, 40, 25, -90, 120, status);
  else {
    const original = new GregorianCalendar(new Zone(offset), new Locale(name), [0]);
    original.setTime(-0.25, [0]);
    original.get(5, [0]);
    original.set(11, 23);
    original.setLenient(false);
    original.setRepeatedWallTimeOption(1);
    // Controlled private-state witness distinguishes copy-construction from assignment.
    original.fIsGregorian = false;
    original.fInvertGregorian = true;
    if (op === "C") cal = new GregorianCalendar(original);
    else if (op === "K") cal = original.clone();
    else {
      cal = new GregorianCalendar(status);
      cal.assign(original);
      if (op === "E") cal.assign(cal);
    }
  }
  const out = [status[0], clones, Number(cal.fZone !== null)];
  for (const kind of [0, 1]) {
    const s = [0];
    out.push(hex(cal.getLocaleID(kind, s)), s[0]);
  }
  if (status[0] > 0) {
    expected.push(out.join(" "));
    return;
  }
  out.push(
    Number(cal.fIsTimeSet),
    Number(cal.fAreFieldsSet),
    Number(cal.fAreAllFieldsSet),
    Number(cal.fAreFieldsVirtuallySet),
    cal.fNextStamp,
    Number(cal.fLenient),
    cal.fRepeatedWallTime,
    cal.fSkippedWallTime,
    cal.fGregorianCutover.toExponential(5),
    cal.fCutoverJulianDay,
    cal.fGregorianCutoverYear,
    Number(cal.fIsGregorian),
    Number(cal.fInvertGregorian),
    cal.fFirstDayOfWeek,
    cal.fMinimalDaysInFirstWeek,
  );
  for (let i = 0; i < 24; ++i) out.push(cal.fFields[i], cal.fStamp[i]);
  const zone = new UnicodeString();
  cal.getTimeZone().getID(zone);
  out.push(uhex(zone.getBuffer()), cal.getTimeZone().getRawOffset());
  if (["S", "L", "A", "R", "F", "Z"].includes(op)) {
    out.push(Number(before <= cal.fTime && cal.fTime <= GregorianCalendar.getNow()));
    cal.setTime(0, status);
  } else out.push("-");
  const time = cal.getTime(status);
  out.push(time.toFixed(6), status[0]);
  for (let i = 0; i < 24; ++i) out.push(cal.get(i, status));
  out.push(status[0]);
  for (const date of [0, 86400000, 172800000, -86400000, 1710000000000]) {
    const s = [0],
      result = cal.isWeekend(date, s);
    out.push(Number(result), s[0]);
  }
  out.push(Number(cal.isWeekend()), clones);
  expected.push(out.join(" "));
}
for (const name of [
  "en_US",
  "en_GB",
  "root",
  "ru_RU",
  "ar_SA",
  "th_TH",
  "zh_Hant_TW",
  "en@fw=mon",
  "en@timezone=Asia/Kolkata",
  "en@timezone=America/New_York",
])
  for (const offset of [0, 19800000, -18000000])
    for (const op of [
      "S",
      "L",
      "A",
      "N",
      "R",
      "B",
      "P",
      "F",
      "Z",
      "D",
      "H",
      "T",
      "C",
      "K",
      "Q",
      "E",
    ])
      for (const initial of [0, -128, 1]) {
        add(op, name, offset, initial);
      }
const output = execFileSync(`${build}/gregorian-constructor-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
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
    counts,
    result: "all match unchanged ICU78.3 source",
    scope:
      "Constructors, adoption/reference clone boundaries and null clones, base/derived copy/assignment/clone, all fields/stamps/flags/locales, date/clock distinction, completed time and weekend clone observations",
  }),
);
