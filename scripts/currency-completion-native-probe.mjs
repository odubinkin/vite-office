/** @fileoverview Captures unchanged original currency completion methods over actual native OUStringBuffer and counted symbol views. */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  pin,
  hash,
  upstream,
  loadUnicodeNativeSources,
  loadUnicodeOriginal,
  configureUnicodeNativeHeaders,
  unicodeNativeLifetimePrefix,
  scope,
} from "./rtl-ustring-native-sources.mjs";
const target = "test-results/native/B8TCAE-currency-completion",
  { sources, scopes } = loadUnicodeNativeSources();
const configuration = configureUnicodeNativeHeaders(target, sources);
const tmpl = sources["sal/rtl/strtmpl.hxx"],
  buf = loadUnicodeOriginal(sources, "sal/rtl/ustrbuf.cxx"),
  currency = loadUnicodeOriginal(sources, "svl/source/numbers/zforlist.cxx");
scopes.copy += scope(
  tmpl,
  "template <typename C> void CopyBackward",
  "template <typename T> sal_Int32 getLength",
);
scopes.storage += scope(
  tmpl,
  "template <class rtl_tString>\nvoid stringbuffer_newFromStr_WithLength",
  "template <class S, typename CharTypeFrom, typename CharTypeTo>",
);
/** Extracts an unchanged scalar method whose literals have no braces. @param signature - Exact original prefix. @returns Complete method bytes. */
function body(signature) {
  const start = currency.indexOf(signature);
  if (start < 0) throw Error(signature);
  const brace = currency.indexOf("{", start);
  let depth = 1,
    end = brace + 1;
  for (; depth && end < currency.length; ++end) {
    if (currency[end] === "{") ++depth;
    else if (currency[end] === "}") --depth;
  }
  if (depth) throw Error("Unclosed original method " + signature);
  return currency.slice(start, end);
}
const header = loadUnicodeOriginal(sources, "include/svl/zforlist.hxx");
const declarations = ["Positive", "Negative"]
  .map(
    /** Retains the actual public static header declaration. @param kind - Source polarity. @returns Declaration. */ (
      kind,
    ) => {
      const match = header.match(
        new RegExp("static\\s+void\\s+Complete" + kind + "FormatString\\([\\s\\S]*?;"),
      );
      if (!match) throw Error(kind);
      return match[0];
    },
  )
  .join("\n");
const driver =
  unicodeNativeLifetimePrefix(scopes, "", "") +
  "\n#include <rtl/ustrbuf.hxx>\nusing rtl::OUStringBuffer;using rtl::OUString;\n" +
  buf.slice(
    buf.indexOf("void SAL_CALL rtl_uStringbuffer_newFromStr_WithLength"),
    buf.indexOf("/* vim:"),
  ) +
  `\nstruct NfCurrencyEntry{${declarations}};\n` +
  body(
    "void NfCurrencyEntry::CompletePositiveFormatString(OUStringBuffer& rStr, std::u16string_view",
  ) +
  "\n" +
  body(
    "void NfCurrencyEntry::CompleteNegativeFormatString(OUStringBuffer& rStr,\n                                                   std::u16string_view",
  ) +
  String.raw`
int main(){char op;int64_t placement;int n,m;while(std::cin>>op>>placement>>n>>m){std::vector<sal_Unicode>a(n+1),s(m+1);unsigned u;for(int i=0;i<n;++i){std::cin>>u;a[i]=u;}for(int i=0;i<m;++i){std::cin>>u;s[i]=u;}OUStringBuffer output(std::u16string_view(a.data(),n));std::u16string_view symbol(s.data(),m);if(op=='P')NfCurrencyEntry::CompletePositiveFormatString(output,symbol,sal_uInt16(placement));else NfCurrencyEntry::CompleteNegativeFormatString(output,symbol,sal_uInt16(placement));rtl_uString**data;sal_Int32*capacity;output.accessInternals(&data,&capacity);std::cout<<'['<<output.getCapacity()<<','<<output.getLength()<<','<<(*data)->refCount<<",[";for(int i=0;i<=output.getLength();++i){if(i)std::cout<<',';std::cout<<unsigned(output.getStr()[i]);}std::cout<<"]]\n";}}
`;
writeFileSync(target + "/driver.cpp", driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-DLIBO_INTERNAL_ONLY",
    "-DMACOSX",
    ...(process.argv.includes("--sanitize")
      ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"]
      : []),
    "-I" + target + "/headers",
    "-I" + upstream + "/include",
    "-pthread",
    "-MMD",
    "-MF",
    target + "/driver.d",
    target + "/driver.cpp",
    "-o",
    target + "/driver",
  ],
  { stdio: "inherit" },
);
for (const path of readFileSync(target + "/driver.d", "utf8")
  .replaceAll("\\\n", " ")
  .split(/\s+/))
  if (path.startsWith(upstream + "/"))
    loadUnicodeOriginal(sources, path.slice(upstream.length + 1));
const buffers = [
    [],
    [36],
    [0],
    [0x20ac],
    [0xd800, 0xdc00],
    [0xd800],
    [0xdc00],
    [65, 0, 66],
    Array.from(
      { length: 40 },
      /** Crosses original buffer growth boundaries with initialized units. @param _ - Array value. @param i - Position. @returns Unit. */ (
        _,
        i,
      ) => 65 + i,
    ),
  ],
  rows = [];
for (const op of ["P", "N"])
  for (const placement of [
    -1,
    ...Array.from(
      { length: 17 },
      /** Covers all defined placements and the first diagnostic value. @param _ - Array value. @param i - Scalar. @returns Scalar. */ (
        _,
        i,
      ) => i,
    ),
    65535,
    65536,
    65537,
  ])
    for (const input of buffers)
      for (const symbol of buffers) rows.push([op, placement, input, symbol]);
const input =
  rows
    .map(
      /** Serializes actual disjoint initialized counted views. @param row - Native caller arguments. @returns Driver input. */ ([
        op,
        p,
        a,
        s,
      ]) => [op, p, a.length, s.length, ...a, ...s].join(" "),
    )
    .join("\n") + "\n";
const output = execFileSync(target + "/driver", { input, encoding: "utf8", maxBuffer: 16e6 })
  .trimEnd()
  .split("\n");
if (output.length !== rows.length) throw Error("Native currency completion count differs");
const captured = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Records every linked scope and actual included pinned header. @param entry - Original path and bytes. @returns Source hash. */ ([
        p,
        t,
      ]) => [p, hash(t)],
    ),
  ),
  witnessSha256: hash(driver),
  generatedConfigurationHashes: {
    types: hash(configuration.types),
    global: hash(configuration.global),
  },
  scope:
    "Unchanged original public static currency completion bodies and actual original OUStringBuffer/Concat headers with unchanged original RTL storage, buffer, lifetime, allocator-pointer and mutex scopes. Valid disjoint initialized counted UTF16 buffers and symbol views, including NUL and surrogate units; native UInt16 scalar conversion and diagnostic values. Only existing logging/platform bindings from the verified RTL witness prefix are used. No full currency object, ABI, allocator-failure or concurrency equivalence is claimed.",
  cases: rows.map(
    /** Associates inputs solely with compiled original output. @param query - Native caller input. @param index - Output index. @returns Observation. */ (
      query,
      index,
    ) => [query, JSON.parse(output[index])],
  ),
};
const fixture = "apps/office/src/svl/source/numbers/native-currency-completion.json",
  serialized = JSON.stringify(captured, null, 2) + "\n";
if (process.argv.includes("--write")) writeFileSync(fixture, serialized);
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(captured))
  throw Error("Native currency completion fixture differs");
console.log("Verified " + rows.length + " original currency-completion observations");
