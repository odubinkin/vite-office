---
id: "202610181643-YYAGKX"
title: "Implement Calc source simple-number input scanner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T16:44:27.680Z"
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
    body: "Start: Port pinned Unicode simple-number scanner with original grouping, decimal and scientific semantics, then verify all Calc coverage and related RTL behavior."
events:
  -
    type: "status"
    at: "2026-10-18T16:44:41.305Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port pinned Unicode simple-number scanner with original grouping, decimal and scientific semantics, then verify all Calc coverage and related RTL behavior."
doc_version: 3
doc_updated_at: "2026-10-18T16:44:41.305Z"
doc_updated_by: "CODER"
description: "Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle."
sections:
  Summary: |-
    Implement Calc source simple-number input scanner

    Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
  Scope: |-
    - In scope: Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
    - Out of scope: unrelated refactors not required for "Implement Calc source simple-number input scanner".
  Plan: "Port exact Unicode ScStringUtil::parseSimpleNumber scanner into sc/source/core/tool/stringutil.ts and original sc/inc/stringutil.ts boundary. Reuse rtl_math_uStringToDouble and output reference. Cover native simple-number corpus and separator/exponent/grouping/error boundaries at 100 percent. Register runtime, provenance and operation/capability evidence using existing schemas. No generic formatter facade or native allocator. Approved core-first UI plan; UI cycle task2/10. Bound scope to these owners, tests and their registry records."
  Verify Steps: "1. npm run test:coverage:calc: all Calc tests and 100 percent statements, branches, functions and lines including the new scanner. 2. npm run typecheck --workspace @vite-office/office. 3. Touched ESLint and Prettier; dependency, documentation, file-size, source-tree and source-provenance gates. 4. npm run inventory:parity:calc. 5. Inspect pinned sc/qa/unit/ucalc.cxx simple number tests and sc/source/core/tool/stringutil.cxx for literal behavior; scientific disabled, sign-only, malformed grouping, NBSP, alternate decimal, RTL overflow and parse-end behavior must preserve source results. Full all-app run deferred under approved once-per-ten cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Calc source simple-number input scanner

Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.

## Scope

- In scope: Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
- Out of scope: unrelated refactors not required for "Implement Calc source simple-number input scanner".

## Plan

Port exact Unicode ScStringUtil::parseSimpleNumber scanner into sc/source/core/tool/stringutil.ts and original sc/inc/stringutil.ts boundary. Reuse rtl_math_uStringToDouble and output reference. Cover native simple-number corpus and separator/exponent/grouping/error boundaries at 100 percent. Register runtime, provenance and operation/capability evidence using existing schemas. No generic formatter facade or native allocator. Approved core-first UI plan; UI cycle task2/10. Bound scope to these owners, tests and their registry records.

## Verify Steps

1. npm run test:coverage:calc: all Calc tests and 100 percent statements, branches, functions and lines including the new scanner. 2. npm run typecheck --workspace @vite-office/office. 3. Touched ESLint and Prettier; dependency, documentation, file-size, source-tree and source-provenance gates. 4. npm run inventory:parity:calc. 5. Inspect pinned sc/qa/unit/ucalc.cxx simple number tests and sc/source/core/tool/stringutil.cxx for literal behavior; scientific disabled, sign-only, malformed grouping, NBSP, alternate decimal, RTL overflow and parse-end behavior must preserve source results. Full all-app run deferred under approved once-per-ten cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
