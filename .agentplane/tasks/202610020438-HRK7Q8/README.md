---
id: "202610020438-HRK7Q8"
title: "Match comparator-equivalent child removal and callback ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T04:39:20.900Z"
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
    body: "Start: Correct comparator-equivalent stored-child removal with supplied-argument callback; validate actual document ownership, topology and notifications without upstream access in tests or source artifacts."
events:
  -
    type: "status"
    at: "2026-10-02T04:39:21.547Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Correct comparator-equivalent stored-child removal with supplied-argument callback; validate actual document ownership, topology and notifications without upstream access in tests or source artifacts."
doc_version: 3
doc_updated_at: "2026-10-02T04:51:56.282Z"
doc_updated_by: "CODER"
description: "Iteration 50: match pinned SwNumberTree RemoveChild selection, stored-node detachment/descendant transfer and supplied-argument PostRemove semantics. Keep existing document registry equivalence unchanged; cover actual document rule/registry ownership and retained topology with tests that never access upstream. No comparison helper sources in Agentplane artifacts; preserve deliberate deviations and avoid broad parity promotion."
sections:
  Summary: "Iteration 50 corrects comparator-equivalent RemoveChild selection and distinguishes the stored node from the supplied callback argument."
  Scope: "Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-removal.test.ts in the same directory; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent findings/verification bookkeeping only. Preserve registered IO/recovery deviations, existing expectations and gates; no module/status promotion."
  Plan: "Iteration50: fresh source/hash audit; RED/GREEN actual-document removal tests; GetIterator-based stored-child removal with supplied-argument PostRemove; four semantic files only, additive bounded provenance evidence; independent focused and unchanged full verification, same-actor quality, separate implementation commit and leaf close. No helper sources in Agentplane artifacts or upstream access in tests; parent/full goal stays open."
  Verify Steps: |-
    1. Pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh native file and selected symbol hashes plus manual control-flow conclusions cover sorted equivalence, stored-node detachment/transfer, predecessor/phantom prefix handling, and supplied PostRemove on found or missing real arguments. Existing document registry equivalence needs no implementation change. Evidence is source inspection, not a claim of new compiled native execution or full owner/lifetime parity.
    2. Planned RED and GREEN project tests prove first/middle/last equivalent arguments remove the stored node, preserve argument ownership/subtree, transfer descendants and invoke the correct callback, preserving rule client and numbered-registry effects. Include exact identity control, distinct-key miss and phantom no-op plus normal/reading notification behavior. Every prior test expectation remains unchanged.
    3. Focused tree suite passes while upstream path is temporarily unavailable and restored in finally; unchanged npm run verify passes all gates including both100% coverage. Routing and doctor have no new errors, source artifacts remain absent and diff is limited to the four semantic paths and task bookkeeping.
    4. Canonical verification and distinct same-actor EVALUATOR quality phase reference the actual implementation commit. Close leaf DONE with clean tracked/untracked state; parent/full goal remains open, no blanket parity promotion.
  Verification: "Command: npx vitest run src/sw/source/core/SwNumberTree/SwNumberTree-removal.test.ts from apps/office. Result: planned RED (7 failures under identity-only implementation) then GREEN (13 passed), with green-first.log and red-test.log retained. Added final raw-prefix/raw-counter assertions pass in the complete run. Scope: stored versus supplied record selection, first/middle/last predecessor/phantom descendants, argument subtree preservation, callback order, rule clients, numbered registry, reading suppression, missing and phantom contracts. Command: npm run verify. Result: pass, exit0; verify-final.log. Evidence: app747/167files, inventory109/36files, browser19; app10925 statements/8273 branches/2937 functions/10021lines and inventory1523/1080/384/1464 all100%; unchanged format/lint/types/dependencies/resources/build/static/docs/size/source-tree/provenance/invariant/parity gates. Command: all six tree suites from apps/office with vendor directory temporarily unavailable and restored in finally. Result:34 tests passed; focused-without-upstream.log. Command: native pin/file hash and exact metadata/diff inventory assertions. Result: pass; four files/nine symbol hashes in source-audit.json, only two bounded metadata rows and four semantic paths, no status/deviation/gate promotion or source/helper artifact bodies. Source evidence is manual inspection, not new compiled native execution or full native owner/lifetime parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass, doctor zero errors/two unchanged warnings. Actual post-bookkeeping implementation SHA, canonical verify, quality and close follow."
  Rollback Plan: "Revert the implementation commit if required, retaining task result/hash evidence and preserving source-artifact prohibitions."
  Findings: |-
    Current native RemoveChild selects pRemove through GetIterator and mutates that stored object; local RemoveChild currently uses children.indexOf(child). Native PostRemove belongs to supplied pChild after selection/notification, including a miss. Existing DocumentListItemsManager.removeListItem already uses comparator equivalence. Fresh inspection also preserves known native access/lifetime and wider lookup consumer obligations outside this leaf.

    - Observation: The first focused test command used a nonexistent vitest.config.ts; the subsequent log move used the wrong working directory. Neither command changed implementation; the corrected test runs from apps/office using its actual Vite configuration.
      Impact: Startup output is not behavioral RED evidence; only corrected focused test failures establish the regression.
      Resolution: Use npx vitest run from apps/office and record corrected RED/GREEN results; no acceptance or scope change.

    - Observation: Fresh symbol hashing initially assumed no newline between a qualified function name and opening parenthesis; SetLastValid uses a newline.
      Impact: The first hash extraction exited before writing source-audit.json; no source bodies or helper scripts were saved.
      Resolution: Use whitespace-aware qualified-symbol lookup; the final audit contains four file hashes and nine symbol hashes, revalidated against the unchanged pin.

    - Observation: Next measured source-contract gap: pinned SwNumberTree.hxx:417 declares protected GetNumberVector_(vector,bool bValidate=true); SwNumberTree.cxx:295 forwards bValidate through parent recursion and GetNumber. Local protected helper currently has only the vector argument and always validates.
      Impact: Public validating vectors remain unchanged, but the already implemented protected vector-helper contract lacks the upstream nonvalidating raw-cache path.
      Resolution: Keep this separate from RemoveChild. Next leaf must measure explicit false/default true, recursive ancestor/cache preservation and type contracts using project-owned fixtures; wider goal remains open.
id_source: "generated"
---
## Summary

Iteration 50 corrects comparator-equivalent RemoveChild selection and distinguishes the stored node from the supplied callback argument.

## Scope

Four semantic paths: apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts; new SwNumberTree-removal.test.ts in the same directory; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Active leaf and parent findings/verification bookkeeping only. Preserve registered IO/recovery deviations, existing expectations and gates; no module/status promotion.

## Plan

Iteration50: fresh source/hash audit; RED/GREEN actual-document removal tests; GetIterator-based stored-child removal with supplied-argument PostRemove; four semantic files only, additive bounded provenance evidence; independent focused and unchanged full verification, same-actor quality, separate implementation commit and leaf close. No helper sources in Agentplane artifacts or upstream access in tests; parent/full goal stays open.

## Verify Steps

1. Pin equals 9bc445578031fecf56086729d8e4940c77e14d65. Fresh native file and selected symbol hashes plus manual control-flow conclusions cover sorted equivalence, stored-node detachment/transfer, predecessor/phantom prefix handling, and supplied PostRemove on found or missing real arguments. Existing document registry equivalence needs no implementation change. Evidence is source inspection, not a claim of new compiled native execution or full owner/lifetime parity.
2. Planned RED and GREEN project tests prove first/middle/last equivalent arguments remove the stored node, preserve argument ownership/subtree, transfer descendants and invoke the correct callback, preserving rule client and numbered-registry effects. Include exact identity control, distinct-key miss and phantom no-op plus normal/reading notification behavior. Every prior test expectation remains unchanged.
3. Focused tree suite passes while upstream path is temporarily unavailable and restored in finally; unchanged npm run verify passes all gates including both100% coverage. Routing and doctor have no new errors, source artifacts remain absent and diff is limited to the four semantic paths and task bookkeeping.
4. Canonical verification and distinct same-actor EVALUATOR quality phase reference the actual implementation commit. Close leaf DONE with clean tracked/untracked state; parent/full goal remains open, no blanket parity promotion.

## Verification

Command: npx vitest run src/sw/source/core/SwNumberTree/SwNumberTree-removal.test.ts from apps/office. Result: planned RED (7 failures under identity-only implementation) then GREEN (13 passed), with green-first.log and red-test.log retained. Added final raw-prefix/raw-counter assertions pass in the complete run. Scope: stored versus supplied record selection, first/middle/last predecessor/phantom descendants, argument subtree preservation, callback order, rule clients, numbered registry, reading suppression, missing and phantom contracts. Command: npm run verify. Result: pass, exit0; verify-final.log. Evidence: app747/167files, inventory109/36files, browser19; app10925 statements/8273 branches/2937 functions/10021lines and inventory1523/1080/384/1464 all100%; unchanged format/lint/types/dependencies/resources/build/static/docs/size/source-tree/provenance/invariant/parity gates. Command: all six tree suites from apps/office with vendor directory temporarily unavailable and restored in finally. Result:34 tests passed; focused-without-upstream.log. Command: native pin/file hash and exact metadata/diff inventory assertions. Result: pass; four files/nine symbol hashes in source-audit.json, only two bounded metadata rows and four semantic paths, no status/deviation/gate promotion or source/helper artifact bodies. Source evidence is manual inspection, not new compiled native execution or full native owner/lifetime parity. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: pass, doctor zero errors/two unchanged warnings. Actual post-bookkeeping implementation SHA, canonical verify, quality and close follow.

## Rollback Plan

Revert the implementation commit if required, retaining task result/hash evidence and preserving source-artifact prohibitions.

## Findings

Current native RemoveChild selects pRemove through GetIterator and mutates that stored object; local RemoveChild currently uses children.indexOf(child). Native PostRemove belongs to supplied pChild after selection/notification, including a miss. Existing DocumentListItemsManager.removeListItem already uses comparator equivalence. Fresh inspection also preserves known native access/lifetime and wider lookup consumer obligations outside this leaf.

- Observation: The first focused test command used a nonexistent vitest.config.ts; the subsequent log move used the wrong working directory. Neither command changed implementation; the corrected test runs from apps/office using its actual Vite configuration.
  Impact: Startup output is not behavioral RED evidence; only corrected focused test failures establish the regression.
  Resolution: Use npx vitest run from apps/office and record corrected RED/GREEN results; no acceptance or scope change.

- Observation: Fresh symbol hashing initially assumed no newline between a qualified function name and opening parenthesis; SetLastValid uses a newline.
  Impact: The first hash extraction exited before writing source-audit.json; no source bodies or helper scripts were saved.
  Resolution: Use whitespace-aware qualified-symbol lookup; the final audit contains four file hashes and nine symbol hashes, revalidated against the unchanged pin.

- Observation: Next measured source-contract gap: pinned SwNumberTree.hxx:417 declares protected GetNumberVector_(vector,bool bValidate=true); SwNumberTree.cxx:295 forwards bValidate through parent recursion and GetNumber. Local protected helper currently has only the vector argument and always validates.
  Impact: Public validating vectors remain unchanged, but the already implemented protected vector-helper contract lacks the upstream nonvalidating raw-cache path.
  Resolution: Keep this separate from RemoveChild. Next leaf must measure explicit false/default true, recursive ancestor/cache preservation and type contracts using project-owned fixtures; wider goal remains open.
