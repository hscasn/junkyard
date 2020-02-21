import Instruction from "./Instruction";
import instructionBuilder from "./instructionSet/instructionBuilder";
import Parser from "./parser/index";

class Block {

  private name_: string;
  private instructions_: Instruction[];
  private lastInstruction_: Instruction|undefined;
  private parser_: Parser;

  constructor(name: string, parser: Parser) {
    this.name_ = name;
    this.instructions_ = [];
    this.parser_ = parser;
  }

  get name(): string { return this.name_; }

  addInstruction(instruction: string) {
    if (this.lastInstruction_ && this.lastInstruction_.isOpen()) {
      this.lastInstruction_.appendPart(instruction);
    }
    else {
      const newInstruction = instructionBuilder(instruction, this.parser_);
      this.instructions_.push(newInstruction);
      this.lastInstruction_ = newInstruction;
    }
  }

  get instructions(): Instruction[] { return this.instructions_; }

  public toString(): string {
    return this.instructions_.map(i => i.toString()).join('\n');
  }

}


export default Block;