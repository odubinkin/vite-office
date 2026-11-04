/** @fileoverview Genuine ICU78.3 raw RBBIDataWrapper and fresh UnicodeString UTF8 value witness. Full original fields compare live; replay stores native full-row SHA256. No factory/provider/source replacement. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  RBBIDataWrapper,
  RBBIDataHeader,
} from "../apps/office/src/external/icu/source/common/rbbidata.h.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { StringPiece } from "../apps/office/src/external/icu/source/common/unicode/stringpiece.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/rbbidata-owner`;
const cpp = String.raw`
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstdlib>
#include <cstring>
#include "unicode/unistr.h"
#include "unicode/stringpiece.h"
#include "unicode/ucptrie.h"
#define private public
#include "rbbidata.h"
#undef private
using namespace std;using namespace icu;
void value(const UnicodeString&s){cout<<' '<<int(s.isBogus())<<' '<<int(s.getBuffer()==nullptr)<<' '<<s.length()<<' '<<int(s.isEmpty())<<' '<<uint32_t(s.charAt(0))<<' '<<uint32_t(s.charAt(s.length()))<<' '<<s.char32At(0);for(int i=0;i<s.length();++i)cout<<' '<<uint32_t(s.charAt(i));}
void table(const RBBIStateTable*t){if(!t){cout<<" -1";return;}cout<<' '<<t->fNumStates<<' '<<t->fRowLen<<' '<<t->fDictCategoriesStart<<' '<<t->fLookAheadResultsSize<<' '<<t->fFlags;int count=t->fNumStates*t->fRowLen;if(t->fFlags&4){cout<<' '<<count;auto d=reinterpret_cast<const uint8_t*>(t->fTableData);for(int i=0;i<count;++i)cout<<' '<<uint32_t(d[i]);}else{count/=2;cout<<' '<<count;auto d=reinterpret_cast<const uint16_t*>(t->fTableData);for(int i=0;i<count;++i)cout<<' '<<d[i];}}
void state(RBBIDataWrapper&w,UErrorCode status,const void*raw){cout<<' '<<int(status)<<' '<<int(w.fHeader!=nullptr)<<' '<<w.fRefCount<<' '<<int(w.fDontFreeData)<<' '<<int(w.fUDataMem==nullptr);if(w.fHeader){auto h=reinterpret_cast<const uint32_t*>(w.fHeader);for(int i=0;i<20;++i)cout<<' '<<h[i];cout<<' '<<w.hashCode();}table(w.fForwardTable);table(w.fReverseTable);
 auto t=w.fTrie;if(!t)cout<<" -1";else{cout<<' '<<int(t->type)<<' '<<int(ucptrie_getValueWidth(t))<<' '<<t->indexLength<<' '<<t->dataLength<<' '<<t->highStart<<' '<<t->shifted12HighStart<<' '<<t->reserved32<<' '<<t->reserved16<<' '<<t->index3NullOffset<<' '<<t->dataNullOffset<<' '<<t->nullValue;for(int i=0;i<t->indexLength;++i)cout<<' '<<t->index[i];for(int i=0;i<t->dataLength;++i)cout<<' '<<(t->valueWidth==0?uint32_t(t->data.ptr16[i]):t->valueWidth==1?t->data.ptr32[i]:uint32_t(t->data.ptr8[i]));}
 cout<<' '<<(w.fRuleSource?int64_t(w.fRuleSource-reinterpret_cast<const char*>(raw)):-1)<<' '<<(w.fRuleStatusTable?w.fStatusMaxIdx:-1);if(w.fRuleStatusTable)for(int i=0;i<w.fStatusMaxIdx;++i)cout<<' '<<w.fRuleStatusTable[i];value(w.getRuleSourceString());}
void cleanup(RBBIDataWrapper*w){if(w->fRefCount>0)w->removeReference();else{w->fRefCount=0;delete w;}}
int main(){cout<<"P "<<sizeof(void*)<<' '<<UNISTR_OBJECT_SIZE<<' '<<(UNISTR_OBJECT_SIZE-sizeof(void*)-2)/sizeof(char16_t)<<'\n';char op;
 while(cin>>op){if(op=='V'){int length,flags,n,b;cin>>length>>flags>>n;vector<uint8_t>bytes(n+8,0);for(int i=0;i<n;++i){cin>>b;bytes[i]=b;}StringPiece p=(flags&2)?StringPiece():(flags&4)?StringPiece(nullptr):StringPiece((flags&1)?nullptr:reinterpret_cast<const char*>(bytes.data()),length);cout<<"V "<<int(p.data()==nullptr)<<' '<<p.length()<<' '<<p.size()<<' '<<int(p.empty());value(UnicodeString::fromUTF8(p));cout<<'\n';}
 else{string path;int tag,initial;cin>>path>>tag>>initial;ifstream f(path,ios::binary);vector<char>bytes((istreambuf_iterator<char>(f)),{});void*allocation=malloc(bytes.size()+(tag==3?8:0));void*raw=static_cast<char*>(allocation)+(tag==3?8:0);memcpy(raw,bytes.data(),bytes.size());auto h=reinterpret_cast<const RBBIDataHeader*>(raw);UErrorCode status=UErrorCode(initial);auto w=tag?new RBBIDataWrapper(h,RBBIDataWrapper::kDontAdopt,status):new RBBIDataWrapper(h,status);cout<<"R";state(*w,status,raw);
 if(U_SUCCESS(status)){cout<<' '<<int(w->addReference()==w);state(*w,status,raw);w->removeReference();state(*w,status,raw);}else{w->removeReference();state(*w,status,raw);}
 cout<<' '<<int(*w==*w);if(w->fHeader){for(int mode=0;mode<4;++mode){auto copy=bytes;if(mode==2)copy[56]^=1;if(mode==3)--reinterpret_cast<RBBIDataHeader*>(copy.data())->fLength;UErrorCode ec=U_ZERO_ERROR;auto other=new RBBIDataWrapper(mode==0?h:reinterpret_cast<const RBBIDataHeader*>(copy.data()),RBBIDataWrapper::kDontAdopt,ec);cout<<' '<<int(*w==*other);cleanup(other);}}
 bool notAdopted=w->fDontFreeData;cleanup(w);if(notAdopted)free(allocation);cout<<'\n';}}
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
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
/** Complete owned readable-value observation, without an alternate UTF8 implementation. @param value - Actual owner. @returns Native value fields. */
function value(value) {
  const text = value.getBuffer(),
    row = [
      Number(value.isBogus()),
      Number(text === null),
      value.length(),
      Number(value.isEmpty()),
      value.charAt(0),
      value.charAt(value.length()),
      value.char32At(0),
    ];
  for (let i = 0; i < value.length(); ++i) row.push(value.charAt(i));
  return row;
}
/** Actual native table fields/data observation. @param table - Actual view or null. @returns Full table state. */
function table(table) {
  return table === null
    ? [-1]
    : [
        table.fNumStates,
        table.fRowLen,
        table.fDictCategoriesStart,
        table.fLookAheadResultsSize,
        table.fFlags,
        table.fTableData.length,
        ...table.fTableData,
      ];
}
/** Reads every represented initialized owner field and actual borrowed array; no boundary recomputation. @param owner - Actual wrapper. @param status - Native status. @param bytes - Actual binary. @returns Full flat snapshot. */
function state(owner, status, bytes) {
  const row = [
    status,
    Number(owner.fHeader !== null),
    owner.fRefCount,
    Number(owner.fDontFreeData),
    Number(owner.fUDataMem === null),
  ];
  if (owner.fHeader !== null)
    row.push(...new Uint32Array(bytes.buffer, bytes.byteOffset, 20), owner.hashCode());
  row.push(...table(owner.fForwardTable), ...table(owner.fReverseTable));
  const t = owner.fTrie;
  if (t === null) row.push(-1);
  else
    row.push(
      t.type,
      t.valueWidth,
      t.indexLength,
      t.dataLength,
      t.highStart,
      t.shifted12HighStart,
      t.reserved32,
      t.reserved16,
      t.index3NullOffset,
      t.dataNullOffset,
      t.nullValue,
      ...t.index,
      ...t.data,
    );
  row.push(
    owner.fRuleSource === null ? -1 : owner.fRuleSource.byteOffset - bytes.byteOffset,
    owner.fRuleStatusTable === null ? -1 : owner.fStatusMaxIdx,
  );
  if (owner.fRuleStatusTable !== null) row.push(...owner.fRuleStatusTable);
  row.push(...value(owner.getRuleSourceString()));
  return row;
}
/** Runs the real local raw owner and reference/equality methods. @param bytes - Actual owned scratch bytes. @param tag - Borrowed/owning source overload. @param initial - Incoming status. @returns Native-observable states. */
function wrapper(bytes, tag, initial) {
  if (tag === 3) {
    const storage = new Uint8Array(bytes.length + 8);
    storage.set(bytes, 8);
    bytes = storage.subarray(8);
  }
  const status = [initial],
    header = new RBBIDataHeader(bytes),
    w = tag
      ? new RBBIDataWrapper(header, RBBIDataWrapper.kDontAdopt, status)
      : new RBBIDataWrapper(header, status),
    row = state(w, status[0], bytes);
  if (status[0] <= 0) {
    row.push(Number(w.addReference() === w), ...state(w, status[0], bytes));
    w.removeReference();
    row.push(...state(w, status[0], bytes));
  } else {
    w.removeReference();
    row.push(...state(w, status[0], bytes));
  }
  row.push(Number(w.equals(w)));
  if (w.fHeader !== null)
    for (let mode = 0; mode < 4; ++mode) {
      const copy = bytes.slice();
      if (mode === 2) copy[56] ^= 1;
      if (mode === 3) --new Uint32Array(copy.buffer, copy.byteOffset, 20)[2];
      const other = new RBBIDataWrapper(
        mode === 0 ? header : new RBBIDataHeader(copy),
        RBBIDataWrapper.kDontAdopt,
        [0],
      );
      row.push(Number(w.equals(other)));
    }
  return row;
}
/** Runs actual StringPiece/fresh UnicodeString APIs. @param item - Native descriptor. @returns Native value fields. */
function factory(item) {
  const [length, flags, data] = item,
    bytes = new Uint8Array(data.length + 8);
  bytes.set(data);
  const p =
    flags & 2
      ? new StringPiece()
      : flags & 4
        ? new StringPiece(null)
        : new StringPiece(flags & 1 ? null : bytes, length);
  return [
    Number(p.data() === null),
    p.length(),
    p.size(),
    Number(p.empty()),
    ...value(UnicodeString.fromUTF8(p)),
  ];
}
/** Hashes the complete numeric snapshot after direct live comparison. @param row - Observed fields. @returns SHA256. */
function digest(row) {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
const pairs = [];
for (let a = 0; a < 256; ++a) for (let b = 0; b < 256; ++b) pairs.push([2, 0, [a, b]]);
const factories = [];
for (const bytes of [
  [],
  [0],
  [65, 0, 66],
  [0xc2],
  [0xed, 0xa0, 0x80],
  [0xef, 0xbf, 0xbe],
  [0xf0, 0x9f, 0x98, 0x80],
  [0xf4, 0x8f, 0xbf, 0xbf],
  Array(27).fill(65),
  Array(28).fill(65),
  Array(80).fill(0xff),
  [...Array(40).fill(65), 0xf0, 0x9f, 0x98, 0x80],
])
  for (let len = 0; len <= bytes.length; ++len) factories.push([len, 0, bytes]);
factories.push([0, 1, []], [0, 2, []], [0, 4, []]);
/** Compares original fresh factory calls in full. @param cases - Actual byte descriptors. @param label - Observation group. @returns Exact native result hashes. */
function compareValues(cases, label) {
  const input =
      cases
        .map(
          /** Writes counted native calls. @param item - Descriptor. @returns Command. */ (item) =>
            `V ${item[0]} ${item[1]} ${item[2].length} ${item[2].join(" ")}`,
        )
        .join("\n") + "\n",
    output = execFileSync(prefix, { input, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 })
      .trimEnd()
      .split("\n");
  if (output.shift() !== "P 8 64 27") throw Error("Native profile changed");
  if (output.length !== cases.length) throw Error("Factory count mismatch");
  const hashes = [];
  for (let i = 0; i < cases.length; ++i) {
    const expected = output[i].slice(2).split(" ").map(Number),
      actual = factory(cases[i]);
    if (JSON.stringify(expected) !== JSON.stringify(actual))
      throw Error(`Factory ${label}:${i}\nnative=${expected}\nlocal=${actual}`);
    hashes.push(digest(expected));
  }
  process.stdout.write(`Matched ${label}: ${cases.length} original fresh values.\n`);
  return hashes;
}
const pairHashes = compareValues(pairs, "all-byte-pair-values"),
  factoryHashes = compareValues(factories, "counted-null-and-long-values");
const rules = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/rbbi.forward.native-observations.json",
    "utf8",
  ),
).fixtures;
const binaries = rules.map(
  /** Reads original compiled source rules. @param item - Original record. @returns Bytes. */ (
    item,
  ) => ({ name: item.name, binary: item.binary }),
);
const base = Buffer.from(rules[0].binary, "base64");
for (const [name, index, value] of [
  ["bad-magic", 0, 0],
  ["bad-major", 1, 7],
  ["minor-version", 1, 0xffffff06],
  ["no-forward", 5, 0],
  ["no-reverse", 7, 0],
  ["signed-hash", 5, 0x80000000],
]) {
  const bytes = Uint8Array.from(base);
  new Uint32Array(bytes.buffer)[index] = value;
  binaries.push({ name, binary: Buffer.from(bytes).toString("base64") });
}
const badTrie = Uint8Array.from(base),
  trieOffset = new Uint32Array(badTrie.buffer)[8];
new Uint32Array(badTrie.buffer, trieOffset, 1)[0] = 0;
binaries.push({ name: "bad-trie", binary: Buffer.from(badTrie).toString("base64") });
const tries = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/ucptrie.binary.native-observations.json",
    "utf8",
  ),
).fixtures;
const wide = Buffer.from(
    tries.find(
      /** Selects an actual original 32-bit FAST trie. @param item - Native trie. @returns Match. */ (
        item,
      ) => item.type === 0 && item.width === 1,
    ).binary,
    "base64",
  ),
  wideBytes = new Uint8Array(base.length + wide.length);
wideBytes.set(base);
wideBytes.set(wide, base.length);
const wideHeader = new Uint32Array(wideBytes.buffer);
wideHeader[8] = base.length;
wideHeader[9] = wide.length;
wideHeader[2] = wideBytes.length;
binaries.push({
  name: "unsupported-trie-width",
  binary: Buffer.from(wideBytes).toString("base64"),
});
const medium = Buffer.from(
    tries.find(
      /** Selects a genuine original FAST/16-bit serialized trie. @param item - Native trie. @returns Match. */
      (item) => item.type === 0 && item.width === 0,
    ).binary,
    "base64",
  ),
  mediumBytes = new Uint8Array(base.length + medium.length);
mediumBytes.set(base);
mediumBytes.set(medium, base.length);
const mediumHeader = new Uint32Array(mediumBytes.buffer, 0, 20);
mediumHeader[8] = base.length;
mediumHeader[9] = medium.length;
mediumHeader[2] = mediumBytes.length;
binaries.push({
  name: "accepted-16-bit-trie",
  binary: Buffer.from(mediumBytes).toString("base64"),
});
for (const bytes of [
  [65, 0, 66],
  [0xff, 0xed, 0xa0, 0x80, 0xf0, 0x9f, 0x98, 0x80],
]) {
  const data = new Uint8Array(base.length + bytes.length);
  data.set(base);
  data.set(bytes, base.length);
  const h = new Uint32Array(data.buffer, 0, 20);
  h[10] = base.length;
  h[11] = bytes.length;
  h[2] = data.length;
  binaries.push({
    name: `counted-source-${bytes.length}`,
    binary: Buffer.from(data).toString("base64"),
  });
}
const calls = [];
const paths = [];
for (let i = 0; i < binaries.length; ++i) {
  const path = `${prefix}-${i}.bin`;
  writeFileSync(path, Buffer.from(binaries[i].binary, "base64"));
  paths.push(path);
  for (const tag of [0, 1, 3]) for (const initial of [0, -124, 7]) calls.push([i, tag, initial]);
}
const output = execFileSync(prefix, {
  input:
    calls
      .map(
        /** Writes original constructor calls. @param item - Constructor args. @returns Command. */ (
          item,
        ) => `R ${paths[item[0]]} ${item[1]} ${item[2]}`,
      )
      .join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 512 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (output.shift() !== "P 8 64 27" || output.length !== calls.length)
  throw Error("Owner count/profile mismatch");
const ownerHashes = [];
for (let i = 0; i < calls.length; ++i) {
  const [which, tag, initial] = calls[i],
    bytes = Uint8Array.from(Buffer.from(binaries[which].binary, "base64")),
    expected = output[i].slice(2).split(" ").map(Number),
    actual = wrapper(bytes, tag, initial);
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw Error(
      `Owner ${i}:${binaries[which].name} ${tag} ${initial}\nnative-prefix=${expected.slice(0, 36)}\nlocal-prefix=${actual.slice(0, 36)}`,
    );
  ownerHashes.push(digest(expected));
}
process.stdout.write(
  `Matched ${calls.length} complete original owner/reference/equality traces.\n`,
);
const sourceHashes = {},
  artifacts = {};
for (const path of [
  "common/rbbidata.cpp",
  "common/rbbidata.h",
  "common/unistr.cpp",
  "common/unicode/unistr.h",
  "common/unicode/stringpiece.h",
  "common/ucptrie.cpp",
])
  sourceHashes[path] = createHash("sha256")
    .update(readFileSync(`${source}/${path}`))
    .digest("hex");
for (const path of [
  "lib/libicuuc.a",
  "lib/libicui18n.a",
  "stubdata/libicudata.a",
  "rbbidata-owner.cpp",
  "rbbidata-owner",
])
  artifacts[path] = createHash("sha256")
    .update(readFileSync(`${build}/${path}`))
    .digest("hex");
writeFileSync(
  "apps/office/src/external/icu/source/common/rbbidata.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      profile: [8, 64, 27],
      scope:
        "Full live raw owning/borrowed constructor, initialized field/array, reference and equality comparison. Fresh UnicodeString factory uses existing managed value storage, actual ICU converter and source working capacity. No public writable-buffer/alias allocator API or replacement UDataMemory/iterator factory. Native deletion cleanup of failed scratch owners resets counters only after all observations. Allocation/thread/physical ABI and use after final release are unverified; real UDataMemory/loader/iterator/engine/service installation remains pending.",
      sourceHashes,
      artifacts,
      pairCount: pairs.length,
      pairHash: digest(pairHashes),
      factories,
      factoryHashes,
      binaries,
      calls,
      ownerHashes,
    },
    null,
    2,
  ) + "\n",
);
