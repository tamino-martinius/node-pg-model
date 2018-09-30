export function staticImplements() {
    return (_) => {
    };
}
export function snakeToCamelCase(value) {
    return value.replace(/_\w/g, m => m[1].toUpperCase());
}
export function camelToSnakeCase(value) {
    return value.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
}
//# sourceMappingURL=util.mjs.map