import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, lstatSync, readlinkSync, symlinkSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const task='.agentplane/tasks/202610191035-NYABVG',target=task+'/clean-verification';
if(existsSync(target))throw new Error('Refuse to replace an existing verification snapshot');
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(p=>p&&!p.startsWith('.agentplane/')&&!p.startsWith('vendor/'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const hashes={};
for(const file of files){const to=target+'/'+file;mkdirSync(dirname(to),{recursive:true});if(lstatSync(file).isSymbolicLink())symlinkSync(readlinkSync(file),to);else{copyFileSync(file,to);if(hash(file)!==hash(to))throw new Error('Changed projection bytes:'+file);hashes[file]=hash(to);}}
for(const name of ['node_modules','vendor'])symlinkSync(resolve(name),target+'/'+name,'dir');
const report={purpose:'Run unchanged repository npm lint in a byte-identical tracked-file CI-style projection,without old ignored output diagnostics. No original output is deleted or rewritten;no lint configuration,rule,flag or source criterion is weakened.',target,sourceRoot:process.cwd(),branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),excludedTrackedRoots:['.agentplane/ (already ignored by the unchanged ESLint config)','vendor/ (same actual vendor tree linked;already ignored by unchanged ESLint config)'],linkedDependencies:['node_modules (same installed dependency tree)','vendor (same pinned original source tree)'],copiedCount:files.length,hashes};
writeFileSync(task+'/clean-lint-projection.json',JSON.stringify(report,null,2)+'\n');
console.log('Byte-identical clean lint projection prepared:'+files.length+'tracked paths;original ignored outputs retained.');
