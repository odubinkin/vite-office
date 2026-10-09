---
id: "202610091449-FW0RYR"
title: "Route Writer object destruction through native ObjectDyingHint"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T14:51:25.961Z"
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
    body: "Start: Implement approved native ObjectDying protocol and original item inheritance under existing iterative user authorization; correction4/10."
events:
  -
    type: "status"
    at: "2026-10-09T14:51:29.446Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native ObjectDying protocol and original item inheritance under existing iterative user authorization; correction4/10."
doc_version: 3
doc_updated_at: "2026-10-09T14:51:29.446Z"
doc_updated_by: "CODER"
description: "Correction4 after full TS7/Istanbul XJTGF0: implement native ObjectDyingHint/ModifyChangedHint and ClientBase CheckRegistration behavior, SwModify pre-destruction Writer notification/fallback cleanup, SwFormat inherited item-set rebind/detach and native browser observer invalidation. Remove duplicated generic death repair, preserve original owners and registered I/O deviations; existing iterative user authorization applies."
sections:
  Summary: "Port native Writer ObjectDyingHint and CheckRegistration destruction protocol to original clients, formats and browser observer. Correction4 after full TS7/Istanbul XJTGF0; prior correction KCHP9M ported the distinct pre-base Destr/PrepareFormatDeath stage."
  Scope: "Production4: apps/office/src/sw/inc/hints.ts, sw/inc/calbck.ts, sw/source/core/attr/format.ts, sw/browser/presentation/writer-native-format-observer.ts. Fresh core/notification, real cell undo-redo and mounted React tests in native-object-dying.test.ts/tsx under core/attr, core/undo and browser/editor. Related existing notification/format/table/layout/history/lifecycle/style/rule tests; exact source-backed event expectations may be migrated only where native destruction is newly observable. Preserve8 canonical runtime/provenance record histories and generated views. Native frame ObjectDying filtering remains unchanged as wsfrm.cxx explicitly excludes this hint; full linked clients/cache/assertions/naming/VCL stay unverified. No save/open/recovery/dependency/tooling/policy edits, upstream source artifacts, full-suite replay, network/outside access or subagents."
  Plan: "Snapshot source/scripts/docs hashes,4 production paths,8 canonical records and parent Findings in ignored cache. Implement borrowed ObjectDyingHint/ModifyChangedHint, shared source-shaped CheckRegistration with native registration before returning the new owner, consistent EndListeningAll and pre-destruction locked Writer notification followed by native fallback cleanup. Remove duplicated generic BroadcasterDying parent repair; retain reciprocal Sfx fallback through the same native operation. SwFormat rebinds or clears its owned item-set parent under exact dying-parent identity guard and relays the original hint. Existing independent browser observer invalidates native layout/bindings on original dying hints. Object death bypasses browser batching; disposed transactions do not flush stale queued hints. Add original-client identity/order/lock/fallback/foreign/repeated/nested-transaction tests plus real native history and mounted independent-root style/cell tests. Collect new+related Istanbul once physically upstream-absent; only failed/new cases close any gaps with identical complete current-source maps. Require complete4-module actual100 all four metrics/zero negative counters. Run static gates upstream-absent and restore symlink in finally, then metadata-only audits. Preserve all prior inventory semantics and unaffected tests; record bounded English commands/counts/hashes, semantic commit, same-agent non-independent quality and canonical finish. Existing iterative user authorization applies."
  Verify Steps: |-
    1. With vendor/libreoffice-reference physically unavailable, run fresh original-client/core, real undo-redo and mounted UI tests plus related notify/Svt/formats/layout/table/history/lifecycle/style/rule tests. Verify borrowed dying/new-owner pointers, native CheckRegistration return/no-op, root detach and reciprocal unregister, notification before disposal under boolean modify lock, native fallback cleanup, idempotence, immediate object death and no stale disposed transaction flush. Verify surviving owned item-set parent, original node/cursor/frame identities and actual mounted style/cell pool defaults without document model bridge; native physical frame filtering remains source-correct.
    2. Require actual Istanbul100 lines/statements/functions/branches on complete hints.ts,calbck.ts,format.ts,writer-native-format-observer.ts; zero negative counters, current source hashes and identical complete maps for failed/new-only closure. No prior task/V8 counters, counter/map/location normalization, narrowed module lines or threshold changes. Retain any raw failures and fix exact failed behavior/fixtures before finish.
    3. Run npm run format:check,lint,typecheck (nativeTS7),check:dependencies,test:static,check:docs,check:file-size upstream-absent and restore reference in finally. Then metadata-only inventory:registry:build/check,check:source-tree/provenance,writer resource generator --check,routing validator and ap doctor.
    4. Prove old canonical8records value/responsibility/evidence prefixes, append-only parent Findings and unrelated source/scripts/docs/tests preserved; migrate only specifically conflicting native death event assertions. Bind semantic SHA, record verification and explicit same-agent non-independent quality, finish and prove clean git status. Last full XJTGF0 historical; correction4/10, next full after10resumed corrections.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf source/test and appended inventory evidence via a new task. Preserve immutable DONE artifacts, parent Findings history and registered I/O exceptions."
  Findings: "Pinned9bc445578031fecf56086729d8e4940c77e14d65: calbck.cxx::ClientBase::CheckRegistration/SwModify destructor/SwClientNotify, hints.hxx::ObjectDyingHint, calbck.hxx::ModifyChangedHint, format.cxx::SwFormat::SwClientNotify ObjectDying branch. Current generic broadcaster callback skips original Writer death hint and leaves root-dependent item-set inheritance stale. Native wsfrm.cxx::SwFrame::SwClientNotify excludes ObjectDying, so no invented physical invalidation is added. Writer browser batching and callback-backed SwClient are bounded existing adaptations; linked iterator/assertion/cache/name/VCL families remain unverified. Previous goal turn made concrete progress: KCHP9M DONE semantic3bb966ac297c,314cases/scoped100; no blocker."
id_source: "generated"
---
## Summary

Port native Writer ObjectDyingHint and CheckRegistration destruction protocol to original clients, formats and browser observer. Correction4 after full TS7/Istanbul XJTGF0; prior correction KCHP9M ported the distinct pre-base Destr/PrepareFormatDeath stage.

## Scope

Production4: apps/office/src/sw/inc/hints.ts, sw/inc/calbck.ts, sw/source/core/attr/format.ts, sw/browser/presentation/writer-native-format-observer.ts. Fresh core/notification, real cell undo-redo and mounted React tests in native-object-dying.test.ts/tsx under core/attr, core/undo and browser/editor. Related existing notification/format/table/layout/history/lifecycle/style/rule tests; exact source-backed event expectations may be migrated only where native destruction is newly observable. Preserve8 canonical runtime/provenance record histories and generated views. Native frame ObjectDying filtering remains unchanged as wsfrm.cxx explicitly excludes this hint; full linked clients/cache/assertions/naming/VCL stay unverified. No save/open/recovery/dependency/tooling/policy edits, upstream source artifacts, full-suite replay, network/outside access or subagents.

## Plan

Snapshot source/scripts/docs hashes,4 production paths,8 canonical records and parent Findings in ignored cache. Implement borrowed ObjectDyingHint/ModifyChangedHint, shared source-shaped CheckRegistration with native registration before returning the new owner, consistent EndListeningAll and pre-destruction locked Writer notification followed by native fallback cleanup. Remove duplicated generic BroadcasterDying parent repair; retain reciprocal Sfx fallback through the same native operation. SwFormat rebinds or clears its owned item-set parent under exact dying-parent identity guard and relays the original hint. Existing independent browser observer invalidates native layout/bindings on original dying hints. Object death bypasses browser batching; disposed transactions do not flush stale queued hints. Add original-client identity/order/lock/fallback/foreign/repeated/nested-transaction tests plus real native history and mounted independent-root style/cell tests. Collect new+related Istanbul once physically upstream-absent; only failed/new cases close any gaps with identical complete current-source maps. Require complete4-module actual100 all four metrics/zero negative counters. Run static gates upstream-absent and restore symlink in finally, then metadata-only audits. Preserve all prior inventory semantics and unaffected tests; record bounded English commands/counts/hashes, semantic commit, same-agent non-independent quality and canonical finish. Existing iterative user authorization applies.

## Verify Steps

1. With vendor/libreoffice-reference physically unavailable, run fresh original-client/core, real undo-redo and mounted UI tests plus related notify/Svt/formats/layout/table/history/lifecycle/style/rule tests. Verify borrowed dying/new-owner pointers, native CheckRegistration return/no-op, root detach and reciprocal unregister, notification before disposal under boolean modify lock, native fallback cleanup, idempotence, immediate object death and no stale disposed transaction flush. Verify surviving owned item-set parent, original node/cursor/frame identities and actual mounted style/cell pool defaults without document model bridge; native physical frame filtering remains source-correct.
2. Require actual Istanbul100 lines/statements/functions/branches on complete hints.ts,calbck.ts,format.ts,writer-native-format-observer.ts; zero negative counters, current source hashes and identical complete maps for failed/new-only closure. No prior task/V8 counters, counter/map/location normalization, narrowed module lines or threshold changes. Retain any raw failures and fix exact failed behavior/fixtures before finish.
3. Run npm run format:check,lint,typecheck (nativeTS7),check:dependencies,test:static,check:docs,check:file-size upstream-absent and restore reference in finally. Then metadata-only inventory:registry:build/check,check:source-tree/provenance,writer resource generator --check,routing validator and ap doctor.
4. Prove old canonical8records value/responsibility/evidence prefixes, append-only parent Findings and unrelated source/scripts/docs/tests preserved; migrate only specifically conflicting native death event assertions. Bind semantic SHA, record verification and explicit same-agent non-independent quality, finish and prove clean git status. Last full XJTGF0 historical; correction4/10, next full after10resumed corrections.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf source/test and appended inventory evidence via a new task. Preserve immutable DONE artifacts, parent Findings history and registered I/O exceptions.

## Findings

Pinned9bc445578031fecf56086729d8e4940c77e14d65: calbck.cxx::ClientBase::CheckRegistration/SwModify destructor/SwClientNotify, hints.hxx::ObjectDyingHint, calbck.hxx::ModifyChangedHint, format.cxx::SwFormat::SwClientNotify ObjectDying branch. Current generic broadcaster callback skips original Writer death hint and leaves root-dependent item-set inheritance stale. Native wsfrm.cxx::SwFrame::SwClientNotify excludes ObjectDying, so no invented physical invalidation is added. Writer browser batching and callback-backed SwClient are bounded existing adaptations; linked iterator/assertion/cache/name/VCL families remain unverified. Previous goal turn made concrete progress: KCHP9M DONE semantic3bb966ac297c,314cases/scoped100; no blocker.
