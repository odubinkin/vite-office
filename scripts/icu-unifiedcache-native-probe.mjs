/** @fileoverview Compares original UnifiedCache/SharedObject/UHashtable code with the local actual owners, including cached warnings/errors, alias keys, hard/soft counts, flush and incremental eviction. Run with npx tsx against the existing ICU78.3 native build. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SharedObject } from "../apps/office/src/external/icu/source/common/sharedobject.ts";
import {
  UnifiedCache,
  CacheKey,
} from "../apps/office/src/external/icu/source/common/unifiedcache.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/unifiedcache-witness.cc`,
  String.raw`
#include "unifiedcache.h"
#include "sharedobject.h"
#include <iostream>
#include <vector>
#include <string>
using namespace icu;
int created=0;std::vector<int>destroyed;
class Value:public SharedObject{public:int serial,id;const Value*dep;Value(int i,const Value*d):serial(++created),id(i),dep(d){}~Value(){destroyed.push_back(serial);if(dep)dep->removeRef();}};
class Key:public CacheKey<Value>{public:int id;Key(int i):id(i){}Key(const Key&o):CacheKey<Value>(o),id(o.id){}Key*clone()const override{return new Key(*this);}int32_t hashCode()const override{return id%29;}bool equals(const CacheKeyBase&o)const override{auto p=dynamic_cast<const Key*>(&o);return p&&p->id==id;}const Value*createObject(const void*ctx,UErrorCode&s)const override{if(U_FAILURE(s))return nullptr;if(id<0){s=U_RESOURCE_TYPE_MISMATCH;return nullptr;}auto cache=(UnifiedCache*)ctx;const Value*dep=nullptr;if(id>=1000){cache->get(Key(id%1000),ctx,dep,s);return dep;}auto value=new Value(id,dep);value->addRef();if(id%7==3)s=U_USING_FALLBACK_WARNING;return value;}};
int main(){UErrorCode s=U_ZERO_ERROR;UnifiedCache::getInstance(s);UnifiedCache cache(s);const Value*ptrs[7]={};char op;int a,b,c;while(std::cin>>op){s=U_ZERO_ERROR;if(op=='G'){std::cin>>a>>b>>c;s=UErrorCode(c);cache.get(Key(a),&cache,ptrs[b],s);}else if(op=='C'){std::cin>>a;SharedObject::clearPtr(ptrs[a]);}else if(op=='P'){std::cin>>a>>b>>c;s=UErrorCode(c);cache.setEvictionPolicy(a,b,s);}else if(op=='F')cache.flush();std::cout<<int(s)<<' '<<cache.keyCount()<<' '<<cache.unusedCount()<<' '<<cache.autoEvictedCount()<<' '<<created;for(auto p:ptrs)std::cout<<' '<<(p?p->serial:0)<<' '<<(p?p->id:0)<<' '<<(p?p->getRefCount():0);std::cout<<' '<<destroyed.size();for(int v:destroyed)std::cout<<' '<<v;std::cout<<'\n';}for(auto&p:ptrs)SharedObject::clearPtr(p);cache.flush();}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/unifiedcache-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/unifiedcache-witness`,
  ],
  { stdio: "inherit" },
);
let created = 0;
const destroyed = [];
/** Actual retained shared value; destructor releases the real dependent cache value. */
class Value extends SharedObject {
  /** Transfers an existing dependent hard reference. @param id - Source ID. @param dep - Actual retained dependency/null. @returns Value. */
  constructor(id, dep) {
    super();
    this.id = id;
    this.dep = dep;
    this.serial = ++created;
  }
  /** Native virtual destructor projection. @returns Nothing. */
  dispose() {
    destroyed.push(this.serial);
    if (this.dep !== null) this.dep.removeRef();
  }
}
const type = { name: "Value", identity: Value };
/** Native witness's actual instantiated CacheKey subclass. */
class Key extends CacheKey {
  /** Native ID or copy construction. @param id - ID/source. @returns Key. */
  constructor(id) {
    super(type, id instanceof Key ? id : null);
    this.id = id instanceof Key ? id.id : id;
  }
  /** Original deliberately colliding native witness hash. @returns Signed hash. */
  hashCode() {
    return this.id % 29;
  }
  /** Native dynamic key-type and ID equality. @param other - Actual key. @returns Equality. */
  equals(other) {
    return other instanceof Key && this.id === other.id;
  }
  /** Native copy. @returns Owned key. */
  clone() {
    return new Key(this);
  }
  /** Creates owned values, aliases, failures and cross-key dependencies. @param cache - Actual cache context. @param status - Creation status. @returns Actual retained value/null. */
  createObject(cache, status) {
    if (status[0] > 0) return null;
    if (this.id < 0) {
      status[0] = 17;
      return null;
    }
    const dep = [null];
    if (this.id >= 1000) {
      cache.get(new Key(this.id % 1000), dep, status, cache);
      return dep[0];
    }

    const value = new Value(this.id, dep[0]);
    value.addRef();
    if (this.id % 7 === 3) status[0] = -128;
    return value;
  }
}
const cache = new UnifiedCache([0]),
  ptrs = Array.from(
    { length: 7 },
    /** Creates a retained native output pointer. @returns Pointer. */ () => [null],
  ),
  input = [],
  expected = [];
/** Executes one actual cache command and captures externally visible state. @param op - Native operation. @param a - Operand. @param b - Operand. @param c - Status. @returns Nothing. */
function add(op, a = 0, b = 0, c = 0) {
  input.push(op + (op === "G" || op === "P" ? ` ${a} ${b} ${c}` : op === "C" ? ` ${a}` : ""));
  const status = [0];
  if (op === "G") {
    status[0] = c;
    cache.get(new Key(a), ptrs[b], status, cache);
  } else if (op === "C") SharedObject.clearPtr(ptrs[a]);
  else if (op === "P") {
    status[0] = c;
    cache.setEvictionPolicy(a, b, status);
  } else if (op === "F") cache.flush();
  expected.push(
    [
      status[0],
      cache.keyCount(),
      cache.unusedCount(),
      cache.autoEvictedCount().toString(),
      created,
      ...ptrs.flatMap(
        /** Observes retained output and hard references. @param p - Pointer. @returns Fields. */ (
          p,
        ) => [p[0]?.serial ?? 0, p[0]?.id ?? 0, p[0]?.getRefCount() ?? 0],
      ),
      destroyed.length,
      ...destroyed,
    ].join(" "),
  );
}
for (const incoming of [0, -128, 1, 17])
  for (const id of [3, 4, -1, 1003, 1004, 103, 104]) add("G", id, 0, incoming);
for (let i = 0; i < 7; ++i) add("C", i);
add("F");
add("P", 0, 0);
let seed = 0x7a29;
/** Deterministic command generator, independent of cache behavior. @returns Unsigned32. */
function next() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
for (let i = 0; i < 2400; ++i) {
  const op = next() % 13,
    slot = next() % 7;
  if (op < 8) {
    let id = next() % 211;
    if (op === 0) id = -((id % 9) + 1);
    if (op === 1) id += 1000;
    add("G", id, slot, [0, -128, 1][next() % 3]);
  } else if (op < 11) add("C", slot);
  else if (op === 11) add("F");
  else
    add(
      "P",
      [0, 1, 4, 1000, -1][next() % 5],
      [0, 50, 100, -1][next() % 4],
      [0, -128, 17][next() % 3],
    );
}
for (let i = 0; i < 7; ++i) add("C", i);
add("F");
const actual = execFileSync(`${build}/unifiedcache-witness`, {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
for (let i = 0; i < expected.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Cache mismatch ${i}: ${input[i]}\nC++ ${actual[i]}\nTS  ${expected[i]}`);
if (actual.length !== expected.length) throw Error("Cache witness length mismatch");
writeFileSync(
  `${build}/unifiedcache-comparison.json`,
  JSON.stringify(
    {
      result: "pass",
      cases: input.length,
      created,
      destroyed: destroyed.length,
      scope:
        "Actual original cache/refcount/table owners and slot-order eviction, not native allocator/mutex/ABI or same-key recursive construction",
    },
    null,
    2,
  ) + "\n",
);
process.stdout.write(readFileSync(`${build}/unifiedcache-comparison.json`, "utf8"));
