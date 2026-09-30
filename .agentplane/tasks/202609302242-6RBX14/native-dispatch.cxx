
#include <cassert>
#include <iostream>
#include <optional>
#include <stack>
#include <string>
#include <vector>
using sal_Int32=int;using OUString=std::string;
#define SAL_INFO(...)
#define SAL_INFO_IF(...)
#define SAL_WARN(...)
#define SAL_WARN_IF(...)
constexpr int XMLERROR_FLAG_SEVERE=1,XMLERROR_UNKNOWN_ROOT=2;
namespace xml::sax {struct XFastAttributeList{};struct XLocator{};}
template<class T>struct Reference{T* p=nullptr;Reference()=default;Reference(T* q):p(q){};T* get()const{return p;}T* operator->()const{return p;}explicit operator bool()const{return p;}bool is()const{return p;}void set(T* q){p=q;}};
struct SvXMLNamespaceMap{};struct SvXMLImport;
std::vector<std::string> events;
struct SvXMLImportContext {
 std::string label;bool record=false;
 SvXMLImportContext(SvXMLImport&){}
 SvXMLImportContext(std::string text):label(text),record(true){}
 virtual Reference<SvXMLImportContext> createFastChildContext(int element,const Reference<xml::sax::XFastAttributeList>&){if(!record)return {};events.push_back(label+":child:"+std::to_string(element));return element==2?nullptr:new SvXMLImportContext("child");}
 virtual Reference<SvXMLImportContext> createUnknownChildContext(const std::string& uri,const std::string& name,const Reference<xml::sax::XFastAttributeList>&){if(!record)return {};events.push_back(label+":unknown-child:"+uri+":"+name);return name=="owned"?new SvXMLImportContext("owned"):nullptr;}
 void startFastElement(int element,const Reference<xml::sax::XFastAttributeList>&){if(record)events.push_back(label+":start:"+std::to_string(element));}
 void endFastElement(int element){if(record)events.push_back(label+":end:"+std::to_string(element));}
 void startUnknownElement(const std::string& uri,const std::string& name,const Reference<xml::sax::XFastAttributeList>&){if(record)events.push_back(label+":unknown-start:"+uri+":"+name);}
 void endUnknownElement(const std::string& uri,const std::string& name){if(record)events.push_back(label+":unknown-end:"+uri+":"+name);}
 void characters(const std::string& value){if(record)events.push_back(label+":text:"+value);}
 void PutRewindMap(SvXMLNamespaceMap){}std::optional<SvXMLNamespaceMap> TakeRewindMap(){return {};}
};
using SvXMLImportContextRef=Reference<SvXMLImportContext>;
struct SvXMLImport {
 std::stack<SvXMLImportContextRef> maContexts;SvXMLNamespaceMap mxNamespaceMap;
 static std::string getNameFromToken(int value){return std::to_string(value);}
 void SetError(int,std::initializer_list<std::string>,std::string,Reference<xml::sax::XLocator>){}
 SvXMLImportContext* CreateFastContext(int,const Reference<xml::sax::XFastAttributeList>&){return new SvXMLImportContext("root");}
 void startFastElement(int Element,const Reference<xml::sax::XFastAttributeList>& Attribs){std::optional<SvXMLNamespaceMap> pRewindMap;
    SvXMLImportContextRef xContext;
    const bool bRootContext = maContexts.empty();
    if (!maContexts.empty())
    {
        const SvXMLImportContextRef & pHandler = maContexts.top();
        SAL_INFO("xmloff.core", "calling createFastChildContext on " << typeid(*pHandler.get()).name());
        auto tmp = pHandler->createFastChildContext( Element, Attribs );
        xContext = static_cast<SvXMLImportContext*>(tmp.get());
        assert((tmp && xContext) || (!tmp && !xContext));
    }
    else
        xContext.set( CreateFastContext( Element, Attribs ) );

    SAL_INFO_IF(!xContext.is(), "xmloff.core", "No fast context for element " << getNameFromToken(Element));
    if (bRootContext && !xContext)
    {
        OUString aName = getNameFromToken(Element);
        SetError( XMLERROR_FLAG_SEVERE | XMLERROR_UNKNOWN_ROOT,
                  { aName }, "Root element " + aName + " unknown", Reference<xml::sax::XLocator>() );
    }
    if ( !xContext )
        xContext.set( new SvXMLImportContext( *this ) );

    // Remember old namespace map.
    if( pRewindMap )
        xContext->PutRewindMap(std::move(pRewindMap));

    // Call a startElement at the new context.
    xContext->startFastElement( Element, Attribs );

    // Push context on stack.
    maContexts.push(xContext);

 }
 void startUnknownElement(const std::string& rNamespace,const std::string& rName,const Reference<xml::sax::XFastAttributeList>& Attribs){

    SAL_INFO("xmloff.core", "startUnknownElement " << rNamespace << " " << rName);
    SvXMLImportContextRef xContext;
    const bool bRootContext = maContexts.empty();
    if (!maContexts.empty())
    {
        const SvXMLImportContextRef & pHandler = maContexts.top();
        SAL_INFO("xmloff.core", "calling createUnknownChildContext on " << typeid(*pHandler.get()).name());
        auto tmp = pHandler->createUnknownChildContext( rNamespace, rName, Attribs );
        xContext = static_cast<SvXMLImportContext*>(tmp.get());
        assert((tmp && xContext) || (!tmp && !xContext));
    }
    else
        xContext.set( CreateFastContext( -1, Attribs ) );

    SAL_WARN_IF(!xContext.is(), "xmloff.core", "No context for unknown-element " << rNamespace << " " << rName);
    if (bRootContext && !xContext)
    {
        SetError( XMLERROR_FLAG_SEVERE | XMLERROR_UNKNOWN_ROOT,
                  { rName }, "Root element " + rName + " unknown", Reference<xml::sax::XLocator>() );
    }
    if (!xContext)
    {
        if (!maContexts.empty())
            // This is pretty weird, but it's what the code did before I simplified it, and some parts of the
            // code rely on this behaviour e.g. DocumentBuilderContext
            xContext = maContexts.top();
        else
            xContext = new SvXMLImportContext( *this );
    }

    xContext->startUnknownElement( rNamespace, rName, Attribs );
    maContexts.push(xContext);

 }
 void endFastElement(int Element){

    SAL_INFO("xmloff.core", "endFastElement " << SvXMLImport::getNameFromToken( Element ));
    if (maContexts.empty())
    {
        SAL_WARN("xmloff.core", "SvXMLImport::endFastElement: no context left");
        assert(false);
        return;
    }
    SvXMLImportContextRef xContext = std::move(maContexts.top());
    // Get a namespace map to rewind.
    std::optional<SvXMLNamespaceMap> pRewindMap = xContext->TakeRewindMap();
    maContexts.pop();
    xContext->endFastElement( Element );
    // Rewind a namespace map.
    if (pRewindMap)
        mxNamespaceMap = std::move(pRewindMap);

 }
 void endUnknownElement(const std::string& rPrefix,const std::string& rLocalName){

    SAL_INFO("xmloff.core", "endUnknownElement " << rPrefix << " " << rLocalName);
    if (maContexts.empty())
    {
        SAL_WARN("xmloff.core", "SvXMLImport::endUnknownElement: no context left");
        assert(false);
        return;
    }
    SvXMLImportContextRef xContext = std::move(maContexts.top());
    maContexts.pop();
    xContext->endUnknownElement( rPrefix, rLocalName );

 }
};
int main(){SvXMLImport importer;char op;std::string a,b;while(std::cin>>op>>a){if(op=='K')importer.startFastElement(std::stoi(a),{});else if(op=='E')importer.endFastElement(std::stoi(a));else if(op=='U'){std::cin>>b;importer.startUnknownElement(a,b,{});}else if(op=='V'){std::cin>>b;importer.endUnknownElement(a,b);}else importer.maContexts.top()->characters(a);}for(const auto& event:events)std::cout<<event<<'\n';}
