#ifndef OS_INTERPRETER_H
#define OS_INTERPRETER_H

#define MAX_INTERPRETER_INSTRUCTIONS 10000
#define MAX_INTERPRETER_CHARACTERS 80

struct interpreter {
    char instructions[MAX_INTERPRETER_INSTRUCTIONS][MAX_INTERPRETER_CHARACTERS];
    int max_size;
};


enum {
    token_unknown = -1,
    token_pin = 0,
    token_rin = 1,
    token_pinc = 2,
    token_rinc = 3
} token_codes;


/**
 * Used to extract a valid line number for the interpeter struct from the
 * command. Returns -1 if not valid
 */
int interpreter_get_line_number(const char *cmd, int *token_index);

/**
 * Initializes the interpreter struct
 */
void initialize_interpreter(struct interpreter *i, int max_size);

/**
 * Receives a command (from the interpreted language) and executes it
 */
void interpreter_interpret_command(const char *cmd, struct interpreter *in);

/**
 * Extracts a token from the command. Records it in 'token' and its length in
 * token_size. Advances the token_index accordingly
 */
void interpreter_extract_token(const char *cmd, char *token, int *token_index,
  int *token_size);

/**
 * Similar to extract_token, but extracts a numeric token
 */
void interpreter_extract_numeric_token(const char *cmd, int *token,
  int *token_index);

/**
 * Gets the code of a token (from the token_code) enum
 */
int interpreter_get_token_code(const char *token);

/**
 * Pushes one line into the interpreter struct
 */
void interpreter_write(int instIndex, struct interpreter *in);

/**
 * Pushes lines into the interpreter struct until .ef is sent
 */
void interpreter_write_continuous(int instIndex, struct interpreter *in);

/**
 * Reads one line from the interpreter struct
 */
void interpreter_read(int instIndex, struct interpreter *in);

/**
 * Reads from the instruction struct until <EF is found
 */
void interpreter_read_continuous(int instIndex, struct interpreter *in);


#endif //OS_INTERPRETER_H
