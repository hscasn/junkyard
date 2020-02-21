#include "io.h"
#include "string.h"
#include "shell.h"

extern struct shell shell;

// Scancode characters
char scancode[128] = {
    0, 27, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b',
    '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\n', 0,
    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '`', 0, '\\', 'z',
    'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0, '*', 0, ' ', 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '-', 0, 0, 0, '+', 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0
};


/**
 * PRIVATE FUNCTION
 * Reads a byte
 */
static __inline unsigned char inb(unsigned short int port)
{
    unsigned char c;
    __asm__ __volatile__ ("inb %w1,%0":"=a" (c):"Nd" (port));
    return c;
}


/**
 * Writes an array of character in the current cursor position
 */
void put_string(const char *data)
{
    size_t l = strlen(data), i;
    for (i = 0; i < l; i++)
        put_char(data[i]);
}


/**
 * Writes an integer in the current cursor position
 */
void put_int(const int data) {
    int c = data % 10;
    int r = data / 10;
    if (r != 0)
        put_int(r);
    put_char(c + 48);
}


/**
 * Writes a character in the current cursor position
 */
void put_char(char c)
{
    switch (c) {

    // Special characters
    case '\n':
        //shell.col = 0;
        //shell.row++;
        break;

    // Regular characters
    default:
        put_char_at(c, shell.color, shell.col++, shell.row);
        if (shell.col >= SHELL_WIDTH) {
            shell.col = SHELL_WIDTH - 1;
            //if (++shell.row >= SHELL_HEIGHT) shell.row = 0;
        } else {
            shell_advance_cursor();
        }
        break;
    }

}


/**
 * Puts a character in a specified position
 */
void put_char_at(char c, uint8_t color, size_t x, size_t y)
{
    const size_t index = (y % SHELL_HEIGHT) * SHELL_WIDTH + (x % SHELL_WIDTH);
    shell.buffer[index] = shell_entry(c, color);
}


/**
 * Reads a string from from the keyboard
 */
void get_string(char *dest, int size) {
    int c = 0;
    char d = 0;

    if (size < 1)
        return;

    do {
        d = get_char();
        dest[c++] = d;
        if (d == '\n') {
            dest[c] = '\0';
            return;
        }
        if (d == '\b') {
            dest[--c] = '\0';
            c--;
        }
    } while (c < size);
}


/**
 * Reads an integer from the keyboard
 */
int get_int()
{
    char sum = 0;
    int exp = 1;
    char d[20];
    int i;
    get_string(d, 20);
    for (i = 19; i >= 0; i--) {
        if (d[i] < 48 || d[i] > 57)
            continue;
        sum += (d[i] - 48) * exp;
        exp *= 10;
    }
    return sum;
}

/**
 * Reads a character from the keyboard
 */
char get_char()
{
    static char c = 0;
    char d;
    do {
        if(inb(0x60) != c) {
            c = inb(0x60);
            if (c > 0) {
                d = scancode[c];
                put_char(d);
                return d;
            }
        }
    } while (1);
}
