/** @fileoverview Captures original owned SoA append and positional copies with complete genuine SharedString/CellTextAttr sources and reused full native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/mdds-container-append-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-container-append-cases.json";
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

using D=mdds::mtv::double_element_block;
using Ops=mdds::mtv::element_block_funcs<B,D>;
struct Event {
 void element_block_acquired(const mdds::mtv::base_element_block*b){std::cout<<"acquire "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}
 void element_block_released(const mdds::mtv::base_element_block*b){std::cout<<"release "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}
};
struct Traits : mdds::mtv::default_traits {using block_funcs=Ops;using event_func=Event;};
using M=mdds::mtv::soa::multi_type_vector<Traits>;
void snap(const char*label,const M&m){
 std::cout<<label<<" "<<m.size()<<" "<<m.block_size()<<" "<<m.empty();
 for(const auto&node:m){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;
 if(node.data){std::cout<<" "<<(node.type==59?B::capacity(*node.data):D::capacity(*node.data));
 if(node.type==59)for(const auto&v:B::range(*node.data))std::cout<<" "<<v.id<<":"<<v.value;
 else for(auto v:D::range(*node.data))std::cout<<" "<<v;}}
 std::cout<<"\n";
}
void returned(const M&m,const M::iterator&it){std::cout<<"returned "<<it->position<<" "<<it->size<<" "<<it->type<<" "<<it->__private_data.block_index<<" "<<(it->__private_data.parent==&m)<<" "<<(it->data==m.position(it->position).first->data)<<"\n";}
void run(){
 std::cout<<"owned\n";V zero(0),a(10),b(20),c(30);M m;snap("empty",m);
 auto it=m.push_back(a);returned(m,it);snap("first",m);
 it=m.push_back(b);returned(m,it);snap("same",m);
 it=m.push_back_empty();returned(m,it);snap("empty_tail",m);
 it=m.push_back(c);returned(m,it);snap("after_empty",m);
 it=m.push_back(1.5);returned(m,it);snap("numeric",m);
 it=m.push_back(std::move(c));returned(m,it);snap("different_move",m);
 it=m.push_back(std::move(a));returned(m,it);snap("same_move",m);
 auto&alias=B::at(*it->data,0);it=m.push_back(std::move(alias));returned(m,it);snap("alias_move",m);
 {auto result=M::get<B>(m.position(0));std::cout<<"position_result "<<result.id<<":"<<result.value<<"\n";result.value=71;}
 snap("independent",m);std::cout<<"numeric_result "<<M::get<D>(m.position(4))<<"\n";
 m.clear();snap("cleared",m);std::cout<<"inputs\n";
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
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString x(raw,1);svl::SharedString a(x),b(x);StringStore strings;
 auto state=[&](const char*label){std::cout<<label<<" "<<x.pData->refCount<<" "<<(a.getData()?int(a.getData()->buffer[0]):-1)<<" "<<(b.getData()?int(b.getData()->buffer[0]):-1)<<" "<<strings.size()<<" "<<strings.block_size();
  for(const auto&node:strings){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;
   if(node.data){std::cout<<" "<<svl::S::capacity(*node.data);for(const auto&v:svl::S::range(*node.data))std::cout<<" "<<(v.getData()?int(v.getData()->buffer[0]):-1);}}
  std::cout<<"\n";};
 strings.push_back(a);state("first");strings.push_back(std::move(b));state("same_move");strings.push_back_empty();state("empty_tail");strings.push_back(std::move(a));state("after_empty_move");
 {auto result=StringStore::get<svl::S>(strings.position(0));std::cout<<"position_result "<<x.pData->refCount<<" "<<int(result.getData()->buffer[0])<<"\n";}
 state("after_position");strings.clear();state("cleared");
 sc::CellTextAttr v;v.mnTextWidth=9;v.mnScriptType=SvtScriptType::LATIN;sc::CellTextAttrStoreType attrs;
 auto attrstate=[&](const char*label){std::cout<<label<<" "<<attrs.size()<<" "<<attrs.block_size()<<" "<<v.mnTextWidth<<":"<<int(v.mnScriptType);
  for(const auto&node:attrs){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;
   if(node.data){std::cout<<" "<<sc::celltextattr_block::capacity(*node.data);for(const auto&item:sc::celltextattr_block::range(*node.data))std::cout<<" "<<item.mnTextWidth<<":"<<int(item.mnScriptType);}}
  std::cout<<"\n";};
 attrs.push_back(v);attrstate("attr_first");v.mnTextWidth=13;attrs.push_back(std::move(v));attrstate("attr_same_move");attrs.push_back_empty();attrs.push_back(std::move(v));attrstate("attr_after_empty_move");
 {auto result=sc::CellTextAttrStoreType::get<sc::celltextattr_block>(attrs.position(0));result.mnTextWidth=44;std::cout<<"attr_position_result "<<result.mnTextWidth<<":"<<int(result.mnScriptType)<<"\n";}
 attrstate("attr_independent");attrs.clear();attrstate("attr_cleared");
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
  throw Error("Whole original SoA append evidence changed");
console.log(
  "Whole original SoA append captured:",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records whole original stream length. @param entry - Mode and stream. @returns Length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
