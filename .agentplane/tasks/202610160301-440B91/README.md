---
id: "202610160301-440B91"
title: "Audit native Intl language tag behavior for Calc font prerequisites"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "intl-audit"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T03:02:16.385Z"
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
    body: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
events:
  -
    type: "status"
    at: "2026-10-16T03:02:27.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
doc_version: 3
doc_updated_at: "2026-10-16T03:11:32.467Z"
doc_updated_by: "CODER"
description: "Task189: compare Intl.Locale/getCanonicalLocales against pinned LibreOffice LanguageTag QA and native fast-path contracts in Node, Chromium and a DOM-free Worker; record exact mismatches and next implementation boundary without ICU/liblangtag or a fake LanguageTag."
sections:
  Summary: "Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports."
  Scope: "Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary."
  Plan: "Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active."
  Verify Steps: |-
    - node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
    - node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
    - node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
    - node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
    - node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.
  Verification: "Command: node output/playwright/task189-checks/native-audit.mjs. Result: pass. Evidence:29 exact source constructor/assertion/value/block/line checks,5 pinned native source hashes,no native binary run,production unchanged from764fab782c89. Scope:static native QA/Font/core prerequisite contracts. Command: node output/playwright/task189-checks/portable.mjs. Result:pass. Evidence:16audit scenarios and196Calc/78files,exact36Calc owners raw S4310/B2777/F864/L3857 all100 with every counter positive;four source links absent and restored. No changed shared runtime owner,so no new shared coverage owner. Command: node output/playwright/task189-checks/browser-portable.mjs then --browser-only after JSON import fix. Result:pass. Evidence:production build successful;Chromium151 and actual DOM-free Worker match Node24 on29cases;direct API15matches/8rejections/6different successful strings,minimize10matches;source-preserved invalid string is distinct from validity acceptance. Four references restored. Command: node output/playwright/task189-checks/source-gates.mjs with documented repair/resume. Result:13gates pass. Scope:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries. Final exact-path evidence and same-agent quality review follow. Production kernel and inventories unchanged;no new capability claim,ICU/liblangtag port,memory engine,Writer change or all-app run. UI/ODS remain pending;goal stays active."
  Rollback Plan: "Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks."
  Findings: |-
    Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task.

    - Observation: Fixture extraction found 28 direct getter assertions; first de-Latn-DE case asserts a previously stored aBcp47 value. Expected count29 check correctly stopped before writing fixture. Test scaffolding was inadvertently written after the failed independent extraction in the same tool orchestration.
      Impact: No production changes; fixture must include the stored-value source case explicitly and dependent tool mutations must wait for observed success.
      Resolution: Refresh route, add the exact stored getBcp47 assignment and assertion as native evidence, then validate all29 source blocks before running tests.

    - Observation: Prettier was invoked with repo-relative paths from apps/office and found no files; subsequent independent unit run passed16 scenarios.
      Impact: No formatting was applied by that invocation; no production owner changed.
      Resolution: Run formatting from explicit repository root and retain16 passing Node audit scenarios.

    - Observation: Production build passed; Playwright loader rejected bare JSON fixture import because Node24 ESM requires a JSON import attribute, so no browser scenarios executed.
      Impact: No browser parity evidence yet; all four source-reference links restored by finally. Unit and Calc coverage already passed.
      Resolution: Use standard JSON import attribute in the audit spec and rerun only failed browser stage against the already successful unchanged build.

    - Observation: Scoped lint rejected the test-only IntlTagResult exported type because it lacked JSDoc.
      Impact: Runtime audits pass; source gate remains incomplete.
      Resolution: Add the required type documentation and resume source gates without rerunning unchanged runtime behavior.

    - Observation: JSDoc gate requires documentation on test describe/map/find callbacks as well as exported helpers;16 short audit callbacks were missing it.
      Impact: Only documentation gate incomplete; no behavior or parity result changes.
      Resolution: Document each test callback at its declaration and resume source gates; keep existing runtime results because edits are comments only.
id_source: "generated"
---
## Summary

Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports.

## Scope

Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary.

## Plan

Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active.

## Verify Steps

- node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
- node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
- node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
- node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
- node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.

## Verification

Command: node output/playwright/task189-checks/native-audit.mjs. Result: pass. Evidence:29 exact source constructor/assertion/value/block/line checks,5 pinned native source hashes,no native binary run,production unchanged from764fab782c89. Scope:static native QA/Font/core prerequisite contracts. Command: node output/playwright/task189-checks/portable.mjs. Result:pass. Evidence:16audit scenarios and196Calc/78files,exact36Calc owners raw S4310/B2777/F864/L3857 all100 with every counter positive;four source links absent and restored. No changed shared runtime owner,so no new shared coverage owner. Command: node output/playwright/task189-checks/browser-portable.mjs then --browser-only after JSON import fix. Result:pass. Evidence:production build successful;Chromium151 and actual DOM-free Worker match Node24 on29cases;direct API15matches/8rejections/6different successful strings,minimize10matches;source-preserved invalid string is distinct from validity acceptance. Four references restored. Command: node output/playwright/task189-checks/source-gates.mjs with documented repair/resume. Result:13gates pass. Scope:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries. Final exact-path evidence and same-agent quality review follow. Production kernel and inventories unchanged;no new capability claim,ICU/liblangtag port,memory engine,Writer change or all-app run. UI/ODS remain pending;goal stays active.

## Rollback Plan

Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks.

## Findings

Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task.

- Observation: Fixture extraction found 28 direct getter assertions; first de-Latn-DE case asserts a previously stored aBcp47 value. Expected count29 check correctly stopped before writing fixture. Test scaffolding was inadvertently written after the failed independent extraction in the same tool orchestration.
  Impact: No production changes; fixture must include the stored-value source case explicitly and dependent tool mutations must wait for observed success.
  Resolution: Refresh route, add the exact stored getBcp47 assignment and assertion as native evidence, then validate all29 source blocks before running tests.

- Observation: Prettier was invoked with repo-relative paths from apps/office and found no files; subsequent independent unit run passed16 scenarios.
  Impact: No formatting was applied by that invocation; no production owner changed.
  Resolution: Run formatting from explicit repository root and retain16 passing Node audit scenarios.

- Observation: Production build passed; Playwright loader rejected bare JSON fixture import because Node24 ESM requires a JSON import attribute, so no browser scenarios executed.
  Impact: No browser parity evidence yet; all four source-reference links restored by finally. Unit and Calc coverage already passed.
  Resolution: Use standard JSON import attribute in the audit spec and rerun only failed browser stage against the already successful unchanged build.

- Observation: Scoped lint rejected the test-only IntlTagResult exported type because it lacked JSDoc.
  Impact: Runtime audits pass; source gate remains incomplete.
  Resolution: Add the required type documentation and resume source gates without rerunning unchanged runtime behavior.

- Observation: JSDoc gate requires documentation on test describe/map/find callbacks as well as exported helpers;16 short audit callbacks were missing it.
  Impact: Only documentation gate incomplete; no behavior or parity result changes.
  Resolution: Document each test callback at its declaration and resume source gates; keep existing runtime results because edits are comments only.
