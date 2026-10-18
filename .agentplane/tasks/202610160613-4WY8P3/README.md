---
id: "202610160613-4WY8P3"
title: "Implement minimal Calc scalar document editing chain"
result_summary: "Connected scalar document editing"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 26
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T06:14:09.463Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T06:46:57.214Z"
  updated_by: "CODER"
  note: "Command:node output/playwright/task198-checks/source-audit.mjs;portable.mjs;browser-portable.mjs;source-gates.mjs;final-audit.mjs. Result:pass. Evidence:15pinned source/QA files;199Calc tests/79files and48related tests;39Calc owners raw4420S/2851B/906F/3956L100,every counter positive;actual production build/Chromium/DOM-free Worker with5refs absent/restored;13gates and86boundary regressions pass;exact27intentional paths. Scope:initial scalar ScDocument/ScTable/ScColumn and numeric/string store integration only. UI implementation remains separate;formula/formatting/full constructor/ODS gaps explicit. No native execution,no new ownership engine;task197 durably deferred without discarding completed shared modules."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T06:50:12.916Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review passes the approved minimal scalar editing scope at 3ed61a9e7d027d599ff76898163e88ca1024f4d6; this is not independent review or overall UI/ODS readiness."
  evaluated_sha: "3ed61a9e7d027d599ff76898163e88ca1024f4d6"
  blueprint_digest: "49775f332f5cc62262f1b2ccbbd37716ce05a00569fa845166e2b1d9c451c9b0"
  evidence_refs:
    - ".agentplane/tasks/202610160613-4WY8P3/README.md"
    - ".agentplane/tasks/202610160613-4WY8P3/quality/20261016-065012916-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160613-4WY8P3/quality/20261016-065012916-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160613-4WY8P3/quality/20261016-065012916-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160613-4WY8P3/blueprint/resolved-snapshot.json"
    - "output/playwright/task198-checks/final-audit.json"
  findings:
    - "Reviewed actual document-sheet-column storage, lazy allocation, shared string reuse, native default and rejection paths, source audit and exact committed hashes. Whole Calc 199 tests and all 39 executable owners reach strict raw S/B/F/L100; related 48 tests, Chromium/Worker, build and 13 source gates pass with portable reference removal/restoration. Formula, ODS, rich text, formatting and full constructor services remain explicit gaps; no UI implementation and no full all-app run."
commit:
  hash: "3ed61a9e7d027d599ff76898163e88ca1024f4d6"
  message: "🧩 4WY8P3 calc: connect scalar document sheet and column editing"
comments:
  -
    author: "CODER"
    body: "Start: implement the user-prioritized minimal canonical scalar document editing chain and update the UI/ODS critical path;defer unrelated language parity without discarding its unfinished work."
  -
    author: "CODER"
    body: "Verified: actual scalar document-sheet-column editing, strict whole-Calc coverage, related tests, portable Chromium/Worker and source gates; same-agent evaluation passed. Formula and ODS readiness remains pending; UI is a separate task."
events:
  -
    type: "status"
    at: "2026-10-16T06:14:16.342Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the user-prioritized minimal canonical scalar document editing chain and update the UI/ODS critical path;defer unrelated language parity without discarding its unfinished work."
  -
    type: "verify"
    at: "2026-10-16T06:46:57.214Z"
    author: "CODER"
    state: "ok"
    note: "Command:node output/playwright/task198-checks/source-audit.mjs;portable.mjs;browser-portable.mjs;source-gates.mjs;final-audit.mjs. Result:pass. Evidence:15pinned source/QA files;199Calc tests/79files and48related tests;39Calc owners raw4420S/2851B/906F/3956L100,every counter positive;actual production build/Chromium/DOM-free Worker with5refs absent/restored;13gates and86boundary regressions pass;exact27intentional paths. Scope:initial scalar ScDocument/ScTable/ScColumn and numeric/string store integration only. UI implementation remains separate;formula/formatting/full constructor/ODS gaps explicit. No native execution,no new ownership engine;task197 durably deferred without discarding completed shared modules."
  -
    type: "status"
    at: "2026-10-16T06:50:31.054Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: actual scalar document-sheet-column editing, strict whole-Calc coverage, related tests, portable Chromium/Worker and source gates; same-agent evaluation passed. Formula and ODS readiness remains pending; UI is a separate task."
doc_version: 3
doc_updated_at: "2026-10-16T06:50:31.056Z"
doc_updated_by: "CODER"
description: "User-corrected priority:implement the first real source-aligned ScDocument->ScTable->ScColumn numeric/string editing subset using existing shared stores and strings;do not require full native constructors,language/font subsystems or all API parity before connecting UI. Preserve upstream contracts/defaults for supported operations and explicitly record missing services. UI and basic formulas/ODS will build on this same model,without a second browser grid model."
sections:
  Summary: "Implement the first source-aligned scalar spreadsheet document editing chain so browser UI work can begin before broad kernel parity."
  Scope: "Only vite-office-calc branch calc. At most35intentional implementation/test/registry/doc paths for the numeric/string ScColumn storage subset,ScTable ownership,ScDocument sheet insertion and scalar access needed by the first editor,plus existing shared component changes only when actually consumed. Reuse real mdds/string/coordinate owners. Preserve supported-operation contracts and defaults;record unimplemented services and APIs honestly. Do not instantiate fake pools/formatters/language services,no-op eager services,a second browser grid model or a separate ODS document. Full native construction/service/function parity is a later stage,not a gate for this explicit subset. Unfinished task197 language work remains deferred and is not a dependency. No network,native compiler/probes/generators,branch switching or merge."
  Plan: "Audit only source entry points reached by numeric/string editing;implement the minimal real document->table->column chain using existing shared stores and strings;exercise public replacements,clear,coordinates,sheets and shared text;record bounded inventory and explicit API gaps. Follow with only the core input/formula operations and basic same-model ODS needed to confirm readiness for a separate UI task. Do not implement UI or complete unrelated constructor dependency graphs. Full all-app run and requested pause occur after minimal core readiness plus basic ODS,without waiting for a UI implementation."
  Verify Steps: |-
    - node output/playwright/task198-checks/source-audit.mjs: pinned native scalar write/read/clear/sheet entry points,actual shared-store reuse,and explicit omitted full constructor/service responsibilities;no native execution.
    - node output/playwright/task198-checks/portable.mjs: wholeCalc and directly related shared tests with source-reference links absent/restored;exact changed/new executable owner raw S/B/F/L100,every counter positive. Public document->sheet->column numeric/string writes,replacements,clears,coordinate boundaries and shared string behavior;no fake backend.
    - node output/playwright/task198-checks/browser-portable.mjs: production build and actual Chromium/Worker scalar document use without native references;related Writer functional smoke only for changed shared consumers.
    - node output/playwright/task198-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates,without relaxing guards.
    - node output/playwright/task198-checks/final-audit.mjs: exact source/path/coverage/ref evidence,explicit unsupported document services and next UI/formula/ODS steps;record verify/source commit/same-agent review before finish. Full all-app run remains deferred until the minimal core is ready for separate UI work and basic same-model ODS read/save,then pause as requested.UI implementation is outside this stage.
  Verification: |-
    Pending implementation. User explicitly corrected priority to a minimal canonical editable UI/ODS slice;this supersedes prior dependency-completion scheduling.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T06:46:57.214Z — VERIFY — ok

    By: CODER

    Note: Command:node output/playwright/task198-checks/source-audit.mjs;portable.mjs;browser-portable.mjs;source-gates.mjs;final-audit.mjs. Result:pass. Evidence:15pinned source/QA files;199Calc tests/79files and48related tests;39Calc owners raw4420S/2851B/906F/3956L100,every counter positive;actual production build/Chromium/DOM-free Worker with5refs absent/restored;13gates and86boundary regressions pass;exact27intentional paths. Scope:initial scalar ScDocument/ScTable/ScColumn and numeric/string store integration only. UI implementation remains separate;formula/formatting/full constructor/ODS gaps explicit. No native execution,no new ownership engine;task197 durably deferred without discarding completed shared modules.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T06:38:55.046Z, excerpt_hash=sha256:348cdb66aa5386e0d0e3b25657a40472f4bcb0b6ebce48e14cb09eb1c4a385be

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160613-4WY8P3/blueprint/resolved-snapshot.json
    - old_digest: 49775f332f5cc62262f1b2ccbbd37716ce05a00569fa845166e2b1d9c451c9b0
    - current_digest: 49775f332f5cc62262f1b2ccbbd37716ce05a00569fa845166e2b1d9c451c9b0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160613-4WY8P3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160613-4WY8P3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task intentional source/test/registry/doc changes. Preserve completed shared modules,user work,and the separately retained unfinished task197 work. No resets,branch moves or merges."
  Findings: "Task198 inventory now has an inspected native testSharedStringPool reference,explicitly not full native QA execution. Next validation correctly reports that public re-export header ScColumn declares no local executable class;runtime inventory localSymbols must describe its empty declaration set,while source-provenance localSymbols may describe the exported binding. Match existing header-record conventions for all3headers;do not change inventory algorithms or fabricate local implementations. Other source gates through provenance pass;full raw100/browser evidence remains. Missing future sc/inc/tokenarray.ts was read-only next-stage discovery,not a blocker or a reason to broaden this scalar task."
id_source: "generated"
---
## Summary

Implement the first source-aligned scalar spreadsheet document editing chain so browser UI work can begin before broad kernel parity.

## Scope

Only vite-office-calc branch calc. At most35intentional implementation/test/registry/doc paths for the numeric/string ScColumn storage subset,ScTable ownership,ScDocument sheet insertion and scalar access needed by the first editor,plus existing shared component changes only when actually consumed. Reuse real mdds/string/coordinate owners. Preserve supported-operation contracts and defaults;record unimplemented services and APIs honestly. Do not instantiate fake pools/formatters/language services,no-op eager services,a second browser grid model or a separate ODS document. Full native construction/service/function parity is a later stage,not a gate for this explicit subset. Unfinished task197 language work remains deferred and is not a dependency. No network,native compiler/probes/generators,branch switching or merge.

## Plan

Audit only source entry points reached by numeric/string editing;implement the minimal real document->table->column chain using existing shared stores and strings;exercise public replacements,clear,coordinates,sheets and shared text;record bounded inventory and explicit API gaps. Follow with only the core input/formula operations and basic same-model ODS needed to confirm readiness for a separate UI task. Do not implement UI or complete unrelated constructor dependency graphs. Full all-app run and requested pause occur after minimal core readiness plus basic ODS,without waiting for a UI implementation.

## Verify Steps

- node output/playwright/task198-checks/source-audit.mjs: pinned native scalar write/read/clear/sheet entry points,actual shared-store reuse,and explicit omitted full constructor/service responsibilities;no native execution.
- node output/playwright/task198-checks/portable.mjs: wholeCalc and directly related shared tests with source-reference links absent/restored;exact changed/new executable owner raw S/B/F/L100,every counter positive. Public document->sheet->column numeric/string writes,replacements,clears,coordinate boundaries and shared string behavior;no fake backend.
- node output/playwright/task198-checks/browser-portable.mjs: production build and actual Chromium/Worker scalar document use without native references;related Writer functional smoke only for changed shared consumers.
- node output/playwright/task198-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates,without relaxing guards.
- node output/playwright/task198-checks/final-audit.mjs: exact source/path/coverage/ref evidence,explicit unsupported document services and next UI/formula/ODS steps;record verify/source commit/same-agent review before finish. Full all-app run remains deferred until the minimal core is ready for separate UI work and basic same-model ODS read/save,then pause as requested.UI implementation is outside this stage.

## Verification

Pending implementation. User explicitly corrected priority to a minimal canonical editable UI/ODS slice;this supersedes prior dependency-completion scheduling.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T06:46:57.214Z — VERIFY — ok

By: CODER

Note: Command:node output/playwright/task198-checks/source-audit.mjs;portable.mjs;browser-portable.mjs;source-gates.mjs;final-audit.mjs. Result:pass. Evidence:15pinned source/QA files;199Calc tests/79files and48related tests;39Calc owners raw4420S/2851B/906F/3956L100,every counter positive;actual production build/Chromium/DOM-free Worker with5refs absent/restored;13gates and86boundary regressions pass;exact27intentional paths. Scope:initial scalar ScDocument/ScTable/ScColumn and numeric/string store integration only. UI implementation remains separate;formula/formatting/full constructor/ODS gaps explicit. No native execution,no new ownership engine;task197 durably deferred without discarding completed shared modules.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T06:38:55.046Z, excerpt_hash=sha256:348cdb66aa5386e0d0e3b25657a40472f4bcb0b6ebce48e14cb09eb1c4a385be

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160613-4WY8P3/blueprint/resolved-snapshot.json
- old_digest: 49775f332f5cc62262f1b2ccbbd37716ce05a00569fa845166e2b1d9c451c9b0
- current_digest: 49775f332f5cc62262f1b2ccbbd37716ce05a00569fa845166e2b1d9c451c9b0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160613-4WY8P3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160613-4WY8P3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task intentional source/test/registry/doc changes. Preserve completed shared modules,user work,and the separately retained unfinished task197 work. No resets,branch moves or merges.

## Findings

Task198 inventory now has an inspected native testSharedStringPool reference,explicitly not full native QA execution. Next validation correctly reports that public re-export header ScColumn declares no local executable class;runtime inventory localSymbols must describe its empty declaration set,while source-provenance localSymbols may describe the exported binding. Match existing header-record conventions for all3headers;do not change inventory algorithms or fabricate local implementations. Other source gates through provenance pass;full raw100/browser evidence remains. Missing future sc/inc/tokenarray.ts was read-only next-stage discovery,not a blocker or a reason to broaden this scalar task.
