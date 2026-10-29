/** @fileoverview Native ICU78.3 EraRules resource/index/sentinel/start-date comparison on the pinned package. The original clock determines current-era queries in both processes; custom/malformed resource injection is outside this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { writeIcuObservations } from "./icu-fixture-observations.mjs";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { EraRules } from "../apps/office/src/external/icu/source/i18n/erarules.ts";
import { gCalTypes } from "../apps/office/src/external/icu/source/i18n/calendar.type.ts";
const build = resolve(process.env.VITE_OFFICE_ICU_NATIVE_BUILD ?? "output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/era-witness.cc`,
  String.raw`
#include "erarules.h"
#include "unicode/putil.h"
#include <iostream>
#include <memory>
using namespace icu;
int main(int argc,char**argv){u_setDataDirectory(argv[1]);std::string name;int tentative,incoming,code,year,month,day;while(std::cin>>name>>tentative>>incoming>>code>>year>>month>>day){UErrorCode s=UErrorCode(incoming);std::unique_ptr<EraRules>r(EraRules::createInstance(name.c_str(),tentative,s));std::cout<<int(s)<<' '<<bool(r);if(r){std::cout<<' '<<r->getMaxEraCode()<<' '<<r->getNumberOfEras()<<' '<<r->getCurrentEraCode();int32_t date[3]={91,92,93};s=UErrorCode(incoming);r->getStartDate(code,date,s);std::cout<<' '<<date[0]<<' '<<date[1]<<' '<<date[2]<<' '<<int(s);s=UErrorCode(incoming);auto y=r->getStartYear(code,s);std::cout<<' '<<y<<' '<<int(s);s=UErrorCode(incoming);auto e=r->getEraCode(year,month,day,s);std::cout<<' '<<e<<' '<<int(s);}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/era-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/era-witness`,
  ],
  { stdio: "inherit" },
);
const inputs = [],
  expected = [];
/** Adds a complete public era query. @param name - Calendar type. @param tentative - Include tentative. @param incoming - Sticky status. @param code - Era index. @param date - Query YMD. @returns Nothing. */
function add(name, tentative, incoming, code, date) {
  const s = [incoming],
    r = EraRules.createInstance(name, Boolean(tentative), s),
    out = [s[0], Number(r !== null)];
  if (r) {
    out.push(r.getMaxEraCode(), r.getNumberOfEras(), r.getCurrentEraCode());
    const fields = [91, 92, 93];
    s[0] = incoming;
    r.getStartDate(code, fields, s);
    out.push(...fields, s[0]);
    s[0] = incoming;
    out.push(r.getStartYear(code, s), s[0]);
    s[0] = incoming;
    out.push(r.getEraCode(...date, s), s[0]);
  }
  inputs.push([name, tentative, incoming, code, ...date].join(" "));
  expected.push(out.join(" "));
}
for (const name of [...gCalTypes, "missing"])
  for (const tentative of [0, 1]) {
    const r = EraRules.createInstance(name, Boolean(tentative), [0]),
      max = r?.getMaxEraCode() ?? 0;
    for (const code of new Set([
      -2147483648,
      -1,
      0,
      1,
      2,
      4,
      100,
      235,
      236,
      237,
      max,
      max + 1,
      2147483647,
    ]))
      for (const incoming of [0, -128, 1])
        for (const date of [
          [-2147483648, 1, 1],
          [-2147483648, 2, 1],
          [-2147483648, 1, 2],
          [-2147483648, 2, 2],
          [-32769, 1, 1],
          [-1, 1, 1],
          [1, 1, 1],
          [1868, 1, 1],
          [1989, 1, 7],
          [1989, 1, 8],
          [2019, 4, 30],
          [2019, 5, 1],
          [2026, 10, 28],
          [32768, 12, 31],
          [2024, 0, 1],
          [2024, 12, 32],
        ])
          add(name, tentative, incoming, code, date);
  }
const actual = execFileSync(`${build}/era-witness`, [`${source}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error("Era length");
for (let i = 0; i < actual.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Era ${i}: ${inputs[i]}\nnative ${actual[i]}\nlocal ${expected[i]}`);
console.log(
  `Matched ${actual.length} EraRules resource, sentinel, sparse-index and public lookup cases.`,
);

writeIcuObservations("era", inputs, actual, build, source, [
  "i18n/erarules.cpp",
  "common/uresbund.cpp",
  "common/uresdata.cpp",
]);
