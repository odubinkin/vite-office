/** @fileoverview Audits only the bounded block60 repair checkpoint;full application acceptance remains pending. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { resolve,dirname } from "node:path";
import { fileURLToPath } from "node:url";
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,"../../../..");
/** Digests exact bytes. @param bytes - Content. @returns Digest. */
function hash(bytes){return createHash("sha256").update(bytes).digest("hex");}
const proof=JSON.parse(readFileSync(resolve(folder,"partial-checkpoint.json"),"utf8"));
assert.equal(proof.state,"partial-full-application-checkpoint-pending");
for(const [path,expected] of Object.entries(proof.sourceHashes))assert.equal(hash(readFileSync(resolve(root,path))),expected,path);
const bytes=readFileSync(resolve(folder,proof.archive.path));assert.equal(hash(bytes),proof.archive.sha256);
const records=JSON.parse(gunzipSync(bytes).toString("utf8")),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const entry of records){const data=Buffer.from(entry.base64,"base64");assert.equal(data.length,entry.bytes);assert.equal(hash(data),entry.sha256);contents.set(entry.path,data);}
/** Reads an original archived result. @param path - Repository path. @returns Parsed report. */
function json(path){return JSON.parse(contents.get(path).toString("utf8"));}
for(const [name,count] of [["tooling-serial",87],["inventory-repaired",123],["cli-owner",12],["calc-failure-focus",7]]){const result=json(`output/playwright/task60-${name}-results.json`);assert.equal(result.numPassedTests,count);assert.equal(result.numFailedTests,0);assert.equal(result.success,true);}
assert.equal(json("output/playwright/task60-tooling-results.json").numFailedTests,2);
assert.equal(json("output/playwright/task60-inventory-results.json").numFailedTests,12);
for(const path of ["output/playwright/task60-inventory-repaired-coverage/coverage-final.json","output/playwright/task60-cli-owner-coverage/coverage-final.json"]){
 const files=json(path);assert.ok(Object.keys(files).length>0);
 for(const file of Object.values(files))for(const count of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(count>0);
}
const before=json("output/playwright/task60-before-source-hashes.json");let unchanged=0;
for(const [path,expected] of Object.entries(before))if(path.startsWith("apps/office/src/")){assert.equal(hash(readFileSync(resolve(root,path))),expected,path);unchanged++;}
assert.equal(unchanged,2269);
const old=json("output/playwright/task60-discovery-before.json"),after=json("output/playwright/task60-discovery-after.json");
assert.equal(old.length,1101);assert.equal(after.length,1101);assert.deepEqual(old.map(x=>x.file).sort(),after.map(x=>x.file).sort());
const changes=json("output/playwright/task60-discovery-proof-final.json").changedProjectOnly;assert.equal(changes.length,2);assert.deepEqual(changes.map(x=>x[2]).sort(),["calc","writer"]);
assert.match(contents.get("output/playwright/task60-browser.log").toString(),/16 passed/);
assert.equal(proof.interruptedInitialRun.completedFullSuite,false);
console.log(`Partial block60 checkpoint:87tooling,123inventory,12CLI,7Calc and16browser cases;inventory/CLI counters100%;2269application sources unchanged;1101test files retained. Full application run remains pending.`);
