/* SPDX-License-Identifier: MPL-2.0
 * Actual pinned libc stat/access boundary for the source OSL metadata owners.
 * Field/type layout mirrors include/osl/file.h in the selected wasm32 profile.
 * No host filesystem mount or alternate metadata provider.
 */
#include <sys/stat.h>
#include <stdint.h>
#include <unistd.h>
#include <dirent.h>
struct office_file_time_value { uint32_t Seconds, Nanosec; };
struct office_file_status_layout {
    uint32_t uStructSize, uValidFields;
    int eType;
    uint64_t uAttributes;
    struct office_file_time_value aCreationTime, aAccessTime, aModifyTime;
    uint64_t uFileSize;
    void *ustrFileName, *ustrFileURL, *ustrLinkTargetURL;
};
enum { OFFICE_SIZEOF_OSL_FILE_STATUS = sizeof(struct office_file_status_layout) };
unsigned office_file_status_size(void) { return sizeof(struct office_file_status_layout); }
int office_file_access(const char *path, int mode) { return access(path, mode); }
static void office_file_stat_fields(const struct stat *input, uint32_t *fields) {
    const struct stat value = *input;
    fields[0] = value.st_mode;
    uint64_t size = value.st_size, inode = value.st_ino;
    fields[1] = (uint32_t)size;
    fields[2] = (uint32_t)(size >> 32);
    fields[3] = (uint32_t)value.st_atime;
    fields[4] = (uint32_t)value.st_mtime;
    fields[5] = (uint32_t)inode;
    fields[6] = (uint32_t)(inode >> 32);
    if (S_ISLNK(value.st_mode)) fields[7] = 5;
    else if (S_ISDIR(value.st_mode)) fields[7] = 0;
    else if (S_ISREG(value.st_mode)) fields[7] = 2;
    else if (S_ISFIFO(value.st_mode)) fields[7] = 3;
    else if (S_ISSOCK(value.st_mode)) fields[7] = 4;
    else if (S_ISCHR(value.st_mode) || S_ISBLK(value.st_mode)) fields[7] = 6;
    else fields[7] = 7;
}
int office_file_lstat(const char *path, uint32_t *fields) {
    struct stat value;
    if (lstat(path, &value) != 0) return -1;
    office_file_stat_fields(&value, fields);
    return 0;
}
int office_file_stat(const char *path, uint32_t *fields) {
    struct stat value;
    if (stat(path, &value) != 0) return -1;
    office_file_stat_fields(&value, fields);
    return 0;
}
#ifdef _DIRENT_HAVE_D_TYPE
enum { OFFICE_DIRENT_HAVE_D_TYPE = 1 };
#else
enum { OFFICE_DIRENT_HAVE_D_TYPE = 0 };
#endif
int office_file_dtype_type(unsigned char dtype) {
#ifdef _DIRENT_HAVE_D_TYPE
    switch (dtype) {
        case DT_LNK: return 5;
        case DT_DIR: return 0;
        case DT_REG: return 2;
        case DT_FIFO: return 3;
        case DT_SOCK: return 4;
        case DT_CHR: case DT_BLK: return 6;
        default: break;
    }
#else
    (void)dtype;
#endif
    return 7;
}
