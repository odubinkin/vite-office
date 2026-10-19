import fs from 'node:fs';
import cp from 'node:child_process';
const root='docs/program/registry/', capId='CAP-c13ec941-1af7-4a09-810f-df267da27388';
const baselineCommit='9bc445578031fecf56086729d8e4940c77e14d65', baselineTag='libreoffice-26.8.0.2';
const note='Task1KGJBF connects native Calc Bold/Italic/Underline slots through the actual shared Writer command controls to real script-specific weight/posture and underline items,selection state,attribute undo and cell painting. Shared xmloff weight/posture/underline/color handlers retain actual Any,source maps,failed conversion,merge order and consumed unit-converter contracts. Writer text filters now preserve native independent script scalars,font metadata and exact underline style/color instead of browser booleans;automatic-style keys include every represented field,and insertion fragments retain actual native items. Original Writer underline-color ContextFilter suppression is retained. Shared literal underline Worker transport preserves style and packed alpha/color using the real pool;unported complex interface state rejects rather than silently flattening. Native source full constructors,UNO property-set/service/factory graph,complex color XML/Worker transport,rich-text editing,script/device layout,named Calc styles and complete UI/filter parity remain unverified. Source-based managed tests are not a compiled native parity certificate;intentional browser primary-save/open/no-recovery policy remains. Verification is in progress;no broad parity flags are promoted.';
const limitations=['Full Calc font-family/style actions,rich-text UI,named cell-style inheritance and other formatting actions remain pending.','Full script/device rendering,rich/wrapped/rotated/merged layout and native dialogs remain unported.','Full UNO property-set/handler factory graph,complex color XML and Worker state and complete ODF filters remain unverified;unsupported complex Worker values reject instead of losing fields.','Browser filters use a bounded native-value handoff;this is not a full native UNO property-set provider. Source and managed evidence do not certify compiled native or broad module parity.'];
const write=(path,value)=>{fs.mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});fs.writeFileSync(path,JSON.stringify(value,null,2)+'\n');};
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const cap=read(root+'calc/capabilities/CAP-1c4b358a-d58f-4cb3-bd8a-a4aac3aa3bf5.json');
Object.assign(cap.record,{id:capId,capabilityId:capId,capability:'Calc native character-format controls and shared lossless represented ODF attributes',atomicOperation:'calc-character-format-ui',assertions:[note],gaps:limitations,scopeLimitations:limitations,implemented:true,contractParity:false,behaviorParity:false,defaultParity:false,verified:false});
cap.record.upstream={implementation:[{path:'vendor/libreoffice-reference/sc/source/ui/view/formatsh.cxx',marker:'ScFormatShell::ExecuteAttr'},{path:'vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx',marker:'aXMLTextPropMap'}],tests:[{path:'vendor/libreoffice-reference/sc/qa/uitest/calc_tests3/clearCells.py',marker:'.uno:Bold'}],docs:[{path:'vendor/libreoffice-reference/xmloff/source/style/weighhdl.cxx',marker:'XMLFontWeightPropHdl::importXML'}]};
cap.record.local={implementation:[{path:'apps/office/src/sc/source/ui/view/formatsh.ts',marker:'SetCharacterFormat'},{path:'apps/office/src/xmloff/source/text/txtprmap.ts',marker:'importTextCharacterProperties'}],tests:[{path:'apps/office/src/sc/browser/presentation/calc-character-format.test.tsx',marker:'uses the shared controls'},{path:'apps/office/src/sw/source/filter/xml/odt-native-character-values.test.ts',marker:'preserves independent script weights'}],docs:[{path:'docs/program/calc-ui-readiness.md',marker:'Current UI delivery priority'}]};
write(root+'calc/capabilities/'+capId+'.json',cap);
const oldCapPath=root+'calc/capabilities/CAP-1c4b358a-d58f-4cb3-bd8a-a4aac3aa3bf5.json', oldCap=read(oldCapPath);oldCap.record.scopeLimitations=oldCap.record.gaps;write(oldCapPath,oldCap);
const additions=[
 ['sc/source/filter/xml/xmlstyle.ts','sc/source/filter/xml/xmlstyle.cxx',['exportCellTextProperties','importCellTextProperties','cellTextWhichIds'],['aXMLScCellStylesProperties']],
 ['xmloff/source/style/weighhdl.ts','xmloff/source/style/weighhdl.cxx',['XMLFontWeightPropHdl'],['XMLFontWeightPropHdl']],
 ['xmloff/source/style/postuhdl.ts','xmloff/source/style/postuhdl.cxx',['XMLPosturePropHdl'],['XMLPosturePropHdl']],
 ['xmloff/source/style/undlihdl.ts','xmloff/source/style/undlihdl.cxx',['XMLUnderlineTypePropHdl','XMLUnderlineStylePropHdl','XMLUnderlineWidthPropHdl'],['XMLUnderlineTypePropHdl','XMLUnderlineStylePropHdl','XMLUnderlineWidthPropHdl']],
 ['xmloff/source/style/xmlbahdl.ts','xmloff/source/style/xmlbahdl.cxx',['XMLColorTransparentPropHdl','XMLIsTransparentPropHdl'],['XMLColorTransparentPropHdl','XMLIsTransparentPropHdl']],
 ['xmloff/source/text/txtprmap.ts','xmloff/source/text/txtprmap.cxx',['exportTextCharacterProperties','importTextCharacterProperties','textCharacterPropertyTokens'],['aXMLTextPropMap']],
 ['offapi/com/sun/star/awt/FontUnderline.ts','offapi/com/sun/star/awt/FontUnderline.idl',['FontUnderline'],['FontUnderline','BOLDDASHDOTDOT']],
 ['o3tl/inc/numeric.ts','include/o3tl/numeric.hxx',['convertToHex'],['convertToHex']],
];
for(const [path,upstream,symbols,upstreamSymbols] of additions){
 const suite=path.startsWith('sc/')?'calc':'shared', localPath='apps/office/src/'+path;
 write(root+suite+'/runtime/'+path+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'upstream-mechanism',state:'foundation',suite,subsystem:'native-character-properties',capabilityIds:[capId],semantic:{behaviorStatus:'unverified',contractStatus:'unverified',defaultStatus:'unverified',divergenceClass:'B',evidence:[localPath,'apps/office/src/sc/browser/presentation/calc-character-format.test.tsx','apps/office/src/sw/source/filter/xml/odt-native-character-values.test.ts'],justification:note,knownViolations:[],localSymbols:symbols,sourceResponsibility:'unverified',upstreamFile:upstream,upstreamSymbols}}});
 write(root+suite+'/provenance/'+path+'.json',{baselineCommit,baselineTag,record:{classification:'upstream-mechanism',status:'mapped',localPath,upstreamPath:upstream,localSymbols:symbols,upstreamSymbols,preservedResponsibilities:[note],omittedResponsibilities:limitations,evidence:{local:[{path:localPath,marker:symbols[0]}],upstream:[{path:'vendor/libreoffice-reference/'+upstream,marker:upstreamSymbols[0]}]}}});
}
const codec='editeng/browser/text-line-item-codec.ts', localPath='apps/office/src/'+codec;
write(root+'shared/runtime/'+codec+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'local-infrastructure',state:'active',suite:'shared',subsystem:'worker-transport',capabilityIds:[capId],semantic:{behaviorStatus:'not-applicable',contractStatus:'not-applicable',defaultStatus:'not-applicable',divergenceClass:'B',evidence:[localPath,localPath.replace('.ts','.test.ts')],justification:note,knownViolations:[],localSymbols:['encodeTextLineItem','decodeTextLineItem'],sourceResponsibility:'browser-owned',upstreamFile:null,upstreamSymbols:[]}}});
write(root+'shared/provenance/'+codec+'.json',{baselineCommit,baselineTag,record:{classification:'local-infrastructure',status:'local-only',localPath,rationale:'Shared structured-clone binding for actual native underline style and packed Color;no core JSON persistence API or alternate document model.',responsibilities:[note],stackDivergence:{kind:'local-infrastructure',rationale:'Dedicated Worker transport requires cloneable values;actual item factories remain native model owners.'},evidence:{local:[{path:localPath,marker:'encodeTextLineItem'},{path:localPath.replace('.ts','.test.ts'),marker:'transfers full represented style'}]}}});
const paths=cp.execFileSync('git',['diff','--name-only','--','apps/office/src'],{encoding:'utf8'}).trim().split('\n').filter(path=>path&&!path.includes('.test.')&&!path.endsWith('.json'));
for(const full of paths){
 const path=full.replace('apps/office/src/',''),suite=path.startsWith('sc/')?'calc':path.startsWith('sw/')?'writer':'shared';
 if(additions.some(entry=>entry[0]===path)||path===codec)continue;
 const rp=root+suite+'/runtime/'+path+'.json', pp=root+suite+'/provenance/'+path+'.json';
 if(!fs.existsSync(rp)||!fs.existsSync(pp))throw Error('Missing previous canonical record '+path);
 const runtime=read(rp), provenance=read(pp), rr=runtime.record, pr=provenance.record;
 if(!rr.capabilityIds.includes(capId))rr.capabilityIds.push(capId);
 if(!rr.semantic.justification.includes('Task1KGJBF'))rr.semantic.justification+=' '+note;
 const refs=['apps/office/src/sc/browser/presentation/calc-character-format.test.tsx','apps/office/src/sw/source/filter/xml/odt-native-character-values.test.ts'];
 for(const ref of refs)if(!rr.semantic.evidence.includes(ref))rr.semantic.evidence.push(ref);
 const responsibilities=pr.preservedResponsibilities??pr.responsibilities;
 if(!responsibilities.some(text=>text.includes('Task1KGJBF')))responsibilities.push(note);
 for(const ref of refs)if(!pr.evidence.local.some(entry=>entry.path===ref))pr.evidence.local.push({path:ref,marker:'@fileoverview'});
 if(path==='sw/source/filter/xml/xmlexp.ts')for(const symbol of ['getCharacterProperties','projectXmlTextRuns']){
   if(!rr.semantic.localSymbols.includes(symbol))rr.semantic.localSymbols.push(symbol);
   if(pr.localSymbols&&!pr.localSymbols.includes(symbol))pr.localSymbols.push(symbol);
 }
 write(rp,runtime);write(pp,provenance);
}
console.log('Registered native character owners and shared Worker binding; broad parity flags unchanged.');
