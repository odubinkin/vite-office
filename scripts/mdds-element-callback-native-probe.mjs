/** @fileoverview Captures original owned mdds blocks with complete genuine SharedString/CellTextAttr sources and reused full native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/mdds-element-callback-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-element-callback-cases.json";
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
const caller = String.raw`
#include <mdds/multi_type_vector/types.hpp>
#include <mdds/multi_type_vector/macro.hpp>
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
using P=mdds::mtv::default_element_block<60,V*>;
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(V,59,V(),B)
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS_PTR(V,60,nullptr,P)
void snap(const char* label,const mdds::mtv::base_element_block& b){
 auto& block=B::get(b);std::cout<<label<<" "<<block.store().size()<<" "<<block.store().capacity();
 for(const auto& x:block.store())std::cout<<" "<<x.id<<":"<<x.value;std::cout<<"\n";
}
void pointers(const char* label,const mdds::mtv::base_element_block& b){
 auto& block=P::get(b);std::cout<<label<<" "<<block.store().size()<<" "<<block.store().capacity();
 for(const auto* x:block.store())std::cout<<" "<<(x?x->id:0);std::cout<<"\n";
}
void run(){
 std::cout<<"owned\n";V zero(0),input[]={V(10),V(20),V(30)},out(80);
 auto*b=mdds_mtv_create_new_block(2,input[0]);snap("fill",*b);
 std::cout<<"type "<<mdds_mtv_get_element_type(input[0])<<"\n";
 mdds_mtv_get_empty_value(out);std::cout<<"empty "<<out.id<<":"<<out.value<<"\n";
 {V empty;std::cout<<"empty_expression "<<empty.id<<":"<<empty.value<<"\n";}
 mdds_mtv_get_value(*b,0,out);std::cout<<"output "<<out.id<<":"<<out.value<<"\n";
 {auto value=B::get_value(*b,0);std::cout<<"result "<<value.id<<":"<<value.value<<"\n";}
 mdds_mtv_set_value(*b,1,input[1]);snap("set",*b);
 mdds_mtv_set_values(*b,0,input[0],input+0,input+2);snap("set_range",*b);
 mdds_mtv_append_value(*b,input[2]);snap("append",*b);
 mdds_mtv_append_value(*b,std::move(input[2]));snap("append_move",*b);
 mdds_mtv_emplace_back_value(*b,input[0],input[0]);snap("emplace_lvalue",*b);
 mdds_mtv_emplace_back_value(*b,input[0]);snap("emplace_default",*b);
 mdds_mtv_emplace_back_value(*b,input[0],123);snap("emplace_args",*b);
 mdds_mtv_emplace_back_value(*b,input[0],std::move(input[1]));snap("emplace_move",*b);
 mdds_mtv_emplace_back_value(*b,input[0],B::at(*b,0));snap("emplace_alias",*b);
 mdds_mtv_prepend_value(*b,input[0]);snap("prepend",*b);
 mdds_mtv_prepend_values(*b,input[0],input+0,input+2);snap("prepend_range",*b);
 mdds_mtv_append_values(*b,input[0],input+0,input+2);snap("append_range",*b);
 mdds_mtv_insert_values(*b,1,input[0],input+0,input+2);snap("insert_range",*b);
 mdds_mtv_assign_values(*b,input[0],input+0,input+2);snap("assign_range",*b);
 auto*r=mdds_mtv_create_new_block(input[0],input+0,input+2);snap("range",*r);
 B::delete_block(r);B::delete_block(b);std::cout<<"inputs\n";
}
void pointer_run(){
 std::cout<<"pointer\n";V a(10),b(20),c(30);V*input[]={&a,&b,&c};V*out=&a;
 auto*block=mdds_mtv_create_new_block(2,input[0]);pointers("fill",*block);
 std::cout<<"type "<<mdds_mtv_get_element_type(input[0])<<"\n";
 mdds_mtv_get_empty_value(out);std::cout<<"empty "<<(out?out->id:0)<<"\n";
 mdds_mtv_get_value(*block,0,out);std::cout<<"output "<<out->id<<"\n";
 mdds_mtv_set_value(*block,1,input[1]);pointers("set",*block);
 mdds_mtv_set_values(*block,0,input[0],input+0,input+2);pointers("set_range",*block);
 mdds_mtv_append_value(*block,input[2]);pointers("append",*block);
 mdds_mtv_prepend_value(*block,input[1]);pointers("prepend",*block);
 mdds_mtv_prepend_values(*block,input[0],input+0,input+2);pointers("prepend_range",*block);
 mdds_mtv_append_values(*block,input[0],input+0,input+2);pointers("append_range",*block);
 mdds_mtv_insert_values(*block,1,input[0],input+0,input+2);pointers("insert_range",*block);
 mdds_mtv_assign_values(*block,input[0],input+0,input+3);pointers("assign_range",*block);
 auto*r=mdds_mtv_create_new_block(input[0],input+0,input+2);pointers("range",*r);
 P::delete_block(r);P::delete_block(block);std::cout<<"inputs\n";
}
}
namespace svl {
using S=mdds::mtv::default_element_block<52,SharedString>;
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(SharedString,52,SharedString(),S)
}
namespace sc {
using A=mdds::mtv::default_element_block<51,CellTextAttr>;
MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(CellTextAttr,51,CellTextAttr(),A)
}
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString x(raw,1);svl::SharedString value(x),out(x);
 auto*b=svl::mdds_mtv_create_new_block(2,value);
 auto strings=[&](const char*label){std::cout<<label<<" "<<svl::S::size(*b)<<" "<<svl::S::capacity(*b)<<" "<<x.pData->refCount;
  for(const auto&s:svl::S::range(*b))std::cout<<" "<<(s.getData()?s.getData()->buffer[0]:-1);std::cout<<" "<<(out.getData()?out.getData()->buffer[0]:-1)<<"\n";};
 strings("fill");svl::mdds_mtv_get_empty_value(out);strings("empty");
 svl::mdds_mtv_get_value(*b,0,out);strings("output");
 {auto result=svl::S::get_value(*b,0);std::cout<<"result "<<x.pData->refCount<<" "<<int(result.getData()->buffer[0])<<"\n";}
 strings("after_result");svl::mdds_mtv_append_value(*b,std::move(out));strings("append_move");
 svl::mdds_mtv_emplace_back_value(*b,value,x);strings("emplace_args");
 svl::mdds_mtv_emplace_back_value(*b,value);strings("emplace_default");
 svl::S::delete_block(b);std::cout<<"string_remaining "<<x.pData->refCount<<"\n";
 sc::CellTextAttr v;v.mnTextWidth=9;v.mnScriptType=SvtScriptType::LATIN;sc::CellTextAttr target;
 auto*a=sc::mdds_mtv_create_new_block(2,v);
 auto attrs=[&](const char*label){std::cout<<label<<" "<<sc::A::size(*a)<<" "<<sc::A::capacity(*a);
  for(const auto&item:sc::A::range(*a))std::cout<<" "<<item.mnTextWidth<<":"<<int(item.mnScriptType);std::cout<<" "<<target.mnTextWidth<<":"<<int(target.mnScriptType)<<"\n";};
 attrs("attr_fill");sc::mdds_mtv_get_value(*a,0,target);attrs("attr_output");
 sc::mdds_mtv_get_empty_value(target);attrs("attr_empty");
 {auto result=sc::A::get_value(*a,0);result.mnTextWidth=44;attrs("attr_independent");}
 sc::mdds_mtv_append_value(*a,std::move(v));attrs("attr_append_move");
 sc::mdds_mtv_emplace_back_value(*a,v);attrs("attr_emplace_default");
 sc::A::delete_block(a);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="owned")owned::run();else if(mode=="pointer")owned::pointer_run();else if(mode=="calc")calc();else return 2;}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + mdds.reference + "/include",
  "-I" + upstream + "/sc/inc",
  upstream + "/svl/source/misc/sharedstring.cxx",
  upstream + "/sc/source/core/data/celltextattr.cxx",
]);
const captures = {};
for (const mode of ["owned", "pointer", "calc"]) {
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
  throw Error("Whole original callback evidence changed");
console.log(
  "Whole original element callbacks captured:",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records whole original stream length. @param entry - Mode and stream. @returns Length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
