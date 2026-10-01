#include <iostream>
#include <algorithm>
#include <cstdint>
using sal_uInt16=uint16_t;constexpr int MAXLEVEL=10,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_BITMAP=8;
// Named null-layout and bound-rule adapters: only format classification and attached/null record reads are compared.
namespace o3tl {template<typename T> T narrowing(int n){return static_cast<T>(n);}}
struct SwNumFormat {int type;int GetNumberingType()const{return type;}bool IsItemize()const;bool IsEnumeration()const;};
struct SwNumRule {SwNumFormat format;const SwNumFormat&Get(sal_uInt16)const{return format;}};
struct SwRootFrame {};struct Record {SwNumRule*rule;const SwNumRule*GetNumRule()const{return rule;}};
struct SwTextNode {Record*record;int level=0;Record*GetNum(const SwRootFrame* = nullptr)const{return record;}int GetActualListLevel()const{return level;}bool HasNumber(const SwRootFrame* = nullptr)const;bool HasBullet()const;};
bool SwNumFormat::IsItemize() const
{
    bool bResult;

    switch(GetNumberingType())
    {
    case SVX_NUM_CHAR_SPECIAL:
    case SVX_NUM_BITMAP:
        bResult = true;

        break;

    default:
        bResult = false;
    }

    return bResult;

}
bool SwNumFormat::IsEnumeration() const
{
    // #i30655# native numbering did not work any longer
    // using this code. Therefore HBRINKM and I agreed upon defining
    // IsEnumeration() as !IsItemize()
    return !IsItemize();
}
sal_uInt16 lcl_BoundListLevel(const int nActualLevel)
{
    return o3tl::narrowing<sal_uInt16>( std::clamp( nActualLevel, 0, MAXLEVEL-1 ) );
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
int main(){std::cout<<"[";bool first=true;for(int type:{4,5,6,8}){SwNumRule rule{{type}};Record record{&rule};SwTextNode node{&record};if(!first)std::cout<<",";first=false;std::cout<<"["<<type<<","<<(node.HasNumber()?"true":"false")<<","<<(node.HasBullet()?"true":"false")<<"]";}std::cout<<"]";}