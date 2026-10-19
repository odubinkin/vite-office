import fs from 'node:fs';
import cp from 'node:child_process';
const out='.agentplane/tasks/202610191401-GKVVR7/evidence/';
const paths=JSON.parse(fs.readFileSync(out+'changed-paths.json'));
cp.execFileSync('npx',['prettier','--write',...paths.filter(p=>p.startsWith('docs/'))],{stdio:'ignore'});
const steps=[['format-final',['npx','prettier','--check',...paths]],['lint-final',['npx','eslint',...paths.filter(p=>p.startsWith('apps/office/')),'--max-warnings','0']],['docs-final',['npm','run','check:docs']],['size-final',['npm','run','check:file-size']],['dependencies-final',['npm','run','check:dependencies']],['provenance-final',['npm','run','check:source-provenance']],['tree-final',['npm','run','check:source-tree']],['resources-final',['npm','run','check:calc-resources']],['inventory-calc-final',['npm','run','inventory:parity:calc']],['inventory-shared-final',['npm','run','inventory:parity:shared']],['doctor-final',['ap','doctor']],['routing-final',['node','.agentplane/policy/check-routing.mjs']],['diff-final',['git','diff','--check']]];
const results=[];
for(const[name,[command,...args]]of steps){const fd=fs.openSync(out+name+'.log','w');const r=cp.spawnSync(command,args,{stdio:['ignore',fd,fd]});fs.closeSync(fd);results.push({check:name,command:[command,...args],exitCode:r.status});console.log(name+': '+r.status);}
fs.writeFileSync(out+'metadata-checks.json',JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.exitCode!==0))process.exit(1);
