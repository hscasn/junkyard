abstract class Instruction {
  public abstract toString(): string;
  public abstract isOpen(): boolean;
  public abstract appendPart(part: string): void;
}


export default Instruction;
