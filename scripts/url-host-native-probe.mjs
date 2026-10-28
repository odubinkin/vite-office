/** @fileoverview Compares unchanged original INetURLObject::parseHost state machine and ASCII/hex classifiers using bounded UTF16/numeric value bindings; complete URL/SAL ABI parity is outside this witness. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pin, hash, scope } from "./rtl-ustring-native-sources.mjs";
import { observeUrlHost } from "../apps/office/src/test/url-host-observer.ts";
const root = "vendor/libreoffice-reference",
  build = "test-results/native/B8TCAE-url-host";
mkdirSync(build, { recursive: true });
const paths = [
  "tools/source/fsys/urlobj.cxx",
  "include/rtl/character.hxx",
  "include/tools/inetmime.hxx",
  "include/o3tl/numeric.hxx",
];
const sources = paths.map(
  /** Rejects any difference from the exact pinned native source. @param path - Original source. @returns Verified original bytes. */
  (path) => {
    const source = readFileSync(`${root}/${path}`, "utf8");
    if (
      source !==
      execFileSync("git", ["-C", root, "show", `${pin}:${path}`], {
        encoding: "utf8",
        maxBuffer: 4e6,
      })
    )
      throw Error(`Modified original source ${path}`);
    return source;
  },
);
const [url, character, mime, numeric] = sources;
const cpp =
  String.raw`
#include <cassert>
#include <cstdint>
#include <charconv>
#include <iostream>
#include <string>
#include <type_traits>
using sal_Unicode=char16_t;using sal_uInt32=uint32_t;using sal_Int32=int32_t;using sal_Int64=int64_t;
#define SAL_CONSTEXPR constexpr
` +
  character.slice(character.indexOf("namespace rtl\n{"), character.lastIndexOf("\n#endif\n")) +
  "namespace o3tl{template<class T>concept integral=std::is_integral_v<T>;\n" +
  scope(
    numeric,
    "template <o3tl::integral T, T error = T(-1), o3tl::integral U>\nconstexpr T convertToHex(U aChar)",
    "template <o3tl::integral T, T error = T(-1), o3tl::integral U>\nconstexpr T convertToHex(U cHigh",
  ) +
  String.raw`
}
struct INetMIME{static int getWeight(sal_uInt32);static int getHexWeight(sal_uInt32);};
` +
  scope(
    mime,
    "inline int INetMIME::getWeight(",
    "// static\ninline sal_uInt32 INetMIME::getUTF32Character",
  ) +
  String.raw`
struct OUString{std::u16string value;static OUString number(sal_uInt32 n,int base=10){char data[32];auto result=std::to_chars(data,data+32,n,base);OUString out;for(auto p=data;p!=result.ptr;++p)out.value+=char16_t(*p);return out;}};
struct OUStringBuffer{std::u16string value=u"seed";sal_Int32 getLength()const{return value.size();}void setLength(sal_Int32 n){value.resize(n);}void append(char c){value+=char16_t(c);}void append(const char*s){while(*s)value+=char16_t(*s++);}void append(const OUString&s){value+=s.value;}void append(const sal_Unicode*p,sal_Int64 n){value.append(p,n);}void append(sal_Int64 n){append(OUString::number(n));}};
struct INetURLObject{static bool parseHost(sal_Unicode const*&,sal_Unicode const*,OUStringBuffer*);};
` +
  scope(
    url,
    "bool INetURLObject::parseHost(",
    "// static\nbool INetURLObject::parseHostOrNetBiosName(",
  ) +
  String.raw`
std::u16string decode(std::string text){std::u16string result;if(text!="-")for(size_t i=0;i<text.size();i+=4)result+=char16_t(std::stoul(text.substr(i,4),nullptr,16));return result;}
std::string hex(std::u16string text){if(text.empty())return "-";const char*digits="0123456789abcdef";std::string result;for(char16_t unit:text)for(int shift=12;shift>=0;shift-=4)result+=digits[(unit>>shift)&15];return result;}
int main(){std::string word;size_t begin,end;while(std::cin>>word>>begin>>end){auto text=decode(word);assert(begin<=end&&end<=text.size());sal_Unicode const* p=text.data()+begin;OUStringBuffer output;bool ok=INetURLObject::parseHost(p,text.data()+end,&output);assert(output.value.substr(0,4)==u"seed");std::cout<<ok<<' '<<(p-text.data())<<' '<<hex(output.value.substr(4))<<'\n';}}
`;
writeFileSync(`${build}/witness.cpp`, cpp);
execFileSync("clang++", ["-std=c++20", `${build}/witness.cpp`, "-o", `${build}/witness`], {
  stdio: "inherit",
});
/** Encodes logical UTF16 units, including NUL and invalid surrogates. @param value - Input text. @returns Native transport. */
function hex(value) {
  let result = "";
  for (let i = 0; i < value.length; ++i)
    result += value.charCodeAt(i).toString(16).padStart(4, "0");
  return result || "-";
}
const hosts = new Set([
  "1a.a",
  "1a.0",
  "1a.-",
  "1a.Ж",
  "1a-a",
  "1a--a",
  "1a- ",
  "1a..",
  "",
  "a",
  "a-",
  "a--b",
  "a.",
  "a..",
  "a.1",
  "1.a",
  "1.1",
  "1.2.3.4",
  "255.256.999.000",
  "[::]",
  "[::1]",
  "[1:2:3:4:5:6:7:8]",
  "[1::2]",
  "[::ffff:192.0.2.1]",
  "[:::192.0.2.1]",
  "[2001:db8::1]",
  "[1:2:3:4:5:6:192.0.2.1]",
]);
for (const value of [
  "0",
  "00",
  "000",
  "0000",
  "00000",
  "1",
  "F",
  "ABcd",
  "g",
  "-",
  "_",
  "1a",
  "01",
  "255",
  "256",
  "999",
  "1000",
])
  for (let position = 0; position < 8; ++position) {
    const groups = Array(8).fill("0");
    groups[position] = value;
    hosts.add(`[${groups.join(":")}]`);
    hosts.add(`[${groups.slice(0, position).join(":")}::${value}]`);
    if (position < 4) {
      const octets = Array(4).fill("1");
      octets[position] = value;
      hosts.add(octets.join("."));
      hosts.add(`[::${octets.join(".")}]`);
      hosts.add(`[1:2:3:4:5:6:${octets.join(".")}]`);
    }
  }
for (const base of [...hosts]) {
  hosts.add(base + "/path");
  hosts.add(base + ":80");
  hosts.add(base + "\u0000tail");
}
for (const base of [
  "a-b.example.",
  "1.2.3.4",
  "[::1]",
  "[1::abcd]",
  "[1:2:3:4:5:6:7:8]",
  "[::ffff:192.0.2.1]",
  "[:::192.0.2.1]",
])
  for (let position = 0; position <= base.length; ++position)
    for (const token of ["0", "a", "g", ":", ".", "[", "]", "-", "_", " ", "\u0000", "Ж", "\ud800"])
      hosts.add(base.slice(0, position) + token + base.slice(position + 1));
const inputs = [];
for (const host of hosts) {
  inputs.push(`${hex(host)} 0 ${host.length}`);
  inputs.push(`${hex("x" + host + "y")} 1 ${host.length + 1}`);
}
const rows = execFileSync(`${build}/witness`, {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16e6,
})
  .trimEnd()
  .split("\n");
if (rows.length !== inputs.length) throw Error("Native host row count differs");
for (let index = 0; index < inputs.length; ++index) {
  const local = observeUrlHost(inputs[index]);
  if (local !== rows[index])
    throw Error(`Host ${inputs[index]}: native ${rows[index]}, local ${local}`);
}
if (process.argv.includes("--write-fixtures"))
  writeFileSync(
    "apps/office/src/tools/source/fsys/host.native-observations.json",
    JSON.stringify(
      {
        baselineCommit: pin,
        sourceHashes: Object.fromEntries(
          paths.map(
            /** Records independently verified original bytes. @param path - Source responsibility. @param index - Source offset. @returns Hash entry. */
            (path, index) => [path, hash(sources[index])],
          ),
        ),
        witnessSha256: hash(cpp),
        scope:
          "Unchanged original parseHost and ASCII/hex classifier bodies with bounded UTF16 buffer and standard decimal/lowercase-hex integer value bindings. Native optional-output-buffer rollback is checked. Full URL, NetBIOS/URI encoding, SAL lifetime and ABI remain outside this witness.",
        cases: inputs.map(
          /** Records only compiled native output after full comparison. @param query - Pointer-range query. @param index - Native row. @returns Independent observation. */
          (query, index) => [query, rows[index]],
        ),
      },
      null,
      2,
    ) + "\n",
  );
console.log(`Matched ${rows.length} original host state-machine observations`);
