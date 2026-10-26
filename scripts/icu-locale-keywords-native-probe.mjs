/** @fileoverview Compares original ICU78.3 internal keyword normalization and stable/unstable record sorting against unchanged native library entrypoints. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { ulocimp_getKeywords } from "../apps/office/src/external/icu/source/common/uloc.keywords.ts";
import { uprv_sortArray } from "../apps/office/src/external/icu/source/common/uarrsort.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/locale-keywords-witness.cc`,
  String.raw`
#include "ulocimp.h"
#include "uarrsort.h"
#include "unicode/bytestream.h"
#include <iostream>
#include <string>
#include <vector>
struct Item{int key,id;};
int compare(const void*context,const void*a,const void*b){++*static_cast<int*>(const_cast<void*>(context));return static_cast<const Item*>(a)->key-static_cast<const Item*>(b)->key;}
int main(){char op;while(std::cin>>op){int n,flags,incoming,x;std::cin>>n>>flags>>incoming;UErrorCode status=UErrorCode(incoming);if(op=='K'){int prev;std::cin>>prev;std::string text;for(int i=0;i<n;i++){std::cin>>x;text.push_back(char(x));}std::string output="seed";icu::StringByteSink<std::string>sink(&output);ulocimp_getKeywords(std::string_view(text.data(),text.size()),char(prev),sink,flags!=0,status);std::cout<<int(status)<<' '<<output.size()<<' ';for(unsigned char b:output)std::cout<<int(b)<<' ';}else{std::vector<Item>items;for(int i=0;i<n;i++){std::cin>>x;items.push_back({x,i});}int comparisons=0;uprv_sortArray(items.data(),n,sizeof(Item),compare,&comparisons,flags!=0,&status);std::cout<<int(status)<<' '<<comparisons<<' ';for(auto item:items)std::cout<<item.id<<' ';}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/locale-keywords-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/locale-keywords-witness`,
  ],
  { stdio: "inherit" },
);
/** Encodes exact native narrow bytes. @param text - Narrow span. @returns Units. */
function bytes(text) {
  const out = [];
  for (let i = 0; i < text.length; ++i) out.push(text.charCodeAt(i));
  return out;
}
const input = [],
  expected = [],
  ids = new Set([
    "",
    " ",
    ";",
    "=x",
    " =x",
    "a=",
    "a= ",
    "a=b",
    "b=2;a=1",
    "A=first;a=second",
    "a a=x;aa=y",
    "a=  b c  ; z=V",
    "a=x; ",
    "a=x;;",
    "a=b=c",
    "a=b;c",
    "a;b=c",
    "a=  ;b=c",
    "a@=b",
    "a\0x=1;a\0y=2",
  ]);
for (let i = 0; i < 256; ++i)
  for (const pattern of ["a%=value", "a=val%ue", "%=x;z=y"]) {
    ids.add(pattern.replace("%", String.fromCharCode(i)));
  }
for (const n of [23, 24, 25, 26, 30]) {
  ids.add("a".repeat(n) + "=b");
  ids.add("a ".repeat(n) + "=b");
  const entries = Array.from(
    { length: n },
    /** Builds source keyword-count boundaries. @param unused - Empty slot. @param i - Keyword index. @returns Pair. */ (
      unused,
      i,
    ) => `k${i}=v`,
  );
  ids.add(entries.join(";"));
  ids.add(entries.join(";") + ";k0=duplicate");
}
let seed = 543210;
for (let i = 0; i < 1500; ++i) {
  let text = "";
  const chars = "aAzb=; @/_-01";
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const n = seed % 48;
  for (let j = 0; j < n; ++j) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    text += chars[seed % chars.length];
  }
  ids.add(text);
}
for (const text of ids)
  for (const prev of ["@", "_", "\0"])
    for (const values of [false, true])
      for (const incoming of [-128, 0, 1]) {
        let output = "seed";
        const s = [incoming];
        ulocimp_getKeywords(
          text,
          prev,
          {
            /** Appends exact narrow bytes. @param value - Span. @returns Nothing. */ Append(
              value,
            ) {
              output += value;
            },
          },
          values,
          s,
        );
        input.push(
          ["K", text.length, Number(values), incoming, prev.charCodeAt(0), ...bytes(text)].join(
            " ",
          ),
        );
        expected.push([s[0], output.length, ...bytes(output)].join(" "));
      }
const keywordCases = input.length;
for (let n = 0; n <= 80; ++n)
  for (let scenario = 0; scenario < 12; ++scenario)
    for (const stable of [false, true])
      for (const incoming of [-128, 0, 1]) {
        const items = [];
        for (let i = 0; i < n; ++i) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          items.push({
            key: scenario === 0 ? 0 : scenario === 1 ? i : scenario === 2 ? -i : (seed % 7) - 3,
            id: i,
          });
        }
        const original = items.map(
            /** Copies input ordering for native. @param item - Source record. @returns Key. */ (
              item,
            ) => item.key,
          ),
          s = [incoming];
        let count = 0;
        uprv_sortArray(
          items,
          n,
          8,
          /** Matches original record comparator, tracking exact calls. @param a - Left. @param b - Right. @returns Difference. */ (
            a,
            b,
          ) => {
            ++count;
            return a.key - b.key;
          },
          stable,
          s,
        );
        input.push(["S", n, Number(stable), incoming, ...original].join(" "));
        expected.push(
          [
            s[0],
            count,
            ...items.map(
              /** Encodes unstable equal-key permutation. @param item - Record. @returns Source identity. */ (
                item,
              ) => item.id,
            ),
          ].join(" "),
        );
      }
const actual = execFileSync(`${build}/locale-keywords-witness`, [], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
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
  keywordCases,
  recordSortCases: input.length - keywordCases,
  sources: Object.fromEntries(
    ["common/uloc.cpp", "common/uarrsort.cpp"].map(
      /** Records pinned native source identity. @param path - Source path. @returns Hash entry. */ (
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
    "Unchanged ICU78.3 internal keyword ByteSink API and sort API. Narrow byte/NUL content, duplicates, boundaries and sticky errors; stable/unstable equal-key record permutation and comparator call counts. Immutable record/value storage projects native byte copies; allocator, sizeof/alignment/ABI and arbitrary mutating comparators remain uncertified. Locale normalization/BCP47 conversion and calendar construction remain pending.",
};
writeFileSync(`${build}/locale-keywords-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
