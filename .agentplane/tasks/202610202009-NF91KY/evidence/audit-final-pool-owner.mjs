/** @fileoverview Audits current task57 source pins, historical checkpoints and exact unchanged-source coverage aggregation. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import coverage from "istanbul-lib-coverage";
const folder = dirname(fileURLToPath(import.meta.url)), root = resolve(folder, "../../../..");
/** Reads repository JSON. @param path - Absolute path. @returns Value. */
function json(path) { return JSON.parse(readFileSync(path, "utf8")); }
/** Calculates a byte digest. @param bytes - Actual bytes. @returns Digest. */
function digest(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
const proof = json(resolve(folder, "final-pool-owner.json"));
for (const [path, expected] of Object.entries({ ...proof.sourceHashes, ...proof.sharedRuntimeHashes, ...proof.calcRuntimeHashes, ...proof.nativeHashes }))
  assert.equal(digest(readFileSync(resolve(root, path))), expected, path);
let historicalPins = 0;
for (const record of proof.historicalSourceCheckpoints) {
  const previous = json(resolve(folder, record.manifest));
  for (const [path, expected] of Object.entries(previous.sourceHashes)) {
    const original = execFileSync("git", ["show", `${record.sourceCommit}:${path}`], { cwd: root });
    assert.equal(digest(original), expected, `${record.sourceCommit}:${path}`);
    historicalPins++;
  }
}
for (const [path, expected] of Object.entries(proof.referenceArchives))
  assert.equal(digest(readFileSync(resolve(folder, path))), expected, path);
const bytes = readFileSync(resolve(folder, proof.archive.path));
assert.equal(digest(bytes), proof.archive.sha256);
const records = JSON.parse(gunzipSync(bytes).toString("utf8")), contents = new Map();
assert.equal(records.length, proof.archive.records);
for (const record of records) {
  const data = Buffer.from(record.base64, "base64");
  assert.equal(data.length, record.bytes);
  assert.equal(digest(data), record.sha256, record.path);
  contents.set(record.path, data);
}
/** Reads an original archived report. @param path - Original repository path. @returns Parsed report. */
function report(path) { return JSON.parse(contents.get(path).toString("utf8")); }
for (const [path, passed] of [["task57-shared-first-results.json", 17453], ["task57-rule-null-results.json", 10], ["task57-writer-number-related-results.json", 35], ["task57-scoped-shared-results.json", 2476]]) {
  const result = report("output/playwright/" + path);
  assert.equal(result.numPassedTests, passed);
  assert.equal(result.numFailedTests, 0);
}
const base = report("apps/office/coverage/shared/coverage-final.json");
const addition = report("output/playwright/task57-rule-null-coverage/coverage-final.json");
const accepted = report("output/playwright/task57-complete-shared-coverage/coverage-final.json");
assert.equal(Object.keys(base).length, 495);
assert.equal(Object.keys(addition).length, 1);
assert.deepEqual(Object.keys(accepted).sort(), Object.keys(base).sort());
let previousZeros = 0;
for (const [path, file] of Object.entries(accepted)) {
  for (const field of ["statementMap", "fnMap", "branchMap"]) {
    assert.deepEqual(file[field], base[path][field]);
    if (addition[path]) assert.deepEqual(addition[path][field], base[path][field]);
  }
  for (const field of ["s", "f"])
    for (const [key, counter] of Object.entries(file[field])) {
      assert.equal(counter, base[path][field][key] + (addition[path]?.[field][key] ?? 0));
      assert.ok(counter > 0, path);
      if (base[path][field][key] === 0) previousZeros++;
    }
  for (const [key, counters] of Object.entries(file.b))
    for (let i = 0; i < counters.length; i++) {
      assert.equal(counters[i], base[path].b[key][i] + (addition[path]?.b[key][i] ?? 0));
      assert.ok(counters[i] > 0, path);
      if (base[path].b[key][i] === 0) previousZeros++;
    }
}
assert.equal(previousZeros, 1);
const combined = coverage.createCoverageMap(structuredClone(base));
combined.merge(structuredClone(addition));
assert.deepEqual(JSON.parse(JSON.stringify(combined.toJSON())), accepted);
const total = combined.getCoverageSummary().toJSON();
for (const [field, expected] of Object.entries(proof.results.sharedCounts)) {
  assert.equal(total[field].total, expected);
  assert.equal(total[field].covered, expected);
  assert.equal(total[field].pct, 100);
}
assert.deepEqual(report("output/playwright/task57-complete-shared-coverage/coverage-summary.json").total, total);
const partial = json(resolve(folder, "partial-pool-owner.json"));
const retained = JSON.parse(gunzipSync(readFileSync(resolve(folder, partial.archive.path))).toString("utf8"));
const original = new Map(retained.map((entry) => [entry.path, JSON.parse(entry.path.endsWith(".json") ? Buffer.from(entry.base64, "base64").toString("utf8") : "null")]));
const calc = original.get("apps/office/coverage/calc/coverage-final.json");
assert.equal(Object.keys(calc).length, 129);
for (const file of Object.values(calc))
  for (const value of [...Object.values(file.s), ...Object.values(file.f), ...Object.values(file.b).flat()]) assert.ok(value > 0);
const calcTotal = coverage.createCoverageMap(calc).getCoverageSummary().toJSON();
for (const [field, expected] of Object.entries(proof.results.calcCounts)) {
  assert.equal(calcTotal[field].total, expected);
  assert.equal(calcTotal[field].covered, expected);
  assert.equal(calcTotal[field].pct, 100);
}
assert.equal(original.get("output/playwright/task57-calc-repaired-results.json").numPassedTests, 523);
assert.equal(original.get("output/playwright/task57-calc-repaired-results.json").numFailedTests, 0);
for (const [name, count] of [["task57-owner-browser-repaired.json", 7], ["task57-owner-writer-browser.json", 6], ["task57-owner-visual-browser.json", 5]]) {
  const result = original.get("output/playwright/" + name);
  assert.equal(result.stats.expected, count);
  for (const field of ["unexpected", "flaky", "skipped"]) assert.equal(result.stats[field], 0);
  assert.deepEqual(result.errors, []);
}
console.log(JSON.stringify({ status: "bounded task deterministic acceptance passes;broader goal remains incomplete", taskSourcePins: Object.keys(proof.sourceHashes).length, historicalPins, nativePins: Object.keys(proof.nativeHashes).length, sharedOwners: 495, calcOwners: 129, sharedStatements: total.statements.total, sharedBranches: total.branches.total, exactActualCounterSums: true, coveragePercent: 100 }));
