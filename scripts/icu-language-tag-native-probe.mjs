/** @fileoverview Compiles unchanged original ICU78.3 uloc_tag.cpp in the witness translation unit and compares its actual internal parser/getters. No native access modifiers or implementation bodies are rewritten. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import * as T from "../apps/office/src/external/icu/source/common/uloc_tag.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  tables = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/uloc_tag.json", "utf8"),
  ).tables;
writeFileSync(
  `${build}/language-tag-witness.cc`,
  String.raw`
#include "${source}/common/uloc_tag.cpp"
#include <iostream>
#include <string>
void print(const char*s){if(!s){std::cout<<-1<<' ';return;}int n=int(strlen(s));std::cout<<n<<' ';for(int i=0;i<n;i++)std::cout<<int(static_cast<unsigned char>(s[i]))<<' ';}
int main(){char op;int n,len,initial,hasParsed;while(std::cin>>op>>n>>len>>initial>>hasParsed){std::string text;int byte;for(int i=0;i<n;i++){std::cin>>byte;text.push_back(char(byte));}if(op=='P'){std::cout<<int(ultag_isLanguageSubtag(text.c_str(),len))<<' '<<int(ultag_isScriptSubtag(text.c_str(),len))<<' '<<int(ultag_isRegionSubtag(text.c_str(),len))<<' '<<int(ultag_isVariantSubtags(text.c_str(),len))<<' '<<int(ultag_isExtensionSubtags(text.c_str(),len))<<' '<<int(ultag_isPrivateuseValueSubtags(text.c_str(),len))<<' '<<int(ultag_isUnicodeLocaleAttribute(text.c_str(),len))<<' '<<int(ultag_isUnicodeLocaleAttributes(text.c_str(),len))<<' '<<int(ultag_isUnicodeLocaleKey(text.c_str(),len))<<' '<<int(ultag_isUnicodeLocaleType(text.c_str(),len))<<' '<<'\n';continue;}int32_t parsed=77;UErrorCode status=UErrorCode(initial);auto*t=ultag_parse(text.c_str(),len,hasParsed?&parsed:nullptr,status);std::cout<<int(status)<<' '<<parsed<<' '<<int(t!=nullptr)<<' ';if(t){print(ultag_getLanguage(t));print(ultag_getScript(t));print(ultag_getRegion(t));print(ultag_getPrivateUse(t));std::cout<<ultag_getExtlangSize(t)<<' ';for(int i=-1;i<=3;i++)print(ultag_getExtlang(t,i));int size=ultag_getVariantsSize(t);std::cout<<size<<' ';for(int i=-1;i<=size;i++)print(ultag_getVariant(t,i));size=ultag_getExtensionsSize(t);std::cout<<size<<' ';for(int i=-1;i<=size;i++){print(ultag_getExtensionKey(t,i));print(ultag_getExtensionValue(t,i));}ultag_close(t);}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/language-tag-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/language-tag-witness`,
  ],
  { stdio: "inherit" },
);
/** Encodes the exact selected native byte view. @param value - Narrow string. @returns Bytes. */
function bytes(value) {
  const result = [];
  for (let i = 0; i < value.length; ++i) result.push(value.charCodeAt(i));
  return result;
}
const ids = new Set([
  "",
  "e",
  "EN",
  "abcd",
  "en-US",
  "en-Latn-419-1901-posix-u-ca-gregory-x-hello",
  "en-abc-def-ghi-jkl",
  "en-abc-def-ghi-Latn-US",
  "en-posix-POSIX",
  "en-u",
  "en-u-ca-x",
  "en-u-ca-a-key-u-dupe",
  "en-z-value-a-test",
  "x-private",
  "X-Private",
  "en-x-foo-lvariant-posix",
  "en-x-foo-LVARIANT-posix",
  "en-x-lvariant-prefix",
  "en-x-lvariantLONG-short",
  "en-u-ca-gregory-x-hello-lvariant-test",
  "en-1901-1996-u-co-phonebk",
  "en--US",
  "en_US",
  "en_US-u-ca-gregory",
  "en\0-US",
  "en-US-x-aa\0-z-value",
]);
for (const table of Object.values(tables))
  for (let i = 0; i < table.length; i += 2)
    for (const suffix of ["", "-US", "-u-ca-gregory", "-x-hello", "-", "-bad!", "!not-prefix"]) {
      ids.add(table[i] + suffix);
      ids.add(table[i].toUpperCase() + suffix);
    }
for (let i = 0; i < 256; ++i)
  for (const pattern of ["%", "en-%", "en-Lat%-US", "en-US-posi%", "en-u-%-hello", "en-x-fo%"]) {
    ids.add(pattern.replace("%", String.fromCharCode(i)));
  }
let seed = 453765;
for (let i = 0; i < 3000; ++i) {
  const pieces = [
    "en",
    "ABC",
    "zh",
    "und",
    "US",
    "Latn",
    "419",
    "posix",
    "1901",
    "u",
    "a",
    "X",
    "x",
    "ca",
    "gregory",
    "lvariant",
    "LVARIANT",
    "test",
    "bad!",
    "",
  ];
  let id = "";
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const n = seed % 12;
  for (let j = 0; j < n; ++j) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    id += (j ? "-" : "") + pieces[seed % pieces.length];
  }
  ids.add(id);
}
for (const n of [7, 8, 9, 179, 180, 200]) {
  ids.add("a".repeat(n));
  ids.add("en-" + "a".repeat(n));
  ids.add("en-x-lvariant-" + "a".repeat(n));
}
const input = [],
  expected = [];
/** Serializes source getter null/empty/count distinctions. @param value - Original narrow view or null. @returns Native units. */
function encode(value) {
  return value === null ? [-1] : [value.length, ...bytes(value)];
}
/** Compares all observable internal owner/getter paths for one input. @param text - Narrow input. @param len - Source length. @param incoming - Status. @param hasParsed - Optional output. @returns Nothing. */
function add(text, len, incoming, hasParsed) {
  const s = [incoming],
    p = [77],
    tag = T.ultag_parse(text, len, hasParsed ? p : null, s),
    row = [s[0], p[0], Number(tag !== null)];
  if (tag !== null) {
    row.push(
      ...encode(T.ultag_getLanguage(tag)),
      ...encode(T.ultag_getScript(tag)),
      ...encode(T.ultag_getRegion(tag)),
      ...encode(T.ultag_getPrivateUse(tag)),
      T.ultag_getExtlangSize(tag),
    );
    for (let i = -1; i <= 3; ++i) row.push(...encode(T.ultag_getExtlang(tag, i)));
    let n = T.ultag_getVariantsSize(tag);
    row.push(n);
    for (let i = -1; i <= n; ++i) row.push(...encode(T.ultag_getVariant(tag, i)));
    n = T.ultag_getExtensionsSize(tag);
    row.push(n);
    for (let i = -1; i <= n; ++i)
      row.push(
        ...encode(T.ultag_getExtensionKey(tag, i)),
        ...encode(T.ultag_getExtensionValue(tag, i)),
      );
  }
  input.push(["T", text.length, len, incoming, Number(hasParsed), ...bytes(text)].join(" "));
  expected.push(row.join(" "));
}
for (const text of ids)
  for (const len of [-1, text.length, Math.max(0, text.length - 1)])
    for (const incoming of [-128, 0, 1])
      for (const hasParsed of [true, false]) add(text, len, incoming, hasParsed);
for (const text of [
  "en-US-posix-u-ca-gregory-x-private",
  "i-default-u-ca-gregory",
  "zh-cmn-hans-u-ca-gregory",
  "en-x-foo-lvariantLONG-abcd",
  "en-z-hello-a-value-a-duplicate",
])
  for (let len = 0; len <= text.length; ++len) add(text, len, 0, true);
// Large invalid subtags retain source partial-success behavior without a host function-argument limit.
add("en-" + "a".repeat(200000), 200003, 0, true);
const parserCases = input.length;
for (const text of ids)
  for (const len of [-1, text.length, Math.max(0, text.length - 1)]) {
    input.push(["P", text.length, len, 0, 0, ...bytes(text)].join(" "));
    expected.push(
      [
        T.ultag_isLanguageSubtag,
        T.ultag_isScriptSubtag,
        T.ultag_isRegionSubtag,
        T.ultag_isVariantSubtags,
        T.ultag_isExtensionSubtags,
        T.ultag_isPrivateuseValueSubtags,
        T.ultag_isUnicodeLocaleAttribute,
        T.ultag_isUnicodeLocaleAttributes,
        T.ultag_isUnicodeLocaleKey,
        T.ultag_isUnicodeLocaleType,
      ]
        .map(
          /** Observes the actual original predicate contract. @param test - Predicate. @returns Native bool. */ (
            test,
          ) => Number(test(text, len)),
        )
        .join(" "),
    );
  }
const actual = execFileSync(`${build}/language-tag-witness`, [], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i].trim() !== expected[i])
    throw Error(
      `Case ${i}: input ${input[i].slice(0, 1000)}, native ${actual[i]}, port ${expected[i]}`,
    );
const report = {
  result: "pass",
  cases: input.length,
  parserCases,
  syntaxCases: input.length - parserCases,
  tagSpans: ids.size,
  sources: {
    "common/uloc_tag.cpp": createHash("sha256")
      .update(readFileSync(`${source}/common/uloc_tag.cpp`))
      .digest("hex"),
  },
  scope:
    "Entire original uloc_tag.cpp is included unchanged in the witness translation unit; remaining original ICU78.3 common/stubdata libraries resolve dependencies. Internal parser and all consumed getters compare exact values/null/empty/list-order/partial lengths, explicit/NUL lengths, replacements, byte payloads and sticky statuses. Owned offsets project source pointers; native allocator/destruction/ABI/EBCDIC, invalid source ranges, complete Locale conversion and calendar construction are not certified.",
};
writeFileSync(`${build}/language-tag-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
