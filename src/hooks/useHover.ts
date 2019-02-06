import { useState, useEffect, useRef } from 'react';
import { isSSR } from '../utils/ssr';

export interface UseHoverOptions {
  mouseEnterDelayMS?: number;
  mouseOutDelayMS?: number;
  touchStartDelayMS?: number;
}

export type HoverProps = Required<
  Pick<React.HTMLAttributes<HTMLElement>,
  'onMouseEnter' | 'onMouseLeave' | 'onTouchStart' | 'onTouchCancel'>
>;

const handlers = new Set<(event: TouchEvent) => void>();
if (!isSSR) {
  window.addEventListener('touchstart', event => {
    handlers.forEach(handler => handler(event));
  }, true);
}

export function useHover({
  mouseEnterDelayMS = 200,
  mouseOutDelayMS = 0,
  touchStartDelayMS = 0,
}: UseHoverOptions = {}): [boolean, HoverProps] {
  const [isHovering, setIsHovering] = useState(false);
  const mouseEnterTimer = useRef<number | undefined>(undefined);
  const mouseOutTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (isHovering) {
      const handler = () => {
        mouseOutTimer.current = setTimeout(() => setIsHovering(false), mouseOutTimer.current);
      };
      handlers.add(handler);
      return () => handlers.delete(handler);
    }
  }, [isHovering]);

  return [
    isHovering,
    {
      onMouseEnter: () => {
        clearTimeout(mouseOutTimer.current);
        mouseEnterTimer.current = setTimeout(() => setIsHovering(true), mouseEnterDelayMS);
      },
      onMouseLeave: () => {
        clearTimeout(mouseEnterTimer.current);
        mouseOutTimer.current = setTimeout(() => setIsHovering(false), mouseOutDelayMS);
      },
      onTouchStart: () => {
        clearTimeout(mouseOutTimer.current);
        mouseEnterTimer.current = setTimeout(() => setIsHovering(true), touchStartDelayMS);
      },
      onTouchCancel: () => {
        clearTimeout(mouseEnterTimer.current);
        setIsHovering(false);
      },
    },
  ];
}
