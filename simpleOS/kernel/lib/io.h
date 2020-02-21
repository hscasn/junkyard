#ifndef OS_IO_H
#define OS_IO_H

#include "default.h"

/**
 * Writes an array of character in the current cursor position
 */
void put_string(const char *data);

/**
 * Writes an integer in the current cursor position
 */
void put_int(const int data);

/**
 * Writes a character in the current cursor position
 */
void put_char(char c);

/**
 * Puts a character in a specified position
 */
void put_char_at(char c, uint8_t color, size_t x, size_t y);

/**
 * Reads a string from from the keyboard
 */
void get_string(char *dest, int size);

/**
 * Reads an integer from the keyboard
 */
int get_int();

/**
 * Reads a character from the keyboard
 */
char get_char();

#endif //OS_IO_H
