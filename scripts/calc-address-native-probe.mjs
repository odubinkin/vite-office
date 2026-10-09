/** @fileoverview Compiles unchanged pinned Calc numerical definitions into a bounded reference fixture; runtime tests consume the fixture without an upstream checkout. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-range-cases.json";
const target = "output/playwright/calc-native";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Calc native probe requires the exact pinned checkout.");
const header = readFileSync(`${upstream}/sc/inc/address.hxx`, "utf8");
const source = readFileSync(`${upstream}/sc/source/core/tool/address.cxx`, "utf8");
const types = readFileSync(`${upstream}/sc/inc/types.hxx`, "utf8");
for (const [file, text] of [
  ["sc/inc/address.hxx", header],
  ["sc/source/core/tool/address.cxx", source],
  ["sc/inc/types.hxx", types],
]) {
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    text
  )
    throw new Error(`Native probe source differs from the pinned Git blob: ${file}`);
}

/** Extracts a complete unchanged interval between exact source markers. @param text - Source text. @param first - Inclusive start marker. @param last - Exclusive end marker. @returns Original source interval. */
function interval(text, first, last) {
  const begin = text.indexOf(first),
    end = text.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing native source interval: ${first}`);
  return text.slice(begin, end);
}
/** Hashes the entire actual source bytes. @param text - UTF-8 source. @returns SHA-256. */
function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}

const addressInline = interval(
  header,
  "    constexpr ScAddress() :",
  "    /**\n        @param  pSheetEndPos",
);
const rangeInline = interval(header, "    ScRange() :", "    inline bool Contains(");
const functions = interval(
  source,
  "bool ScAddress::Move(",
  "OUString ScAddress::GetColRowString()",
);
const signatures = [
  ...functions.matchAll(/^(bool|void) (ScAddress|ScRange)::(\w+)\([^{};]*?\)(?: const)?\n\{/gm),
];
if (signatures.length !== 9)
  throw new Error("Expected exactly nine complete native numerical definitions.");
/** Projects original definitions into declarations inside their owner. @param owner - Native class. @returns Method declarations. */
function declarations(owner) {
  return signatures
    .filter(
      /** Selects one owner. @param match - Signature match. @returns Whether owned. */ (match) =>
        match[2] === owner,
    )
    .map(
      /** Removes only the original owner qualifier from its declaration. @param match - Signature match. @returns Native declaration. */ (
        match,
      ) => match[0].slice(0, -2).replace(`${owner}::`, "") + ";",
    )
    .join("\n");
}
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <algorithm>
#include <cstdint>
#include <iostream>
using sal_Int32 = int32_t; using sal_Int16 = int16_t;
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
${interval(header, "constexpr SCROW MAXROWCOUNT =", "constexpr OUString MAXROW_STRING")}
${interval(header, "template <typename T> constexpr void PutInOrder", "// The result of ConvertRef()")}
class ScDocument { public: SCCOL MaxCol() const { return MAXCOL; } SCROW MaxRow() const { return MAXROW; } SCTAB GetTableCount() const { return 3; } };
class ScAddress { SCROW nRow; SCCOL nCol; SCTAB nTab; public:
 enum Uninitialized { UNINITIALIZED }; enum InitializeInvalid { INITIALIZE_INVALID };
 ${addressInline}
 ${declarations("ScAddress")}
};
class ScRange { public: ScAddress aStart, aEnd;
 ${rangeInline}
 void PutInOrder() { aStart.PutInOrder(aEnd); }
 ${declarations("ScRange")}
};
${functions}
void emit(const ScRange& r) { std::cout << r.aStart.Col() << ',' << r.aStart.Row() << ',' << r.aStart.Tab() << ',' << r.aEnd.Col() << ',' << r.aEnd.Row() << ',' << r.aEnd.Tab(); }
int main() {
 ScDocument doc;
 const ScRange ranges[] = {
  ScRange(2,3,0,4,5,1),ScRange(2,3,0,MAXCOL,MAXROW,0),ScRange(0,0,0,MAXCOL,MAXROW,0),
  ScRange(1,0,0,2,MAXROW,0),ScRange(0,1,0,MAXCOL,2,0),ScRange(MAXCOL-3,0,0,MAXCOL-1,0,0),
  ScRange(0,MAXROW-3,0,0,MAXROW-1,0),ScRange(MAXCOL-3,MAXROW-3,0,MAXCOL-1,MAXROW-1,0),
  ScRange(MAXCOL,MAXROW,0),ScRange(0,0,2,1,1,3),ScRange(4,4,0,2,2,0),ScRange(ScAddress::INITIALIZE_INVALID)
 };
 bool first=true; std::cout << "[";
 for (const auto& initial : ranges) for (SCCOL dx : {-3,0,1,3}) for (SCROW dy : {-3,0,1,3}) for (SCTAB dz : {-1,0,1,4}) {
  ScRange current(initial), error;
  bool valid=current.MoveSticky(doc,dx,dy,dz,error);
  if (!first) std::cout << ','; first=false;
  std::cout << "["; emit(initial); std::cout << ',' << dx << ',' << dy << ',' << dz << ',' << (valid?"true":"false") << ',';
  emit(current); std::cout << ','; emit(error); std::cout << "]";
 }
 std::cout << "]";
}
`;
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "address-probe.cxx"),
  binary = path.join(target, "address-probe");
writeFileSync(cpp, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    cpp,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const cases = JSON.parse(execFileSync(path.resolve(binary), { encoding: "utf8" }));
const result = {
  baselineCommit: pinned,
  sourceHashes: { header: digest(header), source: digest(source), types: digest(types) },
  extractedHashes: {
    addressInline: digest(addressInline),
    rangeInline: digest(rangeInline),
    functions: digest(functions),
  },
  bounds: [16383, 1048575, 3],
  cases,
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, `${JSON.stringify(result, null, 2)}\n`);
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Calc native range fixture differs from the pinned executable.");
} else throw new Error("Usage: node scripts/calc-address-native-probe.mjs --write|--check");
console.log(
  `Pinned Calc native probe: ${cases.length} sticky movements; ASan/UBSan clean; ${mode}.`,
);
