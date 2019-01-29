import React, { useEffect, useState } from 'react';
import 'requestidlecallback';

export interface UseDeferredRenderOptions {
  timeout?: number;
}

export function useDeferredRender<T extends React.ReactNode>(
  expensiveRender: () => T,
  { timeout }: UseDeferredRenderOptions = {},
): T | null {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      requestIdleCallback(() => {
        setInitialized(true);
      }, { timeout });
    }
  }, [initialized]);

  return initialized ? expensiveRender() : null;
}
