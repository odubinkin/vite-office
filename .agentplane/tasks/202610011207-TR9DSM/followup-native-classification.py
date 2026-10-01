from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib,json
root=Path('vendor/libreoffice-reference');out=Path('.agentplane/tasks/202610011207-TR9DSM');identities=[]
def body(path,signature):
 text=(root/path).read_text();a=text.index(signature);i=text.index('{',a)+1;depth=1
 while depth:
  depth+=(text[i]=='{')-(text[i]=='}');i+=1
 result=text[a:i];identities.append({'path':path,'signature':signature,'sha256':hashlib.sha256(result.encode()).hexdigest()});return result
text='''#include <iostream>\n#include <algorithm>\n#include <cstdint>\nusing sal_uInt16=uint16_t;constexpr int MAXLEVEL=10,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_BITMAP=8;\n// Named null-layout and bound-rule adapters: only format classification and attached/null record reads are compared.\nnamespace o3tl {template<typename T> T narrowing(int n){return static_cast<T>(n);}}\nstruct SwNumFormat {int type;int GetNumberingType()const{return type;}bool IsItemize()const;bool IsEnumeration()const;};\nstruct SwNumRule {SwNumFormat format;const SwNumFormat&Get(sal_uInt16)const{return format;}};\nstruct SwRootFrame {};struct Record {SwNumRule*rule;const SwNumRule*GetNumRule()const{return rule;}};\nstruct SwTextNode {Record*record;int level=0;Record*GetNum(const SwRootFrame* = nullptr)const{return record;}int GetActualListLevel()const{return level;}bool HasNumber(const SwRootFrame* = nullptr)const;bool HasBullet()const;};\n'''
for path,sig in [('sw/source/core/doc/number.cxx','bool SwNumFormat::IsItemize() const'),('sw/source/core/doc/number.cxx','bool SwNumFormat::IsEnumeration() const'),('sw/source/core/txtnode/ndtxt.cxx','sal_uInt16 lcl_BoundListLevel(const int nActualLevel)'),('sw/source/core/txtnode/ndtxt.cxx','bool SwTextNode::HasNumber(SwRootFrame const*const pLayout) const'),('sw/source/core/txtnode/ndtxt.cxx','bool SwTextNode::HasBullet() const')]:text+=body(path,sig)+'\n'
text+='''int main(){std::cout<<"[";bool first=true;for(int type:{4,5,6,8}){SwNumRule rule{{type}};Record record{&rule};SwTextNode node{&record};if(!first)std::cout<<",";first=false;std::cout<<"["<<type<<","<<(node.HasNumber()?"true":"false")<<","<<(node.HasBullet()?"true":"false")<<"]";}std::cout<<"]";}'''
(probe_source(out/'followup-native-classification.cxx')).write_text(text);(out/'followup-native-classification-identities.json').write_text(identity_json(identities,indent=2)+'\n')
