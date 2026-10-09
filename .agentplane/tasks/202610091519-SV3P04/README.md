---
id: "202610091519-SV3P04"
title: "Invalidate original table position for last-row frame size changes"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T15:20:56.112Z"
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
    body: "Start: Restore original containing-table last-row size invalidation with source-bounded traversal and real history/UI verification; correction5/10."
events:
  -
    type: "status"
    at: "2026-10-09T15:20:57.267Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original containing-table last-row size invalidation with source-bounded traversal and real history/UI verification; correction5/10."
doc_version: 3
doc_updated_at: "2026-10-09T15:20:57.267Z"
doc_updated_by: "CODER"
description: "Correction5/10 after XJTGF0: port native SwRowFrame::OnFrameSize containing-table position invalidation through original upper-frame traversal, preserving the upstream row hint filter and represented flat layout boundary."
sections:
  Summary: "Correction5/10 after full baseline XJTGF0: restore the represented native containing-table position invalidation for the last row's frame size/split notification. User-authorized iterative Writer parity work continues without full-suite replay."
  Scope: "wsfrm.ts and tabfrm.ts only in production; three fresh core/history/mounted UI tests; four existing canonical wsfrm/tabfrm runtime/provenance records with prefix-preserving evidence; bounded English task evidence and append-only C9TN6M Findings. Preserve native row hint filtering, original owners, existing recovery/open/save/settings deviations, all unrelated tests. Environment flag caching, native content/page/root and master/follow/flow-line states remain unrepresented and unverified."
  Plan: "Port the represented native last-row OnFrameSize reaction in tabfrm.ts using a destruction-aware FindTabFrame traversal of original SwFrame upper links in wsfrm.ts. Test original linked and detached/nested hierarchy, last versus non-last size/split notifications, real last-row height history and mounted UI; retain native row hint filtering. Native cached environment flags, persistent page/root geometry and table master/follow/flow-line states remain outside this bounded correction. Scope: two production modules, three fresh related tests, four canonical runtime/provenance records, bounded task evidence and append-only parent Findings; do not change old acceptance tests unless an exact pinned-source conflict is found. Require entire changed production modules actual Istanbul100 in all four metrics with zero negatives/current-source complete maps; new and related cases, seven static gates physically upstream-absent with finally restoration; restored metadata-only registry/source/resource/routing/doctor checks. Preserve prior inventories/status/default/classification/evidence prefixes and unrelated files. Same-agent non-independent evaluation, semantic commit and clean direct finish; goal active correction5/10, full only after tenth correction."
  Verify Steps: |-
    1. Once physically upstream-absent, run npm run test:coverage with fresh native-last-row-frame-size tests in core/layout, core/undo and browser/editor plus existing related frame/table/format/history/UI tests. Check original nearest-table traversal/detached and destructor guards, last versus non-last size/split and callback order, real height commands and three undo-redo cycles with original node/cursor/frame identity, mounted last-row clipping and registration cleanup.
    2. Require complete changed wsfrm.ts and tabfrm.ts actual current-source Istanbul100 lines/statements/functions/branches and zero negative counters. Failed/new-only closure may use standard aggregation solely with identical complete maps and unchanged source; retain raw failures, no prior-task/V8 counters, narrowed source, map/counter normalization, thresholds or skipped mandatory acceptances.
    3. Run format:check, lint, typecheck (native TS7), check:dependencies, test:static, check:docs and check:file-size physically upstream-absent, restore symlink in finally. Then metadata-only inventory:registry:build/check, check:source-tree/provenance, writer resource generator --check, policy routing and ap doctor.
    4. Preserve all old canonical fields/status/default/classification/evidence and responsibility prefixes, parent Findings and unrelated source/scripts/docs/tests. Record exact commands/results/counts/hashes only in bounded task JSON; helpers/raw logs/maps remain ignored node_modules cache. Bind semantic SHA, explicit same-agent non-independent quality review, direct finish and clean git status. Last full XJTGF0 historical; broad goal active correction5/10.
  Verification: "Pending implementation and actual scoped tests/coverage/static/metadata evidence."
  Rollback Plan: "Revert only this leaf production/test changes and appended inventory evidence through a new task. Preserve immutable DONE artifacts, parent history and registered recovery/open/save/settings deviations."
  Findings: "Pinned9bc445578031fecf56086729d8e4940c77e14d65 tabfrm.cxx::SwRowFrame::OnFrameSize invalidates actual containing table position for the last sibling before borrowed size/split forwarding. findfrm.cxx::SwFrame::ImplFindTabFrame follows original upper links and stops at destructor-marked frames. Local OnFrameSize only forwarded the borrowed item. The existing native row filter correctly excludes general format hints and must remain. Uncached represented traversal is bounded; native environment-flag caches and master/follow/flow-line geometry are not claimed. Previous correction FW0RYR DONE semantic53f5f921,335related cases/scoped100; no current blocker."
id_source: "generated"
---
## Summary

Correction5/10 after full baseline XJTGF0: restore the represented native containing-table position invalidation for the last row's frame size/split notification. User-authorized iterative Writer parity work continues without full-suite replay.

## Scope

wsfrm.ts and tabfrm.ts only in production; three fresh core/history/mounted UI tests; four existing canonical wsfrm/tabfrm runtime/provenance records with prefix-preserving evidence; bounded English task evidence and append-only C9TN6M Findings. Preserve native row hint filtering, original owners, existing recovery/open/save/settings deviations, all unrelated tests. Environment flag caching, native content/page/root and master/follow/flow-line states remain unrepresented and unverified.

## Plan

Port the represented native last-row OnFrameSize reaction in tabfrm.ts using a destruction-aware FindTabFrame traversal of original SwFrame upper links in wsfrm.ts. Test original linked and detached/nested hierarchy, last versus non-last size/split notifications, real last-row height history and mounted UI; retain native row hint filtering. Native cached environment flags, persistent page/root geometry and table master/follow/flow-line states remain outside this bounded correction. Scope: two production modules, three fresh related tests, four canonical runtime/provenance records, bounded task evidence and append-only parent Findings; do not change old acceptance tests unless an exact pinned-source conflict is found. Require entire changed production modules actual Istanbul100 in all four metrics with zero negatives/current-source complete maps; new and related cases, seven static gates physically upstream-absent with finally restoration; restored metadata-only registry/source/resource/routing/doctor checks. Preserve prior inventories/status/default/classification/evidence prefixes and unrelated files. Same-agent non-independent evaluation, semantic commit and clean direct finish; goal active correction5/10, full only after tenth correction.

## Verify Steps

1. Once physically upstream-absent, run npm run test:coverage with fresh native-last-row-frame-size tests in core/layout, core/undo and browser/editor plus existing related frame/table/format/history/UI tests. Check original nearest-table traversal/detached and destructor guards, last versus non-last size/split and callback order, real height commands and three undo-redo cycles with original node/cursor/frame identity, mounted last-row clipping and registration cleanup.
2. Require complete changed wsfrm.ts and tabfrm.ts actual current-source Istanbul100 lines/statements/functions/branches and zero negative counters. Failed/new-only closure may use standard aggregation solely with identical complete maps and unchanged source; retain raw failures, no prior-task/V8 counters, narrowed source, map/counter normalization, thresholds or skipped mandatory acceptances.
3. Run format:check, lint, typecheck (native TS7), check:dependencies, test:static, check:docs and check:file-size physically upstream-absent, restore symlink in finally. Then metadata-only inventory:registry:build/check, check:source-tree/provenance, writer resource generator --check, policy routing and ap doctor.
4. Preserve all old canonical fields/status/default/classification/evidence and responsibility prefixes, parent Findings and unrelated source/scripts/docs/tests. Record exact commands/results/counts/hashes only in bounded task JSON; helpers/raw logs/maps remain ignored node_modules cache. Bind semantic SHA, explicit same-agent non-independent quality review, direct finish and clean git status. Last full XJTGF0 historical; broad goal active correction5/10.

## Verification

Pending implementation and actual scoped tests/coverage/static/metadata evidence.

## Rollback Plan

Revert only this leaf production/test changes and appended inventory evidence through a new task. Preserve immutable DONE artifacts, parent history and registered recovery/open/save/settings deviations.

## Findings

Pinned9bc445578031fecf56086729d8e4940c77e14d65 tabfrm.cxx::SwRowFrame::OnFrameSize invalidates actual containing table position for the last sibling before borrowed size/split forwarding. findfrm.cxx::SwFrame::ImplFindTabFrame follows original upper links and stops at destructor-marked frames. Local OnFrameSize only forwarded the borrowed item. The existing native row filter correctly excludes general format hints and must remain. Uncached represented traversal is bounded; native environment-flag caches and master/follow/flow-line geometry are not claimed. Previous correction FW0RYR DONE semantic53f5f921,335related cases/scoped100; no current blocker.
