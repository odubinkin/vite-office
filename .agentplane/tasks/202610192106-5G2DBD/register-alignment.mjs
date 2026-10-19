/** @fileoverview Registers bounded native Calc alignment owners and shared dynamic command state without broad parity promotion. */
import fs from 'node:fs';import cp from 'node:child_process';
const root='docs/program/registry/',capId='CAP-0bb796a3-9483-445d-aef3-1deeb40f990a';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const note='Task5G2DBD connects original Calc horizontal/vertical toolbar toggles and explicit Format-menu pseudo slots to actual129/132 native items,uniform/mixed/default selection and attribute history. The actual common Writer toolbar/menu presentation now derives checkability from live boolean or mixed bindings as original Sfx toolbox state does,while keeping resource metadata. Real ODS paragraph/cell groups use original typed horizontal/source/repeat and signed32 vertical handlers with shared style-owned Any merging. Plain browser cell painting uses native alignment values;full native layout and service parity remain unverified. Task acceptance pending;no broad parity flags promoted.';
const limitations=['Full native Sfx request redispatch/lifecycle,rich/wrapped/bidirectional/rotation/repeated-content layout,device metrics and complete styles remain unported or unverified;no exact native ODF alignment test has been located or used as a certificate.','Original XML property handler contracts are consumed with actual Any and native items;this bounded mapper is not the complete original UNO property-set/import/export service graph.','Browser React/Tailwind toolbar and menu composition is shared with Writer;native widgets and pixel-identical VCL layout are not claimed.'];
const cap=read(root+'calc/capabilities/CAP-7206d1b8-82a8-4f0a-91c5-ae26cb0251d4.json');
Object.assign(cap.record,{id:capId,capabilityId:capId,capability:'Calc native horizontal and vertical alignment controls and ODS properties',atomicOperation:'calc-cell-alignment-ui',assertions:[note],gaps:limitations,scopeLimitations:limitations,implemented:true,contractParity:false,behaviorParity:false,defaultParity:false,verified:false});
cap.record.upstream={implementation:[{path:'vendor/libreoffice-reference/sc/source/ui/view/formatsh.cxx',marker:'ScFormatShell::ExecuteAlignment'},{path:'vendor/libreoffice-reference/sc/source/filter/xml/xmlstyle.cxx',marker:'XmlScPropHdl_HoriJustify::importXML'}],tests:[{path:'vendor/libreoffice-reference/sc/qa/uitest/calc_tests/formatCells.py',marker:'test_format_cell_alignment_tab'}],docs:[{path:'vendor/libreoffice-reference/include/editeng/justifyitem.hxx',marker:'SvxHorJustifyItem'}]};
cap.record.local={implementation:[{path:'apps/office/src/sc/source/ui/view/formatsh.ts',marker:'SetAlignment'},{path:'apps/office/src/sc/source/filter/xml/xmlstyle.ts',marker:'XmlScPropHdl_HoriJustify'}],tests:[{path:'apps/office/src/sc/browser/presentation/calc-alignment.test.tsx',marker:'reuses shared buttons'},{path:'apps/office/src/sc/source/filter/xml/ods-native-alignment.test.ts',marker:'writes original paragraph'}],docs:[{path:'.agentplane/tasks/202610192106-5G2DBD/README.md',marker:'Findings'}]};
write(root+'calc/capabilities/'+capId+'.json',cap);
const paths=cp.execFileSync('git',['diff','--name-only','--','apps/office/src'],{encoding:'utf8'}).trim().split('\n').filter(p=>p&&!p.includes('.test.')&&/\.(ts|tsx)$/.test(p));
for(const full of paths){const path=full.replace('apps/office/src/',''),suite=path.startsWith('sc/')?'calc':path.startsWith('sw/')?'writer':'shared';
 const rp=root+suite+'/runtime/'+path+'.json',pp=root+suite+'/provenance/'+path+'.json',runtime=read(rp),provenance=read(pp),r=runtime.record,p=provenance.record;
 if(!r.capabilityIds.includes(capId))r.capabilityIds.push(capId);
 if(!r.semantic.justification.includes('Task5G2DBD'))r.semantic.justification+=' '+note;
 const responsibilities=p.preservedResponsibilities??p.responsibilities;
 if(!responsibilities.some(t=>t.includes('Task5G2DBD')))responsibilities.push(note);
 if(path==='sc/source/filter/xml/xmlstyle.ts')for(const symbol of ['XmlScPropHdl_HoriJustify','XmlScPropHdl_HoriJustifySource','XmlScPropHdl_HoriJustifyRepeat','XmlScPropHdl_VertJustify']){
  if(!r.semantic.localSymbols.includes(symbol))r.semantic.localSymbols.push(symbol);
  if(!r.semantic.upstreamSymbols.includes(symbol))r.semantic.upstreamSymbols.push(symbol);
  if(p.localSymbols&&!p.localSymbols.includes(symbol))p.localSymbols.push(symbol);
  if(p.upstreamSymbols&&!p.upstreamSymbols.includes(symbol))p.upstreamSymbols.push(symbol);
 }
 write(rp,runtime);write(pp,provenance);
}
console.log(JSON.stringify({capId,changedProductionOwners:paths.length,acceptance:'pending'}));
