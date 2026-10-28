/** @fileoverview Compiles original ICU SDK constructors/cache with concrete native application key/value clients, without replacing any library implementation or production factory. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
const target = "test-results/native/B8TCAE-cache-sdk-constructors",
  source = resolve("vendor/icu-reference/source"),
  build = resolve("test-results/native/B8TCAE-icu");
mkdirSync(target, { recursive: true });
/** Hashes original header/library/caller bytes. @param value - Source bytes. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const reference = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/cache-key-description.native-observations.json",
    "utf8",
  ),
);
const cacheReference = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/unifiedcache.native-observations.json",
    "utf8",
  ),
);
const sourceHashes = {},
  libraryHashes = {};
for (const [path, expected] of Object.entries({
  ...reference.sourceHashes,
  ...cacheReference.sourceHashes,
})) {
  const actual = hash(readFileSync(source + "/" + path));
  if (actual !== expected) throw Error("Changed original ICU source " + path);
  sourceHashes[path] = actual;
}
for (const [path, expected] of Object.entries(reference.libraryHashes)) {
  const actual = hash(readFileSync(build + "/" + path));
  if (actual !== expected) throw Error("Changed original ICU archive " + path);
  libraryHashes[path] = actual;
}
const driver = String.raw`#include "unifiedcache.h"
#include "sharedcalendar.h"
#include "unicode/putil.h"
#include <iostream>
#include <memory>
#include <cstring>
using namespace icu;
class AppValue:public SharedObject{public:int id;explicit AppValue(int n):id(n){}};
class DirectKey:public CacheKeyBase{public:int id;explicit DirectKey(int n):id(n){}DirectKey*clone()const override{return new DirectKey(*this);}int32_t hashCode()const override{return id;}bool equals(const CacheKeyBase&o)const override{auto p=dynamic_cast<const DirectKey*>(&o);return p&&id==p->id;}const SharedObject*createObject(const void*,UErrorCode&s)const override{if(U_FAILURE(s))return nullptr;auto p=new AppValue(id);p->addRef();return p;}char*writeDescription(char*b,int32_t n)const override{std::strncpy(b,"direct",n);b[n-1]=0;return b;}};
class AppKey:public CacheKey<AppValue>{public:int id;explicit AppKey(int n):id(n){}AppKey(const AppKey&o):CacheKey<AppValue>(o),id(o.id){}AppKey*clone()const override{return new AppKey(*this);}int32_t hashCode()const override{return id;}bool equals(const CacheKeyBase&o)const override{auto p=dynamic_cast<const AppKey*>(&o);return p&&id==p->id;}const AppValue*createObject(const void*,UErrorCode&s)const override{if(U_FAILURE(s))return nullptr;auto p=new AppValue(id);p->addRef();return p;}};
U_NAMESPACE_BEGIN
template<> const AppValue*LocaleCacheKey<AppValue>::createObject(const void*,UErrorCode&s)const{if(U_FAILURE(s))return nullptr;auto p=new AppValue(int(std::strlen(fLoc.getName())));p->addRef();return p;}
U_NAMESPACE_END
int main(int argc,char**argv){u_setDataDirectory(argv[1]);std::cout<<typeid(AppValue).name()<<'\n';UErrorCode s=U_ZERO_ERROR;DirectKey direct(7);std::unique_ptr<CacheKeyBase>dc(direct.clone());auto dv=static_cast<const AppValue*>(direct.createObject(nullptr,s));std::cout<<direct.hashCode()<<' '<<dc->hashCode()<<' '<<(*dc==direct)<<' '<<dv->id<<' '<<dv->getRefCount();dv->removeRef();AppKey key(11);std::unique_ptr<CacheKeyBase>kc(key.clone());auto kv=key.createObject(nullptr,s);std::cout<<' '<<key.hashCode()<<' '<<kc->hashCode()<<' '<<(*kc==key)<<' '<<kv->id<<' '<<kv->getRefCount();kv->removeRef();LocaleCacheKey<AppValue>locale(Locale("en_US"));std::unique_ptr<CacheKeyBase>lc(locale.clone());LocaleCacheKey<SharedCalendar>production(Locale("en_US"));auto lv=locale.createObject(nullptr,s);std::cout<<' '<<locale.hashCode()<<' '<<lc->hashCode()<<' '<<(*lc==locale)<<' '<<(locale==production)<<' '<<(locale==direct)<<' '<<lv->id<<' '<<lv->getRefCount();lv->removeRef();UnifiedCache::getInstance(s);UnifiedCache cache(s);const AppValue*first=nullptr,*second=nullptr;cache.get(key,&cache,first,s);cache.get(key,&cache,second,s);std::cout<<' '<<int(s)<<' '<<bool(first)<<' '<<(first==second)<<' '<<first->id<<' '<<first->getRefCount()<<' '<<cache.keyCount()<<' '<<cache.unusedCount();SharedObject::clearPtr(first);SharedObject::clearPtr(second);cache.flush();std::cout<<' '<<cache.keyCount()<<' '<<cache.unusedCount()<<'\n';}`;
writeFileSync(target + "/driver.cc", driver);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    "-I" + source + "/common",
    "-I" + source + "/i18n",
    target + "/driver.cc",
    build + "/lib/libicui18n.a",
    build + "/lib/libicuuc.a",
    build + "/stubdata/libicudata.a",
    "-o",
    target + "/driver",
  ],
  { stdio: "inherit" },
);
const lines = execFileSync(target + "/driver", [source + "/data/in"], { encoding: "utf8" })
  .trimEnd()
  .split("\n");
if (lines.length !== 2) throw Error("Native SDK client output differs");
const captured = {
  icuVersion: "78.3",
  sourceHashes,
  libraryHashes,
  witnessSha256: hash(driver),
  valueTypeName: lines[0],
  scope:
    "Original default/copy key constructors, locale/type equality, actual SharedObject references and UnifiedCache protocol. Concrete application key/value classes implement the original abstract extension interfaces in the compiled caller. Their factories allocate real SharedObject-derived values and return actual owned hard references; the original library and production Calendar factory are unchanged. No private field/counter or source algorithm is substituted. Native physical allocator/threading and whole application ABI parity are not claimed.",
  snapshot: lines[1].split(" ").map(Number),
};
const fixture =
  "apps/office/src/external/icu/source/common/cache-sdk-constructors.native-observations.json";
if (process.argv.includes("--write"))
  writeFileSync(fixture, JSON.stringify(captured, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(captured))
  throw Error("Native SDK constructor fixture differs");
console.log("Verified original ICU SDK default/copy constructor and ownership observation");
