---
id: "202610121251-865XS3"
title: "Implement original Calc FormulaResultValue owner and shared string lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "shared"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-12T12:52:32.433Z"
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
    body: "Start: implement the actual complete FormulaResultValue owner, explicit native overload/value-category bindings and existing SharedString/FormulaError lifecycle under ongoing approved Calc goal; raw100/source-absent scoped checks, next full81."
events:
  -
    type: "status"
    at: "2026-10-12T12:52:33.821Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the actual complete FormulaResultValue owner, explicit native overload/value-category bindings and existing SharedString/FormulaError lifecycle under ongoing approved Calc goal; raw100/source-absent scoped checks, next full81."
doc_version: 3
doc_updated_at: "2026-10-12T12:52:33.821Z"
doc_updated_by: "CODER"
description: "Task73: port actual sc::FormulaResultValue named struct and all four explicit constructors plus implicit copy/move/assignment/destruction, reusing real shared FormulaError/SharedString owners. Preserve Invalid/Value/String/Error distinctions, defaults, numeric NaN payloads, by-value string copy/move and lifetime semantics; no guessed enum-vs-double overload, synthetic token/cell/document or duplicate string model. Compile selected exact original struct and constructor bodies with whole genuine SharedString/SAL dependencies normal-only; no full ScFormulaResult claim. Full Calc plus directly related shared raw100/upstream-absent build, inventory/provenance/aggregate gates and exact source-bound quality phase; next full81."
sections:
  Summary: |-
    Implement original Calc FormulaResultValue owner and shared string lifecycle

    Task73: port actual sc::FormulaResultValue named struct and all four explicit constructors plus implicit copy/move/assignment/destruction, reusing real shared FormulaError/SharedString owners. Preserve Invalid/Value/String/Error distinctions, defaults, numeric NaN payloads, by-value string copy/move and lifetime semantics; no guessed enum-vs-double overload, synthetic token/cell/document or duplicate string model. Compile selected exact original struct and constructor bodies with whole genuine SharedString/SAL dependencies normal-only; no full ScFormulaResult claim. Full Calc plus directly related shared raw100/upstream-absent build, inventory/provenance/aggregate gates and exact source-bound quality phase; next full81.
  Scope: "Original sc::FormulaResultValue declaration and four explicit constructors at sc/inc/formularesult.hxx and sc/source/core/tool/formularesult.cxx, including implicit copy/move construction, assignment/destruction and nested Type. Runtime owner apps/office/src/sc/source/core/tool/formularesult.ts and sc/inc/formularesult.ts facade; tests and portable native fixture colocated with owner; scripts/calc-formularesult-value-native-probe.mjs. Reuse actual shared FormulaError and SharedString owners; explicit erased native enum type/value-category witnesses, never guessing error-vs-double from numeric value. Add exact Calc capability/runtime/provenance records for owner/facade, necessary sc-to-formula dependency allowlist/test and docs/program/calc-core.md evidence. Task and ignored local evidence only. Whole pinned files and exact selected real struct/constructor scopes; reuse existing unchanged full genuine SharedString/SAL dependency build normal-only, not full formularesult.cxx/module compilation or fake token/matrix/document dependencies. No Writer fix, threshold/profile/timeout changes, sanitizer or full suite; work only calc in vite-office-calc."
  Plan: |-
    1. Port the actual complete FormulaResultValue struct, exact defaults/tags, all explicit and implicit special members over existing shared owners; bind the erased enum/double and lvalue/rvalue contracts explicitly.
    2. Capture whole original declaration and constructor scopes with actual full SharedString/SAL dependencies and compare complete default/value/error/string/copy/move/assignment/lifetime native streams, including numeric NaN vs Error tag and self-copy/valid empty self-move.
    3. Register exact source responsibility/capabilities/facade and necessary original sc-to-formula edge without inventing ScFormulaResult/token/cell owners.
    4. Run full Calc and entire directly related shared owner tests/raw100 with all3source links absent/restored, build/static Calc browser checks and aggregate local gates, source-bound same-agent EVALUATOR/verification and clean task closure. Next full81.
  Verify Steps: |-
    1. node scripts/calc-formularesult-value-native-probe.mjs --write then --check: complete whole native initialized constructor/copy/move/assignment/string refcount and error/value streams match. Original full sc header/source hashes and exact complete named struct/four ctor scopes, real full SharedString/SAL dependencies/flags and4normal reused witnesses verified. No native substitutes for absent token/matrix/document owners, no sanitizer/full native dependency rebuild.
    2. node output/playwright/task73-checks/portable.mjs: full npm run test:coverage:calc and whole directly related shared owner tests with all raw statement/function/branch counters positive and unchanged S/B/F/L100 criteria, all3upstream links absent/restored exactly. Actual complete original scoped streams and numeric/error0 distinctions pass; build/static and Calc browser profile pass (report actual Calc scenario count, no fake UI). Strict actual field/member/source binding; no extra duplicate store/value model.
    3. node output/playwright/task73-checks/gates.mjs: format/lint/typecheck/docs/file-size/dependencies/Writer resources/source tree/provenance/global registry/routing/doctor/diff and complete related tooling suites pass. Updated sc-to-formula original dependency is one permitted edge, reverse application/browser edges remain forbidden; no cycle/threshold/timeout/Writer coverage changes.
    4. Source responsibility/markers/nested Type and each actual constructor/special member map to original ownership. Source-absent current raw maps/selected owner set/complete source hashes bind the implementation commit. Facade has no executable mechanism. Same-agent separate EVALUATOR pass, recorded ap verify and clean calc DONE closure; incomplete full ScFormulaResult/token/cell/document/input/UI and native ABI/arbitrary invalid lifetime limits remain explicit. Full run not due until81.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task73 changes; preserve source-exact native caller/full failure evidence outside Agentplane. Always restore original3symlink targets on runtime verification termination. Recheck directly affected Calc/shared after rollback. Preserve unrelated active tasks and user-owned merges."
  Findings: "Preflight confirms clean calc with task72 DONE e3b27cee; previous goal turn is concrete progress (new shared formula error contracts). Existing SharedString and FormulaError are authoritative owners; no FormulaResultValue yet. Original numeric and enum-error constructors both erase to JS number, so explicit actual enum type witness is required; do not infer error from value or NaN. Native comparison is bounded to actual complete named struct/four ctor scopes because full ScFormulaResult still depends on real absent token/matrix graph. User continues the approved Calc goal and requires shared reuse/native JS where equivalent. No new network/outside-repo access. Last full71, next full81."
id_source: "generated"
---
## Summary

Implement original Calc FormulaResultValue owner and shared string lifecycle

Task73: port actual sc::FormulaResultValue named struct and all four explicit constructors plus implicit copy/move/assignment/destruction, reusing real shared FormulaError/SharedString owners. Preserve Invalid/Value/String/Error distinctions, defaults, numeric NaN payloads, by-value string copy/move and lifetime semantics; no guessed enum-vs-double overload, synthetic token/cell/document or duplicate string model. Compile selected exact original struct and constructor bodies with whole genuine SharedString/SAL dependencies normal-only; no full ScFormulaResult claim. Full Calc plus directly related shared raw100/upstream-absent build, inventory/provenance/aggregate gates and exact source-bound quality phase; next full81.

## Scope

Original sc::FormulaResultValue declaration and four explicit constructors at sc/inc/formularesult.hxx and sc/source/core/tool/formularesult.cxx, including implicit copy/move construction, assignment/destruction and nested Type. Runtime owner apps/office/src/sc/source/core/tool/formularesult.ts and sc/inc/formularesult.ts facade; tests and portable native fixture colocated with owner; scripts/calc-formularesult-value-native-probe.mjs. Reuse actual shared FormulaError and SharedString owners; explicit erased native enum type/value-category witnesses, never guessing error-vs-double from numeric value. Add exact Calc capability/runtime/provenance records for owner/facade, necessary sc-to-formula dependency allowlist/test and docs/program/calc-core.md evidence. Task and ignored local evidence only. Whole pinned files and exact selected real struct/constructor scopes; reuse existing unchanged full genuine SharedString/SAL dependency build normal-only, not full formularesult.cxx/module compilation or fake token/matrix/document dependencies. No Writer fix, threshold/profile/timeout changes, sanitizer or full suite; work only calc in vite-office-calc.

## Plan

1. Port the actual complete FormulaResultValue struct, exact defaults/tags, all explicit and implicit special members over existing shared owners; bind the erased enum/double and lvalue/rvalue contracts explicitly.
2. Capture whole original declaration and constructor scopes with actual full SharedString/SAL dependencies and compare complete default/value/error/string/copy/move/assignment/lifetime native streams, including numeric NaN vs Error tag and self-copy/valid empty self-move.
3. Register exact source responsibility/capabilities/facade and necessary original sc-to-formula edge without inventing ScFormulaResult/token/cell owners.
4. Run full Calc and entire directly related shared owner tests/raw100 with all3source links absent/restored, build/static Calc browser checks and aggregate local gates, source-bound same-agent EVALUATOR/verification and clean task closure. Next full81.

## Verify Steps

1. node scripts/calc-formularesult-value-native-probe.mjs --write then --check: complete whole native initialized constructor/copy/move/assignment/string refcount and error/value streams match. Original full sc header/source hashes and exact complete named struct/four ctor scopes, real full SharedString/SAL dependencies/flags and4normal reused witnesses verified. No native substitutes for absent token/matrix/document owners, no sanitizer/full native dependency rebuild.
2. node output/playwright/task73-checks/portable.mjs: full npm run test:coverage:calc and whole directly related shared owner tests with all raw statement/function/branch counters positive and unchanged S/B/F/L100 criteria, all3upstream links absent/restored exactly. Actual complete original scoped streams and numeric/error0 distinctions pass; build/static and Calc browser profile pass (report actual Calc scenario count, no fake UI). Strict actual field/member/source binding; no extra duplicate store/value model.
3. node output/playwright/task73-checks/gates.mjs: format/lint/typecheck/docs/file-size/dependencies/Writer resources/source tree/provenance/global registry/routing/doctor/diff and complete related tooling suites pass. Updated sc-to-formula original dependency is one permitted edge, reverse application/browser edges remain forbidden; no cycle/threshold/timeout/Writer coverage changes.
4. Source responsibility/markers/nested Type and each actual constructor/special member map to original ownership. Source-absent current raw maps/selected owner set/complete source hashes bind the implementation commit. Facade has no executable mechanism. Same-agent separate EVALUATOR pass, recorded ap verify and clean calc DONE closure; incomplete full ScFormulaResult/token/cell/document/input/UI and native ABI/arbitrary invalid lifetime limits remain explicit. Full run not due until81.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task73 changes; preserve source-exact native caller/full failure evidence outside Agentplane. Always restore original3symlink targets on runtime verification termination. Recheck directly affected Calc/shared after rollback. Preserve unrelated active tasks and user-owned merges.

## Findings

Preflight confirms clean calc with task72 DONE e3b27cee; previous goal turn is concrete progress (new shared formula error contracts). Existing SharedString and FormulaError are authoritative owners; no FormulaResultValue yet. Original numeric and enum-error constructors both erase to JS number, so explicit actual enum type witness is required; do not infer error from value or NaN. Native comparison is bounded to actual complete named struct/four ctor scopes because full ScFormulaResult still depends on real absent token/matrix graph. User continues the approved Calc goal and requires shared reuse/native JS where equivalent. No new network/outside-repo access. Last full71, next full81.
