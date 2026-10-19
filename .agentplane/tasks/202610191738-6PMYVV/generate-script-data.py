"""Retain pinned original ICU frozen property storage and public script/block constants."""
from pathlib import Path
import re,json,hashlib
base=Path('vendor/icu-reference/source/common')
proof=json.loads(Path('.agentplane/tasks/202610191738-6PMYVV/evidence/font-script-source-baseline.json').read_text())
for record in proof['sources']:
 assert hashlib.sha256(Path(record['path']).read_bytes()).hexdigest()==record['sha256']
def clean(text):
 return re.sub(r'//[^\n]*|/\*.*?\*/','',text,flags=re.S)
def entries(text,prefix):
 values={}
 for name,expr in re.findall(r'\b('+prefix+r'\w+)\s*=\s*([^,}\n]+)',clean(text)):
  expr=expr.strip()
  if expr in values:value=values[expr]
  elif re.fullmatch(r'-?(?:0x[\da-fA-F]+|\d+)',expr):value=int(expr,0)
  else:continue
  values[name]=value
 return values
def enum_lines(values,prefix,raw):
 aliases=dict(re.findall(r'\b('+prefix+r'\w+)\s*=\s*('+prefix+r'\w+)\s*,',clean(raw)))
 result=''
 for name,value in values.items():
  if name in aliases:
   result+='  // eslint-disable-next-line @typescript-eslint/prefer-literal-enum-member -- Preserve the original ICU alias identity.\n'
  result+='  '+name+' = '+aliases.get(name,str(value))+',\n'
 return result
script=entries((base/'unicode/uscript.h').read_text(),'USCRIPT_')
block=entries((base/'unicode/uchar.h').read_text(),'UBLOCK_')
assert script['USCRIPT_HAN']==17 and block['UBLOCK_BASIC_LATIN']==1
out=Path('apps/office/src/external/icu/source/common')
(out/'unicode/uscript.ts').write_text('/** @fileoverview Original ICU78.3 UScriptCode values; other script services remain unported. */\nexport enum UScriptCode {\n'+enum_lines(script,'USCRIPT_',(base/'unicode/uscript.h').read_text())+'}\n')
p=out/'unicode/uchar.ts';text=p.read_text().split('\n/** Original ICU78.3 Unicode block identities. */',1)[0]
p.write_text(text+'\n/** Original ICU78.3 Unicode block identities. */\nexport enum UBlockCode {\n'+enum_lines(block,'UBLOCK_',(base/'unicode/uchar.h').read_text())+'}\n\n/** Consumed original integer property identities; remaining property declarations are unported. */\nexport enum UProperty { UCHAR_BLOCK = 0x1001, UCHAR_SCRIPT = 0x100a }\n')
source=(base/'uchar_props_data.h').read_text()
def array(name):
 match=re.search(r'static const uint(?:16|32)_t '+name+r'\[(\d+)\]=\{(.*?)\};',source,re.S);assert match,name
 tokens=[v.strip() for v in clean(match[2]).split(',') if v.strip()]
 assert all(re.fullmatch(r'(?:0x[\da-fA-F]+|\d+)',v) for v in tokens),name
 vals=[int(v,0) for v in tokens];assert len(vals)==int(match[1]),name
 return vals
names=['propsVectorsTrie_index','propsVectors','scriptExtensions','block_trieIndex','block_trieData']
data={name:array(name) for name in names}
data['sourceSha256']=hashlib.sha256((base/'uchar_props_data.h').read_bytes()).hexdigest()
(out/'uchar_props_data.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
# Retain literal initializer field values and the original index/data16 shared offset.
(out/'uchar_props_data.ts').write_text('''/** @fileoverview Original frozen ICU78.3 Unicode17 property vectors and block trie; shared typed-array offsets retain native storage. */
import data from "./uchar_props_data.json";
import type { UTrie2 } from "./utrie2.h";
import type { UCPTrie } from "./unicode/ucptrie";
export const propsVectorsTrie_index = new Uint16Array(data.propsVectorsTrie_index);
export const propsVectorsTrie: UTrie2 = {
 index: propsVectorsTrie_index, data16: propsVectorsTrie_index.subarray(5924), data32: null,
 indexLength:5924,dataLength:37208,index2NullOffset:0xa40,dataNullOffset:0x17a4,initialValue:0,errorValue:0,
 highStart:0x110000,highValueIndex:0xa878,memory:null,length:0,isMemoryOwned:false,padding1:false,padding2:0,newTrie:null,
};
export const propsVectors = new Uint32Array(data.propsVectors);
export const propsVectorsColumns = 3;
export const scriptExtensions = new Uint16Array(data.scriptExtensions);
export const block_trie: UCPTrie = {
 index:new Uint16Array(data.block_trieIndex),data:new Uint16Array(data.block_trieData),
 indexLength:834,dataLength:3098,highStart:0x11000,shifted12HighStart:0x11,type:1,valueWidth:0,
 reserved32:0,reserved16:0,index3NullOffset:0x270,dataNullOffset:0x7f4,nullValue:0,
};
''')
print('Generated original frozen data:',{k:len(data[k]) for k in names},'script/block constants',len(script),len(block))
