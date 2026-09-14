---
id: "202609141702-2CBZQJ"
title: "Implement Workstream 7 lazy Writer lifecycle"
result_summary: "Implement lazy Writer lifecycle and extracted browser view services"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T17:02:31.976Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T17:25:24.161Z"
  updated_by: "CODER"
  note: "verified-202609141702-2CBZQJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T17:25:06.540Z"
  updated_by: "EVALUATOR"
  note: "Workstream 7 scope and acceptance criteria are implemented with clean browser/view boundaries and deterministic lazy disposal."
  evaluated_sha: "484fadc5dc3835375a422f4d06b168dd645607d5"
  blueprint_digest: "c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f"
  evidence_refs:
    - ".agentplane/tasks/202609141702-2CBZQJ/README.md"
    - ".agentplane/tasks/202609141702-2CBZQJ/quality/20260914-172506540-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609141702-2CBZQJ/quality/20260914-172506540-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609141702-2CBZQJ/quality/20260914-172506540-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609141702-2CBZQJ/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Full repository verification passes, recovery remains explicitly user-selected, and inactive routes create no Writer session resources."
commit:
  hash: "f0d8788052b50af9de3fe5da7eb4fae1f780afbe"
  message: "🧩 2CBZQJ task: persist quality evidence"
comments:
  -
    author: "CODER"
    body: "Start: implement approved Workstream 7 lazy Writer lifecycle, extracted view services, and explicit recovery choice using the pinned upstream baseline."
  -
    author: "CODER"
    body: "Verified: verified-202609141702-2CBZQJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: Workstream 7 lazy lifecycle and recovery boundaries pass the complete repository verification suite."
events:
  -
    type: "status"
    at: "2026-09-14T17:02:39.963Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Workstream 7 lazy Writer lifecycle, extracted view services, and explicit recovery choice using the pinned upstream baseline."
  -
    type: "verify"
    at: "2026-09-14T17:24:41.320Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Workstream 7 lazy Writer lifecycle, extracted browser controllers, explicit recovery decisions, disposal, and parity records pass the complete repository verification suite."
  -
    type: "verify"
    at: "2026-09-14T17:25:24.161Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609141702-2CBZQJ"
  -
    type: "status"
    at: "2026-09-14T17:25:24.288Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609141702-2CBZQJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-14T17:25:55.263Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: Workstream 7 lazy lifecycle and recovery boundaries pass the complete repository verification suite."
doc_version: 3
doc_updated_at: "2026-09-14T17:25:55.264Z"
doc_updated_by: "CODER"
description: "Split SwView browser workflow services, make Writer sessions lazy/disposable, and add explicit recovery presentation policy based on the pinned LibreOffice baseline."
sections:
  Summary: "Implement Workstream 7 from docs/program/vite-office-upstream-parity-plan.md: reduce SwView responsibilities, lazily own Writer sessions, and require an explicit recovery choice."
  Scope: "Modify Writer view/session composition, framework module lifecycle, browser workflow and recovery presenters, focused tests, and parity/provenance records. Preserve current Writer behavior and follow the pinned LibreOffice 26.8.0.2 ownership model where browser constraints permit. No legacy persisted-model compatibility layer."
  Plan: "1. Inspect pinned LibreOffice view, module, desktop, and AutoRecovery ownership and map bounded local responsibilities. 2. Extract browser file/export, clipboard, local-storage, chrome-preference, and typed operation-status services from SwView. 3. Change the Writer module factory and framework workspace mounting so sessions are created on Writer activation and disposed on close/unmount under an explicit retention policy. 4. Add an explicit recovery-candidate presentation controller and restore/discard/continue UI, preserving save/recovery generations and tolerating corrupt candidates. 5. Update inventories/provenance and add focused lifecycle, controller, recovery, and regression tests. 6. Run the declared verification suite and record evidence."
  Verify Steps: |-
    - npm run test:coverage --workspace @vite-office/office -- --runInBand (or the repository-supported equivalent without --runInBand if Vitest rejects it): all Writer/framework unit tests pass, including lazy lifecycle, disposal, controller boundaries, and recovery choice coverage.
    - npm run typecheck: TypeScript checks pass.
    - npm run build: production build succeeds.
    - npm run check:dependencies: module-boundary validation passes.
    - npm run check:source-provenance: provenance validation passes.
    - npm run check:source-tree: LibreOffice-aligned source-tree validation passes.
    - node .agentplane/policy/check-routing.mjs: routing policy passes.
    - ap doctor: repository/task workflow diagnostics pass.
  Verification: |-
    - Command: npm run verify
      Result: pass
      Evidence: formatting, ESLint, TypeScript, module boundaries, 272/272 office tests at 100% coverage, 84/84 inventory tests at 100% coverage, 9/9 Playwright tests, production/static builds, JSDoc, file-size, source-tree, provenance, and parity inventory all passed.
      Scope: complete repository verification for Workstream 7 implementation and regressions.
    - Command: node .agentplane/policy/check-routing.mjs
      Result: pass
      Evidence: policy routing OK.
      Scope: Agentplane gateway and policy routing.
    - Command: ap doctor
      Result: pass
      Evidence: doctor OK with no errors; one pre-existing DONE-task warning and informational fallback notes only.
      Scope: repository and task workflow diagnostics.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T17:24:41.320Z — VERIFY — ok

    By: CODER

    Note: Verified: Workstream 7 lazy Writer lifecycle, extracted browser controllers, explicit recovery decisions, disposal, and parity records pass the complete repository verification suite.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T17:24:40.968Z, excerpt_hash=sha256:3b6ef0d5962864603fde97d30deb08aefe6e16811cfa5c1455b36a50f7c48e52

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141702-2CBZQJ/blueprint/resolved-snapshot.json
    - old_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
    - current_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141702-2CBZQJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609141702-2CBZQJ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T17:25:24.161Z — VERIFY — ok

    By: CODER

    Note: verified-202609141702-2CBZQJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T17:24:41.370Z, excerpt_hash=sha256:3b6ef0d5962864603fde97d30deb08aefe6e16811cfa5c1455b36a50f7c48e52

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141702-2CBZQJ/blueprint/resolved-snapshot.json
    - old_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
    - current_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609141702-2CBZQJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609141702-2CBZQJ --result verified-202609141702-2CBZQJ --commit f0d8788052b50af9de3fe5da7eb4fae1f780afbe
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commit produced for 202609141702-2CBZQJ. The prior eager Writer session factory and SwView-owned browser workflows are restored together; no storage migration or compatibility cleanup is required."
  Findings: ""
extensions:
  implementation_commit:
    hash: "484fadc5dc3835375a422f4d06b168dd645607d5"
    message: "🚧 2CBZQJ task: implement lazy Writer lifecycle"
id_source: "generated"
---
## Summary

Implement Workstream 7 from docs/program/vite-office-upstream-parity-plan.md: reduce SwView responsibilities, lazily own Writer sessions, and require an explicit recovery choice.

## Scope

Modify Writer view/session composition, framework module lifecycle, browser workflow and recovery presenters, focused tests, and parity/provenance records. Preserve current Writer behavior and follow the pinned LibreOffice 26.8.0.2 ownership model where browser constraints permit. No legacy persisted-model compatibility layer.

## Plan

1. Inspect pinned LibreOffice view, module, desktop, and AutoRecovery ownership and map bounded local responsibilities. 2. Extract browser file/export, clipboard, local-storage, chrome-preference, and typed operation-status services from SwView. 3. Change the Writer module factory and framework workspace mounting so sessions are created on Writer activation and disposed on close/unmount under an explicit retention policy. 4. Add an explicit recovery-candidate presentation controller and restore/discard/continue UI, preserving save/recovery generations and tolerating corrupt candidates. 5. Update inventories/provenance and add focused lifecycle, controller, recovery, and regression tests. 6. Run the declared verification suite and record evidence.

## Verify Steps

- npm run test:coverage --workspace @vite-office/office -- --runInBand (or the repository-supported equivalent without --runInBand if Vitest rejects it): all Writer/framework unit tests pass, including lazy lifecycle, disposal, controller boundaries, and recovery choice coverage.
- npm run typecheck: TypeScript checks pass.
- npm run build: production build succeeds.
- npm run check:dependencies: module-boundary validation passes.
- npm run check:source-provenance: provenance validation passes.
- npm run check:source-tree: LibreOffice-aligned source-tree validation passes.
- node .agentplane/policy/check-routing.mjs: routing policy passes.
- ap doctor: repository/task workflow diagnostics pass.

## Verification

- Command: npm run verify
  Result: pass
  Evidence: formatting, ESLint, TypeScript, module boundaries, 272/272 office tests at 100% coverage, 84/84 inventory tests at 100% coverage, 9/9 Playwright tests, production/static builds, JSDoc, file-size, source-tree, provenance, and parity inventory all passed.
  Scope: complete repository verification for Workstream 7 implementation and regressions.
- Command: node .agentplane/policy/check-routing.mjs
  Result: pass
  Evidence: policy routing OK.
  Scope: Agentplane gateway and policy routing.
- Command: ap doctor
  Result: pass
  Evidence: doctor OK with no errors; one pre-existing DONE-task warning and informational fallback notes only.
  Scope: repository and task workflow diagnostics.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T17:24:41.320Z — VERIFY — ok

By: CODER

Note: Verified: Workstream 7 lazy Writer lifecycle, extracted browser controllers, explicit recovery decisions, disposal, and parity records pass the complete repository verification suite.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T17:24:40.968Z, excerpt_hash=sha256:3b6ef0d5962864603fde97d30deb08aefe6e16811cfa5c1455b36a50f7c48e52

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141702-2CBZQJ/blueprint/resolved-snapshot.json
- old_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
- current_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141702-2CBZQJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609141702-2CBZQJ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T17:25:24.161Z — VERIFY — ok

By: CODER

Note: verified-202609141702-2CBZQJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T17:24:41.370Z, excerpt_hash=sha256:3b6ef0d5962864603fde97d30deb08aefe6e16811cfa5c1455b36a50f7c48e52

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609141702-2CBZQJ/blueprint/resolved-snapshot.json
- old_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
- current_digest: c66045acd07e916cccac9becaaffc38c9432810b5863e6a8ae72ce8036fcc07f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609141702-2CBZQJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609141702-2CBZQJ --result verified-202609141702-2CBZQJ --commit f0d8788052b50af9de3fe5da7eb4fae1f780afbe
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commit produced for 202609141702-2CBZQJ. The prior eager Writer session factory and SwView-owned browser workflows are restored together; no storage migration or compatibility cleanup is required.

## Findings
