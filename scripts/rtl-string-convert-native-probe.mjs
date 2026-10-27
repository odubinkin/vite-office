/** @fileoverview Observes unchanged original byte ownership and checked conversion over real core SAL descriptors. */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const root = "vendor/libreoffice-reference/",
  target = "output/playwright/rtl-string-convert-native",
  sources = {};
export { sources };
/** Loads pinned original source. @param path - Original path. @returns Original text. */
export function source(path) {
  const text = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(text).digest("hex");
  return text;
}
/** Retains original bodies while removing external include directives. @param text - Original source. @returns Adapted text. */
export function includes(text) {
  return text.replace(/^#include.*$/gm, "");
}
/** Extracts one unchanged balanced definition, skipping strings and comments. @param text - Source. @param marker - Unique definition marker. @returns Exact original definition. */
export function definition(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`Missing original definition: ${marker}`);
  const first = text.indexOf("{", start);
  let depth = 0,
    state = "code";
  for (let i = first; i < text.length; i++) {
    const c = text[i],
      next = text[i + 1];
    if (state === "line") {
      if (c === "\n") state = "code";
      continue;
    }
    if (state === "block") {
      if (c === "*" && next === "/") {
        state = "code";
        i++;
      }
      continue;
    }
    if (state === '"' || state === "'") {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === state) state = "code";
      continue;
    }
    if (c === "/" && next === "/") {
      state = "line";
      i++;
      continue;
    }
    if (c === "/" && next === "*") {
      state = "block";
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      state = c;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return text.slice(start, i + 1);
  }
  throw new Error(`Unclosed original definition: ${marker}`);
}
const constants = includes(source("include/rtl/textenc.h"));
const flagHeader = source("include/rtl/textcvt.h");
const flags = [
  ...flagHeader.matchAll(
    /^#define\s+(RTL_(?:TEXTTOUNICODE|UNICODETOTEXT)_[A-Z0-9_]+)\s+([^\n\\]+)$/gm,
  ),
]
  .map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) =>
      `#define ${m[1]} ${m[2]}`,
  )
  .join("\n");
const handles = [...flagHeader.matchAll(/^typedef void\* rtl_\w+;/gm)]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const character = source("include/rtl/character.hxx");
const charConstants = [...character.matchAll(/^sal_uInt32 const surrogates\w+ = 0x[\dA-F]+;$/gm)]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const charFunctions = [
  "isUnicodeCodePoint",
  "isSurrogate",
  "isHighSurrogate",
  "isLowSurrogate",
  "getHighSurrogate",
  "getLowSurrogate",
  "combineSurrogates",
  "splitSurrogates",
  "isUnicodeScalarValue",
]
  .map(
    /** Applies map to name. @param name - name value. @returns Callback result. */ (name) => {
      const m = character.match(new RegExp(`inline SAL_CONSTEXPR [^\\n]+ ${name}\\(`));
      if (!m) throw Error(name);
      return definition(character, m[0]);
    },
  )
  .join("\n");
const safeint = definition(
  source("include/o3tl/safeint.hxx"),
  "template <std::signed_integral T> constexpr std::make_unsigned_t<T> make_unsigned",
);
const intcast = definition(
  source("include/sal/types.h"),
  "template< typename T1, typename T2 > inline T1 static_int_cast",
);
const tenchelp = includes(source("sal/textenc/tenchelp.hxx"));
const infoHeader = source("include/rtl/tencinfo.h");
const infoStruct = infoHeader.match(
  /typedef struct _rtl_TextEncodingInfo[\s\S]*?\} rtl_TextEncodingInfo;/,
)?.[0];
const infoFlags = [...infoHeader.matchAll(/^#define RTL_TEXTENCODING_INFO_.*$/gm)]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const tencinfo = source("sal/textenc/tencinfo.cxx");
const byteHeader = source("include/rtl/string.h");
const byteStruct = byteHeader.match(/typedef struct _rtl_String[\s\S]*?\} rtl_String;/)?.[0];
const strimp = source("sal/rtl/strimp.hxx");
const strFlags = [...strimp.matchAll(/^#define SAL_STRING_.*$/gm)]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const allocatorTypes = strimp.match(
  /typedef void \*\(SAL_CALL \* rtl_allocateStringFn\)\(size_t size\);[\s\S]*?typedef void {2}\(\*rtl_freeStringFn\)\(void \*\);/,
)?.[0];
if (!infoStruct || !byteStruct || !allocatorTypes) throw Error("Original ABI declarations changed");
const allocatorSource = source("sal/rtl/strimp.cxx");
const allocatorGlobals = [
  ...allocatorSource.matchAll(/^rtl_(?:allocate|free)StringFn rtl_\w+ = (?:malloc|free);$/gm),
]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const interlock = source("include/osl/interlck.h");
const atomics = [
  ...interlock.matchAll(/^#\s+define osl_atomic_(?:increment|decrement)\(p\)\s+__sync[^\n]+$/gm),
]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const template = source("sal/rtl/strtmpl.hxx");
const templateFunctions = [
  "template <typename rtl_tString> rtl_tString* Alloc",
  "template <typename rtl_tString> void acquire",
  "template <typename rtl_tString> void release",
  "template <typename rtl_tString> void new_(",
  "template <typename rtl_tString> void new_WithLength",
  "template <typename C> void Copy(",
]
  .map(
    /** Applies map to marker. @param marker - marker value. @returns Callback result. */ (
      marker,
    ) => definition(template, marker),
  )
  .join("\n");
const empty = template.match(
  /template <>\s*inline rtl_String EmptyStringImpl<rtl_String>::data = \{[\s\S]*?\};/,
)?.[0];
const nativeString = source("sal/rtl/string.cxx");
const byteWrappers = [
  "rtl_String* rtl_string_ImplAlloc(",
  "void SAL_CALL rtl_string_acquire(",
  "void SAL_CALL rtl_string_release(",
  "void SAL_CALL rtl_string_new(",
  "rtl_String* SAL_CALL rtl_string_alloc(",
  "void SAL_CALL rtl_string_new_WithLength(",
]
  .map(
    /** Applies map to marker. @param marker - marker value. @returns Callback result. */ (
      marker,
    ) => definition(nativeString, marker),
  )
  .join("\n");
const wrapperFunctions = [
  "static int rtl_ImplGetFastUTF8ByteLen(",
  "static bool rtl_impl_convertUStringToString(",
  "void SAL_CALL rtl_uString2String(",
  "sal_Bool SAL_CALL rtl_convertUStringToString(",
]
  .map(
    /** Applies map to marker. @param marker - marker value. @returns Callback result. */ (
      marker,
    ) => definition(nativeString, marker),
  )
  .join("\n");
const registry = source("sal/textenc/textenc.cxx"),
  core = registry.slice(registry.indexOf("#define NOTABUNI_START"));
const inputs = [
  [],
  [65],
  [65, 0, 66],
  [0x20ac],
  [0x152],
  [0x1eaf],
  [0x6f22],
  [0xd83d, 0xde00],
  [0xd800],
  [0xd800, 65],
  [0xdc00],
  [0xf180],
  [0xff65],
  [0x20ac, 0x152, 0x1eaf, 0x6f22],
  [65, 0xe9, 66],
];
const combinations = [0, 0x11, 0x101, 0x566, 0x22, 0x8466];
export const driver = String.raw`
#include <algorithm>
#include <cassert>
#include <concepts>
#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <iterator>
#include <limits>
#include <map>
#include <type_traits>
#include <vector>
using sal_uInt8=std::uint8_t;using sal_uInt16=std::uint16_t;using sal_uInt32=std::uint32_t;using sal_Int32=std::int32_t;using sal_Unicode=char16_t;using sal_Size=std::size_t;using sal_Bool=bool;using oslInterlockedCount=sal_Int32;
#define SAL_CALL
#define SAL_DLLPUBLIC
#define SAL_DLLPUBLIC_RTTI
#define SAL_DLLPRIVATE
#define SAL_CONSTEXPR constexpr
#define SAL_UNUSED_PARAMETER
#define SAL_UNLIKELY(x) (x)
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
#define RTL_LOG_STRING_DELETE(x) ((void)0)
#define OSL_ASSERT(x) ((void)0)
#define OSL_ENSURE(x,msg) ((void)0)
#define SAL_WARN(area,msg) ((void)0)
${constants}
${flags}
${handles}
namespace o3tl {${safeint}}
namespace sal {${intcast}}
namespace rtl {namespace detail {${charConstants}} ${charFunctions}}
${includes(source("sal/textenc/unichars.hxx"))}
${tenchelp}
${includes(source("sal/textenc/converter.hxx"))}
${includes(source("sal/textenc/unichars.hxx"))}
${includes(source("sal/textenc/unichars.cxx"))}
${includes(source("sal/textenc/handleundefinedunicodetotextchar.hxx"))}
${includes(source("sal/textenc/convertsimple.hxx"))}
${includes(source("sal/textenc/tcvtutf8.hxx"))}
${includes(source("sal/textenc/converter.cxx"))}
${includes(source("sal/textenc/handleundefinedunicodetotextchar.cxx"))}
${includes(source("sal/textenc/convertsimple.cxx"))}
${includes(source("sal/textenc/tcvtutf8.cxx"))}
${infoFlags}
${core}
// The original FullTextEncodingData dependency is trapped, never replaced by a fabricated registry. The caller admits only the five real core factory branches.
extern "C" ImplTextEncodingData const* sal_getFullTextEncodingData(rtl_TextEncoding){std::abort();}
${infoStruct}
${definition(tencinfo, "sal_Bool SAL_CALL rtl_getTextEncodingInfo(")}
${includes(source("sal/textenc/textcvt.cxx"))}
${byteStruct}
${strFlags}
${allocatorTypes}
${allocatorGlobals}
${atomics}
namespace rtl::str {
template <class rtl_tString> using Char_T = std::remove_extent_t<decltype(rtl_tString::buffer)>;
template <typename rtl_tString> struct EmptyStringImpl {static rtl_tString data;};
${empty}
${templateFunctions}
}
${byteWrappers}
${wrapperFunctions}
struct Event {unsigned kind,id;std::size_t bytes;};static std::vector<Event> events;static std::map<void*,std::pair<unsigned,std::size_t>> live;static unsigned nextId=1;
static void* observeAllocate(std::size_t bytes){auto p=std::malloc(bytes);if(p){live[p]={nextId++,bytes};events.push_back({0,live[p].first,bytes});}return p;}
static void observeFree(void* p){events.push_back({1,live.at(p).first,live.at(p).second});live.erase(p);std::free(p);}
struct Result {bool ok,same;sal_Int32 ref,length;unsigned id;std::vector<unsigned> bytes;std::vector<Event> events;};
static Result convert(unsigned encoding,std::vector<sal_Unicode> const& input,unsigned flags,bool checked){events.clear();nextId=1;assert(live.empty());rtl_String* old=rtl_string_alloc(1);old->buffer[0]='Q';rtl_String* target=old;rtl_string_acquire(old);bool ok=true;if(checked)ok=rtl_convertUStringToString(&target,input.data(),input.size(),encoding,flags);else rtl_uString2String(&target,input.data(),input.size(),encoding,flags);Result r{ok,target==old,target->refCount,target->length,live.count(target)?live.at(target).first:0,{},{}};for(int i=0;i<=target->length;++i)r.bytes.push_back(static_cast<unsigned char>(target->buffer[i]));rtl_string_release(target);rtl_string_release(old);r.events=events;assert(live.empty());return r;}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
int main(){rtl_allocateString=observeAllocate;rtl_freeString=observeFree;std::cout<<"{\"digests\":[";bool comma=false;
for(unsigned encoding:{1u,11u,12u,76u})for(bool checked:{false,true}){std::uint32_t hash=2166136261u;for(unsigned unit=0;unit<65536;++unit){auto r=convert(encoding,{sal_Unicode(unit)},0x566,checked);for(unsigned value:{unit,unsigned(r.ok),unsigned(r.same),unsigned(r.ref),unsigned(r.length),r.id})hash=mix(hash,value);for(unsigned b:r.bytes)hash=mix(hash,b);for(auto const& e:r.events){hash=mix(hash,e.kind);hash=mix(hash,e.id);hash=mix(hash,e.bytes);}}if(comma)std::cout<<',';comma=true;std::cout<<"{\"encoding\":"<<encoding<<",\"checked\":"<<checked<<",\"hash\":"<<hash<<"}";}
std::cout<<"],\"cases\":[";comma=false;std::vector<std::vector<sal_Unicode>> inputs={${inputs.map(/** Applies map to a. @param a - a value. @returns Callback result. */ (a) => `{${a.join(",")}}`).join(",")}};
for(unsigned encoding:{1u,11u,12u,76u})for(unsigned input=0;input<inputs.size();++input)for(unsigned flags:{${combinations.map(/** Applies map to f. @param f - f value. @returns Callback result. */ (f) => `${f}u`).join(",")}})for(bool checked:{false,true}){auto r=convert(encoding,inputs[input],flags,checked);if(comma)std::cout<<',';comma=true;std::cout<<"{\"encoding\":"<<encoding<<",\"input\":"<<input<<",\"flags\":"<<flags<<",\"checked\":"<<checked<<",\"ok\":"<<r.ok<<",\"same\":"<<r.same<<",\"ref\":"<<r.ref<<",\"length\":"<<r.length<<",\"id\":"<<r.id<<",\"bytes\":[";for(unsigned i=0;i<r.bytes.size();++i){if(i)std::cout<<',';std::cout<<r.bytes[i];}std::cout<<"],\"events\":[";for(unsigned i=0;i<r.events.size();++i){if(i)std::cout<<',';auto e=r.events[i];std::cout<<'['<<e.kind<<','<<e.id<<','<<e.bytes<<']';}std::cout<<"]}";}std::cout<<"]}\n";}
`;
/** Runs the original reverse-wrapper probe when invoked directly. @returns Nothing. */
export function runReverseProbe() {
  mkdirSync(target, { recursive: true });
  writeFileSync(`${target}/probe.cxx`, driver);
  execFileSync(
    "clang++",
    [
      "-std=c++20",
      "-O1",
      "-g",
      "-fsigned-char",
      "-fsanitize=address,undefined",
      "-fno-sanitize-recover=all",
      `${target}/probe.cxx`,
      "-o",
      `${target}/probe`,
    ],
    { stdio: "inherit" },
  );
  const result = JSON.parse(
    execFileSync(`${target}/probe`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
  );
  writeFileSync(
    "apps/office/src/sal/rtl/string-convert.native.json",
    `${JSON.stringify({ baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65", driverHash: createHash("sha256").update(driver).digest("hex"), scope: "Unchanged original checked/unchecked UTF16-to-byte wrappers, byte ownership templates/C wrappers, core factory descriptors, UTF8/single-byte converters and helper/classification dependencies. Primitive SAL types, original atomic macros and malloc/free allocator globals. Full registry service traps and is never invoked. Nonfatal diagnostic/log macros omitted. Real replaceable allocator hooks observe sizes, identities and frees; ASan/UBSan enabled. Core encodings only; not full SAL ABI, OSL or Writer parity.", sources, inputs, ...result }, null, 2)}\n`,
  );
  console.log(
    JSON.stringify({
      bmpCases: result.digests.length * 65536,
      vectors: result.cases.length,
      sanitized: true,
    }),
  );
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
  runReverseProbe();
