/** @fileoverview Exports every top-level default-package .res file from pinned ICU78.3 with raw aliases, nofallback/pool flags and shared immutable node/string/buffer storage. Native source APIs decode packed resources; this exporter never resolves locale/resource aliases or invents fallback data. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  path = resolve("apps/office/src/external/icu/source/data/in/icudt78l.resources.json");
writeFileSync(
  `${build}/locale-resources-export.cc`,
  String.raw`
#include "unicode/putil.h"
#include "uresdata.h"
#include "resource.h"
#include "ucmndata.h"
#include <fstream>
#include <iostream>
#include <iomanip>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <cstring>
using namespace icu;
void check(UErrorCode e){if(U_FAILURE(e)){std::cerr<<u_errorName(e)<<'\n';std::exit(2);}}
void quote(std::ostream&out,const std::u16string&s){out<<'"';for(unsigned c:s){if(c=='"'||c=='\\')out<<'\\'<<char(c);else if(c<32||c>=127)out<<"\\u"<<std::hex<<std::setfill('0')<<std::setw(4)<<c<<std::dec;else out<<char(c);}out<<'"';}
std::u16string wide(const char*s){std::u16string out;while(*s)out+=char16_t(uint8_t(*s++));return out;}
std::map<std::u16string,int> stringIDs;
std::vector<std::u16string> strings;
int stringID(const std::u16string&s){auto it=stringIDs.find(s);if(it!=stringIDs.end())return it->second;int id=int(strings.size());strings.push_back(s);stringIDs.emplace(s,id);return id;}
std::map<const void*,int> bufferIDs;
std::vector<std::string> buffers,nodes;
std::map<std::pair<const void*,Resource>,int> nodeIDs;
int node(ResourceData&data,Resource raw){auto identity=std::make_pair(static_cast<const void*>(data.pRoot),raw);auto found=nodeIDs.find(identity);if(found!=nodeIDs.end())return found->second;int id=int(nodes.size());nodeIDs.emplace(identity,id);nodes.emplace_back();ResourceDataValue value;value.setData(data);value.setResource(raw,ResourceTracer());UErrorCode e=U_ZERO_ERROR;auto type=value.getType();std::ostringstream out;out<<'['<<int(type)<<',';
if(type==URES_STRING||type==URES_ALIAS){int32_t n;auto*p=type==URES_STRING?value.getString(n,e):value.getAliasString(n,e);check(e);out<<stringID(std::u16string(p,n));}
else if(type==URES_INT){out<<value.getInt(e);check(e);}
else if(type==URES_BINARY||type==URES_INT_VECTOR){int32_t n;const uint8_t*b=nullptr;const int32_t*v=nullptr;const void*p;if(type==URES_BINARY){b=value.getBinary(n,e);p=b;}else{v=value.getIntVector(n,e);p=v;}check(e);auto it=bufferIDs.find(p);int index;if(it!=bufferIDs.end())index=it->second;else{index=int(buffers.size());bufferIDs.emplace(p,index);std::ostringstream buf;buf<<'[';for(int i=0;i<n;++i){if(i)buf<<',';buf<<(b?int(b[i]):v[i]);}buf<<']';buffers.push_back(buf.str());}out<<index;}
else if(type==URES_ARRAY){auto a=value.getArray(e);check(e);out<<'[';for(int i=0;i<a.getSize();++i){if(i)out<<',';a.getValue(i,value);out<<node(data,value.getResource());}out<<']';}
else if(type==URES_TABLE){auto t=value.getTable(e);check(e);std::vector<int>keys,children;for(int i=0;i<t.getSize();++i){const char*key=nullptr;t.getKeyAndValue(i,key,value);keys.push_back(stringID(wide(key)));children.push_back(node(data,value.getResource()));}out<<'[';for(size_t i=0;i<keys.size();++i){if(i)out<<',';out<<keys[i];}out<<"],[";for(size_t i=0;i<children.size();++i){if(i)out<<',';out<<children[i];}out<<']';}
else{std::cerr<<"Unexpected raw resource type "<<int(type)<<'\n';std::exit(3);}out<<']';nodes[id]=out.str();return id;}
int main(int argc,char**argv){if(argc!=3)return 1;u_setDataDirectory(argv[1]);std::ifstream f(argv[2],std::ios::binary);std::vector<char>bytes((std::istreambuf_iterator<char>(f)),{});auto*header=reinterpret_cast<const DataHeader*>(bytes.data());if(header->info.isBigEndian!=U_IS_BIG_ENDIAN||std::memcmp(header->info.dataFormat,"CmnD",4)!=0)return 4;auto*toc=reinterpret_cast<const UDataOffsetTOC*>(bytes.data()+udata_getHeaderSize(header));const char*base=reinterpret_cast<const char*>(toc);ResourceData pool{};UErrorCode e=U_ZERO_ERROR;res_load(&pool,nullptr,"pool",&e);check(e);std::vector<std::string>bundles;
for(uint32_t i=0;i<toc->count;++i){std::string name=base+toc->entry[i].nameOffset;auto slash=name.find('/');if(slash==std::string::npos)continue;name=name.substr(slash+1);if(name.find('/')!=std::string::npos||name.size()<4||name.substr(name.size()-4)!=".res")continue;name.resize(name.size()-4);ResourceData data{};e=U_ZERO_ERROR;res_load(&data,nullptr,name.c_str(),&e);check(e);if(data.usesPoolBundle){const int32_t*indexes=pool.pRoot+1;if(data.pRoot[1+URES_INDEX_POOL_CHECKSUM]!=indexes[URES_INDEX_POOL_CHECKSUM])return 5;data.poolBundleKeys=reinterpret_cast<const char*>(indexes+(indexes[URES_INDEX_LENGTH]&255));data.poolBundleStrings=pool.p16BitUnits;}int root=node(data,data.rootRes);std::ostringstream bundle;quote(bundle,wide(name.c_str()));bundle<<":["<<root<<','<<int(data.noFallback)<<','<<int(data.usesPoolBundle)<<','<<int(data.isPoolBundle)<<']';bundles.push_back(bundle.str());res_unload(&data);}
std::cout<<"{\"bundles\":{";for(size_t i=0;i<bundles.size();++i){if(i)std::cout<<',';std::cout<<bundles[i];}std::cout<<"},\"strings\":[";for(size_t i=0;i<strings.size();++i){if(i)std::cout<<',';quote(std::cout,strings[i]);}std::cout<<"],\"buffers\":[";for(size_t i=0;i<buffers.size();++i){if(i)std::cout<<',';std::cout<<buffers[i];}std::cout<<"],\"nodes\":[";for(size_t i=0;i<nodes.size();++i){if(i)std::cout<<',';std::cout<<nodes[i];}std::cout<<"]}\n";res_unload(&pool);}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/locale-resources-export.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/locale-resources-export`,
  ],
  { stdio: "inherit" },
);
const resources = JSON.parse(
  execFileSync(
    `${build}/locale-resources-export`,
    [`${source}/data/in`, `${source}/data/in/icudt78l.dat`],
    { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 },
  ),
);
const artifact = {
  source: {
    icuVersion: "78.3",
    dataSha256: createHash("sha256")
      .update(readFileSync(`${source}/data/in/icudt78l.dat`))
      .digest("hex"),
    scope:
      "Complete raw top-level default-package .res resources, original aliases retained, shared native storage projected as graph indexes",
  },
  ...resources,
};
// Preserve the actual compact graph rather than expanding shared native strings/resources into repeated trees.
const bytes = await format(JSON.stringify(artifact), {
  ...(await resolveConfig(path)),
  parser: "json",
});
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== bytes) throw Error(`Pinned raw package differs: ${path}`);
} else if (process.argv.includes("--measure")) {
  writeFileSync(`${build}/locale-resources-measured.json`, bytes);
} else writeFileSync(path, bytes);
console.log(
  JSON.stringify({
    bundles: Object.keys(resources.bundles).length,
    strings: resources.strings.length,
    buffers: resources.buffers.length,
    nodes: resources.nodes.length,
    bytes: Buffer.byteLength(bytes),
  }),
);
