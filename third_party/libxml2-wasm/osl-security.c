/* SPDX-License-Identifier: MPL-2.0
 * Selected __EMSCRIPTEN__ bodies from sal/osl/unx/security.cxx and secimpl.hxx,
 * LibreOffice 26.8.0.2 / 9bc445578031fecf56086729d8e4940c77e14d65.
 * Uses only this runtime's libc environment and MEMFS. No login/auth functions.
 */
#include <pwd.h>
#include <unistd.h>
#include <errno.h>
#include <stdint.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
struct office_oslSecurityImpl { struct passwd m_pPasswd; char m_buffer[1]; };
static int office_security_buffer_size(size_t *value) {
#ifdef _SC_GETPW_R_SIZE_MAX
    errno = 0;
    long m = sysconf(_SC_GETPW_R_SIZE_MAX);
    if (m == -1) return 0;
    *value = (size_t)m;
    return 1;
#else
    return 0;
#endif
}
static struct office_oslSecurityImpl *office_growSecurityImpl(
    struct office_oslSecurityImpl *impl, size_t *bufSize) {
    size_t n = 0;
    struct office_oslSecurityImpl *p = NULL;
    if (impl == NULL) {
        if (!office_security_buffer_size(&n)) n = 1024;
    } else if (*bufSize <= SIZE_MAX / 2) n = 2 * *bufSize;
    if (n != 0) {
        if (n <= SIZE_MAX - offsetof(struct office_oslSecurityImpl, m_buffer)) {
            *bufSize = n;
            n += offsetof(struct office_oslSecurityImpl, m_buffer);
        } else {
            *bufSize = SIZE_MAX - offsetof(struct office_oslSecurityImpl, m_buffer);
            n = SIZE_MAX;
        }
        p = realloc(impl, n);
        if (p != NULL) memset(p, 0, n);
    }
    if (p == NULL) free(impl);
    return p;
}
void *osl_getCurrentSecurity(void) {
    size_t n = 0;
    struct office_oslSecurityImpl *p = office_growSecurityImpl(NULL, &n);
    if (p == NULL) return NULL;
    char *buffer = p->m_buffer;
    assert(n >= 100);
    strcpy(buffer, "mobile");
    p->m_pPasswd.pw_name = buffer;
    buffer += strlen(buffer) + 1;
    strcpy(buffer, "*");
    p->m_pPasswd.pw_passwd = buffer;
    buffer += strlen(buffer) + 1;
    p->m_pPasswd.pw_uid = geteuid();
    p->m_pPasswd.pw_gid = getegid();
    strcpy(buffer, "Mobile User");
    p->m_pPasswd.pw_gecos = buffer;
    buffer += strlen(buffer) + 1;
    strcpy(buffer, "/var/mobile");
    p->m_pPasswd.pw_dir = buffer;
    buffer += strlen(buffer) + 1;
    strcpy(buffer, "");
    p->m_pPasswd.pw_shell = buffer;
    return p;
}
/* Borrow the exact byte path selected by osl_psz_getHomeDir; the TS caller
 * immediately copies it into the original OString value, as upstream does. */
const char *office_security_home(void *security) {
    struct office_oslSecurityImpl *p = security;
    if (p == NULL) return NULL;
    if (getuid() == p->m_pPasswd.pw_uid) {
        const char *home = getenv("HOME");
        if (home != NULL && home[0] != 0 && access(home, 0) == 0) {
            if (strlen(home) > INT32_MAX) return NULL;
            return home;
        }
    }
    if (p->m_pPasswd.pw_dir == NULL || strlen(p->m_pPasswd.pw_dir) > INT32_MAX) return NULL;
    return p->m_pPasswd.pw_dir;
}
void osl_freeSecurityHandle(void *security) { free(security); }
