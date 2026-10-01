"""Compile unchanged native format-collection transitions with explicit dependencies."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib, itertools, json, subprocess

root = Path('.agentplane/tasks/202610010536-95XQFH')
textsrc = Path('vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx').read_text()
collsrc = Path('vendor/libreoffice-reference/sw/source/core/doc/fmtcol.cxx').read_text()
rulesrc = Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text()
def block(text, marker):
    start = text.index(marker); brace = text.index('{', start); depth = 1; end = brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}'); end += 1
    return text[start:end]

base = probe_source(Path('.agentplane/tasks/202610010449-CE6KDW/native-owner.cxx')).read_text().split('int main(){', 1)[0]
deps = r'''
using sal_Int16=int16_t;struct SwNumRule;struct SwPaM;
template<class T>struct TypedWhichId {int id;constexpr operator int()const{return id;}};
struct SfxPoolItem {int which;SfxPoolItem(int id):which(id){}virtual ~SfxPoolItem()=default;};
struct SwNumRuleItem:SfxPoolItem {UIName value;SwNumRuleItem(UIName v=""):SfxPoolItem(73),value(v){}const UIName& GetValue()const{return value;}};
struct SfxInt16Item:SfxPoolItem {sal_Int16 value;SfxInt16Item(int id,sal_Int16 v):SfxPoolItem(id),value(v){}int GetValue()const{return value;}};
struct SfxUInt16Item:SfxPoolItem {sal_uInt16 value;SfxUInt16Item(int id,sal_uInt16 v):SfxPoolItem(id),value(v){}int GetValue()const{return value;}};
struct BoolItem:SfxPoolItem {bool value;BoolItem(int id,bool v):SfxPoolItem(id),value(v){}bool GetValue()const{return value;}};
struct StringItem:SfxPoolItem {UIName value;StringItem(int id,UIName v):SfxPoolItem(id),value(v){}UIName GetValue()const{return value;}};
constexpr TypedWhichId<SwNumRuleItem> RES_PARATR_NUMRULE{73};
constexpr TypedWhichId<SfxUInt16Item> RES_PARATR_OUTLINELEVEL{80};
constexpr TypedWhichId<StringItem> RES_PARATR_LIST_ID{83};
constexpr TypedWhichId<SfxInt16Item> RES_PARATR_LIST_LEVEL{84},RES_PARATR_LIST_RESTARTVALUE{86};
constexpr TypedWhichId<BoolItem> RES_PARATR_LIST_ISRESTART{85},RES_PARATR_LIST_ISCOUNTED{87};
enum class SfxItemState {DEFAULT,SET};
struct AttrStore {
 std::map<int,std::shared_ptr<SfxPoolItem>> items;AttrStore* parent=nullptr;
 template<class T>const T& Get(TypedWhichId<T> id,bool inherit=true)const {
  auto it=items.find(id);if(it!=items.end())return static_cast<const T&>(*it->second);
  if(inherit&&parent)return parent->Get(id,true);
  if constexpr(std::is_same_v<T,SwNumRuleItem>){static T item;return item;}
  else if constexpr(std::is_same_v<T,StringItem>){static T item(id,"");return item;}
  else {static std::map<int,T> defaults;return defaults.try_emplace(id,id,id==87?1:0).first->second;}
 }
 SfxItemState GetItemState(int id,bool=false)const{return items.count(id)?SfxItemState::SET:SfxItemState::DEFAULT;}
 template<class T>void Put(const T& item){items[item.which]=std::make_shared<T>(item);}
};
constexpr int RES_CONDTXTFMTCOLL=2,FTNNUM_CHAPTER=1;
struct SwFormatColl {virtual ~SwFormatColl()=default;AttrStore attrs;int Which()const{return 1;}};
struct SwTextFormatColl:SwFormatColl {
 bool mbAssignedToOutlineStyle=false;
 bool IsAssignedToListLevelOfOutlineStyle()const{return mbAssignedToOutlineStyle;}
 template<class T>const T& GetFormatAttr(TypedWhichId<T> id)const{return attrs.Get(id);}
 template<class T>void SetFormatAttr(const T& item){attrs.Put(item);}
 SfxItemState GetItemState(int id,bool inherit)const{return attrs.GetItemState(id,inherit);}
 const SwNumRuleItem& GetNumRule(bool inherit=true)const{return attrs.Get(RES_PARATR_NUMRULE,inherit);}
 void ResetFormatAttr(int id){attrs.items.erase(id);}
 void SetAttrOutlineLevel(int);int GetAttrOutlineLevel()const;int GetAssignedOutlineStyleLevel()const;void AssignToListLevelOfOutlineStyle(int);void DeleteAssignmentToListLevelOfOutlineStyle();
};
struct SwContentNode {
 SwTextFormatColl* coll=nullptr;std::unique_ptr<AttrStore> mpAttrSet;
 SwTextFormatColl* GetTextColl()const{return coll;}
 SwFormatColl* ChgFormatColl(SwFormatColl* c){auto* old=coll;coll=static_cast<SwTextFormatColl*>(c);if(mpAttrSet)mpAttrSet->parent=&coll->attrs;return old;}
 bool HasSwAttrSet()const{return !!mpAttrSet;}const AttrStore* GetpSwAttrSet()const{return mpAttrSet.get();}
 const AttrStore& GetSwAttrSet()const{return mpAttrSet?*mpAttrSet:coll->attrs;}
 template<class T>const T& GetAttr(TypedWhichId<T> id,bool inherit=true)const{return GetSwAttrSet().Get(id,inherit);}
 const SfxPoolItem* GetNoCondAttr(TypedWhichId<SwNumRuleItem> id,bool inherit)const{return &GetAttr(id,inherit);}
 void PutItem(const SfxPoolItem& item){if(!mpAttrSet){mpAttrSet=std::make_unique<AttrStore>();mpAttrSet->parent=&coll->attrs;}
  if(auto* v=dynamic_cast<const SwNumRuleItem*>(&item))mpAttrSet->Put(*v);
  else if(auto* v=dynamic_cast<const SfxUInt16Item*>(&item))mpAttrSet->Put(*v);
  else if(auto* v=dynamic_cast<const SfxInt16Item*>(&item))mpAttrSet->Put(*v);
  else if(auto* v=dynamic_cast<const BoolItem*>(&item))mpAttrSet->Put(*v);
  else if(auto* v=dynamic_cast<const StringItem*>(&item))mpAttrSet->Put(*v);
 }
 void EraseItem(int id){if(mpAttrSet){mpAttrSet->items.erase(id);if(mpAttrSet->items.empty())mpAttrSet.reset();}}
};
struct Footnotes {bool empty()const{return true;}void UpdateFootnote(SwTextNode&) {}};
struct FootnoteInfo {int m_eNum=0;};
OUString operator""_ustr(const char16_t* text,std::size_t n){OUString value;for(std::size_t i=0;i<n;i++)value.push_back(char(text[i]));return value;}
'''
base = base.replace('using UIName=OUString;', 'using UIName=OUString;\n' + deps)
base = base.replace('template<class A,class B,sw::IteratorMode C>', 'template<class A,class B,sw::IteratorMode C=sw::IteratorMode::UnwrapMulti>')
base = base.replace('struct SwDoc {ListAccess* lists;', 'struct SwDoc {void ResetAttrs(SwPaM&,bool,const std::set<sal_uInt16>&,bool);SwNumRule* FindNumRulePtr(const UIName&)const;SwNumRule* GetOutlineNumRule()const;Footnotes& GetFootnoteIdxs(){static Footnotes x;return x;}FootnoteInfo GetFootnoteInfo()const{return {};}ListAccess* lists;')
base = base.replace('const UIName& GetName()const{return name;}', 'const UIName& GetName()const{return name;}static UIName GetOutlineRuleName();')
base = base.replace('bool IsDocNodes()const;};', 'bool IsDocNodes()const;void UpdateOutlineNode(SwTextNode&){}SwTextNode* operator[](int){return nullptr;}};')
base = base.replace('struct SwTextNode {', 'struct SwTextNode:SwContentNode {')
base = base.replace('struct SwPaM {SwPosition start,end;', 'struct SwPaM {SwTextNode* node=nullptr;SwPaM(SwTextNode& n):node(&n),start(n.nodes,0),end(n.nodes,100000){}SwPosition start,end;')
base = base.replace('OUString GetListId()const{return listId;}SwNumRule* GetNumRule()const{return rule;}int GetAttrListLevel()const{return level;}', 'OUString GetListId()const;SwNumRule* GetNumRule(bool=true)const;int GetAttrListLevel()const{return GetAttr(RES_PARATR_LIST_LEVEL).GetValue();}')
base = base.replace('bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}', 'bool IsCountedInList()const{return GetAttr(RES_PARATR_LIST_ISCOUNTED).GetValue();}bool IsListRestart()const{return GetAttr(RES_PARATR_LIST_ISRESTART).GetValue();}long GetActualListStartValue()const;')
base = base.replace('void AddToListOrig(){}', r'''
 bool mbInSetOrResetAttr=false,mbEmptyListStyleSetDueToSetOutlineLevelAttr=false;std::unique_ptr<int> maFillAttributes;
 bool IsEmptyListStyleDueToSetOutlineLevelAttr()const{return mbEmptyListStyleSetDueToSetOutlineLevelAttr;}
 void SetCalcHiddenCharFlags(){}void ChkCondColl(){}void ChgTextCollUpdateNum(const SwTextFormatColl*,const SwTextFormatColl*,bool);
 SwFormatColl* ChgFormatColl(SwFormatColl*,bool=true);void SetEmptyListStyleDueToSetOutlineLevelAttr();void ResetEmptyListStyleDueToResetOutlineLevelAttr();void SetAttrOutlineLevel(int);void SetAttrListLevel(int);
 int GetAttrOutlineLevel()const{return GetAttr(RES_PARATR_OUTLINELEVEL).GetValue();}
 void SetAttr(const SfxPoolItem&);void ResetAttr(int);
 void AddToListOrig(){}''')
base += r'''
SwNumRule* SwDoc::FindNumRulePtr(const UIName& name)const {auto it=lists->rules.find(name);return it==lists->rules.end()?nullptr:it->second;}
SwNumRule* SwDoc::GetOutlineNumRule()const{return FindNumRulePtr("Outline");}
OUString SwTextNode::GetListId()const{auto id=GetAttr(RES_PARATR_LIST_ID).GetValue();return !id.isEmpty()?id:GetNumRule()?GetNumRule()->GetName():UIName();}
long SwTextNode::GetActualListStartValue()const{if(IsListRestart()&&mpAttrSet&&mpAttrSet->items.count(86))return GetAttr(RES_PARATR_LIST_RESTARTVALUE,false).GetValue();return GetNumRule()?GetNumRule()->Get(GetAttrListLevel()).GetStart():1;}
void SwTextNode::SetAttr(const SfxPoolItem& item){bool detach=item.which==73||(item.which==83&&static_cast<const StringItem&>(item).GetValue()!=GetListId());if(detach)RemoveFromList();PutItem(item);if(detach)AddToList();else if(mpNodeNum){if(item.which==84)mpNodeNum->SetLevelInListTree(GetAttrListLevel(),GetDoc());else if(item.which>=85&&item.which<=87)GetDoc().lists->getListByName(GetListId())->InvalidateListTree();}}
void SwTextNode::ResetAttr(int id){bool detach=id==73||id==83;if(detach)RemoveFromList();EraseItem(id);if(detach)AddToList();else if(mpNodeNum){if(id==84)mpNodeNum->SetLevelInListTree(GetAttrListLevel(),GetDoc());else if(id>=85&&id<=87)GetDoc().lists->getListByName(GetListId())->InvalidateListTree();}}
void SwDoc::ResetAttrs(SwPaM& p,bool,const std::set<sal_uInt16>& attrs,bool){for(auto id:attrs)p.node->ResetAttr(id);}
'''
functions = [block(textsrc,m) for m in ['void lcl_ResetParAttrs(', 'void HandleModifyAtTextNodeFormatChange(', 'void HandleApplyTextNodeFormatChange( SwTextNode& rTextNode, const UIName& sNumRule, const UIName& sOldNumRule, bool bNumRuleSet, bool bParagraphStyleChanged )\n    {']]
base += '\nnamespace {\nvoid HandleApplyTextNodeFormatChange(SwTextNode&,const UIName&,const UIName&,bool,bool);\n'+'\n'.join(functions)+'\n}\n'
methods = [block(textsrc,m) for m in ['SwNumRule* SwTextNode::GetNumRule(', 'SwFormatColl* SwTextNode::ChgFormatColl(', 'void SwTextNode::ChgTextCollUpdateNum(', 'void SwTextNode::SetEmptyListStyleDueToSetOutlineLevelAttr()', 'void SwTextNode::ResetEmptyListStyleDueToResetOutlineLevelAttr()', 'void SwTextNode::SetAttrOutlineLevel(', 'void SwTextNode::SetAttrListLevel(']]
methods += [block(collsrc,m) for m in ['void SwTextFormatColl::SetAttrOutlineLevel(', 'int SwTextFormatColl::GetAttrOutlineLevel()', 'int SwTextFormatColl::GetAssignedOutlineStyleLevel()', 'void SwTextFormatColl::AssignToListLevelOfOutlineStyle(', 'void SwTextFormatColl::DeleteAssignmentToListLevelOfOutlineStyle()']]
methods.append(block(rulesrc,'UIName SwNumRule::GetOutlineRuleName()'))
base += '\n'.join(methods)
base += r'''
int main(){int count,foreignCase;while(std::cin>>count>>foreignCase){
 SwDoc doc;SwNodes nodes(&doc),foreign(&doc);sw::DocumentListItemsManager registry;ListAccess access;access.nodes=&nodes;doc.nodes=&nodes;doc.lists=&access;doc.items=&registry;
 SwNumRule counters,bullets,outline;bullets.name="Bullets";outline.name="Outline";for(auto& f:bullets.formats)f.bullet=true;access.rules[counters.name]=&counters;access.rules[bullets.name]=&bullets;access.rules[outline.name]=&outline;
 SwTextFormatColl styles[16];styles[1].SetFormatAttr(SwNumRuleItem("Counters"));styles[2].SetFormatAttr(SwNumRuleItem("Bullets"));
 for(int i=0;i<10;i++){styles[i+3].AssignToListLevelOfOutlineStyle(i);styles[i+3].SetFormatAttr(SwNumRuleItem("Outline"));}
 styles[13].attrs.parent=&styles[1].attrs;styles[14].attrs.parent=&styles[3].attrs;styles[15].SetFormatAttr(SwNumRuleItem());
 std::vector<std::unique_ptr<SwTextNode>> texts;for(int i=0;i<count;i++){auto t=std::make_unique<SwTextNode>();t->index=i;t->doc=&doc;t->nodes=foreignCase?&foreign:&nodes;t->coll=&styles[0];texts.push_back(std::move(t));}
 int ops;std::cin>>ops;for(int op=0;op<ops;op++){int kind,index,value;std::cin>>kind>>index>>value;auto& t=*texts[index];
  if(kind==0)t.ChgFormatColl(&styles[value]);
  if(kind==1)t.SetAttr(SwNumRuleItem(value==0?"":value==1?"Counters":value==2?"Bullets":"Outline"));
  if(kind==2)t.SetAttrListLevel(value);
  if(kind==3)t.SetAttr(StringItem(83,value?"Retained":""));
  if(kind==4){t.SetAttr(BoolItem(85,true));t.SetAttr(SfxInt16Item(86,value));}
  if(kind==5)t.SetAttr(BoolItem(87,value));
  if(kind==6)t.SetAttrOutlineLevel(value);
  if(kind==7)t.ResetAttr(value);
  if(kind==8)t.RemoveFromList();
  if(kind==9)t.ChgFormatColl(&styles[value],false);
  if(kind==10)t.nodes=value?&foreign:&nodes;
  if(kind==11)t.SetEmptyListStyleDueToSetOutlineLevelAttr();
  if(kind==12)t.ResetEmptyListStyleDueToResetOutlineLevelAttr();
  if(kind==13)styles[3].SetFormatAttr(SfxUInt16Item(80,value));
  for(auto& p:texts){auto* r=p->GetNumRule();auto* n=p->GetNum();auto v=p->GetNumberVector();auto id=p->GetListId();std::cout<<(r?r->GetName():UIName("-"))<<' '<<(n?n->GetNumRule()->GetName():UIName("-"))<<' '<<p->GetAttrListLevel()<<' '<<p->GetAttrOutlineLevel()<<' '<<p->IsEmptyListStyleDueToSetOutlineLevelAttr()<<' '<<(id.isEmpty()?UIName("-"):id)<<' '<<p->IsListRestart()<<' '<<p->IsCountedInList()<<' '<<p->GetActualListStartValue()<<' '<<v.size();for(auto x:v)std::cout<<' '<<x;std::cout<<'\n';
   auto* attrs=p->GetpSwAttrSet();std::cout<<(attrs?attrs->items.size():0);if(attrs)for(auto& [id,item]:attrs->items){std::cout<<' '<<id<<':';if(auto* x=dynamic_cast<SwNumRuleItem*>(item.get()))std::cout<<(x->value.empty()?"-":x->value);else if(auto* x=dynamic_cast<StringItem*>(item.get()))std::cout<<(x->value.empty()?"-":x->value);else if(auto* x=dynamic_cast<SfxInt16Item*>(item.get()))std::cout<<x->value;else if(auto* x=dynamic_cast<SfxUInt16Item*>(item.get()))std::cout<<x->value;else std::cout<<static_cast<BoolItem*>(item.get())->value;}std::cout<<'\n';
  }
  for(auto* rule:{&counters,&bullets,&outline}){std::cout<<rule->maTextNodeList.size();for(auto* n:rule->maTextNodeList)std::cout<<' '<<n->index;std::cout<<'\n';}
  sw::DocumentListItemsManager::tSortedNodeNumList items;registry.getNumItems(items);std::cout<<items.size();for(auto* n:items)std::cout<<' '<<n->GetTextNode()->index;std::cout<<'\n';
 }
}}
'''
for body in functions+methods: assert body in base
probe_source(root.joinpath('native-style.cxx')).write_text(base)
root.joinpath('native-source-identity.json').write_text(identity_json([{'signature':f.split('{',1)[0].strip(),'sha256':hashlib.sha256(f.encode()).hexdigest(),'bytes':len(f.encode())} for f in functions+methods],indent=2)+'\n')
binary=root/'native-style'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-style.cxx')),'-o',str(binary)],check=True)
cases=[]
for a,b in itertools.product(range(16),repeat=2):
    cases.append({'count':3,'ops':[[0,0,a],[0,1,a],[3,0,1],[2,0,2],[4,0,7],[5,0,0],[0,0,b],[0,2,b],[8,2,0],[0,2,b],[9,0,a],[0,0,b],[0,0,0]]})
for level in range(10):
    cases.extend([{'count':2,'ops':[[0,0,1],[6,0,level+1],[0,0,0],[0,0,0],[11,0,0],[0,0,2],[12,0,0],[0,0,level+3],[9,0,1],[0,0,level+3],[0,0,14]]}, {'count':2,'foreign':True,'ops':[[0,0,1],[0,0,level+3],[0,0,level+3],[1,0,2],[0,0,1],[1,0,0],[0,0,level+3],[7,0,73],[0,0,0]]}])
cases.append({'count':2,'ops':[[13,0,11],[0,0,3],[0,0,0],[13,0,0],[0,0,3]]})
request=''.join(f'{c["count"]} {int(c.get("foreign",False))} {len(c["ops"])} '+' '.join(' '.join(map(str,o)) for o in c['ops'])+'\n' for c in cases)
lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines();binary.unlink();offset=0;states=0
for c in cases:
    c['expected']=[]
    for op in c['ops']:
        rows=[]
        for _ in range(c['count']):
            row=lines[offset].split();attrs=lines[offset+1].split();offset+=2;states+=1
            rows.append({'rule':row[0],'owned':row[1],'level':int(row[2]),'outline':int(row[3]),'empty':bool(int(row[4])),'id':row[5] if len(row)>9 else '', 'restart':bool(int(row[6])),'counted':bool(int(row[7])),'start':int(row[8]),'vector':list(map(int,row[10:])),'attrs':dict(a.split(':',1) for a in attrs[1:])})
        memberships=[]
        for _ in range(4):memberships.append(list(map(int,lines[offset].split()))[1:]);offset+=1
        c['expected'].append({'nodes':rows,'rules':memberships[:3],'registry':memberships[3]})
assert offset==len(lines)
root.joinpath('native-results.json').write_text(identity_json(cases,separators=(',',':'))+'\n')
print(f'{len(functions+methods)} additional unchanged native definitions;{len(cases)} sequences/{states} states. Reused complete shown tree/owner bodies;no native build/footnotes/conditional or inline styles/outline index/platform cache/live format callbacks/full attribute/history lifetime coverage. Attribute APIs are explicit boundary adapters.')
