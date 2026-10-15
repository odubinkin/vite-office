---
id: "202610150635-PCJKV5"
title: "Implement native edit-engine text positions and selections"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:36:17.354Z"
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
    body: "Start: shared original edit-engine position and selection values, copied struct fields and native interval order; no document facade, localization or lifetime machinery."
events:
  -
    type: "status"
    at: "2026-10-15T06:36:23.143Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: shared original edit-engine position and selection values, copied struct fields and native interval order; no document facade, localization or lifetime machinery."
doc_version: 3
doc_updated_at: "2026-10-15T06:42:06.379Z"
doc_updated_by: "CODER"
description: "Task149 implements complete shared EPaM/ESelection value contracts from original public headers for Calc text editing and future genuine EditTextObject use. Original defaults/sentinels/order/adjust/collapse and value-copy semantics, no UI localization or fake document adapter."
sections:
  Summary: "Task149 implements original shared EPaM and ESelection text position/selection value owners needed for cell/header-footer editing. No existing owner exists to reuse."
  Scope: "At most16intentional non-agent paths: canonical editeng/inc/EPaM.ts and ESelection.ts, one direct source-backed test, matching runtime/provenance/capability records and calc-core docs. Original default/copy/value constructors, max sentinels, fields, equality/order, adjustedness/Adjust, CollapseToStart/End, HasRange and diagnostic stream text. JS numbers/GC; explicit implicit-C++copy constructor/assignment methods and copied public field assignment preserve value semantics and borrowed field identity. No text engine/document facade, UI localization, spelling, memory/holder manager or native binary layout."
  Plan: "Implement actual shared EPaM/ESelection complete header value contracts, preserve copied field assignment and borrowed value identity, strict interval ordering, scoped raw100/gates/build/native audit/inventory and16path clean calc closure."
  Verify Steps: "Compare original include/editeng/EPaM.hxx and ESelection.hxx, exact int32 max sentinels and editeng source QA selection use. Test all constructor forms/default/copies, assignment/self assignment, borrowed mutable fields, field assignment copying, equality and paragraph/index lexicographic order, All/AtEnd/NotFound fresh values, selection Adjust stable borrowed positions and both collapses independent values. Selection order is strict disjoint end-before-start on adjusted inputs; touching/overlap are unordered, not lexicographic. Debug-only assertion/native stream templates are represented by documented precondition and equivalent toString text, no new release exception or native ABI manager. All methods/new shared raw S/B/F/L counters positive100; whole Calc raw100, all13scoped source gates including39existing boundary cases, inventory zero semantic violations and production build. Four reference links absent during tests/build restored finally, no compiler/native probes. Source pins/hash audit/exact16path bound and clean calc. Writer-only coverage gaps exempt; full suite only on actual minimal UI+same-model ODS readiness then fixes/pause."
  Verification: |-
    - Command: `node output/playwright/task149-checks/portable.mjs`; exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json.
      Result: pass.
      Evidence:6direct source-backed tests/1file and186whole Calc tests/76files. Whole2new shared owners raw S47/B23/F23/L45 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No threshold/source-map/counter edits or Writer coverage repair. Final test-only erased assertions fix noUncheckedIndexedAccess without changing executed JS.
      Scope: original EPaM zero/signed32-max defaults/NotFound, coordinate/copy/assignment/order/equality/diagnostic values; ESelection allconstructor forms, copied public field assignment and stable borrowed identity, independent copy/collapse/swap, All/AtEnd, strict disjoint interval order on adjusted inputs, touching/overlapping cases, HasRange/diagnostic values. No fake document, UI localization or memory engine. Four source links absent/restored finally for tests/build.
    - Command: all13exact argv in `output/playwright/task149-checks/source-gates.json`; `node output/playwright/task149-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing module-boundary tests; zero inventory semantic violations. Portable production build exit0. Initial metadata basename-only evidence and test array-index typing failures retained in task Findings and corrected; affected static gates rerun, production behavior unchanged.
      Scope:9intentional non-agent paths within16approved bound; native public include owners use canonical editeng/inc boundary, no graph or gate exceptions, no existing Writer-specific document selection duplication. All-app full suite remains deferred until genuine minimal connected Calc UI plus same-model ODS readiness, then applicable repairs and pause.
    - Command: `python3 output/playwright/task149-checks/audit-native.py`; `python3 output/playwright/task149-checks/audit-final.py`.
      Result: pass.
      Evidence: exact native max/default/ordering/constructor/normalization/collapse/equality/HasRange/stream-content source audit,3native pins at9bc445578031fecf56086729d8e4940c77e14d65,3905source hashes (3897baseline,1changed existing,8new,3896unchanged),9intentional paths and4restored links. Original EditEngine core-test ESelection use is unported broader source context only, not native execution.
      Scope: native operator and ostream contracts map to equals/lessThan/greaterThan/toString. Debug-only adjusted-input assertion is a documented precondition; no fabricated release exception or numeric ABI. Public field writes and copies preserve native struct value semantics using ordinary objects/GC. Same-agent evaluation is not independent. Actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.
  Rollback Plan: "Revert only intentional paths through a later authorized task; no reset, merge or publication."
  Findings: |-
    Native value structs have copy semantics; ordinary aliasing assignment would be a porting bug. Use JS object identity only for storage/borrowing, not as position or range value equality. No existing Writer-specific document selection is duplicated or replaced; these are actual shared EditEngine public types. Actual EditTextObject/ScPageHFItem/pool/model/connected UI/ODS remain pending, localization deferred. Same-agent evaluation is not independent.

    - Observation: Initial source provenance/inventory rejected ESelection record because upstreamSymbols contained only its basename-identical class name.
      Impact: Source code and all behavioral tests passed; the initial metadata lacked sufficiently specific native method evidence.
      Resolution: Added actual All/AtEnd/Adjust/HasRange symbols and CollapseToStart native-header evidence to the two existing records; preserved classifier/enforcement and source behavior, then reran affected metadata gates.

    - Observation: Typecheck rejected indexed EPaM test-array access under noUncheckedIndexedAccess, while both loop bounds and behavioral tests were valid.
      Impact: Test typing only; no production bug, changed native behavior or coverage gap.
      Resolution: Added erased EPaM assertions to the bounded indexed comparisons, leaving emitted test JS identical; reran format/lint/typecheck alongside metadata checks, without replaying passed behavioral suites.
id_source: "generated"
---
## Summary

Task149 implements original shared EPaM and ESelection text position/selection value owners needed for cell/header-footer editing. No existing owner exists to reuse.

## Scope

At most16intentional non-agent paths: canonical editeng/inc/EPaM.ts and ESelection.ts, one direct source-backed test, matching runtime/provenance/capability records and calc-core docs. Original default/copy/value constructors, max sentinels, fields, equality/order, adjustedness/Adjust, CollapseToStart/End, HasRange and diagnostic stream text. JS numbers/GC; explicit implicit-C++copy constructor/assignment methods and copied public field assignment preserve value semantics and borrowed field identity. No text engine/document facade, UI localization, spelling, memory/holder manager or native binary layout.

## Plan

Implement actual shared EPaM/ESelection complete header value contracts, preserve copied field assignment and borrowed value identity, strict interval ordering, scoped raw100/gates/build/native audit/inventory and16path clean calc closure.

## Verify Steps

Compare original include/editeng/EPaM.hxx and ESelection.hxx, exact int32 max sentinels and editeng source QA selection use. Test all constructor forms/default/copies, assignment/self assignment, borrowed mutable fields, field assignment copying, equality and paragraph/index lexicographic order, All/AtEnd/NotFound fresh values, selection Adjust stable borrowed positions and both collapses independent values. Selection order is strict disjoint end-before-start on adjusted inputs; touching/overlap are unordered, not lexicographic. Debug-only assertion/native stream templates are represented by documented precondition and equivalent toString text, no new release exception or native ABI manager. All methods/new shared raw S/B/F/L counters positive100; whole Calc raw100, all13scoped source gates including39existing boundary cases, inventory zero semantic violations and production build. Four reference links absent during tests/build restored finally, no compiler/native probes. Source pins/hash audit/exact16path bound and clean calc. Writer-only coverage gaps exempt; full suite only on actual minimal UI+same-model ODS readiness then fixes/pause.

## Verification

- Command: `node output/playwright/task149-checks/portable.mjs`; exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json.
  Result: pass.
  Evidence:6direct source-backed tests/1file and186whole Calc tests/76files. Whole2new shared owners raw S47/B23/F23/L45 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No threshold/source-map/counter edits or Writer coverage repair. Final test-only erased assertions fix noUncheckedIndexedAccess without changing executed JS.
  Scope: original EPaM zero/signed32-max defaults/NotFound, coordinate/copy/assignment/order/equality/diagnostic values; ESelection allconstructor forms, copied public field assignment and stable borrowed identity, independent copy/collapse/swap, All/AtEnd, strict disjoint interval order on adjusted inputs, touching/overlapping cases, HasRange/diagnostic values. No fake document, UI localization or memory engine. Four source links absent/restored finally for tests/build.
- Command: all13exact argv in `output/playwright/task149-checks/source-gates.json`; `node output/playwright/task149-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing module-boundary tests; zero inventory semantic violations. Portable production build exit0. Initial metadata basename-only evidence and test array-index typing failures retained in task Findings and corrected; affected static gates rerun, production behavior unchanged.
  Scope:9intentional non-agent paths within16approved bound; native public include owners use canonical editeng/inc boundary, no graph or gate exceptions, no existing Writer-specific document selection duplication. All-app full suite remains deferred until genuine minimal connected Calc UI plus same-model ODS readiness, then applicable repairs and pause.
- Command: `python3 output/playwright/task149-checks/audit-native.py`; `python3 output/playwright/task149-checks/audit-final.py`.
  Result: pass.
  Evidence: exact native max/default/ordering/constructor/normalization/collapse/equality/HasRange/stream-content source audit,3native pins at9bc445578031fecf56086729d8e4940c77e14d65,3905source hashes (3897baseline,1changed existing,8new,3896unchanged),9intentional paths and4restored links. Original EditEngine core-test ESelection use is unported broader source context only, not native execution.
  Scope: native operator and ostream contracts map to equals/lessThan/greaterThan/toString. Debug-only adjusted-input assertion is a documented precondition; no fabricated release exception or numeric ABI. Public field writes and copies preserve native struct value semantics using ordinary objects/GC. Same-agent evaluation is not independent. Actual EditEngine/EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.

## Rollback Plan

Revert only intentional paths through a later authorized task; no reset, merge or publication.

## Findings

Native value structs have copy semantics; ordinary aliasing assignment would be a porting bug. Use JS object identity only for storage/borrowing, not as position or range value equality. No existing Writer-specific document selection is duplicated or replaced; these are actual shared EditEngine public types. Actual EditTextObject/ScPageHFItem/pool/model/connected UI/ODS remain pending, localization deferred. Same-agent evaluation is not independent.

- Observation: Initial source provenance/inventory rejected ESelection record because upstreamSymbols contained only its basename-identical class name.
  Impact: Source code and all behavioral tests passed; the initial metadata lacked sufficiently specific native method evidence.
  Resolution: Added actual All/AtEnd/Adjust/HasRange symbols and CollapseToStart native-header evidence to the two existing records; preserved classifier/enforcement and source behavior, then reran affected metadata gates.

- Observation: Typecheck rejected indexed EPaM test-array access under noUncheckedIndexedAccess, while both loop bounds and behavioral tests were valid.
  Impact: Test typing only; no production bug, changed native behavior or coverage gap.
  Resolution: Added erased EPaM assertions to the bounded indexed comparisons, leaving emitted test JS identical; reran format/lint/typecheck alongside metadata checks, without replaying passed behavioral suites.
