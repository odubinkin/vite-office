/** @fileoverview Extracts complete pinned width tables and original transliteration numeric declarations without normalizing duplicate keys. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { format, resolveConfig } from "prettier";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const sources = {};
const files = [
  "include/i18nutil/oneToOneMapping.hxx",
  "i18nutil/source/utility/oneToOneMapping.cxx",
  "include/i18nutil/widthfolding.hxx",
  "i18nutil/source/utility/widthfolding.cxx",
  "i18nutil/source/utility/widthfolding_data.h",
  "include/i18nutil/transliteration.hxx",
  "offapi/com/sun/star/i18n/TransliterationModules.idl",
  "offapi/com/sun/star/i18n/TransliterationModulesExtra.idl",
  "include/i18nutil/casefolding.hxx",
  "i18nutil/source/utility/casefolding.cxx",
  "include/sal/types.h",
];
for (const name of files) loadUnicodeOriginal(sources, name);
/** Removes source comments without interpreting initializer expressions. @param text - Original file. @returns Declaration text. */
function uncomment(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
const text = uncomment(sources[files[4]]);
const constants = Object.fromEntries(
  [...text.matchAll(/#define\s+(\w+)\s+(0x[\da-f]+|\d+)/gi)].map(
    /** Retains original numeric macro values. @param match - Full macro. @returns Named value. */
    (match) => [match[1], Number(match[2])],
  ),
);
/** Parses the original integer/OR initializer grammar. @param expression - Original initializer. @returns Exact numeric value. */
function integer(expression) {
  let value = 0;
  for (const part of expression.trim().split(/\s*\|\s*/)) {
    const n = /^-?(?:0x[\da-f]+|\d+)$/i.test(part)
      ? part.startsWith("-0x")
        ? -Number(part.slice(1))
        : Number(part)
      : constants[part];
    if (!Number.isInteger(n)) throw new Error(`Unsupported original numeric initializer: ${part}`);
    value |= n;
  }
  return value;
}
/** Extracts complete original rows with every declared scalar member. @param name - Original array name. @param width - Declared row capacity. @returns Full rows. */
function rows(name, width) {
  const match = text.match(
    new RegExp(`\\b${name}\\s*\\[\\s*\\](?:\\[2\\])?\\s*=\\s*\\{([\\s\\S]*?)\\};`),
  );
  if (!match) throw new Error(`Missing original array ${name}`);
  const result = [...match[1].matchAll(/\{([^{}]+)\}/g)].map(
    /** Preserves all row fields and duplicate source order. @param row - Complete initializer. @returns Numeric fields. */
    (row) => row[1].split(",").map(integer),
  );
  if (
    !result.length ||
    result.some(
      /** Rejects incomplete structs. @param row - Original fields. @returns Wrong capacity. */ (
        row,
      ) => row.length !== width,
    )
  )
    throw new Error(`Incomplete original array ${name}`);
  return result;
}
const data = {
  constants,
  decomposition_table: rows("decomposition_table", 2),
  composition_table: rows("composition_table", 2),
  full2half: rows("full2half", 3),
  half2full: rows("half2full", 3),
};
const modules = Object.fromEntries(
  [...uncomment(sources[files[6]]).matchAll(/\b(\w+)\s*=\s*(-?(?:0x[\da-f]+|\d+))/gi)].map(
    /** Preserves original enum values. @param match - Original enumerator. @returns Named value. */
    (match) => [match[1], integer(match[2])],
  ),
);
const extra = Object.fromEntries(
  [
    ...uncomment(sources[files[7]]).matchAll(
      /const\s+(?:short|long)\s+(\w+)\s*=\s*(-?(?:0x[\da-f]+|\d+))/gi,
    ),
  ].map(
    /** Preserves the original constants group. @param match - Original constant. @returns Named value. */
    (match) => [match[1], integer(match[2])],
  ),
);
const declaration = uncomment(sources[files[5]]).match(
  /enum class TransliterationFlags\s*\{([\s\S]*?)\};/,
)[1];
const flags = {},
  flagExpressions = {};
for (const match of declaration.matchAll(/(\w+)\s*=\s*([^,\n]+)\s*,?/g)) {
  const expression = match[2].trim();
  const m = expression.match(/^int\(css::i18n::TransliterationModules_(\w+)\)$/),
    e = expression.match(/^int\(css::i18n::TransliterationModulesExtra::(\w+)\)$/);
  flags[match[1]] = m ? modules[m[1]] : e ? extra[e[1]] : integer(expression);
  if (!Number.isInteger(flags[match[1]])) throw new Error(`Unresolved original flag ${match[1]}`);
  flagExpressions[match[1]] = m ? `M.${m[1]}` : e ? `E.${e[1]}` : expression;
}
const contract = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes each complete verified original file. @param entry - Source path and bytes. @returns Hash pair. */
      ([name, bytes]) => [name, hash(bytes)],
    ),
  ),
  dataHash: hash(JSON.stringify(data)),
  modules,
  extra,
  flags,
  evidenceScope:
    "Complete initialized original arrays and numeric source declarations only; no native algorithm/ABI/service proof from extraction.",
};
const base = "apps/office/src/";
const results = [
  [base + "i18nutil/source/utility/widthfolding_data.json", JSON.stringify(data) + "\n"],
  [
    base + "i18nutil/source/utility/widthfolding-source-contract.json",
    JSON.stringify(contract) + "\n",
  ],
  [
    base + "offapi/com/sun/star/i18n/TransliterationModules.ts",
    "/** @fileoverview Original TransliterationModules IDL enum and generated native size sentinel. */\n/** Original enum values; the generated ABI sentinel is retained. */\nexport enum TransliterationModules {\n" +
      Object.entries(modules)
        .map(
          /** Emits original enumerators. @param entry - Name/value. @returns Declaration. */ ([
            name,
            value,
          ]) => `  ${name} = ${value},`,
        )
        .join("\n") +
      `\n  MAKE_FIXED_SIZE = ${integer(sources["include/sal/types.h"].match(/#define\s+SAL_MAX_ENUM\s+(0x[\da-f]+|\d+)/i)[1])},\n}\n`,
  ],
  [
    base + "offapi/com/sun/star/i18n/TransliterationModulesExtra.ts",
    "/** @fileoverview Original TransliterationModulesExtra IDL constants group. */\n/** Original constant names, integral values and constant-group shape. */\nexport const TransliterationModulesExtra = " +
      JSON.stringify(extra, null, 2) +
      " as const;\n",
  ],
  [
    base + "i18nutil/inc/transliteration.ts",
    '/** @fileoverview Original transliteration.hxx flags backed by the original shared IDL numeric owners. */\nimport { TransliterationModules as M } from "../../offapi/com/sun/star/i18n/TransliterationModules";\nimport { TransliterationModulesExtra as E } from "../../offapi/com/sun/star/i18n/TransliterationModulesExtra";\n/** Original superset flags; retain the distinct native ignore mask. */\nexport const TransliterationFlags = {\n' +
      Object.entries(flagExpressions)
        .map(
          /** Emits exact original flag references. @param entry - Name/expression. @returns Declaration. */ ([
            name,
            expression,
          ]) => `  ${name}: ${expression},`,
        )
        .join("\n") +
      "\n} as const;\n/** Native flags use the original integral bit-mask domain. */\nexport type TransliterationFlags = number;\n",
  ],
];
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
for (const [path, value] of results) {
  const formatted = await format(value, {
    ...(await resolveConfig(path)),
    parser: path.endsWith(".ts") ? "typescript" : "json",
  });
  if (write) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, formatted);
  } else if (readFileSync(path, "utf8") !== formatted)
    throw new Error(`Original source extraction differs: ${path}`);
}
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    sourceFiles: files.length,
    counts: Object.fromEntries(
      Object.entries(data)
        .filter(
          /** Selects array owners. @param entry - Named data. @returns Array flag. */ ([
            ,
            value,
          ]) => Array.isArray(value),
        )
        .map(
          /** Reports complete row counts. @param entry - Named rows. @returns Name/count. */ ([
            name,
            value,
          ]) => [name, value.length],
        ),
    ),
    flags: Object.keys(flags).length,
  }),
);
