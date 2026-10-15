---
id: "202610151836-PB31Q1"
title: "Port native shared font search names and token operations"
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
  updated_at: "2026-10-15T18:36:20.656Z"
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
    body: "Start: port actual shared font search-name rules/dictionary and direct native QA, maintaining suspicious source mappings and original token contracts."
events:
  -
    type: "status"
    at: "2026-10-15T18:36:25.608Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual shared font search-name rules/dictionary and direct native QA, maintaining suspicious source mappings and original token contracts."
doc_version: 3
doc_updated_at: "2026-10-15T18:36:25.608Z"
doc_updated_by: "CODER"
description: "Task164: complete source-backed font name normalization/dictionary, script suffix stripping, raw token append and symbol recognition in existing shared fontdefs owner needed by default-font physical matching; port direct native QA and record IPAex mapping suspicion without correcting upstream."
sections:
  Summary: "Task164: implement shared native font search-name normalization and remaining independent fontdefs operations required by physical font matching, preserving source quirks."
  Scope: "Existing unotools/source/misc/fontdefs.ts and inc/fontdefs.ts, complete source dictionary JSON, one new source-derived/direct-native test file, existing shared runtime/provenance/capability records and Calc core/readiness/suspected-issues docs (up to14 non-task files). No physical font/service stub, font substitution config implementation, native probe/compiler, browser consumer changes or unrelated Writer repair."
  Plan: "Port complete GetEnglishSearchFontName with original ASCII/fullwidth rules and all native localized-name dictionary entries; StripScriptFromName repeatedly strips only original suffixes; AddTokenFontName uses existing exact native token parser and actual OUString mutation; IsOpenSymbol checks first token with ASCII case rules. Preserve original source/header responsibilities, UTF16 views and shared values without a buffer/memory engine. Port actual native testGetEnglishSearchName cases plus exhaustive UTF16 scalar normalization, dictionary and alias/copy/boundary cases. Record suspicious IPAex output unchanged as CALC-143. Strict raw100 for changed shared owners and all Calc, related shared/Writer tests,13 source gates; no browser/build replay without consumer changes. Actual physical/default-device selection remains pending."
  Verify Steps: "Audit pinned fontdefs source/header and direct native QA; verify complete dictionary extraction and original suffix/fullwidth/token/symbol scopes without native compiler. Port all direct testSingleElement cases; test all dictionary pairs and65536 UTF16 units, controls/fullwidth/unmapped Unicode/surrogates; repeated script suffixes, unchanged OUString identity, exact raw token de-duplication including empty/trailing/comma/space/case and alias views; ASCII-only first-token symbol recognition. Run related shared/Writer tests and full Calc with4 source symlinks absent/restored, exact measured sets and raw S/B/F/L100/all counters positive for changed shared and Calc. Run13 established source gates incl inventory/provenance and43 boundary cases. Preserve source typo in code and journal, do not claim complete physical/config/device or UI/ODS readiness. No full all-app run until minimum UI/ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation/test/data/registry/docs commit. No existing browser consumer or document serialization is migrated; prior task163 candidate/token APIs remain available."
  Findings: ""
id_source: "generated"
---
## Summary

Task164: implement shared native font search-name normalization and remaining independent fontdefs operations required by physical font matching, preserving source quirks.

## Scope

Existing unotools/source/misc/fontdefs.ts and inc/fontdefs.ts, complete source dictionary JSON, one new source-derived/direct-native test file, existing shared runtime/provenance/capability records and Calc core/readiness/suspected-issues docs (up to14 non-task files). No physical font/service stub, font substitution config implementation, native probe/compiler, browser consumer changes or unrelated Writer repair.

## Plan

Port complete GetEnglishSearchFontName with original ASCII/fullwidth rules and all native localized-name dictionary entries; StripScriptFromName repeatedly strips only original suffixes; AddTokenFontName uses existing exact native token parser and actual OUString mutation; IsOpenSymbol checks first token with ASCII case rules. Preserve original source/header responsibilities, UTF16 views and shared values without a buffer/memory engine. Port actual native testGetEnglishSearchName cases plus exhaustive UTF16 scalar normalization, dictionary and alias/copy/boundary cases. Record suspicious IPAex output unchanged as CALC-143. Strict raw100 for changed shared owners and all Calc, related shared/Writer tests,13 source gates; no browser/build replay without consumer changes. Actual physical/default-device selection remains pending.

## Verify Steps

Audit pinned fontdefs source/header and direct native QA; verify complete dictionary extraction and original suffix/fullwidth/token/symbol scopes without native compiler. Port all direct testSingleElement cases; test all dictionary pairs and65536 UTF16 units, controls/fullwidth/unmapped Unicode/surrogates; repeated script suffixes, unchanged OUString identity, exact raw token de-duplication including empty/trailing/comma/space/case and alias views; ASCII-only first-token symbol recognition. Run related shared/Writer tests and full Calc with4 source symlinks absent/restored, exact measured sets and raw S/B/F/L100/all counters positive for changed shared and Calc. Run13 established source gates incl inventory/provenance and43 boundary cases. Preserve source typo in code and journal, do not claim complete physical/config/device or UI/ODS readiness. No full all-app run until minimum UI/ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation/test/data/registry/docs commit. No existing browser consumer or document serialization is migrated; prior task163 candidate/token APIs remain available.

## Findings
