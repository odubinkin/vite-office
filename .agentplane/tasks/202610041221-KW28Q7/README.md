---
id: "202610041221-KW28Q7"
title: "Restore native Writer style choice focus and keyboard acceptance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 27
origin:
  system: "manual"
depends_on:
  - "202610041144-M3V0VR"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T13:05:51.555Z"
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
    body: "Start: restore the next single style-box focus/keyboard contract under the standing approved goal; preserve existing population/name behavior, tests only absent, no passing-suite repeats and no AP source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T12:22:10.410Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the next single style-box focus/keyboard contract under the standing approved goal; preserve existing population/name behavior, tests only absent, no passing-suite repeats and no AP source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T13:05:51.329Z"
doc_updated_by: "CODER"
description: "Iteration104 restores style-box direct acceptance, noncommitting keyboard travel, Enter/Tab/Escape and focus-before-dispatch through an actual frame client. Preserve previous population/name contracts and registered I/O/recovery deviations; full editable creation, special actions, previews and native popup/platform details remain open."
sections:
  Summary: "Restore the native style box accepted-choice focus-before-dispatch and noncommitting keyboard travel/Enter/Tab/Escape contracts in the existing Writer toolbar. Iteration103 populated actual styles but retained a native HTML select whose direct change keeps toolbar focus."
  Scope: |-
    Exactly10semantic paths:
    - apps/office/src/svx/browser/tbxctrls/StyleToolboxSelect.tsx
    - apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
    - apps/office/src/sw/browser/presentation/writer-view.tsx
    - apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    - apps/office/src/sw/browser/editor/writer-selection.ts
    - apps/office/src/svx/browser/tbxctrls/StyleToolboxSelect.test.tsx
    - apps/office/src/sw/browser/presentation/writer-view-style-focus.test.tsx
    - apps/office/e2e/writer-style-focus.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    All310prior test files byte-identical;224old mapping rows/order/status/default/exception fields preserved,4bounded production descriptions appended and1browser widget row added. Read-only native source/hash comparison; no AP source/helper/Python/native probes/archives/raw diagnostics/code diffs. All product tests only absent with finally restore; no passing full suite repeated, no pre-fix baseline tests. No network/outside/global/subagents. Registered save/open/recovery deviations unchanged. Editable style creation, special Clear/More actions, previews/context menus, full popup/platform and wider core/style/UI/default parity remain open.
  Plan: |-
    1. Generic svx browser style selector owns tentative closed-widget Arrow/Page travel and ordinary acceptance/cancellation. Resolve the actual rendered entry before applying; direct picks and Enter focus the owning client before dispatch, Tab applies without consuming normal navigation, Escape cancels and returns client focus, and blur/replaced bindings/options discard tentative state. Writer binding adapter retains existing names/localized labels/arguments and frame eligibility.
    2. WriterWorkbench supplies its editing-host ref. Browser editor projects canonical DOM selection while preserving toolbar focus; defer restoration only when another editing client owns focus and restore that deferred state when this host regains focus. Collapsed restoration preserves explicit container focus while paragraph editing follows adjacent nodes. Core cursor/mark and existing command ownership remain unchanged.
    3. Independent generic9cases and actual Writer5cases cover ordered native names, dispatch ordering, draft invalidation, no-op/history/cursor/mark, document replacement and inactive/modal/other-frame focus. Real ODT direct/key desktop/mobile cases prove focus before continued page.keyboard input, untouched paragraphs and history; inspect4final screenshots outside AP. All310prior test files stay byte-identical.
    4. Final seven static gates pass. All product runs only absent/finally restore: failed app gate recovered to1366passed/233files100percent four metrics; inventory109/36files100percent and scripts5passed once. FullChromium90passed/3failed; failed selection recovered, two outstanding failures and4focus cases pass on final sources. Only WriterPlainTextEditor changed after full app pass; focused8file86case final editor run gives100percent four metrics. Passing full suites never repeated; no source/AP/scope audit concurrent with tests. Static artifact validation runs on absent final build.
    5. Restored resources/source-tree/provenance/invariants4source audits and parity225modules0violations; exact10paths/310oldtests unchanged/224oldmapping rows unchanged except4bounded descriptions plus1unverified browser row;3native read-only hashes, AP forbidden0, routing/doctor. Semantic commit, exact-SHA same-actor read-only quality, committed verification and clean task closure/parent progress. Wider native/widget/core/browser/default parity remains open.
  Verify Steps: |-
    1. Generic ordinary widget acceptance releases owning-client focus before actual-name dispatch; travel has no model/history effect, endpoints stop, Tab applies without focus release/preventDefault, Escape restores and focuses client, blur/options/value replacement rejects drafts, disabled/missing selections are safe. Independent literal sequences verify9cases.
    2. Actual Writer frames retain point/mark, actual custom names/IDs/localization/no-op/history/other paragraph/native existing arguments, bindings/document replacement and modal/inactive/other-frame focus. All310prior test files byte-identical.
    3. Product tests only vendor absent/finally restore. Full app1366passed/233files and inventory109passed/36files with100percent four metrics; scripts5passed. After browser regression correction only WriterPlainTextEditor changes; final8file86case focused app/editor coverage100percent four metrics, full passing app not repeated. Sevenstatic gates pass including final absent static build validation. Initial fullChromium90passed/3failed, document selection recovery plus final2remainingfailed/4affectedfocus cases pass;93unique cases validated, no passing full browser suite repeat. Real ODT1280/390 input follows accepted style focus without editor workaround, history and untouched paragraph preserved;4final screenshots inspected.
    4. Restored4source-only audits/parity225modules0violations, exact10paths/all310tests byte-identical/224oldrows order/status/default/exception preserved with4description appends/1widget row.3native readonly hashes and whole ignored-inclusive AP forbidden0. Routing/doctor0errors, exact semantic-SHA same-actor quality, committed verification/clean closure/parent progress. No native execution/source copies/network/outside/global/subagents. Editable/new styles/ClearMore/previews/contextmenus/full popup/platform/wider parity remain unverified.
  Verification: "Checks complete; committed verification and exact-SHA quality pending semantic commit. Full app1366/233files, inventory109/36files, scripts5; full app/inventory100percent four metrics. Final changed-editor8files86cases100percent all metrics;93unique Chromium cases through bounded failure recovery/final focus checks. All product runs vendor absent with finally restore, passing full suites never repeated; no concurrent source/scope/AP audits. Sevenstatic,4restoredsource audits,225modules0violations, exact10paths, all310prior tests byte-identical,224oldrows preserved with4bounded description appends/1unverifiedbrowserrow,3sourcehashes, AP3455files forbidden0/five historical prose-only diff references. Four final1280/390 direct/key screenshots inspected: custom name and document/sidebar agree, untouched paragraph retained. Doctor0errors/two existing warnings; registered deviations unchanged. Wider parity remains open."
  Rollback Plan: "Revert only the task semantic commit through a new approved leaf, preserving immutable DONE task artifacts, source pins and registered I/O/recovery exceptions. Vendor absence orchestration restores its directory in finally on every exit."
  Findings: "Native read-only SvxStyleBox Select ignores travel, resolves entry before ReleaseFocus-before-Dispatch, Enter activates, Tab suppresses one focus release without consuming navigation, Escape restores saved binding and releases toolbar focus. GTK ordinary closed-key travel is bounded/non-direct; native editable/popup/special/storage/preview/contextmenu behavior remains unverified. Browser DOM restoration originally steals toolbar focus; simply skipping restoration for toolbar fields breaks Select All/clipboard/delete because DOM range stays stale. Final browser boundary projects canonical selection while restoring the external toolbar field's focus and defers only another editing client. Explicit container focus is preserved; normal paragraph editing still follows source nodes. Initial full app failures and browser3failures are recorded as bounded counts/hashes; passing full suites are never repeated. First browser recovery file selectors incidentally repeat two already-passing cases; final recovery uses exact grep and additionally4focus cases after changed editor code. Source ownership/command payload and registered save/open/recovery deviations are unchanged; wider parent parity is not certified."
id_source: "generated"
---
## Summary

Restore the native style box accepted-choice focus-before-dispatch and noncommitting keyboard travel/Enter/Tab/Escape contracts in the existing Writer toolbar. Iteration103 populated actual styles but retained a native HTML select whose direct change keeps toolbar focus.

## Scope

Exactly10semantic paths:
- apps/office/src/svx/browser/tbxctrls/StyleToolboxSelect.tsx
- apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx
- apps/office/src/sw/browser/presentation/writer-view.tsx
- apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
- apps/office/src/sw/browser/editor/writer-selection.ts
- apps/office/src/svx/browser/tbxctrls/StyleToolboxSelect.test.tsx
- apps/office/src/sw/browser/presentation/writer-view-style-focus.test.tsx
- apps/office/e2e/writer-style-focus.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
All310prior test files byte-identical;224old mapping rows/order/status/default/exception fields preserved,4bounded production descriptions appended and1browser widget row added. Read-only native source/hash comparison; no AP source/helper/Python/native probes/archives/raw diagnostics/code diffs. All product tests only absent with finally restore; no passing full suite repeated, no pre-fix baseline tests. No network/outside/global/subagents. Registered save/open/recovery deviations unchanged. Editable style creation, special Clear/More actions, previews/context menus, full popup/platform and wider core/style/UI/default parity remain open.

## Plan

1. Generic svx browser style selector owns tentative closed-widget Arrow/Page travel and ordinary acceptance/cancellation. Resolve the actual rendered entry before applying; direct picks and Enter focus the owning client before dispatch, Tab applies without consuming normal navigation, Escape cancels and returns client focus, and blur/replaced bindings/options discard tentative state. Writer binding adapter retains existing names/localized labels/arguments and frame eligibility.
2. WriterWorkbench supplies its editing-host ref. Browser editor projects canonical DOM selection while preserving toolbar focus; defer restoration only when another editing client owns focus and restore that deferred state when this host regains focus. Collapsed restoration preserves explicit container focus while paragraph editing follows adjacent nodes. Core cursor/mark and existing command ownership remain unchanged.
3. Independent generic9cases and actual Writer5cases cover ordered native names, dispatch ordering, draft invalidation, no-op/history/cursor/mark, document replacement and inactive/modal/other-frame focus. Real ODT direct/key desktop/mobile cases prove focus before continued page.keyboard input, untouched paragraphs and history; inspect4final screenshots outside AP. All310prior test files stay byte-identical.
4. Final seven static gates pass. All product runs only absent/finally restore: failed app gate recovered to1366passed/233files100percent four metrics; inventory109/36files100percent and scripts5passed once. FullChromium90passed/3failed; failed selection recovered, two outstanding failures and4focus cases pass on final sources. Only WriterPlainTextEditor changed after full app pass; focused8file86case final editor run gives100percent four metrics. Passing full suites never repeated; no source/AP/scope audit concurrent with tests. Static artifact validation runs on absent final build.
5. Restored resources/source-tree/provenance/invariants4source audits and parity225modules0violations; exact10paths/310oldtests unchanged/224oldmapping rows unchanged except4bounded descriptions plus1unverified browser row;3native read-only hashes, AP forbidden0, routing/doctor. Semantic commit, exact-SHA same-actor read-only quality, committed verification and clean task closure/parent progress. Wider native/widget/core/browser/default parity remains open.

## Verify Steps

1. Generic ordinary widget acceptance releases owning-client focus before actual-name dispatch; travel has no model/history effect, endpoints stop, Tab applies without focus release/preventDefault, Escape restores and focuses client, blur/options/value replacement rejects drafts, disabled/missing selections are safe. Independent literal sequences verify9cases.
2. Actual Writer frames retain point/mark, actual custom names/IDs/localization/no-op/history/other paragraph/native existing arguments, bindings/document replacement and modal/inactive/other-frame focus. All310prior test files byte-identical.
3. Product tests only vendor absent/finally restore. Full app1366passed/233files and inventory109passed/36files with100percent four metrics; scripts5passed. After browser regression correction only WriterPlainTextEditor changes; final8file86case focused app/editor coverage100percent four metrics, full passing app not repeated. Sevenstatic gates pass including final absent static build validation. Initial fullChromium90passed/3failed, document selection recovery plus final2remainingfailed/4affectedfocus cases pass;93unique cases validated, no passing full browser suite repeat. Real ODT1280/390 input follows accepted style focus without editor workaround, history and untouched paragraph preserved;4final screenshots inspected.
4. Restored4source-only audits/parity225modules0violations, exact10paths/all310tests byte-identical/224oldrows order/status/default/exception preserved with4description appends/1widget row.3native readonly hashes and whole ignored-inclusive AP forbidden0. Routing/doctor0errors, exact semantic-SHA same-actor quality, committed verification/clean closure/parent progress. No native execution/source copies/network/outside/global/subagents. Editable/new styles/ClearMore/previews/contextmenus/full popup/platform/wider parity remain unverified.

## Verification

Checks complete; committed verification and exact-SHA quality pending semantic commit. Full app1366/233files, inventory109/36files, scripts5; full app/inventory100percent four metrics. Final changed-editor8files86cases100percent all metrics;93unique Chromium cases through bounded failure recovery/final focus checks. All product runs vendor absent with finally restore, passing full suites never repeated; no concurrent source/scope/AP audits. Sevenstatic,4restoredsource audits,225modules0violations, exact10paths, all310prior tests byte-identical,224oldrows preserved with4bounded description appends/1unverifiedbrowserrow,3sourcehashes, AP3455files forbidden0/five historical prose-only diff references. Four final1280/390 direct/key screenshots inspected: custom name and document/sidebar agree, untouched paragraph retained. Doctor0errors/two existing warnings; registered deviations unchanged. Wider parity remains open.

## Rollback Plan

Revert only the task semantic commit through a new approved leaf, preserving immutable DONE task artifacts, source pins and registered I/O/recovery exceptions. Vendor absence orchestration restores its directory in finally on every exit.

## Findings

Native read-only SvxStyleBox Select ignores travel, resolves entry before ReleaseFocus-before-Dispatch, Enter activates, Tab suppresses one focus release without consuming navigation, Escape restores saved binding and releases toolbar focus. GTK ordinary closed-key travel is bounded/non-direct; native editable/popup/special/storage/preview/contextmenu behavior remains unverified. Browser DOM restoration originally steals toolbar focus; simply skipping restoration for toolbar fields breaks Select All/clipboard/delete because DOM range stays stale. Final browser boundary projects canonical selection while restoring the external toolbar field's focus and defers only another editing client. Explicit container focus is preserved; normal paragraph editing still follows source nodes. Initial full app failures and browser3failures are recorded as bounded counts/hashes; passing full suites are never repeated. First browser recovery file selectors incidentally repeat two already-passing cases; final recovery uses exact grep and additionally4focus cases after changed editor code. Source ownership/command payload and registered save/open/recovery deviations are unchanged; wider parent parity is not certified.
