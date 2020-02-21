import Block from "../Block";
import Variable from "../Variable";

class Parser {

  private fileContent_: string[];
  private blocks_: Block[];
  private stackVariables_: Variable[];
  private staticVariables_: Variable[];

  public constructor(fileContent: string[]) {
    this.fileContent_ = fileContent;

    this.blocks_ = [];
    let inBlock: number = 0;
    let currBlock: Block|undefined = undefined;
    this.staticVariables_ = [];
    this.stackVariables_ = [];

    let inDeclarationSpace = true;

    for (let i = 0; i < fileContent.length; i++) {
      const line = fileContent[i];

      // Blank line - ignore
      if (line.trim().length < 1) continue;

      // Comment - ignore
      if (/^ *!/.test(line)) continue;

      if (/^ *declare +([a-zA-Z0-9]+) +([a-zA-Z0-9]+) +(.+) *$/.test(line)) {
        if (!inDeclarationSpace) throw `Variables can only be declared in the top of the file`;

        const match = line.match(/^ *declare +([a-zA-Z0-9]+) +([a-zA-Z0-9]+) +(.+) *$/);
        if (!match || match.length !== 4) throw `Invalid variable declaration at line ${i}`;

        const [_, type, name, value] = match;

        if (type === 'string') {
          this.staticVariables_.push(new Variable(name, type, value, this.staticVariables_.length));
        }
        else if (type === 'number') {
          this.stackVariables_.push(new Variable(name, type, value, this.stackVariables_.length));
        }
        else {
          throw `Unknown variable type ${type}`;
        }
        continue;
      }

      // Starting a block
      if (inBlock === 0 && / *([a-zA-Z0-9_]+) *\(/.test(line)) {
        inDeclarationSpace = false;
        inBlock++;

        // Already in a block
        //if (inBlock) throw `Invalid syntax at line ${i}: a block has already started`;

        //inBlock = true;

        const blockParts = line.match(/^([a-zA-Z0-9_]+) +\($/);

        // Invalid block name
        if (!blockParts) throw `Invalid block syntax at line ${i}`;

        currBlock = new Block(blockParts[1], this);

        continue;
      }

      // Ending a block
      if (inBlock === 1 && /\)/.test(line)) {
        if (!currBlock) throw `Trying to close an unopened block at ${i}`;
        inBlock--;
        this.blocks_.push(currBlock);
        currBlock = undefined;
        continue;
      }

      // Instruction
      if (inBlock > 0) {
        if (!currBlock) throw `All instructions must belong to a block. Error at line ${i}`;
        if (/\(/.test(line)) inBlock++;
        if (/\)/.test(line)) inBlock--;
        currBlock.addInstruction(line);
        continue;
      }

      throw `Unrecognized instruction at line ${i}`;
    }

    if (inBlock || currBlock) throw `Block left unclosed`;
    const startBlock = this.blocks_.find(b => b.name === 'start');

    if (!startBlock) throw `Block "start" not found`;
  }

  public getVariablesMap(): Variable[] {
    return ([] as Variable[]).concat(this.staticVariables_).concat(this.stackVariables_);
  }

  public get blocks(): Block[] {
    return this.blocks_;
  }

  public get staticVariables(): Variable[] {
    return this.staticVariables_;
  }

  public get stackVariables(): Variable[] {
    return this.stackVariables_;
  }

}


export default Parser;