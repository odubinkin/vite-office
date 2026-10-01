from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib,json,subprocess
root=Path('.agentplane/tasks/202610011035-VZ3MGM')
records=[]
def read(path):return Path('vendor/libreoffice-reference/'+path).read_text()
def block(path,marker):
 s=read(path);a=s.index(marker);b=s.index('{',a);i=b+1;depth=1
 while depth:depth+=(s[i]=='{')-(s[i]=='}');i+=1
 value=s[a:i];records.append({'source':path,'marker':marker,'sha256':hashlib.sha256(value.encode()).hexdigest(),'text':value});return value
get=block('sw/source/core/txtnode/ndtxt.cxx','SwNumberTree::tSwNumTreeNumber SwTextNode::GetAttrListRestartValue()')
has=block('sw/source/core/txtnode/ndtxt.cxx','bool SwTextNode::HasAttrListRestartValue()')
setget=block('sw/inc/node.hxx','inline const SwAttrSet& SwContentNode::GetSwAttrSet()')
attrget=block('sw/inc/node.hxx','inline const SfxPoolItem& SwContentNode::GetAttr(')
typed=block('sw/inc/node.hxx','    template<class T>\n    const T& GetAttr( TypedWhichId<T>')
ctor=block('include/svl/intitem.hxx','explicit SfxInt16Item(')
valueget=block('include/svl/intitem.hxx','sal_Int16 GetValue() const')
def macro(path,name):
 lines=read(path).splitlines();i=next(i for i,l in enumerate(lines) if l.startswith('#define '+name+'(') or l.startswith('#define '+name+' '));values=[lines[i]]
 while values[-1].endswith('\\'):i+=1;values.append(lines[i])
 value='\n'.join(values);records.append({'source':path,'marker':'#define '+name,'sha256':hashlib.sha256(value.encode()).hexdigest(),'text':value});return value
macros=[macro('include/osl/diagnose.h','OSL_ENSURE'),macro('include/sal/detail/log.h','SAL_DETAIL_LOG_FORMAT'),macro('include/sal/detail/log.h','SAL_DETAIL_WARN_IF_FORMAT')]
s=read('include/sal/detail/log.h');a=s.index('#if defined SAL_LOG_WARN\n');warnbuild=s[a:s.index('#endif',a)+len('#endif')];records.append({'source':'include/sal/detail/log.h','marker':'SAL_LOG_WARN build gate','text':warnbuild,'sha256':hashlib.sha256(warnbuild.encode()).hexdigest()})
(root/'native-source-identity.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':records,'adapters':['platform scalar aliases and TypedWhichId/base Which ownership','map typed direct attrs/pool default1 with real native GetSwAttrSet/GetAttr owner bodies; no style-parent86','sal_detail_logFormat sink captures area/message; native diagnostic macros and build gate unchanged; platform filter/location/backtrace omitted','driver scalar item setup/reset; only getter semantics certified; not full native attribute callbacks/style pool/client lifetime']},indent=2)+'\n')
operations=[['set',84,0],['set',85,1],['set',86,0],['set',85,0],['set',86,7],['set',86,-32768],['set',86,-1],['set',86,32767],['clear',86,0],['clear',84,0],['clear',85,0]]
pre=r'''
#include <cstdint>
#include <cstdarg>
#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_uInt16=uint16_t;
namespace SwNumberTree {using tSwNumTreeNumber=int64_t;}
#define SAL_LOG_TRUE true
#define SAL_LOG_FALSE false
#define SAL_DETAIL_LOG_LEVEL_WARN 1
#define SAL_DETAIL_WHERE "named generated-location adapter"
struct Diagnostic{std::string area,message;};std::vector<Diagnostic> diagnostics;
void sal_detail_logFormat(int,const char* area,const char*,const char* format,...){va_list args;va_start(args,format);diagnostics.push_back({area,va_arg(args,const char*)});va_end(args);}
'''
pre+='\n'+warnbuild+'\n'+'\n'.join(macros)+r'''
struct SfxPoolItem {sal_uInt16 which;explicit SfxPoolItem(sal_uInt16 n):which(n){};virtual ~SfxPoolItem()=default;};
class SfxInt16Item:public SfxPoolItem{sal_Int16 m_nValue;public:
'''+ctor+'\n'+valueget+r'''
};
template<class T>struct TypedWhichId{sal_uInt16 value;constexpr operator sal_uInt16()const{return value;}};
constexpr TypedWhichId<SfxInt16Item> RES_PARATR_LIST_RESTARTVALUE{86};
enum class SfxItemState {DEFAULT,SET};
struct SwAttrSet {std::map<sal_uInt16,SfxInt16Item> attrs;SfxInt16Item fallback{86,1};mutable std::vector<bool> reads;
 SfxItemState GetItemState(sal_uInt16 w,bool)const{return attrs.contains(w)?SfxItemState::SET:SfxItemState::DEFAULT;}
 const SfxPoolItem& Get(sal_uInt16 w,bool inParent)const{reads.push_back(inParent);auto it=attrs.find(w);return it!=attrs.end()?it->second:fallback;}
};
struct SwFormatColl {SwAttrSet attributes;const SwAttrSet& GetAttrSet()const{return attributes;}};
struct SwContentNode {std::optional<SwAttrSet> mpAttrSet;SwFormatColl collection;
 const SwAttrSet* GetpSwAttrSet()const{return mpAttrSet?&*mpAttrSet:nullptr;}
 const SwFormatColl& GetAnyFormatColl()const{return collection;}
 const SwAttrSet& GetSwAttrSet()const;
 const SfxPoolItem& GetAttr(sal_uInt16 nWhich,bool bInParents=true)const;
'''+typed+r'''
};
struct SwTextNode:SwContentNode {bool HasAttrListRestartValue()const;SwNumberTree::tSwNumTreeNumber GetAttrListRestartValue()const;
 void Set(int w,int v){if(!mpAttrSet)mpAttrSet.emplace();mpAttrSet->attrs.insert_or_assign(w,SfxInt16Item(w,v));}
 void Clear(int w){if(mpAttrSet){mpAttrSet->attrs.erase(w);if(mpAttrSet->attrs.empty())mpAttrSet.reset();}}
 void Print(){const auto count=mpAttrSet?mpAttrSet->attrs.size():0;const bool direct=HasAttrListRestartValue();diagnostics.clear();auto& reads=GetSwAttrSet().reads;reads.clear();const auto result=GetAttrListRestartValue();std::cout<<"{\"value\":"<<result<<",\"direct\":"<<(direct?"true":"false")<<",\"count\":"<<count<<",\"allocated\":"<<(mpAttrSet?"true":"false")<<",\"inParent\":"<<(reads.size()==1&&reads[0]?"true":"false")<<",\"diagnostics\":[";bool comma=false;for(auto& d:diagnostics){if(comma)std::cout<<",";comma=true;std::cout<<"{\"area\":\""<<d.area<<"\",\"message\":\""<<d.message<<"\"}";}std::cout<<"]}";if(direct!=HasAttrListRestartValue()||count!=(mpAttrSet?mpAttrSet->attrs.size():0))std::abort();}
};
'''
main='int main(){SwTextNode n;std::cout<<"[";n.Print();\n'
for op,w,v in operations:main+=f'n.{"Set" if op=="set" else "Clear"}({w}{","+str(v) if op=="set" else ""});std::cout<<",";n.Print();\n'
main+='std::cout<<"]\\n";}\n'
(probe_source(root/'native-getter.cxx')).write_text(pre+'\n'+setget+'\n'+attrget+'\n'+has+'\n'+get+'\n'+main)
profiles=[];binary=root/'native-getter'
try:
 for enabled in [False,True]:
  cmd=['clang++','-std=c++20','-fsanitize=address,undefined','-fno-omit-frame-pointer']+(['-DSAL_LOG_WARN'] if enabled else [])+[str(probe_source(root/'native-getter.cxx')),'-o',str(binary)]
  subprocess.run(cmd,check=True);states=json.loads(subprocess.check_output([str(binary)],text=True));profiles.append({'warnings':enabled,'states':states})
 fixture={'pin':'9bc445578031fecf56086729d8e4940c77e14d65','scope':'unchanged native getter/Has/effective attribute owners and OSL/SAL warning chain; explicit item/default/log sink adapters; warning-enabled browser console adaptation','operations':operations,'profiles':profiles}
 (root/'native-result.json').write_text(identity_json(fixture,indent=2)+'\n')
 Path('apps/office/src/test/writer-native-restart-getter.json').write_text(identity_json(fixture,indent=2)+'\n')
 assert [x['value'] for x in profiles[0]['states']]==[x['value'] for x in profiles[1]['states']]
 print(f'PASS: {len(records)} unchanged bodies/macros/build definitions; {len(profiles)} warning profiles; {sum(len(p["states"]) for p in profiles)} states; ASan/UBSan')
finally:binary.unlink(missing_ok=True)
