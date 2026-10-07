---
id: "202610071241-NXW8EF"
title: "Route Home End through native visual-line cursor owners"
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
  updated_at: "2026-10-07T12:42:50.833Z"
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
    body: "Start: implement standing-authorized source-native Home End through measured text frames, real cursor/shell owners and browser geometry only; preserve registered deviations and unrelated assertions."
events:
  -
    type: "status"
    at: "2026-10-07T12:42:51.278Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement standing-authorized source-native Home End through measured text frames, real cursor/shell owners and browser geometry only; preserve registered deviations and unrelated assertions."
doc_version: 3
doc_updated_at: "2026-10-07T12:42:51.278Z"
doc_updated_by: "CODER"
description: "Iteration215: replace delegated browser Home/End with source-owned SwTextFrame, SwCursor and shell margin movement, using browser device line measurements only. Preserve registered deviations and unrelated acceptance; one fix task, no upstream source artifacts or runtime dependency."
sections:
  Summary: "Restore source-native Home/End movement for existing Writer body and table editing; replace unreliable browser default movement with native frame/cursor/shell ownership."
  Scope: |-
    apps/office/src/sw/source/core/text/txtfrm.ts
    apps/office/src/sw/source/core/text/itrtxt.ts
    apps/office/src/sw/source/core/text/frmcrsr.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/source/core/crsr/swcrsr.ts
    apps/office/src/sw/source/core/crsr/trvltbl.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/move.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/browser/editor/writer-line-measurement.ts
    apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
    apps/office/src/sw/source/uibase/wrtsh/native-line-margin.test.ts
    apps/office/src/sw/browser/editor/native-line-margin.test.tsx
    apps/office/e2e/native-line-margin.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Standing user iterative goal authorization applies to safe source parity edits. One bounded fix: native Home/End visual-line movement. Use source frmcrsr.cxx672-793 and itrtxt.cxx219-229 for line ambiguity, hard-break exclusion and nonAPI trailing-space trim; native SwTextFrame class retains existing fragment fields and owns cursor methods. Root owns current measured frames by real text nodes; SwCursor.LeftRightMargin/IsAtLeftRightMargin and SwCursorShell.LRMargin retain source list-label and selection contracts. SwWrtShell LeftMargin/RightMargin use source movement lifecycle and pending attributes/history grouping; edit window flushes pending input and invokes native intent. Browser measures DOM Range geometry and supplies raw lines/fragment bounds only, then ordinary Home/End/Shift delegates. Preserve Ctrl/Meta section route, modifier/composition/unavailable selection guards. Source-backed exact old fixture migration only removes ordinary Home from previously unhandled inputs; all unrelated assertions retained. Add native/mounted/Chromium regressions for body/cell/soft/hard lines, spaces, empty, UTF16, reversed Shift, repeated native list-label entry, pending input/undo and continued editing. Approved semantic paths18:12production1oldmigration3newacceptance2metadata. No upstream source/Python/raw artifacts under AP. No network/outside-repo/stash/save/open/recovery changes; all prior580acceptance and295metadata fields/prefixes preserved except exact old route fixture, new native records remain unverified. Full RTL/bidi/readonly/merged-text frame completeness remain individually unverified. Execute six initial static gates once, one upstream-absent full runtime then original failures/genuinely new cases only, actual current-source100 proof, restored source gates, same-agent exact-SHA evaluator explicitly not independent, canonical verify/finish implementationSHA and complete parent-prefix append."
  Verify Steps: "Run six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require native visual-line start/end, right-margin ambiguity, hard-break exclusion, API versus interactive spaces, empty/surrogate text, current body/cell/follow geometry, Shift fixed/reversed marks, source repeated list-label Home and End clearing, pending attributes and history/continued edit. Exact old580 acceptance bytes preserved outside1source-backed route fixture; all295metadata old fields/defaults/exceptions preserved; physical files below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original failures or genuinely new cases only. Strict current-source actual100 app/inventory; raw cache only. Restore vendor finally before source/resources/provenance/invariants/parity gates and AP writes; doctor/routing/diff, exact same-agent evaluator, canonical verify, finish actual implementation SHA, parent full-prefix append."
  Verification: "Pending implementation and one full upstream-absent runtime; no success claim."
  Rollback Plan: "Revert only the intentional implementation commit and retain immutable task evidence; do not alter unrelated work or deferred stash."
  Findings: "Read-only initial audit: browser-writer-edit-window currently handles Ctrl/Meta Home/End only; ordinary keys fall through. Source txtcrsr.cxx127-139 routes all four ordinary/selected line slots via LeftMargin/RightMargin(falseBasic); move.cxx176-207 uses ShellMoveCursor. Source SwCursor.LeftRightMargin delegates current layout frame; frmcrsr.cxx excludes hard break, trims ASCII spaces only nonAPI nonlast lines, maintains right-margin ambiguity through itrtxt.cxx. LRMargin repeats Home into visible list label and End clears label state. No tests have run for this leaf. Previous214 leaf made authoritative implementation/verification/closure progress; no live process remains."
id_source: "generated"
---
## Summary

Restore source-native Home/End movement for existing Writer body and table editing; replace unreliable browser default movement with native frame/cursor/shell ownership.

## Scope

apps/office/src/sw/source/core/text/txtfrm.ts
apps/office/src/sw/source/core/text/itrtxt.ts
apps/office/src/sw/source/core/text/frmcrsr.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/source/core/crsr/swcrsr.ts
apps/office/src/sw/source/core/crsr/trvltbl.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/move.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/browser/editor/writer-line-measurement.ts
apps/office/src/sw/browser/editor/native-section-navigation.test.tsx
apps/office/src/sw/source/uibase/wrtsh/native-line-margin.test.ts
apps/office/src/sw/browser/editor/native-line-margin.test.tsx
apps/office/e2e/native-line-margin.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Standing user iterative goal authorization applies to safe source parity edits. One bounded fix: native Home/End visual-line movement. Use source frmcrsr.cxx672-793 and itrtxt.cxx219-229 for line ambiguity, hard-break exclusion and nonAPI trailing-space trim; native SwTextFrame class retains existing fragment fields and owns cursor methods. Root owns current measured frames by real text nodes; SwCursor.LeftRightMargin/IsAtLeftRightMargin and SwCursorShell.LRMargin retain source list-label and selection contracts. SwWrtShell LeftMargin/RightMargin use source movement lifecycle and pending attributes/history grouping; edit window flushes pending input and invokes native intent. Browser measures DOM Range geometry and supplies raw lines/fragment bounds only, then ordinary Home/End/Shift delegates. Preserve Ctrl/Meta section route, modifier/composition/unavailable selection guards. Source-backed exact old fixture migration only removes ordinary Home from previously unhandled inputs; all unrelated assertions retained. Add native/mounted/Chromium regressions for body/cell/soft/hard lines, spaces, empty, UTF16, reversed Shift, repeated native list-label entry, pending input/undo and continued editing. Approved semantic paths18:12production1oldmigration3newacceptance2metadata. No upstream source/Python/raw artifacts under AP. No network/outside-repo/stash/save/open/recovery changes; all prior580acceptance and295metadata fields/prefixes preserved except exact old route fixture, new native records remain unverified. Full RTL/bidi/readonly/merged-text frame completeness remain individually unverified. Execute six initial static gates once, one upstream-absent full runtime then original failures/genuinely new cases only, actual current-source100 proof, restored source gates, same-agent exact-SHA evaluator explicitly not independent, canonical verify/finish implementationSHA and complete parent-prefix append.

## Verify Steps

Run six initial static gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size. Require native visual-line start/end, right-margin ambiguity, hard-break exclusion, API versus interactive spaces, empty/surrogate text, current body/cell/follow geometry, Shift fixed/reversed marks, source repeated list-label Home and End clearing, pending attributes and history/continued edit. Exact old580 acceptance bytes preserved outside1source-backed route fixture; all295metadata old fields/defaults/exceptions preserved; physical files below1000. ONE full upstream-absent build/app/inventory/infrastructure/Chromium then original failures or genuinely new cases only. Strict current-source actual100 app/inventory; raw cache only. Restore vendor finally before source/resources/provenance/invariants/parity gates and AP writes; doctor/routing/diff, exact same-agent evaluator, canonical verify, finish actual implementation SHA, parent full-prefix append.

## Verification

Pending implementation and one full upstream-absent runtime; no success claim.

## Rollback Plan

Revert only the intentional implementation commit and retain immutable task evidence; do not alter unrelated work or deferred stash.

## Findings

Read-only initial audit: browser-writer-edit-window currently handles Ctrl/Meta Home/End only; ordinary keys fall through. Source txtcrsr.cxx127-139 routes all four ordinary/selected line slots via LeftMargin/RightMargin(falseBasic); move.cxx176-207 uses ShellMoveCursor. Source SwCursor.LeftRightMargin delegates current layout frame; frmcrsr.cxx excludes hard break, trims ASCII spaces only nonAPI nonlast lines, maintains right-margin ambiguity through itrtxt.cxx. LRMargin repeats Home into visible list label and End clears label state. No tests have run for this leaf. Previous214 leaf made authoritative implementation/verification/closure progress; no live process remains.
