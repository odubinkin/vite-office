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
import { rtl_ustr_shortenedCompare_WithLength } from "../apps/office/src/sal/inc/rtl/ustring.h.ts";
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
const driver =
  unicodeNativeLifetimePrefix(
    scopes,
    shortened,
    wrapper + "\n" + substringWrapper + "\n" + concatWrapper,
  ) +
  String.raw`
void print(const OUString&s){std::cout<<' '<<s.getLength();for(int i=0;i<s.getLength();++i)std::cout<<' '<<unsigned(s[i]);}
int main(){char op;int n,m,a,b;while(std::cin>>op>>n>>m>>a>>b){std::vector<sal_Unicode>x(n),y(m);unsigned u;for(auto&v:x){std::cin>>u;v=u;}for(auto&v:y){std::cin>>u;v=u;}if(op=='C'){std::cout<<rtl_ustr_shortenedCompare_WithLength(x.data(),n,y.data(),m,a)<<'\n';continue;}OUString first(x.data(),n),second(y.data(),m);if(op=='A'){const auto before=first.pData;auto&out=first+=(b?first:second);std::cout<<(&out==&first)<<' '<<(first.pData==before)<<' '<<(first.pData==second.pData)<<' '<<first.pData->refCount<<' '<<second.pData->refCount;print(first);print(second);std::cout<<'\n';continue;}std::cout<<first.match(second,a);if(op=='M'){std::cout<<'\n';continue;}OUString rest(u"keep",4);OUString*output=b==0?&rest:b==1?&first:&second;std::cout<<' '<<first.startsWith(second,output);print(first);print(second);print(rest);std::cout<<'\n';}}
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
