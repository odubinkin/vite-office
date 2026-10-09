---
id: "202610090725-D6Z7XD"
title: "Calc native sticky range reference updates"
result_summary: "Implemented native sticky Calc range updates with compiled differential proof"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on:
  - "202610090711-S6VCEJ"
tags:
  - "calc"
  - "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run inventory:parity:calc"
  - "npm run test:coverage:calc"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T07:27:34.588Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T07:41:29.168Z"
  updated_by: "CODER"
  note: "Calc14cases including768actual native movement states pass; ASan/UBSan and pinned source/blob hashes checked. Real V8 211lines245statements53functions219branches all100; typecheck,boundaries,lint,format,docs,scoped registry,routing,doctor pass. Full suite deferred until Calc10; broad API/integration parity unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T07:42:05.263Z"
  updated_by: "EVALUATOR"
  note: "Native sticky range updates are implemented on the original owner and pass actual100 Calc coverage plus768compiled upstream differential states."
  evaluated_sha: "1d5c43268f11123ae8de64ae01c74e98ae318a09"
  blueprint_digest: "2b3b1d9e9907f78c9fe7b139b02044f71c2097f4ae76270585e3f358a88b7f9d"
  evidence_refs:
    - ".agentplane/tasks/202610090725-D6Z7XD/README.md"
    - ".agentplane/tasks/202610090725-D6Z7XD/quality/20261009-074205263-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090725-D6Z7XD/quality/20261009-074205263-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090725-D6Z7XD/quality/20261009-074205263-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090725-D6Z7XD/blueprint/resolved-snapshot.json"
    - "apps/office/coverage/calc/coverage-summary.json"
    - "apps/office/src/sc/source/core/tool/native-range-cases.json"
    - "scripts/calc-address-native-probe.mjs"
    - "output/playwright/calc-registry2.json"
  findings:
    - "Exact original definitions and source Git blobs are preserved by the probe; native doc/class shell limitations and unexecuted methods are declared. Existing Writer/shared runtime and first Calc acceptance tests are untouched. Inventory records retain unverified broad semantic states."
commit:
  hash: "1d5c43268f11123ae8de64ae01c74e98ae318a09"
  message: "🧩 D6Z7XD code: preserve native Calc sticky range updates"
comments:
  -
    author: "CODER"
    body: "Start: continue the approved Calc core by implementing the pinned native sticky range movement and insert/delete coordinate updates with focused acceptance coverage."
  -
    author: "CODER"
    body: "Verified: original Calc sticky range updates match768compiled upstream states, with actual100 percent Calc coverage and passing scoped static and registry checks."
events:
  -
    type: "status"
    at: "2026-10-09T07:27:37.920Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue the approved Calc core by implementing the pinned native sticky range movement and insert/delete coordinate updates with focused acceptance coverage."
  -
    type: "verify"
    at: "2026-10-09T07:41:29.168Z"
    author: "CODER"
    state: "ok"
    note: "Calc14cases including768actual native movement states pass; ASan/UBSan and pinned source/blob hashes checked. Real V8 211lines245statements53functions219branches all100; typecheck,boundaries,lint,format,docs,scoped registry,routing,doctor pass. Full suite deferred until Calc10; broad API/integration parity unverified."
  -
    type: "status"
    at: "2026-10-09T07:42:09.794Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original Calc sticky range updates match768compiled upstream states, with actual100 percent Calc coverage and passing scoped static and registry checks."
doc_version: 3
doc_updated_at: "2026-10-09T07:42:09.796Z"
doc_updated_by: "CODER"
description: "Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence."
sections:
  Summary: |-
    Calc native sticky range reference updates

    Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence.
  Scope: "ScRange numerical methods in sc/source/core/tool/address.ts, colocated sticky-range and native-address acceptance, native-range-cases.json, scripts/calc-address-native-probe.mjs, Calc-owned capability/runtime/provenance records and docs/program/calc-core.md. The optional native proof adds three verification artifacts within the approved upstream-matching goal; no shared/Writer runtime or policy changes. Implements exact MoveSticky, IsEndColSticky, IsEndRowSticky, IncEndColSticky, IncEndRowSticky, IncColIfNotLessThan and IncRowIfNotLessThan contracts. Original acceptance tests remain unchanged."
  Plan: "CODER implements the seven original ScRange sticky-movement and conditional-adjustment methods directly on the existing owner, preserving native narrowing/short-circuit/error rules. Add an independent focused acceptance file, source traceability and concise scope/cadence documentation. Verify Calc all-four actual100 and affected statics/registry, record results and finish with traceable local commits on calc; no shared duplication, Writer edits or branch integration."
  Verify Steps: "Run npm run test:coverage:calc with original all-four 100% thresholds and no exclusions/counter changes. Exercise both axes, full-sheet suppression, single-coordinate nonstickiness, existing maximum anchors, anchors becoming sticky, below-zero/above-maximum clamping, sheet error output and both endpoint processing after failure. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, changed-file ESLint/Prettier, npm run check:docs, ap doctor and node .agentplane/policy/check-routing.mjs. Calc task2/10: defer full suite until task10 per user instruction."
  Verification: |-
    Command: npm run test:coverage:calc. Result: pass; 14 acceptance tests in 4 files including every768 native differential row. Actual V8 lines211/211, statements245/245, functions53/53, branches219/219; all four100 with original thresholds. Optional diagnostic: node scripts/calc-address-native-probe.mjs --check. Result: pass; unchanged original C++ bodies, pinned HEAD and full Git-blob byte equality, ASan/UBSan clean, full-source/extracted-body SHA256 and all768 result/error outputs reproduced. Scope: bounded numeric sticky movement only, class shell and three ScDocument bound getters explicit. Commands: npm run typecheck; npm run check:dependencies; changed-file ESLint/Prettier; npm run check:docs; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; Calc2capabilities plus3modules,112shared modules,0semantic violations. Doctor0errors,2unrelated prior warnings. Skipped: full suite. Reason: Calc task2/10 under user instruction. Risk: wider Writer/shared consumers not globally retested; their runtime and tests are untouched. Approval: explicit user testing cadence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T07:41:29.168Z — VERIFY — ok

    By: CODER

    Note: Calc14cases including768actual native movement states pass; ASan/UBSan and pinned source/blob hashes checked. Real V8 211lines245statements53functions219branches all100; typecheck,boundaries,lint,format,docs,scoped registry,routing,doctor pass. Full suite deferred until Calc10; broad API/integration parity unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:41:27.886Z, excerpt_hash=sha256:daf97ea03e8a261105ad4aa5adc836f7a4d1312a494ecb8230faf9553ecfbbaf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090725-D6Z7XD/blueprint/resolved-snapshot.json
    - old_digest: 2b3b1d9e9907f78c9fe7b139b02044f71c2097f4ae76270585e3f358a88b7f9d
    - current_digest: 2b3b1d9e9907f78c9fe7b139b02044f71c2097f4ae76270585e3f358a88b7f9d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090725-D6Z7XD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090725-D6Z7XD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation and task-owned acceptance/metadata; preserve completed Calc1 and prior Writer/shared owners. No merge, reset or reference checkout modifications."
  Findings: "Seven original methods live directly on the existing ScRange owner; no generic browser axis abstraction or duplicated shared module. Sticky identity excludes singleton/reversed ranges; newly sticky error output correction does not forgive starting-endpoint or sheet failures. Both conditional endpoints use strict boundary comparisons and original overlap limiting, with narrowing before max clamping. Existing foundation tests remain byte-identical. Native proof extracts complete unchanged constructors and9numerical definitions; only MoveSticky/Move paths are executed in the768state profile. Native doc/class shells, default capacities and GetTableCount3 are explicit; full ScDocument, other compiled-method differentials and undefined signed arithmetic domains are not certified. Runtime semantic statuses remain unverified; capability has bounded implementation and declared integration gaps, with native evidence appended without broad promotion. Canonical Calc records are authored independently and app-scoped validator includes existing shared owners. Ordinary fixture tests are portable without compiler/upstream; original reference is read-only via ignored symlink. Same-agent EVALUATOR review is not independent. Full suite next after Calc10; no merge or Writer/shared changes."
extensions:
  implementation_commit:
    hash: "1d5c43268f11123ae8de64ae01c74e98ae318a09"
    message: "🧩 D6Z7XD code: preserve native Calc sticky range updates"
id_source: "generated"
---
## Summary

Calc native sticky range reference updates

Continue the approved Calc core goal with original sticky end-anchor movement and insert/delete coordinate adjustment from pinned address.cxx. Reuse ScAddress/ScRange and shared ownership, change only calc files, task2/10 before full-suite cadence.

## Scope

ScRange numerical methods in sc/source/core/tool/address.ts, colocated sticky-range and native-address acceptance, native-range-cases.json, scripts/calc-address-native-probe.mjs, Calc-owned capability/runtime/provenance records and docs/program/calc-core.md. The optional native proof adds three verification artifacts within the approved upstream-matching goal; no shared/Writer runtime or policy changes. Implements exact MoveSticky, IsEndColSticky, IsEndRowSticky, IncEndColSticky, IncEndRowSticky, IncColIfNotLessThan and IncRowIfNotLessThan contracts. Original acceptance tests remain unchanged.

## Plan

CODER implements the seven original ScRange sticky-movement and conditional-adjustment methods directly on the existing owner, preserving native narrowing/short-circuit/error rules. Add an independent focused acceptance file, source traceability and concise scope/cadence documentation. Verify Calc all-four actual100 and affected statics/registry, record results and finish with traceable local commits on calc; no shared duplication, Writer edits or branch integration.

## Verify Steps

Run npm run test:coverage:calc with original all-four 100% thresholds and no exclusions/counter changes. Exercise both axes, full-sheet suppression, single-coordinate nonstickiness, existing maximum anchors, anchors becoming sticky, below-zero/above-maximum clamping, sheet error output and both endpoint processing after failure. Run npm run typecheck, npm run check:dependencies, npm run inventory:parity:calc, changed-file ESLint/Prettier, npm run check:docs, ap doctor and node .agentplane/policy/check-routing.mjs. Calc task2/10: defer full suite until task10 per user instruction.

## Verification

Command: npm run test:coverage:calc. Result: pass; 14 acceptance tests in 4 files including every768 native differential row. Actual V8 lines211/211, statements245/245, functions53/53, branches219/219; all four100 with original thresholds. Optional diagnostic: node scripts/calc-address-native-probe.mjs --check. Result: pass; unchanged original C++ bodies, pinned HEAD and full Git-blob byte equality, ASan/UBSan clean, full-source/extracted-body SHA256 and all768 result/error outputs reproduced. Scope: bounded numeric sticky movement only, class shell and three ScDocument bound getters explicit. Commands: npm run typecheck; npm run check:dependencies; changed-file ESLint/Prettier; npm run check:docs; npm run inventory:parity:calc; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; Calc2capabilities plus3modules,112shared modules,0semantic violations. Doctor0errors,2unrelated prior warnings. Skipped: full suite. Reason: Calc task2/10 under user instruction. Risk: wider Writer/shared consumers not globally retested; their runtime and tests are untouched. Approval: explicit user testing cadence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T07:41:29.168Z — VERIFY — ok

By: CODER

Note: Calc14cases including768actual native movement states pass; ASan/UBSan and pinned source/blob hashes checked. Real V8 211lines245statements53functions219branches all100; typecheck,boundaries,lint,format,docs,scoped registry,routing,doctor pass. Full suite deferred until Calc10; broad API/integration parity unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T07:41:27.886Z, excerpt_hash=sha256:daf97ea03e8a261105ad4aa5adc836f7a4d1312a494ecb8230faf9553ecfbbaf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090725-D6Z7XD/blueprint/resolved-snapshot.json
- old_digest: 2b3b1d9e9907f78c9fe7b139b02044f71c2097f4ae76270585e3f358a88b7f9d
- current_digest: 2b3b1d9e9907f78c9fe7b139b02044f71c2097f4ae76270585e3f358a88b7f9d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090725-D6Z7XD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090725-D6Z7XD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation and task-owned acceptance/metadata; preserve completed Calc1 and prior Writer/shared owners. No merge, reset or reference checkout modifications.

## Findings

Seven original methods live directly on the existing ScRange owner; no generic browser axis abstraction or duplicated shared module. Sticky identity excludes singleton/reversed ranges; newly sticky error output correction does not forgive starting-endpoint or sheet failures. Both conditional endpoints use strict boundary comparisons and original overlap limiting, with narrowing before max clamping. Existing foundation tests remain byte-identical. Native proof extracts complete unchanged constructors and9numerical definitions; only MoveSticky/Move paths are executed in the768state profile. Native doc/class shells, default capacities and GetTableCount3 are explicit; full ScDocument, other compiled-method differentials and undefined signed arithmetic domains are not certified. Runtime semantic statuses remain unverified; capability has bounded implementation and declared integration gaps, with native evidence appended without broad promotion. Canonical Calc records are authored independently and app-scoped validator includes existing shared owners. Ordinary fixture tests are portable without compiler/upstream; original reference is read-only via ignored symlink. Same-agent EVALUATOR review is not independent. Full suite next after Calc10; no merge or Writer/shared changes.
