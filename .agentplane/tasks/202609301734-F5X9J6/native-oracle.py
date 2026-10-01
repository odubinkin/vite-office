"""Build and execute the pinned native measure functions against the source-derived TS cases."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json, subprocess
root=Path.cwd(); task=root/'.agentplane/tasks/202609301734-F5X9J6'
s=(root/'vendor/libreoffice-reference/sax/source/tools/converter.cxx').read_text()
def extract(start, end):
    return s[s.index(start):s.index(end,s.index(start))]
functions=extract('template <typename V> bool wordEndsWith','\n}\n\n/** parse unit')+'\n'+extract('template <class V> static std::optional','/** convert string to measure using optional min and max values*/\nbool Converter::convertMeasure')
preamble=r'''
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
'''
main=r'''
int main() {
 std::string line;
 while(std::getline(std::cin,line)) {
   std::istringstream stream(line); std::string target,hex; sal_Int32 min,max;
   stream>>target>>min>>max>>hex; std::string input;
   if(hex!="-")for(size_t i=0;i<hex.size();i+=2)input+=static_cast<char>(std::stoi(hex.substr(i,2),nullptr,16));
   sal_Int32 output=0;
   bool ok=lcl_convertMeasure(output,std::string_view(input),target=="twip"?MeasureUnit::TWIP:MeasureUnit::MM_100TH,min,max);
   std::cout<<(ok?std::to_string(output):"null")<<'\n';
 }
}
'''
source=probe_source(task/'native-measure-oracle.cxx');source.write_text(preamble+functions+main)
# A repository-local AST reader extracts literal input cases; expected numbers come from the compiled native functions.
node=r'''
const fs=require('fs'),ts=require('typescript');
const p='apps/office/src/sax/source/tools/converter.test.ts';
const source=ts.createSourceFile(p,fs.readFileSync(p,'utf8'),ts.ScriptTarget.Latest,true);
let inputs=[];
function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='cases') {
let array=node.initializer.expression;inputs=array.elements.map(e=>e.elements[0].text);
} ts.forEachChild(node,visit);}visit(source);
console.log(JSON.stringify(inputs));
'''
inputs=json.loads(subprocess.check_output(['node','-e',node],text=True))
rows=[{'value':v,'target':t,'min':-2147483648,'max':2147483647} for v in inputs for t in ['twip','mm100']]
rows += [{'value':v,'target':t,'min':low,'max':high} for v,t,low,high in [('2147483647','mm100',-2147483648,2147483647),('2147483648','mm100',-2147483648,2147483647),('-2147483649','mm100',-2147483648,2147483647),('999999999999999999mm','twip',-2147483648,2147483647),('-999999999999999999mm','mm100',-2147483648,2147483647),('666','twip',-1000,555),('-1001','mm100',-1000,555),('-1pt','twip',0,2147483647),('1.1','mm100',2,8),('-1.1','mm100',-8,-2),('unknown','mm100',0,1)]]
binary=task/'native-measure-oracle.bin';subprocess.run(['c++','-std=c++20',str(source),'-o',str(binary)],check=True)
try:
 data=''.join(f"{r['target']} {r['min']} {r['max']} {r['value'].encode().hex() or '-'}\n" for r in rows)
 output=subprocess.check_output([str(binary)],input=data,text=True).splitlines()
 for row,native in zip(rows,output,strict=True):row['native']=None if native=='null' else int(native)
 (task/'native-results.json').write_text(identity_json(rows,indent=2)+'\n')
finally:binary.unlink(missing_ok=True)
print(f'Compiled unmodified pinned parser and measure functions; {len(rows)} native cases recorded. Native o3tl conversion ratios supplied for the two implemented targets.')
