/** @fileoverview Genuine ICU78.3 CharString/MaybeStackArray byte-owner comparison. Original library methods execute; private visibility is opened only for initialized field observation. Uninitialized tails and moved-from contents are excluded, with no allocator or provider replacements. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { observeCharStrings } from "./icu-charstr-observe.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/charstr-witness`;
const cpp = String.raw`
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <climits>
#include <cstring>
#include "unicode/utypes.h"
#include "unicode/unistr.h"
#include "unicode/uobject.h"
#include "unicode/localpointer.h"
#include "unicode/uclean.h"
#include "unicode/putil.h"
#define private public
#include "cmemory.h"
#include "charstr.h"
#undef private
using namespace std;using namespace icu;
void state(CharString&s,bool known){auto&b=s.buffer;auto p=s.toStringPiece();cout<<' '<<s.length()<<' '<<b.getCapacity()<<' '<<int(b.needToRelease)<<' '<<int(b.ptr==b.stackArray)<<' '<<int(s.isEmpty())<<' '<<p.length()<<' '<<int(p.data()==s.data())<<' '<<s.lastIndexOf('a')<<' '<<(known?int(s[0]):-9999);if(known)for(int i=0;i<=s.length();++i)cout<<' '<<unsigned(uint8_t(s.data()[i]));else cout<<" -9999";}
void arrayState(MaybeStackArray<char,40>&a,int known){cout<<' '<<a.getCapacity()<<' '<<int(a.needToRelease)<<' '<<int(a.ptr==a.stackArray)<<' '<<(a.getArrayLimit()-a.getAlias())<<' '<<known;for(int i=0;i<known;++i)cout<<' '<<unsigned(uint8_t(a.getAlias()[i]));}
int main(){cout<<"P "<<CHAR_MIN<<' '<<sizeof(char)<<' '<<40<<' '<<U_FILE_SEP_CHAR<<'\n';unique_ptr<CharString>owners[]={make_unique<CharString>(),make_unique<CharString>()};bool known[]={true,true};char*pending[]={nullptr,nullptr};MaybeStackArray<char,40>arrays[2];for(int i=0;i<2;++i)memset(arrays[i].getAlias(),0x41+i,40);int ak[]={40,40};char alias[64];memset(alias,0x7e,64);
 string op;while(cin>>op){int a[4],n,c;string number;for(auto&x:a)cin>>x;cin>>number>>n;vector<char>data(n+8,0);vector<char16_t>utf16;for(int i=0;i<n;++i){cin>>c;data[i]=c;utf16.push_back(c);}utf16.push_back(0);int id=a[0];auto&s=*owners[id];UErrorCode ec=UErrorCode(a[1]);cout<<"R";
 if(op=="N"){if(a[2]==1)owners[id]=make_unique<CharString>(StringPiece(data.data()),ec);else if(a[2]==2)owners[id]=make_unique<CharString>(*owners[a[3]],ec);else owners[id]=make_unique<CharString>(a[2]==3?nullptr:data.data(),a[3],ec);known[id]=true;}
 if(op=="A"){cout<<' '<<int(&s.append(a[2]==1?nullptr:data.data(),a[3],ec)==&s);if(U_SUCCESS(ec)&&s.length()>0)known[id]=true;}
 if(op=="S")cout<<' '<<int(&s.append(s.data()+a[2],a[3],ec)==&s);
 if(op=="B"){cout<<' '<<int(&s.append(char(a[2]),ec)==&s);if(U_SUCCESS(ec))known[id]=true;}
 if(op=="C"){cout<<' '<<int(&s.clear()==&s);known[id]=true;}
 if(op=="T")cout<<' '<<int(&s.truncate(a[2])==&s);
 if(op=="R"){cout<<' '<<int(&s.copyFrom(*owners[a[2]],ec)==&s);if(U_SUCCESS(ec)&&a[2]!=id)known[id]=known[a[2]];}
 if(op=="P"){cout<<' '<<int(&s.copyFrom(StringPiece(a[2]==1?nullptr:data.data(),a[3]),ec)==&s);if(U_SUCCESS(ec)&&s.length()>0)known[id]=true;}
 if(op=="D")cout<<' '<<int(&s.appendNumber(stoll(number),ec)==&s);
 if(op=="G"){int32_t cap=917;auto p=s.getAppendBuffer(a[2],a[3],cap,ec);pending[id]=p;cout<<' '<<cap<<' '<<int(p==nullptr)<<' '<<(p?p-s.data():-1);if(p){memcpy(p,data.data(),n);cout<<' '<<n;for(int i=0;i<n;++i)cout<<' '<<unsigned(uint8_t(p[i]));}}
 if(op=="W"){cout<<' '<<int(&s.append(pending[id],a[2],ec)==&s);pending[id]=nullptr;if(U_SUCCESS(ec)&&s.length()>0)known[id]=true;}
 if(op=="E"){vector<char>target((a[2]>0?a[2]:0)+4,char(0xa5));auto dest=a[3]==1?nullptr:a[3]==2?s.data():target.data();cout<<' '<<s.extract(dest,a[2],ec)<<' '<<int(dest==nullptr);if(dest)for(int i=0;i<(a[3]==2?s.length()+1:int(target.size()));++i)cout<<' '<<unsigned(uint8_t(dest[i]));if(a[3]==2&&U_SUCCESS(ec)&&s.length()<a[2])known[id]=true;}
 if(op=="Q"){auto p=s.cloneData(ec);cout<<' '<<int(p==nullptr);if(p){for(int i=0;i<=s.length();++i)cout<<' '<<unsigned(uint8_t(p[i]));uprv_free(p);}}
 if(op=="V"){StringPiece p(a[2]==1?nullptr:data.data(),a[3]);cout<<' '<<int(s.contains(p))<<' '<<int(s==p)<<' '<<int(s!=p);}
 if(op=="I"){if(a[2]==1||a[2]==2){UnicodeString u(utf16.data(),n);if(a[2]==2)u.setToBogus();cout<<' '<<int(&s.appendInvariantChars(u,ec)==&s);}else cout<<' '<<int(&s.appendInvariantChars(a[2]==3?nullptr:utf16.data(),a[3],ec)==&s);if(U_SUCCESS(ec))known[id]=true;}
 if(op=="J")cout<<' '<<int(&s.appendPathPart(StringPiece(data.data(),a[3]),ec)==&s);if(op=="F")cout<<' '<<int(&s.ensureEndsWithFileSeparator(ec)==&s);
 if(op=="M"){owners[id]=make_unique<CharString>(std::move(*owners[a[2]]));known[id]=known[a[2]];known[a[2]]=false;}
 if(op=="X"){cout<<' '<<int(&(s=std::move(*owners[a[2]]))==&s);known[id]=known[a[2]];known[a[2]]=false;}
 if(op=="L"){auto p=arrays[id].resize(a[2],a[3]);if(p)ak[id]=max(0,min(ak[id],min(a[3],arrays[id].getCapacity())));cout<<' '<<int(p==nullptr);}
 if(op=="Y"){arrays[id].aliasInstead(a[2]==1?nullptr:alias,a[3]);if(a[2]!=1&&a[3]>0)ak[id]=a[3];}
 if(op=="O"){auto old=arrays[id].getAlias();int32_t cap=917;auto p=arrays[id].orphanOrClone(a[2],cap);cout<<' '<<int(p==nullptr)<<' '<<cap<<' '<<int(p&&p==old);if(p){for(int i=0;i<max(0,min(a[2],ak[id]));++i)cout<<' '<<unsigned(uint8_t(p[i]));ak[id]=40;uprv_free(p);}}
 if(op=="Z"){cout<<' '<<int(&(arrays[id]=std::move(arrays[a[2]]))==&arrays[id]);ak[id]=ak[a[2]];ak[a[2]]=40;}
 cout<<' '<<int(ec);state(*owners[0],known[0]);state(*owners[1],known[1]);arrayState(arrays[0],ak[0]);arrayState(arrays[1],ak[1]);cout<<'\n';}}
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
const sequences = [];
const op =
  /** Encodes one original API call. @param name - Opcode. @param id - Owner. @param error - Initial status. @param x - First argument. @param y - Second argument. @param bytes - Readable input. @param number - Signed64 decimal. @returns Operation. */ (
    name,
    id = 0,
    error = 0,
    x = 0,
    y = 0,
    bytes = [],
    number = "0",
  ) => ({
    op: name,
    args: [id, error, x, y],
    bytes,
    number,
  });
for (const len of [0, 1, 2, 38, 39, 40, 41, 79, 80, 127])
  for (const error of [0, -124, 7]) {
    const bytes = Array.from(
      { length: len },
      /** Seeds initialized source input. @param _ - Unused item. @param i - Index. @returns Byte. */ (
        _,
        i,
      ) => 97 + (i % 26),
    );
    sequences.push([
      op("A", 0, error, 0, len, bytes),
      op("Q"),
      op("P", 0, 0, 0, 0),
      op("Q"),
      op("T", 0, 0, 0),
      op("C"),
      op("N", 0, error, 0, len, bytes),
      op("R", 1, 0, 0),
      op("N", 1, 0, 2, 0),
      op("V", 0, 0, 0, len, bytes),
    ]);
  }
for (const len of [0, 1, 10, 30, 39, 40, 80])
  for (const count of [0, 1, 5, 9]) {
    if (count > len) continue;
    sequences.push([
      op("A", 0, 0, 0, len, Array(len).fill(97)),
      op("S", 0, 0, 0, count),
      op("S", 0, -124, Math.max(0, len - count), count),
    ]);
  }
for (const minimum of [0, 1, 39, 40, 41, 80])
  for (const hint of [0, 1, 39, 40, 80, 160])
    for (const error of [0, -124, 7]) {
      const count = Math.min(minimum, 5),
        bytes = Array(count).fill(0xe9);
      sequences.push([op("G", 0, error, minimum, hint, bytes), op("W", 0, error, count)]);
    }
for (const len of [0, 1, 5, 39, 40])
  for (const capacity of [-1, 0, len, len + 1, len + 4])
    for (const nullDest of [0, 1, 2])
      for (const error of [0, -124, 7])
        sequences.push([
          op("A", 0, 0, 0, len, Array(len).fill(0xff)),
          op("E", 0, error, capacity, nullDest),
        ]);
for (const number of ["0", "1", "-1", "10", "-10", "9223372036854775807", "-9223372036854775808"])
  for (const error of [0, -124, 7]) sequences.push([op("D", 0, error, 0, 0, [], number)]);
for (let c = 0; c < 256; ++c)
  sequences.push([
    op("B", 0, 0, c),
    op("I", 0, 0, 0, 1, [c]),
    op("I", 0, 0, 1, 0, [c]),
    op("I", 0, 0, 2, 0, [c]),
  ]);
sequences.push([
  op("I", 0, 0, 3, 0),
  op("J", 0, 0, 0, 3, [97, 98, 99]),
  op("F"),
  op("F"),
  op("J", 0, 0, 0, 3, [100, 101, 102]),
  op("M", 1, 0, 0),
  op("C", 0),
  op("A", 0, 0, 0, 80, Array(80).fill(65)),
  op("X", 1, 0, 0),
  op("C", 0),
]);
sequences.push([
  op("L", 0, 0, 64, 16),
  op("O", 0, 0, 5),
  op("O", 0, 0, 5),
  op("Y", 0, 0, 0, 32),
  op("L", 0, 0, 12, 32),
  op("Z", 1, 0, 0),
  op("O", 1, 0, 4),
  op("O", 0, 0, 0),
  op("L", 0, 0, 64, 40),
  op("O", 0, 0, -1),
]);
// Empty piece copy retains a stale first byte; owner copy copies it, while the copy constructor appends zero bytes.
sequences.push([
  op("A", 0, 0, 0, 3, [97, 98, 99]),
  op("P", 0, 0, 0, 0),
  op("Q"),
  op("R", 1, 0, 0),
  op("Q", 1),
  op("N", 1, 0, 2, 0),
  op("Q", 1),
]);
for (const capacity of [-1, 0, 1, 39, 40, 41, 80])
  for (const copied of [0, 1, 16, 40, 80])
    for (const length of [-1, 0, 5, 80])
      sequences.push([op("L", 0, 0, capacity, copied), op("O", 0, 0, length)]);
for (const error of [0, -124, 7])
  for (const length of [-2, -1, 0, 1])
    sequences.push([op("A", 0, error, 1, length), op("N", 1, error, 3, length)]);
sequences.push([
  op("N", 0, 0, 1, 0, [97, 0, 98]),
  op("A", 0, 0, 0, -1, [99, 0, 100]),
  op("T", 0, 0, -3),
  op("G"),
  op("W", 0, 0, 40),
]);
const digest = /** Hashes every numeric field. @param row - Snapshot. @returns SHA256. */ (row) =>
  createHash("sha256").update(JSON.stringify(row)).digest("hex");
const hashes = [];
for (let i = 0; i < sequences.length; ++i) {
  const ops = sequences[i],
    input =
      ops
        .map(
          /** Serializes actual source API inputs. @param o - Operation. @returns Native protocol line. */ (
            o,
          ) => `${o.op} ${o.args.join(" ")} ${o.number} ${o.bytes.length} ${o.bytes.join(" ")}`,
        )
        .join("\n") + "\n";
  const lines = execFileSync(prefix, { input, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 })
    .trimEnd()
    .split("\n");
  if (lines.shift() !== "P -128 1 40 /")
    throw Error("Native signed-char/stack/path profile changed");
  const actual = observeCharStrings(ops);
  if (actual.length !== lines.length) throw Error("Row count");
  hashes.push(
    lines.map(
      /** Compares all fields before recording a replay hash. @param line - Original native row. @param j - Operation index. @returns Hash. */ (
        line,
        j,
      ) => {
        const expected = line.slice(2).split(" ").map(Number),
          row = actual[j];
        if (JSON.stringify(expected) !== JSON.stringify(row)) {
          const at = expected.findIndex(
            /** Finds the first actual mismatch. @param v - Original value. @param k - Field. @returns Different. */ (
              v,
              k,
            ) => v !== row[k],
          );
          throw Error(
            `Mismatch seq ${i}, op ${j} ${JSON.stringify(ops[j])} field ${at}: ${expected[at]}/${row[at]} (${expected.length}/${row.length})`,
          );
        }
        return digest(expected);
      },
    ),
  );
}
const sha = /** Hashes a pinned source or binary. @param p - Artifact path. @returns SHA256. */ (
  p,
) => createHash("sha256").update(readFileSync(p)).digest("hex");
writeFileSync(
  "apps/office/src/external/icu/source/common/charstr.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      profile: [-128, 1, 40, "/"],
      scope:
        "Original CharString methods and MaybeStackArray<char,40> storage/ownership transitions. Full initialized fields/logical bytes compare live; original native CPP methods execute from the unchanged library, with header private visibility opened only to observe fields. Native uninitialized tails, moved-from contents, unreadable/overlapping spans, allocator failure/free/stack/thread/physical ABI and invalidated borrows are excluded. Byte-owner test buffers are actual source API inputs. udata_open/path/file orchestration and production iterator/service installation remain pending.",
      sourceHashes: Object.fromEntries(
        [
          "charstr.cpp",
          "charstr.h",
          "cmemory.h",
          "stringpiece.cpp",
          "unicode/stringpiece.h",
          "uinvchar.cpp",
          "unicode/putil.h",
        ].map(
          /** Records actual source hashes. @param p - Relative source path. @returns Hash entry. */ (
            p,
          ) => [p, sha(`${source}/common/${p}`)],
        ),
      ),
      artifacts: Object.fromEntries(
        [`${prefix}.cpp`, prefix, `${build}/lib/libicuuc.a`, `${build}/stubdata/libicudata.a`].map(
          /** Records native artifact hashes. @param p - Artifact path. @returns Hash entry. */ (
            p,
          ) => [p.slice(build.length + 1), sha(p)],
        ),
      ),
      sequences,
      hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Matched ${sequences.length} original byte-owner sequences / ${sequences.reduce(/** Counts full snapshots. @param n - Accumulated rows. @param s - Sequence. @returns Row count. */ (n, s) => n + s.length, 0)} complete initialized snapshots`,
);
