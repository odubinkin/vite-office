"""Compile pinned SAX export and integer conversion with repository-local platform aliases."""
import json
import subprocess
from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json

root = Path(".agentplane/tasks/202609302034-1CZ8BR")
previous = probe_source(Path(".agentplane/tasks/202609301734-F5X9J6/native-measure-oracle.cxx")).read_text()
previous = previous[:previous.index("int main(")]
source = Path("vendor/libreoffice-reference/sax/source/tools/converter.cxx").read_text()
start = source.index("void Converter::convertMeasure( OUStringBuffer&")
end = source.index("\n}\n", start) + 3
export = source[start:end]
header = Path("vendor/libreoffice-reference/include/o3tl/unit_conversion.hxx").read_text()
start = header.index("template <std::integral I> constexpr sal_Int64 MulDiv(")
end = header.index("\n}\n", start) + 3
muldiv = header[start:end]
preamble = r"""
#include <concepts>
#include <cassert>
#include <climits>
using sal_Int64=int64_t;
#define SAL_MIN_INT64 INT64_MIN
#define SAL_MAX_INT64 INT64_MAX
template<typename I> constexpr bool isBetween(I n,sal_Int64 minimum,sal_Int64 maximum) {return n>=minimum&&n<=maximum;}
"""
platform = r"""
namespace o3tl {
sal_Int64 convert(sal_Int64 value, Length from, Length to) {
  assert(to==Length::cm);
  if(from==Length::twip) return ::MulDiv(value,127,72000);
  assert(from==Length::mm100);
  return ::MulDiv(value,1,1000);
}
}
struct OUStringBuffer {
  std::string value;
  void append(char c) {value+=c;}
  void append(sal_Int64 n) {value+=std::to_string(n);}
  void append(sal_Int32 n) {value+=std::to_string(n);}
  void appendAscii(const char* text,size_t count) {value.append(text,count);}
};
static constexpr std::string_view gpsMM="mm",gpsCM="cm",gpsPT="pt",gpsINCH="in";
class Converter {public: static void convertMeasure(OUStringBuffer&,sal_Int32,sal_Int16,sal_Int16);};
"""
main = r"""
int main() {
  std::string line;
  while(std::getline(std::cin,line)) {
    std::istringstream stream(line);
    char kind; stream>>kind;
    if(kind=='E') {
      std::string unit; sal_Int32 value; stream>>unit>>value;
      OUStringBuffer buffer;
      Converter::convertMeasure(buffer,value,unit=="twip"?MeasureUnit::TWIP:MeasureUnit::MM_100TH,MeasureUnit::CM);
      std::cout<<buffer.value<<'\n';
    } else if(kind=='U') {
      sal_Int64 value; stream>>value;
      auto twips=MulDiv(value,72,127);
      std::cout<<twips<<' '<<MulDiv(twips,127,72)<<'\n';
    } else {
      sal_Int32 minimum,maximum,value=0; stream>>minimum>>maximum;
      std::string measure; std::getline(stream,measure); measure.erase(0,1);
      lcl_convertMeasure(value,std::string_view(measure),MeasureUnit::MM_100TH,minimum,maximum);
      std::cout<<value<<'\n';
    }
  }
}
"""
cpp = previous + preamble + muldiv + platform + export + main
probe_source(root.joinpath("native-list-measure-oracle.cxx")).write_text(cpp)
# Binaries are temporary evidence-generation outputs and are removed after execution.
binary = root / "native-list-measure-oracle"
subprocess.run(["clang++", "-std=c++20", str(probe_source(root / "native-list-measure-oracle.cxx")), "-o", str(binary)], check=True)
cases=[]
for unit in ["mm100","twip"]:
    for value in [0,1,-1,2,-2,72,-72,127,-127,250,-250,1000,1008,-1008,1134,32767,-32768,2147483647,-2147483648]:
        cases.append({"kind":"export", "unit":unit, "value":value,"input":f"E {unit} {value}"})
for value in [0,1,-1,2,-2,127,250,1008,32767,-32768]:
    cases.append({"kind":"uno", "value":value,"input":f"U {value}"})
for measure in ["0.007mm","-0.007mm"," .25CM ","1PX",".025pt","1pc","1cm extra","3","+1cm","invalid","1em","999999999cm","-999999999cm"]:
    for minimum in [-32768,0]:
        cases.append({"kind":"parse", "value":measure,"minimum":minimum,"input":f"P {minimum} 32767 {measure}"})
try:
    output=subprocess.check_output([str(binary)], input="\n".join(c["input"] for c in cases)+"\n",text=True).splitlines()
finally:
    binary.unlink(missing_ok=True)
assert len(output)==len(cases)
for case,result in zip(cases,output):
    case["expected"]=result
root.joinpath("native-results.json").write_text(identity_json(cases,indent=2)+"\n")
print(f"Generated {len(cases)} results using unmodified pinned SAX export/parser and o3tl integer bodies.")
