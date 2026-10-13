---
id: "202610130501-G2BDHD"
title: "Replace Boost token ownership with native JavaScript references"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  updated_at: "2026-10-13T05:03:53.514Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T05:46:45.923Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR passes exact GC-first token adaptationdf1dc1a89f35456ca3170c731dce33324e2e78c2; user explicitly overrides C++ token memory management. No independent review or global shared-value lifetime migration claim."
  evaluated_sha: "df1dc1a89f35456ca3170c731dce33324e2e78c2"
  blueprint_digest: "40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9"
  evidence_refs:
    - ".agentplane/tasks/202610130501-G2BDHD/README.md"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610130501-G2BDHD/blueprint/resolved-snapshot.json"
    - "output/playwright/task82-checks/exact-review.json"
    - "output/playwright/task82-checks/final-source-hashes.json"
    - "output/playwright/task82-checks/value-coverage-audit.json"
    - "output/playwright/task82-checks/gates-results.json"
    - "output/playwright/task82-checks/first-gates-results.json"
    - "docs/program/calc-browser-gc-adaptation.md"
  findings:
    - "All3197current non-task source/test/fixture/config/doc hashes match exact committed blobs;42intentional paths include5removed Boost source/license/mechanism records. FormulaToken references are type-only nullable JS aliases, FAP holds its actual original token directly, token counters/policies/atomic/ADL/delete hooks and replacement managers/finalizers absent."
    - "Token semantic constructors/opcodes/type/equality and payload clones remain original-shaped. Live JS aliases and FAP clone identity/independent numeric payload regressions pass. Original native fixtures byte-identical to pre-task baseline; only C++ token count/policy columns are explicitly projected away, no native lifetime equality or GC timing assertions."
    - "Entire Calc125tests36files and whole affected shared242tests48files39executable owners raw S/B/F/L100 every counter positive: Calc3080S2092B526F2721L, shared4028S2063B829F3611L. Four links absent/restored, static build and Calc profile0UI pass."
    - "All16final gates pass including36tooling tests10files and123inventory tests38files configured coverage100. Current metadata declares browser adaptation and drops Boost capability; stale parent compiler/header evidence and external-edge regression migrated without changing compiler runtime or Writer/shared-string implementation. Initial failure artifacts retained."
    - "Existing SAL/SVL value cleanup remains a separate unchanged legacy boundary; FAP cleanup never cascades into original token. Future unported GetRef cache/mutation algorithms need semantic adaptation. Main goal remains paused, full81 not repeated and no complete Calc/document/UI claim."
commit:
  hash: "df1dc1a89f35456ca3170c731dce33324e2e78c2"
  message: "🧹 G2BDHD calc: replace Boost token ownership with native JS references"
comments:
  -
    author: "CODER"
    body: "Start: explicit user GC-first correction, remove Boost/token memory ownership and preserve plain JS token alias/clone semantics. Whole Calc/affected shared raw100, accurate browser adaptation inventory and exact review; main goal remains paused."
  -
    author: "CODER"
    body: "Implementation: native JS token references committed atdf1dc1a89f35; Boost/token ownership hooks removed, entire Calc125/shared242 raw100 and16final gates pass. Original fixtures unchanged, user-authorized GC adaptation inventoried; same-agent separate EVALUATOR follows, main goal remains paused."
events:
  -
    type: "status"
    at: "2026-10-13T05:04:07.207Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit user GC-first correction, remove Boost/token memory ownership and preserve plain JS token alias/clone semantics. Whole Calc/affected shared raw100, accurate browser adaptation inventory and exact review; main goal remains paused."
  -
    type: "status"
    at: "2026-10-13T05:44:10.285Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Implementation: native JS token references committed atdf1dc1a89f35; Boost/token ownership hooks removed, entire Calc125/shared242 raw100 and16final gates pass. Original fixtures unchanged, user-authorized GC adaptation inventoried; same-agent separate EVALUATOR follows, main goal remains paused."
doc_version: 3
doc_updated_at: "2026-10-13T05:44:10.285Z"
doc_updated_by: "CODER"
description: "Explicit user correction: remove Boost intrusive_ptr runtime and token retain/release/delete counters, use ordinary JS references for FormulaTokenRef/FormulaConstTokenRef and FAP. Preserve token identity/cloning/semantic values, retain existing shared value cleanup API where needed without token ownership hooks; no GC finalizers/refcount engine. Migrate native tests to explicit semantic projections, update current inventory/deviation docs and verify whole Calc/affected shared raw100. Main goal remains paused."
sections:
  Summary: "Replace the unnecessary Boost intrusive_ptr runtime and FormulaToken memory counters with JavaScript references under the user's explicit GC-first correction. The main Calc goal remains paused."
  Scope: "Only calc checkout/branch. Remove external Boost intrusive_ptr source and unused license plus its current runtime/provenance/capability records. Adapt formula/inc/types and token exports/enums, FormulaToken base, FormulaFAPToken reference field and Calc token clone documentation. Migrate the three directly affected formula/Calc test files, preserving unmodified native captures and semantic value/identity coverage. Update current formula/Calc runtime/provenance/capability evidence, calc-core and a focused browser-GC deviation document; related module boundary rule if its Boost import edge exists. Existing shared string/SAL value owners and their explicit value cleanup remain unchanged: this task removes token memory management, not an unrelated Writer/shared-string migration."
  Plan: "Replace Boost/token ownership counters with ordinary JS references under explicit user authorization, preserve semantic alias/clone/value behavior and current shared value cleanup boundary. Migrate semantic native projections and current inventory/deviation records, whole Calc/affected shared raw100 and gates/exact review, main goal stays paused."
  Verify Steps: |-
    1. Targeted three complete formula/inc/token, native-token and sc/core/tool/token tests: semantic native field projections against unmodified captured original fixtures, explicit JS alias/FAP clone independence and no premature destruction; no native refcount or GC timing assertions.
    2. node output/playwright/task82-checks/portable.mjs: entire Calc and whole directly affected shared formula/SAL/SharedString owners/tests raw S/B/F/L100 with every raw counter positive; four reference links absent/restored, static build and Calc browser profile.
    3. node output/playwright/task82-checks/gates.mjs: format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/invariants/routing/doctor/diff and directly affected complete tooling/inventory validation tests.
    4. No executable Boost imports or token retain/release/delete hooks; direct FAP references and actual clone/alias behavior verified. Exact runtime/test/config/fixture hashes tied to commit, user-authorized browser adaptation accurately documented and inventoried; original native fixtures unchanged; same-agent separate EVALUATOR, authoritative DONE and clean all-files git status. No full-suite rerun after cycle81, main goal remains paused.
  Verification: "Command: targeted three formula/Calc test files. Result:17semantic tests pass; subsequent whole scoped run repeats complete current files. Evidence: direct aliases survive owner-slot clearing, FAP clones retain original identity, numeric payload clones remain independent, original native classification/stack/constructor/empty/hybrid semantic projections match. Original fixtures byte-identical, C++ token count/policy columns explicitly omitted; retired ownership manager tests removed, no GC timing/counter assertions. Command: node output/playwright/task82-checks/portable.mjs. Result: pass. Evidence: whole Calc125tests36files raw3080S2092B526F2721L and related shared242tests48files39executable owners raw4028S2063B829F3611L all100 every counter positive, four source links absent/restored, static and actual Calc profile0UI pass. Command: node output/playwright/task82-checks/gates.mjs and bounded correction --recheck. Result:16final gates pass including36tooling tests10files and123inventory tests38files configured coverage100. First failed stale evidence, provenance docs-path resolution and retired external-edge assertions corrected with failed logs retained; compiler runtime unchanged. Scope: complete current Calc/affected shared, metadata and validator families; no full application replay or Writer-only repairs. Exact hashes/commit and same-agent separate EVALUATOR follow before closure. User-approved GC adaptation/current inventory explicit, shared value cleanup and main paused goal unchanged."
  Rollback Plan: "Revert only intentional task82 changes through a new approved task; preserve original native evidence and shared string owners. No destructive history, merges or unrelated task changes."
  Findings: |-
    Runtime intrusive_ptr is used only by FormulaToken reference aliases and FAP's original-token field. Current upstream GetRef reuse branches reside in not-yet-ported compiler/interpreter owners; future adaptations must protect shared mutation using semantic copies rather than assume JavaScript reference counts. Native C++ lifetime observations are not business behavior and are excluded explicitly. Existing shared value cleanup is a separate legacy boundary, not token memory deallocation.

    - Observation: First targeted three-file replay passes17semantic tests with unchanged original captures and explicit count/policy projection. First typecheck reported a now-unused FAP import and a test alias widening a concrete double token to the base type; both corrected without runtime semantics changes.
      Impact: No memory manager or fake reference count remains in FormulaToken/FAP; string value cleanup remains the existing separate boundary.
      Resolution: Continue entire Calc/related shared source-absent raw100 and current inventory/gate validation. No native lifetime equality claim or GC timing test.

    - Observation: Entire Calc125/shared242 raw100 and source-absent static/profile pass. First repository gates reject stale removed ownership-test markers in unchanged compiler evidence and the old module-boundary test allowing formula->external; original failing logs/results retained.
      Impact: Runtime native reference adaptation is verified; current inventory/test evidence still referenced retired memory emulation.
      Resolution: Replace only stale compiler evidence anchors with unchanged opcode/classification tests, migrate boundary regression to reject the retired external edge, and rerun the five failed metadata/tooling gates. No compiler runtime change or full application replay.

    - Observation: Boost module/license/current mechanism capability removed; nullable TS reference aliases and direct FAP references replace it. Token counters/policies/atomic/ADL/delete-on-zero hooks absent. Whole scoped raw100 and16final gates pass, original native captures unchanged.
      Impact: Preserves token business fields/identity/Clone without C++ token allocation semantics. Existing SAL/SVL explicit value cleanup and not-yet-ported cache/COW reuse algorithms remain a separately documented boundary.
      Resolution: Commit intentional scope, review exact committed source/test/fixture bytes and removed manager paths in a same-agent separate EVALUATOR phase, then canonical close. Main goal remains paused; no WeakRef/finalizer or replacement memory manager.
id_source: "generated"
---
## Summary

Replace the unnecessary Boost intrusive_ptr runtime and FormulaToken memory counters with JavaScript references under the user's explicit GC-first correction. The main Calc goal remains paused.

## Scope

Only calc checkout/branch. Remove external Boost intrusive_ptr source and unused license plus its current runtime/provenance/capability records. Adapt formula/inc/types and token exports/enums, FormulaToken base, FormulaFAPToken reference field and Calc token clone documentation. Migrate the three directly affected formula/Calc test files, preserving unmodified native captures and semantic value/identity coverage. Update current formula/Calc runtime/provenance/capability evidence, calc-core and a focused browser-GC deviation document; related module boundary rule if its Boost import edge exists. Existing shared string/SAL value owners and their explicit value cleanup remain unchanged: this task removes token memory management, not an unrelated Writer/shared-string migration.

## Plan

Replace Boost/token ownership counters with ordinary JS references under explicit user authorization, preserve semantic alias/clone/value behavior and current shared value cleanup boundary. Migrate semantic native projections and current inventory/deviation records, whole Calc/affected shared raw100 and gates/exact review, main goal stays paused.

## Verify Steps

1. Targeted three complete formula/inc/token, native-token and sc/core/tool/token tests: semantic native field projections against unmodified captured original fixtures, explicit JS alias/FAP clone independence and no premature destruction; no native refcount or GC timing assertions.
2. node output/playwright/task82-checks/portable.mjs: entire Calc and whole directly affected shared formula/SAL/SharedString owners/tests raw S/B/F/L100 with every raw counter positive; four reference links absent/restored, static build and Calc browser profile.
3. node output/playwright/task82-checks/gates.mjs: format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/invariants/routing/doctor/diff and directly affected complete tooling/inventory validation tests.
4. No executable Boost imports or token retain/release/delete hooks; direct FAP references and actual clone/alias behavior verified. Exact runtime/test/config/fixture hashes tied to commit, user-authorized browser adaptation accurately documented and inventoried; original native fixtures unchanged; same-agent separate EVALUATOR, authoritative DONE and clean all-files git status. No full-suite rerun after cycle81, main goal remains paused.

## Verification

Command: targeted three formula/Calc test files. Result:17semantic tests pass; subsequent whole scoped run repeats complete current files. Evidence: direct aliases survive owner-slot clearing, FAP clones retain original identity, numeric payload clones remain independent, original native classification/stack/constructor/empty/hybrid semantic projections match. Original fixtures byte-identical, C++ token count/policy columns explicitly omitted; retired ownership manager tests removed, no GC timing/counter assertions. Command: node output/playwright/task82-checks/portable.mjs. Result: pass. Evidence: whole Calc125tests36files raw3080S2092B526F2721L and related shared242tests48files39executable owners raw4028S2063B829F3611L all100 every counter positive, four source links absent/restored, static and actual Calc profile0UI pass. Command: node output/playwright/task82-checks/gates.mjs and bounded correction --recheck. Result:16final gates pass including36tooling tests10files and123inventory tests38files configured coverage100. First failed stale evidence, provenance docs-path resolution and retired external-edge assertions corrected with failed logs retained; compiler runtime unchanged. Scope: complete current Calc/affected shared, metadata and validator families; no full application replay or Writer-only repairs. Exact hashes/commit and same-agent separate EVALUATOR follow before closure. User-approved GC adaptation/current inventory explicit, shared value cleanup and main paused goal unchanged.

## Rollback Plan

Revert only intentional task82 changes through a new approved task; preserve original native evidence and shared string owners. No destructive history, merges or unrelated task changes.

## Findings

Runtime intrusive_ptr is used only by FormulaToken reference aliases and FAP's original-token field. Current upstream GetRef reuse branches reside in not-yet-ported compiler/interpreter owners; future adaptations must protect shared mutation using semantic copies rather than assume JavaScript reference counts. Native C++ lifetime observations are not business behavior and are excluded explicitly. Existing shared value cleanup is a separate legacy boundary, not token memory deallocation.

- Observation: First targeted three-file replay passes17semantic tests with unchanged original captures and explicit count/policy projection. First typecheck reported a now-unused FAP import and a test alias widening a concrete double token to the base type; both corrected without runtime semantics changes.
  Impact: No memory manager or fake reference count remains in FormulaToken/FAP; string value cleanup remains the existing separate boundary.
  Resolution: Continue entire Calc/related shared source-absent raw100 and current inventory/gate validation. No native lifetime equality claim or GC timing test.

- Observation: Entire Calc125/shared242 raw100 and source-absent static/profile pass. First repository gates reject stale removed ownership-test markers in unchanged compiler evidence and the old module-boundary test allowing formula->external; original failing logs/results retained.
  Impact: Runtime native reference adaptation is verified; current inventory/test evidence still referenced retired memory emulation.
  Resolution: Replace only stale compiler evidence anchors with unchanged opcode/classification tests, migrate boundary regression to reject the retired external edge, and rerun the five failed metadata/tooling gates. No compiler runtime change or full application replay.

- Observation: Boost module/license/current mechanism capability removed; nullable TS reference aliases and direct FAP references replace it. Token counters/policies/atomic/ADL/delete-on-zero hooks absent. Whole scoped raw100 and16final gates pass, original native captures unchanged.
  Impact: Preserves token business fields/identity/Clone without C++ token allocation semantics. Existing SAL/SVL explicit value cleanup and not-yet-ported cache/COW reuse algorithms remain a separately documented boundary.
  Resolution: Commit intentional scope, review exact committed source/test/fixture bytes and removed manager paths in a same-agent separate EVALUATOR phase, then canonical close. Main goal remains paused; no WeakRef/finalizer or replacement memory manager.
