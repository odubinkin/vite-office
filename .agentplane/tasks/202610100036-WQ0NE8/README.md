---
id: "202610100036-WQ0NE8"
title: "Restore native UL spacing contracts and complete browser item state"
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
  updated_at: "2026-10-10T00:39:24.790Z"
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
    body: "Start: complete original UL native state and value contracts under matching header, move tuple encoding to browser boundary, preserve all27historical metric/context assertions with source-backed native observers. Atomic7/10; no unrelated behavior changes."
events:
  -
    type: "status"
    at: "2026-10-10T00:39:25.497Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete original UL native state and value contracts under matching header, move tuple encoding to browser boundary, preserve all27historical metric/context assertions with source-backed native observers. Atomic7/10; no unrelated behavior changes."
doc_version: 3
doc_updated_at: "2026-10-10T00:39:25.497Z"
doc_updated_by: "CODER"
description: "Atomic task7/10 after BZQGYC. Native SvxULSpaceItem lacks source-owned proportion fields, setters, native constructor/default QueryValue/PutValue and complete clone/equality. Port exact pinned five-field native state and value quirks; move old tuple representation into existing browser item codec and preserve old tuple admission while transporting full proportions through registered pool boundary. Preserve table/paragraph original ItemSet/history/UI and conscious I/O deviations. Native LR/UL table-format transport follows in another atomic task; no inverse/private field adapters."
sections:
  Summary: "Restore full original native UL spacing state/contracts and remove core-owned tuple serialization. Atomic task7/10 after BZQGYC; broad goal remains incomplete."
  Scope: "Native UL class declaration will live at apps/office/src/editeng/inc/ulspitem.ts matching include/editeng/ulspitem.hxx; frmitems.ts retains original export binding. Other production paths: sw/source/core/attr/swatrset.ts and sw/browser/filter/xml/item-codec.ts. Eight canonical runtime/provenance records including new native owner and exact old owned-declaration relocation. Fresh native/pool/history/mounted acceptance files. TypeChecker audit identifies27 UL QueryValue uses in12 historical test files (listed in ignored query-migrations.json); migrate only these expressions to test-only native member3/4/7 field observers, preserving every expected metric/context/assertion and all sibling source text. One constructor-negative assertion becomes exact native uint16 cast assertion. Explicit native contract tests lock aggregate quirks. All affected test modules are within the approved writer/shared parity scope; no unrelated test edits, source omissions, criteria reduction, LR/table-format transport or IO/recovery/settings drift."
  Plan: "Restore complete native UL five-field constructors/setters/QueryValue/PutValue/clone/equality and place declaration under matching native header with unchanged original export binding. Remove core tuple persistence into existing browser codec; registered pool boundary preserves old tuple ingress and full proportions. Exactly27compiler-resolved old UL Query expressions in12files migrate to native member3/4/7 observer without changing any expected metric/context;1native uint16 assertion migration. Fresh native/pool/history/mounted evidence, accurate owned-symbol metadata relocation, actual4whole-module Istanbul100all-four with explicitnew/related once upstream absent, TS7/static/browser and restored metadata checks, exact-SHA clean close.7/10, no full run."
  Verify Steps: |-
    1. Fresh native UL source-backed tests cover default/value/copy semantics, both proportions/context, direct/scaled setters and uint16 behavior; exact QueryValue/PutValue member routing, native aggregate quirks and malformed/unsupported input. No browser tuple returned by core QueryValue. Original five-field native ItemSet and history/Worker boundary retain proportions/context; old2/3tuple records keep prior semantics and unsafe ingress still rejects.
    2. Entire final frmitems.ts, swatrset.ts and item-codec.ts actual Istanbul100 lines/statements/functions/branches on current source hashes and complete maps, zero negative counters. Run fresh and explicit related tests physically vendor/libreoffice-reference absent with finally restoration, no source calls from tests or previous map reuse. Repair failed/new only unless real production changes justify broader revalidation; full not due7/10.
    3. Upstream-absent format/lint/TS7/dependency/JSDoc/file-size/build/static and related Chromium table gates pass. Preserve every old acceptance except exact recorded source-backed native QueryValue/constructor migrations; canonical statuses/default classifications/historical evidence retain prefix.
    4. After restore, source-tree/provenance/registry build/check/writer resources --check/invariants/parity/routing/doctor pass. Record bounded English evidence without upstream/helper/raw map artifacts, exact-SHA review explicitly same-agent/non-independent, then clean writer checkout and restored reference.
  Verification: "Pending current-source native value/complete state tests, actual whole-module coverage, static/browser and metadata checks."
  Rollback Plan: "Revert the semantic implementation commit without rewriting history; restore ignored upstream symlink in finally for every validation profile. Retain traceability and source-backed expectation history."
  Findings: "Current UL core owns upper/lower/context only and returns browser tuple from QueryValue. Pinned item also owns nPropUpper/nPropLower with public setters and native UNO contracts. Source aggregate query uses nPropUpper for unconverted Lower; aggregate PutValue assigns qualifying ScaleLower to nPropUpper. These literal pinned quirks must be preserved, not silently repaired. Full table LR/UL transport follows after native state is complete; no inverse/private-field browser adaptation. Previous goal turn completed HM2YX4 and ZJJ73M with verified source changes and tests, classified as progress."
id_source: "generated"
---
## Summary

Restore full original native UL spacing state/contracts and remove core-owned tuple serialization. Atomic task7/10 after BZQGYC; broad goal remains incomplete.

## Scope

Native UL class declaration will live at apps/office/src/editeng/inc/ulspitem.ts matching include/editeng/ulspitem.hxx; frmitems.ts retains original export binding. Other production paths: sw/source/core/attr/swatrset.ts and sw/browser/filter/xml/item-codec.ts. Eight canonical runtime/provenance records including new native owner and exact old owned-declaration relocation. Fresh native/pool/history/mounted acceptance files. TypeChecker audit identifies27 UL QueryValue uses in12 historical test files (listed in ignored query-migrations.json); migrate only these expressions to test-only native member3/4/7 field observers, preserving every expected metric/context/assertion and all sibling source text. One constructor-negative assertion becomes exact native uint16 cast assertion. Explicit native contract tests lock aggregate quirks. All affected test modules are within the approved writer/shared parity scope; no unrelated test edits, source omissions, criteria reduction, LR/table-format transport or IO/recovery/settings drift.

## Plan

Restore complete native UL five-field constructors/setters/QueryValue/PutValue/clone/equality and place declaration under matching native header with unchanged original export binding. Remove core tuple persistence into existing browser codec; registered pool boundary preserves old tuple ingress and full proportions. Exactly27compiler-resolved old UL Query expressions in12files migrate to native member3/4/7 observer without changing any expected metric/context;1native uint16 assertion migration. Fresh native/pool/history/mounted evidence, accurate owned-symbol metadata relocation, actual4whole-module Istanbul100all-four with explicitnew/related once upstream absent, TS7/static/browser and restored metadata checks, exact-SHA clean close.7/10, no full run.

## Verify Steps

1. Fresh native UL source-backed tests cover default/value/copy semantics, both proportions/context, direct/scaled setters and uint16 behavior; exact QueryValue/PutValue member routing, native aggregate quirks and malformed/unsupported input. No browser tuple returned by core QueryValue. Original five-field native ItemSet and history/Worker boundary retain proportions/context; old2/3tuple records keep prior semantics and unsafe ingress still rejects.
2. Entire final frmitems.ts, swatrset.ts and item-codec.ts actual Istanbul100 lines/statements/functions/branches on current source hashes and complete maps, zero negative counters. Run fresh and explicit related tests physically vendor/libreoffice-reference absent with finally restoration, no source calls from tests or previous map reuse. Repair failed/new only unless real production changes justify broader revalidation; full not due7/10.
3. Upstream-absent format/lint/TS7/dependency/JSDoc/file-size/build/static and related Chromium table gates pass. Preserve every old acceptance except exact recorded source-backed native QueryValue/constructor migrations; canonical statuses/default classifications/historical evidence retain prefix.
4. After restore, source-tree/provenance/registry build/check/writer resources --check/invariants/parity/routing/doctor pass. Record bounded English evidence without upstream/helper/raw map artifacts, exact-SHA review explicitly same-agent/non-independent, then clean writer checkout and restored reference.

## Verification

Pending current-source native value/complete state tests, actual whole-module coverage, static/browser and metadata checks.

## Rollback Plan

Revert the semantic implementation commit without rewriting history; restore ignored upstream symlink in finally for every validation profile. Retain traceability and source-backed expectation history.

## Findings

Current UL core owns upper/lower/context only and returns browser tuple from QueryValue. Pinned item also owns nPropUpper/nPropLower with public setters and native UNO contracts. Source aggregate query uses nPropUpper for unconverted Lower; aggregate PutValue assigns qualifying ScaleLower to nPropUpper. These literal pinned quirks must be preserved, not silently repaired. Full table LR/UL transport follows after native state is complete; no inverse/private-field browser adaptation. Previous goal turn completed HM2YX4 and ZJJ73M with verified source changes and tests, classified as progress.
