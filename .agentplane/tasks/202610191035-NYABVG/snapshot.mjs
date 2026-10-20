import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const task='.agentplane/tasks/202610191035-NYABVG';
const files=execFileSync('git',['ls-files','apps/office/src'],{encoding:'utf8'}).trim().split('\n').filter(p=>/\.(ts|tsx)$/.test(p));
const sources=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
writeFileSync(task+'/source-snapshot.json',JSON.stringify({head,branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),scope:'All tracked application TypeScript sources and tests at task30 full-run start;used to tie coverage maps and any later bounded replays to exact source bytes.',sourceCount:files.length,hashes:sources},null,2)+'\n');
console.log('Saved full-run source snapshot:',files.length,'tracked application sources/tests.');
