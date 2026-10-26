/** @fileoverview Extracts original ICU78.3 paired legacy ISO locale tables, retaining both null-separated sections and duplicate identities. */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import prettier from "prettier";
const sourcePath = "vendor/icu-reference/source/common/uloc.cpp",
  target = "apps/office/src/external/icu/source/data/misc/uloc.json",
  source = readFileSync(sourcePath, "utf8"),
  text = source.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/[^\n]*/gu, ""),
  tables = {};
for (const name of ["LANGUAGES", "LANGUAGES_3", "COUNTRIES", "COUNTRIES_3"]) {
  const body = text.match(
    new RegExp(`constexpr const char\\* ${name}\\[\\]\\s*=\\s*\\{([^}]+)\\}`),
  )?.[1];
  if (!body) throw Error(`Missing source table ${name}`);
  tables[name] = [...body.matchAll(/"([^"]*)"|nullptr/gu)].map(
    /** Preserves native null sentinels and table ordering. @param match - Source token. @returns Literal value. */ (
      match,
    ) => match[1] ?? null,
  );
}
for (const prefix of ["LANGUAGES", "COUNTRIES"])
  if (tables[prefix].length !== tables[prefix + "_3"].length) throw Error("Paired length mismatch");
const value = {
    source: sourcePath,
    sha256: createHash("sha256").update(source).digest("hex"),
    tables,
  },
  formatted = await prettier.format(JSON.stringify(value), {
    ...(await prettier.resolveConfig(target)),
    filepath: target,
  });
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== formatted) throw Error("Pinned locale tables are stale");
} else writeFileSync(target, formatted);
console.log(
  "Pinned ICU locale tables:",
  Object.fromEntries(
    Object.entries(tables).map(
      /** Reports exact source table lengths. @param entry - Paired entry. @returns Length entry. */ ([
        name,
        values,
      ]) => [name, values.length],
    ),
  ),
);
