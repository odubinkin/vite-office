---
id: "202610160713-706QET"
title: "Connect numeric arithmetic formulas to Calc document cells"
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
  updated_at: "2026-10-16T07:14:03.800Z"
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
    body: "Start: implement real numeric formula entry and lazy results in the existing Calc cell store; preserve native operations and explicit unsupported boundaries without adding UI or a second expression model."
events:
  -
    type: "status"
    at: "2026-10-16T07:14:09.194Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement real numeric formula entry and lazy results in the existing Calc cell store; preserve native operations and explicit unsupported boundaries without adding UI or a second expression model."
doc_version: 3
doc_updated_at: "2026-10-16T07:14:09.194Z"
doc_updated_by: "CODER"
description: "Task200: implement numeric formula entry, real token/RPN evaluation and lazy ScFormulaCell results in the existing document-sheet-column store. Reuse shared compiler, RTL parsing, mdds and formula result. No UI or unrelated language expansion."
sections:
  Summary: "Task200: connect numeric arithmetic formulas end-to-end to the actual Calc document-sheet-column cell store, using the existing shared compiler, numeric parser and formula result."
  Scope: "Calc sc/inc and source/core data/tool owners: ScTokenArray, ScCompiler, ScInterpreterContext, ScInterpreter, ScFormulaCell, formula block/CellStoreEvent and existing document/table/column/mtvelements. Reuse ScSheetLimits and ScFormulaResult. Shared SAL math owner/facades gain only consumed approxEqual/approxAdd/approxSub; shared FormulaCompiler array reference becomes mutable as native CompileString requires. Numeric ODFF grammar, parentheses, unary minus, arithmetic and percent; normal finite powers with negative reciprocal odd roots. Explicit unsupported boundaries for references/functions/string formulas, locale formatting and unproven subnormal power regions. Add focused real-model unit/browser/Worker tests, paired runtime/provenance and capability records and update Calc readiness. No UI, ODS implementation, unrelated language/cache/RNG/physical ownership engine or complete native constructor graph. Approximately20 runtime/header paths plus their paired registry records, tests/docs/task evidence."
  Plan: "1. Audit the reached native formula entry, numeric scanner, arithmetic/default/error/result and typed-store/event paths. 2. Implement the numeric specialization with actual shared RPN/result/block owners and GC object lifetime, maintaining source module boundaries and explicit omitted services. 3. Verify public document entry/read/replacement/clear and lazy results, operator precedence/errors/numeric boundaries and block events. 4. Update exact inventory; portable whole Calc and changed-shared raw100 plus related tests, actual browser/Worker, source gates and same-agent evaluation. Keep references/SUM/dependency listening and ODS as the next minimal critical-path slices; no full all-app run until that stage is ready, then pause."
  Verify Steps: |-
    - node output/playwright/task200-checks/source-audit.mjs: pinned reached native methods/defaults/QA and explicit GC adaptation; no C++ execution.
    - node output/playwright/task200-checks/portable.mjs: exact executable whole-Calc and changed shared owner sets with raw S/B/F/L100 and every counter positive; directly related compiler/token/number/parser/block tests; reference links absent/restored.
    - node output/playwright/task200-checks/browser-portable.mjs: production build and real document formula editing/lazy evaluation in Chromium and DOM-free Worker without references.
    - node output/playwright/task200-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates.
    - Final scope/hash audit, recorded verify, source commit and same-agent quality review before finish. Explicitly no UI/full all-app run or claim of formula references/functions/ODS readiness.
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert only task200 source and metadata commits, preserving unrelated work and deferred LanguageTag snapshot. No reset, branch merge, publication or network writes."
  Findings: "Previous goal turn completed task199 (source ddcdb90f74e8, close83e7962127e9), with clean calc branch. User standing approval covers minimal canonical core; UI explicitly remains separate. Native numeric ODFF ParseValue already calls existing RTL stringToDouble, avoiding formatter/localization dependencies for this subset. ScColumn owns formula block counts via actual CellStoreEvent. Native pointer deletion is physical ownership and will use ordinary JS GC, not a new memory manager. Native mbCloseBrackets defaults true; scanner must retain that real behavior. Source power underflow fenv cannot be assumed from Math.pow; unproven subnormal regions must remain explicit gaps rather than false parity claims."
id_source: "generated"
---
## Summary

Task200: connect numeric arithmetic formulas end-to-end to the actual Calc document-sheet-column cell store, using the existing shared compiler, numeric parser and formula result.

## Scope

Calc sc/inc and source/core data/tool owners: ScTokenArray, ScCompiler, ScInterpreterContext, ScInterpreter, ScFormulaCell, formula block/CellStoreEvent and existing document/table/column/mtvelements. Reuse ScSheetLimits and ScFormulaResult. Shared SAL math owner/facades gain only consumed approxEqual/approxAdd/approxSub; shared FormulaCompiler array reference becomes mutable as native CompileString requires. Numeric ODFF grammar, parentheses, unary minus, arithmetic and percent; normal finite powers with negative reciprocal odd roots. Explicit unsupported boundaries for references/functions/string formulas, locale formatting and unproven subnormal power regions. Add focused real-model unit/browser/Worker tests, paired runtime/provenance and capability records and update Calc readiness. No UI, ODS implementation, unrelated language/cache/RNG/physical ownership engine or complete native constructor graph. Approximately20 runtime/header paths plus their paired registry records, tests/docs/task evidence.

## Plan

1. Audit the reached native formula entry, numeric scanner, arithmetic/default/error/result and typed-store/event paths. 2. Implement the numeric specialization with actual shared RPN/result/block owners and GC object lifetime, maintaining source module boundaries and explicit omitted services. 3. Verify public document entry/read/replacement/clear and lazy results, operator precedence/errors/numeric boundaries and block events. 4. Update exact inventory; portable whole Calc and changed-shared raw100 plus related tests, actual browser/Worker, source gates and same-agent evaluation. Keep references/SUM/dependency listening and ODS as the next minimal critical-path slices; no full all-app run until that stage is ready, then pause.

## Verify Steps

- node output/playwright/task200-checks/source-audit.mjs: pinned reached native methods/defaults/QA and explicit GC adaptation; no C++ execution.
- node output/playwright/task200-checks/portable.mjs: exact executable whole-Calc and changed shared owner sets with raw S/B/F/L100 and every counter positive; directly related compiler/token/number/parser/block tests; reference links absent/restored.
- node output/playwright/task200-checks/browser-portable.mjs: production build and real document formula editing/lazy evaluation in Chromium and DOM-free Worker without references.
- node output/playwright/task200-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates.
- Final scope/hash audit, recorded verify, source commit and same-agent quality review before finish. Explicitly no UI/full all-app run or claim of formula references/functions/ODS readiness.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert only task200 source and metadata commits, preserving unrelated work and deferred LanguageTag snapshot. No reset, branch merge, publication or network writes.

## Findings

Previous goal turn completed task199 (source ddcdb90f74e8, close83e7962127e9), with clean calc branch. User standing approval covers minimal canonical core; UI explicitly remains separate. Native numeric ODFF ParseValue already calls existing RTL stringToDouble, avoiding formatter/localization dependencies for this subset. ScColumn owns formula block counts via actual CellStoreEvent. Native pointer deletion is physical ownership and will use ordinary JS GC, not a new memory manager. Native mbCloseBrackets defaults true; scanner must retain that real behavior. Source power underflow fenv cannot be assumed from Math.pow; unproven subnormal regions must remain explicit gaps rather than false parity claims.
