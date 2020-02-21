"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Variable = (function () {
    function Variable(name, type, value, index) {
        var _this = this;
        this.name = name;
        this.type = type;
        this.value = (type === 'string')
            ? (value.trim().substr(1, value.length - 2))
            : (+value);
        this.index = index;
        this.length = typeof value === 'string' ? (function () {
            var l = _this.value.length;
            for (var i = 0; i < _this.value.length; i++)
                if (_this.value.charAt(i) === '\\')
                    l--;
            return l;
        })() : (this.value + '').length;
    }
    Variable.prototype.getMemAddress = function () {
        return "-" + (this.index + 1) * 8 + "(%rbp)";
    };
    return Variable;
}());
exports.default = Variable;
//# sourceMappingURL=Variable.js.map