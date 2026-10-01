
#include <vector>
#include <set>
#include <iterator>
#include <algorithm>
#include <iostream>
#include <memory>
#include <cstdint>
using sal_uInt16=uint16_t;
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
#define OSL_FAIL(message) ((void)0)
struct SwDoc {};
using std::vector;
#define OSL_ENSURE(condition,message) ((void)0)
namespace SwNumberTree {using tSwNumTreeNumber=long;using tNumberVector=std::vector<long>;}
constexpr int MAXLEVEL=10;
struct SwNumFormat {long start=1;long GetStart()const{return start;}};
struct SwNumRule {SwNumFormat formats[10];bool IsContinusNum()const{return false;}bool IsCountPhantoms()const{return true;}const SwNumFormat* GetNumFormat(sal_uInt16 level)const{return &formats[level];}};
struct SwTextNode {int index=0;int GetIndex()const{return index;}bool counted=true,restart=false;long actualStart=0;bool IsCountedInList()const{return counted;}bool IsListRestart()const{return restart;}long GetActualListStartValue()const{return actualStart;}bool HasNumber()const{return true;}bool HasBullet()const{return false;}};
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
 void PreAdd(){}bool IsNotificationEnabled(const SwDoc&)const{return true;}bool IsValid()const;bool IsValid(const SwNumberTreeNode*)const;void Validate(const SwNumberTreeNode*)const;void ValidateContinuous(const SwNumberTreeNode*)const{}
 void InvalidateMe();void Invalidate(const SwNumberTreeNode*);void NotifyInvalidSiblings(const SwDoc&){}void NotifyInvalidChildren(const SwDoc&){}
 void PostRemove(){}void RemoveChild(SwNumberTreeNode*,const SwDoc&);void RemoveMe(const SwDoc&);void MoveChildren(SwNumberTreeNode*);bool HasOnlyPhantoms()const;void SetLevelInListTree(int,const SwDoc&);bool IsContinuous()const{return false;}void InvalidateTree()const;void InvalidateChildren(){SetLastValid(mChildren.end());}
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
 SwNumRule* mpNumRule;SwTextNode* mpTextNode;SwNodes* ownerNodes=nullptr;SwPosition GetPosition()const;
 SwNodeNum(SwTextNode* n,SwNumRule* r):text(n),rule(r),mpNumRule(r),mpTextNode(n){}
 SwNodeNum(SwNumRule* r):SwNodeNum(nullptr,r){}
 bool IsCountPhantoms()const override;bool LessThan(const SwNumberTreeNode&)const override;SwNumberTreeNode* Create()const override;
 SwTextNode* GetTextNode()const{return text;}SwNumRule* GetNumRule()const{return rule;}
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
