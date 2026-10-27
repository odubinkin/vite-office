/** @fileoverview Compares actual SimpleTimeZone constructors, rule mutations and UTC/local/field offsets with unchanged ICU78.3. Uses existing common/i18n/stubdata native libraries under output/native/AQF9AG-icu-grego; run with tsx. Transition-rule object/query APIs and system/IANA factories are outside this witness. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { BasicTimeZone } from "../apps/office/src/external/icu/source/i18n/basictz.ts";
import { Grego } from "../apps/office/src/external/icu/source/i18n/gregoimp.ts";

const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/simpletz-witness.cc`,
  String.raw`
#include "unicode/simpletz.h"
#include "unicode/putil.h"
#include <iostream>
#include <cstdlib>
#include <string>
#include <vector>
using namespace icu;
int main(int argc,char**argv){
 if(argc!=2)return 2;u_setDataDirectory(argv[1]);int raw,sm,sd,sw,st,stm,em,ed,ew,et,etm,sav,sy;char kind;std::string text;int local,non,dup,incoming;
 while(std::cin>>raw>>sm>>sd>>sw>>st>>stm>>em>>ed>>ew>>et>>etm>>sav>>sy>>kind>>text>>local>>non>>dup>>incoming){
  UErrorCode init=U_ZERO_ERROR;SimpleTimeZone zone=kind=='A'?SimpleTimeZone(raw,u"fixture",int8_t(sm),int8_t(sd),int8_t(sw),st,int8_t(em),int8_t(ed),int8_t(ew),et,init):kind=='H'?SimpleTimeZone(raw,u"fixture",int8_t(sm),int8_t(sd),int8_t(sw),st,int8_t(em),int8_t(ed),int8_t(ew),et,sav,init):kind=='K'?SimpleTimeZone(raw,u"fixture"):SimpleTimeZone(raw,u"fixture",int8_t(sm),int8_t(sd),int8_t(sw),st,SimpleTimeZone::TimeMode(stm),int8_t(em),int8_t(ed),int8_t(ew),et,SimpleTimeZone::TimeMode(etm),sav,init);zone.setStartYear(sy);
  UErrorCode s=UErrorCode(incoming);int r=99,d=88,total=0;std::vector<int> extra;double t=std::strtod(text.c_str(),nullptr);
  if(kind=='D'||kind=='A'||kind=='H'||kind=='K')zone.getOffset(t,bool(local),r,d,s);
  else if(kind=='B')zone.BasicTimeZone::getOffsetFromLocal(t,UTimeZoneLocalOption(non),UTimeZoneLocalOption(dup),r,d,s);
  else if(kind=='L')zone.getOffsetFromLocal(t,UTimeZoneLocalOption(non),UTimeZoneLocalOption(dup),r,d,s);
  else if(kind=='F'){
   int era,year,month,day,dow,ms,len,prev;std::cin>>era>>year>>month>>day>>dow>>ms>>len>>prev;
   if(local==7)total=zone.getOffset(uint8_t(era),year,month,day,uint8_t(dow),ms,s);
   else if(local==8)total=zone.getOffset(uint8_t(era),year,month,day,uint8_t(dow),ms,len,s);
   else total=zone.getOffset(uint8_t(era),year,month,day,uint8_t(dow),ms,len,prev,s);
  }else if(kind=='M'){
   int op,a,b,c,time,mode;std::cin>>op>>a>>b>>c>>time>>mode;
   if(op==0)zone.setStartRule(a,b,c,time,SimpleTimeZone::TimeMode(mode),s);
   else if(op==1)zone.setEndRule(a,b,c,time,SimpleTimeZone::TimeMode(mode),s);
   else if(op==2)zone.setDSTSavings(a,s);
   else if(op==3)zone.setRawOffset(a);
   else zone.setStartYear(a);
   UErrorCode query=U_ZERO_ERROR;zone.getOffset(t,false,r,d,query);total=int(query);
  }else if(kind=='I'){
   int count,bogus,length,isNull;std::cin>>count>>bogus>>length>>isNull;std::vector<char16_t> chars(count+1,0);for(int i=0;i<count;i++){int unit;std::cin>>unit;chars[i]=char16_t(unit);}
   UnicodeString id(isNull?nullptr:chars.data(),length);if(bogus)id.setToBogus();UnicodeString snapshot(id),out;zone.setID(id);SimpleTimeZone* copy=zone.clone();
   extra={int(id.isBogus()),id.length(),int(zone==*copy),int(zone.hasSameRules(*copy)),int(&zone.getID(out)==&out),int(out.isBogus()),out.length(),int(out.charAt(-1)),int(out.charAt(count))};
   for(int i=0;i<count;i++)extra.push_back(int(out.charAt(i)));
   id.setToBogus();zone.getID(out);extra.push_back(int(out==snapshot));copy->setID(UnicodeString(u"other"));extra.push_back(int(zone==*copy));extra.push_back(int(zone.hasSameRules(*copy)));delete copy;
  }
  std::cout<<int(init)<<' '<<zone.getRawOffset()<<' '<<zone.getDSTSavings()<<' '<<int(zone.useDaylightTime())<<' '<<r<<' '<<d<<' '<<total<<' '<<int(s);for(auto value:extra)std::cout<<' '<<value;std::cout<<'\n';
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
    `${build}/simpletz-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/simpletz-witness`,
  ],
  { stdio: "inherit" },
);
const input = [],
  expected = [];
/** Adds one original constructor/query/mutation observation. Constructor status starts successful so scalar fields are initialized even on a later rule error. @param cfg - Native explicit-mode rule arguments plus start year. @param kind - Source query. @param time - Epoch milliseconds. @param local - Local flag or field overload arity. @param non - Gap option. @param dup - Overlap option. @param incoming - Query status. @param fields - Optional field tuple/mutation payload. @returns Nothing. */
function add(cfg, kind, time, local = 0, non = 4, dup = 12, incoming = 0, fields = []) {
  const [raw, sm, sd, sw, st, stm, em, ed, ew, et, etm, savings, year] = cfg,
    init = [0];
  const zone =
    kind === "A"
      ? new SimpleTimeZone(raw, new UnicodeString("fixture"), sm, sd, sw, st, em, ed, ew, et, init)
      : kind === "H"
        ? new SimpleTimeZone(
            raw,
            new UnicodeString("fixture"),
            sm,
            sd,
            sw,
            st,
            em,
            ed,
            ew,
            et,
            savings,
            init,
          )
        : kind === "K"
          ? new SimpleTimeZone(raw, new UnicodeString("fixture"))
          : new SimpleTimeZone(
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
              savings,
              init,
            );
  zone.setStartYear(year);
  const s = [incoming],
    r = [99],
    d = [88];
  let total = 0,
    extra = [];
  if (kind === "D" || kind === "A" || kind === "H" || kind === "K")
    zone.getOffset(time, !!local, r, d, s);
  else if (kind === "B")
    BasicTimeZone.prototype.getOffsetFromLocal.call(zone, time, non, dup, r, d, s);
  else if (kind === "L") zone.getOffsetFromLocal(time, non, dup, r, d, s);
  else if (kind === "F") {
    const [era, y, m, dom, dow, ms, len, prev] = fields;
    total =
      local === 7
        ? zone.getOffsetForFieldsWithoutMonthLength(era, y, m, dom, dow, ms, s)
        : local === 8
          ? zone.getOffsetForFields(era, y, m, dom, dow, ms, len, s)
          : zone.getOffsetForFieldsWithPreviousMonthLength(era, y, m, dom, dow, ms, len, prev, s);
  } else if (kind === "I") {
    const [count, bogus, length, isNull, ...units] = fields,
      id = new UnicodeString(isNull ? null : String.fromCharCode(...units), length);
    if (bogus) id.setToBogus();
    const before = new UnicodeString(id),
      out = new UnicodeString();
    zone.setID(id);
    const copy = zone.clone();
    extra = [
      Number(id.isBogus()),
      id.length(),
      Number(zone.equals(copy)),
      Number(zone.hasSameRules(copy)),
      Number(zone.getID(out) === out),
      Number(out.isBogus()),
      out.length(),
      out.charAt(-1),
      out.charAt(count),
    ];
    for (let i = 0; i < count; i++) extra.push(out.charAt(i));
    id.setToBogus();
    zone.getID(out);
    extra.push(Number(out.equals(before)));
    copy.setID(new UnicodeString("other"));
    extra.push(Number(zone.equals(copy)), Number(zone.hasSameRules(copy)));
  } else {
    const [op, a, b, c, ms, mode] = fields;
    if (op === 0) zone.setStartRule(a, b, c, ms, mode, s);
    else if (op === 1) zone.setEndRule(a, b, c, ms, mode, s);
    else if (op === 2) zone.setDSTSavings(a, s);
    else if (op === 3) zone.setRawOffset(a);
    else zone.setStartYear(a);
    const query = [0];
    zone.getOffset(time, false, r, d, query);
    total = query[0];
  }
  input.push(
    `${cfg.join(" ")} ${kind} ${Object.is(time, -0) ? "-0" : time} ${local} ${non} ${dup} ${incoming} ${fields.join(" ")}`,
  );
  expected.push([
    init[0],
    zone.getRawOffset(),
    zone.getDSTSavings(),
    Number(zone.useDaylightTime()),
    r[0],
    d[0],
    total,
    s[0],
    ...extra,
  ]);
}
const configs = [];
for (const raw of [-43200000, -18000000, 0, 19800000, 46800000])
  for (const startMode of [0, 1, 2])
    for (const endMode of [0, 1, 2])
      for (const savings of [-3600000, 1800000, 3600000])
        for (const south of [false, true]) {
          configs.push([
            raw,
            south ? 9 : 2,
            2,
            1,
            7200000,
            startMode,
            south ? 2 : 10,
            1,
            1,
            7200000,
            endMode,
            savings,
            2000,
          ]);
        }
configs.push(
  [0, 2, 14, 0, 0, 0, 10, 7, 0, 86400000, 0, 3600000, 0],
  [0, 2, 8, -1, 7200000, 0, 10, -25, -1, 7200000, 0, 3600000, 0],
  [0, 1, 29, 0, 0, 0, 9, -1, 1, 86400000, 0, 3600000, 0],
  [0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 3600000, 0],
  [0, 2, 14, -128, 0, 0, 10, -7, -128, 0, 0, 3600000, 0],
);
for (let i = 0; i < configs.length; i++) {
  const cfg = configs[i];
  for (const month of [0, 1, 2, 3, 6, 9, 10, 11])
    for (const year of [0, 1999, 2000, 2023, 2024]) {
      const time = Number(Grego.fieldsToDay(year, month, 15)) * 86400000 + 3600000;
      add(cfg, "D", time);
      add(cfg, "D", time, 1);
    }
  for (const date of [
    [2024, 2, 10],
    [2024, 10, 3],
    [2024, 9, 13],
    [2024, 2, 3],
  ])
    for (const hour of [0, 1, 1.5, 2, 2.5, 3, 4]) {
      const time = Number(Grego.fieldsToDay(...date)) * 86400000 + hour * 3600000;
      for (const option of [0, 4, 5, 7, 12, 13, 15]) add(cfg, "L", time, 0, option, option);
    }
}
const basic = [-18000000, 2, 2, 1, 7200000, 0, 10, 1, 1, 7200000, 0, 3600000, 2000];
for (const time of [-Number.MIN_VALUE, 0, 1710037800000, 1730597400000])
  for (const status of [-128, 0, 1, 16])
    for (const raw of [0, -18000000]) {
      const cfg = [...basic];
      cfg[0] = raw;
      add(cfg, "D", time, 0, 4, 12, status);
      add(cfg, "L", time, 0, 4, 12, status);
    }
for (const arity of [7, 8, 9])
  for (const status of [-128, 0, 1, 16])
    for (const tuple of [
      [1, 2024, 1, 29, 5, 0, 28, 31],
      [1, 2024, 12, 1, 1, 0, 31, 31],
      [1, 2024, 2, 10, 1, 7200000, 31, 29],
      [0, 1, 0, 1, 1, 0, 31, 31],
      [256, 2024, 0, 1, 257, 0, 31, 31],
      [1, 2024, 1, 30, 1, 0, 31, 31],
      [1, 2024, 2, 10, 8, 0, 31, 29],
      [1, 2024, 2, 10, 1, -1, 31, 29],
      [1, 2024, 2, 10, 1, 86400000, 31, 29],
      [1, 2024, 2, 10, 1, 0, 32, 27],
    ])
      add(basic, "F", 0, arity, 4, 12, status, tuple);
for (const status of [-128, 0, 1, 16])
  for (const op of [0, 1])
    for (const rule of [
      [2, 0, 0, 0, 0],
      [2, -2, 0, 0, 0],
      [12, 1, 1, 0, 0],
      [130, 1, 1, 0, 0],
      [2, 14, -128, 0, 0],
      [2, 1, 8, 0, 0],
      [2, 6, 1, 0, 0],
      [2, 14, 0, 86400001, 0],
      [2, 14, 0, 0, 3],
    ])
      add(basic, "M", 1710037800000, 0, 4, 12, status, [op, ...rule]);
for (const status of [-128, 0, 1, 16])
  for (const value of [-3600000, 0, 1800000, 3600000])
    add(basic, "M", 1710037800000, 0, 4, 12, status, [2, value, 0, 0, 0, 0]);
for (const units of [
  [],
  [65],
  [65, 0, 66],
  [0],
  [0xffff],
  [0xd800],
  [0xdc00],
  [0xd83d, 0xde00],
  [65, 0xffff, 66],
  Array.from(
    { length: 60 },
    /** Builds non-ASCII UTF-16 identity. @param _ - Unused slot. @param i - Code-unit index. @returns Unit. */ (
      _,
      i,
    ) => 0x400 + i,
  ),
])
  for (const bogus of [0, 1])
    for (const length of [-2, -1, 0, units.length])
      for (const isNull of [0, 1])
        add(basic, "I", 0, 0, 4, 12, 0, [units.length, bogus, length, isNull, ...units]);
for (const kind of ["A", "H", "K"])
  for (const time of [0, 1710054000000, 1719878400000, 1730611800000])
    for (const raw of [-18000000, 0, 19800000])
      for (const status of [-128, 0, 1, 16]) {
        const cfg = [...basic];
        cfg[0] = raw;
        add(cfg, kind, time, 0, 4, 12, status);
      }
for (const status of [-128, 0, 1, 16]) add(basic, "B", 0, 0, 4, 12, status);
const actual = execFileSync(`${build}/simpletz-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Native rows ${actual.length} != ${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const row = actual[i].split(" ");
  if (
    row.length !== expected[i].length ||
    row.some(
      /** Compares exact original scalar outputs. @param value - Native field. @param index - Field index. @returns Mismatch. */ (
        value,
        index,
      ) => Number(value) !== expected[i][index],
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
      "i18n/simpletz.cpp",
      "i18n/timezone.cpp",
      "i18n/basictz.cpp",
      "i18n/unicode/simpletz.h",
      "common/unistr.cpp",
      "common/unicode/unistr.h",
    ].map(
      /** Captures unchanged original identity. @param path - Source-relative path. @returns Hash pair. */ (
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
    "Actual SimpleTimeZone numeric rule construction, UTC/local/field offsets and selected mutations, including negative savings and byte narrowing. Native source is unchanged; transition objects/queries, IANA/system factories and full UnicodeString buffer/storage/ABI semantics are outside scope.",
};
writeFileSync(`${build}/simpletz-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
