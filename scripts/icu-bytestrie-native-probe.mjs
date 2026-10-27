/** @fileoverview Differential proof for original ICU78.3 BytesTrie reader, original-builder fixtures and actual langInfo likely trie. Invalid serialized storage, getValue without value, stopped-state uint64 pointer subtraction, native ownership/ABI and Iterator are not certified. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { BytesTrie } from "../apps/office/src/external/icu/source/common/unicode/bytestrie.ts";
import { USTRINGTRIE_HAS_VALUE } from "../apps/office/src/external/icu/source/common/unicode/ustringtrie.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/bytestrie-witness.cc`,
  String.raw`
#include "unicode/bytestrie.h"
#include "unicode/bytestriebuilder.h"
#include "unicode/ures.h"
#include "unicode/putil.h"
#include <iostream>
#include <climits>
static_assert(CHAR_MIN == -128, "This witness certifies the pinned signed-char target.");
#include <fstream>
#include <sstream>
#include <vector>
#include <string>
using namespace icu;
std::string unhex(std::string s){if(s=="-")return {};std::string o;for(size_t i=0;i<s.size();i+=2)o.push_back(char(std::stoi(s.substr(i,2),nullptr,16)));return o;}
std::string hex(std::string s){const char*t="0123456789abcdef";std::string o;for(unsigned char c:s){o+=t[c>>4];o+=t[c&15];}return o.empty()?"-":o;}
void describe(BytesTrie&t){auto r=t.current();int32_t value=USTRINGTRIE_HAS_VALUE(r)?t.getValue():77;int32_t unique=999;bool has=t.hasUniqueValue(unique);std::string next;StringByteSink<std::string> sink(&next);int n=t.getNextBytes(sink);std::cout<<int(r)<<' '<<value<<' '<<int(has)<<' '<<unique<<' '<<n<<' '<<hex(next)<<' ';if(r!=USTRINGTRIE_NO_MATCH)std::cout<<t.getState64();else std::cout<<'-';std::cout<<' ';}
int main(int argc,char**argv){std::string root=argv[1];u_setDataDirectory(argv[2]);if(std::string(argv[3])=="build"){int id,n,option;while(std::cin>>id>>n>>option){UErrorCode e=U_ZERO_ERROR;BytesTrieBuilder b(e);std::string key;int32_t value;for(int i=0;i<n;++i){std::cin>>key>>value;auto s=unhex(key);b.add(StringPiece(s.data(),int32_t(s.size())),value,e);}auto data=b.buildStringPiece(option?USTRINGTRIE_BUILD_SMALL:USTRINGTRIE_BUILD_FAST,e);if(U_FAILURE(e))return 2;std::ofstream f(root+"/bytestrie-fixture-"+std::to_string(id)+".bin",std::ios::binary);f.write(data.data(),data.length());std::cout<<id<<' '<<data.length()<<'\n';}UErrorCode e=U_ZERO_ERROR;auto*r=ures_openDirect(nullptr,"langInfo",&e);auto*likely=ures_getByKey(r,"likely",nullptr,&e);auto*t=ures_getByKey(likely,"trie",nullptr,&e);int32_t length;auto*data=ures_getBinary(t,&length,&e);if(U_FAILURE(e))return 3;std::ofstream f(root+"/bytestrie-fixture-99.bin",std::ios::binary);f.write(reinterpret_cast<const char*>(data),length);std::cout<<99<<' '<<length<<'\n';ures_close(t);ures_close(likely);ures_close(r);return 0;}
std::vector<std::vector<uint8_t>> fixtures(100);for(int i=0;i<100;++i){std::ifstream f(root+"/bytestrie-fixture-"+std::to_string(i)+".bin",std::ios::binary);if(f)fixtures[i]=std::vector<uint8_t>(std::istreambuf_iterator<char>(f),{});}int id,mode,split,extra;std::string encoded;while(std::cin>>id>>mode>>split>>extra>>encoded){auto s=unhex(encoded);auto&data=fixtures[id];BytesTrie t(data.data());UStringTrieResult r=USTRINGTRIE_NO_VALUE;if(mode==0){for(unsigned char c:s)r=t.next(c);}else if(mode==1)r=t.next(s.data(),int32_t(s.size()));else if(mode==2){s.push_back(0);r=t.next(s.data(),-1);}else if(mode==3){r=t.next(s.data(),split);BytesTrie::State saved;t.saveState(saved);BytesTrie copy(t);if(r!=USTRINGTRIE_NO_MATCH){auto state=t.getState64();t.first(extra);t.resetToState64(state);}else t.first(extra);t.resetToState(saved);r=t.next(s.data()+split,int32_t(s.size())-split);auto rc=copy.next(s.data()+split,int32_t(s.size())-split);std::cout<<int(rc)<<' ';}else if(mode==4){r=t.next(s.data(),int32_t(s.size()));r=t.next(extra);}else if(mode==5){t.next(s.data(),int32_t(s.size()));r=t.first(extra);}else if(mode==6){t.next(s.data(),int32_t(s.size()));BytesTrie::State empty;t.resetToState(empty);BytesTrie other(data.data()+1);BytesTrie::State different;other.saveState(different);t.resetToState(different);r=t.current();}else{t.next(s.data(),int32_t(s.size()));t.reset();r=t.current();}std::cout<<int(r)<<' ';describe(t);std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/bytestrie-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/bytestrie-witness`,
  ],
  { stdio: "inherit" },
);
/** Hex counted storage. @param bytes - Narrow bytes. @returns Transport text. */
function hex(bytes) {
  return Buffer.from(bytes).toString("hex") || "-";
}
const fixtures = [],
  fixtureKeys = [],
  builderInput = [];
/** Builds each dataset in both original builder modes. @param entries - Unique byte keys/values. @returns Nothing. */
function addFixture(entries) {
  for (const mode of [0, 1]) {
    const id = fixtureKeys.length;
    fixtureKeys.push(
      entries.map(
        /** Copies a fixture key. @param entry - Key/value. @returns Counted bytes. */ ([key]) =>
          Uint8Array.from(key),
      ),
    );
    builderInput.push(
      `${id} ${entries.length} ${mode}`,
      ...entries.map(
        /** Frames a builder row. @param entry - Key/value. @returns Row. */ ([key, value]) =>
          `${hex(key)} ${value}`,
      ),
    );
  }
}
const values = [
  0, 1, 64, 65, 0x1aff, 0x1b00, 0x11ffff, 0x120000, 0xffffff, 0x1000000, 0x7fffffff, -1,
  -2147483648,
];
const mixed = [[[], 17]];
for (let c = 0; c < 256; ++c) {
  mixed.push(
    [[c], values[c % values.length]],
    [[c, 0, 255, 16, 32, 33, 34], values[(c + 1) % values.length]],
    [
      [
        c,
        1,
        ...Array.from(
          { length: 65 },
          /** Constructs a long source key. @param unused - Unused. @param j - Position. @returns Byte. */ (
            _,
            j,
          ) => (c + j) & 255,
        ),
      ],
      values[(c + 2) % values.length],
    ],
  );
}
addFixture(mixed);
addFixture(
  Array.from(
    { length: 16 },
    /** Makes distinct subtree values. @param unused - Unused. @param i - Byte. @returns Entry. */ (
      _,
      i,
    ) => [[i], i < 8 ? 11 : 22],
  ),
);
addFixture(
  Array.from(
    { length: 16 },
    /** Makes uniform subtree values. @param unused - Unused. @param i - Byte. @returns Entry. */ (
      _,
      i,
    ) => [[i], 42],
  ),
);
addFixture([[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], -2147483648]]);
console.log(
  execFileSync(`${build}/bytestrie-witness`, [build, `${source}/data/in`, "build"], {
    input: builderInput.join("\n") + "\n",
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  }).trim(),
);
// All compact delta widths, source-valid branch6 serialization. Non-minimal encodings deliberately exercise each original reader branch without huge native allocations.
for (let width = 1; width <= 5; ++width) {
  const id = 89 + width,
    delta = [[], [6], [0xc0, 6], [0xf0, 0, 6], [0xfe, 0, 0, 6], [0xff, 0, 0, 0, 6]][width];
  const bytes = Uint8Array.from([
    5,
    3,
    ...delta,
    3,
    0x23,
    4,
    0x25,
    5,
    0x27,
    0,
    0x29,
    1,
    0x2b,
    2,
    0x2d,
  ]);
  writeFileSync(`${build}/bytestrie-fixture-${id}.bin`, bytes);
  fixtures[id] = bytes;
  fixtureKeys[id] = Array.from(
    { length: 6 },
    /** Copies each branch key. @param unused - Unused. @param i - Byte. @returns Key. */ (_, i) =>
      Uint8Array.of(i),
  );
}
for (let id = 0; id < 8; ++id)
  fixtures[id] = new Uint8Array(readFileSync(`${build}/bytestrie-fixture-${id}.bin`));
fixtures[99] = new Uint8Array(readFileSync(`${build}/bytestrie-fixture-99.bin`));
// Enumerate every actual langInfo key through the source reader's next-byte API; values/continuations are independently observed by native ICU below.
const actualKeys = [];
/** Collects each value-bearing path from actual serialized resources. @param trie - Reader copy. @param prefix - Current bytes. @returns Nothing. */
function walk(trie, prefix) {
  if (USTRINGTRIE_HAS_VALUE(trie.current())) actualKeys.push(Uint8Array.from(prefix));
  const next = [];
  trie.getNextBytes({
    /** Appends source continuation bytes. @param s - Span. @returns Nothing. */
    Append(s) {
      for (let i = 0; i < s.length; ++i) next.push(s.charCodeAt(i));
    },
  });
  for (const b of next) {
    const child = new BytesTrie(trie);
    child.next(b);
    walk(child, [...prefix, b]);
  }
}
walk(new BytesTrie(fixtures[99]), []);
fixtureKeys[99] = actualKeys;
const input = [],
  expected = [];
/** Native-described reader state, excluding undefined null-pointer subtraction and invalid value reads. @param trie - Reader. @returns Scalars. */
function describe(trie) {
  const r = trie.current(),
    value = USTRINGTRIE_HAS_VALUE(r) ? trie.getValue() : 77,
    unique = [999],
    has = trie.hasUniqueValue(unique);
  let next = "";
  const n = trie.getNextBytes({
    /** Appends source continuation bytes. @param s - Span. @returns Nothing. */
    Append(s) {
      next += s;
    },
  });
  return [
    r,
    value,
    Number(has),
    unique[0],
    n,
    hex(
      Array.from(
        next,
        /** Projects invariant/narrow bytes. @param c - Unit. @returns Byte. */ (c) =>
          c.charCodeAt(0),
      ),
    ),
    r === 0 ? "-" : String(trie.getState64()),
  ];
}
/** Replays original public overloads, copy and state protocol. @param id - Fixture. @param bytes - Query. @param mode - Operation. @param split - Prefix split. @param extra - Signed byte. @returns Nothing. */
function add(id, bytes, mode, split = 0, extra = 0) {
  const data = fixtures[id],
    t = new BytesTrie(data);
  let r = 1;
  const row = [];
  if (mode === 0) {
    for (const b of bytes) r = t.next(b);
  } else if (mode === 1) r = t.next(bytes, bytes.length);
  else if (mode === 2) r = t.next(Uint8Array.from([...bytes, 0]), -1);
  else if (mode === 3) {
    r = t.next(bytes, split);
    const saved = new BytesTrie.State();
    t.saveState(saved);
    const copy = new BytesTrie(t);
    if (r !== 0) {
      const state = t.getState64();
      t.first(extra);
      t.resetToState64(state);
    } else t.first(extra);
    t.resetToState(saved);
    r = t.next(bytes.subarray(split), bytes.length - split);
    row.push(copy.next(bytes.subarray(split), bytes.length - split));
  } else if (mode === 4) {
    t.next(bytes, bytes.length);
    r = t.next(extra);
  } else if (mode === 5) {
    t.next(bytes, bytes.length);
    r = t.first(extra);
  } else if (mode === 6) {
    t.next(bytes, bytes.length);
    t.resetToState(new BytesTrie.State());
    const other = new BytesTrie(data.subarray(1)),
      different = new BytesTrie.State();
    other.saveState(different);
    t.resetToState(different);
    r = t.current();
  } else {
    t.next(bytes, bytes.length);
    t.reset();
    r = t.current();
  }
  input.push(`${id} ${mode} ${split} ${extra} ${hex(bytes)}`);
  expected.push([...row, r, ...describe(t)].join(" "));
}
for (let id = 0; id < fixtureKeys.length; ++id) {
  if (!fixtureKeys[id]) continue;
  const prefixes = new Map();
  for (const key of fixtureKeys[id])
    for (let n = 0; n <= key.length; ++n) {
      const p = key.subarray(0, n);
      prefixes.set(hex(p), p);
    }
  for (const p of prefixes.values()) {
    for (let mode = 0; mode < 8; ++mode) add(id, p, mode, Math.floor(p.length / 2), 37);
    for (const extra of [
      -257, -256, -255, -129, -128, -1, 0, 1, 127, 128, 255, 256, 511, 2147483647,
    ]) {
      add(id, p, 4, 0, extra);
      if (p.length <= 2) add(id, p, 5, 0, extra);
    }
  }
}
// Full single-byte input alphabet from each actual data root, plus stopped-state calls and C/count distinctions.
for (const id of [0, 1, 2, 4, 6, 90, 91, 92, 93, 94, 99])
  for (let b = -257; b <= 256; ++b) {
    add(id, new Uint8Array(), 4, 0, b);
    add(id, Uint8Array.of(255, 255, 255), 5, 0, b);
  }
const native = execFileSync(`${build}/bytestrie-witness`, [build, `${source}/data/in`, "query"], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 256 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (native.length !== expected.length) throw Error(`Rows ${native.length}/${expected.length}`);
for (let i = 0; i < native.length; ++i)
  if (native[i].trim() !== expected[i])
    throw Error(`Row ${i}: ${input[i]} native ${native[i]} port ${expected[i]}`);
const report = {
  result: "pass",
  plainChar: "signed8",
  cases: expected.length,
  langInfoKeys: actualKeys.length,
  fixtureBytes: fixtures
    .map(
      /** Records exact fixture bytes. @param b - Storage. @param id - Fixture. @returns Digest or null. */ (
        b,
        id,
      ) =>
        b ? { id, length: b.length, sha256: createHash("sha256").update(b).digest("hex") } : null,
    )
    .filter(Boolean),
  sources: Object.fromEntries(
    [
      "common/bytestrie.cpp",
      "common/unicode/bytestrie.h",
      "common/unicode/ustringtrie.h",
      "common/bytestriebuilder.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Hashes pinned source. @param path - Source path. @returns Digest pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Unchanged original reader/libraries, both original builder modes, complete actual langInfo likely keys/prefixes, all compact value widths and manually serialized valid branch fixtures for all5 delta widths; byte/string/C overloads, full signed-byte boundary, copy, saved pointer/uint64 state, unique-value outputs including failure and next-byte enumeration. Iterator/builder port, source-invalid buffers/pointers, getValue without value, stopped uint64 pointer subtraction, physical ownership/ABI and Calendar/CSV completion remain uncertified.",
};
writeFileSync(`${build}/bytestrie-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
