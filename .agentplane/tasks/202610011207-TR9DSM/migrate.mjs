import fs from 'node:fs';import path from 'node:path';import ts from 'typescript';
const root='apps/office/src';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files(root).filter(f=>/\.tsx?$/.test(f))){
 if(file.includes('/editeng/')||file.includes('/vcl/source/font/')||file.endsWith('/doc/number.ts'))continue;
 let source=fs.readFileSync(file,'utf8');let needed=new Set();
 if(source.includes('new SwNumFormat(')){source=source.replaceAll('new SwNumFormat(','createWriterNumFormat(');needed.add('createWriterNumFormat');}
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);const edits=[];
 function visit(n){
  if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)){
   const name=n.expression.name.text;const receiver=n.expression.expression;const r=receiver.getText(ast);
   if(name==='GetBulletChar'){edits.push([n.getStart(ast),n.getEnd(),`getWriterNumFormatBullet(${r})`]);needed.add('getWriterNumFormatBullet');}
   if(name==='GetKind'&&!['rule','stored','target'].includes(r)) {edits.push([n.getStart(ast),n.getEnd(),`getWriterNumFormatKind(${r})`]);needed.add('getWriterNumFormatKind');}
   if(name==='GetBulletFont'){edits.push([n.getStart(ast),n.getEnd(),`(${n.getText(ast)}?.GetFamilyName() ?? "")`]);}
  }
  if(ts.isBinaryExpression(n)&&ts.isCallExpression(n.left)&&ts.isPropertyAccessExpression(n.left.expression)&&n.left.expression.name.text==='GetNumberingType'&&ts.isStringLiteral(n.right)){
   const values={arabic:'SVX_NUM_ARABIC','char-special':'SVX_NUM_CHAR_SPECIAL',none:'SVX_NUM_NUMBER_NONE'};
   if(values[n.right.text]){edits.push([n.right.getStart(ast),n.right.getEnd(),`SvxNumType.${values[n.right.text]}`]);needed.add('SvxNumType');}
  }
  ts.forEachChild(n,visit);
 }
 visit(ast);for(const[a,b,text]of edits.sort((a,b)=>b[0]-a[0]))source=source.slice(0,a)+text+source.slice(b);
 if(needed.size){
  const numberPath=path.relative(path.dirname(file),path.join(root,'sw/source/core/doc/number')).replaceAll('\\','/');
  const spec=numberPath.startsWith('.')?numberPath:'./'+numberPath;
  source=`import { ${[...needed].join(', ')} } from "${spec}";\n`+source;
 }
 if(source!==fs.readFileSync(file,'utf8'))fs.writeFileSync(file,source);
}
