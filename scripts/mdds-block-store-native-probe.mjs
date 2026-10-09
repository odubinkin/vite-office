/** @fileoverview Optional genuine private SoA block-array comparison; unchanged full native headers, caller-only access bridge and portable lossless outputs. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { digest, verifyMddsSources } from "./mdds-native-source.mjs";
const { pinned, target, reference, archiveHashes, sourceHashes } = verifyMddsSources();
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-block-store-cases.json";
const kinds = [
  "boolean",
  "int8",
  "uint8",
  "int16",
  "uint16",
  "int32",
  "uint32",
  "int64",
  "uint64",
  "float",
  "double",
  "string",
];
const cases = [];
/** Adds all original scalar data families. @param commands - Caller operations, K denotes original family discriminator. @returns Nothing. */
function add(commands) {
  for (let type = 0; type < 12; ++type)
    cases.push({
      type,
      commands: commands.map(
        /** Substitutes only the native scalar caller parameter. @param cmd - Command. @returns Command. */ (
          cmd,
        ) => [
          cmd[0],
          ...cmd
            .slice(1)
            .map(
              /** Retains operand syntax and values. @param x - Token. @returns Token. */ (x) =>
                x === "K" ? type : x,
            ),
        ],
      ),
    });
}
const base = [
  ["P", 0, 0, 2, "K", "1"],
  ["P", 0, 2, 1, -1, "0"],
  ["P", 0, 3, 3, "K", "7"],
  ["P", 1, 0, 2, "K", "1"],
  ["P", 1, 2, 1, -1, "0"],
  ["P", 1, 3, 3, "K", "7"],
];
for (let index = 0; index <= 3; ++index) {
  for (let count = 0; count <= 3 - index; ++count)
    add([...base, ["R", 0, index, count], ["A", 0, Math.min(index, 3 - count), 1], ["K", 0]]);
  for (const count of [0, 1, 2, 4])
    add([...base, ["I", 0, index, count], ["K", 0], ["Q", 1, 0], ["L", 1, 0]]);
  add([...base, ["U", 0, index, 19, 2, "K", "9"], ["K", 0], ["Q", 1, 0]]);
  add([...base, ["A", 0, index, 1], ["M", 0, -1], ["G", 1, 0]]);
  if (index < 3) {
    add([...base, ["E", 0, index], ["K", 0]]);
    add([...base, ["T", 0, index, 91], ["C", 0, index], ["N", 0, index]]);
    for (let j = 0; j < 3; ++j) add([...base, ["X", 0, index, j], ["Q", 1, 0], ["W", 0, 1]]);
  }
}
for (const count of [0, 1, 2, 3, 4, 8, 32, 65])
  add([...base, ["O", 0, count], ["W", 0, 1], ["D", 1, 0], ["K", 0], ["K", 1]]);
for (const op of ["Q", "L", "D"]) {
  add([...base, [op, 1, 0], ["B", 1], ["P", 0, 0, 0, "K", "0"], ["K", 0], ["K", 1]]);
  add([
    [op, 1, 0],
    ["Q", 0, 1],
    ["L", 1, 0],
    ["W", 0, 1],
  ]);
}
for (const op of ["H", "M"]) {
  for (const fail of [-1, 1, 2]) add([...base, [op, 0, fail], ["G", 1, 0], ["Z", 0], ["G", 0, 1]]);
}
add([...base, ["Z", 0], ["S", 0, 0, 0, -1, "0"], ["s", 1], ["K", 0], ["K", 1]]);
add([...base, ["d", 0, 0], ["K", 0], ["Q", 1, 0], ["b", 0, 0], ["K", 0], ["Z", 0]]);
add([...base, ["b", 0, 0], ["K", 0], ["Q", 1, 0], ["Z", 0], ["Z", 1], ["G", 0, 1]]);
add([...base, ["v", 0, 1, 89], ["Q", 1, 0], ["T", 0, 0, 88], ["G", 0, 1], ["Z", 0]]);
add([...base, ["Z", 0], ["Z", 1], ["I", 0, 0, 0], ["R", 1, 0, 0], ["K", 0], ["G", 0, 1]]);
const driver =
  String.raw`
#include <mdds/multi_type_vector/soa/main.hpp>
#include <iostream>
#include <iomanip>
#include <type_traits>
using namespace mdds::mtv;
using db_type=soa::multi_type_vector<standard_element_blocks_traits>;
using dispatcher=standard_element_blocks_traits::block_funcs;
// These caller-only bridges expose the original private owner/type through
// explicit template instantiation. No native class body or access token changes.
struct access_tag{};
auto& access_store(db_type&,access_tag);
auto make_slot(size_t,size_t,access_tag);
auto empty_slot(access_tag);
auto make_transfer(access_tag);
template<auto Member>struct member_access{friend auto& access_store(db_type& db,access_tag){return db.*Member;}};
template struct member_access<&db_type::m_block_store>;
template<class T>struct slot_access{friend auto make_slot(size_t p,size_t s,access_tag){return T(p,s);}friend auto empty_slot(access_tag){return T();}};
template struct slot_access<db_type::block_slot_type>;
template<class T>struct transfer_access{friend auto make_transfer(access_tag){return T();}};
template struct transfer_access<db_type::blocks_to_transfer>;
using store_type=std::remove_reference_t<decltype(access_store(std::declval<db_type&>(),access_tag{}))>;
std::vector<base_element_block*> pool;
std::vector<int> calls;
int fail_after=-1;
int remember(base_element_block* b){if(!b)return -1;auto p=std::find(pool.begin(),pool.end(),b);if(p==pool.end()){pool.push_back(b);return int(pool.size())-1;}return std::distance(pool.begin(),p);}
template<class T>T value(const std::string& text){if constexpr(std::is_same_v<T,std::string>)return text;else if constexpr(std::is_integral_v<T>)return static_cast<T>(std::stoll(text));else return static_cast<T>(std::stod(text));}
template<class T>void print(T v){if constexpr(std::is_same_v<T,std::string>||(std::is_integral_v<T>&&sizeof(T)==8))std::cout<<'"'<<v<<'"';else if constexpr(std::is_same_v<T,bool>)std::cout<<(v?"true":"false");else std::cout<<+v;}
template<class B>base_element_block* filled(int count,const std::string& text){return B::create_block_with_value(count,value<typename B::value_type>(text));}
base_element_block* create(int type,int count,const std::string& text){if(type<0)return nullptr;switch(type){
` +
  kinds
    .map(
      /** Emits only original scalar template calls. @param kind - Alias. @param type - Discriminator. @returns Caller switch. */ (
        kind,
        type,
      ) => `case ${type}:return filled<${kind}_element_block>(count,text);`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
template<class B>void payload(const base_element_block& b){std::cout<<"["<<get_block_type(b)<<","<<B::size(b)<<","<<B::capacity(b)<<",[";bool comma=false;for(auto it=B::cbegin(b);it!=B::cend(b);++it){if(comma)std::cout<<",";comma=true;print<typename B::value_type>(*it);}std::cout<<"]]";}
void payload(const base_element_block& b){switch(get_block_type(b)){
` +
  kinds
    .map(
      /** Emits unchanged scalar observation calls. @param kind - Alias. @param type - Discriminator. @returns Caller switch. */ (
        kind,
        type,
      ) => `case ${type}:payload<${kind}_element_block>(b);break;`,
    )
    .join("\n") +
  String.raw`
}}
base_element_block* logged_copy(const base_element_block& b){calls.push_back(remember(const_cast<base_element_block*>(&b)));if(int(calls.size())==fail_after)throw std::runtime_error("copy failure");auto p=dispatcher::copy_block(b);remember(p);return p;}
void trim(base_element_block& b){calls.push_back(remember(&b));if(int(calls.size())==fail_after)throw std::runtime_error("mutation failure");dispatcher::resize_block(b,1);}
bool logged_equal(const base_element_block& a,const base_element_block& b){calls.push_back(remember(const_cast<base_element_block*>(&a)));calls.push_back(remember(const_cast<base_element_block*>(&b)));return dispatcher::equal_block(a,b);}
void vector(const std::vector<size_t>& v){std::cout<<"[";for(size_t i=0;i<v.size();++i){if(i)std::cout<<",";std::cout<<v[i];}std::cout<<"]";}
void store(const store_type& s){std::cout<<"[";vector(s.positions);std::cout<<",";vector(s.sizes);std::cout<<",[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";std::cout<<remember(s.element_blocks[i]);}std::cout<<"],["<<s.positions.capacity()<<","<<s.sizes.capacity()<<","<<s.element_blocks.capacity()<<"]]";}
int main(){std::cout<<std::setprecision(17);auto slot=empty_slot(access_tag{});auto transfer=make_transfer(access_tag{});std::cout<<"["<<slot.position<<","<<slot.size<<","<<(slot.element_block==nullptr?"true":"false")<<","<<transfer.blocks.positions.size()<<","<<transfer.insert_index<<","<<(std::is_copy_assignable_v<store_type>?"true":"false")<<"]\n";int count;while(std::cin>>count){db_type db[2];store_type* a[2]={&access_store(db[0],access_tag{}),&access_store(db[1],access_tag{})};pool.clear();std::cout<<"[";for(int step=0;step<count;++step){char op;int t;std::cin>>op>>t;auto& s=*a[t];std::string result="null";calls.clear();fail_after=-1;
if(op=='P'||op=='S'){size_t pos,size;int type;std::string text;std::cin>>pos>>size>>type>>text;auto data=create(type,size,text);remember(data);if(op=='P')s.push_back(pos,size,data);else{auto slot=make_slot(pos,size,access_tag{});slot.element_block=data;s.push_back(slot);}}
else if(op=='s'){auto slot=empty_slot(access_tag{});s.push_back(slot);}
else if(op=='U'){size_t index,pos,size;int type;std::string text;std::cin>>index>>pos>>size>>type>>text;auto data=create(type,size,text);remember(data);s.insert(index,pos,size,data);}
else if(op=='I'){size_t index,size;std::cin>>index>>size;s.insert(index,size);}
else if(op=='A'){size_t index;int other;std::cin>>index>>other;s.insert(index,*a[other]);}
else if(op=='E'){size_t index;std::cin>>index;s.erase(index);}
else if(op=='R'){size_t index,size;std::cin>>index>>size;s.erase(index,size);}
else if(op=='B')s.pop_back();else if(op=='Z')s.clear();
else if(op=='O'){size_t cap;std::cin>>cap;s.reserve(cap);}
else if(op=='C'){size_t index;std::cin>>index;s.calc_block_position(index);}
else if(op=='N'){size_t index;std::cin>>index;result=std::to_string(s.calc_next_block_position(index));}
else if(op=='X'){size_t first,second;std::cin>>first>>second;s.swap(first,second);}
else if(op=='W'){int other;std::cin>>other;s.swap(*a[other]);}
else if(op=='Q'||op=='L'||op=='D'){int other;std::cin>>other;if(op=='Q'){store_type copied(*a[other]);s.swap(copied);}else if(op=='L'){store_type cloned(detail::clone_construction_type{},*a[other]);s.swap(cloned);}else{store_type moved(std::move(*a[other]));s.swap(moved);}}
else if(op=='T'||op=='v'){size_t index,val;std::cin>>index>>val;if(op=='T')s.positions[index]=val;else s.sizes[index]=val;}
else if(op=='d'||op=='b'){int unused;std::cin>>unused;if(op=='d')s.sizes.pop_back();else s.element_blocks.pop_back();}
else if(op=='K'){try{s.check_integrity();}catch(const mdds::integrity_error& e){result=std::string("\"")+e.what()+"\"";}}
else if(op=='H'||op=='M'){std::cin>>fail_after;try{if(op=='H')soa::detail::copy_blocks<default_exec_policy,logged_copy>{}(s.element_blocks);else soa::detail::mutate_blocks<default_exec_policy,trim>{}(s.element_blocks);}catch(const std::runtime_error& e){result=std::string("\"")+e.what()+"\"";}}
else if(op=='G'){int other;std::cin>>other;result=soa::detail::equal_blocks<default_exec_policy,logged_equal>{}(s.element_blocks,a[other]->element_blocks)?"true":"false";}
else std::abort();
for(auto* owner:a)for(auto* data:owner->element_blocks)remember(data);
if(step)std::cout<<",";std::cout<<"["<<result<<",";store(*a[0]);std::cout<<",";store(*a[1]);std::cout<<",[";for(size_t i=0;i<pool.size();++i){if(i)std::cout<<",";payload(*pool[i]);}std::cout<<"],"<<(a[0]->equals(*a[1])?"true":"false")<<",[";for(size_t i=0;i<calls.size();++i){if(i)std::cout<<",";std::cout<<calls[i];}std::cout<<"]]";
}std::cout<<"]\n";a[0]->clear();a[1]->clear();for(auto* data:pool)dispatcher::delete_block(data);pool.clear();}}
`;
const source = `${target}/block-store.cpp`,
  binary = `${target}/block-store`;
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
    /** Serializes valid original owner caller operations. @param c - Case. @returns Native input. */ (
      c,
    ) =>
      `${c.commands.length}\n${c.commands.map(/** Writes one native command. @param op - Tokens. @returns Line. */ (op) => op.join(" ")).join("\n")}`,
  )
  .join("\n");
const raw = execFileSync(binary, {
  input,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  timeout: 30000,
});
writeFileSync(`${target}/block-store-output.jsonl`, raw);
const lines = raw
  .trim()
  .split("\n")
  .map(
    /** Retains complete native output. @param line - JSON. @returns Record. */ (line) =>
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
    "host clang++ libc++ ASan UBSan; unchanged actual private SoA blocks_type via caller-only access bridge, default execution specialization; no access-token or native algorithm rewriting",
  defaults: lines[0],
  snapshots,
  cases: cases.map(
    /** Losslessly interns full after-every-command original records. @param c - Setup. @param index - Position. @returns Complete encoded sequence. */ (
      c,
      index,
    ) => ({
      ...c,
      states: lines[index + 1].map(
        /** Retains a complete original state by stable identifier. @param state - Full record. @returns Identifier. */ (
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
  throw new Error("Original block store fixture differs.");
console.log(
  `Original block-array owners: ${cases.length} complete sequences/${cases.reduce(/** Counts every original command snapshot. @param n - Total. @param c - Case. @returns Count. */ (n, c) => n + c.commands.length, 0)} full two-owner steps/${snapshots.length} lossless complete snapshots, all12 scalar block families and callback/integrity/default observations.`,
);
