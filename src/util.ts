export function staticImplements<T>() {
  return (_: T) => {
  };
}

export function snakeToCamelCase(value: string) {
  return value.replace(/_\w/g, m => m[1].toUpperCase());
}

export function camelToSnakeCase(value: string) {
  return value.replace(/([A-Z])/g, m => `_${m.toLowerCase()}`);
}
