/** @fileoverview Ordinary original matrix storage/access observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-native";
const fixture = "apps/office/src/external/mdds/include/mdds/native-matrix-cases.json";
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
void scalar(){
 std::cout<<"scalar\n";M zero;state("default",zero);
 for(size_t rows=0;rows<=4;++rows)for(size_t cols=0;cols<=4;++cols){
  M m(rows,cols);state("empty",m);
  if(rows*cols){
   for(size_t c=0;c<cols;++c)for(size_t r=0;r<rows;++r){int k=(r+rows*c)%4;if(k==0)m.set(r,c,2.5);else if(k==1)m.set(r,c,true);else if(k==2)m.set(r,c,int32_t(-9));else m.set(r,c,std::string("abc"));}
   state("mixed",m);
   for(size_t c=0;c<cols;++c)for(size_t r=0;r<rows;++r){auto p=m.position(r,c);auto q=m.position(p,r,c);auto next=M::next_position(q);std::cout<<"position "<<r<<" "<<c<<" "<<q.second<<" "<<next.second<<" "<<(next.first==m.end_position().first)<<"\n";m.set(q,4.5);}
   state("hinted",m);m.set_empty(m.position(rows-1,cols-1));state("oneempty",m);m.set_row_empty(0);state("rowempty",m);m.set_column_empty(cols-1);state("colempty",m);
   m.set_empty(0,0,rows*cols);state("allempty",m);
   try{m.set_empty(0,0,0);}catch(const mdds::general_error&e){std::cout<<"lengtherror "<<e.what()<<"\n";}
  }
  M copied(m);std::cout<<"equal "<<(copied==m)<<" "<<(copied!=m)<<"\n";
  M moved(std::move(copied));std::cout<<"move "<<copied.size().row<<" "<<copied.size().column<<" "<<copied.empty()<<" "<<(moved==m)<<"\n";
  M assigned(1,2,3.0);assigned=m;state("assigned",assigned);assigned=assigned;state("self",assigned);
  M movedAssigned; movedAssigned=std::move(assigned);state("moveassigned",movedAssigned);assigned.clear();
  movedAssigned.swap(zero);state("swap",zero);zero.swap(zero);state("selfswap",zero);zero.clear();state("clear",zero);
 }
 for(int type:{-1,0,1,2,5,10,11,52}){try{std::cout<<"type "<<type<<" ";auto v=M::to_mtm_type(type);std::cout<<int(v)<<"\n";}catch(const mdds::type_error&e){std::cout<<e.what()<<"\n";}}
 for(int count=0;count<5;++count){try{M::size_pair_type p;if(count==0)p={};else if(count==1)p={1};else if(count==2)p={1,2};else if(count==3)p={1,2,3};else p={1,2,3,4};std::cout<<"pair "<<count<<" "<<p.row<<" "<<p.column<<" "<<(p==M::size_pair_type(1,2))<<" "<<(p!=M::size_pair_type(1,2))<<"\n";}catch(const mdds::invalid_arg_error&e){std::cout<<"pairerror "<<count<<" "<<e.what()<<"\n";}}
 for(int kind=0;kind<4;++kind){M m(2,2);if(kind==0)m=M(2,2,2.5);else if(kind==1)m=M(2,2,true);else if(kind==2)m=M(2,2,int32_t(-7));else m=M(2,2,std::string("x"));state("filled",m);}
 std::vector<double> vs{1,2,3,4,5};M ranged(2,2,vs.begin(),vs.begin()+4);state("range",ranged);ranged.set(1,0,vs.begin(),vs.begin()+3);state("setrange",ranged);ranged.set(ranged.position(0,0),vs.begin()+1,vs.begin()+3);state("hintrange",ranged);ranged.set_column(1,vs.begin(),vs.end());state("columnlong",ranged);ranged.set_column(0,vs.begin(),vs.begin()+1);state("columnshort",ranged);ranged.set_column(0,vs.begin(),vs.begin());state("columnzero",ranged);
 std::vector<int8_t> unsupported{1,2,3,4};try{M bad(2,2,unsupported.begin(),unsupported.end());}catch(const mdds::type_error&e){std::cout<<"rangeerror "<<e.what()<<"\n";}
 M unsupportedScalar(1,1,int8_t(4));try{unsupportedScalar.get_numeric(0,0);}catch(const mdds::general_error&e){std::cout<<"numericerror "<<e.what()<<"\n";}try{unsupportedScalar.numeric();}catch(const mdds::general_error&e){std::cout<<"allnumericerror "<<e.what()<<"\n";}
 try{ranged.get_string(0,0);}catch(const mdds::general_error&e){std::cout<<"stringerror "<<e.what()<<"\n";}
 M different(3,1);std::cout<<"different "<<(ranged==different)<<" "<<(ranged!=different)<<"\n";
 M values(2,1,1.0);M values2(2,1,2.0);std::cout<<"values "<<(values==values2)<<" "<<(values!=values2)<<"\n";
 std::cout<<"get "<<ranged.get<double>(0,0)<<"\n";
 M nan(1,1,std::numeric_limits<double>::quiet_NaN());std::cout<<"nanbool "<<nan.get_boolean(0,0)<<"\n";
 const M&constref=ranged;auto cp=constref.position(0,0);auto cq=constref.position(cp,1,0);auto ce=constref.end_position();auto cn=M::next_position(cq);std::cout<<"const "<<cq.second<<" "<<ce.second<<" "<<cn.second<<" "<<constref.get_type(0,0)<<" "<<constref.get_numeric(0,0)<<" "<<constref.get_integer(0,0)<<" "<<constref.get_boolean(0,0)<<"\n";
}
void calc(){
 std::cout<<"calc\n";sal_Unicode raw[]={65,0};OUString text(raw,1);svl::SharedString s(text);
 using C=mdds::multi_type_matrix<matrix_traits>;using F=mdds::multi_type_matrix<matrix_flag_traits>;
 auto state=[&](const char*label,const C&m){auto sz=m.size();std::cout<<label<<" "<<text.pData->refCount<<" "<<sz.row<<" "<<sz.column<<" "<<m.empty()<<" "<<m.numeric();for(size_t c=0;c<sz.column;++c)for(size_t r=0;r<sz.row;++r){auto t=m.get_type(r,c);std::cout<<" | "<<int(t)<<" "<<m.get_numeric(r,c);if(t==mdds::mtm::element_string)std::cout<<" "<<int(m.get_string(r,c).getData()->buffer[0]);}std::cout<<"\n";};
 {C m(2,2,s);state("filled",m);m.set(0,0,uint16_t(65535));m.set(m.position(1,1),s);state("mixed",m);{C copied(m);state("copied",copied);C moved(std::move(copied));state("moved",moved);C assigned;assigned=moved;state("assigned",assigned);assigned=std::move(moved);state("moveassigned",assigned);auto v=assigned.get<svl::SharedString>(1,1);state("ownedresult",assigned);std::cout<<"value "<<int(v.getData()->buffer[0])<<"\n";}state("aftercopies",m);m.set_empty(1,1);state("empty",m);m.clear();state("clear",m);}
 F flags(2,2,uint8_t(255));std::cout<<"flags "<<int(flags.get_integer(0,0))<<" "<<flags.get_numeric(0,0)<<" "<<flags.get_boolean(0,0)<<" "<<int(flags.get_type(0,0))<<"\n";std::cout<<"done "<<text.pData->refCount<<"\n";
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
