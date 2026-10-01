
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
struct SfxItemPool{std::deque<SfxPoolItem> arena;template<class T>void unregisterItemSet(const T&){}static constexpr int SFX_WHICH_MAX=4999;SfxItemPool& GetAttrPool(){return *this;}static bool IsWhich(sal_uInt16);const SfxPoolItem& GetUserOrPoolDefaultItem(int id)const{static std::map<int,SfxPoolItem> items;auto [at,added]=items.emplace(id,SfxPoolItem{id,id==86?1:id==87?1:0});return at->second;}};
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

bool SfxItemPool::IsWhich(sal_uInt16 nId) { return nId && nId <= SFX_WHICH_MAX; }
void SfxItemSet::Changed(const SfxPoolItem*, const SfxPoolItem*) const
{
}
const SfxPoolItem* SfxItemSet::PutImpl(const SfxPoolItem& rItem, bool bPassingOwnership)
{
    if (IsDisabledItem(&rItem))
    {
        // no action needed: IsDisabledItem
        if (bPassingOwnership)
            delete &rItem;
        return nullptr;
    }

    const sal_uInt16 nWhich(rItem.Which());

    if (!GetRanges().doesContainWhich(nWhich))
    {
        // no action needed: not in WhichRange
        if (bPassingOwnership)
            delete &rItem;
        return nullptr;
    }

    const SfxPoolItem* pEntry(nullptr);
    PoolItemMap::iterator aHit(m_aPoolItemMap.find(nWhich));

    if (aHit != m_aPoolItemMap.end())
    {
        // compare items, evtl. containing content compare
        pEntry = aHit->second;

        if (SfxPoolItem::areSame(*pEntry, rItem))
        {
            // no action needed: identical item already in place
            if (bPassingOwnership)
                delete &rItem;
            return nullptr;
        }
    }

    // prepare new entry
    const SfxPoolItem* pNew(implCreateItemEntry(*GetPool(), &rItem, bPassingOwnership));

    // Notification-Callback
    Changed(pEntry, pNew);

    // check register for add/remove. add first so that unregister/register
    // is avoided when an Item is replaced (increase, decrease, do not reach 0)
    checkAddPoolRegistration(pNew);
    checkRemovePoolRegistration(pEntry);

    // cleanup old entry & set entry at m_ppItems array
    implCleanupItemEntry(pEntry);

    if (pEntry)
        aHit->second = pNew;
    else
    {
#ifdef DBG_UTIL
        assert(0 == m_nRegisteredSfxItemIter && "ITEM: SfxItemSet PutImpl with active SfxItemIters (!)");
#endif
        m_aPoolItemMap[nWhich] = pNew;
    }

    return pNew;
}
sal_uInt16 SfxItemSet::ClearItem( sal_uInt16 nWhich )
{
    if( !Count() )
        return 0;

    if( nWhich )
        return ClearSingleItem_ForWhichID(nWhich);

    // clear all & reset to nullptr
    return ClearAllItemsImpl();
}
sal_uInt16 SfxItemSet::ClearSingleItem_ForWhichID( sal_uInt16 nWhich )
{
    PoolItemMap::iterator aHit(m_aPoolItemMap.find(nWhich));

    if (aHit == m_aPoolItemMap.end())
        return 0;

#ifdef DBG_UTIL
    assert(0 == m_nRegisteredSfxItemIter && "ITEM: SfxItemSet ClearItem with active SfxItemIters (!)");
#endif

    ClearSingleItem_PrepareRemove(aHit->second);
    m_aPoolItemMap.erase(aHit);

    return 1;
}
void SfxItemSet::ClearSingleItem_PrepareRemove(const SfxPoolItem* pItem)
{
    if (nullptr == pItem)
        return;

    // Notification-Callback
    Changed(pItem, nullptr);

    // check register for remove
    checkRemovePoolRegistration(pItem);

    // cleanup item & reset ptr
    implCleanupItemEntry(pItem);
}
sal_uInt16 SfxItemSet::ClearAllItemsImpl()
{
    if (0 == Count())
        // no items set, done
        return 0;

#ifdef DBG_UTIL
    assert(0 == m_nRegisteredSfxItemIter && "ITEM: SfxItemSet ClearAllItems with active SfxItemIters (!)");
#endif

    // loop & cleanup items
    for (const auto& rCandidate : m_aPoolItemMap)
        ClearSingleItem_PrepareRemove(rCandidate.second);

    // remember count before resetting it, that is the retval
    const sal_uInt16 nRetval(Count());
    m_aPoolItemMap.clear();

    if (0 != m_nRegister)
    {
        GetPool()->unregisterItemSet(*this);
        m_nRegister = 0;
    }

    return nRetval;
}
void SwAttrSet::Changed(const SfxPoolItem* pOld, const SfxPoolItem* pNew) const
{
    // when neither pOld nor pNew is set, no need to do anything so return
    if (nullptr == m_pOldSet && nullptr == m_pNewSet)
        return;

    // at least one SfxPoolItem has to be provided, else this is an error
    assert(nullptr != pOld || nullptr != pNew);
    sal_uInt16 nWhich(0);

    if (nullptr != pOld)
    {
        // do not handle if an invalid or disabled item is involved
        if (IsInvalidItem(pOld) || IsDisabledItem(pOld))
            return;

        // get WhichID from pOld
        nWhich = pOld->Which();
    }

    if (nullptr != pNew)
    {
        // do not handle if an invalid or disabled item is involved
        if (IsInvalidItem(pNew) || IsDisabledItem(pNew))
            return;

        if (0 == nWhich)
        {
            // get WhichID from pNew
            nWhich = pNew->Which();
        }
    }

    // all given items are valid. If we got no WhichID != 0 then
    // pOld == pNew == nullptr or IsDisabledItem and we have no
    // valid input. Also not needed if !IsWhich (aka > SFX_WHICH_MAX)
    if (0 == nWhich || !SfxItemPool::IsWhich(nWhich))
        return;

    if(m_pOldSet)
    {
        // old state shall be saved
        if (nullptr == pOld)
        {
            // no old value given, generate default from WhichID
            const SfxItemSet* pParent(GetParent());
            m_pOldSet->PutImpl(nullptr != pParent
                ? pParent->Get(nWhich)
                : GetPool()->GetUserOrPoolDefaultItem(nWhich), false);
        }
        else if (!IsInvalidItem(pOld))
        {
            // set/remember old value
            m_pOldSet->PutImpl(*pOld, false);
        }
    }

    if(m_pNewSet)
    {
        // old state shall be saved
        if (nullptr == pNew)
        {
            // no new value given, generate default from WhichID
            const SfxItemSet* pParent(GetParent());
            m_pNewSet->PutImpl(nullptr != pParent
                ? pParent->Get(nWhich)
                : GetPool()->GetUserOrPoolDefaultItem(nWhich), false);
        }
        else if (!IsInvalidItem(pNew))
        {
            // set/remember new value
            m_pNewSet->PutImpl(*pNew, false);
        }
    }
}
bool SwAttrSet::Put_BC( const SfxPoolItem& rAttr,
                       SwAttrSet* pOld, SwAttrSet* pNew )
{
    m_pNewSet = pNew;
    m_pOldSet = pOld;
    bool bRet = nullptr != SfxItemSet::Put( rAttr );
    m_pOldSet = m_pNewSet = nullptr;
    return bRet;
}
bool SwAttrSet::Put_BC( const SfxItemSet& rSet,
                       SwAttrSet* pOld, SwAttrSet* pNew )
{
    m_pNewSet = pNew;
    m_pOldSet = pOld;
    bool bRet = SfxItemSet::Put( rSet );
    m_pOldSet = m_pNewSet = nullptr;
    return bRet;
}
sal_uInt16 SwAttrSet::ClearItem_BC( sal_uInt16 nWhich,
                                    SwAttrSet* pOld, SwAttrSet* pNew )
{
    m_pNewSet = pNew;
    m_pOldSet = pOld;
    sal_uInt16 nRet = SfxItemSet::ClearItem( nWhich );
    m_pOldSet = m_pNewSet = nullptr;
    return nRet;
}
sal_uInt16 SwAttrSet::ClearItem_BC( sal_uInt16 nWhich1, sal_uInt16 nWhich2,
                                    SwAttrSet* pOld, SwAttrSet* pNew )
{
    OSL_ENSURE( nWhich1 <= nWhich2, "no valid range" );
    sal_uInt16 nRet = 0;

    m_pNewSet = pNew;
    m_pOldSet = pOld;
    for( ; nWhich1 <= nWhich2; ++nWhich1 )
        nRet = nRet + SfxItemSet::ClearItem( nWhich1 );
    m_pOldSet = m_pNewSet = nullptr;
    return nRet;
}
namespace AttrSetHandleHelper{
static const SfxPoolItem* Put( std::shared_ptr<const SwAttrSet>& rpAttrSet,
                        const SwContentNode& rNode,
                        const SfxPoolItem& rAttr )
{
    SwAttrSet aNewSet( *rpAttrSet );
    const SfxPoolItem* pRet = aNewSet.Put( rAttr );
    if ( pRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );
    return pRet;
}
static bool Put( std::shared_ptr<const SwAttrSet>& rpAttrSet, const SwContentNode& rNode,
         const SfxItemSet& rSet )
{
    SwAttrSet aNewSet( *rpAttrSet );

    // #i76273# Robust
    std::optional<SfxItemSet> pStyleNames;
    if ( SfxItemState::SET == rSet.GetItemState( RES_FRMATR_STYLE_NAME, false ) )
    {
        pStyleNames.emplace( *aNewSet.GetPool(), WhichRangesContainer(svl::Items<RES_FRMATR_STYLE_NAME, RES_FRMATR_CONDITIONAL_STYLE_NAME>));
        pStyleNames->Put( aNewSet );
    }

    const bool bRet = aNewSet.Put( rSet );

    // #i76273# Robust
    if ( pStyleNames )
    {
        aNewSet.Put( *pStyleNames );
    }

    if ( bRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );

    return bRet;
}
static bool Put_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,
            const SwContentNode& rNode, const SfxPoolItem& rAttr,
            SwAttrSet* pOld, SwAttrSet* pNew )
{
    SwAttrSet aNewSet( *rpAttrSet );

    // for a correct broadcast, we need to do a SetModifyAtAttr with the items
    // from aNewSet. The 'regular' SetModifyAtAttr is done in GetNewAutoStyle
    if( rNode.GetModifyAtAttr() )
        aNewSet.SetModifyAtAttr( &rNode );

    const bool bRet = aNewSet.Put_BC( rAttr, pOld, pNew );

    if ( bRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );

    return bRet;
}
static bool Put_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,
            const SwContentNode& rNode, const SfxItemSet& rSet,
            SwAttrSet* pOld, SwAttrSet* pNew )
{
    SwAttrSet aNewSet( *rpAttrSet );

    // #i76273# Robust
    std::optional<SfxItemSet> pStyleNames;
    if ( SfxItemState::SET == rSet.GetItemState( RES_FRMATR_STYLE_NAME, false ) )
    {
        pStyleNames.emplace( *aNewSet.GetPool(), WhichRangesContainer(svl::Items<RES_FRMATR_STYLE_NAME, RES_FRMATR_CONDITIONAL_STYLE_NAME>));
        pStyleNames->Put( aNewSet );
    }

    // for a correct broadcast, we need to do a SetModifyAtAttr with the items
    // from aNewSet. The 'regular' SetModifyAtAttr is done in GetNewAutoStyle
    if( rNode.GetModifyAtAttr() )
        aNewSet.SetModifyAtAttr( &rNode );

    const bool bRet = aNewSet.Put_BC( rSet, pOld, pNew );

    // #i76273# Robust
    if ( pStyleNames )
    {
        aNewSet.Put( *pStyleNames );
    }

    if ( bRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );

    return bRet;
}
static sal_uInt16 ClearItem_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,
                     const SwContentNode& rNode, sal_uInt16 nWhich,
                     SwAttrSet* pOld, SwAttrSet* pNew )
{
    SwAttrSet aNewSet( *rpAttrSet );
    if( rNode.GetModifyAtAttr() )
        aNewSet.SetModifyAtAttr( &rNode );
    const sal_uInt16 nRet = aNewSet.ClearItem_BC( nWhich, pOld, pNew );
    if ( nRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );
    return nRet;
}
static sal_uInt16 ClearItem_BC( std::shared_ptr<const SwAttrSet>& rpAttrSet,
                     const SwContentNode& rNode,
                     sal_uInt16 nWhich1, sal_uInt16 nWhich2,
                     SwAttrSet* pOld, SwAttrSet* pNew )
{
    SwAttrSet aNewSet( *rpAttrSet );
    if( rNode.GetModifyAtAttr() )
        aNewSet.SetModifyAtAttr( &rNode );
    const sal_uInt16 nRet = aNewSet.ClearItem_BC( nWhich1, nWhich2, pOld, pNew );
    if ( nRet )
        GetNewAutoStyle( rpAttrSet, rNode, aNewSet );
    return nRet;
}
}
bool SwContentNode::SetAttr(const SfxPoolItem& rAttr )
{
    if( !GetpSwAttrSet() ) // Have the Nodes created by the corresponding AttrSets
        NewAttrSet( GetDoc().GetAttrPool() );

    OSL_ENSURE( GetpSwAttrSet(), "Why did't we create an AttrSet?");

    InvalidateInSwCache();

    bool bRet = false;
    // If Modify is locked, we do not send any Modifys
    if( IsModifyLocked() ||
        ( !HasWriterListeners() &&  RES_PARATR_NUMRULE != rAttr.Which() ))
    {
        bRet = nullptr != AttrSetHandleHelper::Put( mpAttrSet, *this, rAttr );
    }
    else
    {
        SwAttrSet aOld( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() ),
                  aNew( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() );
        bRet = AttrSetHandleHelper::Put_BC( mpAttrSet, *this, rAttr, &aOld, &aNew );
        if( bRet )
            sw::ClientNotifyAttrChg(*this, *GetpSwAttrSet(), aOld, aNew);
    }
    return bRet;
}
bool SwContentNode::SetAttr( const SfxItemSet& rSet )
{
    InvalidateInSwCache();

    if( const SwFormatAutoFormat* pFnd = rSet.GetItemIfSet( RES_AUTO_STYLE, false ) )
    {
        OSL_ENSURE( rSet.Count() == 1, "SetAutoStyle mixed with other attributes?!" );

        // If there already is an attribute set (usually containing a numbering
        // item), we have to merge the attribute of the new set into the old set:
        bool bSetParent = true;
        if ( GetpSwAttrSet() )
        {
            bSetParent = false;
            AttrSetHandleHelper::Put( mpAttrSet, *this, *pFnd->GetStyleHandle() );
        }
        else
        {
            std::shared_ptr<SfxItemSet> pItemSet = pFnd->GetStyleHandle();
            mpAttrSet = std::dynamic_pointer_cast<SwAttrSet>(pItemSet);
            assert(bool(pItemSet) == bool(mpAttrSet) && "types do not match");

            // Wholesale mpAttrSet replacement bypasses SwClientNotify, so
            // the link tracker would miss a deferred XFillBitmapItem
            // carried in by the autostyle (typical ODF load path for
            // paragraph fills). Notify it directly.
            sw::notifyFillBitmapForPutSet(*this, *mpAttrSet, mpAttrSet.get());
        }

        if ( bSetParent )
        {
            // If the content node has a conditional style, we have to set the
            // string item containing the correct conditional style name (the
            // style name property has already been set during the import!)
            // In case we do not have a conditional style, we make use of the
            // fact that nobody else uses the attribute set behind the handle.
            // FME 2007-07-10 #i78124# If autostyle does not have a parent,
            // the string is empty.
            const SfxStringItem* pNameItem = nullptr;
            if ( nullptr != GetCondFormatColl() ||
                 !(pNameItem = mpAttrSet->GetItemIfSet( RES_FRMATR_STYLE_NAME, false )) ||
                 pNameItem->GetValue().isEmpty() )
                AttrSetHandleHelper::SetParent( mpAttrSet, *this, &GetAnyFormatColl(), GetFormatColl() );
            else
                const_cast<SwAttrSet*>(mpAttrSet.get())->SetParent( &GetFormatColl()->GetAttrSet() );
        }

        return true;
    }

    if( !GetpSwAttrSet() ) // Have the AttrsSets created by the corresponding Nodes
        NewAttrSet( GetDoc().GetAttrPool() );

    bool bRet = false;
    // If Modify is locked, do not send any Modifys
    if ( IsModifyLocked() ||
         ( !HasWriterListeners() &&
           SfxItemState::SET != rSet.GetItemState( RES_PARATR_NUMRULE, false ) ) )
    {
        // Some special treatment for Attributes
        bRet = AttrSetHandleHelper::Put( mpAttrSet, *this, rSet );
    }
    else
    {
        SwAttrSet aOld( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() ),
                  aNew( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() );
        bRet = AttrSetHandleHelper::Put_BC( mpAttrSet, *this, rSet, &aOld, &aNew );
        if( bRet )
            sw::ClientNotifyAttrChg(*this, *GetpSwAttrSet(), aOld, aNew);
    }
    return bRet;
}
bool SwContentNode::ResetAttr( sal_uInt16 nWhich1, sal_uInt16 nWhich2 )
{
    if( !GetpSwAttrSet() )
        return false;

    InvalidateInSwCache();

    // If Modify is locked, do not send out any Modifys
    if( IsModifyLocked() )
    {
        sal_uInt16 nDel = 0;
        if ( !nWhich2 || nWhich2 < nWhich1 )
        {
            nDel = ClearItemsFromAttrSet( { nWhich1 } );
        }
        else
            nDel = AttrSetHandleHelper::ClearItem_BC( mpAttrSet, *this, nWhich1, nWhich2, nullptr, nullptr );

        if( !GetpSwAttrSet()->Count() ) // Empty? Delete
            mpAttrSet.reset();
        return 0 != nDel;
    }

    // No valid area defined?
    if( !nWhich2 || nWhich2 < nWhich1 )
        nWhich2 = nWhich1; // Then set only this Item to 1st Id

    SwAttrSet aOld( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() ),
              aNew( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() );
    bool bRet = 0 != AttrSetHandleHelper::ClearItem_BC( mpAttrSet, *this, nWhich1, nWhich2, &aOld, &aNew );

    if( bRet )
    {
        sw::ClientNotifyAttrChg(*this, *GetpSwAttrSet(), aOld, aNew);

        if( !GetpSwAttrSet()->Count() ) // Empty?, delete it
            mpAttrSet.reset();
    }
    return bRet;
}
bool SwContentNode::ResetAttr( const std::vector<sal_uInt16>& rWhichArr )
{
    if( !GetpSwAttrSet() )
        return false;

    InvalidateInSwCache();
    // If Modify is locked, do not send out any Modifys
    sal_uInt16 nDel = 0;
    if( IsModifyLocked() )
    {
        nDel = ClearItemsFromAttrSet( rWhichArr );
    }
    else
    {
        SwAttrSet aOld( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() ),
                  aNew( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() );

        for ( const auto& rWhich : rWhichArr )
            if( AttrSetHandleHelper::ClearItem_BC( mpAttrSet, *this, rWhich, &aOld, &aNew ))
                ++nDel;

        if( nDel )
            sw::ClientNotifyAttrChg(*this, *GetpSwAttrSet(), aOld, aNew);
    }
    if( !GetpSwAttrSet()->Count() ) // Empty?, delete it
        mpAttrSet.reset();
    return 0 != nDel ;
}
sal_uInt16 SwContentNode::ResetAllAttr()
{
    if( !GetpSwAttrSet() )
        return 0;
    InvalidateInSwCache();

    // If Modify is locked, do not send out any Modifys
    if( IsModifyLocked() )
    {
        sal_uInt16 nDel = ClearItemsFromAttrSet( { 0 } );
        if( !GetpSwAttrSet()->Count() ) // Empty? Delete
            mpAttrSet.reset();
        return nDel;
    }

    SwAttrSet aOld( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() ),
              aNew( *GetpSwAttrSet()->GetPool(), GetpSwAttrSet()->GetRanges() );
    bool bRet = 0 != AttrSetHandleHelper::ClearItem_BC( mpAttrSet, *this, 0, &aOld, &aNew );

    if( bRet )
    {
        sw::ClientNotifyAttrChg(*this, *GetpSwAttrSet(), aOld, aNew);
        if( !GetpSwAttrSet()->Count() ) // Empty? Delete
            mpAttrSet.reset();
    }
    return aNew.Count();
}
sal_uInt16 SwContentNode::ClearItemsFromAttrSet( const std::vector<sal_uInt16>& rWhichIds )
{
    sal_uInt16 nRet = 0;
    if ( rWhichIds.empty() )
        return nRet;

    OSL_ENSURE( GetpSwAttrSet(), "no item set" );
    SwAttrSet aNewAttrSet( *GetpSwAttrSet() );
    for ( const auto& rWhichId : rWhichIds )
    {
        nRet = nRet + aNewAttrSet.ClearItem( rWhichId );
    }
    if ( nRet )
        AttrSetHandleHelper::GetNewAutoStyle( mpAttrSet, *this, aNewAttrSet );

    return nRet;
}

void print(const SwAttrSet* s){if(!s){std::cout<<"null";return;}std::cout<<'[';bool comma=false;for(auto& [id,p]:s->m_aPoolItemMap){if(comma)std::cout<<',';comma=true;std::cout<<'['<<id<<','<<p->value<<','<<p->state<<']';}std::cout<<']';}
int main(){int count;while(std::cin>>count){SwContentNode node;std::cout<<'[';for(int at=0;at<count;at++){int kind,size;std::cin>>kind>>size;std::vector<int> x(size);for(auto& v:x)std::cin>>v;auto before=node.mpAttrSet;node.events.clear();int result=-1;
 if(kind==0)result=node.SetAttr(SfxPoolItem{x[0],x[1]});
 if(kind==1){SfxItemSet s(node.pool,0);for(int i=0;i<size;i+=2)s.Put(SfxPoolItem{x[i],x[i+1]});result=node.SetAttr(s);}
 if(kind==2)result=node.ResetAttr(x[0],x[1]);if(kind==3){std::vector<sal_uInt16> ids(x.begin(),x.end());result=node.ResetAttr(ids);}if(kind==4)result=node.ResetAllAttr();
 if(kind==5||kind==6){if(!node.mpAttrSet)node.NewAttrSet(node.pool);const_cast<SwAttrSet*>(node.mpAttrSet.get())->m_aPoolItemMap[x[0]]=nullptr;SfxPoolItem sentinel{x[0],0,kind==5?1:2};const_cast<SwAttrSet*>(node.mpAttrSet.get())->m_aPoolItemMap[x[0]]=implCreateItemEntry(node.pool,&sentinel,false);}
 if(kind==7){SfxItemSet empty(node.pool,0);result=node.SetAttr(empty);}if(kind==8)node.format.attrs.Put(SfxPoolItem{x[0],x[1]});if(kind==9)node.pending=x;
 if(at)std::cout<<',';std::cout<<"{\"result\":"<<result<<",\"same\":"<<(before==node.mpAttrSet?"true":"false")<<",\"current\":";print(node.mpAttrSet.get());std::cout<<",\"retained\":";print(before.get());std::cout<<",\"events\":[";for(int i=0;i<node.events.size();i++){if(i)std::cout<<',';auto e=node.events[i];std::cout<<'['<<e[0]<<','<<e[1]<<','<<e[2]<<']';}std::cout<<"]}";}std::cout<<"]\n";}}
