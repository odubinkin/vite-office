/** @fileoverview Compiles unchanged pinned RTFSprms algorithms, nested helpers, SvRef owners and scalar RTFValue queries/equality with an explicit scalar/nested carrier for other RTFValue members; captures source property-tree witnesses under ASan/UBSan. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";
import { definition } from "./rtl-string-convert-native-probe.mjs";
const base = "vendor/libreoffice-reference/";
const paths = [
  "sw/source/writerfilter/rtftok/rtfsprm.cxx",
  "sw/source/writerfilter/rtftok/rtfsprm.hxx",
  "sw/source/writerfilter/rtftok/rtfvalue.cxx",
  "sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx",
  "include/tools/ref.hxx",
  "tools/source/ref/ref.cxx",
  "sw/source/writerfilter/ooxml/resourceids.py",
  "sw/source/writerfilter/ooxml/model.xml",
];
const sources = paths.map(
  /** Reads exact pinned bytes. @param path - Source. @returns Contents. */ (path) =>
    readFileSync(base + path, "utf8"),
);
const [sprm, header, value, doc, ref] = sources;
const ids = execFileSync("python3", [base + paths[6], base + paths[7]], {
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
const constants = [...ids.matchAll(/const Id (\w+) = (\d+);/g)]
  .map(
    /** Keeps original generated identities. @param match - Declaration. @returns Original text. */ (
      match,
    ) => match[0],
  )
  .join("\n");
const functions = [
  "RTFValue::Pointer_t RTFSprms::find(",
  "void RTFSprms::set(",
  "bool RTFSprms::erase(",
  "void RTFSprms::eraseLast(",
  "static RTFValue::Pointer_t getDefaultSPRM(",
  "static bool isSPRMDeduplicateDenylist(",
  "static bool isSPRMChildrenExpected(",
  "static void cloneAndDeduplicateSprm(",
  "static RTFValue::Pointer_t getListLevel(",
  "void RTFSprms::deduplicateList(",
  "void RTFSprms::duplicateList(",
  "RTFSprms RTFSprms::cloneAndDeduplicate(",
  "bool RTFSprms::equals(",
  "void RTFSprms::ensureCopyBeforeWrite(",
  "RTFSprms::RTFSprms()",
  "RTFSprms::RTFSprms(RTFSprms const& source",
  "void RTFSprms::clear(",
];
const helpers = [
  "Id getParagraphBorder(",
  "void putNestedAttribute(",
  "void putNestedSprm(",
  "RTFValue::Pointer_t getNestedAttribute(",
  "RTFValue::Pointer_t getNestedSprm(",
  "bool eraseNestedAttribute(",
];
const driver = `
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>
#define TOOLS_DLLPUBLIC
#define SAL_DLLPUBLIC_RTTI
#define COVERITY_NOEXCEPT_FALSE
using Id=std::uint32_t; using sal_uInt32=std::uint32_t;
const int COL_AUTO=-1;
namespace NS_ooxml { ${constants} }
${definition(ref, "class TOOLS_DLLPUBLIC SvRefBase")};
SvRefBase::~SvRefBase() {}
namespace tools { ${definition(ref, "template<typename T> class SAL_DLLPUBLIC_RTTI SvRef final")}; }
struct OUString { std::u16string data; OUString()=default; OUString(const char16_t* p):data(p){} bool isEmpty()const{return data.empty();} bool operator==(const OUString&)const=default; static OUString number(int n){OUString s;for(auto c:std::to_string(n))s.data.push_back(c);return s;} };
OUString operator""_ustr(const char16_t* p,std::size_t){return OUString(p);}
class RTFSprms;
class RTFValue:public virtual SvRefBase {
public:
 using Pointer_t=tools::SvRef<RTFValue>;
 int m_nValue=0; OUString m_sValue; bool m_bForceString=false;
 mutable tools::SvRef<RTFSprms> m_pAttributes,m_pSprms;
 RTFValue()=default; explicit RTFValue(int n):m_nValue(n){} RTFValue(OUString s,bool f=false):m_sValue(s),m_bForceString(f){}
 explicit RTFValue(const RTFSprms&);RTFValue(const RTFSprms&,const RTFSprms&);~RTFValue()override;
 int getInt()const;OUString getString()const;void setString(const OUString&);bool equals(const RTFValue&)const;
 RTFSprms& getAttributes()const;RTFSprms& getSprms()const;RTFValue* Clone()const;RTFValue* CloneWithSprms(const RTFSprms&,const RTFSprms&)const;
};
using RTFSprmsImplBase=std::vector<std::pair<Id,RTFValue::Pointer_t>>;
${definition(header, "class RTFSprmsImpl :")};
${definition(header, "enum class RTFConflictPolicy")};
${definition(header, "class RTFSprms :")};
RTFValue::RTFValue(const RTFSprms&a):m_pAttributes(new RTFSprms(a)){}
RTFValue::RTFValue(const RTFSprms&a,const RTFSprms&s):m_pAttributes(new RTFSprms(a)),m_pSprms(new RTFSprms(s)){}
RTFValue::~RTFValue()=default;
RTFValue* RTFValue::Clone()const{auto p=new RTFValue(m_sValue,m_bForceString);p->m_nValue=m_nValue;if(m_pAttributes)p->m_pAttributes=new RTFSprms(*m_pAttributes);if(m_pSprms)p->m_pSprms=new RTFSprms(*m_pSprms);return p;}
RTFValue* RTFValue::CloneWithSprms(const RTFSprms&a,const RTFSprms&s)const{auto p=new RTFValue(a,s);p->m_nValue=m_nValue;p->m_sValue=m_sValue;p->m_bForceString=m_bForceString;return p;}
${["int RTFValue::getInt()", "OUString RTFValue::getString()", "void RTFValue::setString(", "bool RTFValue::equals(", "RTFSprms& RTFValue::getAttributes()", "RTFSprms& RTFValue::getSprms()"].map(/** Retains source value decisions verbatim. @param marker - Definition. @returns Source. */ (marker) => definition(value, marker)).join("\n")}
void putNestedAttribute(RTFSprms&,Id,Id,const RTFValue::Pointer_t&,RTFConflictPolicy=RTFConflictPolicy::Overwrite,bool=true);
void putNestedSprm(RTFSprms&,Id,Id,const RTFValue::Pointer_t&,RTFConflictPolicy=RTFConflictPolicy::Overwrite);
RTFValue::Pointer_t getNestedAttribute(RTFSprms&,Id,Id);RTFValue::Pointer_t getNestedSprm(RTFSprms&,Id,Id);bool eraseNestedAttribute(RTFSprms&,Id,Id);
${helpers.map(/** Retains exact nested helpers. @param marker - Definition. @returns Source. */ (marker) => definition(doc, marker)).join("\n")}
${definition(sprm, "class RTFSprms_compare")};
${functions.map(/** Retains full source algorithms. @param marker - Definition. @returns Source. */ (marker) => definition(sprm, marker)).join("\n")}
RTFSprms::~RTFSprms()=default;
void dump(RTFSprms const&);
void str(OUString s){std::cout<<'"';for(auto c:s.data)std::cout<<char(c);std::cout<<'"';}
void val(RTFValue const&v){std::cout<<'['<<v.getInt()<<',';str(v.getString());std::cout<<',';dump(v.getAttributes());std::cout<<',';dump(v.getSprms());std::cout<<']';}
void dump(RTFSprms const&s){std::cout<<'[';bool first=true;for(auto&e:const_cast<RTFSprms&>(s)){if(!first)std::cout<<',';first=false;std::cout<<'['<<e.first<<',';val(*e.second);std::cout<<']';}std::cout<<']';}
void emit(const char*name,RTFSprms const&s){std::cout<<name<<'\\t';dump(s);std::cout<<'\\n';}
int main(){using namespace NS_ooxml;
 {RTFSprms s;s.set(1,new RTFValue(10));s.set(1,new RTFValue(20),RTFConflictPolicy::Append);s.set(2,new RTFValue(30));s.set(1,new RTFValue(40));s.set(1,new RTFValue(50),RTFConflictPolicy::Ignore);emit("policies",s);s.eraseLast(1);emit("eraseLast",s);s.set(1,new RTFValue(60),RTFConflictPolicy::ReplaceAtStart);emit("prepend",s);s.erase(1);emit("eraseFirst",s);}
 {RTFSprms a;a.set(1,new RTFValue(10));RTFSprms b(a);b.find(1)->setString(u"shared"_ustr);emit("readAliasA",a);emit("readAliasB",b);b.find(1,true,true)->setString(u"isolated"_ustr);emit("writeA",a);emit("writeB",b);b.clear();emit("clearA",a);emit("clearB",b);}
 {RTFSprms a;a.set(1,new RTFValue(5));RTFSprms b;b=a;b.set(1,new RTFValue(6));emit("copyAssignmentA",a);emit("copyAssignmentB",b);RTFSprms c;c=std::move(b);emit("moveAssignment",c);b=RTFSprms();emit("reinitializedMoved",b);RTFSprms d(a,RTFSprms::CopyForWrite());d.find(1)->setString(u"detached"_ustr);emit("copyForWriteA",a);emit("copyForWriteB",d);}
 {RTFSprms a;putNestedAttribute(a,LN_CT_PPrBase_ind,LN_CT_Ind_firstLine,new RTFValue(120));RTFSprms b(a);eraseNestedAttribute(b,LN_CT_PPrBase_ind,LN_CT_Ind_firstLine);emit("nestedEraseA",a);emit("nestedEraseB",b);putNestedAttribute(b,LN_CT_PPrBase_ind,LN_CT_Ind_left,new RTFValue(300));emit("nestedWriteA",a);emit("nestedWriteB",b);}
 {RTFSprms a;putNestedAttribute(a,LN_CT_TcPrBase_shd,LN_CT_Shd_fill,new RTFValue(0x123456));emit("shading",a);}
 {RTFSprms style,direct;style.set(LN_EG_RPrBase_b,new RTFValue(1));style.set(LN_EG_RPrBase_sz,new RTFValue(36));putNestedAttribute(style,LN_EG_RPrBase_rFonts,LN_CT_Fonts_ascii,new RTFValue(u"Arial"_ustr));putNestedAttribute(style,LN_EG_RPrBase_color,LN_CT_Color_val,new RTFValue(0xff0000));putNestedAttribute(style,LN_EG_RPrBase_u,LN_CT_Underline_val,new RTFValue(LN_Value_ST_Underline_double));emit("defaults",direct.cloneAndDeduplicate(style,LN_Value_ST_StyleType_character));emit("paragraphNoCharDefault",direct.cloneAndDeduplicate(style,LN_Value_ST_StyleType_paragraph));direct.set(LN_EG_RPrBase_b,new RTFValue(1));emit("equalCharacter",direct.cloneAndDeduplicate(style,LN_Value_ST_StyleType_character));emit("equalParagraph",direct.cloneAndDeduplicate(style,LN_Value_ST_StyleType_paragraph));}
 {RTFSprms ref,direct;ref.set(LN_CT_TabStop_val,new RTFValue(3));direct.set(LN_CT_TabStop_val,new RTFValue(3));emit("denylist",direct.cloneAndDeduplicate(ref,LN_Value_ST_StyleType_character));}
 {RTFSprms ref,direct;ref.set(LN_CT_Ind_left,new RTFValue(120));direct.set(LN_CT_Ind_left,new RTFValue(120));direct.set(LN_CT_PPrBase_numPr,new RTFValue());emit("listDenylist",direct.cloneAndDeduplicate(ref,LN_Value_ST_StyleType_character,false,&direct));}
 {RTFSprms attrs,child,ref,direct;attrs.set(LN_CT_Ind_firstLine,new RTFValue(120));RTFValue::Pointer_t a(new RTFValue(1)),b(new RTFValue(2));a->getAttributes()=attrs;b->getAttributes()=attrs;ref.set(LN_CT_PPrBase_ind,a);direct.set(LN_CT_PPrBase_ind,b);emit("emptyExpectedChildren",direct.cloneAndDeduplicate(ref,LN_Value_ST_StyleType_character));}
 {RTFSprms attrs,children,ref,direct;attrs.set(LN_CT_Ind_left,new RTFValue(500));children.set(LN_CT_PPrBase_ind,new RTFValue(attrs));ref.set(LN_CT_Style_pPr,new RTFValue(RTFSprms(),children));emit("implicitParagraph",direct.cloneAndDeduplicate(ref,LN_Value_ST_StyleType_paragraph,true));}
 {RTFSprms levelAttrs,levelSprms,abstractSprms,ind;levelAttrs.set(LN_CT_Lvl_ilvl,new RTFValue(0));ind.set(LN_CT_Ind_left,new RTFValue(900));ind.set(LN_CT_Ind_firstLine,new RTFValue(-300));levelSprms.set(LN_CT_PPrBase_ind,new RTFValue(ind));abstractSprms.set(LN_CT_AbstractNum_lvl,new RTFValue(levelAttrs,levelSprms),RTFConflictPolicy::Append);RTFValue::Pointer_t abstract(new RTFValue(RTFSprms(),abstractSprms));RTFSprms direct;direct.duplicateList(abstract);emit("duplicateList",direct);putNestedAttribute(direct,LN_CT_PPrBase_ind,LN_CT_Ind_firstLine,new RTFValue(-300));direct.deduplicateList({{0,-300}});emit("deduplicateList",direct);}
 {RTFValue a,b(u""_ustr,true);std::cout<<"forceEquality\\t"<<(a.equals(b)?"true":"false")<<'\\n';}
}
`;
const out = "output/playwright/rtf-properties-native";
mkdirSync(out, { recursive: true });
writeFileSync(out + "/probe.cxx", driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-omit-frame-pointer",
    out + "/probe.cxx",
    "-o",
    out + "/probe",
  ],
  { stdio: "inherit" },
);
const rows = execFileSync(out + "/probe", { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 })
  .trim()
  .split("\n");
const cases = Object.fromEntries(
  rows.map(
    /** Parses exact native results. @param row - Native line. @returns Named tree. */ (row) => {
      const at = row.indexOf("\t");
      return [row.slice(0, at), JSON.parse(row.slice(at + 1))];
    },
  ),
);
const target = "apps/office/src/sw/source/writerfilter/rtftok/rtf-properties-native.json";
const result = {
  baseline: "9bc445578031fecf56086729d8e4940c77e14d65",
  sourceHashes: Object.fromEntries(
    paths.map(
      /** Hashes full originals. @param path - Path. @param index - Source index. @returns Path/hash. */ (
        path,
        index,
      ) => [path, createHash("sha256").update(sources[index]).digest("hex")],
    ),
  ),
  scope:
    "Unchanged RTFSprms declarations/algorithms, nested helpers, SvRefBase/SvRef and RTFValue scalar queries/equality; OUString and non-query scalar/nested RTFValue construction/clone transport use explicit carriers, not complete SAL/RTFValue/Writer ABI. ASan/UBSan.",
  cases,
};
writeFileSync(
  target,
  await format(JSON.stringify(result), { ...(await resolveConfig(target)), parser: "json" }),
);
console.log(`Native RTF property witness: ${rows.length} source cases, ASan/UBSan passed.`);
