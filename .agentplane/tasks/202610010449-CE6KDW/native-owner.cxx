
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
template<class A,class B,sw::IteratorMode C>struct SwIterator {SwIterator(B&){}A* First(){return nullptr;}A* Next(){return nullptr;}};
struct SwDoc {ListAccess* lists;sw::DocumentListItemsManager* items;SwNodes* nodes;ListAccess& getIDocumentListsAccess()const;sw::DocumentListItemsManager& getIDocumentListItems()const;SwNodes& GetNodes()const;SwDocShell* GetDocShell(){return nullptr;}bool IsInXMLImport()const{return false;}bool IsInWriterfilterImport()const{return false;}RedlineAccess& getIDocumentRedlineAccess(){static RedlineAccess access;return access;}};
namespace comphelper {bool IsFuzzing(){return false;}}
namespace o3tl {template<class T>using sorted_vector=std::set<T>;}

using std::vector;
#define OSL_ENSURE(condition,message) ((void)0)
namespace SwNumberTree {using tSwNumTreeNumber=long;using tNumberVector=std::vector<long>;}
constexpr int MAXLEVEL=10;

struct SwNumFormat {long start=1;bool bullet=false;long GetStart()const{return start;}bool IsEnumeration()const{return !bullet;}bool IsItemize()const{return bullet;}};
struct SwNumRule {using tTextNodeList=std::vector<SwTextNode*>;tTextNodeList maTextNodeList;bool mbInvalidRuleFlag=true;OUString name="Counters";SwNumFormat formats[10];bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}const SwNumFormat& Get(sal_uInt16 level)const{return formats[level];}const UIName& GetName()const{return name;}void GetTextNodeList(tTextNodeList&)const;std::size_t GetTextNodeListSize()const;void AddTextNode(SwTextNode&);void RemoveTextNode(SwTextNode&);void Validate(const SwDoc&);};
struct SwNodes {SwDoc* owner;SwDoc& m_rMyDoc;SwNodes(SwDoc* d):owner(d),m_rMyDoc(*d){}bool canonical=true;bool IsDocNodes()const;};
struct SwTextNode {
 int index=0;bool counted=true,restart=false;long actualStart=0;int level=0;bool canonical=true;SwDoc* doc;SwNodes* nodes;SwNumRule* rule;OUString listId="A";
 std::unique_ptr<SwNodeNum> mpNodeNum,mpNodeNumRLHidden,mpNodeNumOrig;
 int GetIndex()const{return index;}SwDoc& GetDoc()const{return *doc;}SwNodes& GetNodes()const{return *nodes;}OUString GetListId()const{return listId;}SwNumRule* GetNumRule()const{return rule;}int GetAttrListLevel()const{return level;}int GetActualListLevel()const;
 bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}
 sw::DocumentListItemsManager& getIDocumentListItems()const;const SwNodeNum* GetNum(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;SwNumberTree::tNumberVector GetNumberVector(const SwRootFrame* =nullptr,SwListRedlineType=SwListRedlineType::SHOW)const;
 bool IsInList()const;void AddToList();void RemoveFromList();bool HasNumber(const SwRootFrame* =nullptr)const;bool HasBullet()const;
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
struct SwPaM {SwPosition start,end;SwPaM(SwNodes* n):start(n,0),end(n,100000){}auto StartEnd(){return std::pair{&start,&end};}};

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
