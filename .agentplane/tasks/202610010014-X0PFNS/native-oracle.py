"""Compile unmodified pinned hierarchical/node-policy/vector bodies.
Dependencies use eagerly ordered no-phantom trees, Arabic/bullet numbering-present
text nodes and signed counters. This is not a native full build or phantom audit.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json, subprocess
root=Path('.agentplane/tasks/202610010014-X0PFNS')
source=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNumberTree.cxx').read_text()
node=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text()
def block(text,marker):
 start=text.index(marker);brace=text.index('{',start);depth=1;end=brace+1
 while depth:
  depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
functions=[block(source,'void SwNumberTreeNode::ValidateHierarchical('),block(source,'void SwNumberTreeNode::GetNumberVector_('),block(source,'bool SwNumberTreeNode::IsCounted() const'),block(source,'int SwNumberTreeNode::GetLevelInListTree() const')]
functions += [block(node,marker) for marker in ['bool SwNodeNum::IsCounted() const','bool SwNodeNum::HasCountedChildren() const','bool SwNodeNum::IsCountedForNumbering() const','bool SwNodeNum::IsRestart() const','SwNumberTree::tSwNumTreeNumber SwNodeNum::GetStartValue() const']]
cpp=r'''
#include <vector>
#include <algorithm>
#include <iostream>
#include <memory>
#include <cstdint>
using sal_uInt16=uint16_t;
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
#define OSL_ENSURE(condition,message) ((void)0)
namespace SwNumberTree {using tSwNumTreeNumber=long;using tNumberVector=std::vector<long>;}
constexpr int MAXLEVEL=10;
struct SwNumFormat {long start=1;long GetStart()const{return start;}};
struct SwNumRule {SwNumFormat formats[10];const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}};
struct SwTextNode {bool counted=true,restart=false;long actualStart=0;bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}bool HasNumber()const{return true;}bool HasBullet()const{return false;}};
class SwNumberTreeNode;
struct Children:std::vector<SwNumberTreeNode*> {auto find(const SwNumberTreeNode* p)const{return std::find(begin(),end(),p);}};
class SwNumberTreeNode {
public:
 using tSwNumberTreeChildren=Children;
 mutable SwNumberTreeNode* mpLastValid=nullptr;SwNumberTreeNode* mpParent=nullptr;Children mChildren;
 mutable long mnNumber=0;mutable bool mbContinueingPreviousSubTree=false;
 virtual ~SwNumberTreeNode()=default;
 virtual bool IsCounted()const;virtual bool IsRestart()const=0;virtual long GetStartValue()const=0;
 virtual bool HasCountedChildren()const=0;virtual bool IsCountedForNumbering()const=0;
 bool IsPhantom()const{return false;}bool IsCountPhantoms()const{return false;}bool HasPhantomCountedParent()const{return false;}
 SwNumberTreeNode* GetParent()const{return mpParent;}int GetChildCount()const{return mChildren.size();}
 int GetLevelInListTree()const;
 auto GetIterator(const SwNumberTreeNode* p)const{return mChildren.find(p);}
 // Number getters are eager reads; complete prefix groups are validated in order by the harness.
 long GetNumber(bool=true)const{return mnNumber;}
 void SetLastValid(Children::const_iterator it,bool)const{mpLastValid=*it;}
 void ValidateHierarchical(const SwNumberTreeNode*)const;
 void GetNumberVector_(SwNumberTree::tNumberVector&,bool=true)const;
};
class SwNodeNum:public SwNumberTreeNode {
 SwTextNode* text;SwNumRule* rule;
public:
 SwNodeNum(SwTextNode* n,SwNumRule* r):text(n),rule(r){}
 SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return rule;}
 bool IsCounted()const override;bool IsRestart()const override;long GetStartValue()const override;
 bool HasCountedChildren()const override;bool IsCountedForNumbering()const override;
};
'''+ '\n\n'.join(functions)+r'''
void validate(SwNumberTreeNode& parent){
 if(parent.mChildren.empty())return;
 parent.ValidateHierarchical(parent.mChildren.back());
 for(auto child:parent.mChildren)validate(*child);
}
int main(){int count;while(std::cin>>count){
 SwNumRule rule;for(auto& f:rule.formats)std::cin>>f.start;
 SwNodeNum root(nullptr,&rule);std::vector<std::unique_ptr<SwTextNode>> texts;std::vector<std::unique_ptr<SwNodeNum>> nodes;
 SwNodeNum* levels[10]={};
 for(int i=0;i<count;i++){
  int level, counted, restart;long actual;std::cin>>level>>counted>>restart>>actual;
  auto text=std::make_unique<SwTextNode>();text->counted=counted;text->restart=restart;text->actualStart=actual;
  auto n=std::make_unique<SwNodeNum>(text.get(),&rule);auto parent=level==0?&root:levels[level-1];
  n->mpParent=parent;parent->mChildren.push_back(n.get());levels[level]=n.get();
  for(int deeper=level+1;deeper<10;deeper++)levels[deeper]=nullptr;
  texts.push_back(std::move(text));nodes.push_back(std::move(n));
 }
 validate(root);
 for(auto& n:nodes){SwNumberTree::tNumberVector vector;n->GetNumberVector_(vector,false);std::cout<<n->mnNumber<<' '<<n->mbContinueingPreviousSubTree<<' '<<vector.size();for(auto number:vector)std::cout<<' '<<number;std::cout<<'\n';}
}}
'''
probe_source(root.joinpath('native-hierarchical-oracle.cxx')).write_text(cpp)
shapes=[[0,0,0],[0,1,1,0,1],[0,1,0,1],[0,1,2,1,0],[0,1,0,0,1],[0,1,1,0,1,1]]
cases=[]
for shape in shapes:
 n=len(shape)
 count_masks=range(1<<n) if n<=4 else sorted({0,(1<<n)-1,*[1<<i for i in range(n)],*[(1<<n)-1-(1<<i) for i in range(n)]})
 restart_masks=range(1<<n) if n==3 else [0,(1<<n)-1,*[1<<i for i in range(n)]]
 for starts in [[0]*10,[7,0,3,1,1,1,1,1,1,1]]:
  for count_mask in count_masks:
   for restart_mask in restart_masks:
    cases.append({'starts':starts,'items':[{'level':level,'counted':bool(count_mask&(1<<i)),'restart':bool(restart_mask&(1<<i)),'actualStart':0 if i%2==0 else 5} for i,level in enumerate(shape)]})
request=''.join(str(len(c['items']))+' '+' '.join(map(str,c['starts']))+' '+ ' '.join(f'{item["level"]} {int(item["counted"])} {int(item["restart"])} {item["actualStart"]}' for item in c['items'])+'\n' for c in cases)
binary=root/'native-hierarchical-oracle'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-hierarchical-oracle.cxx')),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
offset=0
for case in cases:
 rows=[]
 for _ in case['items']:
  values=list(map(int,lines[offset].split()));offset+=1
  rows.append({'number':values[0],'continuation':bool(values[1]),'vector':values[3:]})
 case['expected']=rows
assert offset==len(lines)
root.joinpath('native-results.json').write_text(identity_json(cases,ensure_ascii=True,separators=(',',':'))+'\n')
print(f'Compiled unmodified pinned ValidateHierarchical, node counted/restart/start/descendant policies, GetLevelInListTree and GetNumberVector_; {len(cases)} complete no-phantom cases, {offset} item states. Eager getters/ordered tree construction are explicit bounded shims; no full native build.')
