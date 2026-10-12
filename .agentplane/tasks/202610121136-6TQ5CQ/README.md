---
id: "202610121136-6TQ5CQ"
title: "Implement shared formula error codes and encoded double errors"
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
  updated_at: "2026-10-12T11:39:09.438Z"
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
    body: "Start: implement the complete shared original formula error header and native-JS numeric equivalence witnesses under approved ongoing Calc goal; scoped raw100 and source-absent browser checks, no full until81."
events:
  -
    type: "status"
    at: "2026-10-12T11:39:10.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the complete shared original formula error header and native-JS numeric equivalence witnesses under approved ongoing Calc goal; scoped raw100 and source-absent browser checks, no full until81."
doc_version: 3
doc_updated_at: "2026-10-12T11:39:10.297Z"
doc_updated_by: "CODER"
description: "Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI."
sections:
  Summary: |-
    Implement shared formula error codes and encoded double errors

    Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI.
  Scope: "Complete include/formula/errorcodes.hxx responsibility in apps/office/src/formula/inc/errorcodes.ts, its complete portable native fixture/test, scripts/formula-errorcodes-native-probe.mjs and one shared browser numeric-contract spec. Add exact shared runtime/provenance/capability inventory records and append docs/program/calc-core.md. Use existing native SAL configuration bytes only; no new SAL union module, Writer owner, synthetic formula token/cell, document model, runtime fixture imports, project config or threshold changes. Task artifacts and ignored evidence belong to this task. Normal-only native caller; no sanitizer or full suite. Work only on calc in vite-office-calc."
  Plan: |-
    1. Compare the full pinned original header and real formula-result/formulacell consumers; confirm shared owner absence.
    2. Implement every original enum and helper, using Number.isFinite and DataView for original double error payload semantics; preserve switch cases and UInt16 boundary. Capture full unchanged native header outputs, dependencies and hashes with a bounded normal-only caller.
    3. Validate entire UInt16 domain, finite/infinite/quiet/signaling NaN classification and published constants in portable tests plus actual Chromium JS primitives.
    4. Add exact shared inventory records and limitations; run Calc and complete directly affected shared owner raw100, build and browser check with all3upstream links absent/restored. Run aggregate repository gates and related tooling, source-bound EVALUATOR, record verification and clean direct closure. Next full81.
  Verify Steps: |-
    1. node scripts/formula-errorcodes-native-probe.mjs --write, then --check: both pass against full unchanged pinned include/formula/errorcodes.hxx and every actual compiler dependency/configuration hash, normal-only. Full original enum names/numbers; exhaustive65536 creation/roundtrip/publication stream and arbitrary double-bit classification streams retained; no copied native algorithm or fake production provider.
    2. node output/playwright/task72-checks/portable.mjs: entire npm run test:coverage:calc plus complete formula shared tests/owner using unchanged Istanbul100 thresholds; all raw S/F/B counters positive and actual owner set unchanged in Calc. All3reference links absent for runtime tests/build and one shared browser spec, restored byte-exact afterward. Build plus npx playwright test --config apps/office/playwright.config.ts --project shared shared/formula-errorcodes.spec.ts pass using actual production functions with native fixture; no UI readiness claim.
    3. node output/playwright/task72-checks/gates.mjs: format/lint/typecheck/docs/size/dependency/resources/source-tree/provenance/all inventory/routing/doctor/diff pass. npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts scripts/check-module-boundaries.test.ts --config scripts/libreoffice-inventory/vitest.config.ts pass. Full suite not due until81; no Writer-only coverage repairs or lowered criteria.
    4. Inspect full counters/streams, exact source pin/hash correspondence, new capability markers and source responsibility, source-bound same-agent EVALUATOR pass and final git status --short --untracked-files=all. Record residual cross-engine NaN/arithmetic/JSON transport limitations honestly, no full module/kernel/upstream QA parity promotion.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task72 implementation and task evidence commits; restore original3symlink targets after any runtime verification failure; keep original native/full failure logs and source hashes. Re-run affected scoped checks after rollback; preserve unrelated active tasks."
  Findings: "Preflight: clean calc after task71 DONE ff739312; unrelated C9TN6M/X6VV8G tasks untouched. User authorizes continued core-first implementation and native-JS equivalence preference. Current source has no shared formula/errorcodes owner. It is included by both ScFormulaResult and ScFormulaCell; this leaf supplies actual missing contracts, not a pretend cell/store or UI readiness. Last full71; next full81. The previous status-only turn is revalidated against clean authoritative task71 DONE state; this task is the next concrete implementation."
id_source: "generated"
---
## Summary

Implement shared formula error codes and encoded double errors

Task72: port the complete original include/formula/errorcodes.hxx enum, CreateDoubleError, GetDoubleErrorValue and isPublishedFormulaError as the required formula-result/ScFormulaCell dependency. Reuse native JS numeric/DataView primitives and existing SAL source evidence instead of a duplicate library. Compare unchanged complete pinned original header via a normal-only native caller; retain all enum/internal/published/default distinctions, NaN low-bit precedence and invalid runtime assumptions in evidence. Complete Calc plus directly related shared raw100 with upstream links absent/restored, registry/provenance and aggregate local gates. No Writer-only changes, no full suite until81, no pretend formula cell/document/UI.

## Scope

Complete include/formula/errorcodes.hxx responsibility in apps/office/src/formula/inc/errorcodes.ts, its complete portable native fixture/test, scripts/formula-errorcodes-native-probe.mjs and one shared browser numeric-contract spec. Add exact shared runtime/provenance/capability inventory records and append docs/program/calc-core.md. Use existing native SAL configuration bytes only; no new SAL union module, Writer owner, synthetic formula token/cell, document model, runtime fixture imports, project config or threshold changes. Task artifacts and ignored evidence belong to this task. Normal-only native caller; no sanitizer or full suite. Work only on calc in vite-office-calc.

## Plan

1. Compare the full pinned original header and real formula-result/formulacell consumers; confirm shared owner absence.
2. Implement every original enum and helper, using Number.isFinite and DataView for original double error payload semantics; preserve switch cases and UInt16 boundary. Capture full unchanged native header outputs, dependencies and hashes with a bounded normal-only caller.
3. Validate entire UInt16 domain, finite/infinite/quiet/signaling NaN classification and published constants in portable tests plus actual Chromium JS primitives.
4. Add exact shared inventory records and limitations; run Calc and complete directly affected shared owner raw100, build and browser check with all3upstream links absent/restored. Run aggregate repository gates and related tooling, source-bound EVALUATOR, record verification and clean direct closure. Next full81.

## Verify Steps

1. node scripts/formula-errorcodes-native-probe.mjs --write, then --check: both pass against full unchanged pinned include/formula/errorcodes.hxx and every actual compiler dependency/configuration hash, normal-only. Full original enum names/numbers; exhaustive65536 creation/roundtrip/publication stream and arbitrary double-bit classification streams retained; no copied native algorithm or fake production provider.
2. node output/playwright/task72-checks/portable.mjs: entire npm run test:coverage:calc plus complete formula shared tests/owner using unchanged Istanbul100 thresholds; all raw S/F/B counters positive and actual owner set unchanged in Calc. All3reference links absent for runtime tests/build and one shared browser spec, restored byte-exact afterward. Build plus npx playwright test --config apps/office/playwright.config.ts --project shared shared/formula-errorcodes.spec.ts pass using actual production functions with native fixture; no UI readiness claim.
3. node output/playwright/task72-checks/gates.mjs: format/lint/typecheck/docs/size/dependency/resources/source-tree/provenance/all inventory/routing/doctor/diff pass. npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts scripts/check-module-boundaries.test.ts --config scripts/libreoffice-inventory/vitest.config.ts pass. Full suite not due until81; no Writer-only coverage repairs or lowered criteria.
4. Inspect full counters/streams, exact source pin/hash correspondence, new capability markers and source responsibility, source-bound same-agent EVALUATOR pass and final git status --short --untracked-files=all. Record residual cross-engine NaN/arithmetic/JSON transport limitations honestly, no full module/kernel/upstream QA parity promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task72 implementation and task evidence commits; restore original3symlink targets after any runtime verification failure; keep original native/full failure logs and source hashes. Re-run affected scoped checks after rollback; preserve unrelated active tasks.

## Findings

Preflight: clean calc after task71 DONE ff739312; unrelated C9TN6M/X6VV8G tasks untouched. User authorizes continued core-first implementation and native-JS equivalence preference. Current source has no shared formula/errorcodes owner. It is included by both ScFormulaResult and ScFormulaCell; this leaf supplies actual missing contracts, not a pretend cell/store or UI readiness. Last full71; next full81. The previous status-only turn is revalidated against clean authoritative task71 DONE state; this task is the next concrete implementation.
