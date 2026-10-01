
#include <cassert>
#include <memory>
#include <iostream>
using sal_uInt16=unsigned short;
#define OSL_ENSURE(condition,message) assert(condition)
constexpr int MAXLEVEL=10,RULE_END=2;
struct SvxNumberFormat {enum {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT};};
// NAMED MINIMAL FORMAT/BASE ADAPTERS: only accessor identity and self-equal Set control flow.
struct SwNumFormat{int start=1;bool operator!=(const SwNumFormat& other)const{return start!=other.start;}};
struct SwNumRule{std::unique_ptr<SwNumFormat> maFormats[MAXLEVEL];int meRuleType=0,meDefaultNumberFormatPositionAndSpaceMode=SvxNumberFormat::LABEL_ALIGNMENT;bool mbInvalidRuleFlag=true;
 static inline SwNumFormat base;static inline SwNumFormat* saBaseFormats[RULE_END][MAXLEVEL]={};static inline SwNumFormat* saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL]={};
 const SwNumFormat& Get(sal_uInt16)const;const SwNumFormat* GetNumFormat(sal_uInt16)const;void Set(sal_uInt16,const SwNumFormat&);};
const SwNumFormat& SwNumRule::Get( sal_uInt16 i ) const
{
    assert( i < MAXLEVEL && meRuleType < RULE_END );
    return maFormats[ i ]
           ? *maFormats[ i ]
           : ( meDefaultNumberFormatPositionAndSpaceMode == SvxNumberFormat::LABEL_WIDTH_AND_POSITION
               ? *saBaseFormats[ meRuleType ][ i ]
               : *saLabelAlignmentBaseFormats[ meRuleType ][ i ] );
}
const SwNumFormat* SwNumRule::GetNumFormat( sal_uInt16 i ) const
{
    const SwNumFormat * pResult = nullptr;

    assert( i < MAXLEVEL && meRuleType < RULE_END );
    if ( i < MAXLEVEL && meRuleType < RULE_END)
    {
        pResult = maFormats[ i ].get();
    }

    return pResult;
}
void SwNumRule::Set( sal_uInt16 i, const SwNumFormat& rNumFormat )
{
    OSL_ENSURE( i < MAXLEVEL, "Serious defect" );
    if( i < MAXLEVEL )
    {
        if( !maFormats[ i ] || (rNumFormat != Get( i )) )
        {
            maFormats[ i ].reset(new SwNumFormat( rNumFormat ));
            mbInvalidRuleFlag = true;
        }
    }
}
int main(){SwNumRule::saLabelAlignmentBaseFormats[0][0]=&SwNumRule::base;SwNumRule rule;std::cout<<"{\"freshRawPresent\":"<<(rule.GetNumFormat(0)?"true":"false")<<",\"effectiveIsSharedBase\":"<<(&rule.Get(0)==&SwNumRule::base?"true":"false");rule.Set(0,rule.Get(0));auto* first=rule.GetNumFormat(0);rule.mbInvalidRuleFlag=false;rule.Set(0,*first);std::cout<<",\"setCreatesOwnedClone\":"<<(first!=&SwNumRule::base?"true":"false")<<",\"equalSetRetainsIdentity\":"<<(rule.GetNumFormat(0)==first?"true":"false")<<",\"equalSetInvalidates\":"<<(rule.mbInvalidRuleFlag?"true":"false")<<"}\n";}
