/** @fileoverview Captures original complete SAL float-formatting wrappers and source-defined buffer writes using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-float-format-native";
const fixture = "apps/office/src/sal/rtl/native-float-format-cases.json";
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
#include <cstring>
#include <string>
#include <initializer_list>
void one(std::uint32_t bits){float value;std::memcpy(&value,&bits,4);sal_Unicode buf[RTL_USTR_MAX_VALUEOFFLOAT];for(auto&c:buf)c=0xBEEF;sal_Int32 len=rtl_ustr_valueOfFloat(buf,value);std::fwrite(&bits,4,1,stdout);std::fwrite(&len,4,1,stdout);std::fwrite(buf,2,RTL_USTR_MAX_VALUEOFFLOAT,stdout);}
int main(int argc,char**argv){static_assert(sizeof(float)==4);if(argc!=2)return 2;if(std::string(argv[1])!="values"){rtl_ustr_valueOfFloat(nullptr,1.0f);return 1;}sal_Int32 size=RTL_USTR_MAX_VALUEOFFLOAT;std::fwrite(&size,4,1,stdout);
 for(std::uint32_t exp=0;exp<256;exp++)for(std::uint32_t mantissa:{0u,1u,2u,0x7fffffu,0x7ffffeu,0x400000u,0x555555u,0x2aaaabu})for(auto sign:{0u,0x80000000u})one(sign|(exp<<23)|mantissa);
 for(float value:{0.1f,0.0001f,0.00001f,1000000.0f,10000000.0f,9.999999f,1.2345675f,1.2345685f,16777216.0f}){std::uint32_t bits;std::memcpy(&bits,&value,4);for(int offset=-4;offset<=4;offset++)for(auto sign:{0u,0x80000000u})one((bits+offset)|sign);}
 std::uint32_t seed=0x12345678u;for(int i=0;i<32768;i++){seed=seed*1664525u+1013904223u;one(seed);}return std::ferror(stdout)?3:0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  console.log(`Building genuine full ${sanitized ? "ASan/UBSan" : "normal"} SAL/CPPU graph`);
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
  sanitized = build(true);
const first = capture(normal, "values"),
  second = capture(sanitized, "values");
if (
  first.status !== 0 ||
  second.status !== 0 ||
  !first.stdout.equals(second.stdout) ||
  /AddressSanitizer|runtime error:/.test(second.stderr.toString())
)
  throw new Error(`Original float observations failed: ${first.stderr}\n${second.stderr}`);
const assertion = capture(normal, "null");
if (
  assertion.signal !== "SIGABRT" ||
  !/Assertion failed: \(pStr\)/.test(assertion.stderr.toString())
)
  throw new Error(`Original null-buffer assertion changed: ${assertion.stderr}`);
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes each complete genuine input. @param entry - Original source pair. @returns Hash pair. */ ([
        path,
        value,
      ]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  capture: {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  },
  assertion: { signal: assertion.signal, expression: "pStr" },
  scope:
    "Complete unchanged original SAL/CPPU normal and ASan/UBSan owners;native macro-sized float output buffer,all256binary exponents with8mantissa edge patterns/bothsigns,9decimal/notation/rounding boundaries with9adjacentbitpatterns/bothsigns,and32768deterministic full-bit inputs. Complete15unit initialized buffer including terminator and untouched sentinels is compared. Original null-pointer assertion is observed separately. Not exhaustive all2^32states;no arbitrary malformed JS buffers,ABI/lifetime or general double-output formats are certified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original float-format observations");
console.log(
  `Original float output observations ${write ? "written" : "verified"}: ${first.stdout.length}bytes;${Object.keys(native.sources).length}complete sources`,
);
