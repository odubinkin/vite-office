"""Compile unmodified pinned marker setters and Writer formatting bodies with bounded ASCII/Arabic shims."""
import json
import subprocess
from pathlib import Path

root = Path('.agentplane/tasks/202609302319-9KTM99')
num = Path('vendor/libreoffice-reference/editeng/source/items/numitem.cxx').read_text()
writer = Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text()
def extract(source, marker):
    start = source.index(marker)
    return source[start:source.index('\n}\n', start) + 3]
setters = '\n'.join(extract(num, marker) for marker in [
    'void SvxNumberFormat::SetPrefix(', 'void SvxNumberFormat::SetSuffix(',
    'void SvxNumberFormat::SetListFormat(const OUString&',
    'void SvxNumberFormat::SetListFormat(std::optional', 'OUString SvxNumberFormat::GetListFormat('])
cpp = r'''
#include <string>
#include <vector>
#include <optional>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cassert>
#include <cstdint>
using sal_Int32=int32_t; using sal_uInt8=uint8_t; using sal_uInt16=uint16_t; using sal_Unicode=char; using LanguageType=int;
struct OUString {
 std::string value;
 OUString()=default; OUString(const char* text):value(text){} OUString(std::string text):value(text){}
 OUString(const char* text,size_t len):value(text,len){} OUString(const char16_t* text) {while(*text)value+=static_cast<char>(*text++);}
 int32_t getLength()const{return value.size();} bool isEmpty()const{return value.empty();} void clear(){value.clear();}
 char operator[](int32_t n)const{return value.at(n);}
 int32_t indexOf(char c,int32_t from=0)const {auto n=value.find(c,from);return n==std::string::npos?-1:n;}
 int32_t lastIndexOf(char c)const {auto n=value.rfind(c);return n==std::string::npos?-1:n;}
 int32_t lastIndexOf(char c,int32_t before)const {if(before<=0)return -1;auto n=value.rfind(c,before-1);return n==std::string::npos?-1:n;}
 OUString copy(int32_t from)const{return value.substr(from);} OUString copy(int32_t from,int32_t len)const{return value.substr(from,len);}
 OUString replaceAt(int32_t start,int32_t len,const OUString& text)const{auto out=value;out.replace(start,len,text.value);return out;}
 OUString& operator+=(const OUString& s){value+=s.value;return *this;}
 static OUString number(int n){return std::to_string(n);}
};
OUString operator+(OUString a,const OUString& b){return a+=b;}
struct OUStringBuffer {
 OUString value;
 OUStringBuffer& operator=(const OUString& s){value=s;return *this;}
 void append(const OUString& s){value+=s;} void append(const char* s){value+=s;}
 void insert(int n,const OUString& s){value.value.insert(n,s.value);} bool isEmpty()const{return value.isEmpty();}
 OUString makeStringAndClear(){return value;}
};
namespace css::lang {struct Locale {};}
struct LanguageTag {static css::lang::Locale convertToLocale(int){return {};}};
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
constexpr int MAXLEVEL=10,SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2,SVX_NUM_BITMAP=3;
struct SvxNumberFormat {
 OUString sPrefix,sSuffix; std::optional<OUString> sListFormat; sal_uInt8 nInclUpperLevels=1; sal_uInt16 nStart=1; int type=0;
 void SetPrefix(const OUString&); void SetSuffix(const OUString&);
 void SetListFormat(const OUString&,const OUString&,int); void SetListFormat(std::optional<OUString> oSet=std::nullopt);
 bool HasListFormat()const{return sListFormat.has_value();} OUString GetListFormat(bool=true)const;
 const OUString& GetPrefix()const{return sPrefix;} const OUString& GetSuffix()const{return sSuffix;}
 sal_uInt8 GetIncludeUpperLevels()const{return nInclUpperLevels;} bool GetIsLegal()const{return false;}
 int GetNumberingType()const{return type;}
 OUString GetNumStr(int n,const css::lang::Locale&,bool)const{return type==SVX_NUM_CHAR_SPECIAL?OUString():OUString::number(n);}
};
using SwNumFormat=SvxNumberFormat;
struct SwNumberTree {using tNumberVector=std::vector<unsigned int>;};
struct SwNumRule {
 struct Extremities {int nPrefixChars=0,nSuffixChars=0;}; SvxNumberFormat formats[10];
 const SvxNumberFormat& Get(int n)const{return formats[n];} bool IsContinusNum()const{return false;}
 OUString MakeNumString(const SwNumberTree::tNumberVector&,bool,unsigned int,bool,Extremities*,LanguageType)const;
};
'''
cpp += setters + extract(writer, 'void StripNonDelimiter(') + extract(writer, 'OUString SwNumRule::MakeNumString( const SwNumberTree::tNumberVector')
cases = []
patterns = [None, '', 'literal', '%', 'tail%', '%0%', '%1%', '(%1%)', '%2%/%1%', '%1%.%1%', 'prefix%%a%2%?%', '%10%', '%11%', '%1%x%3%', '%1%%', '%x%1%abc%', '%1' , '%1%'*130]
for pattern in patterns:
    for action in ['keep', 'prefix', 'suffix', 'count', 'clear']:
        cases.append(dict(kind='set',pattern=pattern,action=action))
for count in [0,1,2,10,255]:
    for level in [0,2,9]:
        cases.append(dict(kind='generate',count=count,level=level,prefix='[',suffix=']'))
for pattern in [None,'','literal','[%2%|%1%|%2%]','%3%:%1%','%10%/%1%','%11%/%0%/%1%','%1%x%2%','%2%/%2%']:
    for kinds in [[0,0,0],[1,0,0],[0,0,1]]:
        for values in [[2,3,4],[0,3,4],[2,0,4]]:
            cases.append(dict(kind='marker',pattern=pattern,types=kinds,values=values,count=3,level=2,prefix='(',suffix=')'))
cases.append(dict(kind='marker',pattern='%10%/%1%',types=[0]*10,values=list(range(1,11)),count=0,level=9,prefix='',suffix=''))
cases.append(dict(kind='marker',pattern=None,types=[0]*3,values=[2,3,4],count=0,level=2,prefix='(',suffix=')'))
main = ['int main(){']
for case in cases:
    literal = lambda x: json.dumps(x)
    if case['kind']=='marker':
        main += ['{SwNumRule rule;',f'rule.formats[{case["level"]}].nInclUpperLevels={case["count"]};',f'rule.formats[{case["level"]}].sPrefix={literal(case["prefix"])};',f'rule.formats[{case["level"]}].sSuffix={literal(case["suffix"])};']
        if case['pattern'] is not None:main += [f'rule.formats[{case["level"]}].SetListFormat(OUString({literal(case["pattern"])}));']
        for i,t in enumerate(case['types']):main += [f'rule.formats[{i}].type={t};']
        vals=','.join(map(str,case['values']))
        main += [f'auto out=rule.MakeNumString({{{vals}}},true,{case["level"]},false,nullptr,0);',"std::cout<<std::quoted(out.value)<<'\\n';}"]
    else:
        main += ['{SvxNumberFormat format;']
        if case['kind']=='generate': main += [f'format.nInclUpperLevels={case["count"]};',f'format.SetListFormat({literal(case["prefix"])},{literal(case["suffix"])},{case["level"]});']
        else:
            main += ['format.SetListFormat();' if case['pattern'] is None else f'format.SetListFormat(OUString({literal(case["pattern"])}));']
            main += {'keep':[], 'prefix':['format.SetPrefix("P");'],'suffix':['format.SetSuffix("S");'], 'count':['format.nInclUpperLevels=7;'], 'clear':['format.SetListFormat();']}[case['action']]
        main += [r'''std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}''']
main += ['}']
cpp += '\n'.join(main)
root.joinpath('native-marker-oracle.cxx').write_text(cpp)
binary=root/'native-marker-oracle'
subprocess.run(['clang++','-std=c++20',str(root/'native-marker-oracle.cxx'),'-o',str(binary)],check=True)
try:results=subprocess.check_output([str(binary)],text=True).splitlines()
finally:binary.unlink(missing_ok=True)
assert len(cases)==len(results)
for case,result in zip(cases,results):case['expected']=json.loads(result)
root.joinpath('native-results.json').write_text(json.dumps(cases,indent=2)+'\n')
print(f'{len(cases)} native states/labels from extracted unmodified setter and Writer formatter bodies; ASCII/Arabic dependency shims, no native full build claim.')
