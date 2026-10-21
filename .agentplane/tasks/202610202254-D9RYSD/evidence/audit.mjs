/** @fileoverview Replays task58 source/native pins and preserved raw coverage acceptance. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const folder = dirname(fileURLToPath(import.meta.url)), root = resolve(folder, "../../../..");
/** Digests exact bytes. @param bytes - Bytes. @returns Digest. */
function hash(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
const proof = JSON.parse(readFileSync(resolve(folder, "acceptance.json"), "utf8"));
for (const [path, expected] of Object.entries({...proof.sourceHashes, ...proof.nativeHashes}))
  assert.equal(hash(readFileSync(resolve(root,path))),expected,path);
for (const [path, expected] of Object.entries(proof.nativeHashes))
  assert.equal(hash(execFileSync("git", ["-C", "vendor/libreoffice-reference", "show", `${proof.nativeBaseline}:${path.replace("vendor/libreoffice-reference/", "")}`], {cwd:root})),expected,path);
const bytes = readFileSync(resolve(folder,proof.archive.path));
assert.equal(hash(bytes),proof.archive.sha256);
const records = JSON.parse(gunzipSync(bytes).toString("utf8")), contents = new Map();
assert.equal(records.length,proof.archive.records);
for (const record of records) {
  const data = Buffer.from(record.base64,"base64");
  assert.equal(data.length,record.bytes); assert.equal(hash(data),record.sha256);
  contents.set(record.path,data);
}
/** Reads an immutable original report. @param path - Archived path. @returns Report. */
function json(path) { return JSON.parse(contents.get(path).toString("utf8")); }
for (const [name,count] of [["calc",528],["owner",58],["pool-repaired",53]]) {
  const result=json(`output/playwright/task58-${name}-results.json`);
  assert.equal(result.success,true); assert.equal(result.numPassedTests,count); assert.equal(result.numFailedTests,0);
}
assert.equal(json("output/playwright/task58-pool-first-results.json").numFailedTests,3);
for (const [path,count] of [["apps/office/coverage/calc/coverage-final.json",130],["output/playwright/task58-owner-coverage/coverage-final.json",4]]) {
  const files=json(path); assert.equal(Object.keys(files).length,count);
  for (const [source,file] of Object.entries(files)) {
    assert.equal(Object.keys(file.s).length,Object.keys(file.statementMap).length);
    assert.equal(Object.keys(file.f).length,Object.keys(file.fnMap).length);
    assert.equal(Object.keys(file.b).length,Object.keys(file.branchMap).length);
    for (const counter of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()]) assert.ok(counter>0,source);
  }
}
for (const [name,count] of [["calc",7],["writer",6]]) assert.match(contents.get(`output/playwright/task58-${name}-browser.log`).toString(),new RegExp(`${count} passed`));
const path="apps/office/src/editeng/inc/editobj.ts", before=execFileSync("git",["show",`a25904fdcf81:${path}`],{cwd:root}).toString(), after=readFileSync(resolve(root,path),"utf8");
/** Emits the actual erased type boundary. @param source - TypeScript source. @returns JavaScript. */
function emit(source) { return ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,removeComments:true}}).outputText; }
assert.equal(emit(before),emit(after));
console.log(`Task58 acceptance: ${proof.archive.records} raw artifacts;152 source pins;8 native blobs;528 Calc and58 related tests;130+4 owners100%;7+6 browsers;identical shared JS.`);
