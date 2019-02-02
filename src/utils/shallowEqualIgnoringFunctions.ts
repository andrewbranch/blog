export function shallowEqualIgnoringFunctions(prevProps: any, nextProps: any) {
  const nextPropsClone = { ...nextProps };
  for (const key in prevProps) {
    const [a, b] = [prevProps[key], nextProps[key]];
    delete nextPropsClone[key];
    if (typeof a === 'function' && typeof b === 'function') {
      continue;
    }
    if (a !== b) {
      return false;
    }
  }

  return Object.keys(nextPropsClone).length === 0;
}
