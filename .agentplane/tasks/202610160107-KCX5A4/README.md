---
id: "202610160107-KCX5A4"
title: "Implement shared RTL decimal parsing and SAX ODS scalar reader"
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
  updated_at: "2026-10-16T01:07:31.493Z"
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
    body: "Start: implement pinned shared RTL decimal reader and SAX ODS scalar contract with native JS rounding, exact statuses and consumed positions; verify related shared and Calc raw100."
events:
  -
    type: "status"
    at: "2026-10-16T01:07:31.900Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement pinned shared RTL decimal reader and SAX ODS scalar contract with native JS rounding, exact statuses and consumed positions; verify related shared and Calc raw100."
doc_version: 3
doc_updated_at: "2026-10-16T01:07:31.900Z"
doc_updated_by: "CODER"
description: "Task184: port pinned RTL stringToDouble lexical/range contract using native JS decimal rounding and expose actual SAX convertDouble reader for ODS values; preserve source statuses and end positions."
sections:
  Summary: "Implement actual shared RTL decimal parsing and SAX convertDouble reader needed for ODS cell scalar values."
  Scope: "sal/rtl numeric parser, canonical RTL header/status declarations, SAX convertDouble read overloads and tests; inventory/provenance/readiness and Calc upstream suspicion journal. At most35 non-task paths. No formatting writer overload, unit overload, native compiler/probe, external dependency, memory engine or full all-app run. Existing measure algorithms unchanged. Work only calc branch."
  Plan: "Implement the documented Task184 RTL/SAX scalar reader scope and verification contract under standing user authorization."
  Verify Steps: "Pin sal/rtl/math.cxx, include/rtl/math.h, sal/qa/rtl/math/test-rtl-math.cxx and SAX source/header. Replay upstream numeric QA for both bytes and UTF16 with exact value/status/end. Check binary64 ties-to-even, min subnormal, underflow/overflow, rounded legacy DBL_MAX, signed zero and NaN, grouping, whitespace, custom separators, no conversion and optional output pointers. SAX tests assert output writes and suffix including invalid strings. Related shared tests and whole Calc with exact executable owner sets and every raw S/B/F/L counter positive100; Writer-only gaps exempt. Run13source gates,production build and actual Chromium/DOM-free Worker shared check with4reference links absent/restored. No native compiler and no full all-app run until minimum real UI+ODS readiness."
  Verification: "Pending implementation and required verification."
  Rollback Plan: "Revert only task184 source and task commits; preserve calc branch and all reference links. No merge/history rewrite, guard weakening or unrelated Writer-only coverage repair."
  Findings: "Native QA explicitly expects status Ok and end0 for malformed inputs; SAX returns status only and therefore can succeed without consuming input. Preserve and document this boundary. No numeric format writer or full ODS acceptance claim."
id_source: "generated"
---
## Summary

Implement actual shared RTL decimal parsing and SAX convertDouble reader needed for ODS cell scalar values.

## Scope

sal/rtl numeric parser, canonical RTL header/status declarations, SAX convertDouble read overloads and tests; inventory/provenance/readiness and Calc upstream suspicion journal. At most35 non-task paths. No formatting writer overload, unit overload, native compiler/probe, external dependency, memory engine or full all-app run. Existing measure algorithms unchanged. Work only calc branch.

## Plan

Implement the documented Task184 RTL/SAX scalar reader scope and verification contract under standing user authorization.

## Verify Steps

Pin sal/rtl/math.cxx, include/rtl/math.h, sal/qa/rtl/math/test-rtl-math.cxx and SAX source/header. Replay upstream numeric QA for both bytes and UTF16 with exact value/status/end. Check binary64 ties-to-even, min subnormal, underflow/overflow, rounded legacy DBL_MAX, signed zero and NaN, grouping, whitespace, custom separators, no conversion and optional output pointers. SAX tests assert output writes and suffix including invalid strings. Related shared tests and whole Calc with exact executable owner sets and every raw S/B/F/L counter positive100; Writer-only gaps exempt. Run13source gates,production build and actual Chromium/DOM-free Worker shared check with4reference links absent/restored. No native compiler and no full all-app run until minimum real UI+ODS readiness.

## Verification

Pending implementation and required verification.

## Rollback Plan

Revert only task184 source and task commits; preserve calc branch and all reference links. No merge/history rewrite, guard weakening or unrelated Writer-only coverage repair.

## Findings

Native QA explicitly expects status Ok and end0 for malformed inputs; SAX returns status only and therefore can succeed without consuming input. Preserve and document this boundary. No numeric format writer or full ODS acceptance claim.
