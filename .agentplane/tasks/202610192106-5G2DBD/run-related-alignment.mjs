/** @fileoverview Measures complete changed shared alignment owners with Vitest's actual related import graph. */
import fs from 'node:fs';import cp from 'node:child_process';import crypto from 'node:crypto';
const base='.agentplane/tasks/202610192106-5G2DBD/evidence/';fs.mkdirSync(base,{recursive:true});
const owners=['apps/office/src/framework/browser/presentation/command-surface.ts','apps/office/src/framework/browser/presentation/CommandToolbar.tsx','apps/office/src/framework/browser/presentation/CommandMenuBar.tsx','apps/office/src/xmloff/source/core/xmltoken.ts'];
fs.writeFileSync(base+'related-alignment-source-hashes.json',JSON.stringify(Object.fromEntries(owners.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),null,2)+'\n');
const args=['vitest','related','--run','--config','vite.config.ts',...owners.map(p=>p.replace('apps/office/','')),'--coverage',...owners.map(p=>'--coverage.include='+p.replace('apps/office/','')),'--coverage.reportsDirectory=coverage/task39-related','--coverage.reporter=json','--coverage.reporter=text'];
fs.writeFileSync(base+'related-alignment-command.json',JSON.stringify({command:'npx',cwd:'apps/office',args},null,2)+'\n');
if(process.argv.includes('--prepare')){console.log(JSON.stringify({prepared:true,owners:owners.length}));process.exit(0);}
const log=fs.openSync('output/playwright/task39-related.log','w'),result=cp.spawnSync('npx',args,{cwd:'apps/office',stdio:['ignore',log,log]});fs.closeSync(log);
console.log(JSON.stringify({status:result.status,signal:result.signal,error:result.error?.message}));process.exitCode=result.status??1;
