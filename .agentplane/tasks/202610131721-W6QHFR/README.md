---
id: "202610131721-W6QHFR"
title: "Route native auxiliary mouse clicks through the menubar"
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
  updated_at: "2026-10-13T17:21:51.388Z"
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
    body: "Start: native button-neutral menubar activation through auxclick and original HTML click/disabled guards, no press-release machinery. Original bindings/focus/history retained, whole module100four, cadence10/10."
events:
  -
    type: "status"
    at: "2026-10-13T17:21:53.139Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native button-neutral menubar activation through auxclick and original HTML click/disabled guards, no press-release machinery. Original bindings/focus/history retained, whole module100four, cadence10/10."
doc_version: 3
doc_updated_at: "2026-10-13T17:21:53.139Z"
doc_updated_by: "CODER"
description: "Correction10/10: match pinned menu button-neutral activation through native browser auxclick and existing click, preserve disabled/bindings/focus/Space and registered deviations. Native and Chromium regressions; whole changed module100 then scheduled full checkpoint and user pause."
sections:
  Summary: "Use ordinary browser auxiliary clicks to activate original menubar and popup commands for every native mouse button."
  Scope: "One production module framework/browser/presentation/CommandMenuBar.tsx; its2shared canonical runtime/provenance records. Fresh native sw/browser/presentation/native-menubar-auxclick.test.tsx and Chromium e2e/writer-native-menubar-auxclick.spec.ts. Preserve all existing tests; helpers/raw logs/maps only ignored node_modules cache. Correction10/10, full checkpoint follows."
  Plan: "One menubar root auxclick delegate finds the existing menu/root button and invokes its native click. Original HTML disabled prevents dispatch. Suppress browser context menu within native menu surface; submenu trigger click uses existing openSubmenu without new press/release state. Add genuine original WriterSession/bindings and real Chromium root/disabled/history/nested regressions. Append bounded inventory evidence."
  Verify Steps: "1. Inspect pinned MenuBarWindow::MouseButtonDown and MenuFloatingWindow::MouseButtonUp: no button filter, enabled/separator admission retained. New native and Chromium middle/right root/command/submenu/disabled tests use actual bindings/history/focus; no pinned runtime invoked. 2. Physically hide all4refs/finally restore exact symlinks, run new/related test coverage with whole CommandMenuBar.tsx original Istanbul100four/positive counters; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static/tooling/relevant Chromium regressions. No passing replays for metadata/helper-only fixes. 3. Restore refs then source-tree/provenance/registry/resource generator --check/invariants/parity/routing/doctor/diff audits; oldtestbytes and2canonical historical prefixes retained, same-agent non-independent semanticSHA review, clean finish. 4. This is10th atomic correction; after closure run one full scheduled app/inventory/tooling/resources/Chromium/static profile without refs, fix any failures, verify fixes then pause goal at explicit human request."
  Verification: "Pending native/related checks and the next scheduled full checkpoint."
  Rollback Plan: "Revert scoped semantic commit only. No history rewrite/network/global reads/publication or upstream/helper sources in Agentplane. Exact4reference symlinks restored in finally."
  Findings: "Previous goalturn made verified progress:529MQ3 DONE at702ed2d35901, semanticf5ca87108f62; authoritative clean writer branch,9/10. Pin9bc445578031fecf56086729d8e4940c77e14d65 native menu mouse handlers have no left-button admission filter; menubar port currently accepts only browser primary click. Use JS native auxclick/click rather than custom press/release machinery per human. Standalone popup already handles auxiliary clicks; this correction covers menubar existing button targets. Registered Space/IO/recovery exceptions preserved. Full popup timers/mnemonics/native focus graph/platform and complete parity remain unverified; no suspicious core upstream bug observed."
id_source: "generated"
---
## Summary

Use ordinary browser auxiliary clicks to activate original menubar and popup commands for every native mouse button.

## Scope

One production module framework/browser/presentation/CommandMenuBar.tsx; its2shared canonical runtime/provenance records. Fresh native sw/browser/presentation/native-menubar-auxclick.test.tsx and Chromium e2e/writer-native-menubar-auxclick.spec.ts. Preserve all existing tests; helpers/raw logs/maps only ignored node_modules cache. Correction10/10, full checkpoint follows.

## Plan

One menubar root auxclick delegate finds the existing menu/root button and invokes its native click. Original HTML disabled prevents dispatch. Suppress browser context menu within native menu surface; submenu trigger click uses existing openSubmenu without new press/release state. Add genuine original WriterSession/bindings and real Chromium root/disabled/history/nested regressions. Append bounded inventory evidence.

## Verify Steps

1. Inspect pinned MenuBarWindow::MouseButtonDown and MenuFloatingWindow::MouseButtonUp: no button filter, enabled/separator admission retained. New native and Chromium middle/right root/command/submenu/disabled tests use actual bindings/history/focus; no pinned runtime invoked. 2. Physically hide all4refs/finally restore exact symlinks, run new/related test coverage with whole CommandMenuBar.tsx original Istanbul100four/positive counters; scoped format/full lint/TS7/JSDoc/file-size/deps/build/static/tooling/relevant Chromium regressions. No passing replays for metadata/helper-only fixes. 3. Restore refs then source-tree/provenance/registry/resource generator --check/invariants/parity/routing/doctor/diff audits; oldtestbytes and2canonical historical prefixes retained, same-agent non-independent semanticSHA review, clean finish. 4. This is10th atomic correction; after closure run one full scheduled app/inventory/tooling/resources/Chromium/static profile without refs, fix any failures, verify fixes then pause goal at explicit human request.

## Verification

Pending native/related checks and the next scheduled full checkpoint.

## Rollback Plan

Revert scoped semantic commit only. No history rewrite/network/global reads/publication or upstream/helper sources in Agentplane. Exact4reference symlinks restored in finally.

## Findings

Previous goalturn made verified progress:529MQ3 DONE at702ed2d35901, semanticf5ca87108f62; authoritative clean writer branch,9/10. Pin9bc445578031fecf56086729d8e4940c77e14d65 native menu mouse handlers have no left-button admission filter; menubar port currently accepts only browser primary click. Use JS native auxclick/click rather than custom press/release machinery per human. Standalone popup already handles auxiliary clicks; this correction covers menubar existing button targets. Registered Space/IO/recovery exceptions preserved. Full popup timers/mnemonics/native focus graph/platform and complete parity remain unverified; no suspicious core upstream bug observed.
