/** @fileoverview Captures unchanged original owned/raw UTF16 replacement overloads and caller aliases with exact source evidence. */
import { execFileSync } from "node:child_process";
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

const mode = process.argv[2];
if (process.argv.length !== 3 || !["--write", "--check"].includes(mode))
  throw new Error("Use exactly --write or --check");
const target = "test-results/native/B8TCAE-rtl-replacement",
  fixture = "apps/office/src/sal/rtl/native-replacement-cases.json",
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
    /** Extracts complete original C wrappers without changing their bodies. @param marker - Exact declaration prefix. @returns Original function definition. */ (
      marker,
    ) => {
      const start = unicode.indexOf(marker),
        end = unicode.indexOf("\n}", start);
      if (start < 0 || end < start) throw new Error(`Missing original wrapper ${marker}`);
      return unicode.slice(start, end + 2);
    },
  ),
].join("\n");
const driver =
  unicodeNativeLifetimePrefix(scopes, "", wrappers) +
  String.raw`
void print(rtl_uString* s){std::cout<<' '<<s->length;for(int i=0;i<=s->length;++i)std::cout<<' '<<unsigned(s->buffer[i]);}
int main(){char op;int n,m,index,count,alias,nullable;while(std::cin>>op>>n>>m>>index>>count>>alias>>nullable){
 std::vector<sal_Unicode>a(n+1),b(m+1);unsigned u;for(int i=0;i<n;++i){std::cin>>u;a[i]=u;}for(int i=0;i<m;++i){std::cin>>u;b[i]=u;}
 rtl_uString *first=nullptr,*second=nullptr,*output=nullptr;rtl_uString_newFromStr_WithLength(&first,a.data(),n);rtl_uString_newFromStr_WithLength(&second,b.data(),m);
 if(alias==1)rtl_uString_assign(&output,first);else if(alias==2)rtl_uString_assign(&output,second);
 if(op=='R')rtl_uString_newReplaceStrAtUtf16L(&output,first,index,count,nullable?nullptr:second->buffer,m);
 else rtl_uString_newReplaceStrAt(&output,first,index,count,nullable?nullptr:second);
 std::cout<<(output==first)<<' '<<(output==second)<<' '<<output->refCount<<' '<<first->refCount<<' '<<second->refCount;print(output);print(first);print(second);std::cout<<'\n';
 rtl_uString_release(output);rtl_uString_release(second);rtl_uString_release(first);
}}
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
const buffers = [[], [0], [65], [97, 98], [65, 0, 66], [0xd800, 65, 0xdc00], [97, 98, 97, 98]],
  cases = [];
for (const operation of ["R", "O"])
  for (const original of buffers)
    for (const replacement of buffers)
      for (let index = 0; index <= original.length; ++index)
        for (let count = 0; count <= original.length - index; ++count)
          for (const alias of [0, 1, 2])
            for (const nullable of replacement.length === 0 ? [0, 1] : [0])
              cases.push([operation, original, replacement, index, count, alias, nullable]);
const input =
  cases
    .map(
      /** Encodes initialized spans and original scalar arguments. @param row - Native caller input. @returns Driver command. */ ([
        op,
        original,
        replacement,
        index,
        count,
        alias,
        nullable,
      ]) =>
        [
          op,
          original.length,
          replacement.length,
          index,
          count,
          alias,
          nullable,
          ...original,
          ...replacement,
        ].join(" "),
    )
    .join("\n") + "\n";
const output = execFileSync(`${target}/driver`, [], {
  input,
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (output.length !== cases.length) throw new Error("Incomplete original replacement observations");
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Retains exact unchanged source hashes. @param entry - Source name and bytes. @returns Source hash entry. */ ([
        name,
        bytes,
      ]) => [name, hash(bytes)],
    ),
  ),
  witnessSha256: hash(driver),
  scope:
    "Unchanged original SAL replacement/concat/storage/refcount functions and C wrappers with original configured headers. Complete initialized values, terminators, sharing and refcounts across owned/raw replacement callers. No full ABI, OOM, uninitialized storage or threading equivalence is claimed.",
  cases: cases.map(
    /** Associates independent native output with its complete original input. @param row - Original input. @param index - Native output index. @returns Portable observation. */ (
      row,
      index,
    ) => [...row, output[index]],
  ),
};
if (mode === "--write") writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native replacement fixture differs from unchanged original output");
process.stdout.write(`${cases.length} unchanged original replacement observations ${mode}\n`);
