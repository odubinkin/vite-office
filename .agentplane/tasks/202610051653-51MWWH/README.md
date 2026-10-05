---
id: "202610051653-51MWWH"
title: "Reconstruct undo cursors from native numeric ranges"
result_summary: "Shared Writer undo cursor history now uses existing SwUndRng numeric coordinates and resolves current native nodes after payload execution. Removed cloneCursorState and private foreign graph fallbacks; actual post-delete/connected-row/split endpoints recorded.23new tests,408old files unchanged;12238distinct app,109inventory,5scripts,120Chromium closed; actual app/inventory100% coverage. Conscious IO/recovery exceptions preserved. Broader parity remains open."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T17:24:03.643Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T17:37:20.044Z"
  updated_by: "CODER"
  note: "Verified numeric SwUndRng cursor history and represented UI current-node boundaries at112f42df336efcf8d624a573d7e6183141df1310.23new;408old tests unchanged;250metadata states/defaults/exceptions preserved.12238distinct app,109inventory,5scripts,120Chromium closed using ONE absent full profile plus failed/new-only closure. Six statics finalpass, changed-file checks, final changed bundle, actual app/inventory100%L/S/F/B,5restored source audits0violations. Source maps only ignored appcache; no AP source/helper artifacts. Same-agent EVALUATOR pass exact semantic SHA. Existing payload identities/portable shell adjunct/full list/table/UI parity remain open; conscious IO/recovery exceptions preserved."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T17:37:18.632Z"
  updated_by: "EVALUATOR"
  note: "Exact semantic112f42df336e passes bounded numeric cursor history and current native UI boundary contract; broader parity remains open."
  evaluated_sha: "112f42df336efcf8d624a573d7e6183141df1310"
  blueprint_digest: "afb770965a00bb72f9d346c89ca0c93673bc6ec26a4aaa26a9ccbe9c0afec36a"
  evidence_refs:
    - ".agentplane/tasks/202610051653-51MWWH/README.md"
    - ".agentplane/tasks/202610051653-51MWWH/quality/20261005-173718632-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051653-51MWWH/quality/20261005-173718632-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051653-51MWWH/quality/20261005-173718632-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051653-51MWWH/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/scope-audit.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/final-coverage.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/browser-final-profile.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/final-bundle-build.json"
    - ".agentplane/tasks/202610051653-51MWWH/evidence/restored-source-audits.json"
  findings:
    - "Same agent in explicit EVALUATOR role reviewed exact semantic diff and concrete maps/results.23new cases;408prior tests byte-identical;250states/defaults/exceptions preserved;12238distinct app,109inventory,5scripts,120Chromium closed. ONE absent full profile and failed/new-only remediation, no passing replay; final bundle production hashes agree; app/inventory100% actual source-aligned counters."
commit:
  hash: "13bcda7721828861c26b8c2ea738ce2b663263ed"
  message: "🧩 51MWWH task: record exact commit verification"
comments:
  -
    author: "CODER"
    body: "Start: replace shared retained node cursor snapshots with native numeric current-context range reconstruction under standing user authorization."
  -
    author: "CODER"
    body: "Start: source-confirmed post-mutation capture integration for155original failed app and3Chromium cases; no assertion changes or passing replay."
  -
    author: "CODER"
    body: "Start: remove obsolete private foreign cursor fallback, one genuinely new replacement/composition/current-native-history case, final changed bundle for3failed Chromium only."
  -
    author: "CODER"
    body: "Verified: Shared numeric native cursor history replaces retained node-reference boundaries; represented selected deletion/table row/split current endpoints and private shell cleanup verified.23new cases;408prior tests unchanged;12238distinct app,109inventory,5scripts,120Chromium closed. App/inventory actual100%L/S/F/B, ONE absent full profile and only failed/new cases,5restored source audits0violations. Exact semantic EVALUATOR pass; full list/table/UI parity and action payload identity migration remain open."
events:
  -
    type: "status"
    at: "2026-10-05T16:55:12.642Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace shared retained node cursor snapshots with native numeric current-context range reconstruction under standing user authorization."
  -
    type: "status"
    at: "2026-10-05T17:11:52.026Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: source-confirmed post-mutation capture integration for155original failed app and3Chromium cases; no assertion changes or passing replay."
  -
    type: "status"
    at: "2026-10-05T17:24:05.340Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: remove obsolete private foreign cursor fallback, one genuinely new replacement/composition/current-native-history case, final changed bundle for3failed Chromium only."
  -
    type: "verify"
    at: "2026-10-05T17:37:20.044Z"
    author: "CODER"
    state: "ok"
    note: "Verified numeric SwUndRng cursor history and represented UI current-node boundaries at112f42df336efcf8d624a573d7e6183141df1310.23new;408old tests unchanged;250metadata states/defaults/exceptions preserved.12238distinct app,109inventory,5scripts,120Chromium closed using ONE absent full profile plus failed/new-only closure. Six statics finalpass, changed-file checks, final changed bundle, actual app/inventory100%L/S/F/B,5restored source audits0violations. Source maps only ignored appcache; no AP source/helper artifacts. Same-agent EVALUATOR pass exact semantic SHA. Existing payload identities/portable shell adjunct/full list/table/UI parity remain open; conscious IO/recovery exceptions preserved."
  -
    type: "status"
    at: "2026-10-05T17:38:03.546Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Shared numeric native cursor history replaces retained node-reference boundaries; represented selected deletion/table row/split current endpoints and private shell cleanup verified.23new cases;408prior tests unchanged;12238distinct app,109inventory,5scripts,120Chromium closed. App/inventory actual100%L/S/F/B, ONE absent full profile and only failed/new cases,5restored source audits0violations. Exact semantic EVALUATOR pass; full list/table/UI parity and action payload identity migration remain open."
doc_version: 3
doc_updated_at: "2026-10-05T17:38:03.547Z"
doc_updated_by: "CODER"
description: "Replace retained SwTextNode cursor snapshots in shared SwUndo with native SwUndRng numeric coordinates and current-document reconstruction, preserving direction, active node, pending items and table mode. Necessary prerequisite to removing retained split identity bridge; physical split and action payload references remain separate unverified work."
sections:
  Summary: "Use existing native numeric undo range infrastructure to reconstruct shared shell cursor boundaries against current nodes rather than retaining original SwTextNode objects."
  Scope: "apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/unins.ts, apps/office/src/sw/source/core/undo/undel.ts, apps/office/src/sw/source/core/undo/unspnd.ts, apps/office/src/sw/source/core/undo/native-cursor-range-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json, apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts;408prior tests unchanged, genuinely new model replacement case only."
  Plan: "Iteration156 replace shared undo cursor node retention with represented native numeric SwUndRng coordinates and current-context reconstruction. Pinned undobj.cxx SwUndRng::SetValues stores sorted absolute node/content indices plus COMPLETE_STRING no-mark sentinel; SetPaM reconstructs current nodes. Capture portable shell boundary coordinates directly into existing SwUndRng without live positions, because predicted post-action content offsets can be beyond pre-action Len. Retain direction and active native node index/table flag/pending items as existing portable shell boundary adjuncts; pending items independently cloned at capture and reconstruction. Remove cloneCursorState node-reference retention. Reconstruct actual SwPaM through existing SwUndRng.SetPaM after payload execution; direction restored by Exchange, no new TextRuns/DTO projection or retained document/node graph. GetAfterCursorState takes current document explicitly; three existing callers updated without changing payload behavior. Seven paths (undobj/unins/undel/unspnd/newnative test/provenance/inventory),408prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved; additive evidence only shared undobj owner. Real native current-node replacement tests cover body/cell endpoints, forward/backward/equal/nomark selections, independent active target, table flag variants, input/pending mutation, future offsets after payload, getter/setter grouping and actual shell restoration/UndoRedo. Action payload node pointers and physical split retained identity still require separate migration, no blanket claim. Six statics then ONE absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure. Persist exact failures before assertions, only failed/new cases/gates retried, skipped recorded skipped; no passing replay. Vendor try/finally restore before5source audits/scope/AP scans. Actual app/inventory100%L/S/F/B, maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/native probes/rawdiffs/sourceframes/diagnostics; no network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies. Source-confirmed initial failures155app/3Chromium require9-path integration refinement, no old assertion edits. Native after-deletion cursor coordinates must be recorded at completed mutation through actual SwPosition/SwUndRng.SetValues; selected deletion records after only once, sequential per-cell children use live local active endpoints and completed native final point rather than preprojected removed nodes. Existing table-row history constructs before new sections are connected, so records before numeric point immediately, after only once row is connected using actual first cell and independently cloned pending items. Split Redo records native new-paragraph content0 without resolving malformed pre-split after forecasts. Add protected current-point capture to existing SwUndo instead of index arithmetic/fallback adapter. No raw node cursor history retention, no failed tests weakened, no passing cases/profile replay.155original failed app+3Chromium only for closure;22new cases alreadypass. Changed-file statics, actual merged counters with verified unchanged-source matching for final deltas, final source audits after restoration. Initial full build covers initial variant; changed final production validated by no-emit actual config and failed browser Vite compilation, no passing build replay. Completion refinement scope10paths: numeric context boundaries make private RestoreCursorState foreign-document fallback/mark filtering/active fallback obsolete; native current point/mark/active owner assigned directly, existing offset handling retained. Composition is shell-local and DocumentReplaced cancels composition/history, so add one genuinely new public replacement/composition/new numeric history case and verify it absent, no previous passed case replay. Browser config serves dist via preview; failed-only browser retry still used initial obsolete build. Prepare final changed-source app bundle once via npm run build --workspace @vite-office/office (new unbuilt variant, not replaying full test:static/statically passing suite), then only3remainingfailed Chromium. Initial selection attempt matched0 because full title ancestry; subsequent report recovery read actual3failed without rerunning. Final source-aligned coverage carried only actual unchanged contiguous counters; dead obsolete fallback branches removed and new changed shell body verified by genuinely new case."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename inside repo try/finally, restore before audits; tests never access/invoke upstream. Exact failures saved before assertions; only failed/new cases retried, no passing replay, skipped=skipped. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
    3. New actual native-node replacement/current-context cursor reconstruction tests prove numeric coordinates, direction/no-mark/equal marks, current body/cell nodes, active node/table mode, pending independent clone, mutable input ownership, future after-action offsets, grouping getter/setter and real shell history.408prior files unchanged;250states/defaults/classifications/exceptions/prior evidence preserved, additive shared-owner evidence only. Existing action payload pointers and physical split identity remain unverified, no whole-module promotion.
    4. After vendor restored: resource generation --check,source-tree,source-provenance,inventory invariants/parity; scoped diff/prior tests/defaults/AP forbidden artifacts scan. Semantic commit exact SHA same-agent explicit EVALUATOR review, recorded verify/canonical finish/parent checkpoint and clean tracked main. Broad goal active.
    5. Required integration refinement preserves all408prior files/values: source-confirmed post-mutation numeric cursor capture for cross-node/cell deletion, sequential child active point, connected table-row after point and native split offset0. Retry155failed app and3failed Chromium only;22new cases not replayed. Validate changed final source statics and actual coverage locations, no fabricated/remapped counters without source identity proof.
    6. Remove unreachable private foreign cursor fallback now all history boundaries resolve current-context nodes and model replacement cancels composition/history. New public model replacement/composition cancellation/current native history case executes once absent. Final changed-source app bundle must be rebuilt for preview-based3failed Chromium closure; no repeat full profile/static gates/passed tests. Actual final coverage100% via unchanged source identity and new/failed-only counters.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T17:37:20.044Z — VERIFY — ok

    By: CODER

    Note: Verified numeric SwUndRng cursor history and represented UI current-node boundaries at112f42df336efcf8d624a573d7e6183141df1310.23new;408old tests unchanged;250metadata states/defaults/exceptions preserved.12238distinct app,109inventory,5scripts,120Chromium closed using ONE absent full profile plus failed/new-only closure. Six statics finalpass, changed-file checks, final changed bundle, actual app/inventory100%L/S/F/B,5restored source audits0violations. Source maps only ignored appcache; no AP source/helper artifacts. Same-agent EVALUATOR pass exact semantic SHA. Existing payload identities/portable shell adjunct/full list/table/UI parity remain open; conscious IO/recovery exceptions preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T17:35:25.188Z, excerpt_hash=sha256:19b5d43b6750ec07a466c5edb57cde1caf80e2e0808cfc95681f7541bc13b7e3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051653-51MWWH/blueprint/resolved-snapshot.json
    - old_digest: afb770965a00bb72f9d346c89ca0c93673bc6ec26a4aaa26a9ccbe9c0afec36a
    - current_digest: afb770965a00bb72f9d346c89ca0c93673bc6ec26a4aaa26a9ccbe9c0afec36a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610051653-51MWWH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610051653-51MWWH -m 🧩 51MWWH task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf semantic commit through a new approved task; preserve all other iteration history and conscious IO/recovery deviations."
  Findings: |-
    Iteration156 verified bounded progress. Shared SwUndo cursor boundaries use existing SwUndRng absolute node/content indices and COMPLETE_STRING no-mark sentinel rather than retained node-reference snapshots. Current native nodes are reconstructed after payload execution through actual SwPosition/SwPaM/SwUndRng.SetPaM; selection direction, independent active numeric target, table mode and independently cloned pending items remain portable shell adjuncts. Capture supports predicted future content offsets without registering invalid live positions. Grouping receives current document explicitly. Old cloneCursorState removed. Numeric boundaries exposed stale forecast dependencies: source-confirmed completed deletion points now recorded from live SwPosition, per-cell initial actions use current local active endpoints/final outer native point, table insertion records after only once new cell sections are connected, split Redo uses native content0. Private shell foreign-document fallback/mark filtering/active substitution removed; document replacement already cancels composition and history.

    Evidence:23new cases;18direction/mark/body-cell/table-mode combinations, mutable input/pending ownership, future offsets, grouping updates, real shell native node replacement cycles and document replacement/composition cancellation. All408prior test files byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved; additive5existing owner evidence,10scope paths. Six statics finalpass, one initial newtest lint failure corrected and only failed gate repeated. Changed-file statics passed. ONE full upstream-absent build/app/inventory/scripts/Chromium profile:12082app pass/155fail of12237;109inventory/5scripts pass;117Chromium pass/3fail. Exact failures persisted before assertions. Only155failed app cases repeated, all pass,702skipped. One genuinely new replacement case passes,22prior new cases skipped. Browser selection attempt matched0 because title ancestry; next3failed retry ran initial stale dist, actual fresh report recovered read-only after filename mismatch. New final changed-source bundle built once because preview serves dist; only3remainingfailed Chromium pass. No passing test/suite/profile replay.

    Final distinct12238app in312files,109inventory in36files,5scripts in2files,120Chromium. Actual app/inventory100%L/S/F/B; app12355lines/13527statements/3376functions/10067branches;inventory1464/1523/384/1080. Changed source counter audit initially merged old/new shell maps and showed obsolete prior locations; fixed by excluding obsolete shell map, using current actual extra-case map and exact hashed contiguous unchanged initial source locations. No fabricated counters; maps/local initial source variants only ignored appcache. Browser closure actual failure names match original file/leaf titles, preserving ancestry in original record. Five restored source audits pass0semantic violations. Ignored-inclusive AP scan4229files0forbidden before semantic review,doctor0errors2pre-existingwarnings,routingOK. No upstream copies/helpers/Python/native probes/binaries/raw diffs/source frames/diagnostics in AP; vendor finally restored after all profiles; no network/outside/global/subagents.

    Limits:SwUndo still owns portable before/after shell adjuncts unlike native base; numeric shared cursor reconstruction does not remove existing action payload paragraph/row/table node identity bridges. Native split physical node ownership, complete undo-area/CutImpl/client/frame/redline/field lifetimes and broad UI/list/table merged/nested/protected/layout/clipboard remain unverified. Conscious save/open/recovery deviations unchanged. No whole-module or broad parity promotion; parent DOING,goal active.
extensions:
  implementation_commit:
    hash: "112f42df336efcf8d624a573d7e6183141df1310"
    message: "🧩 51MWWH code: restore undo cursors from native numeric ranges"
id_source: "generated"
---
## Summary

Use existing native numeric undo range infrastructure to reconstruct shared shell cursor boundaries against current nodes rather than retaining original SwTextNode objects.

## Scope

apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/unins.ts, apps/office/src/sw/source/core/undo/undel.ts, apps/office/src/sw/source/core/undo/unspnd.ts, apps/office/src/sw/source/core/undo/native-cursor-range-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json, apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/core/undo/untbl.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts;408prior tests unchanged, genuinely new model replacement case only.

## Plan

Iteration156 replace shared undo cursor node retention with represented native numeric SwUndRng coordinates and current-context reconstruction. Pinned undobj.cxx SwUndRng::SetValues stores sorted absolute node/content indices plus COMPLETE_STRING no-mark sentinel; SetPaM reconstructs current nodes. Capture portable shell boundary coordinates directly into existing SwUndRng without live positions, because predicted post-action content offsets can be beyond pre-action Len. Retain direction and active native node index/table flag/pending items as existing portable shell boundary adjuncts; pending items independently cloned at capture and reconstruction. Remove cloneCursorState node-reference retention. Reconstruct actual SwPaM through existing SwUndRng.SetPaM after payload execution; direction restored by Exchange, no new TextRuns/DTO projection or retained document/node graph. GetAfterCursorState takes current document explicitly; three existing callers updated without changing payload behavior. Seven paths (undobj/unins/undel/unspnd/newnative test/provenance/inventory),408prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved; additive evidence only shared undobj owner. Real native current-node replacement tests cover body/cell endpoints, forward/backward/equal/nomark selections, independent active target, table flag variants, input/pending mutation, future offsets after payload, getter/setter grouping and actual shell restoration/UndoRedo. Action payload node pointers and physical split retained identity still require separate migration, no blanket claim. Six statics then ONE absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure. Persist exact failures before assertions, only failed/new cases/gates retried, skipped recorded skipped; no passing replay. Vendor try/finally restore before5source audits/scope/AP scans. Actual app/inventory100%L/S/F/B, maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/native probes/rawdiffs/sourceframes/diagnostics; no network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies. Source-confirmed initial failures155app/3Chromium require9-path integration refinement, no old assertion edits. Native after-deletion cursor coordinates must be recorded at completed mutation through actual SwPosition/SwUndRng.SetValues; selected deletion records after only once, sequential per-cell children use live local active endpoints and completed native final point rather than preprojected removed nodes. Existing table-row history constructs before new sections are connected, so records before numeric point immediately, after only once row is connected using actual first cell and independently cloned pending items. Split Redo records native new-paragraph content0 without resolving malformed pre-split after forecasts. Add protected current-point capture to existing SwUndo instead of index arithmetic/fallback adapter. No raw node cursor history retention, no failed tests weakened, no passing cases/profile replay.155original failed app+3Chromium only for closure;22new cases alreadypass. Changed-file statics, actual merged counters with verified unchanged-source matching for final deltas, final source audits after restoration. Initial full build covers initial variant; changed final production validated by no-emit actual config and failed browser Vite compilation, no passing build replay. Completion refinement scope10paths: numeric context boundaries make private RestoreCursorState foreign-document fallback/mark filtering/active fallback obsolete; native current point/mark/active owner assigned directly, existing offset handling retained. Composition is shell-local and DocumentReplaced cancels composition/history, so add one genuinely new public replacement/composition/new numeric history case and verify it absent, no previous passed case replay. Browser config serves dist via preview; failed-only browser retry still used initial obsolete build. Prepare final changed-source app bundle once via npm run build --workspace @vite-office/office (new unbuilt variant, not replaying full test:static/statically passing suite), then only3remainingfailed Chromium. Initial selection attempt matched0 because full title ancestry; subsequent report recovery read actual3failed without rerunning. Final source-aligned coverage carried only actual unchanged contiguous counters; dead obsolete fallback branches removed and new changed shell body verified by genuinely new case.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename inside repo try/finally, restore before audits; tests never access/invoke upstream. Exact failures saved before assertions; only failed/new cases retried, no passing replay, skipped=skipped. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
3. New actual native-node replacement/current-context cursor reconstruction tests prove numeric coordinates, direction/no-mark/equal marks, current body/cell nodes, active node/table mode, pending independent clone, mutable input ownership, future after-action offsets, grouping getter/setter and real shell history.408prior files unchanged;250states/defaults/classifications/exceptions/prior evidence preserved, additive shared-owner evidence only. Existing action payload pointers and physical split identity remain unverified, no whole-module promotion.
4. After vendor restored: resource generation --check,source-tree,source-provenance,inventory invariants/parity; scoped diff/prior tests/defaults/AP forbidden artifacts scan. Semantic commit exact SHA same-agent explicit EVALUATOR review, recorded verify/canonical finish/parent checkpoint and clean tracked main. Broad goal active.
5. Required integration refinement preserves all408prior files/values: source-confirmed post-mutation numeric cursor capture for cross-node/cell deletion, sequential child active point, connected table-row after point and native split offset0. Retry155failed app and3failed Chromium only;22new cases not replayed. Validate changed final source statics and actual coverage locations, no fabricated/remapped counters without source identity proof.
6. Remove unreachable private foreign cursor fallback now all history boundaries resolve current-context nodes and model replacement cancels composition/history. New public model replacement/composition cancellation/current native history case executes once absent. Final changed-source app bundle must be rebuilt for preview-based3failed Chromium closure; no repeat full profile/static gates/passed tests. Actual final coverage100% via unchanged source identity and new/failed-only counters.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T17:37:20.044Z — VERIFY — ok

By: CODER

Note: Verified numeric SwUndRng cursor history and represented UI current-node boundaries at112f42df336efcf8d624a573d7e6183141df1310.23new;408old tests unchanged;250metadata states/defaults/exceptions preserved.12238distinct app,109inventory,5scripts,120Chromium closed using ONE absent full profile plus failed/new-only closure. Six statics finalpass, changed-file checks, final changed bundle, actual app/inventory100%L/S/F/B,5restored source audits0violations. Source maps only ignored appcache; no AP source/helper artifacts. Same-agent EVALUATOR pass exact semantic SHA. Existing payload identities/portable shell adjunct/full list/table/UI parity remain open; conscious IO/recovery exceptions preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T17:35:25.188Z, excerpt_hash=sha256:19b5d43b6750ec07a466c5edb57cde1caf80e2e0808cfc95681f7541bc13b7e3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610051653-51MWWH/blueprint/resolved-snapshot.json
- old_digest: afb770965a00bb72f9d346c89ca0c93673bc6ec26a4aaa26a9ccbe9c0afec36a
- current_digest: afb770965a00bb72f9d346c89ca0c93673bc6ec26a4aaa26a9ccbe9c0afec36a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610051653-51MWWH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610051653-51MWWH -m 🧩 51MWWH task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf semantic commit through a new approved task; preserve all other iteration history and conscious IO/recovery deviations.

## Findings

Iteration156 verified bounded progress. Shared SwUndo cursor boundaries use existing SwUndRng absolute node/content indices and COMPLETE_STRING no-mark sentinel rather than retained node-reference snapshots. Current native nodes are reconstructed after payload execution through actual SwPosition/SwPaM/SwUndRng.SetPaM; selection direction, independent active numeric target, table mode and independently cloned pending items remain portable shell adjuncts. Capture supports predicted future content offsets without registering invalid live positions. Grouping receives current document explicitly. Old cloneCursorState removed. Numeric boundaries exposed stale forecast dependencies: source-confirmed completed deletion points now recorded from live SwPosition, per-cell initial actions use current local active endpoints/final outer native point, table insertion records after only once new cell sections are connected, split Redo uses native content0. Private shell foreign-document fallback/mark filtering/active substitution removed; document replacement already cancels composition and history.

Evidence:23new cases;18direction/mark/body-cell/table-mode combinations, mutable input/pending ownership, future offsets, grouping updates, real shell native node replacement cycles and document replacement/composition cancellation. All408prior test files byte-identical;250states/defaults/classifications/exceptions/prior evidence preserved; additive5existing owner evidence,10scope paths. Six statics finalpass, one initial newtest lint failure corrected and only failed gate repeated. Changed-file statics passed. ONE full upstream-absent build/app/inventory/scripts/Chromium profile:12082app pass/155fail of12237;109inventory/5scripts pass;117Chromium pass/3fail. Exact failures persisted before assertions. Only155failed app cases repeated, all pass,702skipped. One genuinely new replacement case passes,22prior new cases skipped. Browser selection attempt matched0 because title ancestry; next3failed retry ran initial stale dist, actual fresh report recovered read-only after filename mismatch. New final changed-source bundle built once because preview serves dist; only3remainingfailed Chromium pass. No passing test/suite/profile replay.

Final distinct12238app in312files,109inventory in36files,5scripts in2files,120Chromium. Actual app/inventory100%L/S/F/B; app12355lines/13527statements/3376functions/10067branches;inventory1464/1523/384/1080. Changed source counter audit initially merged old/new shell maps and showed obsolete prior locations; fixed by excluding obsolete shell map, using current actual extra-case map and exact hashed contiguous unchanged initial source locations. No fabricated counters; maps/local initial source variants only ignored appcache. Browser closure actual failure names match original file/leaf titles, preserving ancestry in original record. Five restored source audits pass0semantic violations. Ignored-inclusive AP scan4229files0forbidden before semantic review,doctor0errors2pre-existingwarnings,routingOK. No upstream copies/helpers/Python/native probes/binaries/raw diffs/source frames/diagnostics in AP; vendor finally restored after all profiles; no network/outside/global/subagents.

Limits:SwUndo still owns portable before/after shell adjuncts unlike native base; numeric shared cursor reconstruction does not remove existing action payload paragraph/row/table node identity bridges. Native split physical node ownership, complete undo-area/CutImpl/client/frame/redline/field lifetimes and broad UI/list/table merged/nested/protected/layout/clipboard remain unverified. Conscious save/open/recovery deviations unchanged. No whole-module or broad parity promotion; parent DOING,goal active.
