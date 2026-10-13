/** @fileoverview Captures complete genuine managed mdds pointer ownership over unchanged pinned headers; ordinary tests consume only committed observations. */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
const sources = verifyMddsSources();
const target = "output/playwright/mdds-managed-native";
const fixture =
  "apps/office/src/external/mdds/include/mdds/multi_type_vector/native-managed-block-cases.json";
mkdirSync(target, { recursive: true });
const driver = String.raw`
#include <mdds/multi_type_vector/types.hpp>
#include <iostream>
#include <map>
#include <algorithm>
#include <type_traits>
using namespace mdds::mtv;
static int seq=0; static std::map<int,struct V*> live;
struct V {
 int id, value;
 V(int value):id(++seq),value(value){ live[id]=this;std::cout<<"new "<<id<<" "<<value<<"\n"; }
 V(const V& x):id(++seq),value(x.value){ live[id]=this;std::cout<<"copy "<<x.id<<" "<<id<<" "<<value<<"\n"; }
 virtual ~V(){ std::cout<<"delete "<<id<<" "<<value<<"\n";live.erase(id); }
 bool operator==(const V& x)const{return value==x.value;}
};
struct W:V{ using V::V; W(const W&)=delete; };
namespace mdds::mtv { template<> struct clone_value<W*> { W* operator()(W* p)const { std::cout<<"clone "<<p->id<<"\n";return new W(p->value); } }; }
struct Plain { int value; };
using PM=managed_element_block<58,Plain>;
using PN=noncopyable_managed_element_block<59,Plain>;
using M=managed_element_block<55,V>;
using N=noncopyable_managed_element_block<56,V>;
using C=noncopyable_managed_element_block<57,W>;
static_assert(std::is_copy_constructible_v<M>);
static_assert(std::is_copy_assignable_v<M>);
static_assert(!std::is_constructible_v<M,size_t,V*>);
static_assert(!std::is_constructible_v<N,size_t,V*>);
static_assert(!std::is_move_constructible_v<W>);
static_assert(!std::is_copy_constructible_v<N> && !std::is_copy_assignable_v<N>);
template<class B> void snap(const char* label,B& b){
 std::cout<<label<<" "<<get_block_type(b)<<" "<<B::size(b)<<" "<<B::capacity(b);
 for(auto p:b.store())std::cout<<" "<<(p?p->id:0)<<":"<<(p?p->value:0);
 std::cout<<"\n";
}
template<class B> void run(int n){
 using P=typename B::value_type;using T=std::remove_pointer_t<P>;
 seq=0; std::cout<<"case "<<B::block_type<<" "<<n<<"\n";
 B empty; snap<B>("default",empty); B::delete_block(nullptr);
 for(int size=0;size<=3;++size){
  auto p=new T(size+10);
  try {auto b=B::create_block_with_value(size,p);snap<B>("fill",*b);B::delete_block(b);}
  catch(const std::exception& e){std::cout<<"error "<<e.what()<<"\n";}
 }
 auto nullblock=B::create_block_with_value(1,nullptr);B::delete_block(nullblock);
 auto b=B::create_block(n);
 for(int i=0;i<n;++i)B::set_value(*b,i,new T(i%3));
 B::reserve(*b,n+9);snap<B>("count",*b);
 int removed=std::min(n,2); B::erase_values(*b,0,removed);snap<B>("front",*b);
 try{auto c=B::copy_block(*b);snap<B>("copy",*c);std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";B::delete_block(c);}
 catch(const std::exception& e){std::cout<<"error "<<e.what()<<"\n";}
 try{auto c=B::clone_block(*b);snap<B>("cloned",*c);std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";B::delete_block(c);}
 catch(const std::exception& e){std::cout<<"error "<<e.what()<<"\n";}
 if constexpr(std::is_copy_assignable_v<B>){
   auto c=B::create_block_with_value(1,new T(90)); *c=*b;snap<B>("assigned",*c);
   std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";B::resize_block(*b,0);B::delete_block(c);
 }else{
   auto c=B::create_block(B::size(*b));
   for(size_t i=0;i<B::size(*b);++i)B::set_value(*c,i,new T(B::get_value(*b,i)->value));
   std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";
   if(B::size(*c)){B::get_value(*c,0)->value=100;std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";}
   B::resize_block(*c,B::size(*c)+1);std::cout<<"eq "<<B::equal_block(*b,*c)<<"\n";B::delete_block(c);
 }
 if(B::size(*b)){
   B::overwrite_values(*b,0,1);B::set_value(*b,0,nullptr);
   B::overwrite_values(*b,0,1);snap<B>("overwrite",*b);
 }
 B::overwrite_values(*b,0,0);B::delete_block(b);
 delayed_delete_vector<P> input;
 for(int i=0;i<n;++i)input.push_back(new T(20+i));
 auto r=B::create_block_with_values(input.begin(),input.end());snap<B>("range",*r);B::delete_block(r);
 while(!live.empty())delete live.begin()->second;
 std::cout<<"end "<<live.size()<<"\n";
}
int main(){ PM a;auto copied=PM::copy_block(a);PM::delete_block(copied);PN b;for(int n=0;n<=6;++n){run<M>(n);run<N>(n);run<C>(n);}}
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
      throw Error("Original managed caller failed: " + command + "\n" + result.stderr);
    if (command !== "clang++") {
      if (result.stderr) throw Error("Original managed caller produced diagnostics");
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
  "Complete original managed streams: " +
    Buffer.byteLength(outputs.normal) +
    " bytes; " +
    commands.length +
    " positive commands.",
);
