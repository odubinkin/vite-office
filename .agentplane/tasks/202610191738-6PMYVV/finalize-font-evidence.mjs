/** @fileoverview Validates source-matched raw coverage and retains final font UI acceptance evidence. */
import fs from 'node:fs';
import cp from 'node:child_process';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {createRequire} from 'node:module';
const {createCoverageMap}=createRequire(import.meta.url)('istanbul-lib-coverage');
const base='.agentplane/tasks/202610191738-6PMYVV/evidence/';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const coverage=createCoverageMap({});
for(const name of ['calc-font-styles-proof.json','related-font-final-proof.json']){
 const proof=JSON.parse(fs.readFileSync(base+name));
 const raw=zlib.gunzipSync(fs.readFileSync(base+proof.rawEvidence));
 if(crypto.createHash('sha256').update(raw).digest('hex')!==proof.rawSha256)throw Error('Raw evidence mismatch');
 for(const [path,digest]of Object.entries(proof.coveredOwnerHashes))if(hash(path)!==digest)throw Error('Stale coverage '+path);
 coverage.merge(JSON.parse(raw));
}
const paths=[...new Set([...cp.execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n'),...cp.execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n')])].filter(p=>p&&!p.startsWith('.agentplane/')).sort();
const owners=paths.filter(p=>p.startsWith('apps/office/src/')&&/\.(ts|tsx)$/.test(p)&&!p.includes('.test.'));
const nonExecutable={
 'apps/office/src/offapi/com/sun/star/i18n/XBreakIterator.ts':'Consumed two-method IDL TypeScript interface; erased at runtime.',
 'apps/office/src/sw/browser/editor/writer-font-family.ts':'Public re-export only; executable implementation is measured in shared vcl/browser/font-family.ts.'
};
const subset=createCoverageMap({});
const results=[];
for(const path of owners){
 if(nonExecutable[path]){results.push({path,sha256:hash(path),nonExecutable:nonExecutable[path]});continue;}
 const full=process.cwd()+'/'+path;
 if(!coverage.files().includes(full))throw Error('Missing owner '+path);
 const file=coverage.fileCoverageFor(full),summary=file.toSummary().toJSON();
 for(const key of ['statements','branches','functions','lines'])if(summary[key].pct!==100&&summary[key].total!==0)throw Error('Owner below100 '+path+' '+key);
 subset.addFileCoverage(file);
 results.push({path,sha256:hash(path),summary});
}
fs.writeFileSync(base+'changed-font-owner-coverage.json',JSON.stringify({result:'pass',rawProofs:['calc-font-styles-proof.json','related-font-final-proof.json'],changedOwners:owners.length,executableOwners:owners.length-Object.keys(nonExecutable).length,summary:subset.getCoverageSummary().toJSON(),owners:results},null,2)+'\n');
fs.writeFileSync(base+'changed-font-paths.json',JSON.stringify(paths,null,2)+'\n');
const debug='output/playwright/task37-script-native/';
for(const name of ['browser-styles-fixed.log','browser-styles-failure.log','build-styles.log','types-final.log','lint-final.log'])fs.copyFileSync(debug+name,base+name);
for(let i=0;i<10;i++)fs.copyFileSync(debug+'accept-check-'+i+'.log',base+'accept-check-'+i+'.log');
for(const width of [1280,390])fs.copyFileSync('test-results/e2e/calc-font-family-Calc-shared-font-family-selection-at-'+width+'px-calc/calc-font-family-'+width+'.png',base+'calc-font-family-'+width+'.png');
console.log(JSON.stringify({changedPaths:paths.length,changedOwners:owners.length,executableOwners:results.filter(x=>!x.nonExecutable).length,summary:subset.getCoverageSummary().toJSON()}));
