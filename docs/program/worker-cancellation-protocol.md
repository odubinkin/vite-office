# Browser worker request cancellation protocol

The worker protocol is a browser-independent message contract. It defines
version-one serializable request, result, and cancellation messages, plus an
immutable client state with a monotonic request ID. A result is `accepted` only
when it belongs to the latest active request; older results are `stale`, and
cancelled IDs always classify as `cancelled`.

This module deliberately does not spawn a Worker, transfer data, schedule work,
terminate workers, show progress UI, parse files, or render documents. A later
runtime task must adapt the contract to `Worker.postMessage`, transferables,
errors, timeout policy, and lifecycle handling. Protocol version changes must
remain compatible with stored messages and have explicit migration tests.
