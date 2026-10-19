import { ESLint } from 'eslint';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const task='.agentplane/tasks/202610191035-NYABVG',report=JSON.parse(readFileSync(task+'/clean-lint-projection.json','utf8'));
const actualRoot=new ESLint({cwd:process.cwd()}),cleanRoot=new ESLint({cwd:resolve(report.target)});
const eligible=[];
for(const file of Object.keys(report.hashes)){
 const original=await actualRoot.isPathIgnored(resolve(file));
 const projected=await cleanRoot.isPathIgnored(resolve(report.target,file));
 assert.equal(projected,original,'Lint eligibility drift:'+file);
 if(!original)eligible.push(file);
}
assert.ok(eligible.length>1800,'Suspiciously narrow lint scope');
writeFileSync(task+'/clean-lint-scope.json',JSON.stringify({eligibleTrackedFileCount:eligible.length,eligibilityMatchesOriginalConfiguration:true,paths:eligible},null,2)+'\n');
console.log('Unchanged original/projected lint eligibility matches for '+Object.keys(report.hashes).length+'files;eligible authored inputs:'+eligible.length);
