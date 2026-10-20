import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { spawnSync, spawn } from 'node:child_process';
import coverage from 'istanbul-lib-coverage';
const root=process.cwd(), app=path.join(root,'apps/office'), out=path.join(root,'output/playwright');
const evidence=path.join(root,'.agentplane/tasks/202610192137-N3DVTJ/evidence');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const tracked=spawnSync('git',['ls-files','-z','apps/office/src','apps/office/test-projects.ts','apps/office/vite.config.ts','package-lock.json'],{encoding:'utf8'}).stdout.split('\0').filter(Boolean);
const snapshot=Object.fromEntries(tracked.map(f=>[f,sha(fs.readFileSync(f))]));
function stable(){for(const [f,h] of Object.entries(snapshot))if(sha(fs.readFileSync(f))!==h)throw Error('Source changed: '+f);}
function save(name,value){fs.writeFileSync(path.join(evidence,name),JSON.stringify(value,null,2)+'\n');}
function archive(file,name){const b=fs.readFileSync(file),z=gzipSync(b);if(sha(gunzipSync(z))!==sha(b))throw Error('Archive mismatch');fs.writeFileSync(path.join(evidence,name),z);return {sha256:sha(b),compressedSha256:sha(z)};}
const listed=JSON.parse(fs.readFileSync(path.join(out,'task40-discovery.json'),'utf8')).sort((a,b)=>a.file.localeCompare(b.file));
if(listed.length!==1040||new Set(listed.map(x=>x.file)).size!==1040)throw Error('Incomplete discovery');
const batches=[];for(let i=0;i<listed.length;i+=100)batches.push(listed.slice(i,i+100));
save('batch-epoch.json',{snapshot,listed,batches:batches.map(b=>b.map(x=>x.file)),thresholds:{statements:100,branches:100,functions:100,lines:100}});
const merged=coverage.createCoverageMap({}), maps=new Map(), reports=[];
for(let i=0;i<batches.length;i++){
 stable();const id=String(i).padStart(2,'0'), report=path.join(out,`task40-batch-${id}-results.json`), dir=path.join(app,`coverage/task40-batch-${id}`), logfile=path.join(out,`task40-batch-${id}.log`);
 const args=['run','--config','vite.config.ts',...batches[i].map(x=>path.relative(app,x.file)),'--coverage',`--coverage.reportsDirectory=${dir}`,'--coverage.reporter=json','--coverage.reporter=text','--coverage.reportOnFailure=true','--reporter=json',`--outputFile=${report}`];
 console.log('START batch '+id+' files='+batches[i].length);
 const fd=fs.openSync(logfile,'w');
 const child=spawn(process.execPath,[path.join(root,'node_modules/vitest/vitest.mjs'),...args],{cwd:app,stdio:['ignore',fd,fd]});
 const exit=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve)});fs.closeSync(fd);stable();
 if(!fs.existsSync(report))throw Error('Missing test report batch '+id+' exit='+exit);
 const result=JSON.parse(fs.readFileSync(report,'utf8'));const actual=result.testResults.map(x=>x.name).sort();const expected=batches[i].map(x=>x.file).sort();
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Test discovery mismatch '+id);
 if(result.numFailedTests||result.testResults.some(x=>x.status==='failed')||result.numRuntimeErrorTestSuites)throw Error('Test failures in '+id);
 const rawFile=path.join(dir,'coverage-final.json');const raw=JSON.parse(fs.readFileSync(rawFile,'utf8'));
 if(!Object.keys(raw).length)throw Error('Empty coverage '+id);
 for(const [file,data] of Object.entries(raw)){
  const signature=JSON.stringify([data.statementMap,data.fnMap,data.branchMap]);
  if(maps.has(file)&&maps.get(file)!==signature)throw Error('Incompatible coverage map '+file);
  maps.set(file,signature);
 }
 merged.merge(raw);
 const entry={id,exit,args,files:actual.length,tests:result.numTotalTests,passed:result.numPassedTests,pending:result.numPendingTests,raw:archive(rawFile,`batch-${id}-raw.json.gz`),results:archive(report,`batch-${id}-results.json.gz`)};
 fs.copyFileSync(logfile,path.join(evidence,`batch-${id}.log`));reports.push(entry);save('batch-progress.json',reports);
 fs.rmSync(dir,{recursive:true}); console.log('DONE batch '+id+' tests='+entry.tests+' partialExit='+exit+' raw preserved');
}
stable();const summary=merged.getCoverageSummary().toJSON();const raw=JSON.stringify(merged.toJSON());const z=gzipSync(raw);if(gunzipSync(z).toString()!==raw)throw Error('Aggregate archive mismatch');fs.writeFileSync(path.join(evidence,'application-complete-raw.json.gz'),z);
save('application-complete-proof.json',{snapshotSha256:sha(JSON.stringify(snapshot)),sourceFiles:tracked.length,files:listed.length,batches:reports,summary,rawSha256:sha(raw),tests:reports.reduce((s,x)=>s+x.tests,0),passed:reports.reduce((s,x)=>s+x.passed,0),pending:reports.reduce((s,x)=>s+x.pending,0)});
for(const metric of ['statements','branches','functions','lines'])if(summary[metric].pct!==100)throw Error('Incomplete full coverage '+metric+' '+JSON.stringify(summary[metric]));
console.log('FULL APPLICATION ACCEPTED '+JSON.stringify(summary));
