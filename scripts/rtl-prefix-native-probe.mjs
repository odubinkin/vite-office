/** @fileoverview Compares complete pinned native OUString match/startsWith/copy ownership and shortened C comparisons with the actual local string owners. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import {
  upstream,
  scope,
  loadUnicodeNativeSources,
  configureUnicodeNativeHeaders,
  unicodeNativeLifetimePrefix,
} from "./rtl-ustring-native-sources.mjs";
import { OUString } from "../apps/office/src/sal/inc/rtl/ustring.ts";
import {
  rtl_ustr_shortenedCompare_WithLength,
  rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength,
} from "../apps/office/src/sal/inc/rtl/ustring.h.ts";
const target = "output/native/AQF9AG-icu-grego/prefix",
  { sources, scopes } = loadUnicodeNativeSources();
configureUnicodeNativeHeaders(target, sources);
const template = sources["sal/rtl/strtmpl.hxx"],
  unicode = sources["sal/rtl/ustring.cxx"];
const shortened = scope(
  template,
  "template <typename C1, typename C2, class Compare>\nsal_Int32 compare(with_length",
  "/* ----------------------------------------------------------------------- */",
);
scopes.comparator += scope(template, "struct CompareIgnoreAsciiCase", "struct NoShortening");
scopes.forward += scope(
  template,
  "template <class S1, class S2, class Compare, typename Shorten_t>",
  "// take advantage of builtin optimisations",
);
const substring = scope(
  template,
  "template <typename rtl_tString>\nvoid newFromSubString",
  "template <typename rtl_tString> auto* getStr",
);
const wrapper = scope(
  unicode,
  "sal_Int32 SAL_CALL rtl_ustr_shortenedCompare_WithLength",
  "sal_Int32 SAL_CALL rtl_ustr_reverseCompare_WithLength",
);
const substringWrapper = scope(
  unicode,
  "void SAL_CALL rtl_uString_newFromSubString",
  "void SAL_CALL rtl_uString_newFromLiteral",
);
scopes.storage +=
  substring +
  scope(template, "enum ThrowPolicy", "template <typename rtl_tString> void ensureCapacity");
const concatWrapper = scope(
  unicode,
  "void SAL_CALL rtl_uString_newConcat(",
  "void SAL_CALL rtl_uString_ensureCapacity(",
);
scopes.copy += scope(template, "inline void Copy(sal_Unicode*", "inline sal_Int16 implGetDigit");
scopes.storage += scope(
  template,
  "template <typename rtl_tString, typename C>\nvoid newReplaceStrAt",
  "template <typename rtl_tString, class Replacer>",
);
scopes.copy += scope(
  template,
  "template <typename C> void CopyBackward",
  "inline void Copy(sal_Unicode*",
);
scopes.storage += scope(
  template,
  "template <typename C>\nsal_Int32 indexOfStr_WithLength",
  "/* ----------------------------------------------------------------------- */",
);
scopes.storage += scope(
  template,
  "template <class rtl_tString>\nvoid stringbuffer_ensureCapacity",
  "template <class rtl_tString>\nvoid stringbuffer_remove",
);
scopes.storage += scope(
  template,
  "template <class S, typename CharTypeFrom, typename CharTypeTo>\nvoid newReplaceAllFromIndex",
  "template <class rtl_tString, typename C1, typename C2>",
);
const viewAppendWrapper = unicode.match(/void rtl_uString_newConcatUtf16L\([\s\S]*?\n\}/)?.[0],
  replaceWrapper = unicode.match(/void SAL_CALL rtl_uString_newReplaceStrAt\([\s\S]*?\n\}/)?.[0];
if (!viewAppendWrapper || !replaceWrapper) throw Error("Missing original string wrapper");
const driver =
  unicodeNativeLifetimePrefix(
    scopes,
    shortened,
    wrapper +
      "\n" +
      substringWrapper +
      "\n" +
      concatWrapper +
      "\n" +
      viewAppendWrapper +
      "\n" +
      replaceWrapper +
      "\n" +
      scope(
        unicode,
        "void rtl_uString_newReplaceAllFromIndexUtf16LUtf16L(",
        "sal_Int32 SAL_CALL rtl_ustr_getLength(",
      ) +
      "\n" +
      scope(
        unicode,
        "sal_Int32 SAL_CALL rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(",
        "sal_Int32 SAL_CALL rtl_ustr_hashCode(",
      ),
  ) +
  String.raw`
void print(const OUString&s){std::cout<<' '<<s.getLength();for(int i=0;i<s.getLength();++i)std::cout<<' '<<unsigned(s[i]);}
int main(){char op;int n,m,a,b;while(std::cin>>op>>n>>m>>a>>b){std::vector<sal_Unicode>x(n),y(m);unsigned u;for(auto&v:x){std::cin>>u;v=u;}for(auto&v:y){std::cin>>u;v=u;}if(op=='I'){std::cout<<rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(x.data(),n,y.data(),m,a)<<'\n';continue;}if(op=='C'){std::cout<<rtl_ustr_shortenedCompare_WithLength(x.data(),n,y.data(),m,a)<<'\n';continue;}OUString first(x.data(),n),second(y.data(),m);if(op=='W'||op=='N'){const auto replaced=first.replaceAll(std::u16string_view(first).substr(a,b),std::u16string_view(second),op=='N'?a:0);std::cout<<(replaced.pData==first.pData)<<' '<<(replaced.pData==second.pData)<<' '<<replaced.pData->refCount<<' '<<first.pData->refCount<<' '<<second.pData->refCount;print(replaced);print(first);print(second);std::cout<<'\n';continue;}if(op=='P'){const auto replaced=first.replaceAt(a,b,second);std::cout<<(replaced.pData==first.pData)<<' '<<(replaced.pData==second.pData)<<' '<<replaced.pData->refCount<<' '<<first.pData->refCount<<' '<<second.pData->refCount;print(replaced);print(first);print(second);std::cout<<'\n';continue;}if(op=='V'){auto before=first.pData;auto&result=first+=std::u16string_view(second);std::cout<<(&result==&first)<<' '<<(first.pData==before)<<' '<<(first.pData==second.pData)<<' '<<first.pData->refCount<<' '<<second.pData->refCount;print(first);print(second);std::cout<<'\n';continue;}if(op=='A'){const auto before=first.pData;auto&out=first+=(b?first:second);std::cout<<(&out==&first)<<' '<<(first.pData==before)<<' '<<(first.pData==second.pData)<<' '<<first.pData->refCount<<' '<<second.pData->refCount;print(first);print(second);std::cout<<'\n';continue;}std::cout<<first.match(second,a);if(op=='M'){std::cout<<'\n';continue;}OUString rest(u"keep",4);OUString*output=b==0?&rest:b==1?&first:&second;std::cout<<' '<<first.startsWith(second,output);print(first);print(second);print(rest);std::cout<<'\n';}}
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
const buffers = [
    [],
    [0],
    [65],
    [97],
    [65, 100],
    [66, 63],
    [97, 90],
    [65, 122],
    [0xc4, 0xe4],
    [65, 0, 66],
    [65, 66],
    [65535, 0, 55296, 56320],
    [55296],
    [56320],
    [0, 0],
  ],
  inputs = [],
  expected = [];
/** Records actual visible UTF16 value. @param value - Native owner. @returns Complete payload. */
function row(value) {
  return [value.getLength(), ...value.getStr().subarray(0, value.getLength())];
}
for (const x of buffers)
  for (const y of buffers) {
    for (const shortenedLength of new Set([0, 1, x.length, y.length, 12])) {
      inputs.push(["C", x.length, y.length, shortenedLength, 0, ...x, ...y].join(" "));
      expected.push(
        String(
          rtl_ustr_shortenedCompare_WithLength(
            new Uint16Array(x),
            x.length,
            new Uint16Array(y),
            y.length,
            shortenedLength,
          ),
        ),
      );
    }
    for (const shortenedLength of new Set([0, 1, x.length, y.length, 12])) {
      inputs.push(["I", x.length, y.length, shortenedLength, 0, ...x, ...y].join(" "));
      expected.push(
        String(
          rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(
            new Uint16Array(x),
            x.length,
            new Uint16Array(y),
            y.length,
            shortenedLength,
          ),
        ),
      );
    }
    for (let start = 0; start <= x.length; ++start)
      for (let length = 0; length <= x.length - start; ++length)
        for (const op of ["W", "N"]) {
          const first = new OUString(new Uint16Array(x), x.length),
            second = new OUString(new Uint16Array(y), y.length);
          try {
            inputs.push([op, x.length, y.length, start, length, ...x, ...y].join(" "));
            const replaced = first.replaceAll(
              first.subView(start, length),
              second.subView(0),
              op === "N" ? start : 0,
            );
            try {
              const r = replaced.getDataAddress()[0],
                f = first.getDataAddress()[0],
                t = second.getDataAddress()[0];
              expected.push(
                [
                  Number(r === f),
                  Number(r === t),
                  r.refCount,
                  f.refCount,
                  t.refCount,
                  ...row(replaced),
                  ...row(first),
                  ...row(second),
                ].join(" "),
              );
            } finally {
              replaced.dispose();
            }
          } finally {
            second.dispose();
            first.dispose();
          }
        }
    for (let position = 0; position <= x.length; ++position) {
      const first = new OUString(new Uint16Array(x), x.length),
        second = new OUString(new Uint16Array(y), y.length);
      try {
        inputs.push(["M", x.length, y.length, position, 0, ...x, ...y].join(" "));
        expected.push(String(Number(first.match(second, position))));
      } finally {
        first.dispose();
        second.dispose();
      }
    }
    for (const output of [0, 1, 2]) {
      const first = new OUString(new Uint16Array(x), x.length),
        second = new OUString(new Uint16Array(y), y.length),
        rest = new OUString(new Uint16Array([107, 101, 101, 112]), 4);
      try {
        const matched = first.match(second);
        inputs.push(["S", x.length, y.length, 0, output, ...x, ...y].join(" "));
        expected.push(
          [
            Number(matched),
            Number(first.startsWith(second, output === 0 ? rest : output === 1 ? first : second)),
            ...row(first),
            ...row(second),
            ...row(rest),
          ].join(" "),
        );
      } finally {
        first.dispose();
        second.dispose();
        rest.dispose();
      }
    }
  }
for (const x of buffers)
  for (const y of buffers)
    for (const self of [0, 1]) {
      const first = new OUString(new Uint16Array(x), x.length),
        second = new OUString(new Uint16Array(y), y.length);
      try {
        const before = first.pData;
        const result = first.append(self ? first : second);
        inputs.push(["A", x.length, y.length, 0, self, ...x, ...y].join(" "));
        expected.push(
          [
            Number(result === first),
            Number(first.pData === before),
            Number(first.pData === second.pData),
            first.pData.refCount,
            second.pData.refCount,
            ...row(first),
            ...row(second),
          ].join(" "),
        );
      } finally {
        first.dispose();
        second.dispose();
      }
    }
for (const x of buffers)
  for (const y of buffers) {
    for (let index = 0; index <= x.length; ++index)
      for (let count = 0; count <= x.length - index; ++count) {
        const first = new OUString(new Uint16Array(x), x.length),
          second = new OUString(new Uint16Array(y), y.length);
        try {
          const result = first.replaceAt(index, count, second);
          try {
            inputs.push(["P", x.length, y.length, index, count, ...x, ...y].join(" "));
            expected.push(
              [
                Number(result.pData === first.pData),
                Number(result.pData === second.pData),
                result.pData.refCount,
                first.pData.refCount,
                second.pData.refCount,
                ...row(result),
                ...row(first),
                ...row(second),
              ].join(" "),
            );
          } finally {
            result.dispose();
          }
        } finally {
          first.dispose();
          second.dispose();
        }
      }
    const first = new OUString(new Uint16Array(x), x.length),
      second = new OUString(new Uint16Array(y), y.length);
    try {
      const before = first.pData,
        result = first.append(second.getStr().subarray(0, second.getLength()));
      inputs.push(["V", x.length, y.length, 0, 0, ...x, ...y].join(" "));
      expected.push(
        [
          Number(result === first),
          Number(first.pData === before),
          Number(first.pData === second.pData),
          first.pData.refCount,
          second.pData.refCount,
          ...row(first),
          ...row(second),
        ].join(" "),
      );
    } finally {
      first.dispose();
      second.dispose();
    }
  }
const actual = execFileSync(`${target}/driver`, [], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error("Prefix count");
for (let i = 0; i < actual.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Prefix ${inputs[i]} native${actual[i]} local${expected[i]}`);
console.log(
  `Matched ${actual.length} native shortened/match/startsWith cases including actual source/prefix/rest aliasing.`,
);
