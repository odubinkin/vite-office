import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const paths=[...new Set([...execFileSync("git",["diff","--name-only"],{encoding:"utf8"}).trim().split("\n"),...execFileSync("git",["ls-files","--others","--exclude-standard"],{encoding:"utf8"}).trim().split("\n")])].filter(p=>p&&!p.startsWith(".agentplane/"));
writeFileSync(".agentplane/tasks/202610182120-YSQ8VM/changed-paths.json",JSON.stringify(paths,null,2)+"\n");
execFileSync("npx",["prettier","--check",...paths],{stdio:"inherit"});
execFileSync("npx",["eslint",...paths.filter(p=>/\.[cm]?[jt]sx?$/.test(p)),"--max-warnings","0"],{stdio:"inherit"});
console.log(`Checked ${paths.length} intentional paths.`);
