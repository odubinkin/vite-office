
#include <string>
#include <vector>
#include <optional>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cassert>
#include <cstdint>
using sal_Int32=int32_t; using sal_uInt8=uint8_t; using sal_uInt16=uint16_t; using sal_Unicode=char; using LanguageType=int;
struct OUString {
 std::string value;
 OUString()=default; OUString(const char* text):value(text){} OUString(std::string text):value(text){}
 OUString(const char* text,size_t len):value(text,len){} OUString(const char16_t* text) {while(*text)value+=static_cast<char>(*text++);}
 int32_t getLength()const{return value.size();} bool isEmpty()const{return value.empty();} void clear(){value.clear();}
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
 OUString makeStringAndClear(){return value;}
};
namespace css::lang {struct Locale {};}
struct LanguageTag {static css::lang::Locale convertToLocale(int){return {};}};
namespace o3tl {template<typename T,typename U>T narrowing(U n){return static_cast<T>(n);}}
constexpr int MAXLEVEL=10,SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2,SVX_NUM_BITMAP=3;
struct SvxNumberFormat {
 OUString sPrefix,sSuffix; std::optional<OUString> sListFormat; sal_uInt8 nInclUpperLevels=1; sal_uInt16 nStart=1; int type=0;
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
void StripNonDelimiter(OUString& rText)
{
    std::vector<sal_Unicode> charactersToKeep;

    for (int i = 0; i < rText.getLength(); i++) {
        auto character = rText[i];

         // tdf#86790# for Word compatibility: I haven't found any better way to determine whether a
         // character is a delimiter than testing in Word and listing them out. Furthermore, I haven't
         // found a list so I can't be certain this is the complete set- if there's a compatibility issue
         // with this in the future, here's the first place to look...
        if (
            character == '.'
            || character == ','
            || character == ':'
            || character == ';'
            || character == '-'
            || character == '('
            || character == ')'
            || character == '['
            || character == ']'
            || character == '{'
            || character == '}'
            || character == '/'
            || character == '\\'
            || character == '|'
        )
            charactersToKeep.push_back(character);
    }

    if (charactersToKeep.size())
        rText = OUString(charactersToKeep.data(), charactersToKeep.size());
    else
        rText = OUString();
}
OUString SwNumRule::MakeNumString( const SwNumberTree::tNumberVector & rNumVector,
                                 const bool bInclStrings,
                                 const unsigned int _nRestrictToThisLevel,
                                 const bool bHideNonNumerical,
                                 SwNumRule::Extremities* pExtremities,
                                 LanguageType nLang ) const
{
    OUStringBuffer aStr;

    SwNumberTree::tNumberVector::size_type nLevel = rNumVector.size() - 1;

    if ( pExtremities )
        pExtremities->nPrefixChars = pExtremities->nSuffixChars = 0;

    if ( nLevel > _nRestrictToThisLevel )
    {
        nLevel = _nRestrictToThisLevel;
    }

    assert(nLevel < MAXLEVEL);

    const SwNumFormat& rMyNFormat = Get( o3tl::narrowing<sal_uInt16>(nLevel) );

    if (rMyNFormat.GetNumberingType() == SVX_NUM_NUMBER_NONE)
    {
        // since numbering is disabled for this level,
        // only emit prefix/suffix (unless they are not wanted either)
        if (!bInclStrings)
            return OUString();

        OUString sRet = rMyNFormat.GetPrefix() + rMyNFormat.GetSuffix();
        if (bHideNonNumerical)
            StripNonDelimiter(sRet);
        return sRet;
    }

    css::lang::Locale aLocale( LanguageTag::convertToLocale(nLang));

    if (rMyNFormat.HasListFormat())
    {
        OUString sLevelFormat = rMyNFormat.GetListFormat(bInclStrings && !bHideNonNumerical);

        if (bInclStrings && bHideNonNumerical) {
            OUString sPrefix = rMyNFormat.GetPrefix();
            OUString sSuffix = rMyNFormat.GetSuffix();

            StripNonDelimiter(sPrefix);
            StripNonDelimiter(sSuffix);

            sLevelFormat = sPrefix + sLevelFormat + sSuffix;
        }

        // In this case we are ignoring GetIncludeUpperLevels: we put all
        // level numbers requested by level format
        for (sal_Int32 nPosition{0}; nPosition < sLevelFormat.getLength() - 2;)
        {
            if (sLevelFormat[nPosition] != '%')
            {
                ++nPosition;
                continue;
            }
            SwNumberTree::tNumberVector::size_type nReplaceLevel;
            decltype(nPosition) nEndPosition;
            if (sLevelFormat[nPosition+1] == '1'
                && sLevelFormat[nPosition+2] == '0'
                && (nPosition+3) < sLevelFormat.getLength()
                && sLevelFormat[nPosition+3] == '%')
            {
                nReplaceLevel = 9; // special case %10%
                nEndPosition = nPosition + 4;
            }
            else if (sLevelFormat[nPosition+2] == '%'
                && '1' <= sLevelFormat[nPosition+1]
                && sLevelFormat[nPosition+1] <= '9')
            {
                nReplaceLevel = sLevelFormat[nPosition+1] - '1'; // need to subtract 1
                nEndPosition = nPosition + 3;
            }
            else
            {
                ++nPosition;
                continue; // ignore it
            }
            if (nLevel < nReplaceLevel)
            {
                nPosition = nEndPosition;
                // there is no number to insert - in this case Word 2013
                continue; // shows no label at all, we just skip it
            }

            SwNumFormat const& rNFormat{Get(nReplaceLevel)};

            if (rNFormat.GetNumberingType() == SVX_NUM_NUMBER_NONE)
            {
                // Numbering disabled - replacement is empty
                // And we should skip all level string content until next level marker:
                // so %1%.%2%.%3% with second level as NONE will result 1.1, not 1..1

                // NOTE: if changed, fix MSWordExportBase::NumberingLevel to match new behaviour.

                sal_Int32 const nPositionNext{sLevelFormat.indexOf('%', nEndPosition)};
                if (nPositionNext > nPosition)
                {
                    sLevelFormat = sLevelFormat.replaceAt(nPosition, nPositionNext - nPosition, u"");
                }
                continue;
            }

            OUString sReplacement;
            if (rNumVector[nReplaceLevel])
                sReplacement = rNFormat.GetNumStr(rNumVector[nReplaceLevel], aLocale, rMyNFormat.GetIsLegal());
            else
                sReplacement = "0";        // all 0 level are a 0

            sLevelFormat = sLevelFormat.replaceAt(nPosition, nEndPosition - nPosition, sReplacement);
            nPosition += sReplacement.getLength();

            if (bHideNonNumerical)
            {
                sal_Int32 const nPositionNext{sLevelFormat.indexOf('%', nPosition)};

                if (nPosition < nPositionNext)
                {
                    sal_Int32 nReplaceCount = nPositionNext - nPosition;

                    OUString sSeparator = sLevelFormat.copy(nPosition, nReplaceCount);
                    StripNonDelimiter(sSeparator);

                    sLevelFormat = sLevelFormat.replaceAt(nPosition, nReplaceCount, sSeparator);
                }
            }

        }

        aStr = sLevelFormat;
    }
    else
    {
        // Fallback case: level format is not defined
        // So use old way with levels joining by dot "."
        SwNumberTree::tNumberVector::size_type i = nLevel;

        if (!IsContinusNum() &&
            // - do not include upper levels, if level isn't numbered.
            rMyNFormat.GetNumberingType() != SVX_NUM_NUMBER_NONE &&
            rMyNFormat.GetIncludeUpperLevels())  // Just the own level?
        {
            sal_uInt8 n = rMyNFormat.GetIncludeUpperLevels();
            if (1 < n)
            {
                if (i + 1 >= n)
                    i -= n - 1;
                else
                    i = 0;
            }
        }

        for (; i <= nLevel; ++i)
        {
            const SwNumFormat& rNFormat = Get(i);
            if (SVX_NUM_NUMBER_NONE == rNFormat.GetNumberingType())
            {
                // Should 1.1.1 --> 2. NoNum --> 1..1 or 1.1 ??
                //                 if( i != rNum.nMyLevel )
                //                    aStr += ".";
                continue;
            }

            if (rNumVector[i])
                aStr.append(rNFormat.GetNumStr(rNumVector[i], aLocale, rMyNFormat.GetIsLegal()));
            else
                aStr.append("0");        // all 0 level are a 0
            if (i != nLevel && !aStr.isEmpty())
                aStr.append(".");
        }

        // The type doesn't have any number, so don't append
        // the post-/prefix string
        if (bInclStrings &&
            SVX_NUM_CHAR_SPECIAL != rMyNFormat.GetNumberingType() &&
            SVX_NUM_BITMAP != rMyNFormat.GetNumberingType())
        {
            OUString sPrefix = rMyNFormat.GetPrefix();
            OUString sSuffix = rMyNFormat.GetSuffix();

            if (bHideNonNumerical) {
                StripNonDelimiter(sPrefix);
                StripNonDelimiter(sSuffix);
            }

            aStr.insert(0, sPrefix);
            aStr.append(sSuffix);
            if (pExtremities)
            {
                pExtremities->nPrefixChars = sPrefix.getLength();
                pExtremities->nSuffixChars = sSuffix.getLength();
            }
        }
    }

    return aStr.makeStringAndClear();
}
int main(){
{SvxNumberFormat format;
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat();
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat();
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat();
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat();
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString(""));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString(""));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString(""));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString(""));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString(""));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("literal"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("literal"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("literal"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("literal"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("literal"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("tail%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("tail%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("tail%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("tail%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("tail%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%0%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%0%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%0%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%0%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%0%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("(%1%)"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("(%1%)"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("(%1%)"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("(%1%)"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("(%1%)"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%2%/%1%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%2%/%1%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%2%/%1%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%2%/%1%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%2%/%1%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%.%1%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%.%1%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%.%1%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%.%1%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%.%1%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("prefix%%a%2%?%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("prefix%%a%2%?%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("prefix%%a%2%?%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("prefix%%a%2%?%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("prefix%%a%2%?%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%10%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%10%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%10%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%10%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%10%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%11%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%11%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%11%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%11%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%11%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%x%3%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%x%3%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%x%3%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%x%3%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%x%3%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%x%1%abc%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%x%1%abc%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%x%1%abc%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%x%1%abc%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%x%1%abc%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%"));
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%"));
format.SetPrefix("P");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%"));
format.SetSuffix("S");
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%"));
format.nInclUpperLevels=7;
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.SetListFormat(OUString("%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%%1%"));
format.SetListFormat();
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=0;
format.SetListFormat("[","]",0);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=0;
format.SetListFormat("[","]",2);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=0;
format.SetListFormat("[","]",9);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=1;
format.SetListFormat("[","]",0);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=1;
format.SetListFormat("[","]",2);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=1;
format.SetListFormat("[","]",9);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=2;
format.SetListFormat("[","]",0);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=2;
format.SetListFormat("[","]",2);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=2;
format.SetListFormat("[","]",9);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=10;
format.SetListFormat("[","]",0);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=10;
format.SetListFormat("[","]",2);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=10;
format.SetListFormat("[","]",9);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=255;
format.SetListFormat("[","]",0);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=255;
format.SetListFormat("[","]",2);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SvxNumberFormat format;
format.nInclUpperLevels=255;
format.SetListFormat("[","]",9);
std::cout<<"["<<std::quoted(format.sPrefix.value)<<","<<std::quoted(format.sSuffix.value)<<","<<int(format.nInclUpperLevels)<<",";
if(format.HasListFormat())std::cout<<std::quoted(format.GetListFormat().value);else std::cout<<"null";
std::cout<<"]\n";}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString(""));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("literal"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("[%2%|%1%|%2%]"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%3%:%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%11%/%0%/%1%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%1%x%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({0,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=3;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[2].SetListFormat(OUString("%2%/%2%"));
rule.formats[0].type=1;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,0,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[9].nInclUpperLevels=0;
rule.formats[9].sPrefix="";
rule.formats[9].sSuffix="";
rule.formats[9].SetListFormat(OUString("%10%/%1%"));
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
rule.formats[3].type=0;
rule.formats[4].type=0;
rule.formats[5].type=0;
rule.formats[6].type=0;
rule.formats[7].type=0;
rule.formats[8].type=0;
rule.formats[9].type=0;
auto out=rule.MakeNumString({1,2,3,4,5,6,7,8,9,10},true,9,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
{SwNumRule rule;
rule.formats[2].nInclUpperLevels=0;
rule.formats[2].sPrefix="(";
rule.formats[2].sSuffix=")";
rule.formats[0].type=0;
rule.formats[1].type=0;
rule.formats[2].type=0;
auto out=rule.MakeNumString({2,3,4},true,2,false,nullptr,0);
std::cout<<std::quoted(out.value)<<'\n';}
}