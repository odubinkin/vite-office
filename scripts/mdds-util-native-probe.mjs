/** @fileoverview Optional genuine pinned container utility comparison; ordinary tests consume committed portable outputs. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/mdds-native";
const reference = "vendor/mdds-reference";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-util-cases.json";
/** Hashes exact source bytes. @param bytes - Source. @returns Digest. */
function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
/** Verifies a complete pinned LibreOffice source blob. @param file - Native path. @returns Original bytes. */
function original(file) {
  const bytes = readFileSync(`${upstream}/${file}`);
  if (!bytes.equals(execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`])))
    throw new Error(`Changed pinned LibreOffice source: ${file}`);
  return bytes;
}
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("The native probe requires the exact pinned LibreOffice checkout.");
const downloads = original("download.lst").toString();
const archives = { mdds: "mdds-3.2.1.tar.xz", boost: "boost_1_91_0.tar.xz" };
const archiveHashes = {};
for (const [name, archive] of Object.entries(archives)) {
  const prefix = name.toUpperCase();
  const expected = downloads.match(new RegExp(`${prefix}_SHA256SUM\\s*:?=\\s*([a-f0-9]+)`))?.[1];
  const bytes = readFileSync(`${target}/${archive}`);
  if (!expected || digest(bytes) !== expected || !downloads.includes(archive))
    throw new Error(`Archive differs from pinned download.lst: ${archive}`);
  archiveHashes[name] = expected;
}
// Validate actual compiler inputs against freshly extracted verified archives,
// including the exact original LibreOffice patch. No synthesized native helpers.
const clean = `${target}/verified`;
mkdirSync(clean, { recursive: true });
execFileSync("tar", ["-xf", `${target}/${archives.mdds}`, "-C", clean]);
execFileSync("tar", ["-xf", `${target}/${archives.boost}`, "-C", clean, "boost_1_91_0/boost"]);
const patch = original("external/mdds/gcc-12-silence-use-after-free.patch.1");
execFileSync("patch", ["-d", `${clean}/mdds-3.2.1`, "-p1"], { input: patch });
/** Checks every actual header against verified upstream files. @param actual - Compiler directory. @param expected - Verified directory. @returns Nothing. */
function verifyDirectory(actual, expected) {
  for (const entry of readdirSync(expected, { withFileTypes: true })) {
    const a = path.join(actual, entry.name),
      e = path.join(expected, entry.name);
    if (entry.isDirectory()) verifyDirectory(a, e);
    else if (!readFileSync(a).equals(readFileSync(e)))
      throw new Error(`Changed native dependency: ${a}`);
  }
}
verifyDirectory(`${reference}/include`, `${clean}/mdds-3.2.1/include`);
verifyDirectory(`${target}/boost_1_91_0/boost`, `${clean}/boost_1_91_0/boost`);
const sourceHashes = Object.fromEntries(
  [
    "global.hpp",
    "multi_type_vector/types.hpp",
    "multi_type_vector/types_util.hpp",
    "multi_type_vector/delayed_delete_vector.hpp",
    "multi_type_vector/standard_element_blocks.hpp",
    "multi_type_vector/block_funcs.hpp",
    "multi_type_vector/macro.hpp",
    "multi_type_vector/util.hpp",
    "multi_type_vector/soa/main.hpp",
    "multi_type_vector/soa/main_def.inl",
    "multi_type_vector/soa/iterator.hpp",
    "multi_type_vector/iterator_node.hpp",
    "multi_type_vector/soa/block_util.hpp",
  ].map(
    /** Hashes the unchanged compiler source. @param file - Header. @returns Path and digest. */
    (file) => [file, digest(readFileSync(`${reference}/include/mdds/${file}`))],
  ),
);
const layouts = [
  Array(10).fill(-1),
  [0, 0, 10, 10, 11, 11, 11, -1, -1, 4],
  [10, 11, 4, 0, -1, 10, 11, 4, 0, -1],
  [0],
  Array(16).fill(10),
  [-1, 10, -1, 4, -1, 11, -1, 0, -1],
];
const inputs = [];
for (const reverse of [false, true])
  for (const [first, last] of [
    [0, 0],
    [0, 1],
    [0, 5],
    [2, 8],
    [3, 2],
    [8, 3],
    [10, 10],
  ])
    for (let pos = 0; pos <= 8; ++pos)
      for (let size = 0; size <= 9; ++size)
        inputs.push({ reverse, first, last, pos: String(pos), size: String(size) });
for (const reverse of [false, true])
  for (const [first, last, pos, size] of [
    [0, 2, "18446744073709551615", "1"],
    [0, 2, "18446744073709551614", "18446744073709551615"],
    [0, 2, "18446744073709551610", "18446744073709551615"],
    [0, 0, "18446744073709551615", "0"],
    [3, 2, "3", "2"],
  ])
    inputs.push({ reverse, first, last, pos, size });
const driver = String.raw`
#define MDDS_MULTI_TYPE_VECTOR_TRACE 1
#include <mdds/multi_type_vector/soa/main.hpp>
#include <mdds/multi_type_vector/util.hpp>
#include <iostream>
#include <limits>
#include <type_traits>
using db_type=mdds::mtv::soa::multi_type_vector<mdds::mtv::standard_element_blocks_traits>;
std::vector<std::string> traces;
struct tracing_traits:mdds::mtv::default_traits{static void trace(const mdds::mtv::trace_method_properties_t& props){traces.push_back(props.function_args);if(props.function_args=="throw")throw std::runtime_error("trace failure");}};
template<class It>void observe_position(db_type& db,const std::pair<It,size_t>& pos){const db_type& cdb=db;std::cout<<"["<<std::distance(cdb.begin(),db_type::const_iterator(pos.first))<<","<<pos.second<<","<<(pos.first==db.end()?"true":"false");if(pos.first==db.end())std::cout<<",null";else std::cout<<",["<<pos.first->type<<","<<pos.first->position<<","<<pos.first->size<<","<<(pos.first->data?std::distance(cdb.begin(),db_type::const_iterator(pos.first)):-1)<<"]";std::cout<<"]";}
template<class It>void position_case(db_type& db,size_t logical,int steps,It first){std::pair<It,size_t> pos(first,logical-first->position);auto result=mdds::mtv::detail::advance_position(pos,steps);std::cout<<"[";observe_position(db,pos);std::cout<<",";observe_position(db,result);std::cout<<"]";}
template<class It>void input_case(It first,It last,uint64_t pos,uint64_t size){std::cout<<"["<<std::distance(first,last)<<",";try{auto r=mdds::mtv::detail::calc_input_end_position(first,last,pos,size);std::cout<<"[\""<<r.first<<"\","<<(r.second?"true":"false")<<"]";}catch(const std::out_of_range& e){std::cout<<'"'<<e.what()<<'"';}std::cout<<"]\n";}
void trace_case(int initial){traces.clear();int depth=initial;std::vector<int> states{depth};mdds::mtv::trace_method_properties_t props;props.function_args="outer";{mdds::mtv::detail::call_trace<tracing_traits> outer(depth);states.push_back(depth);outer(props);{mdds::mtv::detail::call_trace<tracing_traits> inner(depth);states.push_back(depth);props.function_args="inner";inner(props);}states.push_back(depth);props.function_args="after";outer(props);}states.push_back(depth);{mdds::mtv::detail::call_trace<mdds::mtv::default_traits> sink(depth);states.push_back(depth);sink(props);}states.push_back(depth);try{mdds::mtv::detail::call_trace<tracing_traits> failure(depth);states.push_back(depth);props.function_args="throw";failure(props);}catch(const std::runtime_error&){states.push_back(depth);}states.push_back(depth);std::cout<<"[";for(size_t i=0;i<states.size();++i){if(i)std::cout<<",";std::cout<<states[i];}std::cout<<"],[";for(size_t i=0;i<traces.size();++i){if(i)std::cout<<",";std::cout<<'"'<<traces[i]<<'"';}std::cout<<"]";}
int main(){using namespace mdds::mtv;std::cout<<"[";for(int initial:{-1,0,1}){if(initial!=-1)std::cout<<",";std::cout<<"[";trace_case(initial);std::cout<<"]";}std::cout<<"]\n";
std::cout<<"["<<int(default_traits::loop_unrolling)<<","<<(std::is_same_v<default_traits::event_func,empty_event_func>?"true":"false")<<","<<(std::is_same_v<default_traits::exec_policy,default_exec_policy>?"true":"false")<<","<<(std::is_empty_v<detail::clone_construction_type>?"true":"false")<<","<<(detail::has_trace<default_traits>::value?"true":"false")<<","<<(detail::has_trace<tracing_traits>::value?"true":"false")<<",[";for(element_t t=0;t<=11;++t){if(t)std::cout<<",";auto* b=standard_element_blocks_traits::block_funcs::create_new_block(t,3);std::cout<<standard_element_blocks_traits::block_funcs::size(*b);empty_event_func event;event.element_block_acquired(b);event.element_block_released(b);standard_element_blocks_traits::block_funcs::delete_block(b);}std::cout<<"],";try{default_traits::block_funcs::create_new_block(0,0);}catch(const mdds::general_error& e){std::cout<<'"'<<e.what()<<'"';}std::cout<<", ";try{detail::throw_block_position_not_found("position",41,7,3,10);}catch(const std::out_of_range& e){std::cout<<'"'<<e.what()<<'"';}std::cout<<"]\n";
char mode;while(std::cin>>mode){if(mode=='L'){int count;std::cin>>count;db_type db(count);for(int i=0;i<count;++i){int type;std::cin>>type;if(type==10)db.set(i,1.25);else if(type==11)db.set(i,std::string("S"));else if(type==4)db.set(i,uint16_t(1));else if(type==0)db.set(i,true);}std::cout<<"[";bool comma=false;for(auto it=db.begin();it!=db.end();++it){if(comma)std::cout<<",";comma=true;std::cout<<"["<<it->type<<","<<it->position<<","<<it->size<<","<<(it->data?std::distance(db.begin(),it):-1)<<"]";}std::cout<<"]\n";std::cout<<"[";comma=false;for(size_t pos=0;pos<db.size();++pos)for(int step=-int(pos);step<=int(db.size()-pos);++step){if(comma)std::cout<<",";comma=true;std::cout<<"["<<pos<<","<<step<<",";position_case(db,pos,step,db.position(pos).first);std::cout<<",";const db_type& cdb=db;position_case(db,pos,step,cdb.position(pos).first);std::cout<<"]";}std::cout<<"]\n";}else{bool reverse;int start,end;uint64_t pos,size;std::cin>>reverse>>start>>end>>pos>>size;delayed_delete_vector<uint16_t> store(12,1);store.erase(store.begin());store.erase(store.begin());if(reverse)input_case(store.rbegin()+start,store.rbegin()+end,pos,size);else input_case(store.begin()+start,store.begin()+end,pos,size);}}}
`;
const driverPath = `${target}/util.cpp`,
  binary = `${target}/util`;
writeFileSync(driverPath, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-g",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-omit-frame-pointer",
    `-I${reference}/include`,
    `-I${target}/boost_1_91_0`,
    driverPath,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const commands = [
  ...layouts.map(
    /** Serializes actual native container setup. @param values - Cell types. @returns Input. */ (
      values,
    ) => `L ${values.length} ${values.join(" ")}`,
  ),
  ...inputs.map(
    /** Serializes original UInt64 utility input. @param sample - Case. @returns Input. */ (
      sample,
    ) => `I ${Number(sample.reverse)} ${sample.first} ${sample.last} ${sample.pos} ${sample.size}`,
  ),
].join("\n");
const raw = execFileSync(binary, {
  input: commands,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
  timeout: 30000,
});
writeFileSync(`${target}/util-output.jsonl`, raw);
const lines = raw
  .trim()
  .split("\n")
  .map(
    /** Retains full original outputs. @param line - JSON. @returns Observation. */ (line) =>
      JSON.parse(line),
  );
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target: "host clang++ libc++ ASan UBSan TRACE enabled; actual original soa multi_type_vector",
  traces: lines[0],
  defaults: lines[1],
  layouts: layouts.map(
    /** Pairs all real native container position observations. @param cells - Types. @param index - Layout. @returns Complete records. */ (
      cells,
      index,
    ) => ({ cells, nodes: lines[2 + index * 2], positions: lines[3 + index * 2] }),
  ),
  inputs: inputs.map(
    /** Pairs every original input result. @param sample - Input. @param index - Position. @returns Observation. */ (
      sample,
      index,
    ) => ({ ...sample, result: lines[2 + layouts.length * 2 + index] }),
  ),
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original utility fixture differs.");
console.log(
  `Original utilities: ${document.layouts.reduce(/** Counts complete positions. @param count - Total. @param layout - Records. @returns Total. */ (count, layout) => count + layout.positions.length, 0)} mutable/const position pairs, ${inputs.length} complete input results,3 full trace scopes and original defaults.`,
);
