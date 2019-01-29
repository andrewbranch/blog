declare module 'react-async-hook' {
  export function useAsync<T, P>(
    asyncFn: (param: P) => PromiseLike<T>,
    param?: P
  ): {
    result: T | undefined;
    loading: boolean;
    error: Error | undefined
  };
}
