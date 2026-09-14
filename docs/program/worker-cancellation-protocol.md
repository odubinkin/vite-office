# Browser worker request cancellation protocol

The shared version-one protocol defines structured-clone request, progress,
result, error, and cancellation envelopes. Client state assigns monotonic request
IDs. A response is accepted only for the latest non-cancelled ID; older IDs are
stale and can never mutate the active document.

Writer ODT import/export uses this contract through a restartable Dedicated
Worker. Import transfers a copied `ArrayBuffer`, preserving the caller's selected
bytes, and export transfers the exact result buffer back to the main thread.
Payloads contain only package bytes, suite-neutral metadata, or a versioned Writer
snapshot. Browser, React, `SwDoc`, and `Error` objects never cross the boundary.

The client permits one current request. Starting a newer request rejects the old
one as stale. AbortSignal cancellation, explicit cancellation, a 30-second
timeout, transport failure, and protocol failure reject the pending promise and
terminate the current worker. Termination is required because SAX parsing and ZIP
serialization contain synchronous regions that cannot observe a queued cancel
message. A later operation lazily creates a fresh worker; closing the document
session terminates it permanently.

The worker reports deterministic import/export stages and returns stable error
categories: `cancelled`, `format`, `internal`, `protocol`, `resource`, `stale`,
`timeout`, or `unsupported`. `SwDocShell` additionally guards every import with a
main-thread generation and restores the returned snapshot before atomically
replacing the active `SwDoc`. Consequently, late, cancelled, malformed, and failed
results leave document content, selection, and undo history unchanged.

Protocol version changes must remain compatible with accepted messages or receive
explicit migration tests before the version constant changes.
