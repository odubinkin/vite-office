"""Compile unchanged native mutation/delta bodies with named dependency adapters."""
from pathlib import Path
import hashlib,json,subprocess,random
root=Path('.agentplane/tasks/202610010849-VYM64Q')
sources={k:Path('vendor/libreoffice-reference/'+v).read_text() for k,v in {
 'node':'sw/source/core/docnode/node.cxx','attr':'sw/source/core/attr/swatrset.cxx',
 'set':'svl/source/items/itemset.cxx','pool':'include/svl/itempool.hxx'}.items()}
def block(s,m):
 a=s.index(m);b=s.index('{',a);i=b+1;depth=1
 while depth:depth+=(s[i]=='{')-(s[i]=='}');i+=1
 return s[a:i]
defs=[]
def take(k,m):
 t=block(sources[k],m);defs.append({'source':k,'marker':m,'bytes':len(t.encode()),'sha256':hashlib.sha256(t.encode()).hexdigest()});return t
base=r'''
#include <map>
#include <vector>
#include <memory>
#include <optional>
#include <functional>
#include <iostream>
#include <cassert>
#include <utility>
#include <deque>
#define OSL_ENSURE(a,b) assert(a)
using sal_uInt16=unsigned short;
struct SfxPoolItem{int which,value,state=0;int Which()const{return which;}static bool areSame(const SfxPoolItem& a,const SfxPoolItem& b){return a.which==b.which&&a.value==b.value&&a.state==b.state;}};
bool IsInvalidItem(const SfxPoolItem* p){return p&&p->state==1;}
bool IsDisabledItem(const SfxPoolItem* p){return p&&p->state==2;}
struct SfxStringItem:SfxPoolItem{struct Str{bool isEmpty()const{return true;}};Str GetValue()const{return {};}};
struct SwAttrSet;struct SwFormatAutoFormat{std::shared_ptr<SwAttrSet> GetStyleHandle()const{return {};}};
template<class T>struct TypedWhichId{int value;constexpr operator int()const{return value;}};
constexpr TypedWhichId<SwFormatAutoFormat> RES_AUTO_STYLE{700};
constexpr TypedWhichId<SfxStringItem> RES_FRMATR_STYLE_NAME{701};constexpr int RES_FRMATR_CONDITIONAL_STYLE_NAME=702,RES_PARATR_NUMRULE=73;
enum class SfxItemState{DEFAULT,SET};
struct WhichRangesContainer{template<class T>WhichRangesContainer(T){}};
namespace svl{template<int...>constexpr int Items=0;}
struct SfxItemPool{std::deque<SfxPoolItem> arena;template<class T>void unregisterItemSet(const T&){}static constexpr int SFX_WHICH_MAX=4999;static bool IsWhich(sal_uInt16);const SfxPoolItem& GetUserOrPoolDefaultItem(int id)const{static std::map<int,SfxPoolItem> items;auto [at,added]=items.emplace(id,SfxPoolItem{id,id==86?1:id==87?1:0});return at->second;}};
const SfxPoolItem* implCreateItemEntry(SfxItemPool& p,const SfxPoolItem* x,bool){p.arena.push_back(*x);return &p.arena.back();}void implCleanupItemEntry(const SfxPoolItem*){}
struct SfxItemSet{
 using PoolItemMap=std::map<int,const SfxPoolItem*>;PoolItemMap m_aPoolItemMap;int m_nRegister=0;SfxItemPool* pool;const SfxItemSet* parent=nullptr;
 SfxItemSet(SfxItemPool& p,int):pool(&p){}SfxItemSet(SfxItemPool& p,WhichRangesContainer):pool(&p){}
 virtual ~SfxItemSet()=default;virtual void Changed(const SfxPoolItem*,const SfxPoolItem*)const;
 SfxItemPool* GetPool()const{return pool;}auto GetRanges()const{return Range{};}struct Range{bool doesContainWhich(int id)const{return id>0;}operator int()const{return 0;}};int Count()const{return m_aPoolItemMap.size();}
 const SfxItemSet* GetParent()const{return parent;}void SetParent(const SfxItemSet* p){parent=p;}
 const SfxPoolItem& Get(int id)const{auto at=m_aPoolItemMap.find(id);return at==m_aPoolItemMap.end()?(parent?parent->Get(id):pool->GetUserOrPoolDefaultItem(id)):*at->second;}
 template<class T>const T* GetItemIfSet(TypedWhichId<T>,bool)const{return nullptr;}
 SfxItemState GetItemState(int id,bool)const{return m_aPoolItemMap.count(id)?SfxItemState::SET:SfxItemState::DEFAULT;}
 const SfxPoolItem* Put(const SfxPoolItem& x){return PutImpl(x,false);}const SfxPoolItem* PutImpl(const SfxPoolItem&,bool);
 bool Put(const SfxItemSet& x){bool changed=false;for(auto& [id,item]:x.m_aPoolItemMap){if(IsDisabledItem(item))continue;if(IsInvalidItem(item))changed=ClearItem(id)!=0||changed;else changed=(Put(*item)!=nullptr)||changed;}return changed;}
 sal_uInt16 ClearItem(sal_uInt16);sal_uInt16 ClearSingleItem_ForWhichID(sal_uInt16);void ClearSingleItem_PrepareRemove(const SfxPoolItem*);sal_uInt16 ClearAllItemsImpl();
 void checkRemovePoolRegistration(const SfxPoolItem*){}void checkAddPoolRegistration(const SfxPoolItem*){}

};
struct SwAttrSet:SfxItemSet{
 SwAttrSet* m_pOldSet=nullptr;SwAttrSet* m_pNewSet=nullptr;
 SwAttrSet(SfxItemPool& p,int r):SfxItemSet(p,r){}SwAttrSet(const SwAttrSet& p):SfxItemSet(p){}
 void Changed(const SfxPoolItem*,const SfxPoolItem*)const override;
 bool Put_BC(const SfxPoolItem&,SwAttrSet*,SwAttrSet*);bool Put_BC(const SfxItemSet&,SwAttrSet*,SwAttrSet*);
 sal_uInt16 ClearItem_BC(sal_uInt16,SwAttrSet*,SwAttrSet*);sal_uInt16 ClearItem_BC(sal_uInt16,sal_uInt16,SwAttrSet*,SwAttrSet*);
 bool SetModifyAtAttr(const void*){return false;}
};
struct SwFormat{SwAttrSet attrs;SwFormat(SfxItemPool& p):attrs(p,0){}const SwAttrSet& GetAttrSet()const{return attrs;}};
struct SwContentNode{
 std::shared_ptr<const SwAttrSet> mpAttrSet;SfxItemPool pool;SwFormat format{pool};
 std::vector<std::vector<int>> events;std::optional<std::vector<int>> pending;
 bool SetAttr(const SfxPoolItem&);bool SetAttr(const SfxItemSet&);bool ResetAttr(sal_uInt16,sal_uInt16=0);bool ResetAttr(const std::vector<sal_uInt16>&);sal_uInt16 ResetAllAttr();sal_uInt16 ClearItemsFromAttrSet(const std::vector<sal_uInt16>&);
 const SwAttrSet* GetpSwAttrSet()const{return mpAttrSet.get();}SfxItemPool& GetDoc(){return pool;}bool IsModifyLocked()const{return false;}bool HasWriterListeners()const{return true;}bool GetModifyAtAttr()const{return false;}
 void InvalidateInSwCache(){}void NewAttrSet(SfxItemPool& p){auto s=std::make_shared<SwAttrSet>(p,0);s->SetParent(&format.attrs);mpAttrSet=s;}
 SwFormat* GetCondFormatColl(){return nullptr;}SwFormat& GetAnyFormatColl(){return format;}SwFormat* GetFormatColl(){return &format;}
};
// DEPENDENCY ADAPTERS: existing unlocked model observer path; no platform cache/client/modify-lock lifetime.
namespace sw{
 void notifyFillBitmapForPutSet(SwContentNode&,const SwAttrSet&,const SwAttrSet*){}
 void ClientNotifyAttrChg(SwContentNode& n,const SwAttrSet& current,const SwAttrSet& old,const SwAttrSet& next){n.events.push_back({current.Count(),old.Count(),next.Count()});auto action=std::exchange(n.pending,std::nullopt);if(action){auto x=*action;if(x[0]==0)n.SetAttr(SfxPoolItem{x[1],x[2]});else if(x[0]==1)n.ResetAttr(x[1]);else{n.format.attrs.Put(SfxPoolItem{x[1],x[2]});}}}
}
namespace AttrSetHandleHelper{
// FRESH-HANDLE STYLE ACCESS ADAPTER: commits a copied const handle; no native pool dedup/refcount/surrogate claim.
void GetNewAutoStyle(std::shared_ptr<const SwAttrSet>& p,const SwContentNode&,const SwAttrSet& set){p=std::make_shared<SwAttrSet>(set);}
void SetParent(std::shared_ptr<const SwAttrSet>&,const SwContentNode&,const SwFormat*,const SwFormat*){}
}
'''
# GetDoc().GetAttrPool() is a native accessor dependency, not an altered owner body.
base=base.replace('static bool IsWhich(sal_uInt16);','SfxItemPool& GetAttrPool(){return *this;}static bool IsWhich(sal_uInt16);')
pool=take('pool','static bool IsWhich(');base+='\nbool SfxItemPool::'+pool[len('static bool '):]+'\n'
base+=take('set','void SfxItemSet::Changed(')+'\n'
for m in ['const SfxPoolItem* SfxItemSet::PutImpl(', 'sal_uInt16 SfxItemSet::ClearItem(', 'sal_uInt16 SfxItemSet::ClearSingleItem_ForWhichID(', 'void SfxItemSet::ClearSingleItem_PrepareRemove(', 'sal_uInt16 SfxItemSet::ClearAllItemsImpl()']:base+=take('set',m)+'\n'
base+=take('attr','void SwAttrSet::Changed(')+'\n'
for m in ['bool SwAttrSet::Put_BC( const SfxPoolItem&','bool SwAttrSet::Put_BC( const SfxItemSet&','sal_uInt16 SwAttrSet::ClearItem_BC( sal_uInt16 nWhich,','sal_uInt16 SwAttrSet::ClearItem_BC( sal_uInt16 nWhich1,']:
 base+=take('attr',m)+'\n'
base+='namespace AttrSetHandleHelper{\n'
for m in ['static const SfxPoolItem* Put(', 'static bool Put( std::shared_ptr', 'static bool Put_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,\n            const SwContentNode& rNode, const SfxPoolItem&','static bool Put_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,\n            const SwContentNode& rNode, const SfxItemSet&','static sal_uInt16 ClearItem_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,\n                     const SwContentNode& rNode, sal_uInt16 nWhich,','static sal_uInt16 ClearItem_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,\n                     const SwContentNode& rNode,\n                     sal_uInt16 nWhich1,']:
 base+=take('node',m)+'\n'
base+='}\n'
for m in ['bool SwContentNode::SetAttr(const SfxPoolItem&','bool SwContentNode::SetAttr( const SfxItemSet&','bool SwContentNode::ResetAttr( sal_uInt16','bool SwContentNode::ResetAttr( const std::vector','sal_uInt16 SwContentNode::ResetAllAttr()','sal_uInt16 SwContentNode::ClearItemsFromAttrSet(']:base+=take('node',m)+'\n'
base+=r'''
void print(const SwAttrSet* s){if(!s){std::cout<<"null";return;}std::cout<<'[';bool comma=false;for(auto& [id,p]:s->m_aPoolItemMap){if(comma)std::cout<<',';comma=true;std::cout<<'['<<id<<','<<p->value<<','<<p->state<<']';}std::cout<<']';}
int main(){int count;while(std::cin>>count){SwContentNode node;std::cout<<'[';for(int at=0;at<count;at++){int kind,size;std::cin>>kind>>size;std::vector<int> x(size);for(auto& v:x)std::cin>>v;auto before=node.mpAttrSet;node.events.clear();int result=-1;
 if(kind==0)result=node.SetAttr(SfxPoolItem{x[0],x[1]});
 if(kind==1){SfxItemSet s(node.pool,0);for(int i=0;i<size;i+=2)s.Put(SfxPoolItem{x[i],x[i+1]});result=node.SetAttr(s);}
 if(kind==2)result=node.ResetAttr(x[0],x[1]);if(kind==3){std::vector<sal_uInt16> ids(x.begin(),x.end());result=node.ResetAttr(ids);}if(kind==4)result=node.ResetAllAttr();
 if(kind==5||kind==6){if(!node.mpAttrSet)node.NewAttrSet(node.pool);const_cast<SwAttrSet*>(node.mpAttrSet.get())->m_aPoolItemMap[x[0]]=nullptr;SfxPoolItem sentinel{x[0],0,kind==5?1:2};const_cast<SwAttrSet*>(node.mpAttrSet.get())->m_aPoolItemMap[x[0]]=implCreateItemEntry(node.pool,&sentinel,false);}
 if(kind==7){SfxItemSet empty(node.pool,0);result=node.SetAttr(empty);}if(kind==8)node.format.attrs.Put(SfxPoolItem{x[0],x[1]});if(kind==9)node.pending=x;
 if(at)std::cout<<',';std::cout<<"{\"result\":"<<result<<",\"same\":"<<(before==node.mpAttrSet?"true":"false")<<",\"current\":";print(node.mpAttrSet.get());std::cout<<",\"retained\":";print(before.get());std::cout<<",\"events\":[";for(int i=0;i<node.events.size();i++){if(i)std::cout<<',';auto e=node.events[i];std::cout<<'['<<e[0]<<','<<e[1]<<','<<e[2]<<']';}std::cout<<"]}";}std::cout<<"]\n";}}
'''
(root/'native-attributes.cxx').write_text(base)
binary=root/'native-attributes';subprocess.run(['clang++','-std=c++20',str(root/'native-attributes.cxx'),'-o',str(binary)],check=True)
cases=[]
for kind in [2,3,4]:
 for state in [[],[[7]],[[0,84,4]],[[0,84,4],[0,86,7]],[[5,85]],[[6,87]],[[0,84,4],[5,85],[6,87]]]:
  resets=[[kind,84,84],[kind,84,83],[kind,84,87],[kind,0,0]] if kind==2 else [[3],[3,84],[3,84,84,85,87],[3,86,84]] if kind==3 else [[4]]
  for reset in resets:
   cases.append({'ops':state+[reset]})
   for cb in [[0,84,2],[1,83,0],[2,84,3]]:cases.append({'ops':state+[[9,*cb],reset]})
for x in [0,2,4]:
 for which in [84,86]:
  cases.append({'ops':[[8,84,3],[0,which,4],[0,which,x],[0,which,x],[1,84,x,86,7],[3,84,86],[4]]})
cases.append({'ops':[[0,84,4],[0,85,1],[0,86,7],[9,1,86,0],[2,84,84]]})
cases.append({'ops':[[0,86,7],[9,1,86,0],[0,84,4]]})
random.seed(39)
for i in range(40):
 ops=[]
 for j in range(25):
  k=random.randrange(10);w=random.choice([84,85,86,87]);v=random.choice([0,1,2,4,7])
  ops.append([k,w,v] if k in [0,8] else [1,84,v,86,7] if k==1 else [2,w,random.choice([0,w,87])] if k==2 else [3,*random.sample([84,85,86,87],random.randrange(5))] if k==3 else [4] if k==4 else [k,w] if k in [5,6] else [7] if k==7 else [9,random.choice([0,2]),84,v])
 cases.append({'ops':ops})
request=''.join(str(len(c['ops']))+' '+' '.join(str(o[0])+' '+str(len(o)-1)+' '+' '.join(map(str,o[1:])) for o in c['ops'])+'\n' for c in cases)
try:
 lines=subprocess.check_output([str(binary)],input=request,text=True).splitlines()
except subprocess.CalledProcessError:
 for i,c in enumerate(cases):
  one=str(len(c['ops']))+' '+' '.join(str(o[0])+' '+str(len(o)-1)+' '+' '.join(map(str,o[1:])) for o in c['ops'])+'\n'
  r=subprocess.run([str(binary)],input=one,text=True,capture_output=True)
  if r.returncode:
   (root/'native-crash-case.json').write_text(json.dumps({'case':i,**c},indent=2)+'\n')
   print('Native dependency adapter crash case',i,c,flush=True);break
 raise
finally:binary.unlink()
assert len(lines)==len(cases)
for c,l in zip(cases,lines):c['expected']=json.loads(l)
(root/'native-results.json').write_text(json.dumps(cases,separators=(',',':'))+'\n');(root/'native-source-identity.json').write_text(json.dumps(defs,indent=2)+'\n')
print(f'{len(defs)} unchanged definitions;{len(cases)} sequences/{sum(len(c["ops"]) for c in cases)} states. Fresh-handle style-access/raw-pool/unlocked model-observer/no-platform-cache adapters;no full native autostyle pool/refcount/surrogate/modify-lock/conditional/auto-style/fill/client lifetime claim.')
