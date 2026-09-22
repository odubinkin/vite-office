---
id: "202609220429-2D6Q9J"
title: "Add Writer font-size selector"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T04:30:13.675Z"
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
    body: "Start: implement the approved .uno:FontHeight command and compact Writer toolbar selector with native hint, undo, state, and ODT regression coverage."
events:
  -
    type: "status"
    at: "2026-09-22T04:30:22.270Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved .uno:FontHeight command and compact Writer toolbar selector with native hint, undo, state, and ODT regression coverage."
doc_version: 3
doc_updated_at: "2026-09-22T04:30:22.270Z"
doc_updated_by: "CODER"
description: "Expose the pinned .uno:FontHeight toolbar control and connect it through Writer command state, text-shell mutation, native hints, undo, and existing ODT font-size support."
sections:
  Summary: "Add a compact Writer font-size selector backed by the existing .uno:FontHeight resource and canonical character-size items."
  Scope: "In scope: generated toolbar adaptation, command ID/resource enablement, text-shell and Writer-shell font-size mutation/state, native run hints, React selector, and focused/full verification. Out of scope: Grow/Shrink commands, arbitrary unit entry, and other typography controls."
  Plan: "1. Enable .uno:FontHeight as a typed font-size toolbar placement. 2. Implement point-size command arguments, state, selection/pending-format mutation, undo, and script-synchronized SvxFontHeightItem hints. 3. Render a compact selector using command state, preserving nonstandard current values. 4. Add command, model, presentation, and ODT regression tests. 5. Run focused tests and npm run verify."
  Verify Steps: "1. Run focused Vitest suites for Writer text shell, command surfaces, toolbar presentation, run projection, undo, and ODT font-size round-trip; expect all pass. 2. Run npm run verify; expect formatting, lint, typecheck, dependency/resource checks, 100% unit and inventory coverage, Playwright, static build, docs, source-tree/provenance, invariants, and parity all pass. 3. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and inspect final git status; expect only intentional task artifacts before close."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and task evidence commits, then rerun focused tests and npm run verify."
  Findings: "Initial inspection found .uno:FontHeight in the pinned/generated toolbar data but classified as unsupported; existing ODT/model item support can carry absolute twip sizes once the command and UI path are added."
id_source: "generated"
---
## Summary

Add a compact Writer font-size selector backed by the existing .uno:FontHeight resource and canonical character-size items.

## Scope

In scope: generated toolbar adaptation, command ID/resource enablement, text-shell and Writer-shell font-size mutation/state, native run hints, React selector, and focused/full verification. Out of scope: Grow/Shrink commands, arbitrary unit entry, and other typography controls.

## Plan

1. Enable .uno:FontHeight as a typed font-size toolbar placement. 2. Implement point-size command arguments, state, selection/pending-format mutation, undo, and script-synchronized SvxFontHeightItem hints. 3. Render a compact selector using command state, preserving nonstandard current values. 4. Add command, model, presentation, and ODT regression tests. 5. Run focused tests and npm run verify.

## Verify Steps

1. Run focused Vitest suites for Writer text shell, command surfaces, toolbar presentation, run projection, undo, and ODT font-size round-trip; expect all pass. 2. Run npm run verify; expect formatting, lint, typecheck, dependency/resource checks, 100% unit and inventory coverage, Playwright, static build, docs, source-tree/provenance, invariants, and parity all pass. 3. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and inspect final git status; expect only intentional task artifacts before close.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and task evidence commits, then rerun focused tests and npm run verify.

## Findings

Initial inspection found .uno:FontHeight in the pinned/generated toolbar data but classified as unsupported; existing ODT/model item support can carry absolute twip sizes once the command and UI path are added.
