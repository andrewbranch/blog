import throttle from 'lodash.throttle';
import { useEffect, useRef } from 'react';
import { isSSR } from '../utils/ssr';

function getScrollPercentage(): number {
  if (!isSSR) {
    return window.scrollY / (document.documentElement.scrollHeight - document.documentElement.clientHeight);
  }
  return 0;
}

export function useScrollDepth(thresholds: number[], effect: (threshold: number) => void) {
  const remainingThresholds = useRef(new Set(thresholds));
  const handler = useRef(throttle(() => {
    const percentage = getScrollPercentage();
    remainingThresholds.current.forEach(threshold => {
      if (percentage >= threshold) {
        effect(threshold);
        remainingThresholds.current.delete(threshold);
      }
    });
  }, 1000));

  useEffect(() => {
    if (!isSSR) {
      window.addEventListener('scroll', handler.current);
      return () => window.removeEventListener('scroll', handler.current);
    }
  }, []);
}