/** @fileoverview Captures original owned SoA container reads with complete genuine SharedString/CellTextAttr sources and reused full native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/mdds-container-value-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-container-value-cases.json";
const mdds = verifyMddsSources();
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const path of [
  "svl/source/misc/sharedstring.cxx",
  "include/svl/sharedstring.hxx",
  "sc/inc/celltextattr.hxx",
  "sc/source/core/data/celltextattr.cxx",
  "sc/inc/globalnames.hxx",
  "sc/inc/mtvelements.hxx",
])
  loadUnicodeOriginal(native.sources, path);
// Only the original CellTextAttrTraits declaration is instantiated here. Full Calc pointee headers are not replaced.
const originalTraits = readFileSync(upstream + "/sc/inc/mtvelements.hxx", "utf8").match(
  /struct CellTextAttrTraits : public mdds::mtv::default_traits\s*\{[^}]*\};/u,
)?.[0];
if (!originalTraits) throw Error("Missing original text attribute trait declaration");
const caller = String.raw`
#include <mdds/multi_type_vector/types.hpp>
#include <mdds/multi_type_vector/macro.hpp>
#include <mdds/multi_type_vector/soa/main.hpp>
#include <svl/sharedstring.hxx>
#include <celltextattr.hxx>
#include <iostream>
#include <string>
#include <memory>
namespace owned {
static int seq=0;
struct V {
 int id,value;
 V():id(++seq),value(0){std::cout<<"default "<<id<<" 0\n";}
 explicit V(int value):id(++seq),value(value){std::cout<<"new "<<id<<" "<<value<<"\n";}
 V(const V& x):id(++seq),value(x.value){std::cout<<"copy "<<x.id<<" "<<id<<" "<<value<<"\n";}
 V(V&& x)noexcept:id(++seq),value(x.value){std::cout<<"move "<<x.id<<" "<<id<<" "<<value<<"\n";x.value=-1;}
 V& operator=(const V& x){std::cout<<"assign "<<id<<" "<<x.id<<" "<<x.value<<"\n";value=x.value;return *this;}
 V& operator=(V&& x)noexcept{std::cout<<"moveassign "<<id<<" "<<x.id<<" "<<x.value<<"\n";value=x.value;x.value=-1;return *this;}
 ~V(){std::cout<<"delete "<<id<<" "<<value<<"\n";}
 bool operator==(const V& x)const{return value==x.value;}
};
using B=mdds::mtv::default_element_block<59,V>;

MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(V,59,V(),B)
struct Traits : mdds::mtv::default_traits {using block_funcs=mdds::mtv::element_block_funcs<B>;};
using M=mdds::mtv::soa::multi_type_vector<Traits>;
void snap(const char*label,const M&m){
 std::cout<<label<<" "<<m.size()<<" "<<m.block_size()<<" "<<m.empty();
 for(auto it=m.begin();it!=m.end();++it){std::cout<<" | "<<it->position<<" "<<it->size<<" "<<it->type;
 if(it->data) {std::cout<<" "<<B::capacity(*it->data);for(const auto&v:B::range(*it->data))std::cout<<" "<<v.id<<":"<<v.value;}}
 std::cout<<"\n";
}
void run(){
 std::cout<<"owned\n";V zero(0),input[]={V(10),V(20),V(30)},out(80);
 auto empty=std::make_unique<M>(3);snap("empty",*empty);
 auto filled=std::make_unique<M>(2,input[0]);snap("filled",*filled);
 auto range=std::make_unique<M>(3,input+0,input+3);snap("range",*range);
 auto zero_size=std::make_unique<M>(0,input[0]);snap("zero",*zero_size);
 try {M bad(4,input+0,input+3);}catch(const std::exception&e){std::cout<<"range_error "<<e.what()<<"\n";}
 filled->get(1,out);std::cout<<"output "<<out.id<<":"<<out.value<<"\n";
 {auto result=filled->get<V>(0);std::cout<<"result "<<result.id<<":"<<result.value<<"\n";}
 empty->get(1,out);std::cout<<"empty_output "<<out.id<<":"<<out.value<<"\n";
 {auto result=empty->get<V>(0);std::cout<<"empty_result "<<result.id<<":"<<result.value<<"\n";}
 try {auto result=filled->get<V>(2);std::cout<<"unreachable "<<result.value<<"\n";}catch(const std::exception&e){std::cout<<"result_error "<<e.what()<<"\n";}
 try {filled->get(2,out);}catch(const std::exception&e){std::cout<<"output_error "<<e.what()<<" "<<out.id<<":"<<out.value<<"\n";}
 auto copy=std::make_unique<M>(*range);snap("copy",*copy);
 auto clone=range->clone();snap("clone",clone);
 auto moved=std::make_unique<M>(std::move(*copy));snap("moved",*moved);snap("moved_source",*copy);
 moved.reset();clone.clear();copy.reset();zero_size.reset();range.reset();filled.reset();empty.reset();std::cout<<"inputs\n";
}
}
namespace svl {
using S=mdds::mtv::default_element_block<52,SharedString>;
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(SharedString,52,SharedString(),S)
}
namespace sc {
using celltextattr_block=mdds::mtv::default_element_block<51,CellTextAttr>;
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(CellTextAttr,51,CellTextAttr(),celltextattr_block)
}
namespace sc {
struct CellTextAttrTraits : public mdds::mtv::default_traits
{
    using block_funcs = mdds::mtv::element_block_funcs<sc::celltextattr_block>;
};

using CellTextAttrStoreType=mdds::mtv::soa::multi_type_vector<CellTextAttrTraits>;
}

struct StringTraits : mdds::mtv::default_traits {using block_funcs=mdds::mtv::element_block_funcs<svl::S>;};
using StringStore=mdds::mtv::soa::multi_type_vector<StringTraits>;
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString x(raw,1);svl::SharedString value(x),out(x);
 StringStore strings(2,value),empty(2);
 auto state=[&](const char*label){std::cout<<label<<" "<<x.pData->refCount<<" "<<(out.getData()?int(out.getData()->buffer[0]):-1)<<" "<<strings.size()<<" "<<strings.block_size()<<"\n";};
 state("fill");strings.get(0,out);state("output");
 {auto result=strings.get<svl::SharedString>(1);std::cout<<"result "<<x.pData->refCount<<" "<<int(result.getData()->buffer[0])<<"\n";}
 state("after_result");empty.get(0,out);state("empty_output");
 {auto result=empty.get<svl::SharedString>(1);std::cout<<"empty_result "<<x.pData->refCount<<" "<<(result.getData()?int(result.getData()->buffer[0]):-1)<<"\n";}
 try {auto result=strings.get<svl::SharedString>(2);}catch(const std::exception&e){std::cout<<"result_error "<<e.what()<<"\n";}
 state("after_error");strings.clear();state("cleared");
 sc::CellTextAttr v;v.mnTextWidth=9;v.mnScriptType=SvtScriptType::LATIN;sc::CellTextAttr target;
 sc::CellTextAttrStoreType attrs(2,v),blank(2);
 auto attrstate=[&](const char*label){std::cout<<label<<" "<<attrs.size()<<" "<<attrs.block_size();
  for(const auto&node:attrs){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;
   if(node.data)for(const auto&item:sc::celltextattr_block::range(*node.data))std::cout<<" "<<item.mnTextWidth<<":"<<int(item.mnScriptType);}
  std::cout<<" "<<target.mnTextWidth<<":"<<int(target.mnScriptType)<<"\n";};
 attrstate("attr_fill");attrs.get(1,target);attrstate("attr_output");
 {auto result=attrs.get<sc::CellTextAttr>(0);result.mnTextWidth=44;std::cout<<"attr_result "<<result.mnTextWidth<<":"<<int(result.mnScriptType)<<"\n";}
 attrstate("attr_independent");blank.get(0,target);attrstate("attr_empty_output");
 {auto result=blank.get<sc::CellTextAttr>(1);std::cout<<"attr_empty_result "<<result.mnTextWidth<<":"<<int(result.mnScriptType)<<"\n";}
 auto next=sc::CellTextAttrStoreType::next_position(attrs.position(0));std::cout<<"attr_next "<<next.second<<"\n";
 attrs.clear();attrstate("attr_cleared");
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="owned")owned::run();else if(mode=="calc")calc();else return 2;}
`;
if (!caller.includes(originalTraits))
  throw Error("Native selected trait differs from the complete pinned source");
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + mdds.reference + "/include",
  "-I" + upstream + "/sc/inc",
  upstream + "/svl/source/misc/sharedstring.cxx",
  upstream + "/sc/source/core/data/celltextattr.cxx",
]);
const captures = {};
for (const mode of ["owned", "calc"]) {
  const result = native.run(binary, [mode], mode);
  if (result.stderr.length) throw Error("Native caller produced diagnostics");
  captures[mode] = result.stdout.toString("utf8");
}
const document = {
  pin,
  dependencyManifestHash: native.manifest.reusedDependencyBuild.manifestHash,
  mddsArchiveHashes: mdds.archiveHashes,
  mddsSourceHashes: mdds.sourceHashes,
  callerHash: digest(caller),
  sourceDigest: digest(JSON.stringify(native.manifest.sourceHashes)),
  captures,
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(document, null, 2) + "\n");
else if (!isDeepStrictEqual(document, JSON.parse(readFileSync(fixture, "utf8"))))
  throw Error("Whole original SoA value-read evidence changed");
console.log(
  "Whole original SoA value reads captured:",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records whole original stream length. @param entry - Mode and stream. @returns Length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
