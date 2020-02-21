"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Block_1 = require("../Block");
var Variable_1 = require("../Variable");
var Parser = (function () {
    function Parser(fileContent) {
        this.fileContent_ = fileContent;
        this.blocks_ = [];
        var inBlock = 0;
        var currBlock = undefined;
        this.staticVariables_ = [];
        this.stackVariables_ = [];
        var inDeclarationSpace = true;
        for (var i = 0; i < fileContent.length; i++) {
            var line = fileContent[i];
            if (line.trim().length < 1)
                continue;
            if (/^ *!/.test(line))
                continue;
            if (/^ *declare +([a-zA-Z0-9]+) +([a-zA-Z0-9]+) +(.+) *$/.test(line)) {
                if (!inDeclarationSpace)
                    throw "Variables can only be declared in the top of the file";
                var match = line.match(/^ *declare +([a-zA-Z0-9]+) +([a-zA-Z0-9]+) +(.+) *$/);
                if (!match || match.length !== 4)
                    throw "Invalid variable declaration at line " + i;
                var _ = match[0], type = match[1], name_1 = match[2], value = match[3];
                if (type === 'string') {
                    this.staticVariables_.push(new Variable_1.default(name_1, type, value, this.staticVariables_.length));
                }
                else if (type === 'number') {
                    this.stackVariables_.push(new Variable_1.default(name_1, type, value, this.stackVariables_.length));
                }
                else {
                    throw "Unknown variable type " + type;
                }
                continue;
            }
            if (inBlock === 0 && / *([a-zA-Z0-9_]+) *\(/.test(line)) {
                inDeclarationSpace = false;
                inBlock++;
                var blockParts = line.match(/^([a-zA-Z0-9_]+) +\($/);
                if (!blockParts)
                    throw "Invalid block syntax at line " + i;
                currBlock = new Block_1.default(blockParts[1], this);
                continue;
            }
            if (inBlock === 1 && /\)/.test(line)) {
                if (!currBlock)
                    throw "Trying to close an unopened block at " + i;
                inBlock--;
                this.blocks_.push(currBlock);
                currBlock = undefined;
                continue;
            }
            if (inBlock > 0) {
                if (!currBlock)
                    throw "All instructions must belong to a block. Error at line " + i;
                if (/\(/.test(line))
                    inBlock++;
                if (/\)/.test(line))
                    inBlock--;
                currBlock.addInstruction(line);
                continue;
            }
            throw "Unrecognized instruction at line " + i;
        }
        if (inBlock || currBlock)
            throw "Block left unclosed";
        var startBlock = this.blocks_.find(function (b) { return b.name === 'start'; });
        if (!startBlock)
            throw "Block \"start\" not found";
    }
    Parser.prototype.getVariablesMap = function () {
        return [].concat(this.staticVariables_).concat(this.stackVariables_);
    };
    Object.defineProperty(Parser.prototype, "blocks", {
        get: function () {
            return this.blocks_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parser.prototype, "staticVariables", {
        get: function () {
            return this.staticVariables_;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parser.prototype, "stackVariables", {
        get: function () {
            return this.stackVariables_;
        },
        enumerable: true,
        configurable: true
    });
    return Parser;
}());
exports.default = Parser;
//# sourceMappingURL=index.js.map