/** @fileoverview Compares actual ICU78.3 complete internal forLanguageTag ByteSink conversion with the port over real key/type data and partial parser cases. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { ulocimp_forLanguageTag } from "../apps/office/src/external/icu/source/common/uloc_tag.convert.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  data = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/keyTypeData.json", "utf8"),
  ).resource.value;
writeFileSync(
  `${build}/language-tag-conversion-witness.cc`,
  String.raw`
#include "ulocimp.h"
#include "unicode/bytestream.h"
#include "unicode/putil.h"
#include <iostream>
#include <string>
int main(int argc,char**argv){if(argc!=2)return 2;u_setDataDirectory(argv[1]);int n,len,incoming,hasParsed;while(std::cin>>n>>len>>incoming>>hasParsed){std::string text;int x;for(int i=0;i<n;i++){std::cin>>x;text.push_back(char(x));}std::string value="seed";icu::StringByteSink<std::string>sink(&value);int32_t parsed=77;UErrorCode status=UErrorCode(incoming);ulocimp_forLanguageTag(text.c_str(),len,sink,hasParsed?&parsed:nullptr,status);std::cout<<int(status)<<' '<<parsed<<' '<<value.size()<<' ';for(unsigned char c:value)std::cout<<int(c)<<' ';std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/language-tag-conversion-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/language-tag-conversion-witness`,
  ],
  { stdio: "inherit" },
);
const ids = new Set([
  "",
  "en",
  "und",
  "x-private",
  "und-u-ca-gregory",
  "u-ca-gregory",
  "en-u-ca",
  "en-u-ca-gregory",
  "en-u-ca-gregory-ca-buddhist",
  "en-u-zz-abc",
  "en-u-zz",
  "en-u-foo-bar-foo-ca-gregory",
  "en-u-12-ca-gregory",
  "en-posix-1901-z-value-a-test",
  "en-US-u-va-posix",
  "en-u-va-posix",
  "und-u-va-posix",
  "und-posix-u-va-posix",
  "en-posix-u-va-posix",
  "en-posix-u-kn",
  "en-u-va-posix-va-posix",
  "en-u-tz-usnyc",
  "en-u-rg-GBzzzz",
  "en-x-foo-lvariant-posix",
  "en-x-foo-LVARIANT-posix",
  "i-default-u-ca-gregory",
  "zh-cmn-Hans-u-ca-gregory",
  "en-u",
  "en-u-ca-x",
  "en\0-u-ca-gregory",
  "en-x-lvariantLONG-short",
]);
for (const legacy of data.keyMap.keys) {
  const key = data.keyMap.value[legacy].value || legacy,
    types = data.typeMap.value[legacy];
  for (const name of types.keys) {
    const type = types.value[name].value || name;
    ids.add(`en-u-${key}-${type}`);
    ids.add(`und-u-${key}-${type}`);
    ids.add(`EN-us-u-${key.toUpperCase()}-${type.toUpperCase()}`);
  }
  const aliases = data.bcpTypeAlias.value[key];
  if (aliases) for (const type of aliases.keys) ids.add(`en-u-${key}-${type}`);
  for (const type of [
    "",
    "true",
    "yes",
    "0000",
    "10FFFF",
    "FFFFFF",
    "abcd-ef12",
    "latn-digit",
    "Latn-Grek",
    "gbzzzz",
    "419zzzz",
    "not-a-valid-type",
  ])
    ids.add(`en-u-${key}${type ? "-" + type : ""}`);
}
for (let i = 0; i < 256; ++i)
  for (const pattern of ["en-u-ca-gr%gory", "en-u-%a-hello", "en-u-zz-ab%c", "en-x-%"])
    ids.add(pattern.replace("%", String.fromCharCode(i)));
let seed = 4157331;
for (let i = 0; i < 2500; ++i) {
  let text = "en-u";
  const pieces = [
    "ca",
    "gregory",
    "buddhist",
    "co",
    "phonebk",
    "kn",
    "true",
    "yes",
    "zz",
    "va",
    "posix",
    "12",
    "a1",
    "foo",
    "bar",
    "foo",
    "",
    "tz",
    "usnyc",
    "x",
    "lvariant",
    "bad!",
  ];
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const n = seed % 14;
  for (let j = 0; j < n; ++j) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    text += "-" + pieces[seed % pieces.length];
  }
  ids.add(text);
}
/** Encodes exact narrow spans. @param text - String. @returns Units. */
function bytes(text) {
  const values = [];
  for (let i = 0; i < text.length; ++i) values.push(text.charCodeAt(i));
  return values;
}
const input = [],
  expected = [];
for (const text of ids)
  for (const len of [-1, text.length, Math.max(0, text.length - 1)])
    for (const incoming of [-128, 0, 1])
      for (const hasParsed of [true, false]) {
        const s = [incoming],
          p = [77];
        let output = "seed";
        ulocimp_forLanguageTag(
          text,
          len,
          {
            /** Appends to the actual preexisting sink. @param value - Narrow span. @returns Nothing. */ Append(
              value,
            ) {
              output += value;
            },
          },
          hasParsed ? p : null,
          s,
        );
        input.push([text.length, len, incoming, Number(hasParsed), ...bytes(text)].join(" "));
        expected.push([s[0], p[0], output.length, ...bytes(output)].join(" "));
      }
const actual = execFileSync(`${build}/language-tag-conversion-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i].trim() !== expected[i])
    throw Error(`Case ${i} input ${input[i]}, native ${actual[i]}, port ${expected[i]}`);
const report = {
  result: "pass",
  cases: input.length,
  tagSpans: ids.size,
  sources: Object.fromEntries(
    ["common/uloc_tag.cpp", "common/uloc_keytype.cpp", "data/in/icudt78l.dat"].map(
      /** Records unchanged source/data identities. @param path - Source. @returns Hash pair. */ (
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
    "Actual unchanged ICU78.3 internal ByteSink forLanguageTag with real parser/key/type/resources. Full source map/type/alias inputs, duplicate/attribute/POSIX/private-use rules, partial and explicit/NUL parsing, exact output/status/parsedLength and preexisting sink append. Native allocator/pools/mutex/lifetime/ABI, reverse conversion, public C buffer capacity/termination and complete Locale/calendar construction remain uncertified.",
};
writeFileSync(
  `${build}/language-tag-conversion-comparison.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
