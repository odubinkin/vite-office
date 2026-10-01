from pathlib import Path
import json
summary='Iteration45 restores native SwNumFormat.IsItemize (CHAR_SPECIAL/BITMAP) and IsEnumeration (!IsItemize, including NONE), and actual SwTextNode HasNumber/HasBullet use of the bounded effective const format. The distinct ndtxt.cxx layout-update predicate reads raw owned GetNumFormat and rejects absent/NONE/CHAR_SPECIAL/BITMAP formats. Native source bodies plus actual native rule constructor/Get/GetNumFormat/Set/default profile execute1032 cases under ASan/UBSan:4 format classifications/copies,1008 node/ownership/count/registry profiles,4 root/phantom cases and16 registry masks. Real local document/record/registry methods match the literal results; diagnostic record, bounded actual-level, counted/phantom, null-layout, ordered-container and platform/font/graphics aliases are named. Scalar bitmap classification is not bitmap rendering or wider formatting support. Native full layout/redline/graphics/style/font/service/global lifetimes and full counter algorithm profiles remain individually unverified. Existing Worker16 classification/ownership survives for ARABIC/NONE/CHAR_SPECIAL; original numbering/UNO/ODT/browser assertions and the measured malformed-NONE browser guard are preserved. No module/status or goal promotion and no registered I/O/recovery deviation changes.'
paths={'apps/office/src/sw/source/core/doc/number.ts','apps/office/src/sw/source/core/txtnode/ndtxt.ts','apps/office/src/sw/source/core/txtnode/ndtxt-attribute-handlers.ts','apps/office/src/sw/source/core/SwNumberTree/SwNodeNum.ts','apps/office/src/sw/source/core/doc/DocumentListItemsManager.ts'}
test='apps/office/src/sw/source/core/txtnode/number-classification.test.ts'
markers=['matches native format enumeration itemize copy and type-change predicates','matches all native effective classification raw-layout counting and registry profiles','matches native root phantom and counted numbered-registry filtering','retains existing supported classifications and sparse ownership through Worker16']
p=Path('docs/program/source-provenance.json');data=json.loads(p.read_text())
for e in data['entries']:
 if e['localPath'] not in paths:continue
 e['preservedResponsibilities'].append(summary)
 e['evidence']['local'].extend({'path':test,'marker':m} for m in markers)
 if e['localPath'].endswith('/number.ts'):
  e['upstreamSymbols'].extend(['SwNumFormat::IsEnumeration','SwNumFormat::IsItemize'])
  e['evidence']['upstream'].extend({'path':'vendor/libreoffice-reference/sw/source/core/doc/number.cxx','marker':m} for m in ['SwNumFormat::IsEnumeration','SwNumFormat::IsItemize'])
 if e['localPath'].endswith('/ndtxt-attribute-handlers.ts'):
  if 'HasNumberingWhichNeedsLayoutUpdate' not in e['upstreamSymbols']:e['upstreamSymbols'].append('HasNumberingWhichNeedsLayoutUpdate')
  e['evidence']['upstream'].append({'path':'vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx','marker':'bool HasNumberingWhichNeedsLayoutUpdate(const SwTextNode& rTextNode)'})
p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
p=Path('docs/program/parity/runtime-inventory.json');data=json.loads(p.read_text())
for e in data['modules']:
 if e['path'] not in paths:continue
 s=e['semantic'];s['justification']+=' '+summary;s['evidence'].extend(test+'#'+m for m in markers)
 if e['path'].endswith('/number.ts'):s['upstreamSymbols'].extend(['SwNumFormat::IsEnumeration','SwNumFormat::IsItemize'])
p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
