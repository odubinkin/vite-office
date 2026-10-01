
#include <cassert>
#include <cstdint>
#include <iostream>
#include <typeinfo>
#include <memory>
using sal_uInt16=uint16_t;using sal_uInt8=uint8_t;struct SfxItemPool{};
namespace css::uno {struct Any {sal_uInt16 value;void operator<<=(sal_uInt16 v){value=v;}};}
struct SfxPoolItem {sal_uInt16 which;SfxPoolItem(sal_uInt16 w):which(w){}virtual ~SfxPoolItem()=default;sal_uInt16 Which()const{return which;}virtual bool operator==(const SfxPoolItem& b)const{return which==b.which&&typeid(*this)==typeid(b);}virtual SfxPoolItem* Clone(SfxItemPool* =nullptr)const=0;};
class CntUInt16Item:public SfxPoolItem {sal_uInt16 m_nValue;public:
CntUInt16Item(sal_uInt16 which, sal_uInt16 nTheValue):
        SfxPoolItem(which), m_nValue(nTheValue)
    {}
sal_uInt16 GetValue() const { return m_nValue; }
bool operator==(const SfxPoolItem&)const override;bool QueryValue(css::uno::Any&,sal_uInt8=0)const;CntUInt16Item* Clone(SfxItemPool* =nullptr)const override;};
class SfxUInt16Item:public CntUInt16Item {public:static SfxPoolItem* CreateDefault();
explicit SfxUInt16Item(sal_uInt16 which = 0, sal_uInt16 nValue = 0):
        CntUInt16Item(which, nValue) {}
virtual SfxUInt16Item* Clone(SfxItemPool * = nullptr) const override
    { return new SfxUInt16Item(*this); }
};
bool CntUInt16Item::operator ==(const SfxPoolItem & rItem) const
{
    assert(SfxPoolItem::operator==(rItem));
    return m_nValue == static_cast<const CntUInt16Item *>(&rItem)->m_nValue;
}
bool CntUInt16Item::QueryValue(css::uno::Any& rVal, sal_uInt8) const
{
    rVal <<= m_nValue;
    return true;
}
CntUInt16Item* CntUInt16Item::Clone(SfxItemPool *) const
{
    return new CntUInt16Item(*this);
}
SfxPoolItem* SfxUInt16Item::CreateDefault()
{
    return new SfxUInt16Item();
}
int main(){SfxUInt16Item d;std::cout<<d.Which()<<' '<<d.GetValue()<<'\n';
 for(auto value:{0,1,32768,65535}){CntUInt16Item b(80,value);SfxUInt16Item i(80,value);css::uno::Any a; i.QueryValue(a);std::unique_ptr<CntUInt16Item> c(b.Clone());std::unique_ptr<SfxUInt16Item> clone(i.Clone());std::cout<<i.Which()<<' '<<i.GetValue()<<' '<<a.value<<' '<<(*c==b)<<' '<<(*clone==i)<<' '<<(c.get()!=&b)<<' '<<(clone.get()!=&i)<<' '<<(typeid(*clone)==typeid(i))<<'\n';}
 std::unique_ptr<SfxPoolItem> factory(SfxUInt16Item::CreateDefault());std::cout<<factory->Which()<<' '<<static_cast<SfxUInt16Item*>(factory.get())->GetValue()<<'\n';}
