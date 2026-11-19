/* SPDX-License-Identifier: MPL-2.0
 * Native libc/OSL synchronization boundary used by sal/osl/unx/nlsupport.cxx
 * and process_impl.cxx. Calls the pinned SDK libc; no host filesystem mount.
 */
#include <locale.h>
#include <langinfo.h>
#include <string.h>
#include <pthread.h>

static pthread_mutex_t office_process_locale_mutex = PTHREAD_MUTEX_INITIALIZER;
void office_process_locale_lock(void) {
    (void)pthread_mutex_lock(&office_process_locale_mutex);
}
void office_process_locale_unlock(void) {
    (void)pthread_mutex_unlock(&office_process_locale_mutex);
}
int office_locale_codeset(const char *name, char *buffer, size_t capacity) {
    locale_t ctype_locale = newlocale(LC_CTYPE_MASK, name, (locale_t)0);
    if (ctype_locale == (locale_t)0) return 0;
    char *codeset = nl_langinfo_l(CODESET, ctype_locale);
    if (codeset != NULL) {
        strncpy(buffer, codeset, capacity);
        buffer[capacity - 1] = 0;
        codeset = buffer;
    }
    freelocale(ctype_locale);
    return codeset != NULL;
}
