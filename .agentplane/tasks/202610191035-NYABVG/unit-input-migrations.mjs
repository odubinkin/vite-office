import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import {readEvidence} from './read-evidence.mjs';
const task='.agentplane/tasks/202610191035-NYABVG';
const mode=process.argv[2];assert.ok(['--audit','--apply'].includes(mode),'Use --audit or --apply');
const file=task+'/app-full-results.json';assert.ok(existsSync(file),'Wait for the original full-run terminal result');
const result=readEvidence(file);
const draft=JSON.parse(readFileSync(task+'/pending-unit-input-migrations.json','utf8'));
const byPath=new Map(draft.files.map(entry=>[entry.path,entry]));
const failures=[];
for(const suite of result.testResults){
 const path=suite.name.replace(process.cwd()+'/','');
 const cases=suite.assertionResults.filter(item=>item.status==='failed');
 if(cases.length)failures.push({path,cases:cases.map(item=>({name:item.fullName,errors:item.failureMessages.map(message=>message.slice(0,1800))}))});
}
console.log(JSON.stringify({fullRun:{tests:result.numTotalTests,passed:result.numPassedTests,failed:result.numFailedTests,pending:result.numPendingTests},failures},null,2));
writeFileSync(task+'/unit-failure-audit.json',JSON.stringify({fullRun:{tests:result.numTotalTests,passed:result.numPassedTests,failed:result.numFailedTests,pending:result.numPendingTests},failures},null,2)+'\n');
if(mode==='--apply'){
 assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'calc');
 assert.ok(failures.length>0,'No failing input fixtures to migrate');
 for(const entry of failures)assert.ok(byPath.has(entry.path),'Unreviewed failure outside proposed migration:'+entry.path);
 const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 const source=JSON.parse(readFileSync(task+'/source-snapshot.json','utf8'));
 for(const [path,expected]of Object.entries(source.hashes))if(!/\.test\.(ts|tsx)$/.test(path))assert.equal(hash(readFileSync(path)),expected,'Runtime source changed during full run:'+path);
 const applied=[];
 for(const failed of failures){const entry=byPath.get(failed.path);assert.equal(hash(readFileSync(entry.path)),entry.beforeSha256,'Stale proposed input migration:'+entry.path);writeFileSync(entry.path,entry.after);applied.push({path:entry.path,beforeSha256:entry.beforeSha256,intermediateAfterSha256:hash(entry.after),replacementCount:entry.replacementCount,intent:entry.intent});}
 writeFileSync(task+'/applied-unit-input-migrations.json',JSON.stringify({runtimeSourcesUnchanged:true,files:applied},null,2)+'\n');
 console.log('Applied only reviewed command-input migrations:'+applied.length+'test files;runtime source bytes unchanged.');
}
