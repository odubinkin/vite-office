/** @fileoverview Compiles complete unchanged pinned cell metadata declarations/default constructor into portable field/copy/assignment observations. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-celltextattr-native";
const calcFixture = "apps/office/src/sc/source/core/data/native-celltextattr-cases.json";
const scriptFixture = "apps/office/src/svl/inc/native-script-type-cases.json";
/** Hashes exact source bytes. @param text - Original bytes. @returns SHA256. */
function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}
/** Extracts one complete unchanged original declaration or definition. @param text - Source. @param first - Inclusive marker. @param last - Exclusive following marker. @returns Complete original scope. */
function interval(text, first, last) {
  const begin = text.indexOf(first),
    end = text.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing original scope: ${first}`);
  return text.slice(begin, end);
}
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Expected exact pinned upstream.");
const paths = [
  "sc/inc/celltextattr.hxx",
  "sc/source/core/data/celltextattr.cxx",
  "sc/inc/globalnames.hxx",
  "sc/inc/global.hxx",
  "include/svl/languageoptions.hxx",
];
const sources = Object.fromEntries(
  paths.map(
    /** Reads and verifies the full original blob. @param file - Original path. @returns Path and unchanged source. */ (
      file,
    ) => {
      const original = readFileSync(`${upstream}/${file}`, "utf8");
      if (
        execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
        original
      )
        throw new Error(`Modified upstream: ${file}`);
      return [file, original];
    },
  ),
);
const scopes = {
  script: interval(sources[paths[4]], "enum class SvtScriptType : sal_uInt8", "namespace o3tl"),
  cell: interval(sources[paths[3]], "enum CellType\n", "enum class DelCellCmd"),
  declaration: interval(sources[paths[0]], "namespace sc\n", "/* vim:"),
  constructor: interval(sources[paths[1]], "namespace sc {", "/* vim:"),
  dirty: sources[paths[2]].match(/^constexpr sal_uInt32 TEXTWIDTH_DIRTY = .*;$/m)?.[0],
};
if (!scopes.dirty) throw new Error("Missing original dirty constant.");
const driver = `#include <cstdint>
#include <iostream>
#include <utility>
using sal_uInt8 = std::uint8_t; using sal_uInt16 = std::uint16_t; using sal_uInt32 = std::uint32_t;
${scopes.script}
${scopes.cell}
${scopes.dirty}
${scopes.declaration}
${scopes.constructor}
void emit(const sc::CellTextAttr& a,const sc::CellTextAttr& b,const sc::CellTextAttr& c) {
 std::cout << "[[" << a.mnTextWidth << ',' << unsigned(a.mnScriptType) << "],[" << b.mnTextWidth << ',' << unsigned(b.mnScriptType) << "],[" << c.mnTextWidth << ',' << unsigned(c.mnScriptType) << "]]";
}
int main() {
 std::cout << "{\\"scriptTypes\\":[";
 bool first=true; for(auto v:{SvtScriptType::NONE,SvtScriptType::LATIN,SvtScriptType::ASIAN,SvtScriptType::COMPLEX,SvtScriptType::UNKNOWN}){if(!first)std::cout<<',';first=false;std::cout<<unsigned(v);}
 std::cout << "],\\"cellTypes\\":[" << CELLTYPE_NONE << ',' << CELLTYPE_VALUE << ',' << CELLTYPE_STRING << ',' << CELLTYPE_FORMULA << ',' << CELLTYPE_EDIT << "],\\"dirty\\":" << TEXTWIDTH_DIRTY << ",\\"fieldWidths\\":[" << sizeof(sc::CellTextAttr().mnTextWidth) << ',' << sizeof(sc::CellTextAttr().mnScriptType) << "],\\"cases\\":[";
 std::int64_t width,script; first=true;
 while(std::cin>>width>>script){if(!first)std::cout<<',';first=false;std::cout<<'[';
  sc::CellTextAttr a,b,c;emit(a,b,c);std::cout<<',';
  a.mnTextWidth=width;a.mnScriptType=static_cast<SvtScriptType>(script);emit(a,b,c);std::cout<<',';
  sc::CellTextAttr copied(a); c=copied;emit(a,b,c);std::cout<<',';
  c.mnTextWidth=std::uint32_t(c.mnTextWidth)+1;c.mnScriptType=static_cast<SvtScriptType>(unsigned(c.mnScriptType)^15);emit(a,b,c);std::cout<<',';
  b=c;emit(a,b,c);std::cout<<',';
  c=c;emit(a,b,c);std::cout<<',';
  b=std::move(a);emit(a,b,c);std::cout<<',';
  b=std::move(b);emit(a,b,c);std::cout<<']';
 }
 std::cout<<"]}";
}`;
// Input enumeration only; every expected field is captured from the genuine compiled scopes above.
const inputs = [
  -2147483648, -65537, -1, 0, 1, 65534, 65535, 65536, 131071, 2147483647, 4294967295,
].flatMap(
  /** Enumerates valid native integer assignments. @param width - Assigned field. @returns Complete input pairs. */ (
    width,
  ) =>
    [-256, -1, 0, 1, 2, 4, 8, 15, 16, 127, 128, 255, 256, 511].map(
      /** Associates one fixed-underlying enum cast. @param script - Cast input. @returns Original assignment inputs. */ (
        script,
      ) => [width, script],
    ),
);
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
  { stdio: "pipe", timeout: 30000 },
);
const raw = execFileSync(`${target}/driver`, {
  input: inputs
    .map(
      /** Serializes caller inputs only. @param pair - Native caller inputs. @returns One input line. */ (
        pair,
      ) => pair.join(" "),
    )
    .join("\n"),
  encoding: "utf8",
  timeout: 30000,
});
writeFileSync(`${target}/output.json`, raw);
const native = JSON.parse(raw);
if (native.cases.length !== inputs.length) throw new Error("Incomplete native sequence output.");
const provenance = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    paths.map(
      /** Hashes each full unchanged original file. @param file - Original path. @returns File and SHA. */ (
        file,
      ) => [file, digest(sources[file])],
    ),
  ),
  scopeHashes: Object.fromEntries(
    Object.entries(scopes).map(
      /** Hashes complete original scopes without rewriting bodies. @param entry - Scope and source. @returns Scope and SHA. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  driverHash: digest(driver),
};
const results = [
  [
    calcFixture,
    {
      ...provenance,
      cellTypes: native.cellTypes,
      dirty: native.dirty,
      fieldWidths: native.fieldWidths,
      cases: inputs.map(
        /** Associates actual complete records with their original inputs. @param input - Caller inputs. @param index - Record index. @returns Full portable sequence. */ (
          input,
          index,
        ) => ({ input, states: native.cases[index] }),
      ),
    },
  ],
  [scriptFixture, { ...provenance, scriptTypes: native.scriptTypes }],
];
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly one of --write or --check.");
for (const [file, data] of results) {
  if (write) writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  else if (JSON.stringify(JSON.parse(readFileSync(file, "utf8"))) !== JSON.stringify(data))
    throw new Error(`Native fixture mismatch: ${file}`);
}
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    sequences: inputs.length,
    states: native.cases.reduce(
      /** Counts all captured states. @param total - Existing count. @param states - Full sequence. @returns Total observed states. */ (
        total,
        states,
      ) => total + states.length,
      0,
    ),
    originalScopes: Object.keys(scopes).length,
    fullSourceHashes: paths.length,
  }),
);
