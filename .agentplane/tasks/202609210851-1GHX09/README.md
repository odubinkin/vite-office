---
id: "202609210851-1GHX09"
title: "Implement Phase 8 differential parity verification"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T08:51:58.707Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T09:23:11.572Z"
  updated_by: "CODER"
  note: "All declared checks pass: parity inventory 35/35 verified with zero gaps and unclassified divergences; 341 office and 95 inventory tests at 100% coverage; typecheck, lint, 11 Playwright scenarios, formatting, docs, file-size, source-tree, provenance, invariants, routing, doctor, and diff hygiene pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T09:23:18.277Z"
  updated_by: "EVALUATOR"
  note: "Parity inventory closure is complete and independently machine-checked."
  evaluated_sha: "120828c1bbf7d0fa27b56baa305c92e5757dde5f"
  blueprint_digest: "34f7cb5ebd4a4340176e157300a1ef96f0644ecec3bb350d7d40c7d5bb8541c9"
  evidence_refs:
    - ".agentplane/tasks/202609210851-1GHX09/README.md"
    - ".agentplane/tasks/202609210851-1GHX09/quality/20260921-092318277-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609210851-1GHX09/quality/20260921-092318277-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609210851-1GHX09/quality/20260921-092318277-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609210851-1GHX09/blueprint/resolved-snapshot.json"
    - "npm run inventory:parity"
    - "npm test"
    - "npm run test:e2e"
    - "node .agentplane/policy/check-routing.mjs"
  findings:
    - "Schema-six inventory requires complete closure evidence for all verified capabilities and reports zero unresolved or unclassified differences."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement Phase 8 parity evidence, differential checks, capability closure, and declared verification gates."
events:
  -
    type: "status"
    at: "2026-09-21T08:52:06.961Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Phase 8 parity evidence, differential checks, capability closure, and declared verification gates."
  -
    type: "verify"
    at: "2026-09-21T09:23:11.572Z"
    author: "CODER"
    state: "ok"
    note: "All declared checks pass: parity inventory 35/35 verified with zero gaps and unclassified divergences; 341 office and 95 inventory tests at 100% coverage; typecheck, lint, 11 Playwright scenarios, formatting, docs, file-size, source-tree, provenance, invariants, routing, doctor, and diff hygiene pass."
doc_version: 3
doc_updated_at: "2026-09-21T09:23:11.658Z"
doc_updated_by: "CODER"
description: "Close Phase 8 for CAP-0101 through CAP-0135 with executable contract, behavior, default, serialization, differential, and divergence evidence against the pinned LibreOffice baseline."
sections:
  Summary: "Implement Phase 8 differential verification and capability closure for CAP-0101 through CAP-0135 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65."
  Scope: "In scope: scripts/libreoffice-inventory parity contracts, validators, CLI and tests; docs/program/parity manifests and evidence; capability-linked fixtures, tests, and apps/office implementation defects necessary to make bounded claims true. Out of scope: new office suites, unimplemented desktop-only functionality, network access, and widening the bounded Writer product surface."
  Plan: "Implement strict, executable Phase 8 closure evidence for all bounded Writer capabilities; fix only defects exposed inside the approved capability scope; verify using parity inventory, full tests, typecheck, lint, browser E2E, routing policy, Agentplane doctor, diff hygiene, and final repository status."
  Verify Steps: |-
    npm run inventory:parity
    npm test
    npm run typecheck
    npm run lint
    npm run test:e2e
    node .agentplane/policy/check-routing.mjs
    ap doctor
    git diff --check
    git status --short --untracked-files=all
  Verification: |-
    PASS. npm run inventory:parity reports 35/35 verified capabilities, parityReady true, zero gaps, zero unresolved capabilities, and zero unclassified divergences. npm test passed 341 office tests and 95 inventory tests with 100 percent statements, branches, functions, and lines. npm run typecheck, npm run lint, and npm run test:e2e passed; Playwright passed 11 scenarios. npm run format:check, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check passed. One concurrent test attempt timed out under competing typecheck load; the required isolated npm test rerun passed completely.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T09:23:11.572Z — VERIFY — ok

    By: CODER

    Note: All declared checks pass: parity inventory 35/35 verified with zero gaps and unclassified divergences; 341 office and 95 inventory tests at 100% coverage; typecheck, lint, 11 Playwright scenarios, formatting, docs, file-size, source-tree, provenance, invariants, routing, doctor, and diff hygiene pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T09:22:15.117Z, excerpt_hash=sha256:67d66a7f6e85ed1c334db7e93329085fceece108e3b01a2f34343f5ed98f3260

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609210851-1GHX09/blueprint/resolved-snapshot.json
    - old_digest: 34f7cb5ebd4a4340176e157300a1ef96f0644ecec3bb350d7d40c7d5bb8541c9
    - current_digest: 34f7cb5ebd4a4340176e157300a1ef96f0644ecec3bb350d7d40c7d5bb8541c9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609210851-1GHX09

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609210851-1GHX09
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and the deterministic Agentplane close commit. No external state, migrations, credentials, or network resources are involved."
  Findings: |-
    Parity closure is part of the normal schema-six inventory mapping validator, not a standalone phase-specific production script. Each verified record carries contract, ownership, behavior, defaults, relevant serialization, operation-cycle, differential, and B/X evidence. The report resolves all markers and rejects class A local infrastructure, missing browser-adaptation evidence, unclassified scope limitations, incomplete universal dimensions, and unsupported differential methods. The local checkout has no runnable soffice binary, so CAP-0130 uses pinned ODT fixtures and the remaining bounded capabilities use exact source-derived golden references without claiming native execution.

    - Observation: A commit message using the disallowed data scope was rejected before commit creation.
      Impact: No repository content was lost; the evidence JSON remained staged.
      Resolution: Recomputed the route, ran ap doctor, and committed the same staged evidence update with the allowed code scope.
id_source: "generated"
---
## Summary

Implement Phase 8 differential verification and capability closure for CAP-0101 through CAP-0135 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65.

## Scope

In scope: scripts/libreoffice-inventory parity contracts, validators, CLI and tests; docs/program/parity manifests and evidence; capability-linked fixtures, tests, and apps/office implementation defects necessary to make bounded claims true. Out of scope: new office suites, unimplemented desktop-only functionality, network access, and widening the bounded Writer product surface.

## Plan

Implement strict, executable Phase 8 closure evidence for all bounded Writer capabilities; fix only defects exposed inside the approved capability scope; verify using parity inventory, full tests, typecheck, lint, browser E2E, routing policy, Agentplane doctor, diff hygiene, and final repository status.

## Verify Steps

npm run inventory:parity
npm test
npm run typecheck
npm run lint
npm run test:e2e
node .agentplane/policy/check-routing.mjs
ap doctor
git diff --check
git status --short --untracked-files=all

## Verification

PASS. npm run inventory:parity reports 35/35 verified capabilities, parityReady true, zero gaps, zero unresolved capabilities, and zero unclassified divergences. npm test passed 341 office tests and 95 inventory tests with 100 percent statements, branches, functions, and lines. npm run typecheck, npm run lint, and npm run test:e2e passed; Playwright passed 11 scenarios. npm run format:check, npm run check:docs, npm run check:file-size, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check passed. One concurrent test attempt timed out under competing typecheck load; the required isolated npm test rerun passed completely.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T09:23:11.572Z — VERIFY — ok

By: CODER

Note: All declared checks pass: parity inventory 35/35 verified with zero gaps and unclassified divergences; 341 office and 95 inventory tests at 100% coverage; typecheck, lint, 11 Playwright scenarios, formatting, docs, file-size, source-tree, provenance, invariants, routing, doctor, and diff hygiene pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T09:22:15.117Z, excerpt_hash=sha256:67d66a7f6e85ed1c334db7e93329085fceece108e3b01a2f34343f5ed98f3260

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609210851-1GHX09/blueprint/resolved-snapshot.json
- old_digest: 34f7cb5ebd4a4340176e157300a1ef96f0644ecec3bb350d7d40c7d5bb8541c9
- current_digest: 34f7cb5ebd4a4340176e157300a1ef96f0644ecec3bb350d7d40c7d5bb8541c9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609210851-1GHX09

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609210851-1GHX09
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and the deterministic Agentplane close commit. No external state, migrations, credentials, or network resources are involved.

## Findings

Parity closure is part of the normal schema-six inventory mapping validator, not a standalone phase-specific production script. Each verified record carries contract, ownership, behavior, defaults, relevant serialization, operation-cycle, differential, and B/X evidence. The report resolves all markers and rejects class A local infrastructure, missing browser-adaptation evidence, unclassified scope limitations, incomplete universal dimensions, and unsupported differential methods. The local checkout has no runnable soffice binary, so CAP-0130 uses pinned ODT fixtures and the remaining bounded capabilities use exact source-derived golden references without claiming native execution.

- Observation: A commit message using the disallowed data scope was rejected before commit creation.
  Impact: No repository content was lost; the evidence JSON remained staged.
  Resolution: Recomputed the route, ran ap doctor, and committed the same staged evidence update with the allowed code scope.
