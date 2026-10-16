---
id: "202610160801-BGZ526"
title: "Connect local cell references and native formula tracking"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T08:02:39.982Z"
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
    body: "Start: implement local cell-reference evaluation and actual single-cell broadcaster/FormulaTrack invalidation on the existing document, reusing shared observers and cell views without UI or a second graph."
events:
  -
    type: "status"
    at: "2026-10-16T08:02:50.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement local cell-reference evaluation and actual single-cell broadcaster/FormulaTrack invalidation on the existing document, reusing shared observers and cell views without UI or a second graph."
doc_version: 3
doc_updated_at: "2026-10-16T08:02:50.917Z"
doc_updated_by: "CODER"
description: "Task201: extend the actual Calc formula path with valid local A1 references, real cell views, shared Svt notifications, broadcaster stores and source-shaped FormulaTrack/FormulaTree invalidation. Keep ODS and separate UI readiness as the delivery priority; no alternative dependency graph."
sections:
  Summary: "Task201: connect valid same-sheet A1 reference tokens and real source-shaped single-cell notification/tracking to existing Calc formula cells. This directly advances minimal editable-core readiness and same-model ODS work; UI remains separate."
  Scope: "Calc address Details/Parse local A1 subset, ScCompiler/ScTokenArray reference binding, existing ScRefCellValue document/formula views, interpreter numeric/empty/direct-text reference results, ScHint, actual shared SvtBroadcaster/SvtListener, mdds BroadcasterStoreType and existing column/table/document/formula-cell owners. Implement native logical FormulaTrack/FormulaTree linked membership and dispatch, detach/replacement/clear, cycle error for normal noniterative mode and sheet insertion positions. Shared notifier generic object bound must accept real SfxHint subclasses without changing dispatch algorithms or adding a Calc observer clone/Writer compatibility shim. Runtime/header paths are the existing address/token/cellvalue/compiler/interpreter/formulacell/document/table/column/mtvelements owners, new sc/inc/brdcst.ts and optional source-shaped tracking helper shard if file budget requires; paired inventory/provenance/capabilities and focused tests/docs. Native lifetime notifications may call existing SvtBroadcaster.Dispose when a stored broadcaster is removed; JS GC still owns physical object lifetime. Explicitly unsupported: cross-sheet/external/range/named references, functions/SUM, locale string-to-number formatting, full recursion/iteration/group/area broadcasting and full constructor services. Do not manufacture default numeric conversion or a second dependency graph."
  Plan: "1. Audit pinned valid local reference parser/flags, reference cell views, scalar interpretation, native single-cell broadcaster storage and logical tracking/tree queues. 2. Extend the actual source owners and reuse shared observers and stores, with explicit unsupported boundaries. 3. Verify reference offsets/absolute flags, sparse cells, chains, duplicate subscriptions, replacement/clear, errors/cycles, direct text results, forced tracking and sheet-position changes. 4. Update inventory and current readiness; strict exact-owner whole-Calc/changed-shared raw100 plus related shared and affected Writer tests, actual Chromium/Worker, source gates and same-agent review. Serialization/basic ODS remains the next delivery priority; ranges/functions must not trigger broad kernel parity or language detours. Full all-app run only at minimal UI+ODS-ready milestone, then pause."
  Verify Steps: |-
    - node output/playwright/task201-checks/source-audit.mjs: pinned reached upstream parser/reference/view/listener/queue/tree/error behavior and explicit omitted services; no native compilation/probes.
    - node output/playwright/task201-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owners; changed shared owners every raw counter positive and related notifier/block/reference/token tests plus affected Writer notification consumers; Writer-only coverage gaps exempt; all5 source references absent/restored.
    - node output/playwright/task201-checks/browser-portable.mjs: build and real formula reference edits/propagation in Chromium and DOM-free Worker without native references; affected Writer functional smoke if runtime notifier behavior changes.
    - node output/playwright/task201-checks/source-gates.mjs: all existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates, without threshold/allowlist relaxation.
    - Final source/path/ref/coverage audit, recorded verification/source commit and same-agent quality review before finish. No UI implementation, ODS claim or full all-app run until the requested milestone.
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert only task201 source/metadata commits while preserving unrelated tasks and deferred LanguageTag work. No destructive reset, branch merge, publication or native-reference mutation."
  Findings: "Previous goal turn completed task200, source0c88b33ccffeed1379a919902fc4550853d6b473, close995f701559a7, clean calc branch. Native single-cell invalidation uses Svt broadcasters stored separately from cell values and intrusive logical FormulaTrack/FormulaTree order; do not replace it with an ad-hoc Map graph, recursive global invalidation or memory ownership engine. Existing shared observer dispatch is reusable; its browser-kind generic constraint is an erased-type restriction and must accept actual native hint objects. This does not certify all unconsumed native hint/lifecycle families or require unrelated Writer parity work before core edits. Existing ScRefCellValue and ScSingleRefData must be extended/reused instead of bypassed. Native GetSharedString intentionally does not expose formula string results; formula GetString is separate. Native default string coercion is LOCALE; do not silently replace its unavailable formatter with another mode or a generic NoValue stub. Only valid local A1 parsing is supported in this slice; absent name/invalid-address fallback remains explicit."
id_source: "generated"
---
## Summary

Task201: connect valid same-sheet A1 reference tokens and real source-shaped single-cell notification/tracking to existing Calc formula cells. This directly advances minimal editable-core readiness and same-model ODS work; UI remains separate.

## Scope

Calc address Details/Parse local A1 subset, ScCompiler/ScTokenArray reference binding, existing ScRefCellValue document/formula views, interpreter numeric/empty/direct-text reference results, ScHint, actual shared SvtBroadcaster/SvtListener, mdds BroadcasterStoreType and existing column/table/document/formula-cell owners. Implement native logical FormulaTrack/FormulaTree linked membership and dispatch, detach/replacement/clear, cycle error for normal noniterative mode and sheet insertion positions. Shared notifier generic object bound must accept real SfxHint subclasses without changing dispatch algorithms or adding a Calc observer clone/Writer compatibility shim. Runtime/header paths are the existing address/token/cellvalue/compiler/interpreter/formulacell/document/table/column/mtvelements owners, new sc/inc/brdcst.ts and optional source-shaped tracking helper shard if file budget requires; paired inventory/provenance/capabilities and focused tests/docs. Native lifetime notifications may call existing SvtBroadcaster.Dispose when a stored broadcaster is removed; JS GC still owns physical object lifetime. Explicitly unsupported: cross-sheet/external/range/named references, functions/SUM, locale string-to-number formatting, full recursion/iteration/group/area broadcasting and full constructor services. Do not manufacture default numeric conversion or a second dependency graph.

## Plan

1. Audit pinned valid local reference parser/flags, reference cell views, scalar interpretation, native single-cell broadcaster storage and logical tracking/tree queues. 2. Extend the actual source owners and reuse shared observers and stores, with explicit unsupported boundaries. 3. Verify reference offsets/absolute flags, sparse cells, chains, duplicate subscriptions, replacement/clear, errors/cycles, direct text results, forced tracking and sheet-position changes. 4. Update inventory and current readiness; strict exact-owner whole-Calc/changed-shared raw100 plus related shared and affected Writer tests, actual Chromium/Worker, source gates and same-agent review. Serialization/basic ODS remains the next delivery priority; ranges/functions must not trigger broad kernel parity or language detours. Full all-app run only at minimal UI+ODS-ready milestone, then pause.

## Verify Steps

- node output/playwright/task201-checks/source-audit.mjs: pinned reached upstream parser/reference/view/listener/queue/tree/error behavior and explicit omitted services; no native compilation/probes.
- node output/playwright/task201-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owners; changed shared owners every raw counter positive and related notifier/block/reference/token tests plus affected Writer notification consumers; Writer-only coverage gaps exempt; all5 source references absent/restored.
- node output/playwright/task201-checks/browser-portable.mjs: build and real formula reference edits/propagation in Chromium and DOM-free Worker without native references; affected Writer functional smoke if runtime notifier behavior changes.
- node output/playwright/task201-checks/source-gates.mjs: all existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates, without threshold/allowlist relaxation.
- Final source/path/ref/coverage audit, recorded verification/source commit and same-agent quality review before finish. No UI implementation, ODS claim or full all-app run until the requested milestone.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert only task201 source/metadata commits while preserving unrelated tasks and deferred LanguageTag work. No destructive reset, branch merge, publication or native-reference mutation.

## Findings

Previous goal turn completed task200, source0c88b33ccffeed1379a919902fc4550853d6b473, close995f701559a7, clean calc branch. Native single-cell invalidation uses Svt broadcasters stored separately from cell values and intrusive logical FormulaTrack/FormulaTree order; do not replace it with an ad-hoc Map graph, recursive global invalidation or memory ownership engine. Existing shared observer dispatch is reusable; its browser-kind generic constraint is an erased-type restriction and must accept actual native hint objects. This does not certify all unconsumed native hint/lifecycle families or require unrelated Writer parity work before core edits. Existing ScRefCellValue and ScSingleRefData must be extended/reused instead of bypassed. Native GetSharedString intentionally does not expose formula string results; formula GetString is separate. Native default string coercion is LOCALE; do not silently replace its unavailable formatter with another mode or a generic NoValue stub. Only valid local A1 parsing is supported in this slice; absent name/invalid-address fallback remains explicit.
