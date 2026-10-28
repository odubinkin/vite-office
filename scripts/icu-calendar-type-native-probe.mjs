/** @fileoverview Compares original calendar.cpp static type-selection functions compiled unchanged against their port on complete pinned locale data. This does not claim Calendar creation or LibreOffice date input completion. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  gCalTypes,
  getCalendarType,
  getCalendarTypeForLocale,
  isStandardSupportedKeyword,
} from "../apps/office/src/external/icu/source/i18n/calendar.type.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/calendar-type-witness.cc`,
  String.raw`
#include "calendar.cpp"
#include "unicode/putil.h"
#include <iostream>
#include <string>
using namespace icu;
std::string unhex(std::string s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);char op;std::string text;int incoming;while(std::cin>>op>>text>>incoming){auto value=unhex(text);if(op=='T'){UErrorCode s=UErrorCode(incoming);std::cout<<getCalendarType(value.c_str())<<' '<<int(isStandardSupportedKeyword(value.c_str(),s))<<' '<<int(s);}else std::cout<<getCalendarTypeForLocale(value.c_str());std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/calendar-type-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/calendar-type-witness`,
  ],
  { stdio: "inherit" },
);
const input = [],
  expected = [];
/** Sends actual native narrow strings without a shell/string parsing heuristic. @param op - Source function. @param value - C input storage. @param incoming - Status. @returns Nothing. */
function add(op, value, incoming = 0) {
  input.push(`${op} ${Buffer.from(value, "latin1").toString("hex") || "-"} ${incoming}`);
  if (op === "T") {
    const s = [incoming];
    expected.push(
      `${getCalendarType(value)} ${Number(isStandardSupportedKeyword(value, s))} ${s[0]}`,
    );
  } else expected.push(String(getCalendarTypeForLocale(value)));
}
for (const name of [
  ...gCalTypes,
  "",
  "missing",
  "GREGORIAN",
  "Islamic-Civil",
  "gregorian\0extra",
  "gregorian ",
  "ISO8601",
  "iso-8601",
])
  for (const s of [0, -128, 1]) add("T", name, s);
const packageData = JSON.parse(
  readFileSync(
    resolve("apps/office/src/external/icu/source/data/in/icudt78l.resources.json"),
    "utf8",
  ),
);

const names = [
  ...Object.keys(packageData.bundles),
  "",
  "root",
  "en",
  "en_US",
  "th_TH",
  "ar_SA",
  "fa_IR",
  "ja_JP_TRADITIONAL",
  "zh_TW",
  "am_ET",
  "hi_IN",
  "en@rg=thzzzz",
  "en@calendar=missing;rg=irzzzz",
  "und-u-ca-buddhist",
  "en-u-rg-sazzzz",
  "en@calendar=gregorian\0;rg=THzzzz",
];
for (const region of ["US", "TH", "SA", "IR", "ET", "TW", "JP", "CN", "IN", "AF", "001", "ZZ"]) {
  for (const type of [...gCalTypes, "missing", "", "GREGORIAN"]) {
    names.push(`und_${region}@calendar=${type}`);
    names.push(`en@calendar=${type};rg=${region.toLowerCase()}zzzz`);
  }
}
for (const name of names) add("L", name);
const actual = execFileSync(`${build}/calendar-type-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
for (let i = 0; i < expected.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Type mismatch ${i}: ${input[i]}\nC++ ${actual[i]}\nTS ${expected[i]}`);
if (actual.length !== expected.length) throw Error("Type witness length mismatch");
writeFileSync(
  `${build}/calendar-type-comparison.json`,
  JSON.stringify(
    {
      result: "pass",
      cases: input.length,
      localeNames: names.length,
      scope:
        "Original type table and complete selector on native keyword, legacy canonicalization, region/rg/supplemental resource paths",
    },
    null,
    2,
  ) + "\n",
);
process.stdout.write(readFileSync(`${build}/calendar-type-comparison.json`, "utf8"));
