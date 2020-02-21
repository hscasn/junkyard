import * as fs from 'fs';
import Parser from "../parser/index";

class IO {

  private buffer_: string[];
  private rootPath_: string;

  public constructor(rootPath: string) {
    this.rootPath_ = rootPath;
    this.buffer_ = [];
  }

  public read(): string[] {
    return fs
      .readFileSync(this.rootPath_ + '/input/main.qdl')
      .toString()
      .split('\n')
      .map(l => l.trim().replace(/ {2,}/g, ' '));
  }

  public write(parser: Parser): void {

    const blocks = parser.blocks.map(block => block.toString()).join('');

    let str = `
.text
.global  _start

stdout = 1

_start:

mov %rsp, %rbp
${parser.stackVariables.map(v => `push $${v.value}`).join('\n')}
mov $${parser.stackVariables.length}, %r8

${blocks ? blocks : ''}

mov    $0,%rdi
mov    $60,%rax
syscall

.data
${parser.staticVariables.map(v => (`
${v.name}: .ascii "${v.value}"
.set ${v.name}_len , ${v.length}
`)).join('')}
`;

    fs.writeFileSync(this.rootPath_ + '/output/out.s', str);
  }

}


export default IO;