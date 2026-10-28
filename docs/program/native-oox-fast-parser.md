# Native OOXML FastParser wrapper

The original oox::FastParser wrapper now owns the existing FastSaxParser and
FastTokenHandler. It registers the transitional namespace first and the strict
namespace only when present and different. Unknown IDs and repeated registration
retain the actual IllegalArgumentException contract.

The InputSource overload retains an independent Reference in
InputStreamCloseGuard before parsing. Its pinned header default is false, so the
wrapper normally leaves the stream open. An explicit true closes on success or
exception unwind; the guard catches and destroys actual UNO Exception values
from closeInput, then releases its stream Reference. Replacing the caller's
InputSource during callbacks does not change which stream the guard closes.
The input/name overload creates a real InputSource, assigns its system ID and
stream, and delegates with the same false default.

Document/token receivers still bind the existing consumed host SAX contracts;
this wrapper does not advertise complete XFastDocumentHandler/XFastTokenHandler
UNO component identity. The native null-parser guards are unreachable after
successful construction with the current direct owner. Access after explicit
owner destruction is outside the supported lifetime. The StorageBase overload
awaits the genuine storage input contract; no duck storage/service provider is
introduced. Native ABI, native exception termination semantics for unrelated host
errors, constructor failure unwind and synchronization remain unverified.

The package layer still returns byte arrays and XmlFilterBase still uses its
expanded-name host receiver. Migrating those owners and the full DOCX/XLSX
model/filter/Worker/UI paths remains required. This checkpoint provides their
source-backed parser wrapper and stream-close contract, without claiming that
package or application integration is complete. Existing browser open/save,
autosave and recovery choices remain unchanged.

Verification passes nine focused tests with unchanged whole-file coverage100:
statements 37/37, branches 15/15, functions 9/9 and lines 34/34. Related package
and SAX tests pass 24 scenarios, boundary/provenance tooling seven and Writer
resource validation two. Typecheck, build, static build smoke and required
module/source/registry/resource checks pass. This does not supersede the previous
broader SAX coverage failure or verify complete DOCX/XLSX acceptance.
