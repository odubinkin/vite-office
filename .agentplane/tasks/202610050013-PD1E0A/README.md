---
id: "202610050013-PD1E0A"
title: "Restore owned native text insertion through typing and redo"
result_summary: "Restored owned native text insertion through collapsed typing and redo;hyperlink style IDs and continuous item identity preserved,with full core/UI still unverified."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T00:18:13.136Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T00:31:03.492Z"
  updated_by: "CODER"
  note: "Native typing/redo owned internet fields/identity:6static;one absent profile2797pass/28fixturefail100%coverage;exactly28failedcases replaypass/33skip;inventory109/Chrome99/5sourceaudits pass.355oldtests retained;240states retained/newhelperunverified;scope/native hashes/artifact audit/exact-SHA qualitypass."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T00:30:39.516Z"
  updated_by: "EVALUATOR"
  note: "Same-actor readonly exact-commit review ad1fa4f1388096761f38fc59bef1a5c31609e118:native owned collapsed input/redo and pending auto overlay verified;full core/UI unverified."
  evaluated_sha: "ad1fa4f1388096761f38fc59bef1a5c31609e118"
  blueprint_digest: "ce4ac103638cdd8068d2be021f4e60790402e5f19c380daf99e09b2983098aaa"
  evidence_refs:
    - ".agentplane/tasks/202610050013-PD1E0A/README.md"
    - ".agentplane/tasks/202610050013-PD1E0A/quality/20261005-003039516-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050013-PD1E0A/quality/20261005-003039516-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050013-PD1E0A/quality/20261005-003039516-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050013-PD1E0A/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050013-PD1E0A/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050013-PD1E0A/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050013-PD1E0A/evidence/failed-case-replay.json"
    - ".agentplane/tasks/202610050013-PD1E0A/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610050013-PD1E0A/evidence/supplemental-checks.json"
  findings:
    - "Actual internet item/attribute/map/backlinks and all7fields survive supported node/real shell insertion,undo/redo/grouping/composition/Worker;61new cases and355 prior files byte-identical. Existing clipping body extracted unchanged under1000-line gate.240prior states/defaults/exceptions retained;new helper whollyunverified."
    - "Single absent profile:2797pass/28new mutable-lock fixture failures100%coverage. Native nesting lock defaults preserved;28failed cases explicitly unlock and replay pass;33passing fixture inputs restored to initial defaults. Production unchanged;no passing suite/build replay. Inventory109/Chromium99/five restored source audits pass."
commit:
  hash: "e339d98a3e216ba0186e594e391fd04e8af4710f"
  message: "🧩 PD1E0A task: record verified native typing ownership"
comments:
  -
    author: "CODER"
    body: "Start: Restore owned native collapsed typing and redo direction under standing goal authorization,retaining declared selection/flag gaps."
  -
    author: "CODER"
    body: "Verified: Collapsed Writer typing and redo now use native owned InsertText/Update,retaining internet attribute/item/map/backlinks and7fields while overlaying pending automatic items. Single absent profile and28failed-fixture-only replay passed;355prior tests and all registered deviations preserved."
events:
  -
    type: "status"
    at: "2026-10-05T00:13:49.726Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore owned native collapsed typing and redo direction under standing goal authorization,retaining declared selection/flag gaps."
  -
    type: "verify"
    at: "2026-10-05T00:31:03.492Z"
    author: "CODER"
    state: "ok"
    note: "Native typing/redo owned internet fields/identity:6static;one absent profile2797pass/28fixturefail100%coverage;exactly28failedcases replaypass/33skip;inventory109/Chrome99/5sourceaudits pass.355oldtests retained;240states retained/newhelperunverified;scope/native hashes/artifact audit/exact-SHA qualitypass."
  -
    type: "status"
    at: "2026-10-05T00:31:34.063Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Collapsed Writer typing and redo now use native owned InsertText/Update,retaining internet attribute/item/map/backlinks and7fields while overlaying pending automatic items. Single absent profile and28failed-fixture-only replay passed;355prior tests and all registered deviations preserved."
doc_version: 3
doc_updated_at: "2026-10-05T00:31:34.065Z"
doc_updated_by: "CODER"
description: "Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation."
sections:
  Summary: "Restore native owned text insertion through collapsed typing and redo."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation. Measured scope refinement:ndhints.ts would reach1010lines after the owned insertion overlay. Extract its existing generic clipHintOutsideRange unchanged into source-owned ndhints-range.ts,import it at existing callers;retain the1000-line gate. Register one responsibility-split and one whollyunverified runtime row;all240prior statuses/defaults/exceptions stay intact,current241. This necessary in-scope refactor is already authorized by the standing goal;no verification/risk/network drift."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static first;one sequential absent-reference profile;failed-only replays;restored source audits afterward.355 prior tests/240 runtime states preserved and exact native hashes recorded. No saved upstream sources or helpers in Agentplane.
  Verification: |-
    Command/results are recorded in evidence/static-gates.json,absent-profile.json,failed-case-replay.json,restored-source-audits.json and supplemental-checks.json. Six static gates passed before one absent-reference build/app/inventory/scripts/Chromium profile. App2797passed/28failed new fixture cases of2825/273files,100%lines/statements/functions/branches. Concrete nesting native defaults lock DontExpand;new mutable mask fixture explicitly unlocks only the28affected cases. Exactly28failed cases replayed absent:28passed/33skipped. Final conditional fixture refinement leaves those28inputs identical to replay and restores33passing inputs to first-profile defaults;literal set audit proves this. No production or prior-test changes after full profile;no passing suite/build replay. Inventory109/36files100%allfour,scripts5/2files,Chromium99passed;vendor finallyrestored. Five restoredsourceaudits passed,semanticViolationCount0. All355prior test files byte-identical;61newcases;240prior module states/defaults/exceptions preserved,four bounded responsibility appendices only;one whollyunverified extracted range helper,current241rows. Existing clip helper body unchanged. Seven native hashes,APignored-inclusive3872files/0forbidden before final artifacts. Scoped final fixture prettier/eslint pass. Doctor0errors/two unchanged legacywarnings,routingOK. Same-actor readonly EVALUATOR pass at semantic ad1fa4f1388096761f38fc59bef1a5c31609e118;.agentplane/tasks/202610050013-PD1E0A/quality/20261005-003039516-recovery-context/quality-report.json. Exact8paths/currentsource hashes checked;no independent-agent review claim. Selection FORCE/EMPTY/full Insert flags,empty hints/BuildPortions/other families/client/UNO/refcount/full core/UI remain unverified.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T00:31:03.492Z — VERIFY — ok

    By: CODER

    Note: Native typing/redo owned internet fields/identity:6static;one absent profile2797pass/28fixturefail100%coverage;exactly28failedcases replaypass/33skip;inventory109/Chrome99/5sourceaudits pass.355oldtests retained;240states retained/newhelperunverified;scope/native hashes/artifact audit/exact-SHA qualitypass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T00:31:01.046Z, excerpt_hash=sha256:38a7f036f1e893a2f4412c527bd8b833f3a486cfecb396e2177dab36d9db2c53

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050013-PD1E0A/blueprint/resolved-snapshot.json
    - old_digest: ce4ac103638cdd8068d2be021f4e60790402e5f19c380daf99e09b2983098aaa
    - current_digest: ce4ac103638cdd8068d2be021f4e60790402e5f19c380daf99e09b2983098aaa
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050013-PD1E0A

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610050013-PD1E0A
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert semantic leaf commit without rewriting history."
  Findings: |-
    Native wrtsh1.cxx Insert calls editsh.cxx Insert2 -> DocumentContentOperationsManager.cxx InsertString -> ndtxt.cxx InsertText/Update;native unins.cxx RedoImpl calls InsertText with retained text rather than replacement fragments. Current collapsed shell always builds a plain formatted fragment and SwUndoInsert replaces ranges,losing inherited internet values/IDs/continuous attribute identity. Node explicit character items also rebuild a hyperlink DTO through caret projection. Existing UpdateTextHints already implements bounded native AUTO/INET start/end/DontExpand eligibility and native pure erase direction. This leaf connects the actual typing direction to that owner and overlays only existing automatic items;selection force expansion and full flags remain a real follow-up. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65;standing goal authorizes local safe work.

    - Observation: First absent app profile2797pass/28failed new matrix cases with100%coverage;all355prior test files passed. Concrete SwTextAttrNesting has native DontExpand=true/LockExpandFlag=true;new fixture attempted changing DontExpand without unlocking,so expected mutable flag masks were not installed.
      Impact: Fixture preparation error only;native constructor/locked setter/production logic must stay unchanged. Full passing suites/build must not replay.
      Resolution: Explicitly unlock the new fixture before assigning mutable flags. Replay only28failed full test names;passing33new cases skip. Existing native constructor-lock coverage remains intact.
extensions:
  implementation_commit:
    hash: "ad1fa4f1388096761f38fc59bef1a5c31609e118"
    message: "🧩 PD1E0A code: preserve owned internet items through native typing"
id_source: "generated"
---
## Summary

Restore native owned text insertion through collapsed typing and redo.

## Scope

- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation. Measured scope refinement:ndhints.ts would reach1010lines after the owned insertion overlay. Extract its existing generic clipHintOutsideRange unchanged into source-owned ndhints-range.ts,import it at existing callers;retain the1000-line gate. Register one responsibility-split and one whollyunverified runtime row;all240prior statuses/defaults/exceptions stay intact,current241. This necessary in-scope refactor is already authorized by the standing goal;no verification/risk/network drift.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static first;one sequential absent-reference profile;failed-only replays;restored source audits afterward.355 prior tests/240 runtime states preserved and exact native hashes recorded. No saved upstream sources or helpers in Agentplane.

## Verification

Command/results are recorded in evidence/static-gates.json,absent-profile.json,failed-case-replay.json,restored-source-audits.json and supplemental-checks.json. Six static gates passed before one absent-reference build/app/inventory/scripts/Chromium profile. App2797passed/28failed new fixture cases of2825/273files,100%lines/statements/functions/branches. Concrete nesting native defaults lock DontExpand;new mutable mask fixture explicitly unlocks only the28affected cases. Exactly28failed cases replayed absent:28passed/33skipped. Final conditional fixture refinement leaves those28inputs identical to replay and restores33passing inputs to first-profile defaults;literal set audit proves this. No production or prior-test changes after full profile;no passing suite/build replay. Inventory109/36files100%allfour,scripts5/2files,Chromium99passed;vendor finallyrestored. Five restoredsourceaudits passed,semanticViolationCount0. All355prior test files byte-identical;61newcases;240prior module states/defaults/exceptions preserved,four bounded responsibility appendices only;one whollyunverified extracted range helper,current241rows. Existing clip helper body unchanged. Seven native hashes,APignored-inclusive3872files/0forbidden before final artifacts. Scoped final fixture prettier/eslint pass. Doctor0errors/two unchanged legacywarnings,routingOK. Same-actor readonly EVALUATOR pass at semantic ad1fa4f1388096761f38fc59bef1a5c31609e118;.agentplane/tasks/202610050013-PD1E0A/quality/20261005-003039516-recovery-context/quality-report.json. Exact8paths/currentsource hashes checked;no independent-agent review claim. Selection FORCE/EMPTY/full Insert flags,empty hints/BuildPortions/other families/client/UNO/refcount/full core/UI remain unverified.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T00:31:03.492Z — VERIFY — ok

By: CODER

Note: Native typing/redo owned internet fields/identity:6static;one absent profile2797pass/28fixturefail100%coverage;exactly28failedcases replaypass/33skip;inventory109/Chrome99/5sourceaudits pass.355oldtests retained;240states retained/newhelperunverified;scope/native hashes/artifact audit/exact-SHA qualitypass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T00:31:01.046Z, excerpt_hash=sha256:38a7f036f1e893a2f4412c527bd8b833f3a486cfecb396e2177dab36d9db2c53

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050013-PD1E0A/blueprint/resolved-snapshot.json
- old_digest: ce4ac103638cdd8068d2be021f4e60790402e5f19c380daf99e09b2983098aaa
- current_digest: ce4ac103638cdd8068d2be021f4e60790402e5f19c380daf99e09b2983098aaa
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050013-PD1E0A

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610050013-PD1E0A
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert semantic leaf commit without rewriting history.

## Findings

Native wrtsh1.cxx Insert calls editsh.cxx Insert2 -> DocumentContentOperationsManager.cxx InsertString -> ndtxt.cxx InsertText/Update;native unins.cxx RedoImpl calls InsertText with retained text rather than replacement fragments. Current collapsed shell always builds a plain formatted fragment and SwUndoInsert replaces ranges,losing inherited internet values/IDs/continuous attribute identity. Node explicit character items also rebuild a hyperlink DTO through caret projection. Existing UpdateTextHints already implements bounded native AUTO/INET start/end/DontExpand eligibility and native pure erase direction. This leaf connects the actual typing direction to that owner and overlays only existing automatic items;selection force expansion and full flags remain a real follow-up. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65;standing goal authorizes local safe work.

- Observation: First absent app profile2797pass/28failed new matrix cases with100%coverage;all355prior test files passed. Concrete SwTextAttrNesting has native DontExpand=true/LockExpandFlag=true;new fixture attempted changing DontExpand without unlocking,so expected mutable flag masks were not installed.
  Impact: Fixture preparation error only;native constructor/locked setter/production logic must stay unchanged. Full passing suites/build must not replay.
  Resolution: Explicitly unlock the new fixture before assigning mutable flags. Replay only28failed full test names;passing33new cases skip. Existing native constructor-lock coverage remains intact.
