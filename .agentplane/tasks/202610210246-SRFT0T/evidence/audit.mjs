/** @fileoverview Portable immutable evidence audit for native Calc view options and actual shared/browser consumers. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,'../../../..');
/** Hashes exact bytes. @param bytes - Source bytes. @returns SHA256. */
function hash(bytes){return createHash('sha256').update(bytes).digest('hex');}
const proof=JSON.parse(readFileSync(resolve(folder,'acceptance.json'),'utf8'));
for(const [path,digest] of Object.entries({...proof.sourceHashes,...proof.nativeHashes}))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
for(const [path,digest]of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync('git',['-C','vendor/libreoffice-reference','show',`${proof.nativeBaseline}:${path.replace('vendor/libreoffice-reference/','')}`],{cwd:root})),digest,path);
const archive=readFileSync(resolve(folder,'raw-results.json.gz'));assert.equal(hash(archive),proof.archive.sha256);
const records=JSON.parse(gunzipSync(archive)),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const bytes=Buffer.from(record.base64,'base64');assert.equal(bytes.length,record.bytes);assert.equal(hash(bytes),record.sha256);contents.set(record.path,bytes);}
/** Reads an archived JSON artifact. @param path - Exact path. @returns Parsed result. */
function json(path){return JSON.parse(contents.get(path).toString());}
/** Reads observed CLI browser results without executing browser code. @param name - Artifact suffix. @returns Observed state. */
function browser(name){return JSON.parse(contents.get(`output/playwright/task64-browser-${name}.log`).toString().split('### Result\n')[1].split('\n### Ran Playwright code')[0]);}
for(const [name,count]of [['verified-calc',584],['final-related',22],['accepted-tooling',17],['grid-accepted',6]]){
 const report=json(`output/playwright/task64-${name}-results.json`);assert.equal(report.success,true,name);assert.equal(report.numPassedTests,count,name);assert.equal(report.numFailedTests,0,name);assert.equal(report.numPendingTests,0,name);
}
for(const [profile,count]of [['verified-calc',132],['final-shared',1],['accepted-catalog',1]]){
 const coverage=json(`output/playwright/task64-${profile}-coverage/coverage-final.json`);assert.equal(Object.keys(coverage).length,count,profile);
 for(const [path,file]of Object.entries(coverage)){
  for(const [counter,map]of [['s','statementMap'],['f','fnMap'],['b','branchMap']])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
  for(const value of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,path);
 }
 const summary=json(`output/playwright/task64-${profile}-coverage/coverage-summary.json`).total;for(const metric of ['statements','branches','functions','lines'])assert.equal(summary[metric].pct,100,`${profile}:${metric}`);
}
for(const [name,count]of [['gate',10],['extra-gate',4]]){const gates=json(`output/playwright/task64-verified-${name}-exits.json`);assert.equal(gates.length,count);for(const gate of gates){assert.equal(gate.exitCode,0,gate.name);assert.equal(gate.error,null,gate.name);}}
const metadata=json('output/playwright/task64-final-metadata-gate-exits.json');assert.equal(metadata.length,3);for(const gate of metadata)assert.equal(gate.exitCode,0,gate.name);
assert.match(contents.get('output/playwright/task64-verified-accepted-static.log').toString(),/Static build smoke passed/);
assert.match(contents.get('output/playwright/task64-resource-proof.log').toString(),/sole resource difference is readable ToggleFormula/);
assert.equal(browser('closure-error').text,'#DIV/0!');
const grid=browser('closure-grid');assert.equal(grid.gridColor,'rgba(0, 0, 0, 0)');assert.equal(grid.frameTop,'1px');assert.equal(grid.frameLeft,'1px');
const headers=browser('closure-headers');assert.equal(headers.headers,0);assert.equal(headers.x,0);assert.equal(headers.y,0);assert.equal(headers.columnIndex,'1');assert.equal(headers.rowIndex,'1');
assert.equal(browser('closure-formula').text,'=1/0');assert.equal(browser('closure-shortcut').text,'#DIV/0!');
const mobile=contents.get('output/playwright/task64-browser-closure-mobile-menu.log').toString();assert.match(mobile,/menuitemcheckbox "Show Formulas"/);assert.ok(mobile.includes('Ctrl+`'));assert.ok(!mobile.includes('QUOTELEFT'));
console.log(`Task64 acceptance:584Calc tests/132owners100%;22shared/Writer tests/shared key owner100%;17tooling/shared catalog100%;${records.length}raw artifacts;${Object.keys(proof.sourceHashes).length}source pins;${Object.keys(proof.nativeHashes).length}native pins;14individually passing gates;actual desktop/mobile formula/grid/header/frame/shortcut proof.`);
