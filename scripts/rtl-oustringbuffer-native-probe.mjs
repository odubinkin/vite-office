/** @fileoverview Captures original OUStringBuffer header construction,lifetime and mutations using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-oustringbuffer-native";
const fixture = "apps/office/src/sal/rtl/native-oustringbuffer-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
  "include/rtl/ustrbuf.hxx",
  "include/rtl/stringutils.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const priorRoot = "output/playwright/rtl-float-format-native";
const prior = JSON.parse(readFileSync(`${priorRoot}/manifest.json`, "utf8"));
const priorFixture = JSON.parse(
  readFileSync("apps/office/src/sal/rtl/native-float-format-cases.json", "utf8"),
);
if (prior.state !== "captured" || prior.pin !== pin)
  throw new Error("Missing prior verified full native graph");
for (const [path, expected] of Object.entries(priorFixture.sourceHashes))
  if (
    prior.sourceHashes[path] !== expected ||
    hash(loadUnicodeOriginal(native.sources, path)) !== expected
  )
    throw new Error(`Changed verified original native source:${path}`);
for (const [path, expected] of Object.entries(prior.generatedHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Changed verified generated native header:${path}`);
const objectHashes = {};
/** Uses only completed original translation units with the matching instrumented graph and records actual immutable objects. @param sanitized - Required graph. @returns Verified full dependency object list. */
function objects(sanitized) {
  const entries = prior.commands.filter(
    /** Selects genuine original completed compilation commands. @param command - Prior executed compiler command. @returns Matching original graph. */ (
      command,
    ) =>
      command.tool === "clang++" &&
      command.exitCode === 0 &&
      command.argv.includes("-c") &&
      command.argv.includes("-fsanitize=address,undefined") === sanitized,
  );
  if (entries.length !== 69) throw new Error("Incomplete genuine native object graph");
  return entries.map(
    /** Records actual linked object bytes before execution. @param command - Original completed compile. @returns Object path. */ (
      command,
    ) => {
      const path = command.argv[command.argv.indexOf("-o") + 1];
      objectHashes[path] = hash(readFileSync(path));
      return path;
    },
  );
}
const driver = String.raw`#include <rtl/ustrbuf.hxx>
#include <rtl/ustring.hxx>
#include <rtl/stringutils.hxx>
#include <cstdio>
#include <cstring>
#include <cstdint>
#include <cmath>
#include <cstdlib>
#include <memory>
#include <vector>
#include <string>
#include <limits>
using rtl::OUStringBuffer;using rtl::OUString;
rtl_uString*data(OUStringBuffer&b){rtl_uString**p;sal_Int32*c;b.accessInternals(&p,&c);return *p;}
void units(const sal_Unicode*p,int n){std::putchar('[');for(int i=0;i<=n;i++)std::printf("%s%u",i?",":"",unsigned(p[i]));std::putchar(']');}
void state(OUStringBuffer&b,rtl_uString*before){std::printf("[%d,%d,%d,%d,%d,",b.getCapacity(),b.getLength(),data(b)->refCount,int(b.isEmpty()),int(data(b)==before));units(b.getStr(),b.getLength());std::u16string_view v=b;std::printf(",%u,%d,%d]",b.isEmpty()?0:unsigned(b.charAt(0)),int(b.getMutableStr()==b.getStr()),int(v.data()==b.getStr()&&v.size()==unsigned(b.getLength())));}
void record(int op,const std::string&args,OUStringBuffer&b,rtl_uString*before=nullptr,const OUString*str=nullptr,OUStringBuffer*extra=nullptr){std::printf("[%d,%s,[",op,args.c_str());state(b,before);std::putchar(',');if(str){std::printf("[%d,%d,%d,",str->getLength(),str->pData->refCount,int(str->pData==before));units(str->getStr(),str->getLength());std::putchar(']');}else std::printf("null");std::putchar(',');if(extra)state(*extra,nullptr);else std::printf("null");std::puts("]]");}
std::string number(int n){return "["+std::to_string(n)+"]";}
std::string pair(int a,int b){return "["+std::to_string(a)+","+std::to_string(b)+"]";}
std::vector<sal_Unicode>input(int n){std::vector<sal_Unicode>v;for(int i=0;i<n;i++)v.push_back(i==1?0:i==2?0xd800:i==3?0xdc00:65+i);return v;}
std::string hex(double d){uint64_t u;std::memcpy(&u,&d,8);char s[32];std::sprintf(s,"[\"%016llx\"]",(unsigned long long)u);return s;}
void values(){std::printf("[52,[],[%d]]\n",RTL_USTR_MAX_VALUEOFDOUBLE);for(int n=0;n<=22;n++){
 auto source=input(n);std::u16string_view v(source.data(),source.size());std::unique_ptr<OUStringBuffer>b;
 b=std::make_unique<OUStringBuffer>();record(0,"[]",*b);
 b=std::make_unique<OUStringBuffer>(n);record(1,number(n),*b);
 b=std::make_unique<OUStringBuffer>(v);record(2,number(n),*b);
 b=std::make_unique<OUStringBuffer>("AB");record(3,"[]",*b);
 OUString string(v);b=std::make_unique<OUStringBuffer>(string);record(4,number(n),*b);
 b=std::make_unique<OUStringBuffer>(OUString::Concat(u"Q")+v+u"Z");record(5,number(n),*b);
 b=std::make_unique<OUStringBuffer>(OUString::number(n));record(6,number(n),*b);
 auto before=data(*b);auto copy=std::make_unique<OUStringBuffer>(*b);b.swap(copy);record(7,"[]",*b,before);
 before=data(*b);*b=*b;record(8,"[]",*b,before);
 OUStringBuffer other(v);before=data(*b);*b=other;record(9,number(n),*b,before);
 for(int minimum:{-1,b->getCapacity(),b->getCapacity()+1,99}){before=data(*b);b->ensureCapacity(minimum);record(10,number(minimum),*b,before);}
 before=data(*b);*b=v;record(11,number(n),*b,before);
 before=data(*b);*b=string;record(50,number(n),*b,before);
 before=data(*b);*b="AB";record(12,"[]",*b,before);
 before=data(*b);*b=OUString::Concat(u"Q")+v+u"Z";record(13,number(n),*b,before);
 before=data(*b);*b=OUString::number(n);record(14,number(n),*b,before);
 before=data(*b);b->append(v);record(15,number(n),*b,before);
 before=data(*b);b->append("AB");record(16,"[]",*b,before);
 before=data(*b);b->append(OUString::number(n));record(17,number(n),*b,before);
 before=data(*b);b->append(string);record(18,number(n),*b,before);
 before=data(*b);b->append(OUString::Concat(u"Q")+v+u"Z");record(19,number(n),*b,before);
 before=data(*b);b->insert(0,v);record(20,number(n),*b,before);
 before=data(*b);b->insert(1,"AB");record(21,"[]",*b,before);
 before=data(*b);b->insert(1,OUString::Concat(u"Q")+v+u"Z");record(22,number(n),*b,before);
 before=data(*b);b->insert(0,static_cast<const sal_Unicode*>(nullptr),0);record(23,"[]",*b,before);
 sal_Unicode raw[]={'X',0,'Y'};before=data(*b);b->append(raw,3);record(24,"[]",*b,before);
 const char ascii[]={'X',0,'Y'};before=data(*b);b->appendAscii(ascii,3);record(25,"[]",*b,before);
 for(double x:std::initializer_list<double>{0.,-0.,0.1234567890123456,999999.9999999,1e-40,1e38,INFINITY,-INFINITY,NAN}){
  before=data(*b);b->append(float(x));record(26,hex(x),*b,before);
  before=data(*b);b->append(x);record(27,hex(x),*b,before);
  before=data(*b);b->insert(1,float(x));record(28,hex(x),*b,before);
  before=data(*b);b->insert(1,x);record(29,hex(x),*b,before);
 }
 before=data(*b);b->insert(0,sal_Int32(n-12));record(30,pair(n-12,10),*b,before);
 before=data(*b);b->insert(0,sal_Int32(n+35),16);record(30,pair(n+35,16),*b,before);
 before=data(*b);b->insert(0,sal_Int64(-9223372036854775807LL));record(31,"[\"-9223372036854775807\",10]",*b,before);
 before=data(*b);b->insert(0,sal_Int64(123456789),16);record(31,"[\"123456789\",16]",*b,before);
 before=data(*b);b->insert(1,sal_Unicode(0xffff));record(32,number(0xffff),*b,before);
 before=data(*b);b->appendUtf32(0x1f600);record(33,number(0x1f600),*b,before);
 before=data(*b);b->insertUtf32(1,0x41);record(34,number(0x41),*b,before);
 before=data(*b);auto reserved=b->appendUninitialized(3);reserved[0]=1;reserved[1]=0;reserved[2]=0xffff;record(35,"[]",*b,before);
 before=data(*b);b->remove(1,2);record(36,pair(1,2),*b,before);
 before=data(*b);b->setCharAt(0,0x1234);record(39,"[]",*b,before);
 before=data(*b);b->truncate(5);record(37,number(5),*b,before);
 for(int length:{b->getLength(),2,8}){auto p=b->getMutableStr();for(int i=b->getLength()+1;i<b->getCapacity();i++)p[i]=0x4321;before=data(*b);b->setLength(length);record(40,number(length),*b,before);}
 b=std::make_unique<OUStringBuffer>(0);record(1,number(0),*b);before=data(*b);int old=b->getLength(),length=3*(old+1);b->setLength(length);for(int i=old+1;i<length;i++)b->getMutableStr()[i]=0x1234;record(41,number(length),*b,before);
 before=data(*b);auto text=b->toString();record(42,"[]",*b,before,&text);
 before=data(*b);auto moved=b->makeStringAndClear();record(43,"[]",*b,before,&moved);
 before=data(*b);b->setLength(0);record(40,number(0),*b,before);
 before=data(*b);b->append(v);record(15,number(n),*b,before);
 before=data(*b);*b=std::move(other);record(44,number(n),*b,before,nullptr,&other);
 before=data(*b);*b=std::move(*b);record(45,"[]",*b,before);
 before=data(*b);b->truncate();record(37,number(-1),*b,before);
 before=data(*b);b->insert(-1,OUString::Concat(std::u16string_view()));record(49,"[]",*b,before);
 *b=u"K";auto held=data(*b);rtl_uString_acquire(held);b.reset();std::printf("[46,[],[%d]]\n",held->refCount);rtl_uString_release(held);
 }
 for(long long value:{-9223372036854775807LL,-1LL,0LL,1LL,2147483631LL,2147483647LL,2147483648LL,9223372036854775807LL})for(int margin:{0,16,2147483647}){bool ok=rtl::libreoffice_internal::IsValidStrLen(value,margin);int out=-1;try{out=rtl::libreoffice_internal::ThrowIfInvalidStrLen(value,margin);}catch(const std::bad_alloc&){}std::printf("[47,[\"%lld\",%d],[%d,%d]]\n",value,margin,int(ok),out);}
 std::vector<sal_Unicode>big(1<<24);std::u16string_view large(big.data(),big.size());OUStringBuffer b("A");auto before=data(b);try{b.insert(0,OUString::Concat(large)+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large+large);std::abort();}catch(const std::bad_alloc&){record(48,"[]",b,before);}
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values"){values();return std::ferror(stdout)?3:0;}
 OUStringBuffer b(u"ABC");const char bad[]={'A',0,'B',0};switch(std::stoi(mode)){
 case 0:{OUStringBuffer x(-1);break;}
 case 1:b.setLength(-1);break;
 case 2:b.charAt(-1);break;
 case 3:b.charAt(3);break;
 case 4:b.setCharAt(-1,1);break;
 case 5:b.setCharAt(3,1);break;
 case 6:b.insert(0,static_cast<const sal_Unicode*>(nullptr),1);break;
 case 7:{OUStringBuffer x(bad);break;}
 case 8:b.insert(0,bad);break;
 case 9:b=bad;break;
 case 10:rtl::libreoffice_internal::IsValidStrLen(0,-1);break;
 }return 4;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Links a new observation-only caller to the genuine unchanged original cached object graph. @param sanitized - Required instrumentation. @returns Native executable. */
function build(sanitized) {
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
      "-DCPPU_DLLIMPLEMENTATION",
      `${target}/driver.cpp`,
      ...objects(sanitized),
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
  return binary;
}
/** Captures original process bytes and terminal status. @param binary - Actual caller. @param mode - Native caller input. @returns Process result. */
function capture(binary, mode) {
  const result = spawnSync(binary, [mode], {
    maxBuffer: 32 * 1024 * 1024,
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
    throw new Error(
      `Original OUStringBuffer observations failed:${first.stderr}\n${second.stderr}`,
    );
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
const assertions = [];
for (let code = 0; code <= 10; code++) {
  const r = capture(normal, String(code));
  const expression = r.stderr.toString().match(/Assertion failed: \((.*?)\),/s)?.[1];
  if (r.signal !== "SIGABRT" || !expression)
    throw new Error(`Original buffer assertion failed:${code}:${r.stderr}`);
  assertions.push({ code, signal: r.signal, expression });
}
for (const [path, expected] of Object.entries(objectHashes))
  if (hash(readFileSync(path)) !== expected) throw new Error(`Linked object changed:${path}`);
const result = {
  pin,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Saves complete original source hashes. @param entry - Genuine source. @returns Hash pair. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  objectHashes,
  captures,
  assertions,
  scope:
    "Original OUStringBuffer fundamental constructors,copy/move assignment,capacity,borrowed access,checked mutation,scalar overloads,copy/transfer and destructor plus original length/literal helpers on full genuine69normal+69ASanUBSan SAL/CPPU objects. Only initialized storage is compared;setLength does not promise native zero fill,spare cells are explicitly initialized before observation. Concat overflow uses128valid borrowed views over one real32MiB allocation,no fabricated length/source provider. Unported search/replace/substring/scalar specializations,VCL tag encoding/serialization,ABI and full UI remain pending.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed original OUStringBuffer observations");
console.log(
  `Native OUStringBuffer ${write ? "written" : "verified"}:${assertions.length}assertions;${Object.keys(objectHashes).length}verified objects`,
);
