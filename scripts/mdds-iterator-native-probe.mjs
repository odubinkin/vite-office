/** @fileoverview Optional original SoA iterator comparison over byte-verified unchanged native headers. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { digest, verifyMddsSources } from "./mdds-native-source.mjs";
const { pinned, target, reference, archiveHashes, sourceHashes } = verifyMddsSources();
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/soa/native-iterator-cases.json";
const layouts = [
  [],
  [-1],
  [10],
  Array(10).fill(-1),
  [0, 0, 10, 10, 11, 11, 11, -1, -1, 4],
  [10, 11, 4, 0, -1, 10, 11, 4, 0, -1],
  [-1, 10, -1, 4, -1, 11, -1, 0, -1],
];
const driver = String.raw`
#include <mdds/multi_type_vector/soa/main.hpp>
#include <iostream>
using db_type=mdds::mtv::soa::multi_type_vector<mdds::mtv::standard_element_blocks_traits>;
std::vector<mdds::mtv::base_element_block*> blocks;
template<class It> void state(const It& it,const It& first,const It& end,const db_type& db){auto p=it.get_pos();auto e=it.get_end();auto b=first.get_pos();const auto& n=it.get_node();int token=-1;if(n.data)token=std::distance(blocks.begin(),std::find(blocks.begin(),blocks.end(),n.data));bool at_end=it==end;std::cout<<"[["<<std::distance(b.position_iterator,p.position_iterator)<<","<<std::distance(b.size_iterator,p.size_iterator)<<","<<std::distance(b.element_block_iterator,p.element_block_iterator)<<"],["<<std::distance(b.position_iterator,e.position_iterator)<<","<<std::distance(b.size_iterator,e.size_iterator)<<","<<std::distance(b.element_block_iterator,e.element_block_iterator)<<"],["<<n.type<<","<<n.position<<","<<n.size<<","<<token<<"],";if(at_end)std::cout<<"null,null";else std::cout<<(n.__private_data.parent==&db?0:-1)<<","<<n.__private_data.block_index;std::cout<<","<<(at_end?"true":"false")<<"]";}
template<class It,class CIt>void run(It first,It end,const db_type& db){std::cout<<"{\"forward\":[";It it=first;bool comma=false;while(true){if(comma)std::cout<<",";comma=true;It cp(it);CIt ci(it);std::cout<<"[";state(it,first,end,db);std::cout<<",";state(cp,first,end,db);std::cout<<",";state(ci,CIt(first),CIt(end),db);std::cout<<","<<(it==cp?"true":"false")<<"]";if(it==end)break;++it;}std::cout<<"],\"backward\":[";comma=false;while(it!=first){--it;if(comma)std::cout<<",";comma=true;state(it,first,end,db);}std::cout<<"],\"pairs\":[";comma=false;int count=std::distance(first,end);for(int i=0;i<=count;++i)for(int j=0;j<=count;++j){It a=first,b=first;std::advance(a,i);std::advance(b,j);if(comma)std::cout<<",";comma=true;std::cout<<"["<<i<<","<<j<<","<<(a==b?"true":"false")<<","<<(a!=b?"true":"false")<<",";It assigned;assigned=a;assigned=assigned;state(assigned,first,end,db);std::cout<<",";a.swap(b);state(a,first,end,db);std::cout<<",";state(b,first,end,db);std::cout<<",";CIt ca(a),cb(b);ca.swap(cb);state(ca,CIt(first),CIt(end),db);std::cout<<",";state(cb,CIt(first),CIt(end),db);std::cout<<"]";}std::cout<<"]}";}
int main(){using node=mdds::detail::mtv::iterator_value_node<db_type,size_t>;typename node::private_data priv;node empty(nullptr,0);std::cout<<"["<<empty.type<<","<<empty.position<<","<<empty.size<<","<<(empty.data==nullptr?"true":"false")<<","<<(priv.parent==nullptr?"true":"false")<<","<<priv.block_index<<"]\n";db_type::iterator s1,s2;db_type::const_iterator c1,c2;std::cout<<"["<<(s1==s2?"true":"false")<<","<<(s1!=s2?"true":"false")<<","<<(c1==c2?"true":"false")<<","<<(c1!=c2?"true":"false")<<"]\n";int count;while(std::cin>>count){db_type db(count);for(int i=0;i<count;++i){int t;std::cin>>t;if(t==10)db.set(i,1.25);else if(t==11)db.set(i,std::string("S"));else if(t==4)db.set(i,uint16_t(1));else if(t==0)db.set(i,true);}blocks.clear();std::cout<<"{\"nodes\":[";bool comma=false;for(auto it=db.begin();it!=db.end();++it){blocks.push_back(it->data);if(comma)std::cout<<",";comma=true;std::cout<<"["<<it->type<<","<<it->position<<","<<it->size<<","<<(it->data?int(blocks.size())-1:-1)<<"]";}std::cout<<"],\"normal\":";run<db_type::iterator,db_type::const_iterator>(db.begin(),db.end(),db);std::cout<<",\"reverse\":";run<db_type::reverse_iterator,db_type::const_reverse_iterator>(db.rbegin(),db.rend(),db);std::cout<<",\"constant\":";run<db_type::const_iterator,db_type::const_iterator>(db.cbegin(),db.cend(),db);std::cout<<",\"constant_reverse\":";run<db_type::const_reverse_iterator,db_type::const_reverse_iterator>(db.crbegin(),db.crend(),db);std::cout<<",\"mutation\":";if(db.begin()==db.end())std::cout<<"null";else{auto it=db.begin();it->type=42;it->position=99;it->size=55;auto copy=it;db_type::const_iterator ci(it);std::cout<<"[";state(it,db.begin(),db.end(),db);std::cout<<",";state(copy,db.begin(),db.end(),db);std::cout<<",";state(ci,db.cbegin(),db.cend(),db);std::cout<<","<<(it==db.begin()?"true":"false")<<","<<(it!=db.begin()?"true":"false")<<"]";}std::cout<<"}\n";}}
`;
const driverPath = `${target}/iterator.cpp`,
  binary = `${target}/iterator`;
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
const commands = layouts
  .map(
    /** Serializes real native container setup. @param cells - Scalar types. @returns Input line. */ (
      cells,
    ) => `${cells.length} ${cells.join(" ")}`,
  )
  .join("\n");
const raw = execFileSync(binary, {
  input: commands,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
  timeout: 30000,
});
writeFileSync(`${target}/iterator-output.jsonl`, raw);
const lines = raw
  .trim()
  .split("\n")
  .map(
    /** Retains the complete raw native record. @param line - JSON. @returns Record. */ (line) =>
      JSON.parse(line),
  );
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target:
    "host clang++ libc++ ASan UBSan; real original SoA container and iterator owners; end private fields deliberately omitted",
  defaults: lines[0],
  singular: lines[1],
  layouts: layouts.map(
    /** Pairs complete genuine observations. @param cells - Setup. @param index - Layout. @returns Full record. */ (
      cells,
      index,
    ) => ({ cells, ...lines[index + 2] }),
  ),
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original iterator fixture differs.");
console.log(
  `Original iterators: ${layouts.length} real layouts; complete mutable/const forward/reverse traversal, copy, assignment, swap, equality and cached mutation/conversion states.`,
);
