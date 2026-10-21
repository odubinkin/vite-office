/** @fileoverview Checks raw coverage against canonical production inventory and configured source scopes,accounting explicitly for modules with no executable statements. Never edits coverage. */
import assert from "node:assert/strict";
import { readFileSync,readdirSync,writeFileSync } from "node:fs";
import { resolve,relative,dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import coverage from "istanbul-lib-coverage";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../../.."),scope=process.argv[3]??"all";
assert.ok(["all","calc","shared","writer"].includes(scope));
/** Resolves only repository evidence. @param path - Repository-relative path. @returns Absolute path. */
function local(path){const resolved=resolve(root,path);assert.ok(!relative(root,resolved).startsWith(".."));return resolved;}
/** Hashes exact current source. @param path - Repository path. @returns Digest. */
function digest(path){return createHash("sha256").update(readFileSync(local(path))).digest("hex");}
const configSource=readFileSync(local("apps/office/test-projects.ts"),"utf8"),configJS=ts.transpileModule(configSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const configModule=await import("data:text/javascript;base64,"+Buffer.from(configJS).toString("base64")),config=configModule.createOfficeTestOptions(scope);
assert.deepEqual(config.coverage.thresholds,{branches:100,functions:100,lines:100,statements:100});
assert.deepEqual(config.coverage.include,[scope==="calc"?"src/sc/**/*.{ts,tsx}":scope==="writer"?"src/sw/**/*.{ts,tsx}":"src/**/*.{ts,tsx}"]);
assert.deepEqual(config.coverage.exclude,["src/**/*.test.{ts,tsx}","src/main.tsx","src/sw/source/filter/xml/odt-worker.ts","src/test/**",...(scope==="shared"?["src/sw/**","src/sc/**"]:[])]);
const registry=new Map();
for(const owner of ["calc","shared","writer"]){
 const folder=`docs/program/registry/${owner}/runtime`;
 for(const file of readdirSync(local(folder),{recursive:true}).filter(file=>file.endsWith(".json"))){
  const path=`${folder}/${file}`,record=JSON.parse(readFileSync(local(path),"utf8")).record;
  assert.ok(["calc","writer","shared"].includes(record.suite));assert.ok(!registry.has(record.path));
  const sourceOwner=record.path.startsWith("apps/office/src/sc/")?"calc":record.path.startsWith("apps/office/src/sw/")?"writer":"shared";
  registry.set(record.path,{owner:sourceOwner,declaredSuite:record.suite,registryGroup:owner,registryPath:path});
 }
}
const raw=JSON.parse(readFileSync(local(process.argv[2]),"utf8")),measured=new Map(),maps=new Map(),uncovered=[];
/** Records a zero-valued original counter without replacing its value. @param path - Owner. @param file - Original coverage. @returns Nothing. */
function inspectCounters(path,file){
 for(const [field,map] of [["s","statementMap"],["f","fnMap"],["b","branchMap"]])assert.deepEqual(Object.keys(file[field]).sort(),Object.keys(file[map]).sort(),path);
 for(const field of ["s","f"])for(const [id,value] of Object.entries(file[field]))if(value===0)uncovered.push({path,kind:field,id,location:field==="s"?file.statementMap[id]:file.fnMap[id]});
 for(const [id,values] of Object.entries(file.b))for(let index=0;index<values.length;index++)if(values[index]===0)uncovered.push({path,kind:"b",id,index,location:file.branchMap[id]});
}
for(const [original,file] of Object.entries(raw)){
 const index=original.indexOf("apps/office/src/");assert.ok(index>=0,original);const path=original.slice(index),record=registry.get(path);
 assert.ok(record,`Coverage outside canonical runtime inventory: ${path}`);assert.ok(scope==="all"||record.owner===scope,path);assert.ok(!measured.has(path));
 inspectCounters(path,file);measured.set(path,file);
 if(!maps.has(record.owner))maps.set(record.owner,coverage.createCoverageMap({}));maps.get(record.owner).addFileCoverage(structuredClone(file));
}
const zeroCounterModules=[],excludedModules=[],preexistingSourceIgnores=[],missingExecutable=[];
for(const [path,record] of registry){
 if(scope!=="all"&&record.owner!==scope)continue;
 if(path==="apps/office/src/main.tsx"||path==="apps/office/src/sw/source/filter/xml/odt-worker.ts"||path.startsWith("apps/office/src/test/")){excludedModules.push({path,owner:record.owner});continue;}
 if(measured.has(path))continue;
 const source=readFileSync(local(path),"utf8");
 if(path==="apps/office/src/sw/browser/filter/xml/odt-worker.ts"){
  const annotation="/* istanbul ignore file -- Dedicated Worker bootstrapping is exercised through the runtime boundary. */";
  const original=execFileSync("git",["show",`61228d13b491:${path}`],{cwd:root});
  assert.ok(source.includes(annotation));assert.equal(createHash("sha256").update(original).digest("hex"),digest(path));
  preexistingSourceIgnores.push({path,owner:record.owner,annotation,sourceSHA256:digest(path),baselineCommit:"61228d13b491",note:"Existing source annotation,unchanged by block60;not an added coverage exclusion or a measured Node counter owner."});continue;
 }
 if(path.endsWith(".d.ts")){zeroCounterModules.push({path,owner:record.owner,kind:"declaration-file",sha256:digest(path)});continue;}
 const emitted=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX,removeComments:true}}).outputText;
 const parsed=ts.createSourceFile(path+".js",emitted,ts.ScriptTarget.ES2022,true,ts.ScriptKind.JS);
 if(parsed.statements.every(node=>ts.isImportDeclaration(node)||ts.isExportDeclaration(node)||ts.isEmptyStatement(node)))zeroCounterModules.push({path,owner:record.owner,kind:"module-edges-only",sha256:digest(path),emitted});
 else missingExecutable.push({path,owner:record.owner,emitted});
}
const summaries={};
for(const [owner,map] of maps){const summary=map.getCoverageSummary().toJSON();summaries[owner]={files:map.files().length,statements:summary.statements,branches:summary.branches,functions:summary.functions,lines:summary.lines};}
const metadataScopeDifferences=[...registry].filter(([,record])=>record.owner!==record.declaredSuite).map(([path,record])=>({path,coverageScope:record.owner,declaredSuite:record.declaredSuite,registryGroup:record.registryGroup}));
const report={scope,coveragePath:process.argv[2],coverageSHA256:digest(process.argv[2]),configurationSHA256:digest("apps/office/test-projects.ts"),registeredModules:[...registry.values()].filter(record=>scope==="all"||record.owner===scope).length,measuredModules:measured.size,metadataScopeDifferences,zeroCounterModules,excludedModules,preexistingSourceIgnores,missingExecutable,uncovered,summaries,verified:missingExecutable.length===0&&uncovered.length===0};
if(process.argv[4])writeFileSync(local(process.argv[4]),JSON.stringify(report,null,2)+"\n");
assert.equal(missingExecutable.length,0,JSON.stringify(missingExecutable.map(entry=>entry.path)));
assert.equal(uncovered.length,0,JSON.stringify(uncovered));
assert.equal(report.registeredModules,measured.size+zeroCounterModules.length+excludedModules.length+preexistingSourceIgnores.length);
for(const summary of Object.values(summaries))for(const field of ["statements","branches","functions","lines"]){assert.equal(summary[field].covered,summary[field].total);assert.equal(summary[field].pct,100);}
console.log(JSON.stringify({scope,registered:report.registeredModules,measured:measured.size,zeroCounterModules:zeroCounterModules.length,excluded:excludedModules.length,preexistingSourceIgnores:preexistingSourceIgnores.length,summaries},null,2));
