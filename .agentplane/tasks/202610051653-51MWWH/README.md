---
id: "202610051653-51MWWH"
title: "Reconstruct undo cursors from native numeric ranges"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T17:11:50.782Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace shared retained node cursor snapshots with native numeric current-context range reconstruction under standing user authorization."
  -
    author: "CODER"
    body: "Start: source-confirmed post-mutation capture integration for155original failed app and3Chromium cases; no assertion changes or passing replay."
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
doc_version: 3
doc_updated_at: "2026-10-05T17:11:52.026Z"
doc_updated_by: "CODER"
description: "Replace retained SwTextNode cursor snapshots in shared SwUndo with native SwUndRng numeric coordinates and current-document reconstruction, preserving direction, active node, pending items and table mode. Necessary prerequisite to removing retained split identity bridge; physical split and action payload references remain separate unverified work."
sections:
  Summary: "Use existing native numeric undo range infrastructure to reconstruct shared shell cursor boundaries against current nodes rather than retaining original SwTextNode objects."
  Scope: "apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/unins.ts, apps/office/src/sw/source/core/undo/undel.ts, apps/office/src/sw/source/core/undo/unspnd.ts, apps/office/src/sw/source/core/undo/native-cursor-range-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json, apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/core/undo/untbl.ts; source-confirmed mutation-boundary coordinate capture; all408prior tests unchanged."
  Plan: "Iteration156 replace shared undo cursor node retention with represented native numeric SwUndRng coordinates and current-context reconstruction. Pinned undobj.cxx SwUndRng::SetValues stores sorted absolute node/content indices plus COMPLETE_STRING no-mark sentinel; SetPaM reconstructs current nodes. Capture portable shell boundary coordinates directly into existing SwUndRng without live positions, because predicted post-action content offsets can be beyond pre-action Len. Retain direction and active native node index/table flag/pending items as existing portable shell boundary adjuncts; pending items independently cloned at capture and reconstruction. Remove cloneCursorState node-reference retention. Reconstruct actual SwPaM through existing SwUndRng.SetPaM after payload execution; direction restored by Exchange, no new TextRuns/DTO projection or retained document/node graph. GetAfterCursorState takes current document explicitly; three existing callers updated without changing payload behavior. Seven paths (undobj/unins/undel/unspnd/newnative test/provenance/inventory),408prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved; additive evidence only shared undobj owner. Real native current-node replacement tests cover body/cell endpoints, forward/backward/equal/nomark selections, independent active target, table flag variants, input/pending mutation, future offsets after payload, getter/setter grouping and actual shell restoration/UndoRedo. Action payload node pointers and physical split retained identity still require separate migration, no blanket claim. Six statics then ONE absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure. Persist exact failures before assertions, only failed/new cases/gates retried, skipped recorded skipped; no passing replay. Vendor try/finally restore before5source audits/scope/AP scans. Actual app/inventory100%L/S/F/B, maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/native probes/rawdiffs/sourceframes/diagnostics; no network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies. Source-confirmed initial failures155app/3Chromium require9-path integration refinement, no old assertion edits. Native after-deletion cursor coordinates must be recorded at completed mutation through actual SwPosition/SwUndRng.SetValues; selected deletion records after only once, sequential per-cell children use live local active endpoints and completed native final point rather than preprojected removed nodes. Existing table-row history constructs before new sections are connected, so records before numeric point immediately, after only once row is connected using actual first cell and independently cloned pending items. Split Redo records native new-paragraph content0 without resolving malformed pre-split after forecasts. Add protected current-point capture to existing SwUndo instead of index arithmetic/fallback adapter. No raw node cursor history retention, no failed tests weakened, no passing cases/profile replay.155original failed app+3Chromium only for closure;22new cases alreadypass. Changed-file statics, actual merged counters with verified unchanged-source matching for final deltas, final source audits after restoration. Initial full build covers initial variant; changed final production validated by no-emit actual config and failed browser Vite compilation, no passing build replay."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename inside repo try/finally, restore before audits; tests never access/invoke upstream. Exact failures saved before assertions; only failed/new cases retried, no passing replay, skipped=skipped. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
    3. New actual native-node replacement/current-context cursor reconstruction tests prove numeric coordinates, direction/no-mark/equal marks, current body/cell nodes, active node/table mode, pending independent clone, mutable input ownership, future after-action offsets, grouping getter/setter and real shell history.408prior files unchanged;250states/defaults/classifications/exceptions/prior evidence preserved, additive shared-owner evidence only. Existing action payload pointers and physical split identity remain unverified, no whole-module promotion.
    4. After vendor restored: resource generation --check,source-tree,source-provenance,inventory invariants/parity; scoped diff/prior tests/defaults/AP forbidden artifacts scan. Semantic commit exact SHA same-agent explicit EVALUATOR review, recorded verify/canonical finish/parent checkpoint and clean tracked main. Broad goal active.
    5. Required integration refinement preserves all408prior files/values: source-confirmed post-mutation numeric cursor capture for cross-node/cell deletion, sequential child active point, connected table-row after point and native split offset0. Retry155failed app and3failed Chromium only;22new cases not replayed. Validate changed final source statics and actual coverage locations, no fabricated/remapped counters without source identity proof.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf semantic commit through a new approved task; preserve all other iteration history and conscious IO/recovery deviations."
  Findings: ""
id_source: "generated"
---
## Summary

Use existing native numeric undo range infrastructure to reconstruct shared shell cursor boundaries against current nodes rather than retaining original SwTextNode objects.

## Scope

apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/unins.ts, apps/office/src/sw/source/core/undo/undel.ts, apps/office/src/sw/source/core/undo/unspnd.ts, apps/office/src/sw/source/core/undo/native-cursor-range-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json, apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/core/undo/untbl.ts; source-confirmed mutation-boundary coordinate capture; all408prior tests unchanged.

## Plan

Iteration156 replace shared undo cursor node retention with represented native numeric SwUndRng coordinates and current-context reconstruction. Pinned undobj.cxx SwUndRng::SetValues stores sorted absolute node/content indices plus COMPLETE_STRING no-mark sentinel; SetPaM reconstructs current nodes. Capture portable shell boundary coordinates directly into existing SwUndRng without live positions, because predicted post-action content offsets can be beyond pre-action Len. Retain direction and active native node index/table flag/pending items as existing portable shell boundary adjuncts; pending items independently cloned at capture and reconstruction. Remove cloneCursorState node-reference retention. Reconstruct actual SwPaM through existing SwUndRng.SetPaM after payload execution; direction restored by Exchange, no new TextRuns/DTO projection or retained document/node graph. GetAfterCursorState takes current document explicitly; three existing callers updated without changing payload behavior. Seven paths (undobj/unins/undel/unspnd/newnative test/provenance/inventory),408prior tests unchanged,250states/defaults/classifications/exceptions/prior evidence preserved; additive evidence only shared undobj owner. Real native current-node replacement tests cover body/cell endpoints, forward/backward/equal/nomark selections, independent active target, table flag variants, input/pending mutation, future offsets after payload, getter/setter grouping and actual shell restoration/UndoRedo. Action payload node pointers and physical split retained identity still require separate migration, no blanket claim. Six statics then ONE absent build/app/inventory/scripts/Chromium with coverage.reportOnFailure. Persist exact failures before assertions, only failed/new cases/gates retried, skipped recorded skipped; no passing replay. Vendor try/finally restore before5source audits/scope/AP scans. Actual app/inventory100%L/S/F/B, maps only ignored appcache. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream copies/helpers/Python/native probes/rawdiffs/sourceframes/diagnostics; no network/outside/global/subagents. Standing explicit iterative UI/refactoring authorization applies. Source-confirmed initial failures155app/3Chromium require9-path integration refinement, no old assertion edits. Native after-deletion cursor coordinates must be recorded at completed mutation through actual SwPosition/SwUndRng.SetValues; selected deletion records after only once, sequential per-cell children use live local active endpoints and completed native final point rather than preprojected removed nodes. Existing table-row history constructs before new sections are connected, so records before numeric point immediately, after only once row is connected using actual first cell and independently cloned pending items. Split Redo records native new-paragraph content0 without resolving malformed pre-split after forecasts. Add protected current-point capture to existing SwUndo instead of index arithmetic/fallback adapter. No raw node cursor history retention, no failed tests weakened, no passing cases/profile replay.155original failed app+3Chromium only for closure;22new cases alreadypass. Changed-file statics, actual merged counters with verified unchanged-source matching for final deltas, final source audits after restoration. Initial full build covers initial variant; changed final production validated by no-emit actual config and failed browser Vite compilation, no passing build replay.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename inside repo try/finally, restore before audits; tests never access/invoke upstream. Exact failures saved before assertions; only failed/new cases retried, no passing replay, skipped=skipped. Actual app/inventory L/S/F/B100%, maps only ignored appcache.
3. New actual native-node replacement/current-context cursor reconstruction tests prove numeric coordinates, direction/no-mark/equal marks, current body/cell nodes, active node/table mode, pending independent clone, mutable input ownership, future after-action offsets, grouping getter/setter and real shell history.408prior files unchanged;250states/defaults/classifications/exceptions/prior evidence preserved, additive shared-owner evidence only. Existing action payload pointers and physical split identity remain unverified, no whole-module promotion.
4. After vendor restored: resource generation --check,source-tree,source-provenance,inventory invariants/parity; scoped diff/prior tests/defaults/AP forbidden artifacts scan. Semantic commit exact SHA same-agent explicit EVALUATOR review, recorded verify/canonical finish/parent checkpoint and clean tracked main. Broad goal active.
5. Required integration refinement preserves all408prior files/values: source-confirmed post-mutation numeric cursor capture for cross-node/cell deletion, sequential child active point, connected table-row after point and native split offset0. Retry155failed app and3failed Chromium only;22new cases not replayed. Validate changed final source statics and actual coverage locations, no fabricated/remapped counters without source identity proof.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf semantic commit through a new approved task; preserve all other iteration history and conscious IO/recovery deviations.

## Findings
