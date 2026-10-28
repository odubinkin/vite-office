/** @fileoverview Compiles unchanged pinned SAL ByteSequence C/C++ bodies, original GCC-builtin OSL atomics and allocator bodies; only platform declarations and unused diagnostics are bound here. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "vendor/libreoffice-reference/",
  target = "output/playwright/sal-byteseq-native",
  sources = {};
mkdirSync(target, { recursive: true });
/** Reads exact original inputs and records hashes. @param path - Pinned path. @returns Source. */
function source(path) {
  const text = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(text).digest("hex");
  return text;
}
/** Removes include directives only; original class/function bodies remain unchanged. @param text - Original unit. @returns Standalone unit. */
function unit(text) {
  return text.replace(/^#include.*$/gm, "");
}
const types = source("include/sal/types.h"),
  record = types.slice(
    types.indexOf("typedef struct _sal_Sequence"),
    types.indexOf("#if defined( _WIN32)", types.indexOf("typedef struct _sal_Sequence")),
  );
const atomic = source("sal/osl/unx/interlck.cxx"),
  atomicBody = atomic.slice(
    atomic.indexOf("oslInterlockedCount SAL_CALL"),
    atomic.indexOf("#elif defined ( __GNUC__ )"),
  );
const alloc = source("sal/rtl/alloc_global.cxx"),
  allocBodies = alloc.slice(
    alloc.indexOf("void* SAL_CALL rtl_allocateMemory"),
    alloc.indexOf("void SAL_CALL rtl_freeZeroMemory"),
  );
const declarations = unit(source("include/rtl/byteseq.h")),
  inline = unit(source("include/rtl/byteseq.hxx")),
  body = unit(source("sal/rtl/byteseq.cxx"));
const cpp = `#include <cassert>
#include <cstring>
#include <cstdlib>
#include <cstdint>
#include <cstddef>
#include <new>
#include <iostream>
#define SAL_CALL
#define SAL_DLLPUBLIC
#define SAL_WARN_UNUSED
#define SAL_THROW_EXTERN_C() noexcept
#define SAL_WARN_IF(...) ((void)0)
#define LIBO_INTERNAL_ONLY
using sal_Int8=signed char; using sal_Int32=std::int32_t; using sal_Bool=bool; using sal_Size=std::size_t; using oslInterlockedCount=sal_Int32;
${record}
${atomicBody}
#define osl_atomic_increment osl_incrementInterlockedCount
#define osl_atomic_decrement osl_decrementInterlockedCount
${allocBodies}
${declarations}
${inline}
${body}
void values(rtl::ByteSequence const& seq) {std::cout<<"[";for(int i=0;i<seq.getLength();++i){if(i)std::cout<<",";std::cout<<int(seq.getConstArray()[i]);}std::cout<<"]";}
int main(){
  rtl::ByteSequence a,b,zero(0,rtl::BYTESEQ_NODEFAULT); bool emptyShared=a.get()==b.get(), zeroIndependent=zero.get()!=a.get();
  auto old=a.get(); int before=old->nRefCount; a.getArray(); int emptyDelta=old->nRefCount-before;
  sal_Int8 init[]={1,2,-128,-1}; rtl::ByteSequence x(init,4),y(x); bool shared=x.get()==y.get(); y[1]=9; bool detached=x.get()!=y.get();
  rtl::ByteSequence grow(x);grow.realloc(6);rtl::ByteSequence shrink(grow);shrink.realloc(2);shrink.realloc(3);shrink[2]=7;
  rtl::ByteSequence moved(std::move(shrink));bool movedNull=shrink.get()==nullptr;rtl::ByteSequence assigned(1);assigned=std::move(moved);bool moveAssignedNull=moved.get()==nullptr;
  std::cout<<R"({"emptyShared":)"<<emptyShared<<R"(,"noDefaultZeroIndependent":)"<<zeroIndependent<<R"(,"emptyCowOldCountDelta":)"<<emptyDelta<<R"(,"copyShared":)"<<shared<<R"(,"cowDetached":)"<<detached<<R"(,"movedNull":)"<<movedNull<<R"(,"moveAssignedNull":)"<<moveAssignedNull<<R"(,"source":)";values(x);std::cout<<R"(,"detached":)";values(y);std::cout<<R"(,"sharedGrowth":)";values(grow);std::cout<<R"(,"initializedUniqueGrowth":)";values(assigned);std::cout<<"}";
}
`;
writeFileSync(target + "/probe.cxx", cpp);
execFileSync(
  "clang++",
  ["-std=c++17", "-O2", "-fsigned-char", target + "/probe.cxx", "-o", target + "/probe"],
  { stdio: "inherit" },
);
const result = JSON.parse(execFileSync(target + "/probe", { encoding: "utf8" }));
const artifact = {
  baseline: "9bc445578031fecf56086729d8e4940c77e14d65",
  sourceHashes: sources,
  result,
  limits:
    "Small initialized byte/count/COW/move cases only. Native resource failure, undefined bytes/pointers, complete UNO/ABI/thread/service behavior and serializer/package/UI integration remain unverified.",
};
writeFileSync(
  "apps/office/src/sal/rtl/byteseq.native.json",
  JSON.stringify(artifact, null, 2) + "\n",
);
process.stdout.write(JSON.stringify(result) + "\n");
