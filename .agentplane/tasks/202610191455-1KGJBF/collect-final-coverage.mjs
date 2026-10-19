/** @fileoverview Retains raw source-matched Calc/related maps and verifies every changed executable application owner. */
import fs from 'node:fs';
import cp from 'node:child_process';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import coverage from 'istanbul-lib-coverage';
import ts from 'typescript';
const base='.agentplane/tasks/202610191455-1KGJBF/evidence/';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const calcRaw=zlib.gunzipSync(fs.readFileSync(base+'calc-coverage-final2.json.gz'));
const relatedRaw=fs.readFileSync('apps/office/coverage/task36-related/coverage-final.json');
const calc=JSON.parse(calcRaw), related=JSON.parse(relatedRaw);
fs.writeFileSync(base+'related-coverage-final.json.gz',zlib.gzipSync(relatedRaw));
const expected={...JSON.parse(fs.readFileSync(base+'calc-coverage-final2-summary.json')).sourceHashes,...JSON.parse(fs.readFileSync(base+'related-source-hashes.json'))};
for(const [path,hash]of Object.entries(expected))if(sha(fs.readFileSync(path))!==hash)throw Error('Stale raw coverage '+path);
const paths=[...new Set([...cp.execFileSync('git',['diff','--name-only','--','apps/office/src'],{encoding:'utf8'}).trim().split('\n'),...cp.execFileSync('git',['ls-files','--others','--exclude-standard','apps/office/src'],{encoding:'utf8'}).trim().split('\n')])].filter(path=>path&&!path.includes('.test.')&&/\.tsx?$/.test(path));
const all={...calc,...related}, owned={}, typeOnly=[];
for(const path of paths){
 const key=Object.keys(all).find(file=>file.endsWith('/'+path));
 if(key){owned[key]=all[key];continue;}
 const source=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
 if(!source.statements.every(node=>ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)||(ts.isImportDeclaration(node)&&node.importClause?.isTypeOnly)))throw Error('Missing executable owner '+path);
 typeOnly.push({path,sha256:sha(fs.readFileSync(path)),classification:'AST type-only declarations and imports;no executable instrumentation counters'});
}
const groups={calc:coverage.createCoverageMap(calc),related:coverage.createCoverageMap(related),changedOwners:coverage.createCoverageMap(owned)};
const summaries={};
for(const [name,map]of Object.entries(groups)){
 summaries[name]=map.getCoverageSummary().toJSON();
 for(const file of map.files())for(const [metric,value]of Object.entries(map.fileCoverageFor(file).toSummary().toJSON()))if(value.skipped||(value.total>0&&value.pct!==100))throw Error(name+' '+file+' '+metric);
}
const report={...summaries,changedOwnerCount:Object.keys(owned).length,typeOnly,calcRawSha256:sha(calcRaw),relatedRawSha256:sha(relatedRaw),sourceHashes:expected};
fs.writeFileSync(base+'coverage-final-summary.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(base+'changed-owner-coverage-final.json.gz',zlib.gzipSync(JSON.stringify(owned)));
console.log(JSON.stringify({changedOwnerCount:report.changedOwnerCount,typeOnly,calc:summaries.calc,related:summaries.related,changedOwners:summaries.changedOwners}));
