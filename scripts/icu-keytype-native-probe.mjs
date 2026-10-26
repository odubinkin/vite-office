/** @fileoverview Compares actual ICU78.3 resource-backed key/type maps, source syntax fallbacks and public C wrappers including input-alias view identity. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import * as K from "../apps/office/src/external/icu/source/common/uloc_keytype.ts";
import { u_UCharsToChars } from "../apps/office/src/external/icu/source/common/uinvchar.ts";
import * as F from "../apps/office/src/external/icu/source/common/uloc.keytype.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  data = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/keyTypeData.json", "utf8"),
  ).resource.value;
writeFileSync(
  `${build}/keytype-witness.cc`,
  String.raw`
#include "ulocimp.h"
#include "unicode/uloc.h"
#include "unicode/putil.h"
#include "unicode/ustring.h"
#include <iostream>
#include <optional>
#include <string>
void print(std::optional<std::string_view> value,const std::string&input){if(!value){std::cout<<-1<<' ';return;}std::cout<<value->size()<<' '<<int(value->data()==input.data())<<' ';for(unsigned char c:*value)std::cout<<int(c)<<' ';}
void cprint(const char* value){if(!value){std::cout<<-1<<' ';return;}int n=0;while(value[n])n++;std::cout<<n<<' ';for(int i=0;i<n;++i)std::cout<<int(static_cast<unsigned char>(value[i]))<<' ';}
int main(int argc,char**argv){if(argc!=2)return 2;u_setDataDirectory(argv[1]);int kn,tn,flags;while(std::cin>>kn>>tn>>flags){std::string key,type;int x;for(int i=0;i<kn;++i){std::cin>>x;key.push_back(char(x));}for(int i=0;i<tn;++i){std::cin>>x;type.push_back(char(x));}print(ulocimp_toBcpKey(key),key);print(ulocimp_toLegacyKey(key),key);print(ulocimp_toBcpType(key,type),type);print(ulocimp_toLegacyType(key,type),type);print(ulocimp_toBcpKeyWithFallback(key),key);print(ulocimp_toLegacyKeyWithFallback(key),key);print(ulocimp_toBcpTypeWithFallback(key,type),type);print(ulocimp_toLegacyTypeWithFallback(key,type),type);const char*k=flags&1?nullptr:key.c_str(),*t=flags&2?nullptr:type.c_str();cprint(uloc_toUnicodeLocaleKey(k));cprint(uloc_toLegacyKey(k));cprint(uloc_toUnicodeLocaleType(k,t));cprint(uloc_toLegacyType(k,t));std::cout<<'\n';}char16_t u[65536];char c[65536];for(int i=0;i<65536;i++)u[i]=char16_t(i);u_UCharsToChars(u,c,65536);std::cout<<"I ";for(unsigned char value:c)std::cout<<int(value)<<' ';std::cout<<'\n';}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/keytype-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/keytype-witness`,
  ],
  { stdio: "inherit" },
);
/** Exact narrow span serialization. @param text - Span. @returns Bytes. */
function bytes(text) {
  const out = [];
  for (let i = 0; i < text.length; ++i) out.push(text.charCodeAt(i));
  return out;
}
const pairs = new Map();
/** Adds a unique counted key/type pair. @param key - Key. @param type - Type. @returns Nothing. */
function pair(key, type) {
  pairs.set(JSON.stringify([key, type]), [key, type]);
}
for (const legacy of data.keyMap.keys) {
  const bcp = data.keyMap.value[legacy].value || legacy,
    types = data.typeMap.value[legacy];
  for (const type of types.keys) {
    const bcpType = types.value[type].value || type;
    for (const key of [legacy, bcp, legacy.toUpperCase(), bcp.toUpperCase()])
      for (const value of [
        type,
        type.replaceAll(":", "/"),
        bcpType,
        bcpType.toUpperCase(),
        type + "\0suffix",
      ])
        pair(key, value);
  }
  for (const [table, name] of [
    [data.typeAlias, legacy],
    [data.bcpTypeAlias, bcp],
  ]) {
    const entries = table?.value[name];
    if (!entries) continue;
    for (const type of entries.keys)
      for (const key of [legacy, bcp])
        for (const value of [type, type.replaceAll(":", "/"), type.toUpperCase()]) pair(key, value);
  }
  for (const type of [
    "",
    "unknown-type",
    "TRUE",
    "yes",
    "a/b_c-d",
    "a+b",
    "0000",
    "10FFFF",
    "FFFFFF",
    "abcd-ef12",
    "123",
    "1234567",
    "latn-digit",
    "Latn-Grek",
    "abc123",
    "gbzzzz",
    "GBzzzz",
    "419zzzz",
    "gBZZZZ",
    "zzzzzz",
    "en\0x",
  ]) {
    pair(legacy, type);
    pair(bcp, type);
  }
  pair(legacy + "\0suffix", "unknown");
}
for (const key of ["", "zz", "x", "unknownKey", "ca\0x", "$", "1a", "a1"])
  for (const type of [
    "",
    "abc",
    "a+b",
    "a/b_c-d",
    "abc--def",
    "_abc",
    "abc_",
    "0000",
    "abc\0def",
    "TRUE",
    "en-US",
  ])
    pair(key, type);
for (let i = 0; i < 256; ++i)
  for (const key of ["zz", "ca", "timezone", "rg", "kr", "vt"])
    for (const pattern of ["%", "abc%def", "a%", "%a"])
      pair(key, pattern.replace("%", String.fromCharCode(i)));
const input = [],
  expected = [];
/** Observes native optional view and its input-pointer identity distinction. @param view - View/null. @returns Native fields. */
function encode(view) {
  return view === null ? [-1] : [view.value.length, Number(view.inputAlias), ...bytes(view.value)];
}
/** Observes the C facade string result. @param value - Value/null. @returns Native fields. */
function cencode(value) {
  return value === null ? [-1] : [value.length, ...bytes(value)];
}
for (const [key, type] of pairs.values())
  for (const flags of [0, 1, 2, 3]) {
    input.push([key.length, type.length, flags, ...bytes(key), ...bytes(type)].join(" "));
    const ckey = flags & 1 ? null : key,
      ctype = flags & 2 ? null : type;
    expected.push(
      [
        ...encode(K.ulocimp_toBcpKey(key)),
        ...encode(K.ulocimp_toLegacyKey(key)),
        ...encode(K.ulocimp_toBcpType(key, type)),
        ...encode(K.ulocimp_toLegacyType(key, type)),
        ...encode(F.ulocimp_toBcpKeyWithFallback(key)),
        ...encode(F.ulocimp_toLegacyKeyWithFallback(key)),
        ...encode(F.ulocimp_toBcpTypeWithFallback(key, type)),
        ...encode(F.ulocimp_toLegacyTypeWithFallback(key, type)),
        ...cencode(F.uloc_toUnicodeLocaleKey(ckey)),
        ...cencode(F.uloc_toLegacyKey(ckey)),
        ...cencode(F.uloc_toUnicodeLocaleType(ckey, ctype)),
        ...cencode(F.uloc_toLegacyType(ckey, ctype)),
      ].join(" "),
    );
  }
let allUnits = "";
for (let i = 0; i < 65536; ++i) allUnits += String.fromCharCode(i);
const invariantOutput = new Uint8Array(65536);
u_UCharsToChars(allUnits, invariantOutput, 65536);
expected.push(["I", ...invariantOutput].join(" "));
const actual = execFileSync(`${build}/keytype-witness`, [`${source}/data/in`], {
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
  pairs: pairs.size,
  invariantCases: 65536,
  sources: Object.fromEntries(
    [
      "common/uloc_keytype.cpp",
      "common/uloc.cpp",
      "common/uresbund.cpp",
      "common/uinvchar.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Records actual source/data identity. @param path - Source path. @returns Hash pair. */ (
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
    "Unchanged ICU78.3 libraries and pinned data. All key/type resource names and aliases, both map directions, C and counted views, ASCII casing, all byte values, special-type grammar, null C facade inputs and exact input-alias return identity. Counted release invariant conversion also compares all65536 UTF16 units. Native debug assertions/allocator/mutex/cleanup/ABI/EBCDIC and complete Locale/calendar integration remain uncertified.",
};
writeFileSync(`${build}/keytype-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
