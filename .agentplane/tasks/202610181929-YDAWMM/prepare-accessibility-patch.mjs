/** @fileoverview Prepares reviewable semantic markup and test role migrations without touching the running regression sources. */
import ts from 'typescript';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const changes = new Map();
const menuPath='apps/office/src/framework/browser/presentation/CommandMenuBar.tsx';
let menu=readFileSync(menuPath,'utf8');menu=menu.replace('                aria-controls={`${idPrefix}-${menu.id}-menu`}','                role="menuitem"\n                aria-controls={`${idPrefix}-${menu.id}-menu`}');changes.set(menuPath,menu);
const headerPath='apps/office/src/framework/browser/presentation/OfficeWorkspaceHeader.tsx';
let header=readFileSync(headerPath,'utf8');header=header.replace('          {isEditingTitle ? (','          <h1 className="m-0 text-sm font-bold leading-5">\n          {isEditingTitle ? (').replace('          <p className="text-[10px]','          </h1>\n          <p className="text-[10px]');changes.set(headerPath,header);
const gridPath='apps/office/src/sc/browser/presentation/ScGridWindow.tsx';
const grid=readFileSync(gridPath,'utf8');
const ast=ts.createSourceFile(gridPath,grid,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const edits=[];
function walk(node){
 if(ts.isJsxElement(node)||ts.isJsxSelfClosingElement(node)){
  const open=ts.isJsxElement(node)?node.openingElement:node;
  if(open.tagName.getText(ast)==='button'){
   const attrs=open.attributes.properties;
   const role=attrs.find(a=>ts.isJsxAttribute(a)&&a.name.getText(ast)==='role');
   if(role&&['"columnheader"','"rowheader"'].includes(role.initializer?.getText(ast))){
    const outer=attrs.filter(a=>!['type','onClick'].includes(a.name?.getText(ast))).map(a=>a.getText(ast)).join('\n');
    const inner=attrs.filter(a=>['type','onClick','aria-label'].includes(a.name?.getText(ast))).map(a=>a.getText(ast)).join('\n');
    const children=ts.isJsxElement(node)?grid.slice(node.openingElement.end,node.closingElement.getStart(ast)):'<span className="sr-only">Select all cells</span>';
    edits.push({start:node.getStart(ast),end:node.end,text:`<div ${outer}><button ${inner} className="block h-full w-full">${children}</button></div>`});
   }
  }
 }
 ts.forEachChild(node,walk);
}
walk(ast);let nextGrid=grid;for(const e of edits.sort((a,b)=>b.start-a.start))nextGrid=nextGrid.slice(0,e.start)+e.text+nextGrid.slice(e.end);changes.set(gridPath,nextGrid);
const candidates=execFileSync('rg',['--files','apps/office/src','apps/office/e2e'],{encoding:'utf8'}).trim().split('\n').filter(p=>/\.(test\.(ts|tsx)|spec\.ts)$/.test(p));
for(const path of candidates){
 const original=readFileSync(path,'utf8');
 const changed=original.replace(/(getByRole|queryByRole|findByRole)\("button",(\s*\{[^}]*?name:\s*"(?:File|Edit|View|Format|Styles|Table|Tools|Sheet|Data|Window)"[^}]*\})/g,'$1("menuitem",$2');
 if(changed!==original)changes.set(path,changed);
}
const payload=[...changes].map(([path,content])=>({path,before:readFileSync(path,'utf8'),after:content}));
const patch=execFileSync('python3',['-c',"import sys,json,difflib; rows=json.load(sys.stdin);sys.stdout.write(''.join(''.join(difflib.unified_diff(r['before'].splitlines(True),r['after'].splitlines(True),fromfile='a/'+r['path'],tofile='b/'+r['path'])) for r in rows))"],{input:JSON.stringify(payload),encoding:'utf8'});
writeFileSync('.agentplane/tasks/202610181929-YDAWMM/accessibility.patch',patch);
writeFileSync('.agentplane/tasks/202610181929-YDAWMM/prepared-paths.json',JSON.stringify(payload.map(p=>({path:p.path,sha256:createHash('sha256').update(p.before).digest('hex')})),null,2)+'\n');
console.log(JSON.stringify({preparedPaths:payload.length,gridHeaders:edits.length,note:'Prepared only;runtime and tests are unchanged. Insert/Help and dynamic/scoped menu queries require individual review before application.'}));
