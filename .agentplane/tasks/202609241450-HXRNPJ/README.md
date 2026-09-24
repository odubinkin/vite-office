---
id: "202609241450-HXRNPJ"
title: "Plan certification ODT import support"
result_summary: "verified-202609241450-HXRNPJ"
status: "DONE"
priority: "med"
owner: "DOCS"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T14:55:54.014Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T15:00:51.403Z"
  updated_by: "CODER"
  note: "verified-202609241450-HXRNPJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T15:00:34.069Z"
  updated_by: "EVALUATOR"
  note: "The documentation plan matches the supplied ODT inventory, orders work by complexity, preserves upstream ownership, and includes UI implementation and acceptance for configurable features."
  evaluated_sha: "545f95cc000237a66548819244f903735d9d356d"
  blueprint_digest: "2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e"
  evidence_refs:
    - ".agentplane/tasks/202609241450-HXRNPJ/README.md"
    - ".agentplane/tasks/202609241450-HXRNPJ/quality/20260924-150034069-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609241450-HXRNPJ/quality/20260924-150034069-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609241450-HXRNPJ/quality/20260924-150034069-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json"
    - "docs/program/certification-odt-import-plan.md"
    - "node .agentplane/policy/check-routing.mjs: policy routing OK"
    - "ap doctor: OK with pre-existing warnings"
  findings:
    - "Seven phases distinguish parser diagnostics, scalar properties, structural markers, font/page resources, canonical tables, and whole-document acceptance; each feature phase specifies semantic and UI gates."
    - "The plan treats the source ODT as private and does not copy its text or embedded assets."
commit:
  hash: "545f95cc000237a66548819244f903735d9d356d"
  message: "📝 HXRNPJ docs: plan certification ODT import and UI"
comments:
  -
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: verified-202609241450-HXRNPJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-24T14:56:01.970Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-24T14:59:31.587Z"
    author: "DOCS"
    state: "ok"
    note: "Documentation plan checked against the supplied ODT inventory and current import code; links resolve, phases include upstream-equivalent UI, policy routing and doctor pass."
  -
    type: "verify"
    at: "2026-09-24T15:00:17.160Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609241450-HXRNPJ"
  -
    type: "verify"
    at: "2026-09-24T15:00:51.403Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609241450-HXRNPJ"
  -
    type: "status"
    at: "2026-09-24T15:00:51.548Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609241450-HXRNPJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-24T15:00:51.548Z"
doc_updated_by: "CODER"
description: "Document an ordered, upstream-aligned implementation plan for attributes and entities needed to fully open the supplied certification ODT."
sections:
  Summary: |-
    Plan certification ODT import support

    Document an ordered, upstream-aligned implementation plan for attributes and entities needed to fully open the supplied certification ODT.
  Scope: |-
    - In scope: docs/program/certification-odt-import-plan.md, grounded in the supplied ODT package and current import code. Order implementation phases from simple to complex; map each to pinned LibreOffice ownership, semantic acceptance, and upstream-equivalent UI controls/dialogs for user-configurable features. Validate links and documentation policy.
    - Out of scope: implementation changes, committing the private source ODT, network access, and unrelated in-progress code.
  Plan: "1. Record the supplied ODT package inventory and classify actual content and styles diagnostics against the current fast SAX import contexts. 2. Write an English plan in docs/program/certification-odt-import-plan.md, ordered from token and diagnostic fixes through scalar style properties, inline markers, page and font handling, then canonical table model and round-trip fidelity. 3. For each phase identify the pinned LibreOffice owner, local module, user-visible result, tests, and a gate that distinguishes meaningful support from warning suppression. 4. Keep the private ODT outside Git; specify a derived non-sensitive fixture and manual acceptance run. 5. Validate links and run routing and doctor checks; record verification and finish the docs-only task. Do not touch existing code edits."
  Verify Steps: "1. Confirm docs/program/certification-odt-import-plan.md inventories the supplied ODT without copying private document text or bytes. 2. Confirm phases progress from diagnostics and simple attributes to inline structures, page/font behavior, tables, and whole-document acceptance; every configurable feature includes upstream-mapped UI controls/dialogs and UI verification. 3. Confirm relative links resolve and the plan accurately distinguishes current support from future work. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. 5. Record git status and ensure pre-existing code edits are untouched."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T14:59:31.587Z — VERIFY — ok

    By: DOCS

    Note: Documentation plan checked against the supplied ODT inventory and current import code; links resolve, phases include upstream-equivalent UI, policy routing and doctor pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:59:26.896Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
    - old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241450-HXRNPJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-24T15:00:17.160Z — VERIFY — ok

    By: CODER

    Note: verified-202609241450-HXRNPJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:59:31.670Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
    - old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241450-HXRNPJ --result verified-202609241450-HXRNPJ --commit 545f95cc000237a66548819244f903735d9d356d
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-24T15:00:51.403Z — VERIFY — ok

    By: CODER

    Note: verified-202609241450-HXRNPJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T15:00:17.268Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
    - old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609241450-HXRNPJ --result verified-202609241450-HXRNPJ --commit 2a3ca59c1c9d46def023777d8b5c705329559124
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
  Findings: |-
    - Command: python3 local link/phase check for docs/program/certification-odt-import-plan.md. Result: pass. Evidence: all three relative links resolve; phases 0-6 present; no original document text or package bytes copied. Scope: the new plan. Links: writer-odt-format.md and libreoffice-baseline.md.
    - Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: task/documentation routing. Links: AGENTS.md.
    - Command: ap doctor. Result: pass. Evidence: doctor (OK), with two pre-existing warnings about the managed hook shim and an older DONE task commit; no errors. Scope: repository workflow health. Links: .agentplane/WORKFLOW.md.
    - Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: tracked task README change. Links: this task README.
    - Command: git status --short --untracked-files=all. Result: pass. Evidence: only this task README and the new plan were outstanding at verification time; unrelated code edits were not changed by this task. Scope: final task paths. Links: docs/program/certification-odt-import-plan.md.
id_source: "generated"
---
## Summary

Plan certification ODT import support

Document an ordered, upstream-aligned implementation plan for attributes and entities needed to fully open the supplied certification ODT.

## Scope

- In scope: docs/program/certification-odt-import-plan.md, grounded in the supplied ODT package and current import code. Order implementation phases from simple to complex; map each to pinned LibreOffice ownership, semantic acceptance, and upstream-equivalent UI controls/dialogs for user-configurable features. Validate links and documentation policy.
- Out of scope: implementation changes, committing the private source ODT, network access, and unrelated in-progress code.

## Plan

1. Record the supplied ODT package inventory and classify actual content and styles diagnostics against the current fast SAX import contexts. 2. Write an English plan in docs/program/certification-odt-import-plan.md, ordered from token and diagnostic fixes through scalar style properties, inline markers, page and font handling, then canonical table model and round-trip fidelity. 3. For each phase identify the pinned LibreOffice owner, local module, user-visible result, tests, and a gate that distinguishes meaningful support from warning suppression. 4. Keep the private ODT outside Git; specify a derived non-sensitive fixture and manual acceptance run. 5. Validate links and run routing and doctor checks; record verification and finish the docs-only task. Do not touch existing code edits.

## Verify Steps

1. Confirm docs/program/certification-odt-import-plan.md inventories the supplied ODT without copying private document text or bytes. 2. Confirm phases progress from diagnostics and simple attributes to inline structures, page/font behavior, tables, and whole-document acceptance; every configurable feature includes upstream-mapped UI controls/dialogs and UI verification. 3. Confirm relative links resolve and the plan accurately distinguishes current support from future work. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. 5. Record git status and ensure pre-existing code edits are untouched.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T14:59:31.587Z — VERIFY — ok

By: DOCS

Note: Documentation plan checked against the supplied ODT inventory and current import code; links resolve, phases include upstream-equivalent UI, policy routing and doctor pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:59:26.896Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
- old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241450-HXRNPJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-24T15:00:17.160Z — VERIFY — ok

By: CODER

Note: verified-202609241450-HXRNPJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T14:59:31.670Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
- old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241450-HXRNPJ --result verified-202609241450-HXRNPJ --commit 545f95cc000237a66548819244f903735d9d356d
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-24T15:00:51.403Z — VERIFY — ok

By: CODER

Note: verified-202609241450-HXRNPJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T15:00:17.268Z, excerpt_hash=sha256:5bf4efc664c5807442f6b726be12ed9183e4b0568ba51d3c924a40e41bd5605b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241450-HXRNPJ/blueprint/resolved-snapshot.json
- old_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- current_digest: 2a086d0fdc7c95bb59f7e5c084aaaf4f8b10377bdd031bb3af99d550fc155f6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241450-HXRNPJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609241450-HXRNPJ --result verified-202609241450-HXRNPJ --commit 2a3ca59c1c9d46def023777d8b5c705329559124
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

- Command: python3 local link/phase check for docs/program/certification-odt-import-plan.md. Result: pass. Evidence: all three relative links resolve; phases 0-6 present; no original document text or package bytes copied. Scope: the new plan. Links: writer-odt-format.md and libreoffice-baseline.md.
- Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: task/documentation routing. Links: AGENTS.md.
- Command: ap doctor. Result: pass. Evidence: doctor (OK), with two pre-existing warnings about the managed hook shim and an older DONE task commit; no errors. Scope: repository workflow health. Links: .agentplane/WORKFLOW.md.
- Command: git diff --check. Result: pass. Evidence: no whitespace errors. Scope: tracked task README change. Links: this task README.
- Command: git status --short --untracked-files=all. Result: pass. Evidence: only this task README and the new plan were outstanding at verification time; unrelated code edits were not changed by this task. Scope: final task paths. Links: docs/program/certification-odt-import-plan.md.
