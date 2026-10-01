#include <cassert>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;using sal_Int64=int64_t;
#define SAL_CONST_INT64(x) x##LL
#define SAL_WARN_IF(...) ((void)0)
#define XMLOFF_WARN_UNKNOWN(...) ((void)0)
#define SAL_CALL
#define getenv(...) nullptr
namespace tools{using Long=long;}
struct OUString {std::string value;OUString()=default;OUString(std::string v):value(v){}OUString(const char*v):value(v){}bool isEmpty()const{return value.empty();}void clear(){value.clear();}static OUString number(sal_Int64 n){return OUString(std::to_string(n));}bool operator==(const OUString&r)const{return value==r.value;}bool operator!=(const OUString&r)const{return value!=r.value;}bool operator<(const OUString&r)const{return value<r.value;}OUString&operator+=(const OUString&r){value+=r.value;return *this;}};
OUString operator+(const OUString&a,const OUString&b){return OUString(a.value+b.value);}OUString operator""_ustr(const char16_t*s,size_t n){std::string v;for(size_t i=0;i<n;++i)v.push_back(static_cast<char>(s[i]));return OUString(v);}const OUString EMPTY_OUSTRING;
struct DateTime{enum{SYSTEM};DateTime(int){}sal_Int64 GetTime(){return 123456789000000LL;}sal_uInt32 GetDateUnsigned(){return 20261001;}};
template<class T>struct Reference{T*p=nullptr;Reference()=default;Reference(T*v):p(v){}template<class U>Reference(const Reference<U>&v,int):p(static_cast<T*>(v.p)){}bool is()const{return p!=nullptr;}T*get()const{return p;}T*operator->()const{return p;}Reference&operator=(T*v){p=v;return *this;}};constexpr int UNO_QUERY=0;
struct Any{OUString value;bool operator>>=(OUString&out)const{out=value;return true;}};
namespace beans{struct XPropertySet{bool present;OUString defaultId;XPropertySet*getPropertySetInfo(){return this;}bool hasPropertyByName(const OUString&){return present;}Any getPropertyValue(const OUString&){return {defaultId};}};using XPropertySetInfo=XPropertySet;}
namespace container{struct XIndexReplace:beans::XPropertySet{};}
namespace uno{using ::Reference;struct Exception{};}
enum XMLTokenEnum{XML_ID,XML_CONTINUE_NUMBERING,XML_STYLE_NAME,XML_CONTINUE_LIST,XML_TRUE};
#define XML_ELEMENT(ns,tok) tok
struct Attribute{XMLTokenEnum token;OUString value;int getToken()const{return token;}OUString toString()const{return value;}};
namespace xml::sax{using XFastAttributeList=std::vector<Attribute>;}
namespace sax_fastparser{xml::sax::XFastAttributeList&castToFastAttributeList(const Reference<xml::sax::XFastAttributeList>&a){return *a.p;}}
bool IsXMLToken(const Attribute&a,XMLTokenEnum){return a.value==OUString("true");}
class XMLTextListBlockContext;class XMLTextListsHelper;
struct XMLTextListItemContext{};struct XMLNumberedParaContext{};
struct SvXMLImport{std::map<OUString,container::XIndexReplace>rules;bool getBuildIds(sal_Int32&,sal_Int32&){return false;}bool IsTextDocInOOoFileFormat(){return false;}bool IsMSO(){return false;}};
struct SvXMLImportContext{SvXMLImport&import;SvXMLImportContext(SvXMLImport&i):import(i){}SvXMLImport&GetImport(){return import;}};
struct XMLTextImportHelper{XMLTextListsHelper*helper;XMLTextListsHelper&GetTextListHelper(){return *helper;}};
class XMLTextListsHelper{public:
 using tMapForLists=std::map<OUString,std::pair<OUString,OUString>>;std::unique_ptr<tMapForLists>mpProcessedLists,mpMapListIdToListStyleDefaultListId;std::unique_ptr<std::map<OUString,OUString>>mpStyleNameLastListIds;OUString msLastProcessedListId,msListStyleOfLastProcessedList;std::vector<XMLTextListBlockContext*>stack;
 void PushListContext(XMLTextListBlockContext*b){stack.push_back(b);}void PopListContext(){stack.pop_back();}void SetListItem(XMLTextListItemContext*){}void ListContextTop(XMLTextListBlockContext*&b,XMLTextListItemContext*&,XMLNumberedParaContext*&){if(!stack.empty())b=stack.back();}
 void KeepListAsProcessed(const OUString&,const OUString&,const OUString&,const OUString& value=EMPTY_OUSTRING);bool IsListProcessed(const OUString&)const;const OUString&GetListStyleOfProcessedList(const OUString&)const;const OUString&GetContinueListIdOfProcessedList(const OUString&)const;const OUString&GetLastProcessedListId()const{return msLastProcessedListId;}const OUString&GetListStyleOfLastProcessedList()const{return msListStyleOfLastProcessedList;}OUString GenerateNewListId()const;OUString GetListIdForListBlock(const XMLTextListBlockContext&);OUString GetLastIdOfStyleName(const OUString&)const;
 static Reference<container::XIndexReplace>MakeNumRule(SvXMLImport&i,const Reference<container::XIndexReplace>&,const OUString&,const OUString&style,sal_Int16&,bool*,bool*){return &i.rules.at(style);}
};
class XMLTextListBlockContext:public SvXMLImportContext{XMLTextImportHelper&mrTxtImport;Reference<container::XIndexReplace>mxNumRules;OUString msListStyleName;Reference<XMLTextListBlockContext>mxParentListBlock;sal_Int16 mnLevel;bool mbRestartNumbering,mbSetDefaults;OUString msListId,msContinueListId;
 public:XMLTextListBlockContext(SvXMLImport&,XMLTextImportHelper&,const Reference<xml::sax::XFastAttributeList>&,bool=false);void endFastElement(sal_Int32);
sal_Int16 GetLevel() const { return mnLevel; }
bool IsRestartNumbering() const { return mbRestartNumbering; }
void ResetRestartNumbering() { mbRestartNumbering = false; }
const Reference < container::XIndexReplace >& GetNumRules() const
        { return mxNumRules; }
const OUString& GetListId() const { return msListId;}
const OUString& GetContinueListId() const { return msContinueListId;}
};
XMLTextListBlockContext::XMLTextListBlockContext(
        SvXMLImport& rImport,
        XMLTextImportHelper& rTxtImp,
        const Reference< xml::sax::XFastAttributeList > & xAttrList,
        const bool bRestartNumberingAtSubList )
:   SvXMLImportContext( rImport )
,   mrTxtImport( rTxtImp )
,   mnLevel( 0 )
,   mbRestartNumbering( false )
,   mbSetDefaults( false )
{
    static constexpr OUString s_PropNameDefaultListId = u"DefaultListId"_ustr;
    {
        // get the parent list block context (if any); this is a bit ugly...
        XMLTextListBlockContext * pLB(nullptr);
        XMLTextListItemContext  * pLI(nullptr);
        XMLNumberedParaContext  * pNP(nullptr);
        rTxtImp.GetTextListHelper().ListContextTop(pLB, pLI, pNP);
        mxParentListBlock = pLB;
    }
    // Inherit style name from parent list, as well as the flags whether
    // numbering must be restarted and formats have to be created.
    OUString sParentListStyleName;
    if( mxParentListBlock.is() )
    {
        XMLTextListBlockContext *pParent = mxParentListBlock.get();
        msListStyleName = pParent->msListStyleName;
        sParentListStyleName = msListStyleName;
        mxNumRules = pParent->GetNumRules();
        mnLevel = pParent->GetLevel() + 1;
        mbRestartNumbering = pParent->IsRestartNumbering() ||
                             bRestartNumberingAtSubList;
        mbSetDefaults = pParent->mbSetDefaults;
        msListId = pParent->GetListId();
        msContinueListId = pParent->GetContinueListId();
    }

    bool bIsContinueNumberingAttributePresent( false );
    for( auto& aIter : sax_fastparser::castToFastAttributeList(xAttrList) )
    {
        switch( aIter.getToken() )
        {
        case XML_ELEMENT(XML, XML_ID):
//FIXME: there is no UNO API for lists
            // xml:id is also the list ID (#i92221#)
            if ( mnLevel == 0 ) // root <list> element
            {
                msListId = aIter.toString();
            }
            break;
        case XML_ELEMENT(TEXT, XML_CONTINUE_NUMBERING):
            mbRestartNumbering = !IsXMLToken(aIter, XML_TRUE);
            bIsContinueNumberingAttributePresent = true;
            break;
        case XML_ELEMENT(TEXT, XML_STYLE_NAME):
            msListStyleName = aIter.toString();
            break;
        case XML_ELEMENT(TEXT, XML_CONTINUE_LIST):
            if ( mnLevel == 0 ) // root <list> element
            {
                msContinueListId = aIter.toString();
            }
            break;
        default:
            XMLOFF_WARN_UNKNOWN("xmloff", aIter);
        }
    }

    // Remember this list block.
    mrTxtImport.GetTextListHelper().PushListContext( this );
    try
    {
        mxNumRules = XMLTextListsHelper::MakeNumRule(GetImport(), mxNumRules,
            sParentListStyleName, msListStyleName,
            mnLevel, &mbRestartNumbering, &mbSetDefaults );
        if( !mxNumRules.is() )
            return;

        if ( mnLevel != 0 ) // root <list> element
            return;

        XMLTextListsHelper& rTextListsHelper( mrTxtImport.GetTextListHelper() );
        // Inconsistent behavior regarding lists (#i92811#)
        OUString sListStyleDefaultListId;
        {
            uno::Reference< beans::XPropertySet > xNumRuleProps( mxNumRules, UNO_QUERY );
            if ( xNumRuleProps.is() )
            {
                uno::Reference< beans::XPropertySetInfo > xNumRulePropSetInfo(
                                            xNumRuleProps->getPropertySetInfo());
                if (xNumRulePropSetInfo.is() &&
                    xNumRulePropSetInfo->hasPropertyByName(
                         s_PropNameDefaultListId))
                {
                    xNumRuleProps->getPropertyValue(s_PropNameDefaultListId)
                        >>= sListStyleDefaultListId;
                    SAL_WARN_IF( sListStyleDefaultListId.isEmpty(), "xmloff",
                                "no default list id found at numbering rules instance. Serious defect." );
                }
            }
        }
        if ( msListId.isEmpty() )  // no text:id property found
        {
            sal_Int32 nUPD( 0 );
            sal_Int32 nBuild( 0 );
            const bool bBuildIdFound = GetImport().getBuildIds( nUPD, nBuild );
            if ( rImport.IsTextDocInOOoFileFormat() ||
                 ( bBuildIdFound && nUPD == 680 ) )
            {
                /* handling former documents written by OpenOffice.org:
                   use default list id of numbering rules instance, if existing
                   (#i92811#)
                */
                if ( !sListStyleDefaultListId.isEmpty() )
                {
                    msListId = sListStyleDefaultListId;
                    if ( !bIsContinueNumberingAttributePresent &&
                         !mbRestartNumbering &&
                         rTextListsHelper.IsListProcessed( msListId ) )
                    {
                        mbRestartNumbering = true;
                    }
                }
            }
            if ( msListId.isEmpty() )
            {
                // generate a new list id for the list
                msListId = rTextListsHelper.GenerateNewListId();
            }
        }

        if ( bIsContinueNumberingAttributePresent && !mbRestartNumbering &&
             msContinueListId.isEmpty() )
        {
            const OUString& Last( rTextListsHelper.GetLastProcessedListId() );
            if ( rTextListsHelper.GetListStyleOfLastProcessedList() == msListStyleName
                 && Last != msListId )
            {
                msContinueListId = Last;
            }
        }

        bool bContinueNumbering = bIsContinueNumberingAttributePresent && !mbRestartNumbering;
        if (msContinueListId.isEmpty() && bContinueNumbering && GetImport().IsMSO())
        {
            // No "continue list" id, but continue numbering was requested. Connect to the last list of
            // the same list style in the Word case, even if there was a different list in the meantime.
            msContinueListId = rTextListsHelper.GetLastIdOfStyleName(msListStyleName);
        }

        if ( !msContinueListId.isEmpty() )
        {
            if ( !rTextListsHelper.IsListProcessed( msContinueListId ) )
            {
                msContinueListId.clear();
            }
            else
            {
                // search continue list chain for master list and
                // continue the master list.
                OUString sTmpStr =
                    rTextListsHelper.GetContinueListIdOfProcessedList( msContinueListId );
                while ( !sTmpStr.isEmpty() )
                {
                    msContinueListId = sTmpStr;

                    sTmpStr =
                        rTextListsHelper.GetContinueListIdOfProcessedList( msContinueListId );
                }
            }
        }

        if ( !rTextListsHelper.IsListProcessed( msListId ) )
        {
            // Inconsistent behavior regarding lists (#i92811#)
            rTextListsHelper.KeepListAsProcessed(
                msListId, msListStyleName, msContinueListId,
                sListStyleDefaultListId );
        }
    }
    catch (uno::Exception&)
    {
        // pop ourselves if anything goes wrong to avoid use-after-free
        rTxtImp.GetTextListHelper().PopListContext();
        throw;
    }
}
void XMLTextListBlockContext::endFastElement(sal_Int32 )
{
    // Numbering has not to be restarted if it has been restarted within
    // a child list.
    XMLTextListBlockContext *pParent = mxParentListBlock.get();
    if( pParent )
    {
        pParent->mbRestartNumbering = mbRestartNumbering;
    }

    // Restore current list block.
    mrTxtImport.GetTextListHelper().PopListContext();

    // Any paragraph following the list within the same list item must not
    // be numbered.
    mrTxtImport.GetTextListHelper().SetListItem( nullptr );
}
void XMLTextListsHelper::KeepListAsProcessed( const OUString& sListId,
                                              const OUString& sListStyleName,
                                              const OUString& sContinueListId,
                                              const OUString& sListStyleDefaultListId )
{
    if ( IsListProcessed( sListId ) )
    {
        assert(false &&
                    "<XMLTextListsHelper::KeepListAsProcessed(..)> - list id already added" );
        return;
    }

    if ( !mpProcessedLists )
    {
        mpProcessedLists = std::make_unique<tMapForLists>();
    }

    (*mpProcessedLists)[ sListId ] = std::make_pair(sListStyleName, sContinueListId);

    msLastProcessedListId = sListId;
    msListStyleOfLastProcessedList = sListStyleName;

    // Remember what is the last list id of this list style.
    if (!mpStyleNameLastListIds)
    {
        mpStyleNameLastListIds = std::make_unique<std::map<OUString, OUString>>();
    }
    (*mpStyleNameLastListIds)[sListStyleName] = sListId;

    // Inconsistent behavior regarding lists (#i92811#)
    if ( sListStyleDefaultListId.isEmpty())
        return;

    if ( !mpMapListIdToListStyleDefaultListId )
    {
        mpMapListIdToListStyleDefaultListId = std::make_unique<tMapForLists>();
    }

    if ( !mpMapListIdToListStyleDefaultListId->contains( sListStyleName ) )
    {
        (*mpMapListIdToListStyleDefaultListId)[ sListStyleName ] =
            ::std::pair<OUString, OUString>(sListId, sListStyleDefaultListId);
    }
}
bool XMLTextListsHelper::IsListProcessed( const OUString& sListId ) const
{
    if ( !mpProcessedLists )
    {
        return false;
    }

    return mpProcessedLists->contains( sListId );
}
const OUString & XMLTextListsHelper::GetListStyleOfProcessedList(
                                            const OUString& sListId ) const
{
    if ( mpProcessedLists )
    {
        tMapForLists::const_iterator aIter = mpProcessedLists->find( sListId );
        if ( aIter != mpProcessedLists->end() )
        {
            return (*aIter).second.first;
        }
    }

    return EMPTY_OUSTRING;
}
const OUString & XMLTextListsHelper::GetContinueListIdOfProcessedList(
                                            const OUString& sListId ) const
{
    if ( mpProcessedLists )
    {
        tMapForLists::const_iterator aIter = mpProcessedLists->find( sListId );
        if ( aIter != mpProcessedLists->end() )
        {
            return (*aIter).second.second;
        }
    }

    return EMPTY_OUSTRING;
}
OUString XMLTextListsHelper::GenerateNewListId() const
{
    static bool bHack = (getenv("LIBO_ONEWAY_STABLE_ODF_EXPORT") != nullptr);
    OUString sTmpStr( u"list"_ustr );

    if (bHack)
    {
        static sal_Int64 nIdCounter = SAL_CONST_INT64(5000000000);
        sTmpStr += OUString::number(nIdCounter++);
    }
    else
    {
        // Value of xml:id in element <text:list> has to be a valid ID type (#i92478#)
        DateTime aDateTime( DateTime::SYSTEM );
        sal_Int64 n = aDateTime.GetTime();
        n += aDateTime.GetDateUnsigned();
        n += comphelper::rng::uniform_int_distribution(0, std::numeric_limits<int>::max());
        // Value of xml:id in element <text:list> has to be a valid ID type (#i92478#)
        sTmpStr += OUString::number( n );
    }

    OUString sNewListId( sTmpStr );
    if ( mpProcessedLists )
    {
        tools::Long nHitCount = 0;
        while ( mpProcessedLists->contains( sNewListId ) )
        {
            ++nHitCount;
            sNewListId = sTmpStr + OUString::number( nHitCount );
        }
    }

    return sNewListId;
}
OUString XMLTextListsHelper::GetListIdForListBlock( XMLTextListBlockContext const & rListBlock )
{
    OUString sListBlockListId( rListBlock.GetContinueListId() );
    if ( sListBlockListId.isEmpty() )
    {
        sListBlockListId = rListBlock.GetListId();
    }

    if ( mpMapListIdToListStyleDefaultListId )
    {
        if ( !sListBlockListId.isEmpty() )
        {
            const OUString sListStyleName =
                                GetListStyleOfProcessedList( sListBlockListId );

            tMapForLists::const_iterator aIter =
                    mpMapListIdToListStyleDefaultListId->find( sListStyleName );
            if ( aIter != mpMapListIdToListStyleDefaultListId->end() )
            {
                if ( (*aIter).second.first == sListBlockListId )
                {
                    sListBlockListId = (*aIter).second.second;
                }
            }
        }
    }

    return sListBlockListId;
}
OUString XMLTextListsHelper::GetLastIdOfStyleName(const OUString& sListStyleName) const
{
    if (!mpStyleNameLastListIds)
    {
        return {};
    }

    auto it = mpStyleNameLastListIds->find(sListStyleName);
    if (it == mpStyleNameLastListIds->end())
    {
        return {};
    }

    return it->second;
}
int main(){int cases;std::cin>>cases;for(int c=0;c<cases;++c){XMLTextListsHelper lists;XMLTextImportHelper text{&lists};SvXMLImport importer;int defaults;std::cin>>defaults;for(const char*s:{"S","T"}){auto&rule=importer.rules[OUString(s)];rule.present=defaults;rule.defaultId=OUString(std::string("D")+s);}int count;std::cin>>count;std::vector<std::unique_ptr<XMLTextListBlockContext>>blocks;for(int i=0;i<count;++i){int op;std::cin>>op;if(op==0){int signal,n;std::cin>>signal>>n;xml::sax::XFastAttributeList attrs;for(int k=0;k<n;++k){int token;std::string value;std::cin>>token>>std::quoted(value);attrs.push_back({static_cast<XMLTokenEnum>(token),OUString(value)});}blocks.push_back(std::make_unique<XMLTextListBlockContext>(importer,text,Reference<xml::sax::XFastAttributeList>(&attrs),signal));auto&b=*blocks.back();std::cout<<b.GetLevel()<<","<<b.IsRestartNumbering()<<","<<std::quoted(b.GetListId().value)<<","<<std::quoted(b.GetContinueListId().value)<<","<<std::quoted(lists.GetListIdForListBlock(b).value)<<","<<std::quoted(lists.GetLastProcessedListId().value)<<","<<std::quoted(lists.GetListStyleOfLastProcessedList().value)<<","<<std::quoted(lists.GetLastIdOfStyleName(OUString("S")).value)<<";";}
 else if(op==1){blocks.back()->ResetRestartNumbering();}
 else if(op==2){blocks.back()->endFastElement(0);blocks.pop_back();}
 else{std::string id;std::cin>>std::quoted(id);std::cout<<lists.IsListProcessed(OUString(id))<<","<<std::quoted(lists.GetListStyleOfProcessedList(OUString(id)).value)<<","<<std::quoted(lists.GetContinueListIdOfProcessedList(OUString(id)).value)<<";";}}
 std::cout<<"\n";}}
