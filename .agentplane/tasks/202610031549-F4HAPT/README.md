---
id: "202610031549-F4HAPT"
title: "Keep command menu popups reachable within the viewport"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-03T15:50:49.626Z"
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
    body: "Start: restore viewport-bounded scrollable command popups under continuing goal authorization; preserve old menu expectations, gates and deliberate IO deviations."
events:
  -
    type: "status"
    at: "2026-10-03T15:50:50.054Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore viewport-bounded scrollable command popups under continuing goal authorization; preserve old menu expectations, gates and deliberate IO deviations."
doc_version: 3
doc_updated_at: "2026-10-03T15:50:50.054Z"
doc_updated_by: "CODER"
description: "Resolve reproducible short-viewport Writer menu overflow independently of committed iteration61 core change; native screen-bounded scrolling behavior through browser-owned popup placement, preserve existing menu and IO behavior."
sections:
  Summary: "Restore selected native screen-bounded menu scrolling behavior through browser-owned DOM geometry; resolve iteration61 full verification blocker without widening the core task."
  Scope: "Exactly5semantic paths: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx; apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx; apps/office/e2e/writer-responsive-sidebar.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own task bookkeeping and related parent/core findings only."
  Plan: "One browser correction after reproducible isolated failure. Keep top-level and nested popups anchored in viewport coordinates, constrain size to available screen space, scroll within the popup, flip submenus at horizontal edges and reposition on resize/ancestor scroll. Retain DOM ownership, outside dismissal, mouse hover, keyboard focus, command dispatch and all old expected results. Implement a shared in-file popup presenter in CommandMenuBar.tsx, add owned geometry integration checks and responsive browser scrolling/submenu checks, update only its provenance/inventory evidence/responsibility rows without status promotion. Fresh native menu and floating-window inspection hashes only; no saved source/helper files, no test upstream access, no dependencies/policy/gate/IO/recovery changes. Unchanged full verification must pass both100% coverage; evaluator on actual semantic SHA, clean leaf closure. Core task RD0HQY stays blocked/unverified until full gates pass; parent/full goal remain active."
  Verify Steps: |-
    1. Fresh pinned vcl menu/floating-window screen sizing, internal scrolling and keyboard visibility spans/file hashes; unchanged pin, no native copies, compiled probes or saved helper scripts. No claim of full native mouse timer/scroller visuals/mobile native parity.
    2. Existing responsive scenario fails baseline independently; owned tests establish top-level below/above placement, horizontal clamping, submenu flip/vertical clamping, resize and scroll updates/listener cleanup, command dismissal, keyboard navigation and nonclipped submenu reachability. Existing expected values/gates unchanged.
    3. Focused unit/browser checks, vendor-absent owned unit tests, then unchanged npm run verify all gates/both100%; no source calls from project tests. Exactly5semantic paths and evidence/responsibility metadata only; all statuses/deviations/defaults preserved. Zero ignored-inclusive Python/bytecode/native/helper sources in Agentplane, diff/routing/doctor0newerrors.
    4. Canonical verify plus distinct same-actor EVALUATOR actual semantic SHA, clean browser leaf close; core semantic commit910775c2b7a5 separately unverified until fresh full result, parent/full goal active.
  Verification: "Pending."
  Rollback Plan: "Revert only browser semantic commit on request, preserving committed core work, cleanup, pin and history."
  Findings: "Continuing user goal authorizes safe local correction. Core leaf RD0HQY committed910775c2b7a5 but blocked, not verified. Full second attempt and isolated responsive suite reproduce Paragraph popup scroll/detach failure at390x340 without any numbering operation. Existing browser popup is absolute, unbounded and descendant-clipped; native PopupMenu sizes to screen and enables internal scroll, keyboard selection scrolls to visible entries. Native minimum384 is desktop fallback, browser-owned actual viewport bounds remain adaptation; no new registered deviation or full native visual equivalence claim. No Agentplane Python/native source files found at preflight."
id_source: "generated"
---
## Summary

Restore selected native screen-bounded menu scrolling behavior through browser-owned DOM geometry; resolve iteration61 full verification blocker without widening the core task.

## Scope

Exactly5semantic paths: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx; apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx; apps/office/e2e/writer-responsive-sidebar.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own task bookkeeping and related parent/core findings only.

## Plan

One browser correction after reproducible isolated failure. Keep top-level and nested popups anchored in viewport coordinates, constrain size to available screen space, scroll within the popup, flip submenus at horizontal edges and reposition on resize/ancestor scroll. Retain DOM ownership, outside dismissal, mouse hover, keyboard focus, command dispatch and all old expected results. Implement a shared in-file popup presenter in CommandMenuBar.tsx, add owned geometry integration checks and responsive browser scrolling/submenu checks, update only its provenance/inventory evidence/responsibility rows without status promotion. Fresh native menu and floating-window inspection hashes only; no saved source/helper files, no test upstream access, no dependencies/policy/gate/IO/recovery changes. Unchanged full verification must pass both100% coverage; evaluator on actual semantic SHA, clean leaf closure. Core task RD0HQY stays blocked/unverified until full gates pass; parent/full goal remain active.

## Verify Steps

1. Fresh pinned vcl menu/floating-window screen sizing, internal scrolling and keyboard visibility spans/file hashes; unchanged pin, no native copies, compiled probes or saved helper scripts. No claim of full native mouse timer/scroller visuals/mobile native parity.
2. Existing responsive scenario fails baseline independently; owned tests establish top-level below/above placement, horizontal clamping, submenu flip/vertical clamping, resize and scroll updates/listener cleanup, command dismissal, keyboard navigation and nonclipped submenu reachability. Existing expected values/gates unchanged.
3. Focused unit/browser checks, vendor-absent owned unit tests, then unchanged npm run verify all gates/both100%; no source calls from project tests. Exactly5semantic paths and evidence/responsibility metadata only; all statuses/deviations/defaults preserved. Zero ignored-inclusive Python/bytecode/native/helper sources in Agentplane, diff/routing/doctor0newerrors.
4. Canonical verify plus distinct same-actor EVALUATOR actual semantic SHA, clean browser leaf close; core semantic commit910775c2b7a5 separately unverified until fresh full result, parent/full goal active.

## Verification

Pending.

## Rollback Plan

Revert only browser semantic commit on request, preserving committed core work, cleanup, pin and history.

## Findings

Continuing user goal authorizes safe local correction. Core leaf RD0HQY committed910775c2b7a5 but blocked, not verified. Full second attempt and isolated responsive suite reproduce Paragraph popup scroll/detach failure at390x340 without any numbering operation. Existing browser popup is absolute, unbounded and descendant-clipped; native PopupMenu sizes to screen and enables internal scroll, keyboard selection scrolls to visible entries. Native minimum384 is desktop fallback, browser-owned actual viewport bounds remain adaptation; no new registered deviation or full native visual equivalence claim. No Agentplane Python/native source files found at preflight.
