---
id: "202610131541-J4GV99"
title: "Honor native disabled-item traversal in menubar popups"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T15:42:24.412Z"
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
    body: "Start: native disabled popup selection via current DOM entries and actual bindings, original HTML disabled execution protection; preserve registered Space adapter, oldtests unchanged, whole1module100four and cadence7/10."
events:
  -
    type: "status"
    at: "2026-10-13T15:42:25.218Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native disabled popup selection via current DOM entries and actual bindings, original HTML disabled execution protection; preserve registered Space adapter, oldtests unchanged, whole1module100four and cadence7/10."
doc_version: 3
doc_updated_at: "2026-10-13T15:42:25.218Z"
doc_updated_by: "CODER"
description: "Use original bindings disabled states in native popup selection order; keep disabled HTML buttons unactivated and focus their owning menu, source Return cancellation. Preserve registered browser Space activation adapter and all IO/recovery differences. Original native/mounted/Chromium proof and whole current module100four; correction7/10."
sections:
  Summary: "Restore native disabled-item traversal for existing menubar popup entries."
  Scope: "CommandMenuBar.tsx only; append its2shared canonical runtime/provenance records. New sw/browser/presentation/native-disabled-menubar.test.tsx and e2e/writer-native-disabled-menubar.spec.ts. Task/parent evidence. All old tests/cases/imports byte-identical; no source default/classification/IO/recovery change, no raw events/new low-level machinery/extra module or command adapter."
  Plan: "Keep original native bindings admission and HTML disabled protection. Use existing popup DOM nodes, direct resource order, data-popup-highlighted and aria-activedescendant for selection independent of focus. Remove enabled-only arrow/preselection filtering; disabled selection keeps focus on its actual menu. Resolve later keyboard input from the selected entry; native Return on disabled closes current popup only without dispatch. Keep already registered browser Space adapter intact: enabled activation remains supported, HTML disabled click never dispatches. Native DOM/API functions and existing callbacks only, no mirrored Map/state manager/new allocation layers. Standing goal authorizes safe local task/internal approval. Previous7753KN DONE at a6995b24, semantic945a1f994; progress proven by authoritative clean writer state."
  Verify Steps: "Genuine red with original WriterSession/ViewFrame/Sfx bindings (not synthetic commands) and actual DOM: disabled first/middle/last/all-disabled entries are selected in native default SkipDisabledInMenus=false order, Home/End/arrows/wrap; keyboard root/child preselection includes disabled. Native Return cancels only current popup without document/history change; enabled command after disabled traversal uses actual native Execute, checked state/history and restored owner; disabled Space stays unactivated through HTML builtin, registered enabled/root/child Space adapter unchanged. Actual Chromium1280/390 menubar navigation/history/focus and context menus/table regressions. Whole original CommandMenuBar module100allfour/positive actual Istanbul counters/current source original IDs/locations, no thresholds/provider/exclusions/normalization changes. Fresh/related/tooling/TS7/scoped format/full lint/docs/size/deps/build/static run with4LO/mdds/ICU/boost refs physically hidden and exact lstat finally restoration; no source/test/ref mutation during live producer. Final9restored-only metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. All oldtests unchanged,2canonical historical prefixes/scalars/status/default/classification preserved; no helpers/upstream sources/rawmaps in Agentplane. Exact semanticSHA same-agent non-independent quality review and clean direct close. Cadence7/10; full once10, pause after next full+repairs."
  Verification: "Pending genuine red, native owner/current-source coverage and checks."
  Rollback Plan: "Revert only the scoped semantic commit if required, preserve human history. Restore original4reference symlink metadata in finally; no target/source copies/network/global files/publication/history rewrite."
  Findings: "Pinned9bc445578031fecf56086729d8e4940c77e14d65 MenuFloatingWindow::ImplCursorUpDown includes disabled by StyleSettings GetSkipDisabledInMenus defaultfalse, source PopupMenu::Execute preselection uses same default, KEY_RETURN disabled invokes StopExecute. Existing menubar filters disabled in focusMenuItem, conflating native selection with browser focus. Existing standalone CommandPopupMenu already represents this distinction; menubar popup still differs. Registry explicitly says Space retained as browser activation adapter; preserve that conscious deviation per human, do not remove it despite source comparison. Native pointer timers/mnemonics/complete focus graph/shared popup-controller integration remain unverified follow-ups. No suspected core bug invented; registered IO/recovery retained."
id_source: "generated"
---
## Summary

Restore native disabled-item traversal for existing menubar popup entries.

## Scope

CommandMenuBar.tsx only; append its2shared canonical runtime/provenance records. New sw/browser/presentation/native-disabled-menubar.test.tsx and e2e/writer-native-disabled-menubar.spec.ts. Task/parent evidence. All old tests/cases/imports byte-identical; no source default/classification/IO/recovery change, no raw events/new low-level machinery/extra module or command adapter.

## Plan

Keep original native bindings admission and HTML disabled protection. Use existing popup DOM nodes, direct resource order, data-popup-highlighted and aria-activedescendant for selection independent of focus. Remove enabled-only arrow/preselection filtering; disabled selection keeps focus on its actual menu. Resolve later keyboard input from the selected entry; native Return on disabled closes current popup only without dispatch. Keep already registered browser Space adapter intact: enabled activation remains supported, HTML disabled click never dispatches. Native DOM/API functions and existing callbacks only, no mirrored Map/state manager/new allocation layers. Standing goal authorizes safe local task/internal approval. Previous7753KN DONE at a6995b24, semantic945a1f994; progress proven by authoritative clean writer state.

## Verify Steps

Genuine red with original WriterSession/ViewFrame/Sfx bindings (not synthetic commands) and actual DOM: disabled first/middle/last/all-disabled entries are selected in native default SkipDisabledInMenus=false order, Home/End/arrows/wrap; keyboard root/child preselection includes disabled. Native Return cancels only current popup without document/history change; enabled command after disabled traversal uses actual native Execute, checked state/history and restored owner; disabled Space stays unactivated through HTML builtin, registered enabled/root/child Space adapter unchanged. Actual Chromium1280/390 menubar navigation/history/focus and context menus/table regressions. Whole original CommandMenuBar module100allfour/positive actual Istanbul counters/current source original IDs/locations, no thresholds/provider/exclusions/normalization changes. Fresh/related/tooling/TS7/scoped format/full lint/docs/size/deps/build/static run with4LO/mdds/ICU/boost refs physically hidden and exact lstat finally restoration; no source/test/ref mutation during live producer. Final9restored-only metadata gates source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. All oldtests unchanged,2canonical historical prefixes/scalars/status/default/classification preserved; no helpers/upstream sources/rawmaps in Agentplane. Exact semanticSHA same-agent non-independent quality review and clean direct close. Cadence7/10; full once10, pause after next full+repairs.

## Verification

Pending genuine red, native owner/current-source coverage and checks.

## Rollback Plan

Revert only the scoped semantic commit if required, preserve human history. Restore original4reference symlink metadata in finally; no target/source copies/network/global files/publication/history rewrite.

## Findings

Pinned9bc445578031fecf56086729d8e4940c77e14d65 MenuFloatingWindow::ImplCursorUpDown includes disabled by StyleSettings GetSkipDisabledInMenus defaultfalse, source PopupMenu::Execute preselection uses same default, KEY_RETURN disabled invokes StopExecute. Existing menubar filters disabled in focusMenuItem, conflating native selection with browser focus. Existing standalone CommandPopupMenu already represents this distinction; menubar popup still differs. Registry explicitly says Space retained as browser activation adapter; preserve that conscious deviation per human, do not remove it despite source comparison. Native pointer timers/mnemonics/complete focus graph/shared popup-controller integration remain unverified follow-ups. No suspected core bug invented; registered IO/recovery retained.
