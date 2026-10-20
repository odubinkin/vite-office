import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawn,spawnSync} from 'node:child_process';
import coverage from 'istanbul-lib-coverage';
const root=process.cwd(),app=path.join(root,'apps/office'),out=path.join(root,'output/playwright'),evidence=path.join(root,'.agentplane/tasks/202610201407-GDJM1W/evidence');
fs.mkdirSync(evidence,{recursive:true});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const save=(name,value)=>fs.writeFileSync(path.join(evidence,name),JSON.stringify(value,null,2)+'\n');
const tracked=spawnSync('git',['ls-files','-z','apps/office','scripts','package.json','package-lock.json'],{encoding:'utf8'}).stdout.split('\0').filter(Boolean);
const snapshot=Object.fromEntries(tracked.map(p=>[p,sha(fs.readFileSync(p))]));
function stable(){const changed=Object.entries(snapshot).filter(([p,h])=>!fs.existsSync(p)||sha(fs.readFileSync(p))!==h).map(([p])=>p);if(changed.length)throw Error('Tested source changed: '+changed.join(','));}
function archive(file,name){const b=fs.readFileSync(file),z=gzipSync(b);if(sha(gunzipSync(z))!==sha(b))throw Error('Archive mismatch');fs.writeFileSync(path.join(evidence,name),z);return {path:name,bytes:b.length,sha256:sha(b),compressedSha256:sha(z)};}
const listed=JSON.parse(fs.readFileSync(path.join(out,'task50-discovery.json'),'utf8')).sort((a,b)=>a.file.localeCompare(b.file));
if(listed.length<1000||new Set(listed.map(x=>x.file)).size!==listed.length)throw Error('Suspicious application discovery');
const batches=[];for(let i=0;i<listed.length;i+=100)batches.push(listed.slice(i,i+100));
const state={task:'202610201407-GDJM1W',checkpoint:50,pid:process.pid,status:'running',startedAt:new Date().toISOString(),testedCommit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),discoveredFiles:listed.length,owners:Object.fromEntries(['calc','writer','shared'].map(p=>[p,listed.filter(x=>x.projectName===p).length])),batches:[],stages:[],coverageIssues:[]};
save('tested-source-snapshot.json',snapshot);save('application-discovery.json',listed);save('progress.json',state);
async function run(name,command,args,cwd=root,env={}){stable();const log=path.join(out,`task50-${name}.log`),fd=fs.openSync(log,'w'),entry={name,command,args,cwd,log:path.relative(root,log),startedAt:new Date().toISOString()};
 const child=spawn(command,args,{cwd,env:{...process.env,...env},stdio:['ignore',fd,fd]});state.active={name,pid:child.pid,startedAt:entry.startedAt};save('progress.json',state);console.log('START '+name+' pid='+child.pid);
 const result=await new Promise(resolve=>{child.on('error',error=>resolve({exit:null,error:String(error)}));child.on('close',(exit,signal)=>resolve({exit,signal}));});fs.closeSync(fd);stable();Object.assign(entry,result,{finishedAt:new Date().toISOString()});delete state.active;console.log('END '+name+' exit='+entry.exit);return entry;}
const merged=coverage.createCoverageMap({}),maps=new Map(),observedFiles=[];
try{
 for(let i=0;i<batches.length;i++){
  const id=String(i).padStart(2,'0'),report=path.join(out,`task50-batch-${id}-results.json`),dir=path.join(app,`coverage/task50-batch-${id}`);
  if(fs.existsSync(dir)||fs.existsSync(report))throw Error('Run artifact already exists '+id);
  const args=['run','--config','vite.config.ts',...batches[i].map(x=>path.relative(app,x.file)),'--coverage',`--coverage.reportsDirectory=${dir}`,'--coverage.reporter=json','--coverage.reporter=text','--coverage.reportOnFailure=true','--reporter=json',`--outputFile=${report}`];
  const entry=await run('batch-'+id,process.execPath,[path.join(root,'node_modules/vitest/vitest.mjs'),...args],app);entry.expectedFiles=batches[i].map(x=>x.file);entry.id=id;
  if(fs.existsSync(report)){
   const r=JSON.parse(fs.readFileSync(report,'utf8')),actual=r.testResults.map(x=>x.name).sort(),expected=[...entry.expectedFiles].sort();observedFiles.push(...actual);
   Object.assign(entry,{files:actual.length,tests:r.numTotalTests,passed:r.numPassedTests,failed:r.numFailedTests,pending:r.numPendingTests,runtimeErrors:r.numRuntimeErrorTestSuites,fileAccounting:JSON.stringify(actual)===JSON.stringify(expected),failures:r.testResults.flatMap(f=>(f.assertionResults??[]).filter(t=>t.status==='failed').map(t=>({file:f.name,name:t.fullName,messages:t.failureMessages})))});
   entry.results=archive(report,`batch-${id}-results.json.gz`);
  }else{entry.missingResult=true;state.coverageIssues.push('Missing test result '+id);}
  const rawFile=path.join(dir,'coverage-final.json');
  if(fs.existsSync(rawFile)){
   const raw=JSON.parse(fs.readFileSync(rawFile,'utf8'));entry.raw=archive(rawFile,`batch-${id}-raw.json.gz`);entry.rawFiles=Object.keys(raw).length;
   for(const [file,data] of Object.entries(raw)){
    const signature=JSON.stringify([data.statementMap,data.fnMap,data.branchMap,data.inputSourceMap??null]);
    if(maps.has(file)&&maps.get(file)!==signature){state.coverageIssues.push('Incompatible coverage map '+file+' batch '+id);continue;}
    maps.set(file,signature);merged.merge({[file]:data});
   }
   fs.rmSync(dir,{recursive:true});
  }else{state.coverageIssues.push('Missing raw coverage '+id);entry.missingCoverage=true;}
  fs.copyFileSync(path.join(root,entry.log),path.join(evidence,`batch-${id}.log`));state.batches.push(entry);save('progress.json',state);console.log('BATCH '+id+' files='+entry.files+' passed='+entry.passed+' failed='+entry.failed+' raw='+entry.rawFiles);
 }
 stable();const expected=listed.map(x=>x.file).sort(),actual=[...observedFiles].sort();
 const raw=JSON.stringify(merged.toJSON()),z=gzipSync(raw);if(sha(gunzipSync(z))!==sha(raw))throw Error('Aggregate archive mismatch');fs.writeFileSync(path.join(evidence,'application-raw.json.gz'),z);
 const summary=merged.getCoverageSummary().toJSON(),uncovered=merged.files().map(file=>{const c=merged.fileCoverageFor(file),s=c.toSummary().toJSON();return {file:path.relative(root,file),summary:s,lines:c.getUncoveredLines(),branches:Object.entries(c.data.b).filter(([,hits])=>hits.some(x=>x===0)).map(([id,hits])=>({id,hits,location:c.data.branchMap[id]}))};}).filter(x=>['statements','branches','functions','lines'].some(m=>x.summary[m].pct!==100));
 state.application={fileAccounting:JSON.stringify(expected)===JSON.stringify(actual),observedFiles:actual.length,uniqueFiles:new Set(actual).size,tests:state.batches.reduce((n,b)=>n+(b.tests??0),0),passed:state.batches.reduce((n,b)=>n+(b.passed??0),0),failed:state.batches.reduce((n,b)=>n+(b.failed??0),0),pending:state.batches.reduce((n,b)=>n+(b.pending??0),0),summary,coverageComplete:state.coverageIssues.length===0,rawSha256:sha(raw),uncoveredOwners:uncovered.length};
 save('application-proof.json',state.application);save('application-uncovered.json',uncovered);save('progress.json',state);console.log('APPLICATION '+JSON.stringify(state.application));
 const stages=[
  ['tooling','npm',['run','test:tooling','--','--maxWorkers=2','--reporter=json',`--outputFile=${path.join(out,'task50-tooling-results.json')}`]],
  ['inventory','npm',['run','test:inventory:coverage','--','--coverage.reporter=json','--coverage.reporter=json-summary','--coverage.reporter=text','--coverage.reportOnFailure=true',`--coverage.reportsDirectory=${path.join(out,'task50-inventory-coverage')}`,'--reporter=json',`--outputFile=${path.join(out,'task50-inventory-results.json')}`]],
  ['format','npm',['run','format:check','--','--ignore-path','.prettierignore','--ignore-path','.gitignore']],
  ['lint','npm',['run','lint','--','--ignore-pattern','output/playwright/**']],
  ['types','npm',['run','typecheck']],['dependencies','npm',['run','check:dependencies']],
  ['writer-resources','npm',['run','check:writer-resources']],['calc-resources','npm',['run','check:calc-resources']],
  ['docs','npm',['run','check:docs']],['size','npm',['run','check:file-size']],['tree','npm',['run','check:source-tree']],['provenance','npm',['run','check:source-provenance']],['registry','npm',['run','inventory:registry:check']],
  ['routing',process.execPath,['.agentplane/policy/check-routing.mjs']],['doctor','/Users/odubinkin/.local/bin/ap',['doctor']],
  ['build','npm',['run','build']],
  ['browser','npx',['playwright','test','--config','apps/office/playwright.config.ts','--reporter=line,json'],{PLAYWRIGHT_JSON_OUTPUT_NAME:path.join(out,'task50-browser-results.json')}],
  ['static',process.execPath,['scripts/check-static-build.mjs']],
 ];
 for(const [name,command,args,env] of stages){const entry=await run(name,command,args,root,env);state.stages.push(entry);
  const report=path.join(out,`task50-${name}-results.json`);if(fs.existsSync(report))entry.result=archive(report,`${name}-results.json.gz`);
  if(name==='inventory'){const file=path.join(out,'task50-inventory-coverage/coverage-final.json');if(fs.existsSync(file))entry.raw=archive(file,'inventory-raw.json.gz');const file2=path.join(out,'task50-inventory-coverage/coverage-summary.json');if(fs.existsSync(file2))fs.copyFileSync(file2,path.join(evidence,'inventory-summary.json'));}
  fs.copyFileSync(path.join(root,entry.log),path.join(evidence,`${name}.log`));save('progress.json',state);
 }
 stable();state.status='complete';state.finishedAt=new Date().toISOString();state.sourceStable=true;state.qualityPassed=state.application.fileAccounting&&state.application.coverageComplete&&state.application.failed===0&&state.application.pending===0&&['statements','branches','functions','lines'].every(m=>state.application.summary[m].pct===100)&&state.stages.every(x=>x.exit===0);save('progress.json',state);console.log('FULL RUN COMPLETE qualityPassed='+state.qualityPassed);
}catch(error){state.status='infrastructure-error';state.error=String(error?.stack??error);save('progress.json',state);console.error(state.error);process.exitCode=2;}
