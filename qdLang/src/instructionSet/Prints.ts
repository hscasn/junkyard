import Instruction from "../Instruction";
import Parser from "../parser/index";

class Prints implements Instruction {

  private value_: string|number;
  private parser_: Parser;

  constructor(instruction: string, parser: Parser) {
    this.value_ = instruction.trim();
    this.parser_ = parser;
  }

  public toString(): string {
    return `
mov    $${this.value_}_len,%rdx
mov    $${this.value_},%rsi
mov    $stdout,%rdi
mov    $1,%rax
syscall
    `;
  }

  public isOpen(): boolean { return false; }

  public appendPart(part: string): void {}

}


export default Prints;