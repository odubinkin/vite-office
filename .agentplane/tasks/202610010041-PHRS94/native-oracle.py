"""Compile unmodified pinned hierarchical/node-policy/vector bodies.
Dependencies use a std::set ordered container, eager group validation, Arabic/bullet
text/rule stubs and disabled notifications. This is not a full native build.
"""
from pathlib import Path
import json, subprocess
root=Path('.agentplane/tasks/202610010041-PHRS94')
source=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNumberTree.cxx').read_text()
node=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text()
def block(text,marker):
 start=text.index(marker);brace=text.index('{',start);depth=1;end=brace+1
 while depth:
  depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
functions=[block(source,'void SwNumberTreeNode::ValidateHierarchical('),block(source,'void SwNumberTreeNode::GetNumberVector_('),block(source,'bool SwNumberTreeNode::IsCounted() const'),block(source,'int SwNumberTreeNode::GetLevelInListTree() const')]
functions += [block(source,marker) for marker in ['SwNumberTreeNode * SwNumberTreeNode::CreatePhantom()', 'SwNumberTreeNode * SwNumberTreeNode::GetRoot() const', 'void SwNumberTreeNode::ClearObsoletePhantoms()', 'SwNumberTreeNode * SwNumberTreeNode::GetFirstNonPhantomChild()', 'void SwNumberTreeNode::MoveGreaterChildren(', 'void SwNumberTreeNode::AddChild(', 'bool SwNumberTreeNode::HasPhantomCountedParent() const']]
functions += [block(node,marker) for marker in ['bool SwNodeNum::IsCounted() const','bool SwNodeNum::HasCountedChildren() const','bool SwNodeNum::IsCountedForNumbering() const','bool SwNodeNum::IsRestart() const','bool SwNodeNum::IsCountPhantoms() const','bool SwNodeNum::LessThan(', 'SwNumberTreeNode * SwNodeNum::Create() const','SwNumberTree::tSwNumTreeNumber SwNodeNum::GetStartValue() const']]
cpp=r'''
#include <vector>
#include <set>
#include <iterator>
#include <algorithm>
#include <iostream>
#include <memory>
#include <cstdint>
using sal_uInt16=uint16_t;
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
#define OSL_FAIL(message) ((void)0)
struct SwDoc {};
#define OSL_ENSURE(condition,message) ((void)0)
namespace SwNumberTree {using tSwNumTreeNumber=long;using tNumberVector=std::vector<long>;}
constexpr int MAXLEVEL=10;
struct SwNumFormat {long start=1;long GetStart()const{return start;}};
struct SwNumRule {SwNumFormat formats[10];bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}};
struct SwTextNode {int index=0;int GetIndex()const{return index;}bool counted=true,restart=false;long actualStart=0;bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}bool HasNumber()const{return true;}bool HasBullet()const{return false;}};
class SwNumberTreeNode;
struct Compare {bool operator()(const SwNumberTreeNode*,const SwNumberTreeNode*)const;};
using Children=std::set<SwNumberTreeNode*,Compare>;
class SwNumberTreeNode {
public:
 using tSwNumberTreeChildren=Children;
 mutable SwNumberTreeNode* mpLastValid=nullptr;SwNumberTreeNode* mpParent=nullptr;Children mChildren;
 bool mbPhantom=false;mutable long mnNumber=0;mutable bool mbContinueingPreviousSubTree=false;
 virtual ~SwNumberTreeNode()=default;
 virtual bool IsCounted()const;virtual bool IsRestart()const=0;virtual long GetStartValue()const=0;
 virtual bool HasCountedChildren()const=0;virtual bool IsCountedForNumbering()const=0;
 bool IsPhantom()const{return mbPhantom;}virtual bool IsCountPhantoms()const=0;bool HasPhantomCountedParent()const;
 virtual SwNumberTreeNode* Create()const=0;virtual bool LessThan(const SwNumberTreeNode&)const=0;
 SwNumberTreeNode* CreatePhantom();SwNumberTreeNode* GetRoot()const;SwNumberTreeNode* GetFirstNonPhantomChild();
 void ClearObsoletePhantoms();void MoveGreaterChildren(SwNumberTreeNode&,SwNumberTreeNode&);void AddChild(SwNumberTreeNode*,int,const SwDoc&);
 void PreAdd(){}bool IsNotificationEnabled(const SwDoc&)const{return false;}bool IsValid()const{return false;}
 void InvalidateMe(){}void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}
 SwNumberTreeNode* GetParent()const{return mpParent;}int GetChildCount()const{return mChildren.size();}
 int GetLevelInListTree()const;
 auto GetIterator(const SwNumberTreeNode* p)const{return mChildren.find(const_cast<SwNumberTreeNode*>(p));}
 // Number getters are eager reads; complete prefix groups are validated in order by the harness.
 long GetNumber(bool=true)const{return mnNumber;}
 void SetLastValid(Children::const_iterator it,bool=false)const{mpLastValid=it==mChildren.end()?nullptr:*it;}
 void ValidateHierarchical(const SwNumberTreeNode*)const;
 void GetNumberVector_(SwNumberTree::tNumberVector&,bool=true)const;
};
class SwNodeNum:public SwNumberTreeNode {
 SwTextNode* text;SwNumRule* rule;
public:
 SwNumRule* mpNumRule;SwTextNode* mpTextNode;
 SwNodeNum(SwTextNode* n,SwNumRule* r):text(n),rule(r),mpNumRule(r),mpTextNode(n){}
 SwNodeNum(SwNumRule* r):SwNodeNum(nullptr,r){}
 bool IsCountPhantoms()const override;bool LessThan(const SwNumberTreeNode&)const override;SwNumberTreeNode* Create()const override;
 SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return rule;}
 bool IsCounted()const override;bool IsRestart()const override;long GetStartValue()const override;
 bool HasCountedChildren()const override;bool IsCountedForNumbering()const override;
};
''' + 'bool Compare::operator()(const SwNumberTreeNode* a,const SwNumberTreeNode* b)const{return a->LessThan(*b);}' + '\n\n'.join(functions)+r'''
void validate(SwNumberTreeNode& parent){
 if(parent.mChildren.empty())return;
 parent.ValidateHierarchical(*parent.mChildren.rbegin());
 for(auto child:parent.mChildren)validate(*child);
}
int main(){int count;while(std::cin>>count){
 SwNumRule rule;for(auto& f:rule.formats)std::cin>>f.start;
 SwNodeNum root(nullptr,&rule);std::vector<std::unique_ptr<SwTextNode>> texts;std::vector<std::unique_ptr<SwNodeNum>> nodes;
 SwDoc doc;
 for(int i=0;i<count;i++){
  int level, counted, restart;long actual;std::cin>>level>>counted>>restart>>actual;
  auto text=std::make_unique<SwTextNode>();text->index=i;text->counted=counted;text->restart=restart;text->actualStart=actual;
  auto n=std::make_unique<SwNodeNum>(text.get(),&rule);root.AddChild(n.get(),level,doc);
  texts.push_back(std::move(text));nodes.push_back(std::move(n));
 }
 validate(root);
 for(auto& n:nodes){SwNumberTree::tNumberVector vector;n->GetNumberVector_(vector,false);std::cout<<n->mnNumber<<' '<<n->mbContinueingPreviousSubTree<<' '<<vector.size();for(auto number:vector)std::cout<<' '<<number;std::cout<<' '<<vector.size();std::vector<bool> phantoms;for(auto p=n.get();p->GetParent();p=static_cast<SwNodeNum*>(p->GetParent()))phantoms.push_back(p->IsPhantom());for(auto p=phantoms.rbegin();p!=phantoms.rend();p++)std::cout<<' '<<*p;std::cout<<'\n';}
}}
'''
root.joinpath('native-hierarchical-oracle.cxx').write_text(cpp)
shapes=[[2,2,0,2],[2,1,2,0,2],[0,2,2,0,2],[0,3,1,3,0],[2,2,1,2],[9,9,0,9],[0,1,3,1,3],[3,0,3,0,3],[1,3,1,3],[0,0,0]]
cases=[]
for shape in shapes:
 n=len(shape)
 count_masks=range(1<<n) if n<=4 else sorted({0,(1<<n)-1,*[1<<i for i in range(n)],*[(1<<n)-1-(1<<i) for i in range(n)]})
 restart_masks=range(1<<n) if n==3 else [0,(1<<n)-1,*[1<<i for i in range(n)]]
 for starts in [[0]*10,[7,5,3,2,4,6,8,9,10,11]]:
  for count_mask in count_masks:
   for restart_mask in restart_masks:
    cases.append({'starts':starts,'items':[{'level':level,'counted':bool(count_mask&(1<<i)),'restart':bool(restart_mask&(1<<i)),'actualStart':0 if i%2==0 else 5} for i,level in enumerate(shape)]})
request=''.join(str(len(c['items']))+' '+' '.join(map(str,c['starts']))+' '+ ' '.join(f'{item["level"]} {int(item["counted"])} {int(item["restart"])} {item["actualStart"]}' for item in c['items'])+'\n' for c in cases)
binary=root/'native-hierarchical-oracle'
subprocess.run(['clang++','-std=c++20',str(root/'native-hierarchical-oracle.cxx'),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
offset=0
for case in cases:
 rows=[]
 for _ in case['items']:
  values=list(map(int,lines[offset].split()));offset+=1
  rows.append({'number':values[0],'continuation':bool(values[1]),'vector':values[3:3+values[2]],'phantoms':[bool(x) for x in values[4+values[2]:]]})
 case['expected']=rows
assert offset==len(lines)
root.joinpath('native-results.json').write_text(json.dumps(cases,ensure_ascii=True,separators=(',',':'))+'\n')
print(f'Compiled unmodified pinned ValidateHierarchical, node counted/restart/start/descendant policies, GetLevelInListTree and GetNumberVector_; {len(cases)} phantom-enabled cases, {offset} item states. Eager getters, rule/text stubs, std::set ordering and disabled notifications are explicit bounded shims; no full native build.')
