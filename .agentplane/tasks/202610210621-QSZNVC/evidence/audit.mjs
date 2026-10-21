/** @fileoverview Verifies the archived block69 acceptance against exact source bytes and raw coverage counters. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const dir = '.agentplane/tasks/202610210621-QSZNVC/evidence';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const acceptance = JSON.parse(fs.readFileSync(`${dir}/acceptance.json`, 'utf8'));
const packed = fs.readFileSync(`${dir}/raw-results.json.gz`);
assert.equal(sha(packed), acceptance.archiveSha256);
const raw = JSON.parse(zlib.gunzipSync(packed).toString());
const read = path => Buffer.from(raw[path], 'base64').toString();
const json = path => JSON.parse(read(path));
for (const source of acceptance.sources) assert.equal(sha(fs.readFileSync(source.path)), source.sha256, source.path);
for (const path of acceptance.rawPaths) assert.ok(Object.hasOwn(raw, path), path);
for (const [owner, count, files] of [['calc', 607, 135], ['shortcut', 28, 1]]) {
  const result = json(`output/playwright/task69-accepted-${owner}-results.json`);
  assert.equal(result.numPassedTests, count);
  assert.equal(result.numFailedTests, 0);
  assert.equal(result.numPendingTests, 0);
  assert.equal(result.success, true);
  const coverage = json(`output/playwright/task69-accepted-${owner}-coverage/coverage-final.json`);
  assert.equal(Object.keys(coverage).length, files);
  for (const [path, counters] of Object.entries(coverage)) {
    for (const type of ['s', 'f', 'b']) {
      for (const value of Object.values(counters[type]).flat()) assert.ok(value > 0, `${path}:${type}`);
    }
  }
  const total = json(`output/playwright/task69-accepted-${owner}-coverage/coverage-summary.json`).total;
  for (const type of ['lines','statements','functions','branches']) assert.equal(total[type].pct, 100);
}
const gates=json('output/playwright/task69-gate-exits.json');
assert.equal(gates.length,13);
for(const gate of gates) assert.equal(gate.exitCode,0,gate.name);
assert.match(read('output/playwright/task69-browser-save.txt'), /"defaultPrevented": true/);
assert.match(read('output/playwright/task69-browser-saved-list.txt'), /button "file_example_ODS_10"/);
assert.match(read('output/playwright/task69-browser-saved-list.txt'), /button "Browser saved"/);
assert.match(read('output/playwright/task69-browser-reopened-save.txt'), /generic.*Browser saved/);
assert.match(read('output/playwright/task69-reopened.txt'), /Dulce/);
assert.match(read('output/playwright/task69-reopened.txt'), /6548/);
console.log('Block69 acceptance passed: 607 Calc tests,135 Calc owners100,28 related tests,shared shortcut100,13 gates and real browser Save/import persistence.');
