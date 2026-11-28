---
id: "202611280522-3TD5M8"
title: "Port native Calc ODS workbook structure protection"
result_summary: "Calc roundtrips native protected workbook structure and original ODS digests."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T05:22:46.853Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T05:32:55.796Z"
  updated_by: "CODER"
  note: "32 focused Calc tests passed, including all five original protection-key fixture cases, ODS, Worker, sheet state, and represented browser controls. Office typing, lint, formatting, module boundaries, source provenance and Calc parity inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T05:32:56.882Z"
  updated_by: "EVALUATOR"
  note: "Calc preserves native workbook structure protection across ODS and Worker transport."
  evaluated_sha: "30a3b85ab93c743277c318e8ef45f1aa99684e85"
  blueprint_digest: "6cf0b87458912691cb8ccbf642222af7f5c27966766adecaa8640e5118909ce9"
  evidence_refs:
    - ".agentplane/tasks/202611280522-3TD5M8/README.md"
    - ".agentplane/tasks/202611280522-3TD5M8/quality/20261128-053256882-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280522-3TD5M8/quality/20261128-053256882-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280522-3TD5M8/quality/20261128-053256882-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280522-3TD5M8/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/workbook-protection-verification.md"
  findings:
    - "The original verifier families and workbook-versus-sheet ownership are retained. All five source-backed protection fixtures roundtrip their expected digest."
commit:
  hash: "30a3b85ab93c743277c318e8ef45f1aa99684e85"
  message: "🧩 3TD5M8 calc: preserve native ODS workbook structure protection"
comments:
  -
    author: "CODER"
    body: "Start: preserve native workbook structure protection in Calc ODS and Worker transport."
  -
    author: "CODER"
    body: "Verified: 32 focused Calc tests and required static checks passed."
events:
  -
    type: "status"
    at: "2026-11-28T05:22:47.562Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native workbook structure protection in Calc ODS and Worker transport."
  -
    type: "verify"
    at: "2026-11-28T05:32:55.796Z"
    author: "CODER"
    state: "ok"
    note: "32 focused Calc tests passed, including all five original protection-key fixture cases, ODS, Worker, sheet state, and represented browser controls. Office typing, lint, formatting, module boundaries, source provenance and Calc parity inventory passed."
  -
    type: "status"
    at: "2026-11-28T05:34:31.283Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 32 focused Calc tests and required static checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T05:34:31.284Z"
doc_updated_by: "CODER"
description: "Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior."
sections:
  Summary: |-
    Port native Calc ODS workbook structure protection

    Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
  Scope: |-
    - In scope: Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS workbook structure protection".
  Plan: "Introduce the native ScDocProtection owner and document contract using the sheet protection implementation for shared verifier and option behavior. Adopt office:spreadsheet protection after sheets, preserve both second-digest namespaces and the native hash preference on export, and carry workbook protection through the Calc graph codec. Guard the existing browser insert sheet action where the upstream DocFunc guards document structure; keep the lower-level import APIs and the existing save and password-retype policy. Port all five original LibreOffice ODS protection-key cases using the exact original fixtures and run only related Calc protection, Worker, and sheet checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS workbook structure protection". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS workbook structure protection". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T05:32:55.796Z — VERIFY — ok

    By: CODER

    Note: 32 focused Calc tests passed, including all five original protection-key fixture cases, ODS, Worker, sheet state, and represented browser controls. Office typing, lint, formatting, module boundaries, source provenance and Calc parity inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T05:22:47.562Z, excerpt_hash=sha256:8377cf839cd97065a3888d21e82ea34bc6881910c25e9aa723352dff008ab189

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280522-3TD5M8/blueprint/resolved-snapshot.json
    - old_digest: 6cf0b87458912691cb8ccbf642222af7f5c27966766adecaa8640e5118909ce9
    - current_digest: 6cf0b87458912691cb8ccbf642222af7f5c27966766adecaa8640e5118909ce9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280522-3TD5M8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280522-3TD5M8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Port native Calc ODS workbook structure protection

Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.

## Scope

- In scope: Represent ScDocProtection alongside sheet protection using the original shared protection implementation, adopt the spreadsheet protection attributes after sheets in ODS, emit the native body attributes and digest selection, and retain owner state across the Calc Worker. Port the five original ODS digest cases and keep the existing browser save policy and sheet behavior.
- Out of scope: unrelated refactors not required for "Port native Calc ODS workbook structure protection".

## Plan

Introduce the native ScDocProtection owner and document contract using the sheet protection implementation for shared verifier and option behavior. Adopt office:spreadsheet protection after sheets, preserve both second-digest namespaces and the native hash preference on export, and carry workbook protection through the Calc graph codec. Guard the existing browser insert sheet action where the upstream DocFunc guards document structure; keep the lower-level import APIs and the existing save and password-retype policy. Port all five original LibreOffice ODS protection-key cases using the exact original fixtures and run only related Calc protection, Worker, and sheet checks.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS workbook structure protection". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS workbook structure protection". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T05:32:55.796Z — VERIFY — ok

By: CODER

Note: 32 focused Calc tests passed, including all five original protection-key fixture cases, ODS, Worker, sheet state, and represented browser controls. Office typing, lint, formatting, module boundaries, source provenance and Calc parity inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T05:22:47.562Z, excerpt_hash=sha256:8377cf839cd97065a3888d21e82ea34bc6881910c25e9aa723352dff008ab189

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280522-3TD5M8/blueprint/resolved-snapshot.json
- old_digest: 6cf0b87458912691cb8ccbf642222af7f5c27966766adecaa8640e5118909ce9
- current_digest: 6cf0b87458912691cb8ccbf642222af7f5c27966766adecaa8640e5118909ce9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280522-3TD5M8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280522-3TD5M8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
