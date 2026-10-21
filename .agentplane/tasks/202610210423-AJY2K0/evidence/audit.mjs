/** @fileoverview Portable immutable acceptance audit for native access interface metadata and wrapped Any exception ownership. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=dirname(fileURLToPath(import.meta.url)),root=resolve(folder,'../../../..');
/** Hashes exact observed bytes. @param bytes - Bytes. @returns SHA256. */
function hash(bytes){return createHash('sha256').update(bytes).digest('hex');}
const proof=JSON.parse(readFileSync(resolve(folder,'acceptance.json'),'utf8'));assert.equal(proof.sharedTests,57);
for(const[path,digest]of Object.entries({...proof.sourceHashes,...proof.nativeHashes}))assert.equal(hash(readFileSync(resolve(root,path))),digest,path);
for(const[path,digest]of Object.entries(proof.nativeHashes))assert.equal(hash(execFileSync('git',['-C','vendor/libreoffice-reference','show',`${proof.nativeBaseline}:${path.replace('vendor/libreoffice-reference/','')}`],{cwd:root,maxBuffer:32*1024*1024})),digest,path);
const archive=readFileSync(resolve(folder,'raw-results.json.gz'));assert.equal(hash(archive),proof.archive.sha256);
const records=JSON.parse(gunzipSync(archive)),contents=new Map();assert.equal(records.length,proof.archive.records);
for(const record of records){const bytes=Buffer.from(record.base64,'base64');assert.equal(bytes.length,record.bytes);assert.equal(hash(bytes),record.sha256);contents.set(record.path,bytes);}
/** Reads one exact archived JSON. @param path - Artifact path. @returns Parsed value. */
function json(path){assert.ok(contents.has(path),path);return JSON.parse(contents.get(path).toString());}
for(const[name,count]of [['calc',584],['shared',57]]){const r=json(`output/playwright/task66-${name}-results.json`);assert.equal(r.success,true,name);assert.equal(r.numPassedTests,count,name);assert.equal(r.numFailedTests,0,name);assert.equal(r.numPendingTests,0,name);}
for(const[name,count]of [['calc',132],['shared',8]]){
 const coverage=json(`output/playwright/task66-${name}-coverage/coverage-final.json`);assert.equal(Object.keys(coverage).length,count,name);
 for(const[path,file]of Object.entries(coverage)){
  for(const[counter,map]of [['s','statementMap'],['f','fnMap'],['b','branchMap']])assert.deepEqual(Object.keys(file[counter]),Object.keys(file[map]));
  for(const value of [...Object.values(file.s),...Object.values(file.f),...Object.values(file.b).flat()])assert.ok(value>0,path);
 }
 const summary=json(`output/playwright/task66-${name}-coverage/coverage-summary.json`).total;for(const metric of ['statements','branches','functions','lines'])assert.equal(summary[metric].pct,100,`${name}:${metric}`);
}
for(const[name,count]of [['gate',10],['extra-gate',4]]){const gates=json(`output/playwright/task66-verified-${name}-exits.json`);assert.equal(gates.length,count);for(const gate of gates){assert.equal(gate.exitCode,0,gate.name);assert.equal(gate.error,null,gate.name);}}
for(const [fixturePath,directory,count]of [
 ['apps/office/src/cppu/inc/com/sun/star/container/native-generated-access-cases.json','cppu-container-interface-native',9],
 ['apps/office/src/cppu/inc/com/sun/star/lang/native-wrapped-target-cases.json','uno-wrapped-target-native',6]
]){
 const fixture=json(fixturePath);assert.equal(fixture.pin,proof.nativeBaseline);assert.equal(Object.keys(fixture.captures).length,count);
 assert.equal(hash(contents.get(`output/playwright/${directory}/driver.cpp`)),fixture.driverHash);
 for(const[path,digest]of Object.entries(fixture.generatedHashes)){assert.ok(contents.has(path),path);assert.equal(hash(contents.get(path)),digest,path);}
 for(const[mode,capture]of Object.entries(fixture.captures)){
  const bytes=gunzipSync(Buffer.from(capture.gzipBase64,'base64'));assert.equal(bytes.length,capture.byteLength);assert.equal(hash(bytes),capture.digest);
  for(const build of ['normal','asan']){const prefix=`output/playwright/${directory}/${build}-caller.${mode}`;assert.ok(bytes.equals(contents.get(prefix)),prefix);assert.equal(contents.get(prefix+'.stderr').length,0,prefix);}
 }
}
assert.match(contents.get('output/playwright/task66-verified-accepted-static.log').toString(),/Static build smoke passed/);
assert.match(contents.get('output/playwright/task66-native-interface-check.log').toString(),/Original generated interface observations verified/);
assert.match(contents.get('output/playwright/task66-wrapped-native-check.log').toString(),/Original WrappedTargetException observations verified/);
console.log(`Task66 acceptance:584Calc tests/132owners100%;${proof.sharedTests}related tests/8changed shared owners100%;15complete native normal-ASan/UBSan streams;${records.length}raw artifacts;${Object.keys(proof.sourceHashes).length}source pins;${Object.keys(proof.nativeHashes).length}native pins;14passing gates. Concrete container/services/runtime access metadata/settings.xml remain unported;checkpoint70 then repairs/coverage/task closure and goal pause.`);
