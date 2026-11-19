/* SPDX-License-Identifier: MPL-2.0
 * Consumed sal/osl/unx/mutex.cxx bodies lowered to C for the actual pinned
 * Emscripten pthread ABI. Diagnostics and the unconsumed global mutex are not
 * bound here. No JavaScript mutex state or replacement pthread API.
 */
#include <pthread.h>
#include <stdlib.h>
#include <stdint.h>

typedef struct { pthread_mutex_t mutex; } oslMutexImpl;
typedef void *oslMutex;
typedef uint8_t sal_Bool;

oslMutex osl_createMutex(void) {
    oslMutexImpl *pMutex = malloc(sizeof(oslMutexImpl));
    pthread_mutexattr_t attr;
    int result = 0;
    if (pMutex == NULL) return NULL;
    pthread_mutexattr_init(&attr);
    result = pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
    if (result == 0) result = pthread_mutex_init(&pMutex->mutex, &attr);
    if (result != 0) { free(pMutex); pMutex = NULL; }
    pthread_mutexattr_destroy(&attr);
    return pMutex;
}
void osl_destroyMutex(oslMutex pointer) {
    oslMutexImpl *mutex = pointer;
    if (mutex != NULL) { (void)pthread_mutex_destroy(&mutex->mutex); free(mutex); }
}
sal_Bool osl_acquireMutex(oslMutex pointer) {
    oslMutexImpl *mutex = pointer;
    if (mutex != NULL) return pthread_mutex_lock(&mutex->mutex) == 0;
    return 0;
}
sal_Bool osl_tryToAcquireMutex(oslMutex pointer) {
    oslMutexImpl *mutex = pointer;
    if (mutex != NULL) return pthread_mutex_trylock(&mutex->mutex) == 0;
    return 0;
}
sal_Bool osl_releaseMutex(oslMutex pointer) {
    oslMutexImpl *mutex = pointer;
    if (mutex != NULL) return pthread_mutex_unlock(&mutex->mutex) == 0;
    return 0;
}
