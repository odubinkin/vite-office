---
id: "202611211633-5K6KHN"
title: "Refresh Graphify before task closure and after branch checkout"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Check shell syntax, routing policy, AgentPlane doctor, and README formatting."
  - "Exercise real branch checkouts and confirm the local graph reflects the checked-out source."
  - "Verify refresh runs before closeout, stops failed closeout, and introduce no post-commit hook."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:33:56.672Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-21T16:38:04.040Z"
  updated_by: "CODER"
  note: "Real Git checkouts updated the fixture graph in both directions. Ordinary commits and path checkouts skipped refresh. A simulated refresh failure prevented the closeout command, and success preserved its arguments. The installed hook refreshed the vite-office index, and SwDoc resolved to its source."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T16:34:01.860Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-21T16:38:04.040Z"
    author: "CODER"
    state: "ok"
    note: "Real Git checkouts updated the fixture graph in both directions. Ordinary commits and path checkouts skipped refresh. A simulated refresh failure prevented the closeout command, and success preserved its arguments. The installed hook refreshed the vite-office index, and SwDoc resolved to its source."
doc_version: 3
doc_updated_at: "2026-11-21T16:38:04.097Z"
doc_updated_by: "CODER"
description: "Run a shared local Graphify refresh before direct AgentPlane closeout and from a repository-local post-checkout hook. Verify checkout coverage and preserve existing hooks."
sections:
  Summary: |-
    Refresh Graphify before task closure and after branch checkout

    Run a shared local Graphify refresh before direct AgentPlane closeout and from a repository-local post-checkout hook. Verify checkout coverage and preserve existing hooks.
  Scope: |-
    - In scope: Run a shared local Graphify refresh before direct AgentPlane closeout and from a repository-local post-checkout hook. Verify checkout coverage and preserve existing hooks.
    - Out of scope: unrelated refactors not required for "Refresh Graphify before task closure and after branch checkout".
  Plan: "Add a repository-local Graphify refresh/closeout command and install a checkout-only hook without replacing AgentPlane hooks. Update AGENTS.md and README.md, preserve local-only indexing, and verify branch switches and closeout ordering."
  Verify Steps: |-
    1. Run sh -n on the script, node .agentplane/policy/check-routing.mjs, ap doctor, Prettier on README.md, and git diff --check.
    2. Install the post-checkout hook idempotently, preserve existing hooks, and verify a file checkout and ordinary commit do not update the graph.
    3. Switch between two refs with different indexed source, verify Graphify follows the branch contents, and restore the original branch.
    4. Verify the closeout wrapper passes arguments and never invokes AgentPlane on refresh failure. Use it to close this task after recording verification.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-21T16:38:04.040Z — VERIFY — ok

    By: CODER

    Note: Real Git checkouts updated the fixture graph in both directions. Ordinary commits and path checkouts skipped refresh. A simulated refresh failure prevented the closeout command, and success preserved its arguments. The installed hook refreshed the vite-office index, and SwDoc resolved to its source.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:34:01.860Z, excerpt_hash=sha256:de8d18c7f0477ab7b25328cc6786f7d0ca9133cc166753f8c7b3928bac5729bb

    Details:

    Checks passed: sh -n scripts/graphify-context.sh; node .agentplane/policy/check-routing.mjs; ap doctor (existing hook shim warning); prettier --check README.md; git diff --check; idempotent hook install and unchanged AgentPlane hook hashes; real Graphify checkout fixture; main checkout hook and real query. The final live closeout will use the repository wrapper after evaluation.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211633-5K6KHN/blueprint/resolved-snapshot.json
    - old_digest: 552dd94556a609abe8b08b37020960b2ebbfb9fd1537e382c28014d96efef08c
    - current_digest: 552dd94556a609abe8b08b37020960b2ebbfb9fd1537e382c28014d96efef08c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211633-5K6KHN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211633-5K6KHN
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the integration commit and remove only the installed vite-office post-checkout hook. Existing hooks and the local Graphify installation can be retained."
  Findings: ""
id_source: "generated"
---
## Summary

Refresh Graphify before task closure and after branch checkout

Run a shared local Graphify refresh before direct AgentPlane closeout and from a repository-local post-checkout hook. Verify checkout coverage and preserve existing hooks.

## Scope

- In scope: Run a shared local Graphify refresh before direct AgentPlane closeout and from a repository-local post-checkout hook. Verify checkout coverage and preserve existing hooks.
- Out of scope: unrelated refactors not required for "Refresh Graphify before task closure and after branch checkout".

## Plan

Add a repository-local Graphify refresh/closeout command and install a checkout-only hook without replacing AgentPlane hooks. Update AGENTS.md and README.md, preserve local-only indexing, and verify branch switches and closeout ordering.

## Verify Steps

1. Run sh -n on the script, node .agentplane/policy/check-routing.mjs, ap doctor, Prettier on README.md, and git diff --check.
2. Install the post-checkout hook idempotently, preserve existing hooks, and verify a file checkout and ordinary commit do not update the graph.
3. Switch between two refs with different indexed source, verify Graphify follows the branch contents, and restore the original branch.
4. Verify the closeout wrapper passes arguments and never invokes AgentPlane on refresh failure. Use it to close this task after recording verification.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-21T16:38:04.040Z — VERIFY — ok

By: CODER

Note: Real Git checkouts updated the fixture graph in both directions. Ordinary commits and path checkouts skipped refresh. A simulated refresh failure prevented the closeout command, and success preserved its arguments. The installed hook refreshed the vite-office index, and SwDoc resolved to its source.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:34:01.860Z, excerpt_hash=sha256:de8d18c7f0477ab7b25328cc6786f7d0ca9133cc166753f8c7b3928bac5729bb

Details:

Checks passed: sh -n scripts/graphify-context.sh; node .agentplane/policy/check-routing.mjs; ap doctor (existing hook shim warning); prettier --check README.md; git diff --check; idempotent hook install and unchanged AgentPlane hook hashes; real Graphify checkout fixture; main checkout hook and real query. The final live closeout will use the repository wrapper after evaluation.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211633-5K6KHN/blueprint/resolved-snapshot.json
- old_digest: 552dd94556a609abe8b08b37020960b2ebbfb9fd1537e382c28014d96efef08c
- current_digest: 552dd94556a609abe8b08b37020960b2ebbfb9fd1537e382c28014d96efef08c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211633-5K6KHN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211633-5K6KHN
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the integration commit and remove only the installed vite-office post-checkout hook. Existing hooks and the local Graphify installation can be retained.

## Findings
