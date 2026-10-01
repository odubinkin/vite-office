
#include <cstdint>
#include <cstdarg>
#include <iostream>
#include <map>
#include <optional>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_uInt16=uint16_t;
namespace SwNumberTree {using tSwNumTreeNumber=int64_t;}
#define SAL_LOG_TRUE true
#define SAL_LOG_FALSE false
#define SAL_DETAIL_LOG_LEVEL_WARN 1
#define SAL_DETAIL_WHERE "named generated-location adapter"
struct Diagnostic{std::string area,message;};std::vector<Diagnostic> diagnostics;
void sal_detail_logFormat(int,const char* area,const char*,const char* format,...){va_list args;va_start(args,format);diagnostics.push_back({area,va_arg(args,const char*)});va_end(args);}

#if defined SAL_LOG_WARN
#define SAL_DETAIL_ENABLE_LOG_WARN SAL_LOG_TRUE
#else
#define SAL_DETAIL_ENABLE_LOG_WARN SAL_LOG_FALSE
#endif
#define OSL_ENSURE(c, m) SAL_DETAIL_WARN_IF_FORMAT(!(c), "legacy.osl", "%s", m)
#define SAL_DETAIL_LOG_FORMAT(condition, level, area, where, ...) \
    do { \
        if (condition) { \
            sal_detail_logFormat((level), (area), (where), __VA_ARGS__); \
        } \
    } while (SAL_LOG_FALSE)
#define SAL_DETAIL_WARN_IF_FORMAT(condition, area, ...) \
    SAL_DETAIL_LOG_FORMAT( \
        SAL_DETAIL_ENABLE_LOG_WARN && (condition), SAL_DETAIL_LOG_LEVEL_WARN, \
        area, SAL_DETAIL_WHERE, __VA_ARGS__)
struct SfxPoolItem {sal_uInt16 which;explicit SfxPoolItem(sal_uInt16 n):which(n){};virtual ~SfxPoolItem()=default;};
class SfxInt16Item:public SfxPoolItem{sal_Int16 m_nValue;public:
explicit SfxInt16Item(sal_uInt16 which = 0, sal_Int16 nTheValue = 0):
        SfxPoolItem(which), m_nValue(nTheValue)
    {}
sal_Int16 GetValue() const { return m_nValue; }
};
template<class T>struct TypedWhichId{sal_uInt16 value;constexpr operator sal_uInt16()const{return value;}};
constexpr TypedWhichId<SfxInt16Item> RES_PARATR_LIST_RESTARTVALUE{86};
enum class SfxItemState {DEFAULT,SET};
struct SwAttrSet {std::map<sal_uInt16,SfxInt16Item> attrs;SfxInt16Item fallback{86,1};mutable std::vector<bool> reads;
 SfxItemState GetItemState(sal_uInt16 w,bool)const{return attrs.contains(w)?SfxItemState::SET:SfxItemState::DEFAULT;}
 const SfxPoolItem& Get(sal_uInt16 w,bool inParent)const{reads.push_back(inParent);auto it=attrs.find(w);return it!=attrs.end()?it->second:fallback;}
};
struct SwFormatColl {SwAttrSet attributes;const SwAttrSet& GetAttrSet()const{return attributes;}};
struct SwContentNode {std::optional<SwAttrSet> mpAttrSet;SwFormatColl collection;
 const SwAttrSet* GetpSwAttrSet()const{return mpAttrSet?&*mpAttrSet:nullptr;}
 const SwFormatColl& GetAnyFormatColl()const{return collection;}
 const SwAttrSet& GetSwAttrSet()const;
 const SfxPoolItem& GetAttr(sal_uInt16 nWhich,bool bInParents=true)const;
    template<class T>
    const T& GetAttr( TypedWhichId<T> nWhich, bool bInParent=true ) const
    { return static_cast<const T&>(GetAttr(sal_uInt16(nWhich), bInParent)); }
};
struct SwTextNode:SwContentNode {bool HasAttrListRestartValue()const;SwNumberTree::tSwNumTreeNumber GetAttrListRestartValue()const;
 void Set(int w,int v){if(!mpAttrSet)mpAttrSet.emplace();mpAttrSet->attrs.insert_or_assign(w,SfxInt16Item(w,v));}
 void Clear(int w){if(mpAttrSet){mpAttrSet->attrs.erase(w);if(mpAttrSet->attrs.empty())mpAttrSet.reset();}}
 void Print(){const auto count=mpAttrSet?mpAttrSet->attrs.size():0;const bool direct=HasAttrListRestartValue();diagnostics.clear();auto& reads=GetSwAttrSet().reads;reads.clear();const auto result=GetAttrListRestartValue();std::cout<<"{\"value\":"<<result<<",\"direct\":"<<(direct?"true":"false")<<",\"count\":"<<count<<",\"allocated\":"<<(mpAttrSet?"true":"false")<<",\"inParent\":"<<(reads.size()==1&&reads[0]?"true":"false")<<",\"diagnostics\":[";bool comma=false;for(auto& d:diagnostics){if(comma)std::cout<<",";comma=true;std::cout<<"{\"area\":\""<<d.area<<"\",\"message\":\""<<d.message<<"\"}";}std::cout<<"]}";if(direct!=HasAttrListRestartValue()||count!=(mpAttrSet?mpAttrSet->attrs.size():0))std::abort();}
};

inline const SwAttrSet& SwContentNode::GetSwAttrSet() const
{
    return mpAttrSet ? *GetpSwAttrSet() : GetAnyFormatColl().GetAttrSet();
}
inline const SfxPoolItem& SwContentNode::GetAttr( sal_uInt16 nWhich,
                                                bool bInParents ) const
{
    return GetSwAttrSet().Get( nWhich, bInParents );
}
bool SwTextNode::HasAttrListRestartValue() const
{
    return GetpSwAttrSet() &&
           GetpSwAttrSet()->GetItemState( RES_PARATR_LIST_RESTARTVALUE, false ) == SfxItemState::SET;
}
SwNumberTree::tSwNumTreeNumber SwTextNode::GetAttrListRestartValue() const
{
    OSL_ENSURE( HasAttrListRestartValue(),
            "<SwTextNode::GetAttrListRestartValue()> - only ask for list restart value, if attribute is set at text node." );

    const SfxInt16Item& aListRestartValueItem =
        GetAttr( RES_PARATR_LIST_RESTARTVALUE );
    return static_cast<SwNumberTree::tSwNumTreeNumber>(aListRestartValueItem.GetValue());
}
int main(){SwTextNode n;std::cout<<"[";n.Print();
n.Set(84,0);std::cout<<",";n.Print();
n.Set(85,1);std::cout<<",";n.Print();
n.Set(86,0);std::cout<<",";n.Print();
n.Set(85,0);std::cout<<",";n.Print();
n.Set(86,7);std::cout<<",";n.Print();
n.Set(86,-32768);std::cout<<",";n.Print();
n.Set(86,-1);std::cout<<",";n.Print();
n.Set(86,32767);std::cout<<",";n.Print();
n.Clear(86);std::cout<<",";n.Print();
n.Clear(84);std::cout<<",";n.Print();
n.Clear(85);std::cout<<",";n.Print();
std::cout<<"]\n";}
