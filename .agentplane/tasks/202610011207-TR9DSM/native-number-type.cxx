
#include <string>
#include <vector>
#include <iostream>
#include <memory>
#include <cstdint>
#include <stdexcept>
using sal_Int32=int32_t;using sal_uInt16=uint16_t;using SvxNumType=int;
constexpr int SVX_NUM_ARABIC=4,SVX_NUM_NUMBER_NONE=5,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_BITMAP=8,SVX_NUM_ARABIC_ZERO=64,SVX_NUM_ARABIC_ZERO3=65,SVX_NUM_ARABIC_ZERO4=66,SVX_NUM_ARABIC_ZERO5=67;
// Named bounded OUString/UNO property/locale/reference platform adapters; scalar decimal values only.
struct OUString {char text[128]{};constexpr OUString()=default;constexpr OUString(char c){text[0]=c;}constexpr OUString(const char16_t*s){int i=0;while(s[i]){text[i]=static_cast<char>(s[i]);i++;}} OUString(std::string s){s.copy(text,127);}static OUString number(int v){return std::to_string(v);}bool operator==(const OUString&r)const{return std::string(text)==r.text;}};
constexpr OUString operator""_ustr(const char16_t*s,size_t){return OUString(s);}
struct Exception:std::exception{};
namespace css {namespace lang {struct Locale{};}namespace style {namespace NumberingType {constexpr int ARABIC=4,NUMBER_NONE=5,CHAR_SPECIAL=6,BITMAP=8;}}}
using namespace css::style;
struct PropertyValue{OUString key;int value;};template<typename T>using Sequence=std::vector<T>;
namespace comphelper {PropertyValue makePropertyValue(OUString key,int value){return {key,value};}}
// Provider adapter uses the pinned makeNumberingString nonpositive-value exception and only existing ARABIC/NONE branches.
struct Formatter {OUString makeNumberingString(const Sequence<PropertyValue>&p,const css::lang::Locale&)const{int type=p[0].value,value=p[1].value;if(value<=0)throw Exception{};return type==4?OUString::number(value):OUString();}};
struct Reference {std::shared_ptr<Formatter>ptr;bool is()const{return bool(ptr);}Formatter*operator->()const{return ptr.get();}Reference&operator=(std::nullptr_t){ptr.reset();return *this;}};
void lcl_getFormatter(Reference&r){if(!r.is())r.ptr=std::make_shared<Formatter>();}
struct SvxNumberType {static inline int nRefCount=0;static inline Reference xFormatter;int nNumType;bool bShowSymbol;SvxNumberType(SvxNumType);SvxNumberType(const SvxNumberType&);~SvxNumberType();OUString GetNumStr(sal_Int32,const css::lang::Locale&,bool=false)const;

void            SetNumberingType(SvxNumType nSet) {nNumType = nSet;}
SvxNumType      GetNumberingType() const {return nNumType;}
void            SetShowSymbol(bool bSet) {bShowSymbol = bSet;}
bool            IsShowSymbol()const{return bShowSymbol;}
bool            IsTextFormat() const
                    {
                        return css::style::NumberingType::NUMBER_NONE != nNumType &&
                               css::style::NumberingType::CHAR_SPECIAL != nNumType &&
                               css::style::NumberingType::BITMAP != nNumType;
                    }};

SvxNumberType::SvxNumberType(SvxNumType nType) :
    nNumType(nType),
    bShowSymbol(true)
{
    nRefCount++;
}
SvxNumberType::SvxNumberType(const SvxNumberType& rType) :
    nNumType(rType.nNumType),
    bShowSymbol(rType.bShowSymbol)
{
    nRefCount++;
}
SvxNumberType::~SvxNumberType()
{
    if(!--nRefCount)
        xFormatter = nullptr;
}
static bool isArabicNumberingType(SvxNumType t)
{
    return t == SVX_NUM_ARABIC || t == SVX_NUM_ARABIC_ZERO || t == SVX_NUM_ARABIC_ZERO3
           || t == SVX_NUM_ARABIC_ZERO4 || t == SVX_NUM_ARABIC_ZERO5;
}
OUString SvxNumberType::GetNumStr( sal_Int32 nNo, const css::lang::Locale& rLocale, bool bIsLegal ) const
{
    lcl_getFormatter(xFormatter);
    if(!xFormatter.is())
        return OUString();

    if(bShowSymbol)
    {
        switch(nNumType)
        {
            case NumberingType::CHAR_SPECIAL:
            case NumberingType::BITMAP:
            break;
            default:
                {
                    // '0' allowed for ARABIC numberings
                    if(NumberingType::ARABIC == nNumType && 0 == nNo )
                        return OUString('0');
                    else
                    {
                        SvxNumType nActType = !bIsLegal || isArabicNumberingType(nNumType) ? nNumType : SVX_NUM_ARABIC;
                        static constexpr OUString sNumberingType = u"NumberingType"_ustr;
                        static constexpr OUString sValue = u"Value"_ustr;
                        Sequence< PropertyValue > aProperties
                        {
                            comphelper::makePropertyValue(sNumberingType, static_cast<sal_uInt16>(nActType)),
                            comphelper::makePropertyValue(sValue, nNo)
                        };

                        try
                        {
                            return xFormatter->makeNumberingString( aProperties, rLocale );
                        }
                        catch(const Exception&)
                        {
                        }
                    }
                }
        }
    }
    return OUString();
}
int main(){std::cout<<"[";bool first=true;for(int type:{4,5,6,8})for(bool show:{true,false})for(bool legal:{false,true})for(int64_t input:{int64_t(0),int64_t(1),int64_t(7),int64_t(-1),int64_t(32767),int64_t(65535),int64_t(2147483647),int64_t(2147483648),int64_t(4294967295)}){SvxNumberType original(type);original.SetShowSymbol(show);SvxNumberType copy(original);if(!first)std::cout<<",";first=false;auto s=copy.GetNumStr(static_cast<sal_Int32>(input),{},legal);std::cout<<"["<<type<<","<<(show?"true":"false")<<","<<(legal?"true":"false")<<","<<input<<",\""<<s.text<<"\","<<(copy.IsTextFormat()?"true":"false")<<"]";}std::cout<<"]";}
