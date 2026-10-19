import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import {readEvidence} from './read-evidence.mjs';
const {createCoverageMap}=createRequire(import.meta.url)('istanbul-lib-coverage');
const task='.agentplane/tasks/202610191035-NYABVG',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const saved=JSON.parse(readFileSync(task+'/app-full-coverage.raw.json','utf8'));
const fullBytes=gunzipSync(Buffer.from(saved.data,'base64'));
assert.equal(fullBytes.length,saved.bytes);assert.equal(hash(fullBytes),saved.sha256);
const original=JSON.parse(fullBytes),replaySaved=JSON.parse(readFileSync(task+'/app-replay-coverage.raw.json','utf8')),replayBytes=gunzipSync(Buffer.from(replaySaved.data,'base64')),replay=JSON.parse(replayBytes);
assert.equal(replayBytes.length,replaySaved.bytes);assert.equal(hash(replayBytes),replaySaved.sha256);
const snapshot=JSON.parse(readFileSync(task+'/source-snapshot.json','utf8'));
for(const [path,expected]of Object.entries(snapshot.hashes))if(!/\.test\.(ts|tsx)$/.test(path))assert.equal(hash(readFileSync(path)),expected,'Runtime changed:'+path);
assert.deepEqual(Object.keys(replay).sort(),Object.keys(original).sort(),'Different coverage file set');
for(const path of Object.keys(original)){
 for(const key of ['statementMap','fnMap','branchMap'])assert.deepEqual(replay[path][key],original[path][key],'Different original instrumentation map:'+path+':'+key);
}
const fullResult=readEvidence(task+'/app-full-results.json'),replayResult=readEvidence(task+'/app-replay-results.json');
assert.equal(replayResult.numFailedTests,0);assert.equal(replayResult.numPendingTests,0);assert.equal(fullResult.numPendingTests,0);
const key=(suite,item)=>suite.name+'#'+item.fullName;
const passed=new Set(replayResult.testResults.flatMap(s=>s.assertionResults.filter(c=>c.status==='passed').map(c=>key(s,c))));
const failed=fullResult.testResults.flatMap(s=>s.assertionResults.filter(c=>c.status==='failed').map(c=>key(s,c)));
assert.equal(failed.length,fullResult.numFailedTests);for(const name of failed)assert.ok(passed.has(name),'Unresolved full-run failure:'+name);
const merged=createCoverageMap(original);merged.merge(replay);const summary=merged.getCoverageSummary().toJSON();
for(const key of ['statements','branches','functions','lines']){assert.equal(summary[key].covered,summary[key].total,key);assert.equal(summary[key].skipped,0,key);assert.equal(summary[key].pct,100,key);}
const bytes=Buffer.from(JSON.stringify(merged.toJSON()));
writeFileSync(task+'/app-merged-coverage.raw.json',JSON.stringify({encoding:'gzip-base64',bytes:bytes.length,sha256:hash(bytes),data:gzipSync(bytes).toString('base64')})+'\n');
writeFileSync(task+'/app-merged-coverage-summary.json',JSON.stringify(summary,null,2)+'\n');
const report={fullSelectedCases:fullResult.numTotalTests,fullPassed:fullResult.numPassedTests,fullFailed:fullResult.numFailedTests,replayCases:replayResult.numTotalTests,replayPassed:replayResult.numPassedTests,allFullCasesAccounted:true,skipped:0,oneCleanFullInvocation:false,coverageFileCount:Object.keys(original).length,runtimeSourceBytesUnchanged:true,instrumentationMapsExactlyEqual:true,aggregation:'Unedited actual full and replay counters merged with istanbul-lib-coverage;all four unchanged strict100 metrics independently gated. Subset replay CLI retains original whole-app100 thresholds and therefore exits1 for its partial profile;its43test cases all pass. No exclusion,threshold,timeout or counter edits.',fullCoverageSha256:hash(fullBytes),replayCoverageSha256:hash(replayBytes),mergedCoverageSha256:hash(bytes),summary};
writeFileSync(task+'/app-reconciliation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
