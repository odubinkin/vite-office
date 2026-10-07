---
id: "202610071333-H29XNH"
title: "Preserve native list-label cursor affinity through the browser selection boundary"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T14:02:09.017Z"
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
doc_updated_at: "2026-10-07T14:19:44.450Z"
doc_updated_by: "CODER"
description: "Iteration216 of parent202609240501-C9TN6M. Distinguish native before-label affinity from text offset0 in actual browser selection and marker caret paint. Preserve node owners, selection/history and registered save/open/recovery deviations; whole parity remains active."
sections:
  Summary: "Iteration216: restore source before-label cursor affinity at the browser device boundary; whole parity remains active."
  Scope: |-
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/browser/editor/writer-selection.ts
    - apps/office/src/sw/browser/editor/writer-selection-types.ts
    - apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    - apps/office/src/sw/browser/presentation/writer-view-projection.ts
    - apps/office/src/sw/source/uibase/docvw/native-label-affinity.test.ts
    - apps/office/src/sw/browser/editor/native-label-affinity.test.tsx
    - apps/office/e2e/native-label-affinity.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/core/crsr/pam.ts
    - apps/office/src/sw/source/core/crsr/swcrsr.ts
    - apps/office/src/sw/browser/editor/native-table-pointer.test.tsx
    583 prior acceptance:582 byte-identical; exact one source-backed marker-hit insertion expectation migration CeXll to XCell. Native DOM editable-host focus and marker caret geometry remain required. 298 prior metadata records and fields/defaults/exceptions preserved.
  Plan: |-
    Standing user goal authorizes safe native UI parity work. One fix: preserve native before-label cursor affinity distinctly from text offset0 across real DOM selection. Pinned crsrsh.cxx1062-1163,1514-1527,2380-2400 and LRMargin541-574 establish visible list label/no mark/table guards, distinct native cursor state and BEFORE geometry. Native SetPaM/UpdateCursor receive validated affinity while retaining defaultfalse and publish final selection only after original owner state is set; preserve all pending/history contracts. Browser projection adds optionaltrue affinity only; native DOM Range at marker start maps to actual sibling paragraph SwNodes index/content0 plus affinity, text offsets remain original. Restore/equality distinguishes marker from text0, inaccessible marker or marked selection never invent label targets; marker click sets raw DOM endpoints then native window admits same intent. Paint visible caret at marker edge without editable marker text or document mutation. No React-owned cursor/history, no redundant private selection state. Seven production,three new acceptance,two metadata paths12; all583old tests byte-identical and298prior metadata fields/defaults/statuses/exceptions preserved, only bounded evidence appended. Core marked-list-level shading, ruler list-level mechanics, full native geometry/RTL/bidi remain separately unverified. No save/open/recovery changes, upstream/Python/raw artifacts under AP, network/outside-repo or stash mutation. Six initial static gates once; changed-input/failure closures only; ONE full upstream-absent runtime including build/app/inventory/infra/Chromium with terminal uncaught-error census, then original failures or genuinely new cases only. Actual source-bound100 app/inventory, restored source gates, same-agent exact implementation evaluator explicitly not independent, final docs before canonical verify, finish implementationSHA, full parent-prefix append.
    Pinned source refinement before any runtime: pam.hxx192,225-226 and pam.cxx constructors own label affinity in SwPaM, not SwCursor. Move the existing field/get/set to native base; no Assign/Move reset invented. editsh.cxx98-186 Insert2 explicitly clears label affinity at end of native insertion; existing SwWrtShell.Insert brackets actual insert and reset with notification transaction, preserving final state and source publication. Two added production paths pam.ts/swcrsr.ts, approved scope14(9production3new2metadata); same acceptance/metadata preservation. Source normal-char NumOrNoNum defaulttrue currently counts already-visible label, keep that source call's broader key-specific behavior unverified rather than fabricate toggling. Document algorithm/math/move contracts unchanged.
    Failure closure refinement: sole full upstream-absent profile ended with4app/2newChromium failures,0uncaught. Correct marker owner lookup to immediate matching sibling instead of arbitrary descendant. Preserve same CSS assertion via computed CSS property spelling. One source-backed prior acceptance migration in native-table-pointer.test.tsx changes only expected inserted text CeXll to XCell because a visible marker hit denotes BEFORE label/content0 (crsrsh SetCursor) rather than arbitrary caretFromPoint2. Approved semantic scope15(9production1old3new2metadata);583prior acceptance582byte-identical1exact literal migration. Native DOM label caret endpoint/host focus remains required; diagnose original2Chrome failures without weakening geometry/input expectations. All prior criteria and failed-only/new-only profile restriction retained.
  Verify Steps: "Six initial static gates executed once; only failed or changed-input static closures afterward. Sole full upstream-absent build/app/inventory/infrastructure/Chromium followed only original failures or4 genuinely new app cases;0 passing test replay and26 focused skips retained. Final13545 app,110 inventory,14 infrastructure,278 Chromium; explicit terminal uncaught error census0. Actual current-source100 for all app/inventory metrics via entire identical source/maps or contiguous full declarations/bodies/enclosing branches/all mapped locations. Approved15 semantic paths (9production1exact old literal migration3new acceptance2metadata);583prior acceptance582identical1CeXll->XCell native marker-hit migration, all298prior metadata fields/statuses/defaults/exceptions preserved. Restored pinned upstream before5 source/resource/provenance/invariant/parity gates. Physical lines<1000; whole AP forbidden source/Python/raw count0, routing/doctor/diff. Same-agent exact implementation evaluation explicitly not independent. Final Findings/Verification before canonical verify; finish actual implementationSHA; preserve full parent596663-character prefix SHA154e01e5daa154a4be4ea8132f523324e64cd9faddff3b32a2a99b8b9c8ea975. Closure3 accidentally repeated an unchanged build; no runtime passing cases or full profile repeated."
  Verification: "Pending. Source inspection confirms current projection loses before-label distinction."
  Rollback Plan: "Revert only active task semantic commits; preserve prior completed tasks, intentional I/O exceptions and deferred stash."
  Findings: "Native label affinity is owned by SwPaM as pam.hxx; duplicate subclass state removed. Shell SetPaM/UpdateCursor distinguish before-label intent from identical text0 and publish the final native state. Ordinary Insert clears affinity at the source Insert2 end-action boundary. DOM mapper uses only the immediately matching sibling paragraph; orphan/foreign markers cannot acquire another owner. Chromium clears an empty DOM boundary preceding a noneditable marker; using the editable boundary after decoration preserves native BEFORE state while caret paint remains at marker edge. Native point/mark/history stay in the persistent kernel. Repeated Home/End, body bullets/table numbering, marker pointer hit, real Chromium typing/UndoRedo, backward fragment ranges and table-border priority verified. Full marked-level shading/ruler/RTL/bidi, broader key/IME/overwrite/Replace and whole kernel/UI parity remain unverified. Registered save/open/recovery deviations retained. Full profile had4app/2newChrome failures and0uncaught; only failed cases and4new app edge cases ran afterward. Current13545app/110inventory/14infra/278Chrome,0unresolved,0passing replay,26focused skips. Actual100 all metrics,293 whole app source/maps and2 changed-source contiguous full-region proofs;9 source-faithful prior regions. Approved15 semantic paths,582of583 prior acceptance byte-identical and one exact source marker-hit CeXll->XCell expectation migration. Both metadata files preserve298records/all prior fields. AP stores bounded English notes/digests only; raw evidence ignored cache. One accidental redundant unchanged build closure3 disclosed; no second full suite. Evidence: source-review.json, absent-profile.json, closure1-14.json, case-census.json, terminal-error-census.json, scope-final.json, final-coverage.json, static-closure3.json, changed-file-checks.json, source-gates.json, governance-checks.json, artifacts-policy.json. Source residuals remain separate tasks; goal ACTIVE."
id_source: "generated"
---
## Summary

Iteration216: restore source before-label cursor affinity at the browser device boundary; whole parity remains active.

## Scope

- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/browser/editor/writer-selection.ts
- apps/office/src/sw/browser/editor/writer-selection-types.ts
- apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
- apps/office/src/sw/browser/presentation/writer-view-projection.ts
- apps/office/src/sw/source/uibase/docvw/native-label-affinity.test.ts
- apps/office/src/sw/browser/editor/native-label-affinity.test.tsx
- apps/office/e2e/native-label-affinity.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/core/crsr/pam.ts
- apps/office/src/sw/source/core/crsr/swcrsr.ts
- apps/office/src/sw/browser/editor/native-table-pointer.test.tsx
583 prior acceptance:582 byte-identical; exact one source-backed marker-hit insertion expectation migration CeXll to XCell. Native DOM editable-host focus and marker caret geometry remain required. 298 prior metadata records and fields/defaults/exceptions preserved.

## Plan

Standing user goal authorizes safe native UI parity work. One fix: preserve native before-label cursor affinity distinctly from text offset0 across real DOM selection. Pinned crsrsh.cxx1062-1163,1514-1527,2380-2400 and LRMargin541-574 establish visible list label/no mark/table guards, distinct native cursor state and BEFORE geometry. Native SetPaM/UpdateCursor receive validated affinity while retaining defaultfalse and publish final selection only after original owner state is set; preserve all pending/history contracts. Browser projection adds optionaltrue affinity only; native DOM Range at marker start maps to actual sibling paragraph SwNodes index/content0 plus affinity, text offsets remain original. Restore/equality distinguishes marker from text0, inaccessible marker or marked selection never invent label targets; marker click sets raw DOM endpoints then native window admits same intent. Paint visible caret at marker edge without editable marker text or document mutation. No React-owned cursor/history, no redundant private selection state. Seven production,three new acceptance,two metadata paths12; all583old tests byte-identical and298prior metadata fields/defaults/statuses/exceptions preserved, only bounded evidence appended. Core marked-list-level shading, ruler list-level mechanics, full native geometry/RTL/bidi remain separately unverified. No save/open/recovery changes, upstream/Python/raw artifacts under AP, network/outside-repo or stash mutation. Six initial static gates once; changed-input/failure closures only; ONE full upstream-absent runtime including build/app/inventory/infra/Chromium with terminal uncaught-error census, then original failures or genuinely new cases only. Actual source-bound100 app/inventory, restored source gates, same-agent exact implementation evaluator explicitly not independent, final docs before canonical verify, finish implementationSHA, full parent-prefix append.
Pinned source refinement before any runtime: pam.hxx192,225-226 and pam.cxx constructors own label affinity in SwPaM, not SwCursor. Move the existing field/get/set to native base; no Assign/Move reset invented. editsh.cxx98-186 Insert2 explicitly clears label affinity at end of native insertion; existing SwWrtShell.Insert brackets actual insert and reset with notification transaction, preserving final state and source publication. Two added production paths pam.ts/swcrsr.ts, approved scope14(9production3new2metadata); same acceptance/metadata preservation. Source normal-char NumOrNoNum defaulttrue currently counts already-visible label, keep that source call's broader key-specific behavior unverified rather than fabricate toggling. Document algorithm/math/move contracts unchanged.
Failure closure refinement: sole full upstream-absent profile ended with4app/2newChromium failures,0uncaught. Correct marker owner lookup to immediate matching sibling instead of arbitrary descendant. Preserve same CSS assertion via computed CSS property spelling. One source-backed prior acceptance migration in native-table-pointer.test.tsx changes only expected inserted text CeXll to XCell because a visible marker hit denotes BEFORE label/content0 (crsrsh SetCursor) rather than arbitrary caretFromPoint2. Approved semantic scope15(9production1old3new2metadata);583prior acceptance582byte-identical1exact literal migration. Native DOM label caret endpoint/host focus remains required; diagnose original2Chrome failures without weakening geometry/input expectations. All prior criteria and failed-only/new-only profile restriction retained.

## Verify Steps

Six initial static gates executed once; only failed or changed-input static closures afterward. Sole full upstream-absent build/app/inventory/infrastructure/Chromium followed only original failures or4 genuinely new app cases;0 passing test replay and26 focused skips retained. Final13545 app,110 inventory,14 infrastructure,278 Chromium; explicit terminal uncaught error census0. Actual current-source100 for all app/inventory metrics via entire identical source/maps or contiguous full declarations/bodies/enclosing branches/all mapped locations. Approved15 semantic paths (9production1exact old literal migration3new acceptance2metadata);583prior acceptance582identical1CeXll->XCell native marker-hit migration, all298prior metadata fields/statuses/defaults/exceptions preserved. Restored pinned upstream before5 source/resource/provenance/invariant/parity gates. Physical lines<1000; whole AP forbidden source/Python/raw count0, routing/doctor/diff. Same-agent exact implementation evaluation explicitly not independent. Final Findings/Verification before canonical verify; finish actual implementationSHA; preserve full parent596663-character prefix SHA154e01e5daa154a4be4ea8132f523324e64cd9faddff3b32a2a99b8b9c8ea975. Closure3 accidentally repeated an unchanged build; no runtime passing cases or full profile repeated.

## Verification

Pending. Source inspection confirms current projection loses before-label distinction.

## Rollback Plan

Revert only active task semantic commits; preserve prior completed tasks, intentional I/O exceptions and deferred stash.

## Findings

Native label affinity is owned by SwPaM as pam.hxx; duplicate subclass state removed. Shell SetPaM/UpdateCursor distinguish before-label intent from identical text0 and publish the final native state. Ordinary Insert clears affinity at the source Insert2 end-action boundary. DOM mapper uses only the immediately matching sibling paragraph; orphan/foreign markers cannot acquire another owner. Chromium clears an empty DOM boundary preceding a noneditable marker; using the editable boundary after decoration preserves native BEFORE state while caret paint remains at marker edge. Native point/mark/history stay in the persistent kernel. Repeated Home/End, body bullets/table numbering, marker pointer hit, real Chromium typing/UndoRedo, backward fragment ranges and table-border priority verified. Full marked-level shading/ruler/RTL/bidi, broader key/IME/overwrite/Replace and whole kernel/UI parity remain unverified. Registered save/open/recovery deviations retained. Full profile had4app/2newChrome failures and0uncaught; only failed cases and4new app edge cases ran afterward. Current13545app/110inventory/14infra/278Chrome,0unresolved,0passing replay,26focused skips. Actual100 all metrics,293 whole app source/maps and2 changed-source contiguous full-region proofs;9 source-faithful prior regions. Approved15 semantic paths,582of583 prior acceptance byte-identical and one exact source marker-hit CeXll->XCell expectation migration. Both metadata files preserve298records/all prior fields. AP stores bounded English notes/digests only; raw evidence ignored cache. One accidental redundant unchanged build closure3 disclosed; no second full suite. Evidence: source-review.json, absent-profile.json, closure1-14.json, case-census.json, terminal-error-census.json, scope-final.json, final-coverage.json, static-closure3.json, changed-file-checks.json, source-gates.json, governance-checks.json, artifacts-policy.json. Source residuals remain separate tasks; goal ACTIVE.
