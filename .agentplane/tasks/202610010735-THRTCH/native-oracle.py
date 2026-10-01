"""Unchanged pinned Writer attribute lifecycles; named dependency adapters only."""
from pathlib import Path
import hashlib,json,subprocess,itertools
root=Path('.agentplane/tasks/202610010735-THRTCH')
text=Path('vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx').read_text()
tree=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNumberTree.cxx').read_text()
num=Path('vendor/libreoffice-reference/sw/source/core/SwNumberTree/SwNodeNum.cxx').read_text()
ndnum=Path('vendor/libreoffice-reference/sw/source/core/docnode/ndnum.cxx').read_text()
header=Path('vendor/libreoffice-reference/sw/inc/numrule.hxx').read_text()
def block(s,m):
 start=s.index(m);b=s.index('{',start);i=b+1;depth=1
 while depth:depth+=(s[i]=='{')-(s[i]=='}');i+=1
 return s[start:i]
base=Path('.agentplane/tasks/202610010536-95XQFH/native-style.cxx').read_text().split('int main(){',1)[0]
base=base.replace('int GetIndex()const{return index;}','int GetIndex()const override{return index;}')
base=base.replace('#include <vector>','#include <vector>\n#include <functional>\n#define COVERITY_NOEXCEPT_FALSE')
base=base.replace('bool isEmpty()const{return empty();}', 'bool isEmpty()const{return empty();}int getLength()const{return size();}')
base=base.replace('virtual ~SfxPoolItem()=default;', 'virtual ~SfxPoolItem()=default;int Which()const{return which;}template<class T>const typename T::type& StaticWhichCast(T id)const{return static_cast<const typename T::type&>(*this);}')
base=base.replace('struct TypedWhichId {int id;', 'struct TypedWhichId {using type=T;int id;')
base=base.replace('enum class SfxItemState', 'using SfxBoolItem=BoolItem;using SfxStringItem=StringItem;constexpr int RES_BACKGROUND=100,XATTR_FILL_FIRST=101,XATTR_FILL_LAST=102;struct SvxTextLeftMarginItem {};\nenum class SfxItemState')
base=base.replace('SfxItemState GetItemState(int id,bool=false)const{return items.count(id)?SfxItemState::SET:SfxItemState::DEFAULT;}', 'SfxItemState GetItemState(int id,bool inherit=true)const{return items.count(id)?SfxItemState::SET:inherit&&parent?parent->GetItemState(id,true):SfxItemState::DEFAULT;}template<class T>const T* GetItemIfSet(TypedWhichId<T> id,bool inherit)const{return GetItemState(id,inherit)==SfxItemState::SET?&Get(id,inherit):nullptr;}const SvxTextLeftMarginItem& GetTextLeftMargin()const{static SvxTextLeftMarginItem x;return x;}')
base=base.replace('constexpr int RES_CONDTXTFMTCOLL', 'using SfxItemSet=AttrStore;\nconstexpr int RES_CONDTXTFMTCOLL')
base=base.replace('struct SwContentNode {','struct SwContentNode {virtual ~SwContentNode()=default;virtual int GetIndex()const{return -1;}virtual SwTextNode* GetTextNode(){return nullptr;}bool SetAttr(const SfxPoolItem&);bool SetAttr(const SfxItemSet&);bool ResetAttr(sal_uInt16,sal_uInt16=0);bool ResetAttr(const std::vector<sal_uInt16>&);sal_uInt16 ResetAllAttr();')
base=base.replace('struct Footnotes {','using SwNode=SwContentNode;struct CompareSwOutlineNodes{bool operator()(const SwNode*,const SwNode*)const;};struct SwOutlineNodes:std::vector<SwNode*>{using size_type=std::size_t;auto lower_bound(const SwNode* p)const{return std::lower_bound(begin(),end(),p,CompareSwOutlineNodes());}bool Seek_Entry(const SwNode*,size_type*)const;bool contains(const SwNode* p)const{size_type i;return Seek_Entry(p,&i);}void insert(SwNode* p){size_type i;if(!Seek_Entry(p,&i))std::vector<SwNode*>::insert(begin()+i,p);}void erase(SwNode* p){size_type i;if(Seek_Entry(p,&i))std::vector<SwNode*>::erase(begin()+i);}};namespace sw{struct LegacyModifyHint{LegacyModifyHint(void*,void*){}};}enum class SwFieldIds{Chapter};struct FieldType{void UpdateFields(){}};struct FieldsAccess{FieldType* GetSysFieldType(SwFieldIds){static FieldType f;return &f;}};\nstruct Footnotes {')
base=base.replace('struct SwDoc {','struct SwDoc {bool IsInReading()const{return false;}bool IsInDtor()const{return false;}FieldsAccess& getIDocumentFieldsAccess(){static FieldsAccess f;return f;}std::vector<int> notifications;')
base=base.replace('struct SwNumFormat {','constexpr int SVX_NUM_NUMBER_NONE=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_BITMAP=2,SVX_NUM_ARABIC=3;enum SwNumRuleType{OUTLINE_RULE,NUM_RULE,RULE_END};\nstruct SwNumFormat {int GetNumberingType()const{return bullet?SVX_NUM_CHAR_SPECIAL:SVX_NUM_ARABIC;}')
base=base.replace('struct SwNumRule {','struct SwNumRule {SwNumRuleType meRuleType=NUM_RULE;'+block(header,'SwNumRuleType GetRuleType()')+block(header,'void SetRuleType(')+block(header,'bool IsOutlineRule()'))
base=base.replace('void UpdateOutlineNode(SwTextNode&){}','SwDoc& GetDoc(){return *owner;}SwOutlineNodes m_aOutlineNodes;void UpdateOutlineNode(SwNode&);')
base=base.replace('void SetAttr(const SfxPoolItem&);void ResetAttr(int);','bool SetAttr(const SfxPoolItem&);bool SetAttr(const SfxItemSet&);bool ResetAttr(sal_uInt16,sal_uInt16=0);bool ResetAttr(const std::vector<sal_uInt16>&);sal_uInt16 ResetAllAttr();bool HasAttrListLevel()const;bool HasAttrListRestartValue()const{return mpAttrSet&&mpAttrSet->GetItemState(86,false)==SfxItemState::SET;}int GetAttrListRestartValue()const{return GetAttr(RES_PARATR_LIST_RESTARTVALUE,false).GetValue();}void DoNum(std::function<void(SwNodeNum&)>const&);bool m_bLastOutlineState=false;bool IsOutline()const;bool IsOutlineStateChanged()const;void UpdateOutlineState();bool IsInRedlines()const{return false;}SwTextNode* GetTextNode()override{return this;}bool IsNotifiable()const{return true;}bool IsNotificationEnabled()const{return true;}void NumRuleChgd();void CallSwClientNotify(const sw::LegacyModifyHint&){doc->notifications.push_back(index);}')
base=base.replace('void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}','void NotifyInvalidSiblings(const SwDoc&);void NotifyInvalidChildren(const SwDoc&);void ValidateMe();void Notify(const SwDoc&);virtual void NotifyNode()=0;virtual bool IsNotifiable(const SwDoc&)const=0;void InvalidateAndNotifyTree(const SwDoc&);')
base=base.replace('SwTextNode* GetTextNode()const{return text;}', 'void NotifyNode()override;bool IsNotifiable(const SwDoc&)const override;SwTextNode* GetTextNode()const{return text;}')
# Old direct attribute bridge dependency is replaced by raw pool adapters; full native wrappers follow.
for m in ['void SwTextNode::SetAttr(const SfxPoolItem& item)','void SwTextNode::ResetAttr(int id)']:
 base=base.replace(block(base,m),'')
base+=r'''
// POOL ADAPTER: direct equality/ownership/defaults, raw mutation notification; no native pool/refcount lifetime claim.
bool equalItem(const SfxPoolItem& a,const SfxPoolItem& b){if(typeid(a)!=typeid(b))return false;if(auto* x=dynamic_cast<const SwNumRuleItem*>(&a))return x->value==static_cast<const SwNumRuleItem&>(b).value;if(auto* x=dynamic_cast<const StringItem*>(&a))return x->value==static_cast<const StringItem&>(b).value;if(auto* x=dynamic_cast<const SfxInt16Item*>(&a))return x->value==static_cast<const SfxInt16Item&>(b).value;if(auto* x=dynamic_cast<const SfxUInt16Item*>(&a))return x->value==static_cast<const SfxUInt16Item&>(b).value;return static_cast<const BoolItem&>(a).value==static_cast<const BoolItem&>(b).value;}
std::function<void(SwContentNode&)> callback;
void rawNotify(SwContentNode& n){if(callback){auto f=std::move(callback);callback=nullptr;f(n);}auto* t=n.GetTextNode();if(t&&t->GetNodes().IsDocNodes())t->GetNodes().UpdateOutlineNode(n);}
bool SwContentNode::SetAttr(const SfxPoolItem& x){bool changed=!mpAttrSet||!mpAttrSet->items.count(x.which)||!equalItem(*mpAttrSet->items[x.which],x);PutItem(x);if(changed)rawNotify(*this);return changed;}
bool SwContentNode::SetAttr(const SfxItemSet& s){bool changed=false;for(auto& [id,x]:s.items){bool c=!mpAttrSet||!mpAttrSet->items.count(id)||!equalItem(*mpAttrSet->items[id],*x);PutItem(*x);changed|=c;}if(changed)rawNotify(*this);return changed;}
bool SwContentNode::ResetAttr(sal_uInt16 a,sal_uInt16 b){std::vector<sal_uInt16> ids;for(int i=a;i<=std::max(a,b);i++)ids.push_back(i);return ResetAttr(ids);}
bool SwContentNode::ResetAttr(const std::vector<sal_uInt16>& ids){bool changed=false;for(auto id:ids){changed|=mpAttrSet&&mpAttrSet->items.count(id);EraseItem(id);}if(changed)rawNotify(*this);return changed;}
sal_uInt16 SwContentNode::ResetAllAttr(){int n=mpAttrSet?mpAttrSet->items.size():0;mpAttrSet.reset();if(n)rawNotify(*this);return n;}
'''
# Complete classes include unchanged declarations and semicolons.
classes=[block(text,'class HandleSetAttrAtTextNode')+';',block(text,'class HandleResetAttrAtTextNode')+';']
markers=['HandleSetAttrAtTextNode::HandleSetAttrAtTextNode( SwTextNode& rTextNode,\n                                                    const SfxPoolItem&', 'HandleSetAttrAtTextNode::HandleSetAttrAtTextNode( SwTextNode& rTextNode,\n                                                    const SfxItemSet&', 'HandleSetAttrAtTextNode::~HandleSetAttrAtTextNode()', 'HandleResetAttrAtTextNode::HandleResetAttrAtTextNode( SwTextNode& rTextNode,\n                                                        const sal_uInt16', 'HandleResetAttrAtTextNode::HandleResetAttrAtTextNode( SwTextNode& rTextNode,\n                                                        const std::vector', 'HandleResetAttrAtTextNode::HandleResetAttrAtTextNode( SwTextNode& rTextNode )', 'void HandleResetAttrAtTextNode::init(', 'HandleResetAttrAtTextNode::~HandleResetAttrAtTextNode()']
helpers=[block(text,m) for m in markers]
extra=[block(text,m) for m in ['bool HasNumberingWhichNeedsLayoutUpdate(', 'void SwTextNode::DoNum(', 'bool SwTextNode::HasAttrListLevel()', 'bool SwTextNode::IsOutline() const', 'bool SwTextNode::IsOutlineStateChanged() const', 'void SwTextNode::UpdateOutlineState()', 'void SwTextNode::NumRuleChgd()']]
extra+=[block(tree,m) for m in ['void SwNumberTreeNode::ValidateMe()', 'void SwNumberTreeNode::Notify(', 'void SwNumberTreeNode::NotifyInvalidChildren(', 'void SwNumberTreeNode::NotifyInvalidSiblings(']]
extra+=[block(num,m) for m in ['void SwNodeNum::NotifyNode()', 'bool SwNodeNum::IsNotifiable(']]
extra+=[block(ndnum,m) for m in ['bool CompareSwOutlineNodes::operator()', 'bool SwOutlineNodes::Seek_Entry(', 'void SwNodes::UpdateOutlineNode(']]
inline=block(Path('vendor/libreoffice-reference/sw/inc/SwNumberTree.hxx').read_text(),'void InvalidateAndNotifyTree(')
extra.append('void SwNumberTreeNode::'+inline[len('void '):])
base+='\n'+ '\n'.join(extra)+'\nnamespace {\n'+'\n'.join(classes+helpers)+'\n}\n'
wrappers=[block(text,m) for m in ['bool SwTextNode::SetAttr( const SfxPoolItem&', 'bool SwTextNode::SetAttr( const SfxItemSet&', 'bool SwTextNode::ResetAttr( sal_uInt16', 'bool SwTextNode::ResetAttr( const std::vector', 'sal_uInt16 SwTextNode::ResetAllAttr()']]
base+='\n'.join(wrappers)
base+=r'''
int main(){int count;while(std::cin>>count){
 SwDoc doc;SwNodes nodes(&doc);sw::DocumentListItemsManager registry;ListAccess access;access.nodes=&nodes;doc.nodes=&nodes;doc.lists=&access;doc.items=&registry;
 SwNumRule counters,bullets,outline;bullets.name="Bullets";outline.name="Outline";outline.SetRuleType(OUTLINE_RULE);for(auto& f:bullets.formats)f.bullet=true;for(auto* r:{&counters,&bullets,&outline})access.rules[r->name]=r;
 SwTextFormatColl styles[3];styles[1].SetFormatAttr(SwNumRuleItem("Counters"));styles[2].AssignToListLevelOfOutlineStyle(2);styles[2].SetFormatAttr(SwNumRuleItem("Outline"));
 std::vector<std::unique_ptr<SwTextNode>> texts;for(int i=0;i<count;i++){auto t=std::make_unique<SwTextNode>();t->index=i;t->doc=&doc;t->nodes=&nodes;t->coll=&styles[0];texts.push_back(std::move(t));}
 int ops;std::cin>>ops;for(int op=0;op<ops;op++){int kind,index,value;std::cin>>kind>>index>>value;auto& t=*texts[index];doc.notifications.clear();
 if(kind==18){callback=[&](SwContentNode& n){n.GetTextNode()->ChgFormatColl(&styles[value]);};t.SetAttrOutlineLevel(4);}
 if(kind==16)for(auto& f:counters.formats)f.start=value;
 if(kind==17)t.SetAttr(SwNumRuleItem("unknown"));
 if(kind==0)t.ChgFormatColl(&styles[value]);
 if(kind==1)t.SetAttr(SwNumRuleItem(value==0?"":value==1?"Counters":value==2?"Bullets":"Outline"));
 if(kind==2)t.SetAttrListLevel(value);
 if(kind==3)t.SetAttr(StringItem(83,value?"Retained":""));
 if(kind==4)t.SetAttr(BoolItem(85,value));
 if(kind==5)t.SetAttr(BoolItem(87,value));
 if(kind==6)t.SetAttrOutlineLevel(value);
 if(kind==7)t.ResetAttr(value);
 if(kind==8)t.SetAttr(SfxInt16Item(86,value));
 if(kind==9)t.ResetAllAttr();
 if(kind==10){SfxItemSet s;s.Put(SfxInt16Item(84,value));s.Put(BoolItem(85,true));s.Put(SfxInt16Item(86,7));s.Put(BoolItem(87,false));t.SetAttr(s);}
 if(kind==11)t.ResetAttr(std::vector<sal_uInt16>{84,86,85,87});
 if(kind==12)t.ResetAttr(84,87);
 if(kind==13)t.SetEmptyListStyleDueToSetOutlineLevelAttr();
 if(kind==14)t.ResetEmptyListStyleDueToResetOutlineLevelAttr();
 if(kind==15){SfxItemSet s;s.Put(SwNumRuleItem(value?"Counters":""));s.Put(StringItem(83,"Retained"));s.Put(SfxUInt16Item(80,4));s.Put(SfxInt16Item(84,2));t.SetAttr(s);}
 std::cout<<doc.notifications.size();for(int i:doc.notifications)std::cout<<' '<<i;std::cout<<'\n';
 for(auto& p:texts){auto* r=p->GetNumRule();auto* n=p->GetNum();auto id=p->GetListId();std::cout<<(r?r->name:UIName("-"))<<' '<<(n?n->GetNumRule()->name:UIName("-"))<<' '<<p->GetAttrListLevel()<<' '<<p->GetAttrOutlineLevel()<<' '<<p->IsEmptyListStyleDueToSetOutlineLevelAttr()<<' '<<(id.isEmpty()?UIName("-"):id)<<' '<<p->IsListRestart()<<' '<<p->IsCountedInList()<<' '<<p->GetActualListStartValue()<<' '<<(n?n->GetNumber(false):-999)<<'\n';
 auto* attrs=p->GetpSwAttrSet();std::cout<<(attrs?attrs->items.size():0);if(attrs)for(auto& [id,item]:attrs->items){std::cout<<' '<<id<<':';if(auto* x=dynamic_cast<SwNumRuleItem*>(item.get()))std::cout<<(x->value.empty()?"-":x->value);else if(auto* x=dynamic_cast<StringItem*>(item.get()))std::cout<<(x->value.empty()?"-":x->value);else if(auto* x=dynamic_cast<SfxInt16Item*>(item.get()))std::cout<<x->value;else if(auto* x=dynamic_cast<SfxUInt16Item*>(item.get()))std::cout<<x->value;else std::cout<<static_cast<BoolItem*>(item.get())->value;}std::cout<<'\n';}
 std::cout<<nodes.m_aOutlineNodes.size();for(auto* p:nodes.m_aOutlineNodes)std::cout<<' '<<p->GetIndex();std::cout<<'\n';
 for(auto* r:{&counters,&bullets,&outline}){std::cout<<r->maTextNodeList.size();for(auto* p:r->maTextNodeList)std::cout<<' '<<p->index;std::cout<<'\n';}
 sw::DocumentListItemsManager::tSortedNodeNumList items;registry.getNumItems(items);std::cout<<items.size();for(auto* n:items)std::cout<<' '<<n->GetTextNode()->index;std::cout<<'\n';
 for(auto& p:texts){auto v=p->GetNumberVector();std::cout<<v.size();for(auto x:v)std::cout<<' '<<x;std::cout<<'\n';}
 }
}}
'''
# Exact byte identities; previously unchanged full dependencies are retained too.
identities=classes+helpers+wrappers+extra[:-1]+[inline]+[block(header,m) for m in ['SwNumRuleType GetRuleType()','void SetRuleType(','bool IsOutlineRule()']]
for body in identities:
 if body!=inline:assert body in base
root.joinpath('native-attributes.cxx').write_text(base)
root.joinpath('native-source-identity.json').write_text(json.dumps([{'signature':s.split('{')[0].strip(),'bytes':len(s.encode()),'sha256':hashlib.sha256(s.encode()).hexdigest()}for s in identities],indent=2)+'\n')
binary=root/'native-attributes'
subprocess.run(['clang++','-std=c++20',str(root/'native-attributes.cxx'),'-o',str(binary)],check=True)
cases=[]
for rule,level in itertools.product([1,2,3],range(10)):
 cases.append({'count':3,'ops':[[1,i,rule]for i in range(3)]+[[2,0,level],[4,0,1],[8,0,7],[5,0,0],[10,0,(level+1)%10],[7,0,85],[7,0,86],[11,0,0],[12,0,0],[3,0,1],[7,0,83],[7,0,83],[9,0,0],[9,0,0]]})
for level in range(11):
 cases.extend([{'count':2,'ops':[[6,0,level],[6,0,level],[1,0,1],[6,0,0],[7,0,73],[6,0,level],[7,0,80],[9,0,0],[13,0,0],[1,0,2],[14,0,0]]},{'count':2,'ops':[[0,0,1],[7,0,83],[6,0,level],[15,0,0],[15,0,1],[9,0,0],[0,0,2],[7,0,73],[9,0,0],[0,0,0]]}])
cases.append({'count':3,'ops':[[6,2,2],[6,0,3],[6,1,1],[7,1,80],[9,2,0],[6,0,0]]})
cases.extend([{'count':4,'ops':[[16,0,0],[1,0,1],[5,0,0],[1,1,1],[2,1,1],[5,1,0],[1,2,1],[2,2,2],[1,3,1]]},{'count':2,'ops':[[16,0,7],[1,0,1],[1,1,1],[17,1,0]]}])
cases.extend([{'count':2,'ops':[[1,0,1],[18,0,2],[9,0,0],[18,0,1]]},{'count':2,'ops':[[13,0,0],[18,0,2],[7,0,80],[18,0,0]]}])
req=''.join(f'{c["count"]} {len(c["ops"])} '+' '.join(' '.join(map(str,o))for o in c['ops'])+'\n'for c in cases)
lines=subprocess.check_output([str(binary)],input=req,text=True).splitlines();binary.unlink();offset=0;states=0
for c in cases:
 c['expected']=[]
 for op in c['ops']:
  events=list(map(int,lines[offset].split()))[1:];offset+=1;rows=[]
  for i in range(c['count']):
   row=lines[offset].split();attrs=lines[offset+1].split();offset+=2;states+=1
   rows.append(dict(rule=row[0],owned=row[1],level=int(row[2]),outline=int(row[3]),empty=bool(int(row[4])),id=row[5],restart=bool(int(row[6])),counted=bool(int(row[7])),start=int(row[8]),cached=int(row[9]),attrs=dict(a.split(':',1)for a in attrs[1:])))
  memberships=[]
  for i in range(5):memberships.append(list(map(int,lines[offset].split()))[1:]);offset+=1
  for row in rows:row['vector']=list(map(int,lines[offset].split()))[1:];offset+=1
  c['expected'].append(dict(nodes=rows,events=events,outline=memberships[0],rules=memberships[1:4],registry=memberships[4]))
assert offset==len(lines)
root.joinpath('native-results.json').write_text(json.dumps(cases,separators=(',',':'))+'\n')
print(f'{len(identities)} unchanged added definitions;{len(cases)} sequences/{states} states. Adapters: pool ownership/equality; normal-doc reading/dtor/redline/fuzz state; shown-only hidden/orig; raw direct attribute callback; layout/wordcount event capture; chapter field no-op; unsupported background/fill declarations. No full native pool/platform/layout/field/redline/fill/live-style lifetime claim.')
