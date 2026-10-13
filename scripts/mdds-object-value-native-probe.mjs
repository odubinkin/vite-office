/** @fileoverview Captures original owned mdds blocks with complete genuine SharedString/CellTextAttr sources and reused full native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/mdds-object-value-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-object-value-cases.json";
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
#include <svl/sharedstring.hxx>
#include <celltextattr.hxx>
#include <iostream>
#include <string>
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
using B=mdds::mtv::default_element_block<mdds::mtv::element_type_user_start+9,V>;
void snap(const char* label,const B& block){
 std::cout<<label<<" "<<block.store().size()<<" "<<block.store().capacity();
 for(const auto& x:block.store())std::cout<<" "<<x.id<<":"<<x.value;std::cout<<"\n";
}
void owned(){
 std::cout<<"owned\n";V zero(0),input[]={V(10),V(20),V(30)};
 auto*d=B::create_block(2);snap("default",*d);
 auto*f=B::create_block_with_value(3,input[0]);snap("filled",*f);
 auto*r=B::create_block_with_values(input+0,input+3);snap("range",*r);
 B::erase_value(*r,0);snap("delayed",*r);
 auto*c=B::copy_block(*r);snap("copy_hidden",*c);
 auto*k=B::clone_block(*r);snap("clone_hidden",*k);
 B::set_value(*d,0,input[1]);snap("set",*d);
 B::append_value(*d,input[2]);snap("append",*d);
 B::emplace_back_value(*d,input[0]);snap("emplace_lvalue",*d);
 B::prepend_value(*d,input[1]);snap("prepend",*d);
 B::reserve(*d,12);snap("reserve",*d);
 B::resize_block(*d,7);snap("resize_grow",*d);
 B::set_values(*d,1,input+0,input+3);snap("set_range",*d);
 B::swap_values(*d,*f,0,0,2);snap("swap_d",*d);snap("swap_f",*f);
 B::swap_values(*d,*d,0,0,1);snap("swap_self",*d);
 std::iter_swap(d->store().rbegin(),f->store().rbegin());snap("reverse_d",*d);snap("reverse_f",*f);
 B::assign_values_from_block(*c,*d,1,3);snap("assign",*c);
 B::append_values_from_block(*c,*d,0,2);snap("append_range",*c);
 B::prepend_values_from_block(*c,*d,2,1);snap("prepend_range",*c);
 B::erase_values(*c,1,2);snap("erase_range",*c);
 B::resize_block(*f,1);snap("resize_shrink",*f);
 B::shrink_to_fit(*f);snap("shrink_fit",*f);
 B::shrink_to_fit(*f);snap("shrink_noop",*f);
 B::reserve(*r,0);snap("clear_hidden",*r);
 std::cout<<"equal "<<B::equal_block(*r,*k)<<"\n";
 B::delete_block(k);B::delete_block(c);B::delete_block(r);B::delete_block(f);B::delete_block(d);B::delete_block(nullptr);
 int scalar[]={1,2};std::iter_swap(scalar+0,scalar+1);std::cout<<"scalar_swap "<<scalar[0]<<" "<<scalar[1]<<"\n";
 std::cout<<"inputs\n";
}
using S=mdds::mtv::default_element_block<mdds::mtv::element_type_user_start+2,svl::SharedString>;
using A=mdds::mtv::default_element_block<mdds::mtv::element_type_user_start+1,sc::CellTextAttr>;
void strings(const char* label,const S& block,const OUString& x){
 std::cout<<label<<" "<<block.store().size()<<" "<<block.store().capacity()<<" "<<x.pData->refCount;
 for(const auto& s:block.store())std::cout<<" "<<(s.getData()?static_cast<int>(s.getData()->buffer[0]):-1)<<":"<<(s.getData()?s.getData()->refCount:0)<<":"<<(s.getDataIgnoreCase()?s.getDataIgnoreCase()->refCount:0);
 std::cout<<"\n";
}
void attrs(const char* label,const A& block){
 std::cout<<label<<" "<<block.store().size()<<" "<<block.store().capacity();
 for(const auto& a:block.store())std::cout<<" "<<a.mnTextWidth<<":"<<static_cast<int>(a.mnScriptType);std::cout<<"\n";
}
void calc(){
 std::cout<<"calc\n";sal_Unicode text[]={65,0};OUString x(text,1);svl::SharedString s(x);
 auto*d=S::create_block(2);strings("string_default",*d,x);
 auto*f=S::create_block_with_value(3,s);strings("string_fill",*f,x);
 S::erase_value(*f,0);strings("string_hidden",*f,x);
 auto*c=S::copy_block(*f);strings("string_copy",*c,x);
 S::set_value(*d,0,s);strings("string_set",*d,x);
 S::append_value(*d,d->store()[0]);strings("string_alias_append",*d,x);
 S::reserve(*f,0);strings("string_clear_hidden",*f,x);
 S::resize_block(*d,1);strings("string_resize",*d,x);
 std::cout<<"string_equal "<<S::equal_block(*f,*c)<<"\n";
 S::delete_block(c);S::delete_block(f);S::delete_block(d);std::cout<<"string_remaining "<<x.pData->refCount<<"\n";
 sc::CellTextAttr v;v.mnTextWidth=9;v.mnScriptType=SvtScriptType::LATIN;
 auto*a=A::create_block(2);attrs("attr_default",*a);
 auto*b=A::create_block_with_value(3,v);attrs("attr_fill",*b);
 A::set_value(*a,0,v);v.mnTextWidth=44;attrs("attr_independent",*a);
 A::erase_value(*b,0);auto*copy=A::copy_block(*b);attrs("attr_copy_hidden",*copy);
 A::resize_block(*a,4);attrs("attr_grow",*a);
 A::reserve(*b,0);attrs("attr_clear_hidden",*b);
 A::swap_values(*a,*b,0,0,1);attrs("attr_swap_a",*a);attrs("attr_swap_b",*b);
 A::delete_block(copy);A::delete_block(b);A::delete_block(a);
}
int main(int argc,char** argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="owned")owned();else if(mode=="calc")calc();else return 2;}
`;
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
  throw Error("Whole original object value evidence changed");
console.log(
  "Whole original owned blocks captured:",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records whole original stream length. @param entry - Mode and stream. @returns Length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
