/** @fileoverview Ordinary original matrix block-walk/callable observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-walk-native";
const fixture = "apps/office/src/external/mdds/include/mdds/native-matrix-walk-cases.json";
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
using N=M::element_block_node_type;
void node(const N&n){std::cout<<int(n.type)<<" "<<n.offset<<" "<<n.size<<" "<<(n.data!=nullptr);if(n.type==mdds::mtm::element_numeric){for(auto i=n.begin<mdds::mtv::double_element_block>(),e=n.end<mdds::mtv::double_element_block>();i!=e;++i)std::cout<<" "<<*i;}else if(n.type==mdds::mtm::element_boolean){for(auto i=n.begin<mdds::mtv::boolean_element_block>(),e=n.end<mdds::mtv::boolean_element_block>();i!=e;++i)std::cout<<" "<<*i;}else if(n.type==mdds::mtm::element_string){for(auto i=n.begin<mdds::mtv::string_element_block>(),e=n.end<mdds::mtv::string_element_block>();i!=e;++i)std::cout<<" "<<*i;}else if(n.type==mdds::mtm::element_integer){for(auto i=n.begin<mdds::mtv::int32_element_block>(),e=n.end<mdds::mtv::int32_element_block>();i!=e;++i)std::cout<<" "<<*i;}}
struct F{
 int count=0,fail=0;
 F(int x=0):fail(x){std::cout<<"construct "<<fail<<"\n";}
 F(const F&x):count(x.count),fail(x.fail){std::cout<<"copy "<<count<<"\n";}
 F(F&&x):count(x.count),fail(x.fail){x.count=-1;std::cout<<"move "<<count<<"\n";}
 ~F(){std::cout<<"destroy "<<count<<"\n";}
 void operator()(const N&a){++count;std::cout<<"call "<<count<<" | ";node(a);std::cout<<"\n";if(fail==count)throw std::runtime_error("callback failure");}
 void operator()(const N&a,const N&b){++count;std::cout<<"pair "<<count<<" | ";node(a);std::cout<<" | ";node(b);std::cout<<"\n";if(fail==count)throw std::runtime_error("callback failure");}
};
void populate(M&m,int seed){auto z=m.size();for(size_t c=0;c<z.column;++c)for(size_t r=0;r<z.row;++r){int k=(r+z.row*c+seed)%5;if(k==1)m.set(r,c,1.5);else if(k==2)m.set(r,c,true);else if(k==3)m.set(r,c,std::string("x"));else if(k==4)m.set(r,c,int32_t(7));}}
void scalar(){
 std::cout<<"scalar\n";
 for(size_t r=0;r<=3;++r)for(size_t c=0;c<=3;++c){M a(r,c),b(r,c);populate(a,0);populate(b,2);std::cout<<"case "<<r<<" "<<c<<"\n";F input;{auto result=a.walk(input);std::cout<<"whole "<<input.count<<" "<<result.count<<"\n";}{auto result=a.walk(input,b);std::cout<<"parallel "<<input.count<<" "<<result.count<<"\n";}if(r&&c)for(size_t sr=0;sr<r;++sr)for(size_t sc=0;sc<c;++sc)for(size_t er=sr;er<r;++er)for(size_t ec=sc;ec<c;++ec){std::cout<<"range "<<sr<<" "<<sc<<" "<<er<<" "<<ec<<"\n";{auto result=a.walk(input,{sr,sc},{er,ec});std::cout<<"ranged "<<input.count<<" "<<result.count<<"\n";}{auto result=a.walk(input,b,{sr,sc},{er,ec});std::cout<<"paired "<<input.count<<" "<<result.count<<"\n";}}}
 M a(3,3),b(4,4),small(1,1);populate(a,0);populate(b,1);F input;
 {auto result=a.walk(std::move(input));std::cout<<"rvalue "<<input.count<<" "<<result.count<<"\n";}
 {F clean;auto result=a.walk(clean,b,{1,1},{2,2});std::cout<<"different "<<clean.count<<" "<<result.count<<"\n";}
 for(int mode=0;mode<4;++mode){std::cout<<"error "<<mode<<"\n";F f;try{if(mode==0)a.walk(f,{2,2},{1,1});else if(mode==1)a.walk(f,{0,0},{4,0});else if(mode==2)a.walk(f,b);else a.walk(f,small,{0,0},{2,0});}catch(const mdds::size_error&e){std::cout<<"caught "<<e.what()<<"\n";}}
 for(int mode=0;mode<4;++mode){std::cout<<"throw "<<mode<<"\n";F f(2);try{if(mode==0)a.walk(f);else if(mode==1)a.walk(f,{0,0},{2,2});else if(mode==2)a.walk(f,a);else a.walk(f,a,{0,0},{2,2});}catch(const std::runtime_error&e){std::cout<<"caught "<<e.what()<<" "<<f.count<<"\n";}}
 M bad(2,2,int8_t(7));F f;try{bad.walk(f);}catch(const mdds::type_error&e){std::cout<<"bad "<<e.what()<<"\n";}
 // Inclusive end.row equals row count but remains inside initialized flat storage: original spills into the next column.
 M spill(2,2,1.5);F g;{auto result=spill.walk(g,{0,0},{2,0});std::cout<<"spill "<<result.count<<"\n";}
}
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString text(raw,1);svl::SharedString s(text);using C=mdds::multi_type_matrix<matrix_traits>;using Flag=mdds::multi_type_matrix<matrix_flag_traits>;
 {C a(2,2),b(2,2);a.set(0,0,s);a.set(1,0,uint16_t(7));b.set(0,1,s);
 auto show=[&](const C::element_block_node_type&n){std::cout<<int(n.type)<<" "<<n.offset<<" "<<n.size<<" "<<text.pData->refCount;if(n.type==mdds::mtm::element_string)for(auto i=n.begin<sc::string_block>(),e=n.end<sc::string_block>();i!=e;++i)std::cout<<" "<<int(i->getData()->buffer[0]);else if(n.type==mdds::mtm::element_integer)for(auto i=n.begin<sc::uint16_block>(),e=n.end<sc::uint16_block>();i!=e;++i)std::cout<<" "<<*i;std::cout<<"\n";};
 a.walk(show);a.walk(show,{0,0},{1,1});auto pair=[&](const C::element_block_node_type&n,const C::element_block_node_type&m){show(n);show(m);};a.walk(pair,b);a.walk(pair,b,{0,0},{1,1});}
 {Flag flags(2,2,uint8_t(7));flags.walk([](const Flag::element_block_node_type&n){std::cout<<"flag "<<int(n.type)<<" "<<n.offset<<" "<<n.size;for(auto i=n.begin<mdds::mtv::uint8_element_block>(),e=n.end<mdds::mtv::uint8_element_block>();i!=e;++i)std::cout<<" "<<int(*i);std::cout<<"\n";});}
 std::cout<<"done "<<text.pData->refCount<<"\n";
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
