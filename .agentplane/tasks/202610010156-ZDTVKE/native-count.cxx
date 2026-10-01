#include <cassert>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using sal_Int32=int; using sal_Int16=short; using OUString=std::string;
#define SAL_CALL
#define XMLOFF_WARN_UNKNOWN_ELEMENT(a,b)
#define XML_ELEMENT(a,b) a##_##b
constexpr int TEXT_H=1,TEXT_P=2,LO_EXT_P=3,TEXT_LIST=4;
constexpr int TEXT_XML_H=TEXT_H,TEXT_XML_P=TEXT_P,LO_EXT_XML_P=LO_EXT_P,TEXT_XML_LIST=TEXT_LIST;
struct Attr {short start=-1;};
namespace css {namespace xml::sax {struct XFastContextHandler {virtual ~XFastContextHandler()=default;};using XFastAttributeList=Attr;} namespace uno {template<class T>using Reference=T*;}}
template<class T>struct Ref {T*p=nullptr;bool is(){return p!=nullptr;}T*get(){return p;}};
struct XMLTextListBlockContext; struct XMLTextListItemContext;
struct Lists {std::vector<std::pair<XMLTextListBlockContext*,XMLTextListItemContext*>> stack;void PushListContext(XMLTextListBlockContext*p){stack.push_back({p,nullptr});}void PopListContext(){stack.pop_back();}void SetListItem(XMLTextListItemContext*p){if(!stack.empty())stack.back().second=p;}};
struct Progress {void Increment(){}};
struct Import {Lists lists;Progress progress;Lists&GetTextListHelper(){return lists;}bool IsProgress(){return false;}Progress*GetProgressBarHelper(){return &progress;}};
struct SvXMLImportContext:css::xml::sax::XFastContextHandler {Import&imp;SvXMLImportContext(Import&i):imp(i){}Import&GetImport(){return imp;}virtual void endFastElement(int){};};
struct XMLTextListBlockContext:SvXMLImportContext {
 Import&mrTxtImport;std::string msListStyleName="L",msListId="L-1",msContinueListId;int mxNumRules=1,mnLevel=0;bool mbRestartNumbering=false,mbSetDefaults=false;Ref<XMLTextListBlockContext> mxParentListBlock;
 XMLTextListBlockContext(Import&i,Import&txt,const css::uno::Reference<Attr>&,bool bRestartNumberingAtSubList=false):SvXMLImportContext(i),mrTxtImport(txt){OUString sParentListStyleName;if(!txt.lists.stack.empty())mxParentListBlock.p=txt.lists.stack.back().first;
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
 txt.lists.PushListContext(this);}
 int GetNumRules(){return mxNumRules;}int GetLevel(){return mnLevel;}std::string GetListId(){return msListId;}std::string GetContinueListId(){return msContinueListId;}
bool IsRestartNumbering() const { return mbRestartNumbering; }
void ResetRestartNumbering() { mbRestartNumbering = false; }
 void endFastElement(int) override;
};
struct XMLTextListItemContext:SvXMLImportContext {
 Import&rTxtImport;short start;sal_Int16 mnSubListCount=0;
 XMLTextListItemContext(Import&i,const css::uno::Reference<Attr>&a,bool head):SvXMLImportContext(i),rTxtImport(i),start(head?-1:a->start){if(!head)i.lists.SetListItem(this);}
 void endFastElement(int)override;
 css::uno::Reference<css::xml::sax::XFastContextHandler> createFastChildContext(sal_Int32,const css::uno::Reference<css::xml::sax::XFastAttributeList>&);
};
constexpr int s_ParaIsNumberingRestart=1;
int Any(bool b){return b;}
struct Properties {bool restart=false;bool hasPropertyByName(int){return true;}void setPropertyValue(int,int value){restart=value;}};
struct State {int level;bool counted,restart;short start;};std::vector<State> trace;
struct XMLParaContext:SvXMLImportContext {XMLParaContext(Import&i,int,const css::uno::Reference<Attr>&):SvXMLImportContext(i){auto [pListBlock,pListItem]=i.lists.stack.back();short start=pListItem?pListItem->start:-1;Properties props;auto xPropSetInfo=&props;auto xPropSet=&props;
if( pListBlock && pListBlock->IsRestartNumbering() )
            {
                // TODO: property missing
                if (xPropSetInfo->hasPropertyByName(s_ParaIsNumberingRestart))
                {
                    xPropSet->setPropertyValue(s_ParaIsNumberingRestart,
                                               Any(true) );
                }
                pListBlock->ResetRestartNumbering();
            }
 trace.push_back({pListBlock->GetLevel(),pListItem!=nullptr,props.restart || start>=0,start});i.lists.SetListItem(nullptr);}};
css::uno::Reference< css::xml::sax::XFastContextHandler > XMLTextListItemContext::createFastChildContext(
    sal_Int32 nElement,
    const css::uno::Reference< css::xml::sax::XFastAttributeList >& xAttrList )
{
    SvXMLImportContext *pContext = nullptr;

    switch( nElement )
    {
    case XML_ELEMENT(TEXT, XML_H):
    case XML_ELEMENT(TEXT, XML_P):
    case XML_ELEMENT(LO_EXT, XML_P):
        pContext = new XMLParaContext( GetImport(), nElement,
                                       xAttrList );
        if (rTxtImport.IsProgress())
            GetImport().GetProgressBarHelper()->Increment();

        break;
    case XML_ELEMENT(TEXT, XML_LIST):
        ++mnSubListCount;
        pContext = new XMLTextListBlockContext( GetImport(), rTxtImport,
                                                xAttrList,
                                                (mnSubListCount > 1) );
        break;
    default:
        XMLOFF_WARN_UNKNOWN_ELEMENT("xmloff", nElement);
    }

    return pContext;
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
void XMLTextListItemContext::endFastElement(sal_Int32 )
{
    // finish current list item
    rTxtImport.GetTextListHelper().SetListItem( nullptr );
}
int main(){Import imp;Attr attr;Attr*attrs=&attr;
XMLTextListBlockContext root(imp,imp,attrs);
XMLTextListItemContext item(imp,attrs,false);
for(int n=1;n<=65538;++n){auto*child=static_cast<XMLTextListBlockContext*>(item.createFastChildContext(TEXT_LIST,attrs));
if(n==1||n==2||n==32767||n==32768||n==32769||n==65535||n==65536||n==65537||n==65538)std::cout<<n<<","<<child->IsRestartNumbering()<<"\n";
child->endFastElement(0);delete child;root.ResetRestartNumbering();}
item.endFastElement(0);root.endFastElement(0);}
