#ifndef OS_SHELL_H
#define OS_SHELL_H

#include "default.h"

// Dimensions of the screen. Default = 80 x 25
static const size_t SHELL_WIDTH = 80;
static const size_t SHELL_HEIGHT = 25;

struct shell {
    size_t row;
    size_t col;
    uint8_t color;
    uint8_t prompt_bg;
    uint16_t *buffer;

    int cur_row;
    int cur_col;

    int lower_limit;
    int upper_limit;
    int prompt_line;
    int menu_line;
    char* lines;
};

// Available colours for the shell
enum shell_color {
    SHELL_COLOR_BLACK = 0,
    SHELL_COLOR_BLUE = 1,
    SHELL_COLOR_GREEN = 2,
    SHELL_COLOR_CYAN = 3,
    SHELL_COLOR_RED = 4,
    SHELL_COLOR_MAGENTA = 5,
    SHELL_COLOR_BROWN = 6,
    SHELL_COLOR_LIGHT_GREY = 7,
    SHELL_COLOR_DARK_GREY = 8,
    SHELL_COLOR_LIGHT_BLUE = 9,
    SHELL_COLOR_LIGHT_GREEN = 10,
    SHELL_COLOR_LIGHT_CYAN = 11,
    SHELL_COLOR_LIGHT_RED = 12,
    SHELL_COLOR_LIGHT_MAGENTA = 13,
    SHELL_COLOR_LIGHT_BROWN = 14,
    SHELL_COLOR_WHITE = 15,
};


/**
 * Advances the cursor 1 character
 */
void shell_advance_cursor();

/**
 * Clears the screen
 */
void shell_clear_screen();

/**
 * Used to initialize the shell struct
 */
void initialize_shell(struct shell *shell);

/**
 * Prompts for a line - accepts the destination and size
 */
void shell_prompt(char *dest, int size);

/**
 * Prompts for input in "in command" mode - use this when
 * a command is waiting for additional input. It will
 * use a different bar colour
 * dest - where to record the input
 * size - size of the input to fetch
 */
void shell_prompt_in_command(char *dest, int size);

/**
 * Pushes a line on the shell
 */
void shell_push(const char *line);

/**
 * Pushes a line on the shell as a command - use this
 * when the user types a "main command", it will be highlighted differently
 */
void shell_push_as_command(const char *line);

/**
 * Clears the prompt line
 */
void shell_clear_prompt();


/**
 * Returns an int with the code for the shell colour: foreground and background
 */
uint8_t shell_entry_color(enum shell_color fg, enum shell_color bg);


/**
 * Resets the colour of the shell to the default one
 */
void shell_reset_color();


/**
 * Returns an int with the code for the desired character + colour
 */
uint16_t shell_entry(unsigned char uc, uint8_t color);


/**
 * Set the colour for the shell - requires a foreground and background
 */
void shell_set_color(enum shell_color fg, enum shell_color bg);


/**
 * Used to position the cursor in the shell
 */
void shell_position_cursor(int row, int col);


/**
 * Advances the cursor 1 character
 */
void shell_advance_cursor();


/**
 * Used to initialize the shell at the start of the OS. Pass the shell struct
 * as parameter
 */
void initialize_shell(struct shell *shell);


#endif //OS_SHELL_H
