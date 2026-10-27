/** @fileoverview Compares the original ICU78.3 internal ByteSink locale parser with its port, including all optional-sink/end combinations, byte payloads and source error checkpoints. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { ulocimp_getSubtags } from "../apps/office/src/external/icu/source/common/uloc.subtags.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  data = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/uloc.json", "utf8"),
  );
writeFileSync(
  `${build}/locale-subtags-witness.cc`,
  String.raw`
#include "ulocimp.h"
#include "unicode/bytestream.h"
#include <iostream>
#include <sstream>
#include <string>
using namespace icu;
int main(){std::string line;while(std::getline(std::cin,line)){std::istringstream in(line);int n,mask,status,byte;in>>n>>mask>>status;std::string text;for(int i=0;i<n;i++){in>>byte;text.push_back(char(byte));}std::string out[4]={"seed","seed","seed","seed"};StringByteSink<std::string> a(&out[0]),b(&out[1]),c(&out[2]),d(&out[3]);const char sentinel=0;const char*end=&sentinel;UErrorCode s=UErrorCode(status);ulocimp_getSubtags(std::string_view(text.data(),text.size()),mask&1?&a:nullptr,mask&2?&b:nullptr,mask&4?&c:nullptr,mask&8?&d:nullptr,mask&16?&end:nullptr,s);std::cout<<int(s)<<' '<<(end==&sentinel?77:end-text.data())<<' ';for(auto&v:out){std::cout<<v.size()<<' ';for(unsigned char x:v)std::cout<<int(x)<<' ';}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/locale-subtags-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/locale-subtags-witness`,
  ],
  { stdio: "inherit" },
);
const ids = new Set([
  "",
  "root",
  "ROOT",
  "root_",
  "und",
  "Und_Latn_US",
  "und@calendar=gregorian",
  "und.UTF8",
  "en_US",
  "en-Latn-us-POSIX",
  "en__posix",
  "en_US_foo-bar",
  "en_US_FOO-",
  "en_US_FOO.",
  "en_US_FOO@",
  "en_US_FOO-bar.",
  "en_US_xxx-u-va-posix",
  "en-u-va-posix",
  "en-u-ca-gregory-va-posix",
  "en-u-va-posix-ca-gregory",
  "en-u-va-posix-va-posix",
  "en-t-va-posix",
  "en-x-va-posix",
  "en-a-va-posix",
  "en_u_va_posix",
  "i-klingon",
  "X_PRIVATE",
  "i-default",
  "en@VARIANT",
  "en.UTF8@VARIANT",
  "en_US@calendar=gregorian",
  "en_12",
  "en_$%",
  "a_",
  "__",
  "@",
  ".",
]);
for (const table of [
  data.tables.LANGUAGES,
  data.tables.LANGUAGES_3,
  data.tables.COUNTRIES,
  data.tables.COUNTRIES_3,
])
  for (const value of table)
    if (value !== null) {
      ids.add(value);
      ids.add(`En_${value}_PoSiX`);
    }
for (let value = 0; value < 256; ++value)
  for (const pattern of ["%", "en_%_foo", "en_L%tn_US", "en_US_F%o", "en@F%o"]) {
    ids.add(pattern.replace("%", String.fromCharCode(value)));
  }
for (const n of [0, 1, 2, 3, 4, 10, 11, 12, 13, 64, 178, 179, 180, 181, 200])
  for (const pattern of ["%", "en_%", "en_US_%", "en_US_x_%", "en_US_x-%.x", "en_US_x-%.@x"]) {
    ids.add(pattern.replace("%", "a".repeat(n)));
  }
let seed = 7654321;
for (let i = 0; i < 3000; ++i) {
  let id = "";
  const chars = "eNRusUindtxX_-.@aPovsi 01";
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const len = seed % 48;
  for (let j = 0; j < len; ++j) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    id += chars[seed % chars.length];
  }
  ids.add(id);
}
const input = [],
  expected = [];
/** Encodes exact narrow-byte values, including NUL and high bytes. @param text - Narrow string. @returns Bytes. */
function bytes(text) {
  const values = [];
  for (let i = 0; i < text.length; ++i) values.push(text.charCodeAt(i));
  return values;
}
for (const id of ids)
  for (let mask = 0; mask < 32; ++mask)
    for (const initial of [-128, 0, 1]) {
      const outputs = ["seed", "seed", "seed", "seed"],
        s = [initial],
        end = [77],
        sinks = outputs.map(
          /** Builds the actual append boundary. @param unused - Existing value. @param i - Sink index. @returns Append sink. */ (
            unused,
            i,
          ) => ({
            /** Appends without clearing prior contents. @param value - Narrow span. @returns Nothing. */ Append(
              value,
            ) {
              outputs[i] += value;
            },
          }),
        );
      ulocimp_getSubtags(
        id,
        ...sinks.map(
          /** Selects original nullable arguments. @param sink - Append sink. @param i - Index. @returns Sink or null. */ (
            sink,
            i,
          ) => (mask & (1 << i) ? sink : null),
        ),
        mask & 16 ? end : null,
        s,
      );
      input.push([id.length, mask, initial, ...bytes(id)].join(" "));
      expected.push(
        [
          s[0],
          end[0],
          ...outputs.flatMap(
            /** Encodes exact append output. @param text - Output. @returns Serialized units. */ (
              text,
            ) => [text.length, ...bytes(text)],
          ),
        ].join(" "),
      );
    }
const actual = execFileSync(`${build}/locale-subtags-witness`, [], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i].trim() !== expected[i])
    throw Error(`Case ${i} input ${input[i]} native ${actual[i]} port ${expected[i]}`);
const report = {
  result: "pass",
  cases: input.length,
  localeSpans: ids.size,
  sha256: createHash("sha256")
    .update(readFileSync(`${source}/common/uloc.cpp`))
    .digest("hex"),
  scope:
    "Unchanged ICU78.3 internal ByteSink overload, exact bytes/appended output/status/end offsets across all32 nullable-output combinations and three incoming statuses. Complete paired ISO tables, ASCII/high-byte/NUL payloads, BCP47-va-posix extraction, legacy delimiters and error checkpoints. No public C-string/default/Locale normalization/BCP47 conversion, allocator/ABI or calendar service certificate.",
};
writeFileSync(`${build}/locale-subtags-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
