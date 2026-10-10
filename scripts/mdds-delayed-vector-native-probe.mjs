/** @fileoverview Optional genuine pinned delayed_delete_vector native comparison; ordinary tests consume committed portable outputs. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/mdds-native";
const reference = "vendor/mdds-reference";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-delayed-vector-cases.json";
/** Hashes exact source bytes. @param bytes - Source. @returns Digest. */
function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
/** Verifies a complete pinned LibreOffice source blob. @param file - Native path. @returns Original bytes. */
function original(file) {
  const bytes = readFileSync(`${upstream}/${file}`);
  if (!bytes.equals(execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`])))
    throw new Error(`Changed pinned LibreOffice source: ${file}`);
  return bytes;
}
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("The native probe requires the exact pinned LibreOffice checkout.");
const downloads = original("download.lst").toString();
const archives = { mdds: "mdds-3.2.1.tar.xz", boost: "boost_1_91_0.tar.xz" };
const archiveHashes = {};
for (const [name, archive] of Object.entries(archives)) {
  const prefix = name.toUpperCase();
  const expected = downloads.match(new RegExp(`${prefix}_SHA256SUM\\s*:?=\\s*([a-f0-9]+)`))?.[1];
  const bytes = readFileSync(`${target}/${archive}`);
  if (!expected || digest(bytes) !== expected || !downloads.includes(archive))
    throw new Error(`Archive differs from pinned download.lst: ${archive}`);
  archiveHashes[name] = expected;
}
// Validate actual compiler inputs against freshly extracted verified archives,
// including the exact original LibreOffice patch. No synthesized native helpers.
const clean = `${target}/verified`;
mkdirSync(clean, { recursive: true });
execFileSync("tar", ["-xf", `${target}/${archives.mdds}`, "-C", clean]);
execFileSync("tar", ["-xf", `${target}/${archives.boost}`, "-C", clean, "boost_1_91_0/boost"]);
const patch = original("external/mdds/gcc-12-silence-use-after-free.patch.1");
execFileSync("patch", ["-d", `${clean}/mdds-3.2.1`, "-p1"], { input: patch });
/** Checks every actual header against verified upstream files. @param actual - Compiler directory. @param expected - Verified directory. @returns Nothing. */
function verifyDirectory(actual, expected) {
  for (const entry of readdirSync(expected, { withFileTypes: true })) {
    const a = path.join(actual, entry.name),
      e = path.join(expected, entry.name);
    if (entry.isDirectory()) verifyDirectory(a, e);
    else if (!readFileSync(a).equals(readFileSync(e)))
      throw new Error(`Changed native dependency: ${a}`);
  }
}
verifyDirectory(`${reference}/include`, `${clean}/mdds-3.2.1/include`);
verifyDirectory(`${target}/boost_1_91_0/boost`, `${clean}/boost_1_91_0/boost`);
const sourceHashes = Object.fromEntries(
  ["types_util.hpp", "delayed_delete_vector.hpp"].map(
    /** Hashes the complete original header. @param file - Header. @returns Path and hash. */
    (file) => [file, digest(readFileSync(`${reference}/include/mdds/multi_type_vector/${file}`))],
  ),
);
const cases = [];
/** Adds all five genuine native scalar template specializations. @param operations - Commands. @returns Nothing. */
function add(operations) {
  for (const kind of ["uint16", "double", "bool", "string", "int64"])
    cases.push({ kind, operations });
}
const base = [
  ["F", 0, 5, 1],
  ["F", 1, 6, 4],
];
for (let pos = 0; pos < 5; ++pos) {
  add([...base, ["E", 0, pos], ["P", 0, 7], ["H", 0], ["T", 0, 0]]);
  for (let len = 0; len <= 5 - pos; ++len)
    add([
      ...base,
      ["E", 0, 0],
      ["G", 0, pos > 3 ? 3 : pos, Math.min(len, 4 - Math.min(pos, 3))],
      ["B", 0, 8],
      ["R", 0, 0],
    ]);
  for (let count = 0; count <= 9; ++count) {
    add([...base, ["E", 0, 0], ["E", 0, 0], ["Z", 0, count], ["P", 0, 8]]);
    add([...base, ["E", 0, 0], ["R", 0, count], ["I", 0, pos, 9], ["H", 0]]);
  }
}
for (let len = 0; len <= 6; ++len)
  for (let pos = 0; pos <= 4; ++pos)
    add([
      ...base,
      ["E", 0, 0],
      ["J", 0, pos, 1, 0, len],
      ["V", 1, 0, 0, len],
      ["A", 0, 1],
      ["A", 0, 0],
    ]);
for (const op of ["C", "A", "S"])
  for (let offset = 0; offset <= 3; ++offset)
    add([
      ...base,
      ...Array.from(
        { length: offset },
        /** Emits original single front removal. @returns Command. */ () => ["E", 0, 0],
      ),
      [op, 0, 1],
      ["S", 0, 0],
      ["R", 0, 0],
      ["H", 1],
    ]);
add([
  ...base,
  ["E", 0, 0],
  ["C", 1, 0],
  ["N", 0, 3],
  ["U", 1, 0, 0, 3],
  ["D", 1, 2, 9],
  ["T", 1, 2],
  ["T", 1, 3],
]);
add([
  ["N", 0, 0],
  ["P", 0, 7],
  ["P", 0, 8],
  ["E", 0, 0],
  ["E", 0, 0],
  ["R", 0, 0],
  ["H", 0],
  ["F", 1, 1, 9],
  ["S", 0, 1],
]);
// Growth across the genuine vector<bool> word boundary, beyond trivial scalar capacity.
add([
  ["N", 0, 64],
  ["P", 0, 1],
  ["E", 0, 0],
  ["Z", 0, 130],
  ["Z", 0, 1],
  ["H", 0],
  ["R", 0, 65],
  ["Z", 0, 66],
]);
for (const count of [0, 1, 63, 64, 65, 127, 128, 129, 192, 257]) {
  add([
    ["N", 0, 64],
    ["P", 0, 1],
    ["Z", 0, count],
    ["R", 0, count + 1],
    ["H", 0],
  ]);
  add([
    ["N", 0, 64],
    ["N", 1, count],
    ["J", 0, 1, 1, 0, count],
    ["V", 1, 0, 0, count + 1],
  ]);
}
add([
  ["N", 0, 4],
  ["D", 0, 0, 1],
  ["D", 0, 1, 2],
  ["D", 0, 2, 3],
  ["D", 0, 3, 4],
  ["N", 1, 4],
  ["D", 1, 0, 7],
  ["D", 1, 1, 8],
  ["D", 1, 2, 9],
  ["D", 1, 3, 10],
  ["E", 0, 0],
  ["K", 0, 1, 31],
  ["Q", 0, 81],
]);
add([
  ["F", 0, 4, 9],
  ["M", 0, 2, 8],
]);
const driver = `
#include <mdds/multi_type_vector/types_util.hpp>
#include <mdds/multi_type_vector/delayed_delete_vector.hpp>
#include <iostream>
#include <memory>
#include <string>
#include <cstdint>
template<class T>using Vec=mdds::mtv::delayed_delete_vector<T>;
template<class T>T value(long long n){if constexpr(std::is_same_v<T,std::string>)return std::to_string(n);else return T(n);}
template<class T>void print(T v){if constexpr(std::is_same_v<T,std::string>||std::is_same_v<T,int64_t>)std::cout<<'"'<<v<<'"';else if constexpr(std::is_same_v<T,bool>)std::cout<<(v?"true":"false");else std::cout<<v;}
template<class T>void snapshot(Vec<T>& a){std::cout<<"["<<a.size()<<","<<a.capacity()<<",[";bool first=true;for(auto it=a.begin();it!=a.end();++it){if(!first)std::cout<<",";first=false;print<T>(*it);}std::cout<<"],[";first=true;for(auto it=a.rbegin();it!=a.rend();++it){if(!first)std::cout<<",";first=false;print<T>(*it);}std::cout<<"]]";}
template<class T>void run(int count){std::unique_ptr<Vec<T>> a[2]={std::make_unique<Vec<T>>(),std::make_unique<Vec<T>>()};std::cout<<"[";
for(int i=0;i<count;++i){char op;int t;std::cin>>op>>t;bool result=false;long long returned=0;bool output=false;T out{};
if(op=='F'){int n;long long v;std::cin>>n>>v;a[t]=std::make_unique<Vec<T>>(n,value<T>(v));}
else if(op=='N'){int n;std::cin>>n;a[t]=std::make_unique<Vec<T>>(n);}
else if(op=='C'||op=='A'||op=='S'){int s;std::cin>>s;if(op=='C')a[t]=std::make_unique<Vec<T>>(*a[s]);else if(op=='A')*a[t]=*a[s];else a[t]->swap(*a[s]);}
else if(op=='P'||op=='B'){long long v;std::cin>>v;if(op=='P')a[t]->push_back(value<T>(v));else a[t]->emplace_back(value<T>(v));}
else if(op=='E'||op=='G'){int pos,len;std::cin>>pos;if(op=='G')std::cin>>len;auto it=op=='E'?a[t]->erase(a[t]->begin()+pos):a[t]->erase(a[t]->begin()+pos,a[t]->begin()+pos+len);result=true;returned=it-a[t]->begin();}
else if(op=='I'||op=='M'){int pos;long long v;std::cin>>pos>>v;const T item=value<T>(v);auto it=op=='I'?a[t]->insert(a[t]->begin()+pos,item):a[t]->insert(typename Vec<T>::const_iterator(a[t]->begin()+pos),value<T>(v));result=true;returned=it-a[t]->begin();}
else if(op=='K'){int pos;long long v;std::cin>>pos>>v;auto it=a[t]->begin()+pos;output=true;out=*it;a[t]->swap(*a[1-t]);*it=value<T>(v);}
else if(op=='Q'){long long v;std::cin>>v;output=true;if constexpr(std::is_same_v<T,bool>){auto it=a[t]->begin();out=*it;*it=value<T>(v);}else{auto p=a[t]->data();out=*p;*p=value<T>(v);}}
else if(op=='J'||op=='U'||op=='V'){int pos=0,s,start,len;if(op=='J')std::cin>>pos;std::cin>>s>>start>>len;auto first=a[s]->begin()+start,last=first+len;if(op=='J')a[t]->insert(a[t]->begin()+pos,first,last);else if(op=='U')a[t]=std::make_unique<Vec<T>>(first,last);else a[t]->assign(first,last);}
else if(op=='Z'||op=='R'){int n;std::cin>>n;if(op=='Z')a[t]->resize(n);else a[t]->reserve(n);}
else if(op=='H')a[t]->shrink_to_fit();
else if(op=='D'){int pos;long long v;std::cin>>pos>>v;(*a[t])[pos]=value<T>(v);}
else if(op=='T'){int pos;std::cin>>pos;output=true;try{out=a[t]->at(pos);}catch(const std::out_of_range&){output=false;result=true;returned=-1;}}
else std::abort();
if(i)std::cout<<",";std::cout<<"[";if(output)print<T>(out);else if(result)std::cout<<returned;else std::cout<<"null";std::cout<<",";snapshot(*a[0]);std::cout<<",";snapshot(*a[1]);std::cout<<","<<(*a[0]==*a[1]?"true":"false")<<"]";
}std::cout<<"]\\n";}
int main(){std::string kind;int n;while(std::cin>>kind>>n){if(kind=="uint16")run<uint16_t>(n);else if(kind=="double")run<double>(n);else if(kind=="bool")run<bool>(n);else if(kind=="string")run<std::string>(n);else run<int64_t>(n);}}
`;
const driverPath = `${target}/delayed-vector.cpp`;
const binary = `${target}/delayed-vector`;
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
    driverPath,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const input = cases
  .map(
    /** Serializes one native case. @param item - Kind and operations. @returns Input text. */
    ({ kind, operations }) =>
      `${kind} ${operations.length}\n${operations.map(/** Serializes command fields. @param op - Operation. @returns Input line. */ (op) => op.join(" ")).join("\n")}`,
  )
  .join("\n");
const raw = execFileSync(binary, {
  input,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
  timeout: 30_000,
});
writeFileSync(`${target}/delayed-vector-output.jsonl`, raw);
const results = raw
  .trim()
  .split("\n")
  .map(
    /** Parses one complete native case result. @param line - JSON. @returns Steps. */ (line) =>
      JSON.parse(line),
  );
const snapshots = [];
const ids = new Map();
const interned = results.map(
  /** Interns snapshots without losing step observations. @param steps - Native case. @returns References. */ (
    steps,
  ) =>
    steps.map(
      /** Retains result and owner snapshots. @param step - Native step. @returns Encoded step. */ ([
        result,
        a,
        b,
        equal,
      ]) => [
        result,
        ...[a, b].map(
          /** Reuses identical complete snapshots. @param snapshot - Public owner state. @returns Snapshot index. */ (
            snapshot,
          ) => {
            const key = JSON.stringify(snapshot);
            if (!ids.has(key)) {
              ids.set(key, snapshots.length);
              snapshots.push(snapshot);
            }
            return ids.get(key);
          },
        ),
        equal,
      ],
    ),
);
const document = {
  baselineCommit: pinned,
  archiveHashes,
  sourceHashes,
  driverHash: digest(driver),
  target: "host clang++ libc++ ASan UBSan",
  snapshots,
  cases: cases.map(
    /** Pairs case inputs with native observations. @param item - Case. @param index - Native index. @returns Complete case. */ (
      item,
      index,
    ) => ({ ...item, steps: interned[index] }),
  ),
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
  throw new Error("Original delayed vector fixture differs.");
console.log(
  `Original delayed_delete_vector: ${cases.length} complete sequences and ${results.reduce(/** Counts every original public snapshot. @param n - Total. @param steps - Case steps. @returns New total. */ (n, steps) => n + steps.length, 0)} full snapshots; genuine headers, ASan/UBSan.`,
);
