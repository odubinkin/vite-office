"""Compile unmodified pinned integer bodies and native list-level normalization."""
from pathlib import Path
import json,subprocess
root=Path('.agentplane/tasks/202609302219-BJJJBT')
rtl=Path('vendor/libreoffice-reference/sal/rtl/strtmpl.hxx').read_text()
o3tl=Path('vendor/libreoffice-reference/include/o3tl/string_view.hxx').read_text()
xml=Path('vendor/libreoffice-reference/xmloff/source/style/xmlnumi.cxx').read_text()
def extract(source,marker):
 start=source.index(marker);brace=source.index('{',start);depth=1;end=brace+1
 while depth:
  depth+= (source[end]=='{')-(source[end]=='}');end+=1
 return source[start:end]
digit=extract(rtl,'inline sal_Int16 implGetDigit(')
whitespace=extract(o3tl,'inline bool implIsWhitespace(')
sign=extract(rtl,'template <typename T, class Iter> inline bool HandleSignChar(')
divmod=extract(rtl,'template <typename T> std::pair<T, sal_Int16> DivMod(')
integer=extract(rtl,'template <typename T, class S> T toInt(')
wrapper=extract(o3tl,'inline sal_Int32 toInt32(std::string_view')
start=xml.index('            nLevel = aIter.toInt32();')
end=xml.index('            break;',start)
normalize=xml[start:end]
cpp=r'''
#include <iostream>
#include <string>
#include <string_view>
#include <limits>
#include <type_traits>
#include <utility>
#include <cassert>
#include <cstdint>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_Int64=int64_t;using sal_Unicode=char16_t;
constexpr int RTL_STR_MIN_RADIX=2,RTL_STR_MAX_RADIX=36;
#define SAL_MIN_INT32 INT32_MIN
#define SAL_MAX_INT32 INT32_MAX
unsigned char UChar(char c){return static_cast<unsigned char>(c);}
namespace o3tl::internal {
'''+whitespace+'\n}\n'+digit+'\n'+sign+'\n'+divmod+'\n'+integer+r'''
sal_Int64 rtl_str_toInt64_WithLength(const char* text,sal_Int16 radix,size_t length){return toInt<sal_Int64>(std::string_view(text,length),radix);}
namespace o3tl {
'''+wrapper+r'''
}
struct Attribute {std::string_view text;sal_Int32 toInt32()const{return o3tl::toInt32(text);}};
sal_Int32 level(std::string_view text){Attribute aIter{text};sal_Int32 nLevel=-1;
'''+normalize+r'''
return nLevel;}
int main(){int present;std::string hex;while(std::cin>>present>>hex){std::string value;
if(hex!="-")for(size_t i=0;i<hex.size();i+=2)value+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));
std::cout<<(present?level(value):-1)<<'\n';}}
'''
root.joinpath('native-level-oracle.cxx').write_text(cpp)
binary=root/'native-level-oracle'
subprocess.run(['clang++','-std=c++20',str(root/'native-level-oracle.cxx'),'-o',str(binary)],check=True)
cases=[None,'',' \t','invalid','0','-0','-7','1.5','2junk','+2',' 2','\t3tail','10','11','2147483647','2147483648','-2147483648','-2147483649','9223372036854775807','9223372036854775808','-9223372036854775809','\u20032','\u00002','0002','1e2','0x2','+','-','--2',' + 2',' \n 9x','123456789012345678901234567890','1\u00002','\u001f2']
request=''.join(('0 -' if value is None else '1 '+(value.encode().hex() or '-'))+'\n' for value in cases)
output=subprocess.check_output([str(binary)],input=request,text=True)
binary.unlink()
rows=[{'value':value,'level':int(level)} for value,level in zip(cases,output.splitlines(),strict=True)]
root.joinpath('native-results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=True)+'\n')
print(f'Compiled actual rtl/o3tl integer bodies and xmlnumi normalization; {len(rows)} cases.')
