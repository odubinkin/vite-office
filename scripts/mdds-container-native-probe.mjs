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
const maxRow = "18446744073709551615";
for (let type = 0; type < 12; ++type) {
  for (const n of [0, 1, 2, 5, 17]) {
    const commands = [["F", 0, n, type, "2"]];
    for (const row of [...new Set([0, Math.max(0, n - 1), n, n + 1, maxRow])]) {
      for (const op of ["T", "E", "P", "p"]) commands.push([op, 0, row]);
      for (const op of ["G", "g"]) commands.push([op, 0, row, type]);
      if (n || row === 0) for (const op of ["I", "i"]) commands.push([op, 0, row, 0, 0]);
    }
    commands.push(["M", 1, 0], ["G", 0, 0, type], ["P", 0, n], ["U", 0], ["U", 1]);
    cases.push({ seed: -1, commands });
  }
  const commands = [
    ["Q", 1, 0],
    ["F", 2, 2, type, "2"],
  ];
  for (const row of [0, 1, 2, 3, 4, 5, 6, maxRow]) {
    for (const op of ["T", "E", "P", "p"]) commands.push([op, 0, row]);
    for (const hint of [0, 1])
      for (const index of [0, 1, 2, 3, 4])
        for (const op of ["I", "i"]) commands.push([op, 0, row, hint, index]);
    if (row === 1 || row === 3)
      for (let requested = 0; requested < 12; ++requested)
        for (const op of ["G", "g"]) commands.push([op, 0, row, requested]);
    else
      for (const op of ["G", "g"]) commands.push([op, 0, row, row === 2 ? (type + 1) % 12 : type]);
  }
  commands.push(["J", 0, 0, 4], ["j", 1, 0, 4], ["W", 0, 2]);
  for (const row of [0, 1, 2, 3, maxRow]) commands.push(["K", 0, row, 0], ["k", 0, row, 1]);
  commands.push(
    ["W", 0, 2],
    ["K", 0, 2, 0],
    ["k", 0, 0, 1],
    ["N", 0],
    ["N", 1],
    ["U", 0],
    ["U", 1],
    ["U", 2],
  );
  cases.push({ seed: type, commands });
}
const longHints = [["Q", 1, 0]];
for (const row of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, maxRow]) {
  for (const op of ["T", "E", "P", "p"]) longHints.push([op, 0, row]);
  for (const owner of [0, 1])
    for (const index of [0, 1, 2, 3, 4, 5, 6, 7, 8])
      for (const op of ["I", "i"]) longHints.push([op, 0, row, owner, index]);
  for (const op of ["G", "g"])
    longHints.push([op, 0, row, typeof row === "number" && row % 4 === 2 ? 1 : 0]);
}
longHints.push(["U", 0], ["U", 1]);
cases.push({ seed: 12, commands: longHints });
// Append actual static position API callers after every unchanged ownership/query case.
for (let type = 0; type < 12; ++type) {
  for (const n of [1, 2, 5, 17]) {
    const commands = [["F", 0, n, type, "2"]];
    for (let row = 0; row < n; ++row) {
      for (const op of ["B", "b", "l", "X"])
        commands.push([op, 0, row, ...(op === "X" ? [type] : [])]);
      for (const steps of [...new Set([0, -row, Math.max(-row, -1), 1, n - row - 1, n - row])])
        for (const op of ["O", "o"]) commands.push([op, 0, row, steps]);
    }
    commands.push(["U", 0]);
    cases.push({ seed: -1, commands });
  }
  const commands = [["Q", 1, 0]];
  for (let row = 0; row < 9; ++row) {
    for (const op of ["B", "b", "l"]) commands.push([op, 0, row]);
    if ([0, 3, 7].includes(row)) commands.push(["X", 0, row, row === 3 ? (type + 1) % 12 : type]);
    for (let steps = -row; steps <= 9 - row; ++steps)
      for (const op of ["O", "o"]) commands.push([op, 0, row, steps]);
  }
  commands.push(["U", 0], ["U", 1]);
  cases.push({ seed: 24 + type, commands });
}
// Original public resize and empty-push calls with complete existing owner observation.
for (let type = 0; type < 12; ++type) {
  for (const n of [0, 1, 2, 5, 17]) {
    const commands = [
      ["F", 0, n, type, "2"],
      ["Q", 1, 0],
      ["Y", 0, n],
      ["y", 0],
      ["Y", 0, n],
      ["Y", 0, n + 5],
      ["Y", 0, n + 2],
      ["Y", 0, Math.floor(n / 2)],
      ["y", 0],
      ["Y", 0, 0],
      ["y", 0],
      ["Y", 0, 6],
      ["Y", 0, 2],
      ["M", 2, 1],
      ["Y", 1, n],
    ];
    if (n > 1) commands.push(["Y", 1, n - 1]);
    commands.push(
      ["Y", 1, 0],
      ["Y", 1, 3],
      ["y", 1],
      ["W", 0, 2],
      ["Y", 0, n + 3],
      ["Y", 2, 0],
      ["U", 0],
      ["U", 1],
      ["U", 2],
    );
    cases.push({ seed: -1, commands });
  }
  for (let targetSize = 0; targetSize <= 13; ++targetSize) {
    const commands = [
      ["Q", 1, 0],
      ["Y", 0, targetSize],
    ];
    for (let row = 0; row < targetSize; ++row) {
      const category = row >= 4 && row <= 6 ? (type + 1) % 12 : type;
      commands.push(
        ["T", 0, row],
        ["E", 0, row],
        ["G", 0, row, category],
        ["P", 0, row],
        ["p", 0, row],
      );
    }
    commands.push(
      ["P", 0, targetSize],
      ["p", 0, targetSize],
      ["y", 0],
      ["y", 0],
      ["S", 0],
      ["Y", 0, 1],
      ["Y", 0, 0],
      ["U", 0],
      ["U", 1],
    );
    cases.push({ seed: 36 + type, commands });
  }
}
for (let type = 0; type < 12; ++type) {
  for (const n of [0, 1, 2, 5, 17]) {
    const commands = [
      ["F", 0, n, type, "2"],
      ["Q", 1, 0],
    ];
    for (let i = 0; i < 19; ++i) commands.push(["a", 0, type, String(i % 4)]);
    commands.push(["S", 0], ["a", 0, type, "7"], ["y", 0], ["a", 0, type, "3"]);
    for (let other = 0; other < 12; ++other)
      commands.push(["a", 0, other, "2"], ["a", 0, other, "0"]);
    commands.push(
      ["M", 2, 0],
      ["C", 0],
      ["a", 0, type, "1"],
      ["W", 0, 2],
      ["a", 0, type, "4"],
      ["U", 0],
      ["U", 1],
      ["U", 2],
    );
    cases.push({ seed: -1, commands });
  }
  cases.push({
    seed: 36 + type,
    commands: [
      ["Q", 1, 0],
      ["a", 0, type, "3"],
      ["a", 0, (type + 1) % 12, "4"],
      ["y", 0],
      ["a", 0, type, "5"],
      ["U", 0],
      ["U", 1],
    ],
  });
  cases.push({
    seed: -1,
    commands: [
      ["F", 0, 1, type, "2"],
      ["Q", 1, 0],
      ["c", 0, 0, (type + 1) % 12, "3"],
      ["c", 0, 0, type, "4"],
      ["a", 0, type, "5"],
      ["U", 0],
      ["U", 1],
    ],
  });
}
for (const n of [0, 2])
  cases.push({
    seed: -1,
    commands: [
      ["Z", 0, n],
      ["f", 0],
      ["C", 0],
      ["a", 0, 0, "1"],
      ["U", 0],
    ],
  });
for (let type = 0; type < 12; ++type) {
  for (const [seed, n] of [
    [36 + type, 11],
    [48 + type, 13],
    [60 + type, 13],
    [72 + type, 13],
  ])
    for (let start = 0; start < n; ++start)
      for (let end = start; end < n; ++end)
        cases.push({
          seed,
          commands: [
            ["Q", 1, 0],
            ["e", 0, start, end],
            ["a", 0, type, "3"],
            ["y", 0],
            ["U", 0],
            ["U", 1],
          ],
        });
  for (const n of [0, 1, 2, 5, 17]) {
    const ranges = n
      ? [
          ...new Set(
            [
              [0, 0],
              [n - 1, n - 1],
              [0, n - 1],
              [Math.floor(n / 2), Math.floor(n / 2)],
            ].map(
              /** Retains distinct actual homogeneous erase callers. @param range - Rows. @returns Key. */ (
                range,
              ) => range.join(","),
            ),
          ),
        ].map(
          /** Decodes caller rows. @param key - Key. @returns Rows. */ (key) =>
            key.split(",").map(Number),
        )
      : [[0, 0]];
    for (const [start, end] of ranges)
      for (const op of ["F", "Z"])
        cases.push({
          seed: -1,
          commands: [
            op === "F" ? [op, 0, n, type, "2"] : [op, 0, n],
            ["Q", 1, 0],
            ["e", 0, start, end],
            ["a", 0, type, "3"],
            ["y", 0],
            ["U", 0],
            ["U", 1],
          ],
        });
    cases.push({
      seed: -1,
      commands: [
        ["F", 0, n, type, "2"],
        ["e", 0, 1, 0],
        ["e", 0, n, n],
        ["e", 0, 0, n],
        ["e", 0, maxRow, maxRow],
        ["e", 0, 0, maxRow],
        ["M", 1, 0],
        ["e", 0, 0, 0],
        ["C", 0],
        ["U", 0],
        ["U", 1],
      ],
    });
  }
  for (const [start, end] of [
    [0, 0],
    [1, 1],
    [5, 15],
    [8, 33],
    [40, 40],
    [0, 40],
  ])
    cases.push({
      seed: 84 + type,
      commands: [
        ["Q", 1, 0],
        ["e", 0, start, end],
        ["a", 0, type, "3"],
        ["y", 0],
        ["U", 0],
        ["U", 1],
      ],
    });
}
for (let type = 0; type < 12; ++type)
  for (const seed of [96 + type, 108 + type])
    for (let start = 0; start < 13; ++start)
      for (let end = start; end < 13; ++end)
        cases.push({
          seed,
          commands: [
            ["Q", 1, 0],
            ["e", 0, start, end],
            ["a", 0, type, "3"],
            ["y", 0],
            ["U", 0],
            ["U", 1],
          ],
        });
// Original whole-container release callers; earlier complete cases retain their order.
for (let type = 0; type < 12; ++type) {
  for (const n of [0, 1, 2, 5, 17])
    for (const filled of [false, true])
      cases.push({
        seed: -1,
        commands: [
          filled ? ["F", 0, n, type, "2"] : ["Z", 0, n],
          ["Q", 1, 0],
          ["L", 2, 0],
          ["r", 0],
          ["r", 0],
          ["a", 0, type, "3"],
          ["y", 0],
          ["r", 0],
          ["M", 0, 1],
          ["r", 1],
          ["r", 0],
          ["Y", 1, 3],
          ["a", 1, type, "4"],
          ["r", 1],
          ["W", 0, 2],
          ["r", 0],
          ["r", 2],
          ["U", 0],
          ["U", 1],
          ["U", 2],
        ],
      });
  for (const base of [0, 12, 24, 36, 48, 60, 72, 84, 96, 108])
    cases.push({
      seed: base + type,
      commands: [
        ["Q", 1, 0],
        ["L", 2, 0],
        ["r", 0],
        ["r", 0],
        ["a", 0, type, "3"],
        ["y", 0],
        ["r", 0],
        ["e", 1, 1, 2],
        ["a", 1, type, "3"],
        ["r", 1],
        ["Y", 2, 3],
        ["r", 2],
        ["Y", 2, 5],
        ["r", 2],
        ["U", 0],
        ["U", 1],
        ["U", 2],
      ],
    });
}
const driver =
  String.raw`
#include <mdds/multi_type_vector/soa/main.hpp>
#include <iostream>
#include <iomanip>
#include <memory>
#include <map>
#include <type_traits>
#include <sstream>
#include <optional>
using namespace mdds::mtv;
std::map<const base_element_block*,int> ids;int next_token=0;
bool trace_enabled=false;std::vector<std::vector<long long>> operation_calls;
void trace_call(int op,const base_element_block& data,std::initializer_list<long long> args={}){if(!trace_enabled)return;std::vector<long long> call{op,get_block_type(data),static_cast<long long>(standard_element_blocks_traits::block_funcs::size(data))};call.insert(call.end(),args.begin(),args.end());operation_calls.push_back(call);}
struct observed_funcs:standard_element_blocks_traits::block_funcs{
static void overwrite_values(base_element_block& data,size_t pos,size_t len){trace_call(0,data,{static_cast<long long>(pos),static_cast<long long>(len)});standard_element_blocks_traits::block_funcs::overwrite_values(data,pos,len);}
static void resize_block(base_element_block& data,size_t size){trace_call(1,data,{static_cast<long long>(size)});standard_element_blocks_traits::block_funcs::resize_block(data,size);}
static void delete_block(const base_element_block* data){trace_call(3,*data);standard_element_blocks_traits::block_funcs::delete_block(data);}
static void erase(base_element_block& data,size_t pos){trace_call(5,data,{static_cast<long long>(pos)});standard_element_blocks_traits::block_funcs::erase(data,pos);}
static void erase(base_element_block& data,size_t pos,size_t len){trace_call(5,data,{static_cast<long long>(pos),static_cast<long long>(len)});standard_element_blocks_traits::block_funcs::erase(data,pos,len);}
static void append_block(base_element_block& dest,const base_element_block& src){trace_call(6,dest,{get_block_type(src),static_cast<long long>(standard_element_blocks_traits::block_funcs::size(src))});standard_element_blocks_traits::block_funcs::append_block(dest,src);}

};
struct event_entry{int owner,token,type;size_t size;bool acquired;};
std::shared_ptr<std::vector<event_entry>> log_entries;
int id(const base_element_block* p){if(!p)return -1;auto it=ids.find(p);if(it==ids.end())it=ids.emplace(p,next_token++).first;return it->second;}
struct events{static inline int next=1;int tag=next++;std::shared_ptr<std::vector<event_entry>> log=log_entries;
void element_block_acquired(const base_element_block* p){trace_call(4,*p);if(log)log->push_back({tag,id(p),get_block_type(*p),standard_element_blocks_traits::block_funcs::size(*p),true});}
void element_block_released(const base_element_block* p){trace_call(2,*p);if(log)log->push_back({tag,id(p),get_block_type(*p),standard_element_blocks_traits::block_funcs::size(*p),false});ids.erase(p);}
};
struct traits:standard_element_blocks_traits{using event_func=events;using block_funcs=observed_funcs;};
using db_type=soa::multi_type_vector<traits>;
struct access_tag{};auto& access_store(db_type&,access_tag);
template<auto Member>struct member_access{friend auto& access_store(db_type& db,access_tag){return db.*Member;}};
template struct member_access<&db_type::m_block_store>;
struct failure_cell{};
element_t mdds_mtv_get_element_type(const failure_cell&){return element_type_boolean;}
base_element_block* mdds_mtv_create_new_block(size_t,const failure_cell&){return nullptr;}
void mdds_mtv_append_value(base_element_block& b,failure_cell&&){boolean_element_block::append_value(b,true);}
template<class T>struct cell_tag{};
` +
  kinds
    .map(
      /** Declares only native private-helper caller overloads. @param kind - Original family. @returns Declaration. */ (
        kind,
      ) =>
        `void replace_cell(db_type&,size_t,typename ${kind}_element_block::value_type&&,cell_tag<typename ${kind}_element_block::value_type>);`,
    )
    .join("\n") +
  String.raw`
template<class T,auto Member>struct cell_access{friend void replace_cell(db_type& db,size_t index,T&& cell,cell_tag<T>){(db.*Member)(index,std::move(cell));}};
` +
  kinds
    .map(
      /** Instantiates the unchanged original helper through a caller-only bridge. @param kind - Original family. @returns Member witness. */ (
        kind,
      ) =>
        `template struct cell_access<typename ${kind}_element_block::value_type,&db_type::template create_new_block_with_new_cell<typename ${kind}_element_block::value_type>>;`,
    )
    .join("\n") +
  String.raw`

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
db_type::iterator append_scalar(db_type& db,int type,const std::string& text){switch(type){
` +
  kinds
    .map(
      /** Emits only actual public scalar append calls. @param kind - Family. @param type - ID. @returns Caller. */ (
        kind,
        type,
      ) =>
        `case ${type}:return db.push_back(value<typename ${kind}_element_block::value_type>(text));`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
void replace_scalar(db_type& db,size_t index,int type,const std::string& text){switch(type){
` +
  kinds
    .map(
      /** Emits only actual original private new-cell calls. @param kind - Family. @param type - ID. @returns Caller. */ (
        kind,
        type,
      ) =>
        `case ${type}:replace_cell(db,index,value<typename ${kind}_element_block::value_type>(text),cell_tag<typename ${kind}_element_block::value_type>{});return;`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
std::string calls_json(){std::ostringstream os;os<<"[";for(size_t i=0;i<operation_calls.size();++i){if(i)os<<",";os<<"[";for(size_t j=0;j<operation_calls[i].size();++j){if(j)os<<",";os<<operation_calls[i][j];}os<<"]";}os<<"]";return os.str();}
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
template<class F>std::string capture(F emit){std::ostringstream stream;auto* old=std::cout.rdbuf(stream.rdbuf());emit();std::cout.rdbuf(old);return stream.str();}
template<class T>std::string scalar(db_type& db,size_t row,bool output){T v{};if(output)db.get(row,v);else v=db.get<T>(row);return capture([&]{print(v);});}
std::string scalar(db_type& db,size_t row,int type,bool output){switch(type){
` +
  kinds
    .map(
      /** Emits only actual original typed read calls. @param kind - Alias. @param type - Discriminator. @returns Native caller. */
      (kind, type) =>
        `case ${type}:return scalar<typename ${kind}_element_block::value_type>(db,row,output);`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
std::string positioned_scalar(const db_type& db,size_t row,int type){auto p=db.position(row);switch(type){
` +
  kinds
    .map(
      /** Calls unchanged native static get with its explicit block template. @param kind - Alias. @param type - Discriminator. @returns Native caller. */
      (kind, type) =>
        `case ${type}:{auto v=db_type::get<${kind}_element_block>(p);return capture([&]{print(v);});}`,
    )
    .join("\n") +
  String.raw`
}std::abort();}
template<class It>void node(const It& it,const It& end,const db_type& db){const auto& n=it.get_node();const bool at_end=it==end;std::cout<<"["<<n.type<<","<<n.position<<","<<n.size<<","<<id(n.data)<<",";if(at_end)std::cout<<"null,null";else std::cout<<(n.__private_data.parent==&db?"true":"false")<<","<<n.__private_data.block_index;std::cout<<"]";}
template<class It>void hint_node(const It& hint,const db_type& db,bool at_end=false){const auto& n=hint.get_node();std::cout<<"["<<n.type<<","<<n.position<<","<<n.size<<","<<id(n.data)<<",";if(at_end)std::cout<<"null,null";else std::cout<<(n.__private_data.parent==&db?"true":"false")<<","<<n.__private_data.block_index;std::cout<<"]";}
template<class Pair,class It>std::string position_json(const Pair& p,const It& end,const db_type& db,const It* hint=nullptr,bool hint_at_end=false){return capture([&]{std::cout<<"[";node(p.first,end,db);std::cout<<","<<p.second;if(hint){std::cout<<",";hint_node(*hint,db,hint_at_end);}std::cout<<"]";});}
void state(db_type& db){const auto& s=access_store(db,access_tag{});std::cout<<"["<<db.size()<<","<<db.block_size()<<","<<(db.empty()?"true":"false")<<",["<<db.event_handler().tag<<","<<(db.event_handler().log?"true":"false")<<"],[[";for(size_t i=0;i<s.positions.size();++i){if(i)std::cout<<",";std::cout<<s.positions[i];}std::cout<<"],[";for(size_t i=0;i<s.sizes.size();++i){if(i)std::cout<<",";std::cout<<s.sizes[i];}std::cout<<"],[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";std::cout<<id(s.element_blocks[i]);}std::cout<<"],["<<s.positions.capacity()<<","<<s.sizes.capacity()<<","<<s.element_blocks.capacity()<<"]],[";for(size_t i=0;i<s.element_blocks.size();++i){if(i)std::cout<<",";if(s.element_blocks[i])payload(*s.element_blocks[i]);else std::cout<<"null";}std::cout<<"],[";node(db.begin(),db.end(),db);std::cout<<",";node(db.end(),db.end(),db);std::cout<<",";node(db.cbegin(),db.cend(),db);std::cout<<",";node(db.cend(),db.cend(),db);std::cout<<",";node(db.rbegin(),db.rend(),db);std::cout<<",";node(db.rend(),db.rend(),db);std::cout<<",";node(db.crbegin(),db.crend(),db);std::cout<<",";node(db.crend(),db.crend(),db);std::cout<<"]]";}
void record(std::unique_ptr<db_type>* db,const std::string& result,bool stable){std::cout<<"["<<result<<","<<(stable?"true":"false")<<",[";for(int i=0;i<3;++i){if(i)std::cout<<",";if(db[i])state(*db[i]);else std::cout<<"null";}std::cout<<"],[";bool comma=false;for(int i=0;i<3;++i)for(int j=0;j<3;++j){if(comma)std::cout<<",";comma=true;if(db[i]&&db[j])std::cout<<"["<<(*db[i]==*db[j]?"true":"false")<<","<<(*db[i]!=*db[j]?"true":"false")<<"]";else std::cout<<"null";}std::cout<<"],[";for(size_t i=0;i<log_entries->size();++i){if(i)std::cout<<",";const auto& e=(*log_entries)[i];std::cout<<"["<<e.owner<<","<<e.token<<","<<e.type<<","<<e.size<<","<<(e.acquired?"true":"false")<<"]";}std::cout<<"]]";}
int main(){std::cout<<std::setprecision(17);int seed,count;while(std::cin>>seed>>count){ids.clear();next_token=0;events::next=1;log_entries=std::make_shared<std::vector<event_entry>>();std::unique_ptr<db_type> db[3];std::optional<db_type::iterator> hints[3];std::optional<db_type::const_iterator> const_hints[3];if(seed>=0){int kind=seed%12,count=seed<12?5:seed<36?9:seed<48?11:seed<84?13:seed<96?41:13;db[0]=std::make_unique<db_type>(count);if(seed<24){for(int row=0;row<count;row+=2)set_cell(*db[0],row,((row/2)%2?kind+1:kind)%12);}else if(seed<36){set_cell(*db[0],0,kind);set_cell(*db[0],3,(kind+1)%12);set_cell(*db[0],7,kind);}else if(seed<48){set_cell(*db[0],0,kind);for(int row=4;row<=6;++row)set_cell(*db[0],row,(kind+1)%12);set_cell(*db[0],9,kind);set_cell(*db[0],10,kind);}else if(seed<60){for(int row=0;row<3;++row)set_cell(*db[0],row,kind);for(int row=6;row<9;++row)set_cell(*db[0],row,kind);for(int row=11;row<13;++row)set_cell(*db[0],row,(kind+1)%12);}else if(seed<72){for(int row=2;row<5;++row)set_cell(*db[0],row,kind);for(int row=8;row<11;++row)set_cell(*db[0],row,(kind+1)%12);}else if(seed<84){for(int row=0;row<3;++row)set_cell(*db[0],row,kind);for(int row=6;row<9;++row)set_cell(*db[0],row,(kind+1)%12);for(int row=11;row<13;++row)set_cell(*db[0],row,kind);}else if(seed<96){for(int row=0;row<count;row+=2)set_cell(*db[0],row,((row/2)%2?kind+1:kind)%12);}else if(seed<108){for(int row=0;row<3;++row)set_cell(*db[0],row,kind);for(int row=3;row<6;++row)set_cell(*db[0],row,(kind+1)%12);for(int row=9;row<13;++row)set_cell(*db[0],row,kind);}else{for(int row=3;row<6;++row)set_cell(*db[0],row,kind);for(int row=6;row<9;++row)set_cell(*db[0],row,(kind+1)%12);}ids.clear();next_token=0;for(auto* data:access_store(*db[0],access_tag{}).element_blocks)id(data);log_entries->clear();}std::cout<<"[";record(db,"null",true);
for(int step=0;step<count;++step){char op;int dst;std::cin>>op>>dst;std::string result="null";events* before=db[dst]?&db[dst]->event_handler():nullptr;bool stable=true;
try{if(op=='D')db[dst]=std::make_unique<db_type>();else if(op=='Z'){int n;std::cin>>n;db[dst]=std::make_unique<db_type>(n);}else if(op=='F'||op=='R'){int n,type,length=-1;std::string text;std::cin>>n>>type>>text;if(op=='R')std::cin>>length;db[dst]=create(n,type,text,length);}else if(op=='H'||op=='h'){events h;std::cin>>h.tag;if(op=='H')db[dst]=std::make_unique<db_type>(h);else db[dst]=std::make_unique<db_type>(std::move(h));result=h.log?"true":"false";}
else if(op=='Q'||op=='L'||op=='M'||op=='A'||op=='V'||op=='W'){int other;std::cin>>other;if(op=='Q')db[dst]=std::make_unique<db_type>(*db[other]);else if(op=='L')db[dst]=std::make_unique<db_type>(db[other]->clone());else if(op=='M')db[dst]=std::make_unique<db_type>(std::move(*db[other]));else if(op=='A'){*db[dst]=*db[other];stable=before==&db[dst]->event_handler();}else if(op=='V'){*db[dst]=std::move(*db[other]);stable=before==&db[dst]->event_handler();}else{events* other_before=&db[other]->event_handler();db[dst]->swap(*db[other]);stable=before==&db[dst]->event_handler()&&other_before==&db[other]->event_handler();}}
else if(op=='T'||op=='E'||op=='G'||op=='g'||op=='P'||op=='p'||op=='I'||op=='i'||op=='K'||op=='k'){size_t row;std::cin>>row;if(op=='T')result=std::to_string(db[dst]->get_type(row));else if(op=='E')result=db[dst]->is_empty(row)?"true":"false";else if(op=='G'||op=='g'){int type;std::cin>>type;result=scalar(*db[dst],row,type,op=='g');}else if(op=='P')result=position_json(db[dst]->position(row),db[dst]->end(),*db[dst]);else if(op=='p'){const auto& owner=*db[dst];result=position_json(owner.position(row),owner.end(),owner);}else if(op=='I'||op=='i'){int other,index;std::cin>>other>>index;if(op=='I'){auto hint=db[other]->begin();std::advance(hint,index);auto pos=db[dst]->position(hint,row);result=position_json(pos,db[dst]->end(),*db[dst],&hint,index==int(db[other]->block_size()));}else{const auto& owner=*db[dst];const auto& source=*db[other];auto hint=source.begin();std::advance(hint,index);auto pos=owner.position(hint,row);result=position_json(pos,owner.end(),owner,&hint,index==int(source.block_size()));}}else {int slot;std::cin>>slot;if(op=='K'){auto& hint=*hints[slot];result=position_json(db[dst]->position(hint,row),db[dst]->end(),*db[dst],&hint);}else {const auto& owner=*db[dst];auto& hint=*const_hints[slot];result=position_json(owner.position(hint,row),owner.end(),owner,&hint);}}}
else if(op=='B'||op=='b'||op=='O'||op=='o'||op=='l'||op=='X'){size_t row;std::cin>>row;if(op=='l'){const auto& owner=*db[dst];result=std::to_string(db_type::logical_position(owner.position(row)));}else if(op=='X'){int type;std::cin>>type;result=positioned_scalar(*db[dst],row,type);}else {int steps=0;if(op=='O'||op=='o')std::cin>>steps;if(op=='B'||op=='O'){auto p=db[dst]->position(row);auto ret=op=='B'?db_type::next_position(p):db_type::advance_position(p,steps);result="["+position_json(ret,db[dst]->end(),*db[dst])+","+position_json(p,db[dst]->end(),*db[dst])+"]";}else {const auto& owner=*db[dst];auto p=owner.position(row);auto ret=op=='b'?db_type::next_position(p):db_type::advance_position(p,steps);result="["+position_json(ret,owner.end(),owner)+","+position_json(p,owner.end(),owner)+"]";}}}
else if(op=='Y'){size_t size;std::cin>>size;operation_calls.clear();trace_enabled=true;db[dst]->resize(size);trace_enabled=false;result=capture([&]{std::cout<<"[";for(size_t i=0;i<operation_calls.size();++i){if(i)std::cout<<",";std::cout<<"[";for(size_t j=0;j<operation_calls[i].size();++j){if(j)std::cout<<",";std::cout<<operation_calls[i][j];}std::cout<<"]";}std::cout<<"]";});}
else if(op=='r'){operation_calls.clear();trace_enabled=true;db[dst]->release();trace_enabled=false;result=calls_json();}
else if(op=='e'){size_t start,end;std::cin>>start>>end;operation_calls.clear();trace_enabled=true;db[dst]->erase(start,end);trace_enabled=false;result=calls_json();}
else if(op=='a'){int type;std::string text;std::cin>>type>>text;operation_calls.clear();trace_enabled=true;auto it=append_scalar(*db[dst],type,text);trace_enabled=false;result=capture([&]{std::cout<<"[";node(it,db[dst]->end(),*db[dst]);std::cout<<","<<calls_json()<<"]";});}
else if(op=='c'){size_t index;int type;std::string text;std::cin>>index>>type>>text;operation_calls.clear();trace_enabled=true;replace_scalar(*db[dst],index,type,text);trace_enabled=false;result=calls_json();}
else if(op=='f'){db[dst]->push_back(failure_cell{});}
else if(op=='y'){auto it=db[dst]->push_back_empty();result=capture([&]{node(it,db[dst]->end(),*db[dst]);});}
else if(op=='J'||op=='j'){int other,index;std::cin>>other>>index;if(op=='J'){hints[dst]=db[other]->begin();std::advance(*hints[dst],index);result=capture([&]{hint_node(*hints[dst],*db[other]);});}else{const auto& owner=*db[other];const_hints[dst]=owner.begin();std::advance(*const_hints[dst],index);result=capture([&]{hint_node(*const_hints[dst],owner);});}}
else if(op=='N'){hints[dst].reset();const_hints[dst].reset();}
else if(op=='C')db[dst]->clear();else if(op=='S')db[dst]->shrink_to_fit();else if(op=='U')db[dst].reset();else std::abort();}catch(const std::exception& e){trace_enabled=false;result=std::string("\"")+e.what()+"\"";}
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
  maxBuffer: 256 * 1024 * 1024,
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
  idsByState = new Map(),
  ownerSnapshots = [],
  idsByOwner = new Map();
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target:
    "host clang++ libc++ ASan UBSan; unchanged real original SoA container, no_trace/default execution/nonthrowing event value semantics; caller-only private observation bridge and forwarding original standard block-func operation observer; compound inputs prepared by original public set outside the reviewed ownership group",
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
            snapshots.push([
              state[0],
              state[1],
              state[2].map(
                /** Losslessly interns the full unchanged native owner, including every payload/metadata/endpoint field. @param owner - Complete owner or absent slot. @returns Stable full-owner ID or null. */ (
                  owner,
                ) => {
                  if (owner === null) return null;
                  const ownerKey = JSON.stringify(owner);
                  let ownerId = idsByOwner.get(ownerKey);
                  if (ownerId === undefined) {
                    ownerId = ownerSnapshots.length;
                    idsByOwner.set(ownerKey, ownerId);
                    ownerSnapshots.push(owner);
                  }
                  return ownerId;
                },
              ),
              state[3],
              state[4],
            ]);
          }
          return id;
        },
      ),
      finalEvents: lines[index].at(-1),
    }),
  ),
  snapshots,
  ownerSnapshots,
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original container fixture differs.");
console.log(
  `Original container: ${cases.length} complete sequences/${cases.reduce(/** Counts every observed public ownership call. @param n - Count. @param c - Sequence. @returns Count. */ (n, c) => n + c.commands.length, 0)} operations/${snapshots.length} lossless full live-state snapshots, all12 scalar families and final native destructor events.`,
);
