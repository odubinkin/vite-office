from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib,json,itertools
out=Path('.agentplane/tasks/202610011456-DA9C87');root=Path('vendor/libreoffice-reference');identities=[]
def body(path,sig):
 s=(root/path).read_text();a=s.index(sig);i=s.index('{',a)+1;depth=1
 while depth:
  depth+=(s[i]=='{')-(s[i]=='}');i+=1
 v=s[a:i];identities.append({'path':path,'signature':sig,'sha256':hashlib.sha256(v.encode()).hexdigest()});return v
base=probe_source(Path('.agentplane/tasks/202610010735-THRTCH/native-phantom-timing.cxx')).read_text().split('int main(){',1)[0]
base=base.replace('id==87?1:0','(id==87||id==86)?1:0')
base=base.replace('constexpr int SVX_NUM_NUMBER_NONE=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_BITMAP=2,SVX_NUM_ARABIC=3;','constexpr int SVX_NUM_NUMBER_NONE=5,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_BITMAP=8,SVX_NUM_ARABIC=4;')
base=base.replace('bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}', 'bool mbContinusNum=false,mbCountPhantoms=true;'+body('sw/inc/numrule.hxx','bool IsContinusNum()')+body('sw/inc/numrule.hxx','void SetContinusNum(')+body('sw/inc/numrule.hxx','bool IsCountPhantoms()')+'void SetCountPhantoms(bool);')
base=base.replace('const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}', 'bool owned[10]={true,true,true,true,true,true,true,true,true,true};const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return owned[level]?&formats[level]:nullptr;}')
base=base.replace('bool IsContinuous()const{return false;}','virtual bool IsContinuous()const=0;')
base=base.replace('void ValidateContinuous(const SwNumberTreeNode*)const{}','void ValidateContinuous(const SwNumberTreeNode*)const;SwNumberTreeNode*GetPred(bool=false)const;SwNumberTreeNode*GetLastDescendant()const;')
base=base.replace('bool IsCountPhantoms()const override;','bool IsContinuous()const override;bool IsCountPhantoms()const override;')
for path,sig in [('sw/source/core/SwNumberTree/SwNodeNum.cxx','bool SwNodeNum::IsContinuous()'),('sw/source/core/SwNumberTree/SwNumberTree.cxx','void SwNumberTreeNode::ValidateContinuous('),('sw/source/core/SwNumberTree/SwNumberTree.cxx','SwNumberTreeNode * SwNumberTreeNode::GetLastDescendant()'),('sw/source/core/SwNumberTree/SwNumberTree.cxx','SwNumberTreeNode * SwNumberTreeNode::GetPred('),('sw/source/core/doc/number.cxx','void SwNumRule::SetCountPhantoms(')]:base+=body(path,sig)+'\n'
# All selected prior source bodies stay complete and unchanged, including complete live continuous branches.
for path,sig in [('sw/source/core/SwNumberTree/SwNodeNum.cxx',s) for s in ['bool SwNodeNum::IsCountPhantoms()','bool SwNodeNum::IsCounted()','bool SwNodeNum::IsRestart()','SwNumberTree::tSwNumTreeNumber SwNodeNum::GetStartValue()','void SwNodeNum::PreAdd()','void SwNodeNum::PostRemove()','void SwNodeNum::ChangeNumRule(','void SwNodeNum::NotifyNode()','bool SwNodeNum::IsNotificationEnabled(','bool SwNodeNum::IsNotifiable(']]+ [('sw/source/core/SwNumberTree/SwNumberTree.cxx',s) for s in ['void SwNumberTreeNode::ValidateHierarchical(', 'void SwNumberTreeNode::Validate(', 'void SwNumberTreeNode::SetLastValid\n', 'void SwNumberTreeNode::NotifyInvalidChildren(', 'void SwNumberTreeNode::Notify(', 'void SwNumberTreeNode::InvalidateTree()', 'void SwNumberTreeNode::Invalidate(', 'void SwNumberTreeNode::AddChild(', 'void SwNumberTreeNode::RemoveChild(', 'void SwNumberTreeNode::RemoveMe(', 'void SwNumberTreeNode::SetLevelInListTree(', 'SwNumberTreeNode * SwNumberTreeNode::CreatePhantom()', 'void SwNumberTreeNode::ClearObsoletePhantoms()', 'void SwNumberTreeNode::MoveChildren(', 'void SwNumberTreeNode::MoveGreaterChildren(', 'void SwNumberTreeNode::GetNumberVector_(', 'bool SwNumberTreeNode::IsCounted()', 'bool SwNumberTreeNode::HasPhantomCountedParent()']]+[('sw/source/core/doc/list.cxx',s)for s in ['void SwList::ValidateListTree(', 'void SwList::InvalidateListTree()','void SwList::InsertListItem(']]+[('sw/source/core/doc/number.cxx','void SwNumRule::Validate(')]:
 assert body(path,sig) in base,sig
base+=r'''
void boolout(bool b){std::cout<<(b?"true":"false");}
int id(const SwNumberTreeNode*n){if(!n)return -999;auto*p=static_cast<const SwNodeNum*>(n)->GetTextNode();return p?p->index:-1-n->GetLevelInListTree();}
void tree(const SwNumberTreeNode*n){std::cout<<"["<<id(n)<<","<<n->GetNumber(false)<<","<<id(n->mpLastValid)<<",";boolout(n->IsPhantom());std::cout<<",";boolout(n->IsCounted());std::cout<<",";boolout(n->IsContinuous());std::cout<<",";boolout(n->IsCountPhantoms());std::cout<<",[";bool comma=false;for(auto*c:n->mChildren){if(comma)std::cout<<",";comma=true;tree(c);}std::cout<<"]]";}
void snapshot(SwDoc&doc,SwNumRule&r,std::vector<std::unique_ptr<SwTextNode>>&texts,int readOrder){std::cout<<"{\"events\":[";bool comma=false;for(auto x:doc.notifications){if(comma)std::cout<<",";comma=true;std::cout<<x;}std::cout<<"],\"raw\":[";comma=false;for(auto&p:texts){if(comma)std::cout<<",";comma=true;if(p->GetNum())std::cout<<p->GetNum()->GetNumber(false);else std::cout<<"null";}std::cout<<"],\"tree\":";const SwNumberTreeNode*root=nullptr;for(auto&p:texts)if(p->GetNum()){root=p->GetNum()->GetRoot();break;}if(root)tree(root);else std::cout<<"null";
 std::vector<SwNumberTree::tNumberVector>vectors(texts.size());for(int k=0;k<int(texts.size());k++){int i=readOrder?texts.size()-1-k:k;vectors[i]=texts[i]->GetNumberVector();}
 std::cout<<",\"vectors\":[";comma=false;for(auto&v:vectors){if(comma)std::cout<<",";comma=true;std::cout<<"[";bool second=false;for(auto x:v){if(second)std::cout<<",";second=true;std::cout<<x;}std::cout<<"]";}std::cout<<"],\"pred\":[";comma=false;for(auto&p:texts){if(comma)std::cout<<",";comma=true;auto*n=p->GetNum();std::cout<<"["<<id(n?n->GetPred():nullptr)<<","<<id(n?n->GetPred(true):nullptr)<<","<<id(n?n->GetLastDescendant():nullptr)<<"]";}std::cout<<"],\"clients\":[";comma=false;for(auto*p:r.maTextNodeList){if(comma)std::cout<<",";comma=true;std::cout<<p->index;}std::cout<<"],\"registry\":[";sw::DocumentListItemsManager::tSortedNodeNumList items;doc.getIDocumentListItems().getNumItems(items);comma=false;for(auto*n:items){if(comma)std::cout<<",";comma=true;std::cout<<n->GetTextNode()->index;}std::cout<<"]}";}
int main(){std::cout<<"[";bool first=true;int count,continuous,phantoms,reading,start,mask,readOrder;while(std::cin>>count>>continuous>>phantoms>>reading>>start>>mask>>readOrder){
 SwDoc doc;SwNodes nodes(&doc);sw::DocumentListItemsManager registry;ListAccess access;access.nodes=&nodes;doc.nodes=&nodes;doc.lists=&access;doc.items=&registry;doc.SetInReading(reading);SwNumRule rule;rule.SetContinusNum(continuous);rule.SetCountPhantoms(phantoms);access.rules[rule.name]=&rule;for(int i=0;i<10;i++){rule.formats[i].start=start+i;rule.owned[i]=mask&(1<<i);}SwTextFormatColl style;
 std::vector<std::unique_ptr<SwTextNode>>texts;std::vector<int>levels;for(int i=0;i<count;i++){int level;std::cin>>level;levels.push_back(level);auto p=std::make_unique<SwTextNode>();p->index=i;p->doc=&doc;p->nodes=&nodes;p->coll=&style;texts.push_back(std::move(p));}
 int ops;std::cin>>ops;if(!first)std::cout<<",";first=false;std::cout<<"[";bool comma=false;for(int step=0;step<ops;step++){int kind,index,value;std::cin>>kind>>index>>value;auto&t=*texts[index];doc.notifications.clear();
 if(kind==0){SfxItemSet items;items.Put(SwNumRuleItem("Counters"));items.Put(StringItem(83,"A"));items.Put(SfxInt16Item(84,levels[index]));t.SetAttr(items);}
 if(kind==1)t.SetAttr(BoolItem(87,value));
 if(kind==2){SfxItemSet items;items.Put(BoolItem(85,true));items.Put(SfxInt16Item(86,value));t.SetAttr(items);}
 if(kind==3)t.SetAttrListLevel(value);
 if(kind==4)t.ResetAttr(73);
 if(kind==5)rule.Validate(doc);
 if(kind==6){rule.SetContinusNum(value);if(auto*list=access.getListByName("A"))list->InvalidateListTree();}
 if(kind==7){rule.SetCountPhantoms(value);if(auto*list=access.getListByName("A"))list->InvalidateListTree();}
 if(kind==8){if(auto*list=access.getListByName("A"))list->ValidateListTree(doc);}
 if(kind==9)doc.SetInReading(value);
 if(kind==10){if(auto*n=t.GetNum())const_cast<SwNodeNum*>(n)->InvalidateAndNotifyTree(doc);}
 if(comma)std::cout<<",";comma=true;snapshot(doc,rule,texts,readOrder);
 }std::cout<<"]";
 }
 std::cout<<"]";
}
'''
(probe_source(out/'native-tree.cxx')).write_text(base)

policy=base.split('void boolout(')[0]+r"""
void boolout(bool b){std::cout<<(b?"true":"false");}
int main(){SwDoc doc;doc.SetInReading(true);std::cout<<"[";bool comma=false;for(bool continuous:{false,true})for(bool phantoms:{false,true}){SwNumRule r;r.SetContinusNum(continuous);r.SetCountPhantoms(phantoms);SwNodeNum root(&r),child(static_cast<SwNumRule*>(nullptr));root.AddChild(&child,0,doc);if(comma)std::cout<<",";comma=true;std::cout<<"[";boolout(continuous);std::cout<<",";boolout(phantoms);std::cout<<",";boolout(root.IsContinuous());std::cout<<",";boolout(root.IsCountPhantoms());std::cout<<",";boolout(child.IsContinuous());std::cout<<",";boolout(child.IsCountPhantoms());std::cout<<"]";}SwNodeNum orphan(static_cast<SwNumRule*>(nullptr));std::cout<<",[null,null,";boolout(orphan.IsContinuous());std::cout<<",";boolout(orphan.IsCountPhantoms());std::cout<<"]]";}
"""
(probe_source(out/'native-policy.cxx')).write_text(policy)

shapes=[[0,1,2,0],[2,2,0,2],[0,3,1,3],[9,9,0,9]]+[[0,n,n,0]for n in [1,4,5,6,7,8]]
cases=[]
for levels in shapes:
 orders=[list(range(4)),list(reversed(range(4))),[2,0,3,1]]
 for order,continuous,phantoms,reading,start,mask in itertools.product(orders,[False,True],[False,True],[False,True],[0,7],[341,1023]):
  ops=[[0,i,0]for i in order]+[[1,0,0],[2,1,0],[5,0,0],[8,0,0],[3,2,0],[3,2,levels[2]],[7,0,int(not phantoms)],[5,0,0],[6,0,int(not continuous)],[5,0,0],[4,1,0],[0,1,0],[9,0,int(not reading)],[10,2,0]]
  cases.append({'levels':levels,'continuous':continuous,'phantoms':phantoms,'reading':reading,'start':start,'mask':mask,'readOrder':int(order[0]!=0),'ops':ops})
(out/'native-input.json').write_text(identity_json(cases,separators=(',',':'))+'\n')
(out/'native-request.txt').write_text(''.join(f'4 {int(c["continuous"])} {int(c["phantoms"])} {int(c["reading"])} {c["start"]} {c["mask"]} {c["readOrder"]} '+' '.join(map(str,c['levels']))+f' {len(c["ops"])} '+' '.join(' '.join(map(str,op))for op in c['ops'])+'\n'for c in cases))
# Marker oracle: complete unchanged MakeNumString and compatible prefix/suffix/list-format bodies; exact enums,variable native continuous flag.
marker=probe_source(Path('.agentplane/tasks/202609302319-9KTM99/native-marker-oracle.cxx')).read_text().split('int main(){',1)[0]
marker=marker.replace('SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2,SVX_NUM_BITMAP=3','SVX_NUM_ARABIC=4,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_NUMBER_NONE=5,SVX_NUM_BITMAP=8').replace('int type=0;','int type=SVX_NUM_ARABIC;')
marker=marker.replace('bool IsContinusNum()const{return false;}','bool mbContinusNum=false;'+body('sw/inc/numrule.hxx','bool IsContinusNum()'))
assert body('sw/source/core/doc/number.cxx','OUString SwNumRule::MakeNumString( const SwNumberTree::tNumberVector')in marker
marker+=r'''
int main(){std::cout<<"[";bool comma=false;for(bool continuous:{false,true})for(int include:{0,1,3,10})for(int level:{0,1,2,9})for(bool pattern:{false,true}){SwNumRule r;r.mbContinusNum=continuous;for(auto&f:r.formats){f.type=SVX_NUM_ARABIC;f.SetPrefix("[");f.SetSuffix("]");f.nInclUpperLevels=include;if(pattern)f.SetListFormat(std::optional<OUString>("%1%.%2%.%3%"));}if(comma)std::cout<<",";comma=true;std::cout<<"["<<(continuous?"true":"false")<<","<<include<<","<<level<<","<<(pattern?"true":"false")<<",\""<<r.MakeNumString({2,3,4,5,6,7,8,9,10,11},true,level,false,nullptr,0).value<<"\"]";}std::cout<<"]";}
'''
(probe_source(out/'native-markers.cxx')).write_text(marker)
(out/'native-identities.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':identities,'priorProfiles':['.agentplane/tasks/202610010735-THRTCH/native-source-identity.json','.agentplane/tasks/202610010449-CE6KDW/native-owner.cxx','.agentplane/tasks/202610011419-EHEH05/native-identities.json'],'policyProfileSha256':hashlib.sha256(policy.encode()).hexdigest(),'treeProfileSha256':hashlib.sha256(base.encode()).hexdigest(),'markerProfileSha256':hashlib.sha256(marker.encode()).hexdigest(),'scope':'Complete unchanged selected tree/record/list/owner/notification and marker bodies. Rule format start/type/raw presence are named bound-input adapters (native scalar getters exact;complete metadata/default format source proof retained47). Attribute pool/string/document position range/style/no-layout/no-redline/fuzz/dtor/field/raw callback/normal broadcaster-event capture/static service/decimal formatter aliases bound proof. Root hidden/original trees empty;single canonical shown document range. Native full format/style/Font/graphics/locale/service/global/destructor/UNO/redline/layout/ODT metadata/UI lifetimes remain unverified.'},indent=2)+'\n')
print(len(cases),'sequences',len(cases)*len(cases[0]['ops'])*4,'record states',len(identities),'source identities')
