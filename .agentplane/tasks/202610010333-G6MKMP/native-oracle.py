"""Compile unchanged pinned block constructor and processed/default/generator methods.

Adapters: ASCII OUString/token/platform/raw references/typed DefaultListId UNO,
resolved-rule MakeNumRule only, modern no-build-id/no-MSO import, fixed DateTime
with stable-export getenv disabled. Does not claim factories, full native build,
UNO/reference lifetimes, legacy/MSO APIs or stable-export environment behavior.
"""
from pathlib import Path
import itertools,json,subprocess
root=Path(__file__).resolve().parents[3];task=Path(__file__).resolve().parent;up=root/'vendor/libreoffice-reference'
def body(text,marker):
 a=text.index(marker);b=text.index('{',a);d=1;e=b+1
 while d:
  d+=(text[e]=='{')-(text[e]=='}');e+=1
 return text[a:e]
block=(up/'xmloff/source/text/XMLTextListBlockContext.cxx').read_text();header=(up/'xmloff/source/text/XMLTextListBlockContext.hxx').read_text();helper=(up/'xmloff/source/text/txtlists.cxx').read_text()
source=r'''#include <cassert>
#include <array>
#include <limits>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;using sal_Int64=int64_t;
#define SAL_CONST_INT64(x) x##LL
#define SAL_WARN_IF(...) ((void)0)
#define XMLOFF_WARN_UNKNOWN(...) ((void)0)
#define SAL_CALL
#define getenv(...) nullptr
namespace tools{using Long=long;}
struct OUString {std::array<char,256>data{};size_t size=0;constexpr OUString()=default;constexpr OUString(const char16_t*s,size_t n):size(n){for(size_t i=0;i<n;++i)data[i]=static_cast<char>(s[i]);}OUString(std::string v):size(v.size()){assert(size<256);for(size_t i=0;i<size;++i)data[i]=v[i];}OUString(const char*v):OUString(std::string(v)){}std::string str()const{return std::string(data.data(),size);}bool isEmpty()const{return size==0;}void clear(){size=0;}static OUString number(sal_Int64 n){return OUString(std::to_string(n));}bool operator==(const OUString&r)const{return str()==r.str();}bool operator!=(const OUString&r)const{return str()!=r.str();}bool operator<(const OUString&r)const{return str()<r.str();}OUString&operator+=(const OUString&r){assert(size+r.size<256);for(size_t i=0;i<r.size;++i)data[size+i]=r.data[i];size+=r.size;return *this;}};
OUString operator+(const OUString&a,const OUString&b){return OUString(a.str()+b.str());}constexpr OUString operator""_ustr(const char16_t*s,size_t n){return OUString(s,n);}const OUString EMPTY_OUSTRING;
namespace comphelper::rng{int uniform_int_distribution(int,int){return 0;}}

struct DateTime{enum{SYSTEM};DateTime(int){}sal_Int64 GetTime(){return 123456789000000LL;}sal_uInt32 GetDateUnsigned(){return 20261001;}};
template<class T>struct Reference{T*p=nullptr;Reference()=default;Reference(T*v):p(v){}template<class U>Reference(const Reference<U>&v,int):p(static_cast<T*>(v.p)){}bool is()const{return p!=nullptr;}T*get()const{return p;}T*operator->()const{return p;}Reference&operator=(T*v){p=v;return *this;}};constexpr int UNO_QUERY=0;
struct Any{OUString value;bool operator>>=(OUString&out)const{out=value;return true;}};
namespace beans{struct XPropertySet{bool present;OUString defaultId;XPropertySet*getPropertySetInfo(){return this;}bool hasPropertyByName(const OUString&){return present;}Any getPropertyValue(const OUString&){return {defaultId};}};struct XPropertySetInfo:XPropertySet{};}
namespace container{struct XIndexReplace:beans::XPropertySet{};}
namespace uno{using ::Reference;struct Exception{};}
enum XMLTokenEnum{XML_ID,XML_CONTINUE_NUMBERING,XML_STYLE_NAME,XML_CONTINUE_LIST,XML_TRUE};
#define XML_ELEMENT(ns,tok) tok
struct Attribute{XMLTokenEnum token;OUString value;int getToken()const{return token;}OUString toString()const{return value;}};
namespace xml::sax{using XFastAttributeList=std::vector<Attribute>;}
namespace sax_fastparser{xml::sax::XFastAttributeList&castToFastAttributeList(const Reference<xml::sax::XFastAttributeList>&a){return *a.p;}}
bool IsXMLToken(const Attribute&a,XMLTokenEnum){return a.value==OUString("true");}
class XMLTextListBlockContext;class XMLTextListsHelper;
struct XMLTextListItemContext{};struct XMLNumberedParaContext{};
struct SvXMLImport{std::map<OUString,container::XIndexReplace>rules;bool getBuildIds(sal_Int32&,sal_Int32&){return false;}bool IsTextDocInOOoFileFormat(){return false;}bool IsMSO(){return false;}};
struct SvXMLImportContext{SvXMLImport&import;SvXMLImportContext(SvXMLImport&i):import(i){}SvXMLImport&GetImport(){return import;}};
struct XMLTextImportHelper{XMLTextListsHelper*helper;XMLTextListsHelper&GetTextListHelper(){return *helper;}};
class XMLTextListsHelper{public:
 using tMapForLists=std::map<OUString,std::pair<OUString,OUString>>;std::unique_ptr<tMapForLists>mpProcessedLists,mpMapListIdToListStyleDefaultListId;std::unique_ptr<std::map<OUString,OUString>>mpStyleNameLastListIds;OUString msLastProcessedListId,msListStyleOfLastProcessedList;std::vector<XMLTextListBlockContext*>stack;
 void PushListContext(XMLTextListBlockContext*b){stack.push_back(b);}void PopListContext(){stack.pop_back();}void SetListItem(XMLTextListItemContext*){}void ListContextTop(XMLTextListBlockContext*&b,XMLTextListItemContext*&,XMLNumberedParaContext*&){if(!stack.empty())b=stack.back();}
 void KeepListAsProcessed(const OUString&,const OUString&,const OUString&,const OUString&=EMPTY_OUSTRING);bool IsListProcessed(const OUString&)const;const OUString&GetListStyleOfProcessedList(const OUString&)const;const OUString&GetContinueListIdOfProcessedList(const OUString&)const;const OUString&GetLastProcessedListId()const{return msLastProcessedListId;}const OUString&GetListStyleOfLastProcessedList()const{return msListStyleOfLastProcessedList;}OUString GenerateNewListId()const;OUString GetListIdForListBlock(const XMLTextListBlockContext&);OUString GetLastIdOfStyleName(const OUString&)const;
 static Reference<container::XIndexReplace>MakeNumRule(SvXMLImport&i,const Reference<container::XIndexReplace>&,const OUString&,const OUString&style,sal_Int16&,bool*,bool*){return &i.rules.at(style);}
};
class XMLTextListBlockContext:public SvXMLImportContext{XMLTextImportHelper&mrTxtImport;Reference<container::XIndexReplace>mxNumRules;OUString msListStyleName;Reference<XMLTextListBlockContext>mxParentListBlock;sal_Int16 mnLevel;bool mbRestartNumbering,mbSetDefaults;OUString msListId,msContinueListId;
 public:XMLTextListBlockContext(SvXMLImport&,XMLTextImportHelper&,const Reference<xml::sax::XFastAttributeList>&,bool=false);void endFastElement(sal_Int32);
'''+ '\n'.join(body(header,m) for m in ['sal_Int16 GetLevel() const','bool IsRestartNumbering() const','void ResetRestartNumbering()','const css::uno::Reference < css::container::XIndexReplace >& GetNumRules() const','const OUString& GetListId() const','const OUString& GetContinueListId() const']).replace('css::uno::Reference','Reference').replace('css::container::','container::')+r'''
};
'''+body(block,'XMLTextListBlockContext::XMLTextListBlockContext(')+'\n'+body(block,'void XMLTextListBlockContext::endFastElement(')+'\n'+'\n'.join(body(helper,m) for m in ['void XMLTextListsHelper::KeepListAsProcessed(','bool XMLTextListsHelper::IsListProcessed(','const OUString & XMLTextListsHelper::GetListStyleOfProcessedList(','const OUString & XMLTextListsHelper::GetContinueListIdOfProcessedList(','OUString XMLTextListsHelper::GenerateNewListId() const','OUString XMLTextListsHelper::GetListIdForListBlock(','OUString XMLTextListsHelper::GetLastIdOfStyleName('])+r'''
int main(){int cases;std::cin>>cases;for(int c=0;c<cases;++c){XMLTextListsHelper lists;XMLTextImportHelper text{&lists};SvXMLImport importer;int defaults;std::cin>>defaults;for(const char*s:{"S","T"}){auto&rule=importer.rules[OUString(s)];rule.present=defaults;rule.defaultId=OUString(std::string("D")+s);}int count;std::cin>>count;std::vector<std::unique_ptr<XMLTextListBlockContext>>blocks;for(int i=0;i<count;++i){int op;std::cin>>op;if(op==0){int signal,n;std::cin>>signal>>n;xml::sax::XFastAttributeList attrs;for(int k=0;k<n;++k){int token;std::string value;std::cin>>token>>std::quoted(value);attrs.push_back({static_cast<XMLTokenEnum>(token),OUString(value)});}blocks.push_back(std::make_unique<XMLTextListBlockContext>(importer,text,Reference<xml::sax::XFastAttributeList>(&attrs),signal));auto&b=*blocks.back();std::cout<<b.GetLevel()<<","<<b.IsRestartNumbering()<<","<<std::quoted(b.GetListId().str())<<","<<std::quoted(b.GetContinueListId().str())<<","<<std::quoted(lists.GetListIdForListBlock(b).str())<<","<<std::quoted(lists.GetLastProcessedListId().str())<<","<<std::quoted(lists.GetListStyleOfLastProcessedList().str())<<","<<std::quoted(lists.GetLastIdOfStyleName(OUString("S")).str())<<";";}
 else if(op==1){blocks.back()->ResetRestartNumbering();}
 else if(op==2){blocks.back()->endFastElement(0);blocks.pop_back();}
 else{std::string id;std::cin>>std::quoted(id);std::cout<<lists.IsListProcessed(OUString(id))<<","<<std::quoted(lists.GetListStyleOfProcessedList(OUString(id)).str())<<","<<std::quoted(lists.GetContinueListIdOfProcessedList(OUString(id)).str())<<";";}}
 std::cout<<"\n";}}
'''
# Signature-only class/namespace aliases adapt types; no native body is rewritten.
source=source.replace('const OUString&=EMPTY_OUSTRING','const OUString& value=EMPTY_OUSTRING')
source=source.replace('namespace beans{','namespace beans{').replace('struct XPropertySetInfo:XPropertySet{};','using XPropertySetInfo=XPropertySet;')
(task/'native-import.cxx').write_text(source)
base=123456789000000+20261001;generated='list'+str(base)
def start(attrs,signal=False):return dict(op=0,signal=signal,attrs=attrs)
end=dict(op=2);consume=dict(op=1)
cases=[]
values=[None,'','true','false','1','TRUE',' true ','0']
for defaults,rootflag,childflag,xmlid,continued,style in itertools.product([False,True],values,values,[None,'','B'],[None,'','A','unknown'],['S','T']):
 a=[start([[2,'S'],[0,'A']]),consume,end]
 attrs=[[2,style]]+([] if xmlid is None else [[0,xmlid]])+([] if continued is None else [[3,continued]])+([] if rootflag is None else [[1,rootflag]])
 childattrs=[[0,'nested'],[3,'unknown']]+([] if childflag is None else [[1,childflag]])
 a +=[start(attrs),start(childattrs,True),consume,end,end,dict(op=3,id='A'),dict(op=3,id='B')]
 cases.append(dict(defaults=defaults,actions=a))
for defaults in [False,True]:
 cases +=[dict(defaults=defaults,actions=[start([[2,'S'],[0,'A']]),consume,end,start([[2,'S'],[0,'B'],[3,'A']]),consume,end,start([[2,'S'],[0,'C'],[3,'B']]),start([],True),consume,end,end,dict(op=3,id='C')]),dict(defaults=defaults,actions=[start([[2,'S'],[0,generated]]),end,start([[2,'S']]),end,start([[2,'S']]),end]),dict(defaults=defaults,actions=[start([[2,'S'],[0,'A']]),end,start([[2,'S'],[0,'A'],[1,'true']]),end,start([[2,'T'],[0,'B']]),end,start([[2,'S'],[0,'C'],[1,'true']]),end]),dict(defaults=defaults,actions=[start([[2,'S'],[0,'A']]),end,start([[2,'S'],[0,'A'],[3,'A']]),end])]
request=str(len(cases))+'\n'
for case in cases:
 request+=str(int(case['defaults']))+' '+str(len(case['actions']))+'\n'
 for a in case['actions']:
  request+=str(a['op'])
  if a['op']==0:request+=' '+str(int(a['signal']))+' '+str(len(a['attrs']))+' '+' '.join(str(token)+' '+json.dumps(value) for token,value in a['attrs'])
  if a['op']==3:request+=' '+json.dumps(a['id'])
  request+='\n'
binary=task/'native-import';subprocess.run(['clang++','-std=c++20','-O0',str(task/'native-import.cxx'),'-o',str(binary)],check=True)
try:lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines()
finally:binary.unlink()
assert len(lines)==len(cases)
for case,line in zip(cases,lines,strict=True):case['expected']=line
(task/'native-results.json').write_text(json.dumps(dict(clock=dict(year=2026,month=10,day=1,hour=12,minute=34,second=56,millisecond=789),cases=cases),separators=(',',':'))+'\n')
print(f'Unmodified native block constructor/helper/default projection/generator matched-output evidence: {len(cases)} sequences;explicit adapters,no full native/UNO/legacy/MSO/stable-env claim.')
