"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Block_1 = require("../Block");
var Do = (function () {
    function Do(instruction, parser) {
        this.value_ = instruction;
        this.isOpen_ = true;
        this.openBrackets_ = 1;
        this.block_ = new Block_1.default('do', parser);
        this.repeatTimes_ = 0;
        this.parser_ = parser;
    }
    Do.prototype.toString = function () {
        var s = '';
        var bl = this.block_.toString();
        for (var i = 0; i < this.repeatTimes_; i++) {
            s += bl;
        }
        return s;
    };
    Do.prototype.isOpen = function () {
        return this.isOpen_;
    };
    Do.prototype.appendPart = function (part) {
        if (/\(/.test(part))
            this.openBrackets_++;
        if (/\)/.test(part))
            this.openBrackets_--;
        if (this.openBrackets_ === 0) {
            var matches = part.match(/^ *\) *(\d+) +times? *$/);
            if (!matches)
                throw "Invalid end for do loop: " + part;
            var times = +matches[1];
            if (isNaN(times))
                throw "Invalid number of iterations for do loop: " + times;
            this.repeatTimes_ = times;
            this.isOpen_ = false;
        }
        else {
            this.block_.addInstruction(part);
        }
    };
    return Do;
}());
exports.default = Do;
//# sourceMappingURL=Do.js.map