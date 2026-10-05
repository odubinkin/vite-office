---
id: "202610051618-SK8V77"
title: "Restore native text attribute history for paragraph split Undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "upstream"
  - "writer-ui"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T16:19:09.983Z"
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
    body: "Start: native conditional split attribute history and provisional redo state under standing UI refactoring authorization."
events:
  -
    type: "status"
    at: "2026-10-05T16:19:11.814Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native conditional split attribute history and provisional redo state under standing UI refactoring authorization."
doc_version: 3
doc_updated_at: "2026-10-05T16:19:11.814Z"
doc_updated_by: "CODER"
description: "Iteration155 native conditional SwHistory capture/rollback/rearm and provisional redo native state ownership; removes obsolete fragment snapshot comparison."
sections:
  Summary: "Restore native represented SwUndoSplitNode ranged attribute history and actual redo state, removing obsolete fragment snapshot comparison."
  Scope: "Iteration155 native represented SwUndoSplitNode text-attribute history lifecycle. Native unspnd.cxx constructor conditionally copies original whole-node ranged attributes via SwHistory.CopyAttr(...,false), drops empty history; Undo after JoinNext resets whole represented ranged attributes with existing native txtedt responsibility and TmpRollback(doc,0,false), Redo rearms SetTmpEnd(Count), destructor drops history. Reuse SwHistory and resetParagraphTextAttributes; no direct paragraph/list snapshot, because native split action stores text history only and CopyDirectListLevel/JoinNext do not promise restoration of every prior direct list level. Add real native AUTO/INET histories with original ranges/metadata, constructor-default restoration flags and retained format-ignore flags, repeated Undo/Redo actual ownership/backlinks/maps, zero/absent hints, payload scaling and destruction, real shell/UI command consumption. Source-confirmed integration refinement in existing RestoreSplitTextNode: remove two captured-fragment snapshots and complete hint-equality adapter; retain old text mismatch/foreign/connected ownership guards. Refresh retained paragraph direct native items, collection (without reassignment of list depth) and actual native hint maps from fresh provisional core split before existing native node replacement. Required because native reconstructed history changes flags legitimately. No TextRuns/DTO projection or new wrapper. Portable retained paragraph identity is necessary for existing pointer-based undo callers but remains unverified against native fresh redo nodes; not promoted as conscious exception. Scope five paths:unspnd.ts,DocumentContentOperationsManager.ts,new native-split-history.test.ts,source-provenance.json,runtime-inventory.json.407prior test files unchanged,250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive evidence2existing owners only. Native physical split identity/full CutImpl/paragraph copy/direct item and full heading/list history/table/redline/RSID/fields/Repeat contracts remain unverified. Six statics first; ONE full absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure, exact failed names before assertions and actual skipped status. Only failed/new cases/gates repeated, no passing replay. Vendor rename within repo with finally restore before five source audits/scope/AP scans.100%actual app/inventory L/S/F/B; maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/probes/raw diffs/diagnostics, no network/outside/global/subagents. Standing user UI/refactoring authorization applies."
  Plan: "Iteration155 native represented SwUndoSplitNode text-attribute history lifecycle. Native unspnd.cxx constructor conditionally copies original whole-node ranged attributes via SwHistory.CopyAttr(...,false), drops empty history; Undo after JoinNext resets whole represented ranged attributes with existing native txtedt responsibility and TmpRollback(doc,0,false), Redo rearms SetTmpEnd(Count), destructor drops history. Reuse SwHistory and resetParagraphTextAttributes; no direct paragraph/list snapshot, because native split action stores text history only and CopyDirectListLevel/JoinNext do not promise restoration of every prior direct list level. Add real native AUTO/INET histories with original ranges/metadata, constructor-default restoration flags and retained format-ignore flags, repeated Undo/Redo actual ownership/backlinks/maps, zero/absent hints, payload scaling and destruction, real shell/UI command consumption. Source-confirmed integration refinement in existing RestoreSplitTextNode: remove two captured-fragment snapshots and complete hint-equality adapter; retain old text mismatch/foreign/connected ownership guards. Refresh retained paragraph direct native items, collection (without reassignment of list depth) and actual native hint maps from fresh provisional core split before existing native node replacement. Required because native reconstructed history changes flags legitimately. No TextRuns/DTO projection or new wrapper. Portable retained paragraph identity is necessary for existing pointer-based undo callers but remains unverified against native fresh redo nodes; not promoted as conscious exception. Scope five paths:unspnd.ts,DocumentContentOperationsManager.ts,new native-split-history.test.ts,source-provenance.json,runtime-inventory.json.407prior test files unchanged,250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive evidence2existing owners only. Native physical split identity/full CutImpl/paragraph copy/direct item and full heading/list history/table/redline/RSID/fields/Repeat contracts remain unverified. Six statics first; ONE full absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure, exact failed names before assertions and actual skipped status. Only failed/new cases/gates repeated, no passing replay. Vendor rename within repo with finally restore before five source audits/scope/AP scans.100%actual app/inventory L/S/F/B; maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/probes/raw diffs/diagnostics, no network/outside/global/subagents. Standing user UI/refactoring authorization applies."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file remediation only after failures, no passing gates replay.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor within repository with try/finally restore. Tests never access/invoke upstream. Exact failed/error names persisted before assertions, skipped recorded as skipped. Repeat only failed gates/cases and genuinely new unexecuted cases. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
    3. New source-independent native split history tests prove conditional history allocation and empty discard, whole-node CopyAttr false field policy, original-range/metadata restoration with native constructor flags and retained format-ignore flags, forward temporary rollback/rearm across repeated cycles, actual AUTO/INET maps/backlinks/item handles, payload scales with hints not text, destructor and actual shell commands. Provisional redo native state refresh replaces obsolete captured-fragment equality without DTOs; foreign/connected/text guards and all407prior files unchanged.250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive2existing owners only. Physical native identity and broad list/table/direct paragraph ownership remain unverified.
    4. After vendor restored: resource generation --check; source-tree; source-provenance; inventory invariants/parity. Scoped diff/prior tests/defaults/AP forbidden artifacts audit; exact semantic SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint and clean tracked main; broad goal active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only scoped semantic implementation commit in a new task; no history rewrite."
  Findings: "Native source inspected read-only. Constructor captures ranged SwHistory only, not blanket paragraph/list attributes. Native resets and forward temporary rollback followed by Redo rearm are missing in current implementation. Portable retained redo node is still needed for existing pointer-based action references, physical identity parity remains unverified. Standing user safe UI/refactoring authorization applies."
id_source: "generated"
---
## Summary

Restore native represented SwUndoSplitNode ranged attribute history and actual redo state, removing obsolete fragment snapshot comparison.

## Scope

Iteration155 native represented SwUndoSplitNode text-attribute history lifecycle. Native unspnd.cxx constructor conditionally copies original whole-node ranged attributes via SwHistory.CopyAttr(...,false), drops empty history; Undo after JoinNext resets whole represented ranged attributes with existing native txtedt responsibility and TmpRollback(doc,0,false), Redo rearms SetTmpEnd(Count), destructor drops history. Reuse SwHistory and resetParagraphTextAttributes; no direct paragraph/list snapshot, because native split action stores text history only and CopyDirectListLevel/JoinNext do not promise restoration of every prior direct list level. Add real native AUTO/INET histories with original ranges/metadata, constructor-default restoration flags and retained format-ignore flags, repeated Undo/Redo actual ownership/backlinks/maps, zero/absent hints, payload scaling and destruction, real shell/UI command consumption. Source-confirmed integration refinement in existing RestoreSplitTextNode: remove two captured-fragment snapshots and complete hint-equality adapter; retain old text mismatch/foreign/connected ownership guards. Refresh retained paragraph direct native items, collection (without reassignment of list depth) and actual native hint maps from fresh provisional core split before existing native node replacement. Required because native reconstructed history changes flags legitimately. No TextRuns/DTO projection or new wrapper. Portable retained paragraph identity is necessary for existing pointer-based undo callers but remains unverified against native fresh redo nodes; not promoted as conscious exception. Scope five paths:unspnd.ts,DocumentContentOperationsManager.ts,new native-split-history.test.ts,source-provenance.json,runtime-inventory.json.407prior test files unchanged,250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive evidence2existing owners only. Native physical split identity/full CutImpl/paragraph copy/direct item and full heading/list history/table/redline/RSID/fields/Repeat contracts remain unverified. Six statics first; ONE full absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure, exact failed names before assertions and actual skipped status. Only failed/new cases/gates repeated, no passing replay. Vendor rename within repo with finally restore before five source audits/scope/AP scans.100%actual app/inventory L/S/F/B; maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/probes/raw diffs/diagnostics, no network/outside/global/subagents. Standing user UI/refactoring authorization applies.

## Plan

Iteration155 native represented SwUndoSplitNode text-attribute history lifecycle. Native unspnd.cxx constructor conditionally copies original whole-node ranged attributes via SwHistory.CopyAttr(...,false), drops empty history; Undo after JoinNext resets whole represented ranged attributes with existing native txtedt responsibility and TmpRollback(doc,0,false), Redo rearms SetTmpEnd(Count), destructor drops history. Reuse SwHistory and resetParagraphTextAttributes; no direct paragraph/list snapshot, because native split action stores text history only and CopyDirectListLevel/JoinNext do not promise restoration of every prior direct list level. Add real native AUTO/INET histories with original ranges/metadata, constructor-default restoration flags and retained format-ignore flags, repeated Undo/Redo actual ownership/backlinks/maps, zero/absent hints, payload scaling and destruction, real shell/UI command consumption. Source-confirmed integration refinement in existing RestoreSplitTextNode: remove two captured-fragment snapshots and complete hint-equality adapter; retain old text mismatch/foreign/connected ownership guards. Refresh retained paragraph direct native items, collection (without reassignment of list depth) and actual native hint maps from fresh provisional core split before existing native node replacement. Required because native reconstructed history changes flags legitimately. No TextRuns/DTO projection or new wrapper. Portable retained paragraph identity is necessary for existing pointer-based undo callers but remains unverified against native fresh redo nodes; not promoted as conscious exception. Scope five paths:unspnd.ts,DocumentContentOperationsManager.ts,new native-split-history.test.ts,source-provenance.json,runtime-inventory.json.407prior test files unchanged,250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive evidence2existing owners only. Native physical split identity/full CutImpl/paragraph copy/direct item and full heading/list history/table/redline/RSID/fields/Repeat contracts remain unverified. Six statics first; ONE full absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure, exact failed names before assertions and actual skipped status. Only failed/new cases/gates repeated, no passing replay. Vendor rename within repo with finally restore before five source audits/scope/AP scans.100%actual app/inventory L/S/F/B; maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/probes/raw diffs/diagnostics, no network/outside/global/subagents. Standing user UI/refactoring authorization applies.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file remediation only after failures, no passing gates replay.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor within repository with try/finally restore. Tests never access/invoke upstream. Exact failed/error names persisted before assertions, skipped recorded as skipped. Repeat only failed gates/cases and genuinely new unexecuted cases. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
3. New source-independent native split history tests prove conditional history allocation and empty discard, whole-node CopyAttr false field policy, original-range/metadata restoration with native constructor flags and retained format-ignore flags, forward temporary rollback/rearm across repeated cycles, actual AUTO/INET maps/backlinks/item handles, payload scales with hints not text, destructor and actual shell commands. Provisional redo native state refresh replaces obsolete captured-fragment equality without DTOs; foreign/connected/text guards and all407prior files unchanged.250semantic states/defaults/classifications/exceptions/prior evidence preserved, additive2existing owners only. Physical native identity and broad list/table/direct paragraph ownership remain unverified.
4. After vendor restored: resource generation --check; source-tree; source-provenance; inventory invariants/parity. Scoped diff/prior tests/defaults/AP forbidden artifacts audit; exact semantic SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint and clean tracked main; broad goal active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only scoped semantic implementation commit in a new task; no history rewrite.

## Findings

Native source inspected read-only. Constructor captures ranged SwHistory only, not blanket paragraph/list attributes. Native resets and forward temporary rollback followed by Redo rearm are missing in current implementation. Portable retained redo node is still needed for existing pointer-based action references, physical identity parity remains unverified. Standing user safe UI/refactoring authorization applies.
