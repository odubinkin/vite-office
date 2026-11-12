/* SPDX-License-Identifier: MPL-2.0
 * ABI access to actual libxml2 structs used directly by LibreOffice unoxml.
 * No alternate document tree or allocator is introduced here.
 */
#include <libxml/tree.h>
#include <libxml/parser.h>
#include <libxml/xpath.h>
#include <libxml/xpathInternals.h>
#include <libxml/xmlversion.h>
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

/* The upstream XPath helpers are macros, not exported C functions. */
int office_xmlXPathNodeSetGetLength(xmlNodeSetPtr set) {
    return xmlXPathNodeSetGetLength(set);
}
xmlNodePtr office_xmlXPathNodeSetItem(xmlNodeSetPtr set, int index) {
    return xmlXPathNodeSetItem(set, index);
}
