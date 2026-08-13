---
id: "202608130757-AK2XNQ"
title: "Align Framework desktop path with LibreOffice"
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
  updated_at: "2026-08-13T07:58:27.163Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T08:00:55.317Z"
  updated_by: "CODER"
  note: "Verified: the Framework desktop module and its React composition export now match the pinned desktop ownership boundary; 83 fast tests retain 100% coverage and all declared quality gates pass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T08:00:55.779Z"
  updated_by: "EVALUATOR"
  note: "Framework desktop path alignment preserves browser behavior while removing a false duplicate upstream mapping."
  evaluated_sha: "5d5b44b881031c52efcb6b8774a421c37c39d9b7"
  blueprint_digest: "9aaa240aa9c4aa71607926b96b0a7488f02f1538acc16493c122fb47820dfbb0"
  evidence_refs:
    - ".agentplane/tasks/202608130757-AK2XNQ/README.md"
    - ".agentplane/tasks/202608130757-AK2XNQ/quality/20260813-080055779-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130757-AK2XNQ/quality/20260813-080055779-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130757-AK2XNQ/quality/20260813-080055779-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130757-AK2XNQ/blueprint/resolved-snapshot.json"
    - "5d5b44b"
  findings:
    - "Fast coverage and all formatting, type, provenance, source-tree, documentation, and size gates passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align the Framework desktop module path and retain an honest browser bootstrap boundary."
events:
  -
    type: "status"
    at: "2026-08-13T07:57:54.502Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align the Framework desktop module path and retain an honest browser bootstrap boundary."
  -
    type: "verify"
    at: "2026-08-13T08:00:55.317Z"
    author: "CODER"
    state: "ok"
    note: "Verified: the Framework desktop module and its React composition export now match the pinned desktop ownership boundary; 83 fast tests retain 100% coverage and all declared quality gates pass."
doc_version: 3
doc_updated_at: "2026-08-13T08:00:55.405Z"
doc_updated_by: "CODER"
description: "Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage."
sections:
  Summary: |-
    Align Framework desktop path with LibreOffice

    Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
  Scope: |-
    - In scope: Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
    - Out of scope: unrelated refactors not required for "Align Framework desktop path with LibreOffice".
  Plan: "1. Rename framework/source/services/App.tsx and its focused test to desktop.tsx/desktop.test.tsx; rename the local React composition export from App to Desktop so the public module identity matches pinned framework/source/services/desktop.cxx. 2. Update bootstrap and Writer UI test imports to Desktop. 3. Reclassify bootstrap.tsx as a browser-only static mounting adapter in source provenance, map desktop.tsx to the pinned desktop.cxx ownership source, and adjust the source-tree required path and wording. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes visual or functional behavior, Vite entrypoint design, other Framework renames, and the deferred full-suite cadence."
  Verify Steps: "1. Run npm run test:coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass, desktop.tsx maps to framework/source/services/desktop.cxx, and bootstrap.tsx has an explicit browser-only rationale. 3. Run git diff --check, search for stale services/App imports, and inspect git status --short --untracked-files=all; expected: only task-scoped renames/imports/provenance/structural files and task artifacts remain."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T08:00:55.317Z — VERIFY — ok

    By: CODER

    Note: Verified: the Framework desktop module and its React composition export now match the pinned desktop ownership boundary; 83 fast tests retain 100% coverage and all declared quality gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:58:26.850Z, excerpt_hash=sha256:cdd21c52b2dca4d50fd51bdf608f2dc7c671e87fd6cc9ee820940163b3109972

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130757-AK2XNQ/blueprint/resolved-snapshot.json
    - old_digest: 9aaa240aa9c4aa71607926b96b0a7488f02f1538acc16493c122fb47820dfbb0
    - current_digest: 9aaa240aa9c4aa71607926b96b0a7488f02f1538acc16493c122fb47820dfbb0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130757-AK2XNQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130757-AK2XNQ
    - diagnostic_command: agentplane task run status 202608130757-AK2XNQ
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: bootstrap.tsx is now explicitly browser-only rather than a duplicate desktop.cxx mapping, while writer parity test records follow the renamed desktop test file.
      Impact: The provenance manifest is exhaustive and unambiguous without changing visible application behavior; full e2e/static/inventory cadence remains deferred until the tenth post-baseline task.
      Resolution: The structural gate requires desktop.tsx, and stale App path references were searched and eliminated.
id_source: "generated"
---
## Summary

Align Framework desktop path with LibreOffice

Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.

## Scope

- In scope: Rename the static React application shell from App.tsx to desktop.tsx and its focused test accordingly, matching pinned LibreOffice framework/source/services/desktop.cxx. Retain bootstrap.tsx as the browser-specific mounting boundary, update direct imports, provenance, source-tree validation, and documentation, and preserve behavior and coverage.
- Out of scope: unrelated refactors not required for "Align Framework desktop path with LibreOffice".

## Plan

1. Rename framework/source/services/App.tsx and its focused test to desktop.tsx/desktop.test.tsx; rename the local React composition export from App to Desktop so the public module identity matches pinned framework/source/services/desktop.cxx. 2. Update bootstrap and Writer UI test imports to Desktop. 3. Reclassify bootstrap.tsx as a browser-only static mounting adapter in source provenance, map desktop.tsx to the pinned desktop.cxx ownership source, and adjust the source-tree required path and wording. 4. Run fast coverage plus format, lint, types, JSDoc, provenance, source-tree, file-size, and diff checks. Scope excludes visual or functional behavior, Vite entrypoint design, other Framework renames, and the deferred full-suite cadence.

## Verify Steps

1. Run npm run test:coverage; expected: all fast unit/component tests pass and global coverage remains 100%. 2. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:source-provenance, npm run check:source-tree, and npm run check:file-size; expected: all pass, desktop.tsx maps to framework/source/services/desktop.cxx, and bootstrap.tsx has an explicit browser-only rationale. 3. Run git diff --check, search for stale services/App imports, and inspect git status --short --untracked-files=all; expected: only task-scoped renames/imports/provenance/structural files and task artifacts remain.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T08:00:55.317Z — VERIFY — ok

By: CODER

Note: Verified: the Framework desktop module and its React composition export now match the pinned desktop ownership boundary; 83 fast tests retain 100% coverage and all declared quality gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:58:26.850Z, excerpt_hash=sha256:cdd21c52b2dca4d50fd51bdf608f2dc7c671e87fd6cc9ee820940163b3109972

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130757-AK2XNQ/blueprint/resolved-snapshot.json
- old_digest: 9aaa240aa9c4aa71607926b96b0a7488f02f1538acc16493c122fb47820dfbb0
- current_digest: 9aaa240aa9c4aa71607926b96b0a7488f02f1538acc16493c122fb47820dfbb0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130757-AK2XNQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130757-AK2XNQ
- diagnostic_command: agentplane task run status 202608130757-AK2XNQ
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: bootstrap.tsx is now explicitly browser-only rather than a duplicate desktop.cxx mapping, while writer parity test records follow the renamed desktop test file.
  Impact: The provenance manifest is exhaustive and unambiguous without changing visible application behavior; full e2e/static/inventory cadence remains deferred until the tenth post-baseline task.
  Resolution: The structural gate requires desktop.tsx, and stale App path references were searched and eliminated.
