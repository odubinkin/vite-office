---
id: "202610061601-THKZ38"
title: "Port native absolute Writer column-page behavior"
result_summary: "Ported native absolute SwTableColumnPage and shared SwTableRep ownership to browser table properties; native field/mode/window/selection/spacing behavior and canonical grouped history verified without upstream runtime dependencies. Registered deviations and all prior metadata prefixes preserved."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on:
  - "202610061500-M9GQ62"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T18:01:41.134Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-06T18:40:08.882Z"
  updated_by: "CODER"
  note: "Verified native absolute Writer column-page behavior at implementation 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83: 13079 app,109 inventory,5 scripts,227 Chromium pass; actual100 coverage,65 filtered skips retained; scoped/static/source/governance/full-prefix checks pass. Same-agent EVALUATOR pass explicitly not independent review. Runtime/tests upstream-absent; registered deviations unchanged; whole parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T18:39:34.788Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA review of 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83 passes approved absolute column-page scope; explicitly not independent review."
  evaluated_sha: "7a6b96fdc3f6aea5d181fad1825a43a92e78fc83"
  blueprint_digest: "daf686179aec09ce17c30350310af7e302095a0d93fe137b7181e59f118de08c"
  evidence_refs:
    - ".agentplane/tasks/202610061601-THKZ38/README.md"
    - ".agentplane/tasks/202610061601-THKZ38/quality/20261006-183934788-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061601-THKZ38/quality/20261006-183934788-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061601-THKZ38/quality/20261006-183934788-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061601-THKZ38/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061601-THKZ38/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610061601-THKZ38/evidence/governance.json"
  findings:
    - "Current case identities 13079 application, 109 inventory, 5 scripts and 227 Chromium pass; 65 filtered skips retained. Actual100 coverage uses complete identical source/maps and verified prior editing-host counters. No passing/full replay."
    - "507 historical acceptance files byte-identical, one native-minimum migration, four new files; all276 prior metadata/full prefixes and registered deviations preserved; parent full prefix intact."
    - "Source-shaped column-page modes, metric/window bounds, Reset ownership, selected-table sensitivity, tab/Cancel/OK behavior and canonical grouped history match the represented upstream scope."
commit:
  hash: "7a6b96fdc3f6aea5d181fad1825a43a92e78fc83"
  message: "🚧 THKZ38 code: port native absolute Writer column-page state"
comments:
  -
    author: "CODER"
    body: "Start: port approved native absolute column-page owner and connect browser policy/controls under standing iterative authorization; retain all conscious I/O/recovery deviations and one absent full profile."
  -
    author: "CODER"
    body: "Start: resume the approved native absolute column-page draft on the clean post-priority baseline, preserving all row/column drag and list fixes; same semantic paths and verification criteria, updated authoritative counts only."
  -
    author: "CODER"
    body: "Verified: native absolute Writer column-page behavior is implemented in 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83; current13079app109inventory5scripts227Chromium pass, actual100 coverage,65 filtered skips retained, approved source/scope/governance and exact-SHA review pass. Whole parity remains unverified."
events:
  -
    type: "status"
    at: "2026-10-06T16:03:14.899Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port approved native absolute column-page owner and connect browser policy/controls under standing iterative authorization; retain all conscious I/O/recovery deviations and one absent full profile."
  -
    type: "status"
    at: "2026-10-06T18:01:42.235Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: resume the approved native absolute column-page draft on the clean post-priority baseline, preserving all row/column drag and list fixes; same semantic paths and verification criteria, updated authoritative counts only."
  -
    type: "verify"
    at: "2026-10-06T18:40:08.882Z"
    author: "CODER"
    state: "ok"
    note: "Verified native absolute Writer column-page behavior at implementation 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83: 13079 app,109 inventory,5 scripts,227 Chromium pass; actual100 coverage,65 filtered skips retained; scoped/static/source/governance/full-prefix checks pass. Same-agent EVALUATOR pass explicitly not independent review. Runtime/tests upstream-absent; registered deviations unchanged; whole parity remains unverified."
  -
    type: "status"
    at: "2026-10-06T18:40:51.166Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native absolute Writer column-page behavior is implemented in 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83; current13079app109inventory5scripts227Chromium pass, actual100 coverage,65 filtered skips retained, approved source/scope/governance and exact-SHA review pass. Whole parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-06T18:40:51.169Z"
doc_updated_by: "CODER"
description: "Iteration191 under the active upstream parity goal: replace React width-array edits with connected native SwTableColumnPage constant-width/adapt-table/proportional policies, modes and native field-window controls over SwTableRep. Preserve conscious save/open/recovery deviations; one approved leaf and one full absent profile, then only failed/new closures."
sections:
  Summary: "Implement source-owned absolute SwTableColumnPage over the shared native SwTableRep, removing React per-column array replacement. Match native default constant table width, adapt-table/proportional modes, input limits, adjacent-column compensation, native field-window controls and page activation/deactivation. This is one corrective leaf under the active full upstream-alignment goal; complete parity remains unverified."
  Scope: |-
    Approved semantic paths:
    - apps/office/src/sw/source/ui/table/tabledlg.ts
    - apps/office/src/sw/source/uibase/table/swtablerep.ts
    - apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    - apps/office/src/sw/browser/presentation/writer-view.tsx
    - apps/office/src/sw/source/ui/table/native-table-column-page.test.ts
    - apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
    - apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
    - apps/office/e2e/writer-native-table-column-page.spec.ts
    - apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    Native five field slots (MET_FIELDS5), disabled blank fields, one-column window scrolling, native absolute minima/maxima/mode sensitivity and remaining space. Native copy/assignment and represented flags in SwTableRep, source page handlers in tabledlg.ts; browser displays and invokes native handlers. Partial-selection context uses existing native IsTableMode/HasWholeTabSelection in writer-view, no browser topology inference. Migrate the one obsolete zero-width error expectation in WriterTableDialog.test.tsx to native positive minimum clipping, preserving all historical geometry/style/selection/input expectations.508 old acceptance files:507 byte-identical,1 native expectation migration;4new files512total. Preserve276 prior metadata states/defaults/classifications/full prefixes; append only new native symbols/evidence and qualification in existing tabledlg module, no semantic promotion/new runtime module. Command map/save/open/recovery exceptions unchanged. AP leaf lifecycle and entire498326-character parent Findings prefix SHA 8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 checkpoint allowed; AP only bounded English prose/counts/hashes/exact failures. Raw cases/maps/source snapshots/proofs only ignored apps/office/node_modules/.cache/parity-coverage. Native percentages, hidden/per-row graphs, full SfxItemSet/frame-format notifications, platform adaptive grow-to-fit SizeHdl and unrelated table/list/rendering families remain unverified and separate later tasks; do not silently claim them implemented.
  Plan: |-
    1. Port represented native SwTableRep independent copy/assignment and line-selected/column/width flags, preserving shared draft ownership during Reset.
    2. Implement connected absolute SwTableColumnPage Reset/Activate/ValueChanged/Modify/UpdateCols/Mode/Fill/Deactivate and five-field navigation, literal source minima/integer arithmetic, constant-width compensation, adapt-table cap, proportional scaling and native LR spacing reconciliation.
    3. Bind actual browser Columns page controls and page transitions to the native owner; remove React per-column array writes; pass native partial-selection context and submit final shared draft after page deactivation. Keep canonical model read-only until accepted and preserve Cancel.
    4. Add literal core cases, native document/history/list/ODT ownership, mounted control/mode/window/tab/minimum behavior and new real Chromium1280/390 acceptance; migrate only the known obsolete minimum error expectation.
    5. Run initial six static gates once and scoped unchanged JSDoc/physical checks; ONE full upstream-absent profile, then only original failed/new closures. Prove actual100 coverage, once-restored source/scope/security gates, exact implementation-SHA same-agent EVALUATOR phase (not independent review), scoped commits/clean leaf close and entire parent prefix checkpoint.
    Resume the approved interrupted draft against clean a5eec831c16ec5ea92f965c2435fc6383204affe;508prioracceptancefiles,276metadata,498326-character parent prefix; preserve stash and all priority fixes. Same paths and semantic/verification criteria; no material drift.
  Verify Steps: |-
    1. Initial six static gates npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc and actual physical lines<1000. Original failed or genuinely changed-path gates only afterward.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. All tests/runtime/E2E must never invoke pinned upstream. No source/scope/AP audits while any absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay. Actual100 app/inventory coverage via entire identical source/maps or complete contiguous byte-identical regions with whole declaration/body function and complete branch/location maps, actual counters only; focused skips stay skipped. Raw reports/maps/cases/source snapshots/proof only ignored app cache; AP bounded prose/counts/hashes.
    3. Literal SwTableRep copy/default flags/Assign independent vectors and Reset pointer ownership; source five field slots/default modes/native min23-or-smaller/max/min clipping/window guards; constant-width next-column compensation/wrap/minimum remainder/tiny-table source loop bound, adapt-table space cap and proportional integer-round/MINLAY23 behavior. Activate/source selection-sensitive modes/remaining space; Deactivate native orientation/side-spacing and width/column flags; tab reactivation and source Reset restore. Existing508 acceptance files507 byte-identical plus one native minimum migration;4new files512total. All historical selection/history/content/input/width assertions retained except the explicitly obsolete zero-width rejection replaced by source clamp contract.
    4. Actual shell/doc property application after native page edits: shared canonical table/row/box/text identities, cursor/list preservation, grouped UndoRedo3cycles, continued input and ODT roundtrip. Mounted/Chromium1280/390 modes, default neighbor balancing, proportional bounds, partial versus whole native selection sensitivity, window navigation across>5 columns, page switching/Cancel/OK/read-only Reset and no horizontal viewport escape. Build serves dist; rebuild only after production changes.
    5. Once restored resource generation --check/source-tree/provenance/invariants/parity. Preserve276 prior metadata states/defaults/classifications/full evidence/responsibility/justification/symbol prefixes, append only native column-page symbols/evidence in existing modules; I/O/recovery mappings byte-identical. Doctor/routing/diff/pinned source hashes/current leaf/generated quality census0forbidden. Same-agent EVALUATOR exact implementation-SHA review explicitly not independent; clean final tracked state. Parent entire498326-character prefix SHA 8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 preserved. Parent/goal ACTIVE, full parity UNVERIFIED.
  Verification: |-
    Command: npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size.
    Result: pass after original failed typecheck and genuinely changed-test type closure; initial six once.
    Evidence: static-gates.json/static-closure1.json and final failure-closure2.json typecheck record; changed-file-checks.json and changed-file-closure1/2/3.json.
    Scope: approved production and acceptance paths, unchanged JSDoc and physical lines<1000.

    Command: ONE upstream-absent npm run test:static; application and inventory coverage; scripts/check-source-provenance.test.ts and scripts/writer-ui-resource-model.test.ts; full Chromium via apps/office/playwright.config.ts.
    Result: pass for current case identities; initial mounted fixture failure corrected by failed/new-only focused closures.
    Evidence: absent-profile.json, failure-closure1/2.json, final-coverage.json, coverage-source-proof.json. Current13079app/109inventory/5scripts/227Chromium passed;65 focused skips retained.
    Scope: absolute native column modes/window/selection, canonical history/input/ODT, Chromium1280/390. Actual coverage100 L/S/F/B via identical source/maps only, including one verified prior identical editing-host map. Runtime never invokes upstream; restored finally.

    Command: restored npm resource generation --check/check:source-tree/check:source-provenance/inventory:invariants/inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: source-gates.json, scope-audit.json, source-review.json, governance.json, artifact-audit.json.
    Scope:276 preserved contracts/full prefixes;507old files byte-identical+1native-minimum migration+4new=512; registered deviations unchanged; parent full prefix retained;0forbidden current artifacts;0doctor errors and2known warnings.

    Command: same-agent EVALUATOR exact implementation-SHA review and ap evaluator run.
    Result: exact SHA result recorded after implementation commit; explicitly not independent review.
    Evidence: exact-sha-review.json and generated quality report.
    Scope: approved leaf only; parent/goal and whole parity remain ACTIVE/UNVERIFIED.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-06T18:40:08.882Z — VERIFY — ok

    By: CODER

    Note: Verified native absolute Writer column-page behavior at implementation 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83: 13079 app,109 inventory,5 scripts,227 Chromium pass; actual100 coverage,65 filtered skips retained; scoped/static/source/governance/full-prefix checks pass. Same-agent EVALUATOR pass explicitly not independent review. Runtime/tests upstream-absent; registered deviations unchanged; whole parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T18:38:23.940Z, excerpt_hash=sha256:80ef673df95d8c0212d07c5a599117792f6f8d10f349f443c869daead551773d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061601-THKZ38/blueprint/resolved-snapshot.json
    - old_digest: daf686179aec09ce17c30350310af7e302095a0d93fe137b7181e59f118de08c
    - current_digest: daf686179aec09ce17c30350310af7e302095a0d93fe137b7181e59f118de08c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610061601-THKZ38

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610061601-THKZ38 -m 🧩 THKZ38 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    Before implementation, preserve clean base138b1606d6178e3ca841597ada11fbcc67e1a500. Keep one scoped source commit and AP-only checkpoints; revert only this leaf's intentional paths if repair is necessary. Never reset unrelated work, edit DONE tasks or modify registered save/open/recovery deviations.
    Resume only this leaf's five draft paths on clean a5eec831c16ec5ea92f965c2435fc6383204affe; preserve the stash until leaf closure. Do not undo the priority mouse/list fixes.
  Findings: |-
    Implemented the native absolute SwTableColumnPage over the existing shared SwTableRep. React now presents source-owned metric values, compensation, modes, window navigation and remaining space. Native partial-table classification comes directly from IsTableMode/HasWholeTabSelection. SwTableRep copies and Assign retain independent reset ownership and the original shared vector; change flags use native defaults. Existing native property application, canonical table/row/box/text identities, list/cursor preservation, one grouped history, three UndoRedo cycles, continued input and ODT roundtrip are verified.

    ONE full upstream-absent profile: build passed; application 13076 passed and one new mounted fixture failed; inventory109, scripts5 and Chromium227 passed. Focused closure1 ran only that failure and two genuinely new cases: retained validation passed; the fixture used an ordinary object instead of SwPosition and the automatic-width case expected the pre-normalized width. Closure2 corrected those test-only errors and both passed. Current identity union: application13079, inventory109, scripts5, Chromium227 passed. Filtered65 skips remain skips. All runtime/tests/E2E ran without canonical upstream; restored finally. No production changes after the full profile; no historical passing/full replay.

    Initial static gates ran once. Format/lint/dependencies/docs/file-size passed. Initial type errors in new metric/test declarations were corrected; final typecheck passes. Unchanged scoped JSDoc, formatting, lint and physical line limits pass. Restored resource generation/source-tree/provenance/invariants/parity pass. A bounded read-only symbol lookup had no matches; route was recomputed and the actual declaration inspected. Initial metadata construction stopped before writes on missing optional browser fields; corrected optional evidence/rationale handling preserves all prior prefixes.

    Actual coverage100 in all four dimensions: application273 files L14724/S16155/F3744/B12002, map8b000cbbca0eac5a4b5f1b1749a1ce7803a64195c5034face8e79407010b231a; inventory38 files L1464/S1523/F384/B1080, map11dc2864301bd08eb0d3af37129a6e7172aaa51c74a3e0b38e22735eaae6cee6. Counters use entire identical source/maps. One unchanged editing-host map additionally reuses previously verified counters with complete source/map and prior map/proof digest checks, avoiding passing-case replay. Application proof087f386e722705ebee4cd0f69c56b6c461a51bd2aece7b6b290ea99bbc4b1566; inventory proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Raw source/maps/results/proofs stay only in ignored app cache; AP stores bounded outcomes/digests.

    Scope11 approved semantic paths;508 historical acceptance files507 byte-identical plus one explicit minimum-clipping migration;4new=512. All276 prior metadata contracts/full symbol/evidence/responsibility/rationale/justification prefixes, classifications/defaults/statuses and registered filename/I/O/recovery exceptions preserved. Parent full498326-character prefix SHA8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 retained. Original deferred stash c85f4a0e453dfd06d6e199554784f2c286737472 retained. Doctor0errors2known warnings; routing/diff pass; current leaf census0forbidden.

    Same current-agent EVALUATOR exact implementation-SHA review is explicitly not independent review. Native percentage widths, hidden/per-row column graphs, full SfxItemSet/frame-format notifications and native adaptive preferred-width SizeHdl remain UNVERIFIED. Parent and goal ACTIVE; whole implemented-runtime parity remains UNVERIFIED.
id_source: "generated"
---
## Summary

Implement source-owned absolute SwTableColumnPage over the shared native SwTableRep, removing React per-column array replacement. Match native default constant table width, adapt-table/proportional modes, input limits, adjacent-column compensation, native field-window controls and page activation/deactivation. This is one corrective leaf under the active full upstream-alignment goal; complete parity remains unverified.

## Scope

Approved semantic paths:
- apps/office/src/sw/source/ui/table/tabledlg.ts
- apps/office/src/sw/source/uibase/table/swtablerep.ts
- apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
- apps/office/src/sw/browser/presentation/writer-view.tsx
- apps/office/src/sw/source/ui/table/native-table-column-page.test.ts
- apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
- apps/office/src/sw/source/uibase/wrtsh/native-table-column-page-history.test.ts
- apps/office/e2e/writer-native-table-column-page.spec.ts
- apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
Native five field slots (MET_FIELDS5), disabled blank fields, one-column window scrolling, native absolute minima/maxima/mode sensitivity and remaining space. Native copy/assignment and represented flags in SwTableRep, source page handlers in tabledlg.ts; browser displays and invokes native handlers. Partial-selection context uses existing native IsTableMode/HasWholeTabSelection in writer-view, no browser topology inference. Migrate the one obsolete zero-width error expectation in WriterTableDialog.test.tsx to native positive minimum clipping, preserving all historical geometry/style/selection/input expectations.508 old acceptance files:507 byte-identical,1 native expectation migration;4new files512total. Preserve276 prior metadata states/defaults/classifications/full prefixes; append only new native symbols/evidence and qualification in existing tabledlg module, no semantic promotion/new runtime module. Command map/save/open/recovery exceptions unchanged. AP leaf lifecycle and entire498326-character parent Findings prefix SHA 8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 checkpoint allowed; AP only bounded English prose/counts/hashes/exact failures. Raw cases/maps/source snapshots/proofs only ignored apps/office/node_modules/.cache/parity-coverage. Native percentages, hidden/per-row graphs, full SfxItemSet/frame-format notifications, platform adaptive grow-to-fit SizeHdl and unrelated table/list/rendering families remain unverified and separate later tasks; do not silently claim them implemented.

## Plan

1. Port represented native SwTableRep independent copy/assignment and line-selected/column/width flags, preserving shared draft ownership during Reset.
2. Implement connected absolute SwTableColumnPage Reset/Activate/ValueChanged/Modify/UpdateCols/Mode/Fill/Deactivate and five-field navigation, literal source minima/integer arithmetic, constant-width compensation, adapt-table cap, proportional scaling and native LR spacing reconciliation.
3. Bind actual browser Columns page controls and page transitions to the native owner; remove React per-column array writes; pass native partial-selection context and submit final shared draft after page deactivation. Keep canonical model read-only until accepted and preserve Cancel.
4. Add literal core cases, native document/history/list/ODT ownership, mounted control/mode/window/tab/minimum behavior and new real Chromium1280/390 acceptance; migrate only the known obsolete minimum error expectation.
5. Run initial six static gates once and scoped unchanged JSDoc/physical checks; ONE full upstream-absent profile, then only original failed/new closures. Prove actual100 coverage, once-restored source/scope/security gates, exact implementation-SHA same-agent EVALUATOR phase (not independent review), scoped commits/clean leaf close and entire parent prefix checkpoint.
Resume the approved interrupted draft against clean a5eec831c16ec5ea92f965c2435fc6383204affe;508prioracceptancefiles,276metadata,498326-character parent prefix; preserve stash and all priority fixes. Same paths and semantic/verification criteria; no material drift.

## Verify Steps

1. Initial six static gates npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size once; unchanged scoped JSDoc and actual physical lines<1000. Original failed or genuinely changed-path gates only afterward.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile; counts/errors/hashes before assertions, vendor restored finally. All tests/runtime/E2E must never invoke pinned upstream. No source/scope/AP audits while any absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay. Actual100 app/inventory coverage via entire identical source/maps or complete contiguous byte-identical regions with whole declaration/body function and complete branch/location maps, actual counters only; focused skips stay skipped. Raw reports/maps/cases/source snapshots/proof only ignored app cache; AP bounded prose/counts/hashes.
3. Literal SwTableRep copy/default flags/Assign independent vectors and Reset pointer ownership; source five field slots/default modes/native min23-or-smaller/max/min clipping/window guards; constant-width next-column compensation/wrap/minimum remainder/tiny-table source loop bound, adapt-table space cap and proportional integer-round/MINLAY23 behavior. Activate/source selection-sensitive modes/remaining space; Deactivate native orientation/side-spacing and width/column flags; tab reactivation and source Reset restore. Existing508 acceptance files507 byte-identical plus one native minimum migration;4new files512total. All historical selection/history/content/input/width assertions retained except the explicitly obsolete zero-width rejection replaced by source clamp contract.
4. Actual shell/doc property application after native page edits: shared canonical table/row/box/text identities, cursor/list preservation, grouped UndoRedo3cycles, continued input and ODT roundtrip. Mounted/Chromium1280/390 modes, default neighbor balancing, proportional bounds, partial versus whole native selection sensitivity, window navigation across>5 columns, page switching/Cancel/OK/read-only Reset and no horizontal viewport escape. Build serves dist; rebuild only after production changes.
5. Once restored resource generation --check/source-tree/provenance/invariants/parity. Preserve276 prior metadata states/defaults/classifications/full evidence/responsibility/justification/symbol prefixes, append only native column-page symbols/evidence in existing modules; I/O/recovery mappings byte-identical. Doctor/routing/diff/pinned source hashes/current leaf/generated quality census0forbidden. Same-agent EVALUATOR exact implementation-SHA review explicitly not independent; clean final tracked state. Parent entire498326-character prefix SHA 8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 preserved. Parent/goal ACTIVE, full parity UNVERIFIED.

## Verification

Command: npm run format:check/lint/typecheck/check:dependencies/check:docs/check:file-size.
Result: pass after original failed typecheck and genuinely changed-test type closure; initial six once.
Evidence: static-gates.json/static-closure1.json and final failure-closure2.json typecheck record; changed-file-checks.json and changed-file-closure1/2/3.json.
Scope: approved production and acceptance paths, unchanged JSDoc and physical lines<1000.

Command: ONE upstream-absent npm run test:static; application and inventory coverage; scripts/check-source-provenance.test.ts and scripts/writer-ui-resource-model.test.ts; full Chromium via apps/office/playwright.config.ts.
Result: pass for current case identities; initial mounted fixture failure corrected by failed/new-only focused closures.
Evidence: absent-profile.json, failure-closure1/2.json, final-coverage.json, coverage-source-proof.json. Current13079app/109inventory/5scripts/227Chromium passed;65 focused skips retained.
Scope: absolute native column modes/window/selection, canonical history/input/ODT, Chromium1280/390. Actual coverage100 L/S/F/B via identical source/maps only, including one verified prior identical editing-host map. Runtime never invokes upstream; restored finally.

Command: restored npm resource generation --check/check:source-tree/check:source-provenance/inventory:invariants/inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: source-gates.json, scope-audit.json, source-review.json, governance.json, artifact-audit.json.
Scope:276 preserved contracts/full prefixes;507old files byte-identical+1native-minimum migration+4new=512; registered deviations unchanged; parent full prefix retained;0forbidden current artifacts;0doctor errors and2known warnings.

Command: same-agent EVALUATOR exact implementation-SHA review and ap evaluator run.
Result: exact SHA result recorded after implementation commit; explicitly not independent review.
Evidence: exact-sha-review.json and generated quality report.
Scope: approved leaf only; parent/goal and whole parity remain ACTIVE/UNVERIFIED.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-06T18:40:08.882Z — VERIFY — ok

By: CODER

Note: Verified native absolute Writer column-page behavior at implementation 7a6b96fdc3f6aea5d181fad1825a43a92e78fc83: 13079 app,109 inventory,5 scripts,227 Chromium pass; actual100 coverage,65 filtered skips retained; scoped/static/source/governance/full-prefix checks pass. Same-agent EVALUATOR pass explicitly not independent review. Runtime/tests upstream-absent; registered deviations unchanged; whole parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-06T18:38:23.940Z, excerpt_hash=sha256:80ef673df95d8c0212d07c5a599117792f6f8d10f349f443c869daead551773d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610061601-THKZ38/blueprint/resolved-snapshot.json
- old_digest: daf686179aec09ce17c30350310af7e302095a0d93fe137b7181e59f118de08c
- current_digest: daf686179aec09ce17c30350310af7e302095a0d93fe137b7181e59f118de08c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610061601-THKZ38

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610061601-THKZ38 -m 🧩 THKZ38 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Before implementation, preserve clean base138b1606d6178e3ca841597ada11fbcc67e1a500. Keep one scoped source commit and AP-only checkpoints; revert only this leaf's intentional paths if repair is necessary. Never reset unrelated work, edit DONE tasks or modify registered save/open/recovery deviations.
Resume only this leaf's five draft paths on clean a5eec831c16ec5ea92f965c2435fc6383204affe; preserve the stash until leaf closure. Do not undo the priority mouse/list fixes.

## Findings

Implemented the native absolute SwTableColumnPage over the existing shared SwTableRep. React now presents source-owned metric values, compensation, modes, window navigation and remaining space. Native partial-table classification comes directly from IsTableMode/HasWholeTabSelection. SwTableRep copies and Assign retain independent reset ownership and the original shared vector; change flags use native defaults. Existing native property application, canonical table/row/box/text identities, list/cursor preservation, one grouped history, three UndoRedo cycles, continued input and ODT roundtrip are verified.

ONE full upstream-absent profile: build passed; application 13076 passed and one new mounted fixture failed; inventory109, scripts5 and Chromium227 passed. Focused closure1 ran only that failure and two genuinely new cases: retained validation passed; the fixture used an ordinary object instead of SwPosition and the automatic-width case expected the pre-normalized width. Closure2 corrected those test-only errors and both passed. Current identity union: application13079, inventory109, scripts5, Chromium227 passed. Filtered65 skips remain skips. All runtime/tests/E2E ran without canonical upstream; restored finally. No production changes after the full profile; no historical passing/full replay.

Initial static gates ran once. Format/lint/dependencies/docs/file-size passed. Initial type errors in new metric/test declarations were corrected; final typecheck passes. Unchanged scoped JSDoc, formatting, lint and physical line limits pass. Restored resource generation/source-tree/provenance/invariants/parity pass. A bounded read-only symbol lookup had no matches; route was recomputed and the actual declaration inspected. Initial metadata construction stopped before writes on missing optional browser fields; corrected optional evidence/rationale handling preserves all prior prefixes.

Actual coverage100 in all four dimensions: application273 files L14724/S16155/F3744/B12002, map8b000cbbca0eac5a4b5f1b1749a1ce7803a64195c5034face8e79407010b231a; inventory38 files L1464/S1523/F384/B1080, map11dc2864301bd08eb0d3af37129a6e7172aaa51c74a3e0b38e22735eaae6cee6. Counters use entire identical source/maps. One unchanged editing-host map additionally reuses previously verified counters with complete source/map and prior map/proof digest checks, avoiding passing-case replay. Application proof087f386e722705ebee4cd0f69c56b6c461a51bd2aece7b6b290ea99bbc4b1566; inventory proofbba763d4d7885fd8e6c808012fa5076f978483a51ef15926e7e324b1ca130222. Raw source/maps/results/proofs stay only in ignored app cache; AP stores bounded outcomes/digests.

Scope11 approved semantic paths;508 historical acceptance files507 byte-identical plus one explicit minimum-clipping migration;4new=512. All276 prior metadata contracts/full symbol/evidence/responsibility/rationale/justification prefixes, classifications/defaults/statuses and registered filename/I/O/recovery exceptions preserved. Parent full498326-character prefix SHA8e681957baed7400f5dd4741dcafa425137b093a530b89e753948c3c134db654 retained. Original deferred stash c85f4a0e453dfd06d6e199554784f2c286737472 retained. Doctor0errors2known warnings; routing/diff pass; current leaf census0forbidden.

Same current-agent EVALUATOR exact implementation-SHA review is explicitly not independent review. Native percentage widths, hidden/per-row column graphs, full SfxItemSet/frame-format notifications and native adaptive preferred-width SizeHdl remain UNVERIFIED. Parent and goal ACTIVE; whole implemented-runtime parity remains UNVERIFIED.
