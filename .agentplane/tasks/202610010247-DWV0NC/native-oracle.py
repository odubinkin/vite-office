"""Compile unmodified pinned export transitions and numbering metadata excerpts.

Adapters: platform/ASCII OUString, typed properties/reference/sequence, SAX tag
and start-attribute sink, fixed resolved style, processed-root/style stack and
no continuation-subtree/text-number export. Identity/style attributes and full
UNO/default factories/native lifetime/build are not covered by this probe.
"""
from pathlib import Path
import itertools
import json
import subprocess

root = Path(__file__).resolve().parents[3]
task = Path(__file__).resolve().parent
up = root / 'vendor/libreoffice-reference'

def body(text, marker):
    start = text.index(marker)
    brace = text.index('{', start)
    depth, end = 1, brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[start:end]

export = (up / 'xmloff/source/text/txtparae.cxx').read_text()
metadata = (up / 'xmloff/source/text/XMLTextNumRuleInfo.cxx').read_text()
header = (up / 'xmloff/source/text/XMLTextNumRuleInfo.hxx').read_text()
writer = (up / 'sw/source/core/unocore/unocrsrhelper.cxx').read_text()
getters = ['const OUString& GetNumRulesName() const','sal_Int16 GetListLevelStartValue() const','const OUString& GetListId() const','bool IsListIdDefault() const','sal_Int16 GetLevel() const','bool HasStartValue() const','sal_uInt32 GetStartValue() const','bool IsNumbered() const','bool IsRestart() const','bool IsContinueingPreviousSubTree() const','const OUString& ListLabelString() const']
numbered = body(metadata, 'if( mbIsNumbered )')
format_start = metadata[metadata.index('auto pProp = std::find_if'):metadata.index('auto pProp = std::find_if') + len(metadata[metadata.index('auto pProp = std::find_if'):metadata.index('if (pProp != std::cend(aProps))')])]+body(metadata,'if (pProp != std::cend(aProps))')
source = r'''#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;
struct OUString {std::string value;OUString()=default;OUString(std::string v):value(v){}OUString(const char*v):value(v){}bool isEmpty()const{return value.empty();}void clear(){value.clear();}static OUString number(sal_Int32 n){return OUString(std::to_string(n));}bool operator==(const OUString&r)const{return value==r.value;}bool operator<(const OUString&r)const{return value<r.value;}};
OUString operator""_ustr(const char16_t*s,size_t n){std::string v;for(size_t i=0;i<n;++i)v.push_back(static_cast<char>(s[i]));return OUString(v);}
struct Any {int value;bool operator>>=(bool&out)const{out=value!=0;return true;}bool operator>>=(sal_Int16&out)const{out=static_cast<sal_Int16>(value);return true;}};
struct PropertyValue{OUString Name;Any Value;};template<class T>using Sequence=std::vector<T>;
struct Properties {bool restart;int start;bool hasPropertyByName(const OUString&){return true;}Any getPropertyValue(const OUString&name){return{name==OUString("ParaIsNumberingRestart")?int(restart):start};}};
struct XMLTextNumRuleInfo {
 int*mxNumRules=nullptr;OUString msNumRulesName,msListId,msListLabelString;bool mbListIdIsDefault,mbOutlineStyleAsNormalListStyle,mbContinueingPreviousSubTree;
 sal_Int16 mnListStartValue,mnListLevel,mnListLevelStartValue;bool mbIsNumbered,mbIsRestart;
 XMLTextNumRuleInfo();void Reset();void SetNormalized(int level,bool numbered,bool restart,int start,bool hasFormatStart,int formatStart){Reset();if(level<0)return;msNumRulesName="Numbers";msListId="list1";mnListLevel=static_cast<sal_Int16>(level);mbIsNumbered=numbered;Properties properties{restart,start};auto*xPropSetInfo=&properties;auto*xPropSet=&properties;
''' + numbered + r'''
 Sequence<PropertyValue>aProps;if(hasFormatStart)aProps.push_back({"StartWith",{formatStart}});
''' + format_start + r'''
 ++mnListLevel;}
''' + '\n'.join(body(header,g) for g in getters) + r'''
 bool BelongsToSameList(const XMLTextNumRuleInfo&)const;
};
''' + body(header,'inline void XMLTextNumRuleInfo::Reset()') + '\n' + body(metadata,'XMLTextNumRuleInfo::XMLTextNumRuleInfo()') + '\n' + body(metadata,'bool XMLTextNumRuleInfo::BelongsToSameList(') + r'''
enum XMLTokenEnum {XML_LIST,XML_LIST_ITEM,XML_LIST_HEADER,XML_NUMBER,XML_CONTINUE_LIST,XML_CONTINUE_NUMBERING,XML_ID,XML_START_VALUE,XML_STYLE_NAME,XML_STYLE_OVERRIDE,XML_TRUE};constexpr int XML_NAMESPACE_TEXT=0,XML_NAMESPACE_XML=1;
OUString GetXMLToken(XMLTokenEnum t){return OUString(t==XML_LIST?"list":t==XML_LIST_ITEM?"list-item":t==XML_LIST_HEADER?"list-header":"ignored");}
namespace SvXMLExportFlags{constexpr int OASIS=1;}namespace SvtSaveOptions{constexpr int ODFSVER_012=2;}
struct Namespace{OUString GetQNameByKey(int,const OUString&name)const{return name;}};
struct Export{std::vector<std::string>events;std::string pendingStart;bool hasStart=false;Namespace ns;Namespace&GetNamespaceMap(){return ns;}void AddAttribute(int,XMLTokenEnum token,const OUString&value){if(token==XML_START_VALUE){hasStart=true;pendingStart=value.value;}}void AddAttribute(int,XMLTokenEnum,XMLTokenEnum){}void CheckAttrList(){}void IgnorableWhitespace(){}OUString EncodeStyleName(const OUString&s){return s;}void StartElement(const OUString&s,bool){events.push_back("+"+s.value+(hasStart?":"+pendingStart:""));hasStart=false;}void EndElement(const OUString&s,bool){events.push_back("-"+s.value);}void Characters(const OUString&){}bool exportTextNumberElement(){return false;}int getExportFlags(){return 1;}int getSaneDefaultVersion(){return 3;}};
struct XMLTextListsHelper{std::map<OUString,OUString>processed;std::vector<OUString>styles;int generated=0;bool IsListProcessed(const OUString&id){return processed.contains(id);}void KeepListAsProcessed(const OUString&id,const OUString&style,const OUString&){processed[id]=style;}OUString GenerateNewListId(){return OUString("next"+std::to_string(++generated));}OUString GetLastContinuingListId(const OUString&id){return id;}void StoreLastContinuingList(const OUString&,const OUString&){}OUString GetListStyleOfLastProcessedList(){return OUString("Numbers");}OUString GetLastProcessedListId(){return OUString("list1");}void PushListOnStack(const OUString&,const OUString&style){styles.push_back(style);}void PopListFromStack(){styles.pop_back();}bool EqualsToTopListStyleOnStack(const OUString&style){return !styles.empty()&&styles.back()==style;}};
struct XMLTextParagraphExport{Export output;XMLTextListsHelper helper;XMLTextListsHelper*mpTextListsHelper=&helper;std::vector<OUString>maListElements;Export&GetExport(){return output;}bool ExportListId(){return true;}void exportListChange(const XMLTextNumRuleInfo&,const XMLTextNumRuleInfo&);};
''' + body(export,'void XMLTextParagraphExport::exportListChange(') + r'''
enum PropertyState{PropertyState_DEFAULT_VALUE,PropertyState_DIRECT_VALUE};
namespace sal {template<class T,class U>T static_int_cast(U value){return static_cast<T>(value);}}
struct SwTextNode{bool rule,restart,direct;int start;const void*GetNumRule()const{return rule?this:nullptr;}bool IsListRestart()const{return restart;}bool HasAttrListRestartValue()const{return direct;}int GetAttrListRestartValue()const{return start;}};
struct PointNode{const SwTextNode*node;const SwTextNode*GetTextNode()const{return node;}};
struct SwPaM{PointNode point;const PointNode&GetPointNode()const{return point;}};
''' + body(writer,'sal_Int16 IsNodeNumStart(') + r'''
int main(){int mode,count;while(std::cin>>mode>>count){
 if(mode==0){XMLTextParagraphExport exporter;XMLTextNumRuleInfo previous,next;for(int i=0;i<count;++i){int level,numbered,restart,start,hasFormat,format;std::cin>>level>>numbered>>restart>>start>>hasFormat>>format;next.SetNormalized(level,numbered,restart,start,hasFormat,format);exporter.exportListChange(previous,next);exporter.output.events.push_back("p"+std::to_string(i));previous=next;}XMLTextNumRuleInfo end;exporter.exportListChange(previous,end);for(const auto&e:exporter.output.events)std::cout<<e<<" ";std::cout<<"\n";}
 else if(mode==1){XMLTextNumRuleInfo info;for(int i=0;i<count;++i){int level,numbered,restart,start,hasFormat,format;std::cin>>level>>numbered>>restart>>start>>hasFormat>>format;info.SetNormalized(level,numbered,restart,start,hasFormat,format);std::cout<<info.GetLevel()<<","<<info.IsNumbered()<<","<<info.IsRestart()<<","<<info.HasStartValue()<<","<<info.GetStartValue()<<","<<info.GetListLevelStartValue()<<";";}std::cout<<"\n";}
 else {for(int i=0;i<count;++i){int present,rule,restart,direct,start;std::cin>>present>>rule>>restart>>direct>>start;SwTextNode node{bool(rule),bool(restart),bool(direct),start};SwPaM pam{{present?&node:nullptr}};PropertyState state=PropertyState_DIRECT_VALUE;std::cout<<IsNodeNumStart(pam,state)<<","<<state<<";";}std::cout<<"\n";}
}}
'''
file = task/'native-export.cxx';file.write_text(source)
shapes=[[0,0,0],[2,2,0,2],[0,2,0,2],[0,1,2,1,0],[0,1,0,1],[2,1,2,0,2],[1,3,1,3],[0,1,1,0,1],[9,9,0,9],[0,-1,0],[1,-1,1]]
cases=[]
for shape in shapes:
    for mask,mode,bullet in itertools.product(range(1<<len(shape)),range(6),[False,True]):
        items=[]
        starts=[1]*10 if bullet else [7,5,3]+[1]*7
        for i,level in enumerate(shape):
            restart=mode in [1,3,5] or (mode in [2,4] and i==len(shape)-1)
            start=0 if mode==3 or (mode==5 and i%2==0) else 2 if mode==4 and restart else -1
            items.append(dict(level=level,counted=bool(mask&(1<<i)),restart=restart,start=start,formatStart=starts[level] if level>=0 else None))
        cases.append(dict(bullet=bullet,starts=starts,items=items))
for starts in [[-1,-32768,-2]+[1]*7,[0]*10,[32767]*10]:
    cases.append(dict(bullet=False,starts=starts,items=[dict(level=l,counted=True,restart=True,start=-1,formatStart=starts[l]) for l in [0,1,1,0]]))
metadata_cases=[]
for counted,restart,start,formatStart in itertools.product([False,True],[False,True],[-1,0,2,32767],[None,-1,0,7,-32768,32767]):
    metadata_cases.append([dict(level=1,counted=counted,restart=restart,start=start,formatStart=formatStart),dict(level=-1,counted=False,restart=False,start=-1,formatStart=None),dict(level=0,counted=True,restart=True,start=-1,formatStart=None)])
getters_cases=[dict(present=present,rule=rule,restart=restart,direct=direct,start=start) for present,rule,restart,direct,start in itertools.product([False,True],[False,True],[False,True],[False,True],[0,2,32767])]

def fields(item):return f'{item["level"]} {int(item["counted"])} {int(item["restart"])} {item["start"]} {int(item["formatStart"] is not None)} {item["formatStart"] or 0}'
request=''.join('0 '+str(len(c['items']))+' '+' '.join(fields(i) for i in c['items'])+'\n' for c in cases)
request+=''.join('1 '+str(len(c))+' '+' '.join(fields(i) for i in c)+'\n' for c in metadata_cases)
request+='2 '+str(len(getters_cases))+' '+' '.join(f'{int(c["present"])} {int(c["rule"])} {int(c["restart"])} {int(c["direct"])} {c["start"]}' for c in getters_cases)+'\n'
binary=task/'native-export';subprocess.run(['clang++','-std=c++20','-O0',str(file),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
assert len(lines)==len(cases)+len(metadata_cases)+1
for case,line in zip(cases,lines[:len(cases)],strict=True):case['expected']=line.split()
meta=[]
for inputs,line in zip(metadata_cases,lines[len(cases):-1],strict=True):meta.append(dict(inputs=inputs,expected=[[int(v) for v in p.split(',')] for p in line.split(';') if p]))
getters=[[int(v) for v in p.split(',')] for p in lines[-1].split(';') if p]
(task/'native-results.json').write_text(json.dumps(dict(exports=cases,metadata=meta,getters=dict(inputs=getters_cases,expected=getters)),separators=(',',':'))+'\n')
print(f'Compiled native exportListChange,metadata constructor/reset/getters/numbered/format-start and IsNodeNumStart: {len(cases)} export sequences/{len(meta)*3} metadata states/{len(getters)} raw Writer getter states. Explicit adapters;no full native build.')
