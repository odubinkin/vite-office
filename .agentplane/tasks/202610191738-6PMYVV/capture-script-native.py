"""Compile unchanged consumed ICU/LibreOffice scopes; constrain the unused property dispatcher to SCRIPT explicitly."""
from pathlib import Path
import re,subprocess,json,hashlib,gzip
out=Path('output/playwright/task37-script-native');out.mkdir(parents=True,exist_ok=True)
evidence=Path('.agentplane/tasks/202610191738-6PMYVV/evidence')
icu=Path('vendor/icu-reference/source/common');lo=Path('vendor/libreoffice-reference')
sha=lambda data:hashlib.sha256(data).hexdigest()
proof=json.loads((evidence/'font-script-source-baseline.json').read_text())
for entry in proof['sources']:assert sha(Path(entry['path']).read_bytes())==entry['sha256']
scopes={}
def scope(path,name,prefix=None):
 text=Path(path).read_text();m=re.search(r'\b'+re.escape(name)+r'\s*\([^;]*?\)\s*(?:const\s*)?\{',text,re.S);assert m,(path,name)
 start=text.rfind('\n',0,m.start())+1
 if prefix is not None:start=text.rfind(prefix,0,m.start())
 assert start>=0
 brace=text.index('{',m.start());depth=1;end=brace+1
 while depth:
  if text[end]=='{':depth+=1
  if text[end]=='}':depth-=1
  end+=1
 result=text[start:end];scopes[str(path)+'::'+name]=sha(result.encode());return result
parts=[]
for name,prefix in [('ucptrie_internalSmallIndex','U_CAPI'),('getValue',None),('ucptrie_get','U_CAPI')]:parts.append(scope(icu/'ucptrie.cpp',name,prefix))
parts.extend([scope(icu/'uchar.cpp','u_getUnicodeProperties','U_CFUNC'),scope(icu/'uchar.cpp','uscript_getScript','U_CAPI'),scope(icu/'uchar.cpp','ublock_getCode','U_CAPI')])
getscript=scope(icu/'uprops.cpp','getScript')
source=(lo/'i18nutil/source/utility/scriptclass.cxx').read_text();start=source.index('struct UBlock2Script');end=source.index('\n};',source.index('const UBlock2Script scriptList[]'))+3
array=source[start:end];scopes['scriptList']=sha(array.encode())
constant=Path('vendor/libreoffice-reference/offapi/com/sun/star/i18n/ScriptType.idl').read_text()
constants=''.join('constexpr sal_Int16 '+n+'='+v+';\n' for n,v in re.findall(r'const\s+short\s+(\w+)\s*=\s*(\d+)',constant))
cpp='''#include <cstdint>
#include <iterator>
#include <iostream>
#include <cstdlib>
#include "unicode/uchar.h"
#include "unicode/uscript.h"
#include "uassert.h"
#include "uprops.h"
#include "utrie2.h"
#include "ucptrie_impl.h"
U_NAMESPACE_USE
#define INCLUDED_FROM_UCHAR_C 1
#include "uchar_props_data.h"
'''+ '\n'.join(parts)+ '\nstruct IntProperty {};\n'+getscript+'''
// This is a constrained ABI/bootstrap shim, not a claim of full ICU property dispatch.
// Only SCRIPT is requested by the unchanged LO scope; its original callback is invoked.
U_CAPI int32_t U_EXPORT2 u_getIntPropertyValue(UChar32 c,UProperty which) {
 if(which!=UCHAR_SCRIPT) std::abort();
 return getScript(IntProperty{},c,which);
}
using sal_Int16=int16_t;using sal_uInt32=uint32_t;
namespace ScriptType {
'''+constants+'''}
namespace i18nutil {
class unicode { public: static sal_Int16 getScriptClassFromUScriptCode(UScriptCode); };
'''+scope(lo/'i18nutil/source/utility/unicode.cxx','unicode::getScriptClassFromUScriptCode')+'\nnamespace {\n'+array+'\n'+scope(lo/'i18nutil/source/utility/scriptclass.cxx','getScriptClassByUAX24Script')+'\n'+scope(lo/'i18nutil/source/utility/scriptclass.cxx','getCompatibilityScriptClassByBlock')+'\n}\nsal_Int16 GetScriptClass(sal_uInt32);\n}\n'+scope(lo/'i18nutil/source/utility/scriptclass.cxx','i18nutil::GetScriptClass')+'''
void word(int32_t value) {std::cout.put(char(value&255));std::cout.put(char((value>>8)&255));}
int main() {
 for(int32_t c=0;c<=0x10ffff;++c) {
  UErrorCode status=U_ZERO_ERROR;
  word(ublock_getCode(c));word(uscript_getScript(c,&status));word(i18nutil::GetScriptClass(c));
 }
 return std::cout.good()?0:1;
}
'''
(out/'driver.cpp').write_text(cpp)
command=['c++','-std=c++17','-O2','-DU_DISABLE_RENAMING=1','-DU_STATIC_IMPLEMENTATION','-I'+str(icu),str(out/'driver.cpp'),'-o',str(out/'driver')]
with (evidence/'script-native-compile.log').open('w') as log:r=subprocess.run(command,stdout=log,stderr=log)
assert r.returncode==0,'Native compile failed; inspect script-native-compile.log'
raw=subprocess.check_output([str(out/'driver')]);assert len(raw)==0x110000*6
(evidence/'native-script-scalars.bin.gz').write_bytes(gzip.compress(raw))
metadata={'kind':'Compiled original consumed scalar scopes with an explicitly constrained SCRIPT dispatch bootstrap;not a full ICU library or LibreOffice service build.','codePoints':0x110000,'record':'little endian uint16 block,int16 script,int16 uncached editing class','rawSha256':sha(raw),'driverSha256':sha(cpp.encode()),'scopes':scopes,'command':command}
(evidence/'script-native-source-report.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps({k:metadata[k] for k in ['kind','codePoints','rawSha256']}))
