---
id: "202611211633-5K6KHN"
title: "Refresh Graphify before task closure and after branch checkout"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
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
doc_version: 3
doc_updated_at: "2026-11-21T16:34:01.860Z"
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the integration commit and remove only the installed vite-office post-checkout hook. Existing hooks and the local Graphify installation can be retained.

## Findings
