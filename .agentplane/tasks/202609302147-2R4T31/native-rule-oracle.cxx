
#include <array>
#include <vector>
#include <string>
#include <memory>
#include <iostream>
#include <cstdint>
#include <cassert>
#include <concepts>
#include <climits>
using sal_Int16=int16_t; using sal_Int32=int32_t; using sal_Int64=int64_t;
using sal_uInt8=uint8_t; using sal_uInt16=uint16_t;
#define SAL_MIN_INT64 INT64_MIN
#define SAL_MAX_INT64 INT64_MAX
constexpr int MAXLEVEL=10,NUM_RULE=0;
template<typename I> constexpr bool isBetween(I n,sal_Int64 minimum,sal_Int64 maximum){return n>=minimum&&n<=maximum;}
template <std::integral I> constexpr sal_Int64 MulDiv(I n, sal_Int64 m, sal_Int64 d)
{
    assert(m > 0 && d > 0);
    assert(isBetween(n, (SAL_MIN_INT64 + d / 2) / m, (SAL_MAX_INT64 - d / 2) / m)
           && "maybe use convertSaturate in the caller");
    // coverity[dead_error_line] - suppress warning for template
    return (n >= 0 ? (n * m + d / 2) : (n * m - d / 2)) / d;
}

namespace o3tl {enum class Length {mm100,twip,in,in100};
template<std::integral I> long toTwips(I n,Length from){return from==Length::in100?MulDiv(n,1440,100):MulDiv(n,72,127);}
long toTwips(double n,Length from){assert(from==Length::in);return n*1440;}
template<typename T,typename U> T narrowing(U n){return static_cast<T>(n);}}
namespace tools {using Long=long;}
struct OUString {static std::string number(int n){return std::to_string(n);}};
struct SvxNumberFormat {enum Mode {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT}; enum Follow {LISTTAB,SPACE,NOTHING,NEWLINE};};
namespace numfunc {int GetBulletChar(int n){int mnLevelChars[MAXLEVEL];
        mnLevelChars[0] = 0x2022;
        mnLevelChars[1] = 0x25e6;
        mnLevelChars[2] = 0x25aa;
        mnLevelChars[3] = 0x2022;
        mnLevelChars[4] = 0x25e6;
        mnLevelChars[5] = 0x25aa;
        mnLevelChars[6] = 0x2022;
        mnLevelChars[7] = 0x25e6;
        mnLevelChars[8] = 0x25aa;
        mnLevelChars[9] = 0x2022;
return mnLevelChars[n];}}
struct SwNumFormat {
 int kind=0,bullet=0,include=1,start=1,suffix=0,mode=0,follow=0;
 long left=0,offset=0,distance=0,first=0,indent=0,tab=0;
 void SetIncludeUpperLevels(int n){include=n;} void SetStart(int n){start=n;}
 void SetPositionAndSpaceMode(int n){mode=n;} void SetLabelFollowedBy(int n){follow=n;}
 void SetListtabPos(long n){tab=n;} void SetFirstLineIndent(long n){first=n;}
 void SetIndentAt(long n){indent=n;} void SetListFormat(std::string){suffix=1;}
 void SetBulletChar(int n){bullet=n;} void SetAbsLSpace(long n){left=n;}
 void SetFirstLineOffset(long n){offset=n;} void SetCharTextDistance(long n){distance=static_cast<sal_Int16>(n);}
};
struct SwNumRule {
 static inline std::array<std::array<SwNumFormat*,MAXLEVEL>,1> saLabelAlignmentBaseFormats{};
 std::array<SwNumFormat,MAXLEVEL> formats;
 SwNumRule(){SwNumFormat* pFormat;sal_uInt8 n;
        const tools::Long cFirstLineIndent = o3tl::toTwips(-0.25, o3tl::Length::in);
        // indent values of general numbering in inch:
        const tools::Long cIndentAt[ MAXLEVEL ] = {
            o3tl::toTwips(50, o3tl::Length::in100),
            o3tl::toTwips(75, o3tl::Length::in100),
            o3tl::toTwips(100, o3tl::Length::in100),
            o3tl::toTwips(125, o3tl::Length::in100),
            o3tl::toTwips(150, o3tl::Length::in100),
            o3tl::toTwips(175, o3tl::Length::in100),
            o3tl::toTwips(200, o3tl::Length::in100),
            o3tl::toTwips(225, o3tl::Length::in100),
            o3tl::toTwips(250, o3tl::Length::in100),
            o3tl::toTwips(275, o3tl::Length::in100),
        };
        for( n = 0; n < MAXLEVEL; ++n )
        {
            pFormat = new SwNumFormat;
            pFormat->SetIncludeUpperLevels( 1 );
            pFormat->SetStart( 1 );
            pFormat->SetPositionAndSpaceMode( SvxNumberFormat::LABEL_ALIGNMENT );
            pFormat->SetLabelFollowedBy( SvxNumberFormat::LISTTAB );
            pFormat->SetListtabPos( cIndentAt[ n ] );
            pFormat->SetFirstLineIndent( cFirstLineIndent );
            pFormat->SetIndentAt( cIndentAt[ n ] );
            pFormat->SetListFormat( "%" + OUString::number(n + 1) + "%.");
            pFormat->SetBulletChar( numfunc::GetBulletChar(n));
            SwNumRule::saLabelAlignmentBaseFormats[ NUM_RULE ][ n ] = pFormat;
        }

 for(int i=0;i<MAXLEVEL;i++){formats[i]=*saLabelAlignmentBaseFormats[0][i];delete saLabelAlignmentBaseFormats[0][i];}}
 const SwNumFormat& Get(sal_uInt16 n) const{return formats.at(n);}
 void Set(sal_uInt16 n,const SwNumFormat& format){formats.at(n)=format;}
};
struct Exception {};
namespace lang {struct IllegalArgumentException:Exception {};}
struct PropertyValueAny {long n; template<typename T> void operator>>=(T& out)const{out=static_cast<T>(n);}};
struct Property {std::string Name;PropertyValueAny Value;};
const std::string UNO_NAME_LEFT_MARGIN="left",UNO_NAME_SYMBOL_TEXT_DISTANCE="distance",UNO_NAME_FIRST_LINE_OFFSET="offset",UNO_NAME_POSITION_AND_SPACE_MODE="mode",UNO_NAME_LABEL_FOLLOWED_BY="follow",UNO_NAME_LISTTAB_STOP_POSITION="tab",UNO_NAME_FIRST_LINE_INDENT="first",UNO_NAME_INDENT_AT="indent";
namespace LabelFollow {constexpr int LISTTAB=0,SPACE=1,NOTHING=2,NEWLINE=3;}
void SetPropertiesToNumFormat(SwNumFormat& aFormat,const std::vector<Property>& props){bool bWrongArg=false;
for(const auto& rProp:props){if(false){}
        else if (rProp.Name == UNO_NAME_LEFT_MARGIN)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            // #i23727# nValue can be negative
            aFormat.SetAbsLSpace(o3tl::toTwips(nValue, o3tl::Length::mm100));
        }
        else if (rProp.Name == UNO_NAME_SYMBOL_TEXT_DISTANCE)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            if (nValue >= 0)
                aFormat.SetCharTextDistance(o3tl::toTwips(nValue, o3tl::Length::mm100));
            else
                bWrongArg = true;
        }
        else if (rProp.Name == UNO_NAME_FIRST_LINE_OFFSET)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            // #i23727# nValue can be positive
            nValue = o3tl::toTwips(nValue, o3tl::Length::mm100);
            aFormat.SetFirstLineOffset(nValue);
        }
        else if (rProp.Name == UNO_NAME_POSITION_AND_SPACE_MODE)
        {
            sal_Int16 nValue = 0;
            rProp.Value >>= nValue;
            if ( nValue == 0 )
            {
                aFormat.SetPositionAndSpaceMode( SvxNumberFormat::LABEL_WIDTH_AND_POSITION );
            }
            else if ( nValue == 1 )
            {
                aFormat.SetPositionAndSpaceMode( SvxNumberFormat::LABEL_ALIGNMENT );
            }
            else
            {
                bWrongArg = true;
            }
        }
        else if (rProp.Name == UNO_NAME_LABEL_FOLLOWED_BY)
        {
            sal_Int16 nValue = 0;
            rProp.Value >>= nValue;
            if ( nValue == LabelFollow::LISTTAB )
            {
                aFormat.SetLabelFollowedBy( SvxNumberFormat::LISTTAB );
            }
            else if ( nValue == LabelFollow::SPACE )
            {
                aFormat.SetLabelFollowedBy( SvxNumberFormat::SPACE );
            }
            else if ( nValue == LabelFollow::NOTHING )
            {
                aFormat.SetLabelFollowedBy( SvxNumberFormat::NOTHING );
            }
            else if ( nValue == LabelFollow::NEWLINE )
            {
                aFormat.SetLabelFollowedBy( SvxNumberFormat::NEWLINE );
            }
            else
            {
                bWrongArg = true;
            }
        }
        else if (rProp.Name == UNO_NAME_LISTTAB_STOP_POSITION)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            nValue = o3tl::toTwips(nValue, o3tl::Length::mm100);
            if ( nValue >= 0 )
            {
                aFormat.SetListtabPos( nValue );
            }
            else
            {
                bWrongArg = true;
            }
        }
        else if (rProp.Name == UNO_NAME_FIRST_LINE_INDENT)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            nValue = o3tl::toTwips(nValue, o3tl::Length::mm100);
            aFormat.SetFirstLineIndent( nValue );
        }
        else if (rProp.Name == UNO_NAME_INDENT_AT)
        {
            sal_Int32 nValue = 0;
            rProp.Value >>= nValue;
            nValue = o3tl::toTwips(nValue, o3tl::Length::mm100);
            aFormat.SetIndentAt( nValue );
        }

else if(rProp.Name=="kind")aFormat.kind=rProp.Value.n;
else if(rProp.Name=="bullet")aFormat.bullet=rProp.Value.n;
else if(rProp.Name=="suffix")aFormat.suffix=rProp.Value.n;
}
if(bWrongArg)throw lang::IllegalArgumentException();
}
void replace(SwNumRule& rNumRule,const std::vector<Property>& properties,sal_Int32 nIndex){
 SwNumFormat aFormat(rNumRule.Get( o3tl::narrowing<sal_uInt16>(nIndex) ));
 SetPropertiesToNumFormat(aFormat,properties);
 rNumRule.Set(o3tl::narrowing<sal_uInt16>(nIndex), aFormat);
}
namespace beans {using PropertyValue=Property;}
template<typename T> using Sequence=std::vector<T>;
auto Any(const std::vector<Property>& props){return props;}
struct RulePort {SwNumRule rule;int getCount() const{return MAXLEVEL;}
void replaceByIndex(int n,const std::vector<Property>& props){replace(rule,props,n);}};
template<typename T>struct Reference {T* p;bool is()const{return p!=nullptr;} T* operator->()const{return p;}};
struct Level {int n;std::vector<Property> props;int GetLevel()const{return n;}
auto GetProperties()const{return props;}};
void fill(Reference<RulePort> rNumRule,const std::unique_ptr<std::vector<std::unique_ptr<Level>>>& m_pLevelStyles){
    try
    {
        if( m_pLevelStyles && rNumRule.is() )
        {
            sal_Int32 l_nLevels = rNumRule->getCount();
            for (const auto& pLevelStyle : *m_pLevelStyles)
            {
                sal_Int32 nLevel = pLevelStyle->GetLevel();
                if( nLevel >= 0 && nLevel < l_nLevels )
                {
                    Sequence<beans::PropertyValue> aProps =
                        pLevelStyle->GetProperties();
                    rNumRule->replaceByIndex( nLevel, Any(aProps) );
                }
            }
        }

    }
    catch (const Exception&) {}

}
int main(){int count;while(std::cin>>count){RulePort port;auto levels=std::make_unique<std::vector<std::unique_ptr<Level>>>();
for(int i=0;i<count;i++){int level,kind,bullet,distance,mode,left,offset,first,indent,tab,suffix;
std::cin>>level>>kind>>bullet>>distance>>mode>>left>>offset>>first>>indent>>tab>>suffix;
auto p=std::make_unique<Level>();p->n=level;
p->props={{"kind",{kind}},{"suffix",{suffix}},{"left",{left}},{"offset",{offset}},
{"distance",{static_cast<sal_Int16>(distance)}},{"mode",{mode}},{"follow",{0}},
{"first",{first}},{"indent",{indent}},{"tab",{tab}}};
if(kind==1)p->props.push_back({"bullet",{bullet}});levels->push_back(std::move(p));}
fill(Reference<RulePort>{&port},levels);
for(const auto& f:port.rule.formats)std::cout<<f.kind<<' '<<f.bullet<<' '<<f.suffix<<' '<<f.left<<' '<<f.offset<<' '<<f.distance<<' '<<f.first<<' '<<f.indent<<' '<<f.tab<<' '<<f.mode<<'\n';
}}
