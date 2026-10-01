#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;
struct OUString {std::string value;OUString()=default;OUString(std::string v):value(v){}OUString(const char*v):value(v){}bool isEmpty()const{return value.empty();}void clear(){value.clear();}static OUString number(sal_Int32 n){return OUString(std::to_string(n));}bool operator==(const OUString&r)const{return value==r.value;}bool operator<(const OUString&r)const{return value<r.value;}};
OUString operator""_ustr(const char16_t*s,size_t n){std::string v;for(size_t i=0;i<n;++i)v.push_back(static_cast<char>(s[i]));return OUString(v);}
struct Any {int value;bool operator>>=(bool&out)const{out=value!=0;return true;}bool operator>>=(sal_Int16&out)const{out=static_cast<sal_Int16>(value);return true;}};
struct PropertyValue{OUString Name;Any Value;};template<class T>using Sequence=std::vector<T>;
struct Properties {bool restart;int start;bool hasPropertyByName(const OUString&){return true;}Any getPropertyValue(const OUString&name){return{name==OUString("ParaIsNumberingRestart")?int(restart):start};}};
struct XMLTextNumRuleInfo {
 int*mxNumRules=nullptr;OUString msNumRulesName,msListId,msListLabelString;bool mbListIdIsDefault,mbOutlineStyleAsNormalListStyle,mbContinueingPreviousSubTree;
 sal_Int16 mnListStartValue,mnListLevel,mnListLevelStartValue;bool mbIsNumbered,mbIsRestart;
 XMLTextNumRuleInfo();void Reset();void SetNormalized(int level,bool numbered,bool restart,int start,bool hasFormatStart,int formatStart){Reset();if(level<0)return;msNumRulesName="Numbers";msListId="list1";mnListLevel=static_cast<sal_Int16>(level);mbIsNumbered=numbered;Properties properties{restart,start};auto*xPropSetInfo=&properties;auto*xPropSet=&properties;
if( mbIsNumbered )
        {
            if( xPropSetInfo->hasPropertyByName( u"ParaIsNumberingRestart"_ustr ) )
            {
                xPropSet->getPropertyValue( u"ParaIsNumberingRestart"_ustr ) >>= mbIsRestart;
            }
            if( xPropSetInfo->hasPropertyByName( u"NumberingStartValue"_ustr ) )
            {
                xPropSet->getPropertyValue( u"NumberingStartValue"_ustr ) >>= mnListStartValue;
            }
        }
 Sequence<PropertyValue>aProps;if(hasFormatStart)aProps.push_back({"StartWith",{formatStart}});
auto pProp = std::find_if(std::cbegin(aProps), std::cend(aProps),
            [](const PropertyValue& rProp) { return rProp.Name == "StartWith"; });
        if (pProp != std::cend(aProps))
        {
            pProp->Value >>= mnListLevelStartValue;
        }
 ++mnListLevel;}
const OUString& GetNumRulesName() const
    {
        return msNumRulesName;
    }
sal_Int16 GetListLevelStartValue() const
    {
        return mnListLevelStartValue;
    }
const OUString& GetListId() const
    {
        return msListId;
    }
bool IsListIdDefault() const { return mbListIdIsDefault; }
sal_Int16 GetLevel() const
    {
        return mnListLevel;
    }
bool HasStartValue() const
    {
        return mnListStartValue != -1;
    }
sal_uInt32 GetStartValue() const
    {
        return mnListStartValue;
    }
bool IsNumbered() const
    {
        return mbIsNumbered;
    }
bool IsRestart() const
    {
        return mbIsRestart;
    }
bool IsContinueingPreviousSubTree() const
    {
        return mbContinueingPreviousSubTree;
    }
const OUString& ListLabelString() const
    {
        return msListLabelString;
    }
 bool BelongsToSameList(const XMLTextNumRuleInfo&)const;
};
inline void XMLTextNumRuleInfo::Reset()
{
    mxNumRules = nullptr;
    msNumRulesName.clear();
    msListId.clear();
    mnListStartValue = -1;
    mnListLevel = 0;
    // Written OpenDocument file format doesn't fit to the created text document (#i69627#)
    mbIsNumbered = mbIsRestart =
    mbOutlineStyleAsNormalListStyle = false;
    mbContinueingPreviousSubTree = false;
    msListLabelString.clear();
}
XMLTextNumRuleInfo::XMLTextNumRuleInfo()
    : mbListIdIsDefault(false)
    , mnListStartValue( -1 )
    , mnListLevel( 0 )
    , mbIsNumbered( false )
    , mbIsRestart( false )
    , mnListLevelStartValue( -1 )
    , mbOutlineStyleAsNormalListStyle( false )
{
    Reset();
}
bool XMLTextNumRuleInfo::BelongsToSameList( const XMLTextNumRuleInfo& rCmp ) const
{
    bool bRet( true );
    // Currently only the text documents support <ListId>.
    if ( !rCmp.msListId.isEmpty() || !msListId.isEmpty() )
    {
        bRet = rCmp.msListId == msListId;
    }
    else
    {
        bRet = rCmp.msNumRulesName == msNumRulesName;
    }

    return bRet;
}
enum XMLTokenEnum {XML_LIST,XML_LIST_ITEM,XML_LIST_HEADER,XML_NUMBER,XML_CONTINUE_LIST,XML_CONTINUE_NUMBERING,XML_ID,XML_START_VALUE,XML_STYLE_NAME,XML_STYLE_OVERRIDE,XML_TRUE};constexpr int XML_NAMESPACE_TEXT=0,XML_NAMESPACE_XML=1;
OUString GetXMLToken(XMLTokenEnum t){return OUString(t==XML_LIST?"list":t==XML_LIST_ITEM?"list-item":t==XML_LIST_HEADER?"list-header":"ignored");}
namespace SvXMLExportFlags{constexpr int OASIS=1;}namespace SvtSaveOptions{constexpr int ODFSVER_012=2;}
struct Namespace{OUString GetQNameByKey(int,const OUString&name)const{return name;}};
struct Export{std::vector<std::string>events;std::string pendingStart;bool hasStart=false;Namespace ns;Namespace&GetNamespaceMap(){return ns;}void AddAttribute(int,XMLTokenEnum token,const OUString&value){if(token==XML_START_VALUE){hasStart=true;pendingStart=value.value;}}void AddAttribute(int,XMLTokenEnum,XMLTokenEnum){}void CheckAttrList(){}void IgnorableWhitespace(){}OUString EncodeStyleName(const OUString&s){return s;}void StartElement(const OUString&s,bool){events.push_back("+"+s.value+(hasStart?":"+pendingStart:""));hasStart=false;}void EndElement(const OUString&s,bool){events.push_back("-"+s.value);}void Characters(const OUString&){}bool exportTextNumberElement(){return false;}int getExportFlags(){return 1;}int getSaneDefaultVersion(){return 3;}};
struct XMLTextListsHelper{std::map<OUString,OUString>processed;std::vector<OUString>styles;int generated=0;bool IsListProcessed(const OUString&id){return processed.contains(id);}void KeepListAsProcessed(const OUString&id,const OUString&style,const OUString&){processed[id]=style;}OUString GenerateNewListId(){return OUString("next"+std::to_string(++generated));}OUString GetLastContinuingListId(const OUString&id){return id;}void StoreLastContinuingList(const OUString&,const OUString&){}OUString GetListStyleOfLastProcessedList(){return OUString("Numbers");}OUString GetLastProcessedListId(){return OUString("list1");}void PushListOnStack(const OUString&,const OUString&style){styles.push_back(style);}void PopListFromStack(){styles.pop_back();}bool EqualsToTopListStyleOnStack(const OUString&style){return !styles.empty()&&styles.back()==style;}};
struct XMLTextParagraphExport{Export output;XMLTextListsHelper helper;XMLTextListsHelper*mpTextListsHelper=&helper;std::vector<OUString>maListElements;Export&GetExport(){return output;}bool ExportListId(){return true;}void exportListChange(const XMLTextNumRuleInfo&,const XMLTextNumRuleInfo&);};
void XMLTextParagraphExport::exportListChange(
        const XMLTextNumRuleInfo& rPrevInfo,
        const XMLTextNumRuleInfo& rNextInfo )
{
    // end a list
    if ( rPrevInfo.GetLevel() > 0 )
    {
        sal_uInt32 nListLevelsToBeClosed = 0; // unsigned larger type to safely multiply and compare
        if ( !rNextInfo.BelongsToSameList( rPrevInfo ) ||
             rNextInfo.GetLevel() <= 0 )
        {
            // close complete previous list
            nListLevelsToBeClosed = rPrevInfo.GetLevel();
        }
        else if ( rPrevInfo.GetLevel() > rNextInfo.GetLevel() )
        {
            // close corresponding sub lists
            nListLevelsToBeClosed = rPrevInfo.GetLevel() - rNextInfo.GetLevel();
        }

        if ( nListLevelsToBeClosed > 0 &&
             maListElements.size() >= 2 * nListLevelsToBeClosed )
        {
            do {
                for(size_t j = 0; j < 2; ++j)
                {
                    OUString aElem(maListElements.back());
                    maListElements.pop_back();
                    GetExport().EndElement(aElem, true);
                }

                // remove closed list from list stack
                mpTextListsHelper->PopListFromStack();

                --nListLevelsToBeClosed;
            } while ( nListLevelsToBeClosed > 0 );
        }
    }

    // start a new list
    if ( rNextInfo.GetLevel() > 0 )
    {
        bool bRootListToBeStarted = false;
        sal_Int16 nListLevelsToBeOpened = 0;
        if ( !rPrevInfo.BelongsToSameList( rNextInfo ) ||
             rPrevInfo.GetLevel() <= 0 )
        {
            // new root list
            bRootListToBeStarted = true;
            nListLevelsToBeOpened = rNextInfo.GetLevel();
        }
        else if ( rNextInfo.GetLevel() > rPrevInfo.GetLevel() )
        {
            // open corresponding sub lists
            nListLevelsToBeOpened = rNextInfo.GetLevel() - rPrevInfo.GetLevel();
        }

        if ( nListLevelsToBeOpened > 0 )
        {
            const OUString& sListStyleName( rNextInfo.GetNumRulesName() );
            // Currently only the text documents support <ListId>.
            // Thus, for other document types <sListId> is empty.
            const OUString& sListId( rNextInfo.GetListId() );
            bool bExportListStyle( true );
            bool bRestartNumberingAtContinuedList( false );
            sal_Int32 nRestartValueForContinuedList( -1 );
            bool bContinueingPreviousSubList = !bRootListToBeStarted &&
                                               rNextInfo.IsContinueingPreviousSubTree();
            do {
                GetExport().CheckAttrList();

                if ( bRootListToBeStarted )
                {
                    if ( !mpTextListsHelper->IsListProcessed( sListId ) )
                    {
                        if ( ExportListId() &&
                             !sListId.isEmpty() && !rNextInfo.IsListIdDefault() )
                        {
                            /* Property text:id at element <text:list> has to be
                               replaced by property xml:id (#i92221#)
                            */
                            GetExport().AddAttribute( XML_NAMESPACE_XML,
                                                      XML_ID,
                                                      sListId );
                        }
                        mpTextListsHelper->KeepListAsProcessed( sListId,
                                                                sListStyleName,
                                                                OUString() );
                    }
                    else
                    {
                        const OUString sNewListId(
                                        mpTextListsHelper->GenerateNewListId() );
                        if ( ExportListId() &&
                             !sListId.isEmpty() && !rNextInfo.IsListIdDefault() )
                        {
                            /* Property text:id at element <text:list> has to be
                               replaced by property xml:id (#i92221#)
                            */
                            GetExport().AddAttribute( XML_NAMESPACE_XML,
                                                      XML_ID,
                                                      sNewListId );
                        }

                        const OUString sContinueListId =
                            mpTextListsHelper->GetLastContinuingListId( sListId );
                        // store that list with list id <sNewListId> is last list,
                        // which has continued list with list id <sListId>
                        mpTextListsHelper->StoreLastContinuingList( sListId,
                                                                    sNewListId );
                        if ( sListStyleName ==
                                mpTextListsHelper->GetListStyleOfLastProcessedList() &&
                             // Inconsistent behavior regarding lists (#i92811#)
                             sContinueListId ==
                                mpTextListsHelper->GetLastProcessedListId() )
                        {
                            GetExport().AddAttribute( XML_NAMESPACE_TEXT,
                                                      XML_CONTINUE_NUMBERING,
                                                      XML_TRUE );
                        }
                        else
                        {
                            if ( ExportListId() &&
                                 !sListId.isEmpty() )
                            {
                                GetExport().AddAttribute( XML_NAMESPACE_TEXT,
                                                          XML_CONTINUE_LIST,
                                                          sContinueListId );
                            }
                        }

                        if ( rNextInfo.IsRestart() &&
                             ( nListLevelsToBeOpened != 1 ||
                               !rNextInfo.HasStartValue() ) )
                        {
                            bRestartNumberingAtContinuedList = true;
                            nRestartValueForContinuedList =
                                        rNextInfo.GetListLevelStartValue();
                        }

                        mpTextListsHelper->KeepListAsProcessed( sNewListId,
                                                                sListStyleName,
                                                                sContinueListId );
                    }

                    GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_STYLE_NAME,
                            GetExport().EncodeStyleName( sListStyleName ) );
                    bExportListStyle = false;

                    bRootListToBeStarted = false;
                }
                else if ( bExportListStyle &&
                          !mpTextListsHelper->EqualsToTopListStyleOnStack( sListStyleName ) )
                {
                    GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_STYLE_NAME,
                            GetExport().EncodeStyleName( sListStyleName ) );
                    bExportListStyle = false;

                }
                else
                {
                    // rhbz#746174: also export list restart for non root list
                    if (rNextInfo.IsRestart() && !rNextInfo.HasStartValue())
                    {
                        bRestartNumberingAtContinuedList = true;
                        nRestartValueForContinuedList =
                                        rNextInfo.GetListLevelStartValue();
                    }
                }

                if ( bContinueingPreviousSubList )
                {
                    GetExport().AddAttribute( XML_NAMESPACE_TEXT,
                                              XML_CONTINUE_NUMBERING, XML_TRUE );
                    bContinueingPreviousSubList = false;
                }

                enum XMLTokenEnum eLName = XML_LIST;

                OUString aElem(GetExport().GetNamespaceMap().GetQNameByKey(
                                            XML_NAMESPACE_TEXT,
                                            GetXMLToken(eLName) ) );
                GetExport().IgnorableWhitespace();
                GetExport().StartElement(aElem, false);

                maListElements.push_back(aElem);

                mpTextListsHelper->PushListOnStack( sListId,
                                                    sListStyleName );

                // <text:list-header> or <text:list-item>
                GetExport().CheckAttrList();

                /* Export start value at correct list item (#i97309#) */
                if ( nListLevelsToBeOpened == 1 )
                {
                    if ( rNextInfo.HasStartValue() )
                    {
                        OUString aTmp = OUString::number( static_cast<sal_Int32>(rNextInfo.GetStartValue()) );
                        GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_START_VALUE,
                                      aTmp );
                    }
                    else if (bRestartNumberingAtContinuedList)
                    {
                        GetExport().AddAttribute( XML_NAMESPACE_TEXT,
                                                  XML_START_VALUE,
                                                  OUString::number(nRestartValueForContinuedList) );
                        bRestartNumberingAtContinuedList = false;
                    }
                }

                eLName = ( rNextInfo.IsNumbered() || nListLevelsToBeOpened > 1 )
                         ? XML_LIST_ITEM
                         : XML_LIST_HEADER;
                aElem = GetExport().GetNamespaceMap().GetQNameByKey(
                                            XML_NAMESPACE_TEXT,
                                            GetXMLToken(eLName) );
                GetExport().IgnorableWhitespace();
                GetExport().StartElement(aElem, false);
                maListElements.push_back(aElem);

                // export of <text:number> element for last opened <text:list-item>, if requested
                if ( GetExport().exportTextNumberElement() &&
                     eLName == XML_LIST_ITEM && nListLevelsToBeOpened == 1 && // last iteration --> last opened <text:list-item>
                     !rNextInfo.ListLabelString().isEmpty() )
                {
                    const OUString aTextNumberElem =
                            GetExport().GetNamespaceMap().GetQNameByKey(
                                      XML_NAMESPACE_TEXT,
                                      GetXMLToken(XML_NUMBER) );
                    GetExport().IgnorableWhitespace();
                    GetExport().StartElement( aTextNumberElem, false );
                    GetExport().Characters( rNextInfo.ListLabelString() );
                    GetExport().EndElement( aTextNumberElem, true );
                }
                --nListLevelsToBeOpened;
            } while ( nListLevelsToBeOpened > 0 );
        }
    }

    bool bEndElement = false;

    if ( rNextInfo.GetLevel() > 0 &&
         rNextInfo.IsNumbered() &&
         rPrevInfo.BelongsToSameList( rNextInfo ) &&
         rPrevInfo.GetLevel() >= rNextInfo.GetLevel() )
    {
        assert(maListElements.size() >= 2 && "list elements missing");
        bEndElement = maListElements.size() >= 2;
    }

    if (!bEndElement)
        return;

    // close previous list-item
    GetExport().EndElement(maListElements.back(), true );
    maListElements.pop_back();

    // Only for sub lists (#i103745#)
    if ( rNextInfo.IsRestart() && !rNextInfo.HasStartValue() &&
         rNextInfo.GetLevel() != 1 )
    {
        // start new sub list respectively list on same list level
        GetExport().EndElement(maListElements.back(), true );
        GetExport().IgnorableWhitespace();
        GetExport().StartElement(maListElements.back(), false);
    }

    // open new list-item
    GetExport().CheckAttrList();
    if( rNextInfo.HasStartValue() )
    {
        OUString aTmp = OUString::number( static_cast<sal_Int32>(rNextInfo.GetStartValue()) );
        GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_START_VALUE, aTmp );
    }
    // Handle restart without start value on list level 1 (#i103745#)
    else if ( rNextInfo.IsRestart() && /*!rNextInfo.HasStartValue() &&*/
              rNextInfo.GetLevel() == 1 )
    {
        OUString aTmp = OUString::number( static_cast<sal_Int32>(rNextInfo.GetListLevelStartValue()) );
        GetExport().AddAttribute( XML_NAMESPACE_TEXT, XML_START_VALUE, aTmp );
    }
    if ( ( GetExport().getExportFlags() & SvXMLExportFlags::OASIS ) &&
        GetExport().getSaneDefaultVersion() >= SvtSaveOptions::ODFSVER_012)
    {
        const OUString& sListStyleName( rNextInfo.GetNumRulesName() );
        if ( !mpTextListsHelper->EqualsToTopListStyleOnStack( sListStyleName ) )
        {
            GetExport().AddAttribute( XML_NAMESPACE_TEXT,
                                      XML_STYLE_OVERRIDE,
                                      GetExport().EncodeStyleName( sListStyleName ) );
        }
    }
    OUString aElem( GetExport().GetNamespaceMap().GetQNameByKey(
                            XML_NAMESPACE_TEXT,
                            GetXMLToken(XML_LIST_ITEM) ) );
    GetExport().IgnorableWhitespace();
    GetExport().StartElement(aElem, false );
    maListElements.push_back(aElem);

    // export of <text:number> element for <text:list-item>, if requested
    if ( GetExport().exportTextNumberElement() &&
         !rNextInfo.ListLabelString().isEmpty() )
    {
        const OUString aTextNumberElem =
                GetExport().GetNamespaceMap().GetQNameByKey(
                          XML_NAMESPACE_TEXT,
                          GetXMLToken(XML_NUMBER) );
        GetExport().IgnorableWhitespace();
        GetExport().StartElement( aTextNumberElem, false );
        GetExport().Characters( rNextInfo.ListLabelString() );
        GetExport().EndElement( aTextNumberElem, true );
    }

}
enum PropertyState{PropertyState_DEFAULT_VALUE,PropertyState_DIRECT_VALUE};
namespace sal {template<class T,class U>T static_int_cast(U value){return static_cast<T>(value);}}
struct SwTextNode{bool rule,restart,direct;int start;const void*GetNumRule()const{return rule?this:nullptr;}bool IsListRestart()const{return restart;}bool HasAttrListRestartValue()const{return direct;}int GetAttrListRestartValue()const{return start;}};
struct PointNode{const SwTextNode*node;const SwTextNode*GetTextNode()const{return node;}};
struct SwPaM{PointNode point;const PointNode&GetPointNode()const{return point;}};
sal_Int16 IsNodeNumStart(SwPaM const & rPam, PropertyState& eState)
{
    const SwTextNode* pTextNd = rPam.GetPointNode().GetTextNode();
    // correction: check, if restart value is set at the text node and use
    // new method <SwTextNode::GetAttrListRestartValue()> to retrieve the value
    if ( pTextNd && pTextNd->GetNumRule() && pTextNd->IsListRestart() &&
         pTextNd->HasAttrListRestartValue() )
    {
        eState = PropertyState_DIRECT_VALUE;
        sal_Int16 nTmp = sal::static_int_cast< sal_Int16 >(pTextNd->GetAttrListRestartValue());
        return nTmp;
    }
    eState = PropertyState_DEFAULT_VALUE;
    return -1;
}
int main(){int mode,count;while(std::cin>>mode>>count){
 if(mode==0){XMLTextParagraphExport exporter;XMLTextNumRuleInfo previous,next;for(int i=0;i<count;++i){int level,numbered,restart,start,hasFormat,format;std::cin>>level>>numbered>>restart>>start>>hasFormat>>format;next.SetNormalized(level,numbered,restart,start,hasFormat,format);exporter.exportListChange(previous,next);exporter.output.events.push_back("p"+std::to_string(i));previous=next;}XMLTextNumRuleInfo end;exporter.exportListChange(previous,end);for(const auto&e:exporter.output.events)std::cout<<e<<" ";std::cout<<"\n";}
 else if(mode==1){XMLTextNumRuleInfo info;for(int i=0;i<count;++i){int level,numbered,restart,start,hasFormat,format;std::cin>>level>>numbered>>restart>>start>>hasFormat>>format;info.SetNormalized(level,numbered,restart,start,hasFormat,format);std::cout<<info.GetLevel()<<","<<info.IsNumbered()<<","<<info.IsRestart()<<","<<info.HasStartValue()<<","<<info.GetStartValue()<<","<<info.GetListLevelStartValue()<<";";}std::cout<<"\n";}
 else {for(int i=0;i<count;++i){int present,rule,restart,direct,start;std::cin>>present>>rule>>restart>>direct>>start;SwTextNode node{bool(rule),bool(restart),bool(direct),start};SwPaM pam{{present?&node:nullptr}};PropertyState state=PropertyState_DIRECT_VALUE;std::cout<<IsNodeNumStart(pam,state)<<","<<state<<";";}std::cout<<"\n";}
}}
