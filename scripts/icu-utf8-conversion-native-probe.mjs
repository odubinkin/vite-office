/** @fileoverview Compares complete original ICU78.3 UTF-8 scanner/converter mutations with the port; no alternate decoder or native source replacement. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { utf8_nextCharSafeBody } from "../apps/office/src/external/icu/source/common/utf_impl.ts";
import {
  u_strFromUTF8,
  u_strFromUTF8WithSub,
} from "../apps/office/src/external/icu/source/common/ustrtrns.ts";
import { u_terminateUChars } from "../apps/office/src/external/icu/source/common/ustring.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/utf8-conversion`;
const cpp = String.raw`
#include "unicode/ustring.h"
#include "unicode/utf8.h"
#include "ustr_imp.h"
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
int main(){char op;int n,length,strict,cap,sub,err,flags;
 while(cin>>op){
  if(op=='S')cin>>length>>strict>>n;
  else if(op=='T')cin>>cap>>length>>err>>flags>>n;
  else cin>>cap>>length>>sub>>err>>flags>>n;
  vector<uint8_t> input(n+8,0);int value;for(int i=0;i<n;++i){cin>>value;input[i]=value;}
  if(op=='S'){int32_t i=1;UChar32 c=utf8_nextCharSafeBody(input.data(),&i,length,input[0],strict);cout<<c<<' '<<i<<'\n';}
  else if(op=='T'){char16_t output[16];fill_n(output,16,0xcafe);UErrorCode status=UErrorCode(err);int32_t result=u_terminateUChars((flags&2)?nullptr:output,cap,length,(flags&1)?nullptr:&status);cout<<result<<' '<<int(status);for(int j=0;j<16;++j)cout<<' '<<uint32_t(output[j]);cout<<'\n';}
  else{char16_t output[16];fill_n(output,16,0xcafe);UErrorCode status=UErrorCode(err);int32_t len=1234,count=5678;auto dest=(flags&2)?nullptr:output;auto src=(flags&1)?nullptr:reinterpret_cast<const char*>(input.data());
   auto result=(flags&16)?u_strFromUTF8(dest,cap,(flags&4)?nullptr:&len,src,length,&status):u_strFromUTF8WithSub(dest,cap,(flags&4)?nullptr:&len,src,length,sub,(flags&8)?nullptr:&count,&status);
   cout<<int(result==nullptr)<<' '<<int(result==dest)<<' '<<len<<' '<<count<<' '<<int(status);for(int j=0;j<16;++j)cout<<' '<<uint32_t(output[j]);cout<<'\n';
  }
 }
}
`;
writeFileSync(`${prefix}.cpp`, cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
/** Runs the genuine local scanner/converter, preserving output sentinels and all allocated destination cells. @param item - Command fields. @returns Observed fields. */
function local(item) {
  const [op, ...args] = item;
  if (op === "T") {
    const [cap, len, initial, flags] = args;
    const output = new Uint16Array(16).fill(0xcafe),
      status = [initial];
    const result = u_terminateUChars(
      flags & 2 ? null : output,
      cap,
      len,
      flags & 1 ? null : status,
    );
    return [result, status[0], ...output];
  }
  let bytes, length, strict;
  if (op === "S") {
    [length, strict, bytes] = args;
    const input = new Uint8Array(bytes.length + 8);
    input.set(bytes);
    const index = [1];
    const result = utf8_nextCharSafeBody(input, index, length, input[0], strict);
    return [result, index[0]];
  }
  const [cap, len, sub, initial, flags, data] = args;
  const input = new Uint8Array(data.length + 8);
  input.set(data);
  const output = new Uint16Array(16).fill(0xcafe),
    status = [initial],
    size = [1234],
    count = [5678],
    dest = flags & 2 ? null : output,
    src = flags & 1 ? null : input;
  const result =
    flags & 16
      ? u_strFromUTF8(dest, cap, flags & 4 ? null : size, src, len, status)
      : u_strFromUTF8WithSub(
          dest,
          cap,
          flags & 4 ? null : size,
          src,
          len,
          sub,
          flags & 8 ? null : count,
          status,
        );
  return [
    Number(result === null),
    Number(result === dest),
    size[0],
    count[0],
    status[0],
    ...output,
  ];
}
/** Serializes the original witness command without decoding input bytes. @param item - Command. @returns Line. */
function command(item) {
  const bytes = item.at(-1);
  return [...item.slice(0, -1), bytes.length, ...bytes].join(" ");
}
const groups = [];
/** Compares every original result and mutation before persisting selected replay rows. @param name - Group name. @param cases - Actual calls. @param retain - Whether full native rows belong in the replay fixture. @returns Nothing. */
function compare(name, cases, retain) {
  const stdout = execFileSync(prefix, {
    input: cases.map(command).join("\n") + "\n",
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const rows = stdout.trimEnd().split("\n");
  if (rows.length !== cases.length) throw Error(`Native count mismatch ${name}`);
  const observations = [];
  for (let i = 0; i < cases.length; ++i) {
    const expected = rows[i].split(" ").map(Number),
      actual = local(cases[i]);
    if (JSON.stringify(expected) !== JSON.stringify(actual))
      throw Error(`${name} ${i} ${JSON.stringify(cases[i])}\nnative=${expected}\nlocal=${actual}`);
    if (retain) observations.push(expected);
  }
  groups.push({
    name,
    count: cases.length,
    nativeSha256: createHash("sha256").update(stdout).digest("hex"),
    ...(retain ? { cases, observations } : {}),
  });
  process.stdout.write(`Matched ${name}: ${cases.length} complete native calls.\n`);
}
const modes = [-3, -2, -1, 0, 1, 2],
  scanner = [];
for (let a = 128; a < 256; ++a)
  for (let b = 0; b < 256; ++b) for (const strict of modes) scanner.push(["S", 2, strict, [a, b]]);
compare("all-leading-byte-pairs", scanner, false);
const allPairs = [];
for (let a = 0; a < 256; ++a)
  for (let b = 0; b < 256; ++b)
    for (const cap of [0, 1, 2]) allPairs.push(["C", cap, 2, 0xfffd, 0, 0, [a, b]]);
compare("all-counted-byte-pairs", allPairs, false);
const corpus = [
  [],
  [0],
  [65],
  [65, 0, 66],
  [0x80],
  [0xc0, 0xaf],
  [0xc2],
  [0xc2, 0x80],
  [0xdf, 0xbf],
  [0xe0, 0x80, 0xaf],
  [0xe0, 0xa0, 0x80],
  [0xe1, 0x80],
  [0xe1, 0x80, 65],
  [0xed, 0xa0, 0x80],
  [0xed, 0x9f, 0xbf],
  [0xef, 0xbf, 0xbe],
  [0xef, 0xb7, 0x90],
  [0xf0, 0x80, 0x80, 0xaf],
  [0xf0, 0x90, 0x80, 0x80],
  [0xf0, 0x9f, 0x98, 0x80],
  [0xf4, 0x8f, 0xbf, 0xbf],
  [0xf4, 0x90, 0x80, 0x80],
  [0xf5, 0x80, 0x80, 0x80],
  [0xff, 65],
  Array(14).fill(65),
  [...Array(9).fill(65), 0xf0, 0x9f, 0x98, 0x80, 66],
  [...Array(9).fill(65), 0xff, 0xe1, 0x80, 65],
  [...Array(9).fill(0xff), 65],
  [
    ...Array(9)
      .fill(0xe4)
      .flatMap(
        /** Supplies original CJK triplets. @param value - Lead byte. @returns Bytes. */ (
          value,
        ) => [value, 0xb8, 0xad],
      ),
  ],
];
const scanCases = [];
for (const bytes of corpus)
  if (bytes.length && bytes[0] >= 128)
    for (const length of [
      -1,
      ...Array.from(
        { length: bytes.length },
        /** Supplies readable counted spans. @param unused - Unused. @param i - Offset. @returns Length. */ (
          unused,
          i,
        ) => i + 1,
      ),
    ])
      for (const strict of modes) scanCases.push(["S", length, strict, bytes]);
compare("scanner-spans-and-strict-modes", scanCases, true);
for (const cap of [0, 1, 2, 3, 8, 16]) {
  const cases = [];
  for (const bytes of corpus)
    for (const length of [-1, bytes.length])
      for (const sub of [-2, -1, 0, 0xfffd, 0x1f600])
        for (const status of [0, -124, -128, 7])
          cases.push(["C", cap, length, sub, status, 0, bytes]);
  compare(`conversion-capacity-${cap}`, cases, true);
}
const pointerCases = [];
for (const bytes of corpus.slice(0, 8))
  for (const flags of [0, 1, 2, 3, 4, 8, 12, 16, 18, 20])
    for (const cap of [-1, 0, 1, 8])
      for (const len of [-2, -1, 0, bytes.length])
        pointerCases.push(["C", cap, len, 0xfffd, 0, flags, bytes]);
for (const sub of [0xd7ff, 0xd800, 0xdbff, 0xdc00, 0xdfff, 0xe000, 0x10ffff, 0x110000])
  for (const len of [-1, 1]) pointerCases.push(["C", 8, len, sub, -124, 0, [0xff]]);
compare("nullable-outputs-validation-and-wrapper", pointerCases, true);
const terminations = [];
for (const cap of [-1, 0, 1, 2, 8, 16])
  for (const length of [-1, 0, 1, 2, 3, 17])
    for (const status of [-124, -128, 0, 7, 15])
      for (const flags of [0, 1, 2, 3]) {
        // Native helper validates no writable pointer: exclude only undefined null writes.
        if (flags & 2 && !(flags & 1) && status <= 0 && length >= 0 && length < cap) continue;
        terminations.push(["T", cap, length, status, flags, []]);
      }
compare("utf16-termination-status-and-storage", terminations, true);
const hashes = {};
for (const path of [
  "common/utf_impl.cpp",
  "common/ustrtrns.cpp",
  "common/ustring.cpp",
  "common/unicode/utf8.h",
  "common/unicode/utf.h",
  "common/unicode/utf16.h",
  "common/unicode/utypes.h",
])
  hashes[path] = createHash("sha256")
    .update(readFileSync(`${source}/${path}`))
    .digest("hex");
const artifacts = {};
for (const path of [
  "lib/libicuuc.a",
  "lib/libicui18n.a",
  "stubdata/libicudata.a",
  "utf8-conversion.cpp",
  "utf8-conversion",
])
  artifacts[path] = createHash("sha256")
    .update(readFileSync(`${build}/${path}`))
    .digest("hex");
writeFileSync(
  "apps/office/src/external/icu/source/common/ustrtrns.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      scope:
        "Original scanner/converter full results, output arguments and initialized destination cells. Full pair matrices compare live; retained groups replay counted/NUL spans, source statuses, validation/null pointers, strict wrapper, substitution and fast/partial/preflight writes. Native allocator/ABI, unreadable spans, overlapping storage and complete UnicodeString/RBBI ownership remain unverified.",
      hashes,
      artifacts,
      groups,
    },
    null,
    2,
  ) + "\n",
);
