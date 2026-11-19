/* SPDX-License-Identifier: MPL-2.0
 * ABI access to actual libxml2 structs used directly by LibreOffice unoxml.
 * No alternate document tree or allocator is introduced here.
 */
#include <libxml/tree.h>
#include <libxml/parser.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
#include <libxml/xmlversion.h>
#include <libxml/entities.h>
#include <libxml/SAX2.h>
#include <stdlib.h>
#include <stdio.h>
#include "osl-mutex.c"
#include "osl-locale.c"
#include "osl-file.c"
#include "osl-file-stat.c"
#include "osl-security.c"
#include "osl-socket.c"

const char *office_xmlVersion(void) { return LIBXML_DOTTED_VERSION; }
void office_xmlFree(void *value) { xmlFree(value); }

#define FIELD(type, name, fieldtype, field) \
    fieldtype office_##name##_get(type *p) { return p->field; } \
    void office_##name##_set(type *p, fieldtype value) { p->field = value; }

FIELD(xmlNode, node_type, xmlElementType, type)
FIELD(xmlNode, node_name, const xmlChar *, name)
FIELD(xmlNode, node_children, xmlNodePtr, children)
FIELD(xmlNode, node_last, xmlNodePtr, last)
FIELD(xmlNode, node_parent, xmlNodePtr, parent)
FIELD(xmlNode, node_next, xmlNodePtr, next)
FIELD(xmlNode, node_prev, xmlNodePtr, prev)
FIELD(xmlNode, node_doc, xmlDocPtr, doc)
FIELD(xmlNode, node_ns, xmlNsPtr, ns)
FIELD(xmlNode, node_content, xmlChar *, content)
FIELD(xmlNode, node_properties, xmlAttrPtr, properties)
FIELD(xmlNode, node_nsDef, xmlNsPtr, nsDef)
FIELD(xmlNs, ns_next, xmlNsPtr, next)
FIELD(xmlNs, ns_href, const xmlChar *, href)
FIELD(xmlNs, ns_prefix, const xmlChar *, prefix)
FIELD(xmlAttr, attr_atype, xmlAttributeType, atype)
FIELD(xmlDtd, dtd_publicId, xmlChar *, ExternalID)
FIELD(xmlDtd, dtd_systemId, xmlChar *, SystemID)
FIELD(xmlDtd, dtd_entities, void *, entities)
FIELD(xmlDtd, dtd_notations, void *, notations)
FIELD(xmlEntity, entity_content, xmlChar *, content)
FIELD(xmlEntity, entity_publicId, const xmlChar *, ExternalID)
FIELD(xmlEntity, entity_systemId, const xmlChar *, SystemID)
FIELD(xmlXPathContext, xpath_context_node, xmlNodePtr, node)
FIELD(xmlXPathContext, xpath_context_error, xmlStructuredErrorFunc, error)
FIELD(xmlXPathObject, xpath_object_type, xmlXPathObjectType, type)
FIELD(xmlXPathObject, xpath_object_nodeset, xmlNodeSetPtr, nodesetval)

FIELD(xmlParserCtxt, parser_private, void *, _private)
FIELD(xmlParserCtxt, parser_sax, xmlSAXHandlerPtr, sax)
FIELD(xmlParserCtxt, parser_doc, xmlDocPtr, myDoc)
FIELD(xmlError, error_message, char *, message)
FIELD(xmlError, error_line, int, line)
FIELD(xmlError, error_column, int, int2)
FIELD(xmlError, error_level, xmlErrorLevel, level)

/* C variadic SAX callbacks cannot be installed as fixed-signature JS table
 * functions. These trampolines erase only the unused format/varargs parameters.
 * The realm-local JS entry points dispatch by the original parser-context
 * pointer. Parser state, error policy and _private remain with unoxml/libxml2.
 */
static void (*office_builder_error)(void *);
static void (*office_builder_warning)(void *);

static void office_builder_error_trampoline(void *context, const char *message, ...) {
    (void)message;
    office_builder_error(context);
}

static void office_builder_warning_trampoline(void *context, const char *message, ...) {
    (void)message;
    office_builder_warning(context);
}

void office_xmlParserInstallCallbacks(xmlParserCtxtPtr context,
                                     void (*error)(void *),
                                     void (*warning)(void *),
                                     resolveEntitySAXFunc resolver) {
    office_builder_error = error;
    office_builder_warning = warning;
    context->sax->error = office_builder_error_trampoline;
    context->sax->warning = office_builder_warning_trampoline;
    context->sax->resolveEntity = resolver;
}

/* FastSaxParserImpl::parse uses this exact static SAX2 callback aggregate.
 * Only the compiler-owned C struct/function-pointer ABI is lowered here;
 * parser options, entity policy, event/state ownership and errors stay with
 * the original FastParser implementation. userData is forwarded unchanged.
 */
xmlSAXHandlerPtr office_xmlFastParserCallbacks(startElementNsSAX2Func start,
                                              endElementNsSAX2Func end,
                                              charactersSAXFunc characters,
                                              processingInstructionSAXFunc instruction,
                                              getEntitySAXFunc entity) {
    static xmlSAXHandler callbacks;
    callbacks.startElementNs = start;
    callbacks.endElementNs = end;
    callbacks.characters = characters;
    callbacks.processingInstruction = instruction;
    callbacks.getEntity = entity;
    callbacks.initialized = XML_SAX2_MAGIC;
    return &callbacks;
}

/* The upstream XPath helpers are macros, not exported C functions. */
int office_xmlXPathNodeSetGetLength(xmlNodeSetPtr set) {
    return xmlXPathNodeSetGetLength(set);
}
xmlNodePtr office_xmlXPathNodeSetItem(xmlNodeSetPtr set, int index) {
    return xmlXPathNodeSetItem(set, index);
}

/* Preserve xpathapi.cxx generic_error_func's bounded native printf formatting;
 * only its SAL logging sink crosses the host ABI. */
#include <stdarg.h>
#include <stdio.h>
static void (*office_xpath_generic_sink)(const char *);
static void office_xpath_generic_trampoline(void *context, const char *format, ...) {
    (void)context;
    char str[1000];
    va_list args;
    va_start(args, format);
    vsnprintf(str, sizeof(str), format, args);
    va_end(args);
    office_xpath_generic_sink(str);
}
void office_xmlXPathSetGenericError(void (*sink)(const char *)) {
    office_xpath_generic_sink = sink;
    xmlSetGenericErrorFunc(NULL, sink ? office_xpath_generic_trampoline : NULL);
}

/* C ABI declarations for the actual pinned SDK libc++ objects in std-mutex.cxx. */
void **osl_getGlobalMutex(void);
void *office_std_mutex_create(void);
void office_std_mutex_destroy(void *mutex);
void office_std_mutex_lock(void *mutex);
void office_std_mutex_unlock(void *mutex);
