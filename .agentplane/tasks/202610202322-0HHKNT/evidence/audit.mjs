/** @fileoverview Rechecks task59 source/native pins,source-derived numeric fixture and archived raw acceptance. This is not execution of a native LibreOffice library. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const folder=dirname(fileURLToPath(import.meta.url)), root=resolve(folder,"../../../..");
/** Hashes immutable bytes. @param bytes - Content. @returns Digest. */
function hash(bytes) {return createHash("sha256").update(bytes).digest("hex");}
const proof=JSON.parse(readFileSync(resolve(folder,"acceptance.json"),"utf8"));
for(const [path,expected] of Object.entries({...proof.sourceHashes,...proof.nativeHashes})) assert.equal(hash(readFileSync(resolve(root,path))),expected,path);
for(const [path,expected] of Object.entries(proof.nativeHashes)) assert.equal(hash(execFileSync("git",["-C","vendor/libreoffice-reference","show",`${proof.nativeBaseline}:${path.replace("vendor/libreoffice-reference/","")}`],{cwd:root})),expected,path);
const bytes=readFileSync(resolve(folder,proof.archive.path));assert.equal(hash(bytes),proof.archive.sha256);
const records=JSON.parse(gunzipSync(bytes).toString("utf8")),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const data=Buffer.from(record.base64,"base64");assert.equal(data.length,record.bytes);assert.equal(hash(data),record.sha256);contents.set(record.path,data);}
/** Reads original archived JSON. @param path - Repository path. @returns Report. */
function json(path){return JSON.parse(contents.get(path).toString("utf8"));}
for(const [name,count] of [["calc",528],["accepted-owner",33],["writer-xml",19],["boundary",91]]){const result=json(`output/playwright/task59-${name}-results.json`);assert.equal(result.numPassedTests,count);assert.equal(result.numFailedTests,0);assert.equal(result.success,true);}
for(const [path,count] of [["apps/office/coverage/calc/coverage-final.json",130],["output/playwright/task59-accepted-owner-coverage/coverage-final.json",4]]){
 const files=json(path);assert.equal(Object.keys(files).length,count);
 for(const [source,file] of Object.entries(files)){
  for(const [counter,map] of [["s","statementMap"],["f","fnMap"],["b","branchMap"]])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
  for(const value of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,source);
 }
}
assert.match(contents.get("output/playwright/task59-final-browser.log").toString(),/3 passed/);
assert.match(contents.get("output/playwright/task59-browser.log").toString(),/2 failed/);
const fixture=JSON.parse(readFileSync(resolve(root,"apps/office/src/i18nutil/source/utility/native-paper-cases.json"),"utf8")),native=readFileSync(resolve(root,"vendor/libreoffice-reference/i18nutil/source/utility/paper.cxx"),"utf8");
const rows=[...native.matchAll(/\{\s*((?:MM|IN|PT)2MM100\([^)]*\)|0)\s*,\s*((?:MM|IN|PT)2MM100\([^)]*\)|0)\s*,\s*("[^"]*"|nullptr)\s*,\s*("[^"]*"|nullptr)\s*\}/g)];
assert.equal(rows.length,86);assert.equal(fixture.length,86);
/** Evaluates original positive constexpr literal conversion independently of the runtime table. @param source - Native expression. @returns Integer mm100. */
function dimension(source){if(source==="0")return 0;const match=source.match(/(MM|IN|PT)2MM100\(\s*([\d.]+)\s*\)/);return Math.trunc(Number(match[2])*({MM:100,IN:2540,PT:2540/72}[match[1]])+0.5);}
for(let i=0;i<rows.length;i++){const row=rows[i];assert.equal(fixture[i].id,i);assert.equal(fixture[i].width,dimension(row[1]));assert.equal(fixture[i].height,dimension(row[2]));assert.equal(fixture[i].ps,row[3]==="nullptr"?null:JSON.parse(row[3]));assert.equal(fixture[i].alias,row[4]==="nullptr"?null:JSON.parse(row[4]));}
const header=readFileSync(resolve(root,"vendor/libreoffice-reference/include/i18nutil/paper.hxx"),"utf8").split("enum Paper : unsigned")[1].split("};")[0], names=[...header.matchAll(/^\s*(PAPER_\w+)/gm)].map((entry)=>entry[1]);
assert.deepEqual(fixture.map((row)=>row.name),names);
console.log(`Task59 acceptance:86 source-derived paper records;528 Calc+33 owner+19 XML tests;48 current guard tests plus43 historical artifact tests;130+4 owners100%;3 Chromium/Worker/dialog cases;${records.length} archived artifacts.`);
