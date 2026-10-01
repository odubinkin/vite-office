"""Unmodified pinned tree lifecycle with explicit platform/container/range adapters."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import ast,itertools,json,subprocess
root=Path('.agentplane/tasks/202610010418-7548FA')
source=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNumberTree.cxx').read_text()
node=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text()
list_source=Path('vendor/libreoffice-reference/sw/source/core/doc/list.cxx').read_text()
def block(text,marker):
 start=text.index(marker);brace=text.index('{',start);depth=1;end=brace+1
 while depth:
  depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
old=ast.parse(Path('.agentplane/tasks/202610010041-PHRS94/native-oracle.py').read_text())
assignment=next(s for s in old.body if isinstance(s,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='cpp' for t in s.targets))
expr=assignment.value
while isinstance(expr,ast.BinOp):expr=expr.left
cpp=expr.value
cpp=cpp.replace('struct SwDoc {};','struct SwDoc {};\nusing std::vector;')
cpp=cpp.replace('void InvalidateMe(){}void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}','void InvalidateMe(){}void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}\n void PostRemove(){}void RemoveChild(SwNumberTreeNode*,const SwDoc&);void RemoveMe(const SwDoc&);void MoveChildren(SwNumberTreeNode*);bool HasOnlyPhantoms()const;void SetLevelInListTree(int,const SwDoc&);bool IsContinuous()const{return false;}void InvalidateTree()const;void InvalidateChildren(){SetLastValid(mChildren.end());}')
cpp=cpp.replace('bool IsValid()const{return false;}','bool IsValid()const;bool IsValid(const SwNumberTreeNode*)const;void Validate(const SwNumberTreeNode*)const;void ValidateContinuous(const SwNumberTreeNode*)const{}')
cpp=cpp.replace('long GetNumber(bool=true)const{return mnNumber;}','long GetNumber(bool=true)const;SwNumberTree::tNumberVector GetNumberVector()const;')
cpp=cpp.replace('void SetLastValid(Children::const_iterator it,bool=false)const{mpLastValid=it==mChildren.end()?nullptr:*it;}','void SetLastValid(const Children::const_iterator&,bool=false)const;')
# Native sorted_vector supports range insert in addition to std::set operations.
cpp=cpp.replace('using Children=std::set<SwNumberTreeNode*,Compare>;','struct Children:std::set<SwNumberTreeNode*,Compare>{using std::set<SwNumberTreeNode*,Compare>::insert;void insert(const Children& nodes){insert(nodes.begin(),nodes.end());}};')
cpp=cpp.replace('bool IsNotificationEnabled(const SwDoc&)const{return false;}', 'bool IsNotificationEnabled(const SwDoc&)const{return true;}').replace('void InvalidateMe(){}','void InvalidateMe();void Invalidate(const SwNumberTreeNode*);')
markers=['void SwNumberTreeNode::ValidateHierarchical(', 'void SwNumberTreeNode::GetNumberVector_(', 'bool SwNumberTreeNode::IsCounted() const', 'int SwNumberTreeNode::GetLevelInListTree() const', 'SwNumberTreeNode * SwNumberTreeNode::CreatePhantom()', 'SwNumberTreeNode * SwNumberTreeNode::GetRoot() const', 'void SwNumberTreeNode::ClearObsoletePhantoms()', 'SwNumberTreeNode * SwNumberTreeNode::GetFirstNonPhantomChild()', 'void SwNumberTreeNode::MoveGreaterChildren(', 'void SwNumberTreeNode::AddChild(', 'bool SwNumberTreeNode::HasPhantomCountedParent() const', 'void SwNumberTreeNode::RemoveChild(', 'void SwNumberTreeNode::RemoveMe(', 'void SwNumberTreeNode::MoveChildren(', 'bool SwNumberTreeNode::HasOnlyPhantoms() const', 'void SwNumberTreeNode::SetLevelInListTree(', 'bool SwNumberTreeNode::IsValid() const', 'bool SwNumberTreeNode::IsValid(const', 'void SwNumberTreeNode::Validate(', 'SwNumberTree::tSwNumTreeNumber SwNumberTreeNode::GetNumber(', 'SwNumberTree::tNumberVector SwNumberTreeNode::GetNumberVector()', 'void SwNumberTreeNode::SetLastValid\n', 'void SwNumberTreeNode::InvalidateTree() const','void SwNumberTreeNode::Invalidate(SwNumberTreeNode const', 'void SwNumberTreeNode::InvalidateMe()']
functions=[block(source,m) for m in markers]
functions += [block(node,m) for m in ['bool SwNodeNum::IsCounted() const','bool SwNodeNum::HasCountedChildren() const','bool SwNodeNum::IsCountedForNumbering() const','bool SwNodeNum::IsRestart() const','bool SwNodeNum::IsCountPhantoms() const','bool SwNodeNum::LessThan(', 'SwNumberTreeNode * SwNodeNum::Create() const','SwNumberTree::tSwNumTreeNumber SwNodeNum::GetStartValue() const']]
cpp+='bool Compare::operator()(const SwNumberTreeNode* a,const SwNumberTreeNode* b)const{return a->LessThan(*b);}\n'+'\n\n'.join(functions)
cpp+=r'''
struct SwNodes {};
struct RangeNode {SwNodes* nodes;SwNodes& GetNodes()const{return *nodes;}};
struct SwPosition {RangeNode node;int index;SwPosition(const SwPosition&)=default;SwPosition(SwNodes* n,int i):node{n},index(i){}const RangeNode& GetNode()const{return node;}bool operator<=(const SwPosition& other)const{return index<=other.index;}};
struct SwPaM {SwPosition start,end;SwPaM(SwNodes* n):start(n,0),end(n,100000){}auto StartEnd(){return std::pair{&start,&end};}};
enum class SwListRedlineType {SHOW,HIDDEN,ORIG};
class SwList {
 struct Tree {std::unique_ptr<SwNodeNum> pRoot,pRootRLHidden,pRootOrigText;std::unique_ptr<SwPaM> pSection;};
 std::vector<Tree> maListTrees;
public:
 SwList(SwNumRule* r,SwNodes* n){maListTrees.push_back({std::make_unique<SwNodeNum>(r),std::make_unique<SwNodeNum>(r),std::make_unique<SwNodeNum>(r),std::make_unique<SwPaM>(n)});}
 void InsertListItem(SwNodeNum&,SwListRedlineType,int,const SwDoc&);static void RemoveListItem(SwNodeNum&,const SwDoc&);void InvalidateListTree();void ValidateListTree(const SwDoc&);
};
'''
# Position adapter is supplied by the native text node dependency, not native tree bodies.
cpp=cpp.replace('class SwNodeNum:public SwNumberTreeNode {','struct SwNodes;struct SwPosition;\nclass SwNodeNum:public SwNumberTreeNode {')
cpp=cpp.replace('SwNumRule* mpNumRule;SwTextNode* mpTextNode;','SwNumRule* mpNumRule;SwTextNode* mpTextNode;SwNodes* ownerNodes=nullptr;SwPosition GetPosition()const;')
cpp+='\nSwPosition SwNodeNum::GetPosition()const{return SwPosition(ownerNodes,GetTextNode()->GetIndex());}\n'
functions += [block(list_source,m) for m in ['void SwList::InsertListItem(', 'void SwList::RemoveListItem(', 'void SwList::InvalidateListTree()', 'void SwList::ValidateListTree(']]
cpp+='\n\n'.join(functions[-4:])+r'''
int main(){int count;while(std::cin>>count){
 SwNumRule rule;for(auto& f:rule.formats)std::cin>>f.start;
 SwNodes range;SwList list(&rule,&range);SwDoc doc;
 std::vector<std::unique_ptr<SwTextNode>> texts;std::vector<std::unique_ptr<SwNodeNum>> nodes;std::vector<bool> active(count,false);
 for(int i=0;i<count;i++){int counted,restart;long actual;std::cin>>counted>>restart>>actual;auto t=std::make_unique<SwTextNode>();t->index=i;t->counted=counted;t->restart=restart;t->actualStart=actual;auto n=std::make_unique<SwNodeNum>(t.get(),&rule);n->ownerNodes=&range;texts.push_back(std::move(t));nodes.push_back(std::move(n));}
 int opcount;std::cin>>opcount;
 for(int op=0;op<opcount;op++){int kind,index,value;std::cin>>kind>>index>>value;auto& n=*nodes[index];
  if(kind==0){list.InsertListItem(n,SwListRedlineType::SHOW,value,doc);active[index]=true;}
  if(kind==1){list.RemoveListItem(n,doc);active[index]=false;}
  if(kind==2)n.SetLevelInListTree(value,doc);
  if(kind==3){texts[index]->counted=value;list.InvalidateListTree();}
  if(kind==4){texts[index]->restart=true;texts[index]->actualStart=value;list.InvalidateListTree();}
  if(kind==5)list.ValidateListTree(doc);
  for(int j=count-1;j>=0;j--){auto& item=*nodes[j];if(!active[j]){std::cout<<"0\n";continue;}auto vector=item.GetNumberVector();auto parent=static_cast<SwNodeNum*>(item.GetParent());int parentIndex=parent->GetTextNode()?parent->GetTextNode()->index:(parent->IsPhantom()?-2:-1);
   std::cout<<"1 "<<item.GetNumber()<<' '<<item.mbContinueingPreviousSubTree<<' '<<parentIndex<<' '<<vector.size();for(auto v:vector)std::cout<<' '<<v;std::vector<bool> phantoms;for(auto p=&item;p->GetParent();p=static_cast<SwNodeNum*>(p->GetParent()))phantoms.push_back(p->IsPhantom());for(auto p=phantoms.rbegin();p!=phantoms.rend();p++)std::cout<<' '<<*p;std::cout<<'\n';
  }
 }
}}
'''
probe_source(root.joinpath('native-lifecycle.cxx')).write_text(cpp)
for definition in functions:assert definition in cpp
cases=[]
for shape in [[0,1,2,0],[2,2,0,2],[0,3,1,3],[3,0,3,0],[9,0,9],[0,0,0]]:
 n=len(shape)
 for order in itertools.permutations(range(n)):
  for start in [0,7]:
   ops=[[0,i,shape[i]] for i in order]+[[4,n-1,0],[3,0,0],[1,1,0],[0,1,shape[1]],[2,1,(shape[1]+1)%4],[2,1,shape[1]],[5,0,0]]
   cases.append({'starts':[start,5,3,2,4,6,8,9,10,11], 'items':[{'counted':True,'restart':False,'actualStart':0} for _ in shape], 'ops':ops})
extended=[]
for case in cases:
 for pattern in range(4):
  copy=dict(case)
  count=len(case['items'])
  copy['items']=[{'counted':pattern!=1 or i%2==1,'restart':pattern==2 and i%2==0,'actualStart':0 if i%2==0 else 5} for i in range(count)]
  copy['ops']=case['ops']+[[1,i,0] for i in reversed(range(count))]+[[0,i,[0,2,1,3][i%4]] for i in reversed(range(count))]+[[3,count-1,1],[4,0,5],[5,0,0]]
  extended.append(copy)
cases=extended
request=''.join(str(len(c['items']))+' '+' '.join(map(str,c['starts']))+' '+' '.join(f'{int(i["counted"])} {int(i["restart"])} {i["actualStart"]}' for i in c['items'])+' '+str(len(c['ops']))+' '+' '.join(' '.join(map(str,o)) for o in c['ops'])+'\n' for c in cases)
binary=root/'native-lifecycle'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-lifecycle.cxx')),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
offset=0
for case in cases:
 snapshots=[]
 for op in case['ops']:
  rows=[]
  for i in reversed(range(len(case['items']))):
   row=list(map(int,lines[offset].split()));offset+=1
   rows.append(None if row[0]==0 else {'number':row[1],'continuation':bool(row[2]),'parent':row[3],'vector':row[5:5+row[4]],'phantoms':[bool(x) for x in row[5+row[4]:]]})
  snapshots.append(list(reversed(rows)))
 case['expected']=snapshots
assert offset==len(lines)
root.joinpath('native-results.json').write_text(identity_json(cases,separators=(',',':'))+'\n')
print(f'{len(functions)} unmodified native definitions;{len(cases)} lifecycle sequences/{offset} item states. Single shown range/ASCII rule/text/std::set/enabled insertion invalidation,stub notification delivery and debug adapters;native full constructor/lifetimes/redline/continuous policy not claimed.')
