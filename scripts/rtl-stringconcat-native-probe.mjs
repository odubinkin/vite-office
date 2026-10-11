/** @fileoverview Captures original complete SAL StringNumber and lazy expression owners using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-stringconcat-native";
const fixture = "apps/office/src/sal/rtl/native-stringconcat-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
  "include/rtl/stringconcat.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <rtl/ustring.hxx>
#include "strtmpl.hxx"
#include <cstdio>
#include <cstdlib>
#include <cstdint>
#include <limits>
#include <string>
#include <initializer_list>
#include <string_view>
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void string(OUString const&s){emit({s.pData->refCount,s.getLength(),s.getStr()[s.getLength()]});for(int i=0;i<s.getLength();i++)emit({s.getStr()[i]});}
template<class N>void number(N&n){emit({n.length,n.getStr()==n.buf,static_cast<sal_Int32>(std::u16string_view(n).size())});for(int i=0;i<=n.length;i++)emit({n.getStr()[i]});}
void numbers(){for(int i=-32768;i<32768;i++){auto n=OUString::number(i);emit({0,i,0,10});number(n);OUString value(OUString::number(i));string(value);}
 for(int radix=2;radix<=36;radix++){
  for(int value:{-2147483647,-32768,-1,0,1,32767,2147483647}){auto n=OUString::number(value,radix);emit({0,value,0,radix});number(n);auto*p=&n;auto&&upper=std::move(n).toAsciiUpperCase();emit({p==&upper});number(n);OUString valueString(std::move(n));string(valueString);}
  for(auto value:{-9223372036854775807LL,-32768LL,-1LL,0LL,1LL,9223372036854775807LL}){auto n=OUString::number(value,radix);auto bits=static_cast<std::uint64_t>(value);emit({1,static_cast<sal_Int32>(bits),static_cast<sal_Int32>(bits>>32),radix});number(n);OUString valueString(std::move(n));string(valueString);}
  auto n=OUString::number(std::numeric_limits<unsigned long long>::max(),radix);emit({2,-1,-1,radix});number(n);OUString valueString(std::move(n));string(valueString);
 }
}
void unicode(){for(unsigned unit=0;unit<65536;unit++){sal_Unicode data[]={static_cast<sal_Unicode>(unit)};std::u16string_view view(data,1);const char sep[]="::";auto marker=OUString::Concat(view);auto expression=marker+sep;sal_Unicode out[8];for(auto&c:out)c=0xBEEF;auto*end=expression.addData(out+1);emit({static_cast<sal_Int32>(unit),static_cast<sal_Int32>(expression.length()),static_cast<sal_Int32>(end-out)});for(auto c:out)emit({c});OUString value(std::move(expression));string(value);}}
void bytes(){for(unsigned unit=1;unit<256;unit++){const char data[]={static_cast<char>(unit),0};auto expression=OUString::Concat(data);sal_Unicode out[4];for(auto&c:out)c=0xBEEF;auto*end=expression.addData(out+1);emit({static_cast<sal_Int32>(unit),static_cast<sal_Int32>(expression.length()),static_cast<sal_Int32>(end-out)});for(auto c:out)emit({c});OUString value(std::move(expression));string(value);}}
void borrowed(){sal_Unicode a[]={97,0,0xd800,98},b[]={0xdc00,90};OUString source(a,4);auto n=OUString::number(35,36);const char sep[]=":";auto marker=OUString::Concat(source);auto first=marker+sep;auto expression=first+n;emit({source.pData->refCount});OUString original(std::move(expression));string(original);emit({source.pData->refCount});source=OUString(b,2);n.buf[0]='x';emit({static_cast<sal_Int32>(expression.length()),source.pData->refCount});OUString changed(std::move(expression));string(changed);string(original);source.clear();n.length=0;n.buf[0]=0;OUString final(std::move(expression));string(final);emit({source.pData->refCount});
 std::u16string_view empty;auto em=OUString::Concat(empty);OUString zero(std::move(em));string(zero);OUString defaultValue;emit({zero.pData==defaultValue.pData});
 static constexpr OUStringLiteral literal(u"L");auto lm=OUString::Concat(literal);auto mix=lm+source;OUString ls(std::move(mix));string(ls);emit({literal.str.refCount,source.pData->refCount});
}
void uppercase(){for(unsigned unit=0;unit<65536;unit++){sal_Unicode b[]={static_cast<sal_Unicode>(unit),0xBEEF};rtl_ustr_toAsciiUpperCase_WithLength(b,1);emit({static_cast<sal_Int32>(unit),b[0],b[1],rtl::str::toAsciiUpper.Applicable()(static_cast<sal_Unicode>(unit))});}sal_Unicode b[]={97,0,98};rtl_ustr_toAsciiUpperCase_WithLength(b,3);emit({b[0],b[1],b[2]});rtl_ustr_toAsciiUpperCase_WithLength(b,0);emit({b[0],b[1],b[2]});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="numbers")numbers();else if(mode=="unicode")unicode();else if(mode=="borrowed")borrowed();else if(mode=="bytes")bytes();else if(mode=="uppercase")uppercase();else if(mode=="bad-length"){sal_Unicode data[]={97};rtl_ustr_toAsciiUpperCase_WithLength(data,-1);}else if(mode=="bad-literal"){const char data[4]={'a',0,'b',0};emit({static_cast<sal_Int32>(rtl::ToStringHelper<const char[4]>::length(data))});}else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  const dependency = `${binary}.d`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
      "-Ivendor/libreoffice-reference/sal/rtl",
      "-Ioutput/playwright/task39-native-types/library-dependencies/dragonbox-1.1.3/include",
      "-Ioutput/playwright/task39-native-types/library-dependencies/fast_float-8.2.10/include",
      "-DCPPU_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      dependency,
      `${target}/driver.cpp`,
      ...objects,
      "-framework",
      "CoreFoundation",
      "-framework",
      "Foundation",
      "-pthread",
      "-lz",
      "-Wl,-dead_strip",
      "-o",
      binary,
    ],
    `link-${sanitized ? "asan" : "normal"}`,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return binary;
}
/** Captures complete original process output, including terminal status and all diagnostics. @param binary - Actual original caller. @param mode - Caller mode. @returns Complete process result. */
function capture(binary, mode) {
  const result = spawnSync(binary, [mode], {
    maxBuffer: 96 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(`${binary}.${mode}`, result.stdout ?? "");
  writeFileSync(`${binary}.${mode}.stderr`, result.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: result.status,
    signal: result.signal,
  });
  native.save();
  return result;
}
const normal = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["numbers", "unicode", "borrowed", "uppercase", "bytes"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.status !== 0 ||
    second.status !== 0 ||
    !first.stdout.equals(second.stdout) ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(`Original ${mode} capture failed: ${first.stderr}\n${second.stderr}`);
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
const assertions = [];
for (const mode of ["bad-length", "bad-literal"]) {
  const result = capture(normal, mode);
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original checked string-expression guard failed: ${mode}`);
  assertions.push({ mode, signal: result.signal, stderr: result.stderr.toString() });
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes every complete original input. @param entry - Original source pair. @returns Full hash entry. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  assertions,
  scope:
    "Full unchanged original StringNumber, StringConcat, marker and actual ToStringHelper specializations, genuine OUString number/expression constructors and ASCII-uppercase dependency owners under normal and ASan/UBSan. Complete initialized logical number buffers/terminators, lazy lengths/pointer offsets/borrowed operand counts, full string materialization and all65536 UTF16 units. Spare uninitialized StringNumber cells and physical layout are not invented. Preserve CALC044 constants; binary signed minima that exceed macro buffers are excluded from defined native results. Native expression operands are held through materialization with no dangling C++ temporaries. Typed storage adapts fixed native buffer/borrowed pointer offsets; native threading/ABI, const/template/rvalue enforcement, exotic JS objects and full upstream consumer QA remain unverified. No native source owner/method substitution.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original stringconcat observations");
console.log(
  `Original stringconcat observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
