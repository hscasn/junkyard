"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Prints = (function () {
    function Prints(instruction, parser) {
        this.value_ = instruction.trim();
        this.parser_ = parser;
    }
    Prints.prototype.toString = function () {
        return "\nmov    $" + this.value_ + "_len,%rdx\nmov    $" + this.value_ + ",%rsi\nmov    $stdout,%rdi\nmov    $1,%rax\nsyscall\n    ";
    };
    Prints.prototype.isOpen = function () { return false; };
    Prints.prototype.appendPart = function (part) { };
    return Prints;
}());
exports.default = Prints;
//# sourceMappingURL=Prints.js.map