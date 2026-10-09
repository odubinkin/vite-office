---
id: "202610091646-E452SQ"
title: "Make table layout splitting native item-owned through core and UI"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T16:47:41.275Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-09T16:50:44.269Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-09T16:50:44.269Z"
doc_updated_by: "CODER"
description: "Correction8/10 after XJTGF0: remove mirrored scalar layoutSplit from SwTable, read original effective SwFormatLayoutSplit in physical layout and native table dialog input, capture native shell item and restore represented master position reaction; verify original history/page/UI owners."
sections:
  Summary: "Correction8/10 after historical full XJTGF0: native item-owned table layout splitting through model, physical layout, shell input and actual Text Flow UI. User iterative approval retained; previous BJCYQ3 goal turn is progress."
  Scope: "Production only apps/office/src/sw/source/core/table/swtable.ts, sw/source/core/layout/tabfrm.ts, sw/source/ui/table/tabledlg.ts, sw/source/uibase/shells/tabsh.ts and sw/browser/presentation/WriterTableDialog.tsx. Three fresh native-layout-split-item core/history/browser test files, exact pinned-source conflicting old expectation migrations only if shown. Ten canonical runtime/provenance histories with old values/evidence/responsibilities preserved, bounded English task counts/commands/hashes/IDs and append-only parent C9TN6M Findings. No source/helper/script/log/map copies in AgentPlane, no policy/toolchain/network/global/registered I/O/recovery changes."
  Plan: "Make SwTable original SwFormatLayoutSplit120true own table splitting: strip layoutSplit from stored scalar geometry, admit/reset native item at SetFormat and emit direct-only values at construction/transport/history boundary. SwTabFrame reads effective native item and consumes represented master position changes; shell captures original effective item, Text Flow reads original item or authoritative direct native dialog input with source true fallback, browser passes existing native input into page. Scope five production modules, three fresh core/history/UI tests, exact source-backed old migrations, ten canonical histories and bounded task/parent evidence. Require related/new upstream-absent tests, entire five modules actual current-source Istanbul100/zero negatives, seven statics then restored metadata/preservation, semantic-bound same-agent quality and clean direct finish. No native follow identity inferred from rectangles or synthetic root/content/follow fields. Goal active correction8/10, full after10, no module/goal parity promotion."
  Verify Steps: |-
    1. Run fresh native layout-split ownership/default/direct/inherited/reset/page-budget/shell/dialog input/history/mounted UI cases and related existing table/layout/Text Flow/split/border/transport/history cases physically upstream-absent once, restore finally. Prove native SwFormatLayoutSplit120true and original item ownership without stored scalar duplicate, direct-only construction/transport/history egress, original frame position reaction for represented masters, copied consumed delta preservation, default/inherited/explicit/unset behavior, authoritative direct native ItemSet dialog inputs and saved changed-only values, three real undo/redo cycles and original graph/cursor owners.
    2. Entire five current production modules actual Istanbul100 lines/statements/functions/branches, zero negatives and exact current hashes. Failed/new-only closure may aggregate unchanged-source identical complete maps only; retain raw failures, no old-task/V8/partial-file/map/counter/location/threshold normalization, passing replay only when required by changed production or repaired test.
    3. Seven final upstream-absent static gates format:check,lint,typecheck TS7,check:dependencies,test:static,check:docs,check:file-size. After restoration metadata registry-build/check,source-tree/provenance,writer resources --check,routing,doctor; final canonical formatting after updates.
    4. Preserve ten old canonical prefixes/status/default/classification/evidence/responsibilities, parent Findings prefix, unrelated files/tests and registered deviations. Only exact source-proven old expectations may change. Bind semantic SHA, explicit same-agent non-independent quality, canonical direct finish and clean tree. Goal active correction8/10 since XJTGF0, full after10. Native master/follow/section/root/page/full split-row/content flow remains unrepresented/unverified; do not infer follow identity from browser geometry.
  Verification: "Pending actual implementation and final current-source runtime/coverage/static/metadata/preservation evidence."
  Rollback Plan: "Revert only this leaf code/test/evidence through a new task; preserve immutable completed artifacts, original canonical histories/parent prefixes and registered recovery/open/save/settings deviations."
  Findings: "Pinned fmtlsplt.hxx defines SwFormatLayoutSplit120true, already registered in local native pool. tabfrm.cxx::IsLayoutSplitAllowed reads original format GetLayoutSplit; table UpdateAttr_ consumes the layout item and invalidates master position. Current SwTable stores scalar layoutSplit; physical table frame and Text Flow page read that duplicate, shell input lacks original split item, and native dialog input cannot override its scalar table draft. Remove stored scalar, capture effective native item for physical/page/shell consumers, use native direct dialog ItemSet with true fallback, preserve boundary direct-only egress and original history. Existing SwTabFrame clients represent masters without native follow chains; only represented master invalidation is restored, no IsFollow flag inferred from device rectangles. Full native follow/root/page/section/content/table-row splitting remains unverified. Authoritative clean writer checkout, seven corrections since XJTGF0; previous semantic207c607a DONE, no blocker."
id_source: "generated"
---
## Summary

Correction8/10 after historical full XJTGF0: native item-owned table layout splitting through model, physical layout, shell input and actual Text Flow UI. User iterative approval retained; previous BJCYQ3 goal turn is progress.

## Scope

Production only apps/office/src/sw/source/core/table/swtable.ts, sw/source/core/layout/tabfrm.ts, sw/source/ui/table/tabledlg.ts, sw/source/uibase/shells/tabsh.ts and sw/browser/presentation/WriterTableDialog.tsx. Three fresh native-layout-split-item core/history/browser test files, exact pinned-source conflicting old expectation migrations only if shown. Ten canonical runtime/provenance histories with old values/evidence/responsibilities preserved, bounded English task counts/commands/hashes/IDs and append-only parent C9TN6M Findings. No source/helper/script/log/map copies in AgentPlane, no policy/toolchain/network/global/registered I/O/recovery changes.

## Plan

Make SwTable original SwFormatLayoutSplit120true own table splitting: strip layoutSplit from stored scalar geometry, admit/reset native item at SetFormat and emit direct-only values at construction/transport/history boundary. SwTabFrame reads effective native item and consumes represented master position changes; shell captures original effective item, Text Flow reads original item or authoritative direct native dialog input with source true fallback, browser passes existing native input into page. Scope five production modules, three fresh core/history/UI tests, exact source-backed old migrations, ten canonical histories and bounded task/parent evidence. Require related/new upstream-absent tests, entire five modules actual current-source Istanbul100/zero negatives, seven statics then restored metadata/preservation, semantic-bound same-agent quality and clean direct finish. No native follow identity inferred from rectangles or synthetic root/content/follow fields. Goal active correction8/10, full after10, no module/goal parity promotion.

## Verify Steps

1. Run fresh native layout-split ownership/default/direct/inherited/reset/page-budget/shell/dialog input/history/mounted UI cases and related existing table/layout/Text Flow/split/border/transport/history cases physically upstream-absent once, restore finally. Prove native SwFormatLayoutSplit120true and original item ownership without stored scalar duplicate, direct-only construction/transport/history egress, original frame position reaction for represented masters, copied consumed delta preservation, default/inherited/explicit/unset behavior, authoritative direct native ItemSet dialog inputs and saved changed-only values, three real undo/redo cycles and original graph/cursor owners.
2. Entire five current production modules actual Istanbul100 lines/statements/functions/branches, zero negatives and exact current hashes. Failed/new-only closure may aggregate unchanged-source identical complete maps only; retain raw failures, no old-task/V8/partial-file/map/counter/location/threshold normalization, passing replay only when required by changed production or repaired test.
3. Seven final upstream-absent static gates format:check,lint,typecheck TS7,check:dependencies,test:static,check:docs,check:file-size. After restoration metadata registry-build/check,source-tree/provenance,writer resources --check,routing,doctor; final canonical formatting after updates.
4. Preserve ten old canonical prefixes/status/default/classification/evidence/responsibilities, parent Findings prefix, unrelated files/tests and registered deviations. Only exact source-proven old expectations may change. Bind semantic SHA, explicit same-agent non-independent quality, canonical direct finish and clean tree. Goal active correction8/10 since XJTGF0, full after10. Native master/follow/section/root/page/full split-row/content flow remains unrepresented/unverified; do not infer follow identity from browser geometry.

## Verification

Pending actual implementation and final current-source runtime/coverage/static/metadata/preservation evidence.

## Rollback Plan

Revert only this leaf code/test/evidence through a new task; preserve immutable completed artifacts, original canonical histories/parent prefixes and registered recovery/open/save/settings deviations.

## Findings

Pinned fmtlsplt.hxx defines SwFormatLayoutSplit120true, already registered in local native pool. tabfrm.cxx::IsLayoutSplitAllowed reads original format GetLayoutSplit; table UpdateAttr_ consumes the layout item and invalidates master position. Current SwTable stores scalar layoutSplit; physical table frame and Text Flow page read that duplicate, shell input lacks original split item, and native dialog input cannot override its scalar table draft. Remove stored scalar, capture effective native item for physical/page/shell consumers, use native direct dialog ItemSet with true fallback, preserve boundary direct-only egress and original history. Existing SwTabFrame clients represent masters without native follow chains; only represented master invalidation is restored, no IsFollow flag inferred from device rectangles. Full native follow/root/page/section/content/table-row splitting remains unverified. Authoritative clean writer checkout, seven corrections since XJTGF0; previous semantic207c607a DONE, no blocker.
