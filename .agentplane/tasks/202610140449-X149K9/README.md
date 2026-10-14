---
id: "202610140449-X149K9"
title: "Implement shared configuration modification paths and additions"
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
  updated_at: "2026-10-14T04:49:33.194Z"
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
    body: "Start: implement actual configuration modification/addition path responsibilities using existing shared value containers, preserve recursive prefix semantics and source-backed invalid-domain documentation under active goal approval."
events:
  -
    type: "status"
    at: "2026-10-14T04:49:38.465Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual configuration modification/addition path responsibilities using existing shared value containers, preserve recursive prefix semantics and source-backed invalid-domain documentation under active goal approval."
doc_version: 3
doc_updated_at: "2026-10-14T04:49:38.465Z"
doc_updated_by: "CODER"
description: "Task107: implement actual configmgr Modifications prefix tree and Additions path-list type, needed by real Data settings storage. Use existing shared sorted key/value container and ordinary JS references, no Boost/ownership/hash allocator port. Preserve original add/remove prefix behavior and record last-root recursion precondition issue. Calc/affected raw100, actual static/Calc0UI/16gates, no full office before111."
sections:
  Summary: "Task107 implements original shared configmgr modification-path prefix-tree operations and Additions path-list responsibility for actual Data settings storage, using existing shared ordered key/value values and JS GC."
  Scope: "Two new runtime files configmgr/source/modifications.ts and additions.ts, one source-backed modifications test, four shared runtime/provenance records, one shared capability, Calc core/GC/suspected-issues documents. Eleven planned non-task paths. Reuse unchanged SortedVector/LengthContentsCompare/ConfigEntry/OUString owners. Original unordered-map key membership, copied key values and stable child identity preserved via existing ordered key/value storage; native hash bucket/iteration permutation/allocator/STL ABI excluded. No new Boost/hash/refcount wrapper or fake settings Data/backend. Original ENABLE_DCONF clear body is represented as a logical value operation without enabling/providing DConf or claiming build-conditioned API availability parity."
  Plan: "Port original Modifications add/remove/empty/getRoot and inline conditional clear value body. Adapt nested Node as ModificationsNode plus Modifications.Node constructor binding; ordinary references and existing SortedVector with actual copied OUString/ConfigEntry values, native unspecified unordered traversal permutation not certified. Preserve prefix compression, duplicate identity, broader-leaf dominance, subtree replacement, recursive parent cleanup and stable root/member identity. Additions is original vector<vector<OUString>> type responsibility using native arrays; value-copy responsibilities remain with actual consumers, no container lifetime library. Record CALC-092: removal of sole root subtree recursively reaches empty-path native assertion/invalid release domain; preserve recursive algorithm without inventing a root stop guard or native outcome. Tests cover valid histories with a remaining root sibling, missing paths, UTF16 keys/alias copies, add empty and clear; no execution/claim for native invalid empty-remove path. WholeCalc and complete new Modifications plus unchanged SortedVector/config_map owners raw100 with actual relevant existing tests, source-absent static/Calc0UI/fourlinksrestored and16gates/exacthashes/separate same-agent EVAL/DONE/clean. No new C++ generator/native memory experiment/network or Writer-only repair. Goalactive until secondfull111/repairs pause."
  Verify Steps: |-
    1. Review pinned complete modifications.hxx/cxx and additions.hxx plus original consumers. Source-backed real-path histories verify broad-prefix dominance/redundant descendants, leaf-to-subtree replacement, duplicate/copy-key/child/root identity, missing/deep removal and recursive pruning with a remaining root sibling; empty add/clear reuse and UTF16 key membership. Preserve original recursive remove algorithm, document CALC-092, do not invent native empty-argument behavior or assertion/ABI/hash-order parity. Conditional clear value body represented without DConf backend/build claim.
    2. Whole source-absent Calc coverage and complete new modifications plus reused SortedVector/config_map profile using new tests and existing sorted/tree tests, rawS/B/F/L100/everyrawcounterpositive. Additions pure type has no executable counters. Actual source-absent static/Calc0UI and four exact link restoration. No Writer-only coverage repair or full office before111.
    3. All16 existing repo gates and current intentional formatting, truthful runtime/provenance/capability/GC/suspected issue records. No source/threshold weakening, fake backend/library, memory experiment or private-state counter forcing. Retain failures before bounded corrections.
    4. Exact3369baseline/current/committed non-task hashes and only11intentionalpaths; source/gate/coverage manifests bound to sourceSHA. Separate same-agent evaluator not independent review; APverify/DONE/clean branchcalc. Goalactive and secondfull111 pause after relevant repairs remains.
  Verification: "Pending implementation and actual current checks."
  Rollback Plan: "Finally restore four exact source links on all test exits. Revert only intentional task changes via a new task if needed; no branch merge/history rewrite/unrelated task changes."
  Findings: "Original Modifications::remove recursively calls remove(parent) when the immediate parent becomes empty. With the last root subtree this reaches an empty vector despite its assertion; preserve algorithm and document invalid native domain as CALC-092, not a defined no-op/crash/bug claim. Genuine consumer writemodfile explicitly sorts modification children, confirming hash iteration is storage detail there; other callback traversal order remains unverified. Existing shared ordered entries preserve key membership and stable values without porting Boost allocator/hash machinery. No fake Data/provider or copy/lifetime engine. Native DConf feature-conditioned availability and native bucket/iteration/ABI contracts are excluded."
id_source: "generated"
---
## Summary

Task107 implements original shared configmgr modification-path prefix-tree operations and Additions path-list responsibility for actual Data settings storage, using existing shared ordered key/value values and JS GC.

## Scope

Two new runtime files configmgr/source/modifications.ts and additions.ts, one source-backed modifications test, four shared runtime/provenance records, one shared capability, Calc core/GC/suspected-issues documents. Eleven planned non-task paths. Reuse unchanged SortedVector/LengthContentsCompare/ConfigEntry/OUString owners. Original unordered-map key membership, copied key values and stable child identity preserved via existing ordered key/value storage; native hash bucket/iteration permutation/allocator/STL ABI excluded. No new Boost/hash/refcount wrapper or fake settings Data/backend. Original ENABLE_DCONF clear body is represented as a logical value operation without enabling/providing DConf or claiming build-conditioned API availability parity.

## Plan

Port original Modifications add/remove/empty/getRoot and inline conditional clear value body. Adapt nested Node as ModificationsNode plus Modifications.Node constructor binding; ordinary references and existing SortedVector with actual copied OUString/ConfigEntry values, native unspecified unordered traversal permutation not certified. Preserve prefix compression, duplicate identity, broader-leaf dominance, subtree replacement, recursive parent cleanup and stable root/member identity. Additions is original vector<vector<OUString>> type responsibility using native arrays; value-copy responsibilities remain with actual consumers, no container lifetime library. Record CALC-092: removal of sole root subtree recursively reaches empty-path native assertion/invalid release domain; preserve recursive algorithm without inventing a root stop guard or native outcome. Tests cover valid histories with a remaining root sibling, missing paths, UTF16 keys/alias copies, add empty and clear; no execution/claim for native invalid empty-remove path. WholeCalc and complete new Modifications plus unchanged SortedVector/config_map owners raw100 with actual relevant existing tests, source-absent static/Calc0UI/fourlinksrestored and16gates/exacthashes/separate same-agent EVAL/DONE/clean. No new C++ generator/native memory experiment/network or Writer-only repair. Goalactive until secondfull111/repairs pause.

## Verify Steps

1. Review pinned complete modifications.hxx/cxx and additions.hxx plus original consumers. Source-backed real-path histories verify broad-prefix dominance/redundant descendants, leaf-to-subtree replacement, duplicate/copy-key/child/root identity, missing/deep removal and recursive pruning with a remaining root sibling; empty add/clear reuse and UTF16 key membership. Preserve original recursive remove algorithm, document CALC-092, do not invent native empty-argument behavior or assertion/ABI/hash-order parity. Conditional clear value body represented without DConf backend/build claim.
2. Whole source-absent Calc coverage and complete new modifications plus reused SortedVector/config_map profile using new tests and existing sorted/tree tests, rawS/B/F/L100/everyrawcounterpositive. Additions pure type has no executable counters. Actual source-absent static/Calc0UI and four exact link restoration. No Writer-only coverage repair or full office before111.
3. All16 existing repo gates and current intentional formatting, truthful runtime/provenance/capability/GC/suspected issue records. No source/threshold weakening, fake backend/library, memory experiment or private-state counter forcing. Retain failures before bounded corrections.
4. Exact3369baseline/current/committed non-task hashes and only11intentionalpaths; source/gate/coverage manifests bound to sourceSHA. Separate same-agent evaluator not independent review; APverify/DONE/clean branchcalc. Goalactive and secondfull111 pause after relevant repairs remains.

## Verification

Pending implementation and actual current checks.

## Rollback Plan

Finally restore four exact source links on all test exits. Revert only intentional task changes via a new task if needed; no branch merge/history rewrite/unrelated task changes.

## Findings

Original Modifications::remove recursively calls remove(parent) when the immediate parent becomes empty. With the last root subtree this reaches an empty vector despite its assertion; preserve algorithm and document invalid native domain as CALC-092, not a defined no-op/crash/bug claim. Genuine consumer writemodfile explicitly sorts modification children, confirming hash iteration is storage detail there; other callback traversal order remains unverified. Existing shared ordered entries preserve key membership and stable values without porting Boost allocator/hash machinery. No fake Data/provider or copy/lifetime engine. Native DConf feature-conditioned availability and native bucket/iteration/ABI contracts are excluded.
