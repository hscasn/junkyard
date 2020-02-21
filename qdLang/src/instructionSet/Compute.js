"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Compute = (function () {
    function Compute(instruction, parser) {
        var match = instruction.match(/([a-zA-Z0-9]+) +([+-/*]) +([a-zA-Z0-9]+) +into +([a-zA-Z0-9]+) */);
        if (!match || match.length !== 5)
            throw "Invalid compute instruction " + instruction;
        var _ = match[0], op1 = match[1], operator = match[2], op2 = match[3], destination = match[4];
        var variables = parser.getVariablesMap();
        var o1 = '';
        var o1Result = variables.find(function (v) { return v.name === op1; });
        if (o1Result)
            o1 = o1Result.getMemAddress();
        else
            o1 = '$' + op1;
        var o2 = '';
        var o2Result = variables.find(function (v) { return v.name === op2; });
        if (o2Result)
            o2 = o2Result.getMemAddress();
        else
            o2 = '$' + op2;
        this.o1_ = o1;
        this.o2_ = o2;
        var recordResult = '';
        var o3Result = variables.find(function (v) { return v.name === destination; });
        if (!o3Result)
            throw "Unknown variable " + destination;
        recordResult = o3Result.getMemAddress();
        var asmIns = '';
        var regResult = '';
        switch (operator.trim()) {
            case '+':
                asmIns = "add %rax, %rbx";
                regResult = '%rbx';
                break;
            case '-':
                asmIns = "sub %rbx, %rax";
                regResult = '%rax';
                break;
            case '/':
                asmIns = "mul %rbx";
                regResult = '%rax';
                break;
            case '*':
                asmIns = "div %rbx";
                regResult = '%rax';
                break;
            default:
                throw "Unknown operator " + operator;
        }
        this.instruction_ = asmIns;
        this.resultRegister_ = regResult;
        this.destinationRegister_ = recordResult;
    }
    Compute.prototype.toString = function () {
        return "\nmov " + this.o1_ + ", %rax\nmov " + this.o2_ + ", %rbx\n" + this.instruction_ + "\nmov " + this.resultRegister_ + ", " + this.destinationRegister_ + "\n";
    };
    Compute.prototype.isOpen = function () { return false; };
    Compute.prototype.appendPart = function (part) { };
    return Compute;
}());
exports.default = Compute;
//# sourceMappingURL=Compute.js.map