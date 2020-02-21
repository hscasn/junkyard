#ifndef OS_STRING_H
#define OS_STRING_H

#include "default.h"

/**
 * Returns the size of a string
 * @param str
 * @return
 */
size_t strlen(const char *str);


/**
 * Compares two tokens. Returns 1 for match, 0 for no match
 */
int tokencmp(const char *a, const char *b);


/**
 * Compares two strings. Returns a range of negative to positive
 * numbers, similar to C strcmp
 */
int strcmp(const char *a, const char *b);

#endif //OS_STRING_H
