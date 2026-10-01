"""Compile unmodified pinned exportListChange and import item-stack methods.
OUString/export ports and Arabic/bullet metadata are bounded stubs. Numbered,
restart and explicit-start inputs follow XMLTextNumRuleInfo::Set's numbered gate;
this does not compile UNO or a full native import/export build.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json, subprocess
root=Path('.agentplane/tasks/202610010112-M2EDTZ')
def block(text,marker):
 start=text.index(marker);brace=text.index('{',start);depth=1;end=brace+1
 while depth:
  depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
export=Path('vendor/libreoffice-reference/xmloff/source/text/txtparae.cxx').read_text()
helper=Path('vendor/libreoffice-reference/xmloff/source/text/txtlists.cxx').read_text()
functions=[block(export,'void XMLTextParagraphExport::exportListChange(')]
functions += [block(helper,marker) for marker in ['void XMLTextListsHelper::PushListContext(\n    XMLTextListBlockContext','void XMLTextListsHelper::PopListContext()', 'void XMLTextListsHelper::ListContextTop(', 'void XMLTextListsHelper::SetListItem(']]
cpp=r'''
#include <string>
#include <vector>
#include <map>
#include <tuple>
#include <stack>
#include <iostream>
#include <cassert>
#include <cstdint>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;
struct OUString {std::string value;OUString()=default;OUString(std::string v):value(v){}bool isEmpty()const{return value.empty();}static OUString number(sal_Int32 n){return OUString(std::to_string(n));}bool operator==(const OUString& r)const{return value==r.value;}bool operator<(const OUString& r)const{return value<r.value;}};
enum XMLTokenEnum {XML_LIST,XML_LIST_ITEM,XML_LIST_HEADER,XML_NUMBER,XML_CONTINUE_LIST,XML_CONTINUE_NUMBERING,XML_ID,XML_START_VALUE,XML_STYLE_NAME,XML_STYLE_OVERRIDE,XML_TRUE};
constexpr int XML_NAMESPACE_TEXT=0,XML_NAMESPACE_XML=1;
OUString GetXMLToken(XMLTokenEnum t){return OUString(t==XML_LIST?"list":t==XML_LIST_ITEM?"list-item":t==XML_LIST_HEADER?"list-header":"ignored");}
namespace SvXMLExportFlags {constexpr int OASIS=1;}
namespace SvtSaveOptions {constexpr int ODFSVER_012=2;}
struct Namespace {OUString GetQNameByKey(int,const OUString& name)const{return name;}};
struct Export {std::vector<std::string> events;Namespace ns;Namespace& GetNamespaceMap(){return ns;}void AddAttribute(int,XMLTokenEnum,const OUString&){}void AddAttribute(int,XMLTokenEnum,XMLTokenEnum){}void CheckAttrList(){}void IgnorableWhitespace(){}OUString EncodeStyleName(const OUString& s){return s;}void StartElement(const OUString& s,bool){events.push_back("+"+s.value);}void EndElement(const OUString& s,bool){events.push_back("-"+s.value);}void Characters(const OUString&){}bool exportTextNumberElement(){return false;}int getExportFlags(){return 1;}int getSaneDefaultVersion(){return 3;}};
struct XMLTextNumRuleInfo {int level=0;bool numbered=false,restart=false;int start=-1;OUString id=OUString("list1"),style=OUString("Counters");int GetLevel()const{return level;}bool BelongsToSameList(const XMLTextNumRuleInfo& other)const{return id==other.id&&style==other.style;}bool IsNumbered()const{return numbered;}bool IsRestart()const{return numbered&&restart;}bool HasStartValue()const{return numbered&&start>=0;}int GetStartValue()const{return start;}int GetListLevelStartValue()const{return 7;}bool IsListIdDefault()const{return false;}bool IsContinueingPreviousSubTree()const{return false;}const OUString& GetListId()const{return id;}const OUString& GetNumRulesName()const{return style;}OUString ListLabelString()const{return OUString();}};
struct XMLTextListBlockContext {};struct XMLTextListItemContext {};struct XMLNumberedParaContext {};
template<typename T>struct Ref {T* p=nullptr;Ref()=default;Ref(T* ptr):p(ptr){}T* get()const{return p;}bool is()const{return p!=nullptr;}Ref& operator=(T* ptr){p=ptr;return *this;}};
struct XMLTextListsHelper {
 std::map<OUString,OUString> processed;std::vector<OUString> styles;std::stack<std::tuple<Ref<XMLTextListBlockContext>,Ref<XMLTextListItemContext>,Ref<XMLNumberedParaContext>>> mListStack;
 void PushListContext(XMLTextListBlockContext*);void PopListContext();void ListContextTop(XMLTextListBlockContext*&,XMLTextListItemContext*&,XMLNumberedParaContext*&);void SetListItem(XMLTextListItemContext*);
 bool IsListProcessed(const OUString& id){return processed.contains(id);}void KeepListAsProcessed(const OUString& id,const OUString& style,const OUString&){processed[id]=style;}OUString GenerateNewListId(){return OUString("next");}OUString GetLastContinuingListId(const OUString& id){return id;}void StoreLastContinuingList(const OUString&,const OUString&){}OUString GetListStyleOfLastProcessedList(){return OUString("Counters");}OUString GetLastProcessedListId(){return OUString("list1");}void PushListOnStack(const OUString&,const OUString& style){styles.push_back(style);}void PopListFromStack(){styles.pop_back();}bool EqualsToTopListStyleOnStack(const OUString& style){return !styles.empty()&&styles.back()==style;}
};
struct XMLTextParagraphExport {Export output;XMLTextListsHelper helper;XMLTextListsHelper* mpTextListsHelper=&helper;std::vector<OUString> maListElements;Export& GetExport(){return output;}bool ExportListId(){return true;}void exportListChange(const XMLTextNumRuleInfo&,const XMLTextNumRuleInfo&);};
'''+ '\n\n'.join(functions)+r'''
int main(){
 // Test the native stack's restored outer item and explicit nested-return clearing.
 XMLTextListsHelper h;XMLTextListBlockContext outer,inner;XMLTextListItemContext item;
 h.PushListContext(&outer);h.SetListItem(&item);h.PushListContext(&inner);
 XMLTextListBlockContext* b=nullptr;XMLTextListItemContext* i=nullptr;XMLNumberedParaContext* p=nullptr;
 h.ListContextTop(b,i,p);assert(b==&inner&&i==nullptr);h.PopListContext();h.ListContextTop(b,i,p);assert(b==&outer&&i==&item);h.SetListItem(nullptr);h.ListContextTop(b,i,p);assert(i==nullptr);h.PopListContext();h.SetListItem(nullptr);
 int count;while(std::cin>>count){XMLTextParagraphExport e;XMLTextNumRuleInfo previous;
 for(int n=0;n<count;n++){XMLTextNumRuleInfo next;int level,counted,restart,start;std::cin>>level>>counted>>restart>>start;next.level=level+1;next.numbered=counted;next.restart=restart;next.start=start;e.exportListChange(previous,next);e.output.events.push_back("p"+std::to_string(n));previous=next;}
 XMLTextNumRuleInfo end;e.exportListChange(previous,end);for(const auto& event:e.output.events)std::cout<<event<<' ';std::cout<<'\n';
 }}
'''
probe_source(root.joinpath('native-list-transport.cxx')).write_text(cpp)
shapes=[[0,0,0],[2,2,0,2],[0,2,0,2],[0,1,2,1,0],[0,1,0,1],[2,1,2,0,2],[1,3,1,3],[0,1,1,0,1],[9,9,0,9]]
cases=[]
for shape in shapes:
 for mask in range(1<<len(shape)):
  for restart_mask in [0,(1<<len(shape))-1]:
   cases.append({'items':[{'level':level,'counted':bool(mask&(1<<i)),'restart':bool(restart_mask&(1<<i)),'start':0 if i%2==0 else 5} for i,level in enumerate(shape)]})
request=''.join(str(len(c['items']))+' '+' '.join(f'{i["level"]} {int(i["counted"])} {int(i["restart"])} {i["start"] if i["restart"] else -1}' for i in c['items'])+'\n' for c in cases)
binary=root/'native-list-transport'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-list-transport.cxx')),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
assert len(lines)==len(cases)
for case,line in zip(cases,lines):case['expected']=line.split()
root.joinpath('native-results.json').write_text(identity_json(cases,separators=(',',':'))+'\n')
print(f'Compiled unmodified exportListChange and item-stack methods; {len(cases)} export event sequences. Explicit OUString/export/metadata/identity/continuation shims, no full native build.')
