/** @fileoverview Ordinary complete original SearchParam value class and definitions over genuine shared OUString; no TextSearch backend substitutes. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { format, resolveConfig } from "prettier";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, upstream, loadUnicodeOriginal, scope } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/search-param-native",
  fixture = "apps/office/src/unotools/source/i18n/native-search-param-cases.json";
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const path of [
  "include/unotools/textsearch.hxx",
  "unotools/source/i18n/textsearch.cxx",
  "include/unotools/unotoolsdllapi.h",
])
  loadUnicodeOriginal(native.sources, path);
const header = native.sources["include/unotools/textsearch.hxx"],
  start = header.indexOf("class UNOTOOLS_DLLPUBLIC SearchParam"),
  end = header.indexOf("\n};", start);
if (start < 0 || end < 0) throw Error("Missing complete original SearchParam class");
const declaration = header.slice(start, end + 3);
const definitions = scope(
  native.sources["unotools/source/i18n/textsearch.cxx"],
  "SearchParam::SearchParam(",
  "static bool lcl_Equals(",
);
const caller = String.raw`
#include <rtl/ustring.hxx>
#include <unotools/unotoolsdllapi.h>
#include <iostream>
#include <limits>
namespace utl {
${declaration}
${definitions}
}
using S=utl::SearchParam;
void state(const char*name,const S&q){std::cout<<name<<" "<<int(q.GetSrchType())<<" "<<q.IsCaseSensitive()<<" "<<q.GetWildEscChar()<<" "<<q.IsWildMatchSel()<<" ";for(sal_Int32 i=0;i<q.GetSrchStr().getLength();++i)std::cout<<int(q.GetSrchStr()[i])<<",";std::cout<<"\n";}
int main(){
 std::cout<<"enum "<<int(S::SearchType::Normal)<<" "<<int(S::SearchType::Regexp)<<" "<<int(S::SearchType::Wildcard)<<" "<<int(S::SearchType::Unknown)<<"\n";
 for(bool wildcard:{false,true})for(bool regex:{false,true}){bool out=regex;auto type=S::ConvertToSearchType(wildcard,out);std::cout<<"mode "<<wildcard<<" "<<regex<<" "<<int(type)<<" "<<out<<"\n";}
 for(sal_Int32 type:{std::numeric_limits<sal_Int32>::min(),-1,0,1,2,3,std::numeric_limits<sal_Int32>::max()})for(bool wildcard:{false,true})for(bool regex:{false,true}){bool w=wildcard,r=regex;S::ConvertToBool(static_cast<S::SearchType>(type),w,r);std::cout<<"flags "<<type<<" "<<wildcard<<" "<<regex<<" "<<w<<" "<<r<<"\n";}
 OUString text(u"A\0\u03b1\U0001F600",5);S defaults(text,S::SearchType::Normal);state("defaults",defaults);text=u"changed"_ustr;state("retained",defaults);S copy(defaults);state("copy",copy);std::cout<<"borrow "<<(&copy.GetSrchStr()==&defaults.GetSrchStr())<<" "<<(&copy.GetSrchStr()==&copy.GetSrchStr())<<"\n";
 S recipient(text,S::SearchType::Regexp,false,0xffffffffu,true);const OUString&borrowed=recipient.GetSrchStr();recipient=copy;state("assigned",recipient);std::cout<<"stable "<<(&borrowed==&recipient.GetSrchStr())<<" ";for(sal_Int32 i=0;i<borrowed.getLength();++i)std::cout<<int(borrowed[i])<<",";std::cout<<"\n";recipient=recipient;state("selfassigned",recipient);
 OUString inputs[]={OUString(),OUString(u"abc",3),OUString(u"A\0\u03b1\U0001F600",5)};
 for(auto&s:inputs)for(sal_Int32 type:{-1,0,1,2,3})for(bool caseSensitive:{false,true})for(bool match:{false,true})for(sal_uInt32 escape:{0u,92u,0x80000000u,0xffffffffu}){S q(s,static_cast<S::SearchType>(type),caseSensitive,escape,match);state("parameter",q);S copied(q);state("parametercopy",copied);}
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, ["-DNDEBUG", "-I" + upstream + "/include"]);
const output = native.run(binary, [], "complete-values").stdout.toString();
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  declarationHash: hash(declaration),
  definitionsHash: hash(definitions),
  sourceHashes: native.manifest.sourceHashes,
  output,
  byteLength: Buffer.byteLength(output),
  sha256: hash(output),
};
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(data), { ...(await resolveConfig(fixture)), parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Original SearchParam stream changed");
native.manifest.state = "captured";
native.manifest.driverHash = data.driverHash;
native.manifest.capture = { byteLength: data.byteLength, sha256: data.sha256 };
native.save();
console.log(
  JSON.stringify({
    normalOnly: true,
    sourceFiles: Object.keys(data.sourceHashes).length,
    commands: native.manifest.commands.length,
    bytes: data.byteLength,
    sha256: data.sha256,
  }),
);
