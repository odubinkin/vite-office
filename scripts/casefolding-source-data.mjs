/** @fileoverview Verifies complete pinned IDL/generator/case-table blobs and extracts original initialized case data without implementing mapping algorithms. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { upstream, pin, hash, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";

if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw new Error("Expected pinned LibreOffice baseline");
const sources = {};
const idl = loadUnicodeOriginal(sources, "udkapi/com/sun/star/lang/Locale.idl");
loadUnicodeOriginal(sources, "codemaker/source/cppumaker/cpputype.cxx");
loadUnicodeOriginal(sources, "include/i18nutil/casefolding.hxx");
loadUnicodeOriginal(sources, "i18npool/qa/cppunit/test_characterclassification.cxx");
const raw = loadUnicodeOriginal(sources, "i18nutil/source/utility/casefolding_data.h");
const implementation = loadUnicodeOriginal(sources, "i18nutil/source/utility/casefolding.cxx");

/** Removes comments before mechanically reading original initializer syntax. @param text - Complete original source. @returns Comment-free source. */
function uncomment(text) {
  return text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
}
const text = uncomment(raw);
/** Selects one complete original array initializer. @param name - Original symbol. @returns Initializer text. */
function array(name) {
  const result = text.match(new RegExp(`\\b${name}\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};`));
  if (!result) throw new Error(`Missing original array ${name}`);
  return result[1];
}
/** Parses original decimal/hex integer syntax only. @param token - Original integer. @returns Exact numeric value. */
function integer(token) {
  return Number(token);
}
const index = array("CaseMappingIndex")
  .match(/-?0x[\da-f]+|-?\d+/gi)
  .map(integer);
const value = [
  ...array("CaseMappingValue").matchAll(/\{\s*(0x[\da-f]+|\d+)\s*,\s*(0x[\da-f]+|\d+)\s*\}/gi),
].map(
  /** Copies original Value fields. @param match - Initializer match. @returns Exact two-field data. */
  (match) => [integer(match[1]), integer(match[2])],
);
const extra = [
  ...array("CaseMappingExtra").matchAll(
    /\{\s*(0x[\da-f]+|\d+)\s*,\s*(\d+)\s*,\s*\{([^}]*)\}\s*\}/gi,
  ),
].map(
  /** Copies complete original Mapping fields. @param match - Initializer match. @returns Exact type/count/array data. */
  (match) => [
    integer(match[1]),
    integer(match[2]),
    match[3].match(/0x[\da-f]+|\d+/gi).map(integer),
  ],
);
if (
  index.length !== 256 ||
  value.length !== 3328 ||
  extra.length !== 352 ||
  extra.some(
    /** Rejects incomplete initialized original arrays. @param row - Captured struct. @returns Whether capacity differs. */
    (row) => row[2].length !== 3,
  )
)
  throw new Error("Incomplete original case data");
const data = {
  CaseMappingIndex: index,
  CaseMappingValue: value,
  MaxCaseMappingExtras: integer(text.match(/#define MaxCaseMappingExtras\s+(\d+)/)[1]),
  CaseMappingExtra: extra,
};
const conditionalMappings = Object.fromEntries(
  [
    ...uncomment(implementation).matchAll(
      /const Mapping (mapping_[\da-f]+)\[\]\s*=\s*\{([^;]+)\};/gi,
    ),
  ].map(
    /** Retains every initialized original conditional Mapping array. @param match - Complete array declaration. @returns Name and complete rows. */
    (match) => [
      match[1],
      [...match[2].matchAll(/\{\s*(\d+)\s*,\s*(\d+)\s*,\s*\{([^}]*)\}\s*\}/g)].map(
        /** Retains type/count and all three native units. @param row - Complete struct initializer. @returns Exact initialized fields. */
        (row) => [integer(row[1]), integer(row[2]), row[3].match(/0x[\da-f]+|\d+/gi).map(integer)],
      ),
    ],
  ),
);
if (
  Object.keys(conditionalMappings).length !== 10 ||
  Object.values(conditionalMappings).flat().length !== 21
)
  throw new Error("Incomplete original conditional Mapping arrays");
const contract = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Retains full original blob digests. @param entry - Source path and full bytes. @returns Digest pair. */
      ([name, bytes]) => [name, hash(bytes)],
    ),
  ),
  localeFields: [...uncomment(idl).matchAll(/\bstring\s+(\w+)\s*;/g)].map(
    /** Retains original IDL declaration order and type. @param match - Original field. @returns Field descriptor. */
    (match) => ({ name: match[1], type: "string", default: "" }),
  ),
  dataHash: hash(JSON.stringify(data)),
  conditionalMappingsHash: hash(JSON.stringify(conditionalMappings)),
  evidenceScope:
    "Original IDL field schema and generated plain-struct defaults/order plus initialized original tables. This is source data evidence, not execution of cppumaker or native casefolding/UNO type reflection.",
};
const write = process.argv.includes("--write"),
  check = process.argv.includes("--check");
if (Number(write) + Number(check) !== 1) throw new Error("Use exactly --write or --check");
for (const [path, result] of [
  ["apps/office/src/i18nutil/source/utility/casefolding_data.json", data],
  ["apps/office/src/i18nutil/source/utility/casefolding_conditions.json", conditionalMappings],
  ["apps/office/src/i18nutil/source/utility/casefolding-source-contract.json", contract],
]) {
  if (write) writeFileSync(path, JSON.stringify(result) + "\n");
  else if (JSON.stringify(JSON.parse(readFileSync(path, "utf8"))) !== JSON.stringify(result))
    throw new Error(`Original source data differs: ${path}`);
}
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    localeFields: contract.localeFields,
    index: index.length,
    values: value.length,
    extras: extra.length,
    dataHash: contract.dataHash,
  }),
);
