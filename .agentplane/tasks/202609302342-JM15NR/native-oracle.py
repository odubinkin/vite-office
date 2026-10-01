"""Compile pinned declaration/property/export excerpts without changing their bodies.
Dependencies model ASCII OUString, byte integer input, modern/no-build-id documents,
Arabic/bullet families and standard ODF 1.3 only; this is not a native full build.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json, re, subprocess
root = Path('.agentplane/tasks/202609302342-JM15NR')
up = Path('vendor/libreoffice-reference')
xml = (up/'xmloff/source/style/xmlnumi.cxx').read_text()
exp = (up/'xmloff/source/style/xmlnume.cxx').read_text()
uno = (up/'sw/source/core/unocore/unosett.cxx').read_text()
hdr = (up/'include/editeng/numitem.hxx').read_text()
def block(source, marker):
    start=source.index(marker);brace=source.index('{',start);depth=1;end=brace+1
    while depth:
        depth += (source[end]=='{')-(source[end]=='}');end+=1
    return source[start:end]
attrs=block(xml,'    for( auto& aIter : sax_fastparser::castToFastAttributeList(xAttrList) )')
generate=block(xml,'    if (!sListFormat.has_value())')
numeric=block(xml[xml.index('Sequence<beans::PropertyValue>'):], '    if( bNum )\n    {\n        aProperties.push_back')
property_lines=[]
for name in ['Prefix','Suffix','ListFormat']:
    property_lines.append(next(line for line in xml.splitlines() if f'makePropertyValue(u"{name}"' in line))
branches='\n'.join(block(uno,f'        else if (rProp.Name == UNO_NAME_{name})') for name in ['PARENT_NUMBERING','PREFIX','SUFFIX','START_WITH','LIST_FORMAT'])
export_affix='\n'.join(block(exp, f'        if (!s{name}.isEmpty())') for name in ['Prefix','Suffix'])
export_start=block(exp,'        if( nStartValue != 1 )')
export_display=block(exp,'        if( nDisplayLevels > 1 && NumberingType::NUMBER_NONE != eType )')
export_clamp=block(exp,'        else if( rProp.Name == "ParentNumbering" )')
integer=probe_source(Path('.agentplane/tasks/202609302219-BJJJBT/native-level-oracle.cxx')).read_text().split('struct Attribute')[0]
marker=probe_source(Path('.agentplane/tasks/202609302319-9KTM99/native-marker-oracle.cxx')).read_text().split('void StripNonDelimiter')[0]
marker=re.sub(r'using sal_Int32=.*?; using LanguageType=int;', 'using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;using LanguageType=int;',marker)
marker=marker.replace('OUString makeStringAndClear(){return value;}', 'void append(sal_Int32 n){value+=OUString::number(n);} OUString makeStringAndClear(){auto out=value;value.clear();return out;}')
marker=marker.replace('char operator[](int32_t n)const', 'sal_Int32 iterateCodePoints(sal_Int32* n)const{return static_cast<unsigned char>(value.at((*n)++));}\n char operator[](int32_t n)const')
setters='\n'.join(next(line for line in hdr.splitlines() if name in line) for name in ['void            SetIncludeUpperLevels(', 'void            SetStart(', 'sal_uInt16      GetStart('])
marker=marker.replace('void SetPrefix(const OUString&);',setters+'\n void SetPrefix(const OUString&);')
tokens=sorted(set(re.findall(r'XML_ELEMENT\([A-Z_]+, (XML_[A-Z_]+)\)',attrs)))
preamble=r'''
#include <climits>
#include <variant>
#include <algorithm>
OUString operator""_ustr(const char16_t* text,size_t){return OUString(text);}
namespace o3tl {template<typename T>T& temporary(T&& value){return value;}}
enum {TEXT=1,STYLE=2,XLINK=3,LO_EXT=4};
#define XML_ELEMENT(ns,token) ((ns)*100+(token))
#define XMLOFF_WARN_UNKNOWN(category,attr) ((void)0)
'''+ 'enum {'+','.join(tokens)+'};\n'+r'''
struct Attribute {
 int token;std::string value;
 int getToken()const{return token;}bool isEmpty()const{return value.empty();}
 OUString toString()const{return value;}sal_Int32 toInt32()const{return o3tl::toInt32(value);}
 bool toBoolean()const{return value=="true";}
};
namespace sax_fastparser {const auto& castToFastAttributeList(const std::vector<Attribute>& v){return v;}}
struct Value {
 std::variant<sal_Int16,OUString> value;
 Value(sal_Int16 n):value(n){}Value(OUString s):value(s){}
 bool operator>>=(sal_Int16& n)const{if(auto p=std::get_if<sal_Int16>(&value)){n=*p;return true;}return false;}
 bool operator>>=(OUString& s)const{if(auto p=std::get_if<OUString>(&value)){s=*p;return true;}return false;}
};
struct Property {std::string Name;Value Value;};
namespace comphelper {template<typename T>Property makePropertyValue(OUString name,T value){return {name.value,::Value(value)};}}
const std::string UNO_NAME_PARENT_NUMBERING="ParentNumbering",UNO_NAME_PREFIX="Prefix",UNO_NAME_SUFFIX="Suffix",UNO_NAME_START_WITH="StartWith",UNO_NAME_LIST_FORMAT="ListFormat";
constexpr int XML_NAMESPACE_TEXT=TEXT,XML_NAMESPACE_STYLE=STYLE;
namespace NumberingType {constexpr int NUMBER_NONE=SVX_NUM_NUMBER_NONE;}
struct Export {std::vector<std::pair<int,OUString>> values;void AddAttribute(int ns,int token,OUString value){values.push_back({XML_ELEMENT(ns,token),value});}};
Export output;
Export& GetExport(){return output;}
std::string unhex(const std::string& hex){std::string out;if(hex!="-")for(size_t i=0;i<hex.size();i+=2)out+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));return out;}
std::string hex(const OUString& s){std::ostringstream out;for(unsigned char c:s.value)out<<std::hex<<std::setw(2)<<std::setfill('0')<<int(c);return s.isEmpty()?"-":out.str();}
void dump(const OUString& prefix,const OUString& suffix,int start,int parent,const OUString& pattern){std::cout<<hex(prefix)<<' '<<hex(suffix)<<' '<<start<<' '<<parent<<' '<<hex(pattern)<<'\n';}
int main(){int kind,level,count;while(std::cin>>kind>>level>>count){
 std::vector<Attribute>xAttrList={{XML_ELEMENT(TEXT,XML_LEVEL),std::to_string(level+1)}};
 for(int i=0;i<count;i++){int token;std::string value;std::cin>>token>>value;xAttrList.push_back({token,unhex(value)});}
 bool bNum=kind==0,bBullet=kind==1,bImage=false,m_bIsLegal=false;
 sal_Int32 nLevel=-1,cBullet=0;sal_Int16 nNumStartValue=1,nNumDisplayLevels=1;
 OUString sNumFormat="1",sPrefix,sSuffix,sTextStyleName,sImageURL,sNumLetterSync;
 std::optional<OUString>sListFormat;
'''
apply=r'''
 dump(sPrefix,sSuffix,nNumStartValue,nNumDisplayLevels,*sListFormat);
 SvxNumberFormat aFormat;aFormat.type=kind;aFormat.SetListFormat("",".",level);
 std::vector<Property>aProperties;
'''+property_lines[0]+'\n'+property_lines[1]+'\n'+numeric+'\n'+property_lines[2]+r'''
 for(const auto& rProp:aProperties){if(false){}
'''+branches+r'''
 }
 dump(aFormat.GetPrefix(),aFormat.GetSuffix(),aFormat.GetStart(),aFormat.GetIncludeUpperLevels(),aFormat.GetListFormat());
 // Native UNO GetPropertiesForNumFormat narrowing, followed by xmlnume property read.
 const auto& rFormat=aFormat;sal_Int16 nINT16;
'''+next(line for line in uno.splitlines() if 'nINT16 = rFormat.GetStart();' in line)+r'''
 sal_Int16 nStartValue=nINT16,nDisplayLevels=1;int eType=kind;
 const Property rProp={"ParentNumbering",Value(static_cast<sal_Int16>(aFormat.GetIncludeUpperLevels()))};
 if(false){}
'''+export_clamp+r'''
 sPrefix=aFormat.GetPrefix();sSuffix=aFormat.GetSuffix();OUStringBuffer sTmp;output.values.clear();
'''+export_affix+r'''
 if(bNum){
'''+export_start+'\n'+export_display+r'''
 }
 std::cout<<output.values.size();for(const auto& [token,value]:output.values)std::cout<<' '<<token<<' '<<hex(value);std::cout<<'\n';
}}
'''
cpp=integer+marker+preamble+attrs+'\n'+generate+apply
probe_source(root.joinpath('native-marker-transport.cxx')).write_text(cpp)
# Attribute token order is retained; all affix/pattern strings are ASCII in this shim.
map_tokens={'text:start-value':('TEXT','XML_START_VALUE'),'text:display-levels':('TEXT','XML_DISPLAY_LEVELS'),'style:num-prefix':('STYLE','XML_NUM_PREFIX'),'style:num-suffix':('STYLE','XML_NUM_SUFFIX'),'style:num-list-format':('STYLE','XML_NUM_LIST_FORMAT'),'loext:num-list-format':('LO_EXT','XML_NUM_LIST_FORMAT')}
ns={'TEXT':1,'STYLE':2,'LO_EXT':4}
token_map={name:ns[namespace]*100+tokens.index(token) for name,(namespace,token) in map_tokens.items()}
attrs_sets=[[], [('style:num-prefix','['),('style:num-suffix',']')]]
for raw in ['', '0','-7','+3.5',' \t7tail','invalid','32767','32768','2147483647','2147483648','-2147483649','9223372036854775808','\u20032']:
    attrs_sets.append([('text:start-value',raw),('text:display-levels',raw),('style:num-suffix',')')])
attrs_sets += [[('style:num-prefix','ignored'),('style:num-suffix','ignored'),('text:display-levels','2'),('style:num-list-format',pattern)] for pattern in ['', '[%2%|%1%|%2%]','%10%.%1%', 'literal','%%','%9%']]
attrs_sets += [[('style:num-list-format','ignored'),('loext:num-list-format','[%1%/%2%]')],[('loext:num-list-format','ignored'),('style:num-list-format','[%1%/%2%]')],[('style:num-prefix','[%1%|'),('style:num-suffix',']')]]
cases=[{'kind':'numbered' if kind==0 else 'bullet','level':level,'attributes':attrs} for kind in range(2) for level in [0,1,9] for attrs in attrs_sets]
request=''.join(f'{int(c["kind"]=="bullet")} {c["level"]} {len(c["attributes"])} '+ ' '.join(f'{token_map[k]} {v.encode().hex() or "-"}' for k,v in c['attributes'])+'\n' for c in cases)
binary=root/'native-marker-transport'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-marker-transport.cxx')),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
def state(line):
    prefix,suffix,start,parent,pattern=line.split();decode=lambda h: '' if h=='-' else bytes.fromhex(h).decode()
    return dict(prefix=decode(prefix),suffix=decode(suffix),start=int(start),includeUpperLevels=int(parent),listFormat=decode(pattern))
reverse={value:key for key,value in token_map.items()}
for i,c in enumerate(cases):
    c['declaration']=state(lines[3*i]);c['applied']=state(lines[3*i+1]);out=lines[3*i+2].split();c['exportAttributes']={reverse[int(out[j])]:('' if out[j+1]=='-' else bytes.fromhex(out[j+1]).decode()) for j in range(1,len(out),2)}
root.joinpath('native-results.json').write_text(identity_json(cases,indent=2,ensure_ascii=True)+'\n')
print(f'Compiled unmodified pinned attribute loop, generated format, property publication/application and export predicates; {len(cases)} cases. ASCII strings; byte integer parsing includes UTF-8 whitespace; modern/no-build-id, Arabic/bullet and standard ODF 1.3 only.')
