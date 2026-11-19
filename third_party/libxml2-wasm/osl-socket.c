/* SPDX-License-Identifier: MPL-2.0
 * Selected local-hostname dependency from LibreOffice sal/osl/unx/socket.cxx,
 * 26.8.0.2 / 9bc445578031fecf56086729d8e4940c77e14d65.
 * getaddrinfo executes the pinned SDK's synthetic realm-local DNS table.
 * No socket creation, connection, host DNS or other networking API is called.
 */
#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
struct office_hostname_socket_addr { struct sockaddr m_sockaddr; };
struct office_hostname_host_addr {
    char *pHostName;
    struct office_hostname_socket_addr *pSockAddr;
};
static char *office_hostname_full(const char *name) {
    if (strchr(name, '.') != NULL) return strdup(name);
    struct addrinfo hints, *list = NULL;
    memset(&hints, 0, sizeof(hints));
    hints.ai_flags = AI_CANONNAME;
    int error = getaddrinfo(name, NULL, &hints, &list);
    char *result = NULL;
    if (error == 0) {
        assert(list);
        result = strdup(list->ai_canonname);
        freeaddrinfo(list);
    }
    return result;
}
static struct office_hostname_host_addr *office_hostname_from_addrinfo(const struct addrinfo *ai) {
    if (!ai || !ai->ai_canonname || !ai->ai_addr) return NULL;
    char *cn = office_hostname_full(ai->ai_canonname);
    if (cn == NULL) return NULL;
    struct office_hostname_socket_addr *address = calloc(1, sizeof(*address));
    if (address == NULL) { free(cn); return NULL; }
    if (ai->ai_family == AF_INET) memcpy(&address->m_sockaddr, ai->ai_addr, ai->ai_addrlen);
    else { free(address); free(cn); return NULL; }
    struct office_hostname_host_addr *result = malloc(sizeof(*result));
    if (result == NULL) { free(address); free(cn); return NULL; }
    result->pHostName = cn;
    result->pSockAddr = address;
    return result;
}
static struct office_hostname_host_addr *office_hostname_by_name(const char *name) {
    struct addrinfo hints, *list = NULL;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_flags = AI_CANONNAME;
    int error = getaddrinfo(name, NULL, &hints, &list);
    struct office_hostname_host_addr *result = office_hostname_from_addrinfo(list);
    if (error == 0) freeaddrinfo(list);
    return result;
}
/* output is the original fixed 256-byte LocalHostname buffer. The SAL caller
 * constructs the original ASCII OUString and owns the two static result caches. */
int office_local_hostname(int useFQDN, char *output) {
    memset(output, 0, 256);
    if (gethostname(output, 255) != 0) return 1;
    output[255] = 0;
    if (useFQDN && strchr(output, '.') == NULL) {
        struct office_hostname_host_addr *address = office_hostname_by_name(output);
        const char *name = address ? address->pHostName : NULL;
        if (name != NULL) { strncpy(output, name, 256); output[255] = 0; }
        if (address) { free(address->pHostName); free(address->pSockAddr); free(address); }
    }
    return output[0] != 0 ? 0 : 1;
}
