/** @fileoverview Native ICU78.3 binary trie construction/loading witness against actual ported loader and scalar lookup. No header/provider stubs; original ICU common library builds the data and supplies observations. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  ucptrie_openFromBinary,
  ucptrie_get,
} from "../apps/office/src/external/icu/source/common/ucptrie.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/ucptrie-binary`;
const cpp = String.raw`
#include "unicode/umutablecptrie.h"
#include "unicode/ucptrie.h"
#include <fstream>
#include <iostream>
#include <vector>
#include <cstring>
using namespace std;
int main(int argc,char**argv){
 if(argc!=2)return 2;
 for(int type=0;type<2;++type)for(int width=0;width<3;++width){
  UErrorCode status=U_ZERO_ERROR;
  auto*m=umutablecptrie_open(7,239,&status);
  umutablecptrie_setRange(m,0,127,3,&status);
  umutablecptrie_setRange(m,128,0x7ff,19,&status);
  umutablecptrie_setRange(m,0xd800,0xdfff,71,&status);
  umutablecptrie_setRange(m,0x1f600,0x1f64f,187,&status);
  umutablecptrie_setRange(m,0x10fe00,0x10ffff,251,&status);
  if(width==1)umutablecptrie_setRange(m,0x10000,0x1007f,0xfedcba98,&status);
  else if(width==0)umutablecptrie_setRange(m,0x10000,0x1007f,0xba98,&status);
  auto*t=umutablecptrie_buildImmutable(m,UCPTrieType(type),UCPTrieValueWidth(width),&status);
  umutablecptrie_close(m);
  if(U_FAILURE(status))return 3;
  int n=ucptrie_toBinary(t,nullptr,0,&status);status=U_ZERO_ERROR;
  vector<uint32_t> bytes((n+3)/4);
  ucptrie_toBinary(t,bytes.data(),n,&status);
  if(U_FAILURE(status))return 4;
  string name=string(argv[1])+"-"+to_string(type)+"-"+to_string(width)+".bin";
  ofstream(name,ios::binary).write(reinterpret_cast<char*>(bytes.data()),n);
  int actual=777;auto*loaded=ucptrie_openFromBinary(UCPTRIE_TYPE_ANY,UCPTRIE_VALUE_BITS_ANY,bytes.data(),n,&actual,&status);
  if(!loaded||U_FAILURE(status))return 5;
  uint32_t hash=2166136261u;ofstream scalar(name+".values",ios::binary);
  for(int c=-1;c<=0x110000;++c){uint32_t value=ucptrie_get(loaded,c);hash=(hash^value)*16777619u;scalar.write(reinterpret_cast<char*>(&value),sizeof(value));}
  cout<<"T "<<type<<' '<<width<<' '<<n<<' '<<actual<<' '<<loaded->indexLength<<' '<<loaded->dataLength<<' '<<loaded->highStart<<' '<<loaded->shifted12HighStart<<' '<<int(loaded->type)<<' '<<int(loaded->valueWidth)<<' '<<loaded->reserved32<<' '<<loaded->reserved16<<' '<<loaded->index3NullOffset<<' '<<loaded->dataNullOffset<<' '<<loaded->nullValue<<' '<<hash<<'\n';
  ucptrie_close(loaded);
  for(int variant=0;variant<12;++variant){
   vector<uint32_t> copy=bytes;auto*b=reinterpret_cast<uint8_t*>(copy.data());
   int len=n,rt=-1,rw=-1;status=U_ZERO_ERROR;
   if(variant==0)status=U_ILLEGAL_ARGUMENT_ERROR;
   if(variant==1)status=U_USING_DEFAULT_WARNING;
   if(variant==2)len=0;
   if(variant==3)len=15;
   if(variant==4)len=n-1;
   if(variant==5)b[0]^=1;
   if(variant==6)reinterpret_cast<uint16_t*>(b)[2]|=8;
   if(variant==7)rt=1-type;
   if(variant==8)rw=(width+1)%3;
   if(variant==9)rt=2;
   if(variant==10)rw=3;
   if(variant==11)++b;
   actual=777;auto*p=ucptrie_openFromBinary(UCPTrieType(rt),UCPTrieValueWidth(rw),b,len,&actual,&status);
   cout<<"E "<<type<<' '<<width<<' '<<variant<<' '<<int(status)<<' '<<actual<<' '<<int(p!=nullptr)<<'\n';
   ucptrie_close(p);
  }
  ucptrie_close(t);
 }
}
`;
writeFileSync(`${prefix}.cpp`, cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
const rows = execFileSync(prefix, [prefix], { encoding: "utf8" }).trim().split("\n"),
  fixtures = [];
for (const row of rows.filter(
  /** Selects native successful construction rows. @param row - Native output. @returns Match. */ (
    row,
  ) => row.startsWith("T "),
)) {
  const values = row.slice(2).split(" ").map(Number),
    [type, width] = values;
  const bytes = new Uint8Array(readFileSync(`${prefix}-${type}-${width}.bin`)),
    status = [0],
    actual = [777];
  const trie = ucptrie_openFromBinary(-1, -1, bytes, bytes.length, actual, status);
  if (!trie) throw Error(`Local open failed ${type}/${width}: ${status}`);
  const nativeBytes = readFileSync(`${prefix}-${type}-${width}.bin.values`),
    nativeValues = new Uint32Array(
      nativeBytes.buffer,
      nativeBytes.byteOffset,
      nativeBytes.byteLength / 4,
    );
  let hash = 2166136261;
  for (let c = -1; c <= 0x110000; ++c) {
    const value = ucptrie_get(trie, c);
    if (value !== nativeValues[c + 1]) throw Error(`Scalar mismatch ${type}/${width} at ${c}`);
    hash = Math.imul(hash ^ value, 16777619) >>> 0;
  }
  const local = [
    type,
    width,
    bytes.length,
    actual[0],
    trie.indexLength,
    trie.dataLength,
    trie.highStart,
    trie.shifted12HighStart,
    trie.type,
    trie.valueWidth,
    trie.reserved32,
    trie.reserved16,
    trie.index3NullOffset,
    trie.dataNullOffset,
    trie.nullValue,
    hash,
  ];
  if (JSON.stringify(local) !== JSON.stringify(values))
    throw Error(`Native trie mismatch ${row}\n${local}`);
  const errors = rows
    .filter(
      /** Matches this exact native type/width pair. @param row - Native row. @returns Match. */ (
        row,
      ) => row.startsWith(`E ${type} ${width} `),
    )
    .map(
      /** Parses actual native status observations. @param row - Native row. @returns Variant/status/length/pointer tuple. */ (
        row,
      ) => row.slice(2).split(" ").map(Number).slice(2),
    );
  fixtures.push({
    type,
    width,
    binary: Buffer.from(bytes).toString("base64"),
    state: values.slice(3),
    errors,
  });
}
const hashes = {};
for (const path of [
  "common/ucptrie.cpp",
  "common/ucptrie_impl.h",
  "common/unicode/ucptrie.h",
  "common/umutablecptrie.cpp",
])
  hashes[path] = createHash("sha256")
    .update(readFileSync(`${source}/${path}`))
    .digest("hex");
const nativeArtifacts = {};
for (const path of [
  "lib/libicuuc.a",
  "stubdata/libicudata.a",
  "ucptrie-binary.cpp",
  "ucptrie-binary",
])
  nativeArtifacts[path] = createHash("sha256")
    .update(readFileSync(`${build}/${path}`))
    .digest("hex");
const report = {
  icuVersion: "78.3",
  sourceHashes: hashes,
  nativeArtifacts,
  comparison:
    "6 frozen binary tries, both types/all three widths, all Unicode codepoints plus -1/U+110000, native error rows; no allocator/ABI/complete break-iterator certification",
  fixtures,
};
writeFileSync(
  "apps/office/src/external/icu/source/common/ucptrie.binary.native-observations.json",
  JSON.stringify(report, null, 2) + "\n",
);
writeFileSync(
  `${prefix}-comparison.json`,
  JSON.stringify(
    {
      matched: fixtures.length,
      codepointQueries: fixtures.length * 0x110002,
      sourceHashes: hashes,
    },
    null,
    2,
  ) + "\n",
);
process.stdout.write(
  `Matched ${fixtures.length} original ICU binary tries and ${fixtures.length * 0x110002} native scalar queries.\n`,
);
