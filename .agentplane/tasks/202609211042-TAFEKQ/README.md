---
id: "202609211042-TAFEKQ"
title: "Implement Writer P0 upstream parity"
result_summary: "Closed as duplicate of 202609211043-DW2WAX."
risk_level: "low"
breaking: false
status: "DONE"
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
risk_flags:
  - "network"
  - "publish"
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T11:46:46.409Z"
  updated_by: "PLANNER"
  note: "Bookkeeping duplicate only; canonical implementation is tracked by 202609211043-DW2WAX."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T11:47:44.067Z"
  updated_by: "EVALUATOR"
  note: "Bookkeeping duplicate has no implementation scope."
  evaluated_sha: "f804fc44c0a48bbb9454887fa6523bfb1cb724f3"
  blueprint_digest: "3740346a30b7cab7d8eb2e78865072f39b5a8e13009bd7951d86e211504fd310"
  evidence_refs:
    - ".agentplane/tasks/202609211042-TAFEKQ/README.md"
    - ".agentplane/tasks/202609211042-TAFEKQ/quality/20260921-114744067-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211042-TAFEKQ/quality/20260921-114744067-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211042-TAFEKQ/quality/20260921-114744067-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211042-TAFEKQ/blueprint/resolved-snapshot.json"
  findings:
    - "Canonical work is owned by 202609211043-DW2WAX; this task records duplicate closure only."
commit:
  hash: "f804fc44c0a48bbb9454887fa6523bfb1cb724f3"
  message: "🚧 DW2WAX task: implement Writer P0 upstream parity"
comments:
  -
    author: "PLANNER"
    body: |-
      Verified: 202609211042-TAFEKQ is a bookkeeping duplicate of 202609211043-DW2WAX (Implement Writer P0 upstream parity); no code/config changes are expected in this task and closure is recorded as no-op.

      Reason: Replaced with code.direct task; git push is an approved post-verification delivery action, not a software release.
  -
    author: "PLANNER"
    body: "Verified: bookkeeping duplicate remains closed with no implementation changes."
events:
  -
    type: "status"
    at: "2026-09-21T10:43:19.438Z"
    author: "PLANNER"
    from: "TODO"
    to: "DONE"
    note: |-
      Verified: 202609211042-TAFEKQ is a bookkeeping duplicate of 202609211043-DW2WAX (Implement Writer P0 upstream parity); no code/config changes are expected in this task and closure is recorded as no-op.

      Reason: Replaced with code.direct task; git push is an approved post-verification delivery action, not a software release.
  -
    type: "verify"
    at: "2026-09-21T11:46:46.409Z"
    author: "PLANNER"
    state: "ok"
    note: "Bookkeeping duplicate only; canonical implementation is tracked by 202609211043-DW2WAX."
  -
    type: "status"
    at: "2026-09-21T11:47:57.465Z"
    author: "PLANNER"
    from: "DONE"
    to: "DONE"
    note: "Verified: bookkeeping duplicate remains closed with no implementation changes."
doc_version: 3
doc_updated_at: "2026-09-21T11:47:57.467Z"
doc_updated_by: "PLANNER"
description: "Implement P0-2 through P0-5 from docs/program/vite-office-upstream-parity-plan.md; retain the existing P0-1 inventory model while making its records detailed and correct; preserve pinned LibreOffice ownership, contracts, defaults, and file structure; do not support legacy persisted document schemas."
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
    ### 2026-09-21T11:46:46.409Z — VERIFY — ok

    By: PLANNER

    Note: Bookkeeping duplicate only; canonical implementation is tracked by 202609211043-DW2WAX.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T10:43:19.438Z, excerpt_hash=sha256:55dffaf213a5645523d218f72e61fd28bbf32376732da96715fa83d5bbb3d932

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211042-TAFEKQ/blueprint/resolved-snapshot.json
    - old_digest: 3740346a30b7cab7d8eb2e78865072f39b5a8e13009bd7951d86e211504fd310
    - current_digest: 3740346a30b7cab7d8eb2e78865072f39b5a8e13009bd7951d86e211504fd310
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211042-TAFEKQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609211042-TAFEKQ --close --unstage-others
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
### 2026-09-21T11:46:46.409Z — VERIFY — ok

By: PLANNER

Note: Bookkeeping duplicate only; canonical implementation is tracked by 202609211043-DW2WAX.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T10:43:19.438Z, excerpt_hash=sha256:55dffaf213a5645523d218f72e61fd28bbf32376732da96715fa83d5bbb3d932

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211042-TAFEKQ/blueprint/resolved-snapshot.json
- old_digest: 3740346a30b7cab7d8eb2e78865072f39b5a8e13009bd7951d86e211504fd310
- current_digest: 3740346a30b7cab7d8eb2e78865072f39b5a8e13009bd7951d86e211504fd310
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211042-TAFEKQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609211042-TAFEKQ --close --unstage-others
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
