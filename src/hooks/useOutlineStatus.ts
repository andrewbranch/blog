import { useEffect } from 'react';
import { isSSR } from '../utils/ssr';

const onKeyDown = (event: KeyboardEvent) => {
  if (event.which === 9) { // tab
    document.documentElement.removeAttribute('data-hide-outlines');
  }
};

const onMouseDown = () => {
  document.documentElement.setAttribute('data-hide-outlines', 'true');
};

export function useOutlineStatus() {
  useEffect(() => {
    if (!isSSR) {
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('mousedown', onMouseDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('mousedown', onMouseDown);
      };
    }
  }, []);
}
