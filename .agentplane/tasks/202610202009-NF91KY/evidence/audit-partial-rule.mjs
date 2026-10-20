/** Rechecks only this explicitly partial checkpoint;it does not certify full task coverage or completion. */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";
const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, "../../../..");
const proof = JSON.parse(readFileSync(resolve(directory, "partial-rule-values.json"), "utf8"));
/** Computes the actual archived/source byte digest. */
function hash(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
for (const [path, expected] of Object.entries(proof.sourceHashes))
  assert.equal(hash(resolve(root, path)), expected, path);
for (const [path, expected] of Object.entries(proof.nativeSourceHashes))
  assert.equal(hash(resolve(root, "vendor/libreoffice-reference", path)), expected, path);
for (const [path, expected] of Object.entries(proof.archives))
  assert.equal(hash(resolve(directory, path)), expected, path);
const reports = JSON.parse(gunzipSync(readFileSync(resolve(directory, "partial-rule-reports.json.gz"))));
for (const [name, count, files] of [
  ["task57-rule-owner-results.json", 87, 13],
  ["task57-rule-calc-related-results.json", 6, 3],
]) {
  const report = reports[name];
  assert.equal(report.numPassedTests, count);
  assert.equal(report.numFailedTests, 0);
  assert.equal(report.numPendingTests, 0);
  assert.equal(report.testResults.length, files);
  for (const file of report.testResults)
    for (const test of file.assertionResults) assert.equal(test.status, "passed");
}
assert.equal(reports["task57-rule-fonts-first-results.json"].numPassedTests, 42);
assert.equal(reports["task57-rule-fonts-first-results.json"].numFailedTests, 2);
assert.equal(proof.status, "partial-task-in-progress");
process.stdout.write("Partial checkpoint verified:87 related and6 Calc cases;source/native/archive hashes match. Full task gates remain pending.\n");
