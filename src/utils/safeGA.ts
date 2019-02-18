export const safeGA = ((...args: [any]) => {
  if (typeof ga !== 'undefined') {
    return ga(...args);
  }
}) as typeof ga;
