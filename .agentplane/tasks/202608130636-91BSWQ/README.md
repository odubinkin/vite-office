---
id: "202608130636-91BSWQ"
title: "Align Writer browser command shell with textsh ownership"
result_summary: "Writer browser command shell aligned to textsh ownership and verified."
risk_level: "low"
status: "DONE"
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
  updated_at: "2026-08-13T06:37:13.851Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T06:39:40.380Z"
  updated_by: "CODER"
  note: "Verified Writer text-shell relocation with coverage, focused Copy E2E, parity inventory, and static quality gates."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T06:39:39.908Z"
  updated_by: "EVALUATOR"
  note: "The remaining browser command hook now has a concrete Writer text-shell path and preserves Copy behavior."
  evaluated_sha: "347205a4ed0eaa4495615408e06188cb5512a515"
  blueprint_digest: "a2f85f0de1aadcdf6ec74fd69f59e0d479cfa852fb766a0fbe87881bc89b2acf"
  evidence_refs:
    - ".agentplane/tasks/202608130636-91BSWQ/README.md"
    - ".agentplane/tasks/202608130636-91BSWQ/quality/20260813-063939908-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130636-91BSWQ/quality/20260813-063939908-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130636-91BSWQ/quality/20260813-063939908-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130636-91BSWQ/blueprint/resolved-snapshot.json"
    - "coverage, focused native Copy E2E, parity inventory, static checks"
  findings:
    - "No correctness finding: the retired generic hook is forbidden by the source-tree gate and parity now names textsh."
commit:
  hash: "dbed1f7479cbae9e16374d7d0b6bc31007bcdfba"
  message: "🧩 91BSWQ task: record command shell verification"
comments:
  -
    author: "CODER"
    body: "Start: Relocating the browser-owned Writer command hook to the concrete textsh command-shell boundary without changing its bounded Copy and download behavior."
  -
    author: "CODER"
    body: "Verified: The remaining Writer browser command hook now uses sw/source/uibase/shells/textsh.ts, its generic predecessor is forbidden, and Copy behavior plus parity evidence remain intact."
events:
  -
    type: "status"
    at: "2026-08-13T06:37:14.596Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Relocating the browser-owned Writer command hook to the concrete textsh command-shell boundary without changing its bounded Copy and download behavior."
  -
    type: "verify"
    at: "2026-08-13T06:39:40.380Z"
    author: "CODER"
    state: "ok"
    note: "Verified Writer text-shell relocation with coverage, focused Copy E2E, parity inventory, and static quality gates."
  -
    type: "status"
    at: "2026-08-13T06:39:48.354Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The remaining Writer browser command hook now uses sw/source/uibase/shells/textsh.ts, its generic predecessor is forbidden, and Copy behavior plus parity evidence remain intact."
doc_version: 3
doc_updated_at: "2026-08-13T06:39:48.356Z"
doc_updated_by: "CODER"
description: "Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path."
sections:
  Summary: |-
    Align Writer browser command shell with textsh ownership

    Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
  Scope: |-
    - In scope: Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
    - Out of scope: unrelated refactors not required for "Align Writer browser command shell with textsh ownership".
  Plan: "1. Move the browser-owned Writer copy and download command hook from the generic uibase/utlui path into sw/source/uibase/shells/textsh.ts, which is the pinned Writer command-shell ownership path. 2. Update the workbench import and all source-tree, parity, and provenance references; reject restored generic hook paths. 3. Preserve browser-only commands and public behavior without expanding the feature set. 4. Run 100 percent unit coverage, focused native copy E2E, parity inventory, and static gates; defer the full suite under the approved cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after command-shell relocation. 2. Run npm run test:e2e -- --grep copies visible formatted Writer content. Expected: the production Writer Copy flow still writes sanitised rich clipboard data. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: moved textsh local evidence resolves at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    Command: npm run test:coverage
    Result: pass
    Evidence: 26 test files and 75 tests passed at 100 percent statement, branch, function, and line coverage.
    Scope: relocated Writer text-shell command hook.

    Command: npm run test:e2e -- --grep copies visible formatted Writer content
    Result: pass
    Evidence: one production Chromium native Copy scenario passed.
    Scope: browser text-shell Copy command behavior.

    Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
    Result: pass
    Evidence: moved textsh evidence resolved at baseline 9bc445578031fecf56086729d8e4940c77e14d65; exceptionCount is 0.
    Scope: pinned parity traceability.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: formatting, lint, types, JSDoc, source-tree/size, doctor, and routing gates passed.
    Scope: repository quality.

    Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved full-suite cadence is every ten completed tasks.
    Risk: broader integration/browser regressions are deferred until that cadence.
    Approval: user instruction.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T06:39:40.380Z — VERIFY — ok

    By: CODER

    Note: Verified Writer text-shell relocation with coverage, focused Copy E2E, parity inventory, and static quality gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:39:28.784Z, excerpt_hash=sha256:b3b3ffbc064767f3fe81e7d8921ed99126b2ac823df61c44f85d0e7a657b51d3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130636-91BSWQ/blueprint/resolved-snapshot.json
    - old_digest: a2f85f0de1aadcdf6ec74fd69f59e0d479cfa852fb766a0fbe87881bc89b2acf
    - current_digest: a2f85f0de1aadcdf6ec74fd69f59e0d479cfa852fb766a0fbe87881bc89b2acf
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130636-91BSWQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202608130636-91BSWQ -m 🧩 91BSWQ task: persist canonical task artifacts --allow-tasks
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
  Findings: ""
extensions:
  implementation_commit:
    hash: "347205a4ed0eaa4495615408e06188cb5512a515"
    message: "🗂️ 91BSWQ code: update text shell provenance"
id_source: "generated"
---
## Summary

Align Writer browser command shell with textsh ownership

Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.

## Scope

- In scope: Move the remaining generic Writer browser command hook from uibase/utlui into the concrete sw/source/uibase/shells/textsh ownership path, update imports and source-tree parity evidence, and prohibit the retired generic module path.
- Out of scope: unrelated refactors not required for "Align Writer browser command shell with textsh ownership".

## Plan

1. Move the browser-owned Writer copy and download command hook from the generic uibase/utlui path into sw/source/uibase/shells/textsh.ts, which is the pinned Writer command-shell ownership path. 2. Update the workbench import and all source-tree, parity, and provenance references; reject restored generic hook paths. 3. Preserve browser-only commands and public behavior without expanding the feature set. 4. Run 100 percent unit coverage, focused native copy E2E, parity inventory, and static gates; defer the full suite under the approved cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all tests pass at 100 percent coverage after command-shell relocation. 2. Run npm run test:e2e -- --grep copies visible formatted Writer content. Expected: the production Writer Copy flow still writes sanitised rich clipboard data. 3. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: moved textsh local evidence resolves at the pinned baseline. 4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

Command: npm run test:coverage
Result: pass
Evidence: 26 test files and 75 tests passed at 100 percent statement, branch, function, and line coverage.
Scope: relocated Writer text-shell command hook.

Command: npm run test:e2e -- --grep copies visible formatted Writer content
Result: pass
Evidence: one production Chromium native Copy scenario passed.
Scope: browser text-shell Copy command behavior.

Command: npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference
Result: pass
Evidence: moved textsh evidence resolved at baseline 9bc445578031fecf56086729d8e4940c77e14d65; exceptionCount is 0.
Scope: pinned parity traceability.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: formatting, lint, types, JSDoc, source-tree/size, doctor, and routing gates passed.
Scope: repository quality.

Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved full-suite cadence is every ten completed tasks.
Risk: broader integration/browser regressions are deferred until that cadence.
Approval: user instruction.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T06:39:40.380Z — VERIFY — ok

By: CODER

Note: Verified Writer text-shell relocation with coverage, focused Copy E2E, parity inventory, and static quality gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:39:28.784Z, excerpt_hash=sha256:b3b3ffbc064767f3fe81e7d8921ed99126b2ac823df61c44f85d0e7a657b51d3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130636-91BSWQ/blueprint/resolved-snapshot.json
- old_digest: a2f85f0de1aadcdf6ec74fd69f59e0d479cfa852fb766a0fbe87881bc89b2acf
- current_digest: a2f85f0de1aadcdf6ec74fd69f59e0d479cfa852fb766a0fbe87881bc89b2acf
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130636-91BSWQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202608130636-91BSWQ -m 🧩 91BSWQ task: persist canonical task artifacts --allow-tasks
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
