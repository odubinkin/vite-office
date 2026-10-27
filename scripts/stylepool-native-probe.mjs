/** @fileoverview Compiles unchanged StylePool Node/Iterator/insertion bodies with real std shared ownership; Sfx item values are explicit probe carriers. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const path = "vendor/libreoffice-reference/svl/source/items/stylepool.cxx";
const source = readFileSync(path, "utf8");
const nodeStart = source.indexOf("namespace {"),
  nodeEnd = source.indexOf("/**\n * This static method");
const poolStart = source.indexOf("class StylePoolImpl\n{"),
  poolEnd = source.indexOf("// Ctor, Dtor and redirected methods");
if (
  [nodeStart, nodeEnd, poolStart, poolEnd].some(
    /** Applies some to n. @param n - n value. @returns Callback result. */ (n) => n < 0,
  )
)
  throw Error("Missing original StylePool source markers");
const target = "output/playwright/stylepool-native";
const driver = String.raw`
#include <algorithm>
#include <cstdint>
#include <iostream>
#include <map>
#include <memory>
#include <optional>
#include <string>
#include <vector>
#define DBG_ASSERT(test,msg) ((void)0)
#define OSL_DEBUG_LEVEL 0
using OUString=std::u16string;
class SfxPoolItem {public:int which,value;bool shareable;SfxPoolItem(int w=0,int v=0,bool s=true):which(w),value(v),shareable(s){}int Which()const{return which;}bool isShareable()const{return shareable;}SfxPoolItem* Clone()const{return new SfxPoolItem(*this);}bool operator==(SfxPoolItem const& r)const{return which==r.which&&value==r.value&&shareable==r.shareable;}};
class SfxItemSet {public:int id=0,first=1,last=30;SfxItemSet const* parent=nullptr;std::map<int,SfxPoolItem> items;SfxItemSet(int i=0,int f=1,int l=30):id(i),first(f),last(l){}SfxItemSet* Clone(bool values=true)const {auto p=new SfxItemSet(*this);if(!values)p->items.clear();return p;}int Count()const{return items.size();}SfxItemSet const* GetParent()const{return parent;}SfxPoolItem const* Put(SfxPoolItem const& v){if(v.which<first||v.which>last)return nullptr;auto p=items.find(v.which);if(p!=items.end()&&p->second==v)return nullptr;return &items.insert_or_assign(v.which,v).first->second;}};
class SfxItemIter {SfxItemSet const& set;std::map<int,SfxPoolItem>::const_iterator at;public:explicit SfxItemIter(SfxItemSet const& s):set(s),at(s.items.begin()){}bool IsAtEnd()const{return at==set.items.end();}void Next(){++at;}SfxPoolItem const* GetCurItem()const{return &at->second;}};
${source.slice(nodeStart, nodeEnd)}
${source.slice(poolStart, poolEnd)}
static bool comma=false;
static void snapshot(char const* label,StylePoolImpl& pool,bool used=true,bool ignorable=true){auto iterator=pool.createIterator(used,ignorable);std::vector<std::shared_ptr<SfxItemSet>> out;for(auto p=iterator.getNext();p;p=iterator.getNext())out.push_back(p);if(comma)std::cout<<',';comma=true;std::cout<<"{\"label\":\""<<label<<"\",\"ids\":[";for(unsigned i=0;i<out.size();++i){if(i)std::cout<<',';std::cout<<out[i]->id;}std::cout<<"]}";}
int main(){std::cout<<"[";
{StylePoolImpl pool(nullptr);SfxItemSet set(1);set.Put({11,7});auto a=pool.insertItemSet(set);snapshot("shared-used",pool);a.reset();snapshot("shared-unused",pool);snapshot("cache-includes-unused",pool,false,false);}
{StylePoolImpl pool(nullptr);SfxItemSet set(11);set.Put({11,7,false});auto a=pool.insertItemSet(set);set.id=12;auto b=pool.insertItemSet(set);set.id=13;auto c=pool.insertItemSet(set);snapshot("nonshareable-newest-used",pool);c.reset();snapshot("nonshareable-previous-used",pool);b.reset();snapshot("nonshareable-first-used",pool);snapshot("cache-one-used-representative",pool,false,false);a.reset();snapshot("nonshareable-all-unused",pool);snapshot("cache-last-unused-representative",pool,false,false);}
{SfxItemSet ignorable(0,15,15);StylePoolImpl pool(&ignorable);SfxItemSet set(21);set.Put({11,7});set.Put({15,1});auto a=pool.insertItemSet(set);set.id=22;set.Put({15,2});auto b=pool.insertItemSet(set);snapshot("ignorable-first-used",pool);a.reset();snapshot("ignorable-next-used",pool);SfxItemSet root(23);root.Put({15,3});auto c=pool.insertItemSet(root);snapshot("root-only-ignorable-omitted",pool);snapshot("cache-contains-ignorable-paths",pool,false,false);}
{StylePoolImpl pool(nullptr);SfxItemSet parentA,parentB,a(31),b(32);a.parent=&parentA;b.parent=&parentB;a.Put({11,1});b.Put({11,2});OUString zulu=u"Zulu",alpha=u"Alpha";auto pa=pool.insertItemSet(a,&zulu),pb=pool.insertItemSet(b,&alpha);snapshot("named-parent-order",pool);}
std::cout<<"]\n";}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/probe.cxx`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    `${target}/probe.cxx`,
    "-o",
    `${target}/probe`,
  ],
  { stdio: "inherit" },
);
const cases = JSON.parse(execFileSync(`${target}/probe`, { encoding: "utf8" }));
writeFileSync(
  "apps/office/src/svl/source/items/stylepool.native.json",
  JSON.stringify(
    {
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      sourcePath: path,
      sourceHash: createHash("sha256").update(source).digest("hex"),
      driverHash: createHash("sha256").update(driver).digest("hex"),
      scope:
        "Unchanged original Node/Iterator/StylePoolImpl insertion and iterator-factory bodies with real std::shared_ptr ownership and standard containers; SfxPoolItem/SfxItemSet/SfxItemIter are explicit ordered integer-value probe carriers, OUString is a UTF16 comparison carrier. No full SfxItemSet/Writer/SAL ABI or global item-cache certification. Nonfatal source diagnostics omitted; ASan/UBSan enabled.",
      cases,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ cases: cases.length, sanitized: true }));
