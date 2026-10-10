/** @fileoverview Compiles unchanged original SAL UTF16 comparison scopes and captures complete initialized caller outputs. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const upstream = "vendor/libreoffice-reference";
const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/rtl-ustring-native";
const fixture = "apps/office/src/sal/rtl/native-reverse-compare-cases.json";
/** Hashes exact source bytes. @param text - Source bytes. @returns SHA256. */
function hash(text) {
  return createHash("sha256").update(text).digest("hex");
}
/** Extracts complete source without changing a body. @param text - Original source. @param first - Inclusive marker. @param last - Following marker. @returns Exact source interval. */
function scope(text, first, last) {
  const begin = text.indexOf(first),
    end = text.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing scope: ${first}`);
  return text.slice(begin, end);
}
const files = [
  "sal/rtl/strtmpl.hxx",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.h",
  "include/rtl/character.hxx",
];
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw new Error("Expected pinned upstream");
const sources = Object.fromEntries(
  files.map(
    /** Verifies the full pinned blob. @param path - Original file. @returns Source pair. */ (
      path,
    ) => {
      const text = readFileSync(`${upstream}/${path}`, "utf8");
      if (
        execFileSync("git", ["-C", upstream, "show", `${pin}:${path}`], { encoding: "utf8" }) !==
        text
      )
        throw new Error(`Modified upstream: ${path}`);
      return [path, text];
    },
  ),
);
const scopes = {
  unsigned: scope(sources[files[0]], "template <typename C> auto UChar(C c)", "// Wrappers"),
  comparison: scope(
    sources[files[0]],
    "template <typename C> void warnIfCharAndNotAscii",
    "struct CompareIgnoreAsciiCase",
  ),
  reverse: scope(
    sources[files[0]],
    "template <typename C1, typename C2, class Compare>\nsal_Int32 reverseCompare_WithLengths",
    "template <typename C> sal_Int32 hashCode_WithLength",
  ),
  wrapper: scope(
    sources[files[1]],
    "sal_Int32 SAL_CALL rtl_ustr_reverseCompare_WithLength",
    "sal_Int32 SAL_CALL rtl_ustr_compareIgnoreAsciiCase(",
  ),
  declaration: sources[files[2]].match(
    /SAL_DLLPUBLIC sal_Int32 SAL_CALL rtl_ustr_reverseCompare_WithLength\([\s\S]*?SAL_THROW_EXTERN_C\(\);/,
  )?.[0],
  ascii: scope(
    sources[files[3]],
    "inline SAL_CONSTEXPR bool isUnicodeCodePoint(sal_uInt32 code)",
    "\n#if defined LIBO_INTERNAL_ONLY\nbool isAscii",
  ),
};
if (
  Object.values(scopes).some(
    /** Checks complete scopes exist. @param text - Extracted source. @returns Absent flag. */ (
      text,
    ) => !text,
  )
)
  throw new Error("Incomplete source extraction");
const driver = `#include <cstdint>
#include <iostream>
#include <type_traits>
#include <vector>
#include <cassert>
using sal_Int32=std::int32_t;using sal_uInt32=std::uint32_t;using sal_Unicode=char16_t;
#define SAL_CONSTEXPR constexpr
#define SAL_CALL
#define SAL_DLLPUBLIC
#define SAL_THROW_EXTERN_C() noexcept
#define SAL_WARN_IF(...)
namespace rtl { ${scopes.ascii} }
namespace rtl::str { ${scopes.unsigned} ${scopes.comparison} ${scopes.reverse} }
${scopes.declaration}
${scopes.wrapper}
int main(int argc,char** argv){
 if(argc>1){int g=std::atoi(argv[1]);sal_Unicode a[]={0};switch(g){
 case 0:rtl_ustr_reverseCompare_WithLength(nullptr,1,a,0);break;
 case 1:rtl_ustr_reverseCompare_WithLength(a,-1,a,0);break;
 case 2:rtl_ustr_reverseCompare_WithLength(a,0,nullptr,1);break;
 case 3:rtl_ustr_reverseCompare_WithLength(a,0,a,-1);break;}return 0;}
 std::int64_t len1,len2;int null1,null2,count1,count2,offset1,offset2;bool first=true;
 std::cout<<'[';
 while(std::cin>>null1>>count1>>len1>>offset1>>null2>>count2>>len2>>offset2){
  std::vector<sal_Unicode>a(count1+offset1+2,65530),b(count2+offset2+2,65531);unsigned unit;
  for(int i=0;i<count1;++i){std::cin>>unit;a[offset1+i]=unit;}
  for(int i=0;i<count2;++i){std::cin>>unit;b[offset2+i]=unit;}
  const auto p1=null1?nullptr:a.data()+offset1;const auto p2=null2?nullptr:b.data()+offset2;
  if(!first)std::cout<<',';first=false;
  std::cout<<'['<<rtl::str::reverseCompare_WithLengths(p1,len1,p2,len2,rtl::str::CompareNormal())<<','<<rtl_ustr_reverseCompare_WithLength(p1,len1,p2,len2)<<']';
 }
 std::cout<<']';
}`;
const buffers = [
  null,
  [],
  ...[
    0, 1, 127, 128, 255, 256, 32767, 32768, 55295, 55296, 56319, 56320, 57343, 57344, 65534, 65535,
  ].map(
    /** Enumerates unsigned unit witnesses only. @param unit - Native scalar. @returns Caller buffer. */ (
      unit,
    ) => [unit],
  ),
  [65, 0, 66],
  [65, 0, 67],
  [88, 65, 0, 66],
  [65, 66],
  [90, 66],
  [65, 66, 0],
  [55296, 56320],
  [55297, 56320],
  [56320, 55296],
  [0, 65535, 32768, 1],
];
const calls = [];
for (let left = 0; left < buffers.length; left++)
  for (let right = 0; right < buffers.length; right++)
    for (let leftLength = 0; leftLength <= (buffers[left]?.length ?? 0); leftLength++)
      for (let rightLength = 0; rightLength <= (buffers[right]?.length ?? 0); rightLength++)
        for (const offset of [0, 3])
          calls.push({
            left,
            right,
            leftLength,
            rightLength,
            leftOffset: offset,
            rightOffset: 3 - offset,
          });
// Original C arguments also narrow from initialized integer caller values to sal_Int32 before comparison.
for (const leftLength of [4294967296, 4294967297])
  calls.push({ left: 2, right: 3, leftLength, rightLength: 1, leftOffset: 2, rightOffset: 1 });
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/driver.cpp`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    `${target}/driver.cpp`,
    "-o",
    `${target}/driver`,
  ],
  { timeout: 30000, stdio: "pipe" },
);
const input = calls
  .map(
    /** Serializes caller buffers and lengths without calculating an expected result. @param call - Native call input. @returns Driver input line. */ (
      call,
    ) => {
      const a = buffers[call.left],
        b = buffers[call.right];
      return [
        a === null ? 1 : 0,
        a?.length ?? 0,
        call.leftLength,
        call.leftOffset,
        b === null ? 1 : 0,
        b?.length ?? 0,
        call.rightLength,
        call.rightOffset,
        ...(a ?? []),
        ...(b ?? []),
      ].join(" ");
    },
  )
  .join("\n");
const output = execFileSync(`${target}/driver`, { input, encoding: "utf8", timeout: 30000 });
writeFileSync(`${target}/output.json`, output);
const outcomes = JSON.parse(output);
if (outcomes.length !== calls.length) throw new Error("Incomplete native output");
const guards = [];
for (const [index, expression] of [
  "pStr1 || nStr1Len == 0",
  "nStr1Len >= 0",
  "pStr2 || nStr2Len == 0",
  "nStr2Len >= 0",
].entries()) {
  const result = spawnSync(`${target}/driver`, [String(index)], {
    encoding: "utf8",
    timeout: 30000,
  });
  writeFileSync(`${target}/guard-${index}.stderr`, result.stderr);
  if (result.signal !== "SIGABRT" || !result.stderr.includes(expression))
    throw new Error(`Original assertion not observed: ${expression}`);
  guards.push({ index, expression, signal: result.signal });
}
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    files.map(
      /** Records full original source hashes. @param path - Original file. @returns Source digest pair. */ (
        path,
      ) => [path, hash(sources[path])],
    ),
  ),
  scopeHashes: Object.fromEntries(
    Object.entries(scopes).map(
      /** Records complete extracted scope hashes. @param entry - Scope. @returns Digest pair. */ ([
        key,
        text,
      ]) => [key, hash(text)],
    ),
  ),
  driverHash: hash(driver),
  buffers,
  cases: calls.map(
    /** Stores every genuine direct and public result. @param call - Input. @param index - Capture index. @returns Full observed call. */ (
      call,
      index,
    ) => ({ ...call, result: outcomes[index] }),
  ),
  guards,
};
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly --write or --check");
if (write) writeFileSync(fixture, JSON.stringify(record, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native fixture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    calls: calls.length,
    results: calls.length * 2,
    guards: guards.length,
    sourceFiles: files.length,
    scopes: Object.keys(scopes).length,
  }),
);
