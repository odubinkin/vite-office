from pathlib import Path
import hashlib,json,subprocess
root=Path('.agentplane/tasks/202610011012-HMMTBX')
source_path='sw/source/core/txtnode/ndtxt.cxx'
s=Path('vendor/libreoffice-reference/'+source_path).read_text()
def block(marker):
 a=s.index(marker); b=s.index('{',a); i=b+1; depth=1
 while depth: depth+=(s[i]=='{')-(s[i]=='}'); i+=1
 return s[a:i]
markers=['void SwTextNode::SetListRestart(', 'bool SwTextNode::IsListRestart()', 'void SwTextNode::SetAttrListRestartValue(', 'bool SwTextNode::HasAttrListRestartValue()', 'SwNumberTree::tSwNumTreeNumber SwTextNode::GetAttrListRestartValue()', 'SwNumberTree::tSwNumTreeNumber SwTextNode::GetActualListStartValue()']
records=[{'source':source_path,'marker':m,'sha256':hashlib.sha256(block(m).encode()).hexdigest(),'text':block(m)} for m in markers]
(root/'native-source-identity.json').write_text(json.dumps({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':records,'adapters':['fixed Which85/86 typed item payloads; map direct-item storage with pool false/1 and optional parent9','SetAttr/ResetAttr attempt recorder; not native callbacks/cache/style-access','signed 64-bit tools::Long and sal_Int16 platform types; exact integer inputs only','OSL_ENSURE precondition assertion; only valid direct-value getter calls','optional rule/format start9 and zero level; no full native numbering tree']},indent=2)+'\n')
cases=[{'name':'missing-value-reset-and-flags','parent':False,'rule':False,'operations':[['value',65535],['flag',False],['flag',True],['flag',True],['flag',False]]},{'name':'retain-seven-across-flags','parent':False,'rule':True,'operations':[['value',7],['flag',True],['flag',False],['flag',True],['value',7],['value',0],['flag',False],['flag',True],['value',65535],['value',65535]]},{'name':'parent-is-not-direct','parent':True,'rule':True,'operations':[['flag',True],['value',9],['value',9],['flag',False],['value',65535],['flag',True]]},{'name':'signed-narrowing','parent':False,'rule':False,'operations':[['flag',True]]+[['value',n] for n in [-1,-1,32768,-32768,40000,40000,-25536,65534,65535,65536,0,-32769,131071,4294967303,9007199254740991,-9007199254740991]]}]
pre=r'''
#include <cassert>
#include <climits>
#include <cstdint>
#include <iostream>
#include <map>
#include <vector>
using sal_Int16=int16_t; using sal_uInt16=uint16_t;
namespace SwNumberTree { using tSwNumTreeNumber=int64_t; }
namespace o3tl { template<class T,class U> T narrowing(U v){return static_cast<T>(v);} }
#define OSL_ENSURE(condition,message) assert(condition)
constexpr int RES_PARATR_LIST_ISRESTART=85,RES_PARATR_LIST_RESTARTVALUE=86;
enum class SfxItemState { DEFAULT,SET };
struct SfxBoolItem { int which;bool value;SfxBoolItem(int w,bool v):which(w),value(v){};bool GetValue()const{return value;} };
struct SfxInt16Item { int which;sal_Int16 value;SfxInt16Item(int w,sal_Int16 v):which(w),value(v){};sal_Int16 GetValue()const{return value;} };
struct Attr { SfxBoolItem boolean; SfxInt16Item integer;operator const SfxBoolItem&()const{return boolean;}operator const SfxInt16Item&()const{return integer;} };
struct SwAttrSet { std::map<int,int64_t> values; SfxItemState GetItemState(int w,bool)const {return values.contains(w)?SfxItemState::SET:SfxItemState::DEFAULT;} };
struct SwNumFormat {int GetStart()const{return 9;}};
struct SwNumRule {SwNumFormat format;const SwNumFormat* GetNumFormat(sal_uInt16)const{return &format;}};
struct Call {bool set;int which;int64_t value;};
struct SwTextNode {
 SwAttrSet attributes; bool parent=false,hasRule=false; SwNumRule rule; std::vector<Call> calls;
 const SwAttrSet* GetpSwAttrSet()const{return &attributes;}
 Attr GetAttr(int w)const{auto it=attributes.values.find(w); auto v=it!=attributes.values.end()?it->second:(w==85?0:(parent?9:1));return {{w,v!=0},{w,static_cast<sal_Int16>(v)}};}
 void SetAttr(const SfxBoolItem& i){calls.push_back({true,i.which,i.value});attributes.values[i.which]=i.value;}
 void SetAttr(const SfxInt16Item& i){calls.push_back({true,i.which,i.value});attributes.values[i.which]=i.value;}
 void ResetAttr(int w){calls.push_back({false,w,0});attributes.values.erase(w);}
 SwNumRule* GetNumRule()const{return hasRule?const_cast<SwNumRule*>(&rule):nullptr;}
 int GetAttrListLevel()const{return 0;}
 void SetListRestart(bool); bool IsListRestart()const;
 void SetAttrListRestartValue(SwNumberTree::tSwNumTreeNumber);
 bool HasAttrListRestartValue()const;
 SwNumberTree::tSwNumTreeNumber GetAttrListRestartValue()const,GetActualListStartValue()const;
 void Print(){std::cout<<"{\"restart\":"<<(IsListRestart()?"true":"false")<<",\"direct\":"; if(HasAttrListRestartValue())std::cout<<GetAttrListRestartValue();else std::cout<<"null";std::cout<<",\"effective\":"<<static_cast<const SfxInt16Item&>(GetAttr(86)).GetValue()<<",\"start\":"<<GetActualListStartValue()<<",\"calls\":[";bool comma=false;for(auto c:calls){if(comma)std::cout<<",";comma=true;std::cout<<"[\""<<(c.set?"set":"reset")<<"\","<<c.which;if(c.set)std::cout<<","<<c.value;std::cout<<"]";}std::cout<<"]}";calls.clear();}
};
'''
main='int main(){std::cout<<"[";\n'
for i,case in enumerate(cases):
 main+=('{SwTextNode n;n.parent='+str(case['parent']).lower()+';n.hasRule='+str(case['rule']).lower()+';std::cout<<'+json.dumps((',' if i else '')+'[')+';n.Print();\n')
 for op,v in case['operations']:
  val=str(v).lower() if isinstance(v,bool) else str(v)+'LL'
  main+=f'n.{"SetListRestart" if op=="flag" else "SetAttrListRestartValue"}({val});std::cout<<",";n.Print();\n'
 main+='std::cout<<"]";}\n'
main+='std::cout<<"]\\n";}\n'
(root/'native-restart.cxx').write_text(pre+'\n'.join(r['text'] for r in records)+'\n'+main)
binary=root/'native-restart'
try:
 subprocess.run(['clang++','-std=c++20',str(root/'native-restart.cxx'),'-o',str(binary)],check=True)
 traces=json.loads(subprocess.check_output([str(binary)],text=True))
 for case,trace in zip(cases,traces):case['states']=trace
 fixture={'pin':'9bc445578031fecf56086729d8e4940c77e14d65','scope':'six complete unchanged native restart definitions; named direct-item/type/format adapters; valid direct getters and exact JS integer inputs only','cases':cases}
 (root/'native-result.json').write_text(json.dumps(fixture,indent=2)+'\n')
 target=Path('apps/office/src/test/fixtures/writer-native-list-restart.json');target.write_text(json.dumps(fixture,indent=2)+'\n')
 print(f'PASS: {len(records)} unchanged source definitions; {len(cases)} cases; {sum(len(c["states"]) for c in cases)} literal native states')
finally:binary.unlink(missing_ok=True)
