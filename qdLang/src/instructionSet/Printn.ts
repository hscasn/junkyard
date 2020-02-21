import Instruction from "../Instruction";
import Parser from "../parser/index";

class Printn implements Instruction {

  private value_: string;
  private parser_: Parser;

  constructor(instruction: string, parser: Parser) {
    instruction = instruction.trim();

    const variables = parser.getVariablesMap();
    const variableFound = variables.find(v => v.name === instruction);
    if (variableFound) this.value_ = variableFound.getMemAddress();
    else this.value_ = '$' + instruction;

    this.parser_ = parser;
  }

  public toString(): string {
    return `
push   ${this.value_}
add    $48, (%rsp)
mov    $1,%rdx
mov    %rsp,%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    `;
  }

  public isOpen(): boolean { return false; }

  public appendPart(part: string): void {}

}


export default Printn;