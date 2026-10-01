from pathlib import Path
import json
summary='Iteration46 restores the native pointer Set overload as explicit JS SetByPointer, distinct from reference Set replacement. Mutable owned SwNumFormat values and cached protected JS const views retain identity/live reads on pointer assignment; null resets the owned slot and restores the exact shared default. Source-owned base/Writer Assign copies every implemented raw marker/position/type/show/optional-family-Font field without ListFormat regeneration and transfers same-modify registration; copy construction preserves that source registration. Complete unchanged pinned pointer/ref Set,assignment/copy/rule-get/default and same-modify bodies emit639 profiles under ASan/UBSan:600 mixed traces,8 sparse defaults,23 assignment/self-alias profiles,6 actual registration recipient counts and2 format registration states. Exact hashes and prior full native format/default profile retained; named native SwModify Add/Remove container,invalid-flag,platform/family-only Font/COW/graphics/style/service aliases explicitly bound the proof. Original source-native ref/classification assertions remain intact. Actual document-owned rule,Worker16 and supported genuine ODT export/reopen fields are checked; native const view is a JS boundary and retained detached JS reads do not certify native deleted-pointer/destructor/global lifetime. Native complete Font/graphics/legal/style/layout/redline/UNO/service/global/client destruction and wider families remain individually unverified. No module/status/goal promotion,policy/dependency/coverage weakening or registered IO/recovery change.'
paths={'apps/office/src/sw/source/core/doc/number.ts','apps/office/src/editeng/source/items/numitem.ts','apps/office/src/sw/inc/calbck.ts'}
test='apps/office/src/sw/source/core/doc/number-pointer.test.ts'
markers=['matches native pointer and reference Set identity validity and every implemented field','matches native absent pointer defaults and protects stable const references','matches native base Writer assignment self alias and optional font copies','matches native same modify assignment copy and detach responsibilities','keeps pointer assigned live rule reads and sparse ownership through actual document and Worker paths']
extra={
'apps/office/src/sw/source/core/doc/number.ts':('vendor/libreoffice-reference/sw/source/core/doc/number.cxx',['void SwNumRule::Set( sal_uInt16 i, const SwNumFormat*','SwNumFormat& SwNumFormat::operator=']),
'apps/office/src/editeng/source/items/numitem.ts':('vendor/libreoffice-reference/editeng/source/items/numitem.cxx',['SvxNumberFormat& SvxNumberFormat::operator=']),
'apps/office/src/sw/inc/calbck.ts':('vendor/libreoffice-reference/sw/source/core/attr/calbck.cxx',['void sw::ClientBase<T>::StartListeningToSameModifyAs'])}
p=Path('docs/program/source-provenance.json');data=json.loads(p.read_text())
for e in data['entries']:
 if e['localPath'] not in paths:continue
 e['preservedResponsibilities'].append(summary);e['evidence']['local'].extend({'path':test,'marker':m} for m in markers)
 path,symbols=extra[e['localPath']]
 for symbol in symbols:
  if symbol not in e['upstreamSymbols']:e['upstreamSymbols'].append(symbol)
  e['evidence']['upstream'].append({'path':path,'marker':symbol})
p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
p=Path('docs/program/parity/runtime-inventory.json');data=json.loads(p.read_text())
for e in data['modules']:
 if e['path'] not in paths:continue
 s=e['semantic'];s['justification']+=' '+summary;s['evidence'].extend(test+'#'+m for m in markers)
 for symbol in extra[e['path']][1]:
  if symbol not in s['upstreamSymbols']:s['upstreamSymbols'].append(symbol)
p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
