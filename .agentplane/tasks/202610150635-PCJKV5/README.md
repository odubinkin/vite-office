---
id: "202610150635-PCJKV5"
title: "Implement native edit-engine text positions and selections"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-15T06:36:23.143Z"
doc_updated_by: "CODER"
description: "Task149 implements complete shared EPaM/ESelection value contracts from original public headers for Calc text editing and future genuine EditTextObject use. Original defaults/sentinels/order/adjust/collapse and value-copy semantics, no UI localization or fake document adapter."
sections:
  Summary: "Task149 implements original shared EPaM and ESelection text position/selection value owners needed for cell/header-footer editing. No existing owner exists to reuse."
  Scope: "At most16intentional non-agent paths: canonical editeng/inc/EPaM.ts and ESelection.ts, one direct source-backed test, matching runtime/provenance/capability records and calc-core docs. Original default/copy/value constructors, max sentinels, fields, equality/order, adjustedness/Adjust, CollapseToStart/End, HasRange and diagnostic stream text. JS numbers/GC; explicit implicit-C++copy constructor/assignment methods and copied public field assignment preserve value semantics and borrowed field identity. No text engine/document facade, UI localization, spelling, memory/holder manager or native binary layout."
  Plan: "Implement actual shared EPaM/ESelection complete header value contracts, preserve copied field assignment and borrowed value identity, strict interval ordering, scoped raw100/gates/build/native audit/inventory and16path clean calc closure."
  Verify Steps: "Compare original include/editeng/EPaM.hxx and ESelection.hxx, exact int32 max sentinels and editeng source QA selection use. Test all constructor forms/default/copies, assignment/self assignment, borrowed mutable fields, field assignment copying, equality and paragraph/index lexicographic order, All/AtEnd/NotFound fresh values, selection Adjust stable borrowed positions and both collapses independent values. Selection order is strict disjoint end-before-start on adjusted inputs; touching/overlap are unordered, not lexicographic. Debug-only assertion/native stream templates are represented by documented precondition and equivalent toString text, no new release exception or native ABI manager. All methods/new shared raw S/B/F/L counters positive100; whole Calc raw100, all13scoped source gates including39existing boundary cases, inventory zero semantic violations and production build. Four reference links absent during tests/build restored finally, no compiler/native probes. Source pins/hash audit/exact16path bound and clean calc. Writer-only coverage gaps exempt; full suite only on actual minimal UI+same-model ODS readiness then fixes/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only intentional paths through a later authorized task; no reset, merge or publication."
  Findings: "Native value structs have copy semantics; ordinary aliasing assignment would be a porting bug. Use JS object identity only for storage/borrowing, not as position or range value equality. No existing Writer-specific document selection is duplicated or replaced; these are actual shared EditEngine public types. Actual EditTextObject/ScPageHFItem/pool/model/connected UI/ODS remain pending, localization deferred. Same-agent evaluation is not independent."
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

Pending execution.

## Rollback Plan

Revert only intentional paths through a later authorized task; no reset, merge or publication.

## Findings

Native value structs have copy semantics; ordinary aliasing assignment would be a porting bug. Use JS object identity only for storage/borrowing, not as position or range value equality. No existing Writer-specific document selection is duplicated or replaced; these are actual shared EditEngine public types. Actual EditTextObject/ScPageHFItem/pool/model/connected UI/ODS remain pending, localization deferred. Same-agent evaluation is not independent.
