/** @fileoverview Compares actual ICU78.3 keyword/Locale/C-buffer/factory contracts, including untouched guard bytes, partial writes and exact capacity warnings. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import * as K from "../apps/office/src/external/icu/source/common/uloc.keywordvalue.ts";
import * as C from "../apps/office/src/external/icu/source/common/uloc.buffer.ts";
import { uloc_forLanguageTag } from "../apps/office/src/external/icu/source/common/uloc_tag.convert.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import {
  forLocaleOrDefault,
  setDefault,
} from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
import { OlsonTimeZone } from "../apps/office/src/external/icu/source/i18n/olsontz.ts";
import { getGMT } from "../apps/office/src/external/icu/source/i18n/timezone.create.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/keywordvalue-witness.cc`,
  String.raw`
#include "ulocimp.h"
#include "unicode/uloc.h"
#include "unicode/locid.h"
#include "unicode/bytestream.h"
#include "unicode/putil.h"
#include "unicode/timezone.h"
#include "olsontz.h"
#include <iostream>
#include <string>
#include <vector>
using namespace icu;
std::string read(){int n;std::cin>>n;std::string v;int c;for(int i=0;i<n;i++){std::cin>>c;v.push_back(char(c));}return v;}
void emit(const std::string&v){std::cout<<v.size()<<' ';for(unsigned char c:v)std::cout<<int(c)<<' ';}
int main(int argc,char**argv){if(argc!=2)return 2;u_setDataDirectory(argv[1]);UErrorCode initial=U_ZERO_ERROR;Locale::setDefault(Locale("en_US"),initial);TimeZone::setDefault(*TimeZone::getGMT());char op;while(std::cin>>op){int flags,incoming,cap;std::cin>>flags>>incoming>>cap;auto id=read(),key=read();UErrorCode s=UErrorCode(incoming);Locale locale(flags&1?nullptr:id.c_str());if(flags&4)locale.setToBogus();if(op=='I'){for(int which=0;which<3;which++){s=UErrorCode(incoming);std::string value="seed";StringByteSink<std::string>sink(&value);if(which==0)ulocimp_getKeywordValue(flags&1?nullptr:id.c_str(),std::string_view(key.data(),key.size()),sink,s);else if(which==1)locale.getKeywordValue(StringPiece(key.data(),int(key.size())),sink,s);else locale.getUnicodeKeywordValue(StringPiece(key.data(),int(key.size())),sink,s);std::cout<<int(s)<<' ';emit(value);}}else if(op=='K'){for(int which=0;which<2;which++){s=UErrorCode(incoming);std::vector<char>buffer((cap>0?cap:0)+8,77);char*p=flags&8?nullptr:buffer.data();int n=which==0?uloc_getKeywordValue(flags&1?nullptr:id.c_str(),flags&2?nullptr:key.c_str(),p,cap,&s):locale.getKeywordValue(flags&2?nullptr:key.c_str(),p,cap,s);std::cout<<n<<' '<<int(s)<<' ';for(unsigned char c:buffer)std::cout<<int(c)<<' ';}}else if(op=='P'){for(int which=0;which<8;which++){s=UErrorCode(incoming);std::vector<char>buffer((cap>0?cap:0)+8,77);char*p=flags&8?nullptr:buffer.data();const char*t=flags&1?nullptr:id.c_str();int32_t parsed=77,n=0;switch(which){case 0:n=uloc_getName(t,p,cap,&s);break;case 1:n=uloc_getBaseName(t,p,cap,&s);break;case 2:n=uloc_canonicalize(t,p,cap,&s);break;case 3:n=uloc_getLanguage(t,p,cap,&s);break;case 4:n=uloc_getScript(t,p,cap,&s);break;case 5:n=uloc_getCountry(t,p,cap,&s);break;case 6:n=uloc_getVariant(t,p,cap,&s);break;case 7:n=uloc_forLanguageTag(id.c_str(),p,cap,flags&16?nullptr:&parsed,&s);break;}std::cout<<n<<' '<<int(s)<<' '<<parsed<<' ';for(unsigned char c:buffer)std::cout<<int(c)<<' ';}}else{auto*a=TimeZone::forLocaleOrDefault(locale),*b=TimeZone::forLocaleOrDefault(locale);UnicodeString name;a->getID(name);std::cout<<int(a!=b)<<' '<<int(dynamic_cast<OlsonTimeZone*>(a)!=nullptr)<<' '<<name.length()<<' ';for(int i=0;i<name.length();i++)std::cout<<int(name[i])<<' ';int32_t raw=0,dst=0;s=U_ZERO_ERROR;a->getOffset(0,false,raw,dst,s);std::cout<<raw<<' '<<dst<<' '<<int(s)<<' ';delete a;delete b;}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/keywordvalue-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/keywordvalue-witness`,
  ],
  { stdio: "inherit" },
);
/** Encodes actual counted narrow units. @param text - Span. @returns Source operands. */
function units(text) {
  const result = [text.length];
  for (let i = 0; i < text.length; ++i) result.push(text.charCodeAt(i));
  return result;
}
Locale.setDefault(new Locale("en_US"), [0]);
setDefault(getGMT());
const inputs = [],
  expected = [],
  counts = { I: 0, K: 0, P: 0, Z: 0 };
/** Executes original logical operations over actual owners. @param op - Operation. @param flags - Nullable/overload flags. @param incoming - Status. @param cap - Capacity. @param id - C locale input. @param key - Counted/C keyword input. @returns Nothing. */
function add(op, flags, incoming, cap, id, key) {
  const locale = new Locale(flags & 1 ? null : id);
  if (flags & 4) locale.setToBogus();
  const row = [];
  if (op === "I")
    for (let which = 0; which < 3; which++) {
      const s = [incoming];
      let output = "seed";
      const sink = {
        /** Retains actual partial output. @param value - Span. @returns Nothing. */ Append(value) {
          output += value;
        },
      };
      if (which === 0) K.ulocimp_getKeywordValue(flags & 1 ? null : id, key, sink, s);
      else if (which === 1) locale.getKeywordValue(key, sink, s);
      else locale.getUnicodeKeywordValue(key, sink, s);
      row.push(s[0], ...units(output));
    }
  else if (op === "K")
    for (let which = 0; which < 2; which++) {
      const s = [incoming],
        buffer = new Uint8Array(Math.max(cap, 0) + 8).fill(77),
        pointer = flags & 8 ? null : buffer;
      const n =
        which === 0
          ? K.uloc_getKeywordValue(flags & 1 ? null : id, flags & 2 ? null : key, pointer, cap, s)
          : locale.getKeywordValue(flags & 2 ? null : key, pointer, cap, s);
      row.push(n, s[0], ...buffer);
    }
  else if (op === "P")
    for (let which = 0; which < 8; which++) {
      const s = [incoming],
        buffer = new Uint8Array(Math.max(cap, 0) + 8).fill(77),
        pointer = flags & 8 ? null : buffer,
        parsed = [77];
      let n;
      if (which === 7) n = uloc_forLanguageTag(id, pointer, cap, flags & 16 ? null : parsed, s);
      else
        n = [
          C.uloc_getName,
          C.uloc_getBaseName,
          C.uloc_canonicalize,
          C.uloc_getLanguage,
          C.uloc_getScript,
          C.uloc_getCountry,
          C.uloc_getVariant,
        ][which](flags & 1 ? null : id, pointer, cap, s);
      row.push(n, s[0], parsed[0], ...buffer);
    }
  else {
    const a = forLocaleOrDefault(locale),
      b = forLocaleOrDefault(locale),
      name = new UnicodeString(),
      raw = [0],
      dst = [0],
      s = [0];
    a.getOffset(0, false, raw, dst, s);
    const id = a.getID(name).getBuffer();
    row.push(
      Number(a !== b),
      Number(a instanceof OlsonTimeZone),
      ...units(id),
      raw[0],
      dst[0],
      s[0],
    );
  }
  inputs.push([op, flags, incoming, cap, ...units(id), ...units(key)].join(" "));
  expected.push(row.join(" "));
  ++counts[op];
}
const pairs = new Map();
/** Registers a source input pair. @param id - Locale. @param key - Key. @returns Nothing. */
function pair(id, key) {
  pairs.set(JSON.stringify([id, key]), [id, key]);
}
for (const id of [
  "",
  "en_US",
  "@calendar=gregorian",
  "en@calendar=gregorian;fw=mon;timezone=America/New_York",
  "en-u-ca-gregory-fw-mon-tz-usnyc",
  "en@a=AbC-1_x/y+z",
  "en@a=ABC!bad;b=ok",
  "en@a=bad!;b=good",
  "en@a=first;a=second",
  "en@a=1;",
  "en@a=1; ",
  "en@a=1;;b=2",
  "en@ a a =x;aa=y",
  "en@=x",
  "en@b=;a=good",
  "en\0@a=hidden",
  "en@a=ok\0;z=x",
])
  for (const key of [
    "a",
    "A",
    "b",
    "aa",
    "calendar",
    "ca",
    "fw",
    "timezone",
    "tz",
    "",
    "a b",
    "a\0tail",
  ])
    pair(id, key);
for (let i = 0; i < 256; ++i)
  for (const pattern of ["en@a=ab%c", "en@a%=value", "en@bad=%;a=ok"])
    pair(pattern.replace("%", String.fromCharCode(i)), "a");
for (const n of [23, 24, 25, 64, 95, 96, 97, 128]) {
  pair("en@a=" + "x".repeat(n), "a");
  pair("en@" + "a".repeat(n) + "=value", "a".repeat(n));
}
for (const [id, key] of pairs.values()) {
  for (const incoming of [-128, -124, 0, 1])
    for (const flags of [0, 4]) add("I", flags, incoming, 0, id, key);
  for (const cap of [-1, 0, 1, 2, 8, 24, 96])
    for (const incoming of [-128, -124, 0, 1])
      for (const flags of [0, 4]) add("K", flags, incoming, cap, id, key);
}
for (const flags of [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  for (const cap of [0, -1])
    for (const incoming of [0, 1]) {
      add("K", flags, incoming, cap, "en@a=good", "a");
      add("I", flags, incoming, cap, "en@a=good", "a");
    }
for (const id of [
  "",
  "en_US",
  "en-u-ca-gregory",
  "en_US@a=1;b",
  "en_US@a=ABC!bad",
  "en.utf8@FOO",
  "art__LOJBAN",
  "ENG_latn_USA_posix",
  "en-u",
  "en\0_US",
  "en_US_" + "a".repeat(180),
])
  for (const cap of [-1, 0, 1, 2, 8, 16, 17, 18, 96])
    for (const incoming of [-128, -124, 0, 1])
      for (const flags of [0, 1]) add("P", flags, incoming, cap, id, "");
for (const id of [
  "",
  "@timezone=America/New_York",
  "@timezone=GMT+05:30",
  "@timezone=Not/AZone",
  "@timezone=America/New_York!",
  "en-u-tz-usnyc",
  "@timezone=" + "x".repeat(95),
  "@timezone=" + "x".repeat(96),
  "@timezone=" + "x".repeat(97),
])
  for (const flags of [0, 4]) add("Z", flags, 0, 0, id, "");
const actual = execFileSync(`${build}/keywordvalue-witness`, [`${source}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++)
  if (actual[i].trim() !== expected[i])
    throw Error(`Row ${i} input ${inputs[i]}, native ${actual[i]}, port ${expected[i]}`);
const report = {
  result: "pass",
  cases: inputs.length,
  operations: counts,
  sources: Object.fromEntries(
    [
      "common/uloc.cpp",
      "common/locid.cpp",
      "common/bytesinkutil.h",
      "common/bytestream.cpp",
      "common/ustring.cpp",
      "i18n/timezone.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Records source/data identity. @param path - Source. @returns Hash pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Unchanged ICU78.3 classes/libraries/data. Internal and Locale keyword/Unicode lookups, C buffer/facade capacities with full guard-byte observation, partial error output, C/counted/null/bogus differences, statuses including termination warning, and actual locale/default timezone dispatch. Native invalid pointer/readable ranges, non-identical overlapping memcpy, allocator/mutex/ABI and full Calendar/service/CSV completion remain uncertified.",
};
writeFileSync(`${build}/keywordvalue-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
