---
id: "202610051545-VAM4JC"
title: "Apply native list and follow-style defaults when splitting paragraphs"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "upstream"
  - "writer-ui"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T15:46:00.374Z"
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
    body: "Start: source-confirmed split list/style defaults under standing UI refactoring authorization."
events:
  -
    type: "status"
    at: "2026-10-05T15:46:02.161Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source-confirmed split list/style defaults under standing UI refactoring authorization."
doc_version: 3
doc_updated_at: "2026-10-05T15:46:02.161Z"
doc_updated_by: "CODER"
description: "Iteration154 source-confirmed core split defaults serving UI Enter; logical prefix/suffix list ownership, conditional follow style, source-independent history evidence."
sections:
  Summary: "Apply native logical split paragraph list/style defaults through core owners used by existing UI commands."
  Scope: "Iteration154 atomic represented paragraph split list/style defaults. Source ndtxt.cxx SplitContentNode and MakeNewTextNode establish same collection for an interior/start split, follow collection only at end (including empty paragraph), copying direct list level only for a self-follow outline collection with explicit list level. Logical prefix retains restart/count/direct values; logical suffix resets LIST_ISRESTART, LIST_RESTARTVALUE, LIST_ISCOUNTED and resets LIST_ID/LIST_LEVEL when no effective rule or outline status is lost. Clear hard outline numbering only when actual follow collection changes. Reuse existing ndtxt-format-change native numbering responsibility with CopyDirectListLevel and PrepareSplitTextNodeFormat; no React callback/DTO/TextRuns list reconstruction. Existing portable original-prefix/new-suffix physical identity remains explicitly unverified against native new-prefix/original-suffix. Native page/break/keep/split/auto-frame resets, full CutImpl, native undo-area and broader UI/table behavior remain unverified. Scope exactly five paths: ndtxt.ts,ndtxt-format-change.ts,new native-split-list-defaults.test.ts,source-provenance.json,runtime-inventory.json. New source-independent tests cover split positions, actual native attrs/collections/list record and numbering state, source conditional rule/outline guards, assigned heading levels and real shell Enter with repeated Undo/Redo. All405prior test files byte-identical; preserve250 semantic states/defaults/classifications/exceptions and all prior evidence, additive evidence for two existing owners only. No broad parity promotion. Six statics first, ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure and exact failures before assertions, failed/new-only closure, no passing replay. Restore vendor in finally before five source audits/scope/AP checks. Coverage maps only ignored appcache, AP bounded English prose/counts/hashes/outcomes/exact failures. No upstream copies/helpers/Python/probes/raw diagnostics in AP; no network/outside/global/subagents. Standing user UI/refactoring authorization applies."
  Plan: "Iteration154 atomic represented paragraph split list/style defaults. Source ndtxt.cxx SplitContentNode and MakeNewTextNode establish same collection for an interior/start split, follow collection only at end (including empty paragraph), copying direct list level only for a self-follow outline collection with explicit list level. Logical prefix retains restart/count/direct values; logical suffix resets LIST_ISRESTART, LIST_RESTARTVALUE, LIST_ISCOUNTED and resets LIST_ID/LIST_LEVEL when no effective rule or outline status is lost. Clear hard outline numbering only when actual follow collection changes. Reuse existing ndtxt-format-change native numbering responsibility with CopyDirectListLevel and PrepareSplitTextNodeFormat; no React callback/DTO/TextRuns list reconstruction. Existing portable original-prefix/new-suffix physical identity remains explicitly unverified against native new-prefix/original-suffix. Native page/break/keep/split/auto-frame resets, full CutImpl, native undo-area and broader UI/table behavior remain unverified. Scope exactly five paths: ndtxt.ts,ndtxt-format-change.ts,new native-split-list-defaults.test.ts,source-provenance.json,runtime-inventory.json. New source-independent tests cover split positions, actual native attrs/collections/list record and numbering state, source conditional rule/outline guards, assigned heading levels and real shell Enter with repeated Undo/Redo. All405prior test files byte-identical; preserve250 semantic states/defaults/classifications/exceptions and all prior evidence, additive evidence for two existing owners only. No broad parity promotion. Six statics first, ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure and exact failures before assertions, failed/new-only closure, no passing replay. Restore vendor in finally before five source audits/scope/AP checks. Coverage maps only ignored appcache, AP bounded English prose/counts/hashes/outcomes/exact failures. No upstream copies/helpers/Python/probes/raw diagnostics in AP; no network/outside/global/subagents. Standing user UI/refactoring authorization applies."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file remediation only, never repeat passing gates.
    2. ONE sequential absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor in repo with try/finally restore, no upstream access by tests. Persist exact failed/error names before assertions; skipped status is skipped. Repeat only failed gates/cases and genuinely new unexecuted cases. App/inventory L/S/F/B100% actual counters.
    3. New native tests prove prefix restart/not-counted values retained, suffix defaults restored, conditional list identity/level resets, mid/start same style versus end follow style, hard outline rule removal and CopyDirectListLevel guards, heading style assigned level and real shell Enter repeated Undo/Redo native list labels.405prior tests unchanged,250semantic states/defaults/exceptions/prior evidence preserved. Five scoped files, additive source evidence two existing owners, physical node identity/page/break/frame/full CutImpl/native undo-area/broad UI/table behavior explicitly unverified.
    4. Vendor restored before resources --check, source-tree, source-provenance, inventory invariants/parity. Scope/AP forbidden artifact audit; exact semantic SHA same-agent EVALUATOR review; recorded verification/canonical finish/parent checkpoint and clean tracked main; broad goal active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the scoped semantic implementation commit and record follow-up through a new task; no history rewrite."
  Findings: "Pinned source inspected read-only within repository. Native source creates new prefix/original suffix; portable original-prefix identity remains unverified. Registered save/open/recovery deviations preserved. Standing user authorization covers safe local implementation."
id_source: "generated"
---
## Summary

Apply native logical split paragraph list/style defaults through core owners used by existing UI commands.

## Scope

Iteration154 atomic represented paragraph split list/style defaults. Source ndtxt.cxx SplitContentNode and MakeNewTextNode establish same collection for an interior/start split, follow collection only at end (including empty paragraph), copying direct list level only for a self-follow outline collection with explicit list level. Logical prefix retains restart/count/direct values; logical suffix resets LIST_ISRESTART, LIST_RESTARTVALUE, LIST_ISCOUNTED and resets LIST_ID/LIST_LEVEL when no effective rule or outline status is lost. Clear hard outline numbering only when actual follow collection changes. Reuse existing ndtxt-format-change native numbering responsibility with CopyDirectListLevel and PrepareSplitTextNodeFormat; no React callback/DTO/TextRuns list reconstruction. Existing portable original-prefix/new-suffix physical identity remains explicitly unverified against native new-prefix/original-suffix. Native page/break/keep/split/auto-frame resets, full CutImpl, native undo-area and broader UI/table behavior remain unverified. Scope exactly five paths: ndtxt.ts,ndtxt-format-change.ts,new native-split-list-defaults.test.ts,source-provenance.json,runtime-inventory.json. New source-independent tests cover split positions, actual native attrs/collections/list record and numbering state, source conditional rule/outline guards, assigned heading levels and real shell Enter with repeated Undo/Redo. All405prior test files byte-identical; preserve250 semantic states/defaults/classifications/exceptions and all prior evidence, additive evidence for two existing owners only. No broad parity promotion. Six statics first, ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure and exact failures before assertions, failed/new-only closure, no passing replay. Restore vendor in finally before five source audits/scope/AP checks. Coverage maps only ignored appcache, AP bounded English prose/counts/hashes/outcomes/exact failures. No upstream copies/helpers/Python/probes/raw diagnostics in AP; no network/outside/global/subagents. Standing user UI/refactoring authorization applies.

## Plan

Iteration154 atomic represented paragraph split list/style defaults. Source ndtxt.cxx SplitContentNode and MakeNewTextNode establish same collection for an interior/start split, follow collection only at end (including empty paragraph), copying direct list level only for a self-follow outline collection with explicit list level. Logical prefix retains restart/count/direct values; logical suffix resets LIST_ISRESTART, LIST_RESTARTVALUE, LIST_ISCOUNTED and resets LIST_ID/LIST_LEVEL when no effective rule or outline status is lost. Clear hard outline numbering only when actual follow collection changes. Reuse existing ndtxt-format-change native numbering responsibility with CopyDirectListLevel and PrepareSplitTextNodeFormat; no React callback/DTO/TextRuns list reconstruction. Existing portable original-prefix/new-suffix physical identity remains explicitly unverified against native new-prefix/original-suffix. Native page/break/keep/split/auto-frame resets, full CutImpl, native undo-area and broader UI/table behavior remain unverified. Scope exactly five paths: ndtxt.ts,ndtxt-format-change.ts,new native-split-list-defaults.test.ts,source-provenance.json,runtime-inventory.json. New source-independent tests cover split positions, actual native attrs/collections/list record and numbering state, source conditional rule/outline guards, assigned heading levels and real shell Enter with repeated Undo/Redo. All405prior test files byte-identical; preserve250 semantic states/defaults/classifications/exceptions and all prior evidence, additive evidence for two existing owners only. No broad parity promotion. Six statics first, ONE sequential upstream-absent build/app/inventory/scripts/Chromium profile with coverage.reportOnFailure and exact failures before assertions, failed/new-only closure, no passing replay. Restore vendor in finally before five source audits/scope/AP checks. Coverage maps only ignored appcache, AP bounded English prose/counts/hashes/outcomes/exact failures. No upstream copies/helpers/Python/probes/raw diagnostics in AP; no network/outside/global/subagents. Standing user UI/refactoring authorization applies.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file remediation only, never repeat passing gates.
2. ONE sequential absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor in repo with try/finally restore, no upstream access by tests. Persist exact failed/error names before assertions; skipped status is skipped. Repeat only failed gates/cases and genuinely new unexecuted cases. App/inventory L/S/F/B100% actual counters.
3. New native tests prove prefix restart/not-counted values retained, suffix defaults restored, conditional list identity/level resets, mid/start same style versus end follow style, hard outline rule removal and CopyDirectListLevel guards, heading style assigned level and real shell Enter repeated Undo/Redo native list labels.405prior tests unchanged,250semantic states/defaults/exceptions/prior evidence preserved. Five scoped files, additive source evidence two existing owners, physical node identity/page/break/frame/full CutImpl/native undo-area/broad UI/table behavior explicitly unverified.
4. Vendor restored before resources --check, source-tree, source-provenance, inventory invariants/parity. Scope/AP forbidden artifact audit; exact semantic SHA same-agent EVALUATOR review; recorded verification/canonical finish/parent checkpoint and clean tracked main; broad goal active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the scoped semantic implementation commit and record follow-up through a new task; no history rewrite.

## Findings

Pinned source inspected read-only within repository. Native source creates new prefix/original suffix; portable original-prefix identity remains unverified. Registered save/open/recovery deviations preserved. Standing user authorization covers safe local implementation.
