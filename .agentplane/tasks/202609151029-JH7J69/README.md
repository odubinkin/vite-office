---
id: "202609151029-JH7J69"
title: "Implement LibreOffice parity Phase 1"
result_summary: "Implemented Phase 1 with stable WhichId item persistence, SfxRequest/SfxBindings dispatch, generated LibreOffice UI metadata, and end-to-end slot execution."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T10:29:38.222Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T11:22:06.867Z"
  updated_by: "CODER"
  note: "Phase 1 verified: full npm run verify passed; 305 office tests and 88 inventory tests at 100% coverage; 10 Playwright e2e tests passed; typecheck, lint, dependency, generated-resource, static, source-tree, provenance, invariant, parity, routing, and doctor checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T11:22:53.965Z"
  updated_by: "EVALUATOR"
  note: "Phase 1 upstream parity slice is complete and all declared verification passed."
  evaluated_sha: "b1d81176daa693d0cc7d8598e2c549b8136208b6"
  blueprint_digest: "f68e8007355ee16a1e68eba9d41297e7de76c7e635c7a2b1d925acf915a6dbca"
  evidence_refs:
    - ".agentplane/tasks/202609151029-JH7J69/README.md"
    - ".agentplane/tasks/202609151029-JH7J69/quality/20260915-112253965-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609151029-JH7J69/quality/20260915-112253965-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609151029-JH7J69/quality/20260915-112253965-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609151029-JH7J69/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json"
  findings:
    - "Stable WhichId item restoration, Sfx request/bindings dispatch, and generated Writer UI resources satisfy the approved Phase 1 scope."
commit:
  hash: "b1d81176daa693d0cc7d8598e2c549b8136208b6"
  message: "🧩 JH7J69 task: implement LibreOffice parity Phase 1"
comments:
  -
    author: "CODER"
    body: "Start: implement approved LibreOffice parity Phase 1 contracts and resources in the current direct-mode checkout."
  -
    author: "CODER"
    body: "Verified: Phase 1 upstream item, dispatch, bindings, slot, and generated Writer UI resource parity implemented; all declared checks passed."
events:
  -
    type: "status"
    at: "2026-09-15T10:29:43.721Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved LibreOffice parity Phase 1 contracts and resources in the current direct-mode checkout."
  -
    type: "verify"
    at: "2026-09-15T11:22:06.867Z"
    author: "CODER"
    state: "ok"
    note: "Phase 1 verified: full npm run verify passed; 305 office tests and 88 inventory tests at 100% coverage; 10 Playwright e2e tests passed; typecheck, lint, dependency, generated-resource, static, source-tree, provenance, invariant, parity, routing, and doctor checks passed."
  -
    type: "status"
    at: "2026-09-15T11:23:23.661Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Phase 1 upstream item, dispatch, bindings, slot, and generated Writer UI resource parity implemented; all declared checks passed."
doc_version: 3
doc_updated_at: "2026-09-15T11:23:23.663Z"
doc_updated_by: "CODER"
description: "Restore item contracts, Sfx slot/dispatch/bindings pipeline, pinned .uno command identities, and generated Writer UI resources per docs/program/vite-office-upstream-parity-plan.md Phase 1."
sections:
  Summary: "Implement Phase 1 of the upstream parity plan against pinned LibreOffice 26.8.0.2: exact item contracts, bounded Sfx slot/dispatch/bindings, canonical command identities, and deterministic Writer UI resource generation."
  Scope: "In scope: apps/office/src/{svl,editeng,framework,sw} item, dispatch, shell, uiconfig, accelerator, browser presentation and persistence modules required by Phase 1; Phase 1 tests; deterministic generator inputs/outputs under scripts and apps/office; parity capability/provenance records affected by the implemented contracts. Upstream authority: vendor/libreoffice-reference at commit 9bc445578031fecf56086729d8e4940c77e14d65. Out of scope: Phase 2+ document graph, list tree, lifecycle, editor projection, and general ODF redesign."
  Plan: "Implement the approved Phase 1 as one atomic CODER-owned contract migration, using pinned upstream files as authority, preserving upstream path responsibility where browser/TypeScript constraints allow, rejecting incompatible stored models, and validating the full supported Writer slice."
  Verify Steps: |-
    1. npm run test:coverage --workspace @vite-office/office
    2. npm run test:inventory:coverage
    3. npm run typecheck
    4. npm run lint
    5. npm run check:dependencies
    6. npm run check:source-tree
    7. npm run check:source-provenance
    8. npm run inventory:invariants
    9. npm run inventory:parity
    10. npm run test:e2e
    11. npm run test:static
    12. node .agentplane/policy/check-routing.mjs
    13. ap doctor
  Verification: |-
    Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before finish.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T11:22:06.867Z — VERIFY — ok

    By: CODER

    Note: Phase 1 verified: full npm run verify passed; 305 office tests and 88 inventory tests at 100% coverage; 10 Playwright e2e tests passed; typecheck, lint, dependency, generated-resource, static, source-tree, provenance, invariant, parity, routing, and doctor checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T10:29:43.721Z, excerpt_hash=sha256:eab4ed2bc12d1656baa60dfdcb907c2b11b745f7aead0755fb5c5559959b9cce

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151029-JH7J69/blueprint/resolved-snapshot.json
    - old_digest: f68e8007355ee16a1e68eba9d41297e7de76c7e635c7a2b1d925acf915a6dbca
    - current_digest: f68e8007355ee16a1e68eba9d41297e7de76c7e635c7a2b1d925acf915a6dbca
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609151029-JH7J69

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609151029-JH7J69
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and deterministic close commits. No old persistence compatibility will be retained; rollback restores the pre-Phase-1 schema and command contracts as a unit."
  Findings: "No material drift identified during planning."
id_source: "generated"
---
## Summary

Implement Phase 1 of the upstream parity plan against pinned LibreOffice 26.8.0.2: exact item contracts, bounded Sfx slot/dispatch/bindings, canonical command identities, and deterministic Writer UI resource generation.

## Scope

In scope: apps/office/src/{svl,editeng,framework,sw} item, dispatch, shell, uiconfig, accelerator, browser presentation and persistence modules required by Phase 1; Phase 1 tests; deterministic generator inputs/outputs under scripts and apps/office; parity capability/provenance records affected by the implemented contracts. Upstream authority: vendor/libreoffice-reference at commit 9bc445578031fecf56086729d8e4940c77e14d65. Out of scope: Phase 2+ document graph, list tree, lifecycle, editor projection, and general ODF redesign.

## Plan

Implement the approved Phase 1 as one atomic CODER-owned contract migration, using pinned upstream files as authority, preserving upstream path responsibility where browser/TypeScript constraints allow, rejecting incompatible stored models, and validating the full supported Writer slice.

## Verify Steps

1. npm run test:coverage --workspace @vite-office/office
2. npm run test:inventory:coverage
3. npm run typecheck
4. npm run lint
5. npm run check:dependencies
6. npm run check:source-tree
7. npm run check:source-provenance
8. npm run inventory:invariants
9. npm run inventory:parity
10. npm run test:e2e
11. npm run test:static
12. node .agentplane/policy/check-routing.mjs
13. ap doctor

## Verification

Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before finish.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T11:22:06.867Z — VERIFY — ok

By: CODER

Note: Phase 1 verified: full npm run verify passed; 305 office tests and 88 inventory tests at 100% coverage; 10 Playwright e2e tests passed; typecheck, lint, dependency, generated-resource, static, source-tree, provenance, invariant, parity, routing, and doctor checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T10:29:43.721Z, excerpt_hash=sha256:eab4ed2bc12d1656baa60dfdcb907c2b11b745f7aead0755fb5c5559959b9cce

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609151029-JH7J69/blueprint/resolved-snapshot.json
- old_digest: f68e8007355ee16a1e68eba9d41297e7de76c7e635c7a2b1d925acf915a6dbca
- current_digest: f68e8007355ee16a1e68eba9d41297e7de76c7e635c7a2b1d925acf915a6dbca
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609151029-JH7J69

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609151029-JH7J69
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and deterministic close commits. No old persistence compatibility will be retained; rollback restores the pre-Phase-1 schema and command contracts as a unit.

## Findings

No material drift identified during planning.
