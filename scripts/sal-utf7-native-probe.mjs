/** @fileoverview Captures original UTF-7 reverse conversion with sanitizers, including capacity and saved-state contracts. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = "vendor/libreoffice-reference/";
const target = "output/playwright/sal-utf7-native";
const sources = {};
/** Reads pinned original text. @param path - Upstream path. @returns Source text. */
function source(path) {
  const value = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(value).digest("hex");
  return value;
}
const native = source("sal/textenc/tcvtutf7.cxx").replace(/^#include.*$/gm, "");
const flags = [
  ...source("include/rtl/textcvt.h").matchAll(
    /^#define\s+(RTL_(?:TEXTTOUNICODE|UNICODETOTEXT)_[A-Z0-9_]+)\s+([^\n\\]+)$/gm,
  ),
]
  .map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) =>
      `#define ${m[1]} ${m[2]}`,
  )
  .join("\n");
const inputs = [
  [],
  [0x41, 0x2b, 0xe9, 0x5a],
  [0x0a, 0x0c, 0x0d, 0x09],
  [0xd800, 0xdc00],
  [0xd800],
  [0xdc00],
  [0xe9, 0xe9],
  [0x2b, 0x2b],
  [0x0, 0xffff, 0x41],
  Array.from(
    { length: 128 },
    /** Applies from to _, i. @param _ - _ value. @param i - i value. @returns Callback result. */ (
      _,
      i,
    ) => i,
  ),
];
const driver = String.raw`
#include <cstdint>
#include <cstddef>
#include <iostream>
#include <vector>
using sal_uInt32=std::uint32_t; using sal_Size=std::size_t; using sal_Unicode=char16_t;
#define SAL_UNUSED_PARAMETER
#define RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER 0xFFFD
${flags}
${native}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
int main(){
std::cout<<"{\"digests\":[";
for(unsigned capacity=0;capacity<=8;++capacity){std::uint32_t hash=2166136261u;for(unsigned c=0;c<65536;++c){sal_Unicode input=sal_Unicode(c);char out[32]{};ImplUTF7FromUCContextData context{true,0xDEADBEEF,17};sal_uInt32 info=99;sal_Size consumed=99;auto n=ImplUnicodeToUTF7(nullptr,&context,&input,1,out,capacity,0,&info,&consumed);hash=mix(hash,c);hash=mix(hash,n);hash=mix(hash,info);hash=mix(hash,consumed);hash=mix(hash,context.mbShifted);hash=mix(hash,context.mnBitBuffer);hash=mix(hash,context.mnBufferBits);for(sal_Size i=0;i<n;++i)hash=mix(hash,static_cast<unsigned char>(out[i]));}if(capacity)std::cout<<',';std::cout<<hash;}
std::cout<<"],\"cases\":[";std::vector<std::vector<sal_Unicode>> inputs={${inputs.map(/** Applies map to input. @param input - input value. @returns Callback result. */ (input) => `{${input.join(",")}}`).join(",")}};bool comma=false;
for(unsigned index=0;index<inputs.size();++index)for(unsigned capacity: {0u,1u,2u,3u,4u,5u,8u,512u})for(unsigned flags: {0u,0x101u,0x8000u}){
auto const& input=inputs[index];char out[1024]{};ImplUTF7FromUCContextData context{true,0xDEADBEEF,17};sal_uInt32 info=99;sal_Size consumed=99;auto n=ImplUnicodeToUTF7(nullptr,&context,input.data(),input.size(),out,capacity,flags,&info,&consumed);if(comma)std::cout<<',';comma=true;std::cout<<"{\"input\":"<<index<<",\"capacity\":"<<capacity<<",\"flags\":"<<flags<<",\"written\":"<<n<<",\"info\":"<<info<<",\"consumed\":"<<consumed<<",\"context\":["<<context.mbShifted<<','<<context.mnBitBuffer<<','<<context.mnBufferBits<<"],\"bytes\":[";for(sal_Size i=0;i<n;++i){if(i)std::cout<<',';std::cout<<unsigned(static_cast<unsigned char>(out[i]));}std::cout<<"]}";}
std::cout<<"]}\n";}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/probe.cxx`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    `${target}/probe.cxx`,
    "-o",
    `${target}/probe`,
  ],
  { stdio: "inherit" },
);
const result = JSON.parse(execFileSync(`${target}/probe`, { encoding: "utf8" }));
const fixture = {
  baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
  driverHash: createHash("sha256").update(driver).digest("hex"),
  scope:
    "Unchanged original tcvtutf7.cxx; primitive SAL type bindings, original textcvt.h flags, no replacement service. AddressSanitizer and UndefinedBehaviorSanitizer enabled. Reverse conversion bytes, info, consumption and final state; not a full SAL service certificate.",
  sources,
  inputs,
  ...result,
};
writeFileSync(
  "apps/office/src/sal/textenc/tcvtutf7.encode.native.json",
  `${JSON.stringify(fixture, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    bmpCases: 65536 * result.digests.length,
    vectorCases: result.cases.length,
    sanitized: true,
  }),
);
