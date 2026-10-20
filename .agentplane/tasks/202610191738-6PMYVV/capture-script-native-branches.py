"""Observe original native script switch and raw frozen-trie getters on declared field fixtures."""
from pathlib import Path
import json,hashlib,subprocess
out=Path('output/playwright/task37-script-native');evidence=Path('.agentplane/tasks/202610191738-6PMYVV/evidence')
source=(out/'driver.cpp').read_text();prefix=source[:source.index('int main()')]
fixtures=[]
index=[[0,0],[1,64],[2,128],[1024,1100],[1100,1200],[1200,128]]
for width,values in [(0,[5,321,88,99]),(1,[0xabcdef01,0xfedcba98,4000000000,0xffffffff]),(2,[5,200,88,99])]:
 fixtures.append(dict(name='fast'+str(width),type=0,valueWidth=width,indexLength=1400,dataLength=256,highStart=0x20000,indexEntries=index,dataEntries=[[65,values[0]],[128,values[1]],[254,values[2]],[255,values[3]]],codePoints=[-1,0,65,128,0xffff,0x10000,0x10001,0x20000,0x10ffff,0x110000]))
fixtures.append(dict(name='small18',type=1,valueWidth=0,indexLength=1400,dataLength=0x40020,highStart=0x2000,indexEntries=[[0,0],[1,64],[2,128],[64,80],[88,0x8000|1000],[1000,0x4003],[1001,0x20],[1008,0x40],[1009,0x8000],[1010,0x50],[1027,1],[1035,0x60]],dataEntries=[[65,5],[65568,321],[196687,777],[131153,999],[65647,123],[0x4001e,88],[0x4001f,99]],codePoints=[-1,65,128,0x1000,0x107f,0x1081,0x11ff,0x2000,0x10ffff,0x110000]))
# Observe the original explicit fallback on malformed width;not valid binary construction.
fixtures.append(dict(name='invalidWidth',type=0,valueWidth=3,indexLength=1400,dataLength=256,highStart=0x20000,indexEntries=index,dataEntries=[],codePoints=[65,0x10000]))
cpp=prefix+'\n#include <vector>\nint main() {\n'
for fi,f in enumerate(fixtures):
 width=f['valueWidth'];typ={0:'uint16_t',1:'uint32_t',2:'uint8_t',3:'uint16_t'}[width];member={0:'ptr16',1:'ptr32',2:'ptr8',3:'ptr16'}[width]
 cpp+='{UCPTrie trie{};std::vector<uint16_t> index('+str(f['indexLength'])+');std::vector<'+typ+'> data('+str(f['dataLength'])+');\n'
 for i,v in f['indexEntries']:cpp+=f'index[{i}]={v};\n'
 for i,v in f['dataEntries']:cpp+=f'data[{i}]={v}u;\n'
 cpp+=f"trie.index=index.data();trie.data.{member}=data.data();trie.indexLength=index.size();trie.dataLength=data.size();trie.highStart={f['highStart']};trie.shifted12HighStart={f['highStart']>>12};trie.type={f['type']};trie.valueWidth={width};\n"
 for c in f['codePoints']:cpp+=f'std::cout<<"trie,{fi},{c},"<<_UCPTRIE_CP_INDEX(&trie,trie.type==0?0xffff:0xfff,{c})<<","<<ucptrie_get(&trie,{c})<<"\\n";\n'
 cpp+='}\n'
cpp+='for(int code=-1;code<=USCRIPT_CODE_LIMIT+1;++code) std::cout<<"script,"<<code<<","<<i18nutil::unicode::getScriptClassFromUScriptCode(static_cast<UScriptCode>(code))<<"\\n";\n}\n'
(out/'branches.cpp').write_text(cpp)
command=['c++','-std=c++17','-O2','-DU_DISABLE_RENAMING=1','-DU_STATIC_IMPLEMENTATION','-Ivendor/icu-reference/source/common',str(out/'branches.cpp'),'-o',str(out/'branches')]
with (out/'branches-compile.log').open('w') as log:r=subprocess.run(command,stdout=log,stderr=log)
assert r.returncode==0,'Inspect branches-compile.log'
raw=subprocess.check_output([str(out/'branches')],text=True)
rows=[];scripts=[]
for line in raw.splitlines():
 values=line.split(',')
 if values[0]=='trie':rows.append(list(map(int,values[1:])))
 else:scripts.append(list(map(int,values[1:])))
result={'kind':'Original unchanged native scalar/getter scopes over declared native frozen-trie fields,including an explicitly malformed-width fallback observation;not a binary constructor or full service certificate.','fixtures':fixtures,'trieRows':rows,'scriptRows':scripts,'nativeDriverSha256':hashlib.sha256(cpp.encode()).hexdigest(),'command':command}
(evidence/'native-script-branches.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'trieRows':len(rows),'scriptRows':len(scripts),'driverSha256':result['nativeDriverSha256']}))
