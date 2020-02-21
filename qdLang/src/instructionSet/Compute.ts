import Instruction from "../Instruction";
import Parser from "../parser/index";

class Compute implements Instruction {

  private o1_: string;
  private o2_: string;
  private instruction_: string;
  private resultRegister_: string;
  private destinationRegister_: string;

  constructor(instruction: string, parser: Parser) {
    const match = instruction.match(/([a-zA-Z0-9]+) +([+-/*]) +([a-zA-Z0-9]+) +into +([a-zA-Z0-9]+) */);
    if (!match || match.length !== 5) throw `Invalid compute instruction ${instruction}`;

    const [_, op1, operator, op2, destination] = match;

    const variables = parser.getVariablesMap();

    // Moving first operand to rax
    let o1 = '';
    let o1Result = variables.find(v => v.name === op1);
    if (o1Result) o1 = o1Result.getMemAddress();
    else o1 = '$' + op1;

    // Moving second operand to rbx
    let o2 = '';
    let o2Result = variables.find(v => v.name === op2);
    if (o2Result) o2 = o2Result.getMemAddress();
    else o2 = '$' + op2;

    this.o1_ = o1;
    this.o2_ = o2;

    let recordResult: string = '';
    let o3Result = variables.find(v => v.name === destination);
    if (!o3Result) throw `Unknown variable ${destination}`;
    recordResult = o3Result.getMemAddress();

    let asmIns: string = '';
    let regResult: string = '';
    switch (operator.trim()) {
      case '+':
        asmIns = `add %rax, %rbx`;
        regResult = '%rbx';
        break;
      case '-':
        asmIns = `sub %rbx, %rax`;
        regResult = '%rax';
        break;
      case '/':
        asmIns = `mul %rbx`;
        regResult = '%rax';
        break;
      case '*':
        asmIns = `div %rbx`;
        regResult = '%rax';
        break;
      default:
        throw `Unknown operator ${operator}`;
    }

    this.instruction_ = asmIns;
    this.resultRegister_ = regResult;
    this.destinationRegister_ = recordResult;
  }

  public toString(): string {
    return `
mov ${this.o1_}, %rax
mov ${this.o2_}, %rbx
${this.instruction_}
mov ${this.resultRegister_}, ${this.destinationRegister_}
`;
  }

  public isOpen(): boolean { return false; }

  public appendPart(part: string): void {}

}


export default Compute;