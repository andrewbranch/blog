import { useState } from 'react';

export interface UseHoverOptions {
  mouseEnterDelayMS?: number;
  mouseOutDelayMS?: number;
}

export type HoverProps = Pick<React.HTMLAttributes<HTMLElement>, 'onMouseEnter' | 'onMouseLeave'>;

export function useHover({
  mouseEnterDelayMS = 200,
  mouseOutDelayMS = 0,
}: UseHoverOptions = {}): [boolean, HoverProps] {
  const [isHovering, setIsHovering] = useState(false);
  let mouseEnterTimer: number | undefined;
  let mouseOutTimer: number | undefined;
  return [
    isHovering,
    {
      onMouseEnter: () => {
        clearTimeout(mouseOutTimer);
        mouseEnterTimer = setTimeout(() => setIsHovering(true), mouseEnterDelayMS);
      },
      onMouseLeave: () => {
        clearTimeout(mouseEnterTimer);
        mouseOutTimer = setTimeout(() => setIsHovering(false), mouseOutDelayMS);
      },
    },
  ];
}
