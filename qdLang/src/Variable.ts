class Variable {
  public name: string;
  public type: string;
  public value: number|string;
  public index: number;
  public length: number;

  constructor(name: string, type: string, value: string, index: number) {
    this.name = name;
    this.type = type;
    this.value = (type === 'string')
      ? (value.trim().substr(1, value.length - 2))
      : (+value);
    this.index = index;
    this.length = typeof value === 'string' ? (() => {
      let l = (this.value as string).length;
      for (let i = 0; i < (this.value as string).length; i++)
        if ((this.value as string).charAt(i) === '\\') l--;
      return l;
    })() : (this.value + '').length;
  }

  getMemAddress(): string {
    return `-${(this.index + 1) * 8}(%rbp)`;
  }
}


export default Variable;
