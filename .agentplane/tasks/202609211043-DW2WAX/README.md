---
id: "202609211043-DW2WAX"
title: "Implement Writer P0 upstream parity"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run typecheck"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T10:43:50.058Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T11:48:27.076Z"
  updated_by: "CODER"
  note: "Full npm run verify passed: 347 unit tests and 95 inventory tests at 100% coverage, 11 E2E tests, static build, source provenance, inventory invariants/parity, lint, typecheck, and documentation checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T11:48:32.310Z"
  updated_by: "EVALUATOR"
  note: "Writer P0 ownership, canonical model, browser boundary, style defaults, and detailed inventory are implemented and fully verified."
  evaluated_sha: null
  blueprint_digest: "e959a8060a700225954f7581eb4ada96732a9009a9f1f8a2959c91f84c2f930a"
  evidence_refs:
    - ".agentplane/tasks/202609211043-DW2WAX/README.md"
    - ".agentplane/tasks/202609211043-DW2WAX/quality/20260921-114832310-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211043-DW2WAX/quality/20260921-114832310-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211043-DW2WAX/quality/20260921-114832310-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211043-DW2WAX/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "No blocking defects remain; stored document schema intentionally advances to v11 without legacy compatibility."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Writer P0 parity scope from pinned LibreOffice, preserving the current inventory model and validating all architectural boundaries."
events:
  -
    type: "status"
    at: "2026-09-21T10:43:56.968Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer P0 parity scope from pinned LibreOffice, preserving the current inventory model and validating all architectural boundaries."
  -
    type: "verify"
    at: "2026-09-21T11:48:27.076Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify passed: 347 unit tests and 95 inventory tests at 100% coverage, 11 E2E tests, static build, source provenance, inventory invariants/parity, lint, typecheck, and documentation checks."
doc_version: 3
doc_updated_at: "2026-09-21T11:48:27.158Z"
doc_updated_by: "CODER"
description: "Implement P0-2 through P0-5 from docs/program/vite-office-upstream-parity-plan.md; retain the existing P0-1 inventory model while making records detailed and correct; preserve pinned LibreOffice ownership, contracts, defaults, and file structure; do not support legacy persisted document schemas."
sections:
  Summary: "Implement the supported Writer P0 parity slice against pinned LibreOffice 26.8.0.2: restore Sfx ownership, canonical Writer positions and text attributes, source-derived paragraph-style defaults, and truthful detailed inventory records without changing the inventory model."
  Scope: "In scope: P0-2 through P0-5 in docs/program/vite-office-upstream-parity-plan.md; existing P0-1 inventory schema and behavior remain fixed while records and evidence are corrected. Primary paths: apps/office/src/{sfx2,framework,sw,editeng,svl}, related scripts and docs/program/parity data, and focused tests. No compatibility layer for older stored document models. Out of scope: P1/P2, unimplemented office modules, broad inventory redesign, and unrelated UI features."
  Plan: "1. Move Sfx dispatcher, shell, slot and view-frame ownership into upstream-shaped sfx2 modules; retain a framework provider facade. 2. Replace shell-facing paragraph IDs and browser input strings with SwPosition/SwPaM and Writer operations; translate DOM concerns in sw/browser/editor. 3. Make text plus SwpHints/SwTextAttr/SfxItemSet canonical and keep runs as derived boundary projections. 4. Port source-derived defaults and inheritance for implemented paragraph styles and remove semantic style-by-slug CSS. 5. Correct inventory/provenance records within the existing schema. 6. Add focused contract, mutation, projection, style-default, architecture, and inventory tests. 7. Run the full declared verification suite, commit, record Agentplane verification, finish, and push origin/main."
  Verify Steps: |-
    1. Run `npm run typecheck`; all TypeScript projects must pass after the ownership and model changes.
    2. Run `npm run lint`; no lint or JSDoc violations may remain.
    3. Run focused Vitest suites for Sfx dispatch/bindings/view frame, Writer selection/input translation, hints/run projection, and style defaults; tests must cover shell priority, disabled slots, request arguments, SwPosition/SwPaM conversion, browser-boundary termination, derived runs, inheritance, Western/CJK/CTL defaults, and UI projection.
    4. Run `npm run test:coverage` and `npm run test:inventory:coverage`; both coverage gates must pass.
    5. Run `npm run check:dependencies`, `npm run check:source-tree`, and `npm run check:source-provenance`; framework/Sfx and browser/Writer ownership rules and pinned-source mappings must pass.
    6. Run `npm run inventory:parity`; existing inventory schema must validate and detailed records must not overclaim unsupported behavior.
    7. Run `npm run test:e2e`; supported Writer editing, selection, formatting, lists, hyperlinks, clipboard, and ODT behavior must remain intact.
    8. Run `npm run verify`; the complete repository verification pipeline must pass.
    9. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`; Agentplane health and routing policy must pass.
    10. Inspect `git diff`, the pinned upstream anchors, and final `git status --short --untracked-files=all`; only intentional task files may remain and no secret or generated junk may be committed.
  Verification: |-
    Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before task closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T11:48:27.076Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify passed: 347 unit tests and 95 inventory tests at 100% coverage, 11 E2E tests, static build, source provenance, inventory invariants/parity, lint, typecheck, and documentation checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T10:43:56.968Z, excerpt_hash=sha256:55dffaf213a5645523d218f72e61fd28bbf32376732da96715fa83d5bbb3d932

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211043-DW2WAX/blueprint/resolved-snapshot.json
    - old_digest: e959a8060a700225954f7581eb4ada96732a9009a9f1f8a2959c91f84c2f930a
    - current_digest: e959a8060a700225954f7581eb4ada96732a9009a9f1f8a2959c91f84c2f930a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211043-DW2WAX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211043-DW2WAX
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and deterministic Agentplane close commits. The change deliberately provides no compatibility migration for prior stored document schema versions."
  Findings: "No implementation findings yet. Material expansion into P1/P2, more than the approved architectural surface, or a changed verification contract requires re-approval."
id_source: "generated"
---
## Summary

Implement the supported Writer P0 parity slice against pinned LibreOffice 26.8.0.2: restore Sfx ownership, canonical Writer positions and text attributes, source-derived paragraph-style defaults, and truthful detailed inventory records without changing the inventory model.

## Scope

In scope: P0-2 through P0-5 in docs/program/vite-office-upstream-parity-plan.md; existing P0-1 inventory schema and behavior remain fixed while records and evidence are corrected. Primary paths: apps/office/src/{sfx2,framework,sw,editeng,svl}, related scripts and docs/program/parity data, and focused tests. No compatibility layer for older stored document models. Out of scope: P1/P2, unimplemented office modules, broad inventory redesign, and unrelated UI features.

## Plan

1. Move Sfx dispatcher, shell, slot and view-frame ownership into upstream-shaped sfx2 modules; retain a framework provider facade. 2. Replace shell-facing paragraph IDs and browser input strings with SwPosition/SwPaM and Writer operations; translate DOM concerns in sw/browser/editor. 3. Make text plus SwpHints/SwTextAttr/SfxItemSet canonical and keep runs as derived boundary projections. 4. Port source-derived defaults and inheritance for implemented paragraph styles and remove semantic style-by-slug CSS. 5. Correct inventory/provenance records within the existing schema. 6. Add focused contract, mutation, projection, style-default, architecture, and inventory tests. 7. Run the full declared verification suite, commit, record Agentplane verification, finish, and push origin/main.

## Verify Steps

1. Run `npm run typecheck`; all TypeScript projects must pass after the ownership and model changes.
2. Run `npm run lint`; no lint or JSDoc violations may remain.
3. Run focused Vitest suites for Sfx dispatch/bindings/view frame, Writer selection/input translation, hints/run projection, and style defaults; tests must cover shell priority, disabled slots, request arguments, SwPosition/SwPaM conversion, browser-boundary termination, derived runs, inheritance, Western/CJK/CTL defaults, and UI projection.
4. Run `npm run test:coverage` and `npm run test:inventory:coverage`; both coverage gates must pass.
5. Run `npm run check:dependencies`, `npm run check:source-tree`, and `npm run check:source-provenance`; framework/Sfx and browser/Writer ownership rules and pinned-source mappings must pass.
6. Run `npm run inventory:parity`; existing inventory schema must validate and detailed records must not overclaim unsupported behavior.
7. Run `npm run test:e2e`; supported Writer editing, selection, formatting, lists, hyperlinks, clipboard, and ODT behavior must remain intact.
8. Run `npm run verify`; the complete repository verification pipeline must pass.
9. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`; Agentplane health and routing policy must pass.
10. Inspect `git diff`, the pinned upstream anchors, and final `git status --short --untracked-files=all`; only intentional task files may remain and no secret or generated junk may be committed.

## Verification

Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before task closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T11:48:27.076Z — VERIFY — ok

By: CODER

Note: Full npm run verify passed: 347 unit tests and 95 inventory tests at 100% coverage, 11 E2E tests, static build, source provenance, inventory invariants/parity, lint, typecheck, and documentation checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T10:43:56.968Z, excerpt_hash=sha256:55dffaf213a5645523d218f72e61fd28bbf32376732da96715fa83d5bbb3d932

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211043-DW2WAX/blueprint/resolved-snapshot.json
- old_digest: e959a8060a700225954f7581eb4ada96732a9009a9f1f8a2959c91f84c2f930a
- current_digest: e959a8060a700225954f7581eb4ada96732a9009a9f1f8a2959c91f84c2f930a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211043-DW2WAX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211043-DW2WAX
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and deterministic Agentplane close commits. The change deliberately provides no compatibility migration for prior stored document schema versions.

## Findings

No implementation findings yet. Material expansion into P1/P2, more than the approved architectural surface, or a changed verification contract requires re-approval.
