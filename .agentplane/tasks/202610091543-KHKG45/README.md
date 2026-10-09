---
id: "202610091543-KHKG45"
title: "Make collapsing table borders native item-owned through layout and UI"
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
  updated_at: "2026-10-09T15:44:51.893Z"
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
    body: "Start: Native collapsing-border item ownership and physical invalidation through core and actual UI; correction6/10, safe iterative approval retained."
events:
  -
    type: "status"
    at: "2026-10-09T15:44:53.056Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Native collapsing-border item ownership and physical invalidation through core and actual UI; correction6/10, safe iterative approval retained."
doc_version: 3
doc_updated_at: "2026-10-09T15:44:53.056Z"
doc_updated_by: "CODER"
description: "Correction6/10 after XJTGF0: eliminate mirrored collapsing-border mode from SwTable scalar geometry, use existing native RES_COLLAPSING_BORDERS item in table frame and browser/dialog/shell consumers, restore source row/cell border invalidation and verify real history/UI."
sections:
  Summary: "Correction6/10 after historical full XJTGF0: make existing collapsing table borders native item-owned through model, physical layout invalidation and actual browser/dialog/shell consumers. User-authorized iterative Writer parity continues."
  Scope: "Production only sw/source/core/table/swtable.ts, sw/source/core/layout/tabfrm.ts, sw/browser/editor/WriterEditableTable.tsx, sw/browser/presentation/WriterTableDialog.tsx and sw/source/uibase/shells/tabsh.ts under apps/office/src. Three fresh native-collapsing-border-item/notify core/history/browser tests and source-backed conflicting old acceptance migrations only if demonstrated. Ten corresponding canonical runtime/provenance records, bounded English counts/commands/hashes evidence and append-only parent C9TN6M Findings. No new modules/helpers in AgentPlane artifacts, no upstream source copies, no policy/toolchain/network/global files, no unrelated tests or registered I/O/recovery changes."
  Plan: "Remove mirrored collapsing-border mode from SwTable stored geometry: constructor/SetFormat admit native bool and GetFormat copies direct item only at transport boundary. SwTabFrame reads native effective bool and restores represented table recursive invalidation; SwCellFrame restores source collapsing parent/current-next-row border reactions. Browser table paint, dialog and shell read original effective item directly. Scope five production modules, three fresh core/history/UI tests, ten preserved canonical records, task/parent evidence; only exact source-backed old expectation migrations allowed. Require related/new upstream-absent cases and entire five modules actual Istanbul100/zero negatives/current complete maps, seven upstream-absent static gates then restored metadata checks, prefixes and unrelated-file preservation, semantic SHA, explicit same-agent quality and clean direct finish. Native content/root/master/follow/environment/direction/accessibility beyond represented border path remain unverified. Goal active correction6/10; previous full XJTGF0 historical."
  Verify Steps: |-
    1. Run fresh native collapsing-border ownership/layout/history/mounted UI tests and all related existing table/row/cell/border/dialog/shell/layout/transport/history cases once physically upstream-absent. Prove native bool default false, explicit boundary ingress/egress/reset without mirrored stored mode, direct/inherited item ownership, exact native recursive table geometry/paint reaction, cell format replacement and RES_BOX current/next-row invalidation including final-row table print invalidation, unchanged separating and detached behavior. Verify direct native bool changes update mounted paint/dialog/shell without document-model signals; actual table/border history three cycles, original node/cursor/frame identity and cleanup.
    2. Require actual complete five changed production modules Istanbul100 lines/statements/functions/branches, zero negatives and current source hashes. Any failed/new-only closure may aggregate only unchanged-source identical complete maps; no old task/V8 counters, partial module or map/counter/location/threshold normalization. Retain raw failures; rerun passing cases only for materially changed production and explicitly explain.
    3. Run npm run format:check,lint,typecheck (TS7),check:dependencies,test:static,check:docs,check:file-size physically upstream-absent; restore reference in finally. Then metadata-only inventory:registry:build/check, source-tree/provenance, writer resources --check, policy routing and ap doctor. Final canonical formatting gate if metadata later changes.
    4. Preserve old ten canonical values/status/default/classification and full evidence/responsibility prefixes, append-only parent Findings, all unrelated source/scripts/docs/tests. Keep raw logs/maps/helpers ignored node_modules cache; task artifact only bounded English counts/commands/hashes/IDs. Bind semantic SHA, explicit same-agent non-independent evaluator, canonical direct finish and clean tracked/untracked tree. Last full XJTGF0 remains historical; broad goal active correction6/10, next full after10.
  Verification: "Pending actual implementation, complete scoped Istanbul, runtime/static and metadata gates."
  Rollback Plan: "Revert only this leaf source/test and appended evidence through a new task. Preserve immutable completed artifacts, parent Findings and registered recovery/open/save/settings deviations."
  Findings: "Pinned9bc445578031fecf56086729d8e4940c77e14d65 tabfrm.cxx::SwTabFrame::IsCollapsingBorders reads original format RES_COLLAPSING_BORDERS bool. Native table UpdateAttr_ recursively invalidates size/print/paint; SwCellFrame::SwClientNotify reformat reactions invalidate containing row and current/next row lowers for box changes. Existing pool already registers bool132false, but local SwTable stores borderModel in scalar geometry and browser/dialog/shell read it; native direct/inherited bool has no paint effect. Restore this complete existing border-mode path while bounding unrepresented content/page/root/master/follow/direction/accessibility families. Prior SV3P04 DONE semantic7dd792fa178cases/scoped100; authoritative clean writer checkout, no current blocker."
id_source: "generated"
---
## Summary

Correction6/10 after historical full XJTGF0: make existing collapsing table borders native item-owned through model, physical layout invalidation and actual browser/dialog/shell consumers. User-authorized iterative Writer parity continues.

## Scope

Production only sw/source/core/table/swtable.ts, sw/source/core/layout/tabfrm.ts, sw/browser/editor/WriterEditableTable.tsx, sw/browser/presentation/WriterTableDialog.tsx and sw/source/uibase/shells/tabsh.ts under apps/office/src. Three fresh native-collapsing-border-item/notify core/history/browser tests and source-backed conflicting old acceptance migrations only if demonstrated. Ten corresponding canonical runtime/provenance records, bounded English counts/commands/hashes evidence and append-only parent C9TN6M Findings. No new modules/helpers in AgentPlane artifacts, no upstream source copies, no policy/toolchain/network/global files, no unrelated tests or registered I/O/recovery changes.

## Plan

Remove mirrored collapsing-border mode from SwTable stored geometry: constructor/SetFormat admit native bool and GetFormat copies direct item only at transport boundary. SwTabFrame reads native effective bool and restores represented table recursive invalidation; SwCellFrame restores source collapsing parent/current-next-row border reactions. Browser table paint, dialog and shell read original effective item directly. Scope five production modules, three fresh core/history/UI tests, ten preserved canonical records, task/parent evidence; only exact source-backed old expectation migrations allowed. Require related/new upstream-absent cases and entire five modules actual Istanbul100/zero negatives/current complete maps, seven upstream-absent static gates then restored metadata checks, prefixes and unrelated-file preservation, semantic SHA, explicit same-agent quality and clean direct finish. Native content/root/master/follow/environment/direction/accessibility beyond represented border path remain unverified. Goal active correction6/10; previous full XJTGF0 historical.

## Verify Steps

1. Run fresh native collapsing-border ownership/layout/history/mounted UI tests and all related existing table/row/cell/border/dialog/shell/layout/transport/history cases once physically upstream-absent. Prove native bool default false, explicit boundary ingress/egress/reset without mirrored stored mode, direct/inherited item ownership, exact native recursive table geometry/paint reaction, cell format replacement and RES_BOX current/next-row invalidation including final-row table print invalidation, unchanged separating and detached behavior. Verify direct native bool changes update mounted paint/dialog/shell without document-model signals; actual table/border history three cycles, original node/cursor/frame identity and cleanup.
2. Require actual complete five changed production modules Istanbul100 lines/statements/functions/branches, zero negatives and current source hashes. Any failed/new-only closure may aggregate only unchanged-source identical complete maps; no old task/V8 counters, partial module or map/counter/location/threshold normalization. Retain raw failures; rerun passing cases only for materially changed production and explicitly explain.
3. Run npm run format:check,lint,typecheck (TS7),check:dependencies,test:static,check:docs,check:file-size physically upstream-absent; restore reference in finally. Then metadata-only inventory:registry:build/check, source-tree/provenance, writer resources --check, policy routing and ap doctor. Final canonical formatting gate if metadata later changes.
4. Preserve old ten canonical values/status/default/classification and full evidence/responsibility prefixes, append-only parent Findings, all unrelated source/scripts/docs/tests. Keep raw logs/maps/helpers ignored node_modules cache; task artifact only bounded English counts/commands/hashes/IDs. Bind semantic SHA, explicit same-agent non-independent evaluator, canonical direct finish and clean tracked/untracked tree. Last full XJTGF0 remains historical; broad goal active correction6/10, next full after10.

## Verification

Pending actual implementation, complete scoped Istanbul, runtime/static and metadata gates.

## Rollback Plan

Revert only this leaf source/test and appended evidence through a new task. Preserve immutable completed artifacts, parent Findings and registered recovery/open/save/settings deviations.

## Findings

Pinned9bc445578031fecf56086729d8e4940c77e14d65 tabfrm.cxx::SwTabFrame::IsCollapsingBorders reads original format RES_COLLAPSING_BORDERS bool. Native table UpdateAttr_ recursively invalidates size/print/paint; SwCellFrame::SwClientNotify reformat reactions invalidate containing row and current/next row lowers for box changes. Existing pool already registers bool132false, but local SwTable stores borderModel in scalar geometry and browser/dialog/shell read it; native direct/inherited bool has no paint effect. Restore this complete existing border-mode path while bounding unrepresented content/page/root/master/follow/direction/accessibility families. Prior SV3P04 DONE semantic7dd792fa178cases/scoped100; authoritative clean writer checkout, no current blocker.
