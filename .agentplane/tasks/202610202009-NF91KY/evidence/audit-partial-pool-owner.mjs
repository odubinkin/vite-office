/** @fileoverview Audits bounded task57 pool/owner evidence; complete coverage acceptance is deliberately pending. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const folder = dirname(fileURLToPath(import.meta.url));
const root = resolve(folder, "../../../..");
/** Calculates an actual blob digest. @param bytes - Raw bytes. @returns Digest. */
function digest(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
const proof = JSON.parse(readFileSync(resolve(folder, "partial-pool-owner.json"), "utf8"));
for (const [path, expected] of Object.entries({ ...proof.sourceHashes, ...proof.nativeHashes }))
  assert.equal(digest(readFileSync(resolve(root, path))), expected, path);
const archive = readFileSync(resolve(folder, proof.archive.path));
assert.equal(digest(archive), proof.archive.sha256);
const records = JSON.parse(gunzipSync(archive).toString("utf8"));
const contents = new Map();
for (const record of records) {
  const bytes = Buffer.from(record.base64, "base64");
  assert.equal(bytes.length, record.bytes);
  assert.equal(digest(bytes), record.sha256, record.path);
  contents.set(record.path, bytes);
}
/** Reads a retained original JSON report. @param name - Original basename. @returns Report. */
function report(name) { return JSON.parse(contents.get("output/playwright/" + name).toString("utf8")); }
const focused = report("task57-owner-repaired-results.json");
assert.equal(focused.numPassedTests, 25);
assert.equal(focused.numFailedTests, 0);
const focusedCoverage = report("task57-focused-owner-coverage-results.json");
assert.equal(focusedCoverage.numPassedTests, 32);
assert.equal(focusedCoverage.numFailedTests, 0);
const coverage = JSON.parse(contents.get("output/playwright/task57-focused-owner-coverage/coverage-final.json").toString("utf8"));
assert.equal(Object.keys(coverage).length, 8);
for (const value of Object.values(coverage)) {
  for (const counter of [...Object.values(value.s), ...Object.values(value.f), ...Object.values(value.b).flat()])
    assert.ok(counter > 0, value.path);
}
const total = JSON.parse(contents.get("output/playwright/task57-focused-owner-coverage/coverage-summary.json").toString("utf8")).total;
for (const [kind, count] of [["statements", 406], ["branches", 194], ["functions", 126], ["lines", 369]]) {
  assert.equal(total[kind].total, count);
  assert.equal(total[kind].covered, count);
  assert.equal(total[kind].pct, 100);
}
const failed = report("task57-owner-first-results.json");
assert.equal(failed.numPassedTests, 19);
assert.equal(failed.numFailedTests, 2);
const calc = report("task57-calc-first-results.json");
assert.equal(calc.numPassedTests, 522);
assert.equal(calc.numFailedTests, 1);
for (const [name, count] of [["task57-owner-browser-repaired.json", 7], ["task57-owner-writer-browser.json", 6], ["task57-owner-visual-browser.json", 5]]) {
  const result = report(name);
  assert.equal(result.stats.expected, count);
  for (const key of ["unexpected", "skipped", "flaky"]) assert.equal(result.stats[key], 0);
  assert.deepEqual(result.errors, []);
}
assert.match(proof.status, /IN PROGRESS/);
assert.equal(proof.pending.length, 3);
console.log(JSON.stringify({ status: "bounded partial evidence passes; full coverage and task acceptance pending", sourcePins: Object.keys(proof.sourceHashes).length, nativePins: Object.keys(proof.nativeHashes).length, retainedArtifacts: records.length, focusedTests: 25, browserScenarios: 18 }));
