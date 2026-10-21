/** @fileoverview Rechecks task62 native/source hashes and immutable raw tests/coverage/browser evidence without modifying counters. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { dirname,resolve } from "node:path";
import { fileURLToPath } from "node:url";
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,"../../../..");
/** Hashes immutable bytes. @param data - Bytes. @returns SHA256. */
function hash(data){return createHash("sha256").update(data).digest("hex");}
const proof=JSON.parse(readFileSync(resolve(folder,"acceptance.json"),"utf8"));
for(const [path,digest] of Object.entries({...proof.sourceHashes,...proof.nativeHashes}))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
for(const [path,digest] of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync("git",["-C","vendor/libreoffice-reference","show",`${proof.nativeBaseline}:${path.replace("vendor/libreoffice-reference/","")}`],{cwd:root})),digest,path);
const archive=readFileSync(resolve(folder,"raw-results.json.gz"));assert.equal(hash(archive),proof.archive.sha256);
const records=JSON.parse(gunzipSync(archive).toString("utf8")),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const data=Buffer.from(record.base64,"base64");assert.equal(data.length,record.bytes);assert.equal(hash(data),record.sha256);contents.set(record.path,data);}
/** Reads a retained report. @param path - Exact path. @returns Raw JSON. */
function json(path){return JSON.parse(contents.get(path).toString("utf8"));}
for(const [name,count] of [["calc",551],["related",34]]){const result=json(`output/playwright/task62-${name}-results.json`);assert.equal(result.success,true);assert.equal(result.numPassedTests,count);assert.equal(result.numFailedTests,0);assert.equal(result.numPendingTests,0);}
const coverage=json("output/playwright/task62-calc-coverage/coverage-final.json");assert.equal(Object.keys(coverage).length,130);
for(const [path,file] of Object.entries(coverage)){
 for(const [counter,map] of [["s","statementMap"],["f","fnMap"],["b","branchMap"]])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
 for(const value of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,path);
}
const total=json("output/playwright/task62-calc-coverage/coverage-summary.json").total;
for(const key of ["statements","branches","functions","lines"])assert.equal(total[key].pct,100);
assert.match(contents.get("output/playwright/task62-static.log").toString(),/Static build smoke passed/);
assert.match(contents.get("output/playwright/task62-browser-visible-rows.log").toString(),/gridcell "F6" \[selected\]/);
assert.match(contents.get("output/playwright/task62-browser-visible-columns.log").toString(),/gridcell "F6" \[selected\]/);
console.log(`Task62 acceptance:551 Calc+34 common/Writer tests;130 owners100%;${records.length} raw artifacts;${Object.keys(proof.sourceHashes).length} source pins;${Object.keys(proof.nativeHashes).length} pinned native inputs.`);
