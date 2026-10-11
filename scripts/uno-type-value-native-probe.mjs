/** @fileoverview Captures original uno::Type values, construction, destruction and exact member ownership using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-type-value-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-type-value-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <com/sun/star/uno/Type.hxx>
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <string>
#include <utility>
#include <vector>
using com::sun::star::uno::Type;using com::sun::star::uno::TypeClass;using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
void value(Type const&t){ref(t.getTypeLibType());emit({static_cast<sal_Int32>(t.getTypeClass())});{rtl::OUString n=t.getTypeName();text(n.pData);ref(t.getTypeLibType());}ref(t.getTypeLibType());}
void values(){emit({com::sun::star::uno::UNO_TYPE_NO_ACQUIRE,SAL_NO_ACQUIRE});Type a;value(a);{Type b(a);value(a);value(b);{Type c(std::move(a));emit({c.getTypeLibType()==a.getTypeLibType()});value(a);value(c);Type d(a.getTypeLibType());value(d);value(a);}value(a);value(b);}value(a);
 rtl::OUString name=rtl::OUString::createFromAscii("value.Enum");{Type b(com::sun::star::uno::TypeClass_ENUM,name);value(b);text(name.pData);{Type c(com::sun::star::uno::TypeClass_ENUM,"value.Enum");emit({b.getTypeLibType()==c.getTypeLibType()});value(b);value(c);text(name.pData);}value(b);text(name.pData);}text(name.pData);
 for(int tag=0;tag<2;tag++){R*r=nullptr;typelib_typedescriptionreference_new(&r,typelib_TypeClass_ENUM,name.pData);ref(r);Type*t=tag==0?new Type(r,com::sun::star::uno::UNO_TYPE_NO_ACQUIRE):new Type(r,SAL_NO_ACQUIRE);emit({t->getTypeLibType()==r});value(*t);text(name.pData);delete t;text(name.pData);}
 Type*b=new Type(nullptr,com::sun::star::uno::UNO_TYPE_NO_ACQUIRE),*c=new Type(nullptr,SAL_NO_ACQUIRE);emit({b->getTypeLibType()==nullptr,c->getTypeLibType()==nullptr,b->equals(*c),*b==*c,*b!=*c,b->isAssignableFrom(*c),a.isAssignableFrom(*b),b->isAssignableFrom(a)});
 D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,*typelib_static_type_getByTypeClass(typelib_TypeClass_LONG));desc(d);a.getDescription(&d);desc(d);value(a);typelib_typedescription_release(d);
 Type missing(com::sun::star::uno::TypeClass_INTERFACE_METHOD,"value.Missing::method");value(missing);d=nullptr;a.getDescription(&d);missing.getDescription(&d);desc(d);value(missing);
}
void assignment(){rtl::OUString an=rtl::OUString::createFromAscii("value.AssignA"),bn=rtl::OUString::createFromAscii("value.AssignB");{Type a(com::sun::star::uno::TypeClass_ENUM,an),b(com::sun::star::uno::TypeClass_ENUM,bn);value(a);value(b);text(an.pData);text(bn.pData);emit({&(a=b)==&a,a.getTypeLibType()==b.getTypeLibType()});value(a);value(b);text(an.pData);text(bn.pData);emit({&(a=a)==&a});value(a);value(b);}text(an.pData);text(bn.pData);
 {Type a(com::sun::star::uno::TypeClass_ENUM,an),b(com::sun::star::uno::TypeClass_ENUM,bn);R*oldA=a.getTypeLibType(),*oldB=b.getTypeLibType();emit({&(a=std::move(b))==&a,a.getTypeLibType()==oldB,b.getTypeLibType()==oldA});value(a);value(b);text(an.pData);text(bn.pData);emit({&(a=std::move(a))==&a,a.getTypeLibType()==oldB});value(a);value(b);}text(an.pData);text(bn.pData);
 Type*nil=new Type(nullptr,com::sun::star::uno::UNO_TYPE_NO_ACQUIRE);emit({&(*nil=*nil)==nil,nil->getTypeLibType()==nullptr,&(*nil=std::move(*nil))==nil});
}
void predicates(){std::vector<Type*>v;for(int j=0;j<15;j++)v.push_back(new Type(*typelib_static_type_getByTypeClass(static_cast<typelib_TypeClass>(j))));for(auto*t:v)value(*t);for(auto*a:v)for(auto*b:v){emit({a->equals(*b),*a==*b,*a!=*b,a->isAssignableFrom(*b)});ref(a->getTypeLibType());ref(b->getTypeLibType());}for(auto it=v.rbegin();it!=v.rend();++it){R*r=(*it)->getTypeLibType();delete *it;ref(r);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values")values();else if(mode=="assignment")assignment();else if(mode=="predicates")predicates();else if(mode=="bad-ascii-name"){char n[]={static_cast<char>(128),0};Type t(com::sun::star::uno::TypeClass_ENUM,n);}else return 2;return 0;}
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
    maxBuffer: 128 * 1024 * 1024,
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
for (const mode of ["values", "assignment", "predicates"]) {
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
for (const mode of ["bad-ascii-name"]) {
  const result = capture(normal, mode);
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original ASCII wrapper guard failed: ${mode}`);
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
    "Full unchanged original Type.h/Type.hxx headers and all69 SAL/CPPU dependency owners rebuilt normal and ASan/UBSan. Default VOID, copy (including rvalue construction selected as copy), pointer acquire and both original no-acquire tags, ASCII/OUString name construction, exact canonical identity, acquired returned name, explicit destructor, replacement description, copy assignment identity/acquire-before-release and original move assignment pointer swap are observed. All15 basic type value pairs exercise actual equality operators and compatibility with complete initialized count/name/common fields. Null no-acquire values are deliberately retained without destruction and only source-defined nullable pointer/predicate methods are used. Physical object allocation/ABI, const/rvalue enforcement, Array/legacy/UnoType template helpers, native threading/shutdown and full Any/Reference/exception/case consumers remain unverified; system libraries are uninstrumented and leak detection is disabled. No original body or method is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original Type observations");
console.log(
  `Original uno::Type observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
