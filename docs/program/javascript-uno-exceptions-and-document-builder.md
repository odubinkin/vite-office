# JavaScript UNO exceptions and native XML DocumentBuilder

The browser exception ABI links the existing generated UNO classes to their
lazy native type getters. It does not create replacement exception classes or
infer types from values. `throwException` reads declared native member addresses
through borrowed const views and invokes the linked generated copy constructor.
`getCaughtException` retains its zero-argument public contract; a synchronous
`withCaughtException` scope lowers the host current-exception state and restores
outer scopes in finally. This scope is synchronous and realm-local. Native C++
binary mappings, machine code, physical TLS and cross-thread exception storage
are separate platform responsibilities and are not claimed as ported.

The original cppuhelper misc testCatchThrow and testgetCaughtException assertions
run with real RuntimeException and Any owners. Additional tests retain derived
classes, nonempty Context, embedded-zero Unicode, nested exception payloads and
nested catch scopes. SDK module registration never invokes its type getter.

The source Any overload of cancelCommandExecution now uses the actual request,
abort continuation and application handler. Selection throws CommandFailedException
with the original Reason; ignored/no-handler paths rethrow the original dynamic
exception. The IOErrorCode overload is not advertised. Content.isDocument and
openStream retain original property lookup, cancellation, DOCUMENT mode, zero
priority, empty properties, actual ActiveDataSink and command dispatch.
Positive stream opening still requires the real pending UCB provider.

CDocumentBuilder is registered under the original unoxml component/service names
in the production registry used by main and Calc Worker. It uses native libxml2
with options zero, no stream URL/encoding override and source callback ownership.
Caller input streams remain open. Each callback reads the current builder resolver
or error handler, including after reentrant replacement. The default resolver
opens actual Content and catches only UNO exceptions. parseURI first attempts the
native file API and then uses the original default SimpleFileAccess constructor;
its stream closes only after a successful parse. The full three-level
XSimpleFileAccess interface declarations are present; its provider remains pending.
Synchronous realm execution lowers the source recursive mutex; native shared-memory
thread scheduling is unqualified.

Original domtest validInputTest, warningInputTest and errorInputTest execute with
unchanged XML fixture content through the registered component. Provider-independent
testXDocumentBuilder assertions are ported; original URI/provider assertions remain
pending. No synthetic broker, file provider, context or manager supplies success.
Metadata, complete DOCX/XLSX shell import/export and existing UI acceptance remain
unfinished. This is prerequisite implementation, not full format completion.

Main waits for native libxml2 and fonts before mounting document factories.
Calc binds its Worker listener immediately and awaits the realm-local native
initialization inside requests, including normal initialization error responses.
Only serialized operation results cross realms; native pointers stay local.

The public exception helper is an injected platform contract. SDK declarations
link only platform-neutral compiler metadata; they never import a browser adapter.
Main and Worker composition explicitly initialize the JavaScript exception ABI.
The native unoxml dependency edges to comphelper and ucbhelper are retained from
its original documentbuilder includes and Library_unoxml.mk link dependencies.
