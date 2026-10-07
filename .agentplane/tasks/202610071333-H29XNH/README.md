---
id: "202610071333-H29XNH"
title: "Preserve native list-label cursor affinity through the browser selection boundary"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T13:34:54.455Z"
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
    body: "Start: preserve native label affinity through actual browser Selection and marker caret; standing user parity authorization applies."
events:
  -
    type: "status"
    at: "2026-10-07T13:34:54.903Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: preserve native label affinity through actual browser Selection and marker caret; standing user parity authorization applies."
doc_version: 3
doc_updated_at: "2026-10-07T13:34:54.903Z"
doc_updated_by: "CODER"
description: "Iteration216 of parent202609240501-C9TN6M. Distinguish native before-label affinity from text offset0 in actual browser selection and marker caret paint. Preserve node owners, selection/history and registered save/open/recovery deviations; whole parity remains active."
sections:
  Summary: "Iteration216: restore source before-label cursor affinity at the browser device boundary; whole parity remains active."
  Scope: |-
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/browser/editor/writer-selection.ts
    apps/office/src/sw/browser/editor/writer-selection-types.ts
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/source/uibase/docvw/native-label-affinity.test.ts
    apps/office/src/sw/browser/editor/native-label-affinity.test.tsx
    apps/office/e2e/native-label-affinity.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Standing user goal authorizes safe native UI parity work. One fix: preserve native before-label cursor affinity distinctly from text offset0 across real DOM selection. Pinned crsrsh.cxx1062-1163,1514-1527,2380-2400 and LRMargin541-574 establish visible list label/no mark/table guards, distinct native cursor state and BEFORE geometry. Native SetPaM/UpdateCursor receive validated affinity while retaining defaultfalse and publish final selection only after original owner state is set; preserve all pending/history contracts. Browser projection adds optionaltrue affinity only; native DOM Range at marker start maps to actual sibling paragraph SwNodes index/content0 plus affinity, text offsets remain original. Restore/equality distinguishes marker from text0, inaccessible marker or marked selection never invent label targets; marker click sets raw DOM endpoints then native window admits same intent. Paint visible caret at marker edge without editable marker text or document mutation. No React-owned cursor/history, no redundant private selection state. Seven production,three new acceptance,two metadata paths12; all583old tests byte-identical and298prior metadata fields/defaults/statuses/exceptions preserved, only bounded evidence appended. Core marked-list-level shading, ruler list-level mechanics, full native geometry/RTL/bidi remain separately unverified. No save/open/recovery changes, upstream/Python/raw artifacts under AP, network/outside-repo or stash mutation. Six initial static gates once; changed-input/failure closures only; ONE full upstream-absent runtime including build/app/inventory/infra/Chromium with terminal uncaught-error census, then original failures or genuinely new cases only. Actual source-bound100 app/inventory, restored source gates, same-agent exact implementation evaluator explicitly not independent, final docs before canonical verify, finish implementationSHA, full parent-prefix append."
  Verify Steps: "Six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require actual native label/text0 equality distinction, visible bullet/number/no-label and no-mark guards, body/cell original owners, repeated Home/End, marker click, DOM Selection roundtrip/public nullable/stale/missing marker guards, text editing and grouped UndoRedo; marker remains noneditable and labels absent from model/clipboard. ONE full upstream-absent build/app/inventory/infrastructure/Chromium with explicit terminal uncaught-error census (JSON assertions insufficient), then original failures or genuinely new cases only. Actual current-source100 app/inventory on complete source/maps or contiguous full declarations/bodies/enclosing branches/all locations; no fake/clamped counts or skip promotion. All583prior acceptance bytes and298prior metadata fields/defaults/exceptions preserved; no blanket semantic promotion. Restore upstream finally before source/resources/provenance/invariants/parity gates; raw ignored dependency cache only. Physical source files below1000, AP forbidden source/Python/scripts/raw census, doctor/routing/diff, same-agent exact evaluator explicitly not independent, final Findings/Verification before canonical verify, finish actual implementation SHA, parent596663-character prefix SHA154e01e5daa154a4be4ea8132f523324e64cd9faddff3b32a2a99b8b9c8ea975 preserved."
  Verification: "Pending. Source inspection confirms current projection loses before-label distinction."
  Rollback Plan: "Revert only active task semantic commits; preserve prior completed tasks, intentional I/O exceptions and deferred stash."
  Findings: "Preflight clean main/direct, parent only active; standing iterative user authorization. Upstream distinguishes before-label affinity from identical text content index0. Native marked-list-level/ruler/RTL completeness remains unverified. No network/outside repository access."
id_source: "generated"
---
## Summary

Iteration216: restore source before-label cursor affinity at the browser device boundary; whole parity remains active.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/browser/editor/writer-selection.ts
apps/office/src/sw/browser/editor/writer-selection-types.ts
apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/source/uibase/docvw/native-label-affinity.test.ts
apps/office/src/sw/browser/editor/native-label-affinity.test.tsx
apps/office/e2e/native-label-affinity.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Standing user goal authorizes safe native UI parity work. One fix: preserve native before-label cursor affinity distinctly from text offset0 across real DOM selection. Pinned crsrsh.cxx1062-1163,1514-1527,2380-2400 and LRMargin541-574 establish visible list label/no mark/table guards, distinct native cursor state and BEFORE geometry. Native SetPaM/UpdateCursor receive validated affinity while retaining defaultfalse and publish final selection only after original owner state is set; preserve all pending/history contracts. Browser projection adds optionaltrue affinity only; native DOM Range at marker start maps to actual sibling paragraph SwNodes index/content0 plus affinity, text offsets remain original. Restore/equality distinguishes marker from text0, inaccessible marker or marked selection never invent label targets; marker click sets raw DOM endpoints then native window admits same intent. Paint visible caret at marker edge without editable marker text or document mutation. No React-owned cursor/history, no redundant private selection state. Seven production,three new acceptance,two metadata paths12; all583old tests byte-identical and298prior metadata fields/defaults/statuses/exceptions preserved, only bounded evidence appended. Core marked-list-level shading, ruler list-level mechanics, full native geometry/RTL/bidi remain separately unverified. No save/open/recovery changes, upstream/Python/raw artifacts under AP, network/outside-repo or stash mutation. Six initial static gates once; changed-input/failure closures only; ONE full upstream-absent runtime including build/app/inventory/infra/Chromium with terminal uncaught-error census, then original failures or genuinely new cases only. Actual source-bound100 app/inventory, restored source gates, same-agent exact implementation evaluator explicitly not independent, final docs before canonical verify, finish implementationSHA, full parent-prefix append.

## Verify Steps

Six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require actual native label/text0 equality distinction, visible bullet/number/no-label and no-mark guards, body/cell original owners, repeated Home/End, marker click, DOM Selection roundtrip/public nullable/stale/missing marker guards, text editing and grouped UndoRedo; marker remains noneditable and labels absent from model/clipboard. ONE full upstream-absent build/app/inventory/infrastructure/Chromium with explicit terminal uncaught-error census (JSON assertions insufficient), then original failures or genuinely new cases only. Actual current-source100 app/inventory on complete source/maps or contiguous full declarations/bodies/enclosing branches/all locations; no fake/clamped counts or skip promotion. All583prior acceptance bytes and298prior metadata fields/defaults/exceptions preserved; no blanket semantic promotion. Restore upstream finally before source/resources/provenance/invariants/parity gates; raw ignored dependency cache only. Physical source files below1000, AP forbidden source/Python/scripts/raw census, doctor/routing/diff, same-agent exact evaluator explicitly not independent, final Findings/Verification before canonical verify, finish actual implementation SHA, parent596663-character prefix SHA154e01e5daa154a4be4ea8132f523324e64cd9faddff3b32a2a99b8b9c8ea975 preserved.

## Verification

Pending. Source inspection confirms current projection loses before-label distinction.

## Rollback Plan

Revert only active task semantic commits; preserve prior completed tasks, intentional I/O exceptions and deferred stash.

## Findings

Preflight clean main/direct, parent only active; standing iterative user authorization. Upstream distinguishes before-label affinity from identical text content index0. Native marked-list-level/ruler/RTL completeness remains unverified. No network/outside repository access.
