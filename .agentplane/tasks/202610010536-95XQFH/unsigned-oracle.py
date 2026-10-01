"""Compile unchanged implemented UInt16 bodies and constructor defaults with typed adapters."""
from pathlib import Path
import hashlib,json,subprocess
root=Path('.agentplane/tasks/202610010536-95XQFH')
def block(text,marker):
 start=text.index(marker);end=text.index('{',start)+1;depth=1
 while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
 return text[start:end]
head=Path('vendor/libreoffice-reference/include/svl/cintitem.hxx').read_text()
sfxhead=Path('vendor/libreoffice-reference/include/svl/intitem.hxx').read_text()
src=Path('vendor/libreoffice-reference/svl/source/items/cintitem.cxx').read_text()
sfxsrc=Path('vendor/libreoffice-reference/svl/source/items/intitem.cxx').read_text()
ctor=block(head,'CntUInt16Item(sal_uInt16 which,')
get=block(head,'sal_uInt16 GetValue() const')
sfxctor=block(sfxhead,'explicit SfxUInt16Item(')
sfxclone=block(sfxhead,'virtual SfxUInt16Item* Clone(')
functions=[block(src,m) for m in ['bool CntUInt16Item::operator ==(', 'bool CntUInt16Item::QueryValue(', 'CntUInt16Item* CntUInt16Item::Clone(']]+[block(sfxsrc,'SfxPoolItem* SfxUInt16Item::CreateDefault()')]
source=r'''
#include <cassert>
#include <cstdint>
#include <iostream>
#include <typeinfo>
#include <memory>
using sal_uInt16=uint16_t;using sal_uInt8=uint8_t;struct SfxItemPool{};
namespace css::uno {struct Any {sal_uInt16 value;void operator<<=(sal_uInt16 v){value=v;}};}
struct SfxPoolItem {sal_uInt16 which;SfxPoolItem(sal_uInt16 w):which(w){}virtual ~SfxPoolItem()=default;sal_uInt16 Which()const{return which;}virtual bool operator==(const SfxPoolItem& b)const{return which==b.which&&typeid(*this)==typeid(b);}virtual SfxPoolItem* Clone(SfxItemPool* =nullptr)const=0;};
class CntUInt16Item:public SfxPoolItem {sal_uInt16 m_nValue;public:
'''+ctor+'\n'+get+r'''
bool operator==(const SfxPoolItem&)const override;bool QueryValue(css::uno::Any&,sal_uInt8=0)const;CntUInt16Item* Clone(SfxItemPool* =nullptr)const override;};
class SfxUInt16Item:public CntUInt16Item {public:static SfxPoolItem* CreateDefault();
'''+sfxctor+'\n'+sfxclone+'\n};\n'+'\n'.join(functions)+r'''
int main(){SfxUInt16Item d;std::cout<<d.Which()<<' '<<d.GetValue()<<'\n';
 for(auto value:{0,1,32768,65535}){CntUInt16Item b(80,value);SfxUInt16Item i(80,value);css::uno::Any a; i.QueryValue(a);std::unique_ptr<CntUInt16Item> c(b.Clone());std::unique_ptr<SfxUInt16Item> clone(i.Clone());std::cout<<i.Which()<<' '<<i.GetValue()<<' '<<a.value<<' '<<(*c==b)<<' '<<(*clone==i)<<' '<<(c.get()!=&b)<<' '<<(clone.get()!=&i)<<' '<<(typeid(*clone)==typeid(i))<<'\n';}
 std::unique_ptr<SfxPoolItem> factory(SfxUInt16Item::CreateDefault());std::cout<<factory->Which()<<' '<<static_cast<SfxUInt16Item*>(factory.get())->GetValue()<<'\n';}
'''
for f in [ctor,get,sfxctor,sfxclone]+functions:assert f in source
root.joinpath('unsigned-native.cxx').write_text(source)
binary=root/'unsigned-native';subprocess.run(['clang++','-std=c++20',str(root/'unsigned-native.cxx'),'-o',str(binary)],check=True)
rows=subprocess.check_output([str(binary)],text=True).splitlines();binary.unlink()
assert rows==['0 0']+[f'80 {n} {n} 1 1 1 1 1' for n in [0,1,32768,65535]]+['0 0']
root.joinpath('unsigned-native-results.json').write_text(json.dumps({'definitions':8,'rows':rows,'pass':True,'identity':[{'signature':f.split('{',1)[0].strip(),'sha256':hashlib.sha256(f.encode()).hexdigest()} for f in [ctor,get,sfxctor,sfxclone]+functions],'profile':'Native unsigned ctor/value/query/clones/equality/default factory;explicit Which/type/UNO Any scalar adapters. JS rejects values that typed sal_uInt16 cannot represent;full mutation/hash/presentation/pooling not claimed.'},indent=2)+'\n')
print('8 unchanged UInt16 native constructor/value/query/clone/equality/default definitions passed literal width and owned-copy checks.')
