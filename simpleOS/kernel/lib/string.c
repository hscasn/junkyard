#include "string.h"


/**
 * Gets the length of a string
 */
size_t strlen(const char *str)
{
    size_t l = 0;
    while (str[l])
        l++;
    return l;
}


/**
 * Compares two tokens. Returns 1 for match, 0 for no match
 */
int tokencmp(const char *a, const char *b)
{
    int i, r;
    for (i = 0;; i++) {
        r = a[i] - b[i];

        if (a[i] <= 32 && b[i] <= 32)
            return 1;

        if (r != 0)
            return 0;
    }
}


/**
 * Compares two strings. Returns a range of negative to positive
 * numbers, similar to C strcmp
 */
int strcmp(const char *a, const char *b)
{
    int i, r;
    for (i = 0;; i++) {
        r = a[i] - b[i];

        if (r != 0)
            return r;

        if (a[i] == '\0' || b[i] == '\0')
            return r;
    }
}