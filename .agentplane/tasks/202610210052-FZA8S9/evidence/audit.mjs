/** @fileoverview Rechecks task61 immutable raw reports,source/native pins and complete positive Istanbul counters without rewriting coverage. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,'../../../..');
/** Hashes bytes. @param bytes - Source bytes. @returns SHA256. */
function hash(bytes){return createHash('sha256').update(bytes).digest('hex');}
const proof=JSON.parse(readFileSync(resolve(folder,'acceptance.json'),'utf8'));
for(const [path,digest] of Object.entries({...proof.sourceHashes,...proof.nativeHashes}))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
for(const [path,digest] of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync('git',['-C','vendor/libreoffice-reference','show',`${proof.nativeBaseline}:${path.replace('vendor/libreoffice-reference/','')}`],{cwd:root})),digest,path);
const archive=readFileSync(resolve(folder,'raw-results.json.gz'));assert.equal(hash(archive),proof.archive.sha256);
const records=JSON.parse(gunzipSync(archive).toString('utf8')), contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const bytes=Buffer.from(record.base64,'base64');assert.equal(bytes.length,record.bytes);assert.equal(hash(bytes),record.sha256);contents.set(record.path,bytes);}
/** Reads one unmodified archived JSON. @param path - Exact path. @returns Report. */
function json(path){return JSON.parse(contents.get(path).toString('utf8'));}
for(const [name,count] of [['calc-final',537],['shared-final',11]]){const result=json(`output/playwright/task61-${name}-results.json`);assert.equal(result.success,true);assert.equal(result.numPassedTests,count);assert.equal(result.numFailedTests,0);assert.equal(result.numPendingTests,0);}
for(const [name,count] of [['calc-final',130],['shared-final',1]]){
 const coverage=json(`output/playwright/task61-${name}-coverage/coverage-final.json`);assert.equal(Object.keys(coverage).length,count);
 for(const [path,file] of Object.entries(coverage)){
  for(const [counter,map] of [['s','statementMap'],['f','fnMap'],['b','branchMap']])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
  for(const value of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,path);
 }
 for(const key of ["lines","statements","functions","branches"])assert.equal(json(`output/playwright/task61-${name}-coverage/coverage-summary.json`).total[key].pct,100);
}
assert.match(contents.get('output/playwright/task61-static-final.log').toString(),/Static build smoke passed/);
assert.match(contents.get('output/playwright/task61-browser-final-area.log').toString(),/gridcell "B2" \[selected\]/);
assert.match(contents.get('output/playwright/task61-browser-final-area.log').toString(),/gridcell "C3" \[selected\]/);
assert.match(contents.get('output/playwright/task61-browser-final-all.log').toString(),/gridcell "A1" \[selected\]/);
assert.match(contents.get('output/playwright/task61-browser-final-input-mac.log').toString(),/"selectionEnd": 1/);
console.log(`Task61 acceptance:537 Calc+11 shared/Writer tests;130+1 owners100%;${records.length} raw artifacts;${Object.keys(proof.sourceHashes).length} current source pins;${Object.keys(proof.nativeHashes).length} pinned native inputs.`);
