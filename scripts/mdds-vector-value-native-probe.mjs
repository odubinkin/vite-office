/** @fileoverview Captures complete genuine std::vector value ownership over unchanged pinned headers; ordinary tests consume only committed observations. */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
const sources = verifyMddsSources();
const target = "output/playwright/mdds-vector-value-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-vector-value-cases.json";
mkdirSync(target, { recursive: true });
const driver = String.raw`
#include <mdds/multi_type_vector/types.hpp>
#include <iostream>
#include <vector>
#include <type_traits>
static int seq=0;
template<bool NoThrow> struct V {
 int id, value;
 explicit V(int value):id(++seq),value(value){ std::cout<<"new "<<id<<" "<<value<<"\n"; }
 V(const V& x):id(++seq),value(x.value){ std::cout<<"copy "<<x.id<<" "<<id<<" "<<value<<"\n"; }
 V(V&& x) noexcept(NoThrow):id(++seq),value(x.value){std::cout<<"move "<<x.id<<" "<<id<<" "<<value<<"\n";x.value=-1;}
 V& operator=(const V& x){std::cout<<"assign "<<id<<" "<<x.id<<" "<<x.value<<"\n";value=x.value;return *this;}
 V& operator=(V&& x) noexcept {std::cout<<"moveassign "<<id<<" "<<x.id<<" "<<x.value<<"\n";value=x.value;x.value=-1;return *this;}
 ~V(){std::cout<<"delete "<<id<<" "<<value<<"\n";}
 bool operator==(const V& x)const{return value==x.value;}
};
struct Plain { int value; };
static_assert(std::is_default_constructible_v<std::vector<Plain>>);
static_assert(std::is_nothrow_move_constructible_v<V<true>>);
static_assert(!std::is_nothrow_move_constructible_v<V<false>>);
template<class T> void snap(const char* label,const std::vector<T>& v){
 std::cout<<label<<" "<<v.size()<<" "<<v.capacity();
 for(const auto& x:v)std::cout<<" "<<x.id<<":"<<x.value;
 std::cout<<"\n";
}
template<bool NoThrow> void run(){
 using T=V<NoThrow>;seq=0;std::cout<<"case "<<NoThrow<<"\n";
 T input[5]={T(10),T(20),T(30),T(40),T(50)};
 {
 std::vector<T>a(input,input+3);snap("range",a);
 a.reserve(3);a.reserve(8);snap("reserve",a);
 a.insert(a.begin()+1,input+3,input+5);snap("insert_equal_tail",a);
 a.insert(a.begin(),input,input);snap("insert_empty",a);
 a.push_back(input[0]);a.push_back(a[1]);a.push_back(input[1]);a.push_back(a[0]);snap("alias_push",a);
 a.insert(a.begin()+2,input+1,input+3);snap("insert_short",a);
 a.erase(a.begin()+1,a.begin()+4);snap("erase",a);
 a.pop_back();a[0]=input[4];snap("set",a);
 std::vector<T>b(a);snap("copy",b);
 std::cout<<"equal "<<(a==b)<<"\n";
 b[0]=input[0];std::cout<<"equal "<<(a==b)<<"\n";
 b.pop_back();std::cout<<"equal "<<(a==b)<<"\n";
 b.assign(input,input+2);snap("assign_short",b);
 b.assign(input,input+5);snap("assign_grow",b);
 b.reserve(5);b.assign(input,input);snap("assign_empty",b);
 b=a;b=b;snap("copyassign",b);
 std::vector<T>small(input,input+1);small=a;snap("copyassign_allocate",small);
 std::vector<T>moved(std::move(b));snap("moved",moved);snap("moved_source",b);
 small=std::move(moved);snap("moveassign",small);snap("moveassign_source",moved);
 a.swap(small);snap("swap_a",a);snap("swap_b",small);
 a.clear();small.clear();snap("cleared",a);
 std::vector<T>d(input,input+1);d.reserve(10);
 d.insert(d.begin(),input+1,input+5);snap("insert_long",d);
 d.erase(d.begin(),d.begin());snap("erase_empty",d);
 std::vector<T>empty;empty.push_back(std::move(input[2]));snap("rvalue",empty);
 empty.push_back(input[0]);snap("push_reallocate",empty);
 empty.insert(empty.begin()+1,input,input+5);snap("insert_allocate",empty);
 empty=std::move(empty);snap("selfmove",empty);
 std::vector<T>wide(input,input+4);wide.insert(wide.begin()+2,input,input+3);snap("insert_wide",wide);
 wide.reserve(12);wide.insert(wide.end(),input,input+1);snap("insert_end",wide);
 }
 std::cout<<"inputs\n";
}
int main(){run<true>();run<false>();}
`;
writeFileSync(target + "/driver.cpp", driver);
const commands = [],
  outputs = {};
for (const variant of ["normal", "asan"]) {
  const binary = target + "/" + variant;
  const argv = [
    "-std=c++20",
    "-g",
    "-O1",
    "-I" + sources.reference + "/include",
    "-I" + sources.target + "/boost_1_91_0",
    target + "/driver.cpp",
    "-o",
    binary,
  ];
  if (variant === "asan")
    argv.splice(3, 0, "-fsanitize=address,undefined", "-fno-omit-frame-pointer");
  for (const [command, args] of [
    ["clang++", argv],
    [binary, []],
  ]) {
    const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    commands.push({
      command,
      argv: args,
      exitCode: result.status,
      signal: result.signal,
      stdoutHash: digest(result.stdout ?? ""),
      stderrHash: digest(result.stderr ?? ""),
    });
    writeFileSync(
      binary + "." + (command === "clang++" ? "compile" : "run") + ".stderr",
      result.stderr ?? "",
    );
    if (result.status !== 0 || result.signal)
      throw Error("Original value caller failed: " + command + "\n" + result.stderr);
    if (command !== "clang++") {
      if (result.stderr) throw Error("Original value caller produced diagnostics");
      outputs[variant] = result.stdout;
      writeFileSync(binary + ".stdout", result.stdout);
    }
  }
}
if (outputs.normal !== outputs.asan) throw Error("Instrumented original lifetime stream differs");
const document = {
  baselineCommit: sources.pinned,
  archiveHashes: sources.archiveHashes,
  sourceHashes: sources.sourceHashes,
  driverHash: digest(driver),
  target: "whole unchanged mdds3.2.1 headers; host clang++ libc++; normal and ASan/UBSan",
  output: outputs.normal,
};
writeFileSync(
  target + "/manifest.json",
  JSON.stringify({ ...document, commands, state: "captured" }, null, 2) + "\n",
);
if (process.argv.includes("--write"))
  writeFileSync(fixture, JSON.stringify(document, null, 2) + "\n");
else if (!isDeepStrictEqual(document, JSON.parse(readFileSync(fixture, "utf8"))))
  throw Error("Complete original managed fixture differs");
console.log(
  "Complete original vector value streams: " +
    Buffer.byteLength(outputs.normal) +
    " bytes; " +
    commands.length +
    " positive commands.",
);
