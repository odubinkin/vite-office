---
id: "202610121520-M940YV"
title: "Implement original Calc empty and hybrid result tokens"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
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
  updated_at: "2026-10-12T15:34:20.577Z"
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
    body: "Start: approved ongoing Calc core/UI prerequisite objective; implement original empty and hybrid result tokens with genuine shared owners, task76 verification and partial inventory, no matrix substitutes or Writer repair."
events:
  -
    type: "status"
    at: "2026-10-12T15:21:15.816Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved ongoing Calc core/UI prerequisite objective; implement original empty and hybrid result tokens with genuine shared owners, task76 verification and partial inventory, no matrix substitutes or Writer repair."
doc_version: 3
doc_updated_at: "2026-10-12T15:36:06.199Z"
doc_updated_by: "CODER"
description: "Task76: port genuine ScEmptyCellToken and ScHybridCellToken required by ScFormulaResult, preserving original source/module boundaries and reusing existing FormulaToken, SharedString and OUString ownership. Normal-only local upstream comparison, complete Calc and related shared raw100, registry/provenance and precise partial scope. No fake matrix/document/compiler owners; next full81."
sections:
  Summary: "Task76 implements original Calc empty and hybrid formula result tokens, prerequisites of ScFormulaResult and original cell storage."
  Scope: "Only vite-office-calc branch calc. New sc/inc/token.ts facade, sc/source/core/tool/token.ts original two classes, token tests/native fixture/probe, capability/runtime/provenance entries and docs/program/calc-core.md plus confirmed suspected issue journal. scripts/check-module-boundaries.mjs and its whole existing test suite register genuine acyclic sc -> sal dependency: original global.hxx/token.hxx include rtl/ustring.hxx and ScHybridCellToken owns OUString. Up to16intentional non-task paths (actual14). Task artefacts and ignored task76evidence. No synthetic matrix/tokenarray/compiler/document/text owners, cycle relaxation or Writer repair."
  Plan: "Original task76 deliverable and verification remain unchanged. Register source-backed sc -> sal OUString dependency in existing boundary checker and test; supply actual unexecuted Calc QA empty-string context required by inventory schema, retaining false broad parity flags. Scope14non-task paths within16budget. Repeat only affected failed/changed gates; preserve full Calc/shared raw100 and other passed evidence."
  Verify Steps: "1. node scripts/sc-result-token-native-probe.mjs --write then --check: ordinary-only original complete selected two class declarations/member definitions over genuine formula/SAL/SVL dependencies; whole native stream comparisons with scope/source hashes. No fabricated class/header/pointees. 2. node output/playwright/task76-checks/portable.mjs: complete Calc and all directly related shared owners/tests raw statements/branches/functions/lines100, each raw counter positive; four original reference links absent/restored. Static build and actual Calc browser profile pass with0scenarios accurately recorded. 3. node output/playwright/task76-checks/gates.mjs: format/lint/type/docs/size/deps/resources/tree/provenance/registry/routing/doctor/diff and complete relevant tooling tests. 4. Exact current-source hashes bind evidence to implementation SHA, accurate partial foundation inventory, separate same-agent EVALUATOR with explicit limits, ap verify and clean authoritativeDONE. No full suite before81 or Writer-only repairs, no sanitizer run."
  Verification: "Command: node scripts/sc-result-token-native-probe.mjs --write then --check. Result: pass. Evidence: output/playwright/sc-result-token-native/manifest.json captured with10positive ordinary commands,465original source hashes and17archive-verified Boost headers; whole empty168byte/hybrid4138byte/equality243byte streams match. Scope: complete selected original two class declarations/named definitions over real shared dependencies, NDEBUG only; not full Calc token header/matrix/implicit class move/ABI/debug/QA. Command: node output/playwright/task76-checks/portable.mjs. Result: pass. Evidence:119Calc tests32files,82shared tests22files; raw Calc3054S2085B514F2697L and shared1692S1344B303F1503L all100with every raw counter positive. Scope: entire Calc plus whole directly affected shared owners/tests, four source links absent/restored, static build and actual Calc browser profile0UI scenarios. Command: node output/playwright/task76-checks/gates.mjs then --recheck. Result: pass after source-backed boundary/inventory repair. Evidence: all14gates terminal0; whole23tooling tests. Global format/lint passed; changed boundary files separately formatted/linted afterward. No application runtime changed after coverage. First native/gate failures retained. Exact source-bound EVALUATOR and final closure pending; no independent review or full UI claim, next full81."
  Rollback Plan: "Revert only task76 intentional source/inventory/docs commit through a separate approved task; preserve existing shared owners and unrelated work. No destructive history or branch merges."
  Findings: "Original two class scopes/native bodies are unchanged; first C++20 unlike-derived equality ambiguity repaired only in the caller via explicit actual member invocation against const FormulaToken. First diagnostics retained. Final normal-only --write/--check:465original hashes,17Boost headers,10positive commands,3whole streams. First dependency gate identified actual sc -> sal OUString edge; original global.hxx/token.hxx include rtl/ustring.hxx and hybrid owns OUString, so existing edge checker/test now admits that forward dependency while rejecting reverse and app imports. First inventory gate required nonempty upstream.tests; actual original ucalc_formula.cxx empty-string QA reference is context only, explicitly unexecuted/not direct token proof. First gate logs/results retained. Complete Calc/shared raw100, all14gates and23tooling pass. CALC-068 retains original hybrid flag omission; valid zero/empty-string pair is separate from release-only combinations that do not claim debug assertion validity. Matrix/ScFormulaResult/cell/document/UI, implicit class move, ABI/concurrency/invalid lifetimes/full upstream QA remain unverified. Exact source review/closure pending; next full81."
id_source: "generated"
---
## Summary

Task76 implements original Calc empty and hybrid formula result tokens, prerequisites of ScFormulaResult and original cell storage.

## Scope

Only vite-office-calc branch calc. New sc/inc/token.ts facade, sc/source/core/tool/token.ts original two classes, token tests/native fixture/probe, capability/runtime/provenance entries and docs/program/calc-core.md plus confirmed suspected issue journal. scripts/check-module-boundaries.mjs and its whole existing test suite register genuine acyclic sc -> sal dependency: original global.hxx/token.hxx include rtl/ustring.hxx and ScHybridCellToken owns OUString. Up to16intentional non-task paths (actual14). Task artefacts and ignored task76evidence. No synthetic matrix/tokenarray/compiler/document/text owners, cycle relaxation or Writer repair.

## Plan

Original task76 deliverable and verification remain unchanged. Register source-backed sc -> sal OUString dependency in existing boundary checker and test; supply actual unexecuted Calc QA empty-string context required by inventory schema, retaining false broad parity flags. Scope14non-task paths within16budget. Repeat only affected failed/changed gates; preserve full Calc/shared raw100 and other passed evidence.

## Verify Steps

1. node scripts/sc-result-token-native-probe.mjs --write then --check: ordinary-only original complete selected two class declarations/member definitions over genuine formula/SAL/SVL dependencies; whole native stream comparisons with scope/source hashes. No fabricated class/header/pointees. 2. node output/playwright/task76-checks/portable.mjs: complete Calc and all directly related shared owners/tests raw statements/branches/functions/lines100, each raw counter positive; four original reference links absent/restored. Static build and actual Calc browser profile pass with0scenarios accurately recorded. 3. node output/playwright/task76-checks/gates.mjs: format/lint/type/docs/size/deps/resources/tree/provenance/registry/routing/doctor/diff and complete relevant tooling tests. 4. Exact current-source hashes bind evidence to implementation SHA, accurate partial foundation inventory, separate same-agent EVALUATOR with explicit limits, ap verify and clean authoritativeDONE. No full suite before81 or Writer-only repairs, no sanitizer run.

## Verification

Command: node scripts/sc-result-token-native-probe.mjs --write then --check. Result: pass. Evidence: output/playwright/sc-result-token-native/manifest.json captured with10positive ordinary commands,465original source hashes and17archive-verified Boost headers; whole empty168byte/hybrid4138byte/equality243byte streams match. Scope: complete selected original two class declarations/named definitions over real shared dependencies, NDEBUG only; not full Calc token header/matrix/implicit class move/ABI/debug/QA. Command: node output/playwright/task76-checks/portable.mjs. Result: pass. Evidence:119Calc tests32files,82shared tests22files; raw Calc3054S2085B514F2697L and shared1692S1344B303F1503L all100with every raw counter positive. Scope: entire Calc plus whole directly affected shared owners/tests, four source links absent/restored, static build and actual Calc browser profile0UI scenarios. Command: node output/playwright/task76-checks/gates.mjs then --recheck. Result: pass after source-backed boundary/inventory repair. Evidence: all14gates terminal0; whole23tooling tests. Global format/lint passed; changed boundary files separately formatted/linted afterward. No application runtime changed after coverage. First native/gate failures retained. Exact source-bound EVALUATOR and final closure pending; no independent review or full UI claim, next full81.

## Rollback Plan

Revert only task76 intentional source/inventory/docs commit through a separate approved task; preserve existing shared owners and unrelated work. No destructive history or branch merges.

## Findings

Original two class scopes/native bodies are unchanged; first C++20 unlike-derived equality ambiguity repaired only in the caller via explicit actual member invocation against const FormulaToken. First diagnostics retained. Final normal-only --write/--check:465original hashes,17Boost headers,10positive commands,3whole streams. First dependency gate identified actual sc -> sal OUString edge; original global.hxx/token.hxx include rtl/ustring.hxx and hybrid owns OUString, so existing edge checker/test now admits that forward dependency while rejecting reverse and app imports. First inventory gate required nonempty upstream.tests; actual original ucalc_formula.cxx empty-string QA reference is context only, explicitly unexecuted/not direct token proof. First gate logs/results retained. Complete Calc/shared raw100, all14gates and23tooling pass. CALC-068 retains original hybrid flag omission; valid zero/empty-string pair is separate from release-only combinations that do not claim debug assertion validity. Matrix/ScFormulaResult/cell/document/UI, implicit class move, ABI/concurrency/invalid lifetimes/full upstream QA remain unverified. Exact source review/closure pending; next full81.
