/** @fileoverview Rechecks task63 immutable raw acceptance,source/native pins,positive Istanbul counters and actual browser ownership observations. */
import assert from "node:assert/strict";
import{readFileSync}from"node:fs";
import{createHash}from"node:crypto";
import{gunzipSync}from"node:zlib";
import{execFileSync}from"node:child_process";
import{dirname,resolve}from"node:path";
import{fileURLToPath}from"node:url";
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,"../../../..");
/** Hashes bytes. @param value - Bytes. @returns SHA256. */
function hash(value){return createHash("sha256").update(value).digest("hex");}
const proof=JSON.parse(readFileSync(resolve(folder,"acceptance.json"),"utf8"));
for(const[path,digest]of Object.entries({...proof.sourceHashes,...proof.nativeHashes}))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
for(const[path,digest]of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync("git",["-C","vendor/libreoffice-reference","show",`${proof.nativeBaseline}:${path.replace("vendor/libreoffice-reference/","")}`],{cwd:root})),digest,path);
const archive=readFileSync(resolve(folder,"raw-results.json.gz"));assert.equal(hash(archive),proof.archive.sha256);
const records=JSON.parse(gunzipSync(archive).toString("utf8")),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const data=Buffer.from(record.base64,"base64");assert.equal(data.length,record.bytes);assert.equal(hash(data),record.sha256);contents.set(record.path,data);}
/** Reads an archived JSON report. @param path - Exact artifact. @returns Report. */
function json(path){return JSON.parse(contents.get(path).toString("utf8"));}
/** Reads a structured result from actual CLI output. @param name - Exact artifact suffix. @returns Observed browser state. */
function browser(name){return JSON.parse(contents.get(`output/playwright/task63-browser-${name}.log`).toString().split("### Result\n")[1].split("\n### Ran Playwright code")[0]);}
for(const[name,count]of[["final-calc",570],["related",43],["tooling",17],["binding-accepted",16],["modal",15]]){const result=json(`output/playwright/task63-${name}-results.json`);assert.equal(result.success,true);assert.equal(result.numPassedTests,count);assert.equal(result.numFailedTests,0);assert.equal(result.numPendingTests,0);}
const coverage=json("output/playwright/task63-final-calc-coverage/coverage-final.json");assert.equal(Object.keys(coverage).length,130);
for(const[path,file]of Object.entries(coverage)){
 for(const[counter,map]of[["s","statementMap"],["f","fnMap"],["b","branchMap"]])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
 for(const value of[...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,path);
}
const total=json("output/playwright/task63-final-calc-coverage/coverage-summary.json").total;
for(const key of["statements","branches","functions","lines"])assert.equal(total[key].pct,100);
for(const[name,count]of[["gate",10],["extra-gate",4]]){const gates=json(`output/playwright/task63-final-${name}-exits.json`);assert.equal(gates.length,count);for(const gate of gates){assert.equal(gate.exitCode,0,gate.name);assert.equal(gate.error,null,gate.name);}}
assert.match(contents.get("output/playwright/task63-final-accepted-static.log").toString(),/Static build smoke passed/);
assert.match(contents.get("output/playwright/task63-final-accepted-jsdoc.log").toString(),/JSDoc validation passed/);
assert.match(contents.get("output/playwright/task63-resource-surface-proof.log").toString(),/sole metadata addition/);
assert.equal(browser("before-selection.json").text,"\n3\n");
assert.equal(browser("final-selection").text,"");assert.equal(browser("mobile-selection").text,"");
assert.equal(browser("word-selection").selected,"beta");assert.equal(browser("input-backspace").value,"alpha");
assert.match(contents.get("output/playwright/task63-browser-final-escape.log").toString(),/gridcell "A2" \[selected\]/);
assert.doesNotMatch(contents.get("output/playwright/task63-browser-final-deselect.log").toString(),/gridcell "A2" \[selected\]/);
assert.match(contents.get("output/playwright/task63-browser-input-escape.log").toString(),/alpha beta/);
assert.match(contents.get("output/playwright/task63-browser-modal-closed.log").toString(),/gridcell "A2" \[selected\]/);
assert.equal(browser("closure-focus").role,"grid");assert.equal(browser("closure-focus").inert,false);
console.log(`Task63 acceptance:570Calc+43shared/Writer+17tooling tests;130owners100%;${records.length}raw artifacts;${Object.keys(proof.sourceHashes).length}source pins;${Object.keys(proof.nativeHashes).length}native pins;14individual gates;actual DOM/editor/modal ownership.`);
