from pathlib import Path
import hashlib,json
root=Path('vendor/libreoffice-reference');out=Path('.agentplane/tasks/202610011309-23WGVW');ids=[]
def body(path,sig):
 s=(root/path).read_text();a=s.index(sig);i=s.index('{',a)+1;depth=1
 while depth:
  depth+=(s[i]=='{')-(s[i]=='}');i+=1
 result=s[a:i];ids.append({'path':path,'signature':sig,'sha256':hashlib.sha256(result.encode()).hexdigest()});return result
# Reuse the previous verified complete constructor/copy/owned Get/effective Get/ref Set/default-table profile.
text=Path('.agentplane/tasks/202610011207-TR9DSM/native-format-values.cxx').read_text().split('void state(')[0]
text=text.replace('SVX_NUM_NUMBER_NONE=5','SVX_NUM_NUMBER_NONE=5,SVX_NUM_BITMAP=8')
text=text.replace('#include <string>','#include <algorithm>\n#include <string>')
text=text.replace('SwNumFormat();SwNumFormat(const SwNumFormat&);','bool IsItemize()const;bool IsEnumeration()const;SwNumFormat();SwNumFormat(const SwNumFormat&);')
for path,sig in [('sw/source/core/doc/number.cxx','SwNumRule::SwNumRule( UIName'),('sw/source/core/doc/number.cxx','const SwNumFormat& SwNumRule::Get('),('sw/source/core/doc/number.cxx','const SwNumFormat* SwNumRule::GetNumFormat(')]:
 # Signatures are found exactly from source below if the formatting has line breaks.
 source=(root/path).read_text()
 if sig not in source:
  candidates={'SwNumRule::SwNumRule( UIName':'SwNumRule::SwNumRule( UIName aName,','const SwNumFormat& SwNumRule::Get(':'const SwNumFormat& SwNumRule::Get( sal_uInt16 i ) const','const SwNumFormat* SwNumRule::GetNumFormat(':'const SwNumFormat* SwNumRule::GetNumFormat(sal_uInt16 i) const'}
  sig=candidates[sig]
 result=body(path,sig);assert result in text,sig
text+='''
// Named shown-record/null-layout and explicit counted/phantom policy adapters. Native full layout/redline lifetimes are not asserted.
struct SwRootFrame{};struct SwTextNode;
struct SwNodeNum {SwTextNode*text;SwNumRule*rule;bool counted,phantom;SwNumRule*GetNumRule()const{return rule;}SwTextNode*GetTextNode()const{return text;}bool IsCounted()const{return counted;}bool IsPhantom()const{return phantom;}bool IsCountedForNumbering()const;};
struct SwTextNode {SwNodeNum*record;int actual,attribute;SwNodeNum*GetNum(const SwRootFrame* = nullptr)const{return record;}int GetActualListLevel()const{return actual;}int GetAttrListLevel()const{return attribute;}bool HasNumber(const SwRootFrame* = nullptr)const;bool HasBullet()const;};
using tSortedNodeNumList=std::vector<const SwNodeNum*>;
// The registry adapter supplies already ordered records; the full native filtering body is unchanged.
struct DocumentListItemsManager {const tSortedNodeNumList*mpListItemsList;void getNumItems(tSortedNodeNumList&)const;};
namespace o3tl {template<typename T>T narrowing(int n){return static_cast<T>(n);}}
'''
for path,sig in [('sw/source/core/doc/number.cxx','bool SwNumFormat::IsItemize() const'),('sw/source/core/doc/number.cxx','bool SwNumFormat::IsEnumeration() const'),('sw/source/core/txtnode/ndtxt.cxx','sal_uInt16 lcl_BoundListLevel(const int nActualLevel)'),('sw/source/core/txtnode/ndtxt.cxx','bool SwTextNode::HasNumber(SwRootFrame const*const pLayout) const'),('sw/source/core/txtnode/ndtxt.cxx','bool SwTextNode::HasBullet() const'),('sw/source/core/txtnode/ndtxt.cxx','bool HasNumberingWhichNeedsLayoutUpdate(const SwTextNode& rTextNode)'),('sw/source/core/SwNumberTree/SwNodeNum.cxx','bool SwNodeNum::IsCountedForNumbering() const'),('sw/source/core/doc/DocumentListItemsManager.cxx','void DocumentListItemsManager::getNumItems(')]:text+=body(path,sig)+'\n'
text+='''
void boolout(bool v){std::cout<<(v?"true":"false");}
int main(){std::cout<<"{\\\"formats\\\":[";bool first=true;
for(int type:{4,5,6,8}) {if(!first)std::cout<<",";first=false;SwNumFormat f;f.SetNumberingType(type);SwNumFormat copy(f);f.SetShowSymbol(false);std::cout<<"["<<type<<",";boolout(f.IsEnumeration());std::cout<<",";boolout(f.IsItemize());std::cout<<",";boolout(copy.IsEnumeration());std::cout<<",";boolout(copy.IsItemize());std::cout<<"]";}
std::cout<<"],\\\"nodes\\\":[";first=true;
// Layout read uses attribute level/raw ownership, classification uses bounded actual level/effective Get.
for(int actual:{-2,-1,0,4,9,10,20})for(int attr:{0,4,9})for(int type:{4,5,6,8})for(int ownership:{0,1})for(int attachment:{0,1,2})for(bool counted:{false,true}) {
 SwNumRule rule("profile",SvxNumberFormat::LABEL_ALIGNMENT);if(ownership){SwNumFormat f;f.SetNumberingType(type);rule.Set(attr,f);}
 SwNodeNum record{nullptr,attachment==2?&rule:nullptr,counted,false};SwTextNode node{attachment==0?nullptr:&record,actual,attr};record.text=&node;
 tSortedNodeNumList items{&record},filtered;DocumentListItemsManager registry{&items};registry.getNumItems(filtered);
 if(!first)std::cout<<",";first=false;std::cout<<"["<<actual<<","<<attr<<","<<type<<","<<ownership<<","<<attachment<<",";boolout(counted);std::cout<<",";boolout(node.HasNumber());std::cout<<",";boolout(node.HasBullet());std::cout<<",";boolout(HasNumberingWhichNeedsLayoutUpdate(node));std::cout<<",";boolout(record.IsCountedForNumbering());std::cout<<","<<filtered.size()<<"]";
}
std::cout<<"],\\\"roots\\\":[";first=true;for(bool counted:{false,true})for(bool phantom:{false,true}){SwNodeNum root{nullptr,nullptr,counted,phantom};if(!first)std::cout<<",";first=false;std::cout<<"[";boolout(counted);std::cout<<",";boolout(phantom);std::cout<<",";boolout(root.IsCountedForNumbering());tSortedNodeNumList items{&root},filtered;DocumentListItemsManager registry{&items};registry.getNumItems(filtered);std::cout<<","<<filtered.size()<<"]";}
std::cout<<"],\\\"registry\\\":[";first=true;for(int mask=0;mask<16;mask++) {
 SwNumRule rules[]={SwNumRule("arabic",SvxNumberFormat::LABEL_ALIGNMENT),SwNumRule("none",SvxNumberFormat::LABEL_ALIGNMENT),SwNumRule("char",SvxNumberFormat::LABEL_ALIGNMENT),SwNumRule("bitmap",SvxNumberFormat::LABEL_ALIGNMENT)};SwTextNode nodes[4]{};SwNodeNum records[4]{};int types[]={4,5,6,8};tSortedNodeNumList items,filtered;
 for(int i=0;i<4;i++){SwNumFormat f;f.SetNumberingType(types[i]);rules[i].Set(0,f);records[i]={&nodes[i],&rules[i],bool(mask&(1<<i)),false};nodes[i]={&records[i],0,0};items.push_back(&records[i]);}DocumentListItemsManager registry{&items};registry.getNumItems(filtered);
 if(!first)std::cout<<",";first=false;std::cout<<"["<<mask<<",[";bool comma=false;for(auto*p:filtered){if(comma)std::cout<<",";comma=true;std::cout<<(p-records);}std::cout<<"]]";
}std::cout<<"]}";}
'''
(out/'native-classification.cxx').write_text(text)
# Native enum and source owner/profile identities, including the previous full format/rule profile.
(out/'native-identities.json').write_text(json.dumps({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':ids,'previousProfile':'.agentplane/tasks/202610011207-TR9DSM/native-source-identities.json','profileSha256':hashlib.sha256(text.encode()).hexdigest(),'scope':'Complete unchanged native predicates/bound-level/counting/registry and actual native rule constructor/Get/GetNumFormat/Set/default tables. Named shown-record/null-layout/count/phantom/already-ordered-container/platform/font/style/graphics aliases are explicit. Native full tree counter algorithm, layout/redline/graphics/Font/service/global lifetimes are not certified; bitmap is scalar classification only.'},indent=2)+'\n')
