"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Printn = (function () {
    function Printn(instruction, parser) {
        instruction = instruction.trim();
        var variables = parser.getVariablesMap();
        var variableFound = variables.find(function (v) { return v.name === instruction; });
        if (variableFound)
            this.value_ = variableFound.getMemAddress();
        else
            this.value_ = '$' + instruction;
        this.parser_ = parser;
    }
    Printn.prototype.toString = function () {
        return "\npush   " + this.value_ + "\nadd    $48, (%rsp)\nmov    $1,%rdx\nmov    %rsp,%rsi\nmov    $stdout,%rdi\nmov    $1,%rax\nsyscall\n    ";
    };
    Printn.prototype.isOpen = function () { return false; };
    Printn.prototype.appendPart = function (part) { };
    return Printn;
}());
exports.default = Printn;
//# sourceMappingURL=Printn.js.map