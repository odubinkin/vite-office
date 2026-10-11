---
id: "202610111709-3KND03"
title: "Port original UNO sequence allocation and copy-on-write engine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:10:18.379Z"
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
    body: "Start: complete original UNO sequence engine with real shared dependencies and native/portable proof."
events:
  -
    type: "status"
    at: "2026-10-11T17:10:30.237Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete original UNO sequence engine with real shared dependencies and native/portable proof."
doc_version: 3
doc_updated_at: "2026-10-11T17:10:30.237Z"
doc_updated_by: "CODER"
description: "Task42: complete sequence.cxx engine required by original i18npool offsets and returned-string sequences; reuse existing CPPu/SAL type, copy, default and destruction owners. Source-shaped allocation/default/copy/reallocation/reference-to-one/assignment paths and actual native replay, portable raw100, inventory and scoped gates. Full run cadence restarts after task41."
sections:
  Summary: "Task42 implements the complete original UNO sequence.cxx engine as the next concrete dependency of i18npool casing offsets and returned-string sequences, supporting original CharClass/SharedStringPool and Calc cell values."
  Scope: "Only vite-office-calc branch calc. Existing cppu/source/uno/sequence.ts and cppu/inc/uno/sequence2.ts plus source-shaped sequence-elements.ts split of original sequence.cxx helpers if needed for file-size. Reuse existing SAL sequence/count storage, CPPu real type descriptions, addressed allocation, default/copy/destruction/empty-sequence owners; narrow changes to these existing owners only if original engine contracts require them. Original type/ref and full-description C construct/realloc/reference2One/assign/destroy APIs, allocation/default/copy helper switches and reallocation branches. Adjacent tests and complete original native fixture, new scripts/uno-sequence-native-probe.mjs and source-shaped helper if needed; reuse existing genuine SAL/CPPU native build tooling, original sequence/data/any units and generated real types, no handwritten native dependency substitute. Complete per-owner shared runtime/provenance/capability records, calc-core dependency documentation and genuine suspected Calc upstream cases. Dependency boundary/cycle checker changes only for actual same-module source imports if enforcement requires them; no general graph restriction weakening. Public C++ Sequence template wrapper and UNO weak/service/classification/CharClass/SharedStringPool/cell/document/UI consumers remain subsequent work, not stubbed in this task. Native physical allocation addresses/byte layout/resource OOM, invalid pointers/ranges/type metadata and unsupported undefined behavior are not claimed browser parity. Supported signed32/byte-count/type/ref/value/ownership/error ordering follows upstream. No full-suite replay until task51 unless concrete failure requires it, no Writer-only coverage repair, network/publication/merge/new branch."
  Plan: "Inspect complete pinned sequence.cxx and dependent original headers. Implement complete C engine using existing CPPu/SAL owners, preserving all original switch/default/copy/COW/refcount/assignment ordering and stable logical addressed storage. Capture genuine native initialized complete histories across element kinds and source-defined failure guards with normal/ASan/UBSan; compare complete portable fields/callback/refcount observations. Verify source-absent Calc and all affected shared raw S/B/F/L100; scoped static/provenance/inventory/tooling/routing checks and exact link restoration. Record source suspects without correcting them, EVALUATOR review committed implementation and clean direct closure. Continue real downstream casing/pool/cell/document UI prerequisites; next full cadence task51."
  Verify Steps: |-
    1. Verify full pinned sequence.cxx/header/dependency hashes and read every supported constructor/default/copy/realloc/reference2One/assign/destroy path. Retain original initialized/indeterminate storage distinction and guard/result/output-write/refcount/callback ordering.
    2. New native probe --write then --check executes actual complete original sequence/data/any translation units and true SAL/CPPU/type dependencies, not recreated algorithms. Complete normal and ASan/UBSan captures agree, including element tags, initialized values, logical shared identity, type/string/sequence/interface acquisitions/releases and ordered callbacks, COW/default/copy/realloc/assign histories and defined guard failures. Native malloc/realloc physical address choice and resource failure are explicitly unverified, not hardcoded expected JS pointers.
    3. Remove all3 original source links for npm run test:coverage:calc and directly affected shared tests; every raw S/F/B counter positive and S/B/F/L100 for changed executable owners. Retain complete captures and every defined portable observation, restore exact links in finally. No coverage/test/timeout/exclusion weakening.
    4. Run TS7, exact changed-source ESLint/Prettier, JSDoc, file size, actual module boundaries, full provenance/source-tree, shared/Calc inventories, related tooling, routing/doctor and diff. Full suite task51, no unnecessary repeat native builds or unchanged full tests.
    5. Record verification and residual unported public template/service/pool/cell/document/UI contracts; meaningful intentional commit, separate EVALUATOR phase, clean direct close. Keep full goal active until actual complete Calc outcome.
  Verification: "Pending original complete engine implementation and actual native/portable checks."
  Rollback Plan: "Revert only task42 intentional commits if needed. Keep task41 and unrelated active tasks unchanged. Restore original symlinks on every source-absent runner exit; no native original file mutation."
  Findings: "Previous goal turn is concrete progress: tasks40/41 completed, full15084/668 raw100 and all final gates pass at1daed692, followed by requested pause. Authoritative goal now active (explicit continuation) and calc checkout clean. Original casing body constructs Sequence<int32> offsets and Sequence<OUString> results; public sequence wrapper absent and sequence.cxx currently exposes only prior count-view/zero-count destruction boundary. Source engine is915lines; a source-mapped helper split may be required by repository600-line budget. Reuse existing default/copy/destruction and true native build, no provisional string service."
id_source: "generated"
---
## Summary

Task42 implements the complete original UNO sequence.cxx engine as the next concrete dependency of i18npool casing offsets and returned-string sequences, supporting original CharClass/SharedStringPool and Calc cell values.

## Scope

Only vite-office-calc branch calc. Existing cppu/source/uno/sequence.ts and cppu/inc/uno/sequence2.ts plus source-shaped sequence-elements.ts split of original sequence.cxx helpers if needed for file-size. Reuse existing SAL sequence/count storage, CPPu real type descriptions, addressed allocation, default/copy/destruction/empty-sequence owners; narrow changes to these existing owners only if original engine contracts require them. Original type/ref and full-description C construct/realloc/reference2One/assign/destroy APIs, allocation/default/copy helper switches and reallocation branches. Adjacent tests and complete original native fixture, new scripts/uno-sequence-native-probe.mjs and source-shaped helper if needed; reuse existing genuine SAL/CPPU native build tooling, original sequence/data/any units and generated real types, no handwritten native dependency substitute. Complete per-owner shared runtime/provenance/capability records, calc-core dependency documentation and genuine suspected Calc upstream cases. Dependency boundary/cycle checker changes only for actual same-module source imports if enforcement requires them; no general graph restriction weakening. Public C++ Sequence template wrapper and UNO weak/service/classification/CharClass/SharedStringPool/cell/document/UI consumers remain subsequent work, not stubbed in this task. Native physical allocation addresses/byte layout/resource OOM, invalid pointers/ranges/type metadata and unsupported undefined behavior are not claimed browser parity. Supported signed32/byte-count/type/ref/value/ownership/error ordering follows upstream. No full-suite replay until task51 unless concrete failure requires it, no Writer-only coverage repair, network/publication/merge/new branch.

## Plan

Inspect complete pinned sequence.cxx and dependent original headers. Implement complete C engine using existing CPPu/SAL owners, preserving all original switch/default/copy/COW/refcount/assignment ordering and stable logical addressed storage. Capture genuine native initialized complete histories across element kinds and source-defined failure guards with normal/ASan/UBSan; compare complete portable fields/callback/refcount observations. Verify source-absent Calc and all affected shared raw S/B/F/L100; scoped static/provenance/inventory/tooling/routing checks and exact link restoration. Record source suspects without correcting them, EVALUATOR review committed implementation and clean direct closure. Continue real downstream casing/pool/cell/document UI prerequisites; next full cadence task51.

## Verify Steps

1. Verify full pinned sequence.cxx/header/dependency hashes and read every supported constructor/default/copy/realloc/reference2One/assign/destroy path. Retain original initialized/indeterminate storage distinction and guard/result/output-write/refcount/callback ordering.
2. New native probe --write then --check executes actual complete original sequence/data/any translation units and true SAL/CPPU/type dependencies, not recreated algorithms. Complete normal and ASan/UBSan captures agree, including element tags, initialized values, logical shared identity, type/string/sequence/interface acquisitions/releases and ordered callbacks, COW/default/copy/realloc/assign histories and defined guard failures. Native malloc/realloc physical address choice and resource failure are explicitly unverified, not hardcoded expected JS pointers.
3. Remove all3 original source links for npm run test:coverage:calc and directly affected shared tests; every raw S/F/B counter positive and S/B/F/L100 for changed executable owners. Retain complete captures and every defined portable observation, restore exact links in finally. No coverage/test/timeout/exclusion weakening.
4. Run TS7, exact changed-source ESLint/Prettier, JSDoc, file size, actual module boundaries, full provenance/source-tree, shared/Calc inventories, related tooling, routing/doctor and diff. Full suite task51, no unnecessary repeat native builds or unchanged full tests.
5. Record verification and residual unported public template/service/pool/cell/document/UI contracts; meaningful intentional commit, separate EVALUATOR phase, clean direct close. Keep full goal active until actual complete Calc outcome.

## Verification

Pending original complete engine implementation and actual native/portable checks.

## Rollback Plan

Revert only task42 intentional commits if needed. Keep task41 and unrelated active tasks unchanged. Restore original symlinks on every source-absent runner exit; no native original file mutation.

## Findings

Previous goal turn is concrete progress: tasks40/41 completed, full15084/668 raw100 and all final gates pass at1daed692, followed by requested pause. Authoritative goal now active (explicit continuation) and calc checkout clean. Original casing body constructs Sequence<int32> offsets and Sequence<OUString> results; public sequence wrapper absent and sequence.cxx currently exposes only prior count-view/zero-count destruction boundary. Source engine is915lines; a source-mapped helper split may be required by repository600-line budget. Reuse existing default/copy/destruction and true native build, no provisional string service.
