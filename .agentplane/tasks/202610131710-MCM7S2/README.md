---
id: "202610131710-MCM7S2"
title: "Implement shared formula grammar operations for Calc and ODS"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T17:10:40.158Z"
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
    body: "Start: original shared formula grammar/static masks and FormulaLanguage owner for actual Calc default/storage grammars, portable JS bitops and no compiler/document substitute."
events:
  -
    type: "status"
    at: "2026-10-13T17:10:48.231Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: original shared formula grammar/static masks and FormulaLanguage owner for actual Calc default/storage grammars, portable JS bitops and no compiler/document substitute."
doc_version: 3
doc_updated_at: "2026-10-13T17:10:48.231Z"
doc_updated_by: "CODER"
description: "Task93 completes original shared FormulaGrammar static value/mapping/mask/convention operations and actual FormulaLanguage IDL constants needed by real Calc formula cells/UI and ODF import/export; no substitute parser or model."
sections:
  Summary: "Task93 original shared formula grammar for actual Calc UI/document and ODS dependencies."
  Scope: "Complete original FormulaGrammar static constants/Grammar values, API mapping, support classification, signed32bit language/convention extraction, English-bit updates, grammar merge, ODF1.1/OpenFormula/OOXML/Excel predicates and actual shared offapi FormulaLanguage IDL constants. Preserve original header/core ownership and existing address enum API with static namespace object, original release NDEBUG behavior using native JS bitops without flags/library/parser/memory engine. Existing Writer owners reused, not modified except actual shared grammar owner extension. New core grammar.ts, FormulaLanguage.ts, native helper/state fixture, extend existing shared grammar tests, actual runtime/provenance/capability records and Calc checkpoint/suspected cases. Compile full unchanged original grammar header and grammar.cxx in normal release mode using genuine generated FormulaLanguage/header configurations, no fake peers, network or sanitizer. Actual compiler/document/UI/ODS remain pending. Stop goal after full101 and bounded Calc/shared repairs as requested; Writer-only coverage untouched."
  Plan: "Actual shared FormulaGrammar and FormulaLanguage static values/mapping for Calc UI and ODS, whole original normal release value observations, scoped raw100,16gates/exact review; no parser/document substitute. Goal pauses after full101 and relevant repairs."
  Verify Steps: |-
    1. node scripts/formula-grammar-native-probe.mjs --write then --check compiles full unchanged pinned include/formula/grammar.hxx and formula/source/core/api/grammar.cxx with genuine generated FormulaLanguage and verified configurations; normal release only. Whole constant/API/query/setEnglishBit/merge streams for all original named grammars and initialized packed valid enum values/address conventions match portable tests; no memory/native invalid enum/assertion-process claim.
    2. Source-absence whole npm run test:coverage:calc and complete affected shared grammar/FormulaLanguage owner coverage with all existing grammar tests; raw unmodified S/B/F/L100 every counter positive, four exact source links restored. Static build and actual Calc profile0UI. No Writer-only repairs/full run before scheduled101.
    3. Existing whole16format/lint/type/docs/size/dependency/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff gates, original caps/owners preserved and explicit classB assertion boundary. Record failures before correction; no private-state/exclusion/threshold tricks.
    4. Exact current/committed non-task hashes, separate same-agent EVALUATOR (not independent reviewer), canonical DONE and clean git status --short --untracked-files=all on calc. Goal active until scheduled full101/repairs, then explicit user pause. No compiler/document/UI/ODS or whole original QA completion claim.
  Verification: "Pending implementation and required checks."
  Rollback Plan: "Revert only intentional task93 files through followup task; restore all reference links, no merge/history rewrite or unrelated tasks."
  Findings: "Previous92 implemented actual ScCalcConfig values and original address enum;93extends same shared FormulaGrammar owner. Original ScFormulaCell constructors require GRAM_DEFAULT and ODS uses storage/default grammar; no alternate parser. JS bitwise operations preserve signed32 integer semantics for initialized original enum range; native debug merge assertion is not browser process behavior. All ordinary observations are values only. User requests pause after next full101; no pause now."
id_source: "generated"
---
## Summary

Task93 original shared formula grammar for actual Calc UI/document and ODS dependencies.

## Scope

Complete original FormulaGrammar static constants/Grammar values, API mapping, support classification, signed32bit language/convention extraction, English-bit updates, grammar merge, ODF1.1/OpenFormula/OOXML/Excel predicates and actual shared offapi FormulaLanguage IDL constants. Preserve original header/core ownership and existing address enum API with static namespace object, original release NDEBUG behavior using native JS bitops without flags/library/parser/memory engine. Existing Writer owners reused, not modified except actual shared grammar owner extension. New core grammar.ts, FormulaLanguage.ts, native helper/state fixture, extend existing shared grammar tests, actual runtime/provenance/capability records and Calc checkpoint/suspected cases. Compile full unchanged original grammar header and grammar.cxx in normal release mode using genuine generated FormulaLanguage/header configurations, no fake peers, network or sanitizer. Actual compiler/document/UI/ODS remain pending. Stop goal after full101 and bounded Calc/shared repairs as requested; Writer-only coverage untouched.

## Plan

Actual shared FormulaGrammar and FormulaLanguage static values/mapping for Calc UI and ODS, whole original normal release value observations, scoped raw100,16gates/exact review; no parser/document substitute. Goal pauses after full101 and relevant repairs.

## Verify Steps

1. node scripts/formula-grammar-native-probe.mjs --write then --check compiles full unchanged pinned include/formula/grammar.hxx and formula/source/core/api/grammar.cxx with genuine generated FormulaLanguage and verified configurations; normal release only. Whole constant/API/query/setEnglishBit/merge streams for all original named grammars and initialized packed valid enum values/address conventions match portable tests; no memory/native invalid enum/assertion-process claim.
2. Source-absence whole npm run test:coverage:calc and complete affected shared grammar/FormulaLanguage owner coverage with all existing grammar tests; raw unmodified S/B/F/L100 every counter positive, four exact source links restored. Static build and actual Calc profile0UI. No Writer-only repairs/full run before scheduled101.
3. Existing whole16format/lint/type/docs/size/dependency/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff gates, original caps/owners preserved and explicit classB assertion boundary. Record failures before correction; no private-state/exclusion/threshold tricks.
4. Exact current/committed non-task hashes, separate same-agent EVALUATOR (not independent reviewer), canonical DONE and clean git status --short --untracked-files=all on calc. Goal active until scheduled full101/repairs, then explicit user pause. No compiler/document/UI/ODS or whole original QA completion claim.

## Verification

Pending implementation and required checks.

## Rollback Plan

Revert only intentional task93 files through followup task; restore all reference links, no merge/history rewrite or unrelated tasks.

## Findings

Previous92 implemented actual ScCalcConfig values and original address enum;93extends same shared FormulaGrammar owner. Original ScFormulaCell constructors require GRAM_DEFAULT and ODS uses storage/default grammar; no alternate parser. JS bitwise operations preserve signed32 integer semantics for initialized original enum range; native debug merge assertion is not browser process behavior. All ordinary observations are values only. User requests pause after next full101; no pause now.
