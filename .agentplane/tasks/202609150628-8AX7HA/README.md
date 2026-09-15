---
id: "202609150628-8AX7HA"
title: "Align Writer ODT Title parent styles with LibreOffice"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T06:30:28.065Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T07:17:20.483Z"
  updated_by: "CODER"
  note: "verified-202609150628-8AX7HA"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T07:16:07.070Z"
  updated_by: "EVALUATOR"
  note: "Implementation matches the pinned LibreOffice parent-style import pattern for the bounded built-in Writer style model and restores LibreOffice-compatible Title import/export; all declared checks pass."
  evaluated_sha: "30c15b0a6a036a0e0cd623eeac3f609039022f4b"
  blueprint_digest: "d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb"
  evidence_refs:
    - ".agentplane/tasks/202609150628-8AX7HA/README.md"
    - ".agentplane/tasks/202609150628-8AX7HA/quality/20260915-071607070-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150628-8AX7HA/quality/20260915-071607070-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150628-8AX7HA/quality/20260915-071607070-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/xmlimp.ts@30c15b0a6a036a0e0cd623eeac3f609039022f4b"
    - "apps/office/src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts@30c15b0a6a036a0e0cd623eeac3f609039022f4b"
    - "apps/office/src/xmloff/source/text/txtpara.test.ts@30c15b0a6a036a0e0cd623eeac3f609039022f4b"
    - "vendor/libreoffice-reference/xmloff/source/style/prstylei.cxx@9bc445578031fecf56086729d8e4940c77e14d65"
    - "npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts: 3 files/20 tests passed"
    - "npm run verify: exit 0"
    - "ap doctor: OK with pre-existing F1JT8K warning only"
    - "node .agentplane/policy/check-routing.mjs: policy routing OK"
  findings:
    - "xmlimp.ts removes the project-invented fixed parent assertion, resets imported built-in styles before a second parent-linking pass, clears unresolved/self parents, and prevents cycles, matching the upstream CreateAndInsert/Finish separation and tolerant parent handling in xmloff/source/style/prstylei.cxx."
    - "Regression coverage exercises Title parented to Standard, save/reopen preservation, missing and self parents, a two-style cycle, canonical ODF automatic-style parent names, and retention of unrelated malformed-ODF checks."
    - "Independent evaluation reran the focused ODT suite (3 files, 20 tests), git diff --check, npm run verify (59/286 unit and 32/84 inventory tests at 100% coverage, 9/9 E2E, static/docs/file-size/source-tree/provenance/parity), ap doctor, and policy routing successfully."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T06:30:59.734Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-15T06:40:25.499Z"
    author: "TESTER"
    state: "needs_rework"
    note: "Focused ODT tests pass (3 files, 20 tests); full npm run verify fails at format:check for apps/office/src/sw/source/filter/xml/xmlimp.ts. ap doctor and policy routing pass."
  -
    type: "verify"
    at: "2026-09-15T06:45:38.585Z"
    author: "TESTER"
    state: "needs_rework"
    note: "Focused ODT tests pass (3 files, 20 tests); full npm run verify fails coverage: branches 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass."
  -
    type: "verify"
    at: "2026-09-15T06:48:32.597Z"
    author: "TESTER"
    state: "needs_rework"
    note: "Focused ODT tests pass (3 files, 20 tests); full npm run verify still fails branch coverage 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass."
  -
    type: "verify"
    at: "2026-09-15T06:52:30.240Z"
    author: "TESTER"
    state: "blocked_external"
    note: "Focused ODT tests pass (3 files, 20 tests); full npm run verify reaches check:file-size then fails because odt-roundtrip.test.ts is 1069 lines (limit <1000). Coverage 100%, inventory 84/84, E2E 9/9, static/docs pass; doctor and routing pass."
  -
    type: "verify"
    at: "2026-09-15T06:59:05.271Z"
    author: "TESTER"
    state: "blocked_external"
    note: "Focused ODT tests pass (3 files, 20 tests); full npm run verify passes unit 286/286 at 100%, inventory 84/84 at 100%, E2E 9/9 and static, then fails check:docs on four undocumented callbacks in odt-font-style-roundtrip.test.ts. Doctor and routing pass."
  -
    type: "verify"
    at: "2026-09-15T07:04:30.395Z"
    author: "TESTER"
    state: "ok"
    note: "All Verify Steps pass: focused ODT 3 files/20 tests; full npm run verify passes unit 59 files/286 tests at 100%, inventory 32 files/84 tests at 100%, E2E 9/9, static/docs/file-size/source-tree/provenance/parity; ap doctor OK with one pre-existing F1JT8K warning; policy routing OK; status contains only task README plus four intentional code/test files."
  -
    type: "status"
    at: "2026-09-15T07:05:44.649Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-15T07:06:54.117Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150628-8AX7HA"
  -
    type: "verify"
    at: "2026-09-15T07:17:20.483Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150628-8AX7HA"
doc_version: 3
doc_updated_at: "2026-09-15T07:17:20.600Z"
doc_updated_by: "CODER"
description: "Compare the bounded Writer ODT style import and export paths with pinned LibreOffice 26.8.0.2, accept upstream-valid Title parent-style relationships, emit canonical ODF parent style names, and add import/export round-trip regressions."
sections:
  Summary: "Restore LibreOffice-compatible ODT handling for the built-in Title paragraph style so LibreOffice-saved documents open without an invalid-parent error and exported packages use the same canonical ODF style relationships as the pinned upstream baseline."
  Scope: "Compare the current xmloff/sw import and export behavior with the pinned LibreOffice 26.8.0.2 source at vendor/libreoffice-reference. Modify only the bounded Writer ODT style paths and their focused tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts, apps/office/src/xmloff/source/text/txtparae.ts, apps/office/src/xmloff/source/text/txtpara.test.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts (plus an existing directly related ODT style test only if needed). Preserve the current module boundaries, parser resource limits, unsupported-feature failures, and unrelated style semantics. Do not use network access or alter the pre-existing change in .agentplane/tasks/202609150610-6YSBSR/README.md."
  Plan: "1. Inspect the pinned LibreOffice xmloff/sw style import and export implementations and record the precise Title parent-style behavior relevant to the failing LibreOffice document. 2. Align named paragraph-style import validation with upstream: import valid declared ODF relationships without enforcing a project-invented built-in Title hierarchy, while preserving family validation, style application, and bounded failure behavior. 3. Align automatic paragraph-style export with upstream ODF naming by resolving internal Writer style IDs to canonical ODF style names before writing style:parent-style-name. 4. Add focused regressions for LibreOffice Title variants, canonical exported parent names, and package-level export-to-import round-trip. 5. Run the declared targeted and full verification commands and record exact evidence."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused ODF text-style export and Writer package import/export tests pass, including LibreOffice-valid Title parent variants, canonical Title parent-style-name output, and ODT export-to-import round-trip without the invalid-parent error.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, unit and inventory coverage, browser E2E/static checks, documentation, file-size, source-tree/provenance, and parity checks all pass.
    3. Run: ap doctor. Expected: Agentplane repository health checks pass, allowing only clearly identified pre-existing warnings unrelated to this task.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
    5. Run: git status --short --untracked-files=all. Expected: only intentional task/code/test changes and the preserved pre-existing .agentplane/tasks/202609150610-6YSBSR/README.md modification are present; no unrelated artifacts exist.
  Verification: |-
    Pending execution by CODER/verification owner. Record each declared command with Result, Evidence, and Scope; record any approved skip with Reason, Risk, and Approval.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T06:40:25.499Z — VERIFY — needs_rework

    By: TESTER

    Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify fails at format:check for apps/office/src/sw/source/filter/xml/xmlimp.ts. ap doctor and policy routing pass.
    Attempts: 1

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:30:59.734Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150628-8AX7HA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T06:45:38.585Z — VERIFY — needs_rework

    By: TESTER

    Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify fails coverage: branches 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass.
    Attempts: 2

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:40:25.579Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150628-8AX7HA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T06:48:32.597Z — VERIFY — needs_rework

    By: TESTER

    Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify still fails branch coverage 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass.
    Attempts: 3

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:45:38.666Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150628-8AX7HA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T06:52:30.240Z — VERIFY — blocked_external

    By: TESTER

    Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify reaches check:file-size then fails because odt-roundtrip.test.ts is 1069 lines (limit <1000). Coverage 100%, inventory 84/84, E2E 9/9, static/docs pass; doctor and routing pass.
    Attempts: 4

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:48:32.680Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150628-8AX7HA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T06:59:05.271Z — VERIFY — blocked_external

    By: TESTER

    Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify passes unit 286/286 at 100%, inventory 84/84 at 100%, E2E 9/9 and static, then fails check:docs on four undocumented callbacks in odt-font-style-roundtrip.test.ts. Doctor and routing pass.
    Attempts: 5

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:52:30.334Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task start-ready 202609150628-8AX7HA --author CODER --body Start: continue direct-mode task in current checkout.
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T07:04:30.395Z — VERIFY — ok

    By: TESTER

    Note: All Verify Steps pass: focused ODT 3 files/20 tests; full npm run verify passes unit 59 files/286 tests at 100%, inventory 32 files/84 tests at 100%, E2E 9/9, static/docs/file-size/source-tree/provenance/parity; ap doctor OK with one pre-existing F1JT8K warning; policy routing OK; status contains only task README plus four intentional code/test files.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:59:05.363Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task start-ready 202609150628-8AX7HA --author CODER --body Start: continue direct-mode task in current checkout.
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T07:06:54.117Z — VERIFY — ok

    By: CODER

    Note: verified-202609150628-8AX7HA
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:05:44.649Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150628-8AX7HA --result verified-202609150628-8AX7HA --commit 61f751f5074cde7f689bd15cd8399c4ef78498ea
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T07:17:20.483Z — VERIFY — ok

    By: CODER

    Note: verified-202609150628-8AX7HA
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:06:54.197Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
    - old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150628-8AX7HA --result verified-202609150628-8AX7HA --commit 30c15b0a6a036a0e0cd623eeac3f609039022f4b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the importer validation, exporter ODF-name resolution, focused regression tests, and this task record introduced by the task. No migration, package-format version change, external write, or persistent user-data transformation is planned."
  Findings: |-
    Planning finding: the current importer compares every present built-in style against the local pool parent, and the automatic-style exporter writes an internal style ID directly as style:parent-style-name. Execution must confirm the corresponding pinned LibreOffice xmloff/sw behavior before editing and keep any additional observations task-local.

    - Observation: npm run verify exits 1: Prettier reports code style issues in apps/office/src/sw/source/filter/xml/xmlimp.ts.
      Impact: Required full verification gate is not green; task cannot be finished.
      Resolution: Format xmlimp.ts with the repository Prettier configuration, then rerun all declared Verify Steps.

    - Observation: The Title styleName regression changed branch coverage; legacy heading-1 fallback at apps/office/src/xmloff/source/text/txtparae.ts:477 is now uncovered.
      Impact: Global 100% branch coverage gate fails, so the required full verification is not green.
      Resolution: Add a focused export assertion exercising the heading-1 fallback without styleName, then rerun every declared Verify Step.

    - Observation: The added heading-1 case covers the true branch at line 477, but the arbitrary legacy style fallback remains uncovered because the former style=title case now supplies styleName=Title.
      Impact: Required global 100% branch coverage gate remains red.
      Resolution: Exercise a non-default, non-heading legacy style without styleName (for example style=title in a separate paragraph/call), assert its unchanged ODF parent name, and rerun all Verify Steps.

    - Observation: The 75-line Title parent regression pushes apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts above the enforced 1,000-line authored-file limit.
      Impact: Required full verification remains red despite all executed behavioral and coverage checks passing.
      Resolution: Decompose the package-level tests into an appropriately named test file while keeping the Title parent regression in the declared focused verification surface, then rerun all Verify Steps.

    - Observation: JSDoc validation reports missing function documentation at odt-font-style-roundtrip.test.ts lines 39, 44, 68, and 76.
      Impact: Required documentation gate is red; later file-size/source/provenance/parity stages were not reached.
      Resolution: Add repository-conforming JSDoc to replaceTitleParent and the three rewrite callbacks, restore the unrelated omitted meta argument in odt-roundtrip.test.ts if accidental, then rerun all Verify Steps.
id_source: "generated"
---
## Summary

Restore LibreOffice-compatible ODT handling for the built-in Title paragraph style so LibreOffice-saved documents open without an invalid-parent error and exported packages use the same canonical ODF style relationships as the pinned upstream baseline.

## Scope

Compare the current xmloff/sw import and export behavior with the pinned LibreOffice 26.8.0.2 source at vendor/libreoffice-reference. Modify only the bounded Writer ODT style paths and their focused tests, expected in apps/office/src/sw/source/filter/xml/xmlimp.ts, apps/office/src/xmloff/source/text/txtparae.ts, apps/office/src/xmloff/source/text/txtpara.test.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts (plus an existing directly related ODT style test only if needed). Preserve the current module boundaries, parser resource limits, unsupported-feature failures, and unrelated style semantics. Do not use network access or alter the pre-existing change in .agentplane/tasks/202609150610-6YSBSR/README.md.

## Plan

1. Inspect the pinned LibreOffice xmloff/sw style import and export implementations and record the precise Title parent-style behavior relevant to the failing LibreOffice document. 2. Align named paragraph-style import validation with upstream: import valid declared ODF relationships without enforcing a project-invented built-in Title hierarchy, while preserving family validation, style application, and bounded failure behavior. 3. Align automatic paragraph-style export with upstream ODF naming by resolving internal Writer style IDs to canonical ODF style names before writing style:parent-style-name. 4. Add focused regressions for LibreOffice Title variants, canonical exported parent names, and package-level export-to-import round-trip. 5. Run the declared targeted and full verification commands and record exact evidence.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/text/txtpara.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts src/sw/source/filter/xml/odt-font-style-roundtrip.test.ts. Expected: focused ODF text-style export and Writer package import/export tests pass, including LibreOffice-valid Title parent variants, canonical Title parent-style-name output, and ODT export-to-import round-trip without the invalid-parent error.
2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, unit and inventory coverage, browser E2E/static checks, documentation, file-size, source-tree/provenance, and parity checks all pass.
3. Run: ap doctor. Expected: Agentplane repository health checks pass, allowing only clearly identified pre-existing warnings unrelated to this task.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
5. Run: git status --short --untracked-files=all. Expected: only intentional task/code/test changes and the preserved pre-existing .agentplane/tasks/202609150610-6YSBSR/README.md modification are present; no unrelated artifacts exist.

## Verification

Pending execution by CODER/verification owner. Record each declared command with Result, Evidence, and Scope; record any approved skip with Reason, Risk, and Approval.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T06:40:25.499Z — VERIFY — needs_rework

By: TESTER

Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify fails at format:check for apps/office/src/sw/source/filter/xml/xmlimp.ts. ap doctor and policy routing pass.
Attempts: 1

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:30:59.734Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150628-8AX7HA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T06:45:38.585Z — VERIFY — needs_rework

By: TESTER

Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify fails coverage: branches 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass.
Attempts: 2

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:40:25.579Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150628-8AX7HA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T06:48:32.597Z — VERIFY — needs_rework

By: TESTER

Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify still fails branch coverage 99.97% (3452/3453), uncovered txtparae.ts:477. Doctor and routing pass.
Attempts: 3

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:45:38.666Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150628-8AX7HA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T06:52:30.240Z — VERIFY — blocked_external

By: TESTER

Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify reaches check:file-size then fails because odt-roundtrip.test.ts is 1069 lines (limit <1000). Coverage 100%, inventory 84/84, E2E 9/9, static/docs pass; doctor and routing pass.
Attempts: 4

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:48:32.680Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150628-8AX7HA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T06:59:05.271Z — VERIFY — blocked_external

By: TESTER

Note: Focused ODT tests pass (3 files, 20 tests); full npm run verify passes unit 286/286 at 100%, inventory 84/84 at 100%, E2E 9/9 and static, then fails check:docs on four undocumented callbacks in odt-font-style-roundtrip.test.ts. Doctor and routing pass.
Attempts: 5

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:52:30.334Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task start-ready 202609150628-8AX7HA --author CODER --body Start: continue direct-mode task in current checkout.
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T07:04:30.395Z — VERIFY — ok

By: TESTER

Note: All Verify Steps pass: focused ODT 3 files/20 tests; full npm run verify passes unit 59 files/286 tests at 100%, inventory 32 files/84 tests at 100%, E2E 9/9, static/docs/file-size/source-tree/provenance/parity; ap doctor OK with one pre-existing F1JT8K warning; policy routing OK; status contains only task README plus four intentional code/test files.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T06:59:05.363Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task start-ready 202609150628-8AX7HA --author CODER --body Start: continue direct-mode task in current checkout.
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T07:06:54.117Z — VERIFY — ok

By: CODER

Note: verified-202609150628-8AX7HA
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:05:44.649Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150628-8AX7HA --result verified-202609150628-8AX7HA --commit 61f751f5074cde7f689bd15cd8399c4ef78498ea
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T07:17:20.483Z — VERIFY — ok

By: CODER

Note: verified-202609150628-8AX7HA
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T07:06:54.197Z, excerpt_hash=sha256:a5ad8c4a032c0507cc6e37edee0bd0c277f117937095abd2af3bcef473959af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150628-8AX7HA/blueprint/resolved-snapshot.json
- old_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- current_digest: d78b888232cfba4b3d653e295cd1f85528a1a0bb10e80d8699619678526bbdbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150628-8AX7HA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150628-8AX7HA --result verified-202609150628-8AX7HA --commit 30c15b0a6a036a0e0cd623eeac3f609039022f4b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the importer validation, exporter ODF-name resolution, focused regression tests, and this task record introduced by the task. No migration, package-format version change, external write, or persistent user-data transformation is planned.

## Findings

Planning finding: the current importer compares every present built-in style against the local pool parent, and the automatic-style exporter writes an internal style ID directly as style:parent-style-name. Execution must confirm the corresponding pinned LibreOffice xmloff/sw behavior before editing and keep any additional observations task-local.

- Observation: npm run verify exits 1: Prettier reports code style issues in apps/office/src/sw/source/filter/xml/xmlimp.ts.
  Impact: Required full verification gate is not green; task cannot be finished.
  Resolution: Format xmlimp.ts with the repository Prettier configuration, then rerun all declared Verify Steps.

- Observation: The Title styleName regression changed branch coverage; legacy heading-1 fallback at apps/office/src/xmloff/source/text/txtparae.ts:477 is now uncovered.
  Impact: Global 100% branch coverage gate fails, so the required full verification is not green.
  Resolution: Add a focused export assertion exercising the heading-1 fallback without styleName, then rerun every declared Verify Step.

- Observation: The added heading-1 case covers the true branch at line 477, but the arbitrary legacy style fallback remains uncovered because the former style=title case now supplies styleName=Title.
  Impact: Required global 100% branch coverage gate remains red.
  Resolution: Exercise a non-default, non-heading legacy style without styleName (for example style=title in a separate paragraph/call), assert its unchanged ODF parent name, and rerun all Verify Steps.

- Observation: The 75-line Title parent regression pushes apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts above the enforced 1,000-line authored-file limit.
  Impact: Required full verification remains red despite all executed behavioral and coverage checks passing.
  Resolution: Decompose the package-level tests into an appropriately named test file while keeping the Title parent regression in the declared focused verification surface, then rerun all Verify Steps.

- Observation: JSDoc validation reports missing function documentation at odt-font-style-roundtrip.test.ts lines 39, 44, 68, and 76.
  Impact: Required documentation gate is red; later file-size/source/provenance/parity stages were not reached.
  Resolution: Add repository-conforming JSDoc to replaceTitleParent and the three rewrite callbacks, restore the unrelated omitted meta argument in odt-roundtrip.test.ts if accidental, then rerun all Verify Steps.
