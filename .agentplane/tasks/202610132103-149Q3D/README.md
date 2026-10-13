---
id: "202610132103-149Q3D"
title: "Implement Calc merge/filter flag values over shared integer item owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T21:05:09.494Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: actual ScMF/ScMergeFlagAttr values and predicates over existing shared integer item, truthful header/core inventory and targeted rawcoverage, nextfull111pause preserved."
events:
  -
    type: "status"
    at: "2026-10-13T21:05:09.898Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual ScMF/ScMergeFlagAttr values and predicates over existing shared integer item, truthful header/core inventory and targeted rawcoverage, nextfull111pause preserved."
doc_version: 3
doc_updated_at: "2026-10-13T21:17:01.574Z"
doc_updated_by: "CODER"
description: "Task102: original ScMF and ScMergeFlagAttr value/default/copy/clone and complete overlap/filter/scenario/pivot predicate contract, directly reuse existing shared SfxInt16Item/SfxPoolItem. Original attrib.hxx/core attrib.cxx boundaries and truthful inventory. No duplicate pool/int class or custom memory/C++ fake provider. XML diagnostics and ScMergeAttr/span/document/view/config/ODS remain pending, not claimed by bounded value owner."
sections:
  Summary: "Task102: add original merge/filter/scenario/pivot flag value owner needed by cell display and filtering. Reuse Writer/shared integer item and pool contracts."
  Scope: "New sc/inc/attrib.ts, sc/inc/scitems.ts, sc/source/core/data/attrib.ts and meaningful tests;6owner runtime/provenance records, oneCalc capability, calc-core/GC documentation. Existing shared owners reused unchanged unless evidence requires separately documented correction. No fakeDocument/Table/Config/Color/Metric/nativeparent, ownership library or sanitizer. Runtime diagnostic XML hook, ScMergeAttr, editableUI/ODS not claimed."
  Plan: "Implement original ScMF values and ScMergeFlagAttr scalar/copy/clone and all9 overlap/filter/scenario/pivot predicates over actual shared SfxInt16Item; preserve existing common Which/QueryValue/equality representation. Header/core/defaultid boundaries and inventory4records/newcap/documentation. Source-backed exact contracts and meaningful itemset/clone/flag combinations, no fake C++ base/compiler or diagnostic provider. Whole Calc and complete affected shared integer/pool owners raw100,16gates/static/Calc0UI/sourceabsence/exact source review, same-agent separate evaluator, canonicalDONE/clean. Original diagnostic XML hook, ScMergeAttr spans and real document/view/filter integration remain unported, explicitly unverified; next full111 requestedpause."
  Verify Steps: |-
    1. Compare complete actual ScMF and ScMergeFlagAttr declaration/member bodies in pinned sc/inc/attrib.hxx/sc/source/core/data/attrib.cxx plus scitems.hxx and actual shared intitem/poolitem; record evidence and boundaries. Tests meaningful defaults, all individual flag meanings and combinations, shared itemset transport, clone/copy independent values/Which, inherited QueryValue. Native C++ compilation not required by this source-backed leaf; never manufacture a parent/provider for a probe.
    2. Source-absent whole npm run test:coverage:calc and complete affected shared intitem/cintitem/poolitem owners and actual relevant tests rawS/B/F/L100/allpositive; static and Calc browser inventory pass. Restore4exactlinks, never overlap source-dependent gates. Existing Writer/shared implementation unchanged, no Writer-onlycoverage repair, no fulloffice until111.
    3. All16 existing repository gates pass with current truthful source/default/capability/QA context records; no AST/sourcerouting/threshold weakening or private teststate forcing. Record actual failures before bounded correction.
    4. Exact base/current/committed sourcehashes only intentional scope, actual coverage/gates bound to sourcecommit, separate same-agent EVALUATOR (not independent review), APverification/DONE/cleanbranchcalc. Goalactive; stop after nextscheduledfull111 and relevant repairs.
  Verification: |-
    Command: original source review against git pin9bc445578031fecf56086729d8e4940c77e14d65. Result: pass. Evidence:6 complete original declaration/body/dependency files SHA256 match pin; original-source-review.json. Scope: source-backed represented ScMF/ScMergeFlagAttr/default/Which/clone/predicate contract, not compiled native differential/ABI/fullQA. No fake native base/provider or new generator.

    Command: npx vitest run src/sc/source/core/data/mergeflag.test.ts --config vitest.calc.config.ts --root apps/office; node output/playwright/task102-checks/portable.mjs; node output/playwright/task102-checks/portable.mjs --shared-only; node output/playwright/task102-checks/portable.mjs --calc-only. Result: pass after bounded fixture/profile corrections. Evidence:4 focused tests; finalwholeCalc142tests/50files/31owners rawS3927/B2609/F765/L3496, reusedshared105tests/8files/3owners rawS58/B48/F36/L58. Every raw counterpositive/allS/B/F/L100. Four exact links absent/restored; static/Calcbrowser0 pass. Scope: completeCalc/represented9predicates/scalarclone/copysigned16 and actual shared itemset transport; only actual relevant existing shared/Writer consumers included, no Writercodechange.

    Command: node output/playwright/task102-checks/gates.mjs --early; node output/playwright/task102-checks/gates-late.mjs --late; node output/playwright/task102-checks/gates-late.mjs --recheck; npm run check:docs; python3 output/playwright/task102-checks/final-code-checks.py. Result: all16gates pass after schema/JSDoc correction;8 finalcurrentcodechecks pass with terminal0. Evidence: all first failure logs preserved, gates-results.json, final-code-checks-results.json. Scope: current whole requiredgates and final13intentionalpaths, no threshold/AST/sourcechecker weakening.

    Command: python3 output/playwright/task102-checks/exact-review.py after sourcecommit. Result: pending committedreview. Scope:3315baselinehashes, only13intentionalnon-taskpaths2changed/11added, exactcurrentcommitted3326hashes expected, same-agent separate EVALUATOR notindependent, native/source absence/checkcontracts truthful.
  Rollback Plan: "Restore exact reference symlinks on all check exits. Revert only intentional active task code/records/docs with new task; no merge/historyrewrite or unrelated taskmutation."
  Findings: |-
    Pinned original mergeflag ATTR145, ScMF All0x07ff, signed16 SfxInt16Item ordinary browser value ownership. Shared base has existing bounded QueryValue/Which/equality adaptation; reuse without claiming full native UNO/ABI/diagnostic contract. Upstream copy_paste_test.cxx has actual ATTR_MERGE_FLAG/ScMF::Auto context; this original full document QA is unexecuted, not direct proof of document/filter behavior. Need source-backed functional tests, no new C++ generator or memory experiment. First full101passed; goalstop aftersecondfull111.

    - Observation: Initial focused4-case run:3pass/1fail; new shared itemset transport test omitted required WhichRangesContainer and called nonexistent GetItem instead of actual GetItemIfSet.
      Impact: Fresh integration fixture invalid; production flag cases pass. No implementation parity claim until corrected test and full targeted checks.
      Resolution: Recompute route, correct fixture to actual shared constructor/GetItemIfSet contract, rerun focused4cases. No shared implementation or verification weakening.

    - Observation: Source-absent whole Calc passed; initial6-file shared profile tests passed but strict coverage failed: S48/58,B34/48,F31/36,L48/58. Missing existing UInt32 and SetWhich validation consumers, not production failure.
      Impact: Cannot claim complete reused shared owner coverage from narrow selected tests; failure logs and raw counters retained.
      Resolution: Recompute route and add existing actual Writer native-format-attribute-notify and shared native-column-item tests to same strict3-owner profile. No new coverage test, threshold change, Writer implementation or Writer-only coverage repair.

    - Observation: Three new metadata gates fail before semantic evaluation: capability record used id instead of required capabilityId. Existing runtime/tests and rawcoverage pass; original failure logs retained.
      Impact: New inventory record cannot load, so provenance/registry/invariants are not verified.
      Resolution: Recompute route and correct only new capability schema to actual existing keys; preserve all original statuses/evidence and rerun affected metadata gates after initial process completes.

    - Observation: Initial remaining gates: format/lint/type/size/dependencies pass; docs rejects one new enum-filter callback missing JSDoc. Inventory tests fail9cases from earlier missing capabilityId schema during initial run.
      Impact: Documentation and metadata gates incomplete; production and targeted rawcoverage already pass.
      Resolution: Recompute route, add JSDoc only to unchanged new callback, retain first logs and rerun docs plus4 metadata gates after complete capability fields corrected. No checker weakening or runtime change.

    - Observation: Final original Clone signature review added optional actual shared SfxItemPool type and ignored argument; complete finalCalc/static/Calc0UI rerun passes rawS3927/B2609/F765/L3496. All16gates and8currentcodechecks pass;6original source hashes match pin.
      Impact: Represented native Clone argument contract preserved without new runtime dependency/owner; source-backed values only, not compiled-native or fullQA proof.
      Resolution: Bind13intentionalnon-taskpaths to actual sourcecommit, separate same-agent evaluator not independent, preserve existing shared/Writer runtime unchanged and pending diagnostics/ScMergeAttr/document/view/ODS. Pause remainsnextfull111.
id_source: "generated"
---
## Summary

Task102: add original merge/filter/scenario/pivot flag value owner needed by cell display and filtering. Reuse Writer/shared integer item and pool contracts.

## Scope

New sc/inc/attrib.ts, sc/inc/scitems.ts, sc/source/core/data/attrib.ts and meaningful tests;6owner runtime/provenance records, oneCalc capability, calc-core/GC documentation. Existing shared owners reused unchanged unless evidence requires separately documented correction. No fakeDocument/Table/Config/Color/Metric/nativeparent, ownership library or sanitizer. Runtime diagnostic XML hook, ScMergeAttr, editableUI/ODS not claimed.

## Plan

Implement original ScMF values and ScMergeFlagAttr scalar/copy/clone and all9 overlap/filter/scenario/pivot predicates over actual shared SfxInt16Item; preserve existing common Which/QueryValue/equality representation. Header/core/defaultid boundaries and inventory4records/newcap/documentation. Source-backed exact contracts and meaningful itemset/clone/flag combinations, no fake C++ base/compiler or diagnostic provider. Whole Calc and complete affected shared integer/pool owners raw100,16gates/static/Calc0UI/sourceabsence/exact source review, same-agent separate evaluator, canonicalDONE/clean. Original diagnostic XML hook, ScMergeAttr spans and real document/view/filter integration remain unported, explicitly unverified; next full111 requestedpause.

## Verify Steps

1. Compare complete actual ScMF and ScMergeFlagAttr declaration/member bodies in pinned sc/inc/attrib.hxx/sc/source/core/data/attrib.cxx plus scitems.hxx and actual shared intitem/poolitem; record evidence and boundaries. Tests meaningful defaults, all individual flag meanings and combinations, shared itemset transport, clone/copy independent values/Which, inherited QueryValue. Native C++ compilation not required by this source-backed leaf; never manufacture a parent/provider for a probe.
2. Source-absent whole npm run test:coverage:calc and complete affected shared intitem/cintitem/poolitem owners and actual relevant tests rawS/B/F/L100/allpositive; static and Calc browser inventory pass. Restore4exactlinks, never overlap source-dependent gates. Existing Writer/shared implementation unchanged, no Writer-onlycoverage repair, no fulloffice until111.
3. All16 existing repository gates pass with current truthful source/default/capability/QA context records; no AST/sourcerouting/threshold weakening or private teststate forcing. Record actual failures before bounded correction.
4. Exact base/current/committed sourcehashes only intentional scope, actual coverage/gates bound to sourcecommit, separate same-agent EVALUATOR (not independent review), APverification/DONE/cleanbranchcalc. Goalactive; stop after nextscheduledfull111 and relevant repairs.

## Verification

Command: original source review against git pin9bc445578031fecf56086729d8e4940c77e14d65. Result: pass. Evidence:6 complete original declaration/body/dependency files SHA256 match pin; original-source-review.json. Scope: source-backed represented ScMF/ScMergeFlagAttr/default/Which/clone/predicate contract, not compiled native differential/ABI/fullQA. No fake native base/provider or new generator.

Command: npx vitest run src/sc/source/core/data/mergeflag.test.ts --config vitest.calc.config.ts --root apps/office; node output/playwright/task102-checks/portable.mjs; node output/playwright/task102-checks/portable.mjs --shared-only; node output/playwright/task102-checks/portable.mjs --calc-only. Result: pass after bounded fixture/profile corrections. Evidence:4 focused tests; finalwholeCalc142tests/50files/31owners rawS3927/B2609/F765/L3496, reusedshared105tests/8files/3owners rawS58/B48/F36/L58. Every raw counterpositive/allS/B/F/L100. Four exact links absent/restored; static/Calcbrowser0 pass. Scope: completeCalc/represented9predicates/scalarclone/copysigned16 and actual shared itemset transport; only actual relevant existing shared/Writer consumers included, no Writercodechange.

Command: node output/playwright/task102-checks/gates.mjs --early; node output/playwright/task102-checks/gates-late.mjs --late; node output/playwright/task102-checks/gates-late.mjs --recheck; npm run check:docs; python3 output/playwright/task102-checks/final-code-checks.py. Result: all16gates pass after schema/JSDoc correction;8 finalcurrentcodechecks pass with terminal0. Evidence: all first failure logs preserved, gates-results.json, final-code-checks-results.json. Scope: current whole requiredgates and final13intentionalpaths, no threshold/AST/sourcechecker weakening.

Command: python3 output/playwright/task102-checks/exact-review.py after sourcecommit. Result: pending committedreview. Scope:3315baselinehashes, only13intentionalnon-taskpaths2changed/11added, exactcurrentcommitted3326hashes expected, same-agent separate EVALUATOR notindependent, native/source absence/checkcontracts truthful.

## Rollback Plan

Restore exact reference symlinks on all check exits. Revert only intentional active task code/records/docs with new task; no merge/historyrewrite or unrelated taskmutation.

## Findings

Pinned original mergeflag ATTR145, ScMF All0x07ff, signed16 SfxInt16Item ordinary browser value ownership. Shared base has existing bounded QueryValue/Which/equality adaptation; reuse without claiming full native UNO/ABI/diagnostic contract. Upstream copy_paste_test.cxx has actual ATTR_MERGE_FLAG/ScMF::Auto context; this original full document QA is unexecuted, not direct proof of document/filter behavior. Need source-backed functional tests, no new C++ generator or memory experiment. First full101passed; goalstop aftersecondfull111.

- Observation: Initial focused4-case run:3pass/1fail; new shared itemset transport test omitted required WhichRangesContainer and called nonexistent GetItem instead of actual GetItemIfSet.
  Impact: Fresh integration fixture invalid; production flag cases pass. No implementation parity claim until corrected test and full targeted checks.
  Resolution: Recompute route, correct fixture to actual shared constructor/GetItemIfSet contract, rerun focused4cases. No shared implementation or verification weakening.

- Observation: Source-absent whole Calc passed; initial6-file shared profile tests passed but strict coverage failed: S48/58,B34/48,F31/36,L48/58. Missing existing UInt32 and SetWhich validation consumers, not production failure.
  Impact: Cannot claim complete reused shared owner coverage from narrow selected tests; failure logs and raw counters retained.
  Resolution: Recompute route and add existing actual Writer native-format-attribute-notify and shared native-column-item tests to same strict3-owner profile. No new coverage test, threshold change, Writer implementation or Writer-only coverage repair.

- Observation: Three new metadata gates fail before semantic evaluation: capability record used id instead of required capabilityId. Existing runtime/tests and rawcoverage pass; original failure logs retained.
  Impact: New inventory record cannot load, so provenance/registry/invariants are not verified.
  Resolution: Recompute route and correct only new capability schema to actual existing keys; preserve all original statuses/evidence and rerun affected metadata gates after initial process completes.

- Observation: Initial remaining gates: format/lint/type/size/dependencies pass; docs rejects one new enum-filter callback missing JSDoc. Inventory tests fail9cases from earlier missing capabilityId schema during initial run.
  Impact: Documentation and metadata gates incomplete; production and targeted rawcoverage already pass.
  Resolution: Recompute route, add JSDoc only to unchanged new callback, retain first logs and rerun docs plus4 metadata gates after complete capability fields corrected. No checker weakening or runtime change.

- Observation: Final original Clone signature review added optional actual shared SfxItemPool type and ignored argument; complete finalCalc/static/Calc0UI rerun passes rawS3927/B2609/F765/L3496. All16gates and8currentcodechecks pass;6original source hashes match pin.
  Impact: Represented native Clone argument contract preserved without new runtime dependency/owner; source-backed values only, not compiled-native or fullQA proof.
  Resolution: Bind13intentionalnon-taskpaths to actual sourcecommit, separate same-agent evaluator not independent, preserve existing shared/Writer runtime unchanged and pending diagnostics/ScMergeAttr/document/view/ODS. Pause remainsnextfull111.
