#include "shell.h"

extern struct shell shell;


/**
 * PRIVATE FUNCTION
 * Writes a byte
 */
void __inline outb(unsigned short port, unsigned char val)
{
    asm volatile("outb %0, %1" : : "a"(val), "Nd"(port) );
}


/**
 * Clears the prompt line
 */
void shell_clear_prompt()
{
    size_t i;
    shell_set_color(SHELL_COLOR_BLACK, shell.prompt_bg);
    for (size_t x = 0; x < SHELL_WIDTH; x++) {
        i = ((SHELL_HEIGHT - 1) * SHELL_WIDTH) + x;
        shell.buffer[i] = shell_entry(' ', shell.color);
    }
}


/**
 * Returns an int with the code for the shell colour: foreground and background
 */
uint8_t shell_entry_color(enum shell_color fg, enum shell_color bg)
{
    return fg | bg << 4;
}


/**
 * Resets the colour of the shell to the default one
 */
void shell_reset_color()
{
    shell.color = shell_entry_color(SHELL_COLOR_LIGHT_GREY, SHELL_COLOR_BLACK);
}


/**
 * Returns an int with the code for the desired character + colour
 */
uint16_t shell_entry(unsigned char uc, uint8_t color)
{
    return (uint16_t) uc | (uint16_t) color << 8;
}


/**
 * Set the colour for the shell - requires a foreground and background
 */
void shell_set_color(enum shell_color fg, enum shell_color bg)
{
    shell.color = shell_entry_color(fg, bg);
}


/**
 * Used to position the cursor in the shell
 */
void shell_position_cursor(int row, int col)
{
    unsigned short p = (row * SHELL_WIDTH) + col;

    shell.cur_row = row;
    shell.cur_col = col;

    outb(0x3D4, 0x0F);
    outb(0x3D5, (unsigned char)(p & 0xFF));

    outb(0x3D4, 0x0E);
    outb(0x3D5, (unsigned char )((p >> 8) & 0xFF));
}


/**
 * Advances the cursor 1 character
 */
void shell_advance_cursor()
{
    shell_position_cursor(shell.cur_row, shell.cur_col + 1);
}


/**
 * Used to initialize the shell at the start of the OS. Pass the shell struct
 * as parameter
 */
void initialize_shell(struct shell *shell)
{
    shell->buffer = (uint16_t*) 0xB8000;
    shell->prompt_line = SHELL_HEIGHT - 1;
    shell->lower_limit = shell->prompt_line - 1;
    shell->upper_limit = 1;
    shell->menu_line = 0;
    shell->prompt_bg = SHELL_COLOR_LIGHT_GREY;

    shell_position_cursor(0, SHELL_HEIGHT - 1);
    shell_clear_screen();

    shell->row = shell->prompt_line;
    shell->col = 0;
}


/**
 * Clears the screen
 */
void shell_clear_screen()
{
    size_t y, x, i;
    shell_set_color(SHELL_COLOR_LIGHT_GREY, SHELL_COLOR_BLACK);
    for (y = 0; y < SHELL_HEIGHT - 1; y++)
        for (x = 0; x < SHELL_WIDTH; x++) {
            i = (y * SHELL_WIDTH) + x;
            shell.buffer[i] = shell_entry(' ', shell.color);
        }
    shell_clear_prompt();
}


/**
 * Private function
 * Used by shell_prompt and shell_prompt_in_command
 */
void __shell_prompt(char *dest, int size)
{
    shell_clear_prompt();
    shell.col = 0;
    shell_set_color(SHELL_COLOR_BLACK, shell.prompt_bg);
    shell.row = shell.prompt_line;
    shell_position_cursor(shell.prompt_line, 0);
    get_string(dest, size);
    shell_clear_prompt();
    shell.col = 0;
    shell.row = shell.prompt_line;
}


/**
 * Prompts for input
 * dest - where to record the input
 * size - size of the input to fetch
 */
void shell_prompt(char *dest, int size)
{
    shell.prompt_bg = SHELL_COLOR_LIGHT_GREY;
    __shell_prompt(dest, size);
}


/**
 * Prompts for input in "in command" mode - use this when
 * a command is waiting for additional input. It will
 * use a different bar colour
 * dest - where to record the input
 * size - size of the input to fetch
 */
void shell_prompt_in_command(char *dest, int size)
{
    shell.prompt_bg = SHELL_COLOR_GREEN;
    __shell_prompt(dest, size);
}


/**
 * Private function
 * Used by shell_push and shell_push_as_command
 */
void __shell_push(const char *line, int8_t bg)
{
    int y, x, i, row_index;
    size_t src, tar;

    // Pushing existing lines up
    for (y = shell.upper_limit; y < shell.lower_limit; y++)
    for (x = 0; x < SHELL_WIDTH; x++) {
        src = ((y + 1) % SHELL_HEIGHT) *
                           SHELL_WIDTH + (x % SHELL_WIDTH);
        tar = (y % SHELL_HEIGHT) * SHELL_WIDTH + (x % SHELL_WIDTH);
        shell.buffer[tar] = shell.buffer[src];
    }

    shell_reset_color();

    // Clearing last line
    shell.row = shell.lower_limit;
    shell.col = 0;
    shell.color = shell_entry_color(bg, SHELL_COLOR_BLACK);
    row_index = (shell.lower_limit) * SHELL_WIDTH;
    for (i = 0; i < SHELL_WIDTH; i++)
        shell.buffer[row_index + i] = shell_entry(' ', shell.color);

    // Adding new line
    shell.row = shell.lower_limit;
    shell.col = 0;
    for (i = 0; i < SHELL_WIDTH; i++)
        if (line[i])
            put_char(line[i]);
        else
            return;
}


/**
 * Prints a line on the shell
 */
void shell_push(const char *line)
{
    __shell_push(line, SHELL_COLOR_LIGHT_GREY);
}


/**
 * Prints a line on the shell
 */
void shell_push_as_command(const char *line)
{
    __shell_push(line, SHELL_COLOR_GREEN);
}
