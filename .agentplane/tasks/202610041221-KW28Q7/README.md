---
id: "202610041221-KW28Q7"
title: "Restore native Writer style choice focus and keyboard acceptance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
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
  updated_at: "2026-10-04T12:45:26.068Z"
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
doc_updated_at: "2026-10-04T12:45:25.848Z"
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
    1. Add a generic browser Svx style-box component in the existing svx area. Separate native closed-widget keyboard travel from accepted direct picks, expose frozen primitive entries/actual names and callbacks, and retain tentative selection only until accept/cancel/external binding or option change/blur. ArrowUp/Down and PageUp/Down travel never dispatch or create history.
    2. Accepted pointer choice and Enter resolve the current actual name, release focus to the owning document before dispatch, and preserve source cursor/mark. Tab applies the tentative/current choice without releasing document focus or cancelling normal browser Tab; Escape restores binding-backed selection, dispatches nothing and returns to the client. Optional focus port keeps standalone presenters valid. Disabled widgets cannot dispatch or steal focus.
    3. Replace the private Writer style selector DOM/key behavior with the generic native-responsibility widget; retain existing binding enable/value/name arguments/localized labels, flat population and no-op semantics. WriterWorkbench supplies its own editing-host ref, using existing frame eligibility rather than global document lookup.
    4. Add independent generic sequence/order/travel/key/disabled/external-state cases and actual owned Writer frames with custom/builtin/renamed styles, preserved cursor/mark, no-op/UndoRedo, frame isolation and continued input; Chromium1280/390 real ODT direct and keyboard acceptance/Escape/Tab/focus/typing/history/untouched paragraph plus screenshots outside AP. Preserve all310prior test bytes.
    5. Seven static gates, then app/inventory100percent four metrics/scripts/fullChromium once only absent/finally restore. Only failed gates/scenarios recovered; no successful full suite repeated. After restoration resources--check/source-tree/provenance/invariants/parity, exact10paths/310old tests unchanged/224old rows preserved/readonly hashes/AP forbidden0, routing/doctor, semantic commit then committed verification plus same-actor exact-SHA read-only quality and clean closure/parent progress. No broad parity promotion.
    6. First absent app run exposes canonical DOM restoration stealing toolbar focus on Tab. Defer DOM selection restoration while focus is outside the owning editing host, retaining shell-owned cursor/mark, and restore on explicit host focus. This is necessary for the same approved focus contract; add only WriterPlainTextEditor.tsx to scope and append its bounded provenance description. Focus assertions accept either owning host or its paragraph descendant, while before-dispatch assertions still prove client focus.
    7. DOM restoration must preserve the active editing host rather than unnecessarily moving focus to a paragraph. Add only writer-selection.ts to scope: focus the target paragraph only when focus is outside its owning editing host. Retain initial/standalone restoration and existing exact owning-host focus contracts; unchanged prior tests validate them.
  Verify Steps: |-
    1. Generic widget direct picks and Enter focus owning client before actual style dispatch; ArrowUp/Down/PageUp/Down travel yields no dispatch/history and stops at endpoints. Tab commits without focus release or preventDefault; Escape cancels/restores without dispatch and returns to client. Blur/external style/option replacement invalidates tentative state; disabled state and missing selection are safe. Independent literal event traces and ordered entries prove these contracts.
    2. Actual WriterWorkbench frames preserve cursor/mark, active actual style IDs/names/localization/no-op/history/other paragraphs and existing command arguments. Owning frame receives focus, model/bindings invalidation and document replacement reject stale tentative selection; modal/inactive frame eligibility prevents focus stealing. All310prior tests unchanged.
    3. Real ODT1280/390 accepted direct/custom and keyboard traversal/Enter/Escape/Tab focus assertions precede typing with page.keyboard, without an editor click/focus/press workaround. Actual history/no-op/raw names/untouched paragraph work, screenshots inspected. Seven static gates pass; app/inventory100percent four metrics, scripts/fullChromium only absent/finally restore, only failed gates recovered and no passing full suite repeated.
    4. Restored source4audits/resources-check/parity225modules0violations; exact10paths/all310prior tests byte-identical/224old rows/order/status/default/exception fields preserved with4description appends/1widget row. Native read-only source hashes and ignored-inclusive whole AP forbidden0; routing/doctor, semantic code commit with matching same-actor report, committed verification and clean tracked closure/parent progress. Editable/new styles/special actions/full popup/platform/wider native and parent goal remain unverified.
  Verification: "Pending approved implementation. No tests or static gates run in this iteration."
  Rollback Plan: "Revert only the task semantic commit through a new approved leaf, preserving immutable DONE task artifacts, source pins and registered I/O/recovery exceptions. Vendor absence orchestration restores its directory in finally on every exit."
  Findings: "Read-only native SvxStyleBox_Base Select ignores travel, calls ReleaseFocus before Dispatch, and ActivateHdl accepts Enter. DoKeyInput Tab suppresses one ReleaseFocus then selects without consuming normal focus navigation; Escape restores saved value, releases toolbar focus and consumes the key. Native editable ComboBox direct-pick filters keyboard/travel; inspected GTK closed-widget unmodified up/down/page keys select without direct menu change. Existing browser native select commits every change and has no style acceptance/document-focus port. This task repairs supported ordinary focus/key behavior without certifying the unimplemented editable/special/native popup responsibilities. First absent app run:1364passed/2failed, coverage100percent all four metrics. Existing canonical restoration focuses a paragraph even when the toolbar owns focus, breaking Tab; accepted collapsed selections legitimately focus a descendant of the owning host. Product fix stays in browser editor focus/DOM restoration, source cursor ownership unchanged. Recovery reveals26focus failures: unconditional paragraph focus during explicit host restoration changes prior owning-host focus contracts. Preserve the active editing host in the DOM selection primitive instead of weakening prior tests; all310prior files remain unchanged."
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

1. Add a generic browser Svx style-box component in the existing svx area. Separate native closed-widget keyboard travel from accepted direct picks, expose frozen primitive entries/actual names and callbacks, and retain tentative selection only until accept/cancel/external binding or option change/blur. ArrowUp/Down and PageUp/Down travel never dispatch or create history.
2. Accepted pointer choice and Enter resolve the current actual name, release focus to the owning document before dispatch, and preserve source cursor/mark. Tab applies the tentative/current choice without releasing document focus or cancelling normal browser Tab; Escape restores binding-backed selection, dispatches nothing and returns to the client. Optional focus port keeps standalone presenters valid. Disabled widgets cannot dispatch or steal focus.
3. Replace the private Writer style selector DOM/key behavior with the generic native-responsibility widget; retain existing binding enable/value/name arguments/localized labels, flat population and no-op semantics. WriterWorkbench supplies its own editing-host ref, using existing frame eligibility rather than global document lookup.
4. Add independent generic sequence/order/travel/key/disabled/external-state cases and actual owned Writer frames with custom/builtin/renamed styles, preserved cursor/mark, no-op/UndoRedo, frame isolation and continued input; Chromium1280/390 real ODT direct and keyboard acceptance/Escape/Tab/focus/typing/history/untouched paragraph plus screenshots outside AP. Preserve all310prior test bytes.
5. Seven static gates, then app/inventory100percent four metrics/scripts/fullChromium once only absent/finally restore. Only failed gates/scenarios recovered; no successful full suite repeated. After restoration resources--check/source-tree/provenance/invariants/parity, exact10paths/310old tests unchanged/224old rows preserved/readonly hashes/AP forbidden0, routing/doctor, semantic commit then committed verification plus same-actor exact-SHA read-only quality and clean closure/parent progress. No broad parity promotion.
6. First absent app run exposes canonical DOM restoration stealing toolbar focus on Tab. Defer DOM selection restoration while focus is outside the owning editing host, retaining shell-owned cursor/mark, and restore on explicit host focus. This is necessary for the same approved focus contract; add only WriterPlainTextEditor.tsx to scope and append its bounded provenance description. Focus assertions accept either owning host or its paragraph descendant, while before-dispatch assertions still prove client focus.
7. DOM restoration must preserve the active editing host rather than unnecessarily moving focus to a paragraph. Add only writer-selection.ts to scope: focus the target paragraph only when focus is outside its owning editing host. Retain initial/standalone restoration and existing exact owning-host focus contracts; unchanged prior tests validate them.

## Verify Steps

1. Generic widget direct picks and Enter focus owning client before actual style dispatch; ArrowUp/Down/PageUp/Down travel yields no dispatch/history and stops at endpoints. Tab commits without focus release or preventDefault; Escape cancels/restores without dispatch and returns to client. Blur/external style/option replacement invalidates tentative state; disabled state and missing selection are safe. Independent literal event traces and ordered entries prove these contracts.
2. Actual WriterWorkbench frames preserve cursor/mark, active actual style IDs/names/localization/no-op/history/other paragraphs and existing command arguments. Owning frame receives focus, model/bindings invalidation and document replacement reject stale tentative selection; modal/inactive frame eligibility prevents focus stealing. All310prior tests unchanged.
3. Real ODT1280/390 accepted direct/custom and keyboard traversal/Enter/Escape/Tab focus assertions precede typing with page.keyboard, without an editor click/focus/press workaround. Actual history/no-op/raw names/untouched paragraph work, screenshots inspected. Seven static gates pass; app/inventory100percent four metrics, scripts/fullChromium only absent/finally restore, only failed gates recovered and no passing full suite repeated.
4. Restored source4audits/resources-check/parity225modules0violations; exact10paths/all310prior tests byte-identical/224old rows/order/status/default/exception fields preserved with4description appends/1widget row. Native read-only source hashes and ignored-inclusive whole AP forbidden0; routing/doctor, semantic code commit with matching same-actor report, committed verification and clean tracked closure/parent progress. Editable/new styles/special actions/full popup/platform/wider native and parent goal remain unverified.

## Verification

Pending approved implementation. No tests or static gates run in this iteration.

## Rollback Plan

Revert only the task semantic commit through a new approved leaf, preserving immutable DONE task artifacts, source pins and registered I/O/recovery exceptions. Vendor absence orchestration restores its directory in finally on every exit.

## Findings

Read-only native SvxStyleBox_Base Select ignores travel, calls ReleaseFocus before Dispatch, and ActivateHdl accepts Enter. DoKeyInput Tab suppresses one ReleaseFocus then selects without consuming normal focus navigation; Escape restores saved value, releases toolbar focus and consumes the key. Native editable ComboBox direct-pick filters keyboard/travel; inspected GTK closed-widget unmodified up/down/page keys select without direct menu change. Existing browser native select commits every change and has no style acceptance/document-focus port. This task repairs supported ordinary focus/key behavior without certifying the unimplemented editable/special/native popup responsibilities. First absent app run:1364passed/2failed, coverage100percent all four metrics. Existing canonical restoration focuses a paragraph even when the toolbar owns focus, breaking Tab; accepted collapsed selections legitimately focus a descendant of the owning host. Product fix stays in browser editor focus/DOM restoration, source cursor ownership unchanged. Recovery reveals26focus failures: unconditional paragraph focus during explicit host restoration changes prior owning-host focus contracts. Preserve the active editing host in the DOM selection primitive instead of weakening prior tests; all310prior files remain unchanged.
