---
id: "202610222148-RXH8BN"
title: "Connect native Writer superscript and subscript through UI and ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T21:48:41.822Z"
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
    body: "Start: implement approved native superscript/subscript item, source command and sidebar placement, complete value codec and ODT text-position with related checks in writer."
events:
  -
    type: "status"
    at: "2026-10-22T21:48:49.324Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native superscript/subscript item, source command and sidebar placement, complete value codec and ODT text-position with related checks in writer."
doc_version: 3
doc_updated_at: "2026-10-22T21:48:49.324Z"
doc_updated_by: "CODER"
description: "Complete original escapement commands, complete offset/height storage, source sidebar controls, original horizontal baseline arithmetic and style:text-position import/export over existing Writer native owners."
sections:
  Summary: |-
    Connect native Writer superscript and subscript through UI and ODT

    Complete original escapement commands, complete offset/height storage, source sidebar controls, original horizontal baseline arithmetic and style:text-position import/export over existing Writer native owners.
  Scope: "Only writer checkout and writer branch. Native Which6/default and complete escaped offset/proportional-height values, native command IDs and txtattr state/execute, existing UI resource generator and sidebar/icon controls, browser projection/metrics and original horizontal CalcEsc arithmetic, complete browser item codec, actual ODF merged text-position handlers and Writer filter integration. Up to32 implementation/resource paths plus paired canonical records/generated views and up to8 related test paths. Local pinned sources only; no locale, table structural, native memory, network, branch/merge or deliberate I/O/recovery policy changes."
  Plan: "Reuse actual SvxEscapementItem signed16 offset and unsigned8 height; register original default0/100 and complete snapshot restoration. Implement source txtattr superscript/subscript explicit bool and sign toggle/state through actual SwBaseShell/SwEditShell item boundaries, retaining distinct mixed/full-value behavior. Add original sidebar pair and source menu/toolbar placements. Project full native values to actual body/cell/numbering text with original horizontal baseline formulas supplied by genuine browser font metrics; preserve browser geometry ownership. Port original merged XMLEscapementPropHdl/Height handlers and wire actual named/direct ODT properties. Add related command/history/inheritance/codec/device/XML/browser tests, strict changed-responsibility coverage and declared local gates, conservative canonical records and suspected-source issues. Finish task while keeping goal active."
  Verify Steps: "Read pinned hintids/init, txtattr execute and state, command SDI/sidebar, SwSubFont CalcEsc and proportional font path, escphdl and text-position property map. Tests cover default0/100, full signed16/unsigned8 value/copy/codec/history/inherited explicit off, source sign/state and explicit bool commands including mixed heights, ordinary/cell/empty/caret edits and unrelated formatting, native auto/manual horizontal offsets, malformed/one-token/two-token/extra-token SAX and merged property export, actual ODT named/direct roundtrip. Chromium1280/390 must prove source controls, exclusive state, body/cell baseline/scale, history, download and reopen. Run related item/hint/command/history/projection/codec/XML tests, strict changed-responsibility coverage, typecheck/scoped lint/format/build/static/resources/boundaries/docs/size/tree/provenance/invariants/parity/doctor/routing/diff/status. No full suite: fifth task after ACR55N."
  Verification: "Pending implementation and declared current-source checks; no native service or full-module parity claimed."
  Rollback Plan: "Revert this task source commits only, preserving N700C9 and previous UI/table work and task traceability; no reset/merge/external actions."
  Findings: "Previous goal turn is progress: N700C9 closed cde84746197a, source2217028cd752, current4728 related and61 supplemental cases plus7 Chromium scenarios and strict exact-span audit100. Writer working tree clean. Preflight direct/writer confirmed. Broad user mutation/continuation approval persists; stop requests revoked. Existing actual shared escapement item is available but Writer Which/commands/UI/filter links are absent. Local pinned source commit9bc445578031fecf56086729d8e4940c77e14d65. Keep semantic/provenance states conservative; no network or C++memory port."
id_source: "generated"
---
## Summary

Connect native Writer superscript and subscript through UI and ODT

Complete original escapement commands, complete offset/height storage, source sidebar controls, original horizontal baseline arithmetic and style:text-position import/export over existing Writer native owners.

## Scope

Only writer checkout and writer branch. Native Which6/default and complete escaped offset/proportional-height values, native command IDs and txtattr state/execute, existing UI resource generator and sidebar/icon controls, browser projection/metrics and original horizontal CalcEsc arithmetic, complete browser item codec, actual ODF merged text-position handlers and Writer filter integration. Up to32 implementation/resource paths plus paired canonical records/generated views and up to8 related test paths. Local pinned sources only; no locale, table structural, native memory, network, branch/merge or deliberate I/O/recovery policy changes.

## Plan

Reuse actual SvxEscapementItem signed16 offset and unsigned8 height; register original default0/100 and complete snapshot restoration. Implement source txtattr superscript/subscript explicit bool and sign toggle/state through actual SwBaseShell/SwEditShell item boundaries, retaining distinct mixed/full-value behavior. Add original sidebar pair and source menu/toolbar placements. Project full native values to actual body/cell/numbering text with original horizontal baseline formulas supplied by genuine browser font metrics; preserve browser geometry ownership. Port original merged XMLEscapementPropHdl/Height handlers and wire actual named/direct ODT properties. Add related command/history/inheritance/codec/device/XML/browser tests, strict changed-responsibility coverage and declared local gates, conservative canonical records and suspected-source issues. Finish task while keeping goal active.

## Verify Steps

Read pinned hintids/init, txtattr execute and state, command SDI/sidebar, SwSubFont CalcEsc and proportional font path, escphdl and text-position property map. Tests cover default0/100, full signed16/unsigned8 value/copy/codec/history/inherited explicit off, source sign/state and explicit bool commands including mixed heights, ordinary/cell/empty/caret edits and unrelated formatting, native auto/manual horizontal offsets, malformed/one-token/two-token/extra-token SAX and merged property export, actual ODT named/direct roundtrip. Chromium1280/390 must prove source controls, exclusive state, body/cell baseline/scale, history, download and reopen. Run related item/hint/command/history/projection/codec/XML tests, strict changed-responsibility coverage, typecheck/scoped lint/format/build/static/resources/boundaries/docs/size/tree/provenance/invariants/parity/doctor/routing/diff/status. No full suite: fifth task after ACR55N.

## Verification

Pending implementation and declared current-source checks; no native service or full-module parity claimed.

## Rollback Plan

Revert this task source commits only, preserving N700C9 and previous UI/table work and task traceability; no reset/merge/external actions.

## Findings

Previous goal turn is progress: N700C9 closed cde84746197a, source2217028cd752, current4728 related and61 supplemental cases plus7 Chromium scenarios and strict exact-span audit100. Writer working tree clean. Preflight direct/writer confirmed. Broad user mutation/continuation approval persists; stop requests revoked. Existing actual shared escapement item is available but Writer Which/commands/UI/filter links are absent. Local pinned source commit9bc445578031fecf56086729d8e4940c77e14d65. Keep semantic/provenance states conservative; no network or C++memory port.
