"""Compile full pinned shown numbering lifecycle with explicit platform dependencies."""
from pathlib import Path
import json,subprocess,itertools
root=Path('.agentplane/tasks/202610010449-CE6KDW')
base=Path('.agentplane/tasks/202610010418-7548FA/native-lifecycle.cxx').read_text().split('int main(){',1)[0]
textsrc=Path('vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx').read_text()
nodesrc=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text()
rulesrc=Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text()
registrysrc=Path('vendor/libreoffice-reference/sw/source/core/doc/DocumentListItemsManager.cxx').read_text()
def block(text,marker):
 start=text.index(marker);brace=text.index('{',start);depth=1;end=brace+1
 while depth:
  depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
# Keep all prior unmodified tree/rule policy bodies and add real shown ownership dependencies.
base=base.replace('#include <cstdint>','#include <cstdint>\n#include <string>\n#include <map>\n#include <cassert>')
base=base.replace('struct SwDoc {};',r'''
class SwTextNode;class SwNodeNum;class SwList;struct SwNodes;struct ListAccess;namespace sw {class DocumentListItemsManager;}
struct OUString:std::string {using std::string::string;bool isEmpty()const{return empty();}};
using UIName=OUString;
enum class SwListRedlineType {SHOW,HIDDEN,ORIGTEXT};
struct SwRootFrame {bool IsHideRedlines()const{return false;}};
struct SwTextFrame {SwRootFrame* getRootFrame(){return nullptr;}SwTextNode* GetTextNodeForParaProps(){return nullptr;}};
struct SwDocShell {bool IsChangeRecording()const{return false;}};
enum class RedlineType {Insert,Delete};
struct SwRangeRedline {int Start()const{return 0;}int End()const{return 0;}};
struct SwRedlineTable:std::vector<SwRangeRedline*> {using size_type=std::size_t;static constexpr size_type npos=-1;};
struct RedlineAccess {SwRedlineTable table;const SwRedlineTable& GetRedlineTable()const{return table;}std::size_t GetRedlinePos(const SwTextNode&,RedlineType)const{return SwRedlineTable::npos;}};
using SwNodeOffset=int;
namespace sw {enum class IteratorMode {UnwrapMulti};}
template<class A,class B,sw::IteratorMode C>struct SwIterator {SwIterator(B&){}A* First(){return nullptr;}A* Next(){return nullptr;}};
struct SwDoc {ListAccess* lists;sw::DocumentListItemsManager* items;SwNodes* nodes;ListAccess& getIDocumentListsAccess()const;sw::DocumentListItemsManager& getIDocumentListItems()const;SwNodes& GetNodes()const;SwDocShell* GetDocShell(){return nullptr;}bool IsInXMLImport()const{return false;}bool IsInWriterfilterImport()const{return false;}RedlineAccess& getIDocumentRedlineAccess(){static RedlineAccess access;return access;}};
namespace comphelper {bool IsFuzzing(){return false;}}
namespace o3tl {template<class T>using sorted_vector=std::set<T>;}
''')
# Dependencies needed for complete AddToList redline branches, deliberately unreachable in shown-only cases.
base=base.replace('struct SwRangeRedline {int Start()const{return 0;}int End()const{return 0;}};', 'struct SwRangePos {struct Node {int GetIndex()const{return 0;}};Node GetNode()const{return {};}int GetNodeIndex()const{return 0;}};using SwPositionBase=SwRangePos;struct SwRangeRedline {const SwRangePos* Start()const{static SwRangePos p;return &p;}const SwRangePos* End()const{static SwRangePos p;return &p;}};')
start=base.index('struct SwNumFormat ');end=base.index('class SwNumberTreeNode;',start)
base=base[:start]+r'''
struct SwNumFormat {long start=1;bool bullet=false;long GetStart()const{return start;}bool IsEnumeration()const{return !bullet;}bool IsItemize()const{return bullet;}};
struct SwNumRule {using tTextNodeList=std::vector<SwTextNode*>;tTextNodeList maTextNodeList;bool mbInvalidRuleFlag=true;OUString name="Counters";SwNumFormat formats[10];bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}const SwNumFormat& Get(sal_uInt16 level)const{return formats[level];}const UIName& GetName()const{return name;}void GetTextNodeList(tTextNodeList&)const;std::size_t GetTextNodeListSize()const;void AddTextNode(SwTextNode&);void RemoveTextNode(SwTextNode&);void Validate(const SwDoc&);};
struct SwNodes {SwDoc* owner;bool canonical=true;bool IsDocNodes()const;};
struct SwTextNode {
 int index=0;bool counted=true,restart=false;long actualStart=0;int level=0;bool canonical=true;SwDoc* doc;SwNodes* nodes;SwNumRule* rule;OUString listId="A";
 std::unique_ptr<SwNodeNum> mpNodeNum,mpNodeNumRLHidden,mpNodeNumOrig;
 int GetIndex()const{return index;}SwDoc& GetDoc()const{return *doc;}SwNodes& GetNodes()const{return *nodes;}OUString GetListId()const{return listId;}SwNumRule* GetNumRule()const{return rule;}int GetAttrListLevel()const{return level;}int GetActualListLevel()const;
 bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}
 sw::DocumentListItemsManager& getIDocumentListItems()const;const SwNodeNum* GetNum(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;SwNumberTree::tNumberVector GetNumberVector(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;
 bool IsInList()const;void AddToList();void RemoveFromList();bool HasNumber(const SwRootFrame* =nullptr)const;bool HasBullet()const;
 void AddToListOrig(){}void AddToListRLHidden(){}void RemoveFromListOrig(){}void RemoveFromListRLHidden(){}void SetWordCountDirty(bool){}
};
''' +base[end:]
base=base.replace('void PreAdd(){}','virtual void PreAdd(){}').replace('void PostRemove(){}','virtual void PostRemove(){}')
base=base.replace('SwNumRule* GetNumRule()const{return rule;}','SwNumRule* GetNumRule()const{return mpNumRule;}',1 if False else 0) if False else base
# Only derived record getter owns a retained rule; text getter still resolves attributes.
base=base.replace('SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return rule;}','SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return mpNumRule;}')
base=base.replace('SwNodeNum(SwNumRule* r):SwNodeNum(nullptr,r){}','SwNodeNum(SwNumRule* r):SwNodeNum(nullptr,r){}\n SwNodeNum(SwTextNode* n,bool):SwNodeNum(n,static_cast<SwNumRule*>(nullptr)){ownerNodes=n->nodes;}void PreAdd()override;void PostRemove()override;void ChangeNumRule(SwNumRule&);')
base=base.replace('struct SwNodes {};','').replace('enum class SwListRedlineType {SHOW,HIDDEN,ORIG};','').replace('SwListRedlineType::ORIG','SwListRedlineType::ORIGTEXT')
# Old SwPosition range shim also supplies the redline position dependency API.
base=base.replace('struct RangeNode {SwNodes* nodes;', 'struct RangeNode {int GetIndex()const{return 0;}SwNodes* nodes;')
base=base.replace('struct SwPosition {RangeNode node;', 'struct SwPosition:SwRangePos {RangeNode node;')
base=base.replace('const SwPosition* pRStt = pTmp->Start();','const SwPosition* pRStt = pTmp->Start();')
# Native AddToList source refers to SwPosition; redline storage uses a null conversion adapter.
base=base.replace('const SwRangePos* Start()const{static SwRangePos p;return &p;}const SwRangePos* End()const{static SwRangePos p;return &p;}','const struct SwPosition* Start()const{return nullptr;}const struct SwPosition* End()const{return nullptr;}')
# Avoid double ORIGTEXT replacement in enum declaration.
base=base.replace('ORIGTEXTTEXT','ORIGTEXT')
base+=r'''
namespace sw {
class DocumentListItemsManager {
 struct lessThanNodeNum {bool operator()(const SwNodeNum* a,const SwNodeNum* b)const{return a->LessThan(*b);}};
 using tImplSortedNodeNumList=std::set<const SwNodeNum*,lessThanNodeNum>;
 std::unique_ptr<tImplSortedNodeNumList> mpListItemsList=std::make_unique<tImplSortedNodeNumList>();
public:
 using tSortedNodeNumList=std::vector<const SwNodeNum*>;
 void addListItem(const SwNodeNum&);void removeListItem(const SwNodeNum&);void getNumItems(tSortedNodeNumList&)const;
};
}
struct ListAccess {SwNodes* nodes;std::map<std::string,SwNumRule*> rules;std::map<std::string,std::unique_ptr<SwList>> lists;SwList* getListByName(const OUString& id)const{auto it=lists.find(id);return it==lists.end()?nullptr:it->second.get();}SwList* createList(const OUString& id,const UIName& style){auto list=std::make_unique<SwList>(rules.at(style),nodes);auto p=list.get();lists.emplace(id,std::move(list));return p;}};
ListAccess& SwDoc::getIDocumentListsAccess()const{return *lists;}sw::DocumentListItemsManager& SwDoc::getIDocumentListItems()const{return *items;}SwNodes& SwDoc::GetNodes()const{return *nodes;}
sw::DocumentListItemsManager& SwTextNode::getIDocumentListItems()const{return GetDoc().getIDocumentListItems();}
int SwTextNode::GetActualListLevel()const{return GetNum()?GetNum()->GetLevelInListTree():-1;}
sal_uInt16 lcl_BoundListLevel(int level){return static_cast<sal_uInt16>(std::clamp(level,0,MAXLEVEL-1));}
'''
functions=[block(textsrc,m) for m in ['const SwNodeNum* SwTextNode::GetNum(', 'SwNumberTree::tNumberVector\nSwTextNode::GetNumberVector(', 'bool SwTextNode::IsInList() const','static SwList * FindList(', 'void SwTextNode::AddToList()', 'void SwTextNode::RemoveFromList()', 'bool SwTextNode::HasNumber(', 'bool SwTextNode::HasBullet() const']]
functions += [block(nodesrc,m) for m in ['void SwNodeNum::PreAdd()', 'void SwNodeNum::PostRemove()', 'void SwNodeNum::ChangeNumRule(']]
functions += [block(rulesrc,m) for m in ['void SwNumRule::GetTextNodeList(', 'SwNumRule::tTextNodeList::size_type SwNumRule::GetTextNodeListSize()', 'void SwNumRule::AddTextNode(', 'void SwNumRule::RemoveTextNode(', 'void SwNumRule::Validate(']]
functions += [block(registrysrc,m) for m in ['void DocumentListItemsManager::addListItem(', 'void DocumentListItemsManager::removeListItem(', 'void DocumentListItemsManager::getNumItems(']]
nodearr=Path('vendor/libreoffice-reference/sw/source/core/docnode/nodes.cxx').read_text();functions.append(block(nodearr,'bool SwNodes::IsDocNodes() const'))
# Native identity member name dependency, without modifying IsDocNodes body.
base=base.replace('struct SwNodes {SwDoc* owner;', 'struct SwNodes {SwDoc* owner;SwDoc& m_rMyDoc;SwNodes(SwDoc* d):owner(d),m_rMyDoc(*d){}')
# Dependencies: hidden-redline constructor flag is false in all shown cases.
base=base.replace('SwNumRule* mpNumRule;SwTextNode* mpTextNode;', 'bool m_isHiddenRedlines=false;SwNumRule* mpNumRule;SwTextNode* mpTextNode;')
base+='\n\n'.join(functions[:16])+'\nnamespace sw {\n'+'\n\n'.join(functions[16:19])+'\n}\n'+functions[19]
base+=r'''
int main(){int count;while(std::cin>>count){
 SwDoc doc;SwNodes nodes(&doc);sw::DocumentListItemsManager registry;ListAccess access;access.nodes=&nodes;doc.nodes=&nodes;doc.lists=&access;doc.items=&registry;
 SwNumRule rule,other;other.name="Other";for(int i=0;i<10;i++){std::cin>>rule.formats[i].start;other.formats[i].start=rule.formats[i].start+10;}access.rules[rule.name]=&rule;access.rules[other.name]=&other;
 std::vector<std::unique_ptr<SwTextNode>> texts;
 for(int i=0;i<count;i++){auto t=std::make_unique<SwTextNode>();t->index=i;t->doc=&doc;t->nodes=&nodes;t->rule=&rule;std::cin>>t->level>>t->counted>>t->restart>>t->actualStart;texts.push_back(std::move(t));}
 int ops;std::cin>>ops;
 for(int op=0;op<ops;op++){int kind,index,value;std::cin>>kind>>index>>value;auto& t=*texts[index];
  if(kind==0)t.AddToList();
  if(kind==1)t.RemoveFromList();
  if(kind==2){t.level=value;if(t.mpNodeNum)t.mpNodeNum->SetLevelInListTree(value,doc);}
  if(kind==3){t.counted=value;access.getListByName(t.listId)->InvalidateListTree();}
  if(kind==4){t.restart=true;t.actualStart=value;access.getListByName(t.listId)->InvalidateListTree();}
  if(kind==5){t.RemoveFromList();t.rule=value?&other:&rule;t.AddToList();}
  if(kind==6){t.RemoveFromList();t.listId=value?"B":"A";t.AddToList();}
  if(kind==7){rule.formats[0].bullet=value;other.formats[0].bullet=value;}
  if(kind==8){auto n=t.mpNodeNum.get();n->RemoveMe(doc);access.getListByName(t.listId)->InsertListItem(*n,SwListRedlineType::SHOW,t.level,doc);}
  if(kind==9)rule.Validate(doc);
  if(kind==10){if(t.GetNum())t.GetNum()->GetNumber();}
  // Observe the first node lazily, then raw tails before complete reverse reads.
  if(texts[0]->GetNum())texts[0]->GetNumberVector();
  for(auto& node:texts)std::cout<<(node->GetNum()?node->GetNum()->GetNumber(false):0)<<' ';std::cout<<'\n';
  for(int i=count-1;i>=0;i--){auto& node=*texts[i];if(!node.GetNum()){std::cout<<"0\n";continue;}auto vector=node.GetNumberVector();std::cout<<"1 "<<node.GetNum()->GetNumber()<<' '<<node.GetNum()->GetNumRule()->GetName()<<' '<<vector.size();for(auto v:vector)std::cout<<' '<<v;std::cout<<'\n';}
  std::cout<<rule.GetTextNodeListSize();for(auto* n:rule.maTextNodeList)std::cout<<' '<<n->index;std::cout<<'\n'<<other.GetTextNodeListSize();for(auto* n:other.maTextNodeList)std::cout<<' '<<n->index;std::cout<<'\n';
  sw::DocumentListItemsManager::tSortedNodeNumList items;registry.getNumItems(items);std::cout<<items.size();for(auto* n:items)std::cout<<' '<<n->GetTextNode()->index;std::cout<<'\n';
 }
}}
'''
# No native method body is rewritten; adapter declarations may change types/representation only.
for f in functions:assert f in base
root.joinpath('native-owner.cxx').write_text(base)
cases=[]
for shape in [[0,1,2,0],[2,2,0,2],[0,0,0],[3,0,3]]:
 n=len(shape)
 for order in itertools.permutations(range(n)):
  for start in [0,7]:
   ops=[[0,i,0] for i in order]+[[0,0,0],[4,n-1,0],[3,0,0],[2,1,0],[2,1,shape[1]],[5,1,1],[6,1,1],[8,0,0],[7,0,1],[9,0,0],[1,1,0],[0,1,0]]+[[1,i,0] for i in reversed(range(n))]
   cases.append({'starts':[start,5,3,2,4,6,8,9,10,11],'items':[{'level':l,'counted':True,'restart':False,'actualStart':0} for l in shape],'ops':ops})
request=''.join(str(len(c['items']))+' '+' '.join(map(str,c['starts']))+' '+' '.join(f'{i["level"]} {int(i["counted"])} {int(i["restart"])} {i["actualStart"]}' for i in c['items'])+' '+str(len(c['ops']))+' '+' '.join(' '.join(map(str,o)) for o in c['ops'])+'\n' for c in cases)
binary=root/'native-owner'
subprocess.run(['clang++','-std=c++20',str(root/'native-owner.cxx'),'-o',str(binary)],check=True)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink()
offset=0;states=0
for case in cases:
 snapshots=[];n=len(case['items'])
 for op in case['ops']:
  raw=list(map(int,lines[offset].split()));offset+=1;rows=[]
  for _ in range(n):
   values=lines[offset].split();offset+=1
   rows.append(None if values[0]=='0' else {'number':int(values[1]),'rule':values[2],'vector':list(map(int,values[4:]))});states+=1
  memberships=[]
  for _ in range(3):memberships.append(list(map(int,lines[offset].split()))[1:]);offset+=1
  snapshots.append({'raw':raw,'nodes':list(reversed(rows)),'rules':memberships[:2],'registry':memberships[2]})
 case['expected']=snapshots
assert offset==len(lines)
root.joinpath('native-results.json').write_text(json.dumps(cases,separators=(',',':'))+'\n')
print(f'{len(functions)} additional unmodified owner/registration definitions;{len(cases)} sequences/{states} owner states. Single shown/doc-node/no layout/no redline iterator/ASCII rule/platform/debug/normal-mode adapters;not full native build/callback/lifetime machinery.')
