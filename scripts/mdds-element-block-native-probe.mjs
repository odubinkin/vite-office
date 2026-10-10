/** @fileoverview Optional genuine pinned scalar element block comparison; ordinary tests consume committed portable outputs. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/mdds-native";
const reference = "vendor/mdds-reference";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-element-block-cases.json";
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
    "global.hpp",
    "multi_type_vector/types.hpp",
    "multi_type_vector/types_util.hpp",
    "multi_type_vector/delayed_delete_vector.hpp",
    "multi_type_vector/standard_element_blocks.hpp",
    "multi_type_vector/block_funcs.hpp",
    "multi_type_vector/macro.hpp",
    "multi_type_vector/util.hpp",
  ].map(
    /** Hashes the unchanged compiler source. @param file - Header. @returns Path and digest. */
    (file) => [file, digest(readFileSync(`${reference}/include/mdds/${file}`))],
  ),
);
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
/** Adds all original scalar specializations. @param operations - Commands. @returns Nothing. */
function add(operations) {
  for (const kind of kinds) cases.push({ kind, operations });
}
const base = [
  ["F", 0, 6, "1"],
  ["F", 1, 8, "4"],
  ["V", 0, 1, "2"],
  ["V", 0, 2, "3"],
  ["E", 0, 0],
];
for (let start = 0; start <= 5; ++start) {
  for (let len = 0; len <= 5 - start; ++len) {
    for (const op of ["L", "J", "K"])
      add([...base, [op, 1, 0, start, len], ["G", 0, 0], ["O", 0, 0, 5]]);
    for (const op of ["U", "T", "Y", "D", "I"])
      add([...base, op === "U" || op === "I" ? [op, 1, 1, 0, start, len] : [op, 1, 0, start, len]]);
    add([...base, ["X", 0, start, len], ["P", 0, "7"], ["B", 0, "9"]]);
    add([...base, ["S", 0, 1, start, 0, len]]);
    add([...base, ["S", 0, 0, 0, start, len]]);
  }
  for (const count of [0, 1, 2, 3, 4, 8, 9, 63, 64, 65, 130])
    add([...base, ["Z", 0, count], ["R", 0, count + 3], ["H", 0], ["Q", 1, 0], ["W", 1, 0]]);
}
for (const op of ["A", "Q", "W"])
  add([...base, [op, 1, 0], ["M", 1, "11"], ["p", 1], ["d", 1, "8"]]);
add([
  ["N", 0],
  ["C", 1, 3],
  ["F", 0, 2, "255"],
  ["P", 0, "65537"],
  ["B", 0, "-1"],
  ["V", 0, 0, "32769"],
  ["c", 1, 0, 1, 2],
]);
for (const kind of ["float", "double"])
  cases.push({
    kind,
    operations: [
      ["F", 0, 2, "0.1"],
      ["V", 0, 1, "-3.25"],
      ["P", 0, "10.1"],
      ["c", 1, 0, 0, 3],
    ],
  });
for (const kind of ["int64", "uint64"])
  cases.push({
    kind,
    operations: [
      ["F", 0, 3, "9007199254740995"],
      ["V", 0, 1, "-9007199254740997"],
      ["c", 1, 0, 0, 3],
    ],
  });
const driver = `
#define MDDS_MULTI_TYPE_VECTOR_DEBUG 1
#include <mdds/multi_type_vector/standard_element_blocks.hpp>
#include <iostream>
#include <iomanip>
#include <memory>
#include <type_traits>
template<class T>T value(const std::string& text){if constexpr(std::is_same_v<T,std::string>)return text;else if constexpr(std::is_integral_v<T>)return static_cast<T>(std::stoll(text));else return static_cast<T>(std::stod(text));}
template<class T>void print(T v){if constexpr(std::is_same_v<T,std::string>||(std::is_integral_v<T>&&sizeof(T)==8))std::cout<<'"'<<v<<'"';else if constexpr(std::is_same_v<T,bool>)std::cout<<(v?"true":"false");else std::cout<<+v;}
template<class T,class It>void array(It first,It last){std::cout<<"[";bool comma=false;for(;first!=last;++first){if(comma)std::cout<<",";comma=true;print<T>(*first);}std::cout<<"]";}
template<class B>void snapshot(const B& b){using T=typename B::value_type;const auto& constBase=static_cast<const mdds::mtv::base_element_block&>(b);std::cout<<"["<<mdds::mtv::get_block_type(b)<<","<<B::size(b)<<","<<B::capacity(b)<<",";array<T>(B::cbegin(b),B::cend(b));std::cout<<",";array<T>(B::crbegin(b),B::crend(b));std::cout<<",";auto range=B::range(b);array<T>(range.begin(),range.end());std::cout<<",";if constexpr(std::is_same_v<T,bool>)std::cout<<"null";else{std::cout<<"[";for(size_t i=0;i<B::size(b);++i){if(i)std::cout<<",";print<T>(B::at(constBase,i));}std::cout<<"]";}std::cout<<"]";}
template<class B>void mixed_run(){std::vector<double> values{125.5,0.1,3.25};auto first=values.begin(),last=values.end();std::unique_ptr<B> a(B::create_block_with_values(first,last));std::cout<<"[";snapshot(*a);B::set_values(*a,0,first,last);std::cout<<",";snapshot(*a);B::append_values(*a,first,last);std::cout<<",";snapshot(*a);B::prepend_values(*a,first,last);std::cout<<",";snapshot(*a);B::insert_values(*a,2,first,last);std::cout<<",";snapshot(*a);B::assign_values(*a,first,last);std::cout<<",";snapshot(*a);std::cout<<"]";}
template<class B>void run(int count){using T=typename B::value_type;std::unique_ptr<B> a[2]={std::make_unique<B>(),std::make_unique<B>()};std::cout<<"[";
for(int index=0;index<count;++index){char op;int t;std::cin>>op>>t;bool hasValue=false;T out{};bool hasPair=false;T out2{};
if(op=='F'){int n;std::string v;std::cin>>n>>v;a[t].reset(B::create_block_with_value(n,value<T>(v)));}
else if(op=='C'){int n;std::cin>>n;a[t].reset(B::create_block(n));}
else if(op=='N')a[t]=std::make_unique<B>();
else if(op=='P'||op=='M'||op=='B'){std::string v;std::cin>>v;T item=value<T>(v);if(op=='P')B::append_value(*a[t],item);else if(op=='M')B::emplace_back_value(*a[t],item);else B::prepend_value(*a[t],item);}
else if(op=='V'){int pos;std::string v;std::cin>>pos>>v;B::set_value(*a[t],pos,value<T>(v));}
else if(op=='G'){int pos;std::cin>>pos;hasPair=true;out=B::get_value(*a[t],pos);B::get_value(*a[t],pos,out2);}
else if(op=='E'){int pos;std::cin>>pos;B::erase_value(*a[t],pos);}
else if(op=='X'||op=='O'){int pos,len;std::cin>>pos>>len;if(op=='X')B::erase_values(*a[t],pos,len);else B::overwrite_values(*a[t],pos,len);}
else if(op=='Z'||op=='R'){int n;std::cin>>n;if(op=='Z')B::resize_block(*a[t],n);else B::reserve(*a[t],n);}
else if(op=='H')B::shrink_to_fit(*a[t]);else if(op=='p')B::print_block(*a[t]);
else if(op=='d'){std::string v;std::cin>>v;hasValue=true;if constexpr(std::is_same_v<T,bool>){auto it=B::begin(*a[t]);out=*it;*it=value<T>(v);}else{auto ptr=B::data(*a[t]);out=*ptr;*ptr=value<T>(v);}}
else if(op=='A'||op=='Q'||op=='W'){int s;std::cin>>s;if(op=='A')B::append_block(*a[t],*a[s]);else if(op=='Q')a[t].reset(B::copy_block(*a[s]));else a[t].reset(B::clone_block(*a[s]));}
else if(op=='S'){int s,p1,p2,len;std::cin>>s>>p1>>p2>>len;B::swap_values(*a[t],*a[s],p1,p2,len);}
else if(op=='L'||op=='J'||op=='K'){int s,pos,len;std::cin>>s>>pos>>len;if(op=='L')B::append_values_from_block(*a[t],*a[s],pos,len);else if(op=='J')B::assign_values_from_block(*a[t],*a[s],pos,len);else B::prepend_values_from_block(*a[t],*a[s],pos,len);}
else{int pos=0,s,start,len;if(op=='U'||op=='I')std::cin>>pos;std::cin>>s>>start>>len;auto first=B::cbegin(*a[s])+start,last=first+len;if(op=='U')B::set_values(*a[t],pos,first,last);else if(op=='T')B::append_values(*a[t],first,last);else if(op=='Y')B::prepend_values(*a[t],first,last);else if(op=='D')B::assign_values(*a[t],first,last);else if(op=='I')B::insert_values(*a[t],pos,first,last);else if(op=='c')a[t].reset(B::create_block_with_values(first,last));else std::abort();}
if(index)std::cout<<",";std::cout<<"[";if(hasPair){std::cout<<"[";print<T>(out);std::cout<<",";print<T>(out2);std::cout<<"]";}else if(hasValue)print<T>(out);else std::cout<<"null";std::cout<<",";snapshot(*a[0]);std::cout<<",";snapshot(*a[1]);std::cout<<","<<(B::equal_block(*a[0],*a[1])?"true":"false")<<","<<((*a[0]!=*a[1])?"true":"false")<<"]";
}std::cout<<"]\\n";B::delete_block(a[0].release());B::delete_block(a[1].release());B::delete_block(nullptr);}
int main(int argc,char**argv){std::cout<<std::setprecision(17);using namespace mdds::mtv;if(argc>1){std::string mode=argv[1];double_element_block a(5);uint16_element_block foreign(5);if(mode=="--mixed-range"){std::cout<<"[";
${kinds
  .filter(
    /** Selects native scalar families with supported mixed double conversion. @param kind - Alias. @returns Whether selected. */ (
      kind,
    ) => !["string", "int64", "uint64"].includes(kind),
  )
  .map(
    /** Emits the original mixed-range specialization call. @param kind - Alias. @param index - Position. @returns Driver syntax. */
    (kind, index) =>
      `${index ? 'std::cout<<",";' : ""}std::cout<<"[\\"${kind}\\",";mixed_run<${kind}_element_block>();std::cout<<"]";`,
  )
  .join("\n")}
std::cout<<"]";return 0;}if(mode=="--wrong-type"){try{double_element_block::get(foreign);}catch(const mdds::general_error& e){std::cout<<e.what();return 0;}}else if(mode=="--bounds-one")double_element_block::swap_values(a,a,4,0,2);else if(mode=="--bounds-two")double_element_block::swap_values(a,a,0,4,2);else if(mode=="--range-bounds")double_element_block::append_values_from_block(a,a,0,6);return 3;}
std::string kind;int count;while(std::cin>>kind>>count){
${kinds.map(/** Emits original scalar specialization dispatch. @param kind - Alias. @param index - Position. @returns Driver syntax. */ (kind, index) => `${index ? "else " : ""}if(kind=="${kind}")run<${kind}_element_block>(count);`).join("\n")}
}}
`;
const driverPath = `${target}/element-block.cpp`,
  binary = `${target}/element-block`;
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
if (process.argv.includes("--bool-at")) {
  const constSource = `${target}/element-block-bool-const-at.cpp`,
    mutableSource = `${target}/element-block-bool-mutable-at.cpp`;
  writeFileSync(
    mutableSource,
    "#include <mdds/multi_type_vector/standard_element_blocks.hpp>\nint main(){mdds::mtv::boolean_element_block b(1);mdds::mtv::boolean_element_block::at(b,0)=true;}\n",
  );
  let rejected = false;
  try {
    execFileSync(
      "clang++",
      [
        "-std=c++20",
        `-I${reference}/include`,
        "-c",
        mutableSource,
        "-o",
        `${target}/element-block-bool-mutable-at.o`,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    writeFileSync(`${target}/element-block-bool-mutable-at.log`, error.stderr);
    if (!String(error.stderr).includes("cannot bind")) throw error;
    rejected = true;
  }
  if (!rejected) throw new Error("Original mutable bool at unexpectedly compiled.");
  writeFileSync(
    constSource,
    "#include <mdds/multi_type_vector/standard_element_blocks.hpp>\n__attribute__((noinline,optnone)) const bool* observe(const mdds::mtv::base_element_block& b){return &mdds::mtv::boolean_element_block::at(b,0);}\nint main(){const mdds::mtv::boolean_element_block b(1,true);const bool* p=observe(b);volatile bool value=*p;return value?0:1;}\n",
  );
  const constBinary = `${target}/element-block-bool-const-at`;
  const compile = spawnSync(
    "clang++",
    [
      "-std=c++20",
      "-g",
      "-O1",
      "-fsanitize=address,undefined",
      "-fno-omit-frame-pointer",
      `-I${reference}/include`,
      constSource,
      "-o",
      constBinary,
    ],
    { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" },
  );
  writeFileSync(`${target}/element-block-bool-const-at-compile.log`, compile.stderr);
  if (compile.status !== 0) throw new Error(compile.stderr);
  let diagnosed = false;
  try {
    execFileSync(constBinary, [], {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 2000,
      env: { ...process.env, ASAN_OPTIONS: "detect_stack_use_after_return=1" },
    });
  } catch (error) {
    writeFileSync(`${target}/element-block-bool-const-at.log`, error.stderr);
    if (!/stack-use-after-(return|scope)/.test(String(error.stderr))) throw error;
    diagnosed = true;
  }
  if (!diagnosed)
    throw new Error(
      "Original const bool at did not produce the expected isolated lifetime diagnostic.",
    );
  console.log(
    "Original mutable bool at compile rejection and const bool at ASan lifetime diagnostic reproduced; no successful result assigned.",
  );
} else if (process.argv.includes("--assertions")) {
  for (const mode of ["--bounds-one", "--bounds-two", "--range-bounds"]) {
    let failed = false;
    try {
      execFileSync(binary, [mode], { timeout: 2000, stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      writeFileSync(`${target}/element-block-${mode.slice(2)}.log`, error.stderr);
      if (error.signal !== "SIGABRT") throw error;
      failed = true;
    }
    if (!failed) throw new Error(`Original bounds assertion did not fail: ${mode}`);
  }
  const message = execFileSync(binary, ["--wrong-type"], { encoding: "utf8" });
  if (message !== "incorrect block type: expected block type=10, passed block type=4")
    throw new Error(message);
  writeFileSync(`${target}/element-block-wrong-type.log`, message);
  console.log("Original isolated three bounds assertions and debug type diagnostic pass.");
} else {
  const input = cases
    .map(
      /** Serializes native case inputs. @param item - Case. @returns Input. */
      ({ kind, operations }) =>
        `${kind} ${operations.length}\n${operations.map(/** Serializes one operation. @param op - Fields. @returns Input line. */ (op) => op.join(" ")).join("\n")}`,
    )
    .join("\n");
  const raw = execFileSync(binary, {
    input,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    timeout: 30_000,
  });
  writeFileSync(`${target}/element-block-output.jsonl`, raw);
  const results = raw
    .trim()
    .split("\n")
    .map(
      /** Parses complete original step output. @param line - Native JSON. @returns Steps. */ (
        line,
      ) => JSON.parse(line),
    );
  const snapshots = [],
    ids = new Map();
  const output = results.map(
    /** Interns losslessly complete case observations. @param steps - Case. @returns Encoded steps. */ (
      steps,
    ) =>
      steps.map(
        /** Retains both full owner snapshots and every result. @param step - Native step. @returns Encoded step. */ ([
          result,
          a,
          b,
          equal,
          notEqual,
        ]) => [
          result,
          ...[a, b].map(
            /** Reuses only identical complete owner observations. @param snapshot - Owner state. @returns Index. */ (
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
          notEqual,
        ],
      ),
  );
  const document = {
    baselineCommit: pinned,
    archiveHashes,
    sourceHashes,
    driverHash: digest(driver),
    target: "host clang++ libc++ ASan UBSan debug get; production no-op print",
    snapshots,
    mixed: JSON.parse(execFileSync(binary, ["--mixed-range"], { encoding: "utf8" })),
    cases: cases.map(
      /** Pairs every input and complete original result. @param item - Case. @param index - Position. @returns Replay case. */ (
        item,
        index,
      ) => ({ ...item, steps: output[index] }),
    ),
  };
  if (process.argv.includes("--write"))
    writeFileSync(fixture, `${JSON.stringify(document, null, 2)}\n`);
  else if (JSON.stringify(document) !== JSON.stringify(JSON.parse(readFileSync(fixture))))
    throw new Error("Original element block fixture differs.");
  console.log(
    `Original scalar blocks: ${cases.length} sequences, ${results.reduce(/** Counts every observed native step. @param count - Total. @param steps - Case. @returns New total. */ (count, steps) => count + steps.length, 0)} complete steps, ${snapshots.length} full interned owner snapshots.`,
  );
}
