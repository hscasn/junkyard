import Instruction from "../Instruction";
import Block from "../Block";
import Parser from "../parser/index";

class Do implements Instruction {

  private value_: string|number;
  private openBrackets_: number;
  private isOpen_: boolean;
  private parser_: Parser;

  private block_: Block;
  private repeatTimes_: number;

  constructor(instruction: string, parser: Parser) {
    this.value_ = instruction;
    this.isOpen_ = true;
    this.openBrackets_ = 1;
    this.block_ = new Block('do', parser);
    this.repeatTimes_ = 0;
    this.parser_ = parser;
  }

  public toString(): string {
    let s = '';

    const bl = this.block_.toString();

    for (let i = 0; i < this.repeatTimes_; i++) {
      s += bl;
    }

    return s;
  }

  public isOpen(): boolean {
    return this.isOpen_;
  }

  public appendPart(part: string): void {
    if (/\(/.test(part)) this.openBrackets_++;
    if (/\)/.test(part)) this.openBrackets_--;

    if (this.openBrackets_ === 0) {
      const matches = part.match(/^ *\) *(\d+) +times? *$/);
      if (!matches) throw `Invalid end for do loop: ${part}`;
      const times = +matches[1];
      if (isNaN(times)) throw `Invalid number of iterations for do loop: ${times}`;
      this.repeatTimes_ = times;
      this.isOpen_ = false;
    }
    else {
      this.block_.addInstruction(part);
    }
  }

}


export default Do;