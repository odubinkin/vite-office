
#include <cassert>
#include <climits>
#include <cstdint>
#include <iostream>
#include <map>
#include <vector>
using sal_Int16=int16_t; using sal_uInt16=uint16_t;
namespace SwNumberTree { using tSwNumTreeNumber=int64_t; }
namespace o3tl { template<class T,class U> T narrowing(U v){return static_cast<T>(v);} }
#define OSL_ENSURE(condition,message) assert(condition)
constexpr int RES_PARATR_LIST_ISRESTART=85,RES_PARATR_LIST_RESTARTVALUE=86;
enum class SfxItemState { DEFAULT,SET };
struct SfxBoolItem { int which;bool value;SfxBoolItem(int w,bool v):which(w),value(v){};bool GetValue()const{return value;} };
struct SfxInt16Item { int which;sal_Int16 value;SfxInt16Item(int w,sal_Int16 v):which(w),value(v){};sal_Int16 GetValue()const{return value;} };
struct Attr { SfxBoolItem boolean; SfxInt16Item integer;operator const SfxBoolItem&()const{return boolean;}operator const SfxInt16Item&()const{return integer;} };
struct SwAttrSet { std::map<int,int64_t> values; SfxItemState GetItemState(int w,bool)const {return values.contains(w)?SfxItemState::SET:SfxItemState::DEFAULT;} };
struct SwNumFormat {int GetStart()const{return 9;}};
struct SwNumRule {SwNumFormat format;const SwNumFormat* GetNumFormat(sal_uInt16)const{return &format;}};
struct Call {bool set;int which;int64_t value;};
struct SwTextNode {
 SwAttrSet attributes; bool parent=false,hasRule=false; SwNumRule rule; std::vector<Call> calls;
 const SwAttrSet* GetpSwAttrSet()const{return &attributes;}
 Attr GetAttr(int w)const{auto it=attributes.values.find(w); auto v=it!=attributes.values.end()?it->second:(w==85?0:(parent?9:1));return {{w,v!=0},{w,static_cast<sal_Int16>(v)}};}
 void SetAttr(const SfxBoolItem& i){calls.push_back({true,i.which,i.value});attributes.values[i.which]=i.value;}
 void SetAttr(const SfxInt16Item& i){calls.push_back({true,i.which,i.value});attributes.values[i.which]=i.value;}
 void ResetAttr(int w){calls.push_back({false,w,0});attributes.values.erase(w);}
 SwNumRule* GetNumRule()const{return hasRule?const_cast<SwNumRule*>(&rule):nullptr;}
 int GetAttrListLevel()const{return 0;}
 void SetListRestart(bool); bool IsListRestart()const;
 void SetAttrListRestartValue(SwNumberTree::tSwNumTreeNumber);
 bool HasAttrListRestartValue()const;
 SwNumberTree::tSwNumTreeNumber GetAttrListRestartValue()const,GetActualListStartValue()const;
 void Print(){std::cout<<"{\"restart\":"<<(IsListRestart()?"true":"false")<<",\"direct\":"; if(HasAttrListRestartValue())std::cout<<GetAttrListRestartValue();else std::cout<<"null";std::cout<<",\"effective\":"<<static_cast<const SfxInt16Item&>(GetAttr(86)).GetValue()<<",\"start\":"<<GetActualListStartValue()<<",\"calls\":[";bool comma=false;for(auto c:calls){if(comma)std::cout<<",";comma=true;std::cout<<"[\""<<(c.set?"set":"reset")<<"\","<<c.which;if(c.set){std::cout<<",";if(c.which==85)std::cout<<(c.value?"true":"false");else std::cout<<c.value;}std::cout<<"]";}std::cout<<"]}";calls.clear();}
};
void SwTextNode::SetListRestart( bool bRestart )
{
    if ( !bRestart )
    {
        // attribute not contained in paragraph style's attribute set. Thus,
        // it can be reset to the attribute pool default by resetting the attribute.
        ResetAttr( RES_PARATR_LIST_ISRESTART );
    }
    else
    {
        SfxBoolItem aNewIsRestartItem( RES_PARATR_LIST_ISRESTART,
                                       true );
        SetAttr( aNewIsRestartItem );
    }
}
bool SwTextNode::IsListRestart() const
{
    const SfxBoolItem& aIsRestartItem = GetAttr( RES_PARATR_LIST_ISRESTART );

    return aIsRestartItem.GetValue();
}
void SwTextNode::SetAttrListRestartValue( SwNumberTree::tSwNumTreeNumber nNumber )
{
    const bool bChanged( HasAttrListRestartValue()
                         ? GetAttrListRestartValue() != nNumber
                         : nNumber != USHRT_MAX );

    if ( !bChanged && HasAttrListRestartValue() )
        return;

    if ( nNumber == USHRT_MAX )
    {
        ResetAttr( RES_PARATR_LIST_RESTARTVALUE );
    }
    else
    {
        SfxInt16Item aNewListRestartValueItem( RES_PARATR_LIST_RESTARTVALUE,
                                               static_cast<sal_Int16>(nNumber) );
        SetAttr( aNewListRestartValueItem );
    }
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
SwNumberTree::tSwNumTreeNumber SwTextNode::GetActualListStartValue() const
{
    SwNumberTree::tSwNumTreeNumber nListRestartValue = 1;

    if ( IsListRestart() && HasAttrListRestartValue() )
    {
        nListRestartValue = GetAttrListRestartValue();
    }
    else
    {
        SwNumRule* pRule = GetNumRule();
        if ( pRule )
        {
            const SwNumFormat* pFormat =
                    pRule->GetNumFormat( o3tl::narrowing<sal_uInt16>(GetAttrListLevel()) );
            if ( pFormat )
            {
                nListRestartValue = pFormat->GetStart();
            }
        }
    }

    return nListRestartValue;
}
int main(){std::cout<<"[";
{SwTextNode n;n.parent=false;n.hasRule=false;std::cout<<"[";n.Print();
n.SetAttrListRestartValue(65535LL);std::cout<<",";n.Print();
n.SetListRestart(false);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetListRestart(false);std::cout<<",";n.Print();
std::cout<<"]";}
{SwTextNode n;n.parent=false;n.hasRule=true;std::cout<<",[";n.Print();
n.SetAttrListRestartValue(7LL);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetListRestart(false);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetAttrListRestartValue(7LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(0LL);std::cout<<",";n.Print();
n.SetListRestart(false);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65535LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65535LL);std::cout<<",";n.Print();
std::cout<<"]";}
{SwTextNode n;n.parent=true;n.hasRule=true;std::cout<<",[";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetAttrListRestartValue(9LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(9LL);std::cout<<",";n.Print();
n.SetListRestart(false);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65535LL);std::cout<<",";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
std::cout<<"]";}
{SwTextNode n;n.parent=false;n.hasRule=false;std::cout<<",[";n.Print();
n.SetListRestart(true);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-1LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-1LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(32768LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-32768LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(40000LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(40000LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-25536LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65534LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65535LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(65536LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(0LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-32769LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(131071LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(4294967303LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(9007199254740991LL);std::cout<<",";n.Print();
n.SetAttrListRestartValue(-9007199254740991LL);std::cout<<",";n.Print();
std::cout<<"]";}
std::cout<<"]\n";}
