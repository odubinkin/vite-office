import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import cp from 'node:child_process';
import path from 'node:path';
import coverage from 'istanbul-lib-coverage';
const root='.agentplane/tasks/202610200120-RV75WR/evidence/';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const freeze=JSON.parse(fs.readFileSync(root+'production-release-freeze.json'));
const baseDir=process.cwd();
const controller=path.resolve('apps/office/src/sc/browser/controller/calc-view-controller.ts');
const refreshed=[controller,path.resolve('apps/office/src/sc/browser/presentation/ScMetricInputDlg.tsx')];
const profiles={calc:['task46-calc-release','task46-calc-release-results.json','task46-calc-release.log'],ui:['task46-ui-accepted','task46-ui-accepted-results.json','task46-ui-accepted.log'],shared:['task46-shared-final-accepted','task46-shared-final-accepted-results.json','task46-shared-final-accepted.log'],writer:['task46-writer-current','task46-writer-current-results.json','task46-writer-current.log']};
const maps={};const results={};
for(const [name,[folder,result,log]] of Object.entries(profiles)){
 const raw=fs.readFileSync(`apps/office/coverage/${folder}/coverage-final.json`),data=JSON.parse(raw),map=coverage.createCoverageMap(data),tests=JSON.parse(fs.readFileSync('output/playwright/'+result));
 if(!tests.success||tests.numFailedTests||!tests.numPassedTests)throw Error('Failed '+name);
 const summary=map.getCoverageSummary().toJSON();
 for(const kind of ['statements','branches','functions','lines'])if(summary[kind].pct!==100||!summary[kind].total)throw Error('Incomplete '+name+kind);
 fs.writeFileSync(root+name+'-raw.json.gz',zlib.gzipSync(raw));fs.writeFileSync(root+name+'-results.json.gz',zlib.gzipSync(fs.readFileSync('output/playwright/'+result)));fs.copyFileSync('output/playwright/'+log,root+name+'-complete.log');
 maps[name]=map;results[name]=tests;
 const proof={result:'pass',testFiles:tests.testResults.length,tests:tests.numPassedTests,summary,rawSha256:hash(raw),sourceHashes:{}};
 for(const f of map.files()){
  const rel=path.relative(baseDir,f),current=hash(fs.readFileSync(f));
  if(name==='calc' && refreshed.includes(f))proof.sourceHashes[rel]=freeze.sourceHashes[rel];
  else{
   if(name==='calc'&&freeze.sourceHashes[rel]&&current!==freeze.sourceHashes[rel])throw Error('Unexpected changed Calc owner '+rel);
   if(name==='calc'&&!freeze.sourceHashes[rel]&&hash(cp.execFileSync('git',['show','HEAD:'+rel]))!==current)throw Error('Changed unowned Calc file '+rel);
   proof.sourceHashes[rel]=current;
  }
 }
 fs.writeFileSync(root+name+'-proof.json',JSON.stringify(proof,null,2)+'\n');
}
const names=r=>new Set(r.testResults.flatMap(f=>f.assertionResults.map(t=>f.name+'#'+t.fullName)));
if(JSON.stringify([...names(results.calc)].sort())!==JSON.stringify([...names(results.ui)].sort()))throw Error('UI owner refresh did not replay exactly the accepted Calc cases');
if(maps.ui.files().length!==2||!refreshed.every(f=>maps.ui.files().includes(f)))throw Error('Expected two complete current UI owners');
const old=maps.calc.toJSON();for(const f of refreshed)old[f]=maps.ui.fileCoverageFor(f).toJSON();
const accepted=coverage.createCoverageMap(old),summary=accepted.getCoverageSummary().toJSON();
for(const k of ['statements','branches','functions','lines'])if(summary[k].pct!==100)throw Error('Reconciled '+k);
const raw=JSON.stringify(accepted.toJSON());fs.writeFileSync(root+'calc-current-raw.json.gz',zlib.gzipSync(raw));
fs.writeFileSync(root+'calc-current-proof.json',JSON.stringify({result:'pass',testFiles:results.calc.testResults.length,tests:results.calc.numPassedTests,summary,rawSha256:hash(raw),reconciliation:'Entire freshly measured controller and metric-dialog owner/maps replace the earlier complete owners;no old/new counter merge. Every other Calc owner retains its measured hash. Both profiles replay the identical successful Calc test set.',sourceHashes:Object.fromEntries(accepted.files().map(f=>[path.relative(baseDir,f),hash(fs.readFileSync(f))]))},null,2)+'\n');
const full=coverage.createCoverageMap({...accepted.toJSON(),...maps.shared.toJSON(),...maps.writer.toJSON()}),owners=[];
for(const rel of Object.keys(freeze.sourceHashes)){
 if(!rel.endsWith('.ts')&&!rel.endsWith('.tsx'))continue;
 const abs=path.resolve(rel);
 if(!full.files().includes(abs)){
  if(rel!=='apps/office/src/sc/inc/FilterData.ts'||!/export \{ FilterData \} from/.test(fs.readFileSync(rel,'utf8')))throw Error('Missing complete owner '+rel);
  owners.push({path:rel,sha256:hash(fs.readFileSync(rel)),classification:'static re-export header;no executable body'});continue;
 }
 const one=full.fileCoverageFor(abs).toSummary().toJSON();for(const kind of ['statements','branches','functions','lines'])if(one[kind].pct!==100)throw Error('Incomplete owner '+rel);
 owners.push({path:rel,sha256:hash(fs.readFileSync(rel)),coverage:one});
}
fs.writeFileSync(root+'changed-owners-proof.json',JSON.stringify({result:'pass',owners,executableOwners:owners.filter(o=>o.coverage).length,staticHeaders:owners.filter(o=>!o.coverage).length},null,2)+'\n');
console.log(JSON.stringify({calc:summary,testFiles:results.calc.testResults.length,tests:results.calc.numPassedTests,sharedFiles:results.shared.testResults.length,sharedCases:results.shared.numPassedTests,writerFiles:results.writer.testResults.length,writerCases:results.writer.numPassedTests,executableOwners:owners.filter(o=>o.coverage).length},null,2));
