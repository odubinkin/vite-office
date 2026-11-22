---
id: "202611220258-1P25CC"
title: "Connect Writer paragraph area color and transparency"
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
  updated_at: "2026-11-22T02:58:29.862Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T03:08:11.126Z"
  updated_by: "CODER"
  note: "60 focused Writer and 14 shared tests, 2 Writer resource tests, 1 Chromium scenario and production build passed. Scoped lint, formatting, dependency, source-tree, provenance, doctor and routing checks passed. Findings records unrelated Calc baseline failures in the global JSDoc and size gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T03:08:11.726Z"
  updated_by: "EVALUATOR"
  note: "Verified native Writer paragraph solid fill and uniform transparency through application, display, history, and persistence."
  evaluated_sha: "6ecd9edf9541627e07c35f277de854083905a4bb"
  blueprint_digest: "f9ca5cfc6fd7fcd0cf9f1d1e9c0e7546f835dac04b1a4f55ab6e778e62983ec1"
  evidence_refs:
    - ".agentplane/tasks/202611220258-1P25CC/README.md"
    - ".agentplane/tasks/202611220258-1P25CC/quality/20261122-030811726-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220258-1P25CC/quality/20261122-030811726-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220258-1P25CC/quality/20261122-030811726-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220258-1P25CC/blueprint/resolved-snapshot.json"
    - "6ecd9edf9541"
    - "apps/office/e2e/writer-paragraph-area.spec.ts"
  findings:
    - "Paragraph formatting exchanges pooled fill items independently and retains per-paragraph color when changing mixed transparency."
    - "Chromium verified visible 51 percent transparency, undo, redo and reopen through the ordinary Writer command."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: connect the native paragraph Area and uniform Transparency page exchanges in Writer."
events:
  -
    type: "status"
    at: "2026-11-22T02:58:48.538Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native paragraph Area and uniform Transparency page exchanges in Writer."
  -
    type: "verify"
    at: "2026-11-22T03:08:11.126Z"
    author: "CODER"
    state: "ok"
    note: "60 focused Writer and 14 shared tests, 2 Writer resource tests, 1 Chromium scenario and production build passed. Scoped lint, formatting, dependency, source-tree, provenance, doctor and routing checks passed. Findings records unrelated Calc baseline failures in the global JSDoc and size gates."
doc_version: 3
doc_updated_at: "2026-11-22T03:08:11.176Z"
doc_updated_by: "CODER"
description: "Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips."
sections:
  Summary: |-
    Connect Writer paragraph area color and transparency

    Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
  Scope: |-
    - In scope: Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
    - Out of scope: unrelated refactors not required for "Connect Writer paragraph area color and transparency".
  Plan: "Port the represented area/color and uniform transparency exchange using shared native fill items and source-owned CUI page handlers. Add the corresponding Writer paragraph pages after Borders. Keep independent values and unvisited pages untouched, inherit native paint, and bridge existing legacy paragraph brushes. Verify the ordinary Writer command and native document/ODT/Worker paths with focused tests according to the ten-task cadence."
  Verify Steps: "Run targeted Writer paragraph dialog, text/native fill transport, ODT and focused Chromium checks for Area and uniform Transparency. Verify per-field output, mixed selection, inherited values, preview, Undo/Redo, legacy color and transparent override. Run focused shared fill conversion tests, production build, formatting, scoped ESLint, module boundaries, source tree and provenance, Writer resources, doctor and routing. Run repository docs and file-size checks and record applicable baseline failures."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T03:08:11.126Z — VERIFY — ok

    By: CODER

    Note: 60 focused Writer and 14 shared tests, 2 Writer resource tests, 1 Chromium scenario and production build passed. Scoped lint, formatting, dependency, source-tree, provenance, doctor and routing checks passed. Findings records unrelated Calc baseline failures in the global JSDoc and size gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:07:58.498Z, excerpt_hash=sha256:5fa97c156a1233af630e725fa333e74693849227d1881542f63c02bba43ae4e8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220258-1P25CC/blueprint/resolved-snapshot.json
    - old_digest: f9ca5cfc6fd7fcd0cf9f1d1e9c0e7546f835dac04b1a4f55ab6e778e62983ec1
    - current_digest: f9ca5cfc6fd7fcd0cf9f1d1e9c0e7546f835dac04b1a4f55ab6e778e62983ec1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220258-1P25CC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220258-1P25CC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commits and rerun the targeted paragraph, ODT and shared fill conversion checks."
  Findings: |-
    - Connected the original Area and Transparency tabs to the native paragraph command and pooled fill deltas. None, solid color, and uniform transparency are the represented paragraph fill modes.
    - Verified mixed selections, inherited and legacy brush colors, cancellation, undo/redo, Worker transport, ODT reopening, and visible Chromium paint. The two focused suites passed 60 Writer tests and 14 shared tests. The independent Writer resource check passed its 2 tests. The production build and 1 focused Chromium scenario passed.
    - Scoped ESLint, Prettier, git diff check, module boundaries, source tree, source provenance, Writer resource checks, AgentPlane doctor, and policy routing passed.
    - Global JSDoc checking still reports 307 pre-existing Calc diagnostics. Global source-size checking still reports the pre-existing 1,001-line Calc document codec. The modified Writer source files meet the size gate. The full test suite is deferred to the user's ten-task checkpoint.
id_source: "generated"
---
## Summary

Connect Writer paragraph area color and transparency

Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.

## Scope

- In scope: Add the upstream Area and Transparency pages for paragraph fill values represented by the current Writer model. Exchange native NONE/SOLID, XFillColorItem and uniform XFillTransparenceItem through the existing dialog and history. Verify preview, mixed selections, legacy brush behavior, and ODT/Worker round trips.
- Out of scope: unrelated refactors not required for "Connect Writer paragraph area color and transparency".

## Plan

Port the represented area/color and uniform transparency exchange using shared native fill items and source-owned CUI page handlers. Add the corresponding Writer paragraph pages after Borders. Keep independent values and unvisited pages untouched, inherit native paint, and bridge existing legacy paragraph brushes. Verify the ordinary Writer command and native document/ODT/Worker paths with focused tests according to the ten-task cadence.

## Verify Steps

Run targeted Writer paragraph dialog, text/native fill transport, ODT and focused Chromium checks for Area and uniform Transparency. Verify per-field output, mixed selection, inherited values, preview, Undo/Redo, legacy color and transparent override. Run focused shared fill conversion tests, production build, formatting, scoped ESLint, module boundaries, source tree and provenance, Writer resources, doctor and routing. Run repository docs and file-size checks and record applicable baseline failures.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T03:08:11.126Z — VERIFY — ok

By: CODER

Note: 60 focused Writer and 14 shared tests, 2 Writer resource tests, 1 Chromium scenario and production build passed. Scoped lint, formatting, dependency, source-tree, provenance, doctor and routing checks passed. Findings records unrelated Calc baseline failures in the global JSDoc and size gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T03:07:58.498Z, excerpt_hash=sha256:5fa97c156a1233af630e725fa333e74693849227d1881542f63c02bba43ae4e8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220258-1P25CC/blueprint/resolved-snapshot.json
- old_digest: f9ca5cfc6fd7fcd0cf9f1d1e9c0e7546f835dac04b1a4f55ab6e778e62983ec1
- current_digest: f9ca5cfc6fd7fcd0cf9f1d1e9c0e7546f835dac04b1a4f55ab6e778e62983ec1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220258-1P25CC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220258-1P25CC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commits and rerun the targeted paragraph, ODT and shared fill conversion checks.

## Findings

- Connected the original Area and Transparency tabs to the native paragraph command and pooled fill deltas. None, solid color, and uniform transparency are the represented paragraph fill modes.
- Verified mixed selections, inherited and legacy brush colors, cancellation, undo/redo, Worker transport, ODT reopening, and visible Chromium paint. The two focused suites passed 60 Writer tests and 14 shared tests. The independent Writer resource check passed its 2 tests. The production build and 1 focused Chromium scenario passed.
- Scoped ESLint, Prettier, git diff check, module boundaries, source tree, source provenance, Writer resource checks, AgentPlane doctor, and policy routing passed.
- Global JSDoc checking still reports 307 pre-existing Calc diagnostics. Global source-size checking still reports the pre-existing 1,001-line Calc document codec. The modified Writer source files meet the size gate. The full test suite is deferred to the user's ten-task checkpoint.
