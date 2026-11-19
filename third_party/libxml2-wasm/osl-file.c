/* SPDX-License-Identifier: MPL-2.0
 * Actual pinned libc POSIX primitives for the Emscripten branch of
 * sal/osl/unx/file.cxx. No alternate filesystem or host filesystem mount.
 */
#include <stdlib.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <limits.h>
#include <sys/stat.h>
#include <unistd.h>

/* Original public/detail OSL flag values; their TS declarations mirror the same headers. */
#define osl_File_OpenFlag_Write 0x02
#define osl_File_OpenFlag_Create 0x04
#define osl_File_OpenFlag_Trunc 0x10
#define osl_File_OpenFlag_NoExcl 0x20
#define osl_File_OpenFlag_Private 0x40

int office_file_path_max(void) { return PATH_MAX; }
int office_file_errno(void) { return errno; }
void office_file_set_overflow(void) { errno = EOVERFLOW; }
int office_file_open(const char *path, unsigned int flags, int mode) {
    int defmode = (flags & osl_File_OpenFlag_Private) ? S_IRUSR : S_IRUSR | S_IRGRP | S_IROTH;
    int oflag = O_RDONLY;
    if (flags & osl_File_OpenFlag_Write) {
        defmode |= (flags & osl_File_OpenFlag_Private) ? S_IWUSR : S_IWUSR | S_IWGRP | S_IWOTH;
        oflag = O_RDWR;
    }
    if (flags & osl_File_OpenFlag_Create) {
        defmode |= (flags & osl_File_OpenFlag_Private) ? S_IWUSR : S_IWUSR | S_IWGRP | S_IWOTH;
        oflag = O_CREAT | O_RDWR;
    }
    if (mode == -1) mode = defmode;
    if (flags & osl_File_OpenFlag_Trunc) oflag |= O_TRUNC;
    if (!(flags & osl_File_OpenFlag_NoExcl)) oflag |= O_EXCL;
    if ((oflag & O_EXCL) && !(oflag & O_CREAT)) oflag &= ~O_EXCL;
    oflag |= O_CLOEXEC;
    return open(path, oflag, mode);
}
int office_file_lock(int fd) {
    struct flock lock;
    lock.l_type = F_WRLCK;
    lock.l_whence = SEEK_SET;
    lock.l_start = 0;
    lock.l_len = 0;
    return fcntl(fd, F_SETLK, &lock);
}

/* Original public-copy destination flags deliberately omit TRUNC/EXCL. */
int office_file_copy_open(const char *path, unsigned int mode) {
    return open(path, O_WRONLY | O_CREAT, mode);
}
void office_file_set_errno(int value) { errno = value; }

/* Mechanical dirent field access; storage and cursor remain owned by libc. */
const char *office_directory_name(const struct dirent *entry) { return entry->d_name; }
unsigned int office_directory_type(const struct dirent *entry) {
#ifdef _DIRENT_HAVE_D_TYPE
    return entry->d_type;
#else
    (void)entry;
    return 0;
#endif
}
