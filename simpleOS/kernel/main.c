#include "lib/default.h"
#include "lib/shell.h"
#include "lib/io.h"
#include "lib/string.h"
#include "lib/interpreter.h"

struct shell shell;
struct interpreter interpreter;


/**
 * Entry point
 * @return
 */
int main()
{
    char cmd[SHELL_WIDTH + 1];

    initialize_shell(&shell);
    initialize_interpreter(&interpreter, SHELL_WIDTH);

    shell_push("Use 'pin <line>' to set an instruction");
    shell_push("Use 'rin <line>' to read an instruction");
    shell_push("Use 'pinc <line>' to read continuously (stop at .ef)");
    shell_push("Use 'rinc <line>' to read continuously (stop at .ef)");

    shell_push("");
    put_string("Lines allowed: ");
    put_int(MAX_INTERPRETER_INSTRUCTIONS);

    while (1) {
        shell_prompt(cmd, SHELL_WIDTH);
        shell_push_as_command(cmd);
        interpreter_interpret_command(cmd, &interpreter);
    }

    return 0;
}
