import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import cp from 'node:child_process';
const files=cp.execFileSync('git',['status','--porcelain','--untracked-files=all'],{encoding:'utf8'}).split('\n').filter(Boolean).map(x=>x.slice(3)).filter(x=>x.startsWith('apps/office/src/')&&/\.tsx?$/.test(x));
for(const file of files){
 let source=fs.readFileSync(file,'utf8');const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);const edits=[],needed=new Set();
 function visit(node){
  if(ts.isNonNullExpression(node)){
   const expression=node.expression.getText(sf);let type;
   if(expression.startsWith('this.mvData[')) type='ScAttrEntry';
   else if(expression.includes('.GetPattern(')||expression.includes('.GetPatternRange(')){ type='ScPatternAttr';needed.add(type); }
   else if(expression.includes('.FetchTable(')){ type='ScTable';needed.add(type); }
   else if(expression==='session.autosave') type='NonNullable<typeof session.autosave>';
   else if(expression.startsWith('holders[')) type='CellAttributeHolder';
   else if(/^(expected\[|heights\[|slots\[|\[200,)/.test(expression)) type='number';
   else throw Error(file+': unknown borrowed expression '+expression);
   edits.push({start:node.getStart(sf),end:node.end,text:`(${expression} as ${type})`});
  }
  ts.forEachChild(node,visit);
 }
 visit(sf);if(!edits.length)continue;
 for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
 for(const name of needed){
  if(new RegExp('import[^;]*\\b'+name+'\\b').test(source))continue;
  const target=name==='ScTable'?'apps/office/src/sc/inc/table':'apps/office/src/sc/inc/patattr';
  let relative=path.relative(path.dirname(file),target).split(path.sep).join('/');if(!relative.startsWith('.'))relative='./'+relative;
  const index=source.indexOf('import ');source=source.slice(0,index)+`import type { ${name} } from "${relative}";\n`+source.slice(index);
 }
 fs.writeFileSync(file,source);console.log(file,edits.length);
}
