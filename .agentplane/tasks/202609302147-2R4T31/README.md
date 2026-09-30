---
id: "202609302147-2R4T31"
title: "Restore sequential native numbering rule import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "numbering"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T21:48:30.262Z"
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
    body: "Start: Restore ordered native list-level replacement and failure retention under the approved iterative goal."
events:
  -
    type: "status"
    at: "2026-09-30T21:48:30.716Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore ordered native list-level replacement and failure retention under the approved iterative goal."
doc_version: 3
doc_updated_at: "2026-09-30T21:53:56.506Z"
doc_updated_by: "CODER"
description: "Apply declared ODF list levels in source order to the native modern Writer base rule, retaining omitted levels and stopping after rejected numbering properties. Replace eager fallback tables with ordered declarations; preserve registered save/open/recovery deviations."
sections:
  Summary: "Restore pinned LibreOffice FillUnoNumRule sequential replacement semantics for the existing Arabic/bullet list import subset."
  Scope: "Runtime: sw/source/core/doc/number.ts, sw/source/core/unocore/unosett.ts, sw/source/filter/xml/xmlimp.ts, xmloff/source/style/xmlstyle.ts, xmloff/source/text/txtparai.ts. Matching core/context/ODT tests and parity metadata only; task-local primary-source evidence and parent progress. No network, outside-repository access, policy/gate changes, or registered open/save/recovery deviation changes."
  Plan: "1. Establish native default rule and copy/validate/commit boundaries from pinned number.cxx, unosett.cxx, xmlnumi.cxx and docstyle.cxx. 2. Introduce a base Arabic rule and owned per-level Set; retain XML declarations in source order, including duplicate and empty declarations. 3. Apply each level through Writer property validation; catch only the native invalid-property failure around the complete loop, preserving previous commits and base omitted levels. 4. Verify source-derived defaults, repeat/abort order, ODT export/reopen, copy and snapshots; run npm run verify. 5. Record evidence, scoped commit, evaluator, finish and parent progress. Existing alias conflicts and unsupported numbering families remain separate audits."
  Verify Steps: "Run focused number/unosett/xmlstyle/txtparai/ODT tests including source-derived modern base defaults, omitted/empty rules, declaration order, duplicate replacement, failure before/after success, failure regardless selected position mode, and invalid-property no partial level commit. Produce bounded differential C++ evidence by extracting actual pinned replacement loop and rejection branches where feasible. Run npm run verify with all required coverage and browser checks unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record final clean git status and actual implementation hash."
  Verification: "Pending implementation and complete mandatory checks."
  Rollback Plan: "Revert the scoped implementation commit after reviewing dependent numbering work; keep task evidence and registered browser deviations."
  Findings: |-
    Authorization: the user's persistent /goal approves iterative safe local parity corrections, one executable child at a time. Preflight: main clean, direct workflow, parent 202609240501-C9TN6M active. Sources: pinned libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65, repository cached vendor/libreoffice-reference. XML FillUnoNumRule iterates declarations in source order with one exception boundary; Writer SetNumberingRuleByIndex clones before SetPropertiesToNumFormat and commits only after success. Native common and automatic factories use modern base rules under the existing ODF >=1.2 setting. Local eager ten-level construction and first-declared fallback do not implement that state machine. No source-family or full formatter parity promotion is planned.

    Command: npx vitest run --config apps/office/vitest.config.ts ... . Result: fail before test execution; nonexistent config path. Evidence: focused-startup.log. Resolution: use the discovered apps/office/vite.config.ts with the office workspace cwd. Scope and mandatory acceptance checks unchanged; bounded command correction under the approved goal.

    Command: npx vitest run the eight focused core/XML/ODT files from apps/office. Result: 51 passed, one obsolete assertion failed. Evidence: focused.log; omitted level 2 in a one-level bullet declaration now correctly remains numbered instead of first-level bullet fallback. Resolution: update that assertion to the manually source-derived Arabic base and add explicit end-to-end coverage; no acceptance relaxation or scope drift.
id_source: "generated"
---
## Summary

Restore pinned LibreOffice FillUnoNumRule sequential replacement semantics for the existing Arabic/bullet list import subset.

## Scope

Runtime: sw/source/core/doc/number.ts, sw/source/core/unocore/unosett.ts, sw/source/filter/xml/xmlimp.ts, xmloff/source/style/xmlstyle.ts, xmloff/source/text/txtparai.ts. Matching core/context/ODT tests and parity metadata only; task-local primary-source evidence and parent progress. No network, outside-repository access, policy/gate changes, or registered open/save/recovery deviation changes.

## Plan

1. Establish native default rule and copy/validate/commit boundaries from pinned number.cxx, unosett.cxx, xmlnumi.cxx and docstyle.cxx. 2. Introduce a base Arabic rule and owned per-level Set; retain XML declarations in source order, including duplicate and empty declarations. 3. Apply each level through Writer property validation; catch only the native invalid-property failure around the complete loop, preserving previous commits and base omitted levels. 4. Verify source-derived defaults, repeat/abort order, ODT export/reopen, copy and snapshots; run npm run verify. 5. Record evidence, scoped commit, evaluator, finish and parent progress. Existing alias conflicts and unsupported numbering families remain separate audits.

## Verify Steps

Run focused number/unosett/xmlstyle/txtparai/ODT tests including source-derived modern base defaults, omitted/empty rules, declaration order, duplicate replacement, failure before/after success, failure regardless selected position mode, and invalid-property no partial level commit. Produce bounded differential C++ evidence by extracting actual pinned replacement loop and rejection branches where feasible. Run npm run verify with all required coverage and browser checks unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record final clean git status and actual implementation hash.

## Verification

Pending implementation and complete mandatory checks.

## Rollback Plan

Revert the scoped implementation commit after reviewing dependent numbering work; keep task evidence and registered browser deviations.

## Findings

Authorization: the user's persistent /goal approves iterative safe local parity corrections, one executable child at a time. Preflight: main clean, direct workflow, parent 202609240501-C9TN6M active. Sources: pinned libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65, repository cached vendor/libreoffice-reference. XML FillUnoNumRule iterates declarations in source order with one exception boundary; Writer SetNumberingRuleByIndex clones before SetPropertiesToNumFormat and commits only after success. Native common and automatic factories use modern base rules under the existing ODF >=1.2 setting. Local eager ten-level construction and first-declared fallback do not implement that state machine. No source-family or full formatter parity promotion is planned.

Command: npx vitest run --config apps/office/vitest.config.ts ... . Result: fail before test execution; nonexistent config path. Evidence: focused-startup.log. Resolution: use the discovered apps/office/vite.config.ts with the office workspace cwd. Scope and mandatory acceptance checks unchanged; bounded command correction under the approved goal.

Command: npx vitest run the eight focused core/XML/ODT files from apps/office. Result: 51 passed, one obsolete assertion failed. Evidence: focused.log; omitted level 2 in a one-level bullet declaration now correctly remains numbered instead of first-level bullet fallback. Resolution: update that assertion to the manually source-derived Arabic base and add explicit end-to-end coverage; no acceptance relaxation or scope drift.
