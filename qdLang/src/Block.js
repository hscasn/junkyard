"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var instructionBuilder_1 = require("./instructionSet/instructionBuilder");
var Block = (function () {
    function Block(name, parser) {
        this.name_ = name;
        this.instructions_ = [];
        this.parser_ = parser;
    }
    Object.defineProperty(Block.prototype, "name", {
        get: function () { return this.name_; },
        enumerable: true,
        configurable: true
    });
    Block.prototype.addInstruction = function (instruction) {
        if (this.lastInstruction_ && this.lastInstruction_.isOpen()) {
            this.lastInstruction_.appendPart(instruction);
        }
        else {
            var newInstruction = instructionBuilder_1.default(instruction, this.parser_);
            this.instructions_.push(newInstruction);
            this.lastInstruction_ = newInstruction;
        }
    };
    Object.defineProperty(Block.prototype, "instructions", {
        get: function () { return this.instructions_; },
        enumerable: true,
        configurable: true
    });
    Block.prototype.toString = function () {
        return this.instructions_.map(function (i) { return i.toString(); }).join('\n');
    };
    return Block;
}());
exports.default = Block;
//# sourceMappingURL=Block.js.map