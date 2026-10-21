/** @fileoverview Audits the final complete checkpoint from original reports, raw coverage and exact source pins. */
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir='.agentplane/tasks/202610210633-YZ2Z34/evidence';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const acceptance=JSON.parse(fs.readFileSync(`${dir}/acceptance.json`,'utf8'));
const packed=fs.readFileSync(`${dir}/raw-results.json.gz`);
assert.equal(sha(packed),acceptance.archiveSha256);
const raw=JSON.parse(zlib.gunzipSync(packed).toString());
const read=p=>Buffer.from(raw[p],'base64').toString();
const json=p=>JSON.parse(read(p));
for(const p of acceptance.rawPaths)assert.ok(Object.hasOwn(raw,p),p);
for(const s of acceptance.sources)assert.equal(sha(fs.readFileSync(s.path)),s.sha256,s.path);
assert.ok(acceptance.sources.length>=2804);
for(const[profile,minimum]of[['all-app',17463],['inventory-recheck',123],['tooling',88]]){
 const r=json(`output/playwright/task70-${profile}-results.json`);
 assert.equal(r.success,true,profile);
 assert.equal(r.numFailedTests,0,profile);
 assert.equal(r.numPendingTests,0,profile);
 assert.equal(r.numPassedTests,r.numTotalTests,profile);
 assert.ok(r.numPassedTests>=minimum,profile);
}
for(const profile of ['all-app','inventory-recheck']){
 const coverage=json(`output/playwright/task70-${profile}-coverage/coverage-final.json`);
 if(profile==='all-app')assert.ok(Object.keys(coverage).length>=839);
 for(const[p,c]of Object.entries(coverage))for(const k of ['s','f','b'])for(const n of Object.values(c[k]).flat())assert.ok(n>0,`${p}:${k}`);
 const total=json(`output/playwright/task70-${profile}-coverage/coverage-summary.json`).total;
 for(const k of ['statements','branches','functions','lines'])assert.equal(total[k].pct,100,`${profile}:${k}`);
}
const initial=json('output/playwright/task70-inventory-results.json');
assert.equal(initial.numFailedTests,3);
assert.equal(initial.numPassedTests,120);
assert.match(read('output/playwright/task70-inventory.log'),/Test timed out in 60000ms/);
const gates=json('output/playwright/task70-gate-exits.json');
assert.equal(gates.length,14);
for(const g of gates)assert.equal(g.exitCode,0,g.name);
const browser=json('output/playwright/task70-e2e-results.json');
const repaired=json('output/playwright/task70-e2e-recheck-results.json');
assert.equal(browser.stats.expected+browser.stats.unexpected,443);
assert.equal(browser.stats.unexpected,1);
for(const report of [browser,repaired]){
 for(const k of ['skipped','flaky'])assert.equal(report.stats[k],0,k);
 assert.equal(report.errors.length,0);
}
assert.equal(repaired.stats.expected,1);
assert.equal(repaired.stats.unexpected,0);
assert.deepEqual(browser.config.projects.map(p=>p.name).sort(),['calc','shared','writer']);
/** Reads exact scenario identities from the original reporter tree. @param suites - Reporter suites. @returns Scenarios. */
function cases(suites){return suites.flatMap(suite=>[
 ...(suite.specs??[]).flatMap(spec=>spec.tests.map(test=>({key:JSON.stringify([spec.file,spec.line,spec.title,test.projectName]),status:test.status}))),
 ...cases(suite.suites??[]),
]);}
const originalCases=cases(browser.suites),repairedCases=cases(repaired.suites);
assert.equal(originalCases.length,443);
const failures=originalCases.filter(c=>c.status!=='expected');
assert.equal(failures.length,1);
assert.equal(repairedCases.length,1);
assert.equal(failures[0].key,repairedCases[0].key);
assert.equal(repairedCases[0].status,'expected');
const changes=json('output/playwright/task70-browser-source-changes.json');
assert.equal(changes.length,1);
for(const change of changes){
 assert.equal(change.path,'apps/office/e2e/writer-cell-paragraph-format.spec.ts');
 assert.equal(sha(Buffer.from(raw[change.originalSourceRawPath],'base64')),change.before);
 assert.equal(sha(fs.readFileSync(change.path)),change.after);
}
console.log('Final complete checkpoint accepted: all application/tooling/inventory/browser scenarios pass; raw application and inventory coverage100;14gates pass;source pins match.');
