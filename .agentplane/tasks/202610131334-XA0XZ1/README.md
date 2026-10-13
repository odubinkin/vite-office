---
id: "202610131334-XA0XZ1"
title: "Implement original Calc scalar cell value ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
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
  updated_at: "2026-10-13T13:35:15.086Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-13T13:56:10.095Z"
  updated_by: "CODER"
  note: "Verified: original scalar ScCellValue owner at1230cd9cac73b8ec27989106eb04c1a93256d91e. Native3747-byte stream, Calc129/shared245 whole raw100 every raw counter positive, source-absent build/profile and16gates/36tooling/123inventory pass. Exact3219hashes,12intentional paths and same-agent separate EVALUATOR pass. No fake peer/DTO/memory manager or Writer/shared runtime change; scalar family partial, real document/UI/ODS next priority, full91."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T13:54:59.528Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR pass at1230cd9cac73b8ec27989106eb04c1a93256d91e: actual scalar ScCellValue owner meets approved UI/ODS prerequisite leaf with original variant indices and reused shared values."
  evaluated_sha: "1230cd9cac73b8ec27989106eb04c1a93256d91e"
  blueprint_digest: "a1c992f1e72ec06161d63e239acd7c1b6259873439e9105997f4e08fb92d4585"
  evidence_refs:
    - ".agentplane/tasks/202610131334-XA0XZ1/README.md"
    - ".agentplane/tasks/202610131334-XA0XZ1/quality/20261013-135459528-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610131334-XA0XZ1/quality/20261013-135459528-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610131334-XA0XZ1/quality/20261013-135459528-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610131334-XA0XZ1/blueprint/resolved-snapshot.json"
    - "output/playwright/task86-checks/exact-review.json"
    - "output/playwright/task86-checks/value-coverage-audit.json"
    - "output/playwright/task86-checks/gates-results.json"
    - "output/playwright/calc-cell-value-native/manifest.json"
  findings:
    - "Exact3219current/committed non-task hashes match,12intentional paths and no Writer/shared runtime edits. Native3747-byte stream/6ordinary commands and451source hashes cover scalar constructors/set/clear/get/type/swap/move, UTF16 retained strings, IEEE/errors, wrong variant and CALC-074 self move clearing. Calc129/shared245 whole raw100 every counter positive and16gates pass. No variant/refcount library, fake peer owner or complete document/UI/ODS claim."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: original scalar cell value owner under active UI/ODS priority, shared values reused and no fake peer owners."
events:
  -
    type: "status"
    at: "2026-10-13T13:35:16.819Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original scalar cell value owner under active UI/ODS priority, shared values reused and no fake peer owners."
  -
    type: "verify"
    at: "2026-10-13T13:56:10.095Z"
    author: "CODER"
    state: "ok"
    note: "Verified: original scalar ScCellValue owner at1230cd9cac73b8ec27989106eb04c1a93256d91e. Native3747-byte stream, Calc129/shared245 whole raw100 every raw counter positive, source-absent build/profile and16gates/36tooling/123inventory pass. Exact3219hashes,12intentional paths and same-agent separate EVALUATOR pass. No fake peer/DTO/memory manager or Writer/shared runtime change; scalar family partial, real document/UI/ODS next priority, full91."
doc_version: 3
doc_updated_at: "2026-10-13T13:56:10.172Z"
doc_updated_by: "CODER"
description: "Iteration86 UI/ODS prerequisite: original ScCellValue empty/double/SharedString constructors, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap and semantic move construction/assignment over original variant indices. Ordinary GC refs, reused SharedString values, no fake EditTextObject/ScFormulaCell/document. Native original scalar-family observations, actual pointer-free forward declarations only; whole Calc/affected shared raw100, inventory and gates."
sections:
  Summary: "Iteration86 original scalar ScCellValue owner, needed by document editing and ODS."
  Scope: "Calc only: new sc/inc/cellvalue header boundary and sc/source/core/data/cellvalue owner with original empty/double/SharedString variant families, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap, semantic move construction/assignment and scalar factory branch. Native JS tagged variant and refs replace physical std::variant/unique_ptr ownership; actual SharedString reused. No new memory manager or fake EditTextObject/ScFormulaCell/document. Complete native test/fixture/helper, two new runtime/provenance records/new capability, calc-core and suspected journal if native behavior warrants. Rich-text/formula/copy constructors requiring actual peer owners, document commit/release/assign and string-formatting helpers remain subsequent original families."
  Plan: "Original scalar ScCellValue constructors/setters/queries/clear/swap/logical moves via native JS variant/ref semantics and existing shared string values, no missing-pointee substitute. Native unchanged scalar scopes, whole Calc/affected shared raw100, registry/gates/journal/exact review. UI/ODS prerequisite focus retained."
  Verify Steps: |-
    1. node scripts/calc-cell-value-native-probe.mjs --check and complete scalar cell test: empty/finite/IEEE/error/string values, setters/type-specific access, wrong variant exceptions, clearing, swap, move constructor/assignment/self-move and source emptiness, strings copied/retained; original methods unchanged, no rich-text/formula pointees or sanitizer execution.
    2. node output/playwright/task86-checks/portable.mjs: whole Calc and complete affected shared mdds/SAL/SVL/formula owner/test profiles raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile0UI.
    3. node output/playwright/task86-checks/gates.mjs: all16repository/tooling/inventory gates, no Writer-only repair or threshold weakening, next full91.
    4. Exact current/committed runtime/test/config/fixture hashes, same-agent separate EVALUATOR, canonical DONE and clean calc branch. Scalar family deliberately partial, real rich-text/formula/document/UI/ODS owners pending; do not claim full ScCellValue/native ABI coverage.
  Verification: |-
    Pass: ordinary unchanged original scalar scopes/header getters over451sources,6positive commands and3747-byte stream. Default/number/string, setters/clear/getType/getDouble/getSharedString/isEmpty/swap/move and CALC-074 self move clearing match finite/IEEE/error/retained UTF16 values; TypeError is explicit JS wrong-variant boundary. No peer object, managed pointer/ABI/lifetime timing or sanitizer certification. Whole Calc129tests40files25owners raw3267S2203B595F2891L and shared245tests51files39owners raw4042S2063B829F3620L, S/B/F/L100 every raw counter positive. Four source links absent/restored, static build and Calc profile0UI pass. All16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Exact3219current/committed non-task hashes match1230cd9cac73b8ec27989106eb04c1a93256d91e,12intentional paths; same-agent separate EVALUATOR pass, not independent review. Evidence: output/playwright/task86-checks/exact-review.json, value-coverage-audit.json, gates-results.json, native manifest and task quality report. Inventory/journal updated; no Writer/shared runtime change or new variant/refcount/memory library. Actual scalar families0/1/2 only; rich-text/formula/ref/copy/document/storage/UI/ODS remain subsequent real owners, original QA anchor is unexecuted context. Goal active, UI/ODS priority retained, next full91.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-13T13:56:10.095Z — VERIFY — ok

    By: CODER

    Note: Verified: original scalar ScCellValue owner at1230cd9cac73b8ec27989106eb04c1a93256d91e. Native3747-byte stream, Calc129/shared245 whole raw100 every raw counter positive, source-absent build/profile and16gates/36tooling/123inventory pass. Exact3219hashes,12intentional paths and same-agent separate EVALUATOR pass. No fake peer/DTO/memory manager or Writer/shared runtime change; scalar family partial, real document/UI/ODS next priority, full91.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T13:56:09.446Z, excerpt_hash=sha256:259f8f6b64a87e79f0ef4cfefcab1facd05514ea37a7ddbb0199fed38e82e200

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131334-XA0XZ1/blueprint/resolved-snapshot.json
    - old_digest: a1c992f1e72ec06161d63e239acd7c1b6259873439e9105997f4e08fb92d4585
    - current_digest: a1c992f1e72ec06161d63e239acd7c1b6259873439e9105997f4e08fb92d4585
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610131334-XA0XZ1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610131334-XA0XZ1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional iteration86 changes through a new task; preserve native evidence/shared owners, no merge or history rewrite."
  Findings: |-
    Current repo has CellType/SharedString/mdds foundations but no ScCellValue, ScColumn/Table/Document or actual EditTextObject/ScFormulaCell. This leaf installs real scalar cell semantics rather than a browser DTO. No new native allocation/refcount emulation; existing shared-value cleanup remains a separate boundary. Original self move assignment clears its own value because clear occurs before moving data; certify and preserve.

    - Observation: Exact3219current/committed non-task hashes match1230cd9cac73b8ec27989106eb04c1a93256d91e,12intentional paths, original3747-byte scalar stream/6ordinary commands and451source hashes. Calc129/shared245 raw100, source-absent build/profile0UI and16gates pass; same-agent separate EVALUATOR pass recorded.
      Impact: Actual scalar cell owner meets this UI/ODS prerequisite leaf without fake peer classes, alternate browser DTO, memory manager or Writer/shared runtime changes. Rich-text/formula/document and storage/UI/ODS remain pending.
      Resolution: Record final blueprint verification after task docs, commit metadata and canonical finish. Continue toward real cell-store/document/editing/ODS owners, goal active and next full91.
id_source: "generated"
---
## Summary

Iteration86 original scalar ScCellValue owner, needed by document editing and ODS.

## Scope

Calc only: new sc/inc/cellvalue header boundary and sc/source/core/data/cellvalue owner with original empty/double/SharedString variant families, scalar set/clear/getType/getDouble/getSharedString/isEmpty/swap, semantic move construction/assignment and scalar factory branch. Native JS tagged variant and refs replace physical std::variant/unique_ptr ownership; actual SharedString reused. No new memory manager or fake EditTextObject/ScFormulaCell/document. Complete native test/fixture/helper, two new runtime/provenance records/new capability, calc-core and suspected journal if native behavior warrants. Rich-text/formula/copy constructors requiring actual peer owners, document commit/release/assign and string-formatting helpers remain subsequent original families.

## Plan

Original scalar ScCellValue constructors/setters/queries/clear/swap/logical moves via native JS variant/ref semantics and existing shared string values, no missing-pointee substitute. Native unchanged scalar scopes, whole Calc/affected shared raw100, registry/gates/journal/exact review. UI/ODS prerequisite focus retained.

## Verify Steps

1. node scripts/calc-cell-value-native-probe.mjs --check and complete scalar cell test: empty/finite/IEEE/error/string values, setters/type-specific access, wrong variant exceptions, clearing, swap, move constructor/assignment/self-move and source emptiness, strings copied/retained; original methods unchanged, no rich-text/formula pointees or sanitizer execution.
2. node output/playwright/task86-checks/portable.mjs: whole Calc and complete affected shared mdds/SAL/SVL/formula owner/test profiles raw S/B/F/L100 every raw counter positive, four source links absent/restored, static build and Calc profile0UI.
3. node output/playwright/task86-checks/gates.mjs: all16repository/tooling/inventory gates, no Writer-only repair or threshold weakening, next full91.
4. Exact current/committed runtime/test/config/fixture hashes, same-agent separate EVALUATOR, canonical DONE and clean calc branch. Scalar family deliberately partial, real rich-text/formula/document/UI/ODS owners pending; do not claim full ScCellValue/native ABI coverage.

## Verification

Pass: ordinary unchanged original scalar scopes/header getters over451sources,6positive commands and3747-byte stream. Default/number/string, setters/clear/getType/getDouble/getSharedString/isEmpty/swap/move and CALC-074 self move clearing match finite/IEEE/error/retained UTF16 values; TypeError is explicit JS wrong-variant boundary. No peer object, managed pointer/ABI/lifetime timing or sanitizer certification. Whole Calc129tests40files25owners raw3267S2203B595F2891L and shared245tests51files39owners raw4042S2063B829F3620L, S/B/F/L100 every raw counter positive. Four source links absent/restored, static build and Calc profile0UI pass. All16gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Exact3219current/committed non-task hashes match1230cd9cac73b8ec27989106eb04c1a93256d91e,12intentional paths; same-agent separate EVALUATOR pass, not independent review. Evidence: output/playwright/task86-checks/exact-review.json, value-coverage-audit.json, gates-results.json, native manifest and task quality report. Inventory/journal updated; no Writer/shared runtime change or new variant/refcount/memory library. Actual scalar families0/1/2 only; rich-text/formula/ref/copy/document/storage/UI/ODS remain subsequent real owners, original QA anchor is unexecuted context. Goal active, UI/ODS priority retained, next full91.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-13T13:56:10.095Z — VERIFY — ok

By: CODER

Note: Verified: original scalar ScCellValue owner at1230cd9cac73b8ec27989106eb04c1a93256d91e. Native3747-byte stream, Calc129/shared245 whole raw100 every raw counter positive, source-absent build/profile and16gates/36tooling/123inventory pass. Exact3219hashes,12intentional paths and same-agent separate EVALUATOR pass. No fake peer/DTO/memory manager or Writer/shared runtime change; scalar family partial, real document/UI/ODS next priority, full91.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T13:56:09.446Z, excerpt_hash=sha256:259f8f6b64a87e79f0ef4cfefcab1facd05514ea37a7ddbb0199fed38e82e200

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131334-XA0XZ1/blueprint/resolved-snapshot.json
- old_digest: a1c992f1e72ec06161d63e239acd7c1b6259873439e9105997f4e08fb92d4585
- current_digest: a1c992f1e72ec06161d63e239acd7c1b6259873439e9105997f4e08fb92d4585
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610131334-XA0XZ1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610131334-XA0XZ1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional iteration86 changes through a new task; preserve native evidence/shared owners, no merge or history rewrite.

## Findings

Current repo has CellType/SharedString/mdds foundations but no ScCellValue, ScColumn/Table/Document or actual EditTextObject/ScFormulaCell. This leaf installs real scalar cell semantics rather than a browser DTO. No new native allocation/refcount emulation; existing shared-value cleanup remains a separate boundary. Original self move assignment clears its own value because clear occurs before moving data; certify and preserve.

- Observation: Exact3219current/committed non-task hashes match1230cd9cac73b8ec27989106eb04c1a93256d91e,12intentional paths, original3747-byte scalar stream/6ordinary commands and451source hashes. Calc129/shared245 raw100, source-absent build/profile0UI and16gates pass; same-agent separate EVALUATOR pass recorded.
  Impact: Actual scalar cell owner meets this UI/ODS prerequisite leaf without fake peer classes, alternate browser DTO, memory manager or Writer/shared runtime changes. Rich-text/formula/document and storage/UI/ODS remain pending.
  Resolution: Record final blueprint verification after task docs, commit metadata and canonical finish. Continue toward real cell-store/document/editing/ODS owners, goal active and next full91.
