---
id: "202610151850-09TN77"
title: "Connect configured font candidates to browser faces"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:50:37.052Z"
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
    body: "Start: connect genuine configured candidate lists and normalization to browser FontFace preparation/matching before Writer document construction, preserving explicit native service gaps."
events:
  -
    type: "status"
    at: "2026-10-15T18:50:41.492Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect genuine configured candidate lists and normalization to browser FontFace preparation/matching before Writer document construction, preserving explicit native service gaps."
doc_version: 3
doc_updated_at: "2026-10-15T18:50:41.492Z"
doc_updated_by: "CODER"
description: "Task165: replace Writer-specific hardcoded CSS check adapter with shared DefaultFontType/Locale matching against registered browser faces; prepare candidate fonts before real Writer document construction, reuse native normalization/query/token owners, and expose the same generic boundary for Calc."
sections:
  Summary: "Task165: generic shared configured-font device binding on actual registered/loaded browser faces, with real Writer bootstrap preparation."
  Scope: "Shared vcl/browser/default-font-device.ts and tests; Writer native role mapping/default-font tests, composition preparation and bootstrap main; a focused real-browser acceptance; related shared/Writer runtime/provenance/capability records and Calc docs (up to25 non-task paths, plus source-backed dependency edges if necessary). Retain explicit missing physical substitution/full OutputDevice/font metadata/config override services. No fake PhysicalFontCollection, guessed installed font list, new memory manager/native compiler or full-suite/UI readiness claim."
  Plan: "Inspect actual FontFace family/status/check behavior with bundled font data in a real browser. Implement generic DefaultFontType/Locale device query and async preparation over registered faces, using existing configured lists, native token parsing and search normalization. Match only successfully loaded faces synchronously; async preparation loads candidates in source order and can continue past failed resources. Use real platform CSS parsing/serialization behavior without guessing system font availability. Map Writer roles in Writer ownership, adapt its existing device port, and await required browser font preparation before main mounts document sessions. Test Calc spreadsheet role using the same generic device. Update original metadata boundaries honestly; strict raw100 on changed shared owners and whole Calc plus related Writer functional tests,13 gates, build and focused existing/new browser scenarios. No full app suite until minimum real UI/ODS milestone."
  Verify Steps: "Verify pinned OutputDevice GetDefaultFont matched-family loop, PhysicalFontCollection lookup normalization and Writer text/heading/fixed role mapping. Real browser: demonstrate missing-font check result, inspect quoted/unquoted FontFace family descriptors and load bundled fonts. Unit acceptance: exact configured order, normalized aliases, missing/errored/unloaded/loaded families, load failure/next candidate, live set changes and actual Locale values; Writer-to-native role mapping and bootstrap preparation; same generic spreadsheet role. Exact shared and Calc raw S/B/F/L100/all counters positive, related Writer tests with Writer-only coverage exemption.13 source gates and inventories, production build, focused browser flow with native refs absent/restored. Record any genuine platform limits; do not replace missing native best-match/substitution with invented fallback."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task-specific source/tests/registry/docs commit together. Restore old synchronous browser entrypoint only by reverting the whole integration; preserve other task commits and source references."
  Findings: ""
id_source: "generated"
---
## Summary

Task165: generic shared configured-font device binding on actual registered/loaded browser faces, with real Writer bootstrap preparation.

## Scope

Shared vcl/browser/default-font-device.ts and tests; Writer native role mapping/default-font tests, composition preparation and bootstrap main; a focused real-browser acceptance; related shared/Writer runtime/provenance/capability records and Calc docs (up to25 non-task paths, plus source-backed dependency edges if necessary). Retain explicit missing physical substitution/full OutputDevice/font metadata/config override services. No fake PhysicalFontCollection, guessed installed font list, new memory manager/native compiler or full-suite/UI readiness claim.

## Plan

Inspect actual FontFace family/status/check behavior with bundled font data in a real browser. Implement generic DefaultFontType/Locale device query and async preparation over registered faces, using existing configured lists, native token parsing and search normalization. Match only successfully loaded faces synchronously; async preparation loads candidates in source order and can continue past failed resources. Use real platform CSS parsing/serialization behavior without guessing system font availability. Map Writer roles in Writer ownership, adapt its existing device port, and await required browser font preparation before main mounts document sessions. Test Calc spreadsheet role using the same generic device. Update original metadata boundaries honestly; strict raw100 on changed shared owners and whole Calc plus related Writer functional tests,13 gates, build and focused existing/new browser scenarios. No full app suite until minimum real UI/ODS milestone.

## Verify Steps

Verify pinned OutputDevice GetDefaultFont matched-family loop, PhysicalFontCollection lookup normalization and Writer text/heading/fixed role mapping. Real browser: demonstrate missing-font check result, inspect quoted/unquoted FontFace family descriptors and load bundled fonts. Unit acceptance: exact configured order, normalized aliases, missing/errored/unloaded/loaded families, load failure/next candidate, live set changes and actual Locale values; Writer-to-native role mapping and bootstrap preparation; same generic spreadsheet role. Exact shared and Calc raw S/B/F/L100/all counters positive, related Writer tests with Writer-only coverage exemption.13 source gates and inventories, production build, focused browser flow with native refs absent/restored. Record any genuine platform limits; do not replace missing native best-match/substitution with invented fallback.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task-specific source/tests/registry/docs commit together. Restore old synchronous browser entrypoint only by reverting the whole integration; preserve other task commits and source references.

## Findings
