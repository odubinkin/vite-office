import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const ts=createRequire(import.meta.url)('typescript'),task='.agentplane/tasks/202610191035-NYABVG';
const files=JSON.parse(readFileSync(task+'/paths.json','utf8'));
const initial=JSON.parse(readFileSync(task+'/source-snapshot.json','utf8')).head;
function assertions(text,name){const source=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,name.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS),result=[];function walk(node){if(ts.isCallExpression(node)&&node.expression.getText(source).startsWith('expect'))result.push(node.getText(source));ts.forEachChild(node,walk);}walk(source);return result;}
const result=[];
for(const file of files){if(file==='apps/office/test-support/menu-pointer-e2e.ts')continue;const before=execFileSync('git',['show',initial+':'+file],{encoding:'utf8',maxBuffer:8*1024*1024}),after=readFileSync(file,'utf8');const original=assertions(before,file),current=assertions(after,file);assert.deepEqual(current,original,'Assertion changed:'+file);if(file.endsWith('.test.tsx'))assert.equal(after,before.replaceAll('fireEvent.mouseEnter(', 'fireEvent.click('),'Unexpected unit fixture change:'+file);assert.deepEqual(after.match(/(?:test|vi)\.set(?:Timeout|Config)\([^)]*\)/g),before.match(/(?:test|vi)\.set(?:Timeout|Config)\([^)]*\)/g),'Deadline/config changed:'+file);assert.deepEqual(after.match(/\b(?:test|it|describe)\.skip\b/g),before.match(/\b(?:test|it|describe)\.skip\b/g),'Skip changed:'+file);result.push({file,existingAssertionCalls:original.length,assertionsExactlyPreserved:true,timeoutAndSkipCallsPreserved:true});}
writeFileSync(task+'/test-delta-proof.json',JSON.stringify({existingFilesChecked:result.length,newSupportHelper:'Actual visible root/More controls and two physical mouse movements;no force,sleep,model writes or assertion removal.',files:result},null,2)+'\n');console.log('Existing assertion text and timeout/skip calls exactly preserved in'+result.length+'modified tests;unit edits are exclusively mouseEnter→click.');
