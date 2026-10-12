/** @fileoverview Captures original single-value SoA set and hinted writes with complete genuine SharedString/CellTextAttr sources and reused full native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/mdds-container-set-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-container-set-cases.json";
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
using U=mdds::mtv::uint16_element_block;
using Ops=mdds::mtv::element_block_funcs<B,D,U>;
struct Event {
 void element_block_acquired(const mdds::mtv::base_element_block*b){std::cout<<"acquire "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}
 void element_block_released(const mdds::mtv::base_element_block*b){std::cout<<"release "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}
};
struct Traits : mdds::mtv::default_traits {using block_funcs=Ops;using event_func=Event;};
using M=mdds::mtv::soa::multi_type_vector<Traits>;
void snap(const char*label,const M&m){
 std::cout<<label<<" "<<m.size()<<" "<<m.block_size()<<" "<<m.empty();
 for(const auto&node:m){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;
 if(node.data){std::cout<<" "<<(node.type==59?B::capacity(*node.data):(node.type==10?D::capacity(*node.data):U::capacity(*node.data)));
 if(node.type==59)for(const auto&v:B::range(*node.data))std::cout<<" "<<v.id<<":"<<v.value;
 else if(node.type==10) for(auto v:D::range(*node.data))std::cout<<" "<<v;
 else for(auto v:U::range(*node.data))std::cout<<" "<<v;}}
 std::cout<<"\n";
}
void returned(const M&m,const M::iterator&it){std::cout<<"returned "<<it->position<<" "<<it->size<<" "<<it->type<<" "<<it->__private_data.block_index<<" "<<(it->__private_data.parent==&m)<<" "<<(it->data==m.position(it->position).first->data)<<"\n";}
void run(){
 std::cout<<"owned\n";V zero(0),a(10);
 const char*patterns[]={"0","00","000","0000","100","001","010","1001","10011","1101","2101","101","110","011","2111","1112","2112","111","1111","01110","21113","212","121","123","213","012","210","0110","0120","211","112","1211","11112","111123","2111123"};
 for(const char*pattern:patterns)for(size_t row=0;row<std::string(pattern).size();++row)for(int kind=1;kind<4;++kind)for(int hint=0;hint<2;++hint){
  std::cout<<"case "<<pattern<<" "<<row<<" "<<kind<<" "<<hint<<"\n";M m;
  for(char ch:std::string(pattern)){if(ch=='0')m.push_back_empty();else if(ch=='1')m.push_back(a);else if(ch=='2')m.push_back(1.5);else m.push_back(uint16_t(7));}
  snap("before",m);auto h=m.position(m.size()-1).first;M::iterator it;
  if(kind==1)it=hint?m.set(h,row,a):m.set(row,a);else if(kind==2)it=hint?m.set(h,row,2.5):m.set(row,2.5);else it=hint?m.set(h,row,uint16_t(9)):m.set(row,uint16_t(9));
  returned(m,it);snap("after",m);m.clear();snap("clear",m);
 }
 std::cout<<"inputs\n";
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
namespace scalar {
using D=mdds::mtv::double_element_block;using U=mdds::mtv::uint16_element_block;using B=mdds::mtv::boolean_element_block;
using I=mdds::mtv::int8_element_block;using Ops=mdds::mtv::element_block_funcs<D,U,B,I>;
struct Event{void element_block_acquired(const mdds::mtv::base_element_block*b){std::cout<<"acquire "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}void element_block_released(const mdds::mtv::base_element_block*b){std::cout<<"release "<<mdds::mtv::get_block_type(*b)<<" "<<Ops::size(*b)<<"\n";}};
struct Traits:mdds::mtv::default_traits{using block_funcs=Ops;using event_func=Event;};using M=mdds::mtv::soa::multi_type_vector<Traits>;
void snap(const M&m){std::cout<<m.size()<<" "<<m.block_size()<<" "<<m.empty();for(const auto&node:m){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;if(node.data){std::cout<<" "<<Ops::size(*node.data)<<" "<<(node.type==10?D::capacity(*node.data):node.type==4?U::capacity(*node.data):node.type==0?B::capacity(*node.data):I::capacity(*node.data));if(node.type==10)for(auto v:D::range(*node.data))std::cout<<" "<<v;else if(node.type==4)for(auto v:U::range(*node.data))std::cout<<" "<<v;else if(node.type==0)for(auto v:B::range(*node.data))std::cout<<" "<<v;else for(auto v:I::range(*node.data))std::cout<<" "<<int(v);}}std::cout<<"\n";}
struct top_tag{friend void top(M&,size_t,const double&,top_tag);};template<auto Member>struct top_access{friend void top(M&m,size_t i,const double&v,top_tag){(m.*Member)(i,v);}};template struct top_access<&M::set_cell_to_top_of_data_block<double>>;
struct bottom_tag{friend void bottom(M&,size_t,const double&,bottom_tag);};template<auto Member>struct bottom_access{friend void bottom(M&m,size_t i,const double&v,bottom_tag){(m.*Member)(i,v);}};template struct bottom_access<&M::set_cell_to_bottom_of_data_block<double>>;
void run(){
 std::cout<<"scalar\n";
 for(size_t n=1,limit=4;n<=4;++n,limit*=4)for(size_t code=0;code<limit;++code)for(size_t row=0;row<n;++row)for(int kind=1;kind<5;++kind)for(int hint=0;hint<2;++hint){
  std::cout<<"case "<<n<<" "<<code<<" "<<row<<" "<<kind<<" "<<hint<<"\n";M m;size_t chars=code;
  for(size_t i=0;i<n;++i){int ch=chars%4;chars/=4;if(ch==0)m.push_back_empty();else if(ch==1)m.push_back(1.5);else if(ch==2)m.push_back(uint16_t(7));else m.push_back(true);}
  snap(m);auto h=m.position(n-1).first;M::iterator it;
  if(kind==1)it=hint?m.set(h,row,2.5):m.set(row,2.5);else if(kind==2)it=hint?m.set(h,row,uint16_t(9)):m.set(row,uint16_t(9));else if(kind==3)it=hint?m.set(h,row,false):m.set(row,false);else it=hint?m.set(h,row,int8_t(-9)):m.set(row,int8_t(-9));
  std::cout<<"returned "<<it->position<<" "<<it->size<<" "<<it->type<<" "<<it->__private_data.block_index<<" "<<(it->__private_data.parent==&m)<<" "<<(it->data==m.position(row).first->data)<<"\n";snap(m);m.clear();snap(m);
 }
 for(int hint=0;hint<2;++hint)for(size_t row:{size_t(2),size_t(-1)}){M m(2);try{if(hint)m.set(m.begin(),row,1.5);else m.set(row,1.5);}catch(const std::exception&e){std::cout<<"error "<<hint<<" "<<e.what()<<"\n";}snap(m);}
 for(int which=0;which<2;++which){M m(3);std::cout<<"empty_helper "<<which<<"\n";if(which)bottom(m,0,2.5,bottom_tag{});else top(m,0,2.5,top_tag{});snap(m);}
}
}
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString x(raw,1);svl::SharedString a(x),b(x);StringStore strings(7);
 auto state=[&](const char*label){std::cout<<label<<" "<<x.pData->refCount<<" "<<strings.size()<<" "<<strings.block_size();for(const auto&node:strings){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;if(node.data){std::cout<<" "<<svl::S::capacity(*node.data);for(const auto&v:svl::S::range(*node.data))std::cout<<" "<<(v.getData()?int(v.getData()->buffer[0]):-1);}}std::cout<<"\n";};
 for(size_t row:{0,6,3,3,1,5,2,4}){auto it=strings.set(strings.position(strings.size()-1).first,row,row%2?a:b);std::cout<<"string_returned "<<it->position<<" "<<it->size<<" "<<it->type<<"\n";state("set");}
 {auto result=StringStore::get<svl::S>(strings.position(3));std::cout<<"result "<<x.pData->refCount<<" "<<int(result.getData()->buffer[0])<<"\n";}state("after_result");strings.clear();state("clear");
 sc::CellTextAttr v;v.mnTextWidth=9;v.mnScriptType=SvtScriptType::LATIN;sc::CellTextAttrStoreType attrs(7);
 auto attrstate=[&](const char*label){std::cout<<label<<" "<<attrs.size()<<" "<<attrs.block_size();for(const auto&node:attrs){std::cout<<" | "<<node.position<<" "<<node.size<<" "<<node.type;if(node.data){std::cout<<" "<<sc::celltextattr_block::capacity(*node.data);for(const auto&item:sc::celltextattr_block::range(*node.data))std::cout<<" "<<item.mnTextWidth<<":"<<int(item.mnScriptType);}}std::cout<<"\n";};
 for(size_t row:{0,6,3,3,1,5,2,4}){v.mnTextWidth+=1;auto it=attrs.set(row,v);std::cout<<"attr_returned "<<it->position<<" "<<it->size<<" "<<it->type<<"\n";attrstate("set");}
 {auto result=sc::CellTextAttrStoreType::get<sc::celltextattr_block>(attrs.position(3));result.mnTextWidth=44;std::cout<<"attr_result "<<result.mnTextWidth<<":"<<int(result.mnScriptType)<<"\n";}attrstate("independent");attrs.clear();attrstate("clear");
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="owned")owned::run();else if(mode=="calc")calc();else if(mode=="scalar")scalar::run();else return 2;}
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
for (const mode of ["scalar", "owned", "calc"]) {
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
  throw Error("Whole original SoA single-value set evidence changed");
console.log(
  "Whole original SoA single-value set captured:",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records whole original stream length. @param entry - Mode and stream. @returns Length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
