import React, { useEffect, useState, useRef } from 'react';
import 'requestidlecallback';

export interface UseDeferredRenderOptions {
  timeout?: number;
}

export function useDeferredRender<T extends React.ReactNode>(
  expensiveRender: () => T | Promise<T>,
  { timeout }: UseDeferredRenderOptions = {},
): T | null {
  const [initialized, setInitialized] = useState(false);
  const [content, setContent] = useState<T | null>(null);
  const isAsynRender = useRef(false);
  useEffect(() => {
    if (!initialized) {
      requestIdleCallback(() => {
        setInitialized(true);
      }, { timeout });
    }
  }, [initialized]);

  if (isAsynRender.current) {
    isAsynRender.current = false;
    return content;
  }

  if (initialized) {
    const renderResult = expensiveRender();
    if ('then' in renderResult) {
      renderResult.then(c => {
        isAsynRender.current = true;
        setContent(c);
      });
    } else {
      return renderResult;
    }
  }

  return content;
}
