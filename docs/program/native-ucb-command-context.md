# Native UCB command context

CommandEnvironment, its private implementation and original named base retain
genuine CPPU ownership. Constructor inputs and getter results own independent
References. Private fields are destroyed progress first, then interaction. Empty
fields remain empty, without a manufactured handler or service.

ActiveDataSink keeps the original plugged stream reference. Replacement, getter
copies and destruction do not close or read streams. Both original qadevOOo
ifc.io._XActiveDataSink method bodies are ported against the actual component and
a genuine MemoryInputStream relation. The external office service harness is not
claimed to be reproduced.

InteractionRequest owns selection, actual Any payload and native Sequence in
source declaration order. The public constructor copies the by-value Any
parameter before the private implementation moves it into the payload member;
selection, payload and sequence initialize in their original order. Four basic continuations use ImplInheritanceHelper
and the original empty marker interfaces. Their base advertises only its actual
WeakImplHelper interfaces and borrows its parent request. Acquired continuations
do not retain that parent; tests do not select after parent destruction. This
source lifetime condition is recorded as CALC-534/WRITER468.

SimpleInteractionRequest preserves Abort/Retry/Approve/Disapprove construction
and query order, source flag values, zero-mask diagnostic behavior and unknown
selection fallback. The std::vector pointer view borrows actual Reference fields
and the existing Sequence constructor copies/acquires them. The source default
request constructor is protected; combined optional JS constructor visibility is
erased here, without a claim of full native C++ access-control or ABI parity.

Ten complete SDK declarations use existing normal CPPU static type factories and
original direct bases. Tests cover metadata, typed-null Any transport, genuine
component queries, payload/sequence copies, user callbacks, selection responses,
weak lifetimes, acquired getter copies and destruction order. User handler
observers implement complete declared interfaces; no broker, process context,
parser, document or property provider is substituted.

Twenty-two focused cases pass. A combined sixteen-file DOM/SAX/UCB run passes
142 related cases. Aggregate complete UCB/SDK owner coverage is
98.86% statements, 94.44% branches, 98.30% functions and 99.41% lines against the
approved 90% gate. The protected default-constructor branch and setRequest remain unqualified;
no invalid external constructor call or private test hook was added to reach
100%. No dedicated command-environment/interaction Cppunit or
qadevOOo interface tests were found in the bounded source lookup; existing sink
interface method tests were ported as described above.

UCB content/broker clients, default resolver/URI paths, actual DocumentBuilder
orchestration and registration, metadata initialization and full DOCX/XLSX
import/export and existing UI acceptance remain unfinished. Authentication
continuations are not ported or advertised by this slice. Native threading,
physical ABI and complete service bootstrap remain unverified.
