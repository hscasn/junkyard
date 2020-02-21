"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io_1 = require("./io");
var parser_1 = require("./parser");
var io = new io_1.default(__dirname + '/..');
var fileContent = io.read();
var parser = new parser_1.default(fileContent);
io.write(parser);
//# sourceMappingURL=index.js.map