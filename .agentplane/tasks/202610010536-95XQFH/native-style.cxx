
#include <vector>
#include <set>
#include <iterator>
#include <algorithm>
#include <iostream>
#include <memory>
#include <cstdint>
#include <string>
#include <map>
#include <cassert>
using sal_uInt16=uint16_t;
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
#define OSL_FAIL(message) ((void)0)

class SwTextNode;class SwNodeNum;class SwList;struct SwNodes;struct ListAccess;namespace sw {class DocumentListItemsManager;}
struct OUString:std::string {using std::string::string;bool isEmpty()const{return empty();}};
using UIName=OUString;

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

enum class SwListRedlineType {SHOW,HIDDEN,ORIGTEXT};
struct SwRootFrame {bool IsHideRedlines()const{return false;}};
struct SwTextFrame {SwRootFrame* getRootFrame(){return nullptr;}SwTextNode* GetTextNodeForParaProps(){return nullptr;}};
struct SwDocShell {bool IsChangeRecording()const{return false;}};
enum class RedlineType {Insert,Delete};
struct SwRangePos {struct Node {int GetIndex()const{return 0;}};Node GetNode()const{return {};}int GetNodeIndex()const{return 0;}};using SwPositionBase=SwRangePos;struct SwRangeRedline {const struct SwPosition* Start()const{return nullptr;}const struct SwPosition* End()const{return nullptr;}};
struct SwRedlineTable:std::vector<SwRangeRedline*> {using size_type=std::size_t;static constexpr size_type npos=-1;};
struct RedlineAccess {SwRedlineTable table;const SwRedlineTable& GetRedlineTable()const{return table;}std::size_t GetRedlinePos(const SwTextNode&,RedlineType)const{return SwRedlineTable::npos;}};
using SwNodeOffset=int;
namespace sw {enum class IteratorMode {UnwrapMulti};}
template<class A,class B,sw::IteratorMode C=sw::IteratorMode::UnwrapMulti>struct SwIterator {SwIterator(B&){}A* First(){return nullptr;}A* Next(){return nullptr;}};
struct SwDoc {void ResetAttrs(SwPaM&,bool,const std::set<sal_uInt16>&,bool);SwNumRule* FindNumRulePtr(const UIName&)const;SwNumRule* GetOutlineNumRule()const;Footnotes& GetFootnoteIdxs(){static Footnotes x;return x;}FootnoteInfo GetFootnoteInfo()const{return {};}ListAccess* lists;sw::DocumentListItemsManager* items;SwNodes* nodes;ListAccess& getIDocumentListsAccess()const;sw::DocumentListItemsManager& getIDocumentListItems()const;SwNodes& GetNodes()const;SwDocShell* GetDocShell(){return nullptr;}bool IsInXMLImport()const{return false;}bool IsInWriterfilterImport()const{return false;}RedlineAccess& getIDocumentRedlineAccess(){static RedlineAccess access;return access;}};
namespace comphelper {bool IsFuzzing(){return false;}}
namespace o3tl {template<class T>using sorted_vector=std::set<T>;}

using std::vector;
#define OSL_ENSURE(condition,message) ((void)0)
namespace SwNumberTree {using tSwNumTreeNumber=long;using tNumberVector=std::vector<long>;}
constexpr int MAXLEVEL=10;

struct SwNumFormat {long start=1;bool bullet=false;long GetStart()const{return start;}bool IsEnumeration()const{return !bullet;}bool IsItemize()const{return bullet;}};
struct SwNumRule {using tTextNodeList=std::vector<SwTextNode*>;tTextNodeList maTextNodeList;bool mbInvalidRuleFlag=true;OUString name="Counters";SwNumFormat formats[10];bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}const SwNumFormat& Get(sal_uInt16 level)const{return formats[level];}const UIName& GetName()const{return name;}static UIName GetOutlineRuleName();void GetTextNodeList(tTextNodeList&)const;std::size_t GetTextNodeListSize()const;void AddTextNode(SwTextNode&);void RemoveTextNode(SwTextNode&);void Validate(const SwDoc&);};
struct SwNodes {SwDoc* owner;SwDoc& m_rMyDoc;SwNodes(SwDoc* d):owner(d),m_rMyDoc(*d){}bool canonical=true;bool IsDocNodes()const;void UpdateOutlineNode(SwTextNode&){}SwTextNode* operator[](int){return nullptr;}};
struct SwTextNode:SwContentNode {
 int index=0;bool counted=true,restart=false;long actualStart=0;int level=0;bool canonical=true;SwDoc* doc;SwNodes* nodes;SwNumRule* rule;OUString listId="A";
 std::unique_ptr<SwNodeNum> mpNodeNum,mpNodeNumRLHidden,mpNodeNumOrig;
 int GetIndex()const{return index;}SwDoc& GetDoc()const{return *doc;}SwNodes& GetNodes()const{return *nodes;}OUString GetListId()const;SwNumRule* GetNumRule(bool=true)const;int GetAttrListLevel()const{return GetAttr(RES_PARATR_LIST_LEVEL).GetValue();}int GetActualListLevel()const;
 bool IsCountedInList()const{return GetAttr(RES_PARATR_LIST_ISCOUNTED).GetValue();}bool IsListRestart()const{return GetAttr(RES_PARATR_LIST_ISRESTART).GetValue();}long GetActualListStartValue()const;
 sw::DocumentListItemsManager& getIDocumentListItems()const;const SwNodeNum* GetNum(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;SwNumberTree::tNumberVector GetNumberVector(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;
 bool IsInList()const;void AddToList();void RemoveFromList();bool HasNumber(const SwRootFrame* =nullptr)const;bool HasBullet()const;
 
 bool mbInSetOrResetAttr=false,mbEmptyListStyleSetDueToSetOutlineLevelAttr=false;std::unique_ptr<int> maFillAttributes;
 bool IsEmptyListStyleDueToSetOutlineLevelAttr()const{return mbEmptyListStyleSetDueToSetOutlineLevelAttr;}
 void SetCalcHiddenCharFlags(){}void ChkCondColl(){}void ChgTextCollUpdateNum(const SwTextFormatColl*,const SwTextFormatColl*,bool);
 SwFormatColl* ChgFormatColl(SwFormatColl*,bool=true);void SetEmptyListStyleDueToSetOutlineLevelAttr();void ResetEmptyListStyleDueToResetOutlineLevelAttr();void SetAttrOutlineLevel(int);void SetAttrListLevel(int);
 int GetAttrOutlineLevel()const{return GetAttr(RES_PARATR_OUTLINELEVEL).GetValue();}
 void SetAttr(const SfxPoolItem&);void ResetAttr(int);
 void AddToListOrig(){}void AddToListRLHidden(){}void RemoveFromListOrig(){}void RemoveFromListRLHidden(){}void SetWordCountDirty(bool){}
};
class SwNumberTreeNode;
struct Compare {bool operator()(const SwNumberTreeNode*,const SwNumberTreeNode*)const;};
struct Children:std::set<SwNumberTreeNode*,Compare>{using std::set<SwNumberTreeNode*,Compare>::insert;void insert(const Children& nodes){insert(nodes.begin(),nodes.end());}};
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
 virtual void PreAdd(){}bool IsNotificationEnabled(const SwDoc&)const{return true;}bool IsValid()const;bool IsValid(const SwNumberTreeNode*)const;void Validate(const SwNumberTreeNode*)const;void ValidateContinuous(const SwNumberTreeNode*)const{}
 void InvalidateMe();void Invalidate(const SwNumberTreeNode*);void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}
 virtual void PostRemove(){}void RemoveChild(SwNumberTreeNode*,const SwDoc&);void RemoveMe(const SwDoc&);void MoveChildren(SwNumberTreeNode*);bool HasOnlyPhantoms()const;void SetLevelInListTree(int,const SwDoc&);bool IsContinuous()const{return false;}void InvalidateTree()const;void InvalidateChildren(){SetLastValid(mChildren.end());}
 SwNumberTreeNode* GetParent()const{return mpParent;}int GetChildCount()const{return mChildren.size();}
 int GetLevelInListTree()const;
 auto GetIterator(const SwNumberTreeNode* p)const{return mChildren.find(const_cast<SwNumberTreeNode*>(p));}
 // Number getters are eager reads; complete prefix groups are validated in order by the harness.
 long GetNumber(bool=true)const;SwNumberTree::tNumberVector GetNumberVector()const;
 void SetLastValid(const Children::const_iterator&,bool=false)const;
 void ValidateHierarchical(const SwNumberTreeNode*)const;
 void GetNumberVector_(SwNumberTree::tNumberVector&,bool=true)const;
};
struct SwNodes;struct SwPosition;
class SwNodeNum:public SwNumberTreeNode {
 SwTextNode* text;SwNumRule* rule;
public:
 bool m_isHiddenRedlines=false;SwNumRule* mpNumRule;SwTextNode* mpTextNode;SwNodes* ownerNodes=nullptr;SwPosition GetPosition()const;
 SwNodeNum(SwTextNode* n,SwNumRule* r):text(n),rule(r),mpNumRule(r),mpTextNode(n){}
 SwNodeNum(SwNumRule* r):SwNodeNum(nullptr,r){}
 SwNodeNum(SwTextNode* n,bool):SwNodeNum(n,static_cast<SwNumRule*>(nullptr)){ownerNodes=n->nodes;}void PreAdd()override;void PostRemove()override;void ChangeNumRule(SwNumRule&);
 bool IsCountPhantoms()const override;bool LessThan(const SwNumberTreeNode&)const override;SwNumberTreeNode* Create()const override;
 SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return mpNumRule;}
 bool IsCounted()const override;bool IsRestart()const override;long GetStartValue()const override;
 bool HasCountedChildren()const override;bool IsCountedForNumbering()const override;
};
bool Compare::operator()(const SwNumberTreeNode* a,const SwNumberTreeNode* b)const{return a->LessThan(*b);}
void SwNumberTreeNode::ValidateHierarchical(const SwNumberTreeNode * pNode) const
{
    tSwNumberTreeChildren::const_iterator aValidateIt =
        GetIterator(pNode);

    if (aValidateIt == mChildren.end())
        return;

    OSL_ENSURE((*aValidateIt)->mpParent == this, "wrong parent");

    auto aIt = mpLastValid == nullptr ? mChildren.end() : mChildren.find(mpLastValid);

    // -->
    // improvement:
    // - Only one time checked for <mChildren.end()>.
    // - Less checks for each loop run.
    // correction:
    // - consider case that current node isn't counted and isn't the first
    // child of its parent. In this case the number of last counted child
    // of the previous node determines the start value for the following
    // children loop, if all children have to be validated and the first
    // one doesn't restart the counting.
    SwNumberTree::tSwNumTreeNumber nTmpNumber( 0 );
    if (aIt != mChildren.end())
        nTmpNumber = (*aIt)->mnNumber;
    else
    {
        aIt = mChildren.begin();
        (*aIt)->mbContinueingPreviousSubTree = false;

        // determine default start value
        // consider the case that the first child isn't counted.
        nTmpNumber = (*aIt)->GetStartValue();
        if ( !(*aIt)->IsCounted() &&
             ( !(*aIt)->HasCountedChildren() || (*aIt)->IsPhantom() ) )
        {
            --nTmpNumber;
        }

        // determine special start value for the case that first child
        // doesn't restart the numbering and the parent node isn't counted
        // and isn't the first child.
        const bool bParentCounted( IsCounted() &&
                                   ( !IsPhantom() ||
                                     HasPhantomCountedParent() ) );
        if ( !(*aIt)->IsRestart() &&
             GetParent() && !bParentCounted )
        {
            tSwNumberTreeChildren::const_iterator aParentChildIt =
                                            GetParent()->GetIterator( this );
            while ( aParentChildIt != GetParent()->mChildren.begin() )
            {
                --aParentChildIt;
                SwNumberTreeNode* pPrevNode( *aParentChildIt );
                if ( pPrevNode->GetChildCount() > 0 )
                {
                    (*aIt)->mbContinueingPreviousSubTree = true;
                    nTmpNumber = (*(pPrevNode->mChildren.rbegin()))->GetNumber();
                    if ( (*aIt)->IsCounted() &&
                         ( !(*aIt)->IsPhantom() ||
                           (*aIt)->HasPhantomCountedParent() ) )
                    {
                        ++nTmpNumber;
                    }
                    break;
                }
                else if ( pPrevNode->IsCounted() )
                {
                    break;
                }
                else
                {
                    // Previous node has no children and is not counted.
                    // Thus, next turn and check for the previous node.
                }
            }
        }

        (*aIt)->mnNumber = nTmpNumber;
    }

    while (aIt != aValidateIt)
    {
        ++aIt;
        (*aIt)->mbContinueingPreviousSubTree = false;

        // --> only for counted nodes the number
        // has to be adjusted, compared to the previous node.
        // this condition is hold also for nodes, which restart the numbering.
        if ( (*aIt)->IsCounted() )
        {
            if ((*aIt)->IsRestart())
                nTmpNumber = (*aIt)->GetStartValue();
            else
                ++nTmpNumber;
        }

        (*aIt)->mnNumber = nTmpNumber;
    }

    SetLastValid(aIt, true);
}

void SwNumberTreeNode::GetNumberVector_(SwNumberTree::tNumberVector & rVector,
                                        bool bValidate) const
{
    if (mpParent)
    {
        mpParent->GetNumberVector_(rVector, bValidate);
        rVector.push_back(GetNumber(bValidate));
    }
}

bool SwNumberTreeNode::IsCounted() const
{
    return !IsPhantom() ||
            ( IsCountPhantoms() && HasCountedChildren() );
}

int SwNumberTreeNode::GetLevelInListTree() const
{
    if (mpParent)
        return mpParent->GetLevelInListTree() + 1;

    return -1;
}

SwNumberTreeNode * SwNumberTreeNode::CreatePhantom()
{
    SwNumberTreeNode * pNew = nullptr;

    if (! mChildren.empty() &&
        (*mChildren.begin())->IsPhantom())
    {
        OSL_FAIL("phantom already present");
    }
    else
    {
        pNew = Create();
        pNew->mbPhantom = true;
        pNew->mpParent = this;

        auto aInsert = mChildren.insert(pNew);

        if (! aInsert.second)
        {
            OSL_FAIL("insert of phantom failed!");

            delete pNew;
            pNew = nullptr;
        }
    }

    return pNew;
}

SwNumberTreeNode * SwNumberTreeNode::GetRoot() const
{
    SwNumberTreeNode * pResult = mpParent;

    if (pResult)
        while (pResult->mpParent)
            pResult = pResult->mpParent;

    return pResult;
}

void SwNumberTreeNode::ClearObsoletePhantoms()
{
    auto aIt = mChildren.begin();

    if (!(aIt != mChildren.end() && (*aIt)->IsPhantom()))
        return;

    (*aIt)->ClearObsoletePhantoms();

    if ((*aIt)->mChildren.empty())
    {
        // #i60652#
        // Because <mChildren.erase(aIt)> could destroy the element, which
        // is referenced by <mpLastValid>, it's needed to adjust
        // <mpLastValid> before erasing <aIt>.
        SetLastValid(mChildren.end());

        delete *aIt;
        mChildren.erase(aIt);
    }
}

SwNumberTreeNode * SwNumberTreeNode::GetFirstNonPhantomChild()
{
    if (IsPhantom())
        return (*mChildren.begin())->GetFirstNonPhantomChild();

    return this;
}

void SwNumberTreeNode::MoveGreaterChildren( SwNumberTreeNode& _rCompareNode,
                                            SwNumberTreeNode& _rDestNode )
{
    if ( mChildren.empty() )
        return;

    // determine first child, which has to move to <_rDestNode>
    auto aItUpper( mChildren.end() );
    if ((*mChildren.begin())->IsPhantom() &&
        _rCompareNode.LessThan(*(*mChildren.begin())->GetFirstNonPhantomChild()))
    {
        aItUpper = mChildren.begin();
    }
    else
    {
        aItUpper = mChildren.upper_bound(&_rCompareNode);
    }

    // move children
    if (aItUpper != mChildren.end())
    {
        // #i60652#
        // Adjust <mpLastValid> before modifying mChildren, because
        // erase/extract could destroy the element it references.
        SetLastValid( mChildren.end() );

        for (auto aIt = aItUpper; aIt != mChildren.end(); )
        {
            (*aIt)->mpParent = &_rDestNode;
            _rDestNode.mChildren.insert(*aIt);
            aIt = mChildren.erase(aIt);
        }

        // #i60652#
        if ( !mChildren.empty() )
        {
            SetLastValid( --(mChildren.end()) );
        }
    }

#ifdef DBG_UTIL
    IsSane(false);
    _rDestNode.IsSane(true);
#endif
}

void SwNumberTreeNode::AddChild(SwNumberTreeNode* pChild,
                                const int nDepth,
                                const SwDoc& rDoc)
{
    /*
       Algorithm:

       Search first child A that is greater than pChild,
         A may be the end of children.
       If nDepth > 0 then
       {
          if A is first child then
            create new phantom child B at beginning of child list
          else
            B is A

          Add child to B with depth nDepth - 1.
       }
       else
       {
         Insert pNode before A.

         if A has predecessor B then
           remove children of B that are greater as A and insert them as
             children of A.
       }

*/

    if ( nDepth < 0 )
    {
        OSL_FAIL( "<SwNumberTreeNode::AddChild(..)> - parameter <nDepth> out of valid range. Serious defect." );
        return;
    }

    if ( pChild->GetParent() != nullptr || pChild->GetChildCount() > 0 )
    {
        OSL_FAIL("only orphans allowed.");
        return;
    }

    if (nDepth > 0)
    {
        auto aInsertDeepIt = mChildren.upper_bound(pChild);

        OSL_ENSURE(! (aInsertDeepIt != mChildren.end() &&
                  (*aInsertDeepIt)->IsPhantom()), " unexpected phantom");

        if (aInsertDeepIt == mChildren.begin())
        {
            SwNumberTreeNode * pNew = CreatePhantom();

            SetLastValid(mChildren.end());

            if (pNew)
                pNew->AddChild(pChild, nDepth - 1, rDoc);
        }
        else
        {
            --aInsertDeepIt;
            (*aInsertDeepIt)->AddChild(pChild, nDepth - 1, rDoc);
        }

    }
    else
    {
        pChild->PreAdd();
        auto aResult = mChildren.insert(pChild);

        if (aResult.second)
        {
            pChild->mpParent = this;
            bool bNotification = pChild->IsNotificationEnabled(rDoc);
            auto aInsertedIt = aResult.first;

            if (aInsertedIt != mChildren.begin())
            {
                auto aPredIt = aInsertedIt;
                --aPredIt;

                // -->
                // Move greater children of previous node to new child.
                // This has to be done recursively on the children levels.
                // Initialize loop variables <pPrevChildNode> and <pDestNode>
                // for loop on children levels.
                SwNumberTreeNode* pPrevChildNode( *aPredIt );
                SwNumberTreeNode* pDestNode( pChild );
                while ( pDestNode && pPrevChildNode &&
                        pPrevChildNode->GetChildCount() > 0 )
                {
                    // move children
                    pPrevChildNode->MoveGreaterChildren( *pChild, *pDestNode );

                    // prepare next loop:
                    // - search of last child of <pPrevChildNode
                    // - If found, determine destination node
                    if ( pPrevChildNode->GetChildCount() > 0 )
                    {
                        auto aIt = pPrevChildNode->mChildren.rbegin();
                        pPrevChildNode = *aIt;
                        // determine new destination node
                        if ( pDestNode->GetChildCount() > 0 )
                        {
                            pDestNode = *(pDestNode->mChildren.begin());
                            if ( !pDestNode->IsPhantom() )
                            {
                                pDestNode = pDestNode->mpParent->CreatePhantom();
                            }
                        }
                        else
                        {
                            pDestNode = pDestNode->CreatePhantom();
                        }
                    }
                    else
                    {
                        // ready -> break loop.
                        break;
                    }
                }
                // assure that unnecessary created phantoms at <pChild> are deleted.
                pChild->ClearObsoletePhantoms();

                if ((*aPredIt)->IsValid())
                    SetLastValid(aPredIt);
            }
            else
                SetLastValid(mChildren.end());

            ClearObsoletePhantoms();

            if( bNotification )
            {
                // invalidation of not counted parent
                // and notification of its siblings.
                if ( !IsCounted() )
                {
                    InvalidateMe();
                    NotifyInvalidSiblings(rDoc);
                }
                NotifyInvalidChildren(rDoc);
            }
        }
    }

#ifdef DBG_UTIL
    IsSane(false);
#endif
}

bool SwNumberTreeNode::HasPhantomCountedParent() const
{
    bool bRet( false );

    OSL_ENSURE( IsPhantom(),
            "<SwNumberTreeNode::HasPhantomCountedParent()> - wrong usage of method - it's only for phantoms" );
    if ( IsPhantom() && mpParent )
    {
        if ( mpParent == GetRoot() )
        {
            bRet = true;
        }
        else if ( !mpParent->IsPhantom() )
        {
            bRet = mpParent->IsCounted();
        }
        else
        {
            bRet = mpParent->IsCounted() && mpParent->HasPhantomCountedParent();
        }
    }

    return bRet;
}

void SwNumberTreeNode::RemoveChild(SwNumberTreeNode* pChild, const SwDoc& rDoc)
{
    /*
       Algorithm:

       if pChild has predecessor A then
         B is A
       else
         create phantom child B at beginning of child list

       Move children of pChild to B.
    */

    if (pChild->IsPhantom())
    {
        OSL_FAIL("not applicable to phantoms!");

        return;
    }

    tSwNumberTreeChildren::const_iterator aRemoveIt = GetIterator(pChild);

    if (aRemoveIt != mChildren.end())
    {
        SwNumberTreeNode * pRemove = *aRemoveIt;

        pRemove->mpParent = nullptr;

        tSwNumberTreeChildren::const_iterator aItPred = mChildren.end();

        if (aRemoveIt == mChildren.begin())
        {
            if (! pRemove->mChildren.empty())
            {
                CreatePhantom();
                aRemoveIt = GetIterator(pChild);
                aItPred = mChildren.begin();
            }
        }
        else
        {
            aItPred = aRemoveIt;
            --aItPred;
        }

        if (! pRemove->mChildren.empty())
        {
            pRemove->MoveChildren(*aItPred);
            (*aItPred)->InvalidateTree();
            (*aItPred)->NotifyInvalidChildren(rDoc);
        }

        // #i60652#
        // Because <mChildren.erase(aRemoveIt)> could destroy the element,
        // which is referenced by <mpLastValid>, it's needed to adjust
        // <mpLastValid> before erasing <aRemoveIt>.
        if (aItPred != mChildren.end() && (*aItPred)->IsPhantom())
            SetLastValid(mChildren.end());
        else
            SetLastValid(aItPred);

        mChildren.erase(aRemoveIt);

        NotifyInvalidChildren(rDoc);
    }
    else
    {
        OSL_FAIL("RemoveChild: failed!");
    }

    pChild->PostRemove();
}

void SwNumberTreeNode::RemoveMe(const SwDoc& rDoc)
{
    if (!mpParent)
        return;

    SwNumberTreeNode * pSavedParent = mpParent;

    pSavedParent->RemoveChild(this, rDoc);

    while (pSavedParent && pSavedParent->IsPhantom() &&
           pSavedParent->HasOnlyPhantoms())
        pSavedParent = pSavedParent->GetParent();

    if (pSavedParent)
        pSavedParent->ClearObsoletePhantoms();

#ifdef DBG_UTIL
    IsSane(false);
#endif
}

void SwNumberTreeNode::MoveChildren(SwNumberTreeNode * pDest)
{
    if (! mChildren.empty())
    {
        auto aItBegin = mChildren.begin();
        SwNumberTreeNode * pMyFirst = *mChildren.begin();

        // #i60652#
        // Because <mChildren.erase(aItBegin)> could destroy the element,
        // which is referenced by <mpLastValid>, it's needed to adjust
        // <mpLastValid> before erasing <aItBegin>.
        SetLastValid(mChildren.end());

        if (pMyFirst->IsPhantom())
        {
            SwNumberTreeNode * pDestLast = nullptr;

            if (pDest->mChildren.empty())
                pDestLast = pDest->CreatePhantom();
            else
                pDestLast = *pDest->mChildren.rbegin();

            pMyFirst->MoveChildren(pDestLast);

            delete pMyFirst;
            mChildren.erase(aItBegin);

            aItBegin = mChildren.begin();
        }

        for (auto& rpChild : mChildren)
            rpChild->mpParent = pDest;

        pDest->mChildren.insert(mChildren);
        mChildren.clear();
        mpLastValid = nullptr;
    }

    OSL_ENSURE(mChildren.empty(), "MoveChildren failed!");

#ifdef DBG_UTIL
    IsSane(false);
    pDest->IsSane(false);
#endif
}

bool SwNumberTreeNode::HasOnlyPhantoms() const
{
    bool bResult = false;

    if (GetChildCount() == 1)
    {
        tSwNumberTreeChildren::const_iterator aIt = mChildren.begin();

        bResult = (*aIt)->IsPhantom() && (*aIt)->HasOnlyPhantoms();
    }
    else if (GetChildCount() == 0)
        bResult = true;

    return bResult;
}

void SwNumberTreeNode::SetLevelInListTree(const int nLevel, const SwDoc& rDoc)
{
    if ( nLevel < 0 )
    {
        OSL_FAIL( "<SwNumberTreeNode::SetLevelInListTree(..)> - parameter <nLevel> out of valid range. Serious defect." );
        return;
    }

    OSL_ENSURE( GetParent(),
            "<SwNumberTreeNode::SetLevelInListTree(..)> - can only be called for number tree nodes in a list tree" );
    if ( GetParent() )
    {
        if ( nLevel != GetLevelInListTree() )
        {
            SwNumberTreeNode* pRootTreeNode = GetRoot();
            OSL_ENSURE( pRootTreeNode,
                    "<SwNumberTreeNode::SetLevelInListTree(..)> - no root tree node found. Serious defect." );

            RemoveMe(rDoc);
            pRootTreeNode->AddChild(this, nLevel, rDoc);
        }
    }
}

bool SwNumberTreeNode::IsValid() const
{
    return mpParent && mpParent->IsValid(this);
}

bool SwNumberTreeNode::IsValid(const SwNumberTreeNode * pChild) const
{
  bool bResult = false;

  if (mpLastValid)
  {
      if (pChild && pChild->mpParent == this)
      {
          auto tmpIt = mChildren.find(mpLastValid);
          bResult = ! (*tmpIt)->LessThan(*pChild);
      }
  }

  return bResult;
}

void SwNumberTreeNode::Validate(const SwNumberTreeNode * pNode) const
{
    if (! IsValid(pNode))
    {
        if (IsContinuous())
            ValidateContinuous(pNode);
        else
            ValidateHierarchical(pNode);
    }
}

SwNumberTree::tSwNumTreeNumber SwNumberTreeNode::GetNumber(bool bValidate)
    const
{
    if (bValidate && mpParent)
        mpParent->Validate(this);

    return mnNumber;
}

SwNumberTree::tNumberVector SwNumberTreeNode::GetNumberVector() const
{
    vector<SwNumberTree::tSwNumTreeNumber> aResult;

    GetNumberVector_(aResult);

    return aResult;
}

void SwNumberTreeNode::SetLastValid
                    ( const SwNumberTreeNode::tSwNumberTreeChildren::const_iterator& aItValid,
                      bool bValidating ) const
{
    OSL_ENSURE( (aItValid == mChildren.end() || GetIterator(*aItValid) != mChildren.end()),
            "last-valid iterator");

    if (
        bValidating ||
        aItValid == mChildren.end() ||
         (mpLastValid &&
          (*aItValid)->LessThan(**mChildren.find(mpLastValid)))
        )
    {
        mpLastValid = aItValid == mChildren.end() ? nullptr : *aItValid;
        // invalidation of children of next not counted is needed
        if ( GetParent() )
        {
            tSwNumberTreeChildren::const_iterator aParentChildIt =
                                            GetParent()->GetIterator( this );
            ++aParentChildIt;
            if ( aParentChildIt != GetParent()->mChildren.end() )
            {
                SwNumberTreeNode* pNextNode( *aParentChildIt );
                if ( !pNextNode->IsCounted() )
                {
                    pNextNode->InvalidateChildren();
                }
            }
        }
    }

    if (IsContinuous())
    {
        tSwNumberTreeChildren::const_iterator aIt;

        if (mpLastValid)
            aIt = ++mChildren.find(mpLastValid);
        else
            aIt = mChildren.begin();

        while (aIt != mChildren.end())
        {
            (*aIt)->InvalidateTree();

            ++aIt;
        }

        if (mpParent)
        {
            mpParent->SetLastValid(mpParent->GetIterator(this), bValidating);
        }
    }
}

void SwNumberTreeNode::InvalidateTree() const
{
    // do not call SetInvalid, would cause loop !!!
    mpLastValid = nullptr;

    for (const auto& rpChild : mChildren)
        rpChild->InvalidateTree();
}

void SwNumberTreeNode::Invalidate(SwNumberTreeNode const * pChild)
{
    if (pChild->IsValid())
    {
        tSwNumberTreeChildren::const_iterator aIt = GetIterator(pChild);

        if (aIt != mChildren.begin())
            --aIt;
        else
            aIt = mChildren.end();

        SetLastValid(aIt);

    }
}

void SwNumberTreeNode::InvalidateMe()
{
    if (mpParent)
        mpParent->Invalidate(this);
}

bool SwNodeNum::IsCounted() const
{
    bool aResult = false;

    if ( GetTextNode() )
    {
        // #i59559#
        // <SwTextNode::IsCounted()> determines, if a text node is counted for numbering
        aResult = GetTextNode()->IsCountedInList();
    }
    else
        aResult = SwNumberTreeNode::IsCounted();

    return aResult;
}

bool SwNodeNum::HasCountedChildren() const
{
    return std::any_of(mChildren.begin(), mChildren.end(),
        [](SwNumberTreeNode* pNode) {
            SwNodeNum* pChild( dynamic_cast<SwNodeNum*>(pNode) );
            OSL_ENSURE( pChild, "<SwNodeNum::HasCountedChildren()> - unexpected type of child" );
            return pChild && (pChild->IsCountedForNumbering() || pChild->HasCountedChildren());
        });
}

bool SwNodeNum::IsCountedForNumbering() const
{
    return IsCounted() &&
           ( IsPhantom() ||                 // phantoms
             !GetTextNode() ||               // root node
             GetTextNode()->HasNumber() ||   // text node
             GetTextNode()->HasBullet() );   // text node
}

bool SwNodeNum::IsRestart() const
{
    bool bIsRestart = false;

    if ( GetTextNode() )
    {
        bIsRestart = GetTextNode()->IsListRestart();
    }

    return bIsRestart;
}

bool SwNodeNum::IsCountPhantoms() const
{
    bool bResult = true;

    // #i64311#
    // phantoms aren't counted in consecutive numbering rules
    if ( mpNumRule )
        bResult = !mpNumRule->IsContinusNum() &&
                  mpNumRule->IsCountPhantoms();
    else
    {
        OSL_FAIL( "<SwNodeNum::IsCountPhantoms(): missing numbering rule" );
    }

    return bResult;
}

bool SwNodeNum::LessThan(const SwNumberTreeNode & rNode) const
{
    bool bResult = false;
    const SwNodeNum & rTmpNode = static_cast<const SwNodeNum &>(rNode);

    if (mpTextNode == nullptr && rTmpNode.mpTextNode != nullptr)
        bResult = true;
    else if (mpTextNode != nullptr && rTmpNode.mpTextNode != nullptr)
    {
        // #i83479# - refactoring
        // simplify comparison by comparing the indexes of the text nodes
        bResult = ( mpTextNode->GetIndex() < rTmpNode.mpTextNode->GetIndex() );
    }

    return bResult;
}

SwNumberTreeNode * SwNodeNum::Create() const
{
    SwNodeNum * pResult = new SwNodeNum( GetNumRule() );

    return pResult;
}

SwNumberTree::tSwNumTreeNumber SwNodeNum::GetStartValue() const
{
    SwNumberTree::tSwNumTreeNumber aResult = 1;

    if ( IsRestart() && GetTextNode() )
    {
        aResult = GetTextNode()->GetActualListStartValue();
    }
    else
    {
        SwNumRule * pRule = GetNumRule();

        if (pRule)
        {
            int nLevel = GetParent() ? GetLevelInListTree() : 0;

            if (nLevel >= 0 && nLevel < MAXLEVEL)
            {
                const SwNumFormat * pFormat = pRule->GetNumFormat( o3tl::narrowing<sal_uInt16>(nLevel));

                if (pFormat)
                    aResult = pFormat->GetStart();
            }
        }
    }

    return aResult;
}

struct RangeNode {int GetIndex()const{return 0;}SwNodes* nodes;SwNodes& GetNodes()const{return *nodes;}};
struct SwPosition:SwRangePos {RangeNode node;int index;SwPosition(const SwPosition&)=default;SwPosition(SwNodes* n,int i):node{n},index(i){}const RangeNode& GetNode()const{return node;}bool operator<=(const SwPosition& other)const{return index<=other.index;}};
struct SwPaM {SwTextNode* node=nullptr;SwPaM(SwTextNode& n):node(&n),start(n.nodes,0),end(n.nodes,100000){}SwPosition start,end;SwPaM(SwNodes* n):start(n,0),end(n,100000){}auto StartEnd(){return std::pair{&start,&end};}};

class SwList {
 struct Tree {std::unique_ptr<SwNodeNum> pRoot,pRootRLHidden,pRootOrigText;std::unique_ptr<SwPaM> pSection;};
 std::vector<Tree> maListTrees;
public:
 SwList(SwNumRule* r,SwNodes* n){maListTrees.push_back({std::make_unique<SwNodeNum>(r),std::make_unique<SwNodeNum>(r),std::make_unique<SwNodeNum>(r),std::make_unique<SwPaM>(n)});}
 void InsertListItem(SwNodeNum&,SwListRedlineType,int,const SwDoc&);static void RemoveListItem(SwNodeNum&,const SwDoc&);void InvalidateListTree();void ValidateListTree(const SwDoc&);
};

SwPosition SwNodeNum::GetPosition()const{return SwPosition(ownerNodes,GetTextNode()->GetIndex());}
void SwList::InsertListItem(SwNodeNum& rNodeNum, SwListRedlineType const eRedline,
                            const int nLevel, const SwDoc& rDoc)
{
    const SwPosition aPosOfNodeNum( rNodeNum.GetPosition() );
    const SwNodes* pNodesOfNodeNum = &(aPosOfNodeNum.GetNode().GetNodes());

    for ( const auto& rNumberTree : maListTrees )
    {
        auto [pStart, pEnd] = rNumberTree.pSection->StartEnd(); // SwPosition*
        const SwNodes* pRangeNodes = &(pStart->GetNode().GetNodes());

        if ( pRangeNodes == pNodesOfNodeNum &&
             *pStart <= aPosOfNodeNum && aPosOfNodeNum <= *pEnd)
        {
            auto const& pRoot(SwListRedlineType::HIDDEN == eRedline
                    ? rNumberTree.pRootRLHidden
                    : SwListRedlineType::SHOW == eRedline
                            ? rNumberTree.pRoot
                            : rNumberTree.pRootOrigText);
            pRoot->AddChild(&rNodeNum, nLevel, rDoc);
            break;
        }
    }
}

void SwList::RemoveListItem(SwNodeNum& rNodeNum, const SwDoc& rDoc)
{
    rNodeNum.RemoveMe(rDoc);
}

void SwList::InvalidateListTree()
{
    for ( const auto& rNumberTree : maListTrees )
    {
        rNumberTree.pRoot->InvalidateTree();
        rNumberTree.pRootRLHidden->InvalidateTree();
        rNumberTree.pRootOrigText->InvalidateTree();
    }
}

void SwList::ValidateListTree(const SwDoc& rDoc)
{
    for ( auto& rNumberTree : maListTrees )
    {
        rNumberTree.pRoot->NotifyInvalidChildren(rDoc);
        rNumberTree.pRootRLHidden->NotifyInvalidChildren(rDoc);
        rNumberTree.pRootOrigText->NotifyInvalidChildren(rDoc);
    }
}

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
const SwNodeNum* SwTextNode::GetNum(SwRootFrame const*const pLayout, SwListRedlineType eRedline) const
{
    // invariant: it's only in list in Hide mode if it's in list in normal mode
    assert(mpNodeNum || !mpNodeNumRLHidden);
    return (pLayout && pLayout->IsHideRedlines()) || SwListRedlineType::HIDDEN == eRedline
            ? mpNodeNumRLHidden.get()
            : ( SwListRedlineType::ORIGTEXT == eRedline ? mpNodeNumOrig.get() : mpNodeNum.get() );
}

SwNumberTree::tNumberVector
SwTextNode::GetNumberVector(SwRootFrame const*const pLayout, SwListRedlineType eRedline) const
{
    if (SwNodeNum const*const pNum = GetNum(pLayout, eRedline))
    {
        return pNum->GetNumberVector();
    }
    else
    {
        SwNumberTree::tNumberVector aResult;
        return aResult;
    }
}

bool SwTextNode::IsInList() const
{
    return GetNum() != nullptr && GetNum()->GetParent() != nullptr;
}

static SwList * FindList(SwTextNode *const pNode)
{
    const OUString sListId = pNode->GetListId();
    if (!sListId.isEmpty())
    {
        auto & rIDLA(pNode->GetDoc().getIDocumentListsAccess());
        SwList* pList = rIDLA.getListByName( sListId );
        if ( pList == nullptr )
        {
            // Create corresponding list.
            SwNumRule* pNumRule = pNode->GetNumRule();
            if ( pNumRule )
            {
                pList = rIDLA.createList(sListId, pNode->GetNumRule()->GetName());
            }
        }
        OSL_ENSURE( pList != nullptr,
                "<SwTextNode::AddToList()> - no list for given list id. Serious defect" );
        return pList;
    }
    return nullptr;
}

void SwTextNode::AddToList()
{
    if ( IsInList() )
    {
        OSL_FAIL( "<SwTextNode::AddToList()> - the text node is already added to a list. Serious defect" );
        return;
    }

    SwList *const pList(FindList(this));
    if (!(pList && GetNodes().IsDocNodes())) // not for undo nodes
        return;

    assert(!mpNodeNum);
    mpNodeNum.reset(new SwNodeNum(this, false));
    pList->InsertListItem(*mpNodeNum, SwListRedlineType::SHOW, GetAttrListLevel(), GetDoc());

    // set redline lists
    // "default" list: visible items in Show Changes mode (tracked insertions and deletions)
    // "hidden" list: visible items in Hide Changes mode (tracked insertions, but not deletions)
    // "orig" list: visible items rejecting all changes (no tracked insertions and deletions)
    SwDocShell* pShell = GetDoc().GetDocShell();
    bool bRecordChanges = pShell && pShell->IsChangeRecording();
    if (!bRecordChanges || GetDoc().IsInXMLImport() || GetDoc().IsInWriterfilterImport() )
    {
        const SwRedlineTable& rRedTable = GetDoc().getIDocumentRedlineAccess().GetRedlineTable();
        SwRedlineTable::size_type nRedlPos = GetDoc().getIDocumentRedlineAccess().GetRedlinePos(*this, RedlineType::Insert);
        // paragraph start is not in a tracked insertion
        if ( SwRedlineTable::npos == nRedlPos || GetIndex() <= rRedTable[nRedlPos]->Start()->GetNode().GetIndex() )
        {
            AddToListOrig();

            // if the paragraph is not deleted, add to the "hidden" list, too
            SwRedlineTable::size_type nRedlPosDel = GetDoc().getIDocumentRedlineAccess().GetRedlinePos(*this, RedlineType::Delete);
            if ( SwRedlineTable::npos == nRedlPosDel )
                AddToListRLHidden();
            else
            {
                const SwNodeOffset nNdIdx = GetIndex();
                const SwRangeRedline* pTmp = rRedTable[nRedlPosDel];
                const SwPosition* pRStt = pTmp->Start();
                if (pRStt->GetNodeIndex() >= nNdIdx)
                {
                    // paragraph is partly deleted, add to the "hidden" list, too
                    AddToListRLHidden();
                }
            }
        }
        // inserted paragraph, e.g. during file load, add to the "hidden" list
        else if ( SwRedlineTable::npos != nRedlPos )
            AddToListRLHidden();
    }
    else if ( bRecordChanges )
        AddToListRLHidden();

    // iterate all frames & if there's one with hidden layout...
    SwIterator<SwTextFrame, SwTextNode, sw::IteratorMode::UnwrapMulti> iter(*this);
    for (SwTextFrame* pFrame = iter.First(); pFrame && !mpNodeNumRLHidden; pFrame = iter.Next())
    {
        if (pFrame->getRootFrame()->IsHideRedlines())
        {
            if (pFrame->GetTextNodeForParaProps() == this)
            {
                AddToListRLHidden();
            }
            break; // assume it's consistent, need to check only once
        }
    }
}

void SwTextNode::RemoveFromList()
{
    // sw_redlinehide: ensure it's removed from the other half too!
    RemoveFromListRLHidden();
    RemoveFromListOrig();
    if ( IsInList() )
    {
        SwList::RemoveListItem(*mpNodeNum, GetDoc());
        mpNodeNum.reset();

        SetWordCountDirty( true );
    }
}

bool SwTextNode::HasNumber(SwRootFrame const*const pLayout) const
{
    bool bResult = false;

    const SwNumRule *const pRule = GetNum(pLayout) ? GetNum(pLayout)->GetNumRule() : nullptr;
    if ( pRule )
    {
        const SwNumFormat& aFormat(pRule->Get(lcl_BoundListLevel(GetActualListLevel())));

        // #i40041#
        bResult = aFormat.IsEnumeration();
    }

    return bResult;
}

bool SwTextNode::HasBullet() const
{
    bool bResult = false;

    const SwNumRule* pRule = GetNum() ? GetNum()->GetNumRule() : nullptr;
    if ( pRule )
    {
        const SwNumFormat& aFormat(pRule->Get(lcl_BoundListLevel(GetActualListLevel())));

        bResult = aFormat.IsItemize();
    }

    return bResult;
}

void SwNodeNum::PreAdd()
{
    OSL_ENSURE( GetTextNode(),
            "<SwNodeNum::PreAdd()> - no text node set at <SwNodeNum> instance" );
    if ( !GetNumRule() && GetTextNode() )
    {
        mpNumRule = GetTextNode()->GetNumRule();
    }
    OSL_ENSURE( GetNumRule(),
            "<SwNodeNum::PreAdd()> - no list style set at <SwNodeNum> instance" );
    if (!m_isHiddenRedlines && GetNumRule() && GetTextNode())
    {
        GetNumRule()->AddTextNode( *(GetTextNode()) );
    }

    if (!m_isHiddenRedlines)
    {
        if ( GetTextNode() &&
             GetTextNode()->GetNodes().IsDocNodes() )
        {
            GetTextNode()->getIDocumentListItems().addListItem( *this );
        }
    }
}

void SwNodeNum::PostRemove()
{
    OSL_ENSURE( GetTextNode(),
            "<SwNodeNum::PostRemove()> - no text node set at <SwNodeNum> instance" );
    OSL_ENSURE( GetNumRule(),
            "<SwNodeNum::PostRemove()> - no list style set at <SwNodeNum> instance" );

    if (!m_isHiddenRedlines && GetTextNode())
    {
        GetTextNode()->getIDocumentListItems().removeListItem( *this );
    }

    if ( GetNumRule() )
    {
        if (!m_isHiddenRedlines && GetTextNode())
        {
            GetNumRule()->RemoveTextNode( *(GetTextNode()) );
        }
        mpNumRule = nullptr;
    }
}

void SwNodeNum::ChangeNumRule( SwNumRule& rNumRule )
{
    OSL_ENSURE( GetNumRule() && GetTextNode(),
            "<SwNodeNum::ChangeNumRule(..)> - missing list style and/or text node. Serious defect -> please inform OD." );
    if ( GetNumRule() && GetTextNode() )
    {
        GetNumRule()->RemoveTextNode( *(GetTextNode()) );
    }

    mpNumRule = &rNumRule;

    if ( GetNumRule() && GetTextNode() )
    {
        GetNumRule()->AddTextNode( *(GetTextNode()) );
    }
}

void SwNumRule::GetTextNodeList( SwNumRule::tTextNodeList& rTextNodeList ) const
{
    rTextNodeList = maTextNodeList;
}

SwNumRule::tTextNodeList::size_type SwNumRule::GetTextNodeListSize() const
{
    return maTextNodeList.size();
}

void SwNumRule::AddTextNode( SwTextNode& rTextNode )
{
    tTextNodeList::iterator aIter =
        std::find( maTextNodeList.begin(), maTextNodeList.end(), &rTextNode );

    if ( aIter == maTextNodeList.end() )
    {
        maTextNodeList.push_back( &rTextNode );
    }
}

void SwNumRule::RemoveTextNode( SwTextNode& rTextNode )
{
    tTextNodeList::iterator aIter =
        std::find( maTextNodeList.begin(), maTextNodeList.end(), &rTextNode );
    if ( aIter == maTextNodeList.end() )
        return;

    maTextNodeList.erase( aIter );

    // just incredibly slow to do this
    if (comphelper::IsFuzzing())
        return;

    // Just in case we remove a node after we have marked the rule invalid, but before we have validated the tree
    if (mbInvalidRuleFlag)
    {
        SwList* pList = rTextNode.GetDoc().getIDocumentListsAccess().getListByName( rTextNode.GetListId() );
        if (pList)
            pList->InvalidateListTree();
    }
}

void SwNumRule::Validate(const SwDoc& rDoc)
{
    o3tl::sorted_vector< SwList* > aLists;
    for ( const SwTextNode* pTextNode : maTextNodeList )
    {
        SwList* pList = pTextNode->GetDoc().getIDocumentListsAccess().getListByName( pTextNode->GetListId() );
        aLists.insert( pList );
    }

    for ( auto aList : aLists )
        aList->InvalidateListTree();

    for ( auto aList : aLists )
        aList->ValidateListTree(rDoc);

    mbInvalidRuleFlag = false;
}
namespace sw {
void DocumentListItemsManager::addListItem( const SwNodeNum& rNodeNum )
{
    if ( mpListItemsList == nullptr )
    {
        return;
    }

    const bool bAlreadyInserted(
            mpListItemsList->insert( &rNodeNum ).second );
    OSL_ENSURE( bAlreadyInserted,
            "<DocumentListItemsManager::addListItem(..)> - <SwNodeNum> instance already registered as numbered item!" );
}

void DocumentListItemsManager::removeListItem( const SwNodeNum& rNodeNum )
{
    if ( mpListItemsList == nullptr )
    {
        return;
    }

    const tImplSortedNodeNumList::size_type nDeleted = mpListItemsList->erase( &rNodeNum );
    if ( nDeleted > 1 )
    {
        OSL_FAIL( "<DocumentListItemsManager::removeListItem(..)> - <SwNodeNum> was registered more than once as numbered item!" );
    }
}

void DocumentListItemsManager::getNumItems( tSortedNodeNumList& orNodeNumList ) const
{
    orNodeNumList.clear();
    orNodeNumList.reserve( mpListItemsList->size() );

    for ( const SwNodeNum* pNodeNum : *mpListItemsList )
    {
        if ( pNodeNum->IsCounted() &&
             pNodeNum->GetTextNode() && pNodeNum->GetTextNode()->HasNumber() )
        {
            orNodeNumList.push_back( pNodeNum );
        }
    }
}
}
bool SwNodes::IsDocNodes() const
{
    return this == &m_rMyDoc.GetNodes();
}

SwNumRule* SwDoc::FindNumRulePtr(const UIName& name)const {auto it=lists->rules.find(name);return it==lists->rules.end()?nullptr:it->second;}
SwNumRule* SwDoc::GetOutlineNumRule()const{return FindNumRulePtr("Outline");}
OUString SwTextNode::GetListId()const{auto id=GetAttr(RES_PARATR_LIST_ID).GetValue();return !id.isEmpty()?id:GetNumRule()?GetNumRule()->GetName():UIName();}
long SwTextNode::GetActualListStartValue()const{if(IsListRestart()&&mpAttrSet&&mpAttrSet->items.count(86))return GetAttr(RES_PARATR_LIST_RESTARTVALUE,false).GetValue();return GetNumRule()?GetNumRule()->Get(GetAttrListLevel()).GetStart():1;}
void SwTextNode::SetAttr(const SfxPoolItem& item){bool detach=item.which==73||(item.which==83&&static_cast<const StringItem&>(item).GetValue()!=GetListId());if(detach)RemoveFromList();PutItem(item);if(detach)AddToList();else if(mpNodeNum){if(item.which==84)mpNodeNum->SetLevelInListTree(GetAttrListLevel(),GetDoc());else if(item.which>=85&&item.which<=87)GetDoc().lists->getListByName(GetListId())->InvalidateListTree();}}
void SwTextNode::ResetAttr(int id){bool detach=id==73||id==83;if(detach)RemoveFromList();EraseItem(id);if(detach)AddToList();else if(mpNodeNum){if(id==84)mpNodeNum->SetLevelInListTree(GetAttrListLevel(),GetDoc());else if(id>=85&&id<=87)GetDoc().lists->getListByName(GetListId())->InvalidateListTree();}}
void SwDoc::ResetAttrs(SwPaM& p,bool,const std::set<sal_uInt16>& attrs,bool){for(auto id:attrs)p.node->ResetAttr(id);}

namespace {
void HandleApplyTextNodeFormatChange(SwTextNode&,const UIName&,const UIName&,bool,bool);
void lcl_ResetParAttrs( SwTextNode &rTextNode )
    {
        const o3tl::sorted_vector<sal_uInt16> aAttrs{ RES_PARATR_LIST_ID, RES_PARATR_LIST_LEVEL,
                                                      RES_PARATR_LIST_ISRESTART,
                                                      RES_PARATR_LIST_RESTARTVALUE,
                                                      RES_PARATR_LIST_ISCOUNTED };
        SwPaM aPam( rTextNode );
        // #i96644#
        // suppress side effect "send data changed events"
        rTextNode.GetDoc().ResetAttrs( aPam, false, aAttrs, false );
    }
void HandleModifyAtTextNodeFormatChange( SwTextNode& rTextNode )
    {
        bool bNumRuleSet = false;
        bool bParagraphStyleChanged = true;
        UIName sNumRule;
        UIName sOldNumRule;
        if( rTextNode.GetNodes().IsDocNodes() )
        {
            const SwNumRule* pFormerNumRuleAtTextNode =
                rTextNode.GetNum() ? rTextNode.GetNum()->GetNumRule() : nullptr;
            if ( pFormerNumRuleAtTextNode )
            {
                sOldNumRule = pFormerNumRuleAtTextNode->GetName();
            }
            if ( rTextNode.IsEmptyListStyleDueToSetOutlineLevelAttr() )
            {
                const SwNumRuleItem& rNumRuleItem = rTextNode.GetTextColl()->GetNumRule();
                if ( !rNumRuleItem.GetValue().isEmpty() )
                {
                    rTextNode.ResetEmptyListStyleDueToResetOutlineLevelAttr();
                }
            }
            const SwNumRule* pNumRuleAtTextNode = rTextNode.GetNumRule();
            if ( pNumRuleAtTextNode )
            {
                bNumRuleSet = true;
                sNumRule = pNumRuleAtTextNode->GetName();
            }
        }
        HandleApplyTextNodeFormatChange(rTextNode, sNumRule, sOldNumRule, bNumRuleSet, bParagraphStyleChanged);
    }
void HandleApplyTextNodeFormatChange( SwTextNode& rTextNode, const UIName& sNumRule, const UIName& sOldNumRule, bool bNumRuleSet, bool bParagraphStyleChanged )
    {
        if ( sNumRule != sOldNumRule )
        {
            if ( bNumRuleSet )
            {
                if (sNumRule.isEmpty())
                {
                    rTextNode.RemoveFromList();
                    if ( bParagraphStyleChanged )
                    {
                        lcl_ResetParAttrs(rTextNode);
                    }
                }
                else
                {
                    rTextNode.RemoveFromList();
                    // If new list style is the outline style, apply outline
                    // level as the list level.
                    if (sNumRule==SwNumRule::GetOutlineRuleName())
                    {
                        // #i70748#
                        OSL_ENSURE( rTextNode.GetTextColl()->IsAssignedToListLevelOfOutlineStyle(),
                                "<HandleModifyAtTextNode()> - text node with outline style, but its paragraph style is not assigned to outline style." );
                        const int nNewListLevel =
                            rTextNode.GetTextColl()->GetAssignedOutlineStyleLevel();
                        if ( 0 <= nNewListLevel && nNewListLevel < MAXLEVEL )
                        {
                            rTextNode.SetAttrListLevel( nNewListLevel );
                        }
                    }
                    rTextNode.AddToList();
                }
            }
            else // <sNumRule.Len() == 0 && sOldNumRule.Len() != 0>
            {
                rTextNode.RemoveFromList();
                if ( bParagraphStyleChanged )
                {
                    lcl_ResetParAttrs(rTextNode);
                    // #i70748#
                    if ( rTextNode.GetAttr( RES_PARATR_OUTLINELEVEL, false ).GetValue() > 0 )
                    {
                        rTextNode.SetEmptyListStyleDueToSetOutlineLevelAttr();
                    }
                }
            }
        }
        else if (!sNumRule.isEmpty() && !rTextNode.IsInList())
        {
            rTextNode.AddToList();
        }
    }
}
SwNumRule* SwTextNode::GetNumRule(bool bInParent) const
{
    SwNumRule* pRet = nullptr;

    const SfxPoolItem* pItem = GetNoCondAttr( RES_PARATR_NUMRULE, bInParent );
    bool bNoNumRule = false;
    if ( pItem )
    {
        UIName sNumRuleName =
            static_cast<const SwNumRuleItem *>(pItem)->GetValue();
        if (!sNumRuleName.isEmpty())
        {
            pRet = GetDoc().FindNumRulePtr( sNumRuleName );
        }
        else // numbering is turned off
            bNoNumRule = true;
    }

    if ( !bNoNumRule )
    {
        if ( pRet && pRet == GetDoc().GetOutlineNumRule() &&
             ( !HasSwAttrSet() ||
               SfxItemState::SET !=
                GetpSwAttrSet()->GetItemState( RES_PARATR_NUMRULE, false ) ) )
        {
            SwTextFormatColl* pColl = GetTextColl();
            if ( pColl )
            {
                const SwNumRuleItem& rDirectItem = pColl->GetNumRule( false );
                if ( rDirectItem.GetValue().isEmpty() )
                {
                    pRet = nullptr;
                }
            }
        }
    }

    return pRet;
}
SwFormatColl* SwTextNode::ChgFormatColl( SwFormatColl *pNewColl, bool bSetListLevel )
{
    OSL_ENSURE( pNewColl,"ChgFormatColl: Collectionpointer has value 0." );
    assert( dynamic_cast<const SwTextFormatColl *>(pNewColl) && "ChgFormatColl: is not a Text Collection pointer." );

    SwTextFormatColl *pOldColl = GetTextColl();
    if( pNewColl != pOldColl )
    {
        SetCalcHiddenCharFlags();
        SwContentNode::ChgFormatColl( pNewColl );
        OSL_ENSURE( !mbInSetOrResetAttr,
                "DEBUG OSL_ENSURE(ON - <SwTextNode::ChgFormatColl(..)> called during <Set/ResetAttr(..)>" );
        if ( !mbInSetOrResetAttr )
        {
            HandleModifyAtTextNodeFormatChange( *this  );
        }

        // reset fill information on parent style change
        if(maFillAttributes)
        {
            maFillAttributes.reset();
        }
    }

    // only for real nodes-array
    if( GetNodes().IsDocNodes() )
    {
        ChgTextCollUpdateNum( pOldColl, static_cast<SwTextFormatColl *>(pNewColl), bSetListLevel );
    }

    return pOldColl;
}
void SwTextNode::ChgTextCollUpdateNum(const SwTextFormatColl* pOldColl,
                                      const SwTextFormatColl* pNewColl,
                                      bool bSetListLevel)
{
    SwDoc& rDoc = GetDoc();
    // query the OutlineLevel and if it changed, notify the Nodes-Array!
    const int nOldLevel = pOldColl && pOldColl->IsAssignedToListLevelOfOutlineStyle()
                              ? pOldColl->GetAssignedOutlineStyleLevel()
                              : MAXLEVEL;
    const int nNewLevel = pNewColl && pNewColl->IsAssignedToListLevelOfOutlineStyle() ?
                     pNewColl->GetAssignedOutlineStyleLevel() : MAXLEVEL;

    if ( MAXLEVEL != nNewLevel && -1 != nNewLevel && bSetListLevel )
    {
        SetAttrListLevel(nNewLevel);
    }
    rDoc.GetNodes().UpdateOutlineNode(*this);

    SwNodes& rNds = GetNodes();
    // If Level 0 (Chapter), update the footnotes!
    if( ( !nNewLevel || !nOldLevel) && !rDoc.GetFootnoteIdxs().empty() &&
        FTNNUM_CHAPTER == rDoc.GetFootnoteInfo().m_eNum &&
        rNds.IsDocNodes() )
    {
        rDoc.GetFootnoteIdxs().UpdateFootnote( *rNds[GetIndex()] );
    }

    if( pNewColl && RES_CONDTXTFMTCOLL == pNewColl->Which() )
    {
        // check the condition of the text node again
        ChkCondColl();
    }
}
void SwTextNode::SetEmptyListStyleDueToSetOutlineLevelAttr()
{
    if ( !mbEmptyListStyleSetDueToSetOutlineLevelAttr )
    {
        SetAttr( SwNumRuleItem() );
        mbEmptyListStyleSetDueToSetOutlineLevelAttr = true;
    }
}
void SwTextNode::ResetEmptyListStyleDueToResetOutlineLevelAttr()
{
    if ( mbEmptyListStyleSetDueToSetOutlineLevelAttr )
    {
        ResetAttr( RES_PARATR_NUMRULE );
        mbEmptyListStyleSetDueToSetOutlineLevelAttr = false;
    }
}
void SwTextNode::SetAttrOutlineLevel(int nLevel)
{
    assert(0 <= nLevel && nLevel <= MAXLEVEL); // Level Out Of Range
    if ( 0 <= nLevel && nLevel <= MAXLEVEL )
    {
        SetAttr( SfxUInt16Item( RES_PARATR_OUTLINELEVEL,
                                o3tl::narrowing<sal_uInt16>(nLevel) ) );
    }
}
void SwTextNode::SetAttrListLevel( int nLevel )
{
    if ( nLevel < 0 || nLevel >= MAXLEVEL )
    {
        assert(false); // invalid level
        return;
    }

    SfxInt16Item aNewListLevelItem( RES_PARATR_LIST_LEVEL,
                                    static_cast<sal_Int16>(nLevel) );
    SetAttr( aNewListLevelItem );
}
void SwTextFormatColl::SetAttrOutlineLevel( int nLevel)
{
    OSL_ENSURE( 0 <= nLevel && nLevel <= MAXLEVEL ,"SwTextFormatColl: Level Out Of Range" );
    SetFormatAttr( SfxUInt16Item( RES_PARATR_OUTLINELEVEL,
                            o3tl::narrowing<sal_uInt16>(nLevel) ) );
}
int SwTextFormatColl::GetAttrOutlineLevel() const
{
    return GetFormatAttr(RES_PARATR_OUTLINELEVEL).GetValue();
}
int SwTextFormatColl::GetAssignedOutlineStyleLevel() const
{
    OSL_ENSURE( IsAssignedToListLevelOfOutlineStyle(),
        "<SwTextFormatColl::GetAssignedOutlineStyleLevel()> - misuse of method");
    return GetAttrOutlineLevel() - 1;
}
void SwTextFormatColl::AssignToListLevelOfOutlineStyle(const int nAssignedListLevel)
{
    mbAssignedToOutlineStyle = true;
    SetAttrOutlineLevel(nAssignedListLevel+1);

    // #i100277#
    SwIterator<SwTextFormatColl,SwFormatColl> aIter( *this );
    SwTextFormatColl* pDerivedTextFormatColl = aIter.First();
    while ( pDerivedTextFormatColl != nullptr )
    {
        if ( !pDerivedTextFormatColl->IsAssignedToListLevelOfOutlineStyle() )
        {
            if ( pDerivedTextFormatColl->GetItemState( RES_PARATR_NUMRULE, false ) == SfxItemState::DEFAULT )
            {
                SwNumRuleItem aItem;
                pDerivedTextFormatColl->SetFormatAttr( aItem );
            }
            if ( pDerivedTextFormatColl->GetItemState( RES_PARATR_OUTLINELEVEL, false ) == SfxItemState::DEFAULT )
            {
                pDerivedTextFormatColl->SetAttrOutlineLevel( 0 );
            }
        }

        pDerivedTextFormatColl = aIter.Next();
    }
}
void SwTextFormatColl::DeleteAssignmentToListLevelOfOutlineStyle()
{
    mbAssignedToOutlineStyle = false;
    ResetFormatAttr(RES_PARATR_OUTLINELEVEL);
}
UIName SwNumRule::GetOutlineRuleName()
{
    return UIName(u"Outline"_ustr);
}
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
