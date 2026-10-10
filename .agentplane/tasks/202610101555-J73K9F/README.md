---
id: "202610101555-J73K9F"
title: "Port original OUString comparison and SharedStringPool hashed-key owners"
result_summary: "verified-202610101555-J73K9F"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 24
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T15:57:28.079Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T16:16:11.058Z"
  updated_by: "CODER"
  note: "verified-202610101555-J73K9F"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-10T16:15:30.863Z"
  updated_by: "EVALUATOR"
  note: "Reviewed implementation2e23eb26970ae92a197c663b2af639db56dee172 against pinned original source, approved task36 contracts and complete native/portable evidence; scoped implementation is ready for closure."
  evaluated_sha: "2e23eb26970ae92a197c663b2af639db56dee172"
  blueprint_digest: "3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc"
  evidence_refs:
    - ".agentplane/tasks/202610101555-J73K9F/README.md"
    - ".agentplane/tasks/202610101555-J73K9F/quality/20261010-161530863-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610101555-J73K9F/quality/20261010-161530863-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610101555-J73K9F/quality/20261010-161530863-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610101555-J73K9F/blueprint/resolved-snapshot.json"
    - "output/playwright/task36-audit.json"
    - "output/playwright/task36-checks/manifest.json"
    - "output/playwright/task36-final/manifest.json"
    - "output/playwright/rtl-string-key-native/output.json"
    - "output/playwright/rtl-string-key-native/invalid.stderr"
    - "apps/office/src/svl/source/misc/native-string-key-cases.json"
    - "docs/program/registry/shared/capabilities/CAP-964432b0-3954-4bba-8b5c-c58d4038a982.json"
  findings:
    - "Actual original OUString normal/reverse comparison, equality length/pointer/reverse order, six friend operator bodies and signed hash delegate match the single shared SAL owner. Selected native64-bit size_t casts use lossless BigInt. Complete StringWithHash by-value/rvalue construction and implicit memberwise copy/move/assignment/destruction preserve str-before-cache order; equality checks cache before actual str. No fake pool or CharClass, duplicate string owner or Writer change."
    - "All32 full original blobs independently match git-show pinned SHA. Entire raw native output equals8143 committed complete snapshots, with driverce4f99e0/states2970e51a. Actual collision call2353 returns0,5243,5243; genuine negative hash witness exceeds Number precision after unsigned64 cast. ASan/UBSan defined output is identical; invalid null-field hashing remains diagnosed without post-UB golden values. Unchanged prior drivers164be221/44ad48ef retain4424/3336 full observations and all original guards."
    - "Inspected portable source sets and every actual s/f/b counter: Calc19 sources S2920 B2055 F474 L2564; affected shared9 sources S434 B214 F99 L353, all positive and allfour100. Both upstream links absent during Calc106/shared8/tooling28 runs and restored before native/provenance gates. Recorded bounded failed caller/import/audit/marker checks have specific successful same-scope corrections; no acceptance weakening."
    - "All15 committed paths are intentional approved runtime/native fixture/test/helper/inventory/core/journal/task artifacts. Calc48 capabilities174 modules and shared25 capabilities144 modules report0 semantic violations while broad parity flags remain unverified. CALC-035 is clearly source-only awaiting native locale service reproduction. Source-tree/provenance/format/types/lint/docs/size/boundaries/routing/doctor/diff gates pass; doctor has0 errors/two inherited warnings. Full run remains due at41."
commit:
  hash: "949bc3fa00f9352b86d179be24ae42467ac1e7e4"
  message: "✅ J73K9F quality: verify original shared Unicode key owners"
comments:
  -
    author: "CODER"
    body: "Start: Port original OUString comparisons/hash and complete actual StringWithHash key ownership using shared RTL and unchanged native full-header evidence on branchcalc."
  -
    author: "CODER"
    body: "Verified: verified-202610101555-J73K9F. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-10T15:57:29.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port original OUString comparisons/hash and complete actual StringWithHash key ownership using shared RTL and unchanged native full-header evidence on branchcalc."
  -
    type: "verify"
    at: "2026-10-10T16:14:33.523Z"
    author: "CODER"
    state: "ok"
    note: "All task36 original native and unchanged prior native captures, portable Calc106/shared8/tooling28, strict S/B/F/L100 positive complete sources and declared scoped gates passed; independent source/raw-state audit retained."
  -
    type: "verify"
    at: "2026-10-10T16:16:11.058Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610101555-J73K9F"
  -
    type: "status"
    at: "2026-10-10T16:16:11.221Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610101555-J73K9F. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-10T16:16:40.375Z"
doc_updated_by: "CODER"
description: "Task36 closes actual shared pool/storage key dependencies: original OUString compareTo/equals/hash and bounded original relational operations, plus complete StringWithHash struct with original constructor/equality/std hash and implicit copy/move/assignment/lifetime. Reuse SAL/SVL owners and full unchanged native headers/dependencies; no fake CharClass or pool, no JS Unicode casing replacement. Native complete initialized owner/cache/refcount/allocation/query observations and strict Calc/affected shared100; task5/10 after full31,next41. Branchcalc only; actual locale case mapping/pool/typed cell writes remain next dependencies."
sections:
  Summary: "Task36 supplies the actual shared value-comparison/hash dependencies and complete original StringWithHash key owner used by SharedStringPool, required before real Calc text storage. Reuse shared SAL/SVL data and full native source ownership. Task5/10 after full31,next full41; whole Calc and actual pool/locale service remain unfinished."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Extend apps/office/src/sal/inc/rtl/ustring.ts with actual represented original OUString equals/hashCode/compareTo/reverseCompareTo, original equality/inequality/ordering adapters and OUStringHash functor; normal represented OUString/reference inputs, not unrelated conversions/ASCII casing/shortened search algorithms. Add complete original private StringWithHash struct at its actual svl/source/misc/sharedstringpool.ts owner, including native cached hash/equality/std::hash callback and implicit copy/move/assignment/destruction adapters. No synthetic SharedStringPool or CharClass declaration, no fake locale service/JS casing. Native script scripts/rtl-string-key-native-probe.mjs and portable fixture/test under svl/source/misc; reuse scripts/rtl-ustring-native-sources.mjs, factoring verified unchanged full-header configuration/lifetime prefix from existing scripts/rtl-sharedstring-native-probe.mjs into shared helpers if needed without changing its driver/corpus. Extend exhaustive shared runtime/provenance/capability records for actual modules, docs/program/calc-core.md and calc-upstream-suspected-issues.md only for genuinely identified native suspicious conditions, active task artifacts. No Writer/modules, network, merges, branches, policy/verification relaxations. Native64-bit size_t hash representation is explicit and broad native ABI/other targets remain unverified."
  Plan: |-
    1. Verify exact native full OUString header, StringWithHash anonymous struct/std::hash specialization and complete implicit-member behavior. Establish normal runtime/const-reference comparison/hash operators and same cached-key/default/lifetime rules. Actual locale/CharClass pipeline is a later required dependency, never substituted.
    2. Port complete source-backed OUString represented comparisons/hash and real cached key with implicit special-member owners. Preserve signed32 hash and selected64-bit size_t casts, stale native cached-key behavior if a mutable caller changes fields, source pointer/counter order. Literal/copy/move/no-acquire data ownership stays in the single shared RTL owner. Explicit methods adapt C++ operators/rvalues/destructors only.
    3. Reuse native full-header/type/config/RTL functions in a common probe helper without changing task35 driver164be221 or any4424 states/2 runtime guards/3 compile guards/3 diagnoses; prior task34 driver44ad48ef/3336/20 stays unchanged. Compile original unchanged key/hash/full-header classes, never hand-written C++ substitutes. Capture complete initialized owner/key/cache/refcount/data/events/results, all comparison outputs and signed/unsigned hash strings over real collisions/nonASCII/NUL/surrogate cases, moves/copies/assignment/self assignment and native destructor cleanup. Diagnose invalid native input separately without post-UB golden results.
    4. Fill exhaustive original-symbol/runtime/provenance/capability inventories with Foundation/unverified broad status and clear representation/remaining-service gaps; update actual core roadmap/journal. No raw JS string identity/casing changes replace actual native keys.
    5. Serial native --check for new and unchanged existing corpora; portable Calc and affected shared strict S/B/F/L100/all actual raw counters positive/complete source maps with both upstream symlinks absent and restored finally; affected source/registry/boundary tooling. Typecheck/lint/JSDoc/size/deps/tree/provenance/scoped inventories/changed-file format/routing/doctor/diff. Commit implementation, separate read-only EVALUATOR quality and task closure with clean branchcalc. No full suite until task41.
  Verify Steps: |-
    1. node scripts/rtl-string-key-native-probe.mjs --check: full pinned actual C++ headers/complete original key and hash source, all initialized pointer/cache/refcount/allocator/query snapshots and actual native diagnostics; exact full-file/scope/driver/output digests. node scripts/rtl-sharedstring-native-probe.mjs --check retains all4424 snapshots/2 runtime guards/3 compile guards/3 invalid diagnoses and driver164be221; node scripts/rtl-ustring-ownership-native-probe.mjs --check retains3336/20 and driver44ad48ef when shared extraction changes.
    2. npm run test:coverage:calc: every actual Calc case, all-four100 and raw positive. Affected new/existing SAL/SVL string/key tests with exact executable source includes, all-four100 and actual source completeness; repeat portable checks with both original vendor links absent/restored in finally. Real native collisions/negative hashes/operator results and key ownership copy/move/destruction must be compared, no mirrored expected algorithm.
    3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected module-boundary/source-provenance/registry tests; changed nongenerated file formatting; routing/ap doctor/git diff --check. Provenance/native checks require restored pinned sources; no concurrent removal. All pass without thresholds/assertions/exclusion/time-budget relaxation.
    4. Read-only EVALUATOR checks actual implementation commit/source contracts/full digests/counters, no fake pool/CharClass or duplicate shared owner; records nonempty quality findings/evidence/risks. Task verify-show, CLI verification/quality/close pass and final DONE route/branchcalc/clean all tracked/untracked status. No whole run at task5/10; next scheduled41.
  Verification: |-
    Command: node scripts/rtl-string-key-native-probe.mjs --check
    Result: pass.
    Evidence:8143 complete native call snapshots,32 pinned full source/config/header blobs,32 unchanged dependency scopes. Driver ce4f99e056d9eeb680be3830d62597069aa5904b2b89350aaa45fbb3554c046c; full raw states2970e51a516928651ad651c8db0a5a5c7107836c15e236d6f9a7633ce593b12d. Original full C++ headers/private StringWithHash/std::hash compile with complete RTL lifetime dependencies. Valid ASan/UBSan output is identical; null-data unacquired hash diagnosed before UB with no defined expected result. Real [65,100]/[66,63] collision at call2353 returns equality0 and hashes5243/5243. Negative signed hashes produce exact unsigned64 witnesses above Number precision. Independent audit verifies every pinned blob via git show and every full state against raw native output.
    Scope: original OUString represented comparisons/hash/operators and cached-key by-value/rvalue/copy/move/assignment/self assignment/destruction. No fake pool/casing/document owner.

    Command: node scripts/rtl-sharedstring-native-probe.mjs --check; node scripts/rtl-ustring-ownership-native-probe.mjs --check
    Result: pass.
    Evidence: unchanged driver164be221 and all4424 complete states/2 runtime guards/3 compile guards/3 invalid diagnoses; unchanged driver44ad48ef and3336 states/20 guards. Shared native-header/lifetime factoring retains earlier original driver bytes and results.
    Scope: actual existing shared lifetime dependencies; no native source-body edits or source version drift.

    Command: npm run test:coverage:calc; exact affected SAL/SVL Vitest --coverage command in output/playwright/task36-checks/manifest.json
    Result: pass.
    Evidence: both original vendor links absent throughout portable runs, restored in finally. Calc106 tests/24 files,19 executable sources; S2920 B2055 F474 L2564 all100%. Affected shared8 tests/4 files,9 exact executable sources; S434 B214 F99 L353 all100%. Every raw s/f/b counter positive; executable source set complete; independent audit output/playwright/task36-audit.json. Portable full-state tests compare all8143 original snapshots without native sources.
    Scope: Calc and affected shared owners only; no Writer coverage fixes or full-suite run. Task5/10 since full31; next full41.

    Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/registry-validation.test.ts
    Result: pass.
    Evidence:28 tests/4 files, upstream absent; full logs task36-checks/03.log.
    Scope: affected module boundaries, source mapping and registry storage/validation.

    Command: npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; changed-file prettier --check; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
    Result: pass after bounded documented caller/import/evidence-marker fixes.
    Evidence: task36-checks/04.log and task36-final final passing gate logs. Strict gates unchanged, pinned vendor links restored. Original upstream symbol inventories exhaustive for actual local declarations. New capability CAP-964432b0-3954-4bba-8b5c-c58d4038a982, exact existing SAL and new SVL runtime/provenance records; broad semantic/default/contract flags remain unverified. CALC-035 records only a source-level suspicious Lithuanian condition, explicitly awaiting actual service reproduction. Doctor0 errors/two inherited warnings; tracked diff intentional in branchcalc.
    Scope: approved runtime/native fixture/test/common helper/inventory/core/journal/task artifacts. No Writer, branches, merges, network, policy or acceptance changes. EVALUATOR commit review and clean closure follow.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T16:14:33.523Z — VERIFY — ok

    By: CODER

    Note: All task36 original native and unchanged prior native captures, portable Calc106/shared8/tooling28, strict S/B/F/L100 positive complete sources and declared scoped gates passed; independent source/raw-state audit retained.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T16:14:33.059Z, excerpt_hash=sha256:2fd55ba2cd2c04d8c7cff33a8990921350467e47bbdf3b6df40b5c440006b8b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101555-J73K9F/blueprint/resolved-snapshot.json
    - old_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
    - current_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101555-J73K9F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101555-J73K9F
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-10T16:16:11.058Z — VERIFY — ok

    By: CODER

    Note: verified-202610101555-J73K9F
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T16:14:33.579Z, excerpt_hash=sha256:2fd55ba2cd2c04d8c7cff33a8990921350467e47bbdf3b6df40b5c440006b8b8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101555-J73K9F/blueprint/resolved-snapshot.json
    - old_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
    - current_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101555-J73K9F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610101555-J73K9F --result verified-202610101555-J73K9F --commit 949bc3fa00f9352b86d179be24ae42467ac1e7e4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "New forward task only to revert task36 comparison/key/native helper/registry/docs changes; rerun exact unchanged prior corpora and scoped gates. Never reset history or mutate upstream, Writer, policy or coverage acceptance. Ignored native output stays inside this repository and both links restored in finally."
  Findings: |-
    Preflight clean branchcalc; only unrelated C9TN6M/X6VV8G DOING. User persistent goal/continue authorizes safe local work. Original SharedStringPool requires actual CharClass uppercase through locale/Unicode casefold/ICU; no existing real common service is present, so implement its exact comparison/hash key closure first rather than inventing that service. Original StringWithHash uses OUString by value and std::move, cached signed32 hash before string equality and signed-to-size_t hash conversion. Full-header native compiler is available from verified task35. Read-only search returned no existing standalone map/charclass files; no source was mutated. Original casefolding conditional Lithuanian pos>len source condition was noticed but no reproduction yet; record only clearly scoped suspected behavior if documented, never claim a confirmed bug.

    - Observation: Native-prefix factoring script assumed a compact import line; actual formatted import is multiline, so discovery failed before writing either helper or probe.
      Impact: Runtime comparison/key changes remain; native task35 probe/helper are unchanged.
      Resolution: Use actual multiline import context, preserve exact original prefix/configuration bytes and verify existing driver164be221 before constructing new caller evidence.

    - Observation: Previous native process handle24453 is terminal/missing; process inventory confirms no surviving key/shared native compiler. New key caller reached invalid reference-binding diagnostic before its intended hash marker.
      Impact: No new fixture yet; missing handles are not live waits. Native invalid-input evidence must mark the actual operation before UB.
      Resolution: Resume bounded local native checks; use a concrete null field with an original unacquired reference and emit marker before invoking hashCode, without post-UB expected output.

    - Observation: First portable key replay used OUString.unacquired with an owner instead of the required pointer-field tuple; comparison failed before a snapshot. Initial optional registry reads used guessed flat paths; actual records are nested by source path.
      Impact: Test caller plumbing was invalid; no evidence of a runtime semantic mismatch. No threshold or source guard changes are needed.
      Resolution: Pass concrete nonowning pointer tuples for immediate borrowed queries; retain native captured outputs. Read actual rg-discovered nested records and rerun the complete affected corpus.

    - Observation: Lint identified obsolete mkdirSync import in the task35 native probe after factoring unchanged header configuration into the shared helper.
      Impact: One unused caller import; no runtime/native source or acceptance change.
      Resolution: Remove only the unused import and rerun lint with unchanged gates.

    - Observation: Whole-repo ESLint also scans ignored local evidence runners; the newly saved serial task36 runner lacked JSDoc for its run helper.
      Impact: Portable Calc/shared/tooling and typecheck already passed; failure concerns an ignored evidence script, not runtime behavior.
      Resolution: Document the local runner helper, keep lint rules unchanged, then resume remaining serial gates without rerunning passed tests.

    - Observation: Independent evidence audit guessed a collision numeric value2505 without checking the original hash length seed; assertion failed. Full native and portable comparisons had already passed.
      Impact: The audit-only hardcoded scalar was wrong, not the captured fixture or runtime algorithm.
      Resolution: Inspect the complete genuine collision snapshot, assert original observed equal-hash unequal-key outputs and verify raw captures/source hashes without duplicating an expected hash algorithm.

    - Observation: Source-provenance check rejected operator< and operator> markers because original OUString friend declarations contain a space after operator.
      Impact: Two inventory source-symbol spellings are inaccurate; original runtime and complete native evidence already match.
      Resolution: Use exact original relational friend marker spellings in both affected source inventories; retain strict provenance validation and resume pending gates.

    - Observation: Exact route task complete exited5 with commit subject is too generic after recording DONE, matching the installed deterministic-close defect in earlier Calc tasks.
      Impact: Runtime implementation, quality review and verification are persisted; final active-task README checkpoint remains dirty.
      Resolution: Recompute authoritative DONE route, attempt its exact close command once, and persist a descriptive task-only checkpoint if the same generated-subject validator failure recurs. No history reset or CLI/policy edits.

    - Observation: Exact recomputed ap commit --close --unstage-others again exited5 because its generated subject is too generic.
      Impact: DONE state is valid but deterministic artifact cleanup cannot complete through the generated subject.
      Resolution: Stage only the active task README and use the installed allowlisted ap commit with an explicit descriptive subject; verify authoritative DONE and clean branchcalc afterwards. Implementation and quality SHA remain unchanged.
extensions:
  implementation_commit:
    hash: "2e23eb26970ae92a197c663b2af639db56dee172"
    message: "✨ J73K9F port: original shared Unicode comparisons and cached pool key"
id_source: "generated"
---
## Summary

Task36 supplies the actual shared value-comparison/hash dependencies and complete original StringWithHash key owner used by SharedStringPool, required before real Calc text storage. Reuse shared SAL/SVL data and full native source ownership. Task5/10 after full31,next full41; whole Calc and actual pool/locale service remain unfinished.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Extend apps/office/src/sal/inc/rtl/ustring.ts with actual represented original OUString equals/hashCode/compareTo/reverseCompareTo, original equality/inequality/ordering adapters and OUStringHash functor; normal represented OUString/reference inputs, not unrelated conversions/ASCII casing/shortened search algorithms. Add complete original private StringWithHash struct at its actual svl/source/misc/sharedstringpool.ts owner, including native cached hash/equality/std::hash callback and implicit copy/move/assignment/destruction adapters. No synthetic SharedStringPool or CharClass declaration, no fake locale service/JS casing. Native script scripts/rtl-string-key-native-probe.mjs and portable fixture/test under svl/source/misc; reuse scripts/rtl-ustring-native-sources.mjs, factoring verified unchanged full-header configuration/lifetime prefix from existing scripts/rtl-sharedstring-native-probe.mjs into shared helpers if needed without changing its driver/corpus. Extend exhaustive shared runtime/provenance/capability records for actual modules, docs/program/calc-core.md and calc-upstream-suspected-issues.md only for genuinely identified native suspicious conditions, active task artifacts. No Writer/modules, network, merges, branches, policy/verification relaxations. Native64-bit size_t hash representation is explicit and broad native ABI/other targets remain unverified.

## Plan

1. Verify exact native full OUString header, StringWithHash anonymous struct/std::hash specialization and complete implicit-member behavior. Establish normal runtime/const-reference comparison/hash operators and same cached-key/default/lifetime rules. Actual locale/CharClass pipeline is a later required dependency, never substituted.
2. Port complete source-backed OUString represented comparisons/hash and real cached key with implicit special-member owners. Preserve signed32 hash and selected64-bit size_t casts, stale native cached-key behavior if a mutable caller changes fields, source pointer/counter order. Literal/copy/move/no-acquire data ownership stays in the single shared RTL owner. Explicit methods adapt C++ operators/rvalues/destructors only.
3. Reuse native full-header/type/config/RTL functions in a common probe helper without changing task35 driver164be221 or any4424 states/2 runtime guards/3 compile guards/3 diagnoses; prior task34 driver44ad48ef/3336/20 stays unchanged. Compile original unchanged key/hash/full-header classes, never hand-written C++ substitutes. Capture complete initialized owner/key/cache/refcount/data/events/results, all comparison outputs and signed/unsigned hash strings over real collisions/nonASCII/NUL/surrogate cases, moves/copies/assignment/self assignment and native destructor cleanup. Diagnose invalid native input separately without post-UB golden results.
4. Fill exhaustive original-symbol/runtime/provenance/capability inventories with Foundation/unverified broad status and clear representation/remaining-service gaps; update actual core roadmap/journal. No raw JS string identity/casing changes replace actual native keys.
5. Serial native --check for new and unchanged existing corpora; portable Calc and affected shared strict S/B/F/L100/all actual raw counters positive/complete source maps with both upstream symlinks absent and restored finally; affected source/registry/boundary tooling. Typecheck/lint/JSDoc/size/deps/tree/provenance/scoped inventories/changed-file format/routing/doctor/diff. Commit implementation, separate read-only EVALUATOR quality and task closure with clean branchcalc. No full suite until task41.

## Verify Steps

1. node scripts/rtl-string-key-native-probe.mjs --check: full pinned actual C++ headers/complete original key and hash source, all initialized pointer/cache/refcount/allocator/query snapshots and actual native diagnostics; exact full-file/scope/driver/output digests. node scripts/rtl-sharedstring-native-probe.mjs --check retains all4424 snapshots/2 runtime guards/3 compile guards/3 invalid diagnoses and driver164be221; node scripts/rtl-ustring-ownership-native-probe.mjs --check retains3336/20 and driver44ad48ef when shared extraction changes.
2. npm run test:coverage:calc: every actual Calc case, all-four100 and raw positive. Affected new/existing SAL/SVL string/key tests with exact executable source includes, all-four100 and actual source completeness; repeat portable checks with both original vendor links absent/restored in finally. Real native collisions/negative hashes/operator results and key ownership copy/move/destruction must be compared, no mirrored expected algorithm.
3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected module-boundary/source-provenance/registry tests; changed nongenerated file formatting; routing/ap doctor/git diff --check. Provenance/native checks require restored pinned sources; no concurrent removal. All pass without thresholds/assertions/exclusion/time-budget relaxation.
4. Read-only EVALUATOR checks actual implementation commit/source contracts/full digests/counters, no fake pool/CharClass or duplicate shared owner; records nonempty quality findings/evidence/risks. Task verify-show, CLI verification/quality/close pass and final DONE route/branchcalc/clean all tracked/untracked status. No whole run at task5/10; next scheduled41.

## Verification

Command: node scripts/rtl-string-key-native-probe.mjs --check
Result: pass.
Evidence:8143 complete native call snapshots,32 pinned full source/config/header blobs,32 unchanged dependency scopes. Driver ce4f99e056d9eeb680be3830d62597069aa5904b2b89350aaa45fbb3554c046c; full raw states2970e51a516928651ad651c8db0a5a5c7107836c15e236d6f9a7633ce593b12d. Original full C++ headers/private StringWithHash/std::hash compile with complete RTL lifetime dependencies. Valid ASan/UBSan output is identical; null-data unacquired hash diagnosed before UB with no defined expected result. Real [65,100]/[66,63] collision at call2353 returns equality0 and hashes5243/5243. Negative signed hashes produce exact unsigned64 witnesses above Number precision. Independent audit verifies every pinned blob via git show and every full state against raw native output.
Scope: original OUString represented comparisons/hash/operators and cached-key by-value/rvalue/copy/move/assignment/self assignment/destruction. No fake pool/casing/document owner.

Command: node scripts/rtl-sharedstring-native-probe.mjs --check; node scripts/rtl-ustring-ownership-native-probe.mjs --check
Result: pass.
Evidence: unchanged driver164be221 and all4424 complete states/2 runtime guards/3 compile guards/3 invalid diagnoses; unchanged driver44ad48ef and3336 states/20 guards. Shared native-header/lifetime factoring retains earlier original driver bytes and results.
Scope: actual existing shared lifetime dependencies; no native source-body edits or source version drift.

Command: npm run test:coverage:calc; exact affected SAL/SVL Vitest --coverage command in output/playwright/task36-checks/manifest.json
Result: pass.
Evidence: both original vendor links absent throughout portable runs, restored in finally. Calc106 tests/24 files,19 executable sources; S2920 B2055 F474 L2564 all100%. Affected shared8 tests/4 files,9 exact executable sources; S434 B214 F99 L353 all100%. Every raw s/f/b counter positive; executable source set complete; independent audit output/playwright/task36-audit.json. Portable full-state tests compare all8143 original snapshots without native sources.
Scope: Calc and affected shared owners only; no Writer coverage fixes or full-suite run. Task5/10 since full31; next full41.

Command: npx vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/registry-validation.test.ts
Result: pass.
Evidence:28 tests/4 files, upstream absent; full logs task36-checks/03.log.
Scope: affected module boundaries, source mapping and registry storage/validation.

Command: npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; changed-file prettier --check; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
Result: pass after bounded documented caller/import/evidence-marker fixes.
Evidence: task36-checks/04.log and task36-final final passing gate logs. Strict gates unchanged, pinned vendor links restored. Original upstream symbol inventories exhaustive for actual local declarations. New capability CAP-964432b0-3954-4bba-8b5c-c58d4038a982, exact existing SAL and new SVL runtime/provenance records; broad semantic/default/contract flags remain unverified. CALC-035 records only a source-level suspicious Lithuanian condition, explicitly awaiting actual service reproduction. Doctor0 errors/two inherited warnings; tracked diff intentional in branchcalc.
Scope: approved runtime/native fixture/test/common helper/inventory/core/journal/task artifacts. No Writer, branches, merges, network, policy or acceptance changes. EVALUATOR commit review and clean closure follow.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T16:14:33.523Z — VERIFY — ok

By: CODER

Note: All task36 original native and unchanged prior native captures, portable Calc106/shared8/tooling28, strict S/B/F/L100 positive complete sources and declared scoped gates passed; independent source/raw-state audit retained.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T16:14:33.059Z, excerpt_hash=sha256:2fd55ba2cd2c04d8c7cff33a8990921350467e47bbdf3b6df40b5c440006b8b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101555-J73K9F/blueprint/resolved-snapshot.json
- old_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
- current_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101555-J73K9F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101555-J73K9F
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-10T16:16:11.058Z — VERIFY — ok

By: CODER

Note: verified-202610101555-J73K9F
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T16:14:33.579Z, excerpt_hash=sha256:2fd55ba2cd2c04d8c7cff33a8990921350467e47bbdf3b6df40b5c440006b8b8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101555-J73K9F/blueprint/resolved-snapshot.json
- old_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
- current_digest: 3cd0ecd8b1cc9af393dfba30c17a6539ccfc0f3ffa758a87f4cd5673445073cc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101555-J73K9F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610101555-J73K9F --result verified-202610101555-J73K9F --commit 949bc3fa00f9352b86d179be24ae42467ac1e7e4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

New forward task only to revert task36 comparison/key/native helper/registry/docs changes; rerun exact unchanged prior corpora and scoped gates. Never reset history or mutate upstream, Writer, policy or coverage acceptance. Ignored native output stays inside this repository and both links restored in finally.

## Findings

Preflight clean branchcalc; only unrelated C9TN6M/X6VV8G DOING. User persistent goal/continue authorizes safe local work. Original SharedStringPool requires actual CharClass uppercase through locale/Unicode casefold/ICU; no existing real common service is present, so implement its exact comparison/hash key closure first rather than inventing that service. Original StringWithHash uses OUString by value and std::move, cached signed32 hash before string equality and signed-to-size_t hash conversion. Full-header native compiler is available from verified task35. Read-only search returned no existing standalone map/charclass files; no source was mutated. Original casefolding conditional Lithuanian pos>len source condition was noticed but no reproduction yet; record only clearly scoped suspected behavior if documented, never claim a confirmed bug.

- Observation: Native-prefix factoring script assumed a compact import line; actual formatted import is multiline, so discovery failed before writing either helper or probe.
  Impact: Runtime comparison/key changes remain; native task35 probe/helper are unchanged.
  Resolution: Use actual multiline import context, preserve exact original prefix/configuration bytes and verify existing driver164be221 before constructing new caller evidence.

- Observation: Previous native process handle24453 is terminal/missing; process inventory confirms no surviving key/shared native compiler. New key caller reached invalid reference-binding diagnostic before its intended hash marker.
  Impact: No new fixture yet; missing handles are not live waits. Native invalid-input evidence must mark the actual operation before UB.
  Resolution: Resume bounded local native checks; use a concrete null field with an original unacquired reference and emit marker before invoking hashCode, without post-UB expected output.

- Observation: First portable key replay used OUString.unacquired with an owner instead of the required pointer-field tuple; comparison failed before a snapshot. Initial optional registry reads used guessed flat paths; actual records are nested by source path.
  Impact: Test caller plumbing was invalid; no evidence of a runtime semantic mismatch. No threshold or source guard changes are needed.
  Resolution: Pass concrete nonowning pointer tuples for immediate borrowed queries; retain native captured outputs. Read actual rg-discovered nested records and rerun the complete affected corpus.

- Observation: Lint identified obsolete mkdirSync import in the task35 native probe after factoring unchanged header configuration into the shared helper.
  Impact: One unused caller import; no runtime/native source or acceptance change.
  Resolution: Remove only the unused import and rerun lint with unchanged gates.

- Observation: Whole-repo ESLint also scans ignored local evidence runners; the newly saved serial task36 runner lacked JSDoc for its run helper.
  Impact: Portable Calc/shared/tooling and typecheck already passed; failure concerns an ignored evidence script, not runtime behavior.
  Resolution: Document the local runner helper, keep lint rules unchanged, then resume remaining serial gates without rerunning passed tests.

- Observation: Independent evidence audit guessed a collision numeric value2505 without checking the original hash length seed; assertion failed. Full native and portable comparisons had already passed.
  Impact: The audit-only hardcoded scalar was wrong, not the captured fixture or runtime algorithm.
  Resolution: Inspect the complete genuine collision snapshot, assert original observed equal-hash unequal-key outputs and verify raw captures/source hashes without duplicating an expected hash algorithm.

- Observation: Source-provenance check rejected operator< and operator> markers because original OUString friend declarations contain a space after operator.
  Impact: Two inventory source-symbol spellings are inaccurate; original runtime and complete native evidence already match.
  Resolution: Use exact original relational friend marker spellings in both affected source inventories; retain strict provenance validation and resume pending gates.

- Observation: Exact route task complete exited5 with commit subject is too generic after recording DONE, matching the installed deterministic-close defect in earlier Calc tasks.
  Impact: Runtime implementation, quality review and verification are persisted; final active-task README checkpoint remains dirty.
  Resolution: Recompute authoritative DONE route, attempt its exact close command once, and persist a descriptive task-only checkpoint if the same generated-subject validator failure recurs. No history reset or CLI/policy edits.

- Observation: Exact recomputed ap commit --close --unstage-others again exited5 because its generated subject is too generic.
  Impact: DONE state is valid but deterministic artifact cleanup cannot complete through the generated subject.
  Resolution: Stage only the active task README and use the installed allowlisted ap commit with an explicit descriptive subject; verify authoritative DONE and clean branchcalc afterwards. Implementation and quality SHA remain unchanged.
