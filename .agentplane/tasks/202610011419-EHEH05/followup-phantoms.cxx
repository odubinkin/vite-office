
#include <string>
#include <vector>
#include <optional>
#include <memory>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cassert>
#include <cstdint>
#include <climits>
using sal_uInt32=uint32_t;using sal_Int32=int32_t;using sal_Int16=int16_t;using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;using sal_UCS4=uint32_t;using SvxNumType=int;
constexpr int MAXLEVEL=10,NUM_RULE=1,OUTLINE_RULE=0,RULE_END=2,SVX_NUM_ARABIC=4,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_NUMBER_NONE=5,SVX_DEF_BULLET=0xF095,COL_BLACK=0;
using SwNumRuleType=int;
#define OSL_ENSURE(c,m) assert(c)
namespace tools {using Long=int64_t;}
// Named platform aliases: valid enum/default profiles, no native style registration, graphics or fonts except scalar font-family presence/equality.
namespace text::VertOrientation {constexpr int NONE=0;}
namespace o3tl {enum class Length {in,in100};template<typename T>constexpr tools::Long toTwips(T n,Length unit){return static_cast<tools::Long>(n*(unit==Length::in?1440:14.4));}}
namespace SvxAdjust {constexpr int Left=0;}
enum class SwPoolFormatId:sal_uInt16 {UNKNOWN=USHRT_MAX};
constexpr tools::Long lNumberIndent=360,lNumberFirstLineOffset=-360,lOutlineMinTextDistance=216;
namespace numfunc {sal_UCS4 GetBulletChar(sal_uInt8 n){constexpr int chars[]={0x2022,0x25e6,0x25aa};return chars[n%3];}}
struct SvxBrushItem {int value=0;bool operator==(const SvxBrushItem&)const=default;};
struct Size {int value=0;bool operator==(const Size&)const=default;};
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

bool operator==(const OUString&a,const OUString&b){return a.value==b.value;}
OUString operator""_ustr(const char16_t* s,size_t){return OUString(s);}
using UIName=OUString;

// Native service lifetime is not asserted by this format-value profile.
struct SvxNumberType { static inline int nRefCount=0; int nNumType; bool bShowSymbol; SvxNumberType(SvxNumType);SvxNumberType(const SvxNumberType&);
void            SetNumberingType(SvxNumType nSet) {nNumType = nSet;}
SvxNumType      GetNumberingType() const {return nNumType;}
void            SetShowSymbol(bool bSet) {bShowSymbol = bSet;}
bool            IsShowSymbol()const{return bShowSymbol;} };
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
// Named family-only ImplFont and COW platform adapter. Native other Font attributes/equality remain unverified.
struct ImplFont { OUString name; const OUString&GetFamilyName()const{return name;}void SetFamilyName(const OUString&s){name=s;} };
struct FontCow { std::shared_ptr<ImplFont> ptr=std::make_shared<ImplFont>();const ImplFont*operator->()const{return ptr.get();}ImplFont*operator->(){if(ptr.use_count()!=1)ptr=std::make_shared<ImplFont>(*ptr);return ptr.get();} };
namespace vcl {struct Font {using ImplType=FontCow;ImplType mpImplFont;Font();Font(const Font&);const OUString&GetFamilyName()const;void SetFamilyName(const OUString&);bool operator==(const Font&r)const{return GetFamilyName()==r.GetFamilyName();} };}
using vcl::Font;
Font::ImplType& GetGlobalDefault()
    {
        static Font::ImplType gDefault;
        return gDefault;
    }
Font::Font() : mpImplFont(GetGlobalDefault())
{
}
Font::Font( const vcl::Font& rFont ) : mpImplFont( rFont.mpImplFont )
{
}
void Font::SetFamilyName( const OUString& rFamilyName )
{
    if (GetFamilyName() != rFamilyName)
        mpImplFont->SetFamilyName( rFamilyName );
}
const OUString& Font::GetFamilyName() const { return mpImplFont->GetFamilyName(); }
struct SvxNumberFormat:SvxNumberType {
 enum SvxNumPositionAndSpaceMode {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT};enum {LISTTAB,NOTHING,SPACE};
 int eNumAdjust,nBulletRelSize,nBulletColor,eVertOrient;sal_uInt8 nInclUpperLevels;sal_uInt16 nStart;sal_UCS4 cBullet;
 SvxNumPositionAndSpaceMode mePositionAndSpaceMode;sal_Int32 nFirstLineOffset,nAbsLSpace;sal_Int16 nCharTextDistance;
 int meLabelFollowedBy;tools::Long mnListtabPos,mnFirstLineIndent,mnIndentAt;
 OUString sPrefix,sSuffix,sCharStyleName;std::optional<OUString>sListFormat;Size aGraphicSize;bool mbIsLegal=false;
 std::unique_ptr<SvxBrushItem>pGraphicBrush;std::optional<Font>pBulletFont;
 const std::optional<vcl::Font>& GetBulletFont() const { return pBulletFont; }
sal_UCS4        GetBulletChar()const {return cBullet;}
 SvxNumberFormat(SvxNumType);SvxNumberFormat(const SvxNumberFormat&);SvxNumberFormat&operator=(const SvxNumberFormat&);bool operator==(const SvxNumberFormat&)const;
 void SetBulletFont(const vcl::Font*);void SetPrefix(const OUString&);void SetSuffix(const OUString&);void SetListFormat(const OUString&,const OUString&,int);void SetListFormat(std::optional<OUString>);OUString GetListFormat(bool=true)const;
 void SetIncludeUpperLevels(int n){nInclUpperLevels=n;}void SetStart(int n){nStart=n;}void SetAbsLSpace(int n){nAbsLSpace=n;}void SetFirstLineOffset(int n){nFirstLineOffset=n;}
 void            SetBulletChar(sal_UCS4 cSet){cBullet = cSet;}void SetPositionAndSpaceMode(SvxNumPositionAndSpaceMode n){mePositionAndSpaceMode=n;}void SetLabelFollowedBy(int n){meLabelFollowedBy=n;}
 void SetListtabPos(int n){mnListtabPos=n;}void SetFirstLineIndent(int n){mnFirstLineIndent=n;}void SetIndentAt(int n){mnIndentAt=n;}void SetCharTextDistance(int n){nCharTextDistance=n;}
 const OUString&GetPrefix()const{return sPrefix;}const OUString&GetSuffix()const{return sSuffix;}int GetIncludeUpperLevels()const{return nInclUpperLevels;}int GetVertOrient()const{return eVertOrient;}
 bool HasListFormat()const{return sListFormat.has_value();}const SvxBrushItem*GetBrush()const{return pGraphicBrush.get();}const Size&GetGraphicSize()const{return aGraphicSize;}
 void SetGraphicBrush(const SvxBrushItem* brush,const Size* size,const sal_Int16* orient){assert(!brush);aGraphicSize=*size;eVertOrient=*orient;}
};
// Named native SwModify Add/Remove registration-container adapter, not the full native broadcaster lifetime.
struct SwModify;namespace sw {template<typename T>struct ClientBase {SwModify*m_pRegisteredIn;ClientBase(SwModify*p):m_pRegisteredIn(nullptr){Register(p);}SwModify*GetRegisteredInNonConst()const{return m_pRegisteredIn;}SwModify*GetRegisteredIn()const{return m_pRegisteredIn;}void Register(SwModify*);void StartListeningToSameModifyAs(const ClientBase&);void EndListeningAll();};}using SwClient=sw::ClientBase<int>;
struct SwModify {std::vector<SwClient*>clients;void Add(SwClient&c){if(c.m_pRegisteredIn==this)return;c.EndListeningAll();clients.push_back(&c);c.m_pRegisteredIn=this;}void Remove(SwClient&c){for(auto i=clients.begin();i!=clients.end();++i)if(*i==&c){clients.erase(i);break;}c.m_pRegisteredIn=nullptr;}};
template<typename T>void sw::ClientBase<T>::Register(SwModify*p){if(p)p->Add(*this);}
template<typename T>
void sw::ClientBase<T>::StartListeningToSameModifyAs(const sw::ClientBase<T>& other)
{
    if(other.m_pRegisteredIn)
        other.m_pRegisteredIn->Add(*this);
    else
        EndListeningAll();
}
template<typename T>
void sw::ClientBase<T>::EndListeningAll()
{
    if(m_pRegisteredIn)
        m_pRegisteredIn->Remove(*this);
}

struct Vertical {int value;Vertical(int,int n):value(n){}};
struct SwNumFormat:SvxNumberFormat,SwClient {
 Vertical m_aVertOrient;sal_uInt16 m_cGrfBulletCP;
 SwNumFormat();SwNumFormat(const SwNumFormat&);SwNumFormat&operator=(const SwNumFormat&);bool operator==(const SwNumFormat&)const;bool operator!=(const SwNumFormat&r)const{return !(*this==r);}
};
struct SwNumRule {
 void*mpNumRuleMap;UIName msName;SwNumRuleType meRuleType;SwPoolFormatId mnPoolFormatId;sal_uInt16 mnPoolHelpId;sal_uInt8 mnPoolHlpFileId;
 bool mbAutoRuleFlag,mbInvalidRuleFlag,mbContinusNum,mbAbsSpaces,mbHidden,mbCountPhantoms,mbUsedByRedline;
 SvxNumberFormat::SvxNumPositionAndSpaceMode meDefaultNumberFormatPositionAndSpaceMode;OUString msDefaultListId;
 std::unique_ptr<SwNumFormat> maFormats[MAXLEVEL];
 static inline sal_uInt16 snRefCount=0;static SwNumFormat*saBaseFormats[RULE_END][MAXLEVEL];static SwNumFormat*saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL];static const sal_uInt16 saDefNumIndents[MAXLEVEL];
 SwNumRule(UIName,SvxNumberFormat::SvxNumPositionAndSpaceMode,SwNumRuleType=NUM_RULE);SwNumRule(const SwNumRule&);
 const SwNumFormat&Get(sal_uInt16)const;const SwNumFormat*GetNumFormat(sal_uInt16)const;void Set(sal_uInt16,const SwNumFormat&);void Set(sal_uInt16,const SwNumFormat*);
 static sal_uInt16 GetNumIndent(sal_uInt8);bool IsHidden( ) const { return mbHidden; }
void SetHidden( bool bValue ) { mbHidden = bValue; }
bool IsAutoRule() const             { return mbAutoRuleFlag; }
void SetAutoRule( bool bFlag )      { mbAutoRuleFlag = bFlag; }
bool IsInvalidRule() const          { return mbInvalidRuleFlag; }
void Invalidate() { mbInvalidRuleFlag = true; }
bool IsContinusNum() const          { return mbContinusNum; }
void SetContinusNum( bool bFlag )   { mbContinusNum = bFlag; }
bool IsAbsSpaces() const            { return mbAbsSpaces; }
void SetAbsSpaces( bool bFlag )     { mbAbsSpaces = bFlag; }
bool IsCountPhantoms() const        { return mbCountPhantoms; }
bool IsUsedByRedline() const        { return mbUsedByRedline; }
void SetUsedByRedline(bool bUsed )  { mbUsedByRedline = bUsed; }
SwPoolFormatId GetPoolFormatId() const         { return mnPoolFormatId; }
void SetPoolFormatId( SwPoolFormatId nId )     { mnPoolFormatId = nId; }
sal_uInt16 GetPoolHelpId() const        { return mnPoolHelpId; }
void SetPoolHelpId( sal_uInt32 nId )    { mnPoolHelpId = nId; }
sal_uInt8 GetPoolHlpFileId() const      { return mnPoolHlpFileId; }
void SetPoolHlpFileId( sal_uInt8 nId )  { mnPoolHlpFileId = nId; }
SwNumRule&operator=(const SwNumRule&);void Reset(const UIName&);bool operator==(const SwNumRule&)const;void SetCountPhantoms(bool);std::vector<int>maTextNodeList,maParagraphStyleList;
};
SwNumFormat*SwNumRule::saBaseFormats[RULE_END][MAXLEVEL]={};SwNumFormat*SwNumRule::saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL]={};
const sal_uInt16 SwNumRule::saDefNumIndents[ MAXLEVEL ] = {
    o3tl::toTwips(25, o3tl::Length::in100),
    o3tl::toTwips(50, o3tl::Length::in100),
    o3tl::toTwips(75, o3tl::Length::in100),
    o3tl::toTwips(100, o3tl::Length::in100),
    o3tl::toTwips(125, o3tl::Length::in100),
    o3tl::toTwips(150, o3tl::Length::in100),
    o3tl::toTwips(175, o3tl::Length::in100),
    o3tl::toTwips(200, o3tl::Length::in100),
    o3tl::toTwips(225, o3tl::Length::in100),
    o3tl::toTwips(250, o3tl::Length::in100),
};SvxNumberFormat::SvxNumberFormat( SvxNumType eType )
    : SvxNumberType(eType),
      eNumAdjust(SvxAdjust::Left),
      nInclUpperLevels(1),
      nStart(1),
      cBullet(SVX_DEF_BULLET),
      nBulletRelSize(100),
      nBulletColor(COL_BLACK),
      mePositionAndSpaceMode( LABEL_WIDTH_AND_POSITION ),
      nFirstLineOffset(0),
      nAbsLSpace(0),
      nCharTextDistance(0),
      meLabelFollowedBy( LISTTAB ),
      mnListtabPos( 0 ),
      mnFirstLineIndent( 0 ),
      mnIndentAt( 0 ),
      eVertOrient(text::VertOrientation::NONE)
{
}

SvxNumberFormat::SvxNumberFormat(const SvxNumberFormat& rFormat) :
    SvxNumberType(rFormat),
    mePositionAndSpaceMode( rFormat.mePositionAndSpaceMode )
{
    *this = rFormat;
}

SvxNumberFormat& SvxNumberFormat::operator=( const SvxNumberFormat& rFormat )
{
    if (& rFormat == this) { return *this; }

    SvxNumberType::SetNumberingType(rFormat.GetNumberingType());
    eNumAdjust          = rFormat.eNumAdjust ;
    nInclUpperLevels    = rFormat.nInclUpperLevels ;
    nStart              = rFormat.nStart ;
    cBullet             = rFormat.cBullet ;
    mePositionAndSpaceMode = rFormat.mePositionAndSpaceMode;
    nFirstLineOffset    = rFormat.nFirstLineOffset;
    nAbsLSpace          = rFormat.nAbsLSpace ;
    nCharTextDistance   = rFormat.nCharTextDistance ;
    meLabelFollowedBy = rFormat.meLabelFollowedBy;
    mnListtabPos = rFormat.mnListtabPos;
    mnFirstLineIndent = rFormat.mnFirstLineIndent;
    mnIndentAt = rFormat.mnIndentAt;
    eVertOrient         = rFormat.eVertOrient;
    sPrefix             = rFormat.sPrefix;
    sSuffix             = rFormat.sSuffix;
    sListFormat         = rFormat.sListFormat;
    aGraphicSize        = rFormat.aGraphicSize  ;
    nBulletColor        = rFormat.nBulletColor   ;
    nBulletRelSize      = rFormat.nBulletRelSize;
    SetShowSymbol(rFormat.IsShowSymbol());
    sCharStyleName      = rFormat.sCharStyleName;
    pGraphicBrush.reset();
    if(rFormat.pGraphicBrush)
    {
        pGraphicBrush.reset( new SvxBrushItem(*rFormat.pGraphicBrush) );
    }
    pBulletFont.reset();
    if(rFormat.pBulletFont)
        pBulletFont = *rFormat.pBulletFont;
    mbIsLegal = rFormat.mbIsLegal;
    return *this;
}

bool  SvxNumberFormat::operator==( const SvxNumberFormat& rFormat) const
{
    if( GetNumberingType()  != rFormat.GetNumberingType() ||
        eNumAdjust          != rFormat.eNumAdjust ||
        nInclUpperLevels    != rFormat.nInclUpperLevels ||
        nStart              != rFormat.nStart ||
        cBullet             != rFormat.cBullet ||
        mePositionAndSpaceMode != rFormat.mePositionAndSpaceMode ||
        nFirstLineOffset    != rFormat.nFirstLineOffset ||
        nAbsLSpace          != rFormat.nAbsLSpace ||
        nCharTextDistance   != rFormat.nCharTextDistance ||
        meLabelFollowedBy != rFormat.meLabelFollowedBy ||
        mnListtabPos != rFormat.mnListtabPos ||
        mnFirstLineIndent != rFormat.mnFirstLineIndent ||
        mnIndentAt != rFormat.mnIndentAt ||
        eVertOrient         != rFormat.eVertOrient ||
        sPrefix             != rFormat.sPrefix     ||
        sSuffix             != rFormat.sSuffix     ||
        sListFormat         != rFormat.sListFormat ||
        aGraphicSize        != rFormat.aGraphicSize  ||
        nBulletColor        != rFormat.nBulletColor   ||
        nBulletRelSize      != rFormat.nBulletRelSize ||
        IsShowSymbol()      != rFormat.IsShowSymbol() ||
        sCharStyleName      != rFormat.sCharStyleName ||
        mbIsLegal           != rFormat.mbIsLegal
        )
        return false;
    if (
        (pGraphicBrush && !rFormat.pGraphicBrush) ||
        (!pGraphicBrush && rFormat.pGraphicBrush) ||
        (pGraphicBrush && *pGraphicBrush != *rFormat.pGraphicBrush)
       )
    {
        return false;
    }
    if (
        (pBulletFont && !rFormat.pBulletFont) ||
        (!pBulletFont && rFormat.pBulletFont) ||
        (pBulletFont && *pBulletFont != *rFormat.pBulletFont)
       )
    {
        return false;
    }
    return true;
}

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

SwNumFormat::SwNumFormat() :
    SvxNumberFormat(SVX_NUM_ARABIC),
    SwClient( nullptr ),
    m_aVertOrient( 0, text::VertOrientation::NONE )
    ,m_cGrfBulletCP(USHRT_MAX)//For i120928,record the cp info of graphic within bullet
{
}

SwNumFormat::SwNumFormat( const SwNumFormat& rFormat) :
    SvxNumberFormat(rFormat),
    SwClient( rFormat.GetRegisteredInNonConst() ),
    m_aVertOrient( 0, rFormat.GetVertOrient() )
    ,m_cGrfBulletCP(rFormat.m_cGrfBulletCP)//For i120928,record the cp info of graphic within bullet
{
    sal_Int16 eMyVertOrient = rFormat.GetVertOrient();
    SetGraphicBrush( rFormat.GetBrush(), &rFormat.GetGraphicSize(),
                                                &eMyVertOrient);
}

SwNumFormat& SwNumFormat::operator=( const SwNumFormat& rNumFormat)
{
    SvxNumberFormat::operator=(rNumFormat);
    StartListeningToSameModifyAs(rNumFormat);
    //For i120928,record the cp info of graphic within bullet
    m_cGrfBulletCP = rNumFormat.m_cGrfBulletCP;
    return *this;
}

bool SwNumFormat::operator==( const SwNumFormat& rNumFormat) const
{
    bool bRet = SvxNumberFormat::operator==(rNumFormat) &&
        GetRegisteredIn() == rNumFormat.GetRegisteredIn();
    return bRet;
}

sal_uInt16 SwNumRule::GetNumIndent( sal_uInt8 nLvl )
{
    OSL_ENSURE( MAXLEVEL > nLvl, "NumLevel is out of range" );
    return saDefNumIndents[ nLvl ];
}

SwNumRule::SwNumRule( UIName aNm,
                      const SvxNumberFormat::SvxNumPositionAndSpaceMode eDefaultNumberFormatPositionAndSpaceMode,
                      SwNumRuleType eType )
  : mpNumRuleMap(nullptr),
    msName( std::move(aNm) ),
    meRuleType( eType ),
    mnPoolFormatId( SwPoolFormatId::UNKNOWN ),
    mnPoolHelpId( USHRT_MAX ),
    mnPoolHlpFileId( UCHAR_MAX ),
    mbAutoRuleFlag( true ),
    mbInvalidRuleFlag( true ),
    mbContinusNum( false ),
    mbAbsSpaces( false ),
    mbHidden( false ),
    mbCountPhantoms( true ),
    mbUsedByRedline( false ),
    meDefaultNumberFormatPositionAndSpaceMode( eDefaultNumberFormatPositionAndSpaceMode )
{
    if( !snRefCount++ )          // for the first time, initialize
    {
        SwNumFormat* pFormat;
        sal_uInt8 n;

        // numbering:
        // position-and-space mode LABEL_WIDTH_AND_POSITION:
        for( n = 0; n < MAXLEVEL; ++n )
        {
            pFormat = new SwNumFormat;
            pFormat->SetIncludeUpperLevels( 1 );
            pFormat->SetStart( 1 );
            pFormat->SetAbsLSpace( lNumberIndent + SwNumRule::GetNumIndent( n ) );
            pFormat->SetFirstLineOffset( lNumberFirstLineOffset );
            pFormat->SetListFormat("%" + OUString::number(n + 1) + "%.");
            pFormat->SetBulletChar(numfunc::GetBulletChar(n));
            SwNumRule::saBaseFormats[ NUM_RULE ][ n ] = pFormat;
        }
        // position-and-space mode LABEL_ALIGNMENT
        // first line indent of general numbering in inch: -0,25 inch
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

        // outline:
        // position-and-space mode LABEL_WIDTH_AND_POSITION:
        for( n = 0; n < MAXLEVEL; ++n )
        {
            pFormat = new SwNumFormat;
            pFormat->SetNumberingType(SVX_NUM_NUMBER_NONE);
            pFormat->SetIncludeUpperLevels( MAXLEVEL );
            pFormat->SetStart( 1 );
            pFormat->SetCharTextDistance( lOutlineMinTextDistance );
            pFormat->SetBulletChar( numfunc::GetBulletChar(n));
            SwNumRule::saBaseFormats[ OUTLINE_RULE ][ n ] = pFormat;
        }
        // position-and-space mode LABEL_ALIGNMENT:
        for( n = 0; n < MAXLEVEL; ++n )
        {
            pFormat = new SwNumFormat;
            pFormat->SetNumberingType(SVX_NUM_NUMBER_NONE);
            // SVX_NUM_NUMBER_NONE with the default SvxNumberFormat::LISTTAB would lead to an
            // unexpected leading tab for the DocumentSettingId::NO_NUMBERING_SHOW_FOLLOWBY case.
            pFormat->SetLabelFollowedBy(SvxNumberFormat::NOTHING);
            pFormat->SetIncludeUpperLevels( MAXLEVEL );
            pFormat->SetStart( 1 );
            pFormat->SetPositionAndSpaceMode( SvxNumberFormat::LABEL_ALIGNMENT );
            pFormat->SetBulletChar( numfunc::GetBulletChar(n));
            SwNumRule::saLabelAlignmentBaseFormats[ OUTLINE_RULE ][ n ] = pFormat;
        }
    }
    OSL_ENSURE( !msName.isEmpty(), "NumRule without a name!" );
}

SwNumRule::SwNumRule( const SwNumRule& rNumRule )
    : mpNumRuleMap(nullptr),
      msName( rNumRule.msName ),
      meRuleType( rNumRule.meRuleType ),
      mnPoolFormatId( rNumRule.GetPoolFormatId() ),
      mnPoolHelpId( rNumRule.GetPoolHelpId() ),
      mnPoolHlpFileId( rNumRule.GetPoolHlpFileId() ),
      mbAutoRuleFlag( rNumRule.mbAutoRuleFlag ),
      mbInvalidRuleFlag( true ),
      mbContinusNum( rNumRule.mbContinusNum ),
      mbAbsSpaces( rNumRule.mbAbsSpaces ),
      mbHidden( rNumRule.mbHidden ),
      mbCountPhantoms( true ),
      mbUsedByRedline( false ),
      meDefaultNumberFormatPositionAndSpaceMode( rNumRule.meDefaultNumberFormatPositionAndSpaceMode ),
      msDefaultListId( rNumRule.msDefaultListId )
{
    ++snRefCount;
    for( sal_uInt16 n = 0; n < MAXLEVEL; ++n )
        if( rNumRule.maFormats[ n ] )
            Set( n, *rNumRule.maFormats[ n ] );
}

const SwNumFormat& SwNumRule::Get( sal_uInt16 i ) const
{
    assert( i < MAXLEVEL && meRuleType < RULE_END );
    return maFormats[ i ]
           ? *maFormats[ i ]
           : ( meDefaultNumberFormatPositionAndSpaceMode == SvxNumberFormat::LABEL_WIDTH_AND_POSITION
               ? *saBaseFormats[ meRuleType ][ i ]
               : *saLabelAlignmentBaseFormats[ meRuleType ][ i ] );
}

const SwNumFormat* SwNumRule::GetNumFormat( sal_uInt16 i ) const
{
    const SwNumFormat * pResult = nullptr;

    assert( i < MAXLEVEL && meRuleType < RULE_END );
    if ( i < MAXLEVEL && meRuleType < RULE_END)
    {
        pResult = maFormats[ i ].get();
    }

    return pResult;
}

void SwNumRule::Set( sal_uInt16 i, const SwNumFormat& rNumFormat )
{
    OSL_ENSURE( i < MAXLEVEL, "Serious defect" );
    if( i < MAXLEVEL )
    {
        if( !maFormats[ i ] || (rNumFormat != Get( i )) )
        {
            maFormats[ i ].reset(new SwNumFormat( rNumFormat ));
            mbInvalidRuleFlag = true;
        }
    }
}


void SvxNumberFormat::SetBulletFont(const vcl::Font* pFont)
{
    if (pFont)
        pBulletFont = *pFont;
    else
        pBulletFont.reset();
}
void SwNumRule::Set( sal_uInt16 i, const SwNumFormat* pNumFormat )
{
    OSL_ENSURE( i < MAXLEVEL, "Serious defect" );
    if( i >= MAXLEVEL )
        return;
    if( !maFormats[ i ] )
    {
        if( pNumFormat )
        {
            maFormats[ i ].reset(new SwNumFormat( *pNumFormat ));
            mbInvalidRuleFlag = true;
        }
    }
    else if( !pNumFormat )
    {
        maFormats[ i ].reset();
        mbInvalidRuleFlag = true;
    }
    else if( *maFormats[i] != *pNumFormat )
    {
        *maFormats[ i ] = *pNumFormat;
        mbInvalidRuleFlag = true;
    }
}

SwNumRule& SwNumRule::operator=( const SwNumRule& rNumRule )
{
    if( this != &rNumRule )
    {
        for( sal_uInt16 n = 0; n < MAXLEVEL; ++n )
            Set( n, rNumRule.maFormats[ n ].get() );

        meRuleType = rNumRule.meRuleType;
        msName = rNumRule.msName;
        mbAutoRuleFlag = rNumRule.mbAutoRuleFlag;
        mbInvalidRuleFlag = true;
        mbContinusNum = rNumRule.mbContinusNum;
        mbAbsSpaces = rNumRule.mbAbsSpaces;
        mbHidden = rNumRule.mbHidden;
        mnPoolFormatId = rNumRule.GetPoolFormatId();
        mnPoolHelpId = rNumRule.GetPoolHelpId();
        mnPoolHlpFileId = rNumRule.GetPoolHlpFileId();
    }
    return *this;
}
void SwNumRule::Reset( const UIName& rName )
{
    for( sal_uInt16 n = 0; n < MAXLEVEL; ++n )
        Set( n, nullptr);

    meRuleType = NUM_RULE;
    msName = rName;
    mbAutoRuleFlag = true;
    mbInvalidRuleFlag = true;
    mbContinusNum = false;
    mbAbsSpaces = false;
    mbHidden = false;
    mnPoolFormatId = SwPoolFormatId::UNKNOWN;
    mnPoolHelpId = USHRT_MAX;
    mnPoolHlpFileId = UCHAR_MAX;
}
bool SwNumRule::operator==( const SwNumRule& rRule ) const
{
    bool bRet = meRuleType == rRule.meRuleType &&
                msName == rRule.msName &&
                mbAutoRuleFlag == rRule.mbAutoRuleFlag &&
                mbContinusNum == rRule.mbContinusNum &&
                mbAbsSpaces == rRule.mbAbsSpaces &&
                mnPoolFormatId == rRule.GetPoolFormatId() &&
                mnPoolHelpId == rRule.GetPoolHelpId() &&
                mnPoolHlpFileId == rRule.GetPoolHlpFileId();
    if( bRet )
    {
        for( sal_uInt8 n = 0; n < MAXLEVEL; ++n )
            if( rRule.Get( n ) != Get( n ) )
            {
                bRet = false;
                break;
            }
    }
    return bRet;
}
void SwNumRule::SetCountPhantoms(bool bCountPhantoms)
{
    mbCountPhantoms = bCountPhantoms;
}
void boolout(bool v){std::cout<<(v?"true":"false");}
void state(const SvxNumberFormat&f){std::cout<<"["<<f.GetNumberingType()<<",";boolout(f.IsShowSymbol());std::cout<<","<<f.GetBulletChar()<<",";boolout(f.GetBulletFont().has_value());std::cout<<",\""<<(f.GetBulletFont()?f.GetBulletFont()->GetFamilyName().value:"")<<"\","<<int(f.nStart)<<","<<int(f.nInclUpperLevels)<<","<<f.nAbsLSpace<<","<<f.nFirstLineOffset<<","<<f.nCharTextDistance<<","<<f.mnFirstLineIndent<<","<<f.mnIndentAt<<","<<f.mnListtabPos<<","<<f.meLabelFollowedBy<<","<<f.mePositionAndSpaceMode<<",\""<<f.sPrefix.value<<"\",\""<<f.sSuffix.value<<"\",";boolout(f.HasListFormat());std::cout<<",\""<<(f.HasListFormat()?f.GetListFormat().value:"")<<"\"]";}


#define OSL_FAIL(m) ((void)0)
struct SwNodeNum {SwNumRule*mpNumRule;bool IsCountPhantoms()const;};
bool SwNodeNum::IsCountPhantoms() const
{
    bool bResult = true;

    // #i64311#
    // phantoms aren't counted in consecutive numbering rules
    if ( mpNumRule )
        bResult = !mpNumRule->IsContinusNum() &&
                  mpNumRule->IsCountPhantoms();
    else
    {
        OSL_FAIL( "<SwNodeNum::IsCountPhantoms(): missing numbering rule" );
    }

    return bResult;
}
int main(){std::cout<<"[";bool comma=false;for(bool continuous:{false,true})for(bool phantoms:{false,true}){SwNumRule r("probe",SvxNumberFormat::LABEL_ALIGNMENT);r.SetContinusNum(continuous);r.SetCountPhantoms(phantoms);SwNodeNum node{&r};if(comma)std::cout<<",";comma=true;std::cout<<"[";boolout(continuous);std::cout<<",";boolout(phantoms);std::cout<<",";boolout(node.IsCountPhantoms());std::cout<<"]";}SwNodeNum root{nullptr};std::cout<<",[null,null,";boolout(root.IsCountPhantoms());std::cout<<"]]";}
