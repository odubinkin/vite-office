/** @fileoverview Checks block71 original reproduction,raw positive coverage counters and browser storage evidence. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const dir='.agentplane/tasks/202610221715-X5TEM5/evidence',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const a=JSON.parse(fs.readFileSync(`${dir}/acceptance.json`,'utf8')),packed=fs.readFileSync(`${dir}/raw-results.json.gz`);
assert.equal(sha(packed),a.archiveSha256);
const raw=JSON.parse(zlib.gunzipSync(packed).toString()),read=p=>Buffer.from(raw[p],'base64').toString(),json=p=>JSON.parse(read(p));
for(const p of a.rawPaths)assert.ok(Object.hasOwn(raw,p),p);
for(const s of a.sources)assert.equal(sha(fs.readFileSync(s.path)),s.sha256,s.path);
const before=read('output/playwright/task71-before.log').trim().split('\n').map(JSON.parse),after=read('output/playwright/task71-after.log').trim().split('\n').map(JSON.parse);
assert.equal(before[0].rows,5000);assert.equal(before[0].columns,1024);
assert.equal(before[1].error,'ODS export size limit exceeded');
assert.equal(before[0].inputBytes,after[0].inputBytes);
assert.equal(after[1].outputBytes,1475262);
assert.ok(after[1].outputBytes<3*1024*1024);
assert.equal(Buffer.from(raw['output/playwright/task71-large-output.ods'],'base64').length,after[1].outputBytes);
assert.match(fs.readFileSync('apps/office/src/sc/source/filter/xml/xmlwrap.ts','utf8'),/64 \* 1024 \* 1024/);
for(const[profile,tests,files,owners]of[['calc',610,180,135],['xml',56,14,1]]){
 const r=json(`output/playwright/task71-${profile}-results.json`);assert.equal(r.success,true);assert.equal(r.numPassedTests,tests);assert.equal(r.numFailedTests,0);assert.equal(r.numPendingTests,0);assert.equal(r.testResults.length,files);
 const coverage=json(`output/playwright/task71-${profile}-coverage/coverage-final.json`);assert.equal(Object.keys(coverage).length,owners);
 for(const[p,c]of Object.entries(coverage))for(const kind of ['s','f','b'])for(const value of Object.values(c[kind]).flat())assert.ok(value>0,`${p}:${kind}`);
 for(const metric of ['statements','branches','functions','lines'])assert.equal(json(`output/playwright/task71-${profile}-coverage/coverage-summary.json`).total[metric].pct,100);
}
const gates=json('output/playwright/task71-gate-exits.json');assert.equal(gates.length,14);for(const g of gates)assert.equal(g.exitCode,0,g.name);
assert.match(read('output/playwright/task71-browser-stored-list.txt'),/button "task71-independent-5000"/);
assert.match(read('output/playwright/task71-browser-reopened-last.txt'),/AMJ5000/);
assert.match(read('output/playwright/task71-browser-reopened-last.txt'),/Last 4999/);
assert.match(read('vendor/libreoffice-reference/sc/source/filter/xml/xmlexprt.cxx'),/void ScXMLExport::WriteRowContent/);
console.log('Block71 verified: original default-limit failure;bounded1475262byte export;610Calc and56related tests100;14gates;5000-row real browser storage/reopen.');
