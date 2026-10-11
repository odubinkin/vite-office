/** @fileoverview Captures unchanged pinned ICU scalar functions, original frozen trie/exception macros and complete generated Unicode data. */
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync, openSync, closeSync, mkdirSync } from "node:fs";
const target = "output/playwright/icu-case-native";
const upstream = `${target}/icu`;
const common = `${upstream}/source/common`;
const fixture = "apps/office/src/external/icu/source/common/native-case-cases.json";
const dataFile = "apps/office/src/external/icu/source/common/ucase_props_data.json";
const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const archiveHash = "3a2e7a47604ba702f345878308e6fefeca612ee895cf4a5f222e7955fabfe0c0";
/** Original byte digest. @param value - Complete bytes. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const archive = `${target}/icu4c-78.3-sources.tgz`;
if (hash(readFileSync(archive)) !== archiveHash)
  throw new Error("Pinned ICU source archive differs");
const sources = {};
/** Verifies a full original file against the declared archive, without replacing original bytes. @param path - Archive-relative source. @returns Complete original text. */
function original(path) {
  const bytes = readFileSync(`${upstream}/${path}`);
  const archived = execFileSync("tar", ["-xOf", archive, `icu/${path}`], {
    maxBuffer: 4 * 1024 * 1024,
  });
  if (!bytes.equals(archived)) throw new Error(`Original source differs: ${path}`);
  sources[path] = hash(bytes);
  return bytes.toString("utf8");
}
const cpp = original("source/common/ucase.cpp");
original("source/common/ucase.h");
original("source/common/utrie2.h");
original("source/common/ucase_props_data.h");
original("source/common/unicode/uchar.h");
original("source/common/unicode/stringoptions.h");
original("source/test/cintltst/cucdtst.c");
original("LICENSE");
const scopeHashes = {};
/** Selects one entire unchanged original function with its declaration macros. @param name - Actual scalar function. @returns Exact original scope. */
function functionScope(name) {
  const marker = cpp.indexOf(`${name}(UChar32 c`);
  if (marker < 0) throw new Error(`Missing actual scalar function: ${name}`);
  const start = cpp.lastIndexOf("U_CAPI", marker),
    body = cpp.indexOf("{", marker);
  let end = body + 1,
    depth = 1;
  for (; depth; end++) {
    if (cpp[end] === "{") depth++;
    else if (cpp[end] === "}") depth--;
  }
  const scope = cpp.slice(start, end);
  scopeHashes[name] = hash(scope);
  return scope;
}
const macros = cpp.slice(
  cpp.indexOf("#define GET_EXCEPTIONS"),
  cpp.indexOf("/* simple case mappings"),
);
scopeHashes["original exception macros and flagsOffset"] = hash(macros);
const implementations = [
  "ucase_tolower",
  "ucase_toupper",
  "ucase_totitle",
  "ucase_fold",
  "u_tolower",
  "u_toupper",
  "u_totitle",
  "u_foldCase",
]
  .map(functionScope)
  .join("\n\n");
const boundaries = [-2147483648, -1114113, -65536, -1, 0x110000, 0x110001, 0x7fffffff];
const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0x80000000, 0xffffffff];
const fields = [
  "code",
  "index",
  "props",
  "exceptionOffset",
  "exceptionWord",
  "lower",
  "upper",
  "title",
  ...options
    .slice(0, 8)
    .map(
      /** Names an original option observation. @param v - Option. @returns Field. */ (v) =>
        `fold${v}`,
    ),
];
const driver = String.raw`#include "ucase.h"
#include "unicode/uchar.h"
#include "unicode/stringoptions.h"
#include <array>
#include <bit>
#include <cstdio>
#include <iostream>
#include <string>
static_assert(std::endian::native == std::endian::little);
#define INCLUDED_FROM_UCASE_CPP
#include "ucase_props_data.h"
${macros}
${implementations}
template<typename T,size_t N>void emitArray(const T(&a)[N]){std::cout<<'[';for(size_t i=0;i<N;i++){if(i)std::cout<<',';std::cout<<int64_t(a[i]);}std::cout<<']';}
void emitRow(UChar32 c){auto &t=ucase_props_singleton.trie;auto index=_UTRIE2_INDEX_FROM_CP(&t,t.indexLength,c);uint16_t props=UTRIE2_GET16(&t,c);uint32_t offset=0xffffffff,exc=0xffffffff;if(UCASE_HAS_EXCEPTION(props)){offset=GET_EXCEPTIONS(&ucase_props_singleton,props)-ucase_props_exceptions;exc=ucase_props_exceptions[offset];}std::array<uint32_t,${fields.length}>row={uint32_t(c),uint32_t(index),props,offset,exc,uint32_t(u_tolower(c)),uint32_t(u_toupper(c)),uint32_t(u_totitle(c)),uint32_t(u_foldCase(c,0)),uint32_t(u_foldCase(c,1)),uint32_t(u_foldCase(c,2)),uint32_t(u_foldCase(c,3)),uint32_t(u_foldCase(c,4)),uint32_t(u_foldCase(c,5)),uint32_t(u_foldCase(c,6)),uint32_t(u_foldCase(c,7))};if(std::fwrite(row.data(),sizeof(uint32_t),row.size(),stdout)!=row.size())std::exit(3);}
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"points";
if(mode=="points"){for(UChar32 c=0;c<=0x10ffff;c++)emitRow(c);return 0;}
if(mode=="bounds"){UChar32 bounds[]={${boundaries.join(",")}};for(auto c:bounds)emitRow(c);return 0;}
if(mode=="options"){uint32_t options[]={${options.join(",")}};std::cout<<'[';bool comma=false;for(UChar32 c=0;c<=0x10ffff;c++){auto props=UTRIE2_GET16(&ucase_props_singleton.trie,c);if(!UCASE_HAS_EXCEPTION(props))continue;auto exc=*GET_EXCEPTIONS(&ucase_props_singleton,props);if(!(exc&UCASE_EXC_CONDITIONAL_FOLD))continue;for(auto o:options){if(comma)std::cout<<',';comma=true;std::cout<<'['<<c<<','<<o<<','<<u_foldCase(c,o)<<']';}}std::cout<<']';return 0;}
if(mode=="slots"){std::array<bool,4096>seen{};std::cout<<'[';bool comma=false;for(UChar32 c=0;c<=0x10ffff;c++){auto props=UTRIE2_GET16(&ucase_props_singleton.trie,c);if(!UCASE_HAS_EXCEPTION(props))continue;auto offset=props>>UCASE_EXC_SHIFT;if(seen[offset])continue;seen[offset]=true;auto exc=ucase_props_exceptions[offset];for(int idx=0;idx<8;idx++){if(!HAS_SLOT(exc,idx))continue;auto pe=ucase_props_exceptions+offset+1;int32_t v;GET_SLOT_VALUE(exc,idx,pe,v);if(comma)std::cout<<',';comma=true;std::cout<<'['<<offset<<','<<exc<<','<<idx<<','<<int(SLOT_OFFSET(exc,idx))<<','<<(pe-ucase_props_exceptions)<<','<<v<<']';}}std::cout<<']';return 0;}
if(mode=="macro-slots"){uint16_t payload[]={0,0,0,1,0x1234,0x7fff,0xffff,0,0x8000,0xd800,0xdc00,0xffff,0x7fff,1,0x5555,0xaaaa,0,0xffff,0x8000};std::cout<<"{\"payload\":";emitArray(payload);std::cout<<",\"cases\":[";bool comma=false;for(int wide=0;wide<2;wide++)for(int mask=0;mask<256;mask++)for(int idx=0;idx<8;idx++){if(!HAS_SLOT(mask,idx))continue;uint16_t exc=mask|(wide?UCASE_EXC_DOUBLE_SLOTS:0);const uint16_t *pe=payload+3;int32_t value;GET_SLOT_VALUE(exc,idx,pe,value);if(comma)std::cout<<',';comma=true;std::cout<<'['<<exc<<','<<idx<<','<<int(SLOT_OFFSET(exc,idx))<<','<<(pe-payload)<<','<<value<<']';}std::cout<<"]}";return 0;}
if(mode=="data"){auto&t=ucase_props_singleton.trie;std::cout<<"{\"dataVersion\":";emitArray(ucase_props_dataVersion);std::cout<<",\"indexes\":";emitArray(ucase_props_indexes);std::cout<<",\"trieIndex\":";emitArray(ucase_props_trieIndex);std::cout<<",\"exceptions\":";emitArray(ucase_props_exceptions);std::cout<<",\"unfold\":";emitArray(ucase_props_unfold);std::cout<<",\"formatVersion\":";emitArray(ucase_props_singleton.formatVersion);std::cout<<",\"trie\":{\"data16Offset\":"<<(t.data16-t.index)<<",\"indexLength\":"<<t.indexLength<<",\"dataLength\":"<<t.dataLength<<",\"index2NullOffset\":"<<t.index2NullOffset<<",\"dataNullOffset\":"<<t.dataNullOffset<<",\"initialValue\":"<<t.initialValue<<",\"errorValue\":"<<t.errorValue<<",\"highStart\":"<<t.highStart<<",\"highValueIndex\":"<<t.highValueIndex<<",\"length\":"<<t.length<<",\"isMemoryOwned\":"<<(t.isMemoryOwned?"true":"false")<<",\"padding1\":"<<(t.padding1?"true":"false")<<",\"padding2\":"<<t.padding2<<"},\"nullPointers\":["<<(ucase_props_singleton.mem==nullptr)<<','<<(t.data32==nullptr)<<','<<(t.memory==nullptr)<<','<<(t.newTrie==nullptr)<<"]}";return 0;}
}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/driver.cpp`, driver);
const flags = ["-std=c++20", "-DU_STATIC_IMPLEMENTATION", `-I${common}`];
/** Compiles only complete unchanged original scalar scopes and original full headers/data. @param sanitized - Sanitizer flag. @returns Binary. */
function build(sanitized) {
  const binary = `${target}/driver${sanitized ? "-asan" : ""}`;
  const result = spawnSync(
    "clang++",
    [
      ...flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      `${target}/driver.cpp`,
      "-o",
      binary,
    ],
    { encoding: "utf8" },
  );
  writeFileSync(`${binary}.compile.stderr`, result.stderr);
  if (result.status !== 0) throw new Error(result.stderr);
  return binary;
}
const binary = build(false);
const dependencies = execFileSync("clang++", [...flags, "-MM", `${target}/driver.cpp`], {
  encoding: "utf8",
})
  .split(/\s+/)
  .filter(
    /** Selects actual original compiler dependencies. @param p - Dependency path. @returns Original source flag. */ (
      p,
    ) => p.startsWith(upstream + "/"),
  );
for (const p of new Set(dependencies)) original(p.slice(upstream.length + 1));
const configuration = execFileSync("clang++", [...flags, "-dM", "-E", `${target}/driver.cpp`], {
  encoding: "utf8",
});
writeFileSync(`${target}/configuration.txt`, configuration);
/** Captures exact native bytes with diagnostics retained. @param executable - Binary. @param mode - Corpus. @returns Raw output. */
function capture(executable, mode) {
  const path = `${executable}.${mode}`,
    fd = openSync(path, "w");
  let result;
  try {
    result = spawnSync(executable, [mode], {
      stdio: ["ignore", fd, "pipe"],
      encoding: "utf8",
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
  } finally {
    closeSync(fd);
  }
  writeFileSync(path + ".stderr", result.stderr);
  if (result.status !== 0) throw new Error(`${mode}: ${result.stderr}`);
  return readFileSync(path);
}
const captured = {};
for (const mode of ["points", "bounds", "options", "slots", "macro-slots", "data"])
  captured[mode] = capture(binary, mode);
const sanitized = build(true);
for (const [mode, bytes] of Object.entries(captured))
  if (!capture(sanitized, mode).equals(bytes)) throw new Error(`Sanitized output differs: ${mode}`);
const raw = captured.points,
  width = fields.length,
  count = 0x110000;
if (raw.length !== count * width * 4) throw new Error("Incomplete native scalar corpus");
const initial = Array.from(
    { length: width },
    /** Reads one original row field. @param unused - Placeholder. @param i - Column. @returns UInt32. */ (
      _,
      i,
    ) => raw.readUInt32LE(i * 4),
  ),
  runs = [];
let previous = initial,
  last = null;
for (let row = 1; row < count; row++) {
  const next = [],
    delta = [];
  for (let col = 0; col < width; col++) {
    const v = raw.readUInt32LE((row * width + col) * 4);
    next.push(v);
    delta.push(v - previous[col]);
  }
  if (
    last &&
    last
      .slice(1)
      .every(
        /** Compares captured neighboring deltas only. @param v - Delta. @param i - Column. @returns Equality. */ (
          v,
          i,
        ) => v === delta[i],
      )
  )
    last[0]++;
  else {
    last = [1, ...delta];
    runs.push(last);
  }
  previous = next;
}
const restored = Buffer.alloc(raw.length);
let current = [...initial],
  position = 0;
/** Reconstructs all observed native bytes for a losslessness proof. @returns Nothing. */
function storeRow() {
  for (const v of current) {
    restored.writeUInt32LE(v, position);
    position += 4;
  }
}
storeRow();
for (const [n, ...d] of runs)
  for (let i = 0; i < n; i++) {
    current = current.map(
      /** Adds only captured neighboring deltas. @param v - Prior field. @param c - Column. @returns Field. */ (
        v,
        c,
      ) => v + d[c],
    );
    storeRow();
  }
if (!restored.equals(raw)) throw new Error("Generic corpus encoding is not lossless");
const patches = {};
const unpacked = readFileSync(
  "vendor/libreoffice-reference/external/icu/UnpackedTarball_icu.mk",
  "utf8",
);
const patchPaths = execFileSync(
  "git",
  ["-C", "vendor/libreoffice-reference", "ls-tree", "-r", "--name-only", pin, "external/icu"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(
    /** Selects all original ICU patches, including conditional build variants. @param p - Original path. @returns Patch flag. */ (
      p,
    ) => /\.patch(?:\.\d+)?$/.test(p),
  );
for (const p of patchPaths) {
  const b = readFileSync(`vendor/libreoffice-reference/${p}`);
  if (!b.equals(execFileSync("git", ["-C", "vendor/libreoffice-reference", "show", `${pin}:${p}`])))
    throw new Error(`Pinned LO patch differs: ${p}`);
  patches[p] = {
    hash: hash(b),
    modifiedPaths: [...b.toString().matchAll(/^\+\+\+ ([^\t\n ]+)/gm)].map(
      /** Retains the original modified path. @param m - Diff header. @returns Path. */ (m) => m[1],
    ),
  };
}
const record = {
  baselineCommit: pin,
  icuVersion: "78.3",
  archiveHash,
  sourceHashes: sources,
  scopeHashes,
  patches,
  unpackedHash: hash(unpacked),
  configuration: { flags, macrosHash: hash(configuration), endian: "little" },
  driverHash: hash(driver),
  fields,
  count,
  rawBytes: raw.length,
  rawHash: hash(raw),
  compressedRows: gzipSync(Buffer.from(JSON.stringify({ initial, runs })), { level: 9 }).toString(
    "base64",
  ),
  boundaries,
  boundaryRows: Array.from(
    { length: boundaries.length },
    /** Reads all original signed-input observations. @param unused - Placeholder. @param r - Row. @returns Complete UInt32 row. */ (
      _,
      r,
    ) =>
      Array.from(
        { length: width },
        /** Reads native field. @param unused - Placeholder. @param c - Column. @returns Original field. */ (
          _,
          c,
        ) => captured.bounds.readUInt32LE((r * width + c) * 4),
      ),
  ),
  options: JSON.parse(captured.options),
  slots: JSON.parse(captured.slots),
  macroSlots: JSON.parse(captured["macro-slots"]),
  dataHash: hash(captured.data),
};
const captureOnly = process.argv.includes("--capture-only"),
  write = process.argv.includes("--write"),
  check = process.argv.includes("--check");
if (Number(captureOnly) + Number(write) + Number(check) !== 1)
  throw new Error("Use exactly --capture-only, --write or --check");
if (captureOnly) {
  writeFileSync(`${target}/capture.json`, JSON.stringify({ ...record, initial, runs }));
  writeFileSync(`${target}/data.json`, captured.data);
}
for (const [path, value] of [
  [fixture, record],
  [dataFile, JSON.parse(captured.data)],
]) {
  if (write) writeFileSync(path, JSON.stringify(value) + "\n");
  else if (
    !captureOnly &&
    JSON.stringify(JSON.parse(readFileSync(path, "utf8"))) !== JSON.stringify(value)
  )
    throw new Error(`Native fixture differs: ${path}`);
}
console.log(
  JSON.stringify({
    status: captureOnly ? "captured" : write ? "written" : "verified",
    count,
    width,
    rawBytes: raw.length,
    runs: runs.length,
    slotObservations: record.slots.length,
    sourceFiles: Object.keys(sources).length,
    rawHash: record.rawHash,
    driverHash: record.driverHash,
  }),
);
