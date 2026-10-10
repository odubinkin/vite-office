/** @fileoverview Optional genuine pinned mdds/Boost native comparison; ordinary tests consume committed portable outputs. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, openSync, closeSync } from "node:fs";
import path from "node:path";

const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/mdds-native";
const reference = "vendor/mdds-reference";
const fixture = "apps/office/src/external/mdds/include/mdds/native-flat-segment-cases.json";
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
  [
    "flat_segment_tree.hpp",
    "flat_segment_tree_def.inl",
    "flat_segment_tree_itr.hpp",
    "node.hpp",
    "ref_pair.hpp",
    "global.hpp",
  ].map(
    /** Records complete original patched header bytes. @param file - Header. @returns Path/digest. */
    (file) => [file, digest(readFileSync(`${reference}/include/mdds/${file}`))],
  ),
);
sourceHashes["test/flat_segment_tree/test_main.cpp"] = digest(
  readFileSync(`${reference}/test/flat_segment_tree/test_main.cpp`),
);
const cases = [];
/** Adds initialized command sequences for both Calc value specializations. @param operations - Commands. @param initial - Default value. @param bounds - Explicit native bounds. @returns Nothing. */
function add(operations, initial = 0, bounds = [0, 8]) {
  for (const kind of ["number", "boolean"]) cases.push({ kind, initial, bounds, operations });
}
const base = [
  ["F", 0, 1, 3, 1],
  ["B", 0, 4, 6, 2],
  ["T", 0],
];
for (const start of [-2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10])
  for (const end of [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10]) {
    if (start < 0 && end === 0) continue; // Original clipped-zero-span null access is undefined.
    for (const op of ["F", "B", "I"])
      for (const value of [0, 1, 2])
        add([...base, op === "I" ? [op, 0, start, end, value, 3] : [op, 0, start, end, value]]);
    add([...base, ["L", 0, start, end]]);
  }
for (const pos of [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const amount of [-1, 0, 1, 2, 7, 8, 12])
    for (const skip of [0, 1]) add([...base, ["R", 0, pos, amount, skip]]);
for (const hint of [0, 1, 2, 3, 4])
  add([...base, ["I", 0, 2, 5, 2, hint], ["T", 0], ["I", 0, 2, 5, 2, hint]]);
for (const op of ["C", "A", "V", "W", "S"])
  for (const targetTree of [0, 1])
    add([...base, ["F", 1, 0, 8, 3], ["T", 1], [op, targetTree, 0], ["T", targetTree]]);
add([...base, ["E", 0], ["E", 0], ["T", 0]]);
add([], 3);
// Additional initialized adjacent and alternating interval patterns.
add(
  [
    ["F", 0, 0, 2, 1],
    ["F", 0, 2, 4, 1],
    ["B", 0, 6, 8, 1],
    ["T", 0],
    ["L", 0, 0, 8],
  ],
  2,
);
add(
  [
    ["F", 0, 1, 2, 1],
    ["F", 0, 3, 4, 2],
    ["F", 0, 5, 6, 3],
    ["T", 0],
    ["R", 0, 0, 1, 0],
  ],
  2,
);
add([
  ["F", 0, 4, 8, 1],
  ["T", 0],
  ["L", 0, 1, 2],
]);
add([
  ["F", 0, 0, 8, 1],
  ["T", 0],
  ["L", 0, 6, 7],
]);
for (const size of [2, 8])
  for (const skip of [0, 1])
    add([
      ["F", 0, 0, 8, 1],
      ["T", 0],
      ["R", 0, 0, size, skip],
    ]);
// Exact original fst_test_shift_right_bool and skip_start_node coordinates.
add(
  [
    ["F", 0, 3, 7, 1],
    ["T", 0],
    ["R", 0, 1, 1, 0],
    ["T", 0],
  ],
  0,
  [0, 1048576],
);
add(
  [
    ["F", 0, 3, 7, 5],
    ["T", 0],
    ["R", 0, 3, 2, 1],
    ["T", 0],
    ["F", 0, 0, 4, 2],
    ["T", 0],
    ["R", 0, 0, 2, 1],
    ["T", 0],
  ],
  0,
  [0, 1048576],
);
add(
  [
    ["F", 0, 10, 20, 5],
    ["F", 0, 15, 30, 5],
    ["F", 0, 30, 50, 5],
    ["F", 0, 8, 11, 5],
    ["F", 0, 5, 8, 5],
  ],
  -1,
  [0, 100],
);
let seed = 321;
/** Generates bounded deterministic operations. @param bound - Exclusive bound. @returns Integer. */
function random(bound) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % bound;
}
for (let i = 0; i < 128; ++i) {
  const ops = [];
  for (let j = 0; j < 16; ++j) {
    const start = random(8),
      end = start + 1 + random(8 - start),
      value = random(4);
    ops.push([j % 2 ? "B" : "F", 0, start, end, value]);
    if (j % 4 === 0) ops.push(["T", 0]);
  }
  add(ops, i % 4);
}
const driver = `
#define MDDS_UNIT_TEST
#include <mdds/flat_segment_tree.hpp>
#include <memory>
template<class T> using Tree=mdds::flat_segment_tree<int32_t,T>;
template<class T> auto hint(Tree<T>& a, Tree<T>& foreign, int n) {
 typename Tree<T>::const_iterator it;
 if(n==1)it=a.begin();else if(n==2)it=a.end();else if(n==3){it=a.end();--it;--it;}else if(n==4)it=foreign.begin();
 return it;
}
template<class T> void iterator(Tree<T>& a,typename Tree<T>::const_iterator it) {
 std::cout<<"["<<(it==a.end())<<","<<(*it).first<<","<<(*it).second<<"]";
}
template<class T> void snapshot(Tree<T>& a,Tree<T>& foreign) {
 std::cout<<"["<<a.valid_tree()<<","<<a.default_value()<<","<<a.leaf_size();
 if(a.leaf_size()==1){std::cout<<",null]";return;}
 std::cout<<",[";bool first=true;
 for(auto it=a.begin();it!=a.end();++it){if(!first)std::cout<<",";first=false;std::cout<<"["<<(*it).first<<","<<(*it).second<<"]";}
 std::cout<<"],[";first=true;
 for(auto it=a.rbegin();it!=a.rend();++it){if(!first)std::cout<<",";first=false;std::cout<<"["<<(*it).first<<","<<(*it).second<<"]";}
 std::cout<<"],[";first=true;
 for(auto it=a.begin_segment();it!=a.end_segment();++it){if(!first)std::cout<<",";first=false;std::cout<<"["<<it->start<<","<<it->end<<","<<it->value<<"]";}
 std::cout<<"],[";
 for(int key=-1;key<=9;++key){if(key!=-1)std::cout<<",";std::cout<<"[";
  for(int mode=0;mode<7;++mode){if(mode)std::cout<<",";T value=static_cast<T>(77);int32_t start=-71,end=-72;
   auto result=mode==0?a.search(key,value,&start,&end):mode==1?a.search_tree(key,value,&start,&end):a.search(hint(a,foreign,mode-2),key,value,&start,&end);
   std::cout<<"["<<result.second<<","<<value<<","<<start<<","<<end<<",";iterator(a,result.first);std::cout<<"]";
  }
  std::cout<<",[";iterator(a,a.search(key));std::cout<<",";iterator(a,a.search_tree(key));
  for(int n=0;n<5;++n){std::cout<<",";iterator(a,a.search(hint(a,foreign,n),key));}std::cout<<"]]";
 }
 std::cout<<"]]";
}
template<class T> void run(size_t count,int initial,int min,int max) {
 std::unique_ptr<Tree<T>> a[2]={std::make_unique<Tree<T>>(min,max,static_cast<T>(initial)),std::make_unique<Tree<T>>(min,max,static_cast<T>(3))};
 Tree<T> foreign(0,8,static_cast<T>(3));foreign.insert_front(2,5,static_cast<T>(2));
 std::cout<<"[";
 for(size_t j=0;j<count;++j){char op;int t;std::cin>>op>>t;bool insertion=false;std::pair<typename Tree<T>::const_iterator,bool> result;
  if(op=='F'||op=='B'||op=='I'){int s,e,v,h=0;std::cin>>s>>e>>v;if(op=='I')std::cin>>h;insertion=true;
   result=op=='F'?a[t]->insert_front(s,e,static_cast<T>(v)):op=='B'?a[t]->insert_back(s,e,static_cast<T>(v)):a[t]->insert(hint(*a[t],foreign,h),s,e,static_cast<T>(v));}
  else if(op=='T')a[t]->build_tree();else if(op=='E')a[t]->clear();
  else if(op=='L'){int s,e;std::cin>>s>>e;a[t]->shift_left(s,e);}
  else if(op=='R'){int p,n;bool skip;std::cin>>p>>n>>skip;a[t]->shift_right(p,n,skip);}
  else {int s;std::cin>>s;if(op=='C')a[t]=std::make_unique<Tree<T>>(*a[s]);else if(op=='A')*a[t]=*a[s];else if(op=='V')a[t]=std::make_unique<Tree<T>>(std::move(*a[s]));else if(op=='W')*a[t]=std::move(*a[s]);else if(op=='S')a[t]->swap(*a[s]);else std::abort();}
  if(j)std::cout<<",";std::cout<<"[";
  if(insertion){std::cout<<"["<<result.second<<",";iterator(*a[t],result.first);std::cout<<"]";}else std::cout<<"null";
  std::cout<<",";snapshot(*a[0],foreign);std::cout<<",";snapshot(*a[1],foreign);std::cout<<","<<(*a[0]==*a[1])<<"]";
 }
 // Constructor observation even for a zero-command sequence.
 if(!count){std::cout<<"[null,";snapshot(*a[0],foreign);std::cout<<",";snapshot(*a[1],foreign);std::cout<<","<<(*a[0]==*a[1])<<"]";}
 std::cout<<"]";
}
int main(int argc,char**) {
 if(argc>1){Tree<int> t(0,8,0);t.insert_front(-1,0,1);return 0;}
 std::cout<<std::boolalpha;size_t total;std::cin>>total;std::cout<<"[";
 for(size_t i=0;i<total;++i){int kind,initial,min,max;size_t count;std::cin>>kind>>initial>>min>>max>>count;if(i)std::cout<<",";if(kind)run<bool>(count,initial,min,max);else run<int>(count,initial,min,max);}
 std::cout<<"]";
}
`;
const cpp = `${target}/flat-segment-original.cpp`,
  binary = `${target}/flat-segment-original`;
writeFileSync(cpp, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    "-I",
    `${reference}/include`,
    "-I",
    `${target}/boost_1_91_0`,
    cpp,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const input = [String(cases.length)];
for (const state of cases) {
  input.push(
    `${Number(state.kind === "boolean")} ${state.initial} ${state.bounds.join(" ")} ${state.operations.length}`,
  );
  for (const operation of state.operations) input.push(operation.join(" "));
}
writeFileSync(`${target}/input.txt`, input.join("\n"));
const inputFd = openSync(`${target}/input.txt`, "r"),
  outputFd = openSync(`${target}/output.json`, "w");
try {
  execFileSync(path.resolve(binary), { stdio: [inputFd, outputFd, "inherit"] });
} finally {
  closeSync(inputFd);
  closeSync(outputFd);
}
const outputs = JSON.parse(readFileSync(`${target}/output.json`, "utf8"));
const snapshots = [],
  snapshotIndexes = new Map();
/** Deduplicates identical full native observations without discarding any fields. @param snapshot - Native observation. @returns Shared fixture index. */
function snapshotIndex(snapshot) {
  const serialized = JSON.stringify(snapshot);
  if (snapshotIndexes.has(serialized)) return snapshotIndexes.get(serialized);
  const index = snapshots.length;
  snapshots.push(snapshot);
  snapshotIndexes.set(serialized, index);
  return index;
}
const result = {
  baselineCommit: pinned,
  archiveHashes,
  patchHash: digest(patch),
  sourceHashes,
  snapshots,
  cases: cases.map(
    /** Attaches original compiled observations. @param state - Initialized inputs. @param i - Case index. @returns Portable case. */
    (state, i) => ({
      ...state,
      output: outputs[i].map(
        /** Shares repeated native snapshots while retaining every operation result. @param observation - Native step. @returns Portable observation. */
        ([insert, a, b, equal]) => [insert, snapshotIndex(a), snapshotIndex(b), equal],
      ),
    }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Original mdds outputs differ from portable fixture.");
} else if (mode === "--suspected-clipping") {
  try {
    execFileSync(path.resolve(binary), ["clip"], { stdio: "pipe" });
    throw new Error("Expected original undefined access was not diagnosed.");
  } catch (error) {
    if (!error.stderr?.toString().includes("Assertion failed: (px != 0)")) throw error;
    writeFileSync(`${target}/suspected-clipping.log`, error.stderr);
  }
} else throw new Error("Usage: --write|--check|--suspected-clipping");
console.log(
  `Pinned mdds3.2.1: ${cases.length} sequences; genuine unchanged patched headers/Boost; ASan/UBSan; ${mode}.`,
);
