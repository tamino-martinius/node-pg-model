"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function staticImplements() {
    return (_) => {
    };
}
exports.staticImplements = staticImplements;
function snakeToCamelCase(value) {
    return value.replace(/_\w/g, m => m[1].toUpperCase());
}
exports.snakeToCamelCase = snakeToCamelCase;
function camelToSnakeCase(value) {
    return value.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
}
exports.camelToSnakeCase = camelToSnakeCase;
//# sourceMappingURL=util.js.map