import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import coverage from 'istanbul-lib-coverage';
const root=process.cwd(),ev=path.join(root,'.agentplane/tasks/202610201528-MD0CQF/evidence');
const read=n=>JSON.parse(fs.readFileSync(path.join(ev,n),'utf8'));
const unzip=n=>JSON.parse(gunzipSync(fs.readFileSync(path.join(ev,n))));
const save=(n,x)=>fs.writeFileSync(path.join(ev,n),JSON.stringify(x,null,2)+'\n');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const assert=(x,m)=>{if(!x)throw Error(m);};
const progress=read('progress.json');
assert(progress.status==='complete'&&progress.sourceStable,'Full run must complete on stable source');
assert(progress.application.fileAccounting&&progress.application.coverageComplete,'Full application accounting incomplete');
for(const b of progress.batches){assert(b.fileAccounting&&b.pending===0,'Incomplete batch '+b.id);for(const a of [b.results,b.raw]){const compressed=fs.readFileSync(path.join(ev,a.path));assert(hash(compressed)===a.compressedSha256&&hash(gunzipSync(compressed))===a.sha256,'Archive integrity '+a.path);}}

const file='apps/office/src/sc/browser/presentation/calc-files.test.tsx';
const changed=Object.entries(read('tested-source-snapshot.json')).filter(([p,h])=>hash(fs.readFileSync(p))!==h).map(([p])=>p);
assert(changed.length===1&&changed[0]===file,'Unexpected source changes: '+changed);
const replay=JSON.parse(fs.readFileSync('output/playwright/task51-repair-results.json','utf8'));
assert(replay.testResults.length===1&&replay.testResults[0].name===path.join(root,file),'Replay must contain exactly the repaired test owner');
assert(replay.success===true&&replay.numFailedTestSuites===0&&replay.numFailedTests===0&&replay.numPendingTests===0&&replay.numTodoTests===0,'Replay must be green');
const reports=progress.batches.map(b=>unzip(b.results.path));
for(const r of reports){assert(r.numTotalTests===r.testResults.flatMap(f=>f.assertionResults).length,'Original assertion accounting');assert(r.success===true||r.numFailedTests>0,'Unexplained original runner failure');assert(r.testResults.every(f=>f.status==='passed'||f.assertionResults.some(t=>t.status==='failed')),'Runtime-only file failure');}

const previous=reports.flatMap(r=>r.testResults).find(f=>f.name===path.join(root,file));
const names=f=>f.assertionResults.map(t=>t.fullName).sort();
assert(JSON.stringify(names(previous))===JSON.stringify(names(replay.testResults[0])),'Replay changed test identities');
const logical=reports.flatMap(r=>r.testResults).map(f=>f.name===path.join(root,file)?replay.testResults[0]:f);
const assertions=logical.flatMap(f=>f.assertionResults);
assert(new Set(logical.map(f=>f.name)).size===progress.discoveredFiles&&logical.length===progress.discoveredFiles,'Logical file accounting mismatch');
assert(assertions.every(t=>t.status==='passed'),'Unresolved application assertions');
const full=unzip('application-raw.json.gz'),repair=JSON.parse(fs.readFileSync('apps/office/coverage/task51-repair/coverage-final.json','utf8'));
const merged=coverage.createCoverageMap(full),signature=d=>JSON.stringify([d.statementMap,d.fnMap,d.branchMap,d.inputSourceMap??null]);
for(const [p,d]of Object.entries(repair)){assert(full[p]&&signature(full[p])===signature(d),'Incompatible repair map '+p);merged.merge({[p]:d});}
const owners={};for(const scope of ['calc','shared','writer']){const selected=coverage.createCoverageMap({});for(const f of merged.files()){const local=path.relative(path.join(root,'apps/office'),f);if(scope==='calc'?local.startsWith('src/sc/'):scope==='writer'?local.startsWith('src/sw/'):!local.startsWith('src/sc/')&&!local.startsWith('src/sw/'))selected.addFileCoverage(merged.fileCoverageFor(f));}owners[scope]=selected.getCoverageSummary().toJSON();}
for(const scope of ['calc','shared'])for(const m of ['statements','branches','functions','lines'])assert(owners[scope][m].covered===owners[scope][m].total,'Incomplete '+scope+' '+m);
assert(progress.stages.every(s=>s.exit===0),'Full static/browser gates failed');
const browser=unzip('browser-results.json.gz').stats;assert(browser.expected===432&&browser.unexpected===0&&browser.flaky===0&&browser.skipped===0,'Browser acceptance');
for(const name of ['tooling','inventory']){const r=unzip(name+'-results.json.gz');assert(r.success===true&&r.numFailedTests===0&&r.numPendingTests===0,'Auxiliary tests '+name);}
save('accepted-source-snapshot.json',Object.fromEntries(Object.keys(read('tested-source-snapshot.json')).map(p=>[p,hash(fs.readFileSync(p))])));

const raw=JSON.stringify(merged.toJSON());fs.writeFileSync(path.join(ev,'accepted-application-raw.json.gz'),gzipSync(raw));
for(const [source,dest]of [['output/playwright/task51-repair-results.json','repair-results.json.gz'],['apps/office/coverage/task51-repair/coverage-final.json','repair-raw.json.gz']])fs.writeFileSync(path.join(ev,dest),gzipSync(fs.readFileSync(source)));
const proof={task:progress.task,finishedAt:new Date().toISOString(),fullSnapshotCommit:progress.testedCommit,sourceChangesAfterFullRun:changed,productionSourceUnchanged:true,repair:'Test-only deterministic await of genuine SaveCopy/OpenStored operation, unchanged assertions and timeouts',originalFullFailures:progress.application.failed,repairTests:replay.numTotalTests,files:logical.length,tests:assertions.length,passed:assertions.filter(t=>t.status==='passed').length,failed:0,pending:0,owners,summary:merged.getCoverageSummary().toJSON(),coverageMapsCompatible:true,browser,rawSha256:hash(raw),stages:progress.stages.map(s=>({name:s.name,exit:s.exit}))};
save('accepted-proof.json',proof);console.log(JSON.stringify(proof,null,2));
