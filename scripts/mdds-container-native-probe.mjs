/** @fileoverview Optional original SoA container lifetime comparison using unchanged full native headers and portable lossless complete live-state outputs. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { digest, verifyMddsSources } from "./mdds-native-source.mjs";
const { pinned, target, reference, archiveHashes, sourceHashes } = verifyMddsSources();
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-container-cases.json";
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
for (let type = 0; type < 12; ++type) {
  for (const n of [0, 1, 2, 5, 17])
    cases.push({
      seed: -1,
      commands: [
        ["D", 0],
        ["Z", 1, n],
        ["F", 0, n, type, "2"],
        ["Q", 2, 0],
        ["L", 1, 0],
        ["S", 1],
        ["M", 2, 0],
        ["W", 1, 2],
        ["A", 1, 1],
        ["V", 2, 2],
        ["W", 2, 2],
        ["C", 0],
        ["C", 1],
        ["U", 2],
      ],
    });
  for (const n of [0, 1, 3, 17])
    for (const length of [Math.max(n - 1, 0), n, n + 1])
      cases.push({
        seed: -1,
        commands: [
          ["D", 0],
          ["R", 0, n, type, "2", length],
          ["D", 1],
          ["Q", 2, 0],
          ["V", 1, 2],
          ["F", 2, n, type, "0"],
          ["A", 0, 2],
          ["S", 0],
          ["U", 0],
          ["U", 1],
          ["U", 2],
        ],
      });
  cases.push({
    seed: type,
    commands: [
      ["Q", 1, 0],
      ["L", 2, 0],
      ["W", 0, 1],
      ["A", 0, 0],
      ["V", 2, 0],
      ["S", 2],
      ["C", 1],
      ["M", 1, 2],
      ["V", 0, 1],
      ["U", 0],
      ["U", 1],
      ["U", 2],
    ],
  });
}
cases.push({
  seed: -1,
  commands: [
    ["H", 0, 77],
    ["h", 1, 88],
    ["Z", 2, 4],
    ["A", 0, 2],
    ["V", 1, 0],
    ["W", 1, 2],
    ["Q", 0, 1],
    ["L", 2, 0],
    ["C", 0],
    ["U", 1],
    ["U", 2],
  ],
});
const driver =
  String.raw`
#include <mdds/multi_type_vector/soa/main.hpp>
#include <iostream>
#include <iomanip>
#include <memory>
#include <map>
#include <type_traits>
using namespace mdds::mtv;
std::map<const base_element_block*,int> ids;int next_token=0;
struct event_entry{int owner,token,type;size_t size;bool acquired;};
std::shared_ptr<std::vector<event_entry>> log_entries;
int id(const base_element_block* p){if(!p)return -1;auto it=ids.find(p);if(it==ids.end())it=ids.emplace(p,next_token++).first;return it->second;}
struct events{static inline int next=1;int tag=next++;std::shared_ptr<std::vector<event_entry>> log=log_entries;
void element_block_acquired(const base_element_block* p){if(log)log->push_back({tag,id(p),get_block_type(*p),standard_element_blocks_traits::block_funcs::size(*p),true});}
void element_block_released(const base_element_block* p){if(log)log->push_back({tag,id(p),get_block_type(*p),standard_element_blocks_traits::block_funcs::size(*p),false});ids.erase(p);}
};
struct traits:standard_element_blocks_traits{using event_func=events;};
using db_type=soa::multi_type_vector<traits>;
struct access_tag{};auto& access_store(db_type&,access_tag);
template<auto Member>struct member_access{friend auto& access_store(db_type& db,access_tag){return db.*Member;}};
template struct member_access<&db_type::m_block_store>;
template<class T>T value(const std::string& t){if constexpr(std::is_same_v<T,std::string>)return t;else if constexpr(std::is_integral_v<T>)return static_cast<T>(std::stoll(t));else return static_cast<T>(std::stod(t));}
template<class T>void print(T v){if constexpr(std::is_same_v<T,std::string>||(std::is_integral_v<T>&&sizeof(T)==8))std::cout<<'"'<<v<<'"';else if constexpr(std::is_same_v<T,bool>)std::cout<<(v?"true":"false");else std::cout<<+v;}
template<class T>std::unique_ptr<db_type> filled(size_t n,const std::string& text){return std::make_unique<db_type>(n,value<T>(text));}
template<class T>std::unique_ptr<db_type> ranged(size_t n,const std::string& text,size_t length){const std::vector<T> values(length,value<T>(text));return std::make_unique<db_type>(n,values.cbegin(),values.cend());}
std::unique_ptr<db_type> create(size_t n,int type,const std::string& text,int length){switch(type){
` +
  kinds
    .map(
      /** Emits original constructor template calls only. @param kind - Native alias. @param type - Scalar discriminator. @returns Caller switch. */ (
        kind,
        type,
      ) =>
        `case ${type}:if(length<0)return filled<typename ${kind}_element_block::value_type>(n,text);return ranged<typename ${kind}_element_block::value_type>(n,text,length);`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
void set_cell(db_type& db,size_t pos,int type){switch(type){
` +
  kinds
    .map(
      /** Prepares original compound input outside the reviewed constructor/operator algorithms. @param kind - Alias. @param type - Discriminator. @returns Original public caller. */ (
        kind,
        type,
      ) =>
        `case ${type}:db.set(pos,value<typename ${kind}_element_block::value_type>("2"));return;`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
template<class B>void payload(const base_element_block& b){std::cout<<"["<<get_block_type(b)<<","<<B::size(b)<<","<<B::capacity(b)<<",[";bool comma=false;for(auto it=B::cbegin(b);it!=B::cend(b);++it){if(comma)std::cout<<",";comma=true;print<typename B::value_type>(*it);}std::cout<<"]]";}
void payload(const base_element_block& b){switch(get_block_type(b)){
` +
  kinds
    .map(
      /** Observes only genuine existing scalar payload owners. @param kind - Native alias. @param type - Discriminator. @returns Observation switch. */ (
        kind,
        type,
      ) => `case ${type}:payload<${kind}_element_block>(b);return;`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
template<class It>void node(const It& it,const It& end,const db_type& db){const auto& n=it.get_node();const bool at_end=it==end;std::cout<<"["<<n.type<<","<<n.position<<","<<n.size<<","<<id(n.data)<<",";if(at_end)std::cout<<"null,null";else std::cout<<(n.__private_data.parent==&db?"true":"false")<<","<<n.__private_data.block_index;std::cout<<"]";}
void state(db_type& db){const auto& s=access_store(db,access_tag{});std::cout<<"["<<db.size()<<","<<db.block_size()<<","<<(db.empty()?"true":"false")<<",["<<db.event_handler().tag<<","<<(db.event_handler().log?"true":"false")<<"],[[";for(size_t i=0;i<s.positions.size();++i){if(i)std::cout<<",";std::cout<<s.positions[i];}std::cout<<"],[";for(size_t i=0;i<s.sizes.size();++i){if(i)std::cout<<",";std::cout<<s.sizes[i];}std::cout<<"],[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";std::cout<<id(s.element_blocks[i]);}std::cout<<"],["<<s.positions.capacity()<<","<<s.sizes.capacity()<<","<<s.element_blocks.capacity()<<"]],[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";if(s.element_blocks[i])payload(*s.element_blocks[i]);else std::cout<<"null";}std::cout<<"],[";node(db.begin(),db.end(),db);std::cout<<",";node(db.end(),db.end(),db);std::cout<<",";node(db.cbegin(),db.cend(),db);std::cout<<",";node(db.cend(),db.cend(),db);std::cout<<",";node(db.rbegin(),db.rend(),db);std::cout<<",";node(db.rend(),db.rend(),db);std::cout<<",";node(db.crbegin(),db.crend(),db);std::cout<<",";node(db.crend(),db.crend(),db);std::cout<<"]]";}
void record(std::unique_ptr<db_type>* db,const std::string& result,bool stable){std::cout<<"["<<result<<","<<(stable?"true":"false")<<",[";for(int i=0;i<3;++i){if(i)std::cout<<",";if(db[i])state(*db[i]);else std::cout<<"null";}std::cout<<"],[";bool comma=false;for(int i=0;i<3;++i)for(int j=0;j<3;++j){if(comma)std::cout<<",";comma=true;if(db[i]&&db[j])std::cout<<"["<<(*db[i]==*db[j]?"true":"false")<<","<<(*db[i]!=*db[j]?"true":"false")<<"]";else std::cout<<"null";}std::cout<<"],[";for(size_t i=0;i<log_entries->size();++i){if(i)std::cout<<",";const auto& e=(*log_entries)[i];std::cout<<"["<<e.owner<<","<<e.token<<","<<e.type<<","<<e.size<<","<<(e.acquired?"true":"false")<<"]";}std::cout<<"]]";}
int main(){std::cout<<std::setprecision(17);int seed,count;while(std::cin>>seed>>count){ids.clear();next_token=0;events::next=1;log_entries=std::make_shared<std::vector<event_entry>>();std::unique_ptr<db_type> db[3];if(seed>=0){db[0]=std::make_unique<db_type>(5);set_cell(*db[0],0,seed);set_cell(*db[0],2,(seed+1)%12);set_cell(*db[0],4,seed);ids.clear();next_token=0;for(auto* data:access_store(*db[0],access_tag{}).element_blocks)id(data);log_entries->clear();}std::cout<<"[";record(db,"null",true);
for(int step=0;step<count;++step){char op;int dst;std::cin>>op>>dst;std::string result="null";events* before=db[dst]?&db[dst]->event_handler():nullptr;bool stable=true;
try{if(op=='D')db[dst]=std::make_unique<db_type>();else if(op=='Z'){int n;std::cin>>n;db[dst]=std::make_unique<db_type>(n);}else if(op=='F'||op=='R'){int n,type,length=-1;std::string text;std::cin>>n>>type>>text;if(op=='R')std::cin>>length;db[dst]=create(n,type,text,length);}else if(op=='H'||op=='h'){events h;std::cin>>h.tag;if(op=='H')db[dst]=std::make_unique<db_type>(h);else db[dst]=std::make_unique<db_type>(std::move(h));result=h.log?"true":"false";}
else if(op=='Q'||op=='L'||op=='M'||op=='A'||op=='V'||op=='W'){int other;std::cin>>other;if(op=='Q')db[dst]=std::make_unique<db_type>(*db[other]);else if(op=='L')db[dst]=std::make_unique<db_type>(db[other]->clone());else if(op=='M')db[dst]=std::make_unique<db_type>(std::move(*db[other]));else if(op=='A'){*db[dst]=*db[other];stable=before==&db[dst]->event_handler();}else if(op=='V'){*db[dst]=std::move(*db[other]);stable=before==&db[dst]->event_handler();}else{events* other_before=&db[other]->event_handler();db[dst]->swap(*db[other]);stable=before==&db[dst]->event_handler()&&other_before==&db[other]->event_handler();}}
else if(op=='C')db[dst]->clear();else if(op=='S')db[dst]->shrink_to_fit();else if(op=='U')db[dst].reset();else std::abort();}catch(const mdds::invalid_arg_error& e){result=std::string("\"")+e.what()+"\"";}
std::cout<<",";record(db,result,stable);}for(auto& owner:db)owner.reset();std::cout<<",[";for(size_t i=0;i<log_entries->size();++i){if(i)std::cout<<",";const auto& e=(*log_entries)[i];std::cout<<"["<<e.owner<<","<<e.token<<","<<e.type<<","<<e.size<<","<<(e.acquired?"true":"false")<<"]";}std::cout<<"]]\n";}}
`;
const source = `${target}/container.cpp`,
  binary = `${target}/container`;
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
    /** Serializes only actual native constructor/operator callers. @param c - Case. @returns Input. */ (
      c,
    ) =>
      `${c.seed} ${c.commands.length}\n${c.commands.map(/** Serializes one caller. @param op - Tokens. @returns Line. */ (op) => op.join(" ")).join("\n")}`,
  )
  .join("\n");
const raw = execFileSync(binary, {
  input,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  timeout: 30000,
});
writeFileSync(`${target}/container-output.jsonl`, raw);
const lines = raw
  .trim()
  .split("\n")
  .map(
    /** Parses full raw states and final valid destructor events. @param line - Output. @returns Sequence. */ (
      line,
    ) => JSON.parse(line),
  );
const snapshots = [],
  idsByState = new Map();
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target:
    "host clang++ libc++ ASan UBSan; unchanged real original SoA container, no_trace/default execution/nonthrowing event value semantics; caller-only private observation bridge; compound inputs prepared by original public set outside the reviewed ownership group",
  cases: cases.map(
    /** Retains every full state and final destructor log. @param c - Input. @param index - Output. @returns Portable case. */ (
      c,
      index,
    ) => ({
      ...c,
      states: lines[index].slice(0, -1).map(
        /** Losslessly interns complete owner/equality/live-payload/event state. @param state - Record. @returns Stable ID. */ (
          state,
        ) => {
          const key = JSON.stringify(state);
          let id = idsByState.get(key);
          if (id === undefined) {
            id = snapshots.length;
            idsByState.set(key, id);
            snapshots.push(state);
          }
          return id;
        },
      ),
      finalEvents: lines[index].at(-1),
    }),
  ),
  snapshots,
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original container fixture differs.");
console.log(
  `Original container: ${cases.length} complete sequences/${cases.reduce(/** Counts every observed public ownership call. @param n - Count. @param c - Sequence. @returns Count. */ (n, c) => n + c.commands.length, 0)} operations/${snapshots.length} lossless full live-state snapshots, all12 scalar families and final native destructor events.`,
);
