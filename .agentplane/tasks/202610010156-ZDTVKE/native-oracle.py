"""Compile unmodified pinned item factory, block flag and paragraph consumption bodies.

Shims: platform/token constants, pointer UNO/rtl references, found rule/style/id,
block/item helper stack, progress disabled, XML attribute start-value already
normalized and UNO restart property sink. No MakeNumRule/default factory,
continue-numbering/processed identity/UNO/native build claim.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import itertools
import json
import subprocess

root = Path(__file__).resolve().parents[3]
task = Path(__file__).resolve().parent
up = root / 'vendor/libreoffice-reference'

def body(file, marker):
    text = (up / file).read_text()
    a = text.index(marker)
    b = text.index('{', a)
    n, end = 1, b + 1
    while n:
        n += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[a:end]

blockfile = 'xmloff/source/text/XMLTextListBlockContext.cxx'
itemfile = 'xmloff/source/text/XMLTextListItemContext.cxx'
header = 'xmloff/source/text/XMLTextListBlockContext.hxx'
inherit = body(blockfile, 'if( mxParentListBlock.is() )')
consume = body('xmloff/source/text/txtimp.cxx', 'if( pListBlock && pListBlock->IsRestartNumbering() )')
factory = body(itemfile, 'css::uno::Reference< css::xml::sax::XFastContextHandler > XMLTextListItemContext::createFastChildContext')
blockend = body(blockfile, 'void XMLTextListBlockContext::endFastElement')
itemend = body(itemfile, 'void XMLTextListItemContext::endFastElement')

def p(): return ('p', None)
def item(children, start=-1, head=False): return ('header' if head else 'item', (children, start))
def lists(children): return ('list', children)
def sub(shape, start):
    if shape == 0: return lists([])
    if shape == 1: return lists([item([p()], start)])
    if shape == 2: return lists([item([p()], head=True), item([p()], start)])
    return lists([item([lists([item([p()])]), lists([item([p()])]), p()], start)])
def render(node):
    kind, data = node
    if kind == 'p': return '<text:p>x</text:p>', [('P', -1)]
    if kind == 'list':
        parts = [render(c) for c in data]
        return '<text:list>'+''.join(s for s,_ in parts)+'</text:list>', [('B',-1)]+[e for _,es in parts for e in es]+[('Z',-1)]
    children, start = data
    tag = 'list-header' if kind == 'header' else 'list-item'
    attr = '' if start < 0 else f' text:start-value="{start}"'
    parts = [render(c) for c in children]
    return f'<text:{tag}{attr}>'+''.join(s for s,_ in parts)+f'</text:{tag}>', [('H' if kind=='header' else 'I',start)]+[e for _,es in parts for e in es]+[('E',-1)]

rows = []
for first, second, before, middle, after, third, head, start in itertools.product(range(4),range(4),range(2),range(2),range(2),range(2),range(2),[-1,0,2]):
    children = ([p()] if before else [])+[sub(first,start)]+([p()] if middle else [])+[sub(second,start)]+([sub(1,start)] if third else [])+([p()] if after else [])
    tree = lists([item(children,start,bool(head)), item([sub(1,-1),p()])])
    xml, events = render(tree)
    rows.append(dict(xml=xml, events=events))

source = '''#include <cassert>
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
''' + inherit + '''
 txt.lists.PushListContext(this);}
 int GetNumRules(){return mxNumRules;}int GetLevel(){return mnLevel;}std::string GetListId(){return msListId;}std::string GetContinueListId(){return msContinueListId;}
''' + body(header, 'bool IsRestartNumbering() const') + '\n' + body(header, 'void ResetRestartNumbering()') + '''
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
''' + consume + '''
 trace.push_back({pListBlock->GetLevel(),pListItem!=nullptr,props.restart || start>=0,start});i.lists.SetListItem(nullptr);}};
''' + factory + '\n' + blockend + '\n' + itemend + '\n'
source += 'int main(){std::vector<std::vector<std::pair<char,short>>> cases={\n'+',\n'.join('{'+','.join("{'"+event+"',"+str(start)+'}' for event,start in row['events'])+'}' for row in rows)+'\n};\n'
source += '''for(auto&events:cases){Import imp;trace.clear();std::vector<SvXMLImportContext*> active;for(auto [event,start]:events){Attr attr{start};Attr*attrs=&attr;
if(event=='B'){SvXMLImportContext*p=active.empty()?static_cast<SvXMLImportContext*>(new XMLTextListBlockContext(imp,imp,attrs)):static_cast<SvXMLImportContext*>(static_cast<XMLTextListItemContext*>(active.back())->createFastChildContext(TEXT_LIST,attrs));active.push_back(p);}
else if(event=='I'||event=='H')active.push_back(new XMLTextListItemContext(imp,attrs,event=='H'));
else if(event=='P'){auto*p=static_cast<XMLTextListItemContext*>(active.back())->createFastChildContext(TEXT_P,attrs);delete p;}
else {auto*p=active.back();p->endFastElement(0);active.pop_back();delete p;}}
for(auto&state:trace)std::cout<<state.level<<","<<state.counted<<","<<state.restart<<","<<state.start<<";";std::cout<<"\\n";}}
'''
file = probe_source(task / 'native-sublist.cxx')
file.write_text(source)
binary = task / 'native-sublist'
subprocess.run(['clang++','-std=c++20','-O0',str(file),'-o',str(binary)],check=True)
output = subprocess.check_output([str(binary)],text=True).splitlines()
binary.unlink()
for row,line in zip(rows,output,strict=True):
    row['expected']=[dict(level=l,counted=bool(c),restart=bool(r),start=s) for l,c,r,s in (map(int,part.split(',')) for part in line.split(';') if part)]
(task / 'native-results.json').write_text(identity_json(rows,indent=2)+'\n')
print(f'Compiled native item/block/paragraph restart excerpts for {len(rows)} input trees/{sum(len(r["expected"]) for r in rows)} paragraph states.')
