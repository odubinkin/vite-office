/** @fileoverview Measures complete changed shared/Writer color owners with the selected related managed tests. */
import fs from 'node:fs';import cp from 'node:child_process';import crypto from 'node:crypto';
const base='.agentplane/tasks/202610191952-9SF7RJ/evidence/';
const tests=JSON.parse(fs.readFileSync(base+'related-color-test-selection.json'));
const owners=JSON.parse(fs.readFileSync(base+'related-color-owner-paths.json'));
fs.writeFileSync(base+'related-color-source-hashes.json',JSON.stringify(Object.fromEntries(owners.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),null,2)+'\n');
const args=['vitest','run','--config','vite.config.ts',...tests,'--coverage',...owners.map(p=>'--coverage.include='+p.replace('apps/office/','')),'--coverage.reportsDirectory=coverage/task38-related','--coverage.reporter=json','--coverage.reporter=text'];
fs.writeFileSync(base+'related-color-command.json',JSON.stringify({command:'npx',cwd:'apps/office',args},null,2)+'\n');
if(process.argv.includes('--prepare')){console.log(JSON.stringify({prepared:true,tests:tests.length,owners:owners.length}));process.exit(0);}
const log=fs.openSync('output/playwright/task38-related.log','w'),result=cp.spawnSync('npx',args,{cwd:'apps/office',stdio:['ignore',log,log]});fs.closeSync(log);
console.log(JSON.stringify({status:result.status,signal:result.signal,error:result.error?.message}));process.exitCode=result.status??1;
