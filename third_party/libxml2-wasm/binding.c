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
#include <stdlib.h>

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
FIELD(xmlEntity, entity_publicId, const xmlChar *, ExternalID)
FIELD(xmlEntity, entity_systemId, const xmlChar *, SystemID)
FIELD(xmlParserCtxt, parser_private, void *, _private)
FIELD(xmlParserCtxt, parser_sax, xmlSAXHandlerPtr, sax)
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

/* The upstream XPath helpers are macros, not exported C functions. */
int office_xmlXPathNodeSetGetLength(xmlNodeSetPtr set) {
    return xmlXPathNodeSetGetLength(set);
}
xmlNodePtr office_xmlXPathNodeSetItem(xmlNodeSetPtr set, int index) {
    return xmlXPathNodeSetItem(set, index);
}
