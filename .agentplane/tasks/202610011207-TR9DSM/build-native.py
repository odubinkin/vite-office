from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json,hashlib
root=Path('vendor/libreoffice-reference');out=Path('.agentplane/tasks/202610011207-TR9DSM')
manifest=[]
def body(path,signature):
 s=(root/path).read_text();start=s.index(signature);op=s.index('{',start);d=1;i=op+1
 while d:
  d+=(s[i]=='{')-(s[i]=='}');i+=1
 text=s[start:i];manifest.append({'path':path,'signature':signature,'sha256':hashlib.sha256(text.encode()).hexdigest()});return text
num='editeng/source/items/numitem.cxx';font='vcl/source/font/font.cxx'
old=probe_source(Path('.agentplane/tasks/202610011119-4H9E82/native-rule-formats.cxx')).read_text().split('void dump(')[0]
# Native enum constants now use the pinned UNO values rather than the old trace's normalized type indices.
old=old.replace('SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2','SVX_NUM_ARABIC=4,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_NUMBER_NONE=5')
a=old.index('struct SvxNumberType');b=old.index('struct SvxBrushItem',a);old=old[:a]+old[b:]
a=old.index('struct Font {');b=old.index('struct Size',a);old=old[:a]+old[b:]
insert=old.index('struct SvxNumberFormat:')
numbertype='''// Native service lifetime is not asserted by this format-value profile.
struct SvxNumberType { static inline int nRefCount=0; int nNumType; bool bShowSymbol; SvxNumberType(SvxNumType);SvxNumberType(const SvxNumberType&); int GetNumberingType()const{return nNumType;}void SetNumberingType(int nSet){nNumType=nSet;}bool IsShowSymbol()const{return bShowSymbol;}void SetShowSymbol(bool bSet){bShowSymbol=bSet;} };
'''+body(num,'SvxNumberType::SvxNumberType(SvxNumType nType)')+'\n'+body(num,'SvxNumberType::SvxNumberType(const SvxNumberType& rType)')
fontprofile='''
// Named family-only ImplFont and COW platform adapter. Native other Font attributes/equality remain unverified.
struct ImplFont { OUString name; const OUString&GetFamilyName()const{return name;}void SetFamilyName(const OUString&s){name=s;} };
struct FontCow { std::shared_ptr<ImplFont> ptr=std::make_shared<ImplFont>();const ImplFont*operator->()const{return ptr.get();}ImplFont*operator->(){if(ptr.use_count()!=1)ptr=std::make_shared<ImplFont>(*ptr);return ptr.get();} };
namespace vcl {struct Font {using ImplType=FontCow;ImplType mpImplFont;Font();Font(const Font&);const OUString&GetFamilyName()const;void SetFamilyName(const OUString&);bool operator==(const Font&r)const{return GetFamilyName()==r.GetFamilyName();} };}
using vcl::Font;
'''+body(font,'Font::ImplType& GetGlobalDefault()')+'\n'+body(font,'Font::Font() :')+'\n'+body(font,'Font::Font( const vcl::Font& rFont )')+'\n'+body(font,'void Font::SetFamilyName(')+'\n'+body(font,'const OUString& Font::GetFamilyName() const')+'\n'
old=old[:insert]+numbertype+fontprofile+old[insert:]
old=old.replace('void SetPrefix(const OUString&);','void SetBulletFont(const vcl::Font*);void SetPrefix(const OUString&);')
old+='\n'+body(num,'void SvxNumberFormat::SetBulletFont(')
old+='''
void state(const SvxNumberFormat&f){std::cout<<"["<<f.GetNumberingType()<<","<<(f.IsShowSymbol()?"true":"false")<<","<<f.cBullet<<","<<(f.pBulletFont?"true":"false")<<",\\\""<<(f.pBulletFont?f.pBulletFont->GetFamilyName().value:"")<<"\\\","<<int(f.nStart)<<","<<int(f.nInclUpperLevels)<<","<<f.nAbsLSpace<<","<<f.nFirstLineOffset<<","<<f.nCharTextDistance<<","<<f.mnFirstLineIndent<<","<<f.mnIndentAt<<","<<f.mnListtabPos<<","<<f.meLabelFollowedBy<<","<<f.mePositionAndSpaceMode<<",\\\""<<f.sPrefix.value<<"\\\",\\\""<<f.sSuffix.value<<"\\\","<<(f.HasListFormat()?"true":"false")<<"]";}
int main(){std::cout<<"{\\\"defaults\\\":[";for(int type:{4,5,6,8}){if(type!=4)std::cout<<",";SvxNumberFormat f(type);state(f);}SwNumFormat sw;std::cout<<",";state(sw);std::cout<<"],\\\"glyphs\\\":[";bool first=true;for(int64_t v:{int64_t(0),int64_t(1),int64_t(61589),int64_t(128578),int64_t(4294967295),int64_t(-1)}){if(!first)std::cout<<",";first=false;SwNumFormat f;f.SetBulletChar(v);SwNumFormat copy(f);state(copy);}std::cout<<"],\\\"fonts\\\":[";
SvxNumberFormat f(4);Font source;f.SetBulletFont(&source);state(f);Font copied(source);source.SetFamilyName("changed");std::cout<<",";state(f);source.SetFamilyName("OpenSymbol");f.SetBulletFont(&source);SvxNumberFormat copy(f);source.SetFamilyName("changed-again");std::cout<<",";state(copy);copy.SetBulletFont(nullptr);std::cout<<",";state(copy);std::cout<<"],\\\"equality\\\":[";
for(int change=0;change<6;change++){if(change)std::cout<<",";SwNumFormat a,b(a);switch(change){case 1:b.SetShowSymbol(false);break;case 2:b.SetNumberingType(5);break;case 3:b.SetBulletChar(128578);break;case 4:b.SetBulletFont(&copied);break;case 5:b.SetBulletFont(&source);break;}std::cout<<(a==b?"true":"false");}std::cout<<"]}";}
'''
# Inline getters/setters are also inserted verbatim from their native header bodies.
header='include/editeng/numitem.hxx'
inline=[body(header,sig).strip() for sig in ['    void            SetNumberingType(', '    SvxNumType      GetNumberingType()', '    void            SetShowSymbol(', '    bool            IsShowSymbol()']]
start=old.index(' int GetNumberingType()const{return nNumType;}')
end=old.index(' };',start)
old=old[:start]+'\n'+'\n'.join(inline)+old[end:]
glyphSetter=body(header,'    void            SetBulletChar(').strip()
old=old.replace('void SetBulletChar(int n){cBullet=n;}',glyphSetter)
old=old.replace('SvxNumberFormat(SvxNumType);',body(header,'    const std::optional<vcl::Font>& GetBulletFont()').strip()+'\n'+body(header,'    sal_UCS4        GetBulletChar()').strip()+'\n SvxNumberFormat(SvxNumType);')
old=old.replace('<<f.cBullet<<','<<f.GetBulletChar()<<').replace('f.pBulletFont','f.GetBulletFont()')
(probe_source(out/'native-format-values.cxx')).write_text(old)
# Complete native NumberType bodies with a named bounded provider, no UNO service initialization equivalence claim.
preamble=r'''
#include <string>
#include <vector>
#include <iostream>
#include <memory>
#include <cstdint>
#include <stdexcept>
using sal_Int32=int32_t;using sal_uInt16=uint16_t;using SvxNumType=int;
constexpr int SVX_NUM_ARABIC=4,SVX_NUM_NUMBER_NONE=5,SVX_NUM_CHAR_SPECIAL=6,SVX_NUM_BITMAP=8,SVX_NUM_ARABIC_ZERO=64,SVX_NUM_ARABIC_ZERO3=65,SVX_NUM_ARABIC_ZERO4=66,SVX_NUM_ARABIC_ZERO5=67;
// Named bounded OUString/UNO property/locale/reference platform adapters; scalar decimal values only.
struct OUString {char text[128]{};constexpr OUString()=default;constexpr OUString(char c){text[0]=c;}constexpr OUString(const char16_t*s){int i=0;while(s[i]){text[i]=static_cast<char>(s[i]);i++;}} OUString(std::string s){s.copy(text,127);}static OUString number(int v){return std::to_string(v);}bool operator==(const OUString&r)const{return std::string(text)==r.text;}};
constexpr OUString operator""_ustr(const char16_t*s,size_t){return OUString(s);}
struct Exception:std::exception{};
namespace css {namespace lang {struct Locale{};}namespace style {namespace NumberingType {constexpr int ARABIC=4,NUMBER_NONE=5,CHAR_SPECIAL=6,BITMAP=8;}}}
using namespace css::style;
struct PropertyValue{OUString key;int value;};template<typename T>using Sequence=std::vector<T>;
namespace comphelper {PropertyValue makePropertyValue(OUString key,int value){return {key,value};}}
// Provider adapter uses the pinned makeNumberingString nonpositive-value exception and only existing ARABIC/NONE branches.
struct Formatter {OUString makeNumberingString(const Sequence<PropertyValue>&p,const css::lang::Locale&)const{int type=p[0].value,value=p[1].value;if(value<=0)throw Exception{};return type==4?OUString::number(value):OUString();}};
struct Reference {std::shared_ptr<Formatter>ptr;bool is()const{return bool(ptr);}Formatter*operator->()const{return ptr.get();}Reference&operator=(std::nullptr_t){ptr.reset();return *this;}};
void lcl_getFormatter(Reference&r){if(!r.is())r.ptr=std::make_shared<Formatter>();}
struct SvxNumberType {static inline int nRefCount=0;static inline Reference xFormatter;int nNumType;bool bShowSymbol;SvxNumberType(SvxNumType);SvxNumberType(const SvxNumberType&);~SvxNumberType();OUString GetNumStr(sal_Int32,const css::lang::Locale&,bool=false)const;
void SetNumberingType(SvxNumType nSet){nNumType=nSet;}SvxNumType GetNumberingType()const{return nNumType;}void SetShowSymbol(bool bSet){bShowSymbol=bSet;}bool IsShowSymbol()const{return bShowSymbol;}
bool IsTextFormat()const{return css::style::NumberingType::NUMBER_NONE!=nNumType&&css::style::NumberingType::CHAR_SPECIAL!=nNumType&&css::style::NumberingType::BITMAP!=nNumType;}};
'''
for sig in ['SvxNumberType::SvxNumberType(SvxNumType nType)','SvxNumberType::SvxNumberType(const SvxNumberType& rType)','SvxNumberType::~SvxNumberType()','static bool isArabicNumberingType(SvxNumType t)','OUString SvxNumberType::GetNumStr( sal_Int32 nNo, const css::lang::Locale& rLocale, bool bIsLegal ) const']:
 preamble+='\n'+body(num,sig)
preamble+=r'''
int main(){std::cout<<"[";bool first=true;for(int type:{4,5,6,8})for(bool show:{true,false})for(bool legal:{false,true})for(int64_t input:{int64_t(0),int64_t(1),int64_t(7),int64_t(-1),int64_t(32767),int64_t(65535),int64_t(2147483647),int64_t(2147483648),int64_t(4294967295)}){SvxNumberType original(type);original.SetShowSymbol(show);SvxNumberType copy(original);if(!first)std::cout<<",";first=false;auto s=copy.GetNumStr(static_cast<sal_Int32>(input),{},legal);std::cout<<"["<<type<<","<<(show?"true":"false")<<","<<(legal?"true":"false")<<","<<input<<",\""<<s.text<<"\","<<(copy.IsTextFormat()?"true":"false")<<"]";}std::cout<<"]";}
'''
start=preamble.index('void SetNumberingType(SvxNumType nSet){nNumType=nSet;}')
end=preamble.index('};',start)
isText=body(header,'    bool            IsTextFormat() const').strip()
preamble=preamble[:start]+'\n'+'\n'.join(inline)+'\n'+isText+preamble[end:]
(probe_source(out/'native-number-type.cxx')).write_text(preamble)
(out/'native-source-identities.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':manifest,'scope':'Complete native bodies unchanged. Named platform adapters bound to available decimal provider, null Writer clients, family-only Font/COW, and previously supported format fields. No native global lifetime, other Font attributes/equality, graphics, style registrations or wider numbering family equivalence.'},indent=2)+'\n')

# Previously extracted format/Writer bodies must still exactly match their pinned complete source definitions.
for path, signatures in [
 (num, ['SvxNumberFormat::SvxNumberFormat( SvxNumType eType )', 'SvxNumberFormat::SvxNumberFormat(const SvxNumberFormat& rFormat)', 'SvxNumberFormat& SvxNumberFormat::operator=', 'bool  SvxNumberFormat::operator==']),
 ('sw/source/core/doc/number.cxx', ['SwNumFormat::SwNumFormat()', 'SwNumFormat::SwNumFormat( const SwNumFormat& rFormat)', 'bool SwNumFormat::operator=='])]:
 for signature in signatures:
  text=body(path,signature)
  assert text in old, signature
# Source precondition and selected provider arms are adapter evidence, not a claim to compile the full provider.
for path,markers in [('i18npool/source/defaultnumberingprovider/defaultnumberingprovider.cxx',['if( number <= 0 )','case ARABIC:','case NUMBER_NONE:']),('include/editeng/numdef.hxx',['#define SVX_DEF_BULLET (0xF000 + 149)']),('offapi/com/sun/star/style/NumberingType.idl',['const short ARABIC = 4;','const short NUMBER_NONE = 5;','const short CHAR_SPECIAL = 6;','const short BITMAP = 8;']),('editeng/Library_editeng.mk',['gb_Library_use_libraries,editeng','    vcl '])]:
 contents=(root/path).read_text()
 for marker in markers:
  assert marker in contents, marker
 manifest.append({'path':path,'markers':markers,'fileSha256':hashlib.sha256(contents.encode()).hexdigest()})
(out/'native-source-identities.json').write_text(identity_json({'pin':'9bc445578031fecf56086729d8e4940c77e14d65','definitions':manifest,'scope':'Complete native bodies unchanged. Named platform adapters bounded to available decimal provider, null Writer clients, family-only Font/COW, and previously supported format fields. Inline header getters/setters are represented in profile declarations; full UNO provider/initialization/global lifetime/Font attributes/equality/graphics/style registrations and wider numbering families remain unverified.'},indent=2)+'\n')
