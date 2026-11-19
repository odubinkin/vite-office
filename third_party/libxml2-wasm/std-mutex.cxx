// C ABI only; std::mutex implementation is the pinned Emscripten SDK libc++.
#include <mutex>
extern "C" {
void *office_std_mutex_create() { return new std::mutex; }
void office_std_mutex_destroy(void *value) { delete static_cast<std::mutex *>(value); }
void office_std_mutex_lock(void *value) { static_cast<std::mutex *>(value)->lock(); }
void office_std_mutex_unlock(void *value) { static_cast<std::mutex *>(value)->unlock(); }
}

// Original mutexshared.cxx function-static OSL owner and pointer-to-handle contract.
extern "C" void *osl_createMutex(void);
extern "C" void osl_destroyMutex(void *);
namespace {
struct OfficeGlobalOslMutex {
    void *mutex;
    OfficeGlobalOslMutex() : mutex(osl_createMutex()) {}
    ~OfficeGlobalOslMutex() { osl_destroyMutex(mutex); }
};
}
extern "C" void **osl_getGlobalMutex() {
    static OfficeGlobalOslMutex g_Mutex;
    return &g_Mutex.mutex;
}
