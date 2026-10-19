/** @fileoverview Registers bounded Calc/shared color owners without promoting whole-module parity. */
import fs from 'node:fs';
import cp from 'node:child_process';
const root='docs/program/registry/',capId='CAP-7206d1b8-82a8-4f0a-91c5-ae26cb0251d4',baselineCommit='9bc445578031fecf56086729d8e4940c77e14d65',baselineTag='libreoffice-26.8.0.2';
const note='Task9SF7RJ connects actual shared Writer/SVX color palettes to Calc color10017/background10186 commands,real native color/brush items and sparse selection/history. SfxObjectShell owns recent NamedColor copies and original ColorsChanged notifications;Calc uses that same broadcaster identity. The native broadcaster role is consumed without claiming the unported full SfxShell command/lifecycle class. Original toolbox defaults and names are retained at the browser binding. Native pool defaults continue contiguously through background148,including source system-following number-format language. Actual ODS uses text color/automatic and table-cell background/transparency property groups over shared handlers. Current task acceptance remains pending;no broad parity flags are promoted.';
const limitations=['Full native SfxShell lifecycle/command architecture,global palette preferences/device colors and complete Writer/Calc UI parity remain unverified.','Theme/complex-color ODF extensions,graphic brushes,full named-style inheritance and rich cell painting remain outside this bounded RGB/automatic/transparent UI slice;unported imported scopes are diagnosed.','Browser palette/window composition retains the established Writer React/Tailwind binding;it is not a native weld popup implementation.'];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
const cap=read(root+'calc/capabilities/CAP-dc45e9eb-2c4d-4d11-8e1d-3fd33dcce681.json');
Object.assign(cap.record,{id:capId,capabilityId:capId,capability:'Calc font and cell-background colors through shared native palette contracts',atomicOperation:'calc-cell-colors-ui',assertions:[note],gaps:limitations,scopeLimitations:limitations,implemented:true,contractParity:false,behaviorParity:false,defaultParity:false,verified:false});
cap.record.upstream={implementation:[{path:'vendor/libreoffice-reference/sc/source/ui/view/formatsh.cxx',marker:'SID_BACKGROUND_COLOR'},{path:'vendor/libreoffice-reference/sfx2/source/doc/objcont.cxx',marker:'SfxObjectShell::GetRecentColor'}],tests:[{path:'vendor/libreoffice-reference/sc/qa/uitest/calc_tests7/tdf117987_background_color_in_another_cell.py',marker:'.uno:BackgroundColor'}],docs:[{path:'vendor/libreoffice-reference/include/sfx2/namedcolor.hxx',marker:'NamedColor'}]};
cap.record.local={implementation:[{path:'apps/office/src/sc/source/ui/view/formatsh.ts',marker:'SetColor'},{path:'apps/office/src/sc/source/filter/xml/xmlstyle.ts',marker:'exportCellProperties'}],tests:[{path:'apps/office/src/sc/browser/presentation/calc-color.test.tsx',marker:'uses the actual shared palette'},{path:'apps/office/src/sc/source/filter/xml/ods-native-colors.test.ts',marker:'writes original text'}],docs:[{path:'.agentplane/tasks/202610191952-9SF7RJ/README.md',marker:'Findings'}]};
write(root+'calc/capabilities/'+capId+'.json',cap);
const native=[['sfx2/inc/namedcolor.ts','include/sfx2/namedcolor.hxx',['NamedColor'],['NamedColor','getComplexColor']],['svx/inc/xdef.ts','include/svx/xdef.hxx',['COL_DEFAULT_FONT','COL_DEFAULT_HIGHLIGHT'],['COL_DEFAULT_FONT','COL_DEFAULT_HIGHLIGHT']]];
for(const[path,upstream,symbols,upstreamSymbols]of native){const localPath='apps/office/src/'+path;
 write(root+'shared/runtime/'+path+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'upstream-mechanism',state:'foundation',suite:'shared',subsystem:'native-color-values',capabilityIds:[capId],semantic:{behaviorStatus:'unverified',contractStatus:'unverified',defaultStatus:'unverified',divergenceClass:'B',evidence:[localPath],justification:note,knownViolations:[],localSymbols:symbols,sourceResponsibility:'unverified',upstreamFile:upstream,upstreamSymbols}}});
 write(root+'shared/provenance/'+path+'.json',{baselineCommit,baselineTag,record:{classification:'upstream-mechanism',status:'mapped',localPath,upstreamPath:upstream,localSymbols:symbols,upstreamSymbols,preservedResponsibilities:[note],omittedResponsibilities:limitations,evidence:{local:[{path:localPath,marker:symbols[0]}],upstream:[{path:'vendor/libreoffice-reference/'+upstream,marker:upstreamSymbols[0]}]}}});
}
const browser=[['svx/browser/tbxctrls/ColorControl.tsx',['ColorControl']],['svx/browser/tbxctrls/ColorSelect.tsx',['ColorSelect','createBrowserColorItem']],['vcl/browser/color.ts',['browserColor']]];
for(const[path,symbols]of browser){const localPath='apps/office/src/'+path;
 write(root+'shared/runtime/'+path+'.json',{baselineCommit,baselineTag,record:{path:localPath,classification:'browser-adaptation',state:'active',suite:'shared',subsystem:'browser-color-controls',capabilityIds:[capId],semantic:{behaviorStatus:'unverified',contractStatus:'not-applicable',defaultStatus:'not-applicable',divergenceClass:'B',evidence:[localPath],justification:note,knownViolations:[],localSymbols:symbols,sourceResponsibility:'browser-owned',upstreamFile:null,upstreamSymbols:[]}}});
 write(root+'shared/provenance/'+path+'.json',{baselineCommit,baselineTag,record:{classification:'browser-adaptation',status:'local-only',localPath,rationale:'Shared actual Writer browser palette and CSS binding to native color/recent-value owners.',responsibilities:[note],stackDivergence:{kind:'browser-adaptation',rationale:'React/DOM replace native toolbox/popup painting while native values and document ownership are retained.'},evidence:{local:[{path:localPath,marker:symbols[0]}]}}});
}
const added=new Set([...native,...browser].map(e=>e[0]));
const paths=cp.execFileSync('git',['diff','--name-only','--','apps/office/src'],{encoding:'utf8'}).trim().split('\n').filter(p=>p&&!p.includes('.test.')&&/\.(ts|tsx)$/.test(p));
for(const full of paths){const path=full.replace('apps/office/src/','');if(added.has(path))continue;
 const suite=path.startsWith('sc/')?'calc':path.startsWith('sw/')?'writer':'shared',rp=root+suite+'/runtime/'+path+'.json',pp=root+suite+'/provenance/'+path+'.json';
 if(!fs.existsSync(rp)||!fs.existsSync(pp))throw Error('Missing canonical owner '+path);
 const runtime=read(rp),provenance=read(pp),r=runtime.record,p=provenance.record;
 if(!r.capabilityIds.includes(capId))r.capabilityIds.push(capId);
 if(!r.semantic.justification.includes('Task9SF7RJ'))r.semantic.justification+=' '+note;
 const responsibilities=p.preservedResponsibilities??p.responsibilities;
 if(!responsibilities.some(t=>t.includes('Task9SF7RJ')))responsibilities.push(note);
 if(path==='sw/browser/presentation/WriterColorControl.tsx'){r.semantic.localSymbols=[];p.rationale='Public Writer export only;actual ColorControl implementation and resource ownership live in shared SVX.';}
 for(const symbol of path==='xmloff/source/style/xmlbahdl.ts'?['XMLColorAutoPropHdl','XMLIsAutoColorPropHdl']:path==='sfx2/source/doc/objsh.ts'?['GetRecentColor','SetRecentColor']:[]){if(!r.semantic.localSymbols.includes(symbol))r.semantic.localSymbols.push(symbol);if(p.localSymbols&&!p.localSymbols.includes(symbol))p.localSymbols.push(symbol);}
 write(rp,runtime);write(pp,provenance);
}
console.log(JSON.stringify({capId,newNative:native.length,newBrowser:browser.length,acceptance:'pending'}));
