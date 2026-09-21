---
id: "202609211630-YQECPS"
title: "Fix reviewed Writer P1 parity gaps"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-21T16:31:12.786Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T17:09:37.911Z"
  updated_by: "CODER"
  note: "verified-202609211630-YQECPS"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T17:09:23.222Z"
  updated_by: "EVALUATOR"
  note: "Writer P1 review gaps are corrected with atomic lifecycle preparation, implemented ODF list restarts, narrower run/paste ownership, and synchronized parity evidence."
  evaluated_sha: "3e17c83be147a57398eb8415890a3bf2583f7107"
  blueprint_digest: "c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830"
  evidence_refs:
    - ".agentplane/tasks/202609211630-YQECPS/README.md"
    - ".agentplane/tasks/202609211630-YQECPS/quality/20260921-170923222-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609211630-YQECPS/quality/20260921-170923222-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609211630-YQECPS/quality/20260921-170923222-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609211630-YQECPS/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Replacement validation precedes active graph disposal; text:start-value round-trips through Writer restart items; SwTextNode no longer exposes run DTO conversion/projection APIs; paste orchestration is separated; capability and provenance manifests are consistent."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved Writer P1 corrections with atomic lifecycle replacement, ODF restart round trips, ownership decomposition, and truthful parity evidence."
events:
  -
    type: "status"
    at: "2026-09-21T16:31:20.219Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer P1 corrections with atomic lifecycle replacement, ODF restart round trips, ownership decomposition, and truthful parity evidence."
  -
    type: "verify"
    at: "2026-09-21T17:09:10.786Z"
    author: "CODER"
    state: "ok"
    note: "Focused Writer checks passed (49 tests); npm run verify passed with 354 unit and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariants/parity checks; ap doctor and policy routing passed."
  -
    type: "verify"
    at: "2026-09-21T17:09:37.911Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609211630-YQECPS"
doc_version: 3
doc_updated_at: "2026-09-21T17:09:37.992Z"
doc_updated_by: "CODER"
description: "Fix the four reviewed P1 discrepancies: atomic document replacement rollback, implemented ODF list restart import/export, completion of Writer shell/text-run responsibility separation, and truthful atomic ODT inventory metadata."
sections:
  Summary: "Correct the independently reviewed Writer P1 gaps while preserving the current bounded browser feature set and pinned LibreOffice ownership model."
  Scope: "In scope: atomic SwDocShell document replacement and rollback tests; ODF text:start-value import/export and list restart round trips; removal of browser run DTO conversion/projection ownership from canonical SwTextNode and reduction of SwWrtShell catch-all responsibilities; atomic and truthful ODT parity/inventory records including meta.xml semantics; relevant architecture checks and documentation. Out of scope: new Writer features, legacy storage migrations, networking, publication, unrelated UI changes."
  Plan: "1. Validate replacement inputs before disposing the active Writer graph and cover invalid lifecycle/medium rollback. 2. Map ODF text:start-value to Writer restart state on import and emit it on export, with model/filter/worker/storage round-trip tests. 3. Move run DTO conversion and paste-specific orchestration to boundary helpers/shell responsibility files without behavior changes. 4. Split or correct ODT capability and runtime inventory claims. 5. Run focused tests and the complete repository verification contract."
  Verify Steps: |-
    - npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts
    - npm run check:dependencies
    - npm run inventory:parity
    - npm run verify
    - ap doctor
    - node .agentplane/policy/check-routing.mjs
  Verification: |-
    Command: `npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts`
    Result: pass.
    Evidence: 5 files, 49 tests passed.
    Scope: atomic replacement, ODF restart import/export, numbering, paste/shell behavior.

    Command: `npm run check:dependencies`
    Result: pass.
    Evidence: 147 runtime sources and 530 relative imports validated.
    Scope: module ownership boundaries.

    Command: `npm run inventory:parity`
    Result: pass.
    Evidence: 45 implemented records, 0 exceptions; parityReady remains false for 14 declared upstream-evidence gaps.
    Scope: capability and runtime inventory consistency.

    Command: `npm run verify`
    Result: pass.
    Evidence: 354 unit tests and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariant checks passed.
    Scope: complete repository verification contract.

    Command: `ap doctor`
    Result: pass.
    Evidence: doctor OK; one pre-existing DONE-task commit warning and informational hook fallback only.
    Scope: Agentplane workspace health.

    Command: `node .agentplane/policy/check-routing.mjs`
    Result: pass.
    Evidence: policy routing OK.
    Scope: repository policy graph.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T17:09:10.786Z — VERIFY — ok

    By: CODER

    Note: Focused Writer checks passed (49 tests); npm run verify passed with 354 unit and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariants/parity checks; ap doctor and policy routing passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:08:21.750Z, excerpt_hash=sha256:9dbc63be955454c556ad284a15c0a2d394745c6832fdeef457d8abbf806a4031

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211630-YQECPS/blueprint/resolved-snapshot.json
    - old_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
    - current_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211630-YQECPS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609211630-YQECPS
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-21T17:09:37.911Z — VERIFY — ok

    By: CODER

    Note: verified-202609211630-YQECPS
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:09:10.867Z, excerpt_hash=sha256:9dbc63be955454c556ad284a15c0a2d394745c6832fdeef457d8abbf806a4031

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211630-YQECPS/blueprint/resolved-snapshot.json
    - old_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
    - current_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609211630-YQECPS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609211630-YQECPS --result verified-202609211630-YQECPS --commit 3e17c83be147a57398eb8415890a3bf2583f7107
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits attributed to task 202609211630-YQECPS; storage/worker schema versions are unchanged unless implementation proves a version bump is required."
  Findings: "Initial review identified four repo-fixable gaps: non-atomic replacement, missing ODF restart serialization, incomplete shell/text-run responsibility separation, and contradictory ODT inventory claims."
id_source: "generated"
---
## Summary

Correct the independently reviewed Writer P1 gaps while preserving the current bounded browser feature set and pinned LibreOffice ownership model.

## Scope

In scope: atomic SwDocShell document replacement and rollback tests; ODF text:start-value import/export and list restart round trips; removal of browser run DTO conversion/projection ownership from canonical SwTextNode and reduction of SwWrtShell catch-all responsibilities; atomic and truthful ODT parity/inventory records including meta.xml semantics; relevant architecture checks and documentation. Out of scope: new Writer features, legacy storage migrations, networking, publication, unrelated UI changes.

## Plan

1. Validate replacement inputs before disposing the active Writer graph and cover invalid lifecycle/medium rollback. 2. Map ODF text:start-value to Writer restart state on import and emit it on export, with model/filter/worker/storage round-trip tests. 3. Move run DTO conversion and paste-specific orchestration to boundary helpers/shell responsibility files without behavior changes. 4. Split or correct ODT capability and runtime inventory claims. 5. Run focused tests and the complete repository verification contract.

## Verify Steps

- npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts
- npm run check:dependencies
- npm run inventory:parity
- npm run verify
- ap doctor
- node .agentplane/policy/check-routing.mjs

## Verification

Command: `npx vitest run apps/office/src/sw/source/uibase/app/docsh.test.ts apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts apps/office/src/xmloff/source/text/txtpara.test.ts apps/office/src/sw/source/core/doc/number.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts`
Result: pass.
Evidence: 5 files, 49 tests passed.
Scope: atomic replacement, ODF restart import/export, numbering, paste/shell behavior.

Command: `npm run check:dependencies`
Result: pass.
Evidence: 147 runtime sources and 530 relative imports validated.
Scope: module ownership boundaries.

Command: `npm run inventory:parity`
Result: pass.
Evidence: 45 implemented records, 0 exceptions; parityReady remains false for 14 declared upstream-evidence gaps.
Scope: capability and runtime inventory consistency.

Command: `npm run verify`
Result: pass.
Evidence: 354 unit tests and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariant checks passed.
Scope: complete repository verification contract.

Command: `ap doctor`
Result: pass.
Evidence: doctor OK; one pre-existing DONE-task commit warning and informational hook fallback only.
Scope: Agentplane workspace health.

Command: `node .agentplane/policy/check-routing.mjs`
Result: pass.
Evidence: policy routing OK.
Scope: repository policy graph.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T17:09:10.786Z — VERIFY — ok

By: CODER

Note: Focused Writer checks passed (49 tests); npm run verify passed with 354 unit and 96 inventory tests at 100% coverage, 11 e2e tests, build/static/docs/provenance/invariants/parity checks; ap doctor and policy routing passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:08:21.750Z, excerpt_hash=sha256:9dbc63be955454c556ad284a15c0a2d394745c6832fdeef457d8abbf806a4031

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211630-YQECPS/blueprint/resolved-snapshot.json
- old_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
- current_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211630-YQECPS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609211630-YQECPS
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-21T17:09:37.911Z — VERIFY — ok

By: CODER

Note: verified-202609211630-YQECPS
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T17:09:10.867Z, excerpt_hash=sha256:9dbc63be955454c556ad284a15c0a2d394745c6832fdeef457d8abbf806a4031

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609211630-YQECPS/blueprint/resolved-snapshot.json
- old_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
- current_digest: c7b870ecb06de390a15f2f604f3625dfeb3fdd4434a5bdd191792b0848994830
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609211630-YQECPS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609211630-YQECPS --result verified-202609211630-YQECPS --commit 3e17c83be147a57398eb8415890a3bf2583f7107
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits attributed to task 202609211630-YQECPS; storage/worker schema versions are unchanged unless implementation proves a version bump is required.

## Findings

Initial review identified four repo-fixable gaps: non-atomic replacement, missing ODF restart serialization, incomplete shell/text-run responsibility separation, and contradictory ODT inventory claims.
