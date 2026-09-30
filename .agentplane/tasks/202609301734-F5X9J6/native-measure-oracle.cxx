
// Harness compiles unmodified pinned parser/measure functions. Only platform types and the existing unit targets are supplied.
#include <algorithm>
#include <cstdint>
#include <iostream>
#include <optional>
#include <sstream>
#include <string>
#include <string_view>
using sal_Int32=int32_t; using sal_Int16=int16_t; using sal_uInt32=uint32_t;
#define OSL_ENSURE(...)
namespace rtl { template<typename T> T toAsciiLowerCase(T c) {return c>='A'&&c<='Z'?c+32:c;} }
namespace MeasureUnit { enum {CM,INCH,MM,POINT,PICA,PIXEL,PERCENT,FONT_EM,FONT_CJK_ADVANCE,TWIP,MM_100TH,MM_10TH}; }
namespace o3tl {
 enum class Length {invalid,cm,in,mm,pt,pc,px,twip,mm100,mm10};
 double convert(double value,Length from,Length to) {
   double ratio=0;
   if(to==Length::twip) {
     switch(from) {case Length::cm:ratio=72000.0/127;break;case Length::in:ratio=1440;break;case Length::mm:ratio=7200.0/127;break;case Length::pt:ratio=20;break;case Length::pc:ratio=240;break;default:break;}
   } else if(to==Length::mm100) {
     switch(from) {case Length::cm:ratio=1000;break;case Length::in:ratio=2540;break;case Length::mm:ratio=100;break;case Length::pt:ratio=635.0/18;break;case Length::pc:ratio=1270.0/3;break;case Length::px:ratio=635.0/24;break;default:break;}
   }
   return value*ratio;
 }
}
o3tl::Length Measure2O3tlUnit(sal_Int16 unit) {return unit==MeasureUnit::TWIP?o3tl::Length::twip:o3tl::Length::mm100;}
template <typename V> bool wordEndsWith(V string, std::string_view expected)
{
    V substr = string.substr(0, expected.size());
    return std::equal(substr.begin(), substr.end(), expected.begin(), expected.end(),
                      [](sal_uInt32 c1, sal_uInt32 c2) { return rtl::toAsciiLowerCase(c1) == c2; })
           && (string.size() == expected.size() || string[expected.size()] == ' ');
}

template <class V> static std::optional<sal_Int16> lcl_parseMeasureUnit(const V& rString)
{
    if (rString.empty())
    {
        return std::nullopt;
    }

    switch (rtl::toAsciiLowerCase<sal_uInt32>(rString[0]))
    {
        case u'%':
            return MeasureUnit::PERCENT;

        case u'c':
            if (wordEndsWith(rString.substr(1), "m"))
                return MeasureUnit::CM;
            break;

        case u'e':
            if (wordEndsWith(rString.substr(1), "m"))
                return MeasureUnit::FONT_EM;
            break;

        case u'i':
            if (wordEndsWith(rString.substr(1), "c"))
                return MeasureUnit::FONT_CJK_ADVANCE;
            if (wordEndsWith(rString.substr(1), "n"))
                return MeasureUnit::INCH;
            break;

        case u'm':
            if (wordEndsWith(rString.substr(1), "m"))
                return MeasureUnit::MM;
            break;

        case u'p':
            if (wordEndsWith(rString.substr(1), "c"))
                return MeasureUnit::PICA;
            if (wordEndsWith(rString.substr(1), "t"))
                return MeasureUnit::POINT;
            if (wordEndsWith(rString.substr(1), "x"))
                return MeasureUnit::PIXEL;
            break;
    }

    return std::nullopt;
}

/** parse measure string into double and measure unit*/
template <class V>
static bool lcl_parseMeasure(double& rValue, std::optional<sal_Int16>& rSourceUnit, bool& rNeg, const V& rString)
{
    rValue = 0.0;
    rSourceUnit.reset();
    rNeg = false;

    bool bNeg = false;
    double nVal = 0;

    sal_Int32 nPos = 0;
    sal_Int32 const nLen = rString.size();

    // skip white space
    while( (nPos < nLen) && (rString[nPos] <= ' ') )
        nPos++;

    if( nPos < nLen && '-' == rString[nPos] )
    {
        bNeg = true;
        nPos++;
    }

    // get number
    while( nPos < nLen &&
           '0' <= rString[nPos] &&
           '9' >= rString[nPos] )
    {
        // TODO: check overflow!
        nVal *= 10;
        nVal += (rString[nPos] - '0');
        nPos++;
    }
    if( nPos < nLen && '.' == rString[nPos] )
    {
        nPos++;
        double nDiv = 1.;

        while( nPos < nLen &&
               '0' <= rString[nPos] &&
               '9' >= rString[nPos] )
        {
            // TODO: check overflow!
            nDiv *= 10;
            nVal += ( static_cast<double>(rString[nPos] - '0') / nDiv );
            nPos++;
        }
    }

    // skip white space
    while( (nPos < nLen) && (rString[nPos] <= ' ') )
        nPos++;

    if (nPos < nLen)
    {
        // Parse unit from the tail
        auto nUnit = lcl_parseMeasureUnit(rString.substr(nPos));
        if (!nUnit.has_value())
        {
            return false;
        }

        rSourceUnit = nUnit.value();
    }

    rValue = nVal;
    rNeg = bNeg;

    return true;
}

/** convert string to measure using optional min and max values*/
template <class V>
static bool lcl_convertMeasure(sal_Int32& rValue, const V& rString,
        sal_Int16 nTargetUnit /* = MeasureUnit::MM_100TH */,
        sal_Int32 nMin /* = SAL_MIN_INT32 */,
        sal_Int32 nMax /* = SAL_MAX_INT32 */)
{
    double nVal = 0.0;
    std::optional<sal_Int16> nSourceUnit;
    bool bNeg = false;

    if (!lcl_parseMeasure(nVal, nSourceUnit, bNeg, rString))
    {
        return false;
    }

    if (nSourceUnit.has_value())
    {
        if( MeasureUnit::PERCENT == nTargetUnit )
        {
            if (MeasureUnit::PERCENT != nSourceUnit)
                return false;
        }
        else if( MeasureUnit::PIXEL == nTargetUnit )
        {
            if (MeasureUnit::PIXEL != nSourceUnit)
                return false;
        }
        else
        {
            OSL_ENSURE( MeasureUnit::TWIP == nTargetUnit || MeasureUnit::POINT == nTargetUnit ||
                        MeasureUnit::MM_100TH == nTargetUnit || MeasureUnit::MM_10TH == nTargetUnit ||
                        MeasureUnit::PIXEL == nTargetUnit, "unit is not supported");

            o3tl::Length eFrom = o3tl::Length::invalid;

            if( MeasureUnit::TWIP == nTargetUnit )
            {
                switch (nSourceUnit.value())
                {
                    case MeasureUnit::CM:
                        eFrom = o3tl::Length::cm;
                        break;
                    case MeasureUnit::INCH:
                        eFrom = o3tl::Length::in;
                        break;
                    case MeasureUnit::MM:
                        eFrom = o3tl::Length::mm;
                        break;
                    case MeasureUnit::POINT:
                        eFrom = o3tl::Length::pt;
                        break;
                    case MeasureUnit::PICA:
                        eFrom = o3tl::Length::pc;
                        break;
                }
            }
            else if( MeasureUnit::MM_100TH == nTargetUnit || MeasureUnit::MM_10TH == nTargetUnit )
            {
                switch (nSourceUnit.value())
                {
                    case MeasureUnit::CM:
                        eFrom = o3tl::Length::cm;
                        break;
                    case MeasureUnit::INCH:
                        eFrom = o3tl::Length::in;
                        break;
                    case MeasureUnit::MM:
                        eFrom = o3tl::Length::mm;
                        break;
                    case MeasureUnit::POINT:
                        eFrom = o3tl::Length::pt;
                        break;
                    case MeasureUnit::PICA:
                        eFrom = o3tl::Length::pc;
                        break;
                    case MeasureUnit::PIXEL:
                        eFrom = o3tl::Length::px;
                        break;
                }
            }
            else if( MeasureUnit::POINT == nTargetUnit )
            {
                if (MeasureUnit::POINT == nSourceUnit)
                    eFrom = o3tl::Length::pt;
            }

            if (eFrom == o3tl::Length::invalid)
                return false;

            // TODO: check overflow
            nVal = o3tl::convert(nVal, eFrom, Measure2O3tlUnit(nTargetUnit));
        }
    }

    nVal += .5;
    if( bNeg )
        nVal = -nVal;

    if( nVal <= static_cast<double>(nMin) )
        rValue = nMin;
    else if( nVal >= static_cast<double>(nMax) )
        rValue = nMax;
    else
        rValue = static_cast<sal_Int32>(nVal);

    return true;
}


int main() {
 std::string line;
 while(std::getline(std::cin,line)) {
   std::istringstream stream(line); std::string target,hex; sal_Int32 min,max;
   stream>>target>>min>>max>>hex; std::string input;
   if(hex!="-")for(size_t i=0;i<hex.size();i+=2)input+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));
   sal_Int32 output=0;
   bool ok=lcl_convertMeasure(output,std::string_view(input),target=="twip"?MeasureUnit::TWIP:MeasureUnit::MM_100TH,min,max);
   std::cout<<(ok?std::to_string(output):"null")<<'\n';
 }
}
