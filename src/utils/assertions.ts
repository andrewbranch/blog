export function assertUnreachable(x: never): never {
  throw new Error(
    'Expected this branch of code to be unreachable by both type and runtime constraints. ' +
    `Argument was typed 'never' but actually is '${x}'.`,
  );
}
