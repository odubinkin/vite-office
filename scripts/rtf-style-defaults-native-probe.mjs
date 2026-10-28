/** @fileoverview Compiles the unchanged pinned RTF style-default helper with generated original IDs and scalar/nested value carriers; this is not a complete RTFValue or Writer ABI witness. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";
import { definition } from "./rtl-string-convert-native-probe.mjs";
const base = "vendor/libreoffice-reference/";
const paths = [
  "sw/source/writerfilter/rtftok/rtfsprm.cxx",
  "sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx",
  "sw/source/writerfilter/ooxml/resourceids.py",
  "sw/source/writerfilter/ooxml/model.xml",
];
const sources = paths.map(
  /** Reads exact pinned source. @param path - Source path. @returns Text. */ (path) =>
    readFileSync(base + path, "utf8"),
);
const defaults = definition(sources[0], "static RTFValue::Pointer_t getDefaultSPRM(");
const borders = definition(sources[1], "Id getParagraphBorder(");
const ids = execFileSync("python3", [base + paths[2], base + paths[3]], {
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
const names = [
  ...new Set(
    [...(defaults + borders).matchAll(/NS_ooxml::(\w+)/g)].map(
      /** Extracts original token spelling. @param match - Source match. @returns Name. */ (
        match,
      ) => match[1],
    ),
  ),
];
names.push(
  "LN_EG_RPrBase_strike",
  "LN_EG_RPrBase_highlight",
  "LN_EG_RPrBase_position",
  "LN_EG_RPrBase_kern",
  "LN_EG_RPrBase_vertAlign",
);
const constants = [...ids.matchAll(/const Id (\w+) = (\d+);/g)]
  .filter(
    /** Selects used original declarations. @param match - Generated constant. @returns Whether consumed. */ (
      match,
    ) => names.includes(match[1]),
  )
  .map(
    /** Retains original constant values. @param match - Generated match. @returns Declaration. */ (
      match,
    ) => match[0],
  )
  .join("\n");
const driver = `
#include <cstdint>
#include <memory>
#include <vector>
#include <string>
#include <iostream>
using Id = std::uint32_t;
using sal_uInt32 = std::uint32_t;
namespace NS_ooxml { ${constants} }
template<class T> struct Ref : std::shared_ptr<T> { Ref(T* p = nullptr) : std::shared_ptr<T>(p) {} };
struct RTFValue;
struct RTFSprms { std::vector<std::pair<Id,Ref<RTFValue>>> entries; void set(Id id, Ref<RTFValue> value) { entries.emplace_back(id, value); } };
struct RTFValue {
  using Pointer_t = Ref<RTFValue>;
  int kind = 0; long number = 0; std::u16string text; RTFSprms attrs, sprms;
  RTFValue(long n) : number(n) {}
  RTFValue(std::u16string t) : kind(1), text(t) {}
  RTFValue(RTFSprms a, RTFSprms s) : kind(2), attrs(a), sprms(s) {}
};
std::u16string operator""_ustr(const char16_t* value, std::size_t length) { return {value, length}; }
${borders}
${defaults}
int main() {
  const std::pair<const char*, Id> tokens[] = { ${names.map(/** Emits named native query. @param name - Native token. @returns C++ initializer. */ (name) => `{"${name}", NS_ooxml::${name}}`).join(",")} };
  for (const auto& token : tokens) {
    auto value = getDefaultSPRM(token.second, NS_ooxml::LN_Value_ST_StyleType_character);
    if (!value) continue;
    std::cout << token.first << '\\t' << value->kind << '\\t';
    if (value->kind == 0) std::cout << value->number;
    if (value->kind == 1) for (auto ch : value->text) std::cout << char(ch);
    std::cout << '\\n';
  }
}
`;
const out = "output/playwright/rtf-character-styles/native";
mkdirSync(out, { recursive: true });
writeFileSync(out + "/probe.cxx", driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-omit-frame-pointer",
    out + "/probe.cxx",
    "-o",
    out + "/probe",
  ],
  { stdio: "inherit" },
);
const rows = execFileSync(out + "/probe", { encoding: "utf8" })
  .trim()
  .split("\n");
const values = Object.fromEntries(
  rows.map(
    /** Reads native scalar results. @param row - Native output. @returns Token/value pair. */ (
      row,
    ) => {
      const [name, kind, value] = row.split("\t");
      return [name, kind === "0" ? Number(value) : value];
    },
  ),
);
const target = "apps/office/src/sw/source/writerfilter/rtftok/rtf-style-defaults-native.json";
const result = {
  baseline: "9bc445578031fecf56086729d8e4940c77e14d65",
  sourceHashes: Object.fromEntries(
    paths.map(
      /** Hashes consumed source. @param path - Source. @param index - Index. @returns Path/hash. */ (
        path,
        index,
      ) => [path, createHash("sha256").update(sources[index]).digest("hex")],
    ),
  ),
  scope:
    "Unchanged getDefaultSPRM/getParagraphBorder with original generated OOXML IDs, scalar/nested value ownership carriers under ASan/UBSan; not complete RTFValue/RTFSprms, mapper or Writer ABI.",
  queriedTokens: names,
  characterDefaults: values,
};
writeFileSync(
  target,
  await format(JSON.stringify(result), { ...(await resolveConfig(target)), parser: "json" }),
);
console.log(
  `Pinned RTF character defaults: ${rows.length} recognized among ${names.length} original tokens; ASan/UBSan passed.`,
);
