/** @fileoverview Compares pinned original ICU scalar captures with native JavaScript and identifies actual LibreOffice case-table fallback reachability. */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const root = "output/playwright/icu-case-native";
const capture = JSON.parse(readFileSync(`${root}/capture.json`, "utf8"));
const pin = capture.baselineCommit;
const paths = [
  "i18nutil/source/utility/casefolding.cxx",
  "i18nutil/source/utility/casefolding_data.h",
  "include/i18nutil/casefolding.hxx",
];
const sources = {};
/** Reads pinned original source with an independent full-blob check. @param path - Original source path. @returns Original text. */
function original(path) {
  const b = readFileSync(`vendor/libreoffice-reference/${path}`);
  if (
    !b.equals(execFileSync("git", ["-C", "vendor/libreoffice-reference", "show", `${pin}:${path}`]))
  )
    throw new Error(`Pinned original differs: ${path}`);
  sources[path] = createHash("sha256").update(b).digest("hex");
  return b.toString("utf8");
}
const table = original(paths[1]);
original(paths[0]);
original(paths[2]);
/** Mechanically reads an original initializer, without implementing mapping behavior. @param name - Actual original constant. @returns Original initializer with comments removed. */
function initializer(name) {
  const match = new RegExp(`const [^\\n]+ ${name}\\[\\] = \\{([\\s\\S]*?)\\n\\};`).exec(table);
  if (!match) throw new Error(`Original table absent: ${name}`);
  return match[1].replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}
const tableIndex = initializer("CaseMappingIndex")
  .split(",")
  .map(
    /** Reads an original integer literal. @param v - Literal. @returns Numeric value. */ (v) =>
      Number(v.trim()),
  );
const tableType = [
  ...initializer("CaseMappingValue").matchAll(/\{\s*(0x[\da-f]+|\d+),\s*(0x[\da-f]+|\d+)\s*\}/gi),
].map(
  /** Reads only the original type field for routing. @param m - Original initializer. @returns Original mask. */ (
    m,
  ) => Number(m[1]),
);
if (tableIndex.at(-1) === 0) tableIndex.pop();
if (tableIndex.length !== 256 || tableType.length !== 13 * 256)
  throw new Error("Incomplete original routing table");
const input = { capture, tableIndex, tableType };
/** Exhaustive native-function experiment, usable unchanged inside a real browser. @param input - Original native observations and original table routing masks. @returns Complete mismatch evidence, including whether each original call reaches ICU. */
function compareNative(input) {
  const { capture, tableIndex, tableType } = input;
  const operations = [
    {
      name: "toLowerCase",
      column: 5,
      flags: [8, 2],
      apply:
        /** Native lowercase only. @param s - One original code point. @returns Native result. */ (
          s,
        ) => s.toLowerCase(),
    },
    {
      name: "scalar lower candidate first code point",
      column: 5,
      flags: [8, 2],
      apply:
        /** Tests the scalar return-type adapter around native lowercase. @param s - One original code point. @returns First complete native result code point. */ (
          s,
        ) => String.fromCodePoint(s.toLowerCase().codePointAt(0)),
    },
    {
      name: "toUpperCase",
      column: 6,
      flags: [4, 1],
      apply:
        /** Native uppercase only. @param s - One original code point. @returns Native result. */ (
          s,
        ) => s.toUpperCase(),
    },
    {
      name: "toLocaleLowerCase(en)",
      column: 5,
      flags: [8, 2],
      apply:
        /** Native root-compatible locale operation. @param s - One code point. @returns Native result. */ (
          s,
        ) => s.toLocaleLowerCase("en"),
    },
    {
      name: "toLocaleUpperCase(en)",
      column: 6,
      flags: [4, 1],
      apply:
        /** Native root-compatible locale operation. @param s - One code point. @returns Native result. */ (
          s,
        ) => s.toLocaleUpperCase("en"),
    },
    {
      name: "title candidate toUpperCase",
      column: 7,
      flags: [16],
      apply:
        /** Tests uppercase as a titlecase candidate, not as an existing titlecase API. @param s - One code point. @returns Native result. */ (
          s,
        ) => s.toUpperCase(),
    },
    {
      name: "fold candidate toLowerCase",
      column: 8,
      flags: [32, 64],
      apply:
        /** Tests lowercase as a fold candidate, not as an existing case-fold API. @param s - One code point. @returns Native result. */ (
          s,
        ) => s.toLowerCase(),
    },
  ];
  const result = operations.map(
    /** Creates independent observation records. @param o - Native function contract. @returns Record. */ (
      o,
    ) => ({
      name: o.name,
      tested: 0,
      mismatches: [],
      fallbackTested: Object.fromEntries(
        o.flags.map(
          /** Seeds original mapping-bit reachability counts. @param f - Original flag. @returns Entry. */ (
            f,
          ) => [f, 0],
        ),
      ),
      fallbackMismatches: Object.fromEntries(
        o.flags.map(
          /** Seeds independent mismatch counts. @param f - Original flag. @returns Entry. */ (
            f,
          ) => [f, 0],
        ),
      ),
    }),
  );
  let row = [...capture.initial],
    count = 0;
  /** Evaluates every observed original field against native functions. @returns Nothing. */
  function visit() {
    const c = row[0],
      text = String.fromCodePoint(c),
      block = c < 65536 ? tableIndex[c >> 8] : -1;
    const mask = block >= 0 ? tableType[(block << 8) + (c & 255)] : 0;
    for (let i = 0; i < operations.length; i++) {
      const o = operations[i],
        r = result[i],
        actual = o.apply(text),
        expected = String.fromCodePoint(row[o.column]);
      r.tested++;
      const fallbackFlags = o.flags.filter(
        /** Applies the actual original table-mask early-return predicate. @param flag - Original mapping type. @returns ICU fallback reachability. */ (
          flag,
        ) => !(mask & flag),
      );
      for (const f of fallbackFlags) r.fallbackTested[f]++;
      if (actual !== expected) {
        r.mismatches.push({
          code: c,
          expected: row[o.column],
          actual: [...actual].map(
            /** Retains every resulting native code point, including expansions. @param s - Native result unit. @returns Code point. */ (
              s,
            ) => s.codePointAt(0),
          ),
          originalTableMask: mask,
          fallbackFlags,
        });
        for (const f of fallbackFlags) r.fallbackMismatches[f]++;
      }
    }
    count++;
  }
  visit();
  for (const [n, ...d] of capture.runs)
    for (let i = 0; i < n; i++) {
      row = row.map(
        /** Losslessly decodes original fields, without Unicode rules. @param v - Prior field. @param c - Column. @returns Original observation. */ (
          v,
          c,
        ) => v + d[c],
      );
      visit();
    }
  if (count !== capture.count) throw new Error("Incomplete native comparison");
  return {
    count,
    missingStandardApis: ["simple scalar titlecase mapping", "Unicode case-fold mapping"],
    operations: result,
  };
}
writeFileSync(`${root}/compare-native-function.js.txt`, compareNative.toString());
const node = { engine: "Node", versions: process.versions, ...compareNative(input) };
writeFileSync(`${root}/native-js-node.json`, JSON.stringify(node, null, 2) + "\n");
const html = `<!doctype html><meta charset="utf-8"><title>Calc native Unicode correspondence</title><pre id="result">Running exhaustive original ICU comparison…</pre><script>const input=${JSON.stringify(input)};const compareNative=${compareNative.toString()};const report={engine:navigator.userAgent,...compareNative(input)};document.getElementById("result").textContent=JSON.stringify({engine:report.engine,count:report.count,operations:report.operations.map(o=>({name:o.name,mismatches:o.mismatches.length,fallbackMismatches:o.fallbackMismatches}))});window.nativeUnicodeReport=report;fetch("/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(report)});</script>`;
writeFileSync(`${root}/native-js-browser.html`, html);
writeFileSync(
  `${root}/native-js-input-metadata.json`,
  JSON.stringify(
    {
      baselineCommit: pin,
      sourceHashes: sources,
      icuSourceHashes: capture.sourceHashes,
      driverHash: capture.driverHash,
      rawHash: capture.rawHash,
      scriptHash: createHash("sha256")
        .update(readFileSync(new URL(import.meta.url)))
        .digest("hex"),
      tableIndex,
      tableType,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    node: node.versions.node,
    unicode: node.versions.unicode,
    count: node.count,
    operations: node.operations.map(
      /** Summarizes complete mismatch records without hiding fallback relevance. @param o - Observation. @returns Counts. */ (
        o,
      ) => ({
        name: o.name,
        mismatches: o.mismatches.length,
        fallbackMismatches: o.fallbackMismatches,
      }),
    ),
    browserArtifact: `${root}/native-js-browser.html`,
  }),
);
