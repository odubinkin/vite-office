/** @fileoverview Optional unchanged original SoA scalar position-adjustment comparison; portable full native states require no compiler during ordinary tests. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { digest, verifyMddsSources } from "./mdds-native-source.mjs";
const { pinned, target, reference, archiveHashes, sourceHashes } = verifyMddsSources();
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-position-adjustment-cases.json";
const factors = [0, 4, 8, 16, 32];
const cases = [];
for (const n of [0, 1, 2, 3, 4, 5, 7, 8, 9, 15, 16, 17, 31, 32, 33, 63, 64, 65])
  for (let start = 0; start <= n + 2; ++start)
    for (const delta of [-31, 0, 43])
      cases.push({
        positions: Array.from(
          { length: n },
          /** Creates native finite unsigned setup values. @param unused - Empty entry. @param i - Slot. @returns Decimal position. */ (
            unused,
            i,
          ) => String(1000 + i * 17),
        ),
        start: String(start),
        delta: String(delta),
        numberExact: true,
      });
const wide = [
  "0",
  "1",
  "18446744073709551615",
  "18446744073709551614",
  "9223372036854775807",
  "9223372036854775808",
  "9007199254740991",
  "9007199254740992",
];
for (const n of [1, 4, 8, 16, 32, 33, 65])
  for (const start of [0, 1, n - 1, n, n + 1])
    for (const delta of ["-9223372036854775808", "-1", "0", "1", "9223372036854775807"])
      cases.push({
        positions: Array.from(
          { length: n },
          /** Retains full64 native setup positions. @param unused - Empty entry. @param i - Slot. @returns Decimal. */ (
            unused,
            i,
          ) => wide[i % wide.length],
        ),
        start: String(start),
        delta,
        numberExact: false,
      });
for (const start of ["2147483648", "4294967296", "9223372036854775807"])
  cases.push({
    positions: ["7", "9"],
    start,
    delta: "-9223372036854775808",
    numberExact: BigInt(start) <= BigInt(Number.MAX_SAFE_INTEGER),
  });
const driver = String.raw`
#include <mdds/multi_type_vector/soa/main.hpp>
#include <iostream>
#include <type_traits>
using namespace mdds::mtv;
using db_type=soa::multi_type_vector<standard_element_blocks_traits>;
struct access_tag{};
auto& access_store(db_type&,access_tag);
template<auto Member>struct member_access{friend auto& access_store(db_type& db,access_tag){return db.*Member;}};
template struct member_access<&db_type::m_block_store>;
using store_type=std::remove_reference_t<decltype(access_store(std::declval<db_type&>(),access_tag{}))>;
void state(const store_type& s,base_element_block* data){
std::cout<<"[[";for(size_t i=0;i<s.positions.size();++i){if(i)std::cout<<",";std::cout<<'"'<<s.positions[i]<<'"';}
std::cout<<"],[";for(size_t i=0;i<s.sizes.size();++i){if(i)std::cout<<",";std::cout<<s.sizes[i];}
std::cout<<"],[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";std::cout<<(s.element_blocks[i]==data?0:-1);}
std::cout<<"],["<<s.positions.capacity()<<","<<s.sizes.capacity()<<","<<s.element_blocks.capacity()<<"],["<<get_block_type(*data)<<","<<string_element_block::size(*data)<<","<<string_element_block::capacity(*data)<<",[";bool comma=false;for(auto it=string_element_block::cbegin(*data);it!=string_element_block::cend(*data);++it){if(comma)std::cout<<",";comma=true;std::cout<<'"'<<*it<<'"';}std::cout<<"]]]";
}
int main(){
constexpr bool sse=
#if defined(__SSE2__)
true;
#else
false;
#endif
constexpr bool avx=
#if defined(__AVX2__)
true;
#else
false;
#endif
std::cout<<"["<<int(default_traits::loop_unrolling)<<","<<sizeof(size_t)<<","<<(sse?"true":"false")<<","<<(avx?"true":"false")<<","<<MDDS_USE_OPENMP<<"]\n";
int n;int64_t start,delta;while(std::cin>>n>>start>>delta){db_type db;auto& s=access_store(db,access_tag{});auto* data=string_element_block::create_block_with_value(2,std::string("v"));s.reserve(n+7);for(int i=0;i<n;++i){uint64_t pos;std::cin>>pos;s.push_back(pos,3+i%5,i%2?nullptr:data);}auto original=s.positions;std::cout<<"[";state(s,data);
for(int factor:{0,4,8,16,32}){s.positions=original;switch(factor){
case 0:soa::detail::adjust_block_positions<store_type,lu_factor_t::none>{}(s,start,delta);break;
case 4:soa::detail::adjust_block_positions<store_type,lu_factor_t::lu4>{}(s,start,delta);break;
case 8:soa::detail::adjust_block_positions<store_type,lu_factor_t::lu8>{}(s,start,delta);break;
case 16:soa::detail::adjust_block_positions<store_type,lu_factor_t::lu16>{}(s,start,delta);break;
case 32:soa::detail::adjust_block_positions<store_type,lu_factor_t::lu32>{}(s,start,delta);break;
}std::cout<<",";state(s,data);}std::cout<<"]\n";s.clear();standard_element_blocks_traits::block_funcs::delete_block(data);}}
`;
const source = `${target}/position-adjustment.cpp`,
  binary = `${target}/position-adjustment`;
writeFileSync(source, driver);
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
    source,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const input = cases
  .map(
    /** Serializes caller inputs only. @param c - Case. @returns Native line. */ (c) =>
      `${c.positions.length} ${c.start} ${c.delta} ${c.positions.join(" ")}`,
  )
  .join("\n");
const raw = execFileSync(binary, {
  input,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  timeout: 30000,
});
writeFileSync(`${target}/position-adjustment-output.jsonl`, raw);
const lines = raw
  .trim()
  .split("\n")
  .map(
    /** Parses complete raw states. @param line - Native output. @returns State. */ (line) =>
      JSON.parse(line),
  );
const snapshots = [],
  ids = new Map();
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target:
    "host clang++ arm64 size_t64 ASan UBSan; full unchanged original private blocks_type and five architecture-neutral block_util specializations; SSE2/AVX2 absent and OpenMP0, no native algorithm or access-token rewriting",
  defaults: lines[0],
  factors,
  snapshots,
  cases: cases.map(
    /** Interns complete before/after states losslessly. @param c - Caller input. @param index - Raw record. @returns Fixture record. */ (
      c,
      index,
    ) => ({
      ...c,
      states: lines[index + 1].map(
        /** Retains all metadata, aliases, capacities and complete payload. @param state - Native state. @returns Stable snapshot ID. */ (
          state,
        ) => {
          const key = JSON.stringify(state);
          let id = ids.get(key);
          if (id === undefined) {
            id = snapshots.length;
            ids.set(key, id);
            snapshots.push(state);
          }
          return id;
        },
      ),
    }),
  ),
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original position adjustment fixture differs.");
console.log(
  `Original position adjustment: ${cases.length} complete cases/${cases.length * 5} scalar calls/${cases.length * 6} full before-after states/${snapshots.length} lossless snapshots; five original factors and uint64 arithmetic.`,
);
