---
id: "202610101342-SSE4NF"
title: "Prioritize Calc UI prerequisites and port original cell type and text metadata"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T13:44:20.240Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T13:59:27.941Z"
  updated_by: "CODER"
  note: "Native complete metadata/enum capture and absent-upstream Calc106/shared1 tests pass; actual four-metric100 with raw counters, all declared source/inventory/static gates pass; journal preserved and renamed. Full cadence1/10, next41. See task32 audit/manifests."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original cell metadata and shared script discriminator, record UI-first dependency order and explicitly requested Calc journal rename; native/scoped checks and inventories, no mocks or Writer edits."
events:
  -
    type: "status"
    at: "2026-10-10T13:44:28.917Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original cell metadata and shared script discriminator, record UI-first dependency order and explicitly requested Calc journal rename; native/scoped checks and inventories, no mocks or Writer edits."
  -
    type: "verify"
    at: "2026-10-10T13:59:27.941Z"
    author: "CODER"
    state: "ok"
    note: "Native complete metadata/enum capture and absent-upstream Calc106/shared1 tests pass; actual four-metric100 with raw counters, all declared source/inventory/static gates pass; journal preserved and renamed. Full cadence1/10, next41. See task32 audit/manifests."
doc_version: 3
doc_updated_at: "2026-10-10T13:59:27.997Z"
doc_updated_by: "CODER"
description: "User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks."
sections:
  Summary: |-
    Prioritize Calc UI prerequisites and port original cell type and text metadata

    User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks.
  Scope: "Original CellType, CellTextAttr, TEXTWIDTH_DIRTY and shared SvtScriptType at original Calc/header/core-data boundaries; source-verified native fixture and actual100% scoped Calc/shared tests, inventories and UI-prerequisite roadmap. Additional explicit user instruction: rename docs/program/upstream-suspected-issues.md to docs/program/calc-upstream-suspected-issues.md and update all current source/docs/registry references; retain immutable finished-task historical references. No mock document, Writer edits, unrelated APIs, UI or merges."
  Plan: "Implement exact original CellType and cell text metadata with shared script discriminator, preserving upstream header/core-data owners and native defaults/copy/narrowing contracts. Record the revised dependency priority spine: concrete value/text prerequisites including SharedString/managed-value owners, required mdds writes and CellStore, ScColumn/ScTable/ScDocument, edit/notification/undo, then view/input integration through shared Sfx/browser surfaces. Validate bounded native differential fields with original source scopes and portable fixtures, actual100% scoped coverage, source/runtime inventories and ordinary gates. Commit, EVALUATOR review, verify and close this executable leaf before taking the next real dependency. Do not wait for unrelated full container/formula features before UI prerequisites, and do not synthesize missing document owners."
  Verify Steps: "Read brief/next-action/verify-show. Native calc-celltextattr probe --write then --check with exact pinned complete original enum/struct/constructor/constants scopes, actual source/extracted SHA, ASan/UBSan; compare complete field snapshots of defaultFFFF/UNKNOWN8, copies/assignment/selfassign and valid UInt16/UInt8 conversions. Portable Calc/shared tests with upstream link absent, exact finally restore. npm run test:coverage:calc actual allfour100 with raw s/f/b positive; npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types actual allfour100. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Ordinary formatter on authored/touched code/data/records/docs. Verify journal rename retains every original entry and all current non-historical links resolve to calc-upstream-suspected-issues.md. Preserve immutable finished tasks. No full suite task1/10 after last full task31; next scheduled task41. No thresholds/timeouts/data/config weakening. Commit implementation, EVALUATOR read-only review, verify and clean task closure on branchcalc."
  Verification: |-
    Passed: exact unchanged pinned native5sources/5scopes with ASan/UBSan,154sequences/1232fullstates; portable Calc106/24 and shared1/1 under absent upstream with exact finally restore. Actual Calc S2920/B2055/F474/L2564 and shared S6/B0/F1/L6 all100 with raw present counters positive. Typecheck/lint/docs/size/dependencies/tree/provenance, provenance3 and registry12 tests, Calc/shared inventories, routing/doctor/diff pass. Driver/output/coverage/raw audit and scoped manifests in output/playwright/task32-*. Journal31cases/body retained, current links renamed; original Calc metadata boundaries/shared script enum reused. No full run task1/10, next41; no Writer/threshold/config changes. Implementation commit and EVALUATOR review follow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T13:59:27.941Z — VERIFY — ok

    By: CODER

    Note: Native complete metadata/enum capture and absent-upstream Calc106/shared1 tests pass; actual four-metric100 with raw counters, all declared source/inventory/static gates pass; journal preserved and renamed. Full cadence1/10, next41. See task32 audit/manifests.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T13:59:27.121Z, excerpt_hash=sha256:2747e2bd9f71a8aea3fb1394107c0af8d6a69863f005f418efdab5986f5b2b2f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101342-SSE4NF/blueprint/resolved-snapshot.json
    - old_digest: f8bd16df9f0ba17b91d771d3b25b9a805f0b7b719fcfd419b9adc2c8ef14f0c9
    - current_digest: f8bd16df9f0ba17b91d771d3b25b9a805f0b7b719fcfd419b9adc2c8ef14f0c9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101342-SSE4NF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101342-SSE4NF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-owned implementation, fixture, probe, registry and documentation commits; retain previous completed task31 records and unrelated active tasks. Re-run scoped Calc/shared coverage and source registry gates after rollback."
  Findings: |-
    The user resumed the goal and explicitly changed priority to missing core owners required for real UI. The repository has no original ScDocument/ScTable/ScColumn/ScCellValue or Calc view/input owners. Reusable Sfx/browser command infrastructure and original selection/address owners already exist. Original text metadata depends on shared SvtScriptType and globalnames TEXTWIDTH_DIRTY; this small leaf establishes those exact defaults/types before native cell/column storage integration. Previous full run is task31; subsequent full runs remain every ten tasks. Suspicious source behavior continues in docs/program/calc-upstream-suspected-issues.md without repairs.

    - Observation: User explicitly requested an application-specific filename for the journal.
      Impact: Historical completed task records retain their original paths; current references must use the Calc journal.
      Resolution: Renamed to docs/program/calc-upstream-suspected-issues.md with every prior case preserved and current docs/registry references updated. All future suspicious Calc cases go here.

    Command: node scripts/calc-celltextattr-native-probe.mjs --write
    Result: fail (initial driver compilation).
    Evidence: clang++ rejected JSON output literals because the local driver removed required escaped quotation marks. No original upstream scopes were modified; no fixture output was accepted.
    Scope: native observation driver only.
    Resolution: retain C++ JSON literal escaping, then rebuild and capture the unchanged original declarations and constructor.

    Command: npm run lint
    Result: fail (initial task32 check).
    Evidence: two forbidden non-null assertions in the new portable fixture consumer and ten redundant JS template literal escapes in the observation driver.
    Scope: new acceptance test and probe only.
    Resolution: explicitly validate complete fixture input pairs and remove only redundant JS quoting while preserving emitted C++ bytes and source hashes. No lint/config changes.

    Command: npm run check:docs
    Result: fail (initial task32 JSDoc check); lint passed.
    Evidence: four new test callbacks lacked required JSDoc and two metadata setters lacked @returns.
    Scope: new Calc/shared test and metadata source documentation.
    Resolution: add the required callback/setter comments without changing runtime behavior or documentation rules.

    Command: npm run inventory:parity:calc
    Result: fail (initial registry validation).
    Evidence: the metadata capability had an empty upstream.docs array; the canonical evidence schema requires a declaration/documentation reference. All prior lint/docs/size/dependency/tree/provenance gates passed.
    Scope: three newly registered capabilities only.
    Resolution: reference their real original header declarations, and identify original QA consumer context without claiming generated fixtures are upstream tests. No registry schema or semantic parity promotion.

    Command: npm run inventory:parity:calc
    Result: fail (header evidence validation).
    Evidence: the AST local-declaration validator treats an imported/re-exported CellTextAttr as no local declaration; the actual class already lives at its original core/data owner.
    Scope: new celltextattr header runtime record only.
    Resolution: follow existing header-re-export inventory representation without duplicating the class or weakening the validator. Preserve upstream symbol evidence and source provenance.

    Command: independent raw Istanbul coverage audit
    Result: fail (initial audit predicate, not a test failure).
    Evidence: the first audit included auxiliary branchesTrue, whose unpopulated percentage is Unknown. The four required metrics, including branches0/0, all explicitly report100. Tests and coverage thresholds passed.
    Scope: audit predicate only.
    Resolution: require covered==total for every metric, pct100 for nonzero metrics, and no zero raw counters; explicitly record absent branch denominator rather than invent branch execution.

    Task32 verification evidence:
    - Command: native probe --write and --check. Result: pass after driver quoting repair. Evidence:154 complete sequences/1232 states,3 owners and2 fields per state,5 unchanged full source blobs and5 complete original scope hashes; ASan/UBSan. Actual driver SHA2567c034503499a697b1acf5e56f44ce14612d892ed81d0a42d28a365ab7a562db5. Full capture equals every portable state and enum/constant observation.
    - Command: npm run test:coverage:calc. Result: pass106tests/24files with both upstream symlinks absent; actual19 covered sources, S2920/B2055/F474/L2564 all100 and all raw s/f/b counters positive.
    - Command: npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types. Result: pass1test/1source, S6/B0/F1/L6 all100; zero branch denominator explicitly retained, all present counters positive.
    - Scope: all Calc and only the affected shared script discriminator; no Writer-only coverage changes. Exact original symlink targets restored in finally.
    - Command: npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc/shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: source-provenance3 cases, related registry12 cases; Calc44capabilities/163modules and shared21/133, zero runtime semantic violations. Doctor0errors and2 unchanged inherited warnings. Ordinary eligible source/data files formatted at default heap.
    - Evidence: output/playwright/task32-tests/manifest.json and logs; task32-gates/manifest.json and logs; task32-audit.json; actual coverage-final/summary.json and native driver/output.
    - Journal: every original entry/body byte retained, only title changes; all current docs/registry references use calc-upstream-suspected-issues.md. Historical finished-task references remain immutable.
    - Atomic inventory: independent CellType tags and CellTextAttr defaults/value metadata receive separate Calc capabilities, with one shared SvtScriptType capability. This preserves the planned source scope and exhaustive atomic records rather than aggregating separate contracts. Whole-module semantic/default/parity flags remain unverified.
    - Full cadence: task32 is1/10 since actual full task31; next scheduled full task41. No full suite run, no configuration/threshold/timeout/assertion/data reduction. Goal active after explicit resume; UI prerequisite spine updated.
id_source: "generated"
---
## Summary

Prioritize Calc UI prerequisites and port original cell type and text metadata

User-authorized reordered core work for first real Calc UI: value/text prerequisites, storage write and cell owners, column/table/document, edit notifications/undo, then view/input. Implement original CellType, CellTextAttr defaults and shared SvtScriptType at original boundaries; native differential complete field/copy/assignment/narrowing evidence, inventories and roadmap. Calc branch only, reuse shared owners, no temporary document/UI model. First task since the requested full task31 run; next scheduled full after ten completed tasks.

## Scope

Original CellType, CellTextAttr, TEXTWIDTH_DIRTY and shared SvtScriptType at original Calc/header/core-data boundaries; source-verified native fixture and actual100% scoped Calc/shared tests, inventories and UI-prerequisite roadmap. Additional explicit user instruction: rename docs/program/upstream-suspected-issues.md to docs/program/calc-upstream-suspected-issues.md and update all current source/docs/registry references; retain immutable finished-task historical references. No mock document, Writer edits, unrelated APIs, UI or merges.

## Plan

Implement exact original CellType and cell text metadata with shared script discriminator, preserving upstream header/core-data owners and native defaults/copy/narrowing contracts. Record the revised dependency priority spine: concrete value/text prerequisites including SharedString/managed-value owners, required mdds writes and CellStore, ScColumn/ScTable/ScDocument, edit/notification/undo, then view/input integration through shared Sfx/browser surfaces. Validate bounded native differential fields with original source scopes and portable fixtures, actual100% scoped coverage, source/runtime inventories and ordinary gates. Commit, EVALUATOR review, verify and close this executable leaf before taking the next real dependency. Do not wait for unrelated full container/formula features before UI prerequisites, and do not synthesize missing document owners.

## Verify Steps

Read brief/next-action/verify-show. Native calc-celltextattr probe --write then --check with exact pinned complete original enum/struct/constructor/constants scopes, actual source/extracted SHA, ASan/UBSan; compare complete field snapshots of defaultFFFF/UNKNOWN8, copies/assignment/selfassign and valid UInt16/UInt8 conversions. Portable Calc/shared tests with upstream link absent, exact finally restore. npm run test:coverage:calc actual allfour100 with raw s/f/b positive; npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types actual allfour100. npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc; inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Ordinary formatter on authored/touched code/data/records/docs. Verify journal rename retains every original entry and all current non-historical links resolve to calc-upstream-suspected-issues.md. Preserve immutable finished tasks. No full suite task1/10 after last full task31; next scheduled task41. No thresholds/timeouts/data/config weakening. Commit implementation, EVALUATOR read-only review, verify and clean task closure on branchcalc.

## Verification

Passed: exact unchanged pinned native5sources/5scopes with ASan/UBSan,154sequences/1232fullstates; portable Calc106/24 and shared1/1 under absent upstream with exact finally restore. Actual Calc S2920/B2055/F474/L2564 and shared S6/B0/F1/L6 all100 with raw present counters positive. Typecheck/lint/docs/size/dependencies/tree/provenance, provenance3 and registry12 tests, Calc/shared inventories, routing/doctor/diff pass. Driver/output/coverage/raw audit and scoped manifests in output/playwright/task32-*. Journal31cases/body retained, current links renamed; original Calc metadata boundaries/shared script enum reused. No full run task1/10, next41; no Writer/threshold/config changes. Implementation commit and EVALUATOR review follow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T13:59:27.941Z — VERIFY — ok

By: CODER

Note: Native complete metadata/enum capture and absent-upstream Calc106/shared1 tests pass; actual four-metric100 with raw counters, all declared source/inventory/static gates pass; journal preserved and renamed. Full cadence1/10, next41. See task32 audit/manifests.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T13:59:27.121Z, excerpt_hash=sha256:2747e2bd9f71a8aea3fb1394107c0af8d6a69863f005f418efdab5986f5b2b2f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101342-SSE4NF/blueprint/resolved-snapshot.json
- old_digest: f8bd16df9f0ba17b91d771d3b25b9a805f0b7b719fcfd419b9adc2c8ef14f0c9
- current_digest: f8bd16df9f0ba17b91d771d3b25b9a805f0b7b719fcfd419b9adc2c8ef14f0c9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101342-SSE4NF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101342-SSE4NF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-owned implementation, fixture, probe, registry and documentation commits; retain previous completed task31 records and unrelated active tasks. Re-run scoped Calc/shared coverage and source registry gates after rollback.

## Findings

The user resumed the goal and explicitly changed priority to missing core owners required for real UI. The repository has no original ScDocument/ScTable/ScColumn/ScCellValue or Calc view/input owners. Reusable Sfx/browser command infrastructure and original selection/address owners already exist. Original text metadata depends on shared SvtScriptType and globalnames TEXTWIDTH_DIRTY; this small leaf establishes those exact defaults/types before native cell/column storage integration. Previous full run is task31; subsequent full runs remain every ten tasks. Suspicious source behavior continues in docs/program/calc-upstream-suspected-issues.md without repairs.

- Observation: User explicitly requested an application-specific filename for the journal.
  Impact: Historical completed task records retain their original paths; current references must use the Calc journal.
  Resolution: Renamed to docs/program/calc-upstream-suspected-issues.md with every prior case preserved and current docs/registry references updated. All future suspicious Calc cases go here.

Command: node scripts/calc-celltextattr-native-probe.mjs --write
Result: fail (initial driver compilation).
Evidence: clang++ rejected JSON output literals because the local driver removed required escaped quotation marks. No original upstream scopes were modified; no fixture output was accepted.
Scope: native observation driver only.
Resolution: retain C++ JSON literal escaping, then rebuild and capture the unchanged original declarations and constructor.

Command: npm run lint
Result: fail (initial task32 check).
Evidence: two forbidden non-null assertions in the new portable fixture consumer and ten redundant JS template literal escapes in the observation driver.
Scope: new acceptance test and probe only.
Resolution: explicitly validate complete fixture input pairs and remove only redundant JS quoting while preserving emitted C++ bytes and source hashes. No lint/config changes.

Command: npm run check:docs
Result: fail (initial task32 JSDoc check); lint passed.
Evidence: four new test callbacks lacked required JSDoc and two metadata setters lacked @returns.
Scope: new Calc/shared test and metadata source documentation.
Resolution: add the required callback/setter comments without changing runtime behavior or documentation rules.

Command: npm run inventory:parity:calc
Result: fail (initial registry validation).
Evidence: the metadata capability had an empty upstream.docs array; the canonical evidence schema requires a declaration/documentation reference. All prior lint/docs/size/dependency/tree/provenance gates passed.
Scope: three newly registered capabilities only.
Resolution: reference their real original header declarations, and identify original QA consumer context without claiming generated fixtures are upstream tests. No registry schema or semantic parity promotion.

Command: npm run inventory:parity:calc
Result: fail (header evidence validation).
Evidence: the AST local-declaration validator treats an imported/re-exported CellTextAttr as no local declaration; the actual class already lives at its original core/data owner.
Scope: new celltextattr header runtime record only.
Resolution: follow existing header-re-export inventory representation without duplicating the class or weakening the validator. Preserve upstream symbol evidence and source provenance.

Command: independent raw Istanbul coverage audit
Result: fail (initial audit predicate, not a test failure).
Evidence: the first audit included auxiliary branchesTrue, whose unpopulated percentage is Unknown. The four required metrics, including branches0/0, all explicitly report100. Tests and coverage thresholds passed.
Scope: audit predicate only.
Resolution: require covered==total for every metric, pct100 for nonzero metrics, and no zero raw counters; explicitly record absent branch denominator rather than invent branch execution.

Task32 verification evidence:
- Command: native probe --write and --check. Result: pass after driver quoting repair. Evidence:154 complete sequences/1232 states,3 owners and2 fields per state,5 unchanged full source blobs and5 complete original scope hashes; ASan/UBSan. Actual driver SHA2567c034503499a697b1acf5e56f44ce14612d892ed81d0a42d28a365ab7a562db5. Full capture equals every portable state and enum/constant observation.
- Command: npm run test:coverage:calc. Result: pass106tests/24files with both upstream symlinks absent; actual19 covered sources, S2920/B2055/F474/L2564 all100 and all raw s/f/b counters positive.
- Command: npm run test:coverage:shared -- src/svl/inc/languageoptions.test.ts --coverage.include=src/svl/inc/languageoptions.ts --coverage.reportsDirectory=coverage/script-types. Result: pass1test/1source, S6/B0/F1/L6 all100; zero branch denominator explicitly retained, all present counters positive.
- Scope: all Calc and only the affected shared script discriminator; no Writer-only coverage changes. Exact original symlink targets restored in finally.
- Command: npm run typecheck; lint; check:docs; check:file-size; check:dependencies; check:source-tree; check:source-provenance; test:source-provenance; inventory:parity:calc/shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass. Evidence: source-provenance3 cases, related registry12 cases; Calc44capabilities/163modules and shared21/133, zero runtime semantic violations. Doctor0errors and2 unchanged inherited warnings. Ordinary eligible source/data files formatted at default heap.
- Evidence: output/playwright/task32-tests/manifest.json and logs; task32-gates/manifest.json and logs; task32-audit.json; actual coverage-final/summary.json and native driver/output.
- Journal: every original entry/body byte retained, only title changes; all current docs/registry references use calc-upstream-suspected-issues.md. Historical finished-task references remain immutable.
- Atomic inventory: independent CellType tags and CellTextAttr defaults/value metadata receive separate Calc capabilities, with one shared SvtScriptType capability. This preserves the planned source scope and exhaustive atomic records rather than aggregating separate contracts. Whole-module semantic/default/parity flags remain unverified.
- Full cadence: task32 is1/10 since actual full task31; next scheduled full task41. No full suite run, no configuration/threshold/timeout/assertion/data reduction. Goal active after explicit resume; UI prerequisite spine updated.
