/** @fileoverview Registers bounded font UI/native-script owners without promoting whole-module parity. */
import fs from 'node:fs';
import cp from 'node:child_process';
const root='docs/program/registry/';
const capId='CAP-dc45e9eb-2c4d-4d11-8e1d-3fd33dcce681';
const baselineCommit='9bc445578031fecf56086729d8e4940c77e14d65',baselineTag='libreoffice-26.8.0.2';
const note='Task6PMYVV connects the actual shared Writer FontNameSelect to native Calc CharFontName10007,complete SvxFontItem values,source script selection,actual pattern/history owners and real ODS font declarations. Pinned ICU78.3 property data and original consumed scalar algorithms match compiled original block/script/editing-class observations for every Unicode codepoint. The compiled witness uses an explicitly constrained SCRIPT dispatcher bootstrap;it is not a full ICU or LibreOffice service certificate. Source BreakIterator script runs retain the initial-NUL cache quirk. The browser binds its current plain-cell display to the consumed XBreakIterator script port and GetStringScriptType loop;it does not emulate native formatted-cell caches or the UNO factory. Shared selection carries all five font fields. Writer family operations,caret item queries and pending items preserve native items instead of flattening them through browser projections. Actual ODS pools/contexts retain independent script fonts and optional styles.xml declarations. Task37 verification covers only the documented font UI/native-item slice;no broad parity flags are promoted.';
const limitations=['Full native formatted-cell script cache,UNO/service factory graph,device metrics and rich/wrapped/rotated/merged layout remain unported.','Browser Local Font Access supplies names rather than native metric classifications;native missing-metric defaults and known symbol-recode availability are retained without guessing.','Full Writer SetAttr/rich script command behavior and complete native document/filter/UI parity remain unverified;the family path fixes represented native item loss.','Calc named-style inheritance,embedded font resources and the complete shared paragraph property mapper remain unported;unsupported values are diagnosed.','Full document/layout/UI and named-style parity remain unverified beyond the consumed font slice.'];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const cap=read(root+'calc/capabilities/CAP-1c4b358a-d58f-4cb3-bd8a-a4aac3aa3bf5.json');
Object.assign(cap.record,{id:capId,capabilityId:capId,capability:'Calc native font-family control and lossless shared font values',atomicOperation:'calc-font-family-ui',assertions:[note],gaps:limitations,scopeLimitations:limitations,implemented:true,contractParity:false,behaviorParity:false,defaultParity:false,verified:false});
cap.record.upstream={implementation:[{path:'vendor/libreoffice-reference/sc/source/ui/view/formatsh.cxx',marker:'GetSelectionScriptType'},{path:'vendor/libreoffice-reference/sc/source/filter/xml/xmlfonte.cxx',marker:'ScXMLFontAutoStylePool_Impl'}],tests:[{path:'vendor/libreoffice-reference/sc/qa/uitest/calc_tests3/clearCells.py',marker:'.uno:Bold'}],docs:[{path:'vendor/libreoffice-reference/i18nutil/source/utility/scriptclass.cxx',marker:'GetScriptClass'}]};
cap.record.local={implementation:[{path:'apps/office/src/sc/source/ui/view/formatsh.ts',marker:'SetFontFamily'},{path:'apps/office/src/sc/source/filter/xml/xmlstyle.ts',marker:'exportCellTextProperties'}],tests:[{path:'apps/office/src/sc/browser/presentation/calc-font-family.test.tsx',marker:'dispatches the actual shared family selector'},{path:'apps/office/src/sw/source/uibase/wrtsh/native-font-selection.test.ts',marker:'applies complete toolbox metadata'}],docs:[{path:'.agentplane/tasks/202610191738-6PMYVV/README.md',marker:'Findings'}]};
write(root+'calc/capabilities/'+capId+'.json',cap);
const native=[
 ['external/icu/source/common/uchar.ts','vendor/icu-reference/source/common/uchar.cpp',['u_getUnicodeProperties','uscript_getScript','ublock_getCode'],['u_getUnicodeProperties','uscript_getScript','ublock_getCode']],
 ['external/icu/source/common/uchar_props_data.ts','vendor/icu-reference/source/common/uchar_props_data.h',['propsVectorsTrie','propsVectors','scriptExtensions','block_trie'],['propsVectorsTrie','propsVectors','scriptExtensions','block_trie']],
 ['external/icu/source/common/ucptrie.ts','vendor/icu-reference/source/common/ucptrie.cpp',['ucptrie_internalSmallIndex','_UCPTRIE_CP_INDEX','ucptrie_get'],['ucptrie_internalSmallIndex','ucptrie_get']],
 ['external/icu/source/common/unicode/ucptrie.ts','vendor/icu-reference/source/common/unicode/ucptrie.h',['UCPTrie','UCPTrieType','UCPTrieValueWidth'],['UCPTrie','UCPTrieType','UCPTrieValueWidth']],
 ['external/icu/source/common/unicode/uscript.ts','vendor/icu-reference/source/common/unicode/uscript.h',['UScriptCode'],['UScriptCode']],
 ['external/icu/source/common/uprops.ts','vendor/icu-reference/source/common/uprops.cpp',['u_getIntPropertyValue'],['u_getIntPropertyValue']],
 ['i18npool/source/breakiterator/breakiteratorImpl.ts','vendor/libreoffice-reference/i18npool/source/breakiterator/breakiteratorImpl.cxx',['BreakIteratorImpl'],['getScriptClass','getScriptType','endOfScript']],
 ['i18nutil/source/utility/scriptclass.ts','vendor/libreoffice-reference/i18nutil/source/utility/scriptclass.cxx',['GetScriptClass','getCompatibilityScriptClassByBlock'],['GetScriptClass','getCompatibilityScriptClassByBlock']],
 ['i18nutil/source/utility/unicode.ts','vendor/libreoffice-reference/i18nutil/source/utility/unicode.cxx',['unicode'],['getScriptClassFromUScriptCode']],
 ['offapi/com/sun/star/i18n/ScriptType.ts','vendor/libreoffice-reference/offapi/com/sun/star/i18n/ScriptType.idl',['WEAK','LATIN','ASIAN','COMPLEX'],['WEAK','LATIN','ASIAN','COMPLEX']],
 ['offapi/com/sun/star/i18n/XBreakIterator.ts','vendor/libreoffice-reference/offapi/com/sun/star/i18n/XBreakIterator.idl',['XBreakIterator'],['XBreakIterator','getScriptType','endOfScript']],
 ['sc/source/core/data/documen6.ts','vendor/libreoffice-reference/sc/source/core/data/documen6.cxx',['GetStringScriptType'],['GetStringScriptType']],
 ['sw/source/core/txtnode/ndhints-font.ts','vendor/libreoffice-reference/sw/source/core/txtnode/thints.cxx',['setFontItem','setCharacterItems','createCharacterFormatItems','createFontHeightItems','createCharacterColorItems'],['SwTextNode::SetAttr','SwpHints::TryInsertHint']],
];
for(const [path,upstream,symbols,upstreamSymbols] of native){
 const suite=path.startsWith('sc/')?'calc':path.startsWith('sw/')?'writer':'shared',localPath='apps/office/src/'+path;
 write(root+suite+'/runtime/'+path+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'upstream-mechanism',state:'foundation',suite,subsystem:'font-script-attributes',capabilityIds:[capId],semantic:{behaviorStatus:'unverified',contractStatus:'unverified',defaultStatus:'unverified',divergenceClass:'B',evidence:[localPath,'apps/office/src/sc/browser/presentation/calc-font-family.test.tsx'],justification:note,knownViolations:[],localSymbols:symbols,sourceResponsibility:'unverified',upstreamFile:upstream,upstreamSymbols}}});
 write(root+suite+'/provenance/'+path+'.json',{baselineCommit,baselineTag,record:{classification:'upstream-mechanism',status:'mapped',localPath,upstreamPath:upstream,localSymbols:symbols,upstreamSymbols,preservedResponsibilities:[note],omittedResponsibilities:limitations,evidence:{local:[{path:localPath,marker:symbols[0]}],upstream:[{path:upstream,marker:upstreamSymbols[0]}]}}});
}
const browser=[['vcl/browser/font-family.ts',['browserFontFamily']],['sc/browser/controller/calc-selection-script.ts',['getCalcSelectionScriptType']],['sc/browser/presentation/ScCellText.tsx',['ScCellText']],['svx/browser/tbxctrls/font-item.ts',['createBrowserFontItem']]];
for(const [path,symbols] of browser){const suite=path.startsWith('sc/')?'calc':'shared',localPath='apps/office/src/'+path;
 write(root+suite+'/runtime/'+path+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'browser-adaptation',state:'active',suite,subsystem:'browser-presentation',capabilityIds:[capId],semantic:{behaviorStatus:'unverified',contractStatus:'not-applicable',defaultStatus:'not-applicable',divergenceClass:'B',evidence:[localPath],justification:note,knownViolations:[],localSymbols:symbols,sourceResponsibility:'browser-owned',upstreamFile:null,upstreamSymbols:[]}}});
 write(root+suite+'/provenance/'+path+'.json',{baselineCommit,baselineTag,record:{classification:'browser-adaptation',status:'local-only',localPath,rationale:'Browser composition binds actual native items and script-query producers at the existing plain-cell display boundary.',responsibilities:[note],stackDivergence:{kind:'browser-adaptation',rationale:'React/DOM replace native painting and toolbox controls;source data and attribute ownership remain native.'},evidence:{local:[{path:localPath,marker:symbols[0]}]}}});
}
const added=new Set([...native,...browser].map(e=>e[0]));
const paths=cp.execFileSync('git',['diff','--name-only','--','apps/office/src'],{encoding:'utf8'}).trim().split('\n').filter(p=>p&&!p.includes('.test.')&&!p.endsWith('.json'));
for(const full of paths){const path=full.replace('apps/office/src/','');if(added.has(path))continue;
 const suite=path.startsWith('sc/')?'calc':path.startsWith('sw/')?'writer':'shared',rp=root+suite+'/runtime/'+path+'.json',pp=root+suite+'/provenance/'+path+'.json';
 if(!fs.existsSync(rp)||!fs.existsSync(pp))throw Error('Missing canonical owner '+path);
 const runtime=read(rp),provenance=read(pp),rr=runtime.record,pr=provenance.record;
 if(!rr.capabilityIds.includes(capId))rr.capabilityIds.push(capId);
 if(!rr.semantic.justification.includes('Task6PMYVV'))rr.semantic.justification+=' '+note;
 const responsibilities=pr.preservedResponsibilities??pr.responsibilities;
 if(!responsibilities.some(t=>t.includes('Task6PMYVV')))responsibilities.push(note);
 if(path==='external/icu/source/common/unicode/uchar.ts')for(const symbol of ['UBlockCode','UProperty']){
  if(!rr.semantic.localSymbols.includes(symbol))rr.semantic.localSymbols.push(symbol);
  if(pr.localSymbols&&!pr.localSymbols.includes(symbol))pr.localSymbols.push(symbol);
 }
 write(rp,runtime);write(pp,provenance);
}
console.log(JSON.stringify({capId,newNative:native.length,newBrowser:browser.length,verification:'pending'}));

const fp=root+"writer/provenance/sw/source/core/txtnode/ndhints-font.ts.json"; const f=read(fp); f.record.filenameDivergence={stackNecessity:"responsibility-split",localPath:f.record.localPath,rationale:"Keeps the bounded family-delta item-set operation separate from native hint maps under the source-size ceiling;its upstream responsibility belongs to thints.cxx SetAttr/TryInsertHint."}; write(fp,f);
