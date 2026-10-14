---
id: "202610140354-5VA8Q8"
title: "Retain native parent popups across nested menubar children"
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
  updated_at: "2026-10-14T03:56:28.429Z"
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
    body: "Start: native per-parent recursive popup path replaces scalar menubar shortcut; one-shot opening focus/nearest parent close and original resources/bindings retained, no new UI layer. Whole currentmodule100four,newcycle2/10."
events:
  -
    type: "status"
    at: "2026-10-14T03:56:30.098Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native per-parent recursive popup path replaces scalar menubar shortcut; one-shot opening focus/nearest parent close and original resources/bindings retained, no new UI layer. Whole currentmodule100four,newcycle2/10."
doc_version: 3
doc_updated_at: "2026-10-14T03:56:30.098Z"
doc_updated_by: "CODER"
description: "New cycle2/10: remove single global menubar child-id state and preserve original per-parent active popup chain through recursive resource depth. Native nested window ownership, nearest-parent close/focus and sibling subtree replacement; one original path and one-shot focus request, no new layer/manager. Protected IO/recovery/Space."
sections:
  Summary: "Retain existing recursive menubar parent popups while opening/closing their original child windows."
  Scope: "Production1 framework/browser/presentation/CommandMenuBar.tsx,2canonical shared runtime/provenance records. Fresh original WriterSession/bindings DOM native-menubar-chain.test.tsx under sw/browser/presentation. Existing related tests byte-identical and current Chromium regressions. Existing recursive placement API only; current generated Writer menus have one child level, no new visible commands/resource inventory. One path replacing global scalar, one-shot focus request replacing global origin boolean; no new runtime manager/module/layer. Correction2/10."
  Plan: "Replace one global openSubmenuId with one active child path indexed by owning popup depth; pass depth through existing resource recursion and existing popup DOM. Opening a child preserves ancestor IDs and truncates only its sibling descendants, respecting current empty gate/active reuse. Close current popup truncates from that depth and focuses its actual parent trigger; top-level closure clears entire chain. Make child opening focus request one-shot so closing/reprojection cannot preselect an ancestor. Preserve bindings, nearest keyboard ownership, root arrow switching, protectedSpace/IO/recovery."
  Verify Steps: "1. Inspect pinned pActivePopup/pStartedFrom, HighlightChanged/KillActivePopup and KEY_ESCAPE/KEY_LEFT parent GrabFocus semantics. New native original bindings tests assert actual2/3child-depth parent DOM identity, disabled/default preselection, sibling subtree replacement, empty gate at depth, nearest-only Escape/Left/disabledReturn, same-child reuse, resource rerender and full command teardown/focus/native dispatch. No pinned runtime invoked. 2.4refs physically absent/finally exactrestore for everyproducer; whole current CommandMenuBar.tsx original Istanbul100four/positive counters, new+related once, tooling/current Chromium regressions; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static. No oldacceptance edits/passing replay for helper/metadata fixes. 3.Restore then9source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff gates;2canonical history/scalars/defaults/classification prefixes, all oldtestbytes and final input/buildhashes retained. Exact same-agent non-independent review/clean finish. 4.Full once10atomic corrections; latesthuman requests pause after next scheduledfull+repairs. This2/10, no full now."
  Verification: "Pending native/related/browser/static/source audits."
  Rollback Plan: "Revert scoped semantic commit if necessary without rewriting history. Preserve exact4reference symlinks by finally rename; no network/global files/publication or upstream/own helper/rawsource in Agentplane."
  Findings: "Previous39B6T7 DONE atabf8d40b6c87 semantic6941909d5ca0 with1621unique accepted/wholemenu100four; clean authoritativewriter state. Native pin9bc445578031fecf56086729d8e4940c77e14d65 every MenuFloatingWindow owns its pActivePopup and pStartedFrom; Escape/Left return only to immediate parent and KillActivePopup there. Current recursive menubar renderer has one global child-id, so opening a grandchild removes its owning parent and closing any child resets all descendants. Replace obsolete scalar shortcut with one actual depth path and one-shot child focus request, retain original native resources. Existing supported generated menus have no current second child level; bounded existing recursive API architecture/behavior repair, no feature/resource expansion. Full native pointer timers/mnemonics/platform/accessibility/focus graph/core/UI parity remains unverified; protectedSpace/IO/recovery unchanged. No suspicious core source logic observed."
id_source: "generated"
---
## Summary

Retain existing recursive menubar parent popups while opening/closing their original child windows.

## Scope

Production1 framework/browser/presentation/CommandMenuBar.tsx,2canonical shared runtime/provenance records. Fresh original WriterSession/bindings DOM native-menubar-chain.test.tsx under sw/browser/presentation. Existing related tests byte-identical and current Chromium regressions. Existing recursive placement API only; current generated Writer menus have one child level, no new visible commands/resource inventory. One path replacing global scalar, one-shot focus request replacing global origin boolean; no new runtime manager/module/layer. Correction2/10.

## Plan

Replace one global openSubmenuId with one active child path indexed by owning popup depth; pass depth through existing resource recursion and existing popup DOM. Opening a child preserves ancestor IDs and truncates only its sibling descendants, respecting current empty gate/active reuse. Close current popup truncates from that depth and focuses its actual parent trigger; top-level closure clears entire chain. Make child opening focus request one-shot so closing/reprojection cannot preselect an ancestor. Preserve bindings, nearest keyboard ownership, root arrow switching, protectedSpace/IO/recovery.

## Verify Steps

1. Inspect pinned pActivePopup/pStartedFrom, HighlightChanged/KillActivePopup and KEY_ESCAPE/KEY_LEFT parent GrabFocus semantics. New native original bindings tests assert actual2/3child-depth parent DOM identity, disabled/default preselection, sibling subtree replacement, empty gate at depth, nearest-only Escape/Left/disabledReturn, same-child reuse, resource rerender and full command teardown/focus/native dispatch. No pinned runtime invoked. 2.4refs physically absent/finally exactrestore for everyproducer; whole current CommandMenuBar.tsx original Istanbul100four/positive counters, new+related once, tooling/current Chromium regressions; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static. No oldacceptance edits/passing replay for helper/metadata fixes. 3.Restore then9source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff gates;2canonical history/scalars/defaults/classification prefixes, all oldtestbytes and final input/buildhashes retained. Exact same-agent non-independent review/clean finish. 4.Full once10atomic corrections; latesthuman requests pause after next scheduledfull+repairs. This2/10, no full now.

## Verification

Pending native/related/browser/static/source audits.

## Rollback Plan

Revert scoped semantic commit if necessary without rewriting history. Preserve exact4reference symlinks by finally rename; no network/global files/publication or upstream/own helper/rawsource in Agentplane.

## Findings

Previous39B6T7 DONE atabf8d40b6c87 semantic6941909d5ca0 with1621unique accepted/wholemenu100four; clean authoritativewriter state. Native pin9bc445578031fecf56086729d8e4940c77e14d65 every MenuFloatingWindow owns its pActivePopup and pStartedFrom; Escape/Left return only to immediate parent and KillActivePopup there. Current recursive menubar renderer has one global child-id, so opening a grandchild removes its owning parent and closing any child resets all descendants. Replace obsolete scalar shortcut with one actual depth path and one-shot child focus request, retain original native resources. Existing supported generated menus have no current second child level; bounded existing recursive API architecture/behavior repair, no feature/resource expansion. Full native pointer timers/mnemonics/platform/accessibility/focus graph/core/UI parity remains unverified; protectedSpace/IO/recovery unchanged. No suspicious core source logic observed.
