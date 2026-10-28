/** @fileoverview Compares actual RuleBasedTimeZone ownership/completion, dirty-state offsets, historic/final annual rules and gap/fold/transition queries with unchanged ICU78.3. Native allocator/concurrency and general custom rule subclasses remain unverified. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { RuleBasedTimeZone } from "../apps/office/src/external/icu/source/i18n/rbtz.ts";
import {
  InitialTimeZoneRule,
  AnnualTimeZoneRule,
  TimeArrayTimeZoneRule,
} from "../apps/office/src/external/icu/source/i18n/tzrule.ts";
import { DateTimeRule } from "../apps/office/src/external/icu/source/i18n/dtrule.ts";
import { TimeZoneTransition } from "../apps/office/src/external/icu/source/i18n/tztrans.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/rbtz-witness.cc`,
  String.raw`
#include "unicode/rbtz.h"
#include "unicode/tzrule.h"
#include "unicode/tztrans.h"
#include "unicode/putil.h"
#include <iostream>
#include <memory>
using namespace icu;
std::unique_ptr<RuleBasedTimeZone> make(int mode,int&addStatus){auto z=std::make_unique<RuleBasedTimeZone>(UnicodeString(u"Z"),new InitialTimeZoneRule(UnicodeString(u"I"),-18000000,0));UErrorCode s=U_ZERO_ERROR;double a[]={-100000000,0,100000000};if(mode==1||mode==3||mode==6)z->addTransitionRule(new TimeArrayTimeZoneRule(UnicodeString(u"H"),-14400000,0,a,3,DateTimeRule::UTC_TIME),s);if(mode==2||mode==3||mode==4||mode==5){DateTimeRule dst(2,2,1,7200000,DateTimeRule::WALL_TIME),std(10,1,1,7200000,DateTimeRule::WALL_TIME);z->addTransitionRule(new AnnualTimeZoneRule(UnicodeString(u"D"),-18000000,3600000,dst,2000,AnnualTimeZoneRule::MAX_YEAR),s);if(mode!=4)z->addTransitionRule(new AnnualTimeZoneRule(UnicodeString(u"S"),-18000000,0,std,2000,AnnualTimeZoneRule::MAX_YEAR),s);if(mode==5)z->addTransitionRule(new AnnualTimeZoneRule(UnicodeString(u"X"),0,0,std,2000,AnnualTimeZoneRule::MAX_YEAR),s);}addStatus=s;if(mode==6){s=U_ZERO_ERROR;z->complete(s);double b[]={200000000};z->addTransitionRule(new TimeArrayTimeZoneRule(UnicodeString(u"L"),-18000000,0,b,1,DateTimeRule::UTC_TIME),s);}return z;}
void rule(const TimeZoneRule*r){UnicodeString name;r->getName(name);std::string n;name.toUTF8String(n);std::cout<<' '<<n<<' '<<r->getRawOffset()<<' '<<r->getDSTSavings();}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);int mode,completion,copy,local,missing,dup,incoming;double t;while(std::cin>>mode>>completion>>copy>>t>>local>>missing>>dup>>incoming){int a;auto z=make(mode,a);UErrorCode s=U_ZERO_ERROR;if(completion)z->complete(s);std::cout<<a<<' '<<int(s);if(copy)z.reset(z->clone());int32_t raw=91,dst=92;s=UErrorCode(incoming);if(local==2)z->getOffsetFromLocal(t,UTimeZoneLocalOption(missing),UTimeZoneLocalOption(dup),raw,dst,s);else z->getOffset(t,local,raw,dst,s);std::cout<<' '<<int(s)<<' '<<raw<<' '<<dst;s=UErrorCode(incoming);std::cout<<' '<<z->countTransitionRules(s)<<' '<<int(s);InitialTimeZoneRule init(UnicodeString(u"O"),7,8);for(bool next:{true,false})for(bool inclusive:{false,true}){TimeZoneTransition tr(17,init,init);bool ok=next?z->getNextTransition(t,inclusive,tr):z->getPreviousTransition(t,inclusive,tr);std::cout<<' '<<ok<<' '<<std::fixed<<std::setprecision(0)<<tr.getTime();rule(tr.getFrom());rule(tr.getTo());}std::cout<<'\n';}}
`.replace("#include <memory>", "#include <memory>\n#include <iomanip>"),
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/rbtz-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/rbtz-witness`,
  ],
  { stdio: "inherit" },
);
/** Constructs the same explicit native rule input graph. @param mode - Scenario. @returns Actual owner and adoption status. */
function make(mode) {
  const z = new RuleBasedTimeZone(
      new UnicodeString("Z"),
      new InitialTimeZoneRule(new UnicodeString("I"), -18000000, 0),
    ),
    s = [0];
  if ([1, 3, 6].includes(mode))
    z.addTransitionRule(
      new TimeArrayTimeZoneRule(
        new UnicodeString("H"),
        -14400000,
        0,
        [-100000000, 0, 100000000],
        3,
        DateTimeRule.UTC_TIME,
      ),
      s,
    );
  if ([2, 3, 4, 5].includes(mode)) {
    const dst = new DateTimeRule(2, 2, 1, 7200000, DateTimeRule.WALL_TIME),
      std = new DateTimeRule(10, 1, 1, 7200000, DateTimeRule.WALL_TIME);
    z.addTransitionRule(
      new AnnualTimeZoneRule(
        new UnicodeString("D"),
        -18000000,
        3600000,
        dst,
        2000,
        AnnualTimeZoneRule.MAX_YEAR,
      ),
      s,
    );
    if (mode !== 4)
      z.addTransitionRule(
        new AnnualTimeZoneRule(
          new UnicodeString("S"),
          -18000000,
          0,
          std,
          2000,
          AnnualTimeZoneRule.MAX_YEAR,
        ),
        s,
      );
    if (mode === 5)
      z.addTransitionRule(
        new AnnualTimeZoneRule(
          new UnicodeString("X"),
          0,
          0,
          std,
          2000,
          AnnualTimeZoneRule.MAX_YEAR,
        ),
        s,
      );
  }
  const status = s[0];
  if (mode === 6) {
    s[0] = 0;
    z.complete(s);
    z.addTransitionRule(
      new TimeArrayTimeZoneRule(
        new UnicodeString("L"),
        -18000000,
        0,
        [200000000],
        1,
        DateTimeRule.UTC_TIME,
      ),
      s,
    );
  }
  return [z, status];
}
const inputs = [],
  expected = [];
for (let mode = 0; mode < 7; ++mode)
  for (const completion of [0, 1])
    for (const copy of [0, 1])
      for (const t of [
        -1e15, -100000001, -100000000, -1, 0, 1, 199999999, 200000000, 200000001, 951868800000,
        1710053999999, 1710054000000, 1710055800000, 1730611800000, 1730613600000, 1e15,
      ])
        for (const local of [0, 1, 2])
          for (const incoming of [0, -128, 1]) {
            let [z, a] = make(mode);
            const s = [0];
            if (completion) z.complete(s);
            const out = [a, s[0]];
            if (copy) z = z.clone();
            const raw = [91],
              dst = [92],
              missing = 4,
              dup = 12;
            s[0] = incoming;
            if (local === 2) z.getOffsetFromLocal(t, missing, dup, raw, dst, s);
            else z.getOffset(t, Boolean(local), raw, dst, s);
            out.push(s[0], raw[0], dst[0]);
            s[0] = incoming;
            out.push(z.countTransitionRules(s), s[0]);
            const init = new InitialTimeZoneRule(new UnicodeString("O"), 7, 8);
            for (const next of [true, false])
              for (const inclusive of [false, true]) {
                const tr = new TimeZoneTransition(17, init, init),
                  ok = next
                    ? z.getNextTransition(t, inclusive, tr)
                    : z.getPreviousTransition(t, inclusive, tr);
                out.push(Number(ok), tr.getTime());
                for (const rule of [tr.getFrom(), tr.getTo()])
                  out.push(
                    rule.getName(new UnicodeString()).getBuffer(),
                    rule.getRawOffset(),
                    rule.getDSTSavings(),
                  );
              }
            inputs.push([mode, completion, copy, t, local, missing, dup, incoming].join(" "));
            expected.push(out.join(" "));
          }
const actual = execFileSync(`${build}/rbtz-witness`, [`${source}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error("RBTZ length");
for (let i = 0; i < actual.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`RBTZ ${i}: ${inputs[i]}\nnative ${actual[i]}\nlocal ${expected[i]}`);
console.log(
  `Matched ${actual.length} RuleBasedTimeZone completion, dirty-state, annual/historic, offset and transition cases.`,
);
