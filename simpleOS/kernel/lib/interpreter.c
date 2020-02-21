#include "interpreter.h"
#include "shell.h"


/**
 * Initializes the interpreter struct
 */
void initialize_interpreter(struct interpreter *in, int max_size)
{
    int i, k;
    in->max_size = max_size;
    for (i = 0; i < MAX_INTERPRETER_INSTRUCTIONS; i++)
        for (k = 0; k < MAX_INTERPRETER_CHARACTERS; k++)
            in->instructions[i][k] = '\0';
}


/**
 * Executes a command
 */
void interpreter_interpret_command(const char *cmd, struct interpreter *in)
{
    char token[MAX_INTERPRETER_CHARACTERS];
    int token_index, token_size;
    int pi1;
  
    token_index = 0;
    interpreter_extract_token(cmd, token, &token_index, &token_size);

    switch (interpreter_get_token_code(token)) {
    case token_pin:
        if ((pi1 = interpreter_get_line_number(cmd, &token_index)) < 0)
            break;
        //shell_push("");
        //put_string("Pushing into instruction set at ");
        //put_int(pi1);
        interpreter_write(pi1, in);
        break;

    case token_pinc:
        if ((pi1 = interpreter_get_line_number(cmd, &token_index)) < 0)
            break;
        //shell_push("");
        //put_string("Pushing continuously into instruction set at ");
        //put_int(pi1);
        interpreter_write_continuous(pi1, in);
        break;

    case token_rin:
        if ((pi1 = interpreter_get_line_number(cmd, &token_index)) < 0)
            break;
        interpreter_read(pi1, in);
        break;

    case token_rinc:
        if ((pi1 = interpreter_get_line_number(cmd, &token_index)) < 0)
            break;
        interpreter_read_continuous(pi1, in);
        break;

    default:
        shell_push("Unknown instruction");
    }
}


/**
 * Used to extract a valid line number for the interpeter struct from the
 * command. Returns -1 if not valid
 */
int interpreter_get_line_number(const char *cmd, int *token_index)
{
    int p;
    interpreter_extract_numeric_token(cmd, &p, token_index);
    if (p >= MAX_INTERPRETER_INSTRUCTIONS) {
        shell_push("Instruction line size exceeded");
        return -1;
    }
    return p;
}


/**
 * Pushes one line into the interpreter struct
 */
void interpreter_write(int instIndex, struct interpreter *in)
{
    shell_prompt_in_command(in->instructions[instIndex], in->max_size);
    shell_push(in->instructions[instIndex]);
}


/**
 * Pushes lines into the interpreter struct until .ef is sent
 */
void interpreter_write_continuous(int instIndex, struct interpreter *in)
{
    int i, k;
    for (i = instIndex; i < MAX_INTERPRETER_INSTRUCTIONS; i++) {
        shell_prompt_in_command(in->instructions[i], in->max_size);
        shell_push(in->instructions[i]);
        for (k = 0; k < MAX_INTERPRETER_CHARACTERS - 3 &&
            in->instructions[i][k] != '\0'; k++) {
            if (in->instructions[i][k] == '.' &&
                in->instructions[i][k + 1] == 'e' &&
                in->instructions[i][k + 2] == 'f')
            return;
        }
    }
}


/**
 * Reads one line from the interpreter struct
 */
void interpreter_read(int instIndex, struct interpreter *in)
{
    shell_push(in->instructions[instIndex]);
}


/**
 * Reads from the instruction struct until .ef is found
 */
void interpreter_read_continuous(int instIndex, struct interpreter *in)
{
    int i, k;
    for (i = instIndex; i < MAX_INTERPRETER_INSTRUCTIONS; i++) {
        shell_push(in->instructions[i]);
        for (k = 0; k < MAX_INTERPRETER_CHARACTERS - 3 &&
                    in->instructions[i][k] != '\0'; k++) {
            if (in->instructions[i][k] == '.' &&
                in->instructions[i][k + 1] == 'e' &&
                in->instructions[i][k + 2] == 'f')
                return;
        }
    }
}


/**
 * Gets the code of a token (from the token_code enum)
 */
int interpreter_get_token_code(const char *token)
{
    if (tokencmp(token, "pin"))
        return token_pin;
    if (tokencmp(token, "pinc"))
        return token_pinc;
    if (tokencmp(token, "rin"))
        return token_rin;
    if (tokencmp(token, "rinc"))
        return token_rinc;

    return token_unknown;
}


/**
 * Extracts a token from the command. Records it in 'token' and its length in
 * token_size
 */
void interpreter_extract_token(const char *cmd, char *token, int *token_index,
  int *token_size)
{
    *token_size = 0;
    while (*token_index < MAX_INTERPRETER_CHARACTERS &&
           cmd[*token_index] != ' ' && cmd[*token_index] != '\0') {

        token[*token_size] = cmd[*token_index];

        (*token_index)++;
        (*token_size)++;
    }
    token[*token_size] = '\0';
    (*token_index)++;
}


/**
 * Similar to extract_token, but extracts a numeric token
 */
void interpreter_extract_numeric_token(const char *cmd, int *token, int *token_index)
{
    char buffer[MAX_INTERPRETER_CHARACTERS];
    int token_size, i, r, d = 1;
    *token = 0;
    interpreter_extract_token(cmd, buffer, token_index, &token_size);
    for (i = token_size - 2; i >= 0; i--, d *= 10) {
        r = buffer[i] - 48;
        if (r > 9)
            return;
        *token += r * d;
    }
}
