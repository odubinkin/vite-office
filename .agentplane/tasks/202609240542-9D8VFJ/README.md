---
id: "202609240542-9D8VFJ"
title: "Restore document-owned Writer line numbering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202609240501-76PKPC"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T06:19:51.925Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T06:47:39.535Z"
  updated_by: "CODER"
  note: "verified-202609240542-9D8VFJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T06:47:27.798Z"
  updated_by: "EVALUATOR"
  note: "Pinned Writer line-number defaults, ownership, page-aware counting, ODF and snapshot round trips implemented and verified."
  evaluated_sha: "6de07b8b27db6a455daf4c62fe2fdd550790bec3"
  blueprint_digest: "65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8"
  evidence_refs:
    - ".agentplane/tasks/202609240542-9D8VFJ/README.md"
    - ".agentplane/tasks/202609240542-9D8VFJ/quality/20260924-064727798-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240542-9D8VFJ/quality/20260924-064727798-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240542-9D8VFJ/quality/20260924-064727798-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240542-9D8VFJ/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/inc/lineinfo.test.ts"
    - "apps/office/src/sw/source/core/text/txtfrm.test.ts"
    - "apps/office/src/sw/source/filter/xml/odt-line-numbering.test.ts"
  findings:
    - "Global number format is bounded to Arabic display; native character-style and fly-frame rendering remain outside the browser slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement document-owned Writer line numbering from pinned SwLineNumberInfo."
events:
  -
    type: "status"
    at: "2026-09-24T06:20:04.995Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement document-owned Writer line numbering from pinned SwLineNumberInfo."
  -
    type: "verify"
    at: "2026-09-24T06:47:21.851Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 458 office tests and 96 inventory tests at 100% coverage, 13 Playwright E2E tests, static build, source tree and provenance; scoped diff and clean patch check reviewed."
  -
    type: "verify"
    at: "2026-09-24T06:47:39.535Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609240542-9D8VFJ"
doc_version: 3
doc_updated_at: "2026-09-24T06:47:39.625Z"
doc_updated_by: "CODER"
description: "Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only"
sections:
  Summary: |-
    Restore document-owned Writer line numbering

    Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only
  Scope: "Stage 2b of the approved parity plan. Add document-owned SwLineNumberInfo in sw/inc and sw/source/core/doc with pinned defaults (paint false, count-by 5, divider-by 3, 5 mm gutter, left position, count blank lines true, count in flys false, restart each page false). Route supported toggle/state through shell and UI; retain RES_LINENUMBER paragraph participation and browser painting. Persist supported global line-number settings through ODT and document snapshots; verify undo and page restart on the currently supported layout projection. Keep recovery, autosave schedule/storage, browser save workflows, inventory machinery, and unsupported native structures untouched. No network."
  Plan: "1. Port the browser-relevant SwLineNumberInfo fields and pinned defaults from sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx into matching Writer model paths; make SwDoc own and mutate the value. 2. Route the Line Numbers dialog toggle and state through SwWrtShell/SwView, preserve RES_LINENUMBER paragraph flags and undo, and let React render the resulting state. 3. Import/export supported ODF line-numbering configuration and verify save/reopen; use source-derived tests for count-by, blank lines and page restart over the supported frame projection. 4. Update existing inventory/provenance data, run npm run verify, record review evidence and close."
  Verify Steps: "1. Compare every implemented SwLineNumberInfo field/default against pinned sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx; focused tests assert constructor, copy, document ownership and modified state. 2. Exercise shell toggle/state, paragraph RES_LINENUMBER participation, blank-line counting, every-fifth-line paint, supported page restart, and undo/redo; React must read document state without an independent showLineNumbers useState. 3. Round-trip supported ODF global line-numbering configuration and document snapshots; confirm new/reopened documents keep defaults and explicit settings. 4. Run npm run verify; inspect diff and status for task scope, with save/recovery/autosave unchanged; update parity/provenance records only where evidence supports them."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T06:47:21.851Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 458 office tests and 96 inventory tests at 100% coverage, 13 Playwright E2E tests, static build, source tree and provenance; scoped diff and clean patch check reviewed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:20:04.995Z, excerpt_hash=sha256:55d01d2ddd9efeb477358a0cf669c98f5c27559728e4b26cd04d56983363fd68

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240542-9D8VFJ/blueprint/resolved-snapshot.json
    - old_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
    - current_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240542-9D8VFJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240542-9D8VFJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T06:47:39.535Z — VERIFY — ok

    By: CODER

    Note: verified-202609240542-9D8VFJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:47:21.972Z, excerpt_hash=sha256:55d01d2ddd9efeb477358a0cf669c98f5c27559728e4b26cd04d56983363fd68

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240542-9D8VFJ/blueprint/resolved-snapshot.json
    - old_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
    - current_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240542-9D8VFJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609240542-9D8VFJ --result verified-202609240542-9D8VFJ --commit 6de07b8b27db6a455daf4c62fe2fdd550790bec3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Pinned source: sw/source/core/doc/lineinfo.cxx sets position 5 mm, count-by 5, divider-by 3, left position, paint=false, count-blank=true, count-in-flys=false and restart-each-page=false. Current React writer-view.tsx owns showLineNumbers useState(false); WriterPlainTextEditor.tsx computes numbers from measured lines. Existing paragraph RES_LINENUMBER boolean and text:number-lines ODF property are separate from global document configuration."
id_source: "generated"
---
## Summary

Restore document-owned Writer line numbering

Stage 2b: add pinned SwLineNumberInfo defaults and document-owned shell command state, paragraph count flags, page restarts, undo and supported ODT round trip; React reads and paints only

## Scope

Stage 2b of the approved parity plan. Add document-owned SwLineNumberInfo in sw/inc and sw/source/core/doc with pinned defaults (paint false, count-by 5, divider-by 3, 5 mm gutter, left position, count blank lines true, count in flys false, restart each page false). Route supported toggle/state through shell and UI; retain RES_LINENUMBER paragraph participation and browser painting. Persist supported global line-number settings through ODT and document snapshots; verify undo and page restart on the currently supported layout projection. Keep recovery, autosave schedule/storage, browser save workflows, inventory machinery, and unsupported native structures untouched. No network.

## Plan

1. Port the browser-relevant SwLineNumberInfo fields and pinned defaults from sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx into matching Writer model paths; make SwDoc own and mutate the value. 2. Route the Line Numbers dialog toggle and state through SwWrtShell/SwView, preserve RES_LINENUMBER paragraph flags and undo, and let React render the resulting state. 3. Import/export supported ODF line-numbering configuration and verify save/reopen; use source-derived tests for count-by, blank lines and page restart over the supported frame projection. 4. Update existing inventory/provenance data, run npm run verify, record review evidence and close.

## Verify Steps

1. Compare every implemented SwLineNumberInfo field/default against pinned sw/inc/lineinfo.hxx and sw/source/core/doc/lineinfo.cxx; focused tests assert constructor, copy, document ownership and modified state. 2. Exercise shell toggle/state, paragraph RES_LINENUMBER participation, blank-line counting, every-fifth-line paint, supported page restart, and undo/redo; React must read document state without an independent showLineNumbers useState. 3. Round-trip supported ODF global line-numbering configuration and document snapshots; confirm new/reopened documents keep defaults and explicit settings. 4. Run npm run verify; inspect diff and status for task scope, with save/recovery/autosave unchanged; update parity/provenance records only where evidence supports them.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T06:47:21.851Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 458 office tests and 96 inventory tests at 100% coverage, 13 Playwright E2E tests, static build, source tree and provenance; scoped diff and clean patch check reviewed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:20:04.995Z, excerpt_hash=sha256:55d01d2ddd9efeb477358a0cf669c98f5c27559728e4b26cd04d56983363fd68

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240542-9D8VFJ/blueprint/resolved-snapshot.json
- old_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
- current_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240542-9D8VFJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240542-9D8VFJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T06:47:39.535Z — VERIFY — ok

By: CODER

Note: verified-202609240542-9D8VFJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T06:47:21.972Z, excerpt_hash=sha256:55d01d2ddd9efeb477358a0cf669c98f5c27559728e4b26cd04d56983363fd68

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240542-9D8VFJ/blueprint/resolved-snapshot.json
- old_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
- current_digest: 65e0a885e101e8cc130782aef441c11bfbd712edc345754afc6f3b05d3082aa8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240542-9D8VFJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609240542-9D8VFJ --result verified-202609240542-9D8VFJ --commit 6de07b8b27db6a455daf4c62fe2fdd550790bec3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Pinned source: sw/source/core/doc/lineinfo.cxx sets position 5 mm, count-by 5, divider-by 3, left position, paint=false, count-blank=true, count-in-flys=false and restart-each-page=false. Current React writer-view.tsx owns showLineNumbers useState(false); WriterPlainTextEditor.tsx computes numbers from measured lines. Existing paragraph RES_LINENUMBER boolean and text:number-lines ODF property are separate from global document configuration.
