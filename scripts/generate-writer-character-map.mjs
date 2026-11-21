/** @fileoverview Generates Writer's character-map resources from pinned ICU and LibreOffice sources. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const icuSource = resolve("vendor/icu-reference/source");
const loSource = resolve("vendor/libreoffice-reference");
const icuBuild = process.argv[2];
const check = process.argv.includes("--check");
if (!icuBuild) throw new Error("Pass the repository-local pinned ICU build directory.");
const work = resolve("output/playwright/writer-character-map");
mkdirSync(work, { recursive: true });

const source = `${work}/names.cc`;
const executable = `${work}/names`;
writeFileSync(
  source,
  `#include <cstdio>
#include "unicode/uchar.h"

int main() {
    UErrorCode status = U_ZERO_ERROR;
    u_enumCharNames(0, 0x110000,
        [](void*, UChar32 code, UCharNameChoice, const char* name, int32_t length) -> UBool {
            std::printf("%d\\t%.*s\\n", code, length, name);
            return true;
        }, nullptr, U_UNICODE_CHAR_NAME, &status);
    return U_FAILURE(status);
}
`,
);
execFileSync("c++", [
  "-std=c++17",
  "-I",
  `${icuSource}/common`,
  source,
  resolve(icuBuild, "lib/libicuuc.a"),
  resolve(icuBuild, "lib/libicudata.a"),
  "-lpthread",
  "-ldl",
  "-o",
  executable,
]);

const names = [];
const ranges = [];
for (const line of execFileSync(executable, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
  .trimEnd()
  .split("\n")) {
  const separator = line.indexOf("\t");
  const code = Number(line.slice(0, separator));
  const name = line.slice(separator + 1);
  const suffix = `-${code.toString(16).toUpperCase()}`;
  if (!name.endsWith(suffix)) {
    names.push([code, name]);
    continue;
  }
  const prefix = name.slice(0, -suffix.length + 1);
  const previous = ranges.at(-1);
  if (previous?.[1] === code - 1 && previous[2] === prefix) previous[1] = code;
  else ranges.push([code, code, prefix]);
}

const subsetSource = readFileSync(`${loSource}/svx/source/dialog/charmap.cxx`, "utf8");
const strings = readFileSync(`${loSource}/include/svx/strings.hrc`, "utf8");
const labels = new Map(
  Array.from(
    strings.matchAll(/#define (RID_SUBSETSTR_\w+)\s+NC_\("RID_SUBSETMAP", ("[^"]+")\)/gu),
    /** Decodes one source resource string. @param match - Resource definition captures. @returns Resource pair. */
    ([, id, label]) => [id, JSON.parse(label)],
  ),
);
const subsets = Array.from(
  subsetSource.matchAll(
    /aAllSubsets\.emplace_back\(\s*(0x[\da-f]+),\s*(0x[\da-f]+),\s*SvxResId\((RID_SUBSETSTR_\w+)\)\s*\)/giu,
  ),
  /** Resolves an inclusive subset range and its source caption. @param match - Range declaration captures. @returns Subset row. */
  ([, start, end, id]) => {
    const label = labels.get(id);
    if (!label) throw new Error(`Missing subset resource ${id}`);
    return [Number(start), Number(end), id, label];
  },
).sort(
  /** Sorts subsets by Unicode position like the native map. @param left - First range. @param right - Second range. @returns Sort order. */
  ([start], [next]) => start - next,
);

if (names.length < 30_000 || subsets.length < 300)
  throw new Error("The pinned ICU names or LibreOffice subset resource is incomplete.");
const output = "apps/office/src/sw/browser/presentation/writer-search-character-map.data.txt";
const groups = Object.entries({ names, ranges, subsets }).map(
  /** Writes one entry per line without expanding the individual native rows. @param entry - Data table and rows. @returns JSON member. */
  ([key, rows]) =>
    `${JSON.stringify(key)}:[\n${rows
      .map(
        /** Encodes a single generated data row. @param row - Native data row. @returns JSON row. */
        (row) => JSON.stringify(row),
      )
      .join(",\n")}\n]`,
);
const generated = `{\n${groups.join(",\n")}\n}\n`;
if (check) {
  if (readFileSync(output, "utf8") !== generated)
    throw new Error("Writer character-map resources differ from the pinned inputs.");
} else writeFileSync(output, generated);
process.stdout.write(
  `Generated ${names.length} explicit names, ${ranges.length} algorithmic ranges and ${subsets.length} subsets.\n`,
);
