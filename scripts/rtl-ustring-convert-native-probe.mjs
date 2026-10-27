/** @fileoverview Observes unchanged pinned forward conversion wrappers and their real allocator/free order over core SAL descriptors. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  driver as reverseDriver,
  sources,
  source,
  definition,
} from "./rtl-string-convert-native-probe.mjs";
const output = "output/playwright/rtl-ustring-convert-native";
const unicode = source("sal/rtl/ustring.cxx"),
  header = source("include/rtl/ustring.h"),
  template = source("sal/rtl/strtmpl.hxx");
const structure = header.match(/typedef struct _rtl_uString[\s\S]*?\} rtl_uString;/)?.[0];
const empty = template.match(
  /template <>\s*inline rtl_uString EmptyStringImpl<rtl_uString>::data = \{[\s\S]*?\};/,
)?.[0];
if (!structure || !empty) throw new Error("Original Unicode declarations changed");
const wrappers = [
  "rtl_uString* rtl_uString_ImplAlloc(",
  "void SAL_CALL rtl_uString_acquire(",
  "void SAL_CALL rtl_uString_release(",
  "void SAL_CALL rtl_uString_new(",
  "rtl_uString* SAL_CALL rtl_uString_alloc(",
  "static int rtl_ImplGetFastUTF8UnicodeLen(",
  "static void rtl_string2UString_status(",
  "void SAL_CALL rtl_string2UString(",
  "sal_Bool rtl_convertStringToUString(",
]
  .map((marker) => definition(unicode, marker))
  .join("\n");
let base = reverseDriver.slice(0, reverseDriver.indexOf("struct Event"));
base = base.replace(
  "namespace rtl::str {",
  `${structure}\nnamespace rtl::str {\n// Nonstatic interned strings are outside this probe; the original release owner traps rather than substitutes that service.\ninline void internRelease(rtl_uString*){std::abort();}`,
);
const declaration =
  "template <typename rtl_tString> struct EmptyStringImpl {static rtl_tString data;};";
base = base.replace(declaration, declaration + "\n" + empty);
const inputs = [
  [],
  [65],
  [65, 0, 66],
  [0x80],
  [0xff],
  [0xc2, 0xa9],
  [0xe2, 0x82, 0xac],
  [0xf0, 0x9f, 0x98, 0x80],
  [0xe0, 0x80, 0x80],
  [0xf8, 0x88, 0x80, 0x80, 0x80],
  [0xc2, 65],
  [0xef, 0xbb, 0xbf, 65],
  [0xe2, 0x82],
  Array(12).fill(0xc2),
  [65, ...Array(22).fill(0xff), 66],
];
const flagSets = [0, 0x111, 0x222, 0x333, 0x334, 0x10333];
const driver =
  base +
  String.raw`
#define RTL_LOG_STRING_NEW(x) ((void)0)
${wrappers}
struct Event {unsigned kind,id;std::size_t bytes;};static std::vector<Event> events;static std::map<void*,std::pair<unsigned,std::size_t>> live;static unsigned nextId=1;
static void* observeAllocate(std::size_t bytes){auto p=std::malloc(bytes);if(p){live[p]={nextId++,bytes};events.push_back({0,live[p].first,bytes});}return p;}
static void observeFree(void* p){events.push_back({1,live.at(p).first,live.at(p).second});live.erase(p);std::free(p);}
struct Result{bool ok,same;sal_Int32 ref,length;unsigned id;std::vector<unsigned> units;std::vector<Event> events;};
static Result convert(unsigned encoding,std::vector<unsigned> const& input,unsigned flags,bool checked){events.clear();nextId=1;assert(live.empty());rtl_uString* old=rtl_uString_alloc(1);old->buffer[0]=u'Q';rtl_uString_acquire(old);rtl_uString* target=old;std::vector<char> bytes;for(unsigned b:input)bytes.push_back(char(b));bool ok=true;if(checked)ok=rtl_convertStringToUString(&target,bytes.data(),bytes.size(),encoding,flags);else rtl_string2UString(&target,bytes.data(),bytes.size(),encoding,flags);Result r{ok,target==old,target->refCount,target->length,live.count(target)?live.at(target).first:0,{},{}};for(int i=0;i<=target->length;++i)r.units.push_back(target->buffer[i]);rtl_uString_release(target);rtl_uString_release(old);r.events=events;assert(live.empty());return r;}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
int main(){rtl_allocateString=observeAllocate;rtl_freeString=observeFree;std::cout<<"{\"digests\":[";bool comma=false;
for(unsigned encoding:{1u,11u,12u,76u})for(bool checked:{false,true}){std::uint32_t hash=2166136261u;for(unsigned unit=0;unit<65536;++unit){auto r=convert(encoding,{unit>>8,unit&255},0x333,checked);for(unsigned value:{unit,unsigned(r.ok),unsigned(r.same),unsigned(r.ref),unsigned(r.length),r.id})hash=mix(hash,value);for(unsigned u:r.units)hash=mix(hash,u);for(auto const& e:r.events){hash=mix(hash,e.kind);hash=mix(hash,e.id);hash=mix(hash,e.bytes);}}if(comma)std::cout<<',';comma=true;std::cout<<"{\"encoding\":"<<encoding<<",\"checked\":"<<checked<<",\"hash\":"<<hash<<"}";}
std::cout<<"],\"cases\":[";comma=false;std::vector<std::vector<unsigned>> inputs={${inputs.map((a) => `{${a.join(",")}}`).join(",")}};
for(unsigned encoding:{1u,11u,12u,76u})for(unsigned input=0;input<inputs.size();++input)for(unsigned flags:{${flagSets.map((f) => f + "u").join(",")}})for(bool checked:{false,true}){auto r=convert(encoding,inputs[input],flags,checked);if(comma)std::cout<<',';comma=true;std::cout<<"{\"encoding\":"<<encoding<<",\"input\":"<<input<<",\"flags\":"<<flags<<",\"checked\":"<<checked<<",\"ok\":"<<r.ok<<",\"same\":"<<r.same<<",\"ref\":"<<r.ref<<",\"length\":"<<r.length<<",\"id\":"<<r.id<<",\"units\":[";for(unsigned i=0;i<r.units.size();++i){if(i)std::cout<<',';std::cout<<r.units[i];}std::cout<<"],\"events\":[";for(unsigned i=0;i<r.events.size();++i){if(i)std::cout<<',';auto e=r.events[i];std::cout<<'['<<e.kind<<','<<e.id<<','<<e.bytes<<']';}std::cout<<"]}";}std::cout<<"]}\n";}
`;
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/probe.cxx`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsigned-char",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    `${output}/probe.cxx`,
    "-o",
    `${output}/probe`,
  ],
  { stdio: "inherit" },
);
const result = JSON.parse(
  execFileSync(`${output}/probe`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
);
writeFileSync(
  "apps/office/src/sal/rtl/ustring-convert.native.json",
  JSON.stringify(
    {
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      driverHash: createHash("sha256").update(driver).digest("hex"),
      scope:
        "Unchanged forward checked/unchecked wrappers, real core SAL descriptor and conversion bodies, original Unicode allocation/refcount/free templates. Full registry and nonstatic intern services trap and are never called. Original atomics and malloc/free hooks; nonfatal diagnostic/log macros omitted. ASan/UBSan. This observes core wrapper behavior, not the full SAL ABI, full encoding registry, allocation failure behavior or Writer parity.",
      sources,
      inputs,
      ...result,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    pairs: result.digests.length * 65536,
    vectors: result.cases.length,
    sanitized: true,
  }),
);
