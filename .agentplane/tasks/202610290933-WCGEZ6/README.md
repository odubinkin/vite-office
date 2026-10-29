---
id: "202610290933-WCGEZ6"
title: "Align SAL negative-precision formatter with merged upstream fixes"
result_summary: "CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-29T09:34:23.929Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-29T09:49:39.389Z"
  updated_by: "CODER"
  note: "CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-29T09:48:38.591Z"
  updated_by: "EVALUATOR"
  note: "Corrected SAL zero formatting and current merged Gerrit parity, verified with 185 RTL tests and static checks"
  evaluated_sha: "abb5da874bb13266245409f8609343e399e97569"
  blueprint_digest: "3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f"
  evidence_refs:
    - ".agentplane/tasks/202610290933-WCGEZ6/README.md"
    - ".agentplane/tasks/202610290933-WCGEZ6/quality/20261029-094838591-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610290933-WCGEZ6/quality/20261029-094838591-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610290933-WCGEZ6/quality/20261029-094838591-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json"
    - "apps/office/src/sal/rtl/double-format.test.ts"
    - "docs/program/calc-upstream-suspected-issues.md"
  findings:
    - "Old pinned fixture retained as historical provenance only; current tests require merged upstream zero output"
commit:
  hash: "abb5da874bb13266245409f8609343e399e97569"
  message: "🧩 WCGEZ6 code: align SAL negative precision with merged upstream fixes"
comments:
  -
    author: "CODER"
    body: "Start: Verify merged upstream SAL fixes, correct browser number formatting and regression coverage, and commit a scoped change following the declared verification plan."
  -
    author: "CODER"
    body: "Verified: CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-29T09:34:24.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Verify merged upstream SAL fixes, correct browser number formatting and regression coverage, and commit a scoped change following the declared verification plan."
  -
    type: "verify"
    at: "2026-10-29T09:47:34.656Z"
    author: "CODER"
    state: "ok"
    note: "Validated upstream MERGED #213227/#213228; 185 RTL tests pass (29 files), TypeScript typecheck, source-provenance, ESLint, Prettier, JSDoc, module boundaries, file-size and routing checks pass. Browser zero-formatting regression resolved; native alloca absent."
  -
    type: "verify"
    at: "2026-10-29T09:48:53.023Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610290933-WCGEZ6"
  -
    type: "verify"
    at: "2026-10-29T09:49:39.389Z"
    author: "CODER"
    state: "ok"
    note: "CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass"
  -
    type: "status"
    at: "2026-10-29T09:49:39.468Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-29T09:49:39.468Z"
doc_updated_by: "CODER"
description: "Mark CALC-189 resolved upstream, fix negative-precision zero formatting in browser SAL port while preserving historic native evidence, add regression tests and Gerrit links, verify and commit under repository workflow."
sections:
  Summary: |-
    Align SAL negative-precision formatter with merged upstream fixes

    Mark CALC-189 resolved upstream, fix negative-precision zero formatting in browser SAL port while preserving historic native evidence, add regression tests and Gerrit links, verify and commit under repository workflow.
  Scope: |-
    - In scope: Mark CALC-189 resolved upstream, fix negative-precision zero formatting in browser SAL port while preserving historic native evidence, add regression tests and Gerrit links, verify and commit under repository workflow.
    - Out of scope: unrelated refactors not required for "Align SAL negative-precision formatter with merged upstream fixes".
  Plan: "1. Verify LibreOffice Gerrit #213227 and #213228 are MERGED; document upstream state of CALC-189 and the distinct zero-rounding fix. 2. Reproduce browser SAL malformed output, then apply the upstream zero-output guard while retaining managed-string memory safety. 3. Preserve pinned pre-fix native fixture as historical evidence and adjust only the targeted changed-behavior assertions. 4. Add precise positive/negative, grouped/ungrouped, both API regression tests with Gerrit references. 5. Run focused and relevant test suites, lint/typecheck/format, check staging and commit only scoped files."
  Verify Steps: "1. Reproduce 100000/-6 grouped and ungrouped, 0/-6, 1e14/-15 grouped, 1e20/-15 ungrouped in browser SAL and assert corrected upstream outputs and both RTL APIs. 2. Run `npx vitest run apps/office/src/sal/rtl/double-format.test.ts apps/office/src/sal/rtl/strtmpl.math.test.ts` plus other affected fixture tests, verify pinned fixture integrity. 3. Run `npx prettier --check <changed paths>`, ESLint on changed code/tests, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, `npm run check:source-provenance`, and `node .agentplane/policy/check-routing.mjs` as feasible. 4. Verify status, inspect `git diff --check`, stage only task paths, commit following hooks and check clean tracked tree. Record any skipped checks."
  Verification: |-
    PASS: 29 RTL test files, 185 tests via node_modules/.bin/vitest run apps/office/src/sal/rtl --maxWorkers 3; 122,765 pinned native observations with modern zero-correction checks. PASS: npm run typecheck --workspace @vite-office/office; npm run check:dependencies; npm run check:source-provenance (1862 modules); npm run check:docs; npm run check:file-size; node_modules/.bin/prettier --check changed paths; node_modules/.bin/eslint changed TS paths --max-warnings 0; git diff --check; node .agentplane/policy/check-routing.mjs; ap doctor (OK, one pre-existing hook-shim warning). SKIPPED full npm run verify because it also runs all browser e2e and full application coverage unrelated to these SAL changes; test scope is covered by focused RTL plus static/tooling checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-29T09:47:34.656Z — VERIFY — ok

    By: CODER

    Note: Validated upstream MERGED #213227/#213228; 185 RTL tests pass (29 files), TypeScript typecheck, source-provenance, ESLint, Prettier, JSDoc, module boundaries, file-size and routing checks pass. Browser zero-formatting regression resolved; native alloca absent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:47:11.347Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
    - old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610290933-WCGEZ6 -m 🧩 WCGEZ6 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-29T09:48:53.023Z — VERIFY — ok

    By: CODER

    Note: verified-202610290933-WCGEZ6
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:47:34.704Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
    - old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610290933-WCGEZ6 --result verified-202610290933-WCGEZ6 --commit abb5da874bb13266245409f8609343e399e97569
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-29T09:49:39.389Z — VERIFY — ok

    By: CODER

    Note: CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:48:53.072Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
    - old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610290933-WCGEZ6 --result verified-202610290933-WCGEZ6 --commit 74d21061a034857d0a79ba7e3393cfcc64e02720
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
  Findings: "Upstream Gerrit #213227 (Caolán, merged 4fdc6d31ff6c3daf51bb0f6397636690a3474e04) fixed native temporary stack buffer allocation; JS port uses managed strings, so there is no native alloca vulnerability to repair. Gerrit #213228 (Stephan, merged c4ab814db9c3222a5ff015ad3c030a268e0535c5) fixed all-digits-rounded-away output. Exact browser PoCs reproduced old malformed comma/zeros/empty string before correction; after porting the upstream zero guard each yields 0 (or -0), preserving other formats. Historical pinned full native data is retained only as source evidence; the test now verifies corrected modern output for outdated cases, and retains strict parity/ownership checks for unchanged observations. The TS port exposes rtl_math_doubleToUString, not an independent byte-string rtl_math_doubleToString; only relevant implemented API is tested. No upstream pin/source fixture rewritten, and no network publication attempted."
id_source: "generated"
---
## Summary

Align SAL negative-precision formatter with merged upstream fixes

Mark CALC-189 resolved upstream, fix negative-precision zero formatting in browser SAL port while preserving historic native evidence, add regression tests and Gerrit links, verify and commit under repository workflow.

## Scope

- In scope: Mark CALC-189 resolved upstream, fix negative-precision zero formatting in browser SAL port while preserving historic native evidence, add regression tests and Gerrit links, verify and commit under repository workflow.
- Out of scope: unrelated refactors not required for "Align SAL negative-precision formatter with merged upstream fixes".

## Plan

1. Verify LibreOffice Gerrit #213227 and #213228 are MERGED; document upstream state of CALC-189 and the distinct zero-rounding fix. 2. Reproduce browser SAL malformed output, then apply the upstream zero-output guard while retaining managed-string memory safety. 3. Preserve pinned pre-fix native fixture as historical evidence and adjust only the targeted changed-behavior assertions. 4. Add precise positive/negative, grouped/ungrouped, both API regression tests with Gerrit references. 5. Run focused and relevant test suites, lint/typecheck/format, check staging and commit only scoped files.

## Verify Steps

1. Reproduce 100000/-6 grouped and ungrouped, 0/-6, 1e14/-15 grouped, 1e20/-15 ungrouped in browser SAL and assert corrected upstream outputs and both RTL APIs. 2. Run `npx vitest run apps/office/src/sal/rtl/double-format.test.ts apps/office/src/sal/rtl/strtmpl.math.test.ts` plus other affected fixture tests, verify pinned fixture integrity. 3. Run `npx prettier --check <changed paths>`, ESLint on changed code/tests, `npm run typecheck --workspace @vite-office/office`, `npm run check:dependencies`, `npm run check:source-provenance`, and `node .agentplane/policy/check-routing.mjs` as feasible. 4. Verify status, inspect `git diff --check`, stage only task paths, commit following hooks and check clean tracked tree. Record any skipped checks.

## Verification

PASS: 29 RTL test files, 185 tests via node_modules/.bin/vitest run apps/office/src/sal/rtl --maxWorkers 3; 122,765 pinned native observations with modern zero-correction checks. PASS: npm run typecheck --workspace @vite-office/office; npm run check:dependencies; npm run check:source-provenance (1862 modules); npm run check:docs; npm run check:file-size; node_modules/.bin/prettier --check changed paths; node_modules/.bin/eslint changed TS paths --max-warnings 0; git diff --check; node .agentplane/policy/check-routing.mjs; ap doctor (OK, one pre-existing hook-shim warning). SKIPPED full npm run verify because it also runs all browser e2e and full application coverage unrelated to these SAL changes; test scope is covered by focused RTL plus static/tooling checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-29T09:47:34.656Z — VERIFY — ok

By: CODER

Note: Validated upstream MERGED #213227/#213228; 185 RTL tests pass (29 files), TypeScript typecheck, source-provenance, ESLint, Prettier, JSDoc, module boundaries, file-size and routing checks pass. Browser zero-formatting regression resolved; native alloca absent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:47:11.347Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
- old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610290933-WCGEZ6 -m 🧩 WCGEZ6 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-29T09:48:53.023Z — VERIFY — ok

By: CODER

Note: verified-202610290933-WCGEZ6
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:47:34.704Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
- old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610290933-WCGEZ6 --result verified-202610290933-WCGEZ6 --commit abb5da874bb13266245409f8609343e399e97569
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-29T09:49:39.389Z — VERIFY — ok

By: CODER

Note: CALC-189 upstream merged; corrected SAL zero formatting; 185 RTL tests pass
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-29T09:48:53.072Z, excerpt_hash=sha256:1ede3cd36b6ac1a0bf7abd01b1ebd3ba06c381bd9f336fc92a63956047078b7d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610290933-WCGEZ6/blueprint/resolved-snapshot.json
- old_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- current_digest: 3c7814f634313d2c0a9eb2c9f2d65dbfa42cf6508ff5e94664a1fae3afa5f37f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610290933-WCGEZ6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610290933-WCGEZ6 --result verified-202610290933-WCGEZ6 --commit 74d21061a034857d0a79ba7e3393cfcc64e02720
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

Upstream Gerrit #213227 (Caolán, merged 4fdc6d31ff6c3daf51bb0f6397636690a3474e04) fixed native temporary stack buffer allocation; JS port uses managed strings, so there is no native alloca vulnerability to repair. Gerrit #213228 (Stephan, merged c4ab814db9c3222a5ff015ad3c030a268e0535c5) fixed all-digits-rounded-away output. Exact browser PoCs reproduced old malformed comma/zeros/empty string before correction; after porting the upstream zero guard each yields 0 (or -0), preserving other formats. Historical pinned full native data is retained only as source evidence; the test now verifies corrected modern output for outdated cases, and retains strict parity/ownership checks for unchanged observations. The TS port exposes rtl_math_doubleToUString, not an independent byte-string rtl_math_doubleToString; only relevant implemented API is tested. No upstream pin/source fixture rewritten, and no network publication attempted.
