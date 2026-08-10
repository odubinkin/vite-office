---
id: "202608100830-MT7ETT"
title: "Create deterministic LibreOffice inventory contracts and baseline validator"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202608100814-2TT1YA"
tags:
  - "inventory"
  - "libreoffice"
  - "typescript"
task_kind: "code"
mutation_scope: "code"
risk_flags:
  - "network"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T08:31:53.224Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
verification:
  state: "ok"
  updated_at: "2026-08-10T08:50:41.794Z"
  updated_by: "CODER"
  note: "Verified deterministic inventory validation, exact live corpus floors, 100% inventory coverage, full project verification, and documentation/ignore boundaries."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-10T08:50:48.815Z"
  updated_by: "EVALUATOR"
  note: "The validator creates a small, typed, fully tested and deterministic acquisition gate without copying upstream content or overstating parity."
  evaluated_sha: "df842527df437d51ba156b2db6d2fd7f5a5c2180"
  blueprint_digest: "5880600641ef3f922bc18434a3abfdde18edfb5d7366fea793b94524ec6ec43a"
  evidence_refs:
    - ".agentplane/tasks/202608100830-MT7ETT/README.md"
    - ".agentplane/tasks/202608100830-MT7ETT/quality/20260810-085048815-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608100830-MT7ETT/quality/20260810-085048815-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608100830-MT7ETT/quality/20260810-085048815-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608100830-MT7ETT/blueprint/resolved-snapshot.json"
    - "scripts/libreoffice-inventory/"
    - "docs/program/inventory-contract.md"
    - "package.json"
    - "npm run verify: passed"
  findings:
    - "Reviewed manifest parsing, path-containment check, Git identity/provenance/cleanliness checks, exact corpus category floors, canonical report sorting, command wiring, and task documentation against the live pinned checkout."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved typed inventory contract with deterministic validation evidence, without runners or upstream copying."
events:
  -
    type: "status"
    at: "2026-08-10T08:32:02.231Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved typed inventory contract with deterministic validation evidence, without runners or upstream copying."
  -
    type: "verify"
    at: "2026-08-10T08:50:41.794Z"
    author: "CODER"
    state: "ok"
    note: "Verified deterministic inventory validation, exact live corpus floors, 100% inventory coverage, full project verification, and documentation/ignore boundaries."
doc_version: 3
doc_updated_at: "2026-08-10T08:50:41.888Z"
doc_updated_by: "CODER"
description: "Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity."
sections:
  Summary: |-
    Create deterministic LibreOffice inventory contracts and baseline validator

    Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity.
  Scope: |-
    In scope:
    - Add a Node-side TypeScript inventory package under scripts/libreoffice-inventory with strict manifest parsing, a Git adapter, exact identity and acquisition-floor validation, deterministic JSON reporting, and a documented CLI.
    - Add 100% covered unit tests for all new executable branches, plus a live validation of the ignored pinned checkout.
    - Integrate targeted inventory commands into the repository quality scripts and extend JSDoc enforcement to every new TypeScript file.
    - Document the inventory contract and update the program roadmap without advancing any LibreOffice parity status.

    Out of scope:
    - Generating the complete source/test/help/translation/dictionary item inventory; that follows in bounded atomic inventory tasks.
    - Copying, adapting, licensing, or redistributing any upstream corpus file.
    - Implementing an end-user office feature, changing the static browser application, or claiming coverage/parity completion.
  Plan: |-
    1. Specify the versioned baseline-contract types, validation errors, deterministic report shape, and CLI boundary.
    2. Implement the small TypeScript modules, 100%-coverage unit tests, typed toolchain command, and documentation enforcement integration.
    3. Validate against both controlled test doubles and the four live ignored LibreOffice repositories; write the contract documentation and roadmap handoff.
    4. Run targeted and full quality gates, persist evidence, obtain an evaluator review, and close with traceable commits.
  Verify Steps: |-
    1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — all new TypeScript modules, JSDoc enforcement, linting, and size policy pass.
    2. npm run test:inventory:coverage — unit tests cover every branch, function, line, and statement in scripts/libreoffice-inventory at 100%.
    3. npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference — validates every live core/dictionaries/helpcontent2/translations origin, annotated tag object, commit, shallow/clean state, exact tracked-file acquisition floor, 2,746 XHP topics, 25,699 PO catalogs, and 131 locales; stdout parses as deterministic JSON.
    4. Run the command in step 3 twice and byte-compare canonical output — the inventory report is stable for unchanged input.
    5. npm run verify — the existing static-app build, unit/E2E/accessibility, docs, and size gates remain green with the inventory checks included.
    6. Resolve every changed local Markdown link; inspect git diff --check, git status --short --untracked-files=all, and git ls-files vendor/libreoffice-reference — documentation is linked, no whitespace defects or generated corpus content is tracked.
    7. Inspect the contract documentation and report guards — schema validation rejects unknown/missing fields, inventory output identifies all inputs by corpus and pinned commit, and docs make no source/test/docs/coverage parity claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T08:50:41.794Z — VERIFY — ok

    By: CODER

    Note: Verified deterministic inventory validation, exact live corpus floors, 100% inventory coverage, full project verification, and documentation/ignore boundaries.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T08:50:41.363Z, excerpt_hash=sha256:b18cd86047f6556f5e65e4190a3776397dae50537a1b9398048d86db9ca47a74

    Details:

    Command: npm run verify
    Result: pass
    Evidence: formatting, lint, tool and app type checks, application coverage 100%, inventory coverage 100% (163 statements, 94 branches, 47 functions, 162 lines), Playwright static E2E, static-build, JSDoc, and file-size gates passed.
    Scope: complete repository quality suite with inventory commands integrated.

    Command: npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference (twice)
    Result: pass
    Evidence: byte-identical valid schemaVersion 1 report; core=149172, dictionaries=859, help=13398/XHP=2746, translations=25704/PO=25699/locales=131.
    Scope: all four ignored pinned LibreOffice repositories.

    Command: local Markdown resolver, git diff --check, git ls-files vendor/libreoffice-reference
    Result: pass
    Evidence: changed documentation links resolve; no whitespace errors; ignored corpus remains untracked.
    Scope: task documentation and parent-repository boundary.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100830-MT7ETT/blueprint/resolved-snapshot.json
    - old_digest: 5880600641ef3f922bc18434a3abfdde18edfb5d7366fea793b94524ec6ec43a
    - current_digest: 5880600641ef3f922bc18434a3abfdde18edfb5d7366fea793b94524ec6ec43a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100830-MT7ETT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100830-MT7ETT
    - diagnostic_command: agentplane task run status 202608100830-MT7ETT
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commits that add the inventory tool, its command wiring, tests, and contract documentation. The ignored pinned checkout is read-only research material and is never deleted or altered by this task. Re-run the foundation verification commands after a rollback."
  Findings: |-
    - Observation: npm run prefixes its normal standard output with lifecycle headings, so a redirected inventory report was not directly parseable even though the TypeScript CLI emitted valid canonical JSON.
      Impact: The package-level machine-output contract would be ambiguous for CI consumers that redirect stdout.
      Resolution: Document and verify npm run --silent inventory:validate for machine consumption; the command now emits byte-stable parseable JSON while ordinary npm run remains suitable for interactive use.
id_source: "generated"
---
## Summary

Create deterministic LibreOffice inventory contracts and baseline validator

Implement a typed, documented, fully covered Node-side inventory foundation that reads the pinned baseline manifest, validates the four local Git corpora and acquisition floors, emits deterministic JSON, and establishes the next atomic inventory tasks without claiming parity.

## Scope

In scope:
- Add a Node-side TypeScript inventory package under scripts/libreoffice-inventory with strict manifest parsing, a Git adapter, exact identity and acquisition-floor validation, deterministic JSON reporting, and a documented CLI.
- Add 100% covered unit tests for all new executable branches, plus a live validation of the ignored pinned checkout.
- Integrate targeted inventory commands into the repository quality scripts and extend JSDoc enforcement to every new TypeScript file.
- Document the inventory contract and update the program roadmap without advancing any LibreOffice parity status.

Out of scope:
- Generating the complete source/test/help/translation/dictionary item inventory; that follows in bounded atomic inventory tasks.
- Copying, adapting, licensing, or redistributing any upstream corpus file.
- Implementing an end-user office feature, changing the static browser application, or claiming coverage/parity completion.

## Plan

1. Specify the versioned baseline-contract types, validation errors, deterministic report shape, and CLI boundary.
2. Implement the small TypeScript modules, 100%-coverage unit tests, typed toolchain command, and documentation enforcement integration.
3. Validate against both controlled test doubles and the four live ignored LibreOffice repositories; write the contract documentation and roadmap handoff.
4. Run targeted and full quality gates, persist evidence, obtain an evaluator review, and close with traceable commits.

## Verify Steps

1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — all new TypeScript modules, JSDoc enforcement, linting, and size policy pass.
2. npm run test:inventory:coverage — unit tests cover every branch, function, line, and statement in scripts/libreoffice-inventory at 100%.
3. npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference — validates every live core/dictionaries/helpcontent2/translations origin, annotated tag object, commit, shallow/clean state, exact tracked-file acquisition floor, 2,746 XHP topics, 25,699 PO catalogs, and 131 locales; stdout parses as deterministic JSON.
4. Run the command in step 3 twice and byte-compare canonical output — the inventory report is stable for unchanged input.
5. npm run verify — the existing static-app build, unit/E2E/accessibility, docs, and size gates remain green with the inventory checks included.
6. Resolve every changed local Markdown link; inspect git diff --check, git status --short --untracked-files=all, and git ls-files vendor/libreoffice-reference — documentation is linked, no whitespace defects or generated corpus content is tracked.
7. Inspect the contract documentation and report guards — schema validation rejects unknown/missing fields, inventory output identifies all inputs by corpus and pinned commit, and docs make no source/test/docs/coverage parity claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T08:50:41.794Z — VERIFY — ok

By: CODER

Note: Verified deterministic inventory validation, exact live corpus floors, 100% inventory coverage, full project verification, and documentation/ignore boundaries.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T08:50:41.363Z, excerpt_hash=sha256:b18cd86047f6556f5e65e4190a3776397dae50537a1b9398048d86db9ca47a74

Details:

Command: npm run verify
Result: pass
Evidence: formatting, lint, tool and app type checks, application coverage 100%, inventory coverage 100% (163 statements, 94 branches, 47 functions, 162 lines), Playwright static E2E, static-build, JSDoc, and file-size gates passed.
Scope: complete repository quality suite with inventory commands integrated.

Command: npm run --silent inventory:validate -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference (twice)
Result: pass
Evidence: byte-identical valid schemaVersion 1 report; core=149172, dictionaries=859, help=13398/XHP=2746, translations=25704/PO=25699/locales=131.
Scope: all four ignored pinned LibreOffice repositories.

Command: local Markdown resolver, git diff --check, git ls-files vendor/libreoffice-reference
Result: pass
Evidence: changed documentation links resolve; no whitespace errors; ignored corpus remains untracked.
Scope: task documentation and parent-repository boundary.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100830-MT7ETT/blueprint/resolved-snapshot.json
- old_digest: 5880600641ef3f922bc18434a3abfdde18edfb5d7366fea793b94524ec6ec43a
- current_digest: 5880600641ef3f922bc18434a3abfdde18edfb5d7366fea793b94524ec6ec43a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100830-MT7ETT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100830-MT7ETT
- diagnostic_command: agentplane task run status 202608100830-MT7ETT
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commits that add the inventory tool, its command wiring, tests, and contract documentation. The ignored pinned checkout is read-only research material and is never deleted or altered by this task. Re-run the foundation verification commands after a rollback.

## Findings

- Observation: npm run prefixes its normal standard output with lifecycle headings, so a redirected inventory report was not directly parseable even though the TypeScript CLI emitted valid canonical JSON.
  Impact: The package-level machine-output contract would be ambiguous for CI consumers that redirect stdout.
  Resolution: Document and verify npm run --silent inventory:validate for machine consumption; the command now emits byte-stable parseable JSON while ordinary npm run remains suitable for interactive use.
