from pathlib import Path
import sys
sys.path.insert(0, str(Path.cwd() / "scripts"))
from native_probe_storage import probe_source, identity_json
import json,hashlib,subprocess
root=Path('.agentplane/tasks/202610011119-4H9E82');sw=Path('vendor/libreoffice-reference/sw/source/core/doc/number.cxx').read_text();svx=Path('vendor/libreoffice-reference/editeng/source/items/numitem.cxx').read_text();records=[]
def extract(source,path,marker):
 a=source.index(marker);b=source.index('\n}\n',a)+3;value=source[a:b];records.append(dict(source=path,marker=marker,sha256=hashlib.sha256(value.encode()).hexdigest(),text=value));return value
# Named string/Unicode adapter: ASCII ListFormat profiles, native bullet values emitted as code points.
previous=probe_source(Path('.agentplane/tasks/202609302319-9KTM99/native-marker-oracle.cxx')).read_text()
a=previous.index('struct OUString {');b=previous.index('namespace css::lang',a)
strings=previous[a:b].replace(' char operator[]',' char operator[]')
strings+='\nbool operator==(const OUString&a,const OUString&b){return a.value==b.value;}\nOUString operator""_ustr(const char16_t* s,size_t){return OUString(s);}\nusing UIName=OUString;\n'
pre=r'''
#include <string>
#include <vector>
#include <optional>
#include <memory>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <cassert>
#include <cstdint>
#include <climits>
using sal_Int32=int32_t;using sal_Int16=int16_t;using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;using sal_UCS4=uint32_t;using SvxNumType=int;
constexpr int MAXLEVEL=10,NUM_RULE=1,OUTLINE_RULE=0,RULE_END=2,SVX_NUM_ARABIC=0,SVX_NUM_CHAR_SPECIAL=1,SVX_NUM_NUMBER_NONE=2,SVX_DEF_BULLET=0xF095,COL_BLACK=0;
using SwNumRuleType=int;
#define OSL_ENSURE(c,m) assert(c)
namespace tools {using Long=int64_t;}
// Named platform aliases: valid enum/default profiles, no native style registration, graphics or fonts except scalar font-family presence/equality.
namespace text::VertOrientation {constexpr int NONE=0;}
namespace o3tl {enum class Length {in,in100};template<typename T>constexpr tools::Long toTwips(T n,Length unit){return static_cast<tools::Long>(n*(unit==Length::in?1440:14.4));}}
namespace SvxAdjust {constexpr int Left=0;}
namespace SwPoolFormatId {constexpr int UNKNOWN=0;}
constexpr tools::Long lNumberIndent=360,lNumberFirstLineOffset=-360,lOutlineMinTextDistance=216;
namespace numfunc {sal_UCS4 GetBulletChar(sal_uInt8 n){constexpr int chars[]={0x2022,0x25e6,0x25aa};return chars[n%3];}}
struct SvxNumberType {int type;bool show=true;SvxNumberType(int n):type(n){}int GetNumberingType()const{return type;}void SetNumberingType(int n){type=n;}bool IsShowSymbol()const{return show;}void SetShowSymbol(bool n){show=n;}};
struct SvxBrushItem {int value=0;bool operator==(const SvxBrushItem&)const=default;};
struct Font {std::string family;bool operator==(const Font&)const=default;};
struct Size {int value=0;bool operator==(const Size&)const=default;};
'''
classes=r'''
struct SvxNumberFormat:SvxNumberType {
 enum SvxNumPositionAndSpaceMode {LABEL_WIDTH_AND_POSITION,LABEL_ALIGNMENT};enum {LISTTAB,NOTHING,SPACE};
 int eNumAdjust,nBulletRelSize,nBulletColor,eVertOrient;sal_uInt8 nInclUpperLevels;sal_uInt16 nStart;sal_UCS4 cBullet;
 SvxNumPositionAndSpaceMode mePositionAndSpaceMode;sal_Int32 nFirstLineOffset,nAbsLSpace;sal_Int16 nCharTextDistance;
 int meLabelFollowedBy;tools::Long mnListtabPos,mnFirstLineIndent,mnIndentAt;
 OUString sPrefix,sSuffix,sCharStyleName;std::optional<OUString>sListFormat;Size aGraphicSize;bool mbIsLegal=false;
 std::unique_ptr<SvxBrushItem>pGraphicBrush;std::optional<Font>pBulletFont;
 SvxNumberFormat(SvxNumType);SvxNumberFormat(const SvxNumberFormat&);SvxNumberFormat&operator=(const SvxNumberFormat&);bool operator==(const SvxNumberFormat&)const;
 void SetPrefix(const OUString&);void SetSuffix(const OUString&);void SetListFormat(const OUString&,const OUString&,int);void SetListFormat(std::optional<OUString>);OUString GetListFormat(bool=true)const;
 void SetIncludeUpperLevels(int n){nInclUpperLevels=n;}void SetStart(int n){nStart=n;}void SetAbsLSpace(int n){nAbsLSpace=n;}void SetFirstLineOffset(int n){nFirstLineOffset=n;}
 void SetBulletChar(int n){cBullet=n;}void SetPositionAndSpaceMode(SvxNumPositionAndSpaceMode n){mePositionAndSpaceMode=n;}void SetLabelFollowedBy(int n){meLabelFollowedBy=n;}
 void SetListtabPos(int n){mnListtabPos=n;}void SetFirstLineIndent(int n){mnFirstLineIndent=n;}void SetIndentAt(int n){mnIndentAt=n;}void SetCharTextDistance(int n){nCharTextDistance=n;}
 const OUString&GetPrefix()const{return sPrefix;}const OUString&GetSuffix()const{return sSuffix;}int GetIncludeUpperLevels()const{return nInclUpperLevels;}int GetVertOrient()const{return eVertOrient;}
 bool HasListFormat()const{return sListFormat.has_value();}const SvxBrushItem*GetBrush()const{return pGraphicBrush.get();}const Size&GetGraphicSize()const{return aGraphicSize;}
 void SetGraphicBrush(const SvxBrushItem* brush,const Size* size,const sal_Int16* orient){assert(!brush);aGraphicSize=*size;eVertOrient=*orient;}
};
struct SwClient {void* registration;SwClient(void* p):registration(p){}void*GetRegisteredInNonConst()const{return registration;}void*GetRegisteredIn()const{return registration;}void StartListeningToSameModifyAs(const SwClient&r){registration=r.registration;}};
struct Vertical {int value;Vertical(int,int n):value(n){}};
struct SwNumFormat:SvxNumberFormat,SwClient {
 Vertical m_aVertOrient;sal_uInt16 m_cGrfBulletCP;
 SwNumFormat();SwNumFormat(const SwNumFormat&);SwNumFormat&operator=(const SwNumFormat&);bool operator==(const SwNumFormat&)const;bool operator!=(const SwNumFormat&r)const{return !(*this==r);}
};
struct SwNumRule {
 void*mpNumRuleMap;UIName msName;SwNumRuleType meRuleType;int mnPoolFormatId,mnPoolHelpId,mnPoolHlpFileId;
 bool mbAutoRuleFlag,mbInvalidRuleFlag,mbContinusNum,mbAbsSpaces,mbHidden,mbCountPhantoms,mbUsedByRedline;
 SvxNumberFormat::SvxNumPositionAndSpaceMode meDefaultNumberFormatPositionAndSpaceMode;OUString msDefaultListId;
 std::unique_ptr<SwNumFormat> maFormats[MAXLEVEL];
 static inline sal_uInt16 snRefCount=0;static SwNumFormat*saBaseFormats[RULE_END][MAXLEVEL];static SwNumFormat*saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL];static const sal_uInt16 saDefNumIndents[MAXLEVEL];
 SwNumRule(UIName,SvxNumberFormat::SvxNumPositionAndSpaceMode,SwNumRuleType=NUM_RULE);SwNumRule(const SwNumRule&);
 const SwNumFormat&Get(sal_uInt16)const;const SwNumFormat*GetNumFormat(sal_uInt16)const;void Set(sal_uInt16,const SwNumFormat&);
 static sal_uInt16 GetNumIndent(sal_uInt8);int GetPoolFormatId()const{return mnPoolFormatId;}int GetPoolHelpId()const{return mnPoolHelpId;}int GetPoolHlpFileId()const{return mnPoolHlpFileId;}
};
SwNumFormat*SwNumRule::saBaseFormats[RULE_END][MAXLEVEL]={};SwNumFormat*SwNumRule::saLabelAlignmentBaseFormats[RULE_END][MAXLEVEL]={};
'''
# Actual unchanged native constants array.
a=sw.index('const sal_uInt16 SwNumRule::saDefNumIndents');b=sw.index('\n};',a)+3;constants=sw[a:b]
records.append(dict(source='sw/source/core/doc/number.cxx',marker='saDefNumIndents',sha256=hashlib.sha256(constants.encode()).hexdigest(),text=constants))
definitions=[]
for marker in ['SvxNumberFormat::SvxNumberFormat( SvxNumType eType )','SvxNumberFormat::SvxNumberFormat(const SvxNumberFormat& rFormat)','SvxNumberFormat& SvxNumberFormat::operator=(', 'bool  SvxNumberFormat::operator==(', 'void SvxNumberFormat::SetPrefix(', 'void SvxNumberFormat::SetSuffix(', 'void SvxNumberFormat::SetListFormat(const OUString&', 'void SvxNumberFormat::SetListFormat(std::optional','OUString SvxNumberFormat::GetListFormat(']:definitions.append(extract(svx,'editeng/source/items/numitem.cxx',marker))
for marker in ['SwNumFormat::SwNumFormat() :','SwNumFormat::SwNumFormat( const SwNumFormat&','SwNumFormat& SwNumFormat::operator=(', 'bool SwNumFormat::operator==(', 'sal_uInt16 SwNumRule::GetNumIndent(', 'SwNumRule::SwNumRule( UIName aNm,','SwNumRule::SwNumRule( const SwNumRule&','const SwNumFormat& SwNumRule::Get( sal_uInt16 i ) const','const SwNumFormat* SwNumRule::GetNumFormat( sal_uInt16 i ) const','void SwNumRule::Set( sal_uInt16 i, const SwNumFormat& rNumFormat )']:definitions.append(extract(sw,'sw/source/core/doc/number.cxx',marker))
main=r'''
void dump(const SwNumFormat&f){std::cout<<'['<<f.GetNumberingType()<<','<<f.nStart<<','<<int(f.nInclUpperLevels)<<','<<f.cBullet<<','<<f.nAbsLSpace<<','<<f.nFirstLineOffset<<','<<f.nCharTextDistance<<','<<f.mnFirstLineIndent<<','<<f.mnIndentAt<<','<<f.mnListtabPos<<','<<f.meLabelFollowedBy<<','<<f.mePositionAndSpaceMode<<','<<std::quoted(f.sPrefix.value)<<','<<std::quoted(f.sSuffix.value)<<','<<(f.sListFormat?"true":"false")<<','<<std::quoted(f.sListFormat?f.sListFormat->value:"")<<']';}
int main(){std::cout<<"{\"defaults\":[";bool first=true;
 for(int type=0;type<2;type++)for(int mode=0;mode<2;mode++)for(int level=0;level<10;level++){
  SwNumRule rule("rule",static_cast<SvxNumberFormat::SvxNumPositionAndSpaceMode>(mode),type);
  if(!first)std::cout<<',';first=false;std::cout<<"{\"type\":"<<type<<",\"mode\":"<<mode<<",\"level\":"<<level<<",\"raw\":"<<(rule.GetNumFormat(level)?"true":"false")<<",\"value\":";dump(rule.Get(level));std::cout<<'}';
 }
 std::cout<<"],\"ownership\":[";
 for(int change=0;change<19;change++){
  SwNumRule rule("rule",SvxNumberFormat::LABEL_ALIGNMENT);SwNumRule shared("other",SvxNumberFormat::LABEL_ALIGNMENT);
  bool sameDefault=&rule.Get(2)==&shared.Get(2);rule.Set(2,rule.Get(2));auto*owned=rule.GetNumFormat(2);SwNumFormat input(*owned);
  switch(change){case 0:break;case 1:input.SetStart(7);break;case 2:input.SetIncludeUpperLevels(3);break;case 3:input.SetPrefix("[");break;case 4:input.SetSuffix("]");break;
   case 5:input.SetListFormat(OUString(""));break;case 6:input.SetListFormat(std::nullopt);break;case 7:input.nAbsLSpace=11;break;case 8:input.nFirstLineOffset=-11;break;case 9:input.nCharTextDistance=11;break;
   case 10:input.mnFirstLineIndent=-11;break;case 11:input.mnIndentAt=11;break;case 12:input.mnListtabPos=11;break;case 13:input.meLabelFollowedBy=SvxNumberFormat::NOTHING;break;
   case 14:input.SetPositionAndSpaceMode(SvxNumberFormat::LABEL_WIDTH_AND_POSITION);break;case 15:input.SetNumberingType(SVX_NUM_CHAR_SPECIAL);break;case 16:input.SetNumberingType(SVX_NUM_NUMBER_NONE);break;case 17:input.SetBulletChar(0x25cf);break;case 18:input.pBulletFont=Font{"Alternate"};break;
  }
  rule.mbInvalidRuleFlag=false;rule.Set(2,input);SwNumRule copy(rule);int ownedCount=0,copyCount=0;for(int n=0;n<10;n++){ownedCount+=rule.GetNumFormat(n)!=nullptr;copyCount+=copy.GetNumFormat(n)!=nullptr;}
  if(change)std::cout<<',';std::cout<<"{\"change\":"<<change<<",\"sharedDefault\":"<<(sameDefault?"true":"false")<<",\"identityRetained\":"<<(rule.GetNumFormat(2)==owned?"true":"false")<<",\"invalid\":"<<(rule.mbInvalidRuleFlag?"true":"false")<<",\"ownedCount\":"<<ownedCount<<",\"copyCount\":"<<copyCount<<",\"copyIndependent\":"<<(copy.GetNumFormat(2)!=rule.GetNumFormat(2)?"true":"false")<<",\"copyEqual\":"<<(copy.Get(2)==rule.Get(2)?"true":"false")<<",\"value\":";dump(rule.Get(2));std::cout<<'}';
 }
 std::cout<<"]}\n";
 // Named fixture teardown for shared static arrays; native rule destructor/map/graphic-link lifetime is not included or certified.
 for(int t=0;t<2;t++)for(int l=0;l<10;l++){delete SwNumRule::saBaseFormats[t][l];delete SwNumRule::saLabelAlignmentBaseFormats[t][l];}
}
'''
cpp=pre+strings+classes+constants+'\n'.join(definitions)+main
probe_source(root.joinpath('native-rule-formats.cxx')).write_text(cpp)
root.joinpath('native-source-identity.json').write_text(identity_json(dict(pin='9bc445578031fecf56086729d8e4940c77e14d65',definitions=records,adapters=['ASCII OUString/ListFormat and numeric Unicode codepoints; valid rule enums and default Twip conversions','SwClient registration is null; fonts use scalar family values; no live graphics','primitive inline setters/platform constants are declaration adapters; source factory/format/rule constructor/copy/equality/Get/Set bodies unchanged','native full static destructor/refcount release, map/graphic link/client/style/font/color/locale lifetimes are not certified']),indent=2)+'\n')
binary=root/'native-rule-formats'
try:
 subprocess.run(['clang++','-std=c++20','-fsanitize=address,undefined',str(probe_source(root/'native-rule-formats.cxx')),'-o',str(binary)],check=True)
 result=json.loads(subprocess.check_output([str(binary)],text=True));root.joinpath('native-results.json').write_text(identity_json(result,indent=2)+'\n')
 fixture=Path('apps/office/src/sw/source/core/doc/number-ownership-native.json');fixture.write_text(identity_json(result,indent=2)+'\n')
 print('PASS',len(records),'unchanged definitions/constants;',len(result['defaults']),'base states;',len(result['ownership']),'ownership/equality states; ASan/UBSan')
finally:binary.unlink(missing_ok=True)
