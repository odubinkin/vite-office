#include <cassert>
#include <climits>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <string_view>
#include <type_traits>
#include <utility>
#include <vector>
using sal_Int16=int16_t; using sal_Int32=int32_t; using sal_Int64=int64_t;
using sal_Unicode=char16_t;
constexpr int RTL_STR_MIN_RADIX=2, RTL_STR_MAX_RADIX=36;
constexpr auto SAL_MIN_INT32=INT32_MIN, SAL_MAX_INT32=INT32_MAX;
template<class C> auto UChar(C c) {return static_cast<std::make_unsigned_t<C>>(c);}
namespace o3tl { namespace internal {
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
}}
namespace rtl::str {
template <typename C> struct with_length
{
    C* p;
    sal_Int32 len;
    with_length(C* pStr, sal_Int32 nLength)
        : p(pStr)
        , len(nLength)
    {
        assert(len >= 0);
    }
    auto begin() const { return p; }
    auto end() const { return p + len; }
};
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
};
}
sal_Int64 rtl_str_toInt64_WithLength(const char* pStr, sal_Int16 nRadix,
                                              sal_Int32 nStrLength) noexcept
{
    return rtl::str::toInt<sal_Int64>(rtl::str::with_length(pStr, nStrLength), nRadix);
}
namespace o3tl {
inline sal_Int32 toInt32(std::string_view str, sal_Int16 radix = 10)
{
    sal_Int64 n = rtl_str_toInt64_WithLength(str.data(), radix, str.size());
    if (n < SAL_MIN_INT32 || n > SAL_MAX_INT32)
        n = 0;
    return n;
}
}
struct FastAttributeIter {sal_Int32 value; sal_Int32 toInt32(){return value;}};
sal_Int16 itemStart(sal_Int32 value,bool bIsHeader){sal_Int16 nStartValue=-1; FastAttributeIter aIter{value};if(!bIsHeader){
            sal_Int32 nTmp = aIter.toInt32();
            if( nTmp >= 0 && nTmp <= SHRT_MAX )
                nStartValue = static_cast<sal_Int16>(nTmp);
}return nStartValue;}
int main(){std::vector<std::string> inputs={
std::string{},
std::string{char(43)},
std::string{char(45)},
std::string{char(103),char(97),char(114),char(98),char(97),char(103),char(101)},
std::string{char(48)},
std::string{char(45),char(48)},
std::string{char(43),char(48)},
std::string{char(49)},
std::string{char(43),char(49)},
std::string{char(45),char(49)},
std::string{char(51),char(50),char(55),char(54),char(55)},
std::string{char(51),char(50),char(55),char(54),char(56)},
std::string{char(52),char(48),char(48),char(48),char(48)},
std::string{char(45),char(51),char(50),char(55),char(54),char(56)},
std::string{char(48),char(48),char(48),char(50)},
std::string{char(49),char(101),char(50)},
std::string{char(50),char(46),char(53)},
std::string{char(49),char(50),char(116),char(97),char(105),char(108)},
std::string{char(43),char(49),char(50),char(116),char(97),char(105),char(108)},
std::string{char(45),char(49),char(50),char(116),char(97),char(105),char(108)},
std::string{char(48),char(120),char(49),char(48)},
std::string{char(32),char(32),char(43),char(49),char(50)},
std::string{char(32),char(43),char(32),char(49),char(50)},
std::string{char(43),char(43),char(49)},
std::string{char(45),char(45),char(49)},
std::string{char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55)},
std::string{char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56)},
std::string{char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56)},
std::string{char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(57)},
std::string{char(57),char(50),char(50),char(51),char(51),char(55),char(50),char(48),char(51),char(54),char(56),char(53),char(52),char(55),char(55),char(53),char(56),char(48),char(55)},
std::string{char(57),char(50),char(50),char(51),char(51),char(55),char(50),char(48),char(51),char(54),char(56),char(53),char(52),char(55),char(55),char(53),char(56),char(48),char(56)},
std::string{char(45),char(57),char(50),char(50),char(51),char(51),char(55),char(50),char(48),char(51),char(54),char(56),char(53),char(52),char(55),char(55),char(53),char(56),char(48),char(56)},
std::string{char(45),char(57),char(50),char(50),char(51),char(51),char(55),char(50),char(48),char(51),char(54),char(56),char(53),char(52),char(55),char(55),char(53),char(56),char(48),char(57)},
std::string{char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57)},
std::string{char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(48),char(49),char(50)},
std::string{char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57),char(57)},
std::string{char(0),char(49),char(50)},
std::string{char(49),char(50),char(0),char(51),char(52)},
std::string{char(195),char(169),char(49),char(50)},
std::string{char(194),char(160),char(49),char(50)},
std::string{char(226),char(128),char(128),char(49),char(50)},
std::string{char(239),char(188),char(145),char(239),char(188),char(146)},
std::string{char(217),char(161),char(217),char(162)},
std::string{char(49),char(50),char(226),char(128),char(128),char(51),char(52)},
std::string{char(49),char(50),char(32),char(51),char(52)},
std::string{char(32),char(32),char(45),char(48)},
std::string{char(127),char(49),char(50)},
std::string{char(1),char(49),char(50)},
std::string{char(2),char(49),char(50)},
std::string{char(3),char(49),char(50)},
std::string{char(4),char(49),char(50)},
std::string{char(5),char(49),char(50)},
std::string{char(6),char(49),char(50)},
std::string{char(7),char(49),char(50)},
std::string{char(8),char(49),char(50)},
std::string{char(9),char(49),char(50)},
std::string{char(10),char(49),char(50)},
std::string{char(11),char(49),char(50)},
std::string{char(12),char(49),char(50)},
std::string{char(13),char(49),char(50)},
std::string{char(14),char(49),char(50)},
std::string{char(15),char(49),char(50)},
std::string{char(16),char(49),char(50)},
std::string{char(17),char(49),char(50)},
std::string{char(18),char(49),char(50)},
std::string{char(19),char(49),char(50)},
std::string{char(20),char(49),char(50)},
std::string{char(21),char(49),char(50)},
std::string{char(22),char(49),char(50)},
std::string{char(23),char(49),char(50)},
std::string{char(24),char(49),char(50)},
std::string{char(25),char(49),char(50)},
std::string{char(26),char(49),char(50)},
std::string{char(27),char(49),char(50)},
std::string{char(28),char(49),char(50)},
std::string{char(29),char(49),char(50)},
std::string{char(30),char(49),char(50)},
std::string{char(31),char(49),char(50)},
std::string{char(32),char(49),char(50)},
std::string{char(32),char(48)},
std::string{char(32),char(48),char(116),char(97),char(105),char(108)},
std::string{char(32),char(49)},
std::string{char(32),char(49),char(116),char(97),char(105),char(108)},
std::string{char(32),char(51),char(50),char(55),char(54),char(55)},
std::string{char(32),char(51),char(50),char(55),char(54),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(51),char(50),char(55),char(54),char(56)},
std::string{char(32),char(51),char(50),char(55),char(54),char(56),char(116),char(97),char(105),char(108)},
std::string{char(32),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55)},
std::string{char(32),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56)},
std::string{char(32),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(48)},
std::string{char(32),char(43),char(48),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(49)},
std::string{char(32),char(43),char(49),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(51),char(50),char(55),char(54),char(55)},
std::string{char(32),char(43),char(51),char(50),char(55),char(54),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(51),char(50),char(55),char(54),char(56)},
std::string{char(32),char(43),char(51),char(50),char(55),char(54),char(56),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55)},
std::string{char(32),char(43),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(43),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56)},
std::string{char(32),char(43),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(48)},
std::string{char(32),char(45),char(48),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(49)},
std::string{char(32),char(45),char(49),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(51),char(50),char(55),char(54),char(55)},
std::string{char(32),char(45),char(51),char(50),char(55),char(54),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(51),char(50),char(55),char(54),char(56)},
std::string{char(32),char(45),char(51),char(50),char(55),char(54),char(56),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55)},
std::string{char(32),char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(55),char(116),char(97),char(105),char(108)},
std::string{char(32),char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56)},
std::string{char(32),char(45),char(50),char(49),char(52),char(55),char(52),char(56),char(51),char(54),char(52),char(56),char(116),char(97),char(105),char(108)}
};for(auto &input:inputs){auto n=o3tl::toInt32(std::string_view(input));std::cout<<n<<","<<itemStart(n,false)<<","<<itemStart(n,true)<<"\n";}}
