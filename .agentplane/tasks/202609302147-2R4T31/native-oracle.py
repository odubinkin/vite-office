"""Extract pinned modern base initialization, UNO rejection branches and XML fill loop."""
import json
import subprocess
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
root=Path('.agentplane/tasks/202609302147-2R4T31')
number=Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text()
uno=Path('vendor/libreoffice-reference/sw/source/core/unocore/unosett.cxx').read_text()
xml=Path('vendor/libreoffice-reference/xmloff/source/style/xmlnumi.cxx').read_text()
header=Path('vendor/libreoffice-reference/include/o3tl/unit_conversion.hxx').read_text()
start=header.index('template <std::integral I> constexpr sal_Int64 MulDiv(')
end=header.index('\n}\n',start)+3
ratio=header[start:end]
start=number.index('        const tools::Long cFirstLineIndent =')
end=number.index('\n        // outline:',start)
base=number[start:end]
start=number.index('        mnLevelChars[0] =')
end=number.index('\n    }',start)
bullets=number[start:end]
start=uno.index('        else if (rProp.Name == UNO_NAME_LEFT_MARGIN)',uno.index('void SwXNumberingRules::SetPropertiesToNumFormat'))
end=uno.index('        else if (rProp.Name == UNO_NAME_NUMBERING_TYPE)',start)
properties=uno[start:end]
start=xml.index('    try\n',xml.index('void SvxXMLListStyleContext::FillUnoNumRule'))
end=xml.index('        Reference < XPropertySet >',start)
loop=xml[start:end]+'    }\n    catch (const Exception&) {}\n'
cpp=r'''
#include <array>
#include <vector>
#include <string>
#include <memory>
#include <iostream>
#include <cstdint>
#include <cassert>
#include <concepts>
#include <climits>
using sal_Int16=int16_t; using sal_Int32=int32_t; using sal_Int64=int64_t;
using sal_uInt8=uint8_t; using sal_uInt16=uint16_t;
#define SAL_MIN_INT64 INT64_MIN
#define SAL_MAX_INT64 INT64_MAX
constexpr int MAXLEVEL=10,NUM_RULE=0;
template<typename I> constexpr bool isBetween(I n,sal_Int64 minimum,sal_Int64 maximum){return n>=minimum&&n<=maximum;}
'''+ratio+r'''
namespace o3tl {enum class Length {mm100,twip,in,in100};
template<std::integral I> long toTwips(I n,Length from){return from==Length::in100?MulDiv(n,1440,100):MulDiv(n,72,127);}
long toTwips(double n,Length from){assert(from==Length::in);return n*1440;}
template<typename T,typename U> T narrowing(U n){return static_cast<T>(n);}}
namespace tools {using Long=long;}
struct OUString {static std::string number(int n){return std::to_string(n);}};
struct SvxNumberFormat {enum Mode {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT}; enum Follow {LISTTAB,SPACE,NOTHING,NEWLINE};};
namespace numfunc {int GetBulletChar(int n){int mnLevelChars[MAXLEVEL];
'''+bullets+r'''
return mnLevelChars[n];}}
struct SwNumFormat {
 int kind=0,bullet=0,include=1,start=1,suffix=0,mode=0,follow=0;
 long left=0,offset=0,distance=0,first=0,indent=0,tab=0;
 void SetIncludeUpperLevels(int n){include=n;} void SetStart(int n){start=n;}
 void SetPositionAndSpaceMode(int n){mode=n;} void SetLabelFollowedBy(int n){follow=n;}
 void SetListtabPos(long n){tab=n;} void SetFirstLineIndent(long n){first=n;}
 void SetIndentAt(long n){indent=n;} void SetListFormat(std::string){suffix=1;}
 void SetBulletChar(int n){bullet=n;} void SetAbsLSpace(long n){left=n;}
 void SetFirstLineOffset(long n){offset=n;} void SetCharTextDistance(long n){distance=static_cast<sal_Int16>(n);}
};
struct SwNumRule {
 static inline std::array<std::array<SwNumFormat*,MAXLEVEL>,1> saLabelAlignmentBaseFormats{};
 std::array<SwNumFormat,MAXLEVEL> formats;
 SwNumRule(){SwNumFormat* pFormat;sal_uInt8 n;
'''+base+r'''
 for(int i=0;i<MAXLEVEL;i++){formats[i]=*saLabelAlignmentBaseFormats[0][i];delete saLabelAlignmentBaseFormats[0][i];}}
 const SwNumFormat& Get(sal_uInt16 n) const{return formats.at(n);}
 void Set(sal_uInt16 n,const SwNumFormat& format){formats.at(n)=format;}
};
struct Exception {};
namespace lang {struct IllegalArgumentException:Exception {};}
struct Value {long n; template<typename T> void operator>>=(T& out)const{out=static_cast<T>(n);}};
struct Property {std::string Name;Value Value;};
const std::string UNO_NAME_LEFT_MARGIN="left",UNO_NAME_SYMBOL_TEXT_DISTANCE="distance",UNO_NAME_FIRST_LINE_OFFSET="offset",UNO_NAME_POSITION_AND_SPACE_MODE="mode",UNO_NAME_LABEL_FOLLOWED_BY="follow",UNO_NAME_LISTTAB_STOP_POSITION="tab",UNO_NAME_FIRST_LINE_INDENT="first",UNO_NAME_INDENT_AT="indent";
namespace LabelFollow {constexpr int LISTTAB=0,SPACE=1,NOTHING=2,NEWLINE=3;}
void SetPropertiesToNumFormat(SwNumFormat& aFormat,const std::vector<Property>& props){bool bWrongArg=false;
for(const auto& rProp:props){if(false){}
'''+properties+r'''
else if(rProp.Name=="kind")aFormat.kind=rProp.Value.n;
else if(rProp.Name=="bullet")aFormat.bullet=rProp.Value.n;
else if(rProp.Name=="suffix")aFormat.suffix=rProp.Value.n;
}
if(bWrongArg)throw lang::IllegalArgumentException();
}
void replace(SwNumRule& rNumRule,const std::vector<Property>& properties,sal_Int32 nIndex){
 SwNumFormat aFormat(rNumRule.Get( o3tl::narrowing<sal_uInt16>(nIndex) ));
 SetPropertiesToNumFormat(aFormat,properties);
 rNumRule.Set(o3tl::narrowing<sal_uInt16>(nIndex), aFormat);
}
namespace beans {using PropertyValue=Property;}
template<typename T> using Sequence=std::vector<T>;
auto Any(const std::vector<Property>& props){return props;}
struct RulePort {SwNumRule rule;int getCount() const{return MAXLEVEL;}
void replaceByIndex(int n,const std::vector<Property>& props){replace(rule,props,n);}};
template<typename T>struct Reference {T* p;bool is()const{return p!=nullptr;} T* operator->()const{return p;}};
struct Level {int n;std::vector<Property> props;int GetLevel()const{return n;}
auto GetProperties()const{return props;}};
void fill(Reference<RulePort> rNumRule,const std::unique_ptr<std::vector<std::unique_ptr<Level>>>& m_pLevelStyles){
'''+loop+r'''
}
int main(){int count;while(std::cin>>count){RulePort port;auto levels=std::make_unique<std::vector<std::unique_ptr<Level>>>();
for(int i=0;i<count;i++){int level,kind,bullet,distance,mode,left,offset,first,indent,tab,suffix;
std::cin>>level>>kind>>bullet>>distance>>mode>>left>>offset>>first>>indent>>tab>>suffix;
auto p=std::make_unique<Level>();p->n=level;
p->props={{"kind",{kind}},{"suffix",{suffix}},{"left",{left}},{"offset",{offset}},
{"distance",{static_cast<sal_Int16>(distance)}},{"mode",{mode}},{"follow",{0}},
{"first",{first}},{"indent",{indent}},{"tab",{tab}}};
if(kind==1)p->props.push_back({"bullet",{bullet}});levels->push_back(std::move(p));}
fill(Reference<RulePort>{&port},levels);
for(const auto& f:port.rule.formats)std::cout<<f.kind<<' '<<f.bullet<<' '<<f.suffix<<' '<<f.left<<' '<<f.offset<<' '<<f.distance<<' '<<f.first<<' '<<f.indent<<' '<<f.tab<<' '<<f.mode<<'\n';
}}
'''
# Property type's member matches native spelling; avoid the C++ type/member ambiguity in the adapter.
cpp=cpp.replace('struct Value {','struct PropertyValueAny {').replace('std::string Name;Value Value;','std::string Name;PropertyValueAny Value;')
probe_source(root.joinpath('native-rule-oracle.cxx')).write_text(cpp)
binary=root/'native-rule-oracle'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-rule-oracle.cxx')),'-o',str(binary)],check=True)
def decl(level=0,kind=1,bullet=0x25cf,distance=0,mode=0,left=0,offset=0,first=0,indent=0,tab=0,suffix=0):
 return [level,kind,bullet,distance,mode,left,offset,first,indent,tab,suffix]
cases=[[],[decl()],[decl(level=2,bullet=0x25a0),decl(kind=0)],
 [decl(level=1),decl(level=1,kind=0)], [decl(kind=0),decl(bullet=0x25a0)]]
for mode in [0,1]:
 for distance in [32767,32768,65535]:
  cases.append([decl(level=2,bullet=0x25a0),decl(level=1,distance=distance,mode=mode,left=127,offset=-127,first=-635,indent=2032,tab=2286),decl(kind=0)])
 for tab in [-1,0,1]: cases.append([decl(mode=mode,tab=tab),decl(level=1)])
text=''.join(str(len(case))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in case) for case in cases)
output=subprocess.check_output([str(binary)],input=text,text=True)
binary.unlink()
rows=[list(map(int,line.split())) for line in output.splitlines()]
assert len(rows)==len(cases)*10
root.joinpath('native-results.json').write_text(identity_json([{'declarations':case,'expected':rows[i*10:(i+1)*10]} for i,case in enumerate(cases)],indent=2)+'\n')
print(f'Compiled pinned base initialization, validation branches and XML replacement loop; {len(cases)} ordered cases / {len(rows)} levels.')
