/** @fileoverview Exact touched-path style checks for the Calc shared-file-UI task. */
import {execFileSync,spawnSync} from 'node:child_process';
const paths=[...new Set([
 ...execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n'),
 ...execFileSync('git',['ls-files','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n'),
])].filter(path=>path && !path.startsWith('.agentplane/'));
const source=paths.filter(path=>/\.(ts|tsx)$/.test(path));
const format=paths.filter(path=>/\.(ts|tsx|css|json)$/.test(path));
for(const [name,args]of [['prettier',['--check',...format]],['eslint',[...source,'--max-warnings','0']]]) {
 console.log(JSON.stringify({command:name,args}));
 const result=spawnSync(`./node_modules/.bin/${name}`,args,{stdio:'inherit'});
 if(result.status!==0) process.exit(result.status??1);
}
console.log(`Touched checks passed for ${paths.length} non-task paths.`);
