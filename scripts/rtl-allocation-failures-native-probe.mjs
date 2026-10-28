/** @fileoverview Captures original RTL error paths through the original replaceable allocation function pointers, preserving unchanged core bodies. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  upstream,
  pin,
  hash,
  scope,
  loadUnicodeNativeSources,
  configureUnicodeNativeHeaders,
  unicodeNativeLifetimePrefix,
} from "./rtl-ustring-native-sources.mjs";
const mode = process.argv[2],
  fixture = process.argv[3] ?? "apps/office/src/sal/rtl/native-allocation-failures.json";
if (process.argv.length > 4 || !["--write", "--check"].includes(mode))
  throw new Error("Use --write or --check and an optional fixture path");
const target = "test-results/native/B8TCAE-rtl-allocation",
  { sources, scopes } = loadUnicodeNativeSources();
configureUnicodeNativeHeaders(target, sources);
const template = sources["sal/rtl/strtmpl.hxx"],
  unicode = sources["sal/rtl/ustring.cxx"];
scopes.copy += scope(template, "inline void Copy(sal_Unicode*", "inline sal_Int16 implGetDigit");
scopes.storage += scope(
  template,
  "enum ThrowPolicy",
  "template <typename rtl_tString> void ensureCapacity",
);
scopes.storage += scope(
  template,
  "template <typename rtl_tString, typename C>\nvoid newReplaceStrAt",
  "template <typename rtl_tString, class Replacer>",
);
const wrappers = [
  scope(
    unicode,
    "void SAL_CALL rtl_uString_newConcat(",
    "void SAL_CALL rtl_uString_ensureCapacity(",
  ),
  ...[
    "void rtl_uString_newConcatUtf16L",
    "void SAL_CALL rtl_uString_newReplaceStrAt",
    "void SAL_CALL rtl_uString_newReplaceStrAtUtf16L",
  ].map(
    /** Selects an unchanged complete C wrapper. @param marker - Native prefix. @returns Original wrapper. */ (
      marker,
    ) => {
      const start = unicode.indexOf(marker),
        end = unicode.indexOf("\n}", start);
      if (start < 0 || end < start) throw new Error(marker);
      return unicode.slice(start, end + 2);
    },
  ),
].join("\n");
const driver =
  unicodeNativeLifetimePrefix(scopes, "", wrappers) +
  String.raw`
#include <sys/resource.h>
rtl_allocateStringFn originalAllocate=rtl_allocateString;rtl_freeStringFn originalFree=rtl_freeString;void* oldDestination=nullptr;bool byteDestination=false;
void* failAllocation(size_t bytes){std::cout<<"A "<<bytes<<'\n'<<std::flush;return nullptr;}
void observedFree(void* raw){std::cout<<"F "<<(raw==oldDestination);if(byteDestination){auto*p=(rtl_String*)raw;std::cout<<' '<<p->refCount<<' '<<p->length;for(int i=0;i<=p->length;i++)std::cout<<' '<<unsigned(static_cast<unsigned char>(p->buffer[i]));}else{auto*p=(rtl_uString*)raw;std::cout<<' '<<p->refCount<<' '<<p->length;for(int i=0;i<=p->length;i++)std::cout<<' '<<unsigned(p->buffer[i]);}std::cout<<'\n'<<std::flush;originalFree(raw);}
void print(rtl_uString*p){std::cout<<' '<<p->refCount<<' '<<p->length;for(int i=0;i<=p->length;i++)std::cout<<' '<<unsigned(p->buffer[i]);}
int main(int argc,char**argv){struct rlimit coreLimit={0,0};setrlimit(RLIMIT_CORE,&coreLimit);if(argc!=2)return 2;char operation=argv[1][0];
 if(operation=='B'){rtl_String* output=nullptr;rtl::str::newFromStr_WithLength(&output,"old",3);oldDestination=output;byteDestination=true;rtl_allocateString=failAllocation;rtl_freeString=observedFree;rtl::str::new_WithLength(&output,3);return 3;}
 rtl_uString *left=nullptr,*right=nullptr,*output=nullptr;rtl_uString_newFromStr_WithLength(&left,u"ab",2);rtl_uString_newFromStr_WithLength(&right,u"c",1);rtl_uString_newFromStr_WithLength(&output,u"old",3);oldDestination=output;
 rtl_allocateString=failAllocation;rtl_freeString=observedFree;
 if(operation=='N')rtl_uString_newConcat(&output,left,right);
 else if(operation=='V')rtl_uString_newConcatUtf16L(&output,left,right->buffer,right->length);
 else if(operation=='R')rtl_uString_newReplaceStrAtUtf16L(&output,left,1,0,right->buffer,right->length);
 else if(operation=='D')rtl_uString_newReplaceStrAt(&output,left,1,0,right);
 else if(operation=='X')rtl_uString_newFromStr_WithLength(&output,u"more",4);
 else return 4;
 std::cout<<"S "<<(output==nullptr);print(left);print(right);std::cout<<'\n'<<std::flush;
 rtl_allocateString=originalAllocate;rtl_freeString=originalFree;rtl_uString_release(left);rtl_uString_release(right);if(output)rtl_uString_release(output);return 0;
}
`;
writeFileSync(`${target}/driver.cpp`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-DLIBO_INTERNAL_ONLY",
    "-DMACOSX",
    `-I${target}/headers`,
    `-I${upstream}/include`,
    "-pthread",
    `${target}/driver.cpp`,
    "-o",
    `${target}/driver`,
  ],
  { stdio: "inherit" },
);
const cases = ["N", "V", "B", "R", "D", "X"].map(
  /** Runs each original allocator-failure caller in an isolated native process. @param operation - Original public C/template call. @returns Stable initialized events and original process outcome. */ (
    operation,
  ) => {
    const result = spawnSync(`${target}/driver`, [operation], { encoding: "utf8" });
    const abort = ["B", "R", "D", "X"].includes(operation);
    if (abort ? result.signal !== "SIGABRT" : result.status !== 0)
      throw new Error(
        JSON.stringify({
          operation,
          status: result.status,
          signal: result.signal,
          stderr: result.stderr,
        }),
      );
    const assertion = abort ? /\*ppThis\s*!=\s*nullptr/.test(result.stderr) : false;
    if (abort && !assertion) throw new Error(`Missing original assert: ${result.stderr}`);
    return {
      operation,
      events: result.stdout.trim().split("\n"),
      nativeSignal: result.signal,
      exitCode: result.status,
      diagnostics: abort ? ["assert(*ppThis != nullptr)"] : result.stderr.trim().split("\n"),
    };
  },
);
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Retains exact original source bytes. @param pair - Path and body. @returns Source hash entry. */ ([
        path,
        body,
      ]) => [path, hash(body)],
    ),
  ),
  witnessSha256: hash(driver),
  scope:
    "Unchanged original storage, concat/replacement, C wrappers, allocation declarations/defaults and original headers. Failure is supplied through the actual rtl_allocateString function pointer declared in sal/rtl/strimp.hxx; no core method or length/refcount field is replaced. Allocator/free events inspect only initialized live storage, before the original free call. NoThrow callers return null; original byte-reserve, Unicode construction and replacement assertions terminate isolated processes. Local checked Error binding is not a claim of native C++ exceptions, full ABI, allocator or threading equivalence.",
  cases,
};
if (mode === "--write") writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native allocation-failure fixture changed");
process.stdout.write(`${cases.length} original allocation-failure caller outcomes ${mode}\n`);
