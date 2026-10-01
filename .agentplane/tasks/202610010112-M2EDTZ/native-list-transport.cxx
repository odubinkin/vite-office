
#include <string>
#include <vector>
#include <map>
#include <tuple>
#include <stack>
#include <iostream>
#include <cassert>
#include <cstdint>
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_uInt32=uint32_t;
struct OUString {std::string value;OUString()=default;OUString(std::string v):value(v){}bool isEmpty()const{return value.empty();}static OUString number(sal_Int32 n){return OUString(std::to_string(n));}bool operator==(const OUString& r)const{return value==r.value;}bool operator<(const OUString& r)const{return value<r.value;}};
enum XMLTokenEnum {XML_LIST,XML_LIST_ITEM,XML_LIST_HEADER,XML_NUMBER,XML_CONTINUE_LIST,XML_CONTINUE_NUMBERING,XML_ID,XML_START_VALUE,XML_STYLE_NAME,XML_STYLE_OVERRIDE,XML_TRUE};
constexpr int XML_NAMESPACE_TEXT=0,XML_NAMESPACE_XML=1;
OUString GetXMLToken(XMLTokenEnum t){return OUString(t==XML_LIST?"list":t==XML_LIST_ITEM?"list-item":t==XML_LIST_HEADER?"list-header":"ignored");}
namespace SvXMLExportFlags {constexpr int OASIS=1;}
namespace SvtSaveOptions {constexpr int ODFSVER_012=2;}
struct Namespace {OUString GetQNameByKey(int,const OUString& name)const{return name;}};
struct Export {std::vector<std::string> events;Namespace ns;Namespace& GetNamespaceMap(){return ns;}void AddAttribute(int,XMLTokenEnum,const OUString&){}void AddAttribute(int,XMLTokenEnum,XMLTokenEnum){}void CheckAttrList(){}void IgnorableWhitespace(){}OUString EncodeStyleName(const OUString& s){return s;}void StartElement(const OUString& s,bool){events.push_back("+"+s.value);}void EndElement(const OUString& s,bool){events.push_back("-"+s.value);}void Characters(const OUString&){}bool exportTextNumberElement(){return false;}int getExportFlags(){return 1;}int getSaneDefaultVersion(){return 3;}};
struct XMLTextNumRuleInfo {int level=0;bool numbered=false,restart=false;int start=-1;OUString id=OUString("list1"),style=OUString("Counters");int GetLevel()const{return level;}bool BelongsToSameList(const XMLTextNumRuleInfo& other)const{return id==other.id&&style==other.style;}bool IsNumbered()const{return numbered;}bool IsRestart()const{return numbered&&restart;}bool HasStartValue()const{return numbered&&start>=0;}int GetStartValue()const{return start;}int GetListLevelStartValue()const{return 7;}bool IsListIdDefault()const{return false;}bool IsContinueingPreviousSubTree()const{return false;}const OUString& GetListId()const{return id;}const OUString& GetNumRulesName()const{return style;}OUString ListLabelString()const{return OUString();}};
struct XMLTextListBlockContext {};struct XMLTextListItemContext {};struct XMLNumberedParaContext {};
template<typename T>struct Ref {T* p=nullptr;Ref()=default;Ref(T* ptr):p(ptr){}T* get()const{return p;}bool is()const{return p!=nullptr;}Ref& operator=(T* ptr){p=ptr;return *this;}};
struct XMLTextListsHelper {
 std::map<OUString,OUString> processed;std::vector<OUString> styles;std::stack<std::tuple<Ref<XMLTextListBlockContext>,Ref<XMLTextListItemContext>,Ref<XMLNumberedParaContext>>> mListStack;
 void PushListContext(XMLTextListBlockContext*);void PopListContext();void ListContextTop(XMLTextListBlockContext*&,XMLTextListItemContext*&,XMLNumberedParaContext*&);void SetListItem(XMLTextListItemContext*);
 bool IsListProcessed(const OUString& id){return processed.contains(id);}void KeepListAsProcessed(const OUString& id,const OUString& style,const OUString&){processed[id]=style;}OUString GenerateNewListId(){return OUString("next");}OUString GetLastContinuingListId(const OUString& id){return id;}void StoreLastContinuingList(const OUString&,const OUString&){}OUString GetListStyleOfLastProcessedList(){return OUString("Counters");}OUString GetLastProcessedListId(){return OUString("list1");}void PushListOnStack(const OUString&,const OUString& style){styles.push_back(style);}void PopListFromStack(){styles.pop_back();}bool EqualsToTopListStyleOnStack(const OUString& style){return !styles.empty()&&styles.back()==style;}
};
struct XMLTextParagraphExport {Export output;XMLTextListsHelper helper;XMLTextListsHelper* mpTextListsHelper=&helper;std::vector<OUString> maListElements;Export& GetExport(){return output;}bool ExportListId(){return true;}void exportListChange(const XMLTextNumRuleInfo&,const XMLTextNumRuleInfo&);};
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

void XMLTextListsHelper::PushListContext(
    XMLTextListBlockContext *i_pListBlock)
{
    mListStack.emplace(i_pListBlock,
        static_cast<XMLTextListItemContext*>(nullptr),
        static_cast<XMLNumberedParaContext*>(nullptr));
}

void XMLTextListsHelper::PopListContext()
{
    assert(mListStack.size());
    if ( !mListStack.empty())
        mListStack.pop();
}

void XMLTextListsHelper::ListContextTop(
    XMLTextListBlockContext*& o_pListBlockContext,
    XMLTextListItemContext*& o_pListItemContext,
    XMLNumberedParaContext*& o_pNumberedParagraphContext )
{
    if ( !mListStack.empty() ) {
        o_pListBlockContext =
            static_cast<XMLTextListBlockContext*>(std::get<0>(mListStack.top()).get());
        o_pListItemContext  =
            static_cast<XMLTextListItemContext *>(std::get<1>(mListStack.top()).get());
        o_pNumberedParagraphContext =
            static_cast<XMLNumberedParaContext *>(std::get<2>(mListStack.top()).get());
    }
}

void XMLTextListsHelper::SetListItem( XMLTextListItemContext *i_pListItem )
{
    // may be cleared by ListBlockContext for upper list...
    if (i_pListItem) {
        assert(mListStack.size());
        assert(std::get<0>(mListStack.top()).is() &&
            "internal error: SetListItem: mListStack has no ListBlock");
        assert(!std::get<1>(mListStack.top()).is() &&
            "error: SetListItem: list item already exists");
    }
    if ( !mListStack.empty() ) {
        std::get<1>(mListStack.top()) = i_pListItem;
    }
}
int main(){
 // Test the native stack's restored outer item and explicit nested-return clearing.
 XMLTextListsHelper h;XMLTextListBlockContext outer,inner;XMLTextListItemContext item;
 h.PushListContext(&outer);h.SetListItem(&item);h.PushListContext(&inner);
 XMLTextListBlockContext* b=nullptr;XMLTextListItemContext* i=nullptr;XMLNumberedParaContext* p=nullptr;
 h.ListContextTop(b,i,p);assert(b==&inner&&i==nullptr);h.PopListContext();h.ListContextTop(b,i,p);assert(b==&outer&&i==&item);h.SetListItem(nullptr);h.ListContextTop(b,i,p);assert(i==nullptr);h.PopListContext();h.SetListItem(nullptr);
 int count;while(std::cin>>count){XMLTextParagraphExport e;XMLTextNumRuleInfo previous;
 for(int n=0;n<count;n++){XMLTextNumRuleInfo next;int level,counted,restart,start;std::cin>>level>>counted>>restart>>start;next.level=level+1;next.numbered=counted;next.restart=restart;next.start=start;e.exportListChange(previous,next);e.output.events.push_back("p"+std::to_string(n));previous=next;}
 XMLTextNumRuleInfo end;e.exportListChange(previous,end);for(const auto& event:e.output.events)std::cout<<event<<' ';std::cout<<'\n';
 }}
