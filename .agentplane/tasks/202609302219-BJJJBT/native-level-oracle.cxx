
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
struct Attribute {std::string_view text;sal_Int32 toInt32()const{return o3tl::toInt32(text);}};
sal_Int32 level(std::string_view text){Attribute aIter{text};sal_Int32 nLevel=-1;
            nLevel = aIter.toInt32();
            if( nLevel >= 1 )
                nLevel--;
            else
                nLevel = 0;

return nLevel;}
int main(){int present;std::string hex;while(std::cin>>present>>hex){std::string value;
if(hex!="-")for(size_t i=0;i<hex.size();i+=2)value+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));
std::cout<<(present?level(value):-1)<<'\n';}}
