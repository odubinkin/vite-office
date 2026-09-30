
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



#include <concepts>
#include <cassert>
#include <climits>
using sal_Int64=int64_t;
#define SAL_MIN_INT64 INT64_MIN
#define SAL_MAX_INT64 INT64_MAX
template<typename I> constexpr bool isBetween(I n,sal_Int64 minimum,sal_Int64 maximum) {return n>=minimum&&n<=maximum;}
template <std::integral I> constexpr sal_Int64 MulDiv(I n, sal_Int64 m, sal_Int64 d)
{
    assert(m > 0 && d > 0);
    assert(isBetween(n, (SAL_MIN_INT64 + d / 2) / m, (SAL_MAX_INT64 - d / 2) / m)
           && "maybe use convertSaturate in the caller");
    // coverity[dead_error_line] - suppress warning for template
    return (n >= 0 ? (n * m + d / 2) : (n * m - d / 2)) / d;
}

namespace o3tl {
sal_Int64 convert(sal_Int64 value, Length from, Length to) {
  assert(to==Length::cm);
  if(from==Length::twip) return ::MulDiv(value,127,72000);
  assert(from==Length::mm100);
  return ::MulDiv(value,1,1000);
}
}
struct OUStringBuffer {
  std::string value;
  void append(char c) {value+=c;}
  void append(sal_Int64 n) {value+=std::to_string(n);}
  void append(sal_Int32 n) {value+=std::to_string(n);}
  void appendAscii(const char* text,size_t count) {value.append(text,count);}
};
static constexpr std::string_view gpsMM="mm",gpsCM="cm",gpsPT="pt",gpsINCH="in";
class Converter {public: static void convertMeasure(OUStringBuffer&,sal_Int32,sal_Int16,sal_Int16);};
void Converter::convertMeasure( OUStringBuffer& rBuffer,
                                sal_Int32 nMeasure,
                                sal_Int16 nSourceUnit /* = MeasureUnit::MM_100TH */,
                                sal_Int16 nTargetUnit /* = MeasureUnit::INCH */  )
{
    if( nSourceUnit == MeasureUnit::PERCENT )
    {
        OSL_ENSURE( nTargetUnit == MeasureUnit::PERCENT,
                    "MeasureUnit::PERCENT only maps to MeasureUnit::PERCENT!" );

        rBuffer.append( nMeasure );
        rBuffer.append( '%' );

        return;
    }
    sal_Int64 nValue(nMeasure); // extend to 64-bit first to avoid overflow
    // the sign is processed separately
    if (nValue < 0)
    {
        nValue = -nValue;
        rBuffer.append( '-' );
    }

    o3tl::Length eFrom = o3tl::Length::in, eTo = o3tl::Length::in;
    int nFac = 100; // used to get specific number of decimals (2 by default)
    std::string_view psUnit;
    switch( nSourceUnit )
    {
    case MeasureUnit::TWIP:
        eFrom = o3tl::Length::twip;
        switch( nTargetUnit )
        {
        case MeasureUnit::MM_100TH:
        case MeasureUnit::MM_10TH:
            OSL_ENSURE( MeasureUnit::INCH == nTargetUnit,"output unit not supported for twip values" );
            [[fallthrough]];
        case MeasureUnit::MM:
            eTo = o3tl::Length::mm;
            nFac = 100;
            psUnit = gpsMM;
            break;

        case MeasureUnit::CM:
            eTo = o3tl::Length::cm;
            nFac = 1000;
            psUnit = gpsCM;
            break;

        case MeasureUnit::POINT:
            eTo = o3tl::Length::pt;
            nFac = 100;
            psUnit = gpsPT;
            break;

        case MeasureUnit::INCH:
        default:
            OSL_ENSURE( MeasureUnit::INCH == nTargetUnit,
                        "output unit not supported for twip values" );
            nFac = 10000;
            psUnit = gpsINCH;
            break;
        }
        break;

    case MeasureUnit::POINT:
        // 1pt = 1pt (exactly)
        OSL_ENSURE( MeasureUnit::POINT == nTargetUnit,
                    "output unit not supported for pt values" );
        eFrom = eTo = o3tl::Length::pt;
        nFac = 1;
        psUnit = gpsPT;
        break;
    case MeasureUnit::MM_10TH:
    case MeasureUnit::MM_100TH:
        {
            int nFac2 = (MeasureUnit::MM_100TH == nSourceUnit) ? 100 : 10;
            eFrom = Measure2O3tlUnit(nSourceUnit);
            switch( nTargetUnit )
            {
            case MeasureUnit::MM_100TH:
            case MeasureUnit::MM_10TH:
                OSL_ENSURE( MeasureUnit::INCH == nTargetUnit,
                            "output unit not supported for 1/100mm values" );
                [[fallthrough]];
            case MeasureUnit::MM:
                eTo = o3tl::Length::mm;
                nFac = nFac2;
                psUnit = gpsMM;
                break;

            case MeasureUnit::CM:
                eTo = o3tl::Length::cm;
                nFac = 10*nFac2;
                psUnit = gpsCM;
                break;

            case MeasureUnit::POINT:
                eTo = o3tl::Length::pt;
                nFac = nFac2;
                psUnit = gpsPT;
                break;

            case MeasureUnit::INCH:
            default:
                OSL_ENSURE( MeasureUnit::INCH == nTargetUnit,
                            "output unit not supported for 1/100mm values" );
                nFac = 100*nFac2;
                psUnit = gpsINCH;
                break;
            }
            break;
        }
    default:
        OSL_ENSURE(false, "sax::Converter::convertMeasure(): "
                "source unit not supported");
        break;
    }

    nValue = o3tl::convert(nValue * nFac, eFrom, eTo);

    rBuffer.append( static_cast<sal_Int64>(nValue / nFac) );
    if (nFac > 1 && (nValue % nFac) != 0)
    {
        rBuffer.append( '.' );
        while (nFac > 1 && (nValue % nFac) != 0)
        {
            nFac /= 10;
            rBuffer.append( static_cast<sal_Int32>((nValue / nFac) % 10) );
        }
    }

    if (psUnit.length() > 0)
        rBuffer.appendAscii(psUnit.data(), psUnit.length());
}

int main() {
  std::string line;
  while(std::getline(std::cin,line)) {
    std::istringstream stream(line);
    char kind; stream>>kind;
    if(kind=='E') {
      std::string unit; sal_Int32 value; stream>>unit>>value;
      OUStringBuffer buffer;
      Converter::convertMeasure(buffer,value,unit=="twip"?MeasureUnit::TWIP:MeasureUnit::MM_100TH,MeasureUnit::CM);
      std::cout<<buffer.value<<'\n';
    } else if(kind=='U') {
      sal_Int64 value; stream>>value;
      auto twips=MulDiv(value,72,127);
      std::cout<<twips<<' '<<MulDiv(twips,127,72)<<'\n';
    } else {
      sal_Int32 minimum,maximum,value=0; stream>>minimum>>maximum;
      std::string measure; std::getline(stream,measure); measure.erase(0,1);
      lcl_convertMeasure(value,std::string_view(measure),MeasureUnit::MM_100TH,minimum,maximum);
      std::cout<<value<<'\n';
    }
  }
}
