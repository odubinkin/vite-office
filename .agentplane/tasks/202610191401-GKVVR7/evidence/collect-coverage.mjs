import fs from 'node:fs';
import cp from 'node:child_process';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import coverage from 'istanbul-lib-coverage';
const out='.agentplane/tasks/202610191401-GKVVR7/evidence/';
const calcPath='apps/office/coverage/calc/coverage-final.json', sharedPath='apps/office/coverage/task35-shared/coverage-final.json';
const raw=fs.readFileSync(calcPath), calc=coverage.createCoverageMap(JSON.parse(raw));
fs.writeFileSync(out+'calc-coverage-final.json.gz',zlib.gzipSync(raw));
const shared=JSON.parse(fs.readFileSync(sharedPath));
const all={...JSON.parse(raw),...shared};
const paths=JSON.parse(fs.readFileSync(out+'application-paths.json')).filter(p=>p.startsWith('apps/office/src/')&&!p.includes('.test.'));
const owners={},barrels=[];
for(const path of paths){const key=Object.keys(all).find(p=>p.endsWith('/'+path));if(key){owners[key]=all[key];}else{const text=fs.readFileSync(path,'utf8');if(!/^\/\*\*[^]*?\*\/\s*export \{[^]*?\} from [^]*?;\s*$/.test(text))throw Error('Missing executable owner '+path);barrels.push(path);}}
const owned=coverage.createCoverageMap(owners), summary=owned.getCoverageSummary().toJSON(), calcSummary=calc.getCoverageSummary().toJSON();
fs.writeFileSync(out+'changed-owner-coverage-final.json',JSON.stringify(owners));
fs.writeFileSync(out+'coverage-summary.json',JSON.stringify({calc:calcSummary,changedOwners:summary,ownerCount:Object.keys(owners).length,barrels,rawSha256:crypto.createHash('sha256').update(raw).digest('hex')},null,2)+'\n');
for(const [group,map]of [['calc',calc],['owners',owned]])for(const path of map.files())for(const [metric,value]of Object.entries(map.fileCoverageFor(path).toSummary().toJSON()))if((value.total > 0 && value.pct!==100)||value.skipped)throw Error(group+' '+path+' '+metric+' '+JSON.stringify(value));
console.log(JSON.stringify({calc:calcSummary,changedOwners:summary,barrels}));
