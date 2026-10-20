/** @fileoverview Runs only related Writer/ODF consumers and measures complete changed non-Calc source owners. */
import fs from 'node:fs';
import cp from 'node:child_process';
import crypto from 'node:crypto';
const base='.agentplane/tasks/202610191455-1KGJBF/evidence/';
const tests=JSON.parse(fs.readFileSync(base+'related-test-selection.json','utf8'));
const owners=JSON.parse(fs.readFileSync(base+'related-owner-paths.json','utf8'));
const hashes=Object.fromEntries(owners.map(path=>[path,crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')]));
fs.writeFileSync(base+'related-source-hashes.json',JSON.stringify(hashes,null,2)+'\n');
const args=['vitest','run','--config','vite.config.ts',...tests,'--coverage',...owners.map(path=>'--coverage.include='+path.replace('apps/office/','')),'--coverage.reportsDirectory=coverage/task36-related','--coverage.reporter=json','--coverage.reporter=text'];
fs.writeFileSync(base+'related-coverage-command.json',JSON.stringify({cwd:'apps/office',command:'npx',args},null,2)+'\n');
const log=fs.openSync(base+'related-coverage.log','w');
const result=cp.spawnSync('npx',args,{cwd:'apps/office',stdio:['ignore',log,log]});
fs.closeSync(log);
console.log(JSON.stringify({status:result.status,signal:result.signal,error:result.error?.message}));
process.exitCode=result.status??1;
