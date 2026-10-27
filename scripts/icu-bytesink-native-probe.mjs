/** @fileoverview Compares actual ICU78.3 checked sinks, mutable append buffers, reset/saturation, termination and lambda adapter without oversized readable spans. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  ByteSink,
  CheckedArrayByteSink,
} from "../apps/office/src/external/icu/source/common/unicode/bytestream.ts";
import { ByteSinkUtil } from "../apps/office/src/external/icu/source/common/bytesinkutil.ts";
import { u_terminateChars } from "../apps/office/src/external/icu/source/common/ustring.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/bytesink-witness.cc`,
  String.raw`
#include "unicode/bytestream.h"
#include "bytesinkutil.h"
#include "ustr_imp.h"
#include <iostream>
#include <vector>
using namespace icu;
struct Basic:ByteSink{void Append(const char*,int32_t)override{}};
void state(const CheckedArrayByteSink&s){std::cout<<s.NumberOfBytesWritten()<<' '<<s.NumberOfBytesAppended()<<' '<<int(s.Overflowed())<<' ';}
int main(){char op;int cap,min,scratchCap,initial;while(std::cin>>op>>cap>>min>>scratchCap>>initial){std::vector<char>out(32,77),scratch(16,88);if(op=='B'){CheckedArrayByteSink sink(out.data(),cap);sink.Append("abc",3);state(sink);int32_t result=77;char*p=sink.GetAppendBuffer(min,999,scratch.data(),scratchCap,&result);int kind=p==nullptr?0:p==scratch.data()?2:1;std::cout<<kind<<' '<<result<<' ';if(p&&result>=2){p[0]='X';p[1]='Y';sink.Append(p,2);}state(sink);sink.Append("uvwxyz",6);state(sink);std::cout<<int(&sink.Reset()==&sink)<<' ';state(sink);Basic basic;result=77;auto*q=basic.GetAppendBuffer(min,999,scratch.data(),scratchCap,&result);std::cout<<int(q==nullptr?0:q==scratch.data()?2:1)<<' '<<result<<' ';}else if(op=='T'){UErrorCode s=UErrorCode(initial);int n=u_terminateChars(out.data(),cap,min,scratchCap?&s:nullptr);std::cout<<n<<' '<<int(s)<<' ';}else{UErrorCode s=UErrorCode(initial);int n=ByteSinkUtil::viaByteSinkToTerminatedChars(out.data(),cap,[&](ByteSink&sink,UErrorCode&status){sink.Append("AB",2);if(min==1)status=U_ILLEGAL_ARGUMENT_ERROR;else if(min==2)status=U_STRING_NOT_TERMINATED_WARNING;sink.Append("CD",2);},s);std::cout<<n<<' '<<int(s)<<' ';}for(unsigned char c:out)std::cout<<int(c)<<' ';for(unsigned char c:scratch)std::cout<<int(c)<<' ';std::cout<<'\n';}char chunk[4096]={};CheckedArrayByteSink counter(nullptr,0);for(int i=0;i<524290;++i)counter.Append(chunk,sizeof(chunk));state(counter);std::cout<<'\n';}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/bytesink-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/bytesink-witness`,
  ],
  { stdio: "inherit" },
);
/** Actual default ByteSink implementation used to observe inherited source behavior. */
class Basic extends ByteSink {
  /** Source test sink intentionally ignores bytes. @returns Nothing. */ Append() {
    /* No output storage. */
  }
}
/** Observes the actual source scalar state. @param sink - Owner. @returns State fields. */
function state(sink) {
  return [sink.NumberOfBytesWritten(), sink.NumberOfBytesAppended(), Number(sink.Overflowed())];
}
const input = [],
  expected = [];
/** Replays one actual primitive contract. @param op - Operation. @param cap - Capacity. @param min - Minimum or length. @param scratchCap - Scratch/status selector. @param initial - Status. @returns Nothing. */
function add(op, cap, min, scratchCap, initial) {
  const out = new Uint8Array(32).fill(77),
    scratch = new Uint8Array(16).fill(88),
    row = [];
  if (op === "B") {
    const sink = new CheckedArrayByteSink(out, cap);
    sink.Append("abc", 3);
    row.push(...state(sink));
    const result = [77],
      p = sink.GetAppendBuffer(min, 999, scratch, scratchCap, result),
      kind = p === null ? 0 : p === scratch ? 2 : 1;
    row.push(kind, result[0]);
    if (p !== null && result[0] >= 2) {
      p[0] = 88;
      p[1] = 89;
      sink.Append(p, 2);
    }
    row.push(...state(sink));
    sink.Append("uvwxyz", 6);
    row.push(...state(sink), Number(sink.Reset() === sink), ...state(sink));
    const basic = new Basic();
    result[0] = 77;
    const q = basic.GetAppendBuffer(min, 999, scratch, scratchCap, result);
    row.push(q === null ? 0 : q === scratch ? 2 : 1, result[0]);
  } else if (op === "T") {
    const s = [initial],
      n = u_terminateChars(out, cap, min, scratchCap ? s : null);
    row.push(n, s[0]);
  } else {
    const s = [initial],
      n = ByteSinkUtil.viaByteSinkToTerminatedChars(
        out,
        cap,
        /** Uses the full actual source sink, including status changes after partial output. @param sink - Actual owner. @param status - Shared status. @returns Nothing. */ (
          sink,
          status,
        ) => {
          sink.Append("AB", 2);
          if (min === 1) status[0] = 1;
          else if (min === 2) status[0] = -124;
          sink.Append("CD", 2);
        },
        s,
      );
    row.push(n, s[0]);
  }
  input.push([op, cap, min, scratchCap, initial].join(" "));
  expected.push([...row, ...out, ...scratch].join(" "));
}
for (const cap of [-2, -1, 0, 1, 2, 3, 4, 5, 8, 12, 32])
  for (const min of [-1, 0, 1, 2, 3, 4, 8, 16, 17])
    for (const scratchCap of [0, 1, 2, 4, 8, 16]) add("B", cap, min, scratchCap, 0);
for (const cap of [-2, -1, 0, 1, 2, 4, 8, 16])
  for (const len of [-2, -1, 0, 1, 2, 3, 4, 8, 16, 17])
    for (const incoming of [-128, -124, 0, 1, 15])
      for (const hasStatus of [0, 1]) add("T", cap, len, hasStatus, incoming);
for (const cap of [-2, -1, 0, 1, 2, 3, 4, 5, 8])
  for (const mode of [0, 1, 2])
    for (const incoming of [-128, -124, 0, 1, 15]) add("U", cap, mode, 0, incoming);
const counter = new CheckedArrayByteSink(null, 0),
  chunk = new Uint8Array(4096);
for (let i = 0; i < 524290; ++i) counter.Append(chunk, chunk.length);
expected.push(state(counter).join(" "));
const actual = execFileSync(`${build}/bytesink-witness`, [], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++)
  if (actual[i].trim() !== expected[i])
    throw Error(`Row ${i} ${input[i] ?? "SATURATION"}: native ${actual[i]}, port ${expected[i]}`);
const report = {
  result: "pass",
  cases: expected.length,
  saturationAppends: 524290,
  sources: Object.fromEntries(
    [
      "common/bytestream.cpp",
      "common/unicode/bytestream.h",
      "common/bytesinkutil.h",
      "common/ustring.cpp",
    ].map(
      /** Records source identity. @param path - Source. @returns Hash pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Unchanged ICU78.3 base/checked sink methods, direct/scratch pointer choice and mutation, native reset/counters/overflow, valid-readable4096-byte saturation calls, termination/status null behavior and lambda failure/warning timing. Physical pointers are typed-array views; invalid readable/capacity ranges, non-identical overlapping memcpy, allocator/ABI and unrelated stream operations remain uncertified.",
};
writeFileSync(`${build}/bytesink-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
