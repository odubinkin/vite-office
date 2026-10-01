"""Compile pinned dispatch suffixes with inert namespace/error/reference dependency shims."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json,subprocess
root=Path('.agentplane/tasks/202609302242-6RBX14')
source=Path('vendor/libreoffice-reference/xmloff/source/core/xmlimp.cxx').read_text()
def body(marker):
 start=source.index(marker);brace=source.index('{',start);end=brace+1;depth=1
 while depth:
  depth+=(source[end]=='{')-(source[end]=='}');end+=1
 return source[brace+1:end-1]
known=body('void SAL_CALL SvXMLImport::startFastElement')
# Namespace/version prelude is outside the child-reference contract under test.
known=known[known.index('    SvXMLImportContextRef xContext;'):]
unknown=body('void SAL_CALL SvXMLImport::startUnknownElement')
endknown=body('void SAL_CALL SvXMLImport::endFastElement')
endunknown=body('void SAL_CALL SvXMLImport::endUnknownElement')
cpp=r'''
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
 void PutRewindMap(std::optional<SvXMLNamespaceMap>){}std::optional<SvXMLNamespaceMap> TakeRewindMap(){return {};}
};
using SvXMLImportContextRef=Reference<SvXMLImportContext>;
struct SvXMLImport {
 std::stack<SvXMLImportContextRef> maContexts;std::optional<SvXMLNamespaceMap> mxNamespaceMap;
 static std::string getNameFromToken(int value){return std::to_string(value);}
 void SetError(int,std::initializer_list<std::string>,std::string,Reference<xml::sax::XLocator>){}
 SvXMLImportContext* CreateFastContext(int,const Reference<xml::sax::XFastAttributeList>&){return new SvXMLImportContext("root");}
 void startFastElement(int Element,const Reference<xml::sax::XFastAttributeList>& Attribs){std::optional<SvXMLNamespaceMap> pRewindMap;
'''+known+r'''
 }
 void startUnknownElement(const std::string& rNamespace,const std::string& rName,const Reference<xml::sax::XFastAttributeList>& Attribs){
'''+unknown+r'''
 }
 void endFastElement(int Element){
'''+endknown+r'''
 }
 void endUnknownElement(const std::string& rPrefix,const std::string& rLocalName){
'''+endunknown+r'''
 }
};
int main(){SvXMLImport importer;char op;std::string a,b;while(std::cin>>op>>a){if(op=='K')importer.startFastElement(std::stoi(a),{});else if(op=='E')importer.endFastElement(std::stoi(a));else if(op=='U'){std::cin>>b;importer.startUnknownElement(a,b,{});}else if(op=='V'){std::cin>>b;importer.endUnknownElement(a,b);}else importer.maContexts.top()->characters(a);}for(const auto& event:events)std::cout<<event<<'\n';}
'''
probe_source(root.joinpath('native-dispatch.cxx')).write_text(cpp)
binary=root/'native-dispatch'
subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-dispatch.cxx')),'-o',str(binary)],check=True)
cases=[
'K 0\nK 2\nT hidden\nU urn:foreign wrapper\nK 1\nT hidden\nE 1\nV urn:foreign wrapper\nE 2\nU urn:foreign wrapper\nT A\nU urn:foreign nested\nT B\nV urn:foreign nested\nK 1\nT C\nE 1\nT D\nV urn:foreign wrapper\nK 1\nT E\nE 1\nE 0\n',
'U urn:foreign root\nU urn:foreign owned\nT A\nV urn:foreign owned\nT B\nV urn:foreign root\n',
'K 0\nU urn:foreign wrapper\nU urn:foreign owned\nK 2\nT hidden\nE 2\nV urn:foreign owned\nT tail\nV urn:foreign wrapper\nE 0\n']
rows=[{'input':case,'events':subprocess.check_output([str(binary)],input=case,text=True).splitlines()} for case in cases]
binary.unlink()
root.joinpath('native-traces.json').write_text(identity_json(rows,indent=2)+'\n')
print('Compiled unmodified pinned child/reference dispatch and end bodies; 3 traces / '+str(sum(len(row['events']) for row in rows))+' events.')
