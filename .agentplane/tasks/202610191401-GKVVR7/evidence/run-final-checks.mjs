import cp from 'node:child_process';
import fs from 'node:fs';
const out='.agentplane/tasks/202610191401-GKVVR7/evidence/';
const steps=[['types-final',['npm','run','typecheck']],['build-final',['npm','run','build']],['static-final',['node','scripts/check-static-build.mjs']],['browser-calc-final',['npx','playwright','test','--config','apps/office/playwright.config.ts','--project','calc','--workers','1']]];
const results=[];
for(const [name,[command,...args]]of steps){const fd=fs.openSync(out+name+'.log','w');console.log('Running '+name);const result=cp.spawnSync(command,args,{stdio:['ignore',fd,fd]});fs.closeSync(fd);results.push({check:name,command:[command,...args],exitCode:result.status});fs.writeFileSync(out+'final-checks.json',JSON.stringify(results,null,2)+'\n');console.log(name+': '+result.status);if(result.status!==0)process.exit(result.status??1);}
