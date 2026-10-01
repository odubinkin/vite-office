
#include <iostream>
#include <string>
#include <string_view>
#include <limits>
#include <type_traits>
#include <utility>
#include <cassert>
#include <cstdint>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_Int64=int64_t;using sal_Unicode=char16_t;
constexpr int RTL_STR_MIN_RADIX=2,RTL_STR_MAX_RADIX=36;
#define SAL_MIN_INT32 INT32_MIN
#define SAL_MAX_INT32 INT32_MAX
unsigned char UChar(char c){return static_cast<unsigned char>(c);}
namespace o3tl::internal {
inline bool implIsWhitespace(sal_Unicode c)
{
    /* Space or Control character? */
    if ((c <= 32) && c)
        return true;

    /* Only in the General Punctuation area Space or Control characters are included? */
    if ((c < 0x2000) || (c > 0x2029))
        return false;

    if ((c <= 0x200B) || /* U+2000 - U+200B All Spaces */
        (c >= 0x2028)) /* U+2028 LINE SEPARATOR, U+2029 PARAGRAPH SEPARATOR */
        return true;

    return false;
}
}
inline sal_Int16 implGetDigit(sal_Unicode ch, sal_Int16 nRadix)
{
    sal_Int16 n = -1;
    if ((ch >= '0') && (ch <= '9'))
        n = ch - '0';
    else if ((ch >= 'a') && (ch <= 'z'))
        n = ch - 'a' + 10;
    else if ((ch >= 'A') && (ch <= 'Z'))
        n = ch - 'A' + 10;
    return (n < nRadix) ? n : -1;
}
template <typename T, class Iter> inline bool HandleSignChar(Iter& iter)
{
    if constexpr (std::numeric_limits<T>::is_signed)
    {
        if (*iter == '-')
        {
            ++iter;
            return true;
        }
    }
    if (*iter == '+')
        ++iter;
    return false;
}
template <typename T> std::pair<T, sal_Int16> DivMod(sal_Int16 nRadix, [[maybe_unused]] bool bNeg)
{
    if constexpr (std::numeric_limits<T>::is_signed)
        if (bNeg)
            return { -(std::numeric_limits<T>::min() / nRadix),
                     -(std::numeric_limits<T>::min() % nRadix) };
    return { std::numeric_limits<T>::max() / nRadix, std::numeric_limits<T>::max() % nRadix };
}
template <typename T, class S> T toInt(S str, sal_Int16 nRadix)
{
    assert( nRadix >= RTL_STR_MIN_RADIX && nRadix <= RTL_STR_MAX_RADIX );

    if ( (nRadix < RTL_STR_MIN_RADIX) || (nRadix > RTL_STR_MAX_RADIX) )
        nRadix = 10;

    auto pStr = str.begin();
    const auto end = str.end();

    /* Skip whitespaces */
    while (pStr != end && o3tl::internal::implIsWhitespace(UChar(*pStr)))
        pStr++;
    if (pStr == end)
        return 0;

    const bool bNeg = HandleSignChar<T>(pStr);
    const auto& [nDiv, nMod] = DivMod<T>(nRadix, bNeg);
    assert(nDiv > 0);

    std::make_unsigned_t<T> n = 0;
    while (pStr != end)
    {
        sal_Int16 nDigit = implGetDigit(UChar(*pStr), nRadix);
        if ( nDigit < 0 )
            break;
        if (static_cast<std::make_unsigned_t<T>>(nMod < nDigit ? nDiv - 1 : nDiv) < n)
            return 0;

        n *= nRadix;
        n += nDigit;

        pStr++;
    }

    if constexpr (std::numeric_limits<T>::is_signed)
        if (bNeg)
            return n == static_cast<std::make_unsigned_t<T>>(std::numeric_limits<T>::min())
                       ? std::numeric_limits<T>::min()
                       : -static_cast<T>(n);
    return static_cast<T>(n);
}
sal_Int64 rtl_str_toInt64_WithLength(const char* text,sal_Int16 radix,size_t length){return toInt<sal_Int64>(std::string_view(text,length),radix);}
namespace o3tl {
inline sal_Int32 toInt32(std::string_view str, sal_Int16 radix = 10)
{
    sal_Int64 n = rtl_str_toInt64_WithLength(str.data(), radix, str.size());
    if (n < SAL_MIN_INT32 || n > SAL_MAX_INT32)
        n = 0;
    return n;
}
}

#include <string>
#include <vector>
#include <optional>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cassert>
#include <cstdint>
using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;using LanguageType=int;
struct OUString {
 std::string value;
 OUString()=default; OUString(const char* text):value(text){} OUString(std::string text):value(text){}
 OUString(const char* text,size_t len):value(text,len){} OUString(const char16_t* text) {while(*text)value+=static_cast<char>(*text++);}
 int32_t getLength()const{return value.size();} bool isEmpty()const{return value.empty();} void clear(){value.clear();}
 sal_Int32 iterateCodePoints(sal_Int32* n)const{return static_cast<unsigned char>(value.at((*n)++));}
 char operator[](int32_t n)const{return value.at(n);}
 int32_t indexOf(char c,int32_t from=0)const {auto n=value.find(c,from);return n==std::string::npos?-1:n;}
 int32_t lastIndexOf(char c)const {auto n=value.rfind(c);return n==std::string::npos?-1:n;}
 int32_t lastIndexOf(char c,int32_t before)const {if(before<=0)return -1;auto n=value.rfind(c,before-1);return n==std::string::npos?-1:n;}
 OUString copy(int32_t from)const{return value.substr(from);} OUString copy(int32_t from,int32_t len)const{return value.substr(from,len);}
 OUString replaceAt(int32_t start,int32_t len,const OUString& text)const{auto out=value;out.replace(start,len,text.value);return out;}
 OUString& operator+=(const OUString& s){value+=s.value;return *this;}
 static OUString number(int n){return std::to_string(n);}
};
OUString operator+(OUString a,const OUString& b){return a+=b;}
struct OUStringBuffer {
 OUString value;
 OUStringBuffer& operator=(const OUString& s){value=s;return *this;}
 void append(const OUString& s){value+=s;} void append(const char* s){value+=s;}
 void insert(int n,const OUString& s){value.value.insert(n,s.value);} bool isEmpty()const{return value.isEmpty();}
 void append(sal_Int32 n){value+=OUString::number(n);} OUString makeStringAndClear(){auto out=value;value.clear();return out;}
};
namespace css::lang {struct Locale {};}
struct LanguageTag {static css::lang::Locale convertToLocale(int){return {};}};
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
constexpr int MAXLEVEL=10,SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2,SVX_NUM_BITMAP=3;
struct SvxNumberFormat {
 OUString sPrefix,sSuffix; std::optional<OUString> sListFormat; sal_uInt8 nInclUpperLevels=1; sal_uInt16 nStart=1; int type=0;
     void            SetIncludeUpperLevels( sal_uInt8 nSet ) { nInclUpperLevels = nSet;}
    void            SetStart(sal_uInt16 nSet) {nStart = nSet;}
 void SetPrefix(const OUString&); void SetSuffix(const OUString&);
 void SetListFormat(const OUString&,const OUString&,int); void SetListFormat(std::optional<OUString> oSet=std::nullopt);
 bool HasListFormat()const{return sListFormat.has_value();} OUString GetListFormat(bool=true)const;
 const OUString& GetPrefix()const{return sPrefix;} const OUString& GetSuffix()const{return sSuffix;}
 sal_uInt8 GetIncludeUpperLevels()const{return nInclUpperLevels;} bool GetIsLegal()const{return false;}
 int GetNumberingType()const{return type;}
 OUString GetNumStr(int n,const css::lang::Locale&,bool)const{return type==SVX_NUM_CHAR_SPECIAL?OUString():OUString::number(n);}
};
using SwNumFormat=SvxNumberFormat;
struct SwNumberTree {using tNumberVector=std::vector<unsigned int>;};
struct SwNumRule {
 struct Extremities {int nPrefixChars=0,nSuffixChars=0;}; SvxNumberFormat formats[10];
 const SvxNumberFormat& Get(int n)const{return formats[n];} bool IsContinusNum()const{return false;}
 OUString MakeNumString(const SwNumberTree::tNumberVector&,bool,unsigned int,bool,Extremities*,LanguageType)const;
};
void SvxNumberFormat::SetPrefix(const OUString& rSet)
{
    // ListFormat manages the prefix. If badly changed via this function, sListFormat is invalidated
    if (sListFormat)
        sListFormat.reset();

    sPrefix = rSet;
}

void SvxNumberFormat::SetSuffix(const OUString& rSet)
{
    // ListFormat manages the suffix. If badly changed via this function, sListFormat is invalidated
    if (sListFormat)
        sListFormat.reset();

    sSuffix = rSet;
}

void SvxNumberFormat::SetListFormat(const OUString& rPrefix, const OUString& rSuffix, int nLevel)
{
    sPrefix = rPrefix;
    sSuffix = rSuffix;

    // Generate list format
    sListFormat = std::make_optional(sPrefix);

    for (int i = 1; i <= nInclUpperLevels; i++)
    {
        int nLevelId = nLevel - nInclUpperLevels + i;
        if (nLevelId < 0)
            // There can be cases with current level 1, but request to show 10 upper levels. Trim it
            continue;

        *sListFormat += "%";
        *sListFormat += OUString::number(nLevelId + 1);
        *sListFormat += "%";
        if (i != nInclUpperLevels)
            *sListFormat += "."; // Default separator for older ODT
    }

    *sListFormat += sSuffix;
}

void SvxNumberFormat::SetListFormat(std::optional<OUString> oSet)
{
    sPrefix.clear();
    sSuffix.clear();

    sListFormat = oSet;

    if (!oSet.has_value())
    {
        return;
    }

    // For backward compatibility and UI we should create something looking like
    // a prefix, suffix and included levels also. This is not possible in general case
    // since level format string is much more flexible. But for most cases is okay

    // If properly formatted, sListFormat should look something like "%1%…%10%"
    // with an optional prefix or suffix (which could theoretically include a percent symbol)
    const sal_Int32 nLen = sListFormat->getLength();
    sal_Int32 nFirstReplacement = sListFormat->indexOf('%');
    while (nFirstReplacement > -1 && nFirstReplacement < nLen - 1
           && ((*sListFormat)[nFirstReplacement + 1] < '1'
               || (*sListFormat)[nFirstReplacement + 1] > '9'))
    {
        nFirstReplacement = sListFormat->indexOf('%', nFirstReplacement + 1);
    }

    sal_Int32 nLastReplacement = nFirstReplacement == -1 ? -1 : sListFormat->lastIndexOf('%');
    while (nLastReplacement > 0
           && ((*sListFormat)[nLastReplacement - 1] < '0'
               || (*sListFormat)[nLastReplacement - 1] > '9'))
    {
        nLastReplacement = sListFormat->lastIndexOf('%', nLastReplacement);
    }
    if (nLastReplacement < nFirstReplacement)
        nLastReplacement = nFirstReplacement;
    else
        ++nLastReplacement;

    if (nFirstReplacement > 0)
        // Everything before first '%' will be prefix
        sPrefix = sListFormat->copy(0, nFirstReplacement);
    if (nLastReplacement >= 0 && nLastReplacement < nLen)
        // Everything beyond last '%' is a suffix
        sSuffix = sListFormat->copy(nLastReplacement);

    sal_uInt8 nPercents = 0;
    for (sal_Int32 i = nFirstReplacement > 0 ? nFirstReplacement : 0; i < nLastReplacement; i++)
    {
        if ((*sListFormat)[i] == '%')
            nPercents++;
    }
    nInclUpperLevels = nPercents/2;
    if (nInclUpperLevels < 1)
    {
        // There should be always at least one level. This will be not required
        // in future (when we get rid of prefix/suffix), but nowadays there
        // are too many conversions "list format" <-> "prefix/suffix/inclUpperLevel"
        nInclUpperLevels = 1;
    }
}

OUString SvxNumberFormat::GetListFormat(bool bIncludePrefixSuffix /*= true*/) const
{
    assert(sListFormat.has_value());

    if (bIncludePrefixSuffix)
        return *sListFormat;

    // Strip prefix & suffix from string
    return sListFormat->copy(sPrefix.getLength(), sListFormat->getLength() - sPrefix.getLength() - sSuffix.getLength());
}

#include <climits>
#include <variant>
#include <algorithm>
OUString operator""_ustr(const char16_t* text,size_t){return OUString(text);}
namespace o3tl {template<typename T>T& temporary(T&& value){return value;}}
enum {TEXT=1,STYLE=2,XLINK=3,LO_EXT=4};
#define XML_ELEMENT(ns,token) ((ns)*100+(token))
#define XMLOFF_WARN_UNKNOWN(category,attr) ((void)0)
enum {XML_ACTUATE,XML_BULLET_CHAR,XML_DISPLAY_LEVELS,XML_HREF,XML_IS_LEGAL,XML_LEVEL,XML_NUM_FORMAT,XML_NUM_LETTER_SYNC,XML_NUM_LIST_FORMAT,XML_NUM_PREFIX,XML_NUM_SUFFIX,XML_SHOW,XML_START_VALUE,XML_STYLE_NAME,XML_TYPE};

struct Attribute {
 int token;std::string value;
 int getToken()const{return token;}bool isEmpty()const{return value.empty();}
 OUString toString()const{return value;}sal_Int32 toInt32()const{return o3tl::toInt32(value);}
 bool toBoolean()const{return value=="true";}
};
namespace sax_fastparser {const auto& castToFastAttributeList(const std::vector<Attribute>& v){return v;}}
struct Value {
 std::variant<sal_Int16,OUString> value;
 Value(sal_Int16 n):value(n){}Value(OUString s):value(s){}
 bool operator>>=(sal_Int16& n)const{if(auto p=std::get_if<sal_Int16>(&value)){n=*p;return true;}return false;}
 bool operator>>=(OUString& s)const{if(auto p=std::get_if<OUString>(&value)){s=*p;return true;}return false;}
};
struct Property {std::string Name;Value Value;};
namespace comphelper {template<typename T>Property makePropertyValue(OUString name,T value){return {name.value,::Value(value)};}}
const std::string UNO_NAME_PARENT_NUMBERING="ParentNumbering",UNO_NAME_PREFIX="Prefix",UNO_NAME_SUFFIX="Suffix",UNO_NAME_START_WITH="StartWith",UNO_NAME_LIST_FORMAT="ListFormat";
constexpr int XML_NAMESPACE_TEXT=TEXT,XML_NAMESPACE_STYLE=STYLE;
namespace NumberingType {constexpr int NUMBER_NONE=SVX_NUM_NUMBER_NONE;}
struct Export {std::vector<std::pair<int,OUString>> values;void AddAttribute(int ns,int token,OUString value){values.push_back({XML_ELEMENT(ns,token),value});}};
Export output;
Export& GetExport(){return output;}
std::string unhex(const std::string& hex){std::string out;if(hex!="-")for(size_t i=0;i<hex.size();i+=2)out+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));return out;}
std::string hex(const OUString& s){std::ostringstream out;for(unsigned char c:s.value)out<<std::hex<<std::setw(2)<<std::setfill('0')<<int(c);return s.isEmpty()?"-":out.str();}
void dump(const OUString& prefix,const OUString& suffix,int start,int parent,const OUString& pattern){std::cout<<hex(prefix)<<' '<<hex(suffix)<<' '<<start<<' '<<parent<<' '<<hex(pattern)<<'\n';}
int main(){int kind,level,count;while(std::cin>>kind>>level>>count){
 std::vector<Attribute>xAttrList={{XML_ELEMENT(TEXT,XML_LEVEL),std::to_string(level+1)}};
 for(int i=0;i<count;i++){int token;std::string value;std::cin>>token>>value;xAttrList.push_back({token,unhex(value)});}
 bool bNum=kind==0,bBullet=kind==1,bImage=false,m_bIsLegal=false;
 sal_Int32 nLevel=-1,cBullet=0;sal_Int16 nNumStartValue=1,nNumDisplayLevels=1;
 OUString sNumFormat="1",sPrefix,sSuffix,sTextStyleName,sImageURL,sNumLetterSync;
 std::optional<OUString>sListFormat;
    for( auto& aIter : sax_fastparser::castToFastAttributeList(xAttrList) )
    {
        switch( aIter.getToken() )
        {
        case XML_ELEMENT(TEXT, XML_LEVEL):
            nLevel = aIter.toInt32();
            if( nLevel >= 1 )
                nLevel--;
            else
                nLevel = 0;
            break;
        case XML_ELEMENT(TEXT, XML_STYLE_NAME):
            sTextStyleName = aIter.toString();
            break;
        case XML_ELEMENT(TEXT, XML_BULLET_CHAR):
            if (!aIter.isEmpty())
            {
                cBullet = aIter.toString().iterateCodePoints(&o3tl::temporary(sal_Int32(0)));
            }
            break;
        case XML_ELEMENT(XLINK, XML_HREF):
            if( bImage )
                sImageURL = aIter.toString();
            break;
        case XML_ELEMENT(XLINK, XML_TYPE):
        case XML_ELEMENT(XLINK, XML_SHOW):
        case XML_ELEMENT(XLINK, XML_ACTUATE):
            // This properties will be ignored
            break;
        case XML_ELEMENT(STYLE, XML_NUM_FORMAT):
            if( bNum )
                sNumFormat = aIter.toString();
            break;
        case XML_ELEMENT(STYLE, XML_NUM_PREFIX):
            sPrefix = aIter.toString();
            break;
        case XML_ELEMENT(STYLE, XML_NUM_SUFFIX):
            sSuffix = aIter.toString();
            break;
        case XML_ELEMENT(STYLE, XML_NUM_LIST_FORMAT):
        case XML_ELEMENT(LO_EXT, XML_NUM_LIST_FORMAT):
            sListFormat = std::make_optional(aIter.toString());
            break;
        case XML_ELEMENT(LO_EXT, XML_IS_LEGAL):
            m_bIsLegal = aIter.toBoolean();
            break;
        case XML_ELEMENT(STYLE, XML_NUM_LETTER_SYNC):
            if( bNum )
                sNumLetterSync = aIter.toString();
            break;
        case XML_ELEMENT(TEXT, XML_START_VALUE):
            if( bNum )
            {
                sal_Int32 nTmp = aIter.toInt32();
                nNumStartValue =
                    (nTmp < 0) ? 1 : ( (nTmp>SHRT_MAX) ? SHRT_MAX
                                                        : static_cast<sal_Int16>(nTmp) );
            }
            break;
        case XML_ELEMENT(TEXT, XML_DISPLAY_LEVELS):
            if( bNum )
            {
                sal_Int32 nTmp = aIter.toInt32();
                nNumDisplayLevels =
                    (nTmp < 1) ? 1 : ( (nTmp>SHRT_MAX) ? SHRT_MAX
                                                        : static_cast<sal_Int16>(nTmp) );
            }
            break;
        default:
            XMLOFF_WARN_UNKNOWN("xmloff", aIter);
        }
    }
    if (!sListFormat.has_value())
    {
        // This is older document: it has no list format, but can probably contain prefix and/or suffix
        // Generate list format string, based on this
        sListFormat = std::make_optional(sPrefix);

        // Can't display more levels than exist
        sal_Int32 nDisplayLevels = std::min<sal_Int32>(nNumDisplayLevels, nLevel + 1);
        for (int i = 1; i <= nDisplayLevels; i++)
        {
            *sListFormat += "%";
            *sListFormat += OUString::number(nLevel - nDisplayLevels + i + 1);
            *sListFormat += "%";
            if (i != nDisplayLevels)
                *sListFormat += ".";     // Default separator for older ODT
        }

        *sListFormat += sSuffix;
    }
 dump(sPrefix,sSuffix,nNumStartValue,nNumDisplayLevels,*sListFormat);
 SvxNumberFormat aFormat;aFormat.type=kind;aFormat.SetListFormat("",".",level);
 std::vector<Property>aProperties;
    aProperties.push_back(comphelper::makePropertyValue(u"Prefix"_ustr, sPrefix));
    aProperties.push_back(comphelper::makePropertyValue(u"Suffix"_ustr, sSuffix));
    if( bNum )
    {
        aProperties.push_back(comphelper::makePropertyValue(u"StartWith"_ustr, nNumStartValue));
        aProperties.push_back(comphelper::makePropertyValue(u"ParentNumbering"_ustr, nNumDisplayLevels));
    }
    aProperties.push_back(comphelper::makePropertyValue(u"ListFormat"_ustr, *sListFormat));
 for(const auto& rProp:aProperties){if(false){}
        else if (rProp.Name == UNO_NAME_PARENT_NUMBERING)
        {
            sal_Int16 nSet = 0;
            rProp.Value >>= nSet;
            if(nSet >= 0 && MAXLEVEL >= nSet)
                aFormat.SetIncludeUpperLevels( static_cast< sal_uInt8 >(nSet) );
        }
        else if (rProp.Name == UNO_NAME_PREFIX)
        {
            OUString uTmp;
            rProp.Value >>= uTmp;
            aFormat.SetPrefix(uTmp);
        }
        else if (rProp.Name == UNO_NAME_SUFFIX)
        {
            OUString uTmp;
            rProp.Value >>= uTmp;
            aFormat.SetSuffix(uTmp);
        }
        else if (rProp.Name == UNO_NAME_START_WITH)
        {
            sal_Int16 nVal = 0;
            rProp.Value >>= nVal;
            aFormat.SetStart(nVal);
        }
        else if (rProp.Name == UNO_NAME_LIST_FORMAT)
        {
            OUString uTmp;
            rProp.Value >>= uTmp;
            aFormat.SetListFormat(uTmp);
        }
 }
 dump(aFormat.GetPrefix(),aFormat.GetSuffix(),aFormat.GetStart(),aFormat.GetIncludeUpperLevels(),aFormat.GetListFormat());
 // Native UNO GetPropertiesForNumFormat narrowing, followed by xmlnume property read.
 const auto& rFormat=aFormat;sal_Int16 nINT16;
    nINT16 = rFormat.GetStart();
 sal_Int16 nStartValue=nINT16,nDisplayLevels=1;int eType=kind;
 const Property rProp={"ParentNumbering",Value(static_cast<sal_Int16>(aFormat.GetIncludeUpperLevels()))};
 if(false){}
        else if( rProp.Name == "ParentNumbering" )
        {
            rProp.Value >>= nDisplayLevels;
            if( nDisplayLevels > nLevel+1 )
                nDisplayLevels = static_cast<sal_Int16>( nLevel )+1;
        }
 sPrefix=aFormat.GetPrefix();sSuffix=aFormat.GetSuffix();OUStringBuffer sTmp;output.values.clear();
        if (!sPrefix.isEmpty())
        {
            GetExport().AddAttribute( XML_NAMESPACE_STYLE, XML_NUM_PREFIX,
                    sPrefix );
        }
        if (!sSuffix.isEmpty())
        {
            GetExport().AddAttribute( XML_NAMESPACE_STYLE, XML_NUM_SUFFIX,
                    sSuffix );
        }
 if(bNum){
        if( nStartValue != 1 )
        {
            sTmp.append( static_cast<sal_Int32>(nStartValue) );
            GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_START_VALUE,
                          sTmp.makeStringAndClear() );
        }
        if( nDisplayLevels > 1 && NumberingType::NUMBER_NONE != eType )
        {
            sTmp.append( static_cast<sal_Int32>(nDisplayLevels) );
            GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_DISPLAY_LEVELS,
                          sTmp.makeStringAndClear() );
        }
 }
 std::cout<<output.values.size();for(const auto& [token,value]:output.values)std::cout<<' '<<token<<' '<<hex(value);std::cout<<'\n';
}}
