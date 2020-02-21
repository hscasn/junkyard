import Instruction from "../Instruction";
import Prints from "./Prints";
import Printn from "./Printn";
import Do from "./Do";
import Compute from "./Compute";
import Parser from "../parser/index";

function instructionBuilder(instruction: string, parser: Parser): Instruction {
  const instructionParts = instruction.match(/^ *([a-zA-Z]+)(.*) *$/);

  if (!instructionParts || instructionParts.length < 1) throw `Invalid instruction: ${instruction}`;

  const instructionName = instructionParts[1];
  const remaining = instructionParts[2];

  switch (instructionName) {
    case 'prints':
      return new Prints(remaining, parser);
    case 'printn':
      return new Printn(remaining, parser);
    case 'do':
      return new Do(remaining, parser);
    case 'compute':
      return new Compute(remaining, parser);
    default:
      throw `Invalid instruction: ${instruction}`
  }
}

export default instructionBuilder;