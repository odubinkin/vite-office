from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json,subprocess,hashlib
root=Path('.agentplane/tasks/202610011035-VZ3MGM');s=Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text();records=[]
for marker in ['const SwNumFormat& SwNumRule::Get( sal_uInt16 i ) const','const SwNumFormat* SwNumRule::GetNumFormat( sal_uInt16 i ) const','void SwNumRule::Set( sal_uInt16 i, const SwNumFormat& rNumFormat )']:
 a=s.index(marker);b=s.index('{',a);i=b+1;d=1
 while d:d+=(s[i]=='{')-(s[i]=='}');i+=1
 value=s[a:i];records.append({'source':'sw/source/core/doc/number.cxx','marker':marker,'sha256':hashlib.sha256(value.encode()).hexdigest(),'text':value})
(root/'followup-native-format-accessors-identity.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','scope':'three unchanged accessor/reference-Set bodies; named static-base/type/format scalar equality adapters; not full native constructor/factory/format-copy proof','definitions':records},indent=2)+'\n')
pre=r'''
#include <cassert>
#include <memory>
#include <iostream>
using sal_uInt16=unsigned short;
#define OSL_ENSURE(condition,message) assert(condition)
constexpr int MAXLEVEL=10,RULE_END=2;
struct SvxNumberFormat {enum {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT};};
// NAMED MINIMAL FORMAT/BASE ADAPTERS: only accessor identity and self-equal Set control flow.
struct SwNumFormat{int start=1;bool operator!=(const SwNumFormat& other)const{return start!=other.start;}};
struct SwNumRule{std::unique_ptr<SwNumFormat> maFormats[MAXLEVEL];int meRuleType=0,meDefaultNumberFormatPositionAndSpaceMode=SvxNumberFormat::LABEL_ALIGNMENT;bool mbInvalidRuleFlag=true;
 static inline SwNumFormat base;static inline SwNumFormat* saBaseFormats[RULE_END][MAXLEVEL]={};static inline SwNumFormat* saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL]={};
 const SwNumFormat& Get(sal_uInt16)const;const SwNumFormat* GetNumFormat(sal_uInt16)const;void Set(sal_uInt16,const SwNumFormat&);};
'''
main=r'''
int main(){SwNumRule::saLabelAlignmentBaseFormats[0][0]=&SwNumRule::base;SwNumRule rule;std::cout<<"{\"freshRawPresent\":"<<(rule.GetNumFormat(0)?"true":"false")<<",\"effectiveIsSharedBase\":"<<(&rule.Get(0)==&SwNumRule::base?"true":"false");rule.Set(0,rule.Get(0));auto* first=rule.GetNumFormat(0);rule.mbInvalidRuleFlag=false;rule.Set(0,*first);std::cout<<",\"setCreatesOwnedClone\":"<<(first!=&SwNumRule::base?"true":"false")<<",\"equalSetRetainsIdentity\":"<<(rule.GetNumFormat(0)==first?"true":"false")<<",\"equalSetInvalidates\":"<<(rule.mbInvalidRuleFlag?"true":"false")<<"}\n";}
'''
(probe_source(root/'followup-native-formats.cxx')).write_text(pre+'\n'.join(r['text'] for r in records)+main)
binary=root/'followup-native-formats'
try:
 subprocess.run(['clang++','-std=c++20','-fsanitize=address,undefined',str(probe_source(root/'followup-native-formats.cxx')),'-o',str(binary)],check=True)
 result=json.loads(subprocess.check_output([str(binary)],text=True));(root/'followup-native-format-accessors-result.json').write_text(identity_json(result,indent=2)+'\n');print('PASS:'+identity_json(result))
finally:binary.unlink(missing_ok=True)
