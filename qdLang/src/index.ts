import IO from "./io";
import Parser from "./parser";

const io = new IO(__dirname + '/..');

const fileContent = io.read();

const parser = new Parser(fileContent);

io.write(parser);