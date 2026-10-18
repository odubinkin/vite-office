---
id: "202610182130-SKT4XD"
title: "Port Calc native cell pattern ownership and item-set contracts for formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Whole Calc raw100percent four metrics;new source-backed pattern/helper/holder tests including schema/invalid/copy/equality/conditional/default/key/lifecycle and related SVL item-set tests pass. Types/build,source resource checks,touched style,boundary/docs/size/tree/provenance,Calc/shared inventories,doctor/routing pass. Full regression at task20."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T21:30:24.462Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T21:39:52.835Z"
  updated_by: "CODER"
  note: "Verified native Calc pattern/helper/holder prerequisite:298Calc tests at raw100percent S/B/F/L,76relatedSVL cases,12source/resource and2Writer freshness cases,alldeclaredtypes/build/style/source/provenance/scopedgates pass. Exact evidence and omitted native services recorded in verification.md. No UI parity or new enabled formatting slots claimed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T21:40:35.636Z"
  updated_by: "EVALUATOR"
  note: "Reviewed source-owned Calc pattern data and canonical holder prerequisite against pinned native contracts."
  evaluated_sha: "98a921b25bf7c7c1cdd4656429562aabe6b5c136"
  blueprint_digest: "978c7d2e68b1f84e0779f4e0d1c2ec8d634f617902f65c6f3ebe96e7600a1b2d"
  evidence_refs:
    - ".agentplane/tasks/202610182130-SKT4XD/README.md"
    - ".agentplane/tasks/202610182130-SKT4XD/quality/20261018-214035636-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610182130-SKT4XD/quality/20261018-214035636-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610182130-SKT4XD/quality/20261018-214035636-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610182130-SKT4XD/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610182130-SKT4XD/verification.md"
    - ".agentplane/tasks/202610182130-SKT4XD/calc-coverage-final.log"
    - "docs/program/calc-pattern-attributes.md"
  findings:
    - "Implementation98a921b25 preserves fixed100..155 schema,PutSet(false) INVALID state,style-name snapshots,pool/parent equality,conditional SET precedence,canonical registration identity and native holder release/copy/move order. Original self-copy clearing is explicitly pinned rather than silently normalized. Tests use actual shared Sfx values. All298Calc cases have raw100percent across four metrics;76relatedSVL cases,12source/resource and2freshness cases plus declared types/build/gates pass.13non-task paths remain within approved scope;no fake document/font/default/UI handlers were introduced."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement source-owned Calc pattern itemsets and canonical helper/holder lifecycle as the required formatting prerequisite;no fake document pool or defaults."
events:
  -
    type: "status"
    at: "2026-10-18T21:30:43.236Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-owned Calc pattern itemsets and canonical helper/holder lifecycle as the required formatting prerequisite;no fake document pool or defaults."
  -
    type: "verify"
    at: "2026-10-18T21:39:52.835Z"
    author: "CODER"
    state: "ok"
    note: "Verified native Calc pattern/helper/holder prerequisite:298Calc tests at raw100percent S/B/F/L,76relatedSVL cases,12source/resource and2Writer freshness cases,alldeclaredtypes/build/style/source/provenance/scopedgates pass. Exact evidence and omitted native services recorded in verification.md. No UI parity or new enabled formatting slots claimed."
doc_version: 3
doc_updated_at: "2026-10-18T21:39:52.888Z"
doc_updated_by: "CODER"
description: "Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network."
sections:
  Summary: |-
    Port Calc native cell pattern ownership and item-set contracts for formatting

    Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
  Scope: |-
    - In scope: Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
    - Out of scope: unrelated refactors not required for "Port Calc native cell pattern ownership and item-set contracts for formatting".
  Plan: "1.CODER ports native patattr data owners and header at original paths:actual SfxItemSet schema,INVALID copy,style-name snapshots,conditional precedence,equality,mutation/key,selected-item filtering. Helper/holder implement source registration identity and lifecycle;JS-managed references erase physical allocation and hash-prefilter optimization,not canonical value identity. ScGlobal/style/document-pool/VCL services remain explicitly unavailable. 2.CODER tests literal pinned source contracts and all current represented branches against actual shared item/pool values;records real formatting resource context. 3.CODER runs all Calc raw100percent plus related SVL checks/types/build/source/gates and records quality/closeout. Up to25 non-task paths including native core/header/schema,tests,registry/capability evidence and source tests. Existing explicit user goal approval applies. No UI-only fake defaults/slots. Task18;full regression at20."
  Verify Steps: "npm run test:coverage:calc raw100percent statements/branches/functions/lines. Native pattern/helper/holder fixtures cover fixed100..155 ranges,invalid/disabled state,copy and value isolation,style names,pool identity,conditional precedence,parent/default lookup,key/canonical registration/holder lifecycle,DeleteUnchanged and zero-terminated item lists,unsupported-precondition rejection. Related existing SVL item-set/pool tests pass. Source tests pin actual patattr/schema and formatobjectbar native cell context. App/tools types/build,Calc/Writer resource freshness,touched style,dependencies/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full regression next task20."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T21:39:52.835Z — VERIFY — ok

    By: CODER

    Note: Verified native Calc pattern/helper/holder prerequisite:298Calc tests at raw100percent S/B/F/L,76relatedSVL cases,12source/resource and2Writer freshness cases,alldeclaredtypes/build/style/source/provenance/scopedgates pass. Exact evidence and omitted native services recorded in verification.md. No UI parity or new enabled formatting slots claimed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:39:52.342Z, excerpt_hash=sha256:eaab8bbbfcfbe4719872407d53dab48d99892da54aed204e137a8a72031a737c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182130-SKT4XD/blueprint/resolved-snapshot.json
    - old_digest: 978c7d2e68b1f84e0779f4e0d1c2ec8d634f617902f65c6f3ebe96e7600a1b2d
    - current_digest: 978c7d2e68b1f84e0779f4e0d1c2ec8d634f617902f65c6f3ebe96e7600a1b2d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610182130-SKT4XD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610182130-SKT4XD -m 🧩 SKT4XD task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this native pattern prerequisite task and its registry/test artifacts;preserve existing Calc UI and user changes. No branch reset or merge."
  Findings: |-
    Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: calc-coverage-final.log;111files,298cases. Raw statements6813/6813,branches4376/4376,functions1408/1408,lines6104/6104;100percent all four metrics. No thresholds or exclusions changed.
    Scope: whole current Calc runtime including new native pattern/helper/holder owners and current editable/browser/file/history slice. Five new pattern tests cover actual shared pools/itemsets,100..155 schema,INVALID/disabled handling,style-name UTF16 value copies including embedded zero/surrogates and empty-vs-absent names,pool/parent identity,conditional SET/default/inherited precedence,selection delta reduction,zero-terminated IDs,canonical registration cache/group identity,keys,adoption/release,copy/self-copy/move-swap and native invalid preconditions.

    Command: npm exec --workspace @vite-office/office -- vitest run itemset.test itemset-equality native-itemset-set-holder native-itempool --maxWorkers=4 --reporter=dot
    Result: pass
    Evidence: related.log;4files,76cases.
    Scope: actual existing SVL pool/itemset and holder/state/equality contracts used by Calc;no shared implementation changes or replacement providers.

    Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
    Result: pass
    Evidence: types-complete.log,build-final.log,source.log,calc-resources.log,writer-resources.log. 12source/resource cases plus2Writer freshness cases. Native patattr/schema/INVALID/move/copy/conditional code is pinned;ordinary formatobjectbar resource is distinguished from text-context textobjectbar. Existing generated resources remain unchanged. Existing bundle-size warning remains.
    Scope: genuine original source contracts and all application/tools build/type boundaries. New kernel dependency is not yet mounted;no new rendered controls,default fonts or enabled formatting slots are claimed.

    Command: node .agentplane/tasks/202610182130-SKT4XD/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: style-verified.log,dependencies.log,docs-verified.log,size-final.log,tree.log,provenance-verified.log,inventory-calc-final.log,inventory-shared-final.log,doctor.log,routing.log. 13intentional non-task paths;851runtime sources,3701relative imports,124allowed edges;852provenance modules (735mapped/99browser/18infrastructure). Both scoped semanticViolationCount0. Inventory final logs explicitly summarize successful output and its SHA256 while omitting bulk record arrays;they do not claim whole Calc parity. Doctor OK with existing managed hook readiness warning;routing OK.
    Scope: actual core/header/schema/capability/provenance ownership and documentation,with all broader native services explicitly unported.

    Findings: Initial fixtures incorrectly passed JS strings to genuine native OUString;fixed fixtures to use actual known-length UTF16 construction,including embedded zero. Native private friendship is bound by literal-key access,keeping helper methods private;initial casts were incomplete and compiler caught them. Prettier line wrapping exposed two no-unexpected-multiline errors;local helper variables resolve them without changing native ownership order. Added required callback JSDoc. Initial isolated pattern run passed5cases but branch coverage exposed the untested static GetItem optional-default call;added the real static invocation,without excluding it. Initial registry validation required nonempty docs/original-test references;added a precise permanent native-pattern document and explicitly unexecuted original QA context. All final checks pass. These repairs preserve approved scope and criteria.

    Native scope: Pattern uses source fixed itemset range and PutSet(false) with actual shared state/value owners. Helper retains native name-group and last-hit canonical search;the hash prefilter is an omitted physical search optimization,full pattern equality still governs identity. Logical holder counts retain native observable registration/key/release semantics;no allocator/refcount framework is introduced. GC replaces physical deletion. Only original unnamed pre-ScGlobal-initialization default branch is represented. Style resolution,initialized Standard resources,ScDocumentPool/document/attrarray/column integration,VCL font/number/visibility/hash caches and formatting execution remain absent. Original holder self-copy clears;move assignment swaps,as pinned source code states. Invalid native preconditions receive host errors rather than any native debug/ABI equivalence claim. Original C++ QA is context only.

    Cadence: UI task18. Full suite was completed/repaired at task10;next full regression task20. Overall Calc UI goal remains active;remaining-ui-audit.md preserves formatting/document prerequisites. No UI/browser behavior changed in this kernel-only task;no new browser scenario was required by its approved Verify Steps.
id_source: "generated"
---
## Summary

Port Calc native cell pattern ownership and item-set contracts for formatting

Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.

## Scope

- In scope: Approved UI goal task18: implement actual CellAttributeHelper,CellAttributeHolder and ScPatternAttr data/ownership subset at native patattr boundaries over existing shared SfxItemPool/SfxItemSet. Preserve 100..155 schema,INVALID selection states,copy/style-name/conditional precedence,key and holder semantics. No fabricated document pool,font defaults,style sheet,rendering or enabled formatting slots. Correct source formatting resource audit:cell context uses formatobjectbar,not textobjectbar. Work only calc checkout/branch;no network.
- Out of scope: unrelated refactors not required for "Port Calc native cell pattern ownership and item-set contracts for formatting".

## Plan

1.CODER ports native patattr data owners and header at original paths:actual SfxItemSet schema,INVALID copy,style-name snapshots,conditional precedence,equality,mutation/key,selected-item filtering. Helper/holder implement source registration identity and lifecycle;JS-managed references erase physical allocation and hash-prefilter optimization,not canonical value identity. ScGlobal/style/document-pool/VCL services remain explicitly unavailable. 2.CODER tests literal pinned source contracts and all current represented branches against actual shared item/pool values;records real formatting resource context. 3.CODER runs all Calc raw100percent plus related SVL checks/types/build/source/gates and records quality/closeout. Up to25 non-task paths including native core/header/schema,tests,registry/capability evidence and source tests. Existing explicit user goal approval applies. No UI-only fake defaults/slots. Task18;full regression at20.

## Verify Steps

npm run test:coverage:calc raw100percent statements/branches/functions/lines. Native pattern/helper/holder fixtures cover fixed100..155 ranges,invalid/disabled state,copy and value isolation,style names,pool identity,conditional precedence,parent/default lookup,key/canonical registration/holder lifecycle,DeleteUnchanged and zero-terminated item lists,unsupported-precondition rejection. Related existing SVL item-set/pool tests pass. Source tests pin actual patattr/schema and formatobjectbar native cell context. App/tools types/build,Calc/Writer resource freshness,touched style,dependencies/docs/size/tree/provenance,scopedCalc/shared inventories,doctor/routing pass. Full regression next task20.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T21:39:52.835Z — VERIFY — ok

By: CODER

Note: Verified native Calc pattern/helper/holder prerequisite:298Calc tests at raw100percent S/B/F/L,76relatedSVL cases,12source/resource and2Writer freshness cases,alldeclaredtypes/build/style/source/provenance/scopedgates pass. Exact evidence and omitted native services recorded in verification.md. No UI parity or new enabled formatting slots claimed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T21:39:52.342Z, excerpt_hash=sha256:eaab8bbbfcfbe4719872407d53dab48d99892da54aed204e137a8a72031a737c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610182130-SKT4XD/blueprint/resolved-snapshot.json
- old_digest: 978c7d2e68b1f84e0779f4e0d1c2ec8d634f617902f65c6f3ebe96e7600a1b2d
- current_digest: 978c7d2e68b1f84e0779f4e0d1c2ec8d634f617902f65c6f3ebe96e7600a1b2d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610182130-SKT4XD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610182130-SKT4XD -m 🧩 SKT4XD task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this native pattern prerequisite task and its registry/test artifacts;preserve existing Calc UI and user changes. No branch reset or merge.

## Findings

Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage-final.log;111files,298cases. Raw statements6813/6813,branches4376/4376,functions1408/1408,lines6104/6104;100percent all four metrics. No thresholds or exclusions changed.
Scope: whole current Calc runtime including new native pattern/helper/holder owners and current editable/browser/file/history slice. Five new pattern tests cover actual shared pools/itemsets,100..155 schema,INVALID/disabled handling,style-name UTF16 value copies including embedded zero/surrogates and empty-vs-absent names,pool/parent identity,conditional SET/default/inherited precedence,selection delta reduction,zero-terminated IDs,canonical registration cache/group identity,keys,adoption/release,copy/self-copy/move-swap and native invalid preconditions.

Command: npm exec --workspace @vite-office/office -- vitest run itemset.test itemset-equality native-itemset-set-holder native-itempool --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;4files,76cases.
Scope: actual existing SVL pool/itemset and holder/state/equality contracts used by Calc;no shared implementation changes or replacement providers.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: types-complete.log,build-final.log,source.log,calc-resources.log,writer-resources.log. 12source/resource cases plus2Writer freshness cases. Native patattr/schema/INVALID/move/copy/conditional code is pinned;ordinary formatobjectbar resource is distinguished from text-context textobjectbar. Existing generated resources remain unchanged. Existing bundle-size warning remains.
Scope: genuine original source contracts and all application/tools build/type boundaries. New kernel dependency is not yet mounted;no new rendered controls,default fonts or enabled formatting slots are claimed.

Command: node .agentplane/tasks/202610182130-SKT4XD/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: style-verified.log,dependencies.log,docs-verified.log,size-final.log,tree.log,provenance-verified.log,inventory-calc-final.log,inventory-shared-final.log,doctor.log,routing.log. 13intentional non-task paths;851runtime sources,3701relative imports,124allowed edges;852provenance modules (735mapped/99browser/18infrastructure). Both scoped semanticViolationCount0. Inventory final logs explicitly summarize successful output and its SHA256 while omitting bulk record arrays;they do not claim whole Calc parity. Doctor OK with existing managed hook readiness warning;routing OK.
Scope: actual core/header/schema/capability/provenance ownership and documentation,with all broader native services explicitly unported.

Findings: Initial fixtures incorrectly passed JS strings to genuine native OUString;fixed fixtures to use actual known-length UTF16 construction,including embedded zero. Native private friendship is bound by literal-key access,keeping helper methods private;initial casts were incomplete and compiler caught them. Prettier line wrapping exposed two no-unexpected-multiline errors;local helper variables resolve them without changing native ownership order. Added required callback JSDoc. Initial isolated pattern run passed5cases but branch coverage exposed the untested static GetItem optional-default call;added the real static invocation,without excluding it. Initial registry validation required nonempty docs/original-test references;added a precise permanent native-pattern document and explicitly unexecuted original QA context. All final checks pass. These repairs preserve approved scope and criteria.

Native scope: Pattern uses source fixed itemset range and PutSet(false) with actual shared state/value owners. Helper retains native name-group and last-hit canonical search;the hash prefilter is an omitted physical search optimization,full pattern equality still governs identity. Logical holder counts retain native observable registration/key/release semantics;no allocator/refcount framework is introduced. GC replaces physical deletion. Only original unnamed pre-ScGlobal-initialization default branch is represented. Style resolution,initialized Standard resources,ScDocumentPool/document/attrarray/column integration,VCL font/number/visibility/hash caches and formatting execution remain absent. Original holder self-copy clears;move assignment swaps,as pinned source code states. Invalid native preconditions receive host errors rather than any native debug/ABI equivalence claim. Original C++ QA is context only.

Cadence: UI task18. Full suite was completed/repaired at task10;next full regression task20. Overall Calc UI goal remains active;remaining-ui-audit.md preserves formatting/document prerequisites. No UI/browser behavior changed in this kernel-only task;no new browser scenario was required by its approved Verify Steps.
