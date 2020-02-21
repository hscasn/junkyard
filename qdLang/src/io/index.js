"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var IO = (function () {
    function IO(rootPath) {
        this.rootPath_ = rootPath;
        this.buffer_ = [];
    }
    IO.prototype.read = function () {
        return fs
            .readFileSync(this.rootPath_ + '/input/main.qdl')
            .toString()
            .split('\n')
            .map(function (l) { return l.trim().replace(/ {2,}/g, ' '); });
    };
    IO.prototype.write = function (parser) {
        var blocks = parser.blocks.map(function (block) { return block.toString(); }).join('');
        var str = "\n.text\n.global  _start\n\nstdout = 1\n\n_start:\n\nmov %rsp, %rbp\n" + parser.stackVariables.map(function (v) { return "push $" + v.value; }).join('\n') + "\nmov $" + parser.stackVariables.length + ", %r8\n\n" + (blocks ? blocks : '') + "\n\nmov    $0,%rdi\nmov    $60,%rax\nsyscall\n\n.data\n" + parser.staticVariables.map(function (v) { return ("\n" + v.name + ": .ascii \"" + v.value + "\"\n.set " + v.name + "_len , " + v.length + "\n"); }).join('') + "\n";
        fs.writeFileSync(this.rootPath_ + '/output/out.s', str);
    };
    return IO;
}());
exports.default = IO;
//# sourceMappingURL=index.js.map