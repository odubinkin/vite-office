/** @fileoverview Ordinary original matrix geometry/lifetime observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-geometry-native";
const fixture = "apps/office/src/external/mdds/include/mdds/native-matrix-geometry-cases.json";
const mdds = verifyMddsSources();
for (const file of ["multi_type_matrix.hpp", "multi_type_matrix_def.inl", "multi_type_vector.hpp"])
  mdds.sourceHashes[file] = digest(readFileSync(mdds.reference + "/include/mdds/" + file));
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const file of [
  "svl/source/misc/sharedstring.cxx",
  "include/svl/sharedstring.hxx",
  "sc/inc/mtvelements.hxx",
  "sc/source/core/tool/scmatrix.cxx",
])
  loadUnicodeOriginal(native.sources, file);
const original = readFileSync(upstream + "/sc/inc/mtvelements.hxx", "utf8");
const selected = [
  original.match(/const mdds::mtv::element_t element_type_string =[^;]*;/u)?.[0],
  original.match(
    /typedef mdds::mtv::default_element_block<element_type_string, svl::SharedString> string_block;/u,
  )?.[0],
  original.match(/typedef mdds::mtv::uint16_element_block uint16_block;/u)?.[0],
  original.match(
    /MDDS_MTV_DEFINE_ELEMENT_CALLBACKS\(SharedString, sc::element_type_string, SharedString\(\), sc::string_block\)/u,
  )?.[0],
];
const matrixSource = readFileSync(upstream + "/sc/source/core/tool/scmatrix.cxx", "utf8");
const traits = ["matrix_traits", "matrix_flag_traits"].map(
  /** Selects the complete unchanged original matrix trait scope. @param name - Trait. @returns Original scope. */ (
    name,
  ) => matrixSource.match(new RegExp("struct " + name + "\\s*\\{[^}]*\\};", "u"))?.[0],
);
if (
  [...selected, ...traits].some(
    /** Rejects an absent original scope. @param scope - Matched source. @returns Missing. */ (
      scope,
    ) => !scope,
  )
)
  throw Error("Original matrix scopes missing");
const caller = String.raw`
#include <mdds/multi_type_matrix.hpp>
#include <svl/sharedstring.hxx>
#include <iostream>
#include <iomanip>
#include <vector>
#include <limits>
namespace sc {
${selected.slice(0, 3).join("\n")}
}
namespace svl {
${selected[3]}
}
namespace {
${traits.join("\n")}
}
using M=mdds::multi_type_matrix<mdds::mtm::std_string_traits>;
void state(const char*label,const M&m){
 auto sz=m.size();std::cout<<label<<" "<<sz.row<<" "<<sz.column<<" "<<m.empty()<<" "<<m.numeric();
 for(size_t c=0;c<sz.column;++c)for(size_t r=0;r<sz.row;++r){auto p=m.position(r,c);auto q=m.matrix_position(p);auto t=m.get_type(p);std::cout<<" | "<<q.row<<" "<<q.column<<" "<<int(t)<<" "<<m.get_numeric(p)<<" "<<m.get_integer(p)<<" "<<m.get_boolean(p);if(t==mdds::mtm::element_string)std::cout<<" "<<m.get_string(p);}
 std::cout<<"\n";
}
void populate(M&m,int seed){auto sz=m.size();for(size_t c=0;c<sz.column;++c)for(size_t r=0;r<sz.row;++r){int k=(r+sz.row*c+seed)%4;if(k==1)m.set(r,c,1.5);else if(k==2)m.set(r,c,true);else if(k==3)m.set(r,c,std::string("x"));}}
void scalar(){
 std::cout<<"scalar\n";
 for(size_t sr=0;sr<=3;++sr)for(size_t sc=0;sc<=3;++sc)for(size_t dr=0;dr<=3;++dr)for(size_t dc=0;dc<=3;++dc){M src(sr,sc);populate(src,0);M dst(dr,dc,8.5);std::cout<<"copycase "<<sr<<" "<<sc<<" "<<dr<<" "<<dc<<"\n";dst.copy(src);state("copied",dst);dst.copy(dst);state("selfcopy",dst);}
 for(size_t r=0;r<=3;++r)for(size_t c=0;c<=3;++c){M m(r,c);populate(m,1);M& result=m.transpose();std::cout<<"transcase "<<r<<" "<<c<<" "<<(&result==&m)<<"\n";state("transposed",m);m.transpose();state("back",m);for(size_t nr=0;nr<=3;++nr)for(size_t nc=0;nc<=3;++nc){M x(m);x.resize(nr,nc);std::cout<<"resizecase "<<nr<<" "<<nc<<"\n";state("resized",x);M y(m);y.resize(nr,nc,9.5);state("filledresize",y);}}
 std::vector<double> values{1,2,3,4,5,6};M ranged(3,3,8.5);ranged.copy(2,2,values.begin(),values.begin()+4);state("range",ranged);ranged.copy(9,9,values.begin(),values.begin());state("rangezero",ranged);M empty;empty.copy(9,9,values.begin(),values.end());state("emptyrange",empty);
 try{ranged.copy(2,2,values.begin(),values.begin()+3);}catch(const mdds::size_error&e){std::cout<<"lengtherror "<<e.what()<<"\n";}try{ranged.copy(1,6,values.begin(),values.end());}catch(const mdds::size_error&e){std::cout<<"colerror "<<e.what()<<"\n";}try{ranged.copy(6,1,values.begin(),values.end());}catch(const mdds::size_error&e){std::cout<<"rowerror "<<e.what()<<"\n";}
 std::vector<int8_t> bad{1,2,3,4};try{ranged.copy(2,2,bad.begin(),bad.end());}catch(const mdds::type_error&e){std::cout<<"typeerror "<<e.what()<<"\n";}
 std::vector<int32_t> ints{1,2,3,4};ranged.copy(2,2,ints.begin(),ints.end());state("integerrange",ranged);
 M integer(2,2);integer.set(0,0,std::string("x"));integer.set(1,0,int32_t(7));M target(2,2,8.5);try{target.copy(integer);}catch(const mdds::general_error&e){std::cout<<"integercopyerror "<<e.what()<<"\n";}state("partialcopy",target);try{integer.transpose();}catch(const mdds::general_error&e){std::cout<<"integertranserror "<<e.what()<<"\n";}state("unchangedtrans",integer);try{integer.resize(3,3);}catch(const mdds::general_error&e){std::cout<<"integerresizeerror "<<e.what()<<"\n";}state("unchangedresize",integer);try{integer.resize(3,3,9.5);}catch(const mdds::general_error&e){std::cout<<"integerfillerror "<<e.what()<<"\n";}state("unchangedfill",integer);
 M::element_block_node_type node;std::cout<<"defaultnode "<<int(node.type)<<" "<<node.offset<<" "<<node.size<<" "<<(node.data==nullptr)<<"\n";auto*block=mdds::mtv::double_element_block::create_block_with_value(4,1.5);node.type=mdds::mtm::element_numeric;node.offset=1;node.size=2;node.data=block;M::element_block_node_type copied(node);auto first=copied.begin<mdds::mtv::double_element_block>(),last=copied.end<mdds::mtv::double_element_block>();std::cout<<"copiednode "<<int(copied.type)<<" "<<copied.offset<<" "<<copied.size<<" "<<(copied.data==node.data)<<" "<<std::distance(first,last)<<" "<<*first<<"\n";mdds::mtv::double_element_block::delete_block(block);
}
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString text(raw,1);svl::SharedString s(text);using C=mdds::multi_type_matrix<matrix_traits>;using F=mdds::multi_type_matrix<matrix_flag_traits>;
 auto state=[&](const char*label,const C&m){auto sz=m.size();std::cout<<label<<" "<<text.pData->refCount<<" "<<sz.row<<" "<<sz.column<<" "<<m.empty();for(size_t c=0;c<sz.column;++c)for(size_t r=0;r<sz.row;++r){auto t=m.get_type(r,c);std::cout<<" | "<<int(t)<<" "<<m.get_numeric(r,c);if(t==mdds::mtm::element_string)std::cout<<" "<<int(m.get_string(r,c).getData()->buffer[0]);}std::cout<<"\n";};
 {C source(2,3);source.set(0,0,s);source.set(1,0,1.5);source.set(0,1,true);source.set(1,2,s);C target(3,4,8.5);state("before",source);target.copy(source);state("copied",target);source.transpose();state("transposed",source);source.resize(4,3,s);state("resized",source);source.resize(1,2);state("shrink",source);source.resize(0,2,s);state("zero",source);state("target",target);target.clear();state("clear",target);}
 {C source(2,2);source.set(0,0,s);source.set(1,0,uint16_t(7));C target(2,2,8.5);try{target.copy(source);}catch(const mdds::general_error&e){std::cout<<"copyerror "<<e.what()<<"\n";}state("partial",target);try{source.transpose();}catch(const mdds::general_error&e){std::cout<<"transerror "<<e.what()<<"\n";}state("aftererror",source);try{source.resize(3,3,s);}catch(const mdds::general_error&e){std::cout<<"resizeerror "<<e.what()<<"\n";}state("afterresizeerror",source);}
 std::cout<<"done "<<text.pData->refCount<<"\n";
 {F flags(2,2,uint8_t(7));try{flags.resize(3,3);}catch(const mdds::general_error&e){std::cout<<"flagerror "<<e.what()<<"\n";}flags.resize(0,2);std::cout<<"flagzero "<<flags.size().row<<" "<<flags.size().column<<" "<<flags.empty()<<"\n";}
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="scalar")scalar();else if(mode=="calc")calc();else return 2;}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + mdds.reference + "/include",
  upstream + "/svl/source/misc/sharedstring.cxx",
]);
const captures = {};
for (const mode of ["scalar", "calc"]) {
  const result = native.run(binary, [mode], mode);
  if (result.stderr.length) throw Error("Unexpected native diagnostics");
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
  throw Error("Whole original matrix evidence changed");
console.log(
  "Original matrix streams",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records complete ordinary capture lengths. @param entry - Mode and stream. @returns Byte length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
