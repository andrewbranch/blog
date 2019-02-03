function assertGet(obj: any, key: string | number | symbol): any {
  if (!(key in obj)) {
    throw new Error(`Could not get property ${String(key)} in object.`);
  }
  return obj[key];
}

export function shallowClone<T extends {}>(obj: T, depth = 2): T {
  if (depth < 1) {
    throw new Error('Depth must be greater than 1.');
  }
  if (depth === 1) {
    return { ...obj };
  }

  return Object.keys(obj).reduce((clone: any, key) => ({
    ...clone,
    [key]: shallowClone(assertGet(obj, key), depth - 1),
  }), {});
}
