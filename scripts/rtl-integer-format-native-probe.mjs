/** @fileoverview Captures original complete SAL integer-formatting wrappers and source-defined buffer writes using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-integer-format-native";
const fixture = "apps/office/src/sal/rtl/native-integer-format-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <rtl/ustring.h>
#include <cstdio>
#include <cstdlib>
#include <cstdint>
#include <limits>
#include <string>
#include <initializer_list>
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void one(int kind,std::uint64_t bits,int radix){sal_Unicode buf[96];for(auto&c:buf)c=0xBEEF;int len=kind==0?rtl_ustr_valueOfInt32(buf,static_cast<sal_Int32>(bits),radix):kind==1?rtl_ustr_valueOfInt64(buf,static_cast<sal_Int64>(bits),radix):rtl_ustr_valueOfUInt64(buf,bits,radix);emit({kind,radix,static_cast<sal_Int32>(bits),static_cast<sal_Int32>(bits>>32),len});for(auto c:buf)emit({c});}
void values(){emit({RTL_USTR_MAX_VALUEOFINT32,RTL_USTR_MAX_VALUEOFINT64,RTL_USTR_MAX_VALUEOFUINT64});for(int i=-32768;i<32768;i++)one(0,static_cast<std::uint64_t>(static_cast<std::int64_t>(i)),10);for(int radix=2;radix<=36;radix++){
 for(int kind=0;kind<3;kind++){for(int p=0;p<64;p++){std::uint64_t v=std::uint64_t(1)<<p;for(auto n:{v-1,v,v+1,std::uint64_t(0)-v-1,std::uint64_t(0)-v,std::uint64_t(0)-v+1})one(kind,n,radix);}for(auto n:{std::uint64_t(0),std::uint64_t(0x7fffffff),std::uint64_t(0x80000000),std::uint64_t(0xffffffff),std::uint64_t(0x7fffffffffffffff),std::uint64_t(0x8000000000000000),std::uint64_t(0xffffffffffffffff)})one(kind,n,radix);}
 std::uint64_t seed=0x0123456789abcdef;for(int k=0;k<128;k++){seed=seed*6364136223846793005ULL+1442695040888963407ULL;for(int kind=0;kind<3;kind++)one(kind,seed,radix);}}
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values"){values();return 0;}sal_Unicode buf[96];int code=std::stoi(mode);int kind=code/3,which=code%3;auto*dest=which==0?nullptr:buf;int radix=which==1?1:which==2?37:10;if(kind==0)rtl_ustr_valueOfInt32(dest,-1,radix);else if(kind==1)rtl_ustr_valueOfInt64(dest,-1,radix);else rtl_ustr_valueOfUInt64(dest,1,radix);return 0;}
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
for (const mode of ["values"]) {
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
for (let code = 0; code < 9; code++) {
  const result = capture(normal, String(code));
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original checked formatting guard failed: ${code}`);
  assertions.push({ code, signal: result.signal, stderr: result.stderr.toString() });
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
    "Full unchanged original SAL integer-formatting template and C wrappers under normal and ASan/UBSan, with genuine full dependency owners. Complete initialized caller-buffer writes including terminator and untouched sentinels, all signed16 values in decimal, all35 valid radices, signed32/signed64/unsigned64 power boundaries and deterministic wide inputs. Caller buffers have96 initialized units, independently sufficient for every type/radix; macro-sized buffers and OUStringNumber are not certified. Nine original checked null/radix guards remain separate process-assertion observations. Native JS Number/BigInt radix formatting must match these complete portable streams without lossy64 conversion. Physical ABI, arbitrary malformed JS/storage inputs, NDEBUG diagnostic fallback, string concatenation and full consumer QA remain unverified; no native source method is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original integer-format observations");
console.log(
  `Original integer-format observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
