"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Prints_1 = require("./Prints");
var Printn_1 = require("./Printn");
var Do_1 = require("./Do");
var Compute_1 = require("./Compute");
function instructionBuilder(instruction, parser) {
    var instructionParts = instruction.match(/^ *([a-zA-Z]+)(.*) *$/);
    if (!instructionParts || instructionParts.length < 1)
        throw "Invalid instruction: " + instruction;
    var instructionName = instructionParts[1];
    var remaining = instructionParts[2];
    switch (instructionName) {
        case 'prints':
            return new Prints_1.default(remaining, parser);
        case 'printn':
            return new Printn_1.default(remaining, parser);
        case 'do':
            return new Do_1.default(remaining, parser);
        case 'compute':
            return new Compute_1.default(remaining, parser);
        default:
            throw "Invalid instruction: " + instruction;
    }
}
exports.default = instructionBuilder;
//# sourceMappingURL=instructionBuilder.js.map