#if defined(__cplusplus)
extern "C"
#endif

#ifndef OS_DEFAULT_H
#define OS_DEFAULT_H

#if !defined(__cplusplus)
#include <stdbool.h>
#endif

#include <stddef.h>
#include <stdint.h>

#if defined(__linux__)
#error "This is not a cross compiler"
#endif

#if !defined(__i386__)
#error "Not using a ix86-elf compiler"
#endif

#endif //OS_DEFAULT_H
