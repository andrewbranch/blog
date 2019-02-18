import { useScrollDepth } from './useScrollDepth';
import { safeGA } from '../utils/safeGA';

export function useScrollDepthTracking() {
  useScrollDepth([0.4, 0.8], depth => {
    safeGA('send', 'event', 'post', 'read', 'percentage', depth)
  });
}
