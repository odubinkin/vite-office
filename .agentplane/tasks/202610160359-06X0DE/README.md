---
id: "202610160359-06X0DE"
title: "Resolve pinned language parser contract and native JS substitution limits"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "source-audit"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T04:00:33.995Z"
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
    body: "Start: inspect verified LibreOffice-pinned liblangtag and registry source to resolve remaining LanguageTag parser behavior/native JS limits;produce source-anchored report/tests without native execution or a fake parser."
events:
  -
    type: "status"
    at: "2026-10-16T04:00:39.041Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect verified LibreOffice-pinned liblangtag and registry source to resolve remaining LanguageTag parser behavior/native JS limits;produce source-anchored report/tests without native execution or a fake parser."
doc_version: 3
doc_updated_at: "2026-10-16T04:00:39.041Z"
doc_updated_by: "CODER"
description: "Task193: inspect LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source contracts for remaining LanguageTag parser branch,using approved upstream source reading;produce exact algorithm/data boundary and measured native-JS comparisons without native compilation or a fake parser/class."
sections:
  Summary: "Resolve the remaining LanguageTag general parser contract using LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source/data before implementing the actual enclosing owner. Standing user approval grants upstream source reading;read only pinned archives referenced by local LibreOffice download.lst from its source mirror,inside this repository. Local search found build metadata/patches but no parser source or registry archive."
  Scope: "Only vite-office-calc branch calc. Read exact pinned upstream dependency archives into ignored output,verify SHA256 before safe extraction,inspect actual parser/canonicalization/data branch contracts and compare candidate native JS behavior. Deliver a Calc-specific source-anchored contract report and reproducible test fixtures/browser observations. No native compilation/execution,generator,package install,ICU/liblangtag runtime implementation,physical ownership engine,production fake parser/LanguageTag or policy/guard changes. Maximum10non-task files. Evidence distinguishes source-derived outcomes from executed JS;do not claim executed LibreOffice/library behavior or full parity."
  Plan: "Read only exact LibreOffice-pinned liblangtag/IANA archives with verified hashes;resolve remaining general parser/canonicalization/data contract and measured native JS limits. Produce source-anchored fixtures/report and real browser evidence,not a fake parser/class or unnecessary library port;verify Calc strict coverage and source gates."
  Verify Steps: |-
    - node output/playwright/task193-checks/native-audit.mjs:local LibreOffice pin/download hashes,actual archive SHA256/safe source inventory/exact contract and fixture anchors;no production/policy/guard changes.
    - node output/playwright/task193-checks/portable.mjs:related native-JS audit and wholeCalc with four source refs absent/restored;exact36Calc owners raw S/B/F/L100,every counter positive. No changed shared runtime owner so no new shared runtime coverage scope.
    - node output/playwright/task193-checks/browser-portable.mjs:production build and actual Chromium/DOM-free Worker native-JS audit,source refs absent/restored;no native binary or fake production parser.
    - node output/playwright/task193-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor with no exemptions.
    - node output/playwright/task193-checks/final-audit.mjs:exact source/fixture/observations/path evidence,reference restoration and truthful implementation next boundary;source commit,recorded verify and same-agent EVALUATOR review then descriptive finish.
  Verification: "Pending. Prior goal turn made progress with completed task192. This audit must change the next implementation decision through actual source evidence. Full class/font/defaults/pool/model/UI/ODS remain pending;all-app run still waits for real minimum UI/ODS readiness then fix applicable failures and pause."
  Rollback Plan: "Revert only this task's test/doc source commit;ignored source archives can be retained as pinned evidence. Do not reset user work or touch unrelated tasks. No destructive cleanup required."
  Findings: "None. Generic Intl substitution was already disproved on29source QA cases in task189;this task distinguishes native known-tag handling from the actual external-parser branch so that broad library/memory infrastructure is not ported without evidence."
id_source: "generated"
---
## Summary

Resolve the remaining LanguageTag general parser contract using LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source/data before implementing the actual enclosing owner. Standing user approval grants upstream source reading;read only pinned archives referenced by local LibreOffice download.lst from its source mirror,inside this repository. Local search found build metadata/patches but no parser source or registry archive.

## Scope

Only vite-office-calc branch calc. Read exact pinned upstream dependency archives into ignored output,verify SHA256 before safe extraction,inspect actual parser/canonicalization/data branch contracts and compare candidate native JS behavior. Deliver a Calc-specific source-anchored contract report and reproducible test fixtures/browser observations. No native compilation/execution,generator,package install,ICU/liblangtag runtime implementation,physical ownership engine,production fake parser/LanguageTag or policy/guard changes. Maximum10non-task files. Evidence distinguishes source-derived outcomes from executed JS;do not claim executed LibreOffice/library behavior or full parity.

## Plan

Read only exact LibreOffice-pinned liblangtag/IANA archives with verified hashes;resolve remaining general parser/canonicalization/data contract and measured native JS limits. Produce source-anchored fixtures/report and real browser evidence,not a fake parser/class or unnecessary library port;verify Calc strict coverage and source gates.

## Verify Steps

- node output/playwright/task193-checks/native-audit.mjs:local LibreOffice pin/download hashes,actual archive SHA256/safe source inventory/exact contract and fixture anchors;no production/policy/guard changes.
- node output/playwright/task193-checks/portable.mjs:related native-JS audit and wholeCalc with four source refs absent/restored;exact36Calc owners raw S/B/F/L100,every counter positive. No changed shared runtime owner so no new shared runtime coverage scope.
- node output/playwright/task193-checks/browser-portable.mjs:production build and actual Chromium/DOM-free Worker native-JS audit,source refs absent/restored;no native binary or fake production parser.
- node output/playwright/task193-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor with no exemptions.
- node output/playwright/task193-checks/final-audit.mjs:exact source/fixture/observations/path evidence,reference restoration and truthful implementation next boundary;source commit,recorded verify and same-agent EVALUATOR review then descriptive finish.

## Verification

Pending. Prior goal turn made progress with completed task192. This audit must change the next implementation decision through actual source evidence. Full class/font/defaults/pool/model/UI/ODS remain pending;all-app run still waits for real minimum UI/ODS readiness then fix applicable failures and pause.

## Rollback Plan

Revert only this task's test/doc source commit;ignored source archives can be retained as pinned evidence. Do not reset user work or touch unrelated tasks. No destructive cleanup required.

## Findings

None. Generic Intl substitution was already disproved on29source QA cases in task189;this task distinguishes native known-tag handling from the actual external-parser branch so that broad library/memory infrastructure is not ported without evidence.
