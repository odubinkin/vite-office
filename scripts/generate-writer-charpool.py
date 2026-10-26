#!/usr/bin/env python3
"""Extract pinned Writer character pool programmatic and English UI names."""
import json
import pathlib
import re
ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = ROOT / 'vendor/libreoffice-reference'
mapper = (REF / 'sw/source/core/doc/SwStyleNameMapper.cxx').read_text()
pool = (REF / 'sw/source/core/doc/DocumentStylePoolManager.cxx').read_text()
strings = (REF / 'sw/inc/strings.hrc').read_text()
resources = dict(re.findall(r'#define\s+(STR_POOLCHR_\w+)\s+NC_\("[^"]+",\s*"([^"]+)"\)', strings))
entries = []
for method, table, base in [('GetChrFormatProgNameArray','STR_POOLCHR_ARY',1024),('GetHTMLChrFormatProgNameArray','STR_POOLCHR_HTML_ARY',1074)]:
    body = mapper.split('SwStyleNameMapper::' + method + '()',1)[1].split('};',1)[0]
    names = re.findall(r'u"([^"\n]+)"_ustr',body)
    keys = re.findall(r'\bSTR_POOLCHR_\w+\b',pool.split(table+'[]',1)[1].split('};',1)[0])
    assert len(names) == len(keys)
    entries += [{'poolId':base+i,'name':name,'uiName':resources[key]} for i,(name,key) in enumerate(zip(names,keys))]
output=ROOT/'apps/office/src/sw/inc/charpool-data.json'
output.write_text(json.dumps(entries,indent=2)+'\n')
print('Generated',len(entries),'native character pool names')
