from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import hashlib,json,subprocess
root=Path('.agentplane/tasks/202610010940-WW4SFA')
init=Path('vendor/libreoffice-reference/sw/source/core/bastyp/init.cxx').read_text()
h=Path('vendor/libreoffice-reference/include/svl/intitem.hxx').read_text()
c=Path('vendor/libreoffice-reference/svl/source/items/intitem.cxx').read_text()
def block(s,m):
 a=s.index(m);b=s.index('{',a);i=b+1;depth=1
 while depth:depth+=(s[i]=='{')-(s[i]=='}');i+=1
 return s[a:i]
entry=next(line.strip().removesuffix(',') for line in init.splitlines() if '{ RES_PARATR_LIST_RESTARTVALUE,' in line)
ctor=block(h,'explicit SfxInt16Item(');getter=block(h,'sal_Int16 GetValue() const');clone=block(c,'SfxInt16Item* SfxInt16Item::Clone(')
records=[{'source':path,'marker':name,'bytes':len(s.encode()),'sha256':hashlib.sha256(s.encode()).hexdigest(),'text':s} for path,name,s in [('sw/source/core/bastyp/init.cxx','RES_PARATR_LIST_RESTARTVALUE initializer',entry),('include/svl/intitem.hxx','SfxInt16Item constructor',ctor),('include/svl/intitem.hxx','GetValue',getter),('svl/source/items/intitem.cxx','Clone',clone)]]
(root/'native-source-identity.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','scope':'one complete data initializer plus unchanged constructor/getter/Clone;no full ItemInfoPackage/pool registry claim','definitions':records},indent=2)+'\n')
source='#include <cstdint>\n#include <iostream>\nusing sal_uInt16=uint16_t;using sal_Int16=int16_t;struct SfxItemPool{};\n// NAMED BASE/WHICH/STORAGE-TYPE ADAPTERS ONLY: no full native pool lifetime.\nstruct SfxPoolItem{sal_uInt16 which;explicit SfxPoolItem(sal_uInt16 n):which(n){};virtual ~SfxPoolItem()=default;sal_uInt16 Which()const{return which;}};\nclass SfxInt16Item:public SfxPoolItem{sal_Int16 m_nValue;public:\n'+ctor+'\n'+getter+'\nSfxInt16Item* Clone(SfxItemPool* =nullptr)const;};\n'+clone+'\nconstexpr sal_uInt16 RES_PARATR_LIST_RESTARTVALUE=86;constexpr int SFX_ITEMINFOFLAG_NONE=0;struct Entry{int which;SfxPoolItem* item;int slot,flags;};\nint main(){Entry e='+entry+';auto* item=static_cast<SfxInt16Item*>(e.item);auto* copied=item->Clone();std::cout<<e.which<<" "<<item->GetValue()<<" "<<copied->GetValue()<<" "<<(copied!=item)<<"\\n";delete copied;delete item;}\n'
(probe_source(root/'native-default.cxx')).write_text(source)
binary=root/'native-default'
try:
 subprocess.run(['clang++','-std=c++20',str(probe_source(root/'native-default.cxx')),'-o',str(binary)],check=True)
 result=subprocess.check_output([str(binary)],text=True).strip();assert result=='86 1 1 1',result
 (root/'native-result.json').write_text(identity_json({'which':86,'default':1,'clone':1,'independent':True},indent=2)+'\n')
 print('PASS:'+result+';one complete unchanged initializer,constructor,getter,Clone;named base/type adapters only')
finally:
 binary.unlink(missing_ok=True)
