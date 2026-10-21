/** @fileoverview Immutable source and raw acceptance audit for ordinary ODS and native header sizing. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,'../../../..');
/** Hashes exact bytes. @param bytes - Bytes. @returns SHA256. */
function hash(bytes){return createHash('sha256').update(bytes).digest('hex');}
const proof=JSON.parse(readFileSync(resolve(folder,'acceptance.json'),'utf8'));
for(const[path,digest]of Object.entries(proof.sourceHashes))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
const bytes=readFileSync(resolve(folder,'raw-results.json.gz'));assert.equal(hash(bytes),proof.archive.sha256);
const records=JSON.parse(gunzipSync(bytes));assert.equal(records.length,proof.archive.records);
const raw=new Map(records.map(record=>{const b=Buffer.from(record.base64,'base64');assert.equal(b.length,record.bytes,record.path);assert.equal(hash(b),record.sha256,record.path);return[record.path,b];}));
/** Reads exact archived JSON. @param path - Artifact path. @returns Parsed record. */
function json(path){assert.ok(raw.has(path),path);return JSON.parse(raw.get(path));}
/** Requires every measured counter,including all branch alternatives,to be positive. @param name - Profile. @param owners - Required nonempty owner count. @returns Nothing. */
function coverage(name,owners){
 const summary=json(`output/playwright/${name}/coverage-summary.json`),map=json(`output/playwright/${name}/coverage-final.json`);
 if(owners!==undefined)assert.equal(Object.keys(summary).length-1,owners,name);
 for(const metric of ['statements','branches','functions','lines'])assert.equal(summary.total[metric].pct,100,`${name}:${metric}`);
 for(const[path,c]of Object.entries(map)){
  assert.equal(Object.keys(c.s).length,Object.keys(c.statementMap).length,path);
  assert.equal(Object.keys(c.f).length,Object.keys(c.fnMap).length,path);
  assert.equal(Object.keys(c.b).length,Object.keys(c.branchMap).length,path);
  for(const n of [...Object.values(c.s),...Object.values(c.f),...Object.values(c.b).flat()])assert.ok(n>0,`${name}:${path}`);
 }
}
const calc=json('output/playwright/task68-final-calc-results.json');assert.equal(calc.success,true);assert.equal(calc.numPassedTests,604);assert.equal(calc.numFailedTests,0);assert.equal(calc.numPendingTests,0);assert.equal(calc.testResults.length,177);
coverage('task68-final-calc-coverage',135);coverage('task68-header-core-coverage');coverage('task68-header-pointer-coverage');coverage('task68-shared-tracking-complete-coverage');coverage('task67-xml-coverage');
const gates=json('output/playwright/task68-gate-exits.json');assert.equal(gates.length,13);for(const g of gates){assert.equal(g.exitCode,0,g.name);assert.equal(g.error,null,g.name);}
assert.match(raw.get('output/playwright/task68-gate-static.log').toString(),/Static build smoke passed/);
assert.match(raw.get('output/playwright/task68-shared-tracking-complete-tests.log').toString(),/Tests\s+28 passed/);
assert.match(raw.get('output/playwright/task67-sample-all-cells.log').toString(),/PASS all80 scalar cells/);
assert.equal(json('output/playwright/task67-sample-expected.json').sha256,proof.sampleSha256);
for(const[path,value]of [['column-after',126],['column-undone',85],['row-after',48],['row-cancelled',17]])assert.match(raw.get(`output/playwright/task68-browser-${path}.log`).toString(),new RegExp(`Result\\n${value}\\n`));
const moved=json('output/playwright/task68-tracking-refactor-proof.json');assert.equal(moved.normalizedOriginalSha256,moved.currentSha256);
console.log(`${proof.taskId}:604Calc/177files/135owners100;28relatedtracking100;all raw counters positive;13gates0;sample80cells;native mouse size/undo/cancel;${records.length}immutable artifacts;${Object.keys(proof.sourceHashes).length}source pins.`);
