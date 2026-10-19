import fs from 'node:fs';
import cp from 'node:child_process';
const base='docs/program/registry/';
const note='TaskGKVVR7 connects source standard automatic row-height arithmetic and genuine compressed geometry/flags to current FontHeight UI and attribute Undo/Redo. Original contiguous pool defaults extend through ATTR_MARGIN143. Standard uniform-script unwrapped/unrotated rows use native 256-twip startup minimum,23-twip correction,margin/emphasis and pixel-change conditions. Selected sheets retain one original shared context. React uses actual row segments and bounded physical scrolling; ODS row styles apply to real sheet storage. Device-based initialization/script scanning,rich/wrapped/rotated/merged layout,drawing/hidden rows and standalone height dialogs remain unported. Unsupported device layouts retain imported geometry. Writer primary saving/no-recovery/visible-content policy is retained; broad parity remains unverified.';
const additions=[
 ['sc/source/core/data/column2.ts','sc/source/core/data/column2.cxx','lcl_GetAttribHeight'],
 ['sc/source/core/data/table1.ts','sc/source/core/data/table1.cxx','SetOptimalHeightsToRows'],
 ['sc/source/core/data/rowheightcontext.ts','sc/source/core/data/rowheightcontext.cxx','RowHeightContext'],
 ['sc/inc/rowheightcontext.ts','sc/inc/rowheightcontext.hxx','RowHeightContext'],
 ['sc/source/ui/view/viewfun2.ts','sc/source/ui/view/viewfun2.cxx','AdjustBlockHeight'],
 ['sc/browser/presentation/row-geometry.ts',null,'rowPixels'],
];
for(const [local,upstream,symbol] of additions){
 const browser=upstream===null;
 for(const kind of ['runtime','provenance']){
  const template=JSON.parse(fs.readFileSync(base+'calc/'+kind+'/sc/'+(browser?'browser/presentation/ScGridWindow.tsx':'source/ui/view/formatsh.ts')+'.json','utf8'));
  const r=template.record, path='apps/office/src/'+local;
  if(kind==='runtime') {r.path=path;r.subsystem=browser?'spreadsheet-browser-geometry':'row-height';r.semantic.justification=note;r.semantic.localSymbols=[symbol];r.semantic.upstreamSymbols=browser?[]:[symbol];r.semantic.upstreamFile=upstream;r.semantic.evidence=[path,'apps/office/src/sc/source/core/data/rowheight.test.ts'];}
  else {r.localPath=path;if(browser){r.responsibilities=[note];r.evidence={local:[{path,marker:symbol},{path:'apps/office/src/sc/source/core/data/rowheight.test.ts',marker:'projects variable native heights'}]};}else{r.upstreamPath=upstream;r.localSymbols=[symbol];r.upstreamSymbols=[symbol];r.preservedResponsibilities=[note];r.evidence={local:[{path,marker:symbol}],upstream:[{path:'vendor/libreoffice-reference/'+upstream,marker:symbol}]};}}
  const target=base+'calc/'+kind+'/'+local+'.json';fs.mkdirSync(target.slice(0,target.lastIndexOf('/')),{recursive:true});fs.writeFileSync(target,JSON.stringify(template,null,2)+'\n');
 }
}
const paths=cp.execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).split('\n').filter(p=>p.startsWith('apps/office/src/')&&!p.includes('.test.'));
for(const path of paths){const local=path.replace('apps/office/src/',''), suite=local.startsWith('sc/')?'calc':'shared';for(const kind of ['runtime','provenance']){const target=base+suite+'/'+kind+'/'+local+'.json';if(!fs.existsSync(target))throw Error(target);const d=JSON.parse(fs.readFileSync(target,'utf8')),r=d.record;if(kind==='runtime'){r.semantic.justification+=' '+note;r.semantic.evidence.push('apps/office/src/sc/source/core/data/rowheight.test.ts');}else{(r.preservedResponsibilities??r.responsibilities).push(note);r.evidence.local.push({path:'apps/office/src/sc/source/core/data/rowheight.test.ts',marker:'retains source 256-twip minimum'});}fs.writeFileSync(target,JSON.stringify(d,null,2)+'\n');}}
