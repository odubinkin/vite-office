/** @fileoverview Replays the complete block60 raw test,coverage,source and native acceptance. Archived reports are restored byte-for-byte only into an ignored replay directory. */
import assert from "node:assert/strict";
import { readFileSync,writeFileSync,mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { resolve,dirname } from "node:path";
import { fileURLToPath } from "node:url";
import coverage from "istanbul-lib-coverage";
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,"../../../.."),proof=JSON.parse(readFileSync(resolve(folder,"final-checkpoint.json"),"utf8"));
/** Digests exact bytes. @param bytes - Content. @returns Digest. */
function hash(bytes){return createHash("sha256").update(bytes).digest("hex");}
for(const [path,expected] of Object.entries({...proof.sourceHashes,...proof.nativeHashes,...proof.auditHashes}))assert.equal(hash(readFileSync(resolve(root,path))),expected,path);
for(const [path,expected] of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync("git",["-C","vendor/libreoffice-reference","show",`${proof.nativeBaseline}:${path.replace("vendor/libreoffice-reference/","")}`],{cwd:root})),expected,path);
const bytes=readFileSync(resolve(folder,proof.archive.path));assert.equal(hash(bytes),proof.archive.sha256);
const records=JSON.parse(gunzipSync(bytes).toString("utf8")),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const entry of records){const data=Buffer.from(entry.base64,"base64");assert.equal(data.length,entry.bytes);assert.equal(hash(data),entry.sha256);contents.set(entry.path,data);}
/** Reads an original archived report. @param path - Repository path. @returns Original data. */
function json(path){return JSON.parse(contents.get(path).toString("utf8"));}
assert.equal(proof.applicationExitCode,0);
assert.equal(json("output/playwright/task60-full-command-exit.json").exitCode,0);
for(const [name,count] of [["all-app-serial",17463],["tooling-serial",87],["inventory-repaired",123],["cli-owner",12],["calc-failure-focus",7]]){
 const report=json(`output/playwright/task60-${name}-results.json`);assert.equal(report.numPassedTests,count);assert.equal(report.numFailedTests,0);assert.equal(report.success,true);
}
const app=json("output/playwright/task60-all-app-serial-results.json"),discovery=json("output/playwright/task60-discovery-after.json");
assert.equal(app.numTotalTests,17463);assert.equal(app.numPendingTests,0);assert.equal(app.testResults.length,1101);assert.equal(discovery.length,1101);
assert.deepEqual(app.testResults.map(entry=>entry.name).sort(),discovery.map(entry=>entry.file).sort());
assert.equal(app.testResults.reduce((sum,entry)=>sum+entry.assertionResults.length,0),17463);
for(const entry of app.testResults){assert.equal(entry.status,"passed");for(const test of entry.assertionResults)assert.equal(test.status,"passed");}
const before=json("output/playwright/task60-before-source-hashes.json");let untouched=0;
for(const [path,expected] of Object.entries(before))if(path.startsWith("apps/office/src/")){assert.equal(hash(readFileSync(resolve(root,path))),expected,path);untouched++;}
assert.equal(untouched,2269);
assert.equal(json("output/playwright/task60-tooling-results.json").numFailedTests,2);
assert.equal(json("output/playwright/task60-inventory-results.json").numFailedTests,12);
const oldDiscovery=json("output/playwright/task60-discovery-before.json");assert.deepEqual(oldDiscovery.map(entry=>entry.file).sort(),discovery.map(entry=>entry.file).sort());
const changed=json("output/playwright/task60-discovery-proof-final.json").changedProjectOnly;assert.equal(changed.length,2);assert.deepEqual(changed.map(entry=>entry[2]).sort(),["calc","writer"]);
const rawPath="output/playwright/task60-all-app-coverage/coverage-final.json",raw=json(rawPath);
assert.equal(Object.keys(raw).length,839);
for(const file of Object.values(raw))for(const counter of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(Number.isSafeInteger(counter)&&counter>0);
const total=coverage.createCoverageMap(raw).getCoverageSummary().toJSON(),printed=json("output/playwright/task60-all-app-coverage/coverage-summary.json").total;
for(const [field,count] of Object.entries({statements:54390,branches:34361,functions:10459,lines:49438})){assert.equal(total[field].total,count);assert.equal(total[field].covered,count);assert.equal(total[field].pct,100);assert.deepEqual(printed[field],total[field]);}
for(const path of ["output/playwright/task60-inventory-repaired-coverage/coverage-final.json","output/playwright/task60-cli-owner-coverage/coverage-final.json"]){
 for(const file of Object.values(json(path)))for(const counter of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(Number.isSafeInteger(counter)&&counter>0);
}
const replay="output/playwright/task60-audit-replay";mkdirSync(resolve(root,replay),{recursive:true});
writeFileSync(resolve(root,replay,"coverage-final.json"),contents.get(rawPath));
assert.equal(hash(readFileSync(resolve(root,replay,"coverage-final.json"))),hash(contents.get(rawPath)));
execFileSync(process.execPath,[resolve(folder,"audit-coverage-scope.mjs"),`${replay}/coverage-final.json`,"all",`${replay}/scope.json`],{cwd:root,stdio:"pipe"});
const observed=JSON.parse(readFileSync(resolve(root,replay,"scope.json"),"utf8")),accepted=json("output/playwright/task60-all-scope-audit.json");
for(const result of [observed,accepted]){
 assert.equal(result.verified,true);assert.equal(result.registeredModules,997);assert.equal(result.measuredModules,839);assert.equal(result.zeroCounterModules.length,155);assert.equal(result.excludedModules.length,2);assert.equal(result.preexistingSourceIgnores.length,1);assert.equal(result.missingExecutable.length,0);assert.equal(result.uncovered.length,0);
 for(const field of ["zeroCounterModules","excludedModules","preexistingSourceIgnores","metadataScopeDifferences"])result[field].sort((a,b)=>a.path.localeCompare(b.path));
}
delete observed.coveragePath;delete accepted.coveragePath;assert.deepEqual(observed,accepted);
for(const [owner,count] of [["calc",130],["shared",498],["writer",211]])assert.equal(observed.summaries[owner].files,count);
assert.match(contents.get("output/playwright/task60-browser.log").toString(),/16 passed/);
const fixtures=json("output/playwright/task60-fixture-token-proof.json");assert.equal(fixtures.fixtures.length,2);
for(const fixture of fixtures.fixtures){assert.equal(hash(readFileSync(resolve(root,fixture.localPath))),fixture.sha256);assert.equal(fixture.wrapOption.length,1);assert.equal(fixture.wrapOption[0].value,"no-wrap");}
console.log("Block60 acceptance:17463tests/1101files;all839measured owners100%;Calc130/shared498/Writer211;997registered modules accounted for;87tooling+123inventory+16browser cases;raw archive,unchanged application sources and native fixtures verified.");
