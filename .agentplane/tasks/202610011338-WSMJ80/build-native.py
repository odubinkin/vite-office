from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib,json
out=Path('.agentplane/tasks/202610011338-WSMJ80');root=Path('vendor/libreoffice-reference');ids=[]
def body(path,sig):
 source=(root/path).read_text();a=source.index(sig);i=source.index('{',a)+1;depth=1
 while depth:
  depth+=(source[i]=='{')-(source[i]=='}');i+=1
 value=source[a:i];ids.append({'path':path,'signature':sig,'sha256':hashlib.sha256(value.encode()).hexdigest()});return value
profile=probe_source(Path('.agentplane/tasks/202610011207-TR9DSM/native-format-values.cxx')).read_text().split('void state(')[0]
# Complete existing constructor/copy/get/ref Set/default/assignment bodies remain unchanged.
for path,sig in [('editeng/source/items/numitem.cxx','SvxNumberFormat::SvxNumberFormat( SvxNumType eType )'),('editeng/source/items/numitem.cxx','SvxNumberFormat::SvxNumberFormat(const SvxNumberFormat& rFormat)'),('editeng/source/items/numitem.cxx','SvxNumberFormat& SvxNumberFormat::operator=('),('sw/source/core/doc/number.cxx','SwNumFormat& SwNumFormat::operator=('),('sw/source/core/doc/number.cxx','SwNumFormat::SwNumFormat( const SwNumFormat&'),('sw/source/core/doc/number.cxx','SwNumRule::SwNumRule( UIName'),('sw/source/core/doc/number.cxx','const SwNumFormat& SwNumRule::Get('),('sw/source/core/doc/number.cxx','const SwNumFormat* SwNumRule::GetNumFormat('),('sw/source/core/doc/number.cxx','void SwNumRule::Set( sal_uInt16 i, const SwNumFormat&'),('sw/source/core/doc/number.cxx','SwNumRule::SwNumRule( const SwNumRule&')]:
 assert body(path,sig) in profile,sig
profile=profile.replace('void Set(sal_uInt16,const SwNumFormat&);','void Set(sal_uInt16,const SwNumFormat&);void Set(sal_uInt16,const SwNumFormat*);')
old='struct SwClient {void* registration;SwClient(void* p):registration(p){}void*GetRegisteredInNonConst()const{return registration;}void*GetRegisteredIn()const{return registration;}void StartListeningToSameModifyAs(const SwClient&r){registration=r.registration;}};'
assert old in profile
adapter='''// Named native SwModify Add/Remove registration-container adapter, not the full native broadcaster lifetime.
struct SwModify;namespace sw {template<typename T>struct ClientBase {SwModify*m_pRegisteredIn;ClientBase(SwModify*p):m_pRegisteredIn(nullptr){Register(p);}SwModify*GetRegisteredInNonConst()const{return m_pRegisteredIn;}SwModify*GetRegisteredIn()const{return m_pRegisteredIn;}void Register(SwModify*);void StartListeningToSameModifyAs(const ClientBase&);void EndListeningAll();};}using SwClient=sw::ClientBase<int>;
struct SwModify {std::vector<SwClient*>clients;void Add(SwClient&c){if(c.m_pRegisteredIn==this)return;c.EndListeningAll();clients.push_back(&c);c.m_pRegisteredIn=this;}void Remove(SwClient&c){for(auto i=clients.begin();i!=clients.end();++i)if(*i==&c){clients.erase(i);break;}c.m_pRegisteredIn=nullptr;}};
template<typename T>void sw::ClientBase<T>::Register(SwModify*p){if(p)p->Add(*this);}
'''
# Complete unchanged source bodies; template<class T> platform alias uses the native fields and calls.
for sig in ['template<typename T>\nvoid sw::ClientBase<T>::StartListeningToSameModifyAs(', 'template<typename T>\nvoid sw::ClientBase<T>::EndListeningAll()']:
 adapter+=body('sw/source/core/attr/calbck.cxx',sig)+'\n'
profile=profile.replace(old,adapter)
profile+=body('sw/source/core/doc/number.cxx','void SwNumRule::Set( sal_uInt16 i, const SwNumFormat*')+'\n'
profile+=r'''
void boolout(bool v){std::cout<<(v?"true":"false");}
void state(const SvxNumberFormat&f){std::cout<<"["<<f.GetNumberingType()<<",";boolout(f.IsShowSymbol());std::cout<<","<<f.GetBulletChar()<<",";boolout(f.GetBulletFont().has_value());std::cout<<",\""<<(f.GetBulletFont()?f.GetBulletFont()->GetFamilyName().value:"")<<"\","<<int(f.nStart)<<","<<int(f.nInclUpperLevels)<<","<<f.nAbsLSpace<<","<<f.nFirstLineOffset<<","<<f.nCharTextDistance<<","<<f.mnFirstLineIndent<<","<<f.mnIndentAt<<","<<f.mnListtabPos<<","<<f.meLabelFollowedBy<<","<<f.mePositionAndSpaceMode<<",\""<<f.sPrefix.value<<"\",\""<<f.sSuffix.value<<"\",";boolout(f.HasListFormat());std::cout<<",\""<<(f.HasListFormat()?f.GetListFormat().value:"")<<"\"]";}
void change(SwNumFormat&f,int n){Font font;switch(n){case 1:f.SetStart(7);break;case 2:f.SetIncludeUpperLevels(3);break;case 3:f.SetPrefix("[");break;case 4:f.SetSuffix("]");break;case 5:f.SetListFormat(std::optional<OUString>(""));break;case 6:f.SetListFormat(std::nullopt);break;case 7:f.SetAbsLSpace(11);break;case 8:f.SetFirstLineOffset(-11);break;case 9:f.SetCharTextDistance(11);break;case 10:f.SetFirstLineIndent(-11);break;case 11:f.SetIndentAt(11);break;case 12:f.SetListtabPos(11);break;case 13:f.SetLabelFollowedBy(SvxNumberFormat::NOTHING);break;case 14:f.SetPositionAndSpaceMode(f.mePositionAndSpaceMode==SvxNumberFormat::LABEL_ALIGNMENT?SvxNumberFormat::LABEL_WIDTH_AND_POSITION:SvxNumberFormat::LABEL_ALIGNMENT);break;case 15:f.SetBulletFont(nullptr);break;case 16:f.SetNumberingType(5);break;case 17:f.SetBulletChar(4294967295u);break;case 18:font.SetFamilyName("Alternate");f.SetBulletFont(&font);break;case 19:f.SetShowSymbol(false);break;case 20:f.SetBulletFont(&font);break;case 21:f.SetListFormat(std::optional<OUString>("<%1%.%2%>"));f.SetIncludeUpperLevels(7);break;case 22:f.SetNumberingType(6);break;}}
int main(){std::cout<<"{\"traces\":[";bool first=true;
for(int mode:{0,1})for(int type:{0,1})for(int fontState:{0,1,2})for(int variant=0;variant<25;variant++)for(int pointer:{0,1}){
 SwNumRule rule("profile",static_cast<SvxNumberFormat::SvxNumPositionAndSpaceMode>(mode),type);SwNumFormat initial(rule.Get(2));initial.SetListFormat(std::optional<OUString>("<%1%>"));if(fontState){Font font;if(fontState==2)font.SetFamilyName("OpenSymbol");initial.SetBulletFont(&font);}rule.Set(2,initial);
 auto*held=rule.GetNumFormat(2);SwNumFormat input(*held);change(input,variant);rule.mbInvalidRuleFlag=false;
 if(variant==23)rule.Set(2,static_cast<const SwNumFormat*>(nullptr));else if(variant==24){if(pointer)rule.Set(2,held);else rule.Set(2,*held);}else if(pointer)rule.Set(2,&input);else rule.Set(2,input);
 auto*after=rule.GetNumFormat(2);if(!first)std::cout<<",";first=false;std::cout<<"{\"mode\":"<<mode<<",\"ruleType\":"<<type<<",\"font\":"<<fontState<<",\"change\":"<<variant<<",\"pointer\":"<<pointer<<",\"owned\":";boolout(after!=nullptr);std::cout<<",\"same\":";boolout(after==held);std::cout<<",\"invalid\":";boolout(rule.mbInvalidRuleFlag);std::cout<<",\"value\":";state(rule.Get(2));std::cout<<",\"input\":";state(input);std::cout<<"}";
}
std::cout<<"],\"absent\":[";first=true;for(int mode:{0,1})for(int type:{0,1})for(int present:{0,1}){SwNumRule rule("sparse",static_cast<SvxNumberFormat::SvxNumPositionAndSpaceMode>(mode),type);auto*before=&rule.Get(2);SwNumFormat input(*before);rule.mbInvalidRuleFlag=false;rule.Set(2,present?&input:nullptr);if(!first)std::cout<<",";first=false;std::cout<<"["<<mode<<","<<type<<","<<present<<",";boolout(rule.GetNumFormat(2)!=nullptr);std::cout<<",";boolout(before==&rule.Get(2));std::cout<<",";boolout(rule.mbInvalidRuleFlag);std::cout<<",";state(rule.Get(2));std::cout<<"]";}
std::cout<<"],\"assignment\":[";first=true;for(int variant=0;variant<23;variant++){SwNumFormat input;input.SetListFormat(std::optional<OUString>("<%1%>"));Font font;font.SetFamilyName("OpenSymbol");input.SetBulletFont(&font);change(input,variant);SwNumFormat out;out=input;out=out;if(!first)std::cout<<",";first=false;state(out);}
std::cout<<"],\"registration\":[";SwModify a,b;SwClient firstSource(&a),secondSource(&b),empty(nullptr),client(nullptr);bool comma=false;for(auto*source:{&empty,&firstSource,&firstSource,&secondSource,&empty,&client}){client.StartListeningToSameModifyAs(*source);if(comma)std::cout<<",";comma=true;std::cout<<"["<<(client.GetRegisteredIn()==&a?1:client.GetRegisteredIn()==&b?2:0)<<","<<a.clients.size()<<","<<b.clients.size()<<"]";}
std::cout<<"],\"formatRegistration\":[";SwNumFormat src;src.StartListeningToSameModifyAs(firstSource);SwNumFormat copied(src),assigned;assigned=src;std::cout<<"[";boolout(copied.GetRegisteredIn()==&a);std::cout<<",";boolout(assigned.GetRegisteredIn()==&a);std::cout<<"]";assigned=SwNumFormat();std::cout<<",[";boolout(assigned.GetRegisteredIn()==nullptr);std::cout<<"]]}";}
'''
(probe_source(out/'native-pointer.cxx')).write_text(profile)
(out/'native-identities.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':ids,'priorProfile':'.agentplane/tasks/202610011207-TR9DSM/native-source-identities.json','profileSha256':hashlib.sha256(profile.encode()).hexdigest(),'scope':'Complete unchanged pointer/ref Set,base/Writer assignment/copy/rule-get/default and same-modify transfer bodies. Native SwModify Add/Remove registration container,platform/Font family-only/COW/graphics/null-style/global-service aliases explicitly limit this proof. Local Validate corresponds to a direct native invalid-flag input adapter; native complete tree validation/default global/destructor lifetime is not certified.'},indent=2)+'\n')
