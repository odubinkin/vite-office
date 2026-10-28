/** @fileoverview Compiles unchanged pinned Word style helpers with native enums and a scalar SwFormat/vector entry carrier; this witnesses the selected functions, not the complete Writer ABI. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";
import { definition } from "./rtl-string-convert-native-probe.mjs";
const paths = [
  "sw/inc/poolfmt.hxx",
  "sw/source/filter/inc/wwstyles.hxx",
  "sw/source/filter/ww8/styles.cxx",
  "sw/source/filter/ww8/wrtw8sty.cxx",
];
const sources = paths.map(
  /** Reads exact pinned source bytes. @param path - Upstream-relative path. @returns Source. */ (
    path,
  ) => readFileSync("vendor/libreoffice-reference/" + path, "utf8"),
);
const [pool, header, names, style] = sources;
const constants = [...pool.matchAll(/const sal_uInt16\s+\w+\s*=\s*[^;]+;/g)]
  .map(
    /** Retains original group constant definitions. @param match - Native match. @returns Definition. */ (
      match,
    ) => match[0],
  )
  .join("\n");
const driver = `
#include <cstdint>
#include <climits>
#include <cassert>
#include <iterator>
#include <iostream>
#include <vector>
using sal_uInt16 = std::uint16_t;
#define SAL_MAX_UINT16 UINT16_MAX
#define SAL_N_ELEMENTS(x) std::size(x)
${constants}
${definition(pool, "enum class SwPoolFormatId : sal_uInt16")};
${["inline constexpr SwPoolFormatId operator-(SwPoolFormatId lhs, SwPoolFormatId rhs)", "inline constexpr SwPoolFormatId operator&(SwPoolFormatId lhs, SwPoolFormatId rhs)", "inline constexpr SwPoolFormatId operator+(SwPoolFormatId lhs, sal_uInt16 rhs)", "inline constexpr SwPoolFormatId operator-(SwPoolFormatId lhs, sal_uInt16 rhs)"].map(/** Retains original enum arithmetic. @param marker - Operator signature. @returns Native definition. */ (marker) => definition(pool, marker)).join("\n")}
${style.match(/#define WW8_RESERVED_SLOTS \d+/)[0]}
namespace ww { ${definition(header, "enum sti : sal_uInt16")}; }
${definition(names, "const char* const* GetStiNames()")}
namespace ww { ${definition(names, "const char* GetEnglishNameFromSti(sti eSti)")} }
class SwFormat {
  SwPoolFormatId id;
public:
  explicit SwFormat(unsigned value) : id(static_cast<SwPoolFormatId>(value)) {}
  SwPoolFormatId GetPoolFormatId() const { return id; }
};
class MSWordStyles {
public:
  struct Entry { const SwFormat* format = nullptr; };
  std::vector<Entry> m_aStyles;
  static sal_uInt16 GetWWId(const SwFormat&);
  sal_uInt16 GetSlot(const SwFormat*) const;
};
${definition(style, "sal_uInt16 MSWordStyles::GetWWId(")}
${definition(style, "static sal_uInt16 BuildGetSlot(")}
${definition(style, "sal_uInt16 MSWordStyles::GetSlot(")}
int main() {
  for (unsigned id = 0; id < 65536; ++id) {
    SwFormat format(id);
    std::cout << id << '\\t' << MSWordStyles::GetWWId(format) << '\\t' << BuildGetSlot(format) << '\\n';
  }
  for (unsigned id = 0; id < ww::stiMax; ++id)
    std::cout << "NAME\\t" << id << '\\t' << ww::GetEnglishNameFromSti(static_cast<ww::sti>(id)) << '\\n';
  MSWordStyles table; table.m_aStyles.resize(15); SwFormat format(0);
  table.m_aStyles[0].format = &format;
  std::cout << "NULL\\t" << table.GetSlot(nullptr) << '\\n';
  for (unsigned i = 1; i < 10; ++i) table.m_aStyles[i].format = &format;
  std::cout << "NULL\\t" << table.GetSlot(nullptr) << '\\n';
}
`;
const output = "output/playwright/word-styles-native";
mkdirSync(output, { recursive: true });
writeFileSync(output + "/probe.cxx", driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-omit-frame-pointer",
    output + "/probe.cxx",
    "-o",
    output + "/probe",
  ],
  { stdio: "inherit" },
);
const rows = execFileSync(output + "/probe", { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 })
  .trim()
  .split("\n");
const ranges = [],
  englishNames = [],
  nullSlots = [];
for (const row of rows) {
  const [id, ww, slot] = row.split("\t");
  if (id === "NAME") {
    englishNames.push(slot);
    continue;
  }
  if (id === "NULL") {
    nullSlots.push(Number(ww));
    continue;
  }
  const n = Number(id),
    word = Number(ww),
    reserved = Number(slot),
    previous = ranges.at(-1);
  if (previous && previous[1] + 1 === n && previous[2] === word && previous[3] === reserved)
    previous[1] = n;
  else ranges.push([n, n, word, reserved]);
}
const result = {
  baseline: "9bc445578031fecf56086729d8e4940c77e14d65",
  sourceHashes: Object.fromEntries(
    paths.map(
      /** Hashes the exact source carrier. @param path - Native file. @param index - Source index. @returns Path/hash pair. */ (
        path,
        index,
      ) => [path, createHash("sha256").update(sources[index]).digest("hex")],
    ),
  ),
  scope:
    "Unchanged GetWWId, BuildGetSlot, GetSlot, GetStiNames/GetEnglishNameFromSti; original enum values; scalar SwFormat/vector entry binding; not complete Writer/style ABI.",
  ranges,
  englishNames,
  nullSlots,
};
const target = "apps/office/src/sw/source/filter/ww8/word-styles-native.json";
writeFileSync(
  target,
  await format(JSON.stringify(result), { ...(await resolveConfig(target)), parser: "json" }),
);
console.log(
  `Native Word style witness: 65536 pool IDs, ${englishNames.length} names, null slots ${nullSlots.join(",")}, ASan/UBSan passed.`,
);
