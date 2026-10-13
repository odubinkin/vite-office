---
id: "202610131200-TWGN0F"
title: "Restore native disabled-item popup navigation"
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
  updated_at: "2026-10-13T12:01:21.197Z"
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
    body: "Start: source-backed native default disabled popup navigation with independent highlighted owner, original bindings and a single exact source-contradicting old assertion migration; first correction after latest full, no full replay."
events:
  -
    type: "status"
    at: "2026-10-13T12:01:23.318Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: source-backed native default disabled popup navigation with independent highlighted owner, original bindings and a single exact source-contradicting old assertion migration; first correction after latest full, no full replay."
doc_version: 3
doc_updated_at: "2026-10-13T12:01:23.318Z"
doc_updated_by: "CODER"
description: "Use pinned VCL default SkipDisabledInMenus=false and independent highlighted-item ownership for standalone Writer popup navigation. Disabled entries remain non-executable and preserve native popup focus. Correct the single source-contradicting enabled-only assertion sequence, add native/mounted/Chromium evidence and append canonical records. First correction after accepted full campaign; no full replay or registered IO/recovery changes."
sections:
  Summary: "Restore native standalone popup navigation over disabled selectable entries without executing them."
  Scope: "Production: apps/office/src/framework/browser/presentation/CommandPopupMenu.tsx only. Append its shared runtime/provenance canonical records. Fresh Writer-owned native-disabled-popup.test.tsx and Chromium writer-native-disabled-popup.spec.ts. Source-backed migration limited to the single enabled-only navigation case in sw/browser/presentation/native-command-popup.test.tsx; retain other twelve case bodies and all other acceptance bytes. Task/parent evidence. No menu resource, command/bindings/core setting APIs, schema/provider/exclusion changes, IO/recovery changes or debug exports."
  Plan: "Pinned settings.cxx StyleSettings initializes SkipDisabledInMenus=false; MenuFloatingWindow ImplCursorUpDown accepts disabled entries and KEY_RETURN closes without executing when disabled; Menu::ImplIsSelectable excludes NOSELECT independently of enabled. Represent highlighted item separately from DOM focus, retaining root/child menu focus for a disabled native button and exposing the highlighted entry through aria-activedescendant and a visible highlight. Native resource order includes disabled commands; arrows/Home/End and submenu keyboard preselection update per-popup selection; Return dispatches only original enabled command or opens original submenu, and closes for disabled/unselected. Preserve direct focus/old enabled command behavior and original bindings dispatch. Fresh red first; exact single source-backed assertion migration. Native marked selection/table/source ownership unchanged. Source settings override API, NOSELECT/header resources, menu mnemonics/timers/full pointer/platform presentation remain outside this atomic default-navigation correction and stay unverified. Related/fresh coverage only, whole changed production module100allfour; current-source/raw-counter/old-case audit, canonical prefix preservation, static/build/Chromium and restored-only metadata checks; exact clean semantic SHA same-agent review then closure. Correction1 after newest accepted full; full only at next ten-task boundary."
  Verify Steps: "1. Reproduce actual native disabled first-entry navigation in fresh mounted UI with original Writer frame/bindings, no production mock commands or upstream runtime calls. Confirm pinned native default=false and Return-disabled StopExecute. 2. Fresh cases: unselected root, forward/reverse/wrap/Home/End over disabled items, native enabled execution and original focus/history, disabled Return no dispatch, child first disabled highlight/root focus, sibling/parent selection ownership and dynamic native enable/disable. Real Chromium empty selection Cut/Copy remain disabled but keyboard-highlightable and Enter cancels without altering document. 3. Whole CommandPopupMenu.tsx100 lines/statements/functions/branches with original raw positive counters/current hashes/locations. Related tests, all fresh/migrated cases, TS7/format/lint/docs/size/dependencies/fresh build/static plus Chromium pass. All runtime/static producers physically hide LO/mdds/ICU refs and restorefinally exact targets; no source/test/reference mutations while producers live. 4. Preserve all original acceptance bytes except the exact approved source-contradicting navigation case; compare other twelve bodies byte-for-byte. Canonical old history/status/default/class/capabilities preserved. Final metadata-only source-tree/provenance/registry/resource-generator --check/invariants/parity/routing/doctor/diff audits after terminal/restored; no raw source/helper/Python/maps in Agentplane. 5. Recorded attempts/residual source gaps, exact current semantic SHA review explicitly same-agent/not independent, scoped commits and clean tracked/untracked state."
  Verification: "Pending genuine red and implementation verification; no acceptance claim."
  Rollback Plan: "Revert only scoped semantic commit when necessary, preserving human work and prior history. Restore exact three reference targets in finally. No history rewrite or external publication."
  Findings: "Standing user upstream goal and authoritative active resumption approve safe local source-backed corrections and internal plan lifecycle. Previous goal turn made verified source/test/state progress and ended paused after full; goal is now active, writer branch clean after human Calc integration. Only parentC9TN6M remains overarching; obsolete X6VV8G is not a live producer. Pinned LO9bc445578031fecf56086729d8e4940c77e14d65. Source first disabled navigation contradicts current enabled filter and DOM-focus-as-selection; native default false and disabled Return cancellation require explicit selection ownership. Do not claim native StyleSettings override API or complete menu parity; preserve registered IO/recovery exceptions."
id_source: "generated"
---
## Summary

Restore native standalone popup navigation over disabled selectable entries without executing them.

## Scope

Production: apps/office/src/framework/browser/presentation/CommandPopupMenu.tsx only. Append its shared runtime/provenance canonical records. Fresh Writer-owned native-disabled-popup.test.tsx and Chromium writer-native-disabled-popup.spec.ts. Source-backed migration limited to the single enabled-only navigation case in sw/browser/presentation/native-command-popup.test.tsx; retain other twelve case bodies and all other acceptance bytes. Task/parent evidence. No menu resource, command/bindings/core setting APIs, schema/provider/exclusion changes, IO/recovery changes or debug exports.

## Plan

Pinned settings.cxx StyleSettings initializes SkipDisabledInMenus=false; MenuFloatingWindow ImplCursorUpDown accepts disabled entries and KEY_RETURN closes without executing when disabled; Menu::ImplIsSelectable excludes NOSELECT independently of enabled. Represent highlighted item separately from DOM focus, retaining root/child menu focus for a disabled native button and exposing the highlighted entry through aria-activedescendant and a visible highlight. Native resource order includes disabled commands; arrows/Home/End and submenu keyboard preselection update per-popup selection; Return dispatches only original enabled command or opens original submenu, and closes for disabled/unselected. Preserve direct focus/old enabled command behavior and original bindings dispatch. Fresh red first; exact single source-backed assertion migration. Native marked selection/table/source ownership unchanged. Source settings override API, NOSELECT/header resources, menu mnemonics/timers/full pointer/platform presentation remain outside this atomic default-navigation correction and stay unverified. Related/fresh coverage only, whole changed production module100allfour; current-source/raw-counter/old-case audit, canonical prefix preservation, static/build/Chromium and restored-only metadata checks; exact clean semantic SHA same-agent review then closure. Correction1 after newest accepted full; full only at next ten-task boundary.

## Verify Steps

1. Reproduce actual native disabled first-entry navigation in fresh mounted UI with original Writer frame/bindings, no production mock commands or upstream runtime calls. Confirm pinned native default=false and Return-disabled StopExecute. 2. Fresh cases: unselected root, forward/reverse/wrap/Home/End over disabled items, native enabled execution and original focus/history, disabled Return no dispatch, child first disabled highlight/root focus, sibling/parent selection ownership and dynamic native enable/disable. Real Chromium empty selection Cut/Copy remain disabled but keyboard-highlightable and Enter cancels without altering document. 3. Whole CommandPopupMenu.tsx100 lines/statements/functions/branches with original raw positive counters/current hashes/locations. Related tests, all fresh/migrated cases, TS7/format/lint/docs/size/dependencies/fresh build/static plus Chromium pass. All runtime/static producers physically hide LO/mdds/ICU refs and restorefinally exact targets; no source/test/reference mutations while producers live. 4. Preserve all original acceptance bytes except the exact approved source-contradicting navigation case; compare other twelve bodies byte-for-byte. Canonical old history/status/default/class/capabilities preserved. Final metadata-only source-tree/provenance/registry/resource-generator --check/invariants/parity/routing/doctor/diff audits after terminal/restored; no raw source/helper/Python/maps in Agentplane. 5. Recorded attempts/residual source gaps, exact current semantic SHA review explicitly same-agent/not independent, scoped commits and clean tracked/untracked state.

## Verification

Pending genuine red and implementation verification; no acceptance claim.

## Rollback Plan

Revert only scoped semantic commit when necessary, preserving human work and prior history. Restore exact three reference targets in finally. No history rewrite or external publication.

## Findings

Standing user upstream goal and authoritative active resumption approve safe local source-backed corrections and internal plan lifecycle. Previous goal turn made verified source/test/state progress and ended paused after full; goal is now active, writer branch clean after human Calc integration. Only parentC9TN6M remains overarching; obsolete X6VV8G is not a live producer. Pinned LO9bc445578031fecf56086729d8e4940c77e14d65. Source first disabled navigation contradicts current enabled filter and DOM-focus-as-selection; native default false and disabled Return cancellation require explicit selection ownership. Do not claim native StyleSettings override API or complete menu parity; preserve registered IO/recovery exceptions.
