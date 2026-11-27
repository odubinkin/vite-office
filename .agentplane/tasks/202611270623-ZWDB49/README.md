---
id: "202611270623-ZWDB49"
title: "Align Writer ODT list rule overrides and numbered paragraphs"
result_summary: "Writer preserves numbered paragraphs and per-item list-rule overrides through native ODT ownership."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:24:28.762Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:08:55.340Z"
  updated_by: "CODER"
  note: "61 existing and new targeted Writer cases and 2 shared cases pass after replaying two resource timeouts. All static, provenance and scoped registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:08:57.554Z"
  updated_by: "EVALUATOR"
  note: "Writer retains native list identities and item rule overrides through ODT and the Worker."
  evaluated_sha: "d3e2478eeedbde82577931c02554f3a7630cee5c"
  blueprint_digest: "2b1210076b25a02c9a4cb6bdb53b17a5e4a22ed75a8f36eb3387c129dace9129"
  evidence_refs:
    - ".agentplane/tasks/202611270623-ZWDB49/README.md"
    - ".agentplane/tasks/202611270623-ZWDB49/quality/20261127-070857554-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270623-ZWDB49/quality/20261127-070857554-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270623-ZWDB49/quality/20261127-070857554-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270623-ZWDB49/blueprint/resolved-snapshot.json"
    - "output/playwright/ZWDB49/verification.md"
    - "3858bb8c89d64b6910f2f99f0854aec81fe36c5d"
  findings:
    - "Scoped Writer and shared cases passed. The original UNO restart setter, fallback list rule creation, and randomized list IDs support the end-to-end ODT behavior."
commit:
  hash: "d3e2478eeedbde82577931c02554f3a7630cee5c"
  message: "🐛 F36CFN calc: retain numeric durations and portable external paths"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: 61 scoped Writer tests and two shared list-context tests passed. Implementation: 3858bb8c89d64b6910f2f99f0854aec81fe36c5d."
events:
  -
    type: "status"
    at: "2026-11-27T06:26:23.318Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:08:55.340Z"
    author: "CODER"
    state: "ok"
    note: "61 existing and new targeted Writer cases and 2 shared cases pass after replaying two resource timeouts. All static, provenance and scoped registry checks passed."
  -
    type: "status"
    at: "2026-11-27T07:11:10.739Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 61 scoped Writer tests and two shared list-context tests passed. Implementation: 3858bb8c89d64b6910f2f99f0854aec81fe36c5d."
doc_version: 3
doc_updated_at: "2026-11-27T07:11:10.739Z"
doc_updated_by: "CODER"
description: "Import native numbered paragraph contexts and per-item rule overrides; export alternate rules within one native list identity using text:style-override, following pinned LibreOffice list ownership, default rule formats and context transitions."
sections:
  Summary: "Bring Writer ODT numbered paragraphs and item rule overrides through the existing native list-rule and list-identity owners."
  Scope: "Shared XML text list contexts, numbering-rule resolution and defaults, Writer native list bindings consumed by import, and ODT export list-style transitions. Include corresponding registry provenance and focused existing list tests. Remain within Writer's represented text locations, UNO rule properties and browser model. The import-only numbered-paragraph spelling should save as the native text:list form."
  Plan: "Port native ODT numbered-paragraph ownership and per-item list-style overrides through import and export, then run focused list and registry verification."
  Verify Steps: |-
    - Run existing Writer ODT list and native Writer API suites, and check a package containing numbered paragraphs and alternate item rules.
    - Run Office typecheck, changed-file ESLint and Prettier, dependencies, provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: |-
    Pending verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:08:55.340Z — VERIFY — ok

    By: CODER

    Note: 61 existing and new targeted Writer cases and 2 shared cases pass after replaying two resource timeouts. All static, provenance and scoped registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:26:23.318Z, excerpt_hash=sha256:e1138a46f49d49bf79043b3a08668640cb910594a6c4524d035c562055cb8bbe

    Details:

    # Native Writer ODT list-rule overrides and numbered paragraphs
    - Command: `npm run test:writer -- odt-list- odt-table-cell-lists odt-roundtrip native-odt-writer-api native-import-api-states native-list-ownership --maxWorkers=2 --testTimeout=120000`.
      - Result: 59 passed and two exceeded the run's time limit. No assertion failures.
      - Scope: existing scoped Writer ODT list tests, actual Writer import API and native list owners.
    - Command: `npm run test:writer -- odt-list-continuation odt-list-start-normalization --maxWorkers=1 --testTimeout=600000`.
      - Result: pass.
      - Evidence: five passing tests include both timed-out cases. All 61 unique Writer cases passed across the focused run and replay.
    - Command: `npm run test:shared --workspace @vite-office/office -- XMLTextListBlockContext txtimp.test txtparai.test --maxWorkers=2 --testTimeout=120000`.
      - Result: pass.
      - Evidence: two shared list-context cases.
    - Commands: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`; changed-file ESLint and Prettier; `npm run check:dependencies`; `npm run check:source-provenance`; `npm run inventory:invariants -- --scope writer`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
      - Result: pass.
      - Evidence: global provenance for 3141 modules and zero semantic inventory violations.

    The focused ODT case covers source list IDs and alternate rules, the Writer restart setter, native default bullet text and style, Worker transfer and ODT reopen. Independent opens compare ownership of generated list IDs, while Worker checks still compare those IDs directly. Browser list ID generation follows the ordinary upstream unsigned32 random branch. The environment-selected native one-way-stable export variant is not exposed in the browser.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270623-ZWDB49/blueprint/resolved-snapshot.json
    - old_digest: 2b1210076b25a02c9a4cb6bdb53b17a5e4a22ed75a8f36eb3387c129dace9129
    - current_digest: 2b1210076b25a02c9a4cb6bdb53b17a5e4a22ed75a8f36eb3387c129dace9129
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270623-ZWDB49

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270623-ZWDB49
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's implementation commits and their evidence records."
  Findings: "LibreOffice resolves a numbered paragraph using the same native rule pipeline and exports list paragraphs via text:list. Native per-item override export compares the active rule to the open list-level style while testing membership independently by list ID."
id_source: "generated"
---
## Summary

Bring Writer ODT numbered paragraphs and item rule overrides through the existing native list-rule and list-identity owners.

## Scope

Shared XML text list contexts, numbering-rule resolution and defaults, Writer native list bindings consumed by import, and ODT export list-style transitions. Include corresponding registry provenance and focused existing list tests. Remain within Writer's represented text locations, UNO rule properties and browser model. The import-only numbered-paragraph spelling should save as the native text:list form.

## Plan

Port native ODT numbered-paragraph ownership and per-item list-style overrides through import and export, then run focused list and registry verification.

## Verify Steps

- Run existing Writer ODT list and native Writer API suites, and check a package containing numbered paragraphs and alternate item rules.
- Run Office typecheck, changed-file ESLint and Prettier, dependencies, provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:08:55.340Z — VERIFY — ok

By: CODER

Note: 61 existing and new targeted Writer cases and 2 shared cases pass after replaying two resource timeouts. All static, provenance and scoped registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:26:23.318Z, excerpt_hash=sha256:e1138a46f49d49bf79043b3a08668640cb910594a6c4524d035c562055cb8bbe

Details:

# Native Writer ODT list-rule overrides and numbered paragraphs
- Command: `npm run test:writer -- odt-list- odt-table-cell-lists odt-roundtrip native-odt-writer-api native-import-api-states native-list-ownership --maxWorkers=2 --testTimeout=120000`.
  - Result: 59 passed and two exceeded the run's time limit. No assertion failures.
  - Scope: existing scoped Writer ODT list tests, actual Writer import API and native list owners.
- Command: `npm run test:writer -- odt-list-continuation odt-list-start-normalization --maxWorkers=1 --testTimeout=600000`.
  - Result: pass.
  - Evidence: five passing tests include both timed-out cases. All 61 unique Writer cases passed across the focused run and replay.
- Command: `npm run test:shared --workspace @vite-office/office -- XMLTextListBlockContext txtimp.test txtparai.test --maxWorkers=2 --testTimeout=120000`.
  - Result: pass.
  - Evidence: two shared list-context cases.
- Commands: `npm run typecheck --workspace @vite-office/office -- --singleThreaded --checkers 1 --incremental --tsBuildInfoFile ../../output/playwright/ods-odt-office.tsbuildinfo`; changed-file ESLint and Prettier; `npm run check:dependencies`; `npm run check:source-provenance`; `npm run inventory:invariants -- --scope writer`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
  - Result: pass.
  - Evidence: global provenance for 3141 modules and zero semantic inventory violations.

The focused ODT case covers source list IDs and alternate rules, the Writer restart setter, native default bullet text and style, Worker transfer and ODT reopen. Independent opens compare ownership of generated list IDs, while Worker checks still compare those IDs directly. Browser list ID generation follows the ordinary upstream unsigned32 random branch. The environment-selected native one-way-stable export variant is not exposed in the browser.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270623-ZWDB49/blueprint/resolved-snapshot.json
- old_digest: 2b1210076b25a02c9a4cb6bdb53b17a5e4a22ed75a8f36eb3387c129dace9129
- current_digest: 2b1210076b25a02c9a4cb6bdb53b17a5e4a22ed75a8f36eb3387c129dace9129
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270623-ZWDB49

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270623-ZWDB49
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's implementation commits and their evidence records.

## Findings

LibreOffice resolves a numbered paragraph using the same native rule pipeline and exports list paragraphs via text:list. Native per-item override export compares the active rule to the open list-level style while testing membership independently by list ID.
