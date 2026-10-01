#include <cstdint>
#include <iostream>
using sal_uInt16=uint16_t;using sal_Int16=int16_t;struct SfxItemPool{};
// NAMED BASE/WHICH/STORAGE-TYPE ADAPTERS ONLY: no full native pool lifetime.
struct SfxPoolItem{sal_uInt16 which;explicit SfxPoolItem(sal_uInt16 n):which(n){};virtual ~SfxPoolItem()=default;sal_uInt16 Which()const{return which;}};
class SfxInt16Item:public SfxPoolItem{sal_Int16 m_nValue;public:
explicit SfxInt16Item(sal_uInt16 which = 0, sal_Int16 nTheValue = 0):
        SfxPoolItem(which), m_nValue(nTheValue)
    {}
sal_Int16 GetValue() const { return m_nValue; }
SfxInt16Item* Clone(SfxItemPool* =nullptr)const;};
SfxInt16Item* SfxInt16Item::Clone(SfxItemPool *) const
{
    return new SfxInt16Item(*this);
}
constexpr sal_uInt16 RES_PARATR_LIST_RESTARTVALUE=86;constexpr int SFX_ITEMINFOFLAG_NONE=0;struct Entry{int which;SfxPoolItem* item;int slot,flags;};
int main(){Entry e={ RES_PARATR_LIST_RESTARTVALUE, new SfxInt16Item( RES_PARATR_LIST_RESTARTVALUE, 1 ), 0, SFX_ITEMINFOFLAG_NONE };auto* item=static_cast<SfxInt16Item*>(e.item);auto* copied=item->Clone();std::cout<<e.which<<" "<<item->GetValue()<<" "<<copied->GetValue()<<" "<<(copied!=item)<<"\n";delete copied;delete item;}
